/**
 * Sprint 481: Push Notification Triggers for New Categories
 *
 * Tests:
 * 1. onRankingChange trigger structure
 * 2. onNewRatingForBusiness trigger structure
 * 3. sendCityHighlightsPush trigger structure
 * 4. Preference checks for each trigger
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Sprint 481: Push Notification Triggers (moved to events file Sprint 504)", () => {
  const src = fs.readFileSync(
    path.resolve(__dirname, "../server/notification-triggers-events.ts"),
    "utf-8"
  );

  describe("onRankingChange trigger", () => {
    it("exports onRankingChange async function", () => {
      expect(src).toContain("export async function onRankingChange");
    });

    it("accepts businessId, businessName, oldRank, newRank, city", () => {
      expect(src).toContain("businessId: string");
      expect(src).toContain("businessName: string");
      expect(src).toContain("oldRank: number");
      expect(src).toContain("newRank: number");
      expect(src).toContain("city: string");
    });

    it("skips insignificant changes (delta < 2)", () => {
      expect(src).toContain("if (delta < 2) return 0");
    });

    it("queries distinct raters of the business with push tokens", () => {
      expect(src).toContain("selectDistinct");
      expect(src).toContain("eq(ratings.businessId, businessId)");
      expect(src).toContain("isNotNull(members.pushToken)");
    });

    it("respects rankingChanges preference", () => {
      expect(src).toContain("prefs.rankingChanges === false");
    });

    it("sends push with rank direction and position", () => {
      expect(src).toContain("moved ${direction}");
      expect(src).toContain("Now ranked #${newRank} in ${city}");
    });

    it("returns count of notifications sent", () => {
      expect(src).toContain("return sent");
    });
  });

  describe("onNewRatingForBusiness trigger", () => {
    it("exports onNewRatingForBusiness async function", () => {
      expect(src).toContain("export async function onNewRatingForBusiness");
    });

    it("accepts businessId, businessName, ratingMemberId, raterName, score", () => {
      expect(src).toContain("ratingMemberId: string");
      expect(src).toContain("raterName: string");
      expect(src).toContain("score: number");
    });

    it("excludes the rater who submitted (ne condition)", () => {
      expect(src).toContain("ne(ratings.memberId, ratingMemberId)");
    });

    it("respects savedBusinessAlerts preference", () => {
      expect(src).toContain("prefs.savedBusinessAlerts === false");
    });

    it("sends push with rater name and score", () => {
      expect(src).toContain("${raterName} gave it a ${score.toFixed(1)}");
    });
  });

  describe("sendCityHighlightsPush trigger", () => {
    it("exports sendCityHighlightsPush async function", () => {
      expect(src).toContain("export async function sendCityHighlightsPush");
    });

    it("accepts city parameter", () => {
      expect(src).toContain("sendCityHighlightsPush(city: string)");
    });

    it("queries rank history for past week", () => {
      expect(src).toContain("7 * 86400000");
      expect(src).toContain("gte(rankHistory.createdAt, oneWeekAgo)");
    });

    it("finds biggest mover by rank delta", () => {
      expect(src).toContain("biggestMover");
      expect(src).toContain("biggestDelta");
    });

    it("skips if biggest delta is less than 2", () => {
      expect(src).toContain("if (biggestDelta < 2) return 0");
    });

    it("queries city users with push tokens", () => {
      expect(src).toContain("eq(members.city, city)");
      expect(src).toContain("isNotNull(members.pushToken)");
    });

    it("respects cityAlerts preference", () => {
      expect(src).toContain("prefs.cityAlerts === false");
    });

    it("sends push with biggest mover info", () => {
      expect(src).toContain("${biggestMover.businessName} ${direction} ${biggestDelta} spots");
    });
  });

  describe("module structure", () => {
    it("imports sendPushNotification from push module", () => {
      expect(src).toContain('import { sendPushNotification } from "./push"');
    });

    it("documents event triggers in header comment", () => {
      expect(src).toContain("onRankingChange");
      expect(src).toContain("onNewRatingForBusiness");
      expect(src).toContain("sendCityHighlightsPush");
      expect(src).toContain("startCityHighlightsScheduler");
    });
  });
});
