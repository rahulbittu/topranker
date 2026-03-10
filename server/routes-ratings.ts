/**
 * Rating Routes — Sprint 491 extraction from routes.ts
 *
 * Endpoints:
 * - POST /api/ratings — submit a new rating (with integrity checks + push triggers)
 * - PATCH /api/ratings/:id — edit a rating within 24h window
 * - DELETE /api/ratings/:id — delete own rating
 * - POST /api/ratings/:id/flag — flag a suspicious rating
 */
import type { Express, Request, Response } from "express";
import { insertRatingSchema } from "@shared/schema";
import { sanitizeString, sanitizeNumber } from "./sanitize";
import { trackEvent } from "./analytics";
import { getUserExperiments, trackOutcome } from "./experiment-tracker";
import { wrapAsync } from "./wrap-async";
import { checkAndRefreshTier } from "./tier-staleness";
import { requireAuth } from "./middleware";
import { submitRating } from "./storage";
import { broadcast } from "./sse";
import { log } from "./logger";
import {
  checkOwnerSelfRating,
  checkVelocity,
  logRatingSubmission,
} from "./rating-integrity";

export function registerRatingRoutes(app: Express): void {
  // ── Rating Submission ──────────────────────────────────────
  app.post("/api/ratings", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    try {
      const parsed = insertRatingSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }

      // Sanitize rating scores to [1, 5] range
      parsed.data.q1Score = sanitizeNumber(parsed.data.q1Score, 1, 5, 3);
      parsed.data.q2Score = sanitizeNumber(parsed.data.q2Score, 1, 5, 3);
      parsed.data.q3Score = sanitizeNumber(parsed.data.q3Score, 1, 5, 3);

      const memberId = req.user!.id;
      const raterIp = req.ip || req.socket.remoteAddress || "unknown";

      // Sprint 265: Owner self-rating block (Rating Integrity Layer 5)
      const ownerCheck = checkOwnerSelfRating(parsed.data.businessId, memberId, raterIp);
      if (!ownerCheck.allowed) {
        trackEvent("rating_rejected_owner_self", memberId, { businessId: parsed.data.businessId });
        return res.status(403).json({ error: ownerCheck.reason });
      }

      // Sprint 265: Velocity detection (Rating Integrity Layer 2)
      const velocityCheck = checkVelocity(parsed.data.businessId, memberId, raterIp);
      if (velocityCheck.flagged) {
        // Don't reject — flag for reduced weight (integrity principle: weight, never delete)
        log.warn(`Velocity flag ${velocityCheck.rule} for member ${memberId} on business ${parsed.data.businessId}`);
      }

      // Log submission for velocity tracking
      logRatingSubmission(parsed.data.businessId, memberId, raterIp);

      const result = await submitRating(memberId, parsed.data, {
        velocityFlagged: velocityCheck.flagged,
        velocityRule: velocityCheck.rule,
        velocityWeight: velocityCheck.reducedWeight,
      });

      const verifiedTier = checkAndRefreshTier(result.newTier, result.newCredibilityScore);
      if (verifiedTier !== result.newTier) {
        result.newTier = verifiedTier;
        result.tierUpgraded = verifiedTier !== req.user!.credibilityTier;
      }

      broadcast("rating_submitted", { businessId: parsed.data.businessId, memberId });
      broadcast("ranking_updated", { businessId: parsed.data.businessId });
      broadcast("challenger_updated", { businessId: parsed.data.businessId });
      trackEvent("first_rating", memberId);
      trackEvent("rating_submitted", memberId, { businessId: parsed.data.businessId });

      // Sprint 175: Push notification on tier upgrade
      if (result.tierUpgraded && req.user!.pushToken) {
        const { onTierUpgrade } = await import("./notification-triggers");
        onTierUpgrade(memberId, req.user!.pushToken, result.newTier).catch(() => {});
      }

      // Sprint 488: Wire push triggers to rating events
      {
        const { onRankingChange, onNewRatingForBusiness } = await import("./notification-triggers");
        const { getBusinessById } = await import("./storage");
        const biz = await getBusinessById(parsed.data.businessId);
        if (biz) {
          // Ranking change notification to raters
          if (result.rankChanged && result.prevRank && result.newRank) {
            onRankingChange(parsed.data.businessId, biz.name, result.prevRank, result.newRank, biz.city).catch(() => {});
          }
          // New rating notification to other raters of this business
          const raterName = req.user!.displayName || "Someone";
          const score = result.rating.weightedScore ?? result.rating.q1Score ?? 0;
          onNewRatingForBusiness(parsed.data.businessId, biz.name, memberId, raterName, score).catch(() => {});
        }
      }

      // Sprint 180: Invalidate prerender cache for affected business
      try {
        const { invalidatePrerenderCache } = await import("./prerender");
        const { getBusinessById } = await import("./storage");
        const biz = await getBusinessById(parsed.data.businessId);
        if (biz?.slug) invalidatePrerenderCache("biz", biz.slug);
      } catch { /* non-critical */ }

      const userExperiments = getUserExperiments(String(memberId));
      for (const expId of userExperiments) {
        trackOutcome(String(memberId), expId, "rated", parsed.data.q1Score);
      }

      return res.status(201).json({ data: result });
    } catch (err: any) {
      const memberId = req.user?.id;
      const businessId = req.body?.businessId;
      if (err.message.includes("3+ days")) {
        trackEvent("rating_rejected_account_age", memberId, { businessId });
        return res.status(403).json({ error: err.message });
      }
      if (err.message.includes("Already rated")) {
        trackEvent("rating_rejected_duplicate", memberId, { businessId });
        return res.status(409).json({ error: err.message });
      }
      if (err.message.includes("suspended")) {
        trackEvent("rating_rejected_suspended", memberId, { businessId });
        return res.status(403).json({ error: err.message });
      }
      if (err.message.includes("business owner")) {
        trackEvent("rating_rejected_owner_self", memberId, { businessId });
        return res.status(403).json({ error: err.message });
      }
      trackEvent("rating_rejected_unknown", memberId, { businessId, error: err.message });
      return res.status(400).json({ error: err.message });
    }
  }));

  // ── Sprint 183: Rating Edit ──────────────────────────────────
  app.patch("/api/ratings/:id", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const { editRating } = await import("./storage/ratings");
    const ratingId = req.params.id;
    const updates = {
      q1Score: req.body.q1Score ? sanitizeNumber(req.body.q1Score, 1, 5, undefined) : undefined,
      q2Score: req.body.q2Score ? sanitizeNumber(req.body.q2Score, 1, 5, undefined) : undefined,
      q3Score: req.body.q3Score ? sanitizeNumber(req.body.q3Score, 1, 5, undefined) : undefined,
      wouldReturn: req.body.wouldReturn,
      note: req.body.note !== undefined ? sanitizeString(req.body.note, 160) : undefined,
    };
    try {
      const updated = await editRating(ratingId, req.user!.id, updates);
      broadcast("rating_updated", { ratingId, businessId: updated.businessId });
      return res.json({ data: updated });
    } catch (err: any) {
      if (err.message.includes("not found")) return res.status(404).json({ error: err.message });
      if (err.message.includes("Cannot edit")) return res.status(403).json({ error: err.message });
      if (err.message.includes("expired")) return res.status(403).json({ error: err.message });
      return res.status(400).json({ error: err.message });
    }
  }));

  // ── Sprint 183: Rating Delete ─────────────────────────────────
  app.delete("/api/ratings/:id", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const { deleteRating } = await import("./storage/ratings");
    try {
      await deleteRating(req.params.id, req.user!.id);
      broadcast("rating_deleted", { ratingId: req.params.id });
      return res.json({ data: { deleted: true } });
    } catch (err: any) {
      if (err.message.includes("not found")) return res.status(404).json({ error: err.message });
      if (err.message.includes("Cannot delete")) return res.status(403).json({ error: err.message });
      return res.status(400).json({ error: err.message });
    }
  }));

  // ── Sprint 183: Submit Rating Flag ────────────────────────────
  app.post("/api/ratings/:id/flag", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const { submitRatingFlag } = await import("./storage/ratings");
    try {
      const flag = await submitRatingFlag(req.params.id, req.user!.id, {
        q1NoSpecificExperience: req.body.q1NoSpecificExperience,
        q2ScoreMismatchNote: req.body.q2ScoreMismatchNote,
        q3InsiderSuspected: req.body.q3InsiderSuspected,
        q4CoordinatedPattern: req.body.q4CoordinatedPattern,
        q5CompetitorBombing: req.body.q5CompetitorBombing,
        explanation: sanitizeString(req.body.explanation, 500),
      });
      return res.status(201).json({ data: flag });
    } catch (err: any) {
      if (err.message.includes("not found")) return res.status(404).json({ error: err.message });
      if (err.message.includes("own rating")) return res.status(403).json({ error: err.message });
      if (err.message.includes("unique") || err.message.includes("duplicate")) {
        return res.status(409).json({ error: "You have already flagged this rating" });
      }
      return res.status(400).json({ error: err.message });
    }
  }));
}
