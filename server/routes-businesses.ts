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
  searchBusinesses, getBusinessPhotos, getBusinessPhotosMap,
  autocompleteBusinesses, getPopularCategories,
} from "./storage";
import { fetchAndStorePhotos } from "./google-places";
import { sanitizeString } from "./sanitize";
import { wrapAsync } from "./wrap-async";
import { requireAuth } from "./middleware";

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

    const { getClaimByMemberAndBusiness, submitClaim } = await import("./storage");
    const existing = await getClaimByMemberAndBusiness(req.user!.id, business.id);
    if (existing) {
      return res.status(409).json({ error: "You already have a pending or approved claim for this business" });
    }

    const verificationMethod = `role:${role}${phone ? ` phone:${phone}` : ""}`;
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
    const [{ ratings, total }, rankHistory, dishes] = await Promise.all([
      getBusinessRatings(business.id, 1, 10),
      getRankHistory(business.id, 49),
      getBusinessDishes(business.id, 5),
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

  // ── Rating Responses (Sprint 177) ────────────────────────

  // Submit or update an owner response to a rating
  app.post("/api/ratings/:id/response", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const ratingId = req.params.id as string;
    const responseText = sanitizeString(req.body.responseText, 500);
    if (!responseText || responseText.length < 2) {
      return res.status(400).json({ error: "Response text is required (2-500 characters)" });
    }

    // Look up the rating to find the business
    const { getRatingById, submitRatingResponse, getMemberById } = await import("./storage");
    const rating = await getRatingById(ratingId);
    if (!rating) {
      return res.status(404).json({ error: "Rating not found" });
    }

    // Verify caller owns the business
    const business = await getBusinessBySlug(rating.businessId);
    const businessById = business || await (await import("./storage")).getBusinessById(rating.businessId);
    if (!businessById) {
      return res.status(404).json({ error: "Business not found" });
    }
    if (businessById.ownerId !== req.user!.id) {
      return res.status(403).json({ error: "Only the business owner can respond to ratings" });
    }

    // Check Pro subscription (or admin)
    const { isAdminEmail } = await import("@shared/admin");
    const isAdmin = isAdminEmail(req.user?.email);
    const isPro = businessById.subscriptionStatus === "active" || businessById.subscriptionStatus === "trialing";
    if (!isPro && !isAdmin) {
      return res.status(403).json({ error: "Dashboard Pro subscription required to respond to ratings" });
    }

    const response = await submitRatingResponse(ratingId, businessById.id, req.user!.id, responseText);

    // Push notification to the original rater (Sprint 175 trigger)
    const rater = await getMemberById(rating.memberId);
    if (rater?.pushToken) {
      const { notifyRatingResponse } = await import("./push");
      notifyRatingResponse(rater.id, rater.pushToken, businessById.name, responseText).catch(() => {});
    }

    return res.status(201).json({ data: response });
  }));

  // Get a response for a specific rating (public)
  app.get("/api/ratings/:id/response", wrapAsync(async (req: Request, res: Response) => {
    const { getRatingResponse } = await import("./storage");
    const response = await getRatingResponse(req.params.id as string);
    if (!response) {
      return res.status(404).json({ error: "No response found" });
    }
    return res.json({ data: response });
  }));

  // Delete a response (owner only)
  app.delete("/api/ratings/:id/response", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const ratingId = req.params.id as string;
    const { getRatingById, deleteRatingResponse } = await import("./storage");
    const rating = await getRatingById(ratingId);
    if (!rating) {
      return res.status(404).json({ error: "Rating not found" });
    }

    const businessById = await (await import("./storage")).getBusinessById(rating.businessId);
    if (!businessById || businessById.ownerId !== req.user!.id) {
      return res.status(403).json({ error: "Only the business owner can delete responses" });
    }

    const deleted = await deleteRatingResponse(ratingId, req.user!.id);
    if (!deleted) {
      return res.status(404).json({ error: "Response not found" });
    }
    return res.json({ data: { deleted: true } });
  }));
}
