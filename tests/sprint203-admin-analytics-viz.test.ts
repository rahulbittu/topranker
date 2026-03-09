/**
 * Sprint 203 — Admin Analytics Visualization + Data Retention
 *
 * Validates:
 * 1. Dashboard beta funnel UI components
 * 2. Dashboard active users UI section
 * 3. Beta funnel hook + API endpoint
 * 4. Active users hook + API endpoint
 * 5. Data retention policy + purge endpoint
 * 6. Admin route registration
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Dashboard beta funnel visualization
// ---------------------------------------------------------------------------
describe("Beta funnel visualization — app/admin/dashboard.tsx", () => {
  const src = readFile("app/admin/dashboard.tsx");

  it("defines BetaFunnelData interface", () => {
    expect(src).toContain("interface BetaFunnelData");
  });

  it("tracks invitesSent in beta funnel", () => {
    expect(src).toContain("invitesSent");
  });

  it("tracks joinPageViews in beta funnel", () => {
    expect(src).toContain("joinPageViews");
  });

  it("tracks signups in beta funnel", () => {
    expect(src).toContain("signups: number");
  });

  it("tracks firstRatings in beta funnel", () => {
    expect(src).toContain("firstRatings");
  });

  it("tracks referralsShared in beta funnel", () => {
    expect(src).toContain("referralsShared");
  });

  it("includes conversion rate fields", () => {
    expect(src).toContain("inviteToView");
    expect(src).toContain("viewToSignup");
    expect(src).toContain("signupToRating");
    expect(src).toContain("overallInviteToRating");
  });

  it("renders BETA CONVERSION FUNNEL header", () => {
    expect(src).toContain("BETA CONVERSION FUNNEL");
  });

  it("shows invite tracking stats", () => {
    expect(src).toContain("inviteTracking.joined");
    expect(src).toContain("inviteTracking.total");
  });

  it("renders funnel bar chart", () => {
    expect(src).toContain("funnelBarTrack");
    expect(src).toContain("funnelBarFill");
  });
});

// ---------------------------------------------------------------------------
// 2. Dashboard active users section
// ---------------------------------------------------------------------------
describe("Active users section — app/admin/dashboard.tsx", () => {
  const src = readFile("app/admin/dashboard.tsx");

  it("defines ActiveUserData interface", () => {
    expect(src).toContain("interface ActiveUserData");
  });

  it("tracks last1h active users", () => {
    expect(src).toContain("last1h");
  });

  it("tracks last24h active users", () => {
    expect(src).toContain("last24h");
  });

  it("tracks last7d active users", () => {
    expect(src).toContain("last7d");
  });

  it("tracks last30d active users", () => {
    expect(src).toContain("last30d");
  });

  it("renders Active Users title", () => {
    expect(src).toContain("Active Users");
  });

  it("shows time-window labels", () => {
    expect(src).toContain("Last Hour");
    expect(src).toContain("Last 24h");
    expect(src).toContain("Last 7d");
    expect(src).toContain("Last 30d");
  });
});

// ---------------------------------------------------------------------------
// 3. Beta funnel hook
// ---------------------------------------------------------------------------
describe("useBetaFunnel hook — app/admin/dashboard.tsx", () => {
  const src = readFile("app/admin/dashboard.tsx");

  it("defines useBetaFunnel function", () => {
    expect(src).toContain("function useBetaFunnel()");
  });

  it("fetches from beta-funnel endpoint", () => {
    expect(src).toContain("/api/admin/analytics/beta-funnel");
  });

  it("uses betaFunnel in component", () => {
    expect(src).toContain("const betaFunnel = useBetaFunnel()");
  });
});

// ---------------------------------------------------------------------------
// 4. Active users hook
// ---------------------------------------------------------------------------
describe("useActiveUsers hook — app/admin/dashboard.tsx", () => {
  const src = readFile("app/admin/dashboard.tsx");

  it("defines useActiveUsers function", () => {
    expect(src).toContain("function useActiveUsers()");
  });

  it("fetches from active-users endpoint", () => {
    expect(src).toContain("/api/admin/analytics/active-users");
  });

  it("uses activeUsers in component", () => {
    expect(src).toContain("const activeUsers = useActiveUsers()");
  });
});

// ---------------------------------------------------------------------------
// 5. Data retention policy
// ---------------------------------------------------------------------------
describe("Data retention — server/storage/analytics.ts", () => {
  const src = readFile("server/storage/analytics.ts");

  it("exports purgeOldAnalyticsEvents function", () => {
    expect(src).toContain("export async function purgeOldAnalyticsEvents");
  });

  it("uses 90 day default retention", () => {
    expect(src).toContain("retentionDays = 90");
  });

  it("exports DATA_RETENTION_POLICY constant", () => {
    expect(src).toContain("export const DATA_RETENTION_POLICY");
  });

  it("defines analytics events retention at 90 days", () => {
    expect(src).toContain("retentionDays: 90");
  });

  it("defines beta invites retention at 365 days", () => {
    expect(src).toContain("retentionDays: 365");
  });

  it("uses lt operator for cutoff comparison", () => {
    expect(src).toContain("lt(analyticsEvents.createdAt, cutoff)");
  });

  it("calculates cutoff date from retentionDays", () => {
    expect(src).toContain("retentionDays * 24 * 60 * 60 * 1000");
  });
});

// ---------------------------------------------------------------------------
// 6. Admin route registration for retention
// ---------------------------------------------------------------------------
describe("Retention admin routes — server/routes-admin.ts", () => {
  const src = readFile("server/routes-admin.ts");

  it("registers POST purge endpoint", () => {
    expect(src).toContain("/api/admin/analytics/purge");
  });

  it("registers GET retention-policy endpoint", () => {
    expect(src).toContain("/api/admin/analytics/retention-policy");
  });

  it("imports purgeOldAnalyticsEvents in purge handler", () => {
    expect(src).toContain("purgeOldAnalyticsEvents");
  });

  it("imports DATA_RETENTION_POLICY", () => {
    expect(src).toContain("DATA_RETENTION_POLICY");
  });

  it("enforces minimum 30-day retention", () => {
    expect(src).toContain("Math.max(30,");
  });

  it("purge endpoint requires admin auth", () => {
    expect(src).toContain('"/api/admin/analytics/purge", requireAuth, requireAdmin');
  });
});

// ---------------------------------------------------------------------------
// 7. Dashboard styles completeness
// ---------------------------------------------------------------------------
describe("Dashboard styles — app/admin/dashboard.tsx", () => {
  const src = readFile("app/admin/dashboard.tsx");

  it("has betaInviteStats style", () => {
    expect(src).toContain("betaInviteStats:");
  });

  it("has betaInviteLabel style", () => {
    expect(src).toContain("betaInviteLabel:");
  });

  it("has funnelSection style", () => {
    expect(src).toContain("funnelSection:");
  });

  it("has funnelBarTrack style", () => {
    expect(src).toContain("funnelBarTrack:");
  });

  it("has funnelBarFill style", () => {
    expect(src).toContain("funnelBarFill:");
  });
});
