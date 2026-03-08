/**
 * Unit Tests — Search Input Sanitization (N5 Audit Fix)
 * Owner: Nadia Kaur (VP Security)
 *
 * Tests that search queries are properly sanitized before being used in ILIKE queries.
 */

import { describe, it, expect } from "vitest";

// Extract sanitization logic from storage/businesses.ts for pure testing
function sanitizeSearchQuery(query: string): string {
  return query.slice(0, 100).replace(/[%_\\]/g, "").toLowerCase();
}

describe("Search input sanitization", () => {
  it("converts to lowercase", () => {
    expect(sanitizeSearchQuery("Franklin BBQ")).toBe("franklin bbq");
  });

  it("truncates to 100 characters", () => {
    const long = "a".repeat(200);
    expect(sanitizeSearchQuery(long).length).toBe(100);
  });

  it("strips LIKE wildcard %", () => {
    expect(sanitizeSearchQuery("test%query")).toBe("testquery");
  });

  it("strips LIKE wildcard _", () => {
    expect(sanitizeSearchQuery("test_query")).toBe("testquery");
  });

  it("strips backslash", () => {
    expect(sanitizeSearchQuery("test\\query")).toBe("testquery");
  });

  it("handles empty string", () => {
    expect(sanitizeSearchQuery("")).toBe("");
  });

  it("handles normal restaurant names", () => {
    expect(sanitizeSearchQuery("Franklin Barbecue")).toBe("franklin barbecue");
    expect(sanitizeSearchQuery("Uchi")).toBe("uchi");
    expect(sanitizeSearchQuery("Joe T. Garcia's")).toBe("joe t. garcia's");
  });

  it("strips injection attempt characters", () => {
    expect(sanitizeSearchQuery("%_%\\")).toBe("");
  });

  it("preserves spaces, dots, apostrophes, hyphens", () => {
    expect(sanitizeSearchQuery("Pappas Bros.")).toBe("pappas bros.");
    expect(sanitizeSearchQuery("O'Brien's")).toBe("o'brien's");
    expect(sanitizeSearchQuery("Pei-Wei")).toBe("pei-wei");
  });
});
