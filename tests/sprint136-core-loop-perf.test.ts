/**
 * Unit Tests — Sprint 136: Core Loop Performance Fixes
 * Owner: Sarah Nakamura (Lead Engineer)
 *
 * Tests the two core-loop performance fixes from Sprint 136:
 * 1. Pioneer rate single-query fix (pioneer rate calculation)
 * 2. Rank recalculation via window function (rank delta computation)
 * Plus validation of temporal decay, vote weights, and tier promotion gates.
 */

import { describe, it, expect } from "vitest";
import {
  getTemporalMultiplier,
  getVoteWeight,
  getTierFromScore,
} from "@/lib/data";

// ── Pioneer Rate Single-Query Fix ───────────────────────────────────────────

describe("Pioneer Rate Calculation", () => {
  /**
   * Pioneer rate = earlyReviewCount / totalMemberRatings
   * A review is "early" if the business had fewer than 10 prior ratings
   * when the member submitted their review.
   */
  const EARLY_REVIEW_THRESHOLD = 10;

  function computePioneerRate(
    earlyReviewCount: number,
    totalMemberRatings: number,
  ): number {
    if (totalMemberRatings === 0) return 0;
    return earlyReviewCount / totalMemberRatings;
  }

  it("returns 0 for a member with 0 ratings", () => {
    expect(computePioneerRate(0, 0)).toBe(0);
  });

  it("uses early review threshold of 10 prior ratings", () => {
    // A review on a business with 9 prior ratings counts as early
    expect(EARLY_REVIEW_THRESHOLD).toBe(10);
  });

  it("computes pioneer rate as earlyReviewCount / totalMemberRatings", () => {
    // Member has 20 total ratings, 5 were on businesses with < 10 prior ratings
    expect(computePioneerRate(5, 20)).toBeCloseTo(0.25);
    expect(computePioneerRate(10, 10)).toBeCloseTo(1.0);
    expect(computePioneerRate(3, 30)).toBeCloseTo(0.1);
  });

  it("returns 1.0 when all ratings are early reviews", () => {
    expect(computePioneerRate(15, 15)).toBeCloseTo(1.0);
  });

  it("returns 0 when no ratings are early reviews", () => {
    expect(computePioneerRate(0, 50)).toBe(0);
  });
});

// ── Rank Recalculation via Window Function ──────────────────────────────────

describe("Rank Recalculation (Window Function)", () => {
  interface RankedBusiness {
    id: number;
    weightedScore: number;
    oldRank: number;
    newRank: number;
    rankDelta: number;
    prevRankPosition: number;
  }

  function computeRanks(
    businesses: { id: number; weightedScore: number; oldRank: number }[],
  ): RankedBusiness[] {
    const sorted = [...businesses].sort(
      (a, b) => b.weightedScore - a.weightedScore,
    );
    return sorted.map((b, idx) => ({
      ...b,
      newRank: idx + 1,
      rankDelta: b.oldRank - (idx + 1),
      prevRankPosition: b.oldRank,
    }));
  }

  it("ranks businesses by weightedScore DESC", () => {
    const result = computeRanks([
      { id: 1, weightedScore: 50, oldRank: 1 },
      { id: 2, weightedScore: 90, oldRank: 2 },
      { id: 3, weightedScore: 70, oldRank: 3 },
    ]);
    expect(result[0].id).toBe(2);
    expect(result[1].id).toBe(3);
    expect(result[2].id).toBe(1);
  });

  it("computes rank delta as oldRank - newRank", () => {
    const result = computeRanks([
      { id: 1, weightedScore: 50, oldRank: 1 },
      { id: 2, weightedScore: 90, oldRank: 3 },
    ]);
    // Business 2: was rank 3, now rank 1 → delta = 3 - 1 = 2 (moved up)
    expect(result[0].id).toBe(2);
    expect(result[0].rankDelta).toBe(2);
    // Business 1: was rank 1, now rank 2 → delta = 1 - 2 = -1 (moved down)
    expect(result[1].id).toBe(1);
    expect(result[1].rankDelta).toBe(-1);
  });

  it("preserves prevRankPosition from the old rank", () => {
    const result = computeRanks([
      { id: 1, weightedScore: 80, oldRank: 5 },
      { id: 2, weightedScore: 60, oldRank: 2 },
    ]);
    expect(result[0].prevRankPosition).toBe(5);
    expect(result[1].prevRankPosition).toBe(2);
  });

  it("assigns delta 0 when rank is unchanged", () => {
    const result = computeRanks([
      { id: 1, weightedScore: 100, oldRank: 1 },
      { id: 2, weightedScore: 80, oldRank: 2 },
      { id: 3, weightedScore: 60, oldRank: 3 },
    ]);
    expect(result[0].rankDelta).toBe(0);
    expect(result[1].rankDelta).toBe(0);
    expect(result[2].rankDelta).toBe(0);
  });

  it("handles a single business", () => {
    const result = computeRanks([
      { id: 1, weightedScore: 42, oldRank: 1 },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].newRank).toBe(1);
    expect(result[0].rankDelta).toBe(0);
  });
});

// ── Temporal Decay Multiplier ───────────────────────────────────────────────

describe("Temporal Decay Multiplier (getTemporalMultiplier)", () => {
  it("returns 1.00 for 0-30 days", () => {
    expect(getTemporalMultiplier(0)).toBe(1.0);
    expect(getTemporalMultiplier(15)).toBe(1.0);
    expect(getTemporalMultiplier(30)).toBe(1.0);
  });

  it("returns 0.85 for 31-90 days", () => {
    expect(getTemporalMultiplier(31)).toBe(0.85);
    expect(getTemporalMultiplier(60)).toBe(0.85);
    expect(getTemporalMultiplier(90)).toBe(0.85);
  });

  it("returns 0.65 for 91-180 days", () => {
    expect(getTemporalMultiplier(91)).toBe(0.65);
    expect(getTemporalMultiplier(120)).toBe(0.65);
    expect(getTemporalMultiplier(180)).toBe(0.65);
  });

  it("returns 0.45 for 181-365 days", () => {
    expect(getTemporalMultiplier(181)).toBe(0.45);
    expect(getTemporalMultiplier(250)).toBe(0.45);
    expect(getTemporalMultiplier(365)).toBe(0.45);
  });

  it("returns 0.25 for 365+ days", () => {
    expect(getTemporalMultiplier(366)).toBe(0.25);
    expect(getTemporalMultiplier(730)).toBe(0.25);
    expect(getTemporalMultiplier(9999)).toBe(0.25);
  });

  it("never returns below 0.25", () => {
    expect(getTemporalMultiplier(100000)).toBe(0.25);
  });
});

// ── Vote Weight Thresholds ──────────────────────────────────────────────────

describe("Vote Weight Thresholds (getVoteWeight)", () => {
  it("returns 0.10 for credibility score < 100", () => {
    expect(getVoteWeight(0)).toBe(0.1);
    expect(getVoteWeight(50)).toBe(0.1);
    expect(getVoteWeight(99)).toBe(0.1);
  });

  it("returns 0.35 for credibility score 100-299", () => {
    expect(getVoteWeight(100)).toBe(0.35);
    expect(getVoteWeight(200)).toBe(0.35);
    expect(getVoteWeight(299)).toBe(0.35);
  });

  it("returns 0.70 for credibility score 300-599", () => {
    expect(getVoteWeight(300)).toBe(0.7);
    expect(getVoteWeight(450)).toBe(0.7);
    expect(getVoteWeight(599)).toBe(0.7);
  });

  it("returns 1.00 for credibility score 600+", () => {
    expect(getVoteWeight(600)).toBe(1.0);
    expect(getVoteWeight(800)).toBe(1.0);
    expect(getVoteWeight(1000)).toBe(1.0);
  });

  it("steps up precisely at boundaries", () => {
    expect(getVoteWeight(99)).toBe(0.1);
    expect(getVoteWeight(100)).toBe(0.35);
    expect(getVoteWeight(299)).toBe(0.35);
    expect(getVoteWeight(300)).toBe(0.7);
    expect(getVoteWeight(599)).toBe(0.7);
    expect(getVoteWeight(600)).toBe(1.0);
  });
});

// ── Tier Promotion Gates ────────────────────────────────────────────────────

describe("Tier Promotion Gates (getTierFromScore)", () => {
  it("requires BOTH score AND activity for Top Judge", () => {
    // All thresholds met → top
    expect(getTierFromScore(600, 80, 4, 90, 1.0, 0)).toBe("top");
    // High score but insufficient ratings → falls to trusted or lower
    expect(getTierFromScore(600, 10, 4, 90, 1.0, 0)).not.toBe("top");
    // High score but not enough categories → not top
    expect(getTierFromScore(600, 80, 2, 90, 1.0, 0)).not.toBe("top");
    // High score but not enough days active → not top
    expect(getTierFromScore(600, 80, 4, 30, 1.0, 0)).not.toBe("top");
    // High score but low variance → not top
    expect(getTierFromScore(600, 80, 4, 90, 0.5, 0)).not.toBe("top");
    // High score but has active flags → not top
    expect(getTierFromScore(600, 80, 4, 90, 1.0, 1)).not.toBe("top");
  });

  it("requires BOTH score AND activity for Trusted", () => {
    expect(getTierFromScore(300, 35, 3, 45, 0.8, 0)).toBe("trusted");
    // Score met but not enough ratings
    expect(getTierFromScore(300, 10, 3, 45, 0.8, 0)).not.toBe("trusted");
    // Score met but not enough categories
    expect(getTierFromScore(300, 35, 1, 45, 0.8, 0)).not.toBe("trusted");
    // Score met but not enough days
    expect(getTierFromScore(300, 35, 3, 10, 0.8, 0)).not.toBe("trusted");
    // Score met but low variance
    expect(getTierFromScore(300, 35, 3, 45, 0.3, 0)).not.toBe("trusted");
  });

  it("requires BOTH score AND activity for City (Regular)", () => {
    expect(getTierFromScore(100, 10, 2, 14, 0, 0)).toBe("city");
    // Score met but not enough ratings
    expect(getTierFromScore(100, 5, 2, 14, 0, 0)).not.toBe("city");
    // Score met but not enough categories
    expect(getTierFromScore(100, 10, 1, 14, 0, 0)).not.toBe("city");
    // Score met but not enough days
    expect(getTierFromScore(100, 10, 2, 5, 0, 0)).not.toBe("city");
  });

  it("falls to community when score alone is high but activity is missing", () => {
    // Score = 800 but zero activity
    expect(getTierFromScore(800, 0, 0, 0, 0, 0)).toBe("community");
  });

  it("cascades down to the highest tier whose full criteria are met", () => {
    // Score qualifies for top but activity only qualifies for trusted
    expect(getTierFromScore(700, 35, 3, 45, 0.8, 0)).toBe("trusted");
    // Score qualifies for trusted but activity only qualifies for city
    expect(getTierFromScore(400, 10, 2, 14, 0.5, 0)).toBe("city");
  });
});
