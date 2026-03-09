/**
 * Sprint 201 — Analytics Persistence + DB Backup Automation
 *
 * Validates:
 * 1. Analytics events schema (PostgreSQL table)
 * 2. Analytics persistence storage module
 * 3. Flush handler wiring in server/index.ts
 * 4. Storage barrel exports
 * 5. GitHub Actions DB backup workflow
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Analytics events schema (pre-existing table)
// ---------------------------------------------------------------------------
describe("Analytics events schema — shared/schema.ts", () => {
  const schema = readFile("shared/schema.ts");

  it("defines analyticsEvents table", () => {
    expect(schema).toContain("analyticsEvents");
    expect(schema).toContain("analytics_events");
  });

  it("has event, userId, metadata columns", () => {
    expect(schema).toContain('"event"');
    expect(schema).toContain('"user_id"');
    expect(schema).toContain('"metadata"');
  });

  it("has indexes for efficient querying", () => {
    expect(schema).toContain("idx_analytics_event");
    expect(schema).toContain("idx_analytics_user");
  });

  it("exports AnalyticsEvent type", () => {
    expect(schema).toContain("export type AnalyticsEvent");
  });
});

// ---------------------------------------------------------------------------
// 2. Analytics persistence storage
// ---------------------------------------------------------------------------
describe("Analytics persistence — server/storage/analytics.ts", () => {
  const src = readFile("server/storage/analytics.ts");

  it("exports persistAnalyticsEvents function", () => {
    expect(src).toContain("export async function persistAnalyticsEvents");
  });

  it("batch inserts in chunks of 100", () => {
    expect(src).toContain("CHUNK_SIZE = 100");
  });

  it("passes metadata directly (jsonb column)", () => {
    expect(src).toContain("metadata: e.metadata");
  });

  it("converts timestamp to createdAt Date", () => {
    expect(src).toContain("new Date(e.timestamp)");
  });

  it("exports getPersistedEventCounts", () => {
    expect(src).toContain("export async function getPersistedEventCounts");
  });

  it("exports getPersistedDailyStats", () => {
    expect(src).toContain("export async function getPersistedDailyStats");
  });

  it("exports getPersistedEventTotal", () => {
    expect(src).toContain("export async function getPersistedEventTotal");
  });

  it("groups by event type for counts", () => {
    expect(src).toContain("groupBy(analyticsEvents.event)");
  });

  it("groups by date for daily stats", () => {
    expect(src).toContain("DATE(");
    expect(src).toContain("createdAt");
  });
});

// ---------------------------------------------------------------------------
// 3. Flush handler wiring
// ---------------------------------------------------------------------------
describe("Flush handler wiring — server/index.ts", () => {
  const src = readFile("server/index.ts");

  it("imports setFlushHandler from analytics", () => {
    expect(src).toContain('import { setFlushHandler } from "./analytics"');
  });

  it("imports persistAnalyticsEvents from storage", () => {
    expect(src).toContain("persistAnalyticsEvents");
  });

  it("calls setFlushHandler with 30s interval", () => {
    expect(src).toContain("setFlushHandler(persistAnalyticsEvents, 30_000)");
  });

  it("handles DB unavailability gracefully", () => {
    expect(src).toContain("catch");
    expect(src).toContain("analytics stays in-memory");
  });

  it("mentions Sprint 201", () => {
    expect(src).toContain("Sprint 201");
  });
});

// ---------------------------------------------------------------------------
// 4. Storage barrel exports
// ---------------------------------------------------------------------------
describe("Storage barrel — server/storage/index.ts", () => {
  const src = readFile("server/storage/index.ts");

  it("exports analytics persistence functions", () => {
    expect(src).toContain("persistAnalyticsEvents");
    expect(src).toContain("getPersistedEventCounts");
    expect(src).toContain("getPersistedDailyStats");
    expect(src).toContain("getPersistedEventTotal");
  });

  it("imports from analytics module", () => {
    expect(src).toContain('./analytics"');
  });
});

// ---------------------------------------------------------------------------
// 5. GitHub Actions DB backup
// ---------------------------------------------------------------------------
describe("DB backup workflow — .github/workflows/db-backup.yml", () => {
  const src = readFile(".github/workflows/db-backup.yml");

  it("exists with proper name", () => {
    expect(src).toContain("Daily DB Backup");
  });

  it("runs on schedule (daily at 3 AM UTC)", () => {
    expect(src).toContain("schedule:");
    expect(src).toContain("cron:");
    expect(src).toContain("0 3 * * *");
  });

  it("supports manual trigger", () => {
    expect(src).toContain("workflow_dispatch");
  });

  it("uses pg_dump for backup", () => {
    expect(src).toContain("pg_dump");
  });

  it("compresses backup with gzip", () => {
    expect(src).toContain("gzip");
  });

  it("uploads as artifact with 30-day retention", () => {
    expect(src).toContain("upload-artifact");
    expect(src).toContain("retention-days: 30");
  });

  it("verifies backup integrity", () => {
    expect(src).toContain("gunzip -t");
    expect(src).toContain("suspiciously small");
  });

  it("uses DATABASE_URL secret", () => {
    expect(src).toContain("DATABASE_URL");
    expect(src).toContain("secrets.DATABASE_URL");
  });

  it("has timeout limit", () => {
    expect(src).toContain("timeout-minutes: 10");
  });
});
