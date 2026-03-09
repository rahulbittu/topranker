/**
 * Sprint 233: City Promotion Criteria
 * Auto-gate system that evaluates whether a beta city should be promoted to active.
 * Owner: Cole Anderson (City Growth Lead)
 *
 * Thresholds are configurable via setPromotionThresholds() and exposed through
 * admin routes in routes-admin-promotion.ts.
 */

import { log } from "./logger";
import { getCityConfig, CITY_REGISTRY } from "../shared/city-config";
import { getCityEngagement } from "./city-engagement";

const promoLog = log.tag("CityPromotion");

export interface PromotionThresholds {
  minBusinesses: number;
  minMembers: number;
  minRatings: number;
  minDaysInBeta: number;
}

export interface PromotionStatus {
  city: string;
  eligible: boolean;
  currentMetrics: {
    businesses: number;
    members: number;
    ratings: number;
    daysInBeta: number;
  };
  thresholds: PromotionThresholds;
  missingCriteria: string[];
}

let thresholds: PromotionThresholds = {
  minBusinesses: 50,
  minMembers: 100,
  minRatings: 200,
  minDaysInBeta: 30,
};

export function getPromotionThresholds(): PromotionThresholds {
  return { ...thresholds };
}

export function setPromotionThresholds(t: Partial<PromotionThresholds>): PromotionThresholds {
  thresholds = { ...thresholds, ...t };
  promoLog.info("Promotion thresholds updated", thresholds);
  return { ...thresholds };
}

export async function getPromotionStatus(city: string): Promise<PromotionStatus | null> {
  const config = getCityConfig(city);
  if (!config || config.status !== "beta") return null;

  const engagement = await getCityEngagement(city);
  const launchDate = config.launchDate ? new Date(config.launchDate) : new Date();
  const daysInBeta = Math.floor(
    (Date.now() - launchDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const missing: string[] = [];
  if (engagement.totalBusinesses < thresholds.minBusinesses) missing.push("businesses");
  if (engagement.totalMembers < thresholds.minMembers) missing.push("members");
  if (engagement.totalRatings < thresholds.minRatings) missing.push("ratings");
  if (daysInBeta < thresholds.minDaysInBeta) missing.push("daysInBeta");

  return {
    city,
    eligible: missing.length === 0,
    currentMetrics: {
      businesses: engagement.totalBusinesses,
      members: engagement.totalMembers,
      ratings: engagement.totalRatings,
      daysInBeta,
    },
    thresholds: { ...thresholds },
    missingCriteria: missing,
  };
}

export async function evaluatePromotion(city: string): Promise<boolean> {
  const status = await getPromotionStatus(city);
  if (!status) return false;
  return status.eligible;
}

export function promoteCity(city: string): boolean {
  const config = getCityConfig(city);
  if (!config || config.status !== "beta") {
    promoLog.warn(`Cannot promote ${city}: not a beta city`);
    return false;
  }
  // Mutate registry entry to active
  (CITY_REGISTRY as any)[city].status = "active";
  (CITY_REGISTRY as any)[city].launchDate =
    (CITY_REGISTRY as any)[city].launchDate || new Date().toISOString().slice(0, 10);
  promoLog.info(`Promoted ${city} from beta to active`);
  return true;
}
