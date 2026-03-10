/**
 * Sprint 319: Cuisine-Aware Empty States on Rankings
 *
 * When a cuisine is selected but no businesses match, show cuisine name
 * in the empty message, suggest dish leaderboards, and offer clear filter.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 319 — Cuisine-Aware Empty States", () => {
  const src = readFile("app/(tabs)/index.tsx");

  it("empty state message includes cuisine name", () => {
    expect(src).toContain("CUISINE_DISPLAY[selectedCuisine]");
    expect(src).toContain("ranked yet");
  });

  it("shows dish suggestions when cuisine selected and shortcuts available", () => {
    expect(src).toContain("emptyDishSuggestions");
    expect(src).toContain("dishShortcuts.length > 0");
  });

  it("dish suggestions title references cuisine name", () => {
    expect(src).toContain("Explore");
    expect(src).toContain("dish rankings:");
  });

  it("dish suggestion chips navigate to /dish/[slug]", () => {
    expect(src).toContain('pathname: "/dish/[slug]"');
  });

  it("dish suggestion chips show entry count", () => {
    expect(src).toContain("dish.entryCount > 0");
    expect(src).toContain("ranked");
  });

  it("shows clear filter button when cuisine selected", () => {
    expect(src).toContain("emptyClearFilter");
    expect(src).toContain("Show all cuisines");
  });

  it("clear filter resets selectedCuisine to null", () => {
    expect(src).toContain("setSelectedCuisine(null)");
  });

  it("has emptyStateContainer style", () => {
    expect(src).toContain("emptyStateContainer");
  });

  it("has emptyDishChip style", () => {
    expect(src).toContain("emptyDishChip");
  });

  // Sprint docs
  it("sprint doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/sprints/SPRINT-319-CUISINE-EMPTY-STATES.md"))).toBe(true);
  });

  it("retro doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/retros/RETRO-319-CUISINE-EMPTY-STATES.md"))).toBe(true);
  });
});
