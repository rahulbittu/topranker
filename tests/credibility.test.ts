/**
 * Unit Tests — Credibility Score System
 * Owner: Sage (Backend Engineer #2)
 *
 * Tests the core trust engine: credibility calculation, tier assignment,
 * vote weights, temporal decay, and tier requirements.
 * These are the most critical business logic functions in TopRanker.
 */

import { describe, it, expect } from "vitest";
import {
  calculateCredibilityScore,
  getCredibilityTier,
  getTierFromScore,
  getVoteWeight,
  getTemporalMultiplier,
  TIER_SCORE_RANGES,
  TIER_WEIGHTS,
  TIER_DISPLAY_NAMES,
} from "@/lib/data";

describe("Credibility Score Calculation", () => {
  it("returns minimum score of 10 for a brand new user", () => {
    const result = calculateCredibilityScore(0, 0, 0, 0, 0, 0);
    expect(result.totalScore).toBe(10);
    expect(result.basePoints).toBe(10);
  });

  it("caps total score at 1000", () => {
    // Max everything out
    const result = calculateCredibilityScore(200, 10, 500, 5, 1, 0);
    expect(result.totalScore).toBeLessThanOrEqual(1000);
  });

  it("never goes below 10 even with heavy penalties", () => {
    const result = calculateCredibilityScore(1, 1, 1, 0, 0, 500);
    expect(result.totalScore).toBe(10);
  });

  it("caps rating points at 200 (100 ratings * 2)", () => {
    const result = calculateCredibilityScore(200, 0, 0, 0, 0, 0);
    expect(result.ratingPoints).toBe(200);

    // More ratings shouldn't increase beyond cap
    const result2 = calculateCredibilityScore(500, 0, 0, 0, 0, 0);
    expect(result2.ratingPoints).toBe(200);
  });

  it("caps diversity bonus at 100 (6.67 categories * 15)", () => {
    const result = calculateCredibilityScore(0, 10, 0, 0, 0, 0);
    expect(result.diversityBonus).toBe(100);
  });

  it("caps age bonus at 100 (200 days * 0.5)", () => {
    const result = calculateCredibilityScore(0, 0, 300, 0, 0, 0);
    expect(result.ageBonus).toBe(100);
  });

  it("requires 5+ ratings for variance bonus", () => {
    const result = calculateCredibilityScore(4, 1, 10, 2.0, 0, 0);
    expect(result.varianceBonus).toBe(0);

    const result2 = calculateCredibilityScore(5, 1, 10, 2.0, 0, 0);
    expect(result2.varianceBonus).toBeGreaterThan(0);
  });

  it("subtracts flag penalties from total", () => {
    const clean = calculateCredibilityScore(50, 3, 30, 1, 0, 0);
    const flagged = calculateCredibilityScore(50, 3, 30, 1, 0, 50);
    expect(flagged.totalScore).toBe(Math.max(10, clean.totalScore - 50));
  });
});

describe("Tier Assignment", () => {
  it("assigns community tier for score < 100", () => {
    expect(getCredibilityTier(10)).toBe("community");
    expect(getCredibilityTier(50)).toBe("community");
    expect(getCredibilityTier(99)).toBe("community");
  });

  it("assigns city tier for score 100-299", () => {
    expect(getCredibilityTier(100)).toBe("city");
    expect(getCredibilityTier(200)).toBe("city");
    expect(getCredibilityTier(299)).toBe("city");
  });

  it("assigns trusted tier for score 300-599", () => {
    expect(getCredibilityTier(300)).toBe("trusted");
    expect(getCredibilityTier(450)).toBe("trusted");
    expect(getCredibilityTier(599)).toBe("trusted");
  });

  it("assigns top tier for score 600+", () => {
    expect(getCredibilityTier(600)).toBe("top");
    expect(getCredibilityTier(1000)).toBe("top");
  });
});

describe("getTierFromScore (strict multi-criteria)", () => {
  it("requires all criteria for Top Judge", () => {
    // Score 600+, 80+ ratings, 4+ categories, 90+ days, 1.0+ variance, 0 flags
    expect(getTierFromScore(600, 80, 4, 90, 1.0, 0)).toBe("top");
    // Fails on flags
    expect(getTierFromScore(600, 80, 4, 90, 1.0, 1)).not.toBe("top");
    // Fails on ratings count
    expect(getTierFromScore(600, 50, 4, 90, 1.0, 0)).not.toBe("top");
    // Fails on days active
    expect(getTierFromScore(600, 80, 4, 30, 1.0, 0)).not.toBe("top");
  });

  it("requires all criteria for Trusted", () => {
    expect(getTierFromScore(300, 35, 3, 45, 0.8, 0)).toBe("trusted");
    // Fails on categories
    expect(getTierFromScore(300, 35, 2, 45, 0.8, 0)).not.toBe("trusted");
  });

  it("requires all criteria for Regular (city)", () => {
    expect(getTierFromScore(100, 10, 2, 14, 0, 0)).toBe("city");
    // Fails on ratings
    expect(getTierFromScore(100, 5, 2, 14, 0, 0)).not.toBe("city");
  });

  it("defaults to community when no criteria met", () => {
    expect(getTierFromScore(50, 2, 1, 3, 0, 0)).toBe("community");
  });
});

describe("Vote Weights", () => {
  it("returns correct weights for each tier boundary", () => {
    expect(getVoteWeight(10)).toBe(0.1);
    expect(getVoteWeight(99)).toBe(0.1);
    expect(getVoteWeight(100)).toBe(0.35);
    expect(getVoteWeight(299)).toBe(0.35);
    expect(getVoteWeight(300)).toBe(0.7);
    expect(getVoteWeight(599)).toBe(0.7);
    expect(getVoteWeight(600)).toBe(1.0);
    expect(getVoteWeight(1000)).toBe(1.0);
  });

  it("matches TIER_WEIGHTS constants", () => {
    expect(TIER_WEIGHTS.community).toBe(0.1);
    expect(TIER_WEIGHTS.city).toBe(0.35);
    expect(TIER_WEIGHTS.trusted).toBe(0.7);
    expect(TIER_WEIGHTS.top).toBe(1.0);
  });
});

describe("Temporal Decay", () => {
  it("returns 1.0 for ratings within 30 days", () => {
    expect(getTemporalMultiplier(0)).toBe(1.0);
    expect(getTemporalMultiplier(15)).toBe(1.0);
    expect(getTemporalMultiplier(30)).toBe(1.0);
  });

  it("decays for older ratings", () => {
    expect(getTemporalMultiplier(60)).toBe(0.85);
    expect(getTemporalMultiplier(120)).toBe(0.65);
    expect(getTemporalMultiplier(200)).toBe(0.45);
    expect(getTemporalMultiplier(400)).toBe(0.25);
  });

  it("never goes below 0.25", () => {
    expect(getTemporalMultiplier(1000)).toBe(0.25);
    expect(getTemporalMultiplier(9999)).toBe(0.25);
  });
});

describe("Tier Score Ranges", () => {
  it("has non-overlapping ranges", () => {
    expect(TIER_SCORE_RANGES.community.max).toBeLessThan(TIER_SCORE_RANGES.city.min);
    expect(TIER_SCORE_RANGES.city.max).toBeLessThan(TIER_SCORE_RANGES.trusted.min);
    expect(TIER_SCORE_RANGES.trusted.max).toBeLessThan(TIER_SCORE_RANGES.top.min);
  });

  it("covers full range from 10 to 1000", () => {
    expect(TIER_SCORE_RANGES.community.min).toBe(10);
    expect(TIER_SCORE_RANGES.top.max).toBe(1000);
  });
});

describe("Tier Display Names", () => {
  it("has human-readable names for all tiers", () => {
    expect(TIER_DISPLAY_NAMES.community).toBe("New Member");
    expect(TIER_DISPLAY_NAMES.city).toBe("Regular");
    expect(TIER_DISPLAY_NAMES.trusted).toBe("Trusted");
    expect(TIER_DISPLAY_NAMES.top).toBe("Top Judge");
  });
});
