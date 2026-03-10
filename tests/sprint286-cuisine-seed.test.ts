/**
 * Sprint 286 — Cuisine Column + Expanded Seed Data + Cuisine-Filtered Leaderboard
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 286: Schema — cuisine column", () => {
  const schema = readFile("shared/schema.ts");

  it("businesses table has cuisine column", () => {
    expect(schema).toContain('cuisine: text("cuisine")');
  });

  it("cuisine column has index", () => {
    expect(schema).toContain("idx_biz_cuisine");
  });

  it("cuisine column is nullable (not notNull)", () => {
    // Should NOT have .notNull() on cuisine — cafes/bars/bakeries don't have cuisine
    const cuisineLine = schema.split("\n").find(l => l.includes('cuisine: text("cuisine")'));
    expect(cuisineLine).toBeDefined();
    expect(cuisineLine).not.toContain("notNull");
  });
});

describe("Sprint 286: Seed data — cuisine-tagged businesses", () => {
  const seed = readFile("server/seed.ts");

  it("has 40+ seed businesses (expanded from 35)", () => {
    const matches = seed.match(/\{ name: "/g);
    expect(matches!.length).toBeGreaterThanOrEqual(40);
  });

  it("includes Indian cuisine restaurants", () => {
    expect(seed).toContain('cuisine: "indian"');
    // At least 4 Indian restaurants
    const indianMatches = seed.match(/cuisine: "indian"/g);
    expect(indianMatches!.length).toBeGreaterThanOrEqual(4);
  });

  it("includes Mexican cuisine restaurants", () => {
    expect(seed).toContain('cuisine: "mexican"');
    const mexicanMatches = seed.match(/cuisine: "mexican"/g);
    expect(mexicanMatches!.length).toBeGreaterThanOrEqual(4);
  });

  it("includes Japanese cuisine restaurants", () => {
    expect(seed).toContain('cuisine: "japanese"');
    const japaneseMatches = seed.match(/cuisine: "japanese"/g);
    expect(japaneseMatches!.length).toBeGreaterThanOrEqual(2);
  });

  it("includes Korean cuisine restaurants", () => {
    expect(seed).toContain('cuisine: "korean"');
  });

  it("includes Thai cuisine restaurants", () => {
    expect(seed).toContain('cuisine: "thai"');
  });

  it("includes Italian cuisine restaurants", () => {
    expect(seed).toContain('cuisine: "italian"');
  });

  it("includes Vietnamese cuisine restaurants", () => {
    expect(seed).toContain('cuisine: "vietnamese"');
  });

  it("includes Chinese cuisine restaurants", () => {
    expect(seed).toContain('cuisine: "chinese"');
  });

  it("includes American cuisine restaurants", () => {
    expect(seed).toContain('cuisine: "american"');
  });

  it("non-restaurant categories have cuisine: null", () => {
    // Cafes, bars, bakeries should have null cuisine
    expect(seed).toContain('category: "cafe", cuisine: null');
    expect(seed).toContain('category: "bar", cuisine: null');
    expect(seed).toContain('category: "bakery", cuisine: null');
  });

  it("seed insert passes cuisine to values()", () => {
    expect(seed).toContain("cuisine: biz.cuisine");
  });

  it("has cuisine-specific dishes in seed", () => {
    // Indian dishes
    expect(seed).toContain("Hyderabadi Goat Biryani");
    expect(seed).toContain("Masala Dosa");
    // Mexican dishes
    expect(seed).toContain("Birria Tacos");
    expect(seed).toContain("Mole Negro");
    // Japanese dishes
    expect(seed).toContain("Tonkotsu Ramen");
    // Vietnamese
    expect(seed).toContain("Rare Beef Pho");
    // Chinese
    expect(seed).toContain("Dim Sum Platter");
  });
});

describe("Sprint 286: Leaderboard API — cuisine filter", () => {
  const routes = readFile("server/routes.ts");
  const storage = readFile("server/storage/businesses.ts");

  it("leaderboard endpoint accepts cuisine query param", () => {
    expect(routes).toContain("req.query.cuisine");
  });

  it("getLeaderboard accepts cuisine parameter", () => {
    expect(storage).toContain("cuisine?: string");
  });

  it("cache key includes cuisine", () => {
    expect(storage).toContain('cuisine || "all"');
  });

  it("filters by cuisine when provided", () => {
    expect(storage).toContain("eq(businesses.cuisine, cuisine)");
  });

  it("cuisines endpoint exists", () => {
    expect(routes).toContain("/api/leaderboard/cuisines");
  });

  it("getCuisines function exists in storage", () => {
    expect(storage).toContain("export async function getCuisines");
  });
});

describe("Sprint 286: Client API — cuisine support", () => {
  const api = readFile("lib/api.ts");
  const rankings = readFile("app/(tabs)/index.tsx");

  it("fetchLeaderboard accepts cuisine parameter", () => {
    expect(api).toContain("cuisine?: string");
  });

  it("fetchLeaderboard passes cuisine to URL when provided", () => {
    expect(api).toContain("&cuisine=");
  });

  it("rankings page passes selectedCuisine to query", () => {
    expect(rankings).toContain("selectedCuisine");
    expect(rankings).toContain('queryKey: ["leaderboard", city, activeCategory, selectedCuisine]');
  });
});

describe("Sprint 286: Indian Dallas Focus", () => {
  const seed = readFile("server/seed.ts");

  it("has Irving-area Indian restaurant", () => {
    expect(seed).toContain("tandoori-flames-irving");
  });

  it("has Plano-area Indian restaurant", () => {
    expect(seed).toContain("bawarchi-biryanis-plano");
  });

  it("has Frisco-area Indian restaurant", () => {
    expect(seed).toContain("chennai-cafe-frisco");
  });

  it("has Richardson-area Indian restaurant", () => {
    expect(seed).toContain("desi-district-richardson");
  });
});
