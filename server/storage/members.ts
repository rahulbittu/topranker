import { eq, and, ne, sql, count, gte, desc } from "drizzle-orm";
import {
  members, ratings, businesses, credibilityPenalties,
  type Member,
} from "@shared/schema";
import { db } from "../db";
import { getTierFromScore } from "./helpers";
import { checkAndRefreshTier } from "../tier-staleness";

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

export async function getAdminMemberList(limit: number = 50) {
  return db
    .select({
      id: members.id,
      displayName: members.displayName,
      username: members.username,
      email: members.email,
      city: members.city,
      credibilityTier: members.credibilityTier,
      credibilityScore: members.credibilityScore,
      totalRatings: members.totalRatings,
      isBanned: members.isBanned,
      isFoundingMember: members.isFoundingMember,
      joinedAt: members.joinedAt,
    })
    .from(members)
    .orderBy(desc(members.joinedAt))
    .limit(limit);
}

export async function getMemberCount(): Promise<number> {
  const [result] = await db.select({ cnt: count() }).from(members);
  return Number(result?.cnt ?? 0);
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

  // Pioneer rate: single query replaces N+1 loop (Sprint 136 core-loop fix)
  const [pioneerResult] = await db.execute(sql`
    SELECT
      COUNT(*) AS total_ratings,
      COUNT(*) FILTER (WHERE prior_count < 10) AS early_ratings
    FROM (
      SELECT r1.id,
        (SELECT COUNT(*) FROM ${ratings} r2
         WHERE r2.business_id = r1.business_id
           AND r2.member_id != ${memberId}
           AND r2.created_at < r1.created_at
           AND r2.is_flagged = false) AS prior_count
      FROM ${ratings} r1
      WHERE r1.member_id = ${memberId}
        AND r1.is_flagged = false
    ) sub
  `);
  const totalMemberRatings = Number(pioneerResult?.total_ratings ?? 0);
  const earlyReviewCount = Number(pioneerResult?.early_ratings ?? 0);

  const pioneerRate = totalMemberRatings > 0
    ? earlyReviewCount / totalMemberRatings
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

  const gateTier = getTierFromScore(
    score,
    member.totalRatings,
    member.totalCategories,
    daysActive,
    ratingVariance,
    member.activeFlagCount,
  );

  // Live tier staleness check (Sprint 140): detect and log any drift between
  // the member's previously stored tier and their current score. This ensures
  // the staleness detection from tier-staleness.ts runs on every recalculation,
  // not just in batch jobs. The gate tier (with activity thresholds) is authoritative
  // for the final value, but checkAndRefreshTier logs when the stored tier was stale.
  const stalenessCheckedTier = checkAndRefreshTier(member.credibilityTier, score);

  // Use the gate-based tier as the final value (it's stricter, requiring activity
  // thresholds). If staleness check detected drift, the DB update below corrects it.
  const tier = gateTier;

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

export async function getSeasonalRatingCounts(memberId: string) {
  const result = await db
    .select({
      month: sql<number>`EXTRACT(MONTH FROM ${ratings.createdAt})::int`,
      cnt: count(),
    })
    .from(ratings)
    .where(
      and(
        eq(ratings.memberId, memberId),
        eq(ratings.isFlagged, false),
      ),
    )
    .groupBy(sql`EXTRACT(MONTH FROM ${ratings.createdAt})`);

  let spring = 0, summer = 0, fall = 0, winter = 0;
  for (const row of result) {
    const c = Number(row.cnt);
    if ([3, 4, 5].includes(row.month)) spring += c;
    else if ([6, 7, 8].includes(row.month)) summer += c;
    else if ([9, 10, 11].includes(row.month)) fall += c;
    else winter += c; // 12, 1, 2
  }

  return { springRatings: spring, summerRatings: summer, fallRatings: fall, winterRatings: winter };
}

export async function updateMemberProfile(
  memberId: string,
  updates: { displayName?: string; username?: string }
): Promise<any> {
  const updateData: Record<string, any> = {};
  if (updates.displayName !== undefined) updateData.displayName = updates.displayName;
  if (updates.username !== undefined) updateData.username = updates.username;
  if (Object.keys(updateData).length === 0) return null;
  const [updated] = await db.update(members).set(updateData).where(eq(members.id, memberId)).returning();
  return updated;
}

export async function updatePushToken(memberId: string, pushToken: string): Promise<void> {
  await db
    .update(members)
    .set({ pushToken })
    .where(eq(members.id, memberId));
}

export async function updateMemberAvatar(memberId: string, avatarUrl: string) {
  const [updated] = await db.update(members).set({ avatarUrl }).where(eq(members.id, memberId)).returning();
  return updated;
}

export async function updateNotificationPrefs(
  memberId: string,
  prefs: Record<string, boolean>,
): Promise<Record<string, boolean>> {
  const [updated] = await db
    .update(members)
    .set({ notificationPrefs: prefs })
    .where(eq(members.id, memberId))
    .returning({ notificationPrefs: members.notificationPrefs });
  return (updated?.notificationPrefs as Record<string, boolean>) ?? prefs;
}

export async function getMemberImpact(
  memberId: string,
): Promise<{
  businessesMovedUp: number;
  topContributions: { name: string; slug: string; rankChange: number }[];
  lastRating: { businessName: string; businessSlug: string; rawScore: string; weight: string; ratedAt: string } | null;
}> {
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

  // Get the user's most recent rating for consequence display
  const lastRatingRows = await db
    .select({
      businessName: businesses.name,
      businessSlug: businesses.slug,
      rawScore: ratings.rawScore,
      weight: ratings.weight,
      ratedAt: ratings.createdAt,
    })
    .from(ratings)
    .innerJoin(businesses, eq(ratings.businessId, businesses.id))
    .where(eq(ratings.memberId, memberId))
    .orderBy(desc(ratings.createdAt))
    .limit(1);

  const lastRating = lastRatingRows.length > 0
    ? {
        businessName: lastRatingRows[0].businessName,
        businessSlug: lastRatingRows[0].businessSlug,
        rawScore: lastRatingRows[0].rawScore,
        weight: lastRatingRows[0].weight,
        ratedAt: lastRatingRows[0].ratedAt.toISOString(),
      }
    : null;

  const movedUp = memberRatings.filter(r => r.rankDelta > 0);
  return {
    businessesMovedUp: movedUp.length,
    topContributions: movedUp
      .sort((a, b) => b.rankDelta - a.rankDelta)
      .slice(0, 5)
      .map(r => ({ name: r.businessName, slug: r.businessSlug, rankChange: r.rankDelta })),
    lastRating,
  };
}
