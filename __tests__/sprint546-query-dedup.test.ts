/**
 * Sprint 546: Recent/Popular query deduplication
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 546: Query Deduplication", () => {
  describe("PopularQueriesPanel deduplication", () => {
    const src = readFile("components/search/SearchOverlays.tsx");

    it("accepts excludeQueries prop", () => {
      expect(src).toContain("excludeQueries");
    });

    it("has excludeQueries in interface definition", () => {
      expect(src).toContain("excludeQueries?: string[]");
    });

    it("defaults excludeQueries to empty array", () => {
      expect(src).toContain("excludeQueries = []");
    });

    it("creates a Set for efficient lookup", () => {
      expect(src).toContain("excludeSet");
      expect(src).toContain("new Set");
    });

    it("normalizes queries to lowercase for comparison", () => {
      expect(src).toContain("toLowerCase()");
    });

    it("trims whitespace for matching", () => {
      expect(src).toContain(".trim()");
    });

    it("filters out excluded queries", () => {
      expect(src).toContain("filtered");
      expect(src).toContain(".filter(");
      expect(src).toContain("excludeSet.has");
    });

    it("returns null when all queries are excluded", () => {
      expect(src).toContain("filtered.length === 0");
      expect(src).toContain("return null");
    });

    it("slices filtered results to 6", () => {
      expect(src).toContain("filtered.slice(0, 6)");
    });

    it("documents Sprint 546 deduplication", () => {
      expect(src).toContain("Sprint 546");
      expect(src).toContain("deduplication");
    });

    it("retains trending-up icon", () => {
      expect(src).toContain("trending-up");
    });

    it("retains count badge", () => {
      expect(src).toContain("popularQueryCountBadge");
      expect(src).toContain("popularQueryCountText");
    });

    it("retains Popular Searches title", () => {
      expect(src).toContain("Popular Searches");
    });
  });

  describe("search.tsx dedup wiring", () => {
    const src = readFile("app/(tabs)/search.tsx");

    it("passes excludeQueries to PopularQueriesPanel", () => {
      expect(src).toContain("excludeQueries={recentSearches}");
    });

    it("renders PopularQueriesPanel with dedup prop", () => {
      expect(src).toContain("<PopularQueriesPanel");
      expect(src).toContain("excludeQueries");
    });

    it("still renders RecentSearchesPanel first", () => {
      const recentIdx = src.indexOf("<RecentSearchesPanel");
      const popularIdx = src.indexOf("<PopularQueriesPanel");
      expect(recentIdx).toBeLessThan(popularIdx);
      expect(recentIdx).toBeGreaterThan(-1);
    });

    it("still imports PopularQueriesPanel from SearchOverlays", () => {
      expect(src).toContain("PopularQueriesPanel");
      expect(src).toContain("SearchOverlays");
    });

    it("still uses recentSearches from persistence hook", () => {
      expect(src).toContain("useRecentSearches");
      expect(src).toContain("recentSearches");
    });
  });

  describe("file health", () => {
    it("SearchOverlays.tsx stays under 425 LOC", () => {
      const loc = readFile("components/search/SearchOverlays.tsx").split("\n").length;
      expect(loc).toBeLessThan(425);
    });

    it("search.tsx stays under 680 LOC", () => {
      const loc = readFile("app/(tabs)/search.tsx").split("\n").length;
      expect(loc).toBeLessThan(680); // Sprint 568: +CityComparisonOverlay
    });
  });
});
