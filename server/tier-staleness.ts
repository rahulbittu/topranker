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
// Tier Semantics Contract — machine-readable registry of all tier-reading paths
// ---------------------------------------------------------------------------

/**
 * Tier Semantics Contract.
 * FRESH: recomputed before response. SNAPSHOT: read from DB (historical/aggregate).
 *
 * FRESH paths (checkAndRefreshTier required):
 *   - POST /api/ratings (recalculateCredibilityScore)
 *   - GET /api/members/me (recalculateCredibilityScore)
 *   - GET /api/members/:username (checkAndRefreshTier)
 *   - GET /api/account/export (checkAndRefreshTier)
 *   - GET /api/admin/members (checkAndRefreshTier)
 *   - passport.deserializeUser (checkAndRefreshTier)
 *
 * SNAPSHOT paths (acceptable — historical/aggregate):
 *   - getBusinessRatings (tier at time of rating)
 *   - getBadgeLeaderboard (display-only, batch-corrected)
 */
export const TIER_SEMANTICS = {
  fresh: [
    {
      path: "POST /api/ratings",
      mechanism: "recalculateCredibilityScore + checkAndRefreshTier",
      file: "server/routes.ts",
      reason: "Rating submission changes score; response must reflect new tier immediately",
    },
    {
      path: "GET /api/members/me",
      mechanism: "recalculateCredibilityScore + checkAndRefreshTier",
      file: "server/routes.ts",
      reason: "Profile page is the primary place users see their tier; must be authoritative",
    },
    {
      path: "GET /api/members/:username",
      mechanism: "checkAndRefreshTier",
      file: "server/routes.ts",
      reason: "Public profiles must show correct tier to avoid trust confusion",
    },
    {
      path: "GET /api/account/export",
      mechanism: "checkAndRefreshTier",
      file: "server/routes.ts",
      reason: "GDPR Art. 20 requires accurate data export",
    },
    {
      path: "GET /api/admin/members",
      mechanism: "checkAndRefreshTier",
      file: "server/routes-admin.ts",
      reason: "Admins need accurate tier for moderation decisions",
    },
    {
      path: "passport.deserializeUser",
      mechanism: "checkAndRefreshTier",
      file: "server/auth.ts",
      reason: "Session user object feeds req.user.credibilityTier used by all authenticated endpoints",
    },
  ],
  snapshot: [
    {
      path: "getBusinessRatings",
      file: "server/storage/businesses.ts",
      reason: "Historical ratings display — tier at time of rating is the correct value",
    },
    {
      path: "getBadgeLeaderboard",
      file: "server/storage/badges.ts",
      reason: "Display-only leaderboard; tier is cosmetic context, batch-corrected by refreshStaleTiers",
    },
  ],
} as const;

// ---------------------------------------------------------------------------
// DB-dependent functions — require live database connection
// ---------------------------------------------------------------------------

/**
 * Find members whose stored tier doesn't match their score-derived tier.
 * These are members whose vote weights may be incorrectly applied.
 */
export async function findStaleTierMembers(): Promise<
  { id: string; storedTier: string; score: number; expectedTier: string }[]
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
