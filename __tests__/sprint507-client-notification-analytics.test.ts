/**
 * Sprint 507: Client-side notification analytics
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 507: Client-side Notification Analytics", () => {
  describe("lib/analytics.ts — new event types", () => {
    const src = readFile("lib/analytics.ts");

    it("defines notification_received event", () => {
      expect(src).toContain('"notification_received"');
    });

    it("defines notification_dismissed event", () => {
      expect(src).toContain('"notification_dismissed"');
    });

    it("defines notification_open_reported event", () => {
      expect(src).toContain('"notification_open_reported"');
    });

    it("has notificationReceived convenience method", () => {
      expect(src).toContain("notificationReceived:");
      expect(src).toContain('track("notification_received"');
    });

    it("has notificationDismissed convenience method", () => {
      expect(src).toContain("notificationDismissed:");
      expect(src).toContain('track("notification_dismissed"');
    });

    it("has notificationOpenReported convenience method", () => {
      expect(src).toContain("notificationOpenReported:");
      expect(src).toContain('track("notification_open_reported"');
    });

    it("notificationDismissed tracks notification_id and category", () => {
      expect(src).toContain("notification_id: notificationId");
      expect(src).toContain("category");
    });

    it("stays under 300 LOC", () => {
      const lines = src.split("\n").length;
      expect(lines).toBeLessThan(300);
    });
  });

  describe("app/_layout.tsx — analytics wiring", () => {
    const src = readFile("app/_layout.tsx");

    it("imports Analytics from lib/analytics", () => {
      expect(src).toContain("Analytics");
      expect(src).toContain("@/lib/analytics");
    });

    it("calls notificationOpenReported on notification tap", () => {
      expect(src).toContain("Analytics.notificationOpenReported(");
    });

    it("passes notifId and category to analytics", () => {
      expect(src).toContain('Analytics.notificationOpenReported(notifId, notifType || "unknown")');
    });

    it("retains existing reportNotificationOpened server call", () => {
      expect(src).toContain("reportNotificationOpened(notifId");
    });

    it("retains push token registration", () => {
      expect(src).toContain("registerForPushNotifications");
      expect(src).toContain("savePushToken");
    });
  });
});
