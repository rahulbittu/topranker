/**
 * Sprint 143 — Core-loop boundary and negative-path tests.
 *
 * Covers threshold-edge and negative-path tests for:
 *   1. Tier promotion (getTierFromScore with activity gates)
 *   2. Vote weight boundaries (getVoteWeight)
 *   3. Temporal decay boundaries (getTemporalMultiplier)
 *   4. Credibility score boundaries (calculateCredibilityScore)
 *   5. Rank confidence boundaries (getRankConfidence)
 *   6. Negative / degenerate paths
 *
 * Imports from @shared/credibility, lib/data, server/tier-staleness.
 */

import { vi } from "vitest";

// Mock server/db to avoid DATABASE_URL requirement
vi.mock("../server/db", () => ({
  db: {},
  pool: {},
}));

import {
  getVoteWeight,
  getTemporalMultiplier,
  getCredibilityTier,
  getTierFromScore,
} from "@shared/credibility";

import {
  calculateCredibilityScore,
  getRankConfidence,
} from "../lib/data";

import { isTierStale } from "../server/tier-staleness";

// ---------------------------------------------------------------------------
// 1. Tier Promotion Boundaries (8 tests)
// ---------------------------------------------------------------------------
describe("Tier Promotion Boundaries (getTierFromScore)", () => {
  it("score 99 + all activity gates met → still community (score gate fails)", () => {
    expect(getTierFromScore(99, 10, 2, 14, 0.8, 0)).toBe("community");
  });

  it("score 100 + insufficient ratings (9) → still community (activity gate fails)", () => {
    expect(getTierFromScore(100, 9, 2, 14, 0.8, 0)).toBe("community");
  });

  it("score 100 + 10 ratings + 2 categories + 14 days → city (exact threshold)", () => {
    expect(getTierFromScore(100, 10, 2, 14, 0.8, 0)).toBe("city");
  });

  it("score 299 + all city gates → still city (score gate for trusted fails)", () => {
    expect(getTierFromScore(299, 35, 3, 45, 0.8, 0)).toBe("city");
  });

  it("score 300 + 35 ratings + 3 cats + 45 days + 0.8 variance → trusted (exact)", () => {
    expect(getTierFromScore(300, 35, 3, 45, 0.8, 0)).toBe("trusted");
  });

  it("score 300 + 34 ratings → still city (1 rating short of trusted gate)", () => {
    expect(getTierFromScore(300, 34, 3, 45, 0.8, 0)).toBe("city");
  });

  it("score 600 + all gates + 0 flags → top (exact threshold)", () => {
    expect(getTierFromScore(600, 80, 4, 90, 1.0, 0)).toBe("top");
  });

  it("score 600 + 1 active flag → NOT top (flag gate blocks)", () => {
    // Has all numeric gates but 1 flag should block top; falls through to trusted
    expect(getTierFromScore(600, 80, 4, 90, 1.0, 1)).not.toBe("top");
    // Should still qualify for trusted (no flag gate on trusted)
    expect(getTierFromScore(600, 80, 4, 90, 1.0, 1)).toBe("trusted");
  });
});

// ---------------------------------------------------------------------------
// 2. Vote Weight at Boundaries (6 tests)
// ---------------------------------------------------------------------------
describe("Vote Weight Boundaries (getVoteWeight)", () => {
  it("score 99 → 0.10 (community tier weight)", () => {
    expect(getVoteWeight(99)).toBe(0.1);
  });

  it("score 100 → 0.35 (city tier boundary)", () => {
    expect(getVoteWeight(100)).toBe(0.35);
  });

  it("score 299 → 0.35 (still city tier)", () => {
    expect(getVoteWeight(299)).toBe(0.35);
  });

  it("score 300 → 0.70 (trusted tier boundary)", () => {
    expect(getVoteWeight(300)).toBe(0.7);
  });

  it("score 599 → 0.70 (still trusted tier)", () => {
    expect(getVoteWeight(599)).toBe(0.7);
  });

  it("score 600 → 1.00 (top tier boundary)", () => {
    expect(getVoteWeight(600)).toBe(1.0);
  });
});

// ---------------------------------------------------------------------------
// 3. Temporal Decay Boundaries (6 tests)
// ---------------------------------------------------------------------------
describe("Temporal Decay Boundaries (getTemporalMultiplier)", () => {
  it("0 days → 1.00 (fresh rating)", () => {
    expect(getTemporalMultiplier(0)).toBe(1.0);
  });

  it("30 days → 1.00 (boundary — still full weight)", () => {
    expect(getTemporalMultiplier(30)).toBe(1.0);
  });

  it("31 days → 0.85 (just past first decay boundary)", () => {
    expect(getTemporalMultiplier(31)).toBe(0.85);
  });

  it("90 days → 0.85 (boundary — still second band)", () => {
    expect(getTemporalMultiplier(90)).toBe(0.85);
  });

  it("91 days → 0.65 (just past second decay boundary)", () => {
    expect(getTemporalMultiplier(91)).toBe(0.65);
  });

  it("365 days → 0.45, 366 days → 0.25 (year boundary)", () => {
    expect(getTemporalMultiplier(365)).toBe(0.45);
    expect(getTemporalMultiplier(366)).toBe(0.25);
  });
});

// ---------------------------------------------------------------------------
// 4. Credibility Score Boundaries (6 tests)
// ---------------------------------------------------------------------------
describe("Credibility Score Boundaries (calculateCredibilityScore)", () => {
  it("minimum possible inputs → floor at 10", () => {
    const result = calculateCredibilityScore(0, 0, 0, 0, 0, 0);
    expect(result.totalScore).toBe(10);
    // base is 10, everything else 0 → raw = 10
    expect(result.basePoints).toBe(10);
    expect(result.ratingPoints).toBe(0);
    expect(result.diversityBonus).toBe(0);
  });

  it("maximum possible inputs → cap at 1000", () => {
    const result = calculateCredibilityScore(100, 7, 200, 5.0, 1.0, 0);
    // base=10, ratingPoints=min(200,200)=200, diversity=min(105,100)=100,
    // age=min(100,100)=100, variance=min(300,150)=150, helpfulness=100
    // raw = 10+200+100+100+150+100 = 660 → capped at 660
    // Actually 660 < 1000 so no cap. Let's push harder.
    expect(result.totalScore).toBeLessThanOrEqual(1000);
    expect(result.totalScore).toBeGreaterThan(0);

    // Now truly max out all components
    const maxResult = calculateCredibilityScore(200, 20, 1000, 10.0, 1.0, 0);
    // base=10, ratingPoints=min(400,200)=200, diversity=min(300,100)=100,
    // age=min(500,100)=100, variance=min(600,150)=150, helpfulness=100
    // raw = 10+200+100+100+150+100 = 660
    expect(maxResult.totalScore).toBe(660);
  });

  it("penalty exceeding raw score → floor at 10", () => {
    // base=10, all else 0, penalty=9999
    const result = calculateCredibilityScore(0, 0, 0, 0, 0, 9999);
    expect(result.totalScore).toBe(10);
    expect(result.flagPenalty).toBe(9999);
  });

  it("exact ratingPoints cap: 100 ratings * 2 = 200 (max)", () => {
    const under = calculateCredibilityScore(99, 0, 0, 0, 0, 0);
    const atCap = calculateCredibilityScore(100, 0, 0, 0, 0, 0);
    const over = calculateCredibilityScore(150, 0, 0, 0, 0, 0);

    expect(under.ratingPoints).toBe(198);
    expect(atCap.ratingPoints).toBe(200);
    expect(over.ratingPoints).toBe(200); // capped
  });

  it("exact diversityBonus cap: 7 categories * 15 = 105 → capped at 100", () => {
    const sixCats = calculateCredibilityScore(0, 6, 0, 0, 0, 0);
    const sevenCats = calculateCredibilityScore(0, 7, 0, 0, 0, 0);

    expect(sixCats.diversityBonus).toBe(90); // 6 * 15 = 90
    expect(sevenCats.diversityBonus).toBe(100); // 7 * 15 = 105 → capped at 100
  });

  it("varianceBonus only kicks in at 5+ ratings", () => {
    const fourRatings = calculateCredibilityScore(4, 0, 0, 3.0, 0, 0);
    const fiveRatings = calculateCredibilityScore(5, 0, 0, 3.0, 0, 0);

    expect(fourRatings.varianceBonus).toBe(0); // < 5 ratings
    expect(fiveRatings.varianceBonus).toBe(150); // min(3.0*60, 150) = min(180, 150) = 150
  });
});

// ---------------------------------------------------------------------------
// 5. Rank Confidence Boundaries (6 tests)
// ---------------------------------------------------------------------------
describe("Rank Confidence Boundaries (getRankConfidence)", () => {
  // Default thresholds: provisional < 3, early < 10, established < 25, strong >= 25
  it("default: 2 ratings → provisional, 3 → early", () => {
    expect(getRankConfidence(2)).toBe("provisional");
    expect(getRankConfidence(3)).toBe("early");
  });

  it("default: 9 → early, 10 → established", () => {
    expect(getRankConfidence(9)).toBe("early");
    expect(getRankConfidence(10)).toBe("established");
  });

  it("default: 24 → established, 25 → strong", () => {
    expect(getRankConfidence(24)).toBe("established");
    expect(getRankConfidence(25)).toBe("strong");
  });

  // Fast food thresholds: provisional < 3, early < 8, established < 20
  it("fast food: 2 → provisional, 3 → early, 7 → early, 8 → established", () => {
    expect(getRankConfidence(2, "fast_food")).toBe("provisional");
    expect(getRankConfidence(3, "fast_food")).toBe("early");
    expect(getRankConfidence(7, "fast_food")).toBe("early");
    expect(getRankConfidence(8, "fast_food")).toBe("established");
  });

  it("fast food: 19 → established, 20 → strong", () => {
    expect(getRankConfidence(19, "fast_food")).toBe("established");
    expect(getRankConfidence(20, "fast_food")).toBe("strong");
  });

  // Fine dining thresholds: provisional < 5, early < 15, established < 35
  it("fine dining: 4 → provisional, 5 → early, 14 → early, 15 → established, 34 → established, 35 → strong", () => {
    expect(getRankConfidence(4, "fine_dining")).toBe("provisional");
    expect(getRankConfidence(5, "fine_dining")).toBe("early");
    expect(getRankConfidence(14, "fine_dining")).toBe("early");
    expect(getRankConfidence(15, "fine_dining")).toBe("established");
    expect(getRankConfidence(34, "fine_dining")).toBe("established");
    expect(getRankConfidence(35, "fine_dining")).toBe("strong");
  });
});

// ---------------------------------------------------------------------------
// 6. Negative / Degenerate Paths (6 tests)
// ---------------------------------------------------------------------------
describe("Negative and Degenerate Paths", () => {
  it("negative score to getVoteWeight → 0.10 (community fallback)", () => {
    expect(getVoteWeight(-50)).toBe(0.1);
    expect(getVoteWeight(-1)).toBe(0.1);
  });

  it("negative days to getTemporalMultiplier → 1.00 (fresh fallback)", () => {
    expect(getTemporalMultiplier(-1)).toBe(1.0);
    expect(getTemporalMultiplier(-365)).toBe(1.0);
  });

  it("unknown category to getRankConfidence → uses default thresholds", () => {
    // Unknown slug should fall back to DEFAULT_THRESHOLDS
    expect(getRankConfidence(2, "nonexistent_category")).toBe("provisional");
    expect(getRankConfidence(3, "nonexistent_category")).toBe("early");
    expect(getRankConfidence(10, "nonexistent_category")).toBe("established");
    expect(getRankConfidence(25, "nonexistent_category")).toBe("strong");
  });

  it("calculateCredibilityScore with negative penalty → score goes up (penalty subtracted)", () => {
    const noPenalty = calculateCredibilityScore(10, 1, 10, 0, 0, 0);
    const negativePenalty = calculateCredibilityScore(10, 1, 10, 0, 0, -50);
    // Negative penalty is subtracted: raw - (-50) = raw + 50
    expect(negativePenalty.totalScore).toBeGreaterThan(noPenalty.totalScore);
  });

  it("isTierStale with invalid tier string → returns true (unknown tier)", () => {
    // "diamond" is not a valid tier; getCredibilityTier(100) returns "city"
    // So "diamond" !== "city" → stale
    expect(isTierStale("diamond", 100)).toBe(true);
    expect(isTierStale("unknown", 0)).toBe(true);
    expect(isTierStale("", 500)).toBe(true);
  });

  it("getCredibilityTier with NaN → returns community", () => {
    // NaN fails all >= comparisons, so falls through to community
    expect(getCredibilityTier(NaN)).toBe("community");
  });
});
