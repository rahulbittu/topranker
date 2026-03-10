import { eq, and, desc, asc, sql, count } from "drizzle-orm";
import {
  dishes,
  dishLeaderboards,
  dishLeaderboardEntries,
  dishSuggestions,
  dishSuggestionVotes,
  dishVotes,
  businesses,
  ratings,
  members,
  businessPhotos,
  type Dish,
  type DishLeaderboard,
  type DishLeaderboardEntry,
  type DishSuggestion,
} from "@shared/schema";
import { db } from "../db";
import { getVoteWeight } from "@shared/credibility";

export async function getBusinessDishes(
  businessId: string,
  limit: number = 5,
): Promise<Dish[]> {
  return db
    .select()
    .from(dishes)
    .where(and(eq(dishes.businessId, businessId), eq(dishes.isActive, true)))
    .orderBy(desc(dishes.voteCount))
    .limit(limit);
}

export async function searchDishes(
  businessId: string,
  query: string,
): Promise<Dish[]> {
  const normalized = query.slice(0, 100).replace(/[%_\\]/g, "").toLowerCase().trim();

  if (normalized.length < 2) {
    return getBusinessDishes(businessId, 5);
  }

  let results = await db
    .select()
    .from(dishes)
    .where(
      and(
        eq(dishes.businessId, businessId),
        eq(dishes.isActive, true),
        sql`${dishes.nameNormalized} ILIKE ${normalized + "%"}`,
      ),
    )
    .orderBy(desc(dishes.voteCount))
    .limit(5);

  if (results.length < 3) {
    const containsResults = await db
      .select()
      .from(dishes)
      .where(
        and(
          eq(dishes.businessId, businessId),
          eq(dishes.isActive, true),
          sql`${dishes.nameNormalized} ILIKE ${"%" + normalized + "%"}`,
        ),
      )
      .orderBy(desc(dishes.voteCount))
      .limit(5);

    const existingIds = new Set(results.map(r => r.id));
    for (const r of containsResults) {
      if (!existingIds.has(r.id)) {
        results.push(r);
      }
    }
  }

  return results.slice(0, 5);
}

// ── Dish Leaderboards — Sprint 166 ─────────────────────────

export async function getDishLeaderboards(city: string): Promise<(DishLeaderboard & { entryCount: number })[]> {
  const boards = await db
    .select()
    .from(dishLeaderboards)
    .where(and(eq(dishLeaderboards.city, city.toLowerCase()), eq(dishLeaderboards.status, "active")))
    .orderBy(asc(dishLeaderboards.displayOrder));

  const result = [];
  for (const board of boards) {
    const [entryResult] = await db
      .select({ cnt: count() })
      .from(dishLeaderboardEntries)
      .where(eq(dishLeaderboardEntries.leaderboardId, board.id));
    result.push({ ...board, entryCount: Number(entryResult?.cnt ?? 0) });
  }
  return result;
}

export async function getDishLeaderboardWithEntries(slug: string, city: string): Promise<{
  leaderboard: DishLeaderboard;
  entries: (DishLeaderboardEntry & { businessName: string; businessSlug: string; neighborhood: string | null })[];
  isProvisional: boolean;
  minRatingsNeeded: number;
} | null> {
  const [board] = await db
    .select()
    .from(dishLeaderboards)
    .where(and(eq(dishLeaderboards.dishSlug, slug), eq(dishLeaderboards.city, city.toLowerCase())));

  if (!board) return null;

  const entries = await db
    .select({
      id: dishLeaderboardEntries.id,
      leaderboardId: dishLeaderboardEntries.leaderboardId,
      businessId: dishLeaderboardEntries.businessId,
      dishScore: dishLeaderboardEntries.dishScore,
      dishRatingCount: dishLeaderboardEntries.dishRatingCount,
      rankPosition: dishLeaderboardEntries.rankPosition,
      previousRank: dishLeaderboardEntries.previousRank,
      photoUrl: dishLeaderboardEntries.photoUrl,
      updatedAt: dishLeaderboardEntries.updatedAt,
      businessName: businesses.name,
      businessSlug: businesses.slug,
      neighborhood: businesses.neighborhood,
    })
    .from(dishLeaderboardEntries)
    .innerJoin(businesses, eq(dishLeaderboardEntries.businessId, businesses.id))
    .where(eq(dishLeaderboardEntries.leaderboardId, board.id))
    .orderBy(asc(dishLeaderboardEntries.rankPosition));

  const eligibleCount = entries.filter((e) => e.dishRatingCount >= 3).length;
  const isProvisional =
    board.createdAt.getTime() > Date.now() - 14 * 24 * 60 * 60 * 1000;

  return {
    leaderboard: board,
    entries,
    isProvisional,
    minRatingsNeeded: Math.max(0, board.minRatingCount - eligibleCount),
  };
}

export async function recalculateDishLeaderboard(leaderboardId: string): Promise<number> {
  const [board] = await db
    .select()
    .from(dishLeaderboards)
    .where(eq(dishLeaderboards.id, leaderboardId));

  if (!board) return 0;

  const dishSlug = board.dishSlug;

  // Find all dish votes that match this dish name in the city
  const matchingDishes = await db
    .select({
      businessId: dishes.businessId,
      dishId: dishes.id,
    })
    .from(dishes)
    .innerJoin(businesses, eq(dishes.businessId, businesses.id))
    .where(
      and(
        eq(businesses.city, board.city),
        sql`${dishes.nameNormalized} ILIKE ${"%" + dishSlug + "%"}`,
        eq(dishes.isActive, true),
      ),
    );

  if (matchingDishes.length === 0) return 0;

  const bizDishMap = new Map<string, string[]>();
  for (const m of matchingDishes) {
    if (!bizDishMap.has(m.businessId)) bizDishMap.set(m.businessId, []);
    bizDishMap.get(m.businessId)!.push(m.dishId);
  }

  // For each business, compute dish-specific score from dishVotes + ratings
  const entries: { businessId: string; dishScore: number; dishRatingCount: number; photoUrl: string | null }[] = [];

  for (const [businessId, dishIds] of bizDishMap) {
    const votes = await db
      .select({
        ratingId: dishVotes.ratingId,
        memberId: dishVotes.memberId,
      })
      .from(dishVotes)
      .where(
        and(
          eq(dishVotes.businessId, businessId),
          sql`${dishVotes.dishId} = ANY(ARRAY[${sql.join(dishIds.map((id) => sql`${id}`), sql`,`)}]::text[])`,
        ),
      );

    if (votes.length === 0) continue;

    // Get the ratings and member credibility for weighting
    const ratingIds = votes.map((v) => v.ratingId);
    const ratingRows = await db
      .select({
        id: ratings.id,
        q1Score: ratings.q1Score,
        q2Score: ratings.q2Score,
        q3Score: ratings.q3Score,
        weight: ratings.weight,
        isFlagged: ratings.isFlagged,
      })
      .from(ratings)
      .where(sql`${ratings.id} = ANY(ARRAY[${sql.join(ratingIds.map((id) => sql`${id}`), sql`,`)}]::text[])`);

    let totalWeight = 0;
    let weightedSum = 0;
    let validCount = 0;

    for (const r of ratingRows) {
      if (r.isFlagged) continue;
      const rawScore = (r.q1Score + r.q2Score + r.q3Score) / 3;
      const w = parseFloat(r.weight);
      weightedSum += rawScore * w;
      totalWeight += w;
      validCount++;
    }

    if (validCount < 1) continue;

    const dishScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

    // Get best dish photo
    const [photo] = await db
      .select({ photoUrl: businessPhotos.photoUrl })
      .from(businessPhotos)
      .where(eq(businessPhotos.businessId, businessId))
      .orderBy(asc(businessPhotos.sortOrder))
      .limit(1);

    entries.push({
      businessId,
      dishScore: Math.round(dishScore * 100) / 100,
      dishRatingCount: validCount,
      photoUrl: photo?.photoUrl ?? null,
    });
  }

  // Sort by score desc, assign ranks
  entries.sort((a, b) => b.dishScore - a.dishScore);

  // Delete existing entries and re-insert
  await db.delete(dishLeaderboardEntries).where(eq(dishLeaderboardEntries.leaderboardId, leaderboardId));

  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    await db.insert(dishLeaderboardEntries).values({
      leaderboardId,
      businessId: e.businessId,
      dishScore: e.dishScore.toFixed(2),
      dishRatingCount: e.dishRatingCount,
      rankPosition: i + 1,
      photoUrl: e.photoUrl,
    });
  }

  return entries.length;
}

// ── Dish Suggestions — Sprint 166 ──────────────────────────

export async function getDishSuggestions(city: string): Promise<DishSuggestion[]> {
  return db
    .select()
    .from(dishSuggestions)
    .where(and(eq(dishSuggestions.city, city.toLowerCase()), eq(dishSuggestions.status, "proposed")))
    .orderBy(desc(dishSuggestions.voteCount))
    .limit(20);
}

export async function submitDishSuggestion(
  memberId: string,
  city: string,
  dishName: string,
): Promise<DishSuggestion> {
  // Check rate limit: 3 per week
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [recentCount] = await db
    .select({ cnt: count() })
    .from(dishSuggestions)
    .where(
      and(
        eq(dishSuggestions.suggestedBy, memberId),
        sql`${dishSuggestions.createdAt} >= ${oneWeekAgo}`,
      ),
    );

  if (Number(recentCount.cnt) >= 3) {
    throw new Error("You can only suggest 3 dishes per week");
  }

  const [suggestion] = await db
    .insert(dishSuggestions)
    .values({
      city: city.toLowerCase(),
      dishName: dishName.trim(),
      suggestedBy: memberId,
    })
    .returning();

  return suggestion;
}

export async function voteDishSuggestion(
  memberId: string,
  suggestionId: string,
): Promise<DishSuggestion> {
  // Check if already voted
  const [existingVote] = await db
    .select()
    .from(dishSuggestionVotes)
    .where(
      and(
        eq(dishSuggestionVotes.suggestionId, suggestionId),
        eq(dishSuggestionVotes.memberId, memberId),
      ),
    );

  if (existingVote) {
    throw new Error("Already voted for this suggestion");
  }

  await db.insert(dishSuggestionVotes).values({ suggestionId, memberId });

  const [updated] = await db
    .update(dishSuggestions)
    .set({ voteCount: sql`${dishSuggestions.voteCount} + 1` })
    .where(eq(dishSuggestions.id, suggestionId))
    .returning();

  if (!updated) throw new Error("Suggestion not found");

  // Auto-activate if threshold reached
  if (updated.voteCount >= updated.activationThreshold) {
    await db
      .update(dishSuggestions)
      .set({ status: "active" })
      .where(eq(dishSuggestions.id, suggestionId));

    // Create the leaderboard
    const slug = updated.dishName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const [existing] = await db
      .select()
      .from(dishLeaderboards)
      .where(and(eq(dishLeaderboards.city, updated.city), eq(dishLeaderboards.dishSlug, slug)));

    if (!existing) {
      await db.insert(dishLeaderboards).values({
        city: updated.city,
        dishName: updated.dishName,
        dishSlug: slug,
        source: "community",
      });
    }
  }

  return updated;
}

/**
 * Sprint 322: Get dish leaderboard rankings for a specific business.
 * Returns which leaderboards this business appears on with its rank position.
 */
export async function getBusinessDishRankings(businessId: string): Promise<{
  dishSlug: string;
  dishName: string;
  dishEmoji: string | null;
  rankPosition: number;
  dishScore: string;
  entryCount: number;
}[]> {
  const entries = await db
    .select({
      dishSlug: dishLeaderboards.dishSlug,
      dishName: dishLeaderboards.dishName,
      dishEmoji: dishLeaderboards.dishEmoji,
      rankPosition: dishLeaderboardEntries.rankPosition,
      dishScore: dishLeaderboardEntries.dishScore,
    })
    .from(dishLeaderboardEntries)
    .innerJoin(dishLeaderboards, eq(dishLeaderboardEntries.leaderboardId, dishLeaderboards.id))
    .where(eq(dishLeaderboardEntries.businessId, businessId))
    .orderBy(asc(dishLeaderboardEntries.rankPosition));

  // Get entry count per leaderboard
  const result = [];
  for (const entry of entries) {
    const [countResult] = await db
      .select({ count: count() })
      .from(dishLeaderboardEntries)
      .innerJoin(dishLeaderboards, eq(dishLeaderboardEntries.leaderboardId, dishLeaderboards.id))
      .where(eq(dishLeaderboards.dishSlug, entry.dishSlug));
    result.push({
      ...entry,
      entryCount: countResult?.count || 0,
    });
  }
  return result;
}

/**
 * Sprint 324: Batch fetch dish rankings for multiple businesses.
 * Returns a map of businessId → top dish rankings (max 3 per business).
 */
export async function getBatchDishRankings(businessIds: string[]): Promise<
  Record<string, { dishSlug: string; dishName: string; dishEmoji: string | null; rankPosition: number }[]>
> {
  if (businessIds.length === 0) return {};

  const entries = await db
    .select({
      businessId: dishLeaderboardEntries.businessId,
      dishSlug: dishLeaderboards.dishSlug,
      dishName: dishLeaderboards.dishName,
      dishEmoji: dishLeaderboards.dishEmoji,
      rankPosition: dishLeaderboardEntries.rankPosition,
    })
    .from(dishLeaderboardEntries)
    .innerJoin(dishLeaderboards, eq(dishLeaderboardEntries.leaderboardId, dishLeaderboards.id))
    .where(sql`${dishLeaderboardEntries.businessId} = ANY(ARRAY[${sql.join(businessIds.map(id => sql`${id}`), sql`,`)}]::text[])`)
    .orderBy(asc(dishLeaderboardEntries.rankPosition));

  const result: Record<string, { dishSlug: string; dishName: string; dishEmoji: string | null; rankPosition: number }[]> = {};
  for (const entry of entries) {
    if (!result[entry.businessId]) result[entry.businessId] = [];
    if (result[entry.businessId].length < 3) {
      result[entry.businessId].push({
        dishSlug: entry.dishSlug,
        dishName: entry.dishName,
        dishEmoji: entry.dishEmoji,
        rankPosition: entry.rankPosition,
      });
    }
  }
  return result;
}
