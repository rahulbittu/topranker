/**
 * Sprint 273 — Leaderboard Minimum Requirements Enforcement (Phase 3c)
 *
 * Validates:
 * 1. Schema has dineInCount, credibilityWeightedSum, leaderboardEligible columns
 * 2. recalculateBusinessScore computes eligibility fields
 * 3. getLeaderboard filters by leaderboardEligible
 * 4. recalculateRanks only ranks eligible businesses
 * 5. meetsLeaderboardThreshold logic (score engine)
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { meetsLeaderboardThreshold, type RatingInput } from "@/shared/score-engine";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 273: Leaderboard Eligibility — Schema", () => {
  const schemaSrc = readFile("shared/schema.ts");

  it("businesses table has dineInCount column", () => {
    expect(schemaSrc).toContain("dine_in_count");
    expect(schemaSrc).toContain("dineInCount");
  });

  it("businesses table has credibilityWeightedSum column", () => {
    expect(schemaSrc).toContain("credibility_weighted_sum");
    expect(schemaSrc).toContain("credibilityWeightedSum");
  });

  it("businesses table has leaderboardEligible column", () => {
    expect(schemaSrc).toContain("leaderboard_eligible");
    expect(schemaSrc).toContain("leaderboardEligible");
  });
});

describe("Sprint 273: Leaderboard Eligibility — Server", () => {
  const businessStorageSrc = readFile("server/storage/businesses.ts");

  it("recalculateBusinessScore tracks dineInCount", () => {
    const fnBody = businessStorageSrc.slice(
      businessStorageSrc.indexOf("recalculateBusinessScore"),
      businessStorageSrc.indexOf("recalculateRanks"),
    );
    expect(fnBody).toContain("dineInCount");
    expect(fnBody).toContain('visitType === "dine_in"');
  });

  it("recalculateBusinessScore tracks credibilityWeightedSum", () => {
    const fnBody = businessStorageSrc.slice(
      businessStorageSrc.indexOf("recalculateBusinessScore"),
      businessStorageSrc.indexOf("recalculateRanks"),
    );
    expect(fnBody).toContain("credibilityWeightedSum");
  });

  it("recalculateBusinessScore computes eligibility", () => {
    const fnBody = businessStorageSrc.slice(
      businessStorageSrc.indexOf("recalculateBusinessScore"),
      businessStorageSrc.indexOf("recalculateRanks"),
    );
    expect(fnBody).toContain("leaderboardEligible");
    expect(fnBody).toContain("allRatings.length >= 3");
    expect(fnBody).toContain("dineInCount >= 1");
    expect(fnBody).toContain("credibilityWeightedSum >= 0.5");
  });

  it("recalculateBusinessScore persists eligibility fields", () => {
    const fnBody = businessStorageSrc.slice(
      businessStorageSrc.indexOf("recalculateBusinessScore"),
      businessStorageSrc.indexOf("recalculateRanks"),
    );
    expect(fnBody).toContain("dineInCount,");
    expect(fnBody).toContain("leaderboardEligible: eligible");
  });

  it("getLeaderboard filters by leaderboardEligible", () => {
    const leaderboardFn = businessStorageSrc.slice(
      businessStorageSrc.indexOf("getLeaderboard"),
      businessStorageSrc.indexOf("getTrendingBusinesses"),
    );
    expect(leaderboardFn).toContain("leaderboardEligible");
    expect(leaderboardFn).toContain("true");
  });

  it("recalculateRanks only ranks eligible businesses", () => {
    const ranksFn = businessStorageSrc.slice(
      businessStorageSrc.indexOf("recalculateRanks"),
    );
    expect(ranksFn).toContain("leaderboard_eligible = true");
  });

  it("zero ratings sets eligibility to false", () => {
    const fnBody = businessStorageSrc.slice(
      businessStorageSrc.indexOf("recalculateBusinessScore"),
      businessStorageSrc.indexOf("recalculateRanks"),
    );
    expect(fnBody).toContain("leaderboardEligible: false");
  });

  it("reads visitType column for dine-in tracking", () => {
    const fnBody = businessStorageSrc.slice(
      businessStorageSrc.indexOf("recalculateBusinessScore"),
      businessStorageSrc.indexOf("recalculateRanks"),
    );
    expect(fnBody).toContain("ratings.visitType");
  });
});

// ── meetsLeaderboardThreshold Unit Tests ─────────────────────────

describe("meetsLeaderboardThreshold — eligibility rules", () => {
  const makeRating = (overrides: Partial<RatingInput> = {}): RatingInput => ({
    visitType: "dine_in",
    dimensions: { foodScore: 8, serviceScore: 7, vibeScore: 7 },
    credibilityWeight: 1.0,
    verificationBoost: 0,
    gamingMultiplier: 1.0,
    daysSinceRating: 0,
    ...overrides,
  });

  it("rejects fewer than 3 raters", () => {
    const ratings = [makeRating(), makeRating()];
    const result = meetsLeaderboardThreshold(ratings);
    expect(result.eligible).toBe(false);
    expect(result.reasons.some(r => r.includes("3 raters"))).toBe(true);
  });

  it("rejects no dine-in ratings", () => {
    const ratings = [
      makeRating({ visitType: "delivery" }),
      makeRating({ visitType: "delivery" }),
      makeRating({ visitType: "takeaway" }),
    ];
    const result = meetsLeaderboardThreshold(ratings);
    expect(result.eligible).toBe(false);
    expect(result.reasons.some(r => r.includes("dine_in"))).toBe(true);
  });

  it("rejects low credibility-weighted sum", () => {
    const ratings = [
      makeRating({ credibilityWeight: 0.10, gamingMultiplier: 0.50 }),
      makeRating({ credibilityWeight: 0.10, gamingMultiplier: 0.50 }),
      makeRating({ credibilityWeight: 0.10, gamingMultiplier: 0.50 }),
    ];
    const result = meetsLeaderboardThreshold(ratings);
    expect(result.eligible).toBe(false);
    expect(result.reasons.some(r => r.includes("0.50 minimum") || r.includes("< 0.50"))).toBe(true);
  });

  it("accepts 3 dine-in ratings from trusted raters", () => {
    const ratings = [makeRating(), makeRating(), makeRating()];
    const result = meetsLeaderboardThreshold(ratings);
    expect(result.eligible).toBe(true);
    expect(result.reasons).toHaveLength(0);
  });

  it("accepts mix of visit types with at least 1 dine-in", () => {
    const ratings = [
      makeRating({ visitType: "dine_in" }),
      makeRating({ visitType: "delivery" }),
      makeRating({ visitType: "takeaway" }),
    ];
    const result = meetsLeaderboardThreshold(ratings);
    expect(result.eligible).toBe(true);
  });

  it("returns multiple rejection reasons", () => {
    const result = meetsLeaderboardThreshold([]);
    expect(result.eligible).toBe(false);
    expect(result.reasons.length).toBeGreaterThanOrEqual(2);
  });
});
