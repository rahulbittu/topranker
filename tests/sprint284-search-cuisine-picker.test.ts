/**
 * Sprint 284 — Cuisine Picker on Discover/Search Page
 *
 * Validates:
 * 1. Search page uses BestInSection component (extracted Sprint 287)
 * 2. BestInSection has cuisine picker logic
 * 3. Best In items filter by selected cuisine
 * 4. Cuisine tab styles exist in component
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 284: Search Page Cuisine Picker", () => {
  const searchSrc = readFile("app/(tabs)/search.tsx");
  const bestInSrc = readFile("components/search/BestInSection.tsx");

  it("search.tsx uses BestInSection component", () => {
    // Sprint 571: redirected to DiscoverSections
    const discoverSrc = readFile("components/search/DiscoverSections.tsx");
    expect(discoverSrc).toContain("BestInSection");
    expect(discoverSrc).toContain("<BestInSection");
  });

  it("BestInSection imports getCategoriesByCuisine", () => {
    expect(bestInSrc).toContain("getCategoriesByCuisine");
  });

  it("BestInSection imports getAvailableCuisines", () => {
    expect(bestInSrc).toContain("getAvailableCuisines");
  });

  it("BestInSection imports CUISINE_DISPLAY", () => {
    expect(bestInSrc).toContain("CUISINE_DISPLAY");
  });

  it("has bestInCuisine state in component", () => {
    expect(bestInSrc).toContain("bestInCuisine");
  });

  it("filters bestInItems by cuisine", () => {
    expect(bestInSrc).toContain("getCategoriesByCuisine(bestInCuisine)");
  });

  it("limits All mode to 15 items", () => {
    expect(bestInSrc).toContain("getActiveCategories().slice(0, 15)");
  });

  it("has cuisineTab style", () => {
    expect(bestInSrc).toContain("cuisineTab:");
  });

  it("has cuisineTabActive style", () => {
    expect(bestInSrc).toContain("cuisineTabActive:");
  });

  it("has cuisineTabsScroll style", () => {
    expect(bestInSrc).toContain("cuisineTabsScroll:");
  });

  it("renders cuisine display emoji and label", () => {
    expect(bestInSrc).toContain("display.emoji");
    expect(bestInSrc).toContain("display.label");
  });
});
