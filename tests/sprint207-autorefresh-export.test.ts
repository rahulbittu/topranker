/**
 * Sprint 207 — Dashboard Auto-Refresh + Data Export
 *
 * Validates:
 * 1. Dashboard auto-refresh functionality
 * 2. Auto-refresh toggle UI
 * 3. Data export endpoint
 * 4. CSV export support
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Dashboard auto-refresh
// ---------------------------------------------------------------------------
describe("Auto-refresh — app/admin/dashboard.tsx", () => {
  const src = readFile("app/admin/dashboard.tsx");

  it("defines AUTO_REFRESH_INTERVAL_MS constant", () => {
    expect(src).toContain("AUTO_REFRESH_INTERVAL_MS");
  });

  it("uses 60 second refresh interval", () => {
    expect(src).toContain("60_000");
  });

  it("imports useRef", () => {
    expect(src).toContain("useRef");
  });

  it("has autoRefresh state", () => {
    expect(src).toContain("autoRefresh");
    expect(src).toContain("setAutoRefresh");
  });

  it("uses setInterval for auto-refresh", () => {
    expect(src).toContain("setInterval");
  });

  it("clears interval on cleanup", () => {
    expect(src).toContain("clearInterval");
  });

  it("has intervalRef", () => {
    expect(src).toContain("intervalRef");
  });
});

// ---------------------------------------------------------------------------
// 2. Auto-refresh toggle UI
// ---------------------------------------------------------------------------
describe("Auto-refresh toggle — app/admin/dashboard.tsx", () => {
  const src = readFile("app/admin/dashboard.tsx");

  it("toggles autoRefresh on press", () => {
    expect(src).toContain("setAutoRefresh(!autoRefresh)");
  });

  it("shows ON/OFF state", () => {
    expect(src).toContain('"ON"');
    expect(src).toContain('"OFF"');
  });

  it("shows (auto) label when enabled", () => {
    expect(src).toContain("(auto)");
  });

  it("has autoRefreshToggle style", () => {
    expect(src).toContain("autoRefreshToggle:");
  });

  it("has accessibility label for toggle", () => {
    expect(src).toContain("Disable auto-refresh");
    expect(src).toContain("Enable auto-refresh");
  });
});

// ---------------------------------------------------------------------------
// 3. Data export endpoint
// ---------------------------------------------------------------------------
describe("Analytics export — server/routes-admin-analytics.ts", () => {
  const src = readFile("server/routes-admin-analytics.ts");

  it("registers export endpoint", () => {
    expect(src).toContain("/api/admin/analytics/export");
  });

  it("supports configurable days parameter", () => {
    expect(src).toContain("req.query.days");
  });

  it("limits export to max 365 days", () => {
    expect(src).toContain("Math.min(365");
  });

  it("exports daily stats and event counts", () => {
    expect(src).toContain("getPersistedDailyStats");
    expect(src).toContain("getPersistedEventCounts");
  });

  it("fetches both datasets in parallel", () => {
    expect(src).toContain("Promise.all");
  });

  it("includes exportedAt timestamp", () => {
    expect(src).toContain("exportedAt");
  });
});

// ---------------------------------------------------------------------------
// 4. CSV export support
// ---------------------------------------------------------------------------
describe("CSV export — server/routes-admin-analytics.ts", () => {
  const src = readFile("server/routes-admin-analytics.ts");

  it("supports csv format parameter", () => {
    expect(src).toContain('format === "csv"');
  });

  it("sets CSV content type", () => {
    expect(src).toContain("text/csv");
  });

  it("sets Content-Disposition for download", () => {
    expect(src).toContain("Content-Disposition");
    expect(src).toContain("attachment");
  });

  it("generates CSV with header row", () => {
    expect(src).toContain("date,events");
  });

  it("export requires admin auth", () => {
    expect(src).toContain('"/api/admin/analytics/export", requireAuth, requireAdmin');
  });
});
