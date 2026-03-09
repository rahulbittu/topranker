/**
 * Sprint 169 — Dish Leaderboard Batch Recalculation + Dish Rank Consequence
 *
 * Validates:
 * 1. server/index.ts schedules 6-hour dish recalculation batch job
 * 2. Graceful shutdown clears dish recalculation interval
 * 3. RatingConfirmation accepts dishContext prop
 * 4. Dish rank banner shown in confirmation when dishContext provided
 * 5. dishContext prop passed from rate screen to RatingConfirmation
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Batch recalculation job in server/index.ts
// ---------------------------------------------------------------------------
describe("Dish leaderboard batch job — server/index.ts", () => {
  const serverSrc = readFile("server/index.ts");

  it("imports recalculateDishLeaderboard", () => {
    expect(serverSrc).toContain("recalculateDishLeaderboard");
  });

  it("imports dishLeaderboards table", () => {
    expect(serverSrc).toContain("dishLeaderboards");
  });

  it("defines recalculateAllDishBoards function", () => {
    expect(serverSrc).toContain("recalculateAllDishBoards");
  });

  it("runs startup sweep", () => {
    // recalculateAllDishBoards() is called immediately on startup
    const match = serverSrc.match(/recalculateAllDishBoards\(\)\s*;/);
    expect(match).not.toBeNull();
  });

  it("schedules 6-hour interval", () => {
    expect(serverSrc).toContain("6 * 60 * 60 * 1000");
  });

  it("stores interval reference for cleanup", () => {
    expect(serverSrc).toContain("dishRecalcInterval");
  });

  it("clears interval on graceful shutdown", () => {
    expect(serverSrc).toContain("clearInterval(dishRecalcInterval)");
  });

  it("logs recalculation results", () => {
    expect(serverSrc).toContain("Dish leaderboard recalculation:");
  });

  it("iterates all boards and sums entries", () => {
    expect(serverSrc).toContain("totalEntries");
    expect(serverSrc).toContain("for (const board of boards)");
  });
});

// ---------------------------------------------------------------------------
// 2. RatingConfirmation — dishContext prop
// ---------------------------------------------------------------------------
describe("RatingConfirmation — dish rank consequence", () => {
  const subSrc = readFile("components/rate/SubComponents.tsx");

  it("accepts dishContext optional prop", () => {
    expect(subSrc).toContain("dishContext?:");
  });

  it("renders dish rank banner when dishContext provided", () => {
    expect(subSrc).toContain("dishRankBanner");
    expect(subSrc).toContain("dishRankText");
  });

  it("shows ranking update message with dish name", () => {
    expect(subSrc).toContain("also updates the");
    expect(subSrc).toContain("{dishContext}");
    expect(subSrc).toContain("ranking");
  });

  it("has dishRankBanner style", () => {
    expect(subSrc).toContain("dishRankBanner:");
  });

  it("has dishRankText style", () => {
    expect(subSrc).toContain("dishRankText:");
  });

  it("uses amber tint background for banner", () => {
    expect(subSrc).toContain("rgba(196,154,26,0.08)");
  });
});

// ---------------------------------------------------------------------------
// 3. Rate screen passes dishContext to RatingConfirmation
// ---------------------------------------------------------------------------
describe("Rate screen — dishContext prop passing", () => {
  const rateSrc = readFile("app/rate/[id].tsx");

  it("passes dishContext prop to RatingConfirmation", () => {
    expect(rateSrc).toContain("dishContext={dishContext}");
  });

  it("destructures dish from search params", () => {
    expect(rateSrc).toContain("dish: dishContext");
  });

  it("RatingConfirmation call includes dishContext before onDone", () => {
    // dishContext should appear between tierBarStyle and onDone props
    const confirmBlock = rateSrc.match(/RatingConfirmation[\s\S]{0,800}onDone/);
    expect(confirmBlock).not.toBeNull();
    expect(confirmBlock![0]).toContain("dishContext={dishContext}");
  });
});

// ---------------------------------------------------------------------------
// 4. Batch job error handling
// ---------------------------------------------------------------------------
describe("Batch job — error handling", () => {
  const serverSrc = readFile("server/index.ts");

  it("catches errors in recalculation", () => {
    expect(serverSrc).toContain("Dish leaderboard recalculation error:");
  });

  it("handles individual board failures gracefully", () => {
    // try/catch wraps the entire recalculation function
    const fn = serverSrc.match(/async function recalculateAllDishBoards[\s\S]{0,500}/);
    expect(fn).not.toBeNull();
    expect(fn![0]).toContain("try");
  });
});
