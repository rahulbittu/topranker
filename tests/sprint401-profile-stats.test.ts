/**
 * Sprint 401: Profile Stats Dashboard
 *
 * Verifies activity heatmap, score distribution, most-rated businesses,
 * and integration into profile screen.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ── 1. Activity heatmap ─────────────────────────────────────────────

describe("Sprint 401 — Activity heatmap", () => {
  const src = readFile("components/profile/ProfileStatsCard.tsx");

  it("has ActivityHeatmap component", () => {
    expect(src).toContain("ActivityHeatmap");
    expect(src).toContain("heatmapGrid");
  });

  it("shows last 30 days", () => {
    expect(src).toContain("Last 30 Days");
    expect(src).toContain("30 * 24 * 60 * 60 * 1000");
  });

  it("shows active days count", () => {
    expect(src).toContain("active day");
  });

  it("has intensity levels (empty, low, medium, high)", () => {
    expect(src).toContain("heatmapDotEmpty");
    expect(src).toContain("heatmapDotLow");
    expect(src).toContain("heatmapDotMedium");
    expect(src).toContain("heatmapDotHigh");
  });

  it("has legend", () => {
    expect(src).toContain("heatmapLegend");
    expect(src).toContain("Less");
    expect(src).toContain("More");
  });
});

// ── 2. Score distribution ───────────────────────────────────────────

describe("Sprint 401 — Score distribution", () => {
  const src = readFile("components/profile/ProfileStatsCard.tsx");

  it("has ScoreDistribution component", () => {
    expect(src).toContain("ScoreDistribution");
    expect(src).toContain("Score Distribution");
  });

  it("computes distribution from rawScore", () => {
    expect(src).toContain("Math.round(parseFloat(r.rawScore))");
  });

  it("has bar chart with 5 columns", () => {
    expect(src).toContain("distBarCol");
    expect(src).toContain("distBarFill");
    expect(src).toContain("distBarTrack");
  });

  it("highlights top score bar", () => {
    expect(src).toContain("distBarFillTop");
  });
});

// ── 3. Most-rated businesses ────────────────────────────────────────

describe("Sprint 401 — Most-rated businesses", () => {
  const src = readFile("components/profile/ProfileStatsCard.tsx");

  it("has MostRatedBusinesses component", () => {
    expect(src).toContain("MostRatedBusinesses");
    expect(src).toContain("Most Rated");
  });

  it("shows top 3 businesses", () => {
    expect(src).toContain(".slice(0, 3)");
  });

  it("shows rating count and average", () => {
    expect(src).toContain("biz.count");
    expect(src).toContain("biz.avgScore");
  });

  it("has ranked display", () => {
    expect(src).toContain("topBizRank");
    expect(src).toContain("topBizName");
  });
});

// ── 4. Main stats card ──────────────────────────────────────────────

describe("Sprint 401 — Main ProfileStatsCard", () => {
  const src = readFile("components/profile/ProfileStatsCard.tsx");

  it("exports ProfileStatsCard component", () => {
    expect(src).toContain("export function ProfileStatsCard");
  });

  it("has ProfileStatsCardProps interface", () => {
    expect(src).toContain("ProfileStatsCardProps");
    expect(src).toContain("ratingHistory");
    expect(src).toContain("totalRatings");
    expect(src).toContain("daysActive");
  });

  it("shows average ratings per day", () => {
    expect(src).toContain("avgRatingsPerDay");
    expect(src).toContain("/day avg");
  });

  it("requires minimum 3 ratings", () => {
    expect(src).toContain("totalRatings < 3");
  });

  it("uses stats-chart icon", () => {
    expect(src).toContain("stats-chart");
  });

  it("has card title 'Rating Stats'", () => {
    expect(src).toContain("Rating Stats");
  });
});

