/**
 * Drip Email Scheduler
 *
 * Runs daily at 9am UTC, checks each member's signup age,
 * and sends the appropriate drip email if one is due.
 * Follows the setInterval pattern from notification-triggers.ts.
 */

import { DRIP_SEQUENCE, getDripStepForDay } from "./email-drip";
import { db } from "./db";
import { members } from "@shared/schema";
import { log } from "./logger";
import { isNotNull, sql } from "drizzle-orm";

const dripLog = log.tag("DripScheduler");

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Process all members and send any drip emails that are due today.
 * Errors are caught per-user so one failure doesn't block others.
 */
export async function processDripEmails(): Promise<number> {
  try {
    const allMembers = await db
      .select({
        id: members.id,
        email: members.email,
        displayName: members.displayName,
        city: members.city,
        username: members.username,
        joinedAt: members.joinedAt,
        notificationPrefs: members.notificationPrefs,
      })
      .from(members)
      .where(isNotNull(members.email));

    const now = Date.now();
    let sent = 0;

    for (const member of allMembers) {
      if (!member.joinedAt) continue;

      const daysSinceSignup = Math.floor((now - new Date(member.joinedAt).getTime()) / DAY_MS);
      const step = getDripStepForDay(daysSinceSignup);
      if (!step) continue;

      const prefs = (member.notificationPrefs as Record<string, boolean>) || {};
      if (prefs.emailDrip === false) continue;

      try {
        await step.send({
          email: member.email!,
          displayName: member.displayName,
          city: member.city,
          username: member.username,
        });
        dripLog.info(`Drip "${step.name}" sent to ${member.id} (day ${daysSinceSignup})`);
        sent++;
      } catch (err) {
        dripLog.error(`Drip "${step.name}" failed for ${member.id}`, err);
      }
    }

    dripLog.info(`Drip run complete: ${sent} emails sent`);
    return sent;
  } catch (err) {
    dripLog.error("Drip processing failed:", err);
    return 0;
  }
}

/**
 * Start the daily drip scheduler.
 * First run is aligned to next 9am UTC, then repeats every 24h.
 * Returns the timeout handle for graceful shutdown cleanup.
 */
export function startDripScheduler(): NodeJS.Timeout {
  const now = new Date();
  const next9am = new Date(now);
  next9am.setUTCHours(9, 0, 0, 0);
  if (next9am <= now) next9am.setUTCDate(next9am.getUTCDate() + 1);

  const msUntilFirst = next9am.getTime() - now.getTime();

  dripLog.info(`Drip scheduler: first run in ${Math.round(msUntilFirst / 3600000)}h`);

  const initialTimeout = setTimeout(() => {
    processDripEmails();
    setInterval(processDripEmails, DAY_MS);
  }, msUntilFirst);

  return initialTimeout;
}
