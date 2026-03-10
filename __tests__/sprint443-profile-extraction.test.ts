/**
 * Sprint 443 — Profile Extraction: Rating History Section
 *
 * Validates:
 * 1. RatingHistorySection component exists with correct exports
 * 2. profile.tsx uses the extracted component
 * 3. profile.tsx LOC reduced below 720 trigger
 * 4. Sprint & retro docs
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. RatingHistorySection component
// ---------------------------------------------------------------------------
describe("RatingHistorySection component", () => {
  const src = readFile("components/profile/RatingHistorySection.tsx");

  it("file exists", () => {
    expect(fileExists("components/profile/RatingHistorySection.tsx")).toBe(true);
  });

  it("exports RatingHistorySection function", () => {
    expect(src).toContain("export function RatingHistorySection");
  });

  it("exports RatingHistorySectionProps interface", () => {
    expect(src).toContain("export interface RatingHistorySectionProps");
  });

  it("accepts ratingHistory prop", () => {
    expect(src).toContain("ratingHistory: any[]");
  });

  it("accepts username prop", () => {
    expect(src).toContain("username: string");
  });

  it("accepts onDelete prop", () => {
    expect(src).toContain("onDelete: (ratingId: string) => void");
  });

  it("has historyPageSize state (moved from profile.tsx)", () => {
    expect(src).toContain("useState(10)");
    expect(src).toContain("historyPageSize");
  });

  it("imports HistoryRow from SubComponents", () => {
    expect(src).toContain("HistoryRow");
    expect(src).toContain("SubComponents");
  });

  it("imports RatingExportButton", () => {
    expect(src).toContain("RatingExportButton");
    expect(src).toContain("RatingExport");
  });

  it("imports SlideUpView animation", () => {
    expect(src).toContain("SlideUpView");
  });

  it("has Rating History title", () => {
    expect(src).toContain("Rating History");
  });

  it("has Show More and Show Less buttons", () => {
    expect(src).toContain("Show More");
    expect(src).toContain("Show Less");
  });

  it("has empty state with CTA", () => {
    expect(src).toContain("No ratings yet");
    expect(src).toContain("Find a place to rate");
  });

  it("has self-contained styles", () => {
    expect(src).toContain("StyleSheet.create");
    expect(src).toContain("showMoreBtn");
    expect(src).toContain("emptyHistory");
  });

  it("references Sprint 443 in header comment", () => {
    expect(src).toContain("Sprint 443");
  });
});

// ---------------------------------------------------------------------------
// 2. profile.tsx integration
// ---------------------------------------------------------------------------
describe("profile.tsx — uses extracted component", () => {
  const src = readFile("app/(tabs)/profile.tsx");

  it("imports RatingHistorySection", () => {
    expect(src).toContain("import { RatingHistorySection }");
    expect(src).toContain("components/profile/RatingHistorySection");
  });

  it("renders <RatingHistorySection>", () => {
    expect(src).toContain("<RatingHistorySection");
  });

  it("passes ratingHistory prop", () => {
    expect(src).toContain("ratingHistory={profile.ratingHistory}");
  });

  it("passes username prop", () => {
    expect(src).toContain("username={profile.username}");
  });

  it("passes onDelete prop", () => {
    expect(src).toContain("onDelete={handleDeleteRating}");
  });

  it("no longer has inline historyPageSize state", () => {
    expect(src).not.toContain("useState(10)");
  });

  it("no longer imports SlideUpView (was only for rating history)", () => {
    expect(src).not.toContain("SlideUpView");
  });

  it("no longer imports RatingExportButton directly", () => {
    expect(src).not.toContain("import { RatingExportButton }");
  });

  it("no longer imports HistoryRow directly", () => {
    // HistoryRow removed from SubComponents import
    expect(src).not.toMatch(/import[^}]*HistoryRow[^}]*from.*SubComponents/);
  });
});

// ---------------------------------------------------------------------------
// 3. LOC reduction
// ---------------------------------------------------------------------------
describe("profile.tsx LOC reduction", () => {
  const src = readFile("app/(tabs)/profile.tsx");

  it("profile.tsx is under 650 LOC (was 699, target ~627)", () => {
    const lines = src.split("\n").length;
    expect(lines).toBeLessThan(650);
  });

  it("RatingHistorySection is under 200 LOC", () => {
    const src2 = readFile("components/profile/RatingHistorySection.tsx");
    expect(src2.split("\n").length).toBeLessThan(200);
  });
});

// ---------------------------------------------------------------------------
// 4. Sprint & retro docs
// ---------------------------------------------------------------------------
describe("Sprint 443 documentation", () => {
  it("sprint doc exists", () => {
    const src = readFile("docs/sprints/SPRINT-443-PROFILE-EXTRACTION.md");
    expect(src).toContain("Sprint 443");
    expect(src).toContain("Profile");
  });

  it("retro doc exists", () => {
    const src = readFile("docs/retros/RETRO-443-PROFILE-EXTRACTION.md");
    expect(src).toContain("Retro 443");
    expect(src).toContain("Team Morale");
  });

  it("retro has action items", () => {
    const src = readFile("docs/retros/RETRO-443-PROFILE-EXTRACTION.md");
    expect(src).toContain("Action Items");
    expect(src).toContain("Sprint 444");
  });
});
