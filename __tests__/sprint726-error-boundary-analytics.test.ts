/**
 * Sprint 726 — Error Boundary Analytics Enhancement
 *
 * Owner: Sarah Nakamura (Lead Eng)
 *
 * Verifies:
 * - Error boundary adds breadcrumbs on crash
 * - Error boundary tracks crash analytics event
 * - Retry and Go Home actions are tracked
 * - Component stack is included in analytics
 */
import { describe, it, expect } from "vitest";

describe("Sprint 726 — Error Boundary Analytics", () => {
  let source: string;

  it("loads ErrorBoundary source", async () => {
    const fs = await import("node:fs");
    source = fs.readFileSync(
      new URL("../components/ErrorBoundary.tsx", import.meta.url),
      "utf-8",
    );
    expect(source).toBeTruthy();
  });

  // ── Crash Instrumentation ──
  describe("Crash instrumentation", () => {
    it("imports addBreadcrumb from sentry", () => {
      expect(source).toContain("import { addBreadcrumb }");
      expect(source).toContain("@/lib/sentry");
    });

    it("imports track from analytics", () => {
      expect(source).toContain("import { track }");
      expect(source).toContain("@/lib/analytics");
    });

    it("adds breadcrumb on crash", () => {
      expect(source).toContain('addBreadcrumb("error_boundary"');
    });

    it("tracks error_boundary_crash event", () => {
      expect(source).toContain("error_boundary_crash");
    });

    it("includes error message in analytics", () => {
      expect(source).toContain("error_message: error.message");
    });

    it("includes component stack in analytics", () => {
      expect(source).toContain("component_stack:");
    });
  });

  // ── Recovery Tracking ──
  describe("Recovery action tracking", () => {
    it("tracks retry action", () => {
      expect(source).toContain("error_boundary_retry");
    });

    it("tracks go home action", () => {
      expect(source).toContain("error_boundary_go_home");
    });
  });

  // ── Existing Functionality Preserved ──
  describe("Existing functionality", () => {
    it("still calls reportComponentCrash", () => {
      expect(source).toContain("reportComponentCrash(error");
    });

    it("still shows Try Again button", () => {
      expect(source).toContain("Try Again");
    });

    it("still shows Go Home button", () => {
      expect(source).toContain("Go Home");
    });

    it("still shows debug info in dev mode", () => {
      expect(source).toContain("__DEV__");
      expect(source).toContain("debugInfo");
    });

    it("still has custom fallback support", () => {
      expect(source).toContain("this.props.fallback");
    });

    it("navigates to home on Go Home tap", () => {
      expect(source).toContain('router.replace("/(tabs)")');
    });
  });
});
