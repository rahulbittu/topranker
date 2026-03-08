/**
 * Shared credibility scoring functions.
 * Single source of truth for both client (lib/data.ts) and server (storage/helpers.ts).
 *
 * Sprint 138 — resolves client/server logic duplication flagged in Audit #11.
 */

export type CredibilityTier = "community" | "city" | "trusted" | "top";

/** Map credibility score to vote weight multiplier. */
export function getVoteWeight(credibilityScore: number): number {
  if (credibilityScore >= 600) return 1.000;
  if (credibilityScore >= 300) return 0.700;
  if (credibilityScore >= 100) return 0.350;
  return 0.100;
}

/** Simple score-to-tier mapping (no activity gates). */
export function getCredibilityTier(score: number): CredibilityTier {
  if (score >= 600) return "top";
  if (score >= 300) return "trusted";
  if (score >= 100) return "city";
  return "community";
}

/**
 * Full tier promotion with activity gates.
 * Requires BOTH score threshold AND activity thresholds.
 */
export function getTierFromScore(
  score: number,
  totalRatings: number,
  totalCategories: number,
  daysActive: number,
  ratingVariance: number,
  activeFlagCount: number,
): CredibilityTier {
  if (
    score >= 600 &&
    totalRatings >= 80 &&
    totalCategories >= 4 &&
    daysActive >= 90 &&
    ratingVariance >= 1.0 &&
    activeFlagCount === 0
  ) return "top";

  if (
    score >= 300 &&
    totalRatings >= 35 &&
    totalCategories >= 3 &&
    daysActive >= 45 &&
    ratingVariance >= 0.8
  ) return "trusted";

  if (
    score >= 100 &&
    totalRatings >= 10 &&
    totalCategories >= 2 &&
    daysActive >= 14
  ) return "city";

  return "community";
}

/** Temporal decay multiplier for rating age. */
export function getTemporalMultiplier(ratingAgeDays: number): number {
  if (ratingAgeDays <= 30) return 1.00;
  if (ratingAgeDays <= 90) return 0.85;
  if (ratingAgeDays <= 180) return 0.65;
  if (ratingAgeDays <= 365) return 0.45;
  return 0.25;
}
