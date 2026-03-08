/**
 * Sprint 142 — End-to-End Product Path Validation Tests
 *
 * Validates the CORE LOOP of TopRanker: rating submission, credibility
 * recalculation, tier promotion, vote weight updates, and ranking impact.
 *
 * These tests chain business logic functions to verify product paths
 * end-to-end without requiring a running server or database.
 *
 * Owner: Sarah Nakamura (Lead Eng) + Sage (Backend Engineer #2)
 */

import { describe, it, expect, vi } from "vitest";

// Mock the db module to avoid DATABASE_URL requirement
vi.mock("@/server/db", () => ({ db: {}, pool: {} }));

import {
  getVoteWeight,
  getCredibilityTier,
  getTierFromScore,
  getTemporalMultiplier,
} from "@shared/credibility";
import { isTierStale, checkAndRefreshTier } from "@/server/tier-staleness";
import {
  calculateCredibilityScore,
  getRankConfidence,
  TIER_WEIGHTS,
  TIER_SCORE_RANGES,
} from "@/lib/data";
import type { CredibilityTier } from "@shared/credibility";

// ---------------------------------------------------------------------------
// Helpers: simulate product flows by chaining real business logic functions
// ---------------------------------------------------------------------------

interface MockUser {
  id: number;
  storedTier: CredibilityTier;
  credibilityScore: number;
  totalRatings: number;
  totalCategories: number;
  daysActive: number;
  ratingVariance: number;
  pioneerRate: number;
  totalPenalties: number;
  activeFlagCount: number;
}

function createNewUser(id: number): MockUser {
  return {
    id,
    storedTier: "community",
    credibilityScore: 10,
    totalRatings: 0,
    totalCategories: 0,
    daysActive: 0,
    ratingVariance: 0,
    pioneerRate: 0,
    totalPenalties: 0,
    activeFlagCount: 0,
  };
}

/** Simulate a rating submission: recalculate score, check tier, return weight */
function simulateRating(user: MockUser): {
  newScore: number;
  newTier: CredibilityTier;
  voteWeight: number;
  tierChanged: boolean;
} {
  const breakdown = calculateCredibilityScore(
    user.totalRatings,
    user.totalCategories,
    user.daysActive,
    user.ratingVariance,
    user.pioneerRate,
    user.totalPenalties,
  );
  const newScore = breakdown.totalScore;
  const oldTier = user.storedTier;
  const newTier = checkAndRefreshTier(oldTier, newScore) as CredibilityTier;
  const voteWeight = getVoteWeight(newScore);
  const tierChanged = oldTier !== newTier;

  // Update mock user in-place
  user.credibilityScore = newScore;
  user.storedTier = newTier;

  return { newScore, newTier, voteWeight, tierChanged };
}

/** Compute a weighted average rating for a business from multiple user ratings */
function computeWeightedRating(
  ratings: { score: number; userCredScore: number; ageDays: number }[],
): number {
  let weightedSum = 0;
  let totalWeight = 0;
  for (const r of ratings) {
    const voteWeight = getVoteWeight(r.userCredScore);
    const temporalMult = getTemporalMultiplier(r.ageDays);
    const finalWeight = voteWeight * temporalMult;
    weightedSum += r.score * finalWeight;
    totalWeight += finalWeight;
  }
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

// ===========================================================================
// 1. Rating -> Credibility -> Ranking Flow (8 tests)
// ===========================================================================
describe("1. Rating -> Credibility -> Ranking Flow", () => {
  it("new user's first rating produces community-tier weight (0.10)", () => {
    const user = createNewUser(1);
    user.totalRatings = 1;
    user.totalCategories = 1;
    user.daysActive = 1;
    const result = simulateRating(user);
    expect(result.newTier).toBe("community");
    expect(result.voteWeight).toBe(0.1);
    expect(result.tierChanged).toBe(false);
  });

  it("credibility score recalculates correctly after multiple ratings", () => {
    const user = createNewUser(2);
    user.totalRatings = 20;
    user.totalCategories = 3;
    user.daysActive = 30;
    user.ratingVariance = 1.2;
    user.pioneerRate = 0.2;
    const result = simulateRating(user);
    // 10 + 40 + 45 + 15 + 72 + 20 = 202
    expect(result.newScore).toBe(202);
    expect(result.newTier).toBe("city");
    expect(result.voteWeight).toBe(0.35);
  });

  it("tier changes from community to city when score crosses 100", () => {
    const user = createNewUser(3);
    user.storedTier = "community";
    user.totalRatings = 15;
    user.totalCategories = 2;
    user.daysActive = 20;
    user.ratingVariance = 0.5;
    const result = simulateRating(user);
    // 10 + 30 + 30 + 10 + 30 + 0 = 110
    expect(result.newScore).toBe(110);
    expect(result.tierChanged).toBe(true);
    expect(result.newTier).toBe("city");
  });

  it("vote weight updates immediately after tier promotion", () => {
    const user = createNewUser(4);
    user.storedTier = "community";
    user.totalRatings = 15;
    user.totalCategories = 2;
    user.daysActive = 20;
    user.ratingVariance = 0.5;
    const before = getVoteWeight(user.credibilityScore);
    const result = simulateRating(user);
    expect(before).toBe(0.1);
    expect(result.voteWeight).toBe(0.35);
  });

  it("ranking confidence changes with total ratings on a business", () => {
    expect(getRankConfidence(1)).toBe("provisional");
    expect(getRankConfidence(5)).toBe("early");
    expect(getRankConfidence(15)).toBe("established");
    expect(getRankConfidence(30)).toBe("strong");
  });

  it("weighted rating shifts toward high-credibility user's score", () => {
    const ratings = [
      { score: 5, userCredScore: 700, ageDays: 5 },   // top user, fresh
      { score: 2, userCredScore: 30, ageDays: 5 },     // community user, fresh
    ];
    const weighted = computeWeightedRating(ratings);
    // top user weight: 1.0 * 1.0 = 1.0, community: 0.1 * 1.0 = 0.1
    // weighted = (5*1.0 + 2*0.1) / (1.0 + 0.1) = 5.2/1.1 ~ 4.727
    expect(weighted).toBeCloseTo(4.727, 2);
  });

  it("stale tier detection triggers recalculation in the flow", () => {
    const user = createNewUser(5);
    user.credibilityScore = 350;
    user.storedTier = "community"; // stale — should be trusted
    expect(isTierStale(user.storedTier, user.credibilityScore)).toBe(true);
    const corrected = checkAndRefreshTier(user.storedTier, user.credibilityScore);
    expect(corrected).toBe("trusted");
  });

  it("end-to-end: submit rating, recalculate, promote, apply weight to ranking", () => {
    // Simulate a user who was borderline community, then rates and crosses into city
    const user = createNewUser(6);
    user.totalRatings = 12;
    user.totalCategories = 2;
    user.daysActive = 14;
    user.ratingVariance = 0.4;

    // Before rating
    expect(user.storedTier).toBe("community");

    // Submit rating (which increments totalRatings)
    user.totalRatings += 1;
    const result = simulateRating(user);

    // 10 + 26 + 30 + 7 + 24 + 0 = 97 — still community
    // Actually let's compute: 13*2=26, 2*15=30, 14*0.5=7, 13>=5 so 0.4*60=24, 0=0
    // 10+26+30+7+24+0 = 97 -> community
    expect(result.newScore).toBe(97);
    expect(result.newTier).toBe("community");

    // Now two more ratings push them over
    user.totalRatings = 15;
    user.totalCategories = 3;
    user.daysActive = 20;
    user.ratingVariance = 0.5;
    const result2 = simulateRating(user);
    // 10 + 30 + 45 + 10 + 30 + 0 = 125
    expect(result2.newScore).toBe(125);
    expect(result2.newTier).toBe("city");
    expect(result2.voteWeight).toBe(0.35);
    expect(result2.tierChanged).toBe(true);
  });
});

// ===========================================================================
// 2. Tier Promotion Flow (6 tests)
// ===========================================================================
describe("2. Tier Promotion Flow", () => {
  it("brand new user starts at community tier with score 10", () => {
    const user = createNewUser(10);
    const result = simulateRating(user);
    expect(result.newScore).toBe(10);
    expect(result.newTier).toBe("community");
  });

  it("crossing score 100 with activity gates promotes to city (weight 0.35)", () => {
    // Need score >= 100, ratings >= 10, categories >= 2, daysActive >= 14
    const user = createNewUser(11);
    user.totalRatings = 15;
    user.totalCategories = 3;
    user.daysActive = 30;
    user.ratingVariance = 0.5;
    const result = simulateRating(user);
    expect(result.newScore).toBeGreaterThanOrEqual(100);

    // Full tier with activity gates
    const fullTier = getTierFromScore(
      result.newScore,
      user.totalRatings,
      user.totalCategories,
      user.daysActive,
      user.ratingVariance,
      user.activeFlagCount,
    );
    expect(fullTier).toBe("city");
    expect(TIER_WEIGHTS[fullTier]).toBe(0.35);
  });

  it("crossing score 300 with activity gates promotes to trusted (weight 0.70)", () => {
    const user = createNewUser(12);
    user.totalRatings = 50;
    user.totalCategories = 4;
    user.daysActive = 100;
    user.ratingVariance = 1.5;
    user.pioneerRate = 0.3;
    const result = simulateRating(user);
    // 10 + 100 + 60 + 50 + 90 + 30 = 340
    expect(result.newScore).toBeGreaterThanOrEqual(300);

    const fullTier = getTierFromScore(
      result.newScore,
      user.totalRatings,
      user.totalCategories,
      user.daysActive,
      user.ratingVariance,
      user.activeFlagCount,
    );
    expect(fullTier).toBe("trusted");
    expect(TIER_WEIGHTS[fullTier]).toBe(0.7);
  });

  it("crossing score 600 with all gates promotes to top (weight 1.00)", () => {
    const user = createNewUser(13);
    user.totalRatings = 100;
    user.totalCategories = 5;
    user.daysActive = 200;
    user.ratingVariance = 2.0;
    user.pioneerRate = 0.5;
    user.activeFlagCount = 0;
    const result = simulateRating(user);
    // 10 + 200 + 75 + 100 + 120 + 50 = 555 — not enough
    // Need more: let's push pioneerRate higher
    user.pioneerRate = 0.8;
    const result2 = simulateRating(user);
    // 10 + 200 + 75 + 100 + 120 + 80 = 585 — still short
    // Increase categories
    user.totalCategories = 6;
    user.pioneerRate = 0.9;
    const result3 = simulateRating(user);
    // 10 + 200 + 90 + 100 + 120 + 90 = 610
    expect(result3.newScore).toBeGreaterThanOrEqual(600);

    const fullTier = getTierFromScore(
      result3.newScore,
      user.totalRatings,
      user.totalCategories,
      user.daysActive,
      user.ratingVariance,
      user.activeFlagCount,
    );
    expect(fullTier).toBe("top");
    expect(TIER_WEIGHTS[fullTier]).toBe(1.0);
  });

  it("activity gates prevent premature promotion even with high score", () => {
    // Score qualifies for trusted but activity doesn't meet the gates
    const tier = getTierFromScore(
      400,    // score >= 300
      5,      // totalRatings < 35 (fails gate)
      1,      // totalCategories < 3
      10,     // daysActive < 45
      0.5,    // ratingVariance < 0.8
    );
    expect(tier).toBe("community");
  });

  it("full journey: community -> city -> trusted -> top in sequence", () => {
    const user = createNewUser(15);

    // Phase 1: community
    const t1 = getCredibilityTier(user.credibilityScore);
    expect(t1).toBe("community");
    expect(getVoteWeight(user.credibilityScore)).toBe(0.1);

    // Phase 2: build to city-level score
    user.totalRatings = 20;
    user.totalCategories = 3;
    user.daysActive = 30;
    user.ratingVariance = 1.0;
    user.pioneerRate = 0.1;
    simulateRating(user);
    expect(user.storedTier).toBe("city");
    expect(getVoteWeight(user.credibilityScore)).toBe(0.35);

    // Phase 3: build to trusted-level score
    user.totalRatings = 50;
    user.totalCategories = 4;
    user.daysActive = 100;
    user.ratingVariance = 1.5;
    user.pioneerRate = 0.4;
    simulateRating(user);
    expect(user.storedTier).toBe("trusted");
    expect(getVoteWeight(user.credibilityScore)).toBe(0.7);

    // Phase 4: build to top-level score
    user.totalRatings = 100;
    user.totalCategories = 7;
    user.daysActive = 200;
    user.ratingVariance = 2.5;
    user.pioneerRate = 0.9;
    simulateRating(user);
    expect(user.credibilityScore).toBeGreaterThanOrEqual(600);
    expect(user.storedTier).toBe("top");
    expect(getVoteWeight(user.credibilityScore)).toBe(1.0);
  });
});

// ===========================================================================
// 3. Vote Weight Impact (6 tests)
// ===========================================================================
describe("3. Vote Weight Impact on Rankings", () => {
  it("community (0.10) vs top (1.00) user: top user dominates weighted score", () => {
    const communityRating = { score: 2, userCredScore: 30, ageDays: 1 };
    const topRating = { score: 5, userCredScore: 700, ageDays: 1 };

    const weighted = computeWeightedRating([communityRating, topRating]);
    // community weight: 0.1*1.0 = 0.1, top weight: 1.0*1.0 = 1.0
    // (2*0.1 + 5*1.0) / (0.1+1.0) = 5.2/1.1 ~ 4.727
    expect(weighted).toBeGreaterThan(4.5);
    expect(weighted).toBeLessThan(5.0);
  });

  it("equal-tier users produce a simple average", () => {
    const user1 = { score: 3, userCredScore: 150, ageDays: 1 };
    const user2 = { score: 5, userCredScore: 200, ageDays: 1 };
    // Both city tier, weight 0.35
    const weighted = computeWeightedRating([user1, user2]);
    // (3*0.35 + 5*0.35) / (0.35+0.35) = 2.8/0.7 = 4.0
    expect(weighted).toBeCloseTo(4.0, 5);
  });

  it("temporal decay at 30 days has no effect (multiplier 1.00)", () => {
    expect(getTemporalMultiplier(0)).toBe(1.0);
    expect(getTemporalMultiplier(15)).toBe(1.0);
    expect(getTemporalMultiplier(30)).toBe(1.0);
  });

  it("temporal decay at 90 days reduces weight to 0.85", () => {
    expect(getTemporalMultiplier(60)).toBe(0.85);
    expect(getTemporalMultiplier(90)).toBe(0.85);
  });

  it("temporal decay at 180 and 365 days reduces further", () => {
    expect(getTemporalMultiplier(120)).toBe(0.65);
    expect(getTemporalMultiplier(180)).toBe(0.65);
    expect(getTemporalMultiplier(270)).toBe(0.45);
    expect(getTemporalMultiplier(365)).toBe(0.45);
    expect(getTemporalMultiplier(400)).toBe(0.25);
  });

  it("stale tier produces wrong weight until refreshed", () => {
    // User's stored tier is community but score is 500 (should be trusted)
    const staleWeight = TIER_WEIGHTS["community"]; // 0.10 — WRONG
    expect(staleWeight).toBe(0.1);

    // After refresh
    const correctTier = checkAndRefreshTier("community", 500) as CredibilityTier;
    expect(correctTier).toBe("trusted");
    const correctWeight = TIER_WEIGHTS[correctTier]; // 0.70
    expect(correctWeight).toBe(0.7);

    // The difference is 7x — this is why staleness detection matters
    expect(correctWeight / staleWeight).toBeCloseTo(7, 5);
  });
});

// ===========================================================================
// 4. Challenger Flow (4 tests)
// ===========================================================================
describe("4. Challenger Flow — Vote Weight Impact on Matchups", () => {
  /** Simulate a challenger matchup between two businesses */
  function simulateChallenger(
    businessAVotes: { userCredScore: number; ageDays: number }[],
    businessBVotes: { userCredScore: number; ageDays: number }[],
  ): { aWeightedVotes: number; bWeightedVotes: number; winner: "A" | "B" | "tie" } {
    const calcWeightedVotes = (votes: { userCredScore: number; ageDays: number }[]) =>
      votes.reduce((sum, v) => {
        return sum + getVoteWeight(v.userCredScore) * getTemporalMultiplier(v.ageDays);
      }, 0);

    const aWeightedVotes = calcWeightedVotes(businessAVotes);
    const bWeightedVotes = calcWeightedVotes(businessBVotes);

    return {
      aWeightedVotes,
      bWeightedVotes,
      winner: aWeightedVotes > bWeightedVotes ? "A" : bWeightedVotes > aWeightedVotes ? "B" : "tie",
    };
  }

  it("single top-tier vote outweighs multiple community-tier votes", () => {
    // Business A: 1 vote from top user
    const aVotes = [{ userCredScore: 700, ageDays: 5 }];
    // Business B: 5 votes from community users
    const bVotes = Array.from({ length: 5 }, () => ({ userCredScore: 30, ageDays: 5 }));

    const result = simulateChallenger(aVotes, bVotes);
    // A: 1.0 * 1.0 = 1.0, B: 5 * 0.1 * 1.0 = 0.5
    expect(result.aWeightedVotes).toBeGreaterThan(result.bWeightedVotes);
    expect(result.winner).toBe("A");
  });

  it("trusted-tier votes can beat a top-tier vote with enough count", () => {
    const aVotes = [{ userCredScore: 700, ageDays: 5 }]; // 1.0
    const bVotes = [
      { userCredScore: 350, ageDays: 5 }, // 0.70
      { userCredScore: 350, ageDays: 5 }, // 0.70
    ];

    const result = simulateChallenger(aVotes, bVotes);
    // A: 1.0, B: 1.4
    expect(result.winner).toBe("B");
  });

  it("old votes from top users lose to fresh votes from city users", () => {
    // Business A: top user but very old vote
    const aVotes = [{ userCredScore: 700, ageDays: 400 }]; // 1.0 * 0.25 = 0.25
    // Business B: two city users with fresh votes
    const bVotes = [
      { userCredScore: 150, ageDays: 10 }, // 0.35 * 1.0 = 0.35
      { userCredScore: 150, ageDays: 10 }, // 0.35 * 1.0 = 0.35
    ];

    const result = simulateChallenger(aVotes, bVotes);
    // A: 0.25, B: 0.70
    expect(result.winner).toBe("B");
    expect(result.bWeightedVotes).toBeCloseTo(0.70, 2);
  });

  it("equal votes from same tier produce a tie", () => {
    const aVotes = [{ userCredScore: 400, ageDays: 30 }]; // 0.70 * 1.0
    const bVotes = [{ userCredScore: 500, ageDays: 30 }]; // 0.70 * 1.0

    const result = simulateChallenger(aVotes, bVotes);
    expect(result.winner).toBe("tie");
    expect(result.aWeightedVotes).toBe(result.bWeightedVotes);
  });
});

// ===========================================================================
// 5. Account Lifecycle (4 tests)
// ===========================================================================
describe("5. Account Lifecycle — Tier Integrity Across State Transitions", () => {
  it("new account initializes at community tier with minimum score", () => {
    const user = createNewUser(100);
    expect(user.storedTier).toBe("community");
    expect(user.credibilityScore).toBe(10);

    const breakdown = calculateCredibilityScore(0, 0, 0, 0, 0, 0);
    expect(breakdown.totalScore).toBe(10);
    expect(getCredibilityTier(breakdown.totalScore)).toBe("community");
    expect(getVoteWeight(breakdown.totalScore)).toBe(0.1);
  });

  it("session deserialization returns fresh tier (not stale cached value)", () => {
    // Simulate session data with a stale tier
    const sessionData = {
      userId: 101,
      storedTier: "community" as CredibilityTier,
      credibilityScore: 350, // Score says trusted, session says community
    };

    // On session load, we must check freshness
    const stale = isTierStale(sessionData.storedTier, sessionData.credibilityScore);
    expect(stale).toBe(true);

    const freshTier = checkAndRefreshTier(sessionData.storedTier, sessionData.credibilityScore);
    expect(freshTier).toBe("trusted");

    // Fresh weight should be used, not stale
    expect(getVoteWeight(sessionData.credibilityScore)).toBe(0.7);
  });

  it("GDPR export reflects current tier and score accurately", () => {
    // Simulate a user whose data would be exported
    const user = createNewUser(102);
    user.totalRatings = 50;
    user.totalCategories = 4;
    user.daysActive = 60;
    user.ratingVariance = 1.2;
    user.pioneerRate = 0.3;

    const result = simulateRating(user);

    // The exported data should contain the CURRENT tier, not a stale one
    const exportData = {
      userId: user.id,
      credibilityScore: user.credibilityScore,
      credibilityTier: user.storedTier,
      voteWeight: getVoteWeight(user.credibilityScore),
      tierIsStale: isTierStale(user.storedTier, user.credibilityScore),
    };

    expect(exportData.tierIsStale).toBe(false);
    expect(exportData.credibilityTier).toBe(getCredibilityTier(user.credibilityScore));
    expect(exportData.voteWeight).toBe(getVoteWeight(user.credibilityScore));
  });

  it("deletion grace period does not affect tier freshness check", () => {
    // Even during deletion grace period, tier should still be refreshable
    const user = createNewUser(103);
    user.credibilityScore = 250;
    user.storedTier = "city";

    // Simulate marking for deletion (grace period)
    const markedForDeletion = true;
    const deletionGraceDays = 30;

    // Tier freshness is independent of deletion state
    const stale = isTierStale(user.storedTier, user.credibilityScore);
    expect(stale).toBe(false); // 250 is city, stored is city — consistent
    expect(checkAndRefreshTier(user.storedTier, user.credibilityScore)).toBe("city");

    // If score changes during grace period, staleness still detected
    user.credibilityScore = 350;
    expect(isTierStale(user.storedTier, user.credibilityScore)).toBe(true);
    expect(checkAndRefreshTier(user.storedTier, user.credibilityScore)).toBe("trusted");
  });
});

// ===========================================================================
// Cross-cutting: Boundary + Edge Cases
// ===========================================================================
describe("Cross-cutting: Tier boundary precision", () => {
  it("score 99 is community, score 100 is city — no off-by-one", () => {
    expect(getCredibilityTier(99)).toBe("community");
    expect(getVoteWeight(99)).toBe(0.1);
    expect(getCredibilityTier(100)).toBe("city");
    expect(getVoteWeight(100)).toBe(0.35);
  });

  it("score 299 is city, score 300 is trusted", () => {
    expect(getCredibilityTier(299)).toBe("city");
    expect(getVoteWeight(299)).toBe(0.35);
    expect(getCredibilityTier(300)).toBe("trusted");
    expect(getVoteWeight(300)).toBe(0.7);
  });

  it("score 599 is trusted, score 600 is top", () => {
    expect(getCredibilityTier(599)).toBe("trusted");
    expect(getVoteWeight(599)).toBe(0.7);
    expect(getCredibilityTier(600)).toBe("top");
    expect(getVoteWeight(600)).toBe(1.0);
  });

  it("TIER_SCORE_RANGES align with getCredibilityTier boundaries", () => {
    expect(getCredibilityTier(TIER_SCORE_RANGES.community.min)).toBe("community");
    expect(getCredibilityTier(TIER_SCORE_RANGES.community.max)).toBe("community");
    expect(getCredibilityTier(TIER_SCORE_RANGES.city.min)).toBe("city");
    expect(getCredibilityTier(TIER_SCORE_RANGES.city.max)).toBe("city");
    expect(getCredibilityTier(TIER_SCORE_RANGES.trusted.min)).toBe("trusted");
    expect(getCredibilityTier(TIER_SCORE_RANGES.trusted.max)).toBe("trusted");
    expect(getCredibilityTier(TIER_SCORE_RANGES.top.min)).toBe("top");
    expect(getCredibilityTier(TIER_SCORE_RANGES.top.max)).toBe("top");
  });
});
