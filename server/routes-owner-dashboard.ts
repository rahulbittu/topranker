/**
 * Sprint 243: Owner Dashboard Routes
 * Exposes business analytics endpoints for claimed business owners
 * and admin-level analytics overview.
 * Owner: Sarah Nakamura (Lead Eng)
 */

import { Router, Request, Response } from "express";
import { log } from "./logger";
import { requireAuth } from "./middleware";
import { wrapAsync } from "./wrap-async";
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

  // Sprint 554: Owner hours update — claimed business owners can update operating hours
  app.put("/api/owner/businesses/:businessId/hours", requireAuth, wrapAsync(async (req: Request, res: Response) => {
    const { businessId } = req.params;
    const memberId = (req as any).user?.id;
    if (!memberId) return res.status(401).json({ error: "Unauthorized" });
    const { openingHours } = req.body;
    if (!openingHours || typeof openingHours !== "object") {
      return res.status(400).json({ error: "openingHours object required" });
    }
    // Validate periods array if present
    if (openingHours.periods && !Array.isArray(openingHours.periods)) {
      return res.status(400).json({ error: "periods must be an array" });
    }
    const { updateBusinessHours } = await import("./storage/businesses");
    const updated = await updateBusinessHours(businessId, memberId, openingHours);
    if (!updated) {
      return res.status(403).json({ error: "Not the owner of this business" });
    }
    ownerDashLog.info(`Owner ${memberId} updated hours for business ${businessId}`);
    return res.json({ success: true, hoursLastUpdated: new Date().toISOString() });
  }));
}
