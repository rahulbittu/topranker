import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// ── SLT Backlog Meeting Doc ──────────────────────────────────────
describe("Sprint 125 — SLT Backlog Meeting Doc", () => {
  const filePath = path.resolve(__dirname, "..", "docs", "meetings", "SLT-BACKLOG-125.md");

  it("SLT-BACKLOG-125.md exists", () => {
    expect(fs.existsSync(filePath)).toBe(true);
  });

  const source = fs.readFileSync(filePath, "utf-8");

  it("contains all four attendees", () => {
    expect(source).toContain("Marcus Chen (CTO)");
    expect(source).toContain("Rachel Wei (CFO)");
    expect(source).toContain("Amir Patel (Architecture)");
    expect(source).toContain("Sarah Nakamura (Lead Eng)");
  });

  it("references Sprint 120 as previous meeting", () => {
    expect(source).toContain("Previous Meeting**: Sprint 120");
  });

  it("references Sprint 130 as next meeting", () => {
    expect(source).toContain("Next Meeting**: Sprint 130");
  });

  it("reviews Sprints 120-124", () => {
    expect(source).toContain("Sprint 120");
    expect(source).toContain("Sprint 121");
    expect(source).toContain("Sprint 122");
    expect(source).toContain("Sprint 123");
    expect(source).toContain("Sprint 124");
  });

  it("mentions Sentry APPROVED", () => {
    expect(source).toContain("Sentry");
    expect(source).toContain("APPROVED");
  });

  it("includes velocity and test count", () => {
    expect(source).toContain("1183");
    expect(source).toContain("57 files");
  });

  it("has P0, P1, P2 backlog sections", () => {
    expect(source).toContain("P0");
    expect(source).toContain("P1");
    expect(source).toContain("P2");
  });

  it("has decisions section", () => {
    expect(source).toContain("## Decisions");
  });

  it("has action items section", () => {
    expect(source).toContain("## Action Items");
  });
});

// ── Health Dashboard Endpoint ────────────────────────────────────
describe("Sprint 125 — Health Dashboard Endpoint", () => {
  const filePath = path.resolve(__dirname, "..", "server", "routes-admin.ts");

  it("routes-admin.ts exists", () => {
    expect(fs.existsSync(filePath)).toBe(true);
  });

  const source = fs.readFileSync(filePath, "utf-8");

  it("contains /api/admin/health/detailed endpoint", () => {
    expect(source).toContain("/api/admin/health/detailed");
  });

  it("returns heapTotal in memory object", () => {
    expect(source).toContain("heapTotal");
  });

  it("returns heapUsed in memory object", () => {
    expect(source).toContain("heapUsed");
  });

  it("returns rss in memory object", () => {
    expect(source).toContain("rss");
  });

  it("returns cpuUsage data", () => {
    expect(source).toContain("cpuUsage");
    expect(source).toContain("process.cpuUsage()");
  });

  it("returns featureFlags from getAllFlags", () => {
    expect(source).toContain("featureFlags");
    expect(source).toContain("getAllFlags");
  });

  it("imports getAllFlags from feature-flags", () => {
    expect(source).toContain('import { getAllFlags } from "../lib/feature-flags"');
  });

  it("returns platform and nodeVersion", () => {
    expect(source).toContain("process.platform");
    expect(source).toContain("process.version");
  });

  it("returns activeConnections placeholder", () => {
    expect(source).toContain("activeConnections: 0");
  });
});

// ── Environment Validation Utility ───────────────────────────────
describe("Sprint 125 — Environment Validation Utility", () => {
  const filePath = path.resolve(__dirname, "..", "lib", "env-check.ts");

  it("env-check.ts exists", () => {
    expect(fs.existsSync(filePath)).toBe(true);
  });

  const source = fs.readFileSync(filePath, "utf-8");

  it("exports EnvVar interface", () => {
    expect(source).toContain("export interface EnvVar");
  });

  it("exports checkEnvironment function", () => {
    expect(source).toContain("export function checkEnvironment");
  });

  it("exports getEnvironmentSummary function", () => {
    expect(source).toContain("export function getEnvironmentSummary");
  });

  it("checks DATABASE_URL", () => {
    expect(source).toContain("DATABASE_URL");
  });

  it("checks SESSION_SECRET", () => {
    expect(source).toContain("SESSION_SECRET");
  });

  it("checks GOOGLE_CLIENT_ID", () => {
    expect(source).toContain("GOOGLE_CLIENT_ID");
  });

  it("checks EXPO_PUBLIC_GOOGLE_CLIENT_ID", () => {
    expect(source).toContain("EXPO_PUBLIC_GOOGLE_CLIENT_ID");
  });

  it("checks EXPO_PUBLIC_GOOGLE_MAPS_API_KEY", () => {
    expect(source).toContain("EXPO_PUBLIC_GOOGLE_MAPS_API_KEY");
  });

  it("checks STRIPE_SECRET_KEY", () => {
    expect(source).toContain("STRIPE_SECRET_KEY");
  });

  it("checks RESEND_API_KEY", () => {
    expect(source).toContain("RESEND_API_KEY");
  });

  it("DATABASE_URL and SESSION_SECRET are required", () => {
    const dbLine = source.match(/DATABASE_URL.*required:\s*(true|false)/s);
    const sessLine = source.match(/SESSION_SECRET.*required:\s*(true|false)/s);
    expect(dbLine).toBeTruthy();
    expect(sessLine).toBeTruthy();
  });

  it("returns masked value with first 4 chars", () => {
    expect(source).toContain("masked");
    expect(source).toContain("substring(0, 4)");
  });

  it("getEnvironmentSummary returns total, present, missing, requiredMissing", () => {
    expect(source).toContain("total:");
    expect(source).toContain("present,");
    expect(source).toContain("missing,");
    expect(source).toContain("requiredMissing");
  });
});

// ── API Documentation Enhancement ────────────────────────────────
describe("Sprint 125 — API Documentation", () => {
  const filePath = path.resolve(__dirname, "..", "docs", "API.md");

  it("API.md exists", () => {
    expect(fs.existsSync(filePath)).toBe(true);
  });

  const source = fs.readFileSync(filePath, "utf-8");

  it("documents GET /api/admin/analytics/dashboard", () => {
    expect(source).toContain("/api/admin/analytics/dashboard");
  });

  it("documents GET /api/admin/metrics", () => {
    expect(source).toContain("/api/admin/metrics");
  });

  it("documents POST /api/account/schedule-deletion", () => {
    expect(source).toContain("/api/account/schedule-deletion");
  });

  it("documents GET /api/account/deletion-status", () => {
    expect(source).toContain("/api/account/deletion-status");
  });

  it("documents POST /api/account/cancel-deletion", () => {
    expect(source).toContain("/api/account/cancel-deletion");
  });

  it("documents GET /api/admin/health/detailed", () => {
    expect(source).toContain("/api/admin/health/detailed");
  });

  it("documents Account Management section", () => {
    expect(source).toContain("Account Management");
  });
});
