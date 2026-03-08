/**
 * Category API & Suggestion Validation Tests
 * Owner: Carlos (QA Lead) + Sage (Backend)
 */
import { describe, it, expect } from "vitest";
import { insertCategorySuggestionSchema } from "@shared/schema";

describe("Category Suggestion Validation", () => {
  const validSuggestion = {
    name: "Pet Groomers",
    description: "Rank the best pet grooming services in your city",
    vertical: "services" as const,
  };

  it("accepts a valid suggestion", () => {
    const result = insertCategorySuggestionSchema.safeParse(validSuggestion);
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = insertCategorySuggestionSchema.safeParse({
      ...validSuggestion,
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects single-char name", () => {
    const result = insertCategorySuggestionSchema.safeParse({
      ...validSuggestion,
      name: "A",
    });
    expect(result.success).toBe(false);
  });

  it("accepts 2-char name (minimum)", () => {
    const result = insertCategorySuggestionSchema.safeParse({
      ...validSuggestion,
      name: "AB",
    });
    expect(result.success).toBe(true);
  });

  it("rejects description under 10 chars", () => {
    const result = insertCategorySuggestionSchema.safeParse({
      ...validSuggestion,
      description: "Too short",
    });
    expect(result.success).toBe(false);
  });

  it("accepts 10-char description (minimum)", () => {
    const result = insertCategorySuggestionSchema.safeParse({
      ...validSuggestion,
      description: "0123456789",
    });
    expect(result.success).toBe(true);
  });

  it("rejects name over 50 chars", () => {
    const result = insertCategorySuggestionSchema.safeParse({
      ...validSuggestion,
      name: "A".repeat(51),
    });
    expect(result.success).toBe(false);
  });

  it("rejects description over 200 chars", () => {
    const result = insertCategorySuggestionSchema.safeParse({
      ...validSuggestion,
      description: "A".repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid verticals", () => {
    for (const v of ["food", "services", "wellness", "entertainment", "retail"]) {
      const result = insertCategorySuggestionSchema.safeParse({
        ...validSuggestion,
        vertical: v,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid vertical", () => {
    const result = insertCategorySuggestionSchema.safeParse({
      ...validSuggestion,
      vertical: "sports",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    expect(insertCategorySuggestionSchema.safeParse({}).success).toBe(false);
    expect(insertCategorySuggestionSchema.safeParse({ name: "Test" }).success).toBe(false);
    expect(insertCategorySuggestionSchema.safeParse({ name: "Test", description: "Valid desc here" }).success).toBe(false);
  });
});
