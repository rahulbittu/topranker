/**
 * Sprint 416 — Rankings Animated Transitions
 *
 * Validates:
 * 1. TopRankHighlight animation component
 * 2. RankDeltaBadge animated component in SubComponents
 * 3. index.tsx integration — TopRankHighlight wrapping cards
 * 4. Removed redundant FadeInView wrapper
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const countLines = (content: string) => content.split("\n").length;

// ---------------------------------------------------------------------------
// 1. TopRankHighlight component
// ---------------------------------------------------------------------------
describe("TopRankHighlight component", () => {
  const src = readFile("components/animations/TopRankHighlight.tsx");

  it("exports TopRankHighlight function", () => {
    expect(src).toContain("export function TopRankHighlight");
  });

  it("exports TopRankHighlightProps interface", () => {
    expect(src).toContain("export interface TopRankHighlightProps");
  });

  it("accepts active boolean prop", () => {
    expect(src).toContain("active: boolean");
  });

  it("uses Animated shimmer loop", () => {
    expect(src).toContain("Animated.loop");
    expect(src).toContain("borderOpacity");
  });

  it("uses pulse scale animation", () => {
    expect(src).toContain("glowScale");
    expect(src).toContain("1.01");
  });

  it("renders glow border with amber color", () => {
    expect(src).toContain("glowBorder");
    expect(src).toContain("borderColor: AMBER");
  });

  it("skips animation when not active", () => {
    expect(src).toContain("if (!active) return");
  });

  it("has top rank accessibility label", () => {
    expect(src).toContain("Top ranked");
    expect(src).toContain("number 1 position");
  });

  it("is compact under 110 LOC", () => {
    expect(countLines(src)).toBeLessThan(110);
  });
});

// ---------------------------------------------------------------------------
// 2. RankDeltaBadge component
// ---------------------------------------------------------------------------
describe("RankDeltaBadge — animated rank change", () => {
  const src = readFile("components/leaderboard/RankedCard.tsx");

  it("defines RankDeltaBadge function", () => {
    expect(src).toContain("function RankDeltaBadge");
  });

  it("identifies big movers (delta >= 3)", () => {
    expect(src).toContain("isBigMover");
    expect(src).toContain(">= 3");
  });

  it("pulses for big movers", () => {
    expect(src).toContain("pulseAnim");
    expect(src).toContain("1.15");
  });

  it("shows flame icon for big upward movers", () => {
    expect(src).toContain('"flame"');
  });

  it("shows trending-down icon for big downward movers", () => {
    expect(src).toContain('"trending-down"');
  });

  it("has accessibility label with rank change", () => {
    expect(src).toContain("Rank");
    expect(src).toContain("position");
  });

  it("uses RankDeltaBadge in RankedCard", () => {
    expect(src).toContain("<RankDeltaBadge delta={item.rankDelta}");
  });
});

// ---------------------------------------------------------------------------
// 3. index.tsx integration
// ---------------------------------------------------------------------------
describe("index.tsx — TopRankHighlight integration", () => {
  const src = readFile("app/(tabs)/index.tsx");

  it("imports TopRankHighlight", () => {
    expect(src).toContain("TopRankHighlight");
    expect(src).toContain("components/animations/TopRankHighlight");
  });

  it("wraps cards with TopRankHighlight", () => {
    expect(src).toContain("<TopRankHighlight active={item.rank === 1}>");
  });

  it("does not wrap cards with redundant FadeInView", () => {
    // RankedCard has its own internal animation, so FadeInView wrapper should not wrap renderItem
    expect(src).not.toContain("<FadeInView delay={index * 100}>");
  });

  it("is under 600 LOC threshold", () => {
    expect(countLines(src)).toBeLessThan(600);
  });
});
