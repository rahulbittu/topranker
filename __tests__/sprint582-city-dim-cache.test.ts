/**
 * Sprint 582: City Dimension Averages Caching
 *
 * Tests:
 * 1. Cache implementation in city-dimension-averages.ts
 * 2. Cache helper exports (getCacheSize, clearDimensionCache)
 * 3. TTL constant and eviction logic
 * 4. Cache key normalization (lowercase, trim)
 * 5. LOC thresholds
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 582: City Dimension Averages Cache", () => {
  const src = readFile("server/city-dimension-averages.ts");

  it("defines CACHE_TTL_MS constant at 5 minutes", () => {
    expect(src).toContain("CACHE_TTL_MS");
    expect(src).toContain("5 * 60 * 1000");
  });

  it("creates Map-based cache with TTL entries", () => {
    expect(src).toContain("new Map<string, { data: CityDimensionAverages; expiresAt: number }>");
  });

  it("exports getCacheSize function", () => {
    expect(src).toContain("export function getCacheSize");
    expect(src).toContain("cache.size");
  });

  it("exports clearDimensionCache function", () => {
    expect(src).toContain("export function clearDimensionCache");
    expect(src).toContain("cache.clear()");
  });

  it("normalizes cache key to lowercase trimmed", () => {
    expect(src).toContain("city.toLowerCase().trim()");
  });

  it("checks cache before querying database", () => {
    expect(src).toContain("cache.get(key)");
    expect(src).toContain("cached.expiresAt > now");
    expect(src).toContain("return cached.data");
  });

  it("sets cache after successful query", () => {
    expect(src).toContain("cache.set(key, { data: result, expiresAt: now + CACHE_TTL_MS })");
  });

  it("evicts stale entries when cache exceeds 50 cities", () => {
    expect(src).toContain("cache.size >= 50");
    expect(src).toContain("cache.delete(k)");
  });

  it("eviction checks expiresAt for staleness", () => {
    expect(src).toContain("v.expiresAt <= now");
  });

  it("still queries database on cache miss", () => {
    expect(src).toContain("db.select");
    expect(src).toContain("AVG(${ratings.foodScore})");
  });

  it("module LOC under 70", () => {
    const lines = src.split("\n").length;
    expect(lines).toBeLessThan(70);
  });
});

describe("Sprint 582: Route Still Works", () => {
  const src = readFile("server/routes-business-analytics.ts");

  it("still imports computeCityDimensionAverages", () => {
    expect(src).toContain("computeCityDimensionAverages");
  });

  it("endpoint unchanged", () => {
    expect(src).toContain("/api/cities/:city/dimension-averages");
  });
});
