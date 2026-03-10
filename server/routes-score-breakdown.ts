/**
 * Sprint 268: Score Breakdown API
 * GET /api/businesses/:id/score-breakdown — detailed score breakdown by visit type
 *
 * Rating Integrity Part 9: "Score breakdown shows overall, per-visit-type,
 * food-only, verified percentage, and trend."
 *
 * Owner: Sarah Nakamura (Lead Eng)
 */

import type { Express, Request, Response } from "express";
import { wrapAsync } from "./wrap-async";
import { sanitizeString } from "./sanitize";
import { log } from "./logger";
import { computeDecayFactor } from "@shared/score-engine";

const breakdownLog = log.tag("ScoreBreakdown");

export function registerScoreBreakdownRoutes(app: Express): void {
  /**
   * GET /api/businesses/:id/score-breakdown
   * Returns detailed score breakdown with per-visit-type scores,
   * food-only score, verification stats, and rater distribution.
   */
  app.get("/api/businesses/:id/score-breakdown", wrapAsync(async (req: Request, res: Response) => {
    const businessId = req.params.id;

    const { db } = await import("./db");
    const { ratings } = await import("@shared/schema");
    const { eq, and, sql, count } = await import("drizzle-orm");

    // Get all non-flagged ratings for this business
    const allRatings = await db.select({
      visitType: ratings.visitType,
      foodScore: ratings.foodScore,
      serviceScore: ratings.serviceScore,
      vibeScore: ratings.vibeScore,
      packagingScore: ratings.packagingScore,
      waitTimeScore: ratings.waitTimeScore,
      valueScore: ratings.valueScore,
      compositeScore: ratings.compositeScore,
      rawScore: ratings.rawScore,
      weight: ratings.weight,
      weightedScore: ratings.weightedScore,
      effectiveWeight: ratings.effectiveWeight,
      verificationBoost: ratings.verificationBoost,
      hasPhoto: ratings.hasPhoto,
      hasReceipt: ratings.hasReceipt,
      wouldReturn: ratings.wouldReturn,
      createdAt: ratings.createdAt,
    })
      .from(ratings)
      .where(and(
        eq(ratings.businessId, businessId),
        eq(ratings.isFlagged, false),
      ));

    if (allRatings.length === 0) {
      return res.json({
        data: {
          totalRatings: 0,
          overallScore: 0,
          foodScoreOnly: 0,
          dineIn: null,
          delivery: null,
          takeaway: null,
          verifiedPercentage: 0,
          wouldReturnPercentage: 0,
          raterDistribution: { dineIn: 0, delivery: 0, takeaway: 0 },
        },
      });
    }

    // Group by visit type
    const dineIn = allRatings.filter(r => r.visitType === "dine_in");
    const delivery = allRatings.filter(r => r.visitType === "delivery");
    const takeaway = allRatings.filter(r => r.visitType === "takeaway");

    // Sprint 271: Weighted averages with exponential temporal decay
    const weightedAvg = (items: typeof allRatings, field: keyof typeof allRatings[0]) => {
      let num = 0, den = 0;
      for (const r of items) {
        const val = parseFloat(String(r[field] ?? 0));
        const w = parseFloat(String(r.effectiveWeight ?? r.weight ?? 1));
        const ageDays = Math.floor(
          (Date.now() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24),
        );
        const decay = computeDecayFactor(ageDays);
        const decayedW = w * decay;
        num += val * decayedW;
        den += decayedW;
      }
      return den > 0 ? Math.round((num / den) * 100) / 100 : 0;
    };

    // Use compositeScore when available (Sprint 267+ ratings), fall back to rawScore
    const overallScore = weightedAvg(allRatings, "compositeScore");
    const foodScoreOnly = weightedAvg(allRatings, "foodScore");

    // Per-visit-type breakdowns
    const visitBreakdown = (items: typeof allRatings) => {
      if (items.length === 0) return null;
      return {
        count: items.length,
        overallScore: weightedAvg(items, "compositeScore"),
        foodScore: weightedAvg(items, "foodScore"),
      };
    };

    // Verification stats
    const withPhoto = allRatings.filter(r => r.hasPhoto).length;
    const verifiedPercentage = Math.round((withPhoto / allRatings.length) * 100);

    // Would return
    const returners = allRatings.filter(r => r.wouldReturn).length;
    const wouldReturnPercentage = Math.round((returners / allRatings.length) * 100);

    breakdownLog.info("Score breakdown served", {
      businessId,
      totalRatings: allRatings.length,
    });

    return res.json({
      data: {
        totalRatings: allRatings.length,
        overallScore,
        foodScoreOnly,
        dineIn: visitBreakdown(dineIn),
        delivery: visitBreakdown(delivery),
        takeaway: visitBreakdown(takeaway),
        verifiedPercentage,
        wouldReturnPercentage,
        raterDistribution: {
          dineIn: dineIn.length,
          delivery: delivery.length,
          takeaway: takeaway.length,
        },
      },
    });
  }));

  /**
   * Sprint 276: GET /api/businesses/:id/score-trend
   * Returns weighted score history from rank_history table for sparkline display.
   */
  app.get("/api/businesses/:id/score-trend", wrapAsync(async (req: Request, res: Response) => {
    const businessId = req.params.id;

    const { db } = await import("./db");
    const { rankHistory } = await import("@shared/schema");
    const { eq, asc } = await import("drizzle-orm");

    const history = await db.select({
      date: rankHistory.snapshotDate,
      score: rankHistory.weightedScore,
    })
      .from(rankHistory)
      .where(eq(rankHistory.businessId, businessId))
      .orderBy(asc(rankHistory.snapshotDate))
      .limit(90); // Last 90 snapshots

    const data = history.map(h => ({
      date: h.date,
      score: parseFloat(h.score),
    }));

    return res.json({ data });
  }));
}
