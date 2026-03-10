/**
 * Sprint 334: Rating Flow Polish — Auto-Advance Dimensions
 *
 * Verifies that the rating flow auto-advances focus between dimensions
 * when users select scores. Highlights the next unanswered question.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ratePath = path.resolve(__dirname, "../app/rate/[id].tsx");
const rateCode = fs.readFileSync(ratePath, "utf-8");

describe("Sprint 334 — Auto-Advance Dimensions", () => {
  // Focus tracking state
  it("should have focusedDimension state", () => {
    expect(rateCode).toContain("focusedDimension");
    expect(rateCode).toContain("setFocusedDimension");
  });

  // Auto-advance handlers
  it("should have handleQ1 that advances to dimension 1", () => {
    expect(rateCode).toContain("handleQ1");
    expect(rateCode).toContain("setFocusedDimension(1)");
  });

  it("should have handleQ2 that advances to dimension 2", () => {
    expect(rateCode).toContain("handleQ2");
    expect(rateCode).toContain("setFocusedDimension(2)");
  });

  it("should have handleQ3 that advances to dimension 3", () => {
    expect(rateCode).toContain("handleQ3");
    expect(rateCode).toContain("setFocusedDimension(3)");
  });

  it("should have handleReturn that sets dimension 4 (done)", () => {
    expect(rateCode).toContain("handleReturn");
    expect(rateCode).toContain("setFocusedDimension(4)");
  });

  // Auto-advance delay
  it("should use setTimeout for smooth advance", () => {
    expect(rateCode).toContain("setTimeout(() => setFocusedDimension");
  });

  // Focus highlighting (Sprint 342: upgraded to animated highlight)
  it("should apply animated dimension highlight styles", () => {
    expect(rateCode).toContain("dim0Style");
    expect(rateCode).toContain("dim1Style");
    expect(rateCode).toContain("dim2Style");
    expect(rateCode).toContain("dim3Style");
  });

  it("should use extracted animation hook", () => {
    expect(rateCode).toContain("useDimensionHighlight");
    expect(rateCode).toContain("useConfirmationAnimations");
  });

  // Sprint 346: Animation internals now in hook
  it("should pass score state to highlight hook", () => {
    expect(rateCode).toContain("focusedDimension, q1Score, q2Score, q3Score, wouldReturn");
  });

  // Reset on step change
  it("should reset focusedDimension when entering step 1", () => {
    expect(rateCode).toContain("setFocusedDimension(0)");
  });

  // CircleScorePicker uses new handlers
  it("should use handleQ1 for Q1 CircleScorePicker", () => {
    expect(rateCode).toContain("onChange={handleQ1}");
  });

  it("should use handleQ2 for Q2 CircleScorePicker", () => {
    expect(rateCode).toContain("onChange={handleQ2}");
  });

  it("should use handleQ3 for Q3 CircleScorePicker", () => {
    expect(rateCode).toContain("onChange={handleQ3}");
  });

  it("should use handleReturn for yes/no buttons", () => {
    expect(rateCode).toContain("handleReturn(true)");
    expect(rateCode).toContain("handleReturn(false)");
  });
});
