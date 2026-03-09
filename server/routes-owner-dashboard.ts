/**
 * Sprint 243: Owner Dashboard Routes
 * Exposes business analytics endpoints for claimed business owners
 * and admin-level analytics overview.
 * Owner: Sarah Nakamura (Lead Eng)
 */

import { Router } from "express";
import { log } from "./logger";
import {
  getBusinessMetrics,
  getViewSources,
  getTopBusinesses,
  getAnalyticsStats,
} from "./business-analytics";

const ownerDashLog = log.tag("OwnerDashboard");

export function registerOwnerDashboardRoutes(app: Router): void {
  // Get business metrics for a specific period
  app.get("/api/owner/analytics/:businessId", (req, res) => {
    const { businessId } = req.params;
    const period = (req.query.period as string) || "30d";
    ownerDashLog.info(`Fetching analytics for business ${businessId} (${period})`);
    res.json(getBusinessMetrics(businessId, period));
  });

  // Get view source breakdown for a business
  app.get("/api/owner/analytics/:businessId/sources", (req, res) => {
    const { businessId } = req.params;
    ownerDashLog.info(`Fetching view sources for business ${businessId}`);
    res.json(getViewSources(businessId));
  });

  // Get trend comparison (7d vs 30d) for a business
  app.get("/api/owner/analytics/:businessId/trends", (req, res) => {
    const { businessId } = req.params;
    ownerDashLog.info(`Fetching trends for business ${businessId}`);
    res.json({
      weekly: getBusinessMetrics(businessId, "7d"),
      monthly: getBusinessMetrics(businessId, "30d"),
    });
  });

  // Admin: Get top businesses by views
  app.get("/api/admin/analytics/top-businesses", (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    ownerDashLog.info(`Fetching top businesses (limit: ${limit})`);
    res.json(getTopBusinesses(limit));
  });

  // Admin: Get overall analytics stats
  app.get("/api/admin/analytics/stats", (_req, res) => {
    ownerDashLog.info("Fetching analytics stats");
    res.json(getAnalyticsStats());
  });
}
