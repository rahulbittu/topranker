/**
 * Sprint 254: Admin Photo Moderation Routes
 * Exposes photo moderation queue endpoints for admin dashboard,
 * plus a public endpoint for approved business photos.
 * Owner: Sarah Nakamura (Lead Eng)
 */

import { Router } from "express";
import { log } from "./logger";
import {
  getPendingPhotos,
  getPhotoStats,
  approvePhoto,
  rejectPhoto,
  getPhotosByBusiness,
} from "./photo-moderation";

const adminPhotoLog = log.tag("AdminPhotos");

export function registerAdminPhotoRoutes(app: Router): void {
  // Get pending photo submissions for moderation queue
  app.get("/api/admin/photos/pending", (req, res) => {
    const limit = parseInt(req.query.limit as string) || 50;
    adminPhotoLog.info(`Fetching pending photos (limit: ${limit})`);
    res.json(getPendingPhotos(limit));
  });

  // Get photo moderation stats
  app.get("/api/admin/photos/stats", (_req, res) => {
    adminPhotoLog.info("Fetching photo stats");
    res.json(getPhotoStats());
  });

  // Approve a photo submission
  app.post("/api/admin/photos/:id/approve", (req, res) => {
    const { id } = req.params;
    const moderatorId = (req as any).user?.id || "admin";
    const note = req.body?.note;
    adminPhotoLog.info(`Approving photo ${id}`);
    const success = approvePhoto(id, moderatorId, note);
    if (!success) {
      return res.status(404).json({ error: "Photo not found or already reviewed" });
    }
    res.json({ success: true });
  });

  // Reject a photo submission
  app.post("/api/admin/photos/:id/reject", (req, res) => {
    const { id } = req.params;
    const moderatorId = (req as any).user?.id || "admin";
    const { reason, note } = req.body || {};
    if (!reason) {
      return res.status(400).json({ error: "Rejection reason is required" });
    }
    adminPhotoLog.info(`Rejecting photo ${id} (reason: ${reason})`);
    const success = rejectPhoto(id, moderatorId, reason, note);
    if (!success) {
      return res.status(404).json({ error: "Photo not found or already reviewed" });
    }
    res.json({ success: true });
  });

  // Public: Get approved photos for a business
  app.get("/api/photos/business/:businessId", (req, res) => {
    const { businessId } = req.params;
    adminPhotoLog.info(`Fetching approved photos for business ${businessId}`);
    res.json(getPhotosByBusiness(businessId));
  });
}
