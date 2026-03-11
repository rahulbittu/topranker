// TopRanker Database Schema — 33 tables
// Domains: CORE | DISHES | COMPETITION | CLAIMS | CATEGORIES | COMMERCE | VALIDATION | DATA MGMT | DISH LB | COMMUNITY | PHOTOS | RECEIPTS
import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  numeric,
  timestamp,
  date,
  jsonb,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
// ── CORE ──
export const members = pgTable("members", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  authId: varchar("auth_id").unique(),
  displayName: text("display_name").notNull(),
  username: text("username").unique().notNull(),
  email: text("email").unique().notNull(),
  password: text("password"),
  avatarUrl: text("avatar_url"),
  city: text("city").notNull().default("Dallas"),
  pushToken: text("push_token"),
  credibilityScore: integer("credibility_score").notNull().default(10),
  credibilityTier: text("credibility_tier").notNull().default("community"),
  totalRatings: integer("total_ratings").notNull().default(0),
  totalCategories: integer("total_categories").notNull().default(0),
  distinctBusinesses: integer("distinct_businesses").notNull().default(0),
  ratingVariance: numeric("rating_variance", { precision: 4, scale: 3 })
    .notNull()
    .default("0"),
  activeFlagCount: integer("active_flag_count").notNull().default(0),
  probationUntil: timestamp("probation_until"),
  isFoundingMember: boolean("is_founding_member").notNull().default(false),
  isBanned: boolean("is_banned").notNull().default(false),
  banReason: text("ban_reason"),
  emailVerified: boolean("email_verified").notNull().default(false),
  emailVerificationToken: text("email_verification_token"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  lastActive: timestamp("last_active"),
  notificationPrefs: jsonb("notification_prefs"),
  notificationFrequencyPrefs: jsonb("notification_frequency_prefs"),
});

export const businesses = pgTable(
  "businesses",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    slug: text("slug").unique().notNull(),
    category: text("category").notNull(),
    cuisine: text("cuisine"),
    dietaryTags: jsonb("dietary_tags").default(sql`'[]'::jsonb`),
    city: text("city").notNull(),
    neighborhood: text("neighborhood"),
    address: text("address"),
    lat: numeric("lat", { precision: 10, scale: 7 }),
    lng: numeric("lng", { precision: 10, scale: 7 }),
    phone: text("phone"),
    website: text("website"),
    instagramHandle: text("instagram_handle"),
    description: text("description"),
    priceRange: text("price_range").default("$$"),
    googlePlaceId: text("google_place_id").unique(),
    googleRating: numeric("google_rating", { precision: 3, scale: 1 }),
    googleMapsUrl: text("google_maps_url"),
    openingHours: jsonb("opening_hours"),
    isOpenNow: boolean("is_open_now").notNull().default(false),
    hoursLastUpdated: timestamp("hours_last_updated"),
    dataSource: text("data_source").default("google_import"),
    photoUrl: text("photo_url"),
    weightedScore: numeric("weighted_score", { precision: 6, scale: 3 })
      .notNull()
      .default("0"),
    rawAvgScore: numeric("raw_avg_score", { precision: 4, scale: 2 })
      .notNull()
      .default("0"),
    rankPosition: integer("rank_position"),
    rankDelta: integer("rank_delta").notNull().default(0),
    prevRankPosition: integer("prev_rank_position"),
    totalRatings: integer("total_ratings").notNull().default(0),
    dineInCount: integer("dine_in_count").notNull().default(0),
    credibilityWeightedSum: numeric("credibility_weighted_sum", { precision: 8, scale: 4 }).notNull().default("0"),
    leaderboardEligible: boolean("leaderboard_eligible").notNull().default(false),
    ownerId: varchar("owner_id").references(() => members.id),
    isClaimed: boolean("is_claimed").notNull().default(false),
    claimedAt: timestamp("claimed_at"),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    subscriptionStatus: text("subscription_status").default("none"),
    subscriptionPeriodEnd: timestamp("subscription_period_end"),
    isActive: boolean("is_active").notNull().default(true),
    inChallenger: boolean("in_challenger").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_biz_city_cat").on(table.city, table.category),
    index("idx_biz_cuisine").on(table.city, table.cuisine),
    index("idx_biz_score").on(table.weightedScore),
    index("idx_biz_rank").on(table.city, table.category, table.rankPosition),
    index("idx_biz_slug").on(table.slug),
    index("idx_biz_google_place").on(table.googlePlaceId),
  ],
);

export const ratings = pgTable(
  "ratings",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    memberId: varchar("member_id")
      .notNull()
      .references(() => members.id),
    businessId: varchar("business_id")
      .notNull()
      .references(() => businesses.id),
    q1Score: integer("q1_score").notNull(),
    q2Score: integer("q2_score").notNull(),
    q3Score: integer("q3_score").notNull(),
    wouldReturn: boolean("would_return").notNull(),
    note: text("note"),
    visitType: text("visit_type").default("dine_in"),
    foodScore: numeric("food_score", { precision: 3, scale: 1 }),
    serviceScore: numeric("service_score", { precision: 3, scale: 1 }),
    vibeScore: numeric("vibe_score", { precision: 3, scale: 1 }),
    packagingScore: numeric("packaging_score", { precision: 3, scale: 1 }),
    waitTimeScore: numeric("wait_time_score", { precision: 3, scale: 1 }),
    valueScore: numeric("value_score", { precision: 3, scale: 1 }),
    compositeScore: numeric("composite_score", { precision: 4, scale: 2 }),
    hasPhoto: boolean("has_photo").notNull().default(false),
    hasReceipt: boolean("has_receipt").notNull().default(false),
    dishFieldCompleted: boolean("dish_field_completed").notNull().default(false),
    verificationBoost: numeric("verification_boost", { precision: 4, scale: 3 }).notNull().default("0"),
    effectiveWeight: numeric("effective_weight", { precision: 6, scale: 4 }),
    gamingMultiplier: numeric("gaming_multiplier", { precision: 3, scale: 2 }).notNull().default("1.00"),
    gamingReason: text("gaming_reason"),
    timeOnPageMs: integer("time_on_page_ms"),
    rawScore: numeric("raw_score", { precision: 4, scale: 2 }).notNull(),
    weight: numeric("weight", { precision: 5, scale: 4 }).notNull(),
    weightedScore: numeric("weighted_score", { precision: 6, scale: 4 }).notNull(),
    isFlagged: boolean("is_flagged").notNull().default(false),
    autoFlagged: boolean("auto_flagged").notNull().default(false),
    flagReason: text("flag_reason"),
    flagProbability: integer("flag_probability"),
    source: text("source").default("app"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_rat_business").on(table.businessId, table.createdAt),
    index("idx_rat_member").on(table.memberId, table.createdAt),
  ],
);
// ── DISHES ──
export const dishes = pgTable(
  "dishes",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    businessId: varchar("business_id")
      .notNull()
      .references(() => businesses.id),
    name: text("name").notNull(),
    nameNormalized: text("name_normalized").notNull(),
    suggestedBy: text("suggested_by").notNull().default("community"),
    voteCount: integer("vote_count").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    unique("unique_dish_per_business").on(table.businessId, table.nameNormalized),
    index("idx_dish_biz_votes").on(table.businessId, table.voteCount),
  ],
);

export const dishVotes = pgTable("dish_votes", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  ratingId: varchar("rating_id")
    .notNull()
    .references(() => ratings.id),
  dishId: varchar("dish_id").references(() => dishes.id),
  memberId: varchar("member_id")
    .notNull()
    .references(() => members.id),
  businessId: varchar("business_id")
    .notNull()
    .references(() => businesses.id),
  noNotableDish: boolean("no_notable_dish").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
// ── COMPETITION ──
export const challengers = pgTable(
  "challengers",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    challengerId: varchar("challenger_id")
      .notNull()
      .references(() => businesses.id),
    defenderId: varchar("defender_id")
      .notNull()
      .references(() => businesses.id),
    category: text("category").notNull(),
    city: text("city").notNull(),
    entryFeePaid: boolean("entry_fee_paid").notNull().default(false),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    startDate: timestamp("start_date").notNull().defaultNow(),
    endDate: timestamp("end_date").notNull(),
    challengerWeightedVotes: numeric("challenger_weighted_votes", {
      precision: 10,
      scale: 3,
    })
      .notNull()
      .default("0"),
    defenderWeightedVotes: numeric("defender_weighted_votes", {
      precision: 10,
      scale: 3,
    })
      .notNull()
      .default("0"),
    totalVotes: integer("total_votes").notNull().default(0),
    status: text("status").notNull().default("pending"),
    winnerId: varchar("winner_id").references(() => businesses.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_challenger_active").on(table.city, table.category, table.status),
  ],
);

export const rankHistory = pgTable(
  "rank_history",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    businessId: varchar("business_id")
      .notNull()
      .references(() => businesses.id),
    rankPosition: integer("rank_position").notNull(),
    weightedScore: numeric("weighted_score", { precision: 6, scale: 3 }).notNull(),
    snapshotDate: date("snapshot_date")
      .notNull()
      .default(sql`current_date`),
  },
  (table) => [
    unique("unique_business_snapshot").on(table.businessId, table.snapshotDate),
    index("idx_rank_hist").on(table.businessId, table.snapshotDate),
  ],
);
// ── CLAIMS & MODERATION ──
export const businessClaims = pgTable("business_claims", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  businessId: varchar("business_id")
    .notNull()
    .references(() => businesses.id),
  memberId: varchar("member_id")
    .notNull()
    .references(() => members.id),
  verificationMethod: text("verification_method").notNull(),
  verificationCode: text("verification_code"),
  codeExpiresAt: timestamp("code_expires_at"),
  attempts: integer("attempts").notNull().default(0),
  status: text("status").notNull().default("pending"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
});

export const claimEvidence = pgTable(
  "claim_evidence",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    claimId: varchar("claim_id")
      .notNull()
      .references(() => businessClaims.id),
    documents: jsonb("documents").notNull().default(sql`'[]'::jsonb`),
    businessNameMatch: boolean("business_name_match").notNull().default(false),
    addressMatch: boolean("address_match").notNull().default(false),
    phoneMatch: boolean("phone_match").notNull().default(false),
    verificationScore: integer("verification_score").notNull().default(0),
    autoApproved: boolean("auto_approved").notNull().default(false),
    reviewNotes: jsonb("review_notes").notNull().default(sql`'[]'::jsonb`),
    scoredAt: timestamp("scored_at").notNull().defaultNow(),
  },
  (table) => [
    unique("unique_claim_evidence").on(table.claimId),
    index("idx_evidence_claim").on(table.claimId),
  ],
);

export const businessPhotos = pgTable(
  "business_photos",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    businessId: varchar("business_id")
      .notNull()
      .references(() => businesses.id),
    photoUrl: text("photo_url").notNull(),
    isHero: boolean("is_hero").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    uploadedBy: varchar("uploaded_by").references(() => members.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_biz_photos_business").on(table.businessId, table.sortOrder),
  ],
);

export const qrScans = pgTable(
  "qr_scans",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    businessId: varchar("business_id")
      .notNull()
      .references(() => businesses.id),
    memberId: varchar("member_id").references(() => members.id),
    converted: boolean("converted").notNull().default(false),
    scannedAt: timestamp("scanned_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_qr_biz").on(table.businessId, table.scannedAt),
  ],
);

export const ratingFlags = pgTable(
  "rating_flags",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    ratingId: varchar("rating_id")
      .notNull()
      .references(() => ratings.id),
    flaggerId: varchar("flagger_id")
      .notNull()
      .references(() => members.id),
    q1NoSpecificExperience: boolean("q1_no_specific_experience").notNull(),
    q2ScoreMismatchNote: boolean("q2_score_mismatch_note").notNull(),
    q3InsiderSuspected: boolean("q3_insider_suspected").notNull(),
    q4CoordinatedPattern: boolean("q4_coordinated_pattern").notNull(),
    q5CompetitorBombing: boolean("q5_competitor_bombing"),
    explanation: text("explanation"),
    aiFraudProbability: integer("ai_fraud_probability"),
    aiReasoning: text("ai_reasoning"),
    status: text("status").notNull().default("pending"),
    reviewedBy: varchar("reviewed_by").references(() => members.id),
    reviewedAt: timestamp("reviewed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    unique("unique_flag_per_member").on(table.ratingId, table.flaggerId),
    index("idx_flags_rating").on(table.ratingId),
    index("idx_flags_pending").on(table.status),
  ],
);

export const memberBadges = pgTable(
  "member_badges",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    memberId: varchar("member_id")
      .notNull()
      .references(() => members.id),
    badgeId: text("badge_id").notNull(),
    badgeFamily: text("badge_family").notNull(),
    earnedAt: timestamp("earned_at").notNull().defaultNow(),
  },
  (table) => [
    unique("unique_badge_per_member").on(table.memberId, table.badgeId),
    index("idx_badges_member").on(table.memberId),
  ],
);

export const credibilityPenalties = pgTable(
  "credibility_penalties",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    memberId: varchar("member_id")
      .notNull()
      .references(() => members.id),
    ratingFlagId: varchar("rating_flag_id").references(() => ratingFlags.id),
    basePenalty: integer("base_penalty").notNull(),
    historyMult: numeric("history_mult", { precision: 3, scale: 1 }).notNull(),
    patternMult: numeric("pattern_mult", { precision: 3, scale: 1 }).notNull(),
    finalPenalty: integer("final_penalty").notNull(),
    severity: text("severity").notNull(),
    appliedAt: timestamp("applied_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_penalties_member").on(table.memberId),
  ],
);
// ── CATEGORIES ──
export const categories = pgTable("categories", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  slug: text("slug").unique().notNull(),
  label: text("label").notNull(),
  emoji: text("emoji").notNull(),
  vertical: text("vertical").notNull(),
  atAGlanceFields: jsonb("at_a_glance_fields").notNull().default(sql`'[]'::jsonb`),
  scoringHints: jsonb("scoring_hints").notNull().default(sql`'[]'::jsonb`),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const categorySuggestions = pgTable("category_suggestions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  vertical: text("vertical").notNull(),
  suggestedBy: varchar("suggested_by")
    .notNull()
    .references(() => members.id),
  status: text("status").notNull().default("pending"),
  voteCount: integer("vote_count").notNull().default(1),
  reviewedBy: varchar("reviewed_by").references(() => members.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
// ── COMMERCE ──
export const payments = pgTable(
  "payments",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    memberId: varchar("member_id")
      .notNull()
      .references(() => members.id),
    businessId: varchar("business_id")
      .references(() => businesses.id),
    type: text("type").notNull(),
    amount: integer("amount").notNull(),
    currency: text("currency").notNull().default("usd"),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    status: text("status").notNull().default("pending"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at"),
  },
  (table) => [
    index("idx_payments_member").on(table.memberId),
    index("idx_payments_business").on(table.businessId),
    index("idx_payments_status").on(table.status),
  ],
);
export type Payment = typeof payments.$inferSelect;
// ── Webhook Events (audit log for all incoming webhooks) ──
export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    source: text("source").notNull(),
    eventId: text("event_id").notNull(),
    eventType: text("event_type").notNull(),
    payload: jsonb("payload").notNull(),
    processed: boolean("processed").notNull().default(false),
    error: text("error"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_webhook_events_source").on(table.source),
    index("idx_webhook_events_event_id").on(table.eventId),
  ],
);
export type WebhookEvent = typeof webhookEvents.$inferSelect;
// ── Featured Placements (active featured business placements) ──
export const featuredPlacements = pgTable(
  "featured_placements",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    businessId: varchar("business_id")
      .notNull()
      .references(() => businesses.id),
    paymentId: varchar("payment_id")
      .references(() => payments.id),
    city: text("city").notNull(),
    startsAt: timestamp("starts_at").notNull().defaultNow(),
    expiresAt: timestamp("expires_at").notNull(),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_featured_business").on(table.businessId),
    index("idx_featured_city_status").on(table.city, table.status),
    index("idx_featured_expires").on(table.expiresAt),
  ],
);
export type FeaturedPlacement = typeof featuredPlacements.$inferSelect;
export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    event: text("event").notNull(),
    userId: varchar("user_id").references(() => members.id),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_analytics_event").on(table.event),
    index("idx_analytics_user").on(table.userId),
    index("idx_analytics_created").on(table.createdAt),
  ],
);
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export const insertMemberSchema = createInsertSchema(members).pick({
  displayName: true,
  username: true,
  email: true,
  password: true,
  city: true,
}).extend({
  password: z.string().optional(),
});

export const insertRatingSchema = createInsertSchema(ratings)
  .pick({
    businessId: true,
    q1Score: true,
    q2Score: true,
    q3Score: true,
    wouldReturn: true,
    note: true,
  })
  .extend({
    q1Score: z.number().int().min(1).max(5),
    q2Score: z.number().int().min(1).max(5),
    q3Score: z.number().int().min(1).max(5),
    wouldReturn: z.boolean(),
    visitType: z.enum(["dine_in", "delivery", "takeaway"]),
    timeOnPageMs: z.number().int().min(0).max(3600000).optional(),
    note: z.string().max(2000).optional().transform(val => val ? val.replace(/<[^>]*>/g, "").trim() : val),
    dishId: z.string().optional(),
    newDishName: z.string().max(50).optional(),
    noNotableDish: z.boolean().optional(),
    qrScanId: z.string().optional(),
  });

export type Member = typeof members.$inferSelect;
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Business = typeof businesses.$inferSelect;
export type Rating = typeof ratings.$inferSelect;
export type Dish = typeof dishes.$inferSelect;
export type DishVote = typeof dishVotes.$inferSelect;
export type Challenger = typeof challengers.$inferSelect;
export type RankHistory = typeof rankHistory.$inferSelect;
export type BusinessClaim = typeof businessClaims.$inferSelect;
export type BusinessPhoto = typeof businessPhotos.$inferSelect;
export type QrScan = typeof qrScans.$inferSelect;
export type RatingFlag = typeof ratingFlags.$inferSelect;
export type MemberBadge = typeof memberBadges.$inferSelect;
export type CredibilityPenalty = typeof credibilityPenalties.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type CategorySuggestionRow = typeof categorySuggestions.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;
// ── GDPR Deletion Requests (persistent grace period tracking) ──
export const deletionRequests = pgTable(
  "deletion_requests",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    memberId: varchar("member_id")
      .notNull()
      .references(() => members.id),
    requestedAt: timestamp("requested_at").notNull().defaultNow(),
    scheduledDeletionAt: timestamp("scheduled_deletion_at").notNull(),
    cancelledAt: timestamp("cancelled_at"),
    completedAt: timestamp("completed_at"),
    status: text("status").notNull().default("pending"),
  },
  (table) => [
    index("idx_deletion_member").on(table.memberId),
    index("idx_deletion_status").on(table.status),
  ],
);
export type DeletionRequestRow = typeof deletionRequests.$inferSelect;
// ── Dish Leaderboards — Sprint 166 ──
export const dishLeaderboards = pgTable(
  "dish_leaderboards",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    city: text("city").notNull(),
    dishName: text("dish_name").notNull(),
    dishSlug: text("dish_slug").notNull(),
    dishEmoji: text("dish_emoji"),
    status: text("status").notNull().default("active"),
    minRatingCount: integer("min_rating_count").notNull().default(5),
    displayOrder: integer("display_order").notNull().default(0),
    source: text("source").notNull().default("system"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    unique("unique_dish_city").on(table.city, table.dishSlug),
    index("idx_dish_lb_city").on(table.city, table.status),
  ],
);
export type DishLeaderboard = typeof dishLeaderboards.$inferSelect;
export const dishLeaderboardEntries = pgTable(
  "dish_leaderboard_entries",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    leaderboardId: varchar("leaderboard_id")
      .notNull()
      .references(() => dishLeaderboards.id),
    businessId: varchar("business_id")
      .notNull()
      .references(() => businesses.id),
    dishScore: numeric("dish_score", { precision: 5, scale: 2 }).notNull().default("0"),
    dishRatingCount: integer("dish_rating_count").notNull().default(0),
    rankPosition: integer("rank_position").notNull().default(0),
    previousRank: integer("previous_rank"),
    photoUrl: text("photo_url"),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    unique("unique_entry_lb_biz").on(table.leaderboardId, table.businessId),
    index("idx_dish_entry_lb_rank").on(table.leaderboardId, table.rankPosition),
  ],
);
export type DishLeaderboardEntry = typeof dishLeaderboardEntries.$inferSelect;
export const dishSuggestions = pgTable(
  "dish_suggestions",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    city: text("city").notNull(),
    dishName: text("dish_name").notNull(),
    suggestedBy: varchar("suggested_by")
      .notNull()
      .references(() => members.id),
    voteCount: integer("vote_count").notNull().default(1),
    status: text("status").notNull().default("proposed"),
    activationThreshold: integer("activation_threshold").notNull().default(10),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_dish_sugg_city").on(table.city, table.voteCount),
  ],
);
export type DishSuggestion = typeof dishSuggestions.$inferSelect;
export const dishSuggestionVotes = pgTable("dish_suggestion_votes", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  suggestionId: varchar("suggestion_id")
    .notNull()
    .references(() => dishSuggestions.id),
  memberId: varchar("member_id")
    .notNull()
    .references(() => members.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDishSuggestionSchema = z.object({
  city: z.string().min(2).max(50),
  dishName: z.string().min(2).max(40),
});

export const insertCategorySuggestionSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().min(10).max(200),
  vertical: z.enum(["food", "services", "wellness", "entertainment", "retail"]),
});
// ── In-App Notifications — Sprint 182 ──
export const notifications = pgTable(
  "notifications",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    memberId: varchar("member_id")
      .notNull()
      .references(() => members.id),
    type: text("type").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    data: jsonb("data"),
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_notif_member").on(table.memberId),
    index("idx_notif_member_read").on(table.memberId, table.read),
  ],
);
export type Notification = typeof notifications.$inferSelect;
export const referrals = pgTable(
  "referrals",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    referrerId: varchar("referrer_id")
      .notNull()
      .references(() => members.id),
    referredId: varchar("referred_id")
      .notNull()
      .references(() => members.id),
    referralCode: text("referral_code").notNull(),
    status: text("status").notNull().default("signed_up"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    activatedAt: timestamp("activated_at"),
  },
  (table) => [
    index("idx_referral_referrer").on(table.referrerId),
    index("idx_referral_referred").on(table.referredId),
    unique("uq_referral_referred").on(table.referredId), // one referrer per user
  ],
);
export type Referral = typeof referrals.$inferSelect;
export const betaInvites = pgTable(
  "beta_invites",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    email: text("email").notNull(),
    displayName: text("display_name").notNull(),
    referralCode: text("referral_code").notNull().default("BETA25"),
    invitedBy: text("invited_by"),
    status: text("status").notNull().default("sent"),
    sentAt: timestamp("sent_at").notNull().defaultNow(),
    joinedAt: timestamp("joined_at"),
    memberId: varchar("member_id").references(() => members.id),
  },
  (table) => [
    index("idx_beta_invite_email").on(table.email),
    unique("uq_beta_invite_email").on(table.email),
  ],
);
export type BetaInvite = typeof betaInvites.$inferSelect;
export const userActivity = pgTable(
  "user_activity",
  {
    userId: varchar("user_id")
      .primaryKey()
      .references(() => members.id),
    lastSeenAt: timestamp("last_seen_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_user_activity_last_seen").on(table.lastSeenAt),
  ],
);
export type UserActivity = typeof userActivity.$inferSelect;
export const betaFeedback = pgTable(
  "beta_feedback",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    memberId: varchar("member_id").references(() => members.id),
    rating: integer("rating").notNull(),
    category: text("category").notNull(),
    message: text("message").notNull(),
    screenContext: text("screen_context"),
    appVersion: text("app_version"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_beta_feedback_member").on(table.memberId),
    index("idx_beta_feedback_created").on(table.createdAt),
  ],
);
export type BetaFeedback = typeof betaFeedback.$inferSelect;
// ── PHOTOS ──
export const ratingPhotos = pgTable(
  "rating_photos",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    ratingId: varchar("rating_id")
      .notNull()
      .references(() => ratings.id),
    photoUrl: text("photo_url").notNull(),
    cdnKey: text("cdn_key").notNull(),
    contentHash: varchar("content_hash", { length: 64 }),
    perceptualHash: varchar("perceptual_hash", { length: 16 }),
    isVerifiedReceipt: boolean("is_verified_receipt").notNull().default(false),
    uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_rating_photos_rating").on(table.ratingId),
  ],
);
export type RatingPhoto = typeof ratingPhotos.$inferSelect;
export const photoSubmissions = pgTable(
  "photo_submissions",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    businessId: varchar("business_id")
      .notNull()
      .references(() => businesses.id),
    memberId: varchar("member_id")
      .notNull()
      .references(() => members.id),
    url: text("url").notNull(),
    caption: text("caption").notNull().default(""),
    status: text("status").notNull().default("pending"),
    rejectionReason: text("rejection_reason"),
    moderatorId: varchar("moderator_id").references(() => members.id),
    moderatorNote: text("moderator_note"),
    fileSize: integer("file_size").notNull(),
    mimeType: text("mime_type").notNull(),
    submittedAt: timestamp("submitted_at").notNull().defaultNow(),
    reviewedAt: timestamp("reviewed_at"),
  },
  (table) => [
    index("idx_photo_sub_business").on(table.businessId),
    index("idx_photo_sub_member").on(table.memberId),
    index("idx_photo_sub_status").on(table.status),
    index("idx_photo_sub_submitted").on(table.submittedAt),
  ],
);
export type PhotoSubmission = typeof photoSubmissions.$inferSelect;
// ── RECEIPT ANALYSIS (Sprint 542: OCR Prep) ──
export const receiptAnalysis = pgTable(
  "receipt_analysis",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    ratingPhotoId: varchar("rating_photo_id")
      .notNull()
      .references(() => ratingPhotos.id),
    ratingId: varchar("rating_id")
      .notNull()
      .references(() => ratings.id),
    businessId: varchar("business_id")
      .notNull()
      .references(() => businesses.id),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    extractedBusinessName: text("extracted_business_name"),
    extractedAmount: numeric("extracted_amount"),
    extractedDate: timestamp("extracted_date"),
    extractedItems: text("extracted_items"),
    confidence: numeric("confidence"),
    matchScore: numeric("match_score"),
    reviewedBy: varchar("reviewed_by").references(() => members.id),
    reviewedAt: timestamp("reviewed_at"),
    reviewNote: text("review_note"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_receipt_analysis_rating").on(table.ratingId),
    index("idx_receipt_analysis_status").on(table.status),
  ],
);
export type ReceiptAnalysis = typeof receiptAnalysis.$inferSelect;
