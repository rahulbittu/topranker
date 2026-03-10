/**
 * Sprint 579: Business Claim Status Tracking
 *
 * Tests:
 * 1. Storage: getClaimsByMember function
 * 2. Route: GET /api/members/me/claims
 * 3. Component: ClaimStatusCard
 * 4. Business detail integration
 * 5. Mock router: claims endpoint
 * 6. LOC thresholds
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 579: getClaimsByMember Storage Function", () => {
  const src = readFile("server/storage/claims.ts");

  it("exports getClaimsByMember as async function", () => {
    expect(src).toContain("export async function getClaimsByMember");
  });

  it("takes memberId parameter", () => {
    expect(src).toContain("getClaimsByMember(memberId: string)");
  });

  it("selects claim fields with business name and slug", () => {
    expect(src).toContain("businessClaims.id");
    expect(src).toContain("businesses.name");
    expect(src).toContain("businesses.slug");
    expect(src).toContain("businessClaims.status");
  });

  it("joins with businesses table", () => {
    expect(src).toContain("leftJoin(businesses");
  });

  it("filters by memberId", () => {
    expect(src).toContain("eq(businessClaims.memberId, memberId)");
  });

  it("orders by submittedAt descending", () => {
    expect(src).toContain("desc(businessClaims.submittedAt)");
  });

  it("includes reviewedAt for status timeline", () => {
    expect(src).toContain("businessClaims.reviewedAt");
  });
});

describe("Sprint 579: Storage Index Export", () => {
  const src = readFile("server/storage/index.ts");

  it("exports getClaimsByMember", () => {
    expect(src).toContain("getClaimsByMember");
  });
});

describe("Sprint 579: Route Wiring", () => {
  const src = readFile("server/routes-members.ts");

  it("registers GET /api/members/me/claims endpoint", () => {
    expect(src).toContain("/api/members/me/claims");
  });

  it("requires auth", () => {
    expect(src).toContain("requireAuth");
  });

  it("imports getClaimsByMember from storage", () => {
    expect(src).toContain("getClaimsByMember");
  });

  it("calls getClaimsByMember with user id", () => {
    expect(src).toContain("getClaimsByMember(req.user!.id)");
  });

  it("returns claims as data array", () => {
    expect(src).toContain("res.json({ data: claims })");
  });
});

describe("Sprint 579: ClaimStatusCard Component", () => {
  const src = readFile("components/business/ClaimStatusCard.tsx");

  it("exports ClaimStatusCard function", () => {
    expect(src).toContain("export function ClaimStatusCard");
  });

  it("exports ClaimStatusCardProps interface", () => {
    expect(src).toContain("export interface ClaimStatusCardProps");
  });

  it("props include businessId, businessSlug, businessName", () => {
    expect(src).toContain("businessId: string");
    expect(src).toContain("businessSlug: string");
    expect(src).toContain("businessName: string");
  });

  it("fetches /api/members/me/claims", () => {
    expect(src).toContain("/api/members/me/claims");
  });

  it("filters claims by businessId", () => {
    expect(src).toContain("c.businessId === businessId");
  });

  it("defines STATUS_CONFIG for pending/approved/rejected", () => {
    expect(src).toContain("STATUS_CONFIG");
    expect(src).toContain("pending");
    expect(src).toContain("approved");
    expect(src).toContain("rejected");
  });

  it("pending status shows time icon and review message", () => {
    expect(src).toContain("time-outline");
    expect(src).toContain("Under Review");
  });

  it("approved status shows shield-checkmark icon", () => {
    expect(src).toContain("shield-checkmark");
    expect(src).toContain("Verified Owner");
  });

  it("rejected status shows close-circle icon", () => {
    expect(src).toContain("close-circle-outline");
    expect(src).toContain("Not Approved");
  });

  it("approved state shows Open Dashboard button", () => {
    expect(src).toContain("Open Dashboard");
    expect(src).toContain("analytics-outline");
  });

  it("rejected state shows Resubmit Claim button", () => {
    expect(src).toContain("Resubmit Claim");
    expect(src).toContain("refresh-outline");
  });

  it("shows submission date and verification method", () => {
    expect(src).toContain("Submitted");
    expect(src).toContain("claim.verificationMethod");
  });

  it("returns null when no claim exists for this business", () => {
    expect(src).toContain("if (!claim) return null");
  });

  it("returns null when user not logged in", () => {
    expect(src).toContain("!user");
  });

  it("uses useAuth hook", () => {
    expect(src).toContain("useAuth");
  });

  it("component LOC under 100", () => {
    const lines = src.split("\n").length;
    expect(lines).toBeLessThan(100);
  });
});

describe("Sprint 579: Business Detail Integration", () => {
  const src = readFile("app/business/[id].tsx");

  it("imports ClaimStatusCard", () => {
    expect(src).toContain("import { ClaimStatusCard }");
    expect(src).toContain('from "@/components/business/ClaimStatusCard"');
  });

  it("renders ClaimStatusCard with business props", () => {
    expect(src).toContain("<ClaimStatusCard");
    expect(src).toContain("businessId={business.id}");
    expect(src).toContain("businessSlug={business.slug}");
    expect(src).toContain("businessName={business.name}");
  });
});

describe("Sprint 579: Mock Router Claims Endpoint", () => {
  const src = readFile("lib/mock-router.ts");

  it("handles /api/members/me/claims before /api/members/me catch-all", () => {
    const claimsIdx = src.indexOf("/api/members/me/claims");
    const meIdx = src.indexOf('{ prefix: "/api/members/me"', claimsIdx + 1);
    expect(claimsIdx).toBeGreaterThan(-1);
    expect(meIdx).toBeGreaterThan(claimsIdx);
  });

  it("returns empty array for mock claims", () => {
    expect(src).toContain("/api/members/me/claims");
  });
});
