/**
 * Sprint 739 — Accessibility Polish + ErrorBoundary Network Awareness
 *
 * Owner: Derek Liu (Mobile)
 *
 * Verifies:
 * - 404 page has accessibility labels
 * - ErrorBoundary has network-aware messaging
 * - Splash screen has accessibility label
 */
import { describe, it, expect } from "vitest";

describe("Sprint 739 — A11y + Error Network Awareness", () => {
  let notFoundSource: string;
  let errorBoundarySource: string;
  let layoutSource: string;

  it("loads source files", async () => {
    const fs = await import("node:fs");
    notFoundSource = fs.readFileSync(
      new URL("../app/+not-found.tsx", import.meta.url),
      "utf-8",
    );
    errorBoundarySource = fs.readFileSync(
      new URL("../components/ErrorBoundary.tsx", import.meta.url),
      "utf-8",
    );
    layoutSource = fs.readFileSync(
      new URL("../app/_layout.tsx", import.meta.url),
      "utf-8",
    );
    expect(notFoundSource).toBeTruthy();
    expect(errorBoundarySource).toBeTruthy();
    expect(layoutSource).toBeTruthy();
  });

  // ── 404 Page Accessibility ──
  describe("404 page accessibility", () => {
    it("has accessibilityRole alert on container", () => {
      expect(notFoundSource).toContain('accessibilityRole="alert"');
    });

    it("has accessibilityLabel on container", () => {
      expect(notFoundSource).toContain('accessibilityLabel="Page not found"');
    });

    it("hides decorative icon from screen readers", () => {
      expect(notFoundSource).toContain("accessibilityElementsHidden");
    });

    it("has accessibilityRole button on back link", () => {
      expect(notFoundSource).toContain('accessibilityRole="button"');
    });

    it("has accessibilityLabel on back link", () => {
      expect(notFoundSource).toContain('accessibilityLabel="Back to Rankings"');
    });
  });

  // ── ErrorBoundary Network Awareness ──
  describe("ErrorBoundary network awareness", () => {
    it("has isNetworkError method", () => {
      expect(errorBoundarySource).toContain("isNetworkError");
    });

    it("detects network keyword in error message", () => {
      expect(errorBoundarySource).toContain('"network"');
    });

    it("detects fetch keyword in error message", () => {
      expect(errorBoundarySource).toContain('"fetch"');
    });

    it("detects timeout keyword in error message", () => {
      expect(errorBoundarySource).toContain('"timeout"');
    });

    it("shows offline-specific message for network errors", () => {
      expect(errorBoundarySource).toContain("Looks like you're offline");
    });

    it("shows generic message for non-network errors", () => {
      expect(errorBoundarySource).toContain("Don't worry — your data is safe");
    });

    it("uses conditional messaging based on error type", () => {
      expect(errorBoundarySource).toContain("this.isNetworkError()");
    });

    it("has accessibilityRole header on title", () => {
      expect(errorBoundarySource).toContain('accessibilityRole="header"');
    });
  });

  // ── Splash Screen Accessibility ──
  describe("Splash screen accessibility", () => {
    it("has accessible prop on splash container", () => {
      // The splash Animated.View should have accessible and accessibilityLabel
      const splashSection = layoutSource.slice(
        layoutSource.indexOf("function AnimatedSplash"),
        layoutSource.indexOf("const splashStyles"),
      );
      expect(splashSection).toContain("accessible");
    });

    it("has accessibility label for splash", () => {
      expect(layoutSource).toContain('accessibilityLabel="TopRanker loading"');
    });
  });

  // ── ErrorBoundary Existing Features Preserved ──
  describe("ErrorBoundary existing features", () => {
    it("has retry button with a11y", () => {
      expect(errorBoundarySource).toContain('accessibilityLabel="Try again"');
    });

    it("has go home button with a11y", () => {
      expect(errorBoundarySource).toContain('accessibilityLabel="Go to home screen"');
    });

    it("tracks error_boundary_crash analytics", () => {
      expect(errorBoundarySource).toContain("error_boundary_crash");
    });

    it("adds breadcrumb on crash", () => {
      expect(errorBoundarySource).toContain('addBreadcrumb("error_boundary"');
    });

    it("shows debug info in __DEV__", () => {
      expect(errorBoundarySource).toContain("__DEV__");
    });
  });
});
