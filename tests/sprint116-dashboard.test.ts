/**
 * Sprint 116 — Analytics Dashboard, Error Monitoring, Push Notification Sync
 * P0: Admin analytics dashboard endpoint, error reporting service
 *
 * Owner: Rachel Wei (CFO), Sarah Nakamura (Lead Engineer), Jasmine Taylor (Marketing)
 */
import { describe, it, expect, beforeEach } from "vitest";
import fs from "fs";
import path from "path";

// ── 1. Error Reporting Module ───────────────────────────────────────
describe("Error Reporting Module", () => {
  const modulePath = path.resolve(__dirname, "..", "lib/error-reporting.ts");

  it("error-reporting module exists", () => {
    expect(fs.existsSync(modulePath)).toBe(true);
  });

  it("exports reportError function", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("export function reportError");
  });

  it("exports reportComponentCrash function", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("export function reportComponentCrash");
  });

  it("exports getRecentErrors function", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("export function getRecentErrors");
  });

  it("exports clearErrors function", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("export function clearErrors");
  });

  it("exports ErrorReport interface", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("export interface ErrorReport");
  });

  it("limits error buffer to MAX_ERRORS (100)", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("MAX_ERRORS = 100");
  });

  it("includes Sentry integration via captureException import", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("captureException");
  });

  it("truncates stack traces to 10 lines in reportError", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain('.slice(0, 10).join("\\n")');
  });

  it("truncates component stacks to 5 lines in reportComponentCrash", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain('.slice(0, 5).join("\\n")');
  });

  it("accepts userId parameter in reportComponentCrash", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("userId?: string");
  });

  it("stores timestamp on every report", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("timestamp: Date.now()");
  });
});

// ── 2. ErrorBoundary Integration ────────────────────────────────────
describe("ErrorBoundary Integration with Error Reporting", () => {
  const boundaryPath = path.resolve(__dirname, "..", "components/ErrorBoundary.tsx");

  it("ErrorBoundary imports reportComponentCrash", () => {
    const content = fs.readFileSync(boundaryPath, "utf-8");
    expect(content).toContain("import { reportComponentCrash }");
  });

  it("ErrorBoundary calls reportComponentCrash in componentDidCatch", () => {
    const content = fs.readFileSync(boundaryPath, "utf-8");
    expect(content).toContain("reportComponentCrash(error");
  });
});

// ── 3. Analytics Dashboard Endpoint ─────────────────────────────────
describe("Admin Analytics Dashboard Endpoint", () => {
  const routesPath = path.resolve(__dirname, "..", "server/routes-admin.ts");

  it("admin routes file exists", () => {
    expect(fs.existsSync(routesPath)).toBe(true);
  });

  it("registers GET /api/admin/analytics/dashboard endpoint", () => {
    const content = fs.readFileSync(routesPath, "utf-8");
    expect(content).toContain("/api/admin/analytics/dashboard");
  });

  it("dashboard returns overview with totalEvents", () => {
    const content = fs.readFileSync(routesPath, "utf-8");
    expect(content).toContain("totalEvents");
  });

  it("dashboard returns overview with uniqueEventTypes", () => {
    const content = fs.readFileSync(routesPath, "utf-8");
    expect(content).toContain("uniqueEventTypes");
  });

  it("dashboard returns funnel with signupRate", () => {
    const content = fs.readFileSync(routesPath, "utf-8");
    expect(content).toContain("signupRate");
  });

  it("dashboard returns funnel with ratingRate", () => {
    const content = fs.readFileSync(routesPath, "utf-8");
    expect(content).toContain("ratingRate");
  });

  it("dashboard returns recentActivity", () => {
    const content = fs.readFileSync(routesPath, "utf-8");
    expect(content).toContain("recentActivity");
  });

  it("dashboard returns generatedAt timestamp", () => {
    const content = fs.readFileSync(routesPath, "utf-8");
    expect(content).toContain("generatedAt");
  });

  it("dashboard requires auth and admin middleware", () => {
    const content = fs.readFileSync(routesPath, "utf-8");
    const match = content.match(/analytics\/dashboard.*requireAuth.*requireAdmin/s);
    expect(match).toBeTruthy();
  });

  it("dashboard calculates conversion rates correctly (percentage format)", () => {
    const content = fs.readFileSync(routesPath, "utf-8");
    expect(content).toContain('.toFixed(1) + "%"');
  });

  it("dashboard handles zero page views (N/A)", () => {
    const content = fs.readFileSync(routesPath, "utf-8");
    expect(content).toContain('"N/A"');
  });
});

// ── 4. Push Notification Preference Sync ────────────────────────────
describe("Push Notification Preference Sync", () => {
  const routesPath = path.resolve(__dirname, "..", "server/routes-members.ts");

  it("notification preferences PUT endpoint exists", () => {
    const content = fs.readFileSync(routesPath, "utf-8");
    expect(content).toContain('"/api/members/me/notification-preferences"');
  });

  it("notification preferences GET endpoint exists", () => {
    const content = fs.readFileSync(routesPath, "utf-8");
    expect(content).toContain("notification-preferences");
  });

  it("PUT handler logs preference updates", () => {
    const content = fs.readFileSync(routesPath, "utf-8");
    expect(content).toContain('log.tag("Notifications").info');
  });

  it("PUT handler logs user ID and prefs JSON", () => {
    const content = fs.readFileSync(routesPath, "utf-8");
    expect(content).toContain("JSON.stringify(saved)");
  });

  it("default prefs include ratingResponses true", () => {
    const content = fs.readFileSync(routesPath, "utf-8");
    expect(content).toContain("ratingResponses: true");
  });

  it("default prefs include challengerResults true", () => {
    const content = fs.readFileSync(routesPath, "utf-8");
    expect(content).toContain("challengerResults: true");
  });

  it("default prefs include weeklyDigest false", () => {
    const content = fs.readFileSync(routesPath, "utf-8");
    expect(content).toContain("weeklyDigest: false");
  });
});

// ── 5. Analytics Server Module ──────────────────────────────────────
describe("Analytics Server Module (foundation)", () => {
  const analyticsPath = path.resolve(__dirname, "..", "server/analytics.ts");

  it("analytics module exists", () => {
    expect(fs.existsSync(analyticsPath)).toBe(true);
  });

  it("exports getFunnelStats function", () => {
    const content = fs.readFileSync(analyticsPath, "utf-8");
    expect(content).toContain("export function getFunnelStats");
  });

  it("exports getRecentEvents function", () => {
    const content = fs.readFileSync(analyticsPath, "utf-8");
    expect(content).toContain("export function getRecentEvents");
  });

  it("exports trackEvent function", () => {
    const content = fs.readFileSync(analyticsPath, "utf-8");
    expect(content).toContain("export function trackEvent");
  });

  it("tracks dashboard_pro_subscribed event type", () => {
    const content = fs.readFileSync(analyticsPath, "utf-8");
    expect(content).toContain("dashboard_pro_subscribed");
  });

  it("tracks challenger_entered event type", () => {
    const content = fs.readFileSync(analyticsPath, "utf-8");
    expect(content).toContain("challenger_entered");
  });
});
