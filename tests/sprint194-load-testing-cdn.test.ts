/**
 * Sprint 194 — Load Testing + CDN Configuration
 *
 * Validates:
 * 1. Load test script exists and is well-structured
 * 2. Cache headers middleware
 * 3. Cache header rules for key endpoints
 * 4. Server integrates cache headers middleware
 * 5. Static asset cache configuration
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Load test script
// ---------------------------------------------------------------------------
describe("Load test — scripts/load-test.ts", () => {
  const src = readFile("scripts/load-test.ts");

  it("exists and has endpoint configuration", () => {
    expect(src).toContain("ENDPOINTS");
    expect(src).toContain("EndpointConfig");
  });

  it("tests leaderboard endpoint", () => {
    expect(src).toContain("/api/leaderboard");
  });

  it("tests search endpoint", () => {
    expect(src).toContain("/api/businesses/search");
  });

  it("tests autocomplete endpoint", () => {
    expect(src).toContain("/api/businesses/autocomplete");
  });

  it("tests trending endpoint", () => {
    expect(src).toContain("/api/trending");
  });

  it("measures latency", () => {
    expect(src).toContain("latencyMs");
    expect(src).toContain("performance.now()");
  });

  it("calculates percentiles", () => {
    expect(src).toContain("function percentile");
    expect(src).toContain("P50");
    expect(src).toContain("P95");
    expect(src).toContain("P99");
  });

  it("reports requests per second", () => {
    expect(src).toContain("Requests/sec");
  });

  it("reports error rate", () => {
    expect(src).toContain("Error Rate");
  });

  it("has pass/fail criteria", () => {
    expect(src).toContain("VERDICT");
    expect(src).toContain("PASS");
    expect(src).toContain("FAIL");
  });

  it("supports configurable concurrency", () => {
    expect(src).toContain("CONCURRENCY");
  });

  it("supports configurable duration", () => {
    expect(src).toContain("DURATION_MS");
  });

  it("uses weighted endpoint selection", () => {
    expect(src).toContain("weight:");
    expect(src).toContain("pickEndpoint");
  });

  it("has per-endpoint breakdown", () => {
    expect(src).toContain("Per-Endpoint Breakdown");
  });
});

// ---------------------------------------------------------------------------
// 2. Cache headers middleware
// ---------------------------------------------------------------------------
describe("Cache headers — server/cache-headers.ts", () => {
  const src = readFile("server/cache-headers.ts");

  it("exports cacheHeaders middleware", () => {
    expect(src).toContain("export function cacheHeaders");
  });

  it("only caches GET requests", () => {
    expect(src).toContain('req.method !== "GET"');
    expect(src).toContain("no-store");
  });

  it("exports staticCacheHeaders for assets", () => {
    expect(src).toContain("export function staticCacheHeaders");
  });

  it("exports getCacheRules for testing", () => {
    expect(src).toContain("export function getCacheRules");
  });

  it("sets public cache for leaderboard", () => {
    expect(src).toContain('"/api/leaderboard"');
    expect(src).toContain("public: true");
  });

  it("uses stale-while-revalidate for leaderboard", () => {
    expect(src).toContain("staleWhileRevalidate");
  });

  it("defaults to no-cache for unconfigured API routes", () => {
    expect(src).toContain("private, no-cache");
  });

  it("static assets use immutable directive", () => {
    expect(src).toContain("immutable");
  });
});

// ---------------------------------------------------------------------------
// 3. Cache rules for key endpoints
// ---------------------------------------------------------------------------
describe("Cache rules — endpoint configuration", () => {
  const src = readFile("server/cache-headers.ts");

  it("configures /api/leaderboard (5 min)", () => {
    expect(src).toContain('"/api/leaderboard": { public: true, maxAge: 300');
  });

  it("configures /api/trending (10 min)", () => {
    expect(src).toContain('"/api/trending": { public: true, maxAge: 600');
  });

  it("configures /api/leaderboard/categories (2 hr)", () => {
    expect(src).toContain('"/api/leaderboard/categories": { public: true, maxAge: 7200');
  });

  it("configures /api/businesses/popular-categories (1 hr)", () => {
    expect(src).toContain('"/api/businesses/popular-categories": { public: true, maxAge: 3600');
  });

  it("configures /api/businesses/autocomplete (30s)", () => {
    expect(src).toContain('"/api/businesses/autocomplete": { public: true, maxAge: 30');
  });

  it("configures /api/businesses/search (30s)", () => {
    expect(src).toContain('"/api/businesses/search": { public: true, maxAge: 30');
  });

  it("configures /api/featured (5 min)", () => {
    expect(src).toContain('"/api/featured": { public: true, maxAge: 300');
  });

  it("configures /api/health (10s)", () => {
    expect(src).toContain('"/api/health": { public: true, maxAge: 10');
  });
});

// ---------------------------------------------------------------------------
// 4. Server integration
// ---------------------------------------------------------------------------
describe("Server — cache headers integration", () => {
  const src = readFile("server/index.ts");

  it("imports cacheHeaders", () => {
    expect(src).toContain('import { cacheHeaders } from "./cache-headers"');
  });

  it("uses cacheHeaders middleware", () => {
    expect(src).toContain("app.use(cacheHeaders)");
  });
});
