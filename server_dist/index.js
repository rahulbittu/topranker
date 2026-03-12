var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require < "u" ? require : typeof Proxy < "u" ? new Proxy(x, {
  get: (a, b) => (typeof require < "u" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require < "u") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: !0 });
}, __copyProps = (to, from, except, desc18) => {
  if (from && typeof from == "object" || typeof from == "function")
    for (let key2 of __getOwnPropNames(from))
      !__hasOwnProp.call(to, key2) && key2 !== except && __defProp(to, key2, { get: () => from[key2], enumerable: !(desc18 = __getOwnPropDesc(from, key2)) || desc18.enumerable });
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: !0 }), mod);

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
  claimEvidence: () => claimEvidence,
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
  receiptAnalysis: () => receiptAnalysis,
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
var members, businesses, ratings, dishes, dishVotes, challengers, rankHistory, businessClaims, claimEvidence, businessPhotos, qrScans, ratingFlags, memberBadges, credibilityPenalties, categories, categorySuggestions, payments, webhookEvents, featuredPlacements, analyticsEvents, insertMemberSchema, insertRatingSchema, deletionRequests, dishLeaderboards, dishLeaderboardEntries, dishSuggestions, dishSuggestionVotes, insertDishSuggestionSchema, insertCategorySuggestionSchema, notifications, referrals, betaInvites, userActivity, betaFeedback, ratingPhotos, photoSubmissions, receiptAnalysis, init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    members = pgTable("members", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      authId: varchar("auth_id").unique(),
      displayName: text("display_name").notNull(),
      firstName: text("first_name"),
      lastName: text("last_name"),
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
      isFoundingMember: boolean("is_founding_member").notNull().default(!1),
      isBanned: boolean("is_banned").notNull().default(!1),
      banReason: text("ban_reason"),
      emailVerified: boolean("email_verified").notNull().default(!1),
      emailVerificationToken: text("email_verification_token"),
      passwordResetToken: text("password_reset_token"),
      passwordResetExpires: timestamp("password_reset_expires"),
      joinedAt: timestamp("joined_at").notNull().defaultNow(),
      lastActive: timestamp("last_active"),
      notificationPrefs: jsonb("notification_prefs"),
      notificationFrequencyPrefs: jsonb("notification_frequency_prefs")
    }), businesses = pgTable(
      "businesses",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
        isOpenNow: boolean("is_open_now").notNull().default(!1),
        hoursLastUpdated: timestamp("hours_last_updated"),
        // Sprint 678: Service flags from Google Places
        servesBreakfast: boolean("serves_breakfast").notNull().default(!1),
        servesLunch: boolean("serves_lunch").notNull().default(!1),
        servesDinner: boolean("serves_dinner").notNull().default(!1),
        servesBeer: boolean("serves_beer").notNull().default(!1),
        servesWine: boolean("serves_wine").notNull().default(!1),
        // Sprint 626: Decision-to-Action fields
        menuUrl: text("menu_url"),
        orderUrl: text("order_url"),
        pickupUrl: text("pickup_url"),
        doordashUrl: text("doordash_url"),
        uberEatsUrl: text("uber_eats_url"),
        reservationUrl: text("reservation_url"),
        dataSource: text("data_source").default("google_import"),
        photoUrl: text("photo_url"),
        weightedScore: numeric("weighted_score", { precision: 6, scale: 3 }).notNull().default("0"),
        rawAvgScore: numeric("raw_avg_score", { precision: 4, scale: 2 }).notNull().default("0"),
        rankPosition: integer("rank_position"),
        rankDelta: integer("rank_delta").notNull().default(0),
        prevRankPosition: integer("prev_rank_position"),
        totalRatings: integer("total_ratings").notNull().default(0),
        dineInCount: integer("dine_in_count").notNull().default(0),
        credibilityWeightedSum: numeric("credibility_weighted_sum", { precision: 8, scale: 4 }).notNull().default("0"),
        leaderboardEligible: boolean("leaderboard_eligible").notNull().default(!1),
        ownerId: varchar("owner_id").references(() => members.id),
        isClaimed: boolean("is_claimed").notNull().default(!1),
        claimedAt: timestamp("claimed_at"),
        stripeCustomerId: text("stripe_customer_id"),
        stripeSubscriptionId: text("stripe_subscription_id"),
        subscriptionStatus: text("subscription_status").default("none"),
        subscriptionPeriodEnd: timestamp("subscription_period_end"),
        isActive: boolean("is_active").notNull().default(!0),
        inChallenger: boolean("in_challenger").notNull().default(!1),
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
    ), ratings = pgTable(
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
        visitType: text("visit_type").default("dine_in"),
        foodScore: numeric("food_score", { precision: 3, scale: 1 }),
        serviceScore: numeric("service_score", { precision: 3, scale: 1 }),
        vibeScore: numeric("vibe_score", { precision: 3, scale: 1 }),
        packagingScore: numeric("packaging_score", { precision: 3, scale: 1 }),
        waitTimeScore: numeric("wait_time_score", { precision: 3, scale: 1 }),
        valueScore: numeric("value_score", { precision: 3, scale: 1 }),
        compositeScore: numeric("composite_score", { precision: 4, scale: 2 }),
        hasPhoto: boolean("has_photo").notNull().default(!1),
        hasReceipt: boolean("has_receipt").notNull().default(!1),
        dishFieldCompleted: boolean("dish_field_completed").notNull().default(!1),
        verificationBoost: numeric("verification_boost", { precision: 4, scale: 3 }).notNull().default("0"),
        effectiveWeight: numeric("effective_weight", { precision: 6, scale: 4 }),
        gamingMultiplier: numeric("gaming_multiplier", { precision: 3, scale: 2 }).notNull().default("1.00"),
        gamingReason: text("gaming_reason"),
        timeOnPageMs: integer("time_on_page_ms"),
        rawScore: numeric("raw_score", { precision: 4, scale: 2 }).notNull(),
        weight: numeric("weight", { precision: 5, scale: 4 }).notNull(),
        weightedScore: numeric("weighted_score", { precision: 6, scale: 4 }).notNull(),
        isFlagged: boolean("is_flagged").notNull().default(!1),
        autoFlagged: boolean("auto_flagged").notNull().default(!1),
        flagReason: text("flag_reason"),
        flagProbability: integer("flag_probability"),
        source: text("source").default("app"),
        createdAt: timestamp("created_at").notNull().defaultNow()
      },
      (table) => [
        index("idx_rat_business").on(table.businessId, table.createdAt),
        index("idx_rat_member").on(table.memberId, table.createdAt)
      ]
    ), dishes = pgTable(
      "dishes",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        businessId: varchar("business_id").notNull().references(() => businesses.id),
        name: text("name").notNull(),
        nameNormalized: text("name_normalized").notNull(),
        suggestedBy: text("suggested_by").notNull().default("community"),
        voteCount: integer("vote_count").notNull().default(0),
        isActive: boolean("is_active").notNull().default(!0),
        createdAt: timestamp("created_at").notNull().defaultNow()
      },
      (table) => [
        unique("unique_dish_per_business").on(table.businessId, table.nameNormalized),
        index("idx_dish_biz_votes").on(table.businessId, table.voteCount)
      ]
    ), dishVotes = pgTable("dish_votes", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      ratingId: varchar("rating_id").notNull().references(() => ratings.id),
      dishId: varchar("dish_id").references(() => dishes.id),
      memberId: varchar("member_id").notNull().references(() => members.id),
      businessId: varchar("business_id").notNull().references(() => businesses.id),
      noNotableDish: boolean("no_notable_dish").notNull().default(!1),
      createdAt: timestamp("created_at").notNull().defaultNow()
    }), challengers = pgTable(
      "challengers",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        challengerId: varchar("challenger_id").notNull().references(() => businesses.id),
        defenderId: varchar("defender_id").notNull().references(() => businesses.id),
        category: text("category").notNull(),
        city: text("city").notNull(),
        entryFeePaid: boolean("entry_fee_paid").notNull().default(!1),
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
    ), rankHistory = pgTable(
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
    ), businessClaims = pgTable("business_claims", {
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
    }), claimEvidence = pgTable(
      "claim_evidence",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        claimId: varchar("claim_id").notNull().references(() => businessClaims.id),
        documents: jsonb("documents").notNull().default(sql`'[]'::jsonb`),
        businessNameMatch: boolean("business_name_match").notNull().default(!1),
        addressMatch: boolean("address_match").notNull().default(!1),
        phoneMatch: boolean("phone_match").notNull().default(!1),
        verificationScore: integer("verification_score").notNull().default(0),
        autoApproved: boolean("auto_approved").notNull().default(!1),
        reviewNotes: jsonb("review_notes").notNull().default(sql`'[]'::jsonb`),
        scoredAt: timestamp("scored_at").notNull().defaultNow()
      },
      (table) => [
        unique("unique_claim_evidence").on(table.claimId),
        index("idx_evidence_claim").on(table.claimId)
      ]
    ), businessPhotos = pgTable(
      "business_photos",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        businessId: varchar("business_id").notNull().references(() => businesses.id),
        photoUrl: text("photo_url").notNull(),
        isHero: boolean("is_hero").notNull().default(!1),
        sortOrder: integer("sort_order").notNull().default(0),
        uploadedBy: varchar("uploaded_by").references(() => members.id),
        createdAt: timestamp("created_at").notNull().defaultNow()
      },
      (table) => [
        index("idx_biz_photos_business").on(table.businessId, table.sortOrder)
      ]
    ), qrScans = pgTable(
      "qr_scans",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        businessId: varchar("business_id").notNull().references(() => businesses.id),
        memberId: varchar("member_id").references(() => members.id),
        converted: boolean("converted").notNull().default(!1),
        scannedAt: timestamp("scanned_at").notNull().defaultNow()
      },
      (table) => [
        index("idx_qr_biz").on(table.businessId, table.scannedAt)
      ]
    ), ratingFlags = pgTable(
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
    ), memberBadges = pgTable(
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
    ), credibilityPenalties = pgTable(
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
    ), categories = pgTable("categories", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      slug: text("slug").unique().notNull(),
      label: text("label").notNull(),
      emoji: text("emoji").notNull(),
      vertical: text("vertical").notNull(),
      atAGlanceFields: jsonb("at_a_glance_fields").notNull().default(sql`'[]'::jsonb`),
      scoringHints: jsonb("scoring_hints").notNull().default(sql`'[]'::jsonb`),
      isActive: boolean("is_active").notNull().default(!1),
      createdAt: timestamp("created_at").notNull().defaultNow()
    }), categorySuggestions = pgTable("category_suggestions", {
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
    }), payments = pgTable(
      "payments",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        memberId: varchar("member_id").notNull().references(() => members.id),
        businessId: varchar("business_id").references(() => businesses.id),
        type: text("type").notNull(),
        amount: integer("amount").notNull(),
        currency: text("currency").notNull().default("usd"),
        stripePaymentIntentId: text("stripe_payment_intent_id"),
        status: text("status").notNull().default("pending"),
        metadata: jsonb("metadata"),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at")
      },
      (table) => [
        index("idx_payments_member").on(table.memberId),
        index("idx_payments_business").on(table.businessId),
        index("idx_payments_status").on(table.status)
      ]
    ), webhookEvents = pgTable(
      "webhook_events",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        source: text("source").notNull(),
        eventId: text("event_id").notNull(),
        eventType: text("event_type").notNull(),
        payload: jsonb("payload").notNull(),
        processed: boolean("processed").notNull().default(!1),
        error: text("error"),
        createdAt: timestamp("created_at").notNull().defaultNow()
      },
      (table) => [
        index("idx_webhook_events_source").on(table.source),
        index("idx_webhook_events_event_id").on(table.eventId)
      ]
    ), featuredPlacements = pgTable(
      "featured_placements",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        businessId: varchar("business_id").notNull().references(() => businesses.id),
        paymentId: varchar("payment_id").references(() => payments.id),
        city: text("city").notNull(),
        startsAt: timestamp("starts_at").notNull().defaultNow(),
        expiresAt: timestamp("expires_at").notNull(),
        status: text("status").notNull().default("active"),
        createdAt: timestamp("created_at").notNull().defaultNow()
      },
      (table) => [
        index("idx_featured_business").on(table.businessId),
        index("idx_featured_city_status").on(table.city, table.status),
        index("idx_featured_expires").on(table.expiresAt)
      ]
    ), analyticsEvents = pgTable(
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
    ), insertMemberSchema = createInsertSchema(members).pick({
      displayName: !0,
      username: !0,
      email: !0,
      password: !0,
      city: !0
    }).extend({
      password: z.string().optional()
    }), insertRatingSchema = createInsertSchema(ratings).pick({
      businessId: !0,
      q1Score: !0,
      q2Score: !0,
      q3Score: !0,
      wouldReturn: !0,
      note: !0
    }).extend({
      q1Score: z.number().int().min(1).max(5),
      q2Score: z.number().int().min(1).max(5),
      q3Score: z.number().int().min(1).max(5),
      wouldReturn: z.boolean(),
      visitType: z.enum(["dine_in", "delivery", "takeaway"]),
      timeOnPageMs: z.number().int().min(0).max(36e5).optional(),
      note: z.string().max(2e3).optional().transform((val) => val && val.replace(/<[^>]*>/g, "").trim()),
      dishId: z.string().optional(),
      newDishName: z.string().max(50).optional(),
      noNotableDish: z.boolean().optional(),
      qrScanId: z.string().optional()
    }), deletionRequests = pgTable(
      "deletion_requests",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        memberId: varchar("member_id").notNull().references(() => members.id),
        requestedAt: timestamp("requested_at").notNull().defaultNow(),
        scheduledDeletionAt: timestamp("scheduled_deletion_at").notNull(),
        cancelledAt: timestamp("cancelled_at"),
        completedAt: timestamp("completed_at"),
        status: text("status").notNull().default("pending")
      },
      (table) => [
        index("idx_deletion_member").on(table.memberId),
        index("idx_deletion_status").on(table.status)
      ]
    ), dishLeaderboards = pgTable(
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
    ), dishLeaderboardEntries = pgTable(
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
    ), dishSuggestions = pgTable(
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
    ), dishSuggestionVotes = pgTable("dish_suggestion_votes", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      suggestionId: varchar("suggestion_id").notNull().references(() => dishSuggestions.id),
      memberId: varchar("member_id").notNull().references(() => members.id),
      createdAt: timestamp("created_at").notNull().defaultNow()
    }), insertDishSuggestionSchema = z.object({
      city: z.string().min(2).max(50),
      dishName: z.string().min(2).max(40)
    }), insertCategorySuggestionSchema = z.object({
      name: z.string().min(2).max(50),
      description: z.string().min(10).max(200),
      vertical: z.enum(["food", "services", "wellness", "entertainment", "retail"])
    }), notifications = pgTable(
      "notifications",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        memberId: varchar("member_id").notNull().references(() => members.id),
        type: text("type").notNull(),
        title: text("title").notNull(),
        body: text("body").notNull(),
        data: jsonb("data"),
        read: boolean("read").notNull().default(!1),
        createdAt: timestamp("created_at").notNull().defaultNow()
      },
      (table) => [
        index("idx_notif_member").on(table.memberId),
        index("idx_notif_member_read").on(table.memberId, table.read)
      ]
    ), referrals = pgTable(
      "referrals",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        referrerId: varchar("referrer_id").notNull().references(() => members.id),
        referredId: varchar("referred_id").notNull().references(() => members.id),
        referralCode: text("referral_code").notNull(),
        status: text("status").notNull().default("signed_up"),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        activatedAt: timestamp("activated_at")
      },
      (table) => [
        index("idx_referral_referrer").on(table.referrerId),
        index("idx_referral_referred").on(table.referredId),
        unique("uq_referral_referred").on(table.referredId)
        // one referrer per user
      ]
    ), betaInvites = pgTable(
      "beta_invites",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        email: text("email").notNull(),
        displayName: text("display_name").notNull(),
        referralCode: text("referral_code").notNull().default("BETA25"),
        invitedBy: text("invited_by"),
        status: text("status").notNull().default("sent"),
        sentAt: timestamp("sent_at").notNull().defaultNow(),
        joinedAt: timestamp("joined_at"),
        memberId: varchar("member_id").references(() => members.id)
      },
      (table) => [
        index("idx_beta_invite_email").on(table.email),
        unique("uq_beta_invite_email").on(table.email)
      ]
    ), userActivity = pgTable(
      "user_activity",
      {
        userId: varchar("user_id").primaryKey().references(() => members.id),
        lastSeenAt: timestamp("last_seen_at").notNull().defaultNow()
      },
      (table) => [
        index("idx_user_activity_last_seen").on(table.lastSeenAt)
      ]
    ), betaFeedback = pgTable(
      "beta_feedback",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        memberId: varchar("member_id").references(() => members.id),
        rating: integer("rating").notNull(),
        category: text("category").notNull(),
        message: text("message").notNull(),
        screenContext: text("screen_context"),
        appVersion: text("app_version"),
        createdAt: timestamp("created_at").notNull().defaultNow()
      },
      (table) => [
        index("idx_beta_feedback_member").on(table.memberId),
        index("idx_beta_feedback_created").on(table.createdAt)
      ]
    ), ratingPhotos = pgTable(
      "rating_photos",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        ratingId: varchar("rating_id").notNull().references(() => ratings.id),
        photoUrl: text("photo_url").notNull(),
        cdnKey: text("cdn_key").notNull(),
        contentHash: varchar("content_hash", { length: 64 }),
        perceptualHash: varchar("perceptual_hash", { length: 16 }),
        isVerifiedReceipt: boolean("is_verified_receipt").notNull().default(!1),
        uploadedAt: timestamp("uploaded_at").notNull().defaultNow()
      },
      (table) => [
        index("idx_rating_photos_rating").on(table.ratingId)
      ]
    ), photoSubmissions = pgTable(
      "photo_submissions",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        businessId: varchar("business_id").notNull().references(() => businesses.id),
        memberId: varchar("member_id").notNull().references(() => members.id),
        url: text("url").notNull(),
        caption: text("caption").notNull().default(""),
        status: text("status").notNull().default("pending"),
        rejectionReason: text("rejection_reason"),
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
    ), receiptAnalysis = pgTable(
      "receipt_analysis",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
        ratingPhotoId: varchar("rating_photo_id").notNull().references(() => ratingPhotos.id),
        ratingId: varchar("rating_id").notNull().references(() => ratings.id),
        businessId: varchar("business_id").notNull().references(() => businesses.id),
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
        createdAt: timestamp("created_at").notNull().defaultNow()
      },
      (table) => [
        index("idx_receipt_analysis_rating").on(table.ratingId),
        index("idx_receipt_analysis_status").on(table.status)
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
var pool, db, init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    if (!process.env.DATABASE_URL)
      throw new Error("DATABASE_URL must be set");
    pool = new Pool({
      connectionString: process.env.DATABASE_URL
    }), db = drizzle(pool, { schema: schema_exports });
  }
});

// shared/credibility.ts
function getVoteWeight(credibilityScore) {
  return credibilityScore >= 600 ? 1 : credibilityScore >= 300 ? 0.7 : credibilityScore >= 100 ? 0.35 : 0.1;
}
function getCredibilityTier(score) {
  return score >= 600 ? "top" : score >= 300 ? "trusted" : score >= 100 ? "city" : "community";
}
function getTierFromScore(score, totalRatings, totalCategories, daysActive, ratingVariance, activeFlagCount) {
  return score >= 600 && totalRatings >= 80 && totalCategories >= 4 && daysActive >= 90 && ratingVariance >= 1 && activeFlagCount === 0 ? "top" : score >= 300 && totalRatings >= 35 && totalCategories >= 3 && daysActive >= 45 && ratingVariance >= 0.8 ? "trusted" : score >= 100 && totalRatings >= 10 && totalCategories >= 2 && daysActive >= 14 ? "city" : "community";
}
function getTemporalMultiplier(ratingAgeDays) {
  return ratingAgeDays <= 30 ? 1 : ratingAgeDays <= 90 ? 0.85 : ratingAgeDays <= 180 ? 0.65 : ratingAgeDays <= 365 ? 0.45 : 0.25;
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
function getLogStats() {
  return { errorCount, warnCount, lastErrorAt, lastWarnAt };
}
function shouldLog(level) {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[MIN_LEVEL];
}
function formatMessage(level, tag, message, data) {
  let prefix = `${(/* @__PURE__ */ new Date()).toISOString()} [${level.toUpperCase()}] [${tag}]`;
  return data !== void 0 ? `${prefix} ${message} ${typeof data == "string" ? data : JSON.stringify(data)}` : `${prefix} ${message}`;
}
function createTaggedLogger(tag) {
  return {
    debug(message, data) {
      shouldLog("debug") && console.log(formatMessage("debug", tag, message, data));
    },
    info(message, data) {
      shouldLog("info") && console.log(formatMessage("info", tag, message, data));
    },
    warn(message, data) {
      warnCount++, lastWarnAt = (/* @__PURE__ */ new Date()).toISOString(), shouldLog("warn") && console.warn(formatMessage("warn", tag, message, data));
    },
    error(message, data) {
      errorCount++, lastErrorAt = (/* @__PURE__ */ new Date()).toISOString(), shouldLog("error") && console.error(formatMessage("error", tag, message, data));
    }
  };
}
function baseLog(message, data) {
  shouldLog("info") && console.log(formatMessage("info", "Server", message, data));
}
var LEVEL_ORDER, MIN_LEVEL, errorCount, warnCount, lastErrorAt, lastWarnAt, log, init_logger = __esm({
  "server/logger.ts"() {
    "use strict";
    LEVEL_ORDER = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    }, MIN_LEVEL = "info", errorCount = 0, warnCount = 0, lastErrorAt = null, lastWarnAt = null;
    baseLog.tag = createTaggedLogger;
    baseLog.debug = function(message, data) {
      shouldLog("debug") && console.log(formatMessage("debug", "Server", message, data));
    };
    baseLog.info = function(message, data) {
      shouldLog("info") && console.log(formatMessage("info", "Server", message, data));
    };
    baseLog.warn = function(message, data) {
      warnCount++, lastWarnAt = (/* @__PURE__ */ new Date()).toISOString(), shouldLog("warn") && console.warn(formatMessage("warn", "Server", message, data));
    };
    baseLog.error = function(message, data) {
      errorCount++, lastErrorAt = (/* @__PURE__ */ new Date()).toISOString(), shouldLog("error") && console.error(formatMessage("error", "Server", message, data));
    };
    log = baseLog;
  }
});

// server/tier-staleness.ts
import { eq } from "drizzle-orm";
function checkAndRefreshTier(storedTier, currentScore) {
  let expectedTier = getCredibilityTier(currentScore);
  return storedTier !== expectedTier && stalenessLog.info(
    `Tier drift detected: stored=${storedTier}, expected=${expectedTier} for score=${currentScore}`
  ), expectedTier;
}
var stalenessLog, init_tier_staleness = __esm({
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
  getDishVoteStreakStats: () => getDishVoteStreakStats,
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
  updateNotificationFrequencyPrefs: () => updateNotificationFrequencyPrefs,
  updateNotificationPrefs: () => updateNotificationPrefs,
  updatePushToken: () => updatePushToken,
  verifyEmailToken: () => verifyEmailToken
});
import { eq as eq2, and, sql as sql2, count, countDistinct, desc, isNotNull } from "drizzle-orm";
import crypto from "node:crypto";
async function getMemberById(id) {
  let [member] = await db.select().from(members).where(eq2(members.id, id));
  return member;
}
async function getMembersWithPushTokenByCity(city, limit = 500) {
  let { isNotNull: isNotNull8 } = await import("drizzle-orm");
  return (await db.select({ id: members.id, pushToken: members.pushToken }).from(members).where(and(eq2(members.city, city), isNotNull8(members.pushToken))).limit(limit)).filter((m) => !!m.pushToken);
}
async function getMemberByUsername(username) {
  let [member] = await db.select().from(members).where(eq2(members.username, username));
  return member;
}
async function getMemberByEmail(email) {
  let [member] = await db.select().from(members).where(eq2(members.email, email));
  return member;
}
async function getMemberByAuthId(authId) {
  let [member] = await db.select().from(members).where(eq2(members.authId, authId));
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
  let [result] = await db.select({ cnt: count() }).from(members);
  return Number(result?.cnt ?? 0);
}
async function createMember(data) {
  let [member] = await db.insert(members).values(data).returning();
  return member;
}
async function updateMemberStats(memberId) {
  let whereClause = and(eq2(ratings.memberId, memberId), eq2(ratings.isFlagged, !1)), [statsResult, categoryResult, memberRatings] = await Promise.all([
    // Aggregate count + distinct businesses in one query
    db.select({
      totalRatings: count(),
      distinctBusinesses: countDistinct(ratings.businessId)
    }).from(ratings).where(whereClause),
    // Category count requires business join
    db.select({ category: businesses.category }).from(ratings).innerJoin(businesses, eq2(ratings.businessId, businesses.id)).where(whereClause).groupBy(businesses.category),
    // Raw scores for variance calculation
    db.select({ rawScore: ratings.rawScore }).from(ratings).where(whereClause)
  ]), stats2 = statsResult[0], variance = 0;
  if (memberRatings.length > 1) {
    let scores = memberRatings.map((r) => parseFloat(r.rawScore)), mean = scores.reduce((a, b) => a + b, 0) / scores.length, sqDiffs = scores.map((s) => (s - mean) ** 2);
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
  let member = await getMemberById(memberId);
  if (!member) throw new Error("Member not found");
  let base = 10, volume = Math.min(member.totalRatings * 2, 200), diversity = Math.min(member.totalCategories * 15, 100), daysActive = Math.floor(
    (Date.now() - new Date(member.joinedAt).getTime()) / (1e3 * 60 * 60 * 24)
  ), age = Math.min(daysActive * 0.5, 100), memberRatings = await db.select({ rawScore: ratings.rawScore }).from(ratings).where(and(eq2(ratings.memberId, memberId), eq2(ratings.isFlagged, !1))), varianceBonus = 0;
  if (memberRatings.length >= 5) {
    let scores = memberRatings.map((r) => parseFloat(r.rawScore)), mean = scores.reduce((a, b) => a + b, 0) / scores.length, sqDiffs = scores.map((s) => (s - mean) ** 2), stddev = Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / scores.length);
    varianceBonus = Math.min(stddev * 60, 150);
  }
  let pioneerQueryResult = await db.execute(sql2`
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
  `), pioneerResult = pioneerQueryResult.rows?.[0] ?? pioneerQueryResult[0] ?? {}, totalMemberRatings = Number(pioneerResult?.total_ratings ?? 0), earlyReviewCount = Number(pioneerResult?.early_ratings ?? 0), pioneerRate = totalMemberRatings > 0 ? earlyReviewCount / totalMemberRatings : 0, helpfulness = Math.round(pioneerRate * 100), penaltyResult = await db.select({ total: sql2`COALESCE(SUM(${credibilityPenalties.finalPenalty}), 0)` }).from(credibilityPenalties).where(eq2(credibilityPenalties.memberId, memberId)), totalPenalties = Number(penaltyResult[0]?.total ?? 0), rawScore = base + volume + diversity + age + varianceBonus + helpfulness - totalPenalties, score = Math.max(10, Math.min(1e3, Math.round(rawScore))), ratingVariance = 0;
  if (memberRatings.length > 1) {
    let scores = memberRatings.map((r) => parseFloat(r.rawScore)), mean = scores.reduce((a, b) => a + b, 0) / scores.length, sqDiffs = scores.map((s) => (s - mean) ** 2);
    ratingVariance = Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / scores.length);
  }
  let gateTier = getTierFromScore(
    score,
    member.totalRatings,
    member.totalCategories,
    daysActive,
    ratingVariance,
    member.activeFlagCount
  ), stalenessCheckedTier = checkAndRefreshTier(member.credibilityTier, score), tier = gateTier;
  return await db.update(members).set({ credibilityScore: score, credibilityTier: tier }).where(eq2(members.id, memberId)), {
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
  let offset = (page - 1) * perPage, ratingsResult = await db.select({
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
  }).from(ratings).innerJoin(businesses, eq2(ratings.businessId, businesses.id)).where(eq2(ratings.memberId, memberId)).orderBy(sql2`${ratings.createdAt} DESC`).limit(perPage).offset(offset), [totalResult] = await db.select({ count: count() }).from(ratings).where(eq2(ratings.memberId, memberId));
  return { ratings: ratingsResult, total: totalResult.count };
}
async function getSeasonalRatingCounts(memberId) {
  let result = await db.select({
    month: sql2`EXTRACT(MONTH FROM ${ratings.createdAt})::int`,
    cnt: count()
  }).from(ratings).where(
    and(
      eq2(ratings.memberId, memberId),
      eq2(ratings.isFlagged, !1)
    )
  ).groupBy(sql2`EXTRACT(MONTH FROM ${ratings.createdAt})`), spring = 0, summer = 0, fall = 0, winter = 0;
  for (let row of result) {
    let c = Number(row.cnt);
    [3, 4, 5].includes(row.month) ? spring += c : [6, 7, 8].includes(row.month) ? summer += c : [9, 10, 11].includes(row.month) ? fall += c : winter += c;
  }
  return { springRatings: spring, summerRatings: summer, fallRatings: fall, winterRatings: winter };
}
async function getDishVoteStreakStats(memberId) {
  let [totalRow] = await db.select({ cnt: count() }).from(dishVotes).where(and(eq2(dishVotes.memberId, memberId), isNotNull(dishVotes.dishId))), totalDishVotes = totalRow?.cnt ?? 0;
  if (totalDishVotes === 0) return { dishVoteStreak: 0, longestDishStreak: 0, totalDishVotes: 0, topDish: null };
  let topDish = (await db.select({ name: dishes.name, cnt: count() }).from(dishVotes).innerJoin(dishes, eq2(dishVotes.dishId, dishes.id)).where(and(eq2(dishVotes.memberId, memberId), isNotNull(dishVotes.dishId))).groupBy(dishes.name).orderBy(sql2`count(*) DESC`).limit(1))[0]?.name ?? null, days = (await db.selectDistinct({ day: sql2`DATE(${dishVotes.createdAt})` }).from(dishVotes).where(and(eq2(dishVotes.memberId, memberId), isNotNull(dishVotes.dishId))).orderBy(sql2`DATE(${dishVotes.createdAt}) DESC`)).map((r) => r.day);
  if (days.length === 0) return { dishVoteStreak: 0, longestDishStreak: 0, totalDishVotes, topDish };
  let toMs = (d) => (/* @__PURE__ */ new Date(d + "T00:00:00Z")).getTime(), ONE_DAY = 864e5, today = /* @__PURE__ */ new Date();
  today.setUTCHours(0, 0, 0, 0);
  let todayMs = today.getTime(), current = 0, longest = 1, streak = 1, firstDayMs = toMs(days[0]), isCurrent = todayMs - firstDayMs <= ONE_DAY;
  for (let i = 1; i < days.length; i++) {
    let prev = toMs(days[i - 1]), curr = toMs(days[i]);
    prev - curr === ONE_DAY ? streak++ : (streak > longest && (longest = streak), streak = 1);
  }
  if (streak > longest && (longest = streak), isCurrent) {
    current = 1;
    for (let i = 1; i < days.length && toMs(days[i - 1]) - toMs(days[i]) === ONE_DAY; i++)
      current++;
  }
  return { dishVoteStreak: current, longestDishStreak: longest, totalDishVotes, topDish };
}
async function updateMemberProfile(memberId, updates) {
  let updateData = {};
  if (updates.displayName !== void 0 && (updateData.displayName = updates.displayName), updates.firstName !== void 0 && (updateData.firstName = updates.firstName), updates.lastName !== void 0 && (updateData.lastName = updates.lastName), updates.username !== void 0 && (updateData.username = updates.username), Object.keys(updateData).length === 0) return null;
  let [updated] = await db.update(members).set(updateData).where(eq2(members.id, memberId)).returning();
  return updated;
}
async function updatePushToken(memberId, pushToken) {
  await db.update(members).set({ pushToken }).where(eq2(members.id, memberId));
}
async function updateMemberAvatar(memberId, avatarUrl) {
  let [updated] = await db.update(members).set({ avatarUrl }).where(eq2(members.id, memberId)).returning();
  return updated;
}
async function updateMemberEmail(memberId, email) {
  let [existing] = await db.select().from(members).where(eq2(members.email, email));
  if (existing && existing.id !== memberId) throw new Error("Email already in use");
  let [updated] = await db.update(members).set({ email }).where(eq2(members.id, memberId)).returning();
  return updated;
}
async function updateNotificationPrefs(memberId, prefs) {
  let [updated] = await db.update(members).set({ notificationPrefs: prefs }).where(eq2(members.id, memberId)).returning({ notificationPrefs: members.notificationPrefs });
  return updated?.notificationPrefs ?? prefs;
}
async function updateNotificationFrequencyPrefs(memberId, prefs) {
  let [updated] = await db.update(members).set({ notificationFrequencyPrefs: prefs }).where(eq2(members.id, memberId)).returning({ notificationFrequencyPrefs: members.notificationFrequencyPrefs });
  return updated?.notificationFrequencyPrefs ?? prefs;
}
async function getMemberImpact(memberId) {
  let memberRatings = await db.select({
    businessId: ratings.businessId,
    businessName: businesses.name,
    businessSlug: businesses.slug,
    rankDelta: businesses.rankDelta
  }).from(ratings).innerJoin(businesses, eq2(ratings.businessId, businesses.id)).where(
    and(
      eq2(ratings.memberId, memberId),
      eq2(ratings.isFlagged, !1)
    )
  ).groupBy(ratings.businessId, businesses.name, businesses.slug, businesses.rankDelta), lastRatingRows = await db.select({
    businessName: businesses.name,
    businessSlug: businesses.slug,
    rawScore: ratings.rawScore,
    weight: ratings.weight,
    ratedAt: ratings.createdAt
  }).from(ratings).innerJoin(businesses, eq2(ratings.businessId, businesses.id)).where(eq2(ratings.memberId, memberId)).orderBy(desc(ratings.createdAt)).limit(1), lastRating = lastRatingRows.length > 0 ? {
    businessName: lastRatingRows[0].businessName,
    businessSlug: lastRatingRows[0].businessSlug,
    rawScore: lastRatingRows[0].rawScore,
    weight: lastRatingRows[0].weight,
    ratedAt: lastRatingRows[0].ratedAt.toISOString()
  } : null, movedUp = memberRatings.filter((r) => r.rankDelta > 0);
  return {
    businessesMovedUp: movedUp.length,
    topContributions: movedUp.sort((a, b) => b.rankDelta - a.rankDelta).slice(0, 5).map((r) => ({ name: r.businessName, slug: r.businessSlug, rankChange: r.rankDelta })),
    lastRating
  };
}
async function getOnboardingProgress(memberId) {
  let member = await getMemberById(memberId);
  if (!member) throw new Error("Member not found");
  let daysActive = Math.floor(
    (Date.now() - new Date(member.joinedAt).getTime()) / (1e3 * 60 * 60 * 24)
  ), hasAvatar = !!member.avatarUrl, hasCity = !!member.city && member.city !== "Dallas", hasRated = (member.totalRatings || 0) > 0, hasMultipleRatings = (member.totalRatings || 0) >= 3, earnedTier = member.credibilityTier !== "community", canRate = daysActive >= 3, steps = [
    { key: "create_account", label: "Create your account", completed: !0, detail: `Joined ${daysActive} day${daysActive !== 1 ? "s" : ""} ago` },
    { key: "set_city", label: "Choose your city", completed: hasCity || !0, detail: member.city || "Dallas" },
    { key: "add_avatar", label: "Add a profile photo", completed: hasAvatar },
    { key: "wait_period", label: "Complete 3-day waiting period", completed: canRate, detail: canRate ? "Unlocked" : `${3 - daysActive} day${3 - daysActive !== 1 ? "s" : ""} remaining` },
    { key: "first_rating", label: "Submit your first rating", completed: hasRated, detail: hasRated ? `${member.totalRatings} rating${(member.totalRatings || 0) !== 1 ? "s" : ""} submitted` : void 0 },
    { key: "three_ratings", label: "Rate 3 different restaurants", completed: hasMultipleRatings, detail: hasMultipleRatings ? "Credibility building!" : `${member.totalRatings || 0}/3 ratings` },
    { key: "earn_tier", label: "Earn your first tier upgrade", completed: earnedTier, detail: earnedTier ? `Current: ${member.credibilityTier}` : "Keep rating to level up" }
  ], completedCount = steps.filter((s) => s.completed).length;
  return { steps, completedCount, totalSteps: steps.length };
}
async function generateEmailVerificationToken(memberId) {
  let token = crypto.randomBytes(32).toString("hex");
  return await db.update(members).set({ emailVerificationToken: token }).where(eq2(members.id, memberId)), token;
}
async function verifyEmailToken(token) {
  if (!token || token.length < 32) return { success: !1 };
  let [member] = await db.select({ id: members.id }).from(members).where(eq2(members.emailVerificationToken, token));
  return member ? (await db.update(members).set({ emailVerified: !0, emailVerificationToken: null }).where(eq2(members.id, member.id)), { success: !0, memberId: member.id }) : { success: !1 };
}
async function isEmailVerified(memberId) {
  let [member] = await db.select({ emailVerified: members.emailVerified }).from(members).where(eq2(members.id, memberId));
  return member?.emailVerified ?? !1;
}
async function generatePasswordResetToken(email) {
  let member = await getMemberByEmail(email);
  if (!member || !member.password) return null;
  let token = crypto.randomBytes(32).toString("hex"), expires = new Date(Date.now() + 3600 * 1e3);
  return await db.update(members).set({ passwordResetToken: token, passwordResetExpires: expires }).where(eq2(members.id, member.id)), { token, memberId: member.id, displayName: member.displayName };
}
async function resetPasswordWithToken(token, newPasswordHash) {
  if (!token || token.length < 32) return { success: !1, error: "Invalid token" };
  let [member] = await db.select({ id: members.id, passwordResetExpires: members.passwordResetExpires }).from(members).where(eq2(members.passwordResetToken, token));
  return member ? member.passwordResetExpires && new Date(member.passwordResetExpires) < /* @__PURE__ */ new Date() ? (await db.update(members).set({ passwordResetToken: null, passwordResetExpires: null }).where(eq2(members.id, member.id)), { success: !1, error: "Reset token has expired" }) : (await db.update(members).set({
    password: newPasswordHash,
    passwordResetToken: null,
    passwordResetExpires: null
  }).where(eq2(members.id, member.id)), { success: !0 }) : { success: !1, error: "Invalid or expired token" };
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
  let food = dimensions.foodScore ?? 0;
  switch (visitType) {
    case "dine_in": {
      let service = dimensions.serviceScore ?? 0, vibe = dimensions.vibeScore ?? 0;
      return food * DINE_IN_WEIGHTS.food + service * DINE_IN_WEIGHTS.service + vibe * DINE_IN_WEIGHTS.vibe;
    }
    case "delivery": {
      let packaging = dimensions.packagingScore ?? 0, value = dimensions.valueScore ?? 0;
      return food * DELIVERY_WEIGHTS.food + packaging * DELIVERY_WEIGHTS.packaging + value * DELIVERY_WEIGHTS.value;
    }
    case "takeaway": {
      let waitTime = dimensions.waitTimeScore ?? 0, value = dimensions.valueScore ?? 0;
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
  return totalDecayedWeight <= 0 ? priorMean : (totalDecayedWeight * weightedScore + priorStrength * priorMean) / (totalDecayedWeight + priorStrength);
}
var DINE_IN_WEIGHTS, DELIVERY_WEIGHTS, TAKEAWAY_WEIGHTS, DECAY_LAMBDA, BAYESIAN_PRIOR_STRENGTH, DEFAULT_PRIOR_MEAN, init_score_engine = __esm({
  "shared/score-engine.ts"() {
    "use strict";
    DINE_IN_WEIGHTS = { food: 0.5, service: 0.25, vibe: 0.25 }, DELIVERY_WEIGHTS = { food: 0.6, packaging: 0.25, value: 0.15 }, TAKEAWAY_WEIGHTS = { food: 0.65, waitTime: 0.2, value: 0.15 }, DECAY_LAMBDA = 3e-3;
    BAYESIAN_PRIOR_STRENGTH = 3, DEFAULT_PRIOR_MEAN = 6.5;
  }
});

// server/config.ts
function required(name) {
  let value = process.env[name];
  if (!value)
    throw new Error(`Missing required environment variable: ${name}. Server cannot start.`);
  return value;
}
function optional(name, fallback) {
  return process.env[name] || fallback;
}
var config, init_config = __esm({
  "server/config.ts"() {
    "use strict";
    config = {
      // Database (required)
      databaseUrl: required("DATABASE_URL"),
      // Session (required — no fallback, C1 audit finding)
      sessionSecret: required("SESSION_SECRET"),
      // Server
      port: parseInt(optional("PORT", "5000"), 10),
      nodeEnv: optional("NODE_ENV", "development"),
      isProduction: !0,
      // Google OAuth (optional — feature disabled if not set)
      googleClientId: process.env.GOOGLE_CLIENT_ID || null,
      // Stripe (optional — mock payments if not set)
      stripeSecretKey: process.env.STRIPE_SECRET_KEY || null,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || null,
      // GitHub deploy webhook (optional)
      githubWebhookSecret: process.env.GITHUB_WEBHOOK_SECRET || null,
      // Push notifications (optional)
      ntfyTopic: optional("NTFY_TOPIC", "topranker-deploy"),
      // Google Maps (optional)
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || null,
      // Google Places (optional — enrichment disabled if not set)
      googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY || null,
      // Email (optional — console fallback if not set)
      resendApiKey: process.env.RESEND_API_KEY || null,
      resendWebhookSecret: process.env.RESEND_WEBHOOK_SECRET || null,
      emailFrom: optional("EMAIL_FROM", "TopRanker <noreply@topranker.com>"),
      // Unsubscribe HMAC (optional — dev fallback if not set)
      unsubscribeSecret: optional("UNSUBSCRIBE_SECRET", "topranker-unsub-dev-secret"),
      // Error tracking (optional — console fallback if not set)
      sentryDsn: process.env.SENTRY_DSN || "",
      // Site URL (optional — used for emails, SEO, QR codes)
      siteUrl: optional("SITE_URL", "https://topranker.io"),
      // Redis (optional — memory fallback if not set)
      redisUrl: process.env.REDIS_URL || null,
      // Cloudflare R2 file storage (optional — local fallback if not set)
      r2BucketName: process.env.R2_BUCKET_NAME || null,
      r2AccountId: process.env.R2_ACCOUNT_ID || null,
      r2AccessKeyId: process.env.R2_ACCESS_KEY_ID || null,
      r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY || null,
      r2PublicUrl: process.env.R2_PUBLIC_URL || null,
      // Hosting platform (optional — for CORS)
      replitDevDomain: process.env.REPLIT_DEV_DOMAIN || null,
      replitDomains: process.env.REPLIT_DOMAINS || null,
      railwayPublicDomain: process.env.RAILWAY_PUBLIC_DOMAIN || null,
      corsOrigins: process.env.CORS_ORIGINS || null
    };
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
  if (redisChecked) return null;
  let url = config.redisUrl;
  if (!url)
    return redisLog.info("REDIS_URL not set \u2014 caching disabled, using DB-only mode"), redisChecked = !0, null;
  try {
    return redis = new Redis(url, {
      maxRetriesPerRequest: 1,
      connectTimeout: 3e3,
      lazyConnect: !0,
      retryStrategy(times) {
        return times > 3 ? null : Math.min(times * 200, 1e3);
      }
    }), redis.on("error", (err) => redisLog.warn(`Redis error: ${err.message}`)), redis.on("connect", () => redisLog.info("Redis connected")), redis.connect().catch(() => {
      redisLog.warn("Redis connect failed \u2014 running in DB-only mode"), redis = null;
    }), redis;
  } catch {
    return redisLog.warn("Redis init failed \u2014 running in DB-only mode"), null;
  }
}
async function cacheGet(key2) {
  let client = getRedisClient();
  if (!client) return null;
  try {
    let raw = await client.get(key2);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
async function cacheSet(key2, value, ttlSeconds) {
  let client = getRedisClient();
  if (client)
    try {
      await client.set(key2, JSON.stringify(value), "EX", ttlSeconds);
    } catch {
    }
}
async function cacheDel(...keys) {
  let client = getRedisClient();
  if (!(!client || keys.length === 0))
    try {
      await client.del(...keys);
    } catch {
    }
}
async function cacheDelPattern(pattern) {
  let client = getRedisClient();
  if (client)
    try {
      let keys = await client.keys(pattern);
      keys.length > 0 && await client.del(...keys);
    } catch {
    }
}
async function cacheAside(key2, ttlSeconds, compute) {
  let cached = await cacheGet(key2);
  if (cached !== null) return cached;
  let result = await compute();
  return await cacheSet(key2, result, ttlSeconds), result;
}
function trackCacheHit() {
  hits++;
}
function trackCacheMiss() {
  misses++;
}
function getCacheStats() {
  let total = hits + misses;
  return {
    connected: redis !== null,
    hits,
    misses,
    hitRate: total > 0 ? (hits / total * 100).toFixed(1) + "%" : "N/A"
  };
}
var redisLog, redis, redisChecked, hits, misses, init_redis = __esm({
  "server/redis.ts"() {
    "use strict";
    init_logger();
    init_config();
    redisLog = log.tag("Redis"), redis = null, redisChecked = !1;
    hits = 0, misses = 0;
  }
});

// server/storage/photos.ts
import { eq as eq3, and as and2, asc, sql as sql3 } from "drizzle-orm";
async function getBusinessPhotos(businessId) {
  return (await db.select({ photoUrl: businessPhotos.photoUrl }).from(businessPhotos).where(eq3(businessPhotos.businessId, businessId)).orderBy(asc(businessPhotos.sortOrder)).limit(3)).map((r) => r.photoUrl);
}
async function getBusinessPhotoDetails(businessId) {
  return (await db.select({
    photoUrl: businessPhotos.photoUrl,
    isHero: businessPhotos.isHero,
    uploadedBy: businessPhotos.uploadedBy,
    createdAt: businessPhotos.createdAt,
    uploaderName: members.displayName
  }).from(businessPhotos).leftJoin(members, eq3(businessPhotos.uploadedBy, members.id)).where(eq3(businessPhotos.businessId, businessId)).orderBy(asc(businessPhotos.sortOrder)).limit(20)).map((r) => ({
    url: r.photoUrl,
    uploaderName: r.uploaderName || null,
    uploadDate: r.createdAt.toISOString(),
    isHero: r.isHero,
    source: r.uploadedBy ? "community" : "business"
  }));
}
async function getBusinessPhotosMap(businessIds) {
  if (businessIds.length === 0) return {};
  let rows = await db.select({
    businessId: businessPhotos.businessId,
    photoUrl: businessPhotos.photoUrl,
    sortOrder: businessPhotos.sortOrder
  }).from(businessPhotos).where(sql3`${businessPhotos.businessId} = ANY(ARRAY[${sql3.join(businessIds.map((id) => sql3`${id}`), sql3`,`)}]::text[])`).orderBy(asc(businessPhotos.sortOrder)), map = {};
  for (let row of rows)
    map[row.businessId] || (map[row.businessId] = []), map[row.businessId].length < 5 && map[row.businessId].push(row.photoUrl);
  return map;
}
async function insertBusinessPhotos(businessId, photos) {
  photos.length !== 0 && await db.insert(businessPhotos).values(
    photos.map((p) => ({
      businessId,
      photoUrl: p.photoUrl,
      isHero: p.isHero,
      sortOrder: p.sortOrder
    }))
  );
}
async function getBusinessesWithoutPhotos(city, limit = 50) {
  return (await db.select({
    id: businesses.id,
    name: businesses.name,
    googlePlaceId: businesses.googlePlaceId,
    city: businesses.city
  }).from(businesses).leftJoin(businessPhotos, eq3(businesses.id, businessPhotos.businessId)).where(
    and2(
      eq3(businesses.isActive, !0),
      sql3`${businesses.googlePlaceId} IS NOT NULL`,
      sql3`${businessPhotos.id} IS NULL`,
      ...city ? [eq3(businesses.city, city)] : []
    )
  ).limit(limit)).map((r) => ({
    id: r.id,
    name: r.name,
    googlePlaceId: r.googlePlaceId,
    city: r.city
  }));
}
async function deleteBusinessPhotos(businessId) {
  await db.delete(businessPhotos).where(eq3(businessPhotos.businessId, businessId));
}
var init_photos = __esm({
  "server/storage/photos.ts"() {
    "use strict";
    init_schema();
    init_db();
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
  getBusinessPhotoDetails: () => getBusinessPhotoDetails,
  getBusinessPhotos: () => getBusinessPhotos,
  getBusinessPhotosMap: () => getBusinessPhotosMap,
  getBusinessRatings: () => getBusinessRatings,
  getBusinessesByIds: () => getBusinessesByIds,
  getBusinessesWithoutPhotos: () => getBusinessesWithoutPhotos,
  getCuisines: () => getCuisines,
  getImportStats: () => getImportStats,
  getJustRatedBusinesses: () => getJustRatedBusinesses,
  getLeaderboard: () => getLeaderboard,
  getNeighborhoods: () => getNeighborhoods,
  getPopularCategories: () => getPopularCategories,
  getRankHistory: () => getRankHistory,
  getTrendingBusinesses: () => getTrendingBusinesses,
  insertBusinessPhotos: () => insertBusinessPhotos,
  recalculateBusinessScore: () => recalculateBusinessScore,
  recalculateRanks: () => recalculateRanks,
  searchBusinesses: () => searchBusinesses,
  updateBusinessActions: () => updateBusinessActions,
  updateBusinessHours: () => updateBusinessHours,
  updateBusinessSubscription: () => updateBusinessSubscription
});
import { eq as eq4, and as and3, desc as desc2, asc as asc2, sql as sql4, count as count2, gte as gte2 } from "drizzle-orm";
async function getLeaderboard(city, category, limit = 50, cuisine, neighborhood, priceRange) {
  let key2 = `leaderboard:${city}:${category}:${cuisine || "all"}:${neighborhood || "all"}:${priceRange || "all"}:${limit}`;
  return cacheAside(key2, 300, async () => (trackCacheMiss(), db.select().from(businesses).where(
    and3(
      eq4(businesses.city, city),
      eq4(businesses.category, category),
      eq4(businesses.isActive, !0),
      eq4(businesses.leaderboardEligible, !0),
      ...cuisine ? [eq4(businesses.cuisine, cuisine)] : [],
      ...neighborhood ? [eq4(businesses.neighborhood, neighborhood)] : [],
      ...priceRange ? [eq4(businesses.priceRange, priceRange)] : []
    )
  ).orderBy(asc2(businesses.rankPosition)).limit(limit)));
}
async function getNeighborhoods(city) {
  let key2 = `neighborhoods:${city}`;
  return cacheAside(key2, 600, async () => (trackCacheMiss(), (await db.selectDistinct({ neighborhood: businesses.neighborhood }).from(businesses).where(
    and3(
      eq4(businesses.city, city),
      eq4(businesses.isActive, !0),
      sql4`${businesses.neighborhood} IS NOT NULL`,
      sql4`${businesses.neighborhood} != ''`
    )
  ).orderBy(asc2(businesses.neighborhood))).map((r) => r.neighborhood)));
}
async function getTrendingBusinesses(city, limit = 3) {
  let key2 = `trending:${city}:${limit}`;
  return cacheAside(key2, 600, async () => (trackCacheMiss(), db.select().from(businesses).where(
    and3(
      eq4(businesses.city, city),
      eq4(businesses.isActive, !0),
      sql4`${businesses.rankDelta} > 0`
    )
  ).orderBy(desc2(businesses.rankDelta)).limit(limit)));
}
async function getJustRatedBusinesses(city, limit = 5) {
  let key2 = `just-rated:${city}:${limit}`;
  return cacheAside(key2, 300, async () => {
    trackCacheMiss();
    let cutoff = new Date(Date.now() - 1440 * 60 * 1e3), recentlyRated = db.selectDistinct({ businessId: ratings.businessId }).from(ratings).where(gte2(ratings.createdAt, cutoff)).orderBy(desc2(ratings.createdAt)).limit(limit).as("recently_rated");
    return db.select().from(businesses).innerJoin(recentlyRated, eq4(businesses.id, recentlyRated.businessId)).where(and3(eq4(businesses.city, city), eq4(businesses.isActive, !0))).then((rows) => rows.map((r) => r.businesses));
  });
}
async function getBusinessBySlug(slug) {
  let [business] = await db.select().from(businesses).where(eq4(businesses.slug, slug));
  return business;
}
async function getBusinessById(id) {
  let [business] = await db.select().from(businesses).where(eq4(businesses.id, id));
  return business;
}
async function updateBusinessSubscription(businessId, updates) {
  let setData = {};
  updates.stripeCustomerId !== void 0 && (setData.stripeCustomerId = updates.stripeCustomerId), updates.stripeSubscriptionId !== void 0 && (setData.stripeSubscriptionId = updates.stripeSubscriptionId), updates.subscriptionStatus !== void 0 && (setData.subscriptionStatus = updates.subscriptionStatus), updates.subscriptionPeriodEnd !== void 0 && (setData.subscriptionPeriodEnd = updates.subscriptionPeriodEnd), Object.keys(setData).length !== 0 && await db.update(businesses).set(setData).where(eq4(businesses.id, businessId));
}
async function updateBusinessHours(businessId, ownerId, openingHours) {
  let [biz] = await db.select().from(businesses).where(eq4(businesses.id, businessId));
  return !biz || biz.ownerId !== ownerId ? !1 : (await db.update(businesses).set({
    openingHours,
    hoursLastUpdated: /* @__PURE__ */ new Date()
  }).where(eq4(businesses.id, businessId)), !0);
}
async function getBusinessesByIds(ids) {
  return ids.length === 0 ? [] : db.select().from(businesses).where(sql4`${businesses.id} = ANY(ARRAY[${sql4.join(ids.map((id) => sql4`${id}`), sql4`,`)}]::text[])`);
}
async function searchBusinesses(query, city, category, limit = 20, cuisine, offset = 0) {
  let q = "%" + query.slice(0, 100).replace(/[%_\\]/g, "").toLowerCase() + "%";
  return db.select().from(businesses).where(
    and3(
      eq4(businesses.city, city),
      eq4(businesses.isActive, !0),
      query ? sql4`(lower(${businesses.name}) like ${q} OR lower(${businesses.neighborhood}) like ${q} OR lower(${businesses.category}) like ${q} OR lower(COALESCE(${businesses.cuisine}, '')) like ${q})` : void 0,
      ...category ? [eq4(businesses.category, category)] : [],
      ...cuisine ? [eq4(businesses.cuisine, cuisine)] : []
    )
  ).orderBy(desc2(businesses.weightedScore)).limit(limit).offset(offset);
}
async function countBusinessSearch(query, city, category, cuisine) {
  let q = "%" + query.slice(0, 100).replace(/[%_\\]/g, "").toLowerCase() + "%", [result] = await db.select({ total: count2() }).from(businesses).where(
    and3(
      eq4(businesses.city, city),
      eq4(businesses.isActive, !0),
      query ? sql4`(lower(${businesses.name}) like ${q} OR lower(${businesses.neighborhood}) like ${q} OR lower(${businesses.category}) like ${q} OR lower(COALESCE(${businesses.cuisine}, '')) like ${q})` : void 0,
      ...category ? [eq4(businesses.category, category)] : [],
      ...cuisine ? [eq4(businesses.cuisine, cuisine)] : []
    )
  );
  return result?.total ?? 0;
}
async function getCuisines(city, category) {
  let key2 = `cuisines:${city}:${category || "all"}`;
  return cacheAside(key2, 7200, async () => (trackCacheMiss(), (await db.select({ cuisine: businesses.cuisine }).from(businesses).where(
    and3(
      eq4(businesses.city, city),
      eq4(businesses.isActive, !0),
      sql4`${businesses.cuisine} IS NOT NULL`,
      ...category ? [eq4(businesses.category, category)] : []
    )
  ).groupBy(businesses.cuisine)).map((r) => r.cuisine).filter(Boolean)));
}
async function getAllCategories(city) {
  let key2 = `categories:${city}`;
  return cacheAside(key2, 7200, async () => (trackCacheMiss(), (await db.select({
    category: businesses.category
  }).from(businesses).where(and3(eq4(businesses.city, city), eq4(businesses.isActive, !0))).groupBy(businesses.category)).map((r) => r.category)));
}
async function autocompleteBusinesses(query, city, limit = 6) {
  if (!query || query.trim().length === 0) return [];
  let q = "%" + query.slice(0, 50).replace(/[%_\\]/g, "").toLowerCase() + "%";
  return db.select({
    id: businesses.id,
    name: businesses.name,
    slug: businesses.slug,
    category: businesses.category,
    cuisine: businesses.cuisine,
    neighborhood: businesses.neighborhood,
    weightedScore: businesses.weightedScore
  }).from(businesses).where(
    and3(
      eq4(businesses.city, city),
      eq4(businesses.isActive, !0),
      sql4`(lower(${businesses.name}) like ${q} OR lower(${businesses.category}) like ${q} OR lower(${businesses.neighborhood}) like ${q} OR lower(COALESCE(${businesses.cuisine}, '')) like ${q})`
    )
  ).orderBy(desc2(businesses.weightedScore)).limit(limit);
}
async function getPopularCategories(city, limit = 8) {
  let key2 = `popular_categories:${city}:${limit}`;
  return cacheAside(key2, 3600, async () => (trackCacheMiss(), (await db.select({
    category: businesses.category,
    count: count2(businesses.id)
  }).from(businesses).where(and3(eq4(businesses.city, city), eq4(businesses.isActive, !0))).groupBy(businesses.category).orderBy(desc2(count2(businesses.id))).limit(limit)).map((r) => ({ category: r.category, count: Number(r.count) }))));
}
async function recalculateBusinessScore(businessId) {
  let allRatings = await db.select({
    rawScore: ratings.rawScore,
    weight: ratings.weight,
    compositeScore: ratings.compositeScore,
    effectiveWeight: ratings.effectiveWeight,
    visitType: ratings.visitType,
    createdAt: ratings.createdAt,
    isFlagged: ratings.isFlagged,
    autoFlagged: ratings.autoFlagged
  }).from(ratings).where(
    and3(
      eq4(ratings.businessId, businessId),
      eq4(ratings.isFlagged, !1),
      eq4(ratings.autoFlagged, !1)
    )
  );
  if (allRatings.length === 0)
    return await db.update(businesses).set({
      weightedScore: "0",
      rawAvgScore: "0",
      totalRatings: 0,
      dineInCount: 0,
      credibilityWeightedSum: "0",
      leaderboardEligible: !1,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq4(businesses.id, businessId)), 0;
  let totalWeightedScore = 0, totalEffectiveWeight = 0, rawSum = 0, dineInCount = 0, credibilityWeightedSum = 0;
  for (let r of allRatings) {
    let ageDays = Math.floor(
      (Date.now() - new Date(r.createdAt).getTime()) / 864e5
    ), decay = computeDecayFactor(ageDays), score2 = r.compositeScore ? parseFloat(r.compositeScore) : parseFloat(r.rawScore), weight = r.effectiveWeight ? parseFloat(r.effectiveWeight) : parseFloat(r.weight), decayedWeight = weight * decay;
    totalWeightedScore += score2 * decayedWeight, totalEffectiveWeight += decayedWeight, rawSum += parseFloat(r.rawScore), r.visitType === "dine_in" && dineInCount++, credibilityWeightedSum += weight;
  }
  let rawWeightedAvg = totalEffectiveWeight > 0 ? totalWeightedScore / totalEffectiveWeight : 0, score = Math.round(
    applyBayesianPrior(rawWeightedAvg, totalEffectiveWeight) * 1e3
  ) / 1e3, rawAvg = rawSum / allRatings.length, eligible = allRatings.length >= 3 && dineInCount >= 1 && credibilityWeightedSum >= 0.5;
  return await db.update(businesses).set({
    weightedScore: score.toFixed(3),
    rawAvgScore: rawAvg.toFixed(2),
    totalRatings: allRatings.length,
    dineInCount,
    credibilityWeightedSum: credibilityWeightedSum.toFixed(4),
    leaderboardEligible: eligible,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq4(businesses.id, businessId)), score;
}
async function recalculateRanks(city, category) {
  await db.execute(sql4`
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
  `), await cacheDelPattern(`leaderboard:${city}:*`), await cacheDelPattern(`trending:${city}:*`);
}
async function getRankHistory(businessId, days = 30) {
  let cutoff = /* @__PURE__ */ new Date();
  return cutoff.setDate(cutoff.getDate() - days), (await db.select({
    date: rankHistory.snapshotDate,
    rank: rankHistory.rankPosition,
    score: rankHistory.weightedScore
  }).from(rankHistory).where(
    and3(
      eq4(rankHistory.businessId, businessId),
      gte2(rankHistory.snapshotDate, cutoff.toISOString().split("T")[0])
    )
  ).orderBy(asc2(rankHistory.snapshotDate))).map((r) => ({
    date: r.date,
    rank: r.rank,
    score: parseFloat(r.score)
  }));
}
async function getBusinessRatings(businessId, page = 1, perPage = 20) {
  let offset = (page - 1) * perPage, { members: members4 } = await Promise.resolve().then(() => (init_schema(), schema_exports)), ratingsResult = await db.select({
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
    hasPhoto: ratings.hasPhoto,
    hasReceipt: ratings.hasReceipt,
    createdAt: ratings.createdAt,
    memberName: members4.displayName,
    memberTier: members4.credibilityTier,
    memberAvatarUrl: members4.avatarUrl
  }).from(ratings).innerJoin(members4, eq4(ratings.memberId, members4.id)).where(and3(eq4(ratings.businessId, businessId), eq4(ratings.isFlagged, !1))).orderBy(sql4`${ratings.createdAt} DESC`).limit(perPage).offset(offset), [totalResult] = await db.select({ count: count2() }).from(ratings).where(and3(eq4(ratings.businessId, businessId), eq4(ratings.isFlagged, !1)));
  return { ratings: ratingsResult, total: totalResult.count };
}
function generateSlug(name, city) {
  return `${name}-${city}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}
async function bulkImportBusinesses(places) {
  let imported = 0, skipped = 0, results = [];
  for (let place of places) {
    let [existing] = await db.select({ id: businesses.id }).from(businesses).where(eq4(businesses.googlePlaceId, place.placeId));
    if (existing) {
      skipped++, results.push({ name: place.name, status: "skipped_duplicate" });
      continue;
    }
    let slug = generateSlug(place.name, place.city), [slugExists] = await db.select({ id: businesses.id }).from(businesses).where(eq4(businesses.slug, slug));
    slugExists && (slug = `${slug}-${Date.now().toString(36).slice(-4)}`);
    let addressParts = place.address.split(",").map((p) => p.trim()), neighborhood = addressParts.length > 1 ? addressParts[1] : null;
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
        isActive: !0,
        dataSource: "google_bulk_import"
      }), imported++, results.push({ name: place.name, status: "imported" });
    } catch (err) {
      skipped++, results.push({ name: place.name, status: `error: ${err.message?.slice(0, 50)}` });
    }
  }
  return { imported, skipped, results };
}
async function getImportStats() {
  return (await db.select({
    city: businesses.city,
    dataSource: businesses.dataSource,
    count: count2(businesses.id)
  }).from(businesses).where(eq4(businesses.isActive, !0)).groupBy(businesses.city, businesses.dataSource).orderBy(businesses.city)).map((r) => ({ city: r.city, dataSource: r.dataSource || "unknown", count: Number(r.count) }));
}
async function updateBusinessActions(businessId, updates) {
  let [updated] = await db.update(businesses).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq4(businesses.id, businessId)).returning();
  return updated;
}
var init_businesses = __esm({
  "server/storage/businesses.ts"() {
    "use strict";
    init_schema();
    init_db();
    init_score_engine();
    init_redis();
    init_photos();
  }
});

// shared/notification-channels.ts
function getChannelId(type) {
  return NOTIFICATION_TYPE_TO_CHANNEL[type] || "default";
}
var NOTIFICATION_TYPE_TO_CHANNEL, init_notification_channels = __esm({
  "shared/notification-channels.ts"() {
    "use strict";
    NOTIFICATION_TYPE_TO_CHANNEL = {
      tier_upgrade: "tier_upgrade",
      challenger_result: "challenger",
      challenger_started: "challenger",
      weekly_digest: "digest",
      drip_reminder: "reminders",
      rating_reminder: "reminders"
    };
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
import { eq as eq5, and as and4, desc as desc3, count as count3 } from "drizzle-orm";
async function createNotification(data) {
  let [notif] = await db.insert(notifications).values({
    memberId: data.memberId,
    type: data.type,
    title: data.title,
    body: data.body,
    data: data.data || null
  }).returning();
  return notif;
}
async function getMemberNotifications(memberId, page = 1, perPage = 20) {
  let offset = (page - 1) * perPage, [results, totalResult, unreadResult] = await Promise.all([
    db.select().from(notifications).where(eq5(notifications.memberId, memberId)).orderBy(desc3(notifications.createdAt)).limit(perPage).offset(offset),
    db.select({ count: count3() }).from(notifications).where(eq5(notifications.memberId, memberId)),
    db.select({ count: count3() }).from(notifications).where(and4(eq5(notifications.memberId, memberId), eq5(notifications.read, !1)))
  ]);
  return {
    notifications: results,
    total: totalResult[0]?.count ?? 0,
    unreadCount: unreadResult[0]?.count ?? 0
  };
}
async function markNotificationRead(notificationId, memberId) {
  return (await db.update(notifications).set({ read: !0 }).where(and4(eq5(notifications.id, notificationId), eq5(notifications.memberId, memberId)))).rowCount > 0;
}
async function markAllNotificationsRead(memberId) {
  return (await db.update(notifications).set({ read: !0 }).where(and4(eq5(notifications.memberId, memberId), eq5(notifications.read, !1)))).rowCount ?? 0;
}
async function getUnreadNotificationCount(memberId) {
  let [result] = await db.select({ count: count3() }).from(notifications).where(and4(eq5(notifications.memberId, memberId), eq5(notifications.read, !1)));
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
  let channelId = getChannelId(data?.type || ""), messages = tokens2.map((token) => ({
    to: token,
    title,
    body,
    data,
    sound: channelId === "reminders" ? null : "default",
    channelId
  }));
  if (!config.isProduction)
    return pushLog.debug("DEV MODE \u2014 would send:", messages), messages.map(() => ({ status: "ok", id: `dev-${Date.now()}` }));
  try {
    return (await (await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(messages)
    })).json()).data;
  } catch (err) {
    return pushLog.error("Failed to send:", err), messages.map(() => ({ status: "error", message: String(err) }));
  }
}
async function persistNotification(memberId, type, title, body, data) {
  try {
    let { createNotification: createNotification2 } = await Promise.resolve().then(() => (init_notifications(), notifications_exports));
    await createNotification2({ memberId, type, title, body, data });
  } catch (err) {
    pushLog.error(`Failed to persist notification for ${memberId}: ${err}`);
  }
}
async function notifyTierUpgrade(userId, userToken, newTier) {
  let { getMemberById: getMemberById2 } = await Promise.resolve().then(() => (init_members(), members_exports));
  if (((await getMemberById2(userId))?.notificationPrefs || {}).tierUpgrades === !1) return;
  let title = "You've been promoted!", body = `Your credibility just reached ${newTier} tier. Your ratings now carry more weight.`;
  await sendPushNotification([userToken], title, body, { screen: "profile" }), persistNotification(userId, "tier_upgrade", title, body, { screen: "profile" });
}
async function notifyChallengerResult(followerIds, followerTokens, winnerName, category) {
  let { getMemberById: getMemberById2 } = await Promise.resolve().then(() => (init_members(), members_exports)), filteredTokens = [], eligibleFollowerIds = [];
  for (let i = 0; i < followerIds.length; i++)
    ((await getMemberById2(followerIds[i]))?.notificationPrefs || {}).challengerResults !== !1 && (filteredTokens.push(followerTokens[i]), eligibleFollowerIds.push(followerIds[i]));
  if (filteredTokens.length === 0) return;
  let title = `${category} Challenge ended`, body = `${winnerName} wins! See the final results and stats.`;
  await sendPushNotification(filteredTokens, title, body, { screen: "challenger" });
  for (let uid of eligibleFollowerIds)
    persistNotification(uid, "challenger_result", title, body, { screen: "challenger" });
}
async function notifyNewChallenger(cityUserIds, cityTokens, defenderName, challengerName, category) {
  let { getMemberById: getMemberById2 } = await Promise.resolve().then(() => (init_members(), members_exports)), filteredTokens = [], eligibleUserIds = [];
  for (let i = 0; i < cityUserIds.length; i++)
    ((await getMemberById2(cityUserIds[i]))?.notificationPrefs || {}).newChallengers !== !1 && (filteredTokens.push(cityTokens[i]), eligibleUserIds.push(cityUserIds[i]));
  if (filteredTokens.length === 0) return;
  let title = `New ${category} Challenge`, body = `${defenderName} vs ${challengerName} \u2014 30 days, weighted votes decide.`;
  await sendPushNotification(filteredTokens, title, body, { screen: "challenger" });
  for (let uid of eligibleUserIds)
    persistNotification(uid, "new_challenger", title, body, { screen: "challenger" });
}
var pushLog, EXPO_PUSH_URL, init_push = __esm({
  "server/push.ts"() {
    "use strict";
    init_logger();
    init_config();
    init_notification_channels();
    pushLog = log.tag("Push"), EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
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
import { eq as eq6, and as and5, sql as sql6, lte } from "drizzle-orm";
async function createChallenge(data) {
  let endDate = /* @__PURE__ */ new Date();
  endDate.setDate(endDate.getDate() + 30);
  let [challenge] = await db.insert(challengers).values({
    challengerId: data.challengerId,
    defenderId: data.defenderId,
    category: data.category,
    city: data.city,
    entryFeePaid: !0,
    stripePaymentIntentId: data.stripePaymentIntentId,
    endDate,
    status: "active"
  }).returning();
  log.info(`Challenge created: ${challenge.id} (${data.challengerId} vs ${data.defenderId})`);
  try {
    let [challengerBiz, defenderBiz] = await Promise.all([
      db.select().from(businesses).where(eq6(businesses.id, data.challengerId)).then((r) => r[0]),
      db.select().from(businesses).where(eq6(businesses.id, data.defenderId)).then((r) => r[0])
    ]);
    if (challengerBiz && defenderBiz) {
      let { getMembersWithPushTokenByCity: getMembersWithPushTokenByCity2 } = await Promise.resolve().then(() => (init_members(), members_exports)), cityMembers = await getMembersWithPushTokenByCity2(data.city);
      if (cityMembers.length > 0) {
        let { notifyNewChallenger: notifyNewChallenger2 } = await Promise.resolve().then(() => (init_push(), push_exports));
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
  let challengerRows = await db.select().from(challengers).where(
    and5(
      eq6(challengers.status, "active"),
      eq6(challengers.city, city),
      ...category ? [eq6(challengers.category, category)] : []
    )
  );
  if (challengerRows.length === 0) return [];
  let bizIds = /* @__PURE__ */ new Set();
  for (let c of challengerRows)
    bizIds.add(c.challengerId), bizIds.add(c.defenderId);
  let bizIdArr = Array.from(bizIds), bizRows = await db.select().from(businesses).where(sql6`${businesses.id} = ANY(ARRAY[${sql6.join(bizIdArr.map((id) => sql6`${id}`), sql6`,`)}]::text[])`), bizMap = new Map(bizRows.map((b) => [b.id, b]));
  return challengerRows.map((c) => ({
    ...c,
    challengerBusiness: bizMap.get(c.challengerId),
    defenderBusiness: bizMap.get(c.defenderId)
  }));
}
async function updateChallengerVotes(businessId, weightedScore) {
  let asChallenger = await db.select().from(challengers).where(
    and5(eq6(challengers.challengerId, businessId), eq6(challengers.status, "active"))
  );
  for (let c of asChallenger) {
    let newVotes = parseFloat(c.challengerWeightedVotes) + weightedScore;
    await db.update(challengers).set({
      challengerWeightedVotes: newVotes.toFixed(3),
      totalVotes: sql6`${challengers.totalVotes} + 1`
    }).where(eq6(challengers.id, c.id));
  }
  let asDefender = await db.select().from(challengers).where(
    and5(eq6(challengers.defenderId, businessId), eq6(challengers.status, "active"))
  );
  for (let c of asDefender) {
    let newVotes = parseFloat(c.defenderWeightedVotes) + weightedScore;
    await db.update(challengers).set({
      defenderWeightedVotes: newVotes.toFixed(3),
      totalVotes: sql6`${challengers.totalVotes} + 1`
    }).where(eq6(challengers.id, c.id));
  }
}
async function closeExpiredChallenges() {
  let now = /* @__PURE__ */ new Date(), expired = await db.select().from(challengers).where(
    and5(
      eq6(challengers.status, "active"),
      lte(challengers.endDate, now)
    )
  ), closed = 0;
  for (let c of expired) {
    let challengerVotes = parseFloat(c.challengerWeightedVotes), defenderVotes = parseFloat(c.defenderWeightedVotes), winnerId = null;
    challengerVotes > defenderVotes ? winnerId = c.challengerId : defenderVotes > challengerVotes && (winnerId = c.defenderId), await db.update(challengers).set({
      status: "completed",
      winnerId
    }).where(eq6(challengers.id, c.id)), closed++, log.info(`Challenge ${c.id} closed: winner=${winnerId || "draw"} (${challengerVotes} vs ${defenderVotes})`);
    try {
      let winnerName = (winnerId ? await db.select().from(businesses).where(eq6(businesses.id, winnerId)).then((r) => r[0]) : null)?.name || "It's a draw", { getMembersWithPushTokenByCity: getMembersWithPushTokenByCity2 } = await Promise.resolve().then(() => (init_members(), members_exports)), cityMembers = await getMembersWithPushTokenByCity2(c.city);
      if (cityMembers.length > 0) {
        let { notifyChallengerResult: notifyChallengerResult2 } = await Promise.resolve().then(() => (init_push(), push_exports));
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
  return closed > 0 && log.info(`Closed ${closed} expired challenge(s)`), closed;
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
import { eq as eq7, and as and6, desc as desc4 } from "drizzle-orm";
async function createReferral(referrerId, referredId, referralCode) {
  let [referral] = await db.insert(referrals).values({
    referrerId,
    referredId,
    referralCode,
    status: "signed_up"
  }).returning();
  return referral;
}
async function resolveReferralCode(code) {
  if (!code || code.trim().length === 0) return null;
  let username = code.trim().toLowerCase(), [member] = await db.select({ id: members.id }).from(members).where(eq7(members.username, username));
  return member?.id || null;
}
async function getReferralStats(memberId) {
  let rows = await db.select({
    id: referrals.id,
    referredName: members.displayName,
    referredUsername: members.username,
    status: referrals.status,
    createdAt: referrals.createdAt
  }).from(referrals).innerJoin(members, eq7(referrals.referredId, members.id)).where(eq7(referrals.referrerId, memberId)).orderBy(desc4(referrals.createdAt)), totalReferred = rows.length, activated = rows.filter((r) => r.status === "activated").length;
  return { totalReferred, activated, referrals: rows };
}
async function activateReferral(referredId) {
  await db.update(referrals).set({ status: "activated", activatedAt: /* @__PURE__ */ new Date() }).where(and6(eq7(referrals.referredId, referredId), eq7(referrals.status, "signed_up")));
}
async function getReferrerForMember(memberId) {
  let [ref] = await db.select({ referrerId: referrals.referrerId }).from(referrals).where(eq7(referrals.referredId, memberId));
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
import { eq as eq8, and as and7, sql as sql7, count as count5, gte as gte3, desc as desc5 } from "drizzle-orm";
async function getRatingById(id) {
  let [rating] = await db.select().from(ratings).where(eq8(ratings.id, id));
  return rating;
}
async function detectAnomalies(member, business, rawScore) {
  let flags = [], oneHourAgo = new Date(Date.now() - 36e5), [recentCount] = await db.select({ count: count5() }).from(ratings).where(
    and7(
      eq8(ratings.memberId, member.id),
      gte3(ratings.createdAt, oneHourAgo)
    )
  );
  if (recentCount.count > 5 && flags.push("burst_velocity"), member.totalRatings >= 5) {
    let [patternStats] = await db.select({
      total: count5(),
      highCount: sql7`COUNT(*) FILTER (WHERE ${ratings.rawScore}::numeric >= 4.8)`,
      lowCount: sql7`COUNT(*) FILTER (WHERE ${ratings.rawScore}::numeric <= 1.5)`
    }).from(ratings).where(eq8(ratings.memberId, member.id)), total = Number(patternStats.total);
    total >= 10 && Number(patternStats.highCount) / total > 0.9 && flags.push("perfect_score_pattern"), rawScore <= 1.5 && total >= 5 && Number(patternStats.lowCount) / total > 0.6 && flags.push("one_star_bomber");
  }
  member.totalRatings >= 8 && member.distinctBusinesses <= 2 && flags.push("single_business_fixation"), Math.floor(
    (Date.now() - new Date(member.joinedAt).getTime()) / (1e3 * 60 * 60 * 24)
  ) < 7 && member.totalRatings > 15 && flags.push("new_account_high_volume");
  let oneDayAgo = new Date(Date.now() - 1440 * 60 * 1e3), thirtyDaysAgo = new Date(Date.now() - 720 * 60 * 60 * 1e3), [newAcctRatings] = await db.select({ count: count5() }).from(ratings).innerJoin(members, eq8(ratings.memberId, members.id)).where(
    and7(
      eq8(ratings.businessId, business.id),
      gte3(ratings.createdAt, oneDayAgo),
      gte3(members.joinedAt, thirtyDaysAgo)
    )
  );
  return newAcctRatings.count > 10 && flags.push("coordinated_new_account_burst"), flags;
}
async function submitRating(memberId, data, integrity) {
  let member = await getMemberById(memberId);
  if (!member) throw new Error("Member not found");
  if (member.isBanned) throw new Error("Account suspended");
  let business = await getBusinessById(data.businessId);
  if (!business) throw new Error("Business not found");
  if (Math.floor(
    (Date.now() - new Date(member.joinedAt).getTime()) / (1e3 * 60 * 60 * 24)
  ) < 3) throw new Error("Account must be 3+ days old to rate");
  let today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  let [existingToday] = await db.select({ count: count5() }).from(ratings).where(
    and7(
      eq8(ratings.memberId, memberId),
      eq8(ratings.businessId, data.businessId),
      gte3(ratings.createdAt, today)
    )
  );
  if (existingToday.count > 0) throw new Error("Already rated today. Come back tomorrow.");
  let visitType = data.visitType, dimensions = { foodScore: data.q1Score * 2 };
  switch (visitType) {
    case "dine_in":
      dimensions.serviceScore = data.q2Score * 2, dimensions.vibeScore = data.q3Score * 2;
      break;
    case "delivery":
      dimensions.packagingScore = data.q2Score * 2, dimensions.valueScore = data.q3Score * 2;
      break;
    case "takeaway":
      dimensions.waitTimeScore = data.q2Score * 2, dimensions.valueScore = data.q3Score * 2;
      break;
  }
  let compositeScore = computeComposite(visitType, dimensions), rawScore = compositeScore / 2, anomalyFlags = await detectAnomalies(member, business, rawScore);
  integrity?.velocityFlagged && integrity.velocityRule && anomalyFlags.push(`velocity_${integrity.velocityRule}`);
  let autoFlagged = anomalyFlags.length > 0, baseWeight = getVoteWeight(member.credibilityScore), gamingMult = integrity?.velocityFlagged ? integrity.velocityWeight ?? 0.05 : 1, weight = integrity?.velocityFlagged ? Math.min(baseWeight, gamingMult) : baseWeight, weighted = rawScore * weight, dishCompleted = !!(data.dishId || data.newDishName), timeOnPage = data.timeOnPageMs || 0, timePlausible = timeOnPage >= 1e4, vBoost = 0;
  dishCompleted && (vBoost += 0.05), timePlausible && (vBoost += 0.05);
  let cappedBoost = Math.min(vBoost, 0.5), effWeight = baseWeight * (1 + cappedBoost) * gamingMult, source = data.qrScanId ? "qr_scan" : "app", [rating] = await db.insert(ratings).values({
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
  }).returning(), dishCreated = !1;
  if (data.dishId)
    await db.insert(dishVotes).values({
      ratingId: rating.id,
      dishId: data.dishId,
      memberId,
      businessId: data.businessId
    }), await db.update(dishes).set({ voteCount: sql7`${dishes.voteCount} + 1` }).where(eq8(dishes.id, data.dishId));
  else if (data.newDishName) {
    let normalized = data.newDishName.toLowerCase().trim(), words = normalized.split(/\s+/);
    if (words.length >= 1 && words.length <= 5 && !normalized.includes("http")) {
      let existing = await db.select().from(dishes).where(
        and7(
          eq8(dishes.businessId, data.businessId),
          eq8(dishes.nameNormalized, normalized)
        )
      ), dishId;
      if (existing.length > 0)
        dishId = existing[0].id, await db.update(dishes).set({ voteCount: sql7`${dishes.voteCount} + 1` }).where(eq8(dishes.id, dishId));
      else {
        let [newDish] = await db.insert(dishes).values({
          businessId: data.businessId,
          name: data.newDishName.trim(),
          nameNormalized: normalized,
          suggestedBy: "community",
          voteCount: 1
        }).returning();
        dishId = newDish.id, dishCreated = !0;
      }
      await db.insert(dishVotes).values({
        ratingId: rating.id,
        dishId,
        memberId,
        businessId: data.businessId
      });
    }
  } else data.noNotableDish && await db.insert(dishVotes).values({
    ratingId: rating.id,
    dishId: null,
    memberId,
    businessId: data.businessId,
    noNotableDish: !0
  });
  await updateMemberStats(memberId);
  let { score: newScore, tier: newTier } = await recalculateCredibilityScore(memberId), oldTier = member.credibilityTier, tierUpgraded = newTier !== oldTier;
  if (member.totalRatings === 0) {
    let { activateReferral: activateReferral2 } = await Promise.resolve().then(() => (init_referrals(), referrals_exports));
    activateReferral2(memberId).catch(() => {
    });
  }
  let prevRank = business.rankPosition;
  if (await recalculateBusinessScore(data.businessId), await recalculateRanks(business.city, business.category), await updateChallengerVotes(data.businessId, weighted), data.qrScanId) {
    let { qrScans: qrScans2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    await db.update(qrScans2).set({ converted: !0 }).where(eq8(qrScans2.id, data.qrScanId));
  }
  let newRank = (await getBusinessById(data.businessId))?.rankPosition ?? null, rankChanged = prevRank !== newRank, rankDirection = "same";
  return prevRank && newRank && (newRank < prevRank ? rankDirection = "up" : newRank > prevRank && (rankDirection = "down")), {
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
  let existing = await getRatingById(ratingId);
  if (!existing) throw new Error("Rating not found");
  if (existing.memberId !== memberId) throw new Error("Cannot edit another user's rating");
  if ((Date.now() - new Date(existing.createdAt).getTime()) / (1e3 * 60 * 60) > 24) throw new Error("Edit window has expired (24 hours)");
  let q1 = updates.q1Score ?? existing.q1Score, q2 = updates.q2Score ?? existing.q2Score, q3 = updates.q3Score ?? existing.q3Score, rawScore = ((q1 + q2 + q3) / 3).toFixed(2), weightedScore = (parseFloat(rawScore) * parseFloat(existing.weight)).toFixed(3), [updated] = await db.update(ratings).set({
    q1Score: q1,
    q2Score: q2,
    q3Score: q3,
    wouldReturn: updates.wouldReturn ?? existing.wouldReturn,
    note: updates.note !== void 0 ? updates.note : existing.note,
    rawScore,
    weightedScore
  }).where(eq8(ratings.id, ratingId)).returning();
  return await recalculateBusinessScore(existing.businessId), await recalculateRanks(
    (await getBusinessById(existing.businessId))?.city || "dallas",
    (await getBusinessById(existing.businessId))?.category || ""
  ), await updateMemberStats(memberId), updated;
}
async function deleteRating(ratingId, memberId) {
  let existing = await getRatingById(ratingId);
  if (!existing) throw new Error("Rating not found");
  if (existing.memberId !== memberId) throw new Error("Cannot delete another user's rating");
  await db.update(ratings).set({
    isFlagged: !0,
    flagReason: "user_deleted"
  }).where(eq8(ratings.id, ratingId)), await recalculateBusinessScore(existing.businessId), await recalculateRanks(
    (await getBusinessById(existing.businessId))?.city || "dallas",
    (await getBusinessById(existing.businessId))?.category || ""
  ), await updateMemberStats(memberId);
}
async function submitRatingFlag(ratingId, flaggerId, data) {
  let existing = await getRatingById(ratingId);
  if (!existing) throw new Error("Rating not found");
  if (existing.memberId === flaggerId) throw new Error("Cannot flag your own rating");
  let [flag] = await db.insert(ratingFlags).values({
    ratingId,
    flaggerId,
    q1NoSpecificExperience: data.q1NoSpecificExperience || !1,
    q2ScoreMismatchNote: data.q2ScoreMismatchNote || !1,
    q3InsiderSuspected: data.q3InsiderSuspected || !1,
    q4CoordinatedPattern: data.q4CoordinatedPattern || !1,
    q5CompetitorBombing: data.q5CompetitorBombing || !1,
    explanation: data.explanation || ""
  }).returning();
  return flag;
}
async function getAutoFlaggedRatings(page = 1, perPage = 20) {
  let offset = (page - 1) * perPage, { businesses: businesses2 } = await Promise.resolve().then(() => (init_schema(), schema_exports)), results = await db.select({
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
  }).from(ratings).innerJoin(businesses2, eq8(ratings.businessId, businesses2.id)).where(and7(eq8(ratings.autoFlagged, !0), eq8(ratings.isFlagged, !1))).orderBy(desc5(ratings.createdAt)).limit(perPage).offset(offset), [totalResult] = await db.select({ count: count5() }).from(ratings).where(and7(eq8(ratings.autoFlagged, !0), eq8(ratings.isFlagged, !1)));
  return { ratings: results, total: totalResult?.count ?? 0 };
}
async function reviewAutoFlaggedRating(ratingId, action, reviewedBy) {
  if (action === "confirm") {
    await db.update(ratings).set({ isFlagged: !0 }).where(eq8(ratings.id, ratingId));
    let rating = await getRatingById(ratingId);
    if (rating) {
      await recalculateBusinessScore(rating.businessId);
      let biz = await getBusinessById(rating.businessId);
      biz && await recalculateRanks(biz.city, biz.category), await updateMemberStats(rating.memberId);
    }
  } else
    await db.update(ratings).set({ autoFlagged: !1 }).where(eq8(ratings.id, ratingId));
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
  getTopDishesForAutocomplete: () => getTopDishesForAutocomplete,
  recalculateDishLeaderboard: () => recalculateDishLeaderboard,
  searchDishes: () => searchDishes,
  submitDishSuggestion: () => submitDishSuggestion,
  voteDishSuggestion: () => voteDishSuggestion
});
import { eq as eq9, and as and8, desc as desc6, asc as asc3, sql as sql8, count as count6 } from "drizzle-orm";
async function getBusinessDishes(businessId, limit = 5) {
  return db.select().from(dishes).where(and8(eq9(dishes.businessId, businessId), eq9(dishes.isActive, !0))).orderBy(desc6(dishes.voteCount)).limit(limit);
}
async function searchDishes(businessId, query) {
  let normalized = query.slice(0, 100).replace(/[%_\\]/g, "").toLowerCase().trim();
  if (normalized.length < 2)
    return getBusinessDishes(businessId, 5);
  let results = await db.select().from(dishes).where(
    and8(
      eq9(dishes.businessId, businessId),
      eq9(dishes.isActive, !0),
      sql8`${dishes.nameNormalized} ILIKE ${normalized + "%"}`
    )
  ).orderBy(desc6(dishes.voteCount)).limit(5);
  if (results.length < 3) {
    let containsResults = await db.select().from(dishes).where(
      and8(
        eq9(dishes.businessId, businessId),
        eq9(dishes.isActive, !0),
        sql8`${dishes.nameNormalized} ILIKE ${"%" + normalized + "%"}`
      )
    ).orderBy(desc6(dishes.voteCount)).limit(5), existingIds = new Set(results.map((r) => r.id));
    for (let r of containsResults)
      existingIds.has(r.id) || results.push(r);
  }
  return results.slice(0, 5);
}
async function getDishLeaderboards(city) {
  let boards = await db.select().from(dishLeaderboards).where(and8(eq9(dishLeaderboards.city, city.toLowerCase()), eq9(dishLeaderboards.status, "active"))).orderBy(asc3(dishLeaderboards.displayOrder)), result = [];
  for (let board of boards) {
    let [entryResult] = await db.select({ cnt: count6() }).from(dishLeaderboardEntries).where(eq9(dishLeaderboardEntries.leaderboardId, board.id));
    result.push({ ...board, entryCount: Number(entryResult?.cnt ?? 0) });
  }
  return result;
}
async function getDishLeaderboardWithEntries(slug, city, visitType) {
  let [board] = await db.select().from(dishLeaderboards).where(and8(eq9(dishLeaderboards.dishSlug, slug), eq9(dishLeaderboards.city, city.toLowerCase())));
  if (!board) return null;
  let entries = await db.select({
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
  }).from(dishLeaderboardEntries).innerJoin(businesses, eq9(dishLeaderboardEntries.businessId, businesses.id)).where(eq9(dishLeaderboardEntries.leaderboardId, board.id)).orderBy(asc3(dishLeaderboardEntries.rankPosition)), visitTypeCounts = await db.select({
    visitType: ratings.visitType,
    count: count6()
  }).from(dishVotes).innerJoin(ratings, eq9(dishVotes.ratingId, ratings.id)).innerJoin(dishes, eq9(dishVotes.dishId, dishes.id)).innerJoin(businesses, eq9(dishes.businessId, businesses.id)).where(
    and8(
      eq9(businesses.city, board.city),
      sql8`${dishes.nameNormalized} ILIKE ${"%" + board.dishSlug + "%"}`
    )
  ).groupBy(ratings.visitType), visitTypeBreakdown = {};
  for (let row of visitTypeCounts)
    row.visitType && (visitTypeBreakdown[row.visitType] = Number(row.count));
  let filteredEntries = entries;
  if (visitType && ["dine_in", "delivery", "takeaway"].includes(visitType)) {
    let bizScores = /* @__PURE__ */ new Map();
    for (let entry of entries) {
      let vtRatings = await db.select({
        q1Score: ratings.q1Score,
        q2Score: ratings.q2Score,
        q3Score: ratings.q3Score,
        weight: ratings.weight
      }).from(dishVotes).innerJoin(ratings, eq9(dishVotes.ratingId, ratings.id)).where(
        and8(
          eq9(dishVotes.businessId, entry.businessId),
          eq9(ratings.visitType, visitType),
          eq9(ratings.isFlagged, !1)
        )
      );
      if (vtRatings.length === 0) continue;
      let totalWeight = 0, weightedSum = 0;
      for (let r of vtRatings) {
        let rawScore = (r.q1Score + r.q2Score + r.q3Score) / 3, w = parseFloat(r.weight);
        weightedSum += rawScore * w, totalWeight += w;
      }
      totalWeight > 0 && bizScores.set(entry.businessId, {
        score: Math.round(weightedSum / totalWeight * 100) / 100,
        count: vtRatings.length
      });
    }
    filteredEntries = entries.filter((e) => bizScores.has(e.businessId)).map((e) => {
      let vtData = bizScores.get(e.businessId);
      return { ...e, dishScore: vtData.score.toFixed(2), dishRatingCount: vtData.count };
    }).sort((a, b) => parseFloat(b.dishScore) - parseFloat(a.dishScore)).map((e, i) => ({ ...e, rankPosition: i + 1 }));
  }
  let enrichedEntries = await Promise.all(filteredEntries.map(async (e) => {
    let [photoCount] = await db.select({ cnt: count6() }).from(ratingPhotos).innerJoin(dishVotes, eq9(ratingPhotos.ratingId, dishVotes.ratingId)).where(eq9(dishVotes.businessId, e.businessId));
    return { ...e, dishPhotoCount: Number(photoCount?.cnt ?? 0) };
  })), eligibleCount = enrichedEntries.filter((e) => e.dishRatingCount >= 3).length, isProvisional = board.createdAt.getTime() > Date.now() - 336 * 60 * 60 * 1e3;
  return {
    leaderboard: board,
    entries: enrichedEntries,
    isProvisional,
    minRatingsNeeded: Math.max(0, board.minRatingCount - eligibleCount),
    visitTypeBreakdown
  };
}
async function recalculateDishLeaderboard(leaderboardId) {
  let [board] = await db.select().from(dishLeaderboards).where(eq9(dishLeaderboards.id, leaderboardId));
  if (!board) return 0;
  let dishSlug = board.dishSlug, matchingDishes = await db.select({
    businessId: dishes.businessId,
    dishId: dishes.id
  }).from(dishes).innerJoin(businesses, eq9(dishes.businessId, businesses.id)).where(
    and8(
      eq9(businesses.city, board.city),
      sql8`${dishes.nameNormalized} ILIKE ${"%" + dishSlug + "%"}`,
      eq9(dishes.isActive, !0)
    )
  );
  if (matchingDishes.length === 0) return 0;
  let bizDishMap = /* @__PURE__ */ new Map();
  for (let m of matchingDishes)
    bizDishMap.has(m.businessId) || bizDishMap.set(m.businessId, []), bizDishMap.get(m.businessId).push(m.dishId);
  let entries = [];
  for (let [businessId, dishIds] of bizDishMap) {
    let votes = await db.select({
      ratingId: dishVotes.ratingId,
      memberId: dishVotes.memberId
    }).from(dishVotes).where(
      and8(
        eq9(dishVotes.businessId, businessId),
        sql8`${dishVotes.dishId} = ANY(ARRAY[${sql8.join(dishIds.map((id) => sql8`${id}`), sql8`,`)}]::text[])`
      )
    );
    if (votes.length === 0) continue;
    let ratingIds = votes.map((v) => v.ratingId), ratingRows = await db.select({
      id: ratings.id,
      q1Score: ratings.q1Score,
      q2Score: ratings.q2Score,
      q3Score: ratings.q3Score,
      weight: ratings.weight,
      isFlagged: ratings.isFlagged
    }).from(ratings).where(sql8`${ratings.id} = ANY(ARRAY[${sql8.join(ratingIds.map((id) => sql8`${id}`), sql8`,`)}]::text[])`), totalWeight = 0, weightedSum = 0, validCount = 0;
    for (let r of ratingRows) {
      if (r.isFlagged) continue;
      let rawScore = (r.q1Score + r.q2Score + r.q3Score) / 3, w = parseFloat(r.weight);
      weightedSum += rawScore * w, totalWeight += w, validCount++;
    }
    if (validCount < 1) continue;
    let dishScore = totalWeight > 0 ? weightedSum / totalWeight : 0, dishRatingPhotos = await db.select({ photoUrl: ratingPhotos.photoUrl }).from(ratingPhotos).where(sql8`${ratingPhotos.ratingId} = ANY(ARRAY[${sql8.join(ratingIds.map((id) => sql8`${id}`), sql8`,`)}]::text[])`).limit(10), photoUrl = null;
    if (dishRatingPhotos.length > 0)
      photoUrl = dishRatingPhotos[0].photoUrl;
    else {
      let [bizPhoto] = await db.select({ photoUrl: businessPhotos.photoUrl }).from(businessPhotos).where(eq9(businessPhotos.businessId, businessId)).orderBy(asc3(businessPhotos.sortOrder)).limit(1);
      photoUrl = bizPhoto?.photoUrl ?? null;
    }
    entries.push({
      businessId,
      dishScore: Math.round(dishScore * 100) / 100,
      dishRatingCount: validCount,
      photoUrl,
      dishPhotoCount: dishRatingPhotos.length
    });
  }
  entries.sort((a, b) => b.dishScore - a.dishScore), await db.delete(dishLeaderboardEntries).where(eq9(dishLeaderboardEntries.leaderboardId, leaderboardId));
  for (let i = 0; i < entries.length; i++) {
    let e = entries[i];
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
  return db.select().from(dishSuggestions).where(and8(eq9(dishSuggestions.city, city.toLowerCase()), eq9(dishSuggestions.status, "proposed"))).orderBy(desc6(dishSuggestions.voteCount)).limit(20);
}
async function submitDishSuggestion(memberId, city, dishName) {
  let oneWeekAgo = new Date(Date.now() - 6048e5), [recentCount] = await db.select({ cnt: count6() }).from(dishSuggestions).where(
    and8(
      eq9(dishSuggestions.suggestedBy, memberId),
      sql8`${dishSuggestions.createdAt} >= ${oneWeekAgo}`
    )
  );
  if (Number(recentCount.cnt) >= 3)
    throw new Error("You can only suggest 3 dishes per week");
  let [suggestion] = await db.insert(dishSuggestions).values({
    city: city.toLowerCase(),
    dishName: dishName.trim(),
    suggestedBy: memberId
  }).returning();
  return suggestion;
}
async function voteDishSuggestion(memberId, suggestionId) {
  let [existingVote] = await db.select().from(dishSuggestionVotes).where(
    and8(
      eq9(dishSuggestionVotes.suggestionId, suggestionId),
      eq9(dishSuggestionVotes.memberId, memberId)
    )
  );
  if (existingVote)
    throw new Error("Already voted for this suggestion");
  await db.insert(dishSuggestionVotes).values({ suggestionId, memberId });
  let [updated] = await db.update(dishSuggestions).set({ voteCount: sql8`${dishSuggestions.voteCount} + 1` }).where(eq9(dishSuggestions.id, suggestionId)).returning();
  if (!updated) throw new Error("Suggestion not found");
  if (updated.voteCount >= updated.activationThreshold) {
    await db.update(dishSuggestions).set({ status: "active" }).where(eq9(dishSuggestions.id, suggestionId));
    let slug = updated.dishName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""), [existing] = await db.select().from(dishLeaderboards).where(and8(eq9(dishLeaderboards.city, updated.city), eq9(dishLeaderboards.dishSlug, slug)));
    existing || await db.insert(dishLeaderboards).values({
      city: updated.city,
      dishName: updated.dishName,
      dishSlug: slug,
      source: "community"
    });
  }
  return updated;
}
async function getBusinessDishRankings(businessId) {
  let entries = await db.select({
    dishSlug: dishLeaderboards.dishSlug,
    dishName: dishLeaderboards.dishName,
    dishEmoji: dishLeaderboards.dishEmoji,
    rankPosition: dishLeaderboardEntries.rankPosition,
    dishScore: dishLeaderboardEntries.dishScore
  }).from(dishLeaderboardEntries).innerJoin(dishLeaderboards, eq9(dishLeaderboardEntries.leaderboardId, dishLeaderboards.id)).where(eq9(dishLeaderboardEntries.businessId, businessId)).orderBy(asc3(dishLeaderboardEntries.rankPosition)), result = [];
  for (let entry of entries) {
    let [countResult] = await db.select({ count: count6() }).from(dishLeaderboardEntries).innerJoin(dishLeaderboards, eq9(dishLeaderboardEntries.leaderboardId, dishLeaderboards.id)).where(eq9(dishLeaderboards.dishSlug, entry.dishSlug));
    result.push({
      ...entry,
      entryCount: countResult?.count || 0
    });
  }
  return result;
}
async function getBatchDishRankings(businessIds) {
  if (businessIds.length === 0) return {};
  let entries = await db.select({
    businessId: dishLeaderboardEntries.businessId,
    dishSlug: dishLeaderboards.dishSlug,
    dishName: dishLeaderboards.dishName,
    dishEmoji: dishLeaderboards.dishEmoji,
    rankPosition: dishLeaderboardEntries.rankPosition
  }).from(dishLeaderboardEntries).innerJoin(dishLeaderboards, eq9(dishLeaderboardEntries.leaderboardId, dishLeaderboards.id)).where(sql8`${dishLeaderboardEntries.businessId} = ANY(ARRAY[${sql8.join(businessIds.map((id) => sql8`${id}`), sql8`,`)}]::text[])`).orderBy(asc3(dishLeaderboardEntries.rankPosition)), result = {};
  for (let entry of entries)
    result[entry.businessId] || (result[entry.businessId] = []), result[entry.businessId].length < 3 && result[entry.businessId].push({
      dishSlug: entry.dishSlug,
      dishName: entry.dishName,
      dishEmoji: entry.dishEmoji,
      rankPosition: entry.rankPosition
    });
  return result;
}
async function getTopDishesForAutocomplete(city, limit = 50) {
  return (await db.select({
    name: dishes.name,
    businessName: businesses.name,
    businessSlug: businesses.slug,
    businessId: dishes.businessId,
    voteCount: dishes.voteCount
  }).from(dishes).innerJoin(businesses, eq9(dishes.businessId, businesses.id)).where(and8(eq9(businesses.city, city), eq9(dishes.isActive, !0), eq9(businesses.isActive, !0))).orderBy(desc6(dishes.voteCount)).limit(limit)).map((r) => ({
    name: r.name,
    businessName: r.businessName,
    businessSlug: r.businessSlug,
    businessId: r.businessId,
    voteCount: r.voteCount
  }));
}
var init_dishes = __esm({
  "server/storage/dishes.ts"() {
    "use strict";
    init_schema();
    init_db();
  }
});

// server/storage/categories.ts
import { eq as eq10, desc as desc7 } from "drizzle-orm";
async function getDbCategories(activeOnly = !0) {
  return activeOnly ? db.select().from(categories).where(eq10(categories.isActive, !0)) : db.select().from(categories);
}
async function createCategorySuggestion(data) {
  let [suggestion] = await db.insert(categorySuggestions).values({
    name: data.name,
    description: data.description,
    vertical: data.vertical,
    suggestedBy: data.suggestedBy
  }).returning();
  return suggestion;
}
async function getPendingSuggestions() {
  return db.select().from(categorySuggestions).where(eq10(categorySuggestions.status, "pending")).orderBy(desc7(categorySuggestions.voteCount));
}
async function reviewSuggestion(id, status, reviewedBy) {
  let [updated] = await db.update(categorySuggestions).set({ status, reviewedBy, reviewedAt: /* @__PURE__ */ new Date() }).where(eq10(categorySuggestions.id, id)).returning();
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
import { eq as eq11, and as and9, count as count7, desc as desc8 } from "drizzle-orm";
async function getMemberBadges(memberId) {
  return db.select().from(memberBadges).where(eq11(memberBadges.memberId, memberId)).orderBy(memberBadges.earnedAt);
}
async function getMemberBadgeCount(memberId) {
  let [result] = await db.select({ cnt: count7() }).from(memberBadges).where(eq11(memberBadges.memberId, memberId));
  return Number(result?.cnt ?? 0);
}
async function awardBadge(memberId, badgeId, badgeFamily) {
  try {
    let [badge] = await db.insert(memberBadges).values({ memberId, badgeId, badgeFamily }).onConflictDoNothing().returning();
    return badge ?? null;
  } catch {
    return null;
  }
}
async function hasBadge(memberId, badgeId) {
  let [result] = await db.select({ cnt: count7() }).from(memberBadges).where(and9(eq11(memberBadges.memberId, memberId), eq11(memberBadges.badgeId, badgeId)));
  return Number(result?.cnt ?? 0) > 0;
}
async function getEarnedBadgeIds(memberId) {
  return (await db.select({ badgeId: memberBadges.badgeId }).from(memberBadges).where(eq11(memberBadges.memberId, memberId))).map((r) => r.badgeId);
}
async function getBadgeLeaderboard(limit = 20) {
  return db.select({
    memberId: memberBadges.memberId,
    displayName: members.displayName,
    username: members.username,
    avatarUrl: members.avatarUrl,
    credibilityTier: members.credibilityTier,
    badgeCount: count7(memberBadges.id)
  }).from(memberBadges).innerJoin(members, eq11(memberBadges.memberId, members.id)).groupBy(memberBadges.memberId, members.displayName, members.username, members.avatarUrl, members.credibilityTier).orderBy(desc8(count7(memberBadges.id))).limit(limit);
}
var init_badges = __esm({
  "server/storage/badges.ts"() {
    "use strict";
    init_schema();
    init_db();
  }
});

// server/storage/payments.ts
import { eq as eq12, and as and10, desc as desc9, sql as sql9, count as count8, sum } from "drizzle-orm";
async function createPaymentRecord(params) {
  let [payment] = await db.insert(payments).values({
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
  let [payment] = await db.select().from(payments).where(eq12(payments.id, id)).limit(1);
  return payment ?? null;
}
async function updatePaymentStatus(id, status) {
  let [updated] = await db.update(payments).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq12(payments.id, id)).returning();
  return updated ?? null;
}
async function updatePaymentStatusByStripeId(stripePaymentIntentId, status) {
  let [updated] = await db.update(payments).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq12(payments.stripePaymentIntentId, stripePaymentIntentId)).returning();
  return updated ?? null;
}
async function getMemberPayments(memberId, limit = 20) {
  return db.select().from(payments).where(eq12(payments.memberId, memberId)).orderBy(desc9(payments.createdAt)).limit(limit);
}
async function getBusinessPayments(businessId, limit = 20) {
  return db.select().from(payments).where(eq12(payments.businessId, businessId)).orderBy(desc9(payments.createdAt)).limit(limit);
}
async function getRevenueMetrics() {
  let byTypeRows = await db.select({
    type: payments.type,
    count: count8(),
    revenue: sum(payments.amount)
  }).from(payments).where(eq12(payments.status, "succeeded")).groupBy(payments.type), [activeRow] = await db.select({ count: count8() }).from(payments).where(
    and10(
      eq12(payments.status, "succeeded")
    )
  ), [cancelledRow] = await db.select({ count: count8() }).from(payments).where(eq12(payments.status, "cancelled")), typeMap = {
    challenger_entry: { count: 0, revenue: 0 },
    dashboard_pro: { count: 0, revenue: 0 },
    featured_placement: { count: 0, revenue: 0 }
  }, totalRevenue = 0;
  for (let row of byTypeRows) {
    let rev = Number(row.revenue) || 0, cnt = Number(row.count) || 0;
    typeMap[row.type] = { count: cnt, revenue: rev }, totalRevenue += rev;
  }
  return {
    totalRevenue,
    byType: typeMap,
    activeSubscriptions: activeRow?.count ?? 0,
    cancelledPayments: cancelledRow?.count ?? 0
  };
}
async function getRevenueByMonth(months = 6) {
  return (await db.select({
    month: sql9`strftime('%Y-%m', ${payments.createdAt})`,
    revenue: sql9`COALESCE(SUM(${payments.amount}), 0)`,
    count: sql9`COUNT(*)`
  }).from(payments).where(eq12(payments.status, "succeeded")).groupBy(sql9`strftime('%Y-%m', ${payments.createdAt})`).orderBy(sql9`strftime('%Y-%m', ${payments.createdAt}) DESC`).limit(months)).map((r) => ({
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
import { eq as eq13, desc as desc10 } from "drizzle-orm";
async function logWebhookEvent(params) {
  let [event] = await db.insert(webhookEvents).values({
    source: params.source,
    eventId: params.eventId,
    eventType: params.eventType,
    payload: params.payload,
    processed: params.processed ?? !1,
    error: params.error || null
  }).returning();
  return event;
}
async function markWebhookProcessed(id, error) {
  await db.update(webhookEvents).set({ processed: !0, error: error || null }).where(eq13(webhookEvents.id, id));
}
async function getWebhookEventById(id) {
  let [event] = await db.select().from(webhookEvents).where(eq13(webhookEvents.id, id)).limit(1);
  return event ?? null;
}
async function getRecentWebhookEvents(source, limit = 50) {
  return db.select().from(webhookEvents).where(eq13(webhookEvents.source, source)).orderBy(desc10(webhookEvents.createdAt)).limit(limit);
}
var init_webhook_events = __esm({
  "server/storage/webhook-events.ts"() {
    "use strict";
    init_schema();
    init_db();
  }
});

// server/storage/featured-placements.ts
import { eq as eq14, and as and11, gt, lte as lte2, desc as desc11 } from "drizzle-orm";
async function createFeaturedPlacement(params) {
  let startsAt = /* @__PURE__ */ new Date(), expiresAt = new Date(startsAt.getTime() + FEATURED_DURATION_DAYS * 24 * 60 * 60 * 1e3), [placement] = await db.insert(featuredPlacements).values({
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
  let now = /* @__PURE__ */ new Date();
  return db.select().from(featuredPlacements).where(
    and11(
      eq14(featuredPlacements.city, city),
      eq14(featuredPlacements.status, "active"),
      gt(featuredPlacements.expiresAt, now)
    )
  ).orderBy(desc11(featuredPlacements.createdAt));
}
async function getBusinessFeaturedStatus(businessId) {
  let now = /* @__PURE__ */ new Date(), [placement] = await db.select().from(featuredPlacements).where(
    and11(
      eq14(featuredPlacements.businessId, businessId),
      eq14(featuredPlacements.status, "active"),
      gt(featuredPlacements.expiresAt, now)
    )
  ).orderBy(desc11(featuredPlacements.createdAt)).limit(1);
  return placement ?? null;
}
async function expireFeaturedByPayment(paymentId) {
  let [updated] = await db.update(featuredPlacements).set({ status: "cancelled" }).where(
    and11(
      eq14(featuredPlacements.paymentId, paymentId),
      eq14(featuredPlacements.status, "active")
    )
  ).returning();
  return updated ?? null;
}
async function expireOldPlacements() {
  let now = /* @__PURE__ */ new Date();
  return (await db.update(featuredPlacements).set({ status: "expired" }).where(
    and11(
      eq14(featuredPlacements.status, "active"),
      lte2(featuredPlacements.expiresAt, now)
    )
  ).returning()).length;
}
var FEATURED_DURATION_DAYS, init_featured_placements = __esm({
  "server/storage/featured-placements.ts"() {
    "use strict";
    init_schema();
    init_db();
    FEATURED_DURATION_DAYS = 7;
  }
});

// server/storage/claims.ts
import crypto2 from "crypto";
import { eq as eq15, and as and12, count as count9, desc as desc12 } from "drizzle-orm";
async function submitClaim(businessId, memberId, verificationMethod) {
  let [claim] = await db.insert(businessClaims).values({ businessId, memberId, verificationMethod }).returning();
  return claim;
}
async function getClaimByMemberAndBusiness(memberId, businessId) {
  let [claim] = await db.select().from(businessClaims).where(
    and12(
      eq15(businessClaims.memberId, memberId),
      eq15(businessClaims.businessId, businessId)
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
  }).from(businessClaims).leftJoin(businesses, eq15(businessClaims.businessId, businesses.id)).leftJoin(members, eq15(businessClaims.memberId, members.id)).where(eq15(businessClaims.status, "pending")).orderBy(desc12(businessClaims.submittedAt));
}
async function reviewClaim(id, status, reviewedBy) {
  let [updated] = await db.update(businessClaims).set({ status, reviewedAt: /* @__PURE__ */ new Date() }).where(eq15(businessClaims.id, id)).returning();
  return updated ? (status === "approved" && updated.businessId && updated.memberId && await db.update(businesses).set({
    ownerId: updated.memberId,
    isClaimed: !0,
    claimedAt: /* @__PURE__ */ new Date()
  }).where(eq15(businesses.id, updated.businessId)), updated) : null;
}
async function getClaimsByMember(memberId) {
  return db.select({
    id: businessClaims.id,
    businessId: businessClaims.businessId,
    businessName: businesses.name,
    businessSlug: businesses.slug,
    verificationMethod: businessClaims.verificationMethod,
    status: businessClaims.status,
    submittedAt: businessClaims.submittedAt,
    reviewedAt: businessClaims.reviewedAt
  }).from(businessClaims).leftJoin(businesses, eq15(businessClaims.businessId, businesses.id)).where(eq15(businessClaims.memberId, memberId)).orderBy(desc12(businessClaims.submittedAt));
}
async function submitClaimWithCode(businessId, memberId, verificationMethod) {
  let code = String(crypto2.randomInt(1e5, 999999)), expiresAt = new Date(Date.now() + 2880 * 60 * 1e3), [claim] = await db.insert(businessClaims).values({
    businessId,
    memberId,
    verificationMethod,
    verificationCode: code,
    codeExpiresAt: expiresAt
  }).returning();
  return claim;
}
async function verifyClaimByCode(claimId, memberId, code) {
  let [claim] = await db.select().from(businessClaims).where(and12(eq15(businessClaims.id, claimId), eq15(businessClaims.memberId, memberId)));
  return claim ? claim.status !== "pending" ? { success: !1, error: "Claim already reviewed" } : (claim.attempts || 0) >= 5 ? { success: !1, error: "Too many attempts. Contact support." } : claim.codeExpiresAt && new Date(claim.codeExpiresAt) < /* @__PURE__ */ new Date() ? (await db.update(businessClaims).set({ status: "expired" }).where(eq15(businessClaims.id, claimId)), { success: !1, error: "Verification code expired" }) : (await db.update(businessClaims).set({ attempts: (claim.attempts || 0) + 1 }).where(eq15(businessClaims.id, claimId)), claim.verificationCode !== code ? { success: !1, error: "Invalid verification code" } : (await db.update(businessClaims).set({ status: "verified", reviewedAt: /* @__PURE__ */ new Date() }).where(eq15(businessClaims.id, claimId)), claim.businessId && claim.memberId && await db.update(businesses).set({ ownerId: claim.memberId, isClaimed: !0, claimedAt: /* @__PURE__ */ new Date() }).where(eq15(businesses.id, claim.businessId)), { success: !0 })) : { success: !1, error: "Claim not found" };
}
async function getClaimCount() {
  let [result] = await db.select({ cnt: count9() }).from(businessClaims).where(eq15(businessClaims.status, "pending"));
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
  }).from(ratingFlags).leftJoin(members, eq15(ratingFlags.flaggerId, members.id)).where(eq15(ratingFlags.status, "pending")).orderBy(desc12(ratingFlags.createdAt));
}
async function reviewFlag(id, status, reviewedBy) {
  let [updated] = await db.update(ratingFlags).set({ status, reviewedBy, reviewedAt: /* @__PURE__ */ new Date() }).where(eq15(ratingFlags.id, id)).returning();
  return updated ?? null;
}
async function getFlagCount() {
  let [result] = await db.select({ cnt: count9() }).from(ratingFlags).where(eq15(ratingFlags.status, "pending"));
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
import { eq as eq16, count as count10, and as and13, gte as gte4, sql as sql10 } from "drizzle-orm";
async function recordQrScan(businessId, memberId) {
  let [scan] = await db.insert(qrScans).values({
    businessId,
    memberId: memberId || void 0
  }).returning({ id: qrScans.id });
  return scan;
}
async function getQrScanStats(businessId) {
  let now = /* @__PURE__ */ new Date(), sevenDaysAgo = new Date(now.getTime() - 10080 * 60 * 1e3), thirtyDaysAgo = new Date(now.getTime() - 720 * 60 * 60 * 1e3), [totalResult] = await db.select({ cnt: count10() }).from(qrScans).where(eq16(qrScans.businessId, businessId)), totalScans = Number(totalResult?.cnt ?? 0), [uniqueResult] = await db.select({ cnt: sql10`count(distinct ${qrScans.memberId})` }).from(qrScans).where(eq16(qrScans.businessId, businessId)), uniqueMembers = Number(uniqueResult?.cnt ?? 0), [conversionResult] = await db.select({ cnt: count10() }).from(qrScans).where(and13(eq16(qrScans.businessId, businessId), eq16(qrScans.converted, !0))), conversions = Number(conversionResult?.cnt ?? 0), [weekResult] = await db.select({ cnt: count10() }).from(qrScans).where(and13(eq16(qrScans.businessId, businessId), gte4(qrScans.scannedAt, sevenDaysAgo))), last7Days = Number(weekResult?.cnt ?? 0), [monthResult] = await db.select({ cnt: count10() }).from(qrScans).where(and13(eq16(qrScans.businessId, businessId), gte4(qrScans.scannedAt, thirtyDaysAgo))), last30Days = Number(monthResult?.cnt ?? 0), conversionRate = totalScans > 0 ? Math.round(conversions / totalScans * 100) : 0;
  return { totalScans, uniqueMembers, conversions, conversionRate, last7Days, last30Days };
}
async function markQrScanConverted(scanId) {
  await db.update(qrScans).set({ converted: !0 }).where(eq16(qrScans.id, scanId));
}
var init_qr = __esm({
  "server/storage/qr.ts"() {
    "use strict";
    init_schema();
    init_db();
  }
});

// server/storage/beta-invites.ts
import { eq as eq17 } from "drizzle-orm";
async function createBetaInvite(params) {
  let [invite] = await db.insert(betaInvites).values({
    email: params.email,
    displayName: params.displayName,
    referralCode: params.referralCode,
    invitedBy: params.invitedBy
  }).returning();
  return invite;
}
async function getBetaInviteByEmail(email) {
  let [invite] = await db.select().from(betaInvites).where(eq17(betaInvites.email, email));
  return invite;
}
async function markBetaInviteJoined(email, memberId) {
  await db.update(betaInvites).set({ status: "joined", joinedAt: /* @__PURE__ */ new Date(), memberId }).where(eq17(betaInvites.email, email));
}
async function getBetaInviteStats() {
  let invites = await db.select().from(betaInvites), joined = invites.filter((i) => i.status === "joined").length;
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
import { gte as gte5, lt, sql as sql11, count as count11 } from "drizzle-orm";
async function persistAnalyticsEvents(entries) {
  if (entries.length === 0) return;
  let values = entries.map((e) => ({
    event: e.event,
    userId: e.userId || null,
    metadata: e.metadata || null,
    createdAt: new Date(e.timestamp)
  })), CHUNK_SIZE = 100;
  for (let i = 0; i < values.length; i += CHUNK_SIZE) {
    let chunk = values.slice(i, i + CHUNK_SIZE);
    await db.insert(analyticsEvents).values(chunk);
  }
}
async function getPersistedEventCounts(since) {
  let rows = await db.select({
    event: analyticsEvents.event,
    count: count11()
  }).from(analyticsEvents).where(gte5(analyticsEvents.createdAt, since)).groupBy(analyticsEvents.event), result = {};
  for (let row of rows)
    result[row.event] = row.count;
  return result;
}
async function getPersistedDailyStats(days) {
  let since = new Date(Date.now() - days * 24 * 60 * 60 * 1e3);
  return (await db.select({
    date: sql11`DATE(${analyticsEvents.createdAt})`,
    count: count11()
  }).from(analyticsEvents).where(gte5(analyticsEvents.createdAt, since)).groupBy(sql11`DATE(${analyticsEvents.createdAt})`).orderBy(sql11`DATE(${analyticsEvents.createdAt})`)).map((r) => ({ date: r.date, events: r.count }));
}
async function getPersistedDailyStatsExtended(days) {
  let since = new Date(Date.now() - days * 24 * 60 * 60 * 1e3);
  return (await db.select({
    date: sql11`DATE(${analyticsEvents.createdAt})`,
    event: analyticsEvents.event,
    count: count11()
  }).from(analyticsEvents).where(gte5(analyticsEvents.createdAt, since)).groupBy(sql11`DATE(${analyticsEvents.createdAt})`, analyticsEvents.event).orderBy(sql11`DATE(${analyticsEvents.createdAt})`, analyticsEvents.event)).map((r) => ({ date: r.date, event: r.event, count: r.count }));
}
async function getPersistedEventTotal() {
  let [result] = await db.select({ count: count11() }).from(analyticsEvents);
  return result.count;
}
async function purgeOldAnalyticsEvents(retentionDays = 90) {
  let cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1e3);
  return (await db.delete(analyticsEvents).where(lt(analyticsEvents.createdAt, cutoff))).rowCount ?? 0;
}
var DATA_RETENTION_POLICY, init_analytics = __esm({
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
  let now = Date.now(), windows = {
    last1h: new Date(now - 3600 * 1e3),
    last24h: new Date(now - 1440 * 60 * 1e3),
    last7d: new Date(now - 10080 * 60 * 1e3),
    last30d: new Date(now - 720 * 60 * 60 * 1e3)
  }, [r1h, r24h, r7d, r30d] = await Promise.all([
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
  let [result] = await db.insert(betaFeedback).values(params).returning();
  return result;
}
async function getRecentFeedback(limit = 50) {
  return db.select().from(betaFeedback).orderBy(desc15(betaFeedback.createdAt)).limit(limit);
}
async function getFeedbackStats() {
  let rows = await db.select({
    category: betaFeedback.category,
    count: count13()
  }).from(betaFeedback).groupBy(betaFeedback.category), total = rows.reduce((sum2, r) => sum2 + r.count, 0), byCategory = {};
  for (let row of rows)
    byCategory[row.category] = row.count;
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
  getBusinessPhotoDetails: () => getBusinessPhotoDetails,
  getBusinessPhotos: () => getBusinessPhotos,
  getBusinessPhotosMap: () => getBusinessPhotosMap,
  getBusinessRatings: () => getBusinessRatings,
  getBusinessesByIds: () => getBusinessesByIds,
  getBusinessesWithoutPhotos: () => getBusinessesWithoutPhotos,
  getClaimByMemberAndBusiness: () => getClaimByMemberAndBusiness,
  getClaimCount: () => getClaimCount,
  getClaimsByMember: () => getClaimsByMember,
  getCredibilityTier: () => getCredibilityTier,
  getCuisines: () => getCuisines,
  getDbCategories: () => getDbCategories,
  getDishLeaderboardWithEntries: () => getDishLeaderboardWithEntries,
  getDishLeaderboards: () => getDishLeaderboards,
  getDishSuggestions: () => getDishSuggestions,
  getDishVoteStreakStats: () => getDishVoteStreakStats,
  getEarnedBadgeIds: () => getEarnedBadgeIds,
  getFeedbackStats: () => getFeedbackStats,
  getFlagCount: () => getFlagCount,
  getImportStats: () => getImportStats,
  getJustRatedBusinesses: () => getJustRatedBusinesses,
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
  getNeighborhoods: () => getNeighborhoods,
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
  submitClaimWithCode: () => submitClaimWithCode,
  submitDishSuggestion: () => submitDishSuggestion,
  submitRating: () => submitRating,
  submitRatingFlag: () => submitRatingFlag,
  updateBusinessHours: () => updateBusinessHours,
  updateBusinessSubscription: () => updateBusinessSubscription,
  updateChallengerVotes: () => updateChallengerVotes,
  updateMemberAvatar: () => updateMemberAvatar,
  updateMemberEmail: () => updateMemberEmail,
  updateMemberProfile: () => updateMemberProfile,
  updateMemberStats: () => updateMemberStats,
  updateNotificationFrequencyPrefs: () => updateNotificationFrequencyPrefs,
  updateNotificationPrefs: () => updateNotificationPrefs,
  updatePaymentStatus: () => updatePaymentStatus,
  updatePaymentStatusByStripeId: () => updatePaymentStatusByStripeId,
  updatePushToken: () => updatePushToken,
  verifyClaimByCode: () => verifyClaimByCode,
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
  return email ? ADMIN_EMAILS.includes(email.toLowerCase()) : !1;
}
var ADMIN_EMAILS, init_admin = __esm({
  "shared/admin.ts"() {
    "use strict";
    ADMIN_EMAILS = Object.freeze([
      "rahul@topranker.com",
      "admin@topranker.com"
    ]);
  }
});

// server/google-places.ts
var google_places_exports = {};
__export(google_places_exports, {
  batchEnrichActionUrls: () => batchEnrichActionUrls,
  enrichBusinessActionUrls: () => enrichBusinessActionUrls,
  enrichBusinessFullDetails: () => enrichBusinessFullDetails,
  fetchAndStorePhotos: () => fetchAndStorePhotos,
  fetchPlaceActionUrls: () => fetchPlaceActionUrls,
  fetchPlaceFullDetails: () => fetchPlaceFullDetails,
  fetchPlacePhotos: () => fetchPlacePhotos,
  normalizeCategory: () => normalizeCategory,
  searchNearbyRestaurants: () => searchNearbyRestaurants,
  searchPlace: () => searchPlace
});
async function fetchPlacePhotos(googlePlaceId, limit = 5) {
  let apiKey = config.googleMapsApiKey;
  if (!apiKey)
    return log.tag("GooglePlaces").warn("No API key configured \u2014 skipping photo fetch"), [];
  let url = `${API_BASE}/places/${googlePlaceId}?fields=photos&key=${apiKey}`;
  try {
    let response = await fetch(url, {
      headers: {
        "Content-Type": "application/json"
      },
      signal: AbortSignal.timeout(1e4)
    });
    if (!response.ok) {
      let body = await response.text();
      return log.tag("GooglePlaces").error(
        `Place details failed for ${googlePlaceId}: ${response.status} \u2014 ${body.slice(0, 200)}`
      ), [];
    }
    let data = await response.json();
    return !data.photos || data.photos.length === 0 ? (log.tag("GooglePlaces").info(`No photos found for ${googlePlaceId}`), []) : data.photos.slice(0, limit).map((p) => p.name);
  } catch (err) {
    return err.name === "TimeoutError" ? log.tag("GooglePlaces").error(`Timeout fetching photos for ${googlePlaceId}`) : log.tag("GooglePlaces").error(`Error fetching photos for ${googlePlaceId}: ${err.message}`), [];
  }
}
async function searchPlace(query, city) {
  let apiKey = config.googleMapsApiKey;
  if (!apiKey) return null;
  let url = `${API_BASE}/places:searchText`;
  try {
    let response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id,places.displayName"
      },
      body: JSON.stringify({
        textQuery: `${query} ${city}`,
        maxResultCount: 1
      }),
      signal: AbortSignal.timeout(1e4)
    });
    if (!response.ok) return null;
    let place = (await response.json()).places?.[0];
    return place ? {
      placeId: place.id,
      name: place.displayName?.text || query
    } : null;
  } catch {
    return null;
  }
}
async function searchNearbyRestaurants(city, category = "restaurant", maxResults = 20) {
  let apiKey = config.googleMapsApiKey;
  if (!apiKey)
    return log.tag("GooglePlaces").warn("No API key \u2014 skipping nearby search"), [];
  let typeQuery = category === "restaurant" ? "restaurants" : category === "cafe" ? "cafes" : category === "bar" ? "bars" : category === "bakery" ? "bakeries" : category === "street_food" ? "street food" : category === "fast_food" ? "fast food" : "restaurants";
  try {
    let response = await fetch(`${API_BASE}/places:searchText`, {
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
      let body = await response.text();
      return log.tag("GooglePlaces").error(`Nearby search failed: ${response.status} \u2014 ${body.slice(0, 200)}`), [];
    }
    let data = await response.json();
    if (!data.places || data.places.length === 0) return [];
    let priceLevelMap = {
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
    return log.tag("GooglePlaces").error(`Nearby search error: ${err.message}`), [];
  }
}
function normalizeCategory(types) {
  return types.includes("cafe") || types.includes("coffee_shop") ? "cafe" : types.includes("bar") || types.includes("night_club") ? "bar" : types.includes("bakery") ? "bakery" : types.includes("meal_delivery") || types.includes("meal_takeaway") ? "fast_food" : "restaurant";
}
async function fetchPlaceActionUrls(googlePlaceId, businessName, city) {
  let apiKey = config.googleMapsApiKey, result = {
    websiteUri: null,
    googleMapsUri: null,
    menuUrl: null,
    doordashUrl: null,
    uberEatsUrl: null
  }, encodedName = encodeURIComponent(`${businessName} ${city}`);
  if (result.doordashUrl = `https://www.doordash.com/search/store/${encodedName}/`, result.uberEatsUrl = `https://www.ubereats.com/search?q=${encodedName}`, !apiKey)
    return log.tag("GooglePlaces").warn("No API key \u2014 returning constructed URLs only"), result;
  try {
    let url = `${API_BASE}/places/${googlePlaceId}?fields=websiteUri,googleMapsUri&key=${apiKey}`, response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(1e4)
    });
    if (!response.ok)
      return log.tag("GooglePlaces").error(`Action URL fetch failed for ${googlePlaceId}: ${response.status}`), result;
    let data = await response.json();
    result.websiteUri = data.websiteUri || null, result.googleMapsUri = data.googleMapsUri || null, result.websiteUri && !result.menuUrl && (result.menuUrl = result.websiteUri), log.tag("GooglePlaces").info(`Fetched action URLs for ${googlePlaceId}: website=${!!result.websiteUri}, maps=${!!result.googleMapsUri}`);
  } catch (err) {
    log.tag("GooglePlaces").error(`Action URL fetch error for ${googlePlaceId}: ${err.message}`);
  }
  return result;
}
async function enrichBusinessActionUrls(businessId, googlePlaceId, businessName, city) {
  let urls = await fetchPlaceActionUrls(googlePlaceId, businessName, city), updates = {};
  if (urls.menuUrl && (updates.menuUrl = urls.menuUrl), urls.doordashUrl && (updates.doordashUrl = urls.doordashUrl), urls.uberEatsUrl && (updates.uberEatsUrl = urls.uberEatsUrl), Object.keys(updates).length === 0) return !1;
  let { updateBusinessActions: updateBusinessActions2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
  if (await updateBusinessActions2(businessId, updates), urls.googleMapsUri) {
    let { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports)), { businesses: businesses2 } = await Promise.resolve().then(() => (init_schema(), schema_exports)), { eq: eq35 } = await import("drizzle-orm");
    await db2.update(businesses2).set({ googleMapsUrl: urls.googleMapsUri }).where(eq35(businesses2.id, businessId));
  }
  return log.tag("GooglePlaces").info(`Enriched action URLs for business ${businessId}: ${Object.keys(updates).join(", ")}`), !0;
}
async function batchEnrichActionUrls() {
  let { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports)), { businesses: businesses2 } = await Promise.resolve().then(() => (init_schema(), schema_exports)), { isNotNull: isNotNull8, isNull: isNull2, and: and21 } = await import("drizzle-orm"), unenriched = await db2.select({
    id: businesses2.id,
    googlePlaceId: businesses2.googlePlaceId,
    name: businesses2.name,
    city: businesses2.city
  }).from(businesses2).where(and21(
    isNotNull8(businesses2.googlePlaceId),
    isNull2(businesses2.doordashUrl)
  )).limit(50), enriched = 0;
  for (let biz of unenriched)
    if (biz.googlePlaceId)
      try {
        await enrichBusinessActionUrls(biz.id, biz.googlePlaceId, biz.name, biz.city || "Dallas") && enriched++, await new Promise((r) => setTimeout(r, 200));
      } catch (err) {
        log.tag("GooglePlaces").error(`Batch enrich failed for ${biz.id}: ${err}`);
      }
  return log.tag("GooglePlaces").info(`Batch enriched ${enriched}/${unenriched.length} businesses with action URLs`), enriched;
}
async function fetchPlaceFullDetails(googlePlaceId) {
  let apiKey = config.googleMapsApiKey;
  if (!apiKey) return null;
  let fields = [
    "editorialSummary",
    "currentOpeningHours",
    "priceLevel",
    "servesBreakfast",
    "servesLunch",
    "servesDinner",
    "servesBeer",
    "servesWine"
  ].join(",");
  try {
    let url = `${API_BASE}/places/${googlePlaceId}?fields=${fields}&key=${apiKey}`, response = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(1e4)
    });
    if (!response.ok)
      return log.tag("GooglePlaces").error(`Full details failed for ${googlePlaceId}: ${response.status}`), null;
    let data = await response.json(), priceLevelMap = {
      PRICE_LEVEL_FREE: "$",
      PRICE_LEVEL_INEXPENSIVE: "$",
      PRICE_LEVEL_MODERATE: "$$",
      PRICE_LEVEL_EXPENSIVE: "$$$",
      PRICE_LEVEL_VERY_EXPENSIVE: "$$$$"
    }, hours = data.currentOpeningHours, weekdayText = hours?.weekdayDescriptions || [];
    return {
      description: data.editorialSummary?.text || null,
      openingHours: weekdayText.length > 0 ? { weekday_text: weekdayText } : null,
      isOpenNow: hours?.openNow ?? !1,
      priceRange: priceLevelMap[data.priceLevel] || null,
      servesBreakfast: data.servesBreakfast ?? !1,
      servesLunch: data.servesLunch ?? !1,
      servesDinner: data.servesDinner ?? !1,
      servesBeer: data.servesBeer ?? !1,
      servesWine: data.servesWine ?? !1
    };
  } catch (err) {
    return log.tag("GooglePlaces").error(`Full details error for ${googlePlaceId}: ${err.message}`), null;
  }
}
async function enrichBusinessFullDetails(businessId, googlePlaceId) {
  let details = await fetchPlaceFullDetails(googlePlaceId);
  if (!details) return !1;
  let { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports)), { businesses: businesses2 } = await Promise.resolve().then(() => (init_schema(), schema_exports)), { eq: eq35 } = await import("drizzle-orm"), updates = {};
  return details.description && (updates.description = details.description), details.openingHours && (updates.openingHours = details.openingHours), details.priceRange && (updates.priceRange = details.priceRange), updates.isOpenNow = details.isOpenNow, updates.hoursLastUpdated = /* @__PURE__ */ new Date(), updates.servesBreakfast = details.servesBreakfast, updates.servesLunch = details.servesLunch, updates.servesDinner = details.servesDinner, updates.servesBeer = details.servesBeer, updates.servesWine = details.servesWine, Object.keys(updates).length === 0 ? !1 : (await db2.update(businesses2).set(updates).where(eq35(businesses2.id, businessId)), log.tag("GooglePlaces").info(`Enriched full details for business ${businessId}`), !0);
}
async function fetchAndStorePhotos(businessId, googlePlaceId) {
  let photoRefs = await fetchPlacePhotos(googlePlaceId, 5);
  if (photoRefs.length === 0) return 0;
  let { insertBusinessPhotos: insertBusinessPhotos2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
  return await insertBusinessPhotos2(
    businessId,
    photoRefs.map((ref, i) => ({
      photoUrl: ref,
      isHero: i === 0,
      sortOrder: i
    }))
  ), log.tag("GooglePlaces").info(
    `Stored ${photoRefs.length} photos for business ${businessId} (place: ${googlePlaceId})`
  ), photoRefs.length;
}
var API_BASE, init_google_places = __esm({
  "server/google-places.ts"() {
    "use strict";
    init_config();
    init_logger();
    API_BASE = "https://places.googleapis.com/v1";
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
  let entry = {
    event,
    userId,
    metadata,
    timestamp: Date.now()
  };
  buffer.push(entry), analyticsLog.info(`${event}${userId ? ` [${userId}]` : ""}`), buffer.length > MAX_BUFFER && buffer.splice(0, buffer.length - MAX_BUFFER);
}
function getFunnelStats() {
  let stats2 = {};
  for (let entry of buffer)
    stats2[entry.event] = (stats2[entry.event] || 0) + 1;
  return stats2;
}
function getRecentEvents(limit = 50) {
  return buffer.slice(-limit);
}
function getRateGateStats() {
  let rejectionEvents = [
    "rating_rejected_account_age",
    "rating_rejected_duplicate",
    "rating_rejected_suspended",
    "rating_rejected_validation",
    "rating_rejected_unknown"
  ], submissions = buffer.filter((e) => e.event === "rating_submitted").length, rejections = buffer.filter(
    (e) => rejectionEvents.includes(e.event)
  ), byReason = {};
  for (let r of rejections)
    byReason[r.event] = (byReason[r.event] || 0) + 1;
  let total = submissions + rejections.length;
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
  flushHandler = handler, flushInterval && clearInterval(flushInterval), flushInterval = setInterval(async () => {
    if (buffer.length === 0 || !flushHandler) return;
    let batch = buffer.splice(0, buffer.length);
    try {
      await flushHandler(batch), analyticsLog.info(`Flushed ${batch.length} analytics events`);
    } catch {
      buffer.unshift(...batch), analyticsLog.error(`Flush failed, ${batch.length} events re-queued`);
    }
  }, intervalMs);
}
function stopFlush() {
  flushInterval && (clearInterval(flushInterval), flushInterval = null);
}
function getHourlyStats(hours = 24) {
  let cutoff = Date.now() - hours * 60 * 60 * 1e3, filtered = buffer.filter((e) => e.timestamp >= cutoff), buckets = /* @__PURE__ */ new Map();
  for (let entry of filtered) {
    let d = new Date(entry.timestamp), key2 = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:00`;
    buckets.has(key2) || buckets.set(key2, { events: 0, byType: {} });
    let bucket = buckets.get(key2);
    bucket.events++, bucket.byType[entry.event] = (bucket.byType[entry.event] || 0) + 1;
  }
  return Array.from(buckets.entries()).map(([hour, data]) => ({ hour, ...data })).sort((a, b) => a.hour.localeCompare(b.hour));
}
function getDailyStats(days = 7) {
  let cutoff = Date.now() - days * 24 * 60 * 60 * 1e3, filtered = buffer.filter((e) => e.timestamp >= cutoff), buckets = /* @__PURE__ */ new Map();
  for (let entry of filtered) {
    let d = new Date(entry.timestamp), key2 = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    buckets.has(key2) || buckets.set(key2, { events: 0, users: /* @__PURE__ */ new Set(), byType: {} });
    let bucket = buckets.get(key2);
    bucket.events++, entry.userId && bucket.users.add(entry.userId), bucket.byType[entry.event] = (bucket.byType[entry.event] || 0) + 1;
  }
  return Array.from(buckets.entries()).map(([date2, data]) => ({ date: date2, events: data.events, uniqueUsers: data.users.size, byType: data.byType })).sort((a, b) => a.date.localeCompare(b.date));
}
function recordUserActivity(userId) {
  activeUsers.set(userId, Date.now());
}
function getActiveUserStats() {
  let now = Date.now(), last1h = 0, last24h = 0, last7d = 0, last30d = 0;
  for (let [, lastSeen] of activeUsers) {
    let age = now - lastSeen;
    age < 3600 * 1e3 && last1h++, age < 1440 * 60 * 1e3 && last24h++, age < 10080 * 60 * 1e3 && last7d++, age < 720 * 60 * 60 * 1e3 && last30d++;
  }
  return { last1h, last24h, last7d, last30d };
}
function getBetaConversionFunnel() {
  let invitesSent = buffer.filter((e) => e.event === "beta_invite_sent").length, joinPageViews = buffer.filter((e) => e.event === "beta_join_page_view").length, signups = buffer.filter((e) => e.event === "beta_signup_completed").length, firstRatings = buffer.filter((e) => e.event === "beta_first_rating").length, referralsShared = buffer.filter((e) => e.event === "beta_referral_shared").length, pct = (n, d) => d > 0 ? (n / d * 100).toFixed(1) + "%" : "N/A";
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
var analyticsLog, buffer, MAX_BUFFER, flushHandler, flushInterval, activeUsers, init_analytics2 = __esm({
  "server/analytics.ts"() {
    "use strict";
    init_logger();
    analyticsLog = log.tag("Analytics"), buffer = [], MAX_BUFFER = 1e3;
    flushHandler = null, flushInterval = null;
    activeUsers = /* @__PURE__ */ new Map();
  }
});

// server/email-tracking.ts
import crypto6 from "crypto";
function findEvent(eventId) {
  return events.find((e) => e.id === eventId);
}
function trackEmailSent(to, template, metadata) {
  let id = crypto6.randomUUID(), event = {
    id,
    to,
    template,
    sentAt: /* @__PURE__ */ new Date(),
    status: "sent",
    metadata
  };
  return events.push(event), events.length > MAX_EVENTS && events.splice(0, events.length - MAX_EVENTS), log(`Email sent to=${to} template=${template} id=${id}`), id;
}
function trackEmailOpened(eventId) {
  let event = findEvent(eventId);
  event && (event.status = "opened", event.openedAt = /* @__PURE__ */ new Date(), log(`Email opened id=${eventId}`));
}
function trackEmailClicked(eventId) {
  let event = findEvent(eventId);
  event && (event.status = "clicked", event.clickedAt = /* @__PURE__ */ new Date(), log(`Email clicked id=${eventId}`));
}
function trackEmailFailed(eventId, reason) {
  let event = findEvent(eventId);
  event && (event.status = "failed", event.metadata = { ...event.metadata, failureReason: reason }, log(`Email failed id=${eventId} reason=${reason}`));
}
function trackEmailBounced(eventId) {
  let event = findEvent(eventId);
  event && (event.status = "bounced", log(`Email bounced id=${eventId}`));
}
function getEmailStats() {
  let total = events.length, count17 = (s) => events.filter((e) => e.status === s).length, sent = count17("sent"), delivered = count17("delivered"), opened = count17("opened"), clicked = count17("clicked"), bounced = count17("bounced"), failed = count17("failed"), openRate = total > 0 ? (opened + clicked) / total : 0, clickRate = total > 0 ? clicked / total : 0;
  return { total, sent, delivered, opened, clicked, bounced, failed, openRate, clickRate };
}
var MAX_EVENTS, events, init_email_tracking = __esm({
  "server/email-tracking.ts"() {
    "use strict";
    init_logger();
    MAX_EVENTS = 1e3, events = [];
  }
});

// server/experiment-tracker.ts
function trackExposure(userId, experimentId, variant, context) {
  if (exposures.find(
    (e) => e.userId === userId && e.experimentId === experimentId
  )) {
    trackerLog.info(
      `Skipping duplicate exposure: user=${userId} experiment=${experimentId}`
    );
    return;
  }
  let exposure = {
    userId,
    experimentId,
    variant,
    exposedAt: Date.now(),
    context
  };
  exposures.push(exposure), trackerLog.info(
    `Exposure recorded: user=${userId} experiment=${experimentId} variant=${variant} context=${context}`
  );
}
function getExposureStats(experimentId) {
  let filtered = exposures.filter((e) => e.experimentId === experimentId);
  if (filtered.length === 0)
    return {
      total: 0,
      byVariant: {},
      uniqueUsers: 0,
      firstExposure: null,
      lastExposure: null
    };
  let byVariant = {}, userSet = /* @__PURE__ */ new Set(), firstExposure = 1 / 0, lastExposure = -1 / 0;
  for (let e of filtered)
    byVariant[e.variant] = (byVariant[e.variant] || 0) + 1, userSet.add(e.userId), e.exposedAt < firstExposure && (firstExposure = e.exposedAt), e.exposedAt > lastExposure && (lastExposure = e.exposedAt);
  return {
    total: filtered.length,
    byVariant,
    uniqueUsers: userSet.size,
    firstExposure,
    lastExposure
  };
}
function trackOutcome(userId, experimentId, action, value) {
  let exposure = exposures.find(
    (e) => e.userId === userId && e.experimentId === experimentId
  );
  if (!exposure) {
    trackerLog.info(
      `No exposure found for user=${userId} experiment=${experimentId}, skipping outcome`
    );
    return;
  }
  let outcome = {
    userId,
    experimentId,
    variant: exposure.variant,
    action,
    value,
    recordedAt: Date.now()
  };
  outcomes.push(outcome), trackerLog.info(
    `Outcome recorded: user=${userId} experiment=${experimentId} variant=${exposure.variant} action=${action}`
  );
}
function getOutcomeStats(experimentId) {
  let filteredOutcomes = outcomes.filter((o) => o.experimentId === experimentId), filteredExposures = exposures.filter((e) => e.experimentId === experimentId), byAction = {}, byVariant = {};
  for (let o of filteredOutcomes)
    byAction[o.action] = (byAction[o.action] || 0) + 1, byVariant[o.variant] || (byVariant[o.variant] = { total: 0, byAction: {}, uniqueUsers: /* @__PURE__ */ new Set() }), byVariant[o.variant].total += 1, byVariant[o.variant].byAction[o.action] = (byVariant[o.variant].byAction[o.action] || 0) + 1, byVariant[o.variant].uniqueUsers.add(o.userId);
  let byVariantSerialized = {};
  for (let [variant, data] of Object.entries(byVariant))
    byVariantSerialized[variant] = {
      total: data.total,
      byAction: data.byAction,
      uniqueUsers: data.uniqueUsers.size
    };
  let conversionRates = {}, allActions = Object.keys(byAction);
  for (let variant of Object.keys(byVariant)) {
    let variantExposureCount = filteredExposures.filter((e) => e.variant === variant).length;
    variantExposureCount !== 0 && (conversionRates[variant] = allActions.map((action) => ({
      variant,
      action,
      rate: (byVariant[variant].byAction[action] || 0) / variantExposureCount * 100
    })));
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
  let p = successes / total, denominator = 1 + z2 * z2 / total, center = (p + z2 * z2 / (2 * total)) / denominator, margin = z2 * Math.sqrt(p * (1 - p) / total + z2 * z2 / (4 * total * total)) / denominator;
  return {
    lower: Math.max(0, center - margin),
    upper: Math.min(1, center + margin),
    center
  };
}
function computeExperimentDashboard(experimentId) {
  let expStats = getExposureStats(experimentId), filteredExposures = exposures.filter((e) => e.experimentId === experimentId), filteredOutcomes = outcomes.filter((o) => o.experimentId === experimentId), variantMap = /* @__PURE__ */ new Map();
  for (let e of filteredExposures)
    variantMap.has(e.variant) || variantMap.set(e.variant, { exposures: 0, outcomes: 0, byAction: {} }), variantMap.get(e.variant).exposures += 1;
  for (let o of filteredOutcomes) {
    variantMap.has(o.variant) || variantMap.set(o.variant, { exposures: 0, outcomes: 0, byAction: {} });
    let v = variantMap.get(o.variant);
    v.outcomes += 1, v.byAction[o.action] = (v.byAction[o.action] || 0) + 1;
  }
  let variants = [];
  for (let [variant, data] of variantMap.entries()) {
    let ci = wilsonScore(data.outcomes, data.exposures);
    variants.push({
      variant,
      exposures: data.exposures,
      outcomes: data.outcomes,
      conversionRate: data.exposures > 0 ? data.outcomes / data.exposures * 100 : 0,
      confidence: ci,
      byAction: data.byAction
    });
  }
  let totalExposures = expStats.total, confidence = "sufficient_data", recommendation = "inconclusive";
  if (totalExposures < 100)
    confidence = "insufficient_data", recommendation = "insufficient_data";
  else {
    let controlVariant = variants.find((v) => v.variant === "control"), treatmentVariant = variants.find((v) => v.variant === "treatment"), controlCI = controlVariant?.confidence ?? { lower: 0, upper: 0, center: 0 }, treatmentCI = treatmentVariant?.confidence ?? { lower: 0, upper: 0, center: 0 }, controlExposures = controlVariant?.exposures ?? 0, treatmentExposures = treatmentVariant?.exposures ?? 0;
    if (controlExposures < 100 || treatmentExposures < 100)
      if (treatmentCI.lower > controlCI.upper)
        recommendation = "treatment_winning";
      else if (controlCI.lower > treatmentCI.upper)
        recommendation = "control_winning";
      else {
        let centerDiff = (treatmentCI.center - controlCI.center) * 100;
        Math.abs(centerDiff) > 5 ? recommendation = "promising" : recommendation = "inconclusive";
      }
    else if (treatmentCI.lower > controlCI.upper)
      recommendation = "treatment_winning";
    else if (controlCI.lower > treatmentCI.upper)
      recommendation = "control_winning";
    else {
      let centerDiff = (treatmentCI.center - controlCI.center) * 100;
      Math.abs(centerDiff) > 5 ? recommendation = "promising" : recommendation = "inconclusive";
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
var trackerLog, exposures, outcomes, init_experiment_tracker = __esm({
  "server/experiment-tracker.ts"() {
    "use strict";
    init_logger();
    trackerLog = log.tag("ExperimentTracker"), exposures = [], outcomes = [];
  }
});

// server/push-ab-testing.ts
function djb2Hash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++)
    hash = (hash << 5) + hash ^ str.charCodeAt(i);
  return Math.abs(hash);
}
function assignVariant(memberId, experiment) {
  let bucket = djb2Hash(`${memberId}:${experiment.id}`) % experiment.variants.length;
  return experiment.variants[bucket];
}
function createPushExperiment(id, description, category, variants) {
  if (experiments2.has(id))
    return pushAbLog.info(`Experiment already exists: ${id}`), null;
  if (variants.length < 2)
    return pushAbLog.info(`Experiment needs at least 2 variants: ${id}`), null;
  let experiment = {
    id,
    description,
    category,
    variants,
    active: !0,
    createdAt: Date.now()
  };
  return experiments2.set(id, experiment), pushAbLog.info(`Created push experiment: ${id} with ${variants.length} variants for ${category}`), experiment;
}
function getNotificationVariant(memberId, category) {
  for (let experiment of experiments2.values())
    if (experiment.active && experiment.category === category) {
      let variant = assignVariant(memberId, experiment);
      return trackExposure(memberId, experiment.id, variant.name, `push:${category}`), pushAbLog.info(
        `Assigned variant: member=${memberId.slice(0, 8)} experiment=${experiment.id} variant=${variant.name}`
      ), { experimentId: experiment.id, variant };
    }
  return null;
}
function recordPushExperimentOpen(memberId, category) {
  for (let experiment of experiments2.values())
    experiment.category === category && (trackOutcome(memberId, experiment.id, "notification_opened"), pushAbLog.info(`Outcome recorded: member=${memberId.slice(0, 8)} experiment=${experiment.id}`));
}
function deactivatePushExperiment(id) {
  let experiment = experiments2.get(id);
  return experiment ? (experiment.active = !1, pushAbLog.info(`Deactivated push experiment: ${id}`), !0) : !1;
}
function listPushExperiments() {
  return Array.from(experiments2.values());
}
function getPushExperiment(id) {
  return experiments2.get(id);
}
var pushAbLog, experiments2, init_push_ab_testing = __esm({
  "server/push-ab-testing.ts"() {
    "use strict";
    init_experiment_tracker();
    init_logger();
    pushAbLog = log.tag("PushAB"), experiments2 = /* @__PURE__ */ new Map();
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
  let cities = Object.values(CITY_REGISTRY);
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
var CITY_REGISTRY, init_city_config = __esm({
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

// server/moderation-queue.ts
var moderation_queue_exports = {};
__export(moderation_queue_exports, {
  MAX_QUEUE: () => MAX_QUEUE,
  addToQueue: () => addToQueue,
  approveItem: () => approveItem,
  bulkApprove: () => bulkApprove,
  bulkReject: () => bulkReject,
  clearQueue: () => clearQueue,
  getFilteredItems: () => getFilteredItems,
  getItemsByBusiness: () => getItemsByBusiness,
  getItemsByMember: () => getItemsByMember,
  getPendingItems: () => getPendingItems,
  getQueueStats: () => getQueueStats,
  getResolvedItems: () => getResolvedItems,
  rejectItem: () => rejectItem
});
import crypto7 from "crypto";
function addToQueue(item) {
  let modItem = {
    ...item,
    id: crypto7.randomUUID(),
    status: "pending",
    moderatorId: null,
    moderatorNote: null,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    resolvedAt: null
  };
  return queue.unshift(modItem), queue.length > MAX_QUEUE && queue.pop(), modLog.info(`Added to moderation queue: ${item.contentType} from ${item.memberId}`), modItem;
}
function getPendingItems(limit) {
  return queue.filter((i) => i.status === "pending").slice(0, limit || 50);
}
function getFilteredItems(opts) {
  let items = [...queue];
  return opts.status && (items = items.filter((i) => i.status === opts.status)), opts.contentType && (items = items.filter((i) => i.contentType === opts.contentType)), opts.sortByViolations && items.sort((a, b) => b.violations.length - a.violations.length), items.slice(0, opts.limit || 50);
}
function bulkApprove(itemIds, moderatorId, note) {
  let approved = 0, notFound = 0;
  for (let id of itemIds)
    approveItem(id, moderatorId, note) ? approved++ : notFound++;
  return { approved, notFound };
}
function bulkReject(itemIds, moderatorId, note) {
  let rejected = 0, notFound = 0;
  for (let id of itemIds)
    rejectItem(id, moderatorId, note) ? rejected++ : notFound++;
  return { rejected, notFound };
}
function getResolvedItems(limit) {
  return queue.filter((i) => i.status === "approved" || i.status === "rejected").slice(0, limit || 50);
}
function approveItem(itemId, moderatorId, note) {
  let item = queue.find((i) => i.id === itemId);
  return !item || item.status !== "pending" ? !1 : (item.status = "approved", item.moderatorId = moderatorId, item.moderatorNote = note || null, item.resolvedAt = (/* @__PURE__ */ new Date()).toISOString(), modLog.info(`Approved: ${itemId} by ${moderatorId}`), !0);
}
function rejectItem(itemId, moderatorId, note) {
  let item = queue.find((i) => i.id === itemId);
  return !item || item.status !== "pending" ? !1 : (item.status = "rejected", item.moderatorId = moderatorId, item.moderatorNote = note || null, item.resolvedAt = (/* @__PURE__ */ new Date()).toISOString(), modLog.info(`Rejected: ${itemId} by ${moderatorId}`), !0);
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
function clearQueue() {
  queue.length = 0;
}
var modLog, queue, MAX_QUEUE, init_moderation_queue = __esm({
  "server/moderation-queue.ts"() {
    "use strict";
    init_logger();
    modLog = log.tag("ModerationQueue"), queue = [], MAX_QUEUE = 2e3;
  }
});

// server/notification-templates.ts
function detectVariables(title, body) {
  let combined = `${title} ${body}`;
  return SUPPORTED_VARIABLES.filter((v) => combined.includes(`{${v}}`));
}
function createTemplate2(input) {
  if (templates2.has(input.id))
    return tmplLog2.info(`Template already exists: ${input.id}`), null;
  let template = {
    ...input,
    variables: detectVariables(input.title, input.body),
    active: !0,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  return templates2.set(input.id, template), tmplLog2.info(`Created template: ${input.id} for ${input.category}`), template;
}
function updateTemplate(id, updates) {
  let existing = templates2.get(id);
  if (!existing) return null;
  let updated = {
    ...existing,
    ...updates,
    variables: detectVariables(
      updates.title ?? existing.title,
      updates.body ?? existing.body
    ),
    updatedAt: Date.now()
  };
  return templates2.set(id, updated), tmplLog2.info(`Updated template: ${id}`), updated;
}
function deleteTemplate(id) {
  let existed = templates2.delete(id);
  return existed && tmplLog2.info(`Deleted template: ${id}`), existed;
}
function getTemplate2(id) {
  return templates2.get(id);
}
function listTemplates() {
  return Array.from(templates2.values());
}
function listTemplatesByCategory(category) {
  return Array.from(templates2.values()).filter((t) => t.category === category);
}
function getActiveTemplateForCategory(category) {
  return Array.from(templates2.values()).find((t) => t.category === category && t.active);
}
function applyTemplate(template, values) {
  let title = template.title, body = template.body;
  for (let [key2, val] of Object.entries(values)) {
    let placeholder = `{${key2}}`;
    title = title.replaceAll(placeholder, val), body = body.replaceAll(placeholder, val);
  }
  return { title, body };
}
function getSupportedVariables() {
  return [...SUPPORTED_VARIABLES];
}
var tmplLog2, templates2, SUPPORTED_VARIABLES, init_notification_templates = __esm({
  "server/notification-templates.ts"() {
    "use strict";
    init_logger();
    tmplLog2 = log.tag("NotifTemplate"), templates2 = /* @__PURE__ */ new Map(), SUPPORTED_VARIABLES = [
      "firstName",
      "city",
      "business",
      "emoji",
      "direction",
      "newRank",
      "oldRank",
      "delta",
      "rater",
      "score",
      "count"
    ];
  }
});

// server/push-analytics.ts
function recordPushDelivery(category, city, tokenCount, successCount, errorCount2) {
  let record = {
    category,
    city,
    tokenCount,
    successCount,
    errorCount: errorCount2,
    timestamp: Date.now()
  };
  deliveryRecords.push(record), deliveryRecords.length > MAX_RECORDS && deliveryRecords.splice(0, deliveryRecords.length - MAX_RECORDS), analyticsLog2.info(
    `Push delivery: ${category}/${city} \u2014 ${successCount}/${tokenCount} success, ${errorCount2} errors`
  );
}
function computePushAnalytics(daysBack = 7) {
  let cutoff = Date.now() - daysBack * 864e5, filtered = deliveryRecords.filter((r) => r.timestamp >= cutoff), totalSent = 0, totalSuccess = 0, totalError = 0, byCategory = {}, byCity = {}, hourBuckets = {};
  for (let r of filtered) {
    totalSent += r.tokenCount, totalSuccess += r.successCount, totalError += r.errorCount, byCategory[r.category] || (byCategory[r.category] = { sent: 0, success: 0, error: 0 }), byCategory[r.category].sent += r.tokenCount, byCategory[r.category].success += r.successCount, byCategory[r.category].error += r.errorCount, byCity[r.city] || (byCity[r.city] = { sent: 0, success: 0, error: 0 }), byCity[r.city].sent += r.tokenCount, byCity[r.city].success += r.successCount, byCity[r.city].error += r.errorCount;
    let hourKey = new Date(r.timestamp).toISOString().slice(0, 13);
    hourBuckets[hourKey] = (hourBuckets[hourKey] || 0) + r.tokenCount;
  }
  let hourlyVolume = Object.entries(hourBuckets).sort(([a], [b]) => a.localeCompare(b)).map(([hour, count17]) => ({ hour, count: count17 })), recentDeliveries = filtered.slice(-20).reverse(), successRate = totalSent > 0 ? Math.round(totalSuccess / totalSent * 1e3) / 10 : 0;
  return {
    totalSent,
    totalSuccess,
    totalError,
    successRate,
    byCategory,
    byCity,
    hourlyVolume,
    recentDeliveries
  };
}
function getPushRecordCount() {
  return deliveryRecords.length;
}
function recordNotificationOpen(notificationId, category, memberId) {
  let dedupKey = `${notificationId}:${memberId}`;
  if (openDedupSet.has(dedupKey))
    return analyticsLog2.info(`Duplicate open skipped: ${category} by member ${memberId.slice(0, 8)}`), !1;
  if (openDedupSet.add(dedupKey), openDedupSet.size > MAX_DEDUP_SIZE) {
    let entries = Array.from(openDedupSet);
    for (let i = 0; i < entries.length - MAX_DEDUP_SIZE; i++)
      openDedupSet.delete(entries[i]);
  }
  let record = {
    notificationId,
    category,
    memberId,
    openedAt: Date.now()
  };
  return openRecords.push(record), openRecords.length > MAX_OPEN_RECORDS && openRecords.splice(0, openRecords.length - MAX_OPEN_RECORDS), analyticsLog2.info(`Notification opened: ${category} by member ${memberId.slice(0, 8)}`), !0;
}
function computeOpenAnalytics(daysBack = 7) {
  let cutoff = Date.now() - daysBack * 864e5, filtered = openRecords.filter((r) => r.openedAt >= cutoff), byCategory = {}, memberSet = /* @__PURE__ */ new Set();
  for (let r of filtered)
    byCategory[r.category] = (byCategory[r.category] || 0) + 1, memberSet.add(r.memberId);
  return {
    totalOpens: filtered.length,
    byCategory,
    uniqueMembers: memberSet.size,
    recentOpens: filtered.slice(-20).reverse()
  };
}
function getNotificationInsights(daysBack = 7) {
  let delivery = computePushAnalytics(daysBack), opens = computeOpenAnalytics(daysBack), openRate = delivery.totalSent > 0 ? Math.round(opens.totalOpens / delivery.totalSent * 1e3) / 10 : 0;
  return { delivery, opens, openRate };
}
var analyticsLog2, deliveryRecords, MAX_RECORDS, openRecords, MAX_OPEN_RECORDS, openDedupSet, MAX_DEDUP_SIZE, init_push_analytics = __esm({
  "server/push-analytics.ts"() {
    "use strict";
    init_logger();
    analyticsLog2 = log.tag("PushAnalytics"), deliveryRecords = [], MAX_RECORDS = 1e4;
    openRecords = [], MAX_OPEN_RECORDS = 1e4, openDedupSet = /* @__PURE__ */ new Set(), MAX_DEDUP_SIZE = 5e4;
  }
});

// server/photo-moderation.ts
var photo_moderation_exports = {};
__export(photo_moderation_exports, {
  approvePhoto: () => approvePhoto,
  getAllowedMimeTypes: () => getAllowedMimeTypes,
  getCommunityPhotoCount: () => getCommunityPhotoCount,
  getMaxFileSize: () => getMaxFileSize,
  getPendingPhotos: () => getPendingPhotos,
  getPhotoStats: () => getPhotoStats,
  getPhotosByBusiness: () => getPhotosByBusiness,
  rejectPhoto: () => rejectPhoto,
  submitPhoto: () => submitPhoto
});
import { eq as eq22, desc as desc16, sql as sql14, and as and14, count as count15 } from "drizzle-orm";
import crypto9 from "crypto";
async function submitPhoto(businessId, memberId, url, caption, fileSize, mimeType) {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) return { error: `Invalid mime type: ${mimeType}` };
  if (fileSize > MAX_FILE_SIZE) return { error: "File too large (max 10MB)" };
  if (caption.length > MAX_CAPTION_LENGTH) return { error: "Caption too long (max 500 chars)" };
  let id = crypto9.randomUUID(), [row] = await db.insert(photoSubmissions).values({
    id,
    businessId,
    memberId,
    url,
    caption,
    fileSize,
    mimeType
  }).returning();
  return photoModLog.info(`Photo submitted: ${row.id} for business ${businessId}`), row;
}
async function approvePhoto(photoId, moderatorId, note) {
  if ((await db.update(photoSubmissions).set({
    status: "approved",
    moderatorId,
    moderatorNote: note || null,
    reviewedAt: /* @__PURE__ */ new Date()
  }).where(and14(eq22(photoSubmissions.id, photoId), eq22(photoSubmissions.status, "pending"))).returning({ id: photoSubmissions.id })).length === 0) return !1;
  let [submission] = await db.select({ businessId: photoSubmissions.businessId, url: photoSubmissions.url, memberId: photoSubmissions.memberId }).from(photoSubmissions).where(eq22(photoSubmissions.id, photoId));
  if (submission) {
    let [maxOrder] = await db.select({ max: sql14`COALESCE(MAX(${businessPhotos.sortOrder}), 0)` }).from(businessPhotos).where(eq22(businessPhotos.businessId, submission.businessId));
    await db.insert(businessPhotos).values({
      businessId: submission.businessId,
      photoUrl: submission.url,
      isHero: !1,
      sortOrder: (maxOrder?.max ?? 0) + 1,
      uploadedBy: submission.memberId
    }), photoModLog.info(`Photo ${photoId} added to gallery for business ${submission.businessId}`);
  }
  return photoModLog.info(`Photo approved: ${photoId} by ${moderatorId}`), !0;
}
async function rejectPhoto(photoId, moderatorId, reason, note) {
  return (await db.update(photoSubmissions).set({
    status: "rejected",
    rejectionReason: reason,
    moderatorId,
    moderatorNote: note || null,
    reviewedAt: /* @__PURE__ */ new Date()
  }).where(and14(eq22(photoSubmissions.id, photoId), eq22(photoSubmissions.status, "pending"))).returning({ id: photoSubmissions.id })).length === 0 ? !1 : (photoModLog.info(`Photo rejected: ${photoId} by ${moderatorId} (reason: ${reason})`), !0);
}
async function getPendingPhotos(limit) {
  return await db.select().from(photoSubmissions).where(eq22(photoSubmissions.status, "pending")).orderBy(desc16(photoSubmissions.submittedAt)).limit(limit || 50);
}
async function getPhotosByBusiness(businessId) {
  return await db.select().from(photoSubmissions).where(and14(eq22(photoSubmissions.businessId, businessId), eq22(photoSubmissions.status, "approved"))).orderBy(desc16(photoSubmissions.submittedAt));
}
async function getPhotoStats() {
  let allRows = await db.select().from(photoSubmissions), byReason = {};
  for (let s of allRows)
    s.rejectionReason && (byReason[s.rejectionReason] = (byReason[s.rejectionReason] || 0) + 1);
  return {
    total: allRows.length,
    pending: allRows.filter((s) => s.status === "pending").length,
    approved: allRows.filter((s) => s.status === "approved").length,
    rejected: allRows.filter((s) => s.status === "rejected").length,
    byReason
  };
}
async function getCommunityPhotoCount(businessId) {
  let [result] = await db.select({ count: count15() }).from(businessPhotos).where(and14(
    eq22(businessPhotos.businessId, businessId),
    sql14`${businessPhotos.uploadedBy} IS NOT NULL`
  ));
  return result?.count ?? 0;
}
function getAllowedMimeTypes() {
  return [...ALLOWED_MIME_TYPES];
}
function getMaxFileSize() {
  return MAX_FILE_SIZE;
}
var photoModLog, ALLOWED_MIME_TYPES, MAX_FILE_SIZE, MAX_CAPTION_LENGTH, init_photo_moderation = __esm({
  "server/photo-moderation.ts"() {
    "use strict";
    init_logger();
    init_db();
    init_schema();
    photoModLog = log.tag("PhotoModeration"), ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"], MAX_FILE_SIZE = 10 * 1024 * 1024, MAX_CAPTION_LENGTH = 500;
  }
});

// server/photo-hash.ts
var photo_hash_exports = {};
__export(photo_hash_exports, {
  checkDuplicate: () => checkDuplicate,
  clearHashIndex: () => clearHashIndex,
  computePhotoHash: () => computePhotoHash,
  detectDuplicate: () => detectDuplicate,
  getHashIndexSize: () => getHashIndexSize,
  preloadHashIndex: () => preloadHashIndex,
  registerPhotoHash: () => registerPhotoHash
});
import crypto10 from "crypto";
import { isNotNull as isNotNull2, eq as eq23 } from "drizzle-orm";
function computePhotoHash(buffer2) {
  return crypto10.createHash("sha256").update(buffer2).digest("hex");
}
function checkDuplicate(hash) {
  return hashIndex.get(hash) ?? null;
}
function registerPhotoHash(hash, ratingId, memberId, businessId, photoId) {
  hashIndex.set(hash, {
    ratingId,
    memberId,
    businessId,
    photoId,
    uploadedAt: Date.now()
  });
}
function getHashIndexSize() {
  return hashIndex.size;
}
function clearHashIndex() {
  hashIndex.clear();
}
async function preloadHashIndex() {
  let rows = await db.select({
    id: ratingPhotos.id,
    ratingId: ratingPhotos.ratingId,
    contentHash: ratingPhotos.contentHash,
    memberId: ratings.memberId,
    businessId: ratings.businessId
  }).from(ratingPhotos).innerJoin(ratings, eq23(ratingPhotos.ratingId, ratings.id)).where(isNotNull2(ratingPhotos.contentHash)), loaded = 0;
  for (let row of rows)
    row.contentHash && !hashIndex.has(row.contentHash) && (hashIndex.set(row.contentHash, {
      ratingId: row.ratingId,
      memberId: row.memberId,
      businessId: row.businessId,
      photoId: row.id,
      uploadedAt: 0
    }), loaded++);
  return hashLog.info(`Preloaded ${loaded} photo hashes from DB`), loaded;
}
function detectDuplicate(buffer2, memberId) {
  let hash = computePhotoHash(buffer2), existing = checkDuplicate(hash);
  if (!existing)
    return { hash, isDuplicate: !1, isCrossMember: !1, original: null };
  let isCrossMember = existing.memberId !== memberId;
  return isCrossMember ? hashLog.warn("Cross-member duplicate photo detected", {
    hash: hash.slice(0, 16),
    originalMember: existing.memberId,
    newMember: memberId,
    originalRating: existing.ratingId
  }) : hashLog.info("Same-member duplicate photo", {
    hash: hash.slice(0, 16),
    memberId,
    originalRating: existing.ratingId
  }), { hash, isDuplicate: !0, isCrossMember, original: existing };
}
var hashLog, hashIndex, init_photo_hash = __esm({
  "server/photo-hash.ts"() {
    "use strict";
    init_logger();
    init_db();
    init_schema();
    hashLog = log.tag("PhotoHash"), hashIndex = /* @__PURE__ */ new Map();
  }
});

// server/phash.ts
var phash_exports = {};
__export(phash_exports, {
  clearPHashIndex: () => clearPHashIndex,
  computePerceptualHash: () => computePerceptualHash,
  findNearDuplicates: () => findNearDuplicates,
  getNearDuplicateThreshold: () => getNearDuplicateThreshold,
  getPHashIndexSize: () => getPHashIndexSize,
  hammingDistance: () => hammingDistance,
  preloadPHashIndex: () => preloadPHashIndex,
  registerPHash: () => registerPHash
});
import { isNotNull as isNotNull3, eq as eq24 } from "drizzle-orm";
function computePerceptualHash(buffer2) {
  let step = Math.max(1, Math.floor(buffer2.length / HASH_BITS)), samples = [];
  for (let i = 0; i < HASH_BITS; i++) {
    let idx = Math.min(i * step, buffer2.length - 1);
    samples.push(buffer2[idx]);
  }
  let mean = samples.reduce((a, b) => a + b, 0) / samples.length, hash = "";
  for (let i = 0; i < HASH_BITS; i += 4) {
    let nibble = 0;
    for (let j = 0; j < 4 && i + j < HASH_BITS; j++)
      samples[i + j] >= mean && (nibble |= 1 << 3 - j);
    hash += nibble.toString(16);
  }
  return hash;
}
function hammingDistance(a, b) {
  if (a.length !== b.length) return HASH_BITS;
  let distance = 0;
  for (let i = 0; i < a.length; i++) {
    let bits = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    for (; bits; )
      bits &= bits - 1, distance++;
  }
  return distance;
}
function registerPHash(pHash, ratingId, memberId, businessId, photoId) {
  phashIndex.push({ pHash, ratingId, memberId, businessId, photoId });
}
function findNearDuplicates(pHash, memberId, threshold = NEAR_DUPLICATE_THRESHOLD) {
  let bestMatch = null, bestDistance = threshold + 1;
  for (let entry of phashIndex) {
    let dist = hammingDistance(pHash, entry.pHash);
    dist <= threshold && dist < bestDistance && (bestMatch = entry, bestDistance = dist);
  }
  if (!bestMatch) return null;
  let isCrossMember = bestMatch.memberId !== memberId;
  return isCrossMember && phashLog.warn("Near-duplicate photo detected (cross-member)", {
    distance: bestDistance,
    threshold,
    originalMember: bestMatch.memberId,
    newMember: memberId
  }), { match: bestMatch, distance: bestDistance, isCrossMember };
}
function getPHashIndexSize() {
  return phashIndex.length;
}
function clearPHashIndex() {
  phashIndex.length = 0;
}
function getNearDuplicateThreshold() {
  return NEAR_DUPLICATE_THRESHOLD;
}
async function preloadPHashIndex() {
  let rows = await db.select({
    id: ratingPhotos.id,
    ratingId: ratingPhotos.ratingId,
    perceptualHash: ratingPhotos.perceptualHash,
    memberId: ratings.memberId,
    businessId: ratings.businessId
  }).from(ratingPhotos).innerJoin(ratings, eq24(ratingPhotos.ratingId, ratings.id)).where(isNotNull3(ratingPhotos.perceptualHash)), loaded = 0;
  for (let row of rows)
    row.perceptualHash && (phashIndex.push({
      pHash: row.perceptualHash,
      ratingId: row.ratingId,
      memberId: row.memberId,
      businessId: row.businessId,
      photoId: row.id
    }), loaded++);
  return phashLog.info(`Preloaded ${loaded} perceptual hashes from DB`), loaded;
}
var phashLog, HASH_BITS, NEAR_DUPLICATE_THRESHOLD, phashIndex, init_phash = __esm({
  "server/phash.ts"() {
    "use strict";
    init_logger();
    init_db();
    init_schema();
    phashLog = log.tag("PHash"), HASH_BITS = 64, NEAR_DUPLICATE_THRESHOLD = 10;
    phashIndex = [];
  }
});

// server/receipt-analysis.ts
var receipt_analysis_exports = {};
__export(receipt_analysis_exports, {
  getPendingReceipts: () => getPendingReceipts,
  getReceiptAnalysisStats: () => getReceiptAnalysisStats,
  processReceiptOCR: () => processReceiptOCR,
  queueReceiptForAnalysis: () => queueReceiptForAnalysis,
  rejectReceipt: () => rejectReceipt,
  verifyReceipt: () => verifyReceipt
});
import { eq as eq25, desc as desc17, sql as sql15, count as count16 } from "drizzle-orm";
async function queueReceiptForAnalysis(ratingPhotoId, ratingId, businessId) {
  let [row] = await db.insert(receiptAnalysis).values({
    ratingPhotoId,
    ratingId,
    businessId,
    status: "pending"
  }).returning({ id: receiptAnalysis.id });
  return receiptLog.info(`Receipt queued for analysis: ${row.id} (rating: ${ratingId})`), row.id;
}
async function getPendingReceipts(limit = 50) {
  return await db.select({
    id: receiptAnalysis.id,
    ratingPhotoId: receiptAnalysis.ratingPhotoId,
    ratingId: receiptAnalysis.ratingId,
    businessId: receiptAnalysis.businessId,
    businessName: businesses.name,
    photoUrl: ratingPhotos.photoUrl,
    status: receiptAnalysis.status,
    createdAt: receiptAnalysis.createdAt
  }).from(receiptAnalysis).innerJoin(ratingPhotos, eq25(receiptAnalysis.ratingPhotoId, ratingPhotos.id)).innerJoin(businesses, eq25(receiptAnalysis.businessId, businesses.id)).where(eq25(receiptAnalysis.status, "pending")).orderBy(desc17(receiptAnalysis.createdAt)).limit(limit);
}
async function verifyReceipt(analysisId, reviewerId, result, note) {
  let [updated] = await db.update(receiptAnalysis).set({
    status: "verified",
    extractedBusinessName: result.businessName || null,
    extractedAmount: result.amount?.toFixed(2) || null,
    extractedDate: result.date || null,
    extractedItems: result.items || null,
    confidence: result.confidence.toFixed(3),
    matchScore: result.matchScore.toFixed(3),
    reviewedBy: reviewerId,
    reviewedAt: /* @__PURE__ */ new Date(),
    reviewNote: note || null
  }).where(eq25(receiptAnalysis.id, analysisId)).returning({ id: receiptAnalysis.id });
  return updated ? (receiptLog.info(`Receipt verified: ${analysisId} by ${reviewerId}`), !0) : !1;
}
async function rejectReceipt(analysisId, reviewerId, note) {
  let [updated] = await db.update(receiptAnalysis).set({
    status: "rejected",
    confidence: "0.000",
    matchScore: "0.000",
    reviewedBy: reviewerId,
    reviewedAt: /* @__PURE__ */ new Date(),
    reviewNote: note
  }).where(eq25(receiptAnalysis.id, analysisId)).returning({ id: receiptAnalysis.id });
  return updated ? (receiptLog.info(`Receipt rejected: ${analysisId} by ${reviewerId}`), !0) : !1;
}
async function getReceiptAnalysisStats() {
  let [stats2] = await db.select({
    total: count16(),
    pending: sql15`COUNT(*) FILTER (WHERE ${receiptAnalysis.status} = 'pending')`,
    verified: sql15`COUNT(*) FILTER (WHERE ${receiptAnalysis.status} = 'verified')`,
    rejected: sql15`COUNT(*) FILTER (WHERE ${receiptAnalysis.status} = 'rejected')`,
    avgConfidence: sql15`COALESCE(AVG(${receiptAnalysis.confidence}::numeric) FILTER (WHERE ${receiptAnalysis.status} = 'verified'), 0)`
  }).from(receiptAnalysis);
  return {
    total: stats2.total,
    pending: stats2.pending,
    verified: stats2.verified,
    rejected: stats2.rejected,
    avgConfidence: Number(stats2.avgConfidence)
  };
}
async function processReceiptOCR(_analysisId, _imageUrl, _provider) {
  return receiptLog.info("OCR processing not yet implemented \u2014 receipt requires manual review"), null;
}
var receiptLog, init_receipt_analysis = __esm({
  "server/receipt-analysis.ts"() {
    "use strict";
    init_db();
    init_schema();
    init_logger();
    receiptLog = log.tag("ReceiptAnalysis");
  }
});

// server/hours-utils.ts
var hours_utils_exports = {};
__export(hours_utils_exports, {
  computeOpenStatus: () => computeOpenStatus,
  isOpenLate: () => isOpenLate,
  isOpenWeekends: () => isOpenWeekends,
  periodsToWeekdayText: () => periodsToWeekdayText,
  weekdayTextToPeriods: () => weekdayTextToPeriods
});
function computeOpenStatus(hours, now) {
  let fallback = { isOpen: !1, closingTime: null, nextOpenTime: null, todayHours: null };
  if (!hours || !hours.periods || hours.periods.length === 0) return fallback;
  let d = now || /* @__PURE__ */ new Date(), ct = new Date(d.toLocaleString("en-US", { timeZone: "America/Chicago" })), dayOfWeek = ct.getDay(), currentTime = ct.getHours() * 100 + ct.getMinutes();
  if (hours.periods.length === 1 && !hours.periods[0].close)
    return { isOpen: !0, closingTime: null, nextOpenTime: null, todayHours: "Open 24 hours" };
  let todayHours = hours.weekday_text && hours.weekday_text[dayOfWeek === 0 ? 6 : dayOfWeek - 1] || null;
  for (let period of hours.periods) {
    if (!period.close) continue;
    let openDay = period.open.day, closeDay = period.close.day, openTime = parseInt(period.open.time, 10), closeTime = parseInt(period.close.time, 10);
    if (openDay === dayOfWeek && closeDay === dayOfWeek && currentTime >= openTime && currentTime < closeTime)
      return {
        isOpen: !0,
        closingTime: formatTime(period.close.time),
        nextOpenTime: null,
        todayHours
      };
    if (openDay === dayOfWeek && closeDay !== dayOfWeek && currentTime >= openTime)
      return {
        isOpen: !0,
        closingTime: formatTime(period.close.time),
        nextOpenTime: null,
        todayHours
      };
    let prevDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    if (openDay === prevDay && closeDay === dayOfWeek && currentTime < closeTime)
      return {
        isOpen: !0,
        closingTime: formatTime(period.close.time),
        nextOpenTime: null,
        todayHours
      };
  }
  let nextOpen = null;
  for (let period of hours.periods)
    if (period.open.day === dayOfWeek && parseInt(period.open.time, 10) > currentTime) {
      nextOpen = formatTime(period.open.time);
      break;
    }
  if (!nextOpen)
    for (let offset = 1; offset <= 7; offset++) {
      let checkDay = (dayOfWeek + offset) % 7, nextPeriod = hours.periods.find((p) => p.open.day === checkDay);
      if (nextPeriod) {
        nextOpen = `${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][checkDay]} ${formatTime(nextPeriod.open.time)}`;
        break;
      }
    }
  return { isOpen: !1, closingTime: null, nextOpenTime: nextOpen, todayHours };
}
function formatTime(time) {
  let h = parseInt(time.slice(0, 2), 10), m = time.slice(2);
  return `${h.toString().padStart(2, "0")}:${m}`;
}
function weekdayTextToPeriods(weekdayText) {
  let dayMap = [1, 2, 3, 4, 5, 6, 0], periods = [];
  for (let i = 0; i < weekdayText.length && i < 7; i++) {
    let line = weekdayText[i], dayNum = dayMap[i], cleaned = line.replace(/^[A-Za-z]+:\s*/, "").trim();
    if (/closed/i.test(cleaned)) continue;
    if (/24\s*hours/i.test(cleaned)) {
      periods.push({ open: { day: dayNum, time: "0000" } });
      continue;
    }
    let match = cleaned.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*[–\-]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) continue;
    let openH = to24(parseInt(match[1]), match[3].toUpperCase()), openM = match[2], closeH = to24(parseInt(match[4]), match[6].toUpperCase()), closeM = match[5];
    periods.push({
      open: { day: dayNum, time: `${pad2(openH)}${openM}` },
      close: { day: closeH < openH ? (dayNum + 1) % 7 : dayNum, time: `${pad2(closeH)}${closeM}` }
    });
  }
  return periods;
}
function to24(h, ampm) {
  return ampm === "AM" && h === 12 ? 0 : ampm === "PM" && h !== 12 ? h + 12 : h;
}
function pad2(n) {
  return n.toString().padStart(2, "0");
}
function periodsToWeekdayText(periods) {
  let dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], dayMap = [6, 0, 1, 2, 3, 4, 5], result = dayNames.map((d) => `${d}: Closed`);
  for (let p of periods) {
    let idx = dayMap[p.open.day];
    if (!p.close) {
      result[idx] = `${dayNames[idx]}: Open 24 hours`;
      continue;
    }
    let openStr = formatTime12(p.open.time), closeStr = formatTime12(p.close.time);
    result[idx] = `${dayNames[idx]}: ${openStr} \u2013 ${closeStr}`;
  }
  return result;
}
function formatTime12(time) {
  let h = parseInt(time.slice(0, 2), 10), m = time.slice(2), ampm = h >= 12 ? "PM" : "AM";
  return `${h === 0 ? 12 : h > 12 ? h - 12 : h}:${m} ${ampm}`;
}
function isOpenLate(hours) {
  return !hours || !hours.periods ? !1 : hours.periods.some((p) => {
    if (!p.close) return !0;
    let closeTime = parseInt(p.close.time, 10);
    return closeTime >= 2200 || closeTime <= 200;
  });
}
function isOpenWeekends(hours) {
  return !hours || !hours.periods ? !1 : hours.periods.some((p) => p.open.day === 0 || p.open.day === 6);
}
var init_hours_utils = __esm({
  "server/hours-utils.ts"() {
    "use strict";
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
  for (let biz of ALL_CITY_BUSINESSES)
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
        isActive: !0,
        dataSource: "admin"
      }), seeded++;
    } catch (err) {
      err.message?.includes("unique") || err.message?.includes("duplicate") ? console.log(`  Skipping ${biz.name} (already exists)`) : console.error(`  Failed to seed ${biz.name}:`, err.message);
    }
  console.log(`
Seeded ${seeded}/${ALL_CITY_BUSINESSES.length} businesses.`), console.log("Cities: Austin (10), Houston (8), San Antonio (7), Fort Worth (7), Oklahoma City (10), New Orleans (10), Memphis (10), Nashville (10), Charlotte (10), Raleigh (10)");
}
var AUSTIN_BUSINESSES, HOUSTON_BUSINESSES, SAN_ANTONIO_BUSINESSES, FORT_WORTH_BUSINESSES, OKC_BUSINESSES, NOLA_BUSINESSES, MEMPHIS_BUSINESSES, NASHVILLE_BUSINESSES, CHARLOTTE_BUSINESSES, RALEIGH_BUSINESSES, ALL_CITY_BUSINESSES, isDirectRun, init_seed_cities = __esm({
  "server/seed-cities.ts"() {
    "use strict";
    init_db();
    init_schema();
    AUSTIN_BUSINESSES = [
      { name: "Franklin Barbecue", slug: "franklin-barbecue-austin", city: "Austin", neighborhood: "East Austin", category: "restaurant", weightedScore: "4.850", rawAvgScore: "4.75", rankPosition: 1, rankDelta: 0, totalRatings: 678, description: "The most famous BBQ in Texas. Worth the 4-hour wait.", priceRange: "$$", phone: "(512) 653-1187", address: "900 E 11th St, Austin, TX", lat: "30.2701", lng: "-97.7267", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&h=400&fit=crop" },
      { name: "Uchi", slug: "uchi-austin", city: "Austin", neighborhood: "South Lamar", category: "restaurant", weightedScore: "4.720", rawAvgScore: "4.60", rankPosition: 2, rankDelta: 0, totalRatings: 445, description: "James Beard-winning Japanese farmhouse dining.", priceRange: "$$$$", phone: "(512) 916-4808", address: "801 S Lamar Blvd, Austin, TX", lat: "30.2561", lng: "-97.7628", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&h=400&fit=crop" },
      { name: "Torchy's Tacos", slug: "torchys-tacos-austin", city: "Austin", neighborhood: "South Congress", category: "street_food", weightedScore: "4.580", rawAvgScore: "4.45", rankPosition: 1, rankDelta: 0, totalRatings: 567, description: "Damn good tacos. The Trailer Park is legendary.", priceRange: "$", phone: "(512) 366-0537", address: "1311 S 1st St, Austin, TX", lat: "30.2502", lng: "-97.7540", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop" },
      { name: "Salt Lick BBQ", slug: "salt-lick-bbq-austin", city: "Austin", neighborhood: "Driftwood", category: "restaurant", weightedScore: "4.450", rawAvgScore: "4.30", rankPosition: 3, rankDelta: 1, totalRatings: 389, description: "Open-pit BBQ in the Hill Country since 1967.", priceRange: "$$", phone: "(512) 858-4959", address: "18300 FM 1826, Driftwood, TX", lat: "30.1561", lng: "-97.9410", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop" },
      { name: "Ramen Tatsu-Ya", slug: "ramen-tatsu-ya-austin", city: "Austin", neighborhood: "North Loop", category: "restaurant", weightedScore: "4.380", rawAvgScore: "4.25", rankPosition: 4, rankDelta: -1, totalRatings: 312, description: "Austin's best ramen. No compromise.", priceRange: "$$", phone: "(512) 893-5561", address: "8557 Research Blvd, Austin, TX", lat: "30.3561", lng: "-97.7310", isOpenNow: !1, photoUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop" },
      { name: "Odd Duck", slug: "odd-duck-austin", city: "Austin", neighborhood: "South Lamar", category: "restaurant", weightedScore: "4.250", rawAvgScore: "4.10", rankPosition: 5, rankDelta: 0, totalRatings: 234, description: "Farm-to-table seasonal small plates.", priceRange: "$$$", phone: "(512) 433-6521", address: "1201 S Lamar Blvd, Austin, TX", lat: "30.2501", lng: "-97.7630", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop" },
      { name: "Jo's Coffee", slug: "jos-coffee-austin", city: "Austin", neighborhood: "South Congress", category: "cafe", weightedScore: "4.620", rawAvgScore: "4.50", rankPosition: 1, rankDelta: 0, totalRatings: 456, description: "I Love You So Much wall. Iconic SoCo coffee.", priceRange: "$", phone: "(512) 444-3800", address: "1300 S Congress Ave, Austin, TX", lat: "30.2490", lng: "-97.7491", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop" },
      { name: "Rainey Street Bar District", slug: "rainey-street-austin", city: "Austin", neighborhood: "Rainey Street", category: "bar", weightedScore: "4.500", rawAvgScore: "4.35", rankPosition: 1, rankDelta: 0, totalRatings: 345, description: "Historic bungalows turned into Austin's hottest bar street.", priceRange: "$$", phone: "(512) 555-0001", address: "Rainey Street, Austin, TX", lat: "30.2580", lng: "-97.7380", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop" },
      { name: "Whataburger", slug: "whataburger-austin", city: "Austin", neighborhood: "Multiple", category: "fast_food", weightedScore: "4.200", rawAvgScore: "4.05", rankPosition: 1, rankDelta: 0, totalRatings: 567, description: "Texas institution. Honey butter chicken biscuit.", priceRange: "$", phone: "(512) 555-0002", address: "Multiple locations, Austin, TX", lat: "30.2672", lng: "-97.7431", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop" },
      { name: "Quack's 43rd St Bakery", slug: "quacks-bakery-austin", city: "Austin", neighborhood: "Hyde Park", category: "bakery", weightedScore: "4.350", rawAvgScore: "4.20", rankPosition: 1, rankDelta: 0, totalRatings: 198, description: "Neighborhood bakery with legendary carrot cake.", priceRange: "$", phone: "(512) 453-3399", address: "411 E 43rd St, Austin, TX", lat: "30.3051", lng: "-97.7230", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop" }
    ], HOUSTON_BUSINESSES = [
      { name: "Killen's Barbecue", slug: "killens-bbq-houston", city: "Houston", neighborhood: "Pearland", category: "restaurant", weightedScore: "4.780", rawAvgScore: "4.65", rankPosition: 1, rankDelta: 0, totalRatings: 523, description: "Pitmaster Ronnie Killen's award-winning BBQ.", priceRange: "$$", phone: "(281) 485-2272", address: "3613 E Broadway St, Pearland, TX", lat: "29.5633", lng: "-95.2763", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&h=400&fit=crop" },
      { name: "Pappas Bros. Steakhouse", slug: "pappas-bros-houston", city: "Houston", neighborhood: "Galleria", category: "restaurant", weightedScore: "4.650", rawAvgScore: "4.50", rankPosition: 2, rankDelta: 0, totalRatings: 445, description: "Houston's finest steakhouse. USDA Prime aged beef.", priceRange: "$$$$", phone: "(713) 780-7352", address: "5839 Westheimer Rd, Houston, TX", lat: "29.7372", lng: "-95.4888", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=600&h=400&fit=crop" },
      { name: "Crawfish & Noodles", slug: "crawfish-noodles-houston", city: "Houston", neighborhood: "Chinatown", category: "restaurant", weightedScore: "4.520", rawAvgScore: "4.40", rankPosition: 3, rankDelta: 1, totalRatings: 378, description: "Vietnamese-Cajun fusion that started a revolution.", priceRange: "$$", phone: "(281) 988-8098", address: "11360 Bellaire Blvd, Houston, TX", lat: "29.7045", lng: "-95.5358", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1552611052-33e04de1b100?w=600&h=400&fit=crop" },
      { name: "Tacos Tierra Caliente", slug: "tacos-tierra-caliente-houston", city: "Houston", neighborhood: "Montrose", category: "street_food", weightedScore: "4.600", rawAvgScore: "4.45", rankPosition: 1, rankDelta: 0, totalRatings: 456, description: "Late-night taco truck with the best al pastor in Houston.", priceRange: "$", phone: "(713) 555-0003", address: "1220 Westheimer Rd, Houston, TX", lat: "29.7414", lng: "-95.3917", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop" },
      { name: "Buc-ee's", slug: "buc-ees-houston", city: "Houston", neighborhood: "Baytown", category: "fast_food", weightedScore: "4.400", rawAvgScore: "4.25", rankPosition: 1, rankDelta: 0, totalRatings: 789, description: "Texas-sized gas station with legendary BBQ and beaver nuggets.", priceRange: "$", phone: "(979) 238-6390", address: "4500 I-10 East, Baytown, TX", lat: "29.7827", lng: "-94.9594", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop" },
      { name: "Blacksmith Coffee", slug: "blacksmith-coffee-houston", city: "Houston", neighborhood: "Montrose", category: "cafe", weightedScore: "4.480", rawAvgScore: "4.35", rankPosition: 1, rankDelta: 0, totalRatings: 234, description: "Third-wave coffee in a beautiful Montrose space.", priceRange: "$$", phone: "(713) 555-0004", address: "1018 Westheimer Rd, Houston, TX", lat: "29.7413", lng: "-95.3870", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop" },
      { name: "Julep", slug: "julep-houston", city: "Houston", neighborhood: "Washington Ave", category: "bar", weightedScore: "4.550", rawAvgScore: "4.40", rankPosition: 1, rankDelta: 0, totalRatings: 198, description: "Southern cocktail bar with craft juleps and live music.", priceRange: "$$$", phone: "(713) 869-4383", address: "1919 Washington Ave, Houston, TX", lat: "29.7643", lng: "-95.3842", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=400&fit=crop" },
      { name: "Common Bond Bakery", slug: "common-bond-houston", city: "Houston", neighborhood: "Montrose", category: "bakery", weightedScore: "4.380", rawAvgScore: "4.25", rankPosition: 1, rankDelta: 0, totalRatings: 312, description: "European-inspired bakery and cafe.", priceRange: "$$", phone: "(713) 529-3535", address: "1706 Westheimer Rd, Houston, TX", lat: "29.7434", lng: "-95.3977", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop" }
    ], SAN_ANTONIO_BUSINESSES = [
      { name: "2M Smokehouse", slug: "2m-smokehouse-san-antonio", city: "San Antonio", neighborhood: "South Side", category: "restaurant", weightedScore: "4.750", rawAvgScore: "4.60", rankPosition: 1, rankDelta: 0, totalRatings: 389, description: "Tex-Mex meets BBQ. The brisket enchiladas are legendary.", priceRange: "$$", phone: "(210) 885-9352", address: "2731 S WW White Rd, San Antonio, TX", lat: "29.3921", lng: "-98.4347", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop" },
      { name: "Mi Tierra Cafe", slug: "mi-tierra-san-antonio", city: "San Antonio", neighborhood: "Market Square", category: "restaurant", weightedScore: "4.580", rawAvgScore: "4.45", rankPosition: 2, rankDelta: 0, totalRatings: 567, description: "Open 24 hours since 1941. The Riverwalk institution.", priceRange: "$$", phone: "(210) 225-1262", address: "218 Produce Row, San Antonio, TX", lat: "29.4246", lng: "-98.4969", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1653005753991-22a8bf831f89?w=600&h=400&fit=crop" },
      { name: "Garcia's Mexican Food", slug: "garcias-san-antonio", city: "San Antonio", neighborhood: "West Side", category: "street_food", weightedScore: "4.500", rawAvgScore: "4.35", rankPosition: 1, rankDelta: 0, totalRatings: 345, description: "No-frills Tex-Mex. The puffy tacos are life-changing.", priceRange: "$", phone: "(210) 735-4525", address: "842 Fredericksburg Rd, San Antonio, TX", lat: "29.4521", lng: "-98.5121", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&h=400&fit=crop" },
      { name: "Estate Coffee", slug: "estate-coffee-san-antonio", city: "San Antonio", neighborhood: "Southtown", category: "cafe", weightedScore: "4.420", rawAvgScore: "4.30", rankPosition: 1, rankDelta: 0, totalRatings: 178, description: "Specialty coffee in the heart of Southtown arts district.", priceRange: "$$", phone: "(210) 555-0005", address: "1320 S Alamo St, San Antonio, TX", lat: "29.4150", lng: "-98.4901", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop" },
      { name: "Whataburger", slug: "whataburger-san-antonio", city: "San Antonio", neighborhood: "Multiple", category: "fast_food", weightedScore: "4.250", rawAvgScore: "4.10", rankPosition: 1, rankDelta: 0, totalRatings: 678, description: "Born right here in San Antonio. The HQ city.", priceRange: "$", phone: "(210) 555-0006", address: "Multiple locations, San Antonio, TX", lat: "29.4241", lng: "-98.4936", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop" },
      { name: "The Esquire Tavern", slug: "esquire-tavern-san-antonio", city: "San Antonio", neighborhood: "Riverwalk", category: "bar", weightedScore: "4.550", rawAvgScore: "4.40", rankPosition: 1, rankDelta: 0, totalRatings: 289, description: "The longest bar in Texas, right on the Riverwalk.", priceRange: "$$", phone: "(210) 222-2521", address: "155 E Commerce St, San Antonio, TX", lat: "29.4234", lng: "-98.4876", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop" },
      { name: "Bird Bakery", slug: "bird-bakery-san-antonio", city: "San Antonio", neighborhood: "Alamo Heights", category: "bakery", weightedScore: "4.480", rawAvgScore: "4.35", rankPosition: 1, rankDelta: 0, totalRatings: 234, description: "Cupcakes and cookies by Elizabeth Chambers.", priceRange: "$$", phone: "(210) 804-2473", address: "5912 Broadway, San Antonio, TX", lat: "29.4633", lng: "-98.4623", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=400&fit=crop" }
    ], FORT_WORTH_BUSINESSES = [
      { name: "Heim Barbecue", slug: "heim-bbq-fort-worth", city: "Fort Worth", neighborhood: "Magnolia", category: "restaurant", weightedScore: "4.700", rawAvgScore: "4.55", rankPosition: 1, rankDelta: 0, totalRatings: 445, description: "Bacon burnt ends put Heim on the map. Texas Monthly Top 50.", priceRange: "$$", phone: "(817) 882-6970", address: "1109 W Magnolia Ave, Fort Worth, TX", lat: "32.7185", lng: "-97.3448", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&h=400&fit=crop" },
      { name: "Joe T. Garcia's", slug: "joe-t-garcias-fort-worth", city: "Fort Worth", neighborhood: "Northside", category: "restaurant", weightedScore: "4.550", rawAvgScore: "4.40", rankPosition: 2, rankDelta: 0, totalRatings: 567, description: "The legendary patio. Enchiladas and fajitas only.", priceRange: "$$", phone: "(817) 626-4356", address: "2201 N Commerce St, Fort Worth, TX", lat: "32.7665", lng: "-97.3292", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1653005753991-22a8bf831f89?w=600&h=400&fit=crop" },
      { name: "Salsa Limon", slug: "salsa-limon-fort-worth", city: "Fort Worth", neighborhood: "Near South", category: "street_food", weightedScore: "4.480", rawAvgScore: "4.35", rankPosition: 1, rankDelta: 0, totalRatings: 345, description: "Mexican street food truck turned brick-and-mortar.", priceRange: "$", phone: "(817) 927-4328", address: "4200 S Freeway, Fort Worth, TX", lat: "32.7100", lng: "-97.3232", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop" },
      { name: "Avoca Coffee", slug: "avoca-coffee-fort-worth", city: "Fort Worth", neighborhood: "Magnolia", category: "cafe", weightedScore: "4.500", rawAvgScore: "4.35", rankPosition: 1, rankDelta: 0, totalRatings: 198, description: "Fort Worth's premier specialty coffee roaster.", priceRange: "$$", phone: "(817) 677-6741", address: "1311 W Magnolia Ave, Fort Worth, TX", lat: "32.7180", lng: "-97.3465", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop" },
      { name: "Whataburger", slug: "whataburger-fort-worth", city: "Fort Worth", neighborhood: "Multiple", category: "fast_food", weightedScore: "4.180", rawAvgScore: "4.05", rankPosition: 1, rankDelta: 0, totalRatings: 456, description: "Texas institution. Always there at 2am.", priceRange: "$", phone: "(817) 555-0007", address: "Multiple locations, Fort Worth, TX", lat: "32.7555", lng: "-97.3308", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop" },
      { name: "The Usual", slug: "the-usual-fort-worth", city: "Fort Worth", neighborhood: "Sundance Square", category: "bar", weightedScore: "4.380", rawAvgScore: "4.25", rankPosition: 1, rankDelta: 0, totalRatings: 189, description: "Craft cocktail bar in Sundance Square.", priceRange: "$$$", phone: "(817) 810-0114", address: "310 Houston St, Fort Worth, TX", lat: "32.7548", lng: "-97.3313", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=400&fit=crop" },
      { name: "Swiss Pastry Shop", slug: "swiss-pastry-fort-worth", city: "Fort Worth", neighborhood: "Camp Bowie", category: "bakery", weightedScore: "4.420", rawAvgScore: "4.30", rankPosition: 1, rankDelta: 0, totalRatings: 267, description: "Fort Worth's oldest bakery. Since 1950.", priceRange: "$", phone: "(817) 732-5661", address: "3936 W Vickery Blvd, Fort Worth, TX", lat: "32.7370", lng: "-97.3698", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop" }
    ], OKC_BUSINESSES = [
      { name: "Cattlemen's Steakhouse", slug: "cattlemens-steakhouse-okc", city: "Oklahoma City", neighborhood: "Stockyards City", category: "restaurant", weightedScore: "4.780", rawAvgScore: "4.65", rankPosition: 1, rankDelta: 0, totalRatings: 534, description: "Oklahoma's most famous steakhouse since 1910", priceRange: "$$$", phone: "(405) 236-0416", address: "1309 S Agnew Ave, Oklahoma City, OK", lat: "35.4558", lng: "-97.5378", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=600&h=400&fit=crop" },
      { name: "Nic's Grill", slug: "nics-grill-okc", city: "Oklahoma City", neighborhood: "Midtown", category: "restaurant", weightedScore: "4.680", rawAvgScore: "4.55", rankPosition: 2, rankDelta: 0, totalRatings: 467, description: "Tiny counter spot. Best burger in OKC, maybe America", priceRange: "$", phone: "(405) 524-0999", address: "1201 N Pennsylvania Ave, Oklahoma City, OK", lat: "35.4780", lng: "-97.5168", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop" },
      { name: "Waffle Champion", slug: "waffle-champion-okc", city: "Oklahoma City", neighborhood: "Midtown", category: "cafe", weightedScore: "4.550", rawAvgScore: "4.40", rankPosition: 1, rankDelta: 0, totalRatings: 345, description: "Gourmet waffles meet breakfast innovation", priceRange: "$$", phone: "(405) 601-9956", address: "1212 N Walker Ave, Oklahoma City, OK", lat: "35.4785", lng: "-97.5225", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1504113888839-1c8eb50233d3?w=600&h=400&fit=crop" },
      { name: "Empire Slice House", slug: "empire-slice-house-okc", city: "Oklahoma City", neighborhood: "Plaza District", category: "restaurant", weightedScore: "4.450", rawAvgScore: "4.30", rankPosition: 3, rankDelta: 0, totalRatings: 312, description: "Artisan pizza with local OKC personality", priceRange: "$$", phone: "(405) 525-7423", address: "1734 NW 16th St, Oklahoma City, OK", lat: "35.4821", lng: "-97.5340", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop" },
      { name: "Tamashii Ramen House", slug: "tamashii-ramen-okc", city: "Oklahoma City", neighborhood: "Asian District", category: "restaurant", weightedScore: "4.380", rawAvgScore: "4.25", rankPosition: 4, rankDelta: 0, totalRatings: 278, description: "Authentic Japanese ramen in OKC's vibrant Asian District", priceRange: "$$", phone: "(405) 600-7788", address: "6608 N May Ave, Oklahoma City, OK", lat: "35.5122", lng: "-97.5605", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop" },
      { name: "The Jones Assembly", slug: "jones-assembly-okc", city: "Oklahoma City", neighborhood: "Film Row", category: "bar", weightedScore: "4.520", rawAvgScore: "4.40", rankPosition: 1, rankDelta: 0, totalRatings: 398, description: "Restaurant, bar, and live music venue. OKC culture hub", priceRange: "$$$", phone: "(405) 212-2378", address: "901 W Sheridan Ave, Oklahoma City, OK", lat: "35.4660", lng: "-97.5280", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop" },
      { name: "Pie Junkie", slug: "pie-junkie-okc", city: "Oklahoma City", neighborhood: "Classen", category: "bakery", weightedScore: "4.480", rawAvgScore: "4.35", rankPosition: 1, rankDelta: 0, totalRatings: 267, description: "Handmade pies with seasonal Oklahoma flavors", priceRange: "$$", phone: "(405) 605-8767", address: "1711 NW 16th St, Oklahoma City, OK", lat: "35.4819", lng: "-97.5320", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=400&fit=crop" },
      { name: "Big Truck Tacos", slug: "big-truck-tacos-okc", city: "Oklahoma City", neighborhood: "NW 23rd", category: "street_food", weightedScore: "4.400", rawAvgScore: "4.25", rankPosition: 1, rankDelta: 0, totalRatings: 356, description: "Food truck turned institution. OKC taco legend", priceRange: "$", phone: "(405) 525-8226", address: "530 NW 23rd St, Oklahoma City, OK", lat: "35.4872", lng: "-97.5241", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop" },
      { name: "Hideaway Pizza", slug: "hideaway-pizza-okc", city: "Oklahoma City", neighborhood: "Multiple", category: "fast_food", weightedScore: "4.350", rawAvgScore: "4.20", rankPosition: 1, rankDelta: 0, totalRatings: 445, description: "Oklahoma pizza chain since 1957. The OG", priceRange: "$", phone: "(405) 840-2777", address: "6616 N Western Ave, Oklahoma City, OK", lat: "35.5130", lng: "-97.5435", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop" },
      { name: "The Press", slug: "the-press-okc", city: "Oklahoma City", neighborhood: "Plaza District", category: "cafe", weightedScore: "4.320", rawAvgScore: "4.20", rankPosition: 2, rankDelta: 0, totalRatings: 234, description: "Coffee and community in the heart of Plaza District", priceRange: "$", phone: "(405) 524-0222", address: "1738 NW 16th St, Oklahoma City, OK", lat: "35.4822", lng: "-97.5342", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop" }
    ], NOLA_BUSINESSES = [
      { name: "Commander's Palace", slug: "commanders-palace-nola", city: "New Orleans", neighborhood: "Garden District", category: "restaurant", weightedScore: "4.850", rawAvgScore: "4.75", rankPosition: 1, rankDelta: 0, totalRatings: 612, description: "Fine dining legend since 1893. Creole cuisine at its finest", priceRange: "$$$$", phone: "(504) 899-8221", address: "1403 Washington Ave, New Orleans, LA", lat: "29.9291", lng: "-90.0892", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop" },
      { name: "Dooky Chase's", slug: "dooky-chases-nola", city: "New Orleans", neighborhood: "Treme", category: "restaurant", weightedScore: "4.750", rawAvgScore: "4.65", rankPosition: 2, rankDelta: 0, totalRatings: 534, description: "Queen of Creole cuisine. Civil rights history meets gumbo perfection", priceRange: "$$$", phone: "(504) 821-0600", address: "2301 Orleans Ave, New Orleans, LA", lat: "29.9650", lng: "-90.0775", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1653005753991-22a8bf831f89?w=600&h=400&fit=crop" },
      { name: "Cafe Du Monde", slug: "cafe-du-monde-nola", city: "New Orleans", neighborhood: "French Quarter", category: "cafe", weightedScore: "4.680", rawAvgScore: "4.55", rankPosition: 1, rankDelta: 0, totalRatings: 789, description: "Beignets and chicory coffee 24/7 since 1862", priceRange: "$", phone: "(504) 525-4544", address: "800 Decatur St, New Orleans, LA", lat: "29.9574", lng: "-90.0618", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop" },
      { name: "Willie Mae's Scotch House", slug: "willie-maes-scotch-house-nola", city: "New Orleans", neighborhood: "Treme", category: "restaurant", weightedScore: "4.620", rawAvgScore: "4.50", rankPosition: 3, rankDelta: 0, totalRatings: 467, description: "Best fried chicken in America. James Beard Award winner", priceRange: "$$", phone: "(504) 822-9503", address: "2401 St Ann St, New Orleans, LA", lat: "29.9660", lng: "-90.0790", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop" },
      { name: "Cochon", slug: "cochon-nola", city: "New Orleans", neighborhood: "Warehouse District", category: "restaurant", weightedScore: "4.550", rawAvgScore: "4.40", rankPosition: 4, rankDelta: 0, totalRatings: 398, description: "Cajun nose-to-tail cooking with Louisiana soul", priceRange: "$$$", phone: "(504) 588-2123", address: "930 Tchoupitoulas St, New Orleans, LA", lat: "29.9430", lng: "-90.0680", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop" },
      { name: "Bacchanal Wine", slug: "bacchanal-wine-nola", city: "New Orleans", neighborhood: "Bywater", category: "bar", weightedScore: "4.580", rawAvgScore: "4.45", rankPosition: 1, rankDelta: 0, totalRatings: 423, description: "Wine bar meets backyard concert venue in the Bywater", priceRange: "$$", phone: "(504) 948-9111", address: "600 Poland Ave, New Orleans, LA", lat: "29.9630", lng: "-90.0400", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=400&fit=crop" },
      { name: "Dong Phuong Bakery", slug: "dong-phuong-bakery-nola", city: "New Orleans", neighborhood: "New Orleans East", category: "bakery", weightedScore: "4.520", rawAvgScore: "4.40", rankPosition: 1, rankDelta: 0, totalRatings: 345, description: "Vietnamese-French bakery. Best king cake and banh mi in NOLA", priceRange: "$", phone: "(504) 254-0214", address: "14207 Chef Menteur Hwy, New Orleans, LA", lat: "30.0280", lng: "-89.9580", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop" },
      { name: "Dat Dog", slug: "dat-dog-nola", city: "New Orleans", neighborhood: "Frenchmen Street", category: "street_food", weightedScore: "4.450", rawAvgScore: "4.30", rankPosition: 1, rankDelta: 0, totalRatings: 456, description: "Gourmet hot dogs with wild toppings. NOLA street food icon", priceRange: "$", phone: "(504) 309-3362", address: "601 Frenchmen St, New Orleans, LA", lat: "29.9640", lng: "-90.0570", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop" },
      { name: "Raising Cane's", slug: "raising-canes-nola", city: "New Orleans", neighborhood: "Multiple", category: "fast_food", weightedScore: "4.380", rawAvgScore: "4.25", rankPosition: 1, rankDelta: 0, totalRatings: 567, description: "Born in Baton Rouge, perfected in NOLA. One love \u2014 chicken fingers", priceRange: "$", phone: "(504) 304-6264", address: "Multiple locations, New Orleans, LA", lat: "29.9511", lng: "-90.0715", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop" },
      { name: "French Truck Coffee", slug: "french-truck-coffee-nola", city: "New Orleans", neighborhood: "CBD", category: "cafe", weightedScore: "4.350", rawAvgScore: "4.20", rankPosition: 2, rankDelta: 0, totalRatings: 289, description: "Local roaster serving NOLA's best specialty coffee", priceRange: "$$", phone: "(504) 309-7880", address: "1200 Carondelet St, New Orleans, LA", lat: "29.9410", lng: "-90.0730", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop" }
    ], MEMPHIS_BUSINESSES = [
      { name: "Central BBQ", slug: "central-bbq-memphis", city: "Memphis", neighborhood: "Midtown Memphis", category: "restaurant", weightedScore: "4.820", rawAvgScore: "4.70", rankPosition: 1, rankDelta: 0, totalRatings: 589, description: "Memphis dry-rub ribs perfected. Competition-winning BBQ.", priceRange: "$$", phone: "(901) 672-7760", address: "2249 Central Ave, Memphis, TN", lat: "35.1312", lng: "-89.9903", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&h=400&fit=crop" },
      { name: "Gus's World Famous Fried Chicken", slug: "gus-fried-chicken-memphis", city: "Memphis", neighborhood: "Downtown Memphis", category: "restaurant", weightedScore: "4.750", rawAvgScore: "4.65", rankPosition: 2, rankDelta: 0, totalRatings: 534, description: "Spicy fried chicken legend. The original since 1953.", priceRange: "$$", phone: "(901) 527-4877", address: "310 S Front St, Memphis, TN", lat: "35.1380", lng: "-90.0560", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop" },
      { name: "Charlie Vergos' Rendezvous", slug: "rendezvous-memphis", city: "Memphis", neighborhood: "Downtown Memphis", category: "restaurant", weightedScore: "4.680", rawAvgScore: "4.55", rankPosition: 3, rankDelta: 0, totalRatings: 467, description: "Underground dry-rub rib institution since 1948.", priceRange: "$$", phone: "(901) 523-2746", address: "52 S 2nd St, Memphis, TN", lat: "35.1420", lng: "-90.0530", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop" },
      { name: "Dyer's Burgers", slug: "dyers-burgers-memphis", city: "Memphis", neighborhood: "Beale Street", category: "restaurant", weightedScore: "4.520", rawAvgScore: "4.40", rankPosition: 4, rankDelta: 0, totalRatings: 345, description: "Deep-fried burgers on Beale Street since 1912. Legendary grease.", priceRange: "$", phone: "(901) 527-3937", address: "205 Beale St, Memphis, TN", lat: "35.1395", lng: "-90.0530", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop" },
      { name: "Muddy's Bake Shop", slug: "muddys-bake-shop-memphis", city: "Memphis", neighborhood: "Cooper-Young", category: "bakery", weightedScore: "4.580", rawAvgScore: "4.45", rankPosition: 1, rankDelta: 0, totalRatings: 289, description: "From-scratch cupcakes and pies in Cooper-Young.", priceRange: "$", phone: "(901) 683-8844", address: "2263 Young Ave, Memphis, TN", lat: "35.1270", lng: "-89.9880", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=400&fit=crop" },
      { name: "City & State Coffee", slug: "city-state-coffee-memphis", city: "Memphis", neighborhood: "Cooper-Young", category: "cafe", weightedScore: "4.450", rawAvgScore: "4.30", rankPosition: 1, rankDelta: 0, totalRatings: 234, description: "Specialty coffee and community in the Cooper-Young district.", priceRange: "$$", phone: "(901) 249-2406", address: "2625 Broad Ave, Memphis, TN", lat: "35.1350", lng: "-89.9760", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop" },
      { name: "Aldo's Pizza Pies", slug: "aldos-pizza-memphis", city: "Memphis", neighborhood: "Cooper-Young", category: "restaurant", weightedScore: "4.400", rawAvgScore: "4.25", rankPosition: 5, rankDelta: 0, totalRatings: 198, description: "Neapolitan-style pizza in the heart of Cooper-Young.", priceRange: "$$", phone: "(901) 276-7600", address: "1937 Young Ave, Memphis, TN", lat: "35.1275", lng: "-89.9920", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop" },
      { name: "Blues City Cafe", slug: "blues-city-cafe-memphis", city: "Memphis", neighborhood: "Beale Street", category: "bar", weightedScore: "4.550", rawAvgScore: "4.40", rankPosition: 1, rankDelta: 0, totalRatings: 412, description: "Live blues and BBQ on Beale Street. Memphis nightlife icon.", priceRange: "$$", phone: "(901) 526-3637", address: "138 Beale St, Memphis, TN", lat: "35.1393", lng: "-90.0540", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop" },
      { name: "Payne's Bar-B-Q", slug: "paynes-bbq-memphis", city: "Memphis", neighborhood: "Midtown Memphis", category: "street_food", weightedScore: "4.620", rawAvgScore: "4.50", rankPosition: 1, rankDelta: 0, totalRatings: 367, description: "Chopped pork sandwich perfection. No-frills Memphis BBQ.", priceRange: "$", phone: "(901) 272-1523", address: "1762 Lamar Ave, Memphis, TN", lat: "35.1230", lng: "-89.9870", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&h=400&fit=crop" },
      { name: "Jack Pirtle's Chicken", slug: "jack-pirtles-memphis", city: "Memphis", neighborhood: "Midtown Memphis", category: "fast_food", weightedScore: "4.300", rawAvgScore: "4.15", rankPosition: 1, rankDelta: 0, totalRatings: 456, description: "Memphis fried chicken chain since 1956. Local institution.", priceRange: "$", phone: "(901) 324-7800", address: "1217 S Bellevue Blvd, Memphis, TN", lat: "35.1240", lng: "-90.0100", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop" }
    ], NASHVILLE_BUSINESSES = [
      { name: "Prince's Hot Chicken Shack", slug: "princes-hot-chicken-nashville", city: "Nashville", neighborhood: "East Nashville", category: "restaurant", weightedScore: "4.850", rawAvgScore: "4.75", rankPosition: 1, rankDelta: 0, totalRatings: 623, description: "The original Nashville hot chicken. Since 1945.", priceRange: "$", phone: "(615) 226-9442", address: "123 Ewing Dr, Nashville, TN", lat: "36.1880", lng: "-86.7450", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop" },
      { name: "Hattie B's Hot Chicken", slug: "hattie-bs-nashville", city: "Nashville", neighborhood: "Midtown", category: "restaurant", weightedScore: "4.720", rawAvgScore: "4.60", rankPosition: 2, rankDelta: 0, totalRatings: 534, description: "Nashville hot chicken with Southern sides. Worth the wait.", priceRange: "$$", phone: "(615) 678-4794", address: "112 19th Ave S, Nashville, TN", lat: "36.1530", lng: "-86.7990", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&h=400&fit=crop" },
      { name: "Martin's Bar-B-Que Joint", slug: "martins-bbq-nashville", city: "Nashville", neighborhood: "12South", category: "restaurant", weightedScore: "4.650", rawAvgScore: "4.50", rankPosition: 3, rankDelta: 0, totalRatings: 445, description: "Whole-hog BBQ done right. West Tennessee pit tradition.", priceRange: "$$", phone: "(615) 288-0880", address: "2400 Elliston Pl, Nashville, TN", lat: "36.1540", lng: "-86.8050", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop" },
      { name: "Biscuit Love", slug: "biscuit-love-nashville", city: "Nashville", neighborhood: "The Gulch", category: "cafe", weightedScore: "4.580", rawAvgScore: "4.45", rankPosition: 1, rankDelta: 0, totalRatings: 489, description: "Southern brunch institution. The Bonuts are legendary.", priceRange: "$$", phone: "(615) 490-9584", address: "316 11th Ave S, Nashville, TN", lat: "36.1520", lng: "-86.7880", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1504113888839-1c8eb50233d3?w=600&h=400&fit=crop" },
      { name: "The Pharmacy Burger Parlor", slug: "pharmacy-burger-nashville", city: "Nashville", neighborhood: "East Nashville", category: "restaurant", weightedScore: "4.520", rawAvgScore: "4.40", rankPosition: 4, rankDelta: 0, totalRatings: 378, description: "German-style biergarten with craft burgers.", priceRange: "$$", phone: "(615) 712-9517", address: "731 McFerrin Ave, Nashville, TN", lat: "36.1850", lng: "-86.7620", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop" },
      { name: "Five Daughters Bakery", slug: "five-daughters-bakery-nashville", city: "Nashville", neighborhood: "12South", category: "bakery", weightedScore: "4.550", rawAvgScore: "4.40", rankPosition: 1, rankDelta: 0, totalRatings: 312, description: "100-layer donuts and artisan pastries in 12South.", priceRange: "$$", phone: "(615) 490-6554", address: "1110 Caruthers Ave, Nashville, TN", lat: "36.1310", lng: "-86.7890", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=400&fit=crop" },
      { name: "Robert's Western World", slug: "roberts-western-world-nashville", city: "Nashville", neighborhood: "Broadway", category: "bar", weightedScore: "4.680", rawAvgScore: "4.55", rankPosition: 1, rankDelta: 0, totalRatings: 456, description: "Honky-tonk legend on Lower Broadway. Live country every night.", priceRange: "$", phone: "(615) 244-9552", address: "416 Broadway, Nashville, TN", lat: "36.1590", lng: "-86.7770", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop" },
      { name: "Bolton's Spicy Chicken & Fish", slug: "boltons-spicy-chicken-nashville", city: "Nashville", neighborhood: "East Nashville", category: "street_food", weightedScore: "4.480", rawAvgScore: "4.35", rankPosition: 1, rankDelta: 0, totalRatings: 345, description: "Hot fish and hot chicken. East Nashville staple.", priceRange: "$", phone: "(615) 254-8015", address: "624 Main St, Nashville, TN", lat: "36.1780", lng: "-86.7580", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop" },
      { name: "Slim & Husky's", slug: "slim-huskys-nashville", city: "Nashville", neighborhood: "East Nashville", category: "fast_food", weightedScore: "4.380", rawAvgScore: "4.25", rankPosition: 1, rankDelta: 0, totalRatings: 398, description: "Artisan pizza and craft beer. Black-owned Nashville favorite.", priceRange: "$", phone: "(615) 891-2433", address: "911 Buchanan St, Nashville, TN", lat: "36.1820", lng: "-86.7950", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop" },
      { name: "Barista Parlor", slug: "barista-parlor-nashville", city: "Nashville", neighborhood: "The Gulch", category: "cafe", weightedScore: "4.450", rawAvgScore: "4.30", rankPosition: 2, rankDelta: 0, totalRatings: 267, description: "Nashville's craft coffee pioneer. Industrial chic spaces.", priceRange: "$$", phone: "(615) 712-9766", address: "519 Gallatin Ave, Nashville, TN", lat: "36.1740", lng: "-86.7560", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop" }
    ], CHARLOTTE_BUSINESSES = [
      { name: "Midwood Smokehouse", slug: "midwood-smokehouse-charlotte", city: "Charlotte", neighborhood: "Plaza Midwood", category: "bbq", weightedScore: "4.780", rawAvgScore: "4.65", rankPosition: 1, rankDelta: 0, totalRatings: 512, description: "Texas-style BBQ meets Carolina tradition. Brisket and pulled pork perfection.", priceRange: "$$", phone: "(704) 295-4227", address: "1401 Central Ave, Charlotte, NC", lat: "35.2180", lng: "-80.8190", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&h=400&fit=crop" },
      { name: "Haberdish", slug: "haberdish-charlotte", city: "Charlotte", neighborhood: "NoDa", category: "restaurant", weightedScore: "4.720", rawAvgScore: "4.60", rankPosition: 2, rankDelta: 0, totalRatings: 445, description: "Southern sharing plates in the NoDa arts district.", priceRange: "$$$", phone: "(704) 817-7768", address: "3106 N Davidson St, Charlotte, NC", lat: "35.2450", lng: "-80.8120", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop" },
      { name: "Optimist Hall", slug: "optimist-hall-charlotte", city: "Charlotte", neighborhood: "South End", category: "restaurant", weightedScore: "4.650", rawAvgScore: "4.50", rankPosition: 3, rankDelta: 0, totalRatings: 398, description: "Historic textile mill turned food hall with 20+ vendors.", priceRange: "$$", phone: "(704) 603-0400", address: "1115 N Brevard St, Charlotte, NC", lat: "35.2320", lng: "-80.8330", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop" },
      { name: "The Asbury", slug: "the-asbury-charlotte", city: "Charlotte", neighborhood: "Uptown", category: "restaurant", weightedScore: "4.580", rawAvgScore: "4.45", rankPosition: 4, rankDelta: 0, totalRatings: 356, description: "Farm-to-table Southern fine dining in the Dunhill Hotel.", priceRange: "$$$$", phone: "(704) 342-1193", address: "237 N Tryon St, Charlotte, NC", lat: "35.2280", lng: "-80.8430", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=600&h=400&fit=crop" },
      { name: "Not Just Coffee", slug: "not-just-coffee-charlotte", city: "Charlotte", neighborhood: "South End", category: "cafe", weightedScore: "4.550", rawAvgScore: "4.40", rankPosition: 1, rankDelta: 0, totalRatings: 312, description: "Charlotte's original specialty coffee roaster.", priceRange: "$$", phone: "(704) 831-7799", address: "224 E 7th St, Charlotte, NC", lat: "35.2260", lng: "-80.8390", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop" },
      { name: "Mac's Speed Shop", slug: "macs-speed-shop-charlotte", city: "Charlotte", neighborhood: "South End", category: "bbq", weightedScore: "4.500", rawAvgScore: "4.35", rankPosition: 5, rankDelta: 0, totalRatings: 423, description: "BBQ and bikes. Legendary pulled pork and craft beer selection.", priceRange: "$$", phone: "(704) 522-6227", address: "2511 South Blvd, Charlotte, NC", lat: "35.2080", lng: "-80.8570", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop" },
      { name: "Amelie's French Bakery", slug: "amelies-french-bakery-charlotte", city: "Charlotte", neighborhood: "NoDa", category: "bakery", weightedScore: "4.480", rawAvgScore: "4.35", rankPosition: 1, rankDelta: 0, totalRatings: 389, description: "24-hour French bakery and cafe. Charlotte institution.", priceRange: "$", phone: "(704) 376-1781", address: "2424 N Davidson St, Charlotte, NC", lat: "35.2410", lng: "-80.8140", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop" },
      { name: "The Broken Spoke", slug: "broken-spoke-charlotte", city: "Charlotte", neighborhood: "Plaza Midwood", category: "bar", weightedScore: "4.450", rawAvgScore: "4.30", rankPosition: 1, rankDelta: 0, totalRatings: 267, description: "Dive bar meets craft cocktails in Plaza Midwood.", priceRange: "$$", phone: "(704) 375-2882", address: "2416 Central Ave, Charlotte, NC", lat: "35.2185", lng: "-80.8050", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop" },
      { name: "Leah & Louise", slug: "leah-and-louise-charlotte", city: "Charlotte", neighborhood: "Uptown", category: "restaurant", weightedScore: "4.420", rawAvgScore: "4.30", rankPosition: 6, rankDelta: 0, totalRatings: 289, description: "Modern juke joint with Southern and global soul food.", priceRange: "$$$", phone: "(704) 343-1010", address: "301 E 7th St, Charlotte, NC", lat: "35.2275", lng: "-80.8370", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1653005753991-22a8bf831f89?w=600&h=400&fit=crop" },
      { name: "Sunflour Baking Company", slug: "sunflour-baking-charlotte", city: "Charlotte", neighborhood: "NoDa", category: "cafe", weightedScore: "4.380", rawAvgScore: "4.25", rankPosition: 2, rankDelta: 0, totalRatings: 234, description: "Scratch-made pastries and brunch in the NoDa arts scene.", priceRange: "$$", phone: "(704) 741-0398", address: "220 E 36th St, Charlotte, NC", lat: "35.2440", lng: "-80.8160", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop" }
    ], RALEIGH_BUSINESSES = [
      { name: "Beasley's Chicken + Honey", slug: "beasleys-chicken-raleigh", city: "Raleigh", neighborhood: "Downtown Raleigh", category: "restaurant", weightedScore: "4.780", rawAvgScore: "4.65", rankPosition: 1, rankDelta: 0, totalRatings: 489, description: "Ashley Christensen's fried chicken temple. James Beard winner.", priceRange: "$$", phone: "(919) 322-0127", address: "237 S Wilmington St, Raleigh, NC", lat: "35.7760", lng: "-78.6380", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop" },
      { name: "Poole's Diner", slug: "pooles-diner-raleigh", city: "Raleigh", neighborhood: "Downtown Raleigh", category: "restaurant", weightedScore: "4.720", rawAvgScore: "4.60", rankPosition: 2, rankDelta: 0, totalRatings: 456, description: "Farm-to-fork pioneer in a retro 1940s diner space.", priceRange: "$$$", phone: "(919) 832-4477", address: "426 S McDowell St, Raleigh, NC", lat: "35.7740", lng: "-78.6400", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop" },
      { name: "The Pit Authentic Barbecue", slug: "the-pit-bbq-raleigh", city: "Raleigh", neighborhood: "Warehouse District", category: "bbq", weightedScore: "4.650", rawAvgScore: "4.50", rankPosition: 1, rankDelta: 0, totalRatings: 534, description: "Whole-hog Eastern NC barbecue in the Warehouse District.", priceRange: "$$", phone: "(919) 890-4500", address: "328 W Davie St, Raleigh, NC", lat: "35.7720", lng: "-78.6430", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&h=400&fit=crop" },
      { name: "Brewery Bhavana", slug: "brewery-bhavana-raleigh", city: "Raleigh", neighborhood: "Downtown Raleigh", category: "bar", weightedScore: "4.580", rawAvgScore: "4.45", rankPosition: 1, rankDelta: 0, totalRatings: 378, description: "Brewery, bookstore, dim sum parlor, and flower shop. All in one.", priceRange: "$$", phone: "(919) 829-9998", address: "218 S Blount St, Raleigh, NC", lat: "35.7755", lng: "-78.6360", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=400&fit=crop" },
      { name: "Jolie", slug: "jolie-raleigh", city: "Raleigh", neighborhood: "Five Points", category: "restaurant", weightedScore: "4.550", rawAvgScore: "4.40", rankPosition: 3, rankDelta: 0, totalRatings: 312, description: "French-inspired neighborhood bistro in Five Points.", priceRange: "$$$", phone: "(919) 896-8783", address: "620 Glenwood Ave, Raleigh, NC", lat: "35.7870", lng: "-78.6470", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=600&h=400&fit=crop" },
      { name: "Sitti", slug: "sitti-raleigh", city: "Raleigh", neighborhood: "Glenwood South", category: "restaurant", weightedScore: "4.500", rawAvgScore: "4.35", rankPosition: 4, rankDelta: 0, totalRatings: 345, description: "Lebanese cuisine on Glenwood South. Raleigh's Mediterranean gem.", priceRange: "$$", phone: "(919) 239-4070", address: "137 S Wilmington St, Raleigh, NC", lat: "35.7770", lng: "-78.6375", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1653005753991-22a8bf831f89?w=600&h=400&fit=crop" },
      { name: "Videri Chocolate Factory", slug: "videri-chocolate-raleigh", city: "Raleigh", neighborhood: "Warehouse District", category: "cafe", weightedScore: "4.480", rawAvgScore: "4.35", rankPosition: 1, rankDelta: 0, totalRatings: 289, description: "Bean-to-bar chocolate factory with cafe. Raleigh sweet spot.", priceRange: "$$", phone: "(919) 831-1180", address: "327 W Davie St, Raleigh, NC", lat: "35.7718", lng: "-78.6428", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop" },
      { name: "La Farm Bakery", slug: "la-farm-bakery-raleigh", city: "Raleigh", neighborhood: "Five Points", category: "bakery", weightedScore: "4.450", rawAvgScore: "4.30", rankPosition: 1, rankDelta: 0, totalRatings: 267, description: "Artisan French bakery. Best bread in the Triangle.", priceRange: "$$", phone: "(919) 657-0657", address: "4248 NW Cary Pkwy, Raleigh, NC", lat: "35.8010", lng: "-78.7990", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop" },
      { name: "Clyde Cooper's Barbecue", slug: "clyde-coopers-bbq-raleigh", city: "Raleigh", neighborhood: "Downtown Raleigh", category: "bbq", weightedScore: "4.420", rawAvgScore: "4.30", rankPosition: 2, rankDelta: 0, totalRatings: 423, description: "Eastern NC BBQ since 1938. Raleigh's oldest barbecue joint.", priceRange: "$", phone: "(919) 832-7614", address: "109 E Davie St, Raleigh, NC", lat: "35.7730", lng: "-78.6370", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop" },
      { name: "Hummingbird", slug: "hummingbird-raleigh", city: "Raleigh", neighborhood: "Glenwood South", category: "cafe", weightedScore: "4.380", rawAvgScore: "4.25", rankPosition: 2, rankDelta: 0, totalRatings: 198, description: "Coffee and cocktails with Raleigh rooftop views.", priceRange: "$$", phone: "(919) 301-1749", address: "223 S Wilmington St, Raleigh, NC", lat: "35.7758", lng: "-78.6378", isOpenNow: !0, photoUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop" }
    ], ALL_CITY_BUSINESSES = [
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
    isDirectRun && seedCities().then(() => process.exit(0)).catch((err) => {
      console.error("Seed failed:", err), process.exit(1);
    });
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
  sendClaimVerificationCodeEmail: () => sendClaimVerificationCodeEmail,
  sendEmail: () => sendEmail,
  sendPasswordResetEmail: () => sendPasswordResetEmail,
  sendPaymentReceiptEmail: () => sendPaymentReceiptEmail,
  sendVerificationEmail: () => sendVerificationEmail,
  sendWelcomeEmail: () => sendWelcomeEmail
});
async function sendWithRetry(payload, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      let res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        signal: AbortSignal.timeout(1e4),
        body: JSON.stringify({
          from: FROM_ADDRESS,
          to: [payload.to],
          subject: payload.subject,
          html: payload.html,
          text: payload.text
        })
      });
      if (res.ok)
        return emailLog.info(`Sent to ${payload.to}: ${payload.subject}`), !0;
      let body = await res.text();
      if (res.status < 500 && res.status !== 429)
        return emailLog.error(`Resend API error ${res.status}: ${body.slice(0, 200)}`), !1;
      emailLog.warn(`Resend API ${res.status} (attempt ${attempt + 1}/${maxRetries}): ${body.slice(0, 100)}`);
    } catch (err) {
      emailLog.warn(`Email send error (attempt ${attempt + 1}/${maxRetries}): ${err.message}`);
    }
    attempt < maxRetries - 1 && await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
  }
  return emailLog.error(`Email to ${payload.to} failed after ${maxRetries} retries`), !1;
}
async function sendEmail(payload) {
  let templateName = payload.subject.slice(0, 50), trackingId = trackEmailSent(payload.to, templateName);
  if (!RESEND_API_KEY) {
    emailLog.info(`[DEV] To: ${payload.to} | Subject: ${payload.subject}`);
    return;
  }
  await sendWithRetry(payload) || trackEmailFailed(trackingId, "Resend API failed after retries");
}
async function sendWelcomeEmail(params) {
  let { email, displayName, city, username } = params, firstName = displayName.split(" ")[0], html = `
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
          <a href="${config.siteUrl}" style="display:block;text-align:center;background:#0D1B2A;color:#FFFFFF;padding:14px 24px;border-radius:12px;font-size:16px;font-weight:700;text-decoration:none;">
            Start Exploring ${city}
          </a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 24px;border-top:1px solid #E8E6E1;text-align:center;">
          <p style="margin:0;color:#999;font-size:11px;">
            TopRanker \u2014 Trust-weighted rankings for ${city}<br>
            <a href="${config.siteUrl}/unsubscribe" style="color:#C49A1A;text-decoration:none;">Unsubscribe</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`, text2 = `Welcome to TopRanker, ${firstName}!

You've joined the ${city} ranking community as @${username}.

1. Explore rankings in ${city}
2. After 3 days, unlock rating
3. Build credibility \u2014 more ratings = higher vote weight

Your starting tier: New Member (0.10x vote weight)

Start exploring: ${config.siteUrl}

\u2014 The TopRanker Team`;
  await sendEmail({
    to: email,
    subject: `Welcome to TopRanker, ${firstName}! \u{1F3C6}`,
    html,
    text: text2
  });
}
async function sendClaimConfirmationEmail(params) {
  let { email, displayName, businessName } = params, firstName = displayName.split(" ")[0], html = `
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
</html>`, text2 = `Hi ${firstName},

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
  let { email, displayName, type, amount, businessName, paymentId } = params, firstName = displayName.split(" ")[0], dollars = (amount / 100).toFixed(2), typeLabel = type === "challenger_entry" ? "Challenger Entry" : type === "dashboard_pro" ? "Dashboard Pro Subscription" : type === "featured_placement" ? "Featured Placement" : type, html = `
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
            Questions about this charge? Contact us at support@topranker.io
          </p>
        </td></tr>
        <tr><td style="padding:16px 24px;border-top:1px solid #E8E6E1;text-align:center;">
          <p style="margin:0;color:#999;font-size:11px;">TopRanker \u2014 Trust-weighted rankings</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`, text2 = `Payment Receipt

Hi ${firstName},

Thank you for your purchase!

Item: ${typeLabel}
Business: ${businessName}
Amount: $${dollars}
Reference: ${paymentId}

Questions? Contact support@topranker.io

\u2014 The TopRanker Team`;
  await sendEmail({
    to: email,
    subject: `TopRanker Receipt: $${dollars} \u2014 ${typeLabel}`,
    html,
    text: text2
  });
}
async function sendClaimVerificationCodeEmail(params) {
  let { email, displayName, businessName, code } = params, firstName = displayName.split(" ")[0], html = `
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
          <h2 style="margin:0 0 12px;color:#0D1B2A;font-size:20px;font-weight:700;">Verify Your Ownership</h2>
          <p style="margin:0 0 16px;color:#555;font-size:15px;line-height:1.6;">
            Hi ${firstName}, use the code below to verify your claim for <strong>${businessName}</strong>.
          </p>
          <div style="text-align:center;margin:24px 0;">
            <div style="display:inline-block;background:#0D1B2A;border-radius:12px;padding:16px 32px;">
              <span style="font-size:32px;font-weight:900;letter-spacing:8px;color:#C49A1A;">${code}</span>
            </div>
          </div>
          <p style="margin:0 0 8px;color:#888;font-size:12px;text-align:center;">This code expires in 48 hours.</p>
          <p style="margin:16px 0 0;color:#555;font-size:14px;line-height:1.6;">
            Enter this code on the business page to complete verification and gain access to your owner dashboard.
          </p>
        </td></tr>
        <tr><td style="background:#F7F6F3;padding:16px 24px;text-align:center;">
          <p style="margin:0;color:#999;font-size:11px;">TopRanker \u2014 Trustworthy Rankings</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`, text2 = `Hi ${firstName}, your verification code for ${businessName} is: ${code}. This code expires in 48 hours.`;
  await sendEmail({
    to: email,
    subject: `TopRanker: Verify your claim for ${businessName}`,
    html,
    text: text2
  });
}
async function sendClaimApprovedEmail(params) {
  let { email, displayName, businessName, businessSlug } = params, firstName = displayName.split(" ")[0], html = `
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
          <a href="${config.siteUrl}/business/${businessSlug}/dashboard" style="display:block;text-align:center;background:#0D1B2A;color:#FFFFFF;padding:14px 24px;border-radius:12px;font-size:16px;font-weight:700;text-decoration:none;">
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
</html>`, text2 = `Hi ${firstName},

Your claim for ${businessName} has been approved! You are now the verified owner.

What you can do now:
- Access your business dashboard with analytics
- Respond to customer ratings
- Display the verified owner badge

View your dashboard: ${config.siteUrl}/business/${businessSlug}/dashboard

\u2014 The TopRanker Team`;
  await sendEmail({
    to: email,
    subject: `Claim approved: ${businessName}`,
    html,
    text: text2
  });
}
async function sendClaimRejectedEmail(params) {
  let { email, displayName, businessName } = params, firstName = displayName.split(" ")[0], html = `
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
              <a href="mailto:support@topranker.io" style="color:#C49A1A;">support@topranker.io</a>
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
</html>`, text2 = `Hi ${firstName},

We were unable to verify your claim for ${businessName} at this time.

If you believe this was in error, please contact us at support@topranker.io with additional verification documents.

\u2014 The TopRanker Team`;
  await sendEmail({
    to: email,
    subject: `Claim update: ${businessName}`,
    html,
    text: text2
  });
}
async function sendVerificationEmail(params) {
  let { email, displayName, token } = params, firstName = displayName.split(" ")[0], verifyUrl = `${config.siteUrl}/verify-email?token=${token}`, html = `
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
</html>`, text2 = `Hi ${firstName},

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
  let { email, displayName, token } = params, firstName = displayName.split(" ")[0], resetUrl = `${config.siteUrl}/reset-password?token=${token}`, html = `
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
</html>`, text2 = `Hi ${firstName},

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
  let { email, displayName, referralCode, invitedBy } = params, firstName = displayName.split(" ")[0], joinUrl = `${config.siteUrl}/join?ref=${encodeURIComponent(referralCode)}`, inviteContext = invitedBy ? `${invitedBy} thinks you'd be a great addition to our trust network.` : "You've been selected as one of our first 25 beta testers.", html = `
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
</html>`, text2 = `Hi ${firstName},

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
  await sendEmail({
    to: "admin@topranker.io",
    subject: `New claim: ${params.businessName} by ${params.claimantName}`,
    html: `<p>New business claim submitted.</p>
      <ul>
        <li><strong>Business:</strong> ${params.businessName}</li>
        <li><strong>Claimant:</strong> ${params.claimantName} (${params.claimantEmail})</li>
      </ul>
      <p>Review at: ${config.siteUrl}/admin</p>`,
    text: `New claim: ${params.businessName} by ${params.claimantName} (${params.claimantEmail})`
  });
}
var emailLog, RESEND_API_KEY, FROM_ADDRESS, init_email = __esm({
  "server/email.ts"() {
    "use strict";
    init_logger();
    init_email_tracking();
    init_config();
    emailLog = log.tag("Email"), RESEND_API_KEY = config.resendApiKey || "", FROM_ADDRESS = config.emailFrom;
  }
});

// server/stripe-webhook.ts
var stripe_webhook_exports = {};
__export(stripe_webhook_exports, {
  handleStripeWebhook: () => handleStripeWebhook,
  processStripeEvent: () => processStripeEvent
});
function verifyAndParseEvent(req) {
  let secret = config.stripeWebhookSecret, sig = req.headers["stripe-signature"];
  if (secret && sig)
    try {
      return __require("stripe")(config.stripeSecretKey).webhooks.constructEvent(req.body, sig, secret);
    } catch (err) {
      return whLog.error(`Signature verification failed: ${err.message}`), null;
    }
  try {
    return typeof req.body == "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return null;
  }
}
async function processSubscriptionEvent(event) {
  let obj = event.data.object, businessId = (obj.metadata || {}).businessId;
  if (!businessId)
    return whLog.warn(`Subscription event ${event.type} missing businessId in metadata`), { updated: !1 };
  let { updateBusinessSubscription: updateBusinessSubscription2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
  if (event.type === "checkout.session.completed") {
    let subscriptionId = obj.subscription, customerId = obj.customer;
    if (subscriptionId && customerId)
      return await updateBusinessSubscription2(businessId, {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus: "active"
      }), whLog.info(`Subscription activated for business ${businessId}: ${subscriptionId}`), { updated: !0 };
  }
  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.created") {
    let status = obj.status, periodEnd = obj.current_period_end, mappedStatus = obj.cancel_at_period_end ? "cancelled" : status === "active" ? "active" : status === "past_due" ? "past_due" : status === "canceled" ? "cancelled" : status === "trialing" ? "trialing" : "none";
    return await updateBusinessSubscription2(businessId, {
      subscriptionStatus: mappedStatus,
      subscriptionPeriodEnd: periodEnd ? new Date(periodEnd * 1e3) : void 0
    }), whLog.info(`Subscription updated for business ${businessId}: ${mappedStatus}`), { updated: !0 };
  }
  return event.type === "customer.subscription.deleted" ? (await updateBusinessSubscription2(businessId, {
    subscriptionStatus: "cancelled",
    stripeSubscriptionId: null
  }), whLog.info(`Subscription cancelled for business ${businessId}`), { updated: !0 }) : event.type === "invoice.payment_failed" ? (await updateBusinessSubscription2(businessId, { subscriptionStatus: "past_due" }), whLog.info(`Subscription past_due for business ${businessId}`), { updated: !0 }) : { updated: !1 };
}
async function processStripeEvent(event) {
  if (SUBSCRIPTION_EVENTS.has(event.type))
    return processSubscriptionEvent(event);
  let newStatus = STATUS_MAP[event.type];
  if (!newStatus)
    return whLog.info(`Ignoring event type: ${event.type}`), { updated: !1 };
  let obj = event.data.object, paymentIntentId = event.type === "charge.refunded" && obj.payment_intent || obj.id;
  whLog.info(`Processing ${event.type} for ${paymentIntentId} \u2192 ${newStatus}`);
  let updated = await updatePaymentStatusByStripeId(paymentIntentId, newStatus);
  if (updated || whLog.warn(`No payment record found for PI: ${paymentIntentId}`), event.type === "payment_intent.succeeded") {
    let metadata = obj.metadata || {};
    if (metadata.type === "challenger_entry" && metadata.challengerId)
      try {
        let { createChallenge: createChallenge2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), { getBusinessById: getBusinessById2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), challengerBiz = await getBusinessById2(metadata.challengerId);
        if (challengerBiz) {
          let { getLeaderboard: getLeaderboard2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), defender = (await getLeaderboard2(challengerBiz.city, challengerBiz.category)).find((b) => b.id !== metadata.challengerId);
          defender && (await createChallenge2({
            challengerId: metadata.challengerId,
            defenderId: defender.id,
            category: challengerBiz.category,
            city: challengerBiz.city,
            stripePaymentIntentId: paymentIntentId
          }), whLog.info(`Challenger record created for PI: ${paymentIntentId}`));
        }
      } catch (err) {
        whLog.error(`Failed to create challenger record: ${err.message}`);
      }
  }
  return { updated: !!updated };
}
async function handleStripeWebhook(req, res) {
  let event = verifyAndParseEvent(req);
  if (!event)
    return res.status(400).json({ error: "Invalid webhook payload" });
  let logEntry = await logWebhookEvent({
    source: "stripe",
    eventId: event.id,
    eventType: event.type,
    payload: event
  });
  try {
    let result = await processStripeEvent(event);
    return await markWebhookProcessed(logEntry.id), res.json({ received: !0, ...result });
  } catch (err) {
    return whLog.error(`Failed to update payment status: ${err.message}`), await markWebhookProcessed(logEntry.id, err.message), res.status(500).json({ error: "Internal error processing webhook" });
  }
}
var whLog, STATUS_MAP, SUBSCRIPTION_EVENTS, init_stripe_webhook = __esm({
  "server/stripe-webhook.ts"() {
    "use strict";
    init_logger();
    init_config();
    init_storage();
    whLog = log.tag("StripeWebhook");
    STATUS_MAP = {
      "payment_intent.succeeded": "succeeded",
      "payment_intent.payment_failed": "failed",
      "charge.refunded": "refunded"
    }, SUBSCRIPTION_EVENTS = /* @__PURE__ */ new Set([
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
  SENTRY_DSN ? (errorLog.info("Error tracking initialized with Sentry DSN"), initialized = !0) : errorLog.info("SENTRY_DSN not set \u2014 error tracking uses console fallback"), process.on("unhandledRejection", (reason) => {
    let err = reason instanceof Error ? reason : new Error(String(reason));
    captureServerError(err, { type: "unhandledRejection" }, "fatal");
  }), process.on("uncaughtException", (err) => {
    captureServerError(err, { type: "uncaughtException" }, "fatal"), setTimeout(() => process.exit(1), 2e3);
  });
}
function captureServerError(error, context, severity = "error") {
  let event = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    severity
  };
  recentErrors.unshift(event), recentErrors.length > MAX_RECENT_ERRORS && (recentErrors.length = MAX_RECENT_ERRORS), initialized && SENTRY_DSN ? errorLog.error(JSON.stringify({
    sentry: !0,
    ...event
  })) : errorLog.error(`${severity}: ${error.message}`, context);
}
function errorHandlerMiddleware(err, req, res, _next) {
  let userId = req.user?.id, route = `${req.method} ${req.route?.path || req.path}`;
  captureServerError(err, {
    route,
    userId,
    query: req.query,
    ip: req.ip
  }), res.headersSent || res.status(500).json({ error: "Internal server error" });
}
function getRecentServerErrors(limit = 20) {
  return recentErrors.slice(0, limit);
}
function getErrorStats() {
  let oneDayAgo = Date.now() - 864e5;
  return {
    total: recentErrors.length,
    fatal: recentErrors.filter((e) => e.severity === "fatal").length,
    error: recentErrors.filter((e) => e.severity === "error").length,
    warning: recentErrors.filter((e) => e.severity === "warning").length,
    last24h: recentErrors.filter((e) => new Date(e.timestamp).getTime() > oneDayAgo).length
  };
}
var errorLog, SENTRY_DSN, initialized, recentErrors, MAX_RECENT_ERRORS, init_error_tracking = __esm({
  "server/error-tracking.ts"() {
    "use strict";
    init_logger();
    init_config();
    errorLog = log.tag("ErrorTracking"), SENTRY_DSN = config.sentryDsn, initialized = !1, recentErrors = [], MAX_RECENT_ERRORS = 100;
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
  let ua = userAgent.toLowerCase();
  return BOT_AGENTS.some((bot) => ua.includes(bot));
}
function getCached(key2) {
  let entry = cache.get(key2);
  return entry ? Date.now() - entry.timestamp > CACHE_TTL_MS ? (cache.delete(key2), null) : entry.html : null;
}
function setCache(key2, html) {
  if (cache.size >= CACHE_MAX) {
    let firstKey = cache.keys().next().value;
    firstKey && cache.delete(firstKey);
  }
  cache.set(key2, { html, timestamp: Date.now() });
}
function renderHtmlShell(meta) {
  let escapedTitle = escapeHtml(meta.title), escapedDesc = escapeHtml(meta.description), imageTag = meta.image ? `<meta property="og:image" content="${escapeHtml(meta.image)}" />
    <meta name="twitter:image" content="${escapeHtml(meta.image)}" />` : "", jsonLdTag = meta.jsonLd ? `<script type="application/ld+json">${JSON.stringify(meta.jsonLd)}</script>` : "";
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
    let { getDishLeaderboardWithEntries: getDishLeaderboardWithEntries2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), board = await getDishLeaderboardWithEntries2(slug, city);
    if (!board) return null;
    let cityTitle = city.charAt(0).toUpperCase() + city.slice(1), entries = board.entries || [], topNames = entries.slice(0, 3).map((e) => e.businessName).join(", "), jsonLd = {
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
      image: `${SITE_URL}/api/og-image/dish/${slug}?city=${encodeURIComponent(city)}`,
      jsonLd
    });
  } catch (err) {
    return prerenderLog.error(`Dish prerender failed for ${slug}: ${err}`), null;
  }
}
async function prerenderBusiness(slug) {
  try {
    let { getBusinessBySlug: getBusinessBySlug3 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), biz = await getBusinessBySlug3(slug);
    if (!biz) return null;
    let jsonLd = {
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
      image: `${SITE_URL}/api/og-image/business/${slug}`,
      jsonLd
    });
  } catch (err) {
    return prerenderLog.error(`Business prerender failed for ${slug}: ${err}`), null;
  }
}
function prerenderMiddleware(req, res, next) {
  let userAgent = req.headers["user-agent"] || "";
  if (!isBot(userAgent)) {
    next();
    return;
  }
  let path3 = req.path, dishMatch = path3.match(/^\/dish\/([a-z0-9-]+)$/);
  if (dishMatch) {
    let slug = dishMatch[1], city = req.query.city || "dallas", cacheKey = `dish:${slug}:${city}`, cached = getCached(cacheKey);
    if (cached) {
      prerenderLog.info(`Cache HIT: ${cacheKey}`), res.type("text/html").send(cached);
      return;
    }
    prerenderDish(slug, city).then((html) => {
      html ? (setCache(cacheKey, html), prerenderLog.info(`Prerendered: ${cacheKey}`), res.type("text/html").send(html)) : next();
    }).catch(() => next());
    return;
  }
  let bizMatch = path3.match(/^\/business\/([a-z0-9-]+)$/);
  if (bizMatch) {
    let slug = bizMatch[1], cacheKey = `biz:${slug}`, cached = getCached(cacheKey);
    if (cached) {
      prerenderLog.info(`Cache HIT: ${cacheKey}`), res.type("text/html").send(cached);
      return;
    }
    prerenderBusiness(slug).then((html) => {
      html ? (setCache(cacheKey, html), prerenderLog.info(`Prerendered: ${cacheKey}`), res.type("text/html").send(html)) : next();
    }).catch(() => next());
    return;
  }
  next();
}
function invalidatePrerenderCache(type, slug) {
  let prefix = `${type}:${slug}`;
  for (let key2 of cache.keys())
    key2.startsWith(prefix) && (cache.delete(key2), prerenderLog.info(`Cache invalidated: ${key2}`));
}
function getPrerenderCacheStats() {
  return { size: cache.size, maxSize: CACHE_MAX, ttlMs: CACHE_TTL_MS };
}
var prerenderLog, SITE_URL, BOT_AGENTS, CACHE_MAX, CACHE_TTL_MS, cache, init_prerender = __esm({
  "server/prerender.ts"() {
    "use strict";
    init_logger();
    init_config();
    prerenderLog = log.tag("Prerender"), SITE_URL = config.siteUrl, BOT_AGENTS = [
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
    CACHE_MAX = 200, CACHE_TTL_MS = 300 * 1e3, cache = /* @__PURE__ */ new Map();
  }
});

// shared/pricing.ts
var PRICING, init_pricing = __esm({
  "shared/pricing.ts"() {
    "use strict";
    PRICING = {
      challenger: {
        amountCents: 9900,
        displayAmount: "$99",
        label: "Challenger Entry",
        description: "30-day head-to-head business competition",
        refundable: !1,
        type: "one_time"
      },
      dashboardPro: {
        amountCents: 4900,
        displayAmount: "$49/mo",
        label: "Dashboard Pro",
        description: "Advanced analytics and business insights",
        refundable: !0,
        type: "recurring",
        interval: "month"
      },
      featuredPlacement: {
        amountCents: 19900,
        displayAmount: "$199/wk",
        label: "Featured Placement",
        description: "Premium visibility in search and rankings",
        refundable: !0,
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
  let stripeKey = config.stripeSecretKey;
  if (stripeKey)
    try {
      let intent = await __require("stripe")(stripeKey).paymentIntents.create({
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
      throw payLog.error("Stripe error:", err.message), new Error("Payment processing failed");
    }
  return payLog.info(`Mock payment: $${(params.amount / 100).toFixed(2)} | ${params.description} | ${params.customerEmail}`), {
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
  let stripeKey = config.stripeSecretKey;
  if (stripeKey)
    try {
      let stripe = __require("stripe")(stripeKey), customerId = params.stripeCustomerId;
      customerId || (customerId = (await stripe.customers.create({
        email: params.customerEmail,
        metadata: { userId: params.userId, businessId: params.businessId }
      })).id);
      let session2 = await stripe.checkout.sessions.create({
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
      throw payLog.error("Stripe subscription error:", err.message), new Error("Subscription checkout failed");
    }
  return payLog.info(`Mock subscription: $49/mo | Dashboard Pro: ${params.businessName}`), {
    id: `mock_cs_${Date.now()}`,
    url: null,
    status: "succeeded"
  };
}
async function cancelSubscription(stripeSubscriptionId) {
  let stripeKey = config.stripeSecretKey;
  if (stripeKey)
    try {
      return { cancelAtPeriodEnd: (await __require("stripe")(stripeKey).subscriptions.update(stripeSubscriptionId, {
        cancel_at_period_end: !0
      })).cancel_at_period_end };
    } catch (err) {
      throw payLog.error("Stripe cancel error:", err.message), new Error("Subscription cancellation failed");
    }
  return payLog.info(`Mock cancel subscription: ${stripeSubscriptionId}`), { cancelAtPeriodEnd: !0 };
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
var payLog, init_payments2 = __esm({
  "server/payments.ts"() {
    "use strict";
    init_logger();
    init_config();
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
  return config.r2BucketName ? new R2FileStorage() : new LocalFileStorage();
}
var UPLOADS_DIR, LocalFileStorage, R2FileStorage, fileStorage, init_file_storage = __esm({
  "server/file-storage.ts"() {
    "use strict";
    init_logger();
    init_config();
    UPLOADS_DIR = path.resolve(process.cwd(), "public", "uploads"), LocalFileStorage = class {
      ready;
      constructor() {
        this.ready = fs.mkdir(UPLOADS_DIR, { recursive: !0 }).then(() => {
          log.info(`[FileStorage] Local storage ready at ${UPLOADS_DIR}`);
        });
      }
      async upload(key2, data, _contentType) {
        await this.ready;
        let filePath = path.join(UPLOADS_DIR, key2);
        return await fs.mkdir(path.dirname(filePath), { recursive: !0 }), await fs.writeFile(filePath, data), this.getUrl(key2);
      }
      async delete(key2) {
        await this.ready;
        let filePath = path.join(UPLOADS_DIR, key2);
        try {
          await fs.unlink(filePath);
        } catch (err) {
          if (err.code !== "ENOENT") throw err;
        }
      }
      getUrl(key2) {
        return `/uploads/${key2}`;
      }
    }, R2FileStorage = class {
      client;
      // S3Client — lazily typed to avoid hard dep at import time
      bucket;
      publicUrl;
      constructor() {
        let R2_ACCOUNT_ID = config.r2AccountId, R2_ACCESS_KEY_ID = config.r2AccessKeyId, R2_SECRET_ACCESS_KEY = config.r2SecretAccessKey, R2_BUCKET_NAME = config.r2BucketName, R2_PUBLIC_URL = config.r2PublicUrl;
        if (!R2_BUCKET_NAME || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_ACCOUNT_ID)
          throw new Error(
            "[FileStorage] R2 storage requires R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME env vars"
          );
        this.bucket = R2_BUCKET_NAME, this.publicUrl = R2_PUBLIC_URL || `https://${R2_BUCKET_NAME}.r2.dev`;
        let { S3Client } = __require("@aws-sdk/client-s3");
        this.client = new S3Client({
          region: "auto",
          endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
          credentials: {
            accessKeyId: R2_ACCESS_KEY_ID,
            secretAccessKey: R2_SECRET_ACCESS_KEY
          }
        }), log.info(`[FileStorage] R2 storage ready \u2014 bucket: ${this.bucket}`);
      }
      async upload(key2, data, contentType) {
        let { PutObjectCommand } = __require("@aws-sdk/client-s3");
        return await this.client.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: key2,
            Body: data,
            ContentType: contentType
          })
        ), this.getUrl(key2);
      }
      async delete(key2) {
        let { DeleteObjectCommand } = __require("@aws-sdk/client-s3");
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

// server/search-autocomplete.ts
var search_autocomplete_exports = {};
__export(search_autocomplete_exports, {
  buildDishSuggestions: () => buildDishSuggestions,
  editDistance: () => editDistance,
  isFuzzyMatch: () => isFuzzyMatch,
  mergeSuggestions: () => mergeSuggestions,
  scoreSuggestion: () => scoreSuggestion
});
function editDistance(a, b) {
  let la = a.length, lb = b.length;
  if (la === 0) return lb;
  if (lb === 0) return la;
  let dp = Array.from({ length: la + 1 }, () => Array(lb + 1).fill(0));
  for (let i = 0; i <= la; i++) dp[i][0] = i;
  for (let j = 0; j <= lb; j++) dp[0][j] = j;
  for (let i = 1; i <= la; i++)
    for (let j = 1; j <= lb; j++) {
      let cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  return dp[la][lb];
}
function isFuzzyMatch(query, target) {
  let q = query.toLowerCase(), t = target.toLowerCase();
  if (t.startsWith(q) || t.includes(q)) return !0;
  let threshold = q.length >= 4 ? 2 : 1;
  return editDistance(q, t.slice(0, q.length + threshold)) <= threshold;
}
function scoreSuggestion(query, text2, type) {
  let q = query.toLowerCase(), t = text2.toLowerCase(), score = 0;
  return type === "business" ? score += 0 : type === "dish" ? score += 10 : type === "cuisine" ? score += 20 : score += 30, t.startsWith(q) ? score += 0 : t.includes(q) ? score += 5 : score += 10 + editDistance(q, t.slice(0, q.length + 2)), score;
}
function mergeSuggestions(suggestions, limit = 8) {
  let seen = /* @__PURE__ */ new Set(), unique2 = [];
  for (let s of suggestions) {
    let key2 = `${s.type}:${s.id}`;
    seen.has(key2) || (seen.add(key2), unique2.push(s));
  }
  return unique2.sort((a, b) => (a.score ?? 50) - (b.score ?? 50)).slice(0, limit);
}
function buildDishSuggestions(query, dishes2) {
  let q = query.toLowerCase(), results = [];
  for (let dish of dishes2)
    isFuzzyMatch(q, dish.name) && results.push({
      id: `dish-${dish.businessId}-${dish.name}`,
      text: dish.name,
      subtext: `at ${dish.businessName} (${dish.voteCount} votes)`,
      type: "dish",
      slug: dish.businessSlug,
      score: scoreSuggestion(q, dish.name, "dish")
    });
  return results;
}
var init_search_autocomplete = __esm({
  "server/search-autocomplete.ts"() {
    "use strict";
  }
});

// server/push-notifications.ts
var push_notifications_exports = {};
__export(push_notifications_exports, {
  MAX_MESSAGES: () => MAX_MESSAGES,
  MAX_TOKENS_PER_MEMBER: () => MAX_TOKENS_PER_MEMBER,
  clearPushData: () => clearPushData,
  getMemberTokens: () => getMemberTokens,
  getPushStats: () => getPushStats,
  getRecentMessages: () => getRecentMessages2,
  registerPushToken: () => registerPushToken,
  removePushToken: () => removePushToken,
  sendBulkPush: () => sendBulkPush,
  sendPushNotification: () => sendPushNotification2
});
import crypto14 from "crypto";
function registerPushToken(memberId, token, platform) {
  tokens.has(memberId) || tokens.set(memberId, []);
  let existing = tokens.get(memberId).find((t) => t.token === token);
  if (existing)
    return existing.lastUsed = (/* @__PURE__ */ new Date()).toISOString(), existing;
  let entry = {
    memberId,
    token,
    platform,
    registeredAt: (/* @__PURE__ */ new Date()).toISOString(),
    lastUsed: (/* @__PURE__ */ new Date()).toISOString()
  }, memberList = tokens.get(memberId);
  if (memberList.length >= MAX_TOKENS_PER_MEMBER) {
    let evicted = memberList.shift();
    evicted && pushLog2.info(`Push token evicted (oldest): ${evicted.platform} for ${memberId}`);
  }
  return memberList.push(entry), pushLog2.info(`Push token registered: ${platform} for ${memberId}`), entry;
}
function removePushToken(memberId, token) {
  let list = tokens.get(memberId);
  if (!list) return !1;
  let idx = list.findIndex((t) => t.token === token);
  return idx === -1 ? !1 : (list.splice(idx, 1), list.length === 0 && tokens.delete(memberId), !0);
}
function getMemberTokens(memberId) {
  return tokens.get(memberId) || [];
}
function sendPushNotification2(memberId, title, body, data) {
  let msg = {
    id: crypto14.randomUUID(),
    memberId,
    title,
    body,
    data,
    status: "queued",
    sentAt: null,
    error: null
  }, memberTokens = tokens.get(memberId);
  return !memberTokens || memberTokens.length === 0 ? (msg.status = "failed", msg.error = "No push tokens registered") : (msg.status = "sent", msg.sentAt = (/* @__PURE__ */ new Date()).toISOString(), pushLog2.info(`Push sent to ${memberId}: ${title}`)), messageLog2.unshift(msg), messageLog2.length > MAX_MESSAGES && messageLog2.pop(), msg;
}
function sendBulkPush(memberIds, title, body, data) {
  let sent = 0, failed = 0;
  for (let id of memberIds)
    sendPushNotification2(id, title, body, data).status === "sent" ? sent++ : failed++;
  return { sent, failed };
}
function getPushStats() {
  let totalTokens = 0;
  for (let list of tokens.values()) totalTokens += list.length;
  return {
    totalTokens,
    uniqueMembers: tokens.size,
    messagesSent: messageLog2.filter((m) => m.status === "sent").length,
    messagesFailed: messageLog2.filter((m) => m.status === "failed").length
  };
}
function getRecentMessages2(limit) {
  return messageLog2.slice(0, limit || 20);
}
function clearPushData() {
  tokens.clear(), messageLog2.length = 0;
}
var pushLog2, tokens, messageLog2, MAX_MESSAGES, MAX_TOKENS_PER_MEMBER, init_push_notifications = __esm({
  "server/push-notifications.ts"() {
    "use strict";
    init_logger();
    pushLog2 = log.tag("PushNotifications"), tokens = /* @__PURE__ */ new Map(), messageLog2 = [], MAX_MESSAGES = 5e3, MAX_TOKENS_PER_MEMBER = 10;
  }
});

// server/search-suggestions.ts
var search_suggestions_exports = {};
__export(search_suggestions_exports, {
  CATEGORY_SUGGESTIONS: () => CATEGORY_SUGGESTIONS,
  buildSuggestionIndex: () => buildSuggestionIndex,
  clearSuggestionIndex: () => clearSuggestionIndex,
  getAllIndexedCities: () => getAllIndexedCities,
  getCitySuggestionCount: () => getCitySuggestionCount,
  getPopularSearches: () => getPopularSearches,
  getSuggestions: () => getSuggestions,
  refreshSuggestionsFromDb: () => refreshSuggestionsFromDb,
  startSuggestionRefresh: () => startSuggestionRefresh,
  stopSuggestionRefresh: () => stopSuggestionRefresh
});
function buildSuggestionIndex(city, businesses2) {
  let suggestions = [];
  for (let biz of businesses2)
    suggestions.push({ text: biz.name, type: "business", city, score: 10 }), biz.neighborhood && !suggestions.some((s) => s.text === biz.neighborhood && s.type === "neighborhood") && suggestions.push({ text: biz.neighborhood, type: "neighborhood", city, score: 5 });
  for (let cat of CATEGORY_SUGGESTIONS)
    suggestions.push({ text: cat, type: "category", city, score: 3 });
  suggestionIndex.set(city, suggestions), suggestLog.info(`Index built for ${city}: ${suggestions.length} suggestions`);
}
function getSuggestions(query, city, limit) {
  let index2 = suggestionIndex.get(city) || [], q = query.toLowerCase();
  return index2.filter((s) => s.text.toLowerCase().includes(q)).sort((a, b) => b.score - a.score).slice(0, limit || 10);
}
function getPopularSearches(city, limit) {
  return (suggestionIndex.get(city) || []).filter((s) => s.type === "business").sort((a, b) => b.score - a.score).slice(0, limit || 5);
}
function getCitySuggestionCount(city) {
  return (suggestionIndex.get(city) || []).length;
}
function getAllIndexedCities() {
  return Array.from(suggestionIndex.keys());
}
function clearSuggestionIndex(city) {
  city ? suggestionIndex.delete(city) : suggestionIndex.clear();
}
async function refreshSuggestionsFromDb() {
  try {
    let { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports)), { businesses: businesses2 } = await Promise.resolve().then(() => (init_schema(), schema_exports)), { sql: sql20 } = await import("drizzle-orm"), cities = (await db2.selectDistinct({ city: businesses2.city }).from(businesses2)).map((r) => r.city).filter(Boolean);
    for (let city of cities) {
      let rows = await db2.select({
        name: businesses2.name,
        category: businesses2.category,
        neighborhood: businesses2.neighborhood
      }).from(businesses2).where(sql20`${businesses2.city} = ${city}`);
      buildSuggestionIndex(city, rows.map((r) => ({
        name: r.name,
        category: r.category,
        neighborhood: r.neighborhood || ""
      })));
    }
    suggestLog.info(`Refreshed suggestions for ${cities.length} cities`);
  } catch (err) {
    suggestLog.error("Failed to refresh suggestions:", err);
  }
}
function startSuggestionRefresh() {
  refreshSuggestionsFromDb(), refreshTimer = setInterval(refreshSuggestionsFromDb, REFRESH_INTERVAL_MS), suggestLog.info(`Suggestion refresh scheduled every ${REFRESH_INTERVAL_MS / 6e4} minutes`);
}
function stopSuggestionRefresh() {
  refreshTimer && (clearInterval(refreshTimer), refreshTimer = null);
}
var suggestLog, suggestionIndex, CATEGORY_SUGGESTIONS, REFRESH_INTERVAL_MS, refreshTimer, init_search_suggestions = __esm({
  "server/search-suggestions.ts"() {
    "use strict";
    init_logger();
    suggestLog = log.tag("SearchSuggestions"), suggestionIndex = /* @__PURE__ */ new Map(), CATEGORY_SUGGESTIONS = [
      "restaurant",
      "cafe",
      "bar",
      "bakery",
      "bbq",
      "pizza",
      "seafood",
      "fine_dining",
      "food_truck",
      "deli",
      "street_food",
      "fast_food"
    ];
    REFRESH_INTERVAL_MS = 1800 * 1e3, refreshTimer = null;
  }
});

// server/notification-frequency.ts
function enqueueNotification(notification) {
  let key2 = `${notification.memberId}:${notification.category}`, existing = queue2.get(key2) || [];
  existing.push(notification), queue2.set(key2, existing), freqLog.info(`Queued notification: member=${notification.memberId.slice(0, 8)} category=${notification.category} (${existing.length} in batch)`);
}
function shouldSendImmediately(frequencyPrefs, category) {
  if (!frequencyPrefs) return !0;
  let freq = frequencyPrefs[category];
  return !freq || freq === "realtime";
}
var freqLog, queue2, HOUR_MS, DAY_MS, init_notification_frequency = __esm({
  "server/notification-frequency.ts"() {
    "use strict";
    init_logger();
    freqLog = log.tag("NotifFreq"), queue2 = /* @__PURE__ */ new Map();
    HOUR_MS = 3600 * 1e3, DAY_MS = 24 * HOUR_MS;
  }
});

// server/notification-triggers-events.ts
function resolveNotificationContent(category, memberId, variables, defaultTitle, defaultBody) {
  let template = getActiveTemplateForCategory(category);
  if (template)
    return applyTemplate(template, variables);
  let abVariant = getNotificationVariant(memberId, category);
  if (abVariant) {
    let title = abVariant.variant.title, body = abVariant.variant.body;
    for (let [key2, val] of Object.entries(variables))
      title = title.replaceAll(`{${key2}}`, val), body = body.replaceAll(`{${key2}}`, val);
    return { title, body };
  }
  return { title: defaultTitle, body: defaultBody };
}
async function onRankingChange(businessId, businessName, oldRank, newRank, city) {
  if (oldRank === newRank || oldRank === 0 || newRank === 0) return 0;
  let direction = newRank < oldRank ? "up" : "down", delta = Math.abs(newRank - oldRank);
  if (delta < 2) return 0;
  try {
    let { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports)), { ratings: ratings6, members: members4 } = await Promise.resolve().then(() => (init_schema(), schema_exports)), { eq: eq35, isNotNull: isNotNull8, and: and21 } = await import("drizzle-orm"), raters = await db2.selectDistinct({
      memberId: ratings6.memberId,
      pushToken: members4.pushToken,
      notificationPrefs: members4.notificationPrefs,
      notificationFrequencyPrefs: members4.notificationFrequencyPrefs
    }).from(ratings6).innerJoin(members4, eq35(ratings6.memberId, members4.id)).where(and21(eq35(ratings6.businessId, businessId), isNotNull8(members4.pushToken))), sent = 0;
    for (let rater of raters) {
      if (!rater.pushToken || (rater.notificationPrefs || {}).rankingChanges === !1) continue;
      let emoji = direction === "up" ? "\u{1F4C8}" : "\u{1F4C9}", { title: abTitle, body: abBody } = resolveNotificationContent(
        "rankingChange",
        String(rater.memberId),
        { emoji, business: businessName, direction, newRank: String(newRank), oldRank: String(oldRank), city, delta: String(delta) },
        `${emoji} ${businessName} moved ${direction}`,
        `Now ranked #${newRank} in ${city} (was #${oldRank})`
      ), freqPrefs = rater.notificationFrequencyPrefs;
      shouldSendImmediately(freqPrefs, "rankingChanges") ? await sendPushNotification([rater.pushToken], abTitle, abBody, { screen: "business", businessId }) : enqueueNotification({ memberId: String(rater.memberId), pushToken: rater.pushToken, title: abTitle, body: abBody, data: { screen: "business", businessId }, category: "rankingChanges", queuedAt: Date.now() }), sent++;
    }
    return triggerLog.info(`Ranking change push: ${businessName} #${oldRank}\u2192#${newRank}, sent to ${sent} raters`), recordPushDelivery("rankingChange", city, raters.length, sent, raters.length - sent), sent;
  } catch (err) {
    return triggerLog.error(`Ranking change push failed: ${businessId}`, err), 0;
  }
}
async function onNewRatingForBusiness(businessId, businessName, ratingMemberId, raterName, score) {
  try {
    let { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports)), { ratings: ratings6, members: members4 } = await Promise.resolve().then(() => (init_schema(), schema_exports)), { eq: eq35, isNotNull: isNotNull8, and: and21, ne: ne2 } = await import("drizzle-orm"), otherRaters = await db2.selectDistinct({
      memberId: ratings6.memberId,
      pushToken: members4.pushToken,
      notificationPrefs: members4.notificationPrefs,
      notificationFrequencyPrefs: members4.notificationFrequencyPrefs
    }).from(ratings6).innerJoin(members4, eq35(ratings6.memberId, members4.id)).where(and21(
      eq35(ratings6.businessId, businessId),
      ne2(ratings6.memberId, ratingMemberId),
      isNotNull8(members4.pushToken)
    )), sent = 0;
    for (let rater of otherRaters) {
      if (!rater.pushToken) continue;
      let prefs = rater.notificationPrefs || {};
      if (prefs.newRatings === !1 || prefs.newRatings === void 0 && prefs.savedBusinessAlerts === !1) continue;
      let { title: nrTitle, body: nrBody } = resolveNotificationContent(
        "newRating",
        String(rater.memberId),
        { business: businessName, rater: raterName, score: score.toFixed(1) },
        `New rating for ${businessName}`,
        `${raterName} gave it a ${score.toFixed(1)}. See how it affects the ranking.`
      ), freqPrefs = rater.notificationFrequencyPrefs;
      shouldSendImmediately(freqPrefs, "newRatings") ? await sendPushNotification([rater.pushToken], nrTitle, nrBody, { screen: "business", businessId }) : enqueueNotification({ memberId: String(rater.memberId), pushToken: rater.pushToken, title: nrTitle, body: nrBody, data: { screen: "business", businessId }, category: "newRatings", queuedAt: Date.now() }), sent++;
    }
    return triggerLog.info(`New rating push: ${businessName} by ${raterName}, sent to ${sent} raters`), recordPushDelivery("newRating", "all", otherRaters.length, sent, otherRaters.length - sent), sent;
  } catch (err) {
    return triggerLog.error(`New rating push failed: ${businessId}`, err), 0;
  }
}
async function sendCityHighlightsPush(city) {
  try {
    let { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports)), { members: members4, rankHistory: rankHistory2, businesses: businesses2 } = await Promise.resolve().then(() => (init_schema(), schema_exports)), { eq: eq35, isNotNull: isNotNull8, and: and21, gte: gte9, desc: desc18 } = await import("drizzle-orm"), oneWeekAgo = new Date(Date.now() - 7 * 864e5).toISOString(), recentChanges = await db2.select({
      businessId: rankHistory2.businessId,
      businessName: businesses2.name,
      oldRank: rankHistory2.previousRank,
      newRank: rankHistory2.rank
    }).from(rankHistory2).innerJoin(businesses2, eq35(rankHistory2.businessId, businesses2.id)).where(and21(eq35(businesses2.city, city), gte9(rankHistory2.createdAt, oneWeekAgo))).orderBy(desc18(rankHistory2.createdAt)).limit(50);
    if (recentChanges.length === 0) return 0;
    let biggestMover = recentChanges[0], biggestDelta = 0;
    for (let change of recentChanges) {
      let delta = Math.abs((change.oldRank || 0) - (change.newRank || 0));
      delta > biggestDelta && (biggestDelta = delta, biggestMover = change);
    }
    if (biggestDelta < 2) return 0;
    let cityUsers = await db2.select({
      id: members4.id,
      pushToken: members4.pushToken,
      notificationPrefs: members4.notificationPrefs,
      notificationFrequencyPrefs: members4.notificationFrequencyPrefs
    }).from(members4).where(and21(eq35(members4.city, city), isNotNull8(members4.pushToken))), sent = 0;
    for (let user of cityUsers) {
      if (!user.pushToken || (user.notificationPrefs || {}).cityAlerts === !1) continue;
      let direction = (biggestMover.newRank || 0) < (biggestMover.oldRank || 0) ? "climbed" : "dropped", { title: chTitle, body: chBody } = resolveNotificationContent(
        "cityHighlights",
        String(user.id),
        { city, business: biggestMover.businessName || "A restaurant", direction, delta: String(biggestDelta) },
        `${city} rankings update`,
        `${biggestMover.businessName} ${direction} ${biggestDelta} spots this week. See full rankings.`
      ), freqPrefs = user.notificationFrequencyPrefs;
      shouldSendImmediately(freqPrefs, "cityAlerts") ? await sendPushNotification([user.pushToken], chTitle, chBody, { screen: "rankings" }) : enqueueNotification({ memberId: String(user.id), pushToken: user.pushToken, title: chTitle, body: chBody, data: { screen: "rankings" }, category: "cityAlerts", queuedAt: Date.now() }), sent++;
    }
    return triggerLog.info(`City highlights push: ${city}, biggest mover: ${biggestMover.businessName}, sent to ${sent} users`), recordPushDelivery("cityHighlights", city, cityUsers.length, sent, cityUsers.length - sent), sent;
  } catch (err) {
    return triggerLog.error(`City highlights push failed: ${city}`, err), 0;
  }
}
function startCityHighlightsScheduler() {
  let now = /* @__PURE__ */ new Date(), dayOfWeek = now.getUTCDay(), daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek, nextMonday = new Date(now);
  nextMonday.setUTCDate(now.getUTCDate() + daysUntilMonday), nextMonday.setUTCHours(11, 0, 0, 0), nextMonday <= now && nextMonday.setUTCDate(nextMonday.getUTCDate() + 7);
  let msUntilFirst = nextMonday.getTime() - now.getTime();
  triggerLog.info(`City highlights scheduler: first run in ${Math.round(msUntilFirst / 36e5)}h`);
  async function runCityHighlights() {
    try {
      let { getActiveCities: getActiveCities2, getBetaCities: getBetaCities2 } = await Promise.resolve().then(() => (init_city_config(), city_config_exports)), cities = [...getActiveCities2(), ...getBetaCities2()], totalSent = 0;
      for (let city of cities) {
        let sent = await sendCityHighlightsPush(city);
        totalSent += sent;
      }
      triggerLog.info(`City highlights completed: ${totalSent} pushes across ${cities.length} cities`);
    } catch (err) {
      triggerLog.error("City highlights scheduler error:", err);
    }
  }
  return setTimeout(() => {
    runCityHighlights(), setInterval(runCityHighlights, 6048e5);
  }, msUntilFirst);
}
var triggerLog, init_notification_triggers_events = __esm({
  "server/notification-triggers-events.ts"() {
    "use strict";
    init_push();
    init_push_analytics();
    init_push_ab_testing();
    init_notification_frequency();
    init_notification_templates();
    init_logger();
    triggerLog = log.tag("NotifyTrigger");
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
  sendRatingReminderPush: () => sendRatingReminderPush,
  sendWeeklyDigestPush: () => sendWeeklyDigestPush,
  startCityHighlightsScheduler: () => startCityHighlightsScheduler,
  startRatingReminderScheduler: () => startRatingReminderScheduler,
  startWeeklyDigestScheduler: () => startWeeklyDigestScheduler
});
async function onTierUpgrade(memberId, pushToken, newTier) {
  if (pushToken)
    try {
      let { getMemberById: getMemberById2 } = await Promise.resolve().then(() => (init_members(), members_exports));
      if (((await getMemberById2(memberId))?.notificationPrefs || {}).tierUpgrades === !1) return;
      await sendPushNotification(
        [pushToken],
        "You've been promoted!",
        `Your credibility reached ${newTier} tier. Your ratings now carry more weight.`,
        { screen: "profile", type: "tierUpgrade" }
      ), triggerLog2.info(`Tier upgrade push sent: ${memberId} \u2192 ${newTier}`);
    } catch (err) {
      triggerLog2.error(`Tier upgrade push failed: ${memberId}`, err);
    }
}
async function onClaimDecision(memberId, pushToken, businessName, approved) {
  if (pushToken)
    try {
      let { getMemberById: getMemberById2 } = await Promise.resolve().then(() => (init_members(), members_exports));
      if (((await getMemberById2(memberId))?.notificationPrefs || {}).claimUpdates === !1) return;
      approved ? await sendPushNotification(
        [pushToken],
        `Claim approved: ${businessName}`,
        "You're now the verified owner. Access your dashboard to see analytics.",
        { screen: "business", type: "claimDecision" }
      ) : await sendPushNotification(
        [pushToken],
        `Claim update: ${businessName}`,
        "Your claim could not be verified. Contact support for next steps.",
        { screen: "profile", type: "claimDecision" }
      ), triggerLog2.info(`Claim decision push sent: ${memberId}, approved=${approved}`);
    } catch (err) {
      triggerLog2.error(`Claim decision push failed: ${memberId}`, err);
    }
}
async function sendWeeklyDigestPush() {
  try {
    let { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports)), { members: members4 } = await Promise.resolve().then(() => (init_schema(), schema_exports)), { isNotNull: isNotNull8 } = await import("drizzle-orm"), usersWithTokens = await db2.select({
      id: members4.id,
      pushToken: members4.pushToken,
      displayName: members4.displayName,
      notificationPrefs: members4.notificationPrefs,
      selectedCity: members4.selectedCity
    }).from(members4).where(isNotNull8(members4.pushToken)), sent = 0;
    for (let user of usersWithTokens) {
      if (!user.pushToken || (user.notificationPrefs || {}).weeklyDigest === !1) continue;
      let firstName = (user.displayName || "").split(" ")[0] || "there", city = user.selectedCity || "your city", abVariant = getNotificationVariant(String(user.id), "weeklyDigest"), title = abVariant ? abVariant.variant.title.replace("{city}", city).replace("{firstName}", firstName) : "Your weekly rankings update", body = abVariant ? abVariant.variant.body.replace("{firstName}", firstName).replace("{city}", city) : `Hey ${firstName}, check what's changed in your city's rankings this week.`;
      await sendPushNotification(
        [user.pushToken],
        title,
        body,
        { screen: "search", ...abVariant ? { experimentId: abVariant.experimentId, variant: abVariant.variant.name } : {} }
      ), sent++;
    }
    return triggerLog2.info(`Weekly digest push sent to ${sent} users`), recordPushDelivery("weeklyDigest", "all", usersWithTokens.length, sent, usersWithTokens.length - sent), sent;
  } catch (err) {
    return triggerLog2.error("Weekly digest push failed:", err), 0;
  }
}
function startWeeklyDigestScheduler() {
  let now = /* @__PURE__ */ new Date(), dayOfWeek = now.getUTCDay(), daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek, nextMonday = new Date(now);
  nextMonday.setUTCDate(now.getUTCDate() + daysUntilMonday), nextMonday.setUTCHours(10, 0, 0, 0), nextMonday <= now && nextMonday.setUTCDate(nextMonday.getUTCDate() + 7);
  let msUntilFirst = nextMonday.getTime() - now.getTime();
  return triggerLog2.info(`Weekly digest scheduler: first run in ${Math.round(msUntilFirst / 36e5)}h`), setTimeout(() => {
    sendWeeklyDigestPush(), setInterval(sendWeeklyDigestPush, 6048e5);
  }, msUntilFirst);
}
async function sendRatingReminderPush() {
  try {
    let { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports)), { members: members4, ratings: ratings6, businesses: businesses2 } = await Promise.resolve().then(() => (init_schema(), schema_exports)), { isNotNull: isNotNull8, sql: sql20, desc: desc18 } = await import("drizzle-orm"), twoDaysAgo = new Date(Date.now() - 2 * 864e5).toISOString(), sevenDaysAgo = new Date(Date.now() - 7 * 864e5).toISOString(), usersWithActivity = await db2.select({
      id: members4.id,
      pushToken: members4.pushToken,
      displayName: members4.displayName,
      notificationPrefs: members4.notificationPrefs,
      selectedCity: members4.selectedCity,
      recentRatingCount: sql20`count(CASE WHEN ${ratings6.createdAt} > ${sevenDaysAgo} THEN 1 END)`.as("recentRatingCount"),
      lastRatedAt: sql20`max(${ratings6.createdAt})`.as("lastRatedAt")
    }).from(members4).leftJoin(
      ratings6,
      sql20`${ratings6.memberId} = ${members4.id}`
    ).where(isNotNull8(members4.pushToken)).groupBy(members4.id), sent = 0;
    for (let user of usersWithActivity) {
      if (!user.pushToken || (user.notificationPrefs || {}).ratingReminders === !1 || user.recentRatingCount > 0) continue;
      let firstName = (user.displayName || "").split(" ")[0] || "there", city = user.selectedCity || "your city", title, body, screen = "search", lastRatedDate = user.lastRatedAt ? new Date(user.lastRatedAt) : null, daysSinceLastRating = lastRatedDate ? Math.floor((Date.now() - lastRatedDate.getTime()) / 864e5) : null;
      if (daysSinceLastRating !== null && daysSinceLastRating <= 14) {
        let lastRating = await db2.select({ businessName: businesses2.name, businessSlug: businesses2.slug }).from(ratings6).innerJoin(businesses2, sql20`${businesses2.id} = ${ratings6.businessId}`).where(sql20`${ratings6.memberId} = ${user.id}`).orderBy(desc18(ratings6.createdAt)).limit(1);
        if (lastRating.length > 0) {
          let bizName = lastRating[0].businessName, bizSlug = lastRating[0].businessSlug;
          title = `How was ${bizName}?`, body = daysSinceLastRating <= 3 ? `You visited ${bizName} recently. Rate your experience and help others decide.` : `It's been ${daysSinceLastRating} days since you rated ${bizName}. Discover what's new in ${city}.`, screen = `business/${bizSlug}`;
        } else
          title = "Your neighborhood misses you", body = `Hey ${firstName}, new restaurants and live challenges are waiting in ${city}. Rate your latest visit!`;
      } else
        title = "Your neighborhood misses you", body = `Hey ${firstName}, new restaurants and live challenges are waiting in ${city}. Rate your latest visit!`;
      await sendPushNotification(
        [user.pushToken],
        title,
        body,
        { screen, type: "rating_reminder" }
      ), sent++;
    }
    return triggerLog2.info(`Rating reminder push sent to ${sent} inactive users`), recordPushDelivery("ratingReminder", "all", usersWithActivity.length, sent, usersWithActivity.length - sent), sent;
  } catch (err) {
    return triggerLog2.error("Rating reminder push failed:", err), 0;
  }
}
function startRatingReminderScheduler() {
  let now = /* @__PURE__ */ new Date(), next6pm = new Date(now);
  next6pm.setUTCHours(18, 0, 0, 0), next6pm <= now && next6pm.setUTCDate(next6pm.getUTCDate() + 1);
  let msUntilFirst = next6pm.getTime() - now.getTime();
  return triggerLog2.info(`Rating reminder scheduler: first run in ${Math.round(msUntilFirst / 36e5)}h`), setTimeout(() => {
    sendRatingReminderPush(), setInterval(sendRatingReminderPush, 864e5);
  }, msUntilFirst);
}
var triggerLog2, init_notification_triggers = __esm({
  "server/notification-triggers.ts"() {
    "use strict";
    init_push();
    init_push_analytics();
    init_push_ab_testing();
    init_logger();
    init_notification_triggers_events();
    triggerLog2 = log.tag("NotifyTrigger");
  }
});

// server/google-places-import.ts
var google_places_import_exports = {};
__export(google_places_import_exports, {
  autoImportGooglePlaces: () => autoImportGooglePlaces
});
import { eq as eq33 } from "drizzle-orm";
async function autoImportGooglePlaces() {
  if (!config.googleMapsApiKey) {
    log.tag("GoogleImport").info("No Google Maps API key \u2014 skipping auto-import");
    return;
  }
  if ((await db.select({ id: businesses.id }).from(businesses).where(eq33(businesses.dataSource, "google_bulk_import")).limit(1)).length > 0) {
    log.tag("GoogleImport").info("Google Places data already imported \u2014 skipping");
    return;
  }
  log.tag("GoogleImport").info("Starting auto-import of real Google Places data...");
  let totalImported = 0;
  for (let { city, query } of IMPORT_QUERIES)
    try {
      let places = await searchNearbyRestaurants(city, "restaurant", 20);
      if (places.length === 0) continue;
      let importData = places.map((p) => ({
        placeId: p.placeId,
        name: p.name,
        address: p.address,
        city,
        category: normalizeCategory(p.types),
        lat: p.lat,
        lng: p.lng,
        googleRating: p.rating,
        priceRange: p.priceLevel || "$$"
      })), result = await bulkImportBusinesses(importData);
      if (totalImported += result.imported, result.imported > 0) {
        log.tag("GoogleImport").info(`${city}: imported ${result.imported} restaurants`);
        for (let r of result.results)
          if (r.status === "imported") {
            let match = importData.find((d) => d.name === r.name);
            if (match) {
              let [biz] = await db.select({ id: businesses.id }).from(businesses).where(eq33(businesses.googlePlaceId, match.placeId));
              biz && await fetchAndStorePhotos(biz.id, match.placeId).catch(() => {
              });
            }
          }
      }
      await new Promise((resolve2) => setTimeout(resolve2, 500));
    } catch (err) {
      log.tag("GoogleImport").error(`Failed for "${query}": ${err.message}`);
    }
  log.tag("GoogleImport").info(`Auto-import complete: ${totalImported} restaurants imported`);
}
var IMPORT_QUERIES, init_google_places_import = __esm({
  "server/google-places-import.ts"() {
    "use strict";
    init_config();
    init_logger();
    init_db();
    init_schema();
    init_google_places();
    init_businesses();
    IMPORT_QUERIES = [
      { city: "Irving", query: "Indian restaurants in Irving TX" },
      { city: "Irving", query: "best restaurants in Irving TX" },
      { city: "Plano", query: "Indian restaurants in Plano TX" },
      { city: "Plano", query: "best restaurants in Plano TX" },
      { city: "Frisco", query: "Indian restaurants in Frisco TX" },
      { city: "Dallas", query: "Indian restaurants in Dallas TX" },
      { city: "Dallas", query: "best biryani in Dallas TX" },
      { city: "Dallas", query: "best restaurants in Dallas TX" }
    ];
  }
});

// server/email-drip.ts
async function sendEmail2(to, subject, html, text2) {
  dripLog.info(`Sending drip: ${to} | ${subject}`), await sendEmail({ to, subject, html, text: text2 });
}
function getDripStepForDay(daysSinceSignup) {
  return DRIP_SEQUENCE.find((s) => s.day === daysSinceSignup);
}
async function sendDay2Email(params) {
  let { email, displayName, city } = params, firstName = displayName.split(" ")[0], html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F7F6F3;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F3;padding:40px 20px;">
  <tr><td align="center"><table width="100%" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;">
  ${BRAND_HEADER}
  <tr><td style="padding:24px;">
    <h2 style="margin:0 0 8px;color:#0D1B2A;font-size:20px;">Top 5 near you, ${firstName}</h2>
    <p style="color:#555;font-size:14px;line-height:1.5;">You've been exploring ${city}'s rankings for 2 days now. Have you checked out the top spots in your neighborhood?</p>
    <a href="${config.siteUrl}" style="display:block;text-align:center;background:#0D1B2A;color:#fff;padding:12px;border-radius:10px;font-weight:700;text-decoration:none;margin-top:16px;">See ${city}'s Top 5</a>
  </td></tr>
  ${BRAND_FOOTER}
  </table></td></tr></table></body></html>`;
  await sendEmail2(email, `Top 5 near you, ${firstName}`, html, `Top 5 restaurants near you in ${city}. Open TopRanker to explore.`);
}
async function sendDay3Email(params) {
  let { email, displayName } = params, firstName = displayName.split(" ")[0], html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F7F6F3;font-family:sans-serif;">
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
    <a href="${config.siteUrl}" style="display:block;text-align:center;background:#C49A1A;color:#fff;padding:12px;border-radius:10px;font-weight:700;text-decoration:none;">Rate Your First Restaurant</a>
  </td></tr>
  ${BRAND_FOOTER}
  </table></td></tr></table></body></html>`;
  await sendEmail2(email, `Your voice is unlocked, ${firstName}!`, html, "You can now rate businesses on TopRanker. Your voice matters.");
}
async function sendDay7Email(params) {
  let { email, displayName, city, ratingsCount, businessesRated } = params, firstName = displayName.split(" ")[0], html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F7F6F3;font-family:sans-serif;">
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
    <a href="${config.siteUrl}" style="display:block;text-align:center;background:#0D1B2A;color:#fff;padding:12px;border-radius:10px;font-weight:700;text-decoration:none;">Keep Rating</a>
  </td></tr>
  ${BRAND_FOOTER}
  </table></td></tr></table></body></html>`;
  await sendEmail2(email, `Your first week, ${firstName}`, html, `Your first week: ${ratingsCount} ratings, ${businessesRated} businesses.`);
}
async function sendDay14Email(params) {
  let { email, displayName, city } = params, firstName = displayName.split(" ")[0], html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F7F6F3;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F6F3;padding:40px 20px;">
  <tr><td align="center"><table width="100%" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;">
  ${BRAND_HEADER}
  <tr><td style="padding:24px;">
    <h2 style="margin:0 0 8px;color:#0D1B2A;font-size:20px;">Live challenges in ${city} \u26A1</h2>
    <p style="color:#555;font-size:14px;line-height:1.5;">${firstName}, the Challenger tab has live head-to-head competitions. Your weighted vote can decide which restaurant claims the #1 spot.</p>
    <a href="${config.siteUrl}" style="display:block;text-align:center;background:#0D1B2A;color:#fff;padding:12px;border-radius:10px;font-weight:700;text-decoration:none;margin-top:16px;">Vote in Live Challenges</a>
  </td></tr>
  ${BRAND_FOOTER}
  </table></td></tr></table></body></html>`;
  await sendEmail2(email, `Live challenges in ${city}`, html, `See live head-to-head challenges in ${city}. Your vote matters.`);
}
async function sendDay30Email(params) {
  let { email, displayName, city, totalRatings, currentTier, credibilityScore } = params, firstName = displayName.split(" ")[0], html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F7F6F3;font-family:sans-serif;">
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
    <a href="${config.siteUrl}" style="display:block;text-align:center;background:#C49A1A;color:#fff;padding:12px;border-radius:10px;font-weight:700;text-decoration:none;margin-top:12px;">View Your Profile</a>
  </td></tr>
  ${BRAND_FOOTER}
  </table></td></tr></table></body></html>`;
  await sendEmail2(email, `Your first month, ${firstName}!`, html, `One month on TopRanker: ${totalRatings} ratings, ${currentTier} tier, ${credibilityScore} cred score.`);
}
var dripLog, DRIP_SEQUENCE, BRAND_HEADER, BRAND_FOOTER, init_email_drip = __esm({
  "server/email-drip.ts"() {
    "use strict";
    init_logger();
    init_email();
    init_config();
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
</td></tr>`, BRAND_FOOTER = `
<tr><td style="padding:16px 24px;border-top:1px solid #E8E6E1;text-align:center;">
  <p style="margin:0;color:#999;font-size:10px;">
    TopRanker \u2014 Trust-weighted rankings<br>
    <a href="${config.siteUrl}/unsubscribe" style="color:#C49A1A;text-decoration:none;">Unsubscribe</a>
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
import { isNotNull as isNotNull6 } from "drizzle-orm";
async function processDripEmails() {
  try {
    let allMembers = await db.select({
      id: members.id,
      email: members.email,
      displayName: members.displayName,
      city: members.city,
      username: members.username,
      joinedAt: members.joinedAt,
      notificationPrefs: members.notificationPrefs
    }).from(members).where(isNotNull6(members.email)), now = Date.now(), sent = 0;
    for (let member of allMembers) {
      if (!member.joinedAt) continue;
      let daysSinceSignup = Math.floor((now - new Date(member.joinedAt).getTime()) / DAY_MS2), step = getDripStepForDay(daysSinceSignup);
      if (!(!step || (member.notificationPrefs || {}).emailDrip === !1))
        try {
          await step.send({
            email: member.email,
            displayName: member.displayName,
            city: member.city,
            username: member.username
          }), dripLog2.info(`Drip "${step.name}" sent to ${member.id} (day ${daysSinceSignup})`), sent++;
        } catch (err) {
          dripLog2.error(`Drip "${step.name}" failed for ${member.id}`, err);
        }
    }
    return dripLog2.info(`Drip run complete: ${sent} emails sent`), sent;
  } catch (err) {
    return dripLog2.error("Drip processing failed:", err), 0;
  }
}
function startDripScheduler() {
  let now = /* @__PURE__ */ new Date(), next9am = new Date(now);
  next9am.setUTCHours(9, 0, 0, 0), next9am <= now && next9am.setUTCDate(next9am.getUTCDate() + 1);
  let msUntilFirst = next9am.getTime() - now.getTime();
  return dripLog2.info(`Drip scheduler: first run in ${Math.round(msUntilFirst / 36e5)}h`), setTimeout(() => {
    processDripEmails(), setInterval(processDripEmails, DAY_MS2);
  }, msUntilFirst);
}
var dripLog2, DAY_MS2, init_drip_scheduler = __esm({
  "server/drip-scheduler.ts"() {
    "use strict";
    init_email_drip();
    init_db();
    init_schema();
    init_logger();
    dripLog2 = log.tag("DripScheduler"), DAY_MS2 = 1440 * 60 * 1e3;
  }
});

// server/email-owner-outreach.ts
async function sendOwnerProUpgradeEmail(params) {
  let { email, businessName, ownerName, totalRatings, weightedScore } = params, firstName = ownerName.split(" ")[0];
  outreachLog.info(`Sending Pro upgrade: ${email} | ${businessName}`);
  let html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F7F6F3;font-family:sans-serif;">
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
    <a href="${config.siteUrl}/business-pro" style="display:block;text-align:center;background:#C49A1A;color:#fff;padding:12px;border-radius:10px;font-weight:700;text-decoration:none;margin-top:16px;">Upgrade to Pro</a>
  </td></tr>
  ${BRAND_FOOTER2}
  </table></td></tr></table></body></html>`, text2 = `Hi ${firstName},

${businessName} has ${totalRatings} ratings with a weighted score of ${weightedScore.toFixed(1)}.

Upgrade to Business Pro ($49/mo) to unlock:
- Rating trends and historical analytics
- Competitor insights and benchmarking
- Featured placement in search results
- Priority support from the TopRanker team

Upgrade now: ${config.siteUrl}/business-pro

\u2014 The TopRanker Team`;
  await sendEmail({
    to: email,
    subject: `Unlock ${businessName}'s full analytics`,
    html,
    text: text2
  });
}
var outreachLog, BRAND_HEADER2, BRAND_FOOTER2, init_email_owner_outreach = __esm({
  "server/email-owner-outreach.ts"() {
    "use strict";
    init_email();
    init_logger();
    init_config();
    outreachLog = log.tag("OwnerOutreach"), BRAND_HEADER2 = `
<tr><td style="background:#0D1B2A;padding:24px;text-align:center;">
  <h1 style="margin:0;color:#C49A1A;font-size:24px;font-weight:900;">TopRanker</h1>
</td></tr>`, BRAND_FOOTER2 = `
<tr><td style="padding:16px 24px;border-top:1px solid #E8E6E1;text-align:center;">
  <p style="margin:0;color:#999;font-size:10px;">
    TopRanker \u2014 Trust-weighted rankings<br>
    <a href="${config.siteUrl}/unsubscribe" style="color:#C49A1A;text-decoration:none;">Unsubscribe</a>
  </p>
</td></tr>`;
  }
});

// server/outreach-history.ts
function key(businessId, templateName) {
  return `${businessId}:${templateName}`;
}
function recordOutreachSent(businessId, templateName) {
  let k = key(businessId, templateName);
  store2.has(k) || store2.set(k, /* @__PURE__ */ new Set());
  let today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  store2.get(k).add(today), historyLog.info(`Recorded outreach: ${templateName} \u2192 business ${businessId} on ${today}`);
}
function hasOutreachBeenSent(businessId, templateName, withinDays) {
  let k = key(businessId, templateName), dates = store2.get(k);
  if (!dates || dates.size === 0) return !1;
  let cutoff = /* @__PURE__ */ new Date();
  cutoff.setDate(cutoff.getDate() - withinDays);
  let cutoffStr = cutoff.toISOString().slice(0, 10);
  for (let d of dates)
    if (d >= cutoffStr) return !0;
  return !1;
}
var historyLog, store2, init_outreach_history = __esm({
  "server/outreach-history.ts"() {
    "use strict";
    init_logger();
    historyLog = log.tag("OutreachHistory"), store2 = /* @__PURE__ */ new Map();
  }
});

// server/outreach-scheduler.ts
var outreach_scheduler_exports = {};
__export(outreach_scheduler_exports, {
  processOwnerOutreach: () => processOwnerOutreach,
  startOutreachScheduler: () => startOutreachScheduler
});
import { eq as eq34, isNotNull as isNotNull7, and as and20 } from "drizzle-orm";
async function processOwnerOutreach() {
  let claimInvites = 0, proUpgrades = 0;
  try {
    let claimCandidates = await db.select({
      id: businesses.id,
      name: businesses.name,
      slug: businesses.slug,
      city: businesses.city,
      totalRatings: businesses.totalRatings,
      rankPosition: businesses.rankPosition
    }).from(businesses).where(
      and20(
        eq34(businesses.isClaimed, !1),
        isNotNull7(businesses.rankPosition)
      )
    );
    for (let biz of claimCandidates)
      biz.totalRatings < 5 || (outreachLog2.info(
        `Claim candidate: ${biz.name} (${biz.slug}) \u2014 ${biz.totalRatings} ratings, rank #${biz.rankPosition} in ${biz.city}`
      ), claimInvites++);
    let proCandidates = await db.select({
      id: businesses.id,
      name: businesses.name,
      ownerId: businesses.ownerId,
      totalRatings: businesses.totalRatings,
      weightedScore: businesses.weightedScore
    }).from(businesses).where(
      and20(
        eq34(businesses.isClaimed, !0),
        isNotNull7(businesses.ownerId),
        eq34(businesses.subscriptionStatus, "none")
      )
    );
    for (let biz of proCandidates)
      if (!(biz.totalRatings < 10 || !biz.ownerId)) {
        if (hasOutreachBeenSent(String(biz.id), "pro_upgrade", 30)) {
          outreachLog2.info(`Skipping Pro upgrade for ${biz.name} \u2014 sent within 30 days`);
          continue;
        }
        try {
          let [owner] = await db.select({ email: members.email, displayName: members.displayName }).from(members).where(eq34(members.id, biz.ownerId));
          if (!owner?.email) continue;
          await sendOwnerProUpgradeEmail({
            email: owner.email,
            businessName: biz.name,
            ownerName: owner.displayName || "Business Owner",
            totalRatings: biz.totalRatings,
            weightedScore: parseFloat(biz.weightedScore ?? "0")
          }), recordOutreachSent(String(biz.id), "pro_upgrade"), proUpgrades++;
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
  let now = /* @__PURE__ */ new Date(), nextWed = new Date(now), daysUntilWed = (3 - now.getUTCDay() + 7) % 7 || 7;
  nextWed.setUTCDate(now.getUTCDate() + daysUntilWed), nextWed.setUTCHours(10, 0, 0, 0), nextWed <= now && nextWed.setUTCDate(nextWed.getUTCDate() + 7);
  let msUntilFirst = nextWed.getTime() - now.getTime();
  return outreachLog2.info(
    `Outreach scheduler: first run in ${Math.round(msUntilFirst / 36e5)}h (next Wed 10am UTC)`
  ), setTimeout(() => {
    processOwnerOutreach(), setInterval(processOwnerOutreach, WEEK_MS);
  }, msUntilFirst);
}
var outreachLog2, DAY_MS3, WEEK_MS, init_outreach_scheduler = __esm({
  "server/outreach-scheduler.ts"() {
    "use strict";
    init_email_owner_outreach();
    init_db();
    init_schema();
    init_logger();
    init_outreach_history();
    outreachLog2 = log.tag("OutreachScheduler"), DAY_MS3 = 1440 * 60 * 1e3, WEEK_MS = 7 * DAY_MS3;
  }
});

// server/index.ts
import express from "express";

// server/routes.ts
import { createServer } from "node:http";

// server/auth.ts
init_db();
init_storage();
init_config();
init_tier_staleness();
init_logger();
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import bcrypt from "bcrypt";
function setupAuth(app2) {
  let PgStore = connectPgSimple(session);
  app2.use(
    session({
      store: new PgStore({
        pool,
        createTableIfMissing: !0,
        // Sprint 794: Explicit session cleanup — prune expired sessions every 15 min
        pruneSessionInterval: 900
        // seconds
      }),
      secret: config.sessionSecret,
      resave: !1,
      saveUninitialized: !1,
      proxy: config.isProduction,
      cookie: {
        maxAge: 720 * 60 * 60 * 1e3,
        httpOnly: !0,
        sameSite: "lax",
        secure: config.isProduction
      }
    })
  ), app2.use(passport.initialize()), app2.use(passport.session()), passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          let member = await getMemberByEmail(email);
          return member ? member.password ? await bcrypt.compare(password, member.password) ? done(null, {
            id: member.id,
            displayName: member.displayName,
            username: member.username,
            email: member.email,
            city: member.city,
            credibilityScore: member.credibilityScore,
            credibilityTier: member.credibilityTier
          }) : done(null, !1, { message: "Invalid email or password" }) : done(null, !1, { message: "This account uses Google sign-in" }) : done(null, !1, { message: "Invalid email or password" });
        } catch (err) {
          return done(err);
        }
      }
    )
  ), passport.serializeUser((user, done) => {
    done(null, user.id);
  }), passport.deserializeUser(async (id, done) => {
    try {
      let member = await getMemberById(id);
      if (!member)
        return done(null, !1);
      let freshTier = checkAndRefreshTier(member.credibilityTier, member.credibilityScore);
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
  let email = data.email.trim().toLowerCase(), username = data.username.trim().toLowerCase(), displayName = data.displayName.trim();
  if (!/^[a-zA-Z0-9_]{2,30}$/.test(username))
    throw new Error("Username must be 2-30 characters: letters, numbers, or underscores");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new Error("Invalid email address");
  if (displayName.length < 1 || displayName.length > 50)
    throw new Error("Display name must be 1-50 characters");
  if (await getMemberByEmail(email)) throw new Error("Email already in use");
  if (await getMemberByUsername(username)) throw new Error("Username already taken");
  let hashedPassword = await bcrypt.hash(data.password, 10);
  return createMember({
    displayName,
    username,
    email,
    password: hashedPassword,
    city: data.city
  });
}
async function authenticateGoogleUser(token) {
  let googleClientId = config.googleClientId;
  if (!googleClientId)
    throw new Error("Google Sign-In is not configured");
  let googleId, email, displayName, avatarUrl, idTokenRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`, { signal: AbortSignal.timeout(1e4) });
  if (idTokenRes.ok) {
    let payload = await idTokenRes.json();
    if (payload.aud !== googleClientId)
      throw new Error("Token audience mismatch");
    googleId = payload.sub, email = payload.email.toLowerCase(), displayName = payload.name || email.split("@")[0], avatarUrl = payload.picture || null;
  } else {
    let userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(1e4)
    });
    if (!userInfoRes.ok)
      throw new Error("Invalid Google token");
    let userInfo = await userInfoRes.json();
    googleId = userInfo.sub, email = userInfo.email.toLowerCase(), displayName = userInfo.name || email.split("@")[0], avatarUrl = userInfo.picture || null;
  }
  let member = await getMemberByAuthId(googleId);
  if (member)
    return member;
  if (member = await getMemberByEmail(email), member) {
    let { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports)), { members: members4 } = await Promise.resolve().then(() => (init_schema(), schema_exports)), { eq: eq35 } = await import("drizzle-orm");
    return await db2.update(members4).set({ authId: googleId, avatarUrl: avatarUrl || member.avatarUrl }).where(eq35(members4.id, member.id)), { ...member, authId: googleId };
  }
  let baseUsername = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20).toLowerCase(), username = baseUsername, suffix = 1;
  for (; await getMemberByUsername(username); )
    username = `${baseUsername}${suffix}`, suffix++;
  return createMember({
    displayName,
    username,
    email,
    authId: googleId,
    avatarUrl: avatarUrl || void 0,
    city: "Dallas"
  });
}
var appleJwksCache = null;
async function getAppleJwks() {
  if (appleJwksCache && Date.now() - appleJwksCache.fetchedAt < 36e5)
    return appleJwksCache.keys;
  let res = await fetch("https://appleid.apple.com/auth/keys", { signal: AbortSignal.timeout(1e4) });
  if (!res.ok) throw new Error("Failed to fetch Apple JWKS");
  return appleJwksCache = { keys: (await res.json()).keys || [], fetchedAt: Date.now() }, appleJwksCache.keys;
}
async function authenticateAppleUser(identityToken, fullName, clientEmail) {
  let parts = identityToken.split(".");
  if (parts.length !== 3) throw new Error("Invalid Apple identity token");
  let header = JSON.parse(Buffer.from(parts[0], "base64url").toString()), payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
  if (payload.iss !== "https://appleid.apple.com")
    throw new Error("Invalid Apple token issuer");
  if (payload.exp && payload.exp < Date.now() / 1e3)
    throw new Error("Apple token expired");
  try {
    if (!(await getAppleJwks()).find((k) => k.kid === header.kid))
      throw new Error("Apple token key ID not found in JWKS");
    log.tag("AppleAuth").info(`JWKS verification passed for kid=${header.kid}`);
  } catch (err) {
    log.tag("AppleAuth").warn(`JWKS verification skipped: ${err.message}`);
  }
  let appleUserId = `apple_${payload.sub}`, email = (payload.email || clientEmail || "").toLowerCase(), givenName = fullName?.givenName || "", familyName = fullName?.familyName || "", displayName = [givenName, familyName].filter(Boolean).join(" ") || email.split("@")[0] || "User", member = await getMemberByAuthId(appleUserId);
  if (member) return member;
  if (email && (member = await getMemberByEmail(email), member)) {
    let { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports)), { members: members4 } = await Promise.resolve().then(() => (init_schema(), schema_exports)), { eq: eq35 } = await import("drizzle-orm");
    return await db2.update(members4).set({ authId: appleUserId }).where(eq35(members4.id, member.id)), { ...member, authId: appleUserId };
  }
  let baseUsername = (email ? email.split("@")[0] : givenName.toLowerCase() || "user").replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20).toLowerCase(), username = baseUsername, suffix = 1;
  for (; await getMemberByUsername(username); )
    username = `${baseUsername}${suffix}`, suffix++;
  return createMember({
    displayName,
    username,
    email: email || `${appleUserId}@privaterelay.appleid.com`,
    authId: appleUserId,
    city: "Dallas"
  });
}

// server/deploy.ts
init_logger();
init_config();
import { exec } from "child_process";
import * as crypto3 from "crypto";
var deployLog = log.tag("Deploy"), deployStatus = {
  status: "idle",
  startedAt: null,
  completedAt: null,
  commit: null,
  error: null,
  log: []
};
function verifySignature(req) {
  let secret = config.githubWebhookSecret;
  if (!secret) return !0;
  let signature = req.header("x-hub-signature-256");
  if (!signature) return !1;
  let body = req.rawBody, hmac2 = crypto3.createHmac("sha256", secret);
  hmac2.update(body);
  let expected = `sha256=${hmac2.digest("hex")}`;
  return crypto3.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
function runCommand(cmd, cwd) {
  return new Promise((resolve2, reject) => {
    exec(cmd, { cwd, timeout: 3e5 }, (error, stdout, stderr) => {
      let output = (stdout || "") + (stderr || "");
      error ? reject(new Error(`${cmd} failed: ${output}`)) : resolve2(output.trim());
    });
  });
}
async function runDeploy() {
  let cwd = process.cwd();
  deployStatus = {
    status: "deploying",
    startedAt: (/* @__PURE__ */ new Date()).toISOString(),
    completedAt: null,
    commit: null,
    error: null,
    log: []
  };
  let addLog = (msg) => {
    deployLog.info(msg), deployStatus.log.push(`${(/* @__PURE__ */ new Date()).toISOString()} ${msg}`);
  };
  try {
    addLog("Pulling latest from GitHub..."), await runCommand("cp .replit .replit.bak 2>/dev/null || true", cwd), await runCommand("git checkout -- .replit 2>/dev/null || true", cwd), await runCommand("git pull origin main --ff-only", cwd), await runCommand("cp .replit.bak .replit 2>/dev/null || true", cwd), await runCommand("rm -f .replit.bak", cwd), addLog("Git pull complete.");
    let commit = await runCommand("git rev-parse --short HEAD", cwd);
    deployStatus.commit = commit, addLog(`Now at commit: ${commit}`), addLog("Installing dependencies..."), await runCommand(
      "npm install --legacy-peer-deps 2>/dev/null || npm install",
      cwd
    ), addLog("Dependencies installed."), addLog("Building Expo static bundle..."), await runCommand("npm run expo:static:build", cwd), addLog("Expo build complete."), addLog("Building server..."), await runCommand("npm run server:build", cwd), addLog("Server build complete."), deployStatus.status = "success", deployStatus.completedAt = (/* @__PURE__ */ new Date()).toISOString(), addLog("Deploy successful!"), sendNotification(
      `TopRanker deployed! Commit: ${commit}`,
      "Build successful - refresh to see changes."
    );
  } catch (err) {
    deployStatus.status = "failed", deployStatus.completedAt = (/* @__PURE__ */ new Date()).toISOString(), deployStatus.error = err.message, addLog(`Deploy FAILED: ${err.message}`), sendNotification(
      "TopRanker deploy FAILED",
      err.message.slice(0, 200)
    );
  }
}
function sendNotification(title, message) {
  let url = `https://ntfy.sh/${config.ntfyTopic}`;
  fetch(url, {
    method: "POST",
    headers: { Title: title },
    body: message,
    signal: AbortSignal.timeout(5e3)
  }).catch((err) => {
    deployLog.warn(`Notification failed: ${err.message}`);
  });
}
async function handleWebhook(req, res) {
  if (!verifySignature(req))
    return res.status(403).json({ error: "Invalid signature" });
  let event = req.header("x-github-event"), payload = req.body;
  if (event === "ping")
    return res.json({ message: "pong" });
  if (event !== "push")
    return res.json({ message: `Ignored event: ${event}` });
  let branch = payload?.ref;
  if (branch !== "refs/heads/main")
    return res.json({ message: `Ignored branch: ${branch}` });
  if (deployStatus.status === "deploying")
    return res.status(409).json({ message: "Deploy already in progress" });
  runDeploy(), res.json({
    message: "Deploy started",
    commit: payload?.head_commit?.id?.slice(0, 7) || "unknown"
  });
}
async function handleDeployStatus(_req, res) {
  res.json(deployStatus);
}

// server/photos.ts
init_logger();
init_config();
async function handlePhotoProxy(req, res) {
  let ref = req.query.ref;
  if (!ref)
    return res.status(400).json({ error: "Missing ref parameter" });
  if (!ref.startsWith("places/"))
    return res.status(400).json({ error: "Invalid photo reference" });
  let apiKey = config.googleMapsApiKey || "";
  if (!apiKey)
    return res.status(503).json({ error: "Maps API key not configured" });
  let maxWidth = parseInt(req.query.maxwidth) || 600, maxHeight = parseInt(req.query.maxheight) || 400, url = `https://places.googleapis.com/v1/${ref}/media?maxWidthPx=${maxWidth}&maxHeightPx=${maxHeight}&key=${apiKey}`;
  try {
    let upstream = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(1e4)
    });
    if (!upstream.ok) {
      let legacyUrl = `https://maps.googleapis.com/maps/api/place/photo?photoreference=${encodeURIComponent(ref)}&maxwidth=${maxWidth}&key=${apiKey}`, legacyRes = await fetch(legacyUrl, {
        redirect: "follow",
        signal: AbortSignal.timeout(1e4)
      });
      if (!legacyRes.ok)
        return res.status(upstream.status).json({
          error: `Google Places photo fetch failed: ${upstream.status}`
        });
      let contentType2 = legacyRes.headers.get("content-type") || "image/jpeg";
      res.setHeader("Content-Type", contentType2), res.setHeader("Cache-Control", "public, max-age=86400");
      let buffer3 = Buffer.from(await legacyRes.arrayBuffer());
      return res.send(buffer3);
    }
    let contentType = upstream.headers.get("content-type") || "image/jpeg";
    res.setHeader("Content-Type", contentType), res.setHeader("Cache-Control", "public, max-age=86400");
    let buffer2 = Buffer.from(await upstream.arrayBuffer());
    res.send(buffer2);
  } catch (err) {
    return err.name === "TimeoutError" ? res.status(504).json({ error: "Photo fetch timed out" }) : (log.tag("PhotoProxy").error("Error:", err.message), res.status(502).json({ error: "Failed to fetch photo" }));
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
  centurion: { name: "Centurion", description: "Rate 100 businesses", rarity: "epic", color: "#9C27B0", icon: "shield-checkmark" },
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
}, RARITY_COLORS = {
  common: "#8E8E93",
  rare: "#2196F3",
  epic: "#9C27B0",
  legendary: "#C49A1A"
};
function generateBadgeHtml(badgeId, username) {
  let badge = BADGE_META[badgeId], title = badge ? `${badge.name} \u2014 TopRanker Badge` : "TopRanker Badge", description = badge ? `${username ? `@${username} earned` : "Earned"} "${badge.name}" \u2014 ${badge.description}` : "Check out this TopRanker achievement badge!", rarityColor = badge && RARITY_COLORS[badge.rarity] || "#C49A1A", svgImage = badge ? `
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
  `.trim() : "", ogImageDataUri = badge ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgImage)}` : "";
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
  let badgeId = req.params.badgeId, username = req.query.user || null, html = generateBadgeHtml(badgeId, username);
  res.setHeader("Content-Type", "text/html; charset=utf-8"), res.setHeader("Cache-Control", "public, max-age=3600"), res.send(html);
}

// server/og-image.ts
init_logger();
var ogLog = log.tag("OG-Image"), AMBER = "#C49A1A", NAVY = "#0D1B2A", DARK_SURFACE = "#1A2D44";
function escapeXml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function rankEmoji(rank) {
  return rank === 1 ? "\u{1F947}" : rank === 2 ? "\u{1F948}" : rank === 3 ? "\u{1F949}" : `#${rank}`;
}
function generateBusinessSvg(opts) {
  let { name, rank, score, category, city, ratingCount } = opts, displayName = escapeXml(name.length > 32 ? name.slice(0, 30) + "..." : name), displayCategory = escapeXml(category), displayCity = escapeXml(city), rankText = rank <= 3 ? rankEmoji(rank) : `#${rank}`, scoreText = score > 0 ? score.toFixed(1) : "\u2014";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${NAVY}"/>
  <rect x="40" y="40" width="1120" height="550" rx="24" fill="${DARK_SURFACE}"/>
  <!-- Rank badge -->
  <circle cx="600" cy="180" r="70" fill="${AMBER}22" stroke="${AMBER}" stroke-width="4"/>
  <text x="600" y="200" text-anchor="middle" fill="${AMBER}" font-size="48" font-weight="bold" font-family="sans-serif">${rankText}</text>
  <!-- Business name -->
  <text x="600" y="290" text-anchor="middle" fill="#FFFFFF" font-size="40" font-weight="bold" font-family="sans-serif">${displayName}</text>
  <!-- Category + City -->
  <text x="600" y="335" text-anchor="middle" fill="#8E8E93" font-size="22" font-family="sans-serif">${displayCategory} in ${displayCity}</text>
  <!-- Score -->
  <text x="540" y="400" text-anchor="end" fill="${AMBER}" font-size="56" font-weight="bold" font-family="sans-serif">${scoreText}</text>
  <text x="550" y="385" text-anchor="start" fill="#8E8E93" font-size="18" font-family="sans-serif">/5</text>
  <text x="550" y="410" text-anchor="start" fill="#636366" font-size="16" font-family="sans-serif">${ratingCount} rating${ratingCount !== 1 ? "s" : ""}</text>
  <!-- Divider -->
  <line x1="200" y1="440" x2="1000" y2="440" stroke="#2A3D55" stroke-width="1"/>
  <!-- Branding -->
  <text x="600" y="490" text-anchor="middle" fill="${AMBER}" font-size="24" font-weight="bold" font-family="sans-serif">TopRanker</text>
  <text x="600" y="520" text-anchor="middle" fill="#636366" font-size="16" font-family="sans-serif">Trustworthy rankings by real people</text>
  <text x="600" y="555" text-anchor="middle" fill="#4A5568" font-size="14" font-family="sans-serif">topranker.io</text>
</svg>`;
}
function generateDishSvg(opts) {
  let { dishName, city, entryCount, topNames } = opts, displayDish = escapeXml(dishName), displayCity = escapeXml(city), topEntries = topNames.slice(0, 3).map((n, i) => {
    let y = 320 + i * 40, medal = rankEmoji(i + 1), label = escapeXml(n.length > 35 ? n.slice(0, 33) + "..." : n);
    return `<text x="600" y="${y}" text-anchor="middle" fill="#FFFFFF" font-size="22" font-family="sans-serif">${medal} ${label}</text>`;
  }).join(`
  `);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${NAVY}"/>
  <rect x="40" y="40" width="1120" height="550" rx="24" fill="${DARK_SURFACE}"/>
  <!-- Title -->
  <text x="600" y="140" text-anchor="middle" fill="${AMBER}" font-size="22" font-weight="bold" font-family="sans-serif">BEST IN ${displayCity.toUpperCase()}</text>
  <text x="600" y="200" text-anchor="middle" fill="#FFFFFF" font-size="44" font-weight="bold" font-family="sans-serif">Best ${displayDish}</text>
  <text x="600" y="245" text-anchor="middle" fill="#8E8E93" font-size="20" font-family="sans-serif">${entryCount} restaurant${entryCount !== 1 ? "s" : ""} ranked</text>
  <!-- Top entries -->
  ${topEntries}
  <!-- Divider -->
  <line x1="200" y1="460" x2="1000" y2="460" stroke="#2A3D55" stroke-width="1"/>
  <!-- Branding -->
  <text x="600" y="510" text-anchor="middle" fill="${AMBER}" font-size="24" font-weight="bold" font-family="sans-serif">TopRanker</text>
  <text x="600" y="540" text-anchor="middle" fill="#636366" font-size="16" font-family="sans-serif">Trustworthy rankings by real people</text>
  <text x="600" y="570" text-anchor="middle" fill="#4A5568" font-size="14" font-family="sans-serif">topranker.io</text>
</svg>`;
}
async function handleBusinessOgImage(req, res) {
  let slug = req.params.slug;
  try {
    let { getBusinessBySlug: getBusinessBySlug3 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), biz = await getBusinessBySlug3(slug);
    if (!biz)
      return res.status(404).send("Not found");
    let svg = generateBusinessSvg({
      name: biz.name,
      rank: biz.currentRank || 0,
      score: biz.weightedScore || 0,
      category: biz.category || "Restaurant",
      city: biz.city || "Dallas",
      ratingCount: biz.totalRatings || 0
    });
    return res.setHeader("Content-Type", "image/svg+xml"), res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600"), res.send(svg);
  } catch (err) {
    return ogLog.error("Business image failed:", err), res.status(500).send("Error generating image");
  }
}
async function handleDishOgImage(req, res) {
  let slug = req.params.slug, city = req.query.city || "dallas";
  try {
    let { getDishLeaderboardWithEntries: getDishLeaderboardWithEntries2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), board = await getDishLeaderboardWithEntries2(slug, city);
    if (!board)
      return res.status(404).send("Not found");
    let entries = board.entries || [], svg = generateDishSvg({
      dishName: board.dishName,
      city: city.charAt(0).toUpperCase() + city.slice(1),
      entryCount: entries.length,
      topNames: entries.slice(0, 3).map((e) => e.businessName)
    });
    return res.setHeader("Content-Type", "image/svg+xml"), res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600"), res.send(svg);
  } catch (err) {
    return ogLog.error("Dish image failed:", err), res.status(500).send("Error generating image");
  }
}

// server/routes-admin.ts
init_admin();

// server/sanitize.ts
function stripHtml(input) {
  return input.replace(/<[^>]*>/g, "").trim();
}
function sanitizeString(input, maxLength = 500) {
  return typeof input != "string" ? "" : stripHtml(input).slice(0, maxLength).trim();
}
function sanitizeNumber(input, min, max, fallback) {
  let num = Number(input);
  return isNaN(num) ? fallback : Math.min(max, Math.max(min, num));
}
function sanitizeEmail(input) {
  if (typeof input != "string") return "";
  let trimmed = input.toLowerCase().trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? trimmed : "";
}
function sanitizeSlug(input) {
  return typeof input != "string" ? "" : input.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 100);
}

// server/routes-admin.ts
init_storage();
init_google_places();

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
import crypto4 from "crypto";
var alertLog = log.tag("Alerting"), alerts = [], MAX_ALERTS = 200, lastFired = /* @__PURE__ */ new Map(), DEFAULT_RULES = [
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
  let now = Date.now(), cooldown = DEFAULT_RULES.find((r) => r.name === ruleName)?.cooldownMs ?? 6e4, last = lastFired.get(ruleName) ?? 0;
  if (now - last < cooldown)
    return !1;
  lastFired.set(ruleName, now);
  let alert = {
    id: `alert_${crypto4.randomUUID()}`,
    rule: ruleName,
    severity,
    message,
    timestamp: new Date(now).toISOString(),
    acknowledged: !1,
    metadata
  };
  alerts.push(alert), alerts.length > MAX_ALERTS && alerts.splice(0, alerts.length - MAX_ALERTS);
  let icon = severity === "critical" ? "\u{1F534}" : severity === "warning" ? "\u26A0\uFE0F" : "\u2139\uFE0F";
  return alertLog.warn(`${icon} [${severity.toUpperCase()}] ${ruleName}: ${message}`), !0;
}
function getRecentAlerts(limit = 50) {
  return alerts.slice(-limit);
}
function acknowledgeAlert(alertId) {
  let alert = alerts.find((a) => a.id === alertId);
  return alert ? (alert.acknowledged = !0, !0) : !1;
}
function getAlertStats() {
  let bySeverity = { critical: 0, warning: 0, info: 0 };
  for (let a of alerts)
    bySeverity[a.severity]++;
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
var perfLog = log.tag("Perf"), SLOW_THRESHOLD_MS = 500, stats = {
  totalRequests: 0,
  slowRequests: 0,
  avgDurationMs: 0,
  maxDurationMs: 0,
  byRoute: /* @__PURE__ */ new Map()
}, totalDurationMs = 0;
function perfMonitor(req, res, next) {
  let start = performance.now();
  res.on("finish", () => {
    let duration = performance.now() - start, route = `${req.method} ${req.route?.path || req.path}`;
    stats.totalRequests++, totalDurationMs += duration, stats.avgDurationMs = totalDurationMs / stats.totalRequests, stats.maxDurationMs = Math.max(stats.maxDurationMs, duration);
    let routeStats = stats.byRoute.get(route);
    routeStats || (routeStats = { count: 0, totalMs: 0, maxMs: 0 }, stats.byRoute.set(route, routeStats)), routeStats.count++, routeStats.totalMs += duration, routeStats.maxMs = Math.max(routeStats.maxMs, duration), duration > SLOW_THRESHOLD_MS && (stats.slowRequests++, perfLog.warn(`Slow request: ${route} took ${duration.toFixed(0)}ms`), fireAlert("slow_response", `${route} took ${duration.toFixed(0)}ms (threshold: ${SLOW_THRESHOLD_MS}ms)`, "warning", { route, duration: Math.round(duration) }));
    let heapMB = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    heapMB > 512 && fireAlert("high_memory", `Heap usage: ${heapMB}MB exceeds 512MB threshold`, "warning", { heapMB }), res.headersSent || res.setHeader("Server-Timing", `total;dur=${duration.toFixed(1)}`);
  }), next();
}
function getPerformanceValidation() {
  let avgBudget = BUDGETS.find((b) => b.metric === "api_response_avg")?.budget ?? 200, maxBudget = BUDGETS.find((b) => b.metric === "api_response_max")?.budget ?? 2e3, slowBudget = BUDGETS.find((b) => b.metric === "slow_request_rate")?.budget ?? 5, checks = [
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
  let routes = Array.from(stats.byRoute.entries()).map(([route, s]) => ({
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
init_config();
function wrapAsync(fn) {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      if (log.error(`Unhandled route error: ${req.method} ${req.path}`, err), !res.headersSent) {
        let message = config.isProduction ? "Internal Server Error" : err.message || "Internal Server Error";
        res.status(500).json({ error: message });
      }
    });
  };
}

// server/middleware.ts
init_analytics2();
function requireAuth(req, res, next) {
  if (!req.isAuthenticated())
    return res.status(401).json({ error: "Authentication required" });
  req.user?.id && (recordUserActivity(req.user.id), Promise.resolve().then(() => (init_user_activity(), user_activity_exports)).then(({ recordUserActivityDb: recordUserActivityDb2 }) => recordUserActivityDb2(req.user.id)).catch(() => {
  })), next();
}

// server/routes-admin-analytics.ts
function requireAdmin(req, res, next) {
  if (!isAdminEmail(req.user?.email))
    return res.status(403).json({ error: "Admin access required" });
  next();
}
var dimensionTimingLog = [], MAX_TIMING_LOG = 1e3;
function recordDimensionTiming(entry) {
  dimensionTimingLog.push({ ...entry, ts: Date.now() }), dimensionTimingLog.length > MAX_TIMING_LOG && dimensionTimingLog.splice(0, dimensionTimingLog.length - MAX_TIMING_LOG);
}
function getDimensionTimingAggregates() {
  if (dimensionTimingLog.length === 0)
    return { count: 0, avgQ1Ms: 0, avgQ2Ms: 0, avgQ3Ms: 0, avgReturnMs: 0, avgTotalMs: 0, byVisitType: {} };
  let n = dimensionTimingLog.length, sums = dimensionTimingLog.reduce(
    (acc, e) => ({ q1: acc.q1 + e.q1Ms, q2: acc.q2 + e.q2Ms, q3: acc.q3 + e.q3Ms, ret: acc.ret + e.returnMs, tot: acc.tot + e.totalMs }),
    { q1: 0, q2: 0, q3: 0, ret: 0, tot: 0 }
  ), byType = {}, groups = {};
  dimensionTimingLog.forEach((e) => {
    groups[e.visitType] || (groups[e.visitType] = []), groups[e.visitType].push(e);
  });
  for (let [vt, entries] of Object.entries(groups)) {
    let c = entries.length;
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
    let data = {
      funnel: getFunnelStats(),
      recentEvents: getRecentEvents(20)
    };
    return res.json({ data });
  })), app2.get("/api/admin/analytics/dashboard", requireAuth, requireAdmin, wrapAsync(async (_req, res) => {
    let stats2 = getFunnelStats(), recent = getRecentEvents(50), signups = stats2.signup_completed || 0, pageViews = stats2.page_view || 0, firstRatings = stats2.first_rating || 0, challengerEntries = stats2.challenger_entered || 0, dashboardSubs = stats2.dashboard_pro_subscribed || 0, dashboard = {
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
  })), app2.get("/api/admin/analytics/hourly", requireAuth, requireAdmin, wrapAsync(async (req, res) => {
    let hours = Math.min(168, Math.max(1, parseInt(req.query.hours) || 24));
    return res.json({ data: getHourlyStats(hours) });
  })), app2.get("/api/admin/analytics/daily", requireAuth, requireAdmin, wrapAsync(async (req, res) => {
    let days = Math.min(90, Math.max(1, parseInt(req.query.days) || 7));
    return res.json({ data: getDailyStats(days) });
  })), app2.get("/api/admin/analytics/active-users", requireAuth, requireAdmin, wrapAsync(async (_req, res) => res.json({ data: getActiveUserStats() }))), app2.get("/api/admin/analytics/beta-funnel", requireAuth, requireAdmin, wrapAsync(async (_req, res) => {
    let { getBetaInviteStats: getBetaInviteStats2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), funnel = getBetaConversionFunnel(), inviteStats = await getBetaInviteStats2();
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
  })), app2.post("/api/admin/analytics/purge", requireAuth, requireAdmin, wrapAsync(async (req, res) => {
    let { purgeOldAnalyticsEvents: purgeOldAnalyticsEvents2, DATA_RETENTION_POLICY: DATA_RETENTION_POLICY2 } = await Promise.resolve().then(() => (init_analytics(), analytics_exports)), retentionDays = Math.max(30, parseInt(req.body.retentionDays) || 90), purged = await purgeOldAnalyticsEvents2(retentionDays);
    return res.json({ purged, retentionDays, policy: DATA_RETENTION_POLICY2 });
  })), app2.get("/api/admin/analytics/retention-policy", requireAuth, requireAdmin, wrapAsync(async (_req, res) => {
    let { DATA_RETENTION_POLICY: DATA_RETENTION_POLICY2 } = await Promise.resolve().then(() => (init_analytics(), analytics_exports));
    return res.json({ policy: DATA_RETENTION_POLICY2 });
  })), app2.get("/api/admin/analytics/export", requireAuth, requireAdmin, wrapAsync(async (req, res) => {
    let { getPersistedDailyStats: getPersistedDailyStats2, getPersistedEventCounts: getPersistedEventCounts2, getPersistedDailyStatsExtended: getPersistedDailyStatsExtended2 } = await Promise.resolve().then(() => (init_analytics(), analytics_exports)), days = Math.min(365, Math.max(1, parseInt(req.query.days) || 90)), since = new Date(Date.now() - days * 24 * 60 * 60 * 1e3), detailed = req.query.detailed === "true", format = req.query.format || "json";
    if (detailed) {
      let extendedStats = await getPersistedDailyStatsExtended2(days);
      if (format === "csv") {
        let csvHeader = `date,event,count
`, csvRows = extendedStats.map((d) => `${d.date},${d.event},${d.count}`).join(`
`);
        return res.setHeader("Content-Type", "text/csv"), res.setHeader("Content-Disposition", `attachment; filename=analytics-detailed-${days}d.csv`), res.send(csvHeader + csvRows);
      }
      return res.json({ data: { days, detailed: !0, stats: extendedStats, exportedAt: (/* @__PURE__ */ new Date()).toISOString() } });
    }
    let [dailyStats, eventCounts] = await Promise.all([
      getPersistedDailyStats2(days),
      getPersistedEventCounts2(since)
    ]);
    if (format === "csv") {
      let csvHeader = `date,events
`, csvRows = dailyStats.map((d) => `${d.date},${d.events}`).join(`
`);
      return res.setHeader("Content-Type", "text/csv"), res.setHeader("Content-Disposition", `attachment; filename=analytics-export-${days}d.csv`), res.send(csvHeader + csvRows);
    }
    return res.json({ data: { days, dailyStats, eventCounts, exportedAt: (/* @__PURE__ */ new Date()).toISOString() } });
  })), app2.get("/api/admin/analytics/launch-metrics", requireAuth, requireAdmin, wrapAsync(async (req, res) => {
    let days = Math.min(30, Math.max(1, parseInt(req.query.days) || 7)), daily = getDailyStats(days), funnel = getFunnelStats(), beta = getBetaConversionFunnel(), active = getActiveUserStats(), totalSignups = funnel.signup_completed || 0, totalFirstRatings = funnel.first_rating || 0, totalFifthRatings = funnel.fifth_rating || 0, totalTierUpgrades = funnel.tier_upgrade || 0, activationRate = totalSignups > 0 ? (totalFirstRatings / totalSignups * 100).toFixed(1) + "%" : "N/A", deepEngagementRate = totalFirstRatings > 0 ? (totalFifthRatings / totalFirstRatings * 100).toFixed(1) + "%" : "N/A", tierConversionRate = totalSignups > 0 ? (totalTierUpgrades / totalSignups * 100).toFixed(1) + "%" : "N/A", challengerEntries = funnel.challenger_entered || 0, dashboardSubs = funnel.dashboard_pro_subscribed || 0, featuredPurchases = funnel.featured_purchased || 0, estimatedMRR = challengerEntries * 99 + dashboardSubs * 49 + featuredPurchases * 199;
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
  })), app2.post("/api/analytics/dimension-timing", requireAuth, wrapAsync(async (req, res) => {
    let { q1Ms, q2Ms, q3Ms, returnMs, totalMs, visitType } = req.body;
    return typeof q1Ms != "number" || typeof q2Ms != "number" || typeof q3Ms != "number" || typeof returnMs != "number" ? res.status(400).json({ error: "Invalid timing data" }) : (recordDimensionTiming({
      q1Ms: Math.max(0, Math.round(q1Ms)),
      q2Ms: Math.max(0, Math.round(q2Ms)),
      q3Ms: Math.max(0, Math.round(q3Ms)),
      returnMs: Math.max(0, Math.round(returnMs)),
      totalMs: Math.max(0, Math.round(totalMs || q1Ms + q2Ms + q3Ms + returnMs)),
      visitType: String(visitType || "dine_in")
    }), res.json({ ok: !0 }));
  })), app2.get("/api/admin/analytics/dimension-timing", requireAuth, requireAdmin, wrapAsync(async (_req, res) => res.json({ data: getDimensionTimingAggregates() })));
}

// server/email-ab-testing.ts
init_logger();
import crypto5 from "crypto";
var abLog = log.tag("EmailAB"), experiments = [], assignments = /* @__PURE__ */ new Map(), MAX_EXPERIMENTS = 50;
function createExperiment(name, variants) {
  experiments.length >= MAX_EXPERIMENTS && experiments.shift();
  let experiment = {
    id: crypto5.randomUUID(),
    name,
    variants: variants.map((v) => ({
      ...v,
      id: crypto5.randomUUID(),
      weight: v.weight || 1
    })),
    createdAt: /* @__PURE__ */ new Date(),
    status: "active"
  };
  return experiments.push(experiment), abLog.info(`Created email experiment "${name}" with ${variants.length} variants`), experiment;
}
function getExperiment(experimentId) {
  return experiments.find((e) => e.id === experimentId);
}
function completeExperiment(experimentId, winnerVariantId) {
  let experiment = getExperiment(experimentId);
  experiment && (experiment.status = "completed", experiment.winnerVariantId = winnerVariantId, abLog.info(`Experiment "${experiment.name}" completed \u2014 winner: ${winnerVariantId}`));
}
function getExperimentStats(experimentId) {
  let experiment = getExperiment(experimentId);
  return experiment ? experiment.variants.map((v) => ({
    variantId: v.id,
    name: v.name,
    assignedCount: [...assignments.entries()].filter(([key2, val]) => key2.startsWith(`${experimentId}:`) && val === v.id).length
  })) : null;
}
function getActiveExperiments() {
  return experiments.filter((e) => e.status === "active");
}

// server/routes-admin-experiments.ts
init_email_tracking();
init_push_ab_testing();
init_experiment_tracker();

// server/digest-copy-variants.ts
init_push_ab_testing();
init_logger();
var digestLog = log.tag("DigestCopy"), DIGEST_EXPERIMENT_ID = "weekly-digest-copy-v1", digestCopyVariants = [
  {
    name: "control",
    title: "Your weekly rankings update",
    body: "Hey {firstName}, check what's changed in your city's rankings this week."
  },
  {
    name: "urgency",
    title: "Rankings just shifted \u2014 see who moved",
    body: "{firstName}, this week's rankings are in. Some favorites dropped. See the new order before everyone else."
  },
  {
    name: "curiosity",
    title: "Did your top pick hold its spot?",
    body: "{firstName}, rankings moved this week. Tap to see if your favorite is still #1."
  },
  {
    name: "social",
    title: "Your city is rating \u2014 join the conversation",
    body: "{firstName}, new ratings are shaping your city's leaderboard. See what the community thinks."
  }
];
function seedDigestCopyTest() {
  let existing = getPushExperiment(DIGEST_EXPERIMENT_ID);
  return existing && existing.active ? (digestLog.info("Digest copy test already active"), { created: !1, experimentId: DIGEST_EXPERIMENT_ID }) : (existing && deactivatePushExperiment(DIGEST_EXPERIMENT_ID), createPushExperiment(
    DIGEST_EXPERIMENT_ID,
    "Weekly digest copy test: control vs urgency vs curiosity vs social",
    "weeklyDigest",
    digestCopyVariants
  ) ? (digestLog.info("Digest copy test seeded with 4 variants"), { created: !0, experimentId: DIGEST_EXPERIMENT_ID }) : (digestLog.error("Failed to seed digest copy test"), { created: !1, experimentId: DIGEST_EXPERIMENT_ID }));
}
function stopDigestCopyTest() {
  return deactivatePushExperiment(DIGEST_EXPERIMENT_ID);
}
function getDigestCopyTestStatus() {
  let exp = getPushExperiment(DIGEST_EXPERIMENT_ID);
  return {
    active: exp?.active ?? !1,
    experimentId: DIGEST_EXPERIMENT_ID,
    variantCount: exp?.variants.length ?? 0
  };
}

// server/routes-admin-experiments.ts
function requireAdmin2(req, res, next) {
  if (!req.user || req.user.role !== "admin")
    return res.status(403).json({ error: "Admin access required" });
  next();
}
function registerAdminExperimentRoutes(app2) {
  app2.get("/api/admin/experiments", requireAuth, requireAdmin2, wrapAsync(async (req, res) => {
    let experimentsWithStats = getActiveExperiments().map((exp) => ({
      ...exp,
      stats: getExperimentStats(exp.id)
    }));
    return res.json({
      data: {
        experiments: experimentsWithStats,
        emailStats: getEmailStats()
      }
    });
  })), app2.get("/api/admin/experiments/:id", requireAuth, requireAdmin2, wrapAsync(async (req, res) => {
    let experiment = getExperiment(req.params.id);
    if (!experiment)
      return res.status(404).json({ error: "Experiment not found" });
    let stats2 = getExperimentStats(req.params.id);
    return res.json({ data: { experiment, stats: stats2 } });
  })), app2.post("/api/admin/experiments", requireAuth, requireAdmin2, wrapAsync(async (req, res) => {
    let { name, variants } = req.body;
    if (!name || !variants || !Array.isArray(variants) || variants.length === 0)
      return res.status(400).json({ error: "name and variants[] are required" });
    let experiment = createExperiment(name, variants);
    return res.json({ data: experiment });
  })), app2.post("/api/admin/experiments/:id/complete", requireAuth, requireAdmin2, wrapAsync(async (req, res) => {
    if (!getExperiment(req.params.id))
      return res.status(404).json({ error: "Experiment not found" });
    let { winnerVariantId } = req.body;
    return completeExperiment(req.params.id, winnerVariantId), res.json({ data: { completed: !0 } });
  })), app2.get("/api/admin/push-experiments", requireAuth, requireAdmin2, wrapAsync(async (_req, res) => {
    let withDashboards = listPushExperiments().map((exp) => ({
      ...exp,
      dashboard: computeExperimentDashboard(exp.id)
    }));
    return res.json({ data: withDashboards });
  })), app2.get("/api/admin/push-experiments/:id", requireAuth, requireAdmin2, wrapAsync(async (req, res) => {
    let exp = getPushExperiment(req.params.id);
    return exp ? res.json({ data: { ...exp, dashboard: computeExperimentDashboard(exp.id) } }) : res.status(404).json({ error: "Push experiment not found" });
  })), app2.post("/api/admin/push-experiments", requireAuth, requireAdmin2, wrapAsync(async (req, res) => {
    let { id, description, category, variants } = req.body;
    if (!id || !description || !category || !variants || variants.length < 2)
      return res.status(400).json({ error: "id, description, category, and 2+ variants required" });
    let exp = createPushExperiment(id, description, category, variants);
    return exp ? res.json({ data: exp }) : res.status(409).json({ error: "Experiment already exists or invalid" });
  })), app2.post("/api/admin/push-experiments/:id/deactivate", requireAuth, requireAdmin2, wrapAsync(async (req, res) => deactivatePushExperiment(req.params.id) ? res.json({ data: { deactivated: !0 } }) : res.status(404).json({ error: "Push experiment not found" }))), app2.post("/api/admin/digest-copy-test/seed", requireAuth, requireAdmin2, wrapAsync(async (_req, res) => {
    let result = seedDigestCopyTest();
    return res.json({ data: result });
  })), app2.post("/api/admin/digest-copy-test/stop", requireAuth, requireAdmin2, wrapAsync(async (_req, res) => {
    let stopped = stopDigestCopyTest();
    return res.json({ data: { stopped } });
  })), app2.get("/api/admin/digest-copy-test/status", requireAuth, requireAdmin2, wrapAsync(async (_req, res) => {
    let status = getDigestCopyTestStatus(), dashboard = status.active ? computeExperimentDashboard(status.experimentId) : null;
    return res.json({ data: { ...status, dashboard } });
  }));
}

// server/routes-admin-promotion.ts
init_logger();

// server/city-promotion.ts
init_logger();
init_city_config();

// server/city-engagement.ts
init_logger();
init_db();
init_schema();
init_city_config();
import { sql as sql13, eq as eq20, count as count14 } from "drizzle-orm";
var engLog = log.tag("CityEngagement");
async function getCityEngagement(city) {
  engLog.debug(`Fetching engagement for city: ${city}`);
  let [memberResult] = await db.select({ total: count14() }).from(members).where(eq20(members.city, city)), totalMembers = memberResult?.total ?? 0, [bizResult] = await db.select({ total: count14() }).from(businesses).where(eq20(businesses.city, city)), totalBusinesses = bizResult?.total ?? 0, totalRatings = (await db.execute(sql13`
    SELECT COUNT(r.id)::int AS total
    FROM ratings r
    JOIN businesses b ON r.business_id = b.id
    WHERE b.city = ${city}
  `)).rows[0]?.total ?? 0, avgRatingsPerMember = totalMembers > 0 ? Math.round(totalRatings / totalMembers * 100) / 100 : 0, topCategory = (await db.select({ category: businesses.category, total: count14() }).from(businesses).where(eq20(businesses.city, city)).groupBy(businesses.category).orderBy(sql13`count(*) DESC`).limit(1))[0]?.category ?? "N/A";
  return engLog.info(`City engagement for ${city}: ${totalMembers} members, ${totalBusinesses} businesses, ${totalRatings} ratings`), {
    city,
    totalMembers,
    totalBusinesses,
    totalRatings,
    avgRatingsPerMember,
    topCategory,
    status: isCityActive(city) ? "active" : "beta"
  };
}
async function getAllCityEngagement() {
  let activeCities = getActiveCities(), betaCities = getBetaCities(), allCities = [...activeCities, ...betaCities];
  engLog.info(`Fetching engagement for ${allCities.length} cities (${activeCities.length} active, ${betaCities.length} beta)`);
  let results = await Promise.all(allCities.map((city) => getCityEngagement(city)));
  return results.sort((a, b) => b.totalMembers - a.totalMembers), results;
}

// server/city-promotion.ts
var promoLog = log.tag("CityPromotion"), promotionHistory = [], thresholds = {
  minBusinesses: 50,
  minMembers: 100,
  minRatings: 200,
  minDaysInBeta: 30
};
function getPromotionThresholds() {
  return { ...thresholds };
}
function setPromotionThresholds(t) {
  return thresholds = { ...thresholds, ...t }, promoLog.info("Promotion thresholds updated", thresholds), { ...thresholds };
}
async function getPromotionStatus(city) {
  let config2 = getCityConfig(city);
  if (!config2 || config2.status !== "beta") return null;
  let engagement = await getCityEngagement(city), launchDate = config2.launchDate ? new Date(config2.launchDate) : /* @__PURE__ */ new Date(), daysInBeta = Math.floor(
    (Date.now() - launchDate.getTime()) / (1e3 * 60 * 60 * 24)
  ), missing = [];
  engagement.totalBusinesses < thresholds.minBusinesses && missing.push("businesses"), engagement.totalMembers < thresholds.minMembers && missing.push("members"), engagement.totalRatings < thresholds.minRatings && missing.push("ratings"), daysInBeta < thresholds.minDaysInBeta && missing.push("daysInBeta");
  let pctBiz = Math.min(100, Math.round(engagement.totalBusinesses / thresholds.minBusinesses * 100)), pctMem = Math.min(100, Math.round(engagement.totalMembers / thresholds.minMembers * 100)), pctRat = Math.min(100, Math.round(engagement.totalRatings / thresholds.minRatings * 100)), pctDays = Math.min(100, Math.round(daysInBeta / thresholds.minDaysInBeta * 100)), overall = Math.round((pctBiz + pctMem + pctRat + pctDays) / 4);
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
  let config2 = getCityConfig(city);
  return !config2 || config2.status !== "beta" ? (promoLog.warn(`Cannot promote ${city}: not a beta city`), !1) : (CITY_REGISTRY[city].status = "active", CITY_REGISTRY[city].launchDate = CITY_REGISTRY[city].launchDate || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), promotionHistory.push({
    city,
    promotedAt: (/* @__PURE__ */ new Date()).toISOString(),
    metricsAtPromotion: metrics || { businesses: 0, members: 0, ratings: 0, daysInBeta: 0 }
  }), promoLog.info(`Promoted ${city} from beta to active`), !0);
}
async function getAllBetaPromotionStatus() {
  let { getBetaCities: getBetaCities2 } = await Promise.resolve().then(() => (init_city_config(), city_config_exports)), betaCities = getBetaCities2();
  return (await Promise.all(betaCities.map((c) => getPromotionStatus(c)))).filter((r) => r !== null);
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
      let city = sanitizeString(req.params.city, 100) || "", status = await getPromotionStatus(city);
      if (!status)
        return res.status(404).json({ error: "City not found or not in beta" });
      res.json(status);
    })
  ), app2.post(
    "/api/admin/promote/:city",
    wrapAsync(async (req, res) => {
      let city = sanitizeString(req.params.city, 100) || "", status = await getPromotionStatus(city);
      if (!promoteCity(city, status?.currentMetrics))
        return res.status(400).json({ error: "Cannot promote city" });
      adminPromoLog.info(`Admin promoted ${city}`), res.json({ success: !0, city, newStatus: "active" });
    })
  ), app2.get("/api/admin/promotion-thresholds", (_req, res) => {
    res.json(getPromotionThresholds());
  }), app2.put("/api/admin/promotion-thresholds", (req, res) => {
    let updated = setPromotionThresholds(req.body);
    adminPromoLog.info("Promotion thresholds updated"), res.json(updated);
  }), app2.get(
    "/api/admin/promotion-status",
    wrapAsync(async (_req, res) => {
      let statuses = await getAllBetaPromotionStatus();
      res.json({ cities: statuses, count: statuses.length });
    })
  ), app2.get("/api/admin/promotion-history", (_req, res) => {
    res.json(getPromotionHistory());
  });
}

// server/routes-admin-ratelimit.ts
init_logger();

// server/rate-limit-dashboard.ts
init_logger();
var rlDashLog = log.tag("RateLimitDash"), events2 = [];
function getRateLimitStats(limit) {
  let recentLimit = limit ?? 50, totalRequests = events2.length, blockedRequests = events2.filter((e) => e.blocked).length, blockRate = totalRequests > 0 ? blockedRequests / totalRequests : 0, ipCounts = /* @__PURE__ */ new Map();
  for (let e of events2)
    ipCounts.set(e.ip, (ipCounts.get(e.ip) || 0) + 1);
  let topOffenders = Array.from(ipCounts.entries()).map(([ip, count17]) => ({ ip, count: count17 })).sort((a, b) => b.count - a.count).slice(0, 10), pathCounts = /* @__PURE__ */ new Map();
  for (let e of events2)
    pathCounts.set(e.path, (pathCounts.get(e.path) || 0) + 1);
  let topPaths = Array.from(pathCounts.entries()).map(([path3, count17]) => ({ path: path3, count: count17 })).sort((a, b) => b.count - a.count).slice(0, 10), recentEvents = events2.slice(-recentLimit);
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
  let threshold = minHits ?? 5, blockedEvents = events2.filter((e) => e.blocked), ipData = /* @__PURE__ */ new Map();
  for (let e of blockedEvents) {
    let existing = ipData.get(e.ip);
    !existing || e.timestamp > existing.lastSeen ? ipData.set(e.ip, {
      count: (existing?.count || 0) + 1,
      lastSeen: e.timestamp
    }) : existing.count++;
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
  let incident = incidents.find((i) => i.id === id);
  return incident ? (incident.resolved = !0, abuseLog.info(`Resolved abuse incident ${id} (${incident.pattern} from ${incident.source})`), !0) : !1;
}
function getAbuseStats() {
  let byType = {};
  for (let i of incidents)
    byType[i.pattern] = (byType[i.pattern] || 0) + 1;
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
    adminRLLog.info("Fetching rate limit stats"), res.json(getRateLimitStats());
  }), app2.get("/api/admin/rate-limits/blocked", (req, res) => {
    let minHits = parseInt(req.query.minHits) || 5;
    adminRLLog.info(`Fetching blocked IPs (minHits: ${minHits})`), res.json(getBlockedIPs(minHits));
  }), app2.get("/api/admin/abuse/incidents", (_req, res) => {
    adminRLLog.info("Fetching active abuse incidents"), res.json(getActiveIncidents());
  }), app2.get("/api/admin/abuse/stats", (_req, res) => {
    adminRLLog.info("Fetching abuse stats"), res.json(getAbuseStats());
  }), app2.post("/api/admin/abuse/resolve/:id", (req, res) => {
    if (!resolveIncident(req.params.id))
      return res.status(404).json({ error: "Incident not found" });
    adminRLLog.info(`Resolved abuse incident ${req.params.id}`), res.json({ success: !0 });
  });
}

// server/routes-admin-claims-verification.ts
init_logger();

// server/claim-verification.ts
init_logger();
var claimLog = log.tag("ClaimVerification"), claims = /* @__PURE__ */ new Map();
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
  let claim = claims.get(claimId);
  return !claim || claim.status !== "pending" ? !1 : (claim.status = "rejected", claim.updatedAt = (/* @__PURE__ */ new Date()).toISOString(), claimLog.info(`Claim ${claimId} rejected: ${reason || "no reason"}`), !0);
}
function getClaimStats() {
  let all = Array.from(claims.values());
  return {
    total: all.length,
    pending: all.filter((c) => c.status === "pending").length,
    verified: all.filter((c) => c.status === "verified").length,
    rejected: all.filter((c) => c.status === "rejected").length,
    expired: all.filter((c) => c.status === "expired").length
  };
}

// server/claim-verification-v2.ts
init_logger();

// server/storage/claim-evidences.ts
init_db();
init_schema();
import { eq as eq21 } from "drizzle-orm";
async function getClaimEvidenceByClaimId(claimId) {
  let [row] = await db.select().from(claimEvidence).where(eq21(claimEvidence.claimId, claimId));
  return row ?? null;
}
async function getAllClaimEvidence() {
  return db.select().from(claimEvidence);
}
async function upsertClaimEvidence(data) {
  let [row] = await db.insert(claimEvidence).values({
    claimId: data.claimId,
    documents: data.documents,
    businessNameMatch: data.businessNameMatch,
    addressMatch: data.addressMatch,
    phoneMatch: data.phoneMatch,
    verificationScore: data.verificationScore,
    autoApproved: data.autoApproved,
    reviewNotes: data.reviewNotes,
    scoredAt: /* @__PURE__ */ new Date()
  }).onConflictDoUpdate({
    target: claimEvidence.claimId,
    set: {
      documents: data.documents,
      businessNameMatch: data.businessNameMatch,
      addressMatch: data.addressMatch,
      phoneMatch: data.phoneMatch,
      verificationScore: data.verificationScore,
      autoApproved: data.autoApproved,
      reviewNotes: data.reviewNotes,
      scoredAt: /* @__PURE__ */ new Date()
    }
  }).returning();
  return row ?? null;
}
async function addDocumentToClaimEvidence(claimId, document) {
  let existing = await getClaimEvidenceByClaimId(claimId), docs = existing ? [...existing.documents, document] : [document], [row] = await db.insert(claimEvidence).values({
    claimId,
    documents: docs
  }).onConflictDoUpdate({
    target: claimEvidence.claimId,
    set: { documents: docs }
  }).returning();
  return row ?? null;
}

// server/claim-verification-v2.ts
var claimV2Log = log.tag("ClaimV2"), evidenceStore = /* @__PURE__ */ new Map(), SCORE_WEIGHTS = {
  documentUploaded: 25,
  businessNameMatch: 30,
  addressMatch: 20,
  phoneMatch: 15,
  multipleDocuments: 10
}, AUTO_APPROVE_THRESHOLD = 70;
function computeVerificationScore(hasDocument, businessNameMatch, addressMatch, phoneMatch, documentCount) {
  let score = 0;
  return hasDocument && (score += SCORE_WEIGHTS.documentUploaded), businessNameMatch && (score += SCORE_WEIGHTS.businessNameMatch), addressMatch && (score += SCORE_WEIGHTS.addressMatch), phoneMatch && (score += SCORE_WEIGHTS.phoneMatch), documentCount > 1 && (score += SCORE_WEIGHTS.multipleDocuments), Math.min(score, 100);
}
function shouldAutoApprove(score) {
  return score >= AUTO_APPROVE_THRESHOLD;
}
function addDocumentToEvidence(claimId, document) {
  let evidence = evidenceStore.get(claimId);
  return evidence || (evidence = {
    claimId,
    documents: [],
    businessNameMatch: !1,
    addressMatch: !1,
    phoneMatch: !1,
    verificationScore: 0,
    autoApproved: !1,
    reviewNotes: [],
    scoredAt: (/* @__PURE__ */ new Date()).toISOString()
  }, evidenceStore.set(claimId, evidence)), evidence.documents.push(document), claimV2Log.info(`Document added to claim ${claimId}: ${document.fileName} (${document.documentType})`), addDocumentToClaimEvidence(claimId, document).catch(() => {
  }), evidence;
}
function scoreClaimEvidence(claimId, businessName, claimantName, claimantAddress, businessAddress, claimantPhone, businessPhone) {
  let evidence = evidenceStore.get(claimId) || {
    claimId,
    documents: [],
    businessNameMatch: !1,
    addressMatch: !1,
    phoneMatch: !1,
    verificationScore: 0,
    autoApproved: !1,
    reviewNotes: [],
    scoredAt: (/* @__PURE__ */ new Date()).toISOString()
  }, bizNameLower = businessName.toLowerCase(), claimantLower = claimantName.toLowerCase();
  return evidence.businessNameMatch = bizNameLower.includes(claimantLower) || claimantLower.includes(bizNameLower) || levenshteinSimilar(bizNameLower, claimantLower, 3), claimantAddress && businessAddress && (evidence.addressMatch = normalizeAddress(claimantAddress) === normalizeAddress(businessAddress)), claimantPhone && businessPhone && (evidence.phoneMatch = normalizePhone(claimantPhone) === normalizePhone(businessPhone)), evidence.verificationScore = computeVerificationScore(
    evidence.documents.length > 0,
    evidence.businessNameMatch,
    evidence.addressMatch,
    evidence.phoneMatch,
    evidence.documents.length
  ), evidence.autoApproved = shouldAutoApprove(evidence.verificationScore), evidence.scoredAt = (/* @__PURE__ */ new Date()).toISOString(), evidence.reviewNotes = [], evidence.businessNameMatch && evidence.reviewNotes.push("Business name matches claimant"), evidence.addressMatch && evidence.reviewNotes.push("Address verified"), evidence.phoneMatch && evidence.reviewNotes.push("Phone number matches"), evidence.documents.length > 0 && evidence.reviewNotes.push(`${evidence.documents.length} document(s) uploaded`), evidence.autoApproved && evidence.reviewNotes.push("Auto-approved: score >= threshold"), evidenceStore.set(claimId, evidence), upsertClaimEvidence({
    claimId,
    documents: evidence.documents,
    businessNameMatch: evidence.businessNameMatch,
    addressMatch: evidence.addressMatch,
    phoneMatch: evidence.phoneMatch,
    verificationScore: evidence.verificationScore,
    autoApproved: evidence.autoApproved,
    reviewNotes: evidence.reviewNotes
  }).catch(() => {
  }), claimV2Log.info(`Claim ${claimId} scored: ${evidence.verificationScore}/100, autoApproved=${evidence.autoApproved}`), evidence;
}
function getClaimEvidence(claimId) {
  return evidenceStore.get(claimId) || null;
}
function getAllEvidence() {
  return Array.from(evidenceStore.values());
}
function normalizeAddress(addr) {
  return addr.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}
function normalizePhone(phone) {
  return phone.replace(/[^0-9]/g, "").slice(-10);
}
function levenshteinSimilar(a, b, maxDist) {
  if (Math.abs(a.length - b.length) > maxDist) return !1;
  let la = a.length, lb = b.length, dp = Array.from({ length: la + 1 }, () => Array(lb + 1).fill(0));
  for (let i = 0; i <= la; i++) dp[i][0] = i;
  for (let j = 0; j <= lb; j++) dp[0][j] = j;
  for (let i = 1; i <= la; i++)
    for (let j = 1; j <= lb; j++) {
      let cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  return dp[la][lb] <= maxDist;
}

// server/routes-admin-claims-verification.ts
var adminClaimLog = log.tag("AdminClaimVerify");
function registerAdminClaimVerificationRoutes(app2) {
  app2.get("/api/admin/claims/pending", (_req, res) => {
    res.json(getPendingClaims2());
  }), app2.get("/api/admin/claims/stats", (_req, res) => {
    res.json(getClaimStats());
  }), app2.get("/api/admin/claims/:id", (req, res) => {
    let claim = getClaimStatus(req.params.id);
    if (!claim) return res.status(404).json({ error: "Claim not found" });
    res.json(claim);
  }), app2.get("/api/admin/claims/business/:businessId", (req, res) => {
    res.json(getClaimsByBusiness(req.params.businessId));
  }), app2.post("/api/admin/claims/:id/reject", (req, res) => {
    let reason = sanitizeString(req.body?.reason, 500) || void 0;
    if (!rejectClaim(req.params.id, reason)) return res.status(400).json({ error: "Cannot reject claim" });
    adminClaimLog.info(`Admin rejected claim ${req.params.id}`), res.json({ success: !0 });
  }), app2.post("/api/admin/claims/:id/document", (req, res) => {
    let fileName = sanitizeString(req.body.fileName, 200), fileType = sanitizeString(req.body.fileType, 50), fileSize = Number(req.body.fileSize), documentType = sanitizeString(req.body.documentType, 100);
    if (!fileName || !fileType || !fileSize || !documentType)
      return res.status(400).json({ error: "fileName, fileType, fileSize, documentType required" });
    let evidence = addDocumentToEvidence(req.params.id, {
      fileName,
      fileType,
      fileSize,
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString(),
      documentType
    });
    adminClaimLog.info(`Document uploaded for claim ${req.params.id}: ${fileName}`), res.json({ data: evidence });
  }), app2.post("/api/admin/claims/:id/score", (req, res) => {
    let { businessName, claimantName, claimantAddress, businessAddress, claimantPhone, businessPhone } = req.body;
    if (!businessName || !claimantName)
      return res.status(400).json({ error: "businessName and claimantName required" });
    let evidence = scoreClaimEvidence(
      req.params.id,
      businessName,
      claimantName,
      claimantAddress,
      businessAddress,
      claimantPhone,
      businessPhone
    );
    adminClaimLog.info(`Claim ${req.params.id} scored: ${evidence.verificationScore}/100, auto=${evidence.autoApproved}`), res.json({ data: evidence });
  }), app2.get("/api/admin/claims/:id/evidence", async (req, res) => {
    let evidence = getClaimEvidence(req.params.id);
    if (evidence) return res.json({ data: evidence });
    let dbEvidence = await getClaimEvidenceByClaimId(req.params.id).catch(() => null);
    if (!dbEvidence) return res.status(404).json({ error: "No evidence for this claim" });
    res.json({ data: dbEvidence });
  }), app2.get("/api/admin/claims/evidence/all", async (_req, res) => {
    let memEvidence = getAllEvidence(), dbRows = await getAllClaimEvidence().catch(() => []), merged = /* @__PURE__ */ new Map();
    for (let row of dbRows) merged.set(row.claimId, row);
    for (let ev of memEvidence) merged.set(ev.claimId, ev);
    res.json({ data: Array.from(merged.values()) });
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
  let all = Array.from(reputationCache.values()), avg = all.length > 0 ? all.reduce((sum2, r) => sum2 + r.score, 0) / all.length : 0, byTier = { newcomer: 0, contributor: 0, trusted: 0, expert: 0, authority: 0 };
  for (let r of all) byTier[r.tier]++;
  return { totalScored: all.length, averageScore: Math.round(avg * 100) / 100, byTier };
}

// server/routes-admin-reputation.ts
var adminRepLog = log.tag("AdminReputation");
function registerAdminReputationRoutes(app2) {
  app2.get("/api/admin/reputation/stats", (_req, res) => {
    adminRepLog.info("Fetching reputation stats"), res.json(getReputationStats());
  }), app2.get("/api/admin/reputation/leaderboard", (req, res) => {
    let limit = parseInt(req.query.limit) || 10;
    adminRepLog.info(`Fetching reputation leaderboard (limit: ${limit})`), res.json(getReputationLeaderboard(limit));
  }), app2.get("/api/admin/reputation/:memberId", (req, res) => {
    let { memberId } = req.params;
    adminRepLog.info(`Fetching reputation for member ${memberId}`);
    let reputation = getReputation(memberId);
    if (!reputation)
      return res.status(404).json({ error: "Member reputation not found" });
    res.json(reputation);
  }), app2.get("/api/admin/reputation/tiers", (_req, res) => {
    adminRepLog.info("Fetching tier thresholds"), res.json(getTierThresholds());
  });
}

// server/routes-admin-moderation.ts
init_logger();
init_moderation_queue();
var adminModLog = log.tag("AdminModeration");
function registerAdminModerationRoutes(app2) {
  app2.get("/api/admin/moderation/queue", (req, res) => {
    let limit = parseInt(req.query.limit) || 50;
    adminModLog.info(`Fetching moderation queue (limit: ${limit})`), res.json(getPendingItems(limit));
  }), app2.get("/api/admin/moderation/stats", (_req, res) => {
    adminModLog.info("Fetching moderation stats"), res.json(getQueueStats());
  }), app2.post("/api/admin/moderation/:id/approve", (req, res) => {
    let { id } = req.params, moderatorId = req.user?.id || "admin", note = req.body?.note;
    if (adminModLog.info(`Approving moderation item ${id}`), !approveItem(id, moderatorId, note))
      return res.status(404).json({ error: "Item not found or already resolved" });
    res.json({ success: !0 });
  }), app2.post("/api/admin/moderation/:id/reject", (req, res) => {
    let { id } = req.params, moderatorId = req.user?.id || "admin", note = req.body?.note;
    if (adminModLog.info(`Rejecting moderation item ${id}`), !rejectItem(id, moderatorId, note))
      return res.status(404).json({ error: "Item not found or already resolved" });
    res.json({ success: !0 });
  }), app2.get("/api/admin/moderation/business/:businessId", (req, res) => {
    let { businessId } = req.params;
    adminModLog.info(`Fetching moderation items for business ${businessId}`), res.json(getItemsByBusiness(businessId));
  }), app2.get("/api/admin/moderation/member/:memberId", (req, res) => {
    let { memberId } = req.params;
    adminModLog.info(`Fetching moderation items for member ${memberId}`), res.json(getItemsByMember(memberId));
  }), app2.get("/api/admin/moderation/filtered", (req, res) => {
    let status = req.query.status, contentType = req.query.contentType, limit = parseInt(req.query.limit) || 50, sortByViolations = req.query.sort === "violations";
    adminModLog.info(`Filtered queue: status=${status}, type=${contentType}, sort=${sortByViolations}`), res.json(getFilteredItems({
      status,
      contentType,
      limit,
      sortByViolations
    }));
  }), app2.get("/api/admin/moderation/resolved", (req, res) => {
    let limit = parseInt(req.query.limit) || 50;
    adminModLog.info(`Fetching resolved items (limit: ${limit})`), res.json(getResolvedItems(limit));
  }), app2.post("/api/admin/moderation/bulk-approve", (req, res) => {
    let { ids, note } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0)
      return res.status(400).json({ error: "ids array required" });
    if (ids.length > 100)
      return res.status(400).json({ error: "Maximum 100 items per bulk action" });
    let moderatorId = req.user?.id || "admin";
    adminModLog.info(`Bulk approving ${ids.length} items`);
    let result = bulkApprove(ids, moderatorId, note);
    res.json(result);
  }), app2.post("/api/admin/moderation/bulk-reject", (req, res) => {
    let { ids, note } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0)
      return res.status(400).json({ error: "ids array required" });
    if (ids.length > 100)
      return res.status(400).json({ error: "Maximum 100 items per bulk action" });
    let moderatorId = req.user?.id || "admin";
    adminModLog.info(`Bulk rejecting ${ids.length} items`);
    let result = bulkReject(ids, moderatorId, note);
    res.json(result);
  });
}

// server/routes-admin-ranking.ts
init_logger();

// server/search-ranking-v2.ts
init_logger();
var rankLog = log.tag("SearchRankingV2"), weights = {
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
  return weights = { ...weights, ...w }, rankLog.info("Ranking weights updated", weights), { ...weights };
}
var SEARCH_STOP_WORDS = /* @__PURE__ */ new Set([
  "best",
  "top",
  "good",
  "great",
  "most",
  "popular",
  "famous",
  "in",
  "the",
  "a",
  "of",
  "for",
  "near",
  "around",
  "at"
]);
function parseQueryIntent(query, city) {
  let tokens2 = query.toLowerCase().trim().split(/\s+/).filter((t) => t.length > 0), cityLower = city?.toLowerCase();
  return tokens2.filter((t) => !(SEARCH_STOP_WORDS.has(t) || cityLower && t === cityLower)).join(" ");
}
function dishRelevance(dishNames, query) {
  if (!query || !query.trim() || !dishNames || dishNames.length === 0) return 0;
  let q = query.toLowerCase().trim(), queryTokens = q.split(/\s+/).filter((t) => t.length > 0), bestScore = 0;
  for (let dish of dishNames) {
    let d = dish.toLowerCase();
    if (d === q) return 1;
    if (d.includes(q) || q.includes(d)) {
      bestScore = Math.max(bestScore, 0.8);
      continue;
    }
    for (let token of queryTokens) {
      if (token.length < 3) continue;
      let s = wordScore(d, token);
      s > bestScore && (bestScore = s);
    }
  }
  return bestScore;
}
function levenshtein(a, b, maxDist = 3) {
  if (Math.abs(a.length - b.length) > maxDist) return 1 / 0;
  let m = a.length, n = b.length, dp = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    let rowMin = dp[0];
    for (let j = 1; j <= n; j++) {
      let temp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1]), prev = temp, dp[j] < rowMin && (rowMin = dp[j]);
    }
    if (rowMin > maxDist) return 1 / 0;
  }
  return dp[n];
}
function wordScore(target, token) {
  if (target === token) return 1;
  if (target.startsWith(token)) return 0.8;
  if (target.includes(token)) return 0.6;
  if (token.length >= 4) {
    let dist = levenshtein(target, token, 2);
    if (dist === 1) return 0.3;
    if (dist === 2) return 0.15;
  }
  return 0;
}
function textRelevance(name, query) {
  if (!query || !query.trim()) return 0;
  let q = query.toLowerCase().trim(), n = name.toLowerCase();
  if (n === q) return 1;
  if (n.startsWith(q)) return 0.9;
  if (n.includes(q)) return 0.7;
  let queryTokens = q.split(/\s+/).filter((t) => t.length > 0), nameWords = n.split(/\s+/).filter((w) => w.length > 0);
  if (queryTokens.length === 0 || nameWords.length === 0) return 0;
  let totalScore = 0;
  for (let token of queryTokens) {
    let bestMatch = 0;
    for (let word of nameWords) {
      let score = wordScore(word, token);
      score > bestMatch && (bestMatch = score);
    }
    totalScore += bestMatch;
  }
  return Math.min(totalScore / queryTokens.length, 1);
}
function categoryRelevance(ctx) {
  if (!ctx.query) return 0;
  let tokens2 = ctx.query.toLowerCase().trim().split(/\s+/), best = 0;
  for (let token of tokens2)
    if (!(token.length < 3)) {
      if (ctx.cuisine) {
        let c = ctx.cuisine.toLowerCase();
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
        let cat = ctx.category.toLowerCase();
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
        let nb = ctx.neighborhood.toLowerCase();
        if (nb === token || nb.includes(token)) {
          best = Math.max(best, 0.6);
          continue;
        }
      }
    }
  return best;
}
function ratingVolumeSignal(ratingCount) {
  return !ratingCount || ratingCount <= 0 ? 0 : Math.min(Math.log10(ratingCount) / Math.log10(50), 1);
}
function profileCompleteness(ctx) {
  let score = 0, total = 0;
  return ctx.hasPhotos !== void 0 && (total++, ctx.hasPhotos && score++), ctx.hasHours !== void 0 && (total++, ctx.hasHours && score++), ctx.hasCuisine !== void 0 && (total++, ctx.hasCuisine && score++), ctx.hasDescription !== void 0 && (total++, ctx.hasDescription && score++), ctx.hasActionUrls !== void 0 && (total++, ctx.hasActionUrls && score++), total > 0 ? score / total : 0;
}
function cityMatchBonus(ctx) {
  if (!ctx.city || !ctx.businessCity) return 0;
  let searchCity = ctx.city.toLowerCase().trim(), bizCity = ctx.businessCity.toLowerCase().trim();
  return searchCity === bizCity ? 0.1 : bizCity.includes(searchCity) || searchCity.includes(bizCity) ? 0.05 : 0;
}
function proximitySignal(ctx) {
  if (!ctx.userLat || !ctx.userLng || !ctx.bizLat || !ctx.bizLng) return 0;
  let dist = haversineKm(ctx.userLat, ctx.userLng, ctx.bizLat, ctx.bizLng);
  return dist <= 1 ? 1 : dist <= 3 ? 0.8 - (dist - 1) * 0.15 : dist <= 10 ? 0.5 - (dist - 3) * 0.043 : dist <= 20 ? 0.2 - (dist - 10) * 0.02 : 0;
}
function haversineKm(lat1, lng1, lat2, lng2) {
  let dLat = (lat2 - lat1) * Math.PI / 180, dLng = (lng2 - lng1) * Math.PI / 180, a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function combinedRelevance(name, ctx) {
  let intentQuery = ctx.query ? parseQueryIntent(ctx.query, ctx.city) : ctx.query, intentCtx = { ...ctx, query: intentQuery || ctx.query }, text2 = textRelevance(name, intentCtx.query), category = categoryRelevance(intentCtx), dish = dishRelevance(ctx.dishNames, intentCtx.query), completeness = profileCompleteness(ctx), volume = ratingVolumeSignal(ctx.ratingCount), cityBonus = cityMatchBonus(ctx), proximity = proximitySignal(ctx);
  return Math.min(1, text2 * 0.36 + category * 0.16 + dish * 0.13 + completeness * 0.09 + volume * 0.13 + cityBonus * 0.05 + proximity * 0.08);
}

// server/routes-admin-ranking.ts
var adminRankLog = log.tag("AdminRanking");
function registerAdminRankingRoutes(app2) {
  app2.get("/api/admin/ranking/weights", (_req, res) => {
    adminRankLog.info("Fetching ranking weights"), res.json(getRankingWeights());
  }), app2.put("/api/admin/ranking/weights", (req, res) => {
    adminRankLog.info("Updating ranking weights", req.body);
    let updated = setRankingWeights(req.body);
    res.json(updated);
  }), app2.get("/api/admin/ranking/confidence-levels", (_req, res) => {
    adminRankLog.info("Fetching confidence level definitions");
    let weights2 = getRankingWeights();
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
import crypto8 from "crypto";
var tmplLog = log.tag("EmailTemplates"), templates = /* @__PURE__ */ new Map(), MAX_TEMPLATES = 200, BUILT_IN_TEMPLATES = [
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
  for (let t of BUILT_IN_TEMPLATES) {
    let tmpl = {
      ...t,
      id: crypto8.randomUUID(),
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
    let oldest = Array.from(templates.values()).filter((t) => !BUILT_IN_TEMPLATES.some((b) => b.name === t.name)).sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
    oldest && templates.delete(oldest.name);
  }
  let created = {
    ...tmpl,
    id: crypto8.randomUUID(),
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  return templates.set(created.name, created), tmplLog.info(`Template created: ${created.name}`), created;
}
function renderTemplate(name, vars) {
  let tmpl = templates.get(name);
  if (!tmpl) return null;
  let subject = tmpl.subject, html = tmpl.htmlBody, text2 = tmpl.textBody;
  for (let [key2, value] of Object.entries(vars)) {
    let pattern = new RegExp(`\\{\\{${key2}\\}\\}`, "g");
    subject = subject.replace(pattern, value), html = html.replace(pattern, value), text2 = text2.replace(pattern, value);
  }
  return { subject, html, text: text2 };
}
function previewTemplate(name) {
  let tmpl = templates.get(name);
  if (!tmpl) return null;
  let vars = {};
  for (let v of tmpl.variables)
    vars[v] = `[${v}]`;
  return renderTemplate(name, vars);
}

// server/routes-admin-templates.ts
var adminTmplLog = log.tag("AdminTemplates");
function registerAdminTemplateRoutes(app2) {
  app2.get("/api/admin/templates", (_req, res) => {
    adminTmplLog.info("Fetching all email templates"), res.json(getAllTemplates());
  }), app2.get("/api/admin/templates/:name", (req, res) => {
    let { name } = req.params;
    adminTmplLog.info(`Fetching template: ${name}`);
    let tmpl = getTemplate(name);
    if (!tmpl) {
      res.status(404).json({ error: `Template '${name}' not found` });
      return;
    }
    res.json(tmpl);
  }), app2.post("/api/admin/templates", (req, res) => {
    let { name, subject, htmlBody, textBody, variables, category } = req.body;
    if (!name || !subject || !htmlBody || !textBody || !category) {
      res.status(400).json({ error: "Missing required fields: name, subject, htmlBody, textBody, category" });
      return;
    }
    adminTmplLog.info(`Creating template: ${name}`);
    let created = createTemplate({
      name,
      subject,
      htmlBody,
      textBody,
      variables: variables || [],
      category
    });
    res.status(201).json(created);
  }), app2.get("/api/admin/templates/:name/preview", (req, res) => {
    let { name } = req.params;
    adminTmplLog.info(`Previewing template: ${name}`);
    let result = previewTemplate(name);
    if (!result) {
      res.status(404).json({ error: `Template '${name}' not found` });
      return;
    }
    res.json(result);
  }), app2.post("/api/admin/templates/:name/render", (req, res) => {
    let name = sanitizeString(req.params.name, 100) || "";
    if (!name || !/^[a-zA-Z0-9_-]+$/.test(name))
      return res.status(400).json({ error: "Invalid template name" });
    let vars = req.body.variables || req.body;
    adminTmplLog.info(`Rendering template: ${name}`, vars);
    let result = renderTemplate(name, vars);
    if (!result) {
      res.status(404).json({ error: `Template '${name}' not found` });
      return;
    }
    res.json(result);
  });
}

// server/routes-admin-push-templates.ts
init_notification_templates();
function requireAdmin3(req, res, next) {
  if (!req.user || req.user.role !== "admin")
    return res.status(403).json({ error: "Admin access required" });
  next();
}
function registerAdminPushTemplateRoutes(app2) {
  app2.get("/api/admin/notification-templates", requireAuth, requireAdmin3, wrapAsync(async (req, res) => {
    let category = req.query.category, data = category ? listTemplatesByCategory(category) : listTemplates();
    return res.json({ data });
  })), app2.get("/api/admin/notification-templates/variables", requireAuth, requireAdmin3, wrapAsync(async (_req, res) => res.json({ data: getSupportedVariables() }))), app2.get("/api/admin/notification-templates/:id", requireAuth, requireAdmin3, wrapAsync(async (req, res) => {
    let template = getTemplate2(req.params.id);
    return template ? res.json({ data: template }) : res.status(404).json({ error: "Template not found" });
  })), app2.post("/api/admin/notification-templates", requireAuth, requireAdmin3, wrapAsync(async (req, res) => {
    let id = sanitizeString(req.body.id, 100), name = sanitizeString(req.body.name, 200), category = sanitizeString(req.body.category, 100), title = sanitizeString(req.body.title, 200), body = sanitizeString(req.body.body, 1e3);
    if (!id || !name || !category || !title || !body)
      return res.status(400).json({ error: "id, name, category, title, and body are required" });
    let template = createTemplate2({ id, name, category, title, body });
    return template ? res.json({ data: template }) : res.status(409).json({ error: "Template already exists" });
  })), app2.put("/api/admin/notification-templates/:id", requireAuth, requireAdmin3, wrapAsync(async (req, res) => {
    let name = sanitizeString(req.body.name, 200) || void 0, category = sanitizeString(req.body.category, 100) || void 0, title = sanitizeString(req.body.title, 200) || void 0, body = sanitizeString(req.body.body, 1e3) || void 0, active = typeof req.body.active == "boolean" ? req.body.active : void 0, template = updateTemplate(req.params.id, { name, category, title, body, active });
    return template ? res.json({ data: template }) : res.status(404).json({ error: "Template not found" });
  })), app2.delete("/api/admin/notification-templates/:id", requireAuth, requireAdmin3, wrapAsync(async (req, res) => deleteTemplate(req.params.id) ? res.json({ data: { deleted: !0 } }) : res.status(404).json({ error: "Template not found" })));
}

// server/routes-admin-tier-limits.ts
init_logger();

// server/tiered-rate-limiter.ts
init_logger();
var tierRLLog = log.tag("TieredRateLimit"), TIER_LIMITS = {
  free: { requestsPerMinute: 30, requestsPerHour: 500, requestsPerDay: 5e3, burstLimit: 10 },
  pro: { requestsPerMinute: 120, requestsPerHour: 3e3, requestsPerDay: 5e4, burstLimit: 30 },
  enterprise: { requestsPerMinute: 600, requestsPerHour: 2e4, requestsPerDay: 5e5, burstLimit: 100 },
  admin: { requestsPerMinute: 1e3, requestsPerHour: 5e4, requestsPerDay: 1e6, burstLimit: 200 }
}, usage = /* @__PURE__ */ new Map();
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
  let byTier = { free: 0, pro: 0, enterprise: 0, admin: 0 };
  for (let record of usage.values())
    byTier[record.tier] = (byTier[record.tier] || 0) + 1;
  return { totalTracked: usage.size, byTier };
}

// server/routes-admin-tier-limits.ts
var adminTierLog = log.tag("AdminTierLimits");
function registerAdminTierLimitRoutes(app2) {
  app2.get("/api/admin/tier-limits", (_req, res) => {
    adminTierLog.info("Fetching all tier limits"), res.json(getAllTierLimits());
  }), app2.get("/api/admin/tier-limits/usage/stats", (_req, res) => {
    adminTierLog.info("Fetching tier usage stats"), res.json(getUsageStats());
  }), app2.get("/api/admin/tier-limits/usage/:key", (req, res) => {
    let record = getUsage(req.params.key);
    if (!record)
      return res.status(404).json({ error: "No usage record found for key" });
    adminTierLog.info(`Fetching usage for key: ${req.params.key}`), res.json(record);
  }), app2.get("/api/admin/tier-limits/:tier", (req, res) => {
    let tier = req.params.tier, validTiers = ["free", "pro", "enterprise", "admin"];
    if (!validTiers.includes(tier))
      return res.status(400).json({ error: `Invalid tier: ${tier}. Must be one of: ${validTiers.join(", ")}` });
    adminTierLog.info(`Fetching limits for tier: ${tier}`), res.json(getTierLimits(tier));
  });
}

// server/routes-admin-websocket.ts
init_logger();

// server/websocket-manager.ts
init_logger();
var wsLog = log.tag("WebSocketManager"), connections = /* @__PURE__ */ new Map(), memberConnections = /* @__PURE__ */ new Map(), messageLog = [], MAX_MESSAGE_LOG = 1e3;
function getActiveConnections() {
  return Array.from(connections.values());
}
function broadcastToAll(message) {
  return messageLog.unshift(message), messageLog.length > MAX_MESSAGE_LOG && messageLog.pop(), connections.size;
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
    adminWSLog.info("Fetching active WebSocket connections"), res.json({ data: getActiveConnections() });
  }), app2.get("/api/admin/websocket/stats", (_req, res) => {
    adminWSLog.info("Fetching WebSocket stats"), res.json({ data: getConnectionStats() });
  }), app2.get("/api/admin/websocket/messages", (req, res) => {
    let limit = parseInt(req.query.limit) || 20;
    adminWSLog.info(`Fetching recent messages (limit: ${limit})`), res.json({ data: getRecentMessages(limit) });
  }), app2.post("/api/admin/websocket/broadcast", (req, res) => {
    let { message } = req.body;
    if (!message || typeof message != "string")
      return res.status(400).json({ error: "message (string) is required" });
    let wsMessage = {
      type: "system",
      payload: { message },
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }, count17 = broadcastToAll(wsMessage);
    adminWSLog.info(`Broadcast system message to ${count17} connections`), res.json({ data: { delivered: count17, message } });
  });
}

// server/city-health-monitor.ts
init_logger();
var healthLog = log.tag("CityHealth"), healthData = /* @__PURE__ */ new Map();
function getCityHealth(city) {
  return healthData.get(city) || null;
}
function getAllCityHealth() {
  return Array.from(healthData.values());
}
function getHealthySummary() {
  let all = Array.from(healthData.values());
  return {
    total: all.length,
    healthy: all.filter((c) => c.status === "healthy").length,
    degraded: all.filter((c) => c.status === "degraded").length,
    critical: all.filter((c) => c.status === "critical").length
  };
}

// server/routes-admin-health.ts
init_push_analytics();
function registerAdminHealthRoutes(app2) {
  app2.get(
    "/api/admin/city-health/summary",
    requireAuth,
    wrapAsync(async (req, res) => {
      let summary = getHealthySummary();
      return res.json({ data: summary });
    })
  ), app2.get(
    "/api/admin/city-health",
    requireAuth,
    wrapAsync(async (req, res) => {
      let all = getAllCityHealth();
      return res.json({ data: all });
    })
  ), app2.get(
    "/api/admin/city-health/:city",
    requireAuth,
    wrapAsync(async (req, res) => {
      let city = req.params.city, health = getCityHealth(city);
      return health ? res.json({ data: health }) : res.status(404).json({ error: `No health data for city: ${city}` });
    })
  ), app2.get(
    "/api/admin/push-analytics",
    requireAuth,
    wrapAsync(async (req, res) => {
      let days = Math.min(30, Math.max(1, parseInt(req.query.days) || 7)), summary = computePushAnalytics(days);
      return res.json({
        data: {
          ...summary,
          recordCount: getPushRecordCount(),
          daysBack: days
        }
      });
    })
  );
}

// server/routes-admin-photos.ts
init_logger();
init_photo_moderation();
init_photo_hash();
init_phash();
var adminPhotoLog = log.tag("AdminPhotos");
function registerAdminPhotoRoutes(app2) {
  app2.get("/api/admin/photos/pending", async (req, res) => {
    let limit = parseInt(req.query.limit) || 50;
    adminPhotoLog.info(`Fetching pending photos (limit: ${limit})`), res.json(await getPendingPhotos(limit));
  }), app2.get("/api/admin/photos/stats", async (_req, res) => {
    adminPhotoLog.info("Fetching photo stats"), res.json(await getPhotoStats());
  }), app2.post("/api/admin/photos/:id/approve", async (req, res) => {
    let { id } = req.params, moderatorId = req.user?.id || "admin", note = req.body?.note;
    if (adminPhotoLog.info(`Approving photo ${id}`), !await approvePhoto(id, moderatorId, note))
      return res.status(404).json({ error: "Photo not found or already reviewed" });
    res.json({ success: !0 });
  }), app2.post("/api/admin/photos/:id/reject", async (req, res) => {
    let { id } = req.params, moderatorId = req.user?.id || "admin", { reason, note } = req.body || {};
    if (!reason)
      return res.status(400).json({ error: "Rejection reason is required" });
    if (adminPhotoLog.info(`Rejecting photo ${id} (reason: ${reason})`), !await rejectPhoto(id, moderatorId, reason, note))
      return res.status(404).json({ error: "Photo not found or already reviewed" });
    res.json({ success: !0 });
  }), app2.get("/api/admin/photos/hash-stats", async (_req, res) => {
    adminPhotoLog.info("Fetching photo hash index stats"), res.json({ trackedHashes: getHashIndexSize(), trackedPHashes: getPHashIndexSize() });
  }), app2.post("/api/admin/photos/hash-reset", async (_req, res) => {
    adminPhotoLog.info("Clearing photo hash indexes"), clearHashIndex(), clearPHashIndex(), res.json({ success: !0, trackedHashes: 0, trackedPHashes: 0 });
  }), app2.get("/api/photos/business/:businessId", async (req, res) => {
    let { businessId } = req.params;
    adminPhotoLog.info(`Fetching approved photos for business ${businessId}`), res.json(await getPhotosByBusiness(businessId));
  });
}

// server/routes-admin-receipts.ts
init_receipt_analysis();
init_logger();
function requireAdmin4(req, res, next) {
  if (!req.user || req.user.role !== "admin")
    return res.status(403).json({ error: "Admin access required" });
  next();
}
var adminReceiptLog = log.tag("AdminReceipts");
function registerAdminReceiptRoutes(app2) {
  app2.get("/api/admin/receipts/pending", requireAuth, requireAdmin4, wrapAsync(async (req, res) => {
    let limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50)), receipts = await getPendingReceipts(limit);
    return adminReceiptLog.info(`Fetched ${receipts.length} pending receipts`), res.json({ data: receipts });
  })), app2.get("/api/admin/receipts/stats", requireAuth, requireAdmin4, wrapAsync(async (req, res) => {
    let stats2 = await getReceiptAnalysisStats();
    return res.json({ data: stats2 });
  })), app2.post("/api/admin/receipts/:id/verify", requireAuth, requireAdmin4, wrapAsync(async (req, res) => {
    let analysisId = req.params.id, reviewerId = req.user.id, { businessName, amount, date: date2, items, confidence, matchScore, note } = req.body, result = {
      businessName: businessName || void 0,
      amount: amount ? parseFloat(amount) : void 0,
      date: date2 ? new Date(date2) : void 0,
      items: items || void 0,
      confidence: parseFloat(confidence) || 0.5,
      matchScore: parseFloat(matchScore) || 0.5
    };
    return await verifyReceipt(analysisId, reviewerId, result, note) ? (adminReceiptLog.info(`Receipt ${analysisId} verified by ${reviewerId}`), res.json({ data: { id: analysisId, status: "verified" } })) : res.status(404).json({ error: "Receipt analysis not found or already reviewed" });
  })), app2.post("/api/admin/receipts/:id/reject", requireAuth, requireAdmin4, wrapAsync(async (req, res) => {
    let analysisId = req.params.id, reviewerId = req.user.id, { note } = req.body;
    return !note || typeof note != "string" ? res.status(400).json({ error: "Rejection note is required" }) : await rejectReceipt(analysisId, reviewerId, note) ? (adminReceiptLog.info(`Receipt ${analysisId} rejected by ${reviewerId}`), res.json({ data: { id: analysisId, status: "rejected" } })) : res.status(404).json({ error: "Receipt analysis not found or already reviewed" });
  }));
}

// server/routes-admin-dietary.ts
init_logger();
init_db();
init_schema();
import { eq as eq26, and as and16, isNotNull as isNotNull4 } from "drizzle-orm";
var dietaryLog = log.tag("AdminDietary"), VALID_TAGS = ["vegetarian", "vegan", "halal", "gluten_free"], CUISINE_TAG_SUGGESTIONS = {
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
    let allBiz = await db.select({
      id: businesses.id,
      name: businesses.name,
      cuisine: businesses.cuisine,
      dietaryTags: businesses.dietaryTags
    }).from(businesses).where(eq26(businesses.isActive, !0)), tagged = allBiz.filter((b) => Array.isArray(b.dietaryTags) && b.dietaryTags.length > 0), untagged = allBiz.filter((b) => !Array.isArray(b.dietaryTags) || b.dietaryTags.length === 0), tagCounts = {};
    for (let b of tagged)
      for (let tag of b.dietaryTags)
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    res.json({
      total: allBiz.length,
      tagged: tagged.length,
      untagged: untagged.length,
      coveragePct: allBiz.length > 0 ? Math.round(tagged.length / allBiz.length * 100) : 0,
      tagCounts,
      validTags: [...VALID_TAGS]
    });
  }), app2.put("/api/admin/dietary/:businessId", async (req, res) => {
    let { businessId } = req.params, { tags } = req.body || {};
    if (!Array.isArray(tags))
      return res.status(400).json({ error: "tags must be an array" });
    let invalidTags = tags.filter((t) => !VALID_TAGS.includes(t));
    if (invalidTags.length > 0)
      return res.status(400).json({ error: `Invalid tags: ${invalidTags.join(", ")}. Valid: ${VALID_TAGS.join(", ")}` });
    let result = await db.update(businesses).set({ dietaryTags: tags }).where(eq26(businesses.id, businessId)).returning({ id: businesses.id, name: businesses.name });
    if (result.length === 0)
      return res.status(404).json({ error: "Business not found" });
    dietaryLog.info(`Updated dietary tags for ${result[0].name}: [${tags.join(", ")}]`), res.json({ success: !0, business: result[0].name, tags });
  }), app2.post("/api/admin/dietary/auto-enrich", async (req, res) => {
    let { dryRun = !0 } = req.body || {};
    dietaryLog.info(`Auto-enrichment ${dryRun ? "(dry run)" : "(applying)"}`);
    let untagged = await db.select({
      id: businesses.id,
      name: businesses.name,
      cuisine: businesses.cuisine,
      dietaryTags: businesses.dietaryTags
    }).from(businesses).where(
      and16(
        eq26(businesses.isActive, !0),
        isNotNull4(businesses.cuisine)
      )
    ), suggestions = [];
    for (let biz of untagged) {
      let currentTags = Array.isArray(biz.dietaryTags) ? biz.dietaryTags : [], cuisineLower = (biz.cuisine || "").toLowerCase().replace(/[^a-z_]/g, "_"), newTags = (CUISINE_TAG_SUGGESTIONS[cuisineLower] || []).filter((t) => !currentTags.includes(t));
      if (newTags.length > 0) {
        let merged = [.../* @__PURE__ */ new Set([...currentTags, ...newTags])];
        suggestions.push({
          id: biz.id,
          name: biz.name,
          cuisine: biz.cuisine || "",
          suggestedTags: newTags
        }), dryRun || await db.update(businesses).set({ dietaryTags: merged }).where(eq26(businesses.id, biz.id));
      }
    }
    dietaryLog.info(`Auto-enrichment: ${suggestions.length} businesses ${dryRun ? "would be" : "were"} updated`), res.json({
      dryRun,
      updated: suggestions.length,
      suggestions
    });
  }), app2.get("/api/admin/dietary/businesses", async (req, res) => {
    let filter = req.query.filter;
    dietaryLog.info(`Listing businesses (filter: ${filter || "all"})`);
    let allBiz = await db.select({
      id: businesses.id,
      name: businesses.name,
      cuisine: businesses.cuisine,
      city: businesses.city,
      dietaryTags: businesses.dietaryTags
    }).from(businesses).where(eq26(businesses.isActive, !0)), filtered = allBiz;
    filter === "tagged" ? filtered = allBiz.filter((b) => Array.isArray(b.dietaryTags) && b.dietaryTags.length > 0) : filter === "untagged" && (filtered = allBiz.filter((b) => !Array.isArray(b.dietaryTags) || b.dietaryTags.length === 0)), res.json({ data: filtered, total: filtered.length });
  });
}

// server/routes-admin-enrichment.ts
init_logger();
init_db();
init_schema();
init_hours_utils();
import { eq as eq27 } from "drizzle-orm";
init_admin();
var enrichLog = log.tag("AdminEnrichment");
function requireAdmin5(req, res, next) {
  if (!isAdminEmail(req.user?.email))
    return res.status(403).json({ error: "Admin access required" });
  next();
}
function registerAdminEnrichmentRoutes(app2) {
  app2.get("/api/admin/enrichment/dashboard", requireAuth, requireAdmin5, async (_req, res) => {
    enrichLog.info("Generating enrichment dashboard");
    let allBiz = await db.select({
      id: businesses.id,
      name: businesses.name,
      city: businesses.city,
      cuisine: businesses.cuisine,
      dietaryTags: businesses.dietaryTags,
      openingHours: businesses.openingHours
    }).from(businesses).where(eq27(businesses.isActive, !0)), dietaryTagged = allBiz.filter((b) => Array.isArray(b.dietaryTags) && b.dietaryTags.length > 0), dietaryUntagged = allBiz.filter((b) => !Array.isArray(b.dietaryTags) || b.dietaryTags.length === 0), tagCounts = {};
    for (let b of dietaryTagged)
      for (let tag of b.dietaryTags)
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    let hasHours = allBiz.filter((b) => {
      let h = b.openingHours;
      return h && h.periods && h.periods.length > 0;
    }), missingHours = allBiz.filter((b) => {
      let h = b.openingHours;
      return !h || !h.periods || h.periods.length === 0;
    }), openLateCount = 0, openWeekendsCount = 0, has24Hour = 0, avgPeriodsPerBiz = 0, totalPeriods = 0;
    for (let b of hasHours) {
      let h = b.openingHours;
      isOpenLate(h) && openLateCount++, isOpenWeekends(h) && openWeekendsCount++, h.periods && h.periods.length === 1 && !h.periods[0].close && has24Hour++, totalPeriods += h.periods?.length || 0;
    }
    avgPeriodsPerBiz = hasHours.length > 0 ? Math.round(totalPeriods / hasHours.length * 10) / 10 : 0;
    let cityBreakdown = [...new Set(allBiz.map((b) => b.city).filter(Boolean))].map((city) => {
      let cityBiz = allBiz.filter((b) => b.city === city), cityDietary = cityBiz.filter((b) => Array.isArray(b.dietaryTags) && b.dietaryTags.length > 0), cityHours = cityBiz.filter((b) => {
        let h = b.openingHours;
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
    }).sort((a, b) => b.total - a.total), missingBoth = allBiz.filter((b) => {
      let noDietary = !Array.isArray(b.dietaryTags) || b.dietaryTags.length === 0, noHours = !b.openingHours?.periods?.length;
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
  }), app2.get("/api/admin/enrichment/hours-gaps", requireAuth, requireAdmin5, async (req, res) => {
    let city = req.query.city;
    enrichLog.info(`Fetching hours gaps${city ? ` for ${city}` : ""}`);
    let allBiz = await db.select({
      id: businesses.id,
      name: businesses.name,
      city: businesses.city,
      cuisine: businesses.cuisine,
      openingHours: businesses.openingHours
    }).from(businesses).where(eq27(businesses.isActive, !0));
    city && (allBiz = allBiz.filter((b) => b.city === city));
    let gaps = allBiz.filter((b) => {
      let h = b.openingHours;
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
  }), app2.get("/api/admin/enrichment/dietary-gaps", requireAuth, requireAdmin5, async (req, res) => {
    let city = req.query.city;
    enrichLog.info(`Fetching dietary gaps${city ? ` for ${city}` : ""}`);
    let allBiz = await db.select({
      id: businesses.id,
      name: businesses.name,
      city: businesses.city,
      cuisine: businesses.cuisine,
      dietaryTags: businesses.dietaryTags
    }).from(businesses).where(eq27(businesses.isActive, !0));
    city && (allBiz = allBiz.filter((b) => b.city === city));
    let gaps = allBiz.filter((b) => !Array.isArray(b.dietaryTags) || b.dietaryTags.length === 0).map((b) => ({
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
  }), app2.post("/api/admin/enrichment/action-urls", requireAuth, requireAdmin5, async (_req, res) => {
    enrichLog.info("Starting batch action URL enrichment");
    let { batchEnrichActionUrls: batchEnrichActionUrls2 } = await Promise.resolve().then(() => (init_google_places(), google_places_exports)), enriched = await batchEnrichActionUrls2();
    res.json({ enriched, message: `Enriched ${enriched} businesses with action URLs` });
  }), app2.post("/api/admin/enrichment/full-details", requireAuth, requireAdmin5, async (_req, res) => {
    enrichLog.info("Starting batch full details enrichment");
    let { isNotNull: isNotNull8, isNull: isNull2, and: and21 } = await import("drizzle-orm"), { enrichBusinessFullDetails: enrichBusinessFullDetails2 } = await Promise.resolve().then(() => (init_google_places(), google_places_exports)), unenriched = await db.select({ id: businesses.id, googlePlaceId: businesses.googlePlaceId }).from(businesses).where(and21(isNotNull8(businesses.googlePlaceId), isNull2(businesses.openingHours))).limit(50), enriched = 0;
    for (let biz of unenriched)
      if (biz.googlePlaceId)
        try {
          await enrichBusinessFullDetails2(biz.id, biz.googlePlaceId) && enriched++, await new Promise((r) => setTimeout(r, 200));
        } catch (err) {
          enrichLog.error(`Batch full details failed for ${biz.id}: ${err}`);
        }
    res.json({ enriched, total: unenriched.length, message: `Enriched ${enriched}/${unenriched.length} businesses with full details` });
  });
}

// server/routes-admin-enrichment-bulk.ts
init_logger();
init_db();
init_schema();
import { eq as eq28 } from "drizzle-orm";
init_admin();
var bulkLog = log.tag("AdminEnrichmentBulk");
function requireAdmin6(req, res, next) {
  if (!isAdminEmail(req.user?.email))
    return res.status(403).json({ error: "Admin access required" });
  next();
}
var VALID_TAGS2 = ["vegetarian", "vegan", "halal", "gluten_free"];
function registerAdminEnrichmentBulkRoutes(app2) {
  app2.post("/api/admin/enrichment/bulk-dietary", requireAuth, requireAdmin6, async (req, res) => {
    let { businessIds, tags, mode = "merge" } = req.body || {};
    if (!Array.isArray(businessIds) || businessIds.length === 0)
      return res.status(400).json({ error: "businessIds must be a non-empty array" });
    if (!Array.isArray(tags) || tags.length === 0)
      return res.status(400).json({ error: "tags must be a non-empty array" });
    let invalidTags = tags.filter((t) => !VALID_TAGS2.includes(t));
    if (invalidTags.length > 0)
      return res.status(400).json({ error: `Invalid tags: ${invalidTags.join(", ")}` });
    if (businessIds.length > 100)
      return res.status(400).json({ error: "Maximum 100 businesses per batch" });
    bulkLog.info(`Bulk dietary: ${businessIds.length} businesses, tags=[${tags}], mode=${mode}`);
    let results = [];
    for (let bizId of businessIds) {
      let [biz] = await db.select({
        id: businesses.id,
        name: businesses.name,
        dietaryTags: businesses.dietaryTags
      }).from(businesses).where(eq28(businesses.id, bizId));
      if (!biz) continue;
      let previousTags = Array.isArray(biz.dietaryTags) ? biz.dietaryTags : [], newTags = mode === "replace" ? [...tags] : [.../* @__PURE__ */ new Set([...previousTags, ...tags])];
      await db.update(businesses).set({ dietaryTags: newTags }).where(eq28(businesses.id, bizId)), results.push({ id: biz.id, name: biz.name, previousTags, newTags });
    }
    bulkLog.info(`Bulk dietary complete: ${results.length}/${businessIds.length} updated`), res.json({ updated: results.length, requested: businessIds.length, mode, results });
  }), app2.post("/api/admin/enrichment/bulk-dietary-by-cuisine", requireAuth, requireAdmin6, async (req, res) => {
    let { cuisine, tags, city, dryRun = !0 } = req.body || {};
    if (!cuisine || typeof cuisine != "string")
      return res.status(400).json({ error: "cuisine is required" });
    if (!Array.isArray(tags) || tags.length === 0)
      return res.status(400).json({ error: "tags must be a non-empty array" });
    let invalidTags = tags.filter((t) => !VALID_TAGS2.includes(t));
    if (invalidTags.length > 0)
      return res.status(400).json({ error: `Invalid tags: ${invalidTags.join(", ")}` });
    bulkLog.info(`Bulk dietary by cuisine: ${cuisine}, tags=[${tags}], city=${city || "all"}, dryRun=${dryRun}`);
    let allBiz = await db.select({
      id: businesses.id,
      name: businesses.name,
      cuisine: businesses.cuisine,
      city: businesses.city,
      dietaryTags: businesses.dietaryTags
    }).from(businesses).where(eq28(businesses.isActive, !0));
    allBiz = allBiz.filter((b) => b.cuisine?.toLowerCase() === cuisine.toLowerCase()), city && (allBiz = allBiz.filter((b) => b.city === city));
    let updates = [];
    for (let biz of allBiz) {
      let previousTags = Array.isArray(biz.dietaryTags) ? biz.dietaryTags : [], newTags = [.../* @__PURE__ */ new Set([...previousTags, ...tags])];
      newTags.length === previousTags.length && newTags.every((t) => previousTags.includes(t)) || (dryRun || await db.update(businesses).set({ dietaryTags: newTags }).where(eq28(businesses.id, biz.id)), updates.push({ id: biz.id, name: biz.name, previousTags, newTags }));
    }
    bulkLog.info(`Bulk by cuisine ${dryRun ? "(dry run)" : ""}: ${updates.length}/${allBiz.length} ${dryRun ? "would be" : "were"} updated`), res.json({
      dryRun,
      cuisine,
      city: city || "all",
      matched: allBiz.length,
      updated: updates.length,
      updates: updates.slice(0, 50)
      // cap for response size
    });
  }), app2.post("/api/admin/enrichment/bulk-hours", requireAuth, requireAdmin6, async (req, res) => {
    let { businessIds, hoursData, source = "manual", dryRun = !0 } = req.body || {};
    if (!Array.isArray(businessIds) || businessIds.length === 0)
      return res.status(400).json({ error: "businessIds must be a non-empty array" });
    if (!hoursData || typeof hoursData != "object")
      return res.status(400).json({ error: "hoursData must be a valid hours object" });
    if (businessIds.length > 50)
      return res.status(400).json({ error: "Maximum 50 businesses per hours batch" });
    let VALID_SOURCES = ["manual", "google_places", "import"];
    if (!VALID_SOURCES.includes(source))
      return res.status(400).json({ error: `Invalid source: ${source}. Must be one of: ${VALID_SOURCES.join(", ")}` });
    let periods = hoursData.periods;
    if (periods && !Array.isArray(periods))
      return res.status(400).json({ error: "hoursData.periods must be an array" });
    if (periods) {
      for (let p of periods)
        if (!p.open || typeof p.open.day != "number" || typeof p.open.time != "string")
          return res.status(400).json({ error: "Each period must have open.day (number) and open.time (string)" });
    }
    bulkLog.info(`Bulk hours: ${businessIds.length} businesses, source=${source}, dryRun=${dryRun}`);
    let results = [];
    for (let bizId of businessIds) {
      let [biz] = await db.select({
        id: businesses.id,
        name: businesses.name,
        openingHours: businesses.openingHours
      }).from(businesses).where(eq28(businesses.id, bizId));
      if (!biz) continue;
      let prevHours = biz.openingHours, hadHours = !!(prevHours && prevHours.periods && prevHours.periods.length > 0);
      dryRun || await db.update(businesses).set({ openingHours: hoursData }).where(eq28(businesses.id, bizId)), results.push({
        id: biz.id,
        name: biz.name,
        hadHours,
        periodsCount: periods?.length || 0
      });
    }
    bulkLog.info(`Bulk hours ${dryRun ? "(dry run)" : ""}: ${results.length}/${businessIds.length} ${dryRun ? "would be" : "were"} updated`), res.json({
      dryRun,
      source,
      requested: businessIds.length,
      updated: results.length,
      results: results.slice(0, 50)
    });
  });
}

// server/request-logger.ts
var requestLogs = [];
function getRequestLogs(limit) {
  return limit && limit > 0 ? requestLogs.slice(-limit) : [...requestLogs];
}

// lib/error-reporting.ts
var errorBuffer = [];
function getRecentErrors(limit = 20) {
  return errorBuffer.slice(-limit);
}

// lib/feature-flags.ts
var flagStore = /* @__PURE__ */ new Map(), defaultFlags = [
  { name: "dark_mode", enabled: !0, description: "Dark mode theme support" },
  { name: "i18n", enabled: !1, description: "Internationalization support" },
  { name: "offline_sync", enabled: !1, description: "Offline data synchronization" },
  { name: "social_sharing", enabled: !1, description: "Social sharing integration" }
];
for (let flag of defaultFlags)
  flagStore.set(flag.name, {
    name: flag.name,
    enabled: flag.enabled,
    description: flag.description,
    createdAt: Date.now()
  });
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
}, DEFAULT_THRESHOLDS = { provisional: 3, early: 10, established: 25 };

// server/rate-limiter.ts
init_logger();
init_config();
var rlLog = log.tag("RateLimiter"), MemoryStore = class {
  windows = /* @__PURE__ */ new Map();
  cleanupTimer;
  constructor() {
    this.cleanupTimer = setInterval(() => {
      let now = Date.now();
      for (let [key2, entry] of this.windows)
        now > entry.resetAt && this.windows.delete(key2);
    }, 6e4);
  }
  async increment(key2, windowMs) {
    let now = Date.now(), entry = this.windows.get(key2);
    return (!entry || now > entry.resetAt) && (entry = { count: 0, resetAt: now + windowMs }, this.windows.set(key2, entry)), entry.count++, { count: entry.count, resetAt: entry.resetAt };
  }
  cleanup() {
    clearInterval(this.cleanupTimer);
  }
}, RedisStore = class {
  constructor(redisClient) {
    this.redisClient = redisClient;
  }
  async increment(key2, windowMs) {
    let redisKey = `rl:${key2}`, count17 = await this.redisClient.incr(redisKey);
    count17 === 1 && await this.redisClient.pexpire(redisKey, windowMs);
    let ttl = await this.redisClient.pttl(redisKey);
    return { count: count17, resetAt: Date.now() + Math.max(ttl, 0) };
  }
};
function createDefaultStore() {
  let redisUrl = config.redisUrl;
  if (redisUrl)
    try {
      let Redis2 = __require("ioredis"), client = new Redis2(redisUrl, { maxRetriesPerRequest: 1, connectTimeout: 3e3, lazyConnect: !0 });
      return client.connect().catch(() => {
      }), rlLog.info("Using Redis rate-limit store"), new RedisStore(client);
    } catch {
      rlLog.info("Redis unavailable \u2014 falling back to memory rate-limit store");
    }
  return new MemoryStore();
}
var defaultStore = createDefaultStore();
function getRateLimitStats2() {
  return {
    activeWindows: defaultStore instanceof MemoryStore ? defaultStore.windows.size : -1,
    storeType: defaultStore instanceof MemoryStore ? "memory" : "redis"
  };
}
var DEFAULT_OPTIONS = {
  windowMs: 6e4,
  // 1 minute
  maxRequests: 100
  // 100 requests per minute
};
function rateLimiter(options = {}) {
  let { windowMs, maxRequests } = { ...DEFAULT_OPTIONS, ...options }, store3 = options.store || defaultStore, keyPrefix = options.keyPrefix || "global";
  return (req, res, next) => {
    let ip = req.ip || req.socket.remoteAddress || "unknown", key2 = `${keyPrefix}:${ip}`, now = Date.now();
    store3.increment(key2, windowMs).then(({ count: count17, resetAt }) => {
      if (res.setHeader("X-RateLimit-Limit", String(maxRequests)), res.setHeader("X-RateLimit-Remaining", String(Math.max(0, maxRequests - count17))), res.setHeader("X-RateLimit-Reset", String(Math.ceil(resetAt / 1e3))), count17 > maxRequests)
        return rlLog.warn(`Rate limit exceeded for ${ip}: ${count17}/${maxRequests}`), res.status(429).json({
          error: "Too many requests. Please try again later.",
          retryAfter: Math.ceil((resetAt - now) / 1e3)
        });
      next();
    }).catch((err) => {
      rlLog.warn(`Rate limit store error: ${err}`), next();
    });
  };
}
var authRateLimiter = rateLimiter({ windowMs: 6e4, maxRequests: 10, keyPrefix: "auth" }), apiRateLimiter = rateLimiter({ windowMs: 6e4, maxRequests: 100, keyPrefix: "api" }), paymentRateLimiter = rateLimiter({ windowMs: 6e4, maxRequests: 20, keyPrefix: "payments" }), adminRateLimiter = rateLimiter({ windowMs: 6e4, maxRequests: 30, keyPrefix: "admin" }), claimVerifyRateLimiter = rateLimiter({ windowMs: 6e4, maxRequests: 5, keyPrefix: "claim-verify" }), ratingRateLimiter = rateLimiter({ windowMs: 6e4, maxRequests: 10, keyPrefix: "rating" }), feedbackRateLimiter = rateLimiter({ windowMs: 6e4, maxRequests: 5, keyPrefix: "feedback" }), uploadRateLimiter = rateLimiter({ windowMs: 6e4, maxRequests: 10, keyPrefix: "upload" });

// server/routes-admin.ts
init_config();
init_tier_staleness();
function requireAdmin7(req, res, next) {
  if (!isAdminEmail(req.user?.email))
    return res.status(403).json({ error: "Admin access required" });
  next();
}
function registerAdminRoutes(app2) {
  app2.use("/api/admin", adminRateLimiter), app2.patch("/api/admin/category-suggestions/:id", requireAuth, requireAdmin7, wrapAsync(async (req, res) => {
    let { status } = req.body;
    if (!["approved", "rejected"].includes(status))
      return res.status(400).json({ error: "Status must be 'approved' or 'rejected'" });
    let { reviewSuggestion: reviewSuggestion2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), updated = await reviewSuggestion2(req.params.id, status, req.user.id);
    return updated ? res.json({ data: updated }) : res.status(404).json({ error: "Suggestion not found" });
  })), config.isProduction || app2.post("/api/admin/seed-cities", requireAuth, requireAdmin7, wrapAsync(async (req, res) => {
    let { seedCities: seedCities2 } = await Promise.resolve().then(() => (init_seed_cities(), seed_cities_exports));
    return await seedCities2(), res.json({ data: { message: "Cities seeded successfully" } });
  })), app2.post("/api/admin/fetch-photos", requireAuth, requireAdmin7, wrapAsync(async (req, res) => {
    let city = sanitizeString(req.body.city, 100) || void 0, limit = Math.min(50, parseInt(req.body.limit) || 20), businesses2 = await getBusinessesWithoutPhotos(city, limit);
    if (businesses2.length === 0)
      return res.json({ data: { message: "All businesses already have photos", fetched: 0 } });
    let totalFetched = 0, results = [];
    for (let biz of businesses2) {
      let count17 = await fetchAndStorePhotos(biz.id, biz.googlePlaceId);
      totalFetched += count17, results.push({ name: biz.name, photos: count17 });
    }
    return res.json({
      data: {
        message: `Fetched photos for ${businesses2.length} businesses`,
        fetched: totalFetched,
        results
      }
    });
  })), app2.post("/api/admin/import-restaurants", requireAuth, requireAdmin7, wrapAsync(async (req, res) => {
    let city = sanitizeString(req.body.city, 100), category = sanitizeString(req.body.category, 50) || "restaurant";
    if (!city)
      return res.status(400).json({ error: "City is required" });
    let places = await searchNearbyRestaurants(city, category, 20);
    if (places.length === 0)
      return res.json({ data: { message: "No places found from Google Places", imported: 0, skipped: 0 } });
    let importData = places.map((p) => ({
      placeId: p.placeId,
      name: p.name,
      address: p.address,
      city,
      category: normalizeCategory(p.types),
      lat: p.lat,
      lng: p.lng,
      googleRating: p.rating,
      priceRange: p.priceLevel || "$$"
    })), { bulkImportBusinesses: bulkImportBusinesses2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), result = await bulkImportBusinesses2(importData), photosFetched = 0;
    for (let r of result.results)
      if (r.status === "imported") {
        let place = importData.find((p) => p.name === r.name);
        if (place)
          try {
            let count17 = await fetchAndStorePhotos(place.placeId, place.placeId);
            photosFetched += count17;
          } catch {
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
  })), app2.get("/api/admin/import-stats", requireAuth, requireAdmin7, wrapAsync(async (req, res) => {
    let { getImportStats: getImportStats2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), stats2 = await getImportStats2();
    return res.json({ data: stats2 });
  })), app2.get("/api/admin/claims", requireAuth, requireAdmin7, wrapAsync(async (req, res) => {
    let data = await getPendingClaims();
    return res.json({ data });
  })), app2.patch("/api/admin/claims/:id", requireAuth, requireAdmin7, wrapAsync(async (req, res) => {
    let { status } = req.body;
    if (!["approved", "rejected"].includes(status))
      return res.status(400).json({ error: "Status must be 'approved' or 'rejected'" });
    let updated = await reviewClaim(req.params.id, status, req.user.id);
    if (!updated) return res.status(404).json({ error: "Claim not found" });
    if (updated.memberId && updated.businessId) {
      let { getMemberById: getMemberById2, getBusinessById: getBusinessById2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), [member, business] = await Promise.all([
        getMemberById2(updated.memberId),
        getBusinessById2(updated.businessId)
      ]);
      if (member?.email && business) {
        let { sendClaimApprovedEmail: sendClaimApprovedEmail2, sendClaimRejectedEmail: sendClaimRejectedEmail2 } = await Promise.resolve().then(() => (init_email(), email_exports));
        status === "approved" ? sendClaimApprovedEmail2({
          email: member.email,
          displayName: member.displayName || "User",
          businessName: business.name,
          businessSlug: business.slug || business.id
        }).catch(() => {
        }) : sendClaimRejectedEmail2({
          email: member.email,
          displayName: member.displayName || "User",
          businessName: business.name
        }).catch(() => {
        });
      }
      if (member?.pushToken) {
        let { sendPushNotification: sendPushNotification3 } = await Promise.resolve().then(() => (init_push(), push_exports));
        status === "approved" ? sendPushNotification3(
          [member.pushToken],
          `Claim approved: ${business?.name}`,
          "You're now the verified owner. Access your dashboard to see analytics.",
          { screen: "business" }
        ).catch(() => {
        }) : sendPushNotification3(
          [member.pushToken],
          `Claim update: ${business?.name}`,
          "Your claim could not be verified. Contact support for next steps.",
          { screen: "profile" }
        ).catch(() => {
        });
      }
    }
    return res.json({ data: updated });
  })), app2.get("/api/admin/claims/count", requireAuth, requireAdmin7, wrapAsync(async (req, res) => {
    let count17 = await getClaimCount();
    return res.json({ data: { count: count17 } });
  })), app2.get("/api/admin/flags", requireAuth, requireAdmin7, wrapAsync(async (req, res) => {
    let data = await getPendingFlags();
    return res.json({ data });
  })), app2.patch("/api/admin/flags/:id", requireAuth, requireAdmin7, wrapAsync(async (req, res) => {
    let { status } = req.body;
    if (!["confirmed", "dismissed"].includes(status))
      return res.status(400).json({ error: "Status must be 'confirmed' or 'dismissed'" });
    let updated = await reviewFlag(req.params.id, status, req.user.id);
    return updated ? res.json({ data: updated }) : res.status(404).json({ error: "Flag not found" });
  })), app2.get("/api/admin/flags/count", requireAuth, requireAdmin7, wrapAsync(async (req, res) => {
    let count17 = await getFlagCount();
    return res.json({ data: { count: count17 } });
  })), app2.get("/api/admin/members", requireAuth, requireAdmin7, wrapAsync(async (req, res) => {
    let limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50)), freshData = (await getAdminMemberList(limit)).map((m) => ({
      ...m,
      credibilityTier: checkAndRefreshTier(m.credibilityTier, m.credibilityScore)
    }));
    return res.json({ data: freshData });
  })), app2.get("/api/admin/members/count", requireAuth, requireAdmin7, wrapAsync(async (req, res) => {
    let count17 = await getMemberCount();
    return res.json({ data: { count: count17 } });
  })), app2.get("/api/admin/webhooks", requireAuth, requireAdmin7, wrapAsync(async (req, res) => {
    let source = sanitizeString(req.query.source, 50) || "stripe", limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50)), events3 = await getRecentWebhookEvents(source, limit);
    return res.json({ data: events3 });
  })), app2.post("/api/admin/webhooks/:id/replay", requireAuth, requireAdmin7, wrapAsync(async (req, res) => {
    let event = await getWebhookEventById(req.params.id);
    if (!event) return res.status(404).json({ error: "Webhook event not found" });
    let { processStripeEvent: processStripeEvent2 } = await Promise.resolve().then(() => (init_stripe_webhook(), stripe_webhook_exports));
    return event.source === "stripe" && event.payload ? (await processStripeEvent2(event.payload), await markWebhookProcessed(event.id), res.json({ data: { id: event.id, replayed: !0 } })) : res.status(400).json({ error: `Unsupported webhook source: ${event.source}` });
  })), app2.get("/api/admin/perf", requireAuth, requireAdmin7, wrapAsync(async (_req, res) => {
    let { getCacheStats: getCacheStats2 } = await Promise.resolve().then(() => (init_redis(), redis_exports)), { getErrorStats: getErrorStats2 } = await Promise.resolve().then(() => (init_error_tracking(), error_tracking_exports)), data = {
      ...getPerfStats(),
      cache: getCacheStats2(),
      errors: getErrorStats2()
    };
    return res.json({ data });
  })), app2.get("/api/admin/perf/validate", requireAuth, requireAdmin7, wrapAsync(async (_req, res) => {
    let validation = getPerformanceValidation();
    return res.json({ data: validation });
  })), app2.get("/api/admin/analytics/active-users-db", requireAuth, requireAdmin7, wrapAsync(async (_req, res) => {
    let { getActiveUserStatsDb: getActiveUserStatsDb2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), stats2 = await getActiveUserStatsDb2();
    return res.json({ data: stats2 });
  })), app2.get("/api/admin/city-engagement", requireAuth, requireAdmin7, wrapAsync(async (req, res) => {
    let city = req.query.city;
    if (city) {
      let engagement = await getCityEngagement(city);
      return res.json({ data: engagement });
    }
    let all = await getAllCityEngagement();
    return res.json({ data: all });
  })), app2.get("/api/admin/errors", requireAuth, requireAdmin7, wrapAsync(async (req, res) => {
    let { getRecentServerErrors: getRecentServerErrors2 } = await Promise.resolve().then(() => (init_error_tracking(), error_tracking_exports)), limit = Math.min(100, parseInt(req.query.limit) || 20), data = getRecentServerErrors2(limit);
    return res.json({ data });
  })), app2.get("/api/admin/revenue", requireAuth, requireAdmin7, wrapAsync(async (req, res) => {
    let { getRevenueMetrics: getRevenueMetrics2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), metrics = await getRevenueMetrics2();
    return res.json({ data: metrics });
  })), registerAdminAnalyticsRoutes(app2), app2.get("/api/admin/feedback", requireAuth, requireAdmin7, wrapAsync(async (req, res) => {
    let { getRecentFeedback: getRecentFeedback2, getFeedbackStats: getFeedbackStats2 } = await Promise.resolve().then(() => (init_feedback(), feedback_exports)), limit = Math.min(100, parseInt(req.query.limit) || 50), [recent, stats2] = await Promise.all([
      getRecentFeedback2(limit),
      getFeedbackStats2()
    ]);
    return res.json({ data: { recent, stats: stats2 } });
  })), app2.get("/api/admin/moderation-queue", requireAuth, requireAdmin7, wrapAsync(async (req, res) => {
    let { getAutoFlaggedRatings: getAutoFlaggedRatings2 } = await Promise.resolve().then(() => (init_ratings(), ratings_exports)), page = Math.max(1, parseInt(req.query.page) || 1), perPage = Math.min(50, Math.max(1, parseInt(req.query.perPage) || 20)), result = await getAutoFlaggedRatings2(page, perPage);
    return res.json({
      data: result.ratings,
      pagination: { page, perPage, total: result.total, totalPages: Math.ceil(result.total / perPage) }
    });
  })), app2.patch("/api/admin/moderation/:id", requireAuth, requireAdmin7, wrapAsync(async (req, res) => {
    let { reviewAutoFlaggedRating: reviewAutoFlaggedRating2 } = await Promise.resolve().then(() => (init_ratings(), ratings_exports)), action = req.body.action;
    return action !== "confirm" && action !== "dismiss" ? res.status(400).json({ error: "action must be 'confirm' or 'dismiss'" }) : (await reviewAutoFlaggedRating2(req.params.id, action, req.user.id), res.json({ data: { reviewed: !0, action } }));
  })), app2.get("/api/admin/rate-gate-stats", requireAuth, requireAdmin7, wrapAsync(async (_req, res) => {
    let stats2 = getRateGateStats();
    return res.json({ data: stats2 });
  })), app2.get("/api/admin/metrics", requireAuth, requireAdmin7, wrapAsync(async (_req, res) => {
    let uptime = process.uptime(), memoryUsage = process.memoryUsage().heapUsed, nodeVersion = process.version, requestCount = getRequestLogs().length, errorCount2 = getRecentErrors().length;
    return res.json({
      data: {
        uptime: Math.floor(uptime),
        memoryUsage,
        nodeVersion,
        requestCount,
        errorCount: errorCount2
      }
    });
  })), app2.get("/api/admin/health/detailed", requireAuth, requireAdmin7, wrapAsync(async (_req, res) => {
    let mem = process.memoryUsage(), cpu = process.cpuUsage(), flags = getAllFlags();
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
            let { getPrerenderCacheStats: getPrerenderCacheStats2 } = (init_prerender(), __toCommonJS(prerender_exports));
            return getPrerenderCacheStats2();
          } catch {
            return null;
          }
        })(),
        generatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    });
  })), app2.get("/api/admin/confidence-thresholds", requireAuth, requireAdmin7, wrapAsync(async (_req, res) => res.json({
    data: {
      thresholds: CATEGORY_CONFIDENCE_THRESHOLDS,
      defaults: DEFAULT_THRESHOLDS
    }
  }))), app2.get("/api/admin/revenue/monthly", requireAuth, requireAdmin7, wrapAsync(async (req, res) => {
    let months = Math.min(24, Math.max(1, parseInt(req.query.months) || 6)), { getRevenueByMonth: getRevenueByMonth2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), data = await getRevenueByMonth2(months);
    return res.json({ data });
  })), app2.post("/api/admin/beta-invite", requireAuth, requireAdmin7, wrapAsync(async (req, res) => {
    let { sendBetaInviteEmail: sendBetaInviteEmail2 } = await Promise.resolve().then(() => (init_email(), email_exports)), { getMemberByEmail: getMemberByEmail2, createBetaInvite: createBetaInvite2, getBetaInviteByEmail: getBetaInviteByEmail2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), email = sanitizeString(req.body.email, 254), displayName = sanitizeString(req.body.displayName, 100), referralCode = sanitizeString(req.body.referralCode || "", 50) || "BETA25";
    if (!email || !displayName)
      return res.status(400).json({ error: "email and displayName are required" });
    if (await getMemberByEmail2(email))
      return res.status(409).json({ error: "User already has an account" });
    if (await getBetaInviteByEmail2(email))
      return res.status(409).json({ error: "Invite already sent to this email" });
    await sendBetaInviteEmail2({
      email,
      displayName,
      referralCode,
      invitedBy: req.body.invitedBy ? sanitizeString(req.body.invitedBy, 100) : void 0
    }), await createBetaInvite2({ email, displayName, referralCode, invitedBy: req.user?.email });
    let { trackEvent: trackEvent2 } = await Promise.resolve().then(() => (init_analytics2(), analytics_exports2));
    return trackEvent2("beta_invite_sent", req.user?.id, { email }), res.json({ data: { sent: !0, email } });
  })), app2.get("/api/admin/beta-invites", requireAuth, requireAdmin7, wrapAsync(async (_req, res) => {
    let { getBetaInviteStats: getBetaInviteStats2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), stats2 = await getBetaInviteStats2();
    return res.json({ data: stats2 });
  })), app2.get("/api/admin/alerts", requireAuth, requireAdmin7, wrapAsync(async (req, res) => {
    let limit = Math.min(100, parseInt(req.query.limit) || 50), alerts2 = getRecentAlerts(limit), stats2 = getAlertStats(), rules = getAlertRules();
    return res.json({ data: { alerts: alerts2, stats: stats2, rules } });
  })), app2.post("/api/admin/alerts/:id/acknowledge", requireAuth, requireAdmin7, wrapAsync(async (req, res) => acknowledgeAlert(req.params.id) ? res.json({ data: { acknowledged: !0 } }) : res.status(404).json({ error: "Alert not found" }))), app2.post("/api/admin/beta-invite/batch", requireAuth, requireAdmin7, wrapAsync(async (req, res) => {
    let { sendBetaInviteEmail: sendBetaInviteEmail2 } = await Promise.resolve().then(() => (init_email(), email_exports)), { getMemberByEmail: getMemberByEmail2, createBetaInvite: createBetaInvite2, getBetaInviteByEmail: getBetaInviteByEmail2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), invites = req.body.invites;
    if (!Array.isArray(invites) || invites.length === 0 || invites.length > 100)
      return res.status(400).json({ error: "invites must be an array of 1-100 entries" });
    let results = [];
    for (let invite of invites) {
      let email = sanitizeString(invite.email, 254), displayName = sanitizeString(invite.displayName, 100), referralCode = sanitizeString(invite.referralCode || "", 50) || "BETA25";
      if (!email || !displayName) {
        results.push({ email: email || "unknown", status: "skipped", reason: "missing fields" });
        continue;
      }
      if (await getMemberByEmail2(email)) {
        results.push({ email, status: "skipped", reason: "already registered" });
        continue;
      }
      if (await getBetaInviteByEmail2(email)) {
        results.push({ email, status: "skipped", reason: "already invited" });
        continue;
      }
      await sendBetaInviteEmail2({ email, displayName, referralCode }), await createBetaInvite2({ email, displayName, referralCode, invitedBy: req.user?.email }), results.push({ email, status: "sent" });
    }
    let sent = results.filter((r) => r.status === "sent").length;
    return res.json({ data: { total: invites.length, sent, skipped: invites.length - sent, results } });
  })), app2.get("/api/admin/eligibility", requireAuth, wrapAsync(async (req, res) => {
    if (!isAdminEmail(req.user?.email)) return res.status(403).json({ error: "Admin only" });
    let { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports)), { businesses: businesses2 } = await Promise.resolve().then(() => (init_schema(), schema_exports)), { eq: eq35, asc: asc4 } = await import("drizzle-orm"), allBusinesses = await db2.select({
      id: businesses2.id,
      name: businesses2.name,
      city: businesses2.city,
      category: businesses2.category,
      totalRatings: businesses2.totalRatings,
      dineInCount: businesses2.dineInCount,
      credibilityWeightedSum: businesses2.credibilityWeightedSum,
      leaderboardEligible: businesses2.leaderboardEligible,
      weightedScore: businesses2.weightedScore
    }).from(businesses2).where(eq35(businesses2.isActive, !0)).orderBy(asc4(businesses2.leaderboardEligible)), eligible = allBusinesses.filter((b) => b.leaderboardEligible), ineligible = allBusinesses.filter((b) => !b.leaderboardEligible), nearEligible = ineligible.filter(
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
function registerAllAdminRoutes(app2) {
  registerAdminRoutes(app2), registerAdminExperimentRoutes(app2), registerAdminPromotionRoutes(app2), registerAdminRateLimitRoutes(app2), registerAdminClaimVerificationRoutes(app2), registerAdminReputationRoutes(app2), registerAdminModerationRoutes(app2), registerAdminRankingRoutes(app2), registerAdminTemplateRoutes(app2), registerAdminPushTemplateRoutes(app2), registerAdminTierLimitRoutes(app2), registerAdminWebSocketRoutes(app2), registerAdminHealthRoutes(app2), registerAdminPhotoRoutes(app2), registerAdminReceiptRoutes(app2), registerAdminDietaryRoutes(app2), registerAdminEnrichmentRoutes(app2), registerAdminEnrichmentBulkRoutes(app2);
}

// server/routes-payments.ts
init_storage();
init_email();

// server/sse.ts
var clients = /* @__PURE__ */ new Set();
function addClient(res) {
  clients.add(res), res.on("close", () => {
    clients.delete(res);
  });
}
function broadcast(type, payload = {}) {
  let event = { type, payload, timestamp: Date.now() }, data = `data: ${JSON.stringify(event)}

`;
  for (let client of clients)
    try {
      client.write(data);
    } catch {
      clients.delete(client);
    }
}
function getClientCount() {
  return clients.size;
}

// server/routes-payments.ts
init_config();
init_logger();
function registerPaymentRoutes(app2) {
  app2.use("/api/payments", paymentRateLimiter), app2.post("/api/payments/challenger", requireAuth, wrapAsync(async (req, res) => {
    let businessName = sanitizeString(req.body.businessName, 100), slug = sanitizeSlug(req.body.slug);
    if (!businessName || !slug)
      return res.status(400).json({ error: "businessName and slug are required" });
    let business = await getBusinessBySlug(slug);
    if (!business)
      return res.status(404).json({ error: "Business not found" });
    let { createChallengerPayment: createChallengerPayment2 } = await Promise.resolve().then(() => (init_payments2(), payments_exports)), payment = await createChallengerPayment2({
      challengerId: business.id,
      businessName,
      customerEmail: req.user.email || "",
      userId: req.user.id
    });
    return await createPaymentRecord({
      memberId: req.user.id,
      businessId: business.id,
      type: "challenger_entry",
      amount: payment.amount,
      stripePaymentIntentId: payment.id,
      status: payment.status,
      metadata: payment.metadata
    }), sendPaymentReceiptEmail({
      email: req.user.email || "",
      displayName: req.user.displayName || "Member",
      type: "challenger_entry",
      amount: payment.amount,
      businessName,
      paymentId: payment.id
    }).catch(() => {
    }), res.json({ data: payment });
  })), app2.post("/api/payments/dashboard-pro", requireAuth, wrapAsync(async (req, res) => {
    let slug = sanitizeSlug(req.body.slug);
    if (!slug)
      return res.status(400).json({ error: "slug is required" });
    let business = await getBusinessBySlug(slug);
    if (!business)
      return res.status(404).json({ error: "Business not found" });
    if (business.ownerId !== req.user.id)
      return res.status(403).json({ error: "Only the business owner can subscribe" });
    if (business.subscriptionStatus === "active")
      return res.status(409).json({ error: "Business already has an active subscription" });
    let { createDashboardProSubscription: createDashboardProSubscription2 } = await Promise.resolve().then(() => (init_payments2(), payments_exports)), siteUrl = config.siteUrl, checkout = await createDashboardProSubscription2({
      businessId: business.id,
      businessName: business.name,
      customerEmail: req.user.email || "",
      userId: req.user.id,
      stripeCustomerId: business.stripeCustomerId || void 0,
      successUrl: `${siteUrl}/business/${slug}/dashboard?subscription=success`,
      cancelUrl: `${siteUrl}/business/${slug}/dashboard?subscription=cancelled`
    });
    if (await createPaymentRecord({
      memberId: req.user.id,
      businessId: business.id,
      type: "dashboard_pro",
      amount: 4900,
      // $49 — actual charge happens via Stripe webhook
      stripePaymentIntentId: checkout.id,
      status: checkout.status === "succeeded" ? "succeeded" : "pending",
      metadata: { checkoutSessionId: checkout.id }
    }), !checkout.url) {
      let { updateBusinessSubscription: updateBusinessSubscription2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      await updateBusinessSubscription2(business.id, {
        subscriptionStatus: "active",
        stripeCustomerId: `mock_cus_${Date.now()}`,
        stripeSubscriptionId: `mock_sub_${Date.now()}`,
        subscriptionPeriodEnd: new Date(Date.now() + 720 * 60 * 60 * 1e3)
      });
    }
    return res.json({ data: { id: checkout.id, url: checkout.url, status: checkout.status } });
  })), app2.get("/api/payments/subscription-status/:slug", requireAuth, wrapAsync(async (req, res) => {
    let business = await getBusinessBySlug(req.params.slug);
    return business ? res.json({
      data: {
        subscriptionStatus: business.subscriptionStatus || "none",
        subscriptionPeriodEnd: business.subscriptionPeriodEnd,
        isActive: business.subscriptionStatus === "active" || business.subscriptionStatus === "trialing"
      }
    }) : res.status(404).json({ error: "Business not found" });
  })), app2.post("/api/payments/subscription-cancel/:slug", requireAuth, wrapAsync(async (req, res) => {
    let business = await getBusinessBySlug(req.params.slug);
    if (!business)
      return res.status(404).json({ error: "Business not found" });
    if (business.ownerId !== req.user.id)
      return res.status(403).json({ error: "Only the business owner can cancel" });
    if (!business.stripeSubscriptionId)
      return res.status(400).json({ error: "No active subscription to cancel" });
    let { cancelSubscription: cancelSubscription2 } = await Promise.resolve().then(() => (init_payments2(), payments_exports));
    await cancelSubscription2(business.stripeSubscriptionId);
    let { updateBusinessSubscription: updateBusinessSubscription2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    return await updateBusinessSubscription2(business.id, { subscriptionStatus: "cancelled" }), log.info(`Subscription cancelled: business=${business.id} by user=${req.user.id}`), res.json({ data: { cancelled: !0 } });
  })), app2.post("/api/payments/featured", requireAuth, wrapAsync(async (req, res) => {
    let slug = sanitizeSlug(req.body.slug);
    if (!slug)
      return res.status(400).json({ error: "slug is required" });
    let business = await getBusinessBySlug(slug);
    if (!business)
      return res.status(404).json({ error: "Business not found" });
    let { createFeaturedPlacementPayment: createFeaturedPlacementPayment2 } = await Promise.resolve().then(() => (init_payments2(), payments_exports)), payment = await createFeaturedPlacementPayment2({
      businessId: business.id,
      businessName: business.name,
      city: business.city,
      customerEmail: req.user.email || "",
      userId: req.user.id
    }), paymentRecord = await createPaymentRecord({
      memberId: req.user.id,
      businessId: business.id,
      type: "featured_placement",
      amount: payment.amount,
      stripePaymentIntentId: payment.id,
      status: payment.status,
      metadata: payment.metadata
    });
    return payment.status === "succeeded" && (await createFeaturedPlacement({
      businessId: business.id,
      paymentId: paymentRecord.id,
      city: business.city
    }), broadcast("featured_updated", { businessId: business.id, city: business.city })), sendPaymentReceiptEmail({
      email: req.user.email || "",
      displayName: req.user.displayName || "Member",
      type: "featured_placement",
      amount: payment.amount,
      businessName: business.name,
      paymentId: payment.id
    }).catch(() => {
    }), res.json({ data: payment });
  })), app2.post("/api/payments/cancel", requireAuth, wrapAsync(async (req, res) => {
    let { paymentId } = req.body;
    if (!paymentId)
      return res.status(400).json({ error: "paymentId is required" });
    let existing = await getPaymentById(paymentId);
    if (!existing)
      return res.status(404).json({ error: "Payment not found" });
    if (existing.memberId !== req.user.id)
      return res.status(403).json({ error: "Not authorized to cancel this payment" });
    let updated = await updatePaymentStatus(paymentId, "cancelled");
    return existing.type === "featured_placement" && (await expireFeaturedByPayment(paymentId).catch(() => {
    }), broadcast("featured_updated", { cancelled: !0 })), log.info(`Payment ${paymentId} cancelled by ${req.user.id}`), res.json({ data: { id: updated.id, status: "cancelled" } });
  }));
}

// server/routes-badges.ts
init_storage();
function registerBadgeRoutes(app2) {
  app2.get("/api/members/:id/badges", wrapAsync(async (req, res) => {
    let memberId = req.params.id, badges = await getMemberBadges(memberId);
    return res.json({ data: badges });
  })), app2.post("/api/badges/award", requireAuth, wrapAsync(async (req, res) => {
    let memberId = req.user.id, { badgeId, badgeFamily } = req.body;
    if (!badgeId || !badgeFamily)
      return res.status(400).json({ error: "badgeId and badgeFamily are required" });
    let result = await awardBadge(memberId, badgeId, badgeFamily);
    return res.json({ data: result, awarded: result !== null });
  })), app2.get("/api/badges/earned", requireAuth, wrapAsync(async (req, res) => {
    let memberId = req.user.id, badgeIds = await getEarnedBadgeIds(memberId), badgeCount = badgeIds.length;
    return res.json({ data: { badgeIds, badgeCount } });
  })), app2.get("/api/badges/leaderboard", wrapAsync(async (req, res) => {
    let limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20)), data = await getBadgeLeaderboard(limit);
    return res.json({ data });
  }));
}

// server/routes-experiments.ts
init_logger();

// shared/hash.ts
function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++)
    hash = (hash << 5) + hash + str.charCodeAt(i) >>> 0;
  return hash;
}

// server/routes-experiments.ts
init_experiment_tracker();
init_admin();
var expLog = log.tag("Experiments"), experiments3 = {
  confidence_tooltip: {
    id: "confidence_tooltip",
    description: "Show info icon tooltip on confidence badge vs no tooltip",
    active: !0,
    variants: [
      { id: "control", weight: 50 },
      { id: "treatment", weight: 50 }
    ]
  },
  trust_signal_style: {
    id: "trust_signal_style",
    description: "Text labels instead of icons for trust signals",
    active: !1,
    variants: [
      { id: "control", weight: 50 },
      { id: "treatment", weight: 50 }
    ]
  },
  personalized_weight: {
    id: "personalized_weight",
    description: "Personalized weight display vs static 'How Voting Works'",
    active: !1,
    variants: [
      { id: "control", weight: 50 },
      { id: "treatment", weight: 50 }
    ]
  }
};
function assignVariant2(userId, experimentId) {
  let experiment = experiments3[experimentId];
  if (!experiment || !experiment.active)
    return { variant: "control", isDefault: !0 };
  let key2 = `${userId}:${experimentId}`, bucket = hashString(key2) % 100, cumulative = 0;
  for (let v of experiment.variants)
    if (cumulative += v.weight, bucket < cumulative)
      return { variant: v.id, isDefault: !1 };
  return { variant: experiment.variants[0].id, isDefault: !1 };
}
function registerExperimentRoutes(app2) {
  app2.get("/api/experiments", apiRateLimiter, wrapAsync(async (_req, res) => {
    let active = Object.values(experiments3).filter((exp) => exp.active).map((exp) => ({
      id: exp.id,
      description: exp.description,
      variants: exp.variants.map((v) => v.id)
    }));
    return res.json({ data: active });
  })), app2.get("/api/experiments/assign", apiRateLimiter, wrapAsync(async (req, res) => {
    let experimentId = req.query.experimentId;
    if (!experimentId)
      return res.status(400).json({ error: "experimentId query parameter is required" });
    let userId = req.isAuthenticated && req.isAuthenticated() ? req.user.id : null;
    if (!userId)
      return res.json({
        data: {
          experimentId,
          variant: "control",
          isDefault: !0
        }
      });
    let { variant, isDefault } = assignVariant2(String(userId), experimentId), context = req.query.context || "api";
    return trackExposure(String(userId), experimentId, variant, context), expLog.info(`Assigned ${experimentId}=${variant} for user ${userId}`), res.json({
      data: {
        experimentId,
        variant,
        isDefault
      }
    });
  })), app2.get("/api/admin/experiments/metrics", requireAuth, wrapAsync(async (req, res) => {
    if (!isAdminEmail(req.user?.email))
      return res.status(403).json({ error: "Admin access required" });
    let experimentId = req.query.experimentId;
    if (!experimentId) {
      let allStats = Object.values(experiments3).filter((exp) => exp.active).map((exp) => ({
        experimentId: exp.id,
        description: exp.description,
        exposure: getExposureStats(exp.id),
        outcomes: getOutcomeStats(exp.id),
        dashboard: computeExperimentDashboard(exp.id)
      }));
      return res.json({ data: allStats });
    }
    let experiment = experiments3[experimentId];
    return experiment ? res.json({
      data: {
        experimentId: experiment.id,
        description: experiment.description,
        active: experiment.active,
        exposure: getExposureStats(experimentId),
        outcomes: getOutcomeStats(experimentId),
        dashboard: computeExperimentDashboard(experimentId)
      }
    }) : res.status(404).json({ error: `Experiment '${experimentId}' not found` });
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
import { eq as eq29, and as and17, lte as lte3 } from "drizzle-orm";
async function scheduleDeletion(userId, gracePeriodDays) {
  let now = /* @__PURE__ */ new Date(), deleteAt = new Date(now.getTime() + gracePeriodDays * 24 * 60 * 60 * 1e3);
  await db.update(deletionRequests).set({ status: "cancelled", cancelledAt: now }).where(and17(eq29(deletionRequests.memberId, userId), eq29(deletionRequests.status, "pending")));
  let [row] = await db.insert(deletionRequests).values({
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
  let now = /* @__PURE__ */ new Date();
  return (await db.update(deletionRequests).set({ status: "cancelled", cancelledAt: now }).where(and17(eq29(deletionRequests.memberId, userId), eq29(deletionRequests.status, "pending"))).returning()).length > 0;
}
async function getDeletionStatus(userId) {
  let rows = await db.select().from(deletionRequests).where(eq29(deletionRequests.memberId, userId)).orderBy(deletionRequests.requestedAt).limit(1);
  if (rows.length === 0) return null;
  let row = rows[0];
  return {
    userId: row.memberId,
    scheduledAt: row.requestedAt,
    deleteAt: row.scheduledDeletionAt,
    status: row.status
  };
}

// server/routes-auth.ts
function safeLogin(req, user, callback) {
  req.session.regenerate((regenerateErr) => {
    regenerateErr && log.warn("Session regeneration failed, proceeding with login:", regenerateErr), req.login(user, callback);
  });
}
function registerAuthRoutes(app2) {
  app2.post("/api/auth/signup", authRateLimiter, wrapAsync(async (req, res) => {
    try {
      let { password, city } = req.body, displayName = sanitizeString(req.body.displayName, 100), username = sanitizeString(req.body.username, 50), email = sanitizeEmail(req.body.email);
      if (!displayName || !username || !email || !password)
        return res.status(400).json({ error: "All fields are required" });
      if (password.length < 8)
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      if (!/\d/.test(password))
        return res.status(400).json({ error: "Password must contain at least one number" });
      let member = await registerMember({ displayName, username, email, password, city }), referralCode = sanitizeString(req.body.referralCode, 50);
      if (referralCode) {
        let { resolveReferralCode: resolveReferralCode2, createReferral: createReferral2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), referrerId = await resolveReferralCode2(referralCode);
        referrerId && referrerId !== member.id && createReferral2(referrerId, member.id, referralCode).catch(
          (err) => log.error("Referral tracking failed:", err)
        );
      }
      let { markBetaInviteJoined: markBetaInviteJoined2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      markBetaInviteJoined2(email, member.id).catch(() => {
      });
      let { generateEmailVerificationToken: generateEmailVerificationToken2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), verificationToken = await generateEmailVerificationToken2(member.id);
      sendVerificationEmail({
        email: member.email,
        displayName: member.displayName,
        token: verificationToken
      }).catch((err) => log.error("Verification email failed:", err)), sendWelcomeEmail({
        email: member.email,
        displayName: member.displayName,
        city: member.city,
        username: member.username
      }).catch((emailErr) => log.error("Welcome email failed:", emailErr)), trackEvent("signup_completed", member.id), safeLogin(
        req,
        {
          id: member.id,
          displayName: member.displayName,
          username: member.username,
          email: member.email,
          city: member.city,
          credibilityScore: member.credibilityScore,
          credibilityTier: member.credibilityTier
        },
        (err) => err ? res.status(500).json({ error: "Login failed after signup" }) : res.status(201).json({ data: req.user })
      );
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  })), app2.post("/api/auth/login", authRateLimiter, (req, res, next) => {
    passport2.authenticate("local", (err, user, info) => {
      if (err) return res.status(500).json({ error: "Internal server error" });
      if (!user) return res.status(401).json({ error: info?.message || "Invalid credentials" });
      safeLogin(req, user, (loginErr) => loginErr ? res.status(500).json({ error: "Login failed" }) : res.json({ data: user }));
    })(req, res, next);
  }), app2.post("/api/auth/google", authRateLimiter, wrapAsync(async (req, res) => {
    try {
      let { idToken } = req.body;
      if (!idToken)
        return res.status(400).json({ error: "ID token is required" });
      let member = await authenticateGoogleUser(idToken);
      safeLogin(
        req,
        {
          id: member.id,
          displayName: member.displayName,
          username: member.username,
          email: member.email,
          city: member.city,
          credibilityScore: member.credibilityScore,
          credibilityTier: member.credibilityTier
        },
        (err) => err ? res.status(500).json({ error: "Login failed" }) : res.json({ data: req.user })
      );
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  })), app2.post("/api/auth/apple", authRateLimiter, wrapAsync(async (req, res) => {
    try {
      let { identityToken, fullName, email } = req.body;
      if (!identityToken)
        return res.status(400).json({ error: "Identity token is required" });
      let member = await authenticateAppleUser(identityToken, fullName, email);
      safeLogin(
        req,
        {
          id: member.id,
          displayName: member.displayName,
          username: member.username,
          email: member.email,
          city: member.city,
          credibilityScore: member.credibilityScore,
          credibilityTier: member.credibilityTier
        },
        (err) => err ? res.status(500).json({ error: "Login failed" }) : res.json({ data: req.user })
      );
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  })), app2.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ error: "Logout failed" });
      req.session.destroy((destroyErr) => (destroyErr && log.warn("Session destroy failed on logout:", destroyErr), res.clearCookie("connect.sid"), res.json({ data: { message: "Logged out" } })));
    });
  }), app2.get("/api/auth/me", (req, res) => req.isAuthenticated() ? res.json({ data: req.user }) : res.json({ data: null })), app2.post("/api/auth/verify-email", wrapAsync(async (req, res) => {
    let token = sanitizeString(req.body.token, 100);
    if (!token)
      return res.status(400).json({ error: "Verification token is required" });
    let { verifyEmailToken: verifyEmailToken2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    return (await verifyEmailToken2(token)).success ? res.json({ data: { verified: !0 } }) : res.status(400).json({ error: "Invalid or expired verification token" });
  })), app2.post("/api/auth/resend-verification", requireAuth, wrapAsync(async (req, res) => {
    let { isEmailVerified: isEmailVerified2, generateEmailVerificationToken: generateEmailVerificationToken2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    if (await isEmailVerified2(req.user.id))
      return res.json({ data: { message: "Email already verified" } });
    let token = await generateEmailVerificationToken2(req.user.id);
    return sendVerificationEmail({
      email: req.user.email,
      displayName: req.user.displayName,
      token
    }).catch((err) => log.error("Resend verification failed:", err)), res.json({ data: { message: "Verification email sent" } });
  })), app2.post("/api/auth/forgot-password", authRateLimiter, wrapAsync(async (req, res) => {
    let email = sanitizeEmail(req.body.email);
    if (!email)
      return res.status(400).json({ error: "Email is required" });
    let { generatePasswordResetToken: generatePasswordResetToken2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), result = await generatePasswordResetToken2(email);
    return result && sendPasswordResetEmail({
      email,
      displayName: result.displayName,
      token: result.token
    }).catch((err) => log.error("Password reset email failed:", err)), res.json({ data: { message: "If an account exists with that email, a reset link has been sent" } });
  })), app2.post("/api/auth/reset-password", authRateLimiter, wrapAsync(async (req, res) => {
    let token = sanitizeString(req.body.token, 100), password = req.body.password;
    if (!token || !password)
      return res.status(400).json({ error: "Token and new password are required" });
    if (password.length < 8)
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    if (!/\d/.test(password))
      return res.status(400).json({ error: "Password must contain at least one number" });
    let hashedPassword = await (await import("bcrypt")).hash(password, 10), { resetPasswordWithToken: resetPasswordWithToken2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), result = await resetPasswordWithToken2(token, hashedPassword);
    return result.success ? res.json({ data: { message: "Password has been reset successfully" } }) : res.status(400).json({ error: result.error || "Password reset failed" });
  })), app2.get("/api/account/export", wrapAsync(async (req, res) => {
    if (!req.isAuthenticated())
      return res.status(401).json({ error: "Authentication required" });
    let userId = req.user.id, [profile, ratings6, impact, seasonal, badges] = await Promise.all([
      getMemberById(userId),
      getMemberRatings(userId, 1, 1e4),
      getMemberImpact(userId),
      getSeasonalRatingCounts(userId),
      getMemberBadges(userId)
    ]), freshExportTier = profile ? checkAndRefreshTier(profile.credibilityTier, profile.credibilityScore) : null, exportData = {
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
      ratings: ratings6 || [],
      impact: impact || null,
      seasonalActivity: seasonal || [],
      badges: badges || []
    };
    return res.setHeader("Content-Disposition", `attachment; filename="topranker-data-export-${userId}.json"`), res.json({ data: exportData });
  })), app2.delete("/api/account", wrapAsync(async (req, res) => {
    if (!req.isAuthenticated())
      return res.status(401).json({ error: "Authentication required" });
    let deletionDate = /* @__PURE__ */ new Date();
    return deletionDate.setDate(deletionDate.getDate() + 30), log.tag("AccountDeletion").info(
      `Deletion requested for user ${req.user.id}, scheduled for ${deletionDate.toISOString()}`
    ), res.json({
      data: {
        message: "Account scheduled for deletion",
        deletionDate: deletionDate.toISOString(),
        gracePeriodDays: 30,
        note: "You can cancel this request by logging in within 30 days."
      }
    });
  })), app2.post("/api/account/schedule-deletion", requireAuth, wrapAsync(async (req, res) => {
    let userId = req.user.id, request = await scheduleDeletion(userId, 30);
    return log.tag("GDPR").info(
      `Deletion scheduled for user ${userId}, deleteAt: ${request.deleteAt.toISOString()}`
    ), res.json({
      data: {
        message: "Account deletion scheduled",
        scheduledAt: request.scheduledAt.toISOString(),
        deleteAt: request.deleteAt.toISOString(),
        gracePeriodDays: 30,
        status: request.status,
        note: "You can cancel this request by checking your deletion status within 30 days."
      }
    });
  })), app2.post("/api/account/cancel-deletion", requireAuth, wrapAsync(async (req, res) => {
    let userId = req.user.id;
    return await cancelDeletion(userId) ? (log.tag("GDPR").info(`Deletion cancelled for user ${userId}`), res.json({
      data: { cancelled: !0 }
    })) : res.status(404).json({ error: "No pending deletion request found" });
  })), app2.get("/api/account/deletion-status", requireAuth, wrapAsync(async (req, res) => {
    let userId = req.user.id, status = await getDeletionStatus(userId);
    return status ? res.json({
      data: {
        hasPendingDeletion: status.status === "pending",
        scheduledAt: status.scheduledAt.toISOString(),
        deleteAt: status.deleteAt.toISOString(),
        status: status.status
      }
    }) : res.json({ data: { hasPendingDeletion: !1 } });
  }));
}

// server/routes-members.ts
init_logger();
init_storage();
init_tier_staleness();
init_file_storage();
import crypto11 from "node:crypto";
function registerMemberRoutes(app2) {
  app2.post("/api/members/me/avatar", requireAuth, wrapAsync(async (req, res) => {
    let ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
    if (!(req.headers["content-type"] || "").includes("multipart/form-data"))
      return res.status(400).json({
        error: "Avatar upload requires multipart/form-data with an 'avatar' file field."
      });
    let file = req.file;
    if (!file)
      return res.status(400).json({
        error: "No file found in multipart request. Send an 'avatar' field."
      });
    if (!ALLOWED_TYPES.includes(file.mimetype))
      return res.status(400).json({
        error: `Unsupported image type: ${file.mimetype}. Allowed: ${ALLOWED_TYPES.join(", ")}`
      });
    if (file.size > 2097152)
      return res.status(413).json({ error: "Image exceeds 2 MB limit" });
    let fileBuffer = file.buffer, contentType = file.mimetype, ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg", uniqueId = crypto11.randomBytes(8).toString("hex"), key2 = `avatars/${req.user.id}-${uniqueId}.${ext}`, avatarUrl = await fileStorage.upload(key2, fileBuffer, contentType), { updateMemberAvatar: updateMemberAvatar2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), updated = await updateMemberAvatar2(req.user.id, avatarUrl);
    return updated ? res.json({ data: { avatarUrl: updated.avatarUrl } }) : res.status(404).json({ error: "Member not found" });
  })), app2.get("/api/members/me", requireAuth, wrapAsync(async (req, res) => {
    let member = await getMemberById(req.user.id);
    if (!member) return res.status(404).json({ error: "Member not found" });
    let { score, tier: computedTier, breakdown } = await recalculateCredibilityScore(member.id), tier = checkAndRefreshTier(computedTier, score), { ratings: ratings6, total } = await getMemberRatings(member.id), { getSeasonalRatingCounts: getSeasonalRatingCounts2, getDishVoteStreakStats: getDishVoteStreakStats2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), seasonal = await getSeasonalRatingCounts2(member.id), streakStats = await getDishVoteStreakStats2(member.id), daysActive = Math.floor(
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
        ratingHistory: ratings6,
        ...seasonal,
        ...streakStats
      }
    });
  })), app2.put("/api/members/me/email", requireAuth, wrapAsync(async (req, res) => {
    let { email } = req.body;
    if (!email || typeof email != "string")
      return res.status(400).json({ error: "Email is required" });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ error: "Invalid email format" });
    try {
      let { updateMemberEmail: updateMemberEmail2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), updated = await updateMemberEmail2(req.user.id, email);
      return updated ? (log.tag("EmailChange").info(
        `Email changed for user ${req.user.id} to ${email}`
      ), res.json({ data: { email: updated.email } })) : res.status(404).json({ error: "Member not found" });
    } catch (err) {
      if (err.message === "Email already in use")
        return res.status(409).json({ error: "Email already in use" });
      throw err;
    }
  })), app2.put("/api/members/me", requireAuth, wrapAsync(async (req, res) => {
    let { displayName, firstName, lastName, username } = req.body, updates = {};
    if (displayName !== void 0) {
      if (typeof displayName != "string" || displayName.length < 1 || displayName.length > 50)
        return res.status(400).json({ error: "displayName must be 1-50 characters" });
      updates.displayName = displayName;
    }
    if (firstName !== void 0) {
      if (firstName !== null && (typeof firstName != "string" || firstName.length > 30))
        return res.status(400).json({ error: "firstName must be 0-30 characters" });
      updates.firstName = firstName;
    }
    if (lastName !== void 0) {
      if (lastName !== null && (typeof lastName != "string" || lastName.length > 30))
        return res.status(400).json({ error: "lastName must be 0-30 characters" });
      updates.lastName = lastName;
    }
    if (username !== void 0) {
      if (typeof username != "string" || !/^[a-zA-Z0-9_]{3,30}$/.test(username))
        return res.status(400).json({ error: "username must be 3-30 alphanumeric or underscore characters" });
      updates.username = username;
    }
    if (Object.keys(updates).length === 0)
      return res.status(400).json({ error: "No valid fields to update" });
    let { updateMemberProfile: updateMemberProfile2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), updated = await updateMemberProfile2(req.user.id, updates);
    return updated ? res.json({ data: updated }) : res.status(404).json({ error: "Member not found" });
  })), app2.get("/api/members/:username", wrapAsync(async (req, res) => {
    let { getMemberByUsername: getMemberByUsername2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), member = await getMemberByUsername2(req.params.username);
    if (!member) return res.status(404).json({ error: "Member not found" });
    let freshTier = checkAndRefreshTier(member.credibilityTier, member.credibilityScore);
    return res.json({
      data: {
        displayName: member.displayName,
        username: member.username,
        credibilityTier: freshTier,
        totalRatings: member.totalRatings,
        joinedAt: member.joinedAt
      }
    });
  })), app2.get("/api/members/me/impact", requireAuth, wrapAsync(async (req, res) => {
    let { getMemberImpact: getMemberImpact2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), data = await getMemberImpact2(req.user.id);
    return res.json({ data });
  })), app2.get("/api/members/me/claims", requireAuth, wrapAsync(async (req, res) => {
    let { getClaimsByMember: getClaimsByMember2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), claims2 = await getClaimsByMember2(req.user.id);
    return res.json({ data: claims2 });
  })), app2.get("/api/members/me/onboarding", requireAuth, wrapAsync(async (req, res) => {
    let { getOnboardingProgress: getOnboardingProgress2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), progress = await getOnboardingProgress2(req.user.id);
    return res.json({ data: progress });
  }));
}

// server/routes-member-notifications.ts
init_logger();
function registerMemberNotificationRoutes(app2) {
  app2.post("/api/members/me/push-token", requireAuth, wrapAsync(async (req, res) => {
    let { pushToken } = req.body;
    if (!pushToken || typeof pushToken != "string")
      return res.status(400).json({ error: "pushToken is required" });
    let { updatePushToken: updatePushToken2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    return await updatePushToken2(req.user.id, pushToken), res.json({ ok: !0 });
  })), app2.get("/api/members/me/notification-preferences", requireAuth, wrapAsync(async (req, res) => {
    let { getMemberById: getMemberById2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), prefs = {
      tierUpgrades: !0,
      challengerResults: !0,
      newChallengers: !0,
      weeklyDigest: !1,
      // Sprint 479: Push notification categories
      rankingChanges: !0,
      savedBusinessAlerts: !0,
      cityAlerts: !0,
      marketingEmails: !1,
      ...(await getMemberById2(req.user.id))?.notificationPrefs || {}
    };
    return res.json({ data: prefs });
  })), app2.put("/api/members/me/notification-preferences", requireAuth, wrapAsync(async (req, res) => {
    let {
      tierUpgrades,
      challengerResults,
      newChallengers,
      weeklyDigest,
      marketingEmails,
      // Sprint 479: Push notification categories
      rankingChanges,
      savedBusinessAlerts,
      cityAlerts
    } = req.body, prefs = {
      tierUpgrades: tierUpgrades !== !1,
      challengerResults: challengerResults !== !1,
      newChallengers: newChallengers !== !1,
      weeklyDigest: weeklyDigest === !0,
      rankingChanges: rankingChanges !== !1,
      savedBusinessAlerts: savedBusinessAlerts !== !1,
      cityAlerts: cityAlerts !== !1,
      marketingEmails: marketingEmails === !0
    }, { updateNotificationPrefs: updateNotificationPrefs2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), saved = await updateNotificationPrefs2(req.user.id, prefs);
    return log.tag("Notifications").info(`Preferences updated for user ${req.user.id}: ${JSON.stringify(saved)}`), res.json({ data: saved });
  })), app2.get("/api/members/me/notification-frequency", requireAuth, wrapAsync(async (req, res) => {
    let { getMemberById: getMemberById2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), prefs = { rankingChanges: "realtime", newRatings: "realtime", cityAlerts: "realtime", ...(await getMemberById2(req.user.id))?.notificationFrequencyPrefs || {} };
    return res.json({ data: prefs });
  })), app2.put("/api/members/me/notification-frequency", requireAuth, wrapAsync(async (req, res) => {
    let VALID = ["realtime", "daily", "weekly"], prefs = {};
    for (let key2 of ["rankingChanges", "newRatings", "cityAlerts"]) {
      let val = req.body[key2];
      prefs[key2] = VALID.includes(val) ? val : "realtime";
    }
    let { updateNotificationFrequencyPrefs: updateNotificationFrequencyPrefs2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), saved = await updateNotificationFrequencyPrefs2(req.user.id, prefs);
    return log.tag("Notifications").info(`Frequency prefs updated for user ${req.user.id}: ${JSON.stringify(saved)}`), res.json({ data: saved });
  }));
}

// server/routes-businesses.ts
init_logger();
init_storage();
init_photo_moderation();
init_google_places();
init_hours_utils();

// server/search-result-processor.ts
init_hours_utils();
function haversineKm2(lat1, lng1, lat2, lng2) {
  let dLat = (lat2 - lat1) * Math.PI / 180, dLng = (lng2 - lng1) * Math.PI / 180, a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function enrichSearchResults(bizList, photoMap, opts) {
  return bizList.map((b) => {
    let photos = photoMap[b.id] || (b.photoUrl ? [b.photoUrl] : []), searchCtx = {
      query: opts.query,
      hasPhotos: photos.length > 0,
      hasHours: !!b.closingTime,
      hasCuisine: !!b.cuisine,
      hasDescription: !!b.description,
      category: b.category,
      cuisine: b.cuisine,
      neighborhood: b.neighborhood,
      ratingCount: b.ratingCount ? Number(b.ratingCount) : 0,
      // Sprint 534: Dish-aware and city-aware relevance scoring
      dishNames: b.topDishes || [],
      city: b.city || opts.city,
      // Sprint 633: Action URL presence + city match signals
      hasActionUrls: !!b.menuUrl || !!b.orderUrl || !!b.doordashUrl,
      businessCity: b.city || void 0,
      // Sprint 641: Pass coordinates for proximity signal
      userLat: opts.userLat ?? void 0,
      userLng: opts.userLng ?? void 0,
      bizLat: b.lat ? parseFloat(b.lat) : void 0,
      bizLng: b.lng ? parseFloat(b.lng) : void 0
    }, relevanceScore = opts.query ? Math.round(combinedRelevance(b.name, searchCtx) * 100) / 100 : 0, distanceKm = null;
    opts.userLat != null && opts.userLng != null && b.lat && b.lng && (distanceKm = haversineKm2(opts.userLat, opts.userLng, parseFloat(b.lat), parseFloat(b.lng)));
    let bHours = b.openingHours, openStatus = computeOpenStatus(bHours), dynamicIsOpenNow = bHours ? openStatus.isOpen : b.isOpenNow ?? !1;
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
  return opts.dietaryTags.length > 0 && (filtered = filtered.filter((b) => {
    let bizTags = Array.isArray(b.dietaryTags) ? b.dietaryTags : [];
    return opts.dietaryTags.every((tag) => bizTags.includes(tag));
  })), opts.maxDistanceKm != null && opts.userLat != null && opts.userLng != null && (filtered = filtered.filter((b) => b.distanceKm != null && b.distanceKm <= opts.maxDistanceKm)), opts.openNow && (filtered = filtered.filter((b) => b.isOpenNow === !0)), opts.openLate && (filtered = filtered.filter((b) => {
    let h = b.openingHours;
    return isOpenLate(h);
  })), opts.openWeekends && (filtered = filtered.filter((b) => {
    let h = b.openingHours;
    return isOpenWeekends(h);
  })), filtered;
}
function sortByRelevance(data, query) {
  return query ? [...data].sort(
    (a, b) => b.relevanceScore - a.relevanceScore || parseFloat(b.weightedScore) - parseFloat(a.weightedScore)
  ) : data;
}

// server/routes-businesses.ts
function registerBusinessRoutes(app2) {
  app2.get("/api/businesses/autocomplete", wrapAsync(async (req, res) => {
    let query = sanitizeString(req.query.q, 50), city = sanitizeString(req.query.city, 100) || "Dallas";
    if (!query || query.trim().length === 0)
      return res.json({ data: [] });
    let [bizSuggestions, dishData] = await Promise.all([
      autocompleteBusinesses(query, city),
      Promise.resolve().then(() => (init_dishes(), dishes_exports)).then((m) => m.getTopDishesForAutocomplete(city, 50))
    ]), { buildDishSuggestions: buildDishSuggestions2, mergeSuggestions: mergeSuggestions2, scoreSuggestion: scoreSuggestion2 } = await Promise.resolve().then(() => (init_search_autocomplete(), search_autocomplete_exports)), bizMapped = bizSuggestions.map((b) => ({
      id: b.id,
      text: b.name,
      subtext: [b.cuisine, b.neighborhood].filter(Boolean).join(" \xB7 ") || b.category,
      type: "business",
      slug: b.slug,
      score: scoreSuggestion2(query, b.name, "business")
    })), dishSuggestions2 = buildDishSuggestions2(query, dishData), merged = mergeSuggestions2([...bizMapped, ...dishSuggestions2], 8);
    return res.json({ data: merged });
  })), app2.get("/api/businesses/popular-categories", wrapAsync(async (req, res) => {
    let city = sanitizeString(req.query.city, 100) || "Dallas", categories2 = await getPopularCategories(city);
    return res.json({ data: categories2 });
  })), app2.get("/api/businesses/search", wrapAsync(async (req, res) => {
    let query = sanitizeString(req.query.q, 200), city = sanitizeString(req.query.city, 100) || "Dallas", category = sanitizeString(req.query.category, 50) || void 0, cuisine = sanitizeString(req.query.cuisine, 50) || void 0, dietaryParam = sanitizeString(req.query.dietary, 200) || "", dietaryTags = dietaryParam ? dietaryParam.split(",").map((t) => t.trim()).filter(Boolean) : [], rawLat = req.query.lat ? parseFloat(req.query.lat) : void 0, rawLng = req.query.lng ? parseFloat(req.query.lng) : void 0, rawDist = req.query.maxDistance ? parseFloat(req.query.maxDistance) : void 0, userLat = rawLat != null && !isNaN(rawLat) ? rawLat : void 0, userLng = rawLng != null && !isNaN(rawLng) ? rawLng : void 0, maxDistanceKm = rawDist != null && !isNaN(rawDist) ? rawDist : void 0, openNow = req.query.openNow === "true", openLate = req.query.openLate === "true", openWeekends = req.query.openWeekends === "true", pageLimit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100), pageOffset = Math.max(parseInt(req.query.offset) || 0, 0), [bizList, totalCount] = await Promise.all([
      searchBusinesses(query, city, category, pageLimit, cuisine, pageOffset),
      countBusinessSearch(query, city, category, cuisine)
    ]), photoMap = await getBusinessPhotosMap(bizList.map((b) => b.id)), processingOpts = { query, userLat, userLng, maxDistanceKm, dietaryTags, openNow, openLate, openWeekends }, enriched = enrichSearchResults(bizList, photoMap, processingOpts), filtered = applySearchFilters(enriched, processingOpts), data = sortByRelevance(filtered, query);
    return res.json({
      data,
      pagination: {
        total: totalCount,
        limit: pageLimit,
        offset: pageOffset,
        hasMore: pageOffset + pageLimit < totalCount
      }
    });
  })), app2.get("/api/businesses/:slug", wrapAsync(async (req, res) => {
    let business = await getBusinessBySlug(req.params.slug);
    if (!business)
      return res.status(404).json({ error: "Business not found" });
    let [{ ratings: ratings6 }, dishList, photos, photoDetails, communityCount] = await Promise.all([
      getBusinessRatings(business.id, 1, 20),
      getBusinessDishes(business.id, 5),
      getBusinessPhotos(business.id),
      getBusinessPhotoDetails(business.id),
      getCommunityPhotoCount(business.id)
    ]);
    if (photos.length === 0 && business.googlePlaceId)
      try {
        await fetchAndStorePhotos(business.id, business.googlePlaceId) > 0 && (photos = await getBusinessPhotos(business.id), photoDetails = await getBusinessPhotoDetails(business.id));
      } catch {
      }
    business.googlePlaceId && !business.menuUrl && !business.doordashUrl && enrichBusinessActionUrls(business.id, business.googlePlaceId, business.name, business.city || "Dallas").catch(() => {
    }), business.googlePlaceId && (!business.openingHours || !business.hoursLastUpdated || Date.now() - new Date(business.hoursLastUpdated).getTime() > 864e5) && enrichBusinessFullDetails(business.id, business.googlePlaceId).catch(() => {
    });
    let photoUrls = photos.length > 0 ? photos : business.photoUrl ? [business.photoUrl] : [], photoMeta = photoDetails.length > 0 ? photoDetails : photoUrls.map((url) => ({
      url,
      uploaderName: null,
      uploadDate: (/* @__PURE__ */ new Date()).toISOString(),
      isHero: !1,
      source: "business"
    })), bHours = business.openingHours, openStatus = computeOpenStatus(bHours), dynamicIsOpenNow = bHours ? openStatus.isOpen : business.isOpenNow ?? !1;
    return res.json({ data: {
      ...business,
      photoUrls,
      photoMeta,
      communityPhotoCount: communityCount,
      recentRatings: ratings6,
      dishes: dishList,
      isOpenNow: dynamicIsOpenNow,
      closingTime: openStatus.closingTime,
      nextOpenTime: openStatus.nextOpenTime,
      todayHours: openStatus.todayHours
    } });
  })), app2.get("/api/businesses/:id/ratings", wrapAsync(async (req, res) => {
    let page = Math.max(1, parseInt(req.query.page) || 1), perPage = Math.min(50, Math.max(1, parseInt(req.query.per_page) || 20)), data = await getBusinessRatings(req.params.id, page, perPage);
    return res.json({ data });
  })), app2.post("/api/businesses/:id/photos", requireAuth, wrapAsync(async (req, res) => {
    let businessId = req.params.id, memberId = req.user.id, { data: photoData, mimeType: rawMime, caption: rawCaption } = req.body, mimeType = sanitizeString(rawMime, 50) || "image/jpeg", caption = sanitizeString(rawCaption, 500) || "", ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
    if (!ALLOWED_MIME.includes(mimeType))
      return res.status(400).json({ error: `Invalid image type. Allowed: ${ALLOWED_MIME.join(", ")}` });
    if (!photoData || typeof photoData != "string")
      return res.status(400).json({ error: "Photo data is required (base64)" });
    let buffer2 = Buffer.from(photoData, "base64"), MAX_SIZE = 10 * 1024 * 1024, MIN_SIZE = 1024;
    if (buffer2.length > MAX_SIZE)
      return res.status(400).json({ error: "Photo too large (max 10MB)" });
    if (buffer2.length < MIN_SIZE)
      return res.status(400).json({ error: "Photo too small (min 1KB)" });
    let { fileStorage: fileStorage2 } = await Promise.resolve().then(() => (init_file_storage(), file_storage_exports)), ext = mimeType.split("/")[1] || "jpeg", crypto17 = await import("crypto"), key2 = `community-photos/${businessId}/${memberId}-${crypto17.randomUUID()}.${ext}`, url = await fileStorage2.upload(key2, buffer2, mimeType), { submitPhoto: submitPhoto2 } = await Promise.resolve().then(() => (init_photo_moderation(), photo_moderation_exports)), result = await submitPhoto2(businessId, memberId, url, caption, buffer2.length, mimeType);
    return "error" in result ? res.status(400).json({ error: result.error }) : (log.info(`Community photo uploaded: ${result.id} for business ${businessId} by ${memberId}`), res.status(201).json({
      data: {
        id: result.id,
        url: result.url,
        status: result.status,
        message: "Photo submitted for review"
      }
    }));
  })), app2.put("/api/businesses/:slug/actions", requireAuth, wrapAsync(async (req, res) => {
    let biz = await getBusinessBySlug(req.params.slug);
    if (!biz) return res.status(404).json({ error: "Business not found" });
    let memberId = req.user.id;
    if (biz.ownerId !== memberId && !req.user.isAdmin)
      return res.status(403).json({ error: "Only the business owner can update action links" });
    let ACTION_FIELDS = ["menuUrl", "orderUrl", "pickupUrl", "doordashUrl", "uberEatsUrl", "reservationUrl"], updates = {};
    for (let field of ACTION_FIELDS)
      if (req.body[field] !== void 0) {
        let val = req.body[field];
        if (val !== null && (typeof val != "string" || val.length > 500))
          return res.status(400).json({ error: `${field} must be a URL string under 500 chars` });
        if (val !== null)
          try {
            let parsed = new URL(val);
            if (!["http:", "https:"].includes(parsed.protocol))
              return res.status(400).json({ error: `${field} must use http or https protocol` });
          } catch {
            return res.status(400).json({ error: `${field} is not a valid URL` });
          }
        updates[field] = val;
      }
    if (Object.keys(updates).length === 0)
      return res.status(400).json({ error: "No valid action fields to update" });
    let { updateBusinessActions: updateBusinessActions2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), updated = await updateBusinessActions2(biz.id, updates);
    return res.json({ data: updated });
  }));
}

// server/routes-claims.ts
init_storage();
function registerClaimRoutes(app2) {
  app2.post("/api/businesses/:slug/claim", requireAuth, wrapAsync(async (req, res) => {
    let business = await getBusinessBySlug(req.params.slug);
    if (!business)
      return res.status(404).json({ error: "Business not found" });
    let role = sanitizeString(req.body.role, 100), phone = sanitizeString(req.body.phone, 20), businessEmail = sanitizeString(req.body.businessEmail, 100), website = sanitizeString(req.body.website, 200), preferredMethod = sanitizeString(req.body.verificationMethod, 20) || "email";
    if (!role || role.length === 0)
      return res.status(400).json({ error: "Role is required" });
    let { getClaimByMemberAndBusiness: getClaimByMemberAndBusiness2, submitClaim: submitClaim2, submitClaimWithCode: submitClaimWithCode2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    if (await getClaimByMemberAndBusiness2(req.user.id, business.id))
      return res.status(409).json({ error: "You already have a pending or approved claim for this business" });
    let parts = [`role:${role}`, `method:${preferredMethod}`];
    phone && parts.push(`phone:${phone}`), businessEmail && parts.push(`email:${businessEmail}`), website && parts.push(`website:${website}`);
    let verificationMethod = parts.join(" | ");
    if (preferredMethod === "email" && businessEmail) {
      let claim2 = await submitClaimWithCode2(business.id, req.user.id, verificationMethod), { sendClaimVerificationCodeEmail: sendClaimVerificationCodeEmail2, sendClaimAdminNotification: sendClaimAdminNotification3 } = await Promise.resolve().then(() => (init_email(), email_exports));
      return sendClaimVerificationCodeEmail2({
        email: businessEmail,
        displayName: req.user.displayName || "User",
        businessName: business.name,
        code: claim2.verificationCode || ""
      }).catch(() => {
      }), sendClaimAdminNotification3({
        businessName: business.name,
        claimantName: req.user.displayName || "Unknown",
        claimantEmail: req.user.email || ""
      }).catch(() => {
      }), res.json({ data: { id: claim2.id, status: claim2.status, requiresCode: !0 } });
    }
    let claim = await submitClaim2(business.id, req.user.id, verificationMethod), { sendClaimConfirmationEmail: sendClaimConfirmationEmail2, sendClaimAdminNotification: sendClaimAdminNotification2 } = await Promise.resolve().then(() => (init_email(), email_exports));
    return sendClaimConfirmationEmail2({
      email: req.user.email || "",
      displayName: req.user.displayName || "User",
      businessName: business.name
    }).catch(() => {
    }), sendClaimAdminNotification2({
      businessName: business.name,
      claimantName: req.user.displayName || "Unknown",
      claimantEmail: req.user.email || ""
    }).catch(() => {
    }), res.json({ data: { id: claim.id, status: claim.status } });
  })), app2.post("/api/businesses/claims/:claimId/verify", claimVerifyRateLimiter, requireAuth, wrapAsync(async (req, res) => {
    let { claimId } = req.params, code = sanitizeString(req.body.code, 6);
    if (!code || code.length !== 6)
      return res.status(400).json({ error: "6-digit verification code required" });
    let { verifyClaimByCode: verifyClaimByCode2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), result = await verifyClaimByCode2(claimId, req.user.id, code);
    if (!result.success)
      return res.status(400).json({ error: result.error });
    let { getClaimByMemberAndBusiness: getClaimByMemberAndBusiness2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), { sendClaimApprovedEmail: sendClaimApprovedEmail2 } = await Promise.resolve().then(() => (init_email(), email_exports));
    return sendClaimApprovedEmail2({
      email: req.user.email || "",
      displayName: req.user.displayName || "User",
      businessName: "your business"
    }).catch(() => {
    }), res.json({ data: { verified: !0 } });
  }));
}

// server/routes-business-analytics.ts
init_storage();

// server/dashboard-analytics.ts
function computeWeeklyVolume(ratings6, weeks = 12) {
  let now = /* @__PURE__ */ new Date(), result = [];
  for (let w = weeks - 1; w >= 0; w--) {
    let weekStart = new Date(now.getTime() - (w + 1) * 7 * 864e5), weekEnd = new Date(now.getTime() - w * 7 * 864e5), weekRatings = ratings6.filter((r) => {
      let d = new Date(r.createdAt).getTime();
      return d >= weekStart.getTime() && d < weekEnd.getTime();
    }), scores = weekRatings.map((r) => parseFloat(r.rawScore));
    result.push({
      period: weekStart.toISOString().split("T")[0],
      count: weekRatings.length,
      avgScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10 : 0
    });
  }
  return result;
}
function computeMonthlyVolume(ratings6, months = 6) {
  let now = /* @__PURE__ */ new Date(), result = [];
  for (let m = months - 1; m >= 0; m--) {
    let monthStart = new Date(now.getFullYear(), now.getMonth() - m, 1), monthEnd = new Date(now.getFullYear(), now.getMonth() - m + 1, 1), monthRatings = ratings6.filter((r) => {
      let d = new Date(r.createdAt).getTime();
      return d >= monthStart.getTime() && d < monthEnd.getTime();
    }), scores = monthRatings.map((r) => parseFloat(r.rawScore));
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
  let recent = weeklyVolume.slice(-2).reduce((sum2, w) => sum2 + w.count, 0), previous = weeklyVolume.slice(-4, -2).reduce((sum2, w) => sum2 + w.count, 0);
  return previous === 0 ? recent > 0 ? 100 : 0 : Math.round((recent - previous) / previous * 100);
}
function extractSparklineScores(ratings6, limit = 20) {
  return ratings6.slice(0, limit).map((r) => parseFloat(r.rawScore)).reverse();
}
function buildDashboardTrend(ratings6) {
  let weeklyVolume = computeWeeklyVolume(ratings6), monthlyVolume = computeMonthlyVolume(ratings6);
  return {
    weeklyVolume,
    monthlyVolume,
    velocityChange: computeVelocityChange(weeklyVolume),
    sparklineScores: extractSparklineScores(ratings6)
  };
}

// server/dimension-breakdown.ts
function avgOrZero(scores) {
  return scores.length === 0 ? 0 : Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10;
}
function toNum(val) {
  if (val == null) return null;
  let n = typeof val == "string" ? parseFloat(val) : val;
  return isNaN(n) ? null : n;
}
function computeDimensionBreakdown(ratings6) {
  let dist = { dineIn: 0, delivery: 0, takeaway: 0 }, food = [], service = [], vibe = [], packaging = [], waitTime = [], value = [];
  for (let r of ratings6) {
    let vt = (r.visitType || "dine_in").toLowerCase().replace(/[-\s]/g, "_");
    vt === "dine_in" || vt === "dinein" ? dist.dineIn++ : vt === "delivery" ? dist.delivery++ : vt === "takeaway" || vt === "pickup" ? dist.takeaway++ : dist.dineIn++;
    let f = toNum(r.foodScore);
    f !== null && food.push(f);
    let s = toNum(r.serviceScore);
    s !== null && service.push(s);
    let v = toNum(r.vibeScore);
    v !== null && vibe.push(v);
    let p = toNum(r.packagingScore);
    p !== null && packaging.push(p);
    let w = toNum(r.waitTimeScore);
    w !== null && waitTime.push(w);
    let val = toNum(r.valueScore);
    val !== null && value.push(val);
  }
  let maxVisit = Math.max(dist.dineIn, dist.delivery, dist.takeaway), primaryVisitType = maxVisit === dist.delivery ? "delivery" : maxVisit === dist.takeaway ? "takeaway" : "dineIn";
  return {
    dimensions: {
      food: avgOrZero(food),
      service: avgOrZero(service),
      vibe: avgOrZero(vibe),
      packaging: avgOrZero(packaging),
      waitTime: avgOrZero(waitTime),
      value: avgOrZero(value)
    },
    visitTypeDistribution: dist,
    totalRatings: ratings6.length,
    primaryVisitType
  };
}

// server/city-dimension-averages.ts
init_db();
init_schema();
import { eq as eq30, and as and18, sql as sql17 } from "drizzle-orm";
var CACHE_TTL_MS2 = 300 * 1e3, cache2 = /* @__PURE__ */ new Map();
function round1(n) {
  return Math.round(n * 10) / 10;
}
async function computeCityDimensionAverages(city) {
  let key2 = city.toLowerCase().trim(), now = Date.now(), cached = cache2.get(key2);
  if (cached && cached.expiresAt > now) return cached.data;
  let r = (await db.select({
    foodAvg: sql17`AVG(${ratings.foodScore})`,
    serviceAvg: sql17`AVG(${ratings.serviceScore})`,
    vibeAvg: sql17`AVG(${ratings.vibeScore})`,
    packagingAvg: sql17`AVG(${ratings.packagingScore})`,
    waitTimeAvg: sql17`AVG(${ratings.waitTimeScore})`,
    valueAvg: sql17`AVG(${ratings.valueScore})`,
    totalRatings: sql17`COUNT(*)`,
    totalBusinesses: sql17`COUNT(DISTINCT ${ratings.businessId})`
  }).from(ratings).innerJoin(businesses, eq30(ratings.businessId, businesses.id)).where(and18(
    sql17`LOWER(${businesses.city}) = LOWER(${city})`,
    eq30(businesses.isActive, !0),
    eq30(ratings.isFlagged, !1)
  )))[0], result = {
    food: round1(Number(r?.foodAvg) || 0),
    service: round1(Number(r?.serviceAvg) || 0),
    vibe: round1(Number(r?.vibeAvg) || 0),
    packaging: round1(Number(r?.packagingAvg) || 0),
    waitTime: round1(Number(r?.waitTimeAvg) || 0),
    value: round1(Number(r?.valueAvg) || 0),
    totalRatings: Number(r?.totalRatings) || 0,
    totalBusinesses: Number(r?.totalBusinesses) || 0
  };
  if (cache2.size >= 50)
    for (let [k, v] of cache2)
      v.expiresAt <= now && cache2.delete(k);
  return cache2.set(key2, { data: result, expiresAt: now + CACHE_TTL_MS2 }), result;
}

// server/routes-business-analytics.ts
function registerBusinessAnalyticsRoutes(app2) {
  app2.get("/api/businesses/:slug/dashboard", requireAuth, wrapAsync(async (req, res) => {
    let business = await getBusinessBySlug(req.params.slug);
    if (!business)
      return res.status(404).json({ error: "Business not found" });
    let { isAdminEmail: isAdminEmail2 } = await Promise.resolve().then(() => (init_admin(), admin_exports)), isOwner = business.ownerId && business.ownerId === req.user.id, isAdmin = isAdminEmail2(req.user?.email);
    if (!isOwner && !isAdmin)
      return res.status(403).json({ error: "Dashboard access requires business ownership" });
    let { getRankHistory: getRankHistory2, getBusinessDishes: getBusinessDishes2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), [{ ratings: ratings6, total }, rankHistory2, dishes2, allRatingsResult] = await Promise.all([
      getBusinessRatings(business.id, 1, 10),
      getRankHistory2(business.id, 49),
      getBusinessDishes2(business.id, 5),
      getBusinessRatings(business.id, 1, 200)
      // Sprint 478: all ratings for trend analysis
    ]), totalRatings = business.totalRatings || 0, avgScore = business.rawAvgScore ? parseFloat(business.rawAvgScore) : 0, rankPosition = business.rankPosition || 0, rankDelta = business.rankDelta || 0, returners = ratings6.filter((r) => r.wouldReturn === !0).length, returnTotal = ratings6.filter((r) => r.wouldReturn !== null && r.wouldReturn !== void 0).length, wouldReturnPct = returnTotal > 0 ? Math.round(returners / returnTotal * 100) : 0, topDish = dishes2.length > 0 ? dishes2[0] : null, ratingTrend = rankHistory2.map((h) => h.score), isPro = business.subscriptionStatus === "active" || business.subscriptionStatus === "trialing" || isAdmin, trendData = buildDashboardTrend(allRatingsResult.ratings), baseData = {
      totalRatings,
      avgScore,
      rankPosition,
      rankDelta,
      wouldReturnPct,
      topDish: topDish ? { name: topDish.name, votes: topDish.voteCount || 0 } : null,
      ratingTrend: isPro ? ratingTrend : ratingTrend.slice(-7),
      // Free: 7 days, Pro: full history
      recentRatings: (isPro ? ratings6 : ratings6.slice(0, 3)).map((r) => ({
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
  })), app2.get("/api/businesses/:id/rank-history", wrapAsync(async (req, res) => {
    let { getRankHistory: getRankHistory2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), days = Math.min(90, Math.max(7, parseInt(req.query.days) || 30)), data = await getRankHistory2(req.params.id, days);
    return res.json({ data });
  })), app2.get("/api/businesses/:id/dimension-breakdown", wrapAsync(async (req, res) => {
    let businessId = req.params.id;
    if (isNaN(Number(businessId))) {
      let business = await getBusinessBySlug(businessId);
      if (!business) return res.status(404).json({ error: "Business not found" });
      businessId = String(business.id);
    }
    let { ratings: ratings6 } = await getBusinessRatings(businessId, 1, 200), data = computeDimensionBreakdown(ratings6);
    return res.json({ data });
  })), app2.get("/api/cities/:city/dimension-averages", wrapAsync(async (req, res) => {
    let city = decodeURIComponent(req.params.city), data = await computeCityDimensionAverages(city);
    return res.json({ data });
  }));
}

// server/routes-dishes.ts
init_schema();
init_storage();
function registerDishRoutes(app2) {
  app2.get("/api/dish-leaderboards", wrapAsync(async (req, res) => {
    let city = sanitizeString(req.query.city, 100) || "dallas", data = await getDishLeaderboards(city);
    return res.json({ data });
  })), app2.get("/api/dish-leaderboards/:slug", wrapAsync(async (req, res) => {
    let slug = req.params.slug, city = sanitizeString(req.query.city, 100) || "dallas", visitType = sanitizeString(req.query.visitType, 20) || void 0, result = await getDishLeaderboardWithEntries(slug, city, visitType);
    if (!result) return res.status(404).json({ error: "Dish leaderboard not found" });
    let { leaderboard, entries, isProvisional, minRatingsNeeded, visitTypeBreakdown } = result;
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
      minRatingsNeeded,
      visitTypeBreakdown
    } });
  })), app2.get("/api/dish-suggestions", wrapAsync(async (req, res) => {
    let city = sanitizeString(req.query.city, 100) || "dallas", data = await getDishSuggestions(city);
    return res.json({ data });
  })), app2.post("/api/dish-suggestions", requireAuth, wrapAsync(async (req, res) => {
    let parsed = insertDishSuggestionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });
    let memberId = req.user.id;
    try {
      let suggestion = await submitDishSuggestion(memberId, parsed.data.city, parsed.data.dishName);
      return res.status(201).json({ data: suggestion });
    } catch (err) {
      return err.message.includes("3 dishes per week") ? res.status(429).json({ error: err.message }) : res.status(400).json({ error: err.message });
    }
  })), app2.post("/api/dish-suggestions/:id/vote", requireAuth, wrapAsync(async (req, res) => {
    let memberId = req.user.id;
    try {
      let suggestion = await voteDishSuggestion(memberId, req.params.id);
      return res.json({ data: suggestion });
    } catch (err) {
      return err.message.includes("Already voted") ? res.status(409).json({ error: err.message }) : res.status(400).json({ error: err.message });
    }
  })), app2.get("/api/businesses/:id/top-dishes", wrapAsync(async (req, res) => {
    let businessId = req.params.id, { getBusinessDishes: getBusinessDishes2 } = await Promise.resolve().then(() => (init_dishes(), dishes_exports)), enriched = (await getBusinessDishes2(businessId, 10)).map((d) => ({
      id: d.id,
      name: d.name,
      slug: d.slug,
      voteCount: d.voteCount,
      photoUrl: d.photoUrl
    }));
    return res.json({ data: enriched });
  })), app2.get("/api/businesses/:id/dish-rankings", wrapAsync(async (req, res) => {
    let businessId = req.params.id, { getBusinessDishRankings: getBusinessDishRankings2 } = await Promise.resolve().then(() => (init_dishes(), dishes_exports)), rankings = await getBusinessDishRankings2(businessId);
    return res.json({ data: rankings });
  }));
}

// server/routes-seo.ts
init_storage();
init_config();
var SITE_URL2 = config.siteUrl;
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
  }), app2.get("/sitemap.xml", wrapAsync(async (_req, res) => {
    let cities = ["dallas", "fort-worth", "austin", "houston", "san-antonio"], allBoards = [];
    for (let city of cities) {
      let boards = await getDishLeaderboards(city);
      for (let b of boards)
        allBoards.push({ slug: b.dishSlug, city });
    }
    let today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0], xml = `<?xml version="1.0" encoding="UTF-8"?>
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
    for (let board of allBoards)
      xml += `
  <url>
    <loc>${SITE_URL2}/dish/${board.slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
    <lastmod>${today}</lastmod>
  </url>`;
    xml += `
</urlset>`, res.type("application/xml").send(xml);
  })), app2.get("/api/seo/dish/:slug", wrapAsync(async (req, res) => {
    let { getDishLeaderboardWithEntries: getDishLeaderboardWithEntries2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), slug = req.params.slug, city = req.query.city || "dallas", board = await getDishLeaderboardWithEntries2(slug, city);
    if (!board)
      return res.status(404).json({ error: "Not found" });
    let cityTitle = city.charAt(0).toUpperCase() + city.slice(1), entries = board.entries || [], jsonLd = {
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
  })), app2.get("/api/seo/challenger/:id", wrapAsync(async (req, res) => {
    let { getActiveChallenges: getActiveChallenges2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports)), { challengers: challengers2, businesses: businesses2 } = await Promise.resolve().then(() => (init_schema(), schema_exports)), { eq: eq35 } = await import("drizzle-orm"), challengeId = req.params.id, [challenge] = await db2.select().from(challengers2).where(eq35(challengers2.id, challengeId));
    if (!challenge)
      return res.status(404).json({ error: "Challenge not found" });
    let [challengerBiz, defenderBiz] = await Promise.all([
      db2.select().from(businesses2).where(eq35(businesses2.id, challenge.challengerId)).then((r) => r[0]),
      db2.select().from(businesses2).where(eq35(businesses2.id, challenge.defenderId)).then((r) => r[0])
    ]), challengerName = challengerBiz?.name || "Challenger", defenderName = defenderBiz?.name || "Defender", isActive = challenge.status === "active", daysLeft = isActive ? Math.max(0, Math.ceil((new Date(challenge.endDate).getTime() - Date.now()) / (1e3 * 60 * 60 * 24))) : 0, title = `${challengerName} vs ${defenderName} \u2014 ${challenge.category}`, description = isActive ? `${daysLeft} days left to vote! Who has the best ${challenge.category.toLowerCase()} in ${challenge.city}?` : challenge.winnerId ? `Challenge complete! See who won the ${challenge.category.toLowerCase()} showdown in ${challenge.city}.` : `It was a draw! ${challenge.category} challenge in ${challenge.city}.`;
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
init_config();
var qrLog = log.tag("QR"), SITE_URL3 = config.siteUrl;
function registerQrRoutes(app2) {
  app2.get("/api/businesses/:slug/qr", wrapAsync(async (req, res) => {
    let business = await getBusinessBySlug(req.params.slug);
    if (!business)
      return res.status(404).json({ error: "Business not found" });
    let rateUrl = `${SITE_URL3}/rate/${business.slug}?source=qr`, profileUrl = `${SITE_URL3}/business/${business.slug}`;
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
          footer: "topranker.io"
        }
      }
    });
  })), app2.post("/api/qr/scan", wrapAsync(async (req, res) => {
    let businessId = sanitizeString(req.body.businessId, 100);
    if (!businessId)
      return res.status(400).json({ error: "businessId is required" });
    let { getBusinessById: getBusinessById2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), business = await getBusinessById2(businessId);
    if (!business)
      return res.status(404).json({ error: "Business not found" });
    let { recordQrScan: recordQrScan2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), memberId = req.user?.id || null, scan = await recordQrScan2(businessId, memberId);
    return qrLog.info(`QR scan: business=${business.name}, member=${memberId || "anonymous"}`), res.json({
      data: {
        scanId: scan.id,
        businessSlug: business.slug,
        businessName: business.name
      }
    });
  })), app2.get("/api/businesses/:slug/qr-stats", requireAuth, wrapAsync(async (req, res) => {
    let business = await getBusinessBySlug(req.params.slug);
    if (!business)
      return res.status(404).json({ error: "Business not found" });
    let { isAdminEmail: isAdminEmail2 } = await Promise.resolve().then(() => (init_admin(), admin_exports)), isOwner = business.ownerId && business.ownerId === req.user.id, isAdmin = isAdminEmail2(req.user?.email);
    if (!isOwner && !isAdmin)
      return res.status(403).json({ error: "QR stats require business ownership" });
    let { getQrScanStats: getQrScanStats2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), stats2 = await getQrScanStats2(business.id);
    return res.json({ data: stats2 });
  }));
}

// server/routes-notifications.ts
init_logger();

// server/notifications.ts
init_logger();
var notifLog = log.tag("Notifications"), store = /* @__PURE__ */ new Map();
function getNotifications(memberId, limit) {
  return (store.get(memberId) || []).slice(0, limit || 20);
}
function getUnreadCount(memberId) {
  return (store.get(memberId) || []).filter((n) => !n.read).length;
}
function markAsRead(notificationId) {
  for (let list of store.values()) {
    let notif = list.find((n) => n.id === notificationId);
    if (notif)
      return notif.read = !0, !0;
  }
  return !1;
}
function markAllRead(memberId) {
  let list = store.get(memberId) || [], count17 = 0;
  for (let n of list)
    n.read || (n.read = !0, count17++);
  return count17;
}
function deleteNotification(notificationId) {
  for (let [memberId, list] of store) {
    let idx = list.findIndex((n) => n.id === notificationId);
    if (idx !== -1)
      return list.splice(idx, 1), !0;
  }
  return !1;
}

// server/routes-notifications.ts
init_push_analytics();
init_push_ab_testing();
var notifRouteLog = log.tag("NotifRoutes");
function registerNotificationRoutes(app2) {
  app2.get("/api/notifications", requireAuth, (req, res) => {
    let memberId = req.memberId || "anonymous", page = parseInt(req.query.page) || 1, perPage = parseInt(req.query.perPage) || 20, all = getNotifications(memberId, 100), totalPages = Math.ceil(all.length / perPage) || 1, start = (page - 1) * perPage, notifications2 = all.slice(start, start + perPage);
    res.json({ notifications: notifications2, unreadCount: getUnreadCount(memberId), page, perPage, totalPages });
  }), app2.get("/api/notifications/unread-count", requireAuth, (req, res) => {
    let memberId = req.memberId || "anonymous";
    res.json({ count: getUnreadCount(memberId) });
  }), app2.post("/api/notifications/:id/read", requireAuth, (req, res) => {
    if (!markAsRead(req.params.id)) return res.status(404).json({ error: "Notification not found" });
    res.json({ success: !0 });
  }), app2.post("/api/notifications/mark-all-read", requireAuth, (req, res) => {
    let memberId = req.memberId || "anonymous", count17 = markAllRead(memberId);
    res.json({ markedRead: count17 });
  }), app2.delete("/api/notifications/:id", requireAuth, (req, res) => {
    if (!deleteNotification(req.params.id)) return res.status(404).json({ error: "Notification not found" });
    res.json({ success: !0 });
  }), app2.post("/api/notifications/opened", requireAuth, (req, res) => {
    let memberId = req.memberId || "anonymous", { notificationId, category } = req.body;
    if (!notificationId || !category)
      return res.status(400).json({ error: "notificationId and category required" });
    let safeCategory = String(category).slice(0, 50), recorded = recordNotificationOpen(
      String(notificationId).slice(0, 100),
      safeCategory,
      memberId
    );
    recorded && recordPushExperimentOpen(memberId, safeCategory), res.json({ success: !0, recorded });
  }), app2.get("/api/notifications/insights", (req, res) => {
    let daysBack = parseInt(req.query.daysBack) || 7, insights = getNotificationInsights(Math.min(daysBack, 90));
    res.json({ data: insights });
  });
}

// server/routes-referrals.ts
init_config();
function registerReferralRoutes(app2) {
  app2.get("/api/referrals/me", requireAuth, wrapAsync(async (req, res) => {
    let { getReferralStats: getReferralStats2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), stats2 = await getReferralStats2(req.user.id), code = req.user.username.toUpperCase(), shareUrl = `${config.siteUrl}/join?ref=${encodeURIComponent(code)}`;
    return res.json({
      data: {
        code,
        shareUrl,
        ...stats2
      }
    });
  })), app2.get("/api/referrals/validate", wrapAsync(async (req, res) => {
    let code = (req.query.code || "").trim();
    if (!code)
      return res.status(400).json({ error: "Referral code is required" });
    let { resolveReferralCode: resolveReferralCode2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    return await resolveReferralCode2(code) ? res.json({ data: { valid: !0 } }) : res.json({ data: { valid: !1 } });
  }));
}

// server/routes-unsubscribe.ts
init_db();
init_schema();
init_logger();
import { eq as eq31 } from "drizzle-orm";

// server/unsubscribe-tokens.ts
init_config();
import crypto12 from "crypto";
var SECRET = config.unsubscribeSecret;
function hmac(data) {
  return crypto12.createHmac("sha256", SECRET).update(data).digest("base64url");
}
function verifyUnsubscribeToken(token) {
  let parts = token.split(".");
  if (parts.length < 3) return null;
  let signature = parts.pop(), type = parts.pop(), memberId = parts.join("."), expected = hmac(`${memberId}.${type}`);
  return crypto12.timingSafeEqual(Buffer.from(signature), Buffer.from(expected)) ? { memberId, type } : null;
}

// server/routes-unsubscribe.ts
var VALID_TYPES = ["drip", "weekly", "all"];
function flagsForType(type, value) {
  return type === "drip" ? { emailDrip: value } : type === "weekly" ? { weeklyDigest: value } : { emailDrip: value, weeklyDigest: value };
}
function labelForType(type) {
  return type === "drip" ? "drip campaign" : type === "weekly" ? "weekly digest" : "all";
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
    let token = sanitizeString(req.query.token, 200);
    if (!token)
      return res.status(400).send(htmlPage("Invalid Request", "<p>Missing or invalid parameters.</p>"));
    let memberId, type, signed = verifyUnsubscribeToken(token);
    if (signed && VALID_TYPES.includes(signed.type))
      memberId = signed.memberId, type = signed.type;
    else if (memberId = token, type = sanitizeString(req.query.type, 10) || "all", !VALID_TYPES.includes(type))
      return res.status(400).send(htmlPage("Invalid Request", "<p>Missing or invalid parameters.</p>"));
    let [member] = await db.select().from(members).where(eq31(members.id, memberId)).limit(1);
    if (!member)
      return res.status(404).send(htmlPage("Not Found", "<p>We couldn't find that account.</p>"));
    let updated = { ...member.notificationPrefs || {}, ...flagsForType(type, !1) };
    await db.update(members).set({ notificationPrefs: updated }).where(eq31(members.id, memberId)), log.info(`Unsubscribed member ${memberId} from ${type} emails`);
    let label = labelForType(type), resubLink = `/api/resubscribe?token=${encodeURIComponent(token)}&type=${encodeURIComponent(type)}`;
    return res.send(htmlPage("Unsubscribed", `<p>You've been unsubscribed from <strong>${label}</strong> emails.</p><p><a href="${resubLink}">Re-subscribe</a></p>`));
  })), app2.get("/api/resubscribe", wrapAsync(async (req, res) => {
    let token = sanitizeString(req.query.token, 200);
    if (!token)
      return res.status(400).send(htmlPage("Invalid Request", "<p>Missing or invalid parameters.</p>"));
    let memberId, type, signed = verifyUnsubscribeToken(token);
    if (signed && VALID_TYPES.includes(signed.type))
      memberId = signed.memberId, type = signed.type;
    else if (memberId = token, type = sanitizeString(req.query.type, 10) || "all", !VALID_TYPES.includes(type))
      return res.status(400).send(htmlPage("Invalid Request", "<p>Missing or invalid parameters.</p>"));
    let [member] = await db.select().from(members).where(eq31(members.id, memberId)).limit(1);
    if (!member)
      return res.status(404).send(htmlPage("Not Found", "<p>We couldn't find that account.</p>"));
    let updated = { ...member.notificationPrefs || {}, ...flagsForType(type, !0) };
    await db.update(members).set({ notificationPrefs: updated }).where(eq31(members.id, memberId)), log.info(`Resubscribed member ${memberId} to ${type} emails`);
    let label = labelForType(type);
    return res.send(htmlPage("Re-subscribed", `<p>You've been re-subscribed to <strong>${label}</strong> emails. Welcome back!</p>`));
  }));
}

// server/routes-webhooks.ts
init_logger();
init_config();
import crypto13 from "node:crypto";
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
  let expected = crypto13.createHmac("sha256", secret).update(payload).digest("hex");
  return crypto13.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
function registerWebhookRoutes(app2) {
  app2.post("/api/webhooks/resend", wrapAsync(async (req, res) => {
    let rawBody = JSON.stringify(req.body), secret = config.resendWebhookSecret;
    if (secret) {
      let signature = req.headers["resend-signature"];
      if (!signature || !verifySignature2(rawBody, signature, secret))
        return log.warn("Resend webhook: invalid signature"), res.status(400).json({ error: "Invalid webhook signature" });
    } else
      log.warn("Resend webhook: RESEND_WEBHOOK_SECRET not set \u2014 skipping signature verification (dev mode)");
    let { type, data } = req.body, eventId = getTrackingIdFromResend(data.email_id) || data.email_id;
    switch (log.info(`Resend webhook: ${type} for email ${eventId}`), type) {
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
        let reason = String(data.reason || data.error || type);
        await trackEmailFailed(eventId, reason);
        break;
      }
      default:
        log.info(`Resend webhook: unhandled event type "${type}"`);
    }
    return res.json({ received: !0 });
  }));
}

// server/routes-city-stats.ts
init_logger();
init_db();
init_schema();
import { eq as eq32, and as and19, gte as gte8 } from "drizzle-orm";
var cityLog = log.tag("CityStats");
function registerCityStatsRoutes(app2) {
  app2.get("/api/city-stats/:city", async (req, res) => {
    let city = req.params.city;
    cityLog.info(`Fetching city stats for ${city}`);
    let activeBiz = await db.select({
      id: businesses.id,
      weightedScore: businesses.weightedScore,
      totalRatings: businesses.totalRatings
    }).from(businesses).where(
      and19(eq32(businesses.city, city), eq32(businesses.isActive, !0))
    );
    if (activeBiz.length === 0)
      return res.json({
        city,
        totalBusinesses: 0,
        avgWeightedScore: 0,
        avgRatingCount: 0,
        avgWouldReturnPct: 0,
        recentRatingsCount: 0,
        dimensionAvgs: {}
      });
    let scores = activeBiz.map((b) => parseFloat(b.weightedScore || "0")).filter((s) => s > 0), avgWeightedScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 100) / 100 : 0, ratingCounts = activeBiz.map((b) => b.totalRatings || 0), avgRatingCount = Math.round(ratingCounts.reduce((a, b) => a + b, 0) / ratingCounts.length), thirtyDaysAgo = new Date(Date.now() - 720 * 60 * 60 * 1e3), recentRatings = await db.select({
      wouldReturn: ratings.wouldReturn,
      q1Score: ratings.q1Score,
      q2Score: ratings.q2Score,
      q3Score: ratings.q3Score
    }).from(ratings).where(
      gte8(ratings.createdAt, thirtyDaysAgo)
    ), withReturn = recentRatings.filter((r) => r.wouldReturn != null), avgWouldReturnPct = withReturn.length > 0 ? Math.round(withReturn.filter((r) => r.wouldReturn).length / withReturn.length * 100) : 0, dimensionAvgs = {}, dimKeys = [
      { key: "q1Score", label: "food" },
      { key: "q2Score", label: "service" },
      { key: "q3Score", label: "vibe" }
    ];
    for (let { key: key2, label } of dimKeys) {
      let vals = recentRatings.map((r) => parseFloat(String(r[key2] || "0"))).filter((v) => v > 0);
      vals.length > 0 && (dimensionAvgs[label] = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length * 100) / 100);
    }
    let result = {
      city,
      totalBusinesses: activeBiz.length,
      avgWeightedScore,
      avgRatingCount,
      avgWouldReturnPct,
      recentRatingsCount: recentRatings.length,
      dimensionAvgs
    };
    cityLog.info(`City stats for ${city}: ${activeBiz.length} businesses, avg score ${avgWeightedScore}`), res.json(result);
  });
}

// server/routes-push.ts
init_logger();
init_push_notifications();
var pushRouteLog = log.tag("PushRoutes");
function registerPushRoutes(app2) {
  app2.post("/api/push/register", requireAuth, (req, res) => {
    let memberId = req.user?.id || req.memberId;
    if (!memberId)
      return res.status(401).json({ error: "Authentication required" });
    let { token, platform } = req.body;
    if (!token || typeof token != "string")
      return res.status(400).json({ error: "token is required" });
    if (!platform || !["ios", "android", "web"].includes(platform))
      return res.status(400).json({ error: "platform must be ios, android, or web" });
    let result = registerPushToken(memberId, token, platform);
    pushRouteLog.info(`Token registered for member ${memberId}`), res.json({ token: result });
  }), app2.delete("/api/push/token", requireAuth, (req, res) => {
    let memberId = req.user?.id || req.memberId;
    if (!memberId)
      return res.status(401).json({ error: "Authentication required" });
    let { token } = req.body;
    if (!token || typeof token != "string")
      return res.status(400).json({ error: "token is required" });
    if (!removePushToken(memberId, token))
      return res.status(404).json({ error: "Token not found" });
    pushRouteLog.info(`Token removed for member ${memberId}`), res.json({ removed: !0 });
  }), app2.get("/api/push/tokens", requireAuth, (req, res) => {
    let memberId = req.user?.id || req.memberId;
    if (!memberId)
      return res.status(401).json({ error: "Authentication required" });
    let tokens2 = getMemberTokens(memberId);
    res.json({ tokens: tokens2 });
  }), app2.get("/api/admin/push/stats", requireAuth, (req, res) => {
    let user = req.user;
    if (!user?.role || user.role !== "admin")
      return res.status(403).json({ error: "Admin access required" });
    let stats2 = getPushStats();
    res.json({ stats: stats2 });
  }), app2.post("/api/admin/push/broadcast", requireAuth, (req, res) => {
    let user = req.user;
    if (!user?.role || user.role !== "admin")
      return res.status(403).json({ error: "Admin access required" });
    let { memberIds, title, body, data } = req.body;
    if (!Array.isArray(memberIds) || memberIds.length === 0)
      return res.status(400).json({ error: "memberIds array is required" });
    if (!title || typeof title != "string")
      return res.status(400).json({ error: "title is required" });
    if (!body || typeof body != "string")
      return res.status(400).json({ error: "body is required" });
    let result = sendBulkPush(memberIds, title, body, data);
    pushRouteLog.info(`Broadcast sent: ${result.sent} sent, ${result.failed} failed`), res.json({ result });
  });
}

// server/routes-owner-dashboard.ts
init_logger();

// server/business-analytics.ts
init_logger();
var bizAnalyticsLog = log.tag("BusinessAnalytics"), viewEvents = [];
function getBusinessMetrics(businessId, period) {
  let now = Date.now(), days = period === "7d" ? 7 : period === "30d" ? 30 : 90, cutoff = new Date(now - days * 24 * 60 * 60 * 1e3).toISOString(), relevant = viewEvents.filter(
    (e) => e.businessId === businessId && e.timestamp >= cutoff
  ), uniqueVisitorSet = new Set(relevant.map((e) => e.visitorId));
  return bizAnalyticsLog.info(
    `Metrics for ${businessId} (${period}): ${relevant.length} views, ${uniqueVisitorSet.size} unique`
  ), {
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
  let counts = /* @__PURE__ */ new Map();
  for (let e of viewEvents)
    counts.set(e.businessId, (counts.get(e.businessId) || 0) + 1);
  return Array.from(counts.entries()).map(([businessId, views]) => ({ businessId, views })).sort((a, b) => b.views - a.views).slice(0, limit || 10);
}
function getViewSources(businessId) {
  let sources = {
    search: 0,
    direct: 0,
    challenger: 0,
    referral: 0
  };
  for (let e of viewEvents)
    e.businessId === businessId && (sources[e.source] = (sources[e.source] || 0) + 1);
  return sources;
}
function getAnalyticsStats() {
  let businesses2 = new Set(viewEvents.map((e) => e.businessId)), visitors = new Set(viewEvents.map((e) => e.visitorId));
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
    let { businessId } = req.params, period = req.query.period || "30d";
    ownerDashLog.info(`Fetching analytics for business ${businessId} (${period})`), res.json(getBusinessMetrics(businessId, period));
  }), app2.get("/api/owner/analytics/:businessId/sources", (req, res) => {
    let { businessId } = req.params;
    ownerDashLog.info(`Fetching view sources for business ${businessId}`), res.json(getViewSources(businessId));
  }), app2.get("/api/owner/analytics/:businessId/trends", (req, res) => {
    let { businessId } = req.params;
    ownerDashLog.info(`Fetching trends for business ${businessId}`), res.json({
      weekly: getBusinessMetrics(businessId, "7d"),
      monthly: getBusinessMetrics(businessId, "30d")
    });
  }), app2.get("/api/admin/analytics/top-businesses", (req, res) => {
    let limit = parseInt(req.query.limit) || 10;
    ownerDashLog.info(`Fetching top businesses (limit: ${limit})`), res.json(getTopBusinesses(limit));
  }), app2.get("/api/admin/analytics/stats", (_req, res) => {
    ownerDashLog.info("Fetching analytics stats"), res.json(getAnalyticsStats());
  }), app2.put("/api/owner/businesses/:businessId/hours", requireAuth, wrapAsync(async (req, res) => {
    let { businessId } = req.params, memberId = req.user?.id;
    if (!memberId) return res.status(401).json({ error: "Unauthorized" });
    let { openingHours } = req.body;
    if (!openingHours || typeof openingHours != "object")
      return res.status(400).json({ error: "openingHours object required" });
    if (openingHours.periods && !Array.isArray(openingHours.periods))
      return res.status(400).json({ error: "periods must be an array" });
    if (openingHours.weekday_text && Array.isArray(openingHours.weekday_text) && !openingHours.periods) {
      let { weekdayTextToPeriods: weekdayTextToPeriods2 } = await Promise.resolve().then(() => (init_hours_utils(), hours_utils_exports));
      openingHours.periods = weekdayTextToPeriods2(openingHours.weekday_text);
    }
    let { updateBusinessHours: updateBusinessHours2 } = await Promise.resolve().then(() => (init_businesses(), businesses_exports));
    return await updateBusinessHours2(businessId, memberId, openingHours) ? (ownerDashLog.info(`Owner ${memberId} updated hours for business ${businessId}`), res.json({ success: !0, hoursLastUpdated: (/* @__PURE__ */ new Date()).toISOString() })) : res.status(403).json({ error: "Not the owner of this business" });
  }));
}

// server/routes-search.ts
init_logger();
init_search_suggestions();

// server/search-query-tracker.ts
init_logger();
var queryLog = log.tag("SearchQueryTracker"), queryIndex = /* @__PURE__ */ new Map(), MAX_ENTRIES_PER_CITY = 500, DECAY_INTERVAL_MS = 36e5, DECAY_FACTOR = 0.9, MIN_QUERY_LENGTH = 2;
function normalizeQuery(q) {
  return q.trim().toLowerCase().replace(/\s+/g, " ");
}
function trackSearchQuery(query, city) {
  if (!query || query.length < MIN_QUERY_LENGTH) return;
  let normalized = normalizeQuery(query);
  if (normalized.length < MIN_QUERY_LENGTH) return;
  queryIndex.has(city) || queryIndex.set(city, /* @__PURE__ */ new Map());
  let cityMap = queryIndex.get(city), existing = cityMap.get(normalized);
  if (existing)
    existing.count += 1, existing.lastSearched = Date.now();
  else {
    if (cityMap.size >= MAX_ENTRIES_PER_CITY) {
      let minKey = "", minCount = 1 / 0;
      for (let [key2, entry] of cityMap)
        entry.count < minCount && (minCount = entry.count, minKey = key2);
      minKey && cityMap.delete(minKey);
    }
    cityMap.set(normalized, {
      query: normalized,
      count: 1,
      lastSearched: Date.now(),
      city
    });
  }
}
function getPopularQueries(city, limit = 8) {
  let cityMap = queryIndex.get(city);
  return !cityMap || cityMap.size === 0 ? [] : Array.from(cityMap.values()).filter((e) => e.count >= 2).sort((a, b) => b.count - a.count || b.lastSearched - a.lastSearched).slice(0, limit).map((e) => ({
    query: e.query,
    count: e.count,
    lastSearched: e.lastSearched
  }));
}
function getQueryTrackerStats() {
  let topCities = Array.from(queryIndex.entries()).map(([city, map]) => ({ city, queryCount: map.size })).sort((a, b) => b.queryCount - a.queryCount);
  return {
    totalCities: queryIndex.size,
    totalQueries: topCities.reduce((sum2, c) => sum2 + c.queryCount, 0),
    topCities
  };
}
function applyQueryDecay() {
  for (let [city, cityMap] of queryIndex) {
    for (let [key2, entry] of cityMap)
      entry.count = Math.floor(entry.count * DECAY_FACTOR), entry.count <= 0 && cityMap.delete(key2);
    cityMap.size === 0 && queryIndex.delete(city);
  }
  queryLog.debug("Query decay applied");
}
setInterval(applyQueryDecay, DECAY_INTERVAL_MS);

// server/routes-search.ts
var searchRouteLog = log.tag("SearchRoutes");
function registerSearchRoutes(app2) {
  app2.get("/api/search/suggestions", (req, res) => {
    let query = sanitizeString(req.query.q, 200) || "", city = sanitizeString(req.query.city, 100) || "Dallas", limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    if (!query)
      return res.json({ data: [] });
    let suggestions = getSuggestions(query, city, limit);
    return searchRouteLog.info(`Suggestions for "${query}" in ${city}: ${suggestions.length} results`), res.json({ data: suggestions });
  }), app2.get("/api/search/popular", (req, res) => {
    let city = sanitizeString(req.query.city, 100) || "Dallas", limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 5)), popular = getPopularSearches(city, limit);
    return res.json({ data: popular });
  }), app2.post("/api/search/track", (req, res) => {
    let query = sanitizeString(req.body?.query, 200) || "", city = sanitizeString(req.body?.city, 100) || "Dallas";
    return query.length >= 2 && trackSearchQuery(query, city), res.json({ data: { tracked: !0 } });
  }), app2.get("/api/search/popular-queries", (req, res) => {
    let city = sanitizeString(req.query.city, 100) || "Dallas", limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 8)), queries = getPopularQueries(city, limit);
    return res.json({ data: queries });
  }), app2.get("/api/admin/search/index-stats", (req, res) => {
    let cities = getAllIndexedCities(), stats2 = cities.map((city) => ({
      city,
      count: getCitySuggestionCount(city)
    }));
    return res.json({ data: { cities: stats2, totalCities: cities.length } });
  }), app2.get("/api/admin/search/query-stats", (req, res) => {
    let stats2 = getQueryTrackerStats();
    return res.json({ data: stats2 });
  });
}

// shared/best-in-categories.ts
var BEST_IN_CATEGORIES = [
  // ── Indian Cuisine ───────────────────────────────────────
  { slug: "biryani", displayName: "Biryani", emoji: "\u{1F35A}", parentCategory: "restaurant", cuisine: "indian", city: "Dallas", description: "Find the best biryani in Dallas, rated by real diners", tags: ["hyderabadi", "dum biryani", "chicken biryani", "goat biryani", "veg biryani"], isActive: !0, sortOrder: 1 },
  { slug: "dosa", displayName: "Dosa", emoji: "\u{1FAD3}", parentCategory: "restaurant", cuisine: "indian", city: "Dallas", description: "Find the best dosa in Dallas", tags: ["masala dosa", "paper dosa", "mysore dosa", "rava dosa", "onion dosa"], isActive: !0, sortOrder: 2 },
  { slug: "butter-chicken", displayName: "Butter Chicken", emoji: "\u{1F357}", parentCategory: "restaurant", cuisine: "indian", city: "Dallas", description: "Find the best butter chicken in Dallas", tags: ["murgh makhani", "tikka masala", "chicken curry"], isActive: !0, sortOrder: 3 },
  { slug: "chai", displayName: "Chai", emoji: "\u2615", parentCategory: "cafe", cuisine: "indian", city: "Dallas", description: "Find the best chai in Dallas", tags: ["masala chai", "cutting chai", "karak", "adrak chai"], isActive: !0, sortOrder: 4 },
  { slug: "samosa", displayName: "Samosa", emoji: "\u{1F95F}", parentCategory: "restaurant", cuisine: "indian", city: "Dallas", description: "Find the best samosa in Dallas", tags: ["aloo samosa", "keema samosa", "samosa chaat"], isActive: !0, sortOrder: 5 },
  { slug: "tandoori", displayName: "Tandoori", emoji: "\u{1F356}", parentCategory: "restaurant", cuisine: "indian", city: "Dallas", description: "Find the best tandoori in Dallas", tags: ["tandoori chicken", "seekh kebab", "naan", "tandoori paneer"], isActive: !0, sortOrder: 6 },
  { slug: "chaat", displayName: "Chaat", emoji: "\u{1F963}", parentCategory: "street_food", cuisine: "indian", city: "Dallas", description: "Find the best chaat in Dallas", tags: ["pani puri", "bhel puri", "dahi puri", "sev puri", "papdi chaat"], isActive: !0, sortOrder: 7 },
  { slug: "thali", displayName: "Thali", emoji: "\u{1F371}", parentCategory: "restaurant", cuisine: "indian", city: "Dallas", description: "Find the best thali in Dallas", tags: ["gujarati thali", "south indian thali", "rajasthani thali", "punjabi thali"], isActive: !0, sortOrder: 8 },
  // ── Mexican Cuisine ──────────────────────────────────────
  { slug: "tacos", displayName: "Tacos", emoji: "\u{1F32E}", parentCategory: "restaurant", cuisine: "mexican", city: "Dallas", description: "Find the best tacos in Dallas", tags: ["street tacos", "al pastor", "carnitas", "birria", "barbacoa"], isActive: !0, sortOrder: 10 },
  { slug: "burritos", displayName: "Burritos", emoji: "\u{1F32F}", parentCategory: "restaurant", cuisine: "mexican", city: "Dallas", description: "Find the best burritos in Dallas", tags: ["carne asada", "breakfast burrito", "wet burrito", "california burrito"], isActive: !0, sortOrder: 11 },
  { slug: "enchiladas", displayName: "Enchiladas", emoji: "\u{1F336}", parentCategory: "restaurant", cuisine: "mexican", city: "Dallas", description: "Find the best enchiladas in Dallas", tags: ["cheese enchiladas", "mole", "verde", "suizas"], isActive: !0, sortOrder: 12 },
  { slug: "queso", displayName: "Queso", emoji: "\u{1F9C0}", parentCategory: "restaurant", cuisine: "mexican", city: "Dallas", description: "Find the best queso in Dallas", tags: ["chile con queso", "queso fundido", "queso flameado"], isActive: !0, sortOrder: 13 },
  { slug: "margaritas", displayName: "Margaritas", emoji: "\u{1F379}", parentCategory: "bar", cuisine: "mexican", city: "Dallas", description: "Find the best margaritas in Dallas", tags: ["frozen margarita", "top shelf", "spicy margarita", "mango"], isActive: !0, sortOrder: 14 },
  { slug: "tamales", displayName: "Tamales", emoji: "\u{1FAD4}", parentCategory: "restaurant", cuisine: "mexican", city: "Dallas", description: "Find the best tamales in Dallas", tags: ["pork tamales", "chicken tamales", "sweet tamales", "rajas"], isActive: !0, sortOrder: 15 },
  // ── Japanese Cuisine ─────────────────────────────────────
  { slug: "sushi", displayName: "Sushi", emoji: "\u{1F363}", parentCategory: "restaurant", cuisine: "japanese", city: "Dallas", description: "Find the best sushi in Dallas", tags: ["omakase", "nigiri", "sashimi", "rolls", "chirashi"], isActive: !0, sortOrder: 20 },
  { slug: "ramen", displayName: "Ramen", emoji: "\u{1F35C}", parentCategory: "restaurant", cuisine: "japanese", city: "Dallas", description: "Find the best ramen in Dallas", tags: ["tonkotsu", "miso", "shoyu", "spicy", "tsukemen"], isActive: !0, sortOrder: 21 },
  { slug: "udon", displayName: "Udon", emoji: "\u{1F35C}", parentCategory: "restaurant", cuisine: "japanese", city: "Dallas", description: "Find the best udon in Dallas", tags: ["tempura udon", "kitsune udon", "nabeyaki", "yaki udon"], isActive: !0, sortOrder: 22 },
  { slug: "katsu", displayName: "Katsu", emoji: "\u{1F371}", parentCategory: "restaurant", cuisine: "japanese", city: "Dallas", description: "Find the best katsu in Dallas", tags: ["tonkatsu", "chicken katsu", "katsu curry", "katsu sando"], isActive: !0, sortOrder: 23 },
  // ── Chinese Cuisine ──────────────────────────────────────
  { slug: "dim-sum", displayName: "Dim Sum", emoji: "\u{1F95F}", parentCategory: "restaurant", cuisine: "chinese", city: "Dallas", description: "Find the best dim sum in Dallas", tags: ["har gow", "siu mai", "char siu bao", "egg tart", "cheung fun"], isActive: !0, sortOrder: 25 },
  { slug: "hot-pot", displayName: "Hot Pot", emoji: "\u{1FAD5}", parentCategory: "restaurant", cuisine: "chinese", city: "Dallas", description: "Find the best hot pot in Dallas", tags: ["sichuan hot pot", "mala", "shabu shabu", "mongolian"], isActive: !0, sortOrder: 26 },
  { slug: "kung-pao", displayName: "Kung Pao", emoji: "\u{1F336}", parentCategory: "restaurant", cuisine: "chinese", city: "Dallas", description: "Find the best kung pao in Dallas", tags: ["kung pao chicken", "mapo tofu", "dan dan noodles"], isActive: !0, sortOrder: 27 },
  { slug: "peking-duck", displayName: "Peking Duck", emoji: "\u{1F986}", parentCategory: "restaurant", cuisine: "chinese", city: "Dallas", description: "Find the best Peking duck in Dallas", tags: ["roast duck", "crispy duck", "duck pancakes"], isActive: !0, sortOrder: 28 },
  // ── Vietnamese Cuisine ───────────────────────────────────
  { slug: "pho", displayName: "Pho", emoji: "\u{1F35C}", parentCategory: "restaurant", cuisine: "vietnamese", city: "Dallas", description: "Find the best pho in Dallas", tags: ["pho bo", "pho ga", "bun bo hue", "pho tai"], isActive: !0, sortOrder: 30 },
  { slug: "banh-mi", displayName: "Banh Mi", emoji: "\u{1F956}", parentCategory: "restaurant", cuisine: "vietnamese", city: "Dallas", description: "Find the best banh mi in Dallas", tags: ["pork banh mi", "grilled chicken", "tofu banh mi", "pate"], isActive: !0, sortOrder: 31 },
  { slug: "bun-bo-hue", displayName: "Bun Bo Hue", emoji: "\u{1F35C}", parentCategory: "restaurant", cuisine: "vietnamese", city: "Dallas", description: "Find the best bun bo hue in Dallas", tags: ["spicy beef noodle", "vermicelli", "lemongrass"], isActive: !0, sortOrder: 32 },
  // ── Korean Cuisine ───────────────────────────────────────
  { slug: "korean-bbq", displayName: "Korean BBQ", emoji: "\u{1F969}", parentCategory: "restaurant", cuisine: "korean", city: "Dallas", description: "Find the best Korean BBQ in Dallas", tags: ["galbi", "bulgogi", "samgyeopsal", "banchan"], isActive: !0, sortOrder: 35 },
  { slug: "bibimbap", displayName: "Bibimbap", emoji: "\u{1F35A}", parentCategory: "restaurant", cuisine: "korean", city: "Dallas", description: "Find the best bibimbap in Dallas", tags: ["dolsot bibimbap", "stone pot", "mixed rice"], isActive: !0, sortOrder: 36 },
  { slug: "fried-chicken", displayName: "Fried Chicken", emoji: "\u{1F357}", parentCategory: "restaurant", cuisine: "korean", city: "Dallas", description: "Find the best Korean fried chicken in Dallas", tags: ["korean fried", "yangnyeom", "dakgangjeong", "honey butter"], isActive: !0, sortOrder: 37 },
  // ── Thai Cuisine ─────────────────────────────────────────
  { slug: "pad-thai", displayName: "Pad Thai", emoji: "\u{1F35C}", parentCategory: "restaurant", cuisine: "thai", city: "Dallas", description: "Find the best pad thai in Dallas", tags: ["shrimp pad thai", "chicken pad thai", "tofu pad thai"], isActive: !0, sortOrder: 40 },
  { slug: "green-curry", displayName: "Green Curry", emoji: "\u{1F35B}", parentCategory: "restaurant", cuisine: "thai", city: "Dallas", description: "Find the best green curry in Dallas", tags: ["green curry", "red curry", "massaman", "panang"], isActive: !0, sortOrder: 41 },
  { slug: "mango-sticky-rice", displayName: "Mango Sticky Rice", emoji: "\u{1F96D}", parentCategory: "dessert", cuisine: "thai", city: "Dallas", description: "Find the best mango sticky rice in Dallas", tags: ["khao niaow ma muang", "coconut cream", "sticky rice"], isActive: !0, sortOrder: 42 },
  // ── Italian Cuisine ──────────────────────────────────────
  { slug: "pizza", displayName: "Pizza", emoji: "\u{1F355}", parentCategory: "pizza", cuisine: "italian", city: "Dallas", description: "Find the best pizza in Dallas", tags: ["neapolitan", "ny style", "deep dish", "wood fired", "margherita"], isActive: !0, sortOrder: 45 },
  { slug: "pasta", displayName: "Pasta", emoji: "\u{1F35D}", parentCategory: "restaurant", cuisine: "italian", city: "Dallas", description: "Find the best pasta in Dallas", tags: ["carbonara", "cacio e pepe", "bolognese", "pesto", "amatriciana"], isActive: !0, sortOrder: 46 },
  { slug: "tiramisu", displayName: "Tiramisu", emoji: "\u{1F370}", parentCategory: "dessert", cuisine: "italian", city: "Dallas", description: "Find the best tiramisu in Dallas", tags: ["classic tiramisu", "espresso", "mascarpone"], isActive: !0, sortOrder: 47 },
  { slug: "gelato", displayName: "Gelato", emoji: "\u{1F366}", parentCategory: "dessert", cuisine: "italian", city: "Dallas", description: "Find the best gelato in Dallas", tags: ["pistachio", "stracciatella", "hazelnut", "artisan gelato"], isActive: !0, sortOrder: 48 },
  // ── American / BBQ / Southern ────────────────────────────
  { slug: "bbq", displayName: "BBQ", emoji: "\u{1F525}", parentCategory: "bbq", cuisine: "american", city: "Dallas", description: "Find the best BBQ in Dallas", tags: ["brisket", "ribs", "pulled pork", "smoked", "texas bbq"], isActive: !0, sortOrder: 50 },
  { slug: "burgers", displayName: "Burgers", emoji: "\u{1F354}", parentCategory: "restaurant", cuisine: "american", city: "Dallas", description: "Find the best burgers in Dallas", tags: ["smash burger", "wagyu", "double stack", "cheeseburger"], isActive: !0, sortOrder: 51 },
  { slug: "wings", displayName: "Wings", emoji: "\u{1F357}", parentCategory: "restaurant", cuisine: "american", city: "Dallas", description: "Find the best wings in Dallas", tags: ["buffalo", "lemon pepper", "hot wings", "garlic parmesan"], isActive: !0, sortOrder: 52 },
  { slug: "brisket", displayName: "Brisket", emoji: "\u{1F969}", parentCategory: "bbq", cuisine: "american", city: "Dallas", description: "Find the best brisket in Dallas", tags: ["texas brisket", "smoked brisket", "salt and pepper", "post oak"], isActive: !0, sortOrder: 53 },
  { slug: "southern-fried-chicken", displayName: "Southern Fried Chicken", emoji: "\u{1F357}", parentCategory: "restaurant", cuisine: "american", city: "Dallas", description: "Find the best fried chicken in Dallas", tags: ["nashville hot", "southern", "buttermilk", "honey butter"], isActive: !0, sortOrder: 54 },
  { slug: "mac-and-cheese", displayName: "Mac & Cheese", emoji: "\u{1F9C0}", parentCategory: "restaurant", cuisine: "american", city: "Dallas", description: "Find the best mac and cheese in Dallas", tags: ["baked mac", "smoked gouda", "truffle mac", "lobster mac"], isActive: !0, sortOrder: 55 },
  // ── Mediterranean / Middle Eastern ───────────────────────
  { slug: "shawarma", displayName: "Shawarma", emoji: "\u{1F959}", parentCategory: "restaurant", cuisine: "mediterranean", city: "Dallas", description: "Find the best shawarma in Dallas", tags: ["chicken shawarma", "beef shawarma", "shawarma plate", "garlic sauce"], isActive: !0, sortOrder: 60 },
  { slug: "falafel", displayName: "Falafel", emoji: "\u{1F9C6}", parentCategory: "restaurant", cuisine: "mediterranean", city: "Dallas", description: "Find the best falafel in Dallas", tags: ["falafel wrap", "falafel plate", "hummus", "tahini"], isActive: !0, sortOrder: 61 },
  { slug: "hummus", displayName: "Hummus", emoji: "\u{1F963}", parentCategory: "restaurant", cuisine: "mediterranean", city: "Dallas", description: "Find the best hummus in Dallas", tags: ["classic hummus", "spicy hummus", "roasted garlic", "pita"], isActive: !0, sortOrder: 62 },
  // ── Universal (Drinks & Desserts) ────────────────────────
  { slug: "coffee", displayName: "Coffee", emoji: "\u2615", parentCategory: "cafe", cuisine: "universal", city: "Dallas", description: "Find the best coffee in Dallas", tags: ["espresso", "cold brew", "pour over", "latte", "cortado"], isActive: !0, sortOrder: 70 },
  { slug: "bubble-tea", displayName: "Bubble Tea", emoji: "\u{1F9CB}", parentCategory: "cafe", cuisine: "universal", city: "Dallas", description: "Find the best bubble tea in Dallas", tags: ["boba", "taro", "matcha", "brown sugar", "tiger milk"], isActive: !0, sortOrder: 71 },
  { slug: "ice-cream", displayName: "Ice Cream", emoji: "\u{1F366}", parentCategory: "dessert", cuisine: "universal", city: "Dallas", description: "Find the best ice cream in Dallas", tags: ["gelato", "kulfi", "soft serve", "artisan", "rolled ice cream"], isActive: !0, sortOrder: 72 },
  { slug: "brunch", displayName: "Brunch", emoji: "\u{1F95E}", parentCategory: "restaurant", cuisine: "universal", city: "Dallas", description: "Find the best brunch in Dallas", tags: ["mimosa", "eggs benedict", "french toast", "pancakes", "avocado toast"], isActive: !0, sortOrder: 73 }
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
  let q = query.toLowerCase().trim();
  return q ? BEST_IN_CATEGORIES.filter(
    (c) => c.slug.toLowerCase().includes(q) || c.displayName.toLowerCase().includes(q) || c.cuisine.toLowerCase().includes(q) || c.tags.some((t) => t.toLowerCase().includes(q))
  ) : [];
}
function getBestInTitle(slug, city) {
  let cat = getCategoryBySlug(slug), name = cat ? cat.displayName : slug, targetCity = city || (cat ? cat.city : "Dallas");
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
    let categories2 = getActiveCategories();
    return res.json({ data: categories2 });
  })), app2.get("/api/best-in/search", wrapAsync(async (req, res) => {
    let q = sanitizeString(req.query.q, 200) || "";
    if (!q) return res.json({ data: [] });
    let results = searchCategories(q);
    return res.json({ data: results });
  })), app2.get("/api/best-in/:slug", wrapAsync(async (req, res) => {
    let slug = req.params.slug, category = getCategoryBySlug(slug);
    if (!category)
      return res.status(404).json({ error: "Category not found" });
    let title = getBestInTitle(slug);
    return res.json({
      data: {
        ...category,
        title,
        businesses: []
        // TODO: wire to storage layer
      }
    });
  })), app2.get("/api/best-in/:slug/leaderboard", wrapAsync(async (req, res) => {
    let slug = req.params.slug, category = getCategoryBySlug(slug);
    if (!category)
      return res.status(404).json({ error: "Category not found" });
    let city = sanitizeString(req.query.city, 100) || category.city, title = getBestInTitle(slug, city), leaderboard = generateLeaderboardEntries(slug), message = leaderboard.length === 0 ? "Not enough ratings yet. Be one of the first to rate!" : void 0;
    return res.json({
      data: {
        category: { slug: category.slug, displayName: category.displayName, emoji: category.emoji },
        title,
        leaderboard,
        message
      }
    });
  })), app2.get("/api/admin/best-in/stats", requireAuth, wrapAsync(async (req, res) => {
    let counts = getCategoryCount(), byParent = {};
    for (let cat of BEST_IN_CATEGORIES)
      byParent[cat.parentCategory] = (byParent[cat.parentCategory] || 0) + 1;
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
init_photo_hash();
init_phash();
import crypto15 from "crypto";
var photoLog = log.tag("RatingPhoto"), ALLOWED_MIME_TYPES2 = ["image/jpeg", "image/png", "image/webp"], MAX_FILE_SIZE2 = 10 * 1024 * 1024, PHOTO_BOOST = 0.15, MAX_VERIFICATION_BOOST = 0.5;
function registerRatingPhotoRoutes(app2) {
  app2.post("/api/ratings/:id/photo", uploadRateLimiter, requireAuth, wrapAsync(async (req, res) => {
    let ratingId = req.params.id, memberId = req.user.id, { getRatingById: getRatingById2 } = await Promise.resolve().then(() => (init_ratings(), ratings_exports)), rating = await getRatingById2(ratingId);
    if (!rating)
      return res.status(404).json({ error: "Rating not found" });
    if (rating.memberId !== memberId)
      return res.status(403).json({ error: "Cannot upload photo for another user's rating" });
    let { data: photoData, mimeType: rawMime, isReceipt: rawIsReceipt } = req.body, isReceipt = rawIsReceipt === !0, mimeType = sanitizeString(rawMime, 50) || "image/jpeg";
    if (!photoData || typeof photoData != "string")
      return res.status(400).json({ error: "Photo data is required (base64)" });
    if (!ALLOWED_MIME_TYPES2.includes(mimeType))
      return res.status(400).json({ error: `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES2.join(", ")}` });
    let buffer2 = Buffer.from(photoData, "base64");
    if (buffer2.length > MAX_FILE_SIZE2)
      return res.status(400).json({ error: "Photo too large (max 10MB)" });
    if (buffer2.length < 1024)
      return res.status(400).json({ error: "Photo too small \u2014 may be corrupted" });
    let dupResult = detectDuplicate(buffer2, memberId), pHash = computePerceptualHash(buffer2), nearDup = dupResult.isDuplicate ? null : findNearDuplicates(pHash, memberId), ext = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg", cdnKey = `rating-photos/${rating.businessId}/${ratingId}-${crypto15.randomUUID().slice(0, 8)}.${ext}`;
    try {
      let photoUrl = await fileStorage.upload(cdnKey, buffer2, mimeType), { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports)), { ratingPhotos: ratingPhotos2, ratings: ratings6 } = await Promise.resolve().then(() => (init_schema(), schema_exports)), { eq: eq35 } = await import("drizzle-orm"), [photo] = await db2.insert(ratingPhotos2).values({
        ratingId,
        photoUrl,
        cdnKey,
        contentHash: dupResult.hash,
        // Sprint 587: persist hash for startup preload
        perceptualHash: pHash,
        // Sprint 592: persist pHash for startup preload
        isVerifiedReceipt: isReceipt === !0
      }).returning();
      if (registerPhotoHash(dupResult.hash, ratingId, memberId, rating.businessId, photo.id), registerPHash(pHash, ratingId, memberId, rating.businessId, photo.id), dupResult.isCrossMember && dupResult.original) {
        let { addToQueue: addToQueue2 } = await Promise.resolve().then(() => (init_moderation_queue(), moderation_queue_exports));
        addToQueue2({
          type: "duplicate_photo",
          contentId: photo.id,
          contentType: "rating_photo",
          memberId,
          businessId: rating.businessId,
          reason: `Exact duplicate of photo ${dupResult.original.photoId} from member ${dupResult.original.memberId} on rating ${dupResult.original.ratingId}`,
          severity: "high"
        }), photoLog.warn("Cross-member duplicate flagged for moderation", {
          photoId: photo.id,
          ratingId,
          originalPhotoId: dupResult.original.photoId
        });
      }
      if (nearDup && nearDup.isCrossMember) {
        let { addToQueue: addToQueue2 } = await Promise.resolve().then(() => (init_moderation_queue(), moderation_queue_exports));
        addToQueue2({
          type: "near_duplicate_photo",
          contentId: photo.id,
          contentType: "rating_photo",
          memberId,
          businessId: rating.businessId,
          reason: `Near-duplicate (distance ${nearDup.distance}) of photo ${nearDup.match.photoId} from member ${nearDup.match.memberId}`,
          severity: "medium"
        });
      }
      let totalBoost = Math.min(PHOTO_BOOST + (isReceipt === !0 ? 0.25 : 0), MAX_VERIFICATION_BOOST), currentBoost = parseFloat(String(rating.verificationBoost ?? "0")), newBoost = Math.min(currentBoost + totalBoost, MAX_VERIFICATION_BOOST);
      await db2.update(ratings6).set({
        hasPhoto: !0,
        hasReceipt: isReceipt === !0 ? !0 : void 0,
        verificationBoost: newBoost.toFixed(3)
      }).where(eq35(ratings6.id, ratingId));
      let { recalculateBusinessScore: recalculateBusinessScore2, recalculateRanks: recalculateRanks2 } = await Promise.resolve().then(() => (init_businesses(), businesses_exports)), { getBusinessById: getBusinessById2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      await recalculateBusinessScore2(rating.businessId);
      let biz = await getBusinessById2(rating.businessId);
      if (biz && await recalculateRanks2(biz.city, biz.category), isReceipt === !0) {
        let { queueReceiptForAnalysis: queueReceiptForAnalysis2 } = await Promise.resolve().then(() => (init_receipt_analysis(), receipt_analysis_exports));
        await queueReceiptForAnalysis2(photo.id, ratingId, rating.businessId);
      }
      return photoLog.info("Rating photo uploaded", {
        ratingId,
        memberId,
        cdnKey,
        isReceipt: isReceipt === !0,
        boost: totalBoost
      }), res.status(201).json({
        data: {
          id: photo.id,
          photoUrl,
          isReceipt: isReceipt === !0,
          verificationBoost: totalBoost,
          isDuplicate: dupResult.isDuplicate,
          isCrossMemberDuplicate: dupResult.isCrossMember,
          isNearDuplicate: !!nearDup
        }
      });
    } catch (err) {
      return photoLog.error("Photo upload failed", { ratingId, error: err.message }), res.status(500).json({ error: "Photo upload failed. Please try again." });
    }
  })), app2.get("/api/ratings/:id/photos", wrapAsync(async (req, res) => {
    let ratingId = req.params.id, { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports)), { ratingPhotos: ratingPhotos2 } = await Promise.resolve().then(() => (init_schema(), schema_exports)), { eq: eq35 } = await import("drizzle-orm"), mapped = (await db2.select().from(ratingPhotos2).where(eq35(ratingPhotos2.ratingId, ratingId))).map((p) => ({ ...p, isPhotoVerified: !!p.contentHash }));
    return res.json({ data: mapped });
  }));
}

// server/routes-score-breakdown.ts
init_logger();
init_score_engine();
var breakdownLog = log.tag("ScoreBreakdown");
function registerScoreBreakdownRoutes(app2) {
  app2.get("/api/businesses/:id/score-breakdown", wrapAsync(async (req, res) => {
    let businessId = req.params.id, { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports)), { ratings: ratings6 } = await Promise.resolve().then(() => (init_schema(), schema_exports)), { eq: eq35, and: and21, sql: sql20, count: count17 } = await import("drizzle-orm"), allRatings = await db2.select({
      visitType: ratings6.visitType,
      foodScore: ratings6.foodScore,
      serviceScore: ratings6.serviceScore,
      vibeScore: ratings6.vibeScore,
      packagingScore: ratings6.packagingScore,
      waitTimeScore: ratings6.waitTimeScore,
      valueScore: ratings6.valueScore,
      compositeScore: ratings6.compositeScore,
      rawScore: ratings6.rawScore,
      weight: ratings6.weight,
      weightedScore: ratings6.weightedScore,
      effectiveWeight: ratings6.effectiveWeight,
      verificationBoost: ratings6.verificationBoost,
      hasPhoto: ratings6.hasPhoto,
      hasReceipt: ratings6.hasReceipt,
      wouldReturn: ratings6.wouldReturn,
      createdAt: ratings6.createdAt
    }).from(ratings6).where(and21(
      eq35(ratings6.businessId, businessId),
      eq35(ratings6.isFlagged, !1)
    ));
    if (allRatings.length === 0)
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
    let dineIn = allRatings.filter((r) => r.visitType === "dine_in"), delivery = allRatings.filter((r) => r.visitType === "delivery"), takeaway = allRatings.filter((r) => r.visitType === "takeaway"), weightedAvg = (items, field) => {
      let num = 0, den = 0;
      for (let r of items) {
        let val = parseFloat(String(r[field] ?? 0)), w = parseFloat(String(r.effectiveWeight ?? r.weight ?? 1)), ageDays = Math.floor(
          (Date.now() - new Date(r.createdAt).getTime()) / (1e3 * 60 * 60 * 24)
        ), decay = computeDecayFactor(ageDays), decayedW = w * decay;
        num += val * decayedW, den += decayedW;
      }
      return den > 0 ? Math.round(num / den * 100) / 100 : 0;
    }, overallScore = weightedAvg(allRatings, "compositeScore"), foodScoreOnly = weightedAvg(allRatings, "foodScore"), visitBreakdown = (items) => items.length === 0 ? null : {
      count: items.length,
      overallScore: weightedAvg(items, "compositeScore"),
      foodScore: weightedAvg(items, "foodScore")
    }, withPhoto = allRatings.filter((r) => r.hasPhoto).length, verifiedPercentage = Math.round(withPhoto / allRatings.length * 100), returners = allRatings.filter((r) => r.wouldReturn).length, wouldReturnPercentage = Math.round(returners / allRatings.length * 100);
    return breakdownLog.info("Score breakdown served", {
      businessId,
      totalRatings: allRatings.length
    }), res.json({
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
  })), app2.get("/api/businesses/:id/score-trend", wrapAsync(async (req, res) => {
    let businessId = req.params.id, { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports)), { rankHistory: rankHistory2 } = await Promise.resolve().then(() => (init_schema(), schema_exports)), { eq: eq35, asc: asc4 } = await import("drizzle-orm"), data = (await db2.select({
      date: rankHistory2.snapshotDate,
      score: rankHistory2.weightedScore
    }).from(rankHistory2).where(eq35(rankHistory2.businessId, businessId)).orderBy(asc4(rankHistory2.snapshotDate)).limit(90)).map((h) => ({
      date: h.date,
      score: parseFloat(h.score)
    }));
    return res.json({ data });
  }));
}

// server/routes-ratings.ts
init_schema();
init_analytics2();
init_experiment_tracker();
init_tier_staleness();
init_storage();
init_logger();

// server/rating-integrity.ts
init_logger();
var integrityLog = log.tag("RatingIntegrity"), claimedBusinesses = /* @__PURE__ */ new Map(), blockedSelfRatingCount = 0;
function checkOwnerSelfRating(businessId, raterId, raterIp) {
  let claim = claimedBusinesses.get(businessId);
  return claim ? raterId === claim.ownerId ? (blockedSelfRatingCount++, integrityLog.warn("Owner self-rating blocked", { businessId, raterId }), {
    allowed: !1,
    reason: "As the business owner, you cannot rate your own restaurant. This ensures trust and fairness for all users."
  }) : raterIp && claim.claimIp && raterIp === claim.claimIp ? (blockedSelfRatingCount++, integrityLog.warn("Potential self-rating from claim IP", {
    businessId,
    raterId,
    raterIp
  }), {
    allowed: !1,
    reason: "As the business owner, you cannot rate your own restaurant. This ensures trust and fairness for all users."
  }) : { allowed: !0 } : { allowed: !0 };
}
var ratingLog = [], velocityFlagCount = 0, MAX_RATING_LOG = 1e5;
function logRatingSubmission(businessId, raterId, raterIp) {
  ratingLog.push({ businessId, raterId, raterIp, timestamp: Date.now() }), ratingLog.length > MAX_RATING_LOG && ratingLog.splice(0, ratingLog.length - MAX_RATING_LOG), integrityLog.debug("Rating submission logged", { businessId, raterId });
}
function checkVelocity(businessId, raterId, raterIp) {
  let now = Date.now(), HOUR = 36e5, DAY = 864e5, sameIpSameBiz24h = ratingLog.filter(
    (e) => e.businessId === businessId && e.raterIp === raterIp && now - e.timestamp < DAY
  );
  if (sameIpSameBiz24h.length > 5)
    return velocityFlagCount++, integrityLog.warn("Velocity V1: >5 same-IP same-business in 24h", {
      businessId,
      raterIp,
      count: sameIpSameBiz24h.length
    }), { flagged: !0, rule: "V1", reducedWeight: 0.05 };
  let sameAccount1h = ratingLog.filter(
    (e) => e.raterId === raterId && now - e.timestamp < HOUR
  );
  if (sameAccount1h.length > 10)
    return velocityFlagCount++, integrityLog.warn("Velocity V2: >10 ratings from account in 1h", {
      raterId,
      count: sameAccount1h.length
    }), { flagged: !0, rule: "V2", reducedWeight: 0.05 };
  let sameBiz12h = ratingLog.filter(
    (e) => e.businessId === businessId && now - e.timestamp < 12 * HOUR
  );
  if (sameBiz12h.length > 20)
    return velocityFlagCount++, integrityLog.warn("Velocity V3: >20 ratings for business in 12h", {
      businessId,
      count: sameBiz12h.length
    }), { flagged: !0, rule: "V3", reducedWeight: 0.05 };
  let raterHistory = ratingLog.filter((e) => e.raterId === raterId).sort((a, b) => a.timestamp - b.timestamp);
  if (raterHistory.length >= 2) {
    let lastTwo = raterHistory.slice(-2), gap = lastTwo[1].timestamp - lastTwo[0].timestamp;
    if (gap > 30 * DAY)
      return velocityFlagCount++, integrityLog.warn("Velocity V4: Inactive >30 days then rated", {
        raterId,
        gapDays: Math.round(gap / DAY)
      }), { flagged: !0, rule: "V4", reducedWeight: 0.05 };
  }
  return { flagged: !1, reducedWeight: 1 };
}

// server/routes-ratings.ts
function registerRatingRoutes(app2) {
  app2.post("/api/ratings", ratingRateLimiter, requireAuth, wrapAsync(async (req, res) => {
    try {
      let parsed = insertRatingSchema.safeParse(req.body);
      if (!parsed.success)
        return res.status(400).json({ error: parsed.error.errors[0].message });
      parsed.data.q1Score = sanitizeNumber(parsed.data.q1Score, 1, 5, 3), parsed.data.q2Score = sanitizeNumber(parsed.data.q2Score, 1, 5, 3), parsed.data.q3Score = sanitizeNumber(parsed.data.q3Score, 1, 5, 3);
      let memberId = req.user.id, raterIp = req.ip || req.socket.remoteAddress || "unknown", ownerCheck = checkOwnerSelfRating(parsed.data.businessId, memberId, raterIp);
      if (!ownerCheck.allowed)
        return trackEvent("rating_rejected_owner_self", memberId, { businessId: parsed.data.businessId }), res.status(403).json({ error: ownerCheck.reason });
      let velocityCheck = checkVelocity(parsed.data.businessId, memberId, raterIp);
      velocityCheck.flagged && log.warn(`Velocity flag ${velocityCheck.rule} for member ${memberId} on business ${parsed.data.businessId}`), logRatingSubmission(parsed.data.businessId, memberId, raterIp);
      let result = await submitRating(memberId, parsed.data, {
        velocityFlagged: velocityCheck.flagged,
        velocityRule: velocityCheck.rule,
        velocityWeight: velocityCheck.reducedWeight
      }), verifiedTier = checkAndRefreshTier(result.newTier, result.newCredibilityScore);
      if (verifiedTier !== result.newTier && (result.newTier = verifiedTier, result.tierUpgraded = verifiedTier !== req.user.credibilityTier), broadcast("rating_submitted", { businessId: parsed.data.businessId, memberId }), broadcast("ranking_updated", { businessId: parsed.data.businessId }), broadcast("challenger_updated", { businessId: parsed.data.businessId }), trackEvent("first_rating", memberId), trackEvent("rating_submitted", memberId, { businessId: parsed.data.businessId }), result.tierUpgraded && req.user.pushToken) {
        let { onTierUpgrade: onTierUpgrade2 } = await Promise.resolve().then(() => (init_notification_triggers(), notification_triggers_exports));
        onTierUpgrade2(memberId, req.user.pushToken, result.newTier).catch(() => {
        });
      }
      {
        let { onRankingChange: onRankingChange2, onNewRatingForBusiness: onNewRatingForBusiness2 } = await Promise.resolve().then(() => (init_notification_triggers(), notification_triggers_exports)), { getBusinessById: getBusinessById2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), biz = await getBusinessById2(parsed.data.businessId);
        if (biz) {
          result.rankChanged && result.prevRank && result.newRank && onRankingChange2(parsed.data.businessId, biz.name, result.prevRank, result.newRank, biz.city).catch(() => {
          });
          let raterName = req.user.displayName || "Someone", score = result.rating.weightedScore ?? result.rating.q1Score ?? 0;
          onNewRatingForBusiness2(parsed.data.businessId, biz.name, memberId, raterName, score).catch(() => {
          });
        }
      }
      try {
        let { invalidatePrerenderCache: invalidatePrerenderCache2 } = await Promise.resolve().then(() => (init_prerender(), prerender_exports)), { getBusinessById: getBusinessById2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), biz = await getBusinessById2(parsed.data.businessId);
        biz?.slug && invalidatePrerenderCache2("biz", biz.slug);
      } catch {
      }
      let userExperiments = getUserExperiments(String(memberId));
      for (let expId of userExperiments)
        trackOutcome(String(memberId), expId, "rated", parsed.data.q1Score);
      return res.status(201).json({ data: result });
    } catch (err) {
      let memberId = req.user?.id, businessId = req.body?.businessId;
      return err.message.includes("3+ days") ? (trackEvent("rating_rejected_account_age", memberId, { businessId }), res.status(403).json({ error: err.message })) : err.message.includes("Already rated") ? (trackEvent("rating_rejected_duplicate", memberId, { businessId }), res.status(409).json({ error: err.message })) : err.message.includes("suspended") ? (trackEvent("rating_rejected_suspended", memberId, { businessId }), res.status(403).json({ error: err.message })) : err.message.includes("business owner") ? (trackEvent("rating_rejected_owner_self", memberId, { businessId }), res.status(403).json({ error: err.message })) : (trackEvent("rating_rejected_unknown", memberId, { businessId, error: err.message }), res.status(400).json({ error: err.message }));
    }
  })), app2.patch("/api/ratings/:id", requireAuth, wrapAsync(async (req, res) => {
    let { editRating: editRating2 } = await Promise.resolve().then(() => (init_ratings(), ratings_exports)), ratingId = req.params.id, updates = {
      q1Score: req.body.q1Score ? sanitizeNumber(req.body.q1Score, 1, 5, void 0) : void 0,
      q2Score: req.body.q2Score ? sanitizeNumber(req.body.q2Score, 1, 5, void 0) : void 0,
      q3Score: req.body.q3Score ? sanitizeNumber(req.body.q3Score, 1, 5, void 0) : void 0,
      wouldReturn: req.body.wouldReturn,
      note: req.body.note !== void 0 ? sanitizeString(req.body.note, 160) : void 0
    };
    try {
      let updated = await editRating2(ratingId, req.user.id, updates);
      return broadcast("rating_updated", { ratingId, businessId: updated.businessId }), res.json({ data: updated });
    } catch (err) {
      return err.message.includes("not found") ? res.status(404).json({ error: err.message }) : err.message.includes("Cannot edit") ? res.status(403).json({ error: err.message }) : err.message.includes("expired") ? res.status(403).json({ error: err.message }) : res.status(400).json({ error: err.message });
    }
  })), app2.delete("/api/ratings/:id", requireAuth, wrapAsync(async (req, res) => {
    let { deleteRating: deleteRating2 } = await Promise.resolve().then(() => (init_ratings(), ratings_exports));
    try {
      return await deleteRating2(req.params.id, req.user.id), broadcast("rating_deleted", { ratingId: req.params.id }), res.json({ data: { deleted: !0 } });
    } catch (err) {
      return err.message.includes("not found") ? res.status(404).json({ error: err.message }) : err.message.includes("Cannot delete") ? res.status(403).json({ error: err.message }) : res.status(400).json({ error: err.message });
    }
  })), app2.post("/api/ratings/:id/flag", requireAuth, wrapAsync(async (req, res) => {
    let { submitRatingFlag: submitRatingFlag2 } = await Promise.resolve().then(() => (init_ratings(), ratings_exports));
    try {
      let flag = await submitRatingFlag2(req.params.id, req.user.id, {
        q1NoSpecificExperience: req.body.q1NoSpecificExperience === !0,
        q2ScoreMismatchNote: req.body.q2ScoreMismatchNote === !0,
        q3InsiderSuspected: req.body.q3InsiderSuspected === !0,
        q4CoordinatedPattern: req.body.q4CoordinatedPattern === !0,
        q5CompetitorBombing: req.body.q5CompetitorBombing === !0,
        explanation: sanitizeString(req.body.explanation, 500)
      });
      return res.status(201).json({ data: flag });
    } catch (err) {
      return err.message.includes("not found") ? res.status(404).json({ error: err.message }) : err.message.includes("own rating") ? res.status(403).json({ error: err.message }) : err.message.includes("unique") || err.message.includes("duplicate") ? res.status(409).json({ error: "You have already flagged this rating" }) : res.status(400).json({ error: err.message });
    }
  }));
}

// server/routes.ts
init_stripe_webhook();
init_logger();
init_storage();
init_schema();

// server/routes-health.ts
init_config();
init_logger();
function registerHealthRoutes(app2) {
  app2.get("/_ready", async (_req, res) => {
    try {
      let { pool: pool2 } = await Promise.resolve().then(() => (init_db(), db_exports)), start = Date.now();
      await pool2.query("SELECT 1");
      let dbLatencyMs = Date.now() - start;
      res.status(200).json({ status: "ready", db: "connected", dbLatencyMs });
    } catch {
      res.status(503).json({ status: "not_ready", db: "disconnected" });
    }
  }), app2.get("/api/health", (_req, res) => {
    let uptime = process.uptime(), memUsage = process.memoryUsage(), pushStats = { totalTokens: 0, uniqueMembers: 0, messagesSent: 0, messagesFailed: 0 };
    try {
      let { getPushStats: getPushStats2 } = (init_push_notifications(), __toCommonJS(push_notifications_exports));
      pushStats = getPushStats2();
    } catch {
    }
    res.json({
      status: "healthy",
      version: "1.0.0",
      uptime: Math.floor(uptime),
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      nodeVersion: process.version,
      environment: config.nodeEnv,
      memoryUsage: memUsage.heapUsed,
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        rss: Math.round(memUsage.rss / 1024 / 1024)
      },
      push: pushStats,
      logs: getLogStats(),
      sseClients: getClientCount(),
      rateLimit: getRateLimitStats2()
    });
  });
}

// server/routes.ts
async function registerRoutes(app2) {
  setupAuth(app2), app2.use("/api", (req, res, next) => {
    let start = Date.now(), originalEnd = res.end;
    res.end = function(...args) {
      let duration = Date.now() - start, method = req.method, url = req.originalUrl || req.url, status = res.statusCode;
      return duration > 200 ? log.warn(`[SLOW] ${method} ${url} ${status} ${duration}ms`) : log.info(`${method} ${url} ${status} ${duration}ms`), originalEnd.apply(this, args);
    }, next();
  }), app2.get("/_health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  }), registerHealthRoutes(app2);
  let SSE_MAX_PER_IP = 5, SSE_TIMEOUT_MS = 18e5, sseConnectionsByIp = /* @__PURE__ */ new Map();
  return app2.get("/api/events", (req, res) => {
    let clientIp = req.ip || req.socket.remoteAddress || "unknown", currentCount = sseConnectionsByIp.get(clientIp) || 0;
    if (currentCount >= SSE_MAX_PER_IP)
      return log.warn(`SSE rate limit: ${clientIp} exceeded ${SSE_MAX_PER_IP} concurrent connections`), res.status(429).json({ error: "Too many SSE connections from this IP" });
    sseConnectionsByIp.set(clientIp, currentCount + 1), res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    }), res.write('data: {"type":"connected","timestamp":' + Date.now() + `}

`), addClient(res);
    let keepAlive = setInterval(() => {
      try {
        res.write(`: ping

`);
      } catch {
        clearInterval(keepAlive);
      }
    }, 3e4), timeout = setTimeout(() => {
      try {
        res.end();
      } catch {
      }
    }, SSE_TIMEOUT_MS), cleanup = () => {
      clearInterval(keepAlive), clearTimeout(timeout);
      let count17 = sseConnectionsByIp.get(clientIp) || 1;
      count17 <= 1 ? sseConnectionsByIp.delete(clientIp) : sseConnectionsByIp.set(clientIp, count17 - 1);
    };
    req.on("close", cleanup);
  }), registerAuthRoutes(app2), app2.get("/api/leaderboard", wrapAsync(async (req, res) => {
    let city = sanitizeString(req.query.city, 100) || "Dallas", category = sanitizeString(req.query.category, 50) || "restaurant", cuisine = sanitizeString(req.query.cuisine, 50) || void 0, neighborhood = sanitizeString(req.query.neighborhood, 100) || void 0, priceRange = sanitizeString(req.query.priceRange, 10) || void 0, limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50)), bizList = await getLeaderboard(city, category, limit, cuisine, neighborhood, priceRange), bizIds = bizList.map((b) => b.id), [photoMap, dishRankingsMap] = await Promise.all([
      getBusinessPhotosMap(bizIds),
      getBatchDishRankings(bizIds)
    ]), data = bizList.map((b) => ({
      ...b,
      photoUrls: photoMap[b.id] || (b.photoUrl ? [b.photoUrl] : []),
      dishRankings: dishRankingsMap[b.id] || []
    }));
    return res.json({ data });
  })), app2.get("/api/featured", wrapAsync(async (req, res) => {
    let city = sanitizeString(req.query.city, 100) || "Dallas", placements = await getActiveFeaturedInCity(city);
    if (placements.length === 0)
      return res.json({ data: [] });
    let bizIds = placements.map((p) => p.businessId), [bizList, photoMap] = await Promise.all([
      getBusinessesByIds(bizIds),
      getBusinessPhotosMap(bizIds)
    ]), bizMap = new Map(bizList.map((b) => [b.id, b])), featured = placements.map((p) => {
      let biz = bizMap.get(p.businessId);
      return biz ? {
        id: biz.id,
        name: biz.name,
        slug: biz.slug,
        category: biz.category,
        photoUrl: (photoMap[biz.id] || [])[0] || biz.photoUrl || void 0,
        weightedScore: biz.weightedScore || 0,
        tagline: biz.tagline || `Top ${biz.category} in ${city}`,
        totalRatings: biz.totalRatings || 0,
        expiresAt: p.expiresAt
      } : null;
    }).filter(Boolean);
    return res.json({ data: featured });
  })), app2.get("/api/leaderboard/categories", wrapAsync(async (req, res) => {
    let city = sanitizeString(req.query.city, 100) || "Dallas", data = await getAllCategories(city);
    return res.json({ data });
  })), app2.get("/api/leaderboard/cuisines", wrapAsync(async (req, res) => {
    let city = sanitizeString(req.query.city, 100) || "Dallas", category = sanitizeString(req.query.category, 50) || void 0, data = await getCuisines(city, category);
    return res.json({ data });
  })), app2.get("/api/leaderboard/neighborhoods", wrapAsync(async (req, res) => {
    let city = sanitizeString(req.query.city, 100) || "Dallas", { getNeighborhoods: getNeighborhoods2 } = await Promise.resolve().then(() => (init_businesses(), businesses_exports)), data = await getNeighborhoods2(city);
    return res.json({ data });
  })), registerBusinessRoutes(app2), registerClaimRoutes(app2), registerBusinessAnalyticsRoutes(app2), registerPaymentRoutes(app2), app2.get("/api/dishes/search", wrapAsync(async (req, res) => {
    let businessId = req.query.business_id, query = sanitizeString(req.query.q, 200);
    if (!businessId) return res.status(400).json({ error: "business_id required" });
    let data = await searchDishes(businessId, query);
    return res.json({ data });
  })), registerDishRoutes(app2), registerSeoRoutes(app2), registerQrRoutes(app2), registerNotificationRoutes(app2), registerReferralRoutes(app2), registerRatingRoutes(app2), registerMemberRoutes(app2), registerMemberNotificationRoutes(app2), app2.get("/api/challengers/active", wrapAsync(async (req, res) => {
    let city = sanitizeString(req.query.city, 100) || "Dallas", category = sanitizeString(req.query.category, 50) || void 0, data = await getActiveChallenges(city, category);
    return res.json({ data });
  })), app2.get("/api/trending", wrapAsync(async (req, res) => {
    let { getTrendingBusinesses: getTrendingBusinesses2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), city = sanitizeString(req.query.city, 100) || "Dallas", limit = Math.min(10, Math.max(1, parseInt(req.query.limit) || 3)), bizList = await getTrendingBusinesses2(city, limit), photoMap = await getBusinessPhotosMap(bizList.map((b) => b.id)), data = bizList.map((b) => ({
      ...b,
      photoUrls: photoMap[b.id] || (b.photoUrl ? [b.photoUrl] : [])
    }));
    return res.json({ data });
  })), app2.get("/api/just-rated", wrapAsync(async (req, res) => {
    let { getJustRatedBusinesses: getJustRatedBusinesses2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), city = sanitizeString(req.query.city, 100) || "Dallas", limit = Math.min(10, Math.max(1, parseInt(req.query.limit) || 5)), bizList = await getJustRatedBusinesses2(city, limit), photoMap = await getBusinessPhotosMap(bizList.map((b) => b.id)), data = bizList.map((b) => ({
      ...b,
      photoUrls: photoMap[b.id] || (b.photoUrl ? [b.photoUrl] : [])
    }));
    return res.json({ data });
  })), app2.get("/api/google-places-fallback", wrapAsync(async (req, res) => {
    let { searchNearbyRestaurants: searchNearbyRestaurants2 } = await Promise.resolve().then(() => (init_google_places(), google_places_exports)), city = sanitizeString(req.query.city, 100) || "Dallas", category = sanitizeString(req.query.category, 50) || "restaurant", limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 10)), places = await searchNearbyRestaurants2(city, category, limit);
    return res.json({ data: places, source: "google_places" });
  })), app2.post("/api/category-suggestions", requireAuth, wrapAsync(async (req, res) => {
    let parsed = insertCategorySuggestionSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: parsed.error.errors[0].message });
    let { createCategorySuggestion: createCategorySuggestion2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), suggestion = await createCategorySuggestion2({
      ...parsed.data,
      suggestedBy: req.user.id
    });
    return res.status(201).json({ data: suggestion });
  })), app2.get("/api/category-suggestions", wrapAsync(async (req, res) => {
    let { getPendingSuggestions: getPendingSuggestions2 } = await Promise.resolve().then(() => (init_storage(), storage_exports)), data = await getPendingSuggestions2();
    return res.json({ data });
  })), app2.get("/api/photos/proxy", wrapAsync(handlePhotoProxy)), app2.post("/api/webhook/stripe", wrapAsync(handleStripeWebhook)), app2.get("/api/payments/history", requireAuth, wrapAsync(async (req, res) => {
    let limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20)), payments2 = await getMemberPayments(req.user.id, limit);
    return res.json({ data: payments2 });
  })), app2.post("/api/webhook/deploy", wrapAsync(handleWebhook)), app2.get("/api/deploy/status", wrapAsync(handleDeployStatus)), app2.get("/share/badge/:badgeId", wrapAsync(handleBadgeShare)), app2.get("/api/og-image/business/:slug", wrapAsync(handleBusinessOgImage)), app2.get("/api/og-image/dish/:slug", wrapAsync(handleDishOgImage)), app2.post("/api/feedback", feedbackRateLimiter, requireAuth, wrapAsync(async (req, res) => {
    let { createFeedback: createFeedback2 } = await Promise.resolve().then(() => (init_feedback(), feedback_exports)), { rating, category, message, screenContext, appVersion } = req.body;
    if (!rating || !category || !message)
      return res.status(400).json({ error: "rating, category, and message are required" });
    if (rating < 1 || rating > 5)
      return res.status(400).json({ error: "rating must be 1-5" });
    if (!["bug", "feature", "praise", "other"].includes(category))
      return res.status(400).json({ error: "category must be bug, feature, praise, or other" });
    let feedback = await createFeedback2({
      memberId: req.user.id,
      rating: Math.round(rating),
      category,
      message: String(message).slice(0, 2e3),
      screenContext: screenContext ? String(screenContext).slice(0, 100) : void 0,
      appVersion: appVersion ? String(appVersion).slice(0, 50) : void 0
    });
    return res.status(201).json({ data: feedback });
  })), registerBadgeRoutes(app2), registerExperimentRoutes(app2), registerUnsubscribeRoutes(app2), registerWebhookRoutes(app2), registerOwnerDashboardRoutes(app2), registerCityStatsRoutes(app2), registerPushRoutes(app2), registerSearchRoutes(app2), registerBestInRoutes(app2), registerRatingPhotoRoutes(app2), registerScoreBreakdownRoutes(app2), registerAllAdminRoutes(app2), createServer(app2);
}

// server/index.ts
init_logger();
import * as fs2 from "fs";
import * as path2 from "path";
import { createProxyMiddleware } from "http-proxy-middleware";

// server/security-headers.ts
init_config();
import crypto16 from "crypto";
function buildAllowedOrigins() {
  let origins = /* @__PURE__ */ new Set();
  origins.add("https://topranker.com"), origins.add("https://www.topranker.com"), origins.add("https://topranker.io"), origins.add("https://www.topranker.io");
  let envOrigins = config.corsOrigins;
  envOrigins && envOrigins.split(",").forEach((o) => {
    let trimmed = o.trim();
    trimmed && origins.add(trimmed);
  });
  let railwayDomain = config.railwayPublicDomain;
  return railwayDomain && origins.add(`https://${railwayDomain}`), origins;
}
var allowedOrigins = buildAllowedOrigins();
function isLocalhostOrigin(origin) {
  return origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:");
}
function securityHeaders(req, res, next) {
  let isDev = !config.isProduction, origin = req.headers.origin;
  if (isDev)
    return origin && (res.setHeader("Access-Control-Allow-Origin", origin), res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS"), res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, expo-platform"), res.setHeader("Access-Control-Allow-Credentials", "true"), res.setHeader("Access-Control-Max-Age", "86400")), req.method === "OPTIONS" ? res.status(204).end() : (res.setHeader("X-Content-Type-Options", "nosniff"), res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate"), res.setHeader("Pragma", "no-cache"), res.setHeader("Expires", "0"), res.setHeader("X-API-Version", "1.0.0"), res.setHeader("X-Request-Id", crypto16.randomUUID()), next());
  let wildcardAllowed = allowedOrigins.has("*");
  if (origin && (wildcardAllowed || allowedOrigins.has(origin) || isLocalhostOrigin(origin)) && (res.setHeader("Access-Control-Allow-Origin", origin), res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  ), res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, expo-platform"
  ), res.setHeader("Access-Control-Allow-Credentials", "true"), res.setHeader("Access-Control-Max-Age", "86400")), req.method === "OPTIONS")
    return res.status(204).end();
  res.setHeader("X-Content-Type-Options", "nosniff"), res.setHeader("X-Frame-Options", "DENY"), res.setHeader("X-XSS-Protection", "1; mode=block"), res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin"), res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self), payment=(self)"
  );
  let csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://maps.googleapis.com https://maps.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
    "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.stripe.com https://api.resend.com https://maps.googleapis.com https://maps.gstatic.com https://accounts.google.com https://oauth2.googleapis.com https://places.googleapis.com https://topranker.com https://*.topranker.com https://topranker.io https://*.topranker.io https://*.up.railway.app",
    "frame-src 'self' https://accounts.google.com https://www.google.com https://maps.google.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join("; ");
  res.setHeader("Content-Security-Policy", csp), res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  ), res.setHeader("X-API-Version", "1.0.0"), res.setHeader("X-Request-Id", crypto16.randomUUID()), next();
}

// server/index.ts
init_error_tracking();
import compression from "compression";

// server/cache-headers.ts
var CACHE_RULES = {
  "/api/leaderboard": { public: !0, maxAge: 300, staleWhileRevalidate: 60 },
  "/api/trending": { public: !0, maxAge: 600, staleWhileRevalidate: 120 },
  "/api/just-rated": { public: !0, maxAge: 300, staleWhileRevalidate: 60 },
  "/api/leaderboard/categories": { public: !0, maxAge: 7200 },
  "/api/businesses/popular-categories": { public: !0, maxAge: 3600 },
  "/api/businesses/autocomplete": { public: !0, maxAge: 30 },
  "/api/businesses/search": { public: !0, maxAge: 30 },
  "/api/featured": { public: !0, maxAge: 300 },
  "/api/health": { public: !0, maxAge: 10 },
  "/api/referrals/validate": { public: !0, maxAge: 60 }
};
function cacheHeaders(req, res, next) {
  if (req.method !== "GET")
    return res.setHeader("Cache-Control", "no-store"), next();
  let path3 = req.path, config2 = CACHE_RULES[path3];
  if (config2) {
    let parts = [];
    parts.push(config2.public ? "public" : "private"), parts.push(`max-age=${config2.maxAge}`), config2.staleWhileRevalidate && parts.push(`stale-while-revalidate=${config2.staleWhileRevalidate}`), res.setHeader("Cache-Control", parts.join(", "));
  } else path3.startsWith("/api/") && res.setHeader("Cache-Control", "private, no-cache");
  next();
}

// server/index.ts
init_analytics2();
init_config();
var app = express();
initErrorTracking();
(async () => {
  try {
    let { persistAnalyticsEvents: persistAnalyticsEvents2 } = await Promise.resolve().then(() => (init_analytics(), analytics_exports));
    setFlushHandler(persistAnalyticsEvents2, 3e4);
  } catch {
  }
})();
function setupBodyParsing(app2) {
  app2.use(
    "/api/webhooks",
    express.raw({ type: "application/json", limit: "5mb" })
  ), app2.use(
    express.json({
      limit: "1mb",
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      }
    })
  ), app2.use(express.urlencoded({ extended: !1, limit: "1mb" }));
}
function setupRequestLogging(app2) {
  app2.use((req, res, next) => {
    let start = Date.now(), path3 = req.path, capturedJsonResponse, originalResJson = res.json;
    res.json = function(bodyJson, ...args) {
      return capturedJsonResponse = bodyJson, originalResJson.apply(res, [bodyJson, ...args]);
    }, res.on("finish", () => {
      if (!path3.startsWith("/api")) return;
      let duration = Date.now() - start, logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      capturedJsonResponse && (logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`), logLine.length > 80 && (logLine = logLine.slice(0, 79) + "\u2026"), log(logLine);
    }), next();
  });
}
function getAppName() {
  try {
    let appJsonPath = path2.resolve(process.cwd(), "app.json"), appJsonContent = fs2.readFileSync(appJsonPath, "utf-8");
    return JSON.parse(appJsonContent).expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}
function serveExpoManifest(platform, res) {
  let manifestPath = path2.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json"
  );
  if (!fs2.existsSync(manifestPath))
    return res.status(404).json({ error: `Manifest not found for platform: ${platform}` });
  res.setHeader("expo-protocol-version", "1"), res.setHeader("expo-sfv-version", "0"), res.setHeader("content-type", "application/json");
  let manifest = fs2.readFileSync(manifestPath, "utf-8");
  res.send(manifest);
}
function serveLandingPage({
  req,
  res,
  landingPageTemplate,
  appName
}) {
  let protocol = req.header("x-forwarded-proto") || req.protocol || "https", host = req.header("x-forwarded-host") || req.get("host"), baseUrl = `${protocol}://${host}`, expsUrl = `${host}`;
  log("baseUrl", baseUrl), log("expsUrl", expsUrl);
  let html = landingPageTemplate.replace(/BASE_URL_PLACEHOLDER/g, baseUrl).replace(/EXPS_URL_PLACEHOLDER/g, expsUrl).replace(/APP_NAME_PLACEHOLDER/g, appName);
  res.setHeader("Content-Type", "text/html; charset=utf-8"), res.status(200).send(html);
}
function configureExpoAndLanding(app2) {
  let templatePath = path2.resolve(
    process.cwd(),
    "server",
    "templates",
    "landing-page.html"
  ), landingPageTemplate = fs2.readFileSync(templatePath, "utf-8"), appName = getAppName(), isProduction = !0;
  log("Serving static Expo files with dynamic manifest routing"), app2.get("/_health", (_req, res) => {
    res.status(200).send("ok");
  }), app2.use((req, res, next) => {
    if (req.path.startsWith("/api") || req.path !== "/" && req.path !== "/manifest")
      return next();
    let platform = req.header("expo-platform");
    if (platform && (platform === "ios" || platform === "android"))
      return serveExpoManifest(platform, res);
    next();
  }), app2.get("/.well-known/apple-app-site-association", (_req, res) => {
    res.setHeader("Content-Type", "application/json"), res.setHeader("Cache-Control", "public, max-age=86400"), res.json({
      applinks: {
        details: [{
          appIDs: ["RKGRR7XGWD.com.topranker.app"],
          components: [
            { "/": "/business/*", comment: "Business detail deep links" },
            { "/": "/dish/*", comment: "Dish leaderboard deep links" },
            { "/": "/challenger/*", comment: "Challenger deep links" },
            { "/": "/share/*", comment: "Share deep links" },
            { "/": "/join", comment: "Join/referral deep link" }
          ]
        }]
      }
    });
  }), app2.use(express.static(path2.resolve(process.cwd(), "public"), { index: !1 })), app2.use("/assets", express.static(path2.resolve(process.cwd(), "assets"))), app2.use(express.static(path2.resolve(process.cwd(), "static-build"), { index: !1 }));
  let distPath = path2.resolve(process.cwd(), "dist"), hasDistBuild = fs2.existsSync(path2.join(distPath, "index.html")), distIndexHtml = "";
  if (hasDistBuild && (distIndexHtml = fs2.readFileSync(path2.join(distPath, "index.html"), "utf-8"), app2.use(express.static(distPath, {
    maxAge: isProduction ? "1d" : 0,
    index: !1
  })), log(`Serving static web build from ${distPath}`)), isProduction)
    app2.use((req, res, next) => {
      if (req.path.startsWith("/api"))
        return next();
      let platform = req.header("expo-platform");
      return platform && (platform === "ios" || platform === "android") ? next() : hasDistBuild ? res.type("html").send(distIndexHtml) : serveLandingPage({ req, res, landingPageTemplate, appName });
    }), log("Production mode: Serving static dist build (no Metro proxy)");
  else {
    let metroProxy = createProxyMiddleware({
      target: "http://localhost:8081",
      changeOrigin: !0,
      ws: !0,
      logger: void 0,
      on: {
        error: (_err, req, res) => {
          res && "writeHead" in res && !res.headersSent && (req.headers?.accept?.includes("text/html") ? res.status(200).type("html").send(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${appName}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0a0e1a;color:#c8a951;font-family:-apple-system,system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center}.c{padding:20px}.spinner{width:40px;height:40px;border:3px solid #1a2040;border-top-color:#c8a951;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 20px}@keyframes spin{to{transform:rotate(360deg)}}h1{font-size:20px;margin-bottom:8px}p{font-size:14px;color:#8890a8}</style></head><body><div class="c"><div class="spinner"></div><h1>${appName}</h1><p>Loading app...</p></div><script>setTimeout(()=>location.reload(),3000)</script></body></html>`) : res.status(503).set("Retry-After", "3").send("Metro bundler starting..."));
        }
      }
    }), webIndexHtml = `<!DOCTYPE html>
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
      if (req.path.startsWith("/api"))
        return next();
      let platform = req.header("expo-platform");
      return platform && (platform === "ios" || platform === "android") ? next() : req.path === "/" || req.path === "/index.html" ? (log(`[DEV] Serving bootstrap HTML for ${req.path} (${webIndexHtml.length} bytes)`), res.status(200).type("html").send(webIndexHtml)) : metroProxy(req, res, next);
    }), log("Expo routing: Checking expo-platform header on / and /manifest"), log("Metro proxy: Forwarding web requests to localhost:8081");
  }
}
function setupErrorHandler(app2) {
  app2.use((err, _req, res, next) => {
    let error = err, status = error.status || error.statusCode || 500, message = !0 && status >= 500 ? "Internal Server Error" : error.message || "Internal Server Error";
    return log.error("Internal Server Error:", err), res.headersSent ? next(err) : res.status(status).json({ message });
  });
}
(async () => {
  config.isProduction && app.set("trust proxy", 1), app.use(securityHeaders), app.use(compression({ threshold: 1024 })), setupBodyParsing(app), app.use("/api", apiRateLimiter), app.use(cacheHeaders), app.use(perfMonitor), app.use((req, res, next) => {
    let start = process.hrtime(), originalEnd = res.end;
    res.end = function(...args) {
      if (!res.headersSent) {
        let [seconds, nanoseconds] = process.hrtime(start), durationMs = (seconds * 1e3 + nanoseconds / 1e6).toFixed(2);
        res.setHeader("X-Response-Time", `${durationMs}ms`);
      }
      return originalEnd.apply(res, args);
    }, next();
  }), setupRequestLogging(app);
  let { prerenderMiddleware: prerenderMiddleware2 } = await Promise.resolve().then(() => (init_prerender(), prerender_exports));
  app.use(prerenderMiddleware2);
  let server = await registerRoutes(app);
  configureExpoAndLanding(app);
  let stack = app._router?.stack ?? [], directRoutes = stack.filter((layer) => layer.route).length, routers = stack.filter((layer) => layer.name === "router").length;
  log(`[TopRanker] ${directRoutes + routers} route handlers registered (${directRoutes} direct, ${routers} routers)`), setupErrorHandler(app);
  let port = parseInt(process.env.PORT || "5000", 10);
  server.keepAliveTimeout = 65e3, server.headersTimeout = 66e3, server.listen(
    port,
    "0.0.0.0",
    () => {
      log(`express server serving on port ${port} (0.0.0.0)`), log.info(`Node ${process.version} | PID ${process.pid} | ENV production`);
    }
  );
  let { autoImportGooglePlaces: autoImportGooglePlaces2 } = await Promise.resolve().then(() => (init_google_places_import(), google_places_import_exports));
  autoImportGooglePlaces2().catch((err) => log.error("Google Places auto-import error:", err));
  let { closeExpiredChallenges: closeExpiredChallenges2 } = await Promise.resolve().then(() => (init_challengers(), challengers_exports));
  closeExpiredChallenges2().catch((err) => log.error("Initial challenger closure error:", err));
  let challengerInterval = setInterval(() => {
    closeExpiredChallenges2().catch((err) => log.error("Challenger closure error:", err));
  }, 3600 * 1e3), { recalculateDishLeaderboard: recalculateDishLeaderboard2 } = await Promise.resolve().then(() => (init_dishes(), dishes_exports)), { dishLeaderboards: dishLeaderboards2 } = await Promise.resolve().then(() => (init_schema(), schema_exports)), { db: dishDb } = await Promise.resolve().then(() => (init_db(), db_exports));
  async function recalculateAllDishBoards() {
    try {
      let boards = await dishDb.select().from(dishLeaderboards2), totalEntries = 0;
      for (let board of boards) {
        let count17 = await recalculateDishLeaderboard2(board.id);
        totalEntries += count17;
      }
      log.info(`Dish leaderboard recalculation: ${boards.length} boards, ${totalEntries} entries`);
    } catch (err) {
      log.error("Dish leaderboard recalculation error:", err);
    }
  }
  recalculateAllDishBoards();
  let dishRecalcInterval = setInterval(recalculateAllDishBoards, 360 * 60 * 1e3), { preloadHashIndex: preloadHashIndex2 } = await Promise.resolve().then(() => (init_photo_hash(), photo_hash_exports));
  preloadHashIndex2().catch((err) => log.error("Photo hash preload failed:", err));
  let { preloadPHashIndex: preloadPHashIndex2 } = await Promise.resolve().then(() => (init_phash(), phash_exports));
  preloadPHashIndex2().catch((err) => log.error("PHash preload failed:", err));
  let { startSuggestionRefresh: startSuggestionRefresh2 } = await Promise.resolve().then(() => (init_search_suggestions(), search_suggestions_exports));
  startSuggestionRefresh2();
  let { startWeeklyDigestScheduler: startWeeklyDigestScheduler2, startCityHighlightsScheduler: startCityHighlightsScheduler2, startRatingReminderScheduler: startRatingReminderScheduler2 } = await Promise.resolve().then(() => (init_notification_triggers(), notification_triggers_exports)), weeklyDigestTimeout = startWeeklyDigestScheduler2(), cityHighlightsTimeout = startCityHighlightsScheduler2(), ratingReminderTimeout = startRatingReminderScheduler2(), { startDripScheduler: startDripScheduler2 } = await Promise.resolve().then(() => (init_drip_scheduler(), drip_scheduler_exports)), dripSchedulerTimeout = startDripScheduler2(), { startOutreachScheduler: startOutreachScheduler2 } = await Promise.resolve().then(() => (init_outreach_scheduler(), outreach_scheduler_exports)), outreachSchedulerTimeout = startOutreachScheduler2();
  function gracefulShutdown(signal) {
    log.info(`${signal} received. Starting graceful shutdown...`), clearInterval(challengerInterval), clearInterval(dishRecalcInterval), clearTimeout(weeklyDigestTimeout), clearTimeout(cityHighlightsTimeout), clearTimeout(dripSchedulerTimeout), clearTimeout(outreachSchedulerTimeout), server.close(() => {
      log.info("HTTP server closed"), process.exit(0);
    }), setTimeout(() => {
      log.error("Forced shutdown after timeout"), process.exit(1);
    }, 1e4);
  }
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM")), process.on("SIGINT", () => gracefulShutdown("SIGINT"));
})();
