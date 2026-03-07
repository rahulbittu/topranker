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

export const businessPhotos = pgTable("business_photos", {
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
});

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

export const credibilityPenalties = pgTable("credibility_penalties", {
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
});

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
export type InsertRating = z.infer<typeof insertRatingSchema>;
