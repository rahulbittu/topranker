/**
 * Sprint 578: City Dimension Averages
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

function round1(n: number): number { return Math.round(n * 10) / 10; }

export async function computeCityDimensionAverages(city: string): Promise<CityDimensionAverages> {
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
  return {
    food: round1(Number(r?.foodAvg) || 0),
    service: round1(Number(r?.serviceAvg) || 0),
    vibe: round1(Number(r?.vibeAvg) || 0),
    packaging: round1(Number(r?.packagingAvg) || 0),
    waitTime: round1(Number(r?.waitTimeAvg) || 0),
    value: round1(Number(r?.valueAvg) || 0),
    totalRatings: Number(r?.totalRatings) || 0,
    totalBusinesses: Number(r?.totalBusinesses) || 0,
  };
}
