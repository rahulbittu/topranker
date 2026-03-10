/**
 * Sprint 325: DoorDash-Style Navigation Redesign
 *
 * Moved category/cuisine/dish filters INTO the FlatList scroll.
 * Fixed area = header + search only. Big middle = all content scrolls.
 * Pattern: Small top, big middle, small bottom (like Uber/DoorDash/Grab).
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 325 — Navigation redesign", () => {
  const src = readFile("app/(tabs)/index.tsx");
  const headerSrc = readFile("components/leaderboard/RankingsListHeader.tsx");

  it("category chips are inside ListHeaderComponent", () => {
    // Sprint 386: ListHeaderComponent now uses RankingsListHeader which contains categoryChips.map
    const listHeaderIdx = src.indexOf("ListHeaderComponent=");
    expect(listHeaderIdx).toBeGreaterThan(-1);
    expect(src).toContain("RankingsListHeader");
    expect(headerSrc).toContain("categoryChips.map");
  });

  it("CuisineChipRow is inside ListHeaderComponent", () => {
    // Sprint 386: CuisineChipRow is now inside RankingsListHeader component
    expect(src).toContain("RankingsListHeader");
    expect(headerSrc).toContain("CuisineChipRow");
  });

  it("dish shortcuts are inside ListHeaderComponent", () => {
    const listHeaderIdx = src.indexOf("ListHeaderComponent=");
    const dishIdx = src.indexOf("dishShortcuts.map");
    expect(dishIdx).toBeGreaterThan(listHeaderIdx);
  });

  it("search bar is NOT inside ListHeaderComponent (stays fixed)", () => {
    const searchIdx = src.indexOf("searchBar}");
    const listHeaderIdx = src.indexOf("ListHeaderComponent=");
    expect(searchIdx).toBeLessThan(listHeaderIdx);
  });

  it("header is NOT inside ListHeaderComponent (stays fixed)", () => {
    const headerIdx = src.indexOf("styles.header}");
    const listHeaderIdx = src.indexOf("ListHeaderComponent=");
    expect(headerIdx).toBeLessThan(listHeaderIdx);
  });

  it("no getItemLayout (removed for variable header)", () => {
    expect(src).not.toContain("getItemLayout");
  });

  it("still has all filter functionality", () => {
    expect(src).toContain("setActiveCategory");
    expect(src).toContain("setSelectedCuisine");
    expect(src).toContain("dishShortcuts");
    expect(src).toContain("CUISINE_DISPLAY");
  });

  it("has DoorDash pattern comment", () => {
    expect(src).toContain("DoorDash pattern");
  });


  // Sprint docs
  it("sprint doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/sprints/SPRINT-325-NAV-REDESIGN.md"))).toBe(true);
  });

  it("retro doc exists", () => {
    expect(fs.existsSync(path.join(ROOT, "docs/retros/RETRO-325-NAV-REDESIGN.md"))).toBe(true);
  });
});
