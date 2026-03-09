/**
 * Sprint 217 — Launch Week Metrics + Retention Tracking
 *
 * Validates:
 * 1. Launch metrics endpoint in routes-admin.ts
 * 2. Retention event types in analytics.ts
 * 3. Revenue metrics computation
 * 4. Activation and engagement rates
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. Launch metrics endpoint
// ---------------------------------------------------------------------------
describe("Launch metrics endpoint — routes-admin.ts", () => {
  const src = readFile("server/routes-admin.ts");

  it("registers launch-metrics endpoint", () => {
    expect(src).toContain("/api/admin/analytics/launch-metrics");
  });

  it("requires authentication", () => {
    expect(src).toContain("requireAuth");
    expect(src).toContain("requireAdmin");
  });

  it("accepts days parameter", () => {
    expect(src).toContain("req.query.days");
  });

  it("computes activation rate", () => {
    expect(src).toContain("activationRate");
  });

  it("computes deep engagement rate", () => {
    expect(src).toContain("deepEngagementRate");
  });

  it("computes tier conversion rate", () => {
    expect(src).toContain("tierConversionRate");
  });

  it("tracks revenue metrics", () => {
    expect(src).toContain("challengerEntries");
    expect(src).toContain("dashboardSubs");
    expect(src).toContain("featuredPurchases");
    expect(src).toContain("estimatedMRR");
  });

  it("tracks break-even target", () => {
    expect(src).toContain("breakEvenTarget");
    expect(src).toContain("breakEvenMet");
    expect(src).toContain("247");
  });

  it("includes active users", () => {
    expect(src).toContain("activeUsers");
    expect(src).toContain("getActiveUserStats");
  });

  it("includes beta funnel data", () => {
    expect(src).toContain("betaFunnel");
    expect(src).toContain("getBetaConversionFunnel");
  });

  it("includes daily trend data", () => {
    expect(src).toContain("dailyTrend");
    expect(src).toContain("getDailyStats");
  });

  it("includes generation timestamp", () => {
    expect(src).toContain("generatedAt");
  });
});

// ---------------------------------------------------------------------------
// 2. Retention event types
// ---------------------------------------------------------------------------
describe("Retention event types — analytics.ts", () => {
  const src = readFile("server/analytics.ts");

  it("has retention_day1 event", () => {
    expect(src).toContain("retention_day1");
  });

  it("has retention_day3 event", () => {
    expect(src).toContain("retention_day3");
  });

  it("has retention_day7 event", () => {
    expect(src).toContain("retention_day7");
  });

  it("retains existing funnel events", () => {
    expect(src).toContain("signup_started");
    expect(src).toContain("signup_completed");
    expect(src).toContain("first_rating");
    expect(src).toContain("fifth_rating");
    expect(src).toContain("tier_upgrade");
  });

  it("retains beta events", () => {
    expect(src).toContain("beta_invite_sent");
    expect(src).toContain("beta_join_page_view");
    expect(src).toContain("beta_signup_completed");
    expect(src).toContain("beta_first_rating");
  });
});

// ---------------------------------------------------------------------------
// 3. Revenue computation logic
// ---------------------------------------------------------------------------
describe("Revenue metrics computation", () => {
  const src = readFile("server/routes-admin.ts");

  it("calculates MRR from event counts", () => {
    expect(src).toContain("challengerEntries * 99");
    expect(src).toContain("dashboardSubs * 49");
    expect(src).toContain("featuredPurchases * 199");
  });

  it("formats MRR as dollar amount", () => {
    expect(src).toContain('`$${estimatedMRR}`');
  });

  it("compares against break-even threshold", () => {
    expect(src).toContain("estimatedMRR >= 247");
  });
});

// ---------------------------------------------------------------------------
// 4. Analytics infrastructure verification
// ---------------------------------------------------------------------------
describe("Analytics infrastructure", () => {
  it("server analytics module exists", () => {
    expect(fileExists("server/analytics.ts")).toBe(true);
  });

  it("client analytics module exists", () => {
    expect(fileExists("lib/analytics.ts")).toBe(true);
  });

  it("analytics storage exists", () => {
    expect(fileExists("server/storage/analytics.ts")).toBe(true);
  });

  it("perf monitor exists", () => {
    expect(fileExists("server/perf-monitor.ts")).toBe(true);
  });

  it("error tracking exists", () => {
    expect(fileExists("server/error-tracking.ts")).toBe(true);
  });

  it("admin routes module exists", () => {
    expect(fileExists("server/routes-admin.ts")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. Sprint doc and retro
// ---------------------------------------------------------------------------
describe("Sprint 217 documentation", () => {
  it("sprint doc exists", () => {
    expect(fileExists("docs/sprints/SPRINT-217-LAUNCH-WEEK-METRICS.md")).toBe(true);
  });

  it("retro doc exists", () => {
    expect(fileExists("docs/retros/RETRO-217-LAUNCH-WEEK-METRICS.md")).toBe(true);
  });

  const sprint = readFile("docs/sprints/SPRINT-217-LAUNCH-WEEK-METRICS.md");

  it("sprint doc includes team discussion", () => {
    expect(sprint).toContain("Marcus Chen");
    expect(sprint).toContain("Rachel Wei");
    expect(sprint).toContain("Sarah Nakamura");
    expect(sprint).toContain("Amir Patel");
  });
});
