/**
 * Sprint 168 — Dish Leaderboard Seed Data + Rating Flow Dish Context
 *
 * Validates:
 * 1. Seed file creates dish leaderboards for Dallas
 * 2. Rating flow accepts dish context param
 * 3. Dish context banner shown when param provided
 * 4. Dish input pre-filled from context param
 * 5. Seed data covers 5 dish categories
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Seed file creates dish leaderboards
// ---------------------------------------------------------------------------
describe("Seed file — dish leaderboard seeding", () => {
  const seedSrc = readFile("server/seed.ts");

  it("imports dishLeaderboards table", () => {
    expect(seedSrc).toContain("dishLeaderboards");
  });

  it("imports dishLeaderboardEntries table", () => {
    expect(seedSrc).toContain("dishLeaderboardEntries");
  });

  it("seeds Biryani board", () => {
    expect(seedSrc).toContain('"Biryani"');
    expect(seedSrc).toContain('"biryani"');
    expect(seedSrc).toContain('"🍛"');
  });

  it("seeds Ramen board", () => {
    expect(seedSrc).toContain('"Ramen"');
    expect(seedSrc).toContain('"ramen"');
    expect(seedSrc).toContain('"🍜"');
  });

  it("seeds Taco board", () => {
    expect(seedSrc).toContain('"Taco"');
    expect(seedSrc).toContain('"taco"');
    expect(seedSrc).toContain('"🌮"');
  });

  it("seeds Burger board", () => {
    expect(seedSrc).toContain('"Burger"');
    expect(seedSrc).toContain('"burger"');
    expect(seedSrc).toContain('"🍔"');
  });

  it("seeds Coffee board", () => {
    expect(seedSrc).toContain('"Coffee"');
    expect(seedSrc).toContain('"coffee"');
    expect(seedSrc).toContain('"☕"');
  });

  it("populates entries from existing dish data", () => {
    expect(seedSrc).toContain("dishLeaderboardEntries");
    expect(seedSrc).toContain("rankPosition");
    expect(seedSrc).toContain("dishScore");
  });

  it("logs seed completion", () => {
    expect(seedSrc).toContain("Seeded dish leaderboards");
  });
});

// ---------------------------------------------------------------------------
// 2. Rating flow — dish context param
// ---------------------------------------------------------------------------
describe("Rating flow — dish context pre-fill", () => {
  const rateSrc = readFile("app/rate/[id].tsx");

  it("accepts dish search param", () => {
    expect(rateSrc).toContain("dish: dishContext");
    // or dish?: string in the params type
    expect(rateSrc).toContain("dish?:");
  });

  it("pre-fills dishInput from context param", () => {
    expect(rateSrc).toContain("dishContext ||");
  });

  it("shows dish context banner when param provided", () => {
    expect(rateSrc).toContain("dishContextBanner");
    expect(rateSrc).toContain("You're rating");
    expect(rateSrc).toContain("for their");
  });

  it("has styles for dish context banner", () => {
    expect(rateSrc).toContain("dishContextBanner:");
    expect(rateSrc).toContain("dishContextText:");
  });
});

// ---------------------------------------------------------------------------
// 3. Brand consistency in seed
// ---------------------------------------------------------------------------
describe("Seed dish boards — brand consistency", () => {
  const seedSrc = readFile("server/seed.ts");

  it("sets city to lowercase 'dallas'", () => {
    const match = seedSrc.match(/city:\s*"dallas"/);
    expect(match).not.toBeNull();
  });

  it("sets source to 'system' for seeded boards", () => {
    expect(seedSrc).toContain('source: "system"');
  });

  it("sets status to 'active' for seeded boards", () => {
    expect(seedSrc).toContain('status: "active"');
  });
});
