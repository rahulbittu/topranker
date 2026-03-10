/**
 * Sprint 419 — Profile Activity Feed
 *
 * Validates:
 * 1. ActivityFeed component structure
 * 2. ActivityRow timeline entries
 * 3. Score-based icon logic
 * 4. Show more/less toggle
 * 5. profile.tsx integration
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const countLines = (content: string) => content.split("\n").length;

// ---------------------------------------------------------------------------
// 1. ActivityFeed component
// ---------------------------------------------------------------------------
describe("ActivityFeed component", () => {
  const src = readFile("components/profile/ActivityFeed.tsx");

  it("exports ActivityFeed function", () => {
    expect(src).toContain("export function ActivityFeed");
  });

  it("accepts ratings and tier props", () => {
    expect(src).toContain("ratings: RatingWithBusiness[]");
    expect(src).toContain("tier: string");
  });

  it("shows Recent Activity title", () => {
    expect(src).toContain("Recent Activity");
  });

  it("shows rating count badge", () => {
    expect(src).toContain("countBadge");
    expect(src).toContain("ratings.length");
  });

  it("returns null for empty ratings", () => {
    expect(src).toContain("ratings.length === 0");
    expect(src).toContain("return null");
  });

  it("is compact under 200 LOC", () => {
    expect(countLines(src)).toBeLessThan(200);
  });
});

// ---------------------------------------------------------------------------
// 2. ActivityRow timeline entries
// ---------------------------------------------------------------------------
describe("ActivityFeed — ActivityRow", () => {
  const src = readFile("components/profile/ActivityFeed.tsx");

  it("defines ActivityRow function", () => {
    expect(src).toContain("function ActivityRow");
  });

  it("renders timeline dot and line", () => {
    expect(src).toContain("timelineDot");
    expect(src).toContain("timelineLine");
  });

  it("shows business name", () => {
    expect(src).toContain("rating.businessName");
    expect(src).toContain("activityBusiness");
  });

  it("shows score value", () => {
    expect(src).toContain("score.toFixed(1)");
    expect(src).toContain("activityScore");
  });

  it("shows time ago", () => {
    expect(src).toContain("formatTimeAgo");
    expect(src).toContain("activityTime");
  });

  it("shows note when available", () => {
    expect(src).toContain("rating.note");
    expect(src).toContain("activityNote");
  });

  it("navigates to business on press", () => {
    expect(src).toContain("router.push");
    expect(src).toContain("businessSlug");
  });

  it("has accessibility label with score and time", () => {
    expect(src).toContain("accessibilityLabel");
    expect(src).toContain("out of 10");
  });
});

// ---------------------------------------------------------------------------
// 3. Score-based icon logic
// ---------------------------------------------------------------------------
describe("ActivityFeed — getActivityIcon", () => {
  const src = readFile("components/profile/ActivityFeed.tsx");

  it("defines getActivityIcon function", () => {
    expect(src).toContain("function getActivityIcon");
  });

  it("returns star for high scores (>= 8)", () => {
    expect(src).toContain('"star"');
    expect(src).toContain(">= 8");
  });

  it("returns thumbs-up for good scores (>= 6)", () => {
    expect(src).toContain('"thumbs-up"');
    expect(src).toContain(">= 6");
  });

  it("returns thumbs-down for low scores", () => {
    expect(src).toContain('"thumbs-down"');
  });
});

// ---------------------------------------------------------------------------
// 4. Show more/less toggle
// ---------------------------------------------------------------------------
describe("ActivityFeed — show more toggle", () => {
  const src = readFile("components/profile/ActivityFeed.tsx");

  it("initially shows limited entries", () => {
    expect(src).toContain("INITIAL_SHOW");
    expect(src).toContain("showAll");
  });

  it("has Show All button with count", () => {
    expect(src).toContain("Show All");
    expect(src).toContain("Show Less");
  });

  it("toggles showAll state", () => {
    expect(src).toContain("setShowAll");
  });
});

// ---------------------------------------------------------------------------
// 5. profile.tsx integration
// ---------------------------------------------------------------------------
describe("profile.tsx — ActivityFeed integration", () => {
  const src = readFile("app/(tabs)/profile.tsx");

  it("imports ActivityFeed", () => {
    expect(src).toContain("ActivityFeed");
    expect(src).toContain("components/profile/ActivityFeed");
  });

  it("renders ActivityFeed with rating history", () => {
    expect(src).toContain("<ActivityFeed");
    expect(src).toContain("ratings={profile.ratingHistory}");
  });

  it("passes tier prop", () => {
    expect(src).toContain("tier={tier}");
  });

  it("is under 800 LOC threshold", () => {
    expect(countLines(src)).toBeLessThan(800);
  });
});
