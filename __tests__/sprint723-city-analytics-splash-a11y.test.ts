/**
 * Sprint 723 — City Change Analytics + Splash Reduced Motion
 *
 * Owner: Derek Liu (Mobile)
 *
 * Verifies:
 * - city_change analytics event fires on city selection
 * - Splash animation respects reduced motion preference
 * - AnimatedSplash accepts reduceMotion prop
 */
import { describe, it, expect } from "vitest";

describe("Sprint 723 — City Analytics + Splash A11y", () => {
  let cityContextSource: string;
  let layoutSource: string;
  let analyticsSource: string;

  it("loads required files", async () => {
    const fs = await import("node:fs");
    cityContextSource = fs.readFileSync(
      new URL("../lib/city-context.tsx", import.meta.url),
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
    expect(cityContextSource).toBeTruthy();
  });

  // ── City Change Analytics ──
  describe("City change analytics", () => {
    it("imports track in city-context", () => {
      expect(cityContextSource).toContain("import { track }");
    });

    it("tracks city_change event on setCity", () => {
      expect(cityContextSource).toContain('track("city_change"');
    });

    it("passes new city as property", () => {
      expect(cityContextSource).toContain("city: newCity");
    });

    it("city_change is defined in AnalyticsEvent type", () => {
      expect(analyticsSource).toContain('"city_change"');
    });
  });

  // ── Splash Reduced Motion ──
  describe("Splash reduced motion", () => {
    it("imports AccessibilityInfo in layout", () => {
      expect(layoutSource).toContain("AccessibilityInfo");
    });

    it("checks isReduceMotionEnabled in RootLayout", () => {
      expect(layoutSource).toContain("isReduceMotionEnabled");
    });

    it("AnimatedSplash accepts reduceMotion prop", () => {
      expect(layoutSource).toContain("reduceMotion");
      expect(layoutSource).toContain("reduceMotion: boolean");
    });

    it("passes reduceMotion to AnimatedSplash", () => {
      expect(layoutSource).toContain("reduceMotion={reduceMotion}");
    });

    it("skips animations when reduceMotion is true", () => {
      expect(layoutSource).toContain("if (reduceMotion)");
      // Should set values directly without animation
      expect(layoutSource).toContain("crownScale.value = 1");
      expect(layoutSource).toContain("logoOpacity.value = 1");
    });

    it("still calls onFinish even with reduced motion", () => {
      // The reduced motion path should still trigger onFinish
      const reducedBlock = layoutSource.slice(
        layoutSource.indexOf("if (reduceMotion)"),
        layoutSource.indexOf("return;") + 10,
      );
      expect(reducedBlock).toContain("onFinish");
    });

    it("shows splash briefly before exit in reduced motion", () => {
      // Should delay briefly so content is visible
      const reducedBlock = layoutSource.slice(
        layoutSource.indexOf("if (reduceMotion)"),
        layoutSource.indexOf("return;") + 10,
      );
      expect(reducedBlock).toContain("withDelay");
    });
  });
});
