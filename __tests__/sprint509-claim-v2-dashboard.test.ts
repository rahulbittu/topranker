/**
 * Sprint 509: Admin Claim V2 Dashboard Integration
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 509: Claim V2 Dashboard Integration", () => {
  describe("lib/api.ts — claim evidence types", () => {
    const src = readFile("lib/api.ts");

    it("defines ClaimEvidence interface", () => {
      expect(src).toContain("export interface ClaimEvidence");
    });

    it("defines ClaimDocumentMetadata interface", () => {
      expect(src).toContain("export interface ClaimDocumentMetadata");
    });

    it("ClaimEvidence has verificationScore", () => {
      expect(src).toContain("verificationScore: number");
    });

    it("ClaimEvidence has autoApproved", () => {
      expect(src).toContain("autoApproved: boolean");
    });

    it("ClaimEvidence has match indicators", () => {
      expect(src).toContain("businessNameMatch: boolean");
      expect(src).toContain("addressMatch: boolean");
      expect(src).toContain("phoneMatch: boolean");
    });

    it("exports fetchClaimEvidence function", () => {
      expect(src).toContain("export async function fetchClaimEvidence");
    });

    it("exports fetchAllClaimEvidence function", () => {
      expect(src).toContain("export async function fetchAllClaimEvidence");
    });

    it("fetchAllClaimEvidence hits correct endpoint", () => {
      expect(src).toContain("/api/admin/claims/evidence/all");
    });
  });

  describe("components/admin/ClaimEvidenceCard.tsx", () => {
    const src = readFile("components/admin/ClaimEvidenceCard.tsx");

    it("exports ClaimEvidenceCard component", () => {
      expect(src).toContain("export function ClaimEvidenceCard");
    });

    it("renders verification score bar", () => {
      expect(src).toContain("ScoreBar");
      expect(src).toContain("score");
    });

    it("renders match indicators for name, address, phone", () => {
      expect(src).toContain('"Business Name"');
      expect(src).toContain('"Address"');
      expect(src).toContain('"Phone"');
    });

    it("shows auto-approved badge", () => {
      expect(src).toContain("AUTO-APPROVED");
      expect(src).toContain("autoApproved");
    });

    it("renders document list", () => {
      expect(src).toContain("evidence.documents");
      expect(src).toContain("doc.fileName");
      expect(src).toContain("doc.documentType");
    });

    it("renders review notes", () => {
      expect(src).toContain("evidence.reviewNotes");
    });

    it("uses brand colors for score thresholds", () => {
      expect(src).toContain("Colors.green");
      expect(src).toContain("Colors.red");
      expect(src).toContain("BRAND.colors.amber");
    });

    it("stays under 220 LOC", () => {
      const lines = src.split("\n").length;
      expect(lines).toBeLessThan(220);
    });
  });

  describe("app/admin/index.tsx — wiring", () => {
    const src = readFile("app/admin/index.tsx");

    it("imports ClaimEvidenceCard", () => {
      expect(src).toContain("ClaimEvidenceCard");
      expect(src).toContain("@/components/admin/ClaimEvidenceCard");
    });

    it("imports fetchAllClaimEvidence", () => {
      expect(src).toContain("fetchAllClaimEvidence");
    });

    it("has useQuery for claim evidence", () => {
      expect(src).toContain("admin-claim-evidence");
    });

    it("renders ClaimEvidenceCard when evidence exists", () => {
      expect(src).toContain("<ClaimEvidenceCard evidence={evidence}");
    });

    it("matches evidence to claims by claimId", () => {
      expect(src).toContain("claimEvidence.find(e => e.claimId === claim.id)");
    });

    it("retains existing claim queue items", () => {
      expect(src).toContain("handleClaimAction");
      expect(src).toContain("QueueItem");
    });
  });
});
