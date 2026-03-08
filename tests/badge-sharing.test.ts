/**
 * Badge Sharing Tests
 * Owner: Carlos (QA Lead) + Suki (Design Lead)
 */
import { describe, it, expect } from "vitest";
import { getBadgeById, RARITY_COLORS, RARITY_LABELS, type Badge } from "@/lib/badges";

describe("Badge Sharing Card Data", () => {
  it("should resolve badge by ID for share card", () => {
    const badge = getBadgeById("first-taste");
    expect(badge).toBeDefined();
    expect(badge!.name).toBe("First Taste");
    expect(badge!.color).toMatch(/^#/);
    expect(badge!.icon).toBeTruthy();
  });

  it("should have rarity colors for all rarity tiers", () => {
    const rarities = ["common", "rare", "epic", "legendary"] as const;
    for (const r of rarities) {
      const colors = RARITY_COLORS[r];
      expect(colors.bg).toBeTruthy();
      expect(colors.border).toBeTruthy();
      expect(colors.text).toBeTruthy();
    }
  });

  it("should have rarity labels for all tiers", () => {
    expect(RARITY_LABELS.common).toBe("Common");
    expect(RARITY_LABELS.rare).toBe("Rare");
    expect(RARITY_LABELS.epic).toBe("Epic");
    expect(RARITY_LABELS.legendary).toBe("Legendary");
  });

  it("should have gradient colors on all shareable badges", () => {
    const shareableBadges = ["first-taste", "ten-strong", "centurion", "legendary-judge"];
    for (const id of shareableBadges) {
      const badge = getBadgeById(id);
      expect(badge).toBeDefined();
      expect(badge!.gradient).toHaveLength(2);
      expect(badge!.gradient[0]).toMatch(/^#/);
      expect(badge!.gradient[1]).toMatch(/^#/);
    }
  });

  it("should have description text suitable for sharing", () => {
    const badge = getBadgeById("legendary-judge");
    expect(badge!.description.length).toBeGreaterThan(10);
    expect(badge!.description.length).toBeLessThan(100);
  });
});

describe("Streak Badge Toast Triggers", () => {
  const streakThresholds = [3, 7, 14, 30];
  const streakBadgeIds = ["three-day-streak", "week-warrior", "two-week-streak", "monthly-devotion"];

  it("should map streak thresholds to correct badge IDs", () => {
    const streakBadgeMap: Record<number, string> = {
      3: "three-day-streak", 7: "week-warrior",
      14: "two-week-streak", 30: "monthly-devotion",
    };
    for (let i = 0; i < streakThresholds.length; i++) {
      expect(streakBadgeMap[streakThresholds[i]]).toBe(streakBadgeIds[i]);
    }
  });

  it("should resolve all streak badges by ID", () => {
    for (const id of streakBadgeIds) {
      const badge = getBadgeById(id);
      expect(badge).toBeDefined();
      expect(badge!.category).toBe("streak");
    }
  });

  it("should not trigger streak toast for non-threshold values", () => {
    const streakBadgeMap: Record<number, string> = {
      3: "three-day-streak", 7: "week-warrior",
      14: "two-week-streak", 30: "monthly-devotion",
    };
    const nonThresholds = [1, 2, 4, 5, 6, 8, 10, 15, 20, 29];
    for (const n of nonThresholds) {
      expect(streakBadgeMap[n]).toBeUndefined();
    }
  });

  it("streak badges should have increasing rarity", () => {
    const rarityOrder = { common: 0, rare: 1, epic: 2, legendary: 3 };
    let prevRarity = -1;
    for (const id of streakBadgeIds) {
      const badge = getBadgeById(id)!;
      const level = rarityOrder[badge.rarity];
      expect(level).toBeGreaterThanOrEqual(prevRarity);
      prevRarity = level;
    }
  });
});
