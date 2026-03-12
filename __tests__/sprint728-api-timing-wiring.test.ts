/**
 * Sprint 728 — API Timing + Error Wiring
 *
 * Owner: Sarah Nakamura (Lead Eng)
 *
 * Verifies:
 * - apiRequest records API call timing via recordApiCall
 * - apiRequest records API errors via recordApiError
 * - apiRequest adds breadcrumbs on error responses
 * - Query function records timing
 * - Network-level failures are tracked with status 0
 */
import { describe, it, expect } from "vitest";

describe("Sprint 728 — API Timing Wiring", () => {
  let queryClientSource: string;

  it("loads query-client.ts source", async () => {
    const fs = await import("node:fs");
    queryClientSource = fs.readFileSync(
      new URL("../lib/query-client.ts", import.meta.url),
      "utf-8",
    );
    expect(queryClientSource).toBeTruthy();
  });

  // ── Imports ──
  describe("Imports", () => {
    it("imports recordApiCall from perf-tracker", () => {
      expect(queryClientSource).toContain("recordApiCall");
      expect(queryClientSource).toContain("@/lib/perf-tracker");
    });

    it("imports recordApiError from perf-tracker", () => {
      expect(queryClientSource).toContain("recordApiError");
    });

    it("imports addBreadcrumb from sentry", () => {
      expect(queryClientSource).toContain("addBreadcrumb");
      expect(queryClientSource).toContain("@/lib/sentry");
    });
  });

  // ── apiRequest Wiring ──
  describe("apiRequest timing", () => {
    it("captures start time", () => {
      expect(queryClientSource).toContain("const startMs = Date.now()");
    });

    it("records API call duration on success", () => {
      expect(queryClientSource).toContain("recordApiCall(endpoint, durationMs)");
    });

    it("records API error on non-OK response", () => {
      expect(queryClientSource).toContain("recordApiError(endpoint, res.status)");
    });

    it("adds breadcrumb on error response", () => {
      expect(queryClientSource).toContain('addBreadcrumb("api"');
    });

    it("catches network-level failures", () => {
      expect(queryClientSource).toContain("NETWORK_ERROR");
    });

    it("records status 0 for network errors", () => {
      expect(queryClientSource).toContain("recordApiError(endpoint, 0)");
    });
  });

  // ── Query Function Wiring ──
  describe("Query function timing", () => {
    it("records query timing", () => {
      // The query function section should have recordApiCall
      const querySection = queryClientSource.slice(
        queryClientSource.indexOf("queryKey.join"),
      );
      expect(querySection).toContain("recordApiCall");
    });

    it("records query errors", () => {
      const querySection = queryClientSource.slice(
        queryClientSource.indexOf("queryKey.join"),
      );
      expect(querySection).toContain("recordApiError");
    });
  });
});
