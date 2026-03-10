import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

describe("Sprint 369: Profile saved places improvements", () => {
  const profileSrc = readFile("app/(tabs)/profile.tsx");
  const savedSrc = readFile("components/profile/SavedPlacesSection.tsx");

  // ── Saved summary stats (now in SavedPlacesSection) ─────

  describe("Saved places summary", () => {
    it("should show savedSummary section", () => {
      expect(savedSrc).toContain("savedSummary");
    });

    it("should display places count", () => {
      expect(savedSrc).toContain("{bookmarkCount}");
      expect(savedSrc).toContain("Places");
    });

    it("should display unique category count", () => {
      expect(savedSrc).toContain("new Set(savedList.map(e => e.category)).size");
      expect(savedSrc).toContain("Categories");
    });

    it("should display last saved date", () => {
      expect(savedSrc).toContain("Math.max(...savedList.map(e => e.savedAt))");
      expect(savedSrc).toContain("Last Saved");
    });

    it("should format date with month and day", () => {
      expect(savedSrc).toContain('month: "short"');
      expect(savedSrc).toContain('day: "numeric"');
    });

    it("should only show summary when saved list has items", () => {
      expect(savedSrc).toContain("savedList.length > 0 && (");
    });

    it("should have summary dividers between items", () => {
      expect(savedSrc).toContain("savedSummaryDivider");
    });
  });

  // ── Empty state improvement (now in SavedPlacesSection) ─

  describe("Empty state CTA", () => {
    it("should have Discover Places CTA button", () => {
      expect(savedSrc).toContain("savedCtaButton");
      expect(savedSrc).toContain("Discover Places");
    });

    it("should navigate to search tab", () => {
      expect(savedSrc).toContain('router.push("/(tabs)/search")');
    });

    it("should use search icon on CTA", () => {
      expect(savedSrc).toContain('"search-outline"');
    });

    it("should use amber accent on CTA", () => {
      expect(savedSrc).toContain("borderColor: AMBER");
    });
  });

  // ── View All link (now in SavedPlacesSection) ───────────

  describe("View All link", () => {
    it("should have View All styled link", () => {
      expect(savedSrc).toContain("viewAllLink");
    });

    it("should navigate to /saved", () => {
      expect(savedSrc).toContain('router.push("/saved")');
    });
  });

  // ── Style definitions (now in SavedPlacesSection) ───────

  describe("New styles", () => {
    it("should define savedSummary style", () => {
      expect(savedSrc).toContain("savedSummary:");
    });

    it("should define savedSummaryItem style", () => {
      expect(savedSrc).toContain("savedSummaryItem:");
    });

    it("should define savedSummaryValue style", () => {
      expect(savedSrc).toContain("savedSummaryValue:");
    });

    it("should define savedSummaryLabel style", () => {
      expect(savedSrc).toContain("savedSummaryLabel:");
    });

    it("should define savedCtaButton style", () => {
      expect(savedSrc).toContain("savedCtaButton:");
    });

    it("should define savedCtaText style", () => {
      expect(savedSrc).toContain("savedCtaText:");
    });

    it("should define viewAllLink style", () => {
      expect(savedSrc).toContain("viewAllLink:");
    });
  });

  // ── Existing functionality preserved ─────────────────────

  describe("Existing saved places preserved", () => {
    it("should still show SavedRow for each entry (in extracted component)", () => {
      expect(savedSrc).toContain("SavedRow");
      expect(savedSrc).toContain("savedList.slice(0, 10)");
    });

    it("should still show bookmark count", () => {
      expect(profileSrc).toContain("bookmarkCount");
    });

    it("should still show empty state message", () => {
      expect(savedSrc).toContain("No saved places yet");
    });
  });

  // ── Profile uses extracted component ────────────────────

  describe("Profile uses SavedPlacesSection", () => {
    it("should import SavedPlacesSection", () => {
      expect(profileSrc).toContain("SavedPlacesSection");
    });

    it("should render SavedPlacesSection with props", () => {
      expect(profileSrc).toContain("<SavedPlacesSection");
      expect(profileSrc).toContain("savedList={savedList}");
      expect(profileSrc).toContain("bookmarkCount={bookmarkCount}");
    });
  });
});
