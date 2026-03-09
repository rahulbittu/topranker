/**
 * Owner Outreach Scheduler
 *
 * Runs weekly on Wednesdays at 10am UTC.
 * - Logs unclaimed businesses with 5+ ratings as claim-invite candidates
 * - Sends Pro upgrade emails to claimed owners with 10+ ratings and no subscription
 */

import { sendOwnerProUpgradeEmail } from "./email-owner-outreach";
import { db } from "./db";
import { businesses, members } from "@shared/schema";
import { log } from "./logger";
import { eq, isNotNull, and, isNull } from "drizzle-orm";

const outreachLog = log.tag("OutreachScheduler");

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

/**
 * Process owner outreach emails:
 * 1. Log unclaimed businesses with traction as claim-invite candidates
 * 2. Send Pro upgrade emails to claimed owners not yet subscribed
 */
export async function processOwnerOutreach(): Promise<{
  claimInvites: number;
  proUpgrades: number;
}> {
  let claimInvites = 0;
  let proUpgrades = 0;

  try {
    // --- Claim invite candidates (log only — no contact info for unclaimed) ---
    const claimCandidates = await db
      .select({
        id: businesses.id,
        name: businesses.name,
        slug: businesses.slug,
        city: businesses.city,
        totalRatings: businesses.totalRatings,
        rankPosition: businesses.rankPosition,
      })
      .from(businesses)
      .where(
        and(
          eq(businesses.isClaimed, false),
          isNotNull(businesses.rankPosition),
        ),
      );

    for (const biz of claimCandidates) {
      if (biz.totalRatings < 5) continue;
      outreachLog.info(
        `Claim candidate: ${biz.name} (${biz.slug}) — ${biz.totalRatings} ratings, rank #${biz.rankPosition} in ${biz.city}`,
      );
      claimInvites++;
    }

    // --- Pro upgrade outreach (send emails) ---
    const proCandidates = await db
      .select({
        id: businesses.id,
        name: businesses.name,
        ownerId: businesses.ownerId,
        totalRatings: businesses.totalRatings,
        weightedScore: businesses.weightedScore,
      })
      .from(businesses)
      .where(
        and(
          eq(businesses.isClaimed, true),
          isNotNull(businesses.ownerId),
          eq(businesses.subscriptionStatus, "none"),
        ),
      );

    for (const biz of proCandidates) {
      if (biz.totalRatings < 10 || !biz.ownerId) continue;

      try {
        const [owner] = await db
          .select({ email: members.email, displayName: members.displayName })
          .from(members)
          .where(eq(members.id, biz.ownerId));

        if (!owner?.email) continue;

        await sendOwnerProUpgradeEmail({
          email: owner.email,
          businessName: biz.name,
          ownerName: owner.displayName || "Business Owner",
          totalRatings: biz.totalRatings,
          weightedScore: parseFloat(biz.weightedScore ?? "0"),
        });
        proUpgrades++;
      } catch (err) {
        outreachLog.error(`Pro upgrade email failed for business ${biz.id}`, err);
      }
    }

    outreachLog.info(
      `Outreach complete: ${claimInvites} claim candidates logged, ${proUpgrades} Pro upgrade emails sent`,
    );
  } catch (err) {
    outreachLog.error("Outreach processing failed:", err);
  }

  return { claimInvites, proUpgrades };
}

/**
 * Start the weekly outreach scheduler.
 * First run aligned to next Wednesday 10am UTC, then repeats every 7 days.
 * Returns the timeout handle for graceful shutdown cleanup.
 */
export function startOutreachScheduler(): NodeJS.Timeout {
  const now = new Date();
  const nextWed = new Date(now);
  // Find next Wednesday (day 3)
  const daysUntilWed = (3 - now.getUTCDay() + 7) % 7 || 7;
  nextWed.setUTCDate(now.getUTCDate() + daysUntilWed);
  nextWed.setUTCHours(10, 0, 0, 0);
  if (nextWed <= now) nextWed.setUTCDate(nextWed.getUTCDate() + 7);

  const msUntilFirst = nextWed.getTime() - now.getTime();

  outreachLog.info(
    `Outreach scheduler: first run in ${Math.round(msUntilFirst / 3600000)}h (next Wed 10am UTC)`,
  );

  const initialTimeout = setTimeout(() => {
    processOwnerOutreach();
    setInterval(processOwnerOutreach, WEEK_MS);
  }, msUntilFirst);

  return initialTimeout;
}
