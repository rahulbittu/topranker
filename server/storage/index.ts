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
  updateMemberProfile,
  updatePushToken,
  updateNotificationPrefs,
  updateMemberAvatar,
  updateMemberEmail,
  getOnboardingProgress,
} from "./members";

// Businesses
export {
  getLeaderboard,
  getTrendingBusinesses,
  getBusinessBySlug,
  getBusinessById,
  updateBusinessSubscription,
  getBusinessesByIds,
  searchBusinesses,
  getAllCategories,
  recalculateBusinessScore,
  recalculateRanks,
  getBusinessPhotos,
  getBusinessPhotosMap,
  insertBusinessPhotos,
  getBusinessesWithoutPhotos,
  deleteBusinessPhotos,
  getRankHistory,
  getBusinessRatings,
  autocompleteBusinesses,
  getPopularCategories,
} from "./businesses";

// Ratings
export {
  submitRating, getRatingById, editRating, deleteRating,
  submitRatingFlag, getAutoFlaggedRatings, reviewAutoFlaggedRating,
} from "./ratings";

// Challengers
export { getActiveChallenges, updateChallengerVotes, createChallenge, closeExpiredChallenges } from "./challengers";

// Members (city push tokens — Sprint 179)
export { getMembersWithPushTokenByCity } from "./members";

// Dishes
export {
  getBusinessDishes,
  searchDishes,
  getDishLeaderboards,
  getDishLeaderboardWithEntries,
  getDishSuggestions,
  submitDishSuggestion,
  voteDishSuggestion,
  recalculateDishLeaderboard,
} from "./dishes";

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

// Payments
export {
  createPaymentRecord,
  getPaymentById,
  updatePaymentStatus,
  updatePaymentStatusByStripeId,
  getMemberPayments,
  getBusinessPayments,
  getRevenueMetrics,
  getRevenueByMonth,
} from "./payments";

// Webhook Events
export {
  logWebhookEvent,
  markWebhookProcessed,
  getWebhookEventById,
  getRecentWebhookEvents,
} from "./webhook-events";

// Featured Placements
export {
  createFeaturedPlacement,
  getActiveFeaturedInCity,
  getBusinessFeaturedStatus,
  expireFeaturedByPayment,
  expireOldPlacements,
} from "./featured-placements";

// Claims & Flags
export {
  submitClaim,
  getClaimByMemberAndBusiness,
  getPendingClaims,
  reviewClaim,
  getClaimCount,
  getPendingFlags,
  reviewFlag,
  getFlagCount,
} from "./claims";

// Rating Responses (Sprint 177)
export {
  submitRatingResponse,
  getRatingResponse,
  getBusinessResponses,
  getResponsesForRatings,
  deleteRatingResponse,
} from "./responses";

// QR Scans (Sprint 178)
export {
  recordQrScan,
  getQrScanStats,
  markQrScanConverted,
} from "./qr";

// In-App Notifications (Sprint 182)
export {
  createNotification,
  getMemberNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadNotificationCount,
} from "./notifications";
