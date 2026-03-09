/**
 * Sprint 244: Search Ranking v2 — Reputation-Weighted
 *
 * Core algorithm for credibility-weighted business rankings.
 * Not all votes are equal: member reputation scores influence vote weight,
 * recent ratings get a recency boost, and Bayesian smoothing prevents
 * low-sample-size businesses from gaming the leaderboard.
 *
 * Owner: Sarah Nakamura (Lead Eng)
 */

import { log } from "./logger";

const rankLog = log.tag("SearchRankingV2");

interface RankedBusiness {
  businessId: string;
  name: string;
  rawScore: number;       // Simple average of all ratings
  weightedScore: number;  // Reputation-weighted score
  ratingCount: number;
  confidenceLevel: "low" | "medium" | "high";
  boostFactors: string[];
}

interface RankingWeights {
  reputationWeight: number;     // How much reputation affects vote weight (0-1)
  recencyBoost: number;         // Boost for recent ratings (0-1)
  ratingCountFloor: number;     // Minimum ratings for "high" confidence
  bayesianPrior: number;        // Bayesian average prior (usually ~3.5)
  bayesianStrength: number;     // Number of virtual prior ratings
}

let weights: RankingWeights = {
  reputationWeight: 0.6,
  recencyBoost: 0.15,
  ratingCountFloor: 10,
  bayesianPrior: 3.5,
  bayesianStrength: 5,
};

export function getRankingWeights(): RankingWeights {
  return { ...weights };
}

export function setRankingWeights(w: Partial<RankingWeights>): RankingWeights {
  weights = { ...weights, ...w };
  rankLog.info("Ranking weights updated", weights);
  return { ...weights };
}

export interface RatingInput {
  memberId: string;
  score: number;          // 1-5
  reputationScore: number; // 0-100 from reputation-v2
  daysAgo: number;
}

export function calculateWeightedScore(ratings: RatingInput[]): { rawScore: number; weightedScore: number } {
  if (ratings.length === 0) return { rawScore: 0, weightedScore: 0 };

  // Raw score: simple average
  const rawScore = ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length;

  // Weighted score: each rating weighted by reputation + recency
  let totalWeight = 0;
  let weightedSum = 0;
  for (const r of ratings) {
    const repFactor = 0.5 + (r.reputationScore / 100) * weights.reputationWeight;
    const recencyFactor = 1 + (Math.max(0, 30 - r.daysAgo) / 30) * weights.recencyBoost;
    const w = repFactor * recencyFactor;
    weightedSum += r.score * w;
    totalWeight += w;
  }
  const weightedAvg = totalWeight > 0 ? weightedSum / totalWeight : 0;

  // Bayesian smoothing
  const bayesian = (weightedAvg * ratings.length + weights.bayesianPrior * weights.bayesianStrength) / (ratings.length + weights.bayesianStrength);

  return {
    rawScore: Math.round(rawScore * 100) / 100,
    weightedScore: Math.round(bayesian * 100) / 100,
  };
}

export function getConfidenceLevel(ratingCount: number): "low" | "medium" | "high" {
  if (ratingCount >= weights.ratingCountFloor) return "high";
  if (ratingCount >= weights.ratingCountFloor / 2) return "medium";
  return "low";
}

export function rankBusinesses(businesses: { businessId: string; name: string; ratings: RatingInput[] }[]): RankedBusiness[] {
  return businesses
    .map(biz => {
      const { rawScore, weightedScore } = calculateWeightedScore(biz.ratings);
      const boostFactors: string[] = [];
      if (biz.ratings.length >= weights.ratingCountFloor) boostFactors.push("high_volume");
      if (biz.ratings.some(r => r.reputationScore >= 80)) boostFactors.push("authority_rated");
      if (biz.ratings.some(r => r.daysAgo <= 7)) boostFactors.push("recent_activity");

      return {
        businessId: biz.businessId,
        name: biz.name,
        rawScore,
        weightedScore,
        ratingCount: biz.ratings.length,
        confidenceLevel: getConfidenceLevel(biz.ratings.length),
        boostFactors,
      };
    })
    .sort((a, b) => b.weightedScore - a.weightedScore);
}
