/**
 * Sprint 208 — App Store Prep + Launch Checklist
 *
 * Validates:
 * 1. App store metadata document
 * 2. Launch checklist document
 * 3. Performance budget report wired with actuals
 * 4. App.json production readiness
 * 5. EAS build configuration
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. App store metadata
// ---------------------------------------------------------------------------
describe("App store metadata — docs/APP-STORE-METADATA.md", () => {
  it("metadata file exists", () => {
    expect(fileExists("docs/APP-STORE-METADATA.md")).toBe(true);
  });

  const src = readFile("docs/APP-STORE-METADATA.md");

  it("has iOS section", () => {
    expect(src).toContain("iOS App Store");
  });

  it("has Google Play section", () => {
    expect(src).toContain("Google Play Store");
  });

  it("includes app name", () => {
    expect(src).toContain("TopRanker");
  });

  it("includes bundle ID", () => {
    expect(src).toContain("com.topranker.app");
  });

  it("has keywords", () => {
    expect(src).toContain("Keywords");
  });

  it("has screenshot requirements", () => {
    expect(src).toContain("Screenshots Required");
  });

  it("has submission checklist", () => {
    expect(src).toContain("Submission Checklist");
  });

  it("includes privacy policy URL", () => {
    expect(src).toContain("topranker.com/privacy");
  });
});

// ---------------------------------------------------------------------------
// 2. Launch checklist
// ---------------------------------------------------------------------------
describe("Launch checklist — docs/LAUNCH-CHECKLIST.md", () => {
  it("checklist file exists", () => {
    expect(fileExists("docs/LAUNCH-CHECKLIST.md")).toBe(true);
  });

  const src = readFile("docs/LAUNCH-CHECKLIST.md");

  it("has engineering readiness section", () => {
    expect(src).toContain("Engineering Readiness");
  });

  it("has product readiness section", () => {
    expect(src).toContain("Product Readiness");
  });

  it("has business readiness section", () => {
    expect(src).toContain("Business Readiness");
  });

  it("has launch day plan", () => {
    expect(src).toContain("Launch Day Plan");
  });

  it("references Sprint 210 GO/NO-GO", () => {
    expect(src).toContain("Sprint 210");
  });

  it("includes security checklist items", () => {
    expect(src).toContain("Security");
    expect(src).toContain("Rate limiting");
    expect(src).toContain("CSP headers");
  });

  it("includes revenue checklist", () => {
    expect(src).toContain("Revenue");
    expect(src).toContain("Break-even");
  });
});

// ---------------------------------------------------------------------------
// 3. Performance budget report with actuals
// ---------------------------------------------------------------------------
describe("Budget report with actuals — lib/performance-budget.ts", () => {
  const src = readFile("lib/performance-budget.ts");

  it("getBudgetReport accepts actuals parameter", () => {
    expect(src).toContain("actuals?: Record<string, number>");
  });

  it("returns actual values in report", () => {
    expect(src).toContain("actual: number | null");
  });

  it("has warning threshold at 80%", () => {
    expect(src).toContain("b.budget * 0.8");
  });

  it("returns exceeded status when over budget", () => {
    expect(src).toContain('status = "exceeded"');
  });

  it("returns warning status when above 80%", () => {
    expect(src).toContain('status = "warning"');
  });

  it("includes unit in report", () => {
    expect(src).toContain("unit: b.unit");
  });
});

// ---------------------------------------------------------------------------
// 4. App.json production readiness
// ---------------------------------------------------------------------------
describe("App.json production config — app.json", () => {
  const src = readFile("app.json");
  const config = JSON.parse(src);

  it("has app name TopRanker", () => {
    expect(config.expo.name).toBe("TopRanker");
  });

  it("has version 1.0.0", () => {
    expect(config.expo.version).toBe("1.0.0");
  });

  it("has iOS bundle identifier", () => {
    expect(config.expo.ios.bundleIdentifier).toBe("com.topranker.app");
  });

  it("has Android package", () => {
    expect(config.expo.android.package).toBe("com.topranker.app");
  });

  it("has topranker.com origin", () => {
    const routerPlugin = config.expo.plugins.find((p: any) => Array.isArray(p) && p[0] === "expo-router");
    expect(routerPlugin[1].origin).toBe("https://topranker.com");
  });

  it("has deep link intent filters", () => {
    expect(config.expo.android.intentFilters).toBeDefined();
    expect(config.expo.android.intentFilters.length).toBeGreaterThan(0);
  });

  it("has runtime version policy", () => {
    expect(config.expo.runtimeVersion.policy).toBe("appVersion");
  });

  it("has non-exempt encryption set", () => {
    expect(config.expo.ios.config.usesNonExemptEncryption).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 5. EAS build configuration
// ---------------------------------------------------------------------------
describe("EAS build config — eas.json", () => {
  it("eas.json exists", () => {
    expect(fileExists("eas.json")).toBe(true);
  });

  const src = readFile("eas.json");
  const config = JSON.parse(src);

  it("has development profile", () => {
    expect(config.build.development).toBeDefined();
  });

  it("has preview profile", () => {
    expect(config.build.preview).toBeDefined();
  });

  it("has production profile", () => {
    expect(config.build.production).toBeDefined();
  });
});
