/**
 * Sprint 189: Redis Cache Layer
 *
 * Provides a Redis client singleton + cache helpers for hot-path endpoints.
 * Fail-open: if Redis is unavailable, falls back to DB queries transparently.
 * Owner: Amir Patel (Architecture)
 */
import Redis from "ioredis";
import { log } from "./logger";

const redisLog = log.tag("Redis");

// ---------------------------------------------------------------------------
// Client singleton
// ---------------------------------------------------------------------------

let redis: Redis | null = null;
let redisChecked = false;

export function getRedisClient(): Redis | null {
  if (redis) return redis;
  if (redisChecked) return null; // Already checked, no Redis — don't log again
  const url = process.env.REDIS_URL;
  if (!url) {
    redisLog.info("REDIS_URL not set — caching disabled, using DB-only mode");
    redisChecked = true;
    return null;
  }
  try {
    redis = new Redis(url, {
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      lazyConnect: true,
      retryStrategy(times) {
        if (times > 3) return null; // stop retrying after 3 attempts
        return Math.min(times * 200, 1000);
      },
    });
    redis.on("error", (err) => redisLog.warn(`Redis error: ${err.message}`));
    redis.on("connect", () => redisLog.info("Redis connected"));
    redis.connect().catch(() => {
      redisLog.warn("Redis connect failed — running in DB-only mode");
      redis = null;
    });
    return redis;
  } catch {
    redisLog.warn("Redis init failed — running in DB-only mode");
    return null;
  }
}

// ---------------------------------------------------------------------------
// Cache helpers — fail-open on any Redis error
// ---------------------------------------------------------------------------

export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  if (!client) return null;
  try {
    const raw = await client.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  const client = getRedisClient();
  if (!client) return;
  try {
    await client.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
    // fail-open
  }
}

export async function cacheDel(...keys: string[]): Promise<void> {
  const client = getRedisClient();
  if (!client || keys.length === 0) return;
  try {
    await client.del(...keys);
  } catch {
    // fail-open
  }
}

export async function cacheDelPattern(pattern: string): Promise<void> {
  const client = getRedisClient();
  if (!client) return;
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) await client.del(...keys);
  } catch {
    // fail-open
  }
}

// ---------------------------------------------------------------------------
// Cache-aside helper — get from cache or compute + cache
// ---------------------------------------------------------------------------

export async function cacheAside<T>(
  key: string,
  ttlSeconds: number,
  compute: () => Promise<T>,
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) return cached;
  const result = await compute();
  await cacheSet(key, result, ttlSeconds);
  return result;
}

// ---------------------------------------------------------------------------
// Cache stats for admin dashboard
// ---------------------------------------------------------------------------

interface CacheStats {
  connected: boolean;
  hits: number;
  misses: number;
  hitRate: string;
}

let hits = 0;
let misses = 0;

export function trackCacheHit() { hits++; }
export function trackCacheMiss() { misses++; }

export function getCacheStats(): CacheStats {
  const total = hits + misses;
  return {
    connected: redis !== null,
    hits,
    misses,
    hitRate: total > 0 ? ((hits / total) * 100).toFixed(1) + "%" : "N/A",
  };
}
