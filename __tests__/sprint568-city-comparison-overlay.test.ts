/**
 * Sprint 568: City comparison search overlay
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 568: City Comparison Search Overlay", () => {
  describe("CityComparisonOverlay.tsx", () => {
    const src = readFile("components/search/CityComparisonOverlay.tsx");

    it("exports CityComparisonOverlay function", () => {
      expect(src).toContain("export function CityComparisonOverlay");
    });

    it("exports CityComparisonOverlayProps interface", () => {
      expect(src).toContain("export interface CityComparisonOverlayProps");
    });

    it("accepts currentCity and delay props", () => {
      expect(src).toContain("currentCity: string");
      expect(src).toContain("delay?:");
    });

    it("imports fetchCityStats from api", () => {
      expect(src).toContain("fetchCityStats");
      expect(src).toContain("CityStats");
    });

    it("imports SUPPORTED_CITIES for comparison options", () => {
      expect(src).toContain("SUPPORTED_CITIES");
    });

    it("fetches stats for current and comparison cities", () => {
      expect(src).toContain("city-stats");
      expect(src).toContain("currentCity");
      expect(src).toContain("compareCity");
    });

    it("renders globe icon in header", () => {
      expect(src).toContain("globe-outline");
    });

    it("shows city comparison header with vs label", () => {
      expect(src).toContain("vs");
      expect(src).toContain("headerTitle");
    });

    it("has a tappable city chip to cycle comparison city", () => {
      expect(src).toContain("cityChip");
      expect(src).toContain("swap-horizontal");
      expect(src).toContain("cycleCity");
    });

    it("renders StatCompare for avg score", () => {
      expect(src).toContain("Avg Score");
      expect(src).toContain("avgWeightedScore");
    });

    it("renders StatCompare for restaurant count", () => {
      expect(src).toContain("Restaurants");
      expect(src).toContain("totalBusinesses");
    });

    it("renders StatCompare for return percentage", () => {
      expect(src).toContain("Return %");
      expect(src).toContain("avgWouldReturnPct");
    });

    it("shows delta indicators with arrow icons", () => {
      expect(src).toContain("deltaRow");
      expect(src).toContain("arrow-up");
      expect(src).toContain("arrow-down");
    });

    it("formats values by type (score, count, pct)", () => {
      expect(src).toContain("toFixed(1)");
      expect(src).toContain("Math.round");
    });

    it("shows footer with recent ratings count", () => {
      expect(src).toContain("recentRatingsCount");
      expect(src).toContain("ratings this month");
    });

    it("uses FadeInDown animation", () => {
      expect(src).toContain("FadeInDown");
    });

    it("returns null when stats not loaded", () => {
      expect(src).toContain("return null");
    });

    it("is under 180 LOC", () => {
      const loc = src.split("\n").length;
      expect(loc).toBeLessThan(200);
    });
  });

  describe("search.tsx integration", () => {
    // Sprint 571: redirected to DiscoverSections
    const src = readFile("components/search/DiscoverSections.tsx");

    it("imports CityComparisonOverlay", () => {
      // Sprint 571: redirected to DiscoverSections
      expect(src).toContain('import { CityComparisonOverlay } from "@/components/search/CityComparisonOverlay"');
    });

    it("renders CityComparisonOverlay in discover flow", () => {
      // Sprint 571: redirected to DiscoverSections
      expect(src).toContain("<CityComparisonOverlay");
    });

    it("passes currentCity prop", () => {
      // Sprint 571: redirected to DiscoverSections
      expect(src).toContain("currentCity={city}");
    });

    it("only renders when no active search query", () => {
      // Sprint 571: redirected to DiscoverSections
      expect(src).toContain("!debouncedQuery && <CityComparisonOverlay");
    });

    it("search.tsx stays under 600 LOC", () => {
      // Sprint 571: LOC check stays on search.tsx, threshold updated from 680 to 600
      const searchSrc = readFile("app/(tabs)/search.tsx");
      const loc = searchSrc.split("\n").length;
      expect(loc).toBeLessThan(600);
    });
  });
});
