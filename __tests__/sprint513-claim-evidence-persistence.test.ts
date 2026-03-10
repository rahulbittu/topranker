/**
 * Sprint 513: Claim Evidence PostgreSQL Persistence
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 513: Claim Evidence Persistence", () => {
  describe("shared/schema.ts — claimEvidence table", () => {
    const src = readFile("shared/schema.ts");

    it("defines claimEvidence table", () => {
      expect(src).toContain("claimEvidence = pgTable");
      expect(src).toContain('"claim_evidence"');
    });

    it("has claimId foreign key to businessClaims", () => {
      expect(src).toContain("claim_id");
      expect(src).toContain("businessClaims.id");
    });

    it("stores documents as jsonb", () => {
      expect(src).toContain('documents: jsonb("documents")');
    });

    it("has match boolean fields", () => {
      expect(src).toContain("business_name_match");
      expect(src).toContain("address_match");
      expect(src).toContain("phone_match");
    });

    it("has verificationScore and autoApproved", () => {
      expect(src).toContain("verification_score");
      expect(src).toContain("auto_approved");
    });

    it("has reviewNotes as jsonb", () => {
      expect(src).toContain('reviewNotes: jsonb("review_notes")');
    });

    it("has unique constraint on claimId", () => {
      expect(src).toContain("unique_claim_evidence");
    });

    it("has index on claimId", () => {
      expect(src).toContain("idx_evidence_claim");
    });
  });

  describe("server/storage/claim-evidences.ts — storage module", () => {
    const src = readFile("server/storage/claim-evidences.ts");

    it("exports getClaimEvidenceByClaimId", () => {
      expect(src).toContain("export async function getClaimEvidenceByClaimId");
    });

    it("exports getAllClaimEvidence", () => {
      expect(src).toContain("export async function getAllClaimEvidence");
    });

    it("exports upsertClaimEvidence", () => {
      expect(src).toContain("export async function upsertClaimEvidence");
    });

    it("exports addDocumentToClaimEvidence", () => {
      expect(src).toContain("export async function addDocumentToClaimEvidence");
    });

    it("uses onConflictDoUpdate for upsert", () => {
      expect(src).toContain("onConflictDoUpdate");
    });

    it("imports claimEvidence from schema", () => {
      expect(src).toContain("claimEvidence");
      expect(src).toContain("@shared/schema");
    });

    it("stays under 120 LOC", () => {
      const lines = src.split("\n").length;
      expect(lines).toBeLessThan(120);
    });
  });

  describe("server/claim-verification-v2.ts — dual-write", () => {
    const src = readFile("server/claim-verification-v2.ts");

    it("imports upsertClaimEvidence from storage", () => {
      expect(src).toContain("upsertClaimEvidence");
      expect(src).toContain("./storage/claim-evidences");
    });

    it("persists scored evidence to PostgreSQL", () => {
      expect(src).toContain("upsertClaimEvidence({");
    });

    it("persists document uploads to PostgreSQL", () => {
      expect(src).toContain("dbAddDocument(claimId, document)");
    });

    it("uses fire-and-forget pattern for DB writes", () => {
      expect(src).toContain(".catch(() => {})");
    });

    it("retains in-memory store as cache", () => {
      expect(src).toContain("evidenceStore");
    });
  });

  describe("server/routes-admin-claims-verification.ts — DB fallback", () => {
    const src = readFile("server/routes-admin-claims-verification.ts");

    it("imports DB evidence functions", () => {
      expect(src).toContain("dbGetEvidence");
      expect(src).toContain("dbGetAllEvidence");
      expect(src).toContain("./storage/claim-evidences");
    });

    it("falls back to DB for single evidence lookup", () => {
      expect(src).toContain("dbGetEvidence(req.params.id)");
    });

    it("merges in-memory and DB evidence for all records", () => {
      expect(src).toContain("dbGetAllEvidence()");
      expect(src).toContain("merged");
    });
  });
});
