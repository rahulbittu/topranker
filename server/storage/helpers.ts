import { db } from "../db";

export { db };

export function getVoteWeight(credibilityScore: number): number {
  if (credibilityScore >= 600) return 1.000;
  if (credibilityScore >= 300) return 0.700;
  if (credibilityScore >= 100) return 0.350;
  return 0.100;
}

export function getCredibilityTier(score: number): string {
  if (score >= 600) return "top";
  if (score >= 300) return "trusted";
  if (score >= 100) return "city";
  return "community";
}

export function getTierFromScore(
  score: number,
  totalRatings: number,
  totalCategories: number,
  daysActive: number,
  ratingVariance: number,
  activeFlagCount: number,
): string {
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

export function getTemporalMultiplier(ratingAgeDays: number): number {
  if (ratingAgeDays <= 30) return 1.00;
  if (ratingAgeDays <= 90) return 0.85;
  if (ratingAgeDays <= 180) return 0.65;
  if (ratingAgeDays <= 365) return 0.45;
  return 0.25;
}
