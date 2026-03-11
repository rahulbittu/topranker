/**
 * Sprint 424 — Rate Flow Photo Improvements
 *
 * Validates:
 * 1. PhotoBoostMeter component with progressive verification
 * 2. PhotoTips component for guidance
 * 3. Integration in RatingExtrasStep
 * 4. Photo index badges
 * 5. File health
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const countLines = (content: string) => content.split("\n").length;

// ---------------------------------------------------------------------------
// 1. PhotoBoostMeter component
// ---------------------------------------------------------------------------
describe("PhotoBoostMeter — component structure", () => {
  const src = readFile("components/rate/PhotoBoostMeter.tsx");

  it("exports PhotoBoostMeter component", () => {
    expect(src).toContain("export function PhotoBoostMeter");
  });

  it("exports PhotoBoostMeterProps interface", () => {
    expect(src).toContain("export interface PhotoBoostMeterProps");
  });

  it("accepts photoCount and hasReceipt props", () => {
    expect(src).toContain("photoCount: number");
    expect(src).toContain("hasReceipt: boolean");
  });

  it("has accessibility role and label", () => {
    expect(src).toContain('accessibilityRole="progressbar"');
    expect(src).toContain("Verification boost");
  });

  it("caps total boost at 50%", () => {
    expect(src).toContain("Math.min(photoBoost + receiptBoost, 50)");
  });
});

// ---------------------------------------------------------------------------
// 2. Progressive boost calculation
// ---------------------------------------------------------------------------
describe("PhotoBoostMeter — boost calculation", () => {
  const src = readFile("components/rate/PhotoBoostMeter.tsx");

  it("uses 15% per photo", () => {
    expect(src).toContain("PHOTO_BOOST = 15");
  });

  it("uses 25% for receipt", () => {
    expect(src).toContain("hasReceipt ? 25 : 0");
  });

  it("uses pct helper for width", () => {
    expect(src).toContain('import { pct } from "@/lib/style-helpers"');
    expect(src).toContain("pct(");
  });

  it("shows camera markers for 3 photo slots", () => {
    expect(src).toContain("[1, 2, 3].map");
  });
});

// ---------------------------------------------------------------------------
// 3. PhotoTips component
// ---------------------------------------------------------------------------
describe("PhotoTips — guidance component", () => {
  const src = readFile("components/rate/PhotoBoostMeter.tsx");

  it("exports PhotoTips component", () => {
    expect(src).toContain("export function PhotoTips");
  });

  it("has food photo tip", () => {
    expect(src).toContain("food up close");
  });

  it("has lighting tip", () => {
    expect(src).toContain("Good lighting");
  });

  it("has context tip", () => {
    expect(src).toContain("restaurant context");
  });
});

// ---------------------------------------------------------------------------
// 4. RatingExtrasStep integration
// ---------------------------------------------------------------------------
describe("RatingExtrasStep — photo improvements", () => {
  const src = readFile("components/rate/RatingExtrasStep.tsx");

  it("imports PhotoBoostMeter and prompt helpers", () => {
    // Sprint 466: PhotoTips replaced by visit-type prompts from RatingPrompts
    expect(src).toContain("PhotoBoostMeter");
    expect(src).toContain("getPhotoPromptsByVisitType");
  });

  it("renders PhotoBoostMeter with photo count and receipt state", () => {
    expect(src).toContain("<PhotoBoostMeter photoCount={photos.length} hasReceipt={!!receiptUri} />");
  });

  it("shows visit-type photo prompts when no photos exist", () => {
    // Sprint 459: replaced generic PhotoTips with visit-type-aware prompts
    expect(src).toContain("photos.length === 0");
    expect(src).toContain("getPhotoPromptsByVisitType");
  });

  it("has photo index badges", () => {
    expect(src).toContain("photoIndexBadge");
    expect(src).toContain("photoIndexText");
  });

  it("renders index number on each photo", () => {
    expect(src).toContain("{idx + 1}");
  });
});

// ---------------------------------------------------------------------------
// 5. File health
// ---------------------------------------------------------------------------
describe("file health", () => {
  it("PhotoBoostMeter is under 150 LOC", () => {
    const src = readFile("components/rate/PhotoBoostMeter.tsx");
    expect(countLines(src)).toBeLessThan(150);
  });

  it("RatingExtrasStep is under 650 LOC", () => {
    const src = readFile("components/rate/RatingExtrasStep.tsx");
    expect(countLines(src)).toBeLessThan(650);
  });

  it("rate/[id].tsx is under 700 LOC threshold", () => {
    const src = readFile("app/rate/[id].tsx");
    expect(countLines(src)).toBeLessThan(700);
  });
});
