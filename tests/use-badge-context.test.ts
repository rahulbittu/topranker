/**
 * useBadgeContext Hook Tests
 * Owner: Carlos (QA Lead) + Mei Lin (Type Safety Lead)
 */
import { describe, it, expect } from "vitest";
import {
  evaluateUserBadges, getUserBadgeCount, getEarnedCount,
  type UserBadgeContext,
} from "@/lib/badges";

// Simulate the hook's core logic (can't call React hooks in plain tests)
function buildBadgeContext(overrides: Partial<UserBadgeContext> = {}) {
  const ctx: UserBadgeContext = {
    totalRatings: 0, distinctBusinesses: 0, totalCategories: 0,
    daysActive: 0, currentStreak: 0, credibilityTier: "community",
    credibilityScore: 10, isFoundingMember: false, referralCount: 0,
    citiesRated: 1, hasRatedAfterMidnight: false,
    hasRatedBefore7AM: false, hasGivenPerfect5: false, hasGivenScore1: false,
    businessesMovedUp: 0, businessesMovedToFirst: 0,
    springRatings: 0, summerRatings: 0, fallRatings: 0, winterRatings: 0,
    ...overrides,
  };
  const badges = evaluateUserBadges(ctx);
  const earnedCount = getEarnedCount(badges);
  const totalPossible = getUserBadgeCount();
  return { badges, earnedCount, totalPossible };
}

describe("useBadgeContext Logic", () => {
  it("should return zero earned badges for new user", () => {
    const { earnedCount } = buildBadgeContext();
    expect(earnedCount).toBe(0);
  });

  it("should return correct count for 10-rating user", () => {
    const { earnedCount } = buildBadgeContext({ totalRatings: 10 });
    expect(earnedCount).toBeGreaterThanOrEqual(3);
  });

  it("should return totalPossible matching user badge count", () => {
    const { totalPossible } = buildBadgeContext();
    expect(totalPossible).toBe(getUserBadgeCount());
    expect(totalPossible).toBeGreaterThan(30);
  });

  it("should produce same result for identical inputs", () => {
    const input = { totalRatings: 25, currentStreak: 7 };
    const result1 = buildBadgeContext(input);
    const result2 = buildBadgeContext(input);
    expect(result1.earnedCount).toBe(result2.earnedCount);
    expect(result1.badges.length).toBe(result2.badges.length);
  });

  it("should include streak badges when streak is active", () => {
    const { badges } = buildBadgeContext({ currentStreak: 7 });
    const weekWarrior = badges.find(b => b.badge.id === "week-warrior");
    expect(weekWarrior?.earnedAt).toBeGreaterThan(0);
  });

  it("should handle founding member flag", () => {
    const { earnedCount: withFounding } = buildBadgeContext({ isFoundingMember: true });
    const { earnedCount: withoutFounding } = buildBadgeContext({ isFoundingMember: false });
    expect(withFounding).toBeGreaterThan(withoutFounding);
  });
});
