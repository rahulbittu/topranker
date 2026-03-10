/**
 * Sprint 448: City Stats API
 * Provides aggregated city-level metrics for comparison.
 * Owner: Sarah Nakamura (Lead Eng)
 */

import { Router, Request, Response } from "express";
import { log } from "./logger";
import { db } from "./db";
import { businesses, ratings } from "@shared/schema";
import { eq, sql, and, isNotNull, gte } from "drizzle-orm";

const cityLog = log.tag("CityStats");

export interface CityStatsResponse {
  city: string;
  totalBusinesses: number;
  avgWeightedScore: number;
  avgRatingCount: number;
  avgWouldReturnPct: number;
  recentRatingsCount: number; // last 30 days
  dimensionAvgs: Record<string, number>;
}

export function registerCityStatsRoutes(app: Router): void {
  // GET /api/city-stats/:city — aggregated city metrics
  app.get("/api/city-stats/:city", async (req: Request, res: Response) => {
    const city = req.params.city;
    cityLog.info(`Fetching city stats for ${city}`);

    const activeBiz = await db.select({
      id: businesses.id,
      weightedScore: businesses.weightedScore,
      totalRatings: businesses.totalRatings,
    }).from(businesses).where(
      and(eq(businesses.city, city), eq(businesses.isActive, true))
    );

    if (activeBiz.length === 0) {
      return res.json({
        city,
        totalBusinesses: 0,
        avgWeightedScore: 0,
        avgRatingCount: 0,
        avgWouldReturnPct: 0,
        recentRatingsCount: 0,
        dimensionAvgs: {},
      });
    }

    // Average weighted score
    const scores = activeBiz.map(b => parseFloat(b.weightedScore || "0")).filter(s => s > 0);
    const avgWeightedScore = scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100
      : 0;

    // Average rating count
    const ratingCounts = activeBiz.map(b => b.totalRatings || 0);
    const avgRatingCount = Math.round(ratingCounts.reduce((a, b) => a + b, 0) / ratingCounts.length);

    // Would-return percentage from recent ratings
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentRatings = await db.select({
      wouldReturn: ratings.wouldReturn,
      q1Score: ratings.q1Score,
      q2Score: ratings.q2Score,
      q3Score: ratings.q3Score,
    }).from(ratings).where(
      gte(ratings.createdAt, thirtyDaysAgo)
    );

    const withReturn = recentRatings.filter(r => r.wouldReturn != null);
    const avgWouldReturnPct = withReturn.length > 0
      ? Math.round((withReturn.filter(r => r.wouldReturn).length / withReturn.length) * 100)
      : 0;

    // Dimension averages across all recent ratings
    const dimensionAvgs: Record<string, number> = {};
    const dimKeys = [
      { key: "q1Score", label: "food" },
      { key: "q2Score", label: "service" },
      { key: "q3Score", label: "vibe" },
    ];
    for (const { key, label } of dimKeys) {
      const vals = recentRatings
        .map(r => parseFloat(String((r as any)[key] || "0")))
        .filter(v => v > 0);
      if (vals.length > 0) {
        dimensionAvgs[label] = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100;
      }
    }

    const result: CityStatsResponse = {
      city,
      totalBusinesses: activeBiz.length,
      avgWeightedScore,
      avgRatingCount,
      avgWouldReturnPct,
      recentRatingsCount: recentRatings.length,
      dimensionAvgs,
    };

    cityLog.info(`City stats for ${city}: ${activeBiz.length} businesses, avg score ${avgWeightedScore}`);
    res.json(result);
  });
}
