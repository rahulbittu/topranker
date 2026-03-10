/**
 * Sprint 417 — Challenger Comparison Details
 *
 * Validates:
 * 1. ComparisonDetails component structure
 * 2. StatRow sub-component for side-by-side stats
 * 3. ChallengeCard integration
 * 4. Collapsible behavior
 * 5. Accessibility
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const countLines = (content: string) => content.split("\n").length;

// ---------------------------------------------------------------------------
// 1. ComparisonDetails component
// ---------------------------------------------------------------------------
describe("ComparisonDetails component", () => {
  const src = readFile("components/challenger/ComparisonDetails.tsx");

  it("exports ComparisonDetails function", () => {
    expect(src).toContain("export function ComparisonDetails");
  });

  it("accepts defender and challenger ApiBusiness props", () => {
    expect(src).toContain("defender: ApiBusiness");
    expect(src).toContain("challenger: ApiBusiness");
  });

  it("has collapsible expand/collapse toggle", () => {
    expect(src).toContain("expanded");
    expect(src).toContain("setExpanded");
    expect(src).toContain("LayoutAnimation");
  });

  it("shows Compare Stats and Hide Details labels", () => {
    expect(src).toContain("Compare Stats");
    expect(src).toContain("Hide Details");
  });

  it("renders header row with business names", () => {
    expect(src).toContain("defender.name");
    expect(src).toContain("challenger.name");
    expect(src).toContain("vs");
  });
});

// ---------------------------------------------------------------------------
// 2. StatRow sub-component
// ---------------------------------------------------------------------------
describe("ComparisonDetails — StatRow", () => {
  const src = readFile("components/challenger/ComparisonDetails.tsx");

  it("defines StatRow function", () => {
    expect(src).toContain("function StatRow");
  });

  it("shows score comparison", () => {
    expect(src).toContain("Score");
    expect(src).toContain("star-outline");
  });

  it("shows ratings comparison", () => {
    expect(src).toContain("Ratings");
    expect(src).toContain("people-outline");
  });

  it("shows cuisine comparison", () => {
    expect(src).toContain("Cuisine");
    expect(src).toContain("restaurant-outline");
  });

  it("shows area/neighborhood comparison", () => {
    expect(src).toContain("Area");
    expect(src).toContain("location-outline");
  });

  it("shows price comparison", () => {
    expect(src).toContain("Price");
    expect(src).toContain("cash-outline");
  });

  it("highlights winner value with amber color", () => {
    expect(src).toContain("highlightWinner");
    expect(src).toContain("statValueWinner");
  });
});

// ---------------------------------------------------------------------------
// 3. ChallengeCard integration
// ---------------------------------------------------------------------------
describe("ChallengeCard — ComparisonDetails integration", () => {
  const src = readFile("components/challenger/ChallengeCard.tsx");

  it("imports ComparisonDetails", () => {
    expect(src).toContain("ComparisonDetails");
    expect(src).toContain("challenger/ComparisonDetails");
  });

  it("renders ComparisonDetails component", () => {
    expect(src).toContain("<ComparisonDetails");
  });

  it("passes defender and challenger business props", () => {
    expect(src).toContain("defender={challenge.defenderBusiness}");
    expect(src).toContain("challenger={challenge.challengerBusiness}");
  });
});

// ---------------------------------------------------------------------------
// 4. Accessibility
// ---------------------------------------------------------------------------
describe("ComparisonDetails — accessibility", () => {
  const src = readFile("components/challenger/ComparisonDetails.tsx");

  it("toggle button has accessibility role", () => {
    expect(src).toContain('accessibilityRole="button"');
  });

  it("toggle button has descriptive labels", () => {
    expect(src).toContain("Hide comparison details");
    expect(src).toContain("Show comparison details");
  });

  it("toggle has expanded state", () => {
    expect(src).toContain("accessibilityState");
    expect(src).toContain("expanded");
  });
});

// ---------------------------------------------------------------------------
// 5. Component size
// ---------------------------------------------------------------------------
describe("ComparisonDetails — file health", () => {
  it("is a compact component under 220 LOC", () => {
    const src = readFile("components/challenger/ComparisonDetails.tsx");
    expect(countLines(src)).toBeLessThan(220);
  });

  it("challenger.tsx is still under threshold", () => {
    const src = readFile("app/(tabs)/challenger.tsx");
    expect(countLines(src)).toBeLessThan(575);
  });
});
