import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Sprint 353: Rating distribution chart improvements", () => {
  const rdSrc = fs.readFileSync(
    path.resolve("components/business/RatingDistribution.tsx"), "utf-8"
  );

  // ── Summary row ───────────────────────────────────────────────

  describe("Average score summary row", () => {
    it("should compute average score", () => {
      expect(rdSrc).toContain("ratings.reduce((sum, r) => sum + r.rawScore, 0) / total");
    });

    it("should display avg score with one decimal", () => {
      expect(rdSrc).toContain("avgScore.toFixed(1)");
    });

    it("should have rdSummaryRow style", () => {
      expect(rdSrc).toContain("rdSummaryRow");
    });

    it("should show total ratings count", () => {
      expect(rdSrc).toContain(">{total}<");
    });

    it("should have avg labels", () => {
      expect(rdSrc).toContain("avg score");
      expect(rdSrc).toContain("total ratings");
    });
  });

  // ── Trusted rater breakdown ───────────────────────────────────

  describe("Trusted rater breakdown", () => {
    it("should count trusted and top raters", () => {
      expect(rdSrc).toContain('r.userTier === "trusted" || r.userTier === "top"');
    });

    it("should show trusted percentage", () => {
      expect(rdSrc).toContain("trustedPct");
      expect(rdSrc).toContain("trusted raters");
    });

    it("should highlight when majority trusted", () => {
      expect(rdSrc).toContain("trustedPct >= 50");
      expect(rdSrc).toContain("rdTrustedHighlight");
    });

    it("should use green color for trusted highlight", () => {
      expect(rdSrc).toContain("color: Colors.green");
    });
  });

  // ── Percentage labels ─────────────────────────────────────────

  describe("Rating percentage labels", () => {
    it("should compute per-bucket percentage", () => {
      expect(rdSrc).toContain("Math.round((count / total) * 100)");
    });

    it("should display percentage next to count", () => {
      expect(rdSrc).toContain("rdPct");
      expect(rdSrc).toContain("{ratingPct}%");
    });

    it("should have rdPct style", () => {
      expect(rdSrc).toContain("rdPct:");
    });
  });

  // ── Distribution bars still functional ────────────────────────

  describe("Distribution bars", () => {
    it("should still bucket into 5 score ranges", () => {
      expect(rdSrc).toContain("[5, 4, 3, 2, 1].map");
    });

    it("should still use green/amber/red colors", () => {
      expect(rdSrc).toContain("Colors.green");
      expect(rdSrc).toContain("AMBER");
      expect(rdSrc).toContain("Colors.red");
    });

    it("should still use pctDim for bar width", () => {
      expect(rdSrc).toContain("pctDim(barPct)");
    });

    it("should still show count", () => {
      expect(rdSrc).toContain("rdCount");
      expect(rdSrc).toContain("{count}");
    });

    it("should still be wrapped in memo", () => {
      expect(rdSrc).toContain("React.memo");
    });

    it("should still have card shadow", () => {
      expect(rdSrc).toContain("cardShadow");
    });
  });

  // ── Layout structure ──────────────────────────────────────────

  describe("Layout structure", () => {
    it("should have summary row with border separator", () => {
      expect(rdSrc).toContain("borderBottomWidth: 1");
      expect(rdSrc).toContain("borderBottomColor: Colors.border");
    });

    it("should have rdAvgBlock for alignment", () => {
      expect(rdSrc).toContain("rdAvgBlock");
    });

    it("should have bold score display", () => {
      expect(rdSrc).toContain('fontWeight: "700"');
    });

    it("should export as default", () => {
      expect(rdSrc).toContain("export default RatingDistribution");
    });
  });
});
