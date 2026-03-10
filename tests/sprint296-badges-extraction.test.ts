/**
 * Sprint 296 — badges.ts extraction tests
 *
 * Validates:
 * 1. badges.ts is under 700 LOC (was 886)
 * 2. badge-definitions.ts contains USER_BADGES and BUSINESS_BADGES
 * 3. badges.ts re-exports badge arrays from badge-definitions
 * 4. All badge imports still work (no broken consumers)
 * 5. Badge evaluation functions remain in badges.ts
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Sprint 296 — badges.ts LOC reduction", () => {
  it("badges.ts is under 300 LOC (was 886)", () => {
    const lines = fs.readFileSync(path.resolve("lib/badges.ts"), "utf-8").split("\n").length;
    expect(lines).toBeLessThan(300);
  });

  it("badge-definitions.ts exists", () => {
    expect(fs.existsSync(path.resolve("lib/badge-definitions.ts"))).toBe(true);
  });

  it("badge-definitions.ts contains the bulk of badge data", () => {
    const lines = fs.readFileSync(path.resolve("lib/badge-definitions.ts"), "utf-8").split("\n").length;
    expect(lines).toBeGreaterThan(600);
  });
});

describe("Sprint 296 — badge-definitions.ts exports", () => {
  const defSrc = fs.readFileSync(path.resolve("lib/badge-definitions.ts"), "utf-8");

  it("exports USER_BADGES array", () => {
    expect(defSrc).toContain("export const USER_BADGES: Badge[]");
  });

  it("exports BUSINESS_BADGES array", () => {
    expect(defSrc).toContain("export const BUSINESS_BADGES: Badge[]");
  });

  it("exports ALL_BADGES array", () => {
    expect(defSrc).toContain("export const ALL_BADGES: Badge[]");
  });

  it("imports Badge type from badges.ts", () => {
    expect(defSrc).toMatch(/import.*Badge.*from.*\.\/badges/);
  });
});

describe("Sprint 296 — badges.ts re-exports", () => {
  const badgesSrc = fs.readFileSync(path.resolve("lib/badges.ts"), "utf-8");

  it("imports from badge-definitions", () => {
    expect(badgesSrc).toContain('from "./badge-definitions"');
  });

  it("re-exports USER_BADGES", () => {
    expect(badgesSrc).toContain("USER_BADGES");
  });

  it("re-exports BUSINESS_BADGES", () => {
    expect(badgesSrc).toContain("BUSINESS_BADGES");
  });

  it("re-exports ALL_BADGES", () => {
    expect(badgesSrc).toContain("ALL_BADGES");
  });
});

describe("Sprint 296 — evaluation functions remain in badges.ts", () => {
  const badgesSrc = fs.readFileSync(path.resolve("lib/badges.ts"), "utf-8");

  it("evaluateUserBadges function exists", () => {
    expect(badgesSrc).toContain("export function evaluateUserBadges");
  });

  it("evaluateBusinessBadges function exists", () => {
    expect(badgesSrc).toContain("export function evaluateBusinessBadges");
  });

  it("getBadgeById helper exists", () => {
    expect(badgesSrc).toContain("export function getBadgeById");
  });

  it("UserBadgeContext interface exists", () => {
    expect(badgesSrc).toContain("export interface UserBadgeContext");
  });

  it("BusinessBadgeContext interface exists", () => {
    expect(badgesSrc).toContain("export interface BusinessBadgeContext");
  });
});

describe("Sprint 296 — runtime correctness", () => {
  it("badge arrays are importable and have expected lengths", async () => {
    const { USER_BADGES, BUSINESS_BADGES, ALL_BADGES } = await import("@/lib/badges");
    expect(USER_BADGES.length).toBeGreaterThan(30);
    expect(BUSINESS_BADGES.length).toBeGreaterThan(15);
    expect(ALL_BADGES.length).toBe(USER_BADGES.length + BUSINESS_BADGES.length);
  });

  it("evaluateUserBadges returns badges", async () => {
    const { evaluateUserBadges } = await import("@/lib/badges");
    const ctx = {
      totalRatings: 10, distinctBusinesses: 8, totalCategories: 3,
      daysActive: 15, currentStreak: 3, credibilityTier: "city" as const,
      credibilityScore: 120, isFoundingMember: true, referralCount: 0,
      citiesRated: 1, hasRatedAfterMidnight: false,
      hasRatedBefore7AM: false, hasGivenPerfect5: true, hasGivenScore1: false,
      businessesMovedUp: 1, businessesMovedToFirst: 0,
      springRatings: 3, summerRatings: 0, fallRatings: 0, winterRatings: 0,
    };
    const earned = evaluateUserBadges(ctx);
    expect(earned.length).toBeGreaterThan(0);
    expect(earned.some(e => e.badge.id === "first-taste" && e.earnedAt > 0)).toBe(true);
  });
});
