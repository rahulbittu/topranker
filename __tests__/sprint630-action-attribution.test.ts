/**
 * Sprint 630: Action CTA analytics attribution
 * Decision-to-Action (Phase 5 — Attribution)
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf-8");
}

describe("Sprint 630 — Action CTA Attribution", () => {
  const analyticsSrc = readFile("lib/analytics.ts");
  const actionBarSrc = readFile("components/business/BusinessActionBar.tsx");
  const discoverSrc = readFile("components/search/SubComponents.tsx");
  const rankedSrc = readFile("components/leaderboard/RankedCard.tsx");

  describe("Analytics events", () => {
    it("has action_cta_tap event type", () => {
      expect(analyticsSrc).toContain('"action_cta_tap"');
    });

    it("has action_cta_impression event type", () => {
      expect(analyticsSrc).toContain('"action_cta_impression"');
    });

    it("has action_cta_conversion event type", () => {
      expect(analyticsSrc).toContain('"action_cta_conversion"');
    });

    it("has actionCTAImpression function with surface parameter", () => {
      expect(analyticsSrc).toContain("actionCTAImpression");
      expect(analyticsSrc).toContain("business_detail");
      expect(analyticsSrc).toContain("discover_card");
      expect(analyticsSrc).toContain("ranked_card");
    });

    it("has actionCTAConversion function with surface parameter", () => {
      expect(analyticsSrc).toContain("actionCTAConversion");
    });

    it("impression tracks action_count and action_types", () => {
      expect(analyticsSrc).toContain("action_count");
      expect(analyticsSrc).toContain("action_types");
    });

    it("conversion tracks action_type and surface", () => {
      expect(analyticsSrc).toContain("action_type: actionType");
      expect(analyticsSrc).toContain("surface");
    });
  });

  describe("BusinessActionBar attribution", () => {
    it("imports useEffect", () => {
      expect(actionBarSrc).toContain("useEffect");
    });

    it("fires impression on mount when CTAs exist", () => {
      expect(actionBarSrc).toContain("actionCTAImpression");
      expect(actionBarSrc).toContain("business_detail");
    });

    it("fires conversion on each action handler", () => {
      expect(actionBarSrc).toContain('actionCTAConversion(slug, "menu", "business_detail")');
      expect(actionBarSrc).toContain('actionCTAConversion(slug, "order", "business_detail")');
      expect(actionBarSrc).toContain('actionCTAConversion(slug, "doordash", "business_detail")');
    });

    it("builds types array for impression", () => {
      expect(actionBarSrc).toContain('types.push("menu")');
      expect(actionBarSrc).toContain('types.push("order")');
      expect(actionBarSrc).toContain('types.push("reservation")');
    });
  });

  describe("Card-level tracking (existing)", () => {
    it("discover cards track actionCTATap", () => {
      expect(discoverSrc).toContain("Analytics.actionCTATap");
    });

    it("ranked cards track actionCTATap", () => {
      expect(rankedSrc).toContain("Analytics.actionCTATap");
    });
  });

  describe("File health", () => {
    const thresholds = JSON.parse(readFile("shared/thresholds.json"));

    it("build under 750kb", () => {
      expect(thresholds.build.currentSizeKb).toBeLessThan(750);
    });

    it("tracks 34 files", () => {
      expect(Object.keys(thresholds.files).length).toBe(34);
    });
  });
});
