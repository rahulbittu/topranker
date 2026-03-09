/**
 * Sprint 257 — Review Helpfulness Voting System
 *
 * Validates:
 * 1. Static analysis — review-helpfulness.ts (10 tests)
 * 2. Runtime — review-helpfulness (16 tests)
 * 3. Routes static — routes-review-helpfulness.ts (8 tests)
 * 4. Integration (4 tests)
 *
 * Total: 38 tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  castHelpfulnessVote,
  getVoteForReview,
  getReviewHelpfulness,
  getMemberHelpfulnessReceived,
  getTopHelpfulReviews,
  updateVote,
  getHelpfulnessStats,
  clearHelpfulnessVotes,
  MAX_VOTES,
  wilsonScoreLowerBound,
} from "../server/review-helpfulness";
import { registerReviewHelpfulnessRoutes } from "../server/routes-review-helpfulness";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. Static analysis — review-helpfulness.ts (10 tests)
// ---------------------------------------------------------------------------
describe("Static analysis — review-helpfulness.ts", () => {
  const src = readFile("server/review-helpfulness.ts");

  it("file exists", () => {
    expect(fileExists("server/review-helpfulness.ts")).toBe(true);
  });

  it("exports castHelpfulnessVote", () => {
    expect(src).toContain("export function castHelpfulnessVote");
  });

  it("exports getVoteForReview", () => {
    expect(src).toContain("export function getVoteForReview");
  });

  it("exports getReviewHelpfulness", () => {
    expect(src).toContain("export function getReviewHelpfulness");
  });

  it("exports getMemberHelpfulnessReceived", () => {
    expect(src).toContain("export function getMemberHelpfulnessReceived");
  });

  it("exports getTopHelpfulReviews", () => {
    expect(src).toContain("export function getTopHelpfulReviews");
  });

  it("exports updateVote", () => {
    expect(src).toContain("export function updateVote");
  });

  it("exports getHelpfulnessStats", () => {
    expect(src).toContain("export function getHelpfulnessStats");
  });

  it("MAX_VOTES = 50000", () => {
    expect(MAX_VOTES).toBe(50000);
    expect(src).toContain("MAX_VOTES = 50000");
  });

  it("uses tagged logger with ReviewHelpfulness tag", () => {
    expect(src).toContain('log.tag("ReviewHelpfulness")');
  });
});

// ---------------------------------------------------------------------------
// 2. Runtime — review-helpfulness (16 tests)
// ---------------------------------------------------------------------------
describe("Runtime — review-helpfulness", () => {
  beforeEach(() => {
    clearHelpfulnessVotes();
  });

  it("castHelpfulnessVote returns a vote object with correct fields", () => {
    const vote = castHelpfulnessVote("r1", "voter1", "author1", true);
    expect(vote).not.toBeNull();
    expect(vote!.reviewId).toBe("r1");
    expect(vote!.voterId).toBe("voter1");
    expect(vote!.reviewerId).toBe("author1");
    expect(vote!.helpful).toBe(true);
    expect(vote!.id).toMatch(/^hv_/);
    expect(vote!.createdAt).toBeTruthy();
  });

  it("duplicate vote is rejected (returns null)", () => {
    castHelpfulnessVote("r1", "voter1", "author1", true);
    const dupe = castHelpfulnessVote("r1", "voter1", "author1", false);
    expect(dupe).toBeNull();
  });

  it("self-vote is rejected (returns null)", () => {
    const selfVote = castHelpfulnessVote("r1", "author1", "author1", true);
    expect(selfVote).toBeNull();
  });

  it("getVoteForReview returns the vote for a specific voter", () => {
    castHelpfulnessVote("r1", "voter1", "author1", true);
    const vote = getVoteForReview("r1", "voter1");
    expect(vote).toBeDefined();
    expect(vote!.helpful).toBe(true);
  });

  it("getVoteForReview returns undefined for non-existent vote", () => {
    const vote = getVoteForReview("r1", "voter1");
    expect(vote).toBeUndefined();
  });

  it("getReviewHelpfulness returns correct stats", () => {
    castHelpfulnessVote("r1", "voter1", "author1", true);
    castHelpfulnessVote("r1", "voter2", "author1", true);
    castHelpfulnessVote("r1", "voter3", "author1", false);

    const stats = getReviewHelpfulness("r1");
    expect(stats.reviewId).toBe("r1");
    expect(stats.helpfulCount).toBe(2);
    expect(stats.notHelpfulCount).toBe(1);
    expect(stats.totalVotes).toBe(3);
    expect(stats.helpfulnessScore).toBeGreaterThan(0);
    expect(stats.helpfulnessScore).toBeLessThanOrEqual(1);
  });

  it("getReviewHelpfulness returns zero stats for unknown review", () => {
    const stats = getReviewHelpfulness("unknown");
    expect(stats.totalVotes).toBe(0);
    expect(stats.helpfulnessScore).toBe(0);
  });

  it("Wilson score lower bound is computed correctly", () => {
    // With 10 helpful out of 10 total, score should be high but < 1
    const score = wilsonScoreLowerBound(10, 10);
    expect(score).toBeGreaterThan(0.6);
    expect(score).toBeLessThan(1);

    // With 0 helpful out of 10, score should be very low
    const lowScore = wilsonScoreLowerBound(0, 10);
    expect(lowScore).toBe(0);

    // With 0 total, score should be 0
    expect(wilsonScoreLowerBound(0, 0)).toBe(0);
  });

  it("Wilson score increases with more helpful votes at same ratio", () => {
    // More data = tighter CI = higher lower bound at same proportion
    const small = wilsonScoreLowerBound(5, 10);
    const large = wilsonScoreLowerBound(50, 100);
    expect(large).toBeGreaterThan(small);
  });

  it("getMemberHelpfulnessReceived aggregates across reviews", () => {
    castHelpfulnessVote("r1", "voter1", "author1", true);
    castHelpfulnessVote("r1", "voter2", "author1", true);
    castHelpfulnessVote("r2", "voter1", "author1", false);

    const stats = getMemberHelpfulnessReceived("author1");
    expect(stats.totalHelpful).toBe(2);
    expect(stats.totalNotHelpful).toBe(1);
    expect(stats.totalVotes).toBe(3);
    expect(stats.reviewsWithVotes).toBe(2);
  });

  it("getMemberHelpfulnessReceived returns zeros for unknown member", () => {
    const stats = getMemberHelpfulnessReceived("nobody");
    expect(stats.totalVotes).toBe(0);
    expect(stats.reviewsWithVotes).toBe(0);
  });

  it("getTopHelpfulReviews returns reviews sorted by helpfulness score", () => {
    // r1: 3 helpful, 0 not helpful (high score)
    castHelpfulnessVote("r1", "v1", "a1", true);
    castHelpfulnessVote("r1", "v2", "a1", true);
    castHelpfulnessVote("r1", "v3", "a1", true);

    // r2: 1 helpful, 2 not helpful (low score)
    castHelpfulnessVote("r2", "v1", "a2", true);
    castHelpfulnessVote("r2", "v2", "a2", false);
    castHelpfulnessVote("r2", "v3", "a2", false);

    const top = getTopHelpfulReviews(10);
    expect(top.length).toBe(2);
    expect(top[0].reviewId).toBe("r1");
    expect(top[0].helpfulnessScore).toBeGreaterThan(top[1].helpfulnessScore);
  });

  it("getTopHelpfulReviews respects limit", () => {
    castHelpfulnessVote("r1", "v1", "a1", true);
    castHelpfulnessVote("r2", "v1", "a2", true);
    castHelpfulnessVote("r3", "v1", "a3", true);

    const top = getTopHelpfulReviews(2);
    expect(top.length).toBe(2);
  });

  it("updateVote changes vote direction", () => {
    castHelpfulnessVote("r1", "voter1", "author1", true);
    const result = updateVote("r1", "voter1", false);
    expect(result).toBe(true);

    const vote = getVoteForReview("r1", "voter1");
    expect(vote!.helpful).toBe(false);
  });

  it("updateVote returns false for non-existent vote", () => {
    const result = updateVote("r1", "voter1", true);
    expect(result).toBe(false);
  });

  it("getHelpfulnessStats returns global aggregates", () => {
    castHelpfulnessVote("r1", "v1", "a1", true);
    castHelpfulnessVote("r1", "v2", "a1", false);
    castHelpfulnessVote("r2", "v3", "a2", true);

    const stats = getHelpfulnessStats();
    expect(stats.totalVotes).toBe(3);
    expect(stats.helpfulVotes).toBe(2);
    expect(stats.notHelpfulVotes).toBe(1);
    expect(stats.uniqueVoters).toBe(3);
    expect(stats.uniqueReviews).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// 3. Routes static — routes-review-helpfulness.ts (8 tests)
// ---------------------------------------------------------------------------
describe("Routes static — routes-review-helpfulness.ts", () => {
  const src = readFile("server/routes-review-helpfulness.ts");

  it("file exists", () => {
    expect(fileExists("server/routes-review-helpfulness.ts")).toBe(true);
  });

  it("exports registerReviewHelpfulnessRoutes", () => {
    expect(src).toContain("export function registerReviewHelpfulnessRoutes");
    expect(typeof registerReviewHelpfulnessRoutes).toBe("function");
  });

  it("defines POST /api/reviews/:reviewId/helpful endpoint", () => {
    expect(src).toContain("/api/reviews/:reviewId/helpful");
    expect(src).toContain("app.post");
  });

  it("defines POST /api/reviews/:reviewId/not-helpful endpoint", () => {
    expect(src).toContain("/api/reviews/:reviewId/not-helpful");
  });

  it("defines GET /api/reviews/:reviewId/helpfulness endpoint", () => {
    expect(src).toContain("/api/reviews/:reviewId/helpfulness");
    expect(src).toContain("app.get");
  });

  it("defines PUT /api/reviews/:reviewId/helpfulness-vote endpoint", () => {
    expect(src).toContain("/api/reviews/:reviewId/helpfulness-vote");
    expect(src).toContain("app.put");
  });

  it("defines GET /api/members/:memberId/helpfulness endpoint", () => {
    expect(src).toContain("/api/members/:memberId/helpfulness");
  });

  it("imports from ./review-helpfulness", () => {
    expect(src).toContain('from "./review-helpfulness"');
  });
});

// ---------------------------------------------------------------------------
// 4. Integration (4 tests)
// ---------------------------------------------------------------------------
describe("Integration — review helpfulness wiring", () => {
  it("routes.ts imports registerReviewHelpfulnessRoutes", () => {
    const routesSrc = readFile("server/routes.ts");
    expect(routesSrc).toContain('import { registerReviewHelpfulnessRoutes } from "./routes-review-helpfulness"');
  });

  it("routes.ts calls registerReviewHelpfulnessRoutes(app)", () => {
    const routesSrc = readFile("server/routes.ts");
    expect(routesSrc).toContain("registerReviewHelpfulnessRoutes(app)");
  });

  it("helpfulness score uses Wilson lower bound (formula present)", () => {
    const src = readFile("server/review-helpfulness.ts");
    // Check key Wilson formula components
    expect(src).toContain("wilsonScoreLowerBound");
    expect(src).toContain("z * z");
    expect(src).toContain("Math.sqrt");
    expect(src).toContain("p * (1 - p)");
  });

  it("clearHelpfulnessVotes resets all state", () => {
    clearHelpfulnessVotes();
    castHelpfulnessVote("r1", "v1", "a1", true);
    castHelpfulnessVote("r2", "v2", "a2", false);
    expect(getHelpfulnessStats().totalVotes).toBe(2);

    clearHelpfulnessVotes();
    const stats = getHelpfulnessStats();
    expect(stats.totalVotes).toBe(0);
    expect(stats.uniqueVoters).toBe(0);
    expect(stats.uniqueReviews).toBe(0);
  });
});
