/**
 * Sprint 204 — Wave 3 Expansion + Performance Validation
 *
 * Validates:
 * 1. Batch invite capacity increased to 100
 * 2. Performance validation endpoint
 * 3. User activity persistence schema
 * 4. User activity storage module
 * 5. Admin route registration
 * 6. Performance budget checks
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Batch invite capacity expanded to 100
// ---------------------------------------------------------------------------
describe("Batch invite Wave 3 — server/routes-admin.ts", () => {
  const src = readFile("server/routes-admin.ts");

  it("allows up to 100 invites per batch", () => {
    expect(src).toContain("invites.length > 100");
  });

  it("error message reflects 100 limit", () => {
    expect(src).toContain("1-100 entries");
  });

  it("batch endpoint still requires admin auth", () => {
    expect(src).toContain('"/api/admin/beta-invite/batch", requireAuth, requireAdmin');
  });
});

// ---------------------------------------------------------------------------
// 2. Performance validation endpoint
// ---------------------------------------------------------------------------
describe("Performance validation — server/perf-monitor.ts", () => {
  const src = readFile("server/perf-monitor.ts");

  it("exports getPerformanceValidation function", () => {
    expect(src).toContain("export function getPerformanceValidation()");
  });

  it("checks avg response time budget", () => {
    expect(src).toContain("Avg Response Time");
  });

  it("checks max response time budget", () => {
    expect(src).toContain("Max Response Time");
  });

  it("checks slow request rate", () => {
    expect(src).toContain("Slow Request Rate");
  });

  it("returns healthy boolean", () => {
    expect(src).toContain("healthy: checks.every");
  });

  it("has 200ms avg response budget", () => {
    expect(src).toContain("budget: 200");
  });

  it("has 2000ms max response budget", () => {
    expect(src).toContain("budget: 2000");
  });

  it("has 5% slow request budget", () => {
    expect(src).toContain("budget: 5");
  });
});

// ---------------------------------------------------------------------------
// 3. User activity persistence schema
// ---------------------------------------------------------------------------
describe("User activity table — shared/schema.ts", () => {
  const src = readFile("shared/schema.ts");

  it("defines userActivity table", () => {
    expect(src).toContain('pgTable(\n  "user_activity"');
  });

  it("has userId primary key", () => {
    expect(src).toContain('varchar("user_id")');
    expect(src).toContain(".primaryKey()");
  });

  it("has lastSeenAt timestamp", () => {
    expect(src).toContain("last_seen_at");
  });

  it("has index on lastSeenAt", () => {
    expect(src).toContain("idx_user_activity_last_seen");
  });

  it("exports UserActivity type", () => {
    expect(src).toContain("export type UserActivity");
  });
});

// ---------------------------------------------------------------------------
// 4. User activity storage module
// ---------------------------------------------------------------------------
describe("User activity storage — server/storage/user-activity.ts", () => {
  const src = readFile("server/storage/user-activity.ts");

  it("exports recordUserActivityDb function", () => {
    expect(src).toContain("export async function recordUserActivityDb");
  });

  it("exports getActiveUserStatsDb function", () => {
    expect(src).toContain("export async function getActiveUserStatsDb");
  });

  it("uses upsert with onConflictDoUpdate", () => {
    expect(src).toContain("onConflictDoUpdate");
  });

  it("queries 4 time windows in parallel", () => {
    expect(src).toContain("Promise.all");
  });

  it("returns last1h, last24h, last7d, last30d", () => {
    expect(src).toContain("last1h:");
    expect(src).toContain("last24h:");
    expect(src).toContain("last7d:");
    expect(src).toContain("last30d:");
  });
});

// ---------------------------------------------------------------------------
// 5. Admin route registration
// ---------------------------------------------------------------------------
describe("Sprint 204 admin routes — server/routes-admin.ts", () => {
  const src = readFile("server/routes-admin.ts");

  it("registers perf validation endpoint", () => {
    expect(src).toContain("/api/admin/perf/validate");
  });

  it("registers DB-backed active users endpoint", () => {
    expect(src).toContain("/api/admin/analytics/active-users-db");
  });

  it("imports getPerformanceValidation", () => {
    expect(src).toContain("getPerformanceValidation");
  });

  it("imports getActiveUserStatsDb in route handler", () => {
    expect(src).toContain("getActiveUserStatsDb");
  });

  it("perf validation requires admin", () => {
    expect(src).toContain('"/api/admin/perf/validate", requireAuth, requireAdmin');
  });
});

// ---------------------------------------------------------------------------
// 6. Storage barrel exports
// ---------------------------------------------------------------------------
describe("Storage exports — server/storage/index.ts", () => {
  const src = readFile("server/storage/index.ts");

  it("exports recordUserActivityDb", () => {
    expect(src).toContain("recordUserActivityDb");
  });

  it("exports getActiveUserStatsDb", () => {
    expect(src).toContain("getActiveUserStatsDb");
  });

  it("exports from user-activity module", () => {
    expect(src).toContain("./user-activity");
  });
});
