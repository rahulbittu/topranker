/**
 * Sprint 182 — Push Deep Links + Notification Center
 *
 * Validates:
 * 1. Enhanced deep linking in _layout.tsx
 * 2. Notification storage functions
 * 3. Notification API endpoints
 * 4. Push notification persistence
 * 5. Schema has notifications table
 * 6. Route registration
 * 7. Storage barrel exports
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Enhanced deep linking
// ---------------------------------------------------------------------------
describe("Deep linking — _layout.tsx", () => {
  const layoutSrc = readFile("app/_layout.tsx");

  it("handles business deep link with slug", () => {
    expect(layoutSrc).toContain('screen === "business" && slug');
    expect(layoutSrc).toContain("/business/[id]");
  });

  it("handles challenger deep link with id", () => {
    expect(layoutSrc).toContain('screen === "challenger" && id');
  });

  it("handles dish deep link with slug", () => {
    expect(layoutSrc).toContain('screen === "dish" && slug');
    expect(layoutSrc).toContain("/dish/[slug]");
  });

  it("extracts slug from notification data", () => {
    expect(layoutSrc).toContain("data?.slug");
  });

  it("extracts id from notification data", () => {
    expect(layoutSrc).toContain("data?.id");
  });

  it("still handles tab-level navigation", () => {
    expect(layoutSrc).toContain("/(tabs)/profile");
    expect(layoutSrc).toContain("/(tabs)/search");
    expect(layoutSrc).toContain("/(tabs)/challenger");
  });
});

// ---------------------------------------------------------------------------
// 2. Notification storage functions
// ---------------------------------------------------------------------------
describe("Notification storage — notifications.ts", () => {
  const src = readFile("server/storage/notifications.ts");

  it("exports createNotification", () => {
    expect(src).toContain("export async function createNotification");
  });

  it("exports getMemberNotifications", () => {
    expect(src).toContain("export async function getMemberNotifications");
  });

  it("exports markNotificationRead", () => {
    expect(src).toContain("export async function markNotificationRead");
  });

  it("exports markAllNotificationsRead", () => {
    expect(src).toContain("export async function markAllNotificationsRead");
  });

  it("exports getUnreadNotificationCount", () => {
    expect(src).toContain("export async function getUnreadNotificationCount");
  });

  it("returns notifications with unread count", () => {
    expect(src).toContain("unreadCount");
  });

  it("orders by creation date descending", () => {
    expect(src).toContain("desc(notifications.createdAt)");
  });

  it("verifies member ownership when marking read", () => {
    expect(src).toContain("eq(notifications.memberId, memberId)");
  });
});

// ---------------------------------------------------------------------------
// 3. Notification API endpoints
// ---------------------------------------------------------------------------
describe("Notification routes — routes-notifications.ts", () => {
  const src = readFile("server/routes-notifications.ts");

  it("has GET /api/notifications", () => {
    expect(src).toContain('"/api/notifications"');
  });

  it("has GET /api/notifications/unread-count", () => {
    expect(src).toContain('"/api/notifications/unread-count"');
  });

  it("has PATCH /api/notifications/:id/read", () => {
    expect(src).toContain('"/api/notifications/:id/read"');
  });

  it("has POST /api/notifications/mark-all-read", () => {
    expect(src).toContain('"/api/notifications/mark-all-read"');
  });

  it("requires auth for all endpoints", () => {
    expect(src).toContain("requireAuth");
  });

  it("supports pagination", () => {
    expect(src).toContain("page");
    expect(src).toContain("perPage");
    expect(src).toContain("totalPages");
  });

  it("returns unread count with list", () => {
    expect(src).toContain("unreadCount");
  });
});

// ---------------------------------------------------------------------------
// 4. Push notification persistence
// ---------------------------------------------------------------------------
describe("Push module — notification persistence", () => {
  const pushSrc = readFile("server/push.ts");

  it("has persistNotification helper", () => {
    expect(pushSrc).toContain("async function persistNotification");
  });

  it("persists rating response notifications", () => {
    expect(pushSrc).toContain('persistNotification(userId, "rating_response"');
  });

  it("persists tier upgrade notifications", () => {
    expect(pushSrc).toContain('persistNotification(userId, "tier_upgrade"');
  });

  it("persists challenger result notifications", () => {
    expect(pushSrc).toContain('"challenger_result"');
  });

  it("persists new challenger notifications", () => {
    expect(pushSrc).toContain('"new_challenger"');
  });

  it("imports createNotification from storage", () => {
    expect(pushSrc).toContain("createNotification");
  });

  it("catches persist errors without blocking push", () => {
    expect(pushSrc).toContain("Failed to persist notification");
  });
});

// ---------------------------------------------------------------------------
// 5. Schema — notifications table
// ---------------------------------------------------------------------------
describe("Schema — notifications table", () => {
  const schemaSrc = readFile("shared/schema.ts");

  it("has notifications table", () => {
    expect(schemaSrc).toContain('"notifications"');
  });

  it("has memberId field", () => {
    expect(schemaSrc).toContain("member_id");
  });

  it("has type field", () => {
    // notifications table has type column
    expect(schemaSrc).toContain('type: text("type")');
  });

  it("has title and body fields", () => {
    expect(schemaSrc).toContain('title: text("title")');
    expect(schemaSrc).toContain('body: text("body")');
  });

  it("has data jsonb field for deep linking", () => {
    expect(schemaSrc).toContain('data: jsonb("data")');
  });

  it("has read boolean field", () => {
    expect(schemaSrc).toContain('read: boolean("read")');
  });

  it("has indexes for member + read status", () => {
    expect(schemaSrc).toContain("idx_notif_member_read");
  });

  it("exports Notification type", () => {
    expect(schemaSrc).toContain("export type Notification");
  });
});

// ---------------------------------------------------------------------------
// 6. Route registration
// ---------------------------------------------------------------------------
describe("Route registration — notifications", () => {
  const routesSrc = readFile("server/routes.ts");

  it("imports registerNotificationRoutes", () => {
    expect(routesSrc).toContain("registerNotificationRoutes");
    expect(routesSrc).toContain("./routes-notifications");
  });

  it("registers notification routes", () => {
    expect(routesSrc).toContain("registerNotificationRoutes(app)");
  });
});

// ---------------------------------------------------------------------------
// 7. Storage barrel exports
// ---------------------------------------------------------------------------
describe("Storage barrel — notification exports", () => {
  const indexSrc = readFile("server/storage/index.ts");

  it("exports createNotification", () => {
    expect(indexSrc).toContain("createNotification");
  });

  it("exports getMemberNotifications", () => {
    expect(indexSrc).toContain("getMemberNotifications");
  });

  it("exports markNotificationRead", () => {
    expect(indexSrc).toContain("markNotificationRead");
  });

  it("exports markAllNotificationsRead", () => {
    expect(indexSrc).toContain("markAllNotificationsRead");
  });

  it("exports getUnreadNotificationCount", () => {
    expect(indexSrc).toContain("getUnreadNotificationCount");
  });
});
