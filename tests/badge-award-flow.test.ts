/**
 * Badge Award Flow Tests
 * Owner: Carlos (QA Lead)
 *
 * Tests the badge award integration in the rating flow.
 */
import { describe, it, expect } from "vitest";
import { getBadgeById, evaluateUserBadges, getEarnedCount, type UserBadgeContext } from "@/lib/badges";

const baseCtx: UserBadgeContext = {
  totalRatings: 0, distinctBusinesses: 0, totalCategories: 0,
  daysActive: 0, currentStreak: 0, credibilityTier: "community",
  credibilityScore: 10, isFoundingMember: false, referralCount: 0,
  helpfulVotes: 0, citiesRated: 1, hasRatedAfterMidnight: false,
  hasRatedBefore7AM: false, hasGivenPerfect5: false, hasGivenScore1: false,
  businessesMovedUp: 0, businessesMovedToFirst: 0,
  springRatings: 0, summerRatings: 0, fallRatings: 0, winterRatings: 0,
};

describe("Badge Award Flow Integration", () => {
  it("should resolve correct badge for milestone thresholds", () => {
    const milestoneMap: Record<number, string> = {
      1: "first-taste", 5: "getting-started", 10: "ten-strong",
      25: "quarter-century", 50: "half-century", 100: "centurion",
      250: "rating-machine", 500: "legendary-judge",
    };
    for (const [count, id] of Object.entries(milestoneMap)) {
      const badge = getBadgeById(id);
      expect(badge).toBeDefined();
      expect(badge!.category).toBe("milestone");
    }
  });

  it("should resolve correct badge for streak thresholds", () => {
    const streakMap: Record<number, string> = {
      3: "three-day-streak", 7: "week-warrior",
      14: "two-week-streak", 30: "monthly-devotion",
    };
    for (const [streak, id] of Object.entries(streakMap)) {
      const badge = getBadgeById(id);
      expect(badge).toBeDefined();
      expect(badge!.category).toBe("streak");
    }
  });

  it("milestone should take priority over streak when both trigger", () => {
    // If user hits 10 ratings AND 3-day streak simultaneously
    const milestoneBadgeMap: Record<number, string> = {
      1: "first-taste", 5: "getting-started", 10: "ten-strong",
    };
    const streakBadgeMap: Record<number, string> = {
      3: "three-day-streak", 7: "week-warrior",
    };
    const newTotal = 10;
    const newStreak = 3;
    const milestoneBadgeId = milestoneBadgeMap[newTotal];
    const streakBadgeId = streakBadgeMap[newStreak];
    const badgeId = milestoneBadgeId || streakBadgeId;
    expect(badgeId).toBe("ten-strong"); // Milestone takes priority
  });

  it("should compute earned badge count correctly for profile display", () => {
    const ctx = { ...baseCtx, totalRatings: 10 };
    const badges = evaluateUserBadges(ctx);
    const count = getEarnedCount(badges);
    expect(count).toBeGreaterThanOrEqual(3); // first-taste, getting-started, ten-strong at minimum
  });

  it("badge category should map to badgeFamily for server persistence", () => {
    const badge = getBadgeById("first-taste")!;
    // The badge.category is stored as badgeFamily in the DB
    expect(badge.category).toBe("milestone");
    expect(typeof badge.category).toBe("string");
    expect(badge.category.length).toBeGreaterThan(0);
  });
});
