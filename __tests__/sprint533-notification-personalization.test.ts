/**
 * Sprint 533: Push notification personalization — template-first content resolution
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 533: Notification Personalization", () => {
  describe("resolveNotificationContent helper", () => {
    const src = readFile("server/notification-triggers-events.ts");

    it("defines resolveNotificationContent function", () => {
      expect(src).toContain("function resolveNotificationContent");
    });

    it("checks active template first (Priority 1)", () => {
      expect(src).toContain("getActiveTemplateForCategory(category)");
      expect(src).toContain("applyTemplate(template, variables)");
    });

    it("falls back to A/B variant (Priority 2)", () => {
      expect(src).toContain("getNotificationVariant(memberId, category)");
    });

    it("uses replaceAll for A/B variants (not replace)", () => {
      expect(src).toContain("replaceAll(`{${key}}`");
    });

    it("falls back to hardcoded defaults (Priority 3)", () => {
      expect(src).toContain("return { title: defaultTitle, body: defaultBody }");
    });

    it("documents the priority chain in comments", () => {
      expect(src).toContain("Priority 1: Active template");
      expect(src).toContain("Priority 2: A/B variant");
      expect(src).toContain("Priority 3: Hardcoded default");
    });
  });

  describe("Trigger integration", () => {
    const src = readFile("server/notification-triggers-events.ts");

    it("imports getActiveTemplateForCategory", () => {
      expect(src).toContain("getActiveTemplateForCategory");
    });

    it("imports applyTemplate", () => {
      expect(src).toContain("applyTemplate");
    });

    it("uses resolveNotificationContent in onRankingChange", () => {
      expect(src).toContain('resolveNotificationContent(\n        "rankingChange"');
    });

    it("uses resolveNotificationContent in onNewRatingForBusiness", () => {
      expect(src).toContain('resolveNotificationContent(\n        "newRating"');
    });

    it("uses resolveNotificationContent in sendCityHighlightsPush", () => {
      expect(src).toContain('resolveNotificationContent(\n        "cityHighlights"');
    });

    it("passes all relevant variables to ranking change resolver", () => {
      expect(src).toContain("emoji, business: businessName, direction");
      expect(src).toContain("newRank: String(newRank)");
      expect(src).toContain("oldRank: String(oldRank)");
    });

    it("passes all relevant variables to new rating resolver", () => {
      expect(src).toContain("business: businessName, rater: raterName");
      expect(src).toContain("score: score.toFixed(1)");
    });

    it("passes all relevant variables to city highlights resolver", () => {
      expect(src).toContain("city, business: biggestMover.businessName");
      expect(src).toContain("direction, delta: String(biggestDelta)");
    });
  });

  describe("Template system integration", () => {
    const tmplSrc = readFile("server/notification-templates.ts");

    it("has applyTemplate function", () => {
      expect(tmplSrc).toContain("export function applyTemplate");
    });

    it("uses replaceAll for variable substitution", () => {
      expect(tmplSrc).toContain(".replaceAll(placeholder, val)");
    });

    it("has getActiveTemplateForCategory function", () => {
      expect(tmplSrc).toContain("export function getActiveTemplateForCategory");
    });

    it("supports all notification variables", () => {
      expect(tmplSrc).toContain("firstName");
      expect(tmplSrc).toContain("business");
      expect(tmplSrc).toContain("emoji");
      expect(tmplSrc).toContain("direction");
      expect(tmplSrc).toContain("newRank");
      expect(tmplSrc).toContain("score");
    });
  });

  describe("LOC thresholds", () => {
    const triggerSrc = readFile("server/notification-triggers-events.ts");
    const lines = triggerSrc.split("\n").length;

    it("notification-triggers-events.ts stays under 330 LOC", () => {
      expect(lines).toBeLessThan(330);
    });
  });
});
