/**
 * Sprint 738 — Session Analytics + AASA Fix + Pre-Submit Hardening
 *
 * Owner: Sarah Nakamura (Lead Eng)
 *
 * Verifies:
 * - Analytics events include session_id and session_duration_ms
 * - Session ID is generated on module load
 * - AASA file has correct Team ID
 * - Feedback includes session context
 * - Pre-submit script validates static files
 */
import { describe, it, expect } from "vitest";

describe("Sprint 738 — Session Analytics + Hardening", () => {
  let analyticsSource: string;
  let feedbackSource: string;
  let aasaContent: any;
  let preSubmitSource: string;
  let storeMetadataSource: string;

  it("loads source files", async () => {
    const fs = await import("node:fs");
    analyticsSource = fs.readFileSync(
      new URL("../lib/analytics.ts", import.meta.url),
      "utf-8",
    );
    feedbackSource = fs.readFileSync(
      new URL("../app/feedback.tsx", import.meta.url),
      "utf-8",
    );
    aasaContent = JSON.parse(
      fs.readFileSync(
        new URL("../public/.well-known/apple-app-site-association", import.meta.url),
        "utf-8",
      ),
    );
    preSubmitSource = fs.readFileSync(
      new URL("../scripts/pre-submit-check.sh", import.meta.url),
      "utf-8",
    );
    storeMetadataSource = fs.readFileSync(
      new URL("../config/store-metadata.ts", import.meta.url),
      "utf-8",
    );
    expect(analyticsSource).toBeTruthy();
  });

  // ── Session Analytics ──
  describe("Session ID in analytics", () => {
    it("generates session ID on module load", () => {
      expect(analyticsSource).toContain("let sessionId = generateSessionId()");
    });

    it("exports getSessionId function", () => {
      expect(analyticsSource).toContain("export function getSessionId");
    });

    it("exports getSessionDurationMs function", () => {
      expect(analyticsSource).toContain("export function getSessionDurationMs");
    });

    it("includes session_id in tracked events", () => {
      expect(analyticsSource).toContain("session_id: sessionId");
    });

    it("includes session_duration_ms in tracked events", () => {
      expect(analyticsSource).toContain("session_duration_ms:");
    });

    it("tracks session start time", () => {
      expect(analyticsSource).toContain("let sessionStartMs = Date.now()");
    });
  });

  // ── Session in Feedback ──
  describe("Session context in feedback", () => {
    it("imports getSessionId", () => {
      expect(feedbackSource).toContain("getSessionId");
    });

    it("imports getSessionDurationMs", () => {
      expect(feedbackSource).toContain("getSessionDurationMs");
    });

    it("includes sessionId in diagnostics", () => {
      expect(feedbackSource).toContain("sessionId: getSessionId()");
    });

    it("includes sessionDurationMs in diagnostics", () => {
      expect(feedbackSource).toContain("sessionDurationMs: getSessionDurationMs()");
    });
  });

  // ── AASA Team ID ──
  describe("AASA Team ID fix", () => {
    it("has correct Apple Team ID", () => {
      const appId = aasaContent.applinks.details[0].appIDs[0];
      expect(appId).toBe("RKGRR7XGWD.com.topranker.app");
    });

    it("store metadata AASA also has correct Team ID", () => {
      expect(storeMetadataSource).toContain("RKGRR7XGWD.com.topranker.app");
    });

    it("no placeholder TEAM_ID remains in AASA", () => {
      const appId = aasaContent.applinks.details[0].appIDs[0];
      expect(appId).not.toContain("TEAM_ID");
    });
  });

  // ── Pre-Submit Script ──
  describe("Pre-submit hardening", () => {
    it("checks AASA file existence", () => {
      expect(preSubmitSource).toContain("apple-app-site-association");
    });

    it("checks AASA Team ID", () => {
      expect(preSubmitSource).toContain("RKGRR7XGWD");
    });

    it("checks robots.txt existence", () => {
      expect(preSubmitSource).toContain("robots.txt");
    });

    it("checks store metadata config", () => {
      expect(preSubmitSource).toContain("store-metadata.ts");
    });

    it("checks rate limiter count", () => {
      expect(preSubmitSource).toContain("Rate limiters defined");
    });
  });

  // ── Runtime Exports ──
  describe("Runtime exports work", () => {
    it("getSessionId returns a string", async () => {
      const { getSessionId } = await import("../lib/analytics");
      expect(typeof getSessionId()).toBe("string");
      expect(getSessionId().length).toBeGreaterThan(5);
    });

    it("getSessionDurationMs returns a number", async () => {
      const { getSessionDurationMs } = await import("../lib/analytics");
      expect(typeof getSessionDurationMs()).toBe("number");
      expect(getSessionDurationMs()).toBeGreaterThanOrEqual(0);
    });

    it("session ID is consistent within same import", async () => {
      const { getSessionId } = await import("../lib/analytics");
      const id1 = getSessionId();
      const id2 = getSessionId();
      expect(id1).toBe(id2);
    });
  });
});
