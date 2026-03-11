/**
 * Sprint 534: Search relevance tuning — query-weighted scoring
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

// Import the actual functions for behavioral tests
import {
  parseQueryIntent,
  dishRelevance,
  textRelevance,
  combinedRelevance,
  wordScore,
} from "../server/search-ranking-v2";

describe("Sprint 534: Search Relevance Tuning", () => {
  describe("parseQueryIntent", () => {
    it("strips stop words from query", () => {
      expect(parseQueryIntent("best biryani in Irving", "Irving")).toBe("biryani");
    });

    it("strips city name from query", () => {
      expect(parseQueryIntent("Indian restaurant in Dallas", "Dallas")).toBe("indian restaurant");
    });

    it("handles multiple stop words", () => {
      expect(parseQueryIntent("the best top Indian food")).toBe("indian food");
    });

    it("preserves meaningful tokens", () => {
      expect(parseQueryIntent("biryani palace")).toBe("biryani palace");
    });

    it("handles empty query", () => {
      expect(parseQueryIntent("")).toBe("");
    });

    it("handles all stop words", () => {
      expect(parseQueryIntent("best in the")).toBe("");
    });
  });

  describe("dishRelevance", () => {
    it("returns 1.0 for exact dish match", () => {
      expect(dishRelevance(["Biryani", "Naan"], "biryani")).toBe(1.0);
    });

    it("returns 0.8 for partial dish match", () => {
      const score = dishRelevance(["Chicken Biryani"], "biryani");
      expect(score).toBeGreaterThanOrEqual(0.6);
    });

    it("returns 0 when no dishes match", () => {
      expect(dishRelevance(["Biryani"], "pizza")).toBe(0);
    });

    it("returns 0 for empty dish list", () => {
      expect(dishRelevance([], "biryani")).toBe(0);
    });

    it("returns 0 for empty query", () => {
      expect(dishRelevance(["Biryani"], "")).toBe(0);
    });
  });

  describe("combinedRelevance with dish signal", () => {
    it("boosts businesses with matching dishes", () => {
      const withDish = combinedRelevance("Some Restaurant", {
        query: "biryani",
        dishNames: ["Biryani", "Naan"],
        ratingCount: 5,
      });
      const withoutDish = combinedRelevance("Some Restaurant", {
        query: "biryani",
        dishNames: [],
        ratingCount: 5,
      });
      expect(withDish).toBeGreaterThan(withoutDish);
    });

    it("strips stop words before scoring", () => {
      // "best biryani in Irving" → "biryani" after intent parsing
      const score = combinedRelevance("Biryani House", {
        query: "best biryani in Irving",
        city: "Irving",
        ratingCount: 10,
      });
      // Should get text match on "biryani" in name
      expect(score).toBeGreaterThan(0);
    });

    it("uses 36/16/13/9/13/5/8 weight split (Sprint 639: proximity)", () => {
      const src = readFile("server/search-ranking-v2.ts");
      expect(src).toContain("text * 0.36");
      expect(src).toContain("category * 0.16");
      expect(src).toContain("dish * 0.13");
      expect(src).toContain("completeness * 0.09");
      expect(src).toContain("volume * 0.13");
      expect(src).toContain("cityBonus * 0.05");
      expect(src).toContain("proximity * 0.08");
    });
  });

  describe("Source code validation", () => {
    const src = readFile("server/search-ranking-v2.ts");

    it("exports parseQueryIntent", () => {
      expect(src).toContain("export function parseQueryIntent");
    });

    it("exports dishRelevance", () => {
      expect(src).toContain("export function dishRelevance");
    });

    it("has SEARCH_STOP_WORDS set", () => {
      expect(src).toContain("SEARCH_STOP_WORDS");
      expect(src).toContain('"best"');
      expect(src).toContain('"in"');
    });

    it("SearchContext includes dishNames and city", () => {
      expect(src).toContain("dishNames?: string[]");
      expect(src).toContain("city?: string");
    });

    it("combinedRelevance uses parseQueryIntent", () => {
      expect(src).toContain("parseQueryIntent(ctx.query, ctx.city)");
    });
  });

  describe("Search result processor integration", () => {
    const src = readFile("server/search-result-processor.ts");

    it("passes dishNames to search context", () => {
      expect(src).toContain("dishNames");
    });

    it("passes city to search context", () => {
      expect(src).toContain("city:");
    });

    it("SearchProcessingOpts includes city", () => {
      expect(src).toContain("city?: string");
    });
  });

  describe("LOC thresholds", () => {
    const src = readFile("server/search-ranking-v2.ts");
    const lines = src.split("\n").length;

    it("search-ranking-v2.ts stays under 410 LOC (Sprint 639: proximity)", () => {
      expect(lines).toBeLessThan(410);
    });
  });
});
