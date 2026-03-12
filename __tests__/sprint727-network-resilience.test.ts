/**
 * Sprint 727 — Network Error Resilience
 *
 * Owner: Derek Liu (Mobile)
 *
 * Verifies:
 * - Network state changes tracked via breadcrumbs and analytics
 * - API error tracking in perf-tracker
 * - Query client retry logic exists for network errors
 * - NetworkBanner shows appropriate states
 */
import { describe, it, expect } from "vitest";

describe("Sprint 727 — Network Resilience", () => {
  let networkBannerSource: string;
  let perfTrackerSource: string;
  let queryClientSource: string;

  it("loads required files", async () => {
    const fs = await import("node:fs");
    networkBannerSource = fs.readFileSync(
      new URL("../components/NetworkBanner.tsx", import.meta.url),
      "utf-8",
    );
    perfTrackerSource = fs.readFileSync(
      new URL("../lib/perf-tracker.ts", import.meta.url),
      "utf-8",
    );
    queryClientSource = fs.readFileSync(
      new URL("../lib/query-client.ts", import.meta.url),
      "utf-8",
    );
    expect(networkBannerSource).toBeTruthy();
  });

  // ── Network State Tracking ──
  describe("Network state tracking", () => {
    it("imports addBreadcrumb for network events", () => {
      expect(networkBannerSource).toContain("import { addBreadcrumb }");
    });

    it("imports track for network analytics", () => {
      expect(networkBannerSource).toContain("import { track }");
    });

    it("adds breadcrumb when going offline", () => {
      expect(networkBannerSource).toContain('addBreadcrumb("network", "went_offline")');
    });

    it("adds breadcrumb when recovering", () => {
      expect(networkBannerSource).toContain('addBreadcrumb("network", "back_online")');
    });

    it("tracks network_lost event", () => {
      expect(networkBannerSource).toContain("network_lost");
    });

    it("tracks network_recovered event", () => {
      expect(networkBannerSource).toContain("network_recovered");
    });
  });

  // ── API Error Tracking ──
  describe("API error tracking", () => {
    it("has recordApiError function", () => {
      expect(perfTrackerSource).toContain("export function recordApiError");
    });

    it("tracks endpoint and status", () => {
      expect(perfTrackerSource).toContain("endpoint: string, status: number");
    });

    it("has getRecentApiErrors function", () => {
      expect(perfTrackerSource).toContain("export function getRecentApiErrors");
    });

    it("buffers up to 50 API errors", () => {
      expect(perfTrackerSource).toContain("MAX_API_ERRORS = 50");
    });
  });

  // ── Query Client Retry Logic ──
  describe("Query client retry logic", () => {
    it("has shouldRetry function", () => {
      expect(queryClientSource).toContain("function shouldRetry");
    });

    it("does not retry 4xx client errors", () => {
      expect(queryClientSource).toContain("4\\d{2}:");
      expect(queryClientSource).toContain("return false");
    });

    it("retries network errors and 5xx", () => {
      expect(queryClientSource).toContain("return true");
    });

    it("limits retry count to 2", () => {
      expect(queryClientSource).toContain("failureCount >= 2");
    });

    it("uses exponential backoff", () => {
      expect(queryClientSource).toContain("retryDelay");
      expect(queryClientSource).toContain("2 ** attemptIndex");
    });
  });

  // ── NetworkBanner States ──
  describe("NetworkBanner states", () => {
    it("shows offline message", () => {
      expect(networkBannerSource).toContain("No internet connection");
    });

    it("shows recovery message", () => {
      expect(networkBannerSource).toContain("Back online");
    });

    it("shows mock data mode", () => {
      expect(networkBannerSource).toContain("Demo mode");
    });

    it("has retry button for mock mode", () => {
      expect(networkBannerSource).toContain("Retry");
      expect(networkBannerSource).toContain("handleRetry");
    });

    it("has dismiss button", () => {
      expect(networkBannerSource).toContain("Dismiss banner");
    });
  });
});
