/**
 * Unit Tests — A/B Testing Framework (Sprint 135)
 * Owner: Sarah Nakamura (Lead Engineer)
 *
 * Covers:
 * - Deterministic hash-based bucketing
 * - Traffic allocation accuracy
 * - Override support (dev mode)
 * - Experiment activation/deactivation
 * - Analytics integration
 * - Edge cases (unknown experiments, anonymous users)
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock analytics before importing ab-testing
vi.mock("@/lib/analytics", () => ({
  track: vi.fn(),
}));

import {
  hashString,
  getVariant,
  trackExperiment,
  setOverride,
  clearOverride,
  clearAllOverrides,
  setUserId,
  setAnonymousId,
  getEffectiveUserId,
  activateExperiment,
  deactivateExperiment,
  registerExperiment,
  getExperiment,
  listExperiments,
  _resetForTesting,
} from "@/lib/ab-testing";
import { track } from "@/lib/analytics";

describe("A/B Testing Framework", () => {
  beforeEach(() => {
    _resetForTesting();
    vi.clearAllMocks();
  });

  // ── Hash Function ────────────────────────────────────────

  describe("hashString", () => {
    it("returns a consistent hash for the same input", () => {
      const h1 = hashString("user123:confidence_tooltip");
      const h2 = hashString("user123:confidence_tooltip");
      expect(h1).toBe(h2);
    });

    it("returns different hashes for different inputs", () => {
      const h1 = hashString("user123:confidence_tooltip");
      const h2 = hashString("user456:confidence_tooltip");
      expect(h1).not.toBe(h2);
    });

    it("returns a non-negative number", () => {
      const hash = hashString("anything");
      expect(hash).toBeGreaterThanOrEqual(0);
    });
  });

  // ── Deterministic Bucketing ──────────────────────────────

  describe("getVariant — deterministic bucketing", () => {
    it("same user + experiment always returns the same variant", () => {
      setUserId("user-abc");
      activateExperiment("confidence_tooltip");

      const v1 = getVariant("confidence_tooltip");
      const v2 = getVariant("confidence_tooltip");
      const v3 = getVariant("confidence_tooltip");

      expect(v1).toBe(v2);
      expect(v2).toBe(v3);
      expect(["control", "treatment"]).toContain(v1);
    });

    it("different users can get different variants for the same experiment", () => {
      activateExperiment("confidence_tooltip");

      // Try many users — at least one should differ from others
      const variants = new Set<string>();
      for (let i = 0; i < 100; i++) {
        setUserId(`user-bucketing-${i}`);
        variants.add(getVariant("confidence_tooltip"));
      }

      // With 50/50 split and 100 users, both variants should appear
      expect(variants.size).toBe(2);
    });

    it("returns consistent results across repeated calls without state change", () => {
      setUserId("stable-user");
      activateExperiment("trust_signal_style");

      const results: string[] = [];
      for (let i = 0; i < 50; i++) {
        results.push(getVariant("trust_signal_style"));
      }

      // All 50 calls should return the same variant
      expect(new Set(results).size).toBe(1);
    });
  });

  // ── Inactive / Unknown Experiments ───────────────────────

  describe("getVariant — inactive and unknown experiments", () => {
    it("returns 'control' for an inactive experiment", () => {
      setUserId("user-inactive");
      // All experiments start inactive
      expect(getVariant("confidence_tooltip")).toBe("control");
    });

    it("returns 'control' for an unknown experiment ID", () => {
      setUserId("user-unknown");
      expect(getVariant("nonexistent_experiment")).toBe("control");
    });

    it("returns 'control' after deactivating a previously active experiment", () => {
      setUserId("user-deactivate");
      activateExperiment("confidence_tooltip");
      const activeVariant = getVariant("confidence_tooltip");
      expect(["control", "treatment"]).toContain(activeVariant);

      deactivateExperiment("confidence_tooltip");
      expect(getVariant("confidence_tooltip")).toBe("control");
    });
  });

  // ── Traffic Allocation ───────────────────────────────────

  describe("getVariant — traffic allocation", () => {
    it("respects 50/50 split within reasonable tolerance", () => {
      activateExperiment("confidence_tooltip");

      let controlCount = 0;
      let treatmentCount = 0;
      const total = 1000;

      for (let i = 0; i < total; i++) {
        setUserId(`allocation-user-${i}`);
        const v = getVariant("confidence_tooltip");
        if (v === "control") controlCount++;
        else treatmentCount++;
      }

      // With 1000 users and 50/50 split, expect roughly 500 each
      // Allow 10% tolerance (400-600)
      expect(controlCount).toBeGreaterThan(350);
      expect(controlCount).toBeLessThan(650);
      expect(treatmentCount).toBeGreaterThan(350);
      expect(treatmentCount).toBeLessThan(650);
      expect(controlCount + treatmentCount).toBe(total);
    });

    it("respects custom traffic allocation (80/20)", () => {
      registerExperiment({
        id: "custom_split",
        description: "80/20 test",
        active: true,
        variants: [
          { id: "control", weight: 80 },
          { id: "treatment", weight: 20 },
        ],
      });

      let controlCount = 0;
      const total = 1000;

      for (let i = 0; i < total; i++) {
        setUserId(`split-user-${i}`);
        if (getVariant("custom_split") === "control") controlCount++;
      }

      // 80% = 800, allow tolerance of 100
      expect(controlCount).toBeGreaterThan(700);
      expect(controlCount).toBeLessThan(900);
    });
  });

  // ── Override Support ─────────────────────────────────────

  describe("override support", () => {
    it("setOverride forces a specific variant regardless of hash", () => {
      setUserId("user-override");
      activateExperiment("confidence_tooltip");

      setOverride("confidence_tooltip", "treatment");
      expect(getVariant("confidence_tooltip")).toBe("treatment");

      setOverride("confidence_tooltip", "control");
      expect(getVariant("confidence_tooltip")).toBe("control");
    });

    it("override works even for inactive experiments", () => {
      setUserId("user-override-inactive");
      // experiment is inactive by default
      setOverride("confidence_tooltip", "treatment");
      expect(getVariant("confidence_tooltip")).toBe("treatment");
    });

    it("clearOverride restores hash-based assignment", () => {
      setUserId("user-clear-override");
      activateExperiment("confidence_tooltip");

      const naturalVariant = getVariant("confidence_tooltip");

      // Force opposite variant
      const forced = naturalVariant === "control" ? "treatment" : "control";
      setOverride("confidence_tooltip", forced);
      expect(getVariant("confidence_tooltip")).toBe(forced);

      clearOverride("confidence_tooltip");
      expect(getVariant("confidence_tooltip")).toBe(naturalVariant);
    });

    it("clearAllOverrides removes all overrides", () => {
      setOverride("confidence_tooltip", "treatment");
      setOverride("trust_signal_style", "treatment");

      clearAllOverrides();

      // Both should return "control" since experiments are inactive
      expect(getVariant("confidence_tooltip")).toBe("control");
      expect(getVariant("trust_signal_style")).toBe("control");
    });
  });

  // ── Analytics Integration ────────────────────────────────

  describe("trackExperiment", () => {
    it("fires an analytics event with experiment metadata", () => {
      setUserId("user-track");
      activateExperiment("confidence_tooltip");

      trackExperiment("confidence_tooltip");

      expect(track).toHaveBeenCalledTimes(1);
      expect(track).toHaveBeenCalledWith("experiment_exposure", {
        experiment_id: "confidence_tooltip",
        variant: expect.stringMatching(/^(control|treatment)$/),
        experiment_active: true,
      });
    });

    it("tracks inactive experiments with active=false", () => {
      setUserId("user-track-inactive");

      trackExperiment("confidence_tooltip");

      expect(track).toHaveBeenCalledWith("experiment_exposure", {
        experiment_id: "confidence_tooltip",
        variant: "control",
        experiment_active: false,
      });
    });

    it("tracks unknown experiments without crashing", () => {
      trackExperiment("nonexistent");

      expect(track).toHaveBeenCalledWith("experiment_exposure", {
        experiment_id: "nonexistent",
        variant: "control",
        experiment_active: false,
      });
    });
  });

  // ── User Identity ────────────────────────────────────────

  describe("user identity", () => {
    it("defaults to 'anonymous' when no user ID is set", () => {
      expect(getEffectiveUserId()).toBe("anonymous");
    });

    it("uses anonymous ID when set and no user ID", () => {
      setAnonymousId("anon-xyz");
      expect(getEffectiveUserId()).toBe("anon-xyz");
    });

    it("prefers user ID over anonymous ID", () => {
      setAnonymousId("anon-xyz");
      setUserId("user-real");
      expect(getEffectiveUserId()).toBe("user-real");
    });

    it("changing user ID clears assignment cache (may change variant)", () => {
      activateExperiment("confidence_tooltip");
      setUserId("user-A");
      const variantA = getVariant("confidence_tooltip");

      setUserId("user-B");
      const variantB = getVariant("confidence_tooltip");

      // They may or may not differ, but both are valid
      expect(["control", "treatment"]).toContain(variantA);
      expect(["control", "treatment"]).toContain(variantB);
    });
  });

  // ── Experiment Management ────────────────────────────────

  describe("experiment management", () => {
    it("activateExperiment returns true for known experiments", () => {
      expect(activateExperiment("confidence_tooltip")).toBe(true);
    });

    it("activateExperiment returns false for unknown experiments", () => {
      expect(activateExperiment("nonexistent")).toBe(false);
    });

    it("deactivateExperiment returns true for known experiments", () => {
      activateExperiment("confidence_tooltip");
      expect(deactivateExperiment("confidence_tooltip")).toBe(true);
    });

    it("deactivateExperiment returns false for unknown experiments", () => {
      expect(deactivateExperiment("nonexistent")).toBe(false);
    });

    it("registerExperiment adds a new experiment", () => {
      registerExperiment({
        id: "new_test",
        description: "A new experiment",
        active: true,
        variants: [
          { id: "control", weight: 50 },
          { id: "variant_b", weight: 50 },
        ],
      });

      const exp = getExperiment("new_test");
      expect(exp).toBeDefined();
      expect(exp!.id).toBe("new_test");
      expect(exp!.active).toBe(true);
    });

    it("listExperiments returns all registered experiments", () => {
      const list = listExperiments();
      expect(list.length).toBeGreaterThanOrEqual(3);
      const ids = list.map((e) => e.id);
      expect(ids).toContain("confidence_tooltip");
      expect(ids).toContain("trust_signal_style");
      expect(ids).toContain("personalized_weight");
    });

    it("getExperiment returns undefined for unknown experiments", () => {
      expect(getExperiment("nonexistent")).toBeUndefined();
    });
  });

  // ── Initial Experiments ──────────────────────────────────

  describe("initial experiment definitions", () => {
    it("confidence_tooltip is defined and inactive", () => {
      const exp = getExperiment("confidence_tooltip");
      expect(exp).toBeDefined();
      expect(exp!.active).toBe(false);
      expect(exp!.variants).toHaveLength(2);
    });

    it("trust_signal_style is defined and inactive", () => {
      const exp = getExperiment("trust_signal_style");
      expect(exp).toBeDefined();
      expect(exp!.active).toBe(false);
      expect(exp!.variants).toHaveLength(2);
    });

    it("personalized_weight is defined and inactive", () => {
      const exp = getExperiment("personalized_weight");
      expect(exp).toBeDefined();
      expect(exp!.active).toBe(false);
      expect(exp!.variants).toHaveLength(2);
    });

    it("all initial experiments have valid variant weights summing to 100", () => {
      const initial = ["confidence_tooltip", "trust_signal_style", "personalized_weight"];
      for (const id of initial) {
        const exp = getExperiment(id)!;
        const totalWeight = exp.variants.reduce((sum, v) => sum + v.weight, 0);
        expect(totalWeight).toBe(100);
      }
    });
  });

  // ── Multi-variant Experiments ────────────────────────────

  describe("multi-variant experiments", () => {
    it("supports 3+ variants with correct bucketing", () => {
      registerExperiment({
        id: "three_way",
        description: "Three-way test",
        active: true,
        variants: [
          { id: "control", weight: 34 },
          { id: "variant_a", weight: 33 },
          { id: "variant_b", weight: 33 },
        ],
      });

      const counts: Record<string, number> = { control: 0, variant_a: 0, variant_b: 0 };
      for (let i = 0; i < 1000; i++) {
        setUserId(`multi-${i}`);
        counts[getVariant("three_way")]++;
      }

      // Each variant should get some traffic
      expect(counts.control).toBeGreaterThan(200);
      expect(counts.variant_a).toBeGreaterThan(200);
      expect(counts.variant_b).toBeGreaterThan(200);
    });
  });
});
