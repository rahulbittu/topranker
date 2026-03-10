/**
 * Sprint 549: Leaderboard filters — neighborhood + price range
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 549: Leaderboard Filters", () => {
  describe("Server — getLeaderboard with filters", () => {
    const src = readFile("server/storage/businesses.ts");

    it("accepts neighborhood parameter", () => {
      expect(src).toContain("neighborhood?: string");
    });

    it("accepts priceRange parameter", () => {
      expect(src).toContain("priceRange?: string");
    });

    it("applies neighborhood filter in query", () => {
      expect(src).toContain("businesses.neighborhood, neighborhood");
    });

    it("applies priceRange filter in query", () => {
      expect(src).toContain("businesses.priceRange, priceRange");
    });

    it("includes filters in cache key", () => {
      expect(src).toContain("neighborhood");
      expect(src).toContain("priceRange");
    });

    it("documents Sprint 549", () => {
      expect(src).toContain("Sprint 549");
    });
  });

  describe("Server — getNeighborhoods function", () => {
    const src = readFile("server/storage/businesses.ts");

    it("exports getNeighborhoods function", () => {
      expect(src).toContain("export async function getNeighborhoods");
    });

    it("accepts city parameter", () => {
      expect(src).toContain("getNeighborhoods(city: string)");
    });

    it("selects distinct neighborhoods", () => {
      expect(src).toContain("selectDistinct");
      expect(src).toContain("neighborhood");
    });

    it("filters null and empty neighborhoods", () => {
      expect(src).toContain("IS NOT NULL");
    });

    it("is exported from storage index", () => {
      const idx = readFile("server/storage/index.ts");
      expect(idx).toContain("getNeighborhoods");
    });
  });

  describe("Server — leaderboard route with filters", () => {
    const src = readFile("server/routes.ts");

    it("parses neighborhood query param", () => {
      expect(src).toContain("req.query.neighborhood");
    });

    it("parses priceRange query param", () => {
      expect(src).toContain("req.query.priceRange");
    });

    it("passes filters to getLeaderboard", () => {
      expect(src).toContain("neighborhood, priceRange");
    });
  });

  describe("Server — neighborhoods endpoint", () => {
    const src = readFile("server/routes.ts");

    it("registers /api/leaderboard/neighborhoods route", () => {
      expect(src).toContain("/api/leaderboard/neighborhoods");
    });

    it("imports getNeighborhoods", () => {
      expect(src).toContain("getNeighborhoods");
    });
  });

  describe("Client — API functions", () => {
    const src = readFile("lib/api.ts");

    it("fetchLeaderboard accepts neighborhood param", () => {
      expect(src).toContain("neighborhood?: string");
    });

    it("fetchLeaderboard accepts priceRange param", () => {
      expect(src).toContain("priceRange?: string");
    });

    it("appends neighborhood to URL", () => {
      expect(src).toContain("&neighborhood=");
    });

    it("appends priceRange to URL", () => {
      expect(src).toContain("&priceRange=");
    });

    it("exports fetchNeighborhoods function", () => {
      expect(src).toContain("export async function fetchNeighborhoods");
    });

    it("fetchNeighborhoods calls neighborhoods endpoint", () => {
      expect(src).toContain("/api/leaderboard/neighborhoods");
    });
  });

  describe("Client — Rankings page filter UI", () => {
    const src = readFile("app/(tabs)/index.tsx");

    it("imports fetchNeighborhoods", () => {
      expect(src).toContain("fetchNeighborhoods");
    });

    it("has neighborhoodFilter state", () => {
      expect(src).toContain("neighborhoodFilter");
    });

    it("has priceFilter state", () => {
      expect(src).toContain("priceFilter");
    });

    it("imports LeaderboardFilterChips", () => {
      // Sprint 553: PRICE_OPTIONS + chip JSX + styles extracted to LeaderboardFilterChips
      expect(src).toContain("LeaderboardFilterChips");
    });

    it("fetches neighborhoods with useQuery", () => {
      expect(src).toContain('"neighborhoods"');
      expect(src).toContain("fetchNeighborhoods");
    });

    it("passes filters to fetchLeaderboard query", () => {
      expect(src).toContain("neighborhoodFilter, priceFilter");
    });

    it("renders LeaderboardFilterChips with props", () => {
      // Sprint 553: Extracted component receives state via props
      const chipSrc = readFile("components/leaderboard/LeaderboardFilterChips.tsx");
      expect(chipSrc).toContain("location-outline");
      expect(chipSrc).toContain("PRICE_OPTIONS");
    });

    it("extracted component has chip styles", () => {
      const chipSrc = readFile("components/leaderboard/LeaderboardFilterChips.tsx");
      expect(chipSrc).toContain("chip:");
      expect(chipSrc).toContain("chipActive:");
      expect(chipSrc).toContain("chipText:");
    });

    it("extracted component has clear button", () => {
      const chipSrc = readFile("components/leaderboard/LeaderboardFilterChips.tsx");
      expect(chipSrc).toContain("Clear");
      expect(chipSrc).toContain("close-circle");
    });
  });

  describe("file health", () => {
    it("index.tsx stays under 520 LOC", () => {
      const loc = readFile("app/(tabs)/index.tsx").split("\n").length;
      expect(loc).toBeLessThan(520);
    });

    it("businesses.ts stays under 600 LOC", () => {
      // Sprint 549: +22 LOC for getNeighborhoods + filter params
      const loc = readFile("server/storage/businesses.ts").split("\n").length;
      expect(loc).toBeLessThan(600);
    });

    it("api.ts stays under 695 LOC", () => {
      const loc = readFile("lib/api.ts").split("\n").length;
      expect(loc).toBeLessThan(695);
    });
  });
});
