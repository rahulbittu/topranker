/**
 * Sprint 428 — Challenger Vote Animation Enhancements
 *
 * Validates:
 * 1. AnimatedVoteBar component with spring animation
 * 2. VoteCelebration component with scale+fade
 * 3. VoteCountTicker with bounce animation
 * 4. File health
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const countLines = (content: string) => content.split("\n").length;

// ---------------------------------------------------------------------------
// 1. AnimatedVoteBar
// ---------------------------------------------------------------------------
describe("VoteAnimation — AnimatedVoteBar", () => {
  const src = readFile("components/challenger/VoteAnimation.tsx");

  it("exports AnimatedVoteBar component", () => {
    expect(src).toContain("export function AnimatedVoteBar");
  });

  it("exports AnimatedVoteBarProps interface", () => {
    expect(src).toContain("export interface AnimatedVoteBarProps");
  });

  it("accepts defenderPct and challengerPct props", () => {
    expect(src).toContain("defenderPct: number");
    expect(src).toContain("challengerPct: number");
  });

  it("uses Animated.spring for bar fill", () => {
    expect(src).toContain("Animated.spring(defenderWidth");
    expect(src).toContain("Animated.spring(challengerWidth");
  });

  it("uses interpolation for percentage width", () => {
    expect(src).toContain("interpolate");
    expect(src).toContain('outputRange: ["0%", "100%"]');
  });

  it("runs animations in parallel", () => {
    expect(src).toContain("Animated.parallel");
  });
});

// ---------------------------------------------------------------------------
// 2. VoteCelebration
// ---------------------------------------------------------------------------
describe("VoteAnimation — VoteCelebration", () => {
  const src = readFile("components/challenger/VoteAnimation.tsx");

  it("exports VoteCelebration component", () => {
    expect(src).toContain("export function VoteCelebration");
  });

  it("exports VoteCelebrationProps interface", () => {
    expect(src).toContain("export interface VoteCelebrationProps");
  });

  it("accepts visible and side props", () => {
    expect(src).toContain("visible: boolean");
    expect(src).toContain('side: "defender" | "challenger"');
  });

  it("has scale and opacity animations", () => {
    expect(src).toContain("Animated.spring(scale");
    expect(src).toContain("Animated.timing(opacity");
  });

  it("shows checkmark icon and vote text", () => {
    expect(src).toContain("checkmark-circle");
    expect(src).toContain("Vote cast!");
  });

  it("has accessibility label", () => {
    expect(src).toContain("Vote recorded");
  });
});

// ---------------------------------------------------------------------------
// 3. VoteCountTicker
// ---------------------------------------------------------------------------
describe("VoteAnimation — VoteCountTicker", () => {
  const src = readFile("components/challenger/VoteAnimation.tsx");

  it("exports VoteCountTicker component", () => {
    expect(src).toContain("export function VoteCountTicker");
  });

  it("accepts count and label props", () => {
    expect(src).toContain("count: number");
    expect(src).toContain("label: string");
  });

  it("uses bounce animation on count change", () => {
    expect(src).toContain("Animated.spring(scaleAnim");
  });
});

// ---------------------------------------------------------------------------
// 4. Styling
// ---------------------------------------------------------------------------
describe("VoteAnimation — styles", () => {
  const src = readFile("components/challenger/VoteAnimation.tsx");

  it("has defender and challenger bar colors", () => {
    expect(src).toContain("voteBarDefender");
    expect(src).toContain("voteBarChallenger");
    expect(src).toContain("#4A90D9");
  });

  it("has celebration positioning for both sides", () => {
    expect(src).toContain("celebrationLeft");
    expect(src).toContain("celebrationRight");
  });
});

// ---------------------------------------------------------------------------
// 5. File health
// ---------------------------------------------------------------------------
describe("file health", () => {
  it("VoteAnimation is under 200 LOC", () => {
    const src = readFile("components/challenger/VoteAnimation.tsx");
    expect(countLines(src)).toBeLessThan(200);
  });

  it("challenger.tsx is under 575 LOC threshold", () => {
    const src = readFile("app/(tabs)/challenger.tsx");
    expect(countLines(src)).toBeLessThan(575);
  });
});
