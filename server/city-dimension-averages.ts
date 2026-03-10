/**
 * Sprint 578: City Dimension Averages
 * Sprint 582: Added in-memory TTL cache (5 min) to avoid repeated AVG queries
 *
 * Computes average dimension scores across all active businesses in a city.
 * Used by DimensionComparisonCard to show business vs city context.
 */
import { db } from "./db";
import { ratings, businesses } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

export interface CityDimensionAverages {
  food: number; service: number; vibe: number;
  packaging: number; waitTime: number; value: number;
  totalRatings: number; totalBusinesses: number;
}

/** Sprint 582: In-memory TTL cache — 5 minute expiry per city */
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { data: CityDimensionAverages; expiresAt: number }>();

export function getCacheSize(): number { return cache.size; }
export function clearDimensionCache(): void { cache.clear(); }

function round1(n: number): number { return Math.round(n * 10) / 10; }

export async function computeCityDimensionAverages(city: string): Promise<CityDimensionAverages> {
  const key = city.toLowerCase().trim();
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && cached.expiresAt > now) return cached.data;
  const rows = await db.select({
    foodAvg: sql<number>`AVG(${ratings.foodScore})`,
    serviceAvg: sql<number>`AVG(${ratings.serviceScore})`,
    vibeAvg: sql<number>`AVG(${ratings.vibeScore})`,
    packagingAvg: sql<number>`AVG(${ratings.packagingScore})`,
    waitTimeAvg: sql<number>`AVG(${ratings.waitTimeScore})`,
    valueAvg: sql<number>`AVG(${ratings.valueScore})`,
    totalRatings: sql<number>`COUNT(*)`,
    totalBusinesses: sql<number>`COUNT(DISTINCT ${ratings.businessId})`,
  })
    .from(ratings)
    .innerJoin(businesses, eq(ratings.businessId, businesses.id))
    .where(and(
      sql`LOWER(${businesses.city}) = LOWER(${city})`,
      eq(businesses.isActive, true),
      eq(ratings.isFlagged, false),
    ));

  const r = rows[0];
  const result: CityDimensionAverages = {
    food: round1(Number(r?.foodAvg) || 0),
    service: round1(Number(r?.serviceAvg) || 0),
    vibe: round1(Number(r?.vibeAvg) || 0),
    packaging: round1(Number(r?.packagingAvg) || 0),
    waitTime: round1(Number(r?.waitTimeAvg) || 0),
    value: round1(Number(r?.valueAvg) || 0),
    totalRatings: Number(r?.totalRatings) || 0,
    totalBusinesses: Number(r?.totalBusinesses) || 0,
  };

  // Evict stale entries when cache grows beyond 50 cities
  if (cache.size >= 50) {
    for (const [k, v] of cache) { if (v.expiresAt <= now) cache.delete(k); }
  }
  cache.set(key, { data: result, expiresAt: now + CACHE_TTL_MS });
  return result;
}
