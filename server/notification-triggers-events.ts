/**
 * Sprint 504: Event-driven notification triggers.
 * Extracted from notification-triggers.ts to reduce file size.
 *
 * Contains triggers that fire in response to business events:
 * - onRankingChange: after rank recalculation
 * - onNewRatingForBusiness: after rating submission
 * - sendCityHighlightsPush: weekly city-level ranking summary
 * - startCityHighlightsScheduler: weekly scheduler for city highlights
 */

import { sendPushNotification } from "./push";
import { recordPushDelivery } from "./push-analytics";
import { getNotificationVariant } from "./push-ab-testing";
import { log } from "./logger";

const triggerLog = log.tag("NotifyTrigger");

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
      // Sprint 511: Check for A/B variant
      const abVariant = getNotificationVariant(String(rater.memberId), "rankingChange");
      const abTitle = abVariant ? abVariant.variant.title.replace("{emoji}", emoji).replace("{business}", businessName).replace("{direction}", direction) : `${emoji} ${businessName} moved ${direction}`;
      const abBody = abVariant ? abVariant.variant.body.replace("{newRank}", String(newRank)).replace("{oldRank}", String(oldRank)).replace("{city}", city) : `Now ranked #${newRank} in ${city} (was #${oldRank})`;
      await sendPushNotification(
        [rater.pushToken],
        abTitle,
        abBody,
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

      // Sprint 511: Check for A/B variant
      const abVariant = getNotificationVariant(String(rater.memberId), "newRating");
      const nrTitle = abVariant ? abVariant.variant.title.replace("{business}", businessName) : `New rating for ${businessName}`;
      const nrBody = abVariant ? abVariant.variant.body.replace("{rater}", raterName).replace("{score}", score.toFixed(1)) : `${raterName} gave it a ${score.toFixed(1)}. See how it affects the ranking.`;
      await sendPushNotification(
        [rater.pushToken],
        nrTitle,
        nrBody,
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
      // Sprint 511: Check for A/B variant
      const abVariant = getNotificationVariant(String(user.id), "cityHighlights");
      const chTitle = abVariant ? abVariant.variant.title.replace("{city}", city) : `${city} rankings update`;
      const chBody = abVariant ? abVariant.variant.body.replace("{business}", biggestMover.businessName || "A restaurant").replace("{direction}", direction).replace("{delta}", String(biggestDelta)) : `${biggestMover.businessName} ${direction} ${biggestDelta} spots this week. See full rankings.`;
      await sendPushNotification(
        [user.pushToken],
        chTitle,
        chBody,
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

/**
 * Start the weekly city highlights push scheduler.
 * Runs every Monday at 11am UTC (1 hour after weekly digest).
 */
export function startCityHighlightsScheduler(): NodeJS.Timeout {
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;
  const nextMonday = new Date(now);
  nextMonday.setUTCDate(now.getUTCDate() + daysUntilMonday);
  nextMonday.setUTCHours(11, 0, 0, 0);
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
