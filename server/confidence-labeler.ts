/**
 * Confidence Level Labeler — Sprint 258
 * Labels businesses with confidence information based on rating count.
 * Constitution principle #9: "Low-data honesty is mandatory."
 *
 * Confidence levels:
 *   provisional (0-2 ratings)  — Not yet reliable
 *   early       (3-9 ratings)  — Emerging signal
 *   moderate    (10-24 ratings) — Growing confidence
 *   established (25+ ratings)  — Reliable score
 *
 * Owner: Sarah Nakamura (Lead Eng)
 */

import { log } from "./logger";

const clLog = log.tag("ConfidenceLabeler");

export type ConfidenceLevel = "provisional" | "early" | "moderate" | "established";

export interface ConfidenceLabel {
  level: ConfidenceLevel;
  ratingCount: number;
  label: string;
  description: string;
  isReliable: boolean;
}

const THRESHOLDS: {
  level: ConfidenceLevel;
  min: number;
  max: number;
  label: string;
  description: string;
  isReliable: boolean;
}[] = [
  {
    level: "established",
    min: 25,
    max: Infinity,
    label: "Established — reliable score",
    description: "This business has enough ratings for a reliable, credibility-weighted score.",
    isReliable: true,
  },
  {
    level: "moderate",
    min: 10,
    max: 24,
    label: "Moderate — growing confidence",
    description: "This score is based on a moderate number of ratings and may shift as more arrive.",
    isReliable: false,
  },
  {
    level: "early",
    min: 3,
    max: 9,
    label: "Early — emerging signal",
    description: "Only a few ratings so far. This score is an early signal and may change significantly.",
    isReliable: false,
  },
  {
    level: "provisional",
    min: 0,
    max: 2,
    label: "Provisional — needs more ratings",
    description: "Too few ratings to be reliable. Help by rating this business.",
    isReliable: false,
  },
];

// Cache for stats computation
let statsCache: { total: number; provisional: number; early: number; moderate: number; established: number } | null = null;
let statsCacheEntries: ConfidenceLabel[] = [];

/**
 * Determine the confidence label for a business based on its rating count.
 */
export function getConfidenceLabel(ratingCount: number): ConfidenceLabel {
  const count = Math.max(0, Math.floor(ratingCount));

  for (const threshold of THRESHOLDS) {
    if (count >= threshold.min) {
      const result: ConfidenceLabel = {
        level: threshold.level,
        ratingCount: count,
        label: threshold.label,
        description: threshold.description,
        isReliable: threshold.isReliable,
      };

      // Track in stats cache
      statsCacheEntries.push(result);
      clLog.debug(`Labeled business with ${count} ratings as ${threshold.level}`);
      return result;
    }
  }

  // Fallback (should never reach here given thresholds start at 0)
  return {
    level: "provisional",
    ratingCount: count,
    label: "Provisional — needs more ratings",
    description: "Too few ratings to be reliable. Help by rating this business.",
    isReliable: false,
  };
}

/**
 * Get aggregate confidence stats from all labels computed since last clear.
 */
export function getConfidenceStats(): {
  total: number;
  provisional: number;
  early: number;
  moderate: number;
  established: number;
} {
  if (statsCache) return statsCache;

  const result = { total: 0, provisional: 0, early: 0, moderate: 0, established: 0 };

  for (const entry of statsCacheEntries) {
    result.total++;
    result[entry.level]++;
  }

  statsCache = result;
  clLog.info(`Confidence stats: ${JSON.stringify(result)}`);
  return result;
}

/**
 * Clear the confidence stats cache.
 */
export function clearConfidenceCache(): void {
  statsCache = null;
  statsCacheEntries = [];
  clLog.info("Confidence cache cleared");
}
