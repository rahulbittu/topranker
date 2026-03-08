/**
 * Sprint 115 — Revenue Analytics, Dark Mode Migration, Error Monitoring Prep
 * SLT Meeting Sprint: client-side analytics, theme migration, structured logging
 *
 * Owner: Sarah Nakamura (Lead Engineer), Rachel Wei (CFO)
 */
import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

// ── 1. Analytics Convenience Functions ─────────────────────────────
describe("Analytics Convenience Functions", () => {
  const analyticsPath = path.resolve(__dirname, "..", "lib/analytics.ts");

  it("analytics module exists", () => {
    expect(fs.existsSync(analyticsPath)).toBe(true);
  });

  it("exports Analytics object with convenience methods", () => {
    const content = fs.readFileSync(analyticsPath, "utf-8");
    expect(content).toContain("export const Analytics");
  });

  it("has dashboardUpgradeTap convenience function", () => {
    const content = fs.readFileSync(analyticsPath, "utf-8");
    expect(content).toContain("dashboardUpgradeTap");
  });

  it("has challengerEnterStart convenience function", () => {
    const content = fs.readFileSync(analyticsPath, "utf-8");
    expect(content).toContain("challengerEnterStart");
  });

  it("has viewBusiness convenience function", () => {
    const content = fs.readFileSync(analyticsPath, "utf-8");
    expect(content).toContain("viewBusiness");
  });

  it("defines dashboard_upgrade_tap event type", () => {
    const content = fs.readFileSync(analyticsPath, "utf-8");
    expect(content).toContain("dashboard_upgrade_tap");
  });

  it("defines featured_placement_tap event type", () => {
    const content = fs.readFileSync(analyticsPath, "utf-8");
    expect(content).toContain("featured_placement_tap");
  });

  it("defines dashboard_view event type", () => {
    const content = fs.readFileSync(analyticsPath, "utf-8");
    expect(content).toContain("dashboard_view");
  });

  it("track function catches errors gracefully", () => {
    const content = fs.readFileSync(analyticsPath, "utf-8");
    expect(content).toContain("catch");
    expect(content).toContain("Analytics should never crash the app");
  });
});

// ── 2. Revenue Analytics Integration in Business Detail ────────────
describe("Business Detail Revenue Tracking", () => {
  const businessPath = path.resolve(__dirname, "..", "app/business/[id].tsx");

  it("business detail imports Analytics", () => {
    const content = fs.readFileSync(businessPath, "utf-8");
    expect(content).toContain('import { Analytics } from "@/lib/analytics"');
  });

  it("tracks view_business on load", () => {
    const content = fs.readFileSync(businessPath, "utf-8");
    expect(content).toContain("Analytics.viewBusiness");
  });

  it("tracks dashboardUpgradeTap on claim button", () => {
    const content = fs.readFileSync(businessPath, "utf-8");
    expect(content).toContain("Analytics.dashboardUpgradeTap");
  });
});

// ── 3. ErrorBoundary Structured Logging ────────────────────────────
describe("ErrorBoundary Structured Logging", () => {
  const errorBoundaryPath = path.resolve(__dirname, "..", "components/ErrorBoundary.tsx");

  it("ErrorBoundary exists", () => {
    expect(fs.existsSync(errorBoundaryPath)).toBe(true);
  });

  it("uses structured error logging format", () => {
    const content = fs.readFileSync(errorBoundaryPath, "utf-8");
    expect(content).toContain("[ErrorBoundary] Component crash:");
  });

  it("logs error.message", () => {
    const content = fs.readFileSync(errorBoundaryPath, "utf-8");
    expect(content).toContain("error: error.message");
  });

  it("truncates stack to 5 lines", () => {
    const content = fs.readFileSync(errorBoundaryPath, "utf-8");
    expect(content).toContain('error.stack?.split("\\n").slice(0, 5)');
  });

  it("truncates componentStack to 5 lines", () => {
    const content = fs.readFileSync(errorBoundaryPath, "utf-8");
    expect(content).toContain('errorInfo.componentStack?.split("\\n").slice(0, 5)');
  });

  it("still calls onError prop callback", () => {
    const content = fs.readFileSync(errorBoundaryPath, "utf-8");
    expect(content).toContain("this.props.onError?.(error, errorInfo)");
  });
});

// ── 4. Dark Mode Migration — Sprint 115 Components ────────────────
describe("Dark Mode Migration — Sprint 115", () => {
  it("CookieConsent imports useThemeColors", () => {
    const content = fs.readFileSync(
      path.resolve(__dirname, "..", "components/CookieConsent.tsx"),
      "utf-8"
    );
    expect(content).toContain("useThemeColors");
  });

  it("CookieConsent uses themeColors for container", () => {
    const content = fs.readFileSync(
      path.resolve(__dirname, "..", "components/CookieConsent.tsx"),
      "utf-8"
    );
    expect(content).toContain("themeColors");
  });

  it("Skeleton imports useThemeColors", () => {
    const content = fs.readFileSync(
      path.resolve(__dirname, "..", "components/Skeleton.tsx"),
      "utf-8"
    );
    expect(content).toContain("useThemeColors");
  });

  it("LeaderboardSkeleton uses themeColors", () => {
    const content = fs.readFileSync(
      path.resolve(__dirname, "..", "components/Skeleton.tsx"),
      "utf-8"
    );
    expect(content).toContain("themeColors.background");
  });

  it("Settings imports useThemeColors", () => {
    const content = fs.readFileSync(
      path.resolve(__dirname, "..", "app/settings.tsx"),
      "utf-8"
    );
    expect(content).toContain("useThemeColors");
  });

  it("Settings applies themeColors to container", () => {
    const content = fs.readFileSync(
      path.resolve(__dirname, "..", "app/settings.tsx"),
      "utf-8"
    );
    expect(content).toContain("themeColors.background");
  });
});

// ── 5. SLT Meeting Doc ────────────────────────────────────────────
describe("SLT Meeting — Sprint 115", () => {
  const sltPath = path.resolve(__dirname, "..", "docs/meetings/SLT-BACKLOG-115.md");

  it("SLT meeting doc exists", () => {
    expect(fs.existsSync(sltPath)).toBe(true);
  });

  it("SLT doc includes all 4 attendees", () => {
    const content = fs.readFileSync(sltPath, "utf-8");
    expect(content).toContain("Marcus Chen");
    expect(content).toContain("Rachel Wei");
    expect(content).toContain("Amir Patel");
    expect(content).toContain("Sarah Nakamura");
  });

  it("SLT doc sets backlog through Sprint 119", () => {
    const content = fs.readFileSync(sltPath, "utf-8");
    expect(content).toContain("119");
  });

  it("SLT doc has P0, P1, P2 priorities", () => {
    const content = fs.readFileSync(sltPath, "utf-8");
    expect(content).toContain("P0");
    expect(content).toContain("P1");
    expect(content).toContain("P2");
  });
});
