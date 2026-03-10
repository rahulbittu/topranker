/**
 * Sprint 306: Rankings Cuisine-to-Dish Drill-Down
 *
 * When a cuisine is selected on Rankings, show dish leaderboard shortcuts
 * that navigate to /dish/[slug] pages.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 306 — Cuisine-to-Dish Drill-Down", () => {
  // ─── CUISINE_DISH_MAP in shared module ─────────────────────

  const sharedSrc = readFile("shared/best-in-categories.ts");

  it("CUISINE_DISH_MAP is exported from shared/best-in-categories", () => {
    expect(sharedSrc).toContain("export const CUISINE_DISH_MAP");
  });

  it("indian cuisine maps to biryani and dosa", () => {
    expect(sharedSrc).toMatch(/indian:.*biryani/s);
    expect(sharedSrc).toMatch(/indian:.*dosa/s);
  });

  it("mexican cuisine maps to taco", () => {
    expect(sharedSrc).toMatch(/mexican:.*taco/s);
  });

  it("japanese cuisine maps to ramen", () => {
    expect(sharedSrc).toMatch(/japanese:.*ramen/s);
  });

  it("american cuisine maps to burger and brisket", () => {
    expect(sharedSrc).toMatch(/american:.*burger/s);
    expect(sharedSrc).toMatch(/american:.*brisket/s);
  });

  it("mediterranean cuisine maps to kebab", () => {
    expect(sharedSrc).toMatch(/mediterranean:.*kebab/s);
  });

  it("each dish entry has slug, name, and emoji", () => {
    // Check structure of at least one entry
    expect(sharedSrc).toMatch(/slug:\s*"biryani"/);
    expect(sharedSrc).toMatch(/name:\s*"Biryani"/);
    expect(sharedSrc).toMatch(/emoji:\s*"🍛"/);
  });

  // ─── Rankings page integration ─────────────────────────────

  const indexSrc = readFile("app/(tabs)/index.tsx");
  const headerSrc = readFile("components/leaderboard/RankingsListHeader.tsx");

  it("Rankings uses useDishShortcuts hook (replaced CUISINE_DISH_MAP in Sprint 312)", () => {
    expect(indexSrc).toContain("useDishShortcuts");
  });

  it("Rankings shows dish shortcuts when hook returns results", () => {
    expect(indexSrc).toContain("dishShortcuts.length > 0");
  });

  it("dish shortcuts row has 'Dish Rankings:' label", () => {
    expect(headerSrc).toContain("Dish Rankings:");
  });

  it("dish chip shows 'Best {name}' text", () => {
    expect(indexSrc).toContain("Best {dish.name}");
  });

  it("dish chip navigates to /dish/[slug]", () => {
    expect(indexSrc).toContain('pathname: "/dish/[slug]"');
    expect(indexSrc).toContain("params: { slug: dish.slug }");
  });

  it("dish chip triggers haptics", () => {
    expect(indexSrc).toContain("Haptics.selectionAsync()");
  });

  it("dish chip tracks analytics", () => {
    expect(headerSrc).toContain("Analytics.dishDeepLinkTap(dish.slug)");
  });

  // ─── Styles ────────────────────────────────────────────────

  it("has dishShortcutsRow style", () => {
    expect(headerSrc).toContain("dishShortcutsRow");
  });

  it("has dishShortcutChip style with amber tint", () => {
    expect(headerSrc).toContain("dishShortcutChip");
    expect(headerSrc).toContain("rgba(196,154,26,0.08)");
  });

  // ─── Sprint docs ──────────────────────────────────────────

  it("sprint doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/sprints/SPRINT-306-CUISINE-DISH-DRILLDOWN.md"))).toBe(true);
  });

  it("retro doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/retros/RETRO-306-CUISINE-DISH-DRILLDOWN.md"))).toBe(true);
  });
});
