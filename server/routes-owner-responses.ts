/**
 * Sprint 253: Owner Response Routes
 * Exposes endpoints for business owners to respond to reviews
 * and admin moderation of responses.
 * Owner: Sarah Nakamura (Lead Eng)
 */

import { Router } from "express";
import { log } from "./logger";
import { requireAuth } from "./middleware";
import {
  createResponse,
  getResponsesByBusiness,
  updateResponse,
  getResponseForReview,
  flagResponse,
  hideResponse,
  getResponseStats,
} from "./business-responses";

const respRouteLog = log.tag("OwnerResponseRoutes");

export function registerOwnerResponseRoutes(app: Router): void {
  // Create a response to a review (owner-facing)
  app.post("/api/owner/responses", requireAuth, (req, res) => {
    const { reviewId, businessId, ownerId, content } = req.body;
    if (!reviewId || !businessId || !ownerId || !content) {
      return res.status(400).json({ error: "Missing required fields: reviewId, businessId, ownerId, content" });
    }
    const resp = createResponse(reviewId, businessId, ownerId, content);
    if (!resp) {
      return res.status(409).json({ error: "Response already exists for this review or content invalid" });
    }
    respRouteLog.info(`Owner ${ownerId} responded to review ${reviewId}`);
    return res.status(201).json(resp);
  });

  // Get all responses for a business (owner-facing)
  app.get("/api/owner/responses/:businessId", requireAuth, (req, res) => {
    const { businessId } = req.params;
    respRouteLog.info(`Fetching responses for business ${businessId}`);
    return res.json(getResponsesByBusiness(businessId));
  });

  // Update a response (owner-facing)
  app.put("/api/owner/responses/:id", requireAuth, (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Missing required field: content" });
    }
    const ok = updateResponse(id, content);
    if (!ok) {
      return res.status(404).json({ error: "Response not found or content invalid" });
    }
    respRouteLog.info(`Response ${id} updated`);
    return res.json({ success: true });
  });

  // Get the response for a specific review (public-facing)
  app.get("/api/reviews/:reviewId/response", (req, res) => {
    const { reviewId } = req.params;
    const resp = getResponseForReview(reviewId);
    if (!resp) {
      return res.status(404).json({ error: "No response found for this review" });
    }
    return res.json(resp);
  });

  // Admin: Flag a response
  app.post("/api/admin/responses/:id/flag", requireAuth, (req, res) => {
    const { id } = req.params;
    const ok = flagResponse(id);
    if (!ok) {
      return res.status(404).json({ error: "Response not found" });
    }
    respRouteLog.info(`Response ${id} flagged by admin`);
    return res.json({ success: true });
  });

  // Admin: Hide a response
  app.post("/api/admin/responses/:id/hide", requireAuth, (req, res) => {
    const { id } = req.params;
    const ok = hideResponse(id);
    if (!ok) {
      return res.status(404).json({ error: "Response not found" });
    }
    respRouteLog.info(`Response ${id} hidden by admin`);
    return res.json({ success: true });
  });

  // Admin: Get response stats
  app.get("/api/admin/responses/stats", requireAuth, (_req, res) => {
    respRouteLog.info("Fetching response stats");
    return res.json(getResponseStats());
  });
}
