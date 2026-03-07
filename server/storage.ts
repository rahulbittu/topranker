import { db } from "./db";
import { eq, and, desc, asc, sql, count, ne, gte, lte } from "drizzle-orm";
import {
  members,
  businesses,
  ratings,
  challengers,
  rankHistory,
  businessClaims,
  businessPhotos,
  dishes,
  dishVotes,
  credibilityPenalties,
  type Member,
  type Business,
  type Rating,
  type Dish,
  type Challenger,
  type InsertRating,
} from "@shared/schema";

function getVoteWeight(credibilityScore: number): number {
  if (credibilityScore >= 600) return 1.000;
  if (credibilityScore >= 300) return 0.700;
  if (credibilityScore >= 100) return 0.350;
  return 0.100;
}

function getCredibilityTier(score: number): string {
  if (score >= 600) return "top";
  if (score >= 300) return "trusted";
  if (score >= 100) return "city";
  return "community";
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
  ) return "top";

  if (
    score >= 300 &&
    totalRatings >= 35 &&
    totalCategories >= 3 &&
    daysActive >= 45 &&
    ratingVariance >= 0.8
  ) return "trusted";

  if (
    score >= 100 &&
    totalRatings >= 10 &&
    totalCategories >= 2 &&
    daysActive >= 14
  ) return "city";

  return "community";
}

function getTemporalMultiplier(ratingAgeDays: number): number {
  if (ratingAgeDays <= 30) return 1.00;
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
): Promise<{ ratings: (Rating & { memberName: string; memberTier: string; memberAvatarUrl: string | null })[]; total: number }> {
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
      memberName: members.displayName,
      memberTier: members.credibilityTier,
      memberAvatarUrl: members.avatarUrl,
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
  const challengerRows = await db
    .select()
    .from(challengers)
    .where(
      and(
        eq(challengers.status, "active"),
        eq(challengers.city, city),
        ...(category ? [eq(challengers.category, category)] : []),
      ),
    );

  if (challengerRows.length === 0) return [];

  // Batch-fetch all referenced businesses in one query
  const bizIds = new Set<string>();
  for (const c of challengerRows) {
    bizIds.add(c.challengerId);
    bizIds.add(c.defenderId);
  }
  const bizIdArr = Array.from(bizIds);
  const bizRows = await db
    .select()
    .from(businesses)
    .where(sql`${businesses.id} = ANY(ARRAY[${sql.join(bizIdArr.map(id => sql`${id}`), sql`,`)}]::text[])`);

  const bizMap = new Map(bizRows.map(b => [b.id, b]));

  return challengerRows.map(c => ({
    ...c,
    challengerBusiness: bizMap.get(c.challengerId),
    defenderBusiness: bizMap.get(c.defenderId),
  }));
}

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
  const normalized = query.toLowerCase().trim();

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
  if (daysActive < 7) throw new Error("Account must be 7+ days old to rate");

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

export async function recalculateRanks(
  city: string,
  category: string,
): Promise<void> {
  const allBusinesses = await db
    .select({
      id: businesses.id,
      rankPosition: businesses.rankPosition,
    })
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
      .set({
        rankPosition: newRank,
        rankDelta: delta,
        prevRankPosition: oldRank,
      })
      .where(eq(businesses.id, allBusinesses[i].id));
  }
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
      .set({
        challengerWeightedVotes: newVotes.toFixed(3),
        totalVotes: sql`${challengers.totalVotes} + 1`,
      })
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
      .set({
        defenderWeightedVotes: newVotes.toFixed(3),
        totalVotes: sql`${challengers.totalVotes} + 1`,
      })
      .where(eq(challengers.id, c.id));
  }
}

export async function searchBusinesses(
  query: string,
  city: string,
  category?: string,
  limit: number = 20,
): Promise<Business[]> {
  const q = "%" + query.toLowerCase() + "%";
  return db
    .select()
    .from(businesses)
    .where(
      and(
        eq(businesses.city, city),
        eq(businesses.isActive, true),
        query
          ? sql`(lower(${businesses.name}) like ${q} OR lower(${businesses.neighborhood}) like ${q})`
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

export async function getMemberImpact(
  memberId: string,
): Promise<{ businessesMovedUp: number; topContributions: { name: string; slug: string; rankChange: number }[] }> {
  // Find businesses this member has rated
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
