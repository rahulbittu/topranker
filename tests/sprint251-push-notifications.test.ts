/**
 * Sprint 251 — Push Notification Integration Tests
 * 36 tests across 4 groups:
 *   1. Push notifications static (10)
 *   2. Push notifications runtime (14)
 *   3. Push routes static (8)
 *   4. Integration (4)
 */

import { describe, it, expect, beforeEach } from "vitest";
import fs from "fs";
import path from "path";

// ─── Group 1: Push notifications static (10 tests) ──────────────────────────

describe("Sprint 251 · Push notifications static", () => {
  const filePath = path.resolve(__dirname, "../server/push-notifications.ts");
  let source: string;

  beforeEach(() => {
    source = fs.readFileSync(filePath, "utf-8");
  });

  it("push-notifications.ts exists", () => {
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("exports registerPushToken", () => {
    expect(source).toContain("export function registerPushToken");
  });

  it("exports removePushToken", () => {
    expect(source).toContain("export function removePushToken");
  });

  it("exports getMemberTokens", () => {
    expect(source).toContain("export function getMemberTokens");
  });

  it("exports sendPushNotification", () => {
    expect(source).toContain("export function sendPushNotification");
  });

  it("exports sendBulkPush", () => {
    expect(source).toContain("export function sendBulkPush");
  });

  it("exports getPushStats", () => {
    expect(source).toContain("export function getPushStats");
  });

  it("exports getRecentMessages", () => {
    expect(source).toContain("export function getRecentMessages");
  });

  it("defines MAX_MESSAGES constant", () => {
    expect(source).toContain("MAX_MESSAGES");
    expect(source).toContain("5000");
  });

  it("uses the structured logger", () => {
    expect(source).toContain('log.tag("PushNotifications")');
  });
});

// ─── Group 2: Push notifications runtime (14 tests) ──────────────────────────

describe("Sprint 251 · Push notifications runtime", () => {
  let pushModule: typeof import("../server/push-notifications");

  beforeEach(async () => {
    pushModule = await import("../server/push-notifications");
    pushModule.clearPushData();
  });

  it("registerPushToken creates a token entry", () => {
    const result = pushModule.registerPushToken("m1", "tok-abc", "ios");
    expect(result.memberId).toBe("m1");
    expect(result.token).toBe("tok-abc");
    expect(result.platform).toBe("ios");
    expect(result.registeredAt).toBeTruthy();
  });

  it("registerPushToken returns existing on duplicate", () => {
    const first = pushModule.registerPushToken("m1", "tok-abc", "ios");
    const second = pushModule.registerPushToken("m1", "tok-abc", "ios");
    expect(second.registeredAt).toBe(first.registeredAt);
    expect(pushModule.getMemberTokens("m1")).toHaveLength(1);
  });

  it("registerPushToken supports all platforms", () => {
    pushModule.registerPushToken("m1", "tok-ios", "ios");
    pushModule.registerPushToken("m1", "tok-android", "android");
    pushModule.registerPushToken("m1", "tok-web", "web");
    expect(pushModule.getMemberTokens("m1")).toHaveLength(3);
  });

  it("removePushToken removes a registered token", () => {
    pushModule.registerPushToken("m1", "tok-abc", "ios");
    expect(pushModule.removePushToken("m1", "tok-abc")).toBe(true);
    expect(pushModule.getMemberTokens("m1")).toHaveLength(0);
  });

  it("removePushToken returns false for unknown token", () => {
    expect(pushModule.removePushToken("m1", "no-such")).toBe(false);
  });

  it("removePushToken returns false for unknown member", () => {
    expect(pushModule.removePushToken("unknown", "tok")).toBe(false);
  });

  it("getMemberTokens returns empty array for unknown member", () => {
    expect(pushModule.getMemberTokens("unknown")).toEqual([]);
  });

  it("sendPushNotification succeeds with registered token", () => {
    pushModule.registerPushToken("m1", "tok-abc", "ios");
    const msg = pushModule.sendPushNotification("m1", "Hello", "World");
    expect(msg.status).toBe("sent");
    expect(msg.sentAt).toBeTruthy();
    expect(msg.error).toBeNull();
    expect(msg.id).toBeTruthy();
  });

  it("sendPushNotification fails without tokens", () => {
    const msg = pushModule.sendPushNotification("no-tokens", "Hello", "World");
    expect(msg.status).toBe("failed");
    expect(msg.error).toBe("No push tokens registered");
    expect(msg.sentAt).toBeNull();
  });

  it("sendPushNotification includes data payload", () => {
    pushModule.registerPushToken("m1", "tok-abc", "ios");
    const msg = pushModule.sendPushNotification("m1", "Alert", "Body", { screen: "home" });
    expect(msg.data).toEqual({ screen: "home" });
  });

  it("sendBulkPush returns correct sent/failed counts", () => {
    pushModule.registerPushToken("m1", "tok-1", "ios");
    pushModule.registerPushToken("m2", "tok-2", "android");
    // m3 has no token
    const result = pushModule.sendBulkPush(["m1", "m2", "m3"], "Broadcast", "Hello");
    expect(result.sent).toBe(2);
    expect(result.failed).toBe(1);
  });

  it("getPushStats returns correct counts", () => {
    pushModule.registerPushToken("m1", "tok-1", "ios");
    pushModule.registerPushToken("m1", "tok-2", "web");
    pushModule.registerPushToken("m2", "tok-3", "android");
    pushModule.sendPushNotification("m1", "Hello", "World");
    pushModule.sendPushNotification("no-tokens", "Fail", "Test");
    const stats = pushModule.getPushStats();
    expect(stats.totalTokens).toBe(3);
    expect(stats.uniqueMembers).toBe(2);
    expect(stats.messagesSent).toBe(1);
    expect(stats.messagesFailed).toBe(1);
  });

  it("getRecentMessages returns messages in reverse chronological order", () => {
    pushModule.registerPushToken("m1", "tok-1", "ios");
    pushModule.sendPushNotification("m1", "First", "Body1");
    pushModule.sendPushNotification("m1", "Second", "Body2");
    const messages = pushModule.getRecentMessages(10);
    expect(messages).toHaveLength(2);
    expect(messages[0].title).toBe("Second");
    expect(messages[1].title).toBe("First");
  });

  it("clearPushData resets all state", () => {
    pushModule.registerPushToken("m1", "tok-1", "ios");
    pushModule.sendPushNotification("m1", "Hello", "World");
    pushModule.clearPushData();
    expect(pushModule.getMemberTokens("m1")).toHaveLength(0);
    expect(pushModule.getRecentMessages()).toHaveLength(0);
    expect(pushModule.getPushStats().totalTokens).toBe(0);
  });
});

// ─── Group 3: Push routes static (8 tests) ──────────────────────────────────

describe("Sprint 251 · Push routes static", () => {
  const filePath = path.resolve(__dirname, "../server/routes-push.ts");
  let source: string;

  beforeEach(() => {
    source = fs.readFileSync(filePath, "utf-8");
  });

  it("routes-push.ts exists", () => {
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("exports registerPushRoutes", () => {
    expect(source).toContain("export function registerPushRoutes");
  });

  it("defines POST /api/push/register endpoint", () => {
    expect(source).toContain("/api/push/register");
    expect(source).toContain("app.post");
  });

  it("defines DELETE /api/push/token endpoint", () => {
    expect(source).toContain("/api/push/token");
    expect(source).toContain("app.delete");
  });

  it("defines GET /api/push/tokens endpoint", () => {
    expect(source).toContain("/api/push/tokens");
    expect(source).toContain("app.get");
  });

  it("defines GET /api/admin/push/stats endpoint", () => {
    expect(source).toContain("/api/admin/push/stats");
  });

  it("defines POST /api/admin/push/broadcast endpoint", () => {
    expect(source).toContain("/api/admin/push/broadcast");
  });

  it("uses requireAuth middleware", () => {
    expect(source).toContain("requireAuth");
  });
});

// ─── Group 4: Integration (4 tests) ──────────────────────────────────────────

describe("Sprint 251 · Integration", () => {
  it("routes.ts imports registerPushRoutes", () => {
    const routesPath = path.resolve(__dirname, "../server/routes.ts");
    const source = fs.readFileSync(routesPath, "utf-8");
    expect(source).toContain('import { registerPushRoutes } from "./routes-push"');
  });

  it("routes.ts calls registerPushRoutes(app)", () => {
    const routesPath = path.resolve(__dirname, "../server/routes.ts");
    const source = fs.readFileSync(routesPath, "utf-8");
    expect(source).toContain("registerPushRoutes(app)");
  });

  it("push-notifications module can be imported without errors", async () => {
    const mod = await import("../server/push-notifications");
    expect(typeof mod.registerPushToken).toBe("function");
    expect(typeof mod.sendPushNotification).toBe("function");
    expect(typeof mod.clearPushData).toBe("function");
  });

  it("routes-push module can be imported without errors", async () => {
    const mod = await import("../server/routes-push");
    expect(typeof mod.registerPushRoutes).toBe("function");
  });
});
