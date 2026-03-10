/**
 * Sprint 272 — Bayesian Prior Tests (Phase 3b)
 *
 * Validates:
 * 1. applyBayesianPrior formula correctness
 * 2. Shrinkage toward prior mean for low-data restaurants
 * 3. Convergence to actual score for high-data restaurants
 * 4. recalculateBusinessScore uses applyBayesianPrior
 * 5. Constants match design spec
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  applyBayesianPrior,
  BAYESIAN_PRIOR_STRENGTH,
  DEFAULT_PRIOR_MEAN,
} from "@/shared/score-engine";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 272: Bayesian Prior Integration", () => {
  const businessStorageSrc = readFile("server/storage/businesses.ts");
  const scoreEngineSrc = readFile("shared/score-engine.ts");

  it("recalculateBusinessScore imports applyBayesianPrior", () => {
    expect(businessStorageSrc).toContain("applyBayesianPrior");
  });

  it("recalculateBusinessScore calls applyBayesianPrior", () => {
    const fnBody = businessStorageSrc.slice(
      businessStorageSrc.indexOf("recalculateBusinessScore"),
      businessStorageSrc.indexOf("recalculateRanks"),
    );
    expect(fnBody).toContain("applyBayesianPrior(rawWeightedAvg, totalEffectiveWeight)");
  });

  it("score engine exports Bayesian prior constants", () => {
    expect(scoreEngineSrc).toContain("BAYESIAN_PRIOR_STRENGTH");
    expect(scoreEngineSrc).toContain("DEFAULT_PRIOR_MEAN");
  });

  it("score engine exports applyBayesianPrior function", () => {
    expect(scoreEngineSrc).toContain("export function applyBayesianPrior");
  });
});

// ── applyBayesianPrior Unit Tests ──────────────────────────────────

describe("applyBayesianPrior — formula validation", () => {
  it("returns prior mean when no data (weight=0)", () => {
    expect(applyBayesianPrior(9.5, 0)).toBe(DEFAULT_PRIOR_MEAN);
  });

  it("shrinks high score toward mean with low data", () => {
    // Restaurant has 9.0 score but only 1 effective weight
    // Bayesian: (1 × 9.0 + 3 × 6.5) / (1 + 3) = (9 + 19.5) / 4 = 7.125
    const result = applyBayesianPrior(9.0, 1);
    expect(result).toBeCloseTo(7.125, 2);
  });

  it("shrinks low score toward mean with low data", () => {
    // Restaurant has 4.0 score but only 1 effective weight
    // Bayesian: (1 × 4.0 + 3 × 6.5) / (1 + 3) = (4 + 19.5) / 4 = 5.875
    const result = applyBayesianPrior(4.0, 1);
    expect(result).toBeCloseTo(5.875, 2);
  });

  it("approaches actual score with high data", () => {
    // Restaurant has 9.0 score with 30 effective weight
    // Bayesian: (30 × 9.0 + 3 × 6.5) / (30 + 3) = (270 + 19.5) / 33 = 8.77
    const result = applyBayesianPrior(9.0, 30);
    expect(result).toBeGreaterThan(8.7);
    expect(result).toBeLessThan(9.0);
  });

  it("nearly equals actual score with very high data", () => {
    // Restaurant with 100 effective weight — prior barely matters
    const result = applyBayesianPrior(9.0, 100);
    expect(result).toBeGreaterThan(8.9);
  });

  it("equals prior mean when score equals prior mean", () => {
    const result = applyBayesianPrior(6.5, 5);
    expect(result).toBeCloseTo(6.5, 5);
  });

  it("accepts custom prior mean", () => {
    const result = applyBayesianPrior(9.0, 0, 7.0);
    expect(result).toBe(7.0);
  });

  it("accepts custom prior strength", () => {
    // Stronger prior (m=10) means more shrinkage
    const weak = applyBayesianPrior(9.0, 5, 6.5, 3);
    const strong = applyBayesianPrior(9.0, 5, 6.5, 10);
    expect(strong).toBeLessThan(weak); // stronger prior pulls more toward 6.5
  });

  it("BAYESIAN_PRIOR_STRENGTH is 3", () => {
    expect(BAYESIAN_PRIOR_STRENGTH).toBe(3);
  });

  it("DEFAULT_PRIOR_MEAN is 6.5", () => {
    expect(DEFAULT_PRIOR_MEAN).toBe(6.5);
  });
});

// ── Shrinkage Behavior Tests ──────────────────────────────────────

describe("Bayesian prior — shrinkage behavior", () => {
  it("shrinkage decreases as data increases", () => {
    const score = 9.0;
    const results = [1, 3, 5, 10, 20, 50].map(w => applyBayesianPrior(score, w));

    // Each result should be closer to 9.0 than the previous
    for (let i = 1; i < results.length; i++) {
      expect(results[i]).toBeGreaterThan(results[i - 1]);
    }
  });

  it("shrinkage is symmetric around prior mean", () => {
    // A 9.0 score shrinks down by same amount as 4.0 shrinks up
    const high = applyBayesianPrior(9.0, 5);
    const low = applyBayesianPrior(4.0, 5);
    const highDelta = 9.0 - high;
    const lowDelta = low - 4.0;
    expect(highDelta).toBeCloseTo(lowDelta, 5);
  });

  it("a 10.0 restaurant with 1 rating scores below an 8.0 restaurant with 10 ratings", () => {
    const perfectLowData = applyBayesianPrior(10.0, 1);
    const goodHighData = applyBayesianPrior(8.0, 10);
    expect(goodHighData).toBeGreaterThan(perfectLowData);
  });

  it("prior effect vanishes at ~50x prior strength", () => {
    const raw = 8.5;
    const result = applyBayesianPrior(raw, 150); // 50x prior strength of 3
    expect(Math.abs(result - raw)).toBeLessThan(0.15);
  });
});
