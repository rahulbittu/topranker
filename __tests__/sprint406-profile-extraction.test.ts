/**
 * Sprint 406: Profile breakdown extraction tests
 * Validates ScoreBreakdownCard extraction from profile.tsx
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf-8");
}

describe("Sprint 406 — Profile Breakdown Extraction", () => {
  const breakdownSrc = readFile("components/profile/ScoreBreakdownCard.tsx");
  const barrelSrc = readFile("components/profile/SubComponents.tsx");

  describe("ScoreBreakdownCard component", () => {
    it("exists as standalone file", () => {
      expect(breakdownSrc).toBeTruthy();
    });

    it("exports ScoreBreakdownCard function", () => {
      expect(breakdownSrc).toContain("export function ScoreBreakdownCard");
    });

    it("accepts totalRatings prop", () => {
      expect(breakdownSrc).toContain("totalRatings: number");
    });

    it("accepts breakdown prop with score fields", () => {
      expect(breakdownSrc).toContain("breakdown: BreakdownData");
      expect(breakdownSrc).toContain("base?: number");
      expect(breakdownSrc).toContain("volume?: number");
      expect(breakdownSrc).toContain("diversity?: number");
    });

    it("accepts totalScore and tierColor props", () => {
      expect(breakdownSrc).toContain("totalScore: number");
      expect(breakdownSrc).toContain("tierColor: string");
    });

    it("manages expanded state internally", () => {
      expect(breakdownSrc).toContain("useState(false)");
      expect(breakdownSrc).toContain("setExpanded");
    });

    it("uses BreakdownRow for score lines", () => {
      expect(breakdownSrc).toContain('import { BreakdownRow }');
      expect(breakdownSrc).toContain('"Base points"');
      expect(breakdownSrc).toContain('"Rating volume"');
      expect(breakdownSrc).toContain('"Category diversity"');
      expect(breakdownSrc).toContain('"Account age"');
      expect(breakdownSrc).toContain('"Rating variance"');
    });

    it("handles flag penalties conditionally", () => {
      expect(breakdownSrc).toContain("breakdown.penalties");
      expect(breakdownSrc).toContain('"Flag penalties"');
    });

    it("shows hint when totalRatings < 5", () => {
      expect(breakdownSrc).toContain("totalRatings < 5");
      expect(breakdownSrc).toContain("meaningful score details");
    });

    it("has breakdown card and total styles", () => {
      expect(breakdownSrc).toContain("breakdownCard:");
      expect(breakdownSrc).toContain("breakdownTotal:");
      expect(breakdownSrc).toContain("breakdownTotalValue:");
    });
  });

  describe("barrel re-export", () => {
    it("SubComponents re-exports ScoreBreakdownCard", () => {
      expect(barrelSrc).toContain('export { ScoreBreakdownCard }');
    });
  });
});
