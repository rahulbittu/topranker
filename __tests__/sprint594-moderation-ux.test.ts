/**
 * Sprint 594: Admin Moderation Dashboard UX Enhancement
 *
 * Tests:
 * 1. ModerationItemCard extracted as standalone component
 * 2. Text search in moderation queue
 * 3. Moderator notes on reject
 * 4. Stale item indicator (>24h pending)
 * 5. Item counts on filter chips
 * 6. Relative time display (time ago)
 * 7. LOC thresholds
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 594: ModerationItemCard Extraction", () => {
  const src = readFile("components/admin/ModerationItemCard.tsx");

  it("exports ModerationItemCard function", () => {
    expect(src).toContain("export function ModerationItemCard");
  });

  it("exports ModerationItem interface", () => {
    expect(src).toContain("export interface ModerationItem");
  });

  it("has relative time formatting", () => {
    expect(src).toContain("formatTimeAgo");
    expect(src).toContain("m ago");
    expect(src).toContain("h ago");
    expect(src).toContain("d ago");
  });

  it("has stale item detection (>24h)", () => {
    expect(src).toContain("isStale");
    expect(src).toContain("24 * 60 * 60 * 1000");
  });

  it("shows stale badge for old pending items", () => {
    expect(src).toContain("staleBadge");
    expect(src).toContain("Stale");
  });

  it("has reject note input", () => {
    expect(src).toContain("rejectNote");
    expect(src).toContain("Reason for rejection");
    expect(src).toContain("Confirm Reject");
  });

  it("shows moderator note on resolved items", () => {
    expect(src).toContain("moderatorNote");
  });

  it("is under 220 LOC", () => {
    expect(src.split("\n").length).toBeLessThan(220);
  });
});

describe("Sprint 594: Moderation Queue UX", () => {
  const src = readFile("app/admin/moderation.tsx");

  it("imports ModerationItemCard", () => {
    expect(src).toContain("ModerationItemCard");
    expect(src).toContain("components/admin/ModerationItemCard");
  });

  it("has text search functionality", () => {
    expect(src).toContain("searchQuery");
    expect(src).toContain("Search content or violations");
    expect(src).toContain("search-outline");
  });

  it("filters items by search query", () => {
    expect(src).toContain("filteredItems");
    expect(src).toContain("searchQuery.toLowerCase()");
  });

  it("shows item counts on filter chips", () => {
    expect(src).toContain("o.count");
    expect(src).toContain("statusOptions");
  });

  it("shows search-aware empty state", () => {
    expect(src).toContain("No items match your search");
  });

  it("passes reject note handler to item cards", () => {
    expect(src).toContain("rejectNotes");
    expect(src).toContain("onRejectNoteChange");
    expect(src).toContain("showRejectInput");
  });

  it("is under 350 LOC (was 477, extracted card)", () => {
    expect(src.split("\n").length).toBeLessThan(350);
  });
});

describe("Sprint 594: Threshold Checks", () => {
  const thresholds = JSON.parse(readFile("shared/thresholds.json"));

  it("test count meets minimum", () => {
    expect(thresholds.tests.currentCount).toBeGreaterThanOrEqual(thresholds.tests.minCount);
  });

  it("build size under max", () => {
    expect(thresholds.build.currentSizeKb).toBeLessThanOrEqual(thresholds.build.maxSizeKb);
  });
});
