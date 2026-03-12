/**
 * Sprint 732 — App Store Metadata
 * Centralized store listing content for iOS App Store and Google Play.
 * Owner: Jasmine Taylor (Marketing)
 *
 * Usage: Reference during App Store Connect / Play Console submission.
 * These strings are NOT bundled into the app — they're submission metadata.
 */

export const APP_STORE_METADATA = {
  // ── App Store Connect Fields ──
  name: "TopRanker — Best In Your City",
  subtitle: "Best specific thing nearby",
  promotionalText: "Best biryani in Irving? Best chai in Plano? Real rankings from real people — no ads, no pay-to-play.",
  description: [
    "TopRanker is a trustworthy ranking app that answers one question: What's the BEST specific thing in your city?",
    "",
    "Best biryani in Irving. Best chai in Plano. Best dosa in Frisco. Real rankings powered by structured ratings from real people — not vague reviews, not paid placements.",
    "",
    "HOW IT WORKS:",
    "• Rate restaurants with structured scores (food, service, vibe)",
    "• See live leaderboards that update with every rating",
    "• Rankings are weighted by rater credibility — not volume",
    "• Different visit types (dine-in, delivery, takeaway) have different scoring",
    "",
    "WHY TOPRANKER IS DIFFERENT:",
    "• No paid placements — rankings are 100% merit-based",
    "• Credibility-weighted scores — experienced raters matter more",
    "• Specific rankings — not 'best restaurant' but 'best biryani'",
    "• Live leaderboard — rankings change as new ratings come in",
    "• Anti-gaming protection — velocity detection, pattern analysis",
    "",
    "STARTING IN DALLAS:",
    "TopRanker launches with Indian restaurants in the Dallas-Fort Worth area. Irving, Plano, Frisco, Richardson — find the best of the best.",
    "",
    "Rate. Rank. Discover the best in your city.",
  ].join("\n"),
  keywords: "restaurants,rankings,food,best,biryani,indian,dallas,irving,plano,rating,leaderboard,reviews",
  primaryCategory: "Food & Drink",
  secondaryCategory: "Lifestyle",
  contentRating: "4+",
  privacyPolicyUrl: "https://topranker.io/privacy",
  supportUrl: "https://topranker.io/support",
  marketingUrl: "https://topranker.io",

  // ── Screenshot Specifications ──
  screenshots: {
    iphone67: {
      label: "iPhone 6.7\" (iPhone 15 Pro Max, 14 Pro Max)",
      resolution: "1290 x 2796",
      required: true,
      count: 6,
      scenes: [
        "Rankings leaderboard — top restaurants with rank, score, movement",
        "Business detail — hero photo, rating breakdown, trust badge",
        "Rate flow — structured scoring with visit type selection",
        "Discover — search, category chips, Google Maps integration",
        "Dish leaderboard — best biryani in Irving",
        "Profile — tier progress, rating history",
      ],
    },
    iphone55: {
      label: "iPhone 5.5\" (iPhone 8 Plus)",
      resolution: "1242 x 2208",
      required: true,
      count: 6,
      scenes: ["Same 6 scenes as 6.7\", cropped for 5.5\""],
    },
    ipad: {
      label: "iPad Pro 12.9\"",
      resolution: "2048 x 2732",
      required: false,
      count: 0,
      scenes: ["Not required — supportsTablet is false"],
    },
  },

  // ── Version Info ──
  version: "1.0.0",
  buildNumber: "1",
  whatsNewText: "Initial release — rate and rank restaurants in Dallas-Fort Worth.",
} as const;

/**
 * Apple App Site Association (AASA) file content.
 * Must be served at: https://topranker.com/.well-known/apple-app-site-association
 * AND: https://topranker.io/.well-known/apple-app-site-association
 */
export const AASA_CONFIG = {
  applinks: {
    details: [
      {
        appIDs: ["TEAM_ID.com.topranker.app"],
        components: [
          { "/": "/business/*", comment: "Business deep links" },
          { "/": "/dish/*", comment: "Dish deep links" },
          { "/": "/challenger/*", comment: "Challenger deep links" },
          { "/": "/share/*", comment: "Share deep links" },
        ],
      },
    ],
  },
} as const;
