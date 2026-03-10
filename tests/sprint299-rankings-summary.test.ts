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
const headerSrc = fs.readFileSync(
  path.resolve("components/leaderboard/RankingsListHeader.tsx"), "utf-8",
);

describe("Sprint 299 — Rankings summary content", () => {
  it("shows filtered business count", () => {
    expect(headerSrc).toContain("filteredCount");
    expect(headerSrc).toMatch(/filteredCount.*ranked/);
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
    expect(headerSrc).toMatch(/filteredCount\s*>\s*0/);
  });
});

describe("Sprint 299 — Rankings summary styles", () => {
  it("defines rankingSummary style", () => {
    expect(headerSrc).toContain("rankingSummary:");
  });

  it("defines rankingSummaryText style", () => {
    expect(headerSrc).toContain("rankingSummaryText:");
  });

  it("defines rankingSummaryTime style", () => {
    expect(headerSrc).toContain("rankingSummaryTime:");
  });
});
