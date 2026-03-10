/**
 * Sprint 434 — Leaderboard SubComponents Extraction
 *
 * Validates:
 * 1. RankedCard extracted to own file
 * 2. RankDeltaBadge included in extraction
 * 3. SubComponents re-export for backward compat
 * 4. SubComponents LOC reduction
 * 5. File health
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const countLines = (content: string) => content.split("\n").length;

// ---------------------------------------------------------------------------
// 1. RankedCard extraction
// ---------------------------------------------------------------------------
describe("RankedCard — extracted component", () => {
  const src = readFile("components/leaderboard/RankedCard.tsx");

  it("exports RankedCard component", () => {
    expect(src).toContain("export const RankedCard");
  });

  it("imports PhotoStrip from SubComponents", () => {
    expect(src).toContain('import { PhotoStrip } from "./SubComponents"');
  });

  it("has rank badge rendering", () => {
    expect(src).toContain("rankBadge");
    expect(src).toContain("rankBadgeText");
  });

  it("has share and bookmark buttons", () => {
    expect(src).toContain("cardShareBtn");
    expect(src).toContain("cardBookmarkBtn");
  });

  it("has dish badges", () => {
    expect(src).toContain("dishBadgeRow");
    expect(src).toContain("dishBadge");
  });

  it("has confidence indicator", () => {
    expect(src).toContain("getRankConfidence");
    expect(src).toContain("confIndicatorWrap");
  });
});

// ---------------------------------------------------------------------------
// 2. RankDeltaBadge
// ---------------------------------------------------------------------------
describe("RankDeltaBadge — in RankedCard", () => {
  const src = readFile("components/leaderboard/RankedCard.tsx");

  it("defines RankDeltaBadge function", () => {
    expect(src).toContain("function RankDeltaBadge");
  });

  it("has pulse animation for big movers", () => {
    expect(src).toContain("isBigMover");
    expect(src).toContain("pulseAnim");
  });

  it("uses RankDeltaBadge in RankedCard", () => {
    expect(src).toContain("<RankDeltaBadge");
  });
});

// ---------------------------------------------------------------------------
// 3. SubComponents re-export
// ---------------------------------------------------------------------------
describe("SubComponents — re-export", () => {
  const src = readFile("components/leaderboard/SubComponents.tsx");

  it("re-exports RankedCard", () => {
    expect(src).toContain('export { RankedCard } from "./RankedCard"');
  });

  it("still exports PhotoMosaic", () => {
    expect(src).toContain("export const PhotoMosaic");
  });

  it("still exports StarRating", () => {
    expect(src).toContain("export const StarRating");
  });

  it("still exports PhotoStrip", () => {
    expect(src).toContain("export const PhotoStrip");
  });

  it("still exports HeroCard", () => {
    expect(src).toContain("export function HeroCard");
  });
});

// ---------------------------------------------------------------------------
// 4. LOC reduction
// ---------------------------------------------------------------------------
describe("file health", () => {
  it("SubComponents dropped below 350 LOC", () => {
    const src = readFile("components/leaderboard/SubComponents.tsx");
    expect(countLines(src)).toBeLessThan(350);
  });

  it("RankedCard is under 350 LOC", () => {
    const src = readFile("components/leaderboard/RankedCard.tsx");
    expect(countLines(src)).toBeLessThan(350);
  });

  it("index.tsx is under 600 LOC threshold", () => {
    const src = readFile("app/(tabs)/index.tsx");
    expect(countLines(src)).toBeLessThan(600);
  });
});
