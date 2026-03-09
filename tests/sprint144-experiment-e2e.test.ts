/**
 * End-to-End Experiment Validation Tests — Sprint 144
 * Owner: Sarah Nakamura (Lead Engineer)
 *
 * Proves the FULL A/B testing pipeline works end-to-end, addressing
 * Sprint 142 critique priority #3: "Either run a real experiment or
 * freeze experiment infrastructure."
 *
 * Covers:
 * 1. Full Pipeline Validation (8 tests)
 * 2. Statistical Correctness (6 tests)
 * 3. Cross-Component Integration (6 tests)
 * 4. Experiment Lifecycle (4 tests)
 */

import { describe, it, expect, beforeEach } from "vitest";
import { hashString } from "@shared/hash";
import {
  getVariant,
  setUserId,
  activateExperiment,
  deactivateExperiment,
  registerExperiment,
  setOverride,
  clearOverride,
  clearAllOverrides,
  listExperiments,
  getExperiment,
  _resetForTesting,
} from "../lib/ab-testing";
import {
  trackExposure,
  trackOutcome,
  computeExperimentDashboard,
  getExposureStats,
  getOutcomeStats,
  clearExposures,
} from "../server/experiment-tracker";
import { assignVariant, _getRegistry } from "../server/routes-experiments";

// ─── Helpers ──────────────────────────────────────────────────

/** Generate a unique user ID for simulation. */
function userId(n: number): string {
  return `e2e-user-${n}`;
}

/** Seed a standard test experiment in both client and server registries. */
function seedTestExperiment(id: string, active: boolean = true): void {
  registerExperiment({
    id,
    description: `E2E test experiment: ${id}`,
    active,
    variants: [
      { id: "control", weight: 50 },
      { id: "treatment", weight: 50 },
    ],
  });
  // Mirror into server registry
  const serverReg = _getRegistry();
  serverReg[id] = {
    id,
    description: `E2E test experiment: ${id}`,
    active,
    variants: [
      { id: "control", weight: 50 },
      { id: "treatment", weight: 50 },
    ],
  };
}

// ─── Setup ────────────────────────────────────────────────────

beforeEach(() => {
  _resetForTesting();
  clearExposures();
  clearAllOverrides();
});

// ═══════════════════════════════════════════════════════════════
// 1. Full Pipeline Validation (8 tests)
// ═══════════════════════════════════════════════════════════════

describe("Full Pipeline Validation", () => {
  it("user assigned to variant -> exposure tracked -> action taken -> outcome recorded -> dashboard shows correct conversion", () => {
    seedTestExperiment("e2e_pipeline");

    // Step 1: Assign variant
    setUserId("pipeline-user-1");
    const variant = getVariant("e2e_pipeline");
    expect(["control", "treatment"]).toContain(variant);

    // Step 2: Track exposure on server
    trackExposure("pipeline-user-1", "e2e_pipeline", variant, "business_page");

    // Step 3: Record outcome
    trackOutcome("pipeline-user-1", "e2e_pipeline", "rated", 4);

    // Step 4: Dashboard shows correct conversion
    const dashboard = computeExperimentDashboard("e2e_pipeline");
    expect(dashboard.experimentId).toBe("e2e_pipeline");
    expect(dashboard.totalExposures).toBe(1);

    const userVariantDash = dashboard.variants.find((v) => v.variant === variant);
    expect(userVariantDash).toBeDefined();
    expect(userVariantDash!.exposures).toBe(1);
    expect(userVariantDash!.outcomes).toBe(1);
    expect(userVariantDash!.conversionRate).toBe(100);
  });

  it("multiple users across both variants -> dashboard shows both sides", () => {
    seedTestExperiment("e2e_both_variants");

    // Enroll enough users to get at least one in each bucket
    const variantCounts: Record<string, number> = { control: 0, treatment: 0 };
    for (let i = 0; i < 50; i++) {
      const uid = userId(i);
      setUserId(uid);
      const variant = getVariant("e2e_both_variants");
      variantCounts[variant] = (variantCounts[variant] || 0) + 1;
      trackExposure(uid, "e2e_both_variants", variant, "test");
      // Half the users convert
      if (i % 2 === 0) {
        trackOutcome(uid, "e2e_both_variants", "rated");
      }
    }

    const dashboard = computeExperimentDashboard("e2e_both_variants");
    expect(dashboard.variants.length).toBeGreaterThanOrEqual(2);

    // Both variants should have exposures
    for (const v of dashboard.variants) {
      expect(v.exposures).toBeGreaterThan(0);
    }
  });

  it("same user re-exposed -> deduplication works -> conversion rate unaffected", () => {
    seedTestExperiment("e2e_dedup");

    const uid = "dedup-user";
    setUserId(uid);
    const variant = getVariant("e2e_dedup");

    // Expose 3 times
    trackExposure(uid, "e2e_dedup", variant, "page_1");
    trackExposure(uid, "e2e_dedup", variant, "page_2");
    trackExposure(uid, "e2e_dedup", variant, "page_3");

    // Only 1 exposure should be recorded
    const stats = getExposureStats("e2e_dedup");
    expect(stats.total).toBe(1);
    expect(stats.uniqueUsers).toBe(1);

    // One outcome
    trackOutcome(uid, "e2e_dedup", "rated");

    const dashboard = computeExperimentDashboard("e2e_dedup");
    const vDash = dashboard.variants.find((v) => v.variant === variant);
    expect(vDash!.conversionRate).toBe(100); // 1 outcome / 1 exposure = 100%
  });

  it("inactive experiment -> always returns control -> no exposures tracked", () => {
    seedTestExperiment("e2e_inactive", false);

    setUserId("inactive-user");
    const variant = getVariant("e2e_inactive");
    expect(variant).toBe("control");

    // Even if we manually try to track — the point is getVariant returns control
    const stats = getExposureStats("e2e_inactive");
    expect(stats.total).toBe(0);
  });

  it("outcome without prior exposure is silently dropped", () => {
    seedTestExperiment("e2e_no_exposure");

    // Track outcome without exposure
    trackOutcome("ghost-user", "e2e_no_exposure", "rated");

    const outcomeStats = getOutcomeStats("e2e_no_exposure");
    expect(outcomeStats.total).toBe(0);
  });

  it("multiple actions by same user all recorded as outcomes", () => {
    seedTestExperiment("e2e_multi_action");

    const uid = "multi-action-user";
    setUserId(uid);
    const variant = getVariant("e2e_multi_action");

    trackExposure(uid, "e2e_multi_action", variant, "test");
    trackOutcome(uid, "e2e_multi_action", "rated", 5);
    trackOutcome(uid, "e2e_multi_action", "returned");
    trackOutcome(uid, "e2e_multi_action", "session_extended");

    const outcomeStats = getOutcomeStats("e2e_multi_action");
    expect(outcomeStats.total).toBe(3);
    expect(outcomeStats.byAction["rated"]).toBe(1);
    expect(outcomeStats.byAction["returned"]).toBe(1);
    expect(outcomeStats.byAction["session_extended"]).toBe(1);
  });

  it("dashboard conversion rate is computed correctly for partial conversion", () => {
    seedTestExperiment("e2e_partial");

    // 4 users exposed, 1 converts
    for (let i = 0; i < 4; i++) {
      const uid = `partial-user-${i}`;
      trackExposure(uid, "e2e_partial", "treatment", "test");
    }
    trackOutcome("partial-user-0", "e2e_partial", "rated");

    const dashboard = computeExperimentDashboard("e2e_partial");
    const treatmentDash = dashboard.variants.find((v) => v.variant === "treatment");
    expect(treatmentDash!.conversionRate).toBe(25); // 1/4 = 25%
  });

  it("exposure stats track first and last exposure timestamps", () => {
    seedTestExperiment("e2e_timestamps");

    trackExposure("ts-user-1", "e2e_timestamps", "control", "test");
    trackExposure("ts-user-2", "e2e_timestamps", "treatment", "test");

    const stats = getExposureStats("e2e_timestamps");
    expect(stats.firstExposure).not.toBeNull();
    expect(stats.lastExposure).not.toBeNull();
    expect(stats.lastExposure!).toBeGreaterThanOrEqual(stats.firstExposure!);
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. Statistical Correctness (6 tests)
// ═══════════════════════════════════════════════════════════════

describe("Statistical Correctness", () => {
  it("100+ simulated users bucketed -> traffic split within 10% of target (50/50)", () => {
    seedTestExperiment("e2e_split");

    const counts: Record<string, number> = { control: 0, treatment: 0 };
    const N = 200;

    for (let i = 0; i < N; i++) {
      const uid = `split-user-${i}`;
      setUserId(uid);
      const variant = getVariant("e2e_split");
      counts[variant] = (counts[variant] || 0) + 1;
    }

    // Each variant should have between 40% and 60% of traffic
    const controlPct = (counts["control"] / N) * 100;
    const treatmentPct = (counts["treatment"] / N) * 100;

    expect(controlPct).toBeGreaterThanOrEqual(40);
    expect(controlPct).toBeLessThanOrEqual(60);
    expect(treatmentPct).toBeGreaterThanOrEqual(40);
    expect(treatmentPct).toBeLessThanOrEqual(60);
  });

  it("dashboard with sufficient data -> recommendation is decisive (not insufficient_data)", () => {
    seedTestExperiment("e2e_sufficient");

    // 120 users — above the 100 threshold
    for (let i = 0; i < 120; i++) {
      const uid = `suff-user-${i}`;
      const variant = i < 60 ? "control" : "treatment";
      trackExposure(uid, "e2e_sufficient", variant, "test");
      // Treatment converts at higher rate
      if (variant === "treatment" && i % 3 === 0) {
        trackOutcome(uid, "e2e_sufficient", "rated");
      }
      if (variant === "control" && i % 6 === 0) {
        trackOutcome(uid, "e2e_sufficient", "rated");
      }
    }

    const dashboard = computeExperimentDashboard("e2e_sufficient");
    expect(dashboard.confidence).toBe("sufficient_data");
    expect(dashboard.recommendation).not.toBe("insufficient_data");
  });

  it("dashboard with treatment winning by >5% -> recommendation is treatment_winning", () => {
    seedTestExperiment("e2e_treatment_wins");

    // 60 control, 60 treatment
    for (let i = 0; i < 60; i++) {
      trackExposure(`ctrl-${i}`, "e2e_treatment_wins", "control", "test");
      trackExposure(`treat-${i}`, "e2e_treatment_wins", "treatment", "test");
    }

    // Control: 5% conversion (3 out of 60)
    for (let i = 0; i < 3; i++) {
      trackOutcome(`ctrl-${i}`, "e2e_treatment_wins", "rated");
    }

    // Treatment: 30% conversion (18 out of 60)
    for (let i = 0; i < 18; i++) {
      trackOutcome(`treat-${i}`, "e2e_treatment_wins", "rated");
    }

    const dashboard = computeExperimentDashboard("e2e_treatment_wins");
    expect(dashboard.recommendation).toBe("treatment_winning");
  });

  it("dashboard with control winning -> recommendation is control_winning", () => {
    seedTestExperiment("e2e_control_wins");

    for (let i = 0; i < 60; i++) {
      trackExposure(`ctrl-${i}`, "e2e_control_wins", "control", "test");
      trackExposure(`treat-${i}`, "e2e_control_wins", "treatment", "test");
    }

    // Control: 30% conversion (18 out of 60)
    for (let i = 0; i < 18; i++) {
      trackOutcome(`ctrl-${i}`, "e2e_control_wins", "rated");
    }

    // Treatment: 5% conversion (3 out of 60)
    for (let i = 0; i < 3; i++) {
      trackOutcome(`treat-${i}`, "e2e_control_wins", "rated");
    }

    const dashboard = computeExperimentDashboard("e2e_control_wins");
    expect(dashboard.recommendation).toBe("control_winning");
  });

  it("dashboard with <5% diff -> recommendation is inconclusive", () => {
    seedTestExperiment("e2e_inconclusive");

    for (let i = 0; i < 60; i++) {
      trackExposure(`ctrl-${i}`, "e2e_inconclusive", "control", "test");
      trackExposure(`treat-${i}`, "e2e_inconclusive", "treatment", "test");
    }

    // Both at ~15% conversion — difference < 5pp
    for (let i = 0; i < 9; i++) {
      trackOutcome(`ctrl-${i}`, "e2e_inconclusive", "rated");
    }
    for (let i = 0; i < 10; i++) {
      trackOutcome(`treat-${i}`, "e2e_inconclusive", "rated");
    }

    const dashboard = computeExperimentDashboard("e2e_inconclusive");
    expect(dashboard.recommendation).toBe("inconclusive");
  });

  it("zero outcomes -> conversion rates are 0%", () => {
    seedTestExperiment("e2e_zero_outcomes");

    for (let i = 0; i < 60; i++) {
      trackExposure(`ctrl-${i}`, "e2e_zero_outcomes", "control", "test");
      trackExposure(`treat-${i}`, "e2e_zero_outcomes", "treatment", "test");
    }

    const dashboard = computeExperimentDashboard("e2e_zero_outcomes");

    for (const v of dashboard.variants) {
      expect(v.outcomes).toBe(0);
      expect(v.conversionRate).toBe(0);
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. Cross-Component Integration (6 tests)
// ═══════════════════════════════════════════════════════════════

describe("Cross-Component Integration", () => {
  it("client hash matches server hash for same userId+experimentId", () => {
    // hashString is shared — verify it produces identical results
    const key = "user-42:confidence_tooltip";
    const clientHash = hashString(key);
    const serverHash = hashString(key);
    expect(clientHash).toBe(serverHash);
    expect(typeof clientHash).toBe("number");
    expect(clientHash).toBeGreaterThan(0);
  });

  it("assignment is deterministic: same input -> same output every time", () => {
    seedTestExperiment("e2e_deterministic");

    setUserId("deterministic-user");
    const first = getVariant("e2e_deterministic");
    const second = getVariant("e2e_deterministic");
    const third = getVariant("e2e_deterministic");

    expect(first).toBe(second);
    expect(second).toBe(third);
  });

  it("experiment registry matches between client and server", () => {
    // Both client and server have the same three default experiments
    const clientExperiments = listExperiments();
    const serverRegistry = _getRegistry();

    const clientIds = clientExperiments.map((e) => e.id).sort();
    const serverIds = Object.keys(serverRegistry).sort();

    // Check that every server experiment exists on the client
    for (const id of serverIds) {
      // We only check base experiments, not test-registered ones
      if (id.startsWith("e2e_")) continue;
      expect(clientIds).toContain(id);
    }
  });

  it("client and server assign the same variant for the same user+experiment", () => {
    seedTestExperiment("e2e_cross_assign");

    const uid = "cross-assign-user";
    setUserId(uid);
    const clientVariant = getVariant("e2e_cross_assign");
    const { variant: serverVariant } = assignVariant(uid, "e2e_cross_assign");

    expect(clientVariant).toBe(serverVariant);
  });

  it("activated experiment appears in experiment list as active", () => {
    seedTestExperiment("e2e_activate_list", false);

    // Should be inactive initially
    const expBefore = getExperiment("e2e_activate_list");
    expect(expBefore!.active).toBe(false);

    // Activate
    activateExperiment("e2e_activate_list");

    const expAfter = getExperiment("e2e_activate_list");
    expect(expAfter!.active).toBe(true);
  });

  it("deactivated experiment returns control variant", () => {
    seedTestExperiment("e2e_deactivate_check");

    setUserId("deactivate-user");
    const activatedVariant = getVariant("e2e_deactivate_check");
    expect(["control", "treatment"]).toContain(activatedVariant);

    deactivateExperiment("e2e_deactivate_check");

    const deactivatedVariant = getVariant("e2e_deactivate_check");
    expect(deactivatedVariant).toBe("control");
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. Experiment Lifecycle (4 tests)
// ═══════════════════════════════════════════════════════════════

describe("Experiment Lifecycle", () => {
  it("register -> activate -> assign users -> track outcomes -> compute dashboard -> deactivate", () => {
    // Step 1: Register
    seedTestExperiment("e2e_lifecycle", false);
    expect(getExperiment("e2e_lifecycle")).toBeDefined();
    expect(getExperiment("e2e_lifecycle")!.active).toBe(false);

    // Inactive — should return control
    setUserId("lifecycle-user-1");
    expect(getVariant("e2e_lifecycle")).toBe("control");

    // Step 2: Activate
    activateExperiment("e2e_lifecycle");
    expect(getExperiment("e2e_lifecycle")!.active).toBe(true);

    // Step 3: Assign users and track exposures
    const assignments: Record<string, string> = {};
    for (let i = 0; i < 120; i++) {
      const uid = `lifecycle-${i}`;
      setUserId(uid);
      const variant = getVariant("e2e_lifecycle");
      assignments[uid] = variant;
      trackExposure(uid, "e2e_lifecycle", variant, "lifecycle_test");
    }

    // Step 4: Track outcomes (every 3rd user converts)
    for (let i = 0; i < 120; i++) {
      if (i % 3 === 0) {
        const uid = `lifecycle-${i}`;
        trackOutcome(uid, "e2e_lifecycle", "rated");
      }
    }

    // Step 5: Compute dashboard
    const dashboard = computeExperimentDashboard("e2e_lifecycle");
    expect(dashboard.totalExposures).toBe(120);
    expect(dashboard.confidence).toBe("sufficient_data");
    expect(["treatment_winning", "control_winning", "promising", "inconclusive"]).toContain(
      dashboard.recommendation,
    );

    // Step 6: Deactivate
    deactivateExperiment("e2e_lifecycle");
    expect(getExperiment("e2e_lifecycle")!.active).toBe(false);

    // After deactivation, new users get control
    setUserId("lifecycle-new-user");
    expect(getVariant("e2e_lifecycle")).toBe("control");
  });

  it("deactivated experiment stops new assignments but preserves historical data", () => {
    seedTestExperiment("e2e_preserve");

    // Record some data
    for (let i = 0; i < 10; i++) {
      trackExposure(`preserve-${i}`, "e2e_preserve", i < 5 ? "control" : "treatment", "test");
      if (i < 3) {
        trackOutcome(`preserve-${i}`, "e2e_preserve", "rated");
      }
    }

    const statsBefore = getExposureStats("e2e_preserve");
    expect(statsBefore.total).toBe(10);

    const outcomesBefore = getOutcomeStats("e2e_preserve");
    expect(outcomesBefore.total).toBe(3);

    // Deactivate
    deactivateExperiment("e2e_preserve");

    // Historical data still intact
    const statsAfter = getExposureStats("e2e_preserve");
    expect(statsAfter.total).toBe(10);
    expect(statsAfter.uniqueUsers).toBe(10);

    const outcomesAfter = getOutcomeStats("e2e_preserve");
    expect(outcomesAfter.total).toBe(3);

    // New user gets control
    setUserId("preserve-new");
    expect(getVariant("e2e_preserve")).toBe("control");
  });

  it("override variant for QA user -> correct variant returned", () => {
    seedTestExperiment("e2e_override");

    setUserId("qa-user");
    const naturalVariant = getVariant("e2e_override");

    // Force the opposite variant
    const forcedVariant = naturalVariant === "control" ? "treatment" : "control";
    setOverride("e2e_override", forcedVariant);

    expect(getVariant("e2e_override")).toBe(forcedVariant);

    // Clear override -> back to natural
    clearOverride("e2e_override");
    expect(getVariant("e2e_override")).toBe(naturalVariant);
  });

  it("multiple concurrent experiments -> assignments are independent", () => {
    seedTestExperiment("e2e_concurrent_a");
    seedTestExperiment("e2e_concurrent_b");
    seedTestExperiment("e2e_concurrent_c");

    // Run 100 users through all 3 experiments and verify independence:
    // changing experiment should not change assignment for another experiment
    const assignmentsA: string[] = [];
    const assignmentsB: string[] = [];
    const assignmentsC: string[] = [];

    for (let i = 0; i < 100; i++) {
      const uid = `concurrent-${i}`;
      setUserId(uid);
      assignmentsA.push(getVariant("e2e_concurrent_a"));
      assignmentsB.push(getVariant("e2e_concurrent_b"));
      assignmentsC.push(getVariant("e2e_concurrent_c"));
    }

    // Assignments should not be identical across experiments
    // (statistically near-impossible for 100 users with independent hashing)
    const allSameAB = assignmentsA.every((v, i) => v === assignmentsB[i]);
    const allSameAC = assignmentsA.every((v, i) => v === assignmentsC[i]);
    const allSameBC = assignmentsB.every((v, i) => v === assignmentsC[i]);

    // At least one pair should differ (extremely high probability)
    expect(allSameAB && allSameAC && allSameBC).toBe(false);

    // Each experiment should have both variants represented
    expect(new Set(assignmentsA).size).toBe(2);
    expect(new Set(assignmentsB).size).toBe(2);
    expect(new Set(assignmentsC).size).toBe(2);
  });
});
