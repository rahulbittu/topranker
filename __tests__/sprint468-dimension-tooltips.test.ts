/**
 * Sprint 468 — Dimension Tooltip Scoring Tips
 *
 * Validates:
 * 1. scoringTip field in DimensionTooltipData
 * 2. Scoring tips per visit type
 * 3. UI rendering of scoring tips
 * 4. Sprint & retro docs
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. scoringTip field
// ---------------------------------------------------------------------------
describe("Dimension tooltips — scoringTip field", () => {
  const src = readFile("components/rate/VisitTypeStep.tsx");

  it("DimensionTooltipData has scoringTip field", () => {
    expect(src).toContain("scoringTip: string");
  });

  it("references Sprint 468", () => {
    expect(src).toContain("Sprint 468");
  });
});

// ---------------------------------------------------------------------------
// 2. Scoring tips per visit type
// ---------------------------------------------------------------------------
describe("Dimension tooltips — scoring tips content", () => {
  const src = readFile("components/rate/VisitTypeStep.tsx");

  it("dine-in has scoring tips for all 3 dimensions", () => {
    expect(src).toContain("exceptional dish");
    expect(src).toContain("felt like a VIP");
    expect(src).toContain("perfect for the occasion");
  });

  it("delivery has scoring tips for all 3 dimensions", () => {
    expect(src).toContain("arrived hot, fresh");
    expect(src).toContain("no leaks, items separated");
    expect(src).toContain("great deal even with delivery");
  });

  it("takeaway has scoring tips for all 3 dimensions", () => {
    expect(src).toContain("hot, fresh, ready as expected");
    expect(src).toContain("ready when promised");
    expect(src).toContain("great value, saves time");
  });

  it("tips include 10/5/1 scale anchors", () => {
    // All tips use the "10 = ... 5 = ... 1 = ..." format
    const tipMatches = (src.match(/10 = /g) || []).length;
    expect(tipMatches).toBeGreaterThanOrEqual(9); // 3 per visit type
  });
});

// ---------------------------------------------------------------------------
// 3. UI rendering
// ---------------------------------------------------------------------------
describe("Dimension tooltips — scoring tip UI", () => {
  const src = readFile("components/rate/VisitTypeStep.tsx");

  it("renders scoringTip in tooltip card", () => {
    expect(src).toContain("tooltip.scoringTip");
  });

  it("has tooltipScoringTip style", () => {
    expect(src).toContain("tooltipScoringTip");
  });

  it("scoring tip uses amber color", () => {
    expect(src).toContain("BRAND.colors.amber");
  });
});

// ---------------------------------------------------------------------------
// 4. Sprint & retro docs
// ---------------------------------------------------------------------------
describe("Sprint 468 documentation", () => {
  it("sprint doc exists", () => {
    const src = readFile("docs/sprints/SPRINT-468-DIMENSION-TOOLTIPS.md");
    expect(src).toContain("Sprint 468");
    expect(src).toContain("tooltip");
  });

  it("retro doc exists", () => {
    const src = readFile("docs/retros/RETRO-468-DIMENSION-TOOLTIPS.md");
    expect(src).toContain("Retro 468");
    expect(src).toContain("Team Morale");
  });

  it("retro has action items", () => {
    const src = readFile("docs/retros/RETRO-468-DIMENSION-TOOLTIPS.md");
    expect(src).toContain("Action Items");
    expect(src).toContain("Sprint 469");
  });
});
