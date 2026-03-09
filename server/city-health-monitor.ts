/**
 * Sprint 252: City Health Monitor
 * Tracks city-level health metrics for operational monitoring.
 * Owner: Cole Anderson (DevOps)
 */

import { log } from "./logger";

const healthLog = log.tag("CityHealth");

export interface CityHealthMetrics {
  city: string;
  businessCount: number;
  memberCount: number;
  ratingCount: number;
  avgResponseTime: number;
  errorRate: number;
  lastChecked: string;
  status: "healthy" | "degraded" | "critical";
}

const healthData = new Map<string, CityHealthMetrics>();

export function updateCityHealth(
  city: string,
  metrics: Omit<CityHealthMetrics, "city" | "lastChecked" | "status">,
): CityHealthMetrics {
  const status =
    metrics.errorRate > 5
      ? "critical"
      : metrics.errorRate > 2
        ? "degraded"
        : "healthy";
  const entry: CityHealthMetrics = {
    city,
    ...metrics,
    lastChecked: new Date().toISOString(),
    status,
  };
  healthData.set(city, entry);
  if (status !== "healthy") {
    healthLog.warn(
      `City ${city} health: ${status} (error rate ${metrics.errorRate}%)`,
    );
  }
  return entry;
}

export function getCityHealth(city: string): CityHealthMetrics | null {
  return healthData.get(city) || null;
}

export function getAllCityHealth(): CityHealthMetrics[] {
  return Array.from(healthData.values());
}

export function getHealthySummary(): {
  total: number;
  healthy: number;
  degraded: number;
  critical: number;
} {
  const all = Array.from(healthData.values());
  return {
    total: all.length,
    healthy: all.filter((c) => c.status === "healthy").length,
    degraded: all.filter((c) => c.status === "degraded").length,
    critical: all.filter((c) => c.status === "critical").length,
  };
}

export function clearHealthData(): void {
  healthData.clear();
}
