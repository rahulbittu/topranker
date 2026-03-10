/**
 * Sprint 307: Dish Leaderboard Pagination
 *
 * Show top 10 entries initially, with "Show More" button to reveal more.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const pageSrc = fs.readFileSync(path.join(ROOT, "app/dish/[slug].tsx"), "utf-8");

describe("Sprint 307 — Dish Leaderboard Pagination", () => {
  // ─── Pagination state ──────────────────────────────────────

  it("imports useState", () => {
    expect(pageSrc).toContain("useState");
  });

  it("defines PAGE_SIZE constant of 10", () => {
    expect(pageSrc).toContain("PAGE_SIZE = 10");
  });

  it("has visibleCount state initialized to PAGE_SIZE", () => {
    expect(pageSrc).toContain("useState(PAGE_SIZE)");
  });

  it("slices entries to visibleCount", () => {
    expect(pageSrc).toContain("allEntries.slice(0, visibleCount)");
  });

  it("computes hasMore flag", () => {
    expect(pageSrc).toContain("allEntries.length > visibleCount");
  });

  // ─── Show More button ─────────────────────────────────────

  it("renders Show More button when hasMore is true", () => {
    expect(pageSrc).toContain("{hasMore && (");
  });

  it("Show More increments visibleCount by PAGE_SIZE", () => {
    expect(pageSrc).toContain("setVisibleCount((prev) => prev + PAGE_SIZE)");
  });

  it("Show More shows remaining count", () => {
    expect(pageSrc).toContain("allEntries.length - visibleCount");
  });

  it("Show More has accessibility label", () => {
    expect(pageSrc).toContain("Show more entries");
  });

  it("Show More has chevron-down icon", () => {
    expect(pageSrc).toContain('chevron-down');
  });

  // ─── Styles ────────────────────────────────────────────────

  it("has showMoreButton style", () => {
    expect(pageSrc).toContain("showMoreButton");
  });

  it("has showMoreText style", () => {
    expect(pageSrc).toContain("showMoreText");
  });

  // ─── Hero count uses total (not paginated) ────────────────

  it("hero count uses board.entryCount (total, not paginated)", () => {
    expect(pageSrc).toContain("board.entryCount");
  });

  // ─── Sprint docs ──────────────────────────────────────────

  it("sprint doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/sprints/SPRINT-307-DISH-PAGINATION.md"))).toBe(true);
  });

  it("retro doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/retros/RETRO-307-DISH-PAGINATION.md"))).toBe(true);
  });
});
