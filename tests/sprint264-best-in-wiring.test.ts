/**
 * Sprint 264 — Best In Wiring Tests
 * Connects category filters to leaderboard API and adds Best In to rating confirmation.
 */
import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

// Runtime imports
import {
  getActiveCategories,
  getCategoryBySlug,
  searchCategories,
  getBestInTitle,
} from "../shared/best-in-categories";

// ── 1. Routes best-in leaderboard — static analysis (6 tests) ──────────

describe("Routes best-in leaderboard — static analysis", () => {
  const routesPath = path.resolve(__dirname, "../server/routes-best-in.ts");
  const src = fs.readFileSync(routesPath, "utf-8");

  it("routes-best-in.ts exists", () => {
    expect(fs.existsSync(routesPath)).toBe(true);
  });

  it("contains /api/best-in/:slug/leaderboard", () => {
    expect(src).toContain("/api/best-in/:slug/leaderboard");
  });

  it('contains "Not enough ratings yet"', () => {
    expect(src).toContain("Not enough ratings yet");
  });

  it("contains getBestInTitle for title generation", () => {
    expect(src).toContain("getBestInTitle");
  });

  it("exports registerBestInRoutes", () => {
    expect(src).toContain("export function registerBestInRoutes");
  });

  it("imports from shared/best-in-categories", () => {
    expect(src).toContain("best-in-categories");
  });
});

// ── 2. Rating confirmation Best In mention — static analysis (6 tests) ──

describe("Rating confirmation Best In mention — static analysis", () => {
  // Sprint 449: RatingConfirmation extracted to its own file
  const subPath = path.resolve(__dirname, "../components/rate/RatingConfirmation.tsx");
  const src = fs.readFileSync(subPath, "utf-8");

  it('SubComponents.tsx contains "helping rank"', () => {
    expect(src).toContain("helping rank");
  });

  it("SubComponents.tsx imports from best-in-categories", () => {
    expect(src).toContain("best-in-categories");
  });

  it("SubComponents.tsx contains getBestInTitle", () => {
    expect(src).toContain("getBestInTitle");
  });

  it("SubComponents.tsx contains searchCategories", () => {
    expect(src).toContain("searchCategories");
  });

  it('SubComponents.tsx contains "Best" (the Best In title format)', () => {
    expect(src).toContain("Best");
  });

  it("SubComponents.tsx has bestInRankBanner style", () => {
    expect(src).toContain("bestInRankBanner");
  });
});

// ── 3. Best In categories API — runtime (8 tests) ──────────────────────

describe("Best In categories API — runtime", () => {
  it('getBestInTitle("biryani") returns "Best Biryani in Dallas"', () => {
    expect(getBestInTitle("biryani")).toBe("Best Biryani in Dallas");
  });

  it('getBestInTitle("tacos", "Austin") returns "Best Tacos in Austin"', () => {
    expect(getBestInTitle("tacos", "Austin")).toBe("Best Tacos in Austin");
  });

  it('searchCategories("chicken") finds butter-chicken and fried-chicken', () => {
    const results = searchCategories("chicken");
    const slugs = results.map(c => c.slug);
    expect(slugs).toContain("butter-chicken");
    expect(slugs).toContain("fried-chicken");
  });

  it('searchCategories("indian") returns Indian cuisine items (cuisine matching)', () => {
    const results = searchCategories("indian");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(c => c.slug === "biryani")).toBe(true);
  });

  it('getCategoryBySlug("biryani") has tags including "hyderabadi"', () => {
    const cat = getCategoryBySlug("biryani");
    expect(cat).toBeDefined();
    expect(cat!.tags).toContain("hyderabadi");
  });

  it('all categories have non-empty description containing "best"', () => {
    const all = getActiveCategories();
    for (const cat of all) {
      expect(cat.description).toBeTruthy();
      expect(cat.description.toLowerCase()).toContain("best");
    }
  });

  it("category count matches 45+ (expanded cuisines)", () => {
    const all = getActiveCategories();
    expect(all.length).toBeGreaterThanOrEqual(45);
  });

  it("getActiveCategories returns sorted by sortOrder", () => {
    const all = getActiveCategories();
    for (let i = 1; i < all.length; i++) {
      expect(all[i].sortOrder).toBeGreaterThanOrEqual(all[i - 1].sortOrder);
    }
  });
});

// ── 4. Integration (4 tests) ────────────────────────────────────────────

describe("Integration — Best In wiring", () => {
  it("routes.ts calls registerBestInRoutes(app)", () => {
    const routesPath = path.resolve(__dirname, "../server/routes.ts");
    const src = fs.readFileSync(routesPath, "utf-8");
    expect(src).toContain("registerBestInRoutes(app)");
  });

  it("RatingConfirmation.tsx imports from best-in-categories", () => {
    const subPath = path.resolve(__dirname, "../components/rate/RatingConfirmation.tsx");
    const src = fs.readFileSync(subPath, "utf-8");
    expect(src).toContain("best-in-categories");
  });

  it('Best In title format always starts with "Best"', () => {
    const all = getActiveCategories();
    for (const cat of all) {
      const title = getBestInTitle(cat.slug);
      expect(title.startsWith("Best")).toBe(true);
    }
  });

  it("score engine exports computeRestaurantScore (Phase 1b wired)", () => {
    const enginePath = path.resolve(__dirname, "../shared/score-engine.ts");
    const src = fs.readFileSync(enginePath, "utf-8");
    expect(src).toContain("export function computeRestaurantScore");
  });
});
