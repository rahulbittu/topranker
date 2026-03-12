/**
 * Sprint 196 — Beta Invite Wave 1 + Landing Page
 *
 * Validates:
 * 1. Beta invite email template in email.ts
 * 2. Admin beta invite endpoint (single + batch)
 * 3. Join landing page with referral code support
 * 4. Signup referral code passthrough
 * 5. Auth context referralCode support
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Beta invite email
// ---------------------------------------------------------------------------
describe("Beta invite email — server/email.ts", () => {
  const src = readFile("server/email.ts");

  it("exports sendBetaInviteEmail function", () => {
    expect(src).toContain("export async function sendBetaInviteEmail");
  });

  it("accepts email, displayName, referralCode params", () => {
    expect(src).toContain("email: string");
    expect(src).toContain("displayName: string");
    expect(src).toContain("referralCode: string");
  });

  it("generates join URL with referral code", () => {
    expect(src).toContain("topranker.io/join?ref=");
  });

  it("includes branded HTML template with navy header", () => {
    expect(src).toContain("#0D1B2A");
    expect(src).toContain("BETA INVITATION");
    expect(src).toContain("Welcome to TopRanker");
  });

  it("includes amber CTA button", () => {
    expect(src).toContain("#C49A1A");
    expect(src).toContain("Join the Beta");
  });

  it("handles invitedBy context", () => {
    expect(src).toContain("invitedBy?");
    expect(src).toContain("great addition to our trust network");
    expect(src).toContain("first 25 beta testers");
  });

  it("includes plain text fallback", () => {
    expect(src).toContain("const text = `Hi ${firstName}");
  });

  it("displays referral code in email", () => {
    expect(src).toContain("Your referral code:");
  });

  it("describes trust-weighted concept", () => {
    expect(src).toContain("trustworthy restaurant rankings");
    expect(src).toContain("no fake reviews");
  });
});

// ---------------------------------------------------------------------------
// 2. Admin beta invite endpoint
// ---------------------------------------------------------------------------
describe("Admin beta invite endpoint — server/routes-admin.ts", () => {
  const src = readFile("server/routes-admin.ts");

  it("has POST /api/admin/beta-invite endpoint", () => {
    expect(src).toContain('"/api/admin/beta-invite"');
    expect(src).toContain("app.post");
  });

  it("requires auth and admin", () => {
    expect(src).toContain("requireAuth, requireAdmin");
  });

  it("validates email and displayName", () => {
    expect(src).toContain("email and displayName are required");
  });

  it("prevents duplicate invites to existing members", () => {
    expect(src).toContain("getMemberByEmail");
    expect(src).toContain("already has an account");
  });

  it("imports sendBetaInviteEmail", () => {
    expect(src).toContain('sendBetaInviteEmail');
  });

  it("sanitizes input", () => {
    expect(src).toContain("sanitizeString(req.body.email");
    expect(src).toContain("sanitizeString(req.body.displayName");
  });

  it("defaults referral code to BETA25", () => {
    expect(src).toContain('"BETA25"');
  });

  it("returns sent status", () => {
    expect(src).toContain("sent: true");
  });
});

// ---------------------------------------------------------------------------
// 3. Batch beta invite endpoint
// ---------------------------------------------------------------------------
describe("Batch beta invite — server/routes-admin.ts", () => {
  const src = readFile("server/routes-admin.ts");

  it("has POST /api/admin/beta-invite/batch endpoint", () => {
    expect(src).toContain('"/api/admin/beta-invite/batch"');
  });

  it("limits batch to 100 invites", () => {
    expect(src).toContain("invites.length > 100");
  });

  it("validates array input", () => {
    expect(src).toContain("Array.isArray(invites)");
    expect(src).toContain("1-100 entries");
  });

  it("skips existing members", () => {
    expect(src).toContain("already registered");
  });

  it("reports per-invite results", () => {
    expect(src).toContain('status: "sent"');
    expect(src).toContain('status: "skipped"');
  });

  it("returns summary counts", () => {
    expect(src).toContain("total:");
    expect(src).toContain("sent,");
    expect(src).toContain("skipped:");
  });
});

// ---------------------------------------------------------------------------
// 4. Join landing page
// ---------------------------------------------------------------------------
describe("Join landing page — app/join.tsx", () => {
  const src = readFile("app/join.tsx");

  it("exists and is a React component", () => {
    expect(src).toContain("export default function JoinScreen");
  });

  it("reads ref query param", () => {
    expect(src).toContain("useLocalSearchParams");
    expect(src).toContain("ref?");
  });

  it("shows beta badge", () => {
    expect(src).toContain("BETA");
  });

  it("shows trust pitch", () => {
    expect(src).toContain("Trust-Weighted Rankings");
    expect(src).toContain("No fake reviews");
    expect(src).toContain("pay-to-play");
  });

  it("displays referral code when present", () => {
    expect(src).toContain("referralCode");
    expect(src).toContain("Invited with code:");
  });

  it("has value propositions", () => {
    expect(src).toContain("Credibility Matters");
    expect(src).toContain("Real Rankings");
    expect(src).toContain("Community Driven");
  });

  it("navigates to signup with referral code", () => {
    expect(src).toContain("/auth/signup");
    expect(src).toContain("ref=");
  });

  it("has login link for existing users", () => {
    expect(src).toContain("/auth/login");
    expect(src).toContain("Already have an account");
  });

  it("redirects logged-in users to home", () => {
    expect(src).toContain("useAuth");
    expect(src).toContain('router.replace("/(tabs)")');
  });

  it("uses brand colors", () => {
    expect(src).toContain("BRAND.colors.amber");
    expect(src).toContain("#0D1B2A");
  });

  it("mentions founding beta testers", () => {
    expect(src).toContain("25 founding beta testers");
  });
});

// ---------------------------------------------------------------------------
// 5. Signup referral code passthrough
// ---------------------------------------------------------------------------
describe("Signup referral passthrough — app/auth/signup.tsx", () => {
  const src = readFile("app/auth/signup.tsx");

  it("reads ref query param", () => {
    expect(src).toContain("useLocalSearchParams");
    expect(src).toContain("referralParam");
  });

  it("passes referralCode to signup function", () => {
    expect(src).toContain("referralCode: referralParam");
  });
});

// ---------------------------------------------------------------------------
// 6. Auth context referralCode support
// ---------------------------------------------------------------------------
describe("Auth context — lib/auth-context.tsx", () => {
  const src = readFile("lib/auth-context.tsx");

  it("signup type includes referralCode", () => {
    expect(src).toContain("referralCode?: string");
  });
});

// ---------------------------------------------------------------------------
// 7. Server auth route accepts referralCode
// ---------------------------------------------------------------------------
describe("Server signup route — server/routes-auth.ts", () => {
  const src = readFile("server/routes-auth.ts");

  it("reads referralCode from request body", () => {
    expect(src).toContain("req.body.referralCode");
  });

  it("resolves referral code to referrer", () => {
    expect(src).toContain("resolveReferralCode");
  });

  it("creates referral record", () => {
    expect(src).toContain("createReferral");
  });
});
