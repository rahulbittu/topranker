/**
 * Admin Claim Verification Routes (Sprint 238)
 *
 * Provides admin endpoints for managing business claim requests:
 * - GET  /api/admin/claims/pending          — list all pending claims
 * - GET  /api/admin/claims/stats            — aggregate claim statistics
 * - GET  /api/admin/claims/:id              — single claim detail
 * - GET  /api/admin/claims/business/:businessId — claims for a business
 * - POST /api/admin/claims/:id/reject       — admin rejection with optional reason
 */

import { Router } from "express";
import { log } from "./logger";
import {
  getPendingClaims,
  getClaimStatus,
  rejectClaim,
  getClaimStats,
  getClaimsByBusiness,
} from "./claim-verification";

const adminClaimLog = log.tag("AdminClaimVerify");

export function registerAdminClaimVerificationRoutes(app: Router): void {
  app.get("/api/admin/claims/pending", (_req, res) => {
    res.json(getPendingClaims());
  });

  app.get("/api/admin/claims/stats", (_req, res) => {
    res.json(getClaimStats());
  });

  app.get("/api/admin/claims/:id", (req, res) => {
    const claim = getClaimStatus(req.params.id);
    if (!claim) return res.status(404).json({ error: "Claim not found" });
    res.json(claim);
  });

  app.get("/api/admin/claims/business/:businessId", (req, res) => {
    res.json(getClaimsByBusiness(req.params.businessId));
  });

  app.post("/api/admin/claims/:id/reject", (req, res) => {
    const result = rejectClaim(req.params.id, req.body?.reason);
    if (!result) return res.status(400).json({ error: "Cannot reject claim" });
    adminClaimLog.info(`Admin rejected claim ${req.params.id}`);
    res.json({ success: true });
  });
}
