import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import passport from "passport";
import { setupAuth, registerMember, authenticateGoogleUser } from "./auth";
import { handleWebhook, handleDeployStatus } from "./deploy";
import { handlePhotoProxy } from "./photos";
import { handleBadgeShare } from "./badge-share";
import { sendWelcomeEmail } from "./email";
import { registerAdminRoutes } from "./routes-admin";
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
  getMemberBadges,
  getMemberBadgeCount,
  awardBadge,
  getEarnedBadgeIds,
  getBadgeLeaderboard,
} from "./storage";
import { fetchAndStorePhotos } from "./google-places";
import { insertRatingSchema, insertCategorySuggestionSchema } from "@shared/schema";

function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

// In-memory rate limiter — per IP, configurable limits
const rateLimitBuckets = new Map<string, Map<string, { count: number; resetAt: number }>>();

function createRateLimiter(name: string, maxRequests: number, windowMs: number) {
  const bucket = new Map<string, { count: number; resetAt: number }>();
  rateLimitBuckets.set(name, bucket);

  return function rateLimit(req: Request, res: Response, next: Function) {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const entry = bucket.get(ip);
    if (entry && entry.resetAt > now) {
      if (entry.count >= maxRequests) {
        return res.status(429).json({ error: "Too many requests. Please try again later." });
      }
      entry.count++;
    } else {
      bucket.set(ip, { count: 1, resetAt: now + windowMs });
    }
    next();
  };
}

// Auth: 10 requests per minute (strict)
const authRateLimit = createRateLimiter("auth", 10, 60000);

// API: 100 requests per minute (general public endpoints)
const apiRateLimit = createRateLimiter("api", 100, 60000);

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [, bucket] of rateLimitBuckets) {
    for (const [ip, entry] of bucket) {
      if (entry.resetAt <= now) bucket.delete(ip);
    }
  }
}, 300000);

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

  // Global API rate limit — 100 req/min per IP (excludes /api/health and /api/auth)
  app.use("/api/leaderboard", apiRateLimit);
  app.use("/api/businesses", apiRateLimit);
  app.use("/api/dishes", apiRateLimit);
  app.use("/api/challengers", apiRateLimit);
  app.use("/api/trending", apiRateLimit);
  app.use("/api/members", apiRateLimit);
  app.use("/api/ratings", apiRateLimit);
  app.use("/api/photos", apiRateLimit);

  // Health check — lightest possible response for connectivity checks and uptime monitoring
  app.get("/api/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok", ts: Date.now() });
  });

  app.post("/api/auth/signup", authRateLimit, async (req: Request, res: Response) => {
    try {
      const { displayName, username, email, password, city } = req.body;

      if (!displayName || !username || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      const member = await registerMember({ displayName, username, email, password, city });

      // Fire-and-forget welcome email (don't block signup on email delivery)
      sendWelcomeEmail({
        email: member.email,
        displayName: member.displayName,
        city: member.city,
        username: member.username,
      }).catch((emailErr) => log.error("Welcome email failed:", emailErr));

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
  });

  app.post("/api/auth/login", authRateLimit, (req: Request, res: Response, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return res.status(500).json({ error: "Internal server error" });
      if (!user) return res.status(401).json({ error: info?.message || "Invalid credentials" });

      req.login(user, (loginErr) => {
        if (loginErr) return res.status(500).json({ error: "Login failed" });
        return res.json({ data: user });
      });
    })(req, res, next);
  });

  app.post("/api/auth/google", authRateLimit, async (req: Request, res: Response) => {
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
  });

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

  app.get("/api/leaderboard", async (req: Request, res: Response) => {
    try {
      const city = (req.query.city as string) || "Dallas";
      const category = (req.query.category as string) || "restaurant";
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));

      const bizList = await getLeaderboard(city, category, limit);
      const photoMap = await getBusinessPhotosMap(bizList.map(b => b.id));
      const data = bizList.map(b => ({
        ...b,
        photoUrls: photoMap[b.id] || (b.photoUrl ? [b.photoUrl] : []),
      }));
      return res.json({ data });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/leaderboard/categories", async (req: Request, res: Response) => {
    try {
      const city = (req.query.city as string) || "Dallas";
      const data = await getAllCategories(city);
      return res.json({ data });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/businesses/search", async (req: Request, res: Response) => {
    try {
      const query = (req.query.q as string) || "";
      const city = (req.query.city as string) || "Dallas";
      const category = req.query.category as string | undefined;
      const bizList = await searchBusinesses(query, city, category);
      const photoMap = await getBusinessPhotosMap(bizList.map(b => b.id));
      const data = bizList.map(b => ({
        ...b,
        photoUrls: photoMap[b.id] || (b.photoUrl ? [b.photoUrl] : []),
      }));
      return res.json({ data });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/businesses/:slug", async (req: Request, res: Response) => {
    try {
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
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/businesses/:id/ratings", async (req: Request, res: Response) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const perPage = Math.min(50, Math.max(1, parseInt(req.query.per_page as string) || 20));
      const data = await getBusinessRatings(req.params.id as string, page, perPage);
      return res.json({ data });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Business Claims ────────────────────────────────────────
  app.post("/api/businesses/:slug/claim", requireAuth, async (req: Request, res: Response) => {
    try {
      const business = await getBusinessBySlug(req.params.slug as string);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }
      const { role, phone } = req.body;
      if (!role || typeof role !== "string" || role.trim().length === 0) {
        return res.status(400).json({ error: "Role is required" });
      }

      // Check for existing claim
      const { getClaimByMemberAndBusiness, submitClaim } = await import("./storage");
      const existing = await getClaimByMemberAndBusiness(req.user!.id, business.id);
      if (existing) {
        return res.status(409).json({ error: "You already have a pending or approved claim for this business" });
      }

      const verificationMethod = `role:${role.trim()}${phone ? ` phone:${phone.trim()}` : ""}`;
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
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Business Dashboard Analytics ─────────────────────────
  app.get("/api/businesses/:slug/dashboard", requireAuth, async (req: Request, res: Response) => {
    try {
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
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ── Payment Endpoints ──────────────────────────────────────
  app.post("/api/payments/challenger", requireAuth, async (req: Request, res: Response) => {
    try {
      const { businessName, slug } = req.body;
      if (!businessName || !slug) {
        return res.status(400).json({ error: "businessName and slug are required" });
      }
      const business = await getBusinessBySlug(slug);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }
      const { createChallengerPayment } = await import("./payments");
      const payment = await createChallengerPayment({
        challengerId: business.id,
        businessName,
        customerEmail: req.user!.email || "",
        userId: req.user!.id,
      });
      return res.json({ data: payment });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/payments/dashboard-pro", requireAuth, async (req: Request, res: Response) => {
    try {
      const { slug } = req.body;
      if (!slug) {
        return res.status(400).json({ error: "slug is required" });
      }
      const business = await getBusinessBySlug(slug);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }
      const { createDashboardProPayment } = await import("./payments");
      const payment = await createDashboardProPayment({
        businessId: business.id,
        businessName: business.name,
        customerEmail: req.user!.email || "",
        userId: req.user!.id,
      });
      return res.json({ data: payment });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/payments/featured", requireAuth, async (req: Request, res: Response) => {
    try {
      const { slug } = req.body;
      if (!slug) {
        return res.status(400).json({ error: "slug is required" });
      }
      const business = await getBusinessBySlug(slug);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }
      const { createFeaturedPlacementPayment } = await import("./payments");
      const payment = await createFeaturedPlacementPayment({
        businessId: business.id,
        businessName: business.name,
        city: business.city,
        customerEmail: req.user!.email || "",
        userId: req.user!.id,
      });
      return res.json({ data: payment });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/dishes/search", async (req: Request, res: Response) => {
    try {
      const businessId = req.query.business_id as string;
      const query = (req.query.q as string) || "";
      if (!businessId) return res.status(400).json({ error: "business_id required" });
      const data = await searchDishes(businessId, query);
      return res.json({ data });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/ratings", requireAuth, async (req: Request, res: Response) => {
    try {
      const parsed = insertRatingSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }

      const memberId = req.user!.id;
      const result = await submitRating(memberId, parsed.data);
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
  });

  app.get("/api/members/me", requireAuth, async (req: Request, res: Response) => {
    try {
      const member = await getMemberById(req.user!.id);
      if (!member) return res.status(404).json({ error: "Member not found" });

      const { score, tier, breakdown } = await recalculateCredibilityScore(member.id);
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
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/members/:username", async (req: Request, res: Response) => {
    try {
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
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/challengers/active", async (req: Request, res: Response) => {
    try {
      const city = (req.query.city as string) || "Dallas";
      const category = req.query.category as string | undefined;
      const data = await getActiveChallenges(city, category);
      return res.json({ data });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/trending", async (req: Request, res: Response) => {
    try {
      const { getTrendingBusinesses } = await import("./storage");
      const city = (req.query.city as string) || "Dallas";
      const limit = Math.min(10, Math.max(1, parseInt(req.query.limit as string) || 3));
      const bizList = await getTrendingBusinesses(city, limit);
      const photoMap = await getBusinessPhotosMap(bizList.map(b => b.id));
      const data = bizList.map(b => ({
        ...b,
        photoUrls: photoMap[b.id] || (b.photoUrl ? [b.photoUrl] : []),
      }));
      return res.json({ data });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/businesses/:id/rank-history", async (req: Request, res: Response) => {
    try {
      const { getRankHistory } = await import("./storage");
      const days = Math.min(90, Math.max(7, parseInt(req.query.days as string) || 30));
      const data = await getRankHistory(req.params.id as string, days);
      return res.json({ data });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/members/me/impact", requireAuth, async (req: Request, res: Response) => {
    try {
      const { getMemberImpact } = await import("./storage");
      const data = await getMemberImpact(req.user!.id);
      return res.json({ data });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Push token storage
  app.post("/api/members/me/push-token", requireAuth, async (req: Request, res: Response) => {
    try {
      const { pushToken } = req.body;
      if (!pushToken || typeof pushToken !== "string") {
        return res.status(400).json({ error: "pushToken is required" });
      }
      const { updatePushToken } = await import("./storage");
      await updatePushToken(req.user!.id, pushToken);
      return res.json({ ok: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Category Suggestions
  app.post("/api/category-suggestions", requireAuth, async (req: Request, res: Response) => {
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
  });

  app.get("/api/category-suggestions", async (req: Request, res: Response) => {
    try {
      const { getPendingSuggestions } = await import("./storage");
      const data = await getPendingSuggestions();
      return res.json({ data });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Photo proxy for Google Places photos
  app.get("/api/photos/proxy", handlePhotoProxy);

  // Deploy webhook (GitHub push → auto-rebuild)
  app.post("/api/webhook/deploy", handleWebhook);
  app.get("/api/deploy/status", handleDeployStatus);

  // Badge share-by-link — server-rendered OG meta for social previews
  app.get("/share/badge/:badgeId", handleBadgeShare);

  // ── Badge Persistence Endpoints ──────────────────────────────

  // GET /api/members/:id/badges — list earned badge IDs for a member
  app.get("/api/members/:id/badges", async (req: Request, res: Response) => {
    try {
      const memberId = req.params.id as string;
      const badges = await getMemberBadges(memberId);
      return res.json({ data: badges });
    } catch (err: any) {
      log.error(`Failed to fetch member badges: ${err.message}`);
      return res.status(500).json({ error: "Failed to fetch badges" });
    }
  });

  // POST /api/badges/award — award a badge to the authenticated user
  app.post("/api/badges/award", requireAuth, async (req: Request, res: Response) => {
    try {
      const memberId = req.user!.id;
      const { badgeId, badgeFamily } = req.body;
      if (!badgeId || !badgeFamily) {
        return res.status(400).json({ error: "badgeId and badgeFamily are required" });
      }
      const result = await awardBadge(memberId, badgeId, badgeFamily);
      return res.json({ data: result, awarded: result !== null });
    } catch (err: any) {
      log.error(`Failed to award badge: ${err.message}`);
      return res.status(500).json({ error: "Failed to award badge" });
    }
  });

  // GET /api/badges/earned — get earned badge IDs for authenticated user
  app.get("/api/badges/earned", requireAuth, async (req: Request, res: Response) => {
    try {
      const memberId = req.user!.id;
      const badgeIds = await getEarnedBadgeIds(memberId);
      const badgeCount = badgeIds.length;
      return res.json({ data: { badgeIds, badgeCount } });
    } catch (err: any) {
      log.error(`Failed to fetch earned badges: ${err.message}`);
      return res.status(500).json({ error: "Failed to fetch earned badges" });
    }
  });

  // GET /api/badges/leaderboard — top members by badge count
  app.get("/api/badges/leaderboard", async (req: Request, res: Response) => {
    try {
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
      const data = await getBadgeLeaderboard(limit);
      return res.json({ data });
    } catch (err: any) {
      log.error(`Failed to fetch badge leaderboard: ${err.message}`);
      return res.status(500).json({ error: "Failed to fetch badge leaderboard" });
    }
  });

  // ── Admin Routes (extracted to routes-admin.ts) ─────────────
  registerAdminRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
