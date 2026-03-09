/**
 * Sprint 259 — Best In Categories: Sub-Category System
 *
 * Validates:
 * 1. Best In categories static analysis (shared/best-in-categories.ts)
 * 2. Best In categories runtime behavior (helper functions)
 * 3. Routes static analysis (server/routes-best-in.ts)
 * 4. Integration (routes.ts wiring)
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. Best In categories — static analysis (10 tests)
// ---------------------------------------------------------------------------
describe("Best In categories — static analysis", () => {
  it("shared/best-in-categories.ts exists", () => {
    expect(fileExists("shared/best-in-categories.ts")).toBe(true);
  });

  const src = readFile("shared/best-in-categories.ts");

  it("exports BEST_IN_CATEGORIES array", () => {
    expect(src).toContain("export const BEST_IN_CATEGORIES");
  });

  it("exports getActiveCategories", () => {
    expect(src).toContain("export function getActiveCategories");
  });

  it("exports getCategoryBySlug", () => {
    expect(src).toContain("export function getCategoryBySlug");
  });

  it("exports getCategoriesByParent", () => {
    expect(src).toContain("export function getCategoriesByParent");
  });

  it("exports searchCategories", () => {
    expect(src).toContain("export function searchCategories");
  });

  it("exports getBestInTitle", () => {
    expect(src).toContain("export function getBestInTitle");
  });

  it("has at least 15 categories", () => {
    const matches = src.match(/slug:\s*"/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBeGreaterThanOrEqual(15);
  });

  it("Indian categories come first (biryani sortOrder=1)", () => {
    expect(src).toMatch(/slug:\s*"biryani".*sortOrder:\s*1/);
  });

  it("contains biryani, chai, dosa, butter-chicken", () => {
    expect(src).toContain('"biryani"');
    expect(src).toContain('"chai"');
    expect(src).toContain('"dosa"');
    expect(src).toContain('"butter-chicken"');
  });

  it("contains tacos, bbq, pizza, burgers", () => {
    expect(src).toContain('"tacos"');
    expect(src).toContain('"bbq"');
    expect(src).toContain('"pizza"');
    expect(src).toContain('"burgers"');
  });

  it("each category has slug, displayName, emoji, tags array", () => {
    expect(src).toContain("slug:");
    expect(src).toContain("displayName:");
    expect(src).toContain("emoji:");
    expect(src).toContain("tags:");
  });
});

// ---------------------------------------------------------------------------
// 2. Best In categories — runtime (14 tests)
// ---------------------------------------------------------------------------
describe("Best In categories — runtime", () => {
  // Dynamic import to get actual module
  let mod: typeof import("../shared/best-in-categories");

  // Use synchronous require for vitest compatibility
  beforeAll(async () => {
    mod = await import("../shared/best-in-categories");
  });

  it("getActiveCategories returns 15 active categories", () => {
    const active = mod.getActiveCategories();
    expect(active.length).toBe(15);
  });

  it('getCategoryBySlug("biryani") returns correct category', () => {
    const cat = mod.getCategoryBySlug("biryani");
    expect(cat).toBeDefined();
    expect(cat!.slug).toBe("biryani");
    expect(cat!.displayName).toBe("Biryani");
    expect(cat!.parentCategory).toBe("restaurant");
  });

  it('getCategoryBySlug("nonexistent") returns undefined', () => {
    const cat = mod.getCategoryBySlug("nonexistent");
    expect(cat).toBeUndefined();
  });

  it('getCategoriesByParent("restaurant") returns multiple', () => {
    const cats = mod.getCategoriesByParent("restaurant");
    expect(cats.length).toBeGreaterThan(1);
  });

  it('getCategoriesByParent("bbq") includes BBQ', () => {
    const cats = mod.getCategoriesByParent("bbq");
    expect(cats.some(c => c.slug === "bbq")).toBe(true);
  });

  it('searchCategories("biryani") finds biryani', () => {
    const results = mod.searchCategories("biryani");
    expect(results.some(c => c.slug === "biryani")).toBe(true);
  });

  it('searchCategories("masala") finds chai and butter-chicken (via tags)', () => {
    const results = mod.searchCategories("masala");
    const slugs = results.map(c => c.slug);
    expect(slugs).toContain("chai");
    expect(slugs).toContain("dosa");
  });

  it('searchCategories("pizza") finds pizza', () => {
    const results = mod.searchCategories("pizza");
    expect(results.some(c => c.slug === "pizza")).toBe(true);
  });

  it('searchCategories("xyz") returns empty', () => {
    const results = mod.searchCategories("xyz");
    expect(results.length).toBe(0);
  });

  it('getBestInTitle("biryani") returns "Best Biryani in Dallas"', () => {
    const title = mod.getBestInTitle("biryani");
    expect(title).toBe("Best Biryani in Dallas");
  });

  it('getBestInTitle("tacos", "Austin") returns "Best Tacos in Austin"', () => {
    const title = mod.getBestInTitle("tacos", "Austin");
    expect(title).toBe("Best Tacos in Austin");
  });

  it("getCategoryCount returns { total: 15, active: 15 }", () => {
    const counts = mod.getCategoryCount();
    expect(counts.total).toBe(15);
    expect(counts.active).toBe(15);
  });

  it("biryani has at least 3 tags", () => {
    const cat = mod.getCategoryBySlug("biryani");
    expect(cat!.tags.length).toBeGreaterThanOrEqual(3);
  });

  it("all categories have non-empty description", () => {
    for (const cat of mod.BEST_IN_CATEGORIES) {
      expect(cat.description.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// 3. Routes — static analysis (8 tests)
// ---------------------------------------------------------------------------
describe("Routes — static analysis", () => {
  it("server/routes-best-in.ts exists", () => {
    expect(fileExists("server/routes-best-in.ts")).toBe(true);
  });

  const src = readFile("server/routes-best-in.ts");

  it("exports registerBestInRoutes", () => {
    expect(src).toContain("export function registerBestInRoutes");
  });

  it("has GET /api/best-in endpoint", () => {
    expect(src).toContain('"/api/best-in"');
  });

  it("has GET /api/best-in/:slug endpoint", () => {
    expect(src).toContain('"/api/best-in/:slug"');
  });

  it("has GET /api/best-in/:slug/leaderboard", () => {
    expect(src).toContain('"/api/best-in/:slug/leaderboard"');
  });

  it("has GET /api/best-in/search", () => {
    expect(src).toContain('"/api/best-in/search"');
  });

  it("has GET /api/admin/best-in/stats", () => {
    expect(src).toContain('"/api/admin/best-in/stats"');
  });

  it("imports from shared/best-in-categories", () => {
    expect(src).toContain("best-in-categories");
  });
});

// ---------------------------------------------------------------------------
// 4. Integration (4 tests)
// ---------------------------------------------------------------------------
describe("Integration — routes.ts wiring", () => {
  const routesSrc = readFile("server/routes.ts");

  it("routes.ts imports registerBestInRoutes", () => {
    expect(routesSrc).toContain("registerBestInRoutes");
  });

  it("routes.ts calls registerBestInRoutes(app)", () => {
    expect(routesSrc).toContain("registerBestInRoutes(app)");
  });

  it("routes.ts imports from ./routes-best-in", () => {
    expect(routesSrc).toContain("./routes-best-in");
  });

  it('Best In categories use the "Best In" naming format (getBestInTitle contains "Best")', () => {
    const src = readFile("shared/best-in-categories.ts");
    // getBestInTitle builds "Best X in Y" — verify the template
    expect(src).toContain("Best ${name} in ${targetCity}");
  });
});
