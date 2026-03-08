import { eq, and, ne, sql, count, gte } from "drizzle-orm";
import {
  members, ratings, businesses, credibilityPenalties,
  type Member,
} from "@shared/schema";
import { db } from "../db";
import { getTierFromScore } from "./helpers";

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

export async function getMemberByAuthId(authId: string): Promise<Member | undefined> {
  const [member] = await db.select().from(members).where(eq(members.authId, authId));
  return member;
}

export async function createMember(data: {
  displayName: string;
  username: string;
  email: string;
  password?: string;
  city?: string;
  authId?: string;
  avatarUrl?: string;
}): Promise<Member> {
  const [member] = await db.insert(members).values(data).returning();
  return member;
}

export async function updateMemberStats(memberId: string): Promise<void> {
  const [ratingCount] = await db
    .select({ count: count() })
    .from(ratings)
    .where(and(eq(ratings.memberId, memberId), eq(ratings.isFlagged, false)));

  const categoryResult = await db
    .select({ category: businesses.category })
    .from(ratings)
    .innerJoin(businesses, eq(ratings.businessId, businesses.id))
    .where(and(eq(ratings.memberId, memberId), eq(ratings.isFlagged, false)))
    .groupBy(businesses.category);

  const distinctBizResult = await db
    .select({ bizId: ratings.businessId })
    .from(ratings)
    .where(and(eq(ratings.memberId, memberId), eq(ratings.isFlagged, false)))
    .groupBy(ratings.businessId);

  const memberRatings = await db
    .select({ rawScore: ratings.rawScore })
    .from(ratings)
    .where(and(eq(ratings.memberId, memberId), eq(ratings.isFlagged, false)));

  let variance = 0;
  if (memberRatings.length > 1) {
    const scores = memberRatings.map((r) => parseFloat(r.rawScore));
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const sqDiffs = scores.map((s) => (s - mean) ** 2);
    variance = Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / scores.length);
  }

  await db
    .update(members)
    .set({
      totalRatings: ratingCount.count,
      totalCategories: categoryResult.length,
      distinctBusinesses: distinctBizResult.length,
      ratingVariance: variance.toFixed(3),
      lastActive: new Date(),
    })
    .where(eq(members.id, memberId));
}

export async function recalculateCredibilityScore(memberId: string): Promise<{
  score: number;
  tier: string;
  breakdown: {
    base: number;
    volume: number;
    diversity: number;
    age: number;
    variance: number;
    helpfulness: number;
    penalties: number;
  };
}> {
  const member = await getMemberById(memberId);
  if (!member) throw new Error("Member not found");

  const base = 10;
  const volume = Math.min(member.totalRatings * 2, 200);
  const diversity = Math.min(member.totalCategories * 15, 100);

  const daysActive = Math.floor(
    (Date.now() - new Date(member.joinedAt).getTime()) / (1000 * 60 * 60 * 24),
  );
  const age = Math.min(daysActive * 0.5, 100);

  const memberRatings = await db
    .select({ rawScore: ratings.rawScore })
    .from(ratings)
    .where(and(eq(ratings.memberId, memberId), eq(ratings.isFlagged, false)));

  let varianceBonus = 0;
  if (memberRatings.length >= 5) {
    const scores = memberRatings.map((r) => parseFloat(r.rawScore));
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const sqDiffs = scores.map((s) => (s - mean) ** 2);
    const stddev = Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / scores.length);
    varianceBonus = Math.min(stddev * 60, 150);
  }

  const allMemberRatings = await db
    .select({
      businessId: ratings.businessId,
      createdAt: ratings.createdAt,
    })
    .from(ratings)
    .where(and(eq(ratings.memberId, memberId), eq(ratings.isFlagged, false)));

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
    if (countBefore.count < 10) earlyReviewCount++;
  }

  const pioneerRate = allMemberRatings.length > 0
    ? earlyReviewCount / allMemberRatings.length
    : 0;
  const helpfulness = Math.round(pioneerRate * 100);

  const penaltyResult = await db
    .select({ total: sql<number>`COALESCE(SUM(${credibilityPenalties.finalPenalty}), 0)` })
    .from(credibilityPenalties)
    .where(eq(credibilityPenalties.memberId, memberId));
  const totalPenalties = Number(penaltyResult[0]?.total ?? 0);

  const rawScore = base + volume + diversity + age + varianceBonus + helpfulness - totalPenalties;
  const score = Math.max(10, Math.min(1000, Math.round(rawScore)));

  let ratingVariance = 0;
  if (memberRatings.length > 1) {
    const scores = memberRatings.map((r) => parseFloat(r.rawScore));
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const sqDiffs = scores.map((s) => (s - mean) ** 2);
    ratingVariance = Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / scores.length);
  }

  const tier = getTierFromScore(
    score,
    member.totalRatings,
    member.totalCategories,
    daysActive,
    ratingVariance,
    member.activeFlagCount,
  );

  await db
    .update(members)
    .set({ credibilityScore: score, credibilityTier: tier })
    .where(eq(members.id, memberId));

  return {
    score,
    tier,
    breakdown: {
      base,
      volume,
      diversity,
      age: Math.round(age),
      variance: Math.round(varianceBonus),
      helpfulness,
      penalties: totalPenalties,
    },
  };
}

export async function getMemberRatings(
  memberId: string,
  page: number = 1,
  perPage: number = 20,
): Promise<{ ratings: any[]; total: number }> {
  const offset = (page - 1) * perPage;

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
      businessName: businesses.name,
      businessSlug: businesses.slug,
    })
    .from(ratings)
    .innerJoin(businesses, eq(ratings.businessId, businesses.id))
    .where(eq(ratings.memberId, memberId))
    .orderBy(sql`${ratings.createdAt} DESC`)
    .limit(perPage)
    .offset(offset);

  const [totalResult] = await db
    .select({ count: count() })
    .from(ratings)
    .where(eq(ratings.memberId, memberId));

  return { ratings: ratingsResult, total: totalResult.count };
}

export async function getMemberImpact(
  memberId: string,
): Promise<{ businessesMovedUp: number; topContributions: { name: string; slug: string; rankChange: number }[] }> {
  const memberRatings = await db
    .select({
      businessId: ratings.businessId,
      businessName: businesses.name,
      businessSlug: businesses.slug,
      rankDelta: businesses.rankDelta,
    })
    .from(ratings)
    .innerJoin(businesses, eq(ratings.businessId, businesses.id))
    .where(
      and(
        eq(ratings.memberId, memberId),
        eq(ratings.isFlagged, false),
      ),
    )
    .groupBy(ratings.businessId, businesses.name, businesses.slug, businesses.rankDelta);

  const movedUp = memberRatings.filter(r => r.rankDelta > 0);
  return {
    businessesMovedUp: movedUp.length,
    topContributions: movedUp
      .sort((a, b) => b.rankDelta - a.rankDelta)
      .slice(0, 5)
      .map(r => ({ name: r.businessName, slug: r.businessSlug, rankChange: r.rankDelta })),
  };
}
