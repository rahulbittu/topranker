/**
 * Notification Center Routes — Sprint 241 (rewritten)
 *
 * Endpoints for in-app notification management.
 * Uses the new in-memory notification module (server/notifications.ts).
 */

import { Router } from "express";
import { log } from "./logger";
import { requireAuth } from "./middleware";
import { getNotifications, getUnreadCount, markAsRead, markAllRead, deleteNotification } from "./notifications";
import { recordNotificationOpen, getNotificationInsights } from "./push-analytics";

const notifRouteLog = log.tag("NotifRoutes");

export function registerNotificationRoutes(app: Router): void {
  // GET /api/notifications — returns notifications for authenticated member
  // Supports pagination via page/perPage query params
  app.get("/api/notifications", requireAuth, (req, res) => {
    const memberId = (req as any).memberId || "anonymous";
    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.perPage as string) || 20;
    const all = getNotifications(memberId, 100);
    const totalPages = Math.ceil(all.length / perPage) || 1;
    const start = (page - 1) * perPage;
    const notifications = all.slice(start, start + perPage);
    res.json({ notifications, unreadCount: getUnreadCount(memberId), page, perPage, totalPages });
  });

  // GET /api/notifications/unread-count
  app.get("/api/notifications/unread-count", requireAuth, (req, res) => {
    const memberId = (req as any).memberId || "anonymous";
    res.json({ count: getUnreadCount(memberId) });
  });

  // POST /api/notifications/:id/read
  app.post("/api/notifications/:id/read", requireAuth, (req, res) => {
    const result = markAsRead(req.params.id);
    if (!result) return res.status(404).json({ error: "Notification not found" });
    res.json({ success: true });
  });

  // POST /api/notifications/mark-all-read
  app.post("/api/notifications/mark-all-read", requireAuth, (req, res) => {
    const memberId = (req as any).memberId || "anonymous";
    const count = markAllRead(memberId);
    res.json({ markedRead: count });
  });

  // DELETE /api/notifications/:id
  app.delete("/api/notifications/:id", requireAuth, (req, res) => {
    const result = deleteNotification(req.params.id);
    if (!result) return res.status(404).json({ error: "Notification not found" });
    res.json({ success: true });
  });

  // ── Sprint 499: Notification Open Tracking ──────────────────

  // POST /api/notifications/opened — record when user taps a push notification
  app.post("/api/notifications/opened", requireAuth, (req, res) => {
    const memberId = (req as any).memberId || "anonymous";
    const { notificationId, category } = req.body;
    if (!notificationId || !category) {
      return res.status(400).json({ error: "notificationId and category required" });
    }
    // Sprint 502: recordNotificationOpen returns false if duplicate
    const recorded = recordNotificationOpen(
      String(notificationId).slice(0, 100),
      String(category).slice(0, 50),
      memberId,
    );
    res.json({ success: true, recorded });
  });

  // GET /api/notifications/insights — combined delivery + open analytics (admin)
  app.get("/api/notifications/insights", (req, res) => {
    const daysBack = parseInt(req.query.daysBack as string) || 7;
    const insights = getNotificationInsights(Math.min(daysBack, 90));
    res.json({ data: insights });
  });
}
