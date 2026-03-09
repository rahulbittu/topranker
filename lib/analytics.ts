/**
 * TopRanker Analytics Event Tracking
 *
 * Pluggable analytics layer. In dev: console log.
 * In production: Mixpanel, Amplitude, or PostHog.
 *
 * Every event answers a product question:
 * - Are users discovering businesses? (search, filter, near_me)
 * - Are users engaging deeply? (view_business, rate, bookmark)
 * - Are users coming back? (app_open, notification_tap)
 * - Is the trust system working? (tier_upgrade, report)
 * - Are revenue features converting? (challenger_enter, dashboard_upgrade)
 */

export type AnalyticsEvent =
  // App lifecycle
  | "app_open"
  | "app_background"
  | "onboarding_start"
  | "onboarding_complete"
  | "onboarding_skip"

  // Auth
  | "signup_start"
  | "signup_complete"
  | "login_complete"
  | "logout"

  // Discovery
  | "search_query"
  | "filter_tap"
  | "near_me_tap"
  | "category_tap"
  | "sort_change"

  // Business engagement
  | "view_business"
  | "view_business_photos"
  | "bookmark_add"
  | "bookmark_remove"
  | "claim_business_start"
  | "claim_business_complete"
  | "share_business"

  // Rating
  | "rate_start"
  | "rate_complete"
  | "rate_abandon"
  | "rate_photo_add"

  // Challenger
  | "view_challenger"
  | "challenger_share_text"
  | "challenger_share_image"
  | "challenger_enter_start"
  | "challenger_enter_complete"

  // Profile & Trust
  | "view_profile"
  | "tier_upgrade"
  | "view_saved"

  // Revenue
  | "dashboard_view"
  | "dashboard_upgrade_tap"
  | "featured_placement_tap"

  // Moderation
  | "report_start"
  | "report_complete"

  // Notifications
  | "notification_tap"
  | "notification_settings_change"

  // Legal
  | "view_terms"
  | "view_privacy"

  // Settings
  | "settings_open"
  | "city_change"

  // Sprint 202: Beta tracking
  | "beta_join_page_view"
  | "beta_join_cta_tap"
  | "beta_signup_with_referral"
  | "beta_referral_share";

interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

// Analytics provider interface — swap implementations for different providers
interface AnalyticsProvider {
  track(event: string, properties?: EventProperties): void;
  identify(userId: string, traits?: EventProperties): void;
  reset(): void;
}

// Console logger for development
const consoleProvider: AnalyticsProvider = {
  track(event, properties) {
    console.log(`[Analytics] ${event}`, properties || "");
  },
  identify(userId, traits) {
    console.log(`[Analytics] identify: ${userId}`, traits || "");
  },
  reset() {
    console.log("[Analytics] reset");
  },
};

// Active provider — swap this for production
let provider: AnalyticsProvider = consoleProvider;

/**
 * Set the analytics provider (call once on app init).
 * In production, pass your Mixpanel/Amplitude/PostHog instance.
 */
export function setAnalyticsProvider(p: AnalyticsProvider): void {
  provider = p;
}

/**
 * Track an event with optional properties.
 */
export function track(event: AnalyticsEvent, properties?: EventProperties): void {
  try {
    provider.track(event, {
      ...properties,
      timestamp: Date.now(),
      platform: typeof navigator !== "undefined" ? "web" : "native",
    });
  } catch (err) {
    // Analytics should never crash the app
    console.warn("[Analytics] track error:", err);
  }
}

/**
 * Identify a user (call after login/signup).
 */
export function identify(userId: string, traits?: EventProperties): void {
  try {
    provider.identify(userId, traits);
  } catch (err) {
    console.warn("[Analytics] identify error:", err);
  }
}

/**
 * Reset analytics state (call on logout).
 */
export function resetAnalytics(): void {
  try {
    provider.reset();
  } catch (err) {
    console.warn("[Analytics] reset error:", err);
  }
}

// ─── Convenience Functions ───────────────────────────────────

export const Analytics = {
  // Discovery
  searchQuery: (query: string, resultsCount: number) =>
    track("search_query", { query, results_count: resultsCount }),

  filterTap: (filter: string) =>
    track("filter_tap", { filter }),

  nearMeTap: () =>
    track("near_me_tap"),

  sortChange: (sortBy: string) =>
    track("sort_change", { sort_by: sortBy }),

  // Business
  viewBusiness: (slug: string, category: string) =>
    track("view_business", { slug, category }),

  bookmarkAdd: (slug: string) =>
    track("bookmark_add", { slug }),

  bookmarkRemove: (slug: string) =>
    track("bookmark_remove", { slug }),

  shareBusiness: (slug: string, method: string) =>
    track("share_business", { slug, method }),

  // Rating
  rateStart: (businessSlug: string) =>
    track("rate_start", { business: businessSlug }),

  rateComplete: (businessSlug: string, score: number) =>
    track("rate_complete", { business: businessSlug, score }),

  rateAbandon: (businessSlug: string, step: number) =>
    track("rate_abandon", { business: businessSlug, step }),

  // Challenger
  challengerShareText: (challengeId: string) =>
    track("challenger_share_text", { challenge_id: challengeId }),

  challengerShareImage: (challengeId: string) =>
    track("challenger_share_image", { challenge_id: challengeId }),

  // Revenue
  dashboardProViewed: (slug: string) =>
    track("dashboard_view", { slug, tier: "pro" }),

  featuredViewed: (slug: string) =>
    track("featured_placement_tap", { slug, source: "featured_section" }),

  dashboardUpgradeTap: (businessSlug: string) =>
    track("dashboard_upgrade_tap", { business: businessSlug }),

  challengerEnterStart: (businessSlug: string) =>
    track("challenger_enter_start", { business: businessSlug }),

  // Moderation
  reportComplete: (targetType: string, reason: string) =>
    track("report_complete", { target_type: targetType, reason }),

  // Auth
  signupComplete: (method: string) =>
    track("signup_complete", { method }),

  loginComplete: (method: string) =>
    track("login_complete", { method }),

  // Sprint 202: Beta tracking
  betaJoinPageView: (referralCode?: string) =>
    track("beta_join_page_view", { referral_code: referralCode || "none" }),

  betaJoinCtaTap: (referralCode?: string) =>
    track("beta_join_cta_tap", { referral_code: referralCode || "none" }),

  betaSignupWithReferral: (referralCode: string) =>
    track("beta_signup_with_referral", { referral_code: referralCode }),

  betaReferralShare: (method: string) =>
    track("beta_referral_share", { method }),
};
