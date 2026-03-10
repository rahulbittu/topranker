/**
 * Sprint 449 — Rate SubComponents Extraction
 *
 * Validates:
 * 1. RatingConfirmation extracted to own file
 * 2. SubComponents trimmed and re-exports
 * 3. rate/[id].tsx import unchanged (backward compatible)
 * 4. Sprint & retro docs
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

const countLines = (relPath: string) =>
  readFile(relPath).split("\n").length;

// ---------------------------------------------------------------------------
// 1. RatingConfirmation extracted file
// ---------------------------------------------------------------------------
describe("RatingConfirmation — extracted file", () => {
  const src = readFile("components/rate/RatingConfirmation.tsx");

  it("file exists", () => {
    expect(fileExists("components/rate/RatingConfirmation.tsx")).toBe(true);
  });

  it("exports RatingConfirmation function", () => {
    expect(src).toContain("export function RatingConfirmation");
  });

  it("references Sprint 449 extraction", () => {
    expect(src).toContain("Sprint 449");
  });

  it("has rank change card", () => {
    expect(src).toContain("rankChangeCard");
    expect(src).toContain("Before");
    expect(src).toContain("After");
  });

  it("has verification boost section", () => {
    expect(src).toContain("Verification Boosts Earned");
    expect(src).toContain("verificationBoostCard");
  });

  it("has tier progress card", () => {
    expect(src).toContain("tierProgressCard");
    expect(src).toContain("tierBarInner");
  });

  it("has score breakdown", () => {
    expect(src).toContain("scoreBreakdownCard");
    expect(src).toContain("Contribution");
  });

  it("has share and done buttons", () => {
    expect(src).toContain("shareButton");
    expect(src).toContain("doneButton");
    expect(src).toContain("Share");
  });

  it("has rate another CTA", () => {
    expect(src).toContain("rateAnotherBtn");
    expect(src).toContain("Rate another place");
  });

  it("uses self-contained styles", () => {
    expect(src).toContain("StyleSheet.create");
  });
});

// ---------------------------------------------------------------------------
// 2. SubComponents trimmed
// ---------------------------------------------------------------------------
describe("SubComponents — trimmed after extraction", () => {
  const src = readFile("components/rate/SubComponents.tsx");

  it("re-exports RatingConfirmation", () => {
    expect(src).toContain('export { RatingConfirmation } from "./RatingConfirmation"');
  });

  it("does NOT define RatingConfirmation inline", () => {
    expect(src).not.toContain("export function RatingConfirmation");
  });

  it("still exports CircleScorePicker", () => {
    expect(src).toContain("export function CircleScorePicker");
  });

  it("still exports ProgressBar", () => {
    expect(src).toContain("export function ProgressBar");
  });

  it("still exports DishPill", () => {
    expect(src).toContain("export function DishPill");
  });

  it("is under 350 LOC (was 593)", () => {
    const lines = countLines("components/rate/SubComponents.tsx");
    expect(lines).toBeLessThan(350);
  });

  it("references Sprint 449", () => {
    expect(src).toContain("Sprint 449");
  });
});

// ---------------------------------------------------------------------------
// 3. Backward compatibility
// ---------------------------------------------------------------------------
describe("rate/[id].tsx — backward compatible import", () => {
  const src = readFile("app/rate/[id].tsx");

  it("imports RatingConfirmation from SubComponents", () => {
    expect(src).toContain("RatingConfirmation");
    expect(src).toContain("SubComponents");
  });

  it("renders RatingConfirmation", () => {
    expect(src).toContain("<RatingConfirmation");
  });
});

// ---------------------------------------------------------------------------
// 4. Sprint & retro docs
// ---------------------------------------------------------------------------
describe("Sprint 449 documentation", () => {
  it("sprint doc exists", () => {
    const src = readFile("docs/sprints/SPRINT-449-RATE-EXTRACTION.md");
    expect(src).toContain("Sprint 449");
    expect(src).toContain("Extraction");
  });

  it("retro doc exists", () => {
    const src = readFile("docs/retros/RETRO-449-RATE-EXTRACTION.md");
    expect(src).toContain("Retro 449");
    expect(src).toContain("Team Morale");
  });

  it("retro has action items", () => {
    const src = readFile("docs/retros/RETRO-449-RATE-EXTRACTION.md");
    expect(src).toContain("Action Items");
    expect(src).toContain("Sprint 450");
  });
});
