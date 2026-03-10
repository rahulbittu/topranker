/**
 * Sprint 278 — Rating Submission Validation Hardening
 *
 * Validates:
 * 1. Scores must be integers (no floats)
 * 2. visitType is required (not optional)
 * 3. Note is capped and HTML-stripped
 * 4. visitType cast removed (data.visitType used directly)
 * 5. Schema validation rejects invalid inputs
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";
import { insertRatingSchema } from "@/shared/schema";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 278: Schema Validation Hardening", () => {
  const validPayload = {
    businessId: "test-biz-123",
    q1Score: 4,
    q2Score: 3,
    q3Score: 5,
    wouldReturn: true,
    visitType: "dine_in" as const,
  };

  it("accepts valid payload", () => {
    const result = insertRatingSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rejects float q1Score", () => {
    const result = insertRatingSchema.safeParse({ ...validPayload, q1Score: 3.5 });
    expect(result.success).toBe(false);
  });

  it("rejects float q2Score", () => {
    const result = insertRatingSchema.safeParse({ ...validPayload, q2Score: 2.7 });
    expect(result.success).toBe(false);
  });

  it("rejects float q3Score", () => {
    const result = insertRatingSchema.safeParse({ ...validPayload, q3Score: 4.1 });
    expect(result.success).toBe(false);
  });

  it("rejects score below 1", () => {
    const result = insertRatingSchema.safeParse({ ...validPayload, q1Score: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects score above 5", () => {
    const result = insertRatingSchema.safeParse({ ...validPayload, q1Score: 6 });
    expect(result.success).toBe(false);
  });

  it("requires visitType (not optional)", () => {
    const { visitType, ...noVisit } = validPayload;
    const result = insertRatingSchema.safeParse(noVisit);
    expect(result.success).toBe(false);
  });

  it("rejects invalid visitType", () => {
    const result = insertRatingSchema.safeParse({ ...validPayload, visitType: "walk_in" });
    expect(result.success).toBe(false);
  });

  it("accepts all valid visit types", () => {
    for (const vt of ["dine_in", "delivery", "takeaway"] as const) {
      const result = insertRatingSchema.safeParse({ ...validPayload, visitType: vt });
      expect(result.success).toBe(true);
    }
  });

  it("strips HTML from note", () => {
    const result = insertRatingSchema.safeParse({
      ...validPayload,
      note: "Great <script>alert('xss')</script> food!",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.note).not.toContain("<script>");
      expect(result.data.note).toContain("Great");
      expect(result.data.note).toContain("food!");
    }
  });

  it("rejects note over 2000 chars", () => {
    const result = insertRatingSchema.safeParse({
      ...validPayload,
      note: "a".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("accepts note under 2000 chars", () => {
    const result = insertRatingSchema.safeParse({
      ...validPayload,
      note: "Great food, would visit again!",
    });
    expect(result.success).toBe(true);
  });

  it("timeOnPageMs must be integer", () => {
    const result = insertRatingSchema.safeParse({
      ...validPayload,
      timeOnPageMs: 5000.5,
    });
    expect(result.success).toBe(false);
  });

  it("timeOnPageMs must be non-negative", () => {
    const result = insertRatingSchema.safeParse({
      ...validPayload,
      timeOnPageMs: -100,
    });
    expect(result.success).toBe(false);
  });

  it("timeOnPageMs must be under 1 hour", () => {
    const result = insertRatingSchema.safeParse({
      ...validPayload,
      timeOnPageMs: 3600001,
    });
    expect(result.success).toBe(false);
  });
});

describe("Sprint 278: Server-side Validation", () => {
  const ratingsStorageSrc = readFile("server/storage/ratings.ts");

  it("submitRating uses data.visitType directly (no as any fallback)", () => {
    const fnBody = ratingsStorageSrc.slice(
      ratingsStorageSrc.indexOf("submitRating"),
      ratingsStorageSrc.indexOf("editRating") > 0
        ? ratingsStorageSrc.indexOf("editRating")
        : ratingsStorageSrc.indexOf("submitRatingFlag"),
    );
    expect(fnBody).toContain("data.visitType as VisitType");
    expect(fnBody).not.toContain('(data as any).visitType || "dine_in"');
  });

  it("submitRating checks account age (3+ days)", () => {
    expect(ratingsStorageSrc).toContain("Account must be 3+ days old");
  });

  it("submitRating prevents duplicate daily rating", () => {
    expect(ratingsStorageSrc).toContain("Already rated today");
  });

  it("submitRating checks banned status", () => {
    expect(ratingsStorageSrc).toContain("Account suspended");
  });
});
