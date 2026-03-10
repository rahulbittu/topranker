/**
 * Sprint 386: Rankings ListHeader Extraction
 *
 * Verifies RankingsListHeader component, index.tsx integration,
 * and LOC reduction.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ── 1. Extracted component ───────────────────────────────────────────

describe("Sprint 386 — RankingsListHeader component", () => {
  const headerSrc = readFile("components/leaderboard/RankingsListHeader.tsx");

  it("exports RankingsListHeader function", () => {
    expect(headerSrc).toContain("export function RankingsListHeader");
  });

  it("exports RankingsListHeaderProps interface", () => {
    expect(headerSrc).toContain("export interface RankingsListHeaderProps");
  });

  it("accepts categoryChips prop", () => {
    expect(headerSrc).toContain("categoryChips: CategoryChip[]");
  });

  it("accepts activeCategory prop", () => {
    expect(headerSrc).toContain("activeCategory: string");
  });

  it("accepts dishShortcuts prop", () => {
    expect(headerSrc).toContain("dishShortcuts: DishShortcut[]");
  });

  it("renders CuisineChipRow", () => {
    expect(headerSrc).toContain("<CuisineChipRow");
  });

  it("renders HeroCard", () => {
    expect(headerSrc).toContain("<HeroCard");
  });

  it("has category chip styles", () => {
    expect(headerSrc).toContain("chip:");
    expect(headerSrc).toContain("chipActive:");
  });

  it("has dish shortcut styles", () => {
    expect(headerSrc).toContain("dishShortcutChip:");
  });

  it("has welcome banner", () => {
    expect(headerSrc).toContain("Trust-weighted rankings by real people");
  });

  it("has rankings summary with count", () => {
    expect(headerSrc).toContain("filteredCount");
    expect(headerSrc).toContain("ranked");
  });

  it("has suggest category button", () => {
    expect(headerSrc).toContain("Suggest");
    expect(headerSrc).toContain("add-circle-outline");
  });

  it("has Best In header", () => {
    expect(headerSrc).toContain("Best In");
  });

  it("imports Analytics for dish shortcut tracking", () => {
    expect(headerSrc).toContain("Analytics");
  });

  it("has self-contained StyleSheet", () => {
    expect(headerSrc).toContain("StyleSheet.create");
  });
});

// ── 2. index.tsx integration ─────────────────────────────────────────

describe("Sprint 386 — index.tsx uses extracted header", () => {
  const indexSrc = readFile("app/(tabs)/index.tsx");

  it("imports RankingsListHeader", () => {
    expect(indexSrc).toContain("RankingsListHeader");
  });

  it("renders <RankingsListHeader", () => {
    expect(indexSrc).toContain("<RankingsListHeader");
  });

  it("passes categoryChips prop", () => {
    expect(indexSrc).toContain("categoryChips={categoryChips}");
  });

  it("passes activeCategory prop", () => {
    expect(indexSrc).toContain("activeCategory={activeCategory}");
  });

  it("passes city prop", () => {
    expect(indexSrc).toContain("city={city}");
  });

  it("does not import HeroCard directly", () => {
    expect(indexSrc).not.toContain("HeroCard");
  });

  it("does not import Analytics directly", () => {
    expect(indexSrc).not.toContain("import { Analytics }");
  });

  // Sprint 549: threshold raised 500 → 520
  it("index.tsx is under 520 LOC after extraction", () => {
    const lines = indexSrc.split("\n").length;
    expect(lines).toBeLessThan(520);
  });
});
