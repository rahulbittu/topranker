/**
 * Sprint 311: Dish Leaderboard Shortcuts on Discover (BestInSection)
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 311 — Discover Dish Shortcuts", () => {
  const bestInSrc = readFile("components/search/BestInSection.tsx");

  it("BestInSection uses useDishShortcuts hook (replaced CUISINE_DISH_MAP in Sprint 312)", () => {
    expect(bestInSrc).toContain("useDishShortcuts");
  });

  it("shows dish shortcuts when hook returns results", () => {
    expect(bestInSrc).toContain("dishShortcuts.length > 0");
  });

  it("dish chip shows emoji and Best {name}", () => {
    expect(bestInSrc).toContain("Best {dish.name}");
  });

  it("dish chip calls onSelectDish with slug", () => {
    expect(bestInSrc).toContain("onSelectDish?.(dish.slug)");
  });

  it("dish chip has chevron-forward icon", () => {
    expect(bestInSrc).toContain("chevron-forward");
  });

  it("dish chip has accessibility label", () => {
    expect(bestInSrc).toContain("Best ${dish.name} leaderboard");
  });

  it("has dishShortcutsScroll style", () => {
    expect(bestInSrc).toContain("dishShortcutsScroll");
  });

  it("has dishShortcutChip style with amber tint", () => {
    expect(bestInSrc).toContain("dishShortcutChip");
    expect(bestInSrc).toContain("rgba(196,154,26,0.08)");
  });

  it("dish shortcuts appear between cuisine tabs and Best In cards", () => {
    const cuisineTabIdx = bestInSrc.indexOf("cuisineTabsScroll");
    const dishIdx = bestInSrc.indexOf("dishShortcutsScroll");
    const bestInScrollIdx = bestInSrc.indexOf("bestInScroll");
    expect(dishIdx).toBeGreaterThan(cuisineTabIdx);
    expect(dishIdx).toBeLessThan(bestInScrollIdx);
  });

  it("sprint doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/sprints/SPRINT-311-DISCOVER-DISH-SHORTCUTS.md"))).toBe(true);
  });

  it("retro doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/retros/RETRO-311-DISCOVER-DISH-SHORTCUTS.md"))).toBe(true);
  });
});
