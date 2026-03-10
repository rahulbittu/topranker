/**
 * Sprint 518: Notification Frequency Settings
 *
 * Allows users to configure delivery frequency per notification category.
 * Supported frequencies: "realtime" (immediate), "daily" (batched at 9am UTC),
 * "weekly" (batched Monday 10am UTC, alongside digest).
 *
 * Categories supporting frequency: rankingChanges, newRatings, cityAlerts.
 * Other categories (tierUpgrades, claimUpdates, challengerResults) are always realtime.
 */

import { log } from "./logger";

const freqLog = log.tag("NotifFreq");

export type NotificationFrequency = "realtime" | "daily" | "weekly";

export interface FrequencyPrefs {
  rankingChanges: NotificationFrequency;
  newRatings: NotificationFrequency;
  cityAlerts: NotificationFrequency;
}

export const DEFAULT_FREQUENCY_PREFS: FrequencyPrefs = {
  rankingChanges: "realtime",
  newRatings: "realtime",
  cityAlerts: "realtime",
};

export const FREQUENCY_CATEGORIES = ["rankingChanges", "newRatings", "cityAlerts"] as const;

// ─── In-Memory Queue ─────────────────────────────────────────
// PERSISTENCE-AUDIT: Sprint 528 — RISK for daily/weekly batches.
// Migration path: notification_queue table (member_id, push_token, title, body, data jsonb, category, queued_at).
// Priority: HIGH when batch frequency is activated — a server restart loses
// all queued notifications. Currently acceptable because all users default to
// "realtime" and the queue is effectively empty.
// Trigger for migration: when ANY user sets a non-realtime frequency preference.

export interface QueuedNotification {
  memberId: string;
  pushToken: string;
  title: string;
  body: string;
  data: Record<string, string>;
  category: string;
  queuedAt: number;
}

/** Queued notifications grouped by memberId → category */
const queue = new Map<string, QueuedNotification[]>();

/**
 * Add a notification to the batch queue instead of sending immediately.
 */
export function enqueueNotification(notification: QueuedNotification): void {
  const key = `${notification.memberId}:${notification.category}`;
  const existing = queue.get(key) || [];
  existing.push(notification);
  queue.set(key, existing);
  freqLog.info(`Queued notification: member=${notification.memberId.slice(0, 8)} category=${notification.category} (${existing.length} in batch)`);
}

/**
 * Get all queued notifications for a specific frequency window.
 * Returns and clears the matching entries.
 */
export function drainQueue(maxAgeMs: number): QueuedNotification[] {
  const now = Date.now();
  const drained: QueuedNotification[] = [];

  for (const [key, items] of queue.entries()) {
    const ready = items.filter((n) => now - n.queuedAt >= maxAgeMs);
    if (ready.length > 0) {
      drained.push(...ready);
      const remaining = items.filter((n) => now - n.queuedAt < maxAgeMs);
      if (remaining.length === 0) {
        queue.delete(key);
      } else {
        queue.set(key, remaining);
      }
    }
  }

  if (drained.length > 0) {
    freqLog.info(`Drained ${drained.length} queued notifications`);
  }
  return drained;
}

/**
 * Get queue size for monitoring.
 */
export function getQueueSize(): number {
  let total = 0;
  for (const items of queue.values()) {
    total += items.length;
  }
  return total;
}

/**
 * Check if a notification should be sent immediately or queued.
 * Returns "send" if realtime, "queue" if should be batched.
 */
export function shouldSendImmediately(
  frequencyPrefs: Partial<FrequencyPrefs> | undefined,
  category: string,
): boolean {
  if (!frequencyPrefs) return true;
  const freq = (frequencyPrefs as Record<string, string>)[category];
  return !freq || freq === "realtime";
}

/**
 * Merge partial frequency prefs with defaults.
 */
export function resolveFrequencyPrefs(partial?: Partial<FrequencyPrefs>): FrequencyPrefs {
  return { ...DEFAULT_FREQUENCY_PREFS, ...partial };
}

/**
 * Send batched notifications as a summary digest.
 * Groups by member and sends one push per member with a count.
 */
export async function sendBatchedNotifications(notifications: QueuedNotification[]): Promise<number> {
  if (notifications.length === 0) return 0;

  const { sendPushNotification } = await import("./push");

  // Group by memberId
  const byMember = new Map<string, QueuedNotification[]>();
  for (const n of notifications) {
    const existing = byMember.get(n.memberId) || [];
    existing.push(n);
    byMember.set(n.memberId, existing);
  }

  let sent = 0;
  for (const [memberId, items] of byMember.entries()) {
    const token = items[0].pushToken;
    if (!token) continue;

    const count = items.length;
    const title = count === 1 ? items[0].title : `${count} updates while you were away`;
    const body = count === 1
      ? items[0].body
      : `You have ${count} ranking updates. Tap to see what changed.`;

    try {
      await sendPushNotification([token], title, body, { screen: "rankings" });
      sent++;
      freqLog.info(`Batch sent: member=${memberId.slice(0, 8)} count=${count}`);
    } catch (err) {
      freqLog.error(`Batch send failed: member=${memberId.slice(0, 8)}`, err);
    }
  }

  return sent;
}

// ─── Schedulers ──────────────────────────────────────────────

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/**
 * Start the daily batch sender (runs at 9am UTC).
 */
export function startDailyBatchScheduler(): NodeJS.Timeout {
  const now = new Date();
  const next9am = new Date(now);
  next9am.setUTCHours(9, 0, 0, 0);
  if (next9am <= now) next9am.setUTCDate(next9am.getUTCDate() + 1);

  const msUntilFirst = next9am.getTime() - now.getTime();
  freqLog.info(`Daily batch scheduler: first run in ${Math.round(msUntilFirst / HOUR_MS)}h`);

  const timeout = setTimeout(() => {
    const notifications = drainQueue(0);
    sendBatchedNotifications(notifications).catch(() => {});
    setInterval(() => {
      const batch = drainQueue(0);
      sendBatchedNotifications(batch).catch(() => {});
    }, DAY_MS);
  }, msUntilFirst);

  return timeout;
}
