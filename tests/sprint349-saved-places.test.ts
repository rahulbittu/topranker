/**
 * Sprint 349: Profile saved places improvements
 * - Cuisine-specific emoji in saved row
 * - Relative saved date display
 * - Optional remove button
 * - BookmarkEntry cuisine field
 */
import { describe, it, expect, beforeAll } from "vitest";
import * as fs from "fs";
import * as path from "path";

let savedRowSrc = "";
let bookmarksSrc = "";

beforeAll(() => {
  savedRowSrc = fs.readFileSync(path.resolve("components/profile/SavedRow.tsx"), "utf-8");
  bookmarksSrc = fs.readFileSync(path.resolve("lib/bookmarks-context.tsx"), "utf-8");
});

// ── BookmarkEntry cuisine field ──────────────────────────────────
describe("BookmarkEntry cuisine support", () => {
  it("should have optional cuisine field", () => {
    expect(bookmarksSrc).toContain("cuisine?: string");
  });

  it("should accept cuisine in toggleBookmark meta", () => {
    expect(bookmarksSrc).toContain("cuisine?: string");
  });
});

// ── Cuisine-specific emoji ───────────────────────────────────────
describe("Saved row cuisine emoji", () => {
  it("should prefer cuisine emoji over category", () => {
    expect(savedRowSrc).toContain("entry.cuisine");
    expect(savedRowSrc).toContain("cuisineDisplay?.emoji || catDisplay.emoji");
  });

  it("should get cuisine display from getCategoryDisplay", () => {
    expect(savedRowSrc).toContain("getCategoryDisplay(entry.cuisine)");
  });

  it("should fall back to category if no cuisine", () => {
    expect(savedRowSrc).toContain("getCategoryDisplay(entry.category)");
  });
});

// ── Relative saved date ──────────────────────────────────────────
describe("Saved date display", () => {
  it("should have savedTimeAgo helper", () => {
    expect(savedRowSrc).toContain("function savedTimeAgo");
  });

  it("should show Today for same-day saves", () => {
    expect(savedRowSrc).toContain('"Today"');
  });

  it("should show Yesterday", () => {
    expect(savedRowSrc).toContain('"Yesterday"');
  });

  it("should show days ago for recent saves", () => {
    expect(savedRowSrc).toContain("d ago");
  });

  it("should show weeks ago", () => {
    expect(savedRowSrc).toContain("w ago");
  });

  it("should show months ago for older saves", () => {
    expect(savedRowSrc).toContain("mo ago");
  });

  it("should render saved date in meta row", () => {
    expect(savedRowSrc).toContain("savedDate");
    expect(savedRowSrc).toContain("savedTimeAgo(entry.savedAt)");
  });
});

// ── Remove button ────────────────────────────────────────────────
describe("Optional remove button", () => {
  it("should accept onRemove prop", () => {
    expect(savedRowSrc).toContain("onRemove?: (id: string) => void");
  });

  it("should show close icon when onRemove is provided", () => {
    expect(savedRowSrc).toContain('"close-circle-outline"');
  });

  it("should show chevron when onRemove is not provided", () => {
    expect(savedRowSrc).toContain('"chevron-forward"');
  });

  it("should call onRemove with entry id", () => {
    expect(savedRowSrc).toContain("onRemove(entry.id)");
  });

  it("should have accessible remove button", () => {
    expect(savedRowSrc).toContain("Remove");
    expect(savedRowSrc).toContain("from saved");
  });
});

// ── Meta row styling ─────────────────────────────────────────────
describe("Saved row styling", () => {
  it("should have savedMeta flex row", () => {
    expect(savedRowSrc).toContain("savedMeta:");
    expect(savedRowSrc).toContain('"row"');
  });

  it("should have savedDate style", () => {
    expect(savedRowSrc).toContain("savedDate:");
  });

  it("should still have savedRow base style", () => {
    expect(savedRowSrc).toContain("savedRow:");
  });
});
