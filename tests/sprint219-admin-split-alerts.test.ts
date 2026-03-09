/**
 * Sprint 219 — Admin Route Split + Alert Endpoints
 *
 * Validates:
 * 1. Admin analytics routes extraction
 * 2. Main admin routes file size reduction
 * 3. Alert management endpoints
 * 4. Route registration pattern
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. Admin analytics routes extraction
// ---------------------------------------------------------------------------
describe("Admin analytics routes — server/routes-admin-analytics.ts", () => {
  it("extracted file exists", () => {
    expect(fileExists("server/routes-admin-analytics.ts")).toBe(true);
  });

  const src = readFile("server/routes-admin-analytics.ts");

  it("exports registerAdminAnalyticsRoutes", () => {
    expect(src).toContain("registerAdminAnalyticsRoutes");
  });

  it("contains analytics dashboard endpoint", () => {
    expect(src).toContain("/api/admin/analytics/dashboard");
  });

  it("contains hourly endpoint", () => {
    expect(src).toContain("/api/admin/analytics/hourly");
  });

  it("contains daily endpoint", () => {
    expect(src).toContain("/api/admin/analytics/daily");
  });

  it("contains active-users endpoint", () => {
    expect(src).toContain("/api/admin/analytics/active-users");
  });

  it("contains beta-funnel endpoint", () => {
    expect(src).toContain("/api/admin/analytics/beta-funnel");
  });

  it("contains export endpoint", () => {
    expect(src).toContain("/api/admin/analytics/export");
  });

  it("contains launch-metrics endpoint", () => {
    expect(src).toContain("/api/admin/analytics/launch-metrics");
  });

  it("contains retention-policy endpoint", () => {
    expect(src).toContain("/api/admin/analytics/retention-policy");
  });

  it("requires auth on all endpoints", () => {
    expect(src).toContain("requireAuth");
    expect(src).toContain("requireAdmin");
  });
});

// ---------------------------------------------------------------------------
// 2. Main admin routes size reduction
// ---------------------------------------------------------------------------
describe("Main admin routes — server/routes-admin.ts", () => {
  const src = readFile("server/routes-admin.ts");
  const lines = src.split("\n").length;

  it("file is under 700 LOC threshold", () => {
    expect(lines).toBeLessThan(700);
  });

  it("imports and registers analytics routes", () => {
    expect(src).toContain("registerAdminAnalyticsRoutes");
  });

  it("retains non-analytics admin endpoints", () => {
    expect(src).toContain("/api/admin/claims");
    expect(src).toContain("/api/admin/perf");
    expect(src).toContain("/api/admin/errors");
    expect(src).toContain("/api/admin/feedback");
  });

  it("retains beta invite endpoints", () => {
    expect(src).toContain("/api/admin/beta-invite");
  });
});

// ---------------------------------------------------------------------------
// 3. Alert management endpoints
// ---------------------------------------------------------------------------
describe("Alert endpoints — server/routes-admin.ts", () => {
  const src = readFile("server/routes-admin.ts");

  it("has GET alerts endpoint", () => {
    expect(src).toContain("/api/admin/alerts");
    expect(src).toContain("getRecentAlerts");
    expect(src).toContain("getAlertStats");
    expect(src).toContain("getAlertRules");
  });

  it("has acknowledge endpoint", () => {
    expect(src).toContain("/api/admin/alerts/:id/acknowledge");
    expect(src).toContain("acknowledgeAlert");
  });

  it("acknowledge returns 404 for unknown alerts", () => {
    expect(src).toContain("Alert not found");
  });

  it("imports alerting module", () => {
    expect(src).toContain('from "./alerting"');
  });
});

// ---------------------------------------------------------------------------
// 4. Module structure verification
// ---------------------------------------------------------------------------
describe("Admin route module structure", () => {
  it("main admin routes exist", () => {
    expect(fileExists("server/routes-admin.ts")).toBe(true);
  });

  it("analytics admin routes exist", () => {
    expect(fileExists("server/routes-admin-analytics.ts")).toBe(true);
  });

  it("alerting module exists", () => {
    expect(fileExists("server/alerting.ts")).toBe(true);
  });

  it("main routes file is smaller than analytics file + main combined", () => {
    const main = readFile("server/routes-admin.ts").split("\n").length;
    const analytics = readFile("server/routes-admin-analytics.ts").split("\n").length;
    expect(main).toBeLessThan(main + analytics); // Sanity
    expect(main).toBeLessThan(600); // Under safe threshold
  });
});
