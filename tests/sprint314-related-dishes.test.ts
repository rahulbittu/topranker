/**
 * Sprint 314: Related Dish Rankings + Dish Search Analytics
 *
 * When viewing a dish leaderboard, show related dishes from the same cuisine.
 * Track dish search match taps in analytics.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 314 — Related Dishes on Dish Leaderboard", () => {
  const dishSrc = readFile("app/dish/[slug].tsx");

  it("imports CUISINE_DISH_MAP for related dish lookup", () => {
    expect(dishSrc).toContain("CUISINE_DISH_MAP");
  });

  it("imports CUISINE_DISPLAY for cuisine labels", () => {
    expect(dishSrc).toContain("CUISINE_DISPLAY");
  });

  it("computes relatedDishes from CUISINE_DISH_MAP", () => {
    expect(dishSrc).toContain("relatedDishes");
    expect(dishSrc).toContain("CUISINE_DISH_MAP");
  });

  it("finds parent cuisine by matching dishSlug", () => {
    expect(dishSrc).toContain("d.slug === board.dishSlug");
  });

  it("filters out current dish from siblings", () => {
    expect(dishSrc).toContain("d.slug !== board.dishSlug");
  });

  it("renders related section when siblings exist", () => {
    expect(dishSrc).toContain("relatedDishes.dishes.length > 0");
    expect(dishSrc).toContain("relatedSection");
  });

  it("shows cuisine name in section title", () => {
    expect(dishSrc).toContain("More");
    expect(dishSrc).toContain("Rankings");
    expect(dishSrc).toContain("CUISINE_DISPLAY[relatedDishes.cuisine]");
  });

  it("related dish chips navigate to /dish/[slug]", () => {
    expect(dishSrc).toContain('pathname: "/dish/[slug]"');
    expect(dishSrc).toContain("d.slug");
  });

  it("tracks related dish taps in analytics", () => {
    expect(dishSrc).toContain("Analytics.relatedDishTap");
  });

  it("has styles for related section", () => {
    expect(dishSrc).toContain("relatedSection");
    expect(dishSrc).toContain("relatedChip");
    expect(dishSrc).toContain("relatedChipText");
  });
});

describe("Sprint 314 — Dish Search Analytics", () => {
  const analyticsSrc = readFile("lib/analytics.ts");
  const overlaySrc = readFile("components/search/SearchOverlays.tsx");

  it("analytics defines dish_search_match_tap event", () => {
    expect(analyticsSrc).toContain("dish_search_match_tap");
  });

  it("analytics defines related_dish_tap event", () => {
    expect(analyticsSrc).toContain("related_dish_tap");
  });

  it("Analytics.dishSearchMatchTap convenience function exists", () => {
    expect(analyticsSrc).toContain("dishSearchMatchTap");
  });

  it("Analytics.relatedDishTap convenience function exists", () => {
    expect(analyticsSrc).toContain("relatedDishTap");
  });

  it("SearchOverlays tracks dish search match tap on press", () => {
    expect(overlaySrc).toContain("Analytics.dishSearchMatchTap");
  });

  it("SearchOverlays imports Analytics", () => {
    expect(overlaySrc).toContain("import { Analytics }");
  });

  // Sprint docs
  it("sprint doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/sprints/SPRINT-314-RELATED-DISHES.md"))).toBe(true);
  });

  it("retro doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/retros/RETRO-314-RELATED-DISHES.md"))).toBe(true);
  });
});
