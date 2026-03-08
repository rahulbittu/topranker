/**
 * Unit Tests — Experiment Exposure & Outcome Tracking (Sprint 142)
 * Owner: Sarah Nakamura (Lead Engineer)
 *
 * Covers:
 * - trackExposure stores correct data
 * - getExposureStats returns correct counts per variant
 * - trackOutcome records actions
 * - getOutcomeStats computes conversion rates
 * - clearExposures resets state
 * - Duplicate exposures for same user+experiment are handled
 * - getUserExperiments returns enrolled experiment IDs
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  trackExposure,
  getExposures,
  getExposureStats,
  trackOutcome,
  getOutcomeStats,
  getUserExperiments,
  clearExposures,
} from "../server/experiment-tracker";

// ─── Setup ───────────────────────────────────────────────────

beforeEach(() => {
  clearExposures();
});

// ─── Exposure Tracking ───────────────────────────────────────

describe("trackExposure", () => {
  it("stores correct exposure data", () => {
    trackExposure("user1", "confidence_tooltip", "treatment", "business_page");

    const all = getExposures();
    expect(all).toHaveLength(1);
    expect(all[0].userId).toBe("user1");
    expect(all[0].experimentId).toBe("confidence_tooltip");
    expect(all[0].variant).toBe("treatment");
    expect(all[0].context).toBe("business_page");
    expect(all[0].exposedAt).toBeGreaterThan(0);
  });

  it("stores multiple exposures for different experiments", () => {
    trackExposure("user1", "confidence_tooltip", "control", "rankings");
    trackExposure("user1", "trust_signal_style", "treatment", "search");

    const all = getExposures();
    expect(all).toHaveLength(2);
  });

  it("stores exposures for different users in the same experiment", () => {
    trackExposure("user1", "confidence_tooltip", "control", "rankings");
    trackExposure("user2", "confidence_tooltip", "treatment", "rankings");

    const filtered = getExposures("confidence_tooltip");
    expect(filtered).toHaveLength(2);
  });

  it("deduplicates same user + same experiment", () => {
    trackExposure("user1", "confidence_tooltip", "control", "rankings");
    trackExposure("user1", "confidence_tooltip", "control", "search"); // duplicate

    const all = getExposures();
    expect(all).toHaveLength(1);
    // Keeps the first context
    expect(all[0].context).toBe("rankings");
  });
});

// ─── getExposures Filtering ──────────────────────────────────

describe("getExposures", () => {
  it("returns all exposures when no experimentId filter", () => {
    trackExposure("user1", "exp_a", "control", "page1");
    trackExposure("user2", "exp_b", "treatment", "page2");

    expect(getExposures()).toHaveLength(2);
  });

  it("filters by experimentId", () => {
    trackExposure("user1", "exp_a", "control", "page1");
    trackExposure("user2", "exp_b", "treatment", "page2");

    expect(getExposures("exp_a")).toHaveLength(1);
    expect(getExposures("exp_a")[0].userId).toBe("user1");
  });

  it("returns empty array for unknown experiment", () => {
    expect(getExposures("nonexistent")).toHaveLength(0);
  });
});

// ─── Exposure Stats ──────────────────────────────────────────

describe("getExposureStats", () => {
  it("returns zeroed stats for unknown experiment", () => {
    const stats = getExposureStats("nonexistent");
    expect(stats.total).toBe(0);
    expect(stats.byVariant).toEqual({});
    expect(stats.uniqueUsers).toBe(0);
    expect(stats.firstExposure).toBeNull();
    expect(stats.lastExposure).toBeNull();
  });

  it("returns correct counts per variant", () => {
    trackExposure("user1", "exp_a", "control", "page1");
    trackExposure("user2", "exp_a", "treatment", "page1");
    trackExposure("user3", "exp_a", "control", "page1");

    const stats = getExposureStats("exp_a");
    expect(stats.total).toBe(3);
    expect(stats.byVariant).toEqual({ control: 2, treatment: 1 });
    expect(stats.uniqueUsers).toBe(3);
  });

  it("tracks first and last exposure timestamps", () => {
    trackExposure("user1", "exp_a", "control", "page1");
    trackExposure("user2", "exp_a", "treatment", "page1");

    const stats = getExposureStats("exp_a");
    expect(stats.firstExposure).toBeGreaterThan(0);
    expect(stats.lastExposure).toBeGreaterThanOrEqual(stats.firstExposure!);
  });

  it("counts unique users correctly even with dedup", () => {
    trackExposure("user1", "exp_a", "control", "page1");
    trackExposure("user1", "exp_a", "control", "page2"); // deduped

    const stats = getExposureStats("exp_a");
    expect(stats.uniqueUsers).toBe(1);
    expect(stats.total).toBe(1);
  });
});

// ─── Outcome Tracking ────────────────────────────────────────

describe("trackOutcome", () => {
  it("records an outcome action for an exposed user", () => {
    trackExposure("user1", "exp_a", "treatment", "page1");
    trackOutcome("user1", "exp_a", "rated", 4.5);

    const stats = getOutcomeStats("exp_a");
    expect(stats.total).toBe(1);
    expect(stats.byAction).toEqual({ rated: 1 });
  });

  it("does NOT record outcome for user without exposure", () => {
    trackOutcome("user_no_exposure", "exp_a", "rated", 3);

    const stats = getOutcomeStats("exp_a");
    expect(stats.total).toBe(0);
  });

  it("records multiple outcomes for same user", () => {
    trackExposure("user1", "exp_a", "treatment", "page1");
    trackOutcome("user1", "exp_a", "rated", 4);
    trackOutcome("user1", "exp_a", "returned");

    const stats = getOutcomeStats("exp_a");
    expect(stats.total).toBe(2);
    expect(stats.byAction).toEqual({ rated: 1, returned: 1 });
  });

  it("correctly associates variant from exposure", () => {
    trackExposure("user1", "exp_a", "treatment", "page1");
    trackExposure("user2", "exp_a", "control", "page1");
    trackOutcome("user1", "exp_a", "rated", 5);
    trackOutcome("user2", "exp_a", "rated", 3);

    const stats = getOutcomeStats("exp_a");
    expect(stats.byVariant.treatment.total).toBe(1);
    expect(stats.byVariant.control.total).toBe(1);
  });
});

// ─── Outcome Stats & Conversion Rates ───────────────────────

describe("getOutcomeStats", () => {
  it("returns empty stats for no outcomes", () => {
    const stats = getOutcomeStats("nonexistent");
    expect(stats.total).toBe(0);
    expect(stats.byAction).toEqual({});
    expect(stats.byVariant).toEqual({});
    expect(stats.conversionRates).toEqual({});
  });

  it("computes conversion rates correctly", () => {
    // 2 control users, 1 rates
    trackExposure("c1", "exp_a", "control", "page1");
    trackExposure("c2", "exp_a", "control", "page1");
    // 2 treatment users, 2 rate
    trackExposure("t1", "exp_a", "treatment", "page1");
    trackExposure("t2", "exp_a", "treatment", "page1");

    trackOutcome("c1", "exp_a", "rated", 4);
    trackOutcome("t1", "exp_a", "rated", 5);
    trackOutcome("t2", "exp_a", "rated", 4);

    const stats = getOutcomeStats("exp_a");

    // Control: 1 rated / 2 exposed = 50%
    const controlRates = stats.conversionRates.control;
    expect(controlRates).toBeDefined();
    const controlRated = controlRates!.find((r) => r.action === "rated");
    expect(controlRated!.rate).toBe(50);

    // Treatment: 2 rated / 2 exposed = 100%
    const treatmentRates = stats.conversionRates.treatment;
    expect(treatmentRates).toBeDefined();
    const treatmentRated = treatmentRates!.find((r) => r.action === "rated");
    expect(treatmentRated!.rate).toBe(100);
  });

  it("tracks unique users per variant in outcomes", () => {
    trackExposure("user1", "exp_a", "treatment", "page1");
    trackOutcome("user1", "exp_a", "rated", 4);
    trackOutcome("user1", "exp_a", "returned");

    const stats = getOutcomeStats("exp_a");
    expect(stats.byVariant.treatment.uniqueUsers).toBe(1);
    expect(stats.byVariant.treatment.total).toBe(2);
  });
});

// ─── getUserExperiments ──────────────────────────────────────

describe("getUserExperiments", () => {
  it("returns experiment IDs a user is enrolled in", () => {
    trackExposure("user1", "exp_a", "control", "page1");
    trackExposure("user1", "exp_b", "treatment", "page2");

    const experiments = getUserExperiments("user1");
    expect(experiments).toEqual(["exp_a", "exp_b"]);
  });

  it("returns empty array for unknown user", () => {
    expect(getUserExperiments("ghost")).toEqual([]);
  });
});

// ─── clearExposures ──────────────────────────────────────────

describe("clearExposures", () => {
  it("resets all exposures and outcomes", () => {
    trackExposure("user1", "exp_a", "control", "page1");
    trackOutcome("user1", "exp_a", "rated", 5);

    expect(getExposures()).toHaveLength(1);
    expect(getOutcomeStats("exp_a").total).toBe(1);

    clearExposures();

    expect(getExposures()).toHaveLength(0);
    expect(getOutcomeStats("exp_a").total).toBe(0);
  });

  it("allows fresh tracking after clear", () => {
    trackExposure("user1", "exp_a", "control", "page1");
    clearExposures();

    trackExposure("user1", "exp_a", "treatment", "page2");
    const all = getExposures();
    expect(all).toHaveLength(1);
    expect(all[0].variant).toBe("treatment");
    expect(all[0].context).toBe("page2");
  });
});
