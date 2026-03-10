/**
 * Sprint 466 — RatingExtrasStep Extraction
 *
 * Validates:
 * 1. RatingPrompts.tsx contains extracted helpers
 * 2. RatingExtrasStep.tsx reduced LOC with imports
 * 3. Backward compatibility via re-exports
 * 4. Sprint & retro docs
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const countLines = (content: string) => content.split("\n").length;

// ---------------------------------------------------------------------------
// 1. RatingPrompts.tsx
// ---------------------------------------------------------------------------
describe("RatingPrompts — extracted helpers", () => {
  const src = readFile("components/rate/RatingPrompts.tsx");

  it("exports VisitType type", () => {
    expect(src).toContain("export type VisitType");
  });

  it("exports PhotoPrompt interface", () => {
    expect(src).toContain("export interface PhotoPrompt");
  });

  it("exports getPhotoPromptsByVisitType", () => {
    expect(src).toContain("export function getPhotoPromptsByVisitType");
  });

  it("exports getReceiptHint", () => {
    expect(src).toContain("export function getReceiptHint");
  });

  it("handles all 3 visit types for photos", () => {
    expect(src).toContain('"delivery"');
    expect(src).toContain('"takeaway"');
    expect(src).toContain('"dine_in"');
  });

  it("handles all 3 visit types for receipts", () => {
    expect(src).toContain("delivery confirmation");
    expect(src).toContain("pickup order receipt");
    expect(src).toContain("restaurant receipt");
  });

  it("has no React imports (pure helpers)", () => {
    expect(src).not.toContain("import React");
  });

  it("references Sprint 466 extraction", () => {
    expect(src).toContain("Sprint 466");
  });
});

// ---------------------------------------------------------------------------
// 2. RatingExtrasStep reduced LOC
// ---------------------------------------------------------------------------
describe("RatingExtrasStep — file health after extraction", () => {
  const src = readFile("components/rate/RatingExtrasStep.tsx");

  it("is under 550 LOC (was 582)", () => {
    expect(countLines(src)).toBeLessThan(550);
  });

  it("imports from RatingPrompts", () => {
    expect(src).toContain("RatingPrompts");
  });

  it("no longer defines getPhotoPromptsByVisitType locally", () => {
    expect(src).not.toContain("function getPhotoPromptsByVisitType(");
  });

  it("no longer defines getReceiptHint locally", () => {
    expect(src).not.toContain("function getReceiptHint(");
  });
});

// ---------------------------------------------------------------------------
// 3. Re-exports
// ---------------------------------------------------------------------------
describe("RatingExtrasStep — re-exports", () => {
  const src = readFile("components/rate/RatingExtrasStep.tsx");

  it("re-exports getPhotoPromptsByVisitType", () => {
    expect(src).toContain("getPhotoPromptsByVisitType");
  });

  it("re-exports getReceiptHint", () => {
    expect(src).toContain("getReceiptHint");
  });

  it("re-exports VisitType type", () => {
    expect(src).toContain("VisitType");
  });

  it("re-exports PhotoPrompt type", () => {
    expect(src).toContain("PhotoPrompt");
  });
});

// ---------------------------------------------------------------------------
// 4. Sprint & retro docs
// ---------------------------------------------------------------------------
describe("Sprint 466 documentation", () => {
  it("sprint doc exists", () => {
    const src = readFile("docs/sprints/SPRINT-466-EXTRAS-EXTRACTION.md");
    expect(src).toContain("Sprint 466");
    expect(src).toContain("extraction");
  });

  it("retro doc exists", () => {
    const src = readFile("docs/retros/RETRO-466-EXTRAS-EXTRACTION.md");
    expect(src).toContain("Retro 466");
    expect(src).toContain("Team Morale");
  });

  it("retro has action items", () => {
    const src = readFile("docs/retros/RETRO-466-EXTRAS-EXTRACTION.md");
    expect(src).toContain("Action Items");
    expect(src).toContain("Sprint 467");
  });
});
