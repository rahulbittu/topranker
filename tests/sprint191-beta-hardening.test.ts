/**
 * Sprint 191 — Beta Launch Hardening
 *
 * Validates:
 * 1. Email retry with exponential backoff
 * 2. Server-side error tracking module
 * 3. Error tracking initialization in server
 * 4. Admin error endpoints
 * 5. DB backup script existence
 * 6. Error handler middleware
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Email retry with exponential backoff
// ---------------------------------------------------------------------------
describe("Email — retry with backoff", () => {
  const src = readFile("server/email.ts");

  it("has sendWithRetry function", () => {
    expect(src).toContain("async function sendWithRetry");
  });

  it("accepts maxRetries parameter", () => {
    expect(src).toContain("maxRetries: number = 3");
  });

  it("implements exponential backoff", () => {
    expect(src).toContain("Math.pow(2, attempt)");
  });

  it("does not retry 4xx errors (except 429)", () => {
    expect(src).toContain("res.status < 500 && res.status !== 429");
  });

  it("retries on 5xx errors", () => {
    expect(src).toContain("res.status < 500");
  });

  it("logs retry attempts", () => {
    expect(src).toContain("attempt ${attempt + 1}/${maxRetries}");
  });

  it("logs final failure after all retries", () => {
    expect(src).toContain("failed after ${maxRetries} retries");
  });

  it("sendEmail calls sendWithRetry", () => {
    expect(src).toContain("await sendWithRetry(payload)");
  });

  it("still has dev mode fallback", () => {
    expect(src).toContain("[DEV]");
    expect(src).toContain("!RESEND_API_KEY");
  });
});

// ---------------------------------------------------------------------------
// 2. Server-side error tracking module
// ---------------------------------------------------------------------------
describe("Error tracking — server/error-tracking.ts", () => {
  const src = readFile("server/error-tracking.ts");

  it("exports initErrorTracking", () => {
    expect(src).toContain("export function initErrorTracking");
  });

  it("exports captureServerError", () => {
    expect(src).toContain("export function captureServerError");
  });

  it("exports errorHandlerMiddleware", () => {
    expect(src).toContain("export function errorHandlerMiddleware");
  });

  it("exports getRecentServerErrors", () => {
    expect(src).toContain("export function getRecentServerErrors");
  });

  it("exports getErrorStats", () => {
    expect(src).toContain("export function getErrorStats");
  });

  it("reads SENTRY_DSN from env", () => {
    expect(src).toContain("process.env.SENTRY_DSN");
  });

  it("handles unhandled rejections", () => {
    expect(src).toContain("unhandledRejection");
  });

  it("handles uncaught exceptions", () => {
    expect(src).toContain("uncaughtException");
  });

  it("maintains recent errors buffer", () => {
    expect(src).toContain("MAX_RECENT_ERRORS = 100");
  });

  it("tracks error severity levels", () => {
    expect(src).toContain('"error" | "warning" | "fatal"');
  });

  it("includes route info in error events", () => {
    expect(src).toContain("req.method");
    expect(src).toContain("req.route?.path");
  });

  it("includes userId in error context", () => {
    expect(src).toContain("userId");
  });

  it("getErrorStats counts by severity", () => {
    expect(src).toContain('severity === "fatal"');
    expect(src).toContain('severity === "error"');
    expect(src).toContain('severity === "warning"');
  });

  it("getErrorStats counts last 24h", () => {
    expect(src).toContain("24 * 60 * 60 * 1000");
  });
});

// ---------------------------------------------------------------------------
// 3. Error tracking initialization in server
// ---------------------------------------------------------------------------
describe("Server init — error tracking", () => {
  const src = readFile("server/index.ts");

  it("imports initErrorTracking", () => {
    expect(src).toContain('import { initErrorTracking } from "./error-tracking"');
  });

  it("calls initErrorTracking early", () => {
    expect(src).toContain("initErrorTracking()");
  });
});

// ---------------------------------------------------------------------------
// 4. Admin error endpoints
// ---------------------------------------------------------------------------
describe("Admin — error endpoints", () => {
  const src = readFile("server/routes-admin.ts");

  it("has GET /api/admin/errors endpoint", () => {
    expect(src).toContain('"/api/admin/errors"');
  });

  it("imports getRecentServerErrors", () => {
    expect(src).toContain("getRecentServerErrors");
  });

  it("perf endpoint includes error stats", () => {
    expect(src).toContain("errors: getErrorStats()");
  });

  it("imports getErrorStats in perf endpoint", () => {
    expect(src).toContain("getErrorStats");
  });

  it("errors endpoint has limit parameter", () => {
    expect(src).toContain("req.query.limit");
  });

  it("limits to max 100 errors", () => {
    expect(src).toContain("Math.min(100");
  });
});

// ---------------------------------------------------------------------------
// 5. DB backup script
// ---------------------------------------------------------------------------
describe("DB backup — scripts/db-backup.sh", () => {
  const scriptPath = path.resolve(__dirname, "..", "scripts/db-backup.sh");

  it("backup script exists", () => {
    expect(fs.existsSync(scriptPath)).toBe(true);
  });

  it("is executable", () => {
    const stats = fs.statSync(scriptPath);
    // Check if owner execute bit is set (0o100)
    expect(stats.mode & 0o100).toBeTruthy();
  });

  const src = readFile("scripts/db-backup.sh");

  it("uses pg_dump", () => {
    expect(src).toContain("pg_dump");
  });

  it("compresses output with gzip", () => {
    expect(src).toContain("gzip");
  });

  it("reads DATABASE_URL", () => {
    expect(src).toContain("DATABASE_URL");
  });

  it("implements backup rotation", () => {
    expect(src).toContain("MAX_BACKUPS=7");
  });

  it("creates timestamped backup files", () => {
    expect(src).toContain("TIMESTAMP");
    expect(src).toContain("topranker_");
  });

  it("uses set -euo pipefail for safety", () => {
    expect(src).toContain("set -euo pipefail");
  });
});
