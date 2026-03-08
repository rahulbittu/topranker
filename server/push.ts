/**
 * Server-side push notification sender.
 * Uses Expo Push API to deliver notifications to registered devices.
 *
 * In development: logs to console.
 * In production: sends via https://exp.host/--/api/v2/push/send
 */

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

  const messages: ExpoPushMessage[] = tokens.map((token) => ({
    to: token,
    title,
    body,
    data,
    sound: "default",
    channelId: "default",
  }));

  // In development, log instead of sending
  if (process.env.NODE_ENV !== "production") {
    console.log("[Push] DEV MODE — would send:", JSON.stringify(messages, null, 2));
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
    console.error("[Push] Failed to send:", err);
    return messages.map(() => ({ status: "error" as const, message: String(err) }));
  }
}

/**
 * Send a rating response notification to a user.
 */
export async function notifyRatingResponse(
  userToken: string,
  businessName: string,
  ownerReply: string,
): Promise<void> {
  const truncated = ownerReply.length > 80 ? ownerReply.slice(0, 80) + "..." : ownerReply;
  await sendPushNotification(
    [userToken],
    `${businessName} replied to your rating`,
    truncated,
    { screen: "business" },
  );
}

/**
 * Send a tier upgrade notification.
 */
export async function notifyTierUpgrade(
  userToken: string,
  newTier: string,
): Promise<void> {
  await sendPushNotification(
    [userToken],
    "You've been promoted!",
    `Your credibility just reached ${newTier} tier. Your ratings now carry more weight.`,
    { screen: "profile" },
  );
}

/**
 * Send challenger result notifications to all followers.
 */
export async function notifyChallengerResult(
  followerTokens: string[],
  winnerName: string,
  category: string,
): Promise<void> {
  await sendPushNotification(
    followerTokens,
    `${category} Challenge ended`,
    `${winnerName} wins! See the final results and stats.`,
    { screen: "challenger" },
  );
}

/**
 * Send new challenger notification to city subscribers.
 */
export async function notifyNewChallenger(
  cityTokens: string[],
  defenderName: string,
  challengerName: string,
  category: string,
): Promise<void> {
  await sendPushNotification(
    cityTokens,
    `New ${category} Challenge`,
    `${defenderName} vs ${challengerName} — 30 days, weighted votes decide.`,
    { screen: "challenger" },
  );
}
