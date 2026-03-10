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

// ── Sprint 488: City Highlights Scheduler ──────────────────────

/**
 * Start the weekly city highlights push scheduler.
 * Runs every Monday at 11am UTC (1 hour after weekly digest).
 * Sends city-level ranking highlight pushes for all active cities.
 */
export function startCityHighlightsScheduler(): NodeJS.Timeout {
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;
  const nextMonday = new Date(now);
  nextMonday.setUTCDate(now.getUTCDate() + daysUntilMonday);
  nextMonday.setUTCHours(11, 0, 0, 0); // 11am UTC, 1hr after digest
  if (nextMonday <= now) nextMonday.setUTCDate(nextMonday.getUTCDate() + 7);

  const msUntilFirst = nextMonday.getTime() - now.getTime();
  triggerLog.info(`City highlights scheduler: first run in ${Math.round(msUntilFirst / 3600000)}h`);

  async function runCityHighlights() {
    try {
      const { getActiveCities, getBetaCities } = await import("@shared/city-config");
      const cities = [...getActiveCities(), ...getBetaCities()];
      let totalSent = 0;
      for (const city of cities) {
        const sent = await sendCityHighlightsPush(city);
        totalSent += sent;
      }
      triggerLog.info(`City highlights completed: ${totalSent} pushes across ${cities.length} cities`);
    } catch (err) {
      triggerLog.error("City highlights scheduler error:", err);
    }
  }

  const initialTimeout = setTimeout(() => {
    runCityHighlights();
    setInterval(runCityHighlights, WEEK_MS);
  }, msUntilFirst);

  return initialTimeout;
}

// ── Sprint 481: New Push Notification Triggers ─────────────────

/**
 * Push notification when a business's rank position changes significantly.
 * Called after rank recalculation. Notifies users who have rated the business.
 */
export async function onRankingChange(
  businessId: string,
  businessName: string,
  oldRank: number,
  newRank: number,
  city: string,
): Promise<number> {
  if (oldRank === newRank || oldRank === 0 || newRank === 0) return 0;

  const direction = newRank < oldRank ? "up" : "down";
  const delta = Math.abs(newRank - oldRank);
  // Only notify for significant changes (2+ positions)
  if (delta < 2) return 0;

  try {
    const { db } = await import("./db");
    const { ratings, members } = await import("@shared/schema");
    const { eq, isNotNull, and } = await import("drizzle-orm");

    // Find all members who rated this business and have push tokens
    const raters = await db
      .selectDistinct({
        memberId: ratings.memberId,
        pushToken: members.pushToken,
        notificationPrefs: members.notificationPrefs,
      })
      .from(ratings)
      .innerJoin(members, eq(ratings.memberId, members.id))
      .where(and(eq(ratings.businessId, businessId), isNotNull(members.pushToken)));

    let sent = 0;
    for (const rater of raters) {
      if (!rater.pushToken) continue;
      const prefs = (rater.notificationPrefs as Record<string, boolean>) || {};
      if (prefs.rankingChanges === false) continue;

      const emoji = direction === "up" ? "📈" : "📉";
      await sendPushNotification(
        [rater.pushToken],
        `${emoji} ${businessName} moved ${direction}`,
        `Now ranked #${newRank} in ${city} (was #${oldRank})`,
        { screen: "business", businessId },
      );
      sent++;
    }

    triggerLog.info(`Ranking change push: ${businessName} #${oldRank}→#${newRank}, sent to ${sent} raters`);
    recordPushDelivery("rankingChange", city, raters.length, sent, raters.length - sent);
    return sent;
  } catch (err) {
    triggerLog.error(`Ranking change push failed: ${businessId}`, err);
    return 0;
  }
}

/**
 * Push notification when a new rating is submitted for a business.
 * Notifies other members who previously rated the same business.
 * Respects savedBusinessAlerts preference.
 */
export async function onNewRatingForBusiness(
  businessId: string,
  businessName: string,
  ratingMemberId: string,
  raterName: string,
  score: number,
): Promise<number> {
  try {
    const { db } = await import("./db");
    const { ratings, members } = await import("@shared/schema");
    const { eq, isNotNull, and, ne } = await import("drizzle-orm");

    // Find other members who rated this business (exclude the new rater)
    const otherRaters = await db
      .selectDistinct({
        memberId: ratings.memberId,
        pushToken: members.pushToken,
        notificationPrefs: members.notificationPrefs,
      })
      .from(ratings)
      .innerJoin(members, eq(ratings.memberId, members.id))
      .where(and(
        eq(ratings.businessId, businessId),
        ne(ratings.memberId, ratingMemberId),
        isNotNull(members.pushToken),
      ));

    let sent = 0;
    for (const rater of otherRaters) {
      if (!rater.pushToken) continue;
      const prefs = (rater.notificationPrefs as Record<string, boolean>) || {};
      if (prefs.savedBusinessAlerts === false) continue;

      await sendPushNotification(
        [rater.pushToken],
        `New rating for ${businessName}`,
        `${raterName} gave it a ${score.toFixed(1)}. See how it affects the ranking.`,
        { screen: "business", businessId },
      );
      sent++;
    }

    triggerLog.info(`New rating push: ${businessName} by ${raterName}, sent to ${sent} raters`);
    recordPushDelivery("newRating", "all", otherRaters.length, sent, otherRaters.length - sent);
    return sent;
  } catch (err) {
    triggerLog.error(`New rating push failed: ${businessId}`, err);
    return 0;
  }
}

/**
 * Push notification for notable ranking shifts in a city.
 * Runs weekly (alongside weekly digest). Notifies users in the city
 * about the biggest rank movements of the week.
 * Respects cityAlerts preference.
 */
export async function sendCityHighlightsPush(city: string): Promise<number> {
  try {
    const { db } = await import("./db");
    const { members, rankHistory, businesses } = await import("@shared/schema");
    const { eq, isNotNull, and, gte, desc } = await import("drizzle-orm");

    const oneWeekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

    // Find biggest rank changes in the past week
    const recentChanges = await db
      .select({
        businessId: rankHistory.businessId,
        businessName: businesses.name,
        oldRank: rankHistory.previousRank,
        newRank: rankHistory.rank,
      })
      .from(rankHistory)
      .innerJoin(businesses, eq(rankHistory.businessId, businesses.id))
      .where(and(eq(businesses.city, city), gte(rankHistory.createdAt, oneWeekAgo)))
      .orderBy(desc(rankHistory.createdAt))
      .limit(50);

    if (recentChanges.length === 0) return 0;

    // Find the biggest mover
    let biggestMover = recentChanges[0];
    let biggestDelta = 0;
    for (const change of recentChanges) {
      const delta = Math.abs((change.oldRank || 0) - (change.newRank || 0));
      if (delta > biggestDelta) {
        biggestDelta = delta;
        biggestMover = change;
      }
    }

    if (biggestDelta < 2) return 0;

    // Notify all users in this city with push tokens
    const cityUsers = await db
      .select({
        id: members.id,
        pushToken: members.pushToken,
        notificationPrefs: members.notificationPrefs,
      })
      .from(members)
      .where(and(eq(members.city, city), isNotNull(members.pushToken)));

    let sent = 0;
    for (const user of cityUsers) {
      if (!user.pushToken) continue;
      const prefs = (user.notificationPrefs as Record<string, boolean>) || {};
      if (prefs.cityAlerts === false) continue;

      const direction = (biggestMover.newRank || 0) < (biggestMover.oldRank || 0) ? "climbed" : "dropped";
      await sendPushNotification(
        [user.pushToken],
        `${city} rankings update`,
        `${biggestMover.businessName} ${direction} ${biggestDelta} spots this week. See full rankings.`,
        { screen: "rankings" },
      );
      sent++;
    }

    triggerLog.info(`City highlights push: ${city}, biggest mover: ${biggestMover.businessName}, sent to ${sent} users`);
    recordPushDelivery("cityHighlights", city, cityUsers.length, sent, cityUsers.length - sent);
    return sent;
  } catch (err) {
    triggerLog.error(`City highlights push failed: ${city}`, err);
    return 0;
  }
}
