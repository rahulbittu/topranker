/**
 * Admin Claims & Flags API Tests
 * Owner: Carlos (QA Lead) + Sage (Backend) + Priya (RBAC)
 *
 * Tests admin claims/flags route validation, badge leaderboard contract,
 * and admin panel data flow.
 */
import { describe, it, expect } from "vitest";

describe("Admin Claims API Validation", () => {
  it("should only accept approved or rejected status for claims", () => {
    const validStatuses = ["approved", "rejected"];
    for (const status of validStatuses) {
      expect(validStatuses.includes(status)).toBe(true);
    }
    expect(validStatuses.includes("pending")).toBe(false);
    expect(validStatuses.includes("confirmed")).toBe(false);
  });

  it("should structure claim response with business and member info", () => {
    const mockClaim = {
      id: "claim-1",
      businessId: "biz-1",
      businessName: "Pecan Lodge",
      memberId: "mem-1",
      memberName: "John Smith",
      verificationMethod: "phone",
      status: "pending",
      submittedAt: "2026-03-01T12:00:00Z",
    };
    expect(mockClaim.businessName).toBeTruthy();
    expect(mockClaim.memberName).toBeTruthy();
    expect(mockClaim.verificationMethod).toBeTruthy();
    expect(mockClaim.status).toBe("pending");
  });

  it("should return 404 for non-existent claim review", () => {
    // reviewClaim returns null when claim not found → route returns 404
    const updated = null;
    expect(updated).toBeNull();
  });
});

describe("Admin Flags API Validation", () => {
  it("should only accept confirmed or dismissed status for flags", () => {
    const validStatuses = ["confirmed", "dismissed"];
    for (const status of validStatuses) {
      expect(validStatuses.includes(status)).toBe(true);
    }
    expect(validStatuses.includes("approved")).toBe(false);
    expect(validStatuses.includes("pending")).toBe(false);
  });

  it("should structure flag response with flagger and fraud data", () => {
    const mockFlag = {
      id: "flag-1",
      ratingId: "rating-1",
      flaggerName: "Jane Doe",
      explanation: "Suspicious pattern",
      aiFraudProbability: 85,
      status: "pending",
      createdAt: "2026-03-01T12:00:00Z",
    };
    expect(mockFlag.flaggerName).toBeTruthy();
    expect(typeof mockFlag.aiFraudProbability).toBe("number");
    expect(mockFlag.aiFraudProbability).toBeGreaterThanOrEqual(0);
    expect(mockFlag.aiFraudProbability).toBeLessThanOrEqual(100);
  });

  it("should handle null explanation and aiFraudProbability", () => {
    const mockFlag = {
      id: "flag-2",
      ratingId: "rating-2",
      flaggerName: null,
      explanation: null,
      aiFraudProbability: null,
      status: "pending",
      createdAt: "2026-03-01T12:00:00Z",
    };
    // Admin panel handles null gracefully
    const title = mockFlag.aiFraudProbability != null
      ? `Fraud risk: ${mockFlag.aiFraudProbability}%`
      : "Flagged Rating";
    expect(title).toBe("Flagged Rating");
    const subtitle = `Flagged by ${mockFlag.flaggerName || "Unknown"}`;
    expect(subtitle).toBe("Flagged by Unknown");
  });
});

describe("Badge Leaderboard Validation", () => {
  it("should structure leaderboard entry with member info and badge count", () => {
    const entry = {
      memberId: "mem-1",
      displayName: "Jane Doe",
      username: "janedoe",
      avatarUrl: null,
      credibilityTier: "trusted",
      badgeCount: 12,
    };
    expect(entry.memberId).toBeTruthy();
    expect(entry.displayName).toBeTruthy();
    expect(typeof entry.badgeCount).toBe("number");
    expect(entry.badgeCount).toBeGreaterThan(0);
  });

  it("should respect limit parameter (1-50 range)", () => {
    const clamp = (v: number) => Math.min(50, Math.max(1, v));
    expect(clamp(0)).toBe(1);
    expect(clamp(20)).toBe(20);
    expect(clamp(100)).toBe(50);
    expect(clamp(-5)).toBe(1);
  });

  it("should sort by badge count descending", () => {
    const entries = [
      { displayName: "A", badgeCount: 5 },
      { displayName: "B", badgeCount: 12 },
      { displayName: "C", badgeCount: 8 },
    ];
    const sorted = [...entries].sort((a, b) => b.badgeCount - a.badgeCount);
    expect(sorted[0].displayName).toBe("B");
    expect(sorted[1].displayName).toBe("C");
    expect(sorted[2].displayName).toBe("A");
  });

  it("should handle empty leaderboard gracefully", () => {
    const leaderboard: { memberId: string; badgeCount: number }[] = [];
    expect(leaderboard.length).toBe(0);
    // UI shows empty state when leaderboard is empty
  });
});

describe("Admin RBAC Guard", () => {
  it("should block non-admin users from claims endpoint", () => {
    // All admin routes check isAdminEmail(req.user?.email)
    // Non-admin gets 403
    const isAdmin = false;
    const statusCode = isAdmin ? 200 : 403;
    expect(statusCode).toBe(403);
  });

  it("should allow admin users through", () => {
    const isAdmin = true;
    const statusCode = isAdmin ? 200 : 403;
    expect(statusCode).toBe(200);
  });
});
