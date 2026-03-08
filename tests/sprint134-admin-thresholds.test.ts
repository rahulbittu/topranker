import { describe, it, expect } from "vitest";
import { CATEGORY_CONFIDENCE_THRESHOLDS, DEFAULT_THRESHOLDS } from "../lib/data";

describe("Sprint 134 — Admin Confidence Thresholds Endpoint", () => {
  const thresholds = CATEGORY_CONFIDENCE_THRESHOLDS;
  const defaults = DEFAULT_THRESHOLDS;

  it("returns all category thresholds as a non-empty record", () => {
    expect(Object.keys(thresholds).length).toBeGreaterThan(0);
    for (const [key, val] of Object.entries(thresholds)) {
      expect(typeof key).toBe("string");
      expect(val).toHaveProperty("provisional");
      expect(val).toHaveProperty("early");
      expect(val).toHaveProperty("established");
    }
  });

  it("includes expected categories (fine_dining, fast_food, casual_dining, brewery)", () => {
    expect(thresholds).toHaveProperty("fine_dining");
    expect(thresholds).toHaveProperty("fast_food");
    expect(thresholds).toHaveProperty("casual_dining");
    expect(thresholds).toHaveProperty("brewery");
  });

  it("includes default thresholds with provisional, early, and established", () => {
    expect(defaults).toHaveProperty("provisional");
    expect(defaults).toHaveProperty("early");
    expect(defaults).toHaveProperty("established");
  });

  it("each threshold has monotonic ordering: provisional < early < established", () => {
    for (const [, val] of Object.entries(thresholds)) {
      expect(val.provisional).toBeLessThan(val.early);
      expect(val.early).toBeLessThan(val.established);
    }
    // Also verify defaults
    expect(defaults.provisional).toBeLessThan(defaults.early);
    expect(defaults.early).toBeLessThan(defaults.established);
  });

  it("all threshold values are positive integers", () => {
    for (const [, val] of Object.entries(thresholds)) {
      for (const n of [val.provisional, val.early, val.established]) {
        expect(n).toBeGreaterThan(0);
        expect(Number.isInteger(n)).toBe(true);
      }
    }
    for (const n of [defaults.provisional, defaults.early, defaults.established]) {
      expect(n).toBeGreaterThan(0);
      expect(Number.isInteger(n)).toBe(true);
    }
  });

  it("fine_dining established > casual_dining established (stricter for niche)", () => {
    expect(thresholds.fine_dining.established).toBeGreaterThan(
      thresholds.casual_dining.established,
    );
  });

  it("default thresholds match expected values (3, 10, 25)", () => {
    expect(defaults.provisional).toBe(3);
    expect(defaults.early).toBe(10);
    expect(defaults.established).toBe(25);
  });

  it("unknown category is not present in thresholds map", () => {
    expect(thresholds).not.toHaveProperty("unknown_category_xyz");
    expect(thresholds).not.toHaveProperty("pizza_delivery");
  });
});
