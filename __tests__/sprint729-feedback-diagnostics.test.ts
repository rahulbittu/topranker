/**
 * Sprint 729 — Feedback Diagnostics + Console Hygiene
 *
 * Owner: Derek Liu (Mobile)
 *
 * Verifies:
 * - Feedback form includes perf summary, API errors, and breadcrumbs
 * - Console.log statements are guarded with __DEV__ in production paths
 * - Sentry module guards all console output
 */
import { describe, it, expect } from "vitest";

describe("Sprint 729 — Feedback Diagnostics + Console Hygiene", () => {
  let feedbackSource: string;
  let sentrySource: string;
  let layoutSource: string;

  it("loads source files", async () => {
    const fs = await import("node:fs");
    feedbackSource = fs.readFileSync(
      new URL("../app/feedback.tsx", import.meta.url),
      "utf-8",
    );
    sentrySource = fs.readFileSync(
      new URL("../lib/sentry.ts", import.meta.url),
      "utf-8",
    );
    layoutSource = fs.readFileSync(
      new URL("../app/_layout.tsx", import.meta.url),
      "utf-8",
    );
    expect(feedbackSource).toBeTruthy();
    expect(sentrySource).toBeTruthy();
    expect(layoutSource).toBeTruthy();
  });

  // ── Feedback Diagnostics ──
  describe("Feedback diagnostics context", () => {
    it("imports getPerfSummary from perf-tracker", () => {
      expect(feedbackSource).toContain("getPerfSummary");
      expect(feedbackSource).toContain("@/lib/perf-tracker");
    });

    it("imports getRecentApiErrors from perf-tracker", () => {
      expect(feedbackSource).toContain("getRecentApiErrors");
    });

    it("imports getRecentBreadcrumbs from sentry", () => {
      expect(feedbackSource).toContain("getRecentBreadcrumbs");
      expect(feedbackSource).toContain("@/lib/sentry");
    });

    it("includes diagnostics object in submission body", () => {
      expect(feedbackSource).toContain("diagnostics:");
    });

    it("includes perf summary in diagnostics", () => {
      expect(feedbackSource).toContain("perf: getPerfSummary()");
    });

    it("includes recent API errors in diagnostics", () => {
      expect(feedbackSource).toContain("recentErrors: getRecentApiErrors(");
    });

    it("includes breadcrumbs in diagnostics", () => {
      expect(feedbackSource).toContain("breadcrumbs: getRecentBreadcrumbs(");
    });
  });

  // ── Console Hygiene ──
  describe("Console hygiene — __DEV__ guards", () => {
    it("guards push token log with __DEV__", () => {
      expect(layoutSource).toContain('if (__DEV__) console.log("[Push] Token:"');
    });

    it("guards Sentry init log with __DEV__", () => {
      // initSentry should have __DEV__ before console.log
      const initSection = sentrySource.slice(
        sentrySource.indexOf("function initSentry"),
        sentrySource.indexOf("function captureException"),
      );
      expect(initSection).toContain("__DEV__");
      expect(initSection).toContain("console.log");
    });

    it("guards captureException log with __DEV__", () => {
      const captureSection = sentrySource.slice(
        sentrySource.indexOf("function captureException"),
        sentrySource.indexOf("function captureMessage"),
      );
      expect(captureSection).toContain("__DEV__");
    });

    it("guards captureMessage log with __DEV__", () => {
      const msgSection = sentrySource.slice(
        sentrySource.indexOf("function captureMessage"),
        sentrySource.indexOf("function setUser"),
      );
      expect(msgSection).toContain("__DEV__");
    });

    it("guards setUser log with __DEV__", () => {
      const userSection = sentrySource.slice(
        sentrySource.indexOf("function setUser"),
        sentrySource.indexOf("function addBreadcrumb"),
      );
      expect(userSection).toContain("__DEV__");
    });

    it("guards addBreadcrumb log with __DEV__", () => {
      const bcSection = sentrySource.slice(
        sentrySource.indexOf("function addBreadcrumb"),
        sentrySource.indexOf("function getRecentBreadcrumbs"),
      );
      expect(bcSection).toContain("__DEV__");
    });
  });

  // ── Perf Tracker Exports ──
  describe("Perf tracker exports", () => {
    it("exports getPerfSummary", async () => {
      const perfTracker = await import("../lib/perf-tracker");
      expect(typeof perfTracker.getPerfSummary).toBe("function");
    });

    it("exports getRecentApiErrors", async () => {
      const perfTracker = await import("../lib/perf-tracker");
      expect(typeof perfTracker.getRecentApiErrors).toBe("function");
    });
  });

  // ── Sentry Exports ──
  describe("Sentry exports", () => {
    it("exports getRecentBreadcrumbs", async () => {
      const sentry = await import("../lib/sentry");
      expect(typeof sentry.getRecentBreadcrumbs).toBe("function");
    });
  });
});
