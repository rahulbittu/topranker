/**
 * Sprint 499: Notification Open Tracking
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 499: Notification Open Tracking", () => {
  describe("push-analytics.ts open tracking", () => {
    const src = readFile("server/push-analytics.ts");

    it("defines NotificationOpenRecord interface", () => {
      expect(src).toContain("export interface NotificationOpenRecord");
      expect(src).toContain("notificationId: string");
      expect(src).toContain("openedAt: number");
    });

    it("exports recordNotificationOpen function", () => {
      expect(src).toContain("export function recordNotificationOpen");
    });

    it("exports computeOpenAnalytics function", () => {
      expect(src).toContain("export function computeOpenAnalytics");
    });

    it("exports getNotificationInsights function", () => {
      expect(src).toContain("export function getNotificationInsights");
    });

    it("exports getOpenRecordCount function", () => {
      expect(src).toContain("export function getOpenRecordCount");
    });

    it("tracks unique members in open analytics", () => {
      expect(src).toContain("uniqueMembers");
      expect(src).toContain("memberSet");
    });

    it("computes open rate from delivery and opens", () => {
      expect(src).toContain("openRate");
      expect(src).toContain("totalOpens / delivery.totalSent");
    });

    it("has max record limit for open records", () => {
      expect(src).toContain("MAX_OPEN_RECORDS");
    });

    it("aggregates opens by category", () => {
      expect(src).toContain("byCategory");
    });

    it("returns combined delivery + opens in insights", () => {
      expect(src).toContain("delivery: PushAnalyticsSummary");
    });
  });

  describe("routes-notifications.ts open endpoints", () => {
    const src = readFile("server/routes-notifications.ts");

    it("imports recordNotificationOpen from push-analytics", () => {
      expect(src).toContain("recordNotificationOpen");
      expect(src).toContain("push-analytics");
    });

    it("imports getNotificationInsights from push-analytics", () => {
      expect(src).toContain("getNotificationInsights");
    });

    it("has POST /api/notifications/opened endpoint", () => {
      expect(src).toContain('"/api/notifications/opened"');
    });

    it("requires notificationId and category", () => {
      expect(src).toContain("notificationId");
      expect(src).toContain("category");
      expect(src).toContain("notificationId and category required");
    });

    it("sanitizes input lengths", () => {
      expect(src).toContain("String(notificationId).slice(0, 100)");
      expect(src).toContain("String(category).slice(0, 50)");
    });

    it("requires auth for open tracking", () => {
      expect(src).toContain("requireAuth");
    });

    it("has GET /api/notifications/insights endpoint", () => {
      expect(src).toContain('"/api/notifications/insights"');
    });

    it("supports daysBack parameter for insights", () => {
      expect(src).toContain("daysBack");
    });

    it("caps daysBack at 90 days", () => {
      expect(src).toContain("Math.min(daysBack, 90)");
    });

    it("retains all existing notification endpoints", () => {
      expect(src).toContain('"/api/notifications"');
      expect(src).toContain('"/api/notifications/unread-count"');
      expect(src).toContain('"/api/notifications/:id/read"');
      expect(src).toContain('"/api/notifications/mark-all-read"');
      expect(src).toContain('"/api/notifications/:id"');
    });
  });

  describe("file health", () => {
    it("push-analytics.ts under 280 LOC", () => {
      const loc = readFile("server/push-analytics.ts").split("\n").length;
      expect(loc).toBeLessThan(280);
    });

    it("routes-notifications.ts under 95 LOC", () => {
      const loc = readFile("server/routes-notifications.ts").split("\n").length;
      expect(loc).toBeLessThan(90);
    });
  });
});
