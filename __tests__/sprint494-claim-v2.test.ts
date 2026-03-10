/**
 * Sprint 494: Business Claim Flow V2
 *
 * Tests:
 * 1. claim-verification-v2.ts module structure
 * 2. Verification scoring logic
 * 3. Document metadata tracking
 * 4. Cross-reference matching
 * 5. Auto-approve threshold
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 494: Business Claim Flow V2", () => {
  describe("claim-verification-v2.ts module structure", () => {
    const src = readFile("server/claim-verification-v2.ts");

    it("exports DocumentMetadata interface", () => {
      expect(src).toContain("export interface DocumentMetadata");
    });

    it("DocumentMetadata has documentType with 5 variants", () => {
      expect(src).toContain('"business_license" | "utility_bill" | "tax_document" | "lease_agreement" | "other"');
    });

    it("exports ClaimEvidence interface", () => {
      expect(src).toContain("export interface ClaimEvidence");
    });

    it("ClaimEvidence tracks match flags", () => {
      expect(src).toContain("businessNameMatch: boolean");
      expect(src).toContain("addressMatch: boolean");
      expect(src).toContain("phoneMatch: boolean");
    });

    it("ClaimEvidence has verificationScore and autoApproved", () => {
      expect(src).toContain("verificationScore: number");
      expect(src).toContain("autoApproved: boolean");
    });

    it("ClaimEvidence has reviewNotes for audit trail", () => {
      expect(src).toContain("reviewNotes: string[]");
    });
  });

  describe("verification scoring", () => {
    const src = readFile("server/claim-verification-v2.ts");

    it("exports computeVerificationScore function", () => {
      expect(src).toContain("export function computeVerificationScore");
    });

    it("has scoring weights for document, name, address, phone, multi-doc", () => {
      expect(src).toContain("documentUploaded: 25");
      expect(src).toContain("businessNameMatch: 30");
      expect(src).toContain("addressMatch: 20");
      expect(src).toContain("phoneMatch: 15");
      expect(src).toContain("multipleDocuments: 10");
    });

    it("caps score at 100", () => {
      expect(src).toContain("Math.min(score, 100)");
    });

    it("has AUTO_APPROVE_THRESHOLD of 70", () => {
      expect(src).toContain("AUTO_APPROVE_THRESHOLD = 70");
    });

    it("exports shouldAutoApprove function", () => {
      expect(src).toContain("export function shouldAutoApprove");
      expect(src).toContain(">= AUTO_APPROVE_THRESHOLD");
    });
  });

  describe("document tracking", () => {
    const src = readFile("server/claim-verification-v2.ts");

    it("exports addDocumentToEvidence function", () => {
      expect(src).toContain("export function addDocumentToEvidence");
    });

    it("creates evidence record if not exists", () => {
      expect(src).toContain("evidenceStore.get(claimId)");
      expect(src).toContain("evidenceStore.set(claimId, evidence)");
    });

    it("pushes document to evidence documents array", () => {
      expect(src).toContain("evidence.documents.push(document)");
    });
  });

  describe("cross-reference matching", () => {
    const src = readFile("server/claim-verification-v2.ts");

    it("exports scoreClaimEvidence function", () => {
      expect(src).toContain("export function scoreClaimEvidence");
    });

    it("checks business name match with fuzzy comparison", () => {
      expect(src).toContain("levenshteinSimilar(bizNameLower, claimantLower, 3)");
    });

    it("normalizes address for comparison", () => {
      expect(src).toContain("normalizeAddress");
    });

    it("normalizes phone to last 10 digits", () => {
      expect(src).toContain("normalizePhone");
      expect(src).toContain("slice(-10)");
    });

    it("generates review notes for each matching field", () => {
      expect(src).toContain('"Business name matches claimant"');
      expect(src).toContain('"Address verified"');
      expect(src).toContain('"Phone number matches"');
    });
  });

  describe("evidence retrieval", () => {
    const src = readFile("server/claim-verification-v2.ts");

    it("exports getClaimEvidence function", () => {
      expect(src).toContain("export function getClaimEvidence");
    });

    it("exports getAllEvidence function", () => {
      expect(src).toContain("export function getAllEvidence");
    });
  });
});
