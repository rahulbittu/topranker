/**
 * Sprint 492: Push Notification Analytics
 *
 * In-memory analytics for push notification delivery tracking.
 * Tracks: total sent, success/error counts, category breakdown,
 * hourly volume, and per-city delivery stats.
 *
 * Designed for the admin dashboard to show push delivery health.
 * Resets on server restart (in-memory for MVP — persistent storage later).
 */
import { log } from "./logger";

const analyticsLog = log.tag("PushAnalytics");

export interface PushDeliveryRecord {
  category: string;
  city: string;
  tokenCount: number;
  successCount: number;
  errorCount: number;
  timestamp: number;
}

export interface PushAnalyticsSummary {
  totalSent: number;
  totalSuccess: number;
  totalError: number;
  successRate: number;
  byCategory: Record<string, { sent: number; success: number; error: number }>;
  byCity: Record<string, { sent: number; success: number; error: number }>;
  hourlyVolume: { hour: string; count: number }[];
  recentDeliveries: PushDeliveryRecord[];
}

// In-memory store
const deliveryRecords: PushDeliveryRecord[] = [];
const MAX_RECORDS = 10000;

/**
 * Record a push notification delivery attempt.
 * Called after sendPushNotification returns tickets.
 */
export function recordPushDelivery(
  category: string,
  city: string,
  tokenCount: number,
  successCount: number,
  errorCount: number,
): void {
  const record: PushDeliveryRecord = {
    category,
    city,
    tokenCount,
    successCount,
    errorCount,
    timestamp: Date.now(),
  };

  deliveryRecords.push(record);

  // Evict oldest records if over limit
  if (deliveryRecords.length > MAX_RECORDS) {
    deliveryRecords.splice(0, deliveryRecords.length - MAX_RECORDS);
  }

  analyticsLog.info(
    `Push delivery: ${category}/${city} — ${successCount}/${tokenCount} success, ${errorCount} errors`
  );
}

/**
 * Compute push analytics summary from in-memory records.
 * Optionally filter by time range (default: last 7 days).
 */
export function computePushAnalytics(daysBack: number = 7): PushAnalyticsSummary {
  const cutoff = Date.now() - daysBack * 86400000;
  const filtered = deliveryRecords.filter(r => r.timestamp >= cutoff);

  let totalSent = 0;
  let totalSuccess = 0;
  let totalError = 0;
  const byCategory: Record<string, { sent: number; success: number; error: number }> = {};
  const byCity: Record<string, { sent: number; success: number; error: number }> = {};
  const hourBuckets: Record<string, number> = {};

  for (const r of filtered) {
    totalSent += r.tokenCount;
    totalSuccess += r.successCount;
    totalError += r.errorCount;

    // Category aggregation
    if (!byCategory[r.category]) byCategory[r.category] = { sent: 0, success: 0, error: 0 };
    byCategory[r.category].sent += r.tokenCount;
    byCategory[r.category].success += r.successCount;
    byCategory[r.category].error += r.errorCount;

    // City aggregation
    if (!byCity[r.city]) byCity[r.city] = { sent: 0, success: 0, error: 0 };
    byCity[r.city].sent += r.tokenCount;
    byCity[r.city].success += r.successCount;
    byCity[r.city].error += r.errorCount;

    // Hourly volume (ISO date hour)
    const hourKey = new Date(r.timestamp).toISOString().slice(0, 13);
    hourBuckets[hourKey] = (hourBuckets[hourKey] || 0) + r.tokenCount;
  }

  const hourlyVolume = Object.entries(hourBuckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([hour, count]) => ({ hour, count }));

  const recentDeliveries = filtered.slice(-20).reverse();

  const successRate = totalSent > 0 ? Math.round((totalSuccess / totalSent) * 1000) / 10 : 0;

  return {
    totalSent,
    totalSuccess,
    totalError,
    successRate,
    byCategory,
    byCity,
    hourlyVolume,
    recentDeliveries,
  };
}

/**
 * Get raw record count (for health checks).
 */
export function getPushRecordCount(): number {
  return deliveryRecords.length;
}

// ── Sprint 499: Notification Open Tracking ──────────────────

export interface NotificationOpenRecord {
  notificationId: string;
  category: string;
  memberId: string;
  openedAt: number;
}

const openRecords: NotificationOpenRecord[] = [];
const MAX_OPEN_RECORDS = 10000;

/**
 * Record when a user opens/taps a push notification.
 * Called from the client via POST /api/notifications/opened.
 */
export function recordNotificationOpen(
  notificationId: string,
  category: string,
  memberId: string,
): void {
  const record: NotificationOpenRecord = {
    notificationId,
    category,
    memberId,
    openedAt: Date.now(),
  };

  openRecords.push(record);

  if (openRecords.length > MAX_OPEN_RECORDS) {
    openRecords.splice(0, openRecords.length - MAX_OPEN_RECORDS);
  }

  analyticsLog.info(`Notification opened: ${category} by member ${memberId.slice(0, 8)}`);
}

/**
 * Compute notification open analytics.
 * Returns open counts by category and recent opens.
 */
export function computeOpenAnalytics(daysBack: number = 7): {
  totalOpens: number;
  byCategory: Record<string, number>;
  uniqueMembers: number;
  recentOpens: NotificationOpenRecord[];
} {
  const cutoff = Date.now() - daysBack * 86400000;
  const filtered = openRecords.filter(r => r.openedAt >= cutoff);

  const byCategory: Record<string, number> = {};
  const memberSet = new Set<string>();

  for (const r of filtered) {
    byCategory[r.category] = (byCategory[r.category] || 0) + 1;
    memberSet.add(r.memberId);
  }

  return {
    totalOpens: filtered.length,
    byCategory,
    uniqueMembers: memberSet.size,
    recentOpens: filtered.slice(-20).reverse(),
  };
}

/**
 * Get combined delivery + open analytics for admin dashboard.
 */
export function getNotificationInsights(daysBack: number = 7): {
  delivery: PushAnalyticsSummary;
  opens: ReturnType<typeof computeOpenAnalytics>;
  openRate: number;
} {
  const delivery = computePushAnalytics(daysBack);
  const opens = computeOpenAnalytics(daysBack);
  const openRate = delivery.totalSent > 0
    ? Math.round((opens.totalOpens / delivery.totalSent) * 1000) / 10
    : 0;
  return { delivery, opens, openRate };
}

/**
 * Get open record count (for health checks).
 */
export function getOpenRecordCount(): number {
  return openRecords.length;
}
