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
import { fetchAndStorePhotos, searchNearbyRestaurants, normalizeCategory } from "./google-places";
import { getPerfStats, getPerformanceValidation } from "./perf-monitor";
import { getRateGateStats } from "./analytics";
import { registerAdminAnalyticsRoutes } from "./routes-admin-analytics";
import { registerAdminExperimentRoutes } from "./routes-admin-experiments";
import { registerAdminPromotionRoutes } from "./routes-admin-promotion";
import { registerAdminRateLimitRoutes } from "./routes-admin-ratelimit";
import { registerAdminClaimVerificationRoutes } from "./routes-admin-claims-verification";
import { registerAdminReputationRoutes } from "./routes-admin-reputation";
import { registerAdminModerationRoutes } from "./routes-admin-moderation";
import { registerAdminRankingRoutes } from "./routes-admin-ranking";
import { registerAdminTemplateRoutes } from "./routes-admin-templates";
import { registerAdminPushTemplateRoutes } from "./routes-admin-push-templates";
import { registerAdminTierLimitRoutes } from "./routes-admin-tier-limits";
import { registerAdminWebSocketRoutes } from "./routes-admin-websocket";
import { registerAdminHealthRoutes } from "./routes-admin-health";
import { registerAdminPhotoRoutes } from "./routes-admin-photos";
import { registerAdminReceiptRoutes } from "./routes-admin-receipts";
import { registerAdminDietaryRoutes } from "./routes-admin-dietary";
import { registerAdminEnrichmentRoutes } from "./routes-admin-enrichment";
import { registerAdminEnrichmentBulkRoutes } from "./routes-admin-enrichment-bulk";
import { getRecentAlerts, getAlertStats, acknowledgeAlert, getAlertRules } from "./alerting";
import { getRequestLogs } from "./request-logger";
import { getRecentErrors } from "../lib/error-reporting";
import { getAllFlags } from "../lib/feature-flags";
import { CATEGORY_CONFIDENCE_THRESHOLDS, DEFAULT_THRESHOLDS } from "../lib/data";
import { adminRateLimiter } from "./rate-limiter";
import { wrapAsync } from "./wrap-async";
import { checkAndRefreshTier } from "./tier-staleness";
import { requireAuth } from "./middleware";
import { getCityEngagement, getAllCityEngagement } from "./city-engagement";

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

  // ── Sprint 187: Bulk Restaurant Import ──────────────────
  app.post("/api/admin/import-restaurants", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
    const city = sanitizeString(req.body.city, 100);
    const category = sanitizeString(req.body.category, 50) || "restaurant";

    if (!city) {
      return res.status(400).json({ error: "City is required" });
    }

    // Search Google Places for restaurants
    const places = await searchNearbyRestaurants(city, category, 20);

    if (places.length === 0) {
      return res.json({ data: { message: "No places found from Google Places", imported: 0, skipped: 0 } });
    }

    // Normalize categories and prepare for import
    const importData = places.map(p => ({
      placeId: p.placeId,
      name: p.name,
      address: p.address,
      city,
      category: normalizeCategory(p.types),
      lat: p.lat,
      lng: p.lng,
      googleRating: p.rating,
      priceRange: p.priceLevel || "$$",
    }));

    const { bulkImportBusinesses } = await import("./storage");
    const result = await bulkImportBusinesses(importData);

    // Auto-fetch photos for newly imported businesses
    let photosFetched = 0;
    for (const r of result.results) {
      if (r.status === "imported") {
        const place = importData.find(p => p.name === r.name);
        if (place) {
          try {
            const count = await fetchAndStorePhotos(place.placeId, place.placeId);
            photosFetched += count;
          } catch { /* non-fatal */ }
        }
      }
    }

    return res.json({
      data: {
        message: `Imported ${result.imported} restaurants, skipped ${result.skipped}`,
        imported: result.imported,
        skipped: result.skipped,
        photosFetched,
        results: result.results,
      },
    });
  }));

  // Sprint 187: Import statistics
  app.get("/api/admin/import-stats", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
    const { getImportStats } = await import("./storage");
    const stats = await getImportStats();
    return res.json({ data: stats });
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

      // Send notification email to claimant (Sprint 173)
      if (updated.memberId && updated.businessId) {
        const { getMemberById, getBusinessById } = await import("./storage");
        const [member, business] = await Promise.all([
          getMemberById(updated.memberId),
          getBusinessById(updated.businessId),
        ]);
        if (member?.email && business) {
          const { sendClaimApprovedEmail, sendClaimRejectedEmail } = await import("./email");
          if (status === "approved") {
            sendClaimApprovedEmail({
              email: member.email,
              displayName: member.displayName || "User",
              businessName: business.name,
              businessSlug: business.slug || business.id,
            }).catch(() => {});
          } else {
            sendClaimRejectedEmail({
              email: member.email,
              displayName: member.displayName || "User",
              businessName: business.name,
            }).catch(() => {});
          }
        }

        // Sprint 175: Push notification for claim decisions
        if (member?.pushToken) {
          const { sendPushNotification } = await import("./push");
          if (status === "approved") {
            sendPushNotification(
              [member.pushToken],
              `Claim approved: ${business?.name}`,
              "You're now the verified owner. Access your dashboard to see analytics.",
              { screen: "business" },
            ).catch(() => {});
          } else {
            sendPushNotification(
              [member.pushToken],
              `Claim update: ${business?.name}`,
              "Your claim could not be verified. Contact support for next steps.",
              { screen: "profile" },
            ).catch(() => {});
          }
        }
      }

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
      // Tier freshness guard (Sprint 141): ensure admin list reflects correct tiers
      const freshData = data.map((m) => ({
        ...m,
        credibilityTier: checkAndRefreshTier(m.credibilityTier, m.credibilityScore),
      }));
      return res.json({ data: freshData });
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
      const event = await getWebhookEventById(req.params.id as string);
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
      const { getCacheStats } = await import("./redis");
      const { getErrorStats } = await import("./error-tracking");
      const data = {
        ...getPerfStats(),
        cache: getCacheStats(),
        errors: getErrorStats(),
      };
      return res.json({ data });
  }));

  // ── Sprint 204: Performance Validation ──────────────────────
  app.get("/api/admin/perf/validate", requireAuth, requireAdmin, wrapAsync(async (_req: Request, res: Response) => {
      const validation = getPerformanceValidation();
      return res.json({ data: validation });
  }));

  // ── Sprint 204: DB-backed Active Users ─────────────────────
  app.get("/api/admin/analytics/active-users-db", requireAuth, requireAdmin, wrapAsync(async (_req: Request, res: Response) => {
      const { getActiveUserStatsDb } = await import("./storage");
      const stats = await getActiveUserStatsDb();
      return res.json({ data: stats });
  }));

  // ── City Engagement Metrics ────────────────────────────────
  app.get("/api/admin/city-engagement", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
    const city = req.query.city as string;
    if (city) {
      const engagement = await getCityEngagement(city);
      return res.json({ data: engagement });
    }
    const all = await getAllCityEngagement();
    return res.json({ data: all });
  }));

  // ── Sprint 191: Error Log ──────────────────────────────────
  app.get("/api/admin/errors", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
      const { getRecentServerErrors } = await import("./error-tracking");
      const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
      const data = getRecentServerErrors(limit);
      return res.json({ data });
  }));

  // ── Revenue Metrics ──────────────────────────────────────
  app.get("/api/admin/revenue", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
      const { getRevenueMetrics } = await import("./storage");
      const metrics = await getRevenueMetrics();
      return res.json({ data: metrics });
  }));

  // ── Analytics routes (extracted to routes-admin-analytics.ts) ──
  registerAdminAnalyticsRoutes(app);

  // ── Sprint 211: Beta Feedback Admin ─────────────────────────
  app.get("/api/admin/feedback", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
      const { getRecentFeedback, getFeedbackStats } = await import("./storage/feedback");
      const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
      const [recent, stats] = await Promise.all([
        getRecentFeedback(limit),
        getFeedbackStats(),
      ]);
      return res.json({ data: { recent, stats } });
  }));

  // ── Sprint 183: Auto-Flagged Moderation Queue ──────────────
  app.get("/api/admin/moderation-queue", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
    const { getAutoFlaggedRatings } = await import("./storage/ratings");
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const perPage = Math.min(50, Math.max(1, parseInt(req.query.perPage as string) || 20));
    const result = await getAutoFlaggedRatings(page, perPage);
    return res.json({
      data: result.ratings,
      pagination: { page, perPage, total: result.total, totalPages: Math.ceil(result.total / perPage) },
    });
  }));

  app.patch("/api/admin/moderation/:id", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
    const { reviewAutoFlaggedRating } = await import("./storage/ratings");
    const action = req.body.action;
    if (action !== "confirm" && action !== "dismiss") {
      return res.status(400).json({ error: "action must be 'confirm' or 'dismiss'" });
    }
    await reviewAutoFlaggedRating(req.params.id, action, req.user!.id);
    return res.json({ data: { reviewed: true, action } });
  }));

  // ── Rate Gate Analytics — Sprint 163 ────────────────────
  app.get("/api/admin/rate-gate-stats", requireAuth, requireAdmin, wrapAsync(async (_req: Request, res: Response) => {
      const stats = getRateGateStats();
      return res.json({ data: stats });
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
          prerenderCache: (() => { try { const { getPrerenderCacheStats } = require("./prerender"); return getPrerenderCacheStats(); } catch { return null; } })(),
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

  // ── Beta Invite — Sprint 196 + 197 (with tracking) ──────
  app.post("/api/admin/beta-invite", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
      const { sendBetaInviteEmail } = await import("./email");
      const { getMemberByEmail, createBetaInvite, getBetaInviteByEmail } = await import("./storage");

      const email = sanitizeString(req.body.email, 254);
      const displayName = sanitizeString(req.body.displayName, 100);
      const referralCode = sanitizeString(req.body.referralCode || "", 50) || "BETA25";

      if (!email || !displayName) {
        return res.status(400).json({ error: "email and displayName are required" });
      }

      // Prevent duplicate invites to existing members
      const existing = await getMemberByEmail(email);
      if (existing) {
        return res.status(409).json({ error: "User already has an account" });
      }

      // Prevent duplicate invites
      const existingInvite = await getBetaInviteByEmail(email);
      if (existingInvite) {
        return res.status(409).json({ error: "Invite already sent to this email" });
      }

      await sendBetaInviteEmail({
        email,
        displayName,
        referralCode,
        invitedBy: req.body.invitedBy ? sanitizeString(req.body.invitedBy, 100) : undefined,
      });

      // Sprint 197: Track invite in database
      await createBetaInvite({ email, displayName, referralCode, invitedBy: req.user?.email });

      // Sprint 199: Track in analytics funnel
      const { trackEvent } = await import("./analytics");
      trackEvent("beta_invite_sent", req.user?.id, { email });

      return res.json({ data: { sent: true, email } });
  }));

  // ── Beta Invite Stats — Sprint 197 ────────────────────────
  app.get("/api/admin/beta-invites", requireAuth, requireAdmin, wrapAsync(async (_req: Request, res: Response) => {
      const { getBetaInviteStats } = await import("./storage");
      const stats = await getBetaInviteStats();
      return res.json({ data: stats });
  }));

  // ── Sprint 219: Alert Management ────────────────────────
  app.get("/api/admin/alerts", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
      const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
      const alerts = getRecentAlerts(limit);
      const stats = getAlertStats();
      const rules = getAlertRules();
      return res.json({ data: { alerts, stats, rules } });
  }));

  app.post("/api/admin/alerts/:id/acknowledge", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
      const result = acknowledgeAlert(req.params.id);
      if (!result) {
        return res.status(404).json({ error: "Alert not found" });
      }
      return res.json({ data: { acknowledged: true } });
  }));

  // ── Beta Invite Batch — Sprint 196 + 197 ───────────────────
  app.post("/api/admin/beta-invite/batch", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
      const { sendBetaInviteEmail } = await import("./email");
      const { getMemberByEmail, createBetaInvite, getBetaInviteByEmail } = await import("./storage");

      const invites: Array<{ email: string; displayName: string; referralCode?: string }> = req.body.invites;
      if (!Array.isArray(invites) || invites.length === 0 || invites.length > 100) {
        return res.status(400).json({ error: "invites must be an array of 1-100 entries" });
      }

      const results: Array<{ email: string; status: "sent" | "skipped"; reason?: string }> = [];

      for (const invite of invites) {
        const email = sanitizeString(invite.email, 254);
        const displayName = sanitizeString(invite.displayName, 100);
        const referralCode = sanitizeString(invite.referralCode || "", 50) || "BETA25";
        if (!email || !displayName) {
          results.push({ email: email || "unknown", status: "skipped", reason: "missing fields" });
          continue;
        }
        const existing = await getMemberByEmail(email);
        if (existing) {
          results.push({ email, status: "skipped", reason: "already registered" });
          continue;
        }
        const existingInvite = await getBetaInviteByEmail(email);
        if (existingInvite) {
          results.push({ email, status: "skipped", reason: "already invited" });
          continue;
        }
        await sendBetaInviteEmail({ email, displayName, referralCode });
        await createBetaInvite({ email, displayName, referralCode, invitedBy: req.user?.email });
        results.push({ email, status: "sent" });
      }

      const sent = results.filter(r => r.status === "sent").length;
      return res.json({ data: { total: invites.length, sent, skipped: invites.length - sent, results } });
  }));

  /**
   * Sprint 279: GET /api/admin/eligibility
   * Returns businesses near eligibility threshold for admin monitoring.
   */
  app.get("/api/admin/eligibility", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    if (!isAdminEmail(req.user?.email)) return res.status(403).json({ error: "Admin only" });

    const { db } = await import("./db");
    const { businesses } = await import("@shared/schema");
    const { eq, asc } = await import("drizzle-orm");

    const allBusinesses = await db.select({
      id: businesses.id,
      name: businesses.name,
      city: businesses.city,
      category: businesses.category,
      totalRatings: businesses.totalRatings,
      dineInCount: businesses.dineInCount,
      credibilityWeightedSum: businesses.credibilityWeightedSum,
      leaderboardEligible: businesses.leaderboardEligible,
      weightedScore: businesses.weightedScore,
    })
      .from(businesses)
      .where(eq(businesses.isActive, true))
      .orderBy(asc(businesses.leaderboardEligible));

    const eligible = allBusinesses.filter(b => b.leaderboardEligible);
    const ineligible = allBusinesses.filter(b => !b.leaderboardEligible);
    const nearEligible = ineligible.filter(b =>
      b.totalRatings >= 2 || parseFloat(b.credibilityWeightedSum) >= 0.3,
    );

    return res.json({
      data: {
        totalActive: allBusinesses.length,
        eligible: eligible.length,
        ineligible: ineligible.length,
        nearEligible: nearEligible.length,
        nearEligibleBusinesses: nearEligible.map(b => ({
          id: b.id,
          name: b.name,
          city: b.city,
          category: b.category,
          totalRatings: b.totalRatings,
          dineInCount: b.dineInCount,
          credibilityWeightedSum: parseFloat(b.credibilityWeightedSum),
          missingRequirements: [
            b.totalRatings < 3 ? `Need ${3 - b.totalRatings} more raters` : null,
            b.dineInCount < 1 ? "Need 1+ dine-in rating" : null,
            parseFloat(b.credibilityWeightedSum) < 0.5 ? `Credibility sum ${parseFloat(b.credibilityWeightedSum).toFixed(2)} < 0.50` : null,
          ].filter(Boolean),
        })),
      },
    });
  }));
}

export function registerAllAdminRoutes(app: Express) {
  registerAdminRoutes(app);
  registerAdminExperimentRoutes(app);
  registerAdminPromotionRoutes(app);
  registerAdminRateLimitRoutes(app);
  registerAdminClaimVerificationRoutes(app);
  registerAdminReputationRoutes(app);
  registerAdminModerationRoutes(app);
  registerAdminRankingRoutes(app);
  registerAdminTemplateRoutes(app);
  registerAdminPushTemplateRoutes(app);
  registerAdminTierLimitRoutes(app);
  registerAdminWebSocketRoutes(app);
  registerAdminHealthRoutes(app);
  registerAdminPhotoRoutes(app);
  registerAdminReceiptRoutes(app);
  registerAdminDietaryRoutes(app);
  registerAdminEnrichmentRoutes(app);
  registerAdminEnrichmentBulkRoutes(app);
}
