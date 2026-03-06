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
  unique,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const members = pgTable("members", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  displayName: text("display_name").notNull(),
  username: text("username").unique().notNull(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  avatarUrl: text("avatar_url"),
  city: text("city").notNull().default("Dallas"),
  credibilityScore: integer("credibility_score").notNull().default(10),
  credibilityTier: text("credibility_tier").notNull().default("new"),
  totalRatings: integer("total_ratings").notNull().default(0),
  totalCategories: integer("total_categories").notNull().default(0),
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
    photoUrl: text("photo_url"),
    ownerId: varchar("owner_id").references(() => members.id),
    weightedScore: numeric("weighted_score", { precision: 6, scale: 3 })
      .notNull()
      .default("0"),
    rawAvgScore: numeric("raw_avg_score", { precision: 4, scale: 2 })
      .notNull()
      .default("0"),
    rankPosition: integer("rank_position"),
    rankDelta: integer("rank_delta").notNull().default(0),
    totalRatings: integer("total_ratings").notNull().default(0),
    credibilityWeightSum: numeric("credibility_weight_sum", {
      precision: 10,
      scale: 3,
    })
      .notNull()
      .default("0"),
    isVerified: boolean("is_verified").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    inChallenger: boolean("in_challenger").notNull().default(false),
    description: text("description"),
    tags: text("tags"),
    priceRange: text("price_range"),
    hours: text("hours"),
    featuredDish: text("featured_dish"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_businesses_city_category").on(table.city, table.category),
    index("idx_businesses_weighted_score").on(table.weightedScore),
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
    foodQuality: integer("food_quality").notNull(),
    valueForMoney: integer("value_for_money").notNull(),
    service: integer("service").notNull(),
    wouldReturn: boolean("would_return").notNull(),
    note: text("note"),
    rawScore: numeric("raw_score", { precision: 4, scale: 2 }).notNull(),
    weight: numeric("weight", { precision: 5, scale: 4 }).notNull(),
    weightedScore: numeric("weighted_score", { precision: 6, scale: 4 }).notNull(),
    isFlagged: boolean("is_flagged").notNull().default(false),
    flagReason: text("flag_reason"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_ratings_business_id").on(table.businessId),
    index("idx_ratings_member_id").on(table.memberId),
    index("idx_ratings_created_at").on(table.createdAt),
  ],
);

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
    status: text("status").notNull().default("active"),
    winnerId: varchar("winner_id").references(() => businesses.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("idx_challengers_status").on(table.status)],
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
    category: text("category").notNull(),
    city: text("city").notNull(),
    rankPosition: integer("rank_position").notNull(),
    weightedScore: numeric("weighted_score", { precision: 6, scale: 3 }).notNull(),
    snapshotDate: date("snapshot_date")
      .notNull()
      .default(sql`current_date`),
  },
  (table) => [
    unique("unique_business_snapshot").on(table.businessId, table.snapshotDate),
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
  status: text("status").notNull().default("pending"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
});

export const insertMemberSchema = createInsertSchema(members).pick({
  displayName: true,
  username: true,
  email: true,
  password: true,
  city: true,
});

export const insertRatingSchema = createInsertSchema(ratings)
  .pick({
    businessId: true,
    foodQuality: true,
    valueForMoney: true,
    service: true,
    wouldReturn: true,
    note: true,
  })
  .extend({
    foodQuality: z.number().min(1).max(5),
    valueForMoney: z.number().min(1).max(5),
    service: z.number().min(1).max(5),
    wouldReturn: z.boolean(),
    note: z.string().max(160).optional(),
  });

export type Member = typeof members.$inferSelect;
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Business = typeof businesses.$inferSelect;
export type Rating = typeof ratings.$inferSelect;
export type Challenger = typeof challengers.$inferSelect;
export type RankHistory = typeof rankHistory.$inferSelect;
export type BusinessClaim = typeof businessClaims.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;
