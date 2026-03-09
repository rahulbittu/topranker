/**
 * Sprint 192 — Client-side Referral UI + Onboarding Polish
 *
 * Validates:
 * 1. Referral API types and fetch functions in lib/api.ts
 * 2. Referral screen uses live data (useQuery, not useState mock)
 * 3. Referral screen displays activated count
 * 4. Referral network list UI
 * 5. Validate referral code API function
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Referral API types and functions
// ---------------------------------------------------------------------------
describe("lib/api.ts — Referral API", () => {
  const src = readFile("lib/api.ts");

  it("exports ReferralEntry interface", () => {
    expect(src).toContain("export interface ReferralEntry");
  });

  it("ReferralEntry has referredId", () => {
    expect(src).toContain("referredId: string");
  });

  it("ReferralEntry has displayName", () => {
    expect(src).toContain("displayName: string");
  });

  it("ReferralEntry has status", () => {
    expect(src).toContain("status: string");
  });

  it("exports ReferralStats interface", () => {
    expect(src).toContain("export interface ReferralStats");
  });

  it("ReferralStats has code", () => {
    expect(src).toContain("code: string");
  });

  it("ReferralStats has shareUrl", () => {
    expect(src).toContain("shareUrl: string");
  });

  it("ReferralStats has totalReferred", () => {
    expect(src).toContain("totalReferred: number");
  });

  it("ReferralStats has activated count", () => {
    expect(src).toContain("activated: number");
  });

  it("ReferralStats has referrals array", () => {
    expect(src).toContain("referrals: ReferralEntry[]");
  });

  it("exports fetchReferralStats function", () => {
    expect(src).toContain("export async function fetchReferralStats");
  });

  it("fetchReferralStats calls /api/referrals/me", () => {
    expect(src).toContain('"/api/referrals/me"');
  });

  it("exports validateReferralCode function", () => {
    expect(src).toContain("export async function validateReferralCode");
  });

  it("validateReferralCode calls /api/referrals/validate", () => {
    expect(src).toContain("/api/referrals/validate");
  });
});

// ---------------------------------------------------------------------------
// 2. Referral screen uses live data
// ---------------------------------------------------------------------------
describe("app/referral.tsx — Live data integration", () => {
  const src = readFile("app/referral.tsx");

  it("imports useQuery from react-query", () => {
    expect(src).toContain("useQuery");
    expect(src).toContain("@tanstack/react-query");
  });

  it("imports fetchReferralStats", () => {
    expect(src).toContain("fetchReferralStats");
  });

  it("imports ReferralStats type", () => {
    expect(src).toContain("ReferralStats");
  });

  it("uses useQuery to fetch referral data", () => {
    expect(src).toContain('queryKey: ["/api/referrals/me"]');
    expect(src).toContain("queryFn: fetchReferralStats");
  });

  it("does NOT use useState for mock referralCount", () => {
    expect(src).not.toContain("useState(0)");
  });

  it("reads referralCode from stats", () => {
    expect(src).toContain("stats?.code");
  });

  it("reads referralLink from stats", () => {
    expect(src).toContain("stats?.shareUrl");
  });

  it("reads referralCount from stats", () => {
    expect(src).toContain("stats?.totalReferred");
  });
});

// ---------------------------------------------------------------------------
// 3. Activated count display
// ---------------------------------------------------------------------------
describe("app/referral.tsx — Activated referrals", () => {
  const src = readFile("app/referral.tsx");

  it("shows activated count", () => {
    expect(src).toContain("activatedCount");
    expect(src).toContain("stats?.activated");
  });

  it("labels activated as 'started rating'", () => {
    expect(src).toContain("started rating");
  });

  it("shows loading indicator while fetching", () => {
    expect(src).toContain("ActivityIndicator");
    expect(src).toContain("isLoading");
  });

  it("displays stats in two-column layout", () => {
    expect(src).toContain("statsRow");
    expect(src).toContain("statsDivider");
  });
});

// ---------------------------------------------------------------------------
// 4. Referral network list
// ---------------------------------------------------------------------------
describe("app/referral.tsx — Referral network list", () => {
  const src = readFile("app/referral.tsx");

  it("renders referral list from stats.referrals", () => {
    expect(src).toContain("stats?.referrals");
    expect(src).toContain("stats.referrals.map");
  });

  it("shows referral display name", () => {
    expect(src).toContain("ref.displayName");
  });

  it("shows referral username", () => {
    expect(src).toContain("ref.username");
  });

  it("shows referral status", () => {
    expect(src).toContain('ref.status === "activated"');
  });

  it("shows checkmark for activated referrals", () => {
    expect(src).toContain("checkmark-circle");
  });

  it("shows time icon for pending referrals", () => {
    expect(src).toContain("time-outline");
  });

  it("has referral avatar with first letter", () => {
    expect(src).toContain("ref.displayName?.charAt(0)");
  });

  it("section titled 'Your Referral Network'", () => {
    expect(src).toContain("Your Referral Network");
  });
});

// ---------------------------------------------------------------------------
// 5. Stale time and query config
// ---------------------------------------------------------------------------
describe("app/referral.tsx — Query configuration", () => {
  const src = readFile("app/referral.tsx");

  it("sets staleTime for referral query", () => {
    expect(src).toContain("staleTime: 60_000");
  });

  it("only fetches when user is authenticated", () => {
    expect(src).toContain("enabled: !!user");
  });
});
