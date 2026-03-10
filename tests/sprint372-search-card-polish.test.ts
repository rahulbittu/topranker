import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

describe("Sprint 372: Search results card polish", () => {
  const subSrc = readFile("components/search/SubComponents.tsx");
  const typesSrc = readFile("types/business.ts");

  // ── Google rating comparison ─────────────────────────────

  describe("Google rating display", () => {
    it("should render Google rating when present and > 0", () => {
      expect(subSrc).toContain("item.googleRating");
      expect(subSrc).toContain("cardGoogleRating");
    });

    it("should format Google rating with G prefix", () => {
      expect(subSrc).toContain('G {item.googleRating.toFixed(1)}');
    });

    it("should have cardGoogleRating style", () => {
      expect(subSrc).toContain("cardGoogleRating:");
    });

    it("should guard against null and zero Google rating", () => {
      expect(subSrc).toContain("item.googleRating != null");
      expect(subSrc).toContain("item.googleRating > 0");
    });
  });

  // ── NEW badge ────────────────────────────────────────────

  describe("NEW badge for low-rating businesses", () => {
    it("should render NEW badge for businesses with < 5 ratings", () => {
      expect(subSrc).toContain("item.ratingCount < 5");
      expect(subSrc).toContain("newBadge");
    });

    it("should display NEW text", () => {
      expect(subSrc).toContain("NEW");
      expect(subSrc).toContain("newBadgeText");
    });

    it("should have newBadge style", () => {
      expect(subSrc).toContain("newBadge:");
    });

    it("should have newBadgeText style", () => {
      expect(subSrc).toContain("newBadgeText:");
    });

    it("should only show NEW when ratingCount > 0", () => {
      expect(subSrc).toContain("item.ratingCount > 0");
    });
  });

  // ── Claimed badge ───────────────────────────────────────

  describe("Claimed/verified badge", () => {
    it("should render shield-checkmark icon for claimed businesses", () => {
      expect(subSrc).toContain("item.isClaimed");
      expect(subSrc).toContain('"shield-checkmark"');
    });
  });

  // ── Type additions ──────────────────────────────────────

  describe("MappedBusiness type extensions", () => {
    it("should include googleRating optional field", () => {
      expect(typesSrc).toContain("googleRating?: number");
    });

    it("should include isClaimed optional field", () => {
      expect(typesSrc).toContain("isClaimed?: boolean");
    });
  });

  // ── Style completeness ─────────────────────────────────

  describe("Style definitions", () => {
    it("should define cardGoogleRating style with DMSans font", () => {
      expect(subSrc).toContain("cardGoogleRating:");
      expect(subSrc).toMatch(/cardGoogleRating:.*DMSans/s);
    });

    it("should define newBadge with amber background", () => {
      expect(subSrc).toContain("newBadge:");
    });

    it("should define newBadgeText with bold weight", () => {
      expect(subSrc).toContain("newBadgeText:");
    });
  });

  // ── File size guard ─────────────────────────────────────

  describe("File size", () => {
    it("SubComponents.tsx should be under 700 LOC", () => {
      // Sprint 418: Map improvements added beta cities, search-area button, info windows
      const lines = subSrc.split("\n").length;
      expect(lines).toBeLessThan(700);
    });
  });
});
