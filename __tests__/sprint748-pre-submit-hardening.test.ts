/**
 * Sprint 748: Pre-Submit Script Hardening
 *
 * Validates:
 * 1. Pre-submit script includes Sprint 741-747 security checks
 * 2. All hardening items are verified before submission
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readSource(filePath: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), filePath), "utf-8");
}

describe("Sprint 748: Pre-Submit Script — Security Checks", () => {
  const src = readSource("scripts/pre-submit-check.sh");

  it("checks for Math.random() in server IDs (Sprint 741)", () => {
    expect(src).toContain("Math.random().toString(36)");
    expect(src).toContain("No Math.random() in server IDs");
  });

  it("checks for SHARE_BASE_URL (Sprint 742)", () => {
    expect(src).toContain("SHARE_BASE_URL exported");
  });

  it("checks for config.siteUrl (Sprint 742)", () => {
    expect(src).toContain("config.siteUrl defined");
  });

  it("checks for empty catch blocks (Sprint 743)", () => {
    expect(src).toContain("No empty catch blocks");
  });

  it("checks isReceipt validation (Sprint 746)", () => {
    expect(src).toContain("isReceipt strictly validated");
  });

  it("checks URL protocol validation (Sprint 746)", () => {
    expect(src).toContain("URL protocol validation");
  });

  it("still checks rate limiters", () => {
    expect(src).toContain("Rate limiters defined");
  });

  it("still checks AASA file", () => {
    expect(src).toContain("AASA file exists");
  });

  it("still checks privacy manifest", () => {
    expect(src).toContain("Privacy manifest present");
  });

  it("has minimum 20 checks", () => {
    const checkCount = (src.match(/check "/g) || []).length;
    expect(checkCount).toBeGreaterThanOrEqual(20);
  });
});
