/**
 * Sprint 411: Visit type step extraction from rate/[id].tsx
 * Validates VisitTypeStep component + getDimensionLabels extraction
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf-8");
}

describe("Sprint 411 — Visit Type Step Extraction", () => {
  const rateSrc = readFile("app/rate/[id].tsx");
  const vtSrc = readFile("components/rate/VisitTypeStep.tsx");

  describe("VisitTypeStep component", () => {
    it("exists as standalone file", () => {
      expect(vtSrc).toBeTruthy();
    });

    it("exports VisitTypeStep function", () => {
      expect(vtSrc).toContain("export function VisitTypeStep");
    });

    it("exports VisitType type", () => {
      expect(vtSrc).toContain("export type VisitType");
    });

    it("exports getDimensionLabels function", () => {
      expect(vtSrc).toContain("export function getDimensionLabels");
    });

    it("defines VISIT_OPTIONS constant", () => {
      expect(vtSrc).toContain("VISIT_OPTIONS");
    });

    it("includes all three visit types", () => {
      expect(vtSrc).toContain('"dine_in"');
      expect(vtSrc).toContain('"delivery"');
      expect(vtSrc).toContain('"takeaway"');
    });

    it("accepts businessName, visitType, onSelect props", () => {
      expect(vtSrc).toContain("businessName: string");
      expect(vtSrc).toContain("visitType: VisitType | null");
      expect(vtSrc).toContain("onSelect: (type: VisitType) => void");
    });

    it("has accessibility attributes on cards", () => {
      expect(vtSrc).toContain('accessibilityRole="button"');
      expect(vtSrc).toContain("accessibilityState={{ selected: visitType === opt.type }}");
    });
  });

  describe("getDimensionLabels", () => {
    it("returns correct labels for dine-in", () => {
      expect(vtSrc).toContain('"Food Quality"');
      expect(vtSrc).toContain('"Service"');
      expect(vtSrc).toContain('"Vibe & Atmosphere"');
    });

    it("returns correct labels for delivery", () => {
      expect(vtSrc).toContain('"Packaging Quality"');
    });

    it("returns correct labels for takeaway", () => {
      expect(vtSrc).toContain('"Wait Time Accuracy"');
      expect(vtSrc).toContain('"Value for Money"');
    });
  });

  describe("rate/[id].tsx after extraction", () => {
    it("imports VisitTypeStep and getDimensionLabels", () => {
      // Sprint 439: Import expanded with getDimensionTooltips and DimensionTooltip
      expect(rateSrc).toContain("VisitTypeStep");
      expect(rateSrc).toContain("getDimensionLabels");
      expect(rateSrc).toContain("type VisitType");
    });

    it("renders VisitTypeStep with correct props", () => {
      expect(rateSrc).toContain("<VisitTypeStep");
      expect(rateSrc).toContain("businessName={business.name}");
      expect(rateSrc).toContain("visitType={visitType}");
      expect(rateSrc).toContain("onSelect={setVisitType}");
    });

    it("calls getDimensionLabels with visitType", () => {
      expect(rateSrc).toContain("getDimensionLabels(visitType)");
    });

    it("no longer has inline visit type options", () => {
      expect(rateSrc).not.toContain("styles.visitTypeContainer");
      expect(rateSrc).not.toContain("styles.visitTypeCard");
      expect(rateSrc).not.toContain("styles.visitTypeTitle");
    });

    it("no longer has inline getDimensionLabels", () => {
      expect(rateSrc).not.toContain("const getDimensionLabels = ()");
    });

    it("is under 610 LOC (Sprint 531: added review step)", () => {
      const loc = rateSrc.split("\n").length;
      expect(loc).toBeLessThan(610);
    });

    it("stays below 87% of 700 LOC threshold", () => {
      const loc = rateSrc.split("\n").length;
      expect(loc / 700).toBeLessThan(0.87); // Sprint 616: +pageEnteredAt prop
    });
  });
});
