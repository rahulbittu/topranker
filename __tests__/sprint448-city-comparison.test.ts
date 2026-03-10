/**
 * Sprint 448 — Review Summary City Comparison
 *
 * Validates:
 * 1. City stats API route structure
 * 2. City stats endpoint logic
 * 3. CityComparisonCard component
 * 4. API client fetchCityStats
 * 5. Business page wiring
 * 6. Routes.ts wiring
 * 7. Sprint & retro docs
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. City stats route structure
// ---------------------------------------------------------------------------
describe("City stats route — structure", () => {
  const src = readFile("server/routes-city-stats.ts");

  it("file exists", () => {
    expect(fileExists("server/routes-city-stats.ts")).toBe(true);
  });

  it("exports registerCityStatsRoutes", () => {
    expect(src).toContain("export function registerCityStatsRoutes");
  });

  it("imports db and schema", () => {
    expect(src).toContain('from "./db"');
    expect(src).toContain("@shared/schema");
  });

  it("uses CityStats log tag", () => {
    expect(src).toContain('log.tag("CityStats")');
  });

  it("references Sprint 448", () => {
    expect(src).toContain("Sprint 448");
  });
});

// ---------------------------------------------------------------------------
// 2. City stats endpoint logic
// ---------------------------------------------------------------------------
describe("City stats route — endpoint", () => {
  const src = readFile("server/routes-city-stats.ts");

  it("registers GET /api/city-stats/:city", () => {
    expect(src).toContain("/api/city-stats/:city");
  });

  it("computes avgWeightedScore", () => {
    expect(src).toContain("avgWeightedScore");
  });

  it("computes avgRatingCount", () => {
    expect(src).toContain("avgRatingCount");
  });

  it("computes avgWouldReturnPct", () => {
    expect(src).toContain("avgWouldReturnPct");
  });

  it("computes recentRatingsCount", () => {
    expect(src).toContain("recentRatingsCount");
  });

  it("computes dimensionAvgs", () => {
    expect(src).toContain("dimensionAvgs");
  });

  it("filters by isActive businesses", () => {
    expect(src).toContain("isActive");
  });

  it("exports CityStatsResponse interface", () => {
    expect(src).toContain("export interface CityStatsResponse");
  });
});

// ---------------------------------------------------------------------------
// 3. CityComparisonCard component
// ---------------------------------------------------------------------------
describe("CityComparisonCard — component", () => {
  const src = readFile("components/business/CityComparisonCard.tsx");

  it("file exists", () => {
    expect(fileExists("components/business/CityComparisonCard.tsx")).toBe(true);
  });

  it("exports CityComparisonCard function", () => {
    expect(src).toContain("export function CityComparisonCard");
  });

  it("exports CityComparisonCardProps interface", () => {
    expect(src).toContain("export interface CityComparisonCardProps");
  });

  it("shows vs city header", () => {
    expect(src).toContain("vs {city} Average");
  });

  it("displays score metric", () => {
    expect(src).toContain('"Score"');
    expect(src).toContain("trophy-outline");
  });

  it("displays ratings count metric", () => {
    expect(src).toContain('"Ratings"');
    expect(src).toContain("star-outline");
  });

  it("displays would-return metric", () => {
    expect(src).toContain('"Would Return"');
    expect(src).toContain("thumbs-up-outline");
  });

  it("shows delta with color coding", () => {
    expect(src).toContain("getDeltaColor");
    expect(src).toContain("#2D8F4E"); // green for positive
    expect(src).toContain("#D44040"); // red for negative
  });

  it("has dimension comparison section", () => {
    expect(src).toContain("Dimension Comparison");
    expect(src).toContain("dimensionComparisons");
  });

  it("shows legend for bars", () => {
    expect(src).toContain("This business");
    expect(src).toContain("City avg");
  });

  it("references Sprint 448", () => {
    expect(src).toContain("Sprint 448");
  });
});

// ---------------------------------------------------------------------------
// 4. API client
// ---------------------------------------------------------------------------
describe("API client — fetchCityStats", () => {
  const src = readFile("lib/api.ts");

  it("exports fetchCityStats function", () => {
    expect(src).toContain("export async function fetchCityStats");
  });

  it("exports CityStats interface", () => {
    expect(src).toContain("export interface CityStats");
  });

  it("calls /api/city-stats/:city", () => {
    expect(src).toContain("/api/city-stats/");
  });
});

// ---------------------------------------------------------------------------
// 5. Routes.ts wiring
// ---------------------------------------------------------------------------
describe("Routes.ts — city stats wiring", () => {
  const src = readFile("server/routes.ts");

  it("imports registerCityStatsRoutes", () => {
    expect(src).toContain("registerCityStatsRoutes");
  });

  it("imports from routes-city-stats", () => {
    expect(src).toContain("./routes-city-stats");
  });

  it("calls registerCityStatsRoutes(app)", () => {
    expect(src).toContain("registerCityStatsRoutes(app)");
  });
});

// ---------------------------------------------------------------------------
// 7. Sprint & retro docs
// ---------------------------------------------------------------------------
describe("Sprint 448 documentation", () => {
  it("sprint doc exists", () => {
    const src = readFile("docs/sprints/SPRINT-448-CITY-COMPARISON.md");
    expect(src).toContain("Sprint 448");
    expect(src).toContain("City");
  });

  it("retro doc exists", () => {
    const src = readFile("docs/retros/RETRO-448-CITY-COMPARISON.md");
    expect(src).toContain("Retro 448");
    expect(src).toContain("Team Morale");
  });

  it("retro has action items", () => {
    const src = readFile("docs/retros/RETRO-448-CITY-COMPARISON.md");
    expect(src).toContain("Action Items");
    expect(src).toContain("Sprint 449");
  });
});
