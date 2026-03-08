/**
 * TopRanker Achievement Badges System
 * Owner: Jordan (Chief Value Officer)
 *
 * Apple Fitness-style achievement badges for USERS and BUSINESSES.
 * Badges are visual rewards earned through activity, milestones, and streaks.
 * The psychology: visible progress → dopamine → continued engagement.
 */

import type { CredibilityTier } from "@/lib/data";

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

// ─── USER BADGES ────────────────────────────────────────────────

export const USER_BADGES: Badge[] = [
  // ── Milestone Badges (rating count) ──
  {
    id: "first-taste",
    name: "First Taste",
    description: "Submit your very first rating",
    icon: "star",
    category: "milestone",
    rarity: "common",
    target: "user",
    color: "#FFD700",
    gradient: ["#FFD700", "#FFA000"],
  },
  {
    id: "getting-started",
    name: "Getting Started",
    description: "Rate 5 businesses",
    icon: "flame",
    category: "milestone",
    rarity: "common",
    target: "user",
    color: "#FF6B35",
    gradient: ["#FF6B35", "#FF4500"],
  },
  {
    id: "ten-strong",
    name: "Ten Strong",
    description: "Rate 10 businesses",
    icon: "ribbon",
    category: "milestone",
    rarity: "common",
    target: "user",
    color: "#4CAF50",
    gradient: ["#4CAF50", "#2E7D32"],
  },
  {
    id: "quarter-century",
    name: "Quarter Century",
    description: "Rate 25 businesses",
    icon: "medal",
    category: "milestone",
    rarity: "rare",
    target: "user",
    color: "#2196F3",
    gradient: ["#42A5F5", "#1565C0"],
  },
  {
    id: "half-century",
    name: "Half Century",
    description: "Rate 50 businesses",
    icon: "trophy",
    category: "milestone",
    rarity: "rare",
    target: "user",
    color: "#7C4DFF",
    gradient: ["#B388FF", "#651FFF"],
  },
  {
    id: "centurion",
    name: "Centurion",
    description: "Rate 100 businesses",
    icon: "shield-checkmark",
    category: "milestone",
    rarity: "epic",
    target: "user",
    color: "#9C27B0",
    gradient: ["#CE93D8", "#7B1FA2"],
  },
  {
    id: "rating-machine",
    name: "Rating Machine",
    description: "Rate 250 businesses",
    icon: "flash",
    category: "milestone",
    rarity: "epic",
    target: "user",
    color: "#E040FB",
    gradient: ["#EA80FC", "#AA00FF"],
  },
  {
    id: "legendary-judge",
    name: "Legendary Judge",
    description: "Rate 500 businesses",
    icon: "diamond",
    category: "milestone",
    rarity: "legendary",
    target: "user",
    color: "#C49A1A",
    gradient: ["#FFD700", "#9A7510"],
  },

  // ── Streak Badges (consecutive days rating) ──
  {
    id: "three-day-streak",
    name: "On a Roll",
    description: "Rate on 3 consecutive days",
    icon: "flame-outline",
    category: "streak",
    rarity: "common",
    target: "user",
    color: "#FF7043",
    gradient: ["#FF8A65", "#E64A19"],
  },
  {
    id: "week-warrior",
    name: "Week Warrior",
    description: "Rate on 7 consecutive days",
    icon: "flame",
    category: "streak",
    rarity: "rare",
    target: "user",
    color: "#FF5722",
    gradient: ["#FF8A65", "#D84315"],
  },
  {
    id: "two-week-streak",
    name: "Unstoppable",
    description: "Rate on 14 consecutive days",
    icon: "bonfire",
    category: "streak",
    rarity: "epic",
    target: "user",
    color: "#FF3D00",
    gradient: ["#FF6E40", "#BF360C"],
  },
  {
    id: "monthly-devotion",
    name: "Monthly Devotion",
    description: "Rate on 30 consecutive days",
    icon: "infinite",
    category: "streak",
    rarity: "legendary",
    target: "user",
    color: "#DD2C00",
    gradient: ["#FF6D00", "#B71C1C"],
  },

  // ── Explorer Badges (category & city diversity) ──
  {
    id: "curious-palate",
    name: "Curious Palate",
    description: "Rate in 3 different categories",
    icon: "compass",
    category: "explorer",
    rarity: "common",
    target: "user",
    color: "#26A69A",
    gradient: ["#4DB6AC", "#00796B"],
  },
  {
    id: "category-hopper",
    name: "Category Hopper",
    description: "Rate in 5 different categories",
    icon: "map",
    category: "explorer",
    rarity: "rare",
    target: "user",
    color: "#00897B",
    gradient: ["#26A69A", "#004D40"],
  },
  {
    id: "master-explorer",
    name: "Master Explorer",
    description: "Rate in 10 different categories",
    icon: "earth",
    category: "explorer",
    rarity: "epic",
    target: "user",
    color: "#006064",
    gradient: ["#00ACC1", "#004D40"],
  },
  {
    id: "city-hopper",
    name: "City Hopper",
    description: "Rate businesses in 2 different cities",
    icon: "airplane",
    category: "explorer",
    rarity: "rare",
    target: "user",
    color: "#5C6BC0",
    gradient: ["#7986CB", "#283593"],
  },
  {
    id: "texas-tour",
    name: "Texas Tour",
    description: "Rate businesses in 4 Texas cities",
    icon: "flag",
    category: "explorer",
    rarity: "legendary",
    target: "user",
    color: "#C49A1A",
    gradient: ["#FFD700", "#8D6E0F"],
  },
  {
    id: "night-owl",
    name: "Night Owl",
    description: "Submit a rating after midnight",
    icon: "moon",
    category: "explorer",
    rarity: "rare",
    target: "user",
    color: "#3F51B5",
    gradient: ["#7986CB", "#1A237E"],
  },
  {
    id: "early-bird",
    name: "Early Bird",
    description: "Submit a rating before 7 AM",
    icon: "sunny",
    category: "explorer",
    rarity: "rare",
    target: "user",
    color: "#FFC107",
    gradient: ["#FFD54F", "#FF8F00"],
  },

  // ── Social Badges ──
  {
    id: "first-referral",
    name: "Connector",
    description: "Invite a friend who creates an account",
    icon: "people",
    category: "social",
    rarity: "rare",
    target: "user",
    color: "#29B6F6",
    gradient: ["#4FC3F7", "#0277BD"],
  },
  {
    id: "squad-builder",
    name: "Squad Builder",
    description: "Invite 5 friends who join TopRanker",
    icon: "people-circle",
    category: "social",
    rarity: "epic",
    target: "user",
    color: "#0288D1",
    gradient: ["#03A9F4", "#01579B"],
  },
  {
    id: "community-leader",
    name: "Community Leader",
    description: "Invite 25 friends who join TopRanker",
    icon: "megaphone",
    category: "social",
    rarity: "legendary",
    target: "user",
    color: "#C49A1A",
    gradient: ["#FFD700", "#9A7510"],
  },
  {
    id: "helpful-voice",
    name: "Helpful Voice",
    description: "5 of your ratings marked as helpful",
    icon: "thumbs-up",
    category: "social",
    rarity: "rare",
    target: "user",
    color: "#66BB6A",
    gradient: ["#81C784", "#2E7D32"],
  },
  {
    id: "influencer",
    name: "Influencer",
    description: "25 of your ratings marked as helpful",
    icon: "hand-left",
    category: "social",
    rarity: "epic",
    target: "user",
    color: "#43A047",
    gradient: ["#66BB6A", "#1B5E20"],
  },

  // ── Tier Badges (credibility tier achievements) ──
  {
    id: "tier-city",
    name: "City Regular",
    description: "Reach the Regular tier (100+ credibility)",
    icon: "star",
    category: "milestone",
    rarity: "rare",
    target: "user",
    color: "#6B6B6B",
    gradient: ["#9E9E9E", "#424242"],
  },
  {
    id: "tier-trusted",
    name: "Trusted Judge",
    description: "Reach the Trusted tier (300+ credibility)",
    icon: "shield-checkmark",
    category: "milestone",
    rarity: "epic",
    target: "user",
    color: "#C49A1A",
    gradient: ["#F0C84A", "#9A7510"],
  },
  {
    id: "tier-top",
    name: "Top Judge",
    description: "Reach the Top Judge tier (600+ credibility)",
    icon: "trophy",
    category: "milestone",
    rarity: "legendary",
    target: "user",
    color: "#C49A1A",
    gradient: ["#FFD700", "#8D6E0F"],
  },

  // ── Special Badges ──
  {
    id: "founding-member",
    name: "Founding Member",
    description: "Joined TopRanker in its first year",
    icon: "sparkles",
    category: "special",
    rarity: "legendary",
    target: "user",
    color: "#C49A1A",
    gradient: ["#FFD700", "#C49A1A"],
  },
  {
    id: "perfect-score",
    name: "Perfect 5",
    description: "Give a perfect 5.0 rating",
    icon: "heart",
    category: "special",
    rarity: "common",
    target: "user",
    color: "#E91E63",
    gradient: ["#F48FB1", "#C2185B"],
  },
  {
    id: "tough-critic",
    name: "Tough Critic",
    description: "Give a rating of 1.0",
    icon: "alert-circle",
    category: "special",
    rarity: "rare",
    target: "user",
    color: "#F44336",
    gradient: ["#EF5350", "#B71C1C"],
  },
  {
    id: "impact-maker",
    name: "Impact Maker",
    description: "Your rating moves a business up in rankings",
    icon: "trending-up",
    category: "special",
    rarity: "rare",
    target: "user",
    color: "#4CAF50",
    gradient: ["#66BB6A", "#1B5E20"],
  },
  {
    id: "king-maker",
    name: "King Maker",
    description: "Your rating moves a business to #1",
    icon: "podium",
    category: "special",
    rarity: "legendary",
    target: "user",
    color: "#C49A1A",
    gradient: ["#FFD700", "#9A7510"],
  },
];

// ─── BUSINESS BADGES ────────────────────────────────────────────

export const BUSINESS_BADGES: Badge[] = [
  // ── Rating Volume ──
  {
    id: "biz-first-rating",
    name: "On the Map",
    description: "Receive the first rating",
    icon: "location",
    category: "milestone",
    rarity: "common",
    target: "business",
    color: "#4CAF50",
    gradient: ["#66BB6A", "#2E7D32"],
  },
  {
    id: "biz-10-ratings",
    name: "Getting Noticed",
    description: "Receive 10 ratings",
    icon: "eye",
    category: "milestone",
    rarity: "common",
    target: "business",
    color: "#42A5F5",
    gradient: ["#64B5F6", "#1565C0"],
  },
  {
    id: "biz-25-ratings",
    name: "Local Favorite",
    description: "Receive 25 ratings",
    icon: "heart-circle",
    category: "milestone",
    rarity: "rare",
    target: "business",
    color: "#EF5350",
    gradient: ["#EF9A9A", "#C62828"],
  },
  {
    id: "biz-50-ratings",
    name: "Community Choice",
    description: "Receive 50 ratings",
    icon: "people",
    category: "milestone",
    rarity: "rare",
    target: "business",
    color: "#AB47BC",
    gradient: ["#CE93D8", "#6A1B9A"],
  },
  {
    id: "biz-100-ratings",
    name: "City Icon",
    description: "Receive 100 ratings",
    icon: "star",
    category: "milestone",
    rarity: "epic",
    target: "business",
    color: "#C49A1A",
    gradient: ["#F0C84A", "#9A7510"],
  },
  {
    id: "biz-250-ratings",
    name: "Legendary Spot",
    description: "Receive 250 ratings",
    icon: "diamond",
    category: "milestone",
    rarity: "legendary",
    target: "business",
    color: "#C49A1A",
    gradient: ["#FFD700", "#8D6E0F"],
  },

  // ── Ranking Achievements ──
  {
    id: "biz-top-10",
    name: "Top 10",
    description: "Reach top 10 in your city's category",
    icon: "trending-up",
    category: "milestone",
    rarity: "rare",
    target: "business",
    color: "#7C4DFF",
    gradient: ["#B388FF", "#4527A0"],
  },
  {
    id: "biz-top-3",
    name: "Podium Finish",
    description: "Reach top 3 in your city's category",
    icon: "podium",
    category: "milestone",
    rarity: "epic",
    target: "business",
    color: "#C49A1A",
    gradient: ["#FFD700", "#9A7510"],
  },
  {
    id: "biz-number-one",
    name: "Number One",
    description: "Reach #1 in your city's category",
    icon: "trophy",
    category: "milestone",
    rarity: "legendary",
    target: "business",
    color: "#FFD700",
    gradient: ["#FFD700", "#C49A1A"],
  },

  // ── Score Quality ──
  {
    id: "biz-high-rated",
    name: "Highly Rated",
    description: "Maintain an average score above 4.0",
    icon: "thumbs-up",
    category: "milestone",
    rarity: "rare",
    target: "business",
    color: "#66BB6A",
    gradient: ["#81C784", "#2E7D32"],
  },
  {
    id: "biz-exceptional",
    name: "Exceptional",
    description: "Maintain an average score above 4.5",
    icon: "sparkles",
    category: "milestone",
    rarity: "epic",
    target: "business",
    color: "#FFC107",
    gradient: ["#FFD54F", "#FF8F00"],
  },
  {
    id: "biz-perfect-rep",
    name: "Perfect Reputation",
    description: "Average score of 4.8+ with 25+ ratings",
    icon: "ribbon",
    category: "milestone",
    rarity: "legendary",
    target: "business",
    color: "#C49A1A",
    gradient: ["#FFD700", "#9A7510"],
  },

  // ── Consistency ──
  {
    id: "biz-steady-climber",
    name: "Steady Climber",
    description: "Improve ranking for 3 consecutive weeks",
    icon: "arrow-up-circle",
    category: "streak",
    rarity: "rare",
    target: "business",
    color: "#26A69A",
    gradient: ["#4DB6AC", "#00695C"],
  },
  {
    id: "biz-unstoppable-rise",
    name: "Unstoppable Rise",
    description: "Improve ranking for 8 consecutive weeks",
    icon: "rocket",
    category: "streak",
    rarity: "epic",
    target: "business",
    color: "#FF7043",
    gradient: ["#FF8A65", "#D84315"],
  },

  // ── Diversity of Raters ──
  {
    id: "biz-trusted-approved",
    name: "Trusted Approved",
    description: "Receive 5+ ratings from Trusted tier judges",
    icon: "shield-checkmark",
    category: "social",
    rarity: "epic",
    target: "business",
    color: "#C49A1A",
    gradient: ["#F0C84A", "#9A7510"],
  },
  {
    id: "biz-top-judge-pick",
    name: "Top Judge's Pick",
    description: "Rated 4.0+ by 3 Top Judge tier members",
    icon: "medal",
    category: "social",
    rarity: "legendary",
    target: "business",
    color: "#C49A1A",
    gradient: ["#FFD700", "#8D6E0F"],
  },

  // ── Special Business Badges ──
  {
    id: "biz-challenger-winner",
    name: "Challenger Champion",
    description: "Win a challenger battle",
    icon: "flash",
    category: "special",
    rarity: "epic",
    target: "business",
    color: "#FF6F00",
    gradient: ["#FFA726", "#E65100"],
  },
  {
    id: "biz-new-entry",
    name: "New Entry",
    description: "Just added to TopRanker",
    icon: "sparkles",
    category: "special",
    rarity: "common",
    target: "business",
    color: "#29B6F6",
    gradient: ["#4FC3F7", "#0277BD"],
  },
  {
    id: "biz-verified",
    name: "Verified Business",
    description: "Business ownership verified by TopRanker",
    icon: "checkmark-circle",
    category: "special",
    rarity: "rare",
    target: "business",
    color: "#2196F3",
    gradient: ["#42A5F5", "#1565C0"],
  },
];

// ─── ALL BADGES ─────────────────────────────────────────────────
export const ALL_BADGES: Badge[] = [...USER_BADGES, ...BUSINESS_BADGES];

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
  helpfulVotes: number;
  citiesRated: number;
  hasRatedAfterMidnight: boolean;
  hasRatedBefore7AM: boolean;
  hasGivenPerfect5: boolean;
  hasGivenScore1: boolean;
  businessesMovedUp: number;
  businessesMovedToFirst: number;
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
  check("helpful-voice",    ctx.helpfulVotes >= 5,   Math.min(ctx.helpfulVotes / 5 * 100, 100));
  check("influencer",       ctx.helpfulVotes >= 25,  Math.min(ctx.helpfulVotes / 25 * 100, 100));

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
