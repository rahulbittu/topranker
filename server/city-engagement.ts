/**
 * Per-City Engagement Metrics Dashboard
 * Provides aggregated engagement data per city for the admin dashboard.
 * Owner: Cole (City Growth Lead)
 */

import { log } from "./logger";
import { db } from "./db";
import { members, businesses, ratings } from "@shared/schema";
import { sql, eq, count } from "drizzle-orm";
import { getActiveCities, getBetaCities, isCityActive } from "@shared/city-config";

const engLog = log.tag("CityEngagement");

export interface CityEngagement {
  city: string;
  totalMembers: number;
  totalBusinesses: number;
  totalRatings: number;
  avgRatingsPerMember: number;
  topCategory: string;
  status: "active" | "beta" | "planned";
}

export async function getCityEngagement(city: string): Promise<CityEngagement> {
  engLog.debug(`Fetching engagement for city: ${city}`);

  // Count members in this city
  const [memberResult] = await db
    .select({ total: count() })
    .from(members)
    .where(eq(members.city, city));
  const totalMembers = memberResult?.total ?? 0;

  // Count businesses in this city
  const [bizResult] = await db
    .select({ total: count() })
    .from(businesses)
    .where(eq(businesses.city, city));
  const totalBusinesses = bizResult?.total ?? 0;

  // Count ratings for businesses in this city via raw SQL join
  const ratingsResult = await db.execute(sql`
    SELECT COUNT(r.id)::int AS total
    FROM ratings r
    JOIN businesses b ON r.business_id = b.id
    WHERE b.city = ${city}
  `);
  const totalRatings = (ratingsResult.rows[0] as any)?.total ?? 0;

  // Average ratings per member
  const avgRatingsPerMember =
    totalMembers > 0 ? Math.round((totalRatings / totalMembers) * 100) / 100 : 0;

  // Top category by business count in this city
  const categoryResult = await db
    .select({ category: businesses.category, total: count() })
    .from(businesses)
    .where(eq(businesses.city, city))
    .groupBy(businesses.category)
    .orderBy(sql`count(*) DESC`)
    .limit(1);
  const topCategory = categoryResult[0]?.category ?? "N/A";

  engLog.info(`City engagement for ${city}: ${totalMembers} members, ${totalBusinesses} businesses, ${totalRatings} ratings`);

  return {
    city,
    totalMembers,
    totalBusinesses,
    totalRatings,
    avgRatingsPerMember,
    topCategory,
    status: isCityActive(city) ? "active" as const : "beta" as const,
  };
}

export async function getAllCityEngagement(): Promise<CityEngagement[]> {
  const activeCities = getActiveCities();
  const betaCities = getBetaCities();
  const allCities = [...activeCities, ...betaCities];

  engLog.info(`Fetching engagement for ${allCities.length} cities (${activeCities.length} active, ${betaCities.length} beta)`);

  const results = await Promise.all(allCities.map((city) => getCityEngagement(city)));

  // Sort by totalMembers descending
  results.sort((a, b) => b.totalMembers - a.totalMembers);

  return results;
}
