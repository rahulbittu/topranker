import { eq, and, sql, count, gte } from "drizzle-orm";
import {
  members, ratings, dishes, dishVotes,
  type Member, type Business, type Rating, type InsertRating,
} from "@shared/schema";
import { db } from "../db";
import { getVoteWeight } from "./helpers";
import { getMemberById } from "./members";
import { getBusinessById, recalculateBusinessScore, recalculateRanks } from "./businesses";
import { updateMemberStats, recalculateCredibilityScore } from "./members";
import { updateChallengerVotes } from "./challengers";

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

  if (member.totalRatings >= 10) {
    const memberRatings = await db
      .select({ rawScore: ratings.rawScore })
      .from(ratings)
      .where(eq(ratings.memberId, member.id));
    const fiveStarCount = memberRatings.filter(r => parseFloat(r.rawScore) >= 4.8).length;
    if (fiveStarCount / memberRatings.length > 0.90) flags.push("perfect_score_pattern");
  }

  if (rawScore <= 1.5 && member.totalRatings >= 5) {
    const memberRatings = await db
      .select({ rawScore: ratings.rawScore })
      .from(ratings)
      .where(eq(ratings.memberId, member.id));
    const oneStarCount = memberRatings.filter(r => parseFloat(r.rawScore) <= 1.5).length;
    if (oneStarCount / memberRatings.length > 0.60) flags.push("one_star_bomber");
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
