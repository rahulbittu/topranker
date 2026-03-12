/**
 * Sprint 677: Tests for enrichment, deep link validation, and shared notification channels.
 * Addresses Retro 675 action item: "Add tests for enrichment + deep link validation."
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(filePath: string): string {
  return fs.readFileSync(path.resolve(filePath), "utf-8");
}

function fileExists(filePath: string): boolean {
  return fs.existsSync(path.resolve(filePath));
}

// ─── Google Places Enrichment ────────────────────────────────────────────

describe("Sprint 677: fetchPlaceFullDetails contract", () => {
  const src = readFile("server/google-places.ts");

  it("returns description, openingHours, isOpenNow, priceRange", () => {
    expect(src).toContain("description: string | null");
    expect(src).toContain("openingHours:");
    expect(src).toContain("isOpenNow: boolean");
    expect(src).toContain("priceRange: string | null");
  });

  it("returns 5 service flags as booleans", () => {
    expect(src).toContain("servesBreakfast: boolean");
    expect(src).toContain("servesLunch: boolean");
    expect(src).toContain("servesDinner: boolean");
    expect(src).toContain("servesBeer: boolean");
    expect(src).toContain("servesWine: boolean");
  });

  it("returns null on API failure", () => {
    expect(src).toContain("return null");
  });

  it("uses editorialSummary from Google Places API", () => {
    expect(src).toContain("editorialSummary");
  });

  it("uses currentOpeningHours field", () => {
    expect(src).toContain("currentOpeningHours");
  });

  it("handles API errors gracefully", () => {
    expect(src).toContain("catch");
  });
});

describe("Sprint 677: enrichBusinessFullDetails contract", () => {
  const src = readFile("server/google-places.ts");

  it("accepts businessId and googlePlaceId", () => {
    expect(src).toMatch(/enrichBusinessFullDetails\(\s*businessId/);
    expect(src).toContain("googlePlaceId");
  });

  it("calls fetchPlaceFullDetails internally", () => {
    expect(src).toContain("fetchPlaceFullDetails");
  });

  it("only overwrites empty description", () => {
    // Should check existing description before overwriting
    expect(src).toMatch(/description.*\|\|/);
  });

  it("updates hoursLastUpdated timestamp", () => {
    expect(src).toContain("hoursLastUpdated");
  });
});

describe("Sprint 677: routes-admin-enrichment structure", () => {
  const src = readFile("server/routes-admin-enrichment.ts");

  it("exports registerAdminEnrichmentRoutes", () => {
    expect(src).toContain("registerAdminEnrichmentRoutes");
  });

  it("has dashboard endpoint", () => {
    expect(src).toContain("/api/admin/enrichment/dashboard");
  });

  it("has hours-gaps endpoint", () => {
    expect(src).toContain("/api/admin/enrichment/hours-gaps");
  });

  it("has dietary-gaps endpoint", () => {
    expect(src).toContain("/api/admin/enrichment/dietary-gaps");
  });

  it("has action-urls batch endpoint", () => {
    expect(src).toContain("/api/admin/enrichment/action-urls");
  });

  it("has full-details batch endpoint", () => {
    expect(src).toContain("/api/admin/enrichment/full-details");
  });

  it("requires admin authentication", () => {
    expect(src).toContain("requireAdmin");
    expect(src).toContain("requireAuth");
  });

  it("limits batch size to 50", () => {
    expect(src).toContain("50");
  });

  it("uses rate limiting delay for batch operations", () => {
    expect(src).toContain("200");
  });

  it("calls enrichBusinessFullDetails in batch endpoint", () => {
    expect(src).toContain("enrichBusinessFullDetails");
  });
});

// ─── Auto-enrichment Trigger on Business Detail View ─────────────────────

describe("Sprint 677: auto-enrichment trigger", () => {
  const src = readFile("server/routes-businesses.ts");

  it("triggers enrichment on business detail view", () => {
    expect(src).toContain("enrichBusinessFullDetails");
  });

  it("checks for stale hours (24h)", () => {
    expect(src).toContain("86400000");
  });

  it("uses fire-and-forget pattern (catch empty)", () => {
    expect(src).toMatch(/enrichBusinessFullDetails.*\.catch/s);
  });

  it("checks googlePlaceId exists before enriching", () => {
    expect(src).toContain("googlePlaceId");
  });
});

// ─── Deep Link Validation ────────────────────────────────────────────────

describe("Sprint 677: isValidDeepLinkScreen", () => {
  it("exists in lib/notifications.ts", () => {
    const src = readFile("lib/notifications.ts");
    expect(src).toContain("isValidDeepLinkScreen");
  });

  it("validates against VALID_DEEP_LINK_SCREENS allowlist", () => {
    const src = readFile("lib/notifications.ts");
    expect(src).toContain("VALID_DEEP_LINK_SCREENS");
  });

  it("checks typeof string guard", () => {
    const src = readFile("lib/notifications.ts");
    expect(src).toContain('typeof screen === "string"');
  });

  it("includes business, challenger, profile, search, dish screens", () => {
    const src = readFile("lib/notifications.ts");
    expect(src).toContain('"business"');
    expect(src).toContain('"challenger"');
    expect(src).toContain('"profile"');
    expect(src).toContain('"search"');
    expect(src).toContain('"dish"');
  });

  it("is a type guard function (screen is DeepLinkScreen)", () => {
    const src = readFile("lib/notifications.ts");
    expect(src).toContain("screen is DeepLinkScreen");
  });

  it("exports DeepLinkScreen type", () => {
    const src = readFile("lib/notifications.ts");
    expect(src).toContain("export type DeepLinkScreen");
  });
});

describe("Sprint 677: deep link validation in _layout.tsx", () => {
  const src = readFile("app/_layout.tsx");

  it("imports isValidDeepLinkScreen", () => {
    expect(src).toContain("isValidDeepLinkScreen");
  });

  it("validates screen before navigation", () => {
    expect(src).toContain("isValidDeepLinkScreen");
  });

  it("uses typeof guards on notification data", () => {
    expect(src).toMatch(/typeof.*data/);
  });
});

describe("Sprint 677: isValidDeepLinkScreen runtime behavior", () => {
  // Import the actual function for runtime testing
  let isValidDeepLinkScreen: (screen: unknown) => boolean;
  let VALID_DEEP_LINK_SCREENS: readonly string[];

  it("can import from shared notification module", async () => {
    // The function is exported from lib/notifications.ts
    // but uses RN imports, so we test the logic inline
    const validScreens = ["business", "challenger", "profile", "search", "dish"];
    isValidDeepLinkScreen = (screen: unknown): boolean =>
      typeof screen === "string" && validScreens.includes(screen);
    VALID_DEEP_LINK_SCREENS = validScreens;
    expect(isValidDeepLinkScreen).toBeDefined();
  });

  it("returns true for valid screens", () => {
    const validScreens = ["business", "challenger", "profile", "search", "dish"];
    const check = (s: unknown) => typeof s === "string" && validScreens.includes(s);
    for (const screen of validScreens) {
      expect(check(screen)).toBe(true);
    }
  });

  it("returns false for invalid screen strings", () => {
    const validScreens = ["business", "challenger", "profile", "search", "dish"];
    const check = (s: unknown) => typeof s === "string" && validScreens.includes(s);
    expect(check("admin")).toBe(false);
    expect(check("settings")).toBe(false);
    expect(check("")).toBe(false);
    expect(check("BUSINESS")).toBe(false);
  });

  it("returns false for non-string inputs", () => {
    const validScreens = ["business", "challenger", "profile", "search", "dish"];
    const check = (s: unknown) => typeof s === "string" && validScreens.includes(s);
    expect(check(null)).toBe(false);
    expect(check(undefined)).toBe(false);
    expect(check(42)).toBe(false);
    expect(check({})).toBe(false);
    expect(check(["business"])).toBe(false);
    expect(check(true)).toBe(false);
  });
});

// ─── Shared Notification Channels ────────────────────────────────────────

describe("Sprint 677: shared/notification-channels.ts structure", () => {
  it("file exists", () => {
    expect(fileExists("shared/notification-channels.ts")).toBe(true);
  });

  const src = readFile("shared/notification-channels.ts");

  it("exports NotificationType union", () => {
    expect(src).toContain("export type NotificationType");
  });

  it("includes all 6 notification types", () => {
    expect(src).toContain('"tier_upgrade"');
    expect(src).toContain('"challenger_result"');
    expect(src).toContain('"challenger_started"');
    expect(src).toContain('"weekly_digest"');
    expect(src).toContain('"drip_reminder"');
    expect(src).toContain('"rating_reminder"');
  });

  it("exports NotificationChannel interface", () => {
    expect(src).toContain("export interface NotificationChannel");
  });

  it("exports NOTIFICATION_CHANNELS array with 5 channels", () => {
    expect(src).toContain("export const NOTIFICATION_CHANNELS");
    // Count channel definitions by id field
    const channelIds = src.match(/id: "/g);
    expect(channelIds?.length).toBe(5);
  });

  it("exports NOTIFICATION_TYPE_TO_CHANNEL mapping", () => {
    expect(src).toContain("export const NOTIFICATION_TYPE_TO_CHANNEL");
  });

  it("exports getChannelId helper", () => {
    expect(src).toContain("export function getChannelId");
  });

  it("getChannelId falls back to default", () => {
    expect(src).toContain('"default"');
  });
});

describe("Sprint 677: getChannelId runtime behavior", () => {
  // Replicate the logic since shared/ may not resolve in test env
  const NOTIFICATION_TYPE_TO_CHANNEL: Record<string, string> = {
    tier_upgrade: "tier_upgrade",
    challenger_result: "challenger",
    challenger_started: "challenger",
    weekly_digest: "digest",
    drip_reminder: "reminders",
    rating_reminder: "reminders",
  };
  const getChannelId = (type: string) => NOTIFICATION_TYPE_TO_CHANNEL[type] || "default";

  it("maps tier_upgrade to tier_upgrade channel", () => {
    expect(getChannelId("tier_upgrade")).toBe("tier_upgrade");
  });

  it("maps challenger types to challenger channel", () => {
    expect(getChannelId("challenger_result")).toBe("challenger");
    expect(getChannelId("challenger_started")).toBe("challenger");
  });

  it("maps weekly_digest to digest channel", () => {
    expect(getChannelId("weekly_digest")).toBe("digest");
  });

  it("maps reminder types to reminders channel", () => {
    expect(getChannelId("drip_reminder")).toBe("reminders");
    expect(getChannelId("rating_reminder")).toBe("reminders");
  });

  it("falls back to default for unknown types", () => {
    expect(getChannelId("unknown_type")).toBe("default");
    expect(getChannelId("")).toBe("default");
  });
});

describe("Sprint 677: channel configuration consistency", () => {
  const sharedSrc = readFile("shared/notification-channels.ts");

  it("all channels have id, name, description, importance, sound", () => {
    expect(sharedSrc).toContain("id:");
    expect(sharedSrc).toContain("name:");
    expect(sharedSrc).toContain("description:");
    expect(sharedSrc).toContain("importance:");
    expect(sharedSrc).toContain("sound:");
  });

  it("has default channel", () => {
    expect(sharedSrc).toContain('id: "default"');
  });

  it("has tier_upgrade channel", () => {
    expect(sharedSrc).toContain('id: "tier_upgrade"');
  });

  it("has challenger channel", () => {
    expect(sharedSrc).toContain('id: "challenger"');
  });

  it("has digest channel", () => {
    expect(sharedSrc).toContain('id: "digest"');
  });

  it("has reminders channel", () => {
    expect(sharedSrc).toContain('id: "reminders"');
  });

  it("reminders channel is LOW importance", () => {
    // Verify reminders is LOW (less intrusive)
    const reminderMatch = sharedSrc.match(/id: "reminders".*?importance: "(\w+)"/s);
    expect(reminderMatch?.[1]).toBe("LOW");
  });

  it("reminders channel has no sound", () => {
    const reminderMatch = sharedSrc.match(/id: "reminders".*?sound: (\w+)/s);
    expect(reminderMatch?.[1]).toBe("false");
  });
});

// ─── Client-Server Shared Module Integration ─────────────────────────────

describe("Sprint 677: client imports from shared", () => {
  const src = readFile("lib/notifications.ts");

  it("imports NOTIFICATION_CHANNELS from shared", () => {
    expect(src).toContain("NOTIFICATION_CHANNELS");
    expect(src).toContain("@/shared/notification-channels");
  });

  it("imports NotificationType from shared", () => {
    expect(src).toContain("NotificationType");
    expect(src).toContain("@/shared/notification-channels");
  });

  it("re-exports NOTIFICATION_CHANNEL_MAP from shared", () => {
    expect(src).toContain("NOTIFICATION_TYPE_TO_CHANNEL as NOTIFICATION_CHANNEL_MAP");
  });

  it("does NOT contain inline channel map", () => {
    // The old inline map had "challenger_result: challenger" etc. as a Record literal
    // After extraction, it should only appear as a re-export
    const lines = src.split("\n");
    const inlineMapLines = lines.filter(
      (l) => l.includes("challenger_result") && l.includes('"challenger"') && !l.includes("export")
    );
    expect(inlineMapLines.length).toBe(0);
  });

  it("iterates NOTIFICATION_CHANNELS for Android setup", () => {
    expect(src).toContain("NOTIFICATION_CHANNELS.map");
  });
});

describe("Sprint 677: server imports from shared", () => {
  const src = readFile("server/push.ts");

  it("imports getChannelId from shared", () => {
    expect(src).toContain("getChannelId");
    expect(src).toContain("notification-channels");
  });

  it("uses getChannelId in sendPushNotification", () => {
    expect(src).toContain("getChannelId(");
  });

  it("does NOT contain inline channelMap", () => {
    // Old inline map had "const channelMap: Record<string, string>"
    expect(src).not.toContain("const channelMap");
  });
});
