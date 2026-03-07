var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
  businessClaims: () => businessClaims,
  businessPhotos: () => businessPhotos,
  businesses: () => businesses,
  challengers: () => challengers,
  credibilityPenalties: () => credibilityPenalties,
  dishVotes: () => dishVotes,
  dishes: () => dishes,
  insertMemberSchema: () => insertMemberSchema,
  insertRatingSchema: () => insertRatingSchema,
  memberBadges: () => memberBadges,
  members: () => members,
  qrScans: () => qrScans,
  rankHistory: () => rankHistory,
  ratingFlags: () => ratingFlags,
  ratings: () => ratings
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
var members, businesses, ratings, dishes, dishVotes, challengers, rankHistory, businessClaims, businessPhotos, qrScans, ratingFlags, memberBadges, credibilityPenalties, insertMemberSchema, insertRatingSchema;
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
        index("idx_biz_slug").on(table.slug)
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

// server/storage.ts
var storage_exports = {};
__export(storage_exports, {
  createMember: () => createMember,
  getActiveChallenges: () => getActiveChallenges,
  getAllCategories: () => getAllCategories,
  getBusinessById: () => getBusinessById,
  getBusinessBySlug: () => getBusinessBySlug,
  getBusinessDishes: () => getBusinessDishes,
  getBusinessPhotos: () => getBusinessPhotos,
  getBusinessPhotosMap: () => getBusinessPhotosMap,
  getBusinessRatings: () => getBusinessRatings,
  getLeaderboard: () => getLeaderboard,
  getMemberByAuthId: () => getMemberByAuthId,
  getMemberByEmail: () => getMemberByEmail,
  getMemberById: () => getMemberById,
  getMemberByUsername: () => getMemberByUsername,
  getMemberRatings: () => getMemberRatings,
  recalculateBusinessScore: () => recalculateBusinessScore,
  recalculateCredibilityScore: () => recalculateCredibilityScore,
  recalculateRanks: () => recalculateRanks,
  searchBusinesses: () => searchBusinesses,
  searchDishes: () => searchDishes,
  submitRating: () => submitRating,
  updateChallengerVotes: () => updateChallengerVotes,
  updateMemberStats: () => updateMemberStats
});
import { eq, and, desc, asc, sql as sql2, count, ne, gte } from "drizzle-orm";
function getVoteWeight(credibilityScore) {
  if (credibilityScore >= 600) return 1;
  if (credibilityScore >= 300) return 0.7;
  if (credibilityScore >= 100) return 0.35;
  return 0.1;
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
async function createMember(data) {
  const [member] = await db.insert(members).values(data).returning();
  return member;
}
async function getLeaderboard(city, category, limit = 50) {
  return db.select().from(businesses).where(
    and(
      eq(businesses.city, city),
      eq(businesses.category, category),
      eq(businesses.isActive, true)
    )
  ).orderBy(asc(businesses.rankPosition)).limit(limit);
}
async function getBusinessBySlug(slug) {
  const [business] = await db.select().from(businesses).where(eq(businesses.slug, slug));
  return business;
}
async function getBusinessById(id) {
  const [business] = await db.select().from(businesses).where(eq(businesses.id, id));
  return business;
}
async function getBusinessRatings(businessId, page = 1, perPage = 20) {
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
    memberName: members.displayName,
    memberTier: members.credibilityTier,
    memberAvatarUrl: members.avatarUrl
  }).from(ratings).innerJoin(members, eq(ratings.memberId, members.id)).where(and(eq(ratings.businessId, businessId), eq(ratings.isFlagged, false))).orderBy(desc(ratings.createdAt)).limit(perPage).offset(offset);
  const [totalResult] = await db.select({ count: count() }).from(ratings).where(and(eq(ratings.businessId, businessId), eq(ratings.isFlagged, false)));
  return { ratings: ratingsResult, total: totalResult.count };
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
  }).from(ratings).innerJoin(businesses, eq(ratings.businessId, businesses.id)).where(eq(ratings.memberId, memberId)).orderBy(desc(ratings.createdAt)).limit(perPage).offset(offset);
  const [totalResult] = await db.select({ count: count() }).from(ratings).where(eq(ratings.memberId, memberId));
  return { ratings: ratingsResult, total: totalResult.count };
}
async function getActiveChallenges(city, category) {
  const challengerRows = await db.select().from(challengers).where(
    and(
      eq(challengers.status, "active"),
      eq(challengers.city, city),
      ...category ? [eq(challengers.category, category)] : []
    )
  );
  if (challengerRows.length === 0) return [];
  const bizIds = /* @__PURE__ */ new Set();
  for (const c of challengerRows) {
    bizIds.add(c.challengerId);
    bizIds.add(c.defenderId);
  }
  const bizIdArr = Array.from(bizIds);
  const bizRows = await db.select().from(businesses).where(sql2`${businesses.id} = ANY(ARRAY[${sql2.join(bizIdArr.map((id) => sql2`${id}`), sql2`,`)}]::text[])`);
  const bizMap = new Map(bizRows.map((b) => [b.id, b]));
  return challengerRows.map((c) => ({
    ...c,
    challengerBusiness: bizMap.get(c.challengerId),
    defenderBusiness: bizMap.get(c.defenderId)
  }));
}
async function getBusinessDishes(businessId, limit = 5) {
  return db.select().from(dishes).where(and(eq(dishes.businessId, businessId), eq(dishes.isActive, true))).orderBy(desc(dishes.voteCount)).limit(limit);
}
async function searchDishes(businessId, query) {
  const normalized = query.toLowerCase().trim();
  if (normalized.length < 2) {
    return getBusinessDishes(businessId, 5);
  }
  let results = await db.select().from(dishes).where(
    and(
      eq(dishes.businessId, businessId),
      eq(dishes.isActive, true),
      sql2`${dishes.nameNormalized} ILIKE ${normalized + "%"}`
    )
  ).orderBy(desc(dishes.voteCount)).limit(5);
  if (results.length < 3) {
    const containsResults = await db.select().from(dishes).where(
      and(
        eq(dishes.businessId, businessId),
        eq(dishes.isActive, true),
        sql2`${dishes.nameNormalized} ILIKE ${"%" + normalized + "%"}`
      )
    ).orderBy(desc(dishes.voteCount)).limit(5);
    const existingIds = new Set(results.map((r) => r.id));
    for (const r of containsResults) {
      if (!existingIds.has(r.id)) {
        results.push(r);
      }
    }
  }
  return results.slice(0, 5);
}
async function detectAnomalies(member, business, rawScore) {
  const flags = [];
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1e3);
  const [recentCount] = await db.select({ count: count() }).from(ratings).where(
    and(
      eq(ratings.memberId, member.id),
      gte(ratings.createdAt, oneHourAgo)
    )
  );
  if (recentCount.count > 5) flags.push("burst_velocity");
  if (member.totalRatings >= 10) {
    const memberRatings = await db.select({ rawScore: ratings.rawScore }).from(ratings).where(eq(ratings.memberId, member.id));
    const fiveStarCount = memberRatings.filter((r) => parseFloat(r.rawScore) >= 4.8).length;
    if (fiveStarCount / memberRatings.length > 0.9) flags.push("perfect_score_pattern");
  }
  if (rawScore <= 1.5 && member.totalRatings >= 5) {
    const memberRatings = await db.select({ rawScore: ratings.rawScore }).from(ratings).where(eq(ratings.memberId, member.id));
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
  const [newAcctRatings] = await db.select({ count: count() }).from(ratings).innerJoin(members, eq(ratings.memberId, members.id)).where(
    and(
      eq(ratings.businessId, business.id),
      gte(ratings.createdAt, oneDayAgo),
      gte(members.joinedAt, thirtyDaysAgo)
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
  if (daysActive < 7) throw new Error("Account must be 7+ days old to rate");
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const [existingToday] = await db.select({ count: count() }).from(ratings).where(
    and(
      eq(ratings.memberId, memberId),
      eq(ratings.businessId, data.businessId),
      gte(ratings.createdAt, today)
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
    await db.update(dishes).set({ voteCount: sql2`${dishes.voteCount} + 1` }).where(eq(dishes.id, data.dishId));
  } else if (data.newDishName) {
    const normalized = data.newDishName.toLowerCase().trim();
    const words = normalized.split(/\s+/);
    if (words.length >= 1 && words.length <= 5 && !normalized.includes("http")) {
      const existing = await db.select().from(dishes).where(
        and(
          eq(dishes.businessId, data.businessId),
          eq(dishes.nameNormalized, normalized)
        )
      );
      let dishId;
      if (existing.length > 0) {
        dishId = existing[0].id;
        await db.update(dishes).set({ voteCount: sql2`${dishes.voteCount} + 1` }).where(eq(dishes.id, dishId));
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
    await db.update(qrScans2).set({ converted: true }).where(eq(qrScans2.id, data.qrScanId));
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
async function recalculateBusinessScore(businessId) {
  const allRatings = await db.select({
    rawScore: ratings.rawScore,
    weight: ratings.weight,
    createdAt: ratings.createdAt,
    isFlagged: ratings.isFlagged,
    autoFlagged: ratings.autoFlagged
  }).from(ratings).where(
    and(
      eq(ratings.businessId, businessId),
      eq(ratings.isFlagged, false),
      eq(ratings.autoFlagged, false)
    )
  );
  if (allRatings.length === 0) {
    await db.update(businesses).set({ weightedScore: "0", rawAvgScore: "0", totalRatings: 0, updatedAt: /* @__PURE__ */ new Date() }).where(eq(businesses.id, businessId));
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
  }).where(eq(businesses.id, businessId));
  return score;
}
async function recalculateRanks(city, category) {
  const allBusinesses = await db.select({
    id: businesses.id,
    rankPosition: businesses.rankPosition
  }).from(businesses).where(
    and(
      eq(businesses.city, city),
      eq(businesses.category, category),
      eq(businesses.isActive, true)
    )
  ).orderBy(desc(businesses.weightedScore));
  for (let i = 0; i < allBusinesses.length; i++) {
    const oldRank = allBusinesses[i].rankPosition;
    const newRank = i + 1;
    const delta = oldRank ? oldRank - newRank : 0;
    await db.update(businesses).set({
      rankPosition: newRank,
      rankDelta: delta,
      prevRankPosition: oldRank
    }).where(eq(businesses.id, allBusinesses[i].id));
  }
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
async function updateChallengerVotes(businessId, weightedScore) {
  const asChallenger = await db.select().from(challengers).where(
    and(eq(challengers.challengerId, businessId), eq(challengers.status, "active"))
  );
  for (const c of asChallenger) {
    const newVotes = parseFloat(c.challengerWeightedVotes) + weightedScore;
    await db.update(challengers).set({
      challengerWeightedVotes: newVotes.toFixed(3),
      totalVotes: sql2`${challengers.totalVotes} + 1`
    }).where(eq(challengers.id, c.id));
  }
  const asDefender = await db.select().from(challengers).where(
    and(eq(challengers.defenderId, businessId), eq(challengers.status, "active"))
  );
  for (const c of asDefender) {
    const newVotes = parseFloat(c.defenderWeightedVotes) + weightedScore;
    await db.update(challengers).set({
      defenderWeightedVotes: newVotes.toFixed(3),
      totalVotes: sql2`${challengers.totalVotes} + 1`
    }).where(eq(challengers.id, c.id));
  }
}
async function searchBusinesses(query, city, category, limit = 20) {
  const q = "%" + query.toLowerCase() + "%";
  return db.select().from(businesses).where(
    and(
      eq(businesses.city, city),
      eq(businesses.isActive, true),
      query ? sql2`(lower(${businesses.name}) like ${q} OR lower(${businesses.neighborhood}) like ${q})` : void 0,
      ...category ? [eq(businesses.category, category)] : []
    )
  ).orderBy(desc(businesses.weightedScore)).limit(limit);
}
async function getAllCategories(city) {
  const rows = await db.select({
    category: businesses.category
  }).from(businesses).where(and(eq(businesses.city, city), eq(businesses.isActive, true))).groupBy(businesses.category);
  return rows.map((r) => r.category);
}
async function getBusinessPhotos(businessId) {
  const rows = await db.select({ photoUrl: businessPhotos.photoUrl }).from(businessPhotos).where(eq(businessPhotos.businessId, businessId)).orderBy(asc(businessPhotos.sortOrder)).limit(3);
  return rows.map((r) => r.photoUrl);
}
async function getBusinessPhotosMap(businessIds) {
  if (businessIds.length === 0) return {};
  const rows = await db.select({
    businessId: businessPhotos.businessId,
    photoUrl: businessPhotos.photoUrl,
    sortOrder: businessPhotos.sortOrder
  }).from(businessPhotos).where(sql2`${businessPhotos.businessId} = ANY(ARRAY[${sql2.join(businessIds.map((id) => sql2`${id}`), sql2`,`)}]::text[])`).orderBy(asc(businessPhotos.sortOrder));
  const map = {};
  for (const row of rows) {
    if (!map[row.businessId]) map[row.businessId] = [];
    if (map[row.businessId].length < 3) {
      map[row.businessId].push(row.photoUrl);
    }
  }
  return map;
}
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_db();
    init_schema();
  }
});

// server/seed.ts
var seed_exports = {};
__export(seed_exports, {
  seedDatabase: () => seedDatabase
});
import { sql as sql3 } from "drizzle-orm";
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
    await db.update(businesses).set({ inChallenger: true }).where(sql3`${businesses.id} IN (${spiceGarden.id}, ${yardKitchen.id})`);
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
      { name: "Spice Garden", slug: "spice-garden-dallas", neighborhood: "Uptown", category: "restaurant", weightedScore: "4.720", rawAvgScore: "4.60", rankPosition: 1, rankDelta: 0, totalRatings: 312, description: "Thirty years of perfecting North Indian cuisine.", priceRange: "$$$", phone: "(214) 555-0192", address: "3821 Cedar Springs Rd, Uptown, Dallas", lat: "32.8087452", lng: "-96.8024537", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop" },
      { name: "The Yard Kitchen", slug: "the-yard-kitchen-dallas", neighborhood: "Bishop Arts", category: "restaurant", weightedScore: "4.580", rawAvgScore: "4.45", rankPosition: 2, rankDelta: 1, totalRatings: 287, description: "Farm-to-table restaurant in Bishop Arts District.", priceRange: "$$", phone: "(214) 555-0234", address: "402 N Bishop Ave, Bishop Arts, Dallas", lat: "32.7505612", lng: "-96.8267483", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop" },
      { name: "Lucky Cat Ramen", slug: "lucky-cat-ramen-dallas", neighborhood: "Deep Ellum", category: "restaurant", weightedScore: "4.510", rawAvgScore: "4.38", rankPosition: 3, rankDelta: -1, totalRatings: 198, description: "Authentic Japanese ramen with house-made noodles.", priceRange: "$$", phone: "(214) 555-0345", address: "2815 Main St, Deep Ellum, Dallas", lat: "32.7833148", lng: "-96.7836459", isOpenNow: false, photoUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop" },
      { name: "Smoke & Vine", slug: "smoke-and-vine-dallas", neighborhood: "Oak Lawn", category: "restaurant", weightedScore: "4.350", rawAvgScore: "4.20", rankPosition: 4, rankDelta: 2, totalRatings: 156, description: "Texas BBQ meets fine wine in this Oak Lawn gem.", priceRange: "$$$", phone: "(214) 555-0456", address: "4011 Lemmon Ave, Oak Lawn, Dallas", lat: "32.8118523", lng: "-96.8200134", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop" },
      { name: "Abuela's Kitchen", slug: "abuelas-kitchen-dallas", neighborhood: "Oak Cliff", category: "restaurant", weightedScore: "4.280", rawAvgScore: "4.15", rankPosition: 5, rankDelta: 0, totalRatings: 234, description: "Three generations of Mexican recipes from Oaxaca.", priceRange: "$", phone: "(214) 555-0567", address: "1234 Jefferson Blvd, Oak Cliff, Dallas", lat: "32.7453102", lng: "-96.8312487", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1653005753991-22a8bf831f89?w=600&h=400&fit=crop" },
      { name: "Seoul Brothers", slug: "seoul-brothers-dallas", neighborhood: "Carrollton", category: "restaurant", weightedScore: "4.150", rawAvgScore: "4.00", rankPosition: 6, rankDelta: -2, totalRatings: 143, description: "Korean fusion with bold flavors in Carrollton.", priceRange: "$$", phone: "(214) 555-0678", address: "2570 Old Denton Rd, Carrollton, Dallas", lat: "32.9537482", lng: "-96.8903456", isOpenNow: false, photoUrl: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600&h=400&fit=crop" },
      { name: "Pecan Lodge", slug: "pecan-lodge-dallas", neighborhood: "Deep Ellum", category: "restaurant", weightedScore: "4.050", rawAvgScore: "3.95", rankPosition: 7, rankDelta: 0, totalRatings: 523, description: "The most decorated BBQ joint in Dallas history.", priceRange: "$$", phone: "(214) 555-0948", address: "2702 Main St, Deep Ellum, Dallas", lat: "32.7844523", lng: "-96.7842178", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&h=400&fit=crop" },
      { name: "Lucia", slug: "lucia-dallas", neighborhood: "Bishop Arts", category: "restaurant", weightedScore: "3.920", rawAvgScore: "3.85", rankPosition: 8, rankDelta: 1, totalRatings: 167, description: "Chef David Uygur's intimate Italian-inspired dining room.", priceRange: "$$$$", phone: "(214) 555-0666", address: "408 W 8th St, Bishop Arts, Dallas", lat: "32.7494123", lng: "-96.8276789", isOpenNow: false, photoUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop" },
      { name: "Khao Noodle Shop", slug: "khao-noodle-dallas", neighborhood: "Lowest Greenville", category: "restaurant", weightedScore: "3.800", rawAvgScore: "3.75", rankPosition: 9, rankDelta: -1, totalRatings: 154, description: "Northern Thai street food with zero compromise.", priceRange: "$$", phone: "(214) 555-0887", address: "4812 Bryan St, Lowest Greenville, Dallas", lat: "32.7908432", lng: "-96.7712345", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1552611052-33e04de1b100?w=600&h=400&fit=crop" },
      { name: "Fearing's", slug: "fearings-dallas", neighborhood: "Uptown", category: "restaurant", weightedScore: "3.680", rawAvgScore: "3.60", rankPosition: 10, rankDelta: 0, totalRatings: 178, description: "Dean Fearing's flagship inside the Ritz-Carlton.", priceRange: "$$$$", phone: "(214) 555-0220", address: "2121 McKinney Ave, Uptown, Dallas", lat: "32.7978432", lng: "-96.8012345", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1550966871-3ed3cdb51f3a?w=600&h=400&fit=crop" },
      { name: "Cultivar Coffee", slug: "cultivar-coffee-dallas", neighborhood: "East Dallas", category: "cafe", weightedScore: "4.650", rawAvgScore: "4.50", rankPosition: 1, rankDelta: 0, totalRatings: 189, description: "Single-origin pour-overs and house-roasted beans.", priceRange: "$$", phone: "(214) 555-0789", address: "313 N Bishop Ave, East Dallas, Dallas", lat: "32.7932145", lng: "-96.7645321", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop" },
      { name: "Houndstooth Coffee", slug: "houndstooth-coffee-dallas", neighborhood: "Henderson", category: "cafe", weightedScore: "4.520", rawAvgScore: "4.40", rankPosition: 2, rankDelta: 0, totalRatings: 167, description: "Specialty coffee bar with minimalist aesthetic.", priceRange: "$$", phone: "(214) 555-0890", address: "1900 N Henderson Ave, Henderson, Dallas", lat: "32.7998765", lng: "-96.7789012", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop" },
      { name: "The Brew Room", slug: "the-brew-room-dallas", neighborhood: "Uptown", category: "cafe", weightedScore: "4.380", rawAvgScore: "4.25", rankPosition: 3, rankDelta: 1, totalRatings: 132, description: "Cozy Uptown cafe with craft coffee and pastries.", priceRange: "$", phone: "(214) 555-0901", address: "2901 Thomas Ave, Uptown, Dallas", lat: "32.8012345", lng: "-96.7976543", isOpenNow: false, photoUrl: "https://images.unsplash.com/photo-1559305616-3f99cd43e353?w=600&h=400&fit=crop" },
      { name: "Mudleaf Coffee", slug: "mudleaf-coffee-dallas", neighborhood: "Oak Cliff", category: "cafe", weightedScore: "4.200", rawAvgScore: "4.10", rankPosition: 4, rankDelta: -1, totalRatings: 98, description: "Community-focused coffee shop in Oak Cliff.", priceRange: "$", phone: "(214) 555-1012", address: "1621 W Davis St, Oak Cliff, Dallas", lat: "32.7489012", lng: "-96.8345678", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop" },
      { name: "Merit Coffee", slug: "merit-coffee-dallas", neighborhood: "Design District", category: "cafe", weightedScore: "4.100", rawAvgScore: "4.00", rankPosition: 5, rankDelta: 0, totalRatings: 76, description: "Texas-based specialty coffee roasters.", priceRange: "$$", phone: "(214) 555-1123", address: "1445 Hi Line Dr, Design District, Dallas", lat: "32.7856789", lng: "-96.8123456", isOpenNow: false, photoUrl: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&h=400&fit=crop" },
      { name: "Taco Stop", slug: "taco-stop-dallas", neighborhood: "Oak Cliff", category: "street_food", weightedScore: "4.710", rawAvgScore: "4.55", rankPosition: 1, rankDelta: 0, totalRatings: 456, description: "Legendary street tacos \u2014 the al pastor is unreal.", priceRange: "$", phone: "(214) 555-1234", address: "2811 Greenville Ave, Oak Cliff, Dallas", lat: "32.7423456", lng: "-96.8378901", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop" },
      { name: "Fuel City Tacos", slug: "fuel-city-tacos-dallas", neighborhood: "Riverfront", category: "street_food", weightedScore: "4.540", rawAvgScore: "4.40", rankPosition: 2, rankDelta: 0, totalRatings: 378, description: "Gas station tacos that are famous citywide.", priceRange: "$", phone: "(214) 555-1345", address: "801 S Riverfront Blvd, Riverfront, Dallas", lat: "32.7701234", lng: "-96.8178901", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&h=400&fit=crop" },
      { name: "Elote Man", slug: "elote-man-dallas", neighborhood: "Pleasant Grove", category: "street_food", weightedScore: "4.320", rawAvgScore: "4.20", rankPosition: 3, rankDelta: 1, totalRatings: 189, description: "Mexican street corn done right.", priceRange: "$", phone: "(214) 555-1456", address: "Mobile - Pleasant Grove area", lat: "32.7234567", lng: "-96.7456789", isOpenNow: false, photoUrl: "https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=600&h=400&fit=crop" },
      { name: "Kabob King", slug: "kabob-king-dallas", neighborhood: "Richardson", category: "street_food", weightedScore: "4.180", rawAvgScore: "4.05", rankPosition: 4, rankDelta: -1, totalRatings: 145, description: "Pakistani-style seekh kabobs grilled fresh.", priceRange: "$", phone: "(214) 555-1567", address: "750 W Arapaho Rd, Richardson, Dallas", lat: "32.9512345", lng: "-96.7534567", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop" },
      { name: "Chimmy's Churros", slug: "chimmys-churros-dallas", neighborhood: "Deep Ellum", category: "street_food", weightedScore: "4.050", rawAvgScore: "3.95", rankPosition: 5, rankDelta: 0, totalRatings: 112, description: "Fresh churros with creative dipping sauces.", priceRange: "$", phone: "(214) 555-1678", address: "2737 Main St, Deep Ellum, Dallas", lat: "32.7834567", lng: "-96.7823456", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600&h=400&fit=crop" },
      { name: "Midnight Rambler", slug: "midnight-rambler-dallas", neighborhood: "Downtown", category: "bar", weightedScore: "4.680", rawAvgScore: "4.55", rankPosition: 1, rankDelta: 0, totalRatings: 234, description: "Sophisticated cocktail bar in the Joule Hotel basement.", priceRange: "$$$", phone: "(214) 555-1789", address: "1530 Main St, Downtown, Dallas", lat: "32.7812345", lng: "-96.7967890", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=600&h=400&fit=crop" },
      { name: "Atwater Alley", slug: "atwater-alley-dallas", neighborhood: "Deep Ellum", category: "bar", weightedScore: "4.450", rawAvgScore: "4.30", rankPosition: 2, rankDelta: 1, totalRatings: 198, description: "Craft beer and creative cocktails in Deep Ellum.", priceRange: "$$", phone: "(214) 555-1890", address: "2815 Elm St, Deep Ellum, Dallas", lat: "32.7823456", lng: "-96.7834567", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&h=400&fit=crop" },
      { name: "The Grapevine Bar", slug: "the-grapevine-bar-dallas", neighborhood: "Greenville", category: "bar", weightedScore: "4.280", rawAvgScore: "4.15", rankPosition: 3, rankDelta: -1, totalRatings: 167, description: "Oldest bar in Dallas with classic dive bar vibes.", priceRange: "$", phone: "(214) 555-1901", address: "3902 Maple Ave, Greenville, Dallas", lat: "32.8134567", lng: "-96.8123456", isOpenNow: false, photoUrl: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=600&h=400&fit=crop" },
      { name: "Javier's Cigar Bar", slug: "javiers-cigar-bar-dallas", neighborhood: "Knox-Henderson", category: "bar", weightedScore: "4.120", rawAvgScore: "4.00", rankPosition: 4, rankDelta: 0, totalRatings: 134, description: "Upscale cigar lounge with premium spirits.", priceRange: "$$$", phone: "(214) 555-2012", address: "4912 Cole Ave, Knox-Henderson, Dallas", lat: "32.8212345", lng: "-96.7912345", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1525268323446-0505b6fe7778?w=600&h=400&fit=crop" },
      { name: "Lee Harvey's", slug: "lee-harveys-dallas", neighborhood: "Cedars", category: "bar", weightedScore: "3.950", rawAvgScore: "3.85", rankPosition: 5, rankDelta: 0, totalRatings: 189, description: "Iconic outdoor patio bar in the Cedars.", priceRange: "$", phone: "(214) 555-2123", address: "1807 Gould St, Cedars, Dallas", lat: "32.7723456", lng: "-96.7923456", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1538488881038-e252a119ace7?w=600&h=400&fit=crop" },
      { name: "Village Baking Co.", slug: "village-baking-co-dallas", neighborhood: "Greenville", category: "bakery", weightedScore: "4.730", rawAvgScore: "4.60", rankPosition: 1, rankDelta: 0, totalRatings: 267, description: "Artisan sourdough and French pastries.", priceRange: "$$", phone: "(214) 555-2234", address: "2009 Greenville Ave, Greenville, Dallas", lat: "32.8012345", lng: "-96.7712345", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop" },
      { name: "La Casita Bakeshop", slug: "la-casita-bakeshop-dallas", neighborhood: "Oak Cliff", category: "bakery", weightedScore: "4.550", rawAvgScore: "4.40", rankPosition: 2, rankDelta: 0, totalRatings: 198, description: "Mexican-inspired pastries and traditional conchas.", priceRange: "$", phone: "(214) 555-2345", address: "1522 W Davis St, Oak Cliff, Dallas", lat: "32.7489012", lng: "-96.8334567", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=400&fit=crop" },
      { name: "Bisous Bisous", slug: "bisous-bisous-patisserie-dallas", neighborhood: "Knox-Henderson", category: "bakery", weightedScore: "4.380", rawAvgScore: "4.25", rankPosition: 3, rankDelta: 1, totalRatings: 156, description: "French macaron specialists with seasonal flavors.", priceRange: "$$", phone: "(214) 555-2456", address: "3809 McKinney Ave, Knox-Henderson, Dallas", lat: "32.8112345", lng: "-96.7934567", isOpenNow: false, photoUrl: "https://images.unsplash.com/photo-1612203985729-70726954388c?w=600&h=400&fit=crop" },
      { name: "Empire Baking Co.", slug: "empire-baking-co-dallas", neighborhood: "East Dallas", category: "bakery", weightedScore: "4.200", rawAvgScore: "4.10", rankPosition: 4, rankDelta: -1, totalRatings: 132, description: "Dallas staple for bread and celebration cakes.", priceRange: "$$", phone: "(214) 555-2567", address: "5450 W Lovers Lane, East Dallas, Dallas", lat: "32.8534567", lng: "-96.7812345", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=600&h=400&fit=crop" },
      { name: "Haute Sweets", slug: "haute-sweets-patisserie-dallas", neighborhood: "Bishop Arts", category: "bakery", weightedScore: "4.050", rawAvgScore: "3.95", rankPosition: 5, rankDelta: 0, totalRatings: 89, description: "Avant-garde desserts and sculptural pastries.", priceRange: "$$$", phone: "(214) 555-2678", address: "414 W Davis St, Bishop Arts, Dallas", lat: "32.7494123", lng: "-96.8278901", isOpenNow: false, photoUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&h=400&fit=crop" },
      { name: "Raising Cane's", slug: "raising-canes-dallas", neighborhood: "Greenville", category: "fast_food", weightedScore: "4.420", rawAvgScore: "4.30", rankPosition: 1, rankDelta: 0, totalRatings: 523, description: "One love \u2014 chicken fingers, crinkle fries, Texas toast, and that sauce.", priceRange: "$", phone: "(214) 555-2789", address: "5809 Greenville Ave, Greenville, Dallas", lat: "32.8612345", lng: "-96.7712345", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600&h=400&fit=crop" },
      { name: "Whataburger", slug: "whataburger-dallas", neighborhood: "Multiple", category: "fast_food", weightedScore: "4.280", rawAvgScore: "4.15", rankPosition: 2, rankDelta: 0, totalRatings: 678, description: "Texas institution. The honey butter chicken biscuit is legendary.", priceRange: "$", phone: "(214) 555-2890", address: "Multiple locations, Dallas", lat: "32.7767000", lng: "-96.7970000", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop" },
      { name: "In-N-Out Burger", slug: "in-n-out-burger-dallas", neighborhood: "Uptown", category: "fast_food", weightedScore: "4.150", rawAvgScore: "4.00", rankPosition: 3, rankDelta: 1, totalRatings: 445, description: "California import that Dallas can't get enough of.", priceRange: "$", phone: "(214) 555-2901", address: "3500 McKinney Ave, Uptown, Dallas", lat: "32.8112345", lng: "-96.8012345", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&h=400&fit=crop" },
      { name: "Wingstop", slug: "wingstop-dallas-hq", neighborhood: "Addison", category: "fast_food", weightedScore: "3.980", rawAvgScore: "3.85", rankPosition: 4, rankDelta: -1, totalRatings: 312, description: "Dallas-born wing chain \u2014 the original HQ location.", priceRange: "$", phone: "(214) 555-3012", address: "5501 LBJ Freeway, Addison, Dallas", lat: "32.9512345", lng: "-96.8312345", isOpenNow: false, photoUrl: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&h=400&fit=crop" },
      { name: "Taco Bell Cantina", slug: "taco-bell-cantina-dallas", neighborhood: "Deep Ellum", category: "fast_food", weightedScore: "3.820", rawAvgScore: "3.70", rankPosition: 5, rankDelta: 0, totalRatings: 201, description: "The elevated Taco Bell experience with booze.", priceRange: "$", phone: "(214) 555-3123", address: "2649 Main St, Deep Ellum, Dallas", lat: "32.7843210", lng: "-96.7854321", isOpenNow: true, photoUrl: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=600&h=400&fit=crop" }
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
function setupAuth(app2) {
  const PgStore = connectPgSimple(session);
  app2.use(
    session({
      store: new PgStore({
        pool,
        createTableIfMissing: true
      }),
      secret: process.env.SESSION_SECRET || "top-ranker-secret-key",
      resave: false,
      saveUninitialized: false,
      proxy: process.env.NODE_ENV === "production",
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1e3,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
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
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
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
    const { eq: eq2 } = await import("drizzle-orm");
    await db2.update(members2).set({ authId: googleId, avatarUrl: avatarUrl || member.avatarUrl }).where(eq2(members2.id, member.id));
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

// server/routes.ts
init_storage();
init_schema();
function requireAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}
var authAttempts = /* @__PURE__ */ new Map();
function authRateLimit(req, res, next) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const entry = authAttempts.get(ip);
  if (entry && entry.resetAt > now) {
    if (entry.count >= 10) {
      return res.status(429).json({ error: "Too many attempts. Please try again later." });
    }
    entry.count++;
  } else {
    authAttempts.set(ip, { count: 1, resetAt: now + 6e4 });
  }
  next();
}
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of authAttempts) {
    if (entry.resetAt <= now) authAttempts.delete(ip);
  }
}, 3e5);
async function registerRoutes(app2) {
  setupAuth(app2);
  app2.post("/api/auth/signup", authRateLimit, async (req, res) => {
    try {
      const { displayName, username, email, password, city } = req.body;
      if (!displayName || !username || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }
      const member = await registerMember({ displayName, username, email, password, city });
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
  app2.post("/api/auth/login", authRateLimit, (req, res, next) => {
    passport2.authenticate("local", (err, user, info) => {
      if (err) return res.status(500).json({ error: "Internal server error" });
      if (!user) return res.status(401).json({ error: info?.message || "Invalid credentials" });
      req.login(user, (loginErr) => {
        if (loginErr) return res.status(500).json({ error: "Login failed" });
        return res.json({ data: user });
      });
    })(req, res, next);
  });
  app2.post("/api/auth/google", authRateLimit, async (req, res) => {
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
      const query = req.query.q || "";
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
      const [{ ratings: ratings2 }, dishList, photos] = await Promise.all([
        getBusinessRatings(business.id, 1, 20),
        getBusinessDishes(business.id, 5),
        getBusinessPhotos(business.id)
      ]);
      const photoUrls = photos.length > 0 ? photos : business.photoUrl ? [business.photoUrl] : [];
      return res.json({ data: { ...business, photoUrls, recentRatings: ratings2, dishes: dishList } });
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
  app2.get("/api/dishes/search", async (req, res) => {
    try {
      const businessId = req.query.business_id;
      const query = req.query.q || "";
      if (!businessId) return res.status(400).json({ error: "business_id required" });
      const data = await searchDishes(businessId, query);
      return res.json({ data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  app2.post("/api/ratings", requireAuth, async (req, res) => {
    try {
      const parsed = insertRatingSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }
      const memberId = req.user.id;
      const result = await submitRating(memberId, parsed.data);
      return res.status(201).json({ data: result });
    } catch (err) {
      if (err.message.includes("7+ days")) {
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
  app2.get("/api/members/me", requireAuth, async (req, res) => {
    try {
      const member = await getMemberById(req.user.id);
      if (!member) return res.status(404).json({ error: "Member not found" });
      const { score, tier, breakdown } = await recalculateCredibilityScore(member.id);
      const { ratings: ratings2, total } = await getMemberRatings(member.id);
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
          ratingHistory: ratings2
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
  const httpServer = createServer(app2);
  return httpServer;
}

// server/index.ts
import * as fs from "fs";
import * as path from "path";
import { createProxyMiddleware } from "http-proxy-middleware";
var app = express();
var log = console.log;
function setupCors(app2) {
  app2.use((req, res, next) => {
    const origins = /* @__PURE__ */ new Set();
    if (process.env.REPLIT_DEV_DOMAIN) {
      origins.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
    }
    if (process.env.REPLIT_DOMAINS) {
      process.env.REPLIT_DOMAINS.split(",").forEach((d) => {
        origins.add(`https://${d.trim()}`);
      });
    }
    const origin = req.header("origin");
    const isLocalhost = origin?.startsWith("http://localhost:") || origin?.startsWith("http://127.0.0.1:");
    if (origin && (origins.has(origin) || isLocalhost)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      res.header("Access-Control-Allow-Headers", "Content-Type");
      res.header("Access-Control-Allow-Credentials", "true");
    }
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
}
function setupBodyParsing(app2) {
  app2.use(
    express.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      }
    })
  );
  app2.use(express.urlencoded({ extended: false }));
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
      log(logLine);
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
function configureExpoAndLanding(app2) {
  const templatePath = path.resolve(
    process.cwd(),
    "server",
    "templates",
    "landing-page.html"
  );
  const landingPageTemplate = fs.readFileSync(templatePath, "utf-8");
  const appName = getAppName();
  log("Serving static Expo files with dynamic manifest routing");
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
  log("Expo routing: Checking expo-platform header on / and /manifest");
  log("Metro proxy: Forwarding web requests to localhost:8081");
}
function setupErrorHandler(app2) {
  app2.use((err, _req, res, next) => {
    const error = err;
    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    console.error("Internal Server Error:", err);
    if (res.headersSent) {
      return next(err);
    }
    return res.status(status).json({ message });
  });
}
(async () => {
  setupCors(app);
  setupBodyParsing(app);
  setupRequestLogging(app);
  const server = await registerRoutes(app);
  configureExpoAndLanding(app);
  const { seedDatabase: seedDatabase2 } = await Promise.resolve().then(() => (init_seed(), seed_exports));
  seedDatabase2().catch((err) => console.error("Seed error:", err));
  setupErrorHandler(app);
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true
    },
    () => {
      log(`express server serving on port ${port}`);
    }
  );
})();
