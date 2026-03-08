/**
 * Unit Tests — Admin Email Whitelist (C2 Audit Fix)
 * Owner: Priya Sharma (Backend Architect)
 *
 * Tests the centralized admin email system that replaced
 * hardcoded email arrays in 3+ files.
 */

import { describe, it, expect } from "vitest";
import { ADMIN_EMAILS, isAdminEmail } from "@shared/admin";

describe("ADMIN_EMAILS", () => {
  it("includes rahul@topranker.com", () => {
    expect(ADMIN_EMAILS).toContain("rahul@topranker.com");
  });

  it("includes admin@topranker.com", () => {
    expect(ADMIN_EMAILS).toContain("admin@topranker.com");
  });

  it("does NOT include alex@demo.com (removed per audit C2)", () => {
    expect(ADMIN_EMAILS).not.toContain("alex@demo.com");
  });

  it("is readonly / frozen", () => {
    expect(() => {
      (ADMIN_EMAILS as string[]).push("hacker@evil.com");
    }).toThrow();
  });
});

describe("isAdminEmail", () => {
  it("returns true for valid admin emails", () => {
    expect(isAdminEmail("rahul@topranker.com")).toBe(true);
    expect(isAdminEmail("admin@topranker.com")).toBe(true);
  });

  it("returns false for non-admin emails", () => {
    expect(isAdminEmail("alex@demo.com")).toBe(false);
    expect(isAdminEmail("random@user.com")).toBe(false);
    expect(isAdminEmail("hacker@evil.com")).toBe(false);
  });

  it("returns false for null/undefined/empty", () => {
    expect(isAdminEmail(null)).toBe(false);
    expect(isAdminEmail(undefined)).toBe(false);
    expect(isAdminEmail("")).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(isAdminEmail("RAHUL@TOPRANKER.COM")).toBe(true);
    expect(isAdminEmail("Admin@TopRanker.com")).toBe(true);
  });
});
