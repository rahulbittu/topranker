/**
 * Sprint 628: Compact action quick-links on discover + ranked cards
 * Decision-to-Action CTAs (Phase 3 — Cards)
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf-8");
}

describe("Sprint 628 — Card Action Quick-Links", () => {
  const discoverSrc = readFile("components/search/SubComponents.tsx");
  const rankedSrc = readFile("components/leaderboard/RankedCard.tsx");
  const analyticsSrc = readFile("lib/analytics.ts");

  describe("Discover card (BusinessCard) quick-links", () => {
    it("has cardActionsRow layout", () => {
      expect(discoverSrc).toContain("cardActionsRow");
    });

    it("has quickActions container", () => {
      expect(discoverSrc).toContain("quickActions");
    });

    it("has quickActionBtn style", () => {
      expect(discoverSrc).toContain("quickActionBtn");
    });

    it("shows call icon when phone exists", () => {
      expect(discoverSrc).toContain("item.phone");
      expect(discoverSrc).toContain("call-outline");
    });

    it("shows directions icon when lat/lng exists", () => {
      expect(discoverSrc).toContain("navigate-outline");
      expect(discoverSrc).toContain("directions_card");
    });

    it("shows order/menu icon when URLs exist", () => {
      expect(discoverSrc).toContain("item.orderUrl || item.menuUrl");
      expect(discoverSrc).toContain("bag-handle-outline");
      expect(discoverSrc).toContain("restaurant-outline");
    });

    it("tracks analytics for card actions", () => {
      expect(discoverSrc).toContain("actionCTATap");
      expect(discoverSrc).toContain("call_card");
      expect(discoverSrc).toContain("directions_card");
      expect(discoverSrc).toContain("order_card");
    });

    it("stops propagation on quick-action taps", () => {
      // Each quick-action handler calls e.stopPropagation()
      const stopCount = (discoverSrc.match(/e\.stopPropagation/g) || []).length;
      expect(stopCount).toBeGreaterThanOrEqual(4); // rate + 3 quick actions
    });
  });

  describe("Ranked card quick-links", () => {
    it("has quickActionsRow", () => {
      expect(rankedSrc).toContain("quickActionsRow");
    });

    it("has quickActionBtn style", () => {
      expect(rankedSrc).toContain("quickActionBtn");
    });

    it("conditionally shows quick actions row", () => {
      expect(rankedSrc).toContain("item.phone || (item.lat && item.lng) || item.orderUrl || item.menuUrl");
    });

    it("shows call icon", () => {
      expect(rankedSrc).toContain("call-outline");
      expect(rankedSrc).toContain("call_ranked");
    });

    it("shows directions icon", () => {
      expect(rankedSrc).toContain("navigate-outline");
      expect(rankedSrc).toContain("directions_ranked");
    });

    it("shows order/menu icon", () => {
      expect(rankedSrc).toContain("bag-handle-outline");
      expect(rankedSrc).toContain("order_ranked");
    });

    it("imports Linking and Platform", () => {
      expect(rankedSrc).toContain("Linking");
      expect(rankedSrc).toContain("Platform");
    });

    it("tracks analytics for ranked card actions", () => {
      expect(rankedSrc).toContain("Analytics.actionCTATap");
    });
  });

  describe("Analytics support", () => {
    it("has actionCTATap function", () => {
      expect(analyticsSrc).toContain("actionCTATap");
    });
  });

  describe("File health", () => {
    const thresholds = JSON.parse(readFile("shared/thresholds.json"));

    it("build under 750kb", () => {
      expect(thresholds.build.currentSizeKb).toBeLessThan(750);
    });

    it("tracks 31 files", () => {
      expect(Object.keys(thresholds.files).length).toBe(31);
    });
  });
});
