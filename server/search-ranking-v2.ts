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

// Sprint 347: Search relevance signals
// Sprint 436: Enhanced with multi-word, fuzzy, category/cuisine/neighborhood matching
// Sprint 534: Added dishNames and city for query-weighted scoring
export interface SearchContext {
  query?: string;
  hasPhotos?: boolean;
  hasHours?: boolean;
  hasCuisine?: boolean;
  hasDescription?: boolean;
  category?: string;
  cuisine?: string;
  neighborhood?: string;
  ratingCount?: number;
  dishNames?: string[];  // Sprint 534: Top dish names for dish-aware scoring
  city?: string;         // Sprint 534: City name for query intent parsing
  hasActionUrls?: boolean; // Sprint 633: Action URL presence signal
  businessCity?: string;   // Sprint 633: Business's own city for matching
}

/**
 * Sprint 534: Stop words to strip from search queries.
 * These words carry no relevance signal for business/dish matching.
 */
const SEARCH_STOP_WORDS = new Set([
  "best", "top", "good", "great", "most", "popular", "famous",
  "in", "the", "a", "of", "for", "near", "around", "at",
]);

/**
 * Sprint 534: Parse query intent — strip stop words and city name.
 * "Best biryani in Irving" → "biryani"
 * "Top Indian restaurant" → "indian restaurant"
 */
export function parseQueryIntent(query: string, city?: string): string {
  const tokens = query.toLowerCase().trim().split(/\s+/).filter(t => t.length > 0);
  const cityLower = city?.toLowerCase();
  const filtered = tokens.filter(t => {
    if (SEARCH_STOP_WORDS.has(t)) return false;
    if (cityLower && t === cityLower) return false;
    return true;
  });
  return filtered.join(" ");
}

/**
 * Sprint 534: Dish relevance signal (0-1).
 * If the query matches a dish served by the business, boost relevance.
 * Scoring: exact dish name = 1.0, starts-with = 0.8, contains = 0.6, fuzzy = 0.3.
 */
export function dishRelevance(dishNames: string[] | undefined, query?: string): number {
  if (!query || !query.trim() || !dishNames || dishNames.length === 0) return 0;
  const q = query.toLowerCase().trim();
  const queryTokens = q.split(/\s+/).filter(t => t.length > 0);

  let bestScore = 0;
  for (const dish of dishNames) {
    const d = dish.toLowerCase();
    // Full dish name match
    if (d === q) return 1.0;
    if (d.includes(q) || q.includes(d)) { bestScore = Math.max(bestScore, 0.8); continue; }
    // Per-token check
    for (const token of queryTokens) {
      if (token.length < 3) continue;
      const s = wordScore(d, token);
      if (s > bestScore) bestScore = s;
    }
  }
  return bestScore;
}

/**
 * Sprint 436: Levenshtein distance for fuzzy matching.
 * Bounded: returns Infinity if distance would exceed maxDist (performance).
 */
export function levenshtein(a: string, b: string, maxDist = 3): number {
  if (Math.abs(a.length - b.length) > maxDist) return Infinity;
  const m = a.length;
  const n = b.length;
  const dp: number[] = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    let rowMin = dp[0];
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      dp[j] = a[i - 1] === b[j - 1]
        ? prev
        : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = temp;
      if (dp[j] < rowMin) rowMin = dp[j];
    }
    if (rowMin > maxDist) return Infinity;
  }
  return dp[n];
}

/**
 * Sprint 436: Score a single query token against a single target word.
 * Returns 0-1 where 1 = exact, 0.8 = starts-with, 0.6 = contains, 0.3 = fuzzy (1 edit), 0.15 = fuzzy (2 edits).
 */
export function wordScore(target: string, token: string): number {
  if (target === token) return 1.0;
  if (target.startsWith(token)) return 0.8;
  if (target.includes(token)) return 0.6;
  // Fuzzy: only for tokens >= 4 chars (avoid false positives on short words)
  if (token.length >= 4) {
    const dist = levenshtein(target, token, 2);
    if (dist === 1) return 0.3;
    if (dist === 2) return 0.15;
  }
  return 0;
}

/**
 * Sprint 347+436: Text relevance score (0-1) for search query match.
 * Enhanced with multi-word tokenization, per-word best-match, and fuzzy tolerance.
 *
 * Scoring:
 * - Full query exact match = 1.0
 * - Full query starts-with = 0.9
 * - Full query contains = 0.7
 * - Multi-word: average of best per-token scores against name words
 */
export function textRelevance(name: string, query?: string): number {
  if (!query || !query.trim()) return 0;
  const q = query.toLowerCase().trim();
  const n = name.toLowerCase();

  // Full-string checks first (highest priority)
  if (n === q) return 1.0;
  if (n.startsWith(q)) return 0.9;
  if (n.includes(q)) return 0.7;

  // Tokenize both
  const queryTokens = q.split(/\s+/).filter(t => t.length > 0);
  const nameWords = n.split(/\s+/).filter(w => w.length > 0);

  if (queryTokens.length === 0 || nameWords.length === 0) return 0;

  // For each query token, find best match among name words
  let totalScore = 0;
  for (const token of queryTokens) {
    let bestMatch = 0;
    for (const word of nameWords) {
      const score = wordScore(word, token);
      if (score > bestMatch) bestMatch = score;
    }
    totalScore += bestMatch;
  }
  return Math.min(totalScore / queryTokens.length, 1.0);
}

/**
 * Sprint 436: Category/cuisine relevance boost (0-1).
 * Matches query tokens against business category and cuisine fields.
 */
export function categoryRelevance(ctx: SearchContext): number {
  if (!ctx.query) return 0;
  const tokens = ctx.query.toLowerCase().trim().split(/\s+/);
  let best = 0;
  for (const token of tokens) {
    if (token.length < 3) continue;
    // Check cuisine first (more specific)
    if (ctx.cuisine) {
      const c = ctx.cuisine.toLowerCase();
      if (c === token) { best = Math.max(best, 1.0); continue; }
      if (c.startsWith(token) || c.includes(token)) { best = Math.max(best, 0.7); continue; }
      if (token.length >= 4 && levenshtein(c, token, 2) <= 1) { best = Math.max(best, 0.4); continue; }
    }
    // Check category
    if (ctx.category) {
      const cat = ctx.category.toLowerCase();
      if (cat === token) { best = Math.max(best, 0.8); continue; }
      if (cat.startsWith(token) || cat.includes(token)) { best = Math.max(best, 0.5); continue; }
    }
    // Check neighborhood
    if (ctx.neighborhood) {
      const nb = ctx.neighborhood.toLowerCase();
      if (nb === token || nb.includes(token)) { best = Math.max(best, 0.6); continue; }
    }
  }
  return best;
}

/**
 * Sprint 436: Rating volume signal (0-1).
 * More-rated businesses get slight boost in search (social proof).
 * Logarithmic: 1 rating = 0, 10 ratings = 0.5, 50+ ratings = 1.0.
 */
export function ratingVolumeSignal(ratingCount?: number): number {
  if (!ratingCount || ratingCount <= 0) return 0;
  return Math.min(Math.log10(ratingCount) / Math.log10(50), 1.0);
}

/**
 * Sprint 347: Profile completeness score (0-1).
 * Businesses with photos, hours, cuisine, and description rank higher.
 */
export function profileCompleteness(ctx: SearchContext): number {
  let score = 0;
  let total = 0;
  if (ctx.hasPhotos !== undefined) { total++; if (ctx.hasPhotos) score++; }
  if (ctx.hasHours !== undefined) { total++; if (ctx.hasHours) score++; }
  if (ctx.hasCuisine !== undefined) { total++; if (ctx.hasCuisine) score++; }
  if (ctx.hasDescription !== undefined) { total++; if (ctx.hasDescription) score++; }
  // Sprint 633: Action URLs boost profile completeness
  if (ctx.hasActionUrls !== undefined) { total++; if (ctx.hasActionUrls) score++; }
  return total > 0 ? score / total : 0;
}

// Sprint 633: City match bonus (0-0.1)
export function cityMatchBonus(ctx: SearchContext): number {
  if (!ctx.city || !ctx.businessCity) return 0;
  const searchCity = ctx.city.toLowerCase().trim();
  const bizCity = ctx.businessCity.toLowerCase().trim();
  if (searchCity === bizCity) return 0.1;
  // Partial match for metro areas (e.g. "Dallas" matches businesses in "Irving")
  if (bizCity.includes(searchCity) || searchCity.includes(bizCity)) return 0.05;
  return 0;
}

/**
 * Sprint 436+534: Combined search relevance score (0-1).
 * Sprint 534: Added dish signal and query intent parsing.
 * Weights: text 40%, category/cuisine 20%, dish 15%, completeness 10%, volume 15%.
 */
export function combinedRelevance(name: string, ctx: SearchContext): number {
  // Sprint 534: Parse query intent (strip stop words + city)
  const intentQuery = ctx.query ? parseQueryIntent(ctx.query, ctx.city) : ctx.query;
  const intentCtx = { ...ctx, query: intentQuery || ctx.query };
  const text = textRelevance(name, intentCtx.query);
  const category = categoryRelevance(intentCtx);
  const dish = dishRelevance(ctx.dishNames, intentCtx.query);
  const completeness = profileCompleteness(ctx);
  const volume = ratingVolumeSignal(ctx.ratingCount);
  // Sprint 633: City match bonus adds to base relevance
  const cityBonus = cityMatchBonus(ctx);
  return Math.min(1, text * 0.38 + category * 0.18 + dish * 0.14 + completeness * 0.10 + volume * 0.14 + cityBonus * 0.06);
}

export function rankBusinesses(businesses: { businessId: string; name: string; ratings: RatingInput[]; search?: SearchContext }[]): RankedBusiness[] {
  return businesses
    .map(biz => {
      const { rawScore, weightedScore } = calculateWeightedScore(biz.ratings);
      const boostFactors: string[] = [];
      if (biz.ratings.length >= weights.ratingCountFloor) boostFactors.push("high_volume");
      if (biz.ratings.some(r => r.reputationScore >= 80)) boostFactors.push("authority_rated");
      if (biz.ratings.some(r => r.daysAgo <= 7)) boostFactors.push("recent_activity");

      // Sprint 347: Apply search relevance and completeness boosts
      let finalScore = weightedScore;
      if (biz.search) {
        const relevance = textRelevance(biz.name, biz.search.query);
        const completeness = profileCompleteness(biz.search);
        if (relevance > 0) {
          finalScore += relevance * 0.3; // Up to 0.3 point boost for exact match
          boostFactors.push("text_match");
        }
        if (completeness >= 0.75) {
          finalScore += 0.1; // 0.1 point boost for complete profiles
          boostFactors.push("complete_profile");
        }
      }

      return {
        businessId: biz.businessId,
        name: biz.name,
        rawScore,
        weightedScore: Math.round(finalScore * 100) / 100,
        ratingCount: biz.ratings.length,
        confidenceLevel: getConfidenceLevel(biz.ratings.length),
        boostFactors,
      };
    })
    .sort((a, b) => b.weightedScore - a.weightedScore);
}
