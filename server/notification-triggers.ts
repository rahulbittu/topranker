/**
 * Notification Triggers — Sprint 175
 * Sprint 481: Added ranking change, saved business, and city highlights triggers
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
 * - onRankingChange: called after rank recalculation when position changes
 * - onNewRatingForBusiness: called after rating submission to notify other raters
 * - sendCityHighlightsPush: notable ranking shifts per city (weekly)
 */

import { sendPushNotification } from "./push";
import { recordPushDelivery } from "./push-analytics";
import { getNotificationVariant } from "./push-ab-testing";
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
      { screen: "profile", type: "tierUpgrade" },
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
    // Sprint 514: Check claimUpdates preference
    const { getMemberById } = await import("./storage/members");
    const member = await getMemberById(memberId);
    const prefs = (member?.notificationPrefs as Record<string, boolean>) || {};
    if (prefs.claimUpdates === false) return;

    if (approved) {
      await sendPushNotification(
        [pushToken],
        `Claim approved: ${businessName}`,
        "You're now the verified owner. Access your dashboard to see analytics.",
        { screen: "business", type: "claimDecision" },
      );
    } else {
      await sendPushNotification(
        [pushToken],
        `Claim update: ${businessName}`,
        "Your claim could not be verified. Contact support for next steps.",
        { screen: "profile", type: "claimDecision" },
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
        selectedCity: members.selectedCity,
      })
      .from(members)
      .where(isNotNull(members.pushToken));

    let sent = 0;
    for (const user of usersWithTokens) {
      if (!user.pushToken) continue;
      const prefs = (user.notificationPrefs as Record<string, boolean>) || {};
      if (prefs.weeklyDigest === false) continue;

      const firstName = (user.displayName || "").split(" ")[0] || "there";
      const city = (user as any).selectedCity || "your city";
      // Sprint 511: Check for A/B variant
      // Sprint 517: Added {city} template variable support
      const abVariant = getNotificationVariant(String(user.id), "weeklyDigest");
      const title = abVariant
        ? abVariant.variant.title.replace("{city}", city).replace("{firstName}", firstName)
        : "Your weekly rankings update";
      const body = abVariant
        ? abVariant.variant.body.replace("{firstName}", firstName).replace("{city}", city)
        : `Hey ${firstName}, check what's changed in your city's rankings this week.`;
      await sendPushNotification(
        [user.pushToken],
        title,
        body,
        { screen: "search", ...(abVariant ? { experimentId: abVariant.experimentId, variant: abVariant.variant.name } : {}) },
      );
      sent++;
    }

    triggerLog.info(`Weekly digest push sent to ${sent} users`);
    recordPushDelivery("weeklyDigest", "all", usersWithTokens.length, sent, usersWithTokens.length - sent);
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

/**
 * Sprint 648: Rating reminder push for inactive users.
 * Sends a nudge to users who haven't rated in 7+ days.
 * Runs daily at 6pm UTC (lunchtime in Dallas).
 */
export async function sendRatingReminderPush(): Promise<number> {
  try {
    const { db } = await import("./db");
    const { members, ratings } = await import("@shared/schema");
    const { isNotNull, sql, eq } = await import("drizzle-orm");

    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

    // Sprint 658: Batch query — LEFT JOIN to find inactive users in one query (eliminates N+1)
    const usersWithActivity = await db
      .select({
        id: members.id,
        pushToken: members.pushToken,
        displayName: members.displayName,
        notificationPrefs: members.notificationPrefs,
        selectedCity: members.selectedCity,
        recentRatingCount: sql<number>`count(${ratings.id})`.as("recentRatingCount"),
      })
      .from(members)
      .leftJoin(
        ratings,
        sql`${ratings.memberId} = ${members.id} AND ${ratings.createdAt} > ${sevenDaysAgo}`,
      )
      .where(isNotNull(members.pushToken))
      .groupBy(members.id);

    let sent = 0;
    for (const user of usersWithActivity) {
      if (!user.pushToken) continue;
      const prefs = (user.notificationPrefs as Record<string, boolean>) || {};
      if (prefs.ratingReminders === false) continue;
      if (user.recentRatingCount > 0) continue; // Active user, skip

      const firstName = (user.displayName || "").split(" ")[0] || "there";
      const city = (user as any).selectedCity || "your city";
      await sendPushNotification(
        [user.pushToken],
        "Your neighborhood misses you",
        `Hey ${firstName}, new restaurants and live challenges are waiting in ${city}. Rate your latest visit!`,
        { screen: "search", type: "ratingReminder" },
      );
      sent++;
    }

    triggerLog.info(`Rating reminder push sent to ${sent} inactive users`);
    recordPushDelivery("ratingReminder", "all", usersWithActivity.length, sent, usersWithActivity.length - sent);
    return sent;
  } catch (err) {
    triggerLog.error("Rating reminder push failed:", err);
    return 0;
  }
}

/**
 * Sprint 648: Start daily rating reminder scheduler.
 * Runs daily at 6pm UTC (12pm CST — lunchtime in Dallas).
 */
export function startRatingReminderScheduler(): NodeJS.Timeout {
  const DAY_MS = 24 * 60 * 60 * 1000;

  const now = new Date();
  const next6pm = new Date(now);
  next6pm.setUTCHours(18, 0, 0, 0);
  if (next6pm <= now) next6pm.setUTCDate(next6pm.getUTCDate() + 1);

  const msUntilFirst = next6pm.getTime() - now.getTime();
  triggerLog.info(`Rating reminder scheduler: first run in ${Math.round(msUntilFirst / 3600000)}h`);

  const initialTimeout = setTimeout(() => {
    sendRatingReminderPush();
    setInterval(sendRatingReminderPush, DAY_MS);
  }, msUntilFirst);

  return initialTimeout;
}

// Sprint 504: Event-driven triggers extracted to notification-triggers-events.ts
export { onRankingChange, onNewRatingForBusiness, sendCityHighlightsPush, startCityHighlightsScheduler } from "./notification-triggers-events";
