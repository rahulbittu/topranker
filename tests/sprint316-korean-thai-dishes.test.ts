/**
 * Sprint 316: Korean + Thai Cuisine Dish Maps
 *
 * Adds korean and thai to CUISINE_DISH_MAP with leaderboard seeds.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 316 — Korean cuisine in CUISINE_DISH_MAP", () => {
  const src = readFile("shared/best-in-categories.ts");

  it("korean key exists in CUISINE_DISH_MAP", () => {
    expect(src).toContain("korean: [");
  });

  it("korean has korean-bbq dish", () => {
    expect(src).toContain('"korean-bbq"');
  });

  it("korean has bibimbap dish", () => {
    expect(src).toContain('"bibimbap"');
  });

  it("korean has fried-chicken dish", () => {
    expect(src).toContain('"fried-chicken"');
  });

  it("korean has 3 dishes", () => {
    const match = src.match(/korean:\s*\[([\s\S]*?)\]/);
    expect(match).not.toBeNull();
    const slugCount = (match![1].match(/slug:/g) || []).length;
    expect(slugCount).toBe(3);
  });
});

describe("Sprint 316 — Thai cuisine in CUISINE_DISH_MAP", () => {
  const src = readFile("shared/best-in-categories.ts");

  it("thai key exists in CUISINE_DISH_MAP", () => {
    expect(src).toContain("thai: [");
  });

  it("thai has pad-thai dish", () => {
    expect(src).toContain('"pad-thai"');
  });

  it("thai has green-curry dish", () => {
    expect(src).toContain('"green-curry"');
  });

  it("thai has 2 dishes", () => {
    const match = src.match(/thai:\s*\[([\s\S]*?)\]/);
    expect(match).not.toBeNull();
    const slugCount = (match![1].match(/slug:/g) || []).length;
    expect(slugCount).toBe(2);
  });
});

describe("Sprint 316 — Seed leaderboards for Korean + Thai", () => {
  const seedSrc = readFile("server/seed.ts");

  it("seeds korean-bbq leaderboard", () => {
    expect(seedSrc).toContain('dishSlug: "korean-bbq"');
  });

  it("seeds bibimbap leaderboard", () => {
    expect(seedSrc).toContain('dishSlug: "bibimbap"');
  });

  it("seeds fried-chicken leaderboard", () => {
    expect(seedSrc).toContain('dishSlug: "fried-chicken"');
  });

  it("seeds pad-thai leaderboard", () => {
    expect(seedSrc).toContain('dishSlug: "pad-thai"');
  });

  it("seeds green-curry leaderboard", () => {
    expect(seedSrc).toContain('dishSlug: "green-curry"');
  });

  it("seeds Korean BBQ dishes for matching", () => {
    expect(seedSrc).toContain("Korean BBQ Platter");
    expect(seedSrc).toContain("Premium Korean BBQ Set");
  });

  it("seeds Bibimbap dishes for matching", () => {
    expect(seedSrc).toContain("Stone Pot Bibimbap");
    expect(seedSrc).toContain("Dolsot Bibimbap");
  });

  it("seeds Pad Thai dishes for matching", () => {
    expect(seedSrc).toContain("Classic Pad Thai");
    expect(seedSrc).toContain("Shrimp Pad Thai");
  });

  it("seeds Green Curry dishes for matching", () => {
    expect(seedSrc).toContain("Thai Green Curry");
  });

  // Sprint docs
  it("sprint doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/sprints/SPRINT-316-KOREAN-THAI-DISHES.md"))).toBe(true);
  });

  it("retro doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/retros/RETRO-316-KOREAN-THAI-DISHES.md"))).toBe(true);
  });
});
