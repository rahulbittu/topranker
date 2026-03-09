/**
 * Sprint 236: Admin Rate Limit + Abuse Detection Routes
 * Exposes rate-limit dashboard data and abuse incident management for admins.
 * Owner: Sarah Nakamura (Lead Eng)
 */

import { Router } from "express";
import { log } from "./logger";
import { getRateLimitStats, getBlockedIPs } from "./rate-limit-dashboard";
import { getActiveIncidents, getAbuseStats, resolveIncident } from "./abuse-detection";

const adminRLLog = log.tag("AdminRateLimit");

export function registerAdminRateLimitRoutes(app: Router): void {
  // Rate limit dashboard stats
  app.get("/api/admin/rate-limits", (_req, res) => {
    adminRLLog.info("Fetching rate limit stats");
    res.json(getRateLimitStats());
  });

  // Blocked IPs with minimum hit threshold
  app.get("/api/admin/rate-limits/blocked", (req, res) => {
    const minHits = parseInt(req.query.minHits as string) || 5;
    adminRLLog.info(`Fetching blocked IPs (minHits: ${minHits})`);
    res.json(getBlockedIPs(minHits));
  });

  // Active abuse incidents
  app.get("/api/admin/abuse/incidents", (_req, res) => {
    adminRLLog.info("Fetching active abuse incidents");
    res.json(getActiveIncidents());
  });

  // Abuse stats aggregate
  app.get("/api/admin/abuse/stats", (_req, res) => {
    adminRLLog.info("Fetching abuse stats");
    res.json(getAbuseStats());
  });

  // Resolve an abuse incident
  app.post("/api/admin/abuse/resolve/:id", (req, res) => {
    const result = resolveIncident(req.params.id);
    if (!result) {
      return res.status(404).json({ error: "Incident not found" });
    }
    adminRLLog.info(`Resolved abuse incident ${req.params.id}`);
    res.json({ success: true });
  });
}
