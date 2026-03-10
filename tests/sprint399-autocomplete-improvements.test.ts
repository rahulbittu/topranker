/**
 * Sprint 399: Search Autocomplete Improvements
 *
 * Verifies text highlighting, cuisine category suggestions,
 * and result count footer in autocomplete dropdown.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ── 1. Text highlight in autocomplete ───────────────────────────────

describe("Sprint 399 — Text highlight in autocomplete", () => {
  const src = readFile("components/search/SearchOverlays.tsx");

  it("has HighlightedName component", () => {
    expect(src).toContain("HighlightedName");
    expect(src).toContain("highlightMatch");
  });

  it("highlights matching portion of name", () => {
    expect(src).toContain("name.toLowerCase().indexOf(query.toLowerCase())");
    expect(src).toContain("name.slice(idx, idx + query.length)");
  });

  it("uses AMBER color for highlight", () => {
    expect(src).toContain("color: AMBER");
  });

  it("uses HighlightedName for business results", () => {
    expect(src).toContain("<HighlightedName name={item.name} query={query}");
  });

  it("uses HighlightedName for dish results", () => {
    expect(src).toContain("<HighlightedName name={`Best ${dish.name}`} query={query}");
  });
});

// ── 2. Cuisine category suggestions ────────────────────────────────

describe("Sprint 399 — Cuisine category suggestions", () => {
  const src = readFile("components/search/SearchOverlays.tsx");

  it("has matchCuisineCategories function", () => {
    expect(src).toContain("matchCuisineCategories");
    expect(src).toContain("CUISINE_DISPLAY");
  });

  it("limits cuisine suggestions to 3", () => {
    expect(src).toContain(".slice(0, 3)");
  });

  it("shows cuisine match chips", () => {
    expect(src).toContain("cuisineMatchChip");
    expect(src).toContain("cuisineMatchText");
  });

  it("calls onCuisineSelect when tapped", () => {
    expect(src).toContain("onCuisineSelect(cm.key)");
  });

  it("has cuisine match row style", () => {
    expect(src).toContain("cuisineMatchRow:");
  });
});

// ── 3. Result count footer ──────────────────────────────────────────

describe("Sprint 399 — Result count footer", () => {
  const src = readFile("components/search/SearchOverlays.tsx");

  it("shows result count at bottom", () => {
    expect(src).toContain("resultCountFooter");
    expect(src).toContain("resultCountText");
  });

  it("pluralizes result count", () => {
    expect(src).toContain("result{totalResults !== 1");
  });
});

// ── 4. Props wired from search.tsx ──────────────────────────────────

describe("Sprint 399 — Props wired from search.tsx", () => {
  const src = readFile("app/(tabs)/search.tsx");

  it("passes query to AutocompleteDropdown", () => {
    expect(src).toContain("query={query}");
  });

  it("passes onCuisineSelect to AutocompleteDropdown", () => {
    expect(src).toContain("onCuisineSelect=");
  });

  it("cuisine select sets filter and clears query", () => {
    expect(src).toContain("setSelectedCuisine(cuisine)");
    expect(src).toContain('setQuery("")');
  });
});

// ── 5. Existing features preserved ──────────────────────────────────

describe("Sprint 399 — Existing autocomplete features preserved", () => {
  const src = readFile("components/search/SearchOverlays.tsx");

  it("still shows dish leaderboard matches", () => {
    expect(src).toContain("dishSearchMatchTap");
    expect(src).toContain("Dish leaderboard");
  });

  it("still shows score badges", () => {
    expect(src).toContain("scoreBadge");
    expect(src).toContain("weightedScore");
  });

  it("still shows recent searches panel", () => {
    expect(src).toContain("RecentSearchesPanel");
    expect(src).toContain("Recent");
  });
});
