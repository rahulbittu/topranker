/**
 * Rating Integrity Module — Phase 1c
 * Part 5 Layer 5: Business Owner Self-Rating Prevention
 * Part 5 Layer 2: Velocity Detection
 * Part 6 Step 7: Minimum Rating Thresholds (Leaderboard Eligibility)
 *
 * Owner: Nadia Kaur (Cybersecurity) + Sarah Nakamura (Lead Eng)
 *
 * CRITICAL DESIGN RULE (from Rating Integrity doc Part 5):
 * "Flagging does not mean rejection. Flagged ratings still exist.
 *  They are just weight-reduced."
 */

import { log } from "./logger";

const integrityLog = log.tag("RatingIntegrity");

// ---------------------------------------------------------------------------
// Layer 5: Business Owner Self-Rating Prevention
// ---------------------------------------------------------------------------

interface OwnerCheck {
  allowed: boolean;
  reason?: string;
}

export interface BusinessClaim {
  ownerId: string;
  claimedAt: string;
  claimIp?: string;
}

const claimedBusinesses = new Map<string, BusinessClaim>();

let blockedSelfRatingCount = 0;

export function registerBusinessClaim(
  businessId: string,
  ownerId: string,
  claimIp?: string,
): void {
  const claim: BusinessClaim = {
    ownerId,
    claimedAt: new Date().toISOString(),
    claimIp,
  };
  claimedBusinesses.set(businessId, claim);
  integrityLog.info("Business claim registered", { businessId, ownerId });
}

export function checkOwnerSelfRating(
  businessId: string,
  raterId: string,
  raterIp?: string,
): OwnerCheck {
  const claim = claimedBusinesses.get(businessId);
  if (!claim) {
    return { allowed: true };
  }

  if (raterId === claim.ownerId) {
    blockedSelfRatingCount++;
    integrityLog.warn("Owner self-rating blocked", { businessId, raterId });
    return {
      allowed: false,
      reason:
        "As the business owner, you cannot rate your own restaurant. This ensures trust and fairness for all users.",
    };
  }

  if (raterIp && claim.claimIp && raterIp === claim.claimIp) {
    blockedSelfRatingCount++;
    integrityLog.warn("Potential self-rating from claim IP", {
      businessId,
      raterId,
      raterIp,
    });
    return {
      allowed: false,
      reason:
        "As the business owner, you cannot rate your own restaurant. This ensures trust and fairness for all users.",
    };
  }

  return { allowed: true };
}

export function getClaimedBusiness(businessId: string): BusinessClaim | null {
  return claimedBusinesses.get(businessId) ?? null;
}

// ---------------------------------------------------------------------------
// Part 6 Step 7: Minimum Rating Thresholds (Leaderboard Eligibility)
// ---------------------------------------------------------------------------

interface LeaderboardEligibility {
  eligible: boolean;
  reasons: string[];
  message: string;
}

export interface RatingRecord {
  raterId: string;
  visitType: "dine_in" | "delivery" | "takeaway";
  credibilityWeight: number;
}

let ineligibleCount = 0;

export function checkLeaderboardEligibility(
  ratings: RatingRecord[],
): LeaderboardEligibility {
  const reasons: string[] = [];

  // Requirement 1: At least 3 unique raters
  const uniqueRaters = new Set(ratings.map((r) => r.raterId));
  if (uniqueRaters.size < 3) {
    reasons.push(
      `Only ${uniqueRaters.size} unique rater(s); minimum is 3`,
    );
  }

  // Requirement 2: At least 1 dine-in rating
  const hasDineIn = ratings.some((r) => r.visitType === "dine_in");
  if (!hasDineIn) {
    reasons.push("No dine-in ratings; at least 1 required");
  }

  // Requirement 3: Credibility-weighted sum >= 0.5
  const weightedSum = ratings.reduce((sum, r) => sum + r.credibilityWeight, 0);
  if (weightedSum < 0.5) {
    reasons.push(
      `Credibility-weighted sum is ${weightedSum.toFixed(2)}; minimum is 0.50`,
    );
  }

  const eligible = reasons.length === 0;
  if (!eligible) {
    ineligibleCount++;
    integrityLog.info("Business not eligible for leaderboard", { reasons });
  }

  return {
    eligible,
    reasons,
    message: eligible
      ? "Eligible for leaderboard"
      : "Not enough ratings yet. Be one of the first to rate this restaurant.",
  };
}

// ---------------------------------------------------------------------------
// Part 5 Layer 2: Velocity Detection
// ---------------------------------------------------------------------------

interface VelocityCheck {
  flagged: boolean;
  rule?: string;
  reducedWeight: number;
}

interface RatingLogEntry {
  businessId: string;
  raterId: string;
  raterIp: string;
  timestamp: number;
}

const ratingLog: RatingLogEntry[] = [];

let velocityFlagCount = 0;

export const MAX_RATING_LOG = 100000;

export function logRatingSubmission(
  businessId: string,
  raterId: string,
  raterIp: string,
): void {
  ratingLog.push({ businessId, raterId, raterIp, timestamp: Date.now() });
  // Trim to prevent unbounded growth
  if (ratingLog.length > MAX_RATING_LOG) {
    ratingLog.splice(0, ratingLog.length - MAX_RATING_LOG);
  }
  integrityLog.debug("Rating submission logged", { businessId, raterId });
}

export function checkVelocity(
  businessId: string,
  raterId: string,
  raterIp: string,
): VelocityCheck {
  const now = Date.now();
  const HOUR = 3600000;
  const DAY = 86400000;

  // RULE V1: >5 ratings for same business from same IP in 24h
  const sameIpSameBiz24h = ratingLog.filter(
    (e) =>
      e.businessId === businessId &&
      e.raterIp === raterIp &&
      now - e.timestamp < DAY,
  );
  if (sameIpSameBiz24h.length > 5) {
    velocityFlagCount++;
    integrityLog.warn("Velocity V1: >5 same-IP same-business in 24h", {
      businessId,
      raterIp,
      count: sameIpSameBiz24h.length,
    });
    return { flagged: true, rule: "V1", reducedWeight: 0.05 };
  }

  // RULE V2: Single account >10 ratings in 1 hour
  const sameAccount1h = ratingLog.filter(
    (e) => e.raterId === raterId && now - e.timestamp < HOUR,
  );
  if (sameAccount1h.length > 10) {
    velocityFlagCount++;
    integrityLog.warn("Velocity V2: >10 ratings from account in 1h", {
      raterId,
      count: sameAccount1h.length,
    });
    return { flagged: true, rule: "V2", reducedWeight: 0.05 };
  }

  // RULE V3: >20 new-member ratings for same business in 12h
  // (Simplified: count all ratings for this business in 12h window)
  const sameBiz12h = ratingLog.filter(
    (e) =>
      e.businessId === businessId && now - e.timestamp < 12 * HOUR,
  );
  if (sameBiz12h.length > 20) {
    velocityFlagCount++;
    integrityLog.warn("Velocity V3: >20 ratings for business in 12h", {
      businessId,
      count: sameBiz12h.length,
    });
    return { flagged: true, rule: "V3", reducedWeight: 0.05 };
  }

  // RULE V4: Inactive >30 days, rates one business with extreme score
  // Simplified: check if rater has a gap >30 days between any previous rating
  // and the most recent one
  const raterHistory = ratingLog
    .filter((e) => e.raterId === raterId)
    .sort((a, b) => a.timestamp - b.timestamp);
  if (raterHistory.length >= 2) {
    const lastTwo = raterHistory.slice(-2);
    const gap = lastTwo[1].timestamp - lastTwo[0].timestamp;
    if (gap > 30 * DAY) {
      velocityFlagCount++;
      integrityLog.warn("Velocity V4: Inactive >30 days then rated", {
        raterId,
        gapDays: Math.round(gap / DAY),
      });
      return { flagged: true, rule: "V4", reducedWeight: 0.05 };
    }
  }

  return { flagged: false, reducedWeight: 1.0 };
}

// ---------------------------------------------------------------------------
// Stats and Cleanup
// ---------------------------------------------------------------------------

export function getIntegrityStats(): {
  totalClaims: number;
  blockedSelfRatings: number;
  velocityFlags: number;
  ineligibleBusinesses: number;
} {
  return {
    totalClaims: claimedBusinesses.size,
    blockedSelfRatings: blockedSelfRatingCount,
    velocityFlags: velocityFlagCount,
    ineligibleBusinesses: ineligibleCount,
  };
}

export function clearIntegrityData(): void {
  claimedBusinesses.clear();
  ratingLog.length = 0;
  blockedSelfRatingCount = 0;
  velocityFlagCount = 0;
  ineligibleCount = 0;
  integrityLog.info("All integrity data cleared");
}
