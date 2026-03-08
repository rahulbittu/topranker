/**
 * Schema — Categories & Category Suggestions Table Tests
 * Owner: Carlos (QA Lead) + Sage (Backend)
 *
 * Validates that the new category tables have correct column definitions
 * and that the insert schema validates properly.
 */
import { describe, it, expect } from "vitest";
import {
  categories,
  categorySuggestions,
  insertCategorySuggestionSchema,
} from "@shared/schema";

describe("Categories Schema", () => {
  it("categories table has required columns", () => {
    expect(categories.slug).toBeDefined();
    expect(categories.label).toBeDefined();
    expect(categories.emoji).toBeDefined();
    expect(categories.vertical).toBeDefined();
    expect(categories.atAGlanceFields).toBeDefined();
    expect(categories.scoringHints).toBeDefined();
    expect(categories.isActive).toBeDefined();
    expect(categories.createdAt).toBeDefined();
  });

  it("categorySuggestions table has required columns", () => {
    expect(categorySuggestions.name).toBeDefined();
    expect(categorySuggestions.description).toBeDefined();
    expect(categorySuggestions.vertical).toBeDefined();
    expect(categorySuggestions.suggestedBy).toBeDefined();
    expect(categorySuggestions.status).toBeDefined();
    expect(categorySuggestions.voteCount).toBeDefined();
    expect(categorySuggestions.reviewedBy).toBeDefined();
    expect(categorySuggestions.createdAt).toBeDefined();
  });
});

describe("insertCategorySuggestionSchema", () => {
  it("accepts valid suggestion", () => {
    const result = insertCategorySuggestionSchema.safeParse({
      name: "Pet Groomers",
      description: "Rank the best pet grooming services in your city",
      vertical: "services",
    });
    expect(result.success).toBe(true);
  });

  it("rejects name shorter than 2 chars", () => {
    const result = insertCategorySuggestionSchema.safeParse({
      name: "A",
      description: "Some valid description here",
      vertical: "food",
    });
    expect(result.success).toBe(false);
  });

  it("rejects description shorter than 10 chars", () => {
    const result = insertCategorySuggestionSchema.safeParse({
      name: "Valid Name",
      description: "Too short",
      vertical: "food",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid vertical", () => {
    const result = insertCategorySuggestionSchema.safeParse({
      name: "Valid Name",
      description: "Some valid description here",
      vertical: "invalid_vertical",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid verticals", () => {
    const verticals = ["food", "services", "wellness", "entertainment", "retail"];
    for (const v of verticals) {
      const result = insertCategorySuggestionSchema.safeParse({
        name: "Test Category",
        description: "This is a valid test description",
        vertical: v,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects name longer than 50 chars", () => {
    const result = insertCategorySuggestionSchema.safeParse({
      name: "A".repeat(51),
      description: "Some valid description here",
      vertical: "food",
    });
    expect(result.success).toBe(false);
  });

  it("rejects description longer than 200 chars", () => {
    const result = insertCategorySuggestionSchema.safeParse({
      name: "Valid Name",
      description: "A".repeat(201),
      vertical: "food",
    });
    expect(result.success).toBe(false);
  });
});
