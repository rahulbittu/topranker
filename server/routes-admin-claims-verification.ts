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
import { sanitizeString } from "./sanitize";
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
import {
  getClaimEvidenceByClaimId as dbGetEvidence,
  getAllClaimEvidence as dbGetAllEvidence,
} from "./storage/claim-evidences";

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
    // Sprint 746: Sanitize rejection reason to prevent injection
    const reason = sanitizeString(req.body?.reason, 500) || undefined;
    const result = rejectClaim(req.params.id, reason);
    if (!result) return res.status(400).json({ error: "Cannot reject claim" });
    adminClaimLog.info(`Admin rejected claim ${req.params.id}`);
    res.json({ success: true });
  });

  // ── Sprint 496: Claim V2 Endpoints ──────────────────────────

  // Upload document metadata for a claim
  app.post("/api/admin/claims/:id/document", (req, res) => {
    // Sprint 747: Sanitize all document metadata fields
    const fileName = sanitizeString(req.body.fileName, 200);
    const fileType = sanitizeString(req.body.fileType, 50);
    const fileSize = Number(req.body.fileSize);
    const documentType = sanitizeString(req.body.documentType, 100);
    if (!fileName || !fileType || !fileSize || !documentType) {
      return res.status(400).json({ error: "fileName, fileType, fileSize, documentType required" });
    }
    const evidence = addDocumentToEvidence(req.params.id, {
      fileName,
      fileType,
      fileSize,
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

  // Get evidence for a specific claim (in-memory first, DB fallback)
  app.get("/api/admin/claims/:id/evidence", async (req, res) => {
    const evidence = getClaimEvidence(req.params.id);
    if (evidence) return res.json({ data: evidence });
    // Sprint 513: DB fallback
    const dbEvidence = await dbGetEvidence(req.params.id).catch(() => null);
    if (!dbEvidence) return res.status(404).json({ error: "No evidence for this claim" });
    res.json({ data: dbEvidence });
  });

  // Get all evidence records — merge in-memory + DB
  app.get("/api/admin/claims/evidence/all", async (_req, res) => {
    const memEvidence = getAllEvidence();
    const dbRows = await dbGetAllEvidence().catch(() => []);
    // Merge: in-memory takes precedence, DB fills gaps
    const merged = new Map<string, unknown>();
    for (const row of dbRows) merged.set(row.claimId, row);
    for (const ev of memEvidence) merged.set(ev.claimId, ev);
    res.json({ data: Array.from(merged.values()) });
  });
}
