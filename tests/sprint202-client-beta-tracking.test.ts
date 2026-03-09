/**
 * Sprint 202 — Client-Side Beta Tracking
 *
 * Validates:
 * 1. Beta event types in client analytics
 * 2. Beta convenience functions
 * 3. Join page tracking integration
 * 4. Signup referral tracking integration
 * 5. Referral share tracking integration
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Beta event types in client analytics
// ---------------------------------------------------------------------------
describe("Beta event types — lib/analytics.ts", () => {
  const src = readFile("lib/analytics.ts");

  it("defines beta_join_page_view event", () => {
    expect(src).toContain('"beta_join_page_view"');
  });

  it("defines beta_join_cta_tap event", () => {
    expect(src).toContain('"beta_join_cta_tap"');
  });

  it("defines beta_signup_with_referral event", () => {
    expect(src).toContain('"beta_signup_with_referral"');
  });

  it("defines beta_referral_share event", () => {
    expect(src).toContain('"beta_referral_share"');
  });
});

// ---------------------------------------------------------------------------
// 2. Beta convenience functions
// ---------------------------------------------------------------------------
describe("Beta convenience functions — lib/analytics.ts", () => {
  const src = readFile("lib/analytics.ts");

  it("has betaJoinPageView function", () => {
    expect(src).toContain("betaJoinPageView:");
  });

  it("betaJoinPageView accepts optional referral code", () => {
    expect(src).toContain("referralCode?: string");
  });

  it("has betaJoinCtaTap function", () => {
    expect(src).toContain("betaJoinCtaTap:");
  });

  it("has betaSignupWithReferral function", () => {
    expect(src).toContain("betaSignupWithReferral:");
  });

  it("has betaReferralShare function", () => {
    expect(src).toContain("betaReferralShare:");
  });

  it("tracks referral_code in properties", () => {
    expect(src).toContain("referral_code:");
  });
});

// ---------------------------------------------------------------------------
// 3. Join page tracking
// ---------------------------------------------------------------------------
describe("Join page tracking — app/join.tsx", () => {
  const src = readFile("app/join.tsx");

  it("imports Analytics", () => {
    expect(src).toContain("Analytics");
    expect(src).toContain("@/lib/analytics");
  });

  it("tracks page view on mount", () => {
    expect(src).toContain("Analytics.betaJoinPageView");
  });

  it("tracks CTA tap", () => {
    expect(src).toContain("Analytics.betaJoinCtaTap");
  });

  it("passes referral code to tracking", () => {
    expect(src).toContain("betaJoinPageView(referralCode)");
    expect(src).toContain("betaJoinCtaTap(referralCode)");
  });
});

// ---------------------------------------------------------------------------
// 4. Signup referral tracking
// ---------------------------------------------------------------------------
describe("Signup referral tracking — app/auth/signup.tsx", () => {
  const src = readFile("app/auth/signup.tsx");

  it("imports Analytics", () => {
    expect(src).toContain("Analytics");
    expect(src).toContain("@/lib/analytics");
  });

  it("tracks signup completion", () => {
    expect(src).toContain('Analytics.signupComplete("email")');
  });

  it("tracks beta signup with referral code", () => {
    expect(src).toContain("Analytics.betaSignupWithReferral(referralParam)");
  });

  it("only tracks referral when code present", () => {
    expect(src).toContain("if (referralParam)");
  });
});

// ---------------------------------------------------------------------------
// 5. Referral share tracking
// ---------------------------------------------------------------------------
describe("Referral share tracking — app/referral.tsx", () => {
  const src = readFile("app/referral.tsx");

  it("tracks beta referral share", () => {
    expect(src).toContain("Analytics.betaReferralShare");
  });

  it("includes share method", () => {
    expect(src).toContain('"share_sheet"');
  });
});
