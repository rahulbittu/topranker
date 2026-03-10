/**
 * TopRanker Achievement Badges System
 * Owner: Jordan (Chief Value Officer)
 *
 * Apple Fitness-style achievement badges for USERS and BUSINESSES.
 * Badges are visual rewards earned through activity, milestones, and streaks.
 * The psychology: visible progress → dopamine → continued engagement.
 *
 * Badge definitions (USER_BADGES, BUSINESS_BADGES, ALL_BADGES) extracted
 * to badge-definitions.ts in Sprint 296 to keep this file under 700 LOC.
 */

import type { CredibilityTier } from "@/lib/data";
import { USER_BADGES, BUSINESS_BADGES, ALL_BADGES } from "./badge-definitions";

// Re-export badge arrays for consumers that import from badges.ts
export { USER_BADGES, BUSINESS_BADGES, ALL_BADGES };

// ─── Badge Types ────────────────────────────────────────────────
export type BadgeRarity = "common" | "rare" | "epic" | "legendary";
export type BadgeCategory = "milestone" | "streak" | "explorer" | "social" | "seasonal" | "special";
export type BadgeTarget = "user" | "business" | "both";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;       // Ionicons name
  category: BadgeCategory;
  rarity: BadgeRarity;
  target: BadgeTarget;
  // Visual
  color: string;       // Primary badge color
  gradient: [string, string]; // Ring gradient
}

export interface EarnedBadge {
  badge: Badge;
  earnedAt: number;    // timestamp
  progress: number;    // 0-100
}

// ─── Rarity System (like Apple Fitness ring colors) ─────────────
export const RARITY_COLORS: Record<BadgeRarity, { bg: string; border: string; text: string; glow: string }> = {
  common:    { bg: "#E8E8ED", border: "#C7C7CC", text: "#636366", glow: "rgba(142,142,147,0.2)" },
  rare:      { bg: "#E3F2FD", border: "#2196F3", text: "#1565C0", glow: "rgba(33,150,243,0.25)" },
  epic:      { bg: "#F3E5F5", border: "#9C27B0", text: "#7B1FA2", glow: "rgba(156,39,176,0.3)" },
  legendary: { bg: "#FFF8E1", border: "#C49A1A", text: "#9A7510", glow: "rgba(196,154,26,0.35)" },
};

export const RARITY_LABELS: Record<BadgeRarity, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

// ─── Badge Evaluation Functions ─────────────────────────────────

export interface UserBadgeContext {
  totalRatings: number;
  distinctBusinesses: number;
  totalCategories: number;
  daysActive: number;
  currentStreak: number;
  credibilityTier: CredibilityTier;
  credibilityScore: number;
  isFoundingMember: boolean;
  referralCount: number;
  citiesRated: number;
  hasRatedAfterMidnight: boolean;
  hasRatedBefore7AM: boolean;
  hasGivenPerfect5: boolean;
  hasGivenScore1: boolean;
  businessesMovedUp: number;
  businessesMovedToFirst: number;
  // Seasonal badge context
  springRatings: number;
  summerRatings: number;
  fallRatings: number;
  winterRatings: number;
}

export function evaluateUserBadges(ctx: UserBadgeContext): EarnedBadge[] {
  const earned: EarnedBadge[] = [];
  const now = Date.now();

  const check = (id: string, condition: boolean, progress: number) => {
    const badge = USER_BADGES.find(b => b.id === id);
    if (badge) {
      earned.push({ badge, earnedAt: condition ? now : 0, progress: Math.min(progress, 100) });
    }
  };

  // Milestone — rating count
  check("first-taste",      ctx.totalRatings >= 1,   Math.min(ctx.totalRatings / 1 * 100, 100));
  check("getting-started",  ctx.totalRatings >= 5,   Math.min(ctx.totalRatings / 5 * 100, 100));
  check("ten-strong",       ctx.totalRatings >= 10,  Math.min(ctx.totalRatings / 10 * 100, 100));
  check("quarter-century",  ctx.totalRatings >= 25,  Math.min(ctx.totalRatings / 25 * 100, 100));
  check("half-century",     ctx.totalRatings >= 50,  Math.min(ctx.totalRatings / 50 * 100, 100));
  check("centurion",        ctx.totalRatings >= 100, Math.min(ctx.totalRatings / 100 * 100, 100));
  check("rating-machine",   ctx.totalRatings >= 250, Math.min(ctx.totalRatings / 250 * 100, 100));
  check("legendary-judge",  ctx.totalRatings >= 500, Math.min(ctx.totalRatings / 500 * 100, 100));

  // Streaks
  check("three-day-streak", ctx.currentStreak >= 3,  Math.min(ctx.currentStreak / 3 * 100, 100));
  check("week-warrior",     ctx.currentStreak >= 7,  Math.min(ctx.currentStreak / 7 * 100, 100));
  check("two-week-streak",  ctx.currentStreak >= 14, Math.min(ctx.currentStreak / 14 * 100, 100));
  check("monthly-devotion", ctx.currentStreak >= 30, Math.min(ctx.currentStreak / 30 * 100, 100));

  // Explorer
  check("curious-palate",   ctx.totalCategories >= 3,  Math.min(ctx.totalCategories / 3 * 100, 100));
  check("category-hopper",  ctx.totalCategories >= 5,  Math.min(ctx.totalCategories / 5 * 100, 100));
  check("master-explorer",  ctx.totalCategories >= 10, Math.min(ctx.totalCategories / 10 * 100, 100));
  check("city-hopper",      ctx.citiesRated >= 2,      Math.min(ctx.citiesRated / 2 * 100, 100));
  check("texas-tour",       ctx.citiesRated >= 4,      Math.min(ctx.citiesRated / 4 * 100, 100));
  check("night-owl",        ctx.hasRatedAfterMidnight, ctx.hasRatedAfterMidnight ? 100 : 0);
  check("early-bird",       ctx.hasRatedBefore7AM,     ctx.hasRatedBefore7AM ? 100 : 0);

  // Social
  check("first-referral",   ctx.referralCount >= 1,  Math.min(ctx.referralCount / 1 * 100, 100));
  check("squad-builder",    ctx.referralCount >= 5,  Math.min(ctx.referralCount / 5 * 100, 100));
  check("community-leader", ctx.referralCount >= 25, Math.min(ctx.referralCount / 25 * 100, 100));
  // Tier badges
  check("tier-city",    ctx.credibilityScore >= 100, Math.min(ctx.credibilityScore / 100 * 100, 100));
  check("tier-trusted", ctx.credibilityScore >= 300, Math.min(ctx.credibilityScore / 300 * 100, 100));
  check("tier-top",     ctx.credibilityScore >= 600, Math.min(ctx.credibilityScore / 600 * 100, 100));

  // Special
  check("founding-member",  ctx.isFoundingMember,            ctx.isFoundingMember ? 100 : 0);
  check("perfect-score",    ctx.hasGivenPerfect5,            ctx.hasGivenPerfect5 ? 100 : 0);
  check("tough-critic",     ctx.hasGivenScore1,              ctx.hasGivenScore1 ? 100 : 0);
  check("impact-maker",     ctx.businessesMovedUp >= 1,      Math.min(ctx.businessesMovedUp / 1 * 100, 100));
  check("king-maker",       ctx.businessesMovedToFirst >= 1, ctx.businessesMovedToFirst >= 1 ? 100 : 0);

  // Seasonal
  check("spring-explorer",  ctx.springRatings >= 5, Math.min(ctx.springRatings / 5 * 100, 100));
  check("summer-heat",      ctx.summerRatings >= 5, Math.min(ctx.summerRatings / 5 * 100, 100));
  check("fall-harvest",     ctx.fallRatings >= 5,   Math.min(ctx.fallRatings / 5 * 100, 100));
  check("winter-chill",     ctx.winterRatings >= 5, Math.min(ctx.winterRatings / 5 * 100, 100));

  const allSeasons = ctx.springRatings >= 5 && ctx.summerRatings >= 5 && ctx.fallRatings >= 5 && ctx.winterRatings >= 5;
  const seasonProgress = [ctx.springRatings >= 5, ctx.summerRatings >= 5, ctx.fallRatings >= 5, ctx.winterRatings >= 5].filter(Boolean).length;
  check("year-round",       allSeasons, seasonProgress / 4 * 100);

  return earned;
}

export interface BusinessBadgeContext {
  totalRatings: number;
  averageScore: number;
  categoryRank: number;
  trustedRaterCount: number;
  topJudgeHighRatings: number;
  consecutiveWeeksImproved: number;
  isVerified: boolean;
  challengerWins: number;
  isNew: boolean;
}

export function evaluateBusinessBadges(ctx: BusinessBadgeContext): EarnedBadge[] {
  const earned: EarnedBadge[] = [];
  const now = Date.now();

  const check = (id: string, condition: boolean, progress: number) => {
    const badge = BUSINESS_BADGES.find(b => b.id === id);
    if (badge) {
      earned.push({ badge, earnedAt: condition ? now : 0, progress: Math.min(progress, 100) });
    }
  };

  // Rating volume
  check("biz-first-rating", ctx.totalRatings >= 1,   Math.min(ctx.totalRatings / 1 * 100, 100));
  check("biz-10-ratings",   ctx.totalRatings >= 10,  Math.min(ctx.totalRatings / 10 * 100, 100));
  check("biz-25-ratings",   ctx.totalRatings >= 25,  Math.min(ctx.totalRatings / 25 * 100, 100));
  check("biz-50-ratings",   ctx.totalRatings >= 50,  Math.min(ctx.totalRatings / 50 * 100, 100));
  check("biz-100-ratings",  ctx.totalRatings >= 100, Math.min(ctx.totalRatings / 100 * 100, 100));
  check("biz-250-ratings",  ctx.totalRatings >= 250, Math.min(ctx.totalRatings / 250 * 100, 100));

  // Ranking
  check("biz-top-10",      ctx.categoryRank <= 10 && ctx.categoryRank > 0, ctx.categoryRank <= 10 ? 100 : Math.max(0, (20 - ctx.categoryRank) / 10 * 100));
  check("biz-top-3",       ctx.categoryRank <= 3 && ctx.categoryRank > 0,  ctx.categoryRank <= 3 ? 100 : Math.max(0, (10 - ctx.categoryRank) / 7 * 100));
  check("biz-number-one",  ctx.categoryRank === 1,                          ctx.categoryRank === 1 ? 100 : Math.max(0, (5 - ctx.categoryRank) / 4 * 100));

  // Score quality
  check("biz-high-rated",  ctx.averageScore >= 4.0 && ctx.totalRatings >= 5,  Math.min(ctx.averageScore / 4.0 * 100, 100));
  check("biz-exceptional",  ctx.averageScore >= 4.5 && ctx.totalRatings >= 10, Math.min(ctx.averageScore / 4.5 * 100, 100));
  check("biz-perfect-rep",  ctx.averageScore >= 4.8 && ctx.totalRatings >= 25, Math.min(ctx.averageScore / 4.8 * 100, 100));

  // Consistency
  check("biz-steady-climber",    ctx.consecutiveWeeksImproved >= 3, Math.min(ctx.consecutiveWeeksImproved / 3 * 100, 100));
  check("biz-unstoppable-rise",  ctx.consecutiveWeeksImproved >= 8, Math.min(ctx.consecutiveWeeksImproved / 8 * 100, 100));

  // Social
  check("biz-trusted-approved", ctx.trustedRaterCount >= 5,    Math.min(ctx.trustedRaterCount / 5 * 100, 100));
  check("biz-top-judge-pick",   ctx.topJudgeHighRatings >= 3,  Math.min(ctx.topJudgeHighRatings / 3 * 100, 100));

  // Special
  check("biz-challenger-winner", ctx.challengerWins >= 1,  ctx.challengerWins >= 1 ? 100 : 0);
  check("biz-new-entry",         ctx.isNew,                ctx.isNew ? 100 : 0);
  check("biz-verified",          ctx.isVerified,           ctx.isVerified ? 100 : 0);

  return earned;
}

// ─── Helpers ────────────────────────────────────────────────────

export function getBadgeById(id: string): Badge | undefined {
  return ALL_BADGES.find(b => b.id === id);
}

export function getBadgesByCategory(category: BadgeCategory): Badge[] {
  return ALL_BADGES.filter(b => b.category === category);
}

export function getBadgesByRarity(rarity: BadgeRarity): Badge[] {
  return ALL_BADGES.filter(b => b.rarity === rarity);
}

export function getUserBadgeCount(): number {
  return USER_BADGES.length;
}

export function getBusinessBadgeCount(): number {
  return BUSINESS_BADGES.length;
}

export function getEarnedCount(badges: EarnedBadge[]): number {
  return badges.filter(b => b.earnedAt > 0).length;
}

export function getNextUnearned(badges: EarnedBadge[]): EarnedBadge | undefined {
  return badges
    .filter(b => b.earnedAt === 0 && b.progress > 0)
    .sort((a, b) => b.progress - a.progress)[0];
}
