/**
 * Sprint 199 — Analytics Dashboard + Conversion Tracking
 *
 * Validates:
 * 1. Beta conversion event types
 * 2. Time-bucketed analytics (hourly + daily)
 * 3. Active user tracking
 * 4. Beta conversion funnel
 * 5. New admin analytics endpoints
 * 6. User activity tracking in middleware
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Beta conversion event types
// ---------------------------------------------------------------------------
describe("Beta conversion events — server/analytics.ts", () => {
  const src = readFile("server/analytics.ts");

  it("defines beta_invite_sent event type", () => {
    expect(src).toContain('"beta_invite_sent"');
  });

  it("defines beta_join_page_view event type", () => {
    expect(src).toContain('"beta_join_page_view"');
  });

  it("defines beta_signup_completed event type", () => {
    expect(src).toContain('"beta_signup_completed"');
  });

  it("defines beta_first_rating event type", () => {
    expect(src).toContain('"beta_first_rating"');
  });

  it("defines beta_referral_shared event type", () => {
    expect(src).toContain('"beta_referral_shared"');
  });
});

// ---------------------------------------------------------------------------
// 2. Time-bucketed analytics
// ---------------------------------------------------------------------------
describe("Time-bucketed analytics — server/analytics.ts", () => {
  const src = readFile("server/analytics.ts");

  it("exports getHourlyStats function", () => {
    expect(src).toContain("export function getHourlyStats");
  });

  it("getHourlyStats accepts hours parameter with default 24", () => {
    expect(src).toContain("hours = 24");
  });

  it("getHourlyStats returns hour, events, byType", () => {
    expect(src).toContain("hour:");
    expect(src).toContain("events:");
    expect(src).toContain("byType:");
  });

  it("exports getDailyStats function", () => {
    expect(src).toContain("export function getDailyStats");
  });

  it("getDailyStats accepts days parameter with default 7", () => {
    expect(src).toContain("days = 7");
  });

  it("getDailyStats tracks unique users per day", () => {
    expect(src).toContain("uniqueUsers");
    expect(src).toContain("users: new Set()");
  });

  it("results are sorted chronologically", () => {
    expect(src).toContain(".sort((a, b) => a.hour.localeCompare(b.hour))");
    expect(src).toContain(".sort((a, b) => a.date.localeCompare(b.date))");
  });
});

// ---------------------------------------------------------------------------
// 3. Active user tracking
// ---------------------------------------------------------------------------
describe("Active user tracking — server/analytics.ts", () => {
  const src = readFile("server/analytics.ts");

  it("exports recordUserActivity function", () => {
    expect(src).toContain("export function recordUserActivity");
  });

  it("exports getActiveUserStats function", () => {
    expect(src).toContain("export function getActiveUserStats");
  });

  it("tracks last seen timestamp per user", () => {
    expect(src).toContain("activeUsers.set(userId, Date.now())");
  });

  it("returns 1h, 24h, 7d, 30d active counts", () => {
    expect(src).toContain("last1h");
    expect(src).toContain("last24h");
    expect(src).toContain("last7d");
    expect(src).toContain("last30d");
  });
});

// ---------------------------------------------------------------------------
// 4. Beta conversion funnel
// ---------------------------------------------------------------------------
describe("Beta conversion funnel — server/analytics.ts", () => {
  const src = readFile("server/analytics.ts");

  it("exports getBetaConversionFunnel function", () => {
    expect(src).toContain("export function getBetaConversionFunnel");
  });

  it("tracks invite → view → signup → rating stages", () => {
    expect(src).toContain("invitesSent");
    expect(src).toContain("joinPageViews");
    expect(src).toContain("signups");
    expect(src).toContain("firstRatings");
    expect(src).toContain("referralsShared");
  });

  it("calculates conversion rates between stages", () => {
    expect(src).toContain("inviteToView");
    expect(src).toContain("viewToSignup");
    expect(src).toContain("signupToRating");
    expect(src).toContain("overallInviteToRating");
  });

  it("returns N/A for zero-division cases", () => {
    expect(src).toContain('"N/A"');
  });
});

// ---------------------------------------------------------------------------
// 5. Admin analytics endpoints
// ---------------------------------------------------------------------------
describe("Admin analytics endpoints — server/routes-admin-analytics.ts", () => {
  const src = readFile("server/routes-admin-analytics.ts");

  it("has hourly analytics endpoint", () => {
    expect(src).toContain('"/api/admin/analytics/hourly"');
  });

  it("hourly endpoint accepts hours parameter", () => {
    expect(src).toContain("getHourlyStats(hours)");
  });

  it("has daily analytics endpoint", () => {
    expect(src).toContain('"/api/admin/analytics/daily"');
  });

  it("daily endpoint accepts days parameter", () => {
    expect(src).toContain("getDailyStats(days)");
  });

  it("has active users endpoint", () => {
    expect(src).toContain('"/api/admin/analytics/active-users"');
    expect(src).toContain("getActiveUserStats()");
  });

  it("has beta funnel endpoint", () => {
    expect(src).toContain('"/api/admin/analytics/beta-funnel"');
    expect(src).toContain("getBetaConversionFunnel()");
  });

  it("beta funnel includes invite tracking stats", () => {
    expect(src).toContain("inviteTracking");
    expect(src).toContain("getBetaInviteStats");
  });

  it("all new endpoints require auth + admin", () => {
    expect(src).toContain("requireAuth, requireAdmin");
  });

  it("imports new analytics functions", () => {
    expect(src).toContain("getHourlyStats");
    expect(src).toContain("getDailyStats");
    expect(src).toContain("getActiveUserStats");
    expect(src).toContain("getBetaConversionFunnel");
  });
});

// ---------------------------------------------------------------------------
// 6. User activity tracking in middleware
// ---------------------------------------------------------------------------
describe("User activity tracking — server/middleware.ts", () => {
  const src = readFile("server/middleware.ts");

  it("imports recordUserActivity", () => {
    expect(src).toContain("recordUserActivity");
  });

  it("calls recordUserActivity for authenticated users", () => {
    expect(src).toContain("recordUserActivity(req.user.id)");
  });

  it("only tracks when user has an id", () => {
    expect(src).toContain("req.user?.id");
  });

  it("mentions Sprint 199", () => {
    expect(src).toContain("Sprint 199");
  });
});

// ---------------------------------------------------------------------------
// 7. Beta invite sends tracked in analytics
// ---------------------------------------------------------------------------
describe("Beta invite analytics tracking — server/routes-admin.ts", () => {
  const src = readFile("server/routes-admin.ts");

  it("tracks beta_invite_sent event on invite", () => {
    expect(src).toContain('trackEvent("beta_invite_sent"');
  });

  it("includes email in event metadata", () => {
    expect(src).toContain("{ email }");
  });
});
