import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Sprint 354: Admin dashboard dimension timing display", () => {
  const adminDashSrc = fs.readFileSync(
    path.resolve("app/admin/dashboard.tsx"), "utf-8"
  );
  const routesSrc = fs.readFileSync(
    path.resolve("server/routes-admin-analytics.ts"), "utf-8"
  );

  // ── Server: Timing Store ──────────────────────────────────────

  describe("Dimension timing in-memory store", () => {
    it("should export recordDimensionTiming function", () => {
      expect(routesSrc).toContain("export function recordDimensionTiming");
    });

    it("should export getDimensionTimingAggregates function", () => {
      expect(routesSrc).toContain("export function getDimensionTimingAggregates");
    });

    it("should limit timing log to MAX_TIMING_LOG entries", () => {
      expect(routesSrc).toContain("MAX_TIMING_LOG");
      expect(routesSrc).toContain("dimensionTimingLog.splice");
    });

    it("should compute averages for each dimension", () => {
      expect(routesSrc).toContain("avgQ1Ms");
      expect(routesSrc).toContain("avgQ2Ms");
      expect(routesSrc).toContain("avgQ3Ms");
      expect(routesSrc).toContain("avgReturnMs");
      expect(routesSrc).toContain("avgTotalMs");
    });

    it("should group by visit type", () => {
      expect(routesSrc).toContain("byVisitType");
      expect(routesSrc).toContain("e.visitType");
    });

    it("should return empty aggregates when no data", () => {
      expect(routesSrc).toContain("count: 0, avgQ1Ms: 0");
    });
  });

  // ── Server: API Endpoints ─────────────────────────────────────

  describe("Dimension timing API endpoints", () => {
    it("should have POST endpoint for recording timing", () => {
      expect(routesSrc).toContain('"/api/analytics/dimension-timing"');
      expect(routesSrc).toContain("app.post");
    });

    it("should have GET endpoint for admin aggregates", () => {
      expect(routesSrc).toContain('"/api/admin/analytics/dimension-timing"');
    });

    it("should validate timing data types", () => {
      expect(routesSrc).toContain('typeof q1Ms !== "number"');
    });

    it("should require auth for POST", () => {
      // POST endpoint has requireAuth
      const postLine = routesSrc.slice(routesSrc.indexOf("/api/analytics/dimension-timing") - 50, routesSrc.indexOf("/api/analytics/dimension-timing") + 50);
      expect(postLine).toContain("requireAuth");
    });

    it("should require admin for GET", () => {
      // The GET route line contains both requireAuth and requireAdmin
      const getIdx = routesSrc.indexOf('app.get("/api/admin/analytics/dimension-timing"');
      expect(getIdx).toBeGreaterThan(-1);
      const getLine = routesSrc.slice(getIdx, getIdx + 120);
      expect(getLine).toContain("requireAdmin");
    });

    it("should sanitize timing values with Math.max(0)", () => {
      expect(routesSrc).toContain("Math.max(0, Math.round(q1Ms))");
    });
  });

  // ── Admin Dashboard Hook ──────────────────────────────────────

  describe("Dashboard dimension timing hook", () => {
    it("should define DimensionTimingData interface", () => {
      expect(adminDashSrc).toContain("DimensionTimingData");
    });

    it("should have useDimensionTiming hook", () => {
      expect(adminDashSrc).toContain("useDimensionTiming");
    });

    it("should fetch from dimension-timing endpoint", () => {
      expect(adminDashSrc).toContain("/api/admin/analytics/dimension-timing");
    });

    it("should call hook in component", () => {
      expect(adminDashSrc).toContain("const dimensionTiming = useDimensionTiming()");
    });
  });

  // ── Admin Dashboard UI ────────────────────────────────────────

  describe("Dashboard timing display", () => {
    it("should show timing section header", () => {
      expect(adminDashSrc).toContain("Rating Dimension Timing");
    });

    it("should display dimension labels", () => {
      expect(adminDashSrc).toContain("Food Quality");
      expect(adminDashSrc).toContain("Would Return");
    });

    it("should convert ms to seconds for display", () => {
      expect(adminDashSrc).toContain("dim.ms / 1000");
    });

    it("should show proportional timing bar", () => {
      expect(adminDashSrc).toContain("timingBarFill");
      expect(adminDashSrc).toContain("dimensionTiming.avgTotalMs");
    });

    it("should show total time row", () => {
      expect(adminDashSrc).toContain("Avg total time");
      expect(adminDashSrc).toContain("timingTotalValue");
    });

    it("should show visit type breakdown when multiple types", () => {
      expect(adminDashSrc).toContain("byVisitType");
      expect(adminDashSrc).toContain("timingVtRow");
    });

    it("should show tracked count", () => {
      expect(adminDashSrc).toContain("dimensionTiming.count");
    });

    it("should only render when data exists", () => {
      expect(adminDashSrc).toContain("dimensionTiming.count > 0");
    });
  });

  // ── Dashboard Styles ──────────────────────────────────────────

  describe("Timing display styles", () => {
    it("should have timing card styles", () => {
      expect(adminDashSrc).toContain("timingCard:");
      expect(adminDashSrc).toContain("timingValue:");
      expect(adminDashSrc).toContain("timingLabel:");
    });

    it("should have timing bar styles", () => {
      expect(adminDashSrc).toContain("timingBarBg:");
      expect(adminDashSrc).toContain("timingBarFill:");
    });

    it("should use amber for timing values", () => {
      const timingValueStyle = adminDashSrc.slice(
        adminDashSrc.indexOf("timingValue:"),
        adminDashSrc.indexOf("}", adminDashSrc.indexOf("timingValue:")) + 1
      );
      expect(timingValueStyle).toContain("BRAND.colors.amber");
    });
  });
});
