/**
 * Sprint 303: Dish Seed Data Expansion
 *
 * Tests:
 * 1-7: Sprint 298 businesses all have dishes
 * 8-10: Under-represented businesses now have dishes
 * 11: Dish leaderboards expanded from 5 to 10
 * 12-16: New leaderboard slugs exist
 * 17: Total dish count increased significantly
 * 18: Every cuisine has at least 6 seeded dishes
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const seedSrc = fs.readFileSync(path.join(ROOT, "server/seed.ts"), "utf-8");

// Extract all businessSlugs from SEED_DISHES
const dishSlugMatches = seedSrc.match(/businessSlug:\s*"([^"]+)"/g) || [];
const seededDishSlugs = dishSlugMatches.map((m) => m.replace(/businessSlug:\s*"/, "").replace(/"$/, ""));

// Extract dish leaderboard slugs
const boardSlugMatches = seedSrc.match(/dishSlug:\s*"([^"]+)"/g) || [];
const boardSlugs = boardSlugMatches.map((m) => m.replace(/dishSlug:\s*"/, "").replace(/"$/, ""));

// Count dish entries (name + voteCount pairs)
const dishEntryMatches = seedSrc.match(/\{ name: "[^"]+", voteCount: \d+ \}/g) || [];

describe("Sprint 303 — Dish Seed Data Expansion", () => {
  // ─── Sprint 298 businesses now have dishes ─────────────────

  it("Golden Dragon Palace has dishes", () => {
    expect(seededDishSlugs).toContain("golden-dragon-palace-dallas");
  });

  it("Nonna's Trattoria has dishes", () => {
    expect(seededDishSlugs).toContain("nonnas-trattoria-dallas");
  });

  it("Seoul BBQ House has dishes", () => {
    expect(seededDishSlugs).toContain("seoul-bbq-house-dallas");
  });

  it("Thai Orchid Garden has dishes", () => {
    expect(seededDishSlugs).toContain("thai-orchid-garden-dallas");
  });

  it("Pho 95 has dishes", () => {
    expect(seededDishSlugs).toContain("pho-95-dallas");
  });

  it("Istanbul Grill has dishes", () => {
    expect(seededDishSlugs).toContain("istanbul-grill-dallas");
  });

  it("Shawarma Point has dishes", () => {
    expect(seededDishSlugs).toContain("shawarma-point-dallas");
  });

  // ─── Previously under-represented businesses ───────────────

  it("Koryo Kalbi now has dishes", () => {
    expect(seededDishSlugs).toContain("koryo-kalbi-dallas");
  });

  it("Asian Mint now has dishes", () => {
    expect(seededDishSlugs).toContain("asian-mint-dallas");
  });

  it("Sichuan House now has dishes", () => {
    expect(seededDishSlugs).toContain("sichuan-house-dallas");
  });

  // ─── Expanded dish leaderboards ────────────────────────────

  it("has 10 dish leaderboards (was 5)", () => {
    expect(boardSlugs.length).toBeGreaterThanOrEqual(10);
  });

  it("pizza leaderboard exists", () => {
    expect(boardSlugs).toContain("pizza");
  });

  it("pho leaderboard exists", () => {
    expect(boardSlugs).toContain("pho");
  });

  it("dosa leaderboard exists", () => {
    expect(boardSlugs).toContain("dosa");
  });

  it("kebab leaderboard exists", () => {
    expect(boardSlugs).toContain("kebab");
  });

  it("brisket leaderboard exists", () => {
    expect(boardSlugs).toContain("brisket");
  });

  // ─── Volume checks ────────────────────────────────────────

  it("total seeded dish entries ≥ 100", () => {
    expect(dishEntryMatches.length).toBeGreaterThanOrEqual(100);
  });

  it("at least 30 businesses have dishes", () => {
    const uniqueSlugs = [...new Set(seededDishSlugs)];
    expect(uniqueSlugs.length).toBeGreaterThanOrEqual(30);
  });

  // ─── Sprint docs ──────────────────────────────────────────

  it("sprint doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/sprints/SPRINT-303-DISH-SEED-EXPANSION.md"))).toBe(true);
  });

  it("retro doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/retros/RETRO-303-DISH-SEED-EXPANSION.md"))).toBe(true);
  });
});
