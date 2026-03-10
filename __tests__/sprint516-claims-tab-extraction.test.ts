/**
 * Sprint 516: Admin Claims Tab Extraction
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 516: Claims Tab Extraction", () => {
  describe("components/admin/ClaimsTabContent.tsx", () => {
    const src = readFile("components/admin/ClaimsTabContent.tsx");

    it("exports ClaimsTabContent component", () => {
      expect(src).toContain("export function ClaimsTabContent");
    });

    it("renders claims with QueueItem", () => {
      expect(src).toContain("QueueItem");
      expect(src).toContain("claim.businessName");
    });

    it("renders ClaimEvidenceCard when evidence exists", () => {
      expect(src).toContain("ClaimEvidenceCard");
      expect(src).toContain("evidence &&");
    });

    it("matches evidence by claimId", () => {
      expect(src).toContain("claimEvidence.find");
      expect(src).toContain("e.claimId === claim.id");
    });

    it("shows empty state when no claims", () => {
      expect(src).toContain("No Pending Claims");
    });

    it("shows loading state", () => {
      expect(src).toContain("Loading claims...");
    });

    it("accepts QueueItem as prop for reuse", () => {
      expect(src).toContain("QueueItem: React.ComponentType");
    });

    it("stays under 110 LOC", () => {
      const lines = src.split("\n").length;
      expect(lines).toBeLessThan(110);
    });
  });

  describe("app/admin/index.tsx — reduced LOC", () => {
    const src = readFile("app/admin/index.tsx");

    it("imports ClaimsTabContent", () => {
      expect(src).toContain("ClaimsTabContent");
      expect(src).toContain("@/components/admin/ClaimsTabContent");
    });

    it("uses ClaimsTabContent component", () => {
      expect(src).toContain("<ClaimsTabContent");
    });

    it("passes claims data and handlers as props", () => {
      expect(src).toContain("claims={claims}");
      expect(src).toContain("claimEvidence={claimEvidence}");
      expect(src).toContain("onClaimAction={handleClaimAction}");
    });

    it("no longer has inline claim rendering", () => {
      expect(src).not.toContain("claim.businessName || \"Unknown Business\"");
    });

    it("stays under 650 LOC", () => {
      const lines = src.split("\n").length;
      expect(lines).toBeLessThan(650);
    });

    it("retains other tabs inline", () => {
      expect(src).toContain("activeTab === \"flags\"");
      expect(src).toContain("activeTab === \"users\"");
    });
  });
});
