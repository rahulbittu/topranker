/**
 * Sprint 289 — Cuisine Display on Business Cards
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");
const fileExists = (relPath: string) =>
  fs.existsSync(path.join(ROOT, relPath));

describe("Sprint 289: Leaderboard cards show cuisine", () => {
  const src = readFile("components/leaderboard/SubComponents.tsx");

  it("imports CUISINE_DISPLAY", () => {
    expect(src).toContain("CUISINE_DISPLAY");
    expect(src).toContain("best-in-categories");
  });

  it("RankedCard displays cuisine in meta line", () => {
    // Check that cuisine display appears in the meta text
    expect(src).toContain("item.cuisine && CUISINE_DISPLAY[item.cuisine]");
  });

  it("HeroCard displays cuisine in strip", () => {
    // heroStripCategory should include cuisine
    const heroSection = src.substring(
      src.indexOf("heroStripCategory"),
      src.indexOf("heroStripCategory") + 300
    );
    expect(heroSection).toContain("CUISINE_DISPLAY");
  });
});

describe("Sprint 289: Search cards show cuisine", () => {
  const src = readFile("components/search/SubComponents.tsx");

  it("imports CUISINE_DISPLAY", () => {
    expect(src).toContain("CUISINE_DISPLAY");
    expect(src).toContain("best-in-categories");
  });

  it("BusinessCard displays cuisine after category", () => {
    expect(src).toContain("item.cuisine && CUISINE_DISPLAY[item.cuisine]");
  });
});

describe("Sprint 289: Sprint docs", () => {
  it("sprint doc exists", () => {
    expect(fileExists("docs/sprints/SPRINT-289-CUISINE-DISPLAY.md")).toBe(true);
  });

  it("retro doc exists", () => {
    expect(fileExists("docs/retros/RETRO-289-CUISINE-DISPLAY.md")).toBe(true);
  });
});
