/**
 * Sprint 249: Admin WebSocket Routes
 * Exposes WebSocket connection dashboard, stats, message log, and broadcast for admins.
 * Owner: Sarah Nakamura (Lead Eng)
 */

import { Router } from "express";
import { log } from "./logger";
import {
  getActiveConnections,
  getConnectionStats,
  getRecentMessages,
  broadcastToAll,
} from "./websocket-manager";

const adminWSLog = log.tag("AdminWebSocket");

export function registerAdminWebSocketRoutes(app: Router): void {
  // Active WebSocket connections
  app.get("/api/admin/websocket/connections", (_req, res) => {
    adminWSLog.info("Fetching active WebSocket connections");
    res.json({ data: getActiveConnections() });
  });

  // WebSocket connection stats
  app.get("/api/admin/websocket/stats", (_req, res) => {
    adminWSLog.info("Fetching WebSocket stats");
    res.json({ data: getConnectionStats() });
  });

  // Recent message log
  app.get("/api/admin/websocket/messages", (req, res) => {
    const limit = parseInt(req.query.limit as string) || 20;
    adminWSLog.info(`Fetching recent messages (limit: ${limit})`);
    res.json({ data: getRecentMessages(limit) });
  });

  // Broadcast system message to all connections
  app.post("/api/admin/websocket/broadcast", (req, res) => {
    const { message } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message (string) is required" });
    }
    const wsMessage = {
      type: "system" as const,
      payload: { message },
      timestamp: new Date().toISOString(),
    };
    const count = broadcastToAll(wsMessage);
    adminWSLog.info(`Broadcast system message to ${count} connections`);
    res.json({ data: { delivered: count, message } });
  });
}
