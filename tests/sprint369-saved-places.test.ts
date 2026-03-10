import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

describe("Sprint 369: Profile saved places improvements", () => {
  const profileSrc = readFile("app/(tabs)/profile.tsx");

  // ── Saved summary stats ───────────────────────────────────

  describe("Saved places summary", () => {
    it("should show savedSummary section", () => {
      expect(profileSrc).toContain("savedSummary");
    });

    it("should display places count", () => {
      expect(profileSrc).toContain("{bookmarkCount}");
      expect(profileSrc).toContain("Places");
    });

    it("should display unique category count", () => {
      expect(profileSrc).toContain("new Set(savedList.map(e => e.category)).size");
      expect(profileSrc).toContain("Categories");
    });

    it("should display last saved date", () => {
      expect(profileSrc).toContain("Math.max(...savedList.map(e => e.savedAt))");
      expect(profileSrc).toContain("Last Saved");
    });

    it("should format date with month and day", () => {
      expect(profileSrc).toContain('month: "short"');
      expect(profileSrc).toContain('day: "numeric"');
    });

    it("should only show summary when saved list has items", () => {
      expect(profileSrc).toContain("savedList.length > 0 && (");
    });

    it("should have summary dividers between items", () => {
      expect(profileSrc).toContain("savedSummaryDivider");
    });
  });

  // ── Empty state improvement ───────────────────────────────

  describe("Empty state CTA", () => {
    it("should have Discover Places CTA button", () => {
      expect(profileSrc).toContain("savedCtaButton");
      expect(profileSrc).toContain("Discover Places");
    });

    it("should navigate to search tab", () => {
      expect(profileSrc).toContain('router.push("/(tabs)/search")');
    });

    it("should use search icon on CTA", () => {
      expect(profileSrc).toContain('"search-outline"');
    });

    it("should use amber accent on CTA", () => {
      expect(profileSrc).toContain("borderColor: BRAND.colors.amber");
    });
  });

  // ── View All link ─────────────────────────────────────────

  describe("View All link", () => {
    it("should have View All styled link", () => {
      expect(profileSrc).toContain("viewAllLink");
    });

    it("should navigate to /saved", () => {
      expect(profileSrc).toContain('router.push("/saved")');
    });
  });

  // ── Style definitions ─────────────────────────────────────

  describe("New styles", () => {
    it("should define savedSummary style", () => {
      expect(profileSrc).toContain("savedSummary:");
    });

    it("should define savedSummaryItem style", () => {
      expect(profileSrc).toContain("savedSummaryItem:");
    });

    it("should define savedSummaryValue style", () => {
      expect(profileSrc).toContain("savedSummaryValue:");
    });

    it("should define savedSummaryLabel style", () => {
      expect(profileSrc).toContain("savedSummaryLabel:");
    });

    it("should define savedCtaButton style", () => {
      expect(profileSrc).toContain("savedCtaButton:");
    });

    it("should define savedCtaText style", () => {
      expect(profileSrc).toContain("savedCtaText:");
    });

    it("should define viewAllLink style", () => {
      expect(profileSrc).toContain("viewAllLink:");
    });
  });

  // ── Existing functionality preserved ─────────────────────

  describe("Existing saved places preserved", () => {
    it("should still show SavedRow for each entry", () => {
      expect(profileSrc).toContain("SavedRow");
      expect(profileSrc).toContain("savedList.slice(0, 10)");
    });

    it("should still show bookmark count", () => {
      expect(profileSrc).toContain("bookmarkCount");
    });

    it("should still show empty state message", () => {
      expect(profileSrc).toContain("No saved places yet");
    });
  });
});
