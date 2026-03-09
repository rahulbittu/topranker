/**
 * Sprint 238 — Business Claim Verification Workflow
 *
 * Validates:
 * 1. Claim verification static (12 tests) — file exists, exports, constants, types
 * 2. Claim verification runtime (14 tests) — create, verify, query, reject, stats, clear
 * 3. Admin claim routes static (8 tests) — file exists, endpoints, export
 * 4. Integration (4 tests) — routes.ts wiring, claim-verification imports logger
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  createClaimRequest,
  verifyClaimCode,
  getClaimStatus,
  getPendingClaims,
  getClaimsByBusiness,
  getClaimsByMember,
  rejectClaim,
  getClaimStats,
  clearClaims,
  MAX_CLAIMS,
} from "../server/claim-verification";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. Claim verification — static checks
// ---------------------------------------------------------------------------
describe("Claim verification — static checks", () => {
  const src = readFile("server/claim-verification.ts");

  it("claim-verification.ts exists", () => {
    expect(fileExists("server/claim-verification.ts")).toBe(true);
  });

  it("exports createClaimRequest", () => {
    expect(src).toContain("export function createClaimRequest");
  });

  it("exports verifyClaimCode", () => {
    expect(src).toContain("export function verifyClaimCode");
  });

  it("exports getClaimStatus", () => {
    expect(src).toContain("export function getClaimStatus");
  });

  it("exports getPendingClaims", () => {
    expect(src).toContain("export function getPendingClaims");
  });

  it("exports getClaimsByBusiness", () => {
    expect(src).toContain("export function getClaimsByBusiness");
  });

  it("exports getClaimsByMember", () => {
    expect(src).toContain("export function getClaimsByMember");
  });

  it("exports rejectClaim", () => {
    expect(src).toContain("export function rejectClaim");
  });

  it("exports getClaimStats", () => {
    expect(src).toContain("export function getClaimStats");
  });

  it("exports clearClaims", () => {
    expect(src).toContain("export function clearClaims");
  });

  it("uses logger with ClaimVerification tag", () => {
    expect(src).toContain('log.tag("ClaimVerification")');
  });

  it("MAX_CLAIMS is 1000", () => {
    expect(MAX_CLAIMS).toBe(1000);
  });
});

// ---------------------------------------------------------------------------
// 2. Claim verification — runtime
// ---------------------------------------------------------------------------
describe("Claim verification — runtime", () => {
  beforeEach(() => {
    clearClaims();
  });

  it("createClaimRequest returns a valid ClaimRequest", () => {
    const claim = createClaimRequest("biz-1", "member-1", "email");
    expect(claim).toBeDefined();
    expect(claim.id).toBeTruthy();
    expect(claim.businessId).toBe("biz-1");
    expect(claim.memberId).toBe("member-1");
    expect(claim.method).toBe("email");
    expect(claim.status).toBe("pending");
    expect(claim.verificationCode).toHaveLength(6);
    expect(claim.attempts).toBe(0);
    expect(claim.maxAttempts).toBe(3);
    expect(claim.createdAt).toBeTruthy();
    expect(claim.expiresAt).toBeTruthy();
  });

  it("createClaimRequest returns existing pending claim for same business+member", () => {
    const claim1 = createClaimRequest("biz-1", "member-1", "email");
    const claim2 = createClaimRequest("biz-1", "member-1", "phone");
    expect(claim2.id).toBe(claim1.id);
  });

  it("createClaimRequest creates separate claims for different businesses", () => {
    const claim1 = createClaimRequest("biz-1", "member-1", "email");
    const claim2 = createClaimRequest("biz-2", "member-1", "email");
    expect(claim2.id).not.toBe(claim1.id);
  });

  it("verifyClaimCode succeeds with correct code", () => {
    const claim = createClaimRequest("biz-1", "member-1", "email");
    const result = verifyClaimCode(claim.id, claim.verificationCode);
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    expect(getClaimStatus(claim.id)!.status).toBe("verified");
  });

  it("verifyClaimCode fails with wrong code", () => {
    const claim = createClaimRequest("biz-1", "member-1", "email");
    const result = verifyClaimCode(claim.id, "000000");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid verification code");
    expect(getClaimStatus(claim.id)!.attempts).toBe(1);
  });

  it("verifyClaimCode rejects after max attempts", () => {
    const claim = createClaimRequest("biz-1", "member-1", "email");
    verifyClaimCode(claim.id, "000000");
    verifyClaimCode(claim.id, "000001");
    const result = verifyClaimCode(claim.id, "000002");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Maximum verification attempts exceeded");
    expect(getClaimStatus(claim.id)!.status).toBe("rejected");
  });

  it("verifyClaimCode returns error for non-existent claim", () => {
    const result = verifyClaimCode("non-existent", "123456");
    expect(result.success).toBe(false);
    expect(result.error).toContain("not found");
  });

  it("getPendingClaims returns only pending claims", () => {
    createClaimRequest("biz-1", "member-1", "email");
    createClaimRequest("biz-2", "member-2", "phone");
    const claim3 = createClaimRequest("biz-3", "member-3", "document");
    verifyClaimCode(claim3.id, claim3.verificationCode);

    const pending = getPendingClaims();
    expect(pending).toHaveLength(2);
    expect(pending.every(c => c.status === "pending")).toBe(true);
  });

  it("getClaimsByBusiness returns claims for a specific business", () => {
    createClaimRequest("biz-1", "member-1", "email");
    createClaimRequest("biz-1", "member-2", "phone");
    createClaimRequest("biz-2", "member-3", "document");

    const bizClaims = getClaimsByBusiness("biz-1");
    expect(bizClaims).toHaveLength(2);
    expect(bizClaims.every(c => c.businessId === "biz-1")).toBe(true);
  });

  it("getClaimsByMember returns claims for a specific member", () => {
    createClaimRequest("biz-1", "member-1", "email");
    createClaimRequest("biz-2", "member-1", "phone");
    createClaimRequest("biz-3", "member-2", "document");

    const memberClaims = getClaimsByMember("member-1");
    expect(memberClaims).toHaveLength(2);
    expect(memberClaims.every(c => c.memberId === "member-1")).toBe(true);
  });

  it("rejectClaim changes status to rejected", () => {
    const claim = createClaimRequest("biz-1", "member-1", "email");
    const result = rejectClaim(claim.id, "Fraudulent claim");
    expect(result).toBe(true);
    expect(getClaimStatus(claim.id)!.status).toBe("rejected");
  });

  it("rejectClaim returns false for non-pending claim", () => {
    const claim = createClaimRequest("biz-1", "member-1", "email");
    verifyClaimCode(claim.id, claim.verificationCode);
    expect(rejectClaim(claim.id)).toBe(false);
  });

  it("getClaimStats returns correct counts", () => {
    const c1 = createClaimRequest("biz-1", "member-1", "email");
    createClaimRequest("biz-2", "member-2", "phone");
    const c3 = createClaimRequest("biz-3", "member-3", "document");
    verifyClaimCode(c1.id, c1.verificationCode); // verified
    rejectClaim(c3.id); // rejected

    const stats = getClaimStats();
    expect(stats.total).toBe(3);
    expect(stats.verified).toBe(1);
    expect(stats.rejected).toBe(1);
    expect(stats.pending).toBe(1);
  });

  it("clearClaims empties all claims", () => {
    createClaimRequest("biz-1", "member-1", "email");
    createClaimRequest("biz-2", "member-2", "phone");
    clearClaims();
    expect(getClaimStats().total).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 3. Admin claim routes — static checks
// ---------------------------------------------------------------------------
describe("Admin claim routes — static checks", () => {
  const src = readFile("server/routes-admin-claims-verification.ts");

  it("routes-admin-claims-verification.ts exists", () => {
    expect(fileExists("server/routes-admin-claims-verification.ts")).toBe(true);
  });

  it("exports registerAdminClaimVerificationRoutes", () => {
    expect(src).toContain("export function registerAdminClaimVerificationRoutes");
  });

  it("defines GET /api/admin/claims/pending", () => {
    expect(src).toContain("/api/admin/claims/pending");
  });

  it("defines GET /api/admin/claims/stats", () => {
    expect(src).toContain("/api/admin/claims/stats");
  });

  it("defines GET /api/admin/claims/:id", () => {
    expect(src).toContain("/api/admin/claims/:id");
  });

  it("defines GET /api/admin/claims/business/:businessId", () => {
    expect(src).toContain("/api/admin/claims/business/:businessId");
  });

  it("defines POST /api/admin/claims/:id/reject", () => {
    expect(src).toContain("/api/admin/claims/:id/reject");
  });

  it("uses logger with AdminClaimVerify tag", () => {
    expect(src).toContain('log.tag("AdminClaimVerify")');
  });
});

// ---------------------------------------------------------------------------
// 4. Integration
// ---------------------------------------------------------------------------
describe("Integration — claim verification wiring", () => {
  const routesSrc = readFile("server/routes.ts");
  const claimSrc = readFile("server/claim-verification.ts");
  const adminSrc = readFile("server/routes-admin-claims-verification.ts");

  it("routes.ts imports routes-admin-claims-verification", () => {
    expect(routesSrc).toContain('from "./routes-admin-claims-verification"');
  });

  it("routes.ts calls registerAdminClaimVerificationRoutes", () => {
    expect(routesSrc).toContain("registerAdminClaimVerificationRoutes(app)");
  });

  it("claim-verification.ts imports logger", () => {
    expect(claimSrc).toContain('from "./logger"');
  });

  it("admin routes import from claim-verification", () => {
    expect(adminSrc).toContain('from "./claim-verification"');
  });
});
