/**
 * Review Helpfulness Voting — Sprint 257
 *
 * In-memory store for community helpfulness votes on reviews.
 * Feeds into reputation-v2.ts `helpful_votes` signal (weight 0.10).
 * Creates a virtuous loop: helpful reviewers gain credibility (Constitution #64).
 *
 * Owner: Sarah Nakamura (Lead Engineer)
 */

import { log } from "./logger";

const helpLog = log.tag("ReviewHelpfulness");

// ─── Types ───────────────────────────────────────────────────

export interface HelpfulnessVote {
  id: string;
  reviewId: string;
  voterId: string;     // who is voting
  reviewerId: string;  // who wrote the review
  helpful: boolean;    // true = helpful, false = not helpful
  createdAt: string;
}

export interface ReviewHelpfulnessStats {
  reviewId: string;
  helpfulCount: number;
  notHelpfulCount: number;
  helpfulnessScore: number;  // 0-1 Wilson score lower bound
  totalVotes: number;
}

// ─── In-Memory Store ─────────────────────────────────────────

const votes: HelpfulnessVote[] = [];
export const MAX_VOTES = 50000;

let voteIdCounter = 0;

function generateVoteId(): string {
  voteIdCounter += 1;
  return `hv_${Date.now()}_${voteIdCounter}`;
}

// ─── Wilson Score Lower Bound ────────────────────────────────

/**
 * Compute Wilson score lower bound for helpfulness.
 * Same pattern as experiment-tracker wilsonScore.
 *
 * @param helpful - Number of helpful votes
 * @param total - Total votes
 * @param z - Z-score (default 1.96 for 95% CI)
 */
export function wilsonScoreLowerBound(
  helpful: number,
  total: number,
  z: number = 1.96,
): number {
  if (total === 0) return 0;
  const p = helpful / total;
  const denominator = 1 + (z * z) / total;
  const center = (p + (z * z) / (2 * total)) / denominator;
  const margin =
    (z * Math.sqrt((p * (1 - p)) / total + (z * z) / (4 * total * total))) /
    denominator;
  return Math.max(0, center - margin);
}

// ─── Core Functions ──────────────────────────────────────────

/**
 * Cast a helpfulness vote on a review.
 * Returns the vote or null if rejected (duplicate vote or self-vote).
 */
export function castHelpfulnessVote(
  reviewId: string,
  voterId: string,
  reviewerId: string,
  helpful: boolean,
): HelpfulnessVote | null {
  // Can't vote on own review
  if (voterId === reviewerId) {
    helpLog.info(`Self-vote rejected: voter=${voterId} review=${reviewId}`);
    return null;
  }

  // One vote per voter per review
  const existing = votes.find(
    (v) => v.reviewId === reviewId && v.voterId === voterId,
  );
  if (existing) {
    helpLog.info(`Duplicate vote rejected: voter=${voterId} review=${reviewId}`);
    return null;
  }

  // FIFO eviction if at capacity
  if (votes.length >= MAX_VOTES) {
    votes.shift();
    helpLog.warn(`FIFO eviction: store at capacity (${MAX_VOTES})`);
  }

  const vote: HelpfulnessVote = {
    id: generateVoteId(),
    reviewId,
    voterId,
    reviewerId,
    helpful,
    createdAt: new Date().toISOString(),
  };

  votes.push(vote);
  helpLog.info(
    `Vote cast: voter=${voterId} review=${reviewId} helpful=${helpful}`,
  );
  return vote;
}

/**
 * Get a specific member's vote on a review.
 */
export function getVoteForReview(
  reviewId: string,
  voterId: string,
): HelpfulnessVote | undefined {
  return votes.find(
    (v) => v.reviewId === reviewId && v.voterId === voterId,
  );
}

/**
 * Get helpfulness stats for a review, including Wilson score lower bound.
 */
export function getReviewHelpfulness(reviewId: string): ReviewHelpfulnessStats {
  const reviewVotes = votes.filter((v) => v.reviewId === reviewId);
  const helpfulCount = reviewVotes.filter((v) => v.helpful).length;
  const notHelpfulCount = reviewVotes.filter((v) => !v.helpful).length;
  const totalVotes = reviewVotes.length;

  return {
    reviewId,
    helpfulCount,
    notHelpfulCount,
    helpfulnessScore: wilsonScoreLowerBound(helpfulCount, totalVotes),
    totalVotes,
  };
}

/**
 * Get total helpful votes received across all reviews by a member.
 */
export function getMemberHelpfulnessReceived(memberId: string): {
  totalHelpful: number;
  totalNotHelpful: number;
  totalVotes: number;
  reviewsWithVotes: number;
} {
  const memberVotes = votes.filter((v) => v.reviewerId === memberId);
  const totalHelpful = memberVotes.filter((v) => v.helpful).length;
  const totalNotHelpful = memberVotes.filter((v) => !v.helpful).length;
  const reviewIds = new Set(memberVotes.map((v) => v.reviewId));

  return {
    totalHelpful,
    totalNotHelpful,
    totalVotes: memberVotes.length,
    reviewsWithVotes: reviewIds.size,
  };
}

/**
 * Get top helpful reviews sorted by Wilson score (descending).
 */
export function getTopHelpfulReviews(limit: number = 10): ReviewHelpfulnessStats[] {
  const reviewIds = new Set(votes.map((v) => v.reviewId));
  const stats: ReviewHelpfulnessStats[] = [];

  for (const reviewId of reviewIds) {
    stats.push(getReviewHelpfulness(reviewId));
  }

  return stats
    .filter((s) => s.totalVotes > 0)
    .sort((a, b) => b.helpfulnessScore - a.helpfulnessScore)
    .slice(0, limit);
}

/**
 * Update an existing vote (change helpful/not-helpful).
 * Returns true if updated, false if vote not found.
 */
export function updateVote(
  reviewId: string,
  voterId: string,
  helpful: boolean,
): boolean {
  const existing = votes.find(
    (v) => v.reviewId === reviewId && v.voterId === voterId,
  );
  if (!existing) {
    helpLog.info(`Vote update failed — not found: voter=${voterId} review=${reviewId}`);
    return false;
  }

  existing.helpful = helpful;
  helpLog.info(
    `Vote updated: voter=${voterId} review=${reviewId} helpful=${helpful}`,
  );
  return true;
}

/**
 * Get global helpfulness stats.
 */
export function getHelpfulnessStats(): {
  totalVotes: number;
  helpfulVotes: number;
  notHelpfulVotes: number;
  uniqueVoters: number;
  uniqueReviews: number;
} {
  const helpfulVotes = votes.filter((v) => v.helpful).length;
  const notHelpfulVotes = votes.filter((v) => !v.helpful).length;
  const uniqueVoters = new Set(votes.map((v) => v.voterId)).size;
  const uniqueReviews = new Set(votes.map((v) => v.reviewId)).size;

  return {
    totalVotes: votes.length,
    helpfulVotes,
    notHelpfulVotes,
    uniqueVoters,
    uniqueReviews,
  };
}

/**
 * Clear all helpfulness votes. For testing only.
 */
export function clearHelpfulnessVotes(): void {
  votes.length = 0;
  voteIdCounter = 0;
  helpLog.info("All helpfulness votes cleared");
}
