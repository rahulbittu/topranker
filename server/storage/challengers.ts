import { eq, and, sql, lte } from "drizzle-orm";
import { challengers, businesses, type Challenger } from "@shared/schema";
import { db } from "../db";
import { log } from "../logger";

/**
 * Sprint 179: Create a new challenge record after payment confirmation.
 * Called from the Stripe webhook when a challenger_entry payment succeeds.
 * Also triggers push notifications to city members about the new challenge.
 */
export async function createChallenge(data: {
  challengerId: string;
  defenderId: string;
  category: string;
  city: string;
  stripePaymentIntentId: string;
}): Promise<Challenger> {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30); // 30-day challenge period

  const [challenge] = await db
    .insert(challengers)
    .values({
      challengerId: data.challengerId,
      defenderId: data.defenderId,
      category: data.category,
      city: data.city,
      entryFeePaid: true,
      stripePaymentIntentId: data.stripePaymentIntentId,
      endDate,
      status: "active",
    })
    .returning();

  log.info(`Challenge created: ${challenge.id} (${data.challengerId} vs ${data.defenderId})`);

  // Sprint 179: Push notification to city users about new challenge
  try {
    const [challengerBiz, defenderBiz] = await Promise.all([
      db.select().from(businesses).where(eq(businesses.id, data.challengerId)).then(r => r[0]),
      db.select().from(businesses).where(eq(businesses.id, data.defenderId)).then(r => r[0]),
    ]);

    if (challengerBiz && defenderBiz) {
      const { getMembersWithPushTokenByCity } = await import("./members");
      const cityMembers = await getMembersWithPushTokenByCity(data.city);
      if (cityMembers.length > 0) {
        const { notifyNewChallenger } = await import("../push");
        notifyNewChallenger(
          cityMembers.map(m => m.id),
          cityMembers.map(m => m.pushToken),
          defenderBiz.name,
          challengerBiz.name,
          data.category,
        ).catch(() => {});
      }
    }
  } catch (err) {
    log.error(`Failed to send new challenger notification: ${err}`);
  }

  return challenge;
}

export async function getActiveChallenges(
  city: string,
  category?: string,
): Promise<any[]> {
  const challengerRows = await db
    .select()
    .from(challengers)
    .where(
      and(
        eq(challengers.status, "active"),
        eq(challengers.city, city),
        ...(category ? [eq(challengers.category, category)] : []),
      ),
    );

  if (challengerRows.length === 0) return [];

  const bizIds = new Set<string>();
  for (const c of challengerRows) {
    bizIds.add(c.challengerId);
    bizIds.add(c.defenderId);
  }
  const bizIdArr = Array.from(bizIds);
  const bizRows = await db
    .select()
    .from(businesses)
    .where(sql`${businesses.id} = ANY(ARRAY[${sql.join(bizIdArr.map(id => sql`${id}`), sql`,`)}]::text[])`);

  const bizMap = new Map(bizRows.map(b => [b.id, b]));

  return challengerRows.map(c => ({
    ...c,
    challengerBusiness: bizMap.get(c.challengerId),
    defenderBusiness: bizMap.get(c.defenderId),
  }));
}

export async function updateChallengerVotes(
  businessId: string,
  weightedScore: number,
): Promise<void> {
  const asChallenger = await db
    .select()
    .from(challengers)
    .where(
      and(eq(challengers.challengerId, businessId), eq(challengers.status, "active")),
    );

  for (const c of asChallenger) {
    const newVotes = parseFloat(c.challengerWeightedVotes) + weightedScore;
    await db
      .update(challengers)
      .set({
        challengerWeightedVotes: newVotes.toFixed(3),
        totalVotes: sql`${challengers.totalVotes} + 1`,
      })
      .where(eq(challengers.id, c.id));
  }

  const asDefender = await db
    .select()
    .from(challengers)
    .where(
      and(eq(challengers.defenderId, businessId), eq(challengers.status, "active")),
    );

  for (const c of asDefender) {
    const newVotes = parseFloat(c.defenderWeightedVotes) + weightedScore;
    await db
      .update(challengers)
      .set({
        defenderWeightedVotes: newVotes.toFixed(3),
        totalVotes: sql`${challengers.totalVotes} + 1`,
      })
      .where(eq(challengers.id, c.id));
  }
}

/**
 * Close expired challenges — determines winner by weighted votes.
 * Runs as a batch job (hourly via setInterval in server startup).
 * Sprint 161 — server-authoritative winner determination.
 */
export async function closeExpiredChallenges(): Promise<number> {
  const now = new Date();
  const expired = await db
    .select()
    .from(challengers)
    .where(
      and(
        eq(challengers.status, "active"),
        lte(challengers.endDate, now),
      ),
    );

  let closed = 0;
  for (const c of expired) {
    const challengerVotes = parseFloat(c.challengerWeightedVotes);
    const defenderVotes = parseFloat(c.defenderWeightedVotes);

    let winnerId: string | null = null;
    if (challengerVotes > defenderVotes) {
      winnerId = c.challengerId;
    } else if (defenderVotes > challengerVotes) {
      winnerId = c.defenderId;
    }
    // Tie: winnerId stays null (draw)

    await db
      .update(challengers)
      .set({
        status: "completed",
        winnerId,
      })
      .where(eq(challengers.id, c.id));

    closed++;
    log.info(`Challenge ${c.id} closed: winner=${winnerId || "draw"} (${challengerVotes} vs ${defenderVotes})`);

    // Sprint 179: Push notification to city users when challenge ends
    try {
      const winnerBiz = winnerId
        ? await db.select().from(businesses).where(eq(businesses.id, winnerId)).then(r => r[0])
        : null;
      const winnerName = winnerBiz?.name || "It's a draw";

      const { getMembersWithPushTokenByCity } = await import("./members");
      const cityMembers = await getMembersWithPushTokenByCity(c.city);
      if (cityMembers.length > 0) {
        const { notifyChallengerResult } = await import("../push");
        notifyChallengerResult(
          cityMembers.map(m => m.id),
          cityMembers.map(m => m.pushToken!),
          winnerName,
          c.category,
        ).catch(() => {});
      }
    } catch (err) {
      log.error(`Failed to send challenger result notification: ${err}`);
    }
  }

  if (closed > 0) {
    log.info(`Closed ${closed} expired challenge(s)`);
  }

  return closed;
}
