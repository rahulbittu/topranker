/**
 * Sprint 244 — Search Ranking v2 (Reputation-Weighted)
 *
 * Validates:
 * 1. Search ranking v2 module (server/search-ranking-v2.ts) — static + runtime
 * 2. Admin ranking routes (server/routes-admin-ranking.ts) — static
 * 3. Integration wiring (routes.ts)
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  calculateWeightedScore,
  getConfidenceLevel,
  rankBusinesses,
  getRankingWeights,
  setRankingWeights,
  type RatingInput,
} from "../server/search-ranking-v2";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. Search Ranking v2 — Static
// ---------------------------------------------------------------------------
describe("Search ranking v2 — static analysis", () => {
  const src = readFile("server/search-ranking-v2.ts");

  it("file exists", () => {
    expect(fileExists("server/search-ranking-v2.ts")).toBe(true);
  });

  it("exports calculateWeightedScore function", () => {
    expect(src).toContain("export function calculateWeightedScore");
  });

  it("exports getConfidenceLevel function", () => {
    expect(src).toContain("export function getConfidenceLevel");
  });

  it("exports rankBusinesses function", () => {
    expect(src).toContain("export function rankBusinesses");
  });

  it("exports getRankingWeights function", () => {
    expect(src).toContain("export function getRankingWeights");
  });

  it("exports setRankingWeights function", () => {
    expect(src).toContain("export function setRankingWeights");
  });

  it("exports RatingInput interface", () => {
    expect(src).toContain("export interface RatingInput");
  });

  it("uses tagged logger", () => {
    expect(src).toContain('log.tag("SearchRankingV2")');
  });

  it("default reputationWeight is 0.6", () => {
    const weights = getRankingWeights();
    expect(weights.reputationWeight).toBe(0.6);
  });

  it("default recencyBoost is 0.15", () => {
    const weights = getRankingWeights();
    expect(weights.recencyBoost).toBe(0.15);
  });

  it("default ratingCountFloor is 10", () => {
    const weights = getRankingWeights();
    expect(weights.ratingCountFloor).toBe(10);
  });

  it("default bayesianPrior is 3.5", () => {
    const weights = getRankingWeights();
    expect(weights.bayesianPrior).toBe(3.5);
  });
});

// ---------------------------------------------------------------------------
// 2. Search Ranking v2 — Runtime
// ---------------------------------------------------------------------------
describe("Search ranking v2 — runtime", () => {
  beforeEach(() => {
    // Reset weights to defaults before each test
    setRankingWeights({
      reputationWeight: 0.6,
      recencyBoost: 0.15,
      ratingCountFloor: 10,
      bayesianPrior: 3.5,
      bayesianStrength: 5,
    });
  });

  it("calculateWeightedScore with empty ratings returns zeros", () => {
    const result = calculateWeightedScore([]);
    expect(result.rawScore).toBe(0);
    expect(result.weightedScore).toBe(0);
  });

  it("calculateWeightedScore with single rating", () => {
    const ratings: RatingInput[] = [
      { memberId: "m1", score: 5, reputationScore: 80, daysAgo: 1 },
    ];
    const result = calculateWeightedScore(ratings);
    expect(result.rawScore).toBe(5);
    expect(result.weightedScore).toBeGreaterThan(0);
    expect(result.weightedScore).toBeLessThanOrEqual(5);
  });

  it("high-reputation ratings weighted more than low-reputation", () => {
    const highRep: RatingInput[] = [
      { memberId: "m1", score: 5, reputationScore: 95, daysAgo: 15 },
      { memberId: "m2", score: 1, reputationScore: 5, daysAgo: 15 },
    ];
    const lowRep: RatingInput[] = [
      { memberId: "m1", score: 5, reputationScore: 5, daysAgo: 15 },
      { memberId: "m2", score: 1, reputationScore: 95, daysAgo: 15 },
    ];
    const highResult = calculateWeightedScore(highRep);
    const lowResult = calculateWeightedScore(lowRep);
    // When high-rep member gives 5 and low-rep gives 1, weighted score should be higher
    // than when low-rep gives 5 and high-rep gives 1
    expect(highResult.weightedScore).toBeGreaterThan(lowResult.weightedScore);
  });

  it("recent ratings boosted over old ratings", () => {
    const recentHigh: RatingInput[] = [
      { memberId: "m1", score: 5, reputationScore: 50, daysAgo: 1 },
      { memberId: "m2", score: 1, reputationScore: 50, daysAgo: 60 },
    ];
    const recentLow: RatingInput[] = [
      { memberId: "m1", score: 5, reputationScore: 50, daysAgo: 60 },
      { memberId: "m2", score: 1, reputationScore: 50, daysAgo: 1 },
    ];
    const recentHighResult = calculateWeightedScore(recentHigh);
    const recentLowResult = calculateWeightedScore(recentLow);
    // When recent rating is 5, weighted score should be higher
    expect(recentHighResult.weightedScore).toBeGreaterThan(recentLowResult.weightedScore);
  });

  it("Bayesian smoothing pulls score toward prior with few ratings", () => {
    const oneRating: RatingInput[] = [
      { memberId: "m1", score: 5, reputationScore: 50, daysAgo: 15 },
    ];
    const manyRatings: RatingInput[] = Array.from({ length: 50 }, (_, i) => ({
      memberId: `m${i}`,
      score: 5,
      reputationScore: 50,
      daysAgo: 15,
    }));
    const oneResult = calculateWeightedScore(oneRating);
    const manyResult = calculateWeightedScore(manyRatings);
    // With one rating of 5, Bayesian smoothing pulls toward 3.5 prior
    // With many ratings of 5, weighted score should be closer to 5
    expect(oneResult.weightedScore).toBeLessThan(manyResult.weightedScore);
    expect(oneResult.weightedScore).toBeLessThan(5);
  });

  it("getConfidenceLevel returns low for few ratings", () => {
    expect(getConfidenceLevel(0)).toBe("low");
    expect(getConfidenceLevel(2)).toBe("low");
    expect(getConfidenceLevel(4)).toBe("low");
  });

  it("getConfidenceLevel returns medium for moderate ratings", () => {
    expect(getConfidenceLevel(5)).toBe("medium");
    expect(getConfidenceLevel(7)).toBe("medium");
    expect(getConfidenceLevel(9)).toBe("medium");
  });

  it("getConfidenceLevel returns high for many ratings", () => {
    expect(getConfidenceLevel(10)).toBe("high");
    expect(getConfidenceLevel(50)).toBe("high");
    expect(getConfidenceLevel(100)).toBe("high");
  });

  it("rankBusinesses sorts by weightedScore descending", () => {
    const businesses = [
      {
        businessId: "b1", name: "Low Biz",
        ratings: [{ memberId: "m1", score: 2, reputationScore: 50, daysAgo: 10 }],
      },
      {
        businessId: "b2", name: "High Biz",
        ratings: [{ memberId: "m1", score: 5, reputationScore: 90, daysAgo: 1 }],
      },
      {
        businessId: "b3", name: "Mid Biz",
        ratings: [{ memberId: "m1", score: 3, reputationScore: 50, daysAgo: 10 }],
      },
    ];
    const ranked = rankBusinesses(businesses);
    expect(ranked[0].businessId).toBe("b2");
    expect(ranked[ranked.length - 1].businessId).toBe("b1");
    // Verify descending order
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].weightedScore).toBeGreaterThanOrEqual(ranked[i].weightedScore);
    }
  });

  it("rankBusinesses identifies high_volume boost factor", () => {
    const businesses = [
      {
        businessId: "b1", name: "Popular",
        ratings: Array.from({ length: 15 }, (_, i) => ({
          memberId: `m${i}`, score: 4, reputationScore: 50, daysAgo: 10,
        })),
      },
    ];
    const ranked = rankBusinesses(businesses);
    expect(ranked[0].boostFactors).toContain("high_volume");
  });

  it("rankBusinesses identifies authority_rated boost factor", () => {
    const businesses = [
      {
        businessId: "b1", name: "Authority Rated",
        ratings: [{ memberId: "m1", score: 4, reputationScore: 85, daysAgo: 10 }],
      },
    ];
    const ranked = rankBusinesses(businesses);
    expect(ranked[0].boostFactors).toContain("authority_rated");
  });

  it("rankBusinesses identifies recent_activity boost factor", () => {
    const businesses = [
      {
        businessId: "b1", name: "Recent",
        ratings: [{ memberId: "m1", score: 4, reputationScore: 50, daysAgo: 3 }],
      },
    ];
    const ranked = rankBusinesses(businesses);
    expect(ranked[0].boostFactors).toContain("recent_activity");
  });

  it("rankBusinesses returns correct ratingCount and confidenceLevel", () => {
    const businesses = [
      {
        businessId: "b1", name: "Few Ratings",
        ratings: [{ memberId: "m1", score: 4, reputationScore: 50, daysAgo: 10 }],
      },
      {
        businessId: "b2", name: "Many Ratings",
        ratings: Array.from({ length: 20 }, (_, i) => ({
          memberId: `m${i}`, score: 4, reputationScore: 50, daysAgo: 10,
        })),
      },
    ];
    const ranked = rankBusinesses(businesses);
    const few = ranked.find(r => r.businessId === "b1")!;
    const many = ranked.find(r => r.businessId === "b2")!;
    expect(few.ratingCount).toBe(1);
    expect(few.confidenceLevel).toBe("low");
    expect(many.ratingCount).toBe(20);
    expect(many.confidenceLevel).toBe("high");
  });

  it("getRankingWeights returns a copy (not mutable reference)", () => {
    const w1 = getRankingWeights();
    w1.reputationWeight = 999;
    const w2 = getRankingWeights();
    expect(w2.reputationWeight).toBe(0.6);
  });

  it("setRankingWeights updates partial fields only", () => {
    setRankingWeights({ recencyBoost: 0.5 });
    const w = getRankingWeights();
    expect(w.recencyBoost).toBe(0.5);
    expect(w.reputationWeight).toBe(0.6); // unchanged
    expect(w.ratingCountFloor).toBe(10);  // unchanged
  });
});

// ---------------------------------------------------------------------------
// 3. Admin Ranking Routes — Static
// ---------------------------------------------------------------------------
describe("Admin ranking routes — static analysis", () => {
  const src = readFile("server/routes-admin-ranking.ts");

  it("file exists", () => {
    expect(fileExists("server/routes-admin-ranking.ts")).toBe(true);
  });

  it("exports registerAdminRankingRoutes", () => {
    expect(src).toContain("export function registerAdminRankingRoutes");
  });

  it("defines GET /api/admin/ranking/weights endpoint", () => {
    expect(src).toContain("/api/admin/ranking/weights");
    expect(src).toContain("app.get");
  });

  it("defines PUT /api/admin/ranking/weights endpoint", () => {
    expect(src).toContain("app.put");
  });

  it("defines GET /api/admin/ranking/confidence-levels endpoint", () => {
    expect(src).toContain("/api/admin/ranking/confidence-levels");
  });

  it("uses tagged logger", () => {
    expect(src).toContain('log.tag("AdminRanking")');
  });
});

// ---------------------------------------------------------------------------
// 4. Integration
// ---------------------------------------------------------------------------
describe("Search ranking v2 — integration", () => {
  it("routes.ts imports registerAdminRankingRoutes", () => {
    const routesSrc = readFile("server/routes.ts");
    expect(routesSrc).toContain('import { registerAdminRankingRoutes } from "./routes-admin-ranking"');
  });

  it("routes.ts calls registerAdminRankingRoutes(app)", () => {
    const routesSrc = readFile("server/routes.ts");
    expect(routesSrc).toContain("registerAdminRankingRoutes(app)");
  });

  it("search-ranking-v2.ts does not import db", () => {
    const src = readFile("server/search-ranking-v2.ts");
    expect(src).not.toContain('from "./db"');
    expect(src).not.toContain('from "../db"');
  });

  it("routes-admin-ranking.ts imports from search-ranking-v2", () => {
    const src = readFile("server/routes-admin-ranking.ts");
    expect(src).toContain('from "./search-ranking-v2"');
  });
});
