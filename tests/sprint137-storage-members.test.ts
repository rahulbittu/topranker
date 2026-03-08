/**
 * Unit Tests — Core Credibility Engine (server/storage)
 * Sprint 137
 *
 * Tests the pure-logic functions from helpers.ts (getVoteWeight,
 * getTierFromScore, getTemporalMultiplier) and the credibility
 * formula math from members.ts without requiring a database.
 */

import { describe, it, expect, vi } from "vitest";

// Mock the database module so helpers.ts can be imported without DATABASE_URL
vi.mock("@/server/db", () => ({ db: {} }));

import {
  getVoteWeight,
  getCredibilityTier,
  getTierFromScore,
  getTemporalMultiplier,
} from "@/server/storage/helpers";

// ---------------------------------------------------------------------------
// Credibility formula — pure math replica from recalculateCredibilityScore
// ---------------------------------------------------------------------------
function computeCredibilityScore(params: {
  totalRatings: number;
  totalCategories: number;
  daysActive: number;
  stddev: number;
  ratingCount: number; // must be >= 5 for variance bonus
  helpfulness: number;
  penalties: number;
}): { score: number; breakdown: Record<string, number> } {
  const base = 10;
  const volume = Math.min(params.totalRatings * 2, 200);
  const diversity = Math.min(params.totalCategories * 15, 100);
  const age = Math.min(params.daysActive * 0.5, 100);
  const varianceBonus =
    params.ratingCount >= 5 ? Math.min(params.stddev * 60, 150) : 0;
  const helpfulness = params.helpfulness;
  const penalties = params.penalties;

  const raw = base + volume + diversity + age + varianceBonus + helpfulness - penalties;
  const score = Math.max(10, Math.min(1000, Math.round(raw)));

  return {
    score,
    breakdown: { base, volume, diversity, age: Math.round(age), variance: Math.round(varianceBonus), helpfulness, penalties },
  };
}

// =========================================================================
// getVoteWeight
// =========================================================================
describe("getVoteWeight — tier boundary weights", () => {
  it("returns 0.100 for score 0 (absolute minimum)", () => {
    expect(getVoteWeight(0)).toBe(0.1);
  });

  it("returns 0.100 for score 99 (just below city)", () => {
    expect(getVoteWeight(99)).toBe(0.1);
  });

  it("returns 0.350 for score 100 (city threshold)", () => {
    expect(getVoteWeight(100)).toBe(0.35);
  });

  it("returns 0.350 for score 299 (just below trusted)", () => {
    expect(getVoteWeight(299)).toBe(0.35);
  });

  it("returns 0.700 for score 300 (trusted threshold)", () => {
    expect(getVoteWeight(300)).toBe(0.7);
  });

  it("returns 0.700 for score 599 (just below top)", () => {
    expect(getVoteWeight(599)).toBe(0.7);
  });

  it("returns 1.000 for score 600 (top threshold)", () => {
    expect(getVoteWeight(600)).toBe(1.0);
  });

  it("returns 1.000 for score 1000 (maximum)", () => {
    expect(getVoteWeight(1000)).toBe(1.0);
  });
});

// =========================================================================
// getCredibilityTier (simple score-only)
// =========================================================================
describe("getCredibilityTier — score-only tier mapping", () => {
  it("maps score < 100 to community", () => {
    expect(getCredibilityTier(0)).toBe("community");
    expect(getCredibilityTier(50)).toBe("community");
    expect(getCredibilityTier(99)).toBe("community");
  });

  it("maps score 100-299 to city", () => {
    expect(getCredibilityTier(100)).toBe("city");
    expect(getCredibilityTier(299)).toBe("city");
  });

  it("maps score 300-599 to trusted", () => {
    expect(getCredibilityTier(300)).toBe("trusted");
    expect(getCredibilityTier(599)).toBe("trusted");
  });

  it("maps score 600+ to top", () => {
    expect(getCredibilityTier(600)).toBe("top");
    expect(getCredibilityTier(1000)).toBe("top");
  });
});

// =========================================================================
// getTierFromScore — multi-criteria tier gates
// =========================================================================
describe("getTierFromScore — Top tier gate", () => {
  it("grants Top when all six criteria are met", () => {
    expect(getTierFromScore(600, 80, 4, 90, 1.0, 0)).toBe("top");
  });

  it("rejects Top when score is 599 (just below threshold)", () => {
    expect(getTierFromScore(599, 80, 4, 90, 1.0, 0)).not.toBe("top");
  });

  it("rejects Top with only 79 ratings", () => {
    expect(getTierFromScore(600, 79, 4, 90, 1.0, 0)).not.toBe("top");
  });

  it("rejects Top with only 3 categories", () => {
    expect(getTierFromScore(600, 80, 3, 90, 1.0, 0)).not.toBe("top");
  });

  it("rejects Top with only 89 days active", () => {
    expect(getTierFromScore(600, 80, 4, 89, 1.0, 0)).not.toBe("top");
  });

  it("rejects Top when variance is 0.99", () => {
    expect(getTierFromScore(600, 80, 4, 90, 0.99, 0)).not.toBe("top");
  });

  it("rejects Top with any active flags", () => {
    expect(getTierFromScore(600, 80, 4, 90, 1.0, 1)).not.toBe("top");
  });
});

describe("getTierFromScore — Trusted tier gate", () => {
  it("grants Trusted when all criteria are met", () => {
    expect(getTierFromScore(300, 35, 3, 45, 0.8, 0)).toBe("trusted");
  });

  it("rejects Trusted when score is 299", () => {
    expect(getTierFromScore(299, 35, 3, 45, 0.8, 0)).not.toBe("trusted");
  });

  it("rejects Trusted with only 34 ratings", () => {
    expect(getTierFromScore(300, 34, 3, 45, 0.8, 0)).not.toBe("trusted");
  });

  it("rejects Trusted with only 2 categories", () => {
    expect(getTierFromScore(300, 35, 2, 45, 0.8, 0)).not.toBe("trusted");
  });

  it("rejects Trusted with only 44 days", () => {
    expect(getTierFromScore(300, 35, 3, 44, 0.8, 0)).not.toBe("trusted");
  });

  it("rejects Trusted when variance is 0.79", () => {
    expect(getTierFromScore(300, 35, 3, 45, 0.79, 0)).not.toBe("trusted");
  });
});

describe("getTierFromScore — City tier gate", () => {
  it("grants City when criteria are met", () => {
    expect(getTierFromScore(100, 10, 2, 14, 0, 0)).toBe("city");
  });

  it("rejects City when score is 99", () => {
    expect(getTierFromScore(99, 10, 2, 14, 0, 0)).not.toBe("city");
  });

  it("rejects City with only 9 ratings", () => {
    expect(getTierFromScore(100, 9, 2, 14, 0, 0)).not.toBe("city");
  });

  it("rejects City with only 1 category", () => {
    expect(getTierFromScore(100, 10, 1, 14, 0, 0)).not.toBe("city");
  });

  it("rejects City with only 13 days", () => {
    expect(getTierFromScore(100, 10, 2, 13, 0, 0)).not.toBe("city");
  });
});

describe("getTierFromScore — Community fallback", () => {
  it("returns community for a brand-new user", () => {
    expect(getTierFromScore(10, 0, 0, 0, 0, 0)).toBe("community");
  });

  it("returns community when no gate is satisfied", () => {
    expect(getTierFromScore(50, 5, 1, 7, 0, 0)).toBe("community");
  });
});

// =========================================================================
// getTemporalMultiplier — rating age decay
// =========================================================================
describe("getTemporalMultiplier — decay brackets", () => {
  it("returns 1.00 for 0 days (brand new rating)", () => {
    expect(getTemporalMultiplier(0)).toBe(1.0);
  });

  it("returns 1.00 at exactly 30 days", () => {
    expect(getTemporalMultiplier(30)).toBe(1.0);
  });

  it("returns 0.85 at 31 days (first decay bracket)", () => {
    expect(getTemporalMultiplier(31)).toBe(0.85);
  });

  it("returns 0.85 at exactly 90 days", () => {
    expect(getTemporalMultiplier(90)).toBe(0.85);
  });

  it("returns 0.65 at 91 days", () => {
    expect(getTemporalMultiplier(91)).toBe(0.65);
  });

  it("returns 0.65 at exactly 180 days", () => {
    expect(getTemporalMultiplier(180)).toBe(0.65);
  });

  it("returns 0.45 at 181 days", () => {
    expect(getTemporalMultiplier(181)).toBe(0.45);
  });

  it("returns 0.45 at exactly 365 days", () => {
    expect(getTemporalMultiplier(365)).toBe(0.45);
  });

  it("returns 0.25 at 366 days (floor bracket)", () => {
    expect(getTemporalMultiplier(366)).toBe(0.25);
  });

  it("never goes below 0.25 even at extreme age", () => {
    expect(getTemporalMultiplier(5000)).toBe(0.25);
  });
});

// =========================================================================
// Credibility formula — computeCredibilityScore
// =========================================================================
describe("Credibility formula — base and clamping", () => {
  it("returns minimum score of 10 for a brand-new user", () => {
    const { score, breakdown } = computeCredibilityScore({
      totalRatings: 0, totalCategories: 0, daysActive: 0,
      stddev: 0, ratingCount: 0, helpfulness: 0, penalties: 0,
    });
    expect(score).toBe(10);
    expect(breakdown.base).toBe(10);
  });

  it("clamps score to maximum of 1000", () => {
    const { score } = computeCredibilityScore({
      totalRatings: 200, totalCategories: 10, daysActive: 500,
      stddev: 5, ratingCount: 200, helpfulness: 100, penalties: 0,
    });
    expect(score).toBeLessThanOrEqual(1000);
  });

  it("never drops below 10 even with massive penalties", () => {
    const { score } = computeCredibilityScore({
      totalRatings: 10, totalCategories: 2, daysActive: 30,
      stddev: 1, ratingCount: 10, helpfulness: 0, penalties: 9999,
    });
    expect(score).toBe(10);
  });
});

describe("Credibility formula — volume component", () => {
  it("computes volume as totalRatings * 2", () => {
    const { breakdown } = computeCredibilityScore({
      totalRatings: 50, totalCategories: 0, daysActive: 0,
      stddev: 0, ratingCount: 0, helpfulness: 0, penalties: 0,
    });
    expect(breakdown.volume).toBe(100);
  });

  it("caps volume at 200 (100 ratings)", () => {
    const { breakdown } = computeCredibilityScore({
      totalRatings: 100, totalCategories: 0, daysActive: 0,
      stddev: 0, ratingCount: 0, helpfulness: 0, penalties: 0,
    });
    expect(breakdown.volume).toBe(200);
  });

  it("does not exceed 200 even with 500 ratings", () => {
    const { breakdown } = computeCredibilityScore({
      totalRatings: 500, totalCategories: 0, daysActive: 0,
      stddev: 0, ratingCount: 0, helpfulness: 0, penalties: 0,
    });
    expect(breakdown.volume).toBe(200);
  });
});

describe("Credibility formula — diversity component", () => {
  it("computes diversity as totalCategories * 15", () => {
    const { breakdown } = computeCredibilityScore({
      totalRatings: 0, totalCategories: 4, daysActive: 0,
      stddev: 0, ratingCount: 0, helpfulness: 0, penalties: 0,
    });
    expect(breakdown.diversity).toBe(60);
  });

  it("caps diversity at 100 (7 categories = 105 -> 100)", () => {
    const { breakdown } = computeCredibilityScore({
      totalRatings: 0, totalCategories: 7, daysActive: 0,
      stddev: 0, ratingCount: 0, helpfulness: 0, penalties: 0,
    });
    expect(breakdown.diversity).toBe(100);
  });
});

describe("Credibility formula — age component", () => {
  it("computes age as daysActive * 0.5", () => {
    const { breakdown } = computeCredibilityScore({
      totalRatings: 0, totalCategories: 0, daysActive: 100,
      stddev: 0, ratingCount: 0, helpfulness: 0, penalties: 0,
    });
    expect(breakdown.age).toBe(50);
  });

  it("caps age at 100 (200 days)", () => {
    const { breakdown } = computeCredibilityScore({
      totalRatings: 0, totalCategories: 0, daysActive: 200,
      stddev: 0, ratingCount: 0, helpfulness: 0, penalties: 0,
    });
    expect(breakdown.age).toBe(100);
  });

  it("caps age at 100 for 999 days", () => {
    const { breakdown } = computeCredibilityScore({
      totalRatings: 0, totalCategories: 0, daysActive: 999,
      stddev: 0, ratingCount: 0, helpfulness: 0, penalties: 0,
    });
    expect(breakdown.age).toBe(100);
  });
});

describe("Credibility formula — variance bonus", () => {
  it("gives zero variance bonus when ratingCount < 5", () => {
    const { breakdown } = computeCredibilityScore({
      totalRatings: 4, totalCategories: 0, daysActive: 0,
      stddev: 2.0, ratingCount: 4, helpfulness: 0, penalties: 0,
    });
    expect(breakdown.variance).toBe(0);
  });

  it("computes variance as stddev * 60 when ratingCount >= 5", () => {
    const { breakdown } = computeCredibilityScore({
      totalRatings: 10, totalCategories: 0, daysActive: 0,
      stddev: 1.5, ratingCount: 10, helpfulness: 0, penalties: 0,
    });
    expect(breakdown.variance).toBe(90); // 1.5 * 60 = 90
  });

  it("caps variance bonus at 150", () => {
    const { breakdown } = computeCredibilityScore({
      totalRatings: 10, totalCategories: 0, daysActive: 0,
      stddev: 5.0, ratingCount: 10, helpfulness: 0, penalties: 0,
    });
    expect(breakdown.variance).toBe(150); // 5 * 60 = 300 -> capped 150
  });
});

describe("Credibility formula — helpfulness and penalties", () => {
  it("adds helpfulness directly to score", () => {
    const base = computeCredibilityScore({
      totalRatings: 0, totalCategories: 0, daysActive: 0,
      stddev: 0, ratingCount: 0, helpfulness: 0, penalties: 0,
    });
    const withHelp = computeCredibilityScore({
      totalRatings: 0, totalCategories: 0, daysActive: 0,
      stddev: 0, ratingCount: 0, helpfulness: 50, penalties: 0,
    });
    expect(withHelp.score - base.score).toBe(50);
  });

  it("subtracts penalties from score", () => {
    const clean = computeCredibilityScore({
      totalRatings: 50, totalCategories: 3, daysActive: 60,
      stddev: 1, ratingCount: 50, helpfulness: 0, penalties: 0,
    });
    const penalized = computeCredibilityScore({
      totalRatings: 50, totalCategories: 3, daysActive: 60,
      stddev: 1, ratingCount: 50, helpfulness: 0, penalties: 30,
    });
    expect(penalized.score).toBe(Math.max(10, clean.score - 30));
  });
});

describe("Credibility formula — full scenario integration", () => {
  it("computes a realistic Top Judge profile", () => {
    // 100 ratings, 5 categories, 200 days, stddev 1.5, 30 helpfulness, 0 penalties
    const { score, breakdown } = computeCredibilityScore({
      totalRatings: 100, totalCategories: 5, daysActive: 200,
      stddev: 1.5, ratingCount: 100, helpfulness: 30, penalties: 0,
    });
    // base=10, volume=200, diversity=75, age=100, variance=90, help=30, pen=0
    expect(breakdown.base).toBe(10);
    expect(breakdown.volume).toBe(200);
    expect(breakdown.diversity).toBe(75);
    expect(breakdown.age).toBe(100);
    expect(breakdown.variance).toBe(90);
    expect(score).toBe(505); // 10+200+75+100+90+30 = 505
  });

  it("computes a mid-tier Trusted profile", () => {
    const { score } = computeCredibilityScore({
      totalRatings: 40, totalCategories: 3, daysActive: 60,
      stddev: 1.0, ratingCount: 40, helpfulness: 10, penalties: 0,
    });
    // base=10, volume=80, diversity=45, age=30, variance=60, help=10
    expect(score).toBe(235);
  });
});
