/**
 * Sprint 423 — Rankings Weekly Summary Card
 *
 * Validates:
 * 1. WeeklySummaryCard component structure
 * 2. computeWeeklySummary function logic
 * 3. Integration in RankingsListHeader
 * 4. File health
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const countLines = (content: string) => content.split("\n").length;

// ---------------------------------------------------------------------------
// 1. WeeklySummaryCard component
// ---------------------------------------------------------------------------
describe("WeeklySummaryCard — component structure", () => {
  const src = readFile("components/leaderboard/WeeklySummaryCard.tsx");

  it("exports WeeklySummaryCard function", () => {
    expect(src).toContain("export function WeeklySummaryCard");
  });

  it("exports computeWeeklySummary function", () => {
    expect(src).toContain("export function computeWeeklySummary");
  });

  it("exports WeeklySummary interface", () => {
    expect(src).toContain("export interface WeeklySummary");
  });

  it("accepts businesses and city props", () => {
    expect(src).toContain("businesses: MappedBusiness[]");
    expect(src).toContain("city: string");
  });

  it("has accessibility role for summary", () => {
    expect(src).toContain('accessibilityRole="summary"');
    expect(src).toContain("Weekly rankings summary");
  });
});

// ---------------------------------------------------------------------------
// 2. computeWeeklySummary logic
// ---------------------------------------------------------------------------
describe("WeeklySummaryCard — computeWeeklySummary", () => {
  const src = readFile("components/leaderboard/WeeklySummaryCard.tsx");

  it("tracks moversUp count", () => {
    expect(src).toContain("moversUp");
  });

  it("tracks moversDown count", () => {
    expect(src).toContain("moversDown");
  });

  it("tracks newEntries count", () => {
    expect(src).toContain("newEntries");
  });

  it("finds topClimber with name and delta", () => {
    expect(src).toContain("topClimber");
    expect(src).toContain("topClimber = { name: b.name, delta: d }");
  });

  it("finds biggestDrop with name and delta", () => {
    expect(src).toContain("biggestDrop");
    expect(src).toContain("biggestDrop = { name: b.name, delta: d }");
  });
});

// ---------------------------------------------------------------------------
// 3. StatPill rendering
// ---------------------------------------------------------------------------
describe("WeeklySummaryCard — stat pills", () => {
  const src = readFile("components/leaderboard/WeeklySummaryCard.tsx");

  it("has StatPill helper component", () => {
    expect(src).toContain("function StatPill");
  });

  it("renders climbed pill with green color", () => {
    expect(src).toContain('"climbed"');
    expect(src).toContain("Colors.green");
  });

  it("renders dropped pill with red color", () => {
    expect(src).toContain('"dropped"');
    expect(src).toContain("Colors.red");
  });

  it("renders new entries pill", () => {
    expect(src).toContain('"new"');
    expect(src).toContain("star-outline");
  });
});

// ---------------------------------------------------------------------------
// 4. Top climber highlight
// ---------------------------------------------------------------------------
describe("WeeklySummaryCard — top climber", () => {
  const src = readFile("components/leaderboard/WeeklySummaryCard.tsx");

  it("shows flame icon for top climber", () => {
    expect(src).toContain('"flame"');
  });

  it("displays climber name and spot count", () => {
    expect(src).toContain("summary.topClimber.name");
    expect(src).toContain("summary.topClimber.delta");
  });

  it("uses singular/plural for spots", () => {
    expect(src).toContain('"spot"');
    expect(src).toContain('"spots"');
  });
});

// ---------------------------------------------------------------------------
// 5. Integration in RankingsListHeader
// ---------------------------------------------------------------------------
describe("RankingsListHeader — WeeklySummaryCard integration", () => {
  const src = readFile("components/leaderboard/RankingsListHeader.tsx");

  it("imports WeeklySummaryCard", () => {
    expect(src).toContain("WeeklySummaryCard");
  });

  it("has businesses prop in interface", () => {
    expect(src).toContain("businesses: MappedBusiness[]");
  });

  it("renders WeeklySummaryCard with businesses and city", () => {
    expect(src).toContain("<WeeklySummaryCard businesses={businesses} city={city} />");
  });
});

// ---------------------------------------------------------------------------
// 6. index.tsx passes businesses prop
// ---------------------------------------------------------------------------
describe("index.tsx — weekly summary wiring", () => {
  const src = readFile("app/(tabs)/index.tsx");

  it("passes businesses prop to RankingsListHeader", () => {
    expect(src).toContain("businesses={filteredBiz}");
  });
});

// ---------------------------------------------------------------------------
// 7. File health
// ---------------------------------------------------------------------------
describe("file health", () => {
  it("WeeklySummaryCard is under 150 LOC", () => {
    const src = readFile("components/leaderboard/WeeklySummaryCard.tsx");
    expect(countLines(src)).toBeLessThan(150);
  });

  it("RankingsListHeader is under 300 LOC", () => {
    const src = readFile("components/leaderboard/RankingsListHeader.tsx");
    expect(countLines(src)).toBeLessThan(300);
  });

  it("index.tsx is under 600 LOC threshold", () => {
    const src = readFile("app/(tabs)/index.tsx");
    expect(countLines(src)).toBeLessThan(600);
  });
});
