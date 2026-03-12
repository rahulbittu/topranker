import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

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

export type NotificationType =
  | "tier_upgrade"         // You reached a new credibility tier
  | "challenger_result"    // A challenge you followed ended
  | "challenger_started"   // New challenge in your city
  | "weekly_digest"        // Your weekly activity summary
  | "drip_reminder";       // Re-engagement nudge

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

  // Sprint 672: Multi-channel Android notification categories
  if (Platform.OS === "android") {
    await Promise.all([
      Notifications.setNotificationChannelAsync("default", {
        name: "General",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#C49A1A",
      }),
      Notifications.setNotificationChannelAsync("tier_upgrade", {
        name: "Tier Promotions",
        description: "When your credibility tier increases",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 200, 100, 200],
        lightColor: "#C49A1A",
      }),
      Notifications.setNotificationChannelAsync("challenger", {
        name: "Challenges",
        description: "New challenges and results",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#C49A1A",
      }),
      Notifications.setNotificationChannelAsync("digest", {
        name: "Weekly Digest",
        description: "Your weekly activity summary",
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 150],
        lightColor: "#C49A1A",
      }),
      Notifications.setNotificationChannelAsync("reminders", {
        name: "Reminders",
        description: "Re-engagement reminders",
        importance: Notifications.AndroidImportance.LOW,
        lightColor: "#C49A1A",
      }),
    ]);
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

// Sprint 672: Map notification types to Android channel IDs
export const NOTIFICATION_CHANNEL_MAP: Record<NotificationType, string> = {
  tier_upgrade: "tier_upgrade",
  challenger_result: "challenger",
  challenger_started: "challenger",
  weekly_digest: "digest",
  drip_reminder: "reminders",
};

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
} as const;
