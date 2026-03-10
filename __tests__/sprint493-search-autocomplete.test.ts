/**
 * Sprint 493: Enhanced Search Autocomplete
 *
 * Tests:
 * 1. search-autocomplete.ts pure functions
 * 2. storage/businesses.ts dish query
 * 3. routes-businesses.ts autocomplete endpoint enhancement
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 493: Enhanced Search Autocomplete", () => {
  describe("search-autocomplete.ts module", () => {
    const src = readFile("server/search-autocomplete.ts");

    it("exports AutocompleteSuggestion interface", () => {
      expect(src).toContain("export interface AutocompleteSuggestion");
    });

    it("AutocompleteSuggestion has type field with 4 variants", () => {
      expect(src).toContain('"business" | "dish" | "cuisine" | "category"');
    });

    it("exports editDistance function for fuzzy matching", () => {
      expect(src).toContain("export function editDistance");
    });

    it("editDistance implements Levenshtein algorithm with dp matrix", () => {
      expect(src).toContain("dp[i - 1][j - 1] + cost");
    });

    it("exports isFuzzyMatch with threshold based on query length", () => {
      expect(src).toContain("export function isFuzzyMatch");
      expect(src).toContain("q.length >= 4 ? 2 : 1");
    });

    it("isFuzzyMatch checks exact prefix, contains, and edit distance", () => {
      expect(src).toContain("t.startsWith(q)");
      expect(src).toContain("t.includes(q)");
      expect(src).toContain("editDistance(q");
    });

    it("exports scoreSuggestion with type priority", () => {
      expect(src).toContain("export function scoreSuggestion");
      expect(src).toContain('"business"');
      expect(src).toContain('"dish"');
    });

    it("exports mergeSuggestions with deduplication", () => {
      expect(src).toContain("export function mergeSuggestions");
      expect(src).toContain("const seen = new Set");
    });

    it("mergeSuggestions sorts by score and limits results", () => {
      expect(src).toContain(".sort((a, b) => (a.score");
      expect(src).toContain(".slice(0, limit)");
    });

    it("exports buildDishSuggestions for dish name matching", () => {
      expect(src).toContain("export function buildDishSuggestions");
    });

    it("buildDishSuggestions uses isFuzzyMatch for dish names", () => {
      expect(src).toContain("isFuzzyMatch(q, dish.name)");
    });

    it("dish suggestions include vote count in subtext", () => {
      expect(src).toContain("dish.voteCount");
      expect(src).toContain("votes");
    });
  });

  describe("storage/businesses.ts dish autocomplete", () => {
    const src = readFile("server/storage/businesses.ts");

    it("exports getTopDishesForAutocomplete function", () => {
      expect(src).toContain("export async function getTopDishesForAutocomplete");
    });

    it("joins dishes with businesses table", () => {
      expect(src).toContain("innerJoin(businesses, eq(dishes.businessId, businesses.id))");
    });

    it("filters by city and active status", () => {
      expect(src).toContain("eq(businesses.city, city)");
      expect(src).toContain("eq(dishes.isActive, true)");
    });

    it("orders by vote count descending", () => {
      expect(src).toContain("desc(dishes.voteCount)");
    });
  });

  describe("routes-businesses.ts autocomplete enhancement", () => {
    const src = readFile("server/routes-businesses.ts");

    it("fetches dish data alongside business suggestions", () => {
      expect(src).toContain("getTopDishesForAutocomplete");
    });

    it("imports buildDishSuggestions from search-autocomplete", () => {
      expect(src).toContain("buildDishSuggestions");
    });

    it("imports mergeSuggestions from search-autocomplete", () => {
      expect(src).toContain("mergeSuggestions");
    });

    it("merges business and dish suggestions", () => {
      expect(src).toContain("mergeSuggestions([...bizMapped, ...dishSuggestions]");
    });

    it("limits merged results to 8", () => {
      expect(src).toContain(", 8)");
    });
  });
});
