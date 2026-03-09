/**
 * Sprint 256 — Raleigh Beta Promotion + Search Suggestions
 *
 * Validates:
 * 1. Raleigh promoted to beta — static + runtime (6 tests)
 * 2. Search suggestions module — static (8 tests)
 * 3. Search suggestions module — runtime (12 tests)
 * 4. Search routes — static (6 tests)
 * 5. Integration wiring (4 tests)
 *
 * Total: 36 tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  CITY_REGISTRY,
  getCityConfig,
  getBetaCities,
  getPlannedCities,
  getCityStats,
} from "../shared/city-config";
import {
  buildSuggestionIndex,
  getSuggestions,
  getPopularSearches,
  getCitySuggestionCount,
  getAllIndexedCities,
  clearSuggestionIndex,
  CATEGORY_SUGGESTIONS,
} from "../server/search-suggestions";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. Raleigh beta promotion (6 tests)
// ---------------------------------------------------------------------------
describe("Raleigh beta promotion — static", () => {
  const src = readFile("shared/city-config.ts");

  it("Raleigh entry exists in city-config.ts source", () => {
    expect(src).toContain("Raleigh");
  });

  it("Raleigh status is beta in source", () => {
    const raleighBlock = src.slice(src.indexOf("Raleigh:"));
    expect(raleighBlock).toContain('status: "beta"');
  });

  it("Raleigh has launchDate 2026-03-09 in source", () => {
    const raleighBlock = src.slice(src.indexOf("Raleigh:"));
    expect(raleighBlock).toContain("2026-03-09");
  });
});

describe("Raleigh beta promotion — runtime", () => {
  it("getCityConfig returns Raleigh as beta", () => {
    const raleigh = getCityConfig("Raleigh");
    expect(raleigh).toBeDefined();
    expect(raleigh!.status).toBe("beta");
  });

  it("getBetaCities includes Raleigh and returns 6 total", () => {
    const beta = getBetaCities();
    expect(beta).toContain("Raleigh");
    expect(beta.length).toBe(6);
  });

  it("getPlannedCities is empty, getCityStats shows 6 beta 0 planned", () => {
    const planned = getPlannedCities();
    expect(planned.length).toBe(0);
    const stats = getCityStats();
    expect(stats.beta).toBe(6);
    expect(stats.planned).toBe(0);
    expect(stats.active).toBe(5);
    expect(stats.total).toBe(11);
  });
});

// ---------------------------------------------------------------------------
// 2. Search suggestions module — static (8 tests)
// ---------------------------------------------------------------------------
describe("Search suggestions module — static", () => {
  it("server/search-suggestions.ts exists", () => {
    expect(fileExists("server/search-suggestions.ts")).toBe(true);
  });

  const src = readFile("server/search-suggestions.ts");

  it("exports buildSuggestionIndex", () => {
    expect(src).toContain("export function buildSuggestionIndex");
  });

  it("exports getSuggestions", () => {
    expect(src).toContain("export function getSuggestions");
  });

  it("exports getPopularSearches", () => {
    expect(src).toContain("export function getPopularSearches");
  });

  it("exports getCitySuggestionCount", () => {
    expect(src).toContain("export function getCitySuggestionCount");
  });

  it("exports getAllIndexedCities", () => {
    expect(src).toContain("export function getAllIndexedCities");
  });

  it("CATEGORY_SUGGESTIONS includes restaurant, cafe, bbq, pizza", () => {
    expect(src).toContain('"restaurant"');
    expect(src).toContain('"cafe"');
    expect(src).toContain('"bbq"');
    expect(src).toContain('"pizza"');
  });

  it("uses tagged logger: SearchSuggestions", () => {
    expect(src).toContain('"SearchSuggestions"');
    expect(src).toContain('from "./logger"');
  });
});

// ---------------------------------------------------------------------------
// 3. Search suggestions module — runtime (12 tests)
// ---------------------------------------------------------------------------
describe("Search suggestions module — runtime", () => {
  beforeEach(() => {
    clearSuggestionIndex();
  });

  const sampleBusinesses = [
    { name: "Central BBQ", category: "bbq", neighborhood: "Downtown Memphis" },
    { name: "Gus's Fried Chicken", category: "restaurant", neighborhood: "Downtown Memphis" },
    { name: "Muddy's Bake Shop", category: "bakery", neighborhood: "Cooper-Young" },
  ];

  it("buildSuggestionIndex creates an index for a city", () => {
    buildSuggestionIndex("Memphis", sampleBusinesses);
    expect(getCitySuggestionCount("Memphis")).toBeGreaterThan(0);
  });

  it("buildSuggestionIndex includes businesses, neighborhoods, and categories", () => {
    buildSuggestionIndex("Memphis", sampleBusinesses);
    // 3 businesses + 2 unique neighborhoods + 12 categories = 17
    expect(getCitySuggestionCount("Memphis")).toBe(17);
  });

  it("buildSuggestionIndex deduplicates neighborhoods", () => {
    buildSuggestionIndex("Memphis", sampleBusinesses);
    const suggestions = getSuggestions("Downtown", "Memphis", 50);
    const neighborhoods = suggestions.filter(s => s.type === "neighborhood");
    expect(neighborhoods.length).toBe(1);
  });

  it("getSuggestions returns matching results", () => {
    buildSuggestionIndex("Memphis", sampleBusinesses);
    const results = getSuggestions("BBQ", "Memphis");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(r => r.text === "Central BBQ")).toBe(true);
  });

  it("getSuggestions is case insensitive", () => {
    buildSuggestionIndex("Memphis", sampleBusinesses);
    const upper = getSuggestions("CENTRAL", "Memphis");
    const lower = getSuggestions("central", "Memphis");
    expect(upper.length).toBe(lower.length);
    expect(upper.length).toBeGreaterThan(0);
  });

  it("getSuggestions returns empty for non-matching query", () => {
    buildSuggestionIndex("Memphis", sampleBusinesses);
    const results = getSuggestions("xyznonexistent", "Memphis");
    expect(results.length).toBe(0);
  });

  it("getSuggestions respects limit parameter", () => {
    buildSuggestionIndex("Memphis", sampleBusinesses);
    const results = getSuggestions("a", "Memphis", 2);
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it("getSuggestions sorts by score descending (businesses first)", () => {
    buildSuggestionIndex("Memphis", sampleBusinesses);
    const results = getSuggestions("b", "Memphis", 20);
    if (results.length >= 2) {
      expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
    }
  });

  it("getPopularSearches returns only business-type suggestions", () => {
    buildSuggestionIndex("Memphis", sampleBusinesses);
    const popular = getPopularSearches("Memphis");
    expect(popular.length).toBeGreaterThan(0);
    for (const s of popular) {
      expect(s.type).toBe("business");
    }
  });

  it("getAllIndexedCities returns all indexed cities", () => {
    buildSuggestionIndex("Memphis", sampleBusinesses);
    buildSuggestionIndex("Dallas", [{ name: "Pecan Lodge", category: "bbq", neighborhood: "Deep Ellum" }]);
    const cities = getAllIndexedCities();
    expect(cities).toContain("Memphis");
    expect(cities).toContain("Dallas");
    expect(cities.length).toBe(2);
  });

  it("clearSuggestionIndex clears a specific city", () => {
    buildSuggestionIndex("Memphis", sampleBusinesses);
    buildSuggestionIndex("Dallas", [{ name: "Pecan Lodge", category: "bbq", neighborhood: "Deep Ellum" }]);
    clearSuggestionIndex("Memphis");
    expect(getCitySuggestionCount("Memphis")).toBe(0);
    expect(getCitySuggestionCount("Dallas")).toBeGreaterThan(0);
  });

  it("clearSuggestionIndex with no args clears all cities", () => {
    buildSuggestionIndex("Memphis", sampleBusinesses);
    buildSuggestionIndex("Dallas", [{ name: "Pecan Lodge", category: "bbq", neighborhood: "Deep Ellum" }]);
    clearSuggestionIndex();
    expect(getAllIndexedCities().length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 4. Search routes — static (6 tests)
// ---------------------------------------------------------------------------
describe("Search routes — static", () => {
  it("server/routes-search.ts exists", () => {
    expect(fileExists("server/routes-search.ts")).toBe(true);
  });

  const src = readFile("server/routes-search.ts");

  it("exports registerSearchRoutes", () => {
    expect(src).toContain("export function registerSearchRoutes");
  });

  it("has GET /api/search/suggestions endpoint", () => {
    expect(src).toContain('"/api/search/suggestions"');
    expect(src).toContain("app.get");
  });

  it("has GET /api/search/popular endpoint", () => {
    expect(src).toContain('"/api/search/popular"');
  });

  it("has GET /api/admin/search/index-stats endpoint", () => {
    expect(src).toContain('"/api/admin/search/index-stats"');
  });

  it("imports from ./search-suggestions module", () => {
    expect(src).toContain('from "./search-suggestions"');
  });
});

// ---------------------------------------------------------------------------
// 5. Integration wiring (4 tests)
// ---------------------------------------------------------------------------
describe("Integration — Sprint 256", () => {
  it("routes.ts imports registerSearchRoutes", () => {
    const src = readFile("server/routes.ts");
    expect(src).toContain("registerSearchRoutes");
  });

  it("routes.ts calls registerSearchRoutes(app)", () => {
    const src = readFile("server/routes.ts");
    expect(src).toContain("registerSearchRoutes(app)");
  });

  it("search-suggestions module imports from logger", () => {
    const src = readFile("server/search-suggestions.ts");
    expect(src).toContain('from "./logger"');
  });

  it("CATEGORY_SUGGESTIONS has 12 entries", () => {
    expect(CATEGORY_SUGGESTIONS.length).toBe(12);
  });
});
