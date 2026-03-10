/**
 * Sprint 391: Extract ChallengeCard from challenger.tsx
 *
 * Verifies ChallengeCard lives in its own file with all card logic,
 * challenger.tsx is slim screen shell, and barrel import works.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ── 1. ChallengeCard component file ─────────────────────────────────

describe("Sprint 391 — ChallengeCard component", () => {
  const src = readFile("components/challenger/ChallengeCard.tsx");

  it("exports ChallengeCard function", () => {
    expect(src).toContain("export function ChallengeCard");
  });

  it("exports ChallengeCardProps interface", () => {
    expect(src).toContain("export interface ChallengeCardProps");
  });

  it("accepts challenge prop typed as ApiChallenger", () => {
    expect(src).toContain("challenge: ApiChallenger");
  });

  it("imports VoteBar from SubComponents", () => {
    expect(src).toContain("VoteBar");
    expect(src).toContain("SubComponents");
  });

  it("imports FighterPhoto from SubComponents", () => {
    expect(src).toContain("FighterPhoto");
  });

  it("imports WinnerReveal from SubComponents", () => {
    expect(src).toContain("WinnerReveal");
  });

  it("imports CommunityReviews from SubComponents", () => {
    expect(src).toContain("CommunityReviews");
  });

  it("contains urgencyColor logic", () => {
    expect(src).toContain("urgencyColor");
    expect(src).toContain("hoursRemaining");
  });

  it("contains timer segmented display", () => {
    expect(src).toContain("timerSegments");
    expect(src).toContain("DAYS");
    expect(src).toContain("SEC");
  });

  it("contains share functionality", () => {
    expect(src).toContain("shareChallenge");
    expect(src).toContain("Share.share");
  });

  it("contains card styles", () => {
    expect(src).toContain("StyleSheet.create");
    expect(src).toContain("card:");
    expect(src).toContain("fightCard:");
    expect(src).toContain("vsCircle:");
  });
});

// ── 2. Challenger screen after extraction ───────────────────────────

describe("Sprint 391 — Challenger screen (slim shell)", () => {
  const src = readFile("app/(tabs)/challenger.tsx");

  it("imports ChallengeCard from extracted component", () => {
    expect(src).toContain("ChallengeCard");
    expect(src).toContain("components/challenger/ChallengeCard");
  });

  it("renders ChallengeCard in map", () => {
    expect(src).toContain("<ChallengeCard");
  });

  it("still has screen-level elements", () => {
    expect(src).toContain("ChallengerScreen");
    expect(src).toContain("Live Challenges");
    expect(src).toContain("ScrollView");
  });

  it("does not contain card-level logic", () => {
    expect(src).not.toContain("urgencyColor");
    expect(src).not.toContain("shareChallenge");
    expect(src).not.toContain("VoteBar");
  });

  it("is under 175 LOC after extraction", () => {
    const lines = src.split("\n").length;
    expect(lines).toBeLessThan(175);
  });
});
