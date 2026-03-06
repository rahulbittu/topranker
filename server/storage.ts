import { db } from "./db";
import { eq, and, desc, asc, sql, count, ne } from "drizzle-orm";
import {
  members,
  businesses,
  ratings,
  challengers,
  rankHistory,
  businessClaims,
  type Member,
  type Business,
  type Rating,
  type Challenger,
  type InsertRating,
} from "@shared/schema";

const TIER_WEIGHTS: Record<string, number> = {
  new: 0.1,
  regular: 0.35,
  trusted: 0.7,
  top: 1.0,
};

function getVoteWeight(credibilityScore: number): number {
  if (credibilityScore >= 600) return 1.0;
  if (credibilityScore >= 300) return 0.7;
  if (credibilityScore >= 100) return 0.35;
  return 0.1;
}

function getTierFromScore(
  score: number,
  totalRatings: number,
  totalCategories: number,
  daysActive: number,
  ratingVariance: number,
  activeFlagCount: number,
): string {
  if (
    score >= 600 &&
    totalRatings >= 80 &&
    totalCategories >= 4 &&
    daysActive >= 90 &&
    ratingVariance >= 1.0 &&
    activeFlagCount === 0
  ) {
    return "top";
  }
  if (
    score >= 300 &&
    totalRatings >= 35 &&
    totalCategories >= 3 &&
    daysActive >= 45 &&
    ratingVariance >= 0.8
  ) {
    return "trusted";
  }
  if (
    score >= 100 &&
    totalRatings >= 10 &&
    totalCategories >= 2 &&
    daysActive >= 14
  ) {
    return "regular";
  }
  return "new";
}

function getTemporalMultiplier(ratingAgeDays: number): number {
  if (ratingAgeDays <= 30) return 1.0;
  if (ratingAgeDays <= 90) return 0.85;
  if (ratingAgeDays <= 180) return 0.65;
  if (ratingAgeDays <= 365) return 0.45;
  return 0.25;
}

export async function getMemberById(id: string): Promise<Member | undefined> {
  const [member] = await db.select().from(members).where(eq(members.id, id));
  return member;
}

export async function getMemberByUsername(username: string): Promise<Member | undefined> {
  const [member] = await db.select().from(members).where(eq(members.username, username));
  return member;
}

export async function getMemberByEmail(email: string): Promise<Member | undefined> {
  const [member] = await db.select().from(members).where(eq(members.email, email));
  return member;
}

export async function createMember(data: {
  displayName: string;
  username: string;
  email: string;
  password: string;
  city?: string;
}): Promise<Member> {
  const [member] = await db.insert(members).values(data).returning();
  return member;
}

export async function getLeaderboard(
  city: string,
  category: string,
  limit: number = 10,
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

export async function getBusinessRatings(
  businessId: string,
  page: number = 1,
  perPage: number = 20,
): Promise<{ ratings: (Rating & { memberName: string; memberTier: string })[]; total: number }> {
  const offset = (page - 1) * perPage;

  const ratingsResult = await db
    .select({
      id: ratings.id,
      memberId: ratings.memberId,
      businessId: ratings.businessId,
      foodQuality: ratings.foodQuality,
      valueForMoney: ratings.valueForMoney,
      service: ratings.service,
      wouldReturn: ratings.wouldReturn,
      note: ratings.note,
      rawScore: ratings.rawScore,
      weight: ratings.weight,
      weightedScore: ratings.weightedScore,
      isFlagged: ratings.isFlagged,
      flagReason: ratings.flagReason,
      createdAt: ratings.createdAt,
      memberName: members.displayName,
      memberTier: members.credibilityTier,
    })
    .from(ratings)
    .innerJoin(members, eq(ratings.memberId, members.id))
    .where(and(eq(ratings.businessId, businessId), eq(ratings.isFlagged, false)))
    .orderBy(desc(ratings.createdAt))
    .limit(perPage)
    .offset(offset);

  const [totalResult] = await db
    .select({ count: count() })
    .from(ratings)
    .where(and(eq(ratings.businessId, businessId), eq(ratings.isFlagged, false)));

  return { ratings: ratingsResult, total: totalResult.count };
}

export async function getMemberRatings(
  memberId: string,
  page: number = 1,
  perPage: number = 20,
): Promise<{ ratings: (Rating & { businessName: string })[]; total: number }> {
  const offset = (page - 1) * perPage;

  const ratingsResult = await db
    .select({
      id: ratings.id,
      memberId: ratings.memberId,
      businessId: ratings.businessId,
      foodQuality: ratings.foodQuality,
      valueForMoney: ratings.valueForMoney,
      service: ratings.service,
      wouldReturn: ratings.wouldReturn,
      note: ratings.note,
      rawScore: ratings.rawScore,
      weight: ratings.weight,
      weightedScore: ratings.weightedScore,
      isFlagged: ratings.isFlagged,
      flagReason: ratings.flagReason,
      createdAt: ratings.createdAt,
      businessName: businesses.name,
    })
    .from(ratings)
    .innerJoin(businesses, eq(ratings.businessId, businesses.id))
    .where(eq(ratings.memberId, memberId))
    .orderBy(desc(ratings.createdAt))
    .limit(perPage)
    .offset(offset);

  const [totalResult] = await db
    .select({ count: count() })
    .from(ratings)
    .where(eq(ratings.memberId, memberId));

  return { ratings: ratingsResult, total: totalResult.count };
}

export async function getActiveChallenges(
  city: string,
  category?: string,
): Promise<any[]> {
  let query = db
    .select()
    .from(challengers)
    .where(
      and(
        eq(challengers.status, "active"),
        eq(challengers.city, city),
        ...(category ? [eq(challengers.category, category)] : []),
      ),
    );

  const challengerRows = await query;

  const results = [];
  for (const c of challengerRows) {
    const [challengerBiz] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, c.challengerId));
    const [defenderBiz] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, c.defenderId));

    results.push({
      ...c,
      challengerBusiness: challengerBiz,
      defenderBusiness: defenderBiz,
    });
  }

  return results;
}

export async function submitRating(
  memberId: string,
  data: InsertRating,
): Promise<{
  rating: Rating;
  newBusinessRank: number | null;
  tierUpgraded: boolean;
  newTier: string;
}> {
  const member = await getMemberById(memberId);
  if (!member) throw new Error("Member not found");

  const business = await getBusinessById(data.businessId);
  if (!business) throw new Error("Business not found");

  const rawScore = (data.foodQuality + data.valueForMoney + data.service) / 3;
  const weight = getVoteWeight(member.credibilityScore);
  const weighted = rawScore * weight;

  const [rating] = await db
    .insert(ratings)
    .values({
      memberId,
      businessId: data.businessId,
      foodQuality: data.foodQuality,
      valueForMoney: data.valueForMoney,
      service: data.service,
      wouldReturn: data.wouldReturn,
      note: data.note || null,
      rawScore: rawScore.toFixed(2),
      weight: weight.toFixed(4),
      weightedScore: weighted.toFixed(4),
    })
    .returning();

  await recalculateBusinessScore(data.businessId);
  const newRank = await recalculateRanks(business.city, business.category);

  await updateMemberStats(memberId);
  const tierResult = await checkTierUpgrade(memberId);

  await updateChallengerVotes(data.businessId, weighted);

  const updatedBusiness = await getBusinessById(data.businessId);

  return {
    rating,
    newBusinessRank: updatedBusiness?.rankPosition ?? null,
    tierUpgraded: tierResult.upgraded,
    newTier: tierResult.newTier,
  };
}

export async function recalculateBusinessScore(businessId: string): Promise<number> {
  const allRatings = await db
    .select({
      rawScore: ratings.rawScore,
      weight: ratings.weight,
      createdAt: ratings.createdAt,
    })
    .from(ratings)
    .where(and(eq(ratings.businessId, businessId), eq(ratings.isFlagged, false)));

  if (allRatings.length === 0) {
    await db
      .update(businesses)
      .set({ weightedScore: "0", rawAvgScore: "0", totalRatings: 0, updatedAt: new Date() })
      .where(eq(businesses.id, businessId));
    return 0;
  }

  let totalWeightedScore = 0;
  let totalWeight = 0;
  let rawSum = 0;

  for (const r of allRatings) {
    const ageDays = Math.floor(
      (Date.now() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24),
    );
    const temporal = getTemporalMultiplier(ageDays);
    const effectiveWeight = parseFloat(r.weight) * temporal;
    totalWeightedScore += parseFloat(r.rawScore) * effectiveWeight;
    totalWeight += effectiveWeight;
    rawSum += parseFloat(r.rawScore);
  }

  const score = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  const rawAvg = rawSum / allRatings.length;

  await db
    .update(businesses)
    .set({
      weightedScore: score.toFixed(3),
      rawAvgScore: rawAvg.toFixed(2),
      totalRatings: allRatings.length,
      credibilityWeightSum: totalWeight.toFixed(3),
      updatedAt: new Date(),
    })
    .where(eq(businesses.id, businessId));

  return score;
}

export async function recalculateRanks(
  city: string,
  category: string,
): Promise<void> {
  const allBusinesses = await db
    .select({ id: businesses.id, rankPosition: businesses.rankPosition })
    .from(businesses)
    .where(
      and(
        eq(businesses.city, city),
        eq(businesses.category, category),
        eq(businesses.isActive, true),
      ),
    )
    .orderBy(desc(businesses.weightedScore));

  for (let i = 0; i < allBusinesses.length; i++) {
    const oldRank = allBusinesses[i].rankPosition;
    const newRank = i + 1;
    const delta = oldRank ? oldRank - newRank : 0;

    await db
      .update(businesses)
      .set({ rankPosition: newRank, rankDelta: delta })
      .where(eq(businesses.id, allBusinesses[i].id));
  }
}

export async function updateMemberStats(memberId: string): Promise<void> {
  const [ratingCount] = await db
    .select({ count: count() })
    .from(ratings)
    .where(eq(ratings.memberId, memberId));

  const categoryResult = await db
    .select({ category: businesses.category })
    .from(ratings)
    .innerJoin(businesses, eq(ratings.businessId, businesses.id))
    .where(eq(ratings.memberId, memberId))
    .groupBy(businesses.category);

  await db
    .update(members)
    .set({
      totalRatings: ratingCount.count,
      totalCategories: categoryResult.length,
      lastActive: new Date(),
    })
    .where(eq(members.id, memberId));
}

export async function calculateCredibilityScore(memberId: string): Promise<{
  score: number;
  breakdown: {
    base: number;
    ratingPoints: number;
    diversityBonus: number;
    ageBonus: number;
    varianceBonus: number;
    helpfulnessBonus: number;
    flagPenalty: number;
  };
}> {
  const member = await getMemberById(memberId);
  if (!member) throw new Error("Member not found");

  const basePoints = 10;
  const ratingPoints = Math.min(member.totalRatings * 2, 200);

  const categoryResult = await db
    .select({ category: businesses.category })
    .from(ratings)
    .innerJoin(businesses, eq(ratings.businessId, businesses.id))
    .where(eq(ratings.memberId, memberId))
    .groupBy(businesses.category);
  const diversityBonus = Math.min(categoryResult.length * 15, 100);

  const daysActive = Math.floor(
    (Date.now() - new Date(member.joinedAt).getTime()) / (1000 * 60 * 60 * 24),
  );
  const ageBonus = Math.min(Math.floor(daysActive * 0.5), 100);

  const memberRatings = await db
    .select({ rawScore: ratings.rawScore })
    .from(ratings)
    .where(eq(ratings.memberId, memberId));

  let variance = 0;
  if (memberRatings.length > 1) {
    const scores = memberRatings.map((r) => parseFloat(r.rawScore));
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const sqDiffs = scores.map((s) => (s - mean) ** 2);
    variance = Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / scores.length);
  }
  const varianceBonus = Math.min(Math.floor(variance * 50), 150);

  let pioneerCount = 0;
  for (const r of memberRatings) {
    pioneerCount++;
  }

  const allMemberRatings = await db
    .select({
      businessId: ratings.businessId,
      createdAt: ratings.createdAt,
    })
    .from(ratings)
    .where(eq(ratings.memberId, memberId));

  let earlyReviewCount = 0;
  for (const r of allMemberRatings) {
    const [countBefore] = await db
      .select({ count: count() })
      .from(ratings)
      .where(
        and(
          eq(ratings.businessId, r.businessId),
          ne(ratings.memberId, memberId),
          sql`${ratings.createdAt} < ${r.createdAt}`,
        ),
      );
    if (countBefore.count < 5) earlyReviewCount++;
  }

  const pioneerRate = allMemberRatings.length > 0 ? earlyReviewCount / allMemberRatings.length : 0;
  const helpfulnessBonus = Math.floor(pioneerRate * 150);

  const [flagResult] = await db
    .select({ count: count() })
    .from(ratings)
    .where(and(eq(ratings.memberId, memberId), eq(ratings.isFlagged, true)));
  const flagPenalty = flagResult.count * 25;

  const rawScore =
    basePoints + ratingPoints + diversityBonus + ageBonus + varianceBonus + helpfulnessBonus - flagPenalty;
  const score = Math.max(10, Math.min(1000, Math.round(rawScore)));

  return {
    score,
    breakdown: {
      base: basePoints,
      ratingPoints,
      diversityBonus,
      ageBonus,
      varianceBonus,
      helpfulnessBonus,
      flagPenalty,
    },
  };
}

export async function checkTierUpgrade(
  memberId: string,
): Promise<{ upgraded: boolean; newTier: string }> {
  const member = await getMemberById(memberId);
  if (!member) throw new Error("Member not found");

  const { score } = await calculateCredibilityScore(memberId);

  const daysActive = Math.floor(
    (Date.now() - new Date(member.joinedAt).getTime()) / (1000 * 60 * 60 * 24),
  );

  const memberRatings = await db
    .select({ rawScore: ratings.rawScore })
    .from(ratings)
    .where(eq(ratings.memberId, memberId));

  let variance = 0;
  if (memberRatings.length > 1) {
    const scores = memberRatings.map((r) => parseFloat(r.rawScore));
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const sqDiffs = scores.map((s) => (s - mean) ** 2);
    variance = Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / scores.length);
  }

  const [flagResult] = await db
    .select({ count: count() })
    .from(ratings)
    .where(and(eq(ratings.memberId, memberId), eq(ratings.isFlagged, true)));

  const newTier = getTierFromScore(
    score,
    member.totalRatings,
    member.totalCategories,
    daysActive,
    variance,
    flagResult.count,
  );

  const upgraded = newTier !== member.credibilityTier;

  await db
    .update(members)
    .set({ credibilityScore: score, credibilityTier: newTier })
    .where(eq(members.id, memberId));

  return { upgraded, newTier };
}

export async function updateChallengerVotes(
  businessId: string,
  weightedScore: number,
): Promise<void> {
  const asChallenger = await db
    .select()
    .from(challengers)
    .where(
      and(eq(challengers.challengerId, businessId), eq(challengers.status, "active")),
    );

  for (const c of asChallenger) {
    const newVotes = parseFloat(c.challengerWeightedVotes) + weightedScore;
    await db
      .update(challengers)
      .set({ challengerWeightedVotes: newVotes.toFixed(3) })
      .where(eq(challengers.id, c.id));
  }

  const asDefender = await db
    .select()
    .from(challengers)
    .where(
      and(eq(challengers.defenderId, businessId), eq(challengers.status, "active")),
    );

  for (const c of asDefender) {
    const newVotes = parseFloat(c.defenderWeightedVotes) + weightedScore;
    await db
      .update(challengers)
      .set({ defenderWeightedVotes: newVotes.toFixed(3) })
      .where(eq(challengers.id, c.id));
  }
}

export async function searchBusinesses(
  query: string,
  city: string,
  category?: string,
  limit: number = 20,
): Promise<Business[]> {
  return db
    .select()
    .from(businesses)
    .where(
      and(
        eq(businesses.city, city),
        eq(businesses.isActive, true),
        sql`lower(${businesses.name}) like ${"%" + query.toLowerCase() + "%"}`,
        ...(category ? [eq(businesses.category, category)] : []),
      ),
    )
    .orderBy(desc(businesses.weightedScore))
    .limit(limit);
}

export async function getAllCategories(city: string): Promise<{ category: string; count: number }[]> {
  return db
    .select({
      category: businesses.category,
      count: count(),
    })
    .from(businesses)
    .where(and(eq(businesses.city, city), eq(businesses.isActive, true)))
    .groupBy(businesses.category);
}
