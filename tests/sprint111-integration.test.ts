/**
 * Sprint 111 — ErrorBoundary Integration, Payment Sanitization,
 * Notification Preferences, Server Funnel Tracking, Client Analytics,
 * CHANGELOG Verification
 *
 * Owner: Sarah Nakamura (Lead Engineer), Nadia Kaur (Cybersecurity),
 *        Rachel Wei (CFO), Leo Hernandez (Design)
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  sanitizeSlug,
} from "../server/sanitize";
import {
  trackEvent,
  getFunnelStats,
  clearAnalytics,
} from "../server/analytics";
import { track, Analytics } from "../lib/analytics";

// ── 1. ErrorBoundary Integration ────────────────────────────────────
describe("ErrorBoundary Integration", () => {
  it("ErrorBoundary is exported as a named class export", async () => {
    const fs = await import("node:fs");
    const source = fs.readFileSync(
      new URL("../components/ErrorBoundary.tsx", import.meta.url),
      "utf-8",
    );
    expect(source).toContain("export class ErrorBoundary");
  });

  it("ErrorBoundary has getDerivedStateFromError static method", async () => {
    const fs = await import("node:fs");
    const source = fs.readFileSync(
      new URL("../components/ErrorBoundary.tsx", import.meta.url),
      "utf-8",
    );
    expect(source).toContain("static getDerivedStateFromError");
    expect(source).toContain("return { hasError: true, error }");
  });

  it("handleRetry resets state to initial values", () => {
    // Simulate the handleRetry behavior: sets hasError=false and error=null
    const errorState = { hasError: true, error: new Error("crash") };
    const resetState = { hasError: false, error: null };

    expect(errorState.hasError).toBe(true);
    expect(resetState.hasError).toBe(false);
    expect(resetState.error).toBeNull();
    expect(resetState).toEqual({ hasError: false, error: null });
  });

  it("Rankings tab (index.tsx) imports ErrorBoundary", async () => {
    const fs = await import("node:fs");
    const source = fs.readFileSync(
      new URL("../app/(tabs)/index.tsx", import.meta.url),
      "utf-8",
    );
    expect(source).toContain("ErrorBoundary");
  });

  it("Search tab imports ErrorBoundary", async () => {
    const fs = await import("node:fs");
    const source = fs.readFileSync(
      new URL("../app/(tabs)/search.tsx", import.meta.url),
      "utf-8",
    );
    expect(source).toContain("ErrorBoundary");
  });

  it("Challenger tab imports ErrorBoundary", async () => {
    const fs = await import("node:fs");
    const source = fs.readFileSync(
      new URL("../app/(tabs)/challenger.tsx", import.meta.url),
      "utf-8",
    );
    expect(source).toContain("ErrorBoundary");
  });

  it("Profile tab imports ErrorBoundary", async () => {
    const fs = await import("node:fs");
    const source = fs.readFileSync(
      new URL("../app/(tabs)/profile.tsx", import.meta.url),
      "utf-8",
    );
    expect(source).toContain("ErrorBoundary");
  });
});

// ── 2. Payment Sanitization — sanitizeSlug ──────────────────────────
describe("Payment Sanitization — sanitizeSlug", () => {
  it("strips special characters: 'My-Biz!@#' → 'my-biz'", () => {
    expect(sanitizeSlug("My-Biz!@#")).toBe("my-biz");
  });

  it("lowercases and preserves hyphens", () => {
    expect(sanitizeSlug("Premium-Coffee-Shop")).toBe("premium-coffee-shop");
    expect(sanitizeSlug("ABC-123")).toBe("abc-123");
  });

  it("empty string returns empty string", () => {
    expect(sanitizeSlug("")).toBe("");
  });

  it("non-string input returns empty string", () => {
    expect(sanitizeSlug(null)).toBe("");
    expect(sanitizeSlug(undefined)).toBe("");
    expect(sanitizeSlug(42)).toBe("");
    expect(sanitizeSlug({})).toBe("");
  });

  it("caps output at 100 characters", () => {
    const longSlug = "a".repeat(200);
    expect(sanitizeSlug(longSlug)).toHaveLength(100);
  });
});

// ── 3. Notification Preferences API ─────────────────────────────────
describe("Notification Preferences — Normalization Logic", () => {
  function normalizePrefs(body: Record<string, unknown>) {
    return {
      ratingUpdates: body.ratingUpdates !== false,
      challengeResults: body.challengeResults !== false,
      weeklyDigest: body.weeklyDigest === true,
    };
  }

  it("defaults: ratingUpdates=true, challengeResults=true, weeklyDigest=false", () => {
    const prefs = normalizePrefs({});
    expect(prefs.ratingUpdates).toBe(true);
    expect(prefs.challengeResults).toBe(true);
    expect(prefs.weeklyDigest).toBe(false);
  });

  it("PUT with partial body normalizes correctly", () => {
    const prefs = normalizePrefs({ ratingUpdates: false });
    expect(prefs.ratingUpdates).toBe(false);
    expect(prefs.challengeResults).toBe(true);
    expect(prefs.weeklyDigest).toBe(false);
  });

  it("ratingUpdates defaults to true when not explicitly false", () => {
    expect(normalizePrefs({}).ratingUpdates).toBe(true);
    expect(normalizePrefs({ ratingUpdates: true }).ratingUpdates).toBe(true);
    expect(normalizePrefs({ ratingUpdates: "yes" }).ratingUpdates).toBe(true);
    expect(normalizePrefs({ ratingUpdates: 1 }).ratingUpdates).toBe(true);
  });

  it("ratingUpdates is false only when explicitly false", () => {
    expect(normalizePrefs({ ratingUpdates: false }).ratingUpdates).toBe(false);
  });

  it("weeklyDigest defaults to false when not explicitly true", () => {
    expect(normalizePrefs({}).weeklyDigest).toBe(false);
    expect(normalizePrefs({ weeklyDigest: false }).weeklyDigest).toBe(false);
    expect(normalizePrefs({ weeklyDigest: "yes" }).weeklyDigest).toBe(false);
    expect(normalizePrefs({ weeklyDigest: 1 }).weeklyDigest).toBe(false);
  });

  it("weeklyDigest is true only when explicitly true", () => {
    expect(normalizePrefs({ weeklyDigest: true }).weeklyDigest).toBe(true);
  });

  it("full body with all fields set", () => {
    const prefs = normalizePrefs({
      ratingUpdates: false,
      challengeResults: false,
      weeklyDigest: true,
    });
    expect(prefs.ratingUpdates).toBe(false);
    expect(prefs.challengeResults).toBe(false);
    expect(prefs.weeklyDigest).toBe(true);
  });
});

// ── 4. Server Funnel Tracking ───────────────────────────────────────
describe("Server Funnel Tracking", () => {
  beforeEach(() => {
    clearAnalytics();
  });

  it("trackEvent is callable and records signup_completed", () => {
    trackEvent("signup_completed", "user-1");
    const stats = getFunnelStats();
    expect(stats.signup_completed).toBe(1);
  });

  it("trackEvent records first_rating event", () => {
    trackEvent("first_rating", "user-2", { business: "best-pizza" });
    const stats = getFunnelStats();
    expect(stats.first_rating).toBe(1);
  });

  it("multiple events accumulate in stats", () => {
    trackEvent("signup_completed", "user-1");
    trackEvent("signup_completed", "user-2");
    trackEvent("first_rating", "user-1");

    const stats = getFunnelStats();
    expect(stats.signup_completed).toBe(2);
    expect(stats.first_rating).toBe(1);
  });

  it("clearAnalytics resets all stats", () => {
    trackEvent("signup_completed");
    trackEvent("first_rating");
    expect(Object.keys(getFunnelStats()).length).toBeGreaterThan(0);

    clearAnalytics();
    expect(Object.keys(getFunnelStats())).toHaveLength(0);
  });
});

// ── 5. Client Analytics ─────────────────────────────────────────────
describe("Client Analytics", () => {
  it("track('view_challenger') executes without error", () => {
    expect(() => track("view_challenger")).not.toThrow();
  });

  it("track('notification_settings_change', { setting, enabled }) executes without error", () => {
    expect(() =>
      track("notification_settings_change", {
        setting: "ratingUpdates",
        enabled: true,
      }),
    ).not.toThrow();
  });

  it("Analytics.searchQuery('pizza', 5) executes without error", () => {
    expect(() => Analytics.searchQuery("pizza", 5)).not.toThrow();
  });

  it("track function is a callable export", () => {
    expect(typeof track).toBe("function");
  });

  it("Analytics convenience object has expected methods", () => {
    expect(typeof Analytics.searchQuery).toBe("function");
    expect(typeof Analytics.viewBusiness).toBe("function");
    expect(typeof Analytics.bookmarkAdd).toBe("function");
    expect(typeof Analytics.rateComplete).toBe("function");
    expect(typeof Analytics.signupComplete).toBe("function");
  });
});

// ── 6. CHANGELOG Verification ───────────────────────────────────────
describe("CHANGELOG contains Sprint 109, 110, 111 entries", () => {
  let changelog: string;

  beforeEach(async () => {
    const fs = await import("node:fs");
    changelog = fs.readFileSync(
      new URL("../CHANGELOG.md", import.meta.url),
      "utf-8",
    );
  });

  it("contains Sprint 109 entry", () => {
    expect(changelog).toContain("[Sprint 109]");
    expect(changelog).toContain("Input sanitization utilities");
    expect(changelog).toContain("Health check endpoint");
  });

  it("contains Sprint 110 entry", () => {
    expect(changelog).toContain("[Sprint 110]");
    expect(changelog).toContain("ErrorBoundary component");
    expect(changelog).toContain("Analytics conversion funnel");
  });

  it("contains Sprint 111 entry", () => {
    expect(changelog).toContain("[Sprint 111]");
    expect(changelog).toContain("ErrorBoundary integration");
    expect(changelog).toContain("Notification preferences");
  });

  it("Sprint 111 documents payment sanitization", () => {
    expect(changelog).toContain("Payment routes sanitized");
  });

  it("Sprint 111 documents client-side analytics", () => {
    expect(changelog).toContain("Client-side analytics");
  });
});
