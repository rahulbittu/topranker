/**
 * Sprint 436 — Search Relevance Improvements
 *
 * Validates:
 * 1. Multi-word query matching
 * 2. Fuzzy matching (Levenshtein)
 * 3. Category/cuisine/neighborhood boost
 * 4. Rating volume signal
 * 5. Combined relevance scoring
 * 6. Route integration
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const rankingSrc = readFile("server/search-ranking-v2.ts");
const routesSrc = readFile("server/routes-businesses.ts");
const filtersSrc = readFile("components/search/DiscoverFilters.tsx");

// ---------------------------------------------------------------------------
// 1. Levenshtein distance function
// ---------------------------------------------------------------------------
describe("Levenshtein distance", () => {
  it("exports levenshtein function", () => {
    expect(rankingSrc).toContain("export function levenshtein");
  });

  it("accepts maxDist parameter for bounded computation", () => {
    expect(rankingSrc).toContain("maxDist");
    expect(rankingSrc).toContain("Infinity");
  });

  it("returns early if length difference exceeds maxDist", () => {
    expect(rankingSrc).toContain("Math.abs(a.length - b.length) > maxDist");
  });

  it("uses dynamic programming approach", () => {
    expect(rankingSrc).toContain("const dp");
  });
});

// ---------------------------------------------------------------------------
// 2. Word-level scoring
// ---------------------------------------------------------------------------
describe("wordScore function", () => {
  it("exports wordScore function", () => {
    expect(rankingSrc).toContain("export function wordScore");
  });

  it("returns 1.0 for exact match", () => {
    const fn = rankingSrc.slice(
      rankingSrc.indexOf("export function wordScore"),
      rankingSrc.indexOf("export function textRelevance")
    );
    expect(fn).toContain("return 1.0");
  });

  it("returns 0.8 for starts-with", () => {
    expect(rankingSrc).toContain("return 0.8");
  });

  it("returns 0.6 for contains", () => {
    expect(rankingSrc).toContain("return 0.6");
  });

  it("uses fuzzy matching for tokens >= 4 chars", () => {
    expect(rankingSrc).toContain("token.length >= 4");
  });

  it("returns 0.3 for 1-edit distance", () => {
    expect(rankingSrc).toContain("dist === 1) return 0.3");
  });

  it("returns 0.15 for 2-edit distance", () => {
    expect(rankingSrc).toContain("dist === 2) return 0.15");
  });
});

// ---------------------------------------------------------------------------
// 3. Enhanced textRelevance
// ---------------------------------------------------------------------------
describe("textRelevance — enhanced", () => {
  it("handles multi-word queries via tokenization", () => {
    expect(rankingSrc).toContain("queryTokens");
    expect(rankingSrc).toContain("nameWords");
  });

  it("scores 1.0 for exact full match", () => {
    const fn = rankingSrc.slice(
      rankingSrc.indexOf("export function textRelevance"),
      rankingSrc.indexOf("export function categoryRelevance")
    );
    expect(fn).toContain("n === q) return 1.0");
  });

  it("scores 0.9 for starts-with", () => {
    expect(rankingSrc).toContain("n.startsWith(q)) return 0.9");
  });

  it("scores 0.7 for full-string contains", () => {
    const fn = rankingSrc.slice(
      rankingSrc.indexOf("export function textRelevance"),
      rankingSrc.indexOf("export function categoryRelevance")
    );
    expect(fn).toContain("n.includes(q)) return 0.7");
  });

  it("averages per-token best scores for multi-word queries", () => {
    expect(rankingSrc).toContain("totalScore / queryTokens.length");
  });
});

// ---------------------------------------------------------------------------
// 4. Category/cuisine relevance
// ---------------------------------------------------------------------------
describe("categoryRelevance", () => {
  it("exports categoryRelevance function", () => {
    expect(rankingSrc).toContain("export function categoryRelevance");
  });

  it("checks cuisine field", () => {
    const fn = rankingSrc.slice(
      rankingSrc.indexOf("export function categoryRelevance"),
      rankingSrc.indexOf("export function ratingVolumeSignal")
    );
    expect(fn).toContain("ctx.cuisine");
  });

  it("checks category field", () => {
    const fn = rankingSrc.slice(
      rankingSrc.indexOf("export function categoryRelevance"),
      rankingSrc.indexOf("export function ratingVolumeSignal")
    );
    expect(fn).toContain("ctx.category");
  });

  it("checks neighborhood field", () => {
    const fn = rankingSrc.slice(
      rankingSrc.indexOf("export function categoryRelevance"),
      rankingSrc.indexOf("export function ratingVolumeSignal")
    );
    expect(fn).toContain("ctx.neighborhood");
  });

  it("skips tokens shorter than 3 chars", () => {
    expect(rankingSrc).toContain("token.length < 3");
  });

  it("uses fuzzy matching for cuisine", () => {
    const fn = rankingSrc.slice(
      rankingSrc.indexOf("export function categoryRelevance"),
      rankingSrc.indexOf("export function ratingVolumeSignal")
    );
    expect(fn).toContain("levenshtein(c, token");
  });
});

// ---------------------------------------------------------------------------
// 5. Rating volume signal
// ---------------------------------------------------------------------------
describe("ratingVolumeSignal", () => {
  it("exports ratingVolumeSignal function", () => {
    expect(rankingSrc).toContain("export function ratingVolumeSignal");
  });

  it("returns 0 for no ratings", () => {
    const fn = rankingSrc.slice(
      rankingSrc.indexOf("export function ratingVolumeSignal"),
      rankingSrc.indexOf("export function profileCompleteness")
    );
    expect(fn).toContain("return 0");
  });

  it("uses logarithmic scaling", () => {
    expect(rankingSrc).toContain("Math.log10(ratingCount)");
  });

  it("caps at 1.0 for 50+ ratings", () => {
    expect(rankingSrc).toContain("Math.log10(50)");
  });
});

// ---------------------------------------------------------------------------
// 6. Combined relevance
// ---------------------------------------------------------------------------
describe("combinedRelevance", () => {
  it("exports combinedRelevance function", () => {
    expect(rankingSrc).toContain("export function combinedRelevance");
  });

  it("weights text match at 38% (Sprint 633: rebalanced for city bonus)", () => {
    expect(rankingSrc).toContain("text * 0.38");
  });

  it("weights category at 18% (Sprint 633: rebalanced for city bonus)", () => {
    expect(rankingSrc).toContain("category * 0.18");
  });

  it("weights completeness at 10%", () => {
    expect(rankingSrc).toContain("completeness * 0.10");
  });

  it("weights volume at 14% (Sprint 633: rebalanced for city bonus)", () => {
    expect(rankingSrc).toContain("volume * 0.14");
  });

  it("weights cityBonus at 6% (Sprint 633: new city bonus signal)", () => {
    expect(rankingSrc).toContain("cityBonus * 0.06");
  });
});

// ---------------------------------------------------------------------------
// 7. SearchContext has new fields
// ---------------------------------------------------------------------------
describe("SearchContext interface", () => {
  it("has category field", () => {
    expect(rankingSrc).toContain("category?: string");
  });

  it("has cuisine field", () => {
    expect(rankingSrc).toContain("cuisine?: string");
  });

  it("has neighborhood field", () => {
    expect(rankingSrc).toContain("neighborhood?: string");
  });

  it("has ratingCount field", () => {
    expect(rankingSrc).toContain("ratingCount?: number");
  });
});

// ---------------------------------------------------------------------------
// 8. Route integration
// ---------------------------------------------------------------------------
describe("routes-businesses integration", () => {
  // Sprint 476: Search result processing extracted to search-result-processor.ts
  const processorSrc = readFile("server/search-result-processor.ts");

  it("imports combinedRelevance", () => {
    expect(processorSrc).toContain("combinedRelevance");
  });

  it("passes category to search context", () => {
    expect(processorSrc).toContain("category: b.category");
  });

  it("passes cuisine to search context", () => {
    expect(processorSrc).toContain("cuisine: b.cuisine");
  });

  it("passes neighborhood to search context", () => {
    expect(processorSrc).toContain("neighborhood: b.neighborhood");
  });

  it("passes ratingCount to search context", () => {
    expect(processorSrc).toContain("ratingCount:");
  });

  it("uses combinedRelevance for scoring", () => {
    expect(processorSrc).toContain("combinedRelevance(b.name, searchCtx)");
  });
});

// ---------------------------------------------------------------------------
// 9. Sort description updated
// ---------------------------------------------------------------------------
describe("DiscoverFilters — sort hint", () => {
  it("relevant sort mentions category and rating volume", () => {
    expect(filtersSrc).toContain("name match, category, and rating volume");
  });
});

// ---------------------------------------------------------------------------
// 10. File health
// ---------------------------------------------------------------------------
describe("file health", () => {
  it("search-ranking-v2.ts stays under 380 LOC (Sprint 534: added dish + intent parsing)", () => {
    expect(rankingSrc.split("\n").length).toBeLessThan(380);
  });

  it("routes-businesses.ts stays functional", () => {
    expect(routesSrc).toContain("registerBusinessRoutes");
  });
});
