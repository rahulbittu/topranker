/**
 * Pricing Configuration — Sprint 104
 * Single source of truth for all pricing across the platform.
 * Owner: Rachel Wei (CFO)
 *
 * All amounts in cents (Stripe convention).
 * Display amounts derived from cents for consistency.
 */
export const PRICING = {
  challenger: {
    amountCents: 9900,
    displayAmount: "$99",
    label: "Challenger Entry",
    description: "30-day head-to-head business competition",
    refundable: false,
    type: "one_time" as const,
  },
  dashboardPro: {
    amountCents: 4900,
    displayAmount: "$49/mo",
    label: "Dashboard Pro",
    description: "Advanced analytics and business insights",
    refundable: true,
    type: "recurring" as const,
    interval: "month" as const,
  },
  featuredPlacement: {
    amountCents: 19900,
    displayAmount: "$199/wk",
    label: "Featured Placement",
    description: "Premium visibility in search and rankings",
    refundable: true,
    type: "recurring" as const,
    interval: "week" as const,
  },
} as const;

export type PricingTier = keyof typeof PRICING;
