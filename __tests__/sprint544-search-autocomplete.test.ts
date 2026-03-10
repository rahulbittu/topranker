/**
 * Sprint 544: Search Autocomplete — typeahead with recent + popular queries
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 544: Search Autocomplete", () => {
  describe("Search Query Tracker", () => {
    const src = readFile("server/search-query-tracker.ts");

    it("exports trackSearchQuery function", () => {
      expect(src).toContain("export function trackSearchQuery");
    });

    it("exports getPopularQueries function", () => {
      expect(src).toContain("export function getPopularQueries");
    });

    it("normalizes queries to lowercase", () => {
      expect(src).toContain("toLowerCase");
    });

    it("tracks query count and lastSearched timestamp", () => {
      expect(src).toContain("count");
      expect(src).toContain("lastSearched");
    });

    it("caps entries per city at MAX_ENTRIES_PER_CITY", () => {
      expect(src).toContain("MAX_ENTRIES_PER_CITY");
      expect(src).toContain("500");
    });

    it("filters popular queries to 2+ count minimum", () => {
      expect(src).toContain("count >= 2");
    });

    it("sorts popular by count desc then recency", () => {
      expect(src).toContain("b.count - a.count");
      expect(src).toContain("b.lastSearched - a.lastSearched");
    });

    it("applies time decay to reduce old query counts", () => {
      expect(src).toContain("export function applyQueryDecay");
      expect(src).toContain("DECAY_FACTOR");
    });

    it("exports getQueryTrackerStats for admin", () => {
      expect(src).toContain("export function getQueryTrackerStats");
    });

    it("has clearQueryTracker for testing", () => {
      expect(src).toContain("export function clearQueryTracker");
    });

    it("evicts least popular when at capacity", () => {
      expect(src).toContain("minCount");
      expect(src).toContain("delete");
    });
  });

  describe("Search Routes — query tracking endpoints", () => {
    const src = readFile("server/routes-search.ts");

    it("imports trackSearchQuery and getPopularQueries", () => {
      expect(src).toContain("trackSearchQuery");
      expect(src).toContain("getPopularQueries");
      expect(src).toContain("search-query-tracker");
    });

    it("has POST /api/search/track endpoint", () => {
      expect(src).toContain("/api/search/track");
      expect(src).toContain("trackSearchQuery");
    });

    it("has GET /api/search/popular-queries endpoint", () => {
      expect(src).toContain("/api/search/popular-queries");
      expect(src).toContain("getPopularQueries");
    });

    it("has admin query stats endpoint", () => {
      expect(src).toContain("query-stats");
      expect(src).toContain("getQueryTrackerStats");
    });
  });

  describe("Client API — popular queries", () => {
    const src = readFile("lib/api.ts");

    it("exports PopularQuery type", () => {
      expect(src).toContain("export type PopularQuery");
    });

    it("exports fetchPopularQueries function", () => {
      expect(src).toContain("export async function fetchPopularQueries");
      expect(src).toContain("/api/search/popular-queries");
    });

    it("exports trackSearchQuery function", () => {
      expect(src).toContain("export async function trackSearchQuery");
      expect(src).toContain("/api/search/track");
    });

    it("trackSearchQuery is non-blocking (catches errors)", () => {
      expect(src).toContain("catch");
      expect(src).toContain("Non-critical");
    });
  });

  describe("PopularQueriesPanel component", () => {
    const src = readFile("components/search/SearchOverlays.tsx");

    it("exports PopularQueriesPanel component", () => {
      expect(src).toContain("export function PopularQueriesPanel");
    });

    it("accepts queries and onSelect props", () => {
      expect(src).toContain("PopularQueriesPanelProps");
      expect(src).toContain("queries");
      expect(src).toContain("onSelect");
    });

    it("shows trending icon and Popular Searches title", () => {
      expect(src).toContain("trending-up");
      expect(src).toContain("Popular Searches");
    });

    it("limits display to 6 queries", () => {
      expect(src).toContain("slice(0, 6)");
    });

    it("shows search count badge per query", () => {
      expect(src).toContain("item.count");
      expect(src).toContain("popularQueryCountBadge");
    });

    it("returns null when no queries after filtering", () => {
      // Sprint 546: changed from queries.length to filtered.length for dedup
      expect(src).toContain("filtered.length === 0");
      expect(src).toContain("return null");
    });

    it("has styles for popular queries section", () => {
      expect(src).toContain("popularQueriesContainer");
      expect(src).toContain("popularQueriesTitle");
      expect(src).toContain("popularQueryRow");
    });
  });

  describe("Search page — popular queries integration", () => {
    const src = readFile("app/(tabs)/search.tsx");

    it("imports PopularQueriesPanel from SearchOverlays", () => {
      expect(src).toContain("PopularQueriesPanel");
      expect(src).toContain("SearchOverlays");
    });

    it("imports fetchPopularQueries and trackSearchQuery", () => {
      expect(src).toContain("fetchPopularQueries");
      expect(src).toContain("trackQuery");
    });

    it("fetches popular queries with useQuery", () => {
      expect(src).toContain("popularQueries");
      expect(src).toContain("fetchPopularQueries");
    });

    it("tracks search queries server-side on debounce", () => {
      expect(src).toContain("trackQuery(debouncedQuery, city)");
    });

    it("renders PopularQueriesPanel when search focused with empty query", () => {
      expect(src).toContain("<PopularQueriesPanel");
      expect(src).toContain("queries={popularQueries}");
    });

    it("renders alongside RecentSearchesPanel", () => {
      expect(src).toContain("RecentSearchesPanel");
      expect(src).toContain("PopularQueriesPanel");
    });
  });
});
