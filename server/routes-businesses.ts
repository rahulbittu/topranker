/**
 * Business routes — extracted from routes.ts (Sprint 171)
 *
 * Endpoints:
 * - GET  /api/businesses/search
 * - GET  /api/businesses/:slug
 * - GET  /api/businesses/:id/ratings
 * - POST /api/businesses/:slug/claim
 * - GET  /api/businesses/:slug/dashboard
 * - GET  /api/businesses/:id/rank-history
 */

import type { Express, Request, Response } from "express";
import { log } from "./logger";
import {
  getBusinessBySlug, getBusinessRatings, getBusinessDishes,
  searchBusinesses, countBusinessSearch, getBusinessPhotos, getBusinessPhotosMap,
  autocompleteBusinesses, getPopularCategories,
} from "./storage";
import { fetchAndStorePhotos } from "./google-places";
import { sanitizeString } from "./sanitize";
import { wrapAsync } from "./wrap-async";
import { requireAuth } from "./middleware";
import { computeOpenStatus } from "./hours-utils";
// Sprint 476: Extracted search processing to dedicated module
import { enrichSearchResults, applySearchFilters, sortByRelevance, haversineKm } from "./search-result-processor";
// Sprint 478: Dashboard analytics
import { buildDashboardTrend } from "./dashboard-analytics";

export function registerBusinessRoutes(app: Express) {
  // Sprint 184: Autocomplete — lightweight typeahead for search-as-you-type
  app.get("/api/businesses/autocomplete", wrapAsync(async (req: Request, res: Response) => {
    const query = sanitizeString(req.query.q, 50);
    const city = sanitizeString(req.query.city, 100) || "Dallas";
    if (!query || query.trim().length === 0) {
      return res.json({ data: [] });
    }
    const suggestions = await autocompleteBusinesses(query, city);
    return res.json({ data: suggestions });
  }));

  // Sprint 184: Popular categories — dynamic suggestion chips by city
  app.get("/api/businesses/popular-categories", wrapAsync(async (req: Request, res: Response) => {
    const city = sanitizeString(req.query.city, 100) || "Dallas";
    const categories = await getPopularCategories(city);
    return res.json({ data: categories });
  }));

  app.get("/api/businesses/search", wrapAsync(async (req: Request, res: Response) => {
    const query = sanitizeString(req.query.q, 200);
    const city = sanitizeString(req.query.city, 100) || "Dallas";
    const category = sanitizeString(req.query.category, 50) || undefined;
    const cuisine = sanitizeString(req.query.cuisine, 50) || undefined;
    // Sprint 442: Dietary tags filter (comma-separated)
    const dietaryParam = sanitizeString(req.query.dietary, 200) || "";
    const dietaryTags = dietaryParam ? dietaryParam.split(",").map(t => t.trim()).filter(Boolean) : [];
    // Sprint 442: Distance filter (km) with user lat/lng
    const userLat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const userLng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;
    const maxDistanceKm = req.query.maxDistance ? parseFloat(req.query.maxDistance as string) : undefined;
    // Sprint 447: Hours-based search filters
    const openNow = req.query.openNow === "true";
    const openLate = req.query.openLate === "true";
    const openWeekends = req.query.openWeekends === "true";
    // Sprint 473: Pagination params
    const pageLimit = Math.min(Math.max(parseInt(req.query.limit as string) || 20, 1), 100);
    const pageOffset = Math.max(parseInt(req.query.offset as string) || 0, 0);

    const [bizList, totalCount] = await Promise.all([
      searchBusinesses(query, city, category, pageLimit, cuisine, pageOffset),
      countBusinessSearch(query, city, category, cuisine),
    ]);
    const photoMap = await getBusinessPhotosMap(bizList.map(b => b.id));

    // Sprint 476: Extracted to search-result-processor.ts
    const processingOpts = { query, userLat, userLng, maxDistanceKm, dietaryTags, openNow, openLate, openWeekends };
    const enriched = enrichSearchResults(bizList, photoMap, processingOpts);
    const filtered = applySearchFilters(enriched, processingOpts);
    const data = sortByRelevance(filtered, query);

    // Sprint 473: Include pagination metadata
    return res.json({
      data,
      pagination: {
        total: totalCount,
        limit: pageLimit,
        offset: pageOffset,
        hasMore: pageOffset + pageLimit < totalCount,
      },
    });
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

    // Sprint 453: Dynamic hours computation for single business
    const bHours = (business as any).openingHours;
    const openStatus = computeOpenStatus(bHours);
    const dynamicIsOpenNow = bHours ? openStatus.isOpen : (business.isOpenNow ?? false);

    return res.json({ data: {
      ...business,
      photoUrls,
      recentRatings: ratings,
      dishes: dishList,
      isOpenNow: dynamicIsOpenNow,
      closingTime: openStatus.closingTime,
      nextOpenTime: openStatus.nextOpenTime,
      todayHours: openStatus.todayHours,
    } });
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
    const businessEmail = sanitizeString(req.body.businessEmail, 100);
    const website = sanitizeString(req.body.website, 200);
    const preferredMethod = sanitizeString(req.body.verificationMethod, 20) || "email";
    if (!role || role.length === 0) {
      return res.status(400).json({ error: "Role is required" });
    }

    const { getClaimByMemberAndBusiness, submitClaim } = await import("./storage");
    const existing = await getClaimByMemberAndBusiness(req.user!.id, business.id);
    if (existing) {
      return res.status(409).json({ error: "You already have a pending or approved claim for this business" });
    }

    // Sprint 394: Enhanced verification data
    const parts = [`role:${role}`, `method:${preferredMethod}`];
    if (phone) parts.push(`phone:${phone}`);
    if (businessEmail) parts.push(`email:${businessEmail}`);
    if (website) parts.push(`website:${website}`);
    const verificationMethod = parts.join(" | ");
    const claim = await submitClaim(business.id, req.user!.id, verificationMethod);

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

    // Sprint 173: Only business owner or admin can access dashboard
    const { isAdminEmail } = await import("@shared/admin");
    const isOwner = business.ownerId && business.ownerId === req.user!.id;
    const isAdmin = isAdminEmail(req.user?.email);
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Dashboard access requires business ownership" });
    }

    const { getRankHistory, getBusinessDishes } = await import("./storage");
    const [{ ratings, total }, rankHistory, dishes, allRatingsResult] = await Promise.all([
      getBusinessRatings(business.id, 1, 10),
      getRankHistory(business.id, 49),
      getBusinessDishes(business.id, 5),
      getBusinessRatings(business.id, 1, 200), // Sprint 478: all ratings for trend analysis
    ]);

    const totalRatings = business.totalRatings || 0;
    const avgScore = business.rawAvgScore ? parseFloat(business.rawAvgScore) : 0;
    const rankPosition = business.rankPosition || 0;
    const rankDelta = business.rankDelta || 0;

    const returners = ratings.filter((r: any) => r.wouldReturn === true).length;
    const returnTotal = ratings.filter((r: any) => r.wouldReturn !== null && r.wouldReturn !== undefined).length;
    const wouldReturnPct = returnTotal > 0 ? Math.round((returners / returnTotal) * 100) : 0;

    const topDish = dishes.length > 0 ? dishes[0] : null;
    const ratingTrend = rankHistory.map((h: any) => h.score);

    // Sprint 176: Subscription tier determines data depth
    const isPro = business.subscriptionStatus === "active" || business.subscriptionStatus === "trialing" || isAdmin;

    // Sprint 478: Rating trend analytics (weekly/monthly volume + sparkline)
    const trendData = buildDashboardTrend(allRatingsResult.ratings as any[]);

    const baseData = {
      totalRatings,
      avgScore,
      rankPosition,
      rankDelta,
      wouldReturnPct,
      topDish: topDish ? { name: topDish.name, votes: topDish.voteCount || 0 } : null,
      ratingTrend: isPro ? ratingTrend : ratingTrend.slice(-7), // Free: 7 days, Pro: full history
      recentRatings: (isPro ? ratings : ratings.slice(0, 3)).map((r: any) => ({
        id: r.id,
        user: r.memberName || "Anonymous",
        score: parseFloat(r.rawScore),
        tier: r.memberTier || "community",
        note: isPro ? r.note : undefined, // Notes are Pro-only
        date: r.createdAt,
      })),
      // Sprint 478: Trend analytics
      weeklyVolume: isPro ? trendData.weeklyVolume : trendData.weeklyVolume.slice(-4),
      monthlyVolume: isPro ? trendData.monthlyVolume : trendData.monthlyVolume.slice(-3),
      velocityChange: trendData.velocityChange,
      sparklineScores: trendData.sparklineScores,
      subscriptionStatus: business.subscriptionStatus || "none",
      isPro,
    };

    return res.json({ data: baseData });
  }));

  app.get("/api/businesses/:id/rank-history", wrapAsync(async (req: Request, res: Response) => {
    const { getRankHistory } = await import("./storage");
    const days = Math.min(90, Math.max(7, parseInt(req.query.days as string) || 30));
    const data = await getRankHistory(req.params.id as string, days);
    return res.json({ data });
  }));

  // ── Sprint 438: Community Photo Upload ──────────────────────
  app.post("/api/businesses/:id/photos", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const businessId = req.params.id as string;
    const memberId = req.user!.id;

    // Validate photo data
    const { data: photoData, mimeType: rawMime, caption: rawCaption } = req.body;
    const mimeType = sanitizeString(rawMime, 50) || "image/jpeg";
    const caption = sanitizeString(rawCaption, 500) || "";

    const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
    if (!ALLOWED_MIME.includes(mimeType)) {
      return res.status(400).json({ error: `Invalid image type. Allowed: ${ALLOWED_MIME.join(", ")}` });
    }

    if (!photoData || typeof photoData !== "string") {
      return res.status(400).json({ error: "Photo data is required (base64)" });
    }

    const buffer = Buffer.from(photoData, "base64");
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const MIN_SIZE = 1024; // 1KB
    if (buffer.length > MAX_SIZE) {
      return res.status(400).json({ error: "Photo too large (max 10MB)" });
    }
    if (buffer.length < MIN_SIZE) {
      return res.status(400).json({ error: "Photo too small (min 1KB)" });
    }

    // Upload to file storage
    const { fileStorage } = await import("./file-storage");
    const ext = mimeType.split("/")[1] || "jpeg";
    const crypto = await import("crypto");
    const key = `community-photos/${businessId}/${memberId}-${crypto.randomUUID()}.${ext}`;
    const url = await fileStorage.upload(key, buffer, mimeType);

    // Submit to moderation queue (Sprint 441: DB-backed)
    const { submitPhoto } = await import("./photo-moderation");
    const result = await submitPhoto(businessId, memberId, url, caption, buffer.length, mimeType);
    if ("error" in result) {
      return res.status(400).json({ error: result.error });
    }

    log.info(`Community photo uploaded: ${result.id} for business ${businessId} by ${memberId}`);
    return res.status(201).json({
      data: {
        id: result.id,
        url: result.url,
        status: result.status,
        message: "Photo submitted for review",
      },
    });
  }));

}
