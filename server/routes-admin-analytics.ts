/**
 * Sprint 219: Admin Analytics Routes — extracted from routes-admin.ts
 * All endpoints under /api/admin/analytics/* require authentication + admin.
 */
import type { Express, Request, Response } from "express";
import { isAdminEmail } from "@shared/admin";
import { getFunnelStats, getRecentEvents, getRateGateStats, getHourlyStats, getDailyStats, getActiveUserStats, getBetaConversionFunnel } from "./analytics";
import { wrapAsync } from "./wrap-async";
import { requireAuth } from "./middleware";

function requireAdmin(req: Request, res: Response, next: Function) {
  if (!isAdminEmail(req.user?.email)) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

export function registerAdminAnalyticsRoutes(app: Express) {
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

  // ── Time-Series Analytics ─────────────────────────────────
  app.get("/api/admin/analytics/hourly", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
      const hours = Math.min(168, Math.max(1, parseInt(req.query.hours as string) || 24));
      return res.json({ data: getHourlyStats(hours) });
  }));

  app.get("/api/admin/analytics/daily", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
      const days = Math.min(90, Math.max(1, parseInt(req.query.days as string) || 7));
      return res.json({ data: getDailyStats(days) });
  }));

  // ── Active Users ──────────────────────────────────────────
  app.get("/api/admin/analytics/active-users", requireAuth, requireAdmin, wrapAsync(async (_req: Request, res: Response) => {
      return res.json({ data: getActiveUserStats() });
  }));

  // ── Beta Conversion Funnel ────────────────────────────────
  app.get("/api/admin/analytics/beta-funnel", requireAuth, requireAdmin, wrapAsync(async (_req: Request, res: Response) => {
      const { getBetaInviteStats } = await import("./storage");
      const funnel = getBetaConversionFunnel();
      const inviteStats = await getBetaInviteStats();
      return res.json({
        data: {
          ...funnel,
          inviteTracking: {
            total: inviteStats.total,
            joined: inviteStats.joined,
            pending: inviteStats.pending,
          },
          generatedAt: new Date().toISOString(),
        },
      });
  }));

  // ── Data Retention ────────────────────────────────────────
  app.post("/api/admin/analytics/purge", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
      const { purgeOldAnalyticsEvents, DATA_RETENTION_POLICY } = await import("./storage/analytics");
      const retentionDays = Math.max(30, parseInt(req.body.retentionDays as string) || 90);
      const purged = await purgeOldAnalyticsEvents(retentionDays);
      return res.json({ purged, retentionDays, policy: DATA_RETENTION_POLICY });
  }));

  app.get("/api/admin/analytics/retention-policy", requireAuth, requireAdmin, wrapAsync(async (_req: Request, res: Response) => {
      const { DATA_RETENTION_POLICY } = await import("./storage/analytics");
      return res.json({ policy: DATA_RETENTION_POLICY });
  }));

  // ── Analytics Data Export ──────────────────────────────────
  app.get("/api/admin/analytics/export", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
      const { getPersistedDailyStats, getPersistedEventCounts, getPersistedDailyStatsExtended } = await import("./storage/analytics");
      const days = Math.min(365, Math.max(1, parseInt(req.query.days as string) || 90));
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const detailed = req.query.detailed === "true";
      const format = req.query.format || "json";

      if (detailed) {
        const extendedStats = await getPersistedDailyStatsExtended(days);
        if (format === "csv") {
          const csvHeader = "date,event,count\n";
          const csvRows = extendedStats.map(d => `${d.date},${d.event},${d.count}`).join("\n");
          res.setHeader("Content-Type", "text/csv");
          res.setHeader("Content-Disposition", `attachment; filename=analytics-detailed-${days}d.csv`);
          return res.send(csvHeader + csvRows);
        }
        return res.json({ data: { days, detailed: true, stats: extendedStats, exportedAt: new Date().toISOString() } });
      }

      const [dailyStats, eventCounts] = await Promise.all([
        getPersistedDailyStats(days),
        getPersistedEventCounts(since),
      ]);
      if (format === "csv") {
        const csvHeader = "date,events\n";
        const csvRows = dailyStats.map(d => `${d.date},${d.events}`).join("\n");
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename=analytics-export-${days}d.csv`);
        return res.send(csvHeader + csvRows);
      }
      return res.json({ data: { days, dailyStats, eventCounts, exportedAt: new Date().toISOString() } });
  }));

  // ── Launch Week Metrics — Sprint 217 ─────────────────────
  app.get("/api/admin/analytics/launch-metrics", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
      const days = Math.min(30, Math.max(1, parseInt(req.query.days as string) || 7));
      const daily = getDailyStats(days);
      const funnel = getFunnelStats();
      const beta = getBetaConversionFunnel();
      const active = getActiveUserStats();

      const totalSignups = funnel.signup_completed || 0;
      const totalFirstRatings = funnel.first_rating || 0;
      const totalFifthRatings = funnel.fifth_rating || 0;
      const totalTierUpgrades = funnel.tier_upgrade || 0;

      const activationRate = totalSignups > 0
        ? ((totalFirstRatings / totalSignups) * 100).toFixed(1) + "%"
        : "N/A";

      const deepEngagementRate = totalFirstRatings > 0
        ? ((totalFifthRatings / totalFirstRatings) * 100).toFixed(1) + "%"
        : "N/A";

      const tierConversionRate = totalSignups > 0
        ? ((totalTierUpgrades / totalSignups) * 100).toFixed(1) + "%"
        : "N/A";

      const challengerEntries = funnel.challenger_entered || 0;
      const dashboardSubs = funnel.dashboard_pro_subscribed || 0;
      const featuredPurchases = funnel.featured_purchased || 0;
      const estimatedMRR = (challengerEntries * 99) + (dashboardSubs * 49) + (featuredPurchases * 199);

      return res.json({
        data: {
          period: `${days} days`,
          generatedAt: new Date().toISOString(),
          userMetrics: {
            totalSignups,
            totalFirstRatings,
            totalFifthRatings,
            totalTierUpgrades,
            activationRate,
            deepEngagementRate,
            tierConversionRate,
          },
          activeUsers: active,
          revenueMetrics: {
            challengerEntries,
            dashboardSubs,
            featuredPurchases,
            estimatedMRR: `$${estimatedMRR}`,
            breakEvenTarget: "$247/mo",
            breakEvenMet: estimatedMRR >= 247,
          },
          betaFunnel: beta,
          dailyTrend: daily,
        },
      });
  }));
}
