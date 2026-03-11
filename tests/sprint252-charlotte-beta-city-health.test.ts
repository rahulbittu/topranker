/**
 * Sprint 252 — Charlotte Beta Promotion + City Health Monitoring
 *
 * Validates:
 * 1. Charlotte promoted to beta in city-config (6 tests)
 * 2. City health monitor — static analysis (8 tests)
 * 3. City health monitor — runtime (10 tests)
 * 4. Admin health routes — static analysis (6 tests)
 * 5. Integration wiring (4 tests)
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  CITY_REGISTRY,
  getCityConfig,
  getBetaCities,
  getPlannedCities,
  getCityStats,
} from "../shared/city-config";
import {
  updateCityHealth,
  getCityHealth,
  getAllCityHealth,
  getHealthySummary,
  clearHealthData,
} from "../server/city-health-monitor";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. Charlotte beta promotion (6 tests)
// ---------------------------------------------------------------------------
describe("Charlotte beta promotion — shared/city-config.ts", () => {
  it("Charlotte exists in CITY_REGISTRY", () => {
    expect(CITY_REGISTRY["Charlotte"]).toBeDefined();
  });

  it("Charlotte status is beta", () => {
    const charlotte = getCityConfig("Charlotte");
    expect(charlotte).toBeDefined();
    expect(charlotte!.status).toBe("beta");
  });

  it("Charlotte has launchDate 2026-03-09", () => {
    const charlotte = getCityConfig("Charlotte");
    expect(charlotte!.launchDate).toBe("2026-03-09");
  });

  it("getBetaCities includes Charlotte", () => {
    const beta = getBetaCities();
    expect(beta).toContain("Charlotte");
  });

  it("getPlannedCities does not include Charlotte", () => {
    const planned = getPlannedCities();
    expect(planned).not.toContain("Charlotte");
    expect(planned).not.toContain("Raleigh"); // Sprint 256: promoted to beta
    expect(planned.length).toBe(0);
  });

  it("getCityStats shows 6 beta, 0 planned", () => {
    const stats = getCityStats();
    expect(stats.beta).toBe(6); // OKC, NOLA, Memphis, Nashville, Charlotte, Raleigh (Sprint 256)
    expect(stats.planned).toBe(0); // All promoted
    expect(stats.active).toBe(5);
    expect(stats.total).toBe(11);
  });
});

// ---------------------------------------------------------------------------
// 2. City health monitor — static analysis (8 tests)
// ---------------------------------------------------------------------------
describe("City health monitor — server/city-health-monitor.ts (static)", () => {
  it("module exists", () => {
    expect(fileExists("server/city-health-monitor.ts")).toBe(true);
  });

  const src = readFile("server/city-health-monitor.ts");

  it("exports updateCityHealth", () => {
    expect(src).toContain("export function updateCityHealth");
  });

  it("exports getCityHealth", () => {
    expect(src).toContain("export function getCityHealth");
  });

  it("exports getAllCityHealth", () => {
    expect(src).toContain("export function getAllCityHealth");
  });

  it("exports getHealthySummary", () => {
    expect(src).toContain("export function getHealthySummary");
  });

  it("exports clearHealthData", () => {
    expect(src).toContain("export function clearHealthData");
  });

  it("uses tagged logger: CityHealth", () => {
    expect(src).toContain('"CityHealth"');
  });

  it("imports from ./logger", () => {
    expect(src).toContain('from "./logger"');
  });
});

// ---------------------------------------------------------------------------
// 3. City health monitor — runtime (10 tests)
// ---------------------------------------------------------------------------
describe("City health monitor — runtime", () => {
  beforeEach(() => {
    clearHealthData();
  });

  it("updateCityHealth returns a CityHealthMetrics object", () => {
    const result = updateCityHealth("Dallas", {
      businessCount: 100,
      memberCount: 500,
      ratingCount: 2000,
      avgResponseTime: 50,
      errorRate: 0.5,
    });
    expect(result.city).toBe("Dallas");
    expect(result.businessCount).toBe(100);
    expect(result.lastChecked).toBeTruthy();
    expect(result.status).toBe("healthy");
  });

  it("updateCityHealth sets status healthy for errorRate <= 2", () => {
    const result = updateCityHealth("Dallas", {
      businessCount: 100,
      memberCount: 500,
      ratingCount: 2000,
      avgResponseTime: 50,
      errorRate: 1.5,
    });
    expect(result.status).toBe("healthy");
  });

  it("updateCityHealth sets status degraded for errorRate > 2 and <= 5", () => {
    const result = updateCityHealth("Dallas", {
      businessCount: 100,
      memberCount: 500,
      ratingCount: 2000,
      avgResponseTime: 50,
      errorRate: 3.5,
    });
    expect(result.status).toBe("degraded");
  });

  it("updateCityHealth sets status critical for errorRate > 5", () => {
    const result = updateCityHealth("Dallas", {
      businessCount: 100,
      memberCount: 500,
      ratingCount: 2000,
      avgResponseTime: 50,
      errorRate: 7.0,
    });
    expect(result.status).toBe("critical");
  });

  it("getCityHealth returns metrics for tracked city", () => {
    updateCityHealth("Austin", {
      businessCount: 80,
      memberCount: 400,
      ratingCount: 1500,
      avgResponseTime: 45,
      errorRate: 0.3,
    });
    const health = getCityHealth("Austin");
    expect(health).not.toBeNull();
    expect(health!.city).toBe("Austin");
    expect(health!.memberCount).toBe(400);
  });

  it("getCityHealth returns null for untracked city", () => {
    expect(getCityHealth("Atlantis")).toBeNull();
  });

  it("getAllCityHealth returns all tracked cities", () => {
    updateCityHealth("Dallas", {
      businessCount: 100,
      memberCount: 500,
      ratingCount: 2000,
      avgResponseTime: 50,
      errorRate: 0.5,
    });
    updateCityHealth("Austin", {
      businessCount: 80,
      memberCount: 400,
      ratingCount: 1500,
      avgResponseTime: 45,
      errorRate: 0.3,
    });
    const all = getAllCityHealth();
    expect(all.length).toBe(2);
  });

  it("getHealthySummary returns correct counts", () => {
    updateCityHealth("Dallas", {
      businessCount: 100,
      memberCount: 500,
      ratingCount: 2000,
      avgResponseTime: 50,
      errorRate: 0.5,
    });
    updateCityHealth("Austin", {
      businessCount: 80,
      memberCount: 400,
      ratingCount: 1500,
      avgResponseTime: 200,
      errorRate: 3.0,
    });
    updateCityHealth("Houston", {
      businessCount: 60,
      memberCount: 300,
      ratingCount: 1000,
      avgResponseTime: 500,
      errorRate: 8.0,
    });
    const summary = getHealthySummary();
    expect(summary.total).toBe(3);
    expect(summary.healthy).toBe(1);
    expect(summary.degraded).toBe(1);
    expect(summary.critical).toBe(1);
  });

  it("clearHealthData resets all health data", () => {
    updateCityHealth("Dallas", {
      businessCount: 100,
      memberCount: 500,
      ratingCount: 2000,
      avgResponseTime: 50,
      errorRate: 0.5,
    });
    clearHealthData();
    expect(getAllCityHealth().length).toBe(0);
    expect(getCityHealth("Dallas")).toBeNull();
  });

  it("updateCityHealth overwrites previous entry for same city", () => {
    updateCityHealth("Dallas", {
      businessCount: 100,
      memberCount: 500,
      ratingCount: 2000,
      avgResponseTime: 50,
      errorRate: 0.5,
    });
    updateCityHealth("Dallas", {
      businessCount: 110,
      memberCount: 550,
      ratingCount: 2100,
      avgResponseTime: 48,
      errorRate: 0.3,
    });
    const health = getCityHealth("Dallas");
    expect(health!.businessCount).toBe(110);
    expect(getAllCityHealth().length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// 4. Admin health routes — static analysis (6 tests)
// ---------------------------------------------------------------------------
describe("Admin health routes — server/routes-admin-health.ts (static)", () => {
  it("module exists", () => {
    expect(fileExists("server/routes-admin-health.ts")).toBe(true);
  });

  const src = readFile("server/routes-admin-health.ts");

  it("exports registerAdminHealthRoutes", () => {
    expect(src).toContain("export function registerAdminHealthRoutes");
  });

  it("has GET /api/admin/city-health endpoint", () => {
    expect(src).toContain('"/api/admin/city-health"');
  });

  it("has GET /api/admin/city-health/summary endpoint", () => {
    expect(src).toContain('"/api/admin/city-health/summary"');
  });

  it("has GET /api/admin/city-health/:city endpoint", () => {
    expect(src).toContain('"/api/admin/city-health/:city"');
  });

  it("imports from ./city-health-monitor", () => {
    expect(src).toContain('from "./city-health-monitor"');
  });
});

// ---------------------------------------------------------------------------
// 5. Integration wiring (4 tests)
// ---------------------------------------------------------------------------
describe("Integration — Sprint 252", () => {
  it("routes-admin.ts imports registerAdminHealthRoutes", () => {
    const src = readFile("server/routes-admin.ts");
    expect(src).toContain("registerAdminHealthRoutes");
  });

  it("routes-admin.ts calls registerAdminHealthRoutes(app)", () => {
    const src = readFile("server/routes-admin.ts");
    expect(src).toContain("registerAdminHealthRoutes(app)");
  });

  it("city-health-monitor imports from logger", () => {
    const src = readFile("server/city-health-monitor.ts");
    expect(src).toContain('from "./logger"');
  });

  it("Charlotte is in getBetaCities and city-config has 11 total", () => {
    const beta = getBetaCities();
    expect(beta).toContain("Charlotte");
    const stats = getCityStats();
    expect(stats.total).toBe(11);
  });
});
