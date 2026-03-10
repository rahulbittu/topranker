/**
 * Sprint 341: Photo strip fallback improvements
 * - SafeImage: cuisine-specific emoji priority, showHint prop
 * - PhotoStrip: cuisine prop wired, cuisine-specific fallback
 * - DiscoverPhotoStrip: cuisine prop wired, cuisine-specific fallback
 */
import { describe, it, expect, beforeAll } from "vitest";
import * as fs from "fs";
import * as path from "path";

// ── Source files ──────────────────────────────────────────────────
let safeImageSrc = "";
let leaderboardSubSrc = "";
let searchSubSrc = "";

beforeAll(() => {
  safeImageSrc = fs.readFileSync(path.resolve("components/SafeImage.tsx"), "utf-8");
  leaderboardSubSrc = fs.readFileSync(path.resolve("components/leaderboard/SubComponents.tsx"), "utf-8");
  searchSubSrc = fs.readFileSync(path.resolve("components/search/SubComponents.tsx"), "utf-8");
});

// ── SafeImage cuisine prop ───────────────────────────────────────
describe("SafeImage cuisine-specific fallback", () => {
  it("should accept cuisine prop", () => {
    expect(safeImageSrc).toContain("cuisine?: string");
  });

  it("should accept showHint prop", () => {
    expect(safeImageSrc).toContain("showHint?: boolean");
  });

  it("should prefer cuisine emoji over category emoji", () => {
    expect(safeImageSrc).toContain("cuisineEmoji || categoryEmoji");
  });

  it("should derive cuisineEmoji from getCategoryDisplay", () => {
    expect(safeImageSrc).toContain("getCategoryDisplay(cuisine)");
  });

  it("should derive categoryEmoji from getCategoryDisplay", () => {
    expect(safeImageSrc).toContain("getCategoryDisplay(category)");
  });

  it("should render hint text when showHint is true", () => {
    expect(safeImageSrc).toContain("showHint &&");
    expect(safeImageSrc).toContain("No photo yet");
  });

  it("should style hint text with small font and low opacity", () => {
    expect(safeImageSrc).toContain("fontSize: 10");
    expect(safeImageSrc).toContain('color: "rgba(255,255,255,0.4)"');
  });

  it("should include hint font family", () => {
    expect(safeImageSrc).toContain('fontFamily: "DMSans_400Regular"');
  });

  it("should include letter spacing on hint", () => {
    expect(safeImageSrc).toContain("letterSpacing: 0.5");
  });

  it("should keep contentFit prop with cover default", () => {
    expect(safeImageSrc).toContain('contentFit = "cover"');
  });
});

// ── Leaderboard PhotoStrip cuisine wiring ────────────────────────
describe("Leaderboard PhotoStrip cuisine prop", () => {
  it("should accept cuisine in PhotoStrip signature", () => {
    expect(leaderboardSubSrc).toMatch(/function PhotoStrip\(\{[\s\S]*?cuisine/);
  });

  it("should type cuisine as optional string", () => {
    expect(leaderboardSubSrc).toContain("cuisine?: string");
  });

  it("should pass cuisine prop from RankedCard to PhotoStrip", () => {
    expect(leaderboardSubSrc).toMatch(/cuisine=\{item\.cuisine/);
  });

  it("should use cuisine-specific emoji in fallback", () => {
    // PhotoStrip empty-photos branch should prefer cuisine emoji
    expect(leaderboardSubSrc).toContain("getCategoryDisplay(cuisine");
  });

  it("should have photoStripHint style", () => {
    expect(leaderboardSubSrc).toContain("photoStripHint");
  });
});

// ── Discover DiscoverPhotoStrip cuisine wiring ───────────────────
describe("Discover DiscoverPhotoStrip cuisine prop", () => {
  it("should accept cuisine in DiscoverPhotoStrip signature", () => {
    expect(searchSubSrc).toMatch(/function DiscoverPhotoStrip\(\{[\s\S]*?cuisine/);
  });

  it("should type cuisine as optional string", () => {
    expect(searchSubSrc).toContain("cuisine?: string");
  });

  it("should pass cuisine prop from DiscoverCard to DiscoverPhotoStrip", () => {
    expect(searchSubSrc).toMatch(/cuisine=\{item\.cuisine/);
  });

  it("should prefer cuisine emoji over category emoji in fallback", () => {
    // cuisine emoji checked first, falls back to category
    expect(searchSubSrc).toContain("getCategoryDisplay(cuisine)");
  });
});

// ── Cross-component consistency ──────────────────────────────────
describe("Cross-component consistency", () => {
  it("both PhotoStrip components should accept cuisine prop", () => {
    expect(leaderboardSubSrc).toContain("cuisine?: string");
    expect(searchSubSrc).toContain("cuisine?: string");
  });

  it("both should use getCategoryDisplay for emoji lookup", () => {
    expect(leaderboardSubSrc).toContain("getCategoryDisplay(cuisine");
    expect(searchSubSrc).toContain("getCategoryDisplay(cuisine");
  });

  it("SafeImage and PhotoStrip should share the same emoji priority pattern", () => {
    // Both should check cuisine first, then category
    expect(safeImageSrc).toContain("cuisineEmoji || categoryEmoji");
    // PhotoStrip uses fallbackEmoji = cuisineEmoji || categoryEmoji
    expect(leaderboardSubSrc).toContain("fallbackEmoji = cuisineEmoji || categoryEmoji");
  });
});
