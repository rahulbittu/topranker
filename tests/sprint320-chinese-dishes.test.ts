/**
 * Sprint 320: Chinese Cuisine Dish Map + Governance
 *
 * Adds Chinese cuisine to CUISINE_DISH_MAP with dim-sum, peking-duck, hot-pot.
 * Includes SLT-320, Audit #46, and critique request for sprints 315-319.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 320 — Chinese cuisine in CUISINE_DISH_MAP", () => {
  const src = readFile("shared/best-in-categories.ts");

  it("chinese key exists in CUISINE_DISH_MAP", () => {
    expect(src).toContain("chinese: [");
  });

  it("includes dim-sum", () => {
    expect(src).toContain('"dim-sum"');
  });

  it("includes peking-duck", () => {
    expect(src).toContain('"peking-duck"');
  });

  it("includes hot-pot", () => {
    expect(src).toContain('"hot-pot"');
  });

  it("chinese has 3 dishes", () => {
    const match = src.match(/chinese:\s*\[([\s\S]*?)\]/);
    expect(match).not.toBeNull();
    const slugCount = (match![1].match(/slug:/g) || []).length;
    expect(slugCount).toBe(3);
  });

  it("CUISINE_DISH_MAP now has 10 cuisines", () => {
    // indian, mexican, japanese, italian, vietnamese, american, mediterranean, chinese, korean, thai
    const mapSection = src.slice(src.indexOf("CUISINE_DISH_MAP"));
    const cuisineKeys = mapSection.match(/^\s+\w+:\s*\[/gm) || [];
    expect(cuisineKeys.length).toBe(10);
  });
});

describe("Sprint 320 — Chinese seed data", () => {
  const seedSrc = readFile("server/seed.ts");

  it("seeds dim-sum leaderboard", () => {
    expect(seedSrc).toContain('dishSlug: "dim-sum"');
  });

  it("seeds peking-duck leaderboard", () => {
    expect(seedSrc).toContain('dishSlug: "peking-duck"');
  });

  it("seeds hot-pot leaderboard", () => {
    expect(seedSrc).toContain('dishSlug: "hot-pot"');
  });

  it("seeds dim sum dishes for matching", () => {
    expect(seedSrc).toContain("Dim Sum Selection");
    expect(seedSrc).toContain("Weekend Dim Sum Brunch");
  });

  it("seeds peking duck dishes for matching", () => {
    expect(seedSrc).toContain("Whole Peking Duck");
  });

  it("seeds hot pot dishes for matching", () => {
    expect(seedSrc).toContain("Sichuan Hot Pot");
  });
});

describe("Sprint 320 — Governance docs", () => {
  it("sprint doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/sprints/SPRINT-320-CHINESE-DISHES.md"))).toBe(true);
  });

  it("retro doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/retros/RETRO-320-CHINESE-DISHES.md"))).toBe(true);
  });

  it("SLT-320 meeting doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/meetings/SLT-BACKLOG-320.md"))).toBe(true);
  });

  it("Audit #46 doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/audits/ARCH-AUDIT-46.md"))).toBe(true);
  });

  it("critique request exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/critique/inbox/SPRINT-315-319-REQUEST.md"))).toBe(true);
  });
});
