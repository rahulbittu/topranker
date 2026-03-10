/**
 * Sprint 486: Business Analytics Routes
 * Extracted from routes-businesses.ts to reduce file size.
 *
 * Endpoints:
 * - GET /api/businesses/:slug/dashboard (owner dashboard analytics)
 * - GET /api/businesses/:id/rank-history (public rank history)
 * - GET /api/businesses/:id/dimension-breakdown (public dimension scores)
 */

import type { Express, Request, Response } from "express";
import { getBusinessBySlug, getBusinessRatings } from "./storage";
import { wrapAsync } from "./wrap-async";
import { requireAuth } from "./middleware";
import { buildDashboardTrend } from "./dashboard-analytics";
import { computeDimensionBreakdown } from "./dimension-breakdown";

export function registerBusinessAnalyticsRoutes(app: Express) {
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

  // ── Rank History ────────────────────────────────────────────
  app.get("/api/businesses/:id/rank-history", wrapAsync(async (req: Request, res: Response) => {
    const { getRankHistory } = await import("./storage");
    const days = Math.min(90, Math.max(7, parseInt(req.query.days as string) || 30));
    const data = await getRankHistory(req.params.id as string, days);
    return res.json({ data });
  }));

  // ── Sprint 484: Dimension Score Breakdown ────────────────────
  app.get("/api/businesses/:id/dimension-breakdown", wrapAsync(async (req: Request, res: Response) => {
    const { ratings } = await getBusinessRatings(req.params.id as string, 1, 200);
    const data = computeDimensionBreakdown(ratings as any[]);
    return res.json({ data });
  }));
}
