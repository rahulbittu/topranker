/**
 * Sprint 188: Referral routes.
 *
 * Endpoints:
 * - GET  /api/referrals/me    — Get referral stats + list for current user
 * - POST /api/referrals/track — Track a referral (called during signup)
 */

import type { Express, Request, Response } from "express";
import { wrapAsync } from "./wrap-async";
import { requireAuth } from "./middleware";
import { config } from "./config";

export function registerReferralRoutes(app: Express) {
  // Get current user's referral stats
  app.get("/api/referrals/me", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const { getReferralStats } = await import("./storage");
    const stats = await getReferralStats(req.user!.id);

    // Generate referral code (uppercase username)
    const code = req.user!.username.toUpperCase();
    const shareUrl = `${config.siteUrl}/join?ref=${encodeURIComponent(code)}`;

    return res.json({
      data: {
        code,
        shareUrl,
        ...stats,
      },
    });
  }));

  // Validate a referral code (public — used during signup)
  app.get("/api/referrals/validate", wrapAsync(async (req: Request, res: Response) => {
    const code = (req.query.code as string || "").trim();
    if (!code) {
      return res.status(400).json({ error: "Referral code is required" });
    }

    const { resolveReferralCode } = await import("./storage");
    const referrerId = await resolveReferralCode(code);

    if (!referrerId) {
      return res.json({ data: { valid: false } });
    }

    return res.json({ data: { valid: true } });
  }));
}
