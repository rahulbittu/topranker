/**
 * Sprint 496: Wire Claim V2 to Admin Routes
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 496: Wire Claim V2 to Admin Routes", () => {
  describe("routes-admin-claims-verification.ts V2 endpoints", () => {
    const src = readFile("server/routes-admin-claims-verification.ts");

    it("imports addDocumentToEvidence from claim-verification-v2", () => {
      expect(src).toContain("addDocumentToEvidence");
      expect(src).toContain("claim-verification-v2");
    });

    it("imports scoreClaimEvidence from claim-verification-v2", () => {
      expect(src).toContain("scoreClaimEvidence");
    });

    it("imports getClaimEvidence from claim-verification-v2", () => {
      expect(src).toContain("getClaimEvidence");
    });

    it("imports getAllEvidence from claim-verification-v2", () => {
      expect(src).toContain("getAllEvidence");
    });

    it("has POST /api/admin/claims/:id/document endpoint", () => {
      expect(src).toContain('"/api/admin/claims/:id/document"');
      expect(src).toContain("app.post");
    });

    it("validates required fields for document upload", () => {
      expect(src).toContain("fileName");
      expect(src).toContain("fileType");
      expect(src).toContain("fileSize");
      expect(src).toContain("documentType");
    });

    it("sanitizes document metadata inputs", () => {
      expect(src).toContain("String(fileName).slice(0, 200)");
      expect(src).toContain("String(fileType).slice(0, 50)");
      expect(src).toContain("Number(fileSize)");
    });

    it("has POST /api/admin/claims/:id/score endpoint", () => {
      expect(src).toContain('"/api/admin/claims/:id/score"');
    });

    it("requires businessName and claimantName for scoring", () => {
      expect(src).toContain("businessName");
      expect(src).toContain("claimantName");
    });

    it("supports optional address and phone matching", () => {
      expect(src).toContain("claimantAddress");
      expect(src).toContain("businessAddress");
      expect(src).toContain("claimantPhone");
      expect(src).toContain("businessPhone");
    });

    it("has GET /api/admin/claims/:id/evidence endpoint", () => {
      expect(src).toContain('"/api/admin/claims/:id/evidence"');
    });

    it("returns 404 for missing evidence", () => {
      expect(src).toContain("No evidence for this claim");
    });

    it("has GET /api/admin/claims/evidence/all endpoint", () => {
      expect(src).toContain('"/api/admin/claims/evidence/all"');
    });

    it("logs document uploads", () => {
      expect(src).toContain("Document uploaded for claim");
    });

    it("logs claim scoring with score and auto-approve", () => {
      expect(src).toContain("scored:");
      expect(src).toContain("auto=");
    });

    it("retains all V1 endpoints", () => {
      expect(src).toContain('"/api/admin/claims/pending"');
      expect(src).toContain('"/api/admin/claims/stats"');
      expect(src).toContain('"/api/admin/claims/:id"');
      expect(src).toContain('"/api/admin/claims/business/:businessId"');
      expect(src).toContain('"/api/admin/claims/:id/reject"');
    });
  });

  describe("claim-verification-v2.ts module", () => {
    const src = readFile("server/claim-verification-v2.ts");

    it("exports addDocumentToEvidence function", () => {
      expect(src).toContain("export function addDocumentToEvidence");
    });

    it("exports scoreClaimEvidence function", () => {
      expect(src).toContain("export function scoreClaimEvidence");
    });

    it("exports getClaimEvidence function", () => {
      expect(src).toContain("export function getClaimEvidence");
    });

    it("exports getAllEvidence function", () => {
      expect(src).toContain("export function getAllEvidence");
    });
  });

  describe("file health", () => {
    it("routes-admin-claims-verification.ts under 150 LOC", () => {
      const loc = readFile("server/routes-admin-claims-verification.ts").split("\n").length;
      expect(loc).toBeLessThan(150);
    });

    it("claim-verification-v2.ts under 250 LOC", () => {
      const loc = readFile("server/claim-verification-v2.ts").split("\n").length;
      expect(loc).toBeLessThan(250);
    });
  });
});
