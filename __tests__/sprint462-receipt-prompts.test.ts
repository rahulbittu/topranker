/**
 * Sprint 462 — Visit-type-aware receipt prompts
 *
 * Validates:
 * 1. Receipt hint helper with visit type variants
 * 2. Dynamic receipt hint rendering
 * 3. Sprint & retro docs
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Receipt hint helper
// ---------------------------------------------------------------------------
describe("Receipt prompts — getReceiptHint", () => {
  // Sprint 466: extracted to RatingPrompts.tsx
  const src = readFile("components/rate/RatingPrompts.tsx");

  it("defines getReceiptHint function", () => {
    expect(src).toContain("function getReceiptHint");
  });

  it("handles delivery visit type", () => {
    expect(src).toContain("delivery confirmation");
    expect(src).toContain("app screenshot");
  });

  it("handles takeaway visit type", () => {
    expect(src).toContain("pickup order receipt");
  });

  it("handles dine_in visit type (default)", () => {
    expect(src).toContain("restaurant receipt");
    expect(src).toContain("bill");
  });

  it("all hints mention Verified Purchase badge", () => {
    // Each case returns a string containing "Verified Purchase badge"
    const matches = (src.match(/Verified Purchase badge/g) || []).length;
    expect(matches).toBeGreaterThanOrEqual(3);
  });

  it("references Sprint 462", () => {
    expect(src).toContain("Sprint 462");
  });
});

// ---------------------------------------------------------------------------
// 2. Dynamic receipt hint rendering
// ---------------------------------------------------------------------------
describe("Receipt prompts — dynamic rendering", () => {
  const src = readFile("components/rate/RatingExtrasStep.tsx");

  it("calls getReceiptHint with visitType", () => {
    expect(src).toContain("getReceiptHint(visitType)");
  });

  it("no longer uses static receipt hint text", () => {
    expect(src).not.toContain("Upload your receipt or order confirmation for a Verified Purchase badge");
  });
});

// ---------------------------------------------------------------------------
// 3. Sprint & retro docs
// ---------------------------------------------------------------------------
describe("Sprint 462 documentation", () => {
  it("sprint doc exists", () => {
    const src = readFile("docs/sprints/SPRINT-462-RECEIPT-PROMPTS.md");
    expect(src).toContain("Sprint 462");
    expect(src).toContain("receipt");
  });

  it("retro doc exists", () => {
    const src = readFile("docs/retros/RETRO-462-RECEIPT-PROMPTS.md");
    expect(src).toContain("Retro 462");
    expect(src).toContain("Team Morale");
  });

  it("retro has action items", () => {
    const src = readFile("docs/retros/RETRO-462-RECEIPT-PROMPTS.md");
    expect(src).toContain("Action Items");
    expect(src).toContain("Sprint 463");
  });
});
