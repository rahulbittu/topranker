/**
 * Server-side push notification sender.
 * Uses Expo Push API to deliver notifications to registered devices.
 *
 * In development: logs to console.
 * In production: sends via https://exp.host/--/api/v2/push/send
 */
import { log } from "./logger";
import { getChannelId } from "../shared/notification-channels";

const pushLog = log.tag("Push");

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  sound?: "default" | null;
  badge?: number;
  channelId?: string;
}

interface ExpoPushTicket {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: { error: string };
}

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

/**
 * Send a push notification to one or more Expo push tokens.
 */
export async function sendPushNotification(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<ExpoPushTicket[]> {
  if (tokens.length === 0) return [];

  // Sprint 676: Use shared channel map (single source of truth)
  const channelId = getChannelId(data?.type || "");

  const messages: ExpoPushMessage[] = tokens.map((token) => ({
    to: token,
    title,
    body,
    data,
    sound: channelId === "reminders" ? null : "default",
    channelId,
  }));

  // In development, log instead of sending
  if (process.env.NODE_ENV !== "production") {
    pushLog.debug("DEV MODE — would send:", messages);
    return messages.map(() => ({ status: "ok" as const, id: `dev-${Date.now()}` }));
  }

  try {
    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();
    return result.data as ExpoPushTicket[];
  } catch (err) {
    pushLog.error("Failed to send:", err);
    return messages.map(() => ({ status: "error" as const, message: String(err) }));
  }
}

/**
 * Sprint 182: Create in-app notification record alongside push.
 * Fire-and-forget — doesn't block push delivery.
 */
async function persistNotification(
  memberId: string,
  type: string,
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<void> {
  try {
    const { createNotification } = await import("./storage/notifications");
    await createNotification({ memberId, type, title, body, data });
  } catch (err) {
    pushLog.error(`Failed to persist notification for ${memberId}: ${err}`);
  }
}

/**
 * Send a tier upgrade notification.
 */
export async function notifyTierUpgrade(
  userId: string,
  userToken: string,
  newTier: string,
): Promise<void> {
  // Before sending, check user's notification preferences
  const { getMemberById } = await import("./storage/members");
  const member = await getMemberById(userId);
  const prefs = (member?.notificationPrefs as Record<string, boolean>) || {};
  if (prefs.tierUpgrades === false) return; // user opted out

  const title = "You've been promoted!";
  const body = `Your credibility just reached ${newTier} tier. Your ratings now carry more weight.`;
  await sendPushNotification([userToken], title, body, { screen: "profile" });
  persistNotification(userId, "tier_upgrade", title, body, { screen: "profile" });
}

/**
 * Send challenger result notifications to all followers.
 */
export async function notifyChallengerResult(
  followerIds: string[],
  followerTokens: string[],
  winnerName: string,
  category: string,
): Promise<void> {
  // Before sending, check each user's notification preferences
  const { getMemberById } = await import("./storage/members");
  const filteredTokens: string[] = [];
  const eligibleFollowerIds: string[] = [];
  for (let i = 0; i < followerIds.length; i++) {
    const member = await getMemberById(followerIds[i]);
    const prefs = (member?.notificationPrefs as Record<string, boolean>) || {};
    if (prefs.challengerResults === false) continue; // user opted out
    filteredTokens.push(followerTokens[i]);
    eligibleFollowerIds.push(followerIds[i]);
  }
  if (filteredTokens.length === 0) return;

  const title = `${category} Challenge ended`;
  const body = `${winnerName} wins! See the final results and stats.`;
  await sendPushNotification(filteredTokens, title, body, { screen: "challenger" });
  // Persist for each eligible recipient
  for (const uid of eligibleFollowerIds) {
    persistNotification(uid, "challenger_result", title, body, { screen: "challenger" });
  }
}

/**
 * Send new challenger notification to city subscribers.
 */
export async function notifyNewChallenger(
  cityUserIds: string[],
  cityTokens: string[],
  defenderName: string,
  challengerName: string,
  category: string,
): Promise<void> {
  // Before sending, check each user's notification preferences
  const { getMemberById } = await import("./storage/members");
  const filteredTokens: string[] = [];
  const eligibleUserIds: string[] = [];
  for (let i = 0; i < cityUserIds.length; i++) {
    const member = await getMemberById(cityUserIds[i]);
    const prefs = (member?.notificationPrefs as Record<string, boolean>) || {};
    if (prefs.newChallengers === false) continue; // user opted out
    filteredTokens.push(cityTokens[i]);
    eligibleUserIds.push(cityUserIds[i]);
  }
  if (filteredTokens.length === 0) return;

  const title = `New ${category} Challenge`;
  const body = `${defenderName} vs ${challengerName} — 30 days, weighted votes decide.`;
  await sendPushNotification(filteredTokens, title, body, { screen: "challenger" });
  // Persist for each eligible recipient
  for (const uid of eligibleUserIds) {
    persistNotification(uid, "new_challenger", title, body, { screen: "challenger" });
  }
}
