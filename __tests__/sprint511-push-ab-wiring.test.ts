/**
 * Sprint 511: Wire push A/B into notification triggers
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 511: Push A/B Trigger Wiring", () => {
  describe("notification-triggers.ts — weekly digest A/B", () => {
    const src = readFile("server/notification-triggers.ts");

    it("imports getNotificationVariant", () => {
      expect(src).toContain("getNotificationVariant");
      expect(src).toContain("./push-ab-testing");
    });

    it("checks for weeklyDigest A/B variant", () => {
      expect(src).toContain('getNotificationVariant(String(user.id), "weeklyDigest")');
    });

    it("uses variant title when available", () => {
      expect(src).toContain("abVariant.variant.title");
    });

    it("uses variant body with template replacement", () => {
      expect(src).toContain('replace("{firstName}", firstName)');
    });

    it("includes experimentId in push data when A/B active", () => {
      expect(src).toContain("experimentId: abVariant.experimentId");
    });

    it("retains original fallback copy", () => {
      expect(src).toContain("Your weekly rankings update");
    });
  });

  describe("notification-triggers-events.ts — event trigger A/B", () => {
    const src = readFile("server/notification-triggers-events.ts");

    it("imports getNotificationVariant", () => {
      expect(src).toContain("getNotificationVariant");
      expect(src).toContain("./push-ab-testing");
    });

    it("checks for rankingChange A/B variant", () => {
      expect(src).toContain('getNotificationVariant(String(rater.memberId), "rankingChange")');
    });

    it("checks for newRating A/B variant", () => {
      expect(src).toContain('getNotificationVariant(String(rater.memberId), "newRating")');
    });

    it("checks for cityHighlights A/B variant", () => {
      expect(src).toContain('getNotificationVariant(String(user.id), "cityHighlights")');
    });

    it("rankingChange variant supports template variables", () => {
      expect(src).toContain('replace("{emoji}", emoji)');
      expect(src).toContain('replace("{business}", businessName)');
    });

    it("newRating variant supports template variables", () => {
      expect(src).toContain('replace("{rater}", raterName)');
      expect(src).toContain('replace("{score}", score.toFixed(1))');
    });

    it("cityHighlights variant supports template variables", () => {
      expect(src).toContain('replace("{city}", city)');
      expect(src).toContain('replace("{direction}", direction)');
    });

    it("retains original fallback copy for rankingChange", () => {
      expect(src).toContain("moved");
    });

    it("retains original fallback copy for newRating", () => {
      expect(src).toContain("New rating for");
    });

    it("retains original fallback copy for cityHighlights", () => {
      expect(src).toContain("rankings update");
    });

    it("notification-triggers-events.ts stays under 280 LOC", () => {
      const lines = src.split("\n").length;
      expect(lines).toBeLessThan(280);
    });
  });

  describe("all 4 trigger categories wired", () => {
    it("weeklyDigest wired in triggers", () => {
      const src = readFile("server/notification-triggers.ts");
      expect(src).toContain('"weeklyDigest"');
    });

    it("rankingChange wired in events", () => {
      const src = readFile("server/notification-triggers-events.ts");
      expect(src).toContain('"rankingChange"');
    });

    it("newRating wired in events", () => {
      const src = readFile("server/notification-triggers-events.ts");
      expect(src).toContain('"newRating"');
    });

    it("cityHighlights wired in events", () => {
      const src = readFile("server/notification-triggers-events.ts");
      expect(src).toContain('"cityHighlights"');
    });
  });
});
