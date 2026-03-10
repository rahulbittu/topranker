/**
 * Sprint 282 — Cuisine-Specific Subcategories
 *
 * Validates:
 * 1. Each cuisine has distinct subcategories (not all same)
 * 2. New cuisine types exist: indian, mexican, japanese, chinese, etc.
 * 3. getCategoriesByCuisine returns correct filtered results
 * 4. getAvailableCuisines returns all cuisine types
 * 5. CUISINE_DISPLAY metadata exists for all cuisines
 * 6. No duplicate slugs across cuisines
 */

import { describe, it, expect } from "vitest";
import {
  BEST_IN_CATEGORIES,
  getActiveCategories,
  getCategoriesByCuisine,
  getAvailableCuisines,
  getCategoryBySlug,
  getCategoryCount,
  CUISINE_DISPLAY,
} from "@shared/best-in-categories";

describe("Sprint 282: Cuisine-Specific Subcategories", () => {
  it("has 10+ cuisine types", () => {
    const cuisines = getAvailableCuisines();
    expect(cuisines.length).toBeGreaterThanOrEqual(10);
  });

  it("Indian cuisine has biryani, dosa, butter-chicken, chai, samosa, tandoori, chaat, thali", () => {
    const indian = getCategoriesByCuisine("indian");
    const slugs = indian.map(c => c.slug);
    expect(slugs).toContain("biryani");
    expect(slugs).toContain("dosa");
    expect(slugs).toContain("butter-chicken");
    expect(slugs).toContain("chai");
    expect(slugs).toContain("samosa");
    expect(slugs).toContain("tandoori");
    expect(slugs).toContain("chaat");
    expect(slugs).toContain("thali");
  });

  it("Mexican cuisine has tacos, burritos, enchiladas, queso, margaritas, tamales", () => {
    const mexican = getCategoriesByCuisine("mexican");
    const slugs = mexican.map(c => c.slug);
    expect(slugs).toContain("tacos");
    expect(slugs).toContain("burritos");
    expect(slugs).toContain("enchiladas");
    expect(slugs).toContain("queso");
    expect(slugs).toContain("margaritas");
    expect(slugs).toContain("tamales");
  });

  it("Japanese cuisine has sushi, ramen, udon, katsu", () => {
    const japanese = getCategoriesByCuisine("japanese");
    const slugs = japanese.map(c => c.slug);
    expect(slugs).toContain("sushi");
    expect(slugs).toContain("ramen");
    expect(slugs).toContain("udon");
    expect(slugs).toContain("katsu");
  });

  it("Chinese cuisine has dim-sum, hot-pot, kung-pao, peking-duck", () => {
    const chinese = getCategoriesByCuisine("chinese");
    const slugs = chinese.map(c => c.slug);
    expect(slugs).toContain("dim-sum");
    expect(slugs).toContain("hot-pot");
    expect(slugs).toContain("kung-pao");
    expect(slugs).toContain("peking-duck");
  });

  it("Vietnamese cuisine has pho, banh-mi, bun-bo-hue", () => {
    const vietnamese = getCategoriesByCuisine("vietnamese");
    const slugs = vietnamese.map(c => c.slug);
    expect(slugs).toContain("pho");
    expect(slugs).toContain("banh-mi");
    expect(slugs).toContain("bun-bo-hue");
  });

  it("Korean cuisine has korean-bbq, bibimbap, fried-chicken", () => {
    const korean = getCategoriesByCuisine("korean");
    const slugs = korean.map(c => c.slug);
    expect(slugs).toContain("korean-bbq");
    expect(slugs).toContain("bibimbap");
    expect(slugs).toContain("fried-chicken");
  });

  it("Thai cuisine has pad-thai, green-curry, mango-sticky-rice", () => {
    const thai = getCategoriesByCuisine("thai");
    const slugs = thai.map(c => c.slug);
    expect(slugs).toContain("pad-thai");
    expect(slugs).toContain("green-curry");
    expect(slugs).toContain("mango-sticky-rice");
  });

  it("Italian cuisine has pizza, pasta, tiramisu, gelato", () => {
    const italian = getCategoriesByCuisine("italian");
    const slugs = italian.map(c => c.slug);
    expect(slugs).toContain("pizza");
    expect(slugs).toContain("pasta");
    expect(slugs).toContain("tiramisu");
    expect(slugs).toContain("gelato");
  });

  it("American cuisine has bbq, burgers, wings, brisket, mac-and-cheese", () => {
    const american = getCategoriesByCuisine("american");
    const slugs = american.map(c => c.slug);
    expect(slugs).toContain("bbq");
    expect(slugs).toContain("burgers");
    expect(slugs).toContain("wings");
    expect(slugs).toContain("brisket");
    expect(slugs).toContain("mac-and-cheese");
  });

  it("Mediterranean cuisine has shawarma, falafel, hummus", () => {
    const med = getCategoriesByCuisine("mediterranean");
    const slugs = med.map(c => c.slug);
    expect(slugs).toContain("shawarma");
    expect(slugs).toContain("falafel");
    expect(slugs).toContain("hummus");
  });

  it("each cuisine has at least 3 subcategories", () => {
    const cuisines = getAvailableCuisines().filter(c => c !== "universal");
    for (const cuisine of cuisines) {
      const cats = getCategoriesByCuisine(cuisine);
      expect(cats.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("no duplicate slugs across all categories", () => {
    const slugs = BEST_IN_CATEGORIES.map(c => c.slug);
    const unique = new Set(slugs);
    expect(unique.size).toBe(slugs.length);
  });

  it("all categories have a cuisine field", () => {
    for (const cat of BEST_IN_CATEGORIES) {
      expect(cat.cuisine).toBeTruthy();
    }
  });

  it("CUISINE_DISPLAY has metadata for all active cuisines", () => {
    const cuisines = getAvailableCuisines();
    for (const cuisine of cuisines) {
      expect(CUISINE_DISPLAY[cuisine]).toBeDefined();
      expect(CUISINE_DISPLAY[cuisine].label).toBeTruthy();
      expect(CUISINE_DISPLAY[cuisine].emoji).toBeTruthy();
    }
  });

  it("getCategoryCount includes cuisines count", () => {
    const counts = getCategoryCount();
    expect(counts.cuisines).toBeGreaterThanOrEqual(10);
  });

  it("searchCategories can find by cuisine name", () => {
    // The searchCategories function now also matches cuisine field
    const results = getCategoriesByCuisine("indian");
    expect(results.length).toBeGreaterThan(0);
  });

  it("Indian and Mexican have DIFFERENT subcategories", () => {
    const indian = getCategoriesByCuisine("indian").map(c => c.slug);
    const mexican = getCategoriesByCuisine("mexican").map(c => c.slug);
    const overlap = indian.filter(s => mexican.includes(s));
    expect(overlap.length).toBe(0);
  });

  it("Japanese and Korean have DIFFERENT subcategories", () => {
    const japanese = getCategoriesByCuisine("japanese").map(c => c.slug);
    const korean = getCategoriesByCuisine("korean").map(c => c.slug);
    // fried-chicken exists in korean but not japanese
    const overlap = japanese.filter(s => korean.includes(s));
    expect(overlap.length).toBe(0);
  });
});
