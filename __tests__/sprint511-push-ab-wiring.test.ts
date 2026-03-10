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

    it("uses resolveNotificationContent for rankingChange (Sprint 533)", () => {
      expect(src).toContain('"rankingChange"');
      expect(src).toContain("resolveNotificationContent");
    });

    it("uses resolveNotificationContent for newRating (Sprint 533)", () => {
      expect(src).toContain('"newRating"');
    });

    it("uses resolveNotificationContent for cityHighlights (Sprint 533)", () => {
      expect(src).toContain('"cityHighlights"');
    });

    it("resolveNotificationContent checks A/B variants via getNotificationVariant", () => {
      expect(src).toContain("getNotificationVariant(memberId, category)");
    });

    it("resolveNotificationContent uses replaceAll for variables", () => {
      expect(src).toContain('replaceAll(`{${key}}`, val)');
    });

    it("resolveNotificationContent checks templates first", () => {
      expect(src).toContain("getActiveTemplateForCategory(category)");
      expect(src).toContain("applyTemplate(template, variables)");
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

    it("notification-triggers-events.ts stays under 330 LOC (Sprint 533)", () => {
      const lines = src.split("\n").length;
      expect(lines).toBeLessThan(330);
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
