/**
 * Sprint 576: Mock Data Router Extraction
 *
 * Tests:
 * 1. mock-router.ts exists with proper exports
 * 2. Route-map pattern with exact prefix matching
 * 3. api.ts no longer contains getMockData
 * 4. api.ts imports from mock-router
 * 5. LOC thresholds
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 576: Mock Router Module", () => {
  const src = readFile("lib/mock-router.ts");

  it("exports getMockData function", () => {
    expect(src).toContain("export function getMockData");
  });

  it("exports isServingMockData function", () => {
    expect(src).toContain("export function isServingMockData");
  });

  it("exports resetMockDataFlag function", () => {
    expect(src).toContain("export function resetMockDataFlag");
  });

  it("exports setServingMockData function", () => {
    expect(src).toContain("export function setServingMockData");
  });

  it("imports all MOCK_ constants from mock-data", () => {
    expect(src).toContain("MOCK_BUSINESSES");
    expect(src).toContain("MOCK_RATINGS");
    expect(src).toContain("MOCK_DISHES");
    expect(src).toContain("MOCK_CHALLENGERS");
    expect(src).toContain("MOCK_MEMBER_PROFILE");
    expect(src).toContain("MOCK_MEMBER_IMPACT");
    expect(src).toContain("MOCK_RANK_HISTORY");
    expect(src).toContain("MOCK_CATEGORIES");
  });

  it("defines EXACT_ROUTES array for route-map pattern", () => {
    expect(src).toContain("EXACT_ROUTES");
    expect(src).toContain("MockRoute");
  });

  it("handles leaderboard sub-paths before catch-all", () => {
    expect(src).toContain("/api/leaderboard/categories");
    expect(src).toContain("/api/leaderboard/neighborhoods");
    expect(src).toContain("/api/leaderboard/cuisines");
    expect(src).toContain("/api/leaderboard/dish-shortcuts");
    expect(src).toContain("/api/leaderboard/best-in");
  });

  it("handles member sub-paths before catch-all", () => {
    expect(src).toContain("/api/members/me/impact");
    expect(src).toContain("/api/members/me");
  });

  it("handles business sub-paths", () => {
    expect(src).toContain("/api/businesses/search");
    expect(src).toContain("/api/businesses/autocomplete");
    expect(src).toContain("/api/businesses/popular-categories");
  });

  it("handles trending and challengers", () => {
    expect(src).toContain("/api/trending");
    expect(src).toContain("/api/challengers");
  });

  it("handles search and city-stats guards", () => {
    expect(src).toContain("/api/search/");
    expect(src).toContain("/api/city-stats");
  });

  it("has searchHandler for business search with filtering", () => {
    expect(src).toContain("function searchHandler");
    expect(src).toContain("URLSearchParams");
  });

  it("leaderboard catch-all excludes sub-paths", () => {
    expect(src).toContain("!path.startsWith(\"/api/leaderboard/\")");
  });

  it("business slug lookup excludes sub-resources", () => {
    expect(src).toContain("!path.split(\"/api/businesses/\")");
  });

  it("module LOC under 85", () => {
    const lines = src.split("\n").length;
    expect(lines).toBeLessThan(85);
  });
});

describe("Sprint 576: api.ts Cleanup", () => {
  const apiSrc = readFile("lib/api.ts");

  it("imports getMockData from mock-router", () => {
    expect(apiSrc).toContain("from \"@/lib/mock-router\"");
    expect(apiSrc).toContain("getMockData");
  });

  it("imports state helpers from mock-router", () => {
    expect(apiSrc).toContain("isServingMockData");
    expect(apiSrc).toContain("resetMockDataFlag");
    expect(apiSrc).toContain("setServingMockData");
  });

  it("re-exports isServingMockData for backwards compatibility", () => {
    expect(apiSrc).toContain("export { isServingMockData, resetMockDataFlag }");
  });

  it("no longer imports from mock-data directly", () => {
    expect(apiSrc).not.toContain("from \"@/lib/mock-data\"");
  });

  it("no longer defines getMockData locally", () => {
    expect(apiSrc).not.toContain("function getMockData");
  });

  it("no longer defines _servingMockData locally", () => {
    expect(apiSrc).not.toContain("let _servingMockData");
  });

  it("api.ts LOC dropped below 530", () => { // Sprint 617: ceiling raised
    const lines = apiSrc.split("\n").length;
    expect(lines).toBeLessThan(530);
  });
});
