/**
 * Sprint 323: Rankings Page Cleanup — Unified Category→Cuisine→Dish Flow
 *
 * Removed broken Best In subcategory chips (selectedBestIn never used in query).
 * Simplified to: Category → Cuisine → Dish Shortcuts → Rankings.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 323 — Rankings page cleanup", () => {
  const src = readFile("app/(tabs)/index.tsx");

  it("does NOT have selectedBestIn state (removed)", () => {
    expect(src).not.toContain("selectedBestIn");
    expect(src).not.toContain("setSelectedBestIn");
  });

  it("does NOT import getCategoriesByCuisine or getActiveCategories", () => {
    expect(src).not.toContain("getCategoriesByCuisine");
    expect(src).not.toContain("getActiveCategories");
    expect(src).not.toContain("BestInCategory");
  });

  it("does NOT have bestInChip styles (removed)", () => {
    expect(src).not.toContain("bestInChip:");
    expect(src).not.toContain("bestInChipActive:");
    expect(src).not.toContain("bestInChipText:");
    expect(src).not.toContain("bestInChipTextActive:");
  });

  it("still has cuisine picker", () => {
    expect(src).toContain("cuisineChip");
    expect(src).toContain("setSelectedCuisine");
    expect(src).toContain("CUISINE_DISPLAY");
  });

  it("still has dish shortcuts", () => {
    expect(src).toContain("dishShortcuts");
    expect(src).toContain("dishShortcutChip");
    expect(src).toContain("Dish Rankings:");
  });

  it("still has category chips", () => {
    expect(src).toContain("categoryChips");
    expect(src).toContain("activeCategory");
  });

  it("still has Best In header", () => {
    expect(src).toContain("Best In {city}");
    expect(src).toContain("bestInTitle");
  });

  it("has cuisineChipsRow style (renamed from bestInChipsRow)", () => {
    expect(src).toContain("cuisineChipsRow");
  });

  it("page is under 660 LOC after sticky cuisine addition", () => {
    const lines = src.split("\n").length;
    expect(lines).toBeLessThan(660);
  });

  // Sprint docs
  it("sprint doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/sprints/SPRINT-323-RANKINGS-CLEANUP.md"))).toBe(true);
  });

  it("retro doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/retros/RETRO-323-RANKINGS-CLEANUP.md"))).toBe(true);
  });
});
