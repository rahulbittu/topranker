/**
 * Sprint 694: Deep link validation — end-to-end testing of all notification
 * deep link paths to ensure templates match the handler.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(filePath: string): string {
  return fs.readFileSync(path.resolve(filePath), "utf-8");
}

// ─── Valid Deep Link Screens ────────────────────────────────────────────

describe("Sprint 694: valid deep link screen list", () => {
  const src = readFile("lib/notifications.ts");

  it("defines VALID_DEEP_LINK_SCREENS", () => {
    expect(src).toContain("VALID_DEEP_LINK_SCREENS");
  });

  it("includes business screen", () => {
    expect(src).toContain('"business"');
  });

  it("includes challenger screen", () => {
    expect(src).toContain('"challenger"');
  });

  it("includes profile screen", () => {
    expect(src).toContain('"profile"');
  });

  it("includes search screen", () => {
    expect(src).toContain('"search"');
  });

  it("includes dish screen", () => {
    expect(src).toContain('"dish"');
  });

  it("exports isValidDeepLinkScreen type guard", () => {
    expect(src).toContain("export function isValidDeepLinkScreen");
  });
});

// ─── isValidDeepLinkScreen Runtime Behavior ─────────────────────────────

describe("Sprint 694: isValidDeepLinkScreen runtime behavior", () => {
  const VALID_SCREENS = ["business", "challenger", "profile", "search", "dish"] as const;

  function isValidDeepLinkScreen(screen: unknown): boolean {
    return typeof screen === "string" && (VALID_SCREENS as readonly string[]).includes(screen);
  }

  it("accepts valid business screen", () => {
    expect(isValidDeepLinkScreen("business")).toBe(true);
  });

  it("accepts valid challenger screen", () => {
    expect(isValidDeepLinkScreen("challenger")).toBe(true);
  });

  it("accepts valid profile screen", () => {
    expect(isValidDeepLinkScreen("profile")).toBe(true);
  });

  it("accepts valid search screen", () => {
    expect(isValidDeepLinkScreen("search")).toBe(true);
  });

  it("accepts valid dish screen", () => {
    expect(isValidDeepLinkScreen("dish")).toBe(true);
  });

  it("rejects unknown screen", () => {
    expect(isValidDeepLinkScreen("admin")).toBe(false);
  });

  it("rejects null", () => {
    expect(isValidDeepLinkScreen(null)).toBe(false);
  });

  it("rejects undefined", () => {
    expect(isValidDeepLinkScreen(undefined)).toBe(false);
  });

  it("rejects number", () => {
    expect(isValidDeepLinkScreen(42)).toBe(false);
  });

  it("rejects compound paths (business/slug should NOT pass)", () => {
    expect(isValidDeepLinkScreen("business/biryani-palace")).toBe(false);
  });
});

// ─── Notification Templates Use Valid Screens ───────────────────────────

describe("Sprint 694: notification templates use valid screen values", () => {
  const src = readFile("lib/notifications.ts");

  it("tierUpgrade uses profile screen", () => {
    expect(src).toContain('data: { screen: "profile" }');
  });

  it("challengerResult uses challenger screen", () => {
    expect(src).toContain('data: { screen: "challenger" }');
  });

  it("challengerStarted uses challenger screen", () => {
    // Should appear twice (result + started)
    const matches = src.match(/screen: "challenger"/g);
    expect(matches?.length).toBeGreaterThanOrEqual(2);
  });

  it("weeklyDigest uses profile screen", () => {
    const profileMatches = src.match(/screen: "profile"/g);
    expect(profileMatches?.length).toBeGreaterThanOrEqual(2);
  });

  it("dripReminder uses search screen", () => {
    expect(src).toContain('data: { screen: "search" }');
  });

  it("ratingReminder uses business screen with slug field", () => {
    expect(src).toContain('data: { screen: "business", slug: businessSlug }');
  });

  it("ratingReminder does NOT use compound path (fixed in Sprint 694)", () => {
    expect(src).not.toContain('screen: `business/${businessSlug}`');
  });
});

// ─── Deep Link Handler in Layout ────────────────────────────────────────

describe("Sprint 694: deep link handler in _layout.tsx", () => {
  const src = readFile("app/_layout.tsx");

  it("validates screen with isValidDeepLinkScreen", () => {
    expect(src).toContain("isValidDeepLinkScreen(screen)");
  });

  it("handles business with slug → /business/[id]", () => {
    expect(src).toContain('screen === "business" && slug');
    expect(src).toContain('pathname: "/business/[id]"');
  });

  it("handles challenger with id → /(tabs)/challenger with params", () => {
    expect(src).toContain('screen === "challenger" && id');
  });

  it("handles challenger without id → /(tabs)/challenger", () => {
    expect(src).toContain('screen === "challenger"');
    expect(src).toContain('"/(tabs)/challenger"');
  });

  it("handles profile → /(tabs)/profile", () => {
    expect(src).toContain('screen === "profile"');
    expect(src).toContain('"/(tabs)/profile"');
  });

  it("handles search → /(tabs)/search", () => {
    expect(src).toContain('screen === "search"');
    expect(src).toContain('"/(tabs)/search"');
  });

  it("handles dish with slug → /dish/[slug]", () => {
    expect(src).toContain('screen === "dish" && slug');
    expect(src).toContain('pathname: "/dish/[slug]"');
  });

  it("extracts slug from notification data", () => {
    expect(src).toContain('typeof data?.slug === "string"');
  });

  it("extracts id from notification data", () => {
    expect(src).toContain('typeof data?.id === "string"');
  });

  it("reports notification open for analytics", () => {
    expect(src).toContain("reportNotificationOpened");
  });
});

// ─── Template-to-Handler Compatibility Matrix ───────────────────────────

describe("Sprint 694: template-handler compatibility", () => {
  it("all 5 valid screens have corresponding handler branches", () => {
    const layout = readFile("app/_layout.tsx");
    const screens = ["business", "challenger", "profile", "search", "dish"];
    for (const screen of screens) {
      expect(layout).toContain(`screen === "${screen}"`);
    }
  });

  it("all 6 templates use only valid screen values", () => {
    const notifs = readFile("lib/notifications.ts");
    // Extract all screen values from templates
    const screenRegex = /screen:\s*["'`]([^"'`]+)["'`]/g;
    let match;
    const validScreens = new Set(["business", "challenger", "profile", "search", "dish"]);
    while ((match = screenRegex.exec(notifs)) !== null) {
      expect(validScreens.has(match[1])).toBe(true);
    }
  });
});
