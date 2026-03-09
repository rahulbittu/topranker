/**
 * Sprint 247: Tiered Rate Limiter — per-tier API rate limiting
 * Configurable rate limits for free/pro/enterprise/admin API tiers.
 * Uses sliding-window counters with minute/hour/day granularity.
 * Owner: Sarah Nakamura (Lead Eng)
 */

import { log } from "./logger";

const tierRLLog = log.tag("TieredRateLimit");

type ApiTier = "free" | "pro" | "enterprise" | "admin";

interface TierLimits {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit: number;
}

export const TIER_LIMITS: Record<ApiTier, TierLimits> = {
  free: { requestsPerMinute: 30, requestsPerHour: 500, requestsPerDay: 5000, burstLimit: 10 },
  pro: { requestsPerMinute: 120, requestsPerHour: 3000, requestsPerDay: 50000, burstLimit: 30 },
  enterprise: { requestsPerMinute: 600, requestsPerHour: 20000, requestsPerDay: 500000, burstLimit: 100 },
  admin: { requestsPerMinute: 1000, requestsPerHour: 50000, requestsPerDay: 1000000, burstLimit: 200 },
};

interface UsageRecord {
  tier: ApiTier;
  minuteCount: number;
  hourCount: number;
  dayCount: number;
  minuteReset: number;
  hourReset: number;
  dayReset: number;
}

const usage = new Map<string, UsageRecord>();
export const MAX_TRACKED = 10000;

function getOrCreate(key: string, tier: ApiTier): UsageRecord {
  const now = Date.now();
  let record = usage.get(key);
  if (!record) {
    record = {
      tier,
      minuteCount: 0,
      hourCount: 0,
      dayCount: 0,
      minuteReset: now + 60000,
      hourReset: now + 3600000,
      dayReset: now + 86400000,
    };
    usage.set(key, record);
    if (usage.size > MAX_TRACKED) {
      const oldest = usage.keys().next().value;
      if (oldest) usage.delete(oldest);
    }
  }
  // Reset expired windows
  if (now >= record.minuteReset) {
    record.minuteCount = 0;
    record.minuteReset = now + 60000;
  }
  if (now >= record.hourReset) {
    record.hourCount = 0;
    record.hourReset = now + 3600000;
  }
  if (now >= record.dayReset) {
    record.dayCount = 0;
    record.dayReset = now + 86400000;
  }
  record.tier = tier;
  return record;
}

export function checkRateLimit(
  key: string,
  tier: ApiTier,
): { allowed: boolean; remaining: number; resetIn: number; limit: number } {
  const record = getOrCreate(key, tier);
  const limits = TIER_LIMITS[tier];

  record.minuteCount++;
  record.hourCount++;
  record.dayCount++;

  if (record.minuteCount > limits.requestsPerMinute) {
    tierRLLog.warn(`Rate limit exceeded (minute): ${key} tier=${tier}`);
    return { allowed: false, remaining: 0, resetIn: record.minuteReset - Date.now(), limit: limits.requestsPerMinute };
  }
  if (record.hourCount > limits.requestsPerHour) {
    return { allowed: false, remaining: 0, resetIn: record.hourReset - Date.now(), limit: limits.requestsPerHour };
  }
  if (record.dayCount > limits.requestsPerDay) {
    return { allowed: false, remaining: 0, resetIn: record.dayReset - Date.now(), limit: limits.requestsPerDay };
  }

  const remaining = limits.requestsPerMinute - record.minuteCount;
  return { allowed: true, remaining: Math.max(0, remaining), resetIn: record.minuteReset - Date.now(), limit: limits.requestsPerMinute };
}

export function getUsage(key: string): UsageRecord | null {
  return usage.get(key) || null;
}

export function getTierLimits(tier: ApiTier): TierLimits {
  return { ...TIER_LIMITS[tier] };
}

export function getAllTierLimits(): Record<ApiTier, TierLimits> {
  return JSON.parse(JSON.stringify(TIER_LIMITS));
}

export function getUsageStats(): { totalTracked: number; byTier: Record<string, number> } {
  const byTier: Record<string, number> = { free: 0, pro: 0, enterprise: 0, admin: 0 };
  for (const record of usage.values()) {
    byTier[record.tier] = (byTier[record.tier] || 0) + 1;
  }
  return { totalTracked: usage.size, byTier };
}

export function clearUsage(): void {
  usage.clear();
}
