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
  | "featured_purchased";

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
