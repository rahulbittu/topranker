/**
 * Sprint 184 — Business Search Improvements
 *
 * Validates:
 * 1. Autocomplete storage function
 * 2. Popular categories storage function
 * 3. Extended search (category field)
 * 4. Autocomplete API endpoint
 * 5. Popular categories API endpoint
 * 6. Client-side autocomplete UI
 * 7. Client-side recent searches
 * 8. Client-side dynamic category suggestions
 * 9. Client API wrappers
 * 10. Storage barrel exports
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Autocomplete storage function
// ---------------------------------------------------------------------------
describe("Autocomplete — storage", () => {
  const src = readFile("server/storage/businesses.ts");

  it("exports autocompleteBusinesses function", () => {
    expect(src).toContain("export async function autocompleteBusinesses");
  });

  it("searches name, category, and neighborhood", () => {
    expect(src).toContain("businesses.name");
    expect(src).toContain("businesses.category");
    expect(src).toContain("businesses.neighborhood");
  });

  it("returns minimal fields (id, name, slug, category, neighborhood)", () => {
    expect(src).toContain("id: businesses.id");
    expect(src).toContain("name: businesses.name");
    expect(src).toContain("slug: businesses.slug");
    expect(src).toContain("category: businesses.category");
    expect(src).toContain("neighborhood: businesses.neighborhood");
  });

  it("limits results to 6 by default", () => {
    expect(src).toContain("limit: number = 6");
  });

  it("sanitizes input and strips wildcards", () => {
    expect(src).toContain('.replace(/[%_\\\\]/g, "")');
  });

  it("orders by weightedScore descending", () => {
    expect(src).toContain("desc(businesses.weightedScore)");
  });

  it("filters by city and isActive", () => {
    expect(src).toContain("eq(businesses.city, city)");
    expect(src).toContain("eq(businesses.isActive, true)");
  });

  it("returns empty array for empty query", () => {
    expect(src).toContain("if (!query || query.trim().length === 0) return []");
  });
});

// ---------------------------------------------------------------------------
// 2. Popular categories storage function
// ---------------------------------------------------------------------------
describe("Popular categories — storage", () => {
  const src = readFile("server/storage/businesses.ts");

  it("exports getPopularCategories function", () => {
    expect(src).toContain("export async function getPopularCategories");
  });

  it("groups by category with count", () => {
    expect(src).toContain("count(businesses.id)");
    expect(src).toContain(".groupBy(businesses.category)");
  });

  it("orders by count descending", () => {
    expect(src).toContain("desc(count(businesses.id))");
  });

  it("limits to 8 by default", () => {
    expect(src).toContain("limit: number = 8");
  });

  it("returns category and count", () => {
    expect(src).toContain("category: r.category");
    expect(src).toContain("count: Number(r.count)");
  });
});

// ---------------------------------------------------------------------------
// 3. Extended search — category field
// ---------------------------------------------------------------------------
describe("Search — category field added", () => {
  const src = readFile("server/storage/businesses.ts");

  it("searches against category field in searchBusinesses", () => {
    expect(src).toContain("lower(${businesses.category}) like ${q}");
  });
});

// ---------------------------------------------------------------------------
// 4. Autocomplete API endpoint
// ---------------------------------------------------------------------------
describe("Autocomplete API — routes", () => {
  const src = readFile("server/routes-businesses.ts");

  it("has GET /api/businesses/autocomplete", () => {
    expect(src).toContain('"/api/businesses/autocomplete"');
  });

  it("calls autocompleteBusinesses", () => {
    expect(src).toContain("autocompleteBusinesses");
  });

  it("sanitizes query input", () => {
    expect(src).toContain("sanitizeString(req.query.q, 50)");
  });

  it("returns empty array for empty query", () => {
    expect(src).toContain("query.trim().length === 0");
    expect(src).toContain("res.json({ data: [] })");
  });
});

// ---------------------------------------------------------------------------
// 5. Popular categories API endpoint
// ---------------------------------------------------------------------------
describe("Popular categories API — routes", () => {
  const src = readFile("server/routes-businesses.ts");

  it("has GET /api/businesses/popular-categories", () => {
    expect(src).toContain('"/api/businesses/popular-categories"');
  });

  it("calls getPopularCategories", () => {
    expect(src).toContain("getPopularCategories");
  });

  it("defaults city to Dallas", () => {
    // Both autocomplete and popular-categories default to Dallas
    const matches = src.match(/\|\| "Dallas"/g);
    expect(matches!.length).toBeGreaterThanOrEqual(3);
  });
});

// ---------------------------------------------------------------------------
// 6. Client — autocomplete UI
// ---------------------------------------------------------------------------
describe("Client — autocomplete dropdown", () => {
  const src = readFile("app/(tabs)/search.tsx");

  it("imports fetchAutocomplete", () => {
    expect(src).toContain("fetchAutocomplete");
  });

  it("has autocomplete state", () => {
    expect(src).toContain("autocompleteResults");
    expect(src).toContain("setAutocompleteResults");
  });

  it("uses 150ms debounce for typeahead", () => {
    expect(src).toContain("150");
  });

  it("uses AutocompleteDropdown component (Sprint 193 extraction)", () => {
    expect(src).toContain("AutocompleteDropdown");
    expect(src).toContain("SearchOverlays");
  });

  it("passes autocompleteResults to AutocompleteDropdown", () => {
    expect(src).toContain("results={autocompleteResults}");
  });

  it("requires minimum 2 characters for autocomplete", () => {
    expect(src).toContain("query.length >= 2");
    expect(src).toContain("query.trim().length < 2");
  });

  it("autocomplete component handles category and neighborhood (in SearchOverlays)", () => {
    const overlaySrc = readFile("components/search/SearchOverlays.tsx");
    expect(overlaySrc).toContain("autocompleteMeta");
    expect(overlaySrc).toContain("item.neighborhood");
  });
});

// ---------------------------------------------------------------------------
// 7. Client — recent searches
// ---------------------------------------------------------------------------
describe("Client — recent searches", () => {
  const src = readFile("app/(tabs)/search.tsx");

  it("persists recent searches to AsyncStorage", () => {
    expect(src).toContain("recent_searches");
    expect(src).toContain("AsyncStorage.setItem");
  });

  it("loads recent searches on mount", () => {
    expect(src).toContain('AsyncStorage.getItem("recent_searches")');
  });

  it("limits recent searches to 8", () => {
    expect(src).toContain(".slice(0, 8)");
  });

  it("uses RecentSearchesPanel component (Sprint 193 extraction)", () => {
    expect(src).toContain("RecentSearchesPanel");
    expect(src).toContain("searchFocused && query.length === 0");
  });

  it("passes clearRecentSearches to RecentSearchesPanel", () => {
    expect(src).toContain("clearRecentSearches");
    expect(src).toContain("onClear={clearRecentSearches}");
  });

  it("deduplicates recent searches (case-insensitive)", () => {
    expect(src).toContain("s.toLowerCase() !== term.toLowerCase()");
  });

  it("saves search terms after debounce settles", () => {
    expect(src).toContain("saveRecentSearch(debouncedQuery)");
  });
});

// ---------------------------------------------------------------------------
// 8. Client — dynamic category suggestions
// ---------------------------------------------------------------------------
describe("Client — dynamic category suggestions", () => {
  const src = readFile("app/(tabs)/search.tsx");

  it("fetches popular categories from API", () => {
    expect(src).toContain("fetchPopularCategories");
    expect(src).toContain("popular-categories");
  });

  it("uses popular categories for suggestion chips when available", () => {
    expect(src).toContain("popularCategories.length > 0");
    expect(src).toContain("popularCategories.slice(0, 6)");
  });

  it("falls back to hardcoded suggestions when no API data", () => {
    expect(src).toContain('"Tacos"');
    expect(src).toContain('"Italian"');
    expect(src).toContain('"Brunch"');
    expect(src).toContain('"Sushi"');
  });

  it("displays category emoji and label", () => {
    expect(src).toContain("getCategoryDisplay(s).emoji");
    expect(src).toContain("getCategoryDisplay(s).label");
  });
});

// ---------------------------------------------------------------------------
// 9. Client API wrappers
// ---------------------------------------------------------------------------
describe("Client API — new wrappers", () => {
  const src = readFile("lib/api.ts");

  it("exports fetchAutocomplete function", () => {
    expect(src).toContain("export async function fetchAutocomplete");
  });

  it("exports AutocompleteSuggestion type", () => {
    expect(src).toContain("export type AutocompleteSuggestion");
  });

  it("fetchAutocomplete calls /api/businesses/autocomplete", () => {
    expect(src).toContain("/api/businesses/autocomplete");
  });

  it("fetchAutocomplete returns empty for short queries", () => {
    expect(src).toContain("query.trim().length < 2");
  });

  it("exports fetchPopularCategories function", () => {
    expect(src).toContain("export async function fetchPopularCategories");
  });

  it("exports PopularCategory type", () => {
    expect(src).toContain("export type PopularCategory");
  });

  it("fetchPopularCategories calls /api/businesses/popular-categories", () => {
    expect(src).toContain("/api/businesses/popular-categories");
  });
});

// ---------------------------------------------------------------------------
// 10. Storage barrel exports
// ---------------------------------------------------------------------------
describe("Storage barrel — Sprint 184 exports", () => {
  const indexSrc = readFile("server/storage/index.ts");

  it("exports autocompleteBusinesses", () => {
    expect(indexSrc).toContain("autocompleteBusinesses");
  });

  it("exports getPopularCategories", () => {
    expect(indexSrc).toContain("getPopularCategories");
  });
});
