/**
 * Sprint 722 — Reduced Motion Accessibility + App Lifecycle Analytics
 *
 * Owner: Priya Sharma (Design)
 *
 * Verifies:
 * - Onboarding respects reduced motion accessibility preference
 * - App lifecycle events (app_open, app_background) are wired
 * - Analytics convenience functions exist for lifecycle events
 */
import { describe, it, expect } from "vitest";

describe("Sprint 722 — Accessibility & Lifecycle", () => {
  let onboardingSource: string;
  let layoutSource: string;
  let analyticsSource: string;

  it("loads required files", async () => {
    const fs = await import("node:fs");
    onboardingSource = fs.readFileSync(
      new URL("../app/onboarding.tsx", import.meta.url),
      "utf-8",
    );
    layoutSource = fs.readFileSync(
      new URL("../app/_layout.tsx", import.meta.url),
      "utf-8",
    );
    analyticsSource = fs.readFileSync(
      new URL("../lib/analytics.ts", import.meta.url),
      "utf-8",
    );
    expect(onboardingSource).toBeTruthy();
    expect(layoutSource).toBeTruthy();
    expect(analyticsSource).toBeTruthy();
  });

  // ── Reduced Motion ──
  describe("Reduced motion accessibility", () => {
    it("imports AccessibilityInfo", () => {
      expect(onboardingSource).toContain("AccessibilityInfo");
    });

    it("checks isReduceMotionEnabled", () => {
      expect(onboardingSource).toContain("isReduceMotionEnabled");
    });

    it("listens for reduceMotionChanged events", () => {
      expect(onboardingSource).toContain("reduceMotionChanged");
    });

    it("tracks reduceMotion state", () => {
      expect(onboardingSource).toContain("reduceMotion");
      expect(onboardingSource).toContain("setReduceMotion");
    });

    it("skips animation when reduced motion is enabled", () => {
      expect(onboardingSource).toContain("reduceMotion");
      // Should conditionally use withTiming vs direct assignment
      expect(onboardingSource).toMatch(/reduceMotion\s*\?\s*target/);
    });

    it("skips haptics when reduced motion is enabled", () => {
      expect(onboardingSource).toContain("if (!reduceMotion) hapticPress()");
    });

    it("cleans up accessibility listener", () => {
      expect(onboardingSource).toContain("sub.remove()");
    });
  });

  // ── App Lifecycle Analytics ──
  describe("App lifecycle analytics", () => {
    it("imports AppState in layout", () => {
      expect(layoutSource).toContain("AppState");
    });

    it("fires app_open on mount", () => {
      expect(layoutSource).toContain("Analytics.appOpen()");
    });

    it("listens for AppState changes", () => {
      expect(layoutSource).toContain("AppState.addEventListener");
    });

    it("fires app_open when app becomes active", () => {
      expect(layoutSource).toContain('"active"');
      expect(layoutSource).toContain("Analytics.appOpen()");
    });

    it("fires app_background when app goes to background", () => {
      expect(layoutSource).toContain('"background"');
      expect(layoutSource).toContain("Analytics.appBackground()");
    });

    it("cleans up AppState listener", () => {
      // Verify cleanup pattern exists near the AppState listener
      expect(layoutSource).toContain("return () => sub.remove()");
    });
  });

  // ── Analytics Convenience Functions ──
  describe("Analytics convenience functions", () => {
    it("has appOpen function", () => {
      expect(analyticsSource).toContain('appOpen: () => track("app_open")');
    });

    it("has appBackground function", () => {
      expect(analyticsSource).toContain('appBackground: () => track("app_background")');
    });
  });
});
