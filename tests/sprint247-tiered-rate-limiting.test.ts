/**
 * Sprint 247 — API Rate Limiting Per Tier (Free/Pro/Enterprise)
 *
 * Validates:
 * 1. Tiered rate limiter module (server/tiered-rate-limiter.ts) — static + runtime
 * 2. Admin tier limit routes (server/routes-admin-tier-limits.ts) — static
 * 3. Integration wiring (routes.ts)
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  checkRateLimit,
  getUsage,
  getTierLimits,
  getAllTierLimits,
  getUsageStats,
  clearUsage,
  TIER_LIMITS,
  MAX_TRACKED,
} from "../server/tiered-rate-limiter";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. Tiered Rate Limiter — Static Analysis
// ---------------------------------------------------------------------------
describe("Tiered rate limiter — static analysis", () => {
  const src = readFile("server/tiered-rate-limiter.ts");

  it("file exists", () => {
    expect(fileExists("server/tiered-rate-limiter.ts")).toBe(true);
  });

  it("exports checkRateLimit function", () => {
    expect(src).toContain("export function checkRateLimit");
  });

  it("exports getUsage function", () => {
    expect(src).toContain("export function getUsage");
  });

  it("exports getTierLimits function", () => {
    expect(src).toContain("export function getTierLimits");
  });

  it("exports getAllTierLimits function", () => {
    expect(src).toContain("export function getAllTierLimits");
  });

  it("exports getUsageStats function", () => {
    expect(src).toContain("export function getUsageStats");
  });

  it("exports clearUsage function", () => {
    expect(src).toContain("export function clearUsage");
  });

  it("defines all 4 tiers (free, pro, enterprise, admin)", () => {
    expect(src).toContain('"free"');
    expect(src).toContain('"pro"');
    expect(src).toContain('"enterprise"');
    expect(src).toContain('"admin"');
  });

  it("TIER_LIMITS has entries for all 4 tiers", () => {
    expect(src).toMatch(/free:\s*\{/);
    expect(src).toMatch(/pro:\s*\{/);
    expect(src).toMatch(/enterprise:\s*\{/);
    expect(src).toMatch(/admin:\s*\{/);
  });

  it("MAX_TRACKED is 10000", () => {
    expect(src).toContain("MAX_TRACKED = 10000");
  });

  it("uses structured logger", () => {
    expect(src).toContain('log.tag("TieredRateLimit")');
  });
});

// ---------------------------------------------------------------------------
// 2. Tiered Rate Limiter — Runtime
// ---------------------------------------------------------------------------
describe("Tiered rate limiter — runtime", () => {
  beforeEach(() => {
    clearUsage();
  });

  it("checkRateLimit allows initial request", () => {
    const result = checkRateLimit("user-1", "free");
    expect(result.allowed).toBe(true);
  });

  it("checkRateLimit returns remaining count", () => {
    const result = checkRateLimit("user-2", "free");
    expect(result.remaining).toBe(29); // 30 - 1
  });

  it("checkRateLimit returns resetIn as positive number", () => {
    const result = checkRateLimit("user-3", "free");
    expect(result.resetIn).toBeGreaterThan(0);
  });

  it("checkRateLimit returns the minute limit", () => {
    const result = checkRateLimit("user-4", "free");
    expect(result.limit).toBe(30);
  });

  it("checkRateLimit blocks after minute limit exceeded (free tier)", () => {
    for (let i = 0; i < 30; i++) {
      checkRateLimit("user-flood", "free");
    }
    const blocked = checkRateLimit("user-flood", "free");
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("different tiers have different limits", () => {
    const freeResult = checkRateLimit("free-user", "free");
    const proResult = checkRateLimit("pro-user", "pro");
    expect(freeResult.limit).toBe(30);
    expect(proResult.limit).toBe(120);
  });

  it("getUsage returns record after check", () => {
    checkRateLimit("tracked-user", "pro");
    const record = getUsage("tracked-user");
    expect(record).not.toBeNull();
    expect(record!.tier).toBe("pro");
    expect(record!.minuteCount).toBe(1);
  });

  it("getUsage returns null for unknown key", () => {
    const record = getUsage("nonexistent-user");
    expect(record).toBeNull();
  });

  it("getTierLimits returns copy (not reference)", () => {
    const limits1 = getTierLimits("free");
    const limits2 = getTierLimits("free");
    expect(limits1).toEqual(limits2);
    expect(limits1).not.toBe(limits2);
  });

  it("getAllTierLimits returns all 4 tiers", () => {
    const all = getAllTierLimits();
    expect(Object.keys(all)).toHaveLength(4);
    expect(all).toHaveProperty("free");
    expect(all).toHaveProperty("pro");
    expect(all).toHaveProperty("enterprise");
    expect(all).toHaveProperty("admin");
  });

  it("getUsageStats returns correct structure", () => {
    checkRateLimit("stat-user-1", "free");
    checkRateLimit("stat-user-2", "pro");
    const stats = getUsageStats();
    expect(stats.totalTracked).toBe(2);
    expect(stats.byTier.free).toBe(1);
    expect(stats.byTier.pro).toBe(1);
  });

  it("clearUsage empties the store", () => {
    checkRateLimit("clear-user", "free");
    expect(getUsageStats().totalTracked).toBe(1);
    clearUsage();
    expect(getUsageStats().totalTracked).toBe(0);
  });

  it("pro tier allows more than free tier", () => {
    // Free blocks at 31, pro should still allow at 31
    for (let i = 0; i < 30; i++) {
      checkRateLimit("pro-generous", "pro");
    }
    const result = checkRateLimit("pro-generous", "pro");
    expect(result.allowed).toBe(true);
  });

  it("enterprise allows more than pro", () => {
    // Pro blocks at 121, enterprise should still allow at 121
    for (let i = 0; i < 120; i++) {
      checkRateLimit("ent-generous", "enterprise");
    }
    const result = checkRateLimit("ent-generous", "enterprise");
    expect(result.allowed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. Admin Tier Limit Routes — Static Analysis
// ---------------------------------------------------------------------------
describe("Admin tier limit routes — static analysis", () => {
  const src = readFile("server/routes-admin-tier-limits.ts");

  it("file exists", () => {
    expect(fileExists("server/routes-admin-tier-limits.ts")).toBe(true);
  });

  it("exports registerAdminTierLimitRoutes", () => {
    expect(src).toContain("export function registerAdminTierLimitRoutes");
  });

  it("defines GET /api/admin/tier-limits endpoint", () => {
    expect(src).toContain("/api/admin/tier-limits");
  });

  it("defines GET /api/admin/tier-limits/:tier endpoint", () => {
    expect(src).toContain("/api/admin/tier-limits/:tier");
  });

  it("defines GET /api/admin/tier-limits/usage/stats endpoint", () => {
    expect(src).toContain("/api/admin/tier-limits/usage/stats");
  });

  it("defines GET /api/admin/tier-limits/usage/:key endpoint", () => {
    expect(src).toContain("/api/admin/tier-limits/usage/:key");
  });
});

// ---------------------------------------------------------------------------
// 4. Integration — Wiring
// ---------------------------------------------------------------------------
describe("Integration — routes-admin.ts wiring", () => {
  const adminSrc = readFile("server/routes-admin.ts");

  it("imports registerAdminTierLimitRoutes", () => {
    expect(adminSrc).toContain('import { registerAdminTierLimitRoutes } from "./routes-admin-tier-limits"');
  });

  it("calls registerAdminTierLimitRoutes(app)", () => {
    expect(adminSrc).toContain("registerAdminTierLimitRoutes(app)");
  });

  it("tiered-rate-limiter.ts imports logger", () => {
    const limiterSrc = readFile("server/tiered-rate-limiter.ts");
    expect(limiterSrc).toContain('import { log } from "./logger"');
  });

  it("routes-admin-tier-limits.ts imports from tiered-rate-limiter", () => {
    const adminSrc = readFile("server/routes-admin-tier-limits.ts");
    expect(adminSrc).toContain('from "./tiered-rate-limiter"');
  });
});
