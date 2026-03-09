/**
 * Push Notification Routes — Sprint 251
 *
 * Endpoints for push token management and admin broadcast.
 * Member endpoints require authentication; admin endpoints require admin role.
 */

import { Router } from "express";
import { log } from "./logger";
import { requireAuth } from "./middleware";
import {
  registerPushToken,
  removePushToken,
  getMemberTokens,
  sendBulkPush,
  getPushStats,
} from "./push-notifications";

const pushRouteLog = log.tag("PushRoutes");

export function registerPushRoutes(app: Router): void {
  // POST /api/push/register — register a push token for the authenticated member
  app.post("/api/push/register", requireAuth, (req, res) => {
    const memberId = (req.user as any)?.id || (req as any).memberId;
    if (!memberId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { token, platform } = req.body;
    if (!token || typeof token !== "string") {
      return res.status(400).json({ error: "token is required" });
    }
    if (!platform || !["ios", "android", "web"].includes(platform)) {
      return res.status(400).json({ error: "platform must be ios, android, or web" });
    }

    const result = registerPushToken(memberId, token, platform);
    pushRouteLog.info(`Token registered for member ${memberId}`);
    res.json({ token: result });
  });

  // DELETE /api/push/token — remove a push token
  app.delete("/api/push/token", requireAuth, (req, res) => {
    const memberId = (req.user as any)?.id || (req as any).memberId;
    if (!memberId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { token } = req.body;
    if (!token || typeof token !== "string") {
      return res.status(400).json({ error: "token is required" });
    }

    const removed = removePushToken(memberId, token);
    if (!removed) {
      return res.status(404).json({ error: "Token not found" });
    }
    pushRouteLog.info(`Token removed for member ${memberId}`);
    res.json({ removed: true });
  });

  // GET /api/push/tokens — get all push tokens for the authenticated member
  app.get("/api/push/tokens", requireAuth, (req, res) => {
    const memberId = (req.user as any)?.id || (req as any).memberId;
    if (!memberId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const tokens = getMemberTokens(memberId);
    res.json({ tokens });
  });

  // GET /api/admin/push/stats — push notification statistics (admin only)
  app.get("/api/admin/push/stats", requireAuth, (req, res) => {
    const user = req.user as any;
    if (!user?.role || user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const stats = getPushStats();
    res.json({ stats });
  });

  // POST /api/admin/push/broadcast — send push to multiple members (admin only)
  app.post("/api/admin/push/broadcast", requireAuth, (req, res) => {
    const user = req.user as any;
    if (!user?.role || user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { memberIds, title, body, data } = req.body;
    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ error: "memberIds array is required" });
    }
    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "title is required" });
    }
    if (!body || typeof body !== "string") {
      return res.status(400).json({ error: "body is required" });
    }

    const result = sendBulkPush(memberIds, title, body, data);
    pushRouteLog.info(`Broadcast sent: ${result.sent} sent, ${result.failed} failed`);
    res.json({ result });
  });
}
