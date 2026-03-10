/**
 * Sprint 324: Dish Leaderboard Entry Count Badges on Ranking Cards
 *
 * Shows dish leaderboard badges (#1 Biryani, #3 Butter Chicken) on each
 * business card in the Rankings page.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 324 — Batch dish rankings storage", () => {
  const storageSrc = readFile("server/storage/dishes.ts");

  it("exports getBatchDishRankings function", () => {
    expect(storageSrc).toContain("export async function getBatchDishRankings");
  });

  it("accepts businessIds array parameter", () => {
    expect(storageSrc).toContain("businessIds: string[]");
  });

  it("limits to 3 rankings per business", () => {
    expect(storageSrc).toContain(".length < 3");
  });

  it("returns Record<string, dishRanking[]> shape", () => {
    expect(storageSrc).toContain("Record<string,");
    expect(storageSrc).toContain("dishSlug: string; dishName: string");
  });
});

describe("Sprint 324 — Leaderboard API includes dish rankings", () => {
  const routesSrc = readFile("server/routes.ts");

  it("imports getBatchDishRankings", () => {
    expect(routesSrc).toContain("getBatchDishRankings");
  });

  it("calls getBatchDishRankings in leaderboard route", () => {
    expect(routesSrc).toContain("getBatchDishRankings(bizIds)");
  });

  it("adds dishRankings to response data", () => {
    expect(routesSrc).toContain("dishRankings: dishRankingsMap");
  });
});

describe("Sprint 324 — MappedBusiness type", () => {
  const typeSrc = readFile("types/business.ts");

  it("includes dishRankings optional field", () => {
    expect(typeSrc).toContain("dishRankings?:");
    expect(typeSrc).toContain("dishSlug: string");
    expect(typeSrc).toContain("rankPosition: number");
  });
});

describe("Sprint 324 — RankedCard dish badges", () => {
  const subSrc = readFile("components/leaderboard/SubComponents.tsx");

  it("renders dish badge row when dishRankings exist", () => {
    expect(subSrc).toContain("item.dishRankings");
    expect(subSrc).toContain("dishBadgeRow");
  });

  it("shows rank position and dish name", () => {
    expect(subSrc).toContain("#{dr.rankPosition} {dr.dishName}");
  });

  it("navigates to /dish/[slug] on badge tap", () => {
    expect(subSrc).toContain('pathname: "/dish/[slug]"');
    expect(subSrc).toContain("dr.dishSlug");
  });

  it("has dishBadge styles", () => {
    expect(subSrc).toContain("dishBadge:");
    expect(subSrc).toContain("dishBadgeText:");
    expect(subSrc).toContain("dishBadgeRow:");
  });

  // Sprint docs
  it("sprint doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/sprints/SPRINT-324-DISH-BADGES.md"))).toBe(true);
  });

  it("retro doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/retros/RETRO-324-DISH-BADGES.md"))).toBe(true);
  });
});
