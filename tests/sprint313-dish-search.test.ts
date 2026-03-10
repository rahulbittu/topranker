/**
 * Sprint 313: Dish-Specific Search on Discover
 *
 * When user types "biryani" in search, show matching dish leaderboards
 * above business results in the autocomplete dropdown.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 313 — Dish-Specific Search", () => {
  const searchSrc = readFile("app/(tabs)/search.tsx");
  const overlaySrc = readFile("components/search/SearchOverlays.tsx");

  // ─── Autocomplete dropdown supports dish matches ───────────

  it("AutocompleteDropdown accepts dishMatches prop", () => {
    expect(overlaySrc).toContain("dishMatches");
  });

  it("DishMatch interface is exported", () => {
    expect(overlaySrc).toContain("export interface DishMatch");
  });

  it("dish matches render with emoji", () => {
    expect(overlaySrc).toContain("dish.emoji");
  });

  it("dish matches show 'Best {name}' text", () => {
    expect(overlaySrc).toContain("Best ${dish.name}");
  });

  it("dish matches navigate to /dish/[slug]", () => {
    expect(overlaySrc).toContain('pathname: "/dish/[slug]"');
  });

  it("dish matches show entry count or fallback", () => {
    expect(overlaySrc).toContain("spots ranked");
    expect(overlaySrc).toContain("Dish leaderboard");
  });

  it("dish match has 'Ranking' badge", () => {
    expect(overlaySrc).toContain("dishBadge");
    expect(overlaySrc).toContain("Ranking");
  });

  // ─── Search page computes dish matches ─────────────────────

  it("search.tsx stores full dish board info", () => {
    expect(searchSrc).toContain("DishBoardInfo");
  });

  it("search.tsx computes dishSearchMatches from query", () => {
    expect(searchSrc).toContain("dishSearchMatches");
  });

  it("dish matching is case-insensitive", () => {
    expect(searchSrc).toContain("b.name.toLowerCase().includes(q)");
  });

  it("dish matching requires at least 2 characters", () => {
    expect(searchSrc).toContain("query.trim().length < 2");
  });

  it("dishSearchMatches passed to AutocompleteDropdown", () => {
    expect(searchSrc).toContain("dishMatches={dishSearchMatches}");
  });

  // ─── Backward compatibility ────────────────────────────────

  it("dishEntryCounts still computed for BestInSection", () => {
    expect(searchSrc).toContain("dishEntryCounts");
  });

  // ─── Sprint docs ──────────────────────────────────────────

  it("sprint doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/sprints/SPRINT-313-DISH-SEARCH.md"))).toBe(true);
  });

  it("retro doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/retros/RETRO-313-DISH-SEARCH.md"))).toBe(true);
  });
});
