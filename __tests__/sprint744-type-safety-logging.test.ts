/**
 * Sprint 744: Server Type Safety + Structured Logging
 *
 * Validates:
 * 1. search-result-processor.ts exports typed interfaces (no `any[]`)
 * 2. og-image.ts uses structured logger instead of console.error
 * 3. lib/sharing.ts has zero remaining empty catch blocks
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readSource(filePath: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), filePath), "utf-8");
}

describe("Sprint 744: search-result-processor.ts Type Safety", () => {
  const src = readSource("server/search-result-processor.ts");

  it("exports SearchBusinessRecord interface", () => {
    expect(src).toContain("export interface SearchBusinessRecord");
  });

  it("exports EnrichedSearchResult interface", () => {
    expect(src).toContain("export interface EnrichedSearchResult");
  });

  it("enrichSearchResults accepts SearchBusinessRecord[]", () => {
    expect(src).toContain("bizList: SearchBusinessRecord[]");
  });

  it("enrichSearchResults returns EnrichedSearchResult[]", () => {
    expect(src).toContain("): EnrichedSearchResult[]");
  });

  it("applySearchFilters accepts EnrichedSearchResult[]", () => {
    expect(src).toContain("data: EnrichedSearchResult[]");
  });

  it("sortByRelevance accepts EnrichedSearchResult[]", () => {
    expect(src).toMatch(/sortByRelevance\(data: EnrichedSearchResult\[\]/);
  });

  it("has zero 'as any' casts", () => {
    const matches = src.match(/as any/g);
    expect(matches).toBeNull();
  });

  it("SearchBusinessRecord has required fields", () => {
    expect(src).toContain("id: string");
    expect(src).toContain("name: string");
    expect(src).toContain("slug: string");
  });

  it("SearchBusinessRecord has optional business fields", () => {
    expect(src).toContain("topDishes?: string[]");
    expect(src).toContain("city?: string | null");
    expect(src).toContain("menuUrl?: string | null");
    expect(src).toContain("openingHours?:");
    expect(src).toContain("dietaryTags?: string[]");
  });

  it("EnrichedSearchResult extends SearchBusinessRecord", () => {
    expect(src).toContain("extends SearchBusinessRecord");
  });

  it("EnrichedSearchResult has computed fields", () => {
    expect(src).toContain("photoUrls: string[]");
    expect(src).toContain("relevanceScore: number");
    expect(src).toContain("distanceKm: number | null");
  });
});

describe("Sprint 744: og-image.ts Structured Logging", () => {
  const src = readSource("server/og-image.ts");

  it("imports log from logger", () => {
    expect(src).toContain('import { log } from "./logger"');
  });

  it("creates tagged logger", () => {
    expect(src).toContain('log.tag("OG-Image")');
  });

  it("uses structured logger for business errors", () => {
    expect(src).toContain("ogLog.error(");
  });

  it("does not use console.error", () => {
    expect(src).not.toContain("console.error");
  });
});

describe("Sprint 744: lib/sharing.ts — Zero Empty Catches", () => {
  const src = readSource("lib/sharing.ts");

  it("has no empty catch blocks", () => {
    const matches = src.match(/catch\s*\{\s*\}|catch\s*\(\)\s*\{\s*\}/g);
    expect(matches).toBeNull();
  });

  it("logs copy failures in dev", () => {
    expect(src).toContain("[Sharing] Copy failed:");
  });

  it("logs WhatsApp failures in dev", () => {
    expect(src).toContain("[Sharing] WhatsApp failed:");
  });

  it("logs deep link parse failures in dev", () => {
    expect(src).toContain("[Sharing] Deep link parse failed:");
  });

  it("all console.warn calls are __DEV__-guarded", () => {
    const warnLines = src.split("\n").filter(l => l.includes("console.warn("));
    warnLines.forEach((line) => {
      expect(line).toContain("__DEV__");
    });
  });
});
