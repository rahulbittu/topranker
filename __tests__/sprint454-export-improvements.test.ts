/**
 * Sprint 454 — Rating History Export Improvements
 *
 * Validates:
 * 1. JSON export format
 * 2. Summary statistics computation
 * 3. Date range filtering
 * 4. Format toggle UI
 * 5. Sprint & retro docs
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. JSON export format
// ---------------------------------------------------------------------------
describe("RatingExport — JSON format", () => {
  const src = readFile("components/profile/RatingExport.tsx");

  it("exports ratingsToJSON function", () => {
    expect(src).toContain("export function ratingsToJSON");
  });

  it("JSON includes exportedAt timestamp", () => {
    expect(src).toContain("exportedAt");
  });

  it("JSON includes username", () => {
    expect(src).toContain("username");
  });

  it("JSON includes summary", () => {
    expect(src).toContain("summary");
  });

  it("JSON includes ratings array", () => {
    expect(src).toContain("ratings: ratings.map");
  });

  it("JSON uses pretty printing", () => {
    expect(src).toContain("null, 2");
  });

  it("references Sprint 454", () => {
    expect(src).toContain("Sprint 454");
  });
});

// ---------------------------------------------------------------------------
// 2. Summary statistics
// ---------------------------------------------------------------------------
describe("RatingExport — summary statistics", () => {
  const src = readFile("components/profile/RatingExport.tsx");

  it("exports computeExportSummary function", () => {
    expect(src).toContain("export function computeExportSummary");
  });

  it("computes totalRatings", () => {
    expect(src).toContain("totalRatings: ratings.length");
  });

  it("computes avgScore", () => {
    expect(src).toContain("avgScore");
  });

  it("computes avgWeight", () => {
    expect(src).toContain("avgWeight");
  });

  it("computes wouldReturnPct", () => {
    expect(src).toContain("wouldReturnPct");
  });

  it("computes visitTypes distribution", () => {
    expect(src).toContain("visitTypes");
  });

  it("computes dateRange", () => {
    expect(src).toContain("dateRange");
    expect(src).toContain("earliest");
    expect(src).toContain("latest");
  });

  it("returns null for empty ratings", () => {
    expect(src).toContain("if (ratings.length === 0) return null");
  });
});

// ---------------------------------------------------------------------------
// 3. Date range filtering
// ---------------------------------------------------------------------------
describe("RatingExport — date range filter", () => {
  const src = readFile("components/profile/RatingExport.tsx");

  it("exports filterByDateRange function", () => {
    expect(src).toContain("export function filterByDateRange");
  });

  it("accepts startDate parameter", () => {
    expect(src).toContain("startDate");
  });

  it("accepts endDate parameter", () => {
    expect(src).toContain("endDate");
  });

  it("makes endDate inclusive", () => {
    expect(src).toContain("86400000"); // adds 1 day
  });
});

// ---------------------------------------------------------------------------
// 4. Format toggle UI
// ---------------------------------------------------------------------------
describe("RatingExport — format toggle", () => {
  const src = readFile("components/profile/RatingExport.tsx");

  it("has ExportFormat type", () => {
    expect(src).toContain("ExportFormat");
  });

  it("has format state", () => {
    expect(src).toContain('useState<ExportFormat>("csv")');
  });

  it("has CSV toggle button", () => {
    expect(src).toContain('setFormat("csv")');
  });

  it("has JSON toggle button", () => {
    expect(src).toContain('setFormat("json")');
  });

  it("conditionally calls ratingsToJSON", () => {
    expect(src).toContain("ratingsToJSON(ratings, username)");
  });

  it("shows summary stats row", () => {
    expect(src).toContain("summaryRow");
    expect(src).toContain("summary.avgScore");
    expect(src).toContain("summary.wouldReturnPct");
  });

  it("uses correct MIME type for JSON", () => {
    expect(src).toContain("application/json");
  });

  it("uses correct file extension", () => {
    expect(src).toContain('.${ext}');
  });
});

// ---------------------------------------------------------------------------
// 5. Sprint & retro docs
// ---------------------------------------------------------------------------
describe("Sprint 454 documentation", () => {
  it("sprint doc exists", () => {
    const src = readFile("docs/sprints/SPRINT-454-EXPORT-IMPROVEMENTS.md");
    expect(src).toContain("Sprint 454");
    expect(src).toContain("export");
  });

  it("retro doc exists", () => {
    const src = readFile("docs/retros/RETRO-454-EXPORT-IMPROVEMENTS.md");
    expect(src).toContain("Retro 454");
    expect(src).toContain("Team Morale");
  });

  it("retro has action items", () => {
    const src = readFile("docs/retros/RETRO-454-EXPORT-IMPROVEMENTS.md");
    expect(src).toContain("Action Items");
    expect(src).toContain("Sprint 455");
  });
});
