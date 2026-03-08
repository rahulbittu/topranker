/**
 * Category Registry Tests
 * Owner: Carlos (QA Lead) + Sage (Backend)
 */
import { describe, it, expect } from "vitest";
import {
  CATEGORY_REGISTRY,
  getActiveCategories,
  getCategoryBySlug,
  getCategoriesByVertical,
  getPlannedCategories,
  getVerticals,
  VERTICAL_LABELS,
} from "@/lib/category-registry";

describe("Category Registry", () => {
  it("should have unique slugs", () => {
    const slugs = CATEGORY_REGISTRY.map(c => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("should have required fields on every category", () => {
    for (const cat of CATEGORY_REGISTRY) {
      expect(cat.slug).toBeTruthy();
      expect(cat.label).toBeTruthy();
      expect(cat.emoji).toBeTruthy();
      expect(cat.vertical).toBeTruthy();
      expect(cat.atAGlanceFields.length).toBeGreaterThan(0);
      expect(cat.scoringHints.length).toBeGreaterThan(0);
    }
  });

  it("getActiveCategories returns only active categories", () => {
    const active = getActiveCategories();
    expect(active.length).toBeGreaterThan(10);
    expect(active.every(c => c.isActive)).toBe(true);
  });

  it("getPlannedCategories returns only inactive categories", () => {
    const planned = getPlannedCategories();
    expect(planned.length).toBeGreaterThan(0);
    expect(planned.every(c => !c.isActive)).toBe(true);
  });

  it("getCategoryBySlug returns correct category", () => {
    const restaurant = getCategoryBySlug("restaurant");
    expect(restaurant?.label).toBe("Restaurants");
    expect(restaurant?.vertical).toBe("food");
  });

  it("getCategoryBySlug returns undefined for unknown slug", () => {
    expect(getCategoryBySlug("nonexistent")).toBeUndefined();
  });

  it("getCategoriesByVertical filters correctly", () => {
    const food = getCategoriesByVertical("food");
    expect(food.length).toBeGreaterThan(10);
    expect(food.every(c => c.vertical === "food")).toBe(true);

    const services = getCategoriesByVertical("services");
    expect(services.length).toBeGreaterThan(0);
    expect(services.every(c => c.vertical === "services")).toBe(true);
  });

  it("getVerticals returns all represented verticals", () => {
    const verticals = getVerticals();
    expect(verticals).toContain("food");
    expect(verticals).toContain("services");
    expect(verticals).toContain("wellness");
    expect(verticals).toContain("entertainment");
  });

  it("VERTICAL_LABELS has entries for all verticals", () => {
    const verticals = getVerticals();
    for (const v of verticals) {
      expect(VERTICAL_LABELS[v]).toBeDefined();
      expect(VERTICAL_LABELS[v].label).toBeTruthy();
      expect(VERTICAL_LABELS[v].emoji).toBeTruthy();
    }
  });

  it("food categories match existing CATEGORY_LABELS", () => {
    const active = getActiveCategories();
    const foodSlugs = active.filter(c => c.vertical === "food").map(c => c.slug);
    expect(foodSlugs).toContain("restaurant");
    expect(foodSlugs).toContain("cafe");
    expect(foodSlugs).toContain("bar");
    expect(foodSlugs).toContain("bakery");
  });

  it("planned categories have at-a-glance fields for their domain", () => {
    const barber = getCategoryBySlug("barber");
    expect(barber?.atAGlanceFields).toContain("walkIn");

    const gym = getCategoryBySlug("gym");
    expect(gym?.atAGlanceFields).toContain("equipment");
    expect(gym?.atAGlanceFields).toContain("classes");
  });
});
