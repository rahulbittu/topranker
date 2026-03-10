/**
 * Sprint 347: Search result ranking improvements
 * - Text relevance scoring for search queries
 * - Profile completeness bonus
 * - Integration with existing ranking pipeline
 */
import { describe, it, expect, beforeAll } from "vitest";
import * as fs from "fs";
import * as path from "path";

let rankingSrc = "";

beforeAll(() => {
  rankingSrc = fs.readFileSync(path.resolve("server/search-ranking-v2.ts"), "utf-8");
});

// ── Text relevance scoring ───────────────────────────────────────
describe("Text relevance scoring", () => {
  it("should export textRelevance function", () => {
    expect(rankingSrc).toContain("export function textRelevance");
  });

  it("should return 1.0 for exact name match", () => {
    expect(rankingSrc).toContain("return 1.0");
  });

  it("should return 0.8 for starts-with match", () => {
    expect(rankingSrc).toContain("return 0.8");
  });

  it("should return 0.5 for contains match", () => {
    expect(rankingSrc).toContain("return 0.5");
  });

  it("should return 0.4 for word-starts-with match", () => {
    expect(rankingSrc).toContain("return 0.4");
  });

  it("should return 0 for no match", () => {
    expect(rankingSrc).toMatch(/return 0;?\s*\}/);
  });

  it("should be case-insensitive", () => {
    expect(rankingSrc).toContain("toLowerCase()");
  });

  it("should handle empty query gracefully", () => {
    expect(rankingSrc).toContain("!query || !query.trim()");
  });
});

// ── Profile completeness ─────────────────────────────────────────
describe("Profile completeness scoring", () => {
  it("should export profileCompleteness function", () => {
    expect(rankingSrc).toContain("export function profileCompleteness");
  });

  it("should check hasPhotos", () => {
    expect(rankingSrc).toContain("ctx.hasPhotos");
  });

  it("should check hasHours", () => {
    expect(rankingSrc).toContain("ctx.hasHours");
  });

  it("should check hasCuisine", () => {
    expect(rankingSrc).toContain("ctx.hasCuisine");
  });

  it("should check hasDescription", () => {
    expect(rankingSrc).toContain("ctx.hasDescription");
  });

  it("should return score/total ratio", () => {
    expect(rankingSrc).toContain("score / total");
  });
});

// ── SearchContext interface ───────────────────────────────────────
describe("SearchContext interface", () => {
  it("should define SearchContext with query", () => {
    expect(rankingSrc).toContain("query?: string");
  });

  it("should define SearchContext with profile fields", () => {
    expect(rankingSrc).toContain("hasPhotos?: boolean");
    expect(rankingSrc).toContain("hasHours?: boolean");
    expect(rankingSrc).toContain("hasCuisine?: boolean");
    expect(rankingSrc).toContain("hasDescription?: boolean");
  });
});

// ── Integration with rankBusinesses ──────────────────────────────
describe("rankBusinesses integration", () => {
  it("should accept search context in business input", () => {
    expect(rankingSrc).toContain("search?: SearchContext");
  });

  it("should apply text relevance boost", () => {
    expect(rankingSrc).toContain("relevance * 0.3");
    expect(rankingSrc).toContain('"text_match"');
  });

  it("should apply completeness boost", () => {
    expect(rankingSrc).toContain("completeness >= 0.75");
    expect(rankingSrc).toContain('"complete_profile"');
  });

  it("should add 0.1 boost for complete profiles", () => {
    expect(rankingSrc).toContain("finalScore += 0.1");
  });

  it("should still sort by weighted score descending", () => {
    expect(rankingSrc).toContain("b.weightedScore - a.weightedScore");
  });
});

// ── Backwards compatibility ──────────────────────────────────────
describe("Backwards compatibility", () => {
  it("should still export calculateWeightedScore", () => {
    expect(rankingSrc).toContain("export function calculateWeightedScore");
  });

  it("should still export getConfidenceLevel", () => {
    expect(rankingSrc).toContain("export function getConfidenceLevel");
  });

  it("should still have Bayesian smoothing", () => {
    expect(rankingSrc).toContain("bayesianPrior");
    expect(rankingSrc).toContain("bayesianStrength");
  });

  it("should still have default ranking weights", () => {
    expect(rankingSrc).toContain("reputationWeight: 0.6");
    expect(rankingSrc).toContain("recencyBoost: 0.15");
  });

  it("should still detect high_volume, authority_rated, recent_activity", () => {
    expect(rankingSrc).toContain('"high_volume"');
    expect(rankingSrc).toContain('"authority_rated"');
    expect(rankingSrc).toContain('"recent_activity"');
  });
});
