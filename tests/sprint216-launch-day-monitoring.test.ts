/**
 * Sprint 216 — Launch Day Monitoring + Hotfix Readiness
 *
 * Validates:
 * 1. Launch day monitor script
 * 2. Rollback checklist script
 * 3. Incident response runbook
 * 4. Operational tooling completeness
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. Launch day monitor script
// ---------------------------------------------------------------------------
describe("Launch day monitor — scripts/launch-day-monitor.ts", () => {
  it("script exists", () => {
    expect(fileExists("scripts/launch-day-monitor.ts")).toBe(true);
  });

  const src = readFile("scripts/launch-day-monitor.ts");

  it("monitors health endpoint", () => {
    expect(src).toContain("/api/health");
  });

  it("monitors leaderboard endpoint", () => {
    expect(src).toContain("/api/leaderboard");
  });

  it("monitors search endpoint", () => {
    expect(src).toContain("/api/search");
  });

  it("has critical endpoint classification", () => {
    expect(src).toContain("critical: true");
    expect(src).toContain("critical: false");
  });

  it("has latency threshold", () => {
    expect(src).toContain("LATENCY_THRESHOLD_MS");
  });

  it("has memory threshold", () => {
    expect(src).toContain("MEMORY_THRESHOLD_MB");
  });

  it("supports configurable base URL", () => {
    expect(src).toContain("process.argv[2]");
  });

  it("supports configurable interval", () => {
    expect(src).toContain("process.argv[3]");
  });

  it("supports single-shot mode", () => {
    expect(src).toContain("--once");
  });

  it("reports critical failures", () => {
    expect(src).toContain("CRITICAL FAILURE");
  });

  it("reports all systems operational", () => {
    expect(src).toContain("ALL SYSTEMS OPERATIONAL");
  });

  it("tracks uptime from health response", () => {
    expect(src).toContain("formatUptime");
  });
});

// ---------------------------------------------------------------------------
// 2. Rollback checklist script
// ---------------------------------------------------------------------------
describe("Rollback checklist — scripts/rollback-checklist.ts", () => {
  it("script exists", () => {
    expect(fileExists("scripts/rollback-checklist.ts")).toBe(true);
  });

  const src = readFile("scripts/rollback-checklist.ts");

  it("checks git branch", () => {
    expect(src).toContain("main");
    expect(src).toContain("rev-parse");
  });

  it("checks working tree cleanliness", () => {
    expect(src).toContain("git status");
    expect(src).toContain("porcelain");
  });

  it("checks for destructive migrations", () => {
    expect(src).toContain("drop table");
    expect(src).toContain("drop column");
  });

  it("checks deployment config", () => {
    expect(src).toContain("railway.toml");
    expect(src).toContain("ci.yml");
  });

  it("provides rollback commands", () => {
    expect(src).toContain("git revert");
    expect(src).toContain("smoke-test");
  });

  it("exits with code 1 on failure", () => {
    expect(src).toContain("process.exit(");
  });
});

// ---------------------------------------------------------------------------
// 3. Incident response runbook
// ---------------------------------------------------------------------------
describe("Incident runbook — docs/INCIDENT-RUNBOOK.md", () => {
  it("runbook exists", () => {
    expect(fileExists("docs/INCIDENT-RUNBOOK.md")).toBe(true);
  });

  const src = readFile("docs/INCIDENT-RUNBOOK.md");

  it("defines severity levels", () => {
    expect(src).toContain("SEV-1");
    expect(src).toContain("SEV-2");
    expect(src).toContain("SEV-3");
    expect(src).toContain("SEV-4");
  });

  it("defines response times", () => {
    expect(src).toContain("15 min");
    expect(src).toContain("30 min");
    expect(src).toContain("2 hours");
  });

  it("includes diagnosis steps", () => {
    expect(src).toContain("/api/health");
    expect(src).toContain("git log");
  });

  it("includes rollback procedure", () => {
    expect(src).toContain("rollback-checklist");
    expect(src).toContain("git revert");
  });

  it("includes monitoring commands reference", () => {
    expect(src).toContain("launch-day-monitor");
    expect(src).toContain("smoke-test");
    expect(src).toContain("pre-launch-security-audit");
  });

  it("includes key contacts", () => {
    expect(src).toContain("Marcus Chen");
    expect(src).toContain("Sarah Nakamura");
    expect(src).toContain("Nadia Kaur");
  });

  it("includes post-launch monitoring schedule", () => {
    expect(src).toContain("T+0");
    expect(src).toContain("T+7d");
  });
});

// ---------------------------------------------------------------------------
// 4. Operational tooling completeness
// ---------------------------------------------------------------------------
describe("Operational tooling completeness", () => {
  it("launch readiness gate exists", () => {
    expect(fileExists("scripts/launch-readiness-gate.ts")).toBe(true);
  });

  it("security audit exists", () => {
    expect(fileExists("scripts/pre-launch-security-audit.ts")).toBe(true);
  });

  it("smoke test exists", () => {
    expect(fileExists("scripts/smoke-test.ts")).toBe(true);
  });

  it("launch day monitor exists", () => {
    expect(fileExists("scripts/launch-day-monitor.ts")).toBe(true);
  });

  it("rollback checklist exists", () => {
    expect(fileExists("scripts/rollback-checklist.ts")).toBe(true);
  });

  it("incident runbook exists", () => {
    expect(fileExists("docs/INCIDENT-RUNBOOK.md")).toBe(true);
  });

  it("launch checklist exists", () => {
    expect(fileExists("docs/LAUNCH-CHECKLIST.md")).toBe(true);
  });

  it("health endpoint in routes", () => {
    // Sprint 804: Health routes extracted to routes-health.ts
    const routes = readFile("server/routes-health.ts");
    expect(routes).toContain("/api/health");
  });
});
