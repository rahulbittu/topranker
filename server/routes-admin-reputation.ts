/**
 * Sprint 239: Admin Reputation Routes
 * Exposes reputation stats, leaderboard, member lookup, and tier thresholds for admins.
 * Owner: Sarah Nakamura (Lead Eng)
 */

import { Router } from "express";
import { log } from "./logger";
import {
  getReputationStats,
  getReputationLeaderboard,
  getReputation,
  getTierThresholds,
} from "./reputation-v2";

const adminRepLog = log.tag("AdminReputation");

export function registerAdminReputationRoutes(app: Router): void {
  // Reputation stats aggregate
  app.get("/api/admin/reputation/stats", (_req, res) => {
    adminRepLog.info("Fetching reputation stats");
    res.json(getReputationStats());
  });

  // Reputation leaderboard
  app.get("/api/admin/reputation/leaderboard", (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    adminRepLog.info(`Fetching reputation leaderboard (limit: ${limit})`);
    res.json(getReputationLeaderboard(limit));
  });

  // Lookup single member reputation
  app.get("/api/admin/reputation/:memberId", (req, res) => {
    const { memberId } = req.params;
    adminRepLog.info(`Fetching reputation for member ${memberId}`);
    const reputation = getReputation(memberId);
    if (!reputation) {
      return res.status(404).json({ error: "Member reputation not found" });
    }
    res.json(reputation);
  });

  // Tier thresholds reference
  app.get("/api/admin/reputation/tiers", (_req, res) => {
    adminRepLog.info("Fetching tier thresholds");
    res.json(getTierThresholds());
  });
}
