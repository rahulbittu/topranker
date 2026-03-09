/**
 * Notification Center Routes — Sprint 182
 *
 * Endpoints for in-app notification management.
 * Requires authentication for all endpoints.
 */

import type { Express, Request, Response } from "express";
import { wrapAsync } from "./wrap-async";
import { requireAuth } from "./middleware";

export function registerNotificationRoutes(app: Express) {
  // ── GET /api/notifications — paginated notification list ──
  app.get("/api/notifications", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const {
      getMemberNotifications,
    } = await import("./storage/notifications");

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const perPage = Math.min(50, Math.max(1, parseInt(req.query.perPage as string) || 20));

    const result = await getMemberNotifications(req.user!.id, page, perPage);

    return res.json({
      data: result.notifications,
      pagination: {
        page,
        perPage,
        total: result.total,
        totalPages: Math.ceil(result.total / perPage),
      },
      unreadCount: result.unreadCount,
    });
  }));

  // ── GET /api/notifications/unread-count — badge count ──
  app.get("/api/notifications/unread-count", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const { getUnreadNotificationCount } = await import("./storage/notifications");
    const count = await getUnreadNotificationCount(req.user!.id);
    return res.json({ data: { unreadCount: count } });
  }));

  // ── PATCH /api/notifications/:id/read — mark single as read ──
  app.patch("/api/notifications/:id/read", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const { markNotificationRead } = await import("./storage/notifications");
    const notifId = req.params.id;
    const success = await markNotificationRead(notifId, req.user!.id);
    if (!success) {
      return res.status(404).json({ error: "Notification not found" });
    }
    return res.json({ data: { read: true } });
  }));

  // ── POST /api/notifications/mark-all-read — mark all as read ──
  app.post("/api/notifications/mark-all-read", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const { markAllNotificationsRead } = await import("./storage/notifications");
    const count = await markAllNotificationsRead(req.user!.id);
    return res.json({ data: { markedRead: count } });
  }));
}
