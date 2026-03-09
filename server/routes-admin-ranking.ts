/**
 * Sprint 244: Admin Ranking Routes
 * Exposes ranking weight configuration and confidence level definitions for admins.
 * Owner: Sarah Nakamura (Lead Eng)
 */

import { Router } from "express";
import { log } from "./logger";
import { getRankingWeights, setRankingWeights, getConfidenceLevel } from "./search-ranking-v2";

const adminRankLog = log.tag("AdminRanking");

export function registerAdminRankingRoutes(app: Router): void {
  // Get current ranking weights
  app.get("/api/admin/ranking/weights", (_req, res) => {
    adminRankLog.info("Fetching ranking weights");
    res.json(getRankingWeights());
  });

  // Update ranking weights (partial update)
  app.put("/api/admin/ranking/weights", (req, res) => {
    adminRankLog.info("Updating ranking weights", req.body);
    const updated = setRankingWeights(req.body);
    res.json(updated);
  });

  // Confidence level definitions
  app.get("/api/admin/ranking/confidence-levels", (_req, res) => {
    adminRankLog.info("Fetching confidence level definitions");
    const weights = getRankingWeights();
    res.json({
      levels: [
        { level: "low", description: `Fewer than ${Math.floor(weights.ratingCountFloor / 2)} ratings`, minRatings: 0 },
        { level: "medium", description: `${Math.floor(weights.ratingCountFloor / 2)}–${weights.ratingCountFloor - 1} ratings`, minRatings: Math.floor(weights.ratingCountFloor / 2) },
        { level: "high", description: `${weights.ratingCountFloor}+ ratings`, minRatings: weights.ratingCountFloor },
      ],
    });
  });
}
