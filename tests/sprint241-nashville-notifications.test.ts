/**
 * Sprint 241 — Nashville Beta Promotion + Real-Time Notifications
 *
 * Validates:
 * 1. Nashville promoted to beta in city-config
 * 2. Notifications module (server/notifications.ts) — static + runtime
 * 3. Notification routes (server/routes-notifications.ts) — static
 * 4. Integration wiring
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  CITY_REGISTRY,
  getCityConfig,
  getBetaCities,
  getPlannedCities,
  getCityStats,
} from "../shared/city-config";
import {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead,
  deleteNotification,
  getNotificationStats,
  clearNotifications,
} from "../server/notifications";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. Nashville beta promotion
// ---------------------------------------------------------------------------
describe("Nashville beta promotion — shared/city-config.ts", () => {
  it("Nashville exists in CITY_REGISTRY", () => {
    expect(CITY_REGISTRY["Nashville"]).toBeDefined();
  });

  it("Nashville status is beta", () => {
    const nashville = getCityConfig("Nashville");
    expect(nashville).toBeDefined();
    expect(nashville!.status).toBe("beta");
  });

  it("Nashville has launchDate 2026-03-09", () => {
    const nashville = getCityConfig("Nashville");
    expect(nashville!.launchDate).toBe("2026-03-09");
  });

  it("getBetaCities includes Nashville", () => {
    const beta = getBetaCities();
    expect(beta).toContain("Nashville");
  });

  it("getPlannedCities does not include Nashville", () => {
    const planned = getPlannedCities();
    expect(planned).not.toContain("Nashville");
  });

  it("getCityStats shows 4 beta, 0 planned", () => {
    const stats = getCityStats();
    expect(stats.beta).toBe(4);
    expect(stats.planned).toBe(0);
    expect(stats.total).toBe(9);
  });
});

// ---------------------------------------------------------------------------
// 2. Notifications module — static analysis
// ---------------------------------------------------------------------------
describe("Notifications module — server/notifications.ts (static)", () => {
  const src = readFile("server/notifications.ts");

  it("module exists", () => {
    expect(fileExists("server/notifications.ts")).toBe(true);
  });

  it("exports createNotification", () => {
    expect(src).toContain("export function createNotification");
  });

  it("exports getNotifications", () => {
    expect(src).toContain("export function getNotifications");
  });

  it("exports getUnreadCount", () => {
    expect(src).toContain("export function getUnreadCount");
  });

  it("exports markAsRead", () => {
    expect(src).toContain("export function markAsRead");
  });

  it("exports markAllRead", () => {
    expect(src).toContain("export function markAllRead");
  });

  it("exports deleteNotification", () => {
    expect(src).toContain("export function deleteNotification");
  });

  it("exports getNotificationStats", () => {
    expect(src).toContain("export function getNotificationStats");
  });

  it("exports clearNotifications", () => {
    expect(src).toContain("export function clearNotifications");
  });

  it("defines MAX_PER_MEMBER = 100", () => {
    expect(src).toContain("MAX_PER_MEMBER = 100");
  });

  it("uses tagged logger: Notifications", () => {
    expect(src).toContain('"Notifications"');
  });
});

// ---------------------------------------------------------------------------
// 3. Notifications module — runtime
// ---------------------------------------------------------------------------
describe("Notifications module — runtime", () => {
  beforeEach(() => {
    clearNotifications();
  });

  it("createNotification returns a notification object", () => {
    const notif = createNotification("member-1", "rating_received", "New Rating", "Someone rated your business");
    expect(notif.id).toBeTruthy();
    expect(notif.memberId).toBe("member-1");
    expect(notif.type).toBe("rating_received");
    expect(notif.title).toBe("New Rating");
    expect(notif.body).toBe("Someone rated your business");
    expect(notif.read).toBe(false);
    expect(notif.createdAt).toBeTruthy();
  });

  it("getNotifications returns notifications for a member", () => {
    createNotification("member-1", "tier_promoted", "Tier Up!", "You reached Gold tier");
    createNotification("member-1", "badge_earned", "New Badge", "You earned Explorer badge");
    const list = getNotifications("member-1");
    expect(list.length).toBe(2);
  });

  it("getNotifications respects limit parameter", () => {
    createNotification("member-1", "system", "A", "Body A");
    createNotification("member-1", "system", "B", "Body B");
    createNotification("member-1", "system", "C", "Body C");
    const list = getNotifications("member-1", 2);
    expect(list.length).toBe(2);
  });

  it("getNotifications returns newest first", () => {
    createNotification("member-1", "system", "First", "Body");
    createNotification("member-1", "system", "Second", "Body");
    const list = getNotifications("member-1");
    expect(list[0].title).toBe("Second");
    expect(list[1].title).toBe("First");
  });

  it("getNotifications returns empty array for unknown member", () => {
    const list = getNotifications("unknown-member");
    expect(list).toEqual([]);
  });

  it("getUnreadCount returns correct count", () => {
    createNotification("member-1", "rating_received", "A", "Body");
    createNotification("member-1", "system", "B", "Body");
    expect(getUnreadCount("member-1")).toBe(2);
  });

  it("markAsRead marks a notification as read", () => {
    const notif = createNotification("member-1", "claim_approved", "Claim", "Your claim was approved");
    const result = markAsRead(notif.id);
    expect(result).toBe(true);
    expect(getUnreadCount("member-1")).toBe(0);
  });

  it("markAsRead returns false for unknown notification", () => {
    expect(markAsRead("nonexistent-id")).toBe(false);
  });

  it("markAllRead marks all notifications as read", () => {
    createNotification("member-1", "system", "A", "Body");
    createNotification("member-1", "system", "B", "Body");
    createNotification("member-1", "system", "C", "Body");
    const count = markAllRead("member-1");
    expect(count).toBe(3);
    expect(getUnreadCount("member-1")).toBe(0);
  });

  it("markAllRead returns 0 for member with no notifications", () => {
    const count = markAllRead("unknown-member");
    expect(count).toBe(0);
  });

  it("deleteNotification removes a notification", () => {
    const notif = createNotification("member-1", "weekly_digest", "Digest", "Your weekly summary");
    const result = deleteNotification(notif.id);
    expect(result).toBe(true);
    expect(getNotifications("member-1").length).toBe(0);
  });

  it("deleteNotification returns false for unknown notification", () => {
    expect(deleteNotification("nonexistent-id")).toBe(false);
  });

  it("getNotificationStats returns correct totals", () => {
    createNotification("member-1", "system", "A", "Body");
    createNotification("member-2", "system", "B", "Body");
    createNotification("member-2", "system", "C", "Body");
    markAsRead(getNotifications("member-1")[0].id);
    const stats = getNotificationStats();
    expect(stats.totalMembers).toBe(2);
    expect(stats.totalNotifications).toBe(3);
    expect(stats.totalUnread).toBe(2);
  });

  it("clearNotifications clears all when no memberId", () => {
    createNotification("member-1", "system", "A", "Body");
    createNotification("member-2", "system", "B", "Body");
    clearNotifications();
    expect(getNotificationStats().totalNotifications).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 4. Notification routes — static analysis
// ---------------------------------------------------------------------------
describe("Notification routes — server/routes-notifications.ts (static)", () => {
  const src = readFile("server/routes-notifications.ts");

  it("module exists", () => {
    expect(fileExists("server/routes-notifications.ts")).toBe(true);
  });

  it("exports registerNotificationRoutes", () => {
    expect(src).toContain("export function registerNotificationRoutes");
  });

  it("has GET /api/notifications endpoint", () => {
    expect(src).toContain('"/api/notifications"');
    expect(src).toContain("app.get");
  });

  it("has GET /api/notifications/unread-count endpoint", () => {
    expect(src).toContain('"/api/notifications/unread-count"');
  });

  it("has POST /api/notifications/:id/read endpoint", () => {
    expect(src).toContain('"/api/notifications/:id/read"');
    expect(src).toContain("app.post");
  });

  it("has POST /api/notifications/mark-all-read endpoint", () => {
    expect(src).toContain('"/api/notifications/mark-all-read"');
  });

  it("has DELETE /api/notifications/:id endpoint", () => {
    expect(src).toContain('"/api/notifications/:id"');
    expect(src).toContain("app.delete");
  });

  it("imports from ./notifications module", () => {
    expect(src).toContain('from "./notifications"');
  });
});

// ---------------------------------------------------------------------------
// 5. Integration
// ---------------------------------------------------------------------------
describe("Integration — Sprint 241", () => {
  it("routes.ts imports registerNotificationRoutes", () => {
    const src = readFile("server/routes.ts");
    expect(src).toContain("registerNotificationRoutes");
  });

  it("routes.ts calls registerNotificationRoutes(app)", () => {
    const src = readFile("server/routes.ts");
    expect(src).toContain("registerNotificationRoutes(app)");
  });

  it("notifications module imports from logger", () => {
    const src = readFile("server/notifications.ts");
    expect(src).toContain('from "./logger"');
  });

  it("MAX_PER_MEMBER caps at 100 notifications per member", () => {
    clearNotifications();
    for (let i = 0; i < 105; i++) {
      createNotification("cap-test", "system", `Notif ${i}`, "Body");
    }
    const list = getNotifications("cap-test", 200);
    // Default limit is 20, but we pass 200 to see full list
    // However getNotifications slices to limit, so we check stats
    const stats = getNotificationStats();
    expect(stats.totalNotifications).toBe(100); // Capped at MAX_PER_MEMBER
    clearNotifications();
  });
});
