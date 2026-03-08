import { describe, it, expect } from "vitest";
import {
  CATEGORY_MAP,
  CATEGORY_CONFIDENCE_THRESHOLDS,
  DEFAULT_THRESHOLDS,
  getRankConfidence,
} from "../lib/data";

describe("Sprint 136 — Category Confidence Threshold Coverage", () => {
  const categorySlug = Object.values(CATEGORY_MAP);
  const thresholdKeys = Object.keys(CATEGORY_CONFIDENCE_THRESHOLDS);

  it("every CATEGORY_MAP entry has a corresponding threshold", () => {
    const missing = categorySlug.filter((slug) => !(slug in CATEGORY_CONFIDENCE_THRESHOLDS));
    expect(missing).toEqual([]);
  });

  it("no orphan thresholds exist without a CATEGORY_MAP match", () => {
    const slugSet = new Set(categorySlug);
    const orphans = thresholdKeys.filter((key) => !slugSet.has(key));
    expect(orphans).toEqual([]);
  });

  it("coverage percentage is exactly 100%", () => {
    const covered = categorySlug.filter((slug) => slug in CATEGORY_CONFIDENCE_THRESHOLDS).length;
    const pct = (covered / categorySlug.length) * 100;
    expect(pct).toBe(100);
  });

  it("all thresholds are monotonically increasing (provisional < early < established)", () => {
    for (const [key, t] of Object.entries(CATEGORY_CONFIDENCE_THRESHOLDS)) {
      expect(t.provisional).toBeLessThan(t.early);
      expect(t.early).toBeLessThan(t.established);
    }
  });

  it("all threshold values are positive integers", () => {
    for (const [key, t] of Object.entries(CATEGORY_CONFIDENCE_THRESHOLDS)) {
      for (const val of [t.provisional, t.early, t.established]) {
        expect(val).toBeGreaterThan(0);
        expect(Number.isInteger(val)).toBe(true);
      }
    }
  });

  it("DEFAULT_THRESHOLDS are also monotonically increasing", () => {
    expect(DEFAULT_THRESHOLDS.provisional).toBeLessThan(DEFAULT_THRESHOLDS.early);
    expect(DEFAULT_THRESHOLDS.early).toBeLessThan(DEFAULT_THRESHOLDS.established);
  });

  it("high-volume categories have lower thresholds than niche categories", () => {
    const highVol = CATEGORY_CONFIDENCE_THRESHOLDS["fast_food"];
    const niche = CATEGORY_CONFIDENCE_THRESHOLDS["fine_dining"];
    expect(highVol.established).toBeLessThan(niche.established);
  });

  it("street_food and ice_cream use high-volume thresholds", () => {
    const streetFood = CATEGORY_CONFIDENCE_THRESHOLDS["street_food"];
    const iceCream = CATEGORY_CONFIDENCE_THRESHOLDS["ice_cream"];
    const fastFood = CATEGORY_CONFIDENCE_THRESHOLDS["fast_food"];
    expect(streetFood).toEqual(fastFood);
    expect(iceCream).toEqual(fastFood);
  });

  it("bakery and bubble_tea use default-range thresholds", () => {
    const bakery = CATEGORY_CONFIDENCE_THRESHOLDS["bakery"];
    const bubbleTea = CATEGORY_CONFIDENCE_THRESHOLDS["bubble_tea"];
    expect(bakery).toEqual(DEFAULT_THRESHOLDS);
    expect(bubbleTea).toEqual(DEFAULT_THRESHOLDS);
  });

  it("getRankConfidence uses category-specific thresholds when available", () => {
    // fine_dining provisional threshold is 5
    expect(getRankConfidence(4, "fine_dining")).toBe("provisional");
    // fast_food provisional threshold is 3, early is 8
    expect(getRankConfidence(4, "fast_food")).toBe("early");
  });

  it("getRankConfidence falls back to DEFAULT_THRESHOLDS for unknown categories", () => {
    expect(getRankConfidence(2, "unknown_cat")).toBe("provisional");
    expect(getRankConfidence(5, "unknown_cat")).toBe("early");
    expect(getRankConfidence(25, "unknown_cat")).toBe("strong");
  });

  it("threshold count matches CATEGORY_MAP entry count", () => {
    expect(thresholdKeys.length).toBe(categorySlug.length);
  });
});
