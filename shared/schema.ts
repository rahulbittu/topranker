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
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  lastActive: timestamp("last_active"),
  notificationPrefs: jsonb("notification_prefs"),
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
    ownerId: varchar("owner_id").references(() => members.id),
    isClaimed: boolean("is_claimed").notNull().default(false),
    claimedAt: timestamp("claimed_at"),
    // Sprint 176: Business Pro subscription
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    subscriptionStatus: text("subscription_status").default("none"), // none, active, past_due, cancelled, trialing
    subscriptionPeriodEnd: timestamp("subscription_period_end"),
    isActive: boolean("is_active").notNull().default(true),
    inChallenger: boolean("in_challenger").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_biz_city_cat").on(table.city, table.category),
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

// Sprint 177: Owner responses to ratings
export const ratingResponses = pgTable(
  "rating_responses",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    ratingId: varchar("rating_id")
      .notNull()
      .references(() => ratings.id),
    businessId: varchar("business_id")
      .notNull()
      .references(() => businesses.id),
    ownerId: varchar("owner_id")
      .notNull()
      .references(() => members.id),
    responseText: text("response_text").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_resp_rating").on(table.ratingId),
    index("idx_resp_business").on(table.businessId),
  ],
);

export type RatingResponse = typeof ratingResponses.$inferSelect;

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
    type: text("type").notNull(), // challenger_entry, dashboard_pro, featured_placement
    amount: integer("amount").notNull(), // in cents
    currency: text("currency").notNull().default("usd"),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    status: text("status").notNull().default("pending"), // pending, succeeded, failed, refunded
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

// ── Webhook Events (audit log for all incoming webhooks) ─────────────
export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    source: text("source").notNull(), // stripe, github, etc.
    eventId: text("event_id").notNull(), // Stripe event ID (evt_xxx)
    eventType: text("event_type").notNull(), // payment_intent.succeeded, etc.
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

// ── Featured Placements (active featured business placements) ────────
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
    status: text("status").notNull().default("active"), // active, expired, cancelled
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
    q1Score: z.number().min(1).max(5),
    q2Score: z.number().min(1).max(5),
    q3Score: z.number().min(1).max(5),
    wouldReturn: z.boolean(),
    note: z.string().max(160).optional(),
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

// ── GDPR Deletion Requests (persistent grace period tracking) ────────
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
    status: text("status").notNull().default("pending"), // pending, cancelled, completed
  },
  (table) => [
    index("idx_deletion_member").on(table.memberId),
    index("idx_deletion_status").on(table.status),
  ],
);

export type DeletionRequestRow = typeof deletionRequests.$inferSelect;

// ── Dish Leaderboards — Sprint 166 ─────────────────────────
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
