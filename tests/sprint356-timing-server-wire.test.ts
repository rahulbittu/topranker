import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Sprint 356: Wire client timing to server POST endpoint", () => {
  const submitSrc = fs.readFileSync(
    path.resolve("lib/hooks/useRatingSubmit.ts"), "utf-8"
  );
  const routesSrc = fs.readFileSync(
    path.resolve("server/routes-admin-analytics.ts"), "utf-8"
  );

  // ── Client: useRatingSubmit wiring ────────────────────────────

  describe("useRatingSubmit server timing call", () => {
    it("should call apiRequest POST to dimension-timing endpoint", () => {
      expect(submitSrc).toContain('apiRequest("POST", "/api/analytics/dimension-timing"');
    });

    it("should pass timing payload to apiRequest", () => {
      expect(submitSrc).toContain("apiRequest(\"POST\", \"/api/analytics/dimension-timing\", timingPayload)");
    });

    it("should catch errors silently", () => {
      expect(submitSrc).toContain(".catch(() => {})");
    });

    it("should still fire Analytics.track event", () => {
      expect(submitSrc).toContain('Analytics.track("rate_dimension_timing"');
    });

    it("should create timingPayload with all fields", () => {
      expect(submitSrc).toContain("const timingPayload = {");
      expect(submitSrc).toContain("q1Ms: dimensionTimingMs[0]");
      expect(submitSrc).toContain("q2Ms: dimensionTimingMs[1]");
      expect(submitSrc).toContain("q3Ms: dimensionTimingMs[2]");
      expect(submitSrc).toContain("returnMs: dimensionTimingMs[3]");
      expect(submitSrc).toContain("totalMs: dimensionTimingMs.reduce");
    });

    it("should include visitType in timing payload", () => {
      expect(submitSrc).toContain('visitType: visitType || "dine_in"');
    });

    it("should include businessId in timing payload", () => {
      expect(submitSrc).toContain("businessId,");
    });

    it("should only fire when timing data exists", () => {
      expect(submitSrc).toContain("dimensionTimingMs.some(t => t > 0)");
    });
  });

  // ── Server: Endpoint exists ───────────────────────────────────

  describe("Server dimension-timing endpoint", () => {
    it("should have POST endpoint", () => {
      expect(routesSrc).toContain('"/api/analytics/dimension-timing"');
    });

    it("should validate input types", () => {
      expect(routesSrc).toContain('typeof q1Ms !== "number"');
    });

    it("should have recordDimensionTiming function", () => {
      expect(routesSrc).toContain("recordDimensionTiming");
    });

    it("should have getDimensionTimingAggregates function", () => {
      expect(routesSrc).toContain("getDimensionTimingAggregates");
    });
  });

  // ── Import check ──────────────────────────────────────────────

  describe("Import dependencies", () => {
    it("should import apiRequest", () => {
      expect(submitSrc).toContain('import { apiRequest }');
    });

    it("should import Analytics", () => {
      expect(submitSrc).toContain('import { Analytics }');
    });
  });
});
