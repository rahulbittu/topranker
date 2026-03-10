/**
 * Sprint 277 — Dish Leaderboard Enrichment Tests
 *
 * Validates:
 * 1. TopDishes component exists with correct structure
 * 2. Top dishes API endpoint exists
 * 3. Business page integrates TopDishes
 * 4. Dish ranking display
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 277: Top Dishes — Component", () => {
  const topDishesSrc = readFile("components/business/TopDishes.tsx");

  it("component exists and is exported", () => {
    expect(topDishesSrc).toContain("export function TopDishes");
  });

  it("fetches from top-dishes API", () => {
    expect(topDishesSrc).toContain("/api/businesses/");
    expect(topDishesSrc).toContain("top-dishes");
  });

  it("displays ranked dish list", () => {
    expect(topDishesSrc).toContain("dishRank");
    expect(topDishesSrc).toContain("dishName");
    expect(topDishesSrc).toContain("dishVotes");
  });

  it("shows up to 5 dishes", () => {
    expect(topDishesSrc).toContain(".slice(0, 5)");
  });

  it("navigates to dish page on tap", () => {
    expect(topDishesSrc).toContain("router.push");
    expect(topDishesSrc).toContain("/dish/");
  });

  it("handles dish photos with SafeImage", () => {
    expect(topDishesSrc).toContain("SafeImage");
    expect(topDishesSrc).toContain("dishPhoto");
  });

  it("shows placeholder when no photo", () => {
    expect(topDishesSrc).toContain("dishPhotoPlaceholder");
    expect(topDishesSrc).toContain("restaurant-outline");
  });

  it("returns null for empty dishes", () => {
    expect(topDishesSrc).toContain("dishes.length === 0");
    expect(topDishesSrc).toContain("return null");
  });

  it("has TOP DISHES title", () => {
    expect(topDishesSrc).toContain("TOP DISHES");
  });

  it("accepts businessName prop", () => {
    expect(topDishesSrc).toContain("businessName: string");
  });
});

describe("Sprint 277: Top Dishes API", () => {
  const dishRoutesSrc = readFile("server/routes-dishes.ts");

  it("top-dishes endpoint exists", () => {
    expect(dishRoutesSrc).toContain("/api/businesses/:id/top-dishes");
  });

  it("calls getBusinessDishes", () => {
    expect(dishRoutesSrc).toContain("getBusinessDishes");
  });

  it("returns enriched dish data", () => {
    expect(dishRoutesSrc).toContain("name: d.name");
    expect(dishRoutesSrc).toContain("voteCount: d.voteCount");
  });
});

describe("Sprint 277: Business Page Integration", () => {
  const bizPageSrc = readFile("components/business/BusinessAnalyticsSection.tsx");

  it("business page imports TopDishes", () => {
    expect(bizPageSrc).toContain("TopDishes");
    expect(bizPageSrc).toContain("@/components/business/TopDishes");
  });

  it("TopDishes rendered on business page", () => {
    expect(bizPageSrc).toContain("<TopDishes businessId={business.id}");
  });
});
