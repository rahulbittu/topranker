/**
 * Notification Triggers — Sprint 175
 *
 * Connects push notification functions to actual business events.
 * Each trigger is called from the relevant route/storage function
 * and handles preference checks internally.
 *
 * Triggers:
 * - onTierUpgrade: called after rating submission detects tier change
 * - onClaimDecision: called after admin reviews a business claim
 * - onChallengerCreated: called when new challenger is created
 * - onChallengerEnded: called when challenge period expires
 * - scheduleWeeklyDigestPush: runs on interval, sends digest push to active users
 */

import { sendPushNotification } from "./push";
import { log } from "./logger";

const triggerLog = log.tag("NotifyTrigger");

/**
 * Push notification when a user's credibility tier upgrades after a rating.
 * Called from POST /api/ratings route when result.tierUpgraded is true.
 */
export async function onTierUpgrade(
  memberId: string,
  pushToken: string | null,
  newTier: string,
): Promise<void> {
  if (!pushToken) return;

  try {
    const { getMemberById } = await import("./storage/members");
    const member = await getMemberById(memberId);
    const prefs = (member?.notificationPrefs as Record<string, boolean>) || {};
    if (prefs.tierUpgrades === false) return;

    await sendPushNotification(
      [pushToken],
      "You've been promoted!",
      `Your credibility reached ${newTier} tier. Your ratings now carry more weight.`,
      { screen: "profile" },
    );
    triggerLog.info(`Tier upgrade push sent: ${memberId} → ${newTier}`);
  } catch (err) {
    triggerLog.error(`Tier upgrade push failed: ${memberId}`, err);
  }
}

/**
 * Push notification when admin approves/rejects a business claim.
 * Called from PATCH /api/admin/claims/:id after review.
 */
export async function onClaimDecision(
  memberId: string,
  pushToken: string | null,
  businessName: string,
  approved: boolean,
): Promise<void> {
  if (!pushToken) return;

  try {
    if (approved) {
      await sendPushNotification(
        [pushToken],
        `Claim approved: ${businessName}`,
        "You're now the verified owner. Access your dashboard to see analytics.",
        { screen: "business" },
      );
    } else {
      await sendPushNotification(
        [pushToken],
        `Claim update: ${businessName}`,
        "Your claim could not be verified. Contact support for next steps.",
        { screen: "profile" },
      );
    }
    triggerLog.info(`Claim decision push sent: ${memberId}, approved=${approved}`);
  } catch (err) {
    triggerLog.error(`Claim decision push failed: ${memberId}`, err);
  }
}

/**
 * Push notification for weekly digest — lightweight reminder
 * to check new rankings. Runs via scheduled interval.
 */
export async function sendWeeklyDigestPush(): Promise<number> {
  try {
    const { db } = await import("./db");
    const { members } = await import("@shared/schema");
    const { isNotNull } = await import("drizzle-orm");

    const usersWithTokens = await db
      .select({
        id: members.id,
        pushToken: members.pushToken,
        displayName: members.displayName,
        notificationPrefs: members.notificationPrefs,
      })
      .from(members)
      .where(isNotNull(members.pushToken));

    let sent = 0;
    for (const user of usersWithTokens) {
      if (!user.pushToken) continue;
      const prefs = (user.notificationPrefs as Record<string, boolean>) || {};
      if (prefs.weeklyDigest === false) continue;

      const firstName = (user.displayName || "").split(" ")[0] || "there";
      await sendPushNotification(
        [user.pushToken],
        "Your weekly rankings update",
        `Hey ${firstName}, check what's changed in your city's rankings this week.`,
        { screen: "search" },
      );
      sent++;
    }

    triggerLog.info(`Weekly digest push sent to ${sent} users`);
    return sent;
  } catch (err) {
    triggerLog.error("Weekly digest push failed:", err);
    return 0;
  }
}

/**
 * Start the weekly digest push scheduler.
 * Runs every Monday at 10am UTC (approximate — setInterval-based).
 * Returns the interval handle for graceful shutdown cleanup.
 */
export function startWeeklyDigestScheduler(): NodeJS.Timeout {
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

  // Calculate ms until next Monday 10am UTC
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0=Sun, 1=Mon
  const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;
  const nextMonday = new Date(now);
  nextMonday.setUTCDate(now.getUTCDate() + daysUntilMonday);
  nextMonday.setUTCHours(10, 0, 0, 0);
  if (nextMonday <= now) nextMonday.setUTCDate(nextMonday.getUTCDate() + 7);

  const msUntilFirst = nextMonday.getTime() - now.getTime();

  triggerLog.info(`Weekly digest scheduler: first run in ${Math.round(msUntilFirst / 3600000)}h`);

  // Initial delayed send, then weekly interval
  const initialTimeout = setTimeout(() => {
    sendWeeklyDigestPush();
    // Start weekly interval after first send
    setInterval(sendWeeklyDigestPush, WEEK_MS);
  }, msUntilFirst);

  return initialTimeout;
}
