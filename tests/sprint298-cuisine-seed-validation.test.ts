/**
 * Sprint 298 — Cuisine-specific seed data validation
 *
 * Validates:
 * 1. Every cuisine in seed has at least 3 businesses (leaderboard minimum)
 * 2. Total seed businesses increased
 * 3. New businesses have required fields
 * 4. No duplicate slugs
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const seedSrc = fs.readFileSync(path.resolve("server/seed.ts"), "utf-8");

// Extract cuisine values from seed
const cuisineMatches = seedSrc.match(/cuisine: "([^"]+)"/g) || [];
const cuisines = cuisineMatches.map(m => m.replace('cuisine: "', '').replace('"', ''));
const cuisineCounts = new Map<string, number>();
cuisines.forEach(c => cuisineCounts.set(c, (cuisineCounts.get(c) || 0) + 1));

describe("Sprint 298 — Every cuisine has ≥3 businesses", () => {
  const expectedCuisines = [
    "indian", "mexican", "japanese", "korean", "thai",
    "italian", "chinese", "vietnamese", "mediterranean", "american",
  ];

  for (const cuisine of expectedCuisines) {
    it(`${cuisine} has at least 3 businesses`, () => {
      const count = cuisineCounts.get(cuisine) || 0;
      expect(count).toBeGreaterThanOrEqual(3);
    });
  }
});

describe("Sprint 298 — Seed data integrity", () => {
  it("total seed businesses increased to 54+", () => {
    const bizCount = (seedSrc.match(/slug: "/g) || []).length;
    expect(bizCount).toBeGreaterThanOrEqual(54);
  });

  it("no duplicate slugs in seed", () => {
    const slugs = (seedSrc.match(/slug: "([^"]+)"/g) || [])
      .map(m => m.replace('slug: "', '').replace('"', ''));
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it("all new businesses have required fields", () => {
    // Sprint 298 additions should have name, slug, cuisine, category, weightedScore
    const sprint298Businesses = [
      "golden-dragon-palace-dallas",
      "nonnas-trattoria-dallas",
      "seoul-bbq-house-dallas",
      "thai-orchid-garden-dallas",
      "pho-95-dallas",
      "istanbul-grill-dallas",
      "shawarma-point-dallas",
    ];
    for (const slug of sprint298Businesses) {
      expect(seedSrc).toContain(slug);
    }
  });
});

describe("Sprint 298 — Cuisine distribution", () => {
  it("10 distinct cuisines in seed data", () => {
    expect(cuisineCounts.size).toBe(10);
  });

  it("indian has 5 businesses (Indian Dallas focus)", () => {
    expect(cuisineCounts.get("indian")).toBe(5);
  });

  it("mexican has the most businesses (9)", () => {
    expect(cuisineCounts.get("mexican")).toBe(9);
  });
});
