/**
 * Rate Limiter Middleware — Sprint 105 / Refactored Sprint 110
 * Pluggable-store sliding window rate limiter per IP.
 * Default: in-memory store. Redis-ready via RateLimitStore interface.
 * Owner: Amir Patel (Architecture)
 */
import type { Request, Response, NextFunction } from "express";
import { log } from "./logger";

const rlLog = log.tag("RateLimiter");

// ---------------------------------------------------------------------------
// Store interface — implement this for Redis, DynamoDB, etc.
// ---------------------------------------------------------------------------

interface WindowEntry {
  count: number;
  resetAt: number;
}

export interface RateLimitStore {
  increment(key: string, windowMs: number): Promise<{ count: number; resetAt: number }>;
  cleanup?(): void;
}

// ---------------------------------------------------------------------------
// In-memory store (default)
// ---------------------------------------------------------------------------

class MemoryStore implements RateLimitStore {
  private windows = new Map<string, WindowEntry>();
  private cleanupTimer: ReturnType<typeof setInterval>;

  constructor() {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.windows) {
        if (now > entry.resetAt) this.windows.delete(key);
      }
    }, 60_000);
  }

  async increment(key: string, windowMs: number) {
    const now = Date.now();
    let entry = this.windows.get(key);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      this.windows.set(key, entry);
    }
    entry.count++;
    return { count: entry.count, resetAt: entry.resetAt };
  }

  cleanup() {
    clearInterval(this.cleanupTimer);
  }
}

// ---------------------------------------------------------------------------
// Redis store — Sprint 189: Live implementation
// ---------------------------------------------------------------------------
export class RedisStore implements RateLimitStore {
  constructor(private redisClient: any) {}
  async increment(key: string, windowMs: number) {
    const redisKey = `rl:${key}`;
    const count = await this.redisClient.incr(redisKey);
    if (count === 1) await this.redisClient.pexpire(redisKey, windowMs);
    const ttl = await this.redisClient.pttl(redisKey);
    return { count, resetAt: Date.now() + Math.max(ttl, 0) };
  }
}

// ---------------------------------------------------------------------------
// Shared default store — uses Redis if REDIS_URL is set, else in-memory
// ---------------------------------------------------------------------------

function createDefaultStore(): RateLimitStore {
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    try {
      const Redis = require("ioredis");
      const client = new Redis(redisUrl, { maxRetriesPerRequest: 1, connectTimeout: 3000, lazyConnect: true });
      client.connect().catch(() => {});
      rlLog.info("Using Redis rate-limit store");
      return new RedisStore(client);
    } catch {
      rlLog.info("Redis unavailable — falling back to memory rate-limit store");
    }
  }
  return new MemoryStore();
}

const defaultStore = createDefaultStore();

// ---------------------------------------------------------------------------
// Options & factory
// ---------------------------------------------------------------------------

export interface RateLimitOptions {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
  keyPrefix?: string;    // Prefix to isolate counters between limiters
  store?: RateLimitStore; // Pluggable backend (defaults to in-memory)
}

const DEFAULT_OPTIONS: Omit<RateLimitOptions, "store" | "keyPrefix"> = {
  windowMs: 60_000,    // 1 minute
  maxRequests: 100,     // 100 requests per minute
};

export function rateLimiter(options: Partial<RateLimitOptions> = {}) {
  const { windowMs, maxRequests } = { ...DEFAULT_OPTIONS, ...options };
  const store = options.store || defaultStore;
  const keyPrefix = options.keyPrefix || "global";

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();

    store.increment(key, windowMs).then(({ count, resetAt }) => {
      // Set rate limit headers
      res.setHeader("X-RateLimit-Limit", String(maxRequests));
      res.setHeader("X-RateLimit-Remaining", String(Math.max(0, maxRequests - count)));
      res.setHeader("X-RateLimit-Reset", String(Math.ceil(resetAt / 1000)));

      if (count > maxRequests) {
        rlLog.warn(`Rate limit exceeded for ${ip}: ${count}/${maxRequests}`);
        return res.status(429).json({
          error: "Too many requests. Please try again later.",
          retryAfter: Math.ceil((resetAt - now) / 1000),
        });
      }

      next();
    }).catch((err: unknown) => {
      // If store fails, allow request through (fail-open) but log
      rlLog.warn(`Rate limit store error: ${err}`);
      next();
    });
  };
}

/** Stricter rate limit for auth endpoints */
export const authRateLimiter = rateLimiter({ windowMs: 60_000, maxRequests: 10, keyPrefix: "auth" });

/** Standard API rate limit */
export const apiRateLimiter = rateLimiter({ windowMs: 60_000, maxRequests: 100, keyPrefix: "api" });

/** Payment routes — strict limit to prevent abuse (20 req/min per IP) */
export const paymentRateLimiter = rateLimiter({ windowMs: 60_000, maxRequests: 20, keyPrefix: "payments" });

/** Admin routes — moderate limit (30 req/min per IP) */
export const adminRateLimiter = rateLimiter({ windowMs: 60_000, maxRequests: 30, keyPrefix: "admin" });

/** Sprint 657: Claim verification — strict limit to prevent brute force (5 req/min per IP) */
export const claimVerifyRateLimiter = rateLimiter({ windowMs: 60_000, maxRequests: 5, keyPrefix: "claim-verify" });
