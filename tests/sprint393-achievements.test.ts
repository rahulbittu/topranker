/**
 * Sprint 393: Profile Achievements & Milestones Display
 *
 * Verifies the AchievementsSection component: milestones, earned/upcoming,
 * grid display, and integration in profile.tsx.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ── 1. AchievementsSection component ────────────────────────────────

describe("Sprint 393 — AchievementsSection component", () => {
  const src = readFile("components/profile/AchievementsSection.tsx");

  it("exports AchievementsSection function", () => {
    expect(src).toContain("export function AchievementsSection");
  });

  it("exports AchievementsSectionProps interface", () => {
    expect(src).toContain("export interface AchievementsSectionProps");
  });

  it("accepts totalRatings prop", () => {
    expect(src).toContain("totalRatings: number");
  });

  it("accepts distinctBusinesses prop", () => {
    expect(src).toContain("distinctBusinesses: number");
  });

  it("accepts tier prop", () => {
    expect(src).toContain("tier: CredibilityTier");
  });

  it("accepts currentStreak prop", () => {
    expect(src).toContain("currentStreak: number");
  });

  it("accepts earnedBadgeCount prop", () => {
    expect(src).toContain("earnedBadgeCount: number");
  });

  it("accepts daysActive prop", () => {
    expect(src).toContain("daysActive: number");
  });
});

// ── 2. Milestone definitions ────────────────────────────────────────

describe("Sprint 393 — Milestone definitions", () => {
  const src = readFile("components/profile/AchievementGallery.tsx");

  it("defines First Rating milestone", () => {
    expect(src).toContain("First Rating");
    expect(src).toContain("totalRatings >= 1");
  });

  it("defines Getting Started milestone (5 ratings)", () => {
    expect(src).toContain("Getting Started");
    expect(src).toContain("totalRatings >= 5");
  });

  it("defines Power Rater milestone (25 ratings)", () => {
    expect(src).toContain("Power Rater");
    expect(src).toContain("totalRatings >= 25");
  });

  it("defines Explorer milestone (5 places)", () => {
    expect(src).toContain("Explorer");
    expect(src).toContain("distinctBusinesses >= 5");
  });

  it("defines tier milestones", () => {
    expect(src).toContain("City Tier");
    expect(src).toContain("Trusted Tier");
    expect(src).toContain("Top Judge");
  });

  it("defines streak milestone", () => {
    expect(src).toContain("On Fire");
    expect(src).toContain("currentStreak >= 3");
  });

  it("defines badge collector milestone", () => {
    expect(src).toContain("Badge Collector");
    expect(src).toContain("earnedBadgeCount >= 5");
  });
});

// ── 3. UI elements ──────────────────────────────────────────────────

describe("Sprint 393 — Achievements UI", () => {
  const src = readFile("components/profile/AchievementGallery.tsx");

  it("shows earned count badge", () => {
    expect(src).toContain("headerBadge");
    expect(src).toContain("totalEarned");
  });

  it("shows grid of earned milestones", () => {
    expect(src).toContain("categoryGrid");
    expect(src).toContain("AchievementTile");
  });

  it("shows next milestone with dashed border", () => {
    expect(src).toContain("emptyContainer");
    expect(src).toContain("Achievements Gallery");
  });

  it("has title 'Achievements'", () => {
    expect(src).toContain("Achievements Gallery");
    expect(src).toContain("trophy-outline");
  });
});

// ── 4. Profile integration ──────────────────────────────────────────

describe("Sprint 393 — Profile integration", () => {
  const src = readFile("app/(tabs)/profile.tsx");

  it("imports AchievementsSection", () => {
    expect(src).toContain("AchievementsSection");
    expect(src).toContain("components/profile/AchievementsSection");
  });

  it("renders AchievementsSection with profile data", () => {
    expect(src).toContain("<AchievementsSection");
    expect(src).toContain("totalRatings={profile.totalRatings}");
    expect(src).toContain("distinctBusinesses={profile.distinctBusinesses}");
    expect(src).toContain("tier={tier}");
  });
});
