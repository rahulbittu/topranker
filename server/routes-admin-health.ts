/**
 * Sprint 252: Admin City Health Routes
 * Exposes city health monitoring endpoints for the admin dashboard.
 * Owner: Nadia Kaur (Cybersecurity)
 */

import type { Express, Request, Response } from "express";
import { requireAuth } from "./middleware";
import { wrapAsync } from "./wrap-async";
import {
  getAllCityHealth,
  getCityHealth,
  getHealthySummary,
} from "./city-health-monitor";
import { computePushAnalytics, getPushRecordCount } from "./push-analytics";

export function registerAdminHealthRoutes(app: Express): void {
  // NOTE: /summary registered BEFORE /:city to avoid route conflict
  app.get(
    "/api/admin/city-health/summary",
    requireAuth,
    wrapAsync(async (req: Request, res: Response) => {
      const summary = getHealthySummary();
      return res.json({ data: summary });
    }),
  );

  app.get(
    "/api/admin/city-health",
    requireAuth,
    wrapAsync(async (req: Request, res: Response) => {
      const all = getAllCityHealth();
      return res.json({ data: all });
    }),
  );

  app.get(
    "/api/admin/city-health/:city",
    requireAuth,
    wrapAsync(async (req: Request, res: Response) => {
      const city = req.params.city;
      const health = getCityHealth(city);
      if (!health) {
        return res.status(404).json({ error: `No health data for city: ${city}` });
      }
      return res.json({ data: health });
    }),
  );

  // Sprint 492: Push notification analytics endpoint
  app.get(
    "/api/admin/push-analytics",
    requireAuth,
    wrapAsync(async (req: Request, res: Response) => {
      const days = Math.min(30, Math.max(1, parseInt(req.query.days as string) || 7));
      const summary = computePushAnalytics(days);
      return res.json({
        data: {
          ...summary,
          recordCount: getPushRecordCount(),
          daysBack: days,
        },
      });
    }),
  );
}
