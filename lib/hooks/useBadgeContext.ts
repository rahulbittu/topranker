/**
 * useBadgeContext — Builds UserBadgeContext from profile + impact data
 * Owner: Mei Lin (Type Safety Lead) + Jordan (CVO)
 *
 * Eliminates duplicate badge context construction in profile.tsx.
 * Returns both the context and evaluated badges for reuse.
 */
import { useMemo } from "react";
import {
  evaluateUserBadges, getUserBadgeCount, getEarnedCount,
  type UserBadgeContext, type EarnedBadge,
} from "@/lib/badges";
import type { ApiMemberProfile } from "@/lib/api";
import type { CredibilityTier } from "@/lib/data";

interface MemberImpact {
  businessesMovedUp: number;
  businessesMovedToFirst?: number;
}

interface UseBadgeContextResult {
  badgeCtx: UserBadgeContext;
  badges: EarnedBadge[];
  earnedCount: number;
  totalPossible: number;
}

export function useBadgeContext(
  profile: ApiMemberProfile,
  tier: CredibilityTier,
  impact: MemberImpact | null | undefined,
): UseBadgeContextResult {
  return useMemo(() => {
    const badgeCtx: UserBadgeContext = {
      totalRatings: profile.totalRatings,
      distinctBusinesses: profile.distinctBusinesses,
      totalCategories: profile.totalCategories,
      daysActive: profile.daysActive,
      currentStreak: profile.currentStreak ?? 0,
      credibilityTier: tier,
      credibilityScore: profile.credibilityScore,
      isFoundingMember: profile.isFoundingMember,
      referralCount: profile.referralCount ?? 0,
      helpfulVotes: profile.helpfulVotes ?? 0,
      citiesRated: profile.citiesRated ?? 1,
      hasRatedAfterMidnight: profile.hasRatedAfterMidnight ?? false,
      hasRatedBefore7AM: profile.hasRatedBefore7AM ?? false,
      hasGivenPerfect5: profile.hasGivenPerfect5 ?? false,
      hasGivenScore1: profile.hasGivenScore1 ?? false,
      businessesMovedUp: impact?.businessesMovedUp ?? 0,
      businessesMovedToFirst: impact?.businessesMovedToFirst ?? 0,
      springRatings: profile.springRatings ?? 0,
      summerRatings: profile.summerRatings ?? 0,
      fallRatings: profile.fallRatings ?? 0,
      winterRatings: profile.winterRatings ?? 0,
    };
    const badges = evaluateUserBadges(badgeCtx);
    const earnedCount = getEarnedCount(badges);
    const totalPossible = getUserBadgeCount();
    return { badgeCtx, badges, earnedCount, totalPossible };
  }, [
    profile.totalRatings, profile.distinctBusinesses, profile.totalCategories,
    profile.daysActive, profile.currentStreak, tier, profile.credibilityScore,
    profile.isFoundingMember, profile.referralCount, profile.helpfulVotes,
    profile.citiesRated, profile.springRatings, profile.summerRatings,
    profile.fallRatings, profile.winterRatings,
    impact?.businessesMovedUp, impact?.businessesMovedToFirst,
  ]);
}
