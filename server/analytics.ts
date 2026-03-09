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
  | "rating_rejected_unknown"
  // Sprint 199: Beta conversion events
  | "beta_invite_sent"
  | "beta_join_page_view"
  | "beta_signup_completed"
  | "beta_first_rating"
  | "beta_referral_shared";

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

// ── Sprint 199: Time-Bucketed Analytics ─────────────────────

/** Get events bucketed by hour for the last N hours */
export function getHourlyStats(hours = 24): Array<{
  hour: string;
  events: number;
  byType: Record<string, number>;
}> {
  const now = Date.now();
  const cutoff = now - hours * 60 * 60 * 1000;
  const filtered = buffer.filter((e) => e.timestamp >= cutoff);

  const buckets = new Map<string, { events: number; byType: Record<string, number> }>();

  for (const entry of filtered) {
    const d = new Date(entry.timestamp);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:00`;
    if (!buckets.has(key)) {
      buckets.set(key, { events: 0, byType: {} });
    }
    const bucket = buckets.get(key)!;
    bucket.events++;
    bucket.byType[entry.event] = (bucket.byType[entry.event] || 0) + 1;
  }

  return Array.from(buckets.entries())
    .map(([hour, data]) => ({ hour, ...data }))
    .sort((a, b) => a.hour.localeCompare(b.hour));
}

/** Get daily stats for the last N days */
export function getDailyStats(days = 7): Array<{
  date: string;
  events: number;
  uniqueUsers: number;
  byType: Record<string, number>;
}> {
  const now = Date.now();
  const cutoff = now - days * 24 * 60 * 60 * 1000;
  const filtered = buffer.filter((e) => e.timestamp >= cutoff);

  const buckets = new Map<string, { events: number; users: Set<string>; byType: Record<string, number> }>();

  for (const entry of filtered) {
    const d = new Date(entry.timestamp);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!buckets.has(key)) {
      buckets.set(key, { events: 0, users: new Set(), byType: {} });
    }
    const bucket = buckets.get(key)!;
    bucket.events++;
    if (entry.userId) bucket.users.add(entry.userId);
    bucket.byType[entry.event] = (bucket.byType[entry.event] || 0) + 1;
  }

  return Array.from(buckets.entries())
    .map(([date, data]) => ({ date, events: data.events, uniqueUsers: data.users.size, byType: data.byType }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ── Sprint 199: Active User Tracking ────────────────────────

const activeUsers = new Map<string, number>(); // userId → lastSeen timestamp

/** Record user activity (call on each authenticated request) */
export function recordUserActivity(userId: string) {
  activeUsers.set(userId, Date.now());
}

/** Get active user counts by time window */
export function getActiveUserStats(): {
  last1h: number;
  last24h: number;
  last7d: number;
  last30d: number;
} {
  const now = Date.now();
  let last1h = 0, last24h = 0, last7d = 0, last30d = 0;

  for (const [, lastSeen] of activeUsers) {
    const age = now - lastSeen;
    if (age < 60 * 60 * 1000) last1h++;
    if (age < 24 * 60 * 60 * 1000) last24h++;
    if (age < 7 * 24 * 60 * 60 * 1000) last7d++;
    if (age < 30 * 24 * 60 * 60 * 1000) last30d++;
  }

  return { last1h, last24h, last7d, last30d };
}

// ── Sprint 199: Beta Conversion Funnel ──────────────────────

/** Get beta-specific conversion funnel */
export function getBetaConversionFunnel(): {
  invitesSent: number;
  joinPageViews: number;
  signups: number;
  firstRatings: number;
  referralsShared: number;
  conversionRates: {
    inviteToView: string;
    viewToSignup: string;
    signupToRating: string;
    overallInviteToRating: string;
  };
} {
  const invitesSent = buffer.filter((e) => e.event === "beta_invite_sent").length;
  const joinPageViews = buffer.filter((e) => e.event === "beta_join_page_view").length;
  const signups = buffer.filter((e) => e.event === "beta_signup_completed").length;
  const firstRatings = buffer.filter((e) => e.event === "beta_first_rating").length;
  const referralsShared = buffer.filter((e) => e.event === "beta_referral_shared").length;

  const pct = (n: number, d: number) => d > 0 ? ((n / d) * 100).toFixed(1) + "%" : "N/A";

  return {
    invitesSent,
    joinPageViews,
    signups,
    firstRatings,
    referralsShared,
    conversionRates: {
      inviteToView: pct(joinPageViews, invitesSent),
      viewToSignup: pct(signups, joinPageViews),
      signupToRating: pct(firstRatings, signups),
      overallInviteToRating: pct(firstRatings, invitesSent),
    },
  };
}
