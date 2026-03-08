/**
 * Unit Tests — Rating Submission & Anomaly Detection Logic
 * Owner: Sage (Backend Engineer #2)
 *
 * Tests the rating submission pipeline: raw score calculation, weighted scoring,
 * rate gating, score boundaries, and anomaly detection thresholds.
 * These validate the anti-fraud and trust-integrity layer of TopRanker.
 */

import { describe, it, expect } from "vitest";
import { getVoteWeight } from "@/lib/data";

// ── Constants mirroring the detection thresholds in ratings.ts ──

const ANOMALY_THRESHOLDS = {
  burst_velocity: { maxRatingsPerHour: 5 },
  perfect_score_pattern: { minRatings: 10, ratioThreshold: 0.90, scoreFloor: 4.8 },
  one_star_bomber: { minRatings: 5, ratioThreshold: 0.60, scoreCeiling: 1.5 },
  single_business_fixation: { minRatings: 8, maxDistinctBusinesses: 2 },
  new_account_high_volume: { maxAccountAgeDays: 7, minRatings: 15 },
  coordinated_new_account_burst: { maxAccountAgeDays: 30, minRatingsOnBusiness: 10, windowHours: 24 },
};

const RATE_GATE_MIN_DAYS = 3;
const SCORE_MIN = 1;
const SCORE_MAX = 5;

// ── Helpers to replicate pure logic from submitRating ──

function computeRawScore(q1: number, q2: number, q3: number): number {
  return (q1 + q2 + q3) / 3;
}

function computeWeightedScore(rawScore: number, credibilityScore: number): number {
  const weight = getVoteWeight(credibilityScore);
  return rawScore * weight;
}

function isAccountOldEnough(joinedAt: Date, now: Date = new Date()): boolean {
  const daysActive = Math.floor(
    (now.getTime() - joinedAt.getTime()) / (1000 * 60 * 60 * 24),
  );
  return daysActive >= RATE_GATE_MIN_DAYS;
}

function clampScore(score: number): number {
  return Math.max(SCORE_MIN, Math.min(SCORE_MAX, score));
}

// ── Anomaly detection pure-logic simulators ──

function detectBurstVelocity(ratingsInLastHour: number): boolean {
  return ratingsInLastHour > ANOMALY_THRESHOLDS.burst_velocity.maxRatingsPerHour;
}

function detectPerfectScorePattern(totalRatings: number, highScoreCount: number): boolean {
  if (totalRatings < ANOMALY_THRESHOLDS.perfect_score_pattern.minRatings) return false;
  return (highScoreCount / totalRatings) > ANOMALY_THRESHOLDS.perfect_score_pattern.ratioThreshold;
}

function detectOneStarBomber(
  rawScore: number,
  totalRatings: number,
  lowScoreCount: number,
): boolean {
  if (rawScore > ANOMALY_THRESHOLDS.one_star_bomber.scoreCeiling) return false;
  if (totalRatings < ANOMALY_THRESHOLDS.one_star_bomber.minRatings) return false;
  return (lowScoreCount / totalRatings) > ANOMALY_THRESHOLDS.one_star_bomber.ratioThreshold;
}

function detectSingleBusinessFixation(
  totalRatings: number,
  distinctBusinesses: number,
): boolean {
  return totalRatings >= ANOMALY_THRESHOLDS.single_business_fixation.minRatings
    && distinctBusinesses <= ANOMALY_THRESHOLDS.single_business_fixation.maxDistinctBusinesses;
}

function detectNewAccountHighVolume(accountAgeDays: number, totalRatings: number): boolean {
  return accountAgeDays < ANOMALY_THRESHOLDS.new_account_high_volume.maxAccountAgeDays
    && totalRatings > ANOMALY_THRESHOLDS.new_account_high_volume.minRatings;
}

function detectCoordinatedBurst(
  ratingsOnBusinessIn24h: number,
  accountAgeDays: number,
): boolean {
  return accountAgeDays < ANOMALY_THRESHOLDS.coordinated_new_account_burst.maxAccountAgeDays
    && ratingsOnBusinessIn24h > ANOMALY_THRESHOLDS.coordinated_new_account_burst.minRatingsOnBusiness;
}

// ── Tests ──

describe("Raw Score Calculation", () => {
  it("averages three equal scores", () => {
    expect(computeRawScore(4, 4, 4)).toBe(4);
  });

  it("averages three different scores", () => {
    expect(computeRawScore(3, 4, 5)).toBe(4);
  });

  it("handles minimum scores", () => {
    expect(computeRawScore(1, 1, 1)).toBe(1);
  });

  it("handles maximum scores", () => {
    expect(computeRawScore(5, 5, 5)).toBe(5);
  });

  it("produces correct fractional average", () => {
    const raw = computeRawScore(3, 4, 2);
    expect(raw).toBe(3);
    const raw2 = computeRawScore(5, 4, 3);
    expect(raw2).toBe(4);
    const raw3 = computeRawScore(1, 2, 3);
    expect(raw3).toBe(2);
  });
});

describe("Weighted Score Calculation", () => {
  it("community (0.10): 5.0 raw -> 0.5 weighted", () => {
    expect(computeWeightedScore(5.0, 10)).toBeCloseTo(0.5, 2);
  });

  it("city (0.35): 5.0 raw -> 1.75 weighted", () => {
    expect(computeWeightedScore(5.0, 100)).toBeCloseTo(1.75, 2);
  });

  it("trusted (0.70): 5.0 raw -> 3.5 weighted", () => {
    expect(computeWeightedScore(5.0, 300)).toBeCloseTo(3.5, 2);
  });

  it("top judge (1.00): 5.0 raw -> 5.0 weighted", () => {
    expect(computeWeightedScore(5.0, 600)).toBeCloseTo(5.0, 2);
  });

  it("community 1.0 raw -> 0.1 weighted", () => {
    expect(computeWeightedScore(1.0, 50)).toBeCloseTo(0.1, 2);
  });

  it("top judge 1.0 raw -> 1.0 weighted", () => {
    expect(computeWeightedScore(1.0, 900)).toBeCloseTo(1.0, 2);
  });
});

describe("Vote Weight Boundaries (from helpers.ts)", () => {
  it("returns 0.100 for community tier (score < 100)", () => {
    expect(getVoteWeight(0)).toBe(0.1);
    expect(getVoteWeight(50)).toBe(0.1);
    expect(getVoteWeight(99)).toBe(0.1);
  });

  it("returns 0.350 for city tier (100-299)", () => {
    expect(getVoteWeight(100)).toBe(0.35);
    expect(getVoteWeight(200)).toBe(0.35);
    expect(getVoteWeight(299)).toBe(0.35);
  });

  it("returns 0.700 for trusted tier (300-599)", () => {
    expect(getVoteWeight(300)).toBe(0.7);
    expect(getVoteWeight(450)).toBe(0.7);
    expect(getVoteWeight(599)).toBe(0.7);
  });

  it("returns 1.000 for top judge tier (600+)", () => {
    expect(getVoteWeight(600)).toBe(1.0);
    expect(getVoteWeight(800)).toBe(1.0);
    expect(getVoteWeight(1000)).toBe(1.0);
  });
});

describe("Rate Gating — Account Age", () => {
  it("rejects accounts less than 3 days old", () => {
    const now = new Date("2026-03-08T12:00:00Z");
    const joined = new Date("2026-03-07T12:00:00Z"); // 1 day ago
    expect(isAccountOldEnough(joined, now)).toBe(false);
  });

  it("rejects accounts exactly 2 days old", () => {
    const now = new Date("2026-03-08T12:00:00Z");
    const joined = new Date("2026-03-06T12:00:00Z"); // 2 days ago
    expect(isAccountOldEnough(joined, now)).toBe(false);
  });

  it("accepts accounts exactly 3 days old", () => {
    const now = new Date("2026-03-08T12:00:00Z");
    const joined = new Date("2026-03-05T12:00:00Z"); // 3 days ago
    expect(isAccountOldEnough(joined, now)).toBe(true);
  });

  it("accepts accounts well past the threshold", () => {
    const now = new Date("2026-03-08T12:00:00Z");
    const joined = new Date("2025-01-01T00:00:00Z"); // over a year
    expect(isAccountOldEnough(joined, now)).toBe(true);
  });
});

describe("Score Boundaries", () => {
  it("clamps below-minimum scores to 1", () => {
    expect(clampScore(0)).toBe(1);
    expect(clampScore(-5)).toBe(1);
    expect(clampScore(0.5)).toBe(1);
  });

  it("clamps above-maximum scores to 5", () => {
    expect(clampScore(6)).toBe(5);
    expect(clampScore(100)).toBe(5);
    expect(clampScore(5.1)).toBe(5);
  });

  it("keeps valid scores unchanged", () => {
    expect(clampScore(1)).toBe(1);
    expect(clampScore(3)).toBe(3);
    expect(clampScore(5)).toBe(5);
    expect(clampScore(2.5)).toBe(2.5);
  });
});

describe("Anomaly Detection — burst_velocity", () => {
  it("does not flag at exactly 5 ratings in 1 hour", () => {
    expect(detectBurstVelocity(5)).toBe(false);
  });

  it("flags at 6 ratings in 1 hour", () => {
    expect(detectBurstVelocity(6)).toBe(true);
  });
});

describe("Anomaly Detection — perfect_score_pattern", () => {
  it("does not flag users with fewer than 10 total ratings", () => {
    expect(detectPerfectScorePattern(9, 9)).toBe(false);
  });

  it("does not flag when high-score ratio is exactly 90%", () => {
    // 9/10 = 0.90, not > 0.90
    expect(detectPerfectScorePattern(10, 9)).toBe(false);
  });

  it("flags when high-score ratio exceeds 90%", () => {
    // 10/10 = 1.0
    expect(detectPerfectScorePattern(10, 10)).toBe(true);
    // 19/20 = 0.95
    expect(detectPerfectScorePattern(20, 19)).toBe(true);
  });
});

describe("Anomaly Detection — one_star_bomber", () => {
  it("does not flag if current score is above 1.5", () => {
    expect(detectOneStarBomber(2.0, 10, 8)).toBe(false);
  });

  it("does not flag if total ratings < 5", () => {
    expect(detectOneStarBomber(1.0, 4, 4)).toBe(false);
  });

  it("flags when 60%+ of ratings are 1.5 or below", () => {
    // 4/5 = 0.80 > 0.60
    expect(detectOneStarBomber(1.0, 5, 4)).toBe(true);
  });

  it("does not flag at exactly 60%", () => {
    // 3/5 = 0.60, not > 0.60
    expect(detectOneStarBomber(1.0, 5, 3)).toBe(false);
  });
});

describe("Anomaly Detection — single_business_fixation", () => {
  it("does not flag at 7 ratings", () => {
    expect(detectSingleBusinessFixation(7, 1)).toBe(false);
  });

  it("flags at 8 ratings with 2 or fewer distinct businesses", () => {
    expect(detectSingleBusinessFixation(8, 2)).toBe(true);
    expect(detectSingleBusinessFixation(8, 1)).toBe(true);
  });

  it("does not flag at 8 ratings with 3 distinct businesses", () => {
    expect(detectSingleBusinessFixation(8, 3)).toBe(false);
  });
});

describe("Anomaly Detection — new_account_high_volume", () => {
  it("does not flag at exactly 7 days old", () => {
    expect(detectNewAccountHighVolume(7, 20)).toBe(false);
  });

  it("does not flag at exactly 15 ratings", () => {
    expect(detectNewAccountHighVolume(3, 15)).toBe(false);
  });

  it("flags at 6 days old with 16 ratings", () => {
    expect(detectNewAccountHighVolume(6, 16)).toBe(true);
  });
});

describe("Anomaly Detection — coordinated_new_account_burst", () => {
  it("does not flag at exactly 10 ratings on a business", () => {
    expect(detectCoordinatedBurst(10, 15)).toBe(false);
  });

  it("does not flag accounts 30+ days old", () => {
    expect(detectCoordinatedBurst(15, 30)).toBe(false);
  });

  it("flags 11 ratings from a 20-day-old account cluster", () => {
    expect(detectCoordinatedBurst(11, 20)).toBe(true);
  });
});
