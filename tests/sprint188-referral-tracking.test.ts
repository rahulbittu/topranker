/**
 * Sprint 188 — Social Sharing + Referral Tracking
 *
 * Validates:
 * 1. Referrals schema table
 * 2. Referral storage functions
 * 3. Referral API routes
 * 4. Referral route registration
 * 5. Signup referral integration
 * 6. Rating activation integration
 * 7. Client-side referral API (existing lib/sharing.ts)
 * 8. Storage barrel exports
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Referrals schema
// ---------------------------------------------------------------------------
describe("Schema — referrals table", () => {
  const src = readFile("shared/schema.ts");

  it("defines referrals table", () => {
    expect(src).toContain('export const referrals = pgTable(');
  });

  it("has referrerId foreign key", () => {
    expect(src).toContain('referrerId: varchar("referrer_id")');
  });

  it("has referredId foreign key", () => {
    expect(src).toContain('referredId: varchar("referred_id")');
  });

  it("has referralCode field", () => {
    expect(src).toContain('referralCode: text("referral_code")');
  });

  it("has status field with signed_up default", () => {
    expect(src).toContain('.default("signed_up")');
  });

  it("has activatedAt timestamp", () => {
    expect(src).toContain('activatedAt: timestamp("activated_at")');
  });

  it("has unique constraint on referredId", () => {
    expect(src).toContain("uq_referral_referred");
  });

  it("has index on referrerId", () => {
    expect(src).toContain("idx_referral_referrer");
  });

  it("exports Referral type", () => {
    expect(src).toContain("export type Referral");
  });
});

// ---------------------------------------------------------------------------
// 2. Referral storage functions
// ---------------------------------------------------------------------------
describe("Referral storage — CRUD", () => {
  const src = readFile("server/storage/referrals.ts");

  it("exports createReferral", () => {
    expect(src).toContain("export async function createReferral");
  });

  it("exports resolveReferralCode", () => {
    expect(src).toContain("export async function resolveReferralCode");
  });

  it("exports getReferralStats", () => {
    expect(src).toContain("export async function getReferralStats");
  });

  it("exports activateReferral", () => {
    expect(src).toContain("export async function activateReferral");
  });

  it("exports getReferrerForMember", () => {
    expect(src).toContain("export async function getReferrerForMember");
  });

  it("resolveReferralCode looks up by username", () => {
    expect(src).toContain("eq(members.username, username)");
  });

  it("getReferralStats joins with members for display name", () => {
    expect(src).toContain("members.displayName");
    expect(src).toContain("members.username");
  });

  it("activateReferral sets status to activated", () => {
    expect(src).toContain('"activated"');
    expect(src).toContain("activatedAt: new Date()");
  });

  it("only activates signed_up referrals", () => {
    expect(src).toContain('eq(referrals.status, "signed_up")');
  });
});

// ---------------------------------------------------------------------------
// 3. Referral API routes
// ---------------------------------------------------------------------------
describe("Referral routes — endpoints", () => {
  const src = readFile("server/routes-referrals.ts");

  it("exports registerReferralRoutes", () => {
    expect(src).toContain("export function registerReferralRoutes");
  });

  it("has GET /api/referrals/me", () => {
    expect(src).toContain('"/api/referrals/me"');
  });

  it("has GET /api/referrals/validate", () => {
    expect(src).toContain('"/api/referrals/validate"');
  });

  it("requires auth for /me endpoint", () => {
    expect(src).toContain("requireAuth");
  });

  it("generates referral code from username", () => {
    expect(src).toContain("username.toUpperCase()");
  });

  it("generates share URL via config.siteUrl", () => {
    expect(src).toContain("config.siteUrl");
    expect(src).toContain("/join?ref=");
  });

  it("calls getReferralStats", () => {
    expect(src).toContain("getReferralStats");
  });

  it("validate endpoint calls resolveReferralCode", () => {
    expect(src).toContain("resolveReferralCode");
  });
});

// ---------------------------------------------------------------------------
// 4. Route registration
// ---------------------------------------------------------------------------
describe("Route registration — referrals", () => {
  const src = readFile("server/routes.ts");

  it("imports registerReferralRoutes", () => {
    expect(src).toContain('import { registerReferralRoutes } from "./routes-referrals"');
  });

  it("calls registerReferralRoutes(app)", () => {
    expect(src).toContain("registerReferralRoutes(app)");
  });
});

// ---------------------------------------------------------------------------
// 5. Signup referral integration
// ---------------------------------------------------------------------------
describe("Signup — referral tracking", () => {
  const src = readFile("server/routes-auth.ts");

  it("reads referralCode from request body", () => {
    expect(src).toContain("req.body.referralCode");
  });

  it("resolves referral code to referrer ID", () => {
    expect(src).toContain("resolveReferralCode");
  });

  it("creates referral record on signup", () => {
    expect(src).toContain("createReferral(referrerId, member.id, referralCode)");
  });

  it("prevents self-referral", () => {
    expect(src).toContain("referrerId !== member.id");
  });

  it("handles referral tracking errors gracefully", () => {
    expect(src).toContain("Referral tracking failed");
  });
});

// ---------------------------------------------------------------------------
// 6. Rating activation integration
// ---------------------------------------------------------------------------
describe("Rating — referral activation", () => {
  const src = readFile("server/storage/ratings.ts");

  it("activates referral on first rating", () => {
    expect(src).toContain("activateReferral(memberId)");
  });

  it("only activates when totalRatings is 0 (first rating)", () => {
    expect(src).toContain("member.totalRatings === 0");
  });

  it("handles activation errors gracefully", () => {
    expect(src).toContain("activateReferral(memberId).catch");
  });
});

// ---------------------------------------------------------------------------
// 7. Existing sharing infrastructure
// ---------------------------------------------------------------------------
describe("Sharing — existing infrastructure", () => {
  const sharingSrc = readFile("lib/sharing.ts");

  it("exports getShareUrl", () => {
    expect(sharingSrc).toContain("getShareUrl");
  });

  it("exports getShareText", () => {
    expect(sharingSrc).toContain("getShareText");
  });

  it("generates business share URLs", () => {
    expect(sharingSrc).toContain("business");
  });
});

// ---------------------------------------------------------------------------
// 8. Storage barrel exports
// ---------------------------------------------------------------------------
describe("Storage barrel — Sprint 188 exports", () => {
  const indexSrc = readFile("server/storage/index.ts");

  it("exports createReferral", () => {
    expect(indexSrc).toContain("createReferral");
  });

  it("exports resolveReferralCode", () => {
    expect(indexSrc).toContain("resolveReferralCode");
  });

  it("exports getReferralStats", () => {
    expect(indexSrc).toContain("getReferralStats");
  });

  it("exports activateReferral", () => {
    expect(indexSrc).toContain("activateReferral");
  });

  it("exports getReferrerForMember", () => {
    expect(indexSrc).toContain("getReferrerForMember");
  });
});
