/**
 * Sprint 179 — Challenger Push Notifications + Social Sharing
 *
 * Validates:
 * 1. notifyNewChallenger wired into challenge creation
 * 2. closeExpiredChallenges sends push notifications
 * 3. getMembersWithPushTokenByCity helper
 * 4. Challenger social share preview endpoint
 * 5. createChallenge storage function
 * 6. Webhook wiring for challenger_entry payments
 * 7. Storage barrel exports
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Challenge creation triggers notifyNewChallenger
// ---------------------------------------------------------------------------
describe("createChallenge — push notification trigger", () => {
  const challengersSrc = readFile("server/storage/challengers.ts");

  it("exports createChallenge function", () => {
    expect(challengersSrc).toContain("export async function createChallenge");
  });

  it("inserts into challengers table", () => {
    expect(challengersSrc).toContain("db\n    .insert(challengers)");
  });

  it("sets 30-day challenge period", () => {
    expect(challengersSrc).toContain("endDate.setDate(endDate.getDate() + 30)");
  });

  it("sets status to active", () => {
    expect(challengersSrc).toContain('status: "active"');
  });

  it("marks entry fee as paid", () => {
    expect(challengersSrc).toContain("entryFeePaid: true");
  });

  it("calls notifyNewChallenger for city members", () => {
    expect(challengersSrc).toContain("notifyNewChallenger");
    expect(challengersSrc).toContain("getMembersWithPushTokenByCity");
  });

  it("fetches both challenger and defender business names", () => {
    expect(challengersSrc).toContain("challengerBiz");
    expect(challengersSrc).toContain("defenderBiz");
  });

  it("logs challenge creation", () => {
    expect(challengersSrc).toContain("Challenge created:");
  });

  it("catches notification errors gracefully", () => {
    expect(challengersSrc).toContain("Failed to send new challenger notification");
  });
});

// ---------------------------------------------------------------------------
// 2. closeExpiredChallenges sends result notifications
// ---------------------------------------------------------------------------
describe("closeExpiredChallenges — result push notifications", () => {
  const challengersSrc = readFile("server/storage/challengers.ts");

  it("imports notifyChallengerResult", () => {
    expect(challengersSrc).toContain("notifyChallengerResult");
  });

  it("sends push to city members on challenge close", () => {
    expect(challengersSrc).toContain("getMembersWithPushTokenByCity");
    expect(challengersSrc).toContain("cityMembers");
  });

  it("includes winner name in notification", () => {
    expect(challengersSrc).toContain("winnerName");
    expect(challengersSrc).toContain("winnerBiz");
  });

  it("handles draw result", () => {
    expect(challengersSrc).toContain("It's a draw");
  });

  it("catches notification errors without breaking close flow", () => {
    expect(challengersSrc).toContain("Failed to send challenger result notification");
  });

  it("exports closeExpiredChallenges", () => {
    expect(challengersSrc).toContain("export async function closeExpiredChallenges");
  });
});

// ---------------------------------------------------------------------------
// 3. getMembersWithPushTokenByCity helper
// ---------------------------------------------------------------------------
describe("getMembersWithPushTokenByCity", () => {
  const membersSrc = readFile("server/storage/members.ts");

  it("exports the function", () => {
    expect(membersSrc).toContain("export async function getMembersWithPushTokenByCity");
  });

  it("filters by city", () => {
    expect(membersSrc).toContain("eq(members.city, city)");
  });

  it("requires non-null push tokens", () => {
    expect(membersSrc).toContain("isNotNull(members.pushToken)");
  });

  it("has configurable limit defaulting to 500", () => {
    expect(membersSrc).toContain("limit: number = 500");
  });

  it("returns id and pushToken", () => {
    expect(membersSrc).toContain("id: members.id");
    expect(membersSrc).toContain("pushToken: members.pushToken");
  });

  it("filters nulls with type guard", () => {
    expect(membersSrc).toContain("m is { id: string; pushToken: string }");
  });
});

// ---------------------------------------------------------------------------
// 4. Challenger social share preview endpoint
// ---------------------------------------------------------------------------
describe("Challenger social share — routes-seo.ts", () => {
  const seoSrc = readFile("server/routes-seo.ts");

  it("has GET /api/seo/challenger/:id endpoint", () => {
    expect(seoSrc).toContain('"/api/seo/challenger/:id"');
  });

  it("returns Open Graph metadata", () => {
    expect(seoSrc).toContain("og:");
    expect(seoSrc).toContain("title");
    expect(seoSrc).toContain("description");
    expect(seoSrc).toContain("siteName");
    expect(seoSrc).toContain("TopRanker");
  });

  it("constructs VS title format", () => {
    expect(seoSrc).toContain("challengerName} vs ${defenderName}");
  });

  it("calculates days left for active challenges", () => {
    expect(seoSrc).toContain("daysLeft");
    expect(seoSrc).toContain("days left to vote");
  });

  it("handles completed challenges", () => {
    expect(seoSrc).toContain("Challenge complete");
  });

  it("handles draw results", () => {
    expect(seoSrc).toContain("It was a draw");
  });

  it("returns challenge data for client rendering", () => {
    expect(seoSrc).toContain("challengerName");
    expect(seoSrc).toContain("defenderName");
    expect(seoSrc).toContain("totalVotes");
    expect(seoSrc).toContain("winnerId");
  });

  it("returns 404 for unknown challenge", () => {
    expect(seoSrc).toContain("Challenge not found");
  });

  it("includes share URL", () => {
    expect(seoSrc).toContain("challenger?id=");
  });
});

// ---------------------------------------------------------------------------
// 5. Webhook wires challenger creation on payment success
// ---------------------------------------------------------------------------
describe("Stripe webhook — challenger_entry creation", () => {
  const webhookSrc = readFile("server/stripe-webhook.ts");

  it("checks for challenger_entry type in metadata", () => {
    expect(webhookSrc).toContain('metadata.type === "challenger_entry"');
  });

  it("imports createChallenge from storage", () => {
    expect(webhookSrc).toContain("createChallenge");
  });

  it("resolves defender from leaderboard", () => {
    expect(webhookSrc).toContain("getLeaderboard");
    expect(webhookSrc).toContain("defender");
  });

  it("uses challengerId from payment metadata", () => {
    expect(webhookSrc).toContain("metadata.challengerId");
  });

  it("logs challenger record creation", () => {
    expect(webhookSrc).toContain("Challenger record created for PI:");
  });

  it("catches creation errors", () => {
    expect(webhookSrc).toContain("Failed to create challenger record");
  });
});

// ---------------------------------------------------------------------------
// 6. Storage barrel exports Sprint 179 additions
// ---------------------------------------------------------------------------
describe("Storage barrel — Sprint 179 exports", () => {
  const indexSrc = readFile("server/storage/index.ts");

  it("exports createChallenge", () => {
    expect(indexSrc).toContain("createChallenge");
  });

  it("exports closeExpiredChallenges", () => {
    expect(indexSrc).toContain("closeExpiredChallenges");
  });

  it("exports getMembersWithPushTokenByCity", () => {
    expect(indexSrc).toContain("getMembersWithPushTokenByCity");
  });
});

// ---------------------------------------------------------------------------
// 7. Push module has notifyNewChallenger and notifyChallengerResult
// ---------------------------------------------------------------------------
describe("Push module — challenger functions", () => {
  const pushSrc = readFile("server/push.ts");

  it("exports notifyNewChallenger", () => {
    expect(pushSrc).toContain("export async function notifyNewChallenger");
  });

  it("notifyNewChallenger accepts city user IDs and tokens", () => {
    expect(pushSrc).toContain("cityUserIds: string[]");
    expect(pushSrc).toContain("cityTokens: string[]");
  });

  it("notifyNewChallenger checks newChallengers preference", () => {
    expect(pushSrc).toContain("prefs.newChallengers === false");
  });

  it("exports notifyChallengerResult", () => {
    expect(pushSrc).toContain("export async function notifyChallengerResult");
  });
});
