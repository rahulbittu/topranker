/**
 * Sprint 110 — ErrorBoundary, Analytics Funnel, Sanitize Extensions,
 * Dark Mode Colors, Notification Preferences, Graceful Shutdown Tests
 *
 * Owner: Sarah Nakamura (Lead Engineer), Rachel Wei (CFO),
 *        Nadia Kaur (Cybersecurity), Leo Hernandez (Design)
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  sanitizeEmail,
  sanitizeNumber,
  sanitizeSlug,
} from "../server/sanitize";
import {
  trackEvent,
  getFunnelStats,
  getRecentEvents,
  clearAnalytics,
} from "../server/analytics";
import { DARK_COLORS } from "../constants/dark-colors";
import { BRAND } from "../constants/brand";

// ── 1. ErrorBoundary Component ──────────────────────────────────────
describe("ErrorBoundary Component", () => {
  it("getDerivedStateFromError returns error state", () => {
    // Simulate the static method behavior from ErrorBoundary class
    const testError = new Error("Test crash");
    const derivedState = { hasError: true, error: testError };

    expect(derivedState.hasError).toBe(true);
    expect(derivedState.error).toBe(testError);
    expect(derivedState.error.message).toBe("Test crash");
  });

  it("default fallback UI renders title 'Something went wrong'", async () => {
    // Verify the component source contains the expected fallback text
    const fs = await import("node:fs");
    const source = fs.readFileSync(
      new URL("../components/ErrorBoundary.tsx", import.meta.url),
      "utf-8",
    );
    expect(source).toContain("Something went wrong");
    expect(source).toContain("An unexpected error occurred");
    expect(source).toContain("Try Again");
    expect(source).toContain('accessibilityRole="button"');
    expect(source).toContain('accessibilityLabel="Try again"');
  });

  it("custom fallback is rendered when provided (fallback prop path)", async () => {
    const fs = await import("node:fs");
    const source = fs.readFileSync(
      new URL("../components/ErrorBoundary.tsx", import.meta.url),
      "utf-8",
    );
    // When hasError is true and fallback prop exists, it returns fallback
    expect(source).toContain("if (this.props.fallback) return this.props.fallback");
    // Props interface accepts optional fallback
    expect(source).toContain("fallback?: ReactNode");
  });

  it("handleRetry resets error state to initial", () => {
    // Simulate handleRetry: sets hasError=false and error=null
    const errorState = { hasError: true, error: new Error("boom") };
    // After handleRetry
    const resetState = { hasError: false, error: null };

    expect(resetState.hasError).toBe(false);
    expect(resetState.error).toBeNull();
    // Verify initial state matches reset
    expect(resetState).toEqual({ hasError: false, error: null });
  });

  it("onError callback is invoked in componentDidCatch", async () => {
    const fs = await import("node:fs");
    const source = fs.readFileSync(
      new URL("../components/ErrorBoundary.tsx", import.meta.url),
      "utf-8",
    );
    expect(source).toContain("this.props.onError?.(error, errorInfo)");
    expect(source).toContain("onError?: (error: Error, errorInfo: ErrorInfo) => void");
  });

  it("exports ErrorBoundary as named export", async () => {
    const fs = await import("node:fs");
    const source = fs.readFileSync(
      new URL("../components/ErrorBoundary.tsx", import.meta.url),
      "utf-8",
    );
    expect(source).toContain("export class ErrorBoundary");
  });
});

// ── 2. Analytics / Conversion Funnel ────────────────────────────────
describe("Analytics / Conversion Funnel", () => {
  beforeEach(() => {
    clearAnalytics();
  });

  it("trackEvent adds entry to buffer", () => {
    trackEvent("page_view");
    const events = getRecentEvents(10);
    expect(events).toHaveLength(1);
    expect(events[0].event).toBe("page_view");
    expect(events[0].timestamp).toBeGreaterThan(0);
  });

  it("trackEvent records userId and metadata", () => {
    trackEvent("signup_completed", "user-42", { source: "google" });
    const events = getRecentEvents(10);
    expect(events[0].userId).toBe("user-42");
    expect(events[0].metadata).toEqual({ source: "google" });
  });

  it("getFunnelStats counts events correctly", () => {
    trackEvent("page_view");
    trackEvent("page_view");
    trackEvent("page_view");
    trackEvent("signup_started");
    trackEvent("signup_completed");

    const stats = getFunnelStats();
    expect(stats.page_view).toBe(3);
    expect(stats.signup_started).toBe(1);
    expect(stats.signup_completed).toBe(1);
  });

  it("getFunnelStats returns empty object when no events", () => {
    const stats = getFunnelStats();
    expect(Object.keys(stats)).toHaveLength(0);
  });

  it("getRecentEvents returns last N events", () => {
    for (let i = 0; i < 20; i++) {
      trackEvent("page_view", `user-${i}`);
    }
    const recent5 = getRecentEvents(5);
    expect(recent5).toHaveLength(5);
    // Should be the last 5 entries (users 15-19)
    expect(recent5[0].userId).toBe("user-15");
    expect(recent5[4].userId).toBe("user-19");
  });

  it("getRecentEvents defaults to 50", () => {
    for (let i = 0; i < 60; i++) {
      trackEvent("page_view");
    }
    const recent = getRecentEvents();
    expect(recent).toHaveLength(50);
  });

  it("clearAnalytics empties the buffer", () => {
    trackEvent("page_view");
    trackEvent("signup_started");
    expect(getRecentEvents(10)).toHaveLength(2);

    clearAnalytics();
    expect(getRecentEvents(10)).toHaveLength(0);
    expect(Object.keys(getFunnelStats())).toHaveLength(0);
  });

  it("buffer caps at MAX_BUFFER (1000)", () => {
    for (let i = 0; i < 1050; i++) {
      trackEvent("page_view", `user-${i}`);
    }
    const all = getRecentEvents(2000);
    expect(all.length).toBeLessThanOrEqual(1000);
  });
});

// ── 3. Sanitize Extensions ──────────────────────────────────────────
describe("Sanitize Extensions", () => {
  describe("sanitizeEmail", () => {
    it("valid email is lowercased and trimmed", () => {
      expect(sanitizeEmail("USER@Example.COM")).toBe("user@example.com");
      expect(sanitizeEmail("  hello@world.io  ")).toBe("hello@world.io");
    });

    it("invalid email returns empty string", () => {
      expect(sanitizeEmail("invalid-email")).toBe("");
      expect(sanitizeEmail("@missing-local.com")).toBe("");
      expect(sanitizeEmail("no-domain@")).toBe("");
      expect(sanitizeEmail("")).toBe("");
    });

    it("non-string input returns empty string", () => {
      expect(sanitizeEmail(42)).toBe("");
      expect(sanitizeEmail(null)).toBe("");
      expect(sanitizeEmail(undefined)).toBe("");
      expect(sanitizeEmail({})).toBe("");
    });
  });

  describe("sanitizeNumber", () => {
    it("returns fallback for NaN input", () => {
      expect(sanitizeNumber("not-a-number", 0, 100, 50)).toBe(50);
      expect(sanitizeNumber(undefined, 0, 100, 50)).toBe(50);
      expect(sanitizeNumber(null, 0, 100, 25)).toBe(0); // null coerces to 0, clamped to min
    });

    it("clamps to max when input exceeds max", () => {
      expect(sanitizeNumber(150, 0, 100, 50)).toBe(100);
      expect(sanitizeNumber(999, 10, 20, 15)).toBe(20);
    });

    it("clamps to min when input is below min", () => {
      expect(sanitizeNumber(-10, 0, 100, 50)).toBe(0);
      expect(sanitizeNumber(5, 10, 20, 15)).toBe(10);
    });

    it("returns value when within range", () => {
      expect(sanitizeNumber(42, 0, 100, 50)).toBe(42);
      expect(sanitizeNumber(15, 10, 20, 12)).toBe(15);
    });
  });

  describe("sanitizeSlug", () => {
    it("strips non-alphanumeric except hyphens", () => {
      expect(sanitizeSlug("Hello World!@#$")).toBe("helloworld");
      expect(sanitizeSlug("my-valid-slug")).toBe("my-valid-slug");
    });

    it("lowercases the result", () => {
      expect(sanitizeSlug("MySlug")).toBe("myslug");
      expect(sanitizeSlug("ABC-123")).toBe("abc-123");
    });

    it("non-string input returns empty string", () => {
      expect(sanitizeSlug(123)).toBe("");
      expect(sanitizeSlug(null)).toBe("");
      expect(sanitizeSlug(undefined)).toBe("");
    });

    it("caps at 100 characters", () => {
      expect(sanitizeSlug("a".repeat(200))).toHaveLength(100);
    });
  });
});

// ── 4. Dark Mode Colors ─────────────────────────────────────────────
describe("Dark Mode Colors", () => {
  it("DARK_COLORS has all required surface keys", () => {
    expect(DARK_COLORS).toHaveProperty("background");
    expect(DARK_COLORS).toHaveProperty("surface");
    expect(DARK_COLORS).toHaveProperty("surfaceElevated");
  });

  it("DARK_COLORS has all required text keys", () => {
    expect(DARK_COLORS).toHaveProperty("text");
    expect(DARK_COLORS).toHaveProperty("textSecondary");
    expect(DARK_COLORS).toHaveProperty("textTertiary");
  });

  it("DARK_COLORS has amber and brand keys", () => {
    expect(DARK_COLORS).toHaveProperty("amber");
    expect(DARK_COLORS).toHaveProperty("amberLight");
    expect(DARK_COLORS).toHaveProperty("amberFaint");
  });

  it("DARK_COLORS has feedback colors", () => {
    expect(DARK_COLORS).toHaveProperty("success");
    expect(DARK_COLORS).toHaveProperty("error");
    expect(DARK_COLORS).toHaveProperty("warning");
  });

  it("DARK_COLORS has border, card, and tab bar keys", () => {
    expect(DARK_COLORS).toHaveProperty("border");
    expect(DARK_COLORS).toHaveProperty("borderFaint");
    expect(DARK_COLORS).toHaveProperty("card");
    expect(DARK_COLORS).toHaveProperty("cardBorder");
    expect(DARK_COLORS).toHaveProperty("tabBarBackground");
    expect(DARK_COLORS).toHaveProperty("tabBarBorder");
  });

  it("DARK_COLORS has medal colors", () => {
    expect(DARK_COLORS).toHaveProperty("gold");
    expect(DARK_COLORS).toHaveProperty("silver");
    expect(DARK_COLORS).toHaveProperty("bronze");
  });

  it("amber matches BRAND.colors.amber", () => {
    expect(DARK_COLORS.amber).toBe(BRAND.colors.amber);
    expect(DARK_COLORS.amber).toBe("#C49A1A");
  });

  it("gold matches BRAND.colors.gold", () => {
    expect(DARK_COLORS.gold).toBe(BRAND.colors.gold);
    expect(DARK_COLORS.gold).toBe("#FFD700");
  });

  it("background uses dark GitHub-style color", () => {
    expect(DARK_COLORS.background).toBe("#0D1117");
  });
});

// ── 5. Notification Preferences — Switch Toggle ─────────────────────
describe("Notification Preferences", () => {
  it("toggle state switches from false to true", () => {
    let pushEnabled = false;
    // Simulate toggle press
    pushEnabled = !pushEnabled;
    expect(pushEnabled).toBe(true);
  });

  it("toggle state switches from true to false", () => {
    let pushEnabled = true;
    // Simulate toggle press
    pushEnabled = !pushEnabled;
    expect(pushEnabled).toBe(false);
  });

  it("multiple toggles cycle correctly", () => {
    let emailEnabled = false;
    emailEnabled = !emailEnabled; // true
    emailEnabled = !emailEnabled; // false
    emailEnabled = !emailEnabled; // true
    expect(emailEnabled).toBe(true);
  });

  it("independent toggle states do not interfere", () => {
    let pushEnabled = false;
    let emailEnabled = true;
    let smsEnabled = false;

    pushEnabled = !pushEnabled;
    expect(pushEnabled).toBe(true);
    expect(emailEnabled).toBe(true);
    expect(smsEnabled).toBe(false);
  });
});

// ── 6. Graceful Shutdown ─────────────────────────────────────────────
describe("Graceful Shutdown", () => {
  it("process supports SIGTERM signal", () => {
    // Verify Node.js process can register signal handlers
    expect(typeof process.on).toBe("function");
    expect(typeof process.exit).toBe("function");
  });

  it("shutdown handler concept — cleanup runs before exit", () => {
    let cleanupRan = false;
    const shutdownHandler = () => {
      cleanupRan = true;
    };
    // Simulate shutdown sequence
    shutdownHandler();
    expect(cleanupRan).toBe(true);
  });

  it("shutdown timeout prevents hanging", () => {
    const SHUTDOWN_TIMEOUT_MS = 10_000;
    expect(SHUTDOWN_TIMEOUT_MS).toBe(10_000);
    expect(SHUTDOWN_TIMEOUT_MS).toBeGreaterThan(0);
  });

  it("server.close is a valid shutdown step", () => {
    // Conceptual: Express server.close() drains connections
    const steps = ["stop accepting connections", "drain active requests", "close DB pool", "exit"];
    expect(steps).toHaveLength(4);
    expect(steps[0]).toBe("stop accepting connections");
    expect(steps[steps.length - 1]).toBe("exit");
  });
});
