var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
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

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  analyticsEvents: () => analyticsEvents,
  businessClaims: () => businessClaims,
  businessPhotos: () => businessPhotos,
  businesses: () => businesses,
  categories: () => categories,
  categorySuggestions: () => categorySuggestions,
  challengers: () => challengers,
  credibilityPenalties: () => credibilityPenalties,
  dishVotes: () => dishVotes,
  dishes: () => dishes,
  featuredPlacements: () => featuredPlacements,
  insertCategorySuggestionSchema: () => insertCategorySuggestionSchema,
  insertMemberSchema: () => insertMemberSchema,
  insertRatingSchema: () => insertRatingSchema,
  memberBadges: () => memberBadges,
  members: () => members,
  payments: () => payments,
  qrScans: () => qrScans,
  rankHistory: () => rankHistory,
  ratingFlags: () => ratingFlags,
  ratings: () => ratings,
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
var members, businesses, ratings, dishes, dishVotes, challengers, rankHistory, businessClaims, businessPhotos, qrScans, ratingFlags, memberBadges, credibilityPenalties, categories, categorySuggestions, payments, webhookEvents, featuredPlacements, analyticsEvents, insertMemberSchema, insertRatingSchema, insertCategorySuggestionSchema;
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
      joinedAt: timestamp("joined_at").notNull().defaultNow(),
      lastActive: timestamp("last_active")
    });
    businesses = pgTable(
      "businesses",
      {
        id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
        weightedScore: numeric("weighted_score", { precision: 6, scale: 3 }).notNull().default("0"),
        rawAvgScore: numeric("raw_avg_score", { precision: 4, scale: 2 }).notNull().default("0"),
        rankPosition: integer("rank_position"),
        rankDelta: integer("rank_delta").notNull().default(0),
        prevRankPosition: integer("prev_rank_position"),
        totalRatings: integer("total_ratings").notNull().default(0),
        ownerId: varchar("owner_id").references(() => members.id),
        isClaimed: boolean("is_claimed").notNull().default(false),
        claimedAt: timestamp("claimed_at"),
        isActive: boolean("is_active").notNull().default(true),
        inChallenger: boolean("in_challenger").notNull().default(false),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow()
      },
      (table) => [
        index("idx_biz_city_cat").on(table.city, table.category),
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
    businessPhotos = pgTable("business_photos", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      businessId: varchar("business_id").notNull().references(() => businesses.id),
      photoUrl: text("photo_url").notNull(),
      isHero: boolean("is_hero").notNull().default(false),
      sortOrder: integer("sort_order").notNull().default(0),
      uploadedBy: varchar("uploaded_by").references(() => members.id),
      createdAt: timestamp("created_at").notNull().defaultNow()
    });
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
    credibilityPenalties = pgTable("credibility_penalties", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      memberId: varchar("member_id").notNull().references(() => members.id),
      ratingFlagId: varchar("rating_flag_id").references(() => ratingFlags.id),
      basePenalty: integer("base_penalty").notNull(),
      historyMult: numeric("history_mult", { precision: 3, scale: 1 }).notNull(),
      patternMult: numeric("pattern_mult", { precision: 3, scale: 1 }).notNull(),
      finalPenalty: integer("final_penalty").notNull(),
      severity: text("severity").notNull(),
      appliedAt: timestamp("applied_at").notNull().defaultNow()
    });
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
      q1Score: z.number().min(1).max(5),
      q2Score: z.number().min(1).max(5),
      q3Score: z.number().min(1).max(5),
      wouldReturn: z.boolean(),
      note: z.string().max(160).optional(),
      dishId: z.string().optional(),
      newDishName: z.string().max(50).optional(),
      noNotableDish: z.boolean().optional(),
      qrScanId: z.string().optional()
    });
    insertCategorySuggestionSchema = z.object({
      name: z.string().min(2).max(50),
      description: z.string().min(10).max(200),
      vertical: z.enum(["food", "services", "wellness", "entertainment", "retail"])
    });
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

// server/storage/helpers.ts
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
var init_helpers = __esm({
  "server/storage/helpers.ts"() {
    "use strict";
    init_db();
  }
});

// server/storage/members.ts
import { eq, and, ne, sql as sql2, count, desc } from "drizzle-orm";
async function getMemberById(id) {
  const [member] = await db.select().from(members).where(eq(members.id, id));
  return member;
}
async function getMemberByUsername(username) {
  const [member] = await db.select().from(members).where(eq(members.username, username));
  return member;
}
async function getMemberByEmail(email) {
  const [member] = await db.select().from(members).where(eq(members.email, email));
  return member;
}
async function getMemberByAuthId(authId) {
  const [member] = await db.select().from(members).where(eq(members.authId, authId));
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
  const [ratingCount] = await db.select({ count: count() }).from(ratings).where(and(eq(ratings.memberId, memberId), eq(ratings.isFlagged, false)));
  const categoryResult = await db.select({ category: businesses.category }).from(ratings).innerJoin(businesses, eq(ratings.businessId, businesses.id)).where(and(eq(ratings.memberId, memberId), eq(ratings.isFlagged, false))).groupBy(businesses.category);
  const distinctBizResult = await db.select({ bizId: ratings.businessId }).from(ratings).where(and(eq(ratings.memberId, memberId), eq(ratings.isFlagged, false))).groupBy(ratings.businessId);
  const memberRatings = await db.select({ rawScore: ratings.rawScore }).from(ratings).where(and(eq(ratings.memberId, memberId), eq(ratings.isFlagged, false)));
  let variance = 0;
  if (memberRatings.length > 1) {
    const scores = memberRatings.map((r) => parseFloat(r.rawScore));
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const sqDiffs = scores.map((s) => (s - mean) ** 2);
    variance = Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / scores.length);
  }
  await db.update(members).set({
    totalRatings: ratingCount.count,
    totalCategories: categoryResult.length,
    distinctBusinesses: distinctBizResult.length,
    ratingVariance: variance.toFixed(3),
    lastActive: /* @__PURE__ */ new Date()
  }).where(eq(members.id, memberId));
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
  const memberRatings = await db.select({ rawScore: ratings.rawScore }).from(ratings).where(and(eq(ratings.memberId, memberId), eq(ratings.isFlagged, false)));
  let varianceBonus = 0;
  if (memberRatings.length >= 5) {
    const scores = memberRatings.map((r) => parseFloat(r.rawScore));
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const sqDiffs = scores.map((s) => (s - mean) ** 2);
    const stddev = Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / scores.length);
    varianceBonus = Math.min(stddev * 60, 150);
  }
  const allMemberRatings = await db.select({
    businessId: ratings.businessId,
    createdAt: ratings.createdAt
  }).from(ratings).where(and(eq(ratings.memberId, memberId), eq(ratings.isFlagged, false)));
  let earlyReviewCount = 0;
  for (const r of allMemberRatings) {
    const [countBefore] = await db.select({ count: count() }).from(ratings).where(
      and(
        eq(ratings.businessId, r.businessId),
        ne(ratings.memberId, memberId),
        sql2`${ratings.createdAt} < ${r.createdAt}`
      )
    );
    if (countBefore.count < 10) earlyReviewCount++;
  }
  const pioneerRate = allMemberRatings.length > 0 ? earlyReviewCount / allMemberRatings.length : 0;
  const helpfulness = Math.round(pioneerRate * 100);
  const penaltyResult = await db.select({ total: sql2`COALESCE(SUM(${credibilityPenalties.finalPenalty}), 0)` }).from(credibilityPenalties).where(eq(credibilityPenalties.memberId, memberId));
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
  const tier = getTierFromScore(
    score,
    member.totalRatings,
    member.totalCategories,
    daysActive,
    ratingVariance,
    member.activeFlagCount
  );
  await db.update(members).set({ credibilityScore: score, credibilityTier: tier }).where(eq(members.id, memberId));
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
  }).from(ratings).innerJoin(businesses, eq(ratings.businessId, businesses.id)).where(eq(ratings.memberId, memberId)).orderBy(sql2`${ratings.createdAt} DESC`).limit(perPage).offset(offset);
  const [totalResult] = await db.select({ count: count() }).from(ratings).where(eq(ratings.memberId, memberId));
  return { ratings: ratingsResult, total: totalResult.count };
}
async function getSeasonalRatingCounts(memberId) {
  const result = await db.select({
    month: sql2`EXTRACT(MONTH FROM ${ratings.createdAt})::int`,
    cnt: count()
  }).from(ratings).where(
    and(
      eq(ratings.memberId, memberId),
      eq(ratings.isFlagged, false)
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
async function updatePushToken(memberId, pushToken) {
  await db.update(members).set({ pushToken }).where(eq(members.id, memberId));
}
async function getMemberImpact(memberId) {
  const memberRatings = await db.select({
    businessId: ratings.businessId,
    businessName: businesses.name,
    businessSlug: businesses.slug,
    rankDelta: businesses.rankDelta
  }).from(ratings).innerJoin(businesses, eq(ratings.businessId, businesses.id)).where(
    and(
      eq(ratings.memberId, memberId),
      eq(ratings.isFlagged, false)
    )
  ).groupBy(ratings.businessId, businesses.name, businesses.slug, businesses.rankDelta);
  const lastRatingRows = await db.select({
    businessName: businesses.name,
    businessSlug: businesses.slug,
    rawScore: ratings.rawScore,
    weight: ratings.weight,
    ratedAt: ratings.createdAt
  }).from(ratings).innerJoin(businesses, eq(ratings.businessId, businesses.id)).where(eq(ratings.memberId, memberId)).orderBy(desc(ratings.createdAt)).limit(1);
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
var init_members = __esm({
  "server/storage/members.ts"() {
    "use strict";
    init_schema();
    init_db();
    init_helpers();
  }
});

// server/storage/businesses.ts
import { eq as eq2, and as and2, desc as desc2, asc, sql as sql3, count as count2, gte as gte2 } from "drizzle-orm";
async function getLeaderboard(city, category, limit = 50) {
  return db.select().from(businesses).where(
    and2(
      eq2(businesses.city, city),
      eq2(businesses.category, category),
      eq2(businesses.isActive, true)
    )
  ).orderBy(asc(businesses.rankPosition)).limit(limit);
}
async function getTrendingBusinesses(city, limit = 3) {
  return db.select().from(businesses).where(
    and2(
      eq2(businesses.city, city),
      eq2(businesses.isActive, true),
      sql3`${businesses.rankDelta} > 0`
    )
  ).orderBy(desc2(businesses.rankDelta)).limit(limit);
}
async function getBusinessBySlug(slug) {
  const [business] = await db.select().from(businesses).where(eq2(businesses.slug, slug));
  return business;
}
async function getBusinessById(id) {
  const [business] = await db.select().from(businesses).where(eq2(businesses.id, id));
  return business;
}
async function searchBusinesses(query, city, category, limit = 20) {
  const sanitized = query.slice(0, 100).replace(/[%_\\]/g, "");
  const q = "%" + sanitized.toLowerCase() + "%";
  return db.select().from(businesses).where(
    and2(
      eq2(businesses.city, city),
      eq2(businesses.isActive, true),
      query ? sql3`(lower(${businesses.name}) like ${q} OR lower(${businesses.neighborhood}) like ${q})` : void 0,
      ...category ? [eq2(businesses.category, category)] : []
    )
  ).orderBy(desc2(businesses.weightedScore)).limit(limit);
}
async function getAllCategories(city) {
  const rows = await db.select({
    category: businesses.category
  }).from(businesses).where(and2(eq2(businesses.city, city), eq2(businesses.isActive, true))).groupBy(businesses.category);
  return rows.map((r) => r.category);
}
async function recalculateBusinessScore(businessId) {
  const allRatings = await db.select({
    rawScore: ratings.rawScore,
    weight: ratings.weight,
    createdAt: ratings.createdAt,
    isFlagged: ratings.isFlagged,
    autoFlagged: ratings.autoFlagged
  }).from(ratings).where(
    and2(
      eq2(ratings.businessId, businessId),
      eq2(ratings.isFlagged, false),
      eq2(ratings.autoFlagged, false)
    )
  );
  if (allRatings.length === 0) {
    await db.update(businesses).set({ weightedScore: "0", rawAvgScore: "0", totalRatings: 0, updatedAt: /* @__PURE__ */ new Date() }).where(eq2(businesses.id, businessId));
    return 0;
  }
  let totalWeightedScore = 0;
  let totalEffectiveWeight = 0;
  let rawSum = 0;
  for (const r of allRatings) {
    const ageDays = Math.floor(
      (Date.now() - new Date(r.createdAt).getTime()) / (1e3 * 60 * 60 * 24)
    );
    const temporal = getTemporalMultiplier(ageDays);
    const effectiveWeight = parseFloat(r.weight) * temporal;
    totalWeightedScore += parseFloat(r.rawScore) * effectiveWeight;
    totalEffectiveWeight += effectiveWeight;
    rawSum += parseFloat(r.rawScore);
  }
  const score = totalEffectiveWeight > 0 ? Math.round(totalWeightedScore / totalEffectiveWeight * 1e3) / 1e3 : 0;
  const rawAvg = rawSum / allRatings.length;
  await db.update(businesses).set({
    weightedScore: score.toFixed(3),
    rawAvgScore: rawAvg.toFixed(2),
    totalRatings: allRatings.length,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq2(businesses.id, businessId));
  return score;
}
async function recalculateRanks(city, category) {
  const allBusinesses = await db.select({
    id: businesses.id,
    rankPosition: businesses.rankPosition
  }).from(businesses).where(
    and2(
      eq2(businesses.city, city),
      eq2(businesses.category, category),
      eq2(businesses.isActive, true)
    )
  ).orderBy(desc2(businesses.weightedScore));
  for (let i = 0; i < allBusinesses.length; i++) {
    const oldRank = allBusinesses[i].rankPosition;
    const newRank = i + 1;
    const delta = oldRank ? oldRank - newRank : 0;
    await db.update(businesses).set({
      rankPosition: newRank,
      rankDelta: delta,
      prevRankPosition: oldRank
    }).where(eq2(businesses.id, allBusinesses[i].id));
  }
}
async function getBusinessPhotos(businessId) {
  const rows = await db.select({ photoUrl: businessPhotos.photoUrl }).from(businessPhotos).where(eq2(businessPhotos.businessId, businessId)).orderBy(asc(businessPhotos.sortOrder)).limit(3);
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
  }).from(businesses).leftJoin(businessPhotos, eq2(businesses.id, businessPhotos.businessId)).where(
    and2(
      eq2(businesses.isActive, true),
      sql3`${businesses.googlePlaceId} IS NOT NULL`,
      sql3`${businessPhotos.id} IS NULL`,
      ...city ? [eq2(businesses.city, city)] : []
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
  await db.delete(businessPhotos).where(eq2(businessPhotos.businessId, businessId));
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
      eq2(rankHistory.businessId, businessId),
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
  const { members: members2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
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
    memberName: members2.displayName,
    memberTier: members2.credibilityTier,
    memberAvatarUrl: members2.avatarUrl
  }).from(ratings).innerJoin(members2, eq2(ratings.memberId, members2.id)).where(and2(eq2(ratings.businessId, businessId), eq2(ratings.isFlagged, false))).orderBy(sql3`${ratings.createdAt} DESC`).limit(perPage).offset(offset);
  const [totalResult] = await db.select({ count: count2() }).from(ratings).where(and2(eq2(ratings.businessId, businessId), eq2(ratings.isFlagged, false)));
  return { ratings: ratingsResult, total: totalResult.count };
}
var init_businesses = __esm({
  "server/storage/businesses.ts"() {
    "use strict";
    init_schema();
    init_db();
    init_helpers();
  }
});

// server/storage/challengers.ts
import { eq as eq3, and as and3, sql as sql4 } from "drizzle-orm";
async function getActiveChallenges(city, category) {
  const challengerRows = await db.select().from(challengers).where(
    and3(
      eq3(challengers.status, "active"),
      eq3(challengers.city, city),
      ...category ? [eq3(challengers.category, category)] : []
    )
  );
  if (challengerRows.length === 0) return [];
  const bizIds = /* @__PURE__ */ new Set();
  for (const c of challengerRows) {
    bizIds.add(c.challengerId);
    bizIds.add(c.defenderId);
  }
  const bizIdArr = Array.from(bizIds);
  const bizRows = await db.select().from(businesses).where(sql4`${businesses.id} = ANY(ARRAY[${sql4.join(bizIdArr.map((id) => sql4`${id}`), sql4`,`)}]::text[])`);
  const bizMap = new Map(bizRows.map((b) => [b.id, b]));
  return challengerRows.map((c) => ({
    ...c,
    challengerBusiness: bizMap.get(c.challengerId),
    defenderBusiness: bizMap.get(c.defenderId)
  }));
}
async function updateChallengerVotes(businessId, weightedScore) {
  const asChallenger = await db.select().from(challengers).where(
    and3(eq3(challengers.challengerId, businessId), eq3(challengers.status, "active"))
  );
  for (const c of asChallenger) {
    const newVotes = parseFloat(c.challengerWeightedVotes) + weightedScore;
    await db.update(challengers).set({
      challengerWeightedVotes: newVotes.toFixed(3),
      totalVotes: sql4`${challengers.totalVotes} + 1`
    }).where(eq3(challengers.id, c.id));
  }
  const asDefender = await db.select().from(challengers).where(
    and3(eq3(challengers.defenderId, businessId), eq3(challengers.status, "active"))
  );
  for (const c of asDefender) {
    const newVotes = parseFloat(c.defenderWeightedVotes) + weightedScore;
    await db.update(challengers).set({
      defenderWeightedVotes: newVotes.toFixed(3),
      totalVotes: sql4`${challengers.totalVotes} + 1`
    }).where(eq3(challengers.id, c.id));
  }
}
var init_challengers = __esm({
  "server/storage/challengers.ts"() {
    "use strict";
    init_schema();
    init_db();
  }
});

// server/storage/ratings.ts
import { eq as eq4, and as and4, sql as sql5, count as count3, gte as gte3 } from "drizzle-orm";
async function detectAnomalies(member, business, rawScore) {
  const flags = [];
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1e3);
  const [recentCount] = await db.select({ count: count3() }).from(ratings).where(
    and4(
      eq4(ratings.memberId, member.id),
      gte3(ratings.createdAt, oneHourAgo)
    )
  );
  if (recentCount.count > 5) flags.push("burst_velocity");
  if (member.totalRatings >= 10) {
    const memberRatings = await db.select({ rawScore: ratings.rawScore }).from(ratings).where(eq4(ratings.memberId, member.id));
    const fiveStarCount = memberRatings.filter((r) => parseFloat(r.rawScore) >= 4.8).length;
    if (fiveStarCount / memberRatings.length > 0.9) flags.push("perfect_score_pattern");
  }
  if (rawScore <= 1.5 && member.totalRatings >= 5) {
    const memberRatings = await db.select({ rawScore: ratings.rawScore }).from(ratings).where(eq4(ratings.memberId, member.id));
    const oneStarCount = memberRatings.filter((r) => parseFloat(r.rawScore) <= 1.5).length;
    if (oneStarCount / memberRatings.length > 0.6) flags.push("one_star_bomber");
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
  const [newAcctRatings] = await db.select({ count: count3() }).from(ratings).innerJoin(members, eq4(ratings.memberId, members.id)).where(
    and4(
      eq4(ratings.businessId, business.id),
      gte3(ratings.createdAt, oneDayAgo),
      gte3(members.joinedAt, thirtyDaysAgo)
    )
  );
  if (newAcctRatings.count > 10) {
    flags.push("coordinated_new_account_burst");
  }
  return flags;
}
async function submitRating(memberId, data) {
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
  const [existingToday] = await db.select({ count: count3() }).from(ratings).where(
    and4(
      eq4(ratings.memberId, memberId),
      eq4(ratings.businessId, data.businessId),
      gte3(ratings.createdAt, today)
    )
  );
  if (existingToday.count > 0) throw new Error("Already rated today. Come back tomorrow.");
  const rawScore = (data.q1Score + data.q2Score + data.q3Score) / 3;
  const anomalyFlags = await detectAnomalies(member, business, rawScore);
  const autoFlagged = anomalyFlags.length > 0;
  const weight = getVoteWeight(member.credibilityScore);
  const weighted = rawScore * weight;
  const source = data.qrScanId ? "qr_scan" : "app";
  const [rating] = await db.insert(ratings).values({
    memberId,
    businessId: data.businessId,
    q1Score: data.q1Score,
    q2Score: data.q2Score,
    q3Score: data.q3Score,
    wouldReturn: data.wouldReturn,
    note: data.note || null,
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
    await db.update(dishes).set({ voteCount: sql5`${dishes.voteCount} + 1` }).where(eq4(dishes.id, data.dishId));
  } else if (data.newDishName) {
    const normalized = data.newDishName.toLowerCase().trim();
    const words = normalized.split(/\s+/);
    if (words.length >= 1 && words.length <= 5 && !normalized.includes("http")) {
      const existing = await db.select().from(dishes).where(
        and4(
          eq4(dishes.businessId, data.businessId),
          eq4(dishes.nameNormalized, normalized)
        )
      );
      let dishId;
      if (existing.length > 0) {
        dishId = existing[0].id;
        await db.update(dishes).set({ voteCount: sql5`${dishes.voteCount} + 1` }).where(eq4(dishes.id, dishId));
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
  const prevRank = business.rankPosition;
  await recalculateBusinessScore(data.businessId);
  await recalculateRanks(business.city, business.category);
  await updateChallengerVotes(data.businessId, weighted);
  if (data.qrScanId) {
    const { qrScans: qrScans2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    await db.update(qrScans2).set({ converted: true }).where(eq4(qrScans2.id, data.qrScanId));
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
  }
});

// server/storage/dishes.ts
import { eq as eq5, and as and5, desc as desc3, sql as sql6 } from "drizzle-orm";
async function getBusinessDishes(businessId, limit = 5) {
  return db.select().from(dishes).where(and5(eq5(dishes.businessId, businessId), eq5(dishes.isActive, true))).orderBy(desc3(dishes.voteCount)).limit(limit);
}
async function searchDishes(businessId, query) {
  const normalized = query.slice(0, 100).replace(/[%_\\]/g, "").toLowerCase().trim();
  if (normalized.length < 2) {
    return getBusinessDishes(businessId, 5);
  }
  let results = await db.select().from(dishes).where(
    and5(
      eq5(dishes.businessId, businessId),
      eq5(dishes.isActive, true),
      sql6`${dishes.nameNormalized} ILIKE ${normalized + "%"}`
    )
  ).orderBy(desc3(dishes.voteCount)).limit(5);
  if (results.length < 3) {
    const containsResults = await db.select().from(dishes).where(
      and5(
        eq5(dishes.businessId, businessId),
        eq5(dishes.isActive, true),
        sql6`${dishes.nameNormalized} ILIKE ${"%" + normalized + "%"}`
      )
    ).orderBy(desc3(dishes.voteCount)).limit(5);
    const existingIds = new Set(results.map((r) => r.id));
    for (const r of containsResults) {
      if (!existingIds.has(r.id)) {
        results.push(r);
      }
    }
  }
  return results.slice(0, 5);
}
var init_dishes = __esm({
  "server/storage/dishes.ts"() {
    "use strict";
    init_schema();
    init_db();
  }
});

// server/storage/categories.ts
import { eq as eq6, desc as desc4 } from "drizzle-orm";
async function getDbCategories(activeOnly = true) {
  if (activeOnly) {
    return db.select().from(categories).where(eq6(categories.isActive, true));
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
  return db.select().from(categorySuggestions).where(eq6(categorySuggestions.status, "pending")).orderBy(desc4(categorySuggestions.voteCount));
}
async function reviewSuggestion(id, status, reviewedBy) {
  const [updated] = await db.update(categorySuggestions).set({ status, reviewedBy, reviewedAt: /* @__PURE__ */ new Date() }).where(eq6(categorySuggestions.id, id)).returning();
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
import { eq as eq7, and as and6, count as count4, desc as desc5 } from "drizzle-orm";
async function getMemberBadges(memberId) {
  return db.select().from(memberBadges).where(eq7(memberBadges.memberId, memberId)).orderBy(memberBadges.earnedAt);
}
async function getMemberBadgeCount(memberId) {
  const [result] = await db.select({ cnt: count4() }).from(memberBadges).where(eq7(memberBadges.memberId, memberId));
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
  const [result] = await db.select({ cnt: count4() }).from(memberBadges).where(and6(eq7(memberBadges.memberId, memberId), eq7(memberBadges.badgeId, badgeId)));
  return Number(result?.cnt ?? 0) > 0;
}
async function getEarnedBadgeIds(memberId) {
  const rows = await db.select({ badgeId: memberBadges.badgeId }).from(memberBadges).where(eq7(memberBadges.memberId, memberId));
  return rows.map((r) => r.badgeId);
}
async function getBadgeLeaderboard(limit = 20) {
  return db.select({
    memberId: memberBadges.memberId,
    displayName: members.displayName,
    username: members.username,
    avatarUrl: members.avatarUrl,
    credibilityTier: members.credibilityTier,
    badgeCount: count4(memberBadges.id)
  }).from(memberBadges).innerJoin(members, eq7(memberBadges.memberId, members.id)).groupBy(memberBadges.memberId, members.displayName, members.username, members.avatarUrl, members.credibilityTier).orderBy(desc5(count4(memberBadges.id))).limit(limit);
}
var init_badges = __esm({
  "server/storage/badges.ts"() {
    "use strict";
    init_schema();
    init_db();
  }
});

// server/storage/payments.ts
import { eq as eq8, and as and7, desc as desc6, sql as sql7, count as count5, sum } from "drizzle-orm";
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
  const [payment] = await db.select().from(payments).where(eq8(payments.id, id)).limit(1);
  return payment ?? null;
}
async function updatePaymentStatus(id, status) {
  const [updated] = await db.update(payments).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq8(payments.id, id)).returning();
  return updated ?? null;
}
async function updatePaymentStatusByStripeId(stripePaymentIntentId, status) {
  const [updated] = await db.update(payments).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq8(payments.stripePaymentIntentId, stripePaymentIntentId)).returning();
  return updated ?? null;
}
async function getMemberPayments(memberId, limit = 20) {
  return db.select().from(payments).where(eq8(payments.memberId, memberId)).orderBy(desc6(payments.createdAt)).limit(limit);
}
async function getBusinessPayments(businessId, limit = 20) {
  return db.select().from(payments).where(eq8(payments.businessId, businessId)).orderBy(desc6(payments.createdAt)).limit(limit);
}
async function getRevenueMetrics() {
  const byTypeRows = await db.select({
    type: payments.type,
    count: count5(),
    revenue: sum(payments.amount)
  }).from(payments).where(eq8(payments.status, "succeeded")).groupBy(payments.type);
  const [activeRow] = await db.select({ count: count5() }).from(payments).where(
    and7(
      eq8(payments.status, "succeeded")
    )
  );
  const [cancelledRow] = await db.select({ count: count5() }).from(payments).where(eq8(payments.status, "cancelled"));
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
    month: sql7`strftime('%Y-%m', ${payments.createdAt})`,
    revenue: sql7`COALESCE(SUM(${payments.amount}), 0)`,
    count: sql7`COUNT(*)`
  }).from(payments).where(eq8(payments.status, "succeeded")).groupBy(sql7`strftime('%Y-%m', ${payments.createdAt})`).orderBy(sql7`strftime('%Y-%m', ${payments.createdAt}) DESC`).limit(months);
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
import { eq as eq9, desc as desc7 } from "drizzle-orm";
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
  await db.update(webhookEvents).set({ processed: true, error: error || null }).where(eq9(webhookEvents.id, id));
}
async function getWebhookEventById(id) {
  const [event] = await db.select().from(webhookEvents).where(eq9(webhookEvents.id, id)).limit(1);
  return event ?? null;
}
async function getRecentWebhookEvents(source, limit = 50) {
  return db.select().from(webhookEvents).where(eq9(webhookEvents.source, source)).orderBy(desc7(webhookEvents.createdAt)).limit(limit);
}
var init_webhook_events = __esm({
  "server/storage/webhook-events.ts"() {
    "use strict";
    init_schema();
    init_db();
  }
});

// server/storage/featured-placements.ts
import { eq as eq10, and as and8, gt, lte, desc as desc8 } from "drizzle-orm";
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
    and8(
      eq10(featuredPlacements.city, city),
      eq10(featuredPlacements.status, "active"),
      gt(featuredPlacements.expiresAt, now)
    )
  ).orderBy(desc8(featuredPlacements.createdAt));
}
async function getBusinessFeaturedStatus(businessId) {
  const now = /* @__PURE__ */ new Date();
  const [placement] = await db.select().from(featuredPlacements).where(
    and8(
      eq10(featuredPlacements.businessId, businessId),
      eq10(featuredPlacements.status, "active"),
      gt(featuredPlacements.expiresAt, now)
    )
  ).orderBy(desc8(featuredPlacements.createdAt)).limit(1);
  return placement ?? null;
}
async function expireFeaturedByPayment(paymentId) {
  const [updated] = await db.update(featuredPlacements).set({ status: "cancelled" }).where(
    and8(
      eq10(featuredPlacements.paymentId, paymentId),
      eq10(featuredPlacements.status, "active")
    )
  ).returning();
  return updated ?? null;
}
async function expireOldPlacements() {
  const now = /* @__PURE__ */ new Date();
  const result = await db.update(featuredPlacements).set({ status: "expired" }).where(
    and8(
      eq10(featuredPlacements.status, "active"),
      lte(featuredPlacements.expiresAt, now)
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
import { eq as eq11, and as and9, count as count6, desc as desc9 } from "drizzle-orm";
async function submitClaim(businessId, memberId, verificationMethod) {
  const [claim] = await db.insert(businessClaims).values({ businessId, memberId, verificationMethod }).returning();
  return claim;
}
async function getClaimByMemberAndBusiness(memberId, businessId) {
  const [claim] = await db.select().from(businessClaims).where(
    and9(
      eq11(businessClaims.memberId, memberId),
      eq11(businessClaims.businessId, businessId)
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
  }).from(businessClaims).leftJoin(businesses, eq11(businessClaims.businessId, businesses.id)).leftJoin(members, eq11(businessClaims.memberId, members.id)).where(eq11(businessClaims.status, "pending")).orderBy(desc9(businessClaims.submittedAt));
}
async function reviewClaim(id, status, reviewedBy) {
  const [updated] = await db.update(businessClaims).set({ status, reviewedAt: /* @__PURE__ */ new Date() }).where(eq11(businessClaims.id, id)).returning();
  return updated ?? null;
}
async function getClaimCount() {
  const [result] = await db.select({ cnt: count6() }).from(businessClaims).where(eq11(businessClaims.status, "pending"));
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
  }).from(ratingFlags).leftJoin(members, eq11(ratingFlags.flaggerId, members.id)).where(eq11(ratingFlags.status, "pending")).orderBy(desc9(ratingFlags.createdAt));
}
async function reviewFlag(id, status, reviewedBy) {
  const [updated] = await db.update(ratingFlags).set({ status, reviewedBy, reviewedAt: /* @__PURE__ */ new Date() }).where(eq11(ratingFlags.id, id)).returning();
  return updated ?? null;
}
async function getFlagCount() {
  const [result] = await db.select({ cnt: count6() }).from(ratingFlags).where(eq11(ratingFlags.status, "pending"));
  return Number(result?.cnt ?? 0);
}
var init_claims = __esm({
  "server/storage/claims.ts"() {
    "use strict";
    init_schema();
    init_db();
  }
});

// server/storage/index.ts
var storage_exports = {};
__export(storage_exports, {
  awardBadge: () => awardBadge,
  createCategorySuggestion: () => createCategorySuggestion,
  createFeaturedPlacement: () => createFeaturedPlacement,
  createMember: () => createMember,
  createPaymentRecord: () => createPaymentRecord,
  deleteBusinessPhotos: () => deleteBusinessPhotos,
  expireFeaturedByPayment: () => expireFeaturedByPayment,
  expireOldPlacements: () => expireOldPlacements,
  getActiveChallenges: () => getActiveChallenges,
  getActiveFeaturedInCity: () => getActiveFeaturedInCity,
  getAdminMemberList: () => getAdminMemberList,
  getAllCategories: () => getAllCategories,
  getBadgeLeaderboard: () => getBadgeLeaderboard,
  getBusinessById: () => getBusinessById,
  getBusinessBySlug: () => getBusinessBySlug,
  getBusinessDishes: () => getBusinessDishes,
  getBusinessFeaturedStatus: () => getBusinessFeaturedStatus,
  getBusinessPayments: () => getBusinessPayments,
  getBusinessPhotos: () => getBusinessPhotos,
  getBusinessPhotosMap: () => getBusinessPhotosMap,
  getBusinessRatings: () => getBusinessRatings,
  getBusinessesWithoutPhotos: () => getBusinessesWithoutPhotos,
  getClaimByMemberAndBusiness: () => getClaimByMemberAndBusiness,
  getClaimCount: () => getClaimCount,
  getCredibilityTier: () => getCredibilityTier,
  getDbCategories: () => getDbCategories,
  getEarnedBadgeIds: () => getEarnedBadgeIds,
  getFlagCount: () => getFlagCount,
  getLeaderboard: () => getLeaderboard,
  getMemberBadgeCount: () => getMemberBadgeCount,
  getMemberBadges: () => getMemberBadges,
  getMemberByAuthId: () => getMemberByAuthId,
  getMemberByEmail: () => getMemberByEmail,
  getMemberById: () => getMemberById,
  getMemberByUsername: () => getMemberByUsername,
  getMemberCount: () => getMemberCount,
  getMemberImpact: () => getMemberImpact,
  getMemberPayments: () => getMemberPayments,
  getMemberRatings: () => getMemberRatings,
  getPaymentById: () => getPaymentById,
  getPendingClaims: () => getPendingClaims,
  getPendingFlags: () => getPendingFlags,
  getPendingSuggestions: () => getPendingSuggestions,
  getRankHistory: () => getRankHistory,
  getRecentWebhookEvents: () => getRecentWebhookEvents,
  getRevenueByMonth: () => getRevenueByMonth,
  getRevenueMetrics: () => getRevenueMetrics,
  getSeasonalRatingCounts: () => getSeasonalRatingCounts,
  getTemporalMultiplier: () => getTemporalMultiplier,
  getTierFromScore: () => getTierFromScore,
  getTrendingBusinesses: () => getTrendingBusinesses,
  getVoteWeight: () => getVoteWeight,
  getWebhookEventById: () => getWebhookEventById,
  hasBadge: () => hasBadge,
  insertBusinessPhotos: () => insertBusinessPhotos,
  logWebhookEvent: () => logWebhookEvent,
  markWebhookProcessed: () => markWebhookProcessed,
  recalculateBusinessScore: () => recalculateBusinessScore,
  recalculateCredibilityScore: () => recalculateCredibilityScore,
  recalculateRanks: () => recalculateRanks,
  reviewClaim: () => reviewClaim,
  reviewFlag: () => reviewFlag,
  reviewSuggestion: () => reviewSuggestion,
  searchBusinesses: () => searchBusinesses,
  searchDishes: () => searchDishes,
  submitClaim: () => submitClaim,
  submitRating: () => submitRating,
  updateChallengerVotes: () => updateChallengerVotes,
  updateMemberStats: () => updateMemberStats,
  updatePaymentStatus: () => updatePaymentStatus,
  updatePaymentStatusByStripeId: () => updatePaymentStatusByStripeId,
  updatePushToken: () => updatePushToken
});
var init_storage = __esm({
  "server/storage/index.ts"() {
    "use strict";
    init_helpers();
    init_members();
    init_businesses();
    init_ratings();
    init_challengers();
    init_dishes();
    init_categories();
    init_badges();
    init_payments();
    init_webhook_events();
    init_featured_placements();
    init_claims();
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

// server/email.ts
var email_exports = {};
__export(email_exports, {
  sendClaimAdminNotification: () => sendClaimAdminNotification,
  sendClaimConfirmationEmail: () => sendClaimConfirmationEmail,
  sendEmail: () => sendEmail,
  sendPaymentReceiptEmail: () => sendPaymentReceiptEmail,
  sendWelcomeEmail: () => sendWelcomeEmail
});
async function sendEmail(payload) {
  if (!RESEND_API_KEY) {
    emailLog.info(`[DEV] To: ${payload.to} | Subject: ${payload.subject}`);
    return;
  }
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
    if (!res.ok) {
      const body = await res.text();
      emailLog.error(`Resend API error ${res.status}: ${body.slice(0, 200)}`);
    } else {
      emailLog.info(`Sent to ${payload.to}: ${payload.subject}`);
    }
  } catch (err) {
    emailLog.error(`Email send failed: ${err.message}`);
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
    emailLog = log.tag("Email");
    RESEND_API_KEY = process.env.RESEND_API_KEY || "";
    FROM_ADDRESS = process.env.EMAIL_FROM || "TopRanker <noreply@topranker.com>";
  }
});

// server/seed-cities.ts
var seed_cities_exports = {};
__export(seed_cities_exports, {
  seedCities: () => seedCities
});
async function seedCities() {
  console.log(`Seeding ${ALL_CITY_BUSINESSES.length} businesses across 4 cities...`);
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
  console.log("Cities: Austin (10), Houston (8), San Antonio (7), Fort Worth (7)");
}
var AUSTIN_BUSINESSES, HOUSTON_BUSINESSES, SAN_ANTONIO_BUSINESSES, FORT_WORTH_BUSINESSES, ALL_CITY_BUSINESSES, isDirectRun;
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
    ALL_CITY_BUSINESSES = [
      ...AUSTIN_BUSINESSES,
      ...HOUSTON_BUSINESSES,
      ...SAN_ANTONIO_BUSINESSES,
      ...FORT_WORTH_BUSINESSES
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
async function processStripeEvent(event) {
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
var whLog, STATUS_MAP;
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
  createChallengerPayment: () => createChallengerPayment,
  createDashboardProPayment: () => createDashboardProPayment,
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

// server/seed.ts
var seed_exports = {};
__export(seed_exports, {
  seedDatabase: () => seedDatabase
});
import { sql as sql8 } from "drizzle-orm";
import bcrypt2 from "bcrypt";
async function seedDatabase() {
  console.log("Seeding database...");
  const existingBusinesses = await db.select({ id: businesses.id }).from(businesses).limit(1);
  if (existingBusinesses.length > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }
  const insertedBusinesses = [];
  for (const biz of SEED_BUSINESSES) {
    const [inserted] = await db.insert(businesses).values({
      name: biz.name,
      slug: biz.slug,
      category: biz.category,
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
      isActive: true,
      dataSource: "admin"
    }).returning();
    insertedBusinesses.push(inserted);
  }
  console.log(`Seeded ${insertedBusinesses.length} businesses`);
  const photoSets = {
    "spice-garden-dallas": [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&h=400&fit=crop"
    ],
    "the-yard-kitchen-dallas": [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop"
    ],
    "lucky-cat-ramen-dallas": [
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1623341214825-9f4f963727da?w=600&h=400&fit=crop"
    ],
    "smoke-and-vine-dallas": [
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1558030006-450675393462?w=600&h=400&fit=crop"
    ],
    "abuelas-kitchen-dallas": [
      "https://images.unsplash.com/photo-1653005753991-22a8bf831f89?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&h=400&fit=crop"
    ],
    "seoul-brothers-dallas": [
      "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&h=400&fit=crop"
    ],
    "pecan-lodge-dallas": [
      "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1558030006-450675393462?w=600&h=400&fit=crop"
    ],
    "lucia-dallas": [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop"
    ],
    "khao-noodle-dallas": [
      "https://images.unsplash.com/photo-1552611052-33e04de1b100?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=600&h=400&fit=crop"
    ],
    "fearings-dallas": [
      "https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop"
    ],
    "cultivar-coffee-dallas": [
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&h=400&fit=crop"
    ],
    "houndstooth-coffee-dallas": [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=600&h=400&fit=crop"
    ],
    "the-brew-room-dallas": [
      "https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&h=400&fit=crop"
    ],
    "mudleaf-coffee-dallas": [
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop"
    ],
    "merit-coffee-dallas": [
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop"
    ],
    "taco-stop-dallas": [
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=600&h=400&fit=crop"
    ],
    "fuel-city-tacos-dallas": [
      "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=600&h=400&fit=crop"
    ],
    "elote-man-dallas": [
      "https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop"
    ],
    "kabob-king-dallas": [
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&h=400&fit=crop"
    ],
    "chimmys-churros-dallas": [
      "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&h=400&fit=crop"
    ],
    "midnight-rambler-dallas": [
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=600&h=400&fit=crop"
    ],
    "atwater-alley-dallas": [
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1525268323446-0505b6fe7778?w=600&h=400&fit=crop"
    ],
    "the-grapevine-bar-dallas": [
      "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1538488881038-e252a119ace7?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop"
    ],
    "javiers-cigar-bar-dallas": [
      "https://images.unsplash.com/photo-1525268323446-0505b6fe7778?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=600&h=400&fit=crop"
    ],
    "lee-harveys-dallas": [
      "https://images.unsplash.com/photo-1538488881038-e252a119ace7?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1525268323446-0505b6fe7778?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop"
    ],
    "village-baking-co-dallas": [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1612203985729-70726954388c?w=600&h=400&fit=crop"
    ],
    "la-casita-bakeshop-dallas": [
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&h=400&fit=crop"
    ],
    "bisous-bisous-patisserie-dallas": [
      "https://images.unsplash.com/photo-1612203985729-70726954388c?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop"
    ],
    "empire-baking-co-dallas": [
      "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1612203985729-70726954388c?w=600&h=400&fit=crop"
    ],
    "haute-sweets-patisserie-dallas": [
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1612203985729-70726954388c?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=400&fit=crop"
    ],
    "raising-canes-dallas": [
      "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&h=400&fit=crop"
    ],
    "whataburger-dallas": [
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=600&h=400&fit=crop"
    ],
    "in-n-out-burger-dallas": [
      "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600&h=400&fit=crop"
    ],
    "wingstop-dallas-hq": [
      "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop"
    ],
    "taco-bell-cantina-dallas": [
      "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&h=400&fit=crop"
    ]
  };
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
    await db.update(businesses).set({ inChallenger: true }).where(sql8`${businesses.id} IN (${spiceGarden.id}, ${yardKitchen.id})`);
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
var SEED_BUSINESSES, SEED_DISHES;
var init_seed = __esm({
  "server/seed.ts"() {
    "use strict";
    init_db();
    init_schema();
    SEED_BUSINESSES = [
      { name: "Spice Garden", slug: "spice-garden-dallas", neighborhood: "Uptown", category: "restaurant", weightedScore: "4.720", rawAvgScore: "4.60", rankPosition: 1, rankDelta: 0, totalRatings: 312, description: "Thirty years of perfecting North Indian cuisine.", priceRange: "$$$", phone: "(214) 555-0192", address: "3821 Cedar Springs Rd, Uptown, Dallas", lat: "32.8087452", lng: "-96.8024537", isOpenNow: true, website: "https://spicegardendallas.com", photoUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop" },
      { name: "The Yard Kitchen", slug: "the-yard-kitchen-dallas", neighborhood: "Bishop Arts", category: "restaurant", weightedScore: "4.580", rawAvgScore: "4.45", rankPosition: 2, rankDelta: 1, totalRatings: 287, description: "Farm-to-table restaurant in Bishop Arts District.", priceRange: "$$", phone: "(214) 555-0234", address: "402 N Bishop Ave, Bishop Arts, Dallas", lat: "32.7505612", lng: "-96.8267483", isOpenNow: true, website: "https://theyardkitchen.com", photoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop" },
      { name: "Lucky Cat Ramen", slug: "lucky-cat-ramen-dallas", neighborhood: "Deep Ellum", category: "restaurant", weightedScore: "4.510", rawAvgScore: "4.38", rankPosition: 3, rankDelta: -1, totalRatings: 198, description: "Authentic Japanese ramen with house-made noodles.", priceRange: "$$", phone: "(214) 555-0345", address: "2815 Main St, Deep Ellum, Dallas", lat: "32.7833148", lng: "-96.7836459", isOpenNow: false, website: "https://luckycatramen.com", photoUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop" },
      { name: "Smoke & Vine", slug: "smoke-and-vine-dallas", neighborhood: "Oak Lawn", category: "restaurant", weightedScore: "4.350", rawAvgScore: "4.20", rankPosition: 4, rankDelta: 2, totalRatings: 156, description: "Texas BBQ meets fine wine in this Oak Lawn gem.", priceRange: "$$$", phone: "(214) 555-0456", address: "4011 Lemmon Ave, Oak Lawn, Dallas", lat: "32.8118523", lng: "-96.8200134", isOpenNow: true, website: "https://smokeandvinedallas.com", photoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop" },
      { name: "Abuela's Kitchen", slug: "abuelas-kitchen-dallas", neighborhood: "Oak Cliff", category: "restaurant", weightedScore: "4.280", rawAvgScore: "4.15", rankPosition: 5, rankDelta: 0, totalRatings: 234, description: "Three generations of Mexican recipes from Oaxaca.", priceRange: "$", phone: "(214) 555-0567", address: "1234 Jefferson Blvd, Oak Cliff, Dallas", lat: "32.7453102", lng: "-96.8312487", isOpenNow: true, website: "https://abuelaskitchendallas.com", photoUrl: "https://images.unsplash.com/photo-1653005753991-22a8bf831f89?w=600&h=400&fit=crop" },
      { name: "Seoul Brothers", slug: "seoul-brothers-dallas", neighborhood: "Carrollton", category: "restaurant", weightedScore: "4.150", rawAvgScore: "4.00", rankPosition: 6, rankDelta: -2, totalRatings: 143, description: "Korean fusion with bold flavors in Carrollton.", priceRange: "$$", phone: "(214) 555-0678", address: "2570 Old Denton Rd, Carrollton, Dallas", lat: "32.9537482", lng: "-96.8903456", isOpenNow: false, website: "https://seoulbrothersdallas.com", photoUrl: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600&h=400&fit=crop" },
      { name: "Pecan Lodge", slug: "pecan-lodge-dallas", neighborhood: "Deep Ellum", category: "restaurant", weightedScore: "4.050", rawAvgScore: "3.95", rankPosition: 7, rankDelta: 0, totalRatings: 523, description: "The most decorated BBQ joint in Dallas history.", priceRange: "$$", phone: "(214) 555-0948", address: "2702 Main St, Deep Ellum, Dallas", lat: "32.7844523", lng: "-96.7842178", isOpenNow: true, website: "https://pecanlodge.com", photoUrl: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&h=400&fit=crop" },
      { name: "Lucia", slug: "lucia-dallas", neighborhood: "Bishop Arts", category: "restaurant", weightedScore: "3.920", rawAvgScore: "3.85", rankPosition: 8, rankDelta: 1, totalRatings: 167, description: "Chef David Uygur's intimate Italian-inspired dining room.", priceRange: "$$$$", phone: "(214) 555-0666", address: "408 W 8th St, Bishop Arts, Dallas", lat: "32.7494123", lng: "-96.8276789", isOpenNow: false, website: "https://luciadallas.com", photoUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop" },
      { name: "Khao Noodle Shop", slug: "khao-noodle-dallas", neighborhood: "Lowest Greenville", category: "restaurant", weightedScore: "3.800", rawAvgScore: "3.75", rankPosition: 9, rankDelta: -1, totalRatings: 154, description: "Northern Thai street food with zero compromise.", priceRange: "$$", phone: "(214) 555-0887", address: "4812 Bryan St, Lowest Greenville, Dallas", lat: "32.7908432", lng: "-96.7712345", isOpenNow: true, website: "https://khaonoodleshop.com", photoUrl: "https://images.unsplash.com/photo-1552611052-33e04de1b100?w=600&h=400&fit=crop" },
      { name: "Fearing's", slug: "fearings-dallas", neighborhood: "Uptown", category: "restaurant", weightedScore: "3.680", rawAvgScore: "3.60", rankPosition: 10, rankDelta: 0, totalRatings: 178, description: "Dean Fearing's flagship inside the Ritz-Carlton.", priceRange: "$$$$", phone: "(214) 555-0220", address: "2121 McKinney Ave, Uptown, Dallas", lat: "32.7978432", lng: "-96.8012345", isOpenNow: true, website: "https://fearingsrestaurant.com", photoUrl: "https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=600&h=400&fit=crop" },
      { name: "Cultivar Coffee", slug: "cultivar-coffee-dallas", neighborhood: "East Dallas", category: "cafe", weightedScore: "4.650", rawAvgScore: "4.50", rankPosition: 1, rankDelta: 0, totalRatings: 189, description: "Single-origin pour-overs and house-roasted beans.", priceRange: "$$", phone: "(214) 555-0789", address: "313 N Bishop Ave, East Dallas, Dallas", lat: "32.7932145", lng: "-96.7645321", isOpenNow: true, website: "https://cultivarcoffee.com", photoUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop" },
      { name: "Houndstooth Coffee", slug: "houndstooth-coffee-dallas", neighborhood: "Henderson", category: "cafe", weightedScore: "4.520", rawAvgScore: "4.40", rankPosition: 2, rankDelta: 0, totalRatings: 167, description: "Specialty coffee bar with minimalist aesthetic.", priceRange: "$$", phone: "(214) 555-0890", address: "1900 N Henderson Ave, Henderson, Dallas", lat: "32.7998765", lng: "-96.7789012", isOpenNow: true, website: "https://houndstoothcoffee.com", photoUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop" },
      { name: "The Brew Room", slug: "the-brew-room-dallas", neighborhood: "Uptown", category: "cafe", weightedScore: "4.380", rawAvgScore: "4.25", rankPosition: 3, rankDelta: 1, totalRatings: 132, description: "Cozy Uptown cafe with craft coffee and pastries.", priceRange: "$", phone: "(214) 555-0901", address: "2901 Thomas Ave, Uptown, Dallas", lat: "32.8012345", lng: "-96.7976543", isOpenNow: false, website: "https://thebrewroomdallas.com", photoUrl: "https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=600&h=400&fit=crop" },
      { name: "Mudleaf Coffee", slug: "mudleaf-coffee-dallas", neighborhood: "Oak Cliff", category: "cafe", weightedScore: "4.200", rawAvgScore: "4.10", rankPosition: 4, rankDelta: -1, totalRatings: 98, description: "Community-focused coffee shop in Oak Cliff.", priceRange: "$", phone: "(214) 555-1012", address: "1621 W Davis St, Oak Cliff, Dallas", lat: "32.7489012", lng: "-96.8345678", isOpenNow: true, website: "https://mudleafcoffee.com", photoUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop" },
      { name: "Merit Coffee", slug: "merit-coffee-dallas", neighborhood: "Design District", category: "cafe", weightedScore: "4.100", rawAvgScore: "4.00", rankPosition: 5, rankDelta: 0, totalRatings: 76, description: "Texas-based specialty coffee roasters.", priceRange: "$$", phone: "(214) 555-1123", address: "1445 Hi Line Dr, Design District, Dallas", lat: "32.7856789", lng: "-96.8123456", isOpenNow: false, website: "https://meritcoffee.com", photoUrl: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&h=400&fit=crop" },
      { name: "Taco Stop", slug: "taco-stop-dallas", neighborhood: "Oak Cliff", category: "street_food", weightedScore: "4.710", rawAvgScore: "4.55", rankPosition: 1, rankDelta: 0, totalRatings: 456, description: "Legendary street tacos \u2014 the al pastor is unreal.", priceRange: "$", phone: "(214) 555-1234", address: "2811 Greenville Ave, Oak Cliff, Dallas", lat: "32.7423456", lng: "-96.8378901", isOpenNow: true, website: "https://tacostopdallas.com", photoUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop" },
      { name: "Fuel City Tacos", slug: "fuel-city-tacos-dallas", neighborhood: "Riverfront", category: "street_food", weightedScore: "4.540", rawAvgScore: "4.40", rankPosition: 2, rankDelta: 0, totalRatings: 378, description: "Gas station tacos that are famous citywide.", priceRange: "$", phone: "(214) 555-1345", address: "801 S Riverfront Blvd, Riverfront, Dallas", lat: "32.7701234", lng: "-96.8178901", isOpenNow: true, website: "https://fuelcitytacos.com", photoUrl: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&h=400&fit=crop" },
      { name: "Elote Man", slug: "elote-man-dallas", neighborhood: "Pleasant Grove", category: "street_food", weightedScore: "4.320", rawAvgScore: "4.20", rankPosition: 3, rankDelta: 1, totalRatings: 189, description: "Mexican street corn done right.", priceRange: "$", phone: "(214) 555-1456", address: "Mobile - Pleasant Grove area", lat: "32.7234567", lng: "-96.7456789", isOpenNow: false, photoUrl: "https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=600&h=400&fit=crop" },
      { name: "Kabob King", slug: "kabob-king-dallas", neighborhood: "Richardson", category: "street_food", weightedScore: "4.180", rawAvgScore: "4.05", rankPosition: 4, rankDelta: -1, totalRatings: 145, description: "Pakistani-style seekh kabobs grilled fresh.", priceRange: "$", phone: "(214) 555-1567", address: "750 W Arapaho Rd, Richardson, Dallas", lat: "32.9512345", lng: "-96.7534567", isOpenNow: true, website: "https://kabobkingdallas.com", photoUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop" },
      { name: "Chimmy's Churros", slug: "chimmys-churros-dallas", neighborhood: "Deep Ellum", category: "street_food", weightedScore: "4.050", rawAvgScore: "3.95", rankPosition: 5, rankDelta: 0, totalRatings: 112, description: "Fresh churros with creative dipping sauces.", priceRange: "$", phone: "(214) 555-1678", address: "2737 Main St, Deep Ellum, Dallas", lat: "32.7834567", lng: "-96.7823456", isOpenNow: true, website: "https://chimmyschurros.com", photoUrl: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600&h=400&fit=crop" },
      { name: "Midnight Rambler", slug: "midnight-rambler-dallas", neighborhood: "Downtown", category: "bar", weightedScore: "4.680", rawAvgScore: "4.55", rankPosition: 1, rankDelta: 0, totalRatings: 234, description: "Sophisticated cocktail bar in the Joule Hotel basement.", priceRange: "$$$", phone: "(214) 555-1789", address: "1530 Main St, Downtown, Dallas", lat: "32.7812345", lng: "-96.7967890", isOpenNow: true, website: "https://midnightrambler.com", photoUrl: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=400&fit=crop" },
      { name: "Atwater Alley", slug: "atwater-alley-dallas", neighborhood: "Deep Ellum", category: "bar", weightedScore: "4.450", rawAvgScore: "4.30", rankPosition: 2, rankDelta: 1, totalRatings: 198, description: "Craft beer and creative cocktails in Deep Ellum.", priceRange: "$$", phone: "(214) 555-1890", address: "2815 Elm St, Deep Ellum, Dallas", lat: "32.7823456", lng: "-96.7834567", isOpenNow: true, website: "https://atwateralley.com", photoUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop" },
      { name: "The Grapevine Bar", slug: "the-grapevine-bar-dallas", neighborhood: "Greenville", category: "bar", weightedScore: "4.280", rawAvgScore: "4.15", rankPosition: 3, rankDelta: -1, totalRatings: 167, description: "Oldest bar in Dallas with classic dive bar vibes.", priceRange: "$", phone: "(214) 555-1901", address: "3902 Maple Ave, Greenville, Dallas", lat: "32.8134567", lng: "-96.8123456", isOpenNow: false, website: "https://thegrapevinebar.com", photoUrl: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=600&h=400&fit=crop" },
      { name: "Javier's Cigar Bar", slug: "javiers-cigar-bar-dallas", neighborhood: "Knox-Henderson", category: "bar", weightedScore: "4.120", rawAvgScore: "4.00", rankPosition: 4, rankDelta: 0, totalRatings: 134, description: "Upscale cigar lounge with premium spirits.", priceRange: "$$$", phone: "(214) 555-2012", address: "4912 Cole Ave, Knox-Henderson, Dallas", lat: "32.8212345", lng: "-96.7912345", isOpenNow: true, website: "https://javierscigarbar.com", photoUrl: "https://images.unsplash.com/photo-1525268323446-0505b6fe7778?w=600&h=400&fit=crop" },
      { name: "Lee Harvey's", slug: "lee-harveys-dallas", neighborhood: "Cedars", category: "bar", weightedScore: "3.950", rawAvgScore: "3.85", rankPosition: 5, rankDelta: 0, totalRatings: 189, description: "Iconic outdoor patio bar in the Cedars.", priceRange: "$", phone: "(214) 555-2123", address: "1807 Gould St, Cedars, Dallas", lat: "32.7723456", lng: "-96.7923456", isOpenNow: true, website: "https://leeharveys.com", photoUrl: "https://images.unsplash.com/photo-1538488881038-e252a119ace7?w=600&h=400&fit=crop" },
      { name: "Village Baking Co.", slug: "village-baking-co-dallas", neighborhood: "Greenville", category: "bakery", weightedScore: "4.730", rawAvgScore: "4.60", rankPosition: 1, rankDelta: 0, totalRatings: 267, description: "Artisan sourdough and French pastries.", priceRange: "$$", phone: "(214) 555-2234", address: "2009 Greenville Ave, Greenville, Dallas", lat: "32.8012345", lng: "-96.7712345", isOpenNow: true, website: "https://villagebakingco.com", photoUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop" },
      { name: "La Casita Bakeshop", slug: "la-casita-bakeshop-dallas", neighborhood: "Oak Cliff", category: "bakery", weightedScore: "4.550", rawAvgScore: "4.40", rankPosition: 2, rankDelta: 0, totalRatings: 198, description: "Mexican-inspired pastries and traditional conchas.", priceRange: "$", phone: "(214) 555-2345", address: "1522 W Davis St, Oak Cliff, Dallas", lat: "32.7489012", lng: "-96.8334567", isOpenNow: true, website: "https://lacasitabakeshop.com", photoUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=400&fit=crop" },
      { name: "Bisous Bisous", slug: "bisous-bisous-patisserie-dallas", neighborhood: "Knox-Henderson", category: "bakery", weightedScore: "4.380", rawAvgScore: "4.25", rankPosition: 3, rankDelta: 1, totalRatings: 156, description: "French macaron specialists with seasonal flavors.", priceRange: "$$", phone: "(214) 555-2456", address: "3809 McKinney Ave, Knox-Henderson, Dallas", lat: "32.8112345", lng: "-96.7934567", isOpenNow: false, website: "https://bisousbisous.com", photoUrl: "https://images.unsplash.com/photo-1612203985729-70726954388c?w=600&h=400&fit=crop" },
      { name: "Empire Baking Co.", slug: "empire-baking-co-dallas", neighborhood: "East Dallas", category: "bakery", weightedScore: "4.200", rawAvgScore: "4.10", rankPosition: 4, rankDelta: -1, totalRatings: 132, description: "Dallas staple for bread and celebration cakes.", priceRange: "$$", phone: "(214) 555-2567", address: "5450 W Lovers Lane, East Dallas, Dallas", lat: "32.8534567", lng: "-96.7812345", isOpenNow: true, website: "https://empirebaking.com", photoUrl: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=600&h=400&fit=crop" },
      { name: "Haute Sweets", slug: "haute-sweets-patisserie-dallas", neighborhood: "Bishop Arts", category: "bakery", weightedScore: "4.050", rawAvgScore: "3.95", rankPosition: 5, rankDelta: 0, totalRatings: 89, description: "Avant-garde desserts and sculptural pastries.", priceRange: "$$$", phone: "(214) 555-2678", address: "414 W Davis St, Bishop Arts, Dallas", lat: "32.7494123", lng: "-96.8278901", isOpenNow: false, website: "https://hautesweetspatisserie.com", photoUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&h=400&fit=crop" },
      { name: "Raising Cane's", slug: "raising-canes-dallas", neighborhood: "Greenville", category: "fast_food", weightedScore: "4.420", rawAvgScore: "4.30", rankPosition: 1, rankDelta: 0, totalRatings: 523, description: "One love \u2014 chicken fingers, crinkle fries, Texas toast, and that sauce.", priceRange: "$", phone: "(214) 555-2789", address: "5809 Greenville Ave, Greenville, Dallas", lat: "32.8612345", lng: "-96.7712345", isOpenNow: true, website: "https://raisingcanes.com", photoUrl: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600&h=400&fit=crop" },
      { name: "Whataburger", slug: "whataburger-dallas", neighborhood: "Multiple", category: "fast_food", weightedScore: "4.280", rawAvgScore: "4.15", rankPosition: 2, rankDelta: 0, totalRatings: 678, description: "Texas institution. The honey butter chicken biscuit is legendary.", priceRange: "$", phone: "(214) 555-2890", address: "Multiple locations, Dallas", lat: "32.7767000", lng: "-96.7970000", isOpenNow: true, website: "https://whataburger.com", photoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop" },
      { name: "In-N-Out Burger", slug: "in-n-out-burger-dallas", neighborhood: "Uptown", category: "fast_food", weightedScore: "4.150", rawAvgScore: "4.00", rankPosition: 3, rankDelta: 1, totalRatings: 445, description: "California import that Dallas can't get enough of.", priceRange: "$", phone: "(214) 555-2901", address: "3500 McKinney Ave, Uptown, Dallas", lat: "32.8112345", lng: "-96.8012345", isOpenNow: true, website: "https://in-n-out.com", photoUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&h=400&fit=crop" },
      { name: "Wingstop", slug: "wingstop-dallas-hq", neighborhood: "Addison", category: "fast_food", weightedScore: "3.980", rawAvgScore: "3.85", rankPosition: 4, rankDelta: -1, totalRatings: 312, description: "Dallas-born wing chain \u2014 the original HQ location.", priceRange: "$", phone: "(214) 555-3012", address: "5501 LBJ Freeway, Addison, Dallas", lat: "32.9512345", lng: "-96.8312345", isOpenNow: false, website: "https://wingstop.com", photoUrl: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&h=400&fit=crop" },
      { name: "Taco Bell Cantina", slug: "taco-bell-cantina-dallas", neighborhood: "Deep Ellum", category: "fast_food", weightedScore: "3.820", rawAvgScore: "3.70", rankPosition: 5, rankDelta: 0, totalRatings: 201, description: "The elevated Taco Bell experience with booze.", priceRange: "$", phone: "(214) 555-3123", address: "2649 Main St, Deep Ellum, Dallas", lat: "32.7843210", lng: "-96.7854321", isOpenNow: true, website: "https://tacobell.com/cantina", photoUrl: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=600&h=400&fit=crop" }
    ];
    SEED_DISHES = [
      { businessSlug: "spice-garden-dallas", dishes: [
        { name: "Dum Pukht Lamb Biryani", voteCount: 87 },
        { name: "Butter Chicken", voteCount: 54 },
        { name: "Garlic Naan", voteCount: 32 }
      ] },
      { businessSlug: "the-yard-kitchen-dallas", dishes: [
        { name: "Heritage Pork Chop", voteCount: 65 },
        { name: "Smoked Brisket Mac", voteCount: 42 }
      ] },
      { businessSlug: "lucky-cat-ramen-dallas", dishes: [
        { name: "Tonkotsu Ramen", voteCount: 78 },
        { name: "Spicy Miso Ramen", voteCount: 45 },
        { name: "Gyoza", voteCount: 29 }
      ] },
      { businessSlug: "taco-stop-dallas", dishes: [
        { name: "Al Pastor Taco", voteCount: 134 },
        { name: "Barbacoa Taco", voteCount: 89 },
        { name: "Carnitas Taco", voteCount: 67 }
      ] },
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
      ] }
    ];
  }
});

// server/index.ts
import express from "express";

// server/routes.ts
import { createServer } from "node:http";
import passport2 from "passport";

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
  // Replit (optional — for CORS)
  replitDevDomain: process.env.REPLIT_DEV_DOMAIN || null,
  replitDomains: process.env.REPLIT_DOMAINS || null
};

// server/auth.ts
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
      done(null, {
        id: member.id,
        displayName: member.displayName,
        username: member.username,
        email: member.email,
        city: member.city,
        credibilityScore: member.credibilityScore,
        credibilityTier: member.credibilityTier
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
async function authenticateGoogleUser(idToken) {
  const googleClientId = config.googleClientId;
  if (!googleClientId) {
    throw new Error("Google Sign-In is not configured");
  }
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
  if (!res.ok) {
    throw new Error("Invalid Google token");
  }
  const payload = await res.json();
  if (payload.aud !== googleClientId) {
    throw new Error("Token audience mismatch");
  }
  const googleId = payload.sub;
  const email = payload.email.toLowerCase();
  const displayName = payload.name || email.split("@")[0];
  const avatarUrl = payload.picture || null;
  let member = await getMemberByAuthId(googleId);
  if (member) {
    return member;
  }
  member = await getMemberByEmail(email);
  if (member) {
    const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { members: members2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq12 } = await import("drizzle-orm");
    await db2.update(members2).set({ authId: googleId, avatarUrl: avatarUrl || member.avatarUrl }).where(eq12(members2.id, member.id));
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
import * as crypto from "crypto";
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
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(body);
  const expected = `sha256=${hmac.digest("hex")}`;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
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
function handleWebhook(req, res) {
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
function handleDeployStatus(_req, res) {
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
  "helpful-voice": { name: "Helpful Voice", description: "5 of your ratings marked as helpful", rarity: "rare", color: "#66BB6A", icon: "thumbs-up" },
  "influencer": { name: "Influencer", description: "25 of your ratings marked as helpful", rarity: "epic", color: "#43A047", icon: "hand-left" },
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
function handleBadgeShare(req, res) {
  const badgeId = req.params.badgeId;
  const username = req.query.user || null;
  const html = generateBadgeHtml(badgeId, username);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.send(html);
}

// server/routes.ts
init_email();

// shared/admin.ts
var ADMIN_EMAILS = Object.freeze([
  "rahul@topranker.com",
  "admin@topranker.com"
]);
function isAdminEmail(email) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
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
    }
    if (!res.headersSent) {
      res.setHeader("Server-Timing", `total;dur=${duration.toFixed(1)}`);
    }
  });
  next();
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

// server/analytics.ts
init_logger();
var analyticsLog = log.tag("Analytics");
var buffer = [];
var MAX_BUFFER = 1e3;
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
var CATEGORY_CONFIDENCE_THRESHOLDS = {
  fast_food: { provisional: 3, early: 8, established: 20 },
  casual_dining: { provisional: 3, early: 8, established: 20 },
  buffet: { provisional: 3, early: 8, established: 20 },
  restaurant: { provisional: 3, early: 10, established: 25 },
  cafe: { provisional: 3, early: 10, established: 25 },
  brunch: { provisional: 3, early: 10, established: 25 },
  bar: { provisional: 3, early: 10, established: 25 },
  fine_dining: { provisional: 5, early: 15, established: 35 },
  brewery: { provisional: 5, early: 12, established: 30 },
  dessert_bar: { provisional: 3, early: 12, established: 30 },
  food_hall: { provisional: 5, early: 12, established: 30 }
};
var DEFAULT_THRESHOLDS = { provisional: 3, early: 10, established: 25 };

// server/routes-admin.ts
function requireAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}
function requireAdmin(req, res, next) {
  if (!isAdminEmail(req.user?.email)) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}
function registerAdminRoutes(app2) {
  app2.patch("/api/admin/category-suggestions/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
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
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/admin/seed-cities", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { seedCities: seedCities2 } = await Promise.resolve().then(() => (init_seed_cities(), seed_cities_exports));
      await seedCities2();
      return res.json({ data: { message: "Cities seeded successfully" } });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/admin/fetch-photos", requireAuth, requireAdmin, async (req, res) => {
    try {
      const city = req.body.city;
      const limit = Math.min(50, parseInt(req.body.limit) || 20);
      const businesses2 = await getBusinessesWithoutPhotos(city, limit);
      if (businesses2.length === 0) {
        return res.json({ data: { message: "All businesses already have photos", fetched: 0 } });
      }
      let totalFetched = 0;
      const results = [];
      for (const biz of businesses2) {
        const count7 = await fetchAndStorePhotos(biz.id, biz.googlePlaceId);
        totalFetched += count7;
        results.push({ name: biz.name, photos: count7 });
      }
      return res.json({
        data: {
          message: `Fetched photos for ${businesses2.length} businesses`,
          fetched: totalFetched,
          results
        }
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/admin/claims", requireAuth, requireAdmin, async (req, res) => {
    try {
      const data = await getPendingClaims();
      return res.json({ data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.patch("/api/admin/claims/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Status must be 'approved' or 'rejected'" });
      }
      const updated = await reviewClaim(req.params.id, status, req.user.id);
      if (!updated) return res.status(404).json({ error: "Claim not found" });
      return res.json({ data: updated });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/admin/claims/count", requireAuth, requireAdmin, async (req, res) => {
    try {
      const count7 = await getClaimCount();
      return res.json({ data: { count: count7 } });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/admin/flags", requireAuth, requireAdmin, async (req, res) => {
    try {
      const data = await getPendingFlags();
      return res.json({ data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.patch("/api/admin/flags/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      if (!["confirmed", "dismissed"].includes(status)) {
        return res.status(400).json({ error: "Status must be 'confirmed' or 'dismissed'" });
      }
      const updated = await reviewFlag(req.params.id, status, req.user.id);
      if (!updated) return res.status(404).json({ error: "Flag not found" });
      return res.json({ data: updated });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/admin/flags/count", requireAuth, requireAdmin, async (req, res) => {
    try {
      const count7 = await getFlagCount();
      return res.json({ data: { count: count7 } });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/admin/members", requireAuth, requireAdmin, async (req, res) => {
    try {
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
      const data = await getAdminMemberList(limit);
      return res.json({ data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/admin/members/count", requireAuth, requireAdmin, async (req, res) => {
    try {
      const count7 = await getMemberCount();
      return res.json({ data: { count: count7 } });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/admin/webhooks", requireAuth, requireAdmin, async (req, res) => {
    try {
      const source = req.query.source || "stripe";
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
      const events = await getRecentWebhookEvents(source, limit);
      return res.json({ data: events });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/admin/webhooks/:id/replay", requireAuth, requireAdmin, async (req, res) => {
    try {
      const event = await getWebhookEventById(req.params.id);
      if (!event) return res.status(404).json({ error: "Webhook event not found" });
      const { processStripeEvent: processStripeEvent2 } = await Promise.resolve().then(() => (init_stripe_webhook(), stripe_webhook_exports));
      if (event.source === "stripe" && event.payload) {
        await processStripeEvent2(event.payload);
        await markWebhookProcessed(event.id);
        return res.json({ data: { id: event.id, replayed: true } });
      }
      return res.status(400).json({ error: `Unsupported webhook source: ${event.source}` });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/admin/perf", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const data = getPerfStats();
      return res.json({ data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/admin/revenue", requireAuth, requireAdmin, async (req, res) => {
    try {
      const { getRevenueMetrics: getRevenueMetrics2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      const metrics = await getRevenueMetrics2();
      return res.json({ data: metrics });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/admin/analytics", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const data = {
        funnel: getFunnelStats(),
        recentEvents: getRecentEvents(20)
      };
      return res.json({ data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/admin/analytics/dashboard", requireAuth, requireAdmin, async (_req, res) => {
    try {
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
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/admin/metrics", requireAuth, requireAdmin, async (_req, res) => {
    try {
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
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/admin/health/detailed", requireAuth, requireAdmin, async (_req, res) => {
    try {
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
          generatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/admin/confidence-thresholds", requireAuth, requireAdmin, async (_req, res) => {
    try {
      return res.json({
        data: {
          thresholds: CATEGORY_CONFIDENCE_THRESHOLDS,
          defaults: DEFAULT_THRESHOLDS
        }
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/admin/revenue/monthly", requireAuth, requireAdmin, async (req, res) => {
    try {
      const months = Math.min(24, Math.max(1, parseInt(req.query.months) || 6));
      const { getRevenueByMonth: getRevenueByMonth2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      const data = await getRevenueByMonth2(months);
      return res.json({ data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
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

// server/routes-payments.ts
function requireAuth2(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}
function registerPaymentRoutes(app2) {
  app2.post("/api/payments/challenger", requireAuth2, async (req, res) => {
    try {
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
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/payments/dashboard-pro", requireAuth2, async (req, res) => {
    try {
      const slug = sanitizeSlug(req.body.slug);
      if (!slug) {
        return res.status(400).json({ error: "slug is required" });
      }
      const business = await getBusinessBySlug(slug);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }
      const { createDashboardProPayment: createDashboardProPayment2 } = await Promise.resolve().then(() => (init_payments2(), payments_exports));
      const payment = await createDashboardProPayment2({
        businessId: business.id,
        businessName: business.name,
        customerEmail: req.user.email || "",
        userId: req.user.id
      });
      await createPaymentRecord({
        memberId: req.user.id,
        businessId: business.id,
        type: "dashboard_pro",
        amount: payment.amount,
        stripePaymentIntentId: payment.id,
        status: payment.status,
        metadata: payment.metadata
      });
      sendPaymentReceiptEmail({
        email: req.user.email || "",
        displayName: req.user.displayName || "Member",
        type: "dashboard_pro",
        amount: payment.amount,
        businessName: business.name,
        paymentId: payment.id
      }).catch(() => {
      });
      return res.json({ data: payment });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/payments/featured", requireAuth2, async (req, res) => {
    try {
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
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/payments/cancel", requireAuth2, async (req, res) => {
    try {
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
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
}

// server/routes-badges.ts
init_storage();
init_logger();
function requireAuth3(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}
function registerBadgeRoutes(app2) {
  app2.get("/api/members/:id/badges", async (req, res) => {
    try {
      const memberId = req.params.id;
      const badges = await getMemberBadges(memberId);
      return res.json({ data: badges });
    } catch (err) {
      log.error(`Failed to fetch member badges: ${err.message}`);
      return res.status(500).json({ error: "Failed to fetch badges" });
    }
  });
  app2.post("/api/badges/award", requireAuth3, async (req, res) => {
    try {
      const memberId = req.user.id;
      const { badgeId, badgeFamily } = req.body;
      if (!badgeId || !badgeFamily) {
        return res.status(400).json({ error: "badgeId and badgeFamily are required" });
      }
      const result = await awardBadge(memberId, badgeId, badgeFamily);
      return res.json({ data: result, awarded: result !== null });
    } catch (err) {
      log.error(`Failed to award badge: ${err.message}`);
      return res.status(500).json({ error: "Failed to award badge" });
    }
  });
  app2.get("/api/badges/earned", requireAuth3, async (req, res) => {
    try {
      const memberId = req.user.id;
      const badgeIds = await getEarnedBadgeIds(memberId);
      const badgeCount = badgeIds.length;
      return res.json({ data: { badgeIds, badgeCount } });
    } catch (err) {
      log.error(`Failed to fetch earned badges: ${err.message}`);
      return res.status(500).json({ error: "Failed to fetch earned badges" });
    }
  });
  app2.get("/api/badges/leaderboard", async (req, res) => {
    try {
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
      const data = await getBadgeLeaderboard(limit);
      return res.json({ data });
    } catch (err) {
      log.error(`Failed to fetch badge leaderboard: ${err.message}`);
      return res.status(500).json({ error: "Failed to fetch badge leaderboard" });
    }
  });
}

// server/routes.ts
init_stripe_webhook();
init_logger();
init_storage();
init_schema();

// server/rate-limiter.ts
init_logger();
var rlLog = log.tag("RateLimiter");
var MemoryStore = class {
  windows = /* @__PURE__ */ new Map();
  cleanupTimer;
  constructor() {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.windows) {
        if (now > entry.resetAt) this.windows.delete(key);
      }
    }, 6e4);
  }
  async increment(key, windowMs) {
    const now = Date.now();
    let entry = this.windows.get(key);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      this.windows.set(key, entry);
    }
    entry.count++;
    return { count: entry.count, resetAt: entry.resetAt };
  }
  cleanup() {
    clearInterval(this.cleanupTimer);
  }
};
var defaultStore = new MemoryStore();
var DEFAULT_OPTIONS = {
  windowMs: 6e4,
  // 1 minute
  maxRequests: 100
  // 100 requests per minute
};
function rateLimiter(options = {}) {
  const { windowMs, maxRequests } = { ...DEFAULT_OPTIONS, ...options };
  const store = options.store || defaultStore;
  return (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    store.increment(ip, windowMs).then(({ count: count7, resetAt }) => {
      res.setHeader("X-RateLimit-Limit", String(maxRequests));
      res.setHeader("X-RateLimit-Remaining", String(Math.max(0, maxRequests - count7)));
      res.setHeader("X-RateLimit-Reset", String(Math.ceil(resetAt / 1e3)));
      if (count7 > maxRequests) {
        rlLog.warn(`Rate limit exceeded for ${ip}: ${count7}/${maxRequests}`);
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
var authRateLimiter = rateLimiter({ windowMs: 6e4, maxRequests: 10 });
var apiRateLimiter = rateLimiter({ windowMs: 6e4, maxRequests: 100 });

// server/gdpr.ts
var deletionRequests = /* @__PURE__ */ new Map();
function scheduleDeletion(userId, gracePeriodDays) {
  const now = /* @__PURE__ */ new Date();
  const deleteAt = new Date(now.getTime() + gracePeriodDays * 24 * 60 * 60 * 1e3);
  const request = {
    userId,
    scheduledAt: now,
    deleteAt,
    status: "pending"
  };
  deletionRequests.set(userId, request);
  return request;
}
function cancelDeletion(userId) {
  const request = deletionRequests.get(userId);
  if (!request || request.status !== "pending") {
    return false;
  }
  request.status = "cancelled";
  deletionRequests.set(userId, request);
  return true;
}
function getDeletionStatus(userId) {
  return deletionRequests.get(userId) || null;
}

// server/routes.ts
function requireAuth4(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}
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
      const count7 = sseConnectionsByIp.get(clientIp) || 1;
      if (count7 <= 1) {
        sseConnectionsByIp.delete(clientIp);
      } else {
        sseConnectionsByIp.set(clientIp, count7 - 1);
      }
    };
    req.on("close", cleanup);
  });
  app2.post("/api/auth/signup", authRateLimiter, async (req, res) => {
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
  });
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
  app2.post("/api/auth/google", authRateLimiter, async (req, res) => {
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
  });
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
  app2.get("/api/account/export", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      const userId = req.user.id;
      const [profile, ratings3, impact, seasonal, badges] = await Promise.all([
        getMemberById(userId),
        getMemberRatings(userId, 1, 1e4),
        getMemberImpact(userId),
        getSeasonalRatingCounts(userId),
        getMemberBadges(userId)
      ]);
      const exportData = {
        exportDate: (/* @__PURE__ */ new Date()).toISOString(),
        format: "GDPR Art. 20 compliant",
        profile: profile ? {
          displayName: profile.displayName,
          username: profile.username,
          email: profile.email,
          city: profile.city,
          credibilityScore: profile.credibilityScore,
          credibilityTier: profile.credibilityTier,
          totalRatings: profile.totalRatings,
          joinedAt: profile.joinedAt,
          lastActive: profile.lastActive
        } : null,
        ratings: ratings3 || [],
        impact: impact || null,
        seasonalActivity: seasonal || [],
        badges: badges || []
      };
      res.setHeader("Content-Disposition", `attachment; filename="topranker-data-export-${userId}.json"`);
      return res.json({ data: exportData });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.delete("/api/account", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
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
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/account/schedule-deletion", requireAuth4, async (req, res) => {
    try {
      const userId = req.user.id;
      const request = scheduleDeletion(userId, 30);
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
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/account/cancel-deletion", requireAuth4, async (req, res) => {
    try {
      const userId = req.user.id;
      const cancelled = cancelDeletion(userId);
      if (!cancelled) {
        return res.status(404).json({ error: "No pending deletion request found" });
      }
      log.tag("GDPR").info(`Deletion cancelled for user ${userId}`);
      return res.json({
        data: { cancelled: true }
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/account/deletion-status", requireAuth4, async (req, res) => {
    try {
      const userId = req.user.id;
      const status = getDeletionStatus(userId);
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
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/leaderboard", async (req, res) => {
    try {
      const city = req.query.city || "Dallas";
      const category = req.query.category || "restaurant";
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
      const bizList = await getLeaderboard(city, category, limit);
      const photoMap = await getBusinessPhotosMap(bizList.map((b) => b.id));
      const data = bizList.map((b) => ({
        ...b,
        photoUrls: photoMap[b.id] || (b.photoUrl ? [b.photoUrl] : [])
      }));
      return res.json({ data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/featured", async (req, res) => {
    try {
      const city = req.query.city || "Dallas";
      const placements = await getActiveFeaturedInCity(city);
      if (placements.length === 0) {
        return res.json({ data: [] });
      }
      const featured = await Promise.all(
        placements.map(async (p) => {
          const biz = await getBusinessById(p.businessId);
          if (!biz) return null;
          const photoMap = await getBusinessPhotosMap([biz.id]);
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
        })
      );
      return res.json({ data: featured.filter(Boolean) });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/leaderboard/categories", async (req, res) => {
    try {
      const city = req.query.city || "Dallas";
      const data = await getAllCategories(city);
      return res.json({ data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/businesses/search", async (req, res) => {
    try {
      const query = sanitizeString(req.query.q, 200);
      const city = req.query.city || "Dallas";
      const category = req.query.category;
      const bizList = await searchBusinesses(query, city, category);
      const photoMap = await getBusinessPhotosMap(bizList.map((b) => b.id));
      const data = bizList.map((b) => ({
        ...b,
        photoUrls: photoMap[b.id] || (b.photoUrl ? [b.photoUrl] : [])
      }));
      return res.json({ data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/businesses/:slug", async (req, res) => {
    try {
      const business = await getBusinessBySlug(req.params.slug);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }
      let [{ ratings: ratings3 }, dishList, photos] = await Promise.all([
        getBusinessRatings(business.id, 1, 20),
        getBusinessDishes(business.id, 5),
        getBusinessPhotos(business.id)
      ]);
      if (photos.length === 0 && business.googlePlaceId) {
        try {
          const count7 = await fetchAndStorePhotos(business.id, business.googlePlaceId);
          if (count7 > 0) {
            photos = await getBusinessPhotos(business.id);
          }
        } catch {
        }
      }
      const photoUrls = photos.length > 0 ? photos : business.photoUrl ? [business.photoUrl] : [];
      return res.json({ data: { ...business, photoUrls, recentRatings: ratings3, dishes: dishList } });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/businesses/:id/ratings", async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const perPage = Math.min(50, Math.max(1, parseInt(req.query.per_page) || 20));
      const data = await getBusinessRatings(req.params.id, page, perPage);
      return res.json({ data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/businesses/:slug/claim", requireAuth4, async (req, res) => {
    try {
      const business = await getBusinessBySlug(req.params.slug);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }
      const role = sanitizeString(req.body.role, 100);
      const phone = sanitizeString(req.body.phone, 20);
      if (!role || role.length === 0) {
        return res.status(400).json({ error: "Role is required" });
      }
      const { getClaimByMemberAndBusiness: getClaimByMemberAndBusiness2, submitClaim: submitClaim2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      const existing = await getClaimByMemberAndBusiness2(req.user.id, business.id);
      if (existing) {
        return res.status(409).json({ error: "You already have a pending or approved claim for this business" });
      }
      const verificationMethod = `role:${role}${phone ? ` phone:${phone}` : ""}`;
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
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/businesses/:slug/dashboard", requireAuth4, async (req, res) => {
    try {
      const business = await getBusinessBySlug(req.params.slug);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }
      const { getRankHistory: getRankHistory2, getBusinessDishes: getBusinessDishes2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      const [{ ratings: ratings3, total }, rankHistory2, dishes2] = await Promise.all([
        getBusinessRatings(business.id, 1, 10),
        getRankHistory2(business.id, 49),
        // 7 weeks
        getBusinessDishes2(business.id, 5)
      ]);
      const totalRatings = business.totalRatings || 0;
      const avgScore = business.rawAvgScore ? parseFloat(business.rawAvgScore) : 0;
      const rankPosition = business.rankPosition || 0;
      const rankDelta = business.rankDelta || 0;
      const returners = ratings3.filter((r) => r.wouldReturn === true).length;
      const returnTotal = ratings3.filter((r) => r.wouldReturn !== null && r.wouldReturn !== void 0).length;
      const wouldReturnPct = returnTotal > 0 ? Math.round(returners / returnTotal * 100) : 0;
      const topDish = dishes2.length > 0 ? dishes2[0] : null;
      const ratingTrend = rankHistory2.map((h) => h.score);
      return res.json({
        data: {
          totalRatings,
          avgScore,
          rankPosition,
          rankDelta,
          wouldReturnPct,
          topDish: topDish ? { name: topDish.name, votes: topDish.voteCount || 0 } : null,
          ratingTrend,
          recentRatings: ratings3.map((r) => ({
            id: r.id,
            user: r.memberName || "Anonymous",
            score: parseFloat(r.rawScore),
            tier: r.memberTier || "community",
            note: r.note,
            date: r.createdAt
          }))
        }
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  registerPaymentRoutes(app2);
  app2.get("/api/dishes/search", async (req, res) => {
    try {
      const businessId = req.query.business_id;
      const query = sanitizeString(req.query.q, 200);
      if (!businessId) return res.status(400).json({ error: "business_id required" });
      const data = await searchDishes(businessId, query);
      return res.json({ data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/ratings", requireAuth4, async (req, res) => {
    try {
      const parsed = insertRatingSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }
      parsed.data.score = sanitizeNumber(parsed.data.score, 1, 5, 3);
      const memberId = req.user.id;
      const result = await submitRating(memberId, parsed.data);
      broadcast("rating_submitted", { businessId: parsed.data.businessId, memberId });
      broadcast("ranking_updated", { city: "Dallas", category: parsed.data.category });
      trackEvent("first_rating", memberId);
      return res.status(201).json({ data: result });
    } catch (err) {
      if (err.message.includes("3+ days")) {
        return res.status(403).json({ error: err.message });
      }
      if (err.message.includes("Already rated")) {
        return res.status(409).json({ error: err.message });
      }
      if (err.message.includes("suspended")) {
        return res.status(403).json({ error: err.message });
      }
      return res.status(400).json({ error: err.message });
    }
  });
  app2.get("/api/members/me", requireAuth4, async (req, res) => {
    try {
      const member = await getMemberById(req.user.id);
      if (!member) return res.status(404).json({ error: "Member not found" });
      const { score, tier, breakdown } = await recalculateCredibilityScore(member.id);
      const { ratings: ratings3, total } = await getMemberRatings(member.id);
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
          ratingHistory: ratings3,
          ...seasonal
        }
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/members/:username", async (req, res) => {
    try {
      const { getMemberByUsername: getMemberByUsername2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      const member = await getMemberByUsername2(req.params.username);
      if (!member) return res.status(404).json({ error: "Member not found" });
      return res.json({
        data: {
          displayName: member.displayName,
          username: member.username,
          credibilityTier: member.credibilityTier,
          totalRatings: member.totalRatings,
          joinedAt: member.joinedAt
        }
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/challengers/active", async (req, res) => {
    try {
      const city = req.query.city || "Dallas";
      const category = req.query.category;
      const data = await getActiveChallenges(city, category);
      return res.json({ data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/trending", async (req, res) => {
    try {
      const { getTrendingBusinesses: getTrendingBusinesses2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      const city = req.query.city || "Dallas";
      const limit = Math.min(10, Math.max(1, parseInt(req.query.limit) || 3));
      const bizList = await getTrendingBusinesses2(city, limit);
      const photoMap = await getBusinessPhotosMap(bizList.map((b) => b.id));
      const data = bizList.map((b) => ({
        ...b,
        photoUrls: photoMap[b.id] || (b.photoUrl ? [b.photoUrl] : [])
      }));
      return res.json({ data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/businesses/:id/rank-history", async (req, res) => {
    try {
      const { getRankHistory: getRankHistory2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      const days = Math.min(90, Math.max(7, parseInt(req.query.days) || 30));
      const data = await getRankHistory2(req.params.id, days);
      return res.json({ data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/members/me/impact", requireAuth4, async (req, res) => {
    try {
      const { getMemberImpact: getMemberImpact2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      const data = await getMemberImpact2(req.user.id);
      return res.json({ data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/members/me/push-token", requireAuth4, async (req, res) => {
    try {
      const { pushToken } = req.body;
      if (!pushToken || typeof pushToken !== "string") {
        return res.status(400).json({ error: "pushToken is required" });
      }
      const { updatePushToken: updatePushToken2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      await updatePushToken2(req.user.id, pushToken);
      return res.json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/members/me/notification-preferences", requireAuth4, async (req, res) => {
    try {
      const prefs = {
        ratingUpdates: true,
        challengeResults: true,
        weeklyDigest: false,
        ...req.user.notificationPrefs || {}
      };
      return res.json({ data: prefs });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.put("/api/members/me/notification-preferences", requireAuth4, async (req, res) => {
    try {
      const { ratingUpdates, challengeResults, weeklyDigest } = req.body;
      const prefs = {
        ratingUpdates: ratingUpdates !== false,
        challengeResults: challengeResults !== false,
        weeklyDigest: weeklyDigest === true
      };
      req.user.notificationPrefs = prefs;
      log.tag("Notifications").info(`Preferences updated for user ${req.user.id}: ${JSON.stringify(prefs)}`);
      return res.json({ data: prefs });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/category-suggestions", requireAuth4, async (req, res) => {
    try {
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
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  });
  app2.get("/api/category-suggestions", async (req, res) => {
    try {
      const { getPendingSuggestions: getPendingSuggestions2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      const data = await getPendingSuggestions2();
      return res.json({ data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.get("/api/photos/proxy", handlePhotoProxy);
  app2.post("/api/webhook/stripe", handleStripeWebhook);
  app2.get("/api/payments/history", requireAuth4, async (req, res) => {
    try {
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
      const payments2 = await getMemberPayments(req.user.id, limit);
      return res.json({ data: payments2 });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/webhook/deploy", handleWebhook);
  app2.get("/api/deploy/status", handleDeployStatus);
  app2.get("/share/badge/:badgeId", handleBadgeShare);
  registerBadgeRoutes(app2);
  registerAdminRoutes(app2);
  const httpServer = createServer(app2);
  return httpServer;
}

// server/index.ts
init_logger();
import * as fs from "fs";
import * as path from "path";
import { createProxyMiddleware } from "http-proxy-middleware";

// server/security-headers.ts
function buildAllowedOrigins() {
  const origins = /* @__PURE__ */ new Set();
  origins.add("https://topranker.com");
  origins.add("https://www.topranker.com");
  const envOrigins = process.env.CORS_ORIGINS;
  if (envOrigins) {
    envOrigins.split(",").forEach((o) => {
      const trimmed = o.trim();
      if (trimmed) origins.add(trimmed);
    });
  }
  const replitDevDomain = process.env.REPLIT_DEV_DOMAIN;
  if (replitDevDomain) {
    origins.add(`https://${replitDevDomain}`);
  }
  const replitDomains = process.env.REPLIT_DOMAINS;
  if (replitDomains) {
    replitDomains.split(",").forEach((d) => {
      const trimmed = d.trim();
      if (trimmed) origins.add(`https://${trimmed}`);
    });
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
var app = express();
var log2 = console.log;
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
    const path2 = req.path;
    let capturedJsonResponse = void 0;
    const originalResJson = res.json;
    res.json = function(bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
      if (!path2.startsWith("/api")) return;
      const duration = Date.now() - start;
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
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
    const appJsonPath = path.resolve(process.cwd(), "app.json");
    const appJsonContent = fs.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}
function serveExpoManifest(platform, res) {
  const manifestPath = path.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json"
  );
  if (!fs.existsSync(manifestPath)) {
    return res.status(404).json({ error: `Manifest not found for platform: ${platform}` });
  }
  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");
  const manifest = fs.readFileSync(manifestPath, "utf-8");
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
  const templatePath = path.resolve(
    process.cwd(),
    "server",
    "templates",
    "landing-page.html"
  );
  const landingPageTemplate = fs.readFileSync(templatePath, "utf-8");
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
  app2.use("/assets", express.static(path.resolve(process.cwd(), "assets")));
  app2.use(express.static(path.resolve(process.cwd(), "static-build")));
  const distPath = path.resolve(process.cwd(), "dist");
  const hasDistBuild = fs.existsSync(path.join(distPath, "index.html"));
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
        error: (_err, _req, res) => {
          if (res && "writeHead" in res && !res.headersSent) {
            res.status(503).send(`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${appName}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0a0e1a;color:#c8a951;font-family:-apple-system,system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center}.c{padding:20px}.spinner{width:40px;height:40px;border:3px solid #1a2040;border-top-color:#c8a951;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 20px}@keyframes spin{to{transform:rotate(360deg)}}h1{font-size:20px;margin-bottom:8px}p{font-size:14px;color:#8890a8}</style></head><body><div class="c"><div class="spinner"></div><h1>${appName}</h1><p>Loading app...</p></div><script>setTimeout(()=>location.reload(),3000)</script></body></html>`);
          }
        }
      }
    });
    app2.use((req, res, next) => {
      if (req.path.startsWith("/api")) {
        return next();
      }
      const platform = req.header("expo-platform");
      if (platform && (platform === "ios" || platform === "android")) {
        return next();
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
        return res.sendFile(path.join(distPath, "index.html"));
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
  app.use(perfMonitor);
  app.use((req, res, next) => {
    const start = process.hrtime();
    res.on("finish", () => {
      if (res.headersSent) return;
      const [seconds, nanoseconds] = process.hrtime(start);
      const durationMs = (seconds * 1e3 + nanoseconds / 1e6).toFixed(2);
      res.setHeader("X-Response-Time", `${durationMs}ms`);
    });
    next();
  });
  setupRequestLogging(app);
  const server = await registerRoutes(app);
  const routeCount = app._router?.stack?.filter((layer) => layer.route)?.length ?? 0;
  log2(`[TopRanker] ${routeCount} routes registered`);
  configureExpoAndLanding(app);
  const { seedDatabase: seedDatabase2 } = await Promise.resolve().then(() => (init_seed(), seed_exports));
  seedDatabase2().catch((err) => log.error("Seed error:", err));
  setupErrorHandler(app);
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true
    },
    () => {
      log2(`express server serving on port ${port}`);
    }
  );
  function gracefulShutdown(signal) {
    log.info(`${signal} received. Starting graceful shutdown...`);
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
