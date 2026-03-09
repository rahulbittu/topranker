import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { setupAuth } from "./auth";
import { handleWebhook, handleDeployStatus } from "./deploy";
import { handlePhotoProxy } from "./photos";
import { handleBadgeShare } from "./badge-share";
import { registerAdminRoutes } from "./routes-admin";
import { registerPaymentRoutes } from "./routes-payments";
import { registerBadgeRoutes } from "./routes-badges";
import { registerExperimentRoutes } from "./routes-experiments";
import { registerAdminExperimentRoutes } from "./routes-admin-experiments";
import { registerAuthRoutes } from "./routes-auth";
import { registerMemberRoutes } from "./routes-members";
import { registerBusinessRoutes } from "./routes-businesses";
import { registerDishRoutes } from "./routes-dishes";
import { registerSeoRoutes } from "./routes-seo";
import { registerQrRoutes } from "./routes-qr";
import { registerNotificationRoutes } from "./routes-notifications";
import { registerReferralRoutes } from "./routes-referrals";
import { registerUnsubscribeRoutes } from "./routes-unsubscribe";
import { registerWebhookRoutes } from "./routes-webhooks";
import { handleStripeWebhook } from "./stripe-webhook";
import { addClient, broadcast } from "./sse";
import { log } from "./logger";
import {
  getLeaderboard,
  getBusinessesByIds,
  searchDishes,
  submitRating,
  getActiveChallenges,
  getAllCategories,
  getBusinessPhotosMap,
  getMemberPayments,
  getActiveFeaturedInCity,
} from "./storage";
import { insertRatingSchema, insertCategorySuggestionSchema } from "@shared/schema";
import { sanitizeString, sanitizeNumber } from "./sanitize";
import { trackEvent } from "./analytics";
import { getUserExperiments, trackOutcome } from "./experiment-tracker";
import { wrapAsync } from "./wrap-async";
import { checkAndRefreshTier } from "./tier-staleness";
import { requireAuth } from "./middleware";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // API response time logging middleware
  app.use("/api", (req: Request, res: Response, next) => {
    const start = Date.now();
    const originalEnd = res.end;
    res.end = function (this: any, ...args: any) {
      const duration = Date.now() - start;
      const method = req.method;
      const url = req.originalUrl || req.url;
      const status = res.statusCode;
      if (duration > 200) {
        log.warn(`[SLOW] ${method} ${url} ${status} ${duration}ms`);
      } else {
        log.info(`${method} ${url} ${status} ${duration}ms`);
      }
      return originalEnd.apply(this, args);
    } as typeof res.end;
    next();
  });

  // Health check — process vitals for uptime monitoring, load balancers, and alerting
  app.get("/api/health", (req: Request, res: Response) => {
    const uptime = process.uptime();
    const memUsage = process.memoryUsage();
    res.json({
      status: "healthy",
      version: "1.0.0",
      uptime: Math.floor(uptime),
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      memoryUsage: memUsage.heapUsed,
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        rss: Math.round(memUsage.rss / 1024 / 1024),
      },
    });
  });

  // ── Server-Sent Events — near-real-time updates ───────────
  // SECURITY (Nadia Kaur, 2026-03-08):
  //   1. Max 5 concurrent SSE connections per IP — prevents single-origin resource exhaustion
  //   2. 30-minute connection timeout — prevents indefinite resource holding
  //   3. Connections tracked in sseConnectionsByIp; cleaned up on close/timeout
  const SSE_MAX_PER_IP = 5;
  const SSE_TIMEOUT_MS = 1_800_000; // 30 minutes
  const sseConnectionsByIp = new Map<string, number>();

  app.get("/api/events", (req: Request, res: Response) => {
    const clientIp = req.ip || req.socket.remoteAddress || "unknown";
    const currentCount = sseConnectionsByIp.get(clientIp) || 0;

    if (currentCount >= SSE_MAX_PER_IP) {
      log.warn(`SSE rate limit: ${clientIp} exceeded ${SSE_MAX_PER_IP} concurrent connections`);
      return res.status(429).json({ error: "Too many SSE connections from this IP" });
    }

    sseConnectionsByIp.set(clientIp, currentCount + 1);

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    res.write("data: {\"type\":\"connected\",\"timestamp\":" + Date.now() + "}\n\n");
    addClient(res);

    // Keep-alive ping every 30s to prevent proxy/LB timeout
    const keepAlive = setInterval(() => {
      try { res.write(": ping\n\n"); } catch { clearInterval(keepAlive); }
    }, 30000);

    // Auto-close after 30 minutes to prevent resource exhaustion
    const timeout = setTimeout(() => {
      try { res.end(); } catch { /* already closed */ }
    }, SSE_TIMEOUT_MS);

    const cleanup = () => {
      clearInterval(keepAlive);
      clearTimeout(timeout);
      const count = sseConnectionsByIp.get(clientIp) || 1;
      if (count <= 1) {
        sseConnectionsByIp.delete(clientIp);
      } else {
        sseConnectionsByIp.set(clientIp, count - 1);
      }
    };

    req.on("close", cleanup);
  });

  // ── Auth + Account/GDPR Routes (extracted to routes-auth.ts, Sprint 171) ──
  registerAuthRoutes(app);

  // ── Leaderboard + Featured ──────────────────────────────────
  app.get("/api/leaderboard", wrapAsync(async (req: Request, res: Response) => {
    const city = sanitizeString(req.query.city, 100) || "Dallas";
    const category = sanitizeString(req.query.category, 50) || "restaurant";
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));

    const bizList = await getLeaderboard(city, category, limit);
    const photoMap = await getBusinessPhotosMap(bizList.map(b => b.id));
    const data = bizList.map(b => ({
      ...b,
      photoUrls: photoMap[b.id] || (b.photoUrl ? [b.photoUrl] : []),
    }));
    return res.json({ data });
  }));

  app.get("/api/featured", wrapAsync(async (req: Request, res: Response) => {
    const city = sanitizeString(req.query.city, 100) || "Dallas";
    const placements = await getActiveFeaturedInCity(city);
    if (placements.length === 0) {
      return res.json({ data: [] });
    }
    const bizIds = placements.map((p) => p.businessId);
    const [bizList, photoMap] = await Promise.all([
      getBusinessesByIds(bizIds),
      getBusinessPhotosMap(bizIds),
    ]);
    const bizMap = new Map(bizList.map((b) => [b.id, b]));

    const featured = placements
      .map((p) => {
        const biz = bizMap.get(p.businessId);
        if (!biz) return null;
        return {
          id: biz.id,
          name: biz.name,
          slug: biz.slug,
          category: biz.category,
          photoUrl: (photoMap[biz.id] || [])[0] || biz.photoUrl || undefined,
          weightedScore: biz.weightedScore || 0,
          tagline: (biz as any).tagline || `Top ${biz.category} in ${city}`,
          totalRatings: biz.totalRatings || 0,
          expiresAt: p.expiresAt,
        };
      })
      .filter(Boolean);
    return res.json({ data: featured });
  }));

  app.get("/api/leaderboard/categories", wrapAsync(async (req: Request, res: Response) => {
    const city = sanitizeString(req.query.city, 100) || "Dallas";
    const data = await getAllCategories(city);
    return res.json({ data });
  }));

  // ── Business Routes (extracted to routes-businesses.ts, Sprint 171) ──
  registerBusinessRoutes(app);

  // ── Payment Routes (extracted to routes-payments.ts) ────────
  registerPaymentRoutes(app);

  app.get("/api/dishes/search", wrapAsync(async (req: Request, res: Response) => {
    const businessId = req.query.business_id as string;
    const query = sanitizeString(req.query.q, 200);
    if (!businessId) return res.status(400).json({ error: "business_id required" });
    const data = await searchDishes(businessId, query);
    return res.json({ data });
  }));

  // ── Dish Leaderboard Routes (extracted to routes-dishes.ts) ──
  registerDishRoutes(app);
  registerSeoRoutes(app);
  registerQrRoutes(app);
  registerNotificationRoutes(app);
  registerReferralRoutes(app);

  // ── Rating Submission ──────────────────────────────────────
  app.post("/api/ratings", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    try {
      const parsed = insertRatingSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }

      // Sanitize rating scores to [1, 5] range
      parsed.data.q1Score = sanitizeNumber(parsed.data.q1Score, 1, 5, 3);
      parsed.data.q2Score = sanitizeNumber(parsed.data.q2Score, 1, 5, 3);
      parsed.data.q3Score = sanitizeNumber(parsed.data.q3Score, 1, 5, 3);

      const memberId = req.user!.id;
      const result = await submitRating(memberId, parsed.data);

      const verifiedTier = checkAndRefreshTier(result.newTier, result.newCredibilityScore);
      if (verifiedTier !== result.newTier) {
        result.newTier = verifiedTier;
        result.tierUpgraded = verifiedTier !== req.user!.credibilityTier;
      }

      broadcast("rating_submitted", { businessId: parsed.data.businessId, memberId });
      broadcast("ranking_updated", { businessId: parsed.data.businessId });
      broadcast("challenger_updated", { businessId: parsed.data.businessId });
      trackEvent("first_rating", memberId);
      trackEvent("rating_submitted", memberId, { businessId: parsed.data.businessId });

      // Sprint 175: Push notification on tier upgrade
      if (result.tierUpgraded && req.user!.pushToken) {
        const { notifyTierUpgrade } = await import("./push");
        notifyTierUpgrade(memberId, req.user!.pushToken, result.newTier).catch(() => {});
      }

      // Sprint 180: Invalidate prerender cache for affected business
      try {
        const { invalidatePrerenderCache } = await import("./prerender");
        const { getBusinessById } = await import("./storage");
        const biz = await getBusinessById(parsed.data.businessId);
        if (biz?.slug) invalidatePrerenderCache("biz", biz.slug);
      } catch { /* non-critical */ }

      const userExperiments = getUserExperiments(String(memberId));
      for (const expId of userExperiments) {
        trackOutcome(String(memberId), expId, "rated", parsed.data.q1Score);
      }

      return res.status(201).json({ data: result });
    } catch (err: any) {
      const memberId = req.user?.id;
      const businessId = req.body?.businessId;
      if (err.message.includes("3+ days")) {
        trackEvent("rating_rejected_account_age", memberId, { businessId });
        return res.status(403).json({ error: err.message });
      }
      if (err.message.includes("Already rated")) {
        trackEvent("rating_rejected_duplicate", memberId, { businessId });
        return res.status(409).json({ error: err.message });
      }
      if (err.message.includes("suspended")) {
        trackEvent("rating_rejected_suspended", memberId, { businessId });
        return res.status(403).json({ error: err.message });
      }
      trackEvent("rating_rejected_unknown", memberId, { businessId, error: err.message });
      return res.status(400).json({ error: err.message });
    }
  }));

  // ── Sprint 183: Rating Edit ──────────────────────────────────
  app.patch("/api/ratings/:id", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const { editRating } = await import("./storage/ratings");
    const ratingId = req.params.id;
    const updates = {
      q1Score: req.body.q1Score ? sanitizeNumber(req.body.q1Score, 1, 5, undefined) : undefined,
      q2Score: req.body.q2Score ? sanitizeNumber(req.body.q2Score, 1, 5, undefined) : undefined,
      q3Score: req.body.q3Score ? sanitizeNumber(req.body.q3Score, 1, 5, undefined) : undefined,
      wouldReturn: req.body.wouldReturn,
      note: req.body.note !== undefined ? sanitizeString(req.body.note, 160) : undefined,
    };
    try {
      const updated = await editRating(ratingId, req.user!.id, updates);
      broadcast("rating_updated", { ratingId, businessId: updated.businessId });
      return res.json({ data: updated });
    } catch (err: any) {
      if (err.message.includes("not found")) return res.status(404).json({ error: err.message });
      if (err.message.includes("Cannot edit")) return res.status(403).json({ error: err.message });
      if (err.message.includes("expired")) return res.status(403).json({ error: err.message });
      return res.status(400).json({ error: err.message });
    }
  }));

  // ── Sprint 183: Rating Delete ─────────────────────────────────
  app.delete("/api/ratings/:id", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const { deleteRating } = await import("./storage/ratings");
    try {
      await deleteRating(req.params.id, req.user!.id);
      broadcast("rating_deleted", { ratingId: req.params.id });
      return res.json({ data: { deleted: true } });
    } catch (err: any) {
      if (err.message.includes("not found")) return res.status(404).json({ error: err.message });
      if (err.message.includes("Cannot delete")) return res.status(403).json({ error: err.message });
      return res.status(400).json({ error: err.message });
    }
  }));

  // ── Sprint 183: Submit Rating Flag ────────────────────────────
  app.post("/api/ratings/:id/flag", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const { submitRatingFlag } = await import("./storage/ratings");
    try {
      const flag = await submitRatingFlag(req.params.id, req.user!.id, {
        q1NoSpecificExperience: req.body.q1NoSpecificExperience,
        q2ScoreMismatchNote: req.body.q2ScoreMismatchNote,
        q3InsiderSuspected: req.body.q3InsiderSuspected,
        q4CoordinatedPattern: req.body.q4CoordinatedPattern,
        q5CompetitorBombing: req.body.q5CompetitorBombing,
        explanation: sanitizeString(req.body.explanation, 500),
      });
      return res.status(201).json({ data: flag });
    } catch (err: any) {
      if (err.message.includes("not found")) return res.status(404).json({ error: err.message });
      if (err.message.includes("own rating")) return res.status(403).json({ error: err.message });
      if (err.message.includes("unique") || err.message.includes("duplicate")) {
        return res.status(409).json({ error: "You have already flagged this rating" });
      }
      return res.status(400).json({ error: err.message });
    }
  }));

  // ── Member Routes (extracted to routes-members.ts, Sprint 171) ──
  registerMemberRoutes(app);

  // ── Challengers ─────────────────────────────────────────────
  app.get("/api/challengers/active", wrapAsync(async (req: Request, res: Response) => {
    const city = sanitizeString(req.query.city, 100) || "Dallas";
    const category = sanitizeString(req.query.category, 50) || undefined;
    const data = await getActiveChallenges(city, category);
    return res.json({ data });
  }));

  app.get("/api/trending", wrapAsync(async (req: Request, res: Response) => {
    const { getTrendingBusinesses } = await import("./storage");
    const city = sanitizeString(req.query.city, 100) || "Dallas";
    const limit = Math.min(10, Math.max(1, parseInt(req.query.limit as string) || 3));
    const bizList = await getTrendingBusinesses(city, limit);
    const photoMap = await getBusinessPhotosMap(bizList.map(b => b.id));
    const data = bizList.map(b => ({
      ...b,
      photoUrls: photoMap[b.id] || (b.photoUrl ? [b.photoUrl] : []),
    }));
    return res.json({ data });
  }));

  // ── Category Suggestions ────────────────────────────────────
  app.post("/api/category-suggestions", requireAuth, wrapAsync(async (req: Request, res: Response) => {
      const parsed = insertCategorySuggestionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }
      const { createCategorySuggestion } = await import("./storage");
      const suggestion = await createCategorySuggestion({
        ...parsed.data,
        suggestedBy: req.user!.id,
      });
      return res.status(201).json({ data: suggestion });
  }));

  app.get("/api/category-suggestions", wrapAsync(async (req: Request, res: Response) => {
    const { getPendingSuggestions } = await import("./storage");
    const data = await getPendingSuggestions();
    return res.json({ data });
  }));

  // ── Misc Routes ─────────────────────────────────────────────
  app.get("/api/photos/proxy", wrapAsync(handlePhotoProxy));
  app.post("/api/webhook/stripe", wrapAsync(handleStripeWebhook));

  app.get("/api/payments/history", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const payments = await getMemberPayments(req.user!.id, limit);
    return res.json({ data: payments });
  }));

  app.post("/api/webhook/deploy", wrapAsync(handleWebhook));
  app.get("/api/deploy/status", wrapAsync(handleDeployStatus));
  app.get("/share/badge/:badgeId", wrapAsync(handleBadgeShare));

  // ── Sprint 211: Beta Feedback ───────────────────────────────
  app.post("/api/feedback", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const { createFeedback } = await import("./storage/feedback");
    const { rating, category, message, screenContext, appVersion } = req.body;
    if (!rating || !category || !message) {
      return res.status(400).json({ error: "rating, category, and message are required" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "rating must be 1-5" });
    }
    if (!["bug", "feature", "praise", "other"].includes(category)) {
      return res.status(400).json({ error: "category must be bug, feature, praise, or other" });
    }
    const feedback = await createFeedback({
      memberId: req.user!.id,
      rating: Math.round(rating),
      category,
      message: String(message).slice(0, 2000),
      screenContext: screenContext ? String(screenContext).slice(0, 100) : undefined,
      appVersion: appVersion ? String(appVersion).slice(0, 50) : undefined,
    });
    return res.status(201).json({ data: feedback });
  }));

  // ── Extracted Route Modules ─────────────────────────────────
  registerBadgeRoutes(app);
  registerAdminRoutes(app);
  registerExperimentRoutes(app);
  registerAdminExperimentRoutes(app);
  registerUnsubscribeRoutes(app);
  registerWebhookRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
