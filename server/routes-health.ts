/**
 * Health and readiness routes — Sprint 804 extraction from routes.ts
 *
 * /_ready — Readiness probe for Railway/k8s (checks DB connectivity + latency)
 * /api/health — Public liveness (status, version, uptime only)
 * /api/health/diagnostics — Admin-gated full diagnostics (Sprint 812)
 *
 * Sprint 812: Split public liveness from internal diagnostics per external critique.
 * Memory stats, log counts, rate limiter windows, push stats, and environment
 * are sensitive internals that should not be on a public endpoint.
 */
import type { Express, Request, Response } from "express";
import { config } from "./config";
import { getLogStats } from "./logger";
import { getClientCount } from "./sse";
import { getRateLimitStats } from "./rate-limiter";

export function registerHealthRoutes(app: Express) {
  // Readiness probe — verifies database connectivity + response time
  app.get("/_ready", async (_req: Request, res: Response) => {
    try {
      const { pool } = await import("./db");
      const start = Date.now();
      await pool.query("SELECT 1");
      const dbLatencyMs = Date.now() - start;
      res.status(200).json({ status: "ready", db: "connected", dbLatencyMs });
    } catch {
      res.status(503).json({ status: "not_ready", db: "disconnected" });
    }
  });

  // Sprint 812: Public liveness — safe for load balancers and uptime monitors
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "healthy",
      version: "1.0.0",
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  });

  // Sprint 812: Admin-gated diagnostics — full internals behind auth
  app.get("/api/health/diagnostics", async (req: Request, res: Response) => {
    // Gate behind admin auth
    const { isAdminEmail } = await import("@shared/admin");
    if (!req.user || !isAdminEmail(req.user.email)) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const memUsage = process.memoryUsage();
    let pushStats = { totalTokens: 0, uniqueMembers: 0, messagesSent: 0, messagesFailed: 0 };
    try {
      const { getPushStats } = require("./push-notifications");
      pushStats = getPushStats();
    } catch { /* push module not available */ }

    res.json({
      status: "healthy",
      version: "1.0.0",
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      environment: config.nodeEnv,
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        rss: Math.round(memUsage.rss / 1024 / 1024),
      },
      push: pushStats,
      logs: getLogStats(),
      sseClients: getClientCount(),
      rateLimit: getRateLimitStats(),
    });
  });
}
