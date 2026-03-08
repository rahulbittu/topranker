/**
 * Storage barrel export.
 * Re-exports all domain modules so existing imports from "./storage" continue to work.
 * Split from monolithic storage.ts (1010 LOC) per Architectural Audit H1.
 */

// Helpers (pure functions, no DB)
export { getVoteWeight, getCredibilityTier, getTierFromScore, getTemporalMultiplier } from "./helpers";

// Members
export {
  getMemberById,
  getMemberByUsername,
  getMemberByEmail,
  getMemberByAuthId,
  createMember,
  updateMemberStats,
  recalculateCredibilityScore,
  getMemberRatings,
  getMemberImpact,
  getSeasonalRatingCounts,
  getAdminMemberList,
  getMemberCount,
} from "./members";

// Businesses
export {
  getLeaderboard,
  getTrendingBusinesses,
  getBusinessBySlug,
  getBusinessById,
  searchBusinesses,
  getAllCategories,
  recalculateBusinessScore,
  recalculateRanks,
  getBusinessPhotos,
  getBusinessPhotosMap,
  getRankHistory,
  getBusinessRatings,
} from "./businesses";

// Ratings
export { submitRating } from "./ratings";

// Challengers
export { getActiveChallenges, updateChallengerVotes } from "./challengers";

// Dishes
export { getBusinessDishes, searchDishes } from "./dishes";

// Categories
export {
  getDbCategories,
  createCategorySuggestion,
  getPendingSuggestions,
  reviewSuggestion,
} from "./categories";

// Badges
export {
  getMemberBadges,
  getMemberBadgeCount,
  awardBadge,
  hasBadge,
  getEarnedBadgeIds,
  getBadgeLeaderboard,
} from "./badges";

// Claims & Flags
export {
  getPendingClaims,
  reviewClaim,
  getClaimCount,
  getPendingFlags,
  reviewFlag,
  getFlagCount,
} from "./claims";
