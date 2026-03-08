/**
 * Top Judge Rewards & Tier Perks Engine
 * Owner: Jordan (Chief Value Officer)
 *
 * Defines what users unlock at each credibility tier.
 * The value proposition must be clear: rate more → earn more → unlock more.
 */

import type { CredibilityTier } from "@/lib/data";

export interface TierPerk {
  id: string;
  icon: string; // Ionicons name
  title: string;
  description: string;
  tier: CredibilityTier;
}

/**
 * All perks organized by the minimum tier required to unlock them.
 * Each tier inherits all perks from lower tiers.
 */
export const TIER_PERKS: TierPerk[] = [
  // New Member (community) — everyone starts here
  {
    id: "perk-rate",
    icon: "star-outline",
    title: "Rate Businesses",
    description: "Submit ratings with 0.10x vote weight",
    tier: "community",
  },
  {
    id: "perk-bookmark",
    icon: "bookmark-outline",
    title: "Save Places",
    description: "Bookmark your favorite spots",
    tier: "community",
  },
  {
    id: "perk-challenger-view",
    icon: "flash-outline",
    title: "View Challengers",
    description: "Watch live challenger battles",
    tier: "community",
  },

  // Regular (city) — 100+ score
  {
    id: "perk-vote-weight-city",
    icon: "trending-up",
    title: "3.5x Vote Power",
    description: "Your ratings carry 0.35x weight — real influence",
    tier: "city",
  },
  {
    id: "perk-challenger-vote",
    icon: "thumbs-up-outline",
    title: "Vote in Challengers",
    description: "Cast weighted votes in challenger battles",
    tier: "city",
  },
  {
    id: "perk-weekly-digest",
    icon: "mail-outline",
    title: "Weekly Digest",
    description: "Personalized ranking movers & new businesses",
    tier: "city",
  },

  // Trusted — 300+ score
  {
    id: "perk-vote-weight-trusted",
    icon: "shield-checkmark-outline",
    title: "7x Vote Power",
    description: "Your ratings carry 0.70x weight — highly trusted",
    tier: "trusted",
  },
  {
    id: "perk-early-access",
    icon: "rocket-outline",
    title: "Early Access",
    description: "Preview new features before public launch",
    tier: "trusted",
  },
  {
    id: "perk-badge-visible",
    icon: "ribbon-outline",
    title: "Trusted Badge",
    description: "Visible trust badge on all your ratings",
    tier: "trusted",
  },
  {
    id: "perk-priority-support",
    icon: "chatbubble-ellipses-outline",
    title: "Priority Support",
    description: "Faster response from the TopRanker team",
    tier: "trusted",
  },

  // Top Judge — 600+ score
  {
    id: "perk-vote-weight-top",
    icon: "trophy-outline",
    title: "Full Vote Power",
    description: "Maximum 1.00x weight — your voice matters most",
    tier: "top",
  },
  {
    id: "perk-top-badge",
    icon: "medal-outline",
    title: "Top Judge Badge",
    description: "Gold badge displayed on your profile & ratings",
    tier: "top",
  },
  {
    id: "perk-exclusive-events",
    icon: "calendar-outline",
    title: "Exclusive Tastings",
    description: "Invites to restaurant tastings & food events",
    tier: "top",
  },
  {
    id: "perk-leaderboard-name",
    icon: "podium-outline",
    title: "Judge Leaderboard",
    description: "Featured on the Top Judges leaderboard",
    tier: "top",
  },
  {
    id: "perk-challenger-free",
    icon: "flash",
    title: "Free Challenger Entry",
    description: "Submit one free challenger battle per month",
    tier: "top",
  },
  {
    id: "perk-founder-circle",
    icon: "people-outline",
    title: "Founder's Circle",
    description: "Direct line to the TopRanker founding team",
    tier: "top",
  },
];

const TIER_ORDER: CredibilityTier[] = ["community", "city", "trusted", "top"];

/**
 * Get perks for a specific tier (only perks unlocked AT that tier, not inherited).
 */
export function getPerksForTier(tier: CredibilityTier): TierPerk[] {
  return TIER_PERKS.filter((p) => p.tier === tier);
}

/**
 * Get all perks a user has unlocked (their tier + all lower tiers).
 */
export function getUnlockedPerks(tier: CredibilityTier): TierPerk[] {
  const tierIdx = TIER_ORDER.indexOf(tier);
  return TIER_PERKS.filter((p) => TIER_ORDER.indexOf(p.tier) <= tierIdx);
}

/**
 * Get perks the user hasn't unlocked yet (next tier and above).
 */
export function getLockedPerks(tier: CredibilityTier): TierPerk[] {
  const tierIdx = TIER_ORDER.indexOf(tier);
  return TIER_PERKS.filter((p) => TIER_ORDER.indexOf(p.tier) > tierIdx);
}

/**
 * Get the next tier's perks (what the user is working toward).
 */
export function getNextTierPerks(tier: CredibilityTier): { nextTier: CredibilityTier; perks: TierPerk[] } | null {
  const tierIdx = TIER_ORDER.indexOf(tier);
  if (tierIdx >= TIER_ORDER.length - 1) return null;
  const nextTier = TIER_ORDER[tierIdx + 1];
  return { nextTier, perks: getPerksForTier(nextTier) };
}
