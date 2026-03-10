/**
 * Sprint 433 — Rating History Export (CSV)
 *
 * Validates:
 * 1. RatingExport component exports
 * 2. CSV generation (ratingsToCSV)
 * 3. CSV escaping and formatting
 * 4. Visit type labels in export
 * 5. Profile integration
 * 6. File health
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const countLines = (content: string) => content.split("\n").length;

// ---------------------------------------------------------------------------
// 1. RatingExport component exports
// ---------------------------------------------------------------------------
describe("RatingExport — exports", () => {
  const src = readFile("components/profile/RatingExport.tsx");

  it("exports RatingExportButton component", () => {
    expect(src).toContain("export function RatingExportButton");
  });

  it("exports RatingExportButtonProps interface", () => {
    expect(src).toContain("export interface RatingExportButtonProps");
  });

  it("exports ratingsToCSV function", () => {
    expect(src).toContain("export function ratingsToCSV");
  });

  it("exports ExportableRating interface", () => {
    expect(src).toContain("export interface ExportableRating");
  });
});

// ---------------------------------------------------------------------------
// 2. CSV generation
// ---------------------------------------------------------------------------
describe("RatingExport — CSV generation", () => {
  const src = readFile("components/profile/RatingExport.tsx");

  it("has CSV headers", () => {
    expect(src).toContain("CSV_HEADERS");
    expect(src).toContain("Business");
    expect(src).toContain("Overall Score");
    expect(src).toContain("Would Return");
  });

  it("formats dates in en-US locale", () => {
    expect(src).toContain("toLocaleDateString");
    expect(src).toContain("en-US");
  });

  it("includes weight and weighted score", () => {
    expect(src).toContain("Weight");
    expect(src).toContain("Weighted Score");
  });

  it("joins rows with newlines", () => {
    expect(src).toContain('rows.join("\\n")');
  });
});

// ---------------------------------------------------------------------------
// 3. CSV escaping
// ---------------------------------------------------------------------------
describe("RatingExport — CSV escaping", () => {
  const src = readFile("components/profile/RatingExport.tsx");

  it("has escapeCSV function", () => {
    expect(src).toContain("function escapeCSV");
  });

  it("handles commas in values", () => {
    expect(src).toContain('includes(",")');
  });

  it("handles quotes in values", () => {
    expect(src).toContain('includes(\'"\')');
    expect(src).toContain('replace(/"/g');
  });

  it("handles newlines in values", () => {
    expect(src).toContain('includes("\\n")');
  });
});

// ---------------------------------------------------------------------------
// 4. Visit type labels
// ---------------------------------------------------------------------------
describe("RatingExport — visit types", () => {
  const src = readFile("components/profile/RatingExport.tsx");

  it("labels dine-in correctly", () => {
    expect(src).toContain('"Dine-in"');
  });

  it("labels delivery correctly", () => {
    expect(src).toContain('"Delivery"');
  });

  it("labels takeaway correctly", () => {
    expect(src).toContain('"Takeaway"');
  });

  it("includes dimension labels per visit type", () => {
    expect(src).toContain("Service");
    expect(src).toContain("Packaging");
    expect(src).toContain("Wait Time");
    expect(src).toContain("Vibe");
    expect(src).toContain("Value");
  });
});

// ---------------------------------------------------------------------------
// 5. Export button features
// ---------------------------------------------------------------------------
describe("RatingExport — button UI", () => {
  const src = readFile("components/profile/RatingExport.tsx");

  it("has export button with download icon", () => {
    expect(src).toContain("download-outline");
    expect(src).toContain("Export CSV");
  });

  it("handles empty ratings gracefully", () => {
    expect(src).toContain("No Ratings");
    expect(src).toContain("Rate some restaurants first");
  });

  it("shows exporting state", () => {
    expect(src).toContain("Exporting...");
    expect(src).toContain("exportBtnDisabled");
  });

  it("supports web via Blob download", () => {
    expect(src).toContain("Blob");
    expect(src).toContain("createObjectURL");
  });

  it("supports native via Share API", () => {
    expect(src).toContain("Share.share");
  });

  it("uses IoniconsName type (no as any)", () => {
    expect(src).toContain("type IoniconsName");
    expect(src).not.toContain("as any");
  });
});

// ---------------------------------------------------------------------------
// 6. Profile integration
// ---------------------------------------------------------------------------
describe("RatingExport — profile integration", () => {
  const src = readFile("app/(tabs)/profile.tsx");

  it("imports RatingExportButton", () => {
    expect(src).toContain("RatingExportButton");
    expect(src).toContain("components/profile/RatingExport");
  });

  it("renders export button with rating history", () => {
    expect(src).toContain("<RatingExportButton");
    expect(src).toContain("ratings={profile.ratingHistory}");
  });
});

// ---------------------------------------------------------------------------
// 7. File health
// ---------------------------------------------------------------------------
describe("file health", () => {
  it("RatingExport is under 170 LOC", () => {
    const src = readFile("components/profile/RatingExport.tsx");
    expect(countLines(src)).toBeLessThan(170);
  });

  it("profile.tsx is under 800 LOC threshold", () => {
    const src = readFile("app/(tabs)/profile.tsx");
    expect(countLines(src)).toBeLessThan(800);
  });
});
