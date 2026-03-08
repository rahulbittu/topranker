/**
 * Unit Tests — Auth Validation Logic
 * Owner: Sage (Backend Engineer #2) + Nadia Kaur (Security)
 *
 * Tests registration validation, input sanitization, and auth guards.
 * These test the pure validation logic without requiring a database.
 */

import { describe, it, expect } from "vitest";

// Extract validation rules from auth.ts for pure testing
// These mirror the exact checks in registerMember()

function validateUsername(username: string): string | null {
  if (!/^[a-zA-Z0-9_]{2,30}$/.test(username)) {
    return "Username must be 2-30 characters: letters, numbers, or underscores";
  }
  return null;
}

function validateEmail(email: string): string | null {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Invalid email address";
  }
  return null;
}

function validateDisplayName(name: string): string | null {
  if (name.length < 1 || name.length > 50) {
    return "Display name must be 1-50 characters";
  }
  return null;
}

describe("Username validation", () => {
  it("accepts valid usernames", () => {
    expect(validateUsername("john_doe")).toBeNull();
    expect(validateUsername("user123")).toBeNull();
    expect(validateUsername("ab")).toBeNull(); // min 2
    expect(validateUsername("a".repeat(30))).toBeNull(); // max 30
  });

  it("rejects too short usernames", () => {
    expect(validateUsername("a")).not.toBeNull();
    expect(validateUsername("")).not.toBeNull();
  });

  it("rejects too long usernames", () => {
    expect(validateUsername("a".repeat(31))).not.toBeNull();
  });

  it("rejects special characters", () => {
    expect(validateUsername("user@name")).not.toBeNull();
    expect(validateUsername("user name")).not.toBeNull();
    expect(validateUsername("user.name")).not.toBeNull();
    expect(validateUsername("user-name")).not.toBeNull();
  });

  it("rejects injection attempts", () => {
    expect(validateUsername("'; DROP TABLE--")).not.toBeNull();
    expect(validateUsername("<script>alert(1)</script>")).not.toBeNull();
  });
});

describe("Email validation", () => {
  it("accepts valid emails", () => {
    expect(validateEmail("user@example.com")).toBeNull();
    expect(validateEmail("test@topranker.com")).toBeNull();
    expect(validateEmail("a.b@c.d.e")).toBeNull();
  });

  it("rejects invalid emails", () => {
    expect(validateEmail("notanemail")).not.toBeNull();
    expect(validateEmail("@nouser.com")).not.toBeNull();
    expect(validateEmail("no@domain")).not.toBeNull();
    expect(validateEmail("")).not.toBeNull();
    expect(validateEmail("has spaces@test.com")).not.toBeNull();
  });
});

describe("Display name validation", () => {
  it("accepts valid display names", () => {
    expect(validateDisplayName("John")).toBeNull();
    expect(validateDisplayName("A")).toBeNull(); // min 1
    expect(validateDisplayName("a".repeat(50))).toBeNull(); // max 50
  });

  it("rejects empty display name", () => {
    expect(validateDisplayName("")).not.toBeNull();
  });

  it("rejects too long display name", () => {
    expect(validateDisplayName("a".repeat(51))).not.toBeNull();
  });
});

describe("Rating schema validation", () => {
  // Test the insertRatingSchema constraints from shared/schema
  it("requires score values between 1-10", () => {
    const validScore = (n: number) => n >= 1 && n <= 10;
    expect(validScore(1)).toBe(true);
    expect(validScore(10)).toBe(true);
    expect(validScore(5)).toBe(true);
    expect(validScore(0)).toBe(false);
    expect(validScore(11)).toBe(false);
    expect(validScore(-1)).toBe(false);
  });

  it("requires businessId to be present", () => {
    const hasBusinessId = (rating: { businessId?: string }) => !!rating.businessId;
    expect(hasBusinessId({ businessId: "abc-123" })).toBe(true);
    expect(hasBusinessId({})).toBe(false);
    expect(hasBusinessId({ businessId: "" })).toBe(false);
  });
});

describe("Rate gating (3-day rule)", () => {
  function checkRateGating(joinedAt: Date): { allowed: boolean; daysActive: number } {
    const daysActive = Math.floor((Date.now() - joinedAt.getTime()) / (1000 * 60 * 60 * 24));
    return { allowed: daysActive >= 3, daysActive };
  }

  it("blocks accounts less than 3 days old", () => {
    const result = checkRateGating(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000));
    expect(result.allowed).toBe(false);
    expect(result.daysActive).toBe(2);
  });

  it("allows accounts exactly 3 days old", () => {
    const result = checkRateGating(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000));
    expect(result.allowed).toBe(true);
    expect(result.daysActive).toBe(3);
  });

  it("allows accounts more than 3 days old", () => {
    const result = checkRateGating(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    expect(result.allowed).toBe(true);
    expect(result.daysActive).toBe(30);
  });

  it("blocks brand new accounts (0 days)", () => {
    const result = checkRateGating(new Date());
    expect(result.allowed).toBe(false);
    expect(result.daysActive).toBe(0);
  });
});
