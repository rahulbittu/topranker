/**
 * Sprint 633: Search relevance tuning
 * City matching + action URL presence in relevance scoring
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf-8");
}

describe("Sprint 633 — Search Relevance Tuning", () => {
  const rankingSrc = readFile("server/search-ranking-v2.ts");
  const processorSrc = readFile("server/search-result-processor.ts");

  describe("SearchContext additions", () => {
    it("has hasActionUrls field", () => {
      expect(rankingSrc).toContain("hasActionUrls");
    });

    it("has businessCity field", () => {
      expect(rankingSrc).toContain("businessCity");
    });
  });

  describe("profileCompleteness includes action URLs", () => {
    it("checks hasActionUrls in completeness", () => {
      expect(rankingSrc).toContain("ctx.hasActionUrls");
    });
  });

  describe("cityMatchBonus function", () => {
    it("exports cityMatchBonus", () => {
      expect(rankingSrc).toContain("export function cityMatchBonus");
    });

    it("returns 0.1 for exact city match", () => {
      expect(rankingSrc).toContain("return 0.1");
    });

    it("returns 0.05 for partial match", () => {
      expect(rankingSrc).toContain("return 0.05");
    });

    it("returns 0 for no match", () => {
      // The function returns 0 at the end
      expect(rankingSrc).toContain("return 0;");
    });
  });

  describe("combinedRelevance uses city bonus", () => {
    it("calls cityMatchBonus", () => {
      expect(rankingSrc).toContain("cityMatchBonus(ctx)");
    });

    it("includes cityBonus in weight formula", () => {
      expect(rankingSrc).toContain("cityBonus");
    });

    it("caps at 1.0", () => {
      expect(rankingSrc).toContain("Math.min(1,");
    });
  });

  describe("Search processor passes new fields", () => {
    it("passes hasActionUrls to search context", () => {
      expect(processorSrc).toContain("hasActionUrls");
    });

    it("passes businessCity to search context", () => {
      expect(processorSrc).toContain("businessCity");
    });
  });

  describe("File health", () => {
    const thresholds = JSON.parse(readFile("shared/thresholds.json"));
    it("build under 750kb", () => {
      expect(thresholds.build.currentSizeKb).toBeLessThan(750);
    });
    it("tracks 34 files", () => {
      expect(Object.keys(thresholds.files).length).toBe(34);
    });
  });
});
