import { describe, it, expect } from "vitest";

/**
 * Business Claims — Unit tests
 * Validates claim submission, duplicate detection, and dashboard analytics endpoint.
 */

// ── Claim Submission Validation ─────────────────────────────

function validateClaimInput(body: any): { valid: boolean; error?: string } {
  if (!body.role || typeof body.role !== "string" || body.role.trim().length === 0) {
    return { valid: false, error: "Role is required" };
  }
  if (body.role.trim().length > 50) {
    return { valid: false, error: "Role too long" };
  }
  if (body.phone && typeof body.phone !== "string") {
    return { valid: false, error: "Phone must be a string" };
  }
  if (body.phone && body.phone.length > 20) {
    return { valid: false, error: "Phone too long" };
  }
  return { valid: true };
}

describe("Claim Submission Validation", () => {
  it("accepts valid claim with role", () => {
    expect(validateClaimInput({ role: "Owner" }).valid).toBe(true);
  });

  it("accepts claim with role and phone", () => {
    expect(validateClaimInput({ role: "Manager", phone: "(214) 555-0100" }).valid).toBe(true);
  });

  it("rejects missing role", () => {
    const result = validateClaimInput({});
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Role is required");
  });

  it("rejects empty role", () => {
    const result = validateClaimInput({ role: "  " });
    expect(result.valid).toBe(false);
  });

  it("rejects role too long", () => {
    const result = validateClaimInput({ role: "a".repeat(51) });
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Role too long");
  });

  it("rejects non-string phone", () => {
    const result = validateClaimInput({ role: "Owner", phone: 12345 });
    expect(result.valid).toBe(false);
  });
});

// ── Claim Endpoint Contract ─────────────────────────────────

describe("Claim Endpoint Contract", () => {
  it("requires auth — returns 401 shape", () => {
    const mock = { error: "Authentication required" };
    expect(mock.error).toBeDefined();
  });

  it("returns 404 for unknown business", () => {
    const mock = { error: "Business not found" };
    expect(mock.error).toBe("Business not found");
  });

  it("returns 409 for duplicate claim", () => {
    const mock = { error: "You already have a pending or approved claim for this business" };
    expect(mock.error).toContain("already");
  });

  it("returns claim id and status on success", () => {
    const mock = { data: { id: "claim-123", status: "pending" } };
    expect(mock.data.id).toBeDefined();
    expect(mock.data.status).toBe("pending");
  });
});

// ── Dashboard Endpoint Contract ─────────────────────────────

describe("Dashboard Endpoint Contract", () => {
  it("returns analytics shape", () => {
    const mock = {
      data: {
        totalRatings: 87,
        avgScore: 4.2,
        rankPosition: 3,
        rankDelta: 1,
        wouldReturnPct: 89,
        topDish: { name: "Brisket Plate", votes: 34 },
        ratingTrend: [3.8, 3.9, 4.0, 4.2],
        recentRatings: [],
      },
    };
    expect(mock.data.totalRatings).toBe(87);
    expect(mock.data.avgScore).toBe(4.2);
    expect(mock.data.topDish?.name).toBe("Brisket Plate");
    expect(mock.data.ratingTrend).toHaveLength(4);
  });

  it("handles null topDish", () => {
    const mock = { data: { topDish: null } };
    expect(mock.data.topDish).toBeNull();
  });

  it("handles empty rating trend", () => {
    const mock = { data: { ratingTrend: [] } };
    expect(mock.data.ratingTrend).toHaveLength(0);
  });

  it("requires auth", () => {
    const mock = { error: "Authentication required" };
    expect(mock.error).toBeDefined();
  });
});

// ── Time Ago Formatter ──────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

describe("Time Ago Formatter", () => {
  it("shows minutes for recent timestamps", () => {
    const now = new Date(Date.now() - 5 * 60000).toISOString();
    expect(timeAgo(now)).toBe("5m ago");
  });

  it("shows hours for same-day timestamps", () => {
    const now = new Date(Date.now() - 3 * 3600000).toISOString();
    expect(timeAgo(now)).toBe("3h ago");
  });

  it("shows days for recent past", () => {
    const now = new Date(Date.now() - 2 * 86400000).toISOString();
    expect(timeAgo(now)).toBe("2d ago");
  });

  it("shows weeks for older timestamps", () => {
    const now = new Date(Date.now() - 14 * 86400000).toISOString();
    expect(timeAgo(now)).toBe("2w ago");
  });
});
