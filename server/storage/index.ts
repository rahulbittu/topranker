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
  updateNotificationFrequencyPrefs,
  updateMemberAvatar,
  updateMemberEmail,
  getOnboardingProgress,
  generateEmailVerificationToken,
  verifyEmailToken,
  isEmailVerified,
  generatePasswordResetToken,
  resetPasswordWithToken,
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
  countBusinessSearch, // Sprint 473
  getAllCategories,
  getCuisines,
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
  bulkImportBusinesses,
  getImportStats,
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
  getBatchDishRankings,
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

// QR Scans (Sprint 178)
export {
  recordQrScan,
  getQrScanStats,
  markQrScanConverted,
} from "./qr";

// Referrals (Sprint 188)
export {
  createReferral,
  resolveReferralCode,
  getReferralStats,
  activateReferral,
  getReferrerForMember,
} from "./referrals";

// In-App Notifications (Sprint 182)
export {
  createNotification,
  getMemberNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadNotificationCount,
} from "./notifications";

// Beta Invites (Sprint 197)
export {
  createBetaInvite,
  getBetaInviteByEmail,
  markBetaInviteJoined,
  getBetaInviteStats,
} from "./beta-invites";

// Analytics Persistence (Sprint 201)
export {
  persistAnalyticsEvents,
  getPersistedEventCounts,
  getPersistedDailyStats,
  getPersistedEventTotal,
} from "./analytics";

// User Activity Persistence (Sprint 204)
export {
  recordUserActivityDb,
  getActiveUserStatsDb,
} from "./user-activity";

// Beta Feedback (Sprint 211)
export {
  createFeedback,
  getRecentFeedback,
  getFeedbackStats,
} from "./feedback";
