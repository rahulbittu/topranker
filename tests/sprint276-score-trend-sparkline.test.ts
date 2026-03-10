/**
 * Sprint 276 — Score Trend Sparkline Tests
 *
 * Validates:
 * 1. ScoreTrendSparkline component exists with correct structure
 * 2. Score trend API endpoint exists
 * 3. Business page integrates sparkline
 * 4. Sparkline uses rank_history data
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 276: Score Trend Sparkline — Component", () => {
  const sparklineSrc = readFile("components/business/ScoreTrendSparkline.tsx");

  it("component exists and is exported", () => {
    expect(sparklineSrc).toContain("export function ScoreTrendSparkline");
  });

  it("fetches from score-trend API", () => {
    expect(sparklineSrc).toContain("/api/businesses/");
    expect(sparklineSrc).toContain("score-trend");
  });

  it("renders SVG sparkline path", () => {
    expect(sparklineSrc).toContain("pathData");
    expect(sparklineSrc).toContain("<svg");
    expect(sparklineSrc).toContain("<path");
  });

  it("shows trend direction indicator", () => {
    expect(sparklineSrc).toContain("trending-up");
    expect(sparklineSrc).toContain("trending-down");
    expect(sparklineSrc).toContain("Stable");
  });

  it("shows current score", () => {
    expect(sparklineSrc).toContain("currentScore");
    expect(sparklineSrc).toContain("latest.toFixed(1)");
  });

  it("computes trend from last two points", () => {
    expect(sparklineSrc).toContain("scores[scores.length - 1]");
    expect(sparklineSrc).toContain("scores[scores.length - 2]");
  });

  it("returns null for insufficient data", () => {
    expect(sparklineSrc).toContain("points.length < 2");
    expect(sparklineSrc).toContain("return null");
  });

  it("uses BRAND amber for sparkline stroke", () => {
    expect(sparklineSrc).toContain("BRAND.colors.amber");
  });

  it("has SCORE TREND label", () => {
    expect(sparklineSrc).toContain("SCORE TREND");
  });
});

describe("Sprint 276: Score Trend API", () => {
  const breakdownSrc = readFile("server/routes-score-breakdown.ts");

  it("score-trend endpoint exists", () => {
    expect(breakdownSrc).toContain("/api/businesses/:id/score-trend");
  });

  it("queries rankHistory table", () => {
    expect(breakdownSrc).toContain("rankHistory");
  });

  it("orders by snapshot date ascending", () => {
    expect(breakdownSrc).toContain("asc(rankHistory.snapshotDate)");
  });

  it("limits to 90 snapshots", () => {
    expect(breakdownSrc).toContain(".limit(90)");
  });

  it("returns date and score fields", () => {
    expect(breakdownSrc).toContain("date: rankHistory.snapshotDate");
    expect(breakdownSrc).toContain("score: rankHistory.weightedScore");
  });
});

describe("Sprint 276: Business Page Integration", () => {
  const bizPageSrc = readFile("app/business/[id].tsx");

  it("business page imports ScoreTrendSparkline", () => {
    expect(bizPageSrc).toContain("ScoreTrendSparkline");
    expect(bizPageSrc).toContain("@/components/business/ScoreTrendSparkline");
  });

  it("sparkline rendered on business page", () => {
    expect(bizPageSrc).toContain("<ScoreTrendSparkline businessId={business.id}");
  });
});
