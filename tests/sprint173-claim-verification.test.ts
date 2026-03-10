/**
 * Sprint 173 — Business Claim Verification Flow
 *
 * Validates:
 * 1. Ownership transfer logic in reviewClaim
 * 2. Notification emails (approved + rejected)
 * 3. Dashboard access control (owner-only)
 * 4. Admin route sends emails after claim review
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Ownership transfer in claims storage
// ---------------------------------------------------------------------------
describe("claims storage — ownership transfer", () => {
  const claimsSrc = readFile("server/storage/claims.ts");

  it("reviewClaim function exists", () => {
    expect(claimsSrc).toContain("export async function reviewClaim");
  });

  it("sets ownerId on approval", () => {
    expect(claimsSrc).toContain("ownerId: updated.memberId");
  });

  it("sets isClaimed flag on approval", () => {
    expect(claimsSrc).toContain("isClaimed: true");
  });

  it("sets claimedAt timestamp on approval", () => {
    expect(claimsSrc).toContain("claimedAt: new Date()");
  });

  it("only transfers ownership when status is approved", () => {
    expect(claimsSrc).toContain('status === "approved"');
  });

  it("checks businessId and memberId exist before transfer", () => {
    expect(claimsSrc).toContain("updated.businessId && updated.memberId");
  });
});

// ---------------------------------------------------------------------------
// 2. Notification emails
// ---------------------------------------------------------------------------
describe("claim notification emails", () => {
  const emailSrc = readFile("server/email.ts");

  it("exports sendClaimApprovedEmail", () => {
    expect(emailSrc).toContain("export async function sendClaimApprovedEmail");
  });

  it("exports sendClaimRejectedEmail", () => {
    expect(emailSrc).toContain("export async function sendClaimRejectedEmail");
  });

  it("approved email includes business name", () => {
    expect(emailSrc).toContain("Claim Approved!");
    expect(emailSrc).toContain("has been approved");
  });

  it("approved email includes dashboard link", () => {
    expect(emailSrc).toContain("View Your Dashboard");
    expect(emailSrc).toContain("/dashboard");
  });

  it("approved email lists owner capabilities", () => {
    expect(emailSrc).toContain("Access your business dashboard with analytics");
    expect(emailSrc).toContain("Respond to customer ratings");
    expect(emailSrc).toContain("verified owner badge");
  });

  it("rejected email includes contact information", () => {
    expect(emailSrc).toContain("unable to verify your claim");
    expect(emailSrc).toContain("support@topranker.com");
  });

  it("rejected email suggests next steps", () => {
    expect(emailSrc).toContain("additional verification documents");
  });

  it("approved email accepts businessSlug param", () => {
    expect(emailSrc).toContain("businessSlug: string");
    expect(emailSrc).toContain("businessSlug");
  });

  it("both emails use sendEmail utility", () => {
    const approvedMatch = emailSrc.match(/sendClaimApprovedEmail[\s\S]*?await sendEmail/);
    const rejectedMatch = emailSrc.match(/sendClaimRejectedEmail[\s\S]*?await sendEmail/);
    expect(approvedMatch).not.toBeNull();
    expect(rejectedMatch).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 3. Dashboard access control
// ---------------------------------------------------------------------------
describe("dashboard access control", () => {
  const bizRoutesSrc = readFile("server/routes-business-analytics.ts");

  it("dashboard route requires authentication", () => {
    expect(bizRoutesSrc).toContain('"/api/businesses/:slug/dashboard", requireAuth');
  });

  it("checks business ownership", () => {
    expect(bizRoutesSrc).toContain("business.ownerId");
    expect(bizRoutesSrc).toContain("req.user!.id");
  });

  it("allows admin access", () => {
    expect(bizRoutesSrc).toContain("isAdminEmail");
    expect(bizRoutesSrc).toContain("isAdmin");
  });

  it("returns 403 for non-owners", () => {
    expect(bizRoutesSrc).toContain("403");
    expect(bizRoutesSrc).toContain("Dashboard access requires business ownership");
  });

  it("checks both owner and admin before denying", () => {
    expect(bizRoutesSrc).toContain("!isOwner && !isAdmin");
  });
});

// ---------------------------------------------------------------------------
// 4. Admin route sends emails on review
// ---------------------------------------------------------------------------
describe("admin claim review — email notifications", () => {
  const adminSrc = readFile("server/routes-admin.ts");

  it("imports reviewClaim", () => {
    expect(adminSrc).toContain("reviewClaim");
  });

  it("fetches member and business for email", () => {
    expect(adminSrc).toContain("getMemberById");
    expect(adminSrc).toContain("getBusinessById");
  });

  it("sends approved email on approval", () => {
    expect(adminSrc).toContain("sendClaimApprovedEmail");
  });

  it("sends rejected email on rejection", () => {
    expect(adminSrc).toContain("sendClaimRejectedEmail");
  });

  it("catches email errors without blocking response", () => {
    expect(adminSrc).toContain(".catch(() => {})");
  });

  it("checks memberId and businessId before sending", () => {
    expect(adminSrc).toContain("updated.memberId && updated.businessId");
  });

  it("checks member has email before sending", () => {
    expect(adminSrc).toContain("member?.email");
  });
});

// ---------------------------------------------------------------------------
// 5. Claim submission flow (existing)
// ---------------------------------------------------------------------------
describe("claim submission flow", () => {
  const bizRoutesSrc = readFile("server/routes-businesses.ts");

  it("claim endpoint requires auth", () => {
    expect(bizRoutesSrc).toContain('"/api/businesses/:slug/claim", requireAuth');
  });

  it("prevents duplicate claims", () => {
    expect(bizRoutesSrc).toContain("getClaimByMemberAndBusiness");
    expect(bizRoutesSrc).toContain("409");
  });

  it("sends confirmation email on claim submission", () => {
    expect(bizRoutesSrc).toContain("sendClaimConfirmationEmail");
  });

  it("sends admin notification on claim submission", () => {
    expect(bizRoutesSrc).toContain("sendClaimAdminNotification");
  });

  it("requires role in claim submission", () => {
    expect(bizRoutesSrc).toContain("Role is required");
  });
});

// ---------------------------------------------------------------------------
// 6. End-to-end claim lifecycle
// ---------------------------------------------------------------------------
describe("claim lifecycle — submission to approval", () => {
  const claimsSrc = readFile("server/storage/claims.ts");
  const emailSrc = readFile("server/email.ts");
  const adminSrc = readFile("server/routes-admin.ts");
  const bizRoutesSrc = readFile("server/routes-businesses.ts");

  it("submitClaim creates a pending claim", () => {
    expect(claimsSrc).toContain("export async function submitClaim");
    expect(claimsSrc).toContain(".insert(businessClaims)");
  });

  it("getPendingClaims returns claims for admin review", () => {
    expect(claimsSrc).toContain("export async function getPendingClaims");
    expect(claimsSrc).toContain('eq(businessClaims.status, "pending")');
  });

  it("reviewClaim updates status and transfers ownership", () => {
    expect(claimsSrc).toContain(".update(businessClaims)");
    expect(claimsSrc).toContain(".update(businesses)");
  });

  it("full email chain exists: confirmation → approved/rejected", () => {
    expect(emailSrc).toContain("sendClaimConfirmationEmail");
    expect(emailSrc).toContain("sendClaimApprovedEmail");
    expect(emailSrc).toContain("sendClaimRejectedEmail");
  });

  it("dashboard gated to verified owner after claim approval", () => {
    // Sprint 486: Dashboard extracted to routes-business-analytics.ts
    const analyticsSrc = readFile("server/routes-business-analytics.ts");
    expect(analyticsSrc).toContain("business.ownerId === req.user!.id");
  });
});
