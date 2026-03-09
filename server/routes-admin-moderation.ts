/**
 * Sprint 242: Admin Moderation Routes
 * Exposes moderation queue management endpoints for admin dashboard.
 * Owner: Sarah Nakamura (Lead Eng)
 */

import { Router } from "express";
import { log } from "./logger";
import {
  getPendingItems,
  getQueueStats,
  approveItem,
  rejectItem,
  getItemsByBusiness,
} from "./moderation-queue";

const adminModLog = log.tag("AdminModeration");

export function registerAdminModerationRoutes(app: Router): void {
  // Get pending moderation items
  app.get("/api/admin/moderation/queue", (req, res) => {
    const limit = parseInt(req.query.limit as string) || 50;
    adminModLog.info(`Fetching moderation queue (limit: ${limit})`);
    res.json(getPendingItems(limit));
  });

  // Get moderation queue stats
  app.get("/api/admin/moderation/stats", (_req, res) => {
    adminModLog.info("Fetching moderation stats");
    res.json(getQueueStats());
  });

  // Approve a moderation item
  app.post("/api/admin/moderation/:id/approve", (req, res) => {
    const { id } = req.params;
    const moderatorId = (req as any).user?.id || "admin";
    const note = req.body?.note;
    adminModLog.info(`Approving moderation item ${id}`);
    const success = approveItem(id, moderatorId, note);
    if (!success) {
      return res.status(404).json({ error: "Item not found or already resolved" });
    }
    res.json({ success: true });
  });

  // Reject a moderation item
  app.post("/api/admin/moderation/:id/reject", (req, res) => {
    const { id } = req.params;
    const moderatorId = (req as any).user?.id || "admin";
    const note = req.body?.note;
    adminModLog.info(`Rejecting moderation item ${id}`);
    const success = rejectItem(id, moderatorId, note);
    if (!success) {
      return res.status(404).json({ error: "Item not found or already resolved" });
    }
    res.json({ success: true });
  });

  // Get moderation items for a specific business
  app.get("/api/admin/moderation/business/:businessId", (req, res) => {
    const { businessId } = req.params;
    adminModLog.info(`Fetching moderation items for business ${businessId}`);
    res.json(getItemsByBusiness(businessId));
  });
}
