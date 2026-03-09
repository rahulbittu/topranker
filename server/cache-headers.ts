/**
 * Sprint 194: HTTP Cache Headers Middleware
 *
 * Adds Cache-Control headers to cacheable API responses.
 * Enables CDN edge caching for public, read-only endpoints.
 * Owner: Amir Patel (Architecture)
 */
import type { Request, Response, NextFunction } from "express";

interface CacheConfig {
  public: boolean;
  maxAge: number;       // seconds
  staleWhileRevalidate?: number; // seconds
}

const CACHE_RULES: Record<string, CacheConfig> = {
  "/api/leaderboard": { public: true, maxAge: 300, staleWhileRevalidate: 60 },
  "/api/trending": { public: true, maxAge: 600, staleWhileRevalidate: 120 },
  "/api/leaderboard/categories": { public: true, maxAge: 7200 },
  "/api/businesses/popular-categories": { public: true, maxAge: 3600 },
  "/api/businesses/autocomplete": { public: true, maxAge: 30 },
  "/api/businesses/search": { public: true, maxAge: 30 },
  "/api/featured": { public: true, maxAge: 300 },
  "/api/health": { public: true, maxAge: 10 },
  "/api/referrals/validate": { public: true, maxAge: 60 },
};

export function cacheHeaders(req: Request, res: Response, next: NextFunction): void {
  // Only cache GET requests
  if (req.method !== "GET") {
    res.setHeader("Cache-Control", "no-store");
    return next();
  }

  // Match path without query params
  const path = req.path;
  const config = CACHE_RULES[path];

  if (config) {
    const parts: string[] = [];
    parts.push(config.public ? "public" : "private");
    parts.push(`max-age=${config.maxAge}`);
    if (config.staleWhileRevalidate) {
      parts.push(`stale-while-revalidate=${config.staleWhileRevalidate}`);
    }
    res.setHeader("Cache-Control", parts.join(", "));
  } else if (path.startsWith("/api/")) {
    // Default: no cache for API endpoints (auth-dependent, dynamic)
    res.setHeader("Cache-Control", "private, no-cache");
  }

  next();
}

/** Static assets: long cache with immutable for hashed filenames */
export function staticCacheHeaders(maxAgeDays: number = 365) {
  const maxAge = maxAgeDays * 86400;
  return (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader("Cache-Control", `public, max-age=${maxAge}, immutable`);
    next();
  };
}

/** Export cache rules for testing */
export function getCacheRules(): Record<string, CacheConfig> {
  return { ...CACHE_RULES };
}
