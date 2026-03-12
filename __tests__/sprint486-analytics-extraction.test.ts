/**
 * Sprint 486: Business Analytics Route Extraction
 *
 * Tests:
 * 1. routes-business-analytics.ts module structure
 * 2. routes-businesses.ts LOC reduction
 * 3. Route registration in routes.ts
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Sprint 486: Business Analytics Route Extraction", () => {
  describe("routes-business-analytics.ts module", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../server/routes-business-analytics.ts"),
      "utf-8"
    );

    it("exports registerBusinessAnalyticsRoutes function", () => {
      expect(src).toContain("export function registerBusinessAnalyticsRoutes");
    });

    it("has dashboard endpoint", () => {
      expect(src).toContain('"/api/businesses/:slug/dashboard"');
    });

    it("has rank-history endpoint", () => {
      expect(src).toContain('"/api/businesses/:id/rank-history"');
    });

    it("has dimension-breakdown endpoint", () => {
      expect(src).toContain('"/api/businesses/:id/dimension-breakdown"');
    });

    it("imports buildDashboardTrend from dashboard-analytics", () => {
      expect(src).toContain('import { buildDashboardTrend } from "./dashboard-analytics"');
    });

    it("imports computeDimensionBreakdown from dimension-breakdown", () => {
      expect(src).toContain('import { computeDimensionBreakdown } from "./dimension-breakdown"');
    });

    it("dashboard endpoint requires auth", () => {
      expect(src).toContain("requireAuth");
    });

    it("dashboard endpoint checks owner or admin", () => {
      expect(src).toContain("isAdminEmail");
      expect(src).toContain("isOwner");
      expect(src).toContain("Dashboard access requires business ownership");
    });

    it("dashboard includes trend analytics data", () => {
      expect(src).toContain("weeklyVolume");
      expect(src).toContain("monthlyVolume");
      expect(src).toContain("velocityChange");
      expect(src).toContain("sparklineScores");
    });

    it("is under 120 LOC", () => {
      const lines = src.split("\n").length;
      expect(lines).toBeLessThan(120);
    });
  });

  describe("routes-businesses.ts LOC reduction", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../server/routes-businesses.ts"),
      "utf-8"
    );

    it("is under 360 LOC (Sprint 649: +claim email verification)", () => {
      const lines = src.split("\n").length;
      expect(lines).toBeLessThan(360);
    });

    it("no longer imports buildDashboardTrend", () => {
      expect(src).not.toContain("buildDashboardTrend");
    });

    it("no longer imports computeDimensionBreakdown", () => {
      expect(src).not.toContain("computeDimensionBreakdown");
    });

    it("no longer has dashboard endpoint", () => {
      expect(src).not.toContain('"/api/businesses/:slug/dashboard"');
    });

    it("no longer has rank-history endpoint", () => {
      expect(src).not.toContain('"/api/businesses/:id/rank-history"');
    });

    it("no longer has dimension-breakdown endpoint", () => {
      expect(src).not.toContain('"/api/businesses/:id/dimension-breakdown"');
    });

    it("still has search, autocomplete, slug, ratings, photos (Sprint 659: claims extracted to routes-claims.ts)", () => {
      expect(src).toContain('"/api/businesses/search"');
      expect(src).toContain('"/api/businesses/autocomplete"');
      expect(src).toContain('"/api/businesses/:slug"');
      expect(src).toContain('"/api/businesses/:id/ratings"');
      expect(src).toContain('"/api/businesses/:id/photos"');
    });
  });

  describe("routes.ts registration", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../server/routes.ts"),
      "utf-8"
    );

    it("imports registerBusinessAnalyticsRoutes", () => {
      expect(src).toContain('import { registerBusinessAnalyticsRoutes } from "./routes-business-analytics"');
    });

    it("calls registerBusinessAnalyticsRoutes", () => {
      expect(src).toContain("registerBusinessAnalyticsRoutes(app)");
    });
  });
});
