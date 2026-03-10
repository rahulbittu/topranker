import { eq, and, ne, sql, count, countDistinct, gte, desc, isNotNull } from "drizzle-orm";
import {
  members, ratings, businesses, credibilityPenalties, dishVotes, dishes,
  type Member,
} from "@shared/schema";
import { db } from "../db";
import { getTierFromScore } from "./helpers";
import { checkAndRefreshTier } from "../tier-staleness";
import crypto from "node:crypto";

export async function getMemberById(id: string): Promise<Member | undefined> {
  const [member] = await db.select().from(members).where(eq(members.id, id));
  return member;
}

// Sprint 179: Get members with push tokens in a city (for challenger notifications)
export async function getMembersWithPushTokenByCity(
  city: string,
  limit: number = 500,
): Promise<Array<{ id: string; pushToken: string }>> {
  const { isNotNull } = await import("drizzle-orm");
  const results = await db
    .select({ id: members.id, pushToken: members.pushToken })
    .from(members)
    .where(and(eq(members.city, city), isNotNull(members.pushToken)))
    .limit(limit);
  return results.filter((m): m is { id: string; pushToken: string } => !!m.pushToken);
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
  // Sprint 197: Consolidated from 4 queries to 3 parallel (critique feedback)
  const whereClause = and(eq(ratings.memberId, memberId), eq(ratings.isFlagged, false));

  const [statsResult, categoryResult, memberRatings] = await Promise.all([
    // Aggregate count + distinct businesses in one query
    db.select({
      totalRatings: count(),
      distinctBusinesses: countDistinct(ratings.businessId),
    }).from(ratings).where(whereClause),
    // Category count requires business join
    db.select({ category: businesses.category })
      .from(ratings)
      .innerJoin(businesses, eq(ratings.businessId, businesses.id))
      .where(whereClause)
      .groupBy(businesses.category),
    // Raw scores for variance calculation
    db.select({ rawScore: ratings.rawScore })
      .from(ratings)
      .where(whereClause),
  ]);

  const stats = statsResult[0];

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
      totalRatings: stats.totalRatings,
      totalCategories: categoryResult.length,
      distinctBusinesses: stats.distinctBusinesses,
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
  const pioneerQueryResult = await db.execute(sql`
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
  const pioneerResult = (pioneerQueryResult as any).rows?.[0] ?? (pioneerQueryResult as any)[0] ?? {};
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

/**
 * Sprint 577: Compute dish vote streak stats for a member.
 * Returns current streak (consecutive days ending today/yesterday),
 * longest streak ever, total dish votes, and top dish name.
 */
export async function getDishVoteStreakStats(memberId: string): Promise<{
  dishVoteStreak: number; longestDishStreak: number; totalDishVotes: number; topDish: string | null;
}> {
  // Total dish votes (exclude noNotableDish)
  const [totalRow] = await db.select({ cnt: count() }).from(dishVotes)
    .where(and(eq(dishVotes.memberId, memberId), isNotNull(dishVotes.dishId)));
  const totalDishVotes = totalRow?.cnt ?? 0;
  if (totalDishVotes === 0) return { dishVoteStreak: 0, longestDishStreak: 0, totalDishVotes: 0, topDish: null };

  // Top dish by vote frequency
  const topDishRows = await db.select({ name: dishes.name, cnt: count() }).from(dishVotes)
    .innerJoin(dishes, eq(dishVotes.dishId, dishes.id))
    .where(and(eq(dishVotes.memberId, memberId), isNotNull(dishVotes.dishId)))
    .groupBy(dishes.name).orderBy(sql`count(*) DESC`).limit(1);
  const topDish = topDishRows[0]?.name ?? null;

  // Distinct vote days (UTC date), ordered descending
  const dayRows = await db.selectDistinct({ day: sql<string>`DATE(${dishVotes.createdAt})` })
    .from(dishVotes)
    .where(and(eq(dishVotes.memberId, memberId), isNotNull(dishVotes.dishId)))
    .orderBy(sql`DATE(${dishVotes.createdAt}) DESC`);

  const days = dayRows.map(r => r.day);
  if (days.length === 0) return { dishVoteStreak: 0, longestDishStreak: 0, totalDishVotes, topDish };

  // Calculate streaks from sorted (desc) distinct days
  const toMs = (d: string) => new Date(d + "T00:00:00Z").getTime();
  const ONE_DAY = 86400000;
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  const todayMs = today.getTime();

  let current = 0, longest = 1, streak = 1;
  const firstDayMs = toMs(days[0]);
  // Current streak: must include today or yesterday
  const isCurrent = (todayMs - firstDayMs) <= ONE_DAY;

  for (let i = 1; i < days.length; i++) {
    const prev = toMs(days[i - 1]);
    const curr = toMs(days[i]);
    if (prev - curr === ONE_DAY) { streak++; }
    else { if (streak > longest) longest = streak; streak = 1; }
  }
  if (streak > longest) longest = streak;

  // Current streak: walk from most recent day backwards
  if (isCurrent) {
    current = 1;
    for (let i = 1; i < days.length; i++) {
      if (toMs(days[i - 1]) - toMs(days[i]) === ONE_DAY) current++;
      else break;
    }
  }

  return { dishVoteStreak: current, longestDishStreak: longest, totalDishVotes, topDish };
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

export async function updateMemberEmail(memberId: string, email: string): Promise<any> {
  const [existing] = await db.select().from(members).where(eq(members.email, email));
  if (existing && existing.id !== memberId) throw new Error("Email already in use");
  const [updated] = await db.update(members).set({ email }).where(eq(members.id, memberId)).returning();
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

// Sprint 518: Notification frequency preferences
export async function updateNotificationFrequencyPrefs(
  memberId: string,
  prefs: Record<string, string>,
): Promise<Record<string, string>> {
  const [updated] = await db
    .update(members)
    .set({ notificationFrequencyPrefs: prefs })
    .where(eq(members.id, memberId))
    .returning({ notificationFrequencyPrefs: members.notificationFrequencyPrefs });
  return (updated?.notificationFrequencyPrefs as Record<string, string>) ?? prefs;
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

/**
 * Sprint 185: Onboarding progress — tracks key milestones for new users.
 * Returns completion status for each step so the client can show a checklist.
 */
export async function getOnboardingProgress(memberId: string): Promise<{
  steps: Array<{ key: string; label: string; completed: boolean; detail?: string }>;
  completedCount: number;
  totalSteps: number;
}> {
  const member = await getMemberById(memberId);
  if (!member) throw new Error("Member not found");

  const daysActive = Math.floor(
    (Date.now() - new Date(member.joinedAt).getTime()) / (1000 * 60 * 60 * 24),
  );

  // Check if member has bookmarked anything (via ratings to different businesses)
  const hasAvatar = !!member.avatarUrl;
  const hasCity = !!member.city && member.city !== "Dallas"; // explicitly chose a city
  const hasRated = (member.totalRatings || 0) > 0;
  const hasMultipleRatings = (member.totalRatings || 0) >= 3;
  const earnedTier = member.credibilityTier !== "community";
  const canRate = daysActive >= 3;

  const steps = [
    { key: "create_account", label: "Create your account", completed: true, detail: `Joined ${daysActive} day${daysActive !== 1 ? "s" : ""} ago` },
    { key: "set_city", label: "Choose your city", completed: hasCity || true, detail: member.city || "Dallas" },
    { key: "add_avatar", label: "Add a profile photo", completed: hasAvatar },
    { key: "wait_period", label: "Complete 3-day waiting period", completed: canRate, detail: canRate ? "Unlocked" : `${3 - daysActive} day${3 - daysActive !== 1 ? "s" : ""} remaining` },
    { key: "first_rating", label: "Submit your first rating", completed: hasRated, detail: hasRated ? `${member.totalRatings} rating${(member.totalRatings || 0) !== 1 ? "s" : ""} submitted` : undefined },
    { key: "three_ratings", label: "Rate 3 different restaurants", completed: hasMultipleRatings, detail: hasMultipleRatings ? "Credibility building!" : `${member.totalRatings || 0}/3 ratings` },
    { key: "earn_tier", label: "Earn your first tier upgrade", completed: earnedTier, detail: earnedTier ? `Current: ${member.credibilityTier}` : "Keep rating to level up" },
  ];

  const completedCount = steps.filter(s => s.completed).length;

  return { steps, completedCount, totalSteps: steps.length };
}

// ---------------------------------------------------------------------------
// Sprint 186: Email Verification
// ---------------------------------------------------------------------------

/**
 * Generate a verification token and store it on the member record.
 * Returns the token for inclusion in the verification email.
 */
export async function generateEmailVerificationToken(memberId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  await db
    .update(members)
    .set({ emailVerificationToken: token })
    .where(eq(members.id, memberId));
  return token;
}

/**
 * Verify a member's email using their token.
 * Returns true if verification succeeded, false if token invalid.
 */
export async function verifyEmailToken(token: string): Promise<{ success: boolean; memberId?: string }> {
  if (!token || token.length < 32) return { success: false };

  const [member] = await db
    .select({ id: members.id })
    .from(members)
    .where(eq(members.emailVerificationToken, token));

  if (!member) return { success: false };

  await db
    .update(members)
    .set({ emailVerified: true, emailVerificationToken: null })
    .where(eq(members.id, member.id));

  return { success: true, memberId: member.id };
}

/**
 * Check if a member's email is verified.
 */
export async function isEmailVerified(memberId: string): Promise<boolean> {
  const [member] = await db
    .select({ emailVerified: members.emailVerified })
    .from(members)
    .where(eq(members.id, memberId));
  return member?.emailVerified ?? false;
}

// ---------------------------------------------------------------------------
// Sprint 186: Password Reset
// ---------------------------------------------------------------------------

/**
 * Generate a password reset token with 1-hour expiry.
 * Returns the token for inclusion in the reset email.
 */
export async function generatePasswordResetToken(email: string): Promise<{ token: string; memberId: string; displayName: string } | null> {
  const member = await getMemberByEmail(email);
  if (!member) return null;
  if (!member.password) return null; // Google-only accounts can't reset password

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db
    .update(members)
    .set({ passwordResetToken: token, passwordResetExpires: expires })
    .where(eq(members.id, member.id));

  return { token, memberId: member.id, displayName: member.displayName };
}

/**
 * Reset a member's password using their reset token.
 * Validates token and expiry, then hashes and stores new password.
 */
export async function resetPasswordWithToken(token: string, newPasswordHash: string): Promise<{ success: boolean; error?: string }> {
  if (!token || token.length < 32) return { success: false, error: "Invalid token" };

  const [member] = await db
    .select({ id: members.id, passwordResetExpires: members.passwordResetExpires })
    .from(members)
    .where(eq(members.passwordResetToken, token));

  if (!member) return { success: false, error: "Invalid or expired token" };

  if (member.passwordResetExpires && new Date(member.passwordResetExpires) < new Date()) {
    // Clear expired token
    await db.update(members).set({ passwordResetToken: null, passwordResetExpires: null }).where(eq(members.id, member.id));
    return { success: false, error: "Reset token has expired" };
  }

  await db
    .update(members)
    .set({
      password: newPasswordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
    })
    .where(eq(members.id, member.id));

  return { success: true };
}
