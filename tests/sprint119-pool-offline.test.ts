import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// ── Connection Pool Module ──────────────────────────────────────────
describe("Sprint 119 — Connection Pool Module", () => {
  const poolPath = path.resolve(__dirname, "..", "server", "db-pool.ts");
  const poolSource = fs.readFileSync(poolPath, "utf-8");

  it("server/db-pool.ts exists", () => {
    expect(fs.existsSync(poolPath)).toBe(true);
  });

  it("exports PoolConfig interface", () => {
    expect(poolSource).toContain("export interface PoolConfig");
  });

  it("PoolConfig includes maxConnections", () => {
    expect(poolSource).toContain("maxConnections");
  });

  it("PoolConfig includes idleTimeoutMs", () => {
    expect(poolSource).toContain("idleTimeoutMs");
  });

  it("PoolConfig includes acquireTimeoutMs", () => {
    expect(poolSource).toContain("acquireTimeoutMs");
  });

  it("exports DEFAULT_POOL_CONFIG with maxConnections 10", () => {
    expect(poolSource).toContain("export const DEFAULT_POOL_CONFIG");
    expect(poolSource).toMatch(/maxConnections:\s*10/);
  });

  it("DEFAULT_POOL_CONFIG has idleTimeoutMs 30000", () => {
    expect(poolSource).toMatch(/idleTimeoutMs:\s*30000/);
  });

  it("DEFAULT_POOL_CONFIG has acquireTimeoutMs 5000", () => {
    expect(poolSource).toMatch(/acquireTimeoutMs:\s*5000/);
  });

  it("exports ConnectionPool class", () => {
    expect(poolSource).toContain("export class ConnectionPool");
  });

  it("ConnectionPool has getStats method", () => {
    expect(poolSource).toContain("getStats()");
  });

  it("getStats returns active, idle, waiting, total", () => {
    expect(poolSource).toContain("active:");
    expect(poolSource).toContain("idle:");
    expect(poolSource).toContain("waiting:");
    expect(poolSource).toContain("total:");
  });

  it("ConnectionPool has drain method", () => {
    expect(poolSource).toContain("drain()");
  });

  it("ConnectionPool has isHealthy method", () => {
    expect(poolSource).toContain("isHealthy()");
  });

  it("exports createPool function", () => {
    expect(poolSource).toContain("export function createPool");
  });

  it("createPool accepts optional Partial<PoolConfig>", () => {
    expect(poolSource).toContain("Partial<PoolConfig>");
  });
});

// ── Offline Sync Module ─────────────────────────────────────────────
describe("Sprint 119 — Offline Sync Module", () => {
  const syncPath = path.resolve(__dirname, "..", "lib", "offline-sync.ts");
  const syncSource = fs.readFileSync(syncPath, "utf-8");

  it("lib/offline-sync.ts exists", () => {
    expect(fs.existsSync(syncPath)).toBe(true);
  });

  it("exports SyncAction interface", () => {
    expect(syncSource).toContain("export interface SyncAction");
  });

  it("SyncAction includes id, type, endpoint, payload, createdAt, retryCount", () => {
    expect(syncSource).toContain("id: string");
    expect(syncSource).toMatch(/type:\s*"create"\s*\|\s*"update"\s*\|\s*"delete"/);
    expect(syncSource).toContain("endpoint: string");
    expect(syncSource).toContain("payload: unknown");
    expect(syncSource).toContain("createdAt: number");
    expect(syncSource).toContain("retryCount: number");
  });

  it("exports queueAction function", () => {
    expect(syncSource).toContain("export function queueAction");
  });

  it("exports getPendingActions function", () => {
    expect(syncSource).toContain("export function getPendingActions");
  });

  it("exports markCompleted function", () => {
    expect(syncSource).toContain("export function markCompleted");
  });

  it("exports markFailed function", () => {
    expect(syncSource).toContain("export function markFailed");
  });

  it("markFailed increments retryCount", () => {
    expect(syncSource).toContain("retryCount");
    expect(syncSource).toMatch(/retryCount\s*\+=\s*1/);
  });

  it("exports clearCompletedActions function", () => {
    expect(syncSource).toContain("export function clearCompletedActions");
  });

  it("exports MAX_RETRIES = 3", () => {
    expect(syncSource).toContain("export const MAX_RETRIES = 3");
  });

  it("uses in-memory Map storage", () => {
    expect(syncSource).toContain("new Map");
  });

  it("generates IDs with Date.now and Math.random toString(36)", () => {
    expect(syncSource).toContain("Date.now()");
    expect(syncSource).toContain("Math.random().toString(36)");
  });
});

// ── Health Check Enhancement ────────────────────────────────────────
describe("Sprint 119 — Health Check Enhancement", () => {
  // Sprint 804: Health routes extracted to routes-health.ts
  const routesPath = path.resolve(__dirname, "..", "server", "routes-health.ts");
  const routesSource = fs.readFileSync(routesPath, "utf-8");

  it("public health endpoint includes process.uptime", () => {
    expect(routesSource).toContain("process.uptime()");
  });

  // Sprint 812: Memory/nodeVersion moved to admin-gated /api/health/diagnostics
  it("diagnostics endpoint includes process.memoryUsage", () => {
    expect(routesSource).toContain("process.memoryUsage()");
  });

  it("diagnostics endpoint includes process.version (nodeVersion)", () => {
    expect(routesSource).toContain("process.version");
    expect(routesSource).toContain("nodeVersion");
  });

  it("diagnostics endpoint is admin-gated", () => {
    expect(routesSource).toContain("isAdminEmail");
    expect(routesSource).toContain("/api/health/diagnostics");
  });
});

// ── API Versioning Documentation ────────────────────────────────────
describe("Sprint 119 — API Versioning Documentation", () => {
  const docPath = path.resolve(__dirname, "..", "docs", "API-VERSIONING.md");
  const docSource = fs.readFileSync(docPath, "utf-8");

  it("docs/API-VERSIONING.md exists", () => {
    expect(fs.existsSync(docPath)).toBe(true);
  });

  it("documents X-API-Version header", () => {
    expect(docSource).toContain("X-API-Version");
  });

  it("documents current version 1.0.0", () => {
    expect(docSource).toContain("1.0.0");
  });

  it("documents deprecation policy", () => {
    expect(docSource.toLowerCase()).toContain("deprecation");
  });

  it("documents sunset header", () => {
    expect(docSource).toContain("Sunset");
    expect(docSource.toLowerCase()).toContain("sunset");
  });

  it("documents breaking change process", () => {
    expect(docSource.toLowerCase()).toContain("breaking change");
  });

  it("documents non-breaking changes", () => {
    expect(docSource.toLowerCase()).toContain("non-breaking");
  });

  it("mentions header-based versioning strategy", () => {
    expect(docSource.toLowerCase()).toContain("header-based");
  });

  it("specifies 6-month deprecation notice", () => {
    expect(docSource).toContain("6-month");
  });
});
