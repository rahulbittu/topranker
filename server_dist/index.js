var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc17) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key2 of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key2) && key2 !== except)
        __defProp(to, key2, { get: () => from[key2], enumerable: !(desc17 = __getOwnPropDesc(from, key2)) || desc17.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  analyticsEvents: () => analyticsEvents,
  betaFeedback: () => betaFeedback,
  betaInvites: () => betaInvites,
  businessClaims: () => businessClaims,
  businessPhotos: () => businessPhotos,
  businesses: () => businesses,
  categories: () => categories,
  categorySuggestions: () => categorySuggestions,
  challengers: () => challengers,
  credibilityPenalties: () => credibilityPenalties,
  deletionRequests: () => deletionRequests,
  dishLeaderboardEntries: () => dishLeaderboardEntries,
  dishLeaderboards: () => dishLeaderboards,
  dishSuggestionVotes: () => dishSuggestionVotes,
  dishSuggestions: () => dishSuggestions,
  dishVotes: () => dishVotes,
  dishes: () => dishes,
  featuredPlacements: () => featuredPlacements,
  insertCategorySuggestionSchema: () => insertCategorySuggestionSchema,
  insertDishSuggestionSchema: () => insertDishSuggestionSchema,
  insertMemberSchema: () => insertMemberSchema,
  insertRatingSchema: () => insertRatingSchema,
  memberBadges: () => memberBadges,
  members: () => members,
  notifications: () => notifications,
  payments: () => payments,
  photoSubmissions: () => photoSubmissions,
  qrScans: () => qrScans,
  rankHistory: () => rankHistory,
  ratingFlags: () => ratingFlags,
  ratingPhotos: () => ratingPhotos,
  ratings: () => ratings,
  referrals: () => referrals,
  userActivity: () => userActivity,
  webhookEvents: () => webhookEvents
});
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
  index
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var members, businesses, ratings, dishes, dishVotes, challengers, rankHistory, businessClaims, businessPhotos, qrScans, ratingFlags, memberBadges, credibilityPenalties, categories, categorySuggestions, payments, webhookEvents, featuredPlacements, analyticsEvents, insertMemberSchema, insertRatingSchema, deletionRequests, dishLeaderboards, dishLeaderboardEntries, dishSuggestions, dishSuggestionVotes, insertDishSuggestionSchema, insertCategorySuggestionSchema, notifications, referrals, betaInvites, userActivity, betaFeedback, ratingPhotos, photoSubmissions;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    members = pgTable("members", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
      ratingVariance: numeric("rating_variance", { precision: 4, scale: 3 }).notNull().default("0"),
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
      notificationPrefs: jsonb("notification_prefs")
    });
    businesses = pgTable(
      "businesses",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        name: text("name").notNull(),
        slug: text("slug").unique().notNull(),
        category: text("category").notNull(),
        cuisine: text("cuisine"),
        // Sprint 286: indian, mexican, japanese, etc.
        dietaryTags: jsonb("dietary_tags").default(sql`'[]'::jsonb`),
        // Sprint 442: ["vegetarian","vegan","halal","gluten_free"]
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
        weightedScore: numeric("weighted_score", { precision: 6, scale: 3 }).notNull().default("0"),
        rawAvgScore: numeric("raw_avg_score", { precision: 4, scale: 2 }).notNull().default("0"),
        rankPosition: integer("rank_position"),
        rankDelta: integer("rank_delta").notNull().default(0),
        prevRankPosition: integer("prev_rank_position"),
        totalRatings: integer("total_ratings").notNull().default(0),
        // Sprint 273: Leaderboard eligibility tracking
        dineInCount: integer("dine_in_count").notNull().default(0),
        credibilityWeightedSum: numeric("credibility_weighted_sum", { precision: 8, scale: 4 }).notNull().default("0"),
        leaderboardEligible: boolean("leaderboard_eligible").notNull().default(false),
        ownerId: varchar("owner_id").references(() => members.id),
        isClaimed: boolean("is_claimed").notNull().default(false),
        claimedAt: timestamp("claimed_at"),
        // Sprint 176: Business Pro subscription
        stripeCustomerId: text("stripe_customer_id"),
        stripeSubscriptionId: text("stripe_subscription_id"),
        subscriptionStatus: text("subscription_status").default("none"),
        // none, active, past_due, cancelled, trialing
        subscriptionPeriodEnd: timestamp("subscription_period_end"),
        isActive: boolean("is_active").notNull().default(true),
        inChallenger: boolean("in_challenger").notNull().default(false),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow()
      },
      (table) => [
        index("idx_biz_city_cat").on(table.city, table.category),
        index("idx_biz_cuisine").on(table.city, table.cuisine),
        index("idx_biz_score").on(table.weightedScore),
        index("idx_biz_rank").on(table.city, table.category, table.rankPosition),
        index("idx_biz_slug").on(table.slug),
        index("idx_biz_google_place").on(table.googlePlaceId)
      ]
    );
    ratings = pgTable(
      "ratings",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        memberId: varchar("member_id").notNull().references(() => members.id),
        businessId: varchar("business_id").notNull().references(() => businesses.id),
        q1Score: integer("q1_score").notNull(),
        q2Score: integer("q2_score").notNull(),
        q3Score: integer("q3_score").notNull(),
        wouldReturn: boolean("would_return").notNull(),
        note: text("note"),
        // Sprint 267: Visit type + dimensional scores (Rating Integrity Part 7)
        visitType: text("visit_type").default("dine_in"),
        // dine_in, delivery, takeaway
        foodScore: numeric("food_score", { precision: 3, scale: 1 }),
        serviceScore: numeric("service_score", { precision: 3, scale: 1 }),
        vibeScore: numeric("vibe_score", { precision: 3, scale: 1 }),
        packagingScore: numeric("packaging_score", { precision: 3, scale: 1 }),
        waitTimeScore: numeric("wait_time_score", { precision: 3, scale: 1 }),
        valueScore: numeric("value_score", { precision: 3, scale: 1 }),
        compositeScore: numeric("composite_score", { precision: 4, scale: 2 }),
        // Sprint 267: Verification signals (Rating Integrity Part 4)
        hasPhoto: boolean("has_photo").notNull().default(false),
        hasReceipt: boolean("has_receipt").notNull().default(false),
        dishFieldCompleted: boolean("dish_field_completed").notNull().default(false),
        verificationBoost: numeric("verification_boost", { precision: 4, scale: 3 }).notNull().default("0"),
        // Sprint 267: Effective weight (credibility x verification x gaming)
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
        createdAt: timestamp("created_at").notNull().defaultNow()
      },
      (table) => [
        index("idx_rat_business").on(table.businessId, table.createdAt),
        index("idx_rat_member").on(table.memberId, table.createdAt)
      ]
    );
    dishes = pgTable(
      "dishes",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        businessId: varchar("business_id").notNull().references(() => businesses.id),
        name: text("name").notNull(),
        nameNormalized: text("name_normalized").notNull(),
        suggestedBy: text("suggested_by").notNull().default("community"),
        voteCount: integer("vote_count").notNull().default(0),
        isActive: boolean("is_active").notNull().default(true),
        createdAt: timestamp("created_at").notNull().defaultNow()
      },
      (table) => [
        unique("unique_dish_per_business").on(table.businessId, table.nameNormalized),
        index("idx_dish_biz_votes").on(table.businessId, table.voteCount)
      ]
    );
    dishVotes = pgTable("dish_votes", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      ratingId: varchar("rating_id").notNull().references(() => ratings.id),
      dishId: varchar("dish_id").references(() => dishes.id),
      memberId: varchar("member_id").notNull().references(() => members.id),
      businessId: varchar("business_id").notNull().references(() => businesses.id),
      noNotableDish: boolean("no_notable_dish").notNull().default(false),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    challengers = pgTable(
      "challengers",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        challengerId: varchar("challenger_id").notNull().references(() => businesses.id),
        defenderId: varchar("defender_id").notNull().references(() => businesses.id),
        category: text("category").notNull(),
        city: text("city").notNull(),
        entryFeePaid: boolean("entry_fee_paid").notNull().default(false),
        stripePaymentIntentId: text("stripe_payment_intent_id"),
        startDate: timestamp("start_date").notNull().defaultNow(),
        endDate: timestamp("end_date").notNull(),
        challengerWeightedVotes: numeric("challenger_weighted_votes", {
          precision: 10,
          scale: 3
        }).notNull().default("0"),
        defenderWeightedVotes: numeric("defender_weighted_votes", {
          precision: 10,
          scale: 3
        }).notNull().default("0"),
        totalVotes: integer("total_votes").notNull().default(0),
        status: text("status").notNull().default("pending"),
        winnerId: varchar("winner_id").references(() => businesses.id),
        createdAt: timestamp("created_at").notNull().defaultNow()
      },
      (table) => [
        index("idx_challenger_active").on(table.city, table.category, table.status)
      ]
    );
    rankHistory = pgTable(
      "rank_history",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        businessId: varchar("business_id").notNull().references(() => businesses.id),
        rankPosition: integer("rank_position").notNull(),
        weightedScore: numeric("weighted_score", { precision: 6, scale: 3 }).notNull(),
        snapshotDate: date("snapshot_date").notNull().default(sql`current_date`)
      },
      (table) => [
        unique("unique_business_snapshot").on(table.businessId, table.snapshotDate),
        index("idx_rank_hist").on(table.businessId, table.snapshotDate)
      ]
    );
    businessClaims = pgTable("business_claims", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      businessId: varchar("business_id").notNull().references(() => businesses.id),
      memberId: varchar("member_id").notNull().references(() => members.id),
      verificationMethod: text("verification_method").notNull(),
      verificationCode: text("verification_code"),
      codeExpiresAt: timestamp("code_expires_at"),
      attempts: integer("attempts").notNull().default(0),
      status: text("status").notNull().default("pending"),
      submittedAt: timestamp("submitted_at").notNull().defaultNow(),
      reviewedAt: timestamp("reviewed_at")
    });
    businessPhotos = pgTable(
      "business_photos",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        businessId: varchar("business_id").notNull().references(() => businesses.id),
        photoUrl: text("photo_url").notNull(),
        isHero: boolean("is_hero").notNull().default(false),
        sortOrder: integer("sort_order").notNull().default(0),
        uploadedBy: varchar("uploaded_by").references(() => members.id),
        createdAt: timestamp("created_at").notNull().defaultNow()
      },
      (table) => [
        index("idx_biz_photos_business").on(table.businessId, table.sortOrder)
      ]
    );
    qrScans = pgTable(
      "qr_scans",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        businessId: varchar("business_id").notNull().references(() => businesses.id),
        memberId: varchar("member_id").references(() => members.id),
        converted: boolean("converted").notNull().default(false),
        scannedAt: timestamp("scanned_at").notNull().defaultNow()
      },
      (table) => [
        index("idx_qr_biz").on(table.businessId, table.scannedAt)
      ]
    );
    ratingFlags = pgTable(
      "rating_flags",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        ratingId: varchar("rating_id").notNull().references(() => ratings.id),
        flaggerId: varchar("flagger_id").notNull().references(() => members.id),
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
        createdAt: timestamp("created_at").notNull().defaultNow()
      },
      (table) => [
        unique("unique_flag_per_member").on(table.ratingId, table.flaggerId),
        index("idx_flags_rating").on(table.ratingId),
        index("idx_flags_pending").on(table.status)
      ]
    );
    memberBadges = pgTable(
      "member_badges",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        memberId: varchar("member_id").notNull().references(() => members.id),
        badgeId: text("badge_id").notNull(),
        badgeFamily: text("badge_family").notNull(),
        earnedAt: timestamp("earned_at").notNull().defaultNow()
      },
      (table) => [
        unique("unique_badge_per_member").on(table.memberId, table.badgeId),
        index("idx_badges_member").on(table.memberId)
      ]
    );
    credibilityPenalties = pgTable(
      "credibility_penalties",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        memberId: varchar("member_id").notNull().references(() => members.id),
        ratingFlagId: varchar("rating_flag_id").references(() => ratingFlags.id),
        basePenalty: integer("base_penalty").notNull(),
        historyMult: numeric("history_mult", { precision: 3, scale: 1 }).notNull(),
        patternMult: numeric("pattern_mult", { precision: 3, scale: 1 }).notNull(),
        finalPenalty: integer("final_penalty").notNull(),
        severity: text("severity").notNull(),
        appliedAt: timestamp("applied_at").notNull().defaultNow()
      },
      (table) => [
        index("idx_penalties_member").on(table.memberId)
      ]
    );
    categories = pgTable("categories", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      slug: text("slug").unique().notNull(),
      label: text("label").notNull(),
      emoji: text("emoji").notNull(),
      vertical: text("vertical").notNull(),
      atAGlanceFields: jsonb("at_a_glance_fields").notNull().default(sql`'[]'::jsonb`),
      scoringHints: jsonb("scoring_hints").notNull().default(sql`'[]'::jsonb`),
      isActive: boolean("is_active").notNull().default(false),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    categorySuggestions = pgTable("category_suggestions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      description: text("description").notNull(),
      vertical: text("vertical").notNull(),
      suggestedBy: varchar("suggested_by").notNull().references(() => members.id),
      status: text("status").notNull().default("pending"),
      voteCount: integer("vote_count").notNull().default(1),
      reviewedBy: varchar("reviewed_by").references(() => members.id),
      reviewedAt: timestamp("reviewed_at"),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    payments = pgTable(
      "payments",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        memberId: varchar("member_id").notNull().references(() => members.id),
        businessId: varchar("business_id").references(() => businesses.id),
        type: text("type").notNull(),
        // challenger_entry, dashboard_pro, featured_placement
        amount: integer("amount").notNull(),
        // in cents
        currency: text("currency").notNull().default("usd"),
        stripePaymentIntentId: text("stripe_payment_intent_id"),
        status: text("status").notNull().default("pending"),
        // pending, succeeded, failed, refunded
        metadata: jsonb("metadata"),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at")
      },
      (table) => [
        index("idx_payments_member").on(table.memberId),
        index("idx_payments_business").on(table.businessId),
        index("idx_payments_status").on(table.status)
      ]
    );
    webhookEvents = pgTable(
      "webhook_events",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        source: text("source").notNull(),
        // stripe, github, etc.
        eventId: text("event_id").notNull(),
        // Stripe event ID (evt_xxx)
        eventType: text("event_type").notNull(),
        // payment_intent.succeeded, etc.
        payload: jsonb("payload").notNull(),
        processed: boolean("processed").notNull().default(false),
        error: text("error"),
        createdAt: timestamp("created_at").notNull().defaultNow()
      },
      (table) => [
        index("idx_webhook_events_source").on(table.source),
        index("idx_webhook_events_event_id").on(table.eventId)
      ]
    );
    featuredPlacements = pgTable(
      "featured_placements",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        businessId: varchar("business_id").notNull().references(() => businesses.id),
        paymentId: varchar("payment_id").references(() => payments.id),
        city: text("city").notNull(),
        startsAt: timestamp("starts_at").notNull().defaultNow(),
        expiresAt: timestamp("expires_at").notNull(),
        status: text("status").notNull().default("active"),
        // active, expired, cancelled
        createdAt: timestamp("created_at").notNull().defaultNow()
      },
      (table) => [
        index("idx_featured_business").on(table.businessId),
        index("idx_featured_city_status").on(table.city, table.status),
        index("idx_featured_expires").on(table.expiresAt)
      ]
    );
    analyticsEvents = pgTable(
      "analytics_events",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        event: text("event").notNull(),
        userId: varchar("user_id").references(() => members.id),
        metadata: jsonb("metadata"),
        createdAt: timestamp("created_at").notNull().defaultNow()
      },
      (table) => [
        index("idx_analytics_event").on(table.event),
        index("idx_analytics_user").on(table.userId),
        index("idx_analytics_created").on(table.createdAt)
      ]
    );
    insertMemberSchema = createInsertSchema(members).pick({
      displayName: true,
      username: true,
      email: true,
      password: true,
      city: true
    }).extend({
      password: z.string().optional()
    });
    insertRatingSchema = createInsertSchema(ratings).pick({
      businessId: true,
      q1Score: true,
      q2Score: true,
      q3Score: true,
      wouldReturn: true,
      note: true
    }).extend({
      q1Score: z.number().int().min(1).max(5),
      q2Score: z.number().int().min(1).max(5),
      q3Score: z.number().int().min(1).max(5),
      wouldReturn: z.boolean(),
      // Sprint 278: visitType required (was optional, required since Sprint 261 UI)
      visitType: z.enum(["dine_in", "delivery", "takeaway"]),
      timeOnPageMs: z.number().int().min(0).max(36e5).optional(),
      // max 1 hour
      // Sprint 278: Note length capped at 2000 chars, stripped of HTML
      note: z.string().max(2e3).optional().transform((val) => val ? val.replace(/<[^>]*>/g, "").trim() : val),
      dishId: z.string().optional(),
      newDishName: z.string().max(50).optional(),
      noNotableDish: z.boolean().optional(),
      qrScanId: z.string().optional()
    });
    deletionRequests = pgTable(
      "deletion_requests",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        memberId: varchar("member_id").notNull().references(() => members.id),
        requestedAt: timestamp("requested_at").notNull().defaultNow(),
        scheduledDeletionAt: timestamp("scheduled_deletion_at").notNull(),
        cancelledAt: timestamp("cancelled_at"),
        completedAt: timestamp("completed_at"),
        status: text("status").notNull().default("pending")
        // pending, cancelled, completed
      },
      (table) => [
        index("idx_deletion_member").on(table.memberId),
        index("idx_deletion_status").on(table.status)
      ]
    );
    dishLeaderboards = pgTable(
      "dish_leaderboards",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        city: text("city").notNull(),
        dishName: text("dish_name").notNull(),
        dishSlug: text("dish_slug").notNull(),
        dishEmoji: text("dish_emoji"),
        status: text("status").notNull().default("active"),
        minRatingCount: integer("min_rating_count").notNull().default(5),
        displayOrder: integer("display_order").notNull().default(0),
        source: text("source").notNull().default("system"),
        createdAt: timestamp("created_at").notNull().defaultNow()
      },
      (table) => [
        unique("unique_dish_city").on(table.city, table.dishSlug),
        index("idx_dish_lb_city").on(table.city, table.status)
      ]
    );
    dishLeaderboardEntries = pgTable(
      "dish_leaderboard_entries",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        leaderboardId: varchar("leaderboard_id").notNull().references(() => dishLeaderboards.id),
        businessId: varchar("business_id").notNull().references(() => businesses.id),
        dishScore: numeric("dish_score", { precision: 5, scale: 2 }).notNull().default("0"),
        dishRatingCount: integer("dish_rating_count").notNull().default(0),
        rankPosition: integer("rank_position").notNull().default(0),
        previousRank: integer("previous_rank"),
        photoUrl: text("photo_url"),
        updatedAt: timestamp("updated_at").notNull().defaultNow()
      },
      (table) => [
        unique("unique_entry_lb_biz").on(table.leaderboardId, table.businessId),
        index("idx_dish_entry_lb_rank").on(table.leaderboardId, table.rankPosition)
      ]
    );
    dishSuggestions = pgTable(
      "dish_suggestions",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        city: text("city").notNull(),
        dishName: text("dish_name").notNull(),
        suggestedBy: varchar("suggested_by").notNull().references(() => members.id),
        voteCount: integer("vote_count").notNull().default(1),
        status: text("status").notNull().default("proposed"),
        activationThreshold: integer("activation_threshold").notNull().default(10),
        createdAt: timestamp("created_at").notNull().defaultNow()
      },
      (table) => [
        index("idx_dish_sugg_city").on(table.city, table.voteCount)
      ]
    );
    dishSuggestionVotes = pgTable("dish_suggestion_votes", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      suggestionId: varchar("suggestion_id").notNull().references(() => dishSuggestions.id),
      memberId: varchar("member_id").notNull().references(() => members.id),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
    insertDishSuggestionSchema = z.object({
      city: z.string().min(2).max(50),
      dishName: z.string().min(2).max(40)
    });
    insertCategorySuggestionSchema = z.object({
      name: z.string().min(2).max(50),
      description: z.string().min(10).max(200),
      vertical: z.enum(["food", "services", "wellness", "entertainment", "retail"])
    });
    notifications = pgTable(
      "notifications",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        memberId: varchar("member_id").notNull().references(() => members.id),
        type: text("type").notNull(),
        // tier_upgrade, claim_decision, challenger_result, new_challenger, weekly_digest
        title: text("title").notNull(),
        body: text("body").notNull(),
        data: jsonb("data"),
        // { screen, slug, id } for deep linking
        read: boolean("read").notNull().default(false),
        createdAt: timestamp("created_at").notNull().defaultNow()
      },
      (table) => [
        index("idx_notif_member").on(table.memberId),
        index("idx_notif_member_read").on(table.memberId, table.read)
      ]
    );
    referrals = pgTable(
      "referrals",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        referrerId: varchar("referrer_id").notNull().references(() => members.id),
        referredId: varchar("referred_id").notNull().references(() => members.id),
        referralCode: text("referral_code").notNull(),
        status: text("status").notNull().default("signed_up"),
        // signed_up, activated (rated), churned
        createdAt: timestamp("created_at").notNull().defaultNow(),
        activatedAt: timestamp("activated_at")
        // when referred user submits first rating
      },
      (table) => [
        index("idx_referral_referrer").on(table.referrerId),
        index("idx_referral_referred").on(table.referredId),
        unique("uq_referral_referred").on(table.referredId)
        // one referrer per user
      ]
    );
    betaInvites = pgTable(
      "beta_invites",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        email: text("email").notNull(),
        displayName: text("display_name").notNull(),
        referralCode: text("referral_code").notNull().default("BETA25"),
        invitedBy: text("invited_by"),
        // admin who sent the invite
        status: text("status").notNull().default("sent"),
        // sent, joined, expired
        sentAt: timestamp("sent_at").notNull().defaultNow(),
        joinedAt: timestamp("joined_at"),
        memberId: varchar("member_id").references(() => members.id)
        // linked after signup
      },
      (table) => [
        index("idx_beta_invite_email").on(table.email),
        unique("uq_beta_invite_email").on(table.email)
      ]
    );
    userActivity = pgTable(
      "user_activity",
      {
        userId: varchar("user_id").primaryKey().references(() => members.id),
        lastSeenAt: timestamp("last_seen_at").notNull().defaultNow()
      },
      (table) => [
        index("idx_user_activity_last_seen").on(table.lastSeenAt)
      ]
    );
    betaFeedback = pgTable(
      "beta_feedback",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        memberId: varchar("member_id").references(() => members.id),
        rating: integer("rating").notNull(),
        // 1-5 star rating
        category: text("category").notNull(),
        // bug, feature, praise, other
        message: text("message").notNull(),
        screenContext: text("screen_context"),
        // which screen they were on
        appVersion: text("app_version"),
        createdAt: timestamp("created_at").notNull().defaultNow()
      },
      (table) => [
        index("idx_beta_feedback_member").on(table.memberId),
        index("idx_beta_feedback_created").on(table.createdAt)
      ]
    );
    ratingPhotos = pgTable(
      "rating_photos",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        ratingId: varchar("rating_id").notNull().references(() => ratings.id),
        photoUrl: text("photo_url").notNull(),
        cdnKey: text("cdn_key").notNull(),
        isVerifiedReceipt: boolean("is_verified_receipt").notNull().default(false),
        uploadedAt: timestamp("uploaded_at").notNull().defaultNow()
      },
      (table) => [
        index("idx_rating_photos_rating").on(table.ratingId)
      ]
    );
    photoSubmissions = pgTable(
      "photo_submissions",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        businessId: varchar("business_id").notNull().references(() => businesses.id),
        memberId: varchar("member_id").notNull().references(() => members.id),
        url: text("url").notNull(),
        caption: text("caption").notNull().default(""),
        status: text("status").notNull().default("pending"),
        // pending, approved, rejected
        rejectionReason: text("rejection_reason"),
        // inappropriate, low_quality, irrelevant, copyright, spam, other
        moderatorId: varchar("moderator_id").references(() => members.id),
        moderatorNote: text("moderator_note"),
        fileSize: integer("file_size").notNull(),
        mimeType: text("mime_type").notNull(),
        submittedAt: timestamp("submitted_at").notNull().defaultNow(),
        reviewedAt: timestamp("reviewed_at")
      },
      (table) => [
        index("idx_photo_sub_business").on(table.businessId),
        index("idx_photo_sub_member").on(table.memberId),
        index("idx_photo_sub_status").on(table.status),
        index("idx_photo_sub_submitted").on(table.submittedAt)
      ]
    );
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  db: () => db,
  pool: () => pool
});
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
var pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL must be set");
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
    db = drizzle(pool, { schema: schema_exports });
  }
});

// shared/credibility.ts
function getVoteWeight(credibilityScore) {
  if (credibilityScore >= 600) return 1;
  if (credibilityScore >= 300) return 0.7;
  if (credibilityScore >= 100) return 0.35;
  return 0.1;
}
function getCredibilityTier(score) {
  if (score >= 600) return "top";
  if (score >= 300) return "trusted";
  if (score >= 100) return "city";
  return "community";
}
function getTierFromScore(score, totalRatings, totalCategories, daysActive, ratingVariance, activeFlagCount) {
  if (score >= 600 && totalRatings >= 80 && totalCategories >= 4 && daysActive >= 90 && ratingVariance >= 1 && activeFlagCount === 0) return "top";
  if (score >= 300 && totalRatings >= 35 && totalCategories >= 3 && daysActive >= 45 && ratingVariance >= 0.8) return "trusted";
  if (score >= 100 && totalRatings >= 10 && totalCategories >= 2 && daysActive >= 14) return "city";
  return "community";
}
function getTemporalMultiplier(ratingAgeDays) {
  if (ratingAgeDays <= 30) return 1;
  if (ratingAgeDays <= 90) return 0.85;
  if (ratingAgeDays <= 180) return 0.65;
  if (ratingAgeDays <= 365) return 0.45;
  return 0.25;
}
var init_credibility = __esm({
  "shared/credibility.ts"() {
    "use strict";
  }
});

// server/storage/helpers.ts
var init_helpers = __esm({
  "server/storage/helpers.ts"() {
    "use strict";
    init_db();
    init_credibility();
  }
});

// server/logger.ts
function shouldLog(level) {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[MIN_LEVEL];
}
function formatMessage(level, tag, message, data) {
  const timestamp2 = (/* @__PURE__ */ new Date()).toISOString();
  const prefix = `${timestamp2} [${level.toUpperCase()}] [${tag}]`;
  if (data !== void 0) {
    return `${prefix} ${message} ${typeof data === "string" ? data : JSON.stringify(data)}`;
  }
  return `${prefix} ${message}`;
}
function createTaggedLogger(tag) {
  return {
    debug(message, data) {
      if (shouldLog("debug")) console.log(formatMessage("debug", tag, message, data));
    },
    info(message, data) {
      if (shouldLog("info")) console.log(formatMessage("info", tag, message, data));
    },
    warn(message, data) {
      if (shouldLog("warn")) console.warn(formatMessage("warn", tag, message, data));
    },
    error(message, data) {
      if (shouldLog("error")) console.error(formatMessage("error", tag, message, data));
    }
  };
}
var LEVEL_ORDER, MIN_LEVEL, log;
var init_logger = __esm({
  "server/logger.ts"() {
    "use strict";
    LEVEL_ORDER = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    MIN_LEVEL = process.env.NODE_ENV === "production" ? "info" : "debug";
    log = {
      /** Create a logger with a specific tag (e.g., "Email", "Push", "Deploy") */
      tag: createTaggedLogger,
      // Top-level convenience methods (tag: "Server")
      debug(message, data) {
        if (shouldLog("debug")) console.log(formatMessage("debug", "Server", message, data));
      },
      info(message, data) {
        if (shouldLog("info")) console.log(formatMessage("info", "Server", message, data));
      },
      warn(message, data) {
        if (shouldLog("warn")) console.warn(formatMessage("warn", "Server", message, data));
      },
      error(message, data) {
        if (shouldLog("error")) console.error(formatMessage("error", "Server", message, data));
      }
    };
  }
});

// server/tier-staleness.ts
import { eq } from "drizzle-orm";
function checkAndRefreshTier(storedTier, currentScore) {
  const expectedTier = getCredibilityTier(currentScore);
  if (storedTier !== expectedTier) {
    stalenessLog.info(
      `Tier drift detected: stored=${storedTier}, expected=${expectedTier} for score=${currentScore}`
    );
  }
  return expectedTier;
}
var stalenessLog;
var init_tier_staleness = __esm({
  "server/tier-staleness.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_logger();
    init_credibility();
    stalenessLog = log.tag("TierStaleness");
  }
});

// server/storage/members.ts
var members_exports = {};
__export(members_exports, {
  createMember: () => createMember,
  generateEmailVerificationToken: () => generateEmailVerificationToken,
  generatePasswordResetToken: () => generatePasswordResetToken,
  getAdminMemberList: () => getAdminMemberList,
  getMemberByAuthId: () => getMemberByAuthId,
  getMemberByEmail: () => getMemberByEmail,
  getMemberById: () => getMemberById,
  getMemberByUsername: () => getMemberByUsername,
  getMemberCount: () => getMemberCount,
  getMemberImpact: () => getMemberImpact,
  getMemberRatings: () => getMemberRatings,
  getMembersWithPushTokenByCity: () => getMembersWithPushTokenByCity,
  getOnboardingProgress: () => getOnboardingProgress,
  getSeasonalRatingCounts: () => getSeasonalRatingCounts,
  isEmailVerified: () => isEmailVerified,
  recalculateCredibilityScore: () => recalculateCredibilityScore,
  resetPasswordWithToken: () => resetPasswordWithToken,
  updateMemberAvatar: () => updateMemberAvatar,
  updateMemberEmail: () => updateMemberEmail,
  updateMemberProfile: () => updateMemberProfile,
  updateMemberStats: () => updateMemberStats,
  updateNotificationPrefs: () => updateNotificationPrefs,
  updatePushToken: () => updatePushToken,
  verifyEmailToken: () => verifyEmailToken
});
import { eq as eq2, and, sql as sql2, count, countDistinct, desc } from "drizzle-orm";
import crypto from "node:crypto";
async function getMemberById(id) {
  const [member] = await db.select().from(members).where(eq2(members.id, id));
  return member;
}
async function getMembersWithPushTokenByCity(city, limit = 500) {
  const { isNotNull: isNotNull5 } = await import("drizzle-orm");
  const results = await db.select({ id: members.id, pushToken: members.pushToken }).from(members).where(and(eq2(members.city, city), isNotNull5(members.pushToken))).limit(limit);
  return results.filter((m) => !!m.pushToken);
}
async function getMemberByUsername(username) {
  const [member] = await db.select().from(members).where(eq2(members.username, username));
  return member;
}
async function getMemberByEmail(email) {
  const [member] = await db.select().from(members).where(eq2(members.email, email));
  return member;
}
async function getMemberByAuthId(authId) {
  const [member] = await db.select().from(members).where(eq2(members.authId, authId));
  return member;
}
async function getAdminMemberList(limit = 50) {
  return db.select({
    id: members.id,
    displayName: members.displayName,
    username: members.username,
    email: members.email,
    city: members.city,
    credibilityTier: members.credibilityTier,
    credibilityScore: members.credibilityScore,
    totalRatings: members.totalRatings,
    isBanned: members.isBanned,
    isFoundingMember: members.isFoundingMember,
    joinedAt: members.joinedAt
  }).from(members).orderBy(desc(members.joinedAt)).limit(limit);
}
async function getMemberCount() {
  const [result] = await db.select({ cnt: count() }).from(members);
  return Number(result?.cnt ?? 0);
}
async function createMember(data) {
  const [member] = await db.insert(members).values(data).returning();
  return member;
}
async function updateMemberStats(memberId) {
  const whereClause = and(eq2(ratings.memberId, memberId), eq2(ratings.isFlagged, false));
  const [statsResult, categoryResult, memberRatings] = await Promise.all([
    // Aggregate count + distinct businesses in one query
    db.select({
      totalRatings: count(),
      distinctBusinesses: countDistinct(ratings.businessId)
    }).from(ratings).where(whereClause),
    // Category count requires business join
    db.select({ category: businesses.category }).from(ratings).innerJoin(businesses, eq2(ratings.businessId, businesses.id)).where(whereClause).groupBy(businesses.category),
    // Raw scores for variance calculation
    db.select({ rawScore: ratings.rawScore }).from(ratings).where(whereClause)
  ]);
  const stats2 = statsResult[0];
  let variance = 0;
  if (memberRatings.length > 1) {
    const scores = memberRatings.map((r) => parseFloat(r.rawScore));
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const sqDiffs = scores.map((s) => (s - mean) ** 2);
    variance = Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / scores.length);
  }
  await db.update(members).set({
    totalRatings: stats2.totalRatings,
    totalCategories: categoryResult.length,
    distinctBusinesses: stats2.distinctBusinesses,
    ratingVariance: variance.toFixed(3),
    lastActive: /* @__PURE__ */ new Date()
  }).where(eq2(members.id, memberId));
}
async function recalculateCredibilityScore(memberId) {
  const member = await getMemberById(memberId);
  if (!member) throw new Error("Member not found");
  const base = 10;
  const volume = Math.min(member.totalRatings * 2, 200);
  const diversity = Math.min(member.totalCategories * 15, 100);
  const daysActive = Math.floor(
    (Date.now() - new Date(member.joinedAt).getTime()) / (1e3 * 60 * 60 * 24)
  );
  const age = Math.min(daysActive * 0.5, 100);
  const memberRatings = await db.select({ rawScore: ratings.rawScore }).from(ratings).where(and(eq2(ratings.memberId, memberId), eq2(ratings.isFlagged, false)));
  let varianceBonus = 0;
  if (memberRatings.length >= 5) {
    const scores = memberRatings.map((r) => parseFloat(r.rawScore));
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const sqDiffs = scores.map((s) => (s - mean) ** 2);
    const stddev = Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / scores.length);
    varianceBonus = Math.min(stddev * 60, 150);
  }
  const pioneerQueryResult = await db.execute(sql2`
    SELECT
      COUNT(*) AS total_ratings,
      COUNT(*) FILTER (WHERE prior_count < 10) AS early_ratings
    FROM (
      SELECT r1.id,
        (SELECT COUNT(*) FROM ${ratings} r2
         WHERE r2.business_id = r1.business_id
           AND r2.member_id != ${memberId}
           AND r2.created_at < r1.created_at
           AND r2.is_flagged = false) AS prior_count
      FROM ${ratings} r1
      WHERE r1.member_id = ${memberId}
        AND r1.is_flagged = false
    ) sub
  `);
  const pioneerResult = pioneerQueryResult.rows?.[0] ?? pioneerQueryResult[0] ?? {};
  const totalMemberRatings = Number(pioneerResult?.total_ratings ?? 0);
  const earlyReviewCount = Number(pioneerResult?.early_ratings ?? 0);
  const pioneerRate = totalMemberRatings > 0 ? earlyReviewCount / totalMemberRatings : 0;
  const helpfulness = Math.round(pioneerRate * 100);
  const penaltyResult = await db.select({ total: sql2`COALESCE(SUM(${credibilityPenalties.finalPenalty}), 0)` }).from(credibilityPenalties).where(eq2(credibilityPenalties.memberId, memberId));
  const totalPenalties = Number(penaltyResult[0]?.total ?? 0);
  const rawScore = base + volume + diversity + age + varianceBonus + helpfulness - totalPenalties;
  const score = Math.max(10, Math.min(1e3, Math.round(rawScore)));
  let ratingVariance = 0;
  if (memberRatings.length > 1) {
    const scores = memberRatings.map((r) => parseFloat(r.rawScore));
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const sqDiffs = scores.map((s) => (s - mean) ** 2);
    ratingVariance = Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / scores.length);
  }
  const gateTier = getTierFromScore(
    score,
    member.totalRatings,
    member.totalCategories,
    daysActive,
    ratingVariance,
    member.activeFlagCount
  );
  const stalenessCheckedTier = checkAndRefreshTier(member.credibilityTier, score);
  const tier = gateTier;
  await db.update(members).set({ credibilityScore: score, credibilityTier: tier }).where(eq2(members.id, memberId));
  return {
    score,
    tier,
    breakdown: {
      base,
      volume,
      diversity,
      age: Math.round(age),
      variance: Math.round(varianceBonus),
      helpfulness,
      penalties: totalPenalties
    }
  };
}
async function getMemberRatings(memberId, page = 1, perPage = 20) {
  const offset = (page - 1) * perPage;
  const ratingsResult = await db.select({
    id: ratings.id,
    memberId: ratings.memberId,
    businessId: ratings.businessId,
    q1Score: ratings.q1Score,
    q2Score: ratings.q2Score,
    q3Score: ratings.q3Score,
    wouldReturn: ratings.wouldReturn,
    note: ratings.note,
    rawScore: ratings.rawScore,
    weight: ratings.weight,
    weightedScore: ratings.weightedScore,
    isFlagged: ratings.isFlagged,
    autoFlagged: ratings.autoFlagged,
    flagReason: ratings.flagReason,
    flagProbability: ratings.flagProbability,
    source: ratings.source,
    createdAt: ratings.createdAt,
    businessName: businesses.name,
    businessSlug: businesses.slug
  }).from(ratings).innerJoin(businesses, eq2(ratings.businessId, businesses.id)).where(eq2(ratings.memberId, memberId)).orderBy(sql2`${ratings.createdAt} DESC`).limit(perPage).offset(offset);
  const [totalResult] = await db.select({ count: count() }).from(ratings).where(eq2(ratings.memberId, memberId));
  return { ratings: ratingsResult, total: totalResult.count };
}
async function getSeasonalRatingCounts(memberId) {
  const result = await db.select({
    month: sql2`EXTRACT(MONTH FROM ${ratings.createdAt})::int`,
    cnt: count()
  }).from(ratings).where(
    and(
      eq2(ratings.memberId, memberId),
      eq2(ratings.isFlagged, false)
    )
  ).groupBy(sql2`EXTRACT(MONTH FROM ${ratings.createdAt})`);
  let spring = 0, summer = 0, fall = 0, winter = 0;
  for (const row of result) {
    const c = Number(row.cnt);
    if ([3, 4, 5].includes(row.month)) spring += c;
    else if ([6, 7, 8].includes(row.month)) summer += c;
    else if ([9, 10, 11].includes(row.month)) fall += c;
    else winter += c;
  }
  return { springRatings: spring, summerRatings: summer, fallRatings: fall, winterRatings: winter };
}
async function updateMemberProfile(memberId, updates) {
  const updateData = {};
  if (updates.displayName !== void 0) updateData.displayName = updates.displayName;
  if (updates.username !== void 0) updateData.username = updates.username;
  if (Object.keys(updateData).length === 0) return null;
  const [updated] = await db.update(members).set(updateData).where(eq2(members.id, memberId)).returning();
  return updated;
}
async function updatePushToken(memberId, pushToken) {
  await db.update(members).set({ pushToken }).where(eq2(members.id, memberId));
}
async function updateMemberAvatar(memberId, avatarUrl) {
  const [updated] = await db.update(members).set({ avatarUrl }).where(eq2(members.id, memberId)).returning();
  return updated;
}
async function updateMemberEmail(memberId, email) {
  const [existing] = await db.select().from(members).where(eq2(members.email, email));
  if (existing && existing.id !== memberId) throw new Error("Email already in use");
  const [updated] = await db.update(members).set({ email }).where(eq2(members.id, memberId)).returning();
  return updated;
}
async function updateNotificationPrefs(memberId, prefs) {
  const [updated] = await db.update(members).set({ notificationPrefs: prefs }).where(eq2(members.id, memberId)).returning({ notificationPrefs: members.notificationPrefs });
  return updated?.notificationPrefs ?? prefs;
}
async function getMemberImpact(memberId) {
  const memberRatings = await db.select({
    businessId: ratings.businessId,
    businessName: businesses.name,
    businessSlug: businesses.slug,
    rankDelta: businesses.rankDelta
  }).from(ratings).innerJoin(businesses, eq2(ratings.businessId, businesses.id)).where(
    and(
      eq2(ratings.memberId, memberId),
      eq2(ratings.isFlagged, false)
    )
  ).groupBy(ratings.businessId, businesses.name, businesses.slug, businesses.rankDelta);
  const lastRatingRows = await db.select({
    businessName: businesses.name,
    businessSlug: businesses.slug,
    rawScore: ratings.rawScore,
    weight: ratings.weight,
    ratedAt: ratings.createdAt
  }).from(ratings).innerJoin(businesses, eq2(ratings.businessId, businesses.id)).where(eq2(ratings.memberId, memberId)).orderBy(desc(ratings.createdAt)).limit(1);
  const lastRating = lastRatingRows.length > 0 ? {
    businessName: lastRatingRows[0].businessName,
    businessSlug: lastRatingRows[0].businessSlug,
    rawScore: lastRatingRows[0].rawScore,
    weight: lastRatingRows[0].weight,
    ratedAt: lastRatingRows[0].ratedAt.toISOString()
  } : null;
  const movedUp = memberRatings.filter((r) => r.rankDelta > 0);
  return {
    businessesMovedUp: movedUp.length,
    topContributions: movedUp.sort((a, b) => b.rankDelta - a.rankDelta).slice(0, 5).map((r) => ({ name: r.businessName, slug: r.businessSlug, rankChange: r.rankDelta })),
    lastRating
  };
}
async function getOnboardingProgress(memberId) {
  const member = await getMemberById(memberId);
  if (!member) throw new Error("Member not found");
  const daysActive = Math.floor(
    (Date.now() - new Date(member.joinedAt).getTime()) / (1e3 * 60 * 60 * 24)
  );
  const hasAvatar = !!member.avatarUrl;
  const hasCity = !!member.city && member.city !== "Dallas";
  const hasRated = (member.totalRatings || 0) > 0;
  const hasMultipleRatings = (member.totalRatings || 0) >= 3;
  const earnedTier = member.credibilityTier !== "community";
  const canRate = daysActive >= 3;
  const steps = [
    { key: "create_account", label: "Create your account", completed: true, detail: `Joined ${daysActive} day${daysActive !== 1 ? "s" : ""} ago` },
    { key: "set_city", label: "Choose your city", completed: hasCity || true, detail: member.city || "Dallas" },
    { key: "add_avatar", label: "Add a profile photo", completed: hasAvatar },
    { key: "wait_period", label: "Complete 3-day waiting period", completed: canRate, detail: canRate ? "Unlocked" : `${3 - daysActive} day${3 - daysActive !== 1 ? "s" : ""} remaining` },
    { key: "first_rating", label: "Submit your first rating", completed: hasRated, detail: hasRated ? `${member.totalRatings} rating${(member.totalRatings || 0) !== 1 ? "s" : ""} submitted` : void 0 },
    { key: "three_ratings", label: "Rate 3 different restaurants", completed: hasMultipleRatings, detail: hasMultipleRatings ? "Credibility building!" : `${member.totalRatings || 0}/3 ratings` },
    { key: "earn_tier", label: "Earn your first tier upgrade", completed: earnedTier, detail: earnedTier ? `Current: ${member.credibilityTier}` : "Keep rating to level up" }
  ];
  const completedCount = steps.filter((s) => s.completed).length;
  return { steps, completedCount, totalSteps: steps.length };
}
async function generateEmailVerificationToken(memberId) {
  const token = crypto.randomBytes(32).toString("hex");
  await db.update(members).set({ emailVerificationToken: token }).where(eq2(members.id, memberId));
  return token;
}
async function verifyEmailToken(token) {
  if (!token || token.length < 32) return { success: false };
  const [member] = await db.select({ id: members.id }).from(members).where(eq2(members.emailVerificationToken, token));
  if (!member) return { success: false };
  await db.update(members).set({ emailVerified: true, emailVerificationToken: null }).where(eq2(members.id, member.id));
  return { success: true, memberId: member.id };
}
async function isEmailVerified(memberId) {
  const [member] = await db.select({ emailVerified: members.emailVerified }).from(members).where(eq2(members.id, memberId));
  return member?.emailVerified ?? false;
}
async function generatePasswordResetToken(email) {
  const member = await getMemberByEmail(email);
  if (!member) return null;
  if (!member.password) return null;
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1e3);
  await db.update(members).set({ passwordResetToken: token, passwordResetExpires: expires }).where(eq2(members.id, member.id));
  return { token, memberId: member.id, displayName: member.displayName };
}
async function resetPasswordWithToken(token, newPasswordHash) {
  if (!token || token.length < 32) return { success: false, error: "Invalid token" };
  const [member] = await db.select({ id: members.id, passwordResetExpires: members.passwordResetExpires }).from(members).where(eq2(members.passwordResetToken, token));
  if (!member) return { success: false, error: "Invalid or expired token" };
  if (member.passwordResetExpires && new Date(member.passwordResetExpires) < /* @__PURE__ */ new Date()) {
    await db.update(members).set({ passwordResetToken: null, passwordResetExpires: null }).where(eq2(members.id, member.id));
    return { success: false, error: "Reset token has expired" };
  }
  await db.update(members).set({
    password: newPasswordHash,
    passwordResetToken: null,
    passwordResetExpires: null
  }).where(eq2(members.id, member.id));
  return { success: true };
}
var init_members = __esm({
  "server/storage/members.ts"() {
    "use strict";
    init_schema();
    init_db();
    init_helpers();
    init_tier_staleness();
  }
});

// shared/score-engine.ts
function computeComposite(visitType, dimensions) {
  const food = dimensions.foodScore ?? 0;
  switch (visitType) {
    case "dine_in": {
      const service = dimensions.serviceScore ?? 0;
      const vibe = dimensions.vibeScore ?? 0;
      return food * DINE_IN_WEIGHTS.food + service * DINE_IN_WEIGHTS.service + vibe * DINE_IN_WEIGHTS.vibe;
    }
    case "delivery": {
      const packaging = dimensions.packagingScore ?? 0;
      const value = dimensions.valueScore ?? 0;
      return food * DELIVERY_WEIGHTS.food + packaging * DELIVERY_WEIGHTS.packaging + value * DELIVERY_WEIGHTS.value;
    }
    case "takeaway": {
      const waitTime = dimensions.waitTimeScore ?? 0;
      const value = dimensions.valueScore ?? 0;
      return food * TAKEAWAY_WEIGHTS.food + waitTime * TAKEAWAY_WEIGHTS.waitTime + value * TAKEAWAY_WEIGHTS.value;
    }
    default:
      return food;
  }
}
function computeDecayFactor(daysSinceRating) {
  return Math.exp(-DECAY_LAMBDA * daysSinceRating);
}
function applyBayesianPrior(weightedScore, totalDecayedWeight, priorMean = DEFAULT_PRIOR_MEAN, priorStrength = BAYESIAN_PRIOR_STRENGTH) {
  if (totalDecayedWeight <= 0) return priorMean;
  return (totalDecayedWeight * weightedScore + priorStrength * priorMean) / (totalDecayedWeight + priorStrength);
}
var DINE_IN_WEIGHTS, DELIVERY_WEIGHTS, TAKEAWAY_WEIGHTS, DECAY_LAMBDA, BAYESIAN_PRIOR_STRENGTH, DEFAULT_PRIOR_MEAN;
var init_score_engine = __esm({
  "shared/score-engine.ts"() {
    "use strict";
    DINE_IN_WEIGHTS = { food: 0.5, service: 0.25, vibe: 0.25 };
    DELIVERY_WEIGHTS = { food: 0.6, packaging: 0.25, value: 0.15 };
    TAKEAWAY_WEIGHTS = { food: 0.65, waitTime: 0.2, value: 0.15 };
    DECAY_LAMBDA = 3e-3;
    BAYESIAN_PRIOR_STRENGTH = 3;
    DEFAULT_PRIOR_MEAN = 6.5;
  }
});

// server/redis.ts
var redis_exports = {};
__export(redis_exports, {
  cacheAside: () => cacheAside,
  cacheDel: () => cacheDel,
  cacheDelPattern: () => cacheDelPattern,
  cacheGet: () => cacheGet,
  cacheSet: () => cacheSet,
  getCacheStats: () => getCacheStats,
  getRedisClient: () => getRedisClient,
  trackCacheHit: () => trackCacheHit,
  trackCacheMiss: () => trackCacheMiss
});
import Redis from "ioredis";
function getRedisClient() {
  if (redis) return redis;
  const url = process.env.REDIS_URL;
  if (!url) {
    redisLog.info("REDIS_URL not set \u2014 caching disabled, using DB-only mode");
    return null;
  }
  try {
    redis = new Redis(url, {
      maxRetriesPerRequest: 1,
      connectTimeout: 3e3,
      lazyConnect: true,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 200, 1e3);
      }
    });
    redis.on("error", (err) => redisLog.warn(`Redis error: ${err.message}`));
    redis.on("connect", () => redisLog.info("Redis connected"));
    redis.connect().catch(() => {
      redisLog.warn("Redis connect failed \u2014 running in DB-only mode");
      redis = null;
    });
    return redis;
  } catch {
    redisLog.warn("Redis init failed \u2014 running in DB-only mode");
    return null;
  }
}
async function cacheGet(key2) {
  const client = getRedisClient();
  if (!client) return null;
  try {
    const raw = await client.get(key2);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
async function cacheSet(key2, value, ttlSeconds) {
  const client = getRedisClient();
  if (!client) return;
  try {
    await client.set(key2, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
  }
}
async function cacheDel(...keys) {
  const client = getRedisClient();
  if (!client || keys.length === 0) return;
  try {
    await client.del(...keys);
  } catch {
  }
}
async function cacheDelPattern(pattern) {
  const client = getRedisClient();
  if (!client) return;
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) await client.del(...keys);
  } catch {
  }
}
async function cacheAside(key2, ttlSeconds, compute) {
  const cached = await cacheGet(key2);
  if (cached !== null) return cached;
  const result = await compute();
  await cacheSet(key2, result, ttlSeconds);
  return result;
}
function trackCacheHit() {
  hits++;
}
function trackCacheMiss() {
  misses++;
}
function getCacheStats() {
  const total = hits + misses;
  return {
    connected: redis !== null,
    hits,
    misses,
    hitRate: total > 0 ? (hits / total * 100).toFixed(1) + "%" : "N/A"
  };
}
var redisLog, redis, hits, misses;
var init_redis = __esm({
  "server/redis.ts"() {
    "use strict";
    init_logger();
    redisLog = log.tag("Redis");
    redis = null;
    hits = 0;
    misses = 0;
  }
});

// server/storage/businesses.ts
var businesses_exports = {};
__export(businesses_exports, {
  autocompleteBusinesses: () => autocompleteBusinesses,
  bulkImportBusinesses: () => bulkImportBusinesses,
  countBusinessSearch: () => countBusinessSearch,
  deleteBusinessPhotos: () => deleteBusinessPhotos,
  getAllCategories: () => getAllCategories,
  getBusinessById: () => getBusinessById,
  getBusinessBySlug: () => getBusinessBySlug,
  getBusinessPhotos: () => getBusinessPhotos,
  getBusinessPhotosMap: () => getBusinessPhotosMap,
  getBusinessRatings: () => getBusinessRatings,
  getBusinessesByIds: () => getBusinessesByIds,
  getBusinessesWithoutPhotos: () => getBusinessesWithoutPhotos,
  getCuisines: () => getCuisines,
  getImportStats: () => getImportStats,
  getLeaderboard: () => getLeaderboard,
  getPopularCategories: () => getPopularCategories,
  getRankHistory: () => getRankHistory,
  getTrendingBusinesses: () => getTrendingBusinesses,
  insertBusinessPhotos: () => insertBusinessPhotos,
  recalculateBusinessScore: () => recalculateBusinessScore,
  recalculateRanks: () => recalculateRanks,
  searchBusinesses: () => searchBusinesses,
  updateBusinessSubscription: () => updateBusinessSubscription
});
import { eq as eq3, and as and2, desc as desc2, asc, sql as sql3, count as count2, gte as gte2 } from "drizzle-orm";
async function getLeaderboard(city, category, limit = 50, cuisine) {
  const key2 = `leaderboard:${city}:${category}:${cuisine || "all"}:${limit}`;
  return cacheAside(key2, 300, async () => {
    trackCacheMiss();
    return db.select().from(businesses).where(
      and2(
        eq3(businesses.city, city),
        eq3(businesses.category, category),
        eq3(businesses.isActive, true),
        eq3(businesses.leaderboardEligible, true),
        ...cuisine ? [eq3(businesses.cuisine, cuisine)] : []
      )
    ).orderBy(asc(businesses.rankPosition)).limit(limit);
  });
}
async function getTrendingBusinesses(city, limit = 3) {
  const key2 = `trending:${city}:${limit}`;
  return cacheAside(key2, 600, async () => {
    trackCacheMiss();
    return db.select().from(businesses).where(
      and2(
        eq3(businesses.city, city),
        eq3(businesses.isActive, true),
        sql3`${businesses.rankDelta} > 0`
      )
    ).orderBy(desc2(businesses.rankDelta)).limit(limit);
  });
}
async function getBusinessBySlug(slug) {
  const [business] = await db.select().from(businesses).where(eq3(businesses.slug, slug));
  return business;
}
async function getBusinessById(id) {
  const [business] = await db.select().from(businesses).where(eq3(businesses.id, id));
  return business;
}
async function updateBusinessSubscription(businessId, updates) {
  const setData = {};
  if (updates.stripeCustomerId !== void 0) setData.stripeCustomerId = updates.stripeCustomerId;
  if (updates.stripeSubscriptionId !== void 0) setData.stripeSubscriptionId = updates.stripeSubscriptionId;
  if (updates.subscriptionStatus !== void 0) setData.subscriptionStatus = updates.subscriptionStatus;
  if (updates.subscriptionPeriodEnd !== void 0) setData.subscriptionPeriodEnd = updates.subscriptionPeriodEnd;
  if (Object.keys(setData).length === 0) return;
  await db.update(businesses).set(setData).where(eq3(businesses.id, businessId));
}
async function getBusinessesByIds(ids) {
  if (ids.length === 0) return [];
  return db.select().from(businesses).where(sql3`${businesses.id} = ANY(ARRAY[${sql3.join(ids.map((id) => sql3`${id}`), sql3`,`)}]::text[])`);
}
async function searchBusinesses(query, city, category, limit = 20, cuisine, offset = 0) {
  const sanitized = query.slice(0, 100).replace(/[%_\\]/g, "");
  const q = "%" + sanitized.toLowerCase() + "%";
  return db.select().from(businesses).where(
    and2(
      eq3(businesses.city, city),
      eq3(businesses.isActive, true),
      query ? sql3`(lower(${businesses.name}) like ${q} OR lower(${businesses.neighborhood}) like ${q} OR lower(${businesses.category}) like ${q} OR lower(COALESCE(${businesses.cuisine}, '')) like ${q})` : void 0,
      ...category ? [eq3(businesses.category, category)] : [],
      ...cuisine ? [eq3(businesses.cuisine, cuisine)] : []
    )
  ).orderBy(desc2(businesses.weightedScore)).limit(limit).offset(offset);
}
async function countBusinessSearch(query, city, category, cuisine) {
  const sanitized = query.slice(0, 100).replace(/[%_\\]/g, "");
  const q = "%" + sanitized.toLowerCase() + "%";
  const [result] = await db.select({ total: count2() }).from(businesses).where(
    and2(
      eq3(businesses.city, city),
      eq3(businesses.isActive, true),
      query ? sql3`(lower(${businesses.name}) like ${q} OR lower(${businesses.neighborhood}) like ${q} OR lower(${businesses.category}) like ${q} OR lower(COALESCE(${businesses.cuisine}, '')) like ${q})` : void 0,
      ...category ? [eq3(businesses.category, category)] : [],
      ...cuisine ? [eq3(businesses.cuisine, cuisine)] : []
    )
  );
  return result?.total ?? 0;
}
async function getCuisines(city, category) {
  const key2 = `cuisines:${city}:${category || "all"}`;
  return cacheAside(key2, 7200, async () => {
    trackCacheMiss();
    const rows = await db.select({ cuisine: businesses.cuisine }).from(businesses).where(
      and2(
        eq3(businesses.city, city),
        eq3(businesses.isActive, true),
        sql3`${businesses.cuisine} IS NOT NULL`,
        ...category ? [eq3(businesses.category, category)] : []
      )
    ).groupBy(businesses.cuisine);
    return rows.map((r) => r.cuisine).filter(Boolean);
  });
}
async function getAllCategories(city) {
  const key2 = `categories:${city}`;
  return cacheAside(key2, 7200, async () => {
    trackCacheMiss();
    const rows = await db.select({
      category: businesses.category
    }).from(businesses).where(and2(eq3(businesses.city, city), eq3(businesses.isActive, true))).groupBy(businesses.category);
    return rows.map((r) => r.category);
  });
}
async function autocompleteBusinesses(query, city, limit = 6) {
  if (!query || query.trim().length === 0) return [];
  const sanitized = query.slice(0, 50).replace(/[%_\\]/g, "");
  const q = "%" + sanitized.toLowerCase() + "%";
  return db.select({
    id: businesses.id,
    name: businesses.name,
    slug: businesses.slug,
    category: businesses.category,
    cuisine: businesses.cuisine,
    neighborhood: businesses.neighborhood,
    weightedScore: businesses.weightedScore
  }).from(businesses).where(
    and2(
      eq3(businesses.city, city),
      eq3(businesses.isActive, true),
      sql3`(lower(${businesses.name}) like ${q} OR lower(${businesses.category}) like ${q} OR lower(${businesses.neighborhood}) like ${q} OR lower(COALESCE(${businesses.cuisine}, '')) like ${q})`
    )
  ).orderBy(desc2(businesses.weightedScore)).limit(limit);
}
async function getPopularCategories(city, limit = 8) {
  const key2 = `popular_categories:${city}:${limit}`;
  return cacheAside(key2, 3600, async () => {
    trackCacheMiss();
    const rows = await db.select({
      category: businesses.category,
      count: count2(businesses.id)
    }).from(businesses).where(and2(eq3(businesses.city, city), eq3(businesses.isActive, true))).groupBy(businesses.category).orderBy(desc2(count2(businesses.id))).limit(limit);
    return rows.map((r) => ({ category: r.category, count: Number(r.count) }));
  });
}
async function recalculateBusinessScore(businessId) {
  const allRatings = await db.select({
    rawScore: ratings.rawScore,
    weight: ratings.weight,
    compositeScore: ratings.compositeScore,
    effectiveWeight: ratings.effectiveWeight,
    visitType: ratings.visitType,
    createdAt: ratings.createdAt,
    isFlagged: ratings.isFlagged,
    autoFlagged: ratings.autoFlagged
  }).from(ratings).where(
    and2(
      eq3(ratings.businessId, businessId),
      eq3(ratings.isFlagged, false),
      eq3(ratings.autoFlagged, false)
    )
  );
  if (allRatings.length === 0) {
    await db.update(businesses).set({
      weightedScore: "0",
      rawAvgScore: "0",
      totalRatings: 0,
      dineInCount: 0,
      credibilityWeightedSum: "0",
      leaderboardEligible: false,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq3(businesses.id, businessId));
    return 0;
  }
  let totalWeightedScore = 0;
  let totalEffectiveWeight = 0;
  let rawSum = 0;
  let dineInCount = 0;
  let credibilityWeightedSum = 0;
  for (const r of allRatings) {
    const ageDays = Math.floor(
      (Date.now() - new Date(r.createdAt).getTime()) / (1e3 * 60 * 60 * 24)
    );
    const decay = computeDecayFactor(ageDays);
    const score2 = r.compositeScore ? parseFloat(r.compositeScore) : parseFloat(r.rawScore);
    const weight = r.effectiveWeight ? parseFloat(r.effectiveWeight) : parseFloat(r.weight);
    const decayedWeight = weight * decay;
    totalWeightedScore += score2 * decayedWeight;
    totalEffectiveWeight += decayedWeight;
    rawSum += parseFloat(r.rawScore);
    if (r.visitType === "dine_in") dineInCount++;
    credibilityWeightedSum += weight;
  }
  const rawWeightedAvg = totalEffectiveWeight > 0 ? totalWeightedScore / totalEffectiveWeight : 0;
  const score = Math.round(
    applyBayesianPrior(rawWeightedAvg, totalEffectiveWeight) * 1e3
  ) / 1e3;
  const rawAvg = rawSum / allRatings.length;
  const eligible = allRatings.length >= 3 && dineInCount >= 1 && credibilityWeightedSum >= 0.5;
  await db.update(businesses).set({
    weightedScore: score.toFixed(3),
    rawAvgScore: rawAvg.toFixed(2),
    totalRatings: allRatings.length,
    dineInCount,
    credibilityWeightedSum: credibilityWeightedSum.toFixed(4),
    leaderboardEligible: eligible,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq3(businesses.id, businessId));
  return score;
}
async function recalculateRanks(city, category) {
  await db.execute(sql3`
    UPDATE ${businesses} b
    SET
      rank_position = sub.new_rank,
      rank_delta = COALESCE(b.rank_position, sub.new_rank) - sub.new_rank,
      prev_rank_position = b.rank_position
    FROM (
      SELECT id,
        ROW_NUMBER() OVER (ORDER BY weighted_score DESC) AS new_rank
      FROM ${businesses}
      WHERE city = ${city}
        AND category = ${category}
        AND is_active = true
        AND leaderboard_eligible = true
    ) sub
    WHERE b.id = sub.id
  `);
  await cacheDelPattern(`leaderboard:${city}:*`);
  await cacheDelPattern(`trending:${city}:*`);
}
async function getBusinessPhotos(businessId) {
  const rows = await db.select({ photoUrl: businessPhotos.photoUrl }).from(businessPhotos).where(eq3(businessPhotos.businessId, businessId)).orderBy(asc(businessPhotos.sortOrder)).limit(3);
  return rows.map((r) => r.photoUrl);
}
async function getBusinessPhotosMap(businessIds) {
  if (businessIds.length === 0) return {};
  const rows = await db.select({
    businessId: businessPhotos.businessId,
    photoUrl: businessPhotos.photoUrl,
    sortOrder: businessPhotos.sortOrder
  }).from(businessPhotos).where(sql3`${businessPhotos.businessId} = ANY(ARRAY[${sql3.join(businessIds.map((id) => sql3`${id}`), sql3`,`)}]::text[])`).orderBy(asc(businessPhotos.sortOrder));
  const map = {};
  for (const row of rows) {
    if (!map[row.businessId]) map[row.businessId] = [];
    if (map[row.businessId].length < 3) {
      map[row.businessId].push(row.photoUrl);
    }
  }
  return map;
}
async function insertBusinessPhotos(businessId, photos) {
  if (photos.length === 0) return;
  await db.insert(businessPhotos).values(
    photos.map((p) => ({
      businessId,
      photoUrl: p.photoUrl,
      isHero: p.isHero,
      sortOrder: p.sortOrder
    }))
  );
}
async function getBusinessesWithoutPhotos(city, limit = 50) {
  const rows = await db.select({
    id: businesses.id,
    name: businesses.name,
    googlePlaceId: businesses.googlePlaceId,
    city: businesses.city
  }).from(businesses).leftJoin(businessPhotos, eq3(businesses.id, businessPhotos.businessId)).where(
    and2(
      eq3(businesses.isActive, true),
      sql3`${businesses.googlePlaceId} IS NOT NULL`,
      sql3`${businessPhotos.id} IS NULL`,
      ...city ? [eq3(businesses.city, city)] : []
    )
  ).limit(limit);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    googlePlaceId: r.googlePlaceId,
    city: r.city
  }));
}
async function deleteBusinessPhotos(businessId) {
  await db.delete(businessPhotos).where(eq3(businessPhotos.businessId, businessId));
}
async function getRankHistory(businessId, days = 30) {
  const cutoff = /* @__PURE__ */ new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const rows = await db.select({
    date: rankHistory.snapshotDate,
    rank: rankHistory.rankPosition,
    score: rankHistory.weightedScore
  }).from(rankHistory).where(
    and2(
      eq3(rankHistory.businessId, businessId),
      gte2(rankHistory.snapshotDate, cutoff.toISOString().split("T")[0])
    )
  ).orderBy(asc(rankHistory.snapshotDate));
  return rows.map((r) => ({
    date: r.date,
    rank: r.rank,
    score: parseFloat(r.score)
  }));
}
async function getBusinessRatings(businessId, page = 1, perPage = 20) {
  const offset = (page - 1) * perPage;
  const { members: members4 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const ratingsResult = await db.select({
    id: ratings.id,
    memberId: ratings.memberId,
    businessId: ratings.businessId,
    q1Score: ratings.q1Score,
    q2Score: ratings.q2Score,
    q3Score: ratings.q3Score,
    wouldReturn: ratings.wouldReturn,
    note: ratings.note,
    rawScore: ratings.rawScore,
    weight: ratings.weight,
    weightedScore: ratings.weightedScore,
    isFlagged: ratings.isFlagged,
    autoFlagged: ratings.autoFlagged,
    flagReason: ratings.flagReason,
    flagProbability: ratings.flagProbability,
    source: ratings.source,
    createdAt: ratings.createdAt,
    memberName: members4.displayName,
    memberTier: members4.credibilityTier,
    memberAvatarUrl: members4.avatarUrl
  }).from(ratings).innerJoin(members4, eq3(ratings.memberId, members4.id)).where(and2(eq3(ratings.businessId, businessId), eq3(ratings.isFlagged, false))).orderBy(sql3`${ratings.createdAt} DESC`).limit(perPage).offset(offset);
  const [totalResult] = await db.select({ count: count2() }).from(ratings).where(and2(eq3(ratings.businessId, businessId), eq3(ratings.isFlagged, false)));
  return { ratings: ratingsResult, total: totalResult.count };
}
function generateSlug(name, city) {
  const base = `${name}-${city}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
  return base;
}
async function bulkImportBusinesses(places) {
  let imported = 0;
  let skipped = 0;
  const results = [];
  for (const place of places) {
    const [existing] = await db.select({ id: businesses.id }).from(businesses).where(eq3(businesses.googlePlaceId, place.placeId));
    if (existing) {
      skipped++;
      results.push({ name: place.name, status: "skipped_duplicate" });
      continue;
    }
    let slug = generateSlug(place.name, place.city);
    const [slugExists] = await db.select({ id: businesses.id }).from(businesses).where(eq3(businesses.slug, slug));
    if (slugExists) {
      slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    }
    const addressParts = place.address.split(",").map((p) => p.trim());
    const neighborhood = addressParts.length > 1 ? addressParts[1] : null;
    try {
      await db.insert(businesses).values({
        name: place.name,
        slug,
        category: place.category,
        city: place.city,
        neighborhood,
        address: place.address,
        lat: place.lat.toString(),
        lng: place.lng.toString(),
        googlePlaceId: place.placeId,
        googleRating: place.googleRating?.toString() || null,
        priceRange: place.priceRange,
        weightedScore: "0",
        rawAvgScore: "0",
        rankPosition: 0,
        totalRatings: 0,
        isActive: true,
        dataSource: "google_bulk_import"
      });
      imported++;
      results.push({ name: place.name, status: "imported" });
    } catch (err) {
      skipped++;
      results.push({ name: place.name, status: `error: ${err.message?.slice(0, 50)}` });
    }
  }
  return { imported, skipped, results };
}
async function getImportStats() {
  const rows = await db.select({
    city: businesses.city,
    dataSource: businesses.dataSource,
    count: count2(businesses.id)
  }).from(businesses).where(eq3(businesses.isActive, true)).groupBy(businesses.city, businesses.dataSource).orderBy(businesses.city);
  return rows.map((r) => ({ city: r.city, dataSource: r.dataSource || "unknown", count: Number(r.count) }));
}
var init_businesses = __esm({
  "server/storage/businesses.ts"() {
    "use strict";
    init_schema();
    init_db();
    init_score_engine();
    init_redis();
  }
});

// server/storage/notifications.ts
var notifications_exports = {};
__export(notifications_exports, {
  createNotification: () => createNotification,
  getMemberNotifications: () => getMemberNotifications,
  getUnreadNotificationCount: () => getUnreadNotificationCount,
  markAllNotificationsRead: () => markAllNotificationsRead,
  markNotificationRead: () => markNotificationRead
});
import { eq as eq4, and as and3, desc as desc3, count as count3 } from "drizzle-orm";
async function createNotification(data) {
  const [notif] = await db.insert(notifications).values({
    memberId: data.memberId,
    type: data.type,
    title: data.title,
    body: data.body,
    data: data.data || null
  }).returning();
  return notif;
}
async function getMemberNotifications(memberId, page = 1, perPage = 20) {
  const offset = (page - 1) * perPage;
  const [results, totalResult, unreadResult] = await Promise.all([
    db.select().from(notifications).where(eq4(notifications.memberId, memberId)).orderBy(desc3(notifications.createdAt)).limit(perPage).offset(offset),
    db.select({ count: count3() }).from(notifications).where(eq4(notifications.memberId, memberId)),
    db.select({ count: count3() }).from(notifications).where(and3(eq4(notifications.memberId, memberId), eq4(notifications.read, false)))
  ]);
  return {
    notifications: results,
    total: totalResult[0]?.count ?? 0,
    unreadCount: unreadResult[0]?.count ?? 0
  };
}
async function markNotificationRead(notificationId, memberId) {
  const result = await db.update(notifications).set({ read: true }).where(and3(eq4(notifications.id, notificationId), eq4(notifications.memberId, memberId)));
  return result.rowCount > 0;
}
async function markAllNotificationsRead(memberId) {
  const result = await db.update(notifications).set({ read: true }).where(and3(eq4(notifications.memberId, memberId), eq4(notifications.read, false)));
  return result.rowCount ?? 0;
}
async function getUnreadNotificationCount(memberId) {
  const [result] = await db.select({ count: count3() }).from(notifications).where(and3(eq4(notifications.memberId, memberId), eq4(notifications.read, false)));
  return result?.count ?? 0;
}
var init_notifications = __esm({
  "server/storage/notifications.ts"() {
    "use strict";
    init_schema();
    init_db();
  }
});

// server/push.ts
var push_exports = {};
__export(push_exports, {
  notifyChallengerResult: () => notifyChallengerResult,
  notifyNewChallenger: () => notifyNewChallenger,
  notifyTierUpgrade: () => notifyTierUpgrade,
  sendPushNotification: () => sendPushNotification
});
async function sendPushNotification(tokens2, title, body, data) {
  if (tokens2.length === 0) return [];
  const messages = tokens2.map((token) => ({
    to: token,
    title,
    body,
    data,
    sound: "default",
    channelId: "default"
  }));
  if (process.env.NODE_ENV !== "production") {
    pushLog.debug("DEV MODE \u2014 would send:", messages);
    return messages.map(() => ({ status: "ok", id: `dev-${Date.now()}` }));
  }
  try {
    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(messages)
    });
    const result = await response.json();
    return result.data;
  } catch (err) {
    pushLog.error("Failed to send:", err);
    return messages.map(() => ({ status: "error", message: String(err) }));
  }
}
async function persistNotification(memberId, type, title, body, data) {
  try {
    const { createNotification: createNotification2 } = await Promise.resolve().then(() => (init_notifications(), notifications_exports));
    await createNotification2({ memberId, type, title, body, data });
  } catch (err) {
    pushLog.error(`Failed to persist notification for ${memberId}: ${err}`);
  }
}
async function notifyTierUpgrade(userId, userToken, newTier) {
  const { getMemberById: getMemberById2 } = await Promise.resolve().then(() => (init_members(), members_exports));
  const member = await getMemberById2(userId);
  const prefs = member?.notificationPrefs || {};
  if (prefs.tierUpgrades === false) return;
  const title = "You've been promoted!";
  const body = `Your credibility just reached ${newTier} tier. Your ratings now carry more weight.`;
  await sendPushNotification([userToken], title, body, { screen: "profile" });
  persistNotification(userId, "tier_upgrade", title, body, { screen: "profile" });
}
async function notifyChallengerResult(followerIds, followerTokens, winnerName, category) {
  const { getMemberById: getMemberById2 } = await Promise.resolve().then(() => (init_members(), members_exports));
  const filteredTokens = [];
  const eligibleFollowerIds = [];
  for (let i = 0; i < followerIds.length; i++) {
    const member = await getMemberById2(followerIds[i]);
    const prefs = member?.notificationPrefs || {};
    if (prefs.challengerResults === false) continue;
    filteredTokens.push(followerTokens[i]);
    eligibleFollowerIds.push(followerIds[i]);
  }
  if (filteredTokens.length === 0) return;
  const title = `${category} Challenge ended`;
  const body = `${winnerName} wins! See the final results and stats.`;
  await sendPushNotification(filteredTokens, title, body, { screen: "challenger" });
  for (const uid of eligibleFollowerIds) {
    persistNotification(uid, "challenger_result", title, body, { screen: "challenger" });
  }
}
async function notifyNewChallenger(cityUserIds, cityTokens, defenderName, challengerName, category) {
  const { getMemberById: getMemberById2 } = await Promise.resolve().then(() => (init_members(), members_exports));
  const filteredTokens = [];
  const eligibleUserIds = [];
  for (let i = 0; i < cityUserIds.length; i++) {
    const member = await getMemberById2(cityUserIds[i]);
    const prefs = member?.notificationPrefs || {};
    if (prefs.newChallengers === false) continue;
    filteredTokens.push(cityTokens[i]);
    eligibleUserIds.push(cityUserIds[i]);
  }
  if (filteredTokens.length === 0) return;
  const title = `New ${category} Challenge`;
  const body = `${defenderName} vs ${challengerName} \u2014 30 days, weighted votes decide.`;
  await sendPushNotification(filteredTokens, title, body, { screen: "challenger" });
  for (const uid of eligibleUserIds) {
    persistNotification(uid, "new_challenger", title, body, { screen: "challenger" });
  }
}
var pushLog, EXPO_PUSH_URL;
var init_push = __esm({
  "server/push.ts"() {
    "use strict";
    init_logger();
    pushLog = log.tag("Push");
    EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
  }
});

// server/storage/challengers.ts
var challengers_exports = {};
__export(challengers_exports, {
  closeExpiredChallenges: () => closeExpiredChallenges,
  createChallenge: () => createChallenge,
  getActiveChallenges: () => getActiveChallenges,
  updateChallengerVotes: () => updateChallengerVotes
});
import { eq as eq5, and as and4, sql as sql5, lte } from "drizzle-orm";
async function createChallenge(data) {
  const endDate = /* @__PURE__ */ new Date();
  endDate.setDate(endDate.getDate() + 30);
  const [challenge] = await db.insert(challengers).values({
    challengerId: data.challengerId,
    defenderId: data.defenderId,
    category: data.category,
    city: data.city,
    entryFeePaid: true,
    stripePaymentIntentId: data.stripePaymentIntentId,
    endDate,
    status: "active"
  }).returning();
  log.info(`Challenge created: ${challenge.id} (${data.challengerId} vs ${data.defenderId})`);
  try {
    const [challengerBiz, defenderBiz] = await Promise.all([
      db.select().from(businesses).where(eq5(businesses.id, data.challengerId)).then((r) => r[0]),
      db.select().from(businesses).where(eq5(businesses.id, data.defenderId)).then((r) => r[0])
    ]);
    if (challengerBiz && defenderBiz) {
      const { getMembersWithPushTokenByCity: getMembersWithPushTokenByCity2 } = await Promise.resolve().then(() => (init_members(), members_exports));
      const cityMembers = await getMembersWithPushTokenByCity2(data.city);
      if (cityMembers.length > 0) {
        const { notifyNewChallenger: notifyNewChallenger2 } = await Promise.resolve().then(() => (init_push(), push_exports));
        notifyNewChallenger2(
          cityMembers.map((m) => m.id),
          cityMembers.map((m) => m.pushToken),
          defenderBiz.name,
          challengerBiz.name,
          data.category
        ).catch(() => {
        });
      }
    }
  } catch (err) {
    log.error(`Failed to send new challenger notification: ${err}`);
  }
  return challenge;
}
async function getActiveChallenges(city, category) {
  const challengerRows = await db.select().from(challengers).where(
    and4(
      eq5(challengers.status, "active"),
      eq5(challengers.city, city),
      ...category ? [eq5(challengers.category, category)] : []
    )
  );
  if (challengerRows.length === 0) return [];
  const bizIds = /* @__PURE__ */ new Set();
  for (const c of challengerRows) {
    bizIds.add(c.challengerId);
    bizIds.add(c.defenderId);
  }
  const bizIdArr = Array.from(bizIds);
  const bizRows = await db.select().from(businesses).where(sql5`${businesses.id} = ANY(ARRAY[${sql5.join(bizIdArr.map((id) => sql5`${id}`), sql5`,`)}]::text[])`);
  const bizMap = new Map(bizRows.map((b) => [b.id, b]));
  return challengerRows.map((c) => ({
    ...c,
    challengerBusiness: bizMap.get(c.challengerId),
    defenderBusiness: bizMap.get(c.defenderId)
  }));
}
async function updateChallengerVotes(businessId, weightedScore) {
  const asChallenger = await db.select().from(challengers).where(
    and4(eq5(challengers.challengerId, businessId), eq5(challengers.status, "active"))
  );
  for (const c of asChallenger) {
    const newVotes = parseFloat(c.challengerWeightedVotes) + weightedScore;
    await db.update(challengers).set({
      challengerWeightedVotes: newVotes.toFixed(3),
      totalVotes: sql5`${challengers.totalVotes} + 1`
    }).where(eq5(challengers.id, c.id));
  }
  const asDefender = await db.select().from(challengers).where(
    and4(eq5(challengers.defenderId, businessId), eq5(challengers.status, "active"))
  );
  for (const c of asDefender) {
    const newVotes = parseFloat(c.defenderWeightedVotes) + weightedScore;
    await db.update(challengers).set({
      defenderWeightedVotes: newVotes.toFixed(3),
      totalVotes: sql5`${challengers.totalVotes} + 1`
    }).where(eq5(challengers.id, c.id));
  }
}
async function closeExpiredChallenges() {
  const now = /* @__PURE__ */ new Date();
  const expired = await db.select().from(challengers).where(
    and4(
      eq5(challengers.status, "active"),
      lte(challengers.endDate, now)
    )
  );
  let closed = 0;
  for (const c of expired) {
    const challengerVotes = parseFloat(c.challengerWeightedVotes);
    const defenderVotes = parseFloat(c.defenderWeightedVotes);
    let winnerId = null;
    if (challengerVotes > defenderVotes) {
      winnerId = c.challengerId;
    } else if (defenderVotes > challengerVotes) {
      winnerId = c.defenderId;
    }
    await db.update(challengers).set({
      status: "completed",
      winnerId
    }).where(eq5(challengers.id, c.id));
    closed++;
    log.info(`Challenge ${c.id} closed: winner=${winnerId || "draw"} (${challengerVotes} vs ${defenderVotes})`);
    try {
      const winnerBiz = winnerId ? await db.select().from(businesses).where(eq5(businesses.id, winnerId)).then((r) => r[0]) : null;
      const winnerName = winnerBiz?.name || "It's a draw";
      const { getMembersWithPushTokenByCity: getMembersWithPushTokenByCity2 } = await Promise.resolve().then(() => (init_members(), members_exports));
      const cityMembers = await getMembersWithPushTokenByCity2(c.city);
      if (cityMembers.length > 0) {
        const { notifyChallengerResult: notifyChallengerResult2 } = await Promise.resolve().then(() => (init_push(), push_exports));
        notifyChallengerResult2(
          cityMembers.map((m) => m.id),
          cityMembers.map((m) => m.pushToken),
          winnerName,
          c.category
        ).catch(() => {
        });
      }
    } catch (err) {
      log.error(`Failed to send challenger result notification: ${err}`);
    }
  }
  if (closed > 0) {
    log.info(`Closed ${closed} expired challenge(s)`);
  }
  return closed;
}
var init_challengers = __esm({
  "server/storage/challengers.ts"() {
    "use strict";
    init_schema();
    init_db();
    init_logger();
  }
});

// server/storage/referrals.ts
var referrals_exports = {};
__export(referrals_exports, {
  activateReferral: () => activateReferral,
  createReferral: () => createReferral,
  getReferralStats: () => getReferralStats,
  getReferrerForMember: () => getReferrerForMember,
  resolveReferralCode: () => resolveReferralCode
});
import { eq as eq6, and as and5, desc as desc4 } from "drizzle-orm";
async function createReferral(referrerId, referredId, referralCode) {
  const [referral] = await db.insert(referrals).values({
    referrerId,
    referredId,
    referralCode,
    status: "signed_up"
  }).returning();
  return referral;
}
async function resolveReferralCode(code) {
  if (!code || code.trim().length === 0) return null;
  const username = code.trim().toLowerCase();
  const [member] = await db.select({ id: members.id }).from(members).where(eq6(members.username, username));
  return member?.id || null;
}
async function getReferralStats(memberId) {
  const rows = await db.select({
    id: referrals.id,
    referredName: members.displayName,
    referredUsername: members.username,
    status: referrals.status,
    createdAt: referrals.createdAt
  }).from(referrals).innerJoin(members, eq6(referrals.referredId, members.id)).where(eq6(referrals.referrerId, memberId)).orderBy(desc4(referrals.createdAt));
  const totalReferred = rows.length;
  const activated = rows.filter((r) => r.status === "activated").length;
  return { totalReferred, activated, referrals: rows };
}
async function activateReferral(referredId) {
  await db.update(referrals).set({ status: "activated", activatedAt: /* @__PURE__ */ new Date() }).where(and5(eq6(referrals.referredId, referredId), eq6(referrals.status, "signed_up")));
}
async function getReferrerForMember(memberId) {
  const [ref] = await db.select({ referrerId: referrals.referrerId }).from(referrals).where(eq6(referrals.referredId, memberId));
  return ref?.referrerId || null;
}
var init_referrals = __esm({
  "server/storage/referrals.ts"() {
    "use strict";
    init_schema();
    init_db();
  }
});

// server/storage/ratings.ts
var ratings_exports = {};
__export(ratings_exports, {
  deleteRating: () => deleteRating,
  editRating: () => editRating,
  getAutoFlaggedRatings: () => getAutoFlaggedRatings,
  getRatingById: () => getRatingById,
  reviewAutoFlaggedRating: () => reviewAutoFlaggedRating,
  submitRating: () => submitRating,
  submitRatingFlag: () => submitRatingFlag
});
import { eq as eq7, and as and6, sql as sql6, count as count5, gte as gte3, desc as desc5 } from "drizzle-orm";
async function getRatingById(id) {
  const [rating] = await db.select().from(ratings).where(eq7(ratings.id, id));
  return rating;
}
async function detectAnomalies(member, business, rawScore) {
  const flags = [];
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1e3);
  const [recentCount] = await db.select({ count: count5() }).from(ratings).where(
    and6(
      eq7(ratings.memberId, member.id),
      gte3(ratings.createdAt, oneHourAgo)
    )
  );
  if (recentCount.count > 5) flags.push("burst_velocity");
  const needsPatternCheck = member.totalRatings >= 5;
  if (needsPatternCheck) {
    const [patternStats] = await db.select({
      total: count5(),
      highCount: sql6`COUNT(*) FILTER (WHERE ${ratings.rawScore}::numeric >= 4.8)`,
      lowCount: sql6`COUNT(*) FILTER (WHERE ${ratings.rawScore}::numeric <= 1.5)`
    }).from(ratings).where(eq7(ratings.memberId, member.id));
    const total = Number(patternStats.total);
    if (total >= 10 && Number(patternStats.highCount) / total > 0.9) {
      flags.push("perfect_score_pattern");
    }
    if (rawScore <= 1.5 && total >= 5 && Number(patternStats.lowCount) / total > 0.6) {
      flags.push("one_star_bomber");
    }
  }
  if (member.totalRatings >= 8 && member.distinctBusinesses <= 2) {
    flags.push("single_business_fixation");
  }
  const accountAgeDays = Math.floor(
    (Date.now() - new Date(member.joinedAt).getTime()) / (1e3 * 60 * 60 * 24)
  );
  if (accountAgeDays < 7 && member.totalRatings > 15) {
    flags.push("new_account_high_volume");
  }
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1e3);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3);
  const [newAcctRatings] = await db.select({ count: count5() }).from(ratings).innerJoin(members, eq7(ratings.memberId, members.id)).where(
    and6(
      eq7(ratings.businessId, business.id),
      gte3(ratings.createdAt, oneDayAgo),
      gte3(members.joinedAt, thirtyDaysAgo)
    )
  );
  if (newAcctRatings.count > 10) {
    flags.push("coordinated_new_account_burst");
  }
  return flags;
}
async function submitRating(memberId, data, integrity) {
  const member = await getMemberById(memberId);
  if (!member) throw new Error("Member not found");
  if (member.isBanned) throw new Error("Account suspended");
  const business = await getBusinessById(data.businessId);
  if (!business) throw new Error("Business not found");
  const daysActive = Math.floor(
    (Date.now() - new Date(member.joinedAt).getTime()) / (1e3 * 60 * 60 * 24)
  );
  if (daysActive < 3) throw new Error("Account must be 3+ days old to rate");
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const [existingToday] = await db.select({ count: count5() }).from(ratings).where(
    and6(
      eq7(ratings.memberId, memberId),
      eq7(ratings.businessId, data.businessId),
      gte3(ratings.createdAt, today)
    )
  );
  if (existingToday.count > 0) throw new Error("Already rated today. Come back tomorrow.");
  const visitType = data.visitType;
  const dimensions = { foodScore: data.q1Score * 2 };
  switch (visitType) {
    case "dine_in":
      dimensions.serviceScore = data.q2Score * 2;
      dimensions.vibeScore = data.q3Score * 2;
      break;
    case "delivery":
      dimensions.packagingScore = data.q2Score * 2;
      dimensions.valueScore = data.q3Score * 2;
      break;
    case "takeaway":
      dimensions.waitTimeScore = data.q2Score * 2;
      dimensions.valueScore = data.q3Score * 2;
      break;
  }
  const compositeScore = computeComposite(visitType, dimensions);
  const rawScore = compositeScore / 2;
  const anomalyFlags = await detectAnomalies(member, business, rawScore);
  if (integrity?.velocityFlagged && integrity.velocityRule) {
    anomalyFlags.push(`velocity_${integrity.velocityRule}`);
  }
  const autoFlagged = anomalyFlags.length > 0;
  const baseWeight = getVoteWeight(member.credibilityScore);
  const gamingMult = integrity?.velocityFlagged ? integrity.velocityWeight ?? 0.05 : 1;
  const weight = integrity?.velocityFlagged ? Math.min(baseWeight, gamingMult) : baseWeight;
  const weighted = rawScore * weight;
  const dishCompleted = !!(data.dishId || data.newDishName);
  const timeOnPage = data.timeOnPageMs || 0;
  const timePlausible = timeOnPage >= 1e4;
  let vBoost = 0;
  if (dishCompleted) vBoost += 0.05;
  if (timePlausible) vBoost += 0.05;
  const cappedBoost = Math.min(vBoost, 0.5);
  const effWeight = baseWeight * (1 + cappedBoost) * gamingMult;
  const source = data.qrScanId ? "qr_scan" : "app";
  const [rating] = await db.insert(ratings).values({
    memberId,
    businessId: data.businessId,
    q1Score: data.q1Score,
    q2Score: data.q2Score,
    q3Score: data.q3Score,
    wouldReturn: data.wouldReturn,
    note: data.note || null,
    // Sprint 267: Persist visit type + dimensional scores
    visitType,
    foodScore: dimensions.foodScore.toFixed(1),
    serviceScore: dimensions.serviceScore?.toFixed(1) ?? null,
    vibeScore: dimensions.vibeScore?.toFixed(1) ?? null,
    packagingScore: dimensions.packagingScore?.toFixed(1) ?? null,
    waitTimeScore: dimensions.waitTimeScore?.toFixed(1) ?? null,
    valueScore: dimensions.valueScore?.toFixed(1) ?? null,
    compositeScore: compositeScore.toFixed(2),
    // Sprint 267: Verification signals
    dishFieldCompleted: dishCompleted,
    verificationBoost: cappedBoost.toFixed(3),
    effectiveWeight: effWeight.toFixed(4),
    gamingMultiplier: gamingMult.toFixed(2),
    gamingReason: integrity?.velocityFlagged ? `velocity_${integrity.velocityRule}` : null,
    timeOnPageMs: timeOnPage > 0 ? timeOnPage : null,
    rawScore: rawScore.toFixed(2),
    weight: weight.toFixed(4),
    weightedScore: weighted.toFixed(4),
    autoFlagged,
    flagReason: autoFlagged ? anomalyFlags.join(",") : null,
    source
  }).returning();
  let dishCreated = false;
  if (data.dishId) {
    await db.insert(dishVotes).values({
      ratingId: rating.id,
      dishId: data.dishId,
      memberId,
      businessId: data.businessId
    });
    await db.update(dishes).set({ voteCount: sql6`${dishes.voteCount} + 1` }).where(eq7(dishes.id, data.dishId));
  } else if (data.newDishName) {
    const normalized = data.newDishName.toLowerCase().trim();
    const words = normalized.split(/\s+/);
    if (words.length >= 1 && words.length <= 5 && !normalized.includes("http")) {
      const existing = await db.select().from(dishes).where(
        and6(
          eq7(dishes.businessId, data.businessId),
          eq7(dishes.nameNormalized, normalized)
        )
      );
      let dishId;
      if (existing.length > 0) {
        dishId = existing[0].id;
        await db.update(dishes).set({ voteCount: sql6`${dishes.voteCount} + 1` }).where(eq7(dishes.id, dishId));
      } else {
        const [newDish] = await db.insert(dishes).values({
          businessId: data.businessId,
          name: data.newDishName.trim(),
          nameNormalized: normalized,
          suggestedBy: "community",
          voteCount: 1
        }).returning();
        dishId = newDish.id;
        dishCreated = true;
      }
      await db.insert(dishVotes).values({
        ratingId: rating.id,
        dishId,
        memberId,
        businessId: data.businessId
      });
    }
  } else if (data.noNotableDish) {
    await db.insert(dishVotes).values({
      ratingId: rating.id,
      dishId: null,
      memberId,
      businessId: data.businessId,
      noNotableDish: true
    });
  }
  await updateMemberStats(memberId);
  const { score: newScore, tier: newTier } = await recalculateCredibilityScore(memberId);
  const oldTier = member.credibilityTier;
  const tierUpgraded = newTier !== oldTier;
  if (member.totalRatings === 0) {
    const { activateReferral: activateReferral2 } = await Promise.resolve().then(() => (init_referrals(), referrals_exports));
    activateReferral2(memberId).catch(() => {
    });
  }
  const prevRank = business.rankPosition;
  await recalculateBusinessScore(data.businessId);
  await recalculateRanks(business.city, business.category);
  await updateChallengerVotes(data.businessId, weighted);
  if (data.qrScanId) {
    const { qrScans: qrScans2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    await db.update(qrScans2).set({ converted: true }).where(eq7(qrScans2.id, data.qrScanId));
  }
  const updatedBusiness = await getBusinessById(data.businessId);
  const newRank = updatedBusiness?.rankPosition ?? null;
  const rankChanged = prevRank !== newRank;
  let rankDirection = "same";
  if (prevRank && newRank) {
    if (newRank < prevRank) rankDirection = "up";
    else if (newRank > prevRank) rankDirection = "down";
  }
  return {
    rating,
    newRank,
    prevRank: prevRank ?? null,
    rankChanged,
    rankDirection,
    newCredibilityScore: newScore,
    tierUpgraded,
    newTier,
    dishCreated
  };
}
async function editRating(ratingId, memberId, updates) {
  const existing = await getRatingById(ratingId);
  if (!existing) throw new Error("Rating not found");
  if (existing.memberId !== memberId) throw new Error("Cannot edit another user's rating");
  const hoursSinceCreation = (Date.now() - new Date(existing.createdAt).getTime()) / (1e3 * 60 * 60);
  if (hoursSinceCreation > 24) throw new Error("Edit window has expired (24 hours)");
  const q1 = updates.q1Score ?? existing.q1Score;
  const q2 = updates.q2Score ?? existing.q2Score;
  const q3 = updates.q3Score ?? existing.q3Score;
  const rawScore = ((q1 + q2 + q3) / 3).toFixed(2);
  const weightedScore = (parseFloat(rawScore) * parseFloat(existing.weight)).toFixed(3);
  const [updated] = await db.update(ratings).set({
    q1Score: q1,
    q2Score: q2,
    q3Score: q3,
    wouldReturn: updates.wouldReturn ?? existing.wouldReturn,
    note: updates.note !== void 0 ? updates.note : existing.note,
    rawScore,
    weightedScore
  }).where(eq7(ratings.id, ratingId)).returning();
  await recalculateBusinessScore(existing.businessId);
  await recalculateRanks(
    (await getBusinessById(existing.businessId))?.city || "dallas",
    (await getBusinessById(existing.businessId))?.category || ""
  );
  await updateMemberStats(memberId);
  return updated;
}
async function deleteRating(ratingId, memberId) {
  const existing = await getRatingById(ratingId);
  if (!existing) throw new Error("Rating not found");
  if (existing.memberId !== memberId) throw new Error("Cannot delete another user's rating");
  await db.update(ratings).set({
    isFlagged: true,
    flagReason: "user_deleted"
  }).where(eq7(ratings.id, ratingId));
  await recalculateBusinessScore(existing.businessId);
  await recalculateRanks(
    (await getBusinessById(existing.businessId))?.city || "dallas",
    (await getBusinessById(existing.businessId))?.category || ""
  );
  await updateMemberStats(memberId);
}
async function submitRatingFlag(ratingId, flaggerId, data) {
  const existing = await getRatingById(ratingId);
  if (!existing) throw new Error("Rating not found");
  if (existing.memberId === flaggerId) throw new Error("Cannot flag your own rating");
  const [flag] = await db.insert(ratingFlags).values({
    ratingId,
    flaggerId,
    q1NoSpecificExperience: data.q1NoSpecificExperience || false,
    q2ScoreMismatchNote: data.q2ScoreMismatchNote || false,
    q3InsiderSuspected: data.q3InsiderSuspected || false,
    q4CoordinatedPattern: data.q4CoordinatedPattern || false,
    q5CompetitorBombing: data.q5CompetitorBombing || false,
    explanation: data.explanation || ""
  }).returning();
  return flag;
}
async function getAutoFlaggedRatings(page = 1, perPage = 20) {
  const offset = (page - 1) * perPage;
  const { businesses: businesses2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const results = await db.select({
    id: ratings.id,
    memberId: ratings.memberId,
    businessId: ratings.businessId,
    q1Score: ratings.q1Score,
    q2Score: ratings.q2Score,
    q3Score: ratings.q3Score,
    rawScore: ratings.rawScore,
    note: ratings.note,
    flagReason: ratings.flagReason,
    flagProbability: ratings.flagProbability,
    autoFlagged: ratings.autoFlagged,
    isFlagged: ratings.isFlagged,
    createdAt: ratings.createdAt,
    businessName: businesses2.name,
    businessSlug: businesses2.slug
  }).from(ratings).innerJoin(businesses2, eq7(ratings.businessId, businesses2.id)).where(and6(eq7(ratings.autoFlagged, true), eq7(ratings.isFlagged, false))).orderBy(desc5(ratings.createdAt)).limit(perPage).offset(offset);
  const [totalResult] = await db.select({ count: count5() }).from(ratings).where(and6(eq7(ratings.autoFlagged, true), eq7(ratings.isFlagged, false)));
  return { ratings: results, total: totalResult?.count ?? 0 };
}
async function reviewAutoFlaggedRating(ratingId, action, reviewedBy) {
  if (action === "confirm") {
    await db.update(ratings).set({ isFlagged: true }).where(eq7(ratings.id, ratingId));
    const rating = await getRatingById(ratingId);
    if (rating) {
      await recalculateBusinessScore(rating.businessId);
      const biz = await getBusinessById(rating.businessId);
      if (biz) await recalculateRanks(biz.city, biz.category);
      await updateMemberStats(rating.memberId);
    }
  } else {
    await db.update(ratings).set({ autoFlagged: false }).where(eq7(ratings.id, ratingId));
  }
}
var init_ratings = __esm({
  "server/storage/ratings.ts"() {
    "use strict";
    init_schema();
    init_db();
    init_helpers();
    init_members();
    init_businesses();
    init_members();
    init_challengers();
    init_score_engine();
  }
});

// server/storage/dishes.ts
var dishes_exports = {};
__export(dishes_exports, {
  getBatchDishRankings: () => getBatchDishRankings,
  getBusinessDishRankings: () => getBusinessDishRankings,
  getBusinessDishes: () => getBusinessDishes,
  getDishLeaderboardWithEntries: () => getDishLeaderboardWithEntries,
  getDishLeaderboards: () => getDishLeaderboards,
  getDishSuggestions: () => getDishSuggestions,
  recalculateDishLeaderboard: () => recalculateDishLeaderboard,
  searchDishes: () => searchDishes,
  submitDishSuggestion: () => submitDishSuggestion,
  voteDishSuggestion: () => voteDishSuggestion
});
import { eq as eq8, and as and7, desc as desc6, asc as asc2, sql as sql7, count as count6 } from "drizzle-orm";
async function getBusinessDishes(businessId, limit = 5) {
  return db.select().from(dishes).where(and7(eq8(dishes.businessId, businessId), eq8(dishes.isActive, true))).orderBy(desc6(dishes.voteCount)).limit(limit);
}
async function searchDishes(businessId, query) {
  const normalized = query.slice(0, 100).replace(/[%_\\]/g, "").toLowerCase().trim();
  if (normalized.length < 2) {
    return getBusinessDishes(businessId, 5);
  }
  let results = await db.select().from(dishes).where(
    and7(
      eq8(dishes.businessId, businessId),
      eq8(dishes.isActive, true),
      sql7`${dishes.nameNormalized} ILIKE ${normalized + "%"}`
    )
  ).orderBy(desc6(dishes.voteCount)).limit(5);
  if (results.length < 3) {
    const containsResults = await db.select().from(dishes).where(
      and7(
        eq8(dishes.businessId, businessId),
        eq8(dishes.isActive, true),
        sql7`${dishes.nameNormalized} ILIKE ${"%" + normalized + "%"}`
      )
    ).orderBy(desc6(dishes.voteCount)).limit(5);
    const existingIds = new Set(results.map((r) => r.id));
    for (const r of containsResults) {
      if (!existingIds.has(r.id)) {
        results.push(r);
      }
    }
  }
  return results.slice(0, 5);
}
async function getDishLeaderboards(city) {
  const boards = await db.select().from(dishLeaderboards).where(and7(eq8(dishLeaderboards.city, city.toLowerCase()), eq8(dishLeaderboards.status, "active"))).orderBy(asc2(dishLeaderboards.displayOrder));
  const result = [];
  for (const board of boards) {
    const [entryResult] = await db.select({ cnt: count6() }).from(dishLeaderboardEntries).where(eq8(dishLeaderboardEntries.leaderboardId, board.id));
    result.push({ ...board, entryCount: Number(entryResult?.cnt ?? 0) });
  }
  return result;
}
async function getDishLeaderboardWithEntries(slug, city) {
  const [board] = await db.select().from(dishLeaderboards).where(and7(eq8(dishLeaderboards.dishSlug, slug), eq8(dishLeaderboards.city, city.toLowerCase())));
  if (!board) return null;
  const entries = await db.select({
    id: dishLeaderboardEntries.id,
    leaderboardId: dishLeaderboardEntries.leaderboardId,
    businessId: dishLeaderboardEntries.businessId,
    dishScore: dishLeaderboardEntries.dishScore,
    dishRatingCount: dishLeaderboardEntries.dishRatingCount,
    rankPosition: dishLeaderboardEntries.rankPosition,
    previousRank: dishLeaderboardEntries.previousRank,
    photoUrl: dishLeaderboardEntries.photoUrl,
    updatedAt: dishLeaderboardEntries.updatedAt,
    businessName: businesses.name,
    businessSlug: businesses.slug,
    neighborhood: businesses.neighborhood
  }).from(dishLeaderboardEntries).innerJoin(businesses, eq8(dishLeaderboardEntries.businessId, businesses.id)).where(eq8(dishLeaderboardEntries.leaderboardId, board.id)).orderBy(asc2(dishLeaderboardEntries.rankPosition));
  const eligibleCount = entries.filter((e) => e.dishRatingCount >= 3).length;
  const isProvisional = board.createdAt.getTime() > Date.now() - 14 * 24 * 60 * 60 * 1e3;
  return {
    leaderboard: board,
    entries,
    isProvisional,
    minRatingsNeeded: Math.max(0, board.minRatingCount - eligibleCount)
  };
}
async function recalculateDishLeaderboard(leaderboardId) {
  const [board] = await db.select().from(dishLeaderboards).where(eq8(dishLeaderboards.id, leaderboardId));
  if (!board) return 0;
  const dishSlug = board.dishSlug;
  const matchingDishes = await db.select({
    businessId: dishes.businessId,
    dishId: dishes.id
  }).from(dishes).innerJoin(businesses, eq8(dishes.businessId, businesses.id)).where(
    and7(
      eq8(businesses.city, board.city),
      sql7`${dishes.nameNormalized} ILIKE ${"%" + dishSlug + "%"}`,
      eq8(dishes.isActive, true)
    )
  );
  if (matchingDishes.length === 0) return 0;
  const bizDishMap = /* @__PURE__ */ new Map();
  for (const m of matchingDishes) {
    if (!bizDishMap.has(m.businessId)) bizDishMap.set(m.businessId, []);
    bizDishMap.get(m.businessId).push(m.dishId);
  }
  const entries = [];
  for (const [businessId, dishIds] of bizDishMap) {
    const votes = await db.select({
      ratingId: dishVotes.ratingId,
      memberId: dishVotes.memberId
    }).from(dishVotes).where(
      and7(
        eq8(dishVotes.businessId, businessId),
        sql7`${dishVotes.dishId} = ANY(ARRAY[${sql7.join(dishIds.map((id) => sql7`${id}`), sql7`,`)}]::text[])`
      )
    );
    if (votes.length === 0) continue;
    const ratingIds = votes.map((v) => v.ratingId);
    const ratingRows = await db.select({
      id: ratings.id,
      q1Score: ratings.q1Score,
      q2Score: ratings.q2Score,
      q3Score: ratings.q3Score,
      weight: ratings.weight,
      isFlagged: ratings.isFlagged
    }).from(ratings).where(sql7`${ratings.id} = ANY(ARRAY[${sql7.join(ratingIds.map((id) => sql7`${id}`), sql7`,`)}]::text[])`);
    let totalWeight = 0;
    let weightedSum = 0;
    let validCount = 0;
    for (const r of ratingRows) {
      if (r.isFlagged) continue;
      const rawScore = (r.q1Score + r.q2Score + r.q3Score) / 3;
      const w = parseFloat(r.weight);
      weightedSum += rawScore * w;
      totalWeight += w;
      validCount++;
    }
    if (validCount < 1) continue;
    const dishScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
    const [photo] = await db.select({ photoUrl: businessPhotos.photoUrl }).from(businessPhotos).where(eq8(businessPhotos.businessId, businessId)).orderBy(asc2(businessPhotos.sortOrder)).limit(1);
    entries.push({
      businessId,
      dishScore: Math.round(dishScore * 100) / 100,
      dishRatingCount: validCount,
      photoUrl: photo?.photoUrl ?? null
    });
  }
  entries.sort((a, b) => b.dishScore - a.dishScore);
  await db.delete(dishLeaderboardEntries).where(eq8(dishLeaderboardEntries.leaderboardId, leaderboardId));
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    await db.insert(dishLeaderboardEntries).values({
      leaderboardId,
      businessId: e.businessId,
      dishScore: e.dishScore.toFixed(2),
      dishRatingCount: e.dishRatingCount,
      rankPosition: i + 1,
      photoUrl: e.photoUrl
    });
  }
  return entries.length;
}
async function getDishSuggestions(city) {
  return db.select().from(dishSuggestions).where(and7(eq8(dishSuggestions.city, city.toLowerCase()), eq8(dishSuggestions.status, "proposed"))).orderBy(desc6(dishSuggestions.voteCount)).limit(20);
}
async function submitDishSuggestion(memberId, city, dishName) {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3);
  const [recentCount] = await db.select({ cnt: count6() }).from(dishSuggestions).where(
    and7(
      eq8(dishSuggestions.suggestedBy, memberId),
      sql7`${dishSuggestions.createdAt} >= ${oneWeekAgo}`
    )
  );
  if (Number(recentCount.cnt) >= 3) {
    throw new Error("You can only suggest 3 dishes per week");
  }
  const [suggestion] = await db.insert(dishSuggestions).values({
    city: city.toLowerCase(),
    dishName: dishName.trim(),
    suggestedBy: memberId
  }).returning();
  return suggestion;
}
async function voteDishSuggestion(memberId, suggestionId) {
  const [existingVote] = await db.select().from(dishSuggestionVotes).where(
    and7(
      eq8(dishSuggestionVotes.suggestionId, suggestionId),
      eq8(dishSuggestionVotes.memberId, memberId)
    )
  );
  if (existingVote) {
    throw new Error("Already voted for this suggestion");
  }
  await db.insert(dishSuggestionVotes).values({ suggestionId, memberId });
  const [updated] = await db.update(dishSuggestions).set({ voteCount: sql7`${dishSuggestions.voteCount} + 1` }).where(eq8(dishSuggestions.id, suggestionId)).returning();
  if (!updated) throw new Error("Suggestion not found");
  if (updated.voteCount >= updated.activationThreshold) {
    await db.update(dishSuggestions).set({ status: "active" }).where(eq8(dishSuggestions.id, suggestionId));
    const slug = updated.dishName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const [existing] = await db.select().from(dishLeaderboards).where(and7(eq8(dishLeaderboards.city, updated.city), eq8(dishLeaderboards.dishSlug, slug)));
    if (!existing) {
      await db.insert(dishLeaderboards).values({
        city: updated.city,
        dishName: updated.dishName,
        dishSlug: slug,
        source: "community"
      });
    }
  }
  return updated;
}
async function getBusinessDishRankings(businessId) {
  const entries = await db.select({
    dishSlug: dishLeaderboards.dishSlug,
    dishName: dishLeaderboards.dishName,
    dishEmoji: dishLeaderboards.dishEmoji,
    rankPosition: dishLeaderboardEntries.rankPosition,
    dishScore: dishLeaderboardEntries.dishScore
  }).from(dishLeaderboardEntries).innerJoin(dishLeaderboards, eq8(dishLeaderboardEntries.leaderboardId, dishLeaderboards.id)).where(eq8(dishLeaderboardEntries.businessId, businessId)).orderBy(asc2(dishLeaderboardEntries.rankPosition));
  const result = [];
  for (const entry of entries) {
    const [countResult] = await db.select({ count: count6() }).from(dishLeaderboardEntries).innerJoin(dishLeaderboards, eq8(dishLeaderboardEntries.leaderboardId, dishLeaderboards.id)).where(eq8(dishLeaderboards.dishSlug, entry.dishSlug));
    result.push({
      ...entry,
      entryCount: countResult?.count || 0
    });
  }
  return result;
}
async function getBatchDishRankings(businessIds) {
  if (businessIds.length === 0) return {};
  const entries = await db.select({
    businessId: dishLeaderboardEntries.businessId,
    dishSlug: dishLeaderboards.dishSlug,
    dishName: dishLeaderboards.dishName,
    dishEmoji: dishLeaderboards.dishEmoji,
    rankPosition: dishLeaderboardEntries.rankPosition
  }).from(dishLeaderboardEntries).innerJoin(dishLeaderboards, eq8(dishLeaderboardEntries.leaderboardId, dishLeaderboards.id)).where(sql7`${dishLeaderboardEntries.businessId} = ANY(ARRAY[${sql7.join(businessIds.map((id) => sql7`${id}`), sql7`,`)}]::text[])`).orderBy(asc2(dishLeaderboardEntries.rankPosition));
  const result = {};
  for (const entry of entries) {
    if (!result[entry.businessId]) result[entry.businessId] = [];
    if (result[entry.businessId].length < 3) {
      result[entry.businessId].push({
        dishSlug: entry.dishSlug,
        dishName: entry.dishName,
        dishEmoji: entry.dishEmoji,
        rankPosition: entry.rankPosition
      });
    }
  }
  return result;
}
var init_dishes = __esm({
  "server/storage/dishes.ts"() {
    "use strict";
    init_schema();
    init_db();
  }
});

// server/storage/categories.ts
import { eq as eq9, desc as desc7 } from "drizzle-orm";
async function getDbCategories(activeOnly = true) {
  if (activeOnly) {
    return db.select().from(categories).where(eq9(categories.isActive, true));
  }
  return db.select().from(categories);
}
async function createCategorySuggestion(data) {
  const [suggestion] = await db.insert(categorySuggestions).values({
    name: data.name,
    description: data.description,
    vertical: data.vertical,
    suggestedBy: data.suggestedBy
  }).returning();
  return suggestion;
}
async function getPendingSuggestions() {
  return db.select().from(categorySuggestions).where(eq9(categorySuggestions.status, "pending")).orderBy(desc7(categorySuggestions.voteCount));
}
async function reviewSuggestion(id, status, reviewedBy) {
  const [updated] = await db.update(categorySuggestions).set({ status, reviewedBy, reviewedAt: /* @__PURE__ */ new Date() }).where(eq9(categorySuggestions.id, id)).returning();
  return updated;
}
var init_categories = __esm({
  "server/storage/categories.ts"() {
    "use strict";
    init_db();
    init_schema();
  }
});

// server/storage/badges.ts
import { eq as eq10, and as and8, count as count7, desc as desc8 } from "drizzle-orm";
async function getMemberBadges(memberId) {
  return db.select().from(memberBadges).where(eq10(memberBadges.memberId, memberId)).orderBy(memberBadges.earnedAt);
}
async function getMemberBadgeCount(memberId) {
  const [result] = await db.select({ cnt: count7() }).from(memberBadges).where(eq10(memberBadges.memberId, memberId));
  return Number(result?.cnt ?? 0);
}
async function awardBadge(memberId, badgeId, badgeFamily) {
  try {
    const [badge] = await db.insert(memberBadges).values({ memberId, badgeId, badgeFamily }).onConflictDoNothing().returning();
    return badge ?? null;
  } catch {
    return null;
  }
}
async function hasBadge(memberId, badgeId) {
  const [result] = await db.select({ cnt: count7() }).from(memberBadges).where(and8(eq10(memberBadges.memberId, memberId), eq10(memberBadges.badgeId, badgeId)));
  return Number(result?.cnt ?? 0) > 0;
}
async function getEarnedBadgeIds(memberId) {
  const rows = await db.select({ badgeId: memberBadges.badgeId }).from(memberBadges).where(eq10(memberBadges.memberId, memberId));
  return rows.map((r) => r.badgeId);
}
async function getBadgeLeaderboard(limit = 20) {
  return db.select({
    memberId: memberBadges.memberId,
    displayName: members.displayName,
    username: members.username,
    avatarUrl: members.avatarUrl,
    credibilityTier: members.credibilityTier,
    badgeCount: count7(memberBadges.id)
  }).from(memberBadges).innerJoin(members, eq10(memberBadges.memberId, members.id)).groupBy(memberBadges.memberId, members.displayName, members.username, members.avatarUrl, members.credibilityTier).orderBy(desc8(count7(memberBadges.id))).limit(limit);
}
var init_badges = __esm({
  "server/storage/badges.ts"() {
    "use strict";
    init_schema();
    init_db();
  }
});

// server/storage/payments.ts
import { eq as eq11, and as and9, desc as desc9, sql as sql8, count as count8, sum } from "drizzle-orm";
async function createPaymentRecord(params) {
  const [payment] = await db.insert(payments).values({
    memberId: params.memberId,
    businessId: params.businessId || null,
    type: params.type,
    amount: params.amount,
    currency: params.currency || "usd",
    stripePaymentIntentId: params.stripePaymentIntentId || null,
    status: params.status,
    metadata: params.metadata || null
  }).returning();
  return payment;
}
async function getPaymentById(id) {
  const [payment] = await db.select().from(payments).where(eq11(payments.id, id)).limit(1);
  return payment ?? null;
}
async function updatePaymentStatus(id, status) {
  const [updated] = await db.update(payments).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq11(payments.id, id)).returning();
  return updated ?? null;
}
async function updatePaymentStatusByStripeId(stripePaymentIntentId, status) {
  const [updated] = await db.update(payments).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq11(payments.stripePaymentIntentId, stripePaymentIntentId)).returning();
  return updated ?? null;
}
async function getMemberPayments(memberId, limit = 20) {
  return db.select().from(payments).where(eq11(payments.memberId, memberId)).orderBy(desc9(payments.createdAt)).limit(limit);
}
async function getBusinessPayments(businessId, limit = 20) {
  return db.select().from(payments).where(eq11(payments.businessId, businessId)).orderBy(desc9(payments.createdAt)).limit(limit);
}
async function getRevenueMetrics() {
  const byTypeRows = await db.select({
    type: payments.type,
    count: count8(),
    revenue: sum(payments.amount)
  }).from(payments).where(eq11(payments.status, "succeeded")).groupBy(payments.type);
  const [activeRow] = await db.select({ count: count8() }).from(payments).where(
    and9(
      eq11(payments.status, "succeeded")
    )
  );
  const [cancelledRow] = await db.select({ count: count8() }).from(payments).where(eq11(payments.status, "cancelled"));
  const typeMap = {
    challenger_entry: { count: 0, revenue: 0 },
    dashboard_pro: { count: 0, revenue: 0 },
    featured_placement: { count: 0, revenue: 0 }
  };
  let totalRevenue = 0;
  for (const row of byTypeRows) {
    const rev = Number(row.revenue) || 0;
    const cnt = Number(row.count) || 0;
    typeMap[row.type] = { count: cnt, revenue: rev };
    totalRevenue += rev;
  }
  return {
    totalRevenue,
    byType: typeMap,
    activeSubscriptions: activeRow?.count ?? 0,
    cancelledPayments: cancelledRow?.count ?? 0
  };
}
async function getRevenueByMonth(months = 6) {
  const results = await db.select({
    month: sql8`strftime('%Y-%m', ${payments.createdAt})`,
    revenue: sql8`COALESCE(SUM(${payments.amount}), 0)`,
    count: sql8`COUNT(*)`
  }).from(payments).where(eq11(payments.status, "succeeded")).groupBy(sql8`strftime('%Y-%m', ${payments.createdAt})`).orderBy(sql8`strftime('%Y-%m', ${payments.createdAt}) DESC`).limit(months);
  return results.map((r) => ({
    month: String(r.month),
    revenue: Number(r.revenue),
    count: Number(r.count)
  }));
}
var init_payments = __esm({
  "server/storage/payments.ts"() {
    "use strict";
    init_schema();
    init_db();
  }
});

// server/storage/webhook-events.ts
import { eq as eq12, desc as desc10 } from "drizzle-orm";
async function logWebhookEvent(params) {
  const [event] = await db.insert(webhookEvents).values({
    source: params.source,
    eventId: params.eventId,
    eventType: params.eventType,
    payload: params.payload,
    processed: params.processed ?? false,
    error: params.error || null
  }).returning();
  return event;
}
async function markWebhookProcessed(id, error) {
  await db.update(webhookEvents).set({ processed: true, error: error || null }).where(eq12(webhookEvents.id, id));
}
async function getWebhookEventById(id) {
  const [event] = await db.select().from(webhookEvents).where(eq12(webhookEvents.id, id)).limit(1);
  return event ?? null;
}
async function getRecentWebhookEvents(source, limit = 50) {
  return db.select().from(webhookEvents).where(eq12(webhookEvents.source, source)).orderBy(desc10(webhookEvents.createdAt)).limit(limit);
}
var init_webhook_events = __esm({
  "server/storage/webhook-events.ts"() {
    "use strict";
    init_schema();
    init_db();
  }
});

// server/storage/featured-placements.ts
import { eq as eq13, and as and10, gt, lte as lte2, desc as desc11 } from "drizzle-orm";
async function createFeaturedPlacement(params) {
  const startsAt = /* @__PURE__ */ new Date();
  const expiresAt = new Date(startsAt.getTime() + FEATURED_DURATION_DAYS * 24 * 60 * 60 * 1e3);
  const [placement] = await db.insert(featuredPlacements).values({
    businessId: params.businessId,
    paymentId: params.paymentId || null,
    city: params.city,
    startsAt,
    expiresAt,
    status: "active"
  }).returning();
  return placement;
}
async function getActiveFeaturedInCity(city) {
  const now = /* @__PURE__ */ new Date();
  return db.select().from(featuredPlacements).where(
    and10(
      eq13(featuredPlacements.city, city),
      eq13(featuredPlacements.status, "active"),
      gt(featuredPlacements.expiresAt, now)
    )
  ).orderBy(desc11(featuredPlacements.createdAt));
}
async function getBusinessFeaturedStatus(businessId) {
  const now = /* @__PURE__ */ new Date();
  const [placement] = await db.select().from(featuredPlacements).where(
    and10(
      eq13(featuredPlacements.businessId, businessId),
      eq13(featuredPlacements.status, "active"),
      gt(featuredPlacements.expiresAt, now)
    )
  ).orderBy(desc11(featuredPlacements.createdAt)).limit(1);
  return placement ?? null;
}
async function expireFeaturedByPayment(paymentId) {
  const [updated] = await db.update(featuredPlacements).set({ status: "cancelled" }).where(
    and10(
      eq13(featuredPlacements.paymentId, paymentId),
      eq13(featuredPlacements.status, "active")
    )
  ).returning();
  return updated ?? null;
}
async function expireOldPlacements() {
  const now = /* @__PURE__ */ new Date();
  const result = await db.update(featuredPlacements).set({ status: "expired" }).where(
    and10(
      eq13(featuredPlacements.status, "active"),
      lte2(featuredPlacements.expiresAt, now)
    )
  ).returning();
  return result.length;
}
var FEATURED_DURATION_DAYS;
var init_featured_placements = __esm({
  "server/storage/featured-placements.ts"() {
    "use strict";
    init_schema();
    init_db();
    FEATURED_DURATION_DAYS = 7;
  }
});

// server/storage/claims.ts
import { eq as eq14, and as and11, count as count9, desc as desc12 } from "drizzle-orm";
async function submitClaim(businessId, memberId, verificationMethod) {
  const [claim] = await db.insert(businessClaims).values({ businessId, memberId, verificationMethod }).returning();
  return claim;
}
async function getClaimByMemberAndBusiness(memberId, businessId) {
  const [claim] = await db.select().from(businessClaims).where(
    and11(
      eq14(businessClaims.memberId, memberId),
      eq14(businessClaims.businessId, businessId)
    )
  );
  return claim;
}
async function getPendingClaims() {
  return db.select({
    id: businessClaims.id,
    businessId: businessClaims.businessId,
    businessName: businesses.name,
    memberId: businessClaims.memberId,
    memberName: members.displayName,
    verificationMethod: businessClaims.verificationMethod,
    status: businessClaims.status,
    submittedAt: businessClaims.submittedAt
  }).from(businessClaims).leftJoin(businesses, eq14(businessClaims.businessId, businesses.id)).leftJoin(members, eq14(businessClaims.memberId, members.id)).where(eq14(businessClaims.status, "pending")).orderBy(desc12(businessClaims.submittedAt));
}
async function reviewClaim(id, status, reviewedBy) {
  const [updated] = await db.update(businessClaims).set({ status, reviewedAt: /* @__PURE__ */ new Date() }).where(eq14(businessClaims.id, id)).returning();
  if (!updated) return null;
  if (status === "approved" && updated.businessId && updated.memberId) {
    await db.update(businesses).set({
      ownerId: updated.memberId,
      isClaimed: true,
      claimedAt: /* @__PURE__ */ new Date()
    }).where(eq14(businesses.id, updated.businessId));
  }
  return updated;
}
async function getClaimCount() {
  const [result] = await db.select({ cnt: count9() }).from(businessClaims).where(eq14(businessClaims.status, "pending"));
  return Number(result?.cnt ?? 0);
}
async function getPendingFlags() {
  return db.select({
    id: ratingFlags.id,
    ratingId: ratingFlags.ratingId,
    flaggerName: members.displayName,
    explanation: ratingFlags.explanation,
    aiFraudProbability: ratingFlags.aiFraudProbability,
    status: ratingFlags.status,
    createdAt: ratingFlags.createdAt
  }).from(ratingFlags).leftJoin(members, eq14(ratingFlags.flaggerId, members.id)).where(eq14(ratingFlags.status, "pending")).orderBy(desc12(ratingFlags.createdAt));
}
async function reviewFlag(id, status, reviewedBy) {
  const [updated] = await db.update(ratingFlags).set({ status, reviewedBy, reviewedAt: /* @__PURE__ */ new Date() }).where(eq14(ratingFlags.id, id)).returning();
  return updated ?? null;
}
async function getFlagCount() {
  const [result] = await db.select({ cnt: count9() }).from(ratingFlags).where(eq14(ratingFlags.status, "pending"));
  return Number(result?.cnt ?? 0);
}
var init_claims = __esm({
  "server/storage/claims.ts"() {
    "use strict";
    init_schema();
    init_db();
  }
});

// server/storage/qr.ts
import { eq as eq15, count as count10, and as and12, gte as gte4, sql as sql9 } from "drizzle-orm";
async function recordQrScan(businessId, memberId) {
  const [scan] = await db.insert(qrScans).values({
    businessId,
    memberId: memberId || void 0
  }).returning({ id: qrScans.id });
  return scan;
}
async function getQrScanStats(businessId) {
  const now = /* @__PURE__ */ new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3);
  const [totalResult] = await db.select({ cnt: count10() }).from(qrScans).where(eq15(qrScans.businessId, businessId));
  const totalScans = Number(totalResult?.cnt ?? 0);
  const [uniqueResult] = await db.select({ cnt: sql9`count(distinct ${qrScans.memberId})` }).from(qrScans).where(eq15(qrScans.businessId, businessId));
  const uniqueMembers = Number(uniqueResult?.cnt ?? 0);
  const [conversionResult] = await db.select({ cnt: count10() }).from(qrScans).where(and12(eq15(qrScans.businessId, businessId), eq15(qrScans.converted, true)));
  const conversions = Number(conversionResult?.cnt ?? 0);
  const [weekResult] = await db.select({ cnt: count10() }).from(qrScans).where(and12(eq15(qrScans.businessId, businessId), gte4(qrScans.scannedAt, sevenDaysAgo)));
  const last7Days = Number(weekResult?.cnt ?? 0);
  const [monthResult] = await db.select({ cnt: count10() }).from(qrScans).where(and12(eq15(qrScans.businessId, businessId), gte4(qrScans.scannedAt, thirtyDaysAgo)));
  const last30Days = Number(monthResult?.cnt ?? 0);
  const conversionRate = totalScans > 0 ? Math.round(conversions / totalScans * 100) : 0;
  return { totalScans, uniqueMembers, conversions, conversionRate, last7Days, last30Days };
}
async function markQrScanConverted(scanId) {
  await db.update(qrScans).set({ converted: true }).where(eq15(qrScans.id, scanId));
}
var init_qr = __esm({
  "server/storage/qr.ts"() {
    "use strict";
    init_schema();
    init_db();
  }
});

// server/storage/beta-invites.ts
import { eq as eq16 } from "drizzle-orm";
async function createBetaInvite(params) {
  const [invite] = await db.insert(betaInvites).values({
    email: params.email,
    displayName: params.displayName,
    referralCode: params.referralCode,
    invitedBy: params.invitedBy
  }).returning();
  return invite;
}
async function getBetaInviteByEmail(email) {
  const [invite] = await db.select().from(betaInvites).where(eq16(betaInvites.email, email));
  return invite;
}
async function markBetaInviteJoined(email, memberId) {
  await db.update(betaInvites).set({ status: "joined", joinedAt: /* @__PURE__ */ new Date(), memberId }).where(eq16(betaInvites.email, email));
}
async function getBetaInviteStats() {
  const invites = await db.select().from(betaInvites);
  const joined = invites.filter((i) => i.status === "joined").length;
  return {
    total: invites.length,
    joined,
    pending: invites.length - joined,
    invites
  };
}
var init_beta_invites = __esm({
  "server/storage/beta-invites.ts"() {
    "use strict";
    init_schema();
    init_db();
  }
});

// server/storage/analytics.ts
var analytics_exports = {};
__export(analytics_exports, {
  DATA_RETENTION_POLICY: () => DATA_RETENTION_POLICY,
  getPersistedDailyStats: () => getPersistedDailyStats,
  getPersistedDailyStatsExtended: () => getPersistedDailyStatsExtended,
  getPersistedEventCounts: () => getPersistedEventCounts,
  getPersistedEventTotal: () => getPersistedEventTotal,
  persistAnalyticsEvents: () => persistAnalyticsEvents,
  purgeOldAnalyticsEvents: () => purgeOldAnalyticsEvents
});
import { gte as gte5, lt, sql as sql10, count as count11 } from "drizzle-orm";
async function persistAnalyticsEvents(entries) {
  if (entries.length === 0) return;
  const values = entries.map((e) => ({
    event: e.event,
    userId: e.userId || null,
    metadata: e.metadata || null,
    createdAt: new Date(e.timestamp)
  }));
  const CHUNK_SIZE = 100;
  for (let i = 0; i < values.length; i += CHUNK_SIZE) {
    const chunk = values.slice(i, i + CHUNK_SIZE);
    await db.insert(analyticsEvents).values(chunk);
  }
}
async function getPersistedEventCounts(since) {
  const rows = await db.select({
    event: analyticsEvents.event,
    count: count11()
  }).from(analyticsEvents).where(gte5(analyticsEvents.createdAt, since)).groupBy(analyticsEvents.event);
  const result = {};
  for (const row of rows) {
    result[row.event] = row.count;
  }
  return result;
}
async function getPersistedDailyStats(days) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1e3);
  const rows = await db.select({
    date: sql10`DATE(${analyticsEvents.createdAt})`,
    count: count11()
  }).from(analyticsEvents).where(gte5(analyticsEvents.createdAt, since)).groupBy(sql10`DATE(${analyticsEvents.createdAt})`).orderBy(sql10`DATE(${analyticsEvents.createdAt})`);
  return rows.map((r) => ({ date: r.date, events: r.count }));
}
async function getPersistedDailyStatsExtended(days) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1e3);
  const rows = await db.select({
    date: sql10`DATE(${analyticsEvents.createdAt})`,
    event: analyticsEvents.event,
    count: count11()
  }).from(analyticsEvents).where(gte5(analyticsEvents.createdAt, since)).groupBy(sql10`DATE(${analyticsEvents.createdAt})`, analyticsEvents.event).orderBy(sql10`DATE(${analyticsEvents.createdAt})`, analyticsEvents.event);
  return rows.map((r) => ({ date: r.date, event: r.event, count: r.count }));
}
async function getPersistedEventTotal() {
  const [result] = await db.select({ count: count11() }).from(analyticsEvents);
  return result.count;
}
async function purgeOldAnalyticsEvents(retentionDays = 90) {
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1e3);
  const result = await db.delete(analyticsEvents).where(lt(analyticsEvents.createdAt, cutoff));
  return result.rowCount ?? 0;
}
var DATA_RETENTION_POLICY;
var init_analytics = __esm({
  "server/storage/analytics.ts"() {
    "use strict";
    init_schema();
    init_db();
    DATA_RETENTION_POLICY = {
      analyticsEvents: { retentionDays: 90, description: "Analytics events older than 90 days are purged" },
      betaInvites: { retentionDays: 365, description: "Beta invite records retained for 1 year" }
    };
  }
});

// server/storage/user-activity.ts
var user_activity_exports = {};
__export(user_activity_exports, {
  getActiveUserStatsDb: () => getActiveUserStatsDb,
  recordUserActivityDb: () => recordUserActivityDb
});
import { gte as gte6, count as count12 } from "drizzle-orm";
async function recordUserActivityDb(userId) {
  await db.insert(userActivity).values({ userId, lastSeenAt: /* @__PURE__ */ new Date() }).onConflictDoUpdate({
    target: userActivity.userId,
    set: { lastSeenAt: /* @__PURE__ */ new Date() }
  });
}
async function getActiveUserStatsDb() {
  const now = Date.now();
  const windows = {
    last1h: new Date(now - 60 * 60 * 1e3),
    last24h: new Date(now - 24 * 60 * 60 * 1e3),
    last7d: new Date(now - 7 * 24 * 60 * 60 * 1e3),
    last30d: new Date(now - 30 * 24 * 60 * 60 * 1e3)
  };
  const [r1h, r24h, r7d, r30d] = await Promise.all([
    db.select({ count: count12() }).from(userActivity).where(gte6(userActivity.lastSeenAt, windows.last1h)),
    db.select({ count: count12() }).from(userActivity).where(gte6(userActivity.lastSeenAt, windows.last24h)),
    db.select({ count: count12() }).from(userActivity).where(gte6(userActivity.lastSeenAt, windows.last7d)),
    db.select({ count: count12() }).from(userActivity).where(gte6(userActivity.lastSeenAt, windows.last30d))
  ]);
  return {
    last1h: r1h[0].count,
    last24h: r24h[0].count,
    last7d: r7d[0].count,
    last30d: r30d[0].count
  };
}
var init_user_activity = __esm({
  "server/storage/user-activity.ts"() {
    "use strict";
    init_schema();
    init_db();
  }
});

// server/storage/feedback.ts
var feedback_exports = {};
__export(feedback_exports, {
  createFeedback: () => createFeedback,
  getFeedbackStats: () => getFeedbackStats,
  getRecentFeedback: () => getRecentFeedback
});
import { desc as desc15, count as count13 } from "drizzle-orm";
async function createFeedback(params) {
  const [result] = await db.insert(betaFeedback).values(params).returning();
  return result;
}
async function getRecentFeedback(limit = 50) {
  return db.select().from(betaFeedback).orderBy(desc15(betaFeedback.createdAt)).limit(limit);
}
async function getFeedbackStats() {
  const rows = await db.select({
    category: betaFeedback.category,
    count: count13()
  }).from(betaFeedback).groupBy(betaFeedback.category);
  const total = rows.reduce((sum2, r) => sum2 + r.count, 0);
  const byCategory = {};
  for (const row of rows) {
    byCategory[row.category] = row.count;
  }
  return { total, byCategory };
}
var init_feedback = __esm({
  "server/storage/feedback.ts"() {
    "use strict";
    init_schema();
    init_db();
  }
});

// server/storage/index.ts
var storage_exports = {};
__export(storage_exports, {
  activateReferral: () => activateReferral,
  autocompleteBusinesses: () => autocompleteBusinesses,
  awardBadge: () => awardBadge,
  bulkImportBusinesses: () => bulkImportBusinesses,
  closeExpiredChallenges: () => closeExpiredChallenges,
  countBusinessSearch: () => countBusinessSearch,
  createBetaInvite: () => createBetaInvite,
  createCategorySuggestion: () => createCategorySuggestion,
  createChallenge: () => createChallenge,
  createFeaturedPlacement: () => createFeaturedPlacement,
  createFeedback: () => createFeedback,
  createMember: () => createMember,
  createNotification: () => createNotification,
  createPaymentRecord: () => createPaymentRecord,
  createReferral: () => createReferral,
  deleteBusinessPhotos: () => deleteBusinessPhotos,
  deleteRating: () => deleteRating,
  editRating: () => editRating,
  expireFeaturedByPayment: () => expireFeaturedByPayment,
  expireOldPlacements: () => expireOldPlacements,
  generateEmailVerificationToken: () => generateEmailVerificationToken,
  generatePasswordResetToken: () => generatePasswordResetToken,
  getActiveChallenges: () => getActiveChallenges,
  getActiveFeaturedInCity: () => getActiveFeaturedInCity,
  getActiveUserStatsDb: () => getActiveUserStatsDb,
  getAdminMemberList: () => getAdminMemberList,
  getAllCategories: () => getAllCategories,
  getAutoFlaggedRatings: () => getAutoFlaggedRatings,
  getBadgeLeaderboard: () => getBadgeLeaderboard,
  getBatchDishRankings: () => getBatchDishRankings,
  getBetaInviteByEmail: () => getBetaInviteByEmail,
  getBetaInviteStats: () => getBetaInviteStats,
  getBusinessById: () => getBusinessById,
  getBusinessBySlug: () => getBusinessBySlug,
  getBusinessDishes: () => getBusinessDishes,
  getBusinessFeaturedStatus: () => getBusinessFeaturedStatus,
  getBusinessPayments: () => getBusinessPayments,
  getBusinessPhotos: () => getBusinessPhotos,
  getBusinessPhotosMap: () => getBusinessPhotosMap,
  getBusinessRatings: () => getBusinessRatings,
  getBusinessesByIds: () => getBusinessesByIds,
  getBusinessesWithoutPhotos: () => getBusinessesWithoutPhotos,
  getClaimByMemberAndBusiness: () => getClaimByMemberAndBusiness,
  getClaimCount: () => getClaimCount,
  getCredibilityTier: () => getCredibilityTier,
  getCuisines: () => getCuisines,
  getDbCategories: () => getDbCategories,
  getDishLeaderboardWithEntries: () => getDishLeaderboardWithEntries,
  getDishLeaderboards: () => getDishLeaderboards,
  getDishSuggestions: () => getDishSuggestions,
  getEarnedBadgeIds: () => getEarnedBadgeIds,
  getFeedbackStats: () => getFeedbackStats,
  getFlagCount: () => getFlagCount,
  getImportStats: () => getImportStats,
  getLeaderboard: () => getLeaderboard,
  getMemberBadgeCount: () => getMemberBadgeCount,
  getMemberBadges: () => getMemberBadges,
  getMemberByAuthId: () => getMemberByAuthId,
  getMemberByEmail: () => getMemberByEmail,
  getMemberById: () => getMemberById,
  getMemberByUsername: () => getMemberByUsername,
  getMemberCount: () => getMemberCount,
  getMemberImpact: () => getMemberImpact,
  getMemberNotifications: () => getMemberNotifications,
  getMemberPayments: () => getMemberPayments,
  getMemberRatings: () => getMemberRatings,
  getMembersWithPushTokenByCity: () => getMembersWithPushTokenByCity,
  getOnboardingProgress: () => getOnboardingProgress,
  getPaymentById: () => getPaymentById,
  getPendingClaims: () => getPendingClaims,
  getPendingFlags: () => getPendingFlags,
  getPendingSuggestions: () => getPendingSuggestions,
  getPersistedDailyStats: () => getPersistedDailyStats,
  getPersistedEventCounts: () => getPersistedEventCounts,
  getPersistedEventTotal: () => getPersistedEventTotal,
  getPopularCategories: () => getPopularCategories,
  getQrScanStats: () => getQrScanStats,
  getRankHistory: () => getRankHistory,
  getRatingById: () => getRatingById,
  getRecentFeedback: () => getRecentFeedback,
  getRecentWebhookEvents: () => getRecentWebhookEvents,
  getReferralStats: () => getReferralStats,
  getReferrerForMember: () => getReferrerForMember,
  getRevenueByMonth: () => getRevenueByMonth,
  getRevenueMetrics: () => getRevenueMetrics,
  getSeasonalRatingCounts: () => getSeasonalRatingCounts,
  getTemporalMultiplier: () => getTemporalMultiplier,
  getTierFromScore: () => getTierFromScore,
  getTrendingBusinesses: () => getTrendingBusinesses,
  getUnreadNotificationCount: () => getUnreadNotificationCount,
  getVoteWeight: () => getVoteWeight,
  getWebhookEventById: () => getWebhookEventById,
  hasBadge: () => hasBadge,
  insertBusinessPhotos: () => insertBusinessPhotos,
  isEmailVerified: () => isEmailVerified,
  logWebhookEvent: () => logWebhookEvent,
  markAllNotificationsRead: () => markAllNotificationsRead,
  markBetaInviteJoined: () => markBetaInviteJoined,
  markNotificationRead: () => markNotificationRead,
  markQrScanConverted: () => markQrScanConverted,
  markWebhookProcessed: () => markWebhookProcessed,
  persistAnalyticsEvents: () => persistAnalyticsEvents,
  recalculateBusinessScore: () => recalculateBusinessScore,
  recalculateCredibilityScore: () => recalculateCredibilityScore,
  recalculateDishLeaderboard: () => recalculateDishLeaderboard,
  recalculateRanks: () => recalculateRanks,
  recordQrScan: () => recordQrScan,
  recordUserActivityDb: () => recordUserActivityDb,
  resetPasswordWithToken: () => resetPasswordWithToken,
  resolveReferralCode: () => resolveReferralCode,
  reviewAutoFlaggedRating: () => reviewAutoFlaggedRating,
  reviewClaim: () => reviewClaim,
  reviewFlag: () => reviewFlag,
  reviewSuggestion: () => reviewSuggestion,
  searchBusinesses: () => searchBusinesses,
  searchDishes: () => searchDishes,
  submitClaim: () => submitClaim,
  submitDishSuggestion: () => submitDishSuggestion,
  submitRating: () => submitRating,
  submitRatingFlag: () => submitRatingFlag,
  updateBusinessSubscription: () => updateBusinessSubscription,
  updateChallengerVotes: () => updateChallengerVotes,
  updateMemberAvatar: () => updateMemberAvatar,
  updateMemberEmail: () => updateMemberEmail,
  updateMemberProfile: () => updateMemberProfile,
  updateMemberStats: () => updateMemberStats,
  updateNotificationPrefs: () => updateNotificationPrefs,
  updatePaymentStatus: () => updatePaymentStatus,
  updatePaymentStatusByStripeId: () => updatePaymentStatusByStripeId,
  updatePushToken: () => updatePushToken,
  verifyEmailToken: () => verifyEmailToken,
  voteDishSuggestion: () => voteDishSuggestion
});
var init_storage = __esm({
  "server/storage/index.ts"() {
    "use strict";
    init_helpers();
    init_members();
    init_businesses();
    init_ratings();
    init_challengers();
    init_members();
    init_dishes();
    init_categories();
    init_badges();
    init_payments();
    init_webhook_events();
    init_featured_placements();
    init_claims();
    init_qr();
    init_referrals();
    init_notifications();
    init_beta_invites();
    init_analytics();
    init_user_activity();
    init_feedback();
  }
});

// shared/admin.ts
var admin_exports = {};
__export(admin_exports, {
  ADMIN_EMAILS: () => ADMIN_EMAILS,
  isAdminEmail: () => isAdminEmail
});
function isAdminEmail(email) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
var ADMIN_EMAILS;
var init_admin = __esm({
  "shared/admin.ts"() {
    "use strict";
    ADMIN_EMAILS = Object.freeze([
      "rahul@topranker.com",
      "admin@topranker.com"
    ]);
  }
});

// server/analytics.ts
var analytics_exports2 = {};
__export(analytics_exports2, {
  clearAnalytics: () => clearAnalytics,
  getActiveUserStats: () => getActiveUserStats,
  getBetaConversionFunnel: () => getBetaConversionFunnel,
  getDailyStats: () => getDailyStats,
  getFunnelStats: () => getFunnelStats,
  getHourlyStats: () => getHourlyStats,
  getRateGateStats: () => getRateGateStats,
  getRecentEvents: () => getRecentEvents,
  recordUserActivity: () => recordUserActivity,
  setFlushHandler: () => setFlushHandler,
  stopFlush: () => stopFlush,
  trackEvent: () => trackEvent
});
function trackEvent(event, userId, metadata) {
  const entry = {
    event,
    userId,
    metadata,
    timestamp: Date.now()
  };
  buffer.push(entry);
  analyticsLog.info(`${event}${userId ? ` [${userId}]` : ""}`);
  if (buffer.length > MAX_BUFFER) {
    buffer.splice(0, buffer.length - MAX_BUFFER);
  }
}
function getFunnelStats() {
  const stats2 = {};
  for (const entry of buffer) {
    stats2[entry.event] = (stats2[entry.event] || 0) + 1;
  }
  return stats2;
}
function getRecentEvents(limit = 50) {
  return buffer.slice(-limit);
}
function getRateGateStats() {
  const rejectionEvents = [
    "rating_rejected_account_age",
    "rating_rejected_duplicate",
    "rating_rejected_suspended",
    "rating_rejected_validation",
    "rating_rejected_unknown"
  ];
  const submissions = buffer.filter((e) => e.event === "rating_submitted").length;
  const rejections = buffer.filter(
    (e) => rejectionEvents.includes(e.event)
  );
  const byReason = {};
  for (const r of rejections) {
    byReason[r.event] = (byReason[r.event] || 0) + 1;
  }
  const total = submissions + rejections.length;
  return {
    totalSubmissions: submissions,
    totalRejections: rejections.length,
    rejectionRate: total > 0 ? (rejections.length / total * 100).toFixed(1) + "%" : "0%",
    byReason,
    recentRejections: rejections.slice(-20)
  };
}
function clearAnalytics() {
  buffer.length = 0;
}
function setFlushHandler(handler, intervalMs = 3e4) {
  flushHandler = handler;
  if (flushInterval) clearInterval(flushInterval);
  flushInterval = setInterval(async () => {
    if (buffer.length === 0 || !flushHandler) return;
    const batch = buffer.splice(0, buffer.length);
    try {
      await flushHandler(batch);
      analyticsLog.info(`Flushed ${batch.length} analytics events`);
    } catch (err) {
      buffer.unshift(...batch);
      analyticsLog.error(`Flush failed, ${batch.length} events re-queued`);
    }
  }, intervalMs);
}
function stopFlush() {
  if (flushInterval) {
    clearInterval(flushInterval);
    flushInterval = null;
  }
}
function getHourlyStats(hours = 24) {
  const now = Date.now();
  const cutoff = now - hours * 60 * 60 * 1e3;
  const filtered = buffer.filter((e) => e.timestamp >= cutoff);
  const buckets = /* @__PURE__ */ new Map();
  for (const entry of filtered) {
    const d = new Date(entry.timestamp);
    const key2 = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:00`;
    if (!buckets.has(key2)) {
      buckets.set(key2, { events: 0, byType: {} });
    }
    const bucket = buckets.get(key2);
    bucket.events++;
    bucket.byType[entry.event] = (bucket.byType[entry.event] || 0) + 1;
  }
  return Array.from(buckets.entries()).map(([hour, data]) => ({ hour, ...data })).sort((a, b) => a.hour.localeCompare(b.hour));
}
function getDailyStats(days = 7) {
  const now = Date.now();
  const cutoff = now - days * 24 * 60 * 60 * 1e3;
  const filtered = buffer.filter((e) => e.timestamp >= cutoff);
  const buckets = /* @__PURE__ */ new Map();
  for (const entry of filtered) {
    const d = new Date(entry.timestamp);
    const key2 = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!buckets.has(key2)) {
      buckets.set(key2, { events: 0, users: /* @__PURE__ */ new Set(), byType: {} });
    }
    const bucket = buckets.get(key2);
    bucket.events++;
    if (entry.userId) bucket.users.add(entry.userId);
    bucket.byType[entry.event] = (bucket.byType[entry.event] || 0) + 1;
  }
  return Array.from(buckets.entries()).map(([date2, data]) => ({ date: date2, events: data.events, uniqueUsers: data.users.size, byType: data.byType })).sort((a, b) => a.date.localeCompare(b.date));
}
function recordUserActivity(userId) {
  activeUsers.set(userId, Date.now());
}
function getActiveUserStats() {
  const now = Date.now();
  let last1h = 0, last24h = 0, last7d = 0, last30d = 0;
  for (const [, lastSeen] of activeUsers) {
    const age = now - lastSeen;
    if (age < 60 * 60 * 1e3) last1h++;
    if (age < 24 * 60 * 60 * 1e3) last24h++;
    if (age < 7 * 24 * 60 * 60 * 1e3) last7d++;
    if (age < 30 * 24 * 60 * 60 * 1e3) last30d++;
  }
  return { last1h, last24h, last7d, last30d };
}
function getBetaConversionFunnel() {
  const invitesSent = buffer.filter((e) => e.event === "beta_invite_sent").length;
  const joinPageViews = buffer.filter((e) => e.event === "beta_join_page_view").length;
  const signups = buffer.filter((e) => e.event === "beta_signup_completed").length;
  const firstRatings = buffer.filter((e) => e.event === "beta_first_rating").length;
  const referralsShared = buffer.filter((e) => e.event === "beta_referral_shared").length;
  const pct = (n, d) => d > 0 ? (n / d * 100).toFixed(1) + "%" : "N/A";
  return {
    invitesSent,
    joinPageViews,
    signups,
    firstRatings,
    referralsShared,
    conversionRates: {
      inviteToView: pct(joinPageViews, invitesSent),
      viewToSignup: pct(signups, joinPageViews),
      signupToRating: pct(firstRatings, signups),
      overallInviteToRating: pct(firstRatings, invitesSent)
    }
  };
}
var analyticsLog, buffer, MAX_BUFFER, flushHandler, flushInterval, activeUsers;
var init_analytics2 = __esm({
  "server/analytics.ts"() {
    "use strict";
    init_logger();
    analyticsLog = log.tag("Analytics");
    buffer = [];
    MAX_BUFFER = 1e3;
    flushHandler = null;
    flushInterval = null;
    activeUsers = /* @__PURE__ */ new Map();
  }
});

// shared/city-config.ts
var city_config_exports = {};
__export(city_config_exports, {
  CITY_REGISTRY: () => CITY_REGISTRY,
  getActiveCities: () => getActiveCities,
  getBetaCities: () => getBetaCities,
  getCityBadge: () => getCityBadge,
  getCityConfig: () => getCityConfig,
  getCityStats: () => getCityStats,
  getPlannedCities: () => getPlannedCities,
  isCityActive: () => isCityActive
});
function getActiveCities() {
  return Object.values(CITY_REGISTRY).filter((c) => c.status === "active").map((c) => c.name);
}
function getPlannedCities() {
  return Object.values(CITY_REGISTRY).filter((c) => c.status === "planned").map((c) => c.name);
}
function getCityConfig(name) {
  return CITY_REGISTRY[name];
}
function isCityActive(name) {
  return CITY_REGISTRY[name]?.status === "active";
}
function getCityStats() {
  const cities = Object.values(CITY_REGISTRY);
  return {
    active: cities.filter((c) => c.status === "active").length,
    beta: cities.filter((c) => c.status === "beta").length,
    planned: cities.filter((c) => c.status === "planned").length,
    total: cities.length
  };
}
function getBetaCities() {
  return Object.values(CITY_REGISTRY).filter((c) => c.status === "beta").map((c) => c.name);
}
function getCityBadge(name) {
  return CITY_REGISTRY[name]?.status ?? "unknown";
}
var CITY_REGISTRY;
var init_city_config = __esm({
  "shared/city-config.ts"() {
    "use strict";
    CITY_REGISTRY = {
      Dallas: {
        name: "Dallas",
        state: "Texas",
        stateCode: "TX",
        region: "DFW Metroplex",
        timezone: "America/Chicago",
        coordinates: { lat: 32.7767, lng: -96.797 },
        status: "active",
        launchDate: "2026-03-09",
        minBusinesses: 10
      },
      Austin: {
        name: "Austin",
        state: "Texas",
        stateCode: "TX",
        region: "Central Texas",
        timezone: "America/Chicago",
        coordinates: { lat: 30.2672, lng: -97.7431 },
        status: "active",
        launchDate: "2026-03-09",
        minBusinesses: 10
      },
      Houston: {
        name: "Houston",
        state: "Texas",
        stateCode: "TX",
        region: "Greater Houston",
        timezone: "America/Chicago",
        coordinates: { lat: 29.7604, lng: -95.3698 },
        status: "active",
        launchDate: "2026-03-09",
        minBusinesses: 8
      },
      "San Antonio": {
        name: "San Antonio",
        state: "Texas",
        stateCode: "TX",
        region: "South Texas",
        timezone: "America/Chicago",
        coordinates: { lat: 29.4241, lng: -98.4936 },
        status: "active",
        launchDate: "2026-03-09",
        minBusinesses: 7
      },
      "Fort Worth": {
        name: "Fort Worth",
        state: "Texas",
        stateCode: "TX",
        region: "DFW Metroplex",
        timezone: "America/Chicago",
        coordinates: { lat: 32.7555, lng: -97.3308 },
        status: "active",
        launchDate: "2026-03-09",
        minBusinesses: 7
      },
      // Phase 2 — planned for post-launch expansion
      "Oklahoma City": {
        name: "Oklahoma City",
        state: "Oklahoma",
        stateCode: "OK",
        region: "Central Oklahoma",
        timezone: "America/Chicago",
        coordinates: { lat: 35.4676, lng: -97.5164 },
        status: "beta",
        launchDate: "2026-03-09",
        minBusinesses: 10
      },
      "New Orleans": {
        name: "New Orleans",
        state: "Louisiana",
        stateCode: "LA",
        region: "Greater New Orleans",
        timezone: "America/Chicago",
        coordinates: { lat: 29.9511, lng: -90.0715 },
        status: "beta",
        launchDate: "2026-03-09",
        minBusinesses: 10
      },
      // Phase 3 — Tennessee expansion (Sprint 234)
      Memphis: {
        name: "Memphis",
        state: "Tennessee",
        stateCode: "TN",
        region: "West Tennessee",
        timezone: "America/Chicago",
        coordinates: { lat: 35.1495, lng: -90.049 },
        status: "beta",
        launchDate: "2026-03-09",
        minBusinesses: 30
      },
      Nashville: {
        name: "Nashville",
        state: "Tennessee",
        stateCode: "TN",
        region: "Middle Tennessee",
        timezone: "America/Chicago",
        coordinates: { lat: 36.1627, lng: -86.7816 },
        status: "beta",
        launchDate: "2026-03-09",
        minBusinesses: 40
      },
      // Phase 4 — North Carolina expansion (Sprint 248)
      Charlotte: {
        name: "Charlotte",
        state: "North Carolina",
        stateCode: "NC",
        region: "Piedmont",
        timezone: "America/New_York",
        coordinates: { lat: 35.2271, lng: -80.8431 },
        status: "beta",
        launchDate: "2026-03-09",
        minBusinesses: 40
      },
      Raleigh: {
        name: "Raleigh",
        state: "North Carolina",
        stateCode: "NC",
        region: "Research Triangle",
        timezone: "America/New_York",
        coordinates: { lat: 35.7796, lng: -78.6382 },
        status: "beta",
        launchDate: "2026-03-09",
        minBusinesses: 30
      }
    };
  }
});

// server/seed-cities.ts
var seed_cities_exports = {};
__export(seed_cities_exports, {
  seedCities: () => seedCities
});
async function seedCities() {
  console.log(`Seeding ${ALL_CITY_BUSINESSES.length} businesses across 10 cities...`);
  let seeded = 0;
  for (const biz of ALL_CITY_BUSINESSES) {
    try {
      await db.insert(businesses).values({
        name: biz.name,
        slug: biz.slug,
        category: biz.category,
        city: biz.city,
        neighborhood: biz.neighborhood,
        address: biz.address,
        phone: biz.phone,
        lat: biz.lat,
        lng: biz.lng,
        weightedScore: biz.weightedScore,
        rawAvgScore: biz.rawAvgScore,
        rankPosition: biz.rankPosition,
        rankDelta: biz.rankDelta,
        totalRatings: biz.totalRatings,
        description: biz.description,
        priceRange: biz.priceRange,
        isOpenNow: biz.isOpenNow,
        photoUrl: biz.photoUrl || null,
        isActive: true,
        dataSource: "admin"
      });
      seeded++;
    } catch (err) {
      if (err.message?.includes("unique") || err.message?.includes("duplicate")) {
        console.log(`  Skipping ${biz.name} (already exists)`);
      } else {
        console.error(`  Failed to seed ${biz.name}:`, err.message);
      }
    }
  }
  console.log(`
Seeded ${seeded}/${ALL_CITY_BUSINESSES.length} businesses.`);
  console.log("Cities: Austin (10), Houston (8), San Antonio (7), Fort Worth (7), Oklahoma City (10), New Orleans (10), Memphis (10), Nashville (10), Charlotte (10), Raleigh (10)");
}
var AUSTIN_BUSINESSES, HOUSTON_BUSINESSES, SAN_ANTONIO_BUSINESSES, FORT_WORTH_BUSINESSES, OKC_BUSINESSES, NOLA_BUSINESSES, MEMPHIS_BUSINESSES, NASHVILLE_BUSINESSES, CHARLOTTE_BUSINESSES, RALEIGH_BUSINESSES, ALL_CITY_BUSINESSES, isDirectRun;
var init_seed_cities = __esm({
  "server/seed-cities.ts"() {
    "use strict";
    init_db();
    init_schema();
    AUSTIN_BUSINESSES = [
      { name: "Franklin Barbecue", slug: "franklin-barbecue-austin", city: "Austin", neighborhood: "East Austin", category: "restaurant", weightedScore: "4.850", rawAvgScore: "4.75", rankPosition: 1, rankDelta: 0, totalRatings: 678, description: "The most famous BBQ in Texas. Worth the 4-hour wait.", priceRange: "$$", phone: "(512) 653-1187", address: "900 E 11th St, Austin, TX", lat: "30.2701", lng: "-97.7267", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&h=400&fit=crop" },
      { name: "Uchi", slug: "uchi-austin", city: "Austin", neighborhood: "South Lamar", category: "restaurant", weightedScore: "4.720", rawAvgScore: "4.60", rankPosition: 2, rankDelta: 0, totalRatings: 445, description: "James Beard-winning Japanese farmhouse dining.", priceRange: "$$$$", phone: "(512) 916-4808", address: "801 S Lamar Blvd, Austin, TX", lat: "30.2561", lng: "-97.7628", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&h=400&fit=crop" },
      { name: "Torchy's Tacos", slug: "torchys-tacos-austin", city: "Austin", neighborhood: "South Congress", category: "street_food", weightedScore: "4.580", rawAvgScore: "4.45", rankPosition: 1, rankDelta: 0, totalRatings: 567, description: "Damn good tacos. The Trailer Park is legendary.", priceRange: "$", phone: "(512) 366-0537", address: "1311 S 1st St, Austin, TX", lat: "30.2502", lng: "-97.7540", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop" },
      { name: "Salt Lick BBQ", slug: "salt-lick-bbq-austin", city: "Austin", neighborhood: "Driftwood", category: "restaurant", weightedScore: "4.450", rawAvgScore: "4.30", rankPosition: 3, rankDelta: 1, totalRatings: 389, description: "Open-pit BBQ in the Hill Country since 1967.", priceRange: "$$", phone: "(512) 858-4959", address: "18300 FM 1826, Driftwood, TX", lat: "30.1561", lng: "-97.9410", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop" },
      { name: "Ramen Tatsu-Ya", slug: "ramen-tatsu-ya-austin", city: "Austin", neighborhood: "North Loop", category: "restaurant", weightedScore: "4.380", rawAvgScore: "4.25", rankPosition: 4, rankDelta: -1, totalRatings: 312, description: "Austin's best ramen. No compromise.", priceRange: "$$", phone: "(512) 893-5561", address: "8557 Research Blvd, Austin, TX", lat: "30.3561", lng: "-97.7310", isOpenNow: false, photoUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop" },
      { name: "Odd Duck", slug: "odd-duck-austin", city: "Austin", neighborhood: "South Lamar", category: "restaurant", weightedScore: "4.250", rawAvgScore: "4.10", rankPosition: 5, rankDelta: 0, totalRatings: 234, description: "Farm-to-table seasonal small plates.", priceRange: "$$$", phone: "(512) 433-6521", address: "1201 S Lamar Blvd, Austin, TX", lat: "30.2501", lng: "-97.7630", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop" },
      { name: "Jo's Coffee", slug: "jos-coffee-austin", city: "Austin", neighborhood: "South Congress", category: "cafe", weightedScore: "4.620", rawAvgScore: "4.50", rankPosition: 1, rankDelta: 0, totalRatings: 456, description: "I Love You So Much wall. Iconic SoCo coffee.", priceRange: "$", phone: "(512) 444-3800", address: "1300 S Congress Ave, Austin, TX", lat: "30.2490", lng: "-97.7491", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop" },
      { name: "Rainey Street Bar District", slug: "rainey-street-austin", city: "Austin", neighborhood: "Rainey Street", category: "bar", weightedScore: "4.500", rawAvgScore: "4.35", rankPosition: 1, rankDelta: 0, totalRatings: 345, description: "Historic bungalows turned into Austin's hottest bar street.", priceRange: "$$", phone: "(512) 555-0001", address: "Rainey Street, Austin, TX", lat: "30.2580", lng: "-97.7380", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop" },
      { name: "Whataburger", slug: "whataburger-austin", city: "Austin", neighborhood: "Multiple", category: "fast_food", weightedScore: "4.200", rawAvgScore: "4.05", rankPosition: 1, rankDelta: 0, totalRatings: 567, description: "Texas institution. Honey butter chicken biscuit.", priceRange: "$", phone: "(512) 555-0002", address: "Multiple locations, Austin, TX", lat: "30.2672", lng: "-97.7431", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop" },
      { name: "Quack's 43rd St Bakery", slug: "quacks-bakery-austin", city: "Austin", neighborhood: "Hyde Park", category: "bakery", weightedScore: "4.350", rawAvgScore: "4.20", rankPosition: 1, rankDelta: 0, totalRatings: 198, description: "Neighborhood bakery with legendary carrot cake.", priceRange: "$", phone: "(512) 453-3399", address: "411 E 43rd St, Austin, TX", lat: "30.3051", lng: "-97.7230", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop" }
    ];
    HOUSTON_BUSINESSES = [
      { name: "Killen's Barbecue", slug: "killens-bbq-houston", city: "Houston", neighborhood: "Pearland", category: "restaurant", weightedScore: "4.780", rawAvgScore: "4.65", rankPosition: 1, rankDelta: 0, totalRatings: 523, description: "Pitmaster Ronnie Killen's award-winning BBQ.", priceRange: "$$", phone: "(281) 485-2272", address: "3613 E Broadway St, Pearland, TX", lat: "29.5633", lng: "-95.2763", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&h=400&fit=crop" },
      { name: "Pappas Bros. Steakhouse", slug: "pappas-bros-houston", city: "Houston", neighborhood: "Galleria", category: "restaurant", weightedScore: "4.650", rawAvgScore: "4.50", rankPosition: 2, rankDelta: 0, totalRatings: 445, description: "Houston's finest steakhouse. USDA Prime aged beef.", priceRange: "$$$$", phone: "(713) 780-7352", address: "5839 Westheimer Rd, Houston, TX", lat: "29.7372", lng: "-95.4888", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=600&h=400&fit=crop" },
      { name: "Crawfish & Noodles", slug: "crawfish-noodles-houston", city: "Houston", neighborhood: "Chinatown", category: "restaurant", weightedScore: "4.520", rawAvgScore: "4.40", rankPosition: 3, rankDelta: 1, totalRatings: 378, description: "Vietnamese-Cajun fusion that started a revolution.", priceRange: "$$", phone: "(281) 988-8098", address: "11360 Bellaire Blvd, Houston, TX", lat: "29.7045", lng: "-95.5358", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1552611052-33e04de1b100?w=600&h=400&fit=crop" },
      { name: "Tacos Tierra Caliente", slug: "tacos-tierra-caliente-houston", city: "Houston", neighborhood: "Montrose", category: "street_food", weightedScore: "4.600", rawAvgScore: "4.45", rankPosition: 1, rankDelta: 0, totalRatings: 456, description: "Late-night taco truck with the best al pastor in Houston.", priceRange: "$", phone: "(713) 555-0003", address: "1220 Westheimer Rd, Houston, TX", lat: "29.7414", lng: "-95.3917", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop" },
      { name: "Buc-ee's", slug: "buc-ees-houston", city: "Houston", neighborhood: "Baytown", category: "fast_food", weightedScore: "4.400", rawAvgScore: "4.25", rankPosition: 1, rankDelta: 0, totalRatings: 789, description: "Texas-sized gas station with legendary BBQ and beaver nuggets.", priceRange: "$", phone: "(979) 238-6390", address: "4500 I-10 East, Baytown, TX", lat: "29.7827", lng: "-94.9594", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop" },
      { name: "Blacksmith Coffee", slug: "blacksmith-coffee-houston", city: "Houston", neighborhood: "Montrose", category: "cafe", weightedScore: "4.480", rawAvgScore: "4.35", rankPosition: 1, rankDelta: 0, totalRatings: 234, description: "Third-wave coffee in a beautiful Montrose space.", priceRange: "$$", phone: "(713) 555-0004", address: "1018 Westheimer Rd, Houston, TX", lat: "29.7413", lng: "-95.3870", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop" },
      { name: "Julep", slug: "julep-houston", city: "Houston", neighborhood: "Washington Ave", category: "bar", weightedScore: "4.550", rawAvgScore: "4.40", rankPosition: 1, rankDelta: 0, totalRatings: 198, description: "Southern cocktail bar with craft juleps and live music.", priceRange: "$$$", phone: "(713) 869-4383", address: "1919 Washington Ave, Houston, TX", lat: "29.7643", lng: "-95.3842", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=400&fit=crop" },
      { name: "Common Bond Bakery", slug: "common-bond-houston", city: "Houston", neighborhood: "Montrose", category: "bakery", weightedScore: "4.380", rawAvgScore: "4.25", rankPosition: 1, rankDelta: 0, totalRatings: 312, description: "European-inspired bakery and cafe.", priceRange: "$$", phone: "(713) 529-3535", address: "1706 Westheimer Rd, Houston, TX", lat: "29.7434", lng: "-95.3977", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop" }
    ];
    SAN_ANTONIO_BUSINESSES = [
      { name: "2M Smokehouse", slug: "2m-smokehouse-san-antonio", city: "San Antonio", neighborhood: "South Side", category: "restaurant", weightedScore: "4.750", rawAvgScore: "4.60", rankPosition: 1, rankDelta: 0, totalRatings: 389, description: "Tex-Mex meets BBQ. The brisket enchiladas are legendary.", priceRange: "$$", phone: "(210) 885-9352", address: "2731 S WW White Rd, San Antonio, TX", lat: "29.3921", lng: "-98.4347", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop" },
      { name: "Mi Tierra Cafe", slug: "mi-tierra-san-antonio", city: "San Antonio", neighborhood: "Market Square", category: "restaurant", weightedScore: "4.580", rawAvgScore: "4.45", rankPosition: 2, rankDelta: 0, totalRatings: 567, description: "Open 24 hours since 1941. The Riverwalk institution.", priceRange: "$$", phone: "(210) 225-1262", address: "218 Produce Row, San Antonio, TX", lat: "29.4246", lng: "-98.4969", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1653005753991-22a8bf831f89?w=600&h=400&fit=crop" },
      { name: "Garcia's Mexican Food", slug: "garcias-san-antonio", city: "San Antonio", neighborhood: "West Side", category: "street_food", weightedScore: "4.500", rawAvgScore: "4.35", rankPosition: 1, rankDelta: 0, totalRatings: 345, description: "No-frills Tex-Mex. The puffy tacos are life-changing.", priceRange: "$", phone: "(210) 735-4525", address: "842 Fredericksburg Rd, San Antonio, TX", lat: "29.4521", lng: "-98.5121", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&h=400&fit=crop" },
      { name: "Estate Coffee", slug: "estate-coffee-san-antonio", city: "San Antonio", neighborhood: "Southtown", category: "cafe", weightedScore: "4.420", rawAvgScore: "4.30", rankPosition: 1, rankDelta: 0, totalRatings: 178, description: "Specialty coffee in the heart of Southtown arts district.", priceRange: "$$", phone: "(210) 555-0005", address: "1320 S Alamo St, San Antonio, TX", lat: "29.4150", lng: "-98.4901", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop" },
      { name: "Whataburger", slug: "whataburger-san-antonio", city: "San Antonio", neighborhood: "Multiple", category: "fast_food", weightedScore: "4.250", rawAvgScore: "4.10", rankPosition: 1, rankDelta: 0, totalRatings: 678, description: "Born right here in San Antonio. The HQ city.", priceRange: "$", phone: "(210) 555-0006", address: "Multiple locations, San Antonio, TX", lat: "29.4241", lng: "-98.4936", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop" },
      { name: "The Esquire Tavern", slug: "esquire-tavern-san-antonio", city: "San Antonio", neighborhood: "Riverwalk", category: "bar", weightedScore: "4.550", rawAvgScore: "4.40", rankPosition: 1, rankDelta: 0, totalRatings: 289, description: "The longest bar in Texas, right on the Riverwalk.", priceRange: "$$", phone: "(210) 222-2521", address: "155 E Commerce St, San Antonio, TX", lat: "29.4234", lng: "-98.4876", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop" },
      { name: "Bird Bakery", slug: "bird-bakery-san-antonio", city: "San Antonio", neighborhood: "Alamo Heights", category: "bakery", weightedScore: "4.480", rawAvgScore: "4.35", rankPosition: 1, rankDelta: 0, totalRatings: 234, description: "Cupcakes and cookies by Elizabeth Chambers.", priceRange: "$$", phone: "(210) 804-2473", address: "5912 Broadway, San Antonio, TX", lat: "29.4633", lng: "-98.4623", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=400&fit=crop" }
    ];
    FORT_WORTH_BUSINESSES = [
      { name: "Heim Barbecue", slug: "heim-bbq-fort-worth", city: "Fort Worth", neighborhood: "Magnolia", category: "restaurant", weightedScore: "4.700", rawAvgScore: "4.55", rankPosition: 1, rankDelta: 0, totalRatings: 445, description: "Bacon burnt ends put Heim on the map. Texas Monthly Top 50.", priceRange: "$$", phone: "(817) 882-6970", address: "1109 W Magnolia Ave, Fort Worth, TX", lat: "32.7185", lng: "-97.3448", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&h=400&fit=crop" },
      { name: "Joe T. Garcia's", slug: "joe-t-garcias-fort-worth", city: "Fort Worth", neighborhood: "Northside", category: "restaurant", weightedScore: "4.550", rawAvgScore: "4.40", rankPosition: 2, rankDelta: 0, totalRatings: 567, description: "The legendary patio. Enchiladas and fajitas only.", priceRange: "$$", phone: "(817) 626-4356", address: "2201 N Commerce St, Fort Worth, TX", lat: "32.7665", lng: "-97.3292", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1653005753991-22a8bf831f89?w=600&h=400&fit=crop" },
      { name: "Salsa Limon", slug: "salsa-limon-fort-worth", city: "Fort Worth", neighborhood: "Near South", category: "street_food", weightedScore: "4.480", rawAvgScore: "4.35", rankPosition: 1, rankDelta: 0, totalRatings: 345, description: "Mexican street food truck turned brick-and-mortar.", priceRange: "$", phone: "(817) 927-4328", address: "4200 S Freeway, Fort Worth, TX", lat: "32.7100", lng: "-97.3232", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop" },
      { name: "Avoca Coffee", slug: "avoca-coffee-fort-worth", city: "Fort Worth", neighborhood: "Magnolia", category: "cafe", weightedScore: "4.500", rawAvgScore: "4.35", rankPosition: 1, rankDelta: 0, totalRatings: 198, description: "Fort Worth's premier specialty coffee roaster.", priceRange: "$$", phone: "(817) 677-6741", address: "1311 W Magnolia Ave, Fort Worth, TX", lat: "32.7180", lng: "-97.3465", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop" },
      { name: "Whataburger", slug: "whataburger-fort-worth", city: "Fort Worth", neighborhood: "Multiple", category: "fast_food", weightedScore: "4.180", rawAvgScore: "4.05", rankPosition: 1, rankDelta: 0, totalRatings: 456, description: "Texas institution. Always there at 2am.", priceRange: "$", phone: "(817) 555-0007", address: "Multiple locations, Fort Worth, TX", lat: "32.7555", lng: "-97.3308", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop" },
      { name: "The Usual", slug: "the-usual-fort-worth", city: "Fort Worth", neighborhood: "Sundance Square", category: "bar", weightedScore: "4.380", rawAvgScore: "4.25", rankPosition: 1, rankDelta: 0, totalRatings: 189, description: "Craft cocktail bar in Sundance Square.", priceRange: "$$$", phone: "(817) 810-0114", address: "310 Houston St, Fort Worth, TX", lat: "32.7548", lng: "-97.3313", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=400&fit=crop" },
      { name: "Swiss Pastry Shop", slug: "swiss-pastry-fort-worth", city: "Fort Worth", neighborhood: "Camp Bowie", category: "bakery", weightedScore: "4.420", rawAvgScore: "4.30", rankPosition: 1, rankDelta: 0, totalRatings: 267, description: "Fort Worth's oldest bakery. Since 1950.", priceRange: "$", phone: "(817) 732-5661", address: "3936 W Vickery Blvd, Fort Worth, TX", lat: "32.7370", lng: "-97.3698", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop" }
    ];
    OKC_BUSINESSES = [
      { name: "Cattlemen's Steakhouse", slug: "cattlemens-steakhouse-okc", city: "Oklahoma City", neighborhood: "Stockyards City", category: "restaurant", weightedScore: "4.780", rawAvgScore: "4.65", rankPosition: 1, rankDelta: 0, totalRatings: 534, description: "Oklahoma's most famous steakhouse since 1910", priceRange: "$$$", phone: "(405) 236-0416", address: "1309 S Agnew Ave, Oklahoma City, OK", lat: "35.4558", lng: "-97.5378", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=600&h=400&fit=crop" },
      { name: "Nic's Grill", slug: "nics-grill-okc", city: "Oklahoma City", neighborhood: "Midtown", category: "restaurant", weightedScore: "4.680", rawAvgScore: "4.55", rankPosition: 2, rankDelta: 0, totalRatings: 467, description: "Tiny counter spot. Best burger in OKC, maybe America", priceRange: "$", phone: "(405) 524-0999", address: "1201 N Pennsylvania Ave, Oklahoma City, OK", lat: "35.4780", lng: "-97.5168", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop" },
      { name: "Waffle Champion", slug: "waffle-champion-okc", city: "Oklahoma City", neighborhood: "Midtown", category: "cafe", weightedScore: "4.550", rawAvgScore: "4.40", rankPosition: 1, rankDelta: 0, totalRatings: 345, description: "Gourmet waffles meet breakfast innovation", priceRange: "$$", phone: "(405) 601-9956", address: "1212 N Walker Ave, Oklahoma City, OK", lat: "35.4785", lng: "-97.5225", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1504113888839-1c8eb50233d3?w=600&h=400&fit=crop" },
      { name: "Empire Slice House", slug: "empire-slice-house-okc", city: "Oklahoma City", neighborhood: "Plaza District", category: "restaurant", weightedScore: "4.450", rawAvgScore: "4.30", rankPosition: 3, rankDelta: 0, totalRatings: 312, description: "Artisan pizza with local OKC personality", priceRange: "$$", phone: "(405) 525-7423", address: "1734 NW 16th St, Oklahoma City, OK", lat: "35.4821", lng: "-97.5340", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop" },
      { name: "Tamashii Ramen House", slug: "tamashii-ramen-okc", city: "Oklahoma City", neighborhood: "Asian District", category: "restaurant", weightedScore: "4.380", rawAvgScore: "4.25", rankPosition: 4, rankDelta: 0, totalRatings: 278, description: "Authentic Japanese ramen in OKC's vibrant Asian District", priceRange: "$$", phone: "(405) 600-7788", address: "6608 N May Ave, Oklahoma City, OK", lat: "35.5122", lng: "-97.5605", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop" },
      { name: "The Jones Assembly", slug: "jones-assembly-okc", city: "Oklahoma City", neighborhood: "Film Row", category: "bar", weightedScore: "4.520", rawAvgScore: "4.40", rankPosition: 1, rankDelta: 0, totalRatings: 398, description: "Restaurant, bar, and live music venue. OKC culture hub", priceRange: "$$$", phone: "(405) 212-2378", address: "901 W Sheridan Ave, Oklahoma City, OK", lat: "35.4660", lng: "-97.5280", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop" },
      { name: "Pie Junkie", slug: "pie-junkie-okc", city: "Oklahoma City", neighborhood: "Classen", category: "bakery", weightedScore: "4.480", rawAvgScore: "4.35", rankPosition: 1, rankDelta: 0, totalRatings: 267, description: "Handmade pies with seasonal Oklahoma flavors", priceRange: "$$", phone: "(405) 605-8767", address: "1711 NW 16th St, Oklahoma City, OK", lat: "35.4819", lng: "-97.5320", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=400&fit=crop" },
      { name: "Big Truck Tacos", slug: "big-truck-tacos-okc", city: "Oklahoma City", neighborhood: "NW 23rd", category: "street_food", weightedScore: "4.400", rawAvgScore: "4.25", rankPosition: 1, rankDelta: 0, totalRatings: 356, description: "Food truck turned institution. OKC taco legend", priceRange: "$", phone: "(405) 525-8226", address: "530 NW 23rd St, Oklahoma City, OK", lat: "35.4872", lng: "-97.5241", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop" },
      { name: "Hideaway Pizza", slug: "hideaway-pizza-okc", city: "Oklahoma City", neighborhood: "Multiple", category: "fast_food", weightedScore: "4.350", rawAvgScore: "4.20", rankPosition: 1, rankDelta: 0, totalRatings: 445, description: "Oklahoma pizza chain since 1957. The OG", priceRange: "$", phone: "(405) 840-2777", address: "6616 N Western Ave, Oklahoma City, OK", lat: "35.5130", lng: "-97.5435", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop" },
      { name: "The Press", slug: "the-press-okc", city: "Oklahoma City", neighborhood: "Plaza District", category: "cafe", weightedScore: "4.320", rawAvgScore: "4.20", rankPosition: 2, rankDelta: 0, totalRatings: 234, description: "Coffee and community in the heart of Plaza District", priceRange: "$", phone: "(405) 524-0222", address: "1738 NW 16th St, Oklahoma City, OK", lat: "35.4822", lng: "-97.5342", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop" }
    ];
    NOLA_BUSINESSES = [
      { name: "Commander's Palace", slug: "commanders-palace-nola", city: "New Orleans", neighborhood: "Garden District", category: "restaurant", weightedScore: "4.850", rawAvgScore: "4.75", rankPosition: 1, rankDelta: 0, totalRatings: 612, description: "Fine dining legend since 1893. Creole cuisine at its finest", priceRange: "$$$$", phone: "(504) 899-8221", address: "1403 Washington Ave, New Orleans, LA", lat: "29.9291", lng: "-90.0892", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop" },
      { name: "Dooky Chase's", slug: "dooky-chases-nola", city: "New Orleans", neighborhood: "Treme", category: "restaurant", weightedScore: "4.750", rawAvgScore: "4.65", rankPosition: 2, rankDelta: 0, totalRatings: 534, description: "Queen of Creole cuisine. Civil rights history meets gumbo perfection", priceRange: "$$$", phone: "(504) 821-0600", address: "2301 Orleans Ave, New Orleans, LA", lat: "29.9650", lng: "-90.0775", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1653005753991-22a8bf831f89?w=600&h=400&fit=crop" },
      { name: "Cafe Du Monde", slug: "cafe-du-monde-nola", city: "New Orleans", neighborhood: "French Quarter", category: "cafe", weightedScore: "4.680", rawAvgScore: "4.55", rankPosition: 1, rankDelta: 0, totalRatings: 789, description: "Beignets and chicory coffee 24/7 since 1862", priceRange: "$", phone: "(504) 525-4544", address: "800 Decatur St, New Orleans, LA", lat: "29.9574", lng: "-90.0618", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop" },
      { name: "Willie Mae's Scotch House", slug: "willie-maes-scotch-house-nola", city: "New Orleans", neighborhood: "Treme", category: "restaurant", weightedScore: "4.620", rawAvgScore: "4.50", rankPosition: 3, rankDelta: 0, totalRatings: 467, description: "Best fried chicken in America. James Beard Award winner", priceRange: "$$", phone: "(504) 822-9503", address: "2401 St Ann St, New Orleans, LA", lat: "29.9660", lng: "-90.0790", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop" },
      { name: "Cochon", slug: "cochon-nola", city: "New Orleans", neighborhood: "Warehouse District", category: "restaurant", weightedScore: "4.550", rawAvgScore: "4.40", rankPosition: 4, rankDelta: 0, totalRatings: 398, description: "Cajun nose-to-tail cooking with Louisiana soul", priceRange: "$$$", phone: "(504) 588-2123", address: "930 Tchoupitoulas St, New Orleans, LA", lat: "29.9430", lng: "-90.0680", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop" },
      { name: "Bacchanal Wine", slug: "bacchanal-wine-nola", city: "New Orleans", neighborhood: "Bywater", category: "bar", weightedScore: "4.580", rawAvgScore: "4.45", rankPosition: 1, rankDelta: 0, totalRatings: 423, description: "Wine bar meets backyard concert venue in the Bywater", priceRange: "$$", phone: "(504) 948-9111", address: "600 Poland Ave, New Orleans, LA", lat: "29.9630", lng: "-90.0400", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=400&fit=crop" },
      { name: "Dong Phuong Bakery", slug: "dong-phuong-bakery-nola", city: "New Orleans", neighborhood: "New Orleans East", category: "bakery", weightedScore: "4.520", rawAvgScore: "4.40", rankPosition: 1, rankDelta: 0, totalRatings: 345, description: "Vietnamese-French bakery. Best king cake and banh mi in NOLA", priceRange: "$", phone: "(504) 254-0214", address: "14207 Chef Menteur Hwy, New Orleans, LA", lat: "30.0280", lng: "-89.9580", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop" },
      { name: "Dat Dog", slug: "dat-dog-nola", city: "New Orleans", neighborhood: "Frenchmen Street", category: "street_food", weightedScore: "4.450", rawAvgScore: "4.30", rankPosition: 1, rankDelta: 0, totalRatings: 456, description: "Gourmet hot dogs with wild toppings. NOLA street food icon", priceRange: "$", phone: "(504) 309-3362", address: "601 Frenchmen St, New Orleans, LA", lat: "29.9640", lng: "-90.0570", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop" },
      { name: "Raising Cane's", slug: "raising-canes-nola", city: "New Orleans", neighborhood: "Multiple", category: "fast_food", weightedScore: "4.380", rawAvgScore: "4.25", rankPosition: 1, rankDelta: 0, totalRatings: 567, description: "Born in Baton Rouge, perfected in NOLA. One love \u2014 chicken fingers", priceRange: "$", phone: "(504) 304-6264", address: "Multiple locations, New Orleans, LA", lat: "29.9511", lng: "-90.0715", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop" },
      { name: "French Truck Coffee", slug: "french-truck-coffee-nola", city: "New Orleans", neighborhood: "CBD", category: "cafe", weightedScore: "4.350", rawAvgScore: "4.20", rankPosition: 2, rankDelta: 0, totalRatings: 289, description: "Local roaster serving NOLA's best specialty coffee", priceRange: "$$", phone: "(504) 309-7880", address: "1200 Carondelet St, New Orleans, LA", lat: "29.9410", lng: "-90.0730", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop" }
    ];
    MEMPHIS_BUSINESSES = [
      { name: "Central BBQ", slug: "central-bbq-memphis", city: "Memphis", neighborhood: "Midtown Memphis", category: "restaurant", weightedScore: "4.820", rawAvgScore: "4.70", rankPosition: 1, rankDelta: 0, totalRatings: 589, description: "Memphis dry-rub ribs perfected. Competition-winning BBQ.", priceRange: "$$", phone: "(901) 672-7760", address: "2249 Central Ave, Memphis, TN", lat: "35.1312", lng: "-89.9903", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&h=400&fit=crop" },
      { name: "Gus's World Famous Fried Chicken", slug: "gus-fried-chicken-memphis", city: "Memphis", neighborhood: "Downtown Memphis", category: "restaurant", weightedScore: "4.750", rawAvgScore: "4.65", rankPosition: 2, rankDelta: 0, totalRatings: 534, description: "Spicy fried chicken legend. The original since 1953.", priceRange: "$$", phone: "(901) 527-4877", address: "310 S Front St, Memphis, TN", lat: "35.1380", lng: "-90.0560", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop" },
      { name: "Charlie Vergos' Rendezvous", slug: "rendezvous-memphis", city: "Memphis", neighborhood: "Downtown Memphis", category: "restaurant", weightedScore: "4.680", rawAvgScore: "4.55", rankPosition: 3, rankDelta: 0, totalRatings: 467, description: "Underground dry-rub rib institution since 1948.", priceRange: "$$", phone: "(901) 523-2746", address: "52 S 2nd St, Memphis, TN", lat: "35.1420", lng: "-90.0530", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop" },
      { name: "Dyer's Burgers", slug: "dyers-burgers-memphis", city: "Memphis", neighborhood: "Beale Street", category: "restaurant", weightedScore: "4.520", rawAvgScore: "4.40", rankPosition: 4, rankDelta: 0, totalRatings: 345, description: "Deep-fried burgers on Beale Street since 1912. Legendary grease.", priceRange: "$", phone: "(901) 527-3937", address: "205 Beale St, Memphis, TN", lat: "35.1395", lng: "-90.0530", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop" },
      { name: "Muddy's Bake Shop", slug: "muddys-bake-shop-memphis", city: "Memphis", neighborhood: "Cooper-Young", category: "bakery", weightedScore: "4.580", rawAvgScore: "4.45", rankPosition: 1, rankDelta: 0, totalRatings: 289, description: "From-scratch cupcakes and pies in Cooper-Young.", priceRange: "$", phone: "(901) 683-8844", address: "2263 Young Ave, Memphis, TN", lat: "35.1270", lng: "-89.9880", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=400&fit=crop" },
      { name: "City & State Coffee", slug: "city-state-coffee-memphis", city: "Memphis", neighborhood: "Cooper-Young", category: "cafe", weightedScore: "4.450", rawAvgScore: "4.30", rankPosition: 1, rankDelta: 0, totalRatings: 234, description: "Specialty coffee and community in the Cooper-Young district.", priceRange: "$$", phone: "(901) 249-2406", address: "2625 Broad Ave, Memphis, TN", lat: "35.1350", lng: "-89.9760", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop" },
      { name: "Aldo's Pizza Pies", slug: "aldos-pizza-memphis", city: "Memphis", neighborhood: "Cooper-Young", category: "restaurant", weightedScore: "4.400", rawAvgScore: "4.25", rankPosition: 5, rankDelta: 0, totalRatings: 198, description: "Neapolitan-style pizza in the heart of Cooper-Young.", priceRange: "$$", phone: "(901) 276-7600", address: "1937 Young Ave, Memphis, TN", lat: "35.1275", lng: "-89.9920", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop" },
      { name: "Blues City Cafe", slug: "blues-city-cafe-memphis", city: "Memphis", neighborhood: "Beale Street", category: "bar", weightedScore: "4.550", rawAvgScore: "4.40", rankPosition: 1, rankDelta: 0, totalRatings: 412, description: "Live blues and BBQ on Beale Street. Memphis nightlife icon.", priceRange: "$$", phone: "(901) 526-3637", address: "138 Beale St, Memphis, TN", lat: "35.1393", lng: "-90.0540", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop" },
      { name: "Payne's Bar-B-Q", slug: "paynes-bbq-memphis", city: "Memphis", neighborhood: "Midtown Memphis", category: "street_food", weightedScore: "4.620", rawAvgScore: "4.50", rankPosition: 1, rankDelta: 0, totalRatings: 367, description: "Chopped pork sandwich perfection. No-frills Memphis BBQ.", priceRange: "$", phone: "(901) 272-1523", address: "1762 Lamar Ave, Memphis, TN", lat: "35.1230", lng: "-89.9870", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&h=400&fit=crop" },
      { name: "Jack Pirtle's Chicken", slug: "jack-pirtles-memphis", city: "Memphis", neighborhood: "Midtown Memphis", category: "fast_food", weightedScore: "4.300", rawAvgScore: "4.15", rankPosition: 1, rankDelta: 0, totalRatings: 456, description: "Memphis fried chicken chain since 1956. Local institution.", priceRange: "$", phone: "(901) 324-7800", address: "1217 S Bellevue Blvd, Memphis, TN", lat: "35.1240", lng: "-90.0100", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop" }
    ];
    NASHVILLE_BUSINESSES = [
      { name: "Prince's Hot Chicken Shack", slug: "princes-hot-chicken-nashville", city: "Nashville", neighborhood: "East Nashville", category: "restaurant", weightedScore: "4.850", rawAvgScore: "4.75", rankPosition: 1, rankDelta: 0, totalRatings: 623, description: "The original Nashville hot chicken. Since 1945.", priceRange: "$", phone: "(615) 226-9442", address: "123 Ewing Dr, Nashville, TN", lat: "36.1880", lng: "-86.7450", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop" },
      { name: "Hattie B's Hot Chicken", slug: "hattie-bs-nashville", city: "Nashville", neighborhood: "Midtown", category: "restaurant", weightedScore: "4.720", rawAvgScore: "4.60", rankPosition: 2, rankDelta: 0, totalRatings: 534, description: "Nashville hot chicken with Southern sides. Worth the wait.", priceRange: "$$", phone: "(615) 678-4794", address: "112 19th Ave S, Nashville, TN", lat: "36.1530", lng: "-86.7990", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&h=400&fit=crop" },
      { name: "Martin's Bar-B-Que Joint", slug: "martins-bbq-nashville", city: "Nashville", neighborhood: "12South", category: "restaurant", weightedScore: "4.650", rawAvgScore: "4.50", rankPosition: 3, rankDelta: 0, totalRatings: 445, description: "Whole-hog BBQ done right. West Tennessee pit tradition.", priceRange: "$$", phone: "(615) 288-0880", address: "2400 Elliston Pl, Nashville, TN", lat: "36.1540", lng: "-86.8050", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop" },
      { name: "Biscuit Love", slug: "biscuit-love-nashville", city: "Nashville", neighborhood: "The Gulch", category: "cafe", weightedScore: "4.580", rawAvgScore: "4.45", rankPosition: 1, rankDelta: 0, totalRatings: 489, description: "Southern brunch institution. The Bonuts are legendary.", priceRange: "$$", phone: "(615) 490-9584", address: "316 11th Ave S, Nashville, TN", lat: "36.1520", lng: "-86.7880", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1504113888839-1c8eb50233d3?w=600&h=400&fit=crop" },
      { name: "The Pharmacy Burger Parlor", slug: "pharmacy-burger-nashville", city: "Nashville", neighborhood: "East Nashville", category: "restaurant", weightedScore: "4.520", rawAvgScore: "4.40", rankPosition: 4, rankDelta: 0, totalRatings: 378, description: "German-style biergarten with craft burgers.", priceRange: "$$", phone: "(615) 712-9517", address: "731 McFerrin Ave, Nashville, TN", lat: "36.1850", lng: "-86.7620", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop" },
      { name: "Five Daughters Bakery", slug: "five-daughters-bakery-nashville", city: "Nashville", neighborhood: "12South", category: "bakery", weightedScore: "4.550", rawAvgScore: "4.40", rankPosition: 1, rankDelta: 0, totalRatings: 312, description: "100-layer donuts and artisan pastries in 12South.", priceRange: "$$", phone: "(615) 490-6554", address: "1110 Caruthers Ave, Nashville, TN", lat: "36.1310", lng: "-86.7890", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=400&fit=crop" },
      { name: "Robert's Western World", slug: "roberts-western-world-nashville", city: "Nashville", neighborhood: "Broadway", category: "bar", weightedScore: "4.680", rawAvgScore: "4.55", rankPosition: 1, rankDelta: 0, totalRatings: 456, description: "Honky-tonk legend on Lower Broadway. Live country every night.", priceRange: "$", phone: "(615) 244-9552", address: "416 Broadway, Nashville, TN", lat: "36.1590", lng: "-86.7770", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop" },
      { name: "Bolton's Spicy Chicken & Fish", slug: "boltons-spicy-chicken-nashville", city: "Nashville", neighborhood: "East Nashville", category: "street_food", weightedScore: "4.480", rawAvgScore: "4.35", rankPosition: 1, rankDelta: 0, totalRatings: 345, description: "Hot fish and hot chicken. East Nashville staple.", priceRange: "$", phone: "(615) 254-8015", address: "624 Main St, Nashville, TN", lat: "36.1780", lng: "-86.7580", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop" },
      { name: "Slim & Husky's", slug: "slim-huskys-nashville", city: "Nashville", neighborhood: "East Nashville", category: "fast_food", weightedScore: "4.380", rawAvgScore: "4.25", rankPosition: 1, rankDelta: 0, totalRatings: 398, description: "Artisan pizza and craft beer. Black-owned Nashville favorite.", priceRange: "$", phone: "(615) 891-2433", address: "911 Buchanan St, Nashville, TN", lat: "36.1820", lng: "-86.7950", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop" },
      { name: "Barista Parlor", slug: "barista-parlor-nashville", city: "Nashville", neighborhood: "The Gulch", category: "cafe", weightedScore: "4.450", rawAvgScore: "4.30", rankPosition: 2, rankDelta: 0, totalRatings: 267, description: "Nashville's craft coffee pioneer. Industrial chic spaces.", priceRange: "$$", phone: "(615) 712-9766", address: "519 Gallatin Ave, Nashville, TN", lat: "36.1740", lng: "-86.7560", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop" }
    ];
    CHARLOTTE_BUSINESSES = [
      { name: "Midwood Smokehouse", slug: "midwood-smokehouse-charlotte", city: "Charlotte", neighborhood: "Plaza Midwood", category: "bbq", weightedScore: "4.780", rawAvgScore: "4.65", rankPosition: 1, rankDelta: 0, totalRatings: 512, description: "Texas-style BBQ meets Carolina tradition. Brisket and pulled pork perfection.", priceRange: "$$", phone: "(704) 295-4227", address: "1401 Central Ave, Charlotte, NC", lat: "35.2180", lng: "-80.8190", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&h=400&fit=crop" },
      { name: "Haberdish", slug: "haberdish-charlotte", city: "Charlotte", neighborhood: "NoDa", category: "restaurant", weightedScore: "4.720", rawAvgScore: "4.60", rankPosition: 2, rankDelta: 0, totalRatings: 445, description: "Southern sharing plates in the NoDa arts district.", priceRange: "$$$", phone: "(704) 817-7768", address: "3106 N Davidson St, Charlotte, NC", lat: "35.2450", lng: "-80.8120", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop" },
      { name: "Optimist Hall", slug: "optimist-hall-charlotte", city: "Charlotte", neighborhood: "South End", category: "restaurant", weightedScore: "4.650", rawAvgScore: "4.50", rankPosition: 3, rankDelta: 0, totalRatings: 398, description: "Historic textile mill turned food hall with 20+ vendors.", priceRange: "$$", phone: "(704) 603-0400", address: "1115 N Brevard St, Charlotte, NC", lat: "35.2320", lng: "-80.8330", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop" },
      { name: "The Asbury", slug: "the-asbury-charlotte", city: "Charlotte", neighborhood: "Uptown", category: "restaurant", weightedScore: "4.580", rawAvgScore: "4.45", rankPosition: 4, rankDelta: 0, totalRatings: 356, description: "Farm-to-table Southern fine dining in the Dunhill Hotel.", priceRange: "$$$$", phone: "(704) 342-1193", address: "237 N Tryon St, Charlotte, NC", lat: "35.2280", lng: "-80.8430", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=600&h=400&fit=crop" },
      { name: "Not Just Coffee", slug: "not-just-coffee-charlotte", city: "Charlotte", neighborhood: "South End", category: "cafe", weightedScore: "4.550", rawAvgScore: "4.40", rankPosition: 1, rankDelta: 0, totalRatings: 312, description: "Charlotte's original specialty coffee roaster.", priceRange: "$$", phone: "(704) 831-7799", address: "224 E 7th St, Charlotte, NC", lat: "35.2260", lng: "-80.8390", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop" },
      { name: "Mac's Speed Shop", slug: "macs-speed-shop-charlotte", city: "Charlotte", neighborhood: "South End", category: "bbq", weightedScore: "4.500", rawAvgScore: "4.35", rankPosition: 5, rankDelta: 0, totalRatings: 423, description: "BBQ and bikes. Legendary pulled pork and craft beer selection.", priceRange: "$$", phone: "(704) 522-6227", address: "2511 South Blvd, Charlotte, NC", lat: "35.2080", lng: "-80.8570", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop" },
      { name: "Amelie's French Bakery", slug: "amelies-french-bakery-charlotte", city: "Charlotte", neighborhood: "NoDa", category: "bakery", weightedScore: "4.480", rawAvgScore: "4.35", rankPosition: 1, rankDelta: 0, totalRatings: 389, description: "24-hour French bakery and cafe. Charlotte institution.", priceRange: "$", phone: "(704) 376-1781", address: "2424 N Davidson St, Charlotte, NC", lat: "35.2410", lng: "-80.8140", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop" },
      { name: "The Broken Spoke", slug: "broken-spoke-charlotte", city: "Charlotte", neighborhood: "Plaza Midwood", category: "bar", weightedScore: "4.450", rawAvgScore: "4.30", rankPosition: 1, rankDelta: 0, totalRatings: 267, description: "Dive bar meets craft cocktails in Plaza Midwood.", priceRange: "$$", phone: "(704) 375-2882", address: "2416 Central Ave, Charlotte, NC", lat: "35.2185", lng: "-80.8050", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop" },
      { name: "Leah & Louise", slug: "leah-and-louise-charlotte", city: "Charlotte", neighborhood: "Uptown", category: "restaurant", weightedScore: "4.420", rawAvgScore: "4.30", rankPosition: 6, rankDelta: 0, totalRatings: 289, description: "Modern juke joint with Southern and global soul food.", priceRange: "$$$", phone: "(704) 343-1010", address: "301 E 7th St, Charlotte, NC", lat: "35.2275", lng: "-80.8370", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1653005753991-22a8bf831f89?w=600&h=400&fit=crop" },
      { name: "Sunflour Baking Company", slug: "sunflour-baking-charlotte", city: "Charlotte", neighborhood: "NoDa", category: "cafe", weightedScore: "4.380", rawAvgScore: "4.25", rankPosition: 2, rankDelta: 0, totalRatings: 234, description: "Scratch-made pastries and brunch in the NoDa arts scene.", priceRange: "$$", phone: "(704) 741-0398", address: "220 E 36th St, Charlotte, NC", lat: "35.2440", lng: "-80.8160", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop" }
    ];
    RALEIGH_BUSINESSES = [
      { name: "Beasley's Chicken + Honey", slug: "beasleys-chicken-raleigh", city: "Raleigh", neighborhood: "Downtown Raleigh", category: "restaurant", weightedScore: "4.780", rawAvgScore: "4.65", rankPosition: 1, rankDelta: 0, totalRatings: 489, description: "Ashley Christensen's fried chicken temple. James Beard winner.", priceRange: "$$", phone: "(919) 322-0127", address: "237 S Wilmington St, Raleigh, NC", lat: "35.7760", lng: "-78.6380", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop" },
      { name: "Poole's Diner", slug: "pooles-diner-raleigh", city: "Raleigh", neighborhood: "Downtown Raleigh", category: "restaurant", weightedScore: "4.720", rawAvgScore: "4.60", rankPosition: 2, rankDelta: 0, totalRatings: 456, description: "Farm-to-fork pioneer in a retro 1940s diner space.", priceRange: "$$$", phone: "(919) 832-4477", address: "426 S McDowell St, Raleigh, NC", lat: "35.7740", lng: "-78.6400", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop" },
      { name: "The Pit Authentic Barbecue", slug: "the-pit-bbq-raleigh", city: "Raleigh", neighborhood: "Warehouse District", category: "bbq", weightedScore: "4.650", rawAvgScore: "4.50", rankPosition: 1, rankDelta: 0, totalRatings: 534, description: "Whole-hog Eastern NC barbecue in the Warehouse District.", priceRange: "$$", phone: "(919) 890-4500", address: "328 W Davie St, Raleigh, NC", lat: "35.7720", lng: "-78.6430", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&h=400&fit=crop" },
      { name: "Brewery Bhavana", slug: "brewery-bhavana-raleigh", city: "Raleigh", neighborhood: "Downtown Raleigh", category: "bar", weightedScore: "4.580", rawAvgScore: "4.45", rankPosition: 1, rankDelta: 0, totalRatings: 378, description: "Brewery, bookstore, dim sum parlor, and flower shop. All in one.", priceRange: "$$", phone: "(919) 829-9998", address: "218 S Blount St, Raleigh, NC", lat: "35.7755", lng: "-78.6360", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=400&fit=crop" },
      { name: "Jolie", slug: "jolie-raleigh", city: "Raleigh", neighborhood: "Five Points", category: "restaurant", weightedScore: "4.550", rawAvgScore: "4.40", rankPosition: 3, rankDelta: 0, totalRatings: 312, description: "French-inspired neighborhood bistro in Five Points.", priceRange: "$$$", phone: "(919) 896-8783", address: "620 Glenwood Ave, Raleigh, NC", lat: "35.7870", lng: "-78.6470", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=600&h=400&fit=crop" },
      { name: "Sitti", slug: "sitti-raleigh", city: "Raleigh", neighborhood: "Glenwood South", category: "restaurant", weightedScore: "4.500", rawAvgScore: "4.35", rankPosition: 4, rankDelta: 0, totalRatings: 345, description: "Lebanese cuisine on Glenwood South. Raleigh's Mediterranean gem.", priceRange: "$$", phone: "(919) 239-4070", address: "137 S Wilmington St, Raleigh, NC", lat: "35.7770", lng: "-78.6375", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1653005753991-22a8bf831f89?w=600&h=400&fit=crop" },
      { name: "Videri Chocolate Factory", slug: "videri-chocolate-raleigh", city: "Raleigh", neighborhood: "Warehouse District", category: "cafe", weightedScore: "4.480", rawAvgScore: "4.35", rankPosition: 1, rankDelta: 0, totalRatings: 289, description: "Bean-to-bar chocolate factory with cafe. Raleigh sweet spot.", priceRange: "$$", phone: "(919) 831-1180", address: "327 W Davie St, Raleigh, NC", lat: "35.7718", lng: "-78.6428", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop" },
      { name: "La Farm Bakery", slug: "la-farm-bakery-raleigh", city: "Raleigh", neighborhood: "Five Points", category: "bakery", weightedScore: "4.450", rawAvgScore: "4.30", rankPosition: 1, rankDelta: 0, totalRatings: 267, description: "Artisan French bakery. Best bread in the Triangle.", priceRange: "$$", phone: "(919) 657-0657", address: "4248 NW Cary Pkwy, Raleigh, NC", lat: "35.8010", lng: "-78.7990", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop" },
      { name: "Clyde Cooper's Barbecue", slug: "clyde-coopers-bbq-raleigh", city: "Raleigh", neighborhood: "Downtown Raleigh", category: "bbq", weightedScore: "4.420", rawAvgScore: "4.30", rankPosition: 2, rankDelta: 0, totalRatings: 423, description: "Eastern NC BBQ since 1938. Raleigh's oldest barbecue joint.", priceRange: "$", phone: "(919) 832-7614", address: "109 E Davie St, Raleigh, NC", lat: "35.7730", lng: "-78.6370", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop" },
      { name: "Hummingbird", slug: "hummingbird-raleigh", city: "Raleigh", neighborhood: "Glenwood South", category: "cafe", weightedScore: "4.380", rawAvgScore: "4.25", rankPosition: 2, rankDelta: 0, totalRatings: 198, description: "Coffee and cocktails with Raleigh rooftop views.", priceRange: "$$", phone: "(919) 301-1749", address: "223 S Wilmington St, Raleigh, NC", lat: "35.7758", lng: "-78.6378", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop" }
    ];
    ALL_CITY_BUSINESSES = [
      ...AUSTIN_BUSINESSES,
      ...HOUSTON_BUSINESSES,
      ...SAN_ANTONIO_BUSINESSES,
      ...FORT_WORTH_BUSINESSES,
      ...OKC_BUSINESSES,
      ...NOLA_BUSINESSES,
      ...MEMPHIS_BUSINESSES,
      ...NASHVILLE_BUSINESSES,
      ...CHARLOTTE_BUSINESSES,
      ...RALEIGH_BUSINESSES
    ];
    isDirectRun = process.argv[1]?.includes("seed-cities");
    if (isDirectRun) {
      seedCities().then(() => process.exit(0)).catch((err) => {
        console.error("Seed failed:", err);
        process.exit(1);
      });
    }
  }
});

// server/email-tracking.ts
import crypto3 from "crypto";
function findEvent(eventId) {
  return events.find((e) => e.id === eventId);
}
function trackEmailSent(to, template, metadata) {
  const id = crypto3.randomUUID();
  const event = {
    id,
    to,
    template,
    sentAt: /* @__PURE__ */ new Date(),
    status: "sent",
    metadata
  };
  events.push(event);
  if (events.length > MAX_EVENTS) {
    events.splice(0, events.length - MAX_EVENTS);
  }
  log(`Email sent to=${to} template=${template} id=${id}`);
  return id;
}
function trackEmailOpened(eventId) {
  const event = findEvent(eventId);
  if (!event) return;
  event.status = "opened";
  event.openedAt = /* @__PURE__ */ new Date();
  log(`Email opened id=${eventId}`);
}
function trackEmailClicked(eventId) {
  const event = findEvent(eventId);
  if (!event) return;
  event.status = "clicked";
  event.clickedAt = /* @__PURE__ */ new Date();
  log(`Email clicked id=${eventId}`);
}
function trackEmailFailed(eventId, reason) {
  const event = findEvent(eventId);
  if (!event) return;
  event.status = "failed";
  event.metadata = { ...event.metadata, failureReason: reason };
  log(`Email failed id=${eventId} reason=${reason}`);
}
function trackEmailBounced(eventId) {
  const event = findEvent(eventId);
  if (!event) return;
  event.status = "bounced";
  log(`Email bounced id=${eventId}`);
}
function getEmailStats() {
  const total = events.length;
  const count15 = (s) => events.filter((e) => e.status === s).length;
  const sent = count15("sent");
  const delivered = count15("delivered");
  const opened = count15("opened");
  const clicked = count15("clicked");
  const bounced = count15("bounced");
  const failed = count15("failed");
  const openRate = total > 0 ? (opened + clicked) / total : 0;
  const clickRate = total > 0 ? clicked / total : 0;
  return { total, sent, delivered, opened, clicked, bounced, failed, openRate, clickRate };
}
var MAX_EVENTS, events;
var init_email_tracking = __esm({
  "server/email-tracking.ts"() {
    "use strict";
    init_logger();
    MAX_EVENTS = 1e3;
    events = [];
  }
});

// server/email.ts
var email_exports = {};
__export(email_exports, {
  sendBetaInviteEmail: () => sendBetaInviteEmail,
  sendClaimAdminNotification: () => sendClaimAdminNotification,
  sendClaimApprovedEmail: () => sendClaimApprovedEmail,
  sendClaimConfirmationEmail: () => sendClaimConfirmationEmail,
  sendClaimRejectedEmail: () => sendClaimRejectedEmail,
  sendEmail: () => sendEmail,
  sendPasswordResetEmail: () => sendPasswordResetEmail,
  sendPaymentReceiptEmail: () => sendPaymentReceiptEmail,
  sendVerificationEmail: () => sendVerificationEmail,
  sendWelcomeEmail: () => sendWelcomeEmail
});
async function sendWithRetry(payload, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: FROM_ADDRESS,
          to: [payload.to],
          subject: payload.subject,
          html: payload.html,
          text: payload.text
        })
      });
      if (res.ok) {
        emailLog.info(`Sent to ${payload.to}: ${payload.subject}`);
        return true;
      }
      const body = await res.text();
      if (res.status < 500 && res.status !== 429) {
        emailLog.error(`Resend API error ${res.status}: ${body.slice(0, 200)}`);
        return false;
      }
      emailLog.warn(`Resend API ${res.status} (attempt ${attempt + 1}/${maxRetries}): ${body.slice(0, 100)}`);
    } catch (err) {
      emailLog.warn(`Email send error (attempt ${attempt + 1}/${maxRetries}): ${err.message}`);
    }
    if (attempt < maxRetries - 1) {
      await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
    }
  }
  emailLog.error(`Email to ${payload.to} failed after ${maxRetries} retries`);
  return false;
}
async function sendEmail(payload) {
  const templateName = payload.subject.slice(0, 50);
  const trackingId = trackEmailSent(payload.to, templateName);
  if (!RESEND_API_KEY) {
    emailLog.info(`[DEV] To: ${payload.to} | Subject: ${payload.subject}`);
    return;
  }
  const success = await sendWithRetry(payload);
  if (!success) {
    trackEmailFailed(trackingId, "Resend API failed after retries");
  }
}
async function sendWelcomeEmail(params) {
  const { email, displayName, city, username } = params;
  const firstName = displayName.split(" ")[0];
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#F7F6F3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F3;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr><td style="background:#0D1B2A;padding:32px 24px;text-align:center;">
          <h1 style="margin:0;color:#C49A1A;font-size:28px;font-weight:900;letter-spacing:-0.5px;">TopRanker</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">The world's most trustworthy ranking platform</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px 24px;">
          <h2 style="margin:0 0 8px;color:#0D1B2A;font-size:22px;font-weight:700;">Welcome, ${firstName}!</h2>
          <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.6;">
            You've joined the ${city} ranking community as <strong>@${username}</strong>. Here's what to know:
          </p>

          <!-- Steps -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr><td style="padding:12px 16px;background:#F7F6F3;border-radius:10px;margin-bottom:8px;">
              <p style="margin:0;color:#0D1B2A;font-size:14px;"><strong style="color:#C49A1A;">1.</strong> Explore rankings in ${city} \u2014 see what the community thinks</p>
            </td></tr>
            <tr><td style="height:8px;"></td></tr>
            <tr><td style="padding:12px 16px;background:#F7F6F3;border-radius:10px;">
              <p style="margin:0;color:#0D1B2A;font-size:14px;"><strong style="color:#C49A1A;">2.</strong> After 3 days, unlock rating \u2014 your voice shapes the leaderboard</p>
            </td></tr>
            <tr><td style="height:8px;"></td></tr>
            <tr><td style="padding:12px 16px;background:#F7F6F3;border-radius:10px;">
              <p style="margin:0;color:#0D1B2A;font-size:14px;"><strong style="color:#C49A1A;">3.</strong> Build credibility \u2014 more ratings = higher vote weight</p>
            </td></tr>
          </table>

          <!-- Tier Preview -->
          <div style="border:1px solid #E8E6E1;border-radius:10px;padding:16px;margin-bottom:24px;">
            <p style="margin:0 0 4px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Your Starting Tier</p>
            <p style="margin:0;color:#0D1B2A;font-size:16px;font-weight:700;">New Member</p>
            <p style="margin:4px 0 0;color:#888;font-size:12px;">0.10x vote weight \xB7 Rate to earn Regular status</p>
          </div>

          <!-- CTA -->
          <a href="https://topranker.com" style="display:block;text-align:center;background:#0D1B2A;color:#FFFFFF;padding:14px 24px;border-radius:12px;font-size:16px;font-weight:700;text-decoration:none;">
            Start Exploring ${city}
          </a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 24px;border-top:1px solid #E8E6E1;text-align:center;">
          <p style="margin:0;color:#999;font-size:11px;">
            TopRanker \u2014 Trust-weighted rankings for ${city}<br>
            <a href="https://topranker.com/unsubscribe" style="color:#C49A1A;text-decoration:none;">Unsubscribe</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  const text2 = `Welcome to TopRanker, ${firstName}!

You've joined the ${city} ranking community as @${username}.

1. Explore rankings in ${city}
2. After 3 days, unlock rating
3. Build credibility \u2014 more ratings = higher vote weight

Your starting tier: New Member (0.10x vote weight)

Start exploring: https://topranker.com

\u2014 The TopRanker Team`;
  await sendEmail({
    to: email,
    subject: `Welcome to TopRanker, ${firstName}! \u{1F3C6}`,
    html,
    text: text2
  });
}
async function sendClaimConfirmationEmail(params) {
  const { email, displayName, businessName } = params;
  const firstName = displayName.split(" ")[0];
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#F7F6F3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F3;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <tr><td style="background:#0D1B2A;padding:24px;text-align:center;">
          <h1 style="margin:0;color:#C49A1A;font-size:24px;font-weight:900;">TopRanker</h1>
        </td></tr>
        <tr><td style="padding:32px 24px;">
          <h2 style="margin:0 0 12px;color:#0D1B2A;font-size:20px;font-weight:700;">Claim Received</h2>
          <p style="margin:0 0 16px;color:#555;font-size:15px;line-height:1.6;">
            Hi ${firstName}, we received your claim for <strong>${businessName}</strong>.
          </p>
          <div style="border:1px solid #E8E6E1;border-radius:10px;padding:16px;margin-bottom:20px;">
            <p style="margin:0 0 4px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Status</p>
            <p style="margin:0;color:#C49A1A;font-size:16px;font-weight:700;">Pending Review</p>
            <p style="margin:4px 0 0;color:#888;font-size:12px;">Our team will verify your claim within 24-48 hours.</p>
          </div>
          <p style="margin:0;color:#555;font-size:14px;line-height:1.6;">
            Once approved, you'll get access to your business dashboard with analytics, review responses, and a verified owner badge.
          </p>
        </td></tr>
        <tr><td style="padding:16px 24px;border-top:1px solid #E8E6E1;text-align:center;">
          <p style="margin:0;color:#999;font-size:11px;">TopRanker \u2014 Trust-weighted rankings</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  const text2 = `Hi ${firstName},

We received your claim for ${businessName}.

Status: Pending Review
Our team will verify your claim within 24-48 hours.

Once approved, you'll get access to your business dashboard.

\u2014 The TopRanker Team`;
  await sendEmail({
    to: email,
    subject: `Claim received: ${businessName}`,
    html,
    text: text2
  });
}
async function sendPaymentReceiptEmail(params) {
  const { email, displayName, type, amount, businessName, paymentId } = params;
  const firstName = displayName.split(" ")[0];
  const dollars = (amount / 100).toFixed(2);
  const typeLabel = type === "challenger_entry" ? "Challenger Entry" : type === "dashboard_pro" ? "Dashboard Pro Subscription" : type === "featured_placement" ? "Featured Placement" : type;
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#F7F6F3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F3;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <tr><td style="background:#0D1B2A;padding:24px;text-align:center;">
          <h1 style="margin:0;color:#C49A1A;font-size:24px;font-weight:900;">TopRanker</h1>
        </td></tr>
        <tr><td style="padding:32px 24px;">
          <h2 style="margin:0 0 12px;color:#0D1B2A;font-size:20px;font-weight:700;">Payment Receipt</h2>
          <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.6;">
            Hi ${firstName}, thank you for your purchase!
          </p>

          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E8E6E1;border-radius:10px;overflow:hidden;margin-bottom:20px;">
            <tr style="background:#F7F6F3;">
              <td style="padding:12px 16px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Item</td>
              <td style="padding:12px 16px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;text-align:right;">Amount</td>
            </tr>
            <tr>
              <td style="padding:14px 16px;color:#0D1B2A;font-size:14px;">
                <strong>${typeLabel}</strong><br>
                <span style="color:#888;font-size:12px;">${businessName}</span>
              </td>
              <td style="padding:14px 16px;color:#0D1B2A;font-size:18px;font-weight:700;text-align:right;">$${dollars}</td>
            </tr>
            <tr style="border-top:1px solid #E8E6E1;">
              <td style="padding:12px 16px;color:#555;font-size:12px;">Reference</td>
              <td style="padding:12px 16px;color:#888;font-size:11px;text-align:right;font-family:monospace;">${paymentId}</td>
            </tr>
          </table>

          <p style="margin:0;color:#888;font-size:12px;line-height:1.5;">
            Questions about this charge? Contact us at support@topranker.com
          </p>
        </td></tr>
        <tr><td style="padding:16px 24px;border-top:1px solid #E8E6E1;text-align:center;">
          <p style="margin:0;color:#999;font-size:11px;">TopRanker \u2014 Trust-weighted rankings</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  const text2 = `Payment Receipt

Hi ${firstName},

Thank you for your purchase!

Item: ${typeLabel}
Business: ${businessName}
Amount: $${dollars}
Reference: ${paymentId}

Questions? Contact support@topranker.com

\u2014 The TopRanker Team`;
  await sendEmail({
    to: email,
    subject: `TopRanker Receipt: $${dollars} \u2014 ${typeLabel}`,
    html,
    text: text2
  });
}
async function sendClaimApprovedEmail(params) {
  const { email, displayName, businessName, businessSlug } = params;
  const firstName = displayName.split(" ")[0];
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#F7F6F3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F3;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <tr><td style="background:#0D1B2A;padding:24px;text-align:center;">
          <h1 style="margin:0;color:#C49A1A;font-size:24px;font-weight:900;">TopRanker</h1>
        </td></tr>
        <tr><td style="padding:32px 24px;">
          <h2 style="margin:0 0 12px;color:#0D1B2A;font-size:20px;font-weight:700;">Claim Approved!</h2>
          <p style="margin:0 0 16px;color:#555;font-size:15px;line-height:1.6;">
            Hi ${firstName}, your claim for <strong>${businessName}</strong> has been approved.
            You are now the verified owner.
          </p>
          <div style="border:1px solid #E8E6E1;border-radius:10px;padding:16px;margin-bottom:20px;">
            <p style="margin:0 0 4px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">What You Can Do Now</p>
            <ul style="margin:8px 0 0;padding-left:18px;color:#0D1B2A;font-size:14px;line-height:1.8;">
              <li>Access your business dashboard with analytics</li>
              <li>Respond to customer ratings</li>
              <li>Display the verified owner badge</li>
            </ul>
          </div>
          <a href="https://topranker.com/business/${businessSlug}/dashboard" style="display:block;text-align:center;background:#0D1B2A;color:#FFFFFF;padding:14px 24px;border-radius:12px;font-size:16px;font-weight:700;text-decoration:none;">
            View Your Dashboard
          </a>
        </td></tr>
        <tr><td style="padding:16px 24px;border-top:1px solid #E8E6E1;text-align:center;">
          <p style="margin:0;color:#999;font-size:11px;">TopRanker \u2014 Trust-weighted rankings</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  const text2 = `Hi ${firstName},

Your claim for ${businessName} has been approved! You are now the verified owner.

What you can do now:
- Access your business dashboard with analytics
- Respond to customer ratings
- Display the verified owner badge

View your dashboard: https://topranker.com/business/${businessSlug}/dashboard

\u2014 The TopRanker Team`;
  await sendEmail({
    to: email,
    subject: `Claim approved: ${businessName}`,
    html,
    text: text2
  });
}
async function sendClaimRejectedEmail(params) {
  const { email, displayName, businessName } = params;
  const firstName = displayName.split(" ")[0];
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#F7F6F3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F3;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <tr><td style="background:#0D1B2A;padding:24px;text-align:center;">
          <h1 style="margin:0;color:#C49A1A;font-size:24px;font-weight:900;">TopRanker</h1>
        </td></tr>
        <tr><td style="padding:32px 24px;">
          <h2 style="margin:0 0 12px;color:#0D1B2A;font-size:20px;font-weight:700;">Claim Update</h2>
          <p style="margin:0 0 16px;color:#555;font-size:15px;line-height:1.6;">
            Hi ${firstName}, we were unable to verify your claim for <strong>${businessName}</strong> at this time.
          </p>
          <div style="border:1px solid #E8E6E1;border-radius:10px;padding:16px;margin-bottom:20px;">
            <p style="margin:0 0 4px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Next Steps</p>
            <p style="margin:8px 0 0;color:#0D1B2A;font-size:14px;line-height:1.6;">
              If you believe this was in error, please contact us at
              <a href="mailto:support@topranker.com" style="color:#C49A1A;">support@topranker.com</a>
              with additional verification documents.
            </p>
          </div>
        </td></tr>
        <tr><td style="padding:16px 24px;border-top:1px solid #E8E6E1;text-align:center;">
          <p style="margin:0;color:#999;font-size:11px;">TopRanker \u2014 Trust-weighted rankings</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  const text2 = `Hi ${firstName},

We were unable to verify your claim for ${businessName} at this time.

If you believe this was in error, please contact us at support@topranker.com with additional verification documents.

\u2014 The TopRanker Team`;
  await sendEmail({
    to: email,
    subject: `Claim update: ${businessName}`,
    html,
    text: text2
  });
}
async function sendVerificationEmail(params) {
  const { email, displayName, token } = params;
  const firstName = displayName.split(" ")[0];
  const verifyUrl = `https://topranker.com/verify-email?token=${token}`;
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#F7F6F3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F3;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <tr><td style="background:#0D1B2A;padding:24px;text-align:center;">
          <h1 style="margin:0;color:#C49A1A;font-size:24px;font-weight:900;">TopRanker</h1>
        </td></tr>
        <tr><td style="padding:32px 24px;">
          <h2 style="margin:0 0 12px;color:#0D1B2A;font-size:20px;font-weight:700;">Verify Your Email</h2>
          <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.6;">
            Hi ${firstName}, please verify your email address to complete your TopRanker account setup.
          </p>
          <a href="${verifyUrl}" style="display:block;text-align:center;background:#C49A1A;color:#FFFFFF;padding:14px 24px;border-radius:12px;font-size:16px;font-weight:700;text-decoration:none;">
            Verify Email Address
          </a>
          <p style="margin:20px 0 0;color:#888;font-size:12px;line-height:1.5;">
            If you didn't create a TopRanker account, you can safely ignore this email.
          </p>
        </td></tr>
        <tr><td style="padding:16px 24px;border-top:1px solid #E8E6E1;text-align:center;">
          <p style="margin:0;color:#999;font-size:11px;">TopRanker \u2014 Trust-weighted rankings</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  const text2 = `Hi ${firstName},

Please verify your email address to complete your TopRanker account setup.

Verify here: ${verifyUrl}

If you didn't create a TopRanker account, you can safely ignore this email.

\u2014 The TopRanker Team`;
  await sendEmail({
    to: email,
    subject: "Verify your TopRanker email",
    html,
    text: text2
  });
}
async function sendPasswordResetEmail(params) {
  const { email, displayName, token } = params;
  const firstName = displayName.split(" ")[0];
  const resetUrl = `https://topranker.com/reset-password?token=${token}`;
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#F7F6F3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F3;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <tr><td style="background:#0D1B2A;padding:24px;text-align:center;">
          <h1 style="margin:0;color:#C49A1A;font-size:24px;font-weight:900;">TopRanker</h1>
        </td></tr>
        <tr><td style="padding:32px 24px;">
          <h2 style="margin:0 0 12px;color:#0D1B2A;font-size:20px;font-weight:700;">Reset Your Password</h2>
          <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.6;">
            Hi ${firstName}, we received a request to reset your password. Click the button below to choose a new one.
          </p>
          <a href="${resetUrl}" style="display:block;text-align:center;background:#0D1B2A;color:#FFFFFF;padding:14px 24px;border-radius:12px;font-size:16px;font-weight:700;text-decoration:none;">
            Reset Password
          </a>
          <p style="margin:20px 0 0;color:#888;font-size:12px;line-height:1.5;">
            This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.
          </p>
        </td></tr>
        <tr><td style="padding:16px 24px;border-top:1px solid #E8E6E1;text-align:center;">
          <p style="margin:0;color:#999;font-size:11px;">TopRanker \u2014 Trust-weighted rankings</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  const text2 = `Hi ${firstName},

We received a request to reset your TopRanker password.

Reset here: ${resetUrl}

This link expires in 1 hour.
If you didn't request a password reset, you can safely ignore this email.

\u2014 The TopRanker Team`;
  await sendEmail({
    to: email,
    subject: "Reset your TopRanker password",
    html,
    text: text2
  });
}
async function sendBetaInviteEmail(params) {
  const { email, displayName, referralCode, invitedBy } = params;
  const firstName = displayName.split(" ")[0];
  const joinUrl = `https://topranker.com/join?ref=${encodeURIComponent(referralCode)}`;
  const inviteContext = invitedBy ? `${invitedBy} thinks you'd be a great addition to our trust network.` : `You've been selected as one of our first 25 beta testers.`;
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#F7F6F3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F3;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <tr><td style="background:#0D1B2A;padding:28px 24px;text-align:center;">
          <p style="margin:0;font-size:12px;letter-spacing:3px;color:#C49A1A;font-weight:700;">BETA INVITATION</p>
          <h1 style="margin:8px 0 0;font-size:24px;color:#FFFFFF;font-weight:900;">Welcome to TopRanker</h1>
        </td></tr>
        <tr><td style="padding:28px 24px;">
          <p style="margin:0 0 16px;color:#333;font-size:15px;line-height:1.6;">
            Hi ${firstName},
          </p>
          <p style="margin:0 0 16px;color:#555;font-size:15px;line-height:1.6;">
            ${inviteContext}
          </p>
          <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.6;">
            TopRanker is building <strong>trustworthy restaurant rankings</strong> \u2014 no fake reviews, no pay-to-play. Your ratings carry real weight based on your credibility as a reviewer.
          </p>
          <a href="${joinUrl}" style="display:block;text-align:center;background:#C49A1A;color:#FFFFFF;padding:16px 24px;border-radius:12px;font-size:16px;font-weight:700;text-decoration:none;">
            Join the Beta
          </a>
          <p style="margin:20px 0 0;color:#555;font-size:14px;line-height:1.6;">
            <strong>What to expect:</strong>
          </p>
          <ul style="color:#555;font-size:14px;line-height:1.8;padding-left:20px;">
            <li>Rate restaurants honestly \u2014 your opinion shapes the rankings</li>
            <li>Build your credibility score over time</li>
            <li>Invite friends who care about honest dining reviews</li>
          </ul>
          <p style="margin:16px 0 0;color:#888;font-size:12px;">
            Your referral code: <strong style="color:#C49A1A;">${referralCode}</strong>
          </p>
        </td></tr>
        <tr><td style="padding:16px 24px;border-top:1px solid #E8E6E1;text-align:center;">
          <p style="margin:0;color:#999;font-size:11px;">TopRanker Beta \u2014 Trust-weighted rankings for restaurants</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  const text2 = `Hi ${firstName},

${inviteContext}

TopRanker is building trustworthy restaurant rankings \u2014 no fake reviews, no pay-to-play. Your ratings carry real weight based on your credibility as a reviewer.

Join the beta: ${joinUrl}

What to expect:
- Rate restaurants honestly \u2014 your opinion shapes the rankings
- Build your credibility score over time
- Invite friends who care about honest dining reviews

Your referral code: ${referralCode}

\u2014 The TopRanker Team`;
  await sendEmail({
    to: email,
    subject: "You're invited to TopRanker Beta",
    html,
    text: text2
  });
}
async function sendClaimAdminNotification(params) {
  const adminEmail = "admin@topranker.com";
  await sendEmail({
    to: adminEmail,
    subject: `New claim: ${params.businessName} by ${params.claimantName}`,
    html: `<p>New business claim submitted.</p>
      <ul>
        <li><strong>Business:</strong> ${params.businessName}</li>
        <li><strong>Claimant:</strong> ${params.claimantName} (${params.claimantEmail})</li>
      </ul>
      <p>Review at: https://topranker.com/admin</p>`,
    text: `New claim: ${params.businessName} by ${params.claimantName} (${params.claimantEmail})`
  });
}
var emailLog, RESEND_API_KEY, FROM_ADDRESS;
var init_email = __esm({
  "server/email.ts"() {
    "use strict";
    init_logger();
    init_email_tracking();
    emailLog = log.tag("Email");
    RESEND_API_KEY = process.env.RESEND_API_KEY || "";
    FROM_ADDRESS = process.env.EMAIL_FROM || "TopRanker <noreply@topranker.com>";
  }
});

// server/stripe-webhook.ts
var stripe_webhook_exports = {};
__export(stripe_webhook_exports, {
  handleStripeWebhook: () => handleStripeWebhook,
  processStripeEvent: () => processStripeEvent
});
function verifyAndParseEvent(req) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers["stripe-signature"];
  if (secret && sig) {
    try {
      const stripe = __require("stripe")(process.env.STRIPE_SECRET_KEY);
      return stripe.webhooks.constructEvent(req.body, sig, secret);
    } catch (err) {
      whLog.error(`Signature verification failed: ${err.message}`);
      return null;
    }
  }
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    return body;
  } catch {
    return null;
  }
}
async function processSubscriptionEvent(event) {
  const obj = event.data.object;
  const metadata = obj.metadata || {};
  const businessId = metadata.businessId;
  if (!businessId) {
    whLog.warn(`Subscription event ${event.type} missing businessId in metadata`);
    return { updated: false };
  }
  const { updateBusinessSubscription: updateBusinessSubscription2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
  if (event.type === "checkout.session.completed") {
    const subscriptionId = obj.subscription;
    const customerId = obj.customer;
    if (subscriptionId && customerId) {
      await updateBusinessSubscription2(businessId, {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus: "active"
      });
      whLog.info(`Subscription activated for business ${businessId}: ${subscriptionId}`);
      return { updated: true };
    }
  }
  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.created") {
    const status = obj.status;
    const periodEnd = obj.current_period_end;
    const cancelAtPeriodEnd = obj.cancel_at_period_end;
    const mappedStatus = cancelAtPeriodEnd ? "cancelled" : status === "active" ? "active" : status === "past_due" ? "past_due" : status === "canceled" ? "cancelled" : status === "trialing" ? "trialing" : "none";
    await updateBusinessSubscription2(businessId, {
      subscriptionStatus: mappedStatus,
      subscriptionPeriodEnd: periodEnd ? new Date(periodEnd * 1e3) : void 0
    });
    whLog.info(`Subscription updated for business ${businessId}: ${mappedStatus}`);
    return { updated: true };
  }
  if (event.type === "customer.subscription.deleted") {
    await updateBusinessSubscription2(businessId, {
      subscriptionStatus: "cancelled",
      stripeSubscriptionId: null
    });
    whLog.info(`Subscription cancelled for business ${businessId}`);
    return { updated: true };
  }
  if (event.type === "invoice.payment_failed") {
    await updateBusinessSubscription2(businessId, { subscriptionStatus: "past_due" });
    whLog.info(`Subscription past_due for business ${businessId}`);
    return { updated: true };
  }
  return { updated: false };
}
async function processStripeEvent(event) {
  if (SUBSCRIPTION_EVENTS.has(event.type)) {
    return processSubscriptionEvent(event);
  }
  const newStatus = STATUS_MAP[event.type];
  if (!newStatus) {
    whLog.info(`Ignoring event type: ${event.type}`);
    return { updated: false };
  }
  const obj = event.data.object;
  const paymentIntentId = event.type === "charge.refunded" ? obj.payment_intent || obj.id : obj.id;
  whLog.info(`Processing ${event.type} for ${paymentIntentId} \u2192 ${newStatus}`);
  const updated = await updatePaymentStatusByStripeId(paymentIntentId, newStatus);
  if (!updated) {
    whLog.warn(`No payment record found for PI: ${paymentIntentId}`);
  }
  if (event.type === "payment_intent.succeeded") {
    const metadata = obj.metadata || {};
    if (metadata.type === "challenger_entry" && metadata.challengerId) {
      try {
        const { createChallenge: createChallenge2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
        const { getBusinessById: getBusinessById2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
        const challengerBiz = await getBusinessById2(metadata.challengerId);
        if (challengerBiz) {
          const { getLeaderboard: getLeaderboard2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
          const leaderboard = await getLeaderboard2(challengerBiz.city, challengerBiz.category);
          const defender = leaderboard.find((b) => b.id !== metadata.challengerId);
          if (defender) {
            await createChallenge2({
              challengerId: metadata.challengerId,
              defenderId: defender.id,
              category: challengerBiz.category,
              city: challengerBiz.city,
              stripePaymentIntentId: paymentIntentId
            });
            whLog.info(`Challenger record created for PI: ${paymentIntentId}`);
          }
        }
      } catch (err) {
        whLog.error(`Failed to create challenger record: ${err.message}`);
      }
    }
  }
  return { updated: !!updated };
}
async function handleStripeWebhook(req, res) {
  const event = verifyAndParseEvent(req);
  if (!event) {
    return res.status(400).json({ error: "Invalid webhook payload" });
  }
  const logEntry = await logWebhookEvent({
    source: "stripe",
    eventId: event.id,
    eventType: event.type,
    payload: event
  });
  try {
    const result = await processStripeEvent(event);
    await markWebhookProcessed(logEntry.id);
    return res.json({ received: true, ...result });
  } catch (err) {
    whLog.error(`Failed to update payment status: ${err.message}`);
    await markWebhookProcessed(logEntry.id, err.message);
    return res.status(500).json({ error: "Internal error processing webhook" });
  }
}
var whLog, STATUS_MAP, SUBSCRIPTION_EVENTS;
var init_stripe_webhook = __esm({
  "server/stripe-webhook.ts"() {
    "use strict";
    init_logger();
    init_storage();
    whLog = log.tag("StripeWebhook");
    STATUS_MAP = {
      "payment_intent.succeeded": "succeeded",
      "payment_intent.payment_failed": "failed",
      "charge.refunded": "refunded"
    };
    SUBSCRIPTION_EVENTS = /* @__PURE__ */ new Set([
      "customer.subscription.created",
      "customer.subscription.updated",
      "customer.subscription.deleted",
      "invoice.payment_failed",
      "checkout.session.completed"
    ]);
  }
});

// server/error-tracking.ts
var error_tracking_exports = {};
__export(error_tracking_exports, {
  captureServerError: () => captureServerError,
  errorHandlerMiddleware: () => errorHandlerMiddleware,
  getErrorStats: () => getErrorStats,
  getRecentServerErrors: () => getRecentServerErrors,
  initErrorTracking: () => initErrorTracking
});
function initErrorTracking() {
  if (SENTRY_DSN) {
    errorLog.info("Error tracking initialized with Sentry DSN");
    initialized = true;
  } else {
    errorLog.info("SENTRY_DSN not set \u2014 error tracking uses console fallback");
  }
  process.on("unhandledRejection", (reason) => {
    const err = reason instanceof Error ? reason : new Error(String(reason));
    captureServerError(err, { type: "unhandledRejection" }, "fatal");
  });
  process.on("uncaughtException", (err) => {
    captureServerError(err, { type: "uncaughtException" }, "fatal");
    setTimeout(() => process.exit(1), 2e3);
  });
}
function captureServerError(error, context, severity = "error") {
  const event = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    severity
  };
  recentErrors.unshift(event);
  if (recentErrors.length > MAX_RECENT_ERRORS) {
    recentErrors.length = MAX_RECENT_ERRORS;
  }
  if (initialized && SENTRY_DSN) {
    errorLog.error(JSON.stringify({
      sentry: true,
      ...event
    }));
  } else {
    errorLog.error(`${severity}: ${error.message}`, context);
  }
}
function errorHandlerMiddleware(err, req, res, _next) {
  const userId = req.user?.id;
  const route = `${req.method} ${req.route?.path || req.path}`;
  captureServerError(err, {
    route,
    userId,
    query: req.query,
    ip: req.ip
  });
  if (!res.headersSent) {
    res.status(500).json({ error: "Internal server error" });
  }
}
function getRecentServerErrors(limit = 20) {
  return recentErrors.slice(0, limit);
}
function getErrorStats() {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1e3;
  return {
    total: recentErrors.length,
    fatal: recentErrors.filter((e) => e.severity === "fatal").length,
    error: recentErrors.filter((e) => e.severity === "error").length,
    warning: recentErrors.filter((e) => e.severity === "warning").length,
    last24h: recentErrors.filter((e) => new Date(e.timestamp).getTime() > oneDayAgo).length
  };
}
var errorLog, SENTRY_DSN, initialized, recentErrors, MAX_RECENT_ERRORS;
var init_error_tracking = __esm({
  "server/error-tracking.ts"() {
    "use strict";
    init_logger();
    errorLog = log.tag("ErrorTracking");
    SENTRY_DSN = process.env.SENTRY_DSN || "";
    initialized = false;
    recentErrors = [];
    MAX_RECENT_ERRORS = 100;
  }
});

// server/prerender.ts
var prerender_exports = {};
__export(prerender_exports, {
  getPrerenderCacheStats: () => getPrerenderCacheStats,
  invalidatePrerenderCache: () => invalidatePrerenderCache,
  prerenderMiddleware: () => prerenderMiddleware
});
function isBot(userAgent) {
  const ua = userAgent.toLowerCase();
  return BOT_AGENTS.some((bot) => ua.includes(bot));
}
function getCached(key2) {
  const entry = cache.get(key2);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key2);
    return null;
  }
  return entry.html;
}
function setCache(key2, html) {
  if (cache.size >= CACHE_MAX) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key2, { html, timestamp: Date.now() });
}
function renderHtmlShell(meta) {
  const escapedTitle = escapeHtml(meta.title);
  const escapedDesc = escapeHtml(meta.description);
  const imageTag = meta.image ? `<meta property="og:image" content="${escapeHtml(meta.image)}" />
    <meta name="twitter:image" content="${escapeHtml(meta.image)}" />` : "";
  const jsonLdTag = meta.jsonLd ? `<script type="application/ld+json">${JSON.stringify(meta.jsonLd)}</script>` : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapedTitle}</title>
    <meta name="description" content="${escapedDesc}" />
    <link rel="canonical" href="${escapeHtml(meta.url)}" />
    <meta property="og:title" content="${escapedTitle}" />
    <meta property="og:description" content="${escapedDesc}" />
    <meta property="og:url" content="${escapeHtml(meta.url)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="TopRanker" />
    ${imageTag}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapedTitle}" />
    <meta name="twitter:description" content="${escapedDesc}" />
    ${jsonLdTag}
</head>
<body>
    <noscript>
        <h1>${escapedTitle}</h1>
        <p>${escapedDesc}</p>
    </noscript>
</body>
</html>`;
}
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
async function prerenderDish(slug, city) {
  try {
    const { getDishLeaderboardWithEntries: getDishLeaderboardWithEntries2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const board = await getDishLeaderboardWithEntries2(slug, city);
    if (!board) return null;
    const cityTitle = city.charAt(0).toUpperCase() + city.slice(1);
    const entries = board.entries || [];
    const topNames = entries.slice(0, 3).map((e) => e.businessName).join(", ");
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Best ${board.dishName} in ${cityTitle}`,
      description: `Community-ranked best ${board.dishName.toLowerCase()} in ${cityTitle}.`,
      url: `${SITE_URL}/dish/${slug}`,
      numberOfItems: entries.length,
      itemListElement: entries.slice(0, 10).map((entry, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: entry.businessName,
        url: `${SITE_URL}/business/${entry.businessSlug}`
      }))
    };
    return renderHtmlShell({
      title: `Best ${board.dishName} in ${cityTitle} \u2014 TopRanker`,
      description: `${entries.length} restaurants ranked by credibility-weighted reviews. Top spots: ${topNames || "Be the first to rate"}.`,
      url: `${SITE_URL}/dish/${slug}`,
      jsonLd
    });
  } catch (err) {
    prerenderLog.error(`Dish prerender failed for ${slug}: ${err}`);
    return null;
  }
}
async function prerenderBusiness(slug) {
  try {
    const { getBusinessBySlug: getBusinessBySlug3 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const biz = await getBusinessBySlug3(slug);
    if (!biz) return null;
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Restaurant",
      name: biz.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: biz.city
      },
      aggregateRating: biz.totalRatings > 0 ? {
        "@type": "AggregateRating",
        ratingValue: biz.weightedScore,
        ratingCount: biz.totalRatings,
        bestRating: "5",
        worstRating: "1"
      } : void 0
    };
    return renderHtmlShell({
      title: `${biz.name} \u2014 ${biz.category} in ${biz.city} \u2014 TopRanker`,
      description: `${biz.name} ranked #${biz.currentRank || "unranked"} in ${biz.category} in ${biz.city}. ${biz.totalRatings} credibility-weighted ratings.`,
      url: `${SITE_URL}/business/${slug}`,
      image: biz.photoUrl || void 0,
      jsonLd
    });
  } catch (err) {
    prerenderLog.error(`Business prerender failed for ${slug}: ${err}`);
    return null;
  }
}
function prerenderMiddleware(req, res, next) {
  const userAgent = req.headers["user-agent"] || "";
  if (!isBot(userAgent)) {
    next();
    return;
  }
  const path3 = req.path;
  const dishMatch = path3.match(/^\/dish\/([a-z0-9-]+)$/);
  if (dishMatch) {
    const slug = dishMatch[1];
    const city = req.query.city || "dallas";
    const cacheKey = `dish:${slug}:${city}`;
    const cached = getCached(cacheKey);
    if (cached) {
      prerenderLog.info(`Cache HIT: ${cacheKey}`);
      res.type("text/html").send(cached);
      return;
    }
    prerenderDish(slug, city).then((html) => {
      if (html) {
        setCache(cacheKey, html);
        prerenderLog.info(`Prerendered: ${cacheKey}`);
        res.type("text/html").send(html);
      } else {
        next();
      }
    }).catch(() => next());
    return;
  }
  const bizMatch = path3.match(/^\/business\/([a-z0-9-]+)$/);
  if (bizMatch) {
    const slug = bizMatch[1];
    const cacheKey = `biz:${slug}`;
    const cached = getCached(cacheKey);
    if (cached) {
      prerenderLog.info(`Cache HIT: ${cacheKey}`);
      res.type("text/html").send(cached);
      return;
    }
    prerenderBusiness(slug).then((html) => {
      if (html) {
        setCache(cacheKey, html);
        prerenderLog.info(`Prerendered: ${cacheKey}`);
        res.type("text/html").send(html);
      } else {
        next();
      }
    }).catch(() => next());
    return;
  }
  next();
}
function invalidatePrerenderCache(type, slug) {
  const prefix = `${type}:${slug}`;
  for (const key2 of cache.keys()) {
    if (key2.startsWith(prefix)) {
      cache.delete(key2);
      prerenderLog.info(`Cache invalidated: ${key2}`);
    }
  }
}
function getPrerenderCacheStats() {
  return { size: cache.size, maxSize: CACHE_MAX, ttlMs: CACHE_TTL_MS };
}
var prerenderLog, SITE_URL, BOT_AGENTS, CACHE_MAX, CACHE_TTL_MS, cache;
var init_prerender = __esm({
  "server/prerender.ts"() {
    "use strict";
    init_logger();
    prerenderLog = log.tag("Prerender");
    SITE_URL = process.env.SITE_URL || "https://topranker.com";
    BOT_AGENTS = [
      "googlebot",
      "bingbot",
      "slurp",
      "duckduckbot",
      "baiduspider",
      "yandexbot",
      "facebot",
      "facebookexternalhit",
      "twitterbot",
      "linkedinbot",
      "whatsapp",
      "telegrambot",
      "discordbot",
      "slackbot",
      "applebot",
      "pinterestbot"
    ];
    CACHE_MAX = 200;
    CACHE_TTL_MS = 5 * 60 * 1e3;
    cache = /* @__PURE__ */ new Map();
  }
});

// shared/pricing.ts
var PRICING;
var init_pricing = __esm({
  "shared/pricing.ts"() {
    "use strict";
    PRICING = {
      challenger: {
        amountCents: 9900,
        displayAmount: "$99",
        label: "Challenger Entry",
        description: "30-day head-to-head business competition",
        refundable: false,
        type: "one_time"
      },
      dashboardPro: {
        amountCents: 4900,
        displayAmount: "$49/mo",
        label: "Dashboard Pro",
        description: "Advanced analytics and business insights",
        refundable: true,
        type: "recurring",
        interval: "month"
      },
      featuredPlacement: {
        amountCents: 19900,
        displayAmount: "$199/wk",
        label: "Featured Placement",
        description: "Premium visibility in search and rankings",
        refundable: true,
        type: "recurring",
        interval: "week"
      }
    };
  }
});

// server/payments.ts
var payments_exports = {};
__export(payments_exports, {
  cancelSubscription: () => cancelSubscription,
  createChallengerPayment: () => createChallengerPayment,
  createDashboardProPayment: () => createDashboardProPayment,
  createDashboardProSubscription: () => createDashboardProSubscription,
  createFeaturedPlacementPayment: () => createFeaturedPlacementPayment
});
async function createPaymentIntent(params) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (stripeKey) {
    try {
      const stripe = __require("stripe")(stripeKey);
      const intent = await stripe.paymentIntents.create({
        amount: params.amount,
        currency: params.currency || "usd",
        description: params.description,
        metadata: params.metadata,
        receipt_email: params.customerEmail
      });
      return {
        id: intent.id,
        amount: intent.amount,
        currency: intent.currency,
        status: intent.status === "succeeded" ? "succeeded" : "pending",
        metadata: intent.metadata
      };
    } catch (err) {
      payLog.error("Stripe error:", err.message);
      throw new Error("Payment processing failed");
    }
  }
  payLog.info(`Mock payment: $${(params.amount / 100).toFixed(2)} | ${params.description} | ${params.customerEmail}`);
  return {
    id: `mock_pi_${Date.now()}`,
    amount: params.amount,
    currency: params.currency || "usd",
    status: "succeeded",
    metadata: params.metadata
  };
}
async function createChallengerPayment(params) {
  return createPaymentIntent({
    amount: PRICING.challenger.amountCents,
    description: `TopRanker Challenger Entry: ${params.businessName}`,
    metadata: {
      type: "challenger_entry",
      challengerId: params.challengerId,
      userId: params.userId
    },
    customerEmail: params.customerEmail
  });
}
async function createDashboardProPayment(params) {
  return createPaymentIntent({
    amount: PRICING.dashboardPro.amountCents,
    description: `TopRanker Business Dashboard Pro: ${params.businessName}`,
    metadata: {
      type: "dashboard_pro",
      businessId: params.businessId,
      userId: params.userId
    },
    customerEmail: params.customerEmail
  });
}
async function createDashboardProSubscription(params) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (stripeKey) {
    try {
      const stripe = __require("stripe")(stripeKey);
      let customerId = params.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: params.customerEmail,
          metadata: { userId: params.userId, businessId: params.businessId }
        });
        customerId = customer.id;
      }
      const session2 = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: {
              name: `Dashboard Pro: ${params.businessName}`,
              description: "Advanced analytics and business insights \u2014 monthly subscription"
            },
            unit_amount: PRICING.dashboardPro.amountCents,
            recurring: { interval: "month" }
          },
          quantity: 1
        }],
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        metadata: {
          type: "dashboard_pro",
          businessId: params.businessId,
          userId: params.userId
        },
        subscription_data: {
          metadata: {
            type: "dashboard_pro",
            businessId: params.businessId,
            userId: params.userId
          }
        }
      });
      return {
        id: session2.id,
        url: session2.url,
        status: "pending"
      };
    } catch (err) {
      payLog.error("Stripe subscription error:", err.message);
      throw new Error("Subscription checkout failed");
    }
  }
  payLog.info(`Mock subscription: $49/mo | Dashboard Pro: ${params.businessName}`);
  return {
    id: `mock_cs_${Date.now()}`,
    url: null,
    status: "succeeded"
  };
}
async function cancelSubscription(stripeSubscriptionId) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (stripeKey) {
    try {
      const stripe = __require("stripe")(stripeKey);
      const sub = await stripe.subscriptions.update(stripeSubscriptionId, {
        cancel_at_period_end: true
      });
      return { cancelAtPeriodEnd: sub.cancel_at_period_end };
    } catch (err) {
      payLog.error("Stripe cancel error:", err.message);
      throw new Error("Subscription cancellation failed");
    }
  }
  payLog.info(`Mock cancel subscription: ${stripeSubscriptionId}`);
  return { cancelAtPeriodEnd: true };
}
async function createFeaturedPlacementPayment(params) {
  return createPaymentIntent({
    amount: PRICING.featuredPlacement.amountCents,
    description: `TopRanker Featured Placement: ${params.businessName} in ${params.city}`,
    metadata: {
      type: "featured_placement",
      businessId: params.businessId,
      city: params.city,
      userId: params.userId
    },
    customerEmail: params.customerEmail
  });
}
var payLog;
var init_payments2 = __esm({
  "server/payments.ts"() {
    "use strict";
    init_logger();
    init_pricing();
    payLog = log.tag("Payments");
  }
});

// server/file-storage.ts
var file_storage_exports = {};
__export(file_storage_exports, {
  createFileStorage: () => createFileStorage,
  fileStorage: () => fileStorage
});
import { promises as fs } from "node:fs";
import path from "node:path";
function createFileStorage() {
  if (process.env.R2_BUCKET_NAME) {
    return new R2FileStorage();
  }
  return new LocalFileStorage();
}
var UPLOADS_DIR, LocalFileStorage, R2FileStorage, fileStorage;
var init_file_storage = __esm({
  "server/file-storage.ts"() {
    "use strict";
    init_logger();
    UPLOADS_DIR = path.resolve(process.cwd(), "public", "uploads");
    LocalFileStorage = class {
      ready;
      constructor() {
        this.ready = fs.mkdir(UPLOADS_DIR, { recursive: true }).then(() => {
          log.info(`[FileStorage] Local storage ready at ${UPLOADS_DIR}`);
        });
      }
      async upload(key2, data, _contentType) {
        await this.ready;
        const filePath = path.join(UPLOADS_DIR, key2);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, data);
        return this.getUrl(key2);
      }
      async delete(key2) {
        await this.ready;
        const filePath = path.join(UPLOADS_DIR, key2);
        try {
          await fs.unlink(filePath);
        } catch (err) {
          if (err.code !== "ENOENT") throw err;
        }
      }
      getUrl(key2) {
        return `/uploads/${key2}`;
      }
    };
    R2FileStorage = class {
      client;
      // S3Client — lazily typed to avoid hard dep at import time
      bucket;
      publicUrl;
      constructor() {
        const {
          R2_ACCOUNT_ID,
          R2_ACCESS_KEY_ID,
          R2_SECRET_ACCESS_KEY,
          R2_BUCKET_NAME,
          R2_PUBLIC_URL
        } = process.env;
        if (!R2_BUCKET_NAME || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_ACCOUNT_ID) {
          throw new Error(
            "[FileStorage] R2 storage requires R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME env vars"
          );
        }
        this.bucket = R2_BUCKET_NAME;
        this.publicUrl = R2_PUBLIC_URL || `https://${R2_BUCKET_NAME}.r2.dev`;
        const { S3Client } = __require("@aws-sdk/client-s3");
        this.client = new S3Client({
          region: "auto",
          endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
          credentials: {
            accessKeyId: R2_ACCESS_KEY_ID,
            secretAccessKey: R2_SECRET_ACCESS_KEY
          }
        });
        log.info(`[FileStorage] R2 storage ready \u2014 bucket: ${this.bucket}`);
      }
      async upload(key2, data, contentType) {
        const { PutObjectCommand } = __require("@aws-sdk/client-s3");
        await this.client.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: key2,
            Body: data,
            ContentType: contentType
          })
        );
        return this.getUrl(key2);
      }
      async delete(key2) {
        const { DeleteObjectCommand } = __require("@aws-sdk/client-s3");
        await this.client.send(
          new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key2
          })
        );
      }
      getUrl(key2) {
        return `${this.publicUrl}/${key2}`;
      }
    };
    fileStorage = createFileStorage();
  }
});

// server/photo-moderation.ts
var photo_moderation_exports = {};
__export(photo_moderation_exports, {
  approvePhoto: () => approvePhoto,
  getAllowedMimeTypes: () => getAllowedMimeTypes,
  getMaxFileSize: () => getMaxFileSize,
  getPendingPhotos: () => getPendingPhotos,
  getPhotoStats: () => getPhotoStats,
  getPhotosByBusiness: () => getPhotosByBusiness,
  rejectPhoto: () => rejectPhoto,
  submitPhoto: () => submitPhoto
});
import { eq as eq21, desc as desc16, and as and14 } from "drizzle-orm";
import crypto6 from "crypto";
async function submitPhoto(businessId, memberId, url, caption, fileSize, mimeType) {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) return { error: `Invalid mime type: ${mimeType}` };
  if (fileSize > MAX_FILE_SIZE) return { error: "File too large (max 10MB)" };
  if (caption.length > MAX_CAPTION_LENGTH) return { error: "Caption too long (max 500 chars)" };
  const id = crypto6.randomUUID();
  const [row] = await db.insert(photoSubmissions).values({
    id,
    businessId,
    memberId,
    url,
    caption,
    fileSize,
    mimeType
  }).returning();
  photoModLog.info(`Photo submitted: ${row.id} for business ${businessId}`);
  return row;
}
async function approvePhoto(photoId, moderatorId, note) {
  const result = await db.update(photoSubmissions).set({
    status: "approved",
    moderatorId,
    moderatorNote: note || null,
    reviewedAt: /* @__PURE__ */ new Date()
  }).where(and14(eq21(photoSubmissions.id, photoId), eq21(photoSubmissions.status, "pending"))).returning({ id: photoSubmissions.id });
  if (result.length === 0) return false;
  photoModLog.info(`Photo approved: ${photoId} by ${moderatorId}`);
  return true;
}
async function rejectPhoto(photoId, moderatorId, reason, note) {
  const result = await db.update(photoSubmissions).set({
    status: "rejected",
    rejectionReason: reason,
    moderatorId,
    moderatorNote: note || null,
    reviewedAt: /* @__PURE__ */ new Date()
  }).where(and14(eq21(photoSubmissions.id, photoId), eq21(photoSubmissions.status, "pending"))).returning({ id: photoSubmissions.id });
  if (result.length === 0) return false;
  photoModLog.info(`Photo rejected: ${photoId} by ${moderatorId} (reason: ${reason})`);
  return true;
}
async function getPendingPhotos(limit) {
  const rows = await db.select().from(photoSubmissions).where(eq21(photoSubmissions.status, "pending")).orderBy(desc16(photoSubmissions.submittedAt)).limit(limit || 50);
  return rows;
}
async function getPhotosByBusiness(businessId) {
  const rows = await db.select().from(photoSubmissions).where(and14(eq21(photoSubmissions.businessId, businessId), eq21(photoSubmissions.status, "approved"))).orderBy(desc16(photoSubmissions.submittedAt));
  return rows;
}
async function getPhotoStats() {
  const allRows = await db.select().from(photoSubmissions);
  const byReason = {};
  for (const s of allRows) {
    if (s.rejectionReason) byReason[s.rejectionReason] = (byReason[s.rejectionReason] || 0) + 1;
  }
  return {
    total: allRows.length,
    pending: allRows.filter((s) => s.status === "pending").length,
    approved: allRows.filter((s) => s.status === "approved").length,
    rejected: allRows.filter((s) => s.status === "rejected").length,
    byReason
  };
}
function getAllowedMimeTypes() {
  return [...ALLOWED_MIME_TYPES];
}
function getMaxFileSize() {
  return MAX_FILE_SIZE;
}
var photoModLog, ALLOWED_MIME_TYPES, MAX_FILE_SIZE, MAX_CAPTION_LENGTH;
var init_photo_moderation = __esm({
  "server/photo-moderation.ts"() {
    "use strict";
    init_logger();
    init_db();
    init_schema();
    photoModLog = log.tag("PhotoModeration");
    ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
    MAX_FILE_SIZE = 10 * 1024 * 1024;
    MAX_CAPTION_LENGTH = 500;
  }
});

// server/seed.ts
var seed_exports = {};
__export(seed_exports, {
  seedDatabase: () => seedDatabase
});
import { sql as sql16, eq as eq27, and as and17 } from "drizzle-orm";
import bcrypt2 from "bcrypt";
function getHoursForCategory(category) {
  switch (category) {
    case "cafe":
      return HOURS_CAFE;
    case "bar":
      return HOURS_BAR;
    case "bakery":
      return HOURS_BAKERY;
    case "fast_food":
      return HOURS_FAST_FOOD;
    case "street_food":
      return HOURS_STREET_FOOD;
    default:
      return HOURS_RESTAURANT;
  }
}
async function seedDatabase() {
  console.log("Seeding database...");
  const existingBusinesses = await db.select({ id: businesses.id }).from(businesses).limit(1);
  if (existingBusinesses.length > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }
  const insertedBusinesses = [];
  for (const biz of SEED_BUSINESSES) {
    const dineInCount = Math.max(3, Math.floor(biz.totalRatings * 0.6));
    const credWeightedSum = (parseFloat(biz.weightedScore) * biz.totalRatings * 0.7).toFixed(4);
    const eligible = biz.totalRatings >= 10 && dineInCount >= 1;
    const [inserted] = await db.insert(businesses).values({
      name: biz.name,
      slug: biz.slug,
      category: biz.category,
      cuisine: biz.cuisine || null,
      city: "Dallas",
      neighborhood: biz.neighborhood,
      address: biz.address,
      phone: biz.phone,
      website: biz.website || null,
      lat: biz.lat,
      lng: biz.lng,
      weightedScore: biz.weightedScore,
      rawAvgScore: biz.rawAvgScore,
      rankPosition: biz.rankPosition,
      rankDelta: biz.rankDelta,
      totalRatings: biz.totalRatings,
      description: biz.description,
      priceRange: biz.priceRange,
      isOpenNow: biz.isOpenNow,
      photoUrl: biz.photoUrl || null,
      openingHours: getHoursForCategory(biz.category),
      hoursLastUpdated: /* @__PURE__ */ new Date(),
      dineInCount,
      credibilityWeightedSum: credWeightedSum,
      leaderboardEligible: eligible,
      isActive: true,
      dataSource: "admin"
    }).returning();
    insertedBusinesses.push(inserted);
  }
  console.log(`Seeded ${insertedBusinesses.length} businesses`);
  const photoSets = {};
  let photoCount = 0;
  for (const biz of insertedBusinesses) {
    const photos = photoSets[biz.slug] || (biz.photoUrl ? [biz.photoUrl] : []);
    for (let i = 0; i < photos.length; i++) {
      await db.insert(businessPhotos).values({
        businessId: biz.id,
        photoUrl: photos[i],
        isHero: i === 0,
        sortOrder: i
      });
      photoCount++;
    }
  }
  console.log(`Seeded ${photoCount} business photos`);
  for (const dishGroup of SEED_DISHES) {
    const biz = insertedBusinesses.find((b) => b.slug === dishGroup.businessSlug);
    if (!biz) continue;
    for (const dish of dishGroup.dishes) {
      await db.insert(dishes).values({
        businessId: biz.id,
        name: dish.name,
        nameNormalized: dish.name.toLowerCase().trim(),
        suggestedBy: "community",
        voteCount: dish.voteCount
      });
    }
  }
  console.log("Seeded dishes");
  const SEED_DISH_BOARDS = [
    { dishName: "Biryani", dishSlug: "biryani", dishEmoji: "\u{1F35B}", displayOrder: 1 },
    { dishName: "Ramen", dishSlug: "ramen", dishEmoji: "\u{1F35C}", displayOrder: 2 },
    { dishName: "Taco", dishSlug: "taco", dishEmoji: "\u{1F32E}", displayOrder: 3 },
    { dishName: "Burger", dishSlug: "burger", dishEmoji: "\u{1F354}", displayOrder: 4 },
    { dishName: "Coffee", dishSlug: "coffee", dishEmoji: "\u2615", displayOrder: 5 },
    // Sprint 303: Expanded dish leaderboards
    { dishName: "Pizza", dishSlug: "pizza", dishEmoji: "\u{1F355}", displayOrder: 6 },
    { dishName: "Pho", dishSlug: "pho", dishEmoji: "\u{1F372}", displayOrder: 7 },
    { dishName: "Dosa", dishSlug: "dosa", dishEmoji: "\u{1FAD3}", displayOrder: 8 },
    { dishName: "Kebab", dishSlug: "kebab", dishEmoji: "\u{1F959}", displayOrder: 9 },
    { dishName: "Brisket", dishSlug: "brisket", dishEmoji: "\u{1F969}", displayOrder: 10 },
    // Sprint 315: Expanded dish leaderboards
    { dishName: "Butter Chicken", dishSlug: "butter-chicken", dishEmoji: "\u{1F357}", displayOrder: 11 },
    { dishName: "Samosa", dishSlug: "samosa", dishEmoji: "\u{1F95F}", displayOrder: 12 },
    { dishName: "Burrito", dishSlug: "burrito", dishEmoji: "\u{1F32F}", displayOrder: 13 },
    { dishName: "Enchilada", dishSlug: "enchilada", dishEmoji: "\u{1FAD4}", displayOrder: 14 },
    { dishName: "Sushi", dishSlug: "sushi", dishEmoji: "\u{1F363}", displayOrder: 15 },
    { dishName: "Pasta", dishSlug: "pasta", dishEmoji: "\u{1F35D}", displayOrder: 16 },
    { dishName: "Banh Mi", dishSlug: "banh-mi", dishEmoji: "\u{1F956}", displayOrder: 17 },
    { dishName: "Wings", dishSlug: "wings", dishEmoji: "\u{1F357}", displayOrder: 18 },
    { dishName: "Falafel", dishSlug: "falafel", dishEmoji: "\u{1F9C6}", displayOrder: 19 },
    // Sprint 316: Korean + Thai leaderboards
    { dishName: "Korean BBQ", dishSlug: "korean-bbq", dishEmoji: "\u{1F969}", displayOrder: 20 },
    { dishName: "Bibimbap", dishSlug: "bibimbap", dishEmoji: "\u{1F35A}", displayOrder: 21 },
    { dishName: "Fried Chicken", dishSlug: "fried-chicken", dishEmoji: "\u{1F357}", displayOrder: 22 },
    { dishName: "Pad Thai", dishSlug: "pad-thai", dishEmoji: "\u{1F35C}", displayOrder: 23 },
    { dishName: "Green Curry", dishSlug: "green-curry", dishEmoji: "\u{1F35B}", displayOrder: 24 },
    // Sprint 320: Chinese leaderboards
    { dishName: "Dim Sum", dishSlug: "dim-sum", dishEmoji: "\u{1F95F}", displayOrder: 25 },
    { dishName: "Peking Duck", dishSlug: "peking-duck", dishEmoji: "\u{1F986}", displayOrder: 26 },
    { dishName: "Hot Pot", dishSlug: "hot-pot", dishEmoji: "\u{1FAD5}", displayOrder: 27 }
  ];
  for (const board of SEED_DISH_BOARDS) {
    const [lb] = await db.insert(dishLeaderboards).values({
      city: "dallas",
      dishName: board.dishName,
      dishSlug: board.dishSlug,
      dishEmoji: board.dishEmoji,
      status: "active",
      displayOrder: board.displayOrder,
      source: "system"
    }).returning();
    const slugPattern = "%" + board.dishSlug + "%";
    const spacePattern = "%" + board.dishSlug.replace(/-/g, " ") + "%";
    const matchingDishes = await db.select({ businessId: dishes.businessId }).from(dishes).innerJoin(businesses, eq27(dishes.businessId, businesses.id)).where(and17(
      eq27(businesses.city, "Dallas"),
      sql16`(${dishes.nameNormalized} ILIKE ${slugPattern} OR ${dishes.nameNormalized} ILIKE ${spacePattern})`
    ));
    const uniqueBizIds = [...new Set(matchingDishes.map((d) => d.businessId))];
    for (let i = 0; i < uniqueBizIds.length; i++) {
      const biz = insertedBusinesses.find((b) => b.id === uniqueBizIds[i]);
      if (!biz) continue;
      await db.insert(dishLeaderboardEntries).values({
        leaderboardId: lb.id,
        businessId: biz.id,
        dishScore: (4.5 - i * 0.3).toFixed(2),
        dishRatingCount: Math.max(3, 15 - i * 3),
        rankPosition: i + 1,
        photoUrl: biz.photoUrl
      });
    }
    const MIN_ENTRIES = 5;
    if (uniqueBizIds.length < MIN_ENTRIES) {
      const remaining = MIN_ENTRIES - uniqueBizIds.length;
      const usedIds = new Set(uniqueBizIds);
      const candidates = insertedBusinesses.filter((b) => !usedIds.has(b.id) && b.city === "Dallas");
      const offset = board.displayOrder * 3 % candidates.length;
      for (let j = 0; j < remaining && j < candidates.length; j++) {
        const biz = candidates[(offset + j) % candidates.length];
        const rank = uniqueBizIds.length + j + 1;
        await db.insert(dishLeaderboardEntries).values({
          leaderboardId: lb.id,
          businessId: biz.id,
          dishScore: (4 - j * 0.25).toFixed(2),
          dishRatingCount: Math.max(2, 8 - j * 2),
          rankPosition: rank,
          photoUrl: biz.photoUrl
        });
      }
    }
  }
  console.log("Seeded dish leaderboards (27 boards for Dallas, min 5 entries each)");
  const spiceGarden = insertedBusinesses.find((b) => b.slug === "spice-garden-dallas");
  const yardKitchen = insertedBusinesses.find((b) => b.slug === "the-yard-kitchen-dallas");
  const luckyCat = insertedBusinesses.find((b) => b.slug === "lucky-cat-ramen-dallas");
  const cultivar = insertedBusinesses.find((b) => b.slug === "cultivar-coffee-dallas");
  if (spiceGarden && yardKitchen) {
    const endDate = /* @__PURE__ */ new Date();
    endDate.setDate(endDate.getDate() + 18);
    await db.insert(challengers).values({
      challengerId: yardKitchen.id,
      defenderId: spiceGarden.id,
      category: "restaurant",
      city: "Dallas",
      entryFeePaid: true,
      startDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1e3),
      endDate,
      challengerWeightedVotes: "1847.500",
      defenderWeightedVotes: "2234.800",
      totalVotes: 142,
      status: "active"
    });
    await db.update(businesses).set({ inChallenger: true }).where(sql16`${businesses.id} IN (${spiceGarden.id}, ${yardKitchen.id})`);
    console.log("Seeded challenger: Spice Garden vs The Yard Kitchen");
  }
  if (cultivar && luckyCat) {
    const endDate2 = /* @__PURE__ */ new Date();
    endDate2.setDate(endDate2.getDate() + 25);
    await db.insert(challengers).values({
      challengerId: luckyCat.id,
      defenderId: cultivar.id,
      category: "cafe",
      city: "Dallas",
      entryFeePaid: true,
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1e3),
      endDate: endDate2,
      challengerWeightedVotes: "892.300",
      defenderWeightedVotes: "1156.700",
      totalVotes: 78,
      status: "active"
    });
    console.log("Seeded challenger: Cultivar Coffee vs Lucky Cat Ramen");
  }
  const demoPassword = await bcrypt2.hash("demo123", 10);
  await db.insert(members).values({
    displayName: "Alex Chen",
    username: "alexchen",
    email: "alex@demo.com",
    password: demoPassword,
    city: "Dallas",
    credibilityScore: 142,
    credibilityTier: "city",
    totalRatings: 12,
    totalCategories: 3,
    distinctBusinesses: 8,
    ratingVariance: "1.200",
    isFoundingMember: false,
    joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3)
  });
  console.log("Seeded demo member: alex@demo.com / demo123");
  console.log("Database seeding complete!");
}
var SEED_BUSINESSES, SEED_DISHES, HOURS_RESTAURANT, HOURS_CAFE, HOURS_BAR, HOURS_BAKERY, HOURS_FAST_FOOD, HOURS_STREET_FOOD;
var init_seed = __esm({
  "server/seed.ts"() {
    "use strict";
    init_db();
    init_schema();
    SEED_BUSINESSES = [
      // ── Indian Restaurants ────────────────────────────────────
      { name: "Spice Garden", slug: "spice-garden-dallas", neighborhood: "Uptown", category: "restaurant", cuisine: "indian", weightedScore: "4.720", rawAvgScore: "4.60", rankPosition: 1, rankDelta: 0, totalRatings: 312, description: "Thirty years of perfecting North Indian cuisine. Legendary biryani and butter chicken.", priceRange: "$$$", phone: "(214) 555-0192", address: "3821 Cedar Springs Rd, Uptown, Dallas", lat: "32.8087452", lng: "-96.8024537", isOpenNow: true, website: "https://spicegardendallas.com", photoUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop" },
      { name: "Tandoori Flames", slug: "tandoori-flames-irving", neighborhood: "Irving", category: "restaurant", cuisine: "indian", weightedScore: "4.650", rawAvgScore: "4.52", rankPosition: 2, rankDelta: 1, totalRatings: 278, description: "Authentic Hyderabadi biryani and tandoori specialties. The dum biryani is legendary.", priceRange: "$$", phone: "(972) 555-0301", address: "7600 N MacArthur Blvd, Irving, Dallas", lat: "32.8912345", lng: "-96.9512345", isOpenNow: true, website: "https://tandooriflames.com", photoUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop" },
      { name: "Bawarchi Biryanis", slug: "bawarchi-biryanis-plano", neighborhood: "Plano", category: "restaurant", cuisine: "indian", weightedScore: "4.580", rawAvgScore: "4.45", rankPosition: 3, rankDelta: 0, totalRatings: 245, description: "South Indian biryani house known for Hyderabadi goat biryani and dosas.", priceRange: "$$", phone: "(469) 555-0401", address: "3320 Coit Rd, Plano, Dallas", lat: "33.0212345", lng: "-96.7712345", isOpenNow: true, website: "https://bawarchibiryanis.com", photoUrl: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&h=400&fit=crop" },
      { name: "Chennai Cafe", slug: "chennai-cafe-frisco", neighborhood: "Frisco", category: "restaurant", cuisine: "indian", weightedScore: "4.420", rawAvgScore: "4.30", rankPosition: 4, rankDelta: -1, totalRatings: 189, description: "Pure vegetarian South Indian. The masala dosa and filter coffee are perfection.", priceRange: "$", phone: "(469) 555-0501", address: "8200 Preston Rd, Frisco, Dallas", lat: "33.1012345", lng: "-96.8012345", isOpenNow: false, website: "https://chennaicafe.com", photoUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&h=400&fit=crop" },
      { name: "Desi District", slug: "desi-district-richardson", neighborhood: "Richardson", category: "restaurant", cuisine: "indian", weightedScore: "4.350", rawAvgScore: "4.20", rankPosition: 5, rankDelta: 2, totalRatings: 167, description: "Street food-style Indian \u2014 chaat, pav bhaji, vada pav. Richardson's desi favorite.", priceRange: "$", phone: "(972) 555-0601", address: "101 S Greenville Ave, Richardson, Dallas", lat: "32.9512345", lng: "-96.7234567", isOpenNow: true, website: "https://desidistrict.com", photoUrl: "https://images.unsplash.com/photo-1606491956689-2ea866880049?w=600&h=400&fit=crop" },
      // ── Mexican Restaurants ───────────────────────────────────
      { name: "Abuela's Kitchen", slug: "abuelas-kitchen-dallas", neighborhood: "Oak Cliff", category: "restaurant", cuisine: "mexican", weightedScore: "4.480", rawAvgScore: "4.35", rankPosition: 1, rankDelta: 0, totalRatings: 234, description: "Three generations of Mexican recipes from Oaxaca. Mole negro is transcendent.", priceRange: "$", phone: "(214) 555-0567", address: "1234 Jefferson Blvd, Oak Cliff, Dallas", lat: "32.7453102", lng: "-96.8312487", isOpenNow: true, website: "https://abuelaskitchendallas.com", photoUrl: "https://images.unsplash.com/photo-1653005753991-22a8bf831f89?w=600&h=400&fit=crop" },
      { name: "El Rincon del Sabor", slug: "el-rincon-del-sabor-dallas", neighborhood: "Pleasant Grove", category: "restaurant", cuisine: "mexican", weightedScore: "4.380", rawAvgScore: "4.25", rankPosition: 2, rankDelta: 1, totalRatings: 198, description: "Birria tacos, pozole, and menudo. Weekend specials draw lines down the block.", priceRange: "$", phone: "(214) 555-3201", address: "1902 Buckner Blvd, Pleasant Grove, Dallas", lat: "32.7312345", lng: "-96.7112345", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop" },
      { name: "Casa Oaxaca", slug: "casa-oaxaca-dallas", neighborhood: "Bishop Arts", category: "restaurant", cuisine: "mexican", weightedScore: "4.250", rawAvgScore: "4.12", rankPosition: 3, rankDelta: -1, totalRatings: 167, description: "Authentic Oaxacan cuisine \u2014 tlayudas, mezcal flights, chapulines.", priceRange: "$$", phone: "(214) 555-3301", address: "335 W Davis St, Bishop Arts, Dallas", lat: "32.7489012", lng: "-96.8312345", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&h=400&fit=crop" },
      { name: "Taqueria La Ventana", slug: "taqueria-la-ventana-dallas", neighborhood: "Oak Cliff", category: "restaurant", cuisine: "mexican", weightedScore: "4.120", rawAvgScore: "4.00", rankPosition: 4, rankDelta: 0, totalRatings: 312, description: "Al pastor from the trompo, fresh tortillas, legendary salsa verde.", priceRange: "$", phone: "(214) 555-3401", address: "2456 W Illinois Ave, Oak Cliff, Dallas", lat: "32.7312345", lng: "-96.8456789", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=600&h=400&fit=crop" },
      // ── Japanese Restaurants ──────────────────────────────────
      { name: "Lucky Cat Ramen", slug: "lucky-cat-ramen-dallas", neighborhood: "Deep Ellum", category: "restaurant", cuisine: "japanese", weightedScore: "4.510", rawAvgScore: "4.38", rankPosition: 1, rankDelta: 0, totalRatings: 198, description: "Authentic Japanese ramen with house-made noodles. Tonkotsu is the star.", priceRange: "$$", phone: "(214) 555-0345", address: "2815 Main St, Deep Ellum, Dallas", lat: "32.7833148", lng: "-96.7836459", isOpenNow: false, website: "https://luckycatramen.com", photoUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop" },
      { name: "Uchi Dallas", slug: "uchi-dallas", neighborhood: "Oak Lawn", category: "restaurant", cuisine: "japanese", weightedScore: "4.380", rawAvgScore: "4.25", rankPosition: 2, rankDelta: 1, totalRatings: 278, description: "Japanese farmhouse dining with innovative sushi and hot tastings.", priceRange: "$$$$", phone: "(214) 855-5454", address: "2817 Maple Ave, Oak Lawn, Dallas", lat: "32.8023000", lng: "-96.8100000", isOpenNow: true, website: "https://uchidallas.com", photoUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&h=400&fit=crop" },
      { name: "Tei-An", slug: "tei-an-dallas", neighborhood: "Arts District", category: "restaurant", cuisine: "japanese", weightedScore: "4.250", rawAvgScore: "4.12", rankPosition: 3, rankDelta: -1, totalRatings: 189, description: "Hand-cut soba noodles and Japanese small plates in the Arts District.", priceRange: "$$$", phone: "(214) 220-2828", address: "1722 Routh St, Arts District, Dallas", lat: "32.7890000", lng: "-96.7990000", isOpenNow: false, photoUrl: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&h=400&fit=crop" },
      // ── Korean Restaurants ────────────────────────────────────
      { name: "Seoul Brothers", slug: "seoul-brothers-dallas", neighborhood: "Carrollton", category: "restaurant", cuisine: "korean", weightedScore: "4.350", rawAvgScore: "4.20", rankPosition: 1, rankDelta: 0, totalRatings: 143, description: "Korean fusion with bold flavors. The bibimbap and Korean fried chicken are must-try.", priceRange: "$$", phone: "(214) 555-0678", address: "2570 Old Denton Rd, Carrollton, Dallas", lat: "32.9537482", lng: "-96.8903456", isOpenNow: false, website: "https://seoulbrothersdallas.com", photoUrl: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600&h=400&fit=crop" },
      { name: "Koryo Kalbi", slug: "koryo-kalbi-dallas", neighborhood: "Royal Lane", category: "restaurant", cuisine: "korean", weightedScore: "4.220", rawAvgScore: "4.10", rankPosition: 2, rankDelta: 1, totalRatings: 134, description: "Traditional Korean BBQ with tabletop grills. The galbi and japchae are standouts.", priceRange: "$$", phone: "(214) 555-3501", address: "2638 Royal Lane, Dallas", lat: "32.8812345", lng: "-96.7812345", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&h=400&fit=crop" },
      // ── Thai Restaurants ──────────────────────────────────────
      { name: "Khao Noodle Shop", slug: "khao-noodle-dallas", neighborhood: "Lowest Greenville", category: "restaurant", cuisine: "thai", weightedScore: "4.400", rawAvgScore: "4.28", rankPosition: 1, rankDelta: 0, totalRatings: 154, description: "Northern Thai street food with zero compromise. James Beard-recognized.", priceRange: "$$", phone: "(214) 555-0887", address: "4812 Bryan St, Lowest Greenville, Dallas", lat: "32.7908432", lng: "-96.7712345", isOpenNow: true, website: "https://khaonoodleshop.com", photoUrl: "https://images.unsplash.com/photo-1552611052-33e04de1b100?w=600&h=400&fit=crop" },
      { name: "Asian Mint", slug: "asian-mint-dallas", neighborhood: "Knox-Henderson", category: "restaurant", cuisine: "thai", weightedScore: "4.180", rawAvgScore: "4.05", rankPosition: 2, rankDelta: 0, totalRatings: 198, description: "Modern Thai with creative cocktails. The pad thai and green curry are signatures.", priceRange: "$$", phone: "(214) 555-3601", address: "4901 Bryan St, Knox-Henderson, Dallas", lat: "32.7912345", lng: "-96.7712345", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=600&h=400&fit=crop" },
      // ── Italian Restaurants ───────────────────────────────────
      { name: "Lucia", slug: "lucia-dallas", neighborhood: "Bishop Arts", category: "restaurant", cuisine: "italian", weightedScore: "4.450", rawAvgScore: "4.32", rankPosition: 1, rankDelta: 0, totalRatings: 167, description: "Chef David Uygur's intimate Italian-inspired dining room. Handmade pasta.", priceRange: "$$$$", phone: "(214) 555-0666", address: "408 W 8th St, Bishop Arts, Dallas", lat: "32.7494123", lng: "-96.8276789", isOpenNow: false, website: "https://luciadallas.com", photoUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop" },
      { name: "Cane Rosso", slug: "cane-rosso-dallas", neighborhood: "Deep Ellum", category: "restaurant", cuisine: "italian", weightedScore: "4.280", rawAvgScore: "4.15", rankPosition: 2, rankDelta: 1, totalRatings: 234, description: "Neapolitan-style pizza with locally sourced ingredients. The honey bastard is iconic.", priceRange: "$$", phone: "(214) 741-1188", address: "2612 Commerce St, Deep Ellum, Dallas", lat: "32.7823000", lng: "-96.7858000", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&h=400&fit=crop" },
      // ── American Restaurants ──────────────────────────────────
      { name: "The Yard Kitchen", slug: "the-yard-kitchen-dallas", neighborhood: "Bishop Arts", category: "restaurant", cuisine: "american", weightedScore: "4.580", rawAvgScore: "4.45", rankPosition: 1, rankDelta: 0, totalRatings: 287, description: "Farm-to-table restaurant in Bishop Arts District. Hyper-seasonal menus.", priceRange: "$$", phone: "(214) 555-0234", address: "402 N Bishop Ave, Bishop Arts, Dallas", lat: "32.7505612", lng: "-96.8267483", isOpenNow: true, website: "https://theyardkitchen.com", photoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop" },
      { name: "Smoke & Vine", slug: "smoke-and-vine-dallas", neighborhood: "Oak Lawn", category: "restaurant", cuisine: "american", weightedScore: "4.350", rawAvgScore: "4.20", rankPosition: 2, rankDelta: 2, totalRatings: 156, description: "Texas BBQ meets fine wine in this Oak Lawn gem.", priceRange: "$$$", phone: "(214) 555-0456", address: "4011 Lemmon Ave, Oak Lawn, Dallas", lat: "32.8118523", lng: "-96.8200134", isOpenNow: true, website: "https://smokeandvinedallas.com", photoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop" },
      { name: "Pecan Lodge", slug: "pecan-lodge-dallas", neighborhood: "Deep Ellum", category: "restaurant", cuisine: "american", weightedScore: "4.250", rawAvgScore: "4.12", rankPosition: 3, rankDelta: 0, totalRatings: 523, description: "The most decorated BBQ joint in Dallas history. Brisket perfection.", priceRange: "$$", phone: "(214) 555-0948", address: "2702 Main St, Deep Ellum, Dallas", lat: "32.7844523", lng: "-96.7842178", isOpenNow: true, website: "https://pecanlodge.com", photoUrl: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&h=400&fit=crop" },
      { name: "Fearing's", slug: "fearings-dallas", neighborhood: "Uptown", category: "restaurant", cuisine: "american", weightedScore: "4.100", rawAvgScore: "3.98", rankPosition: 4, rankDelta: -1, totalRatings: 178, description: "Dean Fearing's flagship inside the Ritz-Carlton. Bold Texas flavors.", priceRange: "$$$$", phone: "(214) 555-0220", address: "2121 McKinney Ave, Uptown, Dallas", lat: "32.7978432", lng: "-96.8012345", isOpenNow: true, website: "https://fearingsrestaurant.com", photoUrl: "https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=600&h=400&fit=crop" },
      // ── Vietnamese Restaurant ─────────────────────────────────
      { name: "Pho Empire", slug: "pho-empire-dallas", neighborhood: "Garland", category: "restaurant", cuisine: "vietnamese", weightedScore: "4.320", rawAvgScore: "4.18", rankPosition: 1, rankDelta: 0, totalRatings: 189, description: "Pho simmered for 24 hours. The rare beef pho and bun bo Hue are unmatched.", priceRange: "$", phone: "(972) 555-3701", address: "2345 W Walnut St, Garland, Dallas", lat: "32.9012345", lng: "-96.6512345", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&h=400&fit=crop" },
      { name: "Saigon Bites", slug: "saigon-bites-dallas", neighborhood: "East Dallas", category: "restaurant", cuisine: "vietnamese", weightedScore: "4.150", rawAvgScore: "4.02", rankPosition: 2, rankDelta: 1, totalRatings: 145, description: "Banh mi, spring rolls, and broken rice plates. Fast and flavorful.", priceRange: "$", phone: "(214) 555-3801", address: "4523 Bryan St, East Dallas, Dallas", lat: "32.7912345", lng: "-96.7612345", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1576577445504-6af96477db52?w=600&h=400&fit=crop" },
      // ── Mediterranean Restaurant ──────────────────────────────
      { name: "Kabob King", slug: "kabob-king-dallas", neighborhood: "Richardson", category: "restaurant", cuisine: "mediterranean", weightedScore: "4.280", rawAvgScore: "4.15", rankPosition: 1, rankDelta: 0, totalRatings: 145, description: "Pakistani-style seekh kabobs grilled fresh. The lamb chops are superb.", priceRange: "$", phone: "(214) 555-1567", address: "750 W Arapaho Rd, Richardson, Dallas", lat: "32.9512345", lng: "-96.7534567", isOpenNow: true, website: "https://kabobkingdallas.com", photoUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop" },
      // ── Chinese Restaurant ────────────────────────────────────
      { name: "Royal China", slug: "royal-china-dallas", neighborhood: "Richardson", category: "restaurant", cuisine: "chinese", weightedScore: "4.300", rawAvgScore: "4.18", rankPosition: 1, rankDelta: 0, totalRatings: 198, description: "Dim sum palace. Weekend carts, Peking duck, and hand-pulled noodles.", priceRange: "$$", phone: "(972) 555-3901", address: "3924 N Central Expy, Richardson, Dallas", lat: "32.9412345", lng: "-96.7412345", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&h=400&fit=crop" },
      { name: "Sichuan House", slug: "sichuan-house-dallas", neighborhood: "Plano", category: "restaurant", cuisine: "chinese", weightedScore: "4.180", rawAvgScore: "4.05", rankPosition: 2, rankDelta: 1, totalRatings: 156, description: "Fiery Sichuan specialties \u2014 mapo tofu, dan dan noodles, dry pot.", priceRange: "$$", phone: "(469) 555-4001", address: "2500 N Central Expy, Plano, Dallas", lat: "33.0112345", lng: "-96.7212345", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&h=400&fit=crop" },
      // ── Sprint 298: Additional restaurants to meet 3-per-cuisine minimum ──
      { name: "Golden Dragon Palace", slug: "golden-dragon-palace-dallas", neighborhood: "Carrollton", category: "restaurant", cuisine: "chinese", weightedScore: "4.050", rawAvgScore: "3.92", rankPosition: 3, rankDelta: 0, totalRatings: 112, description: "Cantonese classics and weekend dim sum carts.", priceRange: "$$", phone: "(972) 555-4101", address: "1820 E Belt Line Rd, Carrollton, Dallas", lat: "32.9612345", lng: "-96.8812345", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&h=400&fit=crop" },
      { name: "Nonna's Trattoria", slug: "nonnas-trattoria-dallas", neighborhood: "Greenville", category: "restaurant", cuisine: "italian", weightedScore: "4.080", rawAvgScore: "3.95", rankPosition: 3, rankDelta: 1, totalRatings: 134, description: "Handmade pasta and wood-fired pizza in a cozy trattoria.", priceRange: "$$", phone: "(214) 555-4201", address: "2912 Greenville Ave, Greenville, Dallas", lat: "32.8156789", lng: "-96.7734567", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop" },
      { name: "Seoul BBQ House", slug: "seoul-bbq-house-dallas", neighborhood: "Carrollton", category: "restaurant", cuisine: "korean", weightedScore: "4.100", rawAvgScore: "3.98", rankPosition: 3, rankDelta: 0, totalRatings: 128, description: "Tabletop grills, banchan, and premium beef cuts.", priceRange: "$$", phone: "(972) 555-4301", address: "2625 Old Denton Rd, Carrollton, Dallas", lat: "33.0012345", lng: "-96.8912345", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&h=400&fit=crop" },
      { name: "Thai Orchid Garden", slug: "thai-orchid-garden-dallas", neighborhood: "Richardson", category: "restaurant", cuisine: "thai", weightedScore: "4.050", rawAvgScore: "3.90", rankPosition: 3, rankDelta: 1, totalRatings: 109, description: "Authentic Thai curries, pad see ew, and mango sticky rice.", priceRange: "$", phone: "(972) 555-4401", address: "816 W Arapaho Rd, Richardson, Dallas", lat: "32.9534567", lng: "-96.7556789", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=600&h=400&fit=crop" },
      { name: "Pho 95", slug: "pho-95-dallas", neighborhood: "Arlington", category: "restaurant", cuisine: "vietnamese", weightedScore: "4.020", rawAvgScore: "3.88", rankPosition: 3, rankDelta: 0, totalRatings: 95, description: "Straightforward Vietnamese pho and vermicelli bowls.", priceRange: "$", phone: "(817) 555-4501", address: "4250 S Cooper St, Arlington, Dallas", lat: "32.6912345", lng: "-97.1112345", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&h=400&fit=crop" },
      { name: "Istanbul Grill", slug: "istanbul-grill-dallas", neighborhood: "Plano", category: "restaurant", cuisine: "mediterranean", weightedScore: "4.150", rawAvgScore: "4.02", rankPosition: 2, rankDelta: 0, totalRatings: 134, description: "Turkish kebabs, hummus, and fresh baked pide.", priceRange: "$$", phone: "(469) 555-4601", address: "3000 Custer Rd, Plano, Dallas", lat: "33.0312345", lng: "-96.7812345", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop" },
      { name: "Shawarma Point", slug: "shawarma-point-dallas", neighborhood: "Irving", category: "restaurant", cuisine: "mediterranean", weightedScore: "4.020", rawAvgScore: "3.90", rankPosition: 3, rankDelta: 1, totalRatings: 98, description: "Lebanese-style shawarma wraps and falafel plates.", priceRange: "$", phone: "(972) 555-4701", address: "1234 W Pioneer Dr, Irving, Dallas", lat: "32.8234567", lng: "-96.9434567", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600&h=400&fit=crop" },
      // ── Cafes (no cuisine — category-level) ───────────────────
      { name: "Cultivar Coffee", slug: "cultivar-coffee-dallas", neighborhood: "East Dallas", category: "cafe", cuisine: null, weightedScore: "4.650", rawAvgScore: "4.50", rankPosition: 1, rankDelta: 0, totalRatings: 189, description: "Single-origin pour-overs and house-roasted beans.", priceRange: "$$", phone: "(214) 555-0789", address: "313 N Bishop Ave, East Dallas, Dallas", lat: "32.7932145", lng: "-96.7645321", isOpenNow: true, website: "https://cultivarcoffee.com", photoUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop" },
      { name: "Houndstooth Coffee", slug: "houndstooth-coffee-dallas", neighborhood: "Henderson", category: "cafe", cuisine: null, weightedScore: "4.520", rawAvgScore: "4.40", rankPosition: 2, rankDelta: 0, totalRatings: 167, description: "Specialty coffee bar with minimalist aesthetic.", priceRange: "$$", phone: "(214) 555-0890", address: "1900 N Henderson Ave, Henderson, Dallas", lat: "32.7998765", lng: "-96.7789012", isOpenNow: true, website: "https://houndstoothcoffee.com", photoUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop" },
      { name: "The Brew Room", slug: "the-brew-room-dallas", neighborhood: "Uptown", category: "cafe", cuisine: null, weightedScore: "4.380", rawAvgScore: "4.25", rankPosition: 3, rankDelta: 1, totalRatings: 132, description: "Cozy Uptown cafe with craft coffee and pastries.", priceRange: "$", phone: "(214) 555-0901", address: "2901 Thomas Ave, Uptown, Dallas", lat: "32.8012345", lng: "-96.7976543", isOpenNow: false, website: "https://thebrewroomdallas.com", photoUrl: "https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=600&h=400&fit=crop" },
      { name: "Mudleaf Coffee", slug: "mudleaf-coffee-dallas", neighborhood: "Oak Cliff", category: "cafe", cuisine: null, weightedScore: "4.200", rawAvgScore: "4.10", rankPosition: 4, rankDelta: -1, totalRatings: 98, description: "Community-focused coffee shop in Oak Cliff.", priceRange: "$", phone: "(214) 555-1012", address: "1621 W Davis St, Oak Cliff, Dallas", lat: "32.7489012", lng: "-96.8345678", isOpenNow: true, website: "https://mudleafcoffee.com", photoUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop" },
      { name: "Merit Coffee", slug: "merit-coffee-dallas", neighborhood: "Design District", category: "cafe", cuisine: null, weightedScore: "4.100", rawAvgScore: "4.00", rankPosition: 5, rankDelta: 0, totalRatings: 76, description: "Texas-based specialty coffee roasters.", priceRange: "$$", phone: "(214) 555-1123", address: "1445 Hi Line Dr, Design District, Dallas", lat: "32.7856789", lng: "-96.8123456", isOpenNow: false, website: "https://meritcoffee.com", photoUrl: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&h=400&fit=crop" },
      // ── Street Food ───────────────────────────────────────────
      { name: "Taco Stop", slug: "taco-stop-dallas", neighborhood: "Oak Cliff", category: "street_food", cuisine: "mexican", weightedScore: "4.710", rawAvgScore: "4.55", rankPosition: 1, rankDelta: 0, totalRatings: 456, description: "Legendary street tacos \u2014 the al pastor is unreal.", priceRange: "$", phone: "(214) 555-1234", address: "2811 Greenville Ave, Oak Cliff, Dallas", lat: "32.7423456", lng: "-96.8378901", isOpenNow: true, website: "https://tacostopdallas.com", photoUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop" },
      { name: "Fuel City Tacos", slug: "fuel-city-tacos-dallas", neighborhood: "Riverfront", category: "street_food", cuisine: "mexican", weightedScore: "4.540", rawAvgScore: "4.40", rankPosition: 2, rankDelta: 0, totalRatings: 378, description: "Gas station tacos that are famous citywide.", priceRange: "$", phone: "(214) 555-1345", address: "801 S Riverfront Blvd, Riverfront, Dallas", lat: "32.7701234", lng: "-96.8178901", isOpenNow: true, website: "https://fuelcitytacos.com", photoUrl: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&h=400&fit=crop" },
      { name: "Elote Man", slug: "elote-man-dallas", neighborhood: "Pleasant Grove", category: "street_food", cuisine: "mexican", weightedScore: "4.320", rawAvgScore: "4.20", rankPosition: 3, rankDelta: 1, totalRatings: 189, description: "Mexican street corn done right.", priceRange: "$", phone: "(214) 555-1456", address: "Mobile - Pleasant Grove area", lat: "32.7234567", lng: "-96.7456789", isOpenNow: false, photoUrl: "https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=600&h=400&fit=crop" },
      { name: "Chimmy's Churros", slug: "chimmys-churros-dallas", neighborhood: "Deep Ellum", category: "street_food", cuisine: "mexican", weightedScore: "4.050", rawAvgScore: "3.95", rankPosition: 5, rankDelta: 0, totalRatings: 112, description: "Fresh churros with creative dipping sauces.", priceRange: "$", phone: "(214) 555-1678", address: "2737 Main St, Deep Ellum, Dallas", lat: "32.7834567", lng: "-96.7823456", isOpenNow: true, website: "https://chimmyschurros.com", photoUrl: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600&h=400&fit=crop" },
      // ── Bars ──────────────────────────────────────────────────
      { name: "Midnight Rambler", slug: "midnight-rambler-dallas", neighborhood: "Downtown", category: "bar", cuisine: null, weightedScore: "4.680", rawAvgScore: "4.55", rankPosition: 1, rankDelta: 0, totalRatings: 234, description: "Sophisticated cocktail bar in the Joule Hotel basement.", priceRange: "$$$", phone: "(214) 555-1789", address: "1530 Main St, Downtown, Dallas", lat: "32.7812345", lng: "-96.7967890", isOpenNow: true, website: "https://midnightrambler.com", photoUrl: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=400&fit=crop" },
      { name: "Atwater Alley", slug: "atwater-alley-dallas", neighborhood: "Deep Ellum", category: "bar", cuisine: null, weightedScore: "4.450", rawAvgScore: "4.30", rankPosition: 2, rankDelta: 1, totalRatings: 198, description: "Craft beer and creative cocktails in Deep Ellum.", priceRange: "$$", phone: "(214) 555-1890", address: "2815 Elm St, Deep Ellum, Dallas", lat: "32.7823456", lng: "-96.7834567", isOpenNow: true, website: "https://atwateralley.com", photoUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop" },
      { name: "The Grapevine Bar", slug: "the-grapevine-bar-dallas", neighborhood: "Greenville", category: "bar", cuisine: null, weightedScore: "4.280", rawAvgScore: "4.15", rankPosition: 3, rankDelta: -1, totalRatings: 167, description: "Oldest bar in Dallas with classic dive bar vibes.", priceRange: "$", phone: "(214) 555-1901", address: "3902 Maple Ave, Greenville, Dallas", lat: "32.8134567", lng: "-96.8123456", isOpenNow: false, website: "https://thegrapevinebar.com", photoUrl: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=600&h=400&fit=crop" },
      { name: "Javier's Cigar Bar", slug: "javiers-cigar-bar-dallas", neighborhood: "Knox-Henderson", category: "bar", cuisine: null, weightedScore: "4.120", rawAvgScore: "4.00", rankPosition: 4, rankDelta: 0, totalRatings: 134, description: "Upscale cigar lounge with premium spirits.", priceRange: "$$$", phone: "(214) 555-2012", address: "4912 Cole Ave, Knox-Henderson, Dallas", lat: "32.8212345", lng: "-96.7912345", isOpenNow: true, website: "https://javierscigarbar.com", photoUrl: "https://images.unsplash.com/photo-1525268323446-0505b6fe7778?w=600&h=400&fit=crop" },
      { name: "Lee Harvey's", slug: "lee-harveys-dallas", neighborhood: "Cedars", category: "bar", cuisine: null, weightedScore: "3.950", rawAvgScore: "3.85", rankPosition: 5, rankDelta: 0, totalRatings: 189, description: "Iconic outdoor patio bar in the Cedars.", priceRange: "$", phone: "(214) 555-2123", address: "1807 Gould St, Cedars, Dallas", lat: "32.7723456", lng: "-96.7923456", isOpenNow: true, website: "https://leeharveys.com", photoUrl: "https://images.unsplash.com/photo-1538488881038-e252a119ace7?w=600&h=400&fit=crop" },
      // ── Bakeries ──────────────────────────────────────────────
      { name: "Village Baking Co.", slug: "village-baking-co-dallas", neighborhood: "Greenville", category: "bakery", cuisine: null, weightedScore: "4.730", rawAvgScore: "4.60", rankPosition: 1, rankDelta: 0, totalRatings: 267, description: "Artisan sourdough and French pastries.", priceRange: "$$", phone: "(214) 555-2234", address: "2009 Greenville Ave, Greenville, Dallas", lat: "32.8012345", lng: "-96.7712345", isOpenNow: true, website: "https://villagebakingco.com", photoUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop" },
      { name: "La Casita Bakeshop", slug: "la-casita-bakeshop-dallas", neighborhood: "Oak Cliff", category: "bakery", cuisine: null, weightedScore: "4.550", rawAvgScore: "4.40", rankPosition: 2, rankDelta: 0, totalRatings: 198, description: "Mexican-inspired pastries and traditional conchas.", priceRange: "$", phone: "(214) 555-2345", address: "1522 W Davis St, Oak Cliff, Dallas", lat: "32.7489012", lng: "-96.8334567", isOpenNow: true, website: "https://lacasitabakeshop.com", photoUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=400&fit=crop" },
      { name: "Bisous Bisous", slug: "bisous-bisous-patisserie-dallas", neighborhood: "Knox-Henderson", category: "bakery", cuisine: null, weightedScore: "4.380", rawAvgScore: "4.25", rankPosition: 3, rankDelta: 1, totalRatings: 156, description: "French macaron specialists with seasonal flavors.", priceRange: "$$", phone: "(214) 555-2456", address: "3809 McKinney Ave, Knox-Henderson, Dallas", lat: "32.8112345", lng: "-96.7934567", isOpenNow: false, website: "https://bisousbisous.com", photoUrl: "https://images.unsplash.com/photo-1612203985729-70726954388c?w=600&h=400&fit=crop" },
      { name: "Empire Baking Co.", slug: "empire-baking-co-dallas", neighborhood: "East Dallas", category: "bakery", cuisine: null, weightedScore: "4.200", rawAvgScore: "4.10", rankPosition: 4, rankDelta: -1, totalRatings: 132, description: "Dallas staple for bread and celebration cakes.", priceRange: "$$", phone: "(214) 555-2567", address: "5450 W Lovers Lane, East Dallas, Dallas", lat: "32.8534567", lng: "-96.7812345", isOpenNow: true, website: "https://empirebaking.com", photoUrl: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=600&h=400&fit=crop" },
      { name: "Haute Sweets", slug: "haute-sweets-patisserie-dallas", neighborhood: "Bishop Arts", category: "bakery", cuisine: null, weightedScore: "4.050", rawAvgScore: "3.95", rankPosition: 5, rankDelta: 0, totalRatings: 89, description: "Avant-garde desserts and sculptural pastries.", priceRange: "$$$", phone: "(214) 555-2678", address: "414 W Davis St, Bishop Arts, Dallas", lat: "32.7494123", lng: "-96.8278901", isOpenNow: false, website: "https://hautesweetspatisserie.com", photoUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&h=400&fit=crop" },
      // ── Fast Food ─────────────────────────────────────────────
      { name: "Raising Cane's", slug: "raising-canes-dallas", neighborhood: "Greenville", category: "fast_food", cuisine: "american", weightedScore: "4.420", rawAvgScore: "4.30", rankPosition: 1, rankDelta: 0, totalRatings: 523, description: "One love \u2014 chicken fingers, crinkle fries, Texas toast, and that sauce.", priceRange: "$", phone: "(214) 555-2789", address: "5809 Greenville Ave, Greenville, Dallas", lat: "32.8612345", lng: "-96.7712345", isOpenNow: true, website: "https://raisingcanes.com", photoUrl: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600&h=400&fit=crop" },
      { name: "Whataburger", slug: "whataburger-dallas", neighborhood: "Multiple", category: "fast_food", cuisine: "american", weightedScore: "4.280", rawAvgScore: "4.15", rankPosition: 2, rankDelta: 0, totalRatings: 678, description: "Texas institution. The honey butter chicken biscuit is legendary.", priceRange: "$", phone: "(214) 555-2890", address: "Multiple locations, Dallas", lat: "32.7767000", lng: "-96.7970000", isOpenNow: true, website: "https://whataburger.com", photoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop" },
      { name: "In-N-Out Burger", slug: "in-n-out-burger-dallas", neighborhood: "Uptown", category: "fast_food", cuisine: "american", weightedScore: "4.150", rawAvgScore: "4.00", rankPosition: 3, rankDelta: 1, totalRatings: 445, description: "California import that Dallas can't get enough of.", priceRange: "$", phone: "(214) 555-2901", address: "3500 McKinney Ave, Uptown, Dallas", lat: "32.8112345", lng: "-96.8012345", isOpenNow: true, website: "https://in-n-out.com", photoUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&h=400&fit=crop" },
      { name: "Wingstop", slug: "wingstop-dallas-hq", neighborhood: "Addison", category: "fast_food", cuisine: "american", weightedScore: "3.980", rawAvgScore: "3.85", rankPosition: 4, rankDelta: -1, totalRatings: 312, description: "Dallas-born wing chain \u2014 the original HQ location.", priceRange: "$", phone: "(214) 555-3012", address: "5501 LBJ Freeway, Addison, Dallas", lat: "32.9512345", lng: "-96.8312345", isOpenNow: false, website: "https://wingstop.com", photoUrl: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&h=400&fit=crop" },
      { name: "Taco Bell Cantina", slug: "taco-bell-cantina-dallas", neighborhood: "Deep Ellum", category: "fast_food", cuisine: "mexican", weightedScore: "3.820", rawAvgScore: "3.70", rankPosition: 5, rankDelta: 0, totalRatings: 201, description: "The elevated Taco Bell experience with booze.", priceRange: "$", phone: "(214) 555-3123", address: "2649 Main St, Deep Ellum, Dallas", lat: "32.7843210", lng: "-96.7854321", isOpenNow: true, website: "https://tacobell.com/cantina", photoUrl: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=600&h=400&fit=crop" }
    ];
    SEED_DISHES = [
      // Indian
      { businessSlug: "spice-garden-dallas", dishes: [
        { name: "Dum Pukht Lamb Biryani", voteCount: 87 },
        { name: "Butter Chicken", voteCount: 54 },
        { name: "Garlic Naan", voteCount: 32 }
      ] },
      { businessSlug: "tandoori-flames-irving", dishes: [
        { name: "Hyderabadi Goat Biryani", voteCount: 112 },
        { name: "Tandoori Chicken", voteCount: 78 },
        { name: "Paneer Tikka", voteCount: 45 }
      ] },
      { businessSlug: "bawarchi-biryanis-plano", dishes: [
        { name: "Goat Biryani", voteCount: 98 },
        { name: "Masala Dosa", voteCount: 67 },
        { name: "Chicken 65", voteCount: 43 }
      ] },
      { businessSlug: "chennai-cafe-frisco", dishes: [
        { name: "Masala Dosa", voteCount: 134 },
        { name: "Filter Coffee", voteCount: 89 },
        { name: "Idli Sambar", voteCount: 56 }
      ] },
      { businessSlug: "desi-district-richardson", dishes: [
        { name: "Pav Bhaji", voteCount: 76 },
        { name: "Chaat Platter", voteCount: 65 },
        { name: "Vada Pav", voteCount: 43 }
      ] },
      // Mexican
      { businessSlug: "abuelas-kitchen-dallas", dishes: [
        { name: "Mole Negro", voteCount: 89 },
        { name: "Enchiladas Oaxaque\xF1as", voteCount: 67 },
        { name: "Tamales", voteCount: 45 }
      ] },
      { businessSlug: "el-rincon-del-sabor-dallas", dishes: [
        { name: "Birria Tacos", voteCount: 134 },
        { name: "Pozole Rojo", voteCount: 78 },
        { name: "Menudo", voteCount: 56 }
      ] },
      { businessSlug: "taco-stop-dallas", dishes: [
        { name: "Al Pastor Taco", voteCount: 134 },
        { name: "Barbacoa Taco", voteCount: 89 },
        { name: "Carnitas Taco", voteCount: 67 }
      ] },
      // Japanese
      { businessSlug: "lucky-cat-ramen-dallas", dishes: [
        { name: "Tonkotsu Ramen", voteCount: 78 },
        { name: "Spicy Miso Ramen", voteCount: 45 },
        { name: "Gyoza", voteCount: 29 }
      ] },
      { businessSlug: "uchi-dallas", dishes: [
        { name: "Hama Chili", voteCount: 98 },
        { name: "Wagyu Sashimi", voteCount: 76 }
      ] },
      // Korean
      { businessSlug: "seoul-brothers-dallas", dishes: [
        { name: "Korean Fried Chicken", voteCount: 89 },
        { name: "Bibimbap", voteCount: 67 },
        { name: "Japchae", voteCount: 34 }
      ] },
      // Thai
      { businessSlug: "khao-noodle-dallas", dishes: [
        { name: "Boat Noodles", voteCount: 98 },
        { name: "Khao Piak Sen", voteCount: 76 },
        { name: "Laab", voteCount: 45 }
      ] },
      // Vietnamese
      { businessSlug: "pho-empire-dallas", dishes: [
        { name: "Rare Beef Pho", voteCount: 112 },
        { name: "Bun Bo Hue", voteCount: 78 },
        { name: "Banh Mi", voteCount: 56 }
      ] },
      // Chinese
      { businessSlug: "royal-china-dallas", dishes: [
        { name: "Dim Sum Platter", voteCount: 98 },
        { name: "Peking Duck", voteCount: 76 },
        { name: "Har Gow", voteCount: 54 }
      ] },
      // Italian
      { businessSlug: "lucia-dallas", dishes: [
        { name: "Handmade Pappardelle", voteCount: 87 },
        { name: "Grilled Branzino", voteCount: 56 }
      ] },
      { businessSlug: "cane-rosso-dallas", dishes: [
        { name: "Honey Bastard Pizza", voteCount: 112 },
        { name: "Margherita Pizza", voteCount: 89 }
      ] },
      // American
      { businessSlug: "the-yard-kitchen-dallas", dishes: [
        { name: "Heritage Pork Chop", voteCount: 65 },
        { name: "Smoked Brisket Mac", voteCount: 42 }
      ] },
      { businessSlug: "pecan-lodge-dallas", dishes: [
        { name: "Brisket", voteCount: 156 },
        { name: "Beef Rib", voteCount: 98 },
        { name: "Banana Pudding", voteCount: 67 }
      ] },
      // Bars / Cafes / Bakeries
      { businessSlug: "midnight-rambler-dallas", dishes: [
        { name: "The Rambler Old Fashioned", voteCount: 98 },
        { name: "Mezcal Negroni", voteCount: 56 }
      ] },
      { businessSlug: "village-baking-co-dallas", dishes: [
        { name: "Country Sourdough", voteCount: 112 },
        { name: "Pain au Chocolat", voteCount: 67 },
        { name: "Almond Croissant", voteCount: 45 }
      ] },
      { businessSlug: "cultivar-coffee-dallas", dishes: [
        { name: "Ethiopian Yirgacheffe", voteCount: 76 },
        { name: "Oat Milk Cortado", voteCount: 54 }
      ] },
      { businessSlug: "raising-canes-dallas", dishes: [
        { name: "The Box Combo", voteCount: 156 },
        { name: "Extra Cane's Sauce", voteCount: 89 }
      ] },
      // ── Sprint 303: Dish seed expansion — Sprint 298 businesses ──
      { businessSlug: "golden-dragon-palace-dallas", dishes: [
        { name: "Cantonese Roast Duck", voteCount: 67 },
        { name: "Dim Sum Platter", voteCount: 54 },
        { name: "Wonton Noodle Soup", voteCount: 38 }
      ] },
      { businessSlug: "nonnas-trattoria-dallas", dishes: [
        { name: "Cacio e Pepe", voteCount: 78 },
        { name: "Margherita Pizza", voteCount: 65 },
        { name: "Tiramisu", voteCount: 43 }
      ] },
      { businessSlug: "seoul-bbq-house-dallas", dishes: [
        { name: "Korean BBQ Combo", voteCount: 72 },
        { name: "Kimchi Jjigae", voteCount: 56 },
        { name: "Bulgogi", voteCount: 41 }
      ] },
      { businessSlug: "thai-orchid-garden-dallas", dishes: [
        { name: "Green Curry", voteCount: 65 },
        { name: "Pad See Ew", voteCount: 48 },
        { name: "Mango Sticky Rice", voteCount: 34 }
      ] },
      { businessSlug: "pho-95-dallas", dishes: [
        { name: "Pho Dac Biet", voteCount: 58 },
        { name: "Vermicelli Bowl", voteCount: 42 },
        { name: "Banh Mi", voteCount: 31 }
      ] },
      { businessSlug: "istanbul-grill-dallas", dishes: [
        { name: "Adana Kebab", voteCount: 72 },
        { name: "Hummus Platter", voteCount: 54 },
        { name: "Lamb Pide", voteCount: 38 }
      ] },
      { businessSlug: "shawarma-point-dallas", dishes: [
        { name: "Chicken Shawarma Wrap", voteCount: 65 },
        { name: "Falafel Plate", voteCount: 48 },
        { name: "Garlic Toum Fries", voteCount: 29 }
      ] },
      // ── Sprint 303: Additional dishes for existing businesses ──
      { businessSlug: "koryo-kalbi-dallas", dishes: [
        { name: "Galbi", voteCount: 78 },
        { name: "Japchae", voteCount: 45 },
        { name: "Kimchi Pancake", voteCount: 34 }
      ] },
      { businessSlug: "asian-mint-dallas", dishes: [
        { name: "Pad Thai", voteCount: 89 },
        { name: "Green Curry", voteCount: 54 },
        { name: "Tom Kha Gai", voteCount: 38 }
      ] },
      { businessSlug: "saigon-bites-dallas", dishes: [
        { name: "Banh Mi", voteCount: 76 },
        { name: "Spring Rolls", voteCount: 54 },
        { name: "Broken Rice Plate", voteCount: 38 }
      ] },
      { businessSlug: "sichuan-house-dallas", dishes: [
        { name: "Mapo Tofu", voteCount: 87 },
        { name: "Dan Dan Noodles", voteCount: 65 },
        { name: "Dry Pot Chicken", voteCount: 43 }
      ] },
      { businessSlug: "kabob-king-dallas", dishes: [
        { name: "Seekh Kabob", voteCount: 89 },
        { name: "Lamb Chops", voteCount: 67 },
        { name: "Chicken Tikka", voteCount: 45 }
      ] },
      { businessSlug: "smoke-and-vine-dallas", dishes: [
        { name: "Smoked Brisket", voteCount: 98 },
        { name: "Pulled Pork", voteCount: 67 },
        { name: "Mac and Cheese", voteCount: 45 }
      ] },
      { businessSlug: "fearings-dallas", dishes: [
        { name: "Tortilla Soup", voteCount: 87 },
        { name: "Barbecued Shrimp Taco", voteCount: 65 },
        { name: "Rattlesnake Queso", voteCount: 43 }
      ] },
      { businessSlug: "tei-an-dallas", dishes: [
        { name: "Hand-Cut Soba", voteCount: 76 },
        { name: "Tempura Assortment", voteCount: 54 }
      ] },
      { businessSlug: "casa-oaxaca-dallas", dishes: [
        { name: "Tlayuda", voteCount: 78 },
        { name: "Chapulines Taco", voteCount: 56 },
        { name: "Mezcal Flight", voteCount: 34 }
      ] },
      { businessSlug: "taqueria-la-ventana-dallas", dishes: [
        { name: "Al Pastor Taco", voteCount: 112 },
        { name: "Salsa Verde", voteCount: 67 },
        { name: "Fresh Tortillas", voteCount: 45 }
      ] },
      // ── Sprint 315: Expanded dishes for new leaderboards ──
      // Samosa
      { businessSlug: "desi-district-richardson", dishes: [
        { name: "Aloo Samosa", voteCount: 89 }
      ] },
      { businessSlug: "chennai-cafe-frisco", dishes: [
        { name: "Samosa Chaat", voteCount: 54 }
      ] },
      { businessSlug: "tandoori-flames-irving", dishes: [
        { name: "Keema Samosa", voteCount: 67 }
      ] },
      // Burrito
      { businessSlug: "abuelas-kitchen-dallas", dishes: [
        { name: "Carne Asada Burrito", voteCount: 76 }
      ] },
      { businessSlug: "el-rincon-del-sabor-dallas", dishes: [
        { name: "Burrito Mojado", voteCount: 89 }
      ] },
      { businessSlug: "taqueria-la-ventana-dallas", dishes: [
        { name: "Al Pastor Burrito", voteCount: 56 }
      ] },
      // Enchilada (covers enchilada ILIKE match)
      { businessSlug: "casa-oaxaca-dallas", dishes: [
        { name: "Enchilada Suizas", voteCount: 65 }
      ] },
      // Sushi
      { businessSlug: "uchi-dallas", dishes: [
        { name: "Omakase Sushi", voteCount: 112 }
      ] },
      { businessSlug: "tei-an-dallas", dishes: [
        { name: "Chirashi Sushi Bowl", voteCount: 65 }
      ] },
      // Pasta
      { businessSlug: "lucia-dallas", dishes: [
        { name: "Ricotta Gnudi Pasta", voteCount: 78 }
      ] },
      { businessSlug: "nonnas-trattoria-dallas", dishes: [
        { name: "Pasta Bolognese", voteCount: 87 }
      ] },
      { businessSlug: "cane-rosso-dallas", dishes: [
        { name: "Truffle Pasta", voteCount: 56 }
      ] },
      // Wings
      { businessSlug: "the-yard-kitchen-dallas", dishes: [
        { name: "Smoked Wings", voteCount: 78 }
      ] },
      { businessSlug: "raising-canes-dallas", dishes: [
        { name: "Buffalo Wings", voteCount: 65 }
      ] },
      { businessSlug: "fearings-dallas", dishes: [
        { name: "Jalape\xF1o Wings", voteCount: 54 }
      ] },
      // Falafel
      { businessSlug: "istanbul-grill-dallas", dishes: [
        { name: "Crispy Falafel Plate", voteCount: 65 }
      ] },
      { businessSlug: "kabob-king-dallas", dishes: [
        { name: "Falafel Wrap", voteCount: 54 }
      ] },
      // ── Sprint 316: Korean + Thai seed dishes ──
      // Korean BBQ
      { businessSlug: "seoul-brothers-dallas", dishes: [
        { name: "Korean BBQ Platter", voteCount: 98 }
      ] },
      { businessSlug: "koryo-kalbi-dallas", dishes: [
        { name: "Premium Korean BBQ Set", voteCount: 87 }
      ] },
      { businessSlug: "seoul-bbq-house-dallas", dishes: [
        { name: "Korean BBQ All-You-Can-Eat", voteCount: 76 }
      ] },
      // Bibimbap
      { businessSlug: "seoul-brothers-dallas", dishes: [
        { name: "Stone Pot Bibimbap", voteCount: 78 }
      ] },
      { businessSlug: "koryo-kalbi-dallas", dishes: [
        { name: "Dolsot Bibimbap", voteCount: 65 }
      ] },
      // Fried Chicken
      { businessSlug: "seoul-brothers-dallas", dishes: [
        { name: "Yangnyeom Fried Chicken", voteCount: 89 }
      ] },
      { businessSlug: "raising-canes-dallas", dishes: [
        { name: "Classic Fried Chicken Fingers", voteCount: 112 }
      ] },
      // Pad Thai
      { businessSlug: "khao-noodle-dallas", dishes: [
        { name: "Classic Pad Thai", voteCount: 76 }
      ] },
      { businessSlug: "asian-mint-dallas", dishes: [
        { name: "Shrimp Pad Thai", voteCount: 89 }
      ] },
      { businessSlug: "thai-orchid-garden-dallas", dishes: [
        { name: "Pad Thai with Tofu", voteCount: 54 }
      ] },
      // Green Curry
      { businessSlug: "khao-noodle-dallas", dishes: [
        { name: "Thai Green Curry", voteCount: 65 }
      ] },
      // ── Sprint 320: Chinese seed dishes ──
      // Dim Sum
      { businessSlug: "royal-china-dallas", dishes: [
        { name: "Dim Sum Selection", voteCount: 87 }
      ] },
      { businessSlug: "golden-dragon-palace-dallas", dishes: [
        { name: "Weekend Dim Sum Brunch", voteCount: 72 }
      ] },
      // Peking Duck
      { businessSlug: "royal-china-dallas", dishes: [
        { name: "Whole Peking Duck", voteCount: 76 }
      ] },
      { businessSlug: "golden-dragon-palace-dallas", dishes: [
        { name: "Half Peking Duck with Pancakes", voteCount: 54 }
      ] },
      // Hot Pot
      { businessSlug: "sichuan-house-dallas", dishes: [
        { name: "Sichuan Hot Pot", voteCount: 92 }
      ] }
    ];
    HOURS_RESTAURANT = { mon: "11:00-22:00", tue: "11:00-22:00", wed: "11:00-22:00", thu: "11:00-22:00", fri: "11:00-23:00", sat: "11:00-23:00", sun: "11:00-21:00" };
    HOURS_CAFE = { mon: "06:30-18:00", tue: "06:30-18:00", wed: "06:30-18:00", thu: "06:30-18:00", fri: "06:30-18:00", sat: "07:00-17:00", sun: "07:00-17:00" };
    HOURS_BAR = { mon: "16:00-02:00", tue: "16:00-02:00", wed: "16:00-02:00", thu: "16:00-02:00", fri: "16:00-02:00", sat: "14:00-02:00", sun: "14:00-00:00" };
    HOURS_BAKERY = { mon: "07:00-16:00", tue: "07:00-16:00", wed: "07:00-16:00", thu: "07:00-16:00", fri: "07:00-16:00", sat: "08:00-15:00", sun: "08:00-14:00" };
    HOURS_FAST_FOOD = { mon: "10:00-23:00", tue: "10:00-23:00", wed: "10:00-23:00", thu: "10:00-23:00", fri: "10:00-00:00", sat: "10:00-00:00", sun: "10:00-22:00" };
    HOURS_STREET_FOOD = { mon: "11:00-21:00", tue: "11:00-21:00", wed: "11:00-21:00", thu: "11:00-21:00", fri: "11:00-22:00", sat: "11:00-22:00", sun: "12:00-20:00" };
  }
});

// server/notification-triggers.ts
var notification_triggers_exports = {};
__export(notification_triggers_exports, {
  onClaimDecision: () => onClaimDecision,
  onNewRatingForBusiness: () => onNewRatingForBusiness,
  onRankingChange: () => onRankingChange,
  onTierUpgrade: () => onTierUpgrade,
  sendCityHighlightsPush: () => sendCityHighlightsPush,
  sendWeeklyDigestPush: () => sendWeeklyDigestPush,
  startWeeklyDigestScheduler: () => startWeeklyDigestScheduler
});
async function onTierUpgrade(memberId, pushToken, newTier) {
  if (!pushToken) return;
  try {
    const { getMemberById: getMemberById2 } = await Promise.resolve().then(() => (init_members(), members_exports));
    const member = await getMemberById2(memberId);
    const prefs = member?.notificationPrefs || {};
    if (prefs.tierUpgrades === false) return;
    await sendPushNotification(
      [pushToken],
      "You've been promoted!",
      `Your credibility reached ${newTier} tier. Your ratings now carry more weight.`,
      { screen: "profile" }
    );
    triggerLog.info(`Tier upgrade push sent: ${memberId} \u2192 ${newTier}`);
  } catch (err) {
    triggerLog.error(`Tier upgrade push failed: ${memberId}`, err);
  }
}
async function onClaimDecision(memberId, pushToken, businessName, approved) {
  if (!pushToken) return;
  try {
    if (approved) {
      await sendPushNotification(
        [pushToken],
        `Claim approved: ${businessName}`,
        "You're now the verified owner. Access your dashboard to see analytics.",
        { screen: "business" }
      );
    } else {
      await sendPushNotification(
        [pushToken],
        `Claim update: ${businessName}`,
        "Your claim could not be verified. Contact support for next steps.",
        { screen: "profile" }
      );
    }
    triggerLog.info(`Claim decision push sent: ${memberId}, approved=${approved}`);
  } catch (err) {
    triggerLog.error(`Claim decision push failed: ${memberId}`, err);
  }
}
async function sendWeeklyDigestPush() {
  try {
    const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { members: members4 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { isNotNull: isNotNull5 } = await import("drizzle-orm");
    const usersWithTokens = await db2.select({
      id: members4.id,
      pushToken: members4.pushToken,
      displayName: members4.displayName,
      notificationPrefs: members4.notificationPrefs
    }).from(members4).where(isNotNull5(members4.pushToken));
    let sent = 0;
    for (const user of usersWithTokens) {
      if (!user.pushToken) continue;
      const prefs = user.notificationPrefs || {};
      if (prefs.weeklyDigest === false) continue;
      const firstName = (user.displayName || "").split(" ")[0] || "there";
      await sendPushNotification(
        [user.pushToken],
        "Your weekly rankings update",
        `Hey ${firstName}, check what's changed in your city's rankings this week.`,
        { screen: "search" }
      );
      sent++;
    }
    triggerLog.info(`Weekly digest push sent to ${sent} users`);
    return sent;
  } catch (err) {
    triggerLog.error("Weekly digest push failed:", err);
    return 0;
  }
}
function startWeeklyDigestScheduler() {
  const WEEK_MS2 = 7 * 24 * 60 * 60 * 1e3;
  const now = /* @__PURE__ */ new Date();
  const dayOfWeek = now.getUTCDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;
  const nextMonday = new Date(now);
  nextMonday.setUTCDate(now.getUTCDate() + daysUntilMonday);
  nextMonday.setUTCHours(10, 0, 0, 0);
  if (nextMonday <= now) nextMonday.setUTCDate(nextMonday.getUTCDate() + 7);
  const msUntilFirst = nextMonday.getTime() - now.getTime();
  triggerLog.info(`Weekly digest scheduler: first run in ${Math.round(msUntilFirst / 36e5)}h`);
  const initialTimeout = setTimeout(() => {
    sendWeeklyDigestPush();
    setInterval(sendWeeklyDigestPush, WEEK_MS2);
  }, msUntilFirst);
  return initialTimeout;
}
async function onRankingChange(businessId, businessName, oldRank, newRank, city) {
  if (oldRank === newRank || oldRank === 0 || newRank === 0) return 0;
  const direction = newRank < oldRank ? "up" : "down";
  const delta = Math.abs(newRank - oldRank);
  if (delta < 2) return 0;
  try {
    const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { ratings: ratings5, members: members4 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq29, isNotNull: isNotNull5, and: and19 } = await import("drizzle-orm");
    const raters = await db2.selectDistinct({
      memberId: ratings5.memberId,
      pushToken: members4.pushToken,
      notificationPrefs: members4.notificationPrefs
    }).from(ratings5).innerJoin(members4, eq29(ratings5.memberId, members4.id)).where(and19(eq29(ratings5.businessId, businessId), isNotNull5(members4.pushToken)));
    let sent = 0;
    for (const rater of raters) {
      if (!rater.pushToken) continue;
      const prefs = rater.notificationPrefs || {};
      if (prefs.rankingChanges === false) continue;
      const emoji = direction === "up" ? "\u{1F4C8}" : "\u{1F4C9}";
      await sendPushNotification(
        [rater.pushToken],
        `${emoji} ${businessName} moved ${direction}`,
        `Now ranked #${newRank} in ${city} (was #${oldRank})`,
        { screen: "business", businessId }
      );
      sent++;
    }
    triggerLog.info(`Ranking change push: ${businessName} #${oldRank}\u2192#${newRank}, sent to ${sent} raters`);
    return sent;
  } catch (err) {
    triggerLog.error(`Ranking change push failed: ${businessId}`, err);
    return 0;
  }
}
async function onNewRatingForBusiness(businessId, businessName, ratingMemberId, raterName, score) {
  try {
    const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { ratings: ratings5, members: members4 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq29, isNotNull: isNotNull5, and: and19, ne: ne2 } = await import("drizzle-orm");
    const otherRaters = await db2.selectDistinct({
      memberId: ratings5.memberId,
      pushToken: members4.pushToken,
      notificationPrefs: members4.notificationPrefs
    }).from(ratings5).innerJoin(members4, eq29(ratings5.memberId, members4.id)).where(and19(
      eq29(ratings5.businessId, businessId),
      ne2(ratings5.memberId, ratingMemberId),
      isNotNull5(members4.pushToken)
    ));
    let sent = 0;
    for (const rater of otherRaters) {
      if (!rater.pushToken) continue;
      const prefs = rater.notificationPrefs || {};
      if (prefs.savedBusinessAlerts === false) continue;
      await sendPushNotification(
        [rater.pushToken],
        `New rating for ${businessName}`,
        `${raterName} gave it a ${score.toFixed(1)}. See how it affects the ranking.`,
        { screen: "business", businessId }
      );
      sent++;
    }
    triggerLog.info(`New rating push: ${businessName} by ${raterName}, sent to ${sent} raters`);
    return sent;
  } catch (err) {
    triggerLog.error(`New rating push failed: ${businessId}`, err);
    return 0;
  }
}
async function sendCityHighlightsPush(city) {
  try {
    const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { members: members4, rankHistory: rankHistory2, businesses: businesses2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq29, isNotNull: isNotNull5, and: and19, gte: gte9, desc: desc17 } = await import("drizzle-orm");
    const oneWeekAgo = new Date(Date.now() - 7 * 864e5).toISOString();
    const recentChanges = await db2.select({
      businessId: rankHistory2.businessId,
      businessName: businesses2.name,
      oldRank: rankHistory2.previousRank,
      newRank: rankHistory2.rank
    }).from(rankHistory2).innerJoin(businesses2, eq29(rankHistory2.businessId, businesses2.id)).where(and19(eq29(businesses2.city, city), gte9(rankHistory2.createdAt, oneWeekAgo))).orderBy(desc17(rankHistory2.createdAt)).limit(50);
    if (recentChanges.length === 0) return 0;
    let biggestMover = recentChanges[0];
    let biggestDelta = 0;
    for (const change of recentChanges) {
      const delta = Math.abs((change.oldRank || 0) - (change.newRank || 0));
      if (delta > biggestDelta) {
        biggestDelta = delta;
        biggestMover = change;
      }
    }
    if (biggestDelta < 2) return 0;
    const cityUsers = await db2.select({
      id: members4.id,
      pushToken: members4.pushToken,
      notificationPrefs: members4.notificationPrefs
    }).from(members4).where(and19(eq29(members4.city, city), isNotNull5(members4.pushToken)));
    let sent = 0;
    for (const user of cityUsers) {
      if (!user.pushToken) continue;
      const prefs = user.notificationPrefs || {};
      if (prefs.cityAlerts === false) continue;
      const direction = (biggestMover.newRank || 0) < (biggestMover.oldRank || 0) ? "climbed" : "dropped";
      await sendPushNotification(
        [user.pushToken],
        `${city} rankings update`,
        `${biggestMover.businessName} ${direction} ${biggestDelta} spots this week. See full rankings.`,
        { screen: "rankings" }
      );
      sent++;
    }
    triggerLog.info(`City highlights push: ${city}, biggest mover: ${biggestMover.businessName}, sent to ${sent} users`);
    return sent;
  } catch (err) {
    triggerLog.error(`City highlights push failed: ${city}`, err);
    return 0;
  }
}
var triggerLog;
var init_notification_triggers = __esm({
  "server/notification-triggers.ts"() {
    "use strict";
    init_push();
    init_logger();
    triggerLog = log.tag("NotifyTrigger");
  }
});

// server/email-drip.ts
async function sendEmail2(to, subject, html, text2) {
  dripLog.info(`Sending drip: ${to} | ${subject}`);
  await sendEmail({ to, subject, html, text: text2 });
}
function getDripStepForDay(daysSinceSignup) {
  return DRIP_SEQUENCE.find((s) => s.day === daysSinceSignup);
}
async function sendDay2Email(params) {
  const { email, displayName, city } = params;
  const firstName = displayName.split(" ")[0];
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F7F6F3;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F3;padding:40px 20px;">
  <tr><td align="center"><table width="100%" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;">
  ${BRAND_HEADER}
  <tr><td style="padding:24px;">
    <h2 style="margin:0 0 8px;color:#0D1B2A;font-size:20px;">Top 5 near you, ${firstName}</h2>
    <p style="color:#555;font-size:14px;line-height:1.5;">You've been exploring ${city}'s rankings for 2 days now. Have you checked out the top spots in your neighborhood?</p>
    <a href="https://topranker.com" style="display:block;text-align:center;background:#0D1B2A;color:#fff;padding:12px;border-radius:10px;font-weight:700;text-decoration:none;margin-top:16px;">See ${city}'s Top 5</a>
  </td></tr>
  ${BRAND_FOOTER}
  </table></td></tr></table></body></html>`;
  await sendEmail2(email, `Top 5 near you, ${firstName}`, html, `Top 5 restaurants near you in ${city}. Open TopRanker to explore.`);
}
async function sendDay3Email(params) {
  const { email, displayName } = params;
  const firstName = displayName.split(" ")[0];
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F7F6F3;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F3;padding:40px 20px;">
  <tr><td align="center"><table width="100%" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;">
  ${BRAND_HEADER}
  <tr><td style="padding:24px;">
    <h2 style="margin:0 0 8px;color:#0D1B2A;font-size:20px;">Your voice is unlocked! \u{1F389}</h2>
    <p style="color:#555;font-size:14px;line-height:1.5;">${firstName}, you've earned the right to rate businesses on TopRanker. Your ratings start at 0.10x weight \u2014 the more you rate, the more your voice matters.</p>
    <div style="background:#F7F6F3;border-radius:10px;padding:14px;margin:16px 0;">
      <p style="margin:0;color:#0D1B2A;font-size:13px;"><strong style="color:#C49A1A;">Your tier:</strong> New Member (0.10x)</p>
      <p style="margin:4px 0 0;color:#888;font-size:12px;">Rate 10+ businesses to reach Regular (0.35x)</p>
    </div>
    <a href="https://topranker.com" style="display:block;text-align:center;background:#C49A1A;color:#fff;padding:12px;border-radius:10px;font-weight:700;text-decoration:none;">Rate Your First Restaurant</a>
  </td></tr>
  ${BRAND_FOOTER}
  </table></td></tr></table></body></html>`;
  await sendEmail2(email, `Your voice is unlocked, ${firstName}!`, html, `You can now rate businesses on TopRanker. Your voice matters.`);
}
async function sendDay7Email(params) {
  const { email, displayName, city, ratingsCount, businessesRated } = params;
  const firstName = displayName.split(" ")[0];
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F7F6F3;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F3;padding:40px 20px;">
  <tr><td align="center"><table width="100%" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;">
  ${BRAND_HEADER}
  <tr><td style="padding:24px;">
    <h2 style="margin:0 0 8px;color:#0D1B2A;font-size:20px;">Your first week on TopRanker</h2>
    <p style="color:#555;font-size:14px;line-height:1.5;">Here's what you accomplished in ${city}:</p>
    <table width="100%" style="margin:16px 0;">
      <tr>
        <td style="text-align:center;padding:12px;background:#F7F6F3;border-radius:10px;">
          <p style="margin:0;color:#C49A1A;font-size:28px;font-weight:800;">${ratingsCount}</p>
          <p style="margin:2px 0 0;color:#888;font-size:11px;">Ratings</p>
        </td>
        <td style="width:8px;"></td>
        <td style="text-align:center;padding:12px;background:#F7F6F3;border-radius:10px;">
          <p style="margin:0;color:#C49A1A;font-size:28px;font-weight:800;">${businessesRated}</p>
          <p style="margin:2px 0 0;color:#888;font-size:11px;">Businesses</p>
        </td>
      </tr>
    </table>
    <a href="https://topranker.com" style="display:block;text-align:center;background:#0D1B2A;color:#fff;padding:12px;border-radius:10px;font-weight:700;text-decoration:none;">Keep Rating</a>
  </td></tr>
  ${BRAND_FOOTER}
  </table></td></tr></table></body></html>`;
  await sendEmail2(email, `Your first week, ${firstName}`, html, `Your first week: ${ratingsCount} ratings, ${businessesRated} businesses.`);
}
async function sendDay14Email(params) {
  const { email, displayName, city } = params;
  const firstName = displayName.split(" ")[0];
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F7F6F3;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F3;padding:40px 20px;">
  <tr><td align="center"><table width="100%" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;">
  ${BRAND_HEADER}
  <tr><td style="padding:24px;">
    <h2 style="margin:0 0 8px;color:#0D1B2A;font-size:20px;">Live challenges in ${city} \u26A1</h2>
    <p style="color:#555;font-size:14px;line-height:1.5;">${firstName}, the Challenger tab has live head-to-head competitions. Your weighted vote can decide which restaurant claims the #1 spot.</p>
    <a href="https://topranker.com" style="display:block;text-align:center;background:#0D1B2A;color:#fff;padding:12px;border-radius:10px;font-weight:700;text-decoration:none;margin-top:16px;">Vote in Live Challenges</a>
  </td></tr>
  ${BRAND_FOOTER}
  </table></td></tr></table></body></html>`;
  await sendEmail2(email, `Live challenges in ${city}`, html, `See live head-to-head challenges in ${city}. Your vote matters.`);
}
async function sendDay30Email(params) {
  const { email, displayName, city, totalRatings, currentTier, credibilityScore } = params;
  const firstName = displayName.split(" ")[0];
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F7F6F3;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F3;padding:40px 20px;">
  <tr><td align="center"><table width="100%" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;">
  ${BRAND_HEADER}
  <tr><td style="padding:24px;">
    <h2 style="margin:0 0 8px;color:#0D1B2A;font-size:20px;">One month on TopRanker \u{1F389}</h2>
    <p style="color:#555;font-size:14px;line-height:1.5;">${firstName}, you've been shaping ${city}'s rankings for 30 days. Here's your impact:</p>
    <table width="100%" style="margin:16px 0;">
      <tr>
        <td style="text-align:center;padding:12px;background:#F7F6F3;border-radius:10px;">
          <p style="margin:0;color:#C49A1A;font-size:24px;font-weight:800;">${totalRatings}</p>
          <p style="margin:2px 0 0;color:#888;font-size:11px;">Total Ratings</p>
        </td>
        <td style="width:8px;"></td>
        <td style="text-align:center;padding:12px;background:#F7F6F3;border-radius:10px;">
          <p style="margin:0;color:#C49A1A;font-size:24px;font-weight:800;">${currentTier}</p>
          <p style="margin:2px 0 0;color:#888;font-size:11px;">Tier</p>
        </td>
        <td style="width:8px;"></td>
        <td style="text-align:center;padding:12px;background:#F7F6F3;border-radius:10px;">
          <p style="margin:0;color:#C49A1A;font-size:24px;font-weight:800;">${credibilityScore}</p>
          <p style="margin:2px 0 0;color:#888;font-size:11px;">Cred Score</p>
        </td>
      </tr>
    </table>
    <p style="color:#555;font-size:13px;text-align:center;">Thank you for being part of the trust movement.</p>
    <a href="https://topranker.com" style="display:block;text-align:center;background:#C49A1A;color:#fff;padding:12px;border-radius:10px;font-weight:700;text-decoration:none;margin-top:12px;">View Your Profile</a>
  </td></tr>
  ${BRAND_FOOTER}
  </table></td></tr></table></body></html>`;
  await sendEmail2(email, `Your first month, ${firstName}!`, html, `One month on TopRanker: ${totalRatings} ratings, ${currentTier} tier, ${credibilityScore} cred score.`);
}
var dripLog, DRIP_SEQUENCE, BRAND_HEADER, BRAND_FOOTER;
var init_email_drip = __esm({
  "server/email-drip.ts"() {
    "use strict";
    init_logger();
    init_email();
    dripLog = log.tag("EmailDrip");
    DRIP_SEQUENCE = [
      { day: 2, name: "top_5_neighborhood", send: sendDay2Email },
      { day: 3, name: "rating_unlock", send: sendDay3Email },
      { day: 7, name: "first_week_stats", send: sendDay7Email },
      { day: 14, name: "challenger_intro", send: sendDay14Email },
      { day: 30, name: "first_month_recap", send: sendDay30Email }
    ];
    BRAND_HEADER = `
<tr><td style="background:#0D1B2A;padding:24px;text-align:center;">
  <h1 style="margin:0;color:#C49A1A;font-size:24px;font-weight:900;">TopRanker</h1>
</td></tr>`;
    BRAND_FOOTER = `
<tr><td style="padding:16px 24px;border-top:1px solid #E8E6E1;text-align:center;">
  <p style="margin:0;color:#999;font-size:10px;">
    TopRanker \u2014 Trust-weighted rankings<br>
    <a href="https://topranker.com/unsubscribe" style="color:#C49A1A;text-decoration:none;">Unsubscribe</a>
  </p>
</td></tr>`;
  }
});

// server/drip-scheduler.ts
var drip_scheduler_exports = {};
__export(drip_scheduler_exports, {
  processDripEmails: () => processDripEmails,
  startDripScheduler: () => startDripScheduler
});
import { isNotNull as isNotNull3 } from "drizzle-orm";
async function processDripEmails() {
  try {
    const allMembers = await db.select({
      id: members.id,
      email: members.email,
      displayName: members.displayName,
      city: members.city,
      username: members.username,
      joinedAt: members.joinedAt,
      notificationPrefs: members.notificationPrefs
    }).from(members).where(isNotNull3(members.email));
    const now = Date.now();
    let sent = 0;
    for (const member of allMembers) {
      if (!member.joinedAt) continue;
      const daysSinceSignup = Math.floor((now - new Date(member.joinedAt).getTime()) / DAY_MS);
      const step = getDripStepForDay(daysSinceSignup);
      if (!step) continue;
      const prefs = member.notificationPrefs || {};
      if (prefs.emailDrip === false) continue;
      try {
        await step.send({
          email: member.email,
          displayName: member.displayName,
          city: member.city,
          username: member.username
        });
        dripLog2.info(`Drip "${step.name}" sent to ${member.id} (day ${daysSinceSignup})`);
        sent++;
      } catch (err) {
        dripLog2.error(`Drip "${step.name}" failed for ${member.id}`, err);
      }
    }
    dripLog2.info(`Drip run complete: ${sent} emails sent`);
    return sent;
  } catch (err) {
    dripLog2.error("Drip processing failed:", err);
    return 0;
  }
}
function startDripScheduler() {
  const now = /* @__PURE__ */ new Date();
  const next9am = new Date(now);
  next9am.setUTCHours(9, 0, 0, 0);
  if (next9am <= now) next9am.setUTCDate(next9am.getUTCDate() + 1);
  const msUntilFirst = next9am.getTime() - now.getTime();
  dripLog2.info(`Drip scheduler: first run in ${Math.round(msUntilFirst / 36e5)}h`);
  const initialTimeout = setTimeout(() => {
    processDripEmails();
    setInterval(processDripEmails, DAY_MS);
  }, msUntilFirst);
  return initialTimeout;
}
var dripLog2, DAY_MS;
var init_drip_scheduler = __esm({
  "server/drip-scheduler.ts"() {
    "use strict";
    init_email_drip();
    init_db();
    init_schema();
    init_logger();
    dripLog2 = log.tag("DripScheduler");
    DAY_MS = 24 * 60 * 60 * 1e3;
  }
});

// server/email-owner-outreach.ts
async function sendOwnerProUpgradeEmail(params) {
  const { email, businessName, ownerName, totalRatings, weightedScore } = params;
  const firstName = ownerName.split(" ")[0];
  outreachLog.info(`Sending Pro upgrade: ${email} | ${businessName}`);
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F7F6F3;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F3;padding:40px 20px;">
  <tr><td align="center"><table width="100%" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;">
  ${BRAND_HEADER2}
  <tr><td style="padding:24px;">
    <h2 style="margin:0 0 8px;color:#0D1B2A;font-size:20px;">Unlock ${businessName}'s full analytics</h2>
    <p style="color:#555;font-size:14px;line-height:1.5;">Hi ${firstName}, ${businessName} has ${totalRatings} ratings with a weighted score of ${weightedScore.toFixed(1)}. Upgrade to Business Pro to get deeper insights and grow your ranking.</p>
    <table width="100%" style="margin:16px 0;">
      <tr>
        <td style="text-align:center;padding:12px;background:#F7F6F3;border-radius:10px;">
          <p style="margin:0;color:#C49A1A;font-size:28px;font-weight:800;">${totalRatings}</p>
          <p style="margin:2px 0 0;color:#888;font-size:11px;">Total Ratings</p>
        </td>
        <td style="width:8px;"></td>
        <td style="text-align:center;padding:12px;background:#F7F6F3;border-radius:10px;">
          <p style="margin:0;color:#C49A1A;font-size:28px;font-weight:800;">${weightedScore.toFixed(1)}</p>
          <p style="margin:2px 0 0;color:#888;font-size:11px;">Weighted Score</p>
        </td>
      </tr>
    </table>
    <div style="border:1px solid #E8E6E1;border-radius:10px;padding:16px;margin:16px 0;">
      <p style="margin:0 0 4px;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Business Pro \u2014 $49/mo</p>
      <ul style="margin:8px 0 0;padding-left:18px;color:#0D1B2A;font-size:14px;line-height:1.8;">
        <li>Rating trends and historical analytics</li>
        <li>Competitor insights and benchmarking</li>
        <li>Featured placement in search results</li>
        <li>Priority support from the TopRanker team</li>
      </ul>
    </div>
    <a href="https://topranker.com/business-pro" style="display:block;text-align:center;background:#C49A1A;color:#fff;padding:12px;border-radius:10px;font-weight:700;text-decoration:none;margin-top:16px;">Upgrade to Pro</a>
  </td></tr>
  ${BRAND_FOOTER2}
  </table></td></tr></table></body></html>`;
  const text2 = `Hi ${firstName},

${businessName} has ${totalRatings} ratings with a weighted score of ${weightedScore.toFixed(1)}.

Upgrade to Business Pro ($49/mo) to unlock:
- Rating trends and historical analytics
- Competitor insights and benchmarking
- Featured placement in search results
- Priority support from the TopRanker team

Upgrade now: https://topranker.com/business-pro

\u2014 The TopRanker Team`;
  await sendEmail({
    to: email,
    subject: `Unlock ${businessName}'s full analytics`,
    html,
    text: text2
  });
}
var outreachLog, BRAND_HEADER2, BRAND_FOOTER2;
var init_email_owner_outreach = __esm({
  "server/email-owner-outreach.ts"() {
    "use strict";
    init_email();
    init_logger();
    outreachLog = log.tag("OwnerOutreach");
    BRAND_HEADER2 = `
<tr><td style="background:#0D1B2A;padding:24px;text-align:center;">
  <h1 style="margin:0;color:#C49A1A;font-size:24px;font-weight:900;">TopRanker</h1>
</td></tr>`;
    BRAND_FOOTER2 = `
<tr><td style="padding:16px 24px;border-top:1px solid #E8E6E1;text-align:center;">
  <p style="margin:0;color:#999;font-size:10px;">
    TopRanker \u2014 Trust-weighted rankings<br>
    <a href="https://topranker.com/unsubscribe" style="color:#C49A1A;text-decoration:none;">Unsubscribe</a>
  </p>
</td></tr>`;
  }
});

// server/outreach-history.ts
function key(businessId, templateName) {
  return `${businessId}:${templateName}`;
}
function recordOutreachSent(businessId, templateName) {
  const k = key(businessId, templateName);
  if (!store2.has(k)) {
    store2.set(k, /* @__PURE__ */ new Set());
  }
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  store2.get(k).add(today);
  historyLog.info(`Recorded outreach: ${templateName} \u2192 business ${businessId} on ${today}`);
}
function hasOutreachBeenSent(businessId, templateName, withinDays) {
  const k = key(businessId, templateName);
  const dates = store2.get(k);
  if (!dates || dates.size === 0) return false;
  const cutoff = /* @__PURE__ */ new Date();
  cutoff.setDate(cutoff.getDate() - withinDays);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  for (const d of dates) {
    if (d >= cutoffStr) return true;
  }
  return false;
}
var historyLog, store2;
var init_outreach_history = __esm({
  "server/outreach-history.ts"() {
    "use strict";
    init_logger();
    historyLog = log.tag("OutreachHistory");
    store2 = /* @__PURE__ */ new Map();
  }
});

// server/outreach-scheduler.ts
var outreach_scheduler_exports = {};
__export(outreach_scheduler_exports, {
  processOwnerOutreach: () => processOwnerOutreach,
  startOutreachScheduler: () => startOutreachScheduler
});
import { eq as eq28, isNotNull as isNotNull4, and as and18 } from "drizzle-orm";
async function processOwnerOutreach() {
  let claimInvites = 0;
  let proUpgrades = 0;
  try {
    const claimCandidates = await db.select({
      id: businesses.id,
      name: businesses.name,
      slug: businesses.slug,
      city: businesses.city,
      totalRatings: businesses.totalRatings,
      rankPosition: businesses.rankPosition
    }).from(businesses).where(
      and18(
        eq28(businesses.isClaimed, false),
        isNotNull4(businesses.rankPosition)
      )
    );
    for (const biz of claimCandidates) {
      if (biz.totalRatings < 5) continue;
      outreachLog2.info(
        `Claim candidate: ${biz.name} (${biz.slug}) \u2014 ${biz.totalRatings} ratings, rank #${biz.rankPosition} in ${biz.city}`
      );
      claimInvites++;
    }
    const proCandidates = await db.select({
      id: businesses.id,
      name: businesses.name,
      ownerId: businesses.ownerId,
      totalRatings: businesses.totalRatings,
      weightedScore: businesses.weightedScore
    }).from(businesses).where(
      and18(
        eq28(businesses.isClaimed, true),
        isNotNull4(businesses.ownerId),
        eq28(businesses.subscriptionStatus, "none")
      )
    );
    for (const biz of proCandidates) {
      if (biz.totalRatings < 10 || !biz.ownerId) continue;
      if (hasOutreachBeenSent(String(biz.id), "pro_upgrade", 30)) {
        outreachLog2.info(`Skipping Pro upgrade for ${biz.name} \u2014 sent within 30 days`);
        continue;
      }
      try {
        const [owner] = await db.select({ email: members.email, displayName: members.displayName }).from(members).where(eq28(members.id, biz.ownerId));
        if (!owner?.email) continue;
        await sendOwnerProUpgradeEmail({
          email: owner.email,
          businessName: biz.name,
          ownerName: owner.displayName || "Business Owner",
          totalRatings: biz.totalRatings,
          weightedScore: parseFloat(biz.weightedScore ?? "0")
        });
        recordOutreachSent(String(biz.id), "pro_upgrade");
        proUpgrades++;
      } catch (err) {
        outreachLog2.error(`Pro upgrade email failed for business ${biz.id}`, err);
      }
    }
    outreachLog2.info(
      `Outreach complete: ${claimInvites} claim candidates logged, ${proUpgrades} Pro upgrade emails sent`
    );
  } catch (err) {
    outreachLog2.error("Outreach processing failed:", err);
  }
  return { claimInvites, proUpgrades };
}
function startOutreachScheduler() {
  const now = /* @__PURE__ */ new Date();
  const nextWed = new Date(now);
  const daysUntilWed = (3 - now.getUTCDay() + 7) % 7 || 7;
  nextWed.setUTCDate(now.getUTCDate() + daysUntilWed);
  nextWed.setUTCHours(10, 0, 0, 0);
  if (nextWed <= now) nextWed.setUTCDate(nextWed.getUTCDate() + 7);
  const msUntilFirst = nextWed.getTime() - now.getTime();
  outreachLog2.info(
    `Outreach scheduler: first run in ${Math.round(msUntilFirst / 36e5)}h (next Wed 10am UTC)`
  );
  const initialTimeout = setTimeout(() => {
    processOwnerOutreach();
    setInterval(processOwnerOutreach, WEEK_MS);
  }, msUntilFirst);
  return initialTimeout;
}
var outreachLog2, DAY_MS2, WEEK_MS;
var init_outreach_scheduler = __esm({
  "server/outreach-scheduler.ts"() {
    "use strict";
    init_email_owner_outreach();
    init_db();
    init_schema();
    init_logger();
    init_outreach_history();
    outreachLog2 = log.tag("OutreachScheduler");
    DAY_MS2 = 24 * 60 * 60 * 1e3;
    WEEK_MS = 7 * DAY_MS2;
  }
});

// server/index.ts
import express from "express";

// server/routes.ts
import { createServer } from "node:http";

// server/auth.ts
init_db();
init_storage();
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import bcrypt from "bcrypt";

// server/config.ts
function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. Server cannot start.`);
  }
  return value;
}
function optional(name, fallback) {
  return process.env[name] || fallback;
}
var config = {
  // Database (required)
  databaseUrl: required("DATABASE_URL"),
  // Session (required — no fallback, C1 audit finding)
  sessionSecret: required("SESSION_SECRET"),
  // Server
  port: parseInt(optional("PORT", "5000"), 10),
  nodeEnv: optional("NODE_ENV", "development"),
  isProduction: process.env.NODE_ENV === "production",
  // Google OAuth (optional — feature disabled if not set)
  googleClientId: process.env.GOOGLE_CLIENT_ID || null,
  // Stripe (optional — mock payments if not set)
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || null,
  // GitHub deploy webhook (optional)
  githubWebhookSecret: process.env.GITHUB_WEBHOOK_SECRET || null,
  // Push notifications (optional)
  ntfyTopic: optional("NTFY_TOPIC", "topranker-deploy"),
  // Google Maps (optional)
  googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || null,
  // Email (optional — console fallback if not set)
  resendApiKey: process.env.RESEND_API_KEY || null,
  // Hosting platform (optional — for CORS)
  replitDevDomain: process.env.REPLIT_DEV_DOMAIN || null,
  replitDomains: process.env.REPLIT_DOMAINS || null,
  railwayPublicDomain: process.env.RAILWAY_PUBLIC_DOMAIN || null,
  corsOrigins: process.env.CORS_ORIGINS || null
};

// server/auth.ts
init_tier_staleness();
function setupAuth(app2) {
  const PgStore = connectPgSimple(session);
  app2.use(
    session({
      store: new PgStore({
        pool,
        createTableIfMissing: true
      }),
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      proxy: config.isProduction,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1e3,
        httpOnly: true,
        sameSite: "lax",
        secure: config.isProduction
      }
    })
  );
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const member = await getMemberByEmail(email);
          if (!member) {
            return done(null, false, { message: "Invalid email or password" });
          }
          if (!member.password) {
            return done(null, false, { message: "This account uses Google sign-in" });
          }
          const isMatch = await bcrypt.compare(password, member.password);
          if (!isMatch) {
            return done(null, false, { message: "Invalid email or password" });
          }
          return done(null, {
            id: member.id,
            displayName: member.displayName,
            username: member.username,
            email: member.email,
            city: member.city,
            credibilityScore: member.credibilityScore,
            credibilityTier: member.credibilityTier
          });
        } catch (err) {
          return done(err);
        }
      }
    )
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const member = await getMemberById(id);
      if (!member) {
        return done(null, false);
      }
      const freshTier = checkAndRefreshTier(member.credibilityTier, member.credibilityScore);
      done(null, {
        id: member.id,
        displayName: member.displayName,
        username: member.username,
        email: member.email,
        city: member.city,
        credibilityScore: member.credibilityScore,
        credibilityTier: freshTier
      });
    } catch (err) {
      done(err);
    }
  });
}
async function registerMember(data) {
  const email = data.email.trim().toLowerCase();
  const username = data.username.trim().toLowerCase();
  const displayName = data.displayName.trim();
  if (!/^[a-zA-Z0-9_]{2,30}$/.test(username)) {
    throw new Error("Username must be 2-30 characters: letters, numbers, or underscores");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Invalid email address");
  }
  if (displayName.length < 1 || displayName.length > 50) {
    throw new Error("Display name must be 1-50 characters");
  }
  const existing = await getMemberByEmail(email);
  if (existing) throw new Error("Email already in use");
  const existingUsername = await getMemberByUsername(username);
  if (existingUsername) throw new Error("Username already taken");
  const hashedPassword = await bcrypt.hash(data.password, 10);
  return createMember({
    displayName,
    username,
    email,
    password: hashedPassword,
    city: data.city
  });
}
async function authenticateGoogleUser(token) {
  const googleClientId = config.googleClientId;
  if (!googleClientId) {
    throw new Error("Google Sign-In is not configured");
  }
  let googleId;
  let email;
  let displayName;
  let avatarUrl;
  const idTokenRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`);
  if (idTokenRes.ok) {
    const payload = await idTokenRes.json();
    if (payload.aud !== googleClientId) {
      throw new Error("Token audience mismatch");
    }
    googleId = payload.sub;
    email = payload.email.toLowerCase();
    displayName = payload.name || email.split("@")[0];
    avatarUrl = payload.picture || null;
  } else {
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!userInfoRes.ok) {
      throw new Error("Invalid Google token");
    }
    const userInfo = await userInfoRes.json();
    googleId = userInfo.sub;
    email = userInfo.email.toLowerCase();
    displayName = userInfo.name || email.split("@")[0];
    avatarUrl = userInfo.picture || null;
  }
  let member = await getMemberByAuthId(googleId);
  if (member) {
    return member;
  }
  member = await getMemberByEmail(email);
  if (member) {
    const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { members: members4 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq29 } = await import("drizzle-orm");
    await db2.update(members4).set({ authId: googleId, avatarUrl: avatarUrl || member.avatarUrl }).where(eq29(members4.id, member.id));
    return { ...member, authId: googleId };
  }
  const baseUsername = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20).toLowerCase();
  let username = baseUsername;
  let suffix = 1;
  while (await getMemberByUsername(username)) {
    username = `${baseUsername}${suffix}`;
    suffix++;
  }
  return createMember({
    displayName,
    username,
    email,
    authId: googleId,
    avatarUrl: avatarUrl || void 0,
    city: "Dallas"
  });
}

// server/deploy.ts
init_logger();
import { exec } from "child_process";
import * as crypto2 from "crypto";
var deployLog = log.tag("Deploy");
var deployStatus = {
  status: "idle",
  startedAt: null,
  completedAt: null,
  commit: null,
  error: null,
  log: []
};
function verifySignature(req) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) return true;
  const signature = req.header("x-hub-signature-256");
  if (!signature) return false;
  const body = req.rawBody;
  const hmac2 = crypto2.createHmac("sha256", secret);
  hmac2.update(body);
  const expected = `sha256=${hmac2.digest("hex")}`;
  return crypto2.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
function runCommand(cmd, cwd) {
  return new Promise((resolve2, reject) => {
    exec(cmd, { cwd, timeout: 3e5 }, (error, stdout, stderr) => {
      const output = (stdout || "") + (stderr || "");
      if (error) {
        reject(new Error(`${cmd} failed: ${output}`));
      } else {
        resolve2(output.trim());
      }
    });
  });
}
async function runDeploy() {
  const cwd = process.cwd();
  deployStatus = {
    status: "deploying",
    startedAt: (/* @__PURE__ */ new Date()).toISOString(),
    completedAt: null,
    commit: null,
    error: null,
    log: []
  };
  const addLog = (msg) => {
    deployLog.info(msg);
    deployStatus.log.push(`${(/* @__PURE__ */ new Date()).toISOString()} ${msg}`);
  };
  try {
    addLog("Pulling latest from GitHub...");
    await runCommand("cp .replit .replit.bak 2>/dev/null || true", cwd);
    await runCommand("git checkout -- .replit 2>/dev/null || true", cwd);
    await runCommand("git pull origin main --ff-only", cwd);
    await runCommand("cp .replit.bak .replit 2>/dev/null || true", cwd);
    await runCommand("rm -f .replit.bak", cwd);
    addLog("Git pull complete.");
    const commit = await runCommand("git rev-parse --short HEAD", cwd);
    deployStatus.commit = commit;
    addLog(`Now at commit: ${commit}`);
    addLog("Installing dependencies...");
    await runCommand(
      "npm install --legacy-peer-deps 2>/dev/null || npm install",
      cwd
    );
    addLog("Dependencies installed.");
    addLog("Building Expo static bundle...");
    await runCommand("npm run expo:static:build", cwd);
    addLog("Expo build complete.");
    addLog("Building server...");
    await runCommand("npm run server:build", cwd);
    addLog("Server build complete.");
    deployStatus.status = "success";
    deployStatus.completedAt = (/* @__PURE__ */ new Date()).toISOString();
    addLog("Deploy successful!");
    sendNotification(
      `TopRanker deployed! Commit: ${commit}`,
      "Build successful - refresh to see changes."
    );
  } catch (err) {
    deployStatus.status = "failed";
    deployStatus.completedAt = (/* @__PURE__ */ new Date()).toISOString();
    deployStatus.error = err.message;
    addLog(`Deploy FAILED: ${err.message}`);
    sendNotification(
      "TopRanker deploy FAILED",
      err.message.slice(0, 200)
    );
  }
}
function sendNotification(title, message) {
  const topic = process.env.NTFY_TOPIC || "topranker-deploy";
  const url = `https://ntfy.sh/${topic}`;
  fetch(url, {
    method: "POST",
    headers: { Title: title },
    body: message
  }).catch((err) => {
    deployLog.warn(`Notification failed: ${err.message}`);
  });
}
async function handleWebhook(req, res) {
  if (!verifySignature(req)) {
    return res.status(403).json({ error: "Invalid signature" });
  }
  const event = req.header("x-github-event");
  const payload = req.body;
  if (event === "ping") {
    return res.json({ message: "pong" });
  }
  if (event !== "push") {
    return res.json({ message: `Ignored event: ${event}` });
  }
  const branch = payload?.ref;
  if (branch !== "refs/heads/main") {
    return res.json({ message: `Ignored branch: ${branch}` });
  }
  if (deployStatus.status === "deploying") {
    return res.status(409).json({ message: "Deploy already in progress" });
  }
  runDeploy();
  res.json({
    message: "Deploy started",
    commit: payload?.head_commit?.id?.slice(0, 7) || "unknown"
  });
}
async function handleDeployStatus(_req, res) {
  res.json(deployStatus);
}

// server/photos.ts
init_logger();
async function handlePhotoProxy(req, res) {
  const ref = req.query.ref;
  if (!ref) {
    return res.status(400).json({ error: "Missing ref parameter" });
  }
  if (!ref.startsWith("places/")) {
    return res.status(400).json({ error: "Invalid photo reference" });
  }
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || "";
  if (!apiKey) {
    return res.status(503).json({ error: "Maps API key not configured" });
  }
  const maxWidth = parseInt(req.query.maxwidth) || 600;
  const maxHeight = parseInt(req.query.maxheight) || 400;
  const url = `https://places.googleapis.com/v1/${ref}/media?maxWidthPx=${maxWidth}&maxHeightPx=${maxHeight}&key=${apiKey}`;
  try {
    const upstream = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(1e4)
    });
    if (!upstream.ok) {
      const legacyUrl = `https://maps.googleapis.com/maps/api/place/photo?photoreference=${encodeURIComponent(ref)}&maxwidth=${maxWidth}&key=${apiKey}`;
      const legacyRes = await fetch(legacyUrl, {
        redirect: "follow",
        signal: AbortSignal.timeout(1e4)
      });
      if (!legacyRes.ok) {
        return res.status(upstream.status).json({
          error: `Google Places photo fetch failed: ${upstream.status}`
        });
      }
      const contentType2 = legacyRes.headers.get("content-type") || "image/jpeg";
      res.setHeader("Content-Type", contentType2);
      res.setHeader("Cache-Control", "public, max-age=86400");
      const buffer3 = Buffer.from(await legacyRes.arrayBuffer());
      return res.send(buffer3);
    }
    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    const buffer2 = Buffer.from(await upstream.arrayBuffer());
    res.send(buffer2);
  } catch (err) {
    if (err.name === "TimeoutError") {
      return res.status(504).json({ error: "Photo fetch timed out" });
    }
    log.tag("PhotoProxy").error("Error:", err.message);
    return res.status(502).json({ error: "Failed to fetch photo" });
  }
}

// server/badge-share.ts
var BADGE_META = {
  // User Milestone Badges
  "first-taste": { name: "First Taste", description: "Submit your very first rating", rarity: "common", color: "#FFD700", icon: "star" },
  "getting-started": { name: "Getting Started", description: "Rate 5 businesses", rarity: "common", color: "#FF6B35", icon: "flame" },
  "ten-strong": { name: "Ten Strong", description: "Rate 10 businesses", rarity: "common", color: "#4CAF50", icon: "ribbon" },
  "quarter-century": { name: "Quarter Century", description: "Rate 25 businesses", rarity: "rare", color: "#2196F3", icon: "medal" },
  "half-century": { name: "Half Century", description: "Rate 50 businesses", rarity: "rare", color: "#7C4DFF", icon: "trophy" },
  "centurion": { name: "Centurion", description: "Rate 100 businesses", rarity: "epic", color: "#9C27B0", icon: "shield-checkmark" },
  "rating-machine": { name: "Rating Machine", description: "Rate 250 businesses", rarity: "epic", color: "#E040FB", icon: "flash" },
  "legendary-judge": { name: "Legendary Judge", description: "Rate 500 businesses", rarity: "legendary", color: "#C49A1A", icon: "diamond" },
  // User Streak Badges
  "three-day-streak": { name: "On a Roll", description: "Rate on 3 consecutive days", rarity: "common", color: "#FF7043", icon: "flame-outline" },
  "week-warrior": { name: "Week Warrior", description: "Rate on 7 consecutive days", rarity: "rare", color: "#FF5722", icon: "flame" },
  "two-week-streak": { name: "Unstoppable", description: "Rate on 14 consecutive days", rarity: "epic", color: "#FF3D00", icon: "bonfire" },
  "monthly-devotion": { name: "Monthly Devotion", description: "Rate on 30 consecutive days", rarity: "legendary", color: "#DD2C00", icon: "infinite" },
  // User Explorer Badges
  "curious-palate": { name: "Curious Palate", description: "Rate in 3 different categories", rarity: "common", color: "#26A69A", icon: "compass" },
  "category-hopper": { name: "Category Hopper", description: "Rate in 5 different categories", rarity: "rare", color: "#00897B", icon: "map" },
  "master-explorer": { name: "Master Explorer", description: "Rate in 10 different categories", rarity: "epic", color: "#006064", icon: "earth" },
  "city-hopper": { name: "City Hopper", description: "Rate businesses in 2 different cities", rarity: "rare", color: "#5C6BC0", icon: "airplane" },
  "texas-tour": { name: "Texas Tour", description: "Rate businesses in 4 Texas cities", rarity: "legendary", color: "#C49A1A", icon: "flag" },
  "night-owl": { name: "Night Owl", description: "Submit a rating after midnight", rarity: "rare", color: "#3F51B5", icon: "moon" },
  "early-bird": { name: "Early Bird", description: "Submit a rating before 7 AM", rarity: "rare", color: "#FFC107", icon: "sunny" },
  // User Social Badges
  "first-referral": { name: "Connector", description: "Invite a friend who creates an account", rarity: "rare", color: "#29B6F6", icon: "people" },
  "squad-builder": { name: "Squad Builder", description: "Invite 5 friends who join TopRanker", rarity: "epic", color: "#0288D1", icon: "people-circle" },
  "community-leader": { name: "Community Leader", description: "Invite 25 friends who join TopRanker", rarity: "legendary", color: "#C49A1A", icon: "megaphone" },
  // User Tier Badges
  "tier-city": { name: "City Regular", description: "Reach the Regular tier (100+ credibility)", rarity: "rare", color: "#6B6B6B", icon: "star" },
  "tier-trusted": { name: "Trusted Judge", description: "Reach the Trusted tier (300+ credibility)", rarity: "epic", color: "#C49A1A", icon: "shield-checkmark" },
  "tier-top": { name: "Top Judge", description: "Reach the Top Judge tier (600+ credibility)", rarity: "legendary", color: "#C49A1A", icon: "trophy" },
  // User Special Badges
  "founding-member": { name: "Founding Member", description: "Joined TopRanker in its first year", rarity: "legendary", color: "#C49A1A", icon: "sparkles" },
  "perfect-score": { name: "Perfect 5", description: "Give a perfect 5.0 rating", rarity: "common", color: "#E91E63", icon: "heart" },
  "tough-critic": { name: "Tough Critic", description: "Give a rating of 1.0", rarity: "rare", color: "#F44336", icon: "alert-circle" },
  "impact-maker": { name: "Impact Maker", description: "Your rating moves a business up in rankings", rarity: "rare", color: "#4CAF50", icon: "trending-up" },
  "king-maker": { name: "King Maker", description: "Your rating moves a business to #1", rarity: "legendary", color: "#C49A1A", icon: "podium" },
  // User Seasonal Badges
  "spring-explorer": { name: "Spring Explorer", description: "Rate 5 businesses in March, April, or May", rarity: "rare", color: "#66BB6A", icon: "flower" },
  "summer-heat": { name: "Summer Heat", description: "Rate 5 businesses in June, July, or August", rarity: "rare", color: "#FF9800", icon: "sunny" },
  "fall-harvest": { name: "Fall Harvest", description: "Rate 5 businesses in September, October, or November", rarity: "rare", color: "#BF360C", icon: "leaf" },
  "winter-chill": { name: "Winter Chill", description: "Rate 5 businesses in December, January, or February", rarity: "rare", color: "#42A5F5", icon: "snow" },
  "year-round": { name: "Year-Round Rater", description: "Earn all 4 seasonal badges", rarity: "legendary", color: "#C49A1A", icon: "earth" },
  // Business Milestone Badges
  "biz-first-rating": { name: "On the Map", description: "Receive the first rating", rarity: "common", color: "#4CAF50", icon: "location" },
  "biz-10-ratings": { name: "Getting Noticed", description: "Receive 10 ratings", rarity: "common", color: "#42A5F5", icon: "eye" },
  "biz-25-ratings": { name: "Local Favorite", description: "Receive 25 ratings", rarity: "rare", color: "#EF5350", icon: "heart-circle" },
  "biz-50-ratings": { name: "Community Choice", description: "Receive 50 ratings", rarity: "rare", color: "#AB47BC", icon: "people" },
  "biz-100-ratings": { name: "City Icon", description: "Receive 100 ratings", rarity: "epic", color: "#C49A1A", icon: "star" },
  "biz-250-ratings": { name: "Legendary Spot", description: "Receive 250 ratings", rarity: "legendary", color: "#C49A1A", icon: "diamond" },
  "biz-top-10": { name: "Top 10", description: "Reach top 10 in your city's category", rarity: "rare", color: "#7C4DFF", icon: "trending-up" },
  "biz-top-3": { name: "Podium Finish", description: "Reach top 3 in your city's category", rarity: "epic", color: "#C49A1A", icon: "podium" },
  "biz-number-one": { name: "Number One", description: "Reach #1 in your city's category", rarity: "legendary", color: "#FFD700", icon: "trophy" },
  "biz-high-rated": { name: "Highly Rated", description: "Maintain an average score above 4.0", rarity: "rare", color: "#66BB6A", icon: "thumbs-up" },
  "biz-exceptional": { name: "Exceptional", description: "Maintain an average score above 4.5", rarity: "epic", color: "#FFC107", icon: "sparkles" },
  "biz-perfect-rep": { name: "Perfect Reputation", description: "Average score of 4.8+ with 25+ ratings", rarity: "legendary", color: "#C49A1A", icon: "ribbon" },
  "biz-steady-climber": { name: "Steady Climber", description: "Improve ranking for 3 consecutive weeks", rarity: "rare", color: "#26A69A", icon: "arrow-up-circle" },
  "biz-unstoppable-rise": { name: "Unstoppable Rise", description: "Improve ranking for 8 consecutive weeks", rarity: "epic", color: "#FF7043", icon: "rocket" },
  "biz-trusted-approved": { name: "Trusted Approved", description: "Receive 5+ ratings from Trusted tier judges", rarity: "epic", color: "#C49A1A", icon: "shield-checkmark" },
  "biz-top-judge-pick": { name: "Top Judge's Pick", description: "Rated 4.0+ by 3 Top Judge tier members", rarity: "legendary", color: "#C49A1A", icon: "medal" },
  "biz-challenger-winner": { name: "Challenger Champion", description: "Win a challenger battle", rarity: "epic", color: "#FF6F00", icon: "flash" },
  "biz-new-entry": { name: "New Entry", description: "Just added to TopRanker", rarity: "common", color: "#29B6F6", icon: "sparkles" },
  "biz-verified": { name: "Verified Business", description: "Business ownership verified by TopRanker", rarity: "rare", color: "#2196F3", icon: "checkmark-circle" }
};
var RARITY_COLORS = {
  common: "#8E8E93",
  rare: "#2196F3",
  epic: "#9C27B0",
  legendary: "#C49A1A"
};
function generateBadgeHtml(badgeId, username) {
  const badge = BADGE_META[badgeId];
  const title = badge ? `${badge.name} \u2014 TopRanker Badge` : "TopRanker Badge";
  const description = badge ? `${username ? `@${username} earned` : "Earned"} "${badge.name}" \u2014 ${badge.description}` : "Check out this TopRanker achievement badge!";
  const rarityColor = badge ? RARITY_COLORS[badge.rarity] || "#C49A1A" : "#C49A1A";
  const svgImage = badge ? `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <rect width="1200" height="630" fill="#0D1B2A"/>
      <rect x="40" y="40" width="1120" height="550" rx="24" fill="#1A2D44"/>
      <circle cx="600" cy="240" r="80" fill="none" stroke="${rarityColor}" stroke-width="6"/>
      <text x="600" y="256" text-anchor="middle" fill="${rarityColor}" font-size="64">${badge.icon === "star" ? "\u2605" : badge.icon === "flame" ? "\u{1F525}" : badge.icon === "trophy" ? "\u{1F3C6}" : badge.icon === "diamond" ? "\u{1F48E}" : badge.icon === "map" ? "\u{1F5FA}" : badge.icon === "moon" ? "\u{1F319}" : "\u2B50"}</text>
      <text x="600" y="380" text-anchor="middle" fill="#FFFFFF" font-size="36" font-weight="bold">${badge.name}</text>
      <text x="600" y="420" text-anchor="middle" fill="#8E8E93" font-size="20">${badge.description}</text>
      <rect x="520" y="445" width="160" height="28" rx="14" fill="${rarityColor}22"/>
      <text x="600" y="465" text-anchor="middle" fill="${rarityColor}" font-size="14" font-weight="bold">${badge.rarity.toUpperCase()}</text>
      ${username ? `<text x="600" y="520" text-anchor="middle" fill="#C49A1A" font-size="18">@${username}</text>` : ""}
      <text x="600" y="560" text-anchor="middle" fill="#636366" font-size="14">TopRanker \u2014 Where your rankings matter.</text>
    </svg>
  `.trim() : "";
  const ogImageDataUri = badge ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgImage)}` : "";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="website">
  ${ogImageDataUri ? `<meta property="og:image" content="${ogImageDataUri}">` : ""}
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0D1B2A; color: #fff; font-family: -apple-system, system-ui, sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .card { background: #1A2D44; border-radius: 24px; padding: 48px; text-align: center; max-width: 400px; }
    .badge-ring { width: 120px; height: 120px; border-radius: 60px; border: 4px solid ${rarityColor}; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 48px; }
    h1 { font-size: 28px; margin-bottom: 8px; }
    .desc { color: #8E8E93; font-size: 16px; margin-bottom: 16px; }
    .rarity { display: inline-block; background: ${rarityColor}22; color: ${rarityColor}; font-size: 12px; font-weight: 800; padding: 4px 16px; border-radius: 12px; text-transform: uppercase; letter-spacing: 1px; }
    .user { color: #C49A1A; margin-top: 16px; font-size: 16px; }
    .tagline { color: #636366; font-size: 13px; margin-top: 24px; }
    .cta { display: inline-block; margin-top: 20px; background: #C49A1A; color: #0D1B2A; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; }
  </style>
</head>
<body>
  <div class="card">
    ${badge ? `
      <div class="badge-ring">${badge.icon === "star" ? "\u2605" : badge.icon === "flame" ? "\u{1F525}" : badge.icon === "trophy" ? "\u{1F3C6}" : badge.icon === "diamond" ? "\u{1F48E}" : badge.icon === "map" ? "\u{1F5FA}" : badge.icon === "moon" ? "\u{1F319}" : "\u2B50"}</div>
      <h1>${badge.name}</h1>
      <p class="desc">${badge.description}</p>
      <span class="rarity">${badge.rarity}</span>
      ${username ? `<p class="user">Earned by @${username}</p>` : ""}
    ` : `
      <h1>Badge Not Found</h1>
      <p class="desc">This badge doesn't exist or the link is invalid.</p>
    `}
    <p class="tagline">TopRanker \u2014 Where your rankings matter.</p>
    <a href="/" class="cta">Open TopRanker</a>
  </div>
</body>
</html>`;
}
async function handleBadgeShare(req, res) {
  const badgeId = req.params.badgeId;
  const username = req.query.user || null;
  const html = generateBadgeHtml(badgeId, username);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.send(html);
}

// server/routes-admin.ts
init_admin();

// server/sanitize.ts
function stripHtml(input) {
  return input.replace(/<[^>]*>/g, "").trim();
}
function sanitizeString(input, maxLength = 500) {
  if (typeof input !== "string") return "";
  return stripHtml(input).slice(0, maxLength).trim();
}
function sanitizeNumber(input, min, max, fallback) {
  const num = Number(input);
  if (isNaN(num)) return fallback;
  return Math.min(max, Math.max(min, num));
}
function sanitizeEmail(input) {
  if (typeof input !== "string") return "";
  const trimmed = input.toLowerCase().trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? trimmed : "";
}
function sanitizeSlug(input) {
  if (typeof input !== "string") return "";
  return input.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 100);
}

// server/routes-admin.ts
init_storage();

// server/google-places.ts
init_logger();
var API_BASE = "https://places.googleapis.com/v1";
async function fetchPlacePhotos(googlePlaceId, limit = 5) {
  const apiKey = config.googleMapsApiKey;
  if (!apiKey) {
    log.tag("GooglePlaces").warn("No API key configured \u2014 skipping photo fetch");
    return [];
  }
  const url = `${API_BASE}/places/${googlePlaceId}?fields=photos&key=${apiKey}`;
  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json"
      },
      signal: AbortSignal.timeout(1e4)
    });
    if (!response.ok) {
      const body = await response.text();
      log.tag("GooglePlaces").error(
        `Place details failed for ${googlePlaceId}: ${response.status} \u2014 ${body.slice(0, 200)}`
      );
      return [];
    }
    const data = await response.json();
    if (!data.photos || data.photos.length === 0) {
      log.tag("GooglePlaces").info(`No photos found for ${googlePlaceId}`);
      return [];
    }
    return data.photos.slice(0, limit).map((p) => p.name);
  } catch (err) {
    if (err.name === "TimeoutError") {
      log.tag("GooglePlaces").error(`Timeout fetching photos for ${googlePlaceId}`);
    } else {
      log.tag("GooglePlaces").error(`Error fetching photos for ${googlePlaceId}: ${err.message}`);
    }
    return [];
  }
}
async function searchNearbyRestaurants(city, category = "restaurant", maxResults = 20) {
  const apiKey = config.googleMapsApiKey;
  if (!apiKey) {
    log.tag("GooglePlaces").warn("No API key \u2014 skipping nearby search");
    return [];
  }
  const typeQuery = category === "restaurant" ? "restaurants" : category === "cafe" ? "cafes" : category === "bar" ? "bars" : category === "bakery" ? "bakeries" : category === "street_food" ? "street food" : category === "fast_food" ? "fast food" : "restaurants";
  try {
    const response = await fetch(`${API_BASE}/places:searchText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.priceLevel,places.types"
      },
      body: JSON.stringify({
        textQuery: `best ${typeQuery} in ${city}`,
        maxResultCount: Math.min(maxResults, 20)
      }),
      signal: AbortSignal.timeout(15e3)
    });
    if (!response.ok) {
      const body = await response.text();
      log.tag("GooglePlaces").error(`Nearby search failed: ${response.status} \u2014 ${body.slice(0, 200)}`);
      return [];
    }
    const data = await response.json();
    if (!data.places || data.places.length === 0) return [];
    const priceLevelMap = {
      PRICE_LEVEL_FREE: "$",
      PRICE_LEVEL_INEXPENSIVE: "$",
      PRICE_LEVEL_MODERATE: "$$",
      PRICE_LEVEL_EXPENSIVE: "$$$",
      PRICE_LEVEL_VERY_EXPENSIVE: "$$$$"
    };
    return data.places.map((p) => ({
      placeId: p.id,
      name: p.displayName?.text || "Unknown",
      address: p.formattedAddress || "",
      lat: p.location?.latitude || 0,
      lng: p.location?.longitude || 0,
      rating: p.rating || null,
      priceLevel: priceLevelMap[p.priceLevel] || "$$",
      types: p.types || []
    }));
  } catch (err) {
    log.tag("GooglePlaces").error(`Nearby search error: ${err.message}`);
    return [];
  }
}
function normalizeCategory(types) {
  if (types.includes("cafe") || types.includes("coffee_shop")) return "cafe";
  if (types.includes("bar") || types.includes("night_club")) return "bar";
  if (types.includes("bakery")) return "bakery";
  if (types.includes("meal_delivery") || types.includes("meal_takeaway")) return "fast_food";
  return "restaurant";
}
async function fetchAndStorePhotos(businessId, googlePlaceId) {
  const photoRefs = await fetchPlacePhotos(googlePlaceId, 5);
  if (photoRefs.length === 0) return 0;
  const { insertBusinessPhotos: insertBusinessPhotos2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
  await insertBusinessPhotos2(
    businessId,
    photoRefs.map((ref, i) => ({
      photoUrl: ref,
      isHero: i === 0,
      sortOrder: i
    }))
  );
  log.tag("GooglePlaces").info(
    `Stored ${photoRefs.length} photos for business ${businessId} (place: ${googlePlaceId})`
  );
  return photoRefs.length;
}

// server/perf-monitor.ts
init_logger();

// lib/performance-budget.ts
var BUDGETS = [
  { metric: "ttfb", budget: 200, unit: "ms" },
  { metric: "fcp", budget: 1500, unit: "ms" },
  { metric: "bundle_size", budget: 500, unit: "kb" },
  { metric: "api_response_avg", budget: 200, unit: "ms" },
  { metric: "api_response_max", budget: 2e3, unit: "ms" },
  { metric: "slow_request_rate", budget: 5, unit: "%" }
];

// server/alerting.ts
init_logger();
var alertLog = log.tag("Alerting");
var alerts = [];
var MAX_ALERTS = 200;
var lastFired = /* @__PURE__ */ new Map();
var DEFAULT_RULES = [
  {
    name: "health_check_failed",
    condition: "Health endpoint returns non-200",
    severity: "critical",
    channels: ["console"],
    cooldownMs: 6e4
    // 1 minute cooldown
  },
  {
    name: "high_error_rate",
    condition: "Error rate exceeds 5% in 5-minute window",
    severity: "critical",
    channels: ["console"],
    cooldownMs: 3e5
    // 5 minute cooldown
  },
  {
    name: "slow_response",
    condition: "Average response time exceeds 500ms",
    severity: "warning",
    channels: ["console"],
    cooldownMs: 3e5
  },
  {
    name: "high_memory",
    condition: "Heap usage exceeds 512MB",
    severity: "warning",
    channels: ["console"],
    cooldownMs: 6e5
    // 10 minute cooldown
  },
  {
    name: "rate_limit_spike",
    condition: "Rate limit rejections exceed 100/min",
    severity: "warning",
    channels: ["console"],
    cooldownMs: 3e5
  }
];
function fireAlert(ruleName, message, severity = "warning", metadata) {
  const now = Date.now();
  const rule = DEFAULT_RULES.find((r) => r.name === ruleName);
  const cooldown = rule?.cooldownMs ?? 6e4;
  const last = lastFired.get(ruleName) ?? 0;
  if (now - last < cooldown) {
    return false;
  }
  lastFired.set(ruleName, now);
  const alert = {
    id: `alert_${now}_${Math.random().toString(36).slice(2, 8)}`,
    rule: ruleName,
    severity,
    message,
    timestamp: new Date(now).toISOString(),
    acknowledged: false,
    metadata
  };
  alerts.push(alert);
  if (alerts.length > MAX_ALERTS) {
    alerts.splice(0, alerts.length - MAX_ALERTS);
  }
  const icon = severity === "critical" ? "\u{1F534}" : severity === "warning" ? "\u26A0\uFE0F" : "\u2139\uFE0F";
  alertLog.warn(`${icon} [${severity.toUpperCase()}] ${ruleName}: ${message}`);
  return true;
}
function getRecentAlerts(limit = 50) {
  return alerts.slice(-limit);
}
function acknowledgeAlert(alertId) {
  const alert = alerts.find((a) => a.id === alertId);
  if (alert) {
    alert.acknowledged = true;
    return true;
  }
  return false;
}
function getAlertStats() {
  const bySeverity = { critical: 0, warning: 0, info: 0 };
  for (const a of alerts) {
    bySeverity[a.severity]++;
  }
  return {
    total: alerts.length,
    unacknowledged: alerts.filter((a) => !a.acknowledged).length,
    bySeverity,
    lastAlert: alerts.length > 0 ? alerts[alerts.length - 1].timestamp : null
  };
}
function getAlertRules() {
  return [...DEFAULT_RULES];
}

// server/perf-monitor.ts
var perfLog = log.tag("Perf");
var SLOW_THRESHOLD_MS = 500;
var stats = {
  totalRequests: 0,
  slowRequests: 0,
  avgDurationMs: 0,
  maxDurationMs: 0,
  byRoute: /* @__PURE__ */ new Map()
};
var totalDurationMs = 0;
function perfMonitor(req, res, next) {
  const start = performance.now();
  res.on("finish", () => {
    const duration = performance.now() - start;
    const route = `${req.method} ${req.route?.path || req.path}`;
    stats.totalRequests++;
    totalDurationMs += duration;
    stats.avgDurationMs = totalDurationMs / stats.totalRequests;
    stats.maxDurationMs = Math.max(stats.maxDurationMs, duration);
    let routeStats = stats.byRoute.get(route);
    if (!routeStats) {
      routeStats = { count: 0, totalMs: 0, maxMs: 0 };
      stats.byRoute.set(route, routeStats);
    }
    routeStats.count++;
    routeStats.totalMs += duration;
    routeStats.maxMs = Math.max(routeStats.maxMs, duration);
    if (duration > SLOW_THRESHOLD_MS) {
      stats.slowRequests++;
      perfLog.warn(`Slow request: ${route} took ${duration.toFixed(0)}ms`);
      fireAlert("slow_response", `${route} took ${duration.toFixed(0)}ms (threshold: ${SLOW_THRESHOLD_MS}ms)`, "warning", { route, duration: Math.round(duration) });
    }
    const heapMB = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    if (heapMB > 512) {
      fireAlert("high_memory", `Heap usage: ${heapMB}MB exceeds 512MB threshold`, "warning", { heapMB });
    }
    if (!res.headersSent) {
      res.setHeader("Server-Timing", `total;dur=${duration.toFixed(1)}`);
    }
  });
  next();
}
function getPerformanceValidation() {
  const avgBudget = BUDGETS.find((b) => b.metric === "api_response_avg")?.budget ?? 200;
  const maxBudget = BUDGETS.find((b) => b.metric === "api_response_max")?.budget ?? 2e3;
  const slowBudget = BUDGETS.find((b) => b.metric === "slow_request_rate")?.budget ?? 5;
  const checks = [
    {
      name: "Avg Response Time",
      passed: stats.avgDurationMs <= avgBudget,
      actual: Math.round(stats.avgDurationMs),
      budget: avgBudget,
      unit: "ms"
    },
    {
      name: "Max Response Time",
      passed: stats.maxDurationMs <= maxBudget,
      actual: Math.round(stats.maxDurationMs),
      budget: maxBudget,
      unit: "ms"
    },
    {
      name: "Slow Request Rate",
      passed: stats.totalRequests === 0 || stats.slowRequests / stats.totalRequests < slowBudget / 100,
      actual: stats.totalRequests > 0 ? Math.round(stats.slowRequests / stats.totalRequests * 100) : 0,
      budget: slowBudget,
      unit: "%"
    }
  ];
  return {
    healthy: checks.every((c) => c.passed),
    checks
  };
}
function getPerfStats() {
  const routes = Array.from(stats.byRoute.entries()).map(([route, s]) => ({
    route,
    count: s.count,
    avgMs: Math.round(s.totalMs / s.count),
    maxMs: Math.round(s.maxMs)
  })).sort((a, b) => b.maxMs - a.maxMs).slice(0, 20);
  return {
    totalRequests: stats.totalRequests,
    slowRequests: stats.slowRequests,
    avgDurationMs: Math.round(stats.avgDurationMs),
    maxDurationMs: Math.round(stats.maxDurationMs),
    slowestRoutes: routes
  };
}

// server/routes-admin.ts
init_analytics2();

// server/routes-admin-analytics.ts
init_admin();
init_analytics2();

// server/wrap-async.ts
init_logger();
function wrapAsync(fn) {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      log.error(`Unhandled route error: ${req.method} ${req.path}`, err);
      if (!res.headersSent) {
        res.status(500).json({ error: err.message || "Internal Server Error" });
      }
    });
  };
}

// server/middleware.ts
init_analytics2();
function requireAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  if (req.user?.id) {
    recordUserActivity(req.user.id);
    Promise.resolve().then(() => (init_user_activity(), user_activity_exports)).then(({ recordUserActivityDb: recordUserActivityDb2 }) => recordUserActivityDb2(req.user.id)).catch(() => {
    });
  }
  next();
}

// server/routes-admin-analytics.ts
function requireAdmin(req, res, next) {
  if (!isAdminEmail(req.user?.email)) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}
var dimensionTimingLog = [];
var MAX_TIMING_LOG = 1e3;
function recordDimensionTiming(entry) {
  dimensionTimingLog.push({ ...entry, ts: Date.now() });
  if (dimensionTimingLog.length > MAX_TIMING_LOG) {
    dimensionTimingLog.splice(0, dimensionTimingLog.length - MAX_TIMING_LOG);
  }
}
function getDimensionTimingAggregates() {
  if (dimensionTimingLog.length === 0) {
    return { count: 0, avgQ1Ms: 0, avgQ2Ms: 0, avgQ3Ms: 0, avgReturnMs: 0, avgTotalMs: 0, byVisitType: {} };
  }
  const n = dimensionTimingLog.length;
  const sums = dimensionTimingLog.reduce(
    (acc, e) => ({ q1: acc.q1 + e.q1Ms, q2: acc.q2 + e.q2Ms, q3: acc.q3 + e.q3Ms, ret: acc.ret + e.returnMs, tot: acc.tot + e.totalMs }),
    { q1: 0, q2: 0, q3: 0, ret: 0, tot: 0 }
  );
  const byType = {};
  const groups = {};
  dimensionTimingLog.forEach((e) => {
    if (!groups[e.visitType]) groups[e.visitType] = [];
    groups[e.visitType].push(e);
  });
  for (const [vt, entries] of Object.entries(groups)) {
    const c = entries.length;
    byType[vt] = {
      count: c,
      avgQ1Ms: Math.round(entries.reduce((s, e) => s + e.q1Ms, 0) / c),
      avgQ2Ms: Math.round(entries.reduce((s, e) => s + e.q2Ms, 0) / c),
      avgQ3Ms: Math.round(entries.reduce((s, e) => s + e.q3Ms, 0) / c),
      avgReturnMs: Math.round(entries.reduce((s, e) => s + e.returnMs, 0) / c),
      avgTotalMs: Math.round(entries.reduce((s, e) => s + e.totalMs, 0) / c)
    };
  }
  return {
    count: n,
    avgQ1Ms: Math.round(sums.q1 / n),
    avgQ2Ms: Math.round(sums.q2 / n),
    avgQ3Ms: Math.round(sums.q3 / n),
    avgReturnMs: Math.round(sums.ret / n),
    avgTotalMs: Math.round(sums.tot / n),
    byVisitType: byType
  };
}
function registerAdminAnalyticsRoutes(app2) {
  app2.get("/api/admin/analytics", requireAuth, requireAdmin, wrapAsync(async (_req, res) => {
    const data = {
      funnel: getFunnelStats(),
      recentEvents: getRecentEvents(20)
    };
    return res.json({ data });
  }));
  app2.get("/api/admin/analytics/dashboard", requireAuth, requireAdmin, wrapAsync(async (_req, res) => {
    const stats2 = getFunnelStats();
    const recent = getRecentEvents(50);
    const signups = stats2.signup_completed || 0;
    const pageViews = stats2.page_view || 0;
    const firstRatings = stats2.first_rating || 0;
    const challengerEntries = stats2.challenger_entered || 0;
    const dashboardSubs = stats2.dashboard_pro_subscribed || 0;
    const dashboard = {
      overview: {
        totalEvents: Object.values(stats2).reduce((a, b) => a + b, 0),
        uniqueEventTypes: Object.keys(stats2).length
      },
      funnel: {
        pageViews,
        signups,
        firstRatings,
        challengerEntries,
        dashboardSubs,
        signupRate: pageViews > 0 ? (signups / pageViews * 100).toFixed(1) + "%" : "N/A",
        ratingRate: signups > 0 ? (firstRatings / signups * 100).toFixed(1) + "%" : "N/A"
      },
      recentActivity: recent.slice(0, 10),
      generatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    return res.json({ data: dashboard });
  }));
  app2.get("/api/admin/analytics/hourly", requireAuth, requireAdmin, wrapAsync(async (req, res) => {
    const hours = Math.min(168, Math.max(1, parseInt(req.query.hours) || 24));
    return res.json({ data: getHourlyStats(hours) });
  }));
  app2.get("/api/admin/analytics/daily", requireAuth, requireAdmin, wrapAsync(async (req, res) => {
    const days = Math.min(90, Math.max(1, parseInt(req.query.days) || 7));
    return res.json({ data: getDailyStats(days) });
  }));
  app2.get("/api/admin/analytics/active-users", requireAuth, requireAdmin, wrapAsync(async (_req, res) => {
    return res.json({ data: getActiveUserStats() });
  }));
  app2.get("/api/admin/analytics/beta-funnel", requireAuth, requireAdmin, wrapAsync(async (_req, res) => {
    const { getBetaInviteStats: getBetaInviteStats2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const funnel = getBetaConversionFunnel();
    const inviteStats = await getBetaInviteStats2();
    return res.json({
      data: {
        ...funnel,
        inviteTracking: {
          total: inviteStats.total,
          joined: inviteStats.joined,
          pending: inviteStats.pending
        },
        generatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
  }));
  app2.post("/api/admin/analytics/purge", requireAuth, requireAdmin, wrapAsync(async (req, res) => {
    const { purgeOldAnalyticsEvents: purgeOldAnalyticsEvents2, DATA_RETENTION_POLICY: DATA_RETENTION_POLICY2 } = await Promise.resolve().then(() => (init_analytics(), analytics_exports));
    const retentionDays = Math.max(30, parseInt(req.body.retentionDays) || 90);
    const purged = await purgeOldAnalyticsEvents2(retentionDays);
    return res.json({ purged, retentionDays, policy: DATA_RETENTION_POLICY2 });
  }));
  app2.get("/api/admin/analytics/retention-policy", requireAuth, requireAdmin, wrapAsync(async (_req, res) => {
    const { DATA_RETENTION_POLICY: DATA_RETENTION_POLICY2 } = await Promise.resolve().then(() => (init_analytics(), analytics_exports));
    return res.json({ policy: DATA_RETENTION_POLICY2 });
  }));
  app2.get("/api/admin/analytics/export", requireAuth, requireAdmin, wrapAsync(async (req, res) => {
    const { getPersistedDailyStats: getPersistedDailyStats2, getPersistedEventCounts: getPersistedEventCounts2, getPersistedDailyStatsExtended: getPersistedDailyStatsExtended2 } = await Promise.resolve().then(() => (init_analytics(), analytics_exports));
    const days = Math.min(365, Math.max(1, parseInt(req.query.days) || 90));
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1e3);
    const detailed = req.query.detailed === "true";
    const format = req.query.format || "json";
    if (detailed) {
      const extendedStats = await getPersistedDailyStatsExtended2(days);
      if (format === "csv") {
        const csvHeader = "date,event,count\n";
        const csvRows = extendedStats.map((d) => `${d.date},${d.event},${d.count}`).join("\n");
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename=analytics-detailed-${days}d.csv`);
        return res.send(csvHeader + csvRows);
      }
      return res.json({ data: { days, detailed: true, stats: extendedStats, exportedAt: (/* @__PURE__ */ new Date()).toISOString() } });
    }
    const [dailyStats, eventCounts] = await Promise.all([
      getPersistedDailyStats2(days),
      getPersistedEventCounts2(since)
    ]);
    if (format === "csv") {
      const csvHeader = "date,events\n";
      const csvRows = dailyStats.map((d) => `${d.date},${d.events}`).join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=analytics-export-${days}d.csv`);
      return res.send(csvHeader + csvRows);
    }
    return res.json({ data: { days, dailyStats, eventCounts, exportedAt: (/* @__PURE__ */ new Date()).toISOString() } });
  }));
  app2.get("/api/admin/analytics/launch-metrics", requireAuth, requireAdmin, wrapAsync(async (req, res) => {
    const days = Math.min(30, Math.max(1, parseInt(req.query.days) || 7));
    const daily = getDailyStats(days);
    const funnel = getFunnelStats();
    const beta = getBetaConversionFunnel();
    const active = getActiveUserStats();
    const totalSignups = funnel.signup_completed || 0;
    const totalFirstRatings = funnel.first_rating || 0;
    const totalFifthRatings = funnel.fifth_rating || 0;
    const totalTierUpgrades = funnel.tier_upgrade || 0;
    const activationRate = totalSignups > 0 ? (totalFirstRatings / totalSignups * 100).toFixed(1) + "%" : "N/A";
    const deepEngagementRate = totalFirstRatings > 0 ? (totalFifthRatings / totalFirstRatings * 100).toFixed(1) + "%" : "N/A";
    const tierConversionRate = totalSignups > 0 ? (totalTierUpgrades / totalSignups * 100).toFixed(1) + "%" : "N/A";
    const challengerEntries = funnel.challenger_entered || 0;
    const dashboardSubs = funnel.dashboard_pro_subscribed || 0;
    const featuredPurchases = funnel.featured_purchased || 0;
    const estimatedMRR = challengerEntries * 99 + dashboardSubs * 49 + featuredPurchases * 199;
    return res.json({
      data: {
        period: `${days} days`,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        userMetrics: {
          totalSignups,
          totalFirstRatings,
          totalFifthRatings,
          totalTierUpgrades,
          activationRate,
          deepEngagementRate,
          tierConversionRate
        },
        activeUsers: active,
        revenueMetrics: {
          challengerEntries,
          dashboardSubs,
          featuredPurchases,
          estimatedMRR: `$${estimatedMRR}`,
          breakEvenTarget: "$247/mo",
          breakEvenMet: estimatedMRR >= 247
        },
        betaFunnel: beta,
        dailyTrend: daily
      }
    });
  }));
  app2.post("/api/analytics/dimension-timing", requireAuth, wrapAsync(async (req, res) => {
    const { q1Ms, q2Ms, q3Ms, returnMs, totalMs, visitType } = req.body;
    if (typeof q1Ms !== "number" || typeof q2Ms !== "number" || typeof q3Ms !== "number" || typeof returnMs !== "number") {
      return res.status(400).json({ error: "Invalid timing data" });
    }
    recordDimensionTiming({
      q1Ms: Math.max(0, Math.round(q1Ms)),
      q2Ms: Math.max(0, Math.round(q2Ms)),
      q3Ms: Math.max(0, Math.round(q3Ms)),
      returnMs: Math.max(0, Math.round(returnMs)),
      totalMs: Math.max(0, Math.round(totalMs || q1Ms + q2Ms + q3Ms + returnMs)),
      visitType: String(visitType || "dine_in")
    });
    return res.json({ ok: true });
  }));
  app2.get("/api/admin/analytics/dimension-timing", requireAuth, requireAdmin, wrapAsync(async (_req, res) => {
    return res.json({ data: getDimensionTimingAggregates() });
  }));
}

// server/request-logger.ts
var requestLogs = [];
function getRequestLogs(limit) {
  if (limit && limit > 0) {
    return requestLogs.slice(-limit);
  }
  return [...requestLogs];
}

// lib/error-reporting.ts
var errorBuffer = [];
function getRecentErrors(limit = 20) {
  return errorBuffer.slice(-limit);
}

// lib/feature-flags.ts
var flagStore = /* @__PURE__ */ new Map();
var defaultFlags = [
  { name: "dark_mode", enabled: true, description: "Dark mode theme support" },
  { name: "i18n", enabled: false, description: "Internationalization support" },
  { name: "offline_sync", enabled: false, description: "Offline data synchronization" },
  { name: "social_sharing", enabled: false, description: "Social sharing integration" }
];
for (const flag of defaultFlags) {
  flagStore.set(flag.name, {
    name: flag.name,
    enabled: flag.enabled,
    description: flag.description,
    createdAt: Date.now()
  });
}
function getAllFlags() {
  return Array.from(flagStore.values());
}

// lib/data.ts
init_credibility();
init_credibility();
var CATEGORY_CONFIDENCE_THRESHOLDS = {
  fast_food: { provisional: 3, early: 8, established: 20 },
  casual_dining: { provisional: 3, early: 8, established: 20 },
  buffet: { provisional: 3, early: 8, established: 20 },
  street_food: { provisional: 3, early: 8, established: 20 },
  ice_cream: { provisional: 3, early: 8, established: 20 },
  restaurant: { provisional: 3, early: 10, established: 25 },
  cafe: { provisional: 3, early: 10, established: 25 },
  brunch: { provisional: 3, early: 10, established: 25 },
  bar: { provisional: 3, early: 10, established: 25 },
  bakery: { provisional: 3, early: 10, established: 25 },
  bubble_tea: { provisional: 3, early: 10, established: 25 },
  fine_dining: { provisional: 5, early: 15, established: 35 },
  brewery: { provisional: 5, early: 12, established: 30 },
  dessert_bar: { provisional: 3, early: 12, established: 30 },
  food_hall: { provisional: 5, early: 12, established: 30 }
};
var DEFAULT_THRESHOLDS = { provisional: 3, early: 10, established: 25 };

// server/rate-limiter.ts
init_logger();
var rlLog = log.tag("RateLimiter");
var MemoryStore = class {
  windows = /* @__PURE__ */ new Map();
  cleanupTimer;
  constructor() {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [key2, entry] of this.windows) {
        if (now > entry.resetAt) this.windows.delete(key2);
      }
    }, 6e4);
  }
  async increment(key2, windowMs) {
    const now = Date.now();
    let entry = this.windows.get(key2);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      this.windows.set(key2, entry);
    }
    entry.count++;
    return { count: entry.count, resetAt: entry.resetAt };
  }
  cleanup() {
    clearInterval(this.cleanupTimer);
  }
};
var RedisStore = class {
  constructor(redisClient) {
    this.redisClient = redisClient;
  }
  async increment(key2, windowMs) {
    const redisKey = `rl:${key2}`;
    const count15 = await this.redisClient.incr(redisKey);
    if (count15 === 1) await this.redisClient.pexpire(redisKey, windowMs);
    const ttl = await this.redisClient.pttl(redisKey);
    return { count: count15, resetAt: Date.now() + Math.max(ttl, 0) };
  }
};
function createDefaultStore() {
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    try {
      const Redis2 = __require("ioredis");
      const client = new Redis2(redisUrl, { maxRetriesPerRequest: 1, connectTimeout: 3e3, lazyConnect: true });
      client.connect().catch(() => {
      });
      rlLog.info("Using Redis rate-limit store");
      return new RedisStore(client);
    } catch {
      rlLog.info("Redis unavailable \u2014 falling back to memory rate-limit store");
    }
  }
  return new MemoryStore();
}
var defaultStore = createDefaultStore();
var DEFAULT_OPTIONS = {
  windowMs: 6e4,
  // 1 minute
  maxRequests: 100
  // 100 requests per minute
};
function rateLimiter(options = {}) {
  const { windowMs, maxRequests } = { ...DEFAULT_OPTIONS, ...options };
  const store3 = options.store || defaultStore;
  const keyPrefix = options.keyPrefix || "global";
  return (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const key2 = `${keyPrefix}:${ip}`;
    const now = Date.now();
    store3.increment(key2, windowMs).then(({ count: count15, resetAt }) => {
      res.setHeader("X-RateLimit-Limit", String(maxRequests));
      res.setHeader("X-RateLimit-Remaining", String(Math.max(0, maxRequests - count15)));
      res.setHeader("X-RateLimit-Reset", String(Math.ceil(resetAt / 1e3)));
      if (count15 > maxRequests) {
        rlLog.warn(`Rate limit exceeded for ${ip}: ${count15}/${maxRequests}`);
        return res.status(429).json({
          error: "Too many requests. Please try again later.",
          retryAfter: Math.ceil((resetAt - now) / 1e3)
        });
      }
      next();
    }).catch((err) => {
      rlLog.warn(`Rate limit store error: ${err}`);
      next();
    });
  };
}
var authRateLimiter = rateLimiter({ windowMs: 6e4, maxRequests: 10, keyPrefix: "auth" });
var apiRateLimiter = rateLimiter({ windowMs: 6e4, maxRequests: 100, keyPrefix: "api" });
var paymentRateLimiter = rateLimiter({ windowMs: 6e4, maxRequests: 20, keyPrefix: "payments" });
var adminRateLimiter = rateLimiter({ windowMs: 6e4, maxRequests: 30, keyPrefix: "admin" });

// server/routes-admin.ts
init_tier_staleness();

// server/city-engagement.ts
init_logger();
init_db();
init_schema();
init_city_config();
import { sql as sql12, eq as eq19, count as count14 } from "drizzle-orm";
var engLog = log.tag("CityEngagement");
async function getCityEngagement(city) {
  engLog.debug(`Fetching engagement for city: ${city}`);
  const [memberResult] = await db.select({ total: count14() }).from(members).where(eq19(members.city, city));
  const totalMembers = memberResult?.total ?? 0;
  const [bizResult] = await db.select({ total: count14() }).from(businesses).where(eq19(businesses.city, city));
  const totalBusinesses = bizResult?.total ?? 0;
  const ratingsResult = await db.execute(sql12`
    SELECT COUNT(r.id)::int AS total
    FROM ratings r
    JOIN businesses b ON r.business_id = b.id
    WHERE b.city = ${city}
  `);
  const totalRatings = ratingsResult.rows[0]?.total ?? 0;
  const avgRatingsPerMember = totalMembers > 0 ? Math.round(totalRatings / totalMembers * 100) / 100 : 0;
  const categoryResult = await db.select({ category: businesses.category, total: count14() }).from(businesses).where(eq19(businesses.city, city)).groupBy(businesses.category).orderBy(sql12`count(*) DESC`).limit(1);
  const topCategory = categoryResult[0]?.category ?? "N/A";
  engLog.info(`City engagement for ${city}: ${totalMembers} members, ${totalBusinesses} businesses, ${totalRatings} ratings`);
  return {
    city,
    totalMembers,
    totalBusinesses,
    totalRatings,
    avgRatingsPerMember,
    topCategory
  };
}
async function getAllCityEngagement() {
  const activeCities = getActiveCities();
  const betaCities = getBetaCities();
  const allCities = [...activeCities, ...betaCities];
  engLog.info(`Fetching engagement for ${allCities.length} cities (${activeCities.length} active, ${betaCities.length} beta)`);
  const results = await Promise.all(allCities.map((city) => getCityEngagement(city)));
  results.sort((a, b) => b.totalMembers - a.totalMembers);
  return results;
}

// server/routes-admin.ts
function requireAdmin2(req, res, next) {
  if (!isAdminEmail(req.user?.email)) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}
function registerAdminRoutes(app2) {
  app2.use("/api/admin", adminRateLimiter);
  app2.patch("/api/admin/category-suggestions/:id", requireAuth, requireAdmin2, wrapAsync(async (req, res) => {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Status must be 'approved' or 'rejected'" });
    }
    const { reviewSuggestion: reviewSuggestion2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const updated = await reviewSuggestion2(req.params.id, status, req.user.id);
    if (!updated) {
      return res.status(404).json({ error: "Suggestion not found" });
    }
    return res.json({ data: updated });
  }));
  app2.post("/api/admin/seed-cities", requireAuth, requireAdmin2, wrapAsync(async (req, res) => {
    const { seedCities: seedCities2 } = await Promise.resolve().then(() => (init_seed_cities(), seed_cities_exports));
    await seedCities2();
    return res.json({ data: { message: "Cities seeded successfully" } });
  }));
  app2.post("/api/admin/fetch-photos", requireAuth, requireAdmin2, wrapAsync(async (req, res) => {
    const city = sanitizeString(req.body.city, 100) || void 0;
    const limit = Math.min(50, parseInt(req.body.limit) || 20);
    const businesses2 = await getBusinessesWithoutPhotos(city, limit);
    if (businesses2.length === 0) {
      return res.json({ data: { message: "All businesses already have photos", fetched: 0 } });
    }
    let totalFetched = 0;
    const results = [];
    for (const biz of businesses2) {
      const count15 = await fetchAndStorePhotos(biz.id, biz.googlePlaceId);
      totalFetched += count15;
      results.push({ name: biz.name, photos: count15 });
    }
    return res.json({
      data: {
        message: `Fetched photos for ${businesses2.length} businesses`,
        fetched: totalFetched,
        results
      }
    });
  }));
  app2.post("/api/admin/import-restaurants", requireAuth, requireAdmin2, wrapAsync(async (req, res) => {
    const city = sanitizeString(req.body.city, 100);
    const category = sanitizeString(req.body.category, 50) || "restaurant";
    if (!city) {
      return res.status(400).json({ error: "City is required" });
    }
    const places = await searchNearbyRestaurants(city, category, 20);
    if (places.length === 0) {
      return res.json({ data: { message: "No places found from Google Places", imported: 0, skipped: 0 } });
    }
    const importData = places.map((p) => ({
      placeId: p.placeId,
      name: p.name,
      address: p.address,
      city,
      category: normalizeCategory(p.types),
      lat: p.lat,
      lng: p.lng,
      googleRating: p.rating,
      priceRange: p.priceLevel || "$$"
    }));
    const { bulkImportBusinesses: bulkImportBusinesses2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const result = await bulkImportBusinesses2(importData);
    let photosFetched = 0;
    for (const r of result.results) {
      if (r.status === "imported") {
        const place = importData.find((p) => p.name === r.name);
        if (place) {
          try {
            const count15 = await fetchAndStorePhotos(place.placeId, place.placeId);
            photosFetched += count15;
          } catch {
          }
        }
      }
    }
    return res.json({
      data: {
        message: `Imported ${result.imported} restaurants, skipped ${result.skipped}`,
        imported: result.imported,
        skipped: result.skipped,
        photosFetched,
        results: result.results
      }
    });
  }));
  app2.get("/api/admin/import-stats", requireAuth, requireAdmin2, wrapAsync(async (req, res) => {
    const { getImportStats: getImportStats2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const stats2 = await getImportStats2();
    return res.json({ data: stats2 });
  }));
  app2.get("/api/admin/claims", requireAuth, requireAdmin2, wrapAsync(async (req, res) => {
    const data = await getPendingClaims();
    return res.json({ data });
  }));
  app2.patch("/api/admin/claims/:id", requireAuth, requireAdmin2, wrapAsync(async (req, res) => {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Status must be 'approved' or 'rejected'" });
    }
    const updated = await reviewClaim(req.params.id, status, req.user.id);
    if (!updated) return res.status(404).json({ error: "Claim not found" });
    if (updated.memberId && updated.businessId) {
      const { getMemberById: getMemberById2, getBusinessById: getBusinessById2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      const [member, business] = await Promise.all([
        getMemberById2(updated.memberId),
        getBusinessById2(updated.businessId)
      ]);
      if (member?.email && business) {
        const { sendClaimApprovedEmail: sendClaimApprovedEmail2, sendClaimRejectedEmail: sendClaimRejectedEmail2 } = await Promise.resolve().then(() => (init_email(), email_exports));
        if (status === "approved") {
          sendClaimApprovedEmail2({
            email: member.email,
            displayName: member.displayName || "User",
            businessName: business.name,
            businessSlug: business.slug || business.id
          }).catch(() => {
          });
        } else {
          sendClaimRejectedEmail2({
            email: member.email,
            displayName: member.displayName || "User",
            businessName: business.name
          }).catch(() => {
          });
        }
      }
      if (member?.pushToken) {
        const { sendPushNotification: sendPushNotification3 } = await Promise.resolve().then(() => (init_push(), push_exports));
        if (status === "approved") {
          sendPushNotification3(
            [member.pushToken],
            `Claim approved: ${business?.name}`,
            "You're now the verified owner. Access your dashboard to see analytics.",
            { screen: "business" }
          ).catch(() => {
          });
        } else {
          sendPushNotification3(
            [member.pushToken],
            `Claim update: ${business?.name}`,
            "Your claim could not be verified. Contact support for next steps.",
            { screen: "profile" }
          ).catch(() => {
          });
        }
      }
    }
    return res.json({ data: updated });
  }));
  app2.get("/api/admin/claims/count", requireAuth, requireAdmin2, wrapAsync(async (req, res) => {
    const count15 = await getClaimCount();
    return res.json({ data: { count: count15 } });
  }));
  app2.get("/api/admin/flags", requireAuth, requireAdmin2, wrapAsync(async (req, res) => {
    const data = await getPendingFlags();
    return res.json({ data });
  }));
  app2.patch("/api/admin/flags/:id", requireAuth, requireAdmin2, wrapAsync(async (req, res) => {
    const { status } = req.body;
    if (!["confirmed", "dismissed"].includes(status)) {
      return res.status(400).json({ error: "Status must be 'confirmed' or 'dismissed'" });
    }
    const updated = await reviewFlag(req.params.id, status, req.user.id);
    if (!updated) return res.status(404).json({ error: "Flag not found" });
    return res.json({ data: updated });
  }));
  app2.get("/api/admin/flags/count", requireAuth, requireAdmin2, wrapAsync(async (req, res) => {
    const count15 = await getFlagCount();
    return res.json({ data: { count: count15 } });
  }));
  app2.get("/api/admin/members", requireAuth, requireAdmin2, wrapAsync(async (req, res) => {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const data = await getAdminMemberList(limit);
    const freshData = data.map((m) => ({
      ...m,
      credibilityTier: checkAndRefreshTier(m.credibilityTier, m.credibilityScore)
    }));
    return res.json({ data: freshData });
  }));
  app2.get("/api/admin/members/count", requireAuth, requireAdmin2, wrapAsync(async (req, res) => {
    const count15 = await getMemberCount();
    return res.json({ data: { count: count15 } });
  }));
  app2.get("/api/admin/webhooks", requireAuth, requireAdmin2, wrapAsync(async (req, res) => {
    const source = sanitizeString(req.query.source, 50) || "stripe";
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const events3 = await getRecentWebhookEvents(source, limit);
    return res.json({ data: events3 });
  }));
  app2.post("/api/admin/webhooks/:id/replay", requireAuth, requireAdmin2, wrapAsync(async (req, res) => {
    const event = await getWebhookEventById(req.params.id);
    if (!event) return res.status(404).json({ error: "Webhook event not found" });
    const { processStripeEvent: processStripeEvent2 } = await Promise.resolve().then(() => (init_stripe_webhook(), stripe_webhook_exports));
    if (event.source === "stripe" && event.payload) {
      await processStripeEvent2(event.payload);
      await markWebhookProcessed(event.id);
      return res.json({ data: { id: event.id, replayed: true } });
    }
    return res.status(400).json({ error: `Unsupported webhook source: ${event.source}` });
  }));
  app2.get("/api/admin/perf", requireAuth, requireAdmin2, wrapAsync(async (_req, res) => {
    const { getCacheStats: getCacheStats2 } = await Promise.resolve().then(() => (init_redis(), redis_exports));
    const { getErrorStats: getErrorStats2 } = await Promise.resolve().then(() => (init_error_tracking(), error_tracking_exports));
    const data = {
      ...getPerfStats(),
      cache: getCacheStats2(),
      errors: getErrorStats2()
    };
    return res.json({ data });
  }));
  app2.get("/api/admin/perf/validate", requireAuth, requireAdmin2, wrapAsync(async (_req, res) => {
    const validation = getPerformanceValidation();
    return res.json({ data: validation });
  }));
  app2.get("/api/admin/analytics/active-users-db", requireAuth, requireAdmin2, wrapAsync(async (_req, res) => {
    const { getActiveUserStatsDb: getActiveUserStatsDb2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const stats2 = await getActiveUserStatsDb2();
    return res.json({ data: stats2 });
  }));
  app2.get("/api/admin/city-engagement", requireAuth, requireAdmin2, wrapAsync(async (req, res) => {
    const city = req.query.city;
    if (city) {
      const engagement = await getCityEngagement(city);
      return res.json({ data: engagement });
    }
    const all = await getAllCityEngagement();
    return res.json({ data: all });
  }));
  app2.get("/api/admin/errors", requireAuth, requireAdmin2, wrapAsync(async (req, res) => {
    const { getRecentServerErrors: getRecentServerErrors2 } = await Promise.resolve().then(() => (init_error_tracking(), error_tracking_exports));
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const data = getRecentServerErrors2(limit);
    return res.json({ data });
  }));
  app2.get("/api/admin/revenue", requireAuth, requireAdmin2, wrapAsync(async (req, res) => {
    const { getRevenueMetrics: getRevenueMetrics2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const metrics = await getRevenueMetrics2();
    return res.json({ data: metrics });
  }));
  registerAdminAnalyticsRoutes(app2);
  app2.get("/api/admin/feedback", requireAuth, requireAdmin2, wrapAsync(async (req, res) => {
    const { getRecentFeedback: getRecentFeedback2, getFeedbackStats: getFeedbackStats2 } = await Promise.resolve().then(() => (init_feedback(), feedback_exports));
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const [recent, stats2] = await Promise.all([
      getRecentFeedback2(limit),
      getFeedbackStats2()
    ]);
    return res.json({ data: { recent, stats: stats2 } });
  }));
  app2.get("/api/admin/moderation-queue", requireAuth, requireAdmin2, wrapAsync(async (req, res) => {
    const { getAutoFlaggedRatings: getAutoFlaggedRatings2 } = await Promise.resolve().then(() => (init_ratings(), ratings_exports));
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const perPage = Math.min(50, Math.max(1, parseInt(req.query.perPage) || 20));
    const result = await getAutoFlaggedRatings2(page, perPage);
    return res.json({
      data: result.ratings,
      pagination: { page, perPage, total: result.total, totalPages: Math.ceil(result.total / perPage) }
    });
  }));
  app2.patch("/api/admin/moderation/:id", requireAuth, requireAdmin2, wrapAsync(async (req, res) => {
    const { reviewAutoFlaggedRating: reviewAutoFlaggedRating2 } = await Promise.resolve().then(() => (init_ratings(), ratings_exports));
    const action = req.body.action;
    if (action !== "confirm" && action !== "dismiss") {
      return res.status(400).json({ error: "action must be 'confirm' or 'dismiss'" });
    }
    await reviewAutoFlaggedRating2(req.params.id, action, req.user.id);
    return res.json({ data: { reviewed: true, action } });
  }));
  app2.get("/api/admin/rate-gate-stats", requireAuth, requireAdmin2, wrapAsync(async (_req, res) => {
    const stats2 = getRateGateStats();
    return res.json({ data: stats2 });
  }));
  app2.get("/api/admin/metrics", requireAuth, requireAdmin2, wrapAsync(async (_req, res) => {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage().heapUsed;
    const nodeVersion = process.version;
    const requestCount = getRequestLogs().length;
    const errorCount = getRecentErrors().length;
    return res.json({
      data: {
        uptime: Math.floor(uptime),
        memoryUsage,
        nodeVersion,
        requestCount,
        errorCount
      }
    });
  }));
  app2.get("/api/admin/health/detailed", requireAuth, requireAdmin2, wrapAsync(async (_req, res) => {
    const mem = process.memoryUsage();
    const cpu = process.cpuUsage();
    const flags = getAllFlags();
    return res.json({
      data: {
        uptime: Math.floor(process.uptime()),
        memory: {
          heapUsed: mem.heapUsed,
          heapTotal: mem.heapTotal,
          rss: mem.rss
        },
        nodeVersion: process.version,
        platform: process.platform,
        cpuUsage: {
          user: cpu.user,
          system: cpu.system
        },
        activeConnections: 0,
        featureFlags: flags,
        prerenderCache: (() => {
          try {
            const { getPrerenderCacheStats: getPrerenderCacheStats2 } = (init_prerender(), __toCommonJS(prerender_exports));
            return getPrerenderCacheStats2();
          } catch {
            return null;
          }
        })(),
        generatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
  }));
  app2.get("/api/admin/confidence-thresholds", requireAuth, requireAdmin2, wrapAsync(async (_req, res) => {
    return res.json({
      data: {
        thresholds: CATEGORY_CONFIDENCE_THRESHOLDS,
        defaults: DEFAULT_THRESHOLDS
      }
    });
  }));
  app2.get("/api/admin/revenue/monthly", requireAuth, requireAdmin2, wrapAsync(async (req, res) => {
    const months = Math.min(24, Math.max(1, parseInt(req.query.months) || 6));
    const { getRevenueByMonth: getRevenueByMonth2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const data = await getRevenueByMonth2(months);
    return res.json({ data });
  }));
  app2.post("/api/admin/beta-invite", requireAuth, requireAdmin2, wrapAsync(async (req, res) => {
    const { sendBetaInviteEmail: sendBetaInviteEmail2 } = await Promise.resolve().then(() => (init_email(), email_exports));
    const { getMemberByEmail: getMemberByEmail2, createBetaInvite: createBetaInvite2, getBetaInviteByEmail: getBetaInviteByEmail2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const email = sanitizeString(req.body.email, 254);
    const displayName = sanitizeString(req.body.displayName, 100);
    const referralCode = sanitizeString(req.body.referralCode || "", 50) || "BETA25";
    if (!email || !displayName) {
      return res.status(400).json({ error: "email and displayName are required" });
    }
    const existing = await getMemberByEmail2(email);
    if (existing) {
      return res.status(409).json({ error: "User already has an account" });
    }
    const existingInvite = await getBetaInviteByEmail2(email);
    if (existingInvite) {
      return res.status(409).json({ error: "Invite already sent to this email" });
    }
    await sendBetaInviteEmail2({
      email,
      displayName,
      referralCode,
      invitedBy: req.body.invitedBy ? sanitizeString(req.body.invitedBy, 100) : void 0
    });
    await createBetaInvite2({ email, displayName, referralCode, invitedBy: req.user?.email });
    const { trackEvent: trackEvent2 } = await Promise.resolve().then(() => (init_analytics2(), analytics_exports2));
    trackEvent2("beta_invite_sent", req.user?.id, { email });
    return res.json({ data: { sent: true, email } });
  }));
  app2.get("/api/admin/beta-invites", requireAuth, requireAdmin2, wrapAsync(async (_req, res) => {
    const { getBetaInviteStats: getBetaInviteStats2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const stats2 = await getBetaInviteStats2();
    return res.json({ data: stats2 });
  }));
  app2.get("/api/admin/alerts", requireAuth, requireAdmin2, wrapAsync(async (req, res) => {
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const alerts2 = getRecentAlerts(limit);
    const stats2 = getAlertStats();
    const rules = getAlertRules();
    return res.json({ data: { alerts: alerts2, stats: stats2, rules } });
  }));
  app2.post("/api/admin/alerts/:id/acknowledge", requireAuth, requireAdmin2, wrapAsync(async (req, res) => {
    const result = acknowledgeAlert(req.params.id);
    if (!result) {
      return res.status(404).json({ error: "Alert not found" });
    }
    return res.json({ data: { acknowledged: true } });
  }));
  app2.post("/api/admin/beta-invite/batch", requireAuth, requireAdmin2, wrapAsync(async (req, res) => {
    const { sendBetaInviteEmail: sendBetaInviteEmail2 } = await Promise.resolve().then(() => (init_email(), email_exports));
    const { getMemberByEmail: getMemberByEmail2, createBetaInvite: createBetaInvite2, getBetaInviteByEmail: getBetaInviteByEmail2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const invites = req.body.invites;
    if (!Array.isArray(invites) || invites.length === 0 || invites.length > 100) {
      return res.status(400).json({ error: "invites must be an array of 1-100 entries" });
    }
    const results = [];
    for (const invite of invites) {
      const email = sanitizeString(invite.email, 254);
      const displayName = sanitizeString(invite.displayName, 100);
      const referralCode = sanitizeString(invite.referralCode || "", 50) || "BETA25";
      if (!email || !displayName) {
        results.push({ email: email || "unknown", status: "skipped", reason: "missing fields" });
        continue;
      }
      const existing = await getMemberByEmail2(email);
      if (existing) {
        results.push({ email, status: "skipped", reason: "already registered" });
        continue;
      }
      const existingInvite = await getBetaInviteByEmail2(email);
      if (existingInvite) {
        results.push({ email, status: "skipped", reason: "already invited" });
        continue;
      }
      await sendBetaInviteEmail2({ email, displayName, referralCode });
      await createBetaInvite2({ email, displayName, referralCode, invitedBy: req.user?.email });
      results.push({ email, status: "sent" });
    }
    const sent = results.filter((r) => r.status === "sent").length;
    return res.json({ data: { total: invites.length, sent, skipped: invites.length - sent, results } });
  }));
  app2.get("/api/admin/eligibility", requireAuth, wrapAsync(async (req, res) => {
    if (!isAdminEmail(req.user?.email)) return res.status(403).json({ error: "Admin only" });
    const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { businesses: businesses2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq29, asc: asc3 } = await import("drizzle-orm");
    const allBusinesses = await db2.select({
      id: businesses2.id,
      name: businesses2.name,
      city: businesses2.city,
      category: businesses2.category,
      totalRatings: businesses2.totalRatings,
      dineInCount: businesses2.dineInCount,
      credibilityWeightedSum: businesses2.credibilityWeightedSum,
      leaderboardEligible: businesses2.leaderboardEligible,
      weightedScore: businesses2.weightedScore
    }).from(businesses2).where(eq29(businesses2.isActive, true)).orderBy(asc3(businesses2.leaderboardEligible));
    const eligible = allBusinesses.filter((b) => b.leaderboardEligible);
    const ineligible = allBusinesses.filter((b) => !b.leaderboardEligible);
    const nearEligible = ineligible.filter(
      (b) => b.totalRatings >= 2 || parseFloat(b.credibilityWeightedSum) >= 0.3
    );
    return res.json({
      data: {
        totalActive: allBusinesses.length,
        eligible: eligible.length,
        ineligible: ineligible.length,
        nearEligible: nearEligible.length,
        nearEligibleBusinesses: nearEligible.map((b) => ({
          id: b.id,
          name: b.name,
          city: b.city,
          category: b.category,
          totalRatings: b.totalRatings,
          dineInCount: b.dineInCount,
          credibilityWeightedSum: parseFloat(b.credibilityWeightedSum),
          missingRequirements: [
            b.totalRatings < 3 ? `Need ${3 - b.totalRatings} more raters` : null,
            b.dineInCount < 1 ? "Need 1+ dine-in rating" : null,
            parseFloat(b.credibilityWeightedSum) < 0.5 ? `Credibility sum ${parseFloat(b.credibilityWeightedSum).toFixed(2)} < 0.50` : null
          ].filter(Boolean)
        }))
      }
    });
  }));
}

// server/routes-payments.ts
init_storage();
init_email();

// server/sse.ts
var clients = /* @__PURE__ */ new Set();
function addClient(res) {
  clients.add(res);
  res.on("close", () => {
    clients.delete(res);
  });
}
function broadcast(type, payload = {}) {
  const event = { type, payload, timestamp: Date.now() };
  const data = `data: ${JSON.stringify(event)}

`;
  for (const client of clients) {
    try {
      client.write(data);
    } catch {
      clients.delete(client);
    }
  }
}

// server/routes-payments.ts
init_logger();
function registerPaymentRoutes(app2) {
  app2.use("/api/payments", paymentRateLimiter);
  app2.post("/api/payments/challenger", requireAuth, wrapAsync(async (req, res) => {
    const businessName = sanitizeString(req.body.businessName, 100);
    const slug = sanitizeSlug(req.body.slug);
    if (!businessName || !slug) {
      return res.status(400).json({ error: "businessName and slug are required" });
    }
    const business = await getBusinessBySlug(slug);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }
    const { createChallengerPayment: createChallengerPayment2 } = await Promise.resolve().then(() => (init_payments2(), payments_exports));
    const payment = await createChallengerPayment2({
      challengerId: business.id,
      businessName,
      customerEmail: req.user.email || "",
      userId: req.user.id
    });
    await createPaymentRecord({
      memberId: req.user.id,
      businessId: business.id,
      type: "challenger_entry",
      amount: payment.amount,
      stripePaymentIntentId: payment.id,
      status: payment.status,
      metadata: payment.metadata
    });
    sendPaymentReceiptEmail({
      email: req.user.email || "",
      displayName: req.user.displayName || "Member",
      type: "challenger_entry",
      amount: payment.amount,
      businessName,
      paymentId: payment.id
    }).catch(() => {
    });
    return res.json({ data: payment });
  }));
  app2.post("/api/payments/dashboard-pro", requireAuth, wrapAsync(async (req, res) => {
    const slug = sanitizeSlug(req.body.slug);
    if (!slug) {
      return res.status(400).json({ error: "slug is required" });
    }
    const business = await getBusinessBySlug(slug);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }
    if (business.ownerId !== req.user.id) {
      return res.status(403).json({ error: "Only the business owner can subscribe" });
    }
    if (business.subscriptionStatus === "active") {
      return res.status(409).json({ error: "Business already has an active subscription" });
    }
    const { createDashboardProSubscription: createDashboardProSubscription2 } = await Promise.resolve().then(() => (init_payments2(), payments_exports));
    const siteUrl = process.env.SITE_URL || "https://topranker.com";
    const checkout = await createDashboardProSubscription2({
      businessId: business.id,
      businessName: business.name,
      customerEmail: req.user.email || "",
      userId: req.user.id,
      stripeCustomerId: business.stripeCustomerId || void 0,
      successUrl: `${siteUrl}/business/${slug}/dashboard?subscription=success`,
      cancelUrl: `${siteUrl}/business/${slug}/dashboard?subscription=cancelled`
    });
    await createPaymentRecord({
      memberId: req.user.id,
      businessId: business.id,
      type: "dashboard_pro",
      amount: 4900,
      // $49 — actual charge happens via Stripe webhook
      stripePaymentIntentId: checkout.id,
      status: checkout.status === "succeeded" ? "succeeded" : "pending",
      metadata: { checkoutSessionId: checkout.id }
    });
    if (!checkout.url) {
      const { updateBusinessSubscription: updateBusinessSubscription2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      await updateBusinessSubscription2(business.id, {
        subscriptionStatus: "active",
        stripeCustomerId: `mock_cus_${Date.now()}`,
        stripeSubscriptionId: `mock_sub_${Date.now()}`,
        subscriptionPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3)
      });
    }
    return res.json({ data: { id: checkout.id, url: checkout.url, status: checkout.status } });
  }));
  app2.get("/api/payments/subscription-status/:slug", requireAuth, wrapAsync(async (req, res) => {
    const business = await getBusinessBySlug(req.params.slug);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }
    return res.json({
      data: {
        subscriptionStatus: business.subscriptionStatus || "none",
        subscriptionPeriodEnd: business.subscriptionPeriodEnd,
        isActive: business.subscriptionStatus === "active" || business.subscriptionStatus === "trialing"
      }
    });
  }));
  app2.post("/api/payments/subscription-cancel/:slug", requireAuth, wrapAsync(async (req, res) => {
    const business = await getBusinessBySlug(req.params.slug);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }
    if (business.ownerId !== req.user.id) {
      return res.status(403).json({ error: "Only the business owner can cancel" });
    }
    if (!business.stripeSubscriptionId) {
      return res.status(400).json({ error: "No active subscription to cancel" });
    }
    const { cancelSubscription: cancelSubscription2 } = await Promise.resolve().then(() => (init_payments2(), payments_exports));
    await cancelSubscription2(business.stripeSubscriptionId);
    const { updateBusinessSubscription: updateBusinessSubscription2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    await updateBusinessSubscription2(business.id, { subscriptionStatus: "cancelled" });
    log.info(`Subscription cancelled: business=${business.id} by user=${req.user.id}`);
    return res.json({ data: { cancelled: true } });
  }));
  app2.post("/api/payments/featured", requireAuth, wrapAsync(async (req, res) => {
    const slug = sanitizeSlug(req.body.slug);
    if (!slug) {
      return res.status(400).json({ error: "slug is required" });
    }
    const business = await getBusinessBySlug(slug);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }
    const { createFeaturedPlacementPayment: createFeaturedPlacementPayment2 } = await Promise.resolve().then(() => (init_payments2(), payments_exports));
    const payment = await createFeaturedPlacementPayment2({
      businessId: business.id,
      businessName: business.name,
      city: business.city,
      customerEmail: req.user.email || "",
      userId: req.user.id
    });
    const paymentRecord = await createPaymentRecord({
      memberId: req.user.id,
      businessId: business.id,
      type: "featured_placement",
      amount: payment.amount,
      stripePaymentIntentId: payment.id,
      status: payment.status,
      metadata: payment.metadata
    });
    if (payment.status === "succeeded") {
      await createFeaturedPlacement({
        businessId: business.id,
        paymentId: paymentRecord.id,
        city: business.city
      });
      broadcast("featured_updated", { businessId: business.id, city: business.city });
    }
    sendPaymentReceiptEmail({
      email: req.user.email || "",
      displayName: req.user.displayName || "Member",
      type: "featured_placement",
      amount: payment.amount,
      businessName: business.name,
      paymentId: payment.id
    }).catch(() => {
    });
    return res.json({ data: payment });
  }));
  app2.post("/api/payments/cancel", requireAuth, wrapAsync(async (req, res) => {
    const { paymentId } = req.body;
    if (!paymentId) {
      return res.status(400).json({ error: "paymentId is required" });
    }
    const existing = await getPaymentById(paymentId);
    if (!existing) {
      return res.status(404).json({ error: "Payment not found" });
    }
    if (existing.memberId !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to cancel this payment" });
    }
    const updated = await updatePaymentStatus(paymentId, "cancelled");
    if (existing.type === "featured_placement") {
      await expireFeaturedByPayment(paymentId).catch(() => {
      });
      broadcast("featured_updated", { cancelled: true });
    }
    log.info(`Payment ${paymentId} cancelled by ${req.user.id}`);
    return res.json({ data: { id: updated.id, status: "cancelled" } });
  }));
}

// server/routes-badges.ts
init_storage();
function registerBadgeRoutes(app2) {
  app2.get("/api/members/:id/badges", wrapAsync(async (req, res) => {
    const memberId = req.params.id;
    const badges = await getMemberBadges(memberId);
    return res.json({ data: badges });
  }));
  app2.post("/api/badges/award", requireAuth, wrapAsync(async (req, res) => {
    const memberId = req.user.id;
    const { badgeId, badgeFamily } = req.body;
    if (!badgeId || !badgeFamily) {
      return res.status(400).json({ error: "badgeId and badgeFamily are required" });
    }
    const result = await awardBadge(memberId, badgeId, badgeFamily);
    return res.json({ data: result, awarded: result !== null });
  }));
  app2.get("/api/badges/earned", requireAuth, wrapAsync(async (req, res) => {
    const memberId = req.user.id;
    const badgeIds = await getEarnedBadgeIds(memberId);
    const badgeCount = badgeIds.length;
    return res.json({ data: { badgeIds, badgeCount } });
  }));
  app2.get("/api/badges/leaderboard", wrapAsync(async (req, res) => {
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const data = await getBadgeLeaderboard(limit);
    return res.json({ data });
  }));
}

// server/routes-experiments.ts
init_logger();

// shared/hash.ts
function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i) >>> 0;
  }
  return hash;
}

// server/experiment-tracker.ts
init_logger();
var trackerLog = log.tag("ExperimentTracker");
var exposures = [];
var outcomes = [];
function trackExposure(userId, experimentId, variant, context) {
  const existing = exposures.find(
    (e) => e.userId === userId && e.experimentId === experimentId
  );
  if (existing) {
    trackerLog.info(
      `Skipping duplicate exposure: user=${userId} experiment=${experimentId}`
    );
    return;
  }
  const exposure = {
    userId,
    experimentId,
    variant,
    exposedAt: Date.now(),
    context
  };
  exposures.push(exposure);
  trackerLog.info(
    `Exposure recorded: user=${userId} experiment=${experimentId} variant=${variant} context=${context}`
  );
}
function getExposureStats(experimentId) {
  const filtered = exposures.filter((e) => e.experimentId === experimentId);
  if (filtered.length === 0) {
    return {
      total: 0,
      byVariant: {},
      uniqueUsers: 0,
      firstExposure: null,
      lastExposure: null
    };
  }
  const byVariant = {};
  const userSet = /* @__PURE__ */ new Set();
  let firstExposure = Infinity;
  let lastExposure = -Infinity;
  for (const e of filtered) {
    byVariant[e.variant] = (byVariant[e.variant] || 0) + 1;
    userSet.add(e.userId);
    if (e.exposedAt < firstExposure) firstExposure = e.exposedAt;
    if (e.exposedAt > lastExposure) lastExposure = e.exposedAt;
  }
  return {
    total: filtered.length,
    byVariant,
    uniqueUsers: userSet.size,
    firstExposure,
    lastExposure
  };
}
function trackOutcome(userId, experimentId, action, value) {
  const exposure = exposures.find(
    (e) => e.userId === userId && e.experimentId === experimentId
  );
  if (!exposure) {
    trackerLog.info(
      `No exposure found for user=${userId} experiment=${experimentId}, skipping outcome`
    );
    return;
  }
  const outcome = {
    userId,
    experimentId,
    variant: exposure.variant,
    action,
    value,
    recordedAt: Date.now()
  };
  outcomes.push(outcome);
  trackerLog.info(
    `Outcome recorded: user=${userId} experiment=${experimentId} variant=${exposure.variant} action=${action}`
  );
}
function getOutcomeStats(experimentId) {
  const filteredOutcomes = outcomes.filter((o) => o.experimentId === experimentId);
  const filteredExposures = exposures.filter((e) => e.experimentId === experimentId);
  const byAction = {};
  const byVariant = {};
  for (const o of filteredOutcomes) {
    byAction[o.action] = (byAction[o.action] || 0) + 1;
    if (!byVariant[o.variant]) {
      byVariant[o.variant] = { total: 0, byAction: {}, uniqueUsers: /* @__PURE__ */ new Set() };
    }
    byVariant[o.variant].total += 1;
    byVariant[o.variant].byAction[o.action] = (byVariant[o.variant].byAction[o.action] || 0) + 1;
    byVariant[o.variant].uniqueUsers.add(o.userId);
  }
  const byVariantSerialized = {};
  for (const [variant, data] of Object.entries(byVariant)) {
    byVariantSerialized[variant] = {
      total: data.total,
      byAction: data.byAction,
      uniqueUsers: data.uniqueUsers.size
    };
  }
  const conversionRates = {};
  const allActions = Object.keys(byAction);
  for (const variant of Object.keys(byVariant)) {
    const variantExposureCount = filteredExposures.filter((e) => e.variant === variant).length;
    if (variantExposureCount === 0) continue;
    conversionRates[variant] = allActions.map((action) => ({
      variant,
      action,
      rate: (byVariant[variant].byAction[action] || 0) / variantExposureCount * 100
    }));
  }
  return {
    total: filteredOutcomes.length,
    byAction,
    byVariant: byVariantSerialized,
    conversionRates
  };
}
function getUserExperiments(userId) {
  return exposures.filter((e) => e.userId === userId).map((e) => e.experimentId);
}
function wilsonScore(successes, total, z2 = 1.96) {
  if (total === 0) return { lower: 0, upper: 0, center: 0 };
  const p = successes / total;
  const denominator = 1 + z2 * z2 / total;
  const center = (p + z2 * z2 / (2 * total)) / denominator;
  const margin = z2 * Math.sqrt(p * (1 - p) / total + z2 * z2 / (4 * total * total)) / denominator;
  return {
    lower: Math.max(0, center - margin),
    upper: Math.min(1, center + margin),
    center
  };
}
function computeExperimentDashboard(experimentId) {
  const expStats = getExposureStats(experimentId);
  const filteredExposures = exposures.filter((e) => e.experimentId === experimentId);
  const filteredOutcomes = outcomes.filter((o) => o.experimentId === experimentId);
  const variantMap = /* @__PURE__ */ new Map();
  for (const e of filteredExposures) {
    if (!variantMap.has(e.variant)) {
      variantMap.set(e.variant, { exposures: 0, outcomes: 0, byAction: {} });
    }
    variantMap.get(e.variant).exposures += 1;
  }
  for (const o of filteredOutcomes) {
    if (!variantMap.has(o.variant)) {
      variantMap.set(o.variant, { exposures: 0, outcomes: 0, byAction: {} });
    }
    const v = variantMap.get(o.variant);
    v.outcomes += 1;
    v.byAction[o.action] = (v.byAction[o.action] || 0) + 1;
  }
  const variants = [];
  for (const [variant, data] of variantMap.entries()) {
    const ci = wilsonScore(data.outcomes, data.exposures);
    variants.push({
      variant,
      exposures: data.exposures,
      outcomes: data.outcomes,
      conversionRate: data.exposures > 0 ? data.outcomes / data.exposures * 100 : 0,
      confidence: ci,
      byAction: data.byAction
    });
  }
  const totalExposures = expStats.total;
  let confidence = "sufficient_data";
  let recommendation = "inconclusive";
  if (totalExposures < 100) {
    confidence = "insufficient_data";
    recommendation = "insufficient_data";
  } else {
    const controlVariant = variants.find((v) => v.variant === "control");
    const treatmentVariant = variants.find((v) => v.variant === "treatment");
    const controlCI = controlVariant?.confidence ?? { lower: 0, upper: 0, center: 0 };
    const treatmentCI = treatmentVariant?.confidence ?? { lower: 0, upper: 0, center: 0 };
    const controlExposures = controlVariant?.exposures ?? 0;
    const treatmentExposures = treatmentVariant?.exposures ?? 0;
    if (controlExposures < 100 || treatmentExposures < 100) {
      if (treatmentCI.lower > controlCI.upper) {
        recommendation = "treatment_winning";
      } else if (controlCI.lower > treatmentCI.upper) {
        recommendation = "control_winning";
      } else {
        const centerDiff = (treatmentCI.center - controlCI.center) * 100;
        if (Math.abs(centerDiff) > 5) {
          recommendation = "promising";
        } else {
          recommendation = "inconclusive";
        }
      }
    } else {
      if (treatmentCI.lower > controlCI.upper) {
        recommendation = "treatment_winning";
      } else if (controlCI.lower > treatmentCI.upper) {
        recommendation = "control_winning";
      } else {
        const centerDiff = (treatmentCI.center - controlCI.center) * 100;
        if (Math.abs(centerDiff) > 5) {
          recommendation = "promising";
        } else {
          recommendation = "inconclusive";
        }
      }
    }
  }
  return {
    experimentId,
    totalExposures,
    variants,
    confidence,
    recommendation
  };
}

// server/routes-experiments.ts
init_admin();
var expLog = log.tag("Experiments");
var experiments = {
  confidence_tooltip: {
    id: "confidence_tooltip",
    description: "Show info icon tooltip on confidence badge vs no tooltip",
    active: true,
    variants: [
      { id: "control", weight: 50 },
      { id: "treatment", weight: 50 }
    ]
  },
  trust_signal_style: {
    id: "trust_signal_style",
    description: "Text labels instead of icons for trust signals",
    active: false,
    variants: [
      { id: "control", weight: 50 },
      { id: "treatment", weight: 50 }
    ]
  },
  personalized_weight: {
    id: "personalized_weight",
    description: "Personalized weight display vs static 'How Voting Works'",
    active: false,
    variants: [
      { id: "control", weight: 50 },
      { id: "treatment", weight: 50 }
    ]
  }
};
function assignVariant(userId, experimentId) {
  const experiment = experiments[experimentId];
  if (!experiment || !experiment.active) {
    return { variant: "control", isDefault: true };
  }
  const key2 = `${userId}:${experimentId}`;
  const bucket = hashString(key2) % 100;
  let cumulative = 0;
  for (const v of experiment.variants) {
    cumulative += v.weight;
    if (bucket < cumulative) {
      return { variant: v.id, isDefault: false };
    }
  }
  return { variant: experiment.variants[0].id, isDefault: false };
}
function registerExperimentRoutes(app2) {
  app2.get("/api/experiments", apiRateLimiter, wrapAsync(async (_req, res) => {
    const active = Object.values(experiments).filter((exp) => exp.active).map((exp) => ({
      id: exp.id,
      description: exp.description,
      variants: exp.variants.map((v) => v.id)
    }));
    return res.json({ data: active });
  }));
  app2.get("/api/experiments/assign", apiRateLimiter, wrapAsync(async (req, res) => {
    const experimentId = req.query.experimentId;
    if (!experimentId) {
      return res.status(400).json({ error: "experimentId query parameter is required" });
    }
    const isAuthenticated = req.isAuthenticated && req.isAuthenticated();
    const userId = isAuthenticated ? req.user.id : null;
    if (!userId) {
      return res.json({
        data: {
          experimentId,
          variant: "control",
          isDefault: true
        }
      });
    }
    const { variant, isDefault } = assignVariant(String(userId), experimentId);
    const context = req.query.context || "api";
    trackExposure(String(userId), experimentId, variant, context);
    expLog.info(`Assigned ${experimentId}=${variant} for user ${userId}`);
    return res.json({
      data: {
        experimentId,
        variant,
        isDefault
      }
    });
  }));
  app2.get("/api/admin/experiments/metrics", requireAuth, wrapAsync(async (req, res) => {
    if (!isAdminEmail(req.user?.email)) {
      return res.status(403).json({ error: "Admin access required" });
    }
    const experimentId = req.query.experimentId;
    if (!experimentId) {
      const allStats = Object.values(experiments).filter((exp) => exp.active).map((exp) => ({
        experimentId: exp.id,
        description: exp.description,
        exposure: getExposureStats(exp.id),
        outcomes: getOutcomeStats(exp.id),
        dashboard: computeExperimentDashboard(exp.id)
      }));
      return res.json({ data: allStats });
    }
    const experiment = experiments[experimentId];
    if (!experiment) {
      return res.status(404).json({ error: `Experiment '${experimentId}' not found` });
    }
    return res.json({
      data: {
        experimentId: experiment.id,
        description: experiment.description,
        active: experiment.active,
        exposure: getExposureStats(experimentId),
        outcomes: getOutcomeStats(experimentId),
        dashboard: computeExperimentDashboard(experimentId)
      }
    });
  }));
}

// server/email-ab-testing.ts
init_logger();
import crypto4 from "crypto";
var abLog = log.tag("EmailAB");
var experiments2 = [];
var assignments = /* @__PURE__ */ new Map();
var MAX_EXPERIMENTS = 50;
function createExperiment(name, variants) {
  if (experiments2.length >= MAX_EXPERIMENTS) {
    experiments2.shift();
  }
  const experiment = {
    id: crypto4.randomUUID(),
    name,
    variants: variants.map((v) => ({
      ...v,
      id: crypto4.randomUUID(),
      weight: v.weight || 1
    })),
    createdAt: /* @__PURE__ */ new Date(),
    status: "active"
  };
  experiments2.push(experiment);
  abLog.info(`Created email experiment "${name}" with ${variants.length} variants`);
  return experiment;
}
function getExperiment(experimentId) {
  return experiments2.find((e) => e.id === experimentId);
}
function completeExperiment(experimentId, winnerVariantId) {
  const experiment = getExperiment(experimentId);
  if (!experiment) return;
  experiment.status = "completed";
  experiment.winnerVariantId = winnerVariantId;
  abLog.info(`Experiment "${experiment.name}" completed \u2014 winner: ${winnerVariantId}`);
}
function getExperimentStats(experimentId) {
  const experiment = getExperiment(experimentId);
  if (!experiment) return null;
  return experiment.variants.map((v) => ({
    variantId: v.id,
    name: v.name,
    assignedCount: [...assignments.entries()].filter(([key2, val]) => key2.startsWith(`${experimentId}:`) && val === v.id).length
  }));
}
function getActiveExperiments() {
  return experiments2.filter((e) => e.status === "active");
}

// server/routes-admin-experiments.ts
init_email_tracking();
function requireAdmin3(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}
function registerAdminExperimentRoutes(app2) {
  app2.get("/api/admin/experiments", requireAuth, requireAdmin3, wrapAsync(async (req, res) => {
    const experiments3 = getActiveExperiments();
    const experimentsWithStats = experiments3.map((exp) => ({
      ...exp,
      stats: getExperimentStats(exp.id)
    }));
    return res.json({
      data: {
        experiments: experimentsWithStats,
        emailStats: getEmailStats()
      }
    });
  }));
  app2.get("/api/admin/experiments/:id", requireAuth, requireAdmin3, wrapAsync(async (req, res) => {
    const experiment = getExperiment(req.params.id);
    if (!experiment) {
      return res.status(404).json({ error: "Experiment not found" });
    }
    const stats2 = getExperimentStats(req.params.id);
    return res.json({ data: { experiment, stats: stats2 } });
  }));
  app2.post("/api/admin/experiments", requireAuth, requireAdmin3, wrapAsync(async (req, res) => {
    const { name, variants } = req.body;
    if (!name || !variants || !Array.isArray(variants) || variants.length === 0) {
      return res.status(400).json({ error: "name and variants[] are required" });
    }
    const experiment = createExperiment(name, variants);
    return res.json({ data: experiment });
  }));
  app2.post("/api/admin/experiments/:id/complete", requireAuth, requireAdmin3, wrapAsync(async (req, res) => {
    const experiment = getExperiment(req.params.id);
    if (!experiment) {
      return res.status(404).json({ error: "Experiment not found" });
    }
    const { winnerVariantId } = req.body;
    completeExperiment(req.params.id, winnerVariantId);
    return res.json({ data: { completed: true } });
  }));
}

// server/routes-auth.ts
import passport2 from "passport";
init_email();
init_logger();
init_storage();
init_analytics2();
init_tier_staleness();

// server/gdpr.ts
init_db();
init_schema();
import { eq as eq20, and as and13, lte as lte3 } from "drizzle-orm";
async function scheduleDeletion(userId, gracePeriodDays) {
  const now = /* @__PURE__ */ new Date();
  const deleteAt = new Date(now.getTime() + gracePeriodDays * 24 * 60 * 60 * 1e3);
  await db.update(deletionRequests).set({ status: "cancelled", cancelledAt: now }).where(and13(eq20(deletionRequests.memberId, userId), eq20(deletionRequests.status, "pending")));
  const [row] = await db.insert(deletionRequests).values({
    memberId: userId,
    requestedAt: now,
    scheduledDeletionAt: deleteAt,
    status: "pending"
  }).returning();
  return {
    userId,
    scheduledAt: row.requestedAt,
    deleteAt: row.scheduledDeletionAt,
    status: row.status
  };
}
async function cancelDeletion(userId) {
  const now = /* @__PURE__ */ new Date();
  const result = await db.update(deletionRequests).set({ status: "cancelled", cancelledAt: now }).where(and13(eq20(deletionRequests.memberId, userId), eq20(deletionRequests.status, "pending"))).returning();
  return result.length > 0;
}
async function getDeletionStatus(userId) {
  const rows = await db.select().from(deletionRequests).where(eq20(deletionRequests.memberId, userId)).orderBy(deletionRequests.requestedAt).limit(1);
  if (rows.length === 0) return null;
  const row = rows[0];
  return {
    userId: row.memberId,
    scheduledAt: row.requestedAt,
    deleteAt: row.scheduledDeletionAt,
    status: row.status
  };
}

// server/routes-auth.ts
function registerAuthRoutes(app2) {
  app2.post("/api/auth/signup", authRateLimiter, wrapAsync(async (req, res) => {
    try {
      const { password, city } = req.body;
      const displayName = sanitizeString(req.body.displayName, 100);
      const username = sanitizeString(req.body.username, 50);
      const email = sanitizeEmail(req.body.email);
      if (!displayName || !username || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
      }
      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      }
      if (!/\d/.test(password)) {
        return res.status(400).json({ error: "Password must contain at least one number" });
      }
      const member = await registerMember({ displayName, username, email, password, city });
      const referralCode = sanitizeString(req.body.referralCode, 50);
      if (referralCode) {
        const { resolveReferralCode: resolveReferralCode2, createReferral: createReferral2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
        const referrerId = await resolveReferralCode2(referralCode);
        if (referrerId && referrerId !== member.id) {
          createReferral2(referrerId, member.id, referralCode).catch(
            (err) => log.error("Referral tracking failed:", err)
          );
        }
      }
      const { markBetaInviteJoined: markBetaInviteJoined2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      markBetaInviteJoined2(email, member.id).catch(() => {
      });
      const { generateEmailVerificationToken: generateEmailVerificationToken2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      const verificationToken = await generateEmailVerificationToken2(member.id);
      sendVerificationEmail({
        email: member.email,
        displayName: member.displayName,
        token: verificationToken
      }).catch((err) => log.error("Verification email failed:", err));
      sendWelcomeEmail({
        email: member.email,
        displayName: member.displayName,
        city: member.city,
        username: member.username
      }).catch((emailErr) => log.error("Welcome email failed:", emailErr));
      trackEvent("signup_completed", member.id);
      req.login(
        {
          id: member.id,
          displayName: member.displayName,
          username: member.username,
          email: member.email,
          city: member.city,
          credibilityScore: member.credibilityScore,
          credibilityTier: member.credibilityTier
        },
        (err) => {
          if (err) return res.status(500).json({ error: "Login failed after signup" });
          return res.status(201).json({ data: req.user });
        }
      );
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }));
  app2.post("/api/auth/login", authRateLimiter, (req, res, next) => {
    passport2.authenticate("local", (err, user, info) => {
      if (err) return res.status(500).json({ error: "Internal server error" });
      if (!user) return res.status(401).json({ error: info?.message || "Invalid credentials" });
      req.login(user, (loginErr) => {
        if (loginErr) return res.status(500).json({ error: "Login failed" });
        return res.json({ data: user });
      });
    })(req, res, next);
  });
  app2.post("/api/auth/google", authRateLimiter, wrapAsync(async (req, res) => {
    try {
      const { idToken } = req.body;
      if (!idToken) {
        return res.status(400).json({ error: "ID token is required" });
      }
      const member = await authenticateGoogleUser(idToken);
      req.login(
        {
          id: member.id,
          displayName: member.displayName,
          username: member.username,
          email: member.email,
          city: member.city,
          credibilityScore: member.credibilityScore,
          credibilityTier: member.credibilityTier
        },
        (err) => {
          if (err) return res.status(500).json({ error: "Login failed" });
          return res.json({ data: req.user });
        }
      );
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }));
  app2.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ error: "Logout failed" });
      return res.json({ data: { message: "Logged out" } });
    });
  });
  app2.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.json({ data: null });
    }
    return res.json({ data: req.user });
  });
  app2.post("/api/auth/verify-email", wrapAsync(async (req, res) => {
    const token = sanitizeString(req.body.token, 100);
    if (!token) {
      return res.status(400).json({ error: "Verification token is required" });
    }
    const { verifyEmailToken: verifyEmailToken2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const result = await verifyEmailToken2(token);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid or expired verification token" });
    }
    return res.json({ data: { verified: true } });
  }));
  app2.post("/api/auth/resend-verification", requireAuth, wrapAsync(async (req, res) => {
    const { isEmailVerified: isEmailVerified2, generateEmailVerificationToken: generateEmailVerificationToken2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const verified = await isEmailVerified2(req.user.id);
    if (verified) {
      return res.json({ data: { message: "Email already verified" } });
    }
    const token = await generateEmailVerificationToken2(req.user.id);
    sendVerificationEmail({
      email: req.user.email,
      displayName: req.user.displayName,
      token
    }).catch((err) => log.error("Resend verification failed:", err));
    return res.json({ data: { message: "Verification email sent" } });
  }));
  app2.post("/api/auth/forgot-password", authRateLimiter, wrapAsync(async (req, res) => {
    const email = sanitizeEmail(req.body.email);
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const { generatePasswordResetToken: generatePasswordResetToken2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const result = await generatePasswordResetToken2(email);
    if (result) {
      sendPasswordResetEmail({
        email,
        displayName: result.displayName,
        token: result.token
      }).catch((err) => log.error("Password reset email failed:", err));
    }
    return res.json({ data: { message: "If an account exists with that email, a reset link has been sent" } });
  }));
  app2.post("/api/auth/reset-password", authRateLimiter, wrapAsync(async (req, res) => {
    const token = sanitizeString(req.body.token, 100);
    const password = req.body.password;
    if (!token || !password) {
      return res.status(400).json({ error: "Token and new password are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }
    if (!/\d/.test(password)) {
      return res.status(400).json({ error: "Password must contain at least one number" });
    }
    const bcrypt3 = await import("bcrypt");
    const hashedPassword = await bcrypt3.hash(password, 10);
    const { resetPasswordWithToken: resetPasswordWithToken2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const result = await resetPasswordWithToken2(token, hashedPassword);
    if (!result.success) {
      return res.status(400).json({ error: result.error || "Password reset failed" });
    }
    return res.json({ data: { message: "Password has been reset successfully" } });
  }));
  app2.get("/api/account/export", wrapAsync(async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const userId = req.user.id;
    const [profile, ratings5, impact, seasonal, badges] = await Promise.all([
      getMemberById(userId),
      getMemberRatings(userId, 1, 1e4),
      getMemberImpact(userId),
      getSeasonalRatingCounts(userId),
      getMemberBadges(userId)
    ]);
    const freshExportTier = profile ? checkAndRefreshTier(profile.credibilityTier, profile.credibilityScore) : null;
    const exportData = {
      exportDate: (/* @__PURE__ */ new Date()).toISOString(),
      format: "GDPR Art. 20 compliant",
      profile: profile ? {
        displayName: profile.displayName,
        username: profile.username,
        email: profile.email,
        city: profile.city,
        credibilityScore: profile.credibilityScore,
        credibilityTier: freshExportTier,
        totalRatings: profile.totalRatings,
        joinedAt: profile.joinedAt,
        lastActive: profile.lastActive
      } : null,
      ratings: ratings5 || [],
      impact: impact || null,
      seasonalActivity: seasonal || [],
      badges: badges || []
    };
    res.setHeader("Content-Disposition", `attachment; filename="topranker-data-export-${userId}.json"`);
    return res.json({ data: exportData });
  }));
  app2.delete("/api/account", wrapAsync(async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const deletionDate = /* @__PURE__ */ new Date();
    deletionDate.setDate(deletionDate.getDate() + 30);
    log.tag("AccountDeletion").info(
      `Deletion requested for user ${req.user.id}, scheduled for ${deletionDate.toISOString()}`
    );
    return res.json({
      data: {
        message: "Account scheduled for deletion",
        deletionDate: deletionDate.toISOString(),
        gracePeriodDays: 30,
        note: "You can cancel this request by logging in within 30 days."
      }
    });
  }));
  app2.post("/api/account/schedule-deletion", requireAuth, wrapAsync(async (req, res) => {
    const userId = req.user.id;
    const request = await scheduleDeletion(userId, 30);
    log.tag("GDPR").info(
      `Deletion scheduled for user ${userId}, deleteAt: ${request.deleteAt.toISOString()}`
    );
    return res.json({
      data: {
        message: "Account deletion scheduled",
        scheduledAt: request.scheduledAt.toISOString(),
        deleteAt: request.deleteAt.toISOString(),
        gracePeriodDays: 30,
        status: request.status,
        note: "You can cancel this request by checking your deletion status within 30 days."
      }
    });
  }));
  app2.post("/api/account/cancel-deletion", requireAuth, wrapAsync(async (req, res) => {
    const userId = req.user.id;
    const cancelled = await cancelDeletion(userId);
    if (!cancelled) {
      return res.status(404).json({ error: "No pending deletion request found" });
    }
    log.tag("GDPR").info(`Deletion cancelled for user ${userId}`);
    return res.json({
      data: { cancelled: true }
    });
  }));
  app2.get("/api/account/deletion-status", requireAuth, wrapAsync(async (req, res) => {
    const userId = req.user.id;
    const status = await getDeletionStatus(userId);
    if (!status) {
      return res.json({ data: { hasPendingDeletion: false } });
    }
    return res.json({
      data: {
        hasPendingDeletion: status.status === "pending",
        scheduledAt: status.scheduledAt.toISOString(),
        deleteAt: status.deleteAt.toISOString(),
        status: status.status
      }
    });
  }));
}

// server/routes-members.ts
init_logger();
init_storage();
init_tier_staleness();
init_file_storage();
import crypto5 from "node:crypto";
function registerMemberRoutes(app2) {
  app2.post("/api/members/me/avatar", requireAuth, wrapAsync(async (req, res) => {
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
    const MAX_SIZE = 2 * 1024 * 1024;
    const isMultipart = (req.headers["content-type"] || "").includes("multipart/form-data");
    if (!isMultipart) {
      return res.status(400).json({
        error: "Avatar upload requires multipart/form-data with an 'avatar' file field."
      });
    }
    const file = req.file;
    if (!file) {
      return res.status(400).json({
        error: "No file found in multipart request. Send an 'avatar' field."
      });
    }
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      return res.status(400).json({
        error: `Unsupported image type: ${file.mimetype}. Allowed: ${ALLOWED_TYPES.join(", ")}`
      });
    }
    if (file.size > MAX_SIZE) {
      return res.status(413).json({ error: "Image exceeds 2 MB limit" });
    }
    const fileBuffer = file.buffer;
    const contentType = file.mimetype;
    const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
    const uniqueId = crypto5.randomBytes(8).toString("hex");
    const key2 = `avatars/${req.user.id}-${uniqueId}.${ext}`;
    const avatarUrl = await fileStorage.upload(key2, fileBuffer, contentType);
    const { updateMemberAvatar: updateMemberAvatar2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const updated = await updateMemberAvatar2(req.user.id, avatarUrl);
    if (!updated) {
      return res.status(404).json({ error: "Member not found" });
    }
    return res.json({ data: { avatarUrl: updated.avatarUrl } });
  }));
  app2.get("/api/members/me", requireAuth, wrapAsync(async (req, res) => {
    const member = await getMemberById(req.user.id);
    if (!member) return res.status(404).json({ error: "Member not found" });
    const { score, tier: computedTier, breakdown } = await recalculateCredibilityScore(member.id);
    const tier = checkAndRefreshTier(computedTier, score);
    const { ratings: ratings5, total } = await getMemberRatings(member.id);
    const { getSeasonalRatingCounts: getSeasonalRatingCounts2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const seasonal = await getSeasonalRatingCounts2(member.id);
    const daysActive = Math.floor(
      (Date.now() - new Date(member.joinedAt).getTime()) / (1e3 * 60 * 60 * 24)
    );
    return res.json({
      data: {
        id: member.id,
        displayName: member.displayName,
        username: member.username,
        email: member.email,
        city: member.city,
        avatarUrl: member.avatarUrl,
        credibilityScore: score,
        credibilityTier: tier,
        totalRatings: member.totalRatings,
        totalCategories: member.totalCategories,
        distinctBusinesses: member.distinctBusinesses,
        isFoundingMember: member.isFoundingMember,
        joinedAt: member.joinedAt,
        daysActive,
        ratingVariance: parseFloat(member.ratingVariance),
        credibilityBreakdown: breakdown,
        ratingHistory: ratings5,
        ...seasonal
      }
    });
  }));
  app2.put("/api/members/me/email", requireAuth, wrapAsync(async (req, res) => {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email is required" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    try {
      const { updateMemberEmail: updateMemberEmail2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      const updated = await updateMemberEmail2(req.user.id, email);
      if (!updated) {
        return res.status(404).json({ error: "Member not found" });
      }
      log.tag("EmailChange").info(
        `Email changed for user ${req.user.id} to ${email}`
      );
      return res.json({ data: { email: updated.email } });
    } catch (err) {
      if (err.message === "Email already in use") {
        return res.status(409).json({ error: "Email already in use" });
      }
      throw err;
    }
  }));
  app2.put("/api/members/me", requireAuth, wrapAsync(async (req, res) => {
    const { displayName, username } = req.body;
    const updates = {};
    if (displayName !== void 0) {
      if (typeof displayName !== "string" || displayName.length < 1 || displayName.length > 50) {
        return res.status(400).json({ error: "displayName must be 1-50 characters" });
      }
      updates.displayName = displayName;
    }
    if (username !== void 0) {
      if (typeof username !== "string" || !/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
        return res.status(400).json({ error: "username must be 3-30 alphanumeric or underscore characters" });
      }
      updates.username = username;
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }
    const { updateMemberProfile: updateMemberProfile2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const updated = await updateMemberProfile2(req.user.id, updates);
    if (!updated) return res.status(404).json({ error: "Member not found" });
    return res.json({ data: updated });
  }));
  app2.get("/api/members/:username", wrapAsync(async (req, res) => {
    const { getMemberByUsername: getMemberByUsername2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const member = await getMemberByUsername2(req.params.username);
    if (!member) return res.status(404).json({ error: "Member not found" });
    const freshTier = checkAndRefreshTier(member.credibilityTier, member.credibilityScore);
    return res.json({
      data: {
        displayName: member.displayName,
        username: member.username,
        credibilityTier: freshTier,
        totalRatings: member.totalRatings,
        joinedAt: member.joinedAt
      }
    });
  }));
  app2.get("/api/members/me/impact", requireAuth, wrapAsync(async (req, res) => {
    const { getMemberImpact: getMemberImpact2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const data = await getMemberImpact2(req.user.id);
    return res.json({ data });
  }));
  app2.post("/api/members/me/push-token", requireAuth, wrapAsync(async (req, res) => {
    const { pushToken } = req.body;
    if (!pushToken || typeof pushToken !== "string") {
      return res.status(400).json({ error: "pushToken is required" });
    }
    const { updatePushToken: updatePushToken2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    await updatePushToken2(req.user.id, pushToken);
    return res.json({ ok: true });
  }));
  app2.get("/api/members/me/notification-preferences", requireAuth, wrapAsync(async (req, res) => {
    const { getMemberById: getMemberById2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const member = await getMemberById2(req.user.id);
    const stored = member?.notificationPrefs || {};
    const prefs = {
      tierUpgrades: true,
      challengerResults: true,
      newChallengers: true,
      weeklyDigest: false,
      // Sprint 479: Push notification categories
      rankingChanges: true,
      savedBusinessAlerts: true,
      cityAlerts: true,
      marketingEmails: false,
      ...stored
    };
    return res.json({ data: prefs });
  }));
  app2.put("/api/members/me/notification-preferences", requireAuth, wrapAsync(async (req, res) => {
    const {
      tierUpgrades,
      challengerResults,
      newChallengers,
      weeklyDigest,
      marketingEmails,
      // Sprint 479: Push notification categories
      rankingChanges,
      savedBusinessAlerts,
      cityAlerts
    } = req.body;
    const prefs = {
      tierUpgrades: tierUpgrades !== false,
      challengerResults: challengerResults !== false,
      newChallengers: newChallengers !== false,
      weeklyDigest: weeklyDigest === true,
      rankingChanges: rankingChanges !== false,
      savedBusinessAlerts: savedBusinessAlerts !== false,
      cityAlerts: cityAlerts !== false,
      marketingEmails: marketingEmails === true
    };
    const { updateNotificationPrefs: updateNotificationPrefs2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const saved = await updateNotificationPrefs2(req.user.id, prefs);
    log.tag("Notifications").info(`Preferences updated for user ${req.user.id}: ${JSON.stringify(saved)}`);
    return res.json({ data: saved });
  }));
  app2.get("/api/members/me/onboarding", requireAuth, wrapAsync(async (req, res) => {
    const { getOnboardingProgress: getOnboardingProgress2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const progress = await getOnboardingProgress2(req.user.id);
    return res.json({ data: progress });
  }));
}

// server/routes-businesses.ts
init_logger();
init_storage();

// server/hours-utils.ts
function computeOpenStatus(hours, now) {
  const fallback = { isOpen: false, closingTime: null, nextOpenTime: null, todayHours: null };
  if (!hours || !hours.periods || hours.periods.length === 0) return fallback;
  const d = now || /* @__PURE__ */ new Date();
  const ct = new Date(d.toLocaleString("en-US", { timeZone: "America/Chicago" }));
  const dayOfWeek = ct.getDay();
  const currentTime = ct.getHours() * 100 + ct.getMinutes();
  if (hours.periods.length === 1 && !hours.periods[0].close) {
    return { isOpen: true, closingTime: null, nextOpenTime: null, todayHours: "Open 24 hours" };
  }
  const todayHours = hours.weekday_text ? hours.weekday_text[dayOfWeek === 0 ? 6 : dayOfWeek - 1] || null : null;
  for (const period of hours.periods) {
    if (!period.close) continue;
    const openDay = period.open.day;
    const closeDay = period.close.day;
    const openTime = parseInt(period.open.time, 10);
    const closeTime = parseInt(period.close.time, 10);
    if (openDay === dayOfWeek && closeDay === dayOfWeek) {
      if (currentTime >= openTime && currentTime < closeTime) {
        return {
          isOpen: true,
          closingTime: formatTime(period.close.time),
          nextOpenTime: null,
          todayHours
        };
      }
    }
    if (openDay === dayOfWeek && closeDay !== dayOfWeek && currentTime >= openTime) {
      return {
        isOpen: true,
        closingTime: formatTime(period.close.time),
        nextOpenTime: null,
        todayHours
      };
    }
    const prevDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    if (openDay === prevDay && closeDay === dayOfWeek && currentTime < closeTime) {
      return {
        isOpen: true,
        closingTime: formatTime(period.close.time),
        nextOpenTime: null,
        todayHours
      };
    }
  }
  let nextOpen = null;
  for (const period of hours.periods) {
    if (period.open.day === dayOfWeek && parseInt(period.open.time, 10) > currentTime) {
      nextOpen = formatTime(period.open.time);
      break;
    }
  }
  if (!nextOpen) {
    for (let offset = 1; offset <= 7; offset++) {
      const checkDay = (dayOfWeek + offset) % 7;
      const nextPeriod = hours.periods.find((p) => p.open.day === checkDay);
      if (nextPeriod) {
        const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][checkDay];
        nextOpen = `${dayName} ${formatTime(nextPeriod.open.time)}`;
        break;
      }
    }
  }
  return { isOpen: false, closingTime: null, nextOpenTime: nextOpen, todayHours };
}
function formatTime(time) {
  const h = parseInt(time.slice(0, 2), 10);
  const m = time.slice(2);
  return `${h.toString().padStart(2, "0")}:${m}`;
}
function isOpenLate(hours) {
  if (!hours || !hours.periods) return false;
  return hours.periods.some((p) => {
    if (!p.close) return true;
    const closeTime = parseInt(p.close.time, 10);
    return closeTime >= 2200 || closeTime <= 200;
  });
}
function isOpenWeekends(hours) {
  if (!hours || !hours.periods) return false;
  return hours.periods.some((p) => p.open.day === 0 || p.open.day === 6);
}

// server/search-ranking-v2.ts
init_logger();
var rankLog = log.tag("SearchRankingV2");
var weights = {
  reputationWeight: 0.6,
  recencyBoost: 0.15,
  ratingCountFloor: 10,
  bayesianPrior: 3.5,
  bayesianStrength: 5
};
function getRankingWeights() {
  return { ...weights };
}
function setRankingWeights(w) {
  weights = { ...weights, ...w };
  rankLog.info("Ranking weights updated", weights);
  return { ...weights };
}
function levenshtein(a, b, maxDist = 3) {
  if (Math.abs(a.length - b.length) > maxDist) return Infinity;
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    let rowMin = dp[0];
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = temp;
      if (dp[j] < rowMin) rowMin = dp[j];
    }
    if (rowMin > maxDist) return Infinity;
  }
  return dp[n];
}
function wordScore(target, token) {
  if (target === token) return 1;
  if (target.startsWith(token)) return 0.8;
  if (target.includes(token)) return 0.6;
  if (token.length >= 4) {
    const dist = levenshtein(target, token, 2);
    if (dist === 1) return 0.3;
    if (dist === 2) return 0.15;
  }
  return 0;
}
function textRelevance(name, query) {
  if (!query || !query.trim()) return 0;
  const q = query.toLowerCase().trim();
  const n = name.toLowerCase();
  if (n === q) return 1;
  if (n.startsWith(q)) return 0.9;
  if (n.includes(q)) return 0.7;
  const queryTokens = q.split(/\s+/).filter((t) => t.length > 0);
  const nameWords = n.split(/\s+/).filter((w) => w.length > 0);
  if (queryTokens.length === 0 || nameWords.length === 0) return 0;
  let totalScore = 0;
  for (const token of queryTokens) {
    let bestMatch = 0;
    for (const word of nameWords) {
      const score = wordScore(word, token);
      if (score > bestMatch) bestMatch = score;
    }
    totalScore += bestMatch;
  }
  return Math.min(totalScore / queryTokens.length, 1);
}
function categoryRelevance(ctx) {
  if (!ctx.query) return 0;
  const tokens2 = ctx.query.toLowerCase().trim().split(/\s+/);
  let best = 0;
  for (const token of tokens2) {
    if (token.length < 3) continue;
    if (ctx.cuisine) {
      const c = ctx.cuisine.toLowerCase();
      if (c === token) {
        best = Math.max(best, 1);
        continue;
      }
      if (c.startsWith(token) || c.includes(token)) {
        best = Math.max(best, 0.7);
        continue;
      }
      if (token.length >= 4 && levenshtein(c, token, 2) <= 1) {
        best = Math.max(best, 0.4);
        continue;
      }
    }
    if (ctx.category) {
      const cat = ctx.category.toLowerCase();
      if (cat === token) {
        best = Math.max(best, 0.8);
        continue;
      }
      if (cat.startsWith(token) || cat.includes(token)) {
        best = Math.max(best, 0.5);
        continue;
      }
    }
    if (ctx.neighborhood) {
      const nb = ctx.neighborhood.toLowerCase();
      if (nb === token || nb.includes(token)) {
        best = Math.max(best, 0.6);
        continue;
      }
    }
  }
  return best;
}
function ratingVolumeSignal(ratingCount) {
  if (!ratingCount || ratingCount <= 0) return 0;
  return Math.min(Math.log10(ratingCount) / Math.log10(50), 1);
}
function profileCompleteness(ctx) {
  let score = 0;
  let total = 0;
  if (ctx.hasPhotos !== void 0) {
    total++;
    if (ctx.hasPhotos) score++;
  }
  if (ctx.hasHours !== void 0) {
    total++;
    if (ctx.hasHours) score++;
  }
  if (ctx.hasCuisine !== void 0) {
    total++;
    if (ctx.hasCuisine) score++;
  }
  if (ctx.hasDescription !== void 0) {
    total++;
    if (ctx.hasDescription) score++;
  }
  return total > 0 ? score / total : 0;
}
function combinedRelevance(name, ctx) {
  const text2 = textRelevance(name, ctx.query);
  const category = categoryRelevance(ctx);
  const completeness = profileCompleteness(ctx);
  const volume = ratingVolumeSignal(ctx.ratingCount);
  return text2 * 0.5 + category * 0.2 + completeness * 0.15 + volume * 0.15;
}

// server/search-result-processor.ts
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function enrichSearchResults(bizList, photoMap, opts) {
  return bizList.map((b) => {
    const photos = photoMap[b.id] || (b.photoUrl ? [b.photoUrl] : []);
    const searchCtx = {
      query: opts.query,
      hasPhotos: photos.length > 0,
      hasHours: !!b.closingTime,
      hasCuisine: !!b.cuisine,
      hasDescription: !!b.description,
      category: b.category,
      cuisine: b.cuisine,
      neighborhood: b.neighborhood,
      ratingCount: b.ratingCount ? Number(b.ratingCount) : 0
    };
    const relevanceScore = opts.query ? Math.round(combinedRelevance(b.name, searchCtx) * 100) / 100 : 0;
    let distanceKm = null;
    if (opts.userLat != null && opts.userLng != null && b.lat && b.lng) {
      distanceKm = haversineKm(opts.userLat, opts.userLng, parseFloat(b.lat), parseFloat(b.lng));
    }
    const bHours = b.openingHours;
    const openStatus = computeOpenStatus(bHours);
    const dynamicIsOpenNow = bHours ? openStatus.isOpen : b.isOpenNow ?? false;
    return {
      ...b,
      photoUrls: photos,
      relevanceScore,
      distanceKm: distanceKm != null ? Math.round(distanceKm * 10) / 10 : null,
      isOpenNow: dynamicIsOpenNow,
      closingTime: openStatus.closingTime,
      nextOpenTime: openStatus.nextOpenTime,
      todayHours: openStatus.todayHours
    };
  });
}
function applySearchFilters(data, opts) {
  let filtered = data;
  if (opts.dietaryTags.length > 0) {
    filtered = filtered.filter((b) => {
      const bizTags = Array.isArray(b.dietaryTags) ? b.dietaryTags : [];
      return opts.dietaryTags.every((tag) => bizTags.includes(tag));
    });
  }
  if (opts.maxDistanceKm != null && opts.userLat != null && opts.userLng != null) {
    filtered = filtered.filter((b) => b.distanceKm != null && b.distanceKm <= opts.maxDistanceKm);
  }
  if (opts.openNow) {
    filtered = filtered.filter((b) => b.isOpenNow === true);
  }
  if (opts.openLate) {
    filtered = filtered.filter((b) => {
      const h = b.openingHours;
      return isOpenLate(h);
    });
  }
  if (opts.openWeekends) {
    filtered = filtered.filter((b) => {
      const h = b.openingHours;
      return isOpenWeekends(h);
    });
  }
  return filtered;
}
function sortByRelevance(data, query) {
  if (!query) return data;
  return [...data].sort(
    (a, b) => b.relevanceScore - a.relevanceScore || parseFloat(b.weightedScore) - parseFloat(a.weightedScore)
  );
}

// server/dashboard-analytics.ts
function computeWeeklyVolume(ratings5, weeks = 12) {
  const now = /* @__PURE__ */ new Date();
  const result = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const weekStart = new Date(now.getTime() - (w + 1) * 7 * 864e5);
    const weekEnd = new Date(now.getTime() - w * 7 * 864e5);
    const weekRatings = ratings5.filter((r) => {
      const d = new Date(r.createdAt).getTime();
      return d >= weekStart.getTime() && d < weekEnd.getTime();
    });
    const scores = weekRatings.map((r) => parseFloat(r.rawScore));
    result.push({
      period: weekStart.toISOString().split("T")[0],
      count: weekRatings.length,
      avgScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10 : 0
    });
  }
  return result;
}
function computeMonthlyVolume(ratings5, months = 6) {
  const now = /* @__PURE__ */ new Date();
  const result = [];
  for (let m = months - 1; m >= 0; m--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - m + 1, 1);
    const monthRatings = ratings5.filter((r) => {
      const d = new Date(r.createdAt).getTime();
      return d >= monthStart.getTime() && d < monthEnd.getTime();
    });
    const scores = monthRatings.map((r) => parseFloat(r.rawScore));
    result.push({
      period: monthStart.toISOString().split("T")[0],
      count: monthRatings.length,
      avgScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10 : 0
    });
  }
  return result;
}
function computeVelocityChange(weeklyVolume) {
  if (weeklyVolume.length < 4) return 0;
  const recent = weeklyVolume.slice(-2).reduce((sum2, w) => sum2 + w.count, 0);
  const previous = weeklyVolume.slice(-4, -2).reduce((sum2, w) => sum2 + w.count, 0);
  if (previous === 0) return recent > 0 ? 100 : 0;
  return Math.round((recent - previous) / previous * 100);
}
function extractSparklineScores(ratings5, limit = 20) {
  return ratings5.slice(0, limit).map((r) => parseFloat(r.rawScore)).reverse();
}
function buildDashboardTrend(ratings5) {
  const weeklyVolume = computeWeeklyVolume(ratings5);
  const monthlyVolume = computeMonthlyVolume(ratings5);
  return {
    weeklyVolume,
    monthlyVolume,
    velocityChange: computeVelocityChange(weeklyVolume),
    sparklineScores: extractSparklineScores(ratings5)
  };
}

// server/routes-businesses.ts
function registerBusinessRoutes(app2) {
  app2.get("/api/businesses/autocomplete", wrapAsync(async (req, res) => {
    const query = sanitizeString(req.query.q, 50);
    const city = sanitizeString(req.query.city, 100) || "Dallas";
    if (!query || query.trim().length === 0) {
      return res.json({ data: [] });
    }
    const suggestions = await autocompleteBusinesses(query, city);
    return res.json({ data: suggestions });
  }));
  app2.get("/api/businesses/popular-categories", wrapAsync(async (req, res) => {
    const city = sanitizeString(req.query.city, 100) || "Dallas";
    const categories2 = await getPopularCategories(city);
    return res.json({ data: categories2 });
  }));
  app2.get("/api/businesses/search", wrapAsync(async (req, res) => {
    const query = sanitizeString(req.query.q, 200);
    const city = sanitizeString(req.query.city, 100) || "Dallas";
    const category = sanitizeString(req.query.category, 50) || void 0;
    const cuisine = sanitizeString(req.query.cuisine, 50) || void 0;
    const dietaryParam = sanitizeString(req.query.dietary, 200) || "";
    const dietaryTags = dietaryParam ? dietaryParam.split(",").map((t) => t.trim()).filter(Boolean) : [];
    const userLat = req.query.lat ? parseFloat(req.query.lat) : void 0;
    const userLng = req.query.lng ? parseFloat(req.query.lng) : void 0;
    const maxDistanceKm = req.query.maxDistance ? parseFloat(req.query.maxDistance) : void 0;
    const openNow = req.query.openNow === "true";
    const openLate = req.query.openLate === "true";
    const openWeekends = req.query.openWeekends === "true";
    const pageLimit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
    const pageOffset = Math.max(parseInt(req.query.offset) || 0, 0);
    const [bizList, totalCount] = await Promise.all([
      searchBusinesses(query, city, category, pageLimit, cuisine, pageOffset),
      countBusinessSearch(query, city, category, cuisine)
    ]);
    const photoMap = await getBusinessPhotosMap(bizList.map((b) => b.id));
    const processingOpts = { query, userLat, userLng, maxDistanceKm, dietaryTags, openNow, openLate, openWeekends };
    const enriched = enrichSearchResults(bizList, photoMap, processingOpts);
    const filtered = applySearchFilters(enriched, processingOpts);
    const data = sortByRelevance(filtered, query);
    return res.json({
      data,
      pagination: {
        total: totalCount,
        limit: pageLimit,
        offset: pageOffset,
        hasMore: pageOffset + pageLimit < totalCount
      }
    });
  }));
  app2.get("/api/businesses/:slug", wrapAsync(async (req, res) => {
    const business = await getBusinessBySlug(req.params.slug);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }
    let [{ ratings: ratings5 }, dishList, photos] = await Promise.all([
      getBusinessRatings(business.id, 1, 20),
      getBusinessDishes(business.id, 5),
      getBusinessPhotos(business.id)
    ]);
    if (photos.length === 0 && business.googlePlaceId) {
      try {
        const count15 = await fetchAndStorePhotos(business.id, business.googlePlaceId);
        if (count15 > 0) {
          photos = await getBusinessPhotos(business.id);
        }
      } catch {
      }
    }
    const photoUrls = photos.length > 0 ? photos : business.photoUrl ? [business.photoUrl] : [];
    const bHours = business.openingHours;
    const openStatus = computeOpenStatus(bHours);
    const dynamicIsOpenNow = bHours ? openStatus.isOpen : business.isOpenNow ?? false;
    return res.json({ data: {
      ...business,
      photoUrls,
      recentRatings: ratings5,
      dishes: dishList,
      isOpenNow: dynamicIsOpenNow,
      closingTime: openStatus.closingTime,
      nextOpenTime: openStatus.nextOpenTime,
      todayHours: openStatus.todayHours
    } });
  }));
  app2.get("/api/businesses/:id/ratings", wrapAsync(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const perPage = Math.min(50, Math.max(1, parseInt(req.query.per_page) || 20));
    const data = await getBusinessRatings(req.params.id, page, perPage);
    return res.json({ data });
  }));
  app2.post("/api/businesses/:slug/claim", requireAuth, wrapAsync(async (req, res) => {
    const business = await getBusinessBySlug(req.params.slug);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }
    const role = sanitizeString(req.body.role, 100);
    const phone = sanitizeString(req.body.phone, 20);
    const businessEmail = sanitizeString(req.body.businessEmail, 100);
    const website = sanitizeString(req.body.website, 200);
    const preferredMethod = sanitizeString(req.body.verificationMethod, 20) || "email";
    if (!role || role.length === 0) {
      return res.status(400).json({ error: "Role is required" });
    }
    const { getClaimByMemberAndBusiness: getClaimByMemberAndBusiness2, submitClaim: submitClaim2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const existing = await getClaimByMemberAndBusiness2(req.user.id, business.id);
    if (existing) {
      return res.status(409).json({ error: "You already have a pending or approved claim for this business" });
    }
    const parts = [`role:${role}`, `method:${preferredMethod}`];
    if (phone) parts.push(`phone:${phone}`);
    if (businessEmail) parts.push(`email:${businessEmail}`);
    if (website) parts.push(`website:${website}`);
    const verificationMethod = parts.join(" | ");
    const claim = await submitClaim2(business.id, req.user.id, verificationMethod);
    const { sendClaimConfirmationEmail: sendClaimConfirmationEmail2, sendClaimAdminNotification: sendClaimAdminNotification2 } = await Promise.resolve().then(() => (init_email(), email_exports));
    sendClaimConfirmationEmail2({
      email: req.user.email || "",
      displayName: req.user.displayName || "User",
      businessName: business.name
    }).catch(() => {
    });
    sendClaimAdminNotification2({
      businessName: business.name,
      claimantName: req.user.displayName || "Unknown",
      claimantEmail: req.user.email || ""
    }).catch(() => {
    });
    return res.json({ data: { id: claim.id, status: claim.status } });
  }));
  app2.get("/api/businesses/:slug/dashboard", requireAuth, wrapAsync(async (req, res) => {
    const business = await getBusinessBySlug(req.params.slug);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }
    const { isAdminEmail: isAdminEmail2 } = await Promise.resolve().then(() => (init_admin(), admin_exports));
    const isOwner = business.ownerId && business.ownerId === req.user.id;
    const isAdmin = isAdminEmail2(req.user?.email);
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Dashboard access requires business ownership" });
    }
    const { getRankHistory: getRankHistory2, getBusinessDishes: getBusinessDishes2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const [{ ratings: ratings5, total }, rankHistory2, dishes2, allRatingsResult] = await Promise.all([
      getBusinessRatings(business.id, 1, 10),
      getRankHistory2(business.id, 49),
      getBusinessDishes2(business.id, 5),
      getBusinessRatings(business.id, 1, 200)
      // Sprint 478: all ratings for trend analysis
    ]);
    const totalRatings = business.totalRatings || 0;
    const avgScore = business.rawAvgScore ? parseFloat(business.rawAvgScore) : 0;
    const rankPosition = business.rankPosition || 0;
    const rankDelta = business.rankDelta || 0;
    const returners = ratings5.filter((r) => r.wouldReturn === true).length;
    const returnTotal = ratings5.filter((r) => r.wouldReturn !== null && r.wouldReturn !== void 0).length;
    const wouldReturnPct = returnTotal > 0 ? Math.round(returners / returnTotal * 100) : 0;
    const topDish = dishes2.length > 0 ? dishes2[0] : null;
    const ratingTrend = rankHistory2.map((h) => h.score);
    const isPro = business.subscriptionStatus === "active" || business.subscriptionStatus === "trialing" || isAdmin;
    const trendData = buildDashboardTrend(allRatingsResult.ratings);
    const baseData = {
      totalRatings,
      avgScore,
      rankPosition,
      rankDelta,
      wouldReturnPct,
      topDish: topDish ? { name: topDish.name, votes: topDish.voteCount || 0 } : null,
      ratingTrend: isPro ? ratingTrend : ratingTrend.slice(-7),
      // Free: 7 days, Pro: full history
      recentRatings: (isPro ? ratings5 : ratings5.slice(0, 3)).map((r) => ({
        id: r.id,
        user: r.memberName || "Anonymous",
        score: parseFloat(r.rawScore),
        tier: r.memberTier || "community",
        note: isPro ? r.note : void 0,
        // Notes are Pro-only
        date: r.createdAt
      })),
      // Sprint 478: Trend analytics
      weeklyVolume: isPro ? trendData.weeklyVolume : trendData.weeklyVolume.slice(-4),
      monthlyVolume: isPro ? trendData.monthlyVolume : trendData.monthlyVolume.slice(-3),
      velocityChange: trendData.velocityChange,
      sparklineScores: trendData.sparklineScores,
      subscriptionStatus: business.subscriptionStatus || "none",
      isPro
    };
    return res.json({ data: baseData });
  }));
  app2.get("/api/businesses/:id/rank-history", wrapAsync(async (req, res) => {
    const { getRankHistory: getRankHistory2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const days = Math.min(90, Math.max(7, parseInt(req.query.days) || 30));
    const data = await getRankHistory2(req.params.id, days);
    return res.json({ data });
  }));
  app2.post("/api/businesses/:id/photos", requireAuth, wrapAsync(async (req, res) => {
    const businessId = req.params.id;
    const memberId = req.user.id;
    const { data: photoData, mimeType: rawMime, caption: rawCaption } = req.body;
    const mimeType = sanitizeString(rawMime, 50) || "image/jpeg";
    const caption = sanitizeString(rawCaption, 500) || "";
    const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
    if (!ALLOWED_MIME.includes(mimeType)) {
      return res.status(400).json({ error: `Invalid image type. Allowed: ${ALLOWED_MIME.join(", ")}` });
    }
    if (!photoData || typeof photoData !== "string") {
      return res.status(400).json({ error: "Photo data is required (base64)" });
    }
    const buffer2 = Buffer.from(photoData, "base64");
    const MAX_SIZE = 10 * 1024 * 1024;
    const MIN_SIZE = 1024;
    if (buffer2.length > MAX_SIZE) {
      return res.status(400).json({ error: "Photo too large (max 10MB)" });
    }
    if (buffer2.length < MIN_SIZE) {
      return res.status(400).json({ error: "Photo too small (min 1KB)" });
    }
    const { fileStorage: fileStorage2 } = await Promise.resolve().then(() => (init_file_storage(), file_storage_exports));
    const ext = mimeType.split("/")[1] || "jpeg";
    const crypto12 = await import("crypto");
    const key2 = `community-photos/${businessId}/${memberId}-${crypto12.randomUUID()}.${ext}`;
    const url = await fileStorage2.upload(key2, buffer2, mimeType);
    const { submitPhoto: submitPhoto2 } = await Promise.resolve().then(() => (init_photo_moderation(), photo_moderation_exports));
    const result = await submitPhoto2(businessId, memberId, url, caption, buffer2.length, mimeType);
    if ("error" in result) {
      return res.status(400).json({ error: result.error });
    }
    log.info(`Community photo uploaded: ${result.id} for business ${businessId} by ${memberId}`);
    return res.status(201).json({
      data: {
        id: result.id,
        url: result.url,
        status: result.status,
        message: "Photo submitted for review"
      }
    });
  }));
}

// server/routes-dishes.ts
init_schema();
init_storage();
function registerDishRoutes(app2) {
  app2.get("/api/dish-leaderboards", wrapAsync(async (req, res) => {
    const city = sanitizeString(req.query.city, 100) || "dallas";
    const data = await getDishLeaderboards(city);
    return res.json({ data });
  }));
  app2.get("/api/dish-leaderboards/:slug", wrapAsync(async (req, res) => {
    const slug = req.params.slug;
    const city = sanitizeString(req.query.city, 100) || "dallas";
    const result = await getDishLeaderboardWithEntries(slug, city);
    if (!result) return res.status(404).json({ error: "Dish leaderboard not found" });
    const { leaderboard, entries, isProvisional, minRatingsNeeded } = result;
    return res.json({ data: {
      id: leaderboard.id,
      city: leaderboard.city,
      dishName: leaderboard.dishName,
      dishSlug: leaderboard.dishSlug,
      dishEmoji: leaderboard.dishEmoji,
      status: leaderboard.status,
      entryCount: entries.length,
      entries,
      isProvisional,
      minRatingsNeeded
    } });
  }));
  app2.get("/api/dish-suggestions", wrapAsync(async (req, res) => {
    const city = sanitizeString(req.query.city, 100) || "dallas";
    const data = await getDishSuggestions(city);
    return res.json({ data });
  }));
  app2.post("/api/dish-suggestions", requireAuth, wrapAsync(async (req, res) => {
    const parsed = insertDishSuggestionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });
    const memberId = req.user.id;
    try {
      const suggestion = await submitDishSuggestion(memberId, parsed.data.city, parsed.data.dishName);
      return res.status(201).json({ data: suggestion });
    } catch (err) {
      if (err.message.includes("3 dishes per week")) return res.status(429).json({ error: err.message });
      return res.status(400).json({ error: err.message });
    }
  }));
  app2.post("/api/dish-suggestions/:id/vote", requireAuth, wrapAsync(async (req, res) => {
    const memberId = req.user.id;
    try {
      const suggestion = await voteDishSuggestion(memberId, req.params.id);
      return res.json({ data: suggestion });
    } catch (err) {
      if (err.message.includes("Already voted")) return res.status(409).json({ error: err.message });
      return res.status(400).json({ error: err.message });
    }
  }));
  app2.get("/api/businesses/:id/top-dishes", wrapAsync(async (req, res) => {
    const businessId = req.params.id;
    const { getBusinessDishes: getBusinessDishes2 } = await Promise.resolve().then(() => (init_dishes(), dishes_exports));
    const topDishes = await getBusinessDishes2(businessId, 10);
    const enriched = topDishes.map((d) => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      voteCount: d.voteCount,
      photoUrl: d.photoUrl
    }));
    return res.json({ data: enriched });
  }));
  app2.get("/api/businesses/:id/dish-rankings", wrapAsync(async (req, res) => {
    const businessId = req.params.id;
    const { getBusinessDishRankings: getBusinessDishRankings2 } = await Promise.resolve().then(() => (init_dishes(), dishes_exports));
    const rankings = await getBusinessDishRankings2(businessId);
    return res.json({ data: rankings });
  }));
}

// server/routes-seo.ts
init_storage();
var SITE_URL2 = process.env.SITE_URL || "https://topranker.com";
function registerSeoRoutes(app2) {
  app2.get("/robots.txt", (_req, res) => {
    res.type("text/plain").send(`User-agent: *
Allow: /
Allow: /dish/
Allow: /business/

Disallow: /admin/
Disallow: /api/
Disallow: /auth/

Sitemap: ${SITE_URL2}/sitemap.xml
`);
  });
  app2.get("/sitemap.xml", wrapAsync(async (_req, res) => {
    const cities = ["dallas", "fort-worth", "austin", "houston", "san-antonio"];
    const allBoards = [];
    for (const city of cities) {
      const boards = await getDishLeaderboards(city);
      for (const b of boards) {
        allBoards.push({ slug: b.dishSlug, city });
      }
    }
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL2}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>${SITE_URL2}/auth/login</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${SITE_URL2}/auth/signup</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${SITE_URL2}/legal/terms</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${SITE_URL2}/legal/privacy</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>`;
    for (const board of allBoards) {
      xml += `
  <url>
    <loc>${SITE_URL2}/dish/${board.slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
    <lastmod>${today}</lastmod>
  </url>`;
    }
    xml += `
</urlset>`;
    res.type("application/xml").send(xml);
  }));
  app2.get("/api/seo/dish/:slug", wrapAsync(async (req, res) => {
    const { getDishLeaderboardWithEntries: getDishLeaderboardWithEntries2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const slug = req.params.slug;
    const city = req.query.city || "dallas";
    const board = await getDishLeaderboardWithEntries2(slug, city);
    if (!board) {
      return res.status(404).json({ error: "Not found" });
    }
    const cityTitle = city.charAt(0).toUpperCase() + city.slice(1);
    const entries = board.entries || [];
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Best ${board.dishName} in ${cityTitle}`,
      description: `Community-ranked best ${board.dishName.toLowerCase()} in ${cityTitle}. ${entries.length} spots rated by credibility-weighted reviews.`,
      url: `${SITE_URL2}/dish/${board.dishSlug}`,
      numberOfItems: entries.length,
      itemListElement: entries.slice(0, 10).map((entry, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: entry.businessName,
        url: `${SITE_URL2}/business/${entry.businessSlug}`
      }))
    };
    return res.json({ data: jsonLd });
  }));
  app2.get("/api/seo/challenger/:id", wrapAsync(async (req, res) => {
    const { getActiveChallenges: getActiveChallenges2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { challengers: challengers2, businesses: businesses2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq29 } = await import("drizzle-orm");
    const challengeId = req.params.id;
    const [challenge] = await db2.select().from(challengers2).where(eq29(challengers2.id, challengeId));
    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }
    const [challengerBiz, defenderBiz] = await Promise.all([
      db2.select().from(businesses2).where(eq29(businesses2.id, challenge.challengerId)).then((r) => r[0]),
      db2.select().from(businesses2).where(eq29(businesses2.id, challenge.defenderId)).then((r) => r[0])
    ]);
    const challengerName = challengerBiz?.name || "Challenger";
    const defenderName = defenderBiz?.name || "Defender";
    const isActive = challenge.status === "active";
    const daysLeft = isActive ? Math.max(0, Math.ceil((new Date(challenge.endDate).getTime() - Date.now()) / (1e3 * 60 * 60 * 24))) : 0;
    const title = `${challengerName} vs ${defenderName} \u2014 ${challenge.category}`;
    const description = isActive ? `${daysLeft} days left to vote! Who has the best ${challenge.category.toLowerCase()} in ${challenge.city}?` : challenge.winnerId ? `Challenge complete! See who won the ${challenge.category.toLowerCase()} showdown in ${challenge.city}.` : `It was a draw! ${challenge.category} challenge in ${challenge.city}.`;
    return res.json({
      og: {
        title,
        description,
        url: `${SITE_URL2}/challenger?id=${challengeId}`,
        type: "website",
        siteName: "TopRanker",
        image: challengerBiz?.photoUrl || defenderBiz?.photoUrl || `${SITE_URL2}/og-default.png`
      },
      data: {
        id: challenge.id,
        status: challenge.status,
        category: challenge.category,
        city: challenge.city,
        challengerName,
        defenderName,
        challengerSlug: challengerBiz?.slug,
        defenderSlug: defenderBiz?.slug,
        totalVotes: challenge.totalVotes,
        daysLeft,
        winnerId: challenge.winnerId
      }
    });
  }));
}

// server/routes-qr.ts
init_storage();
init_logger();
var qrLog = log.tag("QR");
var SITE_URL3 = process.env.SITE_URL || "https://topranker.com";
function registerQrRoutes(app2) {
  app2.get("/api/businesses/:slug/qr", wrapAsync(async (req, res) => {
    const business = await getBusinessBySlug(req.params.slug);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }
    const rateUrl = `${SITE_URL3}/rate/${business.slug}?source=qr`;
    const profileUrl = `${SITE_URL3}/business/${business.slug}`;
    return res.json({
      data: {
        businessId: business.id,
        businessName: business.name,
        businessSlug: business.slug,
        rateUrl,
        profileUrl,
        qrConfig: {
          data: rateUrl,
          width: 300,
          height: 300,
          dotsOptions: {
            color: "#0D1B2A",
            type: "rounded"
          },
          cornersSquareOptions: {
            color: "#C49A1A",
            type: "extra-rounded"
          },
          cornersDotOptions: {
            color: "#C49A1A",
            type: "dot"
          },
          backgroundOptions: {
            color: "#FFFFFF"
          }
        },
        printTemplate: {
          headline: `Rate ${business.name}`,
          subline: "Scan to rate on TopRanker",
          footer: "topranker.com"
        }
      }
    });
  }));
  app2.post("/api/qr/scan", wrapAsync(async (req, res) => {
    const businessId = sanitizeString(req.body.businessId, 100);
    if (!businessId) {
      return res.status(400).json({ error: "businessId is required" });
    }
    const { getBusinessById: getBusinessById2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const business = await getBusinessById2(businessId);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }
    const { recordQrScan: recordQrScan2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const memberId = req.user?.id || null;
    const scan = await recordQrScan2(businessId, memberId);
    qrLog.info(`QR scan: business=${business.name}, member=${memberId || "anonymous"}`);
    return res.json({
      data: {
        scanId: scan.id,
        businessSlug: business.slug,
        businessName: business.name
      }
    });
  }));
  app2.get("/api/businesses/:slug/qr-stats", requireAuth, wrapAsync(async (req, res) => {
    const business = await getBusinessBySlug(req.params.slug);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }
    const { isAdminEmail: isAdminEmail2 } = await Promise.resolve().then(() => (init_admin(), admin_exports));
    const isOwner = business.ownerId && business.ownerId === req.user.id;
    const isAdmin = isAdminEmail2(req.user?.email);
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "QR stats require business ownership" });
    }
    const { getQrScanStats: getQrScanStats2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const stats2 = await getQrScanStats2(business.id);
    return res.json({ data: stats2 });
  }));
}

// server/routes-notifications.ts
init_logger();

// server/notifications.ts
init_logger();
var notifLog = log.tag("Notifications");
var store = /* @__PURE__ */ new Map();
function getNotifications(memberId, limit) {
  const list = store.get(memberId) || [];
  return list.slice(0, limit || 20);
}
function getUnreadCount(memberId) {
  return (store.get(memberId) || []).filter((n) => !n.read).length;
}
function markAsRead(notificationId) {
  for (const list of store.values()) {
    const notif = list.find((n) => n.id === notificationId);
    if (notif) {
      notif.read = true;
      return true;
    }
  }
  return false;
}
function markAllRead(memberId) {
  const list = store.get(memberId) || [];
  let count15 = 0;
  for (const n of list) {
    if (!n.read) {
      n.read = true;
      count15++;
    }
  }
  return count15;
}
function deleteNotification(notificationId) {
  for (const [memberId, list] of store) {
    const idx = list.findIndex((n) => n.id === notificationId);
    if (idx !== -1) {
      list.splice(idx, 1);
      return true;
    }
  }
  return false;
}

// server/routes-notifications.ts
var notifRouteLog = log.tag("NotifRoutes");
function registerNotificationRoutes(app2) {
  app2.get("/api/notifications", requireAuth, (req, res) => {
    const memberId = req.memberId || "anonymous";
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;
    const all = getNotifications(memberId, 100);
    const totalPages = Math.ceil(all.length / perPage) || 1;
    const start = (page - 1) * perPage;
    const notifications2 = all.slice(start, start + perPage);
    res.json({ notifications: notifications2, unreadCount: getUnreadCount(memberId), page, perPage, totalPages });
  });
  app2.get("/api/notifications/unread-count", requireAuth, (req, res) => {
    const memberId = req.memberId || "anonymous";
    res.json({ count: getUnreadCount(memberId) });
  });
  app2.post("/api/notifications/:id/read", requireAuth, (req, res) => {
    const result = markAsRead(req.params.id);
    if (!result) return res.status(404).json({ error: "Notification not found" });
    res.json({ success: true });
  });
  app2.post("/api/notifications/mark-all-read", requireAuth, (req, res) => {
    const memberId = req.memberId || "anonymous";
    const count15 = markAllRead(memberId);
    res.json({ markedRead: count15 });
  });
  app2.delete("/api/notifications/:id", requireAuth, (req, res) => {
    const result = deleteNotification(req.params.id);
    if (!result) return res.status(404).json({ error: "Notification not found" });
    res.json({ success: true });
  });
}

// server/routes-referrals.ts
function registerReferralRoutes(app2) {
  app2.get("/api/referrals/me", requireAuth, wrapAsync(async (req, res) => {
    const { getReferralStats: getReferralStats2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const stats2 = await getReferralStats2(req.user.id);
    const code = req.user.username.toUpperCase();
    const shareUrl = `https://topranker.com/join?ref=${encodeURIComponent(code)}`;
    return res.json({
      data: {
        code,
        shareUrl,
        ...stats2
      }
    });
  }));
  app2.get("/api/referrals/validate", wrapAsync(async (req, res) => {
    const code = (req.query.code || "").trim();
    if (!code) {
      return res.status(400).json({ error: "Referral code is required" });
    }
    const { resolveReferralCode: resolveReferralCode2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const referrerId = await resolveReferralCode2(code);
    if (!referrerId) {
      return res.json({ data: { valid: false } });
    }
    return res.json({ data: { valid: true } });
  }));
}

// server/routes-unsubscribe.ts
init_db();
init_schema();
init_logger();
import { eq as eq22 } from "drizzle-orm";

// server/unsubscribe-tokens.ts
import crypto7 from "crypto";
var SECRET = process.env.UNSUBSCRIBE_SECRET || "topranker-unsub-dev-secret";
function hmac(data) {
  return crypto7.createHmac("sha256", SECRET).update(data).digest("base64url");
}
function verifyUnsubscribeToken(token) {
  const parts = token.split(".");
  if (parts.length < 3) return null;
  const signature = parts.pop();
  const type = parts.pop();
  const memberId = parts.join(".");
  const expected = hmac(`${memberId}.${type}`);
  if (!crypto7.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }
  return { memberId, type };
}

// server/routes-unsubscribe.ts
var VALID_TYPES = ["drip", "weekly", "all"];
function flagsForType(type, value) {
  if (type === "drip") return { emailDrip: value };
  if (type === "weekly") return { weeklyDigest: value };
  return { emailDrip: value, weeklyDigest: value };
}
function labelForType(type) {
  if (type === "drip") return "drip campaign";
  if (type === "weekly") return "weekly digest";
  return "all";
}
function htmlPage(title, body) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} \u2014 TopRanker</title>
<style>body{margin:0;font-family:'DM Sans',system-ui,sans-serif;background:#0D1B2A;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh}
.card{background:#162636;border-radius:12px;padding:40px;max-width:420px;text-align:center}
h1{color:#C49A1A;font-size:1.4rem;margin:0 0 12px}p{line-height:1.5;margin:0 0 20px;color:#ccc}
a{color:#C49A1A;text-decoration:underline}</style></head>
<body><div class="card"><h1>${title}</h1>${body}</div></body></html>`;
}
function registerUnsubscribeRoutes(app2) {
  app2.get("/api/unsubscribe", wrapAsync(async (req, res) => {
    const token = sanitizeString(req.query.token, 200);
    if (!token) {
      return res.status(400).send(htmlPage("Invalid Request", "<p>Missing or invalid parameters.</p>"));
    }
    let memberId;
    let type;
    const signed = verifyUnsubscribeToken(token);
    if (signed && VALID_TYPES.includes(signed.type)) {
      memberId = signed.memberId;
      type = signed.type;
    } else {
      memberId = token;
      type = sanitizeString(req.query.type, 10) || "all";
      if (!VALID_TYPES.includes(type)) {
        return res.status(400).send(htmlPage("Invalid Request", "<p>Missing or invalid parameters.</p>"));
      }
    }
    const [member] = await db.select().from(members).where(eq22(members.id, memberId)).limit(1);
    if (!member) {
      return res.status(404).send(htmlPage("Not Found", "<p>We couldn't find that account.</p>"));
    }
    const existing = member.notificationPrefs || {};
    const updated = { ...existing, ...flagsForType(type, false) };
    await db.update(members).set({ notificationPrefs: updated }).where(eq22(members.id, memberId));
    log.info(`Unsubscribed member ${memberId} from ${type} emails`);
    const label = labelForType(type);
    const resubLink = `/api/resubscribe?token=${encodeURIComponent(token)}&type=${encodeURIComponent(type)}`;
    return res.send(htmlPage("Unsubscribed", `<p>You've been unsubscribed from <strong>${label}</strong> emails.</p><p><a href="${resubLink}">Re-subscribe</a></p>`));
  }));
  app2.get("/api/resubscribe", wrapAsync(async (req, res) => {
    const token = sanitizeString(req.query.token, 200);
    if (!token) {
      return res.status(400).send(htmlPage("Invalid Request", "<p>Missing or invalid parameters.</p>"));
    }
    let memberId;
    let type;
    const signed = verifyUnsubscribeToken(token);
    if (signed && VALID_TYPES.includes(signed.type)) {
      memberId = signed.memberId;
      type = signed.type;
    } else {
      memberId = token;
      type = sanitizeString(req.query.type, 10) || "all";
      if (!VALID_TYPES.includes(type)) {
        return res.status(400).send(htmlPage("Invalid Request", "<p>Missing or invalid parameters.</p>"));
      }
    }
    const [member] = await db.select().from(members).where(eq22(members.id, memberId)).limit(1);
    if (!member) {
      return res.status(404).send(htmlPage("Not Found", "<p>We couldn't find that account.</p>"));
    }
    const existing = member.notificationPrefs || {};
    const updated = { ...existing, ...flagsForType(type, true) };
    await db.update(members).set({ notificationPrefs: updated }).where(eq22(members.id, memberId));
    log.info(`Resubscribed member ${memberId} to ${type} emails`);
    const label = labelForType(type);
    return res.send(htmlPage("Re-subscribed", `<p>You've been re-subscribed to <strong>${label}</strong> emails. Welcome back!</p>`));
  }));
}

// server/routes-webhooks.ts
init_logger();
import crypto8 from "node:crypto";
init_email_tracking();

// server/email-id-mapping.ts
init_logger();
var mapLog = log.tag("EmailIdMapping");
var resendToTracking = /* @__PURE__ */ new Map();
function getTrackingIdFromResend(resendId) {
  return resendToTracking.get(resendId);
}

// server/routes-webhooks.ts
function verifySignature2(payload, signature, secret) {
  const expected = crypto8.createHmac("sha256", secret).update(payload).digest("hex");
  return crypto8.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
function registerWebhookRoutes(app2) {
  app2.post("/api/webhooks/resend", wrapAsync(async (req, res) => {
    const rawBody = JSON.stringify(req.body);
    const secret = process.env.RESEND_WEBHOOK_SECRET;
    if (secret) {
      const signature = req.headers["resend-signature"];
      if (!signature || !verifySignature2(rawBody, signature, secret)) {
        log.warn("Resend webhook: invalid signature");
        return res.status(400).json({ error: "Invalid webhook signature" });
      }
    } else {
      log.warn("Resend webhook: RESEND_WEBHOOK_SECRET not set \u2014 skipping signature verification (dev mode)");
    }
    const { type, data } = req.body;
    const trackingId = getTrackingIdFromResend(data.email_id) || data.email_id;
    const eventId = trackingId;
    log.info(`Resend webhook: ${type} for email ${eventId}`);
    switch (type) {
      case "email.opened":
        await trackEmailOpened(eventId);
        break;
      case "email.clicked":
        await trackEmailClicked(eventId);
        break;
      case "email.bounced":
        await trackEmailBounced(eventId);
        break;
      case "email.delivery_error":
      case "email.complained": {
        const reason = String(data.reason || data.error || type);
        await trackEmailFailed(eventId, reason);
        break;
      }
      default:
        log.info(`Resend webhook: unhandled event type "${type}"`);
    }
    return res.json({ received: true });
  }));
}

// server/routes-admin-promotion.ts
init_logger();

// server/city-promotion.ts
init_logger();
init_city_config();
var promoLog = log.tag("CityPromotion");
var promotionHistory = [];
var thresholds = {
  minBusinesses: 50,
  minMembers: 100,
  minRatings: 200,
  minDaysInBeta: 30
};
function getPromotionThresholds() {
  return { ...thresholds };
}
function setPromotionThresholds(t) {
  thresholds = { ...thresholds, ...t };
  promoLog.info("Promotion thresholds updated", thresholds);
  return { ...thresholds };
}
async function getPromotionStatus(city) {
  const config2 = getCityConfig(city);
  if (!config2 || config2.status !== "beta") return null;
  const engagement = await getCityEngagement(city);
  const launchDate = config2.launchDate ? new Date(config2.launchDate) : /* @__PURE__ */ new Date();
  const daysInBeta = Math.floor(
    (Date.now() - launchDate.getTime()) / (1e3 * 60 * 60 * 24)
  );
  const missing = [];
  if (engagement.totalBusinesses < thresholds.minBusinesses) missing.push("businesses");
  if (engagement.totalMembers < thresholds.minMembers) missing.push("members");
  if (engagement.totalRatings < thresholds.minRatings) missing.push("ratings");
  if (daysInBeta < thresholds.minDaysInBeta) missing.push("daysInBeta");
  const pctBiz = Math.min(100, Math.round(engagement.totalBusinesses / thresholds.minBusinesses * 100));
  const pctMem = Math.min(100, Math.round(engagement.totalMembers / thresholds.minMembers * 100));
  const pctRat = Math.min(100, Math.round(engagement.totalRatings / thresholds.minRatings * 100));
  const pctDays = Math.min(100, Math.round(daysInBeta / thresholds.minDaysInBeta * 100));
  const overall = Math.round((pctBiz + pctMem + pctRat + pctDays) / 4);
  return {
    city,
    eligible: missing.length === 0,
    currentMetrics: {
      businesses: engagement.totalBusinesses,
      members: engagement.totalMembers,
      ratings: engagement.totalRatings,
      daysInBeta
    },
    progress: { businesses: pctBiz, members: pctMem, ratings: pctRat, daysInBeta: pctDays, overall },
    thresholds: { ...thresholds },
    missingCriteria: missing
  };
}
function promoteCity(city, metrics) {
  const config2 = getCityConfig(city);
  if (!config2 || config2.status !== "beta") {
    promoLog.warn(`Cannot promote ${city}: not a beta city`);
    return false;
  }
  CITY_REGISTRY[city].status = "active";
  CITY_REGISTRY[city].launchDate = CITY_REGISTRY[city].launchDate || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  promotionHistory.push({
    city,
    promotedAt: (/* @__PURE__ */ new Date()).toISOString(),
    metricsAtPromotion: metrics || { businesses: 0, members: 0, ratings: 0, daysInBeta: 0 }
  });
  promoLog.info(`Promoted ${city} from beta to active`);
  return true;
}
async function getAllBetaPromotionStatus() {
  const { getBetaCities: getBetaCities2 } = await Promise.resolve().then(() => (init_city_config(), city_config_exports));
  const betaCities = getBetaCities2();
  const results = await Promise.all(betaCities.map((c) => getPromotionStatus(c)));
  return results.filter((r) => r !== null);
}
function getPromotionHistory() {
  return [...promotionHistory];
}

// server/routes-admin-promotion.ts
var adminPromoLog = log.tag("AdminPromotion");
function registerAdminPromotionRoutes(app2) {
  app2.get(
    "/api/admin/promotion-status/:city",
    wrapAsync(async (req, res) => {
      const status = await getPromotionStatus(req.params.city);
      if (!status) {
        return res.status(404).json({ error: "City not found or not in beta" });
      }
      res.json(status);
    })
  );
  app2.post(
    "/api/admin/promote/:city",
    wrapAsync(async (req, res) => {
      const status = await getPromotionStatus(req.params.city);
      const result = promoteCity(req.params.city, status?.currentMetrics);
      if (!result) {
        return res.status(400).json({ error: "Cannot promote city" });
      }
      adminPromoLog.info(`Admin promoted ${req.params.city}`);
      res.json({ success: true, city: req.params.city, newStatus: "active" });
    })
  );
  app2.get("/api/admin/promotion-thresholds", (_req, res) => {
    res.json(getPromotionThresholds());
  });
  app2.put("/api/admin/promotion-thresholds", (req, res) => {
    const updated = setPromotionThresholds(req.body);
    adminPromoLog.info("Promotion thresholds updated");
    res.json(updated);
  });
  app2.get(
    "/api/admin/promotion-status",
    wrapAsync(async (_req, res) => {
      const statuses = await getAllBetaPromotionStatus();
      res.json({ cities: statuses, count: statuses.length });
    })
  );
  app2.get("/api/admin/promotion-history", (_req, res) => {
    res.json(getPromotionHistory());
  });
}

// server/routes-admin-ratelimit.ts
init_logger();

// server/rate-limit-dashboard.ts
init_logger();
var rlDashLog = log.tag("RateLimitDash");
var events2 = [];
function getRateLimitStats(limit) {
  const recentLimit = limit ?? 50;
  const totalRequests = events2.length;
  const blockedRequests = events2.filter((e) => e.blocked).length;
  const blockRate = totalRequests > 0 ? blockedRequests / totalRequests : 0;
  const ipCounts = /* @__PURE__ */ new Map();
  for (const e of events2) {
    ipCounts.set(e.ip, (ipCounts.get(e.ip) || 0) + 1);
  }
  const topOffenders = Array.from(ipCounts.entries()).map(([ip, count15]) => ({ ip, count: count15 })).sort((a, b) => b.count - a.count).slice(0, 10);
  const pathCounts = /* @__PURE__ */ new Map();
  for (const e of events2) {
    pathCounts.set(e.path, (pathCounts.get(e.path) || 0) + 1);
  }
  const topPaths = Array.from(pathCounts.entries()).map(([path3, count15]) => ({ path: path3, count: count15 })).sort((a, b) => b.count - a.count).slice(0, 10);
  const recentEvents = events2.slice(-recentLimit);
  return {
    totalRequests,
    blockedRequests,
    blockRate,
    topOffenders,
    topPaths,
    recentEvents
  };
}
function getBlockedIPs(minHits) {
  const threshold = minHits ?? 5;
  const blockedEvents = events2.filter((e) => e.blocked);
  const ipData = /* @__PURE__ */ new Map();
  for (const e of blockedEvents) {
    const existing = ipData.get(e.ip);
    if (!existing || e.timestamp > existing.lastSeen) {
      ipData.set(e.ip, {
        count: (existing?.count || 0) + 1,
        lastSeen: e.timestamp
      });
    } else {
      existing.count++;
    }
  }
  return Array.from(ipData.entries()).map(([ip, data]) => ({ ip, count: data.count, lastSeen: data.lastSeen })).filter((entry) => entry.count >= threshold).sort((a, b) => b.count - a.count);
}

// server/abuse-detection.ts
init_logger();
var abuseLog = log.tag("AbuseDetection");
var incidents = [];
function getActiveIncidents() {
  return incidents.filter((i) => !i.resolved);
}
function resolveIncident(id) {
  const incident = incidents.find((i) => i.id === id);
  if (!incident) {
    return false;
  }
  incident.resolved = true;
  abuseLog.info(`Resolved abuse incident ${id} (${incident.pattern} from ${incident.source})`);
  return true;
}
function getAbuseStats() {
  const byType = {};
  for (const i of incidents) {
    byType[i.pattern] = (byType[i.pattern] || 0) + 1;
  }
  return {
    total: incidents.length,
    active: incidents.filter((i) => !i.resolved).length,
    byType
  };
}

// server/routes-admin-ratelimit.ts
var adminRLLog = log.tag("AdminRateLimit");
function registerAdminRateLimitRoutes(app2) {
  app2.get("/api/admin/rate-limits", (_req, res) => {
    adminRLLog.info("Fetching rate limit stats");
    res.json(getRateLimitStats());
  });
  app2.get("/api/admin/rate-limits/blocked", (req, res) => {
    const minHits = parseInt(req.query.minHits) || 5;
    adminRLLog.info(`Fetching blocked IPs (minHits: ${minHits})`);
    res.json(getBlockedIPs(minHits));
  });
  app2.get("/api/admin/abuse/incidents", (_req, res) => {
    adminRLLog.info("Fetching active abuse incidents");
    res.json(getActiveIncidents());
  });
  app2.get("/api/admin/abuse/stats", (_req, res) => {
    adminRLLog.info("Fetching abuse stats");
    res.json(getAbuseStats());
  });
  app2.post("/api/admin/abuse/resolve/:id", (req, res) => {
    const result = resolveIncident(req.params.id);
    if (!result) {
      return res.status(404).json({ error: "Incident not found" });
    }
    adminRLLog.info(`Resolved abuse incident ${req.params.id}`);
    res.json({ success: true });
  });
}

// server/routes-admin-claims-verification.ts
init_logger();

// server/claim-verification.ts
init_logger();
var claimLog = log.tag("ClaimVerification");
var claims = /* @__PURE__ */ new Map();
function getClaimStatus(claimId) {
  return claims.get(claimId) || null;
}
function getPendingClaims2() {
  return Array.from(claims.values()).filter((c) => c.status === "pending");
}
function getClaimsByBusiness(businessId) {
  return Array.from(claims.values()).filter((c) => c.businessId === businessId);
}
function rejectClaim(claimId, reason) {
  const claim = claims.get(claimId);
  if (!claim || claim.status !== "pending") return false;
  claim.status = "rejected";
  claim.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
  claimLog.info(`Claim ${claimId} rejected: ${reason || "no reason"}`);
  return true;
}
function getClaimStats() {
  const all = Array.from(claims.values());
  return {
    total: all.length,
    pending: all.filter((c) => c.status === "pending").length,
    verified: all.filter((c) => c.status === "verified").length,
    rejected: all.filter((c) => c.status === "rejected").length,
    expired: all.filter((c) => c.status === "expired").length
  };
}

// server/routes-admin-claims-verification.ts
var adminClaimLog = log.tag("AdminClaimVerify");
function registerAdminClaimVerificationRoutes(app2) {
  app2.get("/api/admin/claims/pending", (_req, res) => {
    res.json(getPendingClaims2());
  });
  app2.get("/api/admin/claims/stats", (_req, res) => {
    res.json(getClaimStats());
  });
  app2.get("/api/admin/claims/:id", (req, res) => {
    const claim = getClaimStatus(req.params.id);
    if (!claim) return res.status(404).json({ error: "Claim not found" });
    res.json(claim);
  });
  app2.get("/api/admin/claims/business/:businessId", (req, res) => {
    res.json(getClaimsByBusiness(req.params.businessId));
  });
  app2.post("/api/admin/claims/:id/reject", (req, res) => {
    const result = rejectClaim(req.params.id, req.body?.reason);
    if (!result) return res.status(400).json({ error: "Cannot reject claim" });
    adminClaimLog.info(`Admin rejected claim ${req.params.id}`);
    res.json({ success: true });
  });
}

// server/routes-admin-reputation.ts
init_logger();

// server/reputation-v2.ts
init_logger();
var repLog = log.tag("ReputationV2");
var reputationCache = /* @__PURE__ */ new Map();
function getReputation(memberId) {
  return reputationCache.get(memberId) || null;
}
function getTierThresholds() {
  return {
    newcomer: { min: 0, max: 19 },
    contributor: { min: 20, max: 39 },
    trusted: { min: 40, max: 59 },
    expert: { min: 60, max: 79 },
    authority: { min: 80, max: 100 }
  };
}
function getReputationLeaderboard(limit) {
  return Array.from(reputationCache.values()).sort((a, b) => b.score - a.score).slice(0, limit || 10);
}
function getReputationStats() {
  const all = Array.from(reputationCache.values());
  const avg = all.length > 0 ? all.reduce((sum2, r) => sum2 + r.score, 0) / all.length : 0;
  const byTier = { newcomer: 0, contributor: 0, trusted: 0, expert: 0, authority: 0 };
  for (const r of all) byTier[r.tier]++;
  return { totalScored: all.length, averageScore: Math.round(avg * 100) / 100, byTier };
}

// server/routes-admin-reputation.ts
var adminRepLog = log.tag("AdminReputation");
function registerAdminReputationRoutes(app2) {
  app2.get("/api/admin/reputation/stats", (_req, res) => {
    adminRepLog.info("Fetching reputation stats");
    res.json(getReputationStats());
  });
  app2.get("/api/admin/reputation/leaderboard", (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    adminRepLog.info(`Fetching reputation leaderboard (limit: ${limit})`);
    res.json(getReputationLeaderboard(limit));
  });
  app2.get("/api/admin/reputation/:memberId", (req, res) => {
    const { memberId } = req.params;
    adminRepLog.info(`Fetching reputation for member ${memberId}`);
    const reputation = getReputation(memberId);
    if (!reputation) {
      return res.status(404).json({ error: "Member reputation not found" });
    }
    res.json(reputation);
  });
  app2.get("/api/admin/reputation/tiers", (_req, res) => {
    adminRepLog.info("Fetching tier thresholds");
    res.json(getTierThresholds());
  });
}

// server/routes-admin-moderation.ts
init_logger();

// server/moderation-queue.ts
init_logger();
var modLog = log.tag("ModerationQueue");
var queue = [];
function getPendingItems(limit) {
  return queue.filter((i) => i.status === "pending").slice(0, limit || 50);
}
function getFilteredItems(opts) {
  let items = [...queue];
  if (opts.status) items = items.filter((i) => i.status === opts.status);
  if (opts.contentType) items = items.filter((i) => i.contentType === opts.contentType);
  if (opts.sortByViolations) items.sort((a, b) => b.violations.length - a.violations.length);
  return items.slice(0, opts.limit || 50);
}
function bulkApprove(itemIds, moderatorId, note) {
  let approved = 0;
  let notFound = 0;
  for (const id of itemIds) {
    if (approveItem(id, moderatorId, note)) approved++;
    else notFound++;
  }
  return { approved, notFound };
}
function bulkReject(itemIds, moderatorId, note) {
  let rejected = 0;
  let notFound = 0;
  for (const id of itemIds) {
    if (rejectItem(id, moderatorId, note)) rejected++;
    else notFound++;
  }
  return { rejected, notFound };
}
function getResolvedItems(limit) {
  return queue.filter((i) => i.status === "approved" || i.status === "rejected").slice(0, limit || 50);
}
function approveItem(itemId, moderatorId, note) {
  const item = queue.find((i) => i.id === itemId);
  if (!item || item.status !== "pending") return false;
  item.status = "approved";
  item.moderatorId = moderatorId;
  item.moderatorNote = note || null;
  item.resolvedAt = (/* @__PURE__ */ new Date()).toISOString();
  modLog.info(`Approved: ${itemId} by ${moderatorId}`);
  return true;
}
function rejectItem(itemId, moderatorId, note) {
  const item = queue.find((i) => i.id === itemId);
  if (!item || item.status !== "pending") return false;
  item.status = "rejected";
  item.moderatorId = moderatorId;
  item.moderatorNote = note || null;
  item.resolvedAt = (/* @__PURE__ */ new Date()).toISOString();
  modLog.info(`Rejected: ${itemId} by ${moderatorId}`);
  return true;
}
function getQueueStats() {
  return {
    total: queue.length,
    pending: queue.filter((i) => i.status === "pending").length,
    approved: queue.filter((i) => i.status === "approved").length,
    rejected: queue.filter((i) => i.status === "rejected").length
  };
}
function getItemsByBusiness(businessId) {
  return queue.filter((i) => i.businessId === businessId);
}
function getItemsByMember(memberId) {
  return queue.filter((i) => i.memberId === memberId);
}

// server/routes-admin-moderation.ts
var adminModLog = log.tag("AdminModeration");
function registerAdminModerationRoutes(app2) {
  app2.get("/api/admin/moderation/queue", (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    adminModLog.info(`Fetching moderation queue (limit: ${limit})`);
    res.json(getPendingItems(limit));
  });
  app2.get("/api/admin/moderation/stats", (_req, res) => {
    adminModLog.info("Fetching moderation stats");
    res.json(getQueueStats());
  });
  app2.post("/api/admin/moderation/:id/approve", (req, res) => {
    const { id } = req.params;
    const moderatorId = req.user?.id || "admin";
    const note = req.body?.note;
    adminModLog.info(`Approving moderation item ${id}`);
    const success = approveItem(id, moderatorId, note);
    if (!success) {
      return res.status(404).json({ error: "Item not found or already resolved" });
    }
    res.json({ success: true });
  });
  app2.post("/api/admin/moderation/:id/reject", (req, res) => {
    const { id } = req.params;
    const moderatorId = req.user?.id || "admin";
    const note = req.body?.note;
    adminModLog.info(`Rejecting moderation item ${id}`);
    const success = rejectItem(id, moderatorId, note);
    if (!success) {
      return res.status(404).json({ error: "Item not found or already resolved" });
    }
    res.json({ success: true });
  });
  app2.get("/api/admin/moderation/business/:businessId", (req, res) => {
    const { businessId } = req.params;
    adminModLog.info(`Fetching moderation items for business ${businessId}`);
    res.json(getItemsByBusiness(businessId));
  });
  app2.get("/api/admin/moderation/member/:memberId", (req, res) => {
    const { memberId } = req.params;
    adminModLog.info(`Fetching moderation items for member ${memberId}`);
    res.json(getItemsByMember(memberId));
  });
  app2.get("/api/admin/moderation/filtered", (req, res) => {
    const status = req.query.status;
    const contentType = req.query.contentType;
    const limit = parseInt(req.query.limit) || 50;
    const sortByViolations = req.query.sort === "violations";
    adminModLog.info(`Filtered queue: status=${status}, type=${contentType}, sort=${sortByViolations}`);
    res.json(getFilteredItems({
      status,
      contentType,
      limit,
      sortByViolations
    }));
  });
  app2.get("/api/admin/moderation/resolved", (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    adminModLog.info(`Fetching resolved items (limit: ${limit})`);
    res.json(getResolvedItems(limit));
  });
  app2.post("/api/admin/moderation/bulk-approve", (req, res) => {
    const { ids, note } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "ids array required" });
    }
    if (ids.length > 100) {
      return res.status(400).json({ error: "Maximum 100 items per bulk action" });
    }
    const moderatorId = req.user?.id || "admin";
    adminModLog.info(`Bulk approving ${ids.length} items`);
    const result = bulkApprove(ids, moderatorId, note);
    res.json(result);
  });
  app2.post("/api/admin/moderation/bulk-reject", (req, res) => {
    const { ids, note } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "ids array required" });
    }
    if (ids.length > 100) {
      return res.status(400).json({ error: "Maximum 100 items per bulk action" });
    }
    const moderatorId = req.user?.id || "admin";
    adminModLog.info(`Bulk rejecting ${ids.length} items`);
    const result = bulkReject(ids, moderatorId, note);
    res.json(result);
  });
}

// server/routes-admin-ranking.ts
init_logger();
var adminRankLog = log.tag("AdminRanking");
function registerAdminRankingRoutes(app2) {
  app2.get("/api/admin/ranking/weights", (_req, res) => {
    adminRankLog.info("Fetching ranking weights");
    res.json(getRankingWeights());
  });
  app2.put("/api/admin/ranking/weights", (req, res) => {
    adminRankLog.info("Updating ranking weights", req.body);
    const updated = setRankingWeights(req.body);
    res.json(updated);
  });
  app2.get("/api/admin/ranking/confidence-levels", (_req, res) => {
    adminRankLog.info("Fetching confidence level definitions");
    const weights2 = getRankingWeights();
    res.json({
      levels: [
        { level: "low", description: `Fewer than ${Math.floor(weights2.ratingCountFloor / 2)} ratings`, minRatings: 0 },
        { level: "medium", description: `${Math.floor(weights2.ratingCountFloor / 2)}\u2013${weights2.ratingCountFloor - 1} ratings`, minRatings: Math.floor(weights2.ratingCountFloor / 2) },
        { level: "high", description: `${weights2.ratingCountFloor}+ ratings`, minRatings: weights2.ratingCountFloor }
      ]
    });
  });
}

// server/routes-admin-templates.ts
init_logger();

// server/email-templates.ts
init_logger();
import crypto9 from "crypto";
var tmplLog = log.tag("EmailTemplates");
var templates = /* @__PURE__ */ new Map();
var MAX_TEMPLATES = 200;
var BUILT_IN_TEMPLATES = [
  {
    name: "welcome",
    subject: "Welcome to TrustMe, {{memberName}}!",
    htmlBody: "<h1>Welcome, {{memberName}}!</h1><p>You've joined the most trusted ranking platform in {{city}}.</p>",
    textBody: "Welcome, {{memberName}}! You've joined the most trusted ranking platform in {{city}}.",
    variables: ["memberName", "city"],
    category: "transactional"
  },
  {
    name: "claim_approved",
    subject: "Your claim for {{businessName}} has been approved",
    htmlBody: "<h1>Congratulations!</h1><p>Your claim for {{businessName}} in {{city}} has been verified.</p>",
    textBody: "Congratulations! Your claim for {{businessName}} in {{city}} has been verified.",
    variables: ["businessName", "city"],
    category: "transactional"
  },
  {
    name: "weekly_digest",
    subject: "Your weekly {{city}} food scene update",
    htmlBody: "<h1>{{city}} This Week</h1><p>Hey {{memberName}}, here's what's trending in {{city}}.</p><p>Top rated: {{topBusiness}}</p>",
    textBody: "Hey {{memberName}}, here's what's trending in {{city}}. Top rated: {{topBusiness}}",
    variables: ["memberName", "city", "topBusiness"],
    category: "digest"
  },
  {
    name: "pro_upgrade",
    subject: "Unlock Pro features for {{businessName}}",
    htmlBody: "<h1>Go Pro</h1><p>{{businessName}} could reach more customers with TrustMe Pro.</p>",
    textBody: "{{businessName}} could reach more customers with TrustMe Pro.",
    variables: ["businessName"],
    category: "outreach"
  },
  {
    name: "tier_promotion",
    subject: "You've been promoted to {{tierName}}!",
    htmlBody: "<h1>Level Up!</h1><p>Congratulations {{memberName}}, you're now a {{tierName}} on TrustMe.</p>",
    textBody: "Congratulations {{memberName}}, you're now a {{tierName}} on TrustMe.",
    variables: ["memberName", "tierName"],
    category: "transactional"
  }
];
function initBuiltInTemplates() {
  for (const t of BUILT_IN_TEMPLATES) {
    const tmpl = {
      ...t,
      id: crypto9.randomUUID(),
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    templates.set(tmpl.name, tmpl);
  }
  tmplLog.info(`Initialized ${BUILT_IN_TEMPLATES.length} built-in templates`);
}
initBuiltInTemplates();
function getTemplate(name) {
  return templates.get(name) || null;
}
function getAllTemplates() {
  return Array.from(templates.values());
}
function createTemplate(tmpl) {
  if (templates.size >= MAX_TEMPLATES) {
    const oldest = Array.from(templates.values()).filter((t) => !BUILT_IN_TEMPLATES.some((b) => b.name === t.name)).sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
    if (oldest) templates.delete(oldest.name);
  }
  const created = {
    ...tmpl,
    id: crypto9.randomUUID(),
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  templates.set(created.name, created);
  tmplLog.info(`Template created: ${created.name}`);
  return created;
}
function renderTemplate(name, vars) {
  const tmpl = templates.get(name);
  if (!tmpl) return null;
  let subject = tmpl.subject;
  let html = tmpl.htmlBody;
  let text2 = tmpl.textBody;
  for (const [key2, value] of Object.entries(vars)) {
    const pattern = new RegExp(`\\{\\{${key2}\\}\\}`, "g");
    subject = subject.replace(pattern, value);
    html = html.replace(pattern, value);
    text2 = text2.replace(pattern, value);
  }
  return { subject, html, text: text2 };
}
function previewTemplate(name) {
  const tmpl = templates.get(name);
  if (!tmpl) return null;
  const vars = {};
  for (const v of tmpl.variables) {
    vars[v] = `[${v}]`;
  }
  return renderTemplate(name, vars);
}

// server/routes-admin-templates.ts
var adminTmplLog = log.tag("AdminTemplates");
function registerAdminTemplateRoutes(app2) {
  app2.get("/api/admin/templates", (_req, res) => {
    adminTmplLog.info("Fetching all email templates");
    res.json(getAllTemplates());
  });
  app2.get("/api/admin/templates/:name", (req, res) => {
    const { name } = req.params;
    adminTmplLog.info(`Fetching template: ${name}`);
    const tmpl = getTemplate(name);
    if (!tmpl) {
      res.status(404).json({ error: `Template '${name}' not found` });
      return;
    }
    res.json(tmpl);
  });
  app2.post("/api/admin/templates", (req, res) => {
    const { name, subject, htmlBody, textBody, variables, category } = req.body;
    if (!name || !subject || !htmlBody || !textBody || !category) {
      res.status(400).json({ error: "Missing required fields: name, subject, htmlBody, textBody, category" });
      return;
    }
    adminTmplLog.info(`Creating template: ${name}`);
    const created = createTemplate({
      name,
      subject,
      htmlBody,
      textBody,
      variables: variables || [],
      category
    });
    res.status(201).json(created);
  });
  app2.get("/api/admin/templates/:name/preview", (req, res) => {
    const { name } = req.params;
    adminTmplLog.info(`Previewing template: ${name}`);
    const result = previewTemplate(name);
    if (!result) {
      res.status(404).json({ error: `Template '${name}' not found` });
      return;
    }
    res.json(result);
  });
  app2.post("/api/admin/templates/:name/render", (req, res) => {
    const { name } = req.params;
    const vars = req.body.variables || req.body;
    adminTmplLog.info(`Rendering template: ${name}`, vars);
    const result = renderTemplate(name, vars);
    if (!result) {
      res.status(404).json({ error: `Template '${name}' not found` });
      return;
    }
    res.json(result);
  });
}

// server/routes-admin-tier-limits.ts
init_logger();

// server/tiered-rate-limiter.ts
init_logger();
var tierRLLog = log.tag("TieredRateLimit");
var TIER_LIMITS = {
  free: { requestsPerMinute: 30, requestsPerHour: 500, requestsPerDay: 5e3, burstLimit: 10 },
  pro: { requestsPerMinute: 120, requestsPerHour: 3e3, requestsPerDay: 5e4, burstLimit: 30 },
  enterprise: { requestsPerMinute: 600, requestsPerHour: 2e4, requestsPerDay: 5e5, burstLimit: 100 },
  admin: { requestsPerMinute: 1e3, requestsPerHour: 5e4, requestsPerDay: 1e6, burstLimit: 200 }
};
var usage = /* @__PURE__ */ new Map();
function getUsage(key2) {
  return usage.get(key2) || null;
}
function getTierLimits(tier) {
  return { ...TIER_LIMITS[tier] };
}
function getAllTierLimits() {
  return JSON.parse(JSON.stringify(TIER_LIMITS));
}
function getUsageStats() {
  const byTier = { free: 0, pro: 0, enterprise: 0, admin: 0 };
  for (const record of usage.values()) {
    byTier[record.tier] = (byTier[record.tier] || 0) + 1;
  }
  return { totalTracked: usage.size, byTier };
}

// server/routes-admin-tier-limits.ts
var adminTierLog = log.tag("AdminTierLimits");
function registerAdminTierLimitRoutes(app2) {
  app2.get("/api/admin/tier-limits", (_req, res) => {
    adminTierLog.info("Fetching all tier limits");
    res.json(getAllTierLimits());
  });
  app2.get("/api/admin/tier-limits/usage/stats", (_req, res) => {
    adminTierLog.info("Fetching tier usage stats");
    res.json(getUsageStats());
  });
  app2.get("/api/admin/tier-limits/usage/:key", (req, res) => {
    const record = getUsage(req.params.key);
    if (!record) {
      return res.status(404).json({ error: "No usage record found for key" });
    }
    adminTierLog.info(`Fetching usage for key: ${req.params.key}`);
    res.json(record);
  });
  app2.get("/api/admin/tier-limits/:tier", (req, res) => {
    const tier = req.params.tier;
    const validTiers = ["free", "pro", "enterprise", "admin"];
    if (!validTiers.includes(tier)) {
      return res.status(400).json({ error: `Invalid tier: ${tier}. Must be one of: ${validTiers.join(", ")}` });
    }
    adminTierLog.info(`Fetching limits for tier: ${tier}`);
    res.json(getTierLimits(tier));
  });
}

// server/routes-admin-websocket.ts
init_logger();

// server/websocket-manager.ts
init_logger();
var wsLog = log.tag("WebSocketManager");
var connections = /* @__PURE__ */ new Map();
var memberConnections = /* @__PURE__ */ new Map();
var messageLog = [];
var MAX_MESSAGE_LOG = 1e3;
function getActiveConnections() {
  return Array.from(connections.values());
}
function broadcastToAll(message) {
  messageLog.unshift(message);
  if (messageLog.length > MAX_MESSAGE_LOG) messageLog.pop();
  return connections.size;
}
function getConnectionStats() {
  return {
    totalConnections: connections.size,
    uniqueMembers: memberConnections.size,
    messagesSent: messageLog.length
  };
}
function getRecentMessages(limit) {
  return messageLog.slice(0, limit || 20);
}

// server/routes-admin-websocket.ts
var adminWSLog = log.tag("AdminWebSocket");
function registerAdminWebSocketRoutes(app2) {
  app2.get("/api/admin/websocket/connections", (_req, res) => {
    adminWSLog.info("Fetching active WebSocket connections");
    res.json({ data: getActiveConnections() });
  });
  app2.get("/api/admin/websocket/stats", (_req, res) => {
    adminWSLog.info("Fetching WebSocket stats");
    res.json({ data: getConnectionStats() });
  });
  app2.get("/api/admin/websocket/messages", (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    adminWSLog.info(`Fetching recent messages (limit: ${limit})`);
    res.json({ data: getRecentMessages(limit) });
  });
  app2.post("/api/admin/websocket/broadcast", (req, res) => {
    const { message } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message (string) is required" });
    }
    const wsMessage = {
      type: "system",
      payload: { message },
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    const count15 = broadcastToAll(wsMessage);
    adminWSLog.info(`Broadcast system message to ${count15} connections`);
    res.json({ data: { delivered: count15, message } });
  });
}

// server/city-health-monitor.ts
init_logger();
var healthLog = log.tag("CityHealth");
var healthData = /* @__PURE__ */ new Map();
function getCityHealth(city) {
  return healthData.get(city) || null;
}
function getAllCityHealth() {
  return Array.from(healthData.values());
}
function getHealthySummary() {
  const all = Array.from(healthData.values());
  return {
    total: all.length,
    healthy: all.filter((c) => c.status === "healthy").length,
    degraded: all.filter((c) => c.status === "degraded").length,
    critical: all.filter((c) => c.status === "critical").length
  };
}

// server/routes-admin-health.ts
function registerAdminHealthRoutes(app2) {
  app2.get(
    "/api/admin/city-health/summary",
    requireAuth,
    wrapAsync(async (req, res) => {
      const summary = getHealthySummary();
      return res.json({ data: summary });
    })
  );
  app2.get(
    "/api/admin/city-health",
    requireAuth,
    wrapAsync(async (req, res) => {
      const all = getAllCityHealth();
      return res.json({ data: all });
    })
  );
  app2.get(
    "/api/admin/city-health/:city",
    requireAuth,
    wrapAsync(async (req, res) => {
      const city = req.params.city;
      const health = getCityHealth(city);
      if (!health) {
        return res.status(404).json({ error: `No health data for city: ${city}` });
      }
      return res.json({ data: health });
    })
  );
}

// server/routes-admin-photos.ts
init_logger();
init_photo_moderation();
var adminPhotoLog = log.tag("AdminPhotos");
function registerAdminPhotoRoutes(app2) {
  app2.get("/api/admin/photos/pending", async (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    adminPhotoLog.info(`Fetching pending photos (limit: ${limit})`);
    res.json(await getPendingPhotos(limit));
  });
  app2.get("/api/admin/photos/stats", async (_req, res) => {
    adminPhotoLog.info("Fetching photo stats");
    res.json(await getPhotoStats());
  });
  app2.post("/api/admin/photos/:id/approve", async (req, res) => {
    const { id } = req.params;
    const moderatorId = req.user?.id || "admin";
    const note = req.body?.note;
    adminPhotoLog.info(`Approving photo ${id}`);
    const success = await approvePhoto(id, moderatorId, note);
    if (!success) {
      return res.status(404).json({ error: "Photo not found or already reviewed" });
    }
    res.json({ success: true });
  });
  app2.post("/api/admin/photos/:id/reject", async (req, res) => {
    const { id } = req.params;
    const moderatorId = req.user?.id || "admin";
    const { reason, note } = req.body || {};
    if (!reason) {
      return res.status(400).json({ error: "Rejection reason is required" });
    }
    adminPhotoLog.info(`Rejecting photo ${id} (reason: ${reason})`);
    const success = await rejectPhoto(id, moderatorId, reason, note);
    if (!success) {
      return res.status(404).json({ error: "Photo not found or already reviewed" });
    }
    res.json({ success: true });
  });
  app2.get("/api/photos/business/:businessId", async (req, res) => {
    const { businessId } = req.params;
    adminPhotoLog.info(`Fetching approved photos for business ${businessId}`);
    res.json(await getPhotosByBusiness(businessId));
  });
}

// server/routes-admin-dietary.ts
init_logger();
init_db();
init_schema();
import { eq as eq23, and as and15, isNotNull } from "drizzle-orm";
var dietaryLog = log.tag("AdminDietary");
var VALID_TAGS = ["vegetarian", "vegan", "halal", "gluten_free"];
var CUISINE_TAG_SUGGESTIONS = {
  indian: ["vegetarian"],
  thai: ["gluten_free"],
  middle_eastern: ["halal"],
  mediterranean: ["vegetarian"],
  japanese: ["gluten_free"],
  mexican: ["gluten_free"],
  vegan: ["vegan", "vegetarian"],
  vegetarian: ["vegetarian"]
};
function registerAdminDietaryRoutes(app2) {
  app2.get("/api/admin/dietary/stats", async (_req, res) => {
    dietaryLog.info("Fetching dietary tag stats");
    const allBiz = await db.select({
      id: businesses.id,
      name: businesses.name,
      cuisine: businesses.cuisine,
      dietaryTags: businesses.dietaryTags
    }).from(businesses).where(eq23(businesses.isActive, true));
    const tagged = allBiz.filter((b) => Array.isArray(b.dietaryTags) && b.dietaryTags.length > 0);
    const untagged = allBiz.filter((b) => !Array.isArray(b.dietaryTags) || b.dietaryTags.length === 0);
    const tagCounts = {};
    for (const b of tagged) {
      for (const tag of b.dietaryTags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }
    res.json({
      total: allBiz.length,
      tagged: tagged.length,
      untagged: untagged.length,
      coveragePct: allBiz.length > 0 ? Math.round(tagged.length / allBiz.length * 100) : 0,
      tagCounts,
      validTags: [...VALID_TAGS]
    });
  });
  app2.put("/api/admin/dietary/:businessId", async (req, res) => {
    const { businessId } = req.params;
    const { tags } = req.body || {};
    if (!Array.isArray(tags)) {
      return res.status(400).json({ error: "tags must be an array" });
    }
    const invalidTags = tags.filter((t) => !VALID_TAGS.includes(t));
    if (invalidTags.length > 0) {
      return res.status(400).json({ error: `Invalid tags: ${invalidTags.join(", ")}. Valid: ${VALID_TAGS.join(", ")}` });
    }
    const result = await db.update(businesses).set({ dietaryTags: tags }).where(eq23(businesses.id, businessId)).returning({ id: businesses.id, name: businesses.name });
    if (result.length === 0) {
      return res.status(404).json({ error: "Business not found" });
    }
    dietaryLog.info(`Updated dietary tags for ${result[0].name}: [${tags.join(", ")}]`);
    res.json({ success: true, business: result[0].name, tags });
  });
  app2.post("/api/admin/dietary/auto-enrich", async (req, res) => {
    const { dryRun = true } = req.body || {};
    dietaryLog.info(`Auto-enrichment ${dryRun ? "(dry run)" : "(applying)"}`);
    const untagged = await db.select({
      id: businesses.id,
      name: businesses.name,
      cuisine: businesses.cuisine,
      dietaryTags: businesses.dietaryTags
    }).from(businesses).where(
      and15(
        eq23(businesses.isActive, true),
        isNotNull(businesses.cuisine)
      )
    );
    const suggestions = [];
    for (const biz of untagged) {
      const currentTags = Array.isArray(biz.dietaryTags) ? biz.dietaryTags : [];
      const cuisineLower = (biz.cuisine || "").toLowerCase().replace(/[^a-z_]/g, "_");
      const suggested = CUISINE_TAG_SUGGESTIONS[cuisineLower] || [];
      const newTags = suggested.filter((t) => !currentTags.includes(t));
      if (newTags.length > 0) {
        const merged = [.../* @__PURE__ */ new Set([...currentTags, ...newTags])];
        suggestions.push({
          id: biz.id,
          name: biz.name,
          cuisine: biz.cuisine || "",
          suggestedTags: newTags
        });
        if (!dryRun) {
          await db.update(businesses).set({ dietaryTags: merged }).where(eq23(businesses.id, biz.id));
        }
      }
    }
    dietaryLog.info(`Auto-enrichment: ${suggestions.length} businesses ${dryRun ? "would be" : "were"} updated`);
    res.json({
      dryRun,
      updated: suggestions.length,
      suggestions
    });
  });
  app2.get("/api/admin/dietary/businesses", async (req, res) => {
    const filter = req.query.filter;
    dietaryLog.info(`Listing businesses (filter: ${filter || "all"})`);
    const allBiz = await db.select({
      id: businesses.id,
      name: businesses.name,
      cuisine: businesses.cuisine,
      city: businesses.city,
      dietaryTags: businesses.dietaryTags
    }).from(businesses).where(eq23(businesses.isActive, true));
    let filtered = allBiz;
    if (filter === "tagged") {
      filtered = allBiz.filter((b) => Array.isArray(b.dietaryTags) && b.dietaryTags.length > 0);
    } else if (filter === "untagged") {
      filtered = allBiz.filter((b) => !Array.isArray(b.dietaryTags) || b.dietaryTags.length === 0);
    }
    res.json({ data: filtered, total: filtered.length });
  });
}

// server/routes-admin-enrichment.ts
init_logger();
init_db();
init_schema();
import { eq as eq24 } from "drizzle-orm";
init_admin();
var enrichLog = log.tag("AdminEnrichment");
function requireAdmin4(req, res, next) {
  if (!isAdminEmail(req.user?.email)) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}
function registerAdminEnrichmentRoutes(app2) {
  app2.get("/api/admin/enrichment/dashboard", requireAuth, requireAdmin4, async (_req, res) => {
    enrichLog.info("Generating enrichment dashboard");
    const allBiz = await db.select({
      id: businesses.id,
      name: businesses.name,
      city: businesses.city,
      cuisine: businesses.cuisine,
      dietaryTags: businesses.dietaryTags,
      openingHours: businesses.openingHours
    }).from(businesses).where(eq24(businesses.isActive, true));
    const dietaryTagged = allBiz.filter((b) => Array.isArray(b.dietaryTags) && b.dietaryTags.length > 0);
    const dietaryUntagged = allBiz.filter((b) => !Array.isArray(b.dietaryTags) || b.dietaryTags.length === 0);
    const tagCounts = {};
    for (const b of dietaryTagged) {
      for (const tag of b.dietaryTags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }
    const hasHours = allBiz.filter((b) => {
      const h = b.openingHours;
      return h && h.periods && h.periods.length > 0;
    });
    const missingHours = allBiz.filter((b) => {
      const h = b.openingHours;
      return !h || !h.periods || h.periods.length === 0;
    });
    let openLateCount = 0;
    let openWeekendsCount = 0;
    let has24Hour = 0;
    let avgPeriodsPerBiz = 0;
    let totalPeriods = 0;
    for (const b of hasHours) {
      const h = b.openingHours;
      if (isOpenLate(h)) openLateCount++;
      if (isOpenWeekends(h)) openWeekendsCount++;
      if (h.periods && h.periods.length === 1 && !h.periods[0].close) has24Hour++;
      totalPeriods += h.periods?.length || 0;
    }
    avgPeriodsPerBiz = hasHours.length > 0 ? Math.round(totalPeriods / hasHours.length * 10) / 10 : 0;
    const cities = [...new Set(allBiz.map((b) => b.city).filter(Boolean))];
    const cityBreakdown = cities.map((city) => {
      const cityBiz = allBiz.filter((b) => b.city === city);
      const cityDietary = cityBiz.filter((b) => Array.isArray(b.dietaryTags) && b.dietaryTags.length > 0);
      const cityHours = cityBiz.filter((b) => {
        const h = b.openingHours;
        return h && h.periods && h.periods.length > 0;
      });
      return {
        city,
        total: cityBiz.length,
        dietaryTagged: cityDietary.length,
        dietaryCoveragePct: cityBiz.length > 0 ? Math.round(cityDietary.length / cityBiz.length * 100) : 0,
        hoursPresent: cityHours.length,
        hoursCoveragePct: cityBiz.length > 0 ? Math.round(cityHours.length / cityBiz.length * 100) : 0
      };
    }).sort((a, b) => b.total - a.total);
    const missingBoth = allBiz.filter((b) => {
      const noDietary = !Array.isArray(b.dietaryTags) || b.dietaryTags.length === 0;
      const noHours = !b.openingHours?.periods?.length;
      return noDietary && noHours;
    }).map((b) => ({ id: b.id, name: b.name, city: b.city, cuisine: b.cuisine }));
    res.json({
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      total: allBiz.length,
      dietary: {
        tagged: dietaryTagged.length,
        untagged: dietaryUntagged.length,
        coveragePct: allBiz.length > 0 ? Math.round(dietaryTagged.length / allBiz.length * 100) : 0,
        tagCounts
      },
      hours: {
        present: hasHours.length,
        missing: missingHours.length,
        coveragePct: allBiz.length > 0 ? Math.round(hasHours.length / allBiz.length * 100) : 0,
        openLateCount,
        openWeekendsCount,
        has24Hour,
        avgPeriodsPerBiz
      },
      missingBoth: {
        count: missingBoth.length,
        businesses: missingBoth.slice(0, 50)
        // cap at 50 for response size
      },
      cityBreakdown
    });
  });
  app2.get("/api/admin/enrichment/hours-gaps", requireAuth, requireAdmin4, async (req, res) => {
    const city = req.query.city;
    enrichLog.info(`Fetching hours gaps${city ? ` for ${city}` : ""}`);
    let allBiz = await db.select({
      id: businesses.id,
      name: businesses.name,
      city: businesses.city,
      cuisine: businesses.cuisine,
      openingHours: businesses.openingHours
    }).from(businesses).where(eq24(businesses.isActive, true));
    if (city) {
      allBiz = allBiz.filter((b) => b.city === city);
    }
    const gaps = allBiz.filter((b) => {
      const h = b.openingHours;
      return !h || !h.periods || h.periods.length === 0;
    }).map((b) => ({
      id: b.id,
      name: b.name,
      city: b.city,
      cuisine: b.cuisine,
      hasWeekdayText: !!b.openingHours?.weekday_text?.length
    }));
    res.json({
      total: allBiz.length,
      missingHours: gaps.length,
      gaps
    });
  });
  app2.get("/api/admin/enrichment/dietary-gaps", requireAuth, requireAdmin4, async (req, res) => {
    const city = req.query.city;
    enrichLog.info(`Fetching dietary gaps${city ? ` for ${city}` : ""}`);
    let allBiz = await db.select({
      id: businesses.id,
      name: businesses.name,
      city: businesses.city,
      cuisine: businesses.cuisine,
      dietaryTags: businesses.dietaryTags
    }).from(businesses).where(eq24(businesses.isActive, true));
    if (city) {
      allBiz = allBiz.filter((b) => b.city === city);
    }
    const gaps = allBiz.filter((b) => {
      return !Array.isArray(b.dietaryTags) || b.dietaryTags.length === 0;
    }).map((b) => ({
      id: b.id,
      name: b.name,
      city: b.city,
      cuisine: b.cuisine
    }));
    res.json({
      total: allBiz.length,
      missingDietary: gaps.length,
      gaps
    });
  });
}

// server/routes-admin-enrichment-bulk.ts
init_logger();
init_db();
init_schema();
import { eq as eq25 } from "drizzle-orm";
init_admin();
var bulkLog = log.tag("AdminEnrichmentBulk");
function requireAdmin5(req, res, next) {
  if (!isAdminEmail(req.user?.email)) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}
var VALID_TAGS2 = ["vegetarian", "vegan", "halal", "gluten_free"];
function registerAdminEnrichmentBulkRoutes(app2) {
  app2.post("/api/admin/enrichment/bulk-dietary", requireAuth, requireAdmin5, async (req, res) => {
    const { businessIds, tags, mode = "merge" } = req.body || {};
    if (!Array.isArray(businessIds) || businessIds.length === 0) {
      return res.status(400).json({ error: "businessIds must be a non-empty array" });
    }
    if (!Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ error: "tags must be a non-empty array" });
    }
    const invalidTags = tags.filter((t) => !VALID_TAGS2.includes(t));
    if (invalidTags.length > 0) {
      return res.status(400).json({ error: `Invalid tags: ${invalidTags.join(", ")}` });
    }
    if (businessIds.length > 100) {
      return res.status(400).json({ error: "Maximum 100 businesses per batch" });
    }
    bulkLog.info(`Bulk dietary: ${businessIds.length} businesses, tags=[${tags}], mode=${mode}`);
    const results = [];
    for (const bizId of businessIds) {
      const [biz] = await db.select({
        id: businesses.id,
        name: businesses.name,
        dietaryTags: businesses.dietaryTags
      }).from(businesses).where(eq25(businesses.id, bizId));
      if (!biz) continue;
      const previousTags = Array.isArray(biz.dietaryTags) ? biz.dietaryTags : [];
      const newTags = mode === "replace" ? [...tags] : [.../* @__PURE__ */ new Set([...previousTags, ...tags])];
      await db.update(businesses).set({ dietaryTags: newTags }).where(eq25(businesses.id, bizId));
      results.push({ id: biz.id, name: biz.name, previousTags, newTags });
    }
    bulkLog.info(`Bulk dietary complete: ${results.length}/${businessIds.length} updated`);
    res.json({ updated: results.length, requested: businessIds.length, mode, results });
  });
  app2.post("/api/admin/enrichment/bulk-dietary-by-cuisine", requireAuth, requireAdmin5, async (req, res) => {
    const { cuisine, tags, city, dryRun = true } = req.body || {};
    if (!cuisine || typeof cuisine !== "string") {
      return res.status(400).json({ error: "cuisine is required" });
    }
    if (!Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ error: "tags must be a non-empty array" });
    }
    const invalidTags = tags.filter((t) => !VALID_TAGS2.includes(t));
    if (invalidTags.length > 0) {
      return res.status(400).json({ error: `Invalid tags: ${invalidTags.join(", ")}` });
    }
    bulkLog.info(`Bulk dietary by cuisine: ${cuisine}, tags=[${tags}], city=${city || "all"}, dryRun=${dryRun}`);
    let allBiz = await db.select({
      id: businesses.id,
      name: businesses.name,
      cuisine: businesses.cuisine,
      city: businesses.city,
      dietaryTags: businesses.dietaryTags
    }).from(businesses).where(eq25(businesses.isActive, true));
    allBiz = allBiz.filter((b) => b.cuisine?.toLowerCase() === cuisine.toLowerCase());
    if (city) {
      allBiz = allBiz.filter((b) => b.city === city);
    }
    const updates = [];
    for (const biz of allBiz) {
      const previousTags = Array.isArray(biz.dietaryTags) ? biz.dietaryTags : [];
      const newTags = [.../* @__PURE__ */ new Set([...previousTags, ...tags])];
      if (newTags.length === previousTags.length && newTags.every((t) => previousTags.includes(t))) {
        continue;
      }
      if (!dryRun) {
        await db.update(businesses).set({ dietaryTags: newTags }).where(eq25(businesses.id, biz.id));
      }
      updates.push({ id: biz.id, name: biz.name, previousTags, newTags });
    }
    bulkLog.info(`Bulk by cuisine ${dryRun ? "(dry run)" : ""}: ${updates.length}/${allBiz.length} ${dryRun ? "would be" : "were"} updated`);
    res.json({
      dryRun,
      cuisine,
      city: city || "all",
      matched: allBiz.length,
      updated: updates.length,
      updates: updates.slice(0, 50)
      // cap for response size
    });
  });
  app2.post("/api/admin/enrichment/bulk-hours", requireAuth, requireAdmin5, async (req, res) => {
    const { businessIds, hoursData, source = "manual", dryRun = true } = req.body || {};
    if (!Array.isArray(businessIds) || businessIds.length === 0) {
      return res.status(400).json({ error: "businessIds must be a non-empty array" });
    }
    if (!hoursData || typeof hoursData !== "object") {
      return res.status(400).json({ error: "hoursData must be a valid hours object" });
    }
    if (businessIds.length > 50) {
      return res.status(400).json({ error: "Maximum 50 businesses per hours batch" });
    }
    const VALID_SOURCES = ["manual", "google_places", "import"];
    if (!VALID_SOURCES.includes(source)) {
      return res.status(400).json({ error: `Invalid source: ${source}. Must be one of: ${VALID_SOURCES.join(", ")}` });
    }
    const periods = hoursData.periods;
    if (periods && !Array.isArray(periods)) {
      return res.status(400).json({ error: "hoursData.periods must be an array" });
    }
    if (periods) {
      for (const p of periods) {
        if (!p.open || typeof p.open.day !== "number" || typeof p.open.time !== "string") {
          return res.status(400).json({ error: "Each period must have open.day (number) and open.time (string)" });
        }
      }
    }
    bulkLog.info(`Bulk hours: ${businessIds.length} businesses, source=${source}, dryRun=${dryRun}`);
    const results = [];
    for (const bizId of businessIds) {
      const [biz] = await db.select({
        id: businesses.id,
        name: businesses.name,
        openingHours: businesses.openingHours
      }).from(businesses).where(eq25(businesses.id, bizId));
      if (!biz) continue;
      const prevHours = biz.openingHours;
      const hadHours = !!(prevHours && prevHours.periods && prevHours.periods.length > 0);
      if (!dryRun) {
        await db.update(businesses).set({ openingHours: hoursData }).where(eq25(businesses.id, bizId));
      }
      results.push({
        id: biz.id,
        name: biz.name,
        hadHours,
        periodsCount: periods?.length || 0
      });
    }
    bulkLog.info(`Bulk hours ${dryRun ? "(dry run)" : ""}: ${results.length}/${businessIds.length} ${dryRun ? "would be" : "were"} updated`);
    res.json({
      dryRun,
      source,
      requested: businessIds.length,
      updated: results.length,
      results: results.slice(0, 50)
    });
  });
}

// server/routes-city-stats.ts
init_logger();
init_db();
init_schema();
import { eq as eq26, and as and16, gte as gte8 } from "drizzle-orm";
var cityLog = log.tag("CityStats");
function registerCityStatsRoutes(app2) {
  app2.get("/api/city-stats/:city", async (req, res) => {
    const city = req.params.city;
    cityLog.info(`Fetching city stats for ${city}`);
    const activeBiz = await db.select({
      id: businesses.id,
      weightedScore: businesses.weightedScore,
      totalRatings: businesses.totalRatings
    }).from(businesses).where(
      and16(eq26(businesses.city, city), eq26(businesses.isActive, true))
    );
    if (activeBiz.length === 0) {
      return res.json({
        city,
        totalBusinesses: 0,
        avgWeightedScore: 0,
        avgRatingCount: 0,
        avgWouldReturnPct: 0,
        recentRatingsCount: 0,
        dimensionAvgs: {}
      });
    }
    const scores = activeBiz.map((b) => parseFloat(b.weightedScore || "0")).filter((s) => s > 0);
    const avgWeightedScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 100) / 100 : 0;
    const ratingCounts = activeBiz.map((b) => b.totalRatings || 0);
    const avgRatingCount = Math.round(ratingCounts.reduce((a, b) => a + b, 0) / ratingCounts.length);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3);
    const recentRatings = await db.select({
      wouldReturn: ratings.wouldReturn,
      q1Score: ratings.q1Score,
      q2Score: ratings.q2Score,
      q3Score: ratings.q3Score
    }).from(ratings).where(
      gte8(ratings.createdAt, thirtyDaysAgo)
    );
    const withReturn = recentRatings.filter((r) => r.wouldReturn != null);
    const avgWouldReturnPct = withReturn.length > 0 ? Math.round(withReturn.filter((r) => r.wouldReturn).length / withReturn.length * 100) : 0;
    const dimensionAvgs = {};
    const dimKeys = [
      { key: "q1Score", label: "food" },
      { key: "q2Score", label: "service" },
      { key: "q3Score", label: "vibe" }
    ];
    for (const { key: key2, label } of dimKeys) {
      const vals = recentRatings.map((r) => parseFloat(String(r[key2] || "0"))).filter((v) => v > 0);
      if (vals.length > 0) {
        dimensionAvgs[label] = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 100) / 100;
      }
    }
    const result = {
      city,
      totalBusinesses: activeBiz.length,
      avgWeightedScore,
      avgRatingCount,
      avgWouldReturnPct,
      recentRatingsCount: recentRatings.length,
      dimensionAvgs
    };
    cityLog.info(`City stats for ${city}: ${activeBiz.length} businesses, avg score ${avgWeightedScore}`);
    res.json(result);
  });
}

// server/routes-push.ts
init_logger();

// server/push-notifications.ts
init_logger();
import crypto10 from "crypto";
var pushLog2 = log.tag("PushNotifications");
var tokens = /* @__PURE__ */ new Map();
var messageLog2 = [];
var MAX_MESSAGES = 5e3;
function registerPushToken(memberId, token, platform) {
  if (!tokens.has(memberId)) tokens.set(memberId, []);
  const existing = tokens.get(memberId).find((t) => t.token === token);
  if (existing) {
    existing.lastUsed = (/* @__PURE__ */ new Date()).toISOString();
    return existing;
  }
  const entry = {
    memberId,
    token,
    platform,
    registeredAt: (/* @__PURE__ */ new Date()).toISOString(),
    lastUsed: (/* @__PURE__ */ new Date()).toISOString()
  };
  tokens.get(memberId).push(entry);
  pushLog2.info(`Push token registered: ${platform} for ${memberId}`);
  return entry;
}
function removePushToken(memberId, token) {
  const list = tokens.get(memberId);
  if (!list) return false;
  const idx = list.findIndex((t) => t.token === token);
  if (idx === -1) return false;
  list.splice(idx, 1);
  if (list.length === 0) tokens.delete(memberId);
  return true;
}
function getMemberTokens(memberId) {
  return tokens.get(memberId) || [];
}
function sendPushNotification2(memberId, title, body, data) {
  const msg = {
    id: crypto10.randomUUID(),
    memberId,
    title,
    body,
    data,
    status: "queued",
    sentAt: null,
    error: null
  };
  const memberTokens = tokens.get(memberId);
  if (!memberTokens || memberTokens.length === 0) {
    msg.status = "failed";
    msg.error = "No push tokens registered";
  } else {
    msg.status = "sent";
    msg.sentAt = (/* @__PURE__ */ new Date()).toISOString();
    pushLog2.info(`Push sent to ${memberId}: ${title}`);
  }
  messageLog2.unshift(msg);
  if (messageLog2.length > MAX_MESSAGES) messageLog2.pop();
  return msg;
}
function sendBulkPush(memberIds, title, body, data) {
  let sent = 0, failed = 0;
  for (const id of memberIds) {
    const msg = sendPushNotification2(id, title, body, data);
    if (msg.status === "sent") sent++;
    else failed++;
  }
  return { sent, failed };
}
function getPushStats() {
  let totalTokens = 0;
  for (const list of tokens.values()) totalTokens += list.length;
  return {
    totalTokens,
    uniqueMembers: tokens.size,
    messagesSent: messageLog2.filter((m) => m.status === "sent").length,
    messagesFailed: messageLog2.filter((m) => m.status === "failed").length
  };
}

// server/routes-push.ts
var pushRouteLog = log.tag("PushRoutes");
function registerPushRoutes(app2) {
  app2.post("/api/push/register", requireAuth, (req, res) => {
    const memberId = req.user?.id || req.memberId;
    if (!memberId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const { token, platform } = req.body;
    if (!token || typeof token !== "string") {
      return res.status(400).json({ error: "token is required" });
    }
    if (!platform || !["ios", "android", "web"].includes(platform)) {
      return res.status(400).json({ error: "platform must be ios, android, or web" });
    }
    const result = registerPushToken(memberId, token, platform);
    pushRouteLog.info(`Token registered for member ${memberId}`);
    res.json({ token: result });
  });
  app2.delete("/api/push/token", requireAuth, (req, res) => {
    const memberId = req.user?.id || req.memberId;
    if (!memberId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const { token } = req.body;
    if (!token || typeof token !== "string") {
      return res.status(400).json({ error: "token is required" });
    }
    const removed = removePushToken(memberId, token);
    if (!removed) {
      return res.status(404).json({ error: "Token not found" });
    }
    pushRouteLog.info(`Token removed for member ${memberId}`);
    res.json({ removed: true });
  });
  app2.get("/api/push/tokens", requireAuth, (req, res) => {
    const memberId = req.user?.id || req.memberId;
    if (!memberId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const tokens2 = getMemberTokens(memberId);
    res.json({ tokens: tokens2 });
  });
  app2.get("/api/admin/push/stats", requireAuth, (req, res) => {
    const user = req.user;
    if (!user?.role || user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    const stats2 = getPushStats();
    res.json({ stats: stats2 });
  });
  app2.post("/api/admin/push/broadcast", requireAuth, (req, res) => {
    const user = req.user;
    if (!user?.role || user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    const { memberIds, title, body, data } = req.body;
    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ error: "memberIds array is required" });
    }
    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "title is required" });
    }
    if (!body || typeof body !== "string") {
      return res.status(400).json({ error: "body is required" });
    }
    const result = sendBulkPush(memberIds, title, body, data);
    pushRouteLog.info(`Broadcast sent: ${result.sent} sent, ${result.failed} failed`);
    res.json({ result });
  });
}

// server/routes-owner-dashboard.ts
init_logger();

// server/business-analytics.ts
init_logger();
var bizAnalyticsLog = log.tag("BusinessAnalytics");
var viewEvents = [];
function getBusinessMetrics(businessId, period) {
  const now = Date.now();
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const cutoff = new Date(now - days * 24 * 60 * 60 * 1e3).toISOString();
  const relevant = viewEvents.filter(
    (e) => e.businessId === businessId && e.timestamp >= cutoff
  );
  const uniqueVisitorSet = new Set(relevant.map((e) => e.visitorId));
  bizAnalyticsLog.info(
    `Metrics for ${businessId} (${period}): ${relevant.length} views, ${uniqueVisitorSet.size} unique`
  );
  return {
    businessId,
    views: relevant.length,
    uniqueVisitors: uniqueVisitorSet.size,
    ratingsReceived: 0,
    // Would be populated from DB
    averageRating: 0,
    searchAppearances: relevant.filter((e) => e.source === "search").length,
    profileClicks: relevant.filter((e) => e.source === "direct").length,
    bookmarks: 0,
    // Would be populated from DB
    challengerAppearances: relevant.filter((e) => e.source === "challenger").length,
    period
  };
}
function getTopBusinesses(limit) {
  const counts = /* @__PURE__ */ new Map();
  for (const e of viewEvents) {
    counts.set(e.businessId, (counts.get(e.businessId) || 0) + 1);
  }
  return Array.from(counts.entries()).map(([businessId, views]) => ({ businessId, views })).sort((a, b) => b.views - a.views).slice(0, limit || 10);
}
function getViewSources(businessId) {
  const sources = {
    search: 0,
    direct: 0,
    challenger: 0,
    referral: 0
  };
  for (const e of viewEvents) {
    if (e.businessId === businessId) {
      sources[e.source] = (sources[e.source] || 0) + 1;
    }
  }
  return sources;
}
function getAnalyticsStats() {
  const businesses2 = new Set(viewEvents.map((e) => e.businessId));
  const visitors = new Set(viewEvents.map((e) => e.visitorId));
  return {
    totalEvents: viewEvents.length,
    uniqueBusinesses: businesses2.size,
    uniqueVisitors: visitors.size
  };
}

// server/routes-owner-dashboard.ts
var ownerDashLog = log.tag("OwnerDashboard");
function registerOwnerDashboardRoutes(app2) {
  app2.get("/api/owner/analytics/:businessId", (req, res) => {
    const { businessId } = req.params;
    const period = req.query.period || "30d";
    ownerDashLog.info(`Fetching analytics for business ${businessId} (${period})`);
    res.json(getBusinessMetrics(businessId, period));
  });
  app2.get("/api/owner/analytics/:businessId/sources", (req, res) => {
    const { businessId } = req.params;
    ownerDashLog.info(`Fetching view sources for business ${businessId}`);
    res.json(getViewSources(businessId));
  });
  app2.get("/api/owner/analytics/:businessId/trends", (req, res) => {
    const { businessId } = req.params;
    ownerDashLog.info(`Fetching trends for business ${businessId}`);
    res.json({
      weekly: getBusinessMetrics(businessId, "7d"),
      monthly: getBusinessMetrics(businessId, "30d")
    });
  });
  app2.get("/api/admin/analytics/top-businesses", (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    ownerDashLog.info(`Fetching top businesses (limit: ${limit})`);
    res.json(getTopBusinesses(limit));
  });
  app2.get("/api/admin/analytics/stats", (_req, res) => {
    ownerDashLog.info("Fetching analytics stats");
    res.json(getAnalyticsStats());
  });
}

// server/routes-search.ts
init_logger();

// server/search-suggestions.ts
init_logger();
var suggestLog = log.tag("SearchSuggestions");
var suggestionIndex = /* @__PURE__ */ new Map();
function getSuggestions(query, city, limit) {
  const index2 = suggestionIndex.get(city) || [];
  const q = query.toLowerCase();
  return index2.filter((s) => s.text.toLowerCase().includes(q)).sort((a, b) => b.score - a.score).slice(0, limit || 10);
}
function getPopularSearches(city, limit) {
  const index2 = suggestionIndex.get(city) || [];
  return index2.filter((s) => s.type === "business").sort((a, b) => b.score - a.score).slice(0, limit || 5);
}
function getCitySuggestionCount(city) {
  return (suggestionIndex.get(city) || []).length;
}
function getAllIndexedCities() {
  return Array.from(suggestionIndex.keys());
}

// server/routes-search.ts
var searchRouteLog = log.tag("SearchRoutes");
function registerSearchRoutes(app2) {
  app2.get("/api/search/suggestions", (req, res) => {
    const query = sanitizeString(req.query.q, 200) || "";
    const city = sanitizeString(req.query.city, 100) || "Dallas";
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    if (!query) {
      return res.json({ data: [] });
    }
    const suggestions = getSuggestions(query, city, limit);
    searchRouteLog.info(`Suggestions for "${query}" in ${city}: ${suggestions.length} results`);
    return res.json({ data: suggestions });
  });
  app2.get("/api/search/popular", (req, res) => {
    const city = sanitizeString(req.query.city, 100) || "Dallas";
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 5));
    const popular = getPopularSearches(city, limit);
    return res.json({ data: popular });
  });
  app2.get("/api/admin/search/index-stats", (req, res) => {
    const cities = getAllIndexedCities();
    const stats2 = cities.map((city) => ({
      city,
      count: getCitySuggestionCount(city)
    }));
    return res.json({ data: { cities: stats2, totalCities: cities.length } });
  });
}

// shared/best-in-categories.ts
var BEST_IN_CATEGORIES = [
  // ── Indian Cuisine ───────────────────────────────────────
  { slug: "biryani", displayName: "Biryani", emoji: "\u{1F35A}", parentCategory: "restaurant", cuisine: "indian", city: "Dallas", description: "Find the best biryani in Dallas, rated by real diners", tags: ["hyderabadi", "dum biryani", "chicken biryani", "goat biryani", "veg biryani"], isActive: true, sortOrder: 1 },
  { slug: "dosa", displayName: "Dosa", emoji: "\u{1FAD3}", parentCategory: "restaurant", cuisine: "indian", city: "Dallas", description: "Find the best dosa in Dallas", tags: ["masala dosa", "paper dosa", "mysore dosa", "rava dosa", "onion dosa"], isActive: true, sortOrder: 2 },
  { slug: "butter-chicken", displayName: "Butter Chicken", emoji: "\u{1F357}", parentCategory: "restaurant", cuisine: "indian", city: "Dallas", description: "Find the best butter chicken in Dallas", tags: ["murgh makhani", "tikka masala", "chicken curry"], isActive: true, sortOrder: 3 },
  { slug: "chai", displayName: "Chai", emoji: "\u2615", parentCategory: "cafe", cuisine: "indian", city: "Dallas", description: "Find the best chai in Dallas", tags: ["masala chai", "cutting chai", "karak", "adrak chai"], isActive: true, sortOrder: 4 },
  { slug: "samosa", displayName: "Samosa", emoji: "\u{1F95F}", parentCategory: "restaurant", cuisine: "indian", city: "Dallas", description: "Find the best samosa in Dallas", tags: ["aloo samosa", "keema samosa", "samosa chaat"], isActive: true, sortOrder: 5 },
  { slug: "tandoori", displayName: "Tandoori", emoji: "\u{1F356}", parentCategory: "restaurant", cuisine: "indian", city: "Dallas", description: "Find the best tandoori in Dallas", tags: ["tandoori chicken", "seekh kebab", "naan", "tandoori paneer"], isActive: true, sortOrder: 6 },
  { slug: "chaat", displayName: "Chaat", emoji: "\u{1F963}", parentCategory: "street_food", cuisine: "indian", city: "Dallas", description: "Find the best chaat in Dallas", tags: ["pani puri", "bhel puri", "dahi puri", "sev puri", "papdi chaat"], isActive: true, sortOrder: 7 },
  { slug: "thali", displayName: "Thali", emoji: "\u{1F371}", parentCategory: "restaurant", cuisine: "indian", city: "Dallas", description: "Find the best thali in Dallas", tags: ["gujarati thali", "south indian thali", "rajasthani thali", "punjabi thali"], isActive: true, sortOrder: 8 },
  // ── Mexican Cuisine ──────────────────────────────────────
  { slug: "tacos", displayName: "Tacos", emoji: "\u{1F32E}", parentCategory: "restaurant", cuisine: "mexican", city: "Dallas", description: "Find the best tacos in Dallas", tags: ["street tacos", "al pastor", "carnitas", "birria", "barbacoa"], isActive: true, sortOrder: 10 },
  { slug: "burritos", displayName: "Burritos", emoji: "\u{1F32F}", parentCategory: "restaurant", cuisine: "mexican", city: "Dallas", description: "Find the best burritos in Dallas", tags: ["carne asada", "breakfast burrito", "wet burrito", "california burrito"], isActive: true, sortOrder: 11 },
  { slug: "enchiladas", displayName: "Enchiladas", emoji: "\u{1F336}", parentCategory: "restaurant", cuisine: "mexican", city: "Dallas", description: "Find the best enchiladas in Dallas", tags: ["cheese enchiladas", "mole", "verde", "suizas"], isActive: true, sortOrder: 12 },
  { slug: "queso", displayName: "Queso", emoji: "\u{1F9C0}", parentCategory: "restaurant", cuisine: "mexican", city: "Dallas", description: "Find the best queso in Dallas", tags: ["chile con queso", "queso fundido", "queso flameado"], isActive: true, sortOrder: 13 },
  { slug: "margaritas", displayName: "Margaritas", emoji: "\u{1F379}", parentCategory: "bar", cuisine: "mexican", city: "Dallas", description: "Find the best margaritas in Dallas", tags: ["frozen margarita", "top shelf", "spicy margarita", "mango"], isActive: true, sortOrder: 14 },
  { slug: "tamales", displayName: "Tamales", emoji: "\u{1FAD4}", parentCategory: "restaurant", cuisine: "mexican", city: "Dallas", description: "Find the best tamales in Dallas", tags: ["pork tamales", "chicken tamales", "sweet tamales", "rajas"], isActive: true, sortOrder: 15 },
  // ── Japanese Cuisine ─────────────────────────────────────
  { slug: "sushi", displayName: "Sushi", emoji: "\u{1F363}", parentCategory: "restaurant", cuisine: "japanese", city: "Dallas", description: "Find the best sushi in Dallas", tags: ["omakase", "nigiri", "sashimi", "rolls", "chirashi"], isActive: true, sortOrder: 20 },
  { slug: "ramen", displayName: "Ramen", emoji: "\u{1F35C}", parentCategory: "restaurant", cuisine: "japanese", city: "Dallas", description: "Find the best ramen in Dallas", tags: ["tonkotsu", "miso", "shoyu", "spicy", "tsukemen"], isActive: true, sortOrder: 21 },
  { slug: "udon", displayName: "Udon", emoji: "\u{1F35C}", parentCategory: "restaurant", cuisine: "japanese", city: "Dallas", description: "Find the best udon in Dallas", tags: ["tempura udon", "kitsune udon", "nabeyaki", "yaki udon"], isActive: true, sortOrder: 22 },
  { slug: "katsu", displayName: "Katsu", emoji: "\u{1F371}", parentCategory: "restaurant", cuisine: "japanese", city: "Dallas", description: "Find the best katsu in Dallas", tags: ["tonkatsu", "chicken katsu", "katsu curry", "katsu sando"], isActive: true, sortOrder: 23 },
  // ── Chinese Cuisine ──────────────────────────────────────
  { slug: "dim-sum", displayName: "Dim Sum", emoji: "\u{1F95F}", parentCategory: "restaurant", cuisine: "chinese", city: "Dallas", description: "Find the best dim sum in Dallas", tags: ["har gow", "siu mai", "char siu bao", "egg tart", "cheung fun"], isActive: true, sortOrder: 25 },
  { slug: "hot-pot", displayName: "Hot Pot", emoji: "\u{1FAD5}", parentCategory: "restaurant", cuisine: "chinese", city: "Dallas", description: "Find the best hot pot in Dallas", tags: ["sichuan hot pot", "mala", "shabu shabu", "mongolian"], isActive: true, sortOrder: 26 },
  { slug: "kung-pao", displayName: "Kung Pao", emoji: "\u{1F336}", parentCategory: "restaurant", cuisine: "chinese", city: "Dallas", description: "Find the best kung pao in Dallas", tags: ["kung pao chicken", "mapo tofu", "dan dan noodles"], isActive: true, sortOrder: 27 },
  { slug: "peking-duck", displayName: "Peking Duck", emoji: "\u{1F986}", parentCategory: "restaurant", cuisine: "chinese", city: "Dallas", description: "Find the best Peking duck in Dallas", tags: ["roast duck", "crispy duck", "duck pancakes"], isActive: true, sortOrder: 28 },
  // ── Vietnamese Cuisine ───────────────────────────────────
  { slug: "pho", displayName: "Pho", emoji: "\u{1F35C}", parentCategory: "restaurant", cuisine: "vietnamese", city: "Dallas", description: "Find the best pho in Dallas", tags: ["pho bo", "pho ga", "bun bo hue", "pho tai"], isActive: true, sortOrder: 30 },
  { slug: "banh-mi", displayName: "Banh Mi", emoji: "\u{1F956}", parentCategory: "restaurant", cuisine: "vietnamese", city: "Dallas", description: "Find the best banh mi in Dallas", tags: ["pork banh mi", "grilled chicken", "tofu banh mi", "pate"], isActive: true, sortOrder: 31 },
  { slug: "bun-bo-hue", displayName: "Bun Bo Hue", emoji: "\u{1F35C}", parentCategory: "restaurant", cuisine: "vietnamese", city: "Dallas", description: "Find the best bun bo hue in Dallas", tags: ["spicy beef noodle", "vermicelli", "lemongrass"], isActive: true, sortOrder: 32 },
  // ── Korean Cuisine ───────────────────────────────────────
  { slug: "korean-bbq", displayName: "Korean BBQ", emoji: "\u{1F969}", parentCategory: "restaurant", cuisine: "korean", city: "Dallas", description: "Find the best Korean BBQ in Dallas", tags: ["galbi", "bulgogi", "samgyeopsal", "banchan"], isActive: true, sortOrder: 35 },
  { slug: "bibimbap", displayName: "Bibimbap", emoji: "\u{1F35A}", parentCategory: "restaurant", cuisine: "korean", city: "Dallas", description: "Find the best bibimbap in Dallas", tags: ["dolsot bibimbap", "stone pot", "mixed rice"], isActive: true, sortOrder: 36 },
  { slug: "fried-chicken", displayName: "Fried Chicken", emoji: "\u{1F357}", parentCategory: "restaurant", cuisine: "korean", city: "Dallas", description: "Find the best Korean fried chicken in Dallas", tags: ["korean fried", "yangnyeom", "dakgangjeong", "honey butter"], isActive: true, sortOrder: 37 },
  // ── Thai Cuisine ─────────────────────────────────────────
  { slug: "pad-thai", displayName: "Pad Thai", emoji: "\u{1F35C}", parentCategory: "restaurant", cuisine: "thai", city: "Dallas", description: "Find the best pad thai in Dallas", tags: ["shrimp pad thai", "chicken pad thai", "tofu pad thai"], isActive: true, sortOrder: 40 },
  { slug: "green-curry", displayName: "Green Curry", emoji: "\u{1F35B}", parentCategory: "restaurant", cuisine: "thai", city: "Dallas", description: "Find the best green curry in Dallas", tags: ["green curry", "red curry", "massaman", "panang"], isActive: true, sortOrder: 41 },
  { slug: "mango-sticky-rice", displayName: "Mango Sticky Rice", emoji: "\u{1F96D}", parentCategory: "dessert", cuisine: "thai", city: "Dallas", description: "Find the best mango sticky rice in Dallas", tags: ["khao niaow ma muang", "coconut cream", "sticky rice"], isActive: true, sortOrder: 42 },
  // ── Italian Cuisine ──────────────────────────────────────
  { slug: "pizza", displayName: "Pizza", emoji: "\u{1F355}", parentCategory: "pizza", cuisine: "italian", city: "Dallas", description: "Find the best pizza in Dallas", tags: ["neapolitan", "ny style", "deep dish", "wood fired", "margherita"], isActive: true, sortOrder: 45 },
  { slug: "pasta", displayName: "Pasta", emoji: "\u{1F35D}", parentCategory: "restaurant", cuisine: "italian", city: "Dallas", description: "Find the best pasta in Dallas", tags: ["carbonara", "cacio e pepe", "bolognese", "pesto", "amatriciana"], isActive: true, sortOrder: 46 },
  { slug: "tiramisu", displayName: "Tiramisu", emoji: "\u{1F370}", parentCategory: "dessert", cuisine: "italian", city: "Dallas", description: "Find the best tiramisu in Dallas", tags: ["classic tiramisu", "espresso", "mascarpone"], isActive: true, sortOrder: 47 },
  { slug: "gelato", displayName: "Gelato", emoji: "\u{1F366}", parentCategory: "dessert", cuisine: "italian", city: "Dallas", description: "Find the best gelato in Dallas", tags: ["pistachio", "stracciatella", "hazelnut", "artisan gelato"], isActive: true, sortOrder: 48 },
  // ── American / BBQ / Southern ────────────────────────────
  { slug: "bbq", displayName: "BBQ", emoji: "\u{1F525}", parentCategory: "bbq", cuisine: "american", city: "Dallas", description: "Find the best BBQ in Dallas", tags: ["brisket", "ribs", "pulled pork", "smoked", "texas bbq"], isActive: true, sortOrder: 50 },
  { slug: "burgers", displayName: "Burgers", emoji: "\u{1F354}", parentCategory: "restaurant", cuisine: "american", city: "Dallas", description: "Find the best burgers in Dallas", tags: ["smash burger", "wagyu", "double stack", "cheeseburger"], isActive: true, sortOrder: 51 },
  { slug: "wings", displayName: "Wings", emoji: "\u{1F357}", parentCategory: "restaurant", cuisine: "american", city: "Dallas", description: "Find the best wings in Dallas", tags: ["buffalo", "lemon pepper", "hot wings", "garlic parmesan"], isActive: true, sortOrder: 52 },
  { slug: "brisket", displayName: "Brisket", emoji: "\u{1F969}", parentCategory: "bbq", cuisine: "american", city: "Dallas", description: "Find the best brisket in Dallas", tags: ["texas brisket", "smoked brisket", "salt and pepper", "post oak"], isActive: true, sortOrder: 53 },
  { slug: "southern-fried-chicken", displayName: "Southern Fried Chicken", emoji: "\u{1F357}", parentCategory: "restaurant", cuisine: "american", city: "Dallas", description: "Find the best fried chicken in Dallas", tags: ["nashville hot", "southern", "buttermilk", "honey butter"], isActive: true, sortOrder: 54 },
  { slug: "mac-and-cheese", displayName: "Mac & Cheese", emoji: "\u{1F9C0}", parentCategory: "restaurant", cuisine: "american", city: "Dallas", description: "Find the best mac and cheese in Dallas", tags: ["baked mac", "smoked gouda", "truffle mac", "lobster mac"], isActive: true, sortOrder: 55 },
  // ── Mediterranean / Middle Eastern ───────────────────────
  { slug: "shawarma", displayName: "Shawarma", emoji: "\u{1F959}", parentCategory: "restaurant", cuisine: "mediterranean", city: "Dallas", description: "Find the best shawarma in Dallas", tags: ["chicken shawarma", "beef shawarma", "shawarma plate", "garlic sauce"], isActive: true, sortOrder: 60 },
  { slug: "falafel", displayName: "Falafel", emoji: "\u{1F9C6}", parentCategory: "restaurant", cuisine: "mediterranean", city: "Dallas", description: "Find the best falafel in Dallas", tags: ["falafel wrap", "falafel plate", "hummus", "tahini"], isActive: true, sortOrder: 61 },
  { slug: "hummus", displayName: "Hummus", emoji: "\u{1F963}", parentCategory: "restaurant", cuisine: "mediterranean", city: "Dallas", description: "Find the best hummus in Dallas", tags: ["classic hummus", "spicy hummus", "roasted garlic", "pita"], isActive: true, sortOrder: 62 },
  // ── Universal (Drinks & Desserts) ────────────────────────
  { slug: "coffee", displayName: "Coffee", emoji: "\u2615", parentCategory: "cafe", cuisine: "universal", city: "Dallas", description: "Find the best coffee in Dallas", tags: ["espresso", "cold brew", "pour over", "latte", "cortado"], isActive: true, sortOrder: 70 },
  { slug: "bubble-tea", displayName: "Bubble Tea", emoji: "\u{1F9CB}", parentCategory: "cafe", cuisine: "universal", city: "Dallas", description: "Find the best bubble tea in Dallas", tags: ["boba", "taro", "matcha", "brown sugar", "tiger milk"], isActive: true, sortOrder: 71 },
  { slug: "ice-cream", displayName: "Ice Cream", emoji: "\u{1F366}", parentCategory: "dessert", cuisine: "universal", city: "Dallas", description: "Find the best ice cream in Dallas", tags: ["gelato", "kulfi", "soft serve", "artisan", "rolled ice cream"], isActive: true, sortOrder: 72 },
  { slug: "brunch", displayName: "Brunch", emoji: "\u{1F95E}", parentCategory: "restaurant", cuisine: "universal", city: "Dallas", description: "Find the best brunch in Dallas", tags: ["mimosa", "eggs benedict", "french toast", "pancakes", "avocado toast"], isActive: true, sortOrder: 73 }
];
function getActiveCategories() {
  return BEST_IN_CATEGORIES.filter((c) => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
}
function getAvailableCuisines() {
  return [...new Set(BEST_IN_CATEGORIES.filter((c) => c.isActive).map((c) => c.cuisine))];
}
function getCategoryBySlug(slug) {
  return BEST_IN_CATEGORIES.find((c) => c.slug === slug);
}
function searchCategories(query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return BEST_IN_CATEGORIES.filter(
    (c) => c.slug.toLowerCase().includes(q) || c.displayName.toLowerCase().includes(q) || c.cuisine.toLowerCase().includes(q) || c.tags.some((t) => t.toLowerCase().includes(q))
  );
}
function getBestInTitle(slug, city) {
  const cat = getCategoryBySlug(slug);
  const name = cat ? cat.displayName : slug;
  const targetCity = city || (cat ? cat.city : "Dallas");
  return `Best ${name} in ${targetCity}`;
}
function getCategoryCount() {
  return {
    total: BEST_IN_CATEGORIES.length,
    active: BEST_IN_CATEGORIES.filter((c) => c.isActive).length,
    cuisines: getAvailableCuisines().length
  };
}

// server/routes-best-in.ts
function generateLeaderboardEntries(_slug) {
  return [];
}
function registerBestInRoutes(app2) {
  app2.get("/api/best-in", wrapAsync(async (req, res) => {
    const categories2 = getActiveCategories();
    return res.json({ data: categories2 });
  }));
  app2.get("/api/best-in/search", wrapAsync(async (req, res) => {
    const q = sanitizeString(req.query.q, 200) || "";
    if (!q) return res.json({ data: [] });
    const results = searchCategories(q);
    return res.json({ data: results });
  }));
  app2.get("/api/best-in/:slug", wrapAsync(async (req, res) => {
    const slug = req.params.slug;
    const category = getCategoryBySlug(slug);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    const title = getBestInTitle(slug);
    return res.json({
      data: {
        ...category,
        title,
        businesses: []
        // TODO: wire to storage layer
      }
    });
  }));
  app2.get("/api/best-in/:slug/leaderboard", wrapAsync(async (req, res) => {
    const slug = req.params.slug;
    const category = getCategoryBySlug(slug);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    const city = sanitizeString(req.query.city, 100) || category.city;
    const title = getBestInTitle(slug, city);
    const leaderboard = generateLeaderboardEntries(slug);
    const message = leaderboard.length === 0 ? "Not enough ratings yet. Be one of the first to rate!" : void 0;
    return res.json({
      data: {
        category: { slug: category.slug, displayName: category.displayName, emoji: category.emoji },
        title,
        leaderboard,
        message
      }
    });
  }));
  app2.get("/api/admin/best-in/stats", requireAuth, wrapAsync(async (req, res) => {
    const counts = getCategoryCount();
    const byParent = {};
    for (const cat of BEST_IN_CATEGORIES) {
      byParent[cat.parentCategory] = (byParent[cat.parentCategory] || 0) + 1;
    }
    return res.json({
      data: {
        ...counts,
        byParent
      }
    });
  }));
}

// server/routes-rating-photos.ts
init_file_storage();
init_logger();
import crypto11 from "crypto";
var photoLog = log.tag("RatingPhoto");
var ALLOWED_MIME_TYPES2 = ["image/jpeg", "image/png", "image/webp"];
var MAX_FILE_SIZE2 = 10 * 1024 * 1024;
var PHOTO_BOOST = 0.15;
var MAX_VERIFICATION_BOOST = 0.5;
function registerRatingPhotoRoutes(app2) {
  app2.post("/api/ratings/:id/photo", requireAuth, wrapAsync(async (req, res) => {
    const ratingId = req.params.id;
    const memberId = req.user.id;
    const { getRatingById: getRatingById2 } = await Promise.resolve().then(() => (init_ratings(), ratings_exports));
    const rating = await getRatingById2(ratingId);
    if (!rating) {
      return res.status(404).json({ error: "Rating not found" });
    }
    if (rating.memberId !== memberId) {
      return res.status(403).json({ error: "Cannot upload photo for another user's rating" });
    }
    const { data: photoData, mimeType: rawMime, isReceipt } = req.body;
    const mimeType = sanitizeString(rawMime, 50) || "image/jpeg";
    if (!photoData || typeof photoData !== "string") {
      return res.status(400).json({ error: "Photo data is required (base64)" });
    }
    if (!ALLOWED_MIME_TYPES2.includes(mimeType)) {
      return res.status(400).json({ error: `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES2.join(", ")}` });
    }
    const buffer2 = Buffer.from(photoData, "base64");
    if (buffer2.length > MAX_FILE_SIZE2) {
      return res.status(400).json({ error: "Photo too large (max 10MB)" });
    }
    if (buffer2.length < 1024) {
      return res.status(400).json({ error: "Photo too small \u2014 may be corrupted" });
    }
    const ext = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
    const cdnKey = `rating-photos/${rating.businessId}/${ratingId}-${crypto11.randomUUID().slice(0, 8)}.${ext}`;
    try {
      const photoUrl = await fileStorage.upload(cdnKey, buffer2, mimeType);
      const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
      const { ratingPhotos: ratingPhotos2, ratings: ratings5 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq29 } = await import("drizzle-orm");
      const [photo] = await db2.insert(ratingPhotos2).values({
        ratingId,
        photoUrl,
        cdnKey,
        isVerifiedReceipt: isReceipt === true
      }).returning();
      const photoBoost = PHOTO_BOOST;
      const receiptBoost = isReceipt === true ? 0.25 : 0;
      const totalBoost = Math.min(photoBoost + receiptBoost, MAX_VERIFICATION_BOOST);
      const currentBoost = parseFloat(String(rating.verificationBoost ?? "0"));
      const newBoost = Math.min(currentBoost + totalBoost, MAX_VERIFICATION_BOOST);
      await db2.update(ratings5).set({
        hasPhoto: true,
        hasReceipt: isReceipt === true ? true : void 0,
        verificationBoost: newBoost.toFixed(3)
      }).where(eq29(ratings5.id, ratingId));
      const { recalculateBusinessScore: recalculateBusinessScore2, recalculateRanks: recalculateRanks2 } = await Promise.resolve().then(() => (init_businesses(), businesses_exports));
      const { getBusinessById: getBusinessById2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      await recalculateBusinessScore2(rating.businessId);
      const biz = await getBusinessById2(rating.businessId);
      if (biz) await recalculateRanks2(biz.city, biz.category);
      photoLog.info("Rating photo uploaded", {
        ratingId,
        memberId,
        cdnKey,
        isReceipt: isReceipt === true,
        boost: totalBoost
      });
      return res.status(201).json({
        data: {
          id: photo.id,
          photoUrl,
          isReceipt: isReceipt === true,
          verificationBoost: totalBoost
        }
      });
    } catch (err) {
      photoLog.error("Photo upload failed", { ratingId, error: err.message });
      return res.status(500).json({ error: "Photo upload failed. Please try again." });
    }
  }));
  app2.get("/api/ratings/:id/photos", wrapAsync(async (req, res) => {
    const ratingId = req.params.id;
    const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { ratingPhotos: ratingPhotos2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq29 } = await import("drizzle-orm");
    const photos = await db2.select().from(ratingPhotos2).where(eq29(ratingPhotos2.ratingId, ratingId));
    return res.json({ data: photos });
  }));
}

// server/routes-score-breakdown.ts
init_logger();
init_score_engine();
var breakdownLog = log.tag("ScoreBreakdown");
function registerScoreBreakdownRoutes(app2) {
  app2.get("/api/businesses/:id/score-breakdown", wrapAsync(async (req, res) => {
    const businessId = req.params.id;
    const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { ratings: ratings5 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq29, and: and19, sql: sql18, count: count15 } = await import("drizzle-orm");
    const allRatings = await db2.select({
      visitType: ratings5.visitType,
      foodScore: ratings5.foodScore,
      serviceScore: ratings5.serviceScore,
      vibeScore: ratings5.vibeScore,
      packagingScore: ratings5.packagingScore,
      waitTimeScore: ratings5.waitTimeScore,
      valueScore: ratings5.valueScore,
      compositeScore: ratings5.compositeScore,
      rawScore: ratings5.rawScore,
      weight: ratings5.weight,
      weightedScore: ratings5.weightedScore,
      effectiveWeight: ratings5.effectiveWeight,
      verificationBoost: ratings5.verificationBoost,
      hasPhoto: ratings5.hasPhoto,
      hasReceipt: ratings5.hasReceipt,
      wouldReturn: ratings5.wouldReturn,
      createdAt: ratings5.createdAt
    }).from(ratings5).where(and19(
      eq29(ratings5.businessId, businessId),
      eq29(ratings5.isFlagged, false)
    ));
    if (allRatings.length === 0) {
      return res.json({
        data: {
          totalRatings: 0,
          overallScore: 0,
          foodScoreOnly: 0,
          dineIn: null,
          delivery: null,
          takeaway: null,
          verifiedPercentage: 0,
          wouldReturnPercentage: 0,
          raterDistribution: { dineIn: 0, delivery: 0, takeaway: 0 }
        }
      });
    }
    const dineIn = allRatings.filter((r) => r.visitType === "dine_in");
    const delivery = allRatings.filter((r) => r.visitType === "delivery");
    const takeaway = allRatings.filter((r) => r.visitType === "takeaway");
    const weightedAvg = (items, field) => {
      let num = 0, den = 0;
      for (const r of items) {
        const val = parseFloat(String(r[field] ?? 0));
        const w = parseFloat(String(r.effectiveWeight ?? r.weight ?? 1));
        const ageDays = Math.floor(
          (Date.now() - new Date(r.createdAt).getTime()) / (1e3 * 60 * 60 * 24)
        );
        const decay = computeDecayFactor(ageDays);
        const decayedW = w * decay;
        num += val * decayedW;
        den += decayedW;
      }
      return den > 0 ? Math.round(num / den * 100) / 100 : 0;
    };
    const overallScore = weightedAvg(allRatings, "compositeScore");
    const foodScoreOnly = weightedAvg(allRatings, "foodScore");
    const visitBreakdown = (items) => {
      if (items.length === 0) return null;
      return {
        count: items.length,
        overallScore: weightedAvg(items, "compositeScore"),
        foodScore: weightedAvg(items, "foodScore")
      };
    };
    const withPhoto = allRatings.filter((r) => r.hasPhoto).length;
    const verifiedPercentage = Math.round(withPhoto / allRatings.length * 100);
    const returners = allRatings.filter((r) => r.wouldReturn).length;
    const wouldReturnPercentage = Math.round(returners / allRatings.length * 100);
    breakdownLog.info("Score breakdown served", {
      businessId,
      totalRatings: allRatings.length
    });
    return res.json({
      data: {
        totalRatings: allRatings.length,
        overallScore,
        foodScoreOnly,
        dineIn: visitBreakdown(dineIn),
        delivery: visitBreakdown(delivery),
        takeaway: visitBreakdown(takeaway),
        verifiedPercentage,
        wouldReturnPercentage,
        raterDistribution: {
          dineIn: dineIn.length,
          delivery: delivery.length,
          takeaway: takeaway.length
        }
      }
    });
  }));
  app2.get("/api/businesses/:id/score-trend", wrapAsync(async (req, res) => {
    const businessId = req.params.id;
    const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { rankHistory: rankHistory2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq29, asc: asc3 } = await import("drizzle-orm");
    const history = await db2.select({
      date: rankHistory2.snapshotDate,
      score: rankHistory2.weightedScore
    }).from(rankHistory2).where(eq29(rankHistory2.businessId, businessId)).orderBy(asc3(rankHistory2.snapshotDate)).limit(90);
    const data = history.map((h) => ({
      date: h.date,
      score: parseFloat(h.score)
    }));
    return res.json({ data });
  }));
}

// server/routes.ts
init_stripe_webhook();
init_logger();
init_storage();
init_schema();
init_analytics2();
init_tier_staleness();

// server/rating-integrity.ts
init_logger();
var integrityLog = log.tag("RatingIntegrity");
var claimedBusinesses = /* @__PURE__ */ new Map();
var blockedSelfRatingCount = 0;
function checkOwnerSelfRating(businessId, raterId, raterIp) {
  const claim = claimedBusinesses.get(businessId);
  if (!claim) {
    return { allowed: true };
  }
  if (raterId === claim.ownerId) {
    blockedSelfRatingCount++;
    integrityLog.warn("Owner self-rating blocked", { businessId, raterId });
    return {
      allowed: false,
      reason: "As the business owner, you cannot rate your own restaurant. This ensures trust and fairness for all users."
    };
  }
  if (raterIp && claim.claimIp && raterIp === claim.claimIp) {
    blockedSelfRatingCount++;
    integrityLog.warn("Potential self-rating from claim IP", {
      businessId,
      raterId,
      raterIp
    });
    return {
      allowed: false,
      reason: "As the business owner, you cannot rate your own restaurant. This ensures trust and fairness for all users."
    };
  }
  return { allowed: true };
}
var ratingLog = [];
var velocityFlagCount = 0;
var MAX_RATING_LOG = 1e5;
function logRatingSubmission(businessId, raterId, raterIp) {
  ratingLog.push({ businessId, raterId, raterIp, timestamp: Date.now() });
  if (ratingLog.length > MAX_RATING_LOG) {
    ratingLog.splice(0, ratingLog.length - MAX_RATING_LOG);
  }
  integrityLog.debug("Rating submission logged", { businessId, raterId });
}
function checkVelocity(businessId, raterId, raterIp) {
  const now = Date.now();
  const HOUR = 36e5;
  const DAY = 864e5;
  const sameIpSameBiz24h = ratingLog.filter(
    (e) => e.businessId === businessId && e.raterIp === raterIp && now - e.timestamp < DAY
  );
  if (sameIpSameBiz24h.length > 5) {
    velocityFlagCount++;
    integrityLog.warn("Velocity V1: >5 same-IP same-business in 24h", {
      businessId,
      raterIp,
      count: sameIpSameBiz24h.length
    });
    return { flagged: true, rule: "V1", reducedWeight: 0.05 };
  }
  const sameAccount1h = ratingLog.filter(
    (e) => e.raterId === raterId && now - e.timestamp < HOUR
  );
  if (sameAccount1h.length > 10) {
    velocityFlagCount++;
    integrityLog.warn("Velocity V2: >10 ratings from account in 1h", {
      raterId,
      count: sameAccount1h.length
    });
    return { flagged: true, rule: "V2", reducedWeight: 0.05 };
  }
  const sameBiz12h = ratingLog.filter(
    (e) => e.businessId === businessId && now - e.timestamp < 12 * HOUR
  );
  if (sameBiz12h.length > 20) {
    velocityFlagCount++;
    integrityLog.warn("Velocity V3: >20 ratings for business in 12h", {
      businessId,
      count: sameBiz12h.length
    });
    return { flagged: true, rule: "V3", reducedWeight: 0.05 };
  }
  const raterHistory = ratingLog.filter((e) => e.raterId === raterId).sort((a, b) => a.timestamp - b.timestamp);
  if (raterHistory.length >= 2) {
    const lastTwo = raterHistory.slice(-2);
    const gap = lastTwo[1].timestamp - lastTwo[0].timestamp;
    if (gap > 30 * DAY) {
      velocityFlagCount++;
      integrityLog.warn("Velocity V4: Inactive >30 days then rated", {
        raterId,
        gapDays: Math.round(gap / DAY)
      });
      return { flagged: true, rule: "V4", reducedWeight: 0.05 };
    }
  }
  return { flagged: false, reducedWeight: 1 };
}

// server/routes.ts
async function registerRoutes(app2) {
  setupAuth(app2);
  app2.use("/api", (req, res, next) => {
    const start = Date.now();
    const originalEnd = res.end;
    res.end = function(...args) {
      const duration = Date.now() - start;
      const method = req.method;
      const url = req.originalUrl || req.url;
      const status = res.statusCode;
      if (duration > 200) {
        log.warn(`[SLOW] ${method} ${url} ${status} ${duration}ms`);
      } else {
        log.info(`${method} ${url} ${status} ${duration}ms`);
      }
      return originalEnd.apply(this, args);
    };
    next();
  });
  app2.get("/api/health", (req, res) => {
    const uptime = process.uptime();
    const memUsage = process.memoryUsage();
    res.json({
      status: "healthy",
      version: "1.0.0",
      uptime: Math.floor(uptime),
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      nodeVersion: process.version,
      memoryUsage: memUsage.heapUsed,
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        rss: Math.round(memUsage.rss / 1024 / 1024)
      }
    });
  });
  const SSE_MAX_PER_IP = 5;
  const SSE_TIMEOUT_MS = 18e5;
  const sseConnectionsByIp = /* @__PURE__ */ new Map();
  app2.get("/api/events", (req, res) => {
    const clientIp = req.ip || req.socket.remoteAddress || "unknown";
    const currentCount = sseConnectionsByIp.get(clientIp) || 0;
    if (currentCount >= SSE_MAX_PER_IP) {
      log.warn(`SSE rate limit: ${clientIp} exceeded ${SSE_MAX_PER_IP} concurrent connections`);
      return res.status(429).json({ error: "Too many SSE connections from this IP" });
    }
    sseConnectionsByIp.set(clientIp, currentCount + 1);
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    });
    res.write('data: {"type":"connected","timestamp":' + Date.now() + "}\n\n");
    addClient(res);
    const keepAlive = setInterval(() => {
      try {
        res.write(": ping\n\n");
      } catch {
        clearInterval(keepAlive);
      }
    }, 3e4);
    const timeout = setTimeout(() => {
      try {
        res.end();
      } catch {
      }
    }, SSE_TIMEOUT_MS);
    const cleanup = () => {
      clearInterval(keepAlive);
      clearTimeout(timeout);
      const count15 = sseConnectionsByIp.get(clientIp) || 1;
      if (count15 <= 1) {
        sseConnectionsByIp.delete(clientIp);
      } else {
        sseConnectionsByIp.set(clientIp, count15 - 1);
      }
    };
    req.on("close", cleanup);
  });
  registerAuthRoutes(app2);
  app2.get("/api/leaderboard", wrapAsync(async (req, res) => {
    const city = sanitizeString(req.query.city, 100) || "Dallas";
    const category = sanitizeString(req.query.category, 50) || "restaurant";
    const cuisine = sanitizeString(req.query.cuisine, 50) || void 0;
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const bizList = await getLeaderboard(city, category, limit, cuisine);
    const bizIds = bizList.map((b) => b.id);
    const [photoMap, dishRankingsMap] = await Promise.all([
      getBusinessPhotosMap(bizIds),
      getBatchDishRankings(bizIds)
    ]);
    const data = bizList.map((b) => ({
      ...b,
      photoUrls: photoMap[b.id] || (b.photoUrl ? [b.photoUrl] : []),
      dishRankings: dishRankingsMap[b.id] || []
    }));
    return res.json({ data });
  }));
  app2.get("/api/featured", wrapAsync(async (req, res) => {
    const city = sanitizeString(req.query.city, 100) || "Dallas";
    const placements = await getActiveFeaturedInCity(city);
    if (placements.length === 0) {
      return res.json({ data: [] });
    }
    const bizIds = placements.map((p) => p.businessId);
    const [bizList, photoMap] = await Promise.all([
      getBusinessesByIds(bizIds),
      getBusinessPhotosMap(bizIds)
    ]);
    const bizMap = new Map(bizList.map((b) => [b.id, b]));
    const featured = placements.map((p) => {
      const biz = bizMap.get(p.businessId);
      if (!biz) return null;
      return {
        id: biz.id,
        name: biz.name,
        slug: biz.slug,
        category: biz.category,
        photoUrl: (photoMap[biz.id] || [])[0] || biz.photoUrl || void 0,
        weightedScore: biz.weightedScore || 0,
        tagline: biz.tagline || `Top ${biz.category} in ${city}`,
        totalRatings: biz.totalRatings || 0,
        expiresAt: p.expiresAt
      };
    }).filter(Boolean);
    return res.json({ data: featured });
  }));
  app2.get("/api/leaderboard/categories", wrapAsync(async (req, res) => {
    const city = sanitizeString(req.query.city, 100) || "Dallas";
    const data = await getAllCategories(city);
    return res.json({ data });
  }));
  app2.get("/api/leaderboard/cuisines", wrapAsync(async (req, res) => {
    const city = sanitizeString(req.query.city, 100) || "Dallas";
    const category = sanitizeString(req.query.category, 50) || void 0;
    const data = await getCuisines(city, category);
    return res.json({ data });
  }));
  registerBusinessRoutes(app2);
  registerPaymentRoutes(app2);
  app2.get("/api/dishes/search", wrapAsync(async (req, res) => {
    const businessId = req.query.business_id;
    const query = sanitizeString(req.query.q, 200);
    if (!businessId) return res.status(400).json({ error: "business_id required" });
    const data = await searchDishes(businessId, query);
    return res.json({ data });
  }));
  registerDishRoutes(app2);
  registerSeoRoutes(app2);
  registerQrRoutes(app2);
  registerNotificationRoutes(app2);
  registerReferralRoutes(app2);
  app2.post("/api/ratings", requireAuth, wrapAsync(async (req, res) => {
    try {
      const parsed = insertRatingSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }
      parsed.data.q1Score = sanitizeNumber(parsed.data.q1Score, 1, 5, 3);
      parsed.data.q2Score = sanitizeNumber(parsed.data.q2Score, 1, 5, 3);
      parsed.data.q3Score = sanitizeNumber(parsed.data.q3Score, 1, 5, 3);
      const memberId = req.user.id;
      const raterIp = req.ip || req.socket.remoteAddress || "unknown";
      const ownerCheck = checkOwnerSelfRating(parsed.data.businessId, memberId, raterIp);
      if (!ownerCheck.allowed) {
        trackEvent("rating_rejected_owner_self", memberId, { businessId: parsed.data.businessId });
        return res.status(403).json({ error: ownerCheck.reason });
      }
      const velocityCheck = checkVelocity(parsed.data.businessId, memberId, raterIp);
      if (velocityCheck.flagged) {
        log.warn(`Velocity flag ${velocityCheck.rule} for member ${memberId} on business ${parsed.data.businessId}`);
      }
      logRatingSubmission(parsed.data.businessId, memberId, raterIp);
      const result = await submitRating(memberId, parsed.data, {
        velocityFlagged: velocityCheck.flagged,
        velocityRule: velocityCheck.rule,
        velocityWeight: velocityCheck.reducedWeight
      });
      const verifiedTier = checkAndRefreshTier(result.newTier, result.newCredibilityScore);
      if (verifiedTier !== result.newTier) {
        result.newTier = verifiedTier;
        result.tierUpgraded = verifiedTier !== req.user.credibilityTier;
      }
      broadcast("rating_submitted", { businessId: parsed.data.businessId, memberId });
      broadcast("ranking_updated", { businessId: parsed.data.businessId });
      broadcast("challenger_updated", { businessId: parsed.data.businessId });
      trackEvent("first_rating", memberId);
      trackEvent("rating_submitted", memberId, { businessId: parsed.data.businessId });
      if (result.tierUpgraded && req.user.pushToken) {
        const { notifyTierUpgrade: notifyTierUpgrade2 } = await Promise.resolve().then(() => (init_push(), push_exports));
        notifyTierUpgrade2(memberId, req.user.pushToken, result.newTier).catch(() => {
        });
      }
      try {
        const { invalidatePrerenderCache: invalidatePrerenderCache2 } = await Promise.resolve().then(() => (init_prerender(), prerender_exports));
        const { getBusinessById: getBusinessById2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
        const biz = await getBusinessById2(parsed.data.businessId);
        if (biz?.slug) invalidatePrerenderCache2("biz", biz.slug);
      } catch {
      }
      const userExperiments = getUserExperiments(String(memberId));
      for (const expId of userExperiments) {
        trackOutcome(String(memberId), expId, "rated", parsed.data.q1Score);
      }
      return res.status(201).json({ data: result });
    } catch (err) {
      const memberId = req.user?.id;
      const businessId = req.body?.businessId;
      if (err.message.includes("3+ days")) {
        trackEvent("rating_rejected_account_age", memberId, { businessId });
        return res.status(403).json({ error: err.message });
      }
      if (err.message.includes("Already rated")) {
        trackEvent("rating_rejected_duplicate", memberId, { businessId });
        return res.status(409).json({ error: err.message });
      }
      if (err.message.includes("suspended")) {
        trackEvent("rating_rejected_suspended", memberId, { businessId });
        return res.status(403).json({ error: err.message });
      }
      if (err.message.includes("business owner")) {
        trackEvent("rating_rejected_owner_self", memberId, { businessId });
        return res.status(403).json({ error: err.message });
      }
      trackEvent("rating_rejected_unknown", memberId, { businessId, error: err.message });
      return res.status(400).json({ error: err.message });
    }
  }));
  app2.patch("/api/ratings/:id", requireAuth, wrapAsync(async (req, res) => {
    const { editRating: editRating2 } = await Promise.resolve().then(() => (init_ratings(), ratings_exports));
    const ratingId = req.params.id;
    const updates = {
      q1Score: req.body.q1Score ? sanitizeNumber(req.body.q1Score, 1, 5, void 0) : void 0,
      q2Score: req.body.q2Score ? sanitizeNumber(req.body.q2Score, 1, 5, void 0) : void 0,
      q3Score: req.body.q3Score ? sanitizeNumber(req.body.q3Score, 1, 5, void 0) : void 0,
      wouldReturn: req.body.wouldReturn,
      note: req.body.note !== void 0 ? sanitizeString(req.body.note, 160) : void 0
    };
    try {
      const updated = await editRating2(ratingId, req.user.id, updates);
      broadcast("rating_updated", { ratingId, businessId: updated.businessId });
      return res.json({ data: updated });
    } catch (err) {
      if (err.message.includes("not found")) return res.status(404).json({ error: err.message });
      if (err.message.includes("Cannot edit")) return res.status(403).json({ error: err.message });
      if (err.message.includes("expired")) return res.status(403).json({ error: err.message });
      return res.status(400).json({ error: err.message });
    }
  }));
  app2.delete("/api/ratings/:id", requireAuth, wrapAsync(async (req, res) => {
    const { deleteRating: deleteRating2 } = await Promise.resolve().then(() => (init_ratings(), ratings_exports));
    try {
      await deleteRating2(req.params.id, req.user.id);
      broadcast("rating_deleted", { ratingId: req.params.id });
      return res.json({ data: { deleted: true } });
    } catch (err) {
      if (err.message.includes("not found")) return res.status(404).json({ error: err.message });
      if (err.message.includes("Cannot delete")) return res.status(403).json({ error: err.message });
      return res.status(400).json({ error: err.message });
    }
  }));
  app2.post("/api/ratings/:id/flag", requireAuth, wrapAsync(async (req, res) => {
    const { submitRatingFlag: submitRatingFlag2 } = await Promise.resolve().then(() => (init_ratings(), ratings_exports));
    try {
      const flag = await submitRatingFlag2(req.params.id, req.user.id, {
        q1NoSpecificExperience: req.body.q1NoSpecificExperience,
        q2ScoreMismatchNote: req.body.q2ScoreMismatchNote,
        q3InsiderSuspected: req.body.q3InsiderSuspected,
        q4CoordinatedPattern: req.body.q4CoordinatedPattern,
        q5CompetitorBombing: req.body.q5CompetitorBombing,
        explanation: sanitizeString(req.body.explanation, 500)
      });
      return res.status(201).json({ data: flag });
    } catch (err) {
      if (err.message.includes("not found")) return res.status(404).json({ error: err.message });
      if (err.message.includes("own rating")) return res.status(403).json({ error: err.message });
      if (err.message.includes("unique") || err.message.includes("duplicate")) {
        return res.status(409).json({ error: "You have already flagged this rating" });
      }
      return res.status(400).json({ error: err.message });
    }
  }));
  registerMemberRoutes(app2);
  app2.get("/api/challengers/active", wrapAsync(async (req, res) => {
    const city = sanitizeString(req.query.city, 100) || "Dallas";
    const category = sanitizeString(req.query.category, 50) || void 0;
    const data = await getActiveChallenges(city, category);
    return res.json({ data });
  }));
  app2.get("/api/trending", wrapAsync(async (req, res) => {
    const { getTrendingBusinesses: getTrendingBusinesses2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const city = sanitizeString(req.query.city, 100) || "Dallas";
    const limit = Math.min(10, Math.max(1, parseInt(req.query.limit) || 3));
    const bizList = await getTrendingBusinesses2(city, limit);
    const photoMap = await getBusinessPhotosMap(bizList.map((b) => b.id));
    const data = bizList.map((b) => ({
      ...b,
      photoUrls: photoMap[b.id] || (b.photoUrl ? [b.photoUrl] : [])
    }));
    return res.json({ data });
  }));
  app2.post("/api/category-suggestions", requireAuth, wrapAsync(async (req, res) => {
    const parsed = insertCategorySuggestionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }
    const { createCategorySuggestion: createCategorySuggestion2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const suggestion = await createCategorySuggestion2({
      ...parsed.data,
      suggestedBy: req.user.id
    });
    return res.status(201).json({ data: suggestion });
  }));
  app2.get("/api/category-suggestions", wrapAsync(async (req, res) => {
    const { getPendingSuggestions: getPendingSuggestions2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const data = await getPendingSuggestions2();
    return res.json({ data });
  }));
  app2.get("/api/photos/proxy", wrapAsync(handlePhotoProxy));
  app2.post("/api/webhook/stripe", wrapAsync(handleStripeWebhook));
  app2.get("/api/payments/history", requireAuth, wrapAsync(async (req, res) => {
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const payments2 = await getMemberPayments(req.user.id, limit);
    return res.json({ data: payments2 });
  }));
  app2.post("/api/webhook/deploy", wrapAsync(handleWebhook));
  app2.get("/api/deploy/status", wrapAsync(handleDeployStatus));
  app2.get("/share/badge/:badgeId", wrapAsync(handleBadgeShare));
  app2.post("/api/feedback", requireAuth, wrapAsync(async (req, res) => {
    const { createFeedback: createFeedback2 } = await Promise.resolve().then(() => (init_feedback(), feedback_exports));
    const { rating, category, message, screenContext, appVersion } = req.body;
    if (!rating || !category || !message) {
      return res.status(400).json({ error: "rating, category, and message are required" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "rating must be 1-5" });
    }
    if (!["bug", "feature", "praise", "other"].includes(category)) {
      return res.status(400).json({ error: "category must be bug, feature, praise, or other" });
    }
    const feedback = await createFeedback2({
      memberId: req.user.id,
      rating: Math.round(rating),
      category,
      message: String(message).slice(0, 2e3),
      screenContext: screenContext ? String(screenContext).slice(0, 100) : void 0,
      appVersion: appVersion ? String(appVersion).slice(0, 50) : void 0
    });
    return res.status(201).json({ data: feedback });
  }));
  registerBadgeRoutes(app2);
  registerAdminRoutes(app2);
  registerExperimentRoutes(app2);
  registerAdminExperimentRoutes(app2);
  registerUnsubscribeRoutes(app2);
  registerWebhookRoutes(app2);
  registerAdminPromotionRoutes(app2);
  registerAdminRateLimitRoutes(app2);
  registerAdminClaimVerificationRoutes(app2);
  registerAdminReputationRoutes(app2);
  registerAdminModerationRoutes(app2);
  registerAdminRankingRoutes(app2);
  registerOwnerDashboardRoutes(app2);
  registerAdminTemplateRoutes(app2);
  registerAdminTierLimitRoutes(app2);
  registerAdminWebSocketRoutes(app2);
  registerAdminHealthRoutes(app2);
  registerAdminPhotoRoutes(app2);
  registerAdminDietaryRoutes(app2);
  registerAdminEnrichmentRoutes(app2);
  registerAdminEnrichmentBulkRoutes(app2);
  registerCityStatsRoutes(app2);
  registerPushRoutes(app2);
  registerSearchRoutes(app2);
  registerBestInRoutes(app2);
  registerRatingPhotoRoutes(app2);
  registerScoreBreakdownRoutes(app2);
  const httpServer = createServer(app2);
  return httpServer;
}

// server/index.ts
init_logger();
import * as fs2 from "fs";
import * as path2 from "path";
import { createProxyMiddleware } from "http-proxy-middleware";

// server/security-headers.ts
function buildAllowedOrigins() {
  const origins = /* @__PURE__ */ new Set();
  origins.add("https://topranker.com");
  origins.add("https://www.topranker.com");
  origins.add("https://topranker.io");
  origins.add("https://www.topranker.io");
  const envOrigins = process.env.CORS_ORIGINS;
  if (envOrigins) {
    envOrigins.split(",").forEach((o) => {
      const trimmed = o.trim();
      if (trimmed) origins.add(trimmed);
    });
  }
  const railwayDomain = process.env.RAILWAY_PUBLIC_DOMAIN;
  if (railwayDomain) {
    origins.add(`https://${railwayDomain}`);
  }
  return origins;
}
var allowedOrigins = buildAllowedOrigins();
function isLocalhostOrigin(origin) {
  return origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:");
}
function securityHeaders(req, res, next) {
  const isDev = process.env.NODE_ENV !== "production";
  const origin = req.headers.origin;
  if (isDev) {
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, expo-platform");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Max-Age", "86400");
    }
    if (req.method === "OPTIONS") {
      return res.status(204).end();
    }
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("X-API-Version", "1.0.0");
    const requestId2 = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    res.setHeader("X-Request-Id", requestId2);
    return next();
  }
  const wildcardAllowed = allowedOrigins.has("*");
  if (origin && (wildcardAllowed || allowedOrigins.has(origin) || isLocalhostOrigin(origin))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Max-Age", "86400");
  }
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self), payment=(self)"
  );
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://maps.googleapis.com https://maps.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.stripe.com https://api.resend.com https://maps.googleapis.com https://maps.gstatic.com https://accounts.google.com https://oauth2.googleapis.com",
    "frame-src 'self' https://accounts.google.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join("; ");
  res.setHeader("Content-Security-Policy", csp);
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );
  res.setHeader("X-API-Version", "1.0.0");
  const requestId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  res.setHeader("X-Request-Id", requestId);
  next();
}

// server/index.ts
init_error_tracking();

// server/cache-headers.ts
var CACHE_RULES = {
  "/api/leaderboard": { public: true, maxAge: 300, staleWhileRevalidate: 60 },
  "/api/trending": { public: true, maxAge: 600, staleWhileRevalidate: 120 },
  "/api/leaderboard/categories": { public: true, maxAge: 7200 },
  "/api/businesses/popular-categories": { public: true, maxAge: 3600 },
  "/api/businesses/autocomplete": { public: true, maxAge: 30 },
  "/api/businesses/search": { public: true, maxAge: 30 },
  "/api/featured": { public: true, maxAge: 300 },
  "/api/health": { public: true, maxAge: 10 },
  "/api/referrals/validate": { public: true, maxAge: 60 }
};
function cacheHeaders(req, res, next) {
  if (req.method !== "GET") {
    res.setHeader("Cache-Control", "no-store");
    return next();
  }
  const path3 = req.path;
  const config2 = CACHE_RULES[path3];
  if (config2) {
    const parts = [];
    parts.push(config2.public ? "public" : "private");
    parts.push(`max-age=${config2.maxAge}`);
    if (config2.staleWhileRevalidate) {
      parts.push(`stale-while-revalidate=${config2.staleWhileRevalidate}`);
    }
    res.setHeader("Cache-Control", parts.join(", "));
  } else if (path3.startsWith("/api/")) {
    res.setHeader("Cache-Control", "private, no-cache");
  }
  next();
}

// server/index.ts
init_analytics2();
var app = express();
var log2 = console.log;
initErrorTracking();
(async () => {
  try {
    const { persistAnalyticsEvents: persistAnalyticsEvents2 } = await Promise.resolve().then(() => (init_analytics(), analytics_exports));
    setFlushHandler(persistAnalyticsEvents2, 3e4);
  } catch {
  }
})();
function setupBodyParsing(app2) {
  app2.use(
    "/api/webhooks",
    express.raw({ type: "application/json", limit: "5mb" })
  );
  app2.use(
    express.json({
      limit: "1mb",
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      }
    })
  );
  app2.use(express.urlencoded({ extended: false, limit: "1mb" }));
}
function setupRequestLogging(app2) {
  app2.use((req, res, next) => {
    const start = Date.now();
    const path3 = req.path;
    let capturedJsonResponse = void 0;
    const originalResJson = res.json;
    res.json = function(bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
      if (!path3.startsWith("/api")) return;
      const duration = Date.now() - start;
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log2(logLine);
    });
    next();
  });
}
function getAppName() {
  try {
    const appJsonPath = path2.resolve(process.cwd(), "app.json");
    const appJsonContent = fs2.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}
function serveExpoManifest(platform, res) {
  const manifestPath = path2.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json"
  );
  if (!fs2.existsSync(manifestPath)) {
    return res.status(404).json({ error: `Manifest not found for platform: ${platform}` });
  }
  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");
  const manifest = fs2.readFileSync(manifestPath, "utf-8");
  res.send(manifest);
}
function serveLandingPage({
  req,
  res,
  landingPageTemplate,
  appName
}) {
  const forwardedProto = req.header("x-forwarded-proto");
  const protocol = forwardedProto || req.protocol || "https";
  const forwardedHost = req.header("x-forwarded-host");
  const host = forwardedHost || req.get("host");
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;
  log2(`baseUrl`, baseUrl);
  log2(`expsUrl`, expsUrl);
  const html = landingPageTemplate.replace(/BASE_URL_PLACEHOLDER/g, baseUrl).replace(/EXPS_URL_PLACEHOLDER/g, expsUrl).replace(/APP_NAME_PLACEHOLDER/g, appName);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}
function configureExpoAndLanding(app2) {
  const templatePath = path2.resolve(
    process.cwd(),
    "server",
    "templates",
    "landing-page.html"
  );
  const landingPageTemplate = fs2.readFileSync(templatePath, "utf-8");
  const appName = getAppName();
  const isProduction = process.env.NODE_ENV === "production";
  log2("Serving static Expo files with dynamic manifest routing");
  app2.get("/_health", (_req, res) => {
    res.status(200).send("ok");
  });
  app2.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    if (req.path !== "/" && req.path !== "/manifest") {
      return next();
    }
    const platform = req.header("expo-platform");
    if (platform && (platform === "ios" || platform === "android")) {
      return serveExpoManifest(platform, res);
    }
    next();
  });
  app2.use("/assets", express.static(path2.resolve(process.cwd(), "assets")));
  app2.use(express.static(path2.resolve(process.cwd(), "static-build"), { index: false }));
  const distPath = path2.resolve(process.cwd(), "dist");
  const hasDistBuild = fs2.existsSync(path2.join(distPath, "index.html"));
  if (hasDistBuild) {
    app2.use(express.static(distPath, {
      maxAge: isProduction ? "1d" : 0,
      index: false
    }));
    log2(`Serving static web build from ${distPath}`);
  }
  if (!isProduction) {
    const metroProxy = createProxyMiddleware({
      target: "http://localhost:8081",
      changeOrigin: true,
      ws: true,
      logger: void 0,
      on: {
        error: (_err, req, res) => {
          if (res && "writeHead" in res && !res.headersSent) {
            const httpReq = req;
            const acceptsHtml = httpReq.headers?.accept?.includes("text/html");
            if (acceptsHtml) {
              res.status(200).type("html").send(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${appName}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0a0e1a;color:#c8a951;font-family:-apple-system,system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center}.c{padding:20px}.spinner{width:40px;height:40px;border:3px solid #1a2040;border-top-color:#c8a951;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 20px}@keyframes spin{to{transform:rotate(360deg)}}h1{font-size:20px;margin-bottom:8px}p{font-size:14px;color:#8890a8}</style></head><body><div class="c"><div class="spinner"></div><h1>${appName}</h1><p>Loading app...</p></div><script>setTimeout(()=>location.reload(),3000)</script></body></html>`);
            } else {
              res.status(503).set("Retry-After", "3").send("Metro bundler starting...");
            }
          }
        }
      }
    });
    const webIndexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
<title>${appName}</title>
<style>
html,body{height:100%;margin:0;padding:0}
body{background:#0a0e1a;overflow:hidden}
#root{display:flex;height:100%;flex:1}
#_loading{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#0a0e1a;z-index:9999;flex-direction:column;gap:16px}
#_loading .sp{width:36px;height:36px;border:3px solid #1a2040;border-top-color:#B8860B;border-radius:50%;animation:sp .8s linear infinite}
@keyframes sp{to{transform:rotate(360deg)}}
#_loading p{color:#B8860B;font-family:-apple-system,system-ui,sans-serif;font-size:15px;letter-spacing:2px;font-weight:600}
#_loading small{color:#8890a8;font-family:-apple-system,system-ui,sans-serif;font-size:11px}
</style>
</head>
<body>
<div id="_loading">
  <div class="sp"></div>
  <p>TOP RANKER</p>
  <small>Loading app... (v4)</small>
</div>
<div id="root"></div>
<script>
// Remove loading overlay when app renders or after timeout
window.__REMOVE_LOADING = function() {
  var el = document.getElementById('_loading');
  if (el) el.remove();
};
setTimeout(window.__REMOVE_LOADING, 30000);

// Load Metro bundle dynamically (doesn't block load event)
var s = document.createElement('script');
s.src = '/index.bundle?platform=web&dev=true&hot=true';
s.onerror = function() {
  // If simple URL fails, try Expo Router entry point
  var s2 = document.createElement('script');
  s2.src = '/node_modules/expo-router/entry.bundle?platform=web&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.routerRoot=app&transform.reactCompiler=true&unstable_transformProfile=hermes-stable';
  s2.onerror = function() {
    var el = document.getElementById('_loading');
    if (el) {
      var sm = el.querySelector('small');
      if (sm) sm.textContent = 'Waiting for bundler...';
    }
    setTimeout(function() { location.reload(); }, 5000);
  };
  document.body.appendChild(s2);
};
document.body.appendChild(s);
</script>
</body>
</html>`;
    app2.use((req, res, next) => {
      if (req.path.startsWith("/api")) {
        return next();
      }
      const platform = req.header("expo-platform");
      if (platform && (platform === "ios" || platform === "android")) {
        return next();
      }
      if (req.path === "/" || req.path === "/index.html") {
        log2(`[DEV] Serving bootstrap HTML for ${req.path} (${webIndexHtml.length} bytes)`);
        return res.status(200).type("html").send(webIndexHtml);
      }
      return metroProxy(req, res, next);
    });
    log2("Expo routing: Checking expo-platform header on / and /manifest");
    log2("Metro proxy: Forwarding web requests to localhost:8081");
  } else {
    app2.use((req, res, next) => {
      if (req.path.startsWith("/api")) {
        return next();
      }
      const platform = req.header("expo-platform");
      if (platform && (platform === "ios" || platform === "android")) {
        return next();
      }
      if (hasDistBuild) {
        return res.sendFile(path2.join(distPath, "index.html"));
      }
      return serveLandingPage({ req, res, landingPageTemplate, appName });
    });
    log2("Production mode: Serving static dist build (no Metro proxy)");
  }
}
function setupErrorHandler(app2) {
  app2.use((err, _req, res, next) => {
    const error = err;
    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    log.error("Internal Server Error:", err);
    if (res.headersSent) {
      return next(err);
    }
    return res.status(status).json({ message });
  });
}
(async () => {
  app.use(securityHeaders);
  setupBodyParsing(app);
  app.use("/api", apiRateLimiter);
  app.use(cacheHeaders);
  app.use(perfMonitor);
  app.use((req, res, next) => {
    const start = process.hrtime();
    const originalEnd = res.end;
    res.end = function(...args) {
      if (!res.headersSent) {
        const [seconds, nanoseconds] = process.hrtime(start);
        const durationMs = (seconds * 1e3 + nanoseconds / 1e6).toFixed(2);
        res.setHeader("X-Response-Time", `${durationMs}ms`);
      }
      return originalEnd.apply(res, args);
    };
    next();
  });
  setupRequestLogging(app);
  const { prerenderMiddleware: prerenderMiddleware2 } = await Promise.resolve().then(() => (init_prerender(), prerender_exports));
  app.use(prerenderMiddleware2);
  const server = await registerRoutes(app);
  const routeCount = app._router?.stack?.filter((layer) => layer.route)?.length ?? 0;
  log2(`[TopRanker] ${routeCount} routes registered`);
  configureExpoAndLanding(app);
  const { seedDatabase: seedDatabase2 } = await Promise.resolve().then(() => (init_seed(), seed_exports));
  seedDatabase2().catch((err) => log.error("Seed error:", err));
  const { closeExpiredChallenges: closeExpiredChallenges2 } = await Promise.resolve().then(() => (init_challengers(), challengers_exports));
  closeExpiredChallenges2().catch((err) => log.error("Initial challenger closure error:", err));
  const challengerInterval = setInterval(() => {
    closeExpiredChallenges2().catch((err) => log.error("Challenger closure error:", err));
  }, 60 * 60 * 1e3);
  const { recalculateDishLeaderboard: recalculateDishLeaderboard2 } = await Promise.resolve().then(() => (init_dishes(), dishes_exports));
  const { dishLeaderboards: dishLeaderboards2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  const { db: dishDb } = await Promise.resolve().then(() => (init_db(), db_exports));
  async function recalculateAllDishBoards() {
    try {
      const boards = await dishDb.select().from(dishLeaderboards2);
      let totalEntries = 0;
      for (const board of boards) {
        const count15 = await recalculateDishLeaderboard2(board.id);
        totalEntries += count15;
      }
      log.info(`Dish leaderboard recalculation: ${boards.length} boards, ${totalEntries} entries`);
    } catch (err) {
      log.error("Dish leaderboard recalculation error:", err);
    }
  }
  recalculateAllDishBoards();
  const dishRecalcInterval = setInterval(recalculateAllDishBoards, 6 * 60 * 60 * 1e3);
  const { startWeeklyDigestScheduler: startWeeklyDigestScheduler2 } = await Promise.resolve().then(() => (init_notification_triggers(), notification_triggers_exports));
  const weeklyDigestTimeout = startWeeklyDigestScheduler2();
  const { startDripScheduler: startDripScheduler2 } = await Promise.resolve().then(() => (init_drip_scheduler(), drip_scheduler_exports));
  const dripSchedulerTimeout = startDripScheduler2();
  const { startOutreachScheduler: startOutreachScheduler2 } = await Promise.resolve().then(() => (init_outreach_scheduler(), outreach_scheduler_exports));
  const outreachSchedulerTimeout = startOutreachScheduler2();
  setupErrorHandler(app);
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    port,
    "0.0.0.0",
    () => {
      log2(`express server serving on port ${port} (0.0.0.0)`);
    }
  );
  function gracefulShutdown(signal) {
    log.info(`${signal} received. Starting graceful shutdown...`);
    clearInterval(challengerInterval);
    clearInterval(dishRecalcInterval);
    clearTimeout(weeklyDigestTimeout);
    clearTimeout(dripSchedulerTimeout);
    clearTimeout(outreachSchedulerTimeout);
    server.close(() => {
      log.info("HTTP server closed");
      process.exit(0);
    });
    setTimeout(() => {
      log.error("Forced shutdown after timeout");
      process.exit(1);
    }, 1e4);
  }
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
})();
