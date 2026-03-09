/**
 * Sprint 239: Member Reputation Scoring v2
 * Multi-signal reputation engine with credibility-weighted tiers.
 * Owner: Sarah Nakamura (Lead Eng)
 *
 * IMPORTANT: This is the INTERNAL reputation scoring system (5 tiers: newcomer→authority).
 * It is SEPARATE from the PRODUCTION credibility tier system (4 tiers: community→top)
 * defined in shared/credibility.ts which controls vote weights in live rankings.
 *
 * ReputationTier feeds into the credibility system as one of many signals,
 * but does NOT directly determine a member's public-facing CredibilityTier.
 */

import { log } from "./logger";

const repLog = log.tag("ReputationV2");

/**
 * The 5-tier internal reputation scale. NOT the same as CredibilityTier
 * (community | city | trusted | top) in shared/credibility.ts.
 */
export type ReputationTier = "newcomer" | "contributor" | "trusted" | "expert" | "authority";

interface ReputationSignal {
  name: string;
  weight: number;
  description: string;
}

export const REPUTATION_SIGNALS: ReputationSignal[] = [
  { name: "rating_count", weight: 0.25, description: "Number of ratings submitted" },
  { name: "rating_consistency", weight: 0.20, description: "How consistent ratings are with consensus" },
  { name: "account_age_days", weight: 0.15, description: "Days since account creation" },
  { name: "email_verified", weight: 0.15, description: "Email verification status" },
  { name: "profile_complete", weight: 0.10, description: "Profile completeness score" },
  { name: "helpful_votes", weight: 0.10, description: "Votes received on reviews" },
  { name: "report_penalty", weight: 0.05, description: "Penalty for reported/flagged content" },
];

interface MemberReputation {
  memberId: string;
  score: number;         // 0-100
  tier: ReputationTier;
  signals: Record<string, number>;
  calculatedAt: string;
}

const reputationCache = new Map<string, MemberReputation>();
export const MAX_CACHE = 5000;

/**
 * Normalize a raw signal value to the 0-1 range based on signal-specific thresholds.
 */
function normalizeSignal(name: string, value: number): number {
  switch (name) {
    case "rating_count":
      return Math.min(1, Math.max(0, value / 50));
    case "rating_consistency":
      return Math.min(1, Math.max(0, value));
    case "account_age_days":
      return Math.min(1, Math.max(0, value / 365));
    case "email_verified":
      return value ? 1 : 0;
    case "profile_complete":
      return Math.min(1, Math.max(0, value));
    case "helpful_votes":
      return Math.min(1, Math.max(0, value / 100));
    case "report_penalty":
      // Negative signal: 0 at 0 reports, -1.0 at 5+ reports
      return -Math.min(1, Math.max(0, value / 5));
    default:
      return 0;
  }
}

/**
 * Determine tier from numeric score.
 */
function tierFromScore(score: number): MemberReputation["tier"] {
  if (score >= 80) return "authority";
  if (score >= 60) return "expert";
  if (score >= 40) return "trusted";
  if (score >= 20) return "contributor";
  return "newcomer";
}

export function calculateReputation(memberId: string, signals: Record<string, number>): MemberReputation {
  let weightedSum = 0;

  for (const signal of REPUTATION_SIGNALS) {
    const rawValue = signals[signal.name] ?? 0;
    const normalized = normalizeSignal(signal.name, rawValue);
    weightedSum += normalized * signal.weight;
  }

  // Scale to 0-100 and clamp
  const score = Math.min(100, Math.max(0, Math.round(weightedSum * 100)));
  const tier = tierFromScore(score);

  const reputation: MemberReputation = {
    memberId,
    score,
    tier,
    signals: { ...signals },
    calculatedAt: new Date().toISOString(),
  };

  // FIFO eviction if cache is full
  if (reputationCache.size >= MAX_CACHE && !reputationCache.has(memberId)) {
    const firstKey = reputationCache.keys().next().value;
    if (firstKey !== undefined) {
      reputationCache.delete(firstKey);
    }
  }

  reputationCache.set(memberId, reputation);
  repLog.info(`Calculated reputation for ${memberId}: score=${score}, tier=${tier}`);

  return reputation;
}

export function getReputation(memberId: string): MemberReputation | null {
  return reputationCache.get(memberId) || null;
}

export function getTierThresholds(): Record<string, { min: number; max: number }> {
  return {
    newcomer: { min: 0, max: 19 },
    contributor: { min: 20, max: 39 },
    trusted: { min: 40, max: 59 },
    expert: { min: 60, max: 79 },
    authority: { min: 80, max: 100 },
  };
}

export function getReputationLeaderboard(limit?: number): MemberReputation[] {
  return Array.from(reputationCache.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit || 10);
}

export function getReputationStats(): {
  totalScored: number;
  averageScore: number;
  byTier: Record<string, number>;
} {
  const all = Array.from(reputationCache.values());
  const avg = all.length > 0 ? all.reduce((sum, r) => sum + r.score, 0) / all.length : 0;
  const byTier: Record<string, number> = { newcomer: 0, contributor: 0, trusted: 0, expert: 0, authority: 0 };
  for (const r of all) byTier[r.tier]++;
  return { totalScored: all.length, averageScore: Math.round(avg * 100) / 100, byTier };
}

export function clearReputationCache(): void {
  reputationCache.clear();
  repLog.info("Reputation cache cleared");
}
