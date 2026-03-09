/**
 * Sprint 218 — City Expansion Config + Alerting Infrastructure
 *
 * Validates:
 * 1. City registry configuration
 * 2. City helper functions
 * 3. Alerting module
 * 4. Alert rules and severity
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  CITY_REGISTRY,
  getActiveCities,
  getPlannedCities,
  getCityConfig,
  isCityActive,
  getCityStats,
} from "../shared/city-config";
import {
  fireAlert,
  getRecentAlerts,
  getUnacknowledgedCount,
  acknowledgeAlert,
  getAlertStats,
  getAlertRules,
  clearAlerts,
  DEFAULT_RULES,
} from "../server/alerting";

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. City registry configuration
// ---------------------------------------------------------------------------
describe("City registry — shared/city-config.ts", () => {
  it("module exists", () => {
    expect(fileExists("shared/city-config.ts")).toBe(true);
  });

  it("has Dallas as active city", () => {
    expect(CITY_REGISTRY.Dallas).toBeDefined();
    expect(CITY_REGISTRY.Dallas.status).toBe("active");
  });

  it("has Austin as active city", () => {
    expect(CITY_REGISTRY.Austin).toBeDefined();
    expect(CITY_REGISTRY.Austin.status).toBe("active");
  });

  it("has Houston as active city", () => {
    expect(CITY_REGISTRY.Houston).toBeDefined();
    expect(CITY_REGISTRY.Houston.status).toBe("active");
  });

  it("has planned and beta expansion cities", () => {
    expect(CITY_REGISTRY["Oklahoma City"]).toBeDefined();
    expect(CITY_REGISTRY["Oklahoma City"].status).toBe("beta");
    expect(CITY_REGISTRY["New Orleans"]).toBeDefined();
    expect(CITY_REGISTRY["New Orleans"].status).toBe("beta"); // Sprint 229: promoted to beta
    expect(CITY_REGISTRY["Memphis"]).toBeDefined();
    expect(CITY_REGISTRY["Memphis"].status).toBe("beta"); // Sprint 237: promoted to beta
    expect(CITY_REGISTRY["Nashville"]).toBeDefined();
    expect(CITY_REGISTRY["Nashville"].status).toBe("beta"); // Sprint 241: promoted to beta
  });

  it("all cities have required fields", () => {
    for (const [name, config] of Object.entries(CITY_REGISTRY)) {
      expect(config.name).toBe(name);
      expect(config.state).toBeTruthy();
      expect(config.stateCode).toHaveLength(2);
      expect(config.timezone).toBeTruthy();
      expect(config.coordinates.lat).toBeGreaterThan(0);
      expect(config.coordinates.lng).toBeLessThan(0); // US cities are negative longitude
      expect(config.minBusinesses).toBeGreaterThan(0);
    }
  });

  it("active cities have launch dates", () => {
    const active = Object.values(CITY_REGISTRY).filter(c => c.status === "active");
    for (const city of active) {
      expect(city.launchDate).toBeTruthy();
    }
  });
});

// ---------------------------------------------------------------------------
// 2. City helper functions
// ---------------------------------------------------------------------------
describe("City helper functions", () => {
  it("getActiveCities returns only active cities", () => {
    const active = getActiveCities();
    expect(active).toContain("Dallas");
    expect(active).toContain("Austin");
    expect(active).toContain("Houston");
    expect(active).not.toContain("Oklahoma City");
    expect(active.length).toBe(5);
  });

  it("getPlannedCities returns only planned cities", () => {
    const planned = getPlannedCities();
    expect(planned).not.toContain("Oklahoma City"); // Sprint 224: OKC promoted to beta
    expect(planned).not.toContain("New Orleans"); // Sprint 229: NOLA promoted to beta
    expect(planned).not.toContain("Memphis"); // Sprint 237: Memphis promoted to beta
    expect(planned).not.toContain("Nashville"); // Sprint 241: Nashville promoted to beta
    expect(planned).not.toContain("Dallas");
    expect(planned.length).toBe(0); // No planned cities remaining
  });

  it("getCityConfig returns config for known city", () => {
    const config = getCityConfig("Dallas");
    expect(config).toBeDefined();
    expect(config!.state).toBe("Texas");
  });

  it("getCityConfig returns undefined for unknown city", () => {
    expect(getCityConfig("Atlantis")).toBeUndefined();
  });

  it("isCityActive works correctly", () => {
    expect(isCityActive("Dallas")).toBe(true);
    expect(isCityActive("Oklahoma City")).toBe(false);
    expect(isCityActive("Unknown")).toBe(false);
  });

  it("getCityStats returns correct counts", () => {
    const stats = getCityStats();
    expect(stats.active).toBe(5);
    expect(stats.beta).toBe(4); // Sprint 224: OKC, Sprint 229: NOLA, Sprint 237: Memphis, Sprint 241: Nashville
    expect(stats.planned).toBe(0); // All planned cities promoted
    expect(stats.total).toBe(9);
  });
});

// ---------------------------------------------------------------------------
// 3. Alerting module
// ---------------------------------------------------------------------------
describe("Alerting module — server/alerting.ts", () => {
  it("module exists", () => {
    expect(fileExists("server/alerting.ts")).toBe(true);
  });

  it("fires an alert", () => {
    clearAlerts();
    const fired = fireAlert("health_check_failed", "Health endpoint returned 500", "critical");
    expect(fired).toBe(true);
  });

  it("respects cooldown", () => {
    clearAlerts();
    fireAlert("health_check_failed", "First alert", "critical");
    const secondFired = fireAlert("health_check_failed", "Second alert", "critical");
    expect(secondFired).toBe(false); // Should be in cooldown
  });

  it("stores alerts in memory", () => {
    clearAlerts();
    fireAlert("slow_response", "Avg response 600ms", "warning");
    const recent = getRecentAlerts();
    expect(recent.length).toBe(1);
    expect(recent[0].rule).toBe("slow_response");
    expect(recent[0].severity).toBe("warning");
  });

  it("tracks unacknowledged count", () => {
    clearAlerts();
    fireAlert("high_memory", "Heap at 550MB", "warning");
    expect(getUnacknowledgedCount()).toBe(1);
  });

  it("acknowledges alerts", () => {
    clearAlerts();
    fireAlert("high_error_rate", "Error rate 8%", "critical");
    const alerts = getRecentAlerts();
    const result = acknowledgeAlert(alerts[0].id);
    expect(result).toBe(true);
    expect(getUnacknowledgedCount()).toBe(0);
  });

  it("returns false for unknown alert ID", () => {
    expect(acknowledgeAlert("nonexistent")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 4. Alert rules and stats
// ---------------------------------------------------------------------------
describe("Alert rules and stats", () => {
  it("has 5 default rules", () => {
    const rules = getAlertRules();
    expect(rules.length).toBe(5);
  });

  it("default rules cover critical scenarios", () => {
    const ruleNames = DEFAULT_RULES.map(r => r.name);
    expect(ruleNames).toContain("health_check_failed");
    expect(ruleNames).toContain("high_error_rate");
    expect(ruleNames).toContain("slow_response");
    expect(ruleNames).toContain("high_memory");
    expect(ruleNames).toContain("rate_limit_spike");
  });

  it("all rules have cooldown defined", () => {
    for (const rule of DEFAULT_RULES) {
      expect(rule.cooldownMs).toBeGreaterThan(0);
    }
  });

  it("getAlertStats returns correct structure", () => {
    clearAlerts();
    fireAlert("slow_response", "Test", "warning");
    const stats = getAlertStats();
    expect(stats.total).toBe(1);
    expect(stats.bySeverity.warning).toBe(1);
    expect(stats.lastAlert).toBeTruthy();
  });

  it("clearAlerts resets state", () => {
    fireAlert("high_memory", "Test", "warning");
    clearAlerts();
    expect(getRecentAlerts().length).toBe(0);
    expect(getUnacknowledgedCount()).toBe(0);
  });
});
