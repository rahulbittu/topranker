/**
 * Sprint 189 — Performance Optimization + Redis Caching
 *
 * Validates:
 * 1. Redis client module (connection, fail-open, helpers)
 * 2. Cache integration in hot-path storage functions
 * 3. Cache invalidation on writes (recalculateRanks)
 * 4. Redis rate limiter store
 * 5. Admin perf endpoint includes cache stats
 * 6. Cache-aside pattern implementation
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Redis client module
// ---------------------------------------------------------------------------
describe("Redis client — server/redis.ts", () => {
  const src = readFile("server/redis.ts");

  it("imports ioredis", () => {
    expect(src).toContain('import Redis from "ioredis"');
  });

  it("exports getRedisClient singleton", () => {
    expect(src).toContain("export function getRedisClient");
  });

  it("reads REDIS_URL via config", () => {
    expect(src).toContain("config.redisUrl");
  });

  it("handles missing REDIS_URL gracefully", () => {
    expect(src).toContain("caching disabled");
  });

  it("exports cacheGet", () => {
    expect(src).toContain("export async function cacheGet");
  });

  it("exports cacheSet with TTL", () => {
    expect(src).toContain("export async function cacheSet");
    expect(src).toContain("ttlSeconds");
  });

  it("exports cacheDel", () => {
    expect(src).toContain("export async function cacheDel");
  });

  it("exports cacheDelPattern for wildcard invalidation", () => {
    expect(src).toContain("export async function cacheDelPattern");
  });

  it("exports cacheAside helper", () => {
    expect(src).toContain("export async function cacheAside");
  });

  it("cacheAside computes on miss", () => {
    expect(src).toContain("const cached = await cacheGet");
    expect(src).toContain("const result = await compute()");
    expect(src).toContain("await cacheSet(key, result, ttlSeconds)");
  });

  it("fail-open on Redis errors (cacheGet)", () => {
    expect(src).toContain("} catch {");
    expect(src).toContain("return null");
  });

  it("exports getCacheStats for admin dashboard", () => {
    expect(src).toContain("export function getCacheStats");
  });

  it("tracks cache hits and misses", () => {
    expect(src).toContain("export function trackCacheHit");
    expect(src).toContain("export function trackCacheMiss");
  });

  it("computes hit rate percentage", () => {
    expect(src).toContain("hitRate");
  });

  it("sets connect timeout", () => {
    expect(src).toContain("connectTimeout: 3000");
  });

  it("limits retry attempts", () => {
    expect(src).toContain("maxRetriesPerRequest: 1");
  });

  it("uses lazy connect", () => {
    expect(src).toContain("lazyConnect: true");
  });
});

// ---------------------------------------------------------------------------
// 2. Cache integration in hot-path storage
// ---------------------------------------------------------------------------
describe("Cache integration — businesses.ts", () => {
  const src = readFile("server/storage/businesses.ts");

  it("imports cache functions from redis module", () => {
    expect(src).toContain('from "../redis"');
    expect(src).toContain("cacheAside");
  });

  it("caches getLeaderboard with city:category:cuisine key", () => {
    expect(src).toContain("leaderboard:${city}:${category}:");
  });

  it("getLeaderboard uses cacheAside", () => {
    expect(src).toContain("cacheAside(key, 300");
  });

  it("caches getTrendingBusinesses", () => {
    expect(src).toContain("`trending:${city}:${limit}`");
  });

  it("getTrendingBusinesses has 10-min TTL", () => {
    expect(src).toContain("cacheAside(key, 600");
  });

  it("caches getAllCategories", () => {
    expect(src).toContain("`categories:${city}`");
  });

  it("getAllCategories has 2-hour TTL", () => {
    expect(src).toContain("cacheAside(key, 7200");
  });

  it("caches getPopularCategories", () => {
    expect(src).toContain("`popular_categories:${city}:${limit}`");
  });

  it("getPopularCategories has 1-hour TTL", () => {
    expect(src).toContain("cacheAside(key, 3600");
  });

  it("tracks cache misses in compute functions", () => {
    expect(src).toContain("trackCacheMiss()");
  });
});

// ---------------------------------------------------------------------------
// 3. Cache invalidation on writes
// ---------------------------------------------------------------------------
describe("Cache invalidation — recalculateRanks", () => {
  const src = readFile("server/storage/businesses.ts");

  it("invalidates leaderboard cache after rank recalculation", () => {
    expect(src).toContain('cacheDelPattern(`leaderboard:${city}:*`)');
  });

  it("invalidates trending cache after rank recalculation", () => {
    expect(src).toContain('cacheDelPattern(`trending:${city}:*`)');
  });
});

// ---------------------------------------------------------------------------
// 4. Redis rate limiter store
// ---------------------------------------------------------------------------
describe("Redis rate limiter — rate-limiter.ts", () => {
  const src = readFile("server/rate-limiter.ts");

  it("exports RedisStore class implementing RateLimitStore", () => {
    expect(src).toContain("export class RedisStore implements RateLimitStore");
  });

  it("RedisStore uses INCR for atomic counting", () => {
    expect(src).toContain("this.redisClient.incr(redisKey)");
  });

  it("RedisStore sets PEXPIRE on first increment", () => {
    expect(src).toContain("this.redisClient.pexpire(redisKey, windowMs)");
  });

  it("RedisStore reads TTL for accurate reset time", () => {
    expect(src).toContain("this.redisClient.pttl(redisKey)");
  });

  it("auto-selects Redis store when REDIS_URL is set", () => {
    expect(src).toContain("config.redisUrl");
    expect(src).toContain("Using Redis rate-limit store");
  });

  it("falls back to MemoryStore when Redis unavailable", () => {
    expect(src).toContain("falling back to memory rate-limit store");
  });
});

// ---------------------------------------------------------------------------
// 5. Admin perf endpoint includes cache stats
// ---------------------------------------------------------------------------
describe("Admin perf — cache stats integration", () => {
  const src = readFile("server/routes-admin.ts");

  it("imports getCacheStats in perf endpoint", () => {
    expect(src).toContain('getCacheStats');
  });

  it("includes cache stats in perf response", () => {
    expect(src).toContain("cache: getCacheStats()");
  });
});

// ---------------------------------------------------------------------------
// 6. TTL values are reasonable
// ---------------------------------------------------------------------------
describe("Cache TTL policy", () => {
  const src = readFile("server/storage/businesses.ts");

  it("leaderboard TTL is 5 minutes (300s)", () => {
    expect(src).toMatch(/leaderboard.*300/s);
  });

  it("trending TTL is 10 minutes (600s)", () => {
    expect(src).toMatch(/trending.*600/s);
  });

  it("categories TTL is 2 hours (7200s)", () => {
    expect(src).toMatch(/categories.*7200/s);
  });

  it("popular categories TTL is 1 hour (3600s)", () => {
    expect(src).toMatch(/popular_categories.*3600/s);
  });
});
