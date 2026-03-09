/**
 * Analytics / Conversion Funnel Tracking — Sprint 110
 * Tracks user progression through key conversion events.
 * Owner: Rachel Wei (CFO)
 */
import { log } from "./logger";

const analyticsLog = log.tag("Analytics");

export type FunnelEvent =
  | "page_view"
  | "signup_started"
  | "signup_completed"
  | "first_rating"
  | "fifth_rating"
  | "tier_upgrade"
  | "challenger_viewed"
  | "challenger_entered"
  | "dashboard_pro_viewed"
  | "dashboard_pro_subscribed"
  | "featured_viewed"
  | "featured_purchased"
  | "rating_submitted"
  | "rating_rejected_account_age"
  | "rating_rejected_duplicate"
  | "rating_rejected_suspended"
  | "rating_rejected_validation"
  | "rating_rejected_unknown";

interface FunnelEntry {
  event: FunnelEvent;
  userId?: string;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

// In-memory buffer — flush to storage/analytics service periodically
const buffer: FunnelEntry[] = [];
const MAX_BUFFER = 1000;

export function trackEvent(event: FunnelEvent, userId?: string, metadata?: Record<string, unknown>) {
  const entry: FunnelEntry = {
    event,
    userId,
    metadata,
    timestamp: Date.now(),
  };

  buffer.push(entry);
  analyticsLog.info(`${event}${userId ? ` [${userId}]` : ""}`);

  // Prevent unbounded growth
  if (buffer.length > MAX_BUFFER) {
    buffer.splice(0, buffer.length - MAX_BUFFER);
  }
}

/** Get funnel stats — counts per event type */
export function getFunnelStats(): Record<FunnelEvent, number> {
  const stats = {} as Record<FunnelEvent, number>;
  for (const entry of buffer) {
    stats[entry.event] = (stats[entry.event] || 0) + 1;
  }
  return stats;
}

/** Get recent events for debugging */
export function getRecentEvents(limit = 50): FunnelEntry[] {
  return buffer.slice(-limit);
}

/** Get rate gate rejection stats — counts by rejection reason */
export function getRateGateStats(): {
  totalSubmissions: number;
  totalRejections: number;
  rejectionRate: string;
  byReason: Record<string, number>;
  recentRejections: FunnelEntry[];
} {
  const rejectionEvents = [
    "rating_rejected_account_age",
    "rating_rejected_duplicate",
    "rating_rejected_suspended",
    "rating_rejected_validation",
    "rating_rejected_unknown",
  ] as const;

  const submissions = buffer.filter((e) => e.event === "rating_submitted").length;
  const rejections = buffer.filter((e) =>
    (rejectionEvents as readonly string[]).includes(e.event),
  );

  const byReason: Record<string, number> = {};
  for (const r of rejections) {
    byReason[r.event] = (byReason[r.event] || 0) + 1;
  }

  const total = submissions + rejections.length;
  return {
    totalSubmissions: submissions,
    totalRejections: rejections.length,
    rejectionRate: total > 0 ? ((rejections.length / total) * 100).toFixed(1) + "%" : "0%",
    byReason,
    recentRejections: rejections.slice(-20),
  };
}

/** Clear buffer (for testing) */
export function clearAnalytics() {
  buffer.length = 0;
}

/** Flush buffer to persistent storage (call periodically) */
export type FlushHandler = (entries: FunnelEntry[]) => Promise<void>;

let flushHandler: FlushHandler | null = null;
let flushInterval: ReturnType<typeof setInterval> | null = null;

/** Register a handler to persist analytics events */
export function setFlushHandler(handler: FlushHandler, intervalMs = 30_000) {
  flushHandler = handler;
  if (flushInterval) clearInterval(flushInterval);
  flushInterval = setInterval(async () => {
    if (buffer.length === 0 || !flushHandler) return;
    const batch = buffer.splice(0, buffer.length);
    try {
      await flushHandler(batch);
      analyticsLog.info(`Flushed ${batch.length} analytics events`);
    } catch (err) {
      // On failure, put events back
      buffer.unshift(...batch);
      analyticsLog.error(`Flush failed, ${batch.length} events re-queued`);
    }
  }, intervalMs);
}

/** Stop periodic flushing */
export function stopFlush() {
  if (flushInterval) {
    clearInterval(flushInterval);
    flushInterval = null;
  }
}
