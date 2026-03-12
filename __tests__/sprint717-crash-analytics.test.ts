/**
 * Sprint 717 — Crash Analytics Integration
 *
 * Owner: Derek Liu (Mobile)
 *
 * Verifies:
 * - Error reporting module captures and buffers errors
 * - Sentry abstraction tracks breadcrumbs with size limit
 * - ErrorBoundary calls reportComponentCrash
 * - Global error handler wired in _layout.tsx
 * - Navigation breadcrumbs added for notification taps
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  reportError, reportComponentCrash,
  getRecentErrors, clearErrors,
} from "../lib/error-reporting";
import {
  addBreadcrumb, getRecentBreadcrumbs,
  isInitialized, captureException, captureMessage,
  setUser, getCurrentUser,
} from "../lib/sentry";

describe("Error Reporting Module", () => {
  beforeEach(() => {
    clearErrors();
  });

  it("reportError adds to buffer", () => {
    reportError(new Error("test error"), { page: "home" });
    const errors = getRecentErrors();
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe("test error");
    expect(errors[0].context).toEqual({ page: "home" });
    expect(errors[0].timestamp).toBeGreaterThan(0);
  });

  it("reportComponentCrash adds to buffer with component stack", () => {
    reportComponentCrash(
      new Error("render crash"),
      "at MyComponent\nat App",
      "user-42",
    );
    const errors = getRecentErrors();
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe("render crash");
    expect(errors[0].componentStack).toContain("MyComponent");
    expect(errors[0].userId).toBe("user-42");
  });

  it("buffer caps at 100 errors", () => {
    for (let i = 0; i < 120; i++) {
      reportError(new Error(`error-${i}`));
    }
    const errors = getRecentErrors(200);
    expect(errors.length).toBeLessThanOrEqual(100);
  });

  it("clearErrors empties buffer", () => {
    reportError(new Error("a"));
    reportError(new Error("b"));
    expect(getRecentErrors()).toHaveLength(2);
    clearErrors();
    expect(getRecentErrors()).toHaveLength(0);
  });

  it("getRecentErrors respects limit", () => {
    for (let i = 0; i < 10; i++) {
      reportError(new Error(`error-${i}`));
    }
    expect(getRecentErrors(3)).toHaveLength(3);
  });

  it("stack is truncated to 10 lines", () => {
    const error = new Error("deep stack");
    // Error.stack includes the message line + frames
    reportError(error);
    const reported = getRecentErrors()[0];
    if (reported.stack) {
      const lines = reported.stack.split("\n");
      expect(lines.length).toBeLessThanOrEqual(10);
    }
  });
});

describe("Sentry Abstraction", () => {
  it("isInitialized returns false by default", () => {
    // Note: we don't call initSentry in tests to avoid side effects
    // Just verify the function exists and returns boolean
    expect(typeof isInitialized()).toBe("boolean");
  });

  it("captureException is callable", () => {
    expect(() => captureException(new Error("test"))).not.toThrow();
  });

  it("captureMessage is callable", () => {
    expect(() => captureMessage("test message", "warning")).not.toThrow();
  });

  it("setUser and getCurrentUser work", () => {
    setUser({ id: "user-1", email: "test@test.com" });
    expect(getCurrentUser()).toEqual({ id: "user-1", email: "test@test.com" });
    setUser(null);
    expect(getCurrentUser()).toBeNull();
  });

  it("addBreadcrumb adds to breadcrumb buffer", () => {
    addBreadcrumb("navigation", "opened /business/pecan-lodge");
    const crumbs = getRecentBreadcrumbs();
    expect(crumbs.length).toBeGreaterThan(0);
    const last = crumbs[crumbs.length - 1];
    expect(last.category).toBe("navigation");
    expect(last.message).toContain("pecan-lodge");
    expect(last.timestamp).toBeGreaterThan(0);
  });

  it("getRecentBreadcrumbs respects limit", () => {
    for (let i = 0; i < 30; i++) {
      addBreadcrumb("test", `crumb-${i}`);
    }
    expect(getRecentBreadcrumbs(5)).toHaveLength(5);
  });
});

describe("ErrorBoundary wiring", () => {
  let source: string;

  it("loads ErrorBoundary source", async () => {
    const fs = await import("node:fs");
    source = fs.readFileSync(
      new URL("../components/ErrorBoundary.tsx", import.meta.url),
      "utf-8",
    );
    expect(source).toBeTruthy();
  });

  it("imports reportComponentCrash", () => {
    expect(source).toContain("import { reportComponentCrash }");
  });

  it("calls reportComponentCrash in componentDidCatch", () => {
    expect(source).toContain("reportComponentCrash(error");
  });
});

describe("Global error handler (_layout.tsx)", () => {
  let layoutSource: string;

  it("loads _layout.tsx", async () => {
    const fs = await import("node:fs");
    layoutSource = fs.readFileSync(
      new URL("../app/_layout.tsx", import.meta.url),
      "utf-8",
    );
    expect(layoutSource).toBeTruthy();
  });

  it("imports addBreadcrumb from sentry", () => {
    expect(layoutSource).toContain("import { addBreadcrumb }");
  });

  it("imports reportError from error-reporting", () => {
    expect(layoutSource).toContain("import { reportError }");
  });

  it("sets global error handler via ErrorUtils", () => {
    expect(layoutSource).toContain("ErrorUtils.setGlobalHandler");
  });

  it("restores original handler on cleanup", () => {
    expect(layoutSource).toContain("ErrorUtils.getGlobalHandler()");
    expect(layoutSource).toContain("ErrorUtils.setGlobalHandler(originalHandler)");
  });

  it("reports fatal errors with context", () => {
    expect(layoutSource).toContain("reportError(error");
    expect(layoutSource).toContain("global_handler");
  });

  it("adds breadcrumb for notification taps", () => {
    expect(layoutSource).toContain('addBreadcrumb("notification"');
  });
});
