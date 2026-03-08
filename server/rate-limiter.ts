/**
 * Rate Limiter Middleware — Sprint 105
 * In-memory sliding window rate limiter per IP.
 * Owner: Amir Patel (Architecture)
 */
import type { Request, Response, NextFunction } from "express";
import { log } from "./logger";

const rlLog = log.tag("RateLimiter");

interface WindowEntry {
  count: number;
  resetAt: number;
}

const windows = new Map<string, WindowEntry>();

// Clean up expired entries every 60s
setInterval(() => {
  const now = Date.now();
  Array.from(windows.entries()).forEach(([key, entry]) => {
    if (now > entry.resetAt) windows.delete(key);
  });
}, 60_000);

export interface RateLimitOptions {
  windowMs: number;   // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

const DEFAULT_OPTIONS: RateLimitOptions = {
  windowMs: 60_000,   // 1 minute
  maxRequests: 100,    // 100 requests per minute
};

export function rateLimiter(options: Partial<RateLimitOptions> = {}) {
  const { windowMs, maxRequests } = { ...DEFAULT_OPTIONS, ...options };

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();

    let entry = windows.get(ip);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      windows.set(ip, entry);
    }

    entry.count++;

    // Set rate limit headers
    res.setHeader("X-RateLimit-Limit", String(maxRequests));
    res.setHeader("X-RateLimit-Remaining", String(Math.max(0, maxRequests - entry.count)));
    res.setHeader("X-RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > maxRequests) {
      rlLog.warn(`Rate limit exceeded for ${ip}: ${entry.count}/${maxRequests}`);
      return res.status(429).json({
        error: "Too many requests. Please try again later.",
        retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      });
    }

    next();
  };
}

/** Stricter rate limit for auth endpoints */
export const authRateLimiter = rateLimiter({ windowMs: 60_000, maxRequests: 10 });

/** Standard API rate limit */
export const apiRateLimiter = rateLimiter({ windowMs: 60_000, maxRequests: 100 });
