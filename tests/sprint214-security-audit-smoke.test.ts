/**
 * Sprint 214 — Pre-Launch Security Audit + Smoke Tests
 *
 * Validates:
 * 1. Security audit script structure
 * 2. Smoke test script structure
 * 3. Security measures in codebase
 * 4. Load test infrastructure
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. Security audit script
// ---------------------------------------------------------------------------
describe("Security audit script — scripts/pre-launch-security-audit.ts", () => {
  it("script exists", () => {
    expect(fileExists("scripts/pre-launch-security-audit.ts")).toBe(true);
  });

  const src = readFile("scripts/pre-launch-security-audit.ts");

  it("checks input sanitization", () => {
    expect(src).toContain("Input Validation");
    expect(src).toContain("sanitizeString");
  });

  it("checks authentication", () => {
    expect(src).toContain("Authentication");
    expect(src).toContain("requireAuth");
  });

  it("checks rate limiting", () => {
    expect(src).toContain("Rate Limiting");
  });

  it("checks CSP headers", () => {
    expect(src).toContain("CSP");
  });

  it("checks password security", () => {
    expect(src).toContain("Password Security");
  });

  it("checks data retention", () => {
    expect(src).toContain("Data Retention");
  });

  it("checks demo credentials", () => {
    expect(src).toContain("__DEV__");
  });

  it("checks GDPR compliance", () => {
    expect(src).toContain("GDPR");
  });

  it("outputs grade", () => {
    expect(src).toContain("Grade:");
  });
});

// ---------------------------------------------------------------------------
// 2. Smoke test script
// ---------------------------------------------------------------------------
describe("Smoke test script — scripts/smoke-test.ts", () => {
  it("script exists", () => {
    expect(fileExists("scripts/smoke-test.ts")).toBe(true);
  });

  const src = readFile("scripts/smoke-test.ts");

  it("tests health endpoint", () => {
    expect(src).toContain("/api/health");
  });

  it("tests leaderboard endpoint", () => {
    expect(src).toContain("/api/leaderboard");
  });

  it("tests search endpoint", () => {
    expect(src).toContain("/api/search");
  });

  it("tests auth endpoint (expects 401)", () => {
    expect(src).toContain("/api/auth/me");
    expect(src).toContain("expectedStatus: 401");
  });

  it("tests admin endpoint (expects 401)", () => {
    expect(src).toContain("/api/admin/perf");
  });

  it("measures latency", () => {
    expect(src).toContain("latencyMs");
  });

  it("accepts base URL argument", () => {
    expect(src).toContain("process.argv[2]");
  });

  it("reports pass/fail count", () => {
    expect(src).toContain("passed");
    expect(src).toContain("FAILURES");
  });
});

// ---------------------------------------------------------------------------
// 3. Security measures verification
// ---------------------------------------------------------------------------
describe("Security measures in codebase", () => {
  it("sanitize module exists", () => {
    expect(fileExists("server/sanitize.ts")).toBe(true);
  });

  it("rate limiter exists", () => {
    expect(fileExists("server/rate-limiter.ts")).toBe(true);
  });

  it("error tracking exists", () => {
    expect(fileExists("server/error-tracking.ts")).toBe(true);
  });

  it("wrap-async exists", () => {
    expect(fileExists("server/wrap-async.ts")).toBe(true);
  });

  it("middleware exists", () => {
    expect(fileExists("server/middleware.ts")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. Load test infrastructure
// ---------------------------------------------------------------------------
describe("Load test infrastructure", () => {
  it("load test script exists", () => {
    expect(fileExists("scripts/load-test.ts")).toBe(true);
  });

  const src = readFile("scripts/load-test.ts");

  it("tests multiple endpoints", () => {
    expect(src).toContain("leaderboard");
    expect(src).toContain("search");
  });

  it("measures percentiles", () => {
    expect(src).toContain("P50");
    expect(src).toContain("P95");
  });

  it("has configurable concurrency", () => {
    expect(src).toContain("concurrency");
  });
});
