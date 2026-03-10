/**
 * Sprint 404: Discover Trending Section Refresh
 *
 * Verifies extracted TrendingSection component with photo thumbnails,
 * score display, time context, and mover count.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ── 1. TrendingSection component ────────────────────────────────────

describe("Sprint 404 — TrendingSection component", () => {
  const src = readFile("components/search/TrendingSection.tsx");

  it("exports TrendingSection", () => {
    expect(src).toContain("export function TrendingSection");
  });

  it("has TrendingSectionProps interface", () => {
    expect(src).toContain("TrendingSectionProps");
    expect(src).toContain("trending: MappedBusiness[]");
  });

  it("shows 'Trending This Week' title", () => {
    expect(src).toContain("Trending This Week");
  });

  it("shows mover count in header", () => {
    expect(src).toContain("trending.length");
    expect(src).toContain("movers");
  });
});

// ── 2. Photo thumbnails ─────────────────────────────────────────────

describe("Sprint 404 — Photo thumbnails", () => {
  const src = readFile("components/search/TrendingSection.tsx");

  it("shows photo thumbnail for each business", () => {
    expect(src).toContain("thumbWrap");
    expect(src).toContain("SafeImage");
  });

  it("has emoji placeholder when no photo", () => {
    expect(src).toContain("thumbPlaceholder");
    expect(src).toContain("thumbEmoji");
  });
});

// ── 3. Score display ────────────────────────────────────────────────

describe("Sprint 404 — Score and rank display", () => {
  const src = readFile("components/search/TrendingSection.tsx");

  it("shows weighted score", () => {
    expect(src).toContain("weightedScore.toFixed(1)");
  });

  it("shows rank", () => {
    expect(src).toContain("getRankDisplay");
  });

  it("shows category label", () => {
    expect(src).toContain("getCategoryDisplay");
    expect(src).toContain("displayCat.label");
  });
});

// ── 4. Rank delta with time context ─────────────────────────────────

describe("Sprint 404 — Rank delta with time context", () => {
  const src = readFile("components/search/TrendingSection.tsx");

  it("shows rank delta badge", () => {
    expect(src).toContain("deltaBadge");
    expect(src).toContain("biz.rankDelta");
  });

  it("shows 'this week' time context", () => {
    expect(src).toContain("this week");
    expect(src).toContain("deltaLabel");
  });
});

// ── 5. search.tsx extraction ────────────────────────────────────────

describe("Sprint 404 — search.tsx extraction", () => {
  // Sprint 571: redirected to DiscoverSections
  const src = readFile("components/search/DiscoverSections.tsx");

  it("imports TrendingSection", () => {
    // Sprint 571: redirected to DiscoverSections
    expect(src).toContain("TrendingSection");
  });

  it("uses TrendingSection component instead of inline", () => {
    // Sprint 571: redirected to DiscoverSections
    expect(src).toContain("<TrendingSection");
    expect(src).toContain("trending={trending}");
  });

  it("removed inline trending styles", () => {
    expect(src).not.toContain("trendingSection:");
    expect(src).not.toContain("trendingRow:");
  });
});
