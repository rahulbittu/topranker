/**
 * Sprint 459 — Visit-type-aware photo prompts
 *
 * Validates:
 * 1. Photo prompts helper with visit type variants
 * 2. visitType prop wiring in RatingExtrasStep
 * 3. Photo prompt UI in RatingExtrasStep
 * 4. Sprint & retro docs
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Photo prompts helper
// ---------------------------------------------------------------------------
describe("Photo prompts — getPhotoPromptsByVisitType", () => {
  // Sprint 466: extracted to RatingPrompts.tsx
  const src = readFile("components/rate/RatingPrompts.tsx");

  it("defines getPhotoPromptsByVisitType function", () => {
    expect(src).toContain("getPhotoPromptsByVisitType");
  });

  it("handles dine_in visit type", () => {
    expect(src).toContain('"dine_in"');
    expect(src).toContain("Dish");
    expect(src).toContain("Vibe");
  });

  it("handles delivery visit type", () => {
    expect(src).toContain('"delivery"');
    expect(src).toContain("Packaging");
    expect(src).toContain("Photo the packaging");
  });

  it("handles takeaway visit type", () => {
    expect(src).toContain('"takeaway"');
    expect(src).toContain("Takeaway bag");
    expect(src).toContain("pickup container");
  });

  it("returns PhotoPrompt objects with icon, label, hint", () => {
    expect(src).toContain("interface PhotoPrompt");
    expect(src).toContain("icon: string");
    expect(src).toContain("label: string");
    expect(src).toContain("hint: string");
  });

  it("provides 3 prompts per visit type", () => {
    // Each case returns array of 3 prompts
    const matches = src.match(/return \[[\s\S]*?\];/g) || [];
    const promptArrays = matches.filter(m => m.includes("icon:"));
    expect(promptArrays.length).toBeGreaterThanOrEqual(3);
  });
});

// ---------------------------------------------------------------------------
// 2. visitType prop wiring
// ---------------------------------------------------------------------------
describe("Photo prompts — visitType prop wiring", () => {
  it("RatingExtrasStep accepts visitType prop", () => {
    const src = readFile("components/rate/RatingExtrasStep.tsx");
    expect(src).toContain("visitType?: VisitType | null");
    expect(src).toContain("Sprint 459");
  });

  it("rate/[id].tsx passes visitType to RatingExtrasStep", () => {
    const src = readFile("app/rate/[id].tsx");
    expect(src).toContain("visitType={visitType}");
  });

  it("VisitType type includes all 3 variants", () => {
    // Sprint 466: extracted to RatingPrompts.tsx
    const src = readFile("components/rate/RatingPrompts.tsx");
    expect(src).toContain('"dine_in"');
    expect(src).toContain('"delivery"');
    expect(src).toContain('"takeaway"');
  });
});

// ---------------------------------------------------------------------------
// 3. Photo prompt UI
// ---------------------------------------------------------------------------
describe("Photo prompts — UI rendering", () => {
  const src = readFile("components/rate/RatingExtrasStep.tsx");

  it("renders photo prompts when no photos", () => {
    expect(src).toContain("photoPromptSection");
    expect(src).toContain("getPhotoPromptsByVisitType(visitType)");
  });

  it("has photoPromptRow style", () => {
    expect(src).toContain("photoPromptRow");
  });

  it("shows prompt label and hint", () => {
    expect(src).toContain("photoPromptLabel");
    expect(src).toContain("photoPromptHint");
    expect(src).toContain("prompt.label");
    expect(src).toContain("prompt.hint");
  });

  it("uses Ionicons for prompt icon", () => {
    expect(src).toContain("prompt.icon");
  });
});

// ---------------------------------------------------------------------------
// 4. Sprint & retro docs
// ---------------------------------------------------------------------------
describe("Sprint 459 documentation", () => {
  it("sprint doc exists", () => {
    const src = readFile("docs/sprints/SPRINT-459-PHOTO-PROMPTS.md");
    expect(src).toContain("Sprint 459");
    expect(src).toContain("photo");
  });

  it("retro doc exists", () => {
    const src = readFile("docs/retros/RETRO-459-PHOTO-PROMPTS.md");
    expect(src).toContain("Retro 459");
    expect(src).toContain("Team Morale");
  });

  it("retro has action items", () => {
    const src = readFile("docs/retros/RETRO-459-PHOTO-PROMPTS.md");
    expect(src).toContain("Action Items");
    expect(src).toContain("Sprint 460");
  });
});
