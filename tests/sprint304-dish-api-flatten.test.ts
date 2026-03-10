/**
 * Sprint 304: Dish Leaderboard API Response Flattening
 *
 * The page expects flat DishBoardDetail {id, city, dishName, dishSlug, dishEmoji, status, entryCount, entries, ...}
 * but the API was returning nested {leaderboard: {...}, entries: [...], ...}.
 * This sprint flattens the response in the route handler.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 304 — Dish Leaderboard API Response Flattening", () => {
  const routeSrc = readFile("server/routes-dishes.ts");
  const pageSrc = readFile("app/dish/[slug].tsx");

  // ─── Route flattens leaderboard fields ─────────────────────

  it("route destructures result into leaderboard, entries, isProvisional, minRatingsNeeded", () => {
    expect(routeSrc).toContain("const { leaderboard, entries, isProvisional, minRatingsNeeded } = result");
  });

  it("route returns flat id from leaderboard", () => {
    expect(routeSrc).toContain("id: leaderboard.id");
  });

  it("route returns flat city from leaderboard", () => {
    expect(routeSrc).toContain("city: leaderboard.city");
  });

  it("route returns flat dishName from leaderboard", () => {
    expect(routeSrc).toContain("dishName: leaderboard.dishName");
  });

  it("route returns flat dishSlug from leaderboard", () => {
    expect(routeSrc).toContain("dishSlug: leaderboard.dishSlug");
  });

  it("route returns flat dishEmoji from leaderboard", () => {
    expect(routeSrc).toContain("dishEmoji: leaderboard.dishEmoji");
  });

  it("route returns flat status from leaderboard", () => {
    expect(routeSrc).toContain("status: leaderboard.status");
  });

  it("route computes entryCount from entries.length", () => {
    expect(routeSrc).toContain("entryCount: entries.length");
  });

  it("route includes entries array in response", () => {
    expect(routeSrc).toMatch(/data:\s*\{[\s\S]*entries,/);
  });

  it("route includes isProvisional in response", () => {
    expect(routeSrc).toMatch(/data:\s*\{[\s\S]*isProvisional,/);
  });

  it("route includes minRatingsNeeded in response", () => {
    expect(routeSrc).toMatch(/data:\s*\{[\s\S]*minRatingsNeeded,/);
  });

  // ─── Page interface matches flattened response ─────────────

  it("page DishBoardDetail expects flat id field", () => {
    expect(pageSrc).toMatch(/interface DishBoardDetail[\s\S]*?id:\s*string/);
  });

  it("page DishBoardDetail expects flat entryCount field", () => {
    expect(pageSrc).toMatch(/interface DishBoardDetail[\s\S]*?entryCount:\s*number/);
  });

  it("page accesses board.dishName directly (not board.leaderboard.dishName)", () => {
    expect(pageSrc).toContain("board.dishName");
    expect(pageSrc).not.toContain("board.leaderboard");
  });

  it("page accesses board.entryCount directly", () => {
    expect(pageSrc).toContain("board.entryCount");
  });

  // ─── Sprint docs ──────────────────────────────────────────

  it("sprint doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/sprints/SPRINT-304-DISH-API-FLATTEN.md"))).toBe(true);
  });

  it("retro doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/retros/RETRO-304-DISH-API-FLATTEN.md"))).toBe(true);
  });
});
