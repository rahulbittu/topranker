/**
 * Sprint 312: Dynamic CUISINE_DISH_MAP via useDishShortcuts hook
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");
const fileExists = (relPath: string) => fs.existsSync(path.join(ROOT, relPath));

describe("Sprint 312 — Dynamic Dish Shortcuts", () => {
  // ─── useDishShortcuts hook ─────────────────────────────────

  const hookSrc = readFile("lib/hooks/useDishShortcuts.ts");

  it("useDishShortcuts hook file exists", () => {
    expect(fileExists("lib/hooks/useDishShortcuts.ts")).toBe(true);
  });

  it("hook exports useDishShortcuts function", () => {
    expect(hookSrc).toContain("export function useDishShortcuts");
  });

  it("hook accepts city and cuisine parameters", () => {
    expect(hookSrc).toMatch(/useDishShortcuts\(city:\s*string,\s*cuisine:\s*string\s*\|\s*null\)/);
  });

  it("hook fetches from /api/dish-leaderboards", () => {
    expect(hookSrc).toContain("/api/dish-leaderboards");
  });

  it("hook uses CUISINE_DISH_MAP as base mapping", () => {
    expect(hookSrc).toContain("CUISINE_DISH_MAP");
  });

  it("hook returns DishShortcut with entryCount", () => {
    expect(hookSrc).toContain("entryCount");
  });

  it("hook falls back gracefully when API unavailable", () => {
    expect(hookSrc).toContain("return []");
  });

  it("hook uses React Query with staleTime", () => {
    expect(hookSrc).toContain("staleTime: 120000");
  });

  // ─── Rankings page uses hook ───────────────────────────────

  const indexSrc = readFile("app/(tabs)/index.tsx");

  it("Rankings imports useDishShortcuts", () => {
    expect(indexSrc).toContain("useDishShortcuts");
  });

  it("Rankings no longer imports CUISINE_DISH_MAP directly", () => {
    expect(indexSrc).not.toContain("CUISINE_DISH_MAP");
  });

  it("Rankings uses dishShortcuts from hook", () => {
    expect(indexSrc).toContain("dishShortcuts.length > 0");
  });

  it("Rankings shows entry count on dish chips", () => {
    expect(indexSrc).toContain("dish.entryCount");
  });

  // ─── BestInSection uses hook ───────────────────────────────

  const bestInSrc = readFile("components/search/BestInSection.tsx");

  it("BestInSection imports useDishShortcuts", () => {
    expect(bestInSrc).toContain("useDishShortcuts");
  });

  it("BestInSection no longer imports CUISINE_DISH_MAP directly", () => {
    expect(bestInSrc).not.toContain("CUISINE_DISH_MAP");
  });

  it("BestInSection uses dishShortcuts from hook", () => {
    expect(bestInSrc).toContain("dishShortcuts.length > 0");
  });

  it("BestInSection shows entry count on dish chips", () => {
    expect(bestInSrc).toContain("dish.entryCount");
  });

  // ─── Sprint docs ──────────────────────────────────────────

  it("sprint doc exists", () => {
    expect(fileExists("docs/sprints/SPRINT-312-DYNAMIC-DISH-SHORTCUTS.md")).toBe(true);
  });

  it("retro doc exists", () => {
    expect(fileExists("docs/retros/RETRO-312-DYNAMIC-DISH-SHORTCUTS.md")).toBe(true);
  });
});
