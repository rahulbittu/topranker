/**
 * Sprint 263 — Rating Integrity Phase 1c
 * Part 5 Layer 5: Business Owner Self-Rating Block
 * Part 5 Layer 2: Velocity Detection
 * Part 6 Step 7: Minimum Rating Thresholds
 *
 * 34 tests across 5 groups:
 *   1. Owner self-rating — static analysis (6)
 *   2. Owner self-rating — runtime (8)
 *   3. Leaderboard eligibility — runtime (8)
 *   4. Velocity detection — runtime (8)
 *   5. Integration (4)
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";

import {
  registerBusinessClaim,
  checkOwnerSelfRating,
  getClaimedBusiness,
  checkLeaderboardEligibility,
  checkVelocity,
  logRatingSubmission,
  getIntegrityStats,
  clearIntegrityData,
  MAX_RATING_LOG,
} from "../server/rating-integrity";

import type { RatingRecord, BusinessClaim } from "../server/rating-integrity";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ===========================================================================
// 1. Owner self-rating — static analysis (6 tests)
// ===========================================================================
describe("Owner self-rating — static analysis", () => {
  const src = readFile("server/rating-integrity.ts");

  it("file exists", () => {
    expect(src.length).toBeGreaterThan(0);
  });

  it("exports registerBusinessClaim, checkOwnerSelfRating, getClaimedBusiness", () => {
    expect(typeof registerBusinessClaim).toBe("function");
    expect(typeof checkOwnerSelfRating).toBe("function");
    expect(typeof getClaimedBusiness).toBe("function");
  });

  it("uses tagged logger 'RatingIntegrity'", () => {
    expect(src).toContain('log.tag("RatingIntegrity")');
  });

  it("contains 'As the business owner' message text", () => {
    expect(src).toContain("As the business owner");
  });

  it("exports checkLeaderboardEligibility", () => {
    expect(typeof checkLeaderboardEligibility).toBe("function");
  });

  it("exports checkVelocity", () => {
    expect(typeof checkVelocity).toBe("function");
  });
});

// ===========================================================================
// 2. Owner self-rating — runtime (8 tests)
// ===========================================================================
describe("Owner self-rating — runtime", () => {
  beforeEach(() => {
    clearIntegrityData();
  });

  it("registerBusinessClaim stores claim correctly", () => {
    registerBusinessClaim("biz-1", "owner-1", "10.0.0.1");
    const claim = getClaimedBusiness("biz-1");
    expect(claim).not.toBeNull();
    expect(claim!.ownerId).toBe("owner-1");
    expect(claim!.claimIp).toBe("10.0.0.1");
    expect(claim!.claimedAt).toBeTruthy();
  });

  it("checkOwnerSelfRating blocks owner from rating their own business", () => {
    registerBusinessClaim("biz-2", "owner-2");
    const result = checkOwnerSelfRating("biz-2", "owner-2");
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("business owner");
  });

  it("checkOwnerSelfRating blocks matching IP even if different account", () => {
    registerBusinessClaim("biz-3", "owner-3", "192.168.1.1");
    const result = checkOwnerSelfRating("biz-3", "someone-else", "192.168.1.1");
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("business owner");
  });

  it("checkOwnerSelfRating allows non-owner to rate", () => {
    registerBusinessClaim("biz-4", "owner-4", "10.0.0.4");
    const result = checkOwnerSelfRating("biz-4", "rater-99", "10.0.0.99");
    expect(result.allowed).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it("checkOwnerSelfRating allows rating unclaimed business", () => {
    const result = checkOwnerSelfRating("unclaimed-biz", "rater-1");
    expect(result.allowed).toBe(true);
  });

  it("getClaimedBusiness returns null for unclaimed", () => {
    expect(getClaimedBusiness("nonexistent")).toBeNull();
  });

  it("getClaimedBusiness returns claim data for claimed business", () => {
    registerBusinessClaim("biz-5", "owner-5", "10.0.0.5");
    const claim = getClaimedBusiness("biz-5");
    expect(claim).toEqual(
      expect.objectContaining({ ownerId: "owner-5", claimIp: "10.0.0.5" }),
    );
  });

  it("self-rating block message is user-friendly", () => {
    registerBusinessClaim("biz-6", "owner-6");
    const result = checkOwnerSelfRating("biz-6", "owner-6");
    expect(result.reason).toContain("trust");
    expect(result.reason).toContain("fairness");
    expect(result.reason!.length).toBeGreaterThan(20);
  });
});

// ===========================================================================
// 3. Leaderboard eligibility — runtime (8 tests)
// ===========================================================================
describe("Leaderboard eligibility — runtime", () => {
  it("0 ratings = not eligible, 'Not enough ratings yet'", () => {
    const result = checkLeaderboardEligibility([]);
    expect(result.eligible).toBe(false);
    expect(result.message).toContain("Not enough ratings");
  });

  it("2 raters = not eligible (need 3)", () => {
    const ratings: RatingRecord[] = [
      { raterId: "u1", visitType: "dine_in", credibilityWeight: 0.35 },
      { raterId: "u2", visitType: "dine_in", credibilityWeight: 0.35 },
    ];
    const result = checkLeaderboardEligibility(ratings);
    expect(result.eligible).toBe(false);
    expect(result.reasons.some((r) => r.includes("unique rater"))).toBe(true);
  });

  it("3 raters but no dine-in = not eligible", () => {
    const ratings: RatingRecord[] = [
      { raterId: "u1", visitType: "delivery", credibilityWeight: 0.35 },
      { raterId: "u2", visitType: "takeaway", credibilityWeight: 0.35 },
      { raterId: "u3", visitType: "delivery", credibilityWeight: 0.35 },
    ];
    const result = checkLeaderboardEligibility(ratings);
    expect(result.eligible).toBe(false);
    expect(result.reasons.some((r) => r.includes("dine-in"))).toBe(true);
  });

  it("3 raters all community tier (0.10 each = 0.30) = not eligible", () => {
    const ratings: RatingRecord[] = [
      { raterId: "u1", visitType: "dine_in", credibilityWeight: 0.1 },
      { raterId: "u2", visitType: "dine_in", credibilityWeight: 0.1 },
      { raterId: "u3", visitType: "dine_in", credibilityWeight: 0.1 },
    ];
    const result = checkLeaderboardEligibility(ratings);
    expect(result.eligible).toBe(false);
    expect(result.reasons.some((r) => r.includes("Credibility-weighted sum"))).toBe(true);
  });

  it("3 raters with 1 city tier (0.35 + 0.10 + 0.10 = 0.55) = eligible", () => {
    const ratings: RatingRecord[] = [
      { raterId: "u1", visitType: "dine_in", credibilityWeight: 0.35 },
      { raterId: "u2", visitType: "delivery", credibilityWeight: 0.1 },
      { raterId: "u3", visitType: "takeaway", credibilityWeight: 0.1 },
    ];
    const result = checkLeaderboardEligibility(ratings);
    expect(result.eligible).toBe(true);
  });

  it("5 raters with mix of visit types and good weights = eligible", () => {
    const ratings: RatingRecord[] = [
      { raterId: "u1", visitType: "dine_in", credibilityWeight: 0.35 },
      { raterId: "u2", visitType: "delivery", credibilityWeight: 0.20 },
      { raterId: "u3", visitType: "takeaway", credibilityWeight: 0.15 },
      { raterId: "u4", visitType: "dine_in", credibilityWeight: 0.10 },
      { raterId: "u5", visitType: "delivery", credibilityWeight: 0.10 },
    ];
    const result = checkLeaderboardEligibility(ratings);
    expect(result.eligible).toBe(true);
    expect(result.reasons).toHaveLength(0);
  });

  it("duplicate rater IDs count as 1 unique rater", () => {
    const ratings: RatingRecord[] = [
      { raterId: "u1", visitType: "dine_in", credibilityWeight: 0.20 },
      { raterId: "u1", visitType: "delivery", credibilityWeight: 0.20 },
      { raterId: "u2", visitType: "dine_in", credibilityWeight: 0.20 },
    ];
    const result = checkLeaderboardEligibility(ratings);
    expect(result.eligible).toBe(false);
    // Only 2 unique raters despite 3 rating records
    expect(result.reasons.some((r) => r.includes("2 unique rater"))).toBe(true);
  });

  it("message for ineligible contains 'Not enough ratings'", () => {
    const result = checkLeaderboardEligibility([]);
    expect(result.message).toContain("Not enough ratings");
  });
});

// ===========================================================================
// 4. Velocity detection — runtime (8 tests)
// ===========================================================================
describe("Velocity detection — runtime", () => {
  beforeEach(() => {
    clearIntegrityData();
  });

  it("normal rating (1 per day) = not flagged", () => {
    logRatingSubmission("biz-1", "user-1", "10.0.0.1");
    const result = checkVelocity("biz-1", "user-1", "10.0.0.1");
    expect(result.flagged).toBe(false);
    expect(result.reducedWeight).toBe(1.0);
  });

  it(">5 from same IP for same business in 24h = flagged, weight 0.05", () => {
    for (let i = 0; i < 6; i++) {
      logRatingSubmission("biz-1", `user-${i}`, "10.0.0.1");
    }
    const result = checkVelocity("biz-1", "user-99", "10.0.0.1");
    expect(result.flagged).toBe(true);
    expect(result.reducedWeight).toBe(0.05);
    expect(result.rule).toBe("V1");
  });

  it(">10 ratings from same account in 1 hour = flagged, weight 0.05", () => {
    for (let i = 0; i < 11; i++) {
      logRatingSubmission(`biz-${i}`, "spammer", `ip-${i}`);
    }
    const result = checkVelocity("biz-new", "spammer", "ip-new");
    expect(result.flagged).toBe(true);
    expect(result.reducedWeight).toBe(0.05);
    expect(result.rule).toBe("V2");
  });

  it("different businesses from same IP = not flagged (V1 is per-business)", () => {
    for (let i = 0; i < 6; i++) {
      logRatingSubmission(`biz-${i}`, `user-${i}`, "10.0.0.1");
    }
    // Each business has only 1 rating from this IP
    const result = checkVelocity("biz-0", "user-new", "10.0.0.1");
    // biz-0 has only 1 entry from 10.0.0.1, so not flagged
    expect(result.flagged).toBe(false);
  });

  it("different IPs for same business = not flagged", () => {
    for (let i = 0; i < 5; i++) {
      logRatingSubmission("biz-1", `user-${i}`, `10.0.0.${i}`);
    }
    const result = checkVelocity("biz-1", "user-new", "10.0.0.99");
    expect(result.flagged).toBe(false);
  });

  it("flagged rating returns rule name", () => {
    for (let i = 0; i < 6; i++) {
      logRatingSubmission("biz-1", `user-${i}`, "10.0.0.1");
    }
    const result = checkVelocity("biz-1", "user-99", "10.0.0.1");
    expect(result.rule).toBeDefined();
    expect(["V1", "V2", "V3", "V4"]).toContain(result.rule);
  });

  it("logRatingSubmission stores entries correctly", () => {
    clearIntegrityData();
    logRatingSubmission("biz-1", "user-1", "10.0.0.1");
    logRatingSubmission("biz-2", "user-2", "10.0.0.2");
    // Verify by checking that velocity checks can see the logged entries
    // 2 entries for same IP/business should NOT trigger V1 (threshold >5)
    const result = checkVelocity("biz-1", "user-1", "10.0.0.1");
    expect(result.flagged).toBe(false);
  });

  it("clearIntegrityData resets all state", () => {
    logRatingSubmission("biz-1", "user-1", "10.0.0.1");
    registerBusinessClaim("biz-1", "owner-1");
    clearIntegrityData();
    expect(getClaimedBusiness("biz-1")).toBeNull();
    const stats = getIntegrityStats();
    expect(stats.totalClaims).toBe(0);
    expect(stats.velocityFlags).toBe(0);
  });
});

// ===========================================================================
// 5. Integration (4 tests)
// ===========================================================================
describe("Rating integrity — integration", () => {
  beforeEach(() => {
    clearIntegrityData();
  });

  it("module imports from ./logger", () => {
    const src = readFile("server/rating-integrity.ts");
    expect(src).toContain('from "./logger"');
  });

  it("MAX_RATING_LOG is 100000", () => {
    expect(MAX_RATING_LOG).toBe(100000);
  });

  it("getIntegrityStats returns correct counts after various operations", () => {
    // Register a claim and trigger a self-rating block
    registerBusinessClaim("biz-1", "owner-1");
    checkOwnerSelfRating("biz-1", "owner-1");

    // Log enough entries to trigger V1
    for (let i = 0; i < 6; i++) {
      logRatingSubmission("biz-2", `user-${i}`, "10.0.0.1");
    }
    checkVelocity("biz-2", "user-99", "10.0.0.1");

    // Trigger ineligible check
    checkLeaderboardEligibility([]);

    const stats = getIntegrityStats();
    expect(stats.totalClaims).toBe(1);
    expect(stats.blockedSelfRatings).toBe(1);
    expect(stats.velocityFlags).toBe(1);
    expect(stats.ineligibleBusinesses).toBe(1);
  });

  it("clearIntegrityData resets stats to zero", () => {
    registerBusinessClaim("biz-1", "owner-1");
    checkOwnerSelfRating("biz-1", "owner-1");
    for (let i = 0; i < 6; i++) {
      logRatingSubmission("biz-2", `user-${i}`, "10.0.0.1");
    }
    checkVelocity("biz-2", "user-99", "10.0.0.1");

    clearIntegrityData();
    const stats = getIntegrityStats();
    expect(stats.totalClaims).toBe(0);
    expect(stats.blockedSelfRatings).toBe(0);
    expect(stats.velocityFlags).toBe(0);
    expect(stats.ineligibleBusinesses).toBe(0);
  });
});
