/**
 * Review Helpfulness Routes — Sprint 257
 *
 * Endpoints for casting, updating, and querying helpfulness votes on reviews.
 * Feeds into the reputation system's helpful_votes signal.
 *
 * Owner: Sarah Nakamura (Lead Engineer)
 */

import type { Router, Request, Response } from "express";
import { wrapAsync } from "./wrap-async";
import { requireAuth } from "./middleware";
import {
  castHelpfulnessVote,
  getVoteForReview,
  getReviewHelpfulness,
  getMemberHelpfulnessReceived,
  getTopHelpfulReviews,
  updateVote,
  getHelpfulnessStats,
} from "./review-helpfulness";
import { log } from "./logger";

const routeLog = log.tag("ReviewHelpfulnessRoutes");

export function registerReviewHelpfulnessRoutes(app: Router): void {
  // POST /api/reviews/:reviewId/helpful — cast helpful vote
  app.post("/api/reviews/:reviewId/helpful", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const { reviewId } = req.params;
    const voterId = String(req.user!.id);
    const reviewerId = req.body.reviewerId as string;

    if (!reviewerId) {
      return res.status(400).json({ error: "reviewerId is required" });
    }

    const vote = castHelpfulnessVote(reviewId, voterId, reviewerId, true);
    if (!vote) {
      return res.status(409).json({ error: "Cannot vote: duplicate or self-vote" });
    }

    routeLog.info(`Helpful vote cast on review ${reviewId} by ${voterId}`);
    return res.status(201).json({ data: vote });
  }));

  // POST /api/reviews/:reviewId/not-helpful — cast not-helpful vote
  app.post("/api/reviews/:reviewId/not-helpful", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const { reviewId } = req.params;
    const voterId = String(req.user!.id);
    const reviewerId = req.body.reviewerId as string;

    if (!reviewerId) {
      return res.status(400).json({ error: "reviewerId is required" });
    }

    const vote = castHelpfulnessVote(reviewId, voterId, reviewerId, false);
    if (!vote) {
      return res.status(409).json({ error: "Cannot vote: duplicate or self-vote" });
    }

    routeLog.info(`Not-helpful vote cast on review ${reviewId} by ${voterId}`);
    return res.status(201).json({ data: vote });
  }));

  // GET /api/reviews/:reviewId/helpfulness — get helpfulness stats
  app.get("/api/reviews/:reviewId/helpfulness", wrapAsync(async (req: Request, res: Response) => {
    const { reviewId } = req.params;
    const stats = getReviewHelpfulness(reviewId);
    return res.json({ data: stats });
  }));

  // PUT /api/reviews/:reviewId/helpfulness-vote — update existing vote
  app.put("/api/reviews/:reviewId/helpfulness-vote", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const { reviewId } = req.params;
    const voterId = String(req.user!.id);
    const { helpful } = req.body;

    if (typeof helpful !== "boolean") {
      return res.status(400).json({ error: "helpful (boolean) is required" });
    }

    const updated = updateVote(reviewId, voterId, helpful);
    if (!updated) {
      return res.status(404).json({ error: "No existing vote found to update" });
    }

    routeLog.info(`Vote updated on review ${reviewId} by ${voterId} to helpful=${helpful}`);
    return res.json({ data: { updated: true } });
  }));

  // GET /api/members/:memberId/helpfulness — get member's received helpfulness
  app.get("/api/members/:memberId/helpfulness", wrapAsync(async (req: Request, res: Response) => {
    const { memberId } = req.params;
    const stats = getMemberHelpfulnessReceived(memberId);
    return res.json({ data: stats });
  }));

  // GET /api/admin/helpfulness/stats — admin global stats
  app.get("/api/admin/helpfulness/stats", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const stats = getHelpfulnessStats();
    return res.json({ data: stats });
  }));

  // GET /api/admin/helpfulness/top-reviews — top helpful reviews
  app.get("/api/admin/helpfulness/top-reviews", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const topReviews = getTopHelpfulReviews(limit);
    return res.json({ data: topReviews });
  }));
}
