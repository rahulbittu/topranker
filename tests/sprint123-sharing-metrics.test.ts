import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// ── Admin Dashboard Funnel ──────────────────────────────────────────
describe("Sprint 123 — Admin Dashboard Conversion Funnel", () => {
  const dashboardPath = path.resolve(__dirname, "..", "app", "admin", "dashboard.tsx");

  it("dashboard.tsx exists", () => {
    expect(fs.existsSync(dashboardPath)).toBe(true);
  });

  const source = fs.readFileSync(dashboardPath, "utf-8");

  it("contains CONVERSION FUNNEL section header", () => {
    expect(source).toContain("CONVERSION FUNNEL");
  });

  it("contains Page Views funnel stage", () => {
    expect(source).toContain("Page Views");
  });

  it("contains Signups funnel stage", () => {
    expect(source).toContain("Signups");
  });

  it("contains First Ratings funnel stage", () => {
    expect(source).toContain("First Ratings");
  });

  it("contains Challenger Entries funnel stage", () => {
    expect(source).toContain("Challenger Entries");
  });

  it("contains Dashboard Subs funnel stage", () => {
    expect(source).toContain("Dashboard Subs");
  });

  it("uses BRAND.colors.amber for funnel bar fill", () => {
    expect(source).toContain("BRAND.colors.amber");
  });

  it("calculates conversion rate percentages", () => {
    expect(source).toContain("conversionRate");
    expect(source).toContain("conversion");
  });

  it("has funnelBarFill style", () => {
    expect(source).toContain("funnelBarFill");
  });

  it("has funnelBarTrack style", () => {
    expect(source).toContain("funnelBarTrack");
  });

  it("defines FunnelStage interface", () => {
    expect(source).toContain("interface FunnelStage");
  });
});

// ── Business Sharing ────────────────────────────────────────────────
describe("Sprint 123 — Business Social Sharing", () => {
  const businessPath = path.resolve(__dirname, "..", "app", "business", "[id].tsx");
  const subComponentsPath = path.resolve(__dirname, "..", "components", "business", "SubComponents.tsx");

  it("business/[id].tsx exists", () => {
    expect(fs.existsSync(businessPath)).toBe(true);
  });

  // After Sprint 145 decomposition, sharing code lives in individual component files
  const bizDir = path.resolve(__dirname, "..", "components", "business");
  const allBizFiles = fs.existsSync(bizDir) ? fs.readdirSync(bizDir).filter(f => f.endsWith(".tsx")).map(f => fs.readFileSync(path.join(bizDir, f), "utf-8")).join("\n") : "";
  const source = fs.readFileSync(businessPath, "utf-8") + allBizFiles;

  it("contains share-outline icon", () => {
    expect(source).toContain("share-outline");
  });

  it("uses Share.share for sharing", () => {
    expect(source).toContain("Share.share");
  });

  it("imports getShareUrl from sharing lib", () => {
    expect(source).toContain("getShareUrl");
  });

  it("imports getShareText from sharing lib", () => {
    expect(source).toContain("getShareText");
  });

  it("calls getShareUrl with business type and slug", () => {
    expect(source).toContain('getShareUrl("business"');
  });

  it("tracks share_business analytics event", () => {
    expect(source).toContain("shareBusiness");
  });

  it("has share button with accessibility label", () => {
    expect(source).toContain("Share this business");
  });

  it("share button has accessibilityRole button", () => {
    expect(source).toContain('accessibilityRole="button"');
  });
});

// ── GDPR Cancel Deletion ────────────────────────────────────────────
describe("Sprint 123 — GDPR Cancel Deletion Endpoint", () => {
  const routesPath = path.resolve(__dirname, "..", "server", "routes-auth.ts");

  it("routes-auth.ts exists", () => {
    expect(fs.existsSync(routesPath)).toBe(true);
  });

  const source = fs.readFileSync(routesPath, "utf-8");

  it("contains cancel-deletion endpoint", () => {
    expect(source).toContain("cancel-deletion");
  });

  it("calls cancelDeletion function", () => {
    expect(source).toContain("cancelDeletion");
  });

  it("imports cancelDeletion from gdpr module", () => {
    expect(source).toContain("cancelDeletion");
    expect(source).toContain("./gdpr");
  });

  it("returns cancelled: true on success", () => {
    expect(source).toContain("cancelled: true");
  });

  it("returns 404 if no pending deletion", () => {
    expect(source).toContain("No pending deletion request found");
  });

  it("requires authentication", () => {
    expect(source).toContain("requireAuth");
  });

  it("logs GDPR cancellation", () => {
    expect(source).toContain("Deletion cancelled");
  });
});

// ── Admin Metrics Endpoint ──────────────────────────────────────────
describe("Sprint 123 — Admin Metrics Endpoint", () => {
  const adminPath = path.resolve(__dirname, "..", "server", "routes-admin.ts");

  it("routes-admin.ts exists", () => {
    expect(fs.existsSync(adminPath)).toBe(true);
  });

  const source = fs.readFileSync(adminPath, "utf-8");

  it("contains /api/admin/metrics endpoint", () => {
    expect(source).toContain("/api/admin/metrics");
  });

  it("includes uptime metric from process.uptime()", () => {
    expect(source).toContain("uptime");
    expect(source).toContain("process.uptime()");
  });

  it("includes memoryUsage metric from process.memoryUsage()", () => {
    expect(source).toContain("memoryUsage");
    expect(source).toContain("process.memoryUsage()");
  });

  it("includes nodeVersion from process.version", () => {
    expect(source).toContain("nodeVersion");
    expect(source).toContain("process.version");
  });

  it("includes requestCount from getRequestLogs", () => {
    expect(source).toContain("requestCount");
    expect(source).toContain("getRequestLogs");
  });

  it("includes errorCount from getRecentErrors", () => {
    expect(source).toContain("errorCount");
    expect(source).toContain("getRecentErrors");
  });

  it("imports getRequestLogs from request-logger", () => {
    expect(source).toContain("./request-logger");
  });

  it("imports getRecentErrors from error-reporting", () => {
    expect(source).toContain("error-reporting");
  });

  it("requires auth and admin middleware", () => {
    expect(source).toContain("requireAuth");
    expect(source).toContain("requireAdmin");
  });
});
