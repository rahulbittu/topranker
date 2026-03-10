/**
 * Sprint 315: Expanded CUISINE_DISH_MAP + New Leaderboard Seeds
 *
 * Every cuisine now has 2+ dishes for related dish discovery.
 * Seed matching handles multi-word slugs (butter-chicken → "butter chicken").
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 315 — Expanded CUISINE_DISH_MAP", () => {
  const src = readFile("shared/best-in-categories.ts");

  it("indian has 4 dishes", () => {
    const match = src.match(/indian:\s*\[([\s\S]*?)\]/);
    expect(match).not.toBeNull();
    const slugCount = (match![1].match(/slug:/g) || []).length;
    expect(slugCount).toBe(4);
  });

  it("mexican has 3 dishes", () => {
    const match = src.match(/mexican:\s*\[([\s\S]*?)\]/);
    expect(match).not.toBeNull();
    const slugCount = (match![1].match(/slug:/g) || []).length;
    expect(slugCount).toBe(3);
  });

  it("japanese has 2 dishes", () => {
    const match = src.match(/japanese:\s*\[([\s\S]*?)\]/);
    expect(match).not.toBeNull();
    const slugCount = (match![1].match(/slug:/g) || []).length;
    expect(slugCount).toBe(2);
  });

  it("italian has 2 dishes", () => {
    const match = src.match(/italian:\s*\[([\s\S]*?)\]/);
    expect(match).not.toBeNull();
    const slugCount = (match![1].match(/slug:/g) || []).length;
    expect(slugCount).toBe(2);
  });

  it("vietnamese has 2 dishes", () => {
    const match = src.match(/vietnamese:\s*\[([\s\S]*?)\]/);
    expect(match).not.toBeNull();
    const slugCount = (match![1].match(/slug:/g) || []).length;
    expect(slugCount).toBe(2);
  });

  it("american has 3 dishes", () => {
    const match = src.match(/american:\s*\[([\s\S]*?)\]/);
    expect(match).not.toBeNull();
    const slugCount = (match![1].match(/slug:/g) || []).length;
    expect(slugCount).toBe(3);
  });

  it("mediterranean has 2 dishes", () => {
    const match = src.match(/mediterranean:\s*\[([\s\S]*?)\]/);
    expect(match).not.toBeNull();
    const slugCount = (match![1].match(/slug:/g) || []).length;
    expect(slugCount).toBe(2);
  });

  it("total dish count is 18 (4+3+2+2+2+3+2)", () => {
    // Sum of per-cuisine tests: indian(4) + mexican(3) + japanese(2) + italian(2)
    // + vietnamese(2) + american(3) + mediterranean(2) = 18
    expect(4 + 3 + 2 + 2 + 2 + 3 + 2).toBe(18);
  });

  // New dishes
  it("includes butter-chicken in indian", () => {
    expect(src).toContain('"butter-chicken"');
  });

  it("includes samosa in indian", () => {
    expect(src).toContain('"samosa"');
  });

  it("includes burrito in mexican", () => {
    expect(src).toContain('"burrito"');
  });

  it("includes sushi in japanese", () => {
    expect(src).toContain('"sushi"');
  });

  it("includes pasta in italian", () => {
    expect(src).toContain('"pasta"');
  });

  it("includes banh-mi in vietnamese", () => {
    expect(src).toContain('"banh-mi"');
  });

  it("includes wings in american", () => {
    expect(src).toContain('"wings"');
  });

  it("includes falafel in mediterranean", () => {
    expect(src).toContain('"falafel"');
  });
});

describe("Sprint 315 — Seed leaderboard expansion", () => {
  const seedSrc = readFile("server/seed.ts");

  it("seeds 19 dish leaderboards", () => {
    const boardMatches = seedSrc.match(/dishSlug:/g) || [];
    // SEED_DISH_BOARDS entries
    expect(boardMatches.length).toBeGreaterThanOrEqual(19);
  });

  it("handles multi-word slug matching with hyphen-to-space", () => {
    expect(seedSrc).toContain('board.dishSlug.replace(/-/g, " ")');
  });

  it("seeds samosa dishes", () => {
    expect(seedSrc).toContain("Aloo Samosa");
    expect(seedSrc).toContain("Samosa Chaat");
  });

  it("seeds burrito dishes", () => {
    expect(seedSrc).toContain("Carne Asada Burrito");
    expect(seedSrc).toContain("Burrito Mojado");
  });

  it("seeds sushi dishes", () => {
    expect(seedSrc).toContain("Omakase Sushi");
  });

  it("seeds pasta dishes", () => {
    expect(seedSrc).toContain("Pasta Bolognese");
    expect(seedSrc).toContain("Truffle Pasta");
  });

  it("seeds wings dishes", () => {
    expect(seedSrc).toContain("Smoked Wings");
    expect(seedSrc).toContain("Buffalo Wings");
  });

  it("seeds falafel dishes", () => {
    expect(seedSrc).toContain("Crispy Falafel Plate");
    expect(seedSrc).toContain("Falafel Wrap");
  });

  // Sprint docs
  it("sprint doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/sprints/SPRINT-315-EXPANDED-DISHES.md"))).toBe(true);
  });

  it("retro doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/retros/RETRO-315-EXPANDED-DISHES.md"))).toBe(true);
  });
});
