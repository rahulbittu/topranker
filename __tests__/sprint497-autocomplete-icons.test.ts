/**
 * Sprint 497: Client-side autocomplete icon differentiation
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 497: Autocomplete Icon Differentiation", () => {
  describe("SearchOverlays.tsx type-based icons", () => {
    const src = readFile("components/search/SearchOverlays.tsx");

    it("checks item.type for dish detection", () => {
      expect(src).toContain('item.type === "dish"');
    });

    it("uses restaurant-outline icon for dish suggestions", () => {
      expect(src).toContain("restaurant-outline");
    });

    it("uses storefront-outline icon for business suggestions", () => {
      expect(src).toContain("storefront-outline");
    });

    it("has typeIconWrap style for circular icon container", () => {
      expect(src).toContain("typeIconWrap");
    });

    it("has distinct typeIconDish style for dish icon background", () => {
      expect(src).toContain("typeIconDish");
    });

    it("applies dish icon background conditionally", () => {
      expect(src).toContain("isDish && styles.typeIconDish");
    });

    it("shows Dish badge for dish-type suggestions", () => {
      expect(src).toContain("dishTypeBadge");
      expect(src).toContain("dishTypeBadgeText");
    });

    it("shows Dish match subtext for dish suggestions", () => {
      expect(src).toContain("Dish match");
    });

    it("retains category display for business suggestions", () => {
      expect(src).toContain("getCategoryDisplay(item.category).label");
    });

    it("retains neighborhood display for business suggestions", () => {
      expect(src).toContain("item.neighborhood");
    });

    it("retains score badge for weighted results", () => {
      expect(src).toContain("scoreBadge");
      expect(src).toContain("weightedScore");
    });

    it("retains chevron-forward icon", () => {
      expect(src).toContain("chevron-forward");
    });

    it("retains HighlightedName for all suggestion types", () => {
      expect(src).toContain("HighlightedName");
    });

    it("retains dish leaderboard matches section", () => {
      expect(src).toContain("dish-${dish.slug}");
      expect(src).toContain("Best ${dish.name}");
    });

    it("retains cuisine category suggestion chips", () => {
      expect(src).toContain("cuisineMatchChip");
      expect(src).toContain("cuisineMatchEmoji");
    });
  });

  describe("AutocompleteSuggestion type field", () => {
    const src = readFile("lib/api.ts");

    it("has optional type field on AutocompleteSuggestion", () => {
      expect(src).toContain("type?:");
      expect(src).toContain('"business"');
      expect(src).toContain('"dish"');
    });

    it("documents type field with Sprint 497 reference", () => {
      expect(src).toContain("Sprint 497");
      expect(src).toContain("icon differentiation");
    });
  });

  describe("file health", () => {
    it("SearchOverlays.tsx under 340 LOC", () => {
      const loc = readFile("components/search/SearchOverlays.tsx").split("\n").length;
      expect(loc).toBeLessThan(340);
    });

    it("api.ts under 700 LOC", () => {
      const loc = readFile("lib/api.ts").split("\n").length;
      expect(loc).toBeLessThan(700);
    });
  });
});
