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
  getItemsByMember,
  getFilteredItems,
  getResolvedItems,
  bulkApprove,
  bulkReject,
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

  // Get moderation items for a specific member
  app.get("/api/admin/moderation/member/:memberId", (req, res) => {
    const { memberId } = req.params;
    adminModLog.info(`Fetching moderation items for member ${memberId}`);
    res.json(getItemsByMember(memberId));
  });

  // Filtered queue with content type, status, and priority sorting
  app.get("/api/admin/moderation/filtered", (req, res) => {
    const status = req.query.status as string | undefined;
    const contentType = req.query.contentType as string | undefined;
    const limit = parseInt(req.query.limit as string) || 50;
    const sortByViolations = req.query.sort === "violations";
    adminModLog.info(`Filtered queue: status=${status}, type=${contentType}, sort=${sortByViolations}`);
    res.json(getFilteredItems({
      status: status as any,
      contentType: contentType as any,
      limit,
      sortByViolations,
    }));
  });

  // Get resolved items (history)
  app.get("/api/admin/moderation/resolved", (req, res) => {
    const limit = parseInt(req.query.limit as string) || 50;
    adminModLog.info(`Fetching resolved items (limit: ${limit})`);
    res.json(getResolvedItems(limit));
  });

  // Bulk approve multiple items
  app.post("/api/admin/moderation/bulk-approve", (req, res) => {
    const { ids, note } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "ids array required" });
    }
    if (ids.length > 100) {
      return res.status(400).json({ error: "Maximum 100 items per bulk action" });
    }
    const moderatorId = (req as any).user?.id || "admin";
    adminModLog.info(`Bulk approving ${ids.length} items`);
    const result = bulkApprove(ids, moderatorId, note);
    res.json(result);
  });

  // Bulk reject multiple items
  app.post("/api/admin/moderation/bulk-reject", (req, res) => {
    const { ids, note } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "ids array required" });
    }
    if (ids.length > 100) {
      return res.status(400).json({ error: "Maximum 100 items per bulk action" });
    }
    const moderatorId = (req as any).user?.id || "admin";
    adminModLog.info(`Bulk rejecting ${ids.length} items`);
    const result = bulkReject(ids, moderatorId, note);
    res.json(result);
  });
}
