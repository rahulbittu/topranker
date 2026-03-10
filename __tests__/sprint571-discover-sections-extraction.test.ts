/**
 * Sprint 571: Discover sections extraction from search.tsx
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 571: Discover Sections Extraction", () => {
  describe("DiscoverSections.tsx", () => {
    const src = readFile("components/search/DiscoverSections.tsx");

    it("exports DiscoverSections function", () => {
      expect(src).toContain("export function DiscoverSections");
    });

    it("exports DiscoverSectionsProps interface", () => {
      expect(src).toContain("export interface DiscoverSectionsProps");
    });

    it("accepts city, debouncedQuery, selectedCuisine props", () => {
      expect(src).toContain("city: string");
      expect(src).toContain("debouncedQuery: string");
      expect(src).toContain("selectedCuisine: string | null");
    });

    it("imports and renders CityComparisonOverlay", () => {
      expect(src).toContain("CityComparisonOverlay");
      expect(src).toContain("<CityComparisonOverlay");
    });

    it("imports and renders BestInSection", () => {
      expect(src).toContain("BestInSection");
      expect(src).toContain("<BestInSection");
    });

    it("imports and renders TrendingSection", () => {
      expect(src).toContain("TrendingSection");
      expect(src).toContain("<TrendingSection");
    });

    it("imports and renders DishLeaderboardSection", () => {
      expect(src).toContain("DishLeaderboardSection");
      expect(src).toContain("<DishLeaderboardSection");
    });

    it("imports and renders FeaturedSection", () => {
      expect(src).toContain("FeaturedSection");
      expect(src).toContain("<FeaturedSection");
    });

    it("renders discover tip with dismiss handler", () => {
      expect(src).toContain("discoverTip");
      expect(src).toContain("onDismissDiscoverTip");
    });

    it("renders active cuisine filter indicator", () => {
      expect(src).toContain("activeCuisineRow");
      expect(src).toContain("activeCuisineChip");
      expect(src).toContain("CUISINE_DISPLAY");
    });

    it("conditionally renders sections based on debouncedQuery", () => {
      expect(src).toContain("!debouncedQuery");
    });

    it("has own StyleSheet for extracted styles", () => {
      expect(src).toContain("StyleSheet.create");
      expect(src).toContain("discoverTip");
      expect(src).toContain("activeCuisineRow");
    });

    it("is under 170 LOC", () => {
      const loc = src.split("\n").length;
      expect(loc).toBeLessThan(170);
    });
  });

  describe("search.tsx reduction", () => {
    const src = readFile("app/(tabs)/search.tsx");

    it("imports DiscoverSections", () => {
      expect(src).toContain('import { DiscoverSections } from "@/components/search/DiscoverSections"');
    });

    it("renders DiscoverSections in ListHeaderComponent", () => {
      expect(src).toContain("<DiscoverSections");
    });

    it("no longer imports BestInSection directly", () => {
      expect(src).not.toContain('from "@/components/search/BestInSection"');
    });

    it("no longer imports TrendingSection directly", () => {
      expect(src).not.toContain('from "@/components/search/TrendingSection"');
    });

    it("no longer imports CityComparisonOverlay directly", () => {
      expect(src).not.toContain('from "@/components/search/CityComparisonOverlay"');
    });

    it("no longer imports DishLeaderboardSection directly", () => {
      expect(src).not.toContain('from "@/components/DishLeaderboardSection"');
    });

    it("removed discoverTip styles", () => {
      expect(src).not.toContain("discoverTip: {");
    });

    it("removed activeCuisineRow styles", () => {
      expect(src).not.toContain("activeCuisineRow: {");
    });

    it("search.tsx under 600 LOC (down from 670)", () => {
      const loc = src.split("\n").length;
      expect(loc).toBeLessThan(600);
    });
  });

  describe("backward compatibility", () => {
    const searchSrc = readFile("app/(tabs)/search.tsx");
    const discoverSrc = readFile("components/search/DiscoverSections.tsx");

    it("search.tsx still has FlatList rendering", () => {
      expect(searchSrc).toContain("<FlatList");
    });

    it("search.tsx still has BusinessCard rendering", () => {
      expect(searchSrc).toContain("<BusinessCard");
    });

    it("DiscoverSections passes onSetQuery to BestInSection", () => {
      expect(discoverSrc).toContain("onSetQuery");
      expect(discoverSrc).toContain("onSelectCategory");
    });

    it("DiscoverSections passes entryCounts to BestInSection", () => {
      expect(discoverSrc).toContain("entryCounts");
    });
  });
});
