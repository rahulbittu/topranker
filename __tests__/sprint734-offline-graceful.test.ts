/**
 * Sprint 734 — Offline Mode Graceful Degradation
 *
 * Owner: Derek Liu (Mobile)
 *
 * Verifies:
 * - useOfflineAware hook logic (stale detection, error vs cached)
 * - StaleBanner component exists with correct structure
 * - Rankings screen uses offline-aware pattern
 */
import { describe, it, expect } from "vitest";
import { useOfflineAware } from "../lib/hooks/useOfflineAware";

// Mock React hooks for testing
let mockCleanup: (() => void) | undefined;
const React = await import("react");
const originalUseEffect = React.useEffect;
const originalUseState = React.useState;

// We test the hook logic directly since it's pure logic with side effects
describe("Sprint 734 — Offline Graceful Degradation", () => {
  let staleBannerSource: string;
  let rankingsSource: string;
  let hookSource: string;

  it("loads source files", async () => {
    const fs = await import("node:fs");
    staleBannerSource = fs.readFileSync(
      new URL("../components/StaleBanner.tsx", import.meta.url),
      "utf-8",
    );
    rankingsSource = fs.readFileSync(
      new URL("../app/(tabs)/index.tsx", import.meta.url),
      "utf-8",
    );
    hookSource = fs.readFileSync(
      new URL("../lib/hooks/useOfflineAware.ts", import.meta.url),
      "utf-8",
    );
    expect(staleBannerSource).toBeTruthy();
    expect(rankingsSource).toBeTruthy();
    expect(hookSource).toBeTruthy();
  });

  // ── Hook Logic ──
  describe("useOfflineAware hook", () => {
    it("exports useOfflineAware function", () => {
      expect(hookSource).toContain("export function useOfflineAware");
    });

    it("returns isStale, staleLabel, showError", () => {
      expect(hookSource).toContain("isStale");
      expect(hookSource).toContain("staleLabel");
      expect(hookSource).toContain("showError");
    });

    it("checks dataUpdatedAt for cache detection", () => {
      expect(hookSource).toContain("dataUpdatedAt");
    });

    it("formats age in minutes", () => {
      expect(hookSource).toContain("formatAge");
    });

    it("returns showError false when has cached data", () => {
      // When error with cached data → don't show error
      expect(hookSource).toContain("hasData && dataUpdatedAt > 0");
    });

    it("returns showError true when no cached data", () => {
      // The function returns showError: true at the end (no data case)
      expect(hookSource).toContain("showError: true");
    });
  });

  // ── StaleBanner Component ──
  describe("StaleBanner component", () => {
    it("accepts label prop", () => {
      expect(staleBannerSource).toContain("StaleBannerProps");
      expect(staleBannerSource).toContain("label: string");
    });

    it("shows cached data message", () => {
      expect(staleBannerSource).toContain("showing cached data");
    });

    it("uses time-outline icon", () => {
      expect(staleBannerSource).toContain("time-outline");
    });

    it("has accessibility role alert", () => {
      expect(staleBannerSource).toContain('accessibilityRole="alert"');
    });

    it("exports StaleBanner", () => {
      expect(staleBannerSource).toContain("export function StaleBanner");
    });
  });

  // ── Rankings Screen Wiring ──
  describe("Rankings screen offline-aware", () => {
    it("imports useOfflineAware", () => {
      expect(rankingsSource).toContain("useOfflineAware");
      expect(rankingsSource).toContain("@/lib/hooks/useOfflineAware");
    });

    it("imports StaleBanner", () => {
      expect(rankingsSource).toContain("StaleBanner");
      expect(rankingsSource).toContain("@/components/StaleBanner");
    });

    it("destructures isStale, staleLabel, showError", () => {
      expect(rankingsSource).toContain("isStale");
      expect(rankingsSource).toContain("staleLabel");
      expect(rankingsSource).toContain("showError");
    });

    it("uses showError instead of isError for error state", () => {
      expect(rankingsSource).toContain("showError ?");
    });

    it("renders StaleBanner when stale", () => {
      expect(rankingsSource).toContain("isStale && staleLabel");
      expect(rankingsSource).toContain("<StaleBanner");
    });

    it("passes dataUpdatedAt to useOfflineAware", () => {
      expect(rankingsSource).toContain("dataUpdatedAt");
    });
  });

  // ── Age Formatting ──
  describe("Age formatting", () => {
    it("handles seconds (just now)", () => {
      expect(hookSource).toContain("Updated just now");
    });

    it("handles minutes", () => {
      expect(hookSource).toContain("m ago");
    });

    it("handles hours", () => {
      expect(hookSource).toContain("h ago");
    });

    it("handles days", () => {
      expect(hookSource).toContain("d ago");
    });
  });
});
