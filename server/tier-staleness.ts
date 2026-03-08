/**
 * Tier data staleness detection and auto-refresh.
 * Ensures personalized vote weights reflect current credibility tier.
 *
 * Sprint 139 — closes data integrity gap from Retro 135 + external critique.
 */
import { db } from "./db";
import { members } from "@shared/schema";
import { eq } from "drizzle-orm";
import { log } from "./logger";
import { getCredibilityTier } from "@shared/credibility";

const stalenessLog = log.tag("TierStaleness");

/** Maximum age (in hours) before a member's tier is considered stale. */
export const STALENESS_THRESHOLD_HOURS = 24;

// ---------------------------------------------------------------------------
// Pure functions — no DB dependency, fully testable in isolation
// ---------------------------------------------------------------------------

/**
 * Check if a member's stored tier matches their current credibility score.
 * Returns true if the tier is stale (score has drifted past a tier boundary).
 */
export function isTierStale(storedTier: string, currentScore: number): boolean {
  const expectedTier = getCredibilityTier(currentScore);
  return storedTier !== expectedTier;
}

/**
 * Check staleness for a single member and return the correct tier.
 * Call this after any action that changes credibility score.
 * Returns the current (possibly corrected) tier.
 */
export function checkAndRefreshTier(storedTier: string, currentScore: number): string {
  const expectedTier = getCredibilityTier(currentScore);
  if (storedTier !== expectedTier) {
    stalenessLog.info(
      `Tier drift detected: stored=${storedTier}, expected=${expectedTier} for score=${currentScore}`,
    );
  }
  return expectedTier;
}

// ---------------------------------------------------------------------------
// DB-dependent functions — require live database connection
// ---------------------------------------------------------------------------

/**
 * Find members whose stored tier doesn't match their score-derived tier.
 * These are members whose vote weights may be incorrectly applied.
 */
export async function findStaleTierMembers(): Promise<
  { id: number; storedTier: string; score: number; expectedTier: string }[]
> {
  const allMembers = await db
    .select({
      id: members.id,
      storedTier: members.credibilityTier,
      score: members.credibilityScore,
    })
    .from(members);

  return allMembers
    .filter((m) => isTierStale(m.storedTier, m.score))
    .map((m) => ({
      id: m.id,
      storedTier: m.storedTier,
      score: m.score,
      expectedTier: getCredibilityTier(m.score),
    }));
}

/**
 * Refresh stale tiers — updates member tier to match their current score.
 * Returns count of members updated.
 */
export async function refreshStaleTiers(): Promise<number> {
  const staleMembers = await findStaleTierMembers();

  if (staleMembers.length === 0) {
    stalenessLog.info("No stale tiers detected");
    return 0;
  }

  stalenessLog.info(`Found ${staleMembers.length} members with stale tiers`);

  let updated = 0;
  for (const m of staleMembers) {
    await db
      .update(members)
      .set({ credibilityTier: m.expectedTier })
      .where(eq(members.id, m.id));

    stalenessLog.info(
      `Updated member ${m.id}: ${m.storedTier} → ${m.expectedTier} (score: ${m.score})`,
    );
    updated++;
  }

  return updated;
}
