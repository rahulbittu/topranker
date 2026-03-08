/**
 * Sprint 117 — Accessibility Testing, GDPR Deletion Grace Period, Revenue Analytics
 * P1: Automated accessibility checks, GDPR background deletion, client analytics
 *
 * Owner: Jordan Blake (Compliance), Sarah Nakamura (Lead Engineer), Rachel Wei (CFO)
 */
import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

// ── 1. Accessibility Utility Module ──────────────────────────────────
describe("Accessibility Testing Utility", () => {
  const modulePath = path.resolve(__dirname, "..", "lib/accessibility.ts");

  it("accessibility module exists", () => {
    expect(fs.existsSync(modulePath)).toBe(true);
  });

  it("exports checkAccessibilityLabel function", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("export function checkAccessibilityLabel");
  });

  it("checkAccessibilityLabel accepts component string parameter", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("checkAccessibilityLabel(component: string): boolean");
  });

  it("exports getAccessibilityReport function", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("export function getAccessibilityReport");
  });

  it("getAccessibilityReport returns AccessibilityIssue array", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("getAccessibilityReport(): AccessibilityIssue[]");
  });

  it("exports clearAccessibilityIssues function", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("export function clearAccessibilityIssues");
  });

  it("exports AccessibilityIssue interface", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("export interface AccessibilityIssue");
  });

  it("AccessibilityIssue has component field", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("component: string");
  });

  it("AccessibilityIssue has severity levels", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain('"error" | "warning" | "info"');
  });

  it("AccessibilityIssue has timestamp", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("timestamp: number");
  });

  it("exports checkAccessibilityRole function", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("export function checkAccessibilityRole");
  });

  it("exports runAccessibilityAudit function", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("export function runAccessibilityAudit");
  });

  it("audit checks ErrorBoundary component", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain('"ErrorBoundary"');
  });

  it("audit checks CookieConsent component", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain('"CookieConsent"');
  });

  it("audit checks NavigationRow component", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain('"NavigationRow"');
  });

  it("audit checks SettingRow component", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain('"SettingRow"');
  });
});

// ── 2. GDPR Deletion Grace Period Module ────────────────────────────
describe("GDPR Deletion Grace Period Module", () => {
  const modulePath = path.resolve(__dirname, "..", "server/gdpr.ts");

  it("gdpr module exists", () => {
    expect(fs.existsSync(modulePath)).toBe(true);
  });

  it("exports scheduleDeletion function", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("export function scheduleDeletion");
  });

  it("scheduleDeletion accepts userId and gracePeriodDays", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("scheduleDeletion(userId: string, gracePeriodDays: number): DeletionRequest");
  });

  it("exports cancelDeletion function", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("export function cancelDeletion");
  });

  it("cancelDeletion returns boolean", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("cancelDeletion(userId: string): boolean");
  });

  it("exports getDeletionStatus function", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("export function getDeletionStatus");
  });

  it("getDeletionStatus returns DeletionRequest or null", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("getDeletionStatus(userId: string): DeletionRequest | null");
  });

  it("exports processExpiredDeletions function", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("export function processExpiredDeletions");
  });

  it("processExpiredDeletions returns string array of user IDs", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("processExpiredDeletions(): string[]");
  });

  it("exports DeletionRequest interface", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("export interface DeletionRequest");
  });

  it("DeletionRequest has userId field", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("userId: string");
  });

  it("DeletionRequest has scheduledAt field", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("scheduledAt: Date");
  });

  it("DeletionRequest has deleteAt field", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("deleteAt: Date");
  });

  it("DeletionRequest has status with pending/cancelled/completed", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain('"pending" | "cancelled" | "completed"');
  });

  it("cancelDeletion only cancels pending requests", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain('request.status !== "pending"');
  });

  it("processExpiredDeletions marks completed requests", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain('request.status = "completed"');
  });

  it("uses in-memory Map storage", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("new Map<string, DeletionRequest>()");
  });

  it("exports clearDeletionRequests for testing", () => {
    const content = fs.readFileSync(modulePath, "utf-8");
    expect(content).toContain("export function clearDeletionRequests");
  });
});

// ── 3. GDPR Deletion API Endpoints ──────────────────────────────────
describe("GDPR Deletion API Endpoints", () => {
  const routesPath = path.resolve(__dirname, "..", "server/routes.ts");

  it("routes.ts imports scheduleDeletion from gdpr", () => {
    const content = fs.readFileSync(routesPath, "utf-8");
    expect(content).toContain("import { scheduleDeletion, getDeletionStatus } from");
  });

  it("POST /api/account/schedule-deletion endpoint exists", () => {
    const content = fs.readFileSync(routesPath, "utf-8");
    expect(content).toContain('"/api/account/schedule-deletion"');
  });

  it("schedule-deletion uses requireAuth middleware", () => {
    const content = fs.readFileSync(routesPath, "utf-8");
    expect(content).toContain('"/api/account/schedule-deletion", requireAuth');
  });

  it("schedule-deletion calls scheduleDeletion with 30 day grace period", () => {
    const content = fs.readFileSync(routesPath, "utf-8");
    expect(content).toContain("scheduleDeletion(userId, 30)");
  });

  it("GET /api/account/deletion-status endpoint exists", () => {
    const content = fs.readFileSync(routesPath, "utf-8");
    expect(content).toContain('"/api/account/deletion-status"');
  });

  it("deletion-status uses requireAuth middleware", () => {
    const content = fs.readFileSync(routesPath, "utf-8");
    expect(content).toContain('"/api/account/deletion-status", requireAuth');
  });

  it("deletion-status calls getDeletionStatus", () => {
    const content = fs.readFileSync(routesPath, "utf-8");
    expect(content).toContain("getDeletionStatus(userId)");
  });

  it("deletion-status returns hasPendingDeletion flag", () => {
    const content = fs.readFileSync(routesPath, "utf-8");
    expect(content).toContain("hasPendingDeletion");
  });

  it("schedule-deletion logs GDPR deletion event", () => {
    const content = fs.readFileSync(routesPath, "utf-8");
    expect(content).toContain('log.tag("GDPR").info');
  });

  it("schedule-deletion returns gracePeriodDays in response", () => {
    const content = fs.readFileSync(routesPath, "utf-8");
    expect(content).toContain("gracePeriodDays: 30");
  });
});

// ── 4. Client Analytics Revenue Events ──────────────────────────────
describe("Client Analytics Revenue Events", () => {
  const analyticsPath = path.resolve(__dirname, "..", "lib/analytics.ts");

  it("analytics module exists", () => {
    expect(fs.existsSync(analyticsPath)).toBe(true);
  });

  it("Analytics object contains dashboardProViewed method", () => {
    const content = fs.readFileSync(analyticsPath, "utf-8");
    expect(content).toContain("dashboardProViewed");
  });

  it("dashboardProViewed accepts slug parameter", () => {
    const content = fs.readFileSync(analyticsPath, "utf-8");
    expect(content).toContain("dashboardProViewed: (slug: string)");
  });

  it("dashboardProViewed tracks with pro tier", () => {
    const content = fs.readFileSync(analyticsPath, "utf-8");
    expect(content).toContain('tier: "pro"');
  });

  it("Analytics object contains featuredViewed method", () => {
    const content = fs.readFileSync(analyticsPath, "utf-8");
    expect(content).toContain("featuredViewed");
  });

  it("featuredViewed accepts slug parameter", () => {
    const content = fs.readFileSync(analyticsPath, "utf-8");
    expect(content).toContain("featuredViewed: (slug: string)");
  });

  it("featuredViewed tracks with featured_section source", () => {
    const content = fs.readFileSync(analyticsPath, "utf-8");
    expect(content).toContain('source: "featured_section"');
  });

  it("Analytics object still has dashboardUpgradeTap", () => {
    const content = fs.readFileSync(analyticsPath, "utf-8");
    expect(content).toContain("dashboardUpgradeTap");
  });

  it("Analytics object still has challengerEnterStart", () => {
    const content = fs.readFileSync(analyticsPath, "utf-8");
    expect(content).toContain("challengerEnterStart");
  });
});

// ── 5. Component Accessibility Verification ─────────────────────────
describe("Component Accessibility Verification", () => {
  it("ErrorBoundary has accessibilityRole on retry button", () => {
    const filePath = path.resolve(__dirname, "..", "components/ErrorBoundary.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain('accessibilityRole="button"');
  });

  it("ErrorBoundary has accessibilityLabel on retry button", () => {
    const filePath = path.resolve(__dirname, "..", "components/ErrorBoundary.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain('accessibilityLabel="Try again"');
  });

  it("CookieConsent has accessibilityRole on buttons", () => {
    const filePath = path.resolve(__dirname, "..", "components/CookieConsent.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain('accessibilityRole="button"');
  });

  it("CookieConsent accept button has accessibilityLabel", () => {
    const filePath = path.resolve(__dirname, "..", "components/CookieConsent.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain('accessibilityLabel="Accept all cookies"');
  });

  it("CookieConsent decline button has accessibilityLabel", () => {
    const filePath = path.resolve(__dirname, "..", "components/CookieConsent.tsx");
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain('accessibilityLabel="Accept essential cookies only"');
  });
});
