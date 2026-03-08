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
import { wrapAsync } from "./wrap-async";

function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

export function registerBadgeRoutes(app: Express) {
  // GET /api/members/:id/badges — list earned badge IDs for a member
  app.get("/api/members/:id/badges", wrapAsync(async (req: Request, res: Response) => {
    const memberId = req.params.id as string;
    const badges = await getMemberBadges(memberId);
    return res.json({ data: badges });
  }));

  // POST /api/badges/award — award a badge to the authenticated user
  app.post("/api/badges/award", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const memberId = req.user!.id;
    const { badgeId, badgeFamily } = req.body;
    if (!badgeId || !badgeFamily) {
      return res.status(400).json({ error: "badgeId and badgeFamily are required" });
    }
    const result = await awardBadge(memberId, badgeId, badgeFamily);
    return res.json({ data: result, awarded: result !== null });
  }));

  // GET /api/badges/earned — get earned badge IDs for authenticated user
  app.get("/api/badges/earned", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const memberId = req.user!.id;
    const badgeIds = await getEarnedBadgeIds(memberId);
    const badgeCount = badgeIds.length;
    return res.json({ data: { badgeIds, badgeCount } });
  }));

  // GET /api/badges/leaderboard — top members by badge count
  app.get("/api/badges/leaderboard", wrapAsync(async (req: Request, res: Response) => {
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const data = await getBadgeLeaderboard(limit);
    return res.json({ data });
  }));
}
