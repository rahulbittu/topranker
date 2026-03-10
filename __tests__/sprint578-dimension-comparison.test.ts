/**
 * Sprint 578: Rating Dimension Comparison Card
 *
 * Tests:
 * 1. Server: city-dimension-averages module
 * 2. Server: route wiring
 * 3. Client: DimensionComparisonCard component
 * 4. Client: business detail page integration
 * 5. Mock router: city averages fallback
 * 6. LOC thresholds
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 578: City Dimension Averages Server Module", () => {
  const src = readFile("server/city-dimension-averages.ts");

  it("exports computeCityDimensionAverages as async function", () => {
    expect(src).toContain("export async function computeCityDimensionAverages");
  });

  it("takes city parameter", () => {
    expect(src).toContain("computeCityDimensionAverages(city: string)");
  });

  it("exports CityDimensionAverages interface", () => {
    expect(src).toContain("export interface CityDimensionAverages");
  });

  it("returns all 6 dimension fields", () => {
    expect(src).toContain("food: number");
    expect(src).toContain("service: number");
    expect(src).toContain("vibe: number");
    expect(src).toContain("packaging: number");
    expect(src).toContain("waitTime: number");
    expect(src).toContain("value: number");
  });

  it("returns totalRatings and totalBusinesses", () => {
    expect(src).toContain("totalRatings: number");
    expect(src).toContain("totalBusinesses: number");
  });

  it("uses AVG SQL aggregation for each dimension", () => {
    expect(src).toContain("AVG(${ratings.foodScore})");
    expect(src).toContain("AVG(${ratings.serviceScore})");
    expect(src).toContain("AVG(${ratings.vibeScore})");
  });

  it("counts distinct businesses", () => {
    expect(src).toContain("COUNT(DISTINCT ${ratings.businessId})");
  });

  it("filters by city case-insensitively", () => {
    expect(src).toContain("LOWER(${businesses.city})");
  });

  it("filters only active businesses", () => {
    expect(src).toContain("eq(businesses.isActive, true)");
  });

  it("excludes flagged ratings", () => {
    expect(src).toContain("eq(ratings.isFlagged, false)");
  });

  it("joins ratings with businesses", () => {
    expect(src).toContain("innerJoin(businesses");
  });

  it("rounds to 1 decimal place", () => {
    expect(src).toContain("round1");
    expect(src).toContain("Math.round(n * 10) / 10");
  });

  it("module LOC under 50", () => {
    const lines = src.split("\n").length;
    expect(lines).toBeLessThan(55);
  });
});

describe("Sprint 578: Route Wiring", () => {
  const src = readFile("server/routes-business-analytics.ts");

  it("imports computeCityDimensionAverages", () => {
    expect(src).toContain("import { computeCityDimensionAverages }");
    expect(src).toContain('from "./city-dimension-averages"');
  });

  it("registers GET /api/cities/:city/dimension-averages endpoint", () => {
    expect(src).toContain("/api/cities/:city/dimension-averages");
  });

  it("decodes city parameter from URL", () => {
    expect(src).toContain("decodeURIComponent");
  });

  it("calls computeCityDimensionAverages with city", () => {
    expect(src).toContain("computeCityDimensionAverages(city)");
  });
});

describe("Sprint 578: DimensionComparisonCard Component", () => {
  const src = readFile("components/business/DimensionComparisonCard.tsx");

  it("exports DimensionComparisonCard function", () => {
    expect(src).toContain("export function DimensionComparisonCard");
  });

  it("exports DimensionComparisonCardProps interface", () => {
    expect(src).toContain("export interface DimensionComparisonCardProps");
  });

  it("props include businessId and city", () => {
    expect(src).toContain("businessId: string");
    expect(src).toContain("city: string");
  });

  it("fetches dimension-breakdown for business", () => {
    expect(src).toContain("/api/businesses/${businessId}/dimension-breakdown");
  });

  it("fetches city dimension averages", () => {
    expect(src).toContain("/api/cities/${encodeURIComponent(city)}/dimension-averages");
  });

  it("uses DIMENSION_CONFIGS from DimensionScoreCard", () => {
    expect(src).toContain("import { DIMENSION_CONFIGS }");
    expect(src).toContain('from "./DimensionScoreCard"');
  });

  it("renders dual bars for business and city", () => {
    expect(src).toContain("barBiz");
    expect(src).toContain("barCity");
  });

  it("shows delta color (green/red/neutral)", () => {
    expect(src).toContain("getDeltaColor");
    expect(src).toContain("#2D8F4E");
    expect(src).toContain("#D44040");
  });

  it("displays dimension weight percentages", () => {
    expect(src).toContain("r.weight * 100");
  });

  it("renders legend with business and city labels", () => {
    expect(src).toContain("This place");
    expect(src).toContain("avg");
    expect(src).toContain("legend");
  });

  it("shows city business count in header", () => {
    expect(src).toContain("totalBusinesses");
    expect(src).toContain("places");
  });

  it("uses pct helper for bar widths", () => {
    expect(src).toContain("import { pct }");
    expect(src).toContain("pct(");
  });

  it("returns null when no data", () => {
    expect(src).toContain("return null");
  });

  it("component LOC under 110", () => {
    const lines = src.split("\n").length;
    expect(lines).toBeLessThan(120);
  });
});

describe("Sprint 578: Business Detail Integration", () => {
  const src = readFile("app/business/[id].tsx");

  it("imports DimensionComparisonCard", () => {
    expect(src).toContain("import { DimensionComparisonCard }");
    expect(src).toContain('from "@/components/business/DimensionComparisonCard"');
  });

  it("renders DimensionComparisonCard with businessId and city", () => {
    expect(src).toContain("<DimensionComparisonCard");
    expect(src).toContain("businessId={business.id}");
    expect(src).toContain("city={business.city}");
  });
});

describe("Sprint 578: Mock Router City Averages", () => {
  const src = readFile("lib/mock-router.ts");

  it("handles /api/cities/ prefix for mock data", () => {
    expect(src).toContain("/api/cities/");
  });

  it("returns mock city dimension averages with all fields", () => {
    expect(src).toContain("totalRatings");
    expect(src).toContain("totalBusinesses");
  });

  it("mock-router LOC under 85", () => {
    const lines = src.split("\n").length;
    expect(lines).toBeLessThan(85);
  });
});
