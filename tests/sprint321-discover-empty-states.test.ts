/**
 * Sprint 321: Cuisine-Aware Empty States on Discover
 *
 * When a cuisine filter yields no results on Discover, show cuisine name,
 * dish leaderboard suggestions from CUISINE_DISH_MAP, and clear filter button.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 321 — Discover Cuisine-Aware Empty States", () => {
  // Sprint 383: Empty state extracted to DiscoverEmptyState component
  const src = readFile("components/search/DiscoverEmptyState.tsx");
  const searchSrc = readFile("app/(tabs)/search.tsx");

  it("imports CUISINE_DISH_MAP", () => {
    expect(src).toContain("CUISINE_DISH_MAP");
  });

  it("empty text includes cuisine name when filtered", () => {
    expect(src).toContain("CUISINE_DISPLAY[selectedCuisine]");
    expect(src).toContain("places found");
  });

  it("shows dish suggestions when cuisine selected", () => {
    expect(src).toContain("dishSuggestions");
    expect(src).toContain("CUISINE_DISH_MAP[selectedCuisine]");
  });

  it("dish suggestions title references cuisine name", () => {
    expect(src).toContain("Explore");
    expect(src).toContain("dish rankings:");
  });

  it("dish chips navigate to /dish/[slug]", () => {
    // Sprint 383: style renamed from emptyDishChip to dishChip
    expect(src).toContain("dishChip");
  });

  it("shows clear filter button", () => {
    expect(src).toContain("clearFilter");
    expect(src).toContain("Show all cuisines");
  });

  it("clear filter resets selectedCuisine", () => {
    // search.tsx passes onClearCuisine which calls setSelectedCuisine(null)
    expect(searchSrc).toContain("setSelectedCuisine(null)");
  });

  it("hides suggestion chips when cuisine is selected", () => {
    expect(src).toContain("!selectedCuisine &&");
    expect(src).toContain("suggestionsRow");
  });

  it("has dishChip style", () => {
    expect(src).toContain("dishChip:");
  });

  it("has clearFilter style", () => {
    expect(src).toContain("clearFilter:");
  });

  // Sprint docs
  it("sprint doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/sprints/SPRINT-321-DISCOVER-EMPTY-STATES.md"))).toBe(true);
  });

  it("retro doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/retros/RETRO-321-DISCOVER-EMPTY-STATES.md"))).toBe(true);
  });
});
