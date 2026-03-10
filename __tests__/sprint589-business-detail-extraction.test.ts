/**
 * Sprint 589: Business Detail Page Section Extraction
 *
 * Tests:
 * 1. BusinessHeroSection module structure
 * 2. BusinessAnalyticsSection module structure
 * 3. [id].tsx imports extracted components
 * 4. [id].tsx no longer contains inlined hero/analytics code
 * 5. LOC thresholds
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 589: BusinessHeroSection", () => {
  const src = readFile("components/business/BusinessHeroSection.tsx");

  it("exports BusinessHeroSection function", () => {
    expect(src).toContain("export function BusinessHeroSection");
  });

  it("renders HeroCarousel", () => {
    expect(src).toContain("<HeroCarousel");
  });

  it("renders BusinessNameCard", () => {
    expect(src).toContain("<BusinessNameCard");
  });

  it("renders QuickStatsBar", () => {
    expect(src).toContain("<QuickStatsBar");
  });

  it("renders RankConfidenceIndicator", () => {
    expect(src).toContain("<RankConfidenceIndicator");
  });

  it("renders breadcrumb navigation", () => {
    expect(src).toContain("Rankings");
    expect(src).toContain("breadcrumbLink");
  });

  it("renders impact banner conditionally", () => {
    expect(src).toContain("ratingImpact");
    expect(src).toContain("impactBanner");
  });

  it("renders badge section", () => {
    expect(src).toContain("evaluateBusinessBadges");
    expect(src).toContain("BadgeRowCompact");
  });

  it("module LOC under 160", () => {
    const lines = src.split("\n").length;
    expect(lines).toBeLessThan(160);
  });
});

describe("Sprint 589: BusinessAnalyticsSection", () => {
  const src = readFile("components/business/BusinessAnalyticsSection.tsx");

  it("exports BusinessAnalyticsSection function", () => {
    expect(src).toContain("export function BusinessAnalyticsSection");
  });

  it("renders ScoreCard", () => {
    expect(src).toContain("<ScoreCard");
  });

  it("renders TrustExplainerCard", () => {
    expect(src).toContain("<TrustExplainerCard");
  });

  it("renders SubScoresCard", () => {
    expect(src).toContain("<SubScoresCard");
  });

  it("renders CityComparisonCard conditionally", () => {
    expect(src).toContain("<CityComparisonCard");
  });

  it("renders ScoreBreakdown", () => {
    expect(src).toContain("<ScoreBreakdown");
  });

  it("renders RatingDistribution", () => {
    expect(src).toContain("<RatingDistribution");
  });

  it("renders RankHistoryChart", () => {
    expect(src).toContain("<RankHistoryChart");
  });

  it("computes avgQ1/Q2/Q3 internally", () => {
    expect(src).toContain("avgQ1");
    expect(src).toContain("avgQ2");
    expect(src).toContain("avgQ3");
  });

  it("module LOC under 125", () => {
    const lines = src.split("\n").length;
    expect(lines).toBeLessThan(125);
  });
});

describe("Sprint 589: [id].tsx After Extraction", () => {
  const src = readFile("app/business/[id].tsx");

  it("imports BusinessHeroSection", () => {
    expect(src).toContain('import { BusinessHeroSection }');
  });

  it("imports BusinessAnalyticsSection", () => {
    expect(src).toContain('import { BusinessAnalyticsSection }');
  });

  it("no longer contains inline evaluateBusinessBadges", () => {
    expect(src).not.toContain("evaluateBusinessBadges");
  });

  it("no longer computes avgQ1 inline", () => {
    expect(src).not.toContain("avgQ1");
  });

  it("no longer contains ScoreCard import", () => {
    expect(src).not.toContain("ScoreCard");
  });

  it("LOC under 420 after extraction", () => {
    const lines = src.split("\n").length;
    expect(lines).toBeLessThan(420);
  });
});

describe("Sprint 589: Threshold Checks", () => {
  const thresholds = JSON.parse(readFile("shared/thresholds.json"));

  it("test count meets minimum", () => {
    expect(thresholds.tests.currentCount).toBeGreaterThanOrEqual(thresholds.tests.minCount);
  });

  it("build size under max", () => {
    expect(thresholds.build.currentSizeKb).toBeLessThanOrEqual(thresholds.build.maxSizeKb);
  });
});
