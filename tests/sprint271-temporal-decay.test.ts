/**
 * Sprint 271 — Temporal Decay Integration Tests (Phase 3a)
 *
 * Validates:
 * 1. recalculateBusinessScore uses computeDecayFactor (exponential) not getTemporalMultiplier (step)
 * 2. recalculateBusinessScore reads compositeScore + effectiveWeight columns
 * 3. Score breakdown API applies temporal decay
 * 4. computeDecayFactor matches Rating Integrity doc values
 * 5. Decay formula is consistent between score engine and business recalculation
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  computeDecayFactor,
  DECAY_LAMBDA,
  computeRestaurantScore,
  type RatingInput,
} from "@/shared/score-engine";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 271: Temporal Decay Integration", () => {
  const businessStorageSrc = readFile("server/storage/businesses.ts");
  const breakdownSrc = readFile("server/routes-score-breakdown.ts");

  // ── recalculateBusinessScore uses exponential decay ──────────────

  it("recalculateBusinessScore imports computeDecayFactor", () => {
    expect(businessStorageSrc).toContain("computeDecayFactor");
    expect(businessStorageSrc).toContain('@shared/score-engine');
  });

  it("recalculateBusinessScore uses computeDecayFactor not getTemporalMultiplier for scoring", () => {
    // The function body should call computeDecayFactor
    const fnBody = businessStorageSrc.slice(
      businessStorageSrc.indexOf("recalculateBusinessScore"),
      businessStorageSrc.indexOf("recalculateRanks"),
    );
    expect(fnBody).toContain("computeDecayFactor(ageDays)");
    // Should NOT use old step function in the scoring loop
    expect(fnBody).not.toContain("getTemporalMultiplier(ageDays)");
  });

  it("recalculateBusinessScore reads compositeScore column", () => {
    const fnBody = businessStorageSrc.slice(
      businessStorageSrc.indexOf("recalculateBusinessScore"),
      businessStorageSrc.indexOf("recalculateRanks"),
    );
    expect(fnBody).toContain("ratings.compositeScore");
    expect(fnBody).toContain("ratings.effectiveWeight");
  });

  it("recalculateBusinessScore falls back to rawScore for legacy ratings", () => {
    const fnBody = businessStorageSrc.slice(
      businessStorageSrc.indexOf("recalculateBusinessScore"),
      businessStorageSrc.indexOf("recalculateRanks"),
    );
    expect(fnBody).toContain("r.compositeScore");
    expect(fnBody).toContain("r.rawScore");
  });

  // ── Score breakdown API temporal decay ──────────────────────────

  it("score-breakdown imports computeDecayFactor", () => {
    expect(breakdownSrc).toContain("computeDecayFactor");
    expect(breakdownSrc).toContain('@shared/score-engine');
  });

  it("score-breakdown applies decay in weightedAvg", () => {
    expect(breakdownSrc).toContain("computeDecayFactor(ageDays)");
    expect(breakdownSrc).toContain("decayedW");
  });

  it("score-breakdown uses compositeScore for overall", () => {
    expect(breakdownSrc).toContain('weightedAvg(allRatings, "compositeScore")');
  });
});

// ── computeDecayFactor Unit Tests ──────────────────────────────────

describe("computeDecayFactor — exponential decay validation", () => {
  it("returns 1.0 for day 0", () => {
    expect(computeDecayFactor(0)).toBe(1);
  });

  it("returns ~0.75 for 3 months (91 days)", () => {
    const result = computeDecayFactor(91);
    expect(result).toBeGreaterThan(0.73);
    expect(result).toBeLessThan(0.77);
  });

  it("returns ~0.57 for 6 months (183 days)", () => {
    const result = computeDecayFactor(183);
    expect(result).toBeGreaterThan(0.55);
    expect(result).toBeLessThan(0.60);
  });

  it("returns ~0.33 for 1 year (365 days)", () => {
    const result = computeDecayFactor(365);
    expect(result).toBeGreaterThan(0.31);
    expect(result).toBeLessThan(0.35);
  });

  it("returns ~0.11 for 2 years (730 days)", () => {
    const result = computeDecayFactor(730);
    expect(result).toBeGreaterThan(0.10);
    expect(result).toBeLessThan(0.13);
  });

  it("50% weight point is approximately 231 days", () => {
    const halfLife = Math.log(2) / DECAY_LAMBDA;
    expect(halfLife).toBeGreaterThan(230);
    expect(halfLife).toBeLessThan(232);
  });

  it("DECAY_LAMBDA matches Rating Integrity doc value", () => {
    expect(DECAY_LAMBDA).toBe(0.003);
  });

  it("monotonically decreasing", () => {
    let prev = computeDecayFactor(0);
    for (const days of [30, 90, 180, 365, 730, 1095]) {
      const current = computeDecayFactor(days);
      expect(current).toBeLessThan(prev);
      prev = current;
    }
  });

  it("never reaches 0", () => {
    // Even after 10 years
    expect(computeDecayFactor(3650)).toBeGreaterThan(0);
  });
});

// ── Score engine integration with decay ──────────────────────────

describe("computeRestaurantScore — decay-weighted scoring", () => {
  const makeRating = (overrides: Partial<RatingInput> = {}): RatingInput => ({
    visitType: "dine_in",
    dimensions: { foodScore: 8, serviceScore: 7, vibeScore: 7 },
    credibilityWeight: 1.0,
    verificationBoost: 0,
    gamingMultiplier: 1.0,
    daysSinceRating: 0,
    ...overrides,
  });

  it("recent ratings dominate over old ratings", () => {
    const ratings: RatingInput[] = [
      makeRating({ dimensions: { foodScore: 9, serviceScore: 9, vibeScore: 9 }, daysSinceRating: 0 }),
      makeRating({ dimensions: { foodScore: 5, serviceScore: 5, vibeScore: 5 }, daysSinceRating: 365 }),
    ];
    const result = computeRestaurantScore(ratings);
    // Recent 9.0 should outweigh old 5.0
    expect(result.overallScore).toBeGreaterThan(7.5);
  });

  it("old ratings still contribute but less", () => {
    const recentOnly = computeRestaurantScore([
      makeRating({ dimensions: { foodScore: 8, serviceScore: 8, vibeScore: 8 }, daysSinceRating: 0 }),
    ]);
    const withOldLow = computeRestaurantScore([
      makeRating({ dimensions: { foodScore: 8, serviceScore: 8, vibeScore: 8 }, daysSinceRating: 0 }),
      makeRating({ dimensions: { foodScore: 4, serviceScore: 4, vibeScore: 4 }, daysSinceRating: 365 }),
    ]);
    // Adding an old low rating should lower the score slightly
    expect(withOldLow.overallScore).toBeLessThan(recentOnly.overallScore);
    // But not by too much since it's decayed
    expect(withOldLow.overallScore).toBeGreaterThan(6.5);
  });

  it("equal-age ratings get equal weight", () => {
    const ratings: RatingInput[] = [
      makeRating({ dimensions: { foodScore: 10, serviceScore: 10, vibeScore: 10 }, daysSinceRating: 30 }),
      makeRating({ dimensions: { foodScore: 6, serviceScore: 6, vibeScore: 6 }, daysSinceRating: 30 }),
    ];
    const result = computeRestaurantScore(ratings);
    // Should be exactly 8.0 since both have same age/weight
    expect(result.overallScore).toBeCloseTo(8.0, 1);
  });
});
