// Re-export from brand constants for backwards compatibility
export { CATEGORY_LABELS, CATEGORY_EMOJI as CATEGORY_EMOJIS, getCategoryDisplay, getRankDisplay } from "@/constants/brand";
import { CATEGORY_LABELS } from "@/constants/brand";

export function formatCategoryLabel(slug: string): string {
  return CATEGORY_LABELS[slug] || slug.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

export const CATEGORY_MAP: Record<string, string> = {
  "Restaurants": "restaurant",
  "Fast Food": "fast_food",
  "Fine Dining": "fine_dining",
  "Cafes": "cafe",
  "Bakeries": "bakery",
  "Bubble Tea": "bubble_tea",
  "Ice Cream": "ice_cream",
  "Street Food": "street_food",
  "Bars": "bar",
  "Breweries": "brewery",
  "Casual Dining": "casual_dining",
  "Buffets": "buffet",
  "Brunch": "brunch",
  "Dessert Bars": "dessert_bar",
  "Food Halls": "food_hall",
};

export const CATEGORY_ICONS: Record<string, string> = {
  "Restaurants": "\u{1F37D}",
  "Fast Food": "\u{1F354}",
  "Cafes": "\u2615",
  "Street Food": "\u{1F32E}",
  "Bars": "\u{1F37A}",
  "Bakeries": "\u{1F950}",
  "Fine Dining": "\u{1F942}",
  "Bubble Tea": "\u{1F9CB}",
  "Ice Cream": "\u{1F366}",
  "Breweries": "\u{1F37B}",
  "Casual Dining": "\u{1F373}",
  "Buffets": "\u{1F371}",
  "Brunch": "\u{1F95E}",
  "Dessert Bars": "\u{1F370}",
  "Food Halls": "\u{1F3EA}",
};

export type Category = keyof typeof CATEGORY_MAP;

export const CATEGORIES: Category[] = [
  "Restaurants",
  "Fast Food",
  "Fine Dining",
  "Cafes",
  "Bakeries",
  "Bubble Tea",
  "Ice Cream",
  "Street Food",
  "Bars",
  "Breweries",
  "Casual Dining",
  "Buffets",
  "Brunch",
  "Dessert Bars",
  "Food Halls",
];

export type CredibilityTier = "community" | "city" | "trusted" | "top";

export const TIER_DISPLAY_NAMES: Record<CredibilityTier, string> = {
  community: "New Member",
  city: "Regular",
  trusted: "Trusted",
  top: "Top Judge",
};

/** Human-readable influence labels — shown instead of raw "x0.10" */
export const TIER_INFLUENCE_LABELS: Record<CredibilityTier, string> = {
  community: "Starter Influence",
  city: "Growing Influence",
  trusted: "Strong Influence",
  top: "Maximum Influence",
};

/** Ranking confidence based on total ratings */
export type RankConfidence = "provisional" | "early" | "established" | "strong";

/**
 * Category-specific confidence thresholds.
 * High-volume categories (fast food, casual dining) calibrate faster.
 * Niche categories (fine dining, breweries) need more ratings for confidence.
 */
const CATEGORY_CONFIDENCE_THRESHOLDS: Record<string, { provisional: number; early: number; established: number }> = {
  fast_food:      { provisional: 3, early: 8,  established: 20 },
  casual_dining:  { provisional: 3, early: 8,  established: 20 },
  buffet:         { provisional: 3, early: 8,  established: 20 },
  restaurant:     { provisional: 3, early: 10, established: 25 },
  cafe:           { provisional: 3, early: 10, established: 25 },
  brunch:         { provisional: 3, early: 10, established: 25 },
  bar:            { provisional: 3, early: 10, established: 25 },
  fine_dining:    { provisional: 5, early: 15, established: 35 },
  brewery:        { provisional: 5, early: 12, established: 30 },
  dessert_bar:    { provisional: 3, early: 12, established: 30 },
  food_hall:      { provisional: 5, early: 12, established: 30 },
};

const DEFAULT_THRESHOLDS = { provisional: 3, early: 10, established: 25 };

export function getRankConfidence(totalRatings: number, category?: string): RankConfidence {
  const t = (category && CATEGORY_CONFIDENCE_THRESHOLDS[category]) || DEFAULT_THRESHOLDS;
  if (totalRatings < t.provisional) return "provisional";
  if (totalRatings < t.early) return "early";
  if (totalRatings < t.established) return "established";
  return "strong";
}

export const RANK_CONFIDENCE_LABELS: Record<RankConfidence, { label: string; description: string }> = {
  provisional: { label: "Provisional Rank", description: "Needs more ratings to stabilize" },
  early: { label: "Early Ranking", description: "Building confidence with each rating" },
  established: { label: "Established", description: "Ranking reflects community consensus" },
  strong: { label: "High Confidence", description: "Strong community agreement" },
};

export const TIER_WEIGHTS: Record<CredibilityTier, number> = {
  community: 0.10,
  city: 0.35,
  trusted: 0.70,
  top: 1.00,
};

export const TIER_SCORE_RANGES: Record<CredibilityTier, { min: number; max: number }> = {
  community: { min: 10, max: 99 },
  city: { min: 100, max: 299 },
  trusted: { min: 300, max: 599 },
  top: { min: 600, max: 1000 },
};

export const TIER_COLORS: Record<CredibilityTier, string> = {
  community: "#8E8E93",
  city: "#6B6B6B",
  trusted: "#C49A1A",
  top: "#C9973A",
};

export const RANK_COLORS = {
  gold: "#C9973A",
  silver: "#A8B5C8",
  bronze: "#8B6914",
  navy: "#0D1B2A",
};

// getRankDisplay is re-exported from @/constants/brand above

export function getVoteWeight(credibilityScore: number): number {
  if (credibilityScore >= 600) return 1.000;
  if (credibilityScore >= 300) return 0.700;
  if (credibilityScore >= 100) return 0.350;
  return 0.100;
}

export function getTemporalMultiplier(ratingAgeDays: number): number {
  if (ratingAgeDays <= 30) return 1.00;
  if (ratingAgeDays <= 90) return 0.85;
  if (ratingAgeDays <= 180) return 0.65;
  if (ratingAgeDays <= 365) return 0.45;
  return 0.25;
}

export function getCredibilityTier(score: number): CredibilityTier {
  if (score >= 600) return "top";
  if (score >= 300) return "trusted";
  if (score >= 100) return "city";
  return "community";
}

export interface CredibilityBreakdown {
  basePoints: number;
  ratingPoints: number;
  diversityBonus: number;
  ageBonus: number;
  varianceBonus: number;
  helpfulnessBonus: number;
  flagPenalty: number;
  totalScore: number;
}

export function calculateCredibilityScore(
  totalRatings: number,
  totalCategories: number,
  daysActive: number,
  ratingVariance: number,
  pioneerRate: number,
  totalPenalties: number,
): CredibilityBreakdown {
  const basePoints = 10;
  const ratingPoints = Math.min(totalRatings * 2, 200);
  const diversityBonus = Math.min(totalCategories * 15, 100);
  const ageBonus = Math.min(daysActive * 0.5, 100);
  const varianceBonus = totalRatings >= 5 ? Math.min(ratingVariance * 60, 150) : 0;
  const helpfulnessBonus = Math.round(pioneerRate * 100);
  const flagPenalty = totalPenalties;

  const raw = basePoints + ratingPoints + diversityBonus + ageBonus + varianceBonus + helpfulnessBonus - flagPenalty;
  const totalScore = Math.max(10, Math.min(1000, Math.round(raw)));

  return {
    basePoints,
    ratingPoints,
    diversityBonus,
    ageBonus,
    varianceBonus,
    helpfulnessBonus,
    flagPenalty,
    totalScore,
  };
}

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

export function getQ1Label(category: string): string {
  const foodCategories = ["restaurant", "fast_food", "fine_dining", "cafe", "bakery", "street_food", "casual_dining", "buffet", "brunch", "dessert_bar", "food_hall", "bubble_tea", "ice_cream"];
  if (foodCategories.includes(category)) return "How was the food quality?";
  if (["bar", "brewery"].includes(category)) return "How were the drinks?";
  if (["nail_salon", "spa", "hair_salon"].includes(category)) return "How was the service quality?";
  if (["gym"].includes(category)) return "How were the facilities and equipment?";
  return "How was the quality of work?";
}

export function getQ3Label(category: string): string {
  const foodCategories = ["restaurant", "fast_food", "fine_dining", "cafe", "bakery", "street_food", "casual_dining", "buffet", "brunch", "dessert_bar", "food_hall", "bar", "brewery", "bubble_tea", "ice_cream"];
  if (foodCategories.includes(category)) return "How was the service?";
  if (["nail_salon", "spa", "hair_salon", "skincare"].includes(category)) return "How clean and hygienic was the space?";
  return "How professional was the team?";
}

export function getWouldReturnLabel(category: string): string {
  const foodCategories = ["restaurant", "fast_food", "fine_dining", "cafe", "bakery", "street_food", "casual_dining", "buffet", "brunch", "dessert_bar", "food_hall", "bar", "brewery", "bubble_tea", "ice_cream"];
  if (foodCategories.includes(category)) return "Would you come back?";
  return "Would you use them again?";
}

export interface Rating {
  id: string;
  businessId: string;
  userId: string;
  userName: string;
  userTier: CredibilityTier;
  userAvatarUrl?: string;
  q1: number;
  q2: number;
  q3: number;
  wouldReturn: boolean;
  comment?: string;
  dishVoted?: string;
  createdAt: number;
  rawScore: number;
  weight: number;
  weightedScore: number;
}

export interface Challenger {
  id: string;
  challengerId: string;
  challengerName: string;
  defenderId: string;
  defenderName: string;
  challengerVotes: number;
  defenderVotes: number;
  totalVotes: number;
  startDate: number;
  endDate: number;
  category: string;
  city: string;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  neighborhood: string;
  city: string;
  category: string;
  weightedScore: number;
  rawAvgScore: number;
  rank: number;
  prevRank: number | null;
  rankDelta: number;
  ratingCount: number;
  isChallenger?: boolean;
  description?: string;
  priceRange?: string;
  phone?: string;
  website?: string;
  address?: string;
  photoUrl?: string;
  isOpenNow?: boolean;
  lat?: number;
  lng?: number;
  isClaimed?: boolean;
  googleRating?: number;
  openingHours?: { weekday_text?: string[]; periods?: any[] };
}

export interface TierRequirement {
  label: string;
  current: number;
  needed: number;
  met: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  city: string;
  tier: CredibilityTier;
  credibilityScore: number;
  credibilityBreakdown: CredibilityBreakdown;
  totalRatings: number;
  totalCategories: number;
  distinctBusinesses: number;
  daysActive: number;
  ratingVariance: number;
  isFoundingMember: boolean;
  ratingHistory: { businessId: string; businessName: string; rawScore: number; weight: number; ratedAt: number }[];
  businessesHelpedUp: number;
}

export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function formatCountdown(endDate: number): { days: number; hours: number; minutes: number; ended: boolean } {
  const diff = endDate - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, ended: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, minutes, ended: false };
}
