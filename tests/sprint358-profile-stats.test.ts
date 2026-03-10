import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Sprint 358: Profile stats card improvements", () => {
  const profileSrc = fs.readFileSync(
    path.resolve("app/(tabs)/profile.tsx"), "utf-8"
  );

  // ── Enhanced stats row ────────────────────────────────────────

  describe("Enhanced stats row", () => {
    it("should have enhancedStatsRow", () => {
      expect(profileSrc).toContain("enhancedStatsRow");
    });

    it("should display tier weight multiplier", () => {
      expect(profileSrc).toContain("TIER_WEIGHTS[tier]");
      expect(profileSrc).toContain("}x");
    });

    it("should use tier color for weight display", () => {
      expect(profileSrc).toContain("color: tierColor");
    });

    it("should show Weight label", () => {
      expect(profileSrc).toContain(">Weight<");
    });
  });

  // ── Streak display ────────────────────────────────────────────

  describe("Current streak display", () => {
    it("should show streak when > 0", () => {
      expect(profileSrc).toContain("currentStreak ?? 0) > 0");
    });

    it("should display streak count", () => {
      expect(profileSrc).toContain("profile.currentStreak}");
    });

    it("should show Streak label", () => {
      expect(profileSrc).toContain(">Streak<");
    });

    it("should use amber color for streak", () => {
      // The streak stat box uses AMBER for the number
      const streakIdx = profileSrc.indexOf(">Streak<");
      const chunkBefore = profileSrc.slice(Math.max(0, streakIdx - 200), streakIdx);
      expect(chunkBefore).toContain("AMBER");
    });
  });

  // ── Average score display ─────────────────────────────────────

  describe("Average score given", () => {
    it("should compute average from ratingHistory", () => {
      expect(profileSrc).toContain("ratingHistory.reduce((s, r) => s + r.rawScore, 0)");
    });

    it("should show one decimal place", () => {
      expect(profileSrc).toContain(".toFixed(1)");
    });

    it("should only show when ratingHistory has entries", () => {
      expect(profileSrc).toContain("profile.ratingHistory.length > 0");
    });

    it("should show Avg Given label", () => {
      expect(profileSrc).toContain(">Avg Given<");
    });
  });

  // ── Joined date inline ────────────────────────────────────────

  describe("Joined date in enhanced stats", () => {
    it("should show joined date in short format", () => {
      expect(profileSrc).toContain('month: "short", year: "2-digit"');
    });

    it("should show Joined label", () => {
      expect(profileSrc).toContain(">Joined<");
    });

    it("should only show when joinedAt exists", () => {
      // The enhanced stats check for profile.joinedAt
      const enhancedSection = profileSrc.slice(
        profileSrc.indexOf("enhancedStatsRow"),
        profileSrc.indexOf("enhancedStatsRow") + 1000
      );
      expect(enhancedSection).toContain("profile.joinedAt");
    });
  });

  // ── Original stats preserved ──────────────────────────────────

  describe("Original stats row unchanged", () => {
    it("should still show Ratings count", () => {
      expect(profileSrc).toContain("profile.totalRatings.toLocaleString()");
    });

    it("should still show Places count", () => {
      expect(profileSrc).toContain("profile.distinctBusinesses.toLocaleString()");
    });

    it("should still show Categories count", () => {
      expect(profileSrc).toContain("profile.totalCategories.toLocaleString()");
    });

    it("should still show Days count", () => {
      expect(profileSrc).toContain("profile.daysActive.toLocaleString()");
    });

    it("should still show Badges with link", () => {
      expect(profileSrc).toContain("badge-leaderboard");
      expect(profileSrc).toContain("earnedBadgeCount");
    });
  });

  // ── Styles ────────────────────────────────────────────────────

  describe("Enhanced stats styles", () => {
    it("should have enhancedStatBox style", () => {
      expect(profileSrc).toContain("enhancedStatBox:");
    });

    it("should have enhancedStatNum style", () => {
      expect(profileSrc).toContain("enhancedStatNum:");
    });

    it("should have enhancedStatLabel with uppercase", () => {
      expect(profileSrc).toContain("enhancedStatLabel:");
      expect(profileSrc).toContain("textTransform");
    });

    it("should have letter spacing on labels", () => {
      expect(profileSrc).toContain("letterSpacing: 0.5");
    });
  });
});
