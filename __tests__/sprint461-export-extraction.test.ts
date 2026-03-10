/**
 * Sprint 461 — RatingExport Extraction
 *
 * Validates:
 * 1. Utility functions in lib/rating-export-utils.ts
 * 2. RatingExport.tsx reduced LOC with re-exports
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
// 1. Utility functions in lib/rating-export-utils.ts
// ---------------------------------------------------------------------------
describe("Rating export utils — lib/rating-export-utils.ts", () => {
  const src = readFile("lib/rating-export-utils.ts");

  it("exports ExportableRating interface", () => {
    expect(src).toContain("export interface ExportableRating");
  });

  it("exports ExportFormat type", () => {
    expect(src).toContain("export type ExportFormat");
  });

  it("exports escapeCSV function", () => {
    expect(src).toContain("export function escapeCSV");
  });

  it("exports getVisitTypeLabel function", () => {
    expect(src).toContain("export function getVisitTypeLabel");
  });

  it("exports ratingsToCSV function", () => {
    expect(src).toContain("export function ratingsToCSV");
  });

  it("exports computeExportSummary function", () => {
    expect(src).toContain("export function computeExportSummary");
  });

  it("exports ratingsToJSON function", () => {
    expect(src).toContain("export function ratingsToJSON");
  });

  it("exports filterByDateRange function", () => {
    expect(src).toContain("export function filterByDateRange");
  });

  it("references Sprint 461 extraction", () => {
    expect(src).toContain("Sprint 461");
  });

  it("has no React imports (pure utilities)", () => {
    expect(src).not.toContain("import React");
    expect(src).not.toContain("from \"react\"");
  });
});

// ---------------------------------------------------------------------------
// 2. RatingExport.tsx reduced LOC
// ---------------------------------------------------------------------------
describe("RatingExport.tsx — file health after extraction", () => {
  const src = readFile("components/profile/RatingExport.tsx");

  it("is under 180 LOC (was 294)", () => {
    expect(countLines(src)).toBeLessThan(180);
  });

  it("imports from lib/rating-export-utils", () => {
    expect(src).toContain("rating-export-utils");
  });

  it("still exports RatingExportButton", () => {
    expect(src).toContain("export function RatingExportButton");
  });

  it("references Sprint 461 extraction", () => {
    expect(src).toContain("Sprint 461");
  });
});

// ---------------------------------------------------------------------------
// 3. Backward compatibility — re-exports
// ---------------------------------------------------------------------------
describe("RatingExport.tsx — re-exports", () => {
  const src = readFile("components/profile/RatingExport.tsx");

  it("re-exports ratingsToCSV", () => {
    expect(src).toContain("ratingsToCSV");
  });

  it("re-exports ratingsToJSON", () => {
    expect(src).toContain("ratingsToJSON");
  });

  it("re-exports computeExportSummary", () => {
    expect(src).toContain("computeExportSummary");
  });

  it("re-exports filterByDateRange", () => {
    expect(src).toContain("filterByDateRange");
  });

  it("re-exports ExportableRating type", () => {
    expect(src).toContain("ExportableRating");
  });

  it("re-exports ExportFormat type", () => {
    expect(src).toContain("ExportFormat");
  });
});

// ---------------------------------------------------------------------------
// 4. Sprint & retro docs
// ---------------------------------------------------------------------------
describe("Sprint 461 documentation", () => {
  it("sprint doc exists", () => {
    const src = readFile("docs/sprints/SPRINT-461-EXPORT-EXTRACTION.md");
    expect(src).toContain("Sprint 461");
    expect(src).toContain("extraction");
  });

  it("retro doc exists", () => {
    const src = readFile("docs/retros/RETRO-461-EXPORT-EXTRACTION.md");
    expect(src).toContain("Retro 461");
    expect(src).toContain("Team Morale");
  });

  it("retro has action items", () => {
    const src = readFile("docs/retros/RETRO-461-EXPORT-EXTRACTION.md");
    expect(src).toContain("Action Items");
    expect(src).toContain("Sprint 462");
  });
});
