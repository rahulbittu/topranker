/**
 * Sprint 431 — Challenger Card Animation Integration
 *
 * Validates:
 * 1. AnimatedVoteBar wired into ChallengeCard (replacing static VoteBar)
 * 2. VoteCountTicker wired for both fighters
 * 3. VoteAnimation imports in ChallengeCard
 * 4. Percentage computation for animated bar
 * 5. Static styles removed (voteCount, voteLabel)
 * 6. File health
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const countLines = (content: string) => content.split("\n").length;

// ---------------------------------------------------------------------------
// 1. AnimatedVoteBar integration
// ---------------------------------------------------------------------------
describe("ChallengeCard — AnimatedVoteBar wiring", () => {
  const src = readFile("components/challenger/ChallengeCard.tsx");

  it("imports AnimatedVoteBar from VoteAnimation", () => {
    expect(src).toContain("AnimatedVoteBar");
    expect(src).toContain("VoteAnimation");
  });

  it("renders AnimatedVoteBar with percentage props", () => {
    expect(src).toContain("<AnimatedVoteBar");
    expect(src).toContain("defenderPct={defenderPct}");
    expect(src).toContain("challengerPct={challengerPct}");
  });

  it("computes percentage from weighted votes", () => {
    expect(src).toContain("totalVotes = challengerVotes + defenderVotes");
    expect(src).toContain("defenderPct = totalVotes > 0");
    expect(src).toContain("challengerPct = totalVotes > 0");
  });
});

// ---------------------------------------------------------------------------
// 2. VoteCountTicker integration
// ---------------------------------------------------------------------------
describe("ChallengeCard — VoteCountTicker wiring", () => {
  const src = readFile("components/challenger/ChallengeCard.tsx");

  it("imports VoteCountTicker from VoteAnimation", () => {
    expect(src).toContain("VoteCountTicker");
  });

  it("renders VoteCountTicker for defender", () => {
    expect(src).toContain("VoteCountTicker count={Math.round(defenderVotes)}");
  });

  it("renders VoteCountTicker for challenger", () => {
    expect(src).toContain("VoteCountTicker count={Math.round(challengerVotes)}");
  });

  it("uses 'weighted votes' as label", () => {
    expect(src).toContain('label="weighted votes"');
  });
});

// ---------------------------------------------------------------------------
// 3. VoteCelebration import available
// ---------------------------------------------------------------------------
describe("ChallengeCard — VoteCelebration import", () => {
  const src = readFile("components/challenger/ChallengeCard.tsx");

  it("imports VoteCelebration from VoteAnimation", () => {
    expect(src).toContain("VoteCelebration");
  });
});

// ---------------------------------------------------------------------------
// 4. Static vote display removed
// ---------------------------------------------------------------------------
describe("ChallengeCard — static vote styles removed", () => {
  const src = readFile("components/challenger/ChallengeCard.tsx");

  it("no longer has voteCount style", () => {
    expect(src).not.toContain("voteCount:");
  });

  it("no longer has voteLabel style", () => {
    expect(src).not.toContain("voteLabel:");
  });
});

// ---------------------------------------------------------------------------
// 5. Static VoteBar no longer rendered
// ---------------------------------------------------------------------------
describe("ChallengeCard — static VoteBar replaced", () => {
  const src = readFile("components/challenger/ChallengeCard.tsx");

  it("does not render static VoteBar with challenger/defender props", () => {
    expect(src).not.toContain("<VoteBar challenger={");
  });

  it("still imports VoteBar (available via SubComponents)", () => {
    expect(src).toContain("VoteBar");
  });
});

// ---------------------------------------------------------------------------
// 6. File health
// ---------------------------------------------------------------------------
describe("file health", () => {
  it("ChallengeCard is under 450 LOC", () => {
    const src = readFile("components/challenger/ChallengeCard.tsx");
    expect(countLines(src)).toBeLessThan(450);
  });

  it("challenger.tsx is under 575 LOC threshold", () => {
    const src = readFile("app/(tabs)/challenger.tsx");
    expect(countLines(src)).toBeLessThan(575);
  });

  it("VoteAnimation.tsx is under 200 LOC", () => {
    const src = readFile("components/challenger/VoteAnimation.tsx");
    expect(countLines(src)).toBeLessThan(200);
  });
});
