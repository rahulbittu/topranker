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
import {
  addDocumentToEvidence,
  scoreClaimEvidence,
  getClaimEvidence,
  getAllEvidence,
} from "./claim-verification-v2";

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

  // ── Sprint 496: Claim V2 Endpoints ──────────────────────────

  // Upload document metadata for a claim
  app.post("/api/admin/claims/:id/document", (req, res) => {
    const { fileName, fileType, fileSize, documentType } = req.body;
    if (!fileName || !fileType || !fileSize || !documentType) {
      return res.status(400).json({ error: "fileName, fileType, fileSize, documentType required" });
    }
    const evidence = addDocumentToEvidence(req.params.id, {
      fileName: String(fileName).slice(0, 200),
      fileType: String(fileType).slice(0, 50),
      fileSize: Number(fileSize),
      uploadedAt: new Date().toISOString(),
      documentType,
    });
    adminClaimLog.info(`Document uploaded for claim ${req.params.id}: ${fileName}`);
    res.json({ data: evidence });
  });

  // Score claim evidence against business data
  app.post("/api/admin/claims/:id/score", (req, res) => {
    const { businessName, claimantName, claimantAddress, businessAddress, claimantPhone, businessPhone } = req.body;
    if (!businessName || !claimantName) {
      return res.status(400).json({ error: "businessName and claimantName required" });
    }
    const evidence = scoreClaimEvidence(
      req.params.id,
      businessName,
      claimantName,
      claimantAddress,
      businessAddress,
      claimantPhone,
      businessPhone,
    );
    adminClaimLog.info(`Claim ${req.params.id} scored: ${evidence.verificationScore}/100, auto=${evidence.autoApproved}`);
    res.json({ data: evidence });
  });

  // Get evidence for a specific claim
  app.get("/api/admin/claims/:id/evidence", (req, res) => {
    const evidence = getClaimEvidence(req.params.id);
    if (!evidence) return res.status(404).json({ error: "No evidence for this claim" });
    res.json({ data: evidence });
  });

  // Get all evidence records (admin dashboard)
  app.get("/api/admin/claims/evidence/all", (_req, res) => {
    res.json({ data: getAllEvidence() });
  });
}
