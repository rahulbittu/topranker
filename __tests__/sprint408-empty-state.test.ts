/**
 * Sprint 408: Discover empty state enhancements
 * Validates search suggestions, filter reset, quick search pills
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf-8");
}

describe("Sprint 408 — Discover Empty State Enhancements", () => {
  const emptySrc = readFile("components/search/DiscoverEmptyState.tsx");
  const searchSrc = readFile("app/(tabs)/search.tsx");

  describe("Search suggestions", () => {
    it("defines getSearchSuggestions function", () => {
      expect(emptySrc).toContain("function getSearchSuggestions");
    });

    it("generates suggestions from cuisine display keys", () => {
      expect(emptySrc).toContain("CUISINE_DISPLAY");
      expect(emptySrc).toContain("label.toLowerCase()");
    });

    it("limits to 3 suggestions", () => {
      expect(emptySrc).toContain("slice(0, 3)");
    });

    it("renders 'Did you mean?' section", () => {
      expect(emptySrc).toContain("Did you mean?");
      expect(emptySrc).toContain("suggestChip");
    });

    it("shows suggestions only when query has no results", () => {
      expect(emptySrc).toContain("searchSuggestions.length > 0");
    });
  });

  describe("Filter reset action", () => {
    it("defines getFilterAction function", () => {
      expect(emptySrc).toContain("function getFilterAction");
    });

    it("has action text for all filter types", () => {
      expect(emptySrc).toContain('"Top 10"');
      expect(emptySrc).toContain('"Challenging"');
      expect(emptySrc).toContain('"Trending"');
      expect(emptySrc).toContain('"Open Now"');
      expect(emptySrc).toContain('"Near Me"');
    });

    it("accepts onClearFilter prop", () => {
      expect(emptySrc).toContain("onClearFilter?: () => void");
    });

    it("renders filter reset button", () => {
      expect(emptySrc).toContain("filterResetBtn");
      expect(emptySrc).toContain("filterResetText");
    });

    it("search.tsx passes onClearFilter prop", () => {
      expect(searchSrc).toContain('onClearFilter={() => setActiveFilter("All")}');
    });
  });

  describe("Quick search pills", () => {
    it("defines QUICK_SEARCHES constant", () => {
      expect(emptySrc).toContain("QUICK_SEARCHES");
    });

    it("includes common food categories", () => {
      expect(emptySrc).toContain('"Biryani"');
      expect(emptySrc).toContain('"Tacos"');
      expect(emptySrc).toContain('"Pizza"');
      expect(emptySrc).toContain('"Sushi"');
    });

    it("renders quick search section", () => {
      expect(emptySrc).toContain("quickSearchSection");
      expect(emptySrc).toContain("quickSearchPill");
      expect(emptySrc).toContain("Quick search");
    });

    it("shows only when no query and no cuisine filter", () => {
      expect(emptySrc).toContain("!hasActiveSearch && !selectedCuisine");
    });
  });

  describe("Existing functionality preserved", () => {
    it("still has 'Be the first' CTA", () => {
      expect(emptySrc).toContain("Be the first to rate in");
    });

    it("still has cuisine dish suggestions", () => {
      expect(emptySrc).toContain("CUISINE_DISH_MAP");
    });

    it("still has popular categories section", () => {
      expect(emptySrc).toContain("Popular in");
      expect(emptySrc).toContain("suggestionsSection");
    });

    it("still has nearby city suggestions", () => {
      expect(emptySrc).toContain("Try another city");
      expect(emptySrc).toContain("cityChip");
    });

    it("still has contextual icons by state", () => {
      expect(emptySrc).toContain("map-outline");
      expect(emptySrc).toContain("search-outline");
      expect(emptySrc).toContain("filter-outline");
      expect(emptySrc).toContain("restaurant-outline");
    });
  });
});
