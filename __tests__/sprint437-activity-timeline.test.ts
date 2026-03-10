/**
 * Sprint 437 — Profile Activity Timeline
 *
 * Validates:
 * 1. ActivityTimeline component structure
 * 2. Event type support (rating, bookmark, achievement)
 * 3. Date grouping (Today, Yesterday, This Week, Earlier)
 * 4. Event builders and sorting
 * 5. Profile integration
 * 6. File health
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const timelineSrc = readFile("components/profile/ActivityTimeline.tsx");

// ---------------------------------------------------------------------------
// 1. Component exports and structure
// ---------------------------------------------------------------------------
describe("ActivityTimeline — exports", () => {
  it("exports ActivityTimeline component", () => {
    expect(timelineSrc).toContain("export function ActivityTimeline");
  });

  it("exports TimelineEvent type", () => {
    expect(timelineSrc).toContain("export interface TimelineEvent");
  });

  it("exports TimelineEventType", () => {
    expect(timelineSrc).toContain("export type TimelineEventType");
  });

  it("exports ActivityTimelineProps", () => {
    expect(timelineSrc).toContain("export interface ActivityTimelineProps");
  });
});

// ---------------------------------------------------------------------------
// 2. Event types
// ---------------------------------------------------------------------------
describe("ActivityTimeline — event types", () => {
  it("supports rating events", () => {
    expect(timelineSrc).toContain('"rating"');
  });

  it("supports bookmark events", () => {
    expect(timelineSrc).toContain('"bookmark"');
  });

  it("supports achievement events", () => {
    expect(timelineSrc).toContain('"achievement"');
  });

  it("has rating icon logic based on score", () => {
    expect(timelineSrc).toContain("score >= 8");
    expect(timelineSrc).toContain("score >= 6");
    expect(timelineSrc).toContain("score >= 4");
  });

  it("uses bookmark icon for saved places", () => {
    expect(timelineSrc).toContain('icon: "bookmark"');
  });

  it("uses trophy icon for achievements", () => {
    expect(timelineSrc).toContain('icon: "trophy"');
  });
});

// ---------------------------------------------------------------------------
// 3. Date grouping
// ---------------------------------------------------------------------------
describe("ActivityTimeline — date groups", () => {
  it("defines DateGroup type", () => {
    expect(timelineSrc).toContain("DateGroup");
  });

  it("has Today group", () => {
    expect(timelineSrc).toContain('"Today"');
  });

  it("has Yesterday group", () => {
    expect(timelineSrc).toContain('"Yesterday"');
  });

  it("has This Week group", () => {
    expect(timelineSrc).toContain('"This Week"');
  });

  it("has Earlier group", () => {
    expect(timelineSrc).toContain('"Earlier"');
  });

  it("renders group labels", () => {
    expect(timelineSrc).toContain("groupLabel");
    expect(timelineSrc).toContain("group.label");
  });
});

// ---------------------------------------------------------------------------
// 4. Event building and sorting
// ---------------------------------------------------------------------------
describe("ActivityTimeline — event building", () => {
  it("has buildEvents function", () => {
    expect(timelineSrc).toContain("function buildEvents");
  });

  it("sorts events by timestamp descending", () => {
    expect(timelineSrc).toContain("b.timestamp - a.timestamp");
  });

  it("creates rating events from ratings prop", () => {
    expect(timelineSrc).toContain('id: `r-${r.id}`');
  });

  it("creates bookmark events from bookmarks prop", () => {
    expect(timelineSrc).toContain('id: `b-${b.id}`');
  });

  it("creates achievement events with earned filter", () => {
    expect(timelineSrc).toContain('id: `a-${a.id}`');
    expect(timelineSrc).toContain("if (!a.earnedAt) continue");
  });

  it("uses useMemo for event building", () => {
    expect(timelineSrc).toContain("useMemo");
  });
});

// ---------------------------------------------------------------------------
// 5. Timeline UI
// ---------------------------------------------------------------------------
describe("ActivityTimeline — UI elements", () => {
  it("has timeline dot and line", () => {
    expect(timelineSrc).toContain("dot");
    expect(timelineSrc).toContain("line");
    expect(timelineSrc).toContain("timelineCol");
  });

  it("has type badge (Rated/Saved/Earned)", () => {
    expect(timelineSrc).toContain("typeBadge");
    expect(timelineSrc).toContain("Rated");
    expect(timelineSrc).toContain("Saved");
    expect(timelineSrc).toContain("Earned");
  });

  it("has event count summary in header", () => {
    expect(timelineSrc).toContain("eventCounts");
    expect(timelineSrc).toContain("typeSummary");
  });

  it("has show more/less toggle", () => {
    expect(timelineSrc).toContain("showAll");
    expect(timelineSrc).toContain("Show Less");
    expect(timelineSrc).toContain("Show All");
  });

  it("shows score for rating events", () => {
    expect(timelineSrc).toContain("eventScore");
    expect(timelineSrc).toContain("score.toFixed(1)");
  });

  it("renders subtitle for events", () => {
    expect(timelineSrc).toContain("eventSubtitle");
    expect(timelineSrc).toContain("event.subtitle");
  });

  it("navigates to business on tap", () => {
    expect(timelineSrc).toContain("router.push");
    expect(timelineSrc).toContain("/business/[id]");
  });

  it("defaults to showing 8 events", () => {
    expect(timelineSrc).toContain("INITIAL_SHOW = 8");
  });
});

// ---------------------------------------------------------------------------
// 6. Props interface
// ---------------------------------------------------------------------------
describe("ActivityTimeline — props", () => {
  it("accepts ratings array", () => {
    expect(timelineSrc).toContain("ratings:");
  });

  it("accepts bookmarks array", () => {
    expect(timelineSrc).toContain("bookmarks:");
  });

  it("accepts achievements array", () => {
    expect(timelineSrc).toContain("achievements:");
  });

  it("achievement has optional earnedAt", () => {
    expect(timelineSrc).toContain("earnedAt?: number");
  });
});

// ---------------------------------------------------------------------------
// 7. File health
// ---------------------------------------------------------------------------
describe("file health", () => {
  it("ActivityTimeline under 400 LOC", () => {
    expect(timelineSrc.split("\n").length).toBeLessThan(400);
  });

  it("ActivityFeed still exists (backward compat)", () => {
    const feedSrc = readFile("components/profile/ActivityFeed.tsx");
    expect(feedSrc).toContain("export function ActivityFeed");
  });
});
