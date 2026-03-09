/**
 * Sprint 243 — Business Analytics Dashboard for Claimed Owners
 *
 * Validates:
 * 1. Business analytics module (server/business-analytics.ts) — static + runtime
 * 2. Owner dashboard routes (server/routes-owner-dashboard.ts) — static
 * 3. Integration wiring (routes.ts)
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  recordView,
  getBusinessMetrics,
  getTopBusinesses,
  getViewSources,
  getAnalyticsStats,
  clearAnalyticsEvents,
  MAX_EVENTS,
} from "../server/business-analytics";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. Business Analytics — Static
// ---------------------------------------------------------------------------
describe("Business analytics — static analysis", () => {
  const src = readFile("server/business-analytics.ts");

  it("file exists", () => {
    expect(fileExists("server/business-analytics.ts")).toBe(true);
  });

  it("exports recordView function", () => {
    expect(src).toContain("export function recordView");
  });

  it("exports getBusinessMetrics function", () => {
    expect(src).toContain("export function getBusinessMetrics");
  });

  it("exports getTopBusinesses function", () => {
    expect(src).toContain("export function getTopBusinesses");
  });

  it("exports getViewSources function", () => {
    expect(src).toContain("export function getViewSources");
  });

  it("exports getAnalyticsStats function", () => {
    expect(src).toContain("export function getAnalyticsStats");
  });

  it("exports clearAnalyticsEvents function", () => {
    expect(src).toContain("export function clearAnalyticsEvents");
  });

  it("MAX_EVENTS is 10000", () => {
    expect(MAX_EVENTS).toBe(10000);
  });

  it("uses tagged logger", () => {
    expect(src).toContain('log.tag("BusinessAnalytics")');
  });

  it("defines ViewEvent source types", () => {
    expect(src).toContain('"search"');
    expect(src).toContain('"direct"');
    expect(src).toContain('"challenger"');
    expect(src).toContain('"referral"');
  });
});

// ---------------------------------------------------------------------------
// 2. Business Analytics — Runtime
// ---------------------------------------------------------------------------
describe("Business analytics — runtime", () => {
  beforeEach(() => {
    clearAnalyticsEvents();
  });

  it("recordView adds event and getAnalyticsStats reflects it", () => {
    recordView("biz1", "visitor1", "search");
    const stats = getAnalyticsStats();
    expect(stats.totalEvents).toBe(1);
    expect(stats.uniqueBusinesses).toBe(1);
    expect(stats.uniqueVisitors).toBe(1);
  });

  it("recordView tracks multiple businesses", () => {
    recordView("biz1", "v1", "search");
    recordView("biz2", "v2", "direct");
    const stats = getAnalyticsStats();
    expect(stats.uniqueBusinesses).toBe(2);
    expect(stats.uniqueVisitors).toBe(2);
  });

  it("getBusinessMetrics returns correct view count", () => {
    recordView("biz1", "v1", "search");
    recordView("biz1", "v2", "direct");
    recordView("biz1", "v1", "search");
    const metrics = getBusinessMetrics("biz1", "7d");
    expect(metrics.views).toBe(3);
    expect(metrics.uniqueVisitors).toBe(2);
  });

  it("getBusinessMetrics filters by businessId", () => {
    recordView("biz1", "v1", "search");
    recordView("biz2", "v2", "direct");
    const metrics = getBusinessMetrics("biz1", "7d");
    expect(metrics.views).toBe(1);
  });

  it("getBusinessMetrics returns correct period", () => {
    recordView("biz1", "v1", "search");
    const m7 = getBusinessMetrics("biz1", "7d");
    const m30 = getBusinessMetrics("biz1", "30d");
    const m90 = getBusinessMetrics("biz1", "90d");
    expect(m7.period).toBe("7d");
    expect(m30.period).toBe("30d");
    expect(m90.period).toBe("90d");
  });

  it("getBusinessMetrics counts searchAppearances and profileClicks", () => {
    recordView("biz1", "v1", "search");
    recordView("biz1", "v2", "search");
    recordView("biz1", "v3", "direct");
    const metrics = getBusinessMetrics("biz1", "30d");
    expect(metrics.searchAppearances).toBe(2);
    expect(metrics.profileClicks).toBe(1);
  });

  it("getBusinessMetrics counts challengerAppearances", () => {
    recordView("biz1", "v1", "challenger");
    recordView("biz1", "v2", "challenger");
    recordView("biz1", "v3", "referral");
    const metrics = getBusinessMetrics("biz1", "30d");
    expect(metrics.challengerAppearances).toBe(2);
  });

  it("getBusinessMetrics returns zero for empty business", () => {
    const metrics = getBusinessMetrics("nonexistent", "7d");
    expect(metrics.views).toBe(0);
    expect(metrics.uniqueVisitors).toBe(0);
    expect(metrics.searchAppearances).toBe(0);
  });

  it("getTopBusinesses sorts by view count descending", () => {
    recordView("biz1", "v1", "search");
    recordView("biz2", "v1", "search");
    recordView("biz2", "v2", "search");
    recordView("biz3", "v1", "search");
    recordView("biz3", "v2", "search");
    recordView("biz3", "v3", "search");
    const top = getTopBusinesses();
    expect(top[0].businessId).toBe("biz3");
    expect(top[0].views).toBe(3);
    expect(top[1].businessId).toBe("biz2");
    expect(top[2].businessId).toBe("biz1");
  });

  it("getTopBusinesses respects limit", () => {
    recordView("biz1", "v1", "search");
    recordView("biz2", "v1", "search");
    recordView("biz3", "v1", "search");
    const top = getTopBusinesses(2);
    expect(top).toHaveLength(2);
  });

  it("getTopBusinesses defaults to 10", () => {
    for (let i = 0; i < 15; i++) {
      recordView(`biz${i}`, "v1", "search");
    }
    const top = getTopBusinesses();
    expect(top).toHaveLength(10);
  });

  it("getViewSources returns correct breakdown", () => {
    recordView("biz1", "v1", "search");
    recordView("biz1", "v2", "direct");
    recordView("biz1", "v3", "challenger");
    recordView("biz1", "v4", "referral");
    recordView("biz1", "v5", "search");
    const sources = getViewSources("biz1");
    expect(sources.search).toBe(2);
    expect(sources.direct).toBe(1);
    expect(sources.challenger).toBe(1);
    expect(sources.referral).toBe(1);
  });

  it("getViewSources returns zeros for unknown business", () => {
    const sources = getViewSources("unknown");
    expect(sources.search).toBe(0);
    expect(sources.direct).toBe(0);
    expect(sources.challenger).toBe(0);
    expect(sources.referral).toBe(0);
  });

  it("clearAnalyticsEvents empties all data", () => {
    recordView("biz1", "v1", "search");
    recordView("biz2", "v2", "direct");
    clearAnalyticsEvents();
    const stats = getAnalyticsStats();
    expect(stats.totalEvents).toBe(0);
    expect(stats.uniqueBusinesses).toBe(0);
    expect(stats.uniqueVisitors).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 3. Owner Dashboard Routes — Static
// ---------------------------------------------------------------------------
describe("Owner dashboard routes — static analysis", () => {
  const src = readFile("server/routes-owner-dashboard.ts");

  it("file exists", () => {
    expect(fileExists("server/routes-owner-dashboard.ts")).toBe(true);
  });

  it("exports registerOwnerDashboardRoutes", () => {
    expect(src).toContain("export function registerOwnerDashboardRoutes");
  });

  it("defines owner analytics endpoint", () => {
    expect(src).toContain("/api/owner/analytics/:businessId");
  });

  it("defines sources endpoint", () => {
    expect(src).toContain("/api/owner/analytics/:businessId/sources");
  });

  it("defines trends endpoint", () => {
    expect(src).toContain("/api/owner/analytics/:businessId/trends");
  });

  it("defines admin top-businesses endpoint", () => {
    expect(src).toContain("/api/admin/analytics/top-businesses");
  });

  it("defines admin stats endpoint", () => {
    expect(src).toContain("/api/admin/analytics/stats");
  });

  it("uses tagged logger", () => {
    expect(src).toContain('log.tag("OwnerDashboard")');
  });
});

// ---------------------------------------------------------------------------
// 4. Integration
// ---------------------------------------------------------------------------
describe("Business analytics — integration", () => {
  it("routes.ts imports registerOwnerDashboardRoutes", () => {
    const routesSrc = readFile("server/routes.ts");
    expect(routesSrc).toContain('import { registerOwnerDashboardRoutes } from "./routes-owner-dashboard"');
  });

  it("routes.ts calls registerOwnerDashboardRoutes(app)", () => {
    const routesSrc = readFile("server/routes.ts");
    expect(routesSrc).toContain("registerOwnerDashboardRoutes(app)");
  });

  it("business-analytics.ts does not import db", () => {
    const src = readFile("server/business-analytics.ts");
    expect(src).not.toContain('from "./db"');
    expect(src).not.toContain('from "../db"');
  });

  it("routes-owner-dashboard.ts imports from business-analytics", () => {
    const src = readFile("server/routes-owner-dashboard.ts");
    expect(src).toContain('from "./business-analytics"');
  });
});
