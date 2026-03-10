/**
 * Sprint 574: Dish Vote Streak Tracking
 *
 * Tests:
 * 1. Component exists and exports correctly
 * 2. Interface shape (props)
 * 3. Streak logic (milestones, tips, progress)
 * 4. Profile integration
 * 5. API type additions
 * 6. Mock data additions
 * 7. LOC thresholds
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 574: DishVoteStreakCard Component", () => {
  const src = readFile("components/profile/DishVoteStreakCard.tsx");

  it("exports DishVoteStreakCard function", () => {
    expect(src).toContain("export function DishVoteStreakCard");
  });

  it("exports DishVoteStreakCardProps interface", () => {
    expect(src).toContain("export interface DishVoteStreakCardProps");
  });

  it("props include currentStreak, longestStreak, totalDishVotes", () => {
    expect(src).toContain("currentStreak: number");
    expect(src).toContain("longestStreak: number");
    expect(src).toContain("totalDishVotes: number");
  });

  it("props include optional topDish, delay, onRatePress", () => {
    expect(src).toContain("topDish?: string");
    expect(src).toContain("delay?: number");
    expect(src).toContain("onRatePress?: () => void");
  });

  it("defines MILESTONES with 3, 7, 14, 30 day thresholds", () => {
    expect(src).toContain("MILESTONES");
    expect(src).toContain("days: 3");
    expect(src).toContain("days: 7");
    expect(src).toContain("days: 14");
    expect(src).toContain("days: 30");
  });

  it("defines STREAK_TIPS for actionable guidance", () => {
    expect(src).toContain("STREAK_TIPS");
    expect(src).toContain("dish");
  });

  it("returns null when totalDishVotes is 0", () => {
    expect(src).toContain("if (totalDishVotes === 0) return null");
  });

  it("calculates next milestone via getNextMilestone", () => {
    expect(src).toContain("getNextMilestone");
    expect(src).toContain("MILESTONES.find");
  });

  it("calculates milestone color via getCurrentMilestoneColor", () => {
    expect(src).toContain("getCurrentMilestoneColor");
  });

  it("uses FadeInDown animation", () => {
    expect(src).toContain("FadeInDown");
    expect(src).toContain("entering=");
  });

  it("renders progress bar with streak color", () => {
    expect(src).toContain("progressBarFill");
    expect(src).toContain("backgroundColor: streakColor");
  });

  it("renders milestone markers with achieved state", () => {
    expect(src).toContain("milestoneRow");
    expect(src).toContain("milestoneCircle");
    expect(src).toContain("achieved");
  });

  it("renders stats row with totalDishVotes and longestStreak", () => {
    expect(src).toContain("dish votes");
    expect(src).toContain("best streak");
    expect(src).toContain("top dish");
  });

  it("renders tip with bulb icon", () => {
    expect(src).toContain("bulb-outline");
    expect(src).toContain("tipText");
  });

  it("renders CTA button when streak is inactive", () => {
    expect(src).toContain("Rate a Dish to Start Your Streak");
    expect(src).toContain("onRatePress");
  });

  it("uses pct helper for progress bar width", () => {
    expect(src).toContain("import { pct }");
    expect(src).toContain("pct(");
  });

  it("imports from brand constants", () => {
    expect(src).toContain("from \"@/constants/brand\"");
    expect(src).toContain("BRAND");
  });

  it("has flame icon for active streak", () => {
    expect(src).toContain("flame");
    expect(src).toContain("flame-outline");
  });

  it("shows streak count in badge", () => {
    expect(src).toContain("streakBadge");
    expect(src).toContain("streakBadgeText");
  });

  it("component LOC under 160", () => {
    const lines = src.split("\n").length;
    expect(lines).toBeLessThan(160);
  });
});

describe("Sprint 574: Profile Integration", () => {
  const profileSrc = readFile("app/(tabs)/profile.tsx");

  it("imports DishVoteStreakCard", () => {
    expect(profileSrc).toContain("import { DishVoteStreakCard }");
    expect(profileSrc).toContain("from \"@/components/profile/DishVoteStreakCard\"");
  });

  it("renders DishVoteStreakCard with streak props", () => {
    expect(profileSrc).toContain("<DishVoteStreakCard");
    expect(profileSrc).toContain("currentStreak={profile.dishVoteStreak");
    expect(profileSrc).toContain("longestStreak={profile.longestDishStreak");
    expect(profileSrc).toContain("totalDishVotes={profile.totalDishVotes");
  });

  it("passes topDish and delay", () => {
    expect(profileSrc).toContain("topDish={profile.topDish}");
    expect(profileSrc).toMatch(/DishVoteStreakCard[\s\S]*delay=/);
  });

  it("profile.tsx LOC under 475", () => {
    const lines = profileSrc.split("\n").length;
    expect(lines).toBeLessThan(475);
  });
});

describe("Sprint 574: API Type Additions", () => {
  const apiSrc = readFile("lib/api.ts");

  it("ApiMemberProfile includes dishVoteStreak field", () => {
    expect(apiSrc).toContain("dishVoteStreak?: number");
  });

  it("ApiMemberProfile includes longestDishStreak field", () => {
    expect(apiSrc).toContain("longestDishStreak?: number");
  });

  it("ApiMemberProfile includes totalDishVotes field", () => {
    expect(apiSrc).toContain("totalDishVotes?: number");
  });

  it("ApiMemberProfile includes topDish field", () => {
    expect(apiSrc).toContain("topDish?: string");
  });
});

describe("Sprint 574: Mock Data", () => {
  const mockSrc = readFile("lib/mock-data.ts");

  it("MOCK_MEMBER_PROFILE includes dishVoteStreak", () => {
    expect(mockSrc).toContain("dishVoteStreak:");
  });

  it("MOCK_MEMBER_PROFILE includes longestDishStreak", () => {
    expect(mockSrc).toContain("longestDishStreak:");
  });

  it("MOCK_MEMBER_PROFILE includes totalDishVotes", () => {
    expect(mockSrc).toContain("totalDishVotes:");
  });

  it("MOCK_MEMBER_PROFILE includes topDish", () => {
    expect(mockSrc).toContain("topDish:");
  });
});

describe("Sprint 574: getMockData Fix (Rankings Bug)", () => {
  const apiSrc = readFile("lib/api.ts");

  it("getMockData handles /api/leaderboard/neighborhoods separately", () => {
    expect(apiSrc).toContain("/api/leaderboard/neighborhoods");
  });

  it("getMockData handles /api/leaderboard/cuisines separately", () => {
    expect(apiSrc).toContain("/api/leaderboard/cuisines");
  });

  it("leaderboard catch-all excludes sub-paths", () => {
    expect(apiSrc).toContain("!path.startsWith(\"/api/leaderboard/\")");
  });
});
