/**
 * Sprint 299 — Rankings summary header tests
 *
 * Validates:
 * 1. Rankings page shows result count with cuisine label
 * 2. Last updated timestamp displayed via formatTimeAgo
 * 3. Summary styles defined
 * 4. Conditional rendering only when businesses exist
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const src = fs.readFileSync(
  path.resolve("app/(tabs)/index.tsx"), "utf-8",
);

describe("Sprint 299 — Rankings summary content", () => {
  it("shows filtered business count", () => {
    expect(src).toContain("filteredBiz.length");
    expect(src).toMatch(/filteredBiz\.length.*ranked/);
  });

  it("includes cuisine label when cuisine is selected", () => {
    expect(src).toContain("CUISINE_DISPLAY[selectedCuisine]");
    expect(src).toMatch(/selectedCuisine.*CUISINE_DISPLAY/);
  });

  it("includes category label in lowercase", () => {
    expect(src).toMatch(/getCategoryDisplay\(activeCategory\)\.label\.toLowerCase\(\)/);
  });

  it("shows last updated time via formatTimeAgo", () => {
    expect(src).toContain("formatTimeAgo(dataUpdatedAt)");
  });

  it("conditionally renders when dataUpdatedAt > 0", () => {
    expect(src).toMatch(/dataUpdatedAt\s*>\s*0/);
  });
});

describe("Sprint 299 — Rankings summary conditional rendering", () => {
  it("only shows when filteredBiz has items", () => {
    expect(src).toMatch(/filteredBiz\.length\s*>\s*0\s*&&/);
  });
});

describe("Sprint 299 — Rankings summary styles", () => {
  it("defines rankingSummary style", () => {
    expect(src).toContain("rankingSummary:");
  });

  it("defines rankingSummaryText style", () => {
    expect(src).toContain("rankingSummaryText:");
  });

  it("defines rankingSummaryTime style", () => {
    expect(src).toContain("rankingSummaryTime:");
  });
});
