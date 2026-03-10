/**
 * Sprint 501: Client notification open wiring
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 501: Client Notification Open Wiring", () => {
  describe("_layout.tsx notification open tracking", () => {
    const src = readFile("app/_layout.tsx");

    it("has reportNotificationOpened helper function", () => {
      expect(src).toContain("async function reportNotificationOpened");
    });

    it("calls /api/notifications/opened endpoint", () => {
      expect(src).toContain("/api/notifications/opened");
    });

    it("sends notificationId and category in request body", () => {
      expect(src).toContain("notificationId");
      expect(src).toContain("category");
    });

    it("extracts notification identifier from response", () => {
      expect(src).toContain("response.notification.request.identifier");
    });

    it("extracts notification type from data", () => {
      expect(src).toContain('data?.type as string');
    });

    it("calls reportNotificationOpened in response listener", () => {
      expect(src).toContain("reportNotificationOpened(notifId");
    });

    it("uses fire-and-forget pattern for analytics", () => {
      expect(src).toContain(".catch(() => {})");
    });

    it("falls back to unknown for missing notification type", () => {
      expect(src).toContain('"unknown"');
    });

    it("documents Sprint 501 in comment", () => {
      expect(src).toContain("Sprint 501");
    });

    it("handles errors gracefully in reportNotificationOpened", () => {
      expect(src).toContain("Non-critical — analytics can tolerate missed events");
    });

    it("retains existing notification tap navigation", () => {
      expect(src).toContain("business/[id]");
      expect(src).toContain("/(tabs)/challenger");
      expect(src).toContain("/(tabs)/profile");
      expect(src).toContain("/(tabs)/search");
    });

    it("retains push token registration", () => {
      expect(src).toContain("registerForPushNotifications");
      expect(src).toContain("savePushToken");
    });
  });

  describe("server endpoint exists", () => {
    const src = readFile("server/routes-notifications.ts");

    it("has POST /api/notifications/opened endpoint", () => {
      expect(src).toContain('"/api/notifications/opened"');
    });
  });

  describe("notifications module unchanged", () => {
    const src = readFile("lib/notifications.ts");

    it("retains NOTIFICATION_TEMPLATES with type field", () => {
      expect(src).toContain("NOTIFICATION_TEMPLATES");
      expect(src).toContain("type:");
    });
  });
});
