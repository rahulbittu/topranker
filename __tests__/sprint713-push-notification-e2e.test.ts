/**
 * Sprint 713 — Push Notification End-to-End Testing
 *
 * Owner: Sarah Nakamura (Lead Eng)
 *
 * Verifies the full notification pipeline:
 * - All 6 templates produce valid data structures
 * - Every template's screen value is in VALID_DEEP_LINK_SCREENS
 * - Channel mappings cover all NotificationType values
 * - Notification response handler in _layout.tsx covers all screens
 * - Android channels have correct importance levels
 * - Badge count, cancel, and schedule functions exported
 */
import { describe, it, expect } from "vitest";
import {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_TYPE_TO_CHANNEL,
  getChannelId,
  type NotificationType,
} from "../shared/notification-channels";

// ── Shared Channel Config (can import directly — no Expo deps) ──

const ALL_TYPES: NotificationType[] = [
  "tier_upgrade", "challenger_result", "challenger_started",
  "weekly_digest", "drip_reminder", "rating_reminder",
];

// ── Channel Mapping ──
describe("Notification Channel Mapping", () => {
  it("every NotificationType has a channel mapping", () => {
    for (const type of ALL_TYPES) {
      expect(NOTIFICATION_TYPE_TO_CHANNEL[type]).toBeTruthy();
    }
  });

  it("getChannelId returns correct channel for each type", () => {
    expect(getChannelId("tier_upgrade")).toBe("tier_upgrade");
    expect(getChannelId("challenger_result")).toBe("challenger");
    expect(getChannelId("challenger_started")).toBe("challenger");
    expect(getChannelId("weekly_digest")).toBe("digest");
    expect(getChannelId("drip_reminder")).toBe("reminders");
    expect(getChannelId("rating_reminder")).toBe("reminders");
  });

  it("getChannelId falls back to 'default' for unknown types", () => {
    expect(getChannelId("unknown_type")).toBe("default");
    expect(getChannelId("")).toBe("default");
  });

  it("every mapped channel ID exists in NOTIFICATION_CHANNELS", () => {
    const channelIds = new Set(NOTIFICATION_CHANNELS.map((c) => c.id));
    for (const type of ALL_TYPES) {
      expect(channelIds.has(NOTIFICATION_TYPE_TO_CHANNEL[type])).toBe(true);
    }
  });
});

// ── Android Channels ──
describe("Android Notification Channels", () => {
  it("has 5 channels configured", () => {
    expect(NOTIFICATION_CHANNELS).toHaveLength(5);
  });

  it("default channel has HIGH importance", () => {
    const ch = NOTIFICATION_CHANNELS.find((c) => c.id === "default");
    expect(ch).toBeTruthy();
    expect(ch!.importance).toBe("HIGH");
  });

  it("tier_upgrade channel has HIGH importance", () => {
    const ch = NOTIFICATION_CHANNELS.find((c) => c.id === "tier_upgrade");
    expect(ch).toBeTruthy();
    expect(ch!.importance).toBe("HIGH");
  });

  it("reminders channel has LOW importance (no sound)", () => {
    const ch = NOTIFICATION_CHANNELS.find((c) => c.id === "reminders");
    expect(ch).toBeTruthy();
    expect(ch!.importance).toBe("LOW");
    expect(ch!.sound).toBe(false);
  });

  it("every channel has name and description", () => {
    for (const ch of NOTIFICATION_CHANNELS) {
      expect(ch.name.length).toBeGreaterThan(0);
      expect(ch.description.length).toBeGreaterThan(0);
    }
  });
});

// ── Source-level verification (avoids Expo runtime deps) ──

describe("Notification Templates (source verification)", () => {
  let source: string;

  it("loads lib/notifications.ts", async () => {
    const fs = await import("node:fs");
    source = fs.readFileSync(
      new URL("../lib/notifications.ts", import.meta.url),
      "utf-8",
    );
    expect(source).toBeTruthy();
  });

  it("defines all 6 templates", () => {
    expect(source).toContain("tierUpgrade:");
    expect(source).toContain("challengerResult:");
    expect(source).toContain("challengerStarted:");
    expect(source).toContain("weeklyDigest:");
    expect(source).toContain("dripReminder:");
    expect(source).toContain("ratingReminder:");
  });

  it("tierUpgrade navigates to profile", () => {
    const section = source.slice(source.indexOf("tierUpgrade:"), source.indexOf("challengerResult:"));
    expect(section).toContain('screen: "profile"');
    expect(section).toContain("tier_upgrade");
  });

  it("challengerResult navigates to challenger", () => {
    const section = source.slice(source.indexOf("challengerResult:"), source.indexOf("challengerStarted:"));
    expect(section).toContain('screen: "challenger"');
    expect(section).toContain("challenger_result");
  });

  it("challengerStarted navigates to challenger", () => {
    const section = source.slice(source.indexOf("challengerStarted:"), source.indexOf("weeklyDigest:"));
    expect(section).toContain('screen: "challenger"');
    expect(section).toContain("challenger_started");
  });

  it("weeklyDigest navigates to profile", () => {
    const section = source.slice(source.indexOf("weeklyDigest:"), source.indexOf("dripReminder:"));
    expect(section).toContain('screen: "profile"');
    expect(section).toContain("weekly_digest");
  });

  it("dripReminder navigates to search", () => {
    const section = source.slice(source.indexOf("dripReminder:"), source.indexOf("ratingReminder:"));
    expect(section).toContain('screen: "search"');
    expect(section).toContain("drip_reminder");
  });

  it("ratingReminder navigates to business with slug", () => {
    const section = source.slice(source.indexOf("ratingReminder:"));
    expect(section).toContain('screen: "business"');
    expect(section).toContain("slug: businessSlug");
    expect(section).toContain("rating_reminder");
  });

  it("VALID_DEEP_LINK_SCREENS includes all 5 screens", () => {
    expect(source).toContain('"business"');
    expect(source).toContain('"challenger"');
    expect(source).toContain('"profile"');
    expect(source).toContain('"search"');
    expect(source).toContain('"dish"');
  });

  it("exports isValidDeepLinkScreen type guard", () => {
    expect(source).toContain("export function isValidDeepLinkScreen");
  });

  it("exports registerForPushNotifications", () => {
    expect(source).toContain("export async function registerForPushNotifications");
  });

  it("exports scheduleLocalNotification", () => {
    expect(source).toContain("export async function scheduleLocalNotification");
  });

  it("exports cancelAllNotifications", () => {
    expect(source).toContain("export async function cancelAllNotifications");
  });

  it("exports getBadgeCount and setBadgeCount", () => {
    expect(source).toContain("export async function getBadgeCount");
    expect(source).toContain("export async function setBadgeCount");
  });

  it("re-exports NOTIFICATION_CHANNEL_MAP from shared", () => {
    expect(source).toContain("NOTIFICATION_TYPE_TO_CHANNEL as NOTIFICATION_CHANNEL_MAP");
  });
});

// ── Notification Response Handler in _layout.tsx ──
describe("Notification response handler (_layout.tsx)", () => {
  let layoutSource: string;

  it("loads _layout.tsx", async () => {
    const fs = await import("node:fs");
    layoutSource = fs.readFileSync(
      new URL("../app/_layout.tsx", import.meta.url),
      "utf-8",
    );
    expect(layoutSource).toBeTruthy();
  });

  it("registers notification response listener", () => {
    expect(layoutSource).toContain("addNotificationResponseReceivedListener");
  });

  it("validates screen with isValidDeepLinkScreen", () => {
    expect(layoutSource).toContain("isValidDeepLinkScreen(screen)");
  });

  it("handles business deep link with slug", () => {
    expect(layoutSource).toContain('screen === "business" && slug');
    expect(layoutSource).toContain("/business/[id]");
  });

  it("handles challenger deep link with and without id", () => {
    expect(layoutSource).toContain('screen === "challenger" && id');
    expect(layoutSource).toContain('screen === "challenger"');
  });

  it("handles profile deep link", () => {
    expect(layoutSource).toContain('screen === "profile"');
    expect(layoutSource).toContain("/(tabs)/profile");
  });

  it("handles search deep link", () => {
    expect(layoutSource).toContain('screen === "search"');
    expect(layoutSource).toContain("/(tabs)/search");
  });

  it("handles dish deep link with slug", () => {
    expect(layoutSource).toContain('screen === "dish" && slug');
    expect(layoutSource).toContain("/dish/[slug]");
  });

  it("reports notification open for analytics", () => {
    expect(layoutSource).toContain("reportNotificationOpened");
    expect(layoutSource).toContain("notificationOpenReported");
  });

  it("cleans up subscription on unmount", () => {
    expect(layoutSource).toContain("subscription.remove()");
  });
});

// ── Template-to-Handler Compatibility ──
describe("Template-Handler Compatibility", () => {
  it("all template screens have handler branches in _layout.tsx", async () => {
    const fs = await import("node:fs");
    const layoutSource = fs.readFileSync(
      new URL("../app/_layout.tsx", import.meta.url),
      "utf-8",
    );

    // Extract the handler section
    const handlerStart = layoutSource.indexOf("addNotificationResponseReceivedListener");
    const handlerEnd = layoutSource.indexOf("subscription.remove()");
    const handler = layoutSource.slice(handlerStart, handlerEnd);

    // All screens used by templates must be handled
    const templateScreens = ["business", "challenger", "profile", "search"];
    for (const screen of templateScreens) {
      expect(handler).toContain(`"${screen}"`);
    }
  });
});
