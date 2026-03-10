/**
 * Sprint 527: Search page modularization — map split view extraction
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 527: Search Modularization", () => {
  describe("components/search/SearchMapSplitView.tsx", () => {
    const src = readFile("components/search/SearchMapSplitView.tsx");

    it("exports SearchMapSplitView component", () => {
      expect(src).toContain("export function SearchMapSplitView");
    });

    it("accepts filtered businesses prop", () => {
      expect(src).toContain("filtered: MappedBusiness[]");
    });

    it("accepts map interaction callbacks", () => {
      expect(src).toContain("onSelectMapBiz");
      expect(src).toContain("onSearchArea");
    });

    it("imports MapView and MapBusinessCard from SubComponents", () => {
      expect(src).toContain("MapBusinessCard");
      expect(src).toContain("MapView");
      expect(src).toContain("./SubComponents");
    });

    it("renders selected business card overlay", () => {
      expect(src).toContain("selectedMapBiz");
      expect(src).toContain("mapSelectedCard");
    });

    it("renders cuisine display in card", () => {
      expect(src).toContain("CUISINE_DISPLAY[selectedMapBiz.cuisine]");
    });

    it("renders split list with MapBusinessCard", () => {
      expect(src).toContain("<MapBusinessCard");
      expect(src).toContain("splitListSection");
    });

    it("uses DiscoverEmptyState for map variant", () => {
      expect(src).toContain('variant="map"');
    });

    it("has its own StyleSheet", () => {
      expect(src).toContain("StyleSheet.create");
      expect(src).toContain("splitContainer");
      expect(src).toContain("mapSelectedCard");
    });

    it("stays under 220 LOC", () => {
      const lines = src.split("\n").length;
      expect(lines).toBeLessThan(220);
    });
  });

  describe("app/(tabs)/search.tsx — reduced LOC", () => {
    const src = readFile("app/(tabs)/search.tsx");

    it("imports SearchMapSplitView", () => {
      expect(src).toContain("SearchMapSplitView");
      expect(src).toContain("@/components/search/SearchMapSplitView");
    });

    it("renders SearchMapSplitView for map mode", () => {
      expect(src).toContain("<SearchMapSplitView");
    });

    it("no longer imports MapView or MapBusinessCard directly", () => {
      expect(src).not.toContain("MapBusinessCard");
      expect(src).not.toContain("MapView");
    });

    it("no longer has inline map split view styles", () => {
      expect(src).not.toContain("splitContainer:");
      expect(src).not.toContain("mapSelectedCard:");
    });

    it("stays under 660 LOC (down from 798)", () => {
      const lines = src.split("\n").length;
      expect(lines).toBeLessThan(660);
    });

    it("retains list view rendering", () => {
      expect(src).toContain("<BusinessCard");
      expect(src).toContain("viewMode === \"list\"");
    });

    it("retains filter chips", () => {
      expect(src).toContain("FilterChips");
      expect(src).toContain("PriceChips");
      expect(src).toContain("SortChips");
    });
  });
});
