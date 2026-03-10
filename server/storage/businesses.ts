import { eq, and, desc, asc, sql, count, gte } from "drizzle-orm";
import {
  businesses, ratings, rankHistory,
  type Business,
} from "@shared/schema";
import { db } from "../db";
import { computeDecayFactor, applyBayesianPrior } from "@shared/score-engine";
import { cacheAside, cacheDelPattern, trackCacheMiss } from "../redis";

// Sprint 549: Added neighborhood + priceRange filters
export async function getLeaderboard(
  city: string,
  category: string,
  limit: number = 50,
  cuisine?: string,
  neighborhood?: string,
  priceRange?: string,
): Promise<Business[]> {
  const key = `leaderboard:${city}:${category}:${cuisine || "all"}:${neighborhood || "all"}:${priceRange || "all"}:${limit}`;
  return cacheAside(key, 300, async () => {
    trackCacheMiss();
    // Sprint 273: Filter by leaderboard eligibility (3+ raters, 1+ dine-in, credibility >= 0.5)
    // Sprint 286: Optional cuisine filter for Category → Cuisine → Dish workflow
    // Sprint 549: Optional neighborhood + priceRange filters
    return db
      .select()
      .from(businesses)
      .where(
        and(
          eq(businesses.city, city),
          eq(businesses.category, category),
          eq(businesses.isActive, true),
          eq(businesses.leaderboardEligible, true),
          ...(cuisine ? [eq(businesses.cuisine, cuisine)] : []),
          ...(neighborhood ? [eq(businesses.neighborhood, neighborhood)] : []),
          ...(priceRange ? [eq(businesses.priceRange, priceRange)] : []),
        ),
      )
      .orderBy(asc(businesses.rankPosition))
      .limit(limit);
  });
}

// Sprint 549: Get distinct neighborhoods for a city
export async function getNeighborhoods(city: string): Promise<string[]> {
  const key = `neighborhoods:${city}`;
  return cacheAside(key, 600, async () => {
    trackCacheMiss();
    const rows = await db
      .selectDistinct({ neighborhood: businesses.neighborhood })
      .from(businesses)
      .where(
        and(
          eq(businesses.city, city),
          eq(businesses.isActive, true),
          sql`${businesses.neighborhood} IS NOT NULL`,
          sql`${businesses.neighborhood} != ''`,
        ),
      )
      .orderBy(asc(businesses.neighborhood));
    return rows.map(r => r.neighborhood!);
  });
}

export async function getTrendingBusinesses(
  city: string,
  limit: number = 3,
): Promise<Business[]> {
  const key = `trending:${city}:${limit}`;
  return cacheAside(key, 600, async () => {
    trackCacheMiss();
    return db
      .select()
      .from(businesses)
      .where(
        and(
          eq(businesses.city, city),
          eq(businesses.isActive, true),
          sql`${businesses.rankDelta} > 0`,
        ),
      )
      .orderBy(desc(businesses.rankDelta))
      .limit(limit);
  });
}

export async function getBusinessBySlug(slug: string): Promise<Business | undefined> {
  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.slug, slug));
  return business;
}

export async function getBusinessById(id: string): Promise<Business | undefined> {
  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.id, id));
  return business;
}

// Sprint 176: Update subscription fields on a business
export async function updateBusinessSubscription(
  businessId: string,
  updates: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string | null;
    subscriptionStatus?: string;
    subscriptionPeriodEnd?: Date;
  },
): Promise<void> {
  const setData: Record<string, any> = {};
  if (updates.stripeCustomerId !== undefined) setData.stripeCustomerId = updates.stripeCustomerId;
  if (updates.stripeSubscriptionId !== undefined) setData.stripeSubscriptionId = updates.stripeSubscriptionId;
  if (updates.subscriptionStatus !== undefined) setData.subscriptionStatus = updates.subscriptionStatus;
  if (updates.subscriptionPeriodEnd !== undefined) setData.subscriptionPeriodEnd = updates.subscriptionPeriodEnd;
  if (Object.keys(setData).length === 0) return;
  await db.update(businesses).set(setData).where(eq(businesses.id, businessId));
}

export async function getBusinessesByIds(ids: string[]): Promise<Business[]> {
  if (ids.length === 0) return [];
  return db
    .select()
    .from(businesses)
    .where(sql`${businesses.id} = ANY(ARRAY[${sql.join(ids.map(id => sql`${id}`), sql`,`)}]::text[])`);
}

export async function searchBusinesses(
  query: string,
  city: string,
  category?: string,
  limit: number = 20,
  cuisine?: string,
  offset: number = 0, // Sprint 473: Pagination support
): Promise<Business[]> {
  // Input sanitization: max 100 chars, strip LIKE wildcards from user input
  const sanitized = query.slice(0, 100).replace(/[%_\\]/g, "");
  const q = "%" + sanitized.toLowerCase() + "%";
  return db
    .select()
    .from(businesses)
    .where(
      and(
        eq(businesses.city, city),
        eq(businesses.isActive, true),
        query
          ? sql`(lower(${businesses.name}) like ${q} OR lower(${businesses.neighborhood}) like ${q} OR lower(${businesses.category}) like ${q} OR lower(COALESCE(${businesses.cuisine}, '')) like ${q})`
          : undefined,
        ...(category ? [eq(businesses.category, category)] : []),
        ...(cuisine ? [eq(businesses.cuisine, cuisine)] : []),
      ),
    )
    .orderBy(desc(businesses.weightedScore))
    .limit(limit)
    .offset(offset);
}

// Sprint 473: Count total matching businesses for pagination metadata
export async function countBusinessSearch(
  query: string,
  city: string,
  category?: string,
  cuisine?: string,
): Promise<number> {
  const sanitized = query.slice(0, 100).replace(/[%_\\]/g, "");
  const q = "%" + sanitized.toLowerCase() + "%";
  const [result] = await db
    .select({ total: count() })
    .from(businesses)
    .where(
      and(
        eq(businesses.city, city),
        eq(businesses.isActive, true),
        query
          ? sql`(lower(${businesses.name}) like ${q} OR lower(${businesses.neighborhood}) like ${q} OR lower(${businesses.category}) like ${q} OR lower(COALESCE(${businesses.cuisine}, '')) like ${q})`
          : undefined,
        ...(category ? [eq(businesses.category, category)] : []),
        ...(cuisine ? [eq(businesses.cuisine, cuisine)] : []),
      ),
    );
  return result?.total ?? 0;
}

// Sprint 286: Get distinct cuisines for a city+category
export async function getCuisines(city: string, category?: string): Promise<string[]> {
  const key = `cuisines:${city}:${category || "all"}`;
  return cacheAside(key, 7200, async () => {
    trackCacheMiss();
    const rows = await db
      .select({ cuisine: businesses.cuisine })
      .from(businesses)
      .where(
        and(
          eq(businesses.city, city),
          eq(businesses.isActive, true),
          sql`${businesses.cuisine} IS NOT NULL`,
          ...(category ? [eq(businesses.category, category)] : []),
        ),
      )
      .groupBy(businesses.cuisine);
    return rows.map(r => r.cuisine!).filter(Boolean);
  });
}

export async function getAllCategories(city: string): Promise<string[]> {
  const key = `categories:${city}`;
  return cacheAside(key, 7200, async () => {
    trackCacheMiss();
    const rows = await db
      .select({
        category: businesses.category,
      })
      .from(businesses)
      .where(and(eq(businesses.city, city), eq(businesses.isActive, true)))
      .groupBy(businesses.category);
    return rows.map(r => r.category);
  });
}

/**
 * Sprint 184: Autocomplete — returns lightweight matches for typeahead.
 * Searches name, category, and neighborhood. Returns top 6 results with minimal fields.
 */
export async function autocompleteBusinesses(
  query: string,
  city: string,
  limit: number = 6,
): Promise<{ id: string; name: string; slug: string; category: string; cuisine?: string; neighborhood: string | null; weightedScore?: number }[]> {
  if (!query || query.trim().length === 0) return [];
  const sanitized = query.slice(0, 50).replace(/[%_\\]/g, "");
  const q = "%" + sanitized.toLowerCase() + "%";
  return db
    .select({
      id: businesses.id,
      name: businesses.name,
      slug: businesses.slug,
      category: businesses.category,
      cuisine: businesses.cuisine,
      neighborhood: businesses.neighborhood,
      weightedScore: businesses.weightedScore,
    })
    .from(businesses)
    .where(
      and(
        eq(businesses.city, city),
        eq(businesses.isActive, true),
        sql`(lower(${businesses.name}) like ${q} OR lower(${businesses.category}) like ${q} OR lower(${businesses.neighborhood}) like ${q} OR lower(COALESCE(${businesses.cuisine}, '')) like ${q})`,
      ),
    )
    .orderBy(desc(businesses.weightedScore))
    .limit(limit);
}

/**
 * Sprint 184: Popular categories — returns categories with business count, ordered by count.
 * Used for dynamic suggestion chips on the search screen.
 */
export async function getPopularCategories(
  city: string,
  limit: number = 8,
): Promise<{ category: string; count: number }[]> {
  const key = `popular_categories:${city}:${limit}`;
  return cacheAside(key, 3600, async () => {
    trackCacheMiss();
    const rows = await db
      .select({
        category: businesses.category,
        count: count(businesses.id),
      })
      .from(businesses)
      .where(and(eq(businesses.city, city), eq(businesses.isActive, true)))
      .groupBy(businesses.category)
      .orderBy(desc(count(businesses.id)))
      .limit(limit);
    return rows.map(r => ({ category: r.category, count: Number(r.count) }));
  });
}

export async function recalculateBusinessScore(businessId: string): Promise<number> {
  // Sprint 271: Use compositeScore + effectiveWeight when available (Sprint 267+),
  // fall back to rawScore + weight for older ratings.
  // Temporal decay uses exponential formula from Rating Integrity Part 6 Step 5.
  const allRatings = await db
    .select({
      rawScore: ratings.rawScore,
      weight: ratings.weight,
      compositeScore: ratings.compositeScore,
      effectiveWeight: ratings.effectiveWeight,
      visitType: ratings.visitType,
      createdAt: ratings.createdAt,
      isFlagged: ratings.isFlagged,
      autoFlagged: ratings.autoFlagged,
    })
    .from(ratings)
    .where(
      and(
        eq(ratings.businessId, businessId),
        eq(ratings.isFlagged, false),
        eq(ratings.autoFlagged, false),
      ),
    );

  if (allRatings.length === 0) {
    await db
      .update(businesses)
      .set({
        weightedScore: "0", rawAvgScore: "0", totalRatings: 0,
        dineInCount: 0, credibilityWeightedSum: "0", leaderboardEligible: false,
        updatedAt: new Date(),
      })
      .where(eq(businesses.id, businessId));
    return 0;
  }

  let totalWeightedScore = 0;
  let totalEffectiveWeight = 0;
  let rawSum = 0;
  // Sprint 273: Track leaderboard eligibility fields
  let dineInCount = 0;
  let credibilityWeightedSum = 0;

  for (const r of allRatings) {
    const ageDays = Math.floor(
      (Date.now() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24),
    );
    // Sprint 271: Exponential decay from score engine (lambda=0.003)
    const decay = computeDecayFactor(ageDays);

    // Use integrity columns when available (Sprint 267+ ratings), fall back to legacy
    const score = r.compositeScore ? parseFloat(r.compositeScore) : parseFloat(r.rawScore);
    const weight = r.effectiveWeight ? parseFloat(r.effectiveWeight) : parseFloat(r.weight);

    const decayedWeight = weight * decay;
    totalWeightedScore += score * decayedWeight;
    totalEffectiveWeight += decayedWeight;
    rawSum += parseFloat(r.rawScore);

    // Sprint 273: Track dine-in count and credibility sum
    if (r.visitType === "dine_in") dineInCount++;
    credibilityWeightedSum += weight;
  }

  // Sprint 272: Apply Bayesian prior — shrink toward 6.5 for low-data restaurants
  const rawWeightedAvg = totalEffectiveWeight > 0
    ? totalWeightedScore / totalEffectiveWeight
    : 0;
  const score = Math.round(
    applyBayesianPrior(rawWeightedAvg, totalEffectiveWeight) * 1000,
  ) / 1000;
  const rawAvg = rawSum / allRatings.length;

  // Sprint 273: Leaderboard eligibility — Rating Integrity Part 6 Step 7
  const eligible = allRatings.length >= 3 && dineInCount >= 1 && credibilityWeightedSum >= 0.5;

  await db
    .update(businesses)
    .set({
      weightedScore: score.toFixed(3),
      rawAvgScore: rawAvg.toFixed(2),
      totalRatings: allRatings.length,
      dineInCount,
      credibilityWeightedSum: credibilityWeightedSum.toFixed(4),
      leaderboardEligible: eligible,
      updatedAt: new Date(),
    })
    .where(eq(businesses.id, businessId));

  return score;
}

// Sprint 136 core-loop fix: single window-function UPDATE replaces O(N) loop
export async function recalculateRanks(
  city: string,
  category: string,
): Promise<void> {
  await db.execute(sql`
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

  // Sprint 189: Invalidate cached leaderboard + trending for this city
  await cacheDelPattern(`leaderboard:${city}:*`);
  await cacheDelPattern(`trending:${city}:*`);
}

// Sprint 498: Photo functions moved to storage/photos.ts
export { getBusinessPhotos, getBusinessPhotosMap, getBusinessPhotoDetails, insertBusinessPhotos, getBusinessesWithoutPhotos, deleteBusinessPhotos } from "./photos";

export async function getRankHistory(
  businessId: string,
  days: number = 30,
): Promise<{ date: string; rank: number; score: number }[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const rows = await db
    .select({
      date: rankHistory.snapshotDate,
      rank: rankHistory.rankPosition,
      score: rankHistory.weightedScore,
    })
    .from(rankHistory)
    .where(
      and(
        eq(rankHistory.businessId, businessId),
        gte(rankHistory.snapshotDate, cutoff.toISOString().split("T")[0]),
      ),
    )
    .orderBy(asc(rankHistory.snapshotDate));
  return rows.map(r => ({
    date: r.date,
    rank: r.rank,
    score: parseFloat(r.score),
  }));
}

export async function getBusinessRatings(
  businessId: string,
  page: number = 1,
  perPage: number = 20,
): Promise<{ ratings: any[]; total: number }> {
  const offset = (page - 1) * perPage;
  const { members } = await import("@shared/schema");

  const ratingsResult = await db
    .select({
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
      memberName: members.displayName,
      memberTier: members.credibilityTier,
      memberAvatarUrl: members.avatarUrl,
    })
    .from(ratings)
    .innerJoin(members, eq(ratings.memberId, members.id))
    .where(and(eq(ratings.businessId, businessId), eq(ratings.isFlagged, false)))
    .orderBy(sql`${ratings.createdAt} DESC`)
    .limit(perPage)
    .offset(offset);

  const [totalResult] = await db
    .select({ count: count() })
    .from(ratings)
    .where(and(eq(ratings.businessId, businessId), eq(ratings.isFlagged, false)));

  return { ratings: ratingsResult, total: totalResult.count };
}

/**
 * Sprint 187: Generate a URL-safe slug from business name and city.
 */
function generateSlug(name: string, city: string): string {
  const base = `${name}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return base;
}

/**
 * Sprint 187: Bulk import businesses from Google Places data.
 * Deduplicates by googlePlaceId. Returns import results.
 */
export async function bulkImportBusinesses(
  places: Array<{
    placeId: string;
    name: string;
    address: string;
    city: string;
    category: string;
    lat: number;
    lng: number;
    googleRating: number | null;
    priceRange: string;
  }>,
): Promise<{ imported: number; skipped: number; results: Array<{ name: string; status: string }> }> {
  let imported = 0;
  let skipped = 0;
  const results: Array<{ name: string; status: string }> = [];

  for (const place of places) {
    // Check for existing business by googlePlaceId
    const [existing] = await db
      .select({ id: businesses.id })
      .from(businesses)
      .where(eq(businesses.googlePlaceId, place.placeId));

    if (existing) {
      skipped++;
      results.push({ name: place.name, status: "skipped_duplicate" });
      continue;
    }

    // Generate unique slug
    let slug = generateSlug(place.name, place.city);
    const [slugExists] = await db.select({ id: businesses.id }).from(businesses).where(eq(businesses.slug, slug));
    if (slugExists) {
      slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
    }

    // Extract neighborhood from address (text between first comma and city)
    const addressParts = place.address.split(",").map(p => p.trim());
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
        dataSource: "google_bulk_import",
      });
      imported++;
      results.push({ name: place.name, status: "imported" });
    } catch (err: any) {
      skipped++;
      results.push({ name: place.name, status: `error: ${err.message?.slice(0, 50)}` });
    }
  }

  return { imported, skipped, results };
}

/**
 * Sprint 187: Get import statistics per city.
 */
export async function getImportStats(): Promise<Array<{ city: string; dataSource: string; count: number }>> {
  const rows = await db
    .select({
      city: businesses.city,
      dataSource: businesses.dataSource,
      count: count(businesses.id),
    })
    .from(businesses)
    .where(eq(businesses.isActive, true))
    .groupBy(businesses.city, businesses.dataSource)
    .orderBy(businesses.city);
  return rows.map(r => ({ city: r.city, dataSource: r.dataSource || "unknown", count: Number(r.count) }));
}

// Sprint 498: getTopDishesForAutocomplete moved to storage/dishes.ts
