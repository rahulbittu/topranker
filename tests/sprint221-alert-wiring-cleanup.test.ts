/**
 * Sprint 221 — Alert Wiring + Deferred Debt Cleanup
 *
 * Validates:
 * 1. Perf-monitor auto-fires alerts
 * 2. City config unification
 * 3. Replit CORS removal
 * 4. Deferred items resolution
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. Perf-monitor alert wiring
// ---------------------------------------------------------------------------
describe("Perf-monitor alert wiring — server/perf-monitor.ts", () => {
  const src = readFile("server/perf-monitor.ts");

  it("imports fireAlert from alerting", () => {
    expect(src).toContain('from "./alerting"');
    expect(src).toContain("fireAlert");
  });

  it("fires slow_response alert", () => {
    expect(src).toContain('fireAlert("slow_response"');
  });

  it("fires high_memory alert", () => {
    expect(src).toContain('fireAlert("high_memory"');
  });

  it("includes route in alert metadata", () => {
    expect(src).toContain("route");
    expect(src).toContain("duration");
  });

  it("checks memory threshold at 512MB", () => {
    expect(src).toContain("512");
  });

  it("retains slow threshold at 500ms", () => {
    expect(src).toContain("SLOW_THRESHOLD_MS");
    expect(src).toContain("500");
  });
});

// ---------------------------------------------------------------------------
// 2. City config unification
// ---------------------------------------------------------------------------
describe("City config unification — lib/city-context.tsx", () => {
  const src = readFile("lib/city-context.tsx");

  it("imports from shared city-config", () => {
    expect(src).toContain("city-config");
    expect(src).toContain("getActiveCities");
  });

  it("derives SUPPORTED_CITIES from registry", () => {
    expect(src).toContain("getActiveCities()");
  });

  it("retains CityProvider", () => {
    expect(src).toContain("CityProvider");
  });

  it("retains useCity hook", () => {
    expect(src).toContain("useCity");
  });

  it("retains AsyncStorage persistence", () => {
    expect(src).toContain("AsyncStorage");
    expect(src).toContain("topranker_selected_city");
  });
});

// ---------------------------------------------------------------------------
// 3. Replit CORS removal
// ---------------------------------------------------------------------------
describe("Replit CORS removal — server/security-headers.ts", () => {
  const src = readFile("server/security-headers.ts");

  it("does not check REPLIT_DEV_DOMAIN", () => {
    expect(src).not.toContain("process.env.REPLIT_DEV_DOMAIN");
  });

  it("does not check REPLIT_DOMAINS", () => {
    expect(src).not.toContain("process.env.REPLIT_DOMAINS");
  });

  it("documents WON'T FIX decision", () => {
    expect(src).toContain("WON'T FIX");
  });

  it("retains production CORS origins", () => {
    expect(src).toContain("topranker.com");
    expect(src).toContain("topranker.io");
  });

  it("retains Railway CORS support via config", () => {
    // Sprint 807: Centralized to config.ts — uses config.railwayPublicDomain
    expect(src).toContain("config.railwayPublicDomain");
  });

  it("retains CORS_ORIGINS env support via config", () => {
    // Sprint 807: Centralized to config.ts — uses config.corsOrigins
    expect(src).toContain("config.corsOrigins");
  });
});

// ---------------------------------------------------------------------------
// 4. Deferred items resolution verification
// ---------------------------------------------------------------------------
describe("Deferred items resolution", () => {
  it("alerting module exists", () => {
    expect(fileExists("server/alerting.ts")).toBe(true);
  });

  it("city config module exists", () => {
    expect(fileExists("shared/city-config.ts")).toBe(true);
  });

  it("perf-monitor imports alerting", () => {
    const src = readFile("server/perf-monitor.ts");
    expect(src).toContain("alerting");
  });

  it("city-context imports city-config", () => {
    const src = readFile("lib/city-context.tsx");
    expect(src).toContain("city-config");
  });

  it("security headers has no Replit references in active code", () => {
    const src = readFile("server/security-headers.ts");
    // Replit appears only in the WON'T FIX comment, not in active code
    const lines = src.split("\n").filter(l => !l.includes("//") && l.includes("replit"));
    expect(lines.length).toBe(0);
  });
});
