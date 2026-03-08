/**
 * Badge routes — extracted from routes.ts per Arch Audit #95 H1.
 * Handles badge persistence, awards, earned lists, and leaderboard.
 */
import type { Express, Request, Response } from "express";
import {
  getMemberBadges,
  getMemberBadgeCount,
  awardBadge,
  getEarnedBadgeIds,
  getBadgeLeaderboard,
} from "./storage";
import { log } from "./logger";

function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

export function registerBadgeRoutes(app: Express) {
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
}
