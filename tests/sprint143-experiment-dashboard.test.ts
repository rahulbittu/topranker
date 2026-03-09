/**
 * Unit Tests — Experiment Results Dashboard (Sprint 143)
 * Owner: Sarah Nakamura (Lead Engineer)
 *
 * Covers:
 * - Per-variant conversion rate calculation
 * - Recommendation logic thresholds (treatment_winning, control_winning, inconclusive)
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

// ─── Recommendation Logic ────────────────────────────────────

describe("recommendation logic thresholds", () => {
  it("returns treatment_winning when treatment beats control by >5%", () => {
    // Control: 10/50 = 20%, Treatment: 20/50 = 40% → diff = +20% → treatment_winning
    createExposures("exp_a", "control", 50);
    createOutcomes("exp_a", "control", 10);
    createExposures("exp_a", "treatment", 50);
    createOutcomes("exp_a", "treatment", 20);

    const dashboard = computeExperimentDashboard("exp_a");
    expect(dashboard.recommendation).toBe("treatment_winning");
  });

  it("returns control_winning when control beats treatment by >5%", () => {
    // Control: 20/50 = 40%, Treatment: 10/50 = 20% → diff = -20% → control_winning
    createExposures("exp_a", "control", 50);
    createOutcomes("exp_a", "control", 20);
    createExposures("exp_a", "treatment", 50);
    createOutcomes("exp_a", "treatment", 10);

    const dashboard = computeExperimentDashboard("exp_a");
    expect(dashboard.recommendation).toBe("control_winning");
  });

  it("returns inconclusive when difference is exactly 5%", () => {
    // Control: 20/50 = 40%, Treatment: 22.5/50 = 45% → diff = +5% exactly → inconclusive
    // We need exact: 50 control, 20 outcomes (40%); 50 treatment, 22 outcomes (44%) → diff = 4% → inconclusive
    createExposures("exp_a", "control", 50);
    createOutcomes("exp_a", "control", 20);
    createExposures("exp_a", "treatment", 50);
    createOutcomes("exp_a", "treatment", 22); // 44%

    const dashboard = computeExperimentDashboard("exp_a");
    expect(dashboard.recommendation).toBe("inconclusive");
  });

  it("returns inconclusive when rates are equal", () => {
    createExposures("exp_a", "control", 50);
    createOutcomes("exp_a", "control", 15);
    createExposures("exp_a", "treatment", 50);
    createOutcomes("exp_a", "treatment", 15);

    const dashboard = computeExperimentDashboard("exp_a");
    expect(dashboard.recommendation).toBe("inconclusive");
  });

  it("returns inconclusive for difference just under 5% threshold", () => {
    // Control: 25/50 = 50%, Treatment: 27/50 = 54% → diff = 4% → inconclusive
    createExposures("exp_a", "control", 50);
    createOutcomes("exp_a", "control", 25);
    createExposures("exp_a", "treatment", 50);
    createOutcomes("exp_a", "treatment", 27);

    const dashboard = computeExperimentDashboard("exp_a");
    expect(dashboard.recommendation).toBe("inconclusive");
  });

  it("returns treatment_winning for difference just over 5% threshold", () => {
    // Control: 20/50 = 40%, Treatment: 23/50 = 46% → diff = 6% → treatment_winning
    createExposures("exp_a", "control", 50);
    createOutcomes("exp_a", "control", 20);
    createExposures("exp_a", "treatment", 50);
    createOutcomes("exp_a", "treatment", 23);

    const dashboard = computeExperimentDashboard("exp_a");
    expect(dashboard.recommendation).toBe("treatment_winning");
  });

  it("returns control_winning for negative difference just over 5%", () => {
    // Control: 23/50 = 46%, Treatment: 20/50 = 40% → diff = -6% → control_winning
    createExposures("exp_a", "control", 50);
    createOutcomes("exp_a", "control", 23);
    createExposures("exp_a", "treatment", 50);
    createOutcomes("exp_a", "treatment", 20);

    const dashboard = computeExperimentDashboard("exp_a");
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

  it("handles experiment with only control variant data", () => {
    createExposures("exp_a", "control", 120);
    createOutcomes("exp_a", "control", 30);

    const dashboard = computeExperimentDashboard("exp_a");
    expect(dashboard.variants).toHaveLength(1);
    expect(dashboard.variants[0].variant).toBe("control");
    expect(dashboard.variants[0].conversionRate).toBe(25);
    // With no treatment, treatment rate is 0, control is 25 → diff = -25 → control_winning
    expect(dashboard.recommendation).toBe("control_winning");
  });
});
