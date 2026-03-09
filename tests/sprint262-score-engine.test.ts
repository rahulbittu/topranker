/**
 * Sprint 262 — Score Calculation Engine (Rating Integrity Phase 1b, Part 6)
 *
 * Validates the 8-step score calculation:
 *   1. Static analysis — exports, constants
 *   2. Composite score calculation
 *   3. Effective weight calculation
 *   4. Temporal decay
 *   5. Restaurant score calculation
 *   6. Leaderboard threshold
 *   7. Tiebreaker
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

import {
  computeComposite,
  computeEffectiveWeight,
  computeDecayFactor,
  computeRestaurantScore,
  meetsLeaderboardThreshold,
  tiebreaker,
  DINE_IN_WEIGHTS,
  DELIVERY_WEIGHTS,
  TAKEAWAY_WEIGHTS,
  DECAY_LAMBDA,
} from "../shared/score-engine";

import type { RatingInput, DimensionScores, VisitType } from "../shared/score-engine";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// Helper: build a RatingInput with sensible defaults
function makeRating(overrides: Partial<RatingInput> & { visitType: VisitType; dimensions: DimensionScores }): RatingInput {
  return {
    credibilityWeight: 1.00,
    verificationBoost: 0.00,
    gamingMultiplier: 1.00,
    daysSinceRating: 0,
    ...overrides,
  };
}

// ===========================================================================
// 1. Static analysis (8 tests)
// ===========================================================================
describe("Score engine — static analysis", () => {
  const src = readFile("shared/score-engine.ts");

  it("file exists", () => {
    expect(src.length).toBeGreaterThan(0);
  });

  it("exports computeComposite", () => {
    expect(typeof computeComposite).toBe("function");
  });

  it("exports computeEffectiveWeight", () => {
    expect(typeof computeEffectiveWeight).toBe("function");
  });

  it("exports computeDecayFactor", () => {
    expect(typeof computeDecayFactor).toBe("function");
  });

  it("exports computeRestaurantScore", () => {
    expect(typeof computeRestaurantScore).toBe("function");
  });

  it("exports meetsLeaderboardThreshold", () => {
    expect(typeof meetsLeaderboardThreshold).toBe("function");
  });

  it("exports tiebreaker", () => {
    expect(typeof tiebreaker).toBe("function");
  });

  it("exports weight constants and DECAY_LAMBDA", () => {
    expect(DINE_IN_WEIGHTS).toBeDefined();
    expect(DELIVERY_WEIGHTS).toBeDefined();
    expect(TAKEAWAY_WEIGHTS).toBeDefined();
    expect(DECAY_LAMBDA).toBe(0.003);
  });
});

// ===========================================================================
// 2. Composite score calculation (8 tests)
// ===========================================================================
describe("Composite score calculation", () => {
  it("dine-in: food=8, service=7, vibe=9 → 8.0", () => {
    const score = computeComposite("dine_in", { foodScore: 8, serviceScore: 7, vibeScore: 9 });
    expect(score).toBeCloseTo(8.0, 5);
  });

  it("delivery: food=8, packaging=6, value=7 → 7.35", () => {
    const score = computeComposite("delivery", { foodScore: 8, packagingScore: 6, valueScore: 7 });
    expect(score).toBeCloseTo(7.35, 5);
  });

  it("takeaway: food=9, waitTime=8, value=7 → 8.50", () => {
    // 9*0.65 + 8*0.20 + 7*0.15 = 5.85 + 1.60 + 1.05 = 8.50
    const score = computeComposite("takeaway", { foodScore: 9, waitTimeScore: 8, valueScore: 7 });
    expect(score).toBeCloseTo(8.50, 5);
  });

  it("missing dimension defaults to 0", () => {
    // dine_in with only food → service=0, vibe=0
    const score = computeComposite("dine_in", { foodScore: 8 });
    expect(score).toBeCloseTo(8 * 0.50, 5); // 4.0
  });

  it("perfect scores (all 10s) for each visit type", () => {
    expect(computeComposite("dine_in", { foodScore: 10, serviceScore: 10, vibeScore: 10 })).toBeCloseTo(10.0, 5);
    expect(computeComposite("delivery", { foodScore: 10, packagingScore: 10, valueScore: 10 })).toBeCloseTo(10.0, 5);
    expect(computeComposite("takeaway", { foodScore: 10, waitTimeScore: 10, valueScore: 10 })).toBeCloseTo(10.0, 5);
  });

  it("all minimum scores (all 1s) for each visit type", () => {
    expect(computeComposite("dine_in", { foodScore: 1, serviceScore: 1, vibeScore: 1 })).toBeCloseTo(1.0, 5);
    expect(computeComposite("delivery", { foodScore: 1, packagingScore: 1, valueScore: 1 })).toBeCloseTo(1.0, 5);
    expect(computeComposite("takeaway", { foodScore: 1, waitTimeScore: 1, valueScore: 1 })).toBeCloseTo(1.0, 5);
  });

  it("composite is between 1 and 10 for valid inputs", () => {
    // All dimensions at boundaries
    const low = computeComposite("dine_in", { foodScore: 1, serviceScore: 1, vibeScore: 1 });
    const high = computeComposite("dine_in", { foodScore: 10, serviceScore: 10, vibeScore: 10 });
    expect(low).toBeGreaterThanOrEqual(1);
    expect(high).toBeLessThanOrEqual(10);
  });

  it("food score always has the highest weight", () => {
    expect(DINE_IN_WEIGHTS.food).toBeGreaterThan(DINE_IN_WEIGHTS.service);
    expect(DINE_IN_WEIGHTS.food).toBeGreaterThan(DINE_IN_WEIGHTS.vibe);
    expect(DELIVERY_WEIGHTS.food).toBeGreaterThan(DELIVERY_WEIGHTS.packaging);
    expect(DELIVERY_WEIGHTS.food).toBeGreaterThan(DELIVERY_WEIGHTS.value);
    expect(TAKEAWAY_WEIGHTS.food).toBeGreaterThan(TAKEAWAY_WEIGHTS.waitTime);
    expect(TAKEAWAY_WEIGHTS.food).toBeGreaterThan(TAKEAWAY_WEIGHTS.value);
  });
});

// ===========================================================================
// 3. Effective weight calculation (6 tests)
// ===========================================================================
describe("Effective weight calculation", () => {
  it("community tier (0.10) with no boost = 0.10", () => {
    expect(computeEffectiveWeight(0.10, 0.00, 1.00)).toBeCloseTo(0.10, 5);
  });

  it("top tier (1.00) with no boost = 1.00", () => {
    expect(computeEffectiveWeight(1.00, 0.00, 1.00)).toBeCloseTo(1.00, 5);
  });

  it("community tier (0.10) with photo boost (0.15) = 0.115", () => {
    expect(computeEffectiveWeight(0.10, 0.15, 1.00)).toBeCloseTo(0.115, 5);
  });

  it("top tier (1.00) with max boost (0.50) = 1.50", () => {
    expect(computeEffectiveWeight(1.00, 0.50, 1.00)).toBeCloseTo(1.50, 5);
  });

  it("boost capped at 0.50 even if higher passed", () => {
    // 0.80 boost should be capped to 0.50
    expect(computeEffectiveWeight(1.00, 0.80, 1.00)).toBeCloseTo(1.50, 5);
  });

  it("gaming multiplier 0.05 reduces weight dramatically", () => {
    // 1.00 × (1+0) × 0.05 = 0.05
    const weight = computeEffectiveWeight(1.00, 0.00, 0.05);
    expect(weight).toBeCloseTo(0.05, 5);
  });
});

// ===========================================================================
// 4. Temporal decay (6 tests)
// ===========================================================================
describe("Temporal decay", () => {
  it("day 0 = 1.00", () => {
    expect(computeDecayFactor(0)).toBe(1.00);
  });

  it("~90 days ≈ 0.76", () => {
    const decay = computeDecayFactor(90);
    expect(decay).toBeCloseTo(Math.exp(-0.003 * 90), 5);
    expect(Math.abs(decay - 0.76)).toBeLessThan(0.05);
  });

  it("~180 days ≈ 0.58", () => {
    const decay = computeDecayFactor(180);
    expect(decay).toBeCloseTo(Math.exp(-0.003 * 180), 5);
    expect(Math.abs(decay - 0.58)).toBeLessThan(0.05);
  });

  it("~365 days ≈ 0.33", () => {
    const decay = computeDecayFactor(365);
    expect(decay).toBeCloseTo(Math.exp(-0.003 * 365), 5);
    expect(Math.abs(decay - 0.33)).toBeLessThan(0.05);
  });

  it("~730 days ≈ 0.11", () => {
    const decay = computeDecayFactor(730);
    expect(decay).toBeCloseTo(Math.exp(-0.003 * 730), 5);
    expect(Math.abs(decay - 0.11)).toBeLessThan(0.05);
  });

  it("decay never reaches exactly 0", () => {
    // Even at 10 years
    expect(computeDecayFactor(3650)).toBeGreaterThan(0);
  });
});

// ===========================================================================
// 5. Restaurant score calculation (8 tests)
// ===========================================================================
describe("Restaurant score calculation", () => {
  it("single dine-in rating returns correct score", () => {
    const ratings: RatingInput[] = [
      makeRating({
        visitType: "dine_in",
        dimensions: { foodScore: 8, serviceScore: 7, vibeScore: 9 },
      }),
    ];
    const result = computeRestaurantScore(ratings);
    expect(result.overallScore).toBeCloseTo(8.0, 3);
    expect(result.dineInScore).toBeCloseTo(8.0, 3);
    expect(result.deliveryScore).toBeNull();
    expect(result.takeawayScore).toBeNull();
  });

  it("multiple ratings weighted by credibility", () => {
    const ratings: RatingInput[] = [
      makeRating({
        visitType: "dine_in",
        dimensions: { foodScore: 10, serviceScore: 10, vibeScore: 10 },
        credibilityWeight: 1.00, // top tier
      }),
      makeRating({
        visitType: "dine_in",
        dimensions: { foodScore: 2, serviceScore: 2, vibeScore: 2 },
        credibilityWeight: 0.10, // community tier
      }),
    ];
    const result = computeRestaurantScore(ratings);
    // Top tier rating (10.0) has 10x the weight of community (2.0)
    // Expected: (10*1 + 2*0.1) / (1 + 0.1) = 10.2/1.1 ≈ 9.27
    expect(result.overallScore).toBeGreaterThan(9.0);
    expect(result.overallScore).toBeLessThan(10.0);
  });

  it("mix of dine-in and delivery computes separate scores + overall", () => {
    const ratings: RatingInput[] = [
      makeRating({
        visitType: "dine_in",
        dimensions: { foodScore: 8, serviceScore: 7, vibeScore: 9 },
      }),
      makeRating({
        visitType: "delivery",
        dimensions: { foodScore: 6, packagingScore: 5, valueScore: 7 },
      }),
    ];
    const result = computeRestaurantScore(ratings);
    expect(result.dineInScore).toBeCloseTo(8.0, 3);
    expect(result.deliveryScore).toBeCloseTo(5.90, 2); // 6*0.6 + 5*0.25 + 7*0.15
    expect(result.takeawayScore).toBeNull();
    expect(result.overallScore).toBeDefined();
    expect(result.overallScore).toBeGreaterThan(0);
  });

  it("higher credibility rating influences score more", () => {
    const highCredFirst: RatingInput[] = [
      makeRating({
        visitType: "dine_in",
        dimensions: { foodScore: 9, serviceScore: 9, vibeScore: 9 },
        credibilityWeight: 1.00,
      }),
      makeRating({
        visitType: "dine_in",
        dimensions: { foodScore: 3, serviceScore: 3, vibeScore: 3 },
        credibilityWeight: 0.10,
      }),
    ];
    const result = computeRestaurantScore(highCredFirst);
    // Score should be much closer to 9 than to 3
    expect(result.overallScore).toBeGreaterThan(8.0);
  });

  it("recent ratings weigh more than old ones", () => {
    const ratings: RatingInput[] = [
      makeRating({
        visitType: "dine_in",
        dimensions: { foodScore: 9, serviceScore: 9, vibeScore: 9 },
        daysSinceRating: 0, // today
      }),
      makeRating({
        visitType: "dine_in",
        dimensions: { foodScore: 3, serviceScore: 3, vibeScore: 3 },
        daysSinceRating: 730, // 2 years ago
      }),
    ];
    const result = computeRestaurantScore(ratings);
    // Recent 9.0 should dominate old 3.0 (decay ~0.11)
    expect(result.overallScore).toBeGreaterThan(8.0);
  });

  it("foodScoreOnly is correct across visit types", () => {
    const ratings: RatingInput[] = [
      makeRating({
        visitType: "dine_in",
        dimensions: { foodScore: 8, serviceScore: 7, vibeScore: 9 },
      }),
      makeRating({
        visitType: "delivery",
        dimensions: { foodScore: 6, packagingScore: 5, valueScore: 7 },
      }),
    ];
    const result = computeRestaurantScore(ratings);
    // Equal weights → (8+6)/2 = 7.0
    expect(result.foodScoreOnly).toBeCloseTo(7.0, 3);
  });

  it("totalRaters count is correct", () => {
    const ratings: RatingInput[] = [
      makeRating({ visitType: "dine_in", dimensions: { foodScore: 8, serviceScore: 7, vibeScore: 9 } }),
      makeRating({ visitType: "delivery", dimensions: { foodScore: 6, packagingScore: 5, valueScore: 7 } }),
      makeRating({ visitType: "takeaway", dimensions: { foodScore: 7, waitTimeScore: 8, valueScore: 6 } }),
    ];
    const result = computeRestaurantScore(ratings);
    expect(result.totalRaters).toBe(3);
  });

  it("credibilityWeightedRaters is the sum of effective weights", () => {
    const ratings: RatingInput[] = [
      makeRating({
        visitType: "dine_in",
        dimensions: { foodScore: 8, serviceScore: 7, vibeScore: 9 },
        credibilityWeight: 1.00,
        verificationBoost: 0.20,
        gamingMultiplier: 1.00,
      }),
      makeRating({
        visitType: "dine_in",
        dimensions: { foodScore: 7, serviceScore: 6, vibeScore: 8 },
        credibilityWeight: 0.10,
        verificationBoost: 0.00,
        gamingMultiplier: 1.00,
      }),
    ];
    const result = computeRestaurantScore(ratings);
    // 1.00 × 1.20 × 1.00 + 0.10 × 1.00 × 1.00 = 1.20 + 0.10 = 1.30
    expect(result.credibilityWeightedRaters).toBeCloseTo(1.30, 5);
  });
});

// ===========================================================================
// 6. Leaderboard threshold (4 tests)
// ===========================================================================
describe("Leaderboard threshold", () => {
  it("less than 3 raters = not eligible", () => {
    const ratings: RatingInput[] = [
      makeRating({ visitType: "dine_in", dimensions: { foodScore: 8, serviceScore: 7, vibeScore: 9 } }),
      makeRating({ visitType: "dine_in", dimensions: { foodScore: 7, serviceScore: 6, vibeScore: 8 } }),
    ];
    const result = meetsLeaderboardThreshold(ratings);
    expect(result.eligible).toBe(false);
    expect(result.reasons.some(r => r.includes("3 raters"))).toBe(true);
  });

  it("no dine-in rating = not eligible", () => {
    const ratings: RatingInput[] = [
      makeRating({ visitType: "delivery", dimensions: { foodScore: 8, packagingScore: 7, valueScore: 6 } }),
      makeRating({ visitType: "delivery", dimensions: { foodScore: 7, packagingScore: 6, valueScore: 5 } }),
      makeRating({ visitType: "takeaway", dimensions: { foodScore: 9, waitTimeScore: 8, valueScore: 7 } }),
    ];
    const result = meetsLeaderboardThreshold(ratings);
    expect(result.eligible).toBe(false);
    expect(result.reasons.some(r => r.includes("dine_in"))).toBe(true);
  });

  it("credibility-weighted sum < 0.5 = not eligible", () => {
    // 3 community raters at 0.10 each = 0.30 < 0.5
    const ratings: RatingInput[] = [
      makeRating({ visitType: "dine_in", dimensions: { foodScore: 8, serviceScore: 7, vibeScore: 9 }, credibilityWeight: 0.10 }),
      makeRating({ visitType: "dine_in", dimensions: { foodScore: 7, serviceScore: 6, vibeScore: 8 }, credibilityWeight: 0.10 }),
      makeRating({ visitType: "dine_in", dimensions: { foodScore: 6, serviceScore: 5, vibeScore: 7 }, credibilityWeight: 0.10 }),
    ];
    const result = meetsLeaderboardThreshold(ratings);
    expect(result.eligible).toBe(false);
    expect(result.reasons.some(r => r.includes("0.30"))).toBe(true);
  });

  it("3 diverse raters including 1 dine-in with good weights = eligible", () => {
    const ratings: RatingInput[] = [
      makeRating({ visitType: "dine_in", dimensions: { foodScore: 8, serviceScore: 7, vibeScore: 9 }, credibilityWeight: 0.70 }),
      makeRating({ visitType: "delivery", dimensions: { foodScore: 7, packagingScore: 6, valueScore: 5 }, credibilityWeight: 0.35 }),
      makeRating({ visitType: "takeaway", dimensions: { foodScore: 9, waitTimeScore: 8, valueScore: 7 }, credibilityWeight: 0.35 }),
    ];
    const result = meetsLeaderboardThreshold(ratings);
    // weighted sum = 0.70 + 0.35 + 0.35 = 1.40 >= 0.50
    expect(result.eligible).toBe(true);
    expect(result.reasons).toHaveLength(0);
  });
});

// ===========================================================================
// 7. Tiebreaker (3 tests)
// ===========================================================================
describe("Tiebreaker", () => {
  it("scores differ by > 0.05 → higher score wins", () => {
    const result = tiebreaker(
      { score: 8.50, weightedRaters: 5 },
      { score: 8.40, weightedRaters: 10 },
    );
    // a has higher score → a should rank first (negative return)
    expect(result).toBeLessThan(0);
  });

  it("scores within 0.05 → more weighted raters wins", () => {
    const result = tiebreaker(
      { score: 8.50, weightedRaters: 5 },
      { score: 8.48, weightedRaters: 10 },
    );
    // Within 0.05, b has more weighted raters → b ranks first (positive return)
    expect(result).toBeGreaterThan(0);
  });

  it("exact same score and raters → 0 (stable)", () => {
    const result = tiebreaker(
      { score: 8.50, weightedRaters: 10 },
      { score: 8.50, weightedRaters: 10 },
    );
    expect(result).toBe(0);
  });
});
