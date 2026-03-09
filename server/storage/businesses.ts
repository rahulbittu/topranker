import { eq, and, desc, asc, sql, count, gte } from "drizzle-orm";
import {
  businesses, ratings, businessPhotos, rankHistory,
  type Business,
} from "@shared/schema";
import { db } from "../db";
import { getTemporalMultiplier } from "./helpers";

export async function getLeaderboard(
  city: string,
  category: string,
  limit: number = 50,
): Promise<Business[]> {
  return db
    .select()
    .from(businesses)
    .where(
      and(
        eq(businesses.city, city),
        eq(businesses.category, category),
        eq(businesses.isActive, true),
      ),
    )
    .orderBy(asc(businesses.rankPosition))
    .limit(limit);
}

export async function getTrendingBusinesses(
  city: string,
  limit: number = 3,
): Promise<Business[]> {
  return db
    .select()
    .from(businesses)
    .where(
      and(
        eq(businesses.city, city),
        eq(businesses.isActive, true),
        sql`${businesses.rankDelta} > 0`,
      ),
    )
    .orderBy(desc(businesses.rankDelta))
    .limit(limit);
}

export async function getBusinessBySlug(slug: string): Promise<Business | undefined> {
  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.slug, slug));
  return business;
}

export async function getBusinessById(id: string): Promise<Business | undefined> {
  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.id, id));
  return business;
}

// Sprint 176: Update subscription fields on a business
export async function updateBusinessSubscription(
  businessId: string,
  updates: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string | null;
    subscriptionStatus?: string;
    subscriptionPeriodEnd?: Date;
  },
): Promise<void> {
  const setData: Record<string, any> = {};
  if (updates.stripeCustomerId !== undefined) setData.stripeCustomerId = updates.stripeCustomerId;
  if (updates.stripeSubscriptionId !== undefined) setData.stripeSubscriptionId = updates.stripeSubscriptionId;
  if (updates.subscriptionStatus !== undefined) setData.subscriptionStatus = updates.subscriptionStatus;
  if (updates.subscriptionPeriodEnd !== undefined) setData.subscriptionPeriodEnd = updates.subscriptionPeriodEnd;
  if (Object.keys(setData).length === 0) return;
  await db.update(businesses).set(setData).where(eq(businesses.id, businessId));
}

export async function getBusinessesByIds(ids: string[]): Promise<Business[]> {
  if (ids.length === 0) return [];
  return db
    .select()
    .from(businesses)
    .where(sql`${businesses.id} = ANY(ARRAY[${sql.join(ids.map(id => sql`${id}`), sql`,`)}]::text[])`);
}

export async function searchBusinesses(
  query: string,
  city: string,
  category?: string,
  limit: number = 20,
): Promise<Business[]> {
  // Input sanitization: max 100 chars, strip LIKE wildcards from user input
  const sanitized = query.slice(0, 100).replace(/[%_\\]/g, "");
  const q = "%" + sanitized.toLowerCase() + "%";
  return db
    .select()
    .from(businesses)
    .where(
      and(
        eq(businesses.city, city),
        eq(businesses.isActive, true),
        query
          ? sql`(lower(${businesses.name}) like ${q} OR lower(${businesses.neighborhood}) like ${q} OR lower(${businesses.category}) like ${q})`
          : undefined,
        ...(category ? [eq(businesses.category, category)] : []),
      ),
    )
    .orderBy(desc(businesses.weightedScore))
    .limit(limit);
}

export async function getAllCategories(city: string): Promise<string[]> {
  const rows = await db
    .select({
      category: businesses.category,
    })
    .from(businesses)
    .where(and(eq(businesses.city, city), eq(businesses.isActive, true)))
    .groupBy(businesses.category);
  return rows.map(r => r.category);
}

/**
 * Sprint 184: Autocomplete — returns lightweight matches for typeahead.
 * Searches name, category, and neighborhood. Returns top 6 results with minimal fields.
 */
export async function autocompleteBusinesses(
  query: string,
  city: string,
  limit: number = 6,
): Promise<{ id: string; name: string; slug: string; category: string; neighborhood: string | null }[]> {
  if (!query || query.trim().length === 0) return [];
  const sanitized = query.slice(0, 50).replace(/[%_\\]/g, "");
  const q = "%" + sanitized.toLowerCase() + "%";
  return db
    .select({
      id: businesses.id,
      name: businesses.name,
      slug: businesses.slug,
      category: businesses.category,
      neighborhood: businesses.neighborhood,
    })
    .from(businesses)
    .where(
      and(
        eq(businesses.city, city),
        eq(businesses.isActive, true),
        sql`(lower(${businesses.name}) like ${q} OR lower(${businesses.category}) like ${q} OR lower(${businesses.neighborhood}) like ${q})`,
      ),
    )
    .orderBy(desc(businesses.weightedScore))
    .limit(limit);
}

/**
 * Sprint 184: Popular categories — returns categories with business count, ordered by count.
 * Used for dynamic suggestion chips on the search screen.
 */
export async function getPopularCategories(
  city: string,
  limit: number = 8,
): Promise<{ category: string; count: number }[]> {
  const rows = await db
    .select({
      category: businesses.category,
      count: count(businesses.id),
    })
    .from(businesses)
    .where(and(eq(businesses.city, city), eq(businesses.isActive, true)))
    .groupBy(businesses.category)
    .orderBy(desc(count(businesses.id)))
    .limit(limit);
  return rows.map(r => ({ category: r.category, count: Number(r.count) }));
}

export async function recalculateBusinessScore(businessId: string): Promise<number> {
  const allRatings = await db
    .select({
      rawScore: ratings.rawScore,
      weight: ratings.weight,
      createdAt: ratings.createdAt,
      isFlagged: ratings.isFlagged,
      autoFlagged: ratings.autoFlagged,
    })
    .from(ratings)
    .where(
      and(
        eq(ratings.businessId, businessId),
        eq(ratings.isFlagged, false),
        eq(ratings.autoFlagged, false),
      ),
    );

  if (allRatings.length === 0) {
    await db
      .update(businesses)
      .set({ weightedScore: "0", rawAvgScore: "0", totalRatings: 0, updatedAt: new Date() })
      .where(eq(businesses.id, businessId));
    return 0;
  }

  let totalWeightedScore = 0;
  let totalEffectiveWeight = 0;
  let rawSum = 0;

  for (const r of allRatings) {
    const ageDays = Math.floor(
      (Date.now() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24),
    );
    const temporal = getTemporalMultiplier(ageDays);
    const effectiveWeight = parseFloat(r.weight) * temporal;
    totalWeightedScore += parseFloat(r.rawScore) * effectiveWeight;
    totalEffectiveWeight += effectiveWeight;
    rawSum += parseFloat(r.rawScore);
  }

  const score = totalEffectiveWeight > 0
    ? Math.round((totalWeightedScore / totalEffectiveWeight) * 1000) / 1000
    : 0;
  const rawAvg = rawSum / allRatings.length;

  await db
    .update(businesses)
    .set({
      weightedScore: score.toFixed(3),
      rawAvgScore: rawAvg.toFixed(2),
      totalRatings: allRatings.length,
      updatedAt: new Date(),
    })
    .where(eq(businesses.id, businessId));

  return score;
}

// Sprint 136 core-loop fix: single window-function UPDATE replaces O(N) loop
export async function recalculateRanks(
  city: string,
  category: string,
): Promise<void> {
  await db.execute(sql`
    UPDATE ${businesses} b
    SET
      rank_position = sub.new_rank,
      rank_delta = COALESCE(b.rank_position, sub.new_rank) - sub.new_rank,
      prev_rank_position = b.rank_position
    FROM (
      SELECT id,
        ROW_NUMBER() OVER (ORDER BY weighted_score DESC) AS new_rank
      FROM ${businesses}
      WHERE city = ${city}
        AND category = ${category}
        AND is_active = true
    ) sub
    WHERE b.id = sub.id
  `);
}

export async function getBusinessPhotos(businessId: string): Promise<string[]> {
  const rows = await db
    .select({ photoUrl: businessPhotos.photoUrl })
    .from(businessPhotos)
    .where(eq(businessPhotos.businessId, businessId))
    .orderBy(asc(businessPhotos.sortOrder))
    .limit(3);
  return rows.map(r => r.photoUrl);
}

export async function getBusinessPhotosMap(businessIds: string[]): Promise<Record<string, string[]>> {
  if (businessIds.length === 0) return {};
  const rows = await db
    .select({
      businessId: businessPhotos.businessId,
      photoUrl: businessPhotos.photoUrl,
      sortOrder: businessPhotos.sortOrder,
    })
    .from(businessPhotos)
    .where(sql`${businessPhotos.businessId} = ANY(ARRAY[${sql.join(businessIds.map(id => sql`${id}`), sql`,`)}]::text[])`)
    .orderBy(asc(businessPhotos.sortOrder));

  const map: Record<string, string[]> = {};
  for (const row of rows) {
    if (!map[row.businessId]) map[row.businessId] = [];
    if (map[row.businessId].length < 3) {
      map[row.businessId].push(row.photoUrl);
    }
  }
  return map;
}

export async function insertBusinessPhotos(
  businessId: string,
  photos: { photoUrl: string; isHero: boolean; sortOrder: number }[],
): Promise<void> {
  if (photos.length === 0) return;
  await db.insert(businessPhotos).values(
    photos.map((p) => ({
      businessId,
      photoUrl: p.photoUrl,
      isHero: p.isHero,
      sortOrder: p.sortOrder,
    })),
  );
}

export async function getBusinessesWithoutPhotos(
  city?: string,
  limit: number = 50,
): Promise<{ id: string; name: string; googlePlaceId: string; city: string }[]> {
  // Find businesses that have a googlePlaceId but no entries in businessPhotos
  const rows = await db
    .select({
      id: businesses.id,
      name: businesses.name,
      googlePlaceId: businesses.googlePlaceId,
      city: businesses.city,
    })
    .from(businesses)
    .leftJoin(businessPhotos, eq(businesses.id, businessPhotos.businessId))
    .where(
      and(
        eq(businesses.isActive, true),
        sql`${businesses.googlePlaceId} IS NOT NULL`,
        sql`${businessPhotos.id} IS NULL`,
        ...(city ? [eq(businesses.city, city)] : []),
      ),
    )
    .limit(limit);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    googlePlaceId: r.googlePlaceId!,
    city: r.city,
  }));
}

export async function deleteBusinessPhotos(businessId: string): Promise<void> {
  await db.delete(businessPhotos).where(eq(businessPhotos.businessId, businessId));
}

export async function getRankHistory(
  businessId: string,
  days: number = 30,
): Promise<{ date: string; rank: number; score: number }[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const rows = await db
    .select({
      date: rankHistory.snapshotDate,
      rank: rankHistory.rankPosition,
      score: rankHistory.weightedScore,
    })
    .from(rankHistory)
    .where(
      and(
        eq(rankHistory.businessId, businessId),
        gte(rankHistory.snapshotDate, cutoff.toISOString().split("T")[0]),
      ),
    )
    .orderBy(asc(rankHistory.snapshotDate));
  return rows.map(r => ({
    date: r.date,
    rank: r.rank,
    score: parseFloat(r.score),
  }));
}

export async function getBusinessRatings(
  businessId: string,
  page: number = 1,
  perPage: number = 20,
): Promise<{ ratings: any[]; total: number }> {
  const offset = (page - 1) * perPage;
  const { members } = await import("@shared/schema");

  const ratingsResult = await db
    .select({
      id: ratings.id,
      memberId: ratings.memberId,
      businessId: ratings.businessId,
      q1Score: ratings.q1Score,
      q2Score: ratings.q2Score,
      q3Score: ratings.q3Score,
      wouldReturn: ratings.wouldReturn,
      note: ratings.note,
      rawScore: ratings.rawScore,
      weight: ratings.weight,
      weightedScore: ratings.weightedScore,
      isFlagged: ratings.isFlagged,
      autoFlagged: ratings.autoFlagged,
      flagReason: ratings.flagReason,
      flagProbability: ratings.flagProbability,
      source: ratings.source,
      createdAt: ratings.createdAt,
      memberName: members.displayName,
      memberTier: members.credibilityTier,
      memberAvatarUrl: members.avatarUrl,
    })
    .from(ratings)
    .innerJoin(members, eq(ratings.memberId, members.id))
    .where(and(eq(ratings.businessId, businessId), eq(ratings.isFlagged, false)))
    .orderBy(sql`${ratings.createdAt} DESC`)
    .limit(perPage)
    .offset(offset);

  const [totalResult] = await db
    .select({ count: count() })
    .from(ratings)
    .where(and(eq(ratings.businessId, businessId), eq(ratings.isFlagged, false)));

  return { ratings: ratingsResult, total: totalResult.count };
}
