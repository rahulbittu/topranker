/**
 * Admin routes — extracted from routes.ts per Arch Audit H1 recommendation.
 * All endpoints under /api/admin/* require authentication + admin email check.
 */
import type { Express, Request, Response } from "express";
import { isAdminEmail } from "@shared/admin";
import { sanitizeString } from "./sanitize";
import {
  getPendingClaims,
  reviewClaim,
  getClaimCount,
  getPendingFlags,
  reviewFlag,
  getFlagCount,
  getAdminMemberList,
  getMemberCount,
  getBusinessesWithoutPhotos,
  getRecentWebhookEvents,
  getWebhookEventById,
  markWebhookProcessed,
} from "./storage";
import { fetchAndStorePhotos } from "./google-places";
import { getPerfStats } from "./perf-monitor";
import { getFunnelStats, getRecentEvents } from "./analytics";
import { getRequestLogs } from "./request-logger";
import { getRecentErrors } from "../lib/error-reporting";
import { getAllFlags } from "../lib/feature-flags";
import { CATEGORY_CONFIDENCE_THRESHOLDS, DEFAULT_THRESHOLDS } from "../lib/data";
import { adminRateLimiter } from "./rate-limiter";
import { wrapAsync } from "./wrap-async";

function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

function requireAdmin(req: Request, res: Response, next: Function) {
  if (!isAdminEmail(req.user?.email)) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

export function registerAdminRoutes(app: Express) {
  // Apply rate limiting to all admin routes (30 req/min per IP)
  app.use("/api/admin", adminRateLimiter);
  // ── Category Suggestions ─────────────────────────────────
  app.patch("/api/admin/category-suggestions/:id", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
      const { status } = req.body;
      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Status must be 'approved' or 'rejected'" });
      }
      const { reviewSuggestion } = await import("./storage");
      const updated = await reviewSuggestion(req.params.id as string, status, req.user!.id);
      if (!updated) {
        return res.status(404).json({ error: "Suggestion not found" });
      }
      return res.json({ data: updated });
  }));

  // ── Seed Cities ──────────────────────────────────────────
  app.post("/api/admin/seed-cities", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
      const { seedCities } = await import("./seed-cities");
      await seedCities();
      return res.json({ data: { message: "Cities seeded successfully" } });
  }));

  // ── Google Places Photo Fetching ─────────────────────────
  app.post("/api/admin/fetch-photos", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
      const city = sanitizeString(req.body.city, 100) || undefined;
      const limit = Math.min(50, parseInt(req.body.limit as string) || 20);
      const businesses = await getBusinessesWithoutPhotos(city, limit);

      if (businesses.length === 0) {
        return res.json({ data: { message: "All businesses already have photos", fetched: 0 } });
      }

      let totalFetched = 0;
      const results: { name: string; photos: number }[] = [];
      for (const biz of businesses) {
        const count = await fetchAndStorePhotos(biz.id, biz.googlePlaceId);
        totalFetched += count;
        results.push({ name: biz.name, photos: count });
      }

      return res.json({
        data: {
          message: `Fetched photos for ${businesses.length} businesses`,
          fetched: totalFetched,
          results,
        },
      });
  }));

  // ── Claims ───────────────────────────────────────────────
  app.get("/api/admin/claims", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
      const data = await getPendingClaims();
      return res.json({ data });
  }));

  app.patch("/api/admin/claims/:id", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
      const { status } = req.body;
      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Status must be 'approved' or 'rejected'" });
      }
      const updated = await reviewClaim(req.params.id as string, status, req.user!.id);
      if (!updated) return res.status(404).json({ error: "Claim not found" });
      return res.json({ data: updated });
  }));

  app.get("/api/admin/claims/count", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
      const count = await getClaimCount();
      return res.json({ data: { count } });
  }));

  // ── Flags ────────────────────────────────────────────────
  app.get("/api/admin/flags", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
      const data = await getPendingFlags();
      return res.json({ data });
  }));

  app.patch("/api/admin/flags/:id", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
      const { status } = req.body;
      if (!["confirmed", "dismissed"].includes(status)) {
        return res.status(400).json({ error: "Status must be 'confirmed' or 'dismissed'" });
      }
      const updated = await reviewFlag(req.params.id as string, status, req.user!.id);
      if (!updated) return res.status(404).json({ error: "Flag not found" });
      return res.json({ data: updated });
  }));

  app.get("/api/admin/flags/count", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
      const count = await getFlagCount();
      return res.json({ data: { count } });
  }));

  // ── Members ──────────────────────────────────────────────
  app.get("/api/admin/members", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
      const data = await getAdminMemberList(limit);
      return res.json({ data });
  }));

  app.get("/api/admin/members/count", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
      const count = await getMemberCount();
      return res.json({ data: { count } });
  }));

  // ── Webhook Events ──────────────────────────────────────────
  app.get("/api/admin/webhooks", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
      const source = sanitizeString(req.query.source, 50) || "stripe";
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
      const events = await getRecentWebhookEvents(source, limit);
      return res.json({ data: events });
  }));

  app.post("/api/admin/webhooks/:id/replay", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
      const event = await getWebhookEventById(req.params.id);
      if (!event) return res.status(404).json({ error: "Webhook event not found" });

      // Re-process the webhook by importing and calling the handler
      const { processStripeEvent } = await import("./stripe-webhook");
      if (event.source === "stripe" && event.payload) {
        await processStripeEvent(event.payload as any);
        await markWebhookProcessed(event.id);
        return res.json({ data: { id: event.id, replayed: true } });
      }
      return res.status(400).json({ error: `Unsupported webhook source: ${event.source}` });
  }));

  // ── Performance Stats ─────────────────────────────────────
  app.get("/api/admin/perf", requireAuth, requireAdmin, wrapAsync(async (_req: Request, res: Response) => {
      const data = getPerfStats();
      return res.json({ data });
  }));

  // ── Revenue Metrics ──────────────────────────────────────
  app.get("/api/admin/revenue", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
      const { getRevenueMetrics } = await import("./storage");
      const metrics = await getRevenueMetrics();
      return res.json({ data: metrics });
  }));

  // ── Analytics / Conversion Funnel ───────────────────────
  app.get("/api/admin/analytics", requireAuth, requireAdmin, wrapAsync(async (_req: Request, res: Response) => {
      const data = {
        funnel: getFunnelStats(),
        recentEvents: getRecentEvents(20),
      };
      return res.json({ data });
  }));

  // ── Analytics Dashboard ──────────────────────────────────
  app.get("/api/admin/analytics/dashboard", requireAuth, requireAdmin, wrapAsync(async (_req: Request, res: Response) => {
      const stats = getFunnelStats();
      const recent = getRecentEvents(50);

      // Calculate conversion rates
      const signups = (stats.signup_completed || 0);
      const pageViews = (stats.page_view || 0);
      const firstRatings = (stats.first_rating || 0);
      const challengerEntries = (stats.challenger_entered || 0);
      const dashboardSubs = (stats.dashboard_pro_subscribed || 0);

      const dashboard = {
        overview: {
          totalEvents: Object.values(stats).reduce((a, b) => a + b, 0),
          uniqueEventTypes: Object.keys(stats).length,
        },
        funnel: {
          pageViews,
          signups,
          firstRatings,
          challengerEntries,
          dashboardSubs,
          signupRate: pageViews > 0 ? ((signups / pageViews) * 100).toFixed(1) + "%" : "N/A",
          ratingRate: signups > 0 ? ((firstRatings / signups) * 100).toFixed(1) + "%" : "N/A",
        },
        recentActivity: recent.slice(0, 10),
        generatedAt: new Date().toISOString(),
      };

      return res.json({ data: dashboard });
  }));

  // ── Server Metrics — Sprint 123 ─────────────────────────
  app.get("/api/admin/metrics", requireAuth, requireAdmin, wrapAsync(async (_req: Request, res: Response) => {
      const uptime = process.uptime();
      const memoryUsage = process.memoryUsage().heapUsed;
      const nodeVersion = process.version;
      const requestCount = getRequestLogs().length;
      const errorCount = getRecentErrors().length;

      return res.json({
        data: {
          uptime: Math.floor(uptime),
          memoryUsage,
          nodeVersion,
          requestCount,
          errorCount,
        },
      });
  }));

  // ── Detailed Health Dashboard — Sprint 125 ─────────────
  app.get("/api/admin/health/detailed", requireAuth, requireAdmin, wrapAsync(async (_req: Request, res: Response) => {
      const mem = process.memoryUsage();
      const cpu = process.cpuUsage();
      const flags = getAllFlags();

      return res.json({
        data: {
          uptime: Math.floor(process.uptime()),
          memory: {
            heapUsed: mem.heapUsed,
            heapTotal: mem.heapTotal,
            rss: mem.rss,
          },
          nodeVersion: process.version,
          platform: process.platform,
          cpuUsage: {
            user: cpu.user,
            system: cpu.system,
          },
          activeConnections: 0,
          featureFlags: flags,
          generatedAt: new Date().toISOString(),
        },
      });
  }));

  // ── Confidence Thresholds (read-only) ──────────────────
  app.get("/api/admin/confidence-thresholds", requireAuth, requireAdmin, wrapAsync(async (_req: Request, res: Response) => {
      return res.json({
        data: {
          thresholds: CATEGORY_CONFIDENCE_THRESHOLDS,
          defaults: DEFAULT_THRESHOLDS,
        },
      });
  }));

  app.get("/api/admin/revenue/monthly", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
      const months = Math.min(24, Math.max(1, parseInt(req.query.months as string) || 6));
      const { getRevenueByMonth } = await import("./storage");
      const data = await getRevenueByMonth(months);
      return res.json({ data });
  }));
}
