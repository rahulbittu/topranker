import { eq, and, sql, count, gte, desc } from "drizzle-orm";
import {
  members, ratings, dishes, dishVotes, ratingFlags,
  type Member, type Business, type Rating, type InsertRating,
} from "@shared/schema";
import { db } from "../db";
import { getVoteWeight } from "./helpers";
import { getMemberById } from "./members";
import { getBusinessById, recalculateBusinessScore, recalculateRanks } from "./businesses";
import { updateMemberStats, recalculateCredibilityScore } from "./members";
import { updateChallengerVotes } from "./challengers";

// Sprint 177: Fetch a single rating by ID
export async function getRatingById(id: string): Promise<Rating | undefined> {
  const [rating] = await db.select().from(ratings).where(eq(ratings.id, id));
  return rating;
}

async function detectAnomalies(
  member: Member,
  business: Business,
  rawScore: number,
): Promise<string[]> {
  const flags: string[] = [];

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const [recentCount] = await db
    .select({ count: count() })
    .from(ratings)
    .where(
      and(
        eq(ratings.memberId, member.id),
        gte(ratings.createdAt, oneHourAgo),
      ),
    );
  if (recentCount.count > 5) flags.push("burst_velocity");

  // Sprint 164: Combined single query for score-pattern anomalies (was 2 unbounded queries)
  const needsPatternCheck = member.totalRatings >= 5;
  if (needsPatternCheck) {
    const [patternStats] = await db
      .select({
        total: count(),
        highCount: sql<number>`COUNT(*) FILTER (WHERE ${ratings.rawScore}::numeric >= 4.8)`,
        lowCount: sql<number>`COUNT(*) FILTER (WHERE ${ratings.rawScore}::numeric <= 1.5)`,
      })
      .from(ratings)
      .where(eq(ratings.memberId, member.id));

    const total = Number(patternStats.total);
    if (total >= 10 && Number(patternStats.highCount) / total > 0.90) {
      flags.push("perfect_score_pattern");
    }
    if (rawScore <= 1.5 && total >= 5 && Number(patternStats.lowCount) / total > 0.60) {
      flags.push("one_star_bomber");
    }
  }

  if (member.totalRatings >= 8 && member.distinctBusinesses <= 2) {
    flags.push("single_business_fixation");
  }

  const accountAgeDays = Math.floor(
    (Date.now() - new Date(member.joinedAt).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (accountAgeDays < 7 && member.totalRatings > 15) {
    flags.push("new_account_high_volume");
  }

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [newAcctRatings] = await db
    .select({ count: count() })
    .from(ratings)
    .innerJoin(members, eq(ratings.memberId, members.id))
    .where(
      and(
        eq(ratings.businessId, business.id),
        gte(ratings.createdAt, oneDayAgo),
        gte(members.joinedAt, thirtyDaysAgo),
      ),
    );
  if (newAcctRatings.count > 10) {
    flags.push("coordinated_new_account_burst");
  }

  return flags;
}

export async function submitRating(
  memberId: string,
  data: InsertRating,
): Promise<{
  rating: Rating;
  newRank: number | null;
  prevRank: number | null;
  rankChanged: boolean;
  rankDirection: "up" | "down" | "same";
  newCredibilityScore: number;
  tierUpgraded: boolean;
  newTier: string;
  dishCreated: boolean;
}> {
  const member = await getMemberById(memberId);
  if (!member) throw new Error("Member not found");
  if (member.isBanned) throw new Error("Account suspended");

  const business = await getBusinessById(data.businessId);
  if (!business) throw new Error("Business not found");

  const daysActive = Math.floor(
    (Date.now() - new Date(member.joinedAt).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (daysActive < 3) throw new Error("Account must be 3+ days old to rate");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [existingToday] = await db
    .select({ count: count() })
    .from(ratings)
    .where(
      and(
        eq(ratings.memberId, memberId),
        eq(ratings.businessId, data.businessId),
        gte(ratings.createdAt, today),
      ),
    );
  if (existingToday.count > 0) throw new Error("Already rated today. Come back tomorrow.");

  const rawScore = (data.q1Score + data.q2Score + data.q3Score) / 3;

  const anomalyFlags = await detectAnomalies(member, business, rawScore);
  const autoFlagged = anomalyFlags.length > 0;

  const weight = getVoteWeight(member.credibilityScore);
  const weighted = rawScore * weight;

  const source = data.qrScanId ? "qr_scan" : "app";

  const [rating] = await db
    .insert(ratings)
    .values({
      memberId,
      businessId: data.businessId,
      q1Score: data.q1Score,
      q2Score: data.q2Score,
      q3Score: data.q3Score,
      wouldReturn: data.wouldReturn,
      note: data.note || null,
      rawScore: rawScore.toFixed(2),
      weight: weight.toFixed(4),
      weightedScore: weighted.toFixed(4),
      autoFlagged,
      flagReason: autoFlagged ? anomalyFlags.join(",") : null,
      source,
    })
    .returning();

  let dishCreated = false;
  if (data.dishId) {
    await db.insert(dishVotes).values({
      ratingId: rating.id,
      dishId: data.dishId,
      memberId,
      businessId: data.businessId,
    });
    await db
      .update(dishes)
      .set({ voteCount: sql`${dishes.voteCount} + 1` })
      .where(eq(dishes.id, data.dishId));
  } else if (data.newDishName) {
    const normalized = data.newDishName.toLowerCase().trim();
    const words = normalized.split(/\s+/);
    if (words.length >= 1 && words.length <= 5 && !normalized.includes("http")) {
      const existing = await db
        .select()
        .from(dishes)
        .where(
          and(
            eq(dishes.businessId, data.businessId),
            eq(dishes.nameNormalized, normalized),
          ),
        );

      let dishId: string;
      if (existing.length > 0) {
        dishId = existing[0].id;
        await db
          .update(dishes)
          .set({ voteCount: sql`${dishes.voteCount} + 1` })
          .where(eq(dishes.id, dishId));
      } else {
        const [newDish] = await db
          .insert(dishes)
          .values({
            businessId: data.businessId,
            name: data.newDishName.trim(),
            nameNormalized: normalized,
            suggestedBy: "community",
            voteCount: 1,
          })
          .returning();
        dishId = newDish.id;
        dishCreated = true;
      }

      await db.insert(dishVotes).values({
        ratingId: rating.id,
        dishId,
        memberId,
        businessId: data.businessId,
      });
    }
  } else if (data.noNotableDish) {
    await db.insert(dishVotes).values({
      ratingId: rating.id,
      dishId: null,
      memberId,
      businessId: data.businessId,
      noNotableDish: true,
    });
  }

  await updateMemberStats(memberId);
  const { score: newScore, tier: newTier } = await recalculateCredibilityScore(memberId);
  const oldTier = member.credibilityTier;
  const tierUpgraded = newTier !== oldTier;

  const prevRank = business.rankPosition;
  await recalculateBusinessScore(data.businessId);
  await recalculateRanks(business.city, business.category);

  await updateChallengerVotes(data.businessId, weighted);

  if (data.qrScanId) {
    const { qrScans } = await import("@shared/schema");
    await db
      .update(qrScans)
      .set({ converted: true })
      .where(eq(qrScans.id, data.qrScanId));
  }

  const updatedBusiness = await getBusinessById(data.businessId);
  const newRank = updatedBusiness?.rankPosition ?? null;
  const rankChanged = prevRank !== newRank;
  let rankDirection: "up" | "down" | "same" = "same";
  if (prevRank && newRank) {
    if (newRank < prevRank) rankDirection = "up";
    else if (newRank > prevRank) rankDirection = "down";
  }

  return {
    rating,
    newRank,
    prevRank: prevRank ?? null,
    rankChanged,
    rankDirection,
    newCredibilityScore: newScore,
    tierUpgraded,
    newTier,
    dishCreated,
  };
}

// ── Sprint 183: Rating Edit ──────────────────────────────────
/**
 * Edit a rating's scores and note. Only the rating author can edit.
 * Recalculates business score and member stats after edit.
 * Edit window: 24 hours from creation.
 */
export async function editRating(
  ratingId: string,
  memberId: string,
  updates: { q1Score?: number; q2Score?: number; q3Score?: number; wouldReturn?: boolean; note?: string },
): Promise<Rating> {
  const existing = await getRatingById(ratingId);
  if (!existing) throw new Error("Rating not found");
  if (existing.memberId !== memberId) throw new Error("Cannot edit another user's rating");

  // 24-hour edit window
  const hoursSinceCreation = (Date.now() - new Date(existing.createdAt).getTime()) / (1000 * 60 * 60);
  if (hoursSinceCreation > 24) throw new Error("Edit window has expired (24 hours)");

  const q1 = updates.q1Score ?? existing.q1Score;
  const q2 = updates.q2Score ?? existing.q2Score;
  const q3 = updates.q3Score ?? existing.q3Score;
  const rawScore = ((q1 + q2 + q3) / 3).toFixed(2);
  const weightedScore = (parseFloat(rawScore) * parseFloat(existing.weight)).toFixed(3);

  const [updated] = await db
    .update(ratings)
    .set({
      q1Score: q1,
      q2Score: q2,
      q3Score: q3,
      wouldReturn: updates.wouldReturn ?? existing.wouldReturn,
      note: updates.note !== undefined ? updates.note : existing.note,
      rawScore,
      weightedScore,
    })
    .where(eq(ratings.id, ratingId))
    .returning();

  // Recalculate business score and member stats
  await recalculateBusinessScore(existing.businessId);
  await recalculateRanks(
    (await getBusinessById(existing.businessId))?.city || "dallas",
    (await getBusinessById(existing.businessId))?.category || "",
  );
  await updateMemberStats(memberId);

  return updated;
}

// ── Sprint 183: Rating Delete (Soft) ─────────────────────────
/**
 * Soft-delete a rating by marking it as flagged with reason "user_deleted".
 * Only the rating author can delete. Recalculates business score after deletion.
 */
export async function deleteRating(
  ratingId: string,
  memberId: string,
): Promise<void> {
  const existing = await getRatingById(ratingId);
  if (!existing) throw new Error("Rating not found");
  if (existing.memberId !== memberId) throw new Error("Cannot delete another user's rating");

  await db
    .update(ratings)
    .set({
      isFlagged: true,
      flagReason: "user_deleted",
    })
    .where(eq(ratings.id, ratingId));

  // Recalculate business score excluding the deleted rating
  await recalculateBusinessScore(existing.businessId);
  await recalculateRanks(
    (await getBusinessById(existing.businessId))?.city || "dallas",
    (await getBusinessById(existing.businessId))?.category || "",
  );
  await updateMemberStats(memberId);
}

// ── Sprint 183: Submit Rating Flag ───────────────────────────
/**
 * Submit a flag on a rating. Any authenticated user can flag.
 * Creates a ratingFlags record for moderation review.
 */
export async function submitRatingFlag(
  ratingId: string,
  flaggerId: string,
  data: {
    q1NoSpecificExperience?: boolean;
    q2ScoreMismatchNote?: boolean;
    q3InsiderSuspected?: boolean;
    q4CoordinatedPattern?: boolean;
    q5CompetitorBombing?: boolean;
    explanation?: string;
  },
): Promise<any> {
  const existing = await getRatingById(ratingId);
  if (!existing) throw new Error("Rating not found");
  if (existing.memberId === flaggerId) throw new Error("Cannot flag your own rating");

  const [flag] = await db
    .insert(ratingFlags)
    .values({
      ratingId,
      flaggerId,
      q1NoSpecificExperience: data.q1NoSpecificExperience || false,
      q2ScoreMismatchNote: data.q2ScoreMismatchNote || false,
      q3InsiderSuspected: data.q3InsiderSuspected || false,
      q4CoordinatedPattern: data.q4CoordinatedPattern || false,
      q5CompetitorBombing: data.q5CompetitorBombing || false,
      explanation: data.explanation || "",
    })
    .returning();

  return flag;
}

// ── Sprint 183: Get Moderation Queue ─────────────────────────
/**
 * Get auto-flagged ratings that need admin review.
 * Returns ratings where autoFlagged=true and isFlagged=false (not yet actioned).
 */
export async function getAutoFlaggedRatings(
  page: number = 1,
  perPage: number = 20,
): Promise<{ ratings: any[]; total: number }> {
  const offset = (page - 1) * perPage;
  const { businesses } = await import("@shared/schema");

  const results = await db
    .select({
      id: ratings.id,
      memberId: ratings.memberId,
      businessId: ratings.businessId,
      q1Score: ratings.q1Score,
      q2Score: ratings.q2Score,
      q3Score: ratings.q3Score,
      rawScore: ratings.rawScore,
      note: ratings.note,
      flagReason: ratings.flagReason,
      flagProbability: ratings.flagProbability,
      autoFlagged: ratings.autoFlagged,
      isFlagged: ratings.isFlagged,
      createdAt: ratings.createdAt,
      businessName: businesses.name,
      businessSlug: businesses.slug,
    })
    .from(ratings)
    .innerJoin(businesses, eq(ratings.businessId, businesses.id))
    .where(and(eq(ratings.autoFlagged, true), eq(ratings.isFlagged, false)))
    .orderBy(desc(ratings.createdAt))
    .limit(perPage)
    .offset(offset);

  const [totalResult] = await db
    .select({ count: count() })
    .from(ratings)
    .where(and(eq(ratings.autoFlagged, true), eq(ratings.isFlagged, false)));

  return { ratings: results, total: totalResult?.count ?? 0 };
}

/**
 * Admin action: confirm or dismiss an auto-flagged rating.
 * Confirm sets isFlagged=true (excluded from calculations).
 * Dismiss clears autoFlagged (keeps in calculations).
 */
export async function reviewAutoFlaggedRating(
  ratingId: string,
  action: "confirm" | "dismiss",
  reviewedBy: string,
): Promise<void> {
  if (action === "confirm") {
    await db
      .update(ratings)
      .set({ isFlagged: true })
      .where(eq(ratings.id, ratingId));

    // Recalculate after excluding the flagged rating
    const rating = await getRatingById(ratingId);
    if (rating) {
      await recalculateBusinessScore(rating.businessId);
      const biz = await getBusinessById(rating.businessId);
      if (biz) await recalculateRanks(biz.city, biz.category);
      await updateMemberStats(rating.memberId);
    }
  } else {
    await db
      .update(ratings)
      .set({ autoFlagged: false })
      .where(eq(ratings.id, ratingId));
  }
}
