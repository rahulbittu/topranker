/**
 * Sprint 284 — Cuisine Picker on Discover/Search Page
 *
 * Validates:
 * 1. Search page imports cuisine picker functions
 * 2. Cuisine tabs render in Best In section
 * 3. Best In items filter by selected cuisine
 * 4. Cuisine tab styles exist
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 284: Search Page Cuisine Picker", () => {
  const searchSrc = readFile("app/(tabs)/search.tsx");

  it("imports getCategoriesByCuisine", () => {
    expect(searchSrc).toContain("getCategoriesByCuisine");
  });

  it("imports getAvailableCuisines", () => {
    expect(searchSrc).toContain("getAvailableCuisines");
  });

  it("imports CUISINE_DISPLAY", () => {
    expect(searchSrc).toContain("CUISINE_DISPLAY");
  });

  it("has bestInCuisine state", () => {
    expect(searchSrc).toContain("bestInCuisine");
  });

  it("filters bestInItems by cuisine", () => {
    expect(searchSrc).toContain("getCategoriesByCuisine(bestInCuisine)");
  });

  it("limits All mode to 15 items", () => {
    expect(searchSrc).toContain("getActiveCategories().slice(0, 15)");
  });

  it("has cuisineTab style", () => {
    expect(searchSrc).toContain("cuisineTab:");
  });

  it("has cuisineTabActive style", () => {
    expect(searchSrc).toContain("cuisineTabActive:");
  });

  it("has cuisineTabsScroll style", () => {
    expect(searchSrc).toContain("cuisineTabsScroll:");
  });

  it("renders cuisine display emoji and label", () => {
    expect(searchSrc).toContain("display.emoji");
    expect(searchSrc).toContain("display.label");
  });

  it("uses bestInItems instead of getActiveCategories() directly", () => {
    expect(searchSrc).toContain("bestInItems.map");
  });
});
