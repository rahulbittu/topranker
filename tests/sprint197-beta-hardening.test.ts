/**
 * Sprint 197 — Beta Hardening: Bug Fixes + Invite Tracking
 *
 * Validates:
 * 1. Password validation consistency (client ↔ server)
 * 2. Demo credentials hidden in production
 * 3. updateMemberStats query consolidation
 * 4. Beta invite tracking (schema + storage + routes)
 * 5. Signup marks beta invite as joined
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Password validation consistency
// ---------------------------------------------------------------------------
describe("Password validation — client matches server", () => {
  const signup = readFile("app/auth/signup.tsx");
  const auth = readFile("server/routes-auth.ts");

  it("client requires 8+ character password", () => {
    expect(signup).toContain("password.length < 8");
    expect(signup).not.toContain("password.length < 6");
  });

  it("server requires 8+ character password on signup", () => {
    expect(auth).toContain("password.length < 8");
  });

  it("client requires at least one number", () => {
    expect(signup).toContain("/\\d/.test(password)");
  });

  it("server requires at least one number", () => {
    expect(auth).toContain("/\\d/.test(password)");
  });

  it("client shows helpful error message", () => {
    expect(signup).toContain("at least 8 characters");
    expect(signup).toContain("at least one number");
  });
});

// ---------------------------------------------------------------------------
// 2. Demo credentials hidden in production
// ---------------------------------------------------------------------------
describe("Demo credentials — hidden in production", () => {
  const login = readFile("app/auth/login.tsx");

  it("demo hint is gated behind __DEV__", () => {
    expect(login).toContain("__DEV__");
  });

  it("demo hint is conditionally rendered", () => {
    expect(login).toContain("{__DEV__ && (");
  });

  it("still shows demo credentials in dev mode", () => {
    expect(login).toContain("alex@demo.com");
    expect(login).toContain("demo123");
  });
});

// ---------------------------------------------------------------------------
// 3. updateMemberStats query consolidation
// ---------------------------------------------------------------------------
describe("updateMemberStats — query consolidation", () => {
  const members = readFile("server/storage/members.ts");

  it("uses Promise.all for parallel queries", () => {
    expect(members).toContain("Promise.all");
  });

  it("uses countDistinct for distinct businesses", () => {
    expect(members).toContain("countDistinct");
    expect(members).toContain("countDistinct(ratings.businessId)");
  });

  it("imports countDistinct from drizzle-orm", () => {
    expect(members).toContain("countDistinct");
  });

  it("computes aggregate stats in one query", () => {
    expect(members).toContain("totalRatings: count()");
    expect(members).toContain("distinctBusinesses: countDistinct(ratings.businessId)");
  });

  it("still calculates variance correctly", () => {
    expect(members).toContain("memberRatings.length > 1");
    expect(members).toContain("Math.sqrt");
  });

  it("mentions sprint 197 consolidation", () => {
    expect(members).toContain("Sprint 197");
    expect(members).toContain("Consolidated");
  });
});

// ---------------------------------------------------------------------------
// 4. Beta invite tracking schema
// ---------------------------------------------------------------------------
describe("Beta invite tracking — schema", () => {
  const schema = readFile("shared/schema.ts");

  it("defines betaInvites table", () => {
    expect(schema).toContain("betaInvites");
    expect(schema).toContain("beta_invites");
  });

  it("has email, displayName, referralCode columns", () => {
    expect(schema).toContain('"email"');
    expect(schema).toContain('"display_name"');
    expect(schema).toContain('"referral_code"');
  });

  it("has status tracking (sent, joined, expired)", () => {
    expect(schema).toContain('"status"');
    expect(schema).toContain("sent");
    expect(schema).toContain("joined");
  });

  it("has invitedBy field", () => {
    expect(schema).toContain('"invited_by"');
  });

  it("has joinedAt and memberId for linking", () => {
    expect(schema).toContain('"joined_at"');
    expect(schema).toContain('"member_id"');
  });

  it("has unique constraint on email", () => {
    expect(schema).toContain("uq_beta_invite_email");
  });

  it("exports BetaInvite type", () => {
    expect(schema).toContain("export type BetaInvite");
  });
});

// ---------------------------------------------------------------------------
// 5. Beta invite storage
// ---------------------------------------------------------------------------
describe("Beta invite tracking — storage", () => {
  const storage = readFile("server/storage/beta-invites.ts");

  it("exists with Sprint 197 header", () => {
    expect(storage).toContain("Sprint 197");
  });

  it("exports createBetaInvite", () => {
    expect(storage).toContain("export async function createBetaInvite");
  });

  it("exports getBetaInviteByEmail", () => {
    expect(storage).toContain("export async function getBetaInviteByEmail");
  });

  it("exports markBetaInviteJoined", () => {
    expect(storage).toContain("export async function markBetaInviteJoined");
  });

  it("exports getBetaInviteStats", () => {
    expect(storage).toContain("export async function getBetaInviteStats");
  });

  it("markBetaInviteJoined sets status and memberId", () => {
    expect(storage).toContain('status: "joined"');
    expect(storage).toContain("memberId");
  });

  it("getBetaInviteStats returns total, joined, pending", () => {
    expect(storage).toContain("total:");
    expect(storage).toContain("joined");
    expect(storage).toContain("pending:");
  });
});

// ---------------------------------------------------------------------------
// 6. Beta invite storage barrel export
// ---------------------------------------------------------------------------
describe("Beta invite — storage barrel", () => {
  const index = readFile("server/storage/index.ts");

  it("exports beta invite functions", () => {
    expect(index).toContain("createBetaInvite");
    expect(index).toContain("getBetaInviteByEmail");
    expect(index).toContain("markBetaInviteJoined");
    expect(index).toContain("getBetaInviteStats");
  });

  it("imports from beta-invites module", () => {
    expect(index).toContain("./beta-invites");
  });
});

// ---------------------------------------------------------------------------
// 7. Admin invite tracking endpoint
// ---------------------------------------------------------------------------
describe("Admin invite tracking — routes-admin.ts", () => {
  const routes = readFile("server/routes-admin.ts");

  it("has GET /api/admin/beta-invites endpoint", () => {
    expect(routes).toContain('"/api/admin/beta-invites"');
  });

  it("single invite records to database", () => {
    expect(routes).toContain("createBetaInvite");
  });

  it("prevents duplicate invites", () => {
    expect(routes).toContain("getBetaInviteByEmail");
    expect(routes).toContain("already sent");
  });

  it("batch invite also tracks in database", () => {
    // Both single and batch use createBetaInvite
    const createCount = (routes.match(/createBetaInvite/g) || []).length;
    expect(createCount).toBeGreaterThanOrEqual(2);
  });

  it("batch prevents duplicate invites", () => {
    expect(routes).toContain("already invited");
  });
});

// ---------------------------------------------------------------------------
// 8. Signup marks beta invite as joined
// ---------------------------------------------------------------------------
describe("Signup — marks beta invite as joined", () => {
  const auth = readFile("server/routes-auth.ts");

  it("calls markBetaInviteJoined after signup", () => {
    expect(auth).toContain("markBetaInviteJoined");
  });

  it("is non-blocking (fire and forget)", () => {
    expect(auth).toContain("markBetaInviteJoined(email, member.id).catch");
  });

  it("mentions Sprint 197", () => {
    expect(auth).toContain("Sprint 197");
  });
});
