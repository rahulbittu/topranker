/**
 * Sprint 476: Search Result Processing Extraction
 *
 * Tests:
 * 1. New search-result-processor.ts exports correct functions
 * 2. routes-businesses.ts uses extracted functions
 * 3. routes-businesses.ts LOC reduced
 * 4. Extraction maintains all processing stages
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (f: string) => fs.readFileSync(path.resolve(__dirname, "..", f), "utf-8");

describe("Sprint 476: Search Result Processing Extraction", () => {
  describe("search-result-processor.ts", () => {
    const src = readFile("server/search-result-processor.ts");

    it("exports enrichSearchResults function", () => {
      expect(src).toContain("export function enrichSearchResults");
    });

    it("exports applySearchFilters function", () => {
      expect(src).toContain("export function applySearchFilters");
    });

    it("exports sortByRelevance function", () => {
      expect(src).toContain("export function sortByRelevance");
    });

    it("exports haversineKm function", () => {
      expect(src).toContain("export function haversineKm");
    });

    it("exports SearchProcessingOpts interface", () => {
      expect(src).toContain("export interface SearchProcessingOpts");
    });

    it("enrichSearchResults computes relevance scores", () => {
      expect(src).toContain("combinedRelevance");
      expect(src).toContain("relevanceScore");
    });

    it("enrichSearchResults computes distance", () => {
      expect(src).toContain("haversineKm");
      expect(src).toContain("distanceKm");
    });

    it("enrichSearchResults computes open status", () => {
      expect(src).toContain("computeOpenStatus");
      expect(src).toContain("dynamicIsOpenNow");
    });

    it("applySearchFilters handles dietary tags", () => {
      expect(src).toContain("dietaryTags");
      expect(src).toContain("bizTags");
    });

    it("applySearchFilters handles distance filtering", () => {
      expect(src).toContain("maxDistanceKm");
    });

    it("applySearchFilters handles hours-based filters", () => {
      expect(src).toContain("openNow");
      expect(src).toContain("openLate");
      expect(src).toContain("openWeekends");
      expect(src).toContain("isOpenLate");
      expect(src).toContain("isOpenWeekends");
    });

    it("sortByRelevance sorts by relevance then weighted score", () => {
      expect(src).toContain("relevanceScore");
      expect(src).toContain("weightedScore");
    });

    it("is under 130 LOC", () => {
      expect(src.split("\n").length).toBeLessThan(130);
    });
  });

  describe("routes-businesses.ts integration", () => {
    const src = readFile("server/routes-businesses.ts");

    it("imports from search-result-processor", () => {
      expect(src).toContain('from "./search-result-processor"');
    });

    it("imports enrichSearchResults", () => {
      expect(src).toContain("enrichSearchResults");
    });

    it("imports applySearchFilters", () => {
      expect(src).toContain("applySearchFilters");
    });

    it("imports sortByRelevance", () => {
      expect(src).toContain("sortByRelevance");
    });

    it("uses processingOpts object for function calls", () => {
      expect(src).toContain("processingOpts");
      expect(src).toContain("enrichSearchResults(bizList, photoMap, processingOpts)");
    });

    it("calls applySearchFilters on enriched results", () => {
      expect(src).toContain("applySearchFilters(enriched, processingOpts)");
    });

    it("calls sortByRelevance on filtered results", () => {
      expect(src).toContain("sortByRelevance(filtered, query)");
    });

    it("is under 310 LOC (was 376)", () => {
      expect(src.split("\n").length).toBeLessThan(310);
    });

    it("no longer imports combinedRelevance directly", () => {
      expect(src).not.toContain('from "./search-ranking-v2"');
    });

    it("no longer has inline haversineKm function", () => {
      // Should import from processor, not define inline
      expect(src).not.toContain("function haversineKm");
    });
  });
});
