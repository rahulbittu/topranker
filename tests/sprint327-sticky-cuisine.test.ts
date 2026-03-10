/**
 * Sprint 327: Sticky Cuisine Chips on Scroll
 *
 * The sticky cuisine bar was removed from index.tsx during UI simplification.
 * CuisineChipRow is still used via RankingsListHeader.
 * Remaining tests verify that the in-scroll cuisine chips are preserved.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const indexPath = path.resolve(__dirname, "../app/(tabs)/index.tsx");
const indexCode = fs.readFileSync(indexPath, "utf-8");

describe("Sprint 327 — Sticky Cuisine Chips (post-simplification)", () => {
  // Existing functionality preserved (Sprint 386: via RankingsListHeader)
  it("should preserve in-scroll CuisineChipRow in ListHeaderComponent", () => {
    const headerSrc = fs.readFileSync(path.resolve(__dirname, "../components/leaderboard/RankingsListHeader.tsx"), "utf-8");
    expect(indexCode).toContain("RankingsListHeader");
    expect(headerSrc).toContain("CuisineChipRow");
  });

  it("should preserve category chips in ListHeaderComponent", () => {
    const headerSrc = fs.readFileSync(path.resolve(__dirname, "../components/leaderboard/RankingsListHeader.tsx"), "utf-8");
    expect(indexCode).toContain("RankingsListHeader");
    expect(headerSrc).toContain("categoryChips.map");
  });
});
