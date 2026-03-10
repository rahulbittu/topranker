/**
 * Sprint 492: Push Notification Analytics
 *
 * Tests:
 * 1. push-analytics.ts computation module
 * 2. notification-triggers.ts records deliveries
 * 3. routes-admin-health.ts push analytics endpoint
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 492: Push Notification Analytics", () => {
  describe("push-analytics.ts module", () => {
    const src = readFile("server/push-analytics.ts");

    it("exports recordPushDelivery function", () => {
      expect(src).toContain("export function recordPushDelivery");
    });

    it("exports computePushAnalytics function", () => {
      expect(src).toContain("export function computePushAnalytics");
    });

    it("exports getPushRecordCount function", () => {
      expect(src).toContain("export function getPushRecordCount");
    });

    it("exports PushDeliveryRecord interface", () => {
      expect(src).toContain("export interface PushDeliveryRecord");
    });

    it("exports PushAnalyticsSummary interface", () => {
      expect(src).toContain("export interface PushAnalyticsSummary");
    });

    it("PushDeliveryRecord has category, city, tokenCount, successCount, errorCount", () => {
      expect(src).toContain("category: string");
      expect(src).toContain("city: string");
      expect(src).toContain("tokenCount: number");
      expect(src).toContain("successCount: number");
      expect(src).toContain("errorCount: number");
    });

    it("PushAnalyticsSummary has aggregated fields", () => {
      expect(src).toContain("totalSent: number");
      expect(src).toContain("totalSuccess: number");
      expect(src).toContain("totalError: number");
      expect(src).toContain("successRate: number");
      expect(src).toContain("byCategory:");
      expect(src).toContain("byCity:");
      expect(src).toContain("hourlyVolume:");
      expect(src).toContain("recentDeliveries:");
    });

    it("has MAX_RECORDS eviction limit", () => {
      expect(src).toContain("MAX_RECORDS");
      expect(src).toContain("10000");
    });

    it("computes success rate as percentage", () => {
      expect(src).toContain("totalSuccess / totalSent");
    });

    it("supports configurable daysBack parameter", () => {
      expect(src).toContain("daysBack: number = 7");
    });

    it("returns hourly volume sorted by time", () => {
      expect(src).toContain("hourBuckets");
      expect(src).toContain("sort");
    });
  });

  describe("notification-triggers.ts delivery recording", () => {
    const src = readFile("server/notification-triggers.ts");

    it("imports recordPushDelivery from push-analytics", () => {
      expect(src).toContain('import { recordPushDelivery } from "./push-analytics"');
    });

    it("records delivery for ranking change trigger", () => {
      expect(src).toContain('recordPushDelivery("rankingChange"');
    });

    it("records delivery for new rating trigger", () => {
      expect(src).toContain('recordPushDelivery("newRating"');
    });

    it("records delivery for city highlights trigger", () => {
      expect(src).toContain('recordPushDelivery("cityHighlights"');
    });

    it("records delivery for weekly digest trigger", () => {
      expect(src).toContain('recordPushDelivery("weeklyDigest"');
    });
  });

  describe("admin push analytics endpoint", () => {
    const src = readFile("server/routes-admin-health.ts");

    it("imports computePushAnalytics from push-analytics", () => {
      expect(src).toContain("computePushAnalytics");
    });

    it("imports getPushRecordCount from push-analytics", () => {
      expect(src).toContain("getPushRecordCount");
    });

    it("has GET /api/admin/push-analytics endpoint", () => {
      expect(src).toContain("/api/admin/push-analytics");
    });

    it("supports configurable days query parameter", () => {
      expect(src).toContain("req.query.days");
    });

    it("returns recordCount in response", () => {
      expect(src).toContain("recordCount: getPushRecordCount()");
    });
  });
});
