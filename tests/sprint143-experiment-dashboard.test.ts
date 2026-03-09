/**
 * Unit Tests — Experiment Results Dashboard (Sprint 143 + Sprint 145 Wilson Score)
 * Owner: Sarah Nakamura (Lead Engineer)
 *
 * Covers:
 * - Wilson score confidence interval computation
 * - Per-variant conversion rate calculation with confidence intervals
 * - Recommendation logic using Wilson score intervals
 * - Insufficient data detection when exposures < 100
 * - Per-variant breakdown accuracy (exposures, outcomes, byAction)
 * - Edge cases: no data, single variant, zero outcomes
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  trackExposure,
  trackOutcome,
  computeExperimentDashboard,
  clearExposures,
  wilsonScore,
} from "../server/experiment-tracker";

// ─── Setup ───────────────────────────────────────────────────

beforeEach(() => {
  clearExposures();
});

// ─── Helper: bulk-create exposures ───────────────────────────

function createExposures(
  experimentId: string,
  variant: string,
  count: number,
  startIndex = 0,
): void {
  for (let i = startIndex; i < startIndex + count; i++) {
    trackExposure(`user_${variant}_${i}`, experimentId, variant, "test");
  }
}

function createOutcomes(
  experimentId: string,
  variant: string,
  count: number,
  action = "rated",
  startIndex = 0,
): void {
  for (let i = startIndex; i < startIndex + count; i++) {
    trackOutcome(`user_${variant}_${i}`, experimentId, action);
  }
}

// ─── Wilson Score Function ────────────────────────────────────

describe("wilsonScore computation", () => {
  it("returns {0, 0, 0} for 0 successes / 0 total", () => {
    const result = wilsonScore(0, 0);
    expect(result).toEqual({ lower: 0, upper: 0, center: 0 });
  });

  it("computes center near 0.5 for 50/100", () => {
    const result = wilsonScore(50, 100);
    expect(result.center).toBeCloseTo(0.5, 2);
    // Interval should be symmetric around ~0.5
    expect(result.lower).toBeGreaterThan(0.39);
    expect(result.upper).toBeLessThan(0.61);
    // Width should be reasonable for n=100
    expect(result.upper - result.lower).toBeGreaterThan(0.05);
    expect(result.upper - result.lower).toBeLessThan(0.25);
  });

  it("shrinks 1/1 away from 1.0 (does not return {1, 1, 1})", () => {
    const result = wilsonScore(1, 1);
    expect(result.center).toBeLessThan(1);
    expect(result.upper).toBeLessThanOrEqual(1);
    // With n=1, the interval should be very wide
    expect(result.lower).toBeLessThan(0.5);
    // Definitely not {1, 1, 1}
    expect(result).not.toEqual({ lower: 1, upper: 1, center: 1 });
  });

  it("shrinks 0/1 away from 0.0", () => {
    const result = wilsonScore(0, 1);
    expect(result.center).toBeGreaterThan(0);
    expect(result.lower).toBeGreaterThanOrEqual(0);
    expect(result.upper).toBeGreaterThan(0.5);
  });

  it("narrows interval as sample size increases", () => {
    const small = wilsonScore(5, 10);
    const large = wilsonScore(500, 1000);
    // Same proportion (0.5) but larger sample → narrower interval
    expect(large.upper - large.lower).toBeLessThan(small.upper - small.lower);
  });

  it("accepts custom z-score parameter", () => {
    const ci95 = wilsonScore(50, 100, 1.96);
    const ci99 = wilsonScore(50, 100, 2.576);
    // 99% CI should be wider than 95% CI
    expect(ci99.upper - ci99.lower).toBeGreaterThan(ci95.upper - ci95.lower);
  });
});

// ─── Conversion Rate Calculation ─────────────────────────────

describe("conversion rate calculation", () => {
  it("computes correct conversion rate for each variant", () => {
    // 50 control exposures, 10 convert
    createExposures("exp_a", "control", 50);
    createOutcomes("exp_a", "control", 10);
    // 50 treatment exposures, 25 convert
    createExposures("exp_a", "treatment", 50);
    createOutcomes("exp_a", "treatment", 25);

    const dashboard = computeExperimentDashboard("exp_a");

    const control = dashboard.variants.find((v) => v.variant === "control");
    const treatment = dashboard.variants.find((v) => v.variant === "treatment");

    expect(control).toBeDefined();
    expect(treatment).toBeDefined();
    expect(control!.conversionRate).toBe(20); // 10/50 = 20%
    expect(treatment!.conversionRate).toBe(50); // 25/50 = 50%
  });

  it("includes Wilson confidence intervals on each variant", () => {
    createExposures("exp_a", "control", 50);
    createOutcomes("exp_a", "control", 10);
    createExposures("exp_a", "treatment", 50);
    createOutcomes("exp_a", "treatment", 25);

    const dashboard = computeExperimentDashboard("exp_a");
    const control = dashboard.variants.find((v) => v.variant === "control");
    const treatment = dashboard.variants.find((v) => v.variant === "treatment");

    // Control: 10/50 = 0.2 → Wilson center near 0.2
    expect(control!.confidence).toBeDefined();
    expect(control!.confidence.center).toBeCloseTo(0.2, 1);
    expect(control!.confidence.lower).toBeGreaterThan(0);
    expect(control!.confidence.upper).toBeLessThan(1);
    expect(control!.confidence.lower).toBeLessThan(control!.confidence.center);
    expect(control!.confidence.upper).toBeGreaterThan(control!.confidence.center);

    // Treatment: 25/50 = 0.5 → Wilson center near 0.5
    expect(treatment!.confidence).toBeDefined();
    expect(treatment!.confidence.center).toBeCloseTo(0.5, 1);
  });

  it("returns 0% conversion when no outcomes exist", () => {
    createExposures("exp_a", "control", 60);
    createExposures("exp_a", "treatment", 60);

    const dashboard = computeExperimentDashboard("exp_a");

    for (const v of dashboard.variants) {
      expect(v.conversionRate).toBe(0);
    }
  });

  it("returns 100% conversion when all exposed users convert", () => {
    createExposures("exp_a", "control", 55);
    createOutcomes("exp_a", "control", 55);
    createExposures("exp_a", "treatment", 55);
    createOutcomes("exp_a", "treatment", 55);

    const dashboard = computeExperimentDashboard("exp_a");

    for (const v of dashboard.variants) {
      expect(v.conversionRate).toBe(100);
    }
  });

  it("handles fractional conversion rates", () => {
    createExposures("exp_a", "control", 60);
    createOutcomes("exp_a", "control", 20); // 33.33...%
    createExposures("exp_a", "treatment", 60);
    createOutcomes("exp_a", "treatment", 20);

    const dashboard = computeExperimentDashboard("exp_a");
    const control = dashboard.variants.find((v) => v.variant === "control");

    expect(control!.conversionRate).toBeCloseTo(33.33, 1);
  });
});

// ─── Recommendation Logic (Wilson Score) ─────────────────────

describe("recommendation logic with Wilson score intervals", () => {
  it("returns treatment_winning when intervals do not overlap (large sample)", () => {
    // Large samples with very different rates → non-overlapping Wilson CIs
    // Control: 20/200 = 10%, Treatment: 120/200 = 60%
    createExposures("exp_a", "control", 200);
    createOutcomes("exp_a", "control", 20);
    createExposures("exp_a", "treatment", 200);
    createOutcomes("exp_a", "treatment", 120);

    const dashboard = computeExperimentDashboard("exp_a");
    expect(dashboard.recommendation).toBe("treatment_winning");
  });

  it("returns control_winning when control interval is above treatment (large sample)", () => {
    // Control: 120/200 = 60%, Treatment: 20/200 = 10%
    createExposures("exp_a", "control", 200);
    createOutcomes("exp_a", "control", 120);
    createExposures("exp_a", "treatment", 200);
    createOutcomes("exp_a", "treatment", 20);

    const dashboard = computeExperimentDashboard("exp_a");
    expect(dashboard.recommendation).toBe("control_winning");
  });

  it("returns inconclusive when rates are equal", () => {
    createExposures("exp_a", "control", 200);
    createOutcomes("exp_a", "control", 60);
    createExposures("exp_a", "treatment", 200);
    createOutcomes("exp_a", "treatment", 60);

    const dashboard = computeExperimentDashboard("exp_a");
    expect(dashboard.recommendation).toBe("inconclusive");
  });

  it("returns inconclusive when intervals overlap and centers are close", () => {
    // Control: 50/200 = 25%, Treatment: 54/200 = 27% → centers differ by ~2pp → inconclusive
    createExposures("exp_a", "control", 200);
    createOutcomes("exp_a", "control", 50);
    createExposures("exp_a", "treatment", 200);
    createOutcomes("exp_a", "treatment", 54);

    const dashboard = computeExperimentDashboard("exp_a");
    expect(dashboard.recommendation).toBe("inconclusive");
  });

  it("returns promising when intervals overlap but centers differ by >5pp", () => {
    // With moderate sample sizes, overlapping intervals but meaningful center difference
    // Control: 30/200 = 15%, Treatment: 50/200 = 25% → centers differ by ~10pp
    // At n=200, Wilson CI width is ~10pp each, so intervals overlap but centers are >5pp apart
    createExposures("exp_a", "control", 200);
    createOutcomes("exp_a", "control", 30);
    createExposures("exp_a", "treatment", 200);
    createOutcomes("exp_a", "treatment", 50);

    const dashboard = computeExperimentDashboard("exp_a");
    // Intervals overlap at n=200, but center diff is meaningful → promising
    expect(dashboard.recommendation).toBe("promising");
  });

  it("returns promising for small per-variant samples with large center difference", () => {
    // 50 per variant (total 100, so not insufficient_data), big rate difference
    // Control: 10/50 = 20%, Treatment: 20/50 = 40% → intervals overlap at n=50, centers differ by ~20pp
    createExposures("exp_a", "control", 50);
    createOutcomes("exp_a", "control", 10);
    createExposures("exp_a", "treatment", 50);
    createOutcomes("exp_a", "treatment", 20);

    const dashboard = computeExperimentDashboard("exp_a");
    expect(dashboard.recommendation).toBe("promising");
  });

  it("handles only control variant present (treatment defaults to zero CI)", () => {
    createExposures("exp_a", "control", 120);
    createOutcomes("exp_a", "control", 30);

    const dashboard = computeExperimentDashboard("exp_a");
    expect(dashboard.variants).toHaveLength(1);
    expect(dashboard.variants[0].variant).toBe("control");
    expect(dashboard.variants[0].conversionRate).toBe(25);
    // Treatment CI defaults to {0, 0, 0}, control CI center ~0.25
    // Control lower > treatment upper (0) → control_winning
    expect(dashboard.recommendation).toBe("control_winning");
  });
});

// ─── Insufficient Data Detection ─────────────────────────────

describe("insufficient data detection", () => {
  it("returns insufficient_data when total exposures < 100", () => {
    createExposures("exp_a", "control", 30);
    createExposures("exp_a", "treatment", 30);
    createOutcomes("exp_a", "treatment", 25); // massive conversion, but not enough data

    const dashboard = computeExperimentDashboard("exp_a");
    expect(dashboard.recommendation).toBe("insufficient_data");
    expect(dashboard.confidence).toBe("insufficient_data");
  });

  it("returns insufficient_data when exposures are exactly 99", () => {
    createExposures("exp_a", "control", 49);
    createExposures("exp_a", "treatment", 50);

    const dashboard = computeExperimentDashboard("exp_a");
    expect(dashboard.recommendation).toBe("insufficient_data");
    expect(dashboard.confidence).toBe("insufficient_data");
  });

  it("returns sufficient_data when exposures are exactly 100", () => {
    createExposures("exp_a", "control", 50);
    createExposures("exp_a", "treatment", 50);

    const dashboard = computeExperimentDashboard("exp_a");
    expect(dashboard.confidence).toBe("sufficient_data");
    expect(dashboard.recommendation).not.toBe("insufficient_data");
  });

  it("returns insufficient_data with zero exposures", () => {
    const dashboard = computeExperimentDashboard("nonexistent");
    expect(dashboard.recommendation).toBe("insufficient_data");
    expect(dashboard.confidence).toBe("insufficient_data");
    expect(dashboard.totalExposures).toBe(0);
    expect(dashboard.variants).toHaveLength(0);
  });
});

// ─── Per-Variant Breakdown Accuracy ──────────────────────────

describe("per-variant breakdown accuracy", () => {
  it("returns correct exposure counts per variant", () => {
    createExposures("exp_a", "control", 60);
    createExposures("exp_a", "treatment", 40);

    const dashboard = computeExperimentDashboard("exp_a");
    const control = dashboard.variants.find((v) => v.variant === "control");
    const treatment = dashboard.variants.find((v) => v.variant === "treatment");

    expect(control!.exposures).toBe(60);
    expect(treatment!.exposures).toBe(40);
    expect(dashboard.totalExposures).toBe(100);
  });

  it("returns correct outcome counts per variant", () => {
    createExposures("exp_a", "control", 60);
    createOutcomes("exp_a", "control", 15);
    createExposures("exp_a", "treatment", 60);
    createOutcomes("exp_a", "treatment", 30);

    const dashboard = computeExperimentDashboard("exp_a");
    const control = dashboard.variants.find((v) => v.variant === "control");
    const treatment = dashboard.variants.find((v) => v.variant === "treatment");

    expect(control!.outcomes).toBe(15);
    expect(treatment!.outcomes).toBe(30);
  });

  it("includes per-action breakdown in each variant", () => {
    createExposures("exp_a", "control", 60);
    createExposures("exp_a", "treatment", 60);

    // Control: 5 rated, 3 returned
    createOutcomes("exp_a", "control", 5, "rated");
    createOutcomes("exp_a", "control", 3, "returned", 5);

    // Treatment: 10 rated, 8 returned
    createOutcomes("exp_a", "treatment", 10, "rated");
    createOutcomes("exp_a", "treatment", 8, "returned", 10);

    const dashboard = computeExperimentDashboard("exp_a");
    const control = dashboard.variants.find((v) => v.variant === "control");
    const treatment = dashboard.variants.find((v) => v.variant === "treatment");

    expect(control!.byAction).toEqual({ rated: 5, returned: 3 });
    expect(treatment!.byAction).toEqual({ rated: 10, returned: 8 });
  });

  it("experimentId is returned correctly in dashboard", () => {
    createExposures("my_experiment", "control", 10);

    const dashboard = computeExperimentDashboard("my_experiment");
    expect(dashboard.experimentId).toBe("my_experiment");
  });
});
