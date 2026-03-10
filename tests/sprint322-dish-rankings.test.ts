/**
 * Sprint 322: Business Detail Dish Rankings
 *
 * Shows which dish leaderboards a business is ranked on.
 * API endpoint + client component.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 322 — DishRankings component", () => {
  const src = readFile("components/business/DishRankings.tsx");

  it("exports DishRankings function", () => {
    expect(src).toContain("export function DishRankings");
  });

  it("accepts businessId prop", () => {
    expect(src).toContain("businessId: string");
  });

  it("fetches /api/businesses/:id/dish-rankings", () => {
    expect(src).toContain("/dish-rankings");
    expect(src).toContain("dish-rankings");
  });

  it("renders rank badge with position", () => {
    expect(src).toContain("rankBadge");
    expect(src).toContain("r.rankPosition");
  });

  it("shows dish emoji", () => {
    expect(src).toContain("r.dishEmoji");
  });

  it("shows 'Best {dishName}' text", () => {
    expect(src).toContain("Best {r.dishName}");
  });

  it("shows dish score formatted", () => {
    expect(src).toContain("r.dishScore");
    expect(src).toContain("toFixed(1)");
  });

  it("navigates to /dish/[slug] on press", () => {
    expect(src).toContain('pathname: "/dish/[slug]"');
    expect(src).toContain("r.dishSlug");
  });

  it("returns null when no rankings", () => {
    expect(src).toContain("rankings.length === 0");
    expect(src).toContain("return null");
  });

  it("has DISH RANKINGS card title", () => {
    expect(src).toContain("DISH RANKINGS");
  });
});

describe("Sprint 322 — API endpoint", () => {
  const routesSrc = readFile("server/routes-dishes.ts");

  it("registers /api/businesses/:id/dish-rankings route", () => {
    expect(routesSrc).toContain("/api/businesses/:id/dish-rankings");
  });

  it("calls getBusinessDishRankings", () => {
    expect(routesSrc).toContain("getBusinessDishRankings");
  });
});

describe("Sprint 322 — Storage function", () => {
  const storageSrc = readFile("server/storage/dishes.ts");

  it("exports getBusinessDishRankings function", () => {
    expect(storageSrc).toContain("export async function getBusinessDishRankings");
  });

  it("joins dishLeaderboardEntries with dishLeaderboards", () => {
    expect(storageSrc).toContain("dishLeaderboardEntries");
    expect(storageSrc).toContain("dishLeaderboards");
  });

  it("returns rankPosition and dishScore", () => {
    expect(storageSrc).toContain("rankPosition");
    expect(storageSrc).toContain("dishScore");
  });
});

describe("Sprint 322 — Business page integration", () => {
  const pageSrc = readFile("app/business/[id].tsx");

  it("imports DishRankings component", () => {
    expect(pageSrc).toContain("DishRankings");
    expect(pageSrc).toContain("@/components/business/DishRankings");
  });

  it("renders DishRankings with businessId", () => {
    expect(pageSrc).toContain("<DishRankings");
    expect(pageSrc).toContain("businessId={business.id}");
  });

  // Sprint docs
  it("sprint doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/sprints/SPRINT-322-DISH-RANKINGS.md"))).toBe(true);
  });

  it("retro doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/retros/RETRO-322-DISH-RANKINGS.md"))).toBe(true);
  });
});
