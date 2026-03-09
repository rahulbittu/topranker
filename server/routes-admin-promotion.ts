/**
 * Sprint 233: Admin Promotion Routes
 * Admin endpoints for managing city promotion from beta to active.
 * Owner: Cole Anderson (City Growth Lead)
 *
 * Endpoints:
 * - GET  /api/admin/promotion-status/:city
 * - POST /api/admin/promote/:city
 * - GET  /api/admin/promotion-thresholds
 * - PUT  /api/admin/promotion-thresholds
 */

import type { Router, Request, Response } from "express";
import { log } from "./logger";
import {
  getPromotionStatus,
  promoteCity,
  getPromotionThresholds,
  setPromotionThresholds,
} from "./city-promotion";
import { wrapAsync } from "./wrap-async";

const adminPromoLog = log.tag("AdminPromotion");

export function registerAdminPromotionRoutes(app: Router): void {
  app.get(
    "/api/admin/promotion-status/:city",
    wrapAsync(async (req: Request, res: Response) => {
      const status = await getPromotionStatus(req.params.city);
      if (!status) {
        return res.status(404).json({ error: "City not found or not in beta" });
      }
      res.json(status);
    })
  );

  app.post("/api/admin/promote/:city", (req: Request, res: Response) => {
    const result = promoteCity(req.params.city);
    if (!result) {
      return res.status(400).json({ error: "Cannot promote city" });
    }
    adminPromoLog.info(`Admin promoted ${req.params.city}`);
    res.json({ success: true, city: req.params.city, newStatus: "active" });
  });

  app.get("/api/admin/promotion-thresholds", (_req: Request, res: Response) => {
    res.json(getPromotionThresholds());
  });

  app.put("/api/admin/promotion-thresholds", (req: Request, res: Response) => {
    const updated = setPromotionThresholds(req.body);
    adminPromoLog.info("Promotion thresholds updated");
    res.json(updated);
  });
}
