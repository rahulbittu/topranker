import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { NOTIFICATION_CHANNELS, type NotificationType } from "@/shared/notification-channels";
export type { NotificationType } from "@/shared/notification-channels";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PushNotification {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * Register for push notifications and return the Expo push token.
 * Returns null if notifications are not available (simulator, web, denied).
 */
export async function registerForPushNotifications(): Promise<string | null> {
  // Must be a physical device
  if (!Device.isDevice) {
    console.log("[Notifications] Push notifications require a physical device");
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request if not determined
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("[Notifications] Permission not granted");
    return null;
  }

  // Sprint 676: Android channels from shared config (single source of truth)
  if (Platform.OS === "android") {
    const importanceMap = {
      HIGH: Notifications.AndroidImportance.HIGH,
      DEFAULT: Notifications.AndroidImportance.DEFAULT,
      LOW: Notifications.AndroidImportance.LOW,
    };
    await Promise.all(
      NOTIFICATION_CHANNELS.map((ch) =>
        Notifications.setNotificationChannelAsync(ch.id, {
          name: ch.name,
          description: ch.description,
          importance: importanceMap[ch.importance],
          lightColor: "#C49A1A",
        }),
      ),
    );
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: "30a52864-563f-440f-baf2-842c37fb757c",
    });
    return tokenData.data;
  } catch (err) {
    console.error("[Notifications] Token registration failed:", err);
    return null;
  }
}

/**
 * Schedule a local notification (for testing or local reminders).
 */
export async function scheduleLocalNotification(
  notification: PushNotification,
  delaySeconds: number = 0,
): Promise<string> {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title: notification.title,
      body: notification.body,
      data: { type: notification.type, ...notification.data },
      sound: "default",
    },
    trigger: delaySeconds > 0
      ? { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: delaySeconds }
      : null,
  });
}

/**
 * Cancel all scheduled notifications.
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get the badge count.
 */
export async function getBadgeCount(): Promise<number> {
  return await Notifications.getBadgeCountAsync();
}

/**
 * Set the badge count.
 */
export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

// Sprint 676: Re-export channel map from shared (single source of truth)
export { NOTIFICATION_TYPE_TO_CHANNEL as NOTIFICATION_CHANNEL_MAP } from "@/shared/notification-channels";

// Sprint 672: Valid deep link screens for notification tap handling
export const VALID_DEEP_LINK_SCREENS = [
  "business", "challenger", "profile", "search", "dish",
] as const;

export type DeepLinkScreen = typeof VALID_DEEP_LINK_SCREENS[number];

export function isValidDeepLinkScreen(screen: unknown): screen is DeepLinkScreen {
  return typeof screen === "string" && VALID_DEEP_LINK_SCREENS.includes(screen as DeepLinkScreen);
}

// Notification templates
export const NOTIFICATION_TEMPLATES = {
  tierUpgrade: (newTier: string): PushNotification => ({
    type: "tier_upgrade",
    title: "You've been promoted!",
    body: `Your credibility just reached ${newTier} tier. Your ratings now carry more weight.`,
    data: { screen: "profile" },
  }),

  challengerResult: (winnerName: string, category: string): PushNotification => ({
    type: "challenger_result",
    title: `${category} Challenge ended`,
    body: `${winnerName} wins! See the final results and stats.`,
    data: { screen: "challenger" },
  }),

  challengerStarted: (defenderName: string, challengerName: string, category: string): PushNotification => ({
    type: "challenger_started",
    title: `New ${category} Challenge`,
    body: `${defenderName} vs ${challengerName} — 30 days, weighted votes decide.`,
    data: { screen: "challenger" },
  }),

  weeklyDigest: (ratingsCount: number, city: string): PushNotification => ({
    type: "weekly_digest",
    title: "Your week on TopRanker",
    body: `You rated ${ratingsCount} businesses in ${city} this week. See your impact.`,
    data: { screen: "profile" },
  }),

  dripReminder: (daysSinceLastVisit: number): PushNotification => ({
    type: "drip_reminder",
    title: "Your neighborhood misses you",
    body: "New businesses and live challenges are waiting for your voice.",
    data: { screen: "search" },
  }),

  ratingReminder: (businessName: string, businessSlug: string): PushNotification => ({
    type: "rating_reminder",
    title: `How was ${businessName}?`,
    body: `You visited ${businessName} recently. Rate your experience and help others decide.`,
    data: { screen: "business", slug: businessSlug },
  }),
} as const;
