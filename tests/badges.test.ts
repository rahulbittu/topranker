/**
 * Achievement Badges System Tests
 * Owner: Carlos (QA Lead) + Jordan (CVO)
 */
import { describe, it, expect } from "vitest";
import {
  USER_BADGES, BUSINESS_BADGES, ALL_BADGES,
  evaluateUserBadges, evaluateBusinessBadges,
  getBadgeById, getBadgesByCategory, getBadgesByRarity,
  getUserBadgeCount, getBusinessBadgeCount,
  getEarnedCount, getNextUnearned,
  RARITY_COLORS, RARITY_LABELS,
  type UserBadgeContext, type BusinessBadgeContext,
} from "@/lib/badges";

const baseUserCtx: UserBadgeContext = {
  totalRatings: 0,
  distinctBusinesses: 0,
  totalCategories: 0,
  daysActive: 0,
  currentStreak: 0,
  credibilityTier: "community",
  credibilityScore: 10,
  isFoundingMember: false,
  referralCount: 0,
  citiesRated: 1,
  hasRatedAfterMidnight: false,
  hasRatedBefore7AM: false,
  hasGivenPerfect5: false,
  hasGivenScore1: false,
  businessesMovedUp: 0,
  businessesMovedToFirst: 0,
  springRatings: 0,
  summerRatings: 0,
  fallRatings: 0,
  winterRatings: 0,
};

const baseBizCtx: BusinessBadgeContext = {
  totalRatings: 0,
  averageScore: 0,
  categoryRank: 50,
  trustedRaterCount: 0,
  topJudgeHighRatings: 0,
  consecutiveWeeksImproved: 0,
  isVerified: false,
  challengerWins: 0,
  isNew: false,
};

describe("Badge Definitions", () => {
  it("should have unique IDs across all badges", () => {
    const ids = ALL_BADGES.map(b => b.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have required fields on every badge", () => {
    for (const badge of ALL_BADGES) {
      expect(badge.id).toBeTruthy();
      expect(badge.name).toBeTruthy();
      expect(badge.description).toBeTruthy();
      expect(badge.icon).toBeTruthy();
      expect(badge.color).toMatch(/^#/);
      expect(badge.gradient).toHaveLength(2);
      expect(["common", "rare", "epic", "legendary"]).toContain(badge.rarity);
      expect(["milestone", "streak", "explorer", "social", "seasonal", "special"]).toContain(badge.category);
      expect(["user", "business", "both"]).toContain(badge.target);
    }
  });

  it("should have user badges and business badges", () => {
    expect(USER_BADGES.length).toBeGreaterThan(25);
    expect(BUSINESS_BADGES.length).toBeGreaterThan(15);
    expect(ALL_BADGES.length).toBe(USER_BADGES.length + BUSINESS_BADGES.length);
  });

  it("should have all rarity levels represented", () => {
    for (const rarity of ["common", "rare", "epic", "legendary"] as const) {
      expect(getBadgesByRarity(rarity).length).toBeGreaterThan(0);
      expect(RARITY_COLORS[rarity]).toBeDefined();
      expect(RARITY_LABELS[rarity]).toBeTruthy();
    }
  });
});

describe("User Badge Evaluation", () => {
  it("should earn no badges with zero activity", () => {
    const result = evaluateUserBadges(baseUserCtx);
    const earned = result.filter(b => b.earnedAt > 0);
    expect(earned.length).toBe(0);
  });

  it("should earn First Taste with 1 rating", () => {
    const result = evaluateUserBadges({ ...baseUserCtx, totalRatings: 1 });
    const firstTaste = result.find(b => b.badge.id === "first-taste");
    expect(firstTaste?.earnedAt).toBeGreaterThan(0);
    expect(firstTaste?.progress).toBe(100);
  });

  it("should show progress for partially completed badges", () => {
    const result = evaluateUserBadges({ ...baseUserCtx, totalRatings: 3 });
    const gettingStarted = result.find(b => b.badge.id === "getting-started");
    expect(gettingStarted?.earnedAt).toBe(0);
    expect(gettingStarted?.progress).toBe(60);
  });

  it("should earn streak badges", () => {
    const result = evaluateUserBadges({ ...baseUserCtx, currentStreak: 7 });
    const weekWarrior = result.find(b => b.badge.id === "week-warrior");
    expect(weekWarrior?.earnedAt).toBeGreaterThan(0);
  });

  it("should earn explorer badges for category diversity", () => {
    const result = evaluateUserBadges({ ...baseUserCtx, totalCategories: 5 });
    const hopper = result.find(b => b.badge.id === "category-hopper");
    expect(hopper?.earnedAt).toBeGreaterThan(0);
  });

  it("should earn tier badges at correct thresholds", () => {
    const result = evaluateUserBadges({ ...baseUserCtx, credibilityScore: 350, credibilityTier: "trusted" });
    const tierCity = result.find(b => b.badge.id === "tier-city");
    const tierTrusted = result.find(b => b.badge.id === "tier-trusted");
    const tierTop = result.find(b => b.badge.id === "tier-top");
    expect(tierCity?.earnedAt).toBeGreaterThan(0);
    expect(tierTrusted?.earnedAt).toBeGreaterThan(0);
    expect(tierTop?.earnedAt).toBe(0);
  });

  it("should earn founding member badge", () => {
    const result = evaluateUserBadges({ ...baseUserCtx, isFoundingMember: true });
    const founding = result.find(b => b.badge.id === "founding-member");
    expect(founding?.earnedAt).toBeGreaterThan(0);
    expect(founding?.badge.rarity).toBe("legendary");
  });

  it("should earn social badges for referrals", () => {
    const result = evaluateUserBadges({ ...baseUserCtx, referralCount: 5 });
    const squad = result.find(b => b.badge.id === "squad-builder");
    expect(squad?.earnedAt).toBeGreaterThan(0);
  });

  it("should earn seasonal badges for spring ratings", () => {
    const result = evaluateUserBadges({ ...baseUserCtx, springRatings: 5 });
    const spring = result.find(b => b.badge.id === "spring-explorer");
    expect(spring?.earnedAt).toBeGreaterThan(0);
  });

  it("should show seasonal progress for partial completion", () => {
    const result = evaluateUserBadges({ ...baseUserCtx, summerRatings: 3 });
    const summer = result.find(b => b.badge.id === "summer-heat");
    expect(summer?.earnedAt).toBe(0);
    expect(summer?.progress).toBe(60);
  });

  it("should earn year-round badge only when all seasons complete", () => {
    const partial = evaluateUserBadges({
      ...baseUserCtx, springRatings: 5, summerRatings: 5, fallRatings: 5, winterRatings: 0,
    });
    const yearRound = partial.find(b => b.badge.id === "year-round");
    expect(yearRound?.earnedAt).toBe(0);
    expect(yearRound?.progress).toBe(75);

    const full = evaluateUserBadges({
      ...baseUserCtx, springRatings: 5, summerRatings: 5, fallRatings: 5, winterRatings: 5,
    });
    const yearRoundFull = full.find(b => b.badge.id === "year-round");
    expect(yearRoundFull?.earnedAt).toBeGreaterThan(0);
  });

  it("should cap progress at 100", () => {
    const result = evaluateUserBadges({ ...baseUserCtx, totalRatings: 999 });
    for (const badge of result) {
      expect(badge.progress).toBeLessThanOrEqual(100);
    }
  });
});

describe("Business Badge Evaluation", () => {
  it("should earn no badges with zero ratings", () => {
    const result = evaluateBusinessBadges(baseBizCtx);
    const earned = result.filter(b => b.earnedAt > 0);
    expect(earned.length).toBe(0);
  });

  it("should earn On the Map with first rating", () => {
    const result = evaluateBusinessBadges({ ...baseBizCtx, totalRatings: 1 });
    const onMap = result.find(b => b.badge.id === "biz-first-rating");
    expect(onMap?.earnedAt).toBeGreaterThan(0);
  });

  it("should earn ranking badges", () => {
    const result = evaluateBusinessBadges({ ...baseBizCtx, totalRatings: 30, categoryRank: 1, averageScore: 4.5 });
    const numberOne = result.find(b => b.badge.id === "biz-number-one");
    expect(numberOne?.earnedAt).toBeGreaterThan(0);
    expect(numberOne?.badge.rarity).toBe("legendary");
  });

  it("should earn quality badges with enough ratings", () => {
    const result = evaluateBusinessBadges({ ...baseBizCtx, totalRatings: 30, averageScore: 4.9, categoryRank: 1 });
    const exceptional = result.find(b => b.badge.id === "biz-exceptional");
    expect(exceptional?.earnedAt).toBeGreaterThan(0);
    const perfect = result.find(b => b.badge.id === "biz-perfect-rep");
    expect(perfect?.earnedAt).toBeGreaterThan(0);
  });

  it("should earn verified badge", () => {
    const result = evaluateBusinessBadges({ ...baseBizCtx, isVerified: true });
    const verified = result.find(b => b.badge.id === "biz-verified");
    expect(verified?.earnedAt).toBeGreaterThan(0);
  });

  it("should earn trusted-approved badge", () => {
    const result = evaluateBusinessBadges({ ...baseBizCtx, trustedRaterCount: 5 });
    const trusted = result.find(b => b.badge.id === "biz-trusted-approved");
    expect(trusted?.earnedAt).toBeGreaterThan(0);
  });
});

describe("Badge Helpers", () => {
  it("getBadgeById returns correct badge", () => {
    const badge = getBadgeById("first-taste");
    expect(badge?.name).toBe("First Taste");
  });

  it("getBadgeById returns undefined for invalid id", () => {
    expect(getBadgeById("nonexistent")).toBeUndefined();
  });

  it("getBadgesByCategory returns filtered list", () => {
    const milestones = getBadgesByCategory("milestone");
    expect(milestones.length).toBeGreaterThan(5);
    expect(milestones.every(b => b.category === "milestone")).toBe(true);
  });

  it("getUserBadgeCount and getBusinessBadgeCount are correct", () => {
    expect(getUserBadgeCount()).toBe(USER_BADGES.length);
    expect(getBusinessBadgeCount()).toBe(BUSINESS_BADGES.length);
  });

  it("getEarnedCount counts correctly", () => {
    const result = evaluateUserBadges({ ...baseUserCtx, totalRatings: 10 });
    const count = getEarnedCount(result);
    expect(count).toBeGreaterThan(0);
  });

  it("getNextUnearned returns highest progress unearned badge", () => {
    const result = evaluateUserBadges({ ...baseUserCtx, totalRatings: 3 });
    const next = getNextUnearned(result);
    expect(next).toBeDefined();
    expect(next!.earnedAt).toBe(0);
    expect(next!.progress).toBeGreaterThan(0);
  });
});
