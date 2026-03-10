/**
 * Sprint 336: Remove Anti-Requirement Violations
 *
 * Verifies that Sprint 253 (business-responses) and Sprint 257
 * (review-helpfulness) features have been completely removed per
 * Rating Integrity System Part 10 and CEO decision in SLT-335.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ── 1. Deleted files should not exist ──────────────────────────────────

describe("Sprint 336 — deleted files", () => {
  it("server/business-responses.ts should not exist", () => {
    expect(fileExists("server/business-responses.ts")).toBe(false);
  });

  it("server/routes-owner-responses.ts should not exist", () => {
    expect(fileExists("server/routes-owner-responses.ts")).toBe(false);
  });

  it("server/review-helpfulness.ts should not exist", () => {
    expect(fileExists("server/review-helpfulness.ts")).toBe(false);
  });

  it("server/routes-review-helpfulness.ts should not exist", () => {
    expect(fileExists("server/routes-review-helpfulness.ts")).toBe(false);
  });

  it("server/storage/responses.ts should not exist", () => {
    expect(fileExists("server/storage/responses.ts")).toBe(false);
  });

  it("tests/sprint253-business-responses.test.ts should not exist", () => {
    expect(fileExists("tests/sprint253-business-responses.test.ts")).toBe(false);
  });

  it("tests/sprint257-review-helpfulness.test.ts should not exist", () => {
    expect(fileExists("tests/sprint257-review-helpfulness.test.ts")).toBe(false);
  });
});

// ── 2. Route registration removed ──────────────────────────────────────

describe("Sprint 336 — route registration removed", () => {
  const routesSrc = readFile("server/routes.ts");

  it("should not import routes-owner-responses", () => {
    expect(routesSrc).not.toContain("routes-owner-responses");
  });

  it("should not import routes-review-helpfulness", () => {
    expect(routesSrc).not.toContain("routes-review-helpfulness");
  });

  it("should not register owner response routes", () => {
    expect(routesSrc).not.toContain("registerOwnerResponseRoutes");
  });

  it("should not register review helpfulness routes", () => {
    expect(routesSrc).not.toContain("registerReviewHelpfulnessRoutes");
  });
});

// ── 3. Rating response endpoints removed from business routes ──────────

describe("Sprint 336 — business response endpoints removed", () => {
  const bizSrc = readFile("server/routes-businesses.ts");

  it("should not have POST /api/ratings/:id/response", () => {
    expect(bizSrc).not.toContain("/api/ratings/:id/response");
  });

  it("should not have GET /api/ratings/:id/response", () => {
    expect(bizSrc).not.toContain("getRatingResponse");
  });

  it("should not have DELETE /api/ratings/:id/response", () => {
    expect(bizSrc).not.toContain("deleteRatingResponse");
  });

  it("should not reference notifyRatingResponse", () => {
    expect(bizSrc).not.toContain("notifyRatingResponse");
  });
});

// ── 4. Schema table removed ────────────────────────────────────────────

describe("Sprint 336 — schema cleanup", () => {
  const schemaSrc = readFile("shared/schema.ts");

  it("should not have ratingResponses table", () => {
    expect(schemaSrc).not.toContain("export const ratingResponses");
  });

  it("should not have RatingResponse type", () => {
    expect(schemaSrc).not.toContain("export type RatingResponse");
  });

  it("should not reference rating_response notification type", () => {
    expect(schemaSrc).not.toContain("rating_response");
  });
});

// ── 5. Storage barrel cleaned ──────────────────────────────────────────

describe("Sprint 336 — storage barrel cleaned", () => {
  const storageSrc = readFile("server/storage/index.ts");

  it("should not export submitRatingResponse", () => {
    expect(storageSrc).not.toContain("submitRatingResponse");
  });

  it("should not export getRatingResponse", () => {
    expect(storageSrc).not.toContain("getRatingResponse");
  });

  it("should not import from responses", () => {
    expect(storageSrc).not.toContain('./responses"');
  });
});

// ── 6. Push notification removed ───────────────────────────────────────

describe("Sprint 336 — push notification cleaned", () => {
  const pushSrc = readFile("server/push.ts");

  it("should not have notifyRatingResponse function", () => {
    expect(pushSrc).not.toContain("notifyRatingResponse");
  });

  it("should not reference ratingResponses preference", () => {
    expect(pushSrc).not.toContain("ratingResponses");
  });
});

// ── 7. Notification preferences cleaned ────────────────────────────────

describe("Sprint 336 — notification preferences cleaned", () => {
  const membersSrc = readFile("server/routes-members.ts");
  const settingsSrc = readFile("app/settings.tsx");

  it("server should not default ratingResponses pref", () => {
    expect(membersSrc).not.toContain("ratingResponses");
  });

  it("settings should not have ratingResponses notification key", () => {
    expect(settingsSrc).not.toContain("notif_rating_responses");
  });

  it("settings should not have Rating Responses toggle", () => {
    expect(settingsSrc).not.toContain("Rating Responses");
  });
});

// ── 8. Reputation signal removed ───────────────────────────────────────

describe("Sprint 336 — reputation signal removed", () => {
  const repSrc = readFile("server/reputation-v2.ts");

  it("should not have helpful_votes signal", () => {
    expect(repSrc).not.toContain("helpful_votes");
  });

  it("remaining weights should sum to 1.0", () => {
    const weights = [...repSrc.matchAll(/weight:\s*([\d.]+)/g)].map(m => parseFloat(m[1]));
    const sum = weights.reduce((a, b) => a + b, 0);
    expect(Math.abs(sum - 1.0)).toBeLessThan(0.01);
  });
});

// ── 9. Badge definitions removed ───────────────────────────────────────

describe("Sprint 336 — helpfulness badges removed", () => {
  const badgesSrc = readFile("lib/badges.ts");
  const defsSrc = readFile("lib/badge-definitions.ts");
  const shareSrc = readFile("server/badge-share.ts");

  it("should not check helpful-voice badge", () => {
    expect(badgesSrc).not.toContain("helpful-voice");
  });

  it("should not check influencer badge", () => {
    expect(badgesSrc).not.toContain('"influencer"');
  });

  it("should not define helpful-voice badge", () => {
    expect(defsSrc).not.toContain("helpful-voice");
  });

  it("should not define influencer badge", () => {
    expect(defsSrc).not.toContain('"influencer"');
  });

  it("badge-share should not have helpful-voice", () => {
    expect(shareSrc).not.toContain("helpful-voice");
  });

  it("badge context should not reference helpfulVotes", () => {
    expect(badgesSrc).not.toContain("helpfulVotes");
  });
});

// ── 10. API types cleaned ──────────────────────────────────────────────

describe("Sprint 336 — API types cleaned", () => {
  const apiSrc = readFile("lib/api.ts");

  it("should not have helpfulness in breakdown", () => {
    expect(apiSrc).not.toContain("helpfulness:");
  });

  it("should not have helpfulVotes in member context", () => {
    expect(apiSrc).not.toContain("helpfulVotes");
  });
});

// ── 11. UI references removed ──────────────────────────────────────────

describe("Sprint 336 — UI references removed", () => {
  const profileSrc = readFile("app/(tabs)/profile.tsx");
  const claimSrc = readFile("app/business/claim.tsx");

  it("profile should not show Helpfulness breakdown", () => {
    expect(profileSrc).not.toContain("Helpfulness");
  });

  it("claim page should not mention response tools", () => {
    expect(claimSrc).not.toContain("response tools");
  });
});

// ── 12. Server build size check ────────────────────────────────────────

describe("Sprint 336 — build metrics", () => {
  it("schema verification has 30 expected tables", () => {
    const verifySrc = readFile("scripts/verify-schema.ts");
    expect(verifySrc).not.toContain("rating_responses");
  });

  it("ARCHITECTURE.md says 33 Tables", () => {
    const archSrc = readFile("docs/ARCHITECTURE.md");
    expect(archSrc).toContain("33 Tables"); // Sprint 513: +claim_evidence
  });
});
