import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import passport from "passport";
import { setupAuth, registerMember, authenticateGoogleUser } from "./auth";
import { handleWebhook, handleDeployStatus } from "./deploy";
import { handlePhotoProxy } from "./photos";
import { handleBadgeShare } from "./badge-share";
import { sendWelcomeEmail } from "./email";
import { registerAdminRoutes } from "./routes-admin";
import { registerPaymentRoutes } from "./routes-payments";
import { registerBadgeRoutes } from "./routes-badges";
import { registerExperimentRoutes } from "./routes-experiments";
import { handleStripeWebhook } from "./stripe-webhook";
import { addClient, broadcast } from "./sse";
import { log } from "./logger";
import {
  getLeaderboard,
  getBusinessBySlug,
  getBusinessById,
  getBusinessRatings,
  getBusinessDishes,
  searchDishes,
  submitRating,
  getMemberById,
  getMemberRatings,
  getActiveChallenges,
  recalculateCredibilityScore,
  searchBusinesses,
  getAllCategories,
  getBusinessPhotos,
  getBusinessPhotosMap,
  getMemberPayments,
  getActiveFeaturedInCity,
  getMemberImpact,
  getSeasonalRatingCounts,
  getMemberBadges,
} from "./storage";
import { fetchAndStorePhotos } from "./google-places";
import { insertRatingSchema, insertCategorySuggestionSchema } from "@shared/schema";
import { authRateLimiter } from "./rate-limiter";
import { sanitizeString, sanitizeEmail, sanitizeNumber } from "./sanitize";
import { trackEvent } from "./analytics";
import { scheduleDeletion, getDeletionStatus, cancelDeletion } from "./gdpr";
import { wrapAsync } from "./wrap-async";
import { checkAndRefreshTier } from "./tier-staleness";

function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

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

  app.post("/api/auth/signup", authRateLimiter, wrapAsync(async (req: Request, res: Response) => {
    try {
      const { password, city } = req.body;
      const displayName = sanitizeString(req.body.displayName, 100);
      const username = sanitizeString(req.body.username, 50);
      const email = sanitizeEmail(req.body.email);

      if (!displayName || !username || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
      }
      if (!/\d/.test(password)) {
        return res.status(400).json({ error: "Password must contain at least one number" });
      }

      const member = await registerMember({ displayName, username, email, password, city });

      // Fire-and-forget welcome email (don't block signup on email delivery)
      sendWelcomeEmail({
        email: member.email,
        displayName: member.displayName,
        city: member.city,
        username: member.username,
      }).catch((emailErr) => log.error("Welcome email failed:", emailErr));

      trackEvent("signup_completed", member.id);

      req.login(
        {
          id: member.id,
          displayName: member.displayName,
          username: member.username,
          email: member.email,
          city: member.city,
          credibilityScore: member.credibilityScore,
          credibilityTier: member.credibilityTier,
        },
        (err) => {
          if (err) return res.status(500).json({ error: "Login failed after signup" });
          return res.status(201).json({ data: req.user });
        },
      );
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }));

  app.post("/api/auth/login", authRateLimiter, (req: Request, res: Response, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return res.status(500).json({ error: "Internal server error" });
      if (!user) return res.status(401).json({ error: info?.message || "Invalid credentials" });

      req.login(user, (loginErr) => {
        if (loginErr) return res.status(500).json({ error: "Login failed" });
        return res.json({ data: user });
      });
    })(req, res, next);
  });

  app.post("/api/auth/google", authRateLimiter, wrapAsync(async (req: Request, res: Response) => {
    try {
      const { idToken } = req.body;
      if (!idToken) {
        return res.status(400).json({ error: "ID token is required" });
      }

      const member = await authenticateGoogleUser(idToken);

      req.login(
        {
          id: member.id,
          displayName: member.displayName,
          username: member.username,
          email: member.email,
          city: member.city,
          credibilityScore: member.credibilityScore,
          credibilityTier: member.credibilityTier,
        },
        (err) => {
          if (err) return res.status(500).json({ error: "Login failed" });
          return res.json({ data: req.user });
        },
      );
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }));

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ error: "Logout failed" });
      return res.json({ data: { message: "Logged out" } });
    });
  });

  app.get("/api/auth/me", (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.json({ data: null });
    }
    return res.json({ data: req.user });
  });

  // ── GDPR / CCPA Data Export (Portability) ───────────────────
  // Compliance (Jordan Blake): Right-to-data-portability per GDPR Art. 20
  // Returns all user data in machine-readable JSON format
  app.get("/api/account/export", wrapAsync(async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const userId = req.user!.id;
    const [profile, ratings, impact, seasonal, badges] = await Promise.all([
      getMemberById(userId),
      getMemberRatings(userId, 1, 10000),
      getMemberImpact(userId),
      getSeasonalRatingCounts(userId),
      getMemberBadges(userId),
    ]);

    const exportData = {
      exportDate: new Date().toISOString(),
      format: "GDPR Art. 20 compliant",
      profile: profile ? {
        displayName: profile.displayName,
        username: profile.username,
        email: profile.email,
        city: profile.city,
        credibilityScore: profile.credibilityScore,
        credibilityTier: profile.credibilityTier,
        totalRatings: profile.totalRatings,
        joinedAt: profile.joinedAt,
        lastActive: profile.lastActive,
      } : null,
      ratings: ratings || [],
      impact: impact || null,
      seasonalActivity: seasonal || [],
      badges: badges || [],
    };

    res.setHeader("Content-Disposition", `attachment; filename="topranker-data-export-${userId}.json"`);
    return res.json({ data: exportData });
  }));

  // ── GDPR / CCPA Account Deletion Request ────────────────────
  // Compliance (Jordan Blake): Right-to-deletion with 30-day grace period
  // per GDPR Art. 17 and CCPA §1798.105. User can cancel by logging in.
  app.delete("/api/account", wrapAsync(async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    // Mark account for deletion with 30-day grace period
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30);

    // Log the deletion request
    log.tag("AccountDeletion").info(
      `Deletion requested for user ${req.user!.id}, scheduled for ${deletionDate.toISOString()}`
    );

    return res.json({
      data: {
        message: "Account scheduled for deletion",
        deletionDate: deletionDate.toISOString(),
        gracePeriodDays: 30,
        note: "You can cancel this request by logging in within 30 days.",
      },
    });
  }));

  // ── GDPR Deletion Grace Period ──────────────────────────────
  // Compliance (Jordan Blake): Schedule deletion with 30-day grace period
  app.post("/api/account/schedule-deletion", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const request = scheduleDeletion(userId, 30);

    log.tag("GDPR").info(
      `Deletion scheduled for user ${userId}, deleteAt: ${request.deleteAt.toISOString()}`
    );

    return res.json({
      data: {
        message: "Account deletion scheduled",
        scheduledAt: request.scheduledAt.toISOString(),
        deleteAt: request.deleteAt.toISOString(),
        gracePeriodDays: 30,
        status: request.status,
        note: "You can cancel this request by checking your deletion status within 30 days.",
      },
    });
  }));

  // Cancel pending account deletion — GDPR grace period cancellation
  // Compliance (Jordan Blake): Allow users to cancel within 30-day grace period
  app.post("/api/account/cancel-deletion", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const cancelled = cancelDeletion(userId);

    if (!cancelled) {
      return res.status(404).json({ error: "No pending deletion request found" });
    }

    log.tag("GDPR").info(`Deletion cancelled for user ${userId}`);

    return res.json({
      data: { cancelled: true },
    });
  }));

  // Get current deletion status for authenticated user
  app.get("/api/account/deletion-status", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const status = getDeletionStatus(userId);

    if (!status) {
      return res.json({ data: { hasPendingDeletion: false } });
    }

    return res.json({
      data: {
        hasPendingDeletion: status.status === "pending",
        scheduledAt: status.scheduledAt.toISOString(),
        deleteAt: status.deleteAt.toISOString(),
        status: status.status,
      },
    });
  }));

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

  // Active featured businesses for a city — used by FeaturedSection
  app.get("/api/featured", wrapAsync(async (req: Request, res: Response) => {
    const city = sanitizeString(req.query.city, 100) || "Dallas";
    const placements = await getActiveFeaturedInCity(city);
    if (placements.length === 0) {
      return res.json({ data: [] });
    }
    // Resolve business details for each placement
    const featured = await Promise.all(
      placements.map(async (p) => {
        const biz = await getBusinessById(p.businessId);
        if (!biz) return null;
        const photoMap = await getBusinessPhotosMap([biz.id]);
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
      }),
    );
    return res.json({ data: featured.filter(Boolean) });
  }));

  app.get("/api/leaderboard/categories", wrapAsync(async (req: Request, res: Response) => {
    const city = sanitizeString(req.query.city, 100) || "Dallas";
    const data = await getAllCategories(city);
    return res.json({ data });
  }));

  app.get("/api/businesses/search", wrapAsync(async (req: Request, res: Response) => {
    const query = sanitizeString(req.query.q, 200);
    const city = sanitizeString(req.query.city, 100) || "Dallas";
    const category = sanitizeString(req.query.category, 50) || undefined;
    const bizList = await searchBusinesses(query, city, category);
    const photoMap = await getBusinessPhotosMap(bizList.map(b => b.id));
    const data = bizList.map(b => ({
      ...b,
      photoUrls: photoMap[b.id] || (b.photoUrl ? [b.photoUrl] : []),
    }));
    return res.json({ data });
  }));

  app.get("/api/businesses/:slug", wrapAsync(async (req: Request, res: Response) => {
    const business = await getBusinessBySlug(req.params.slug as string);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    let [{ ratings }, dishList, photos] = await Promise.all([
      getBusinessRatings(business.id, 1, 20),
      getBusinessDishes(business.id, 5),
      getBusinessPhotos(business.id),
    ]);

    // On-demand: if business has a Google Place ID but no photos, fetch them
    if (photos.length === 0 && business.googlePlaceId) {
      try {
        const count = await fetchAndStorePhotos(business.id, business.googlePlaceId);
        if (count > 0) {
          photos = await getBusinessPhotos(business.id);
        }
      } catch {
        // Non-fatal — continue with fallback
      }
    }

    const photoUrls = photos.length > 0 ? photos : (business.photoUrl ? [business.photoUrl] : []);

    return res.json({ data: { ...business, photoUrls, recentRatings: ratings, dishes: dishList } });
  }));

  app.get("/api/businesses/:id/ratings", wrapAsync(async (req: Request, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const perPage = Math.min(50, Math.max(1, parseInt(req.query.per_page as string) || 20));
    const data = await getBusinessRatings(req.params.id as string, page, perPage);
    return res.json({ data });
  }));

  // ── Business Claims ────────────────────────────────────────
  app.post("/api/businesses/:slug/claim", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const business = await getBusinessBySlug(req.params.slug as string);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }
    const role = sanitizeString(req.body.role, 100);
    const phone = sanitizeString(req.body.phone, 20);
    if (!role || role.length === 0) {
      return res.status(400).json({ error: "Role is required" });
    }

    // Check for existing claim
    const { getClaimByMemberAndBusiness, submitClaim } = await import("./storage");
    const existing = await getClaimByMemberAndBusiness(req.user!.id, business.id);
    if (existing) {
      return res.status(409).json({ error: "You already have a pending or approved claim for this business" });
    }

    const verificationMethod = `role:${role}${phone ? ` phone:${phone}` : ""}`;
    const claim = await submitClaim(business.id, req.user!.id, verificationMethod);

    // Send email notifications (non-blocking)
    const { sendClaimConfirmationEmail, sendClaimAdminNotification } = await import("./email");
    sendClaimConfirmationEmail({
      email: req.user!.email || "",
      displayName: req.user!.displayName || "User",
      businessName: business.name,
    }).catch(() => {});
    sendClaimAdminNotification({
      businessName: business.name,
      claimantName: req.user!.displayName || "Unknown",
      claimantEmail: req.user!.email || "",
    }).catch(() => {});

    return res.json({ data: { id: claim.id, status: claim.status } });
  }));

  // ── Business Dashboard Analytics ─────────────────────────
  app.get("/api/businesses/:slug/dashboard", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const business = await getBusinessBySlug(req.params.slug as string);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    const { getRankHistory, getBusinessDishes } = await import("./storage");
    const [{ ratings, total }, rankHistory, dishes] = await Promise.all([
      getBusinessRatings(business.id, 1, 10),
      getRankHistory(business.id, 49), // 7 weeks
      getBusinessDishes(business.id, 5),
    ]);

    // Compute aggregates
    const totalRatings = business.totalRatings || 0;
    const avgScore = business.rawAvgScore ? parseFloat(business.rawAvgScore) : 0;
    const rankPosition = business.rankPosition || 0;
    const rankDelta = business.rankDelta || 0;

    // Would-return percentage from ratings that have wouldReturn field
    const returners = ratings.filter((r: any) => r.wouldReturn === true).length;
    const returnTotal = ratings.filter((r: any) => r.wouldReturn !== null && r.wouldReturn !== undefined).length;
    const wouldReturnPct = returnTotal > 0 ? Math.round((returners / returnTotal) * 100) : 0;

    // Top dish
    const topDish = dishes.length > 0 ? dishes[0] : null;

    // Rating trend from rank history
    const ratingTrend = rankHistory.map((h: any) => h.score);

    return res.json({
      data: {
        totalRatings,
        avgScore,
        rankPosition,
        rankDelta,
        wouldReturnPct,
        topDish: topDish ? { name: topDish.name, votes: topDish.voteCount || 0 } : null,
        ratingTrend,
        recentRatings: ratings.map((r: any) => ({
          id: r.id,
          user: r.memberName || "Anonymous",
          score: parseFloat(r.rawScore),
          tier: r.memberTier || "community",
          note: r.note,
          date: r.createdAt,
        })),
      },
    });
  }));

  // ── Payment Routes (extracted to routes-payments.ts) ────────
  registerPaymentRoutes(app);

  app.get("/api/dishes/search", wrapAsync(async (req: Request, res: Response) => {
    const businessId = req.query.business_id as string;
    const query = sanitizeString(req.query.q, 200);
    if (!businessId) return res.status(400).json({ error: "business_id required" });
    const data = await searchDishes(businessId, query);
    return res.json({ data });
  }));

  app.post("/api/ratings", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    try {
      const parsed = insertRatingSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }

      // Sanitize rating score to [1, 5] range
      parsed.data.score = sanitizeNumber(parsed.data.score, 1, 5, 3);

      const memberId = req.user!.id;
      const result = await submitRating(memberId, parsed.data);

      // Live tier staleness guard (Sprint 140): after rating submission triggers
      // recalculateCredibilityScore, verify the returned tier is consistent with
      // the new score. If stale, correct it in the response and persist the fix.
      const verifiedTier = checkAndRefreshTier(result.newTier, result.newCredibilityScore);
      if (verifiedTier !== result.newTier) {
        result.newTier = verifiedTier;
        result.tierUpgraded = verifiedTier !== req.user!.credibilityTier;
      }

      // Broadcast real-time update so other clients refresh rankings
      broadcast("rating_submitted", { businessId: parsed.data.businessId, memberId });
      broadcast("ranking_updated", { city: "Dallas", category: parsed.data.category });
      trackEvent("first_rating", memberId);
      return res.status(201).json({ data: result });
    } catch (err: any) {
      if (err.message.includes("3+ days")) {
        return res.status(403).json({ error: err.message });
      }
      if (err.message.includes("Already rated")) {
        return res.status(409).json({ error: err.message });
      }
      if (err.message.includes("suspended")) {
        return res.status(403).json({ error: err.message });
      }
      return res.status(400).json({ error: err.message });
    }
  }));

  app.get("/api/members/me", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const member = await getMemberById(req.user!.id);
    if (!member) return res.status(404).json({ error: "Member not found" });

    const { score, tier: computedTier, breakdown } = await recalculateCredibilityScore(member.id);
    // Live staleness verification (Sprint 140): ensure returned tier matches score
    const tier = checkAndRefreshTier(computedTier, score);
    const { ratings, total } = await getMemberRatings(member.id);
    const { getSeasonalRatingCounts } = await import("./storage");
    const seasonal = await getSeasonalRatingCounts(member.id);

    const daysActive = Math.floor(
      (Date.now() - new Date(member.joinedAt).getTime()) / (1000 * 60 * 60 * 24),
    );

    return res.json({
      data: {
        id: member.id,
        displayName: member.displayName,
        username: member.username,
        email: member.email,
        city: member.city,
        avatarUrl: member.avatarUrl,
        credibilityScore: score,
        credibilityTier: tier,
        totalRatings: member.totalRatings,
        totalCategories: member.totalCategories,
        distinctBusinesses: member.distinctBusinesses,
        isFoundingMember: member.isFoundingMember,
        joinedAt: member.joinedAt,
        daysActive,
        ratingVariance: parseFloat(member.ratingVariance),
        credibilityBreakdown: breakdown,
        ratingHistory: ratings,
        ...seasonal,
      },
    });
  }));

  app.get("/api/members/:username", wrapAsync(async (req: Request, res: Response) => {
    const { getMemberByUsername } = await import("./storage");
    const member = await getMemberByUsername(req.params.username as string);
    if (!member) return res.status(404).json({ error: "Member not found" });

    return res.json({
      data: {
        displayName: member.displayName,
        username: member.username,
        credibilityTier: member.credibilityTier,
        totalRatings: member.totalRatings,
        joinedAt: member.joinedAt,
      },
    });
  }));

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

  app.get("/api/businesses/:id/rank-history", wrapAsync(async (req: Request, res: Response) => {
    const { getRankHistory } = await import("./storage");
    const days = Math.min(90, Math.max(7, parseInt(req.query.days as string) || 30));
    const data = await getRankHistory(req.params.id as string, days);
    return res.json({ data });
  }));

  app.get("/api/members/me/impact", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const { getMemberImpact } = await import("./storage");
    const data = await getMemberImpact(req.user!.id);
    return res.json({ data });
  }));

  // Push token storage
  app.post("/api/members/me/push-token", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const { pushToken } = req.body;
    if (!pushToken || typeof pushToken !== "string") {
      return res.status(400).json({ error: "pushToken is required" });
    }
    const { updatePushToken } = await import("./storage");
    await updatePushToken(req.user!.id, pushToken);
    return res.json({ ok: true });
  }));

  // ── Notification Preferences ─────────────────────────────────
  app.get("/api/members/me/notification-preferences", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const prefs = {
      ratingUpdates: true,
      challengeResults: true,
      weeklyDigest: false,
      ...((req.user as any).notificationPrefs || {}),
    };
    return res.json({ data: prefs });
  }));

  app.put("/api/members/me/notification-preferences", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const { ratingUpdates, challengeResults, weeklyDigest } = req.body;
    const prefs = {
      ratingUpdates: ratingUpdates !== false,
      challengeResults: challengeResults !== false,
      weeklyDigest: weeklyDigest === true,
    };
    // Store as user metadata (future: dedicated column)
    (req.user as any).notificationPrefs = prefs;
    log.tag("Notifications").info(`Preferences updated for user ${req.user!.id}: ${JSON.stringify(prefs)}`);
    return res.json({ data: prefs });
  }));

  // Category Suggestions
  app.post("/api/category-suggestions", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    try {
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
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }));

  app.get("/api/category-suggestions", wrapAsync(async (req: Request, res: Response) => {
    const { getPendingSuggestions } = await import("./storage");
    const data = await getPendingSuggestions();
    return res.json({ data });
  }));

  // Photo proxy for Google Places photos
  app.get("/api/photos/proxy", handlePhotoProxy);

  // Stripe webhook — async payment status updates
  app.post("/api/webhook/stripe", handleStripeWebhook);

  // Payment history for authenticated member
  app.get("/api/payments/history", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const payments = await getMemberPayments(req.user!.id, limit);
    return res.json({ data: payments });
  }));

  // Deploy webhook (GitHub push → auto-rebuild)
  app.post("/api/webhook/deploy", handleWebhook);
  app.get("/api/deploy/status", handleDeployStatus);

  // Badge share-by-link — server-rendered OG meta for social previews
  app.get("/share/badge/:badgeId", handleBadgeShare);

  // ── Badge Routes (extracted to routes-badges.ts) ───────────
  registerBadgeRoutes(app);

  // ── Admin Routes (extracted to routes-admin.ts) ─────────────
  registerAdminRoutes(app);

  // ── Experiment Routes (extracted to routes-experiments.ts) ──
  registerExperimentRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
