/**
 * Sprint 444 — Business Page Review Summary Cards
 *
 * Validates:
 * 1. ReviewSummaryCard component structure
 * 2. Visit type breakdown logic
 * 3. Would-return percentage
 * 4. Rating recency counting
 * 5. Dimension averages
 * 6. Business page integration
 * 7. Sprint & retro docs
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. ReviewSummaryCard component structure
// ---------------------------------------------------------------------------
describe("ReviewSummaryCard — component", () => {
  const src = readFile("components/business/ReviewSummaryCard.tsx");

  it("file exists", () => {
    expect(fileExists("components/business/ReviewSummaryCard.tsx")).toBe(true);
  });

  it("exports ReviewSummaryCard function", () => {
    expect(src).toContain("export function ReviewSummaryCard");
  });

  it("exports ReviewSummaryCardProps interface", () => {
    expect(src).toContain("export interface ReviewSummaryCardProps");
  });

  it("exports ReviewRating interface", () => {
    expect(src).toContain("export interface ReviewRating");
  });

  it("accepts ratings prop", () => {
    expect(src).toContain("ratings: ReviewRating[]");
  });

  it("has Review Summary header", () => {
    expect(src).toContain("Review Summary");
  });

  it("returns null for < 2 ratings", () => {
    expect(src).toContain("ratings.length < 2) return null");
  });

  it("uses analytics-outline icon in header", () => {
    expect(src).toContain("analytics-outline");
  });

  it("has self-contained styles", () => {
    expect(src).toContain("StyleSheet.create");
  });
});

// ---------------------------------------------------------------------------
// 2. Visit type breakdown
// ---------------------------------------------------------------------------
describe("ReviewSummaryCard — visit type breakdown", () => {
  const src = readFile("components/business/ReviewSummaryCard.tsx");

  it("has getVisitTypeBreakdown function", () => {
    expect(src).toContain("function getVisitTypeBreakdown");
  });

  it("counts dine_in, delivery, takeaway", () => {
    expect(src).toContain("dine_in");
    expect(src).toContain("delivery");
    expect(src).toContain("takeaway");
  });

  it("has visit type icons", () => {
    expect(src).toContain("restaurant-outline");
    expect(src).toContain("bicycle-outline");
    expect(src).toContain("bag-handle-outline");
  });

  it("computes percentage", () => {
    expect(src).toContain("Math.round");
    expect(src).toContain("/ total");
  });

  it("filters out zero-count types", () => {
    expect(src).toContain(".filter(t => t.count > 0)");
  });

  it("renders Visit Types section label", () => {
    expect(src).toContain("Visit Types");
  });
});

// ---------------------------------------------------------------------------
// 3. Would-return percentage
// ---------------------------------------------------------------------------
describe("ReviewSummaryCard — would return", () => {
  const src = readFile("components/business/ReviewSummaryCard.tsx");

  it("has getWouldReturnPct function", () => {
    expect(src).toContain("function getWouldReturnPct");
  });

  it("filters by wouldReturn != null", () => {
    expect(src).toContain("r.wouldReturn != null");
  });

  it("returns null if no data", () => {
    expect(src).toContain("return null");
  });

  it("shows thumbs-up icon", () => {
    expect(src).toContain("thumbs-up-outline");
  });

  it("displays 'would return' label", () => {
    expect(src).toContain("would return");
  });

  it("uses green color for high percentage", () => {
    expect(src).toContain("wouldReturnPct >= 70");
    expect(src).toContain("#2D8F4E");
  });
});

// ---------------------------------------------------------------------------
// 4. Rating recency
// ---------------------------------------------------------------------------
describe("ReviewSummaryCard — recency", () => {
  const src = readFile("components/business/ReviewSummaryCard.tsx");

  it("has getRecentCount function", () => {
    expect(src).toContain("function getRecentCount");
  });

  it("uses 30-day window", () => {
    expect(src).toContain("getRecentCount(ratings, 30)");
  });

  it("shows calendar icon", () => {
    expect(src).toContain("calendar-outline");
  });

  it("displays 'last 30 days' label", () => {
    expect(src).toContain("last 30 days");
  });
});

// ---------------------------------------------------------------------------
// 5. Dimension averages
// ---------------------------------------------------------------------------
describe("ReviewSummaryCard — dimension averages", () => {
  const src = readFile("components/business/ReviewSummaryCard.tsx");

  it("has getDimensionAverages function", () => {
    expect(src).toContain("function getDimensionAverages");
  });

  it("covers all 6 dimensions", () => {
    expect(src).toContain("foodScore");
    expect(src).toContain("serviceScore");
    expect(src).toContain("vibeScore");
    expect(src).toContain("packagingScore");
    expect(src).toContain("waitTimeScore");
    expect(src).toContain("valueScore");
  });

  it("has dimension icons", () => {
    expect(src).toContain("fast-food-outline");
    expect(src).toContain("people-outline");
    expect(src).toContain("musical-notes-outline");
  });

  it("filters out zero averages", () => {
    expect(src).toContain(".filter(d => d.avg > 0)");
  });

  it("shows Dimension Averages section label", () => {
    expect(src).toContain("Dimension Averages");
  });

  it("highlights high scores", () => {
    expect(src).toContain("d.avg >= 4");
    expect(src).toContain("dimensionValueHigh");
  });
});

// ---------------------------------------------------------------------------
// 6. Sprint & retro docs
// ---------------------------------------------------------------------------
describe("Sprint 444 documentation", () => {
  it("sprint doc exists", () => {
    const src = readFile("docs/sprints/SPRINT-444-REVIEW-SUMMARY.md");
    expect(src).toContain("Sprint 444");
    expect(src).toContain("Review Summary");
  });

  it("retro doc exists", () => {
    const src = readFile("docs/retros/RETRO-444-REVIEW-SUMMARY.md");
    expect(src).toContain("Retro 444");
    expect(src).toContain("Team Morale");
  });

  it("retro has action items", () => {
    const src = readFile("docs/retros/RETRO-444-REVIEW-SUMMARY.md");
    expect(src).toContain("Action Items");
    expect(src).toContain("Sprint 445");
  });
});
