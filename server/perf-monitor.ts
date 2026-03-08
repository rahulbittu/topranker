/**
 * Performance Monitor Middleware — Sprint 106
 * Tracks request duration and logs slow requests.
 * Owner: Amir Patel (Architecture)
 */
import type { Request, Response, NextFunction } from "express";
import { log } from "./logger";

const perfLog = log.tag("Perf");

const SLOW_THRESHOLD_MS = 500;

interface PerfStats {
  totalRequests: number;
  slowRequests: number;
  avgDurationMs: number;
  maxDurationMs: number;
  byRoute: Map<string, { count: number; totalMs: number; maxMs: number }>;
}

const stats: PerfStats = {
  totalRequests: 0,
  slowRequests: 0,
  avgDurationMs: 0,
  maxDurationMs: 0,
  byRoute: new Map(),
};

let totalDurationMs = 0;

export function perfMonitor(req: Request, res: Response, next: NextFunction) {
  const start = performance.now();

  res.on("finish", () => {
    const duration = performance.now() - start;
    const route = `${req.method} ${req.route?.path || req.path}`;

    // Update global stats
    stats.totalRequests++;
    totalDurationMs += duration;
    stats.avgDurationMs = totalDurationMs / stats.totalRequests;
    stats.maxDurationMs = Math.max(stats.maxDurationMs, duration);

    // Update per-route stats
    let routeStats = stats.byRoute.get(route);
    if (!routeStats) {
      routeStats = { count: 0, totalMs: 0, maxMs: 0 };
      stats.byRoute.set(route, routeStats);
    }
    routeStats.count++;
    routeStats.totalMs += duration;
    routeStats.maxMs = Math.max(routeStats.maxMs, duration);

    // Log slow requests
    if (duration > SLOW_THRESHOLD_MS) {
      stats.slowRequests++;
      perfLog.warn(`Slow request: ${route} took ${duration.toFixed(0)}ms`);
    }

    // Set Server-Timing header
    res.setHeader("Server-Timing", `total;dur=${duration.toFixed(1)}`);
  });

  next();
}

/** Get current performance stats (for admin endpoint) */
export function getPerfStats() {
  const routes = Array.from(stats.byRoute.entries())
    .map(([route, s]) => ({
      route,
      count: s.count,
      avgMs: Math.round(s.totalMs / s.count),
      maxMs: Math.round(s.maxMs),
    }))
    .sort((a, b) => b.maxMs - a.maxMs)
    .slice(0, 20);

  return {
    totalRequests: stats.totalRequests,
    slowRequests: stats.slowRequests,
    avgDurationMs: Math.round(stats.avgDurationMs),
    maxDurationMs: Math.round(stats.maxDurationMs),
    slowestRoutes: routes,
  };
}
