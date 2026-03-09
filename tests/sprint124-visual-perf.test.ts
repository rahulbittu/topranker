import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// ── Visual Regression Testing ──────────────────────────────────────
describe("Sprint 124 — Visual Regression Utility", () => {
  const filePath = path.resolve(__dirname, "..", "lib", "visual-regression.ts");

  it("visual-regression.ts exists", () => {
    expect(fs.existsSync(filePath)).toBe(true);
  });

  const source = fs.readFileSync(filePath, "utf-8");

  it("exports ScreenshotConfig interface", () => {
    expect(source).toContain("export interface ScreenshotConfig");
  });

  it("ScreenshotConfig has name, route, viewport fields", () => {
    expect(source).toContain("name: string");
    expect(source).toContain("route: string");
    expect(source).toContain("viewport:");
  });

  it("exports CRITICAL_SCREENS with 8 entries", () => {
    expect(source).toContain("export const CRITICAL_SCREENS");
    const screenNames = ["home", "search", "challenger", "profile", "settings", "business-detail", "login", "signup"];
    for (const name of screenNames) {
      expect(source).toContain(`name: "${name}"`);
    }
  });

  it("exports DIFF_THRESHOLD = 0.1", () => {
    expect(source).toContain("export const DIFF_THRESHOLD = 0.1");
  });

  it("exports generateScreenshotManifest function", () => {
    expect(source).toContain("export function generateScreenshotManifest");
  });

  it("generateScreenshotManifest returns screens and generatedAt", () => {
    expect(source).toContain("screens:");
    expect(source).toContain("generatedAt:");
  });

  it("exports compareScreenshots function", () => {
    expect(source).toContain("export function compareScreenshots");
  });

  it("compareScreenshots returns match and diffPercentage", () => {
    expect(source).toContain("match:");
    expect(source).toContain("diffPercentage:");
  });

  it("has pixelmatch integration comment", () => {
    expect(source).toContain("pixelmatch integration");
  });
});

// ── Database Migration Runner ──────────────────────────────────────
describe("Sprint 124 — Database Migration Runner", () => {
  const filePath = path.resolve(__dirname, "..", "server", "migrate.ts");

  it("migrate.ts exists", () => {
    expect(fs.existsSync(filePath)).toBe(true);
  });

  const source = fs.readFileSync(filePath, "utf-8");

  it("exports Migration interface", () => {
    expect(source).toContain("export interface Migration");
  });

  it("Migration has id, name, up, down, appliedAt fields", () => {
    expect(source).toContain("id: string");
    expect(source).toContain("name: string");
    expect(source).toContain("up: string");
    expect(source).toContain("down: string");
    expect(source).toContain("appliedAt?:");
  });

  it("exports migrations array", () => {
    expect(source).toContain("export const migrations: Migration[]");
  });

  it("exports getMigrationStatus function", () => {
    expect(source).toContain("export function getMigrationStatus");
  });

  it("getMigrationStatus returns applied and pending", () => {
    expect(source).toContain("applied:");
    expect(source).toContain("pending:");
  });

  it("exports applyMigration function", () => {
    expect(source).toContain("export function applyMigration");
  });

  it("exports rollbackMigration function", () => {
    expect(source).toContain("export function rollbackMigration");
  });

  it("uses in-memory Set for tracking applied migrations", () => {
    expect(source).toContain("new Set<string>()");
  });
});

// ── Performance Budget Utility ─────────────────────────────────────
describe("Sprint 124 — Performance Budget Utility", () => {
  const filePath = path.resolve(__dirname, "..", "lib", "performance-budget.ts");

  it("performance-budget.ts exists", () => {
    expect(fs.existsSync(filePath)).toBe(true);
  });

  const source = fs.readFileSync(filePath, "utf-8");

  it("exports PerformanceBudget interface", () => {
    expect(source).toContain("export interface PerformanceBudget");
  });

  it("PerformanceBudget has metric, budget, unit fields", () => {
    expect(source).toContain("metric: string");
    expect(source).toContain("budget: number");
    expect(source).toContain('unit: "ms" | "kb" | "%" | "count"');
  });

  it("exports BUDGETS array with ttfb entry", () => {
    expect(source).toContain("export const BUDGETS");
    expect(source).toContain('"ttfb"');
  });

  it("BUDGETS includes fcp entry", () => {
    expect(source).toContain('"fcp"');
  });

  it("BUDGETS includes bundle_size entry", () => {
    expect(source).toContain('"bundle_size"');
  });

  it("BUDGETS includes api_response_avg entry", () => {
    expect(source).toContain('"api_response_avg"');
  });

  it("exports checkBudget function", () => {
    expect(source).toContain("export function checkBudget");
  });

  it("checkBudget returns passed, budget, actual, overage", () => {
    expect(source).toContain("passed");
    expect(source).toContain("budget:");
    expect(source).toContain("actual:");
    expect(source).toContain("overage:");
  });

  it("exports getBudgetReport function", () => {
    expect(source).toContain("export function getBudgetReport");
  });

  it("getBudgetReport returns ok status", () => {
    expect(source).toContain('"ok"');
  });
});

// ── CHANGELOG ──────────────────────────────────────────────────────
describe("Sprint 124 — CHANGELOG Entries", () => {
  const filePath = path.resolve(__dirname, "..", "CHANGELOG.md");
  const source = fs.readFileSync(filePath, "utf-8");

  it("contains Sprint 124 entry", () => {
    expect(source).toContain("[Sprint 124]");
  });

  it("contains Sprint 123 entry", () => {
    expect(source).toContain("[Sprint 123]");
  });

  it("contains Sprint 122 entry", () => {
    expect(source).toContain("[Sprint 122]");
  });

  it("contains Sprint 121 entry", () => {
    expect(source).toContain("[Sprint 121]");
  });

  it("Sprint 124 appears before Sprint 123 (reverse chronological)", () => {
    const idx124 = source.indexOf("[Sprint 124]");
    const idx123 = source.indexOf("[Sprint 123]");
    expect(idx124).toBeLessThan(idx123);
  });

  it("Sprint 123 appears before Sprint 122 (reverse chronological)", () => {
    const idx123 = source.indexOf("[Sprint 123]");
    const idx122 = source.indexOf("[Sprint 122]");
    expect(idx123).toBeLessThan(idx122);
  });
});
