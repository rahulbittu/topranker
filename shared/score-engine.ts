/**
 * Score Calculation Engine — Rating Integrity Phase 1b (Part 6)
 *
 * Every number on the leaderboard is computed by this engine.
 * Shared module used by both server and client.
 *
 * 8-step calculation:
 *   1. Individual composite score (visit-type weighted dimensions)
 *   2-4. Effective weight (credibility × verification boost × gaming multiplier)
 *   5. Temporal decay (exponential)
 *   6. Restaurant score (weighted average across all ratings)
 *   7. Minimum rating threshold for leaderboard eligibility
 *   8. Tiebreaker (score → weighted raters)
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type VisitType = "dine_in" | "delivery" | "takeaway";

export interface DimensionScores {
  foodScore: number;          // 1-10, all visit types
  serviceScore?: number;      // 1-10, dine_in only
  vibeScore?: number;         // 1-10, dine_in only
  packagingScore?: number;    // 1-10, delivery only
  waitTimeScore?: number;     // 1-10, takeaway only
  valueScore?: number;        // 1-10, delivery + takeaway
}

export interface RatingInput {
  visitType: VisitType;
  dimensions: DimensionScores;
  credibilityWeight: number;    // 0.10, 0.35, 0.70, or 1.00
  verificationBoost: number;    // 0.00 to 0.50
  gamingMultiplier: number;     // 0.05 to 1.00
  daysSinceRating: number;      // for temporal decay
}

// ---------------------------------------------------------------------------
// Composite weights from Rating Integrity Part 3
// ---------------------------------------------------------------------------

export const DINE_IN_WEIGHTS = { food: 0.50, service: 0.25, vibe: 0.25 } as const;
export const DELIVERY_WEIGHTS = { food: 0.60, packaging: 0.25, value: 0.15 } as const;
export const TAKEAWAY_WEIGHTS = { food: 0.65, waitTime: 0.20, value: 0.15 } as const;

// ---------------------------------------------------------------------------
// Step 5 constant
// ---------------------------------------------------------------------------

export const DECAY_LAMBDA = 0.003;

// ---------------------------------------------------------------------------
// Step 1: Individual composite score
// ---------------------------------------------------------------------------

export function computeComposite(visitType: VisitType, dimensions: DimensionScores): number {
  const food = dimensions.foodScore ?? 0;

  switch (visitType) {
    case "dine_in": {
      const service = dimensions.serviceScore ?? 0;
      const vibe = dimensions.vibeScore ?? 0;
      return food * DINE_IN_WEIGHTS.food
        + service * DINE_IN_WEIGHTS.service
        + vibe * DINE_IN_WEIGHTS.vibe;
    }
    case "delivery": {
      const packaging = dimensions.packagingScore ?? 0;
      const value = dimensions.valueScore ?? 0;
      return food * DELIVERY_WEIGHTS.food
        + packaging * DELIVERY_WEIGHTS.packaging
        + value * DELIVERY_WEIGHTS.value;
    }
    case "takeaway": {
      const waitTime = dimensions.waitTimeScore ?? 0;
      const value = dimensions.valueScore ?? 0;
      return food * TAKEAWAY_WEIGHTS.food
        + waitTime * TAKEAWAY_WEIGHTS.waitTime
        + value * TAKEAWAY_WEIGHTS.value;
    }
    default:
      return food;
  }
}

// ---------------------------------------------------------------------------
// Steps 2-4: Effective weight
// ---------------------------------------------------------------------------

export function computeEffectiveWeight(
  credibilityWeight: number,
  verificationBoost: number,
  gamingMultiplier: number,
): number {
  const cappedBoost = Math.min(verificationBoost, 0.50);
  return credibilityWeight * (1 + cappedBoost) * gamingMultiplier;
}

// ---------------------------------------------------------------------------
// Step 5: Temporal decay
// ---------------------------------------------------------------------------

export function computeDecayFactor(daysSinceRating: number): number {
  return Math.exp(-DECAY_LAMBDA * daysSinceRating);
}

// ---------------------------------------------------------------------------
// Step 6: Restaurant score from all ratings
// ---------------------------------------------------------------------------

export interface RestaurantScoreResult {
  overallScore: number;
  dineInScore: number | null;
  deliveryScore: number | null;
  takeawayScore: number | null;
  foodScoreOnly: number;
  totalRaters: number;
  credibilityWeightedRaters: number;
}

function weightedAverage(
  ratings: RatingInput[],
  scoreFn: (r: RatingInput) => number,
): number {
  let numerator = 0;
  let denominator = 0;
  for (const r of ratings) {
    const w = computeEffectiveWeight(r.credibilityWeight, r.verificationBoost, r.gamingMultiplier);
    const decay = computeDecayFactor(r.daysSinceRating);
    const wd = w * decay;
    numerator += scoreFn(r) * wd;
    denominator += wd;
  }
  return denominator === 0 ? 0 : numerator / denominator;
}

export function computeRestaurantScore(ratings: RatingInput[]): RestaurantScoreResult {
  if (ratings.length === 0) {
    return {
      overallScore: 0,
      dineInScore: null,
      deliveryScore: null,
      takeawayScore: null,
      foodScoreOnly: 0,
      totalRaters: 0,
      credibilityWeightedRaters: 0,
    };
  }

  const dineIn = ratings.filter(r => r.visitType === "dine_in");
  const delivery = ratings.filter(r => r.visitType === "delivery");
  const takeaway = ratings.filter(r => r.visitType === "takeaway");

  // Overall score: composite of each rating weighted
  const overallScore = weightedAverage(ratings, r => computeComposite(r.visitType, r.dimensions));

  // Per-visit-type scores
  const dineInScore = dineIn.length > 0
    ? weightedAverage(dineIn, r => computeComposite(r.visitType, r.dimensions))
    : null;
  const deliveryScore = delivery.length > 0
    ? weightedAverage(delivery, r => computeComposite(r.visitType, r.dimensions))
    : null;
  const takeawayScore = takeaway.length > 0
    ? weightedAverage(takeaway, r => computeComposite(r.visitType, r.dimensions))
    : null;

  // Food score only: weighted average of just the food dimension
  const foodScoreOnly = weightedAverage(ratings, r => r.dimensions.foodScore ?? 0);

  // Credibility-weighted raters: sum of effective weights
  let credibilityWeightedRaters = 0;
  for (const r of ratings) {
    credibilityWeightedRaters += computeEffectiveWeight(
      r.credibilityWeight, r.verificationBoost, r.gamingMultiplier,
    );
  }

  return {
    overallScore,
    dineInScore,
    deliveryScore,
    takeawayScore,
    foodScoreOnly,
    totalRaters: ratings.length,
    credibilityWeightedRaters,
  };
}

// ---------------------------------------------------------------------------
// Step 7: Minimum rating threshold check
// ---------------------------------------------------------------------------

export function meetsLeaderboardThreshold(ratings: RatingInput[]): {
  eligible: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];

  // Requirement 1: 3+ unique raters
  if (ratings.length < 3) {
    reasons.push(`Need at least 3 raters, have ${ratings.length}`);
  }

  // Requirement 2: at least 1 dine-in rating
  const hasDineIn = ratings.some(r => r.visitType === "dine_in");
  if (!hasDineIn) {
    reasons.push("Need at least 1 dine_in rating");
  }

  // Requirement 3: credibility-weighted sum >= 0.5
  let weightedSum = 0;
  for (const r of ratings) {
    weightedSum += computeEffectiveWeight(
      r.credibilityWeight, r.verificationBoost, r.gamingMultiplier,
    );
  }
  if (weightedSum < 0.5) {
    reasons.push(`Credibility-weighted sum ${weightedSum.toFixed(2)} < 0.50 minimum`);
  }

  return { eligible: reasons.length === 0, reasons };
}

// ---------------------------------------------------------------------------
// Step 8: Tiebreaker
// ---------------------------------------------------------------------------

export function tiebreaker(
  a: { score: number; weightedRaters: number },
  b: { score: number; weightedRaters: number },
): number {
  const scoreDiff = Math.abs(a.score - b.score);
  if (scoreDiff > 0.05) {
    return b.score - a.score; // higher score wins (negative = a ranks first)
  }
  // Within 0.05: rank by weighted raters
  return b.weightedRaters - a.weightedRaters;
}
