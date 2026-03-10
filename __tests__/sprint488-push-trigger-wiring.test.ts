/**
 * Sprint 488: Push Trigger Wiring
 *
 * Tests:
 * 1. routes.ts wires onRankingChange + onNewRatingForBusiness in POST /api/ratings
 * 2. routes.ts migrates tier upgrade from push.ts to notification-triggers.ts
 * 3. notification-triggers.ts has startCityHighlightsScheduler
 * 4. index.ts starts city highlights scheduler
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Sprint 488: Push Trigger Wiring", () => {
  describe("routes.ts rating submission trigger wiring", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../server/routes-ratings.ts"),
      "utf-8"
    );

    it("imports onRankingChange from notification-triggers", () => {
      expect(src).toContain("onRankingChange");
      expect(src).toContain('import("./notification-triggers")');
    });

    it("imports onNewRatingForBusiness from notification-triggers", () => {
      expect(src).toContain("onNewRatingForBusiness");
    });

    it("calls onRankingChange when rank changes after rating", () => {
      expect(src).toContain("result.rankChanged && result.prevRank && result.newRank");
      expect(src).toContain("onRankingChange(parsed.data.businessId, biz.name, result.prevRank, result.newRank, biz.city)");
    });

    it("calls onNewRatingForBusiness with business name and rater info", () => {
      expect(src).toContain("onNewRatingForBusiness(parsed.data.businessId, biz.name, memberId, raterName, score)");
    });

    it("uses fire-and-forget pattern with .catch(() => {}) for triggers", () => {
      expect(src).toContain("onRankingChange(parsed.data.businessId, biz.name, result.prevRank, result.newRank, biz.city).catch(() => {})");
      expect(src).toContain("onNewRatingForBusiness(parsed.data.businessId, biz.name, memberId, raterName, score).catch(() => {})");
    });

    it("migrates tier upgrade to onTierUpgrade from notification-triggers", () => {
      expect(src).toContain("onTierUpgrade(memberId, req.user!.pushToken, result.newTier)");
      expect(src).not.toContain("notifyTierUpgrade");
    });

    it("gets business name for trigger calls via getBusinessById", () => {
      expect(src).toContain("const biz = await getBusinessById(parsed.data.businessId)");
    });

    it("gets rater display name from req.user", () => {
      expect(src).toContain('const raterName = req.user!.displayName || "Someone"');
    });

    it("uses weightedScore or q1Score for notification score", () => {
      expect(src).toContain("result.rating.weightedScore ?? result.rating.q1Score");
    });
  });

  describe("notification-triggers-events.ts city highlights scheduler (moved Sprint 504)", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../server/notification-triggers-events.ts"),
      "utf-8"
    );

    it("exports startCityHighlightsScheduler function", () => {
      expect(src).toContain("export function startCityHighlightsScheduler");
    });

    it("schedules city highlights for Monday 11am UTC", () => {
      expect(src).toContain("setUTCHours(11, 0, 0, 0)");
    });

    it("imports getActiveCities and getBetaCities for city list", () => {
      expect(src).toContain('getActiveCities, getBetaCities');
      expect(src).toContain('@shared/city-config');
    });

    it("iterates over all cities and calls sendCityHighlightsPush", () => {
      expect(src).toContain("sendCityHighlightsPush(city)");
    });

    it("logs total pushes sent across all cities", () => {
      expect(src).toContain("City highlights completed:");
    });

    it("returns NodeJS.Timeout for graceful shutdown", () => {
      expect(src).toContain("return initialTimeout");
    });
  });

  describe("index.ts scheduler startup", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../server/index.ts"),
      "utf-8"
    );

    it("imports startCityHighlightsScheduler from notification-triggers", () => {
      expect(src).toContain("startCityHighlightsScheduler");
    });

    it("starts city highlights scheduler at server boot", () => {
      expect(src).toContain("const cityHighlightsTimeout = startCityHighlightsScheduler()");
    });

    it("clears city highlights timeout on graceful shutdown", () => {
      expect(src).toContain("clearTimeout(cityHighlightsTimeout)");
    });
  });
});
