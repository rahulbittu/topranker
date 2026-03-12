/**
 * Sprint 676: Shared notification channel configuration.
 * Single source of truth for Android notification channels and type mappings.
 * Used by both client (lib/notifications.ts) and server (server/push.ts).
 */

export type NotificationType =
  | "tier_upgrade"
  | "challenger_result"
  | "challenger_started"
  | "weekly_digest"
  | "drip_reminder"
  | "rating_reminder";

export interface NotificationChannel {
  id: string;
  name: string;
  description: string;
  importance: "HIGH" | "DEFAULT" | "LOW";
  sound: boolean;
}

export const NOTIFICATION_CHANNELS: NotificationChannel[] = [
  { id: "default", name: "General", description: "General notifications", importance: "HIGH", sound: true },
  { id: "tier_upgrade", name: "Tier Promotions", description: "When your credibility tier increases", importance: "HIGH", sound: true },
  { id: "challenger", name: "Challenges", description: "New challenges and results", importance: "HIGH", sound: true },
  { id: "digest", name: "Weekly Digest", description: "Your weekly activity summary", importance: "DEFAULT", sound: true },
  { id: "reminders", name: "Reminders", description: "Rating and re-engagement reminders", importance: "LOW", sound: false },
];

/**
 * Map notification type to Android channel ID.
 */
export const NOTIFICATION_TYPE_TO_CHANNEL: Record<NotificationType, string> = {
  tier_upgrade: "tier_upgrade",
  challenger_result: "challenger",
  challenger_started: "challenger",
  weekly_digest: "digest",
  drip_reminder: "reminders",
  rating_reminder: "reminders",
};

/**
 * Get channel ID for a notification type. Falls back to "default".
 */
export function getChannelId(type: string): string {
  return NOTIFICATION_TYPE_TO_CHANNEL[type as NotificationType] || "default";
}
