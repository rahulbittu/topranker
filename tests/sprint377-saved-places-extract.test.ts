import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

describe("Sprint 377: Extract SavedPlacesSection from profile", () => {
  const savedSrc = readFile("components/profile/SavedPlacesSection.tsx");
  const profileSrc = readFile("app/(tabs)/profile.tsx");
  const barrelSrc = readFile("components/profile/SubComponents.tsx");

  // ── Extracted component ─────────────────────────────────

  describe("SavedPlacesSection component", () => {
    it("should export SavedPlacesSection function", () => {
      expect(savedSrc).toContain("export function SavedPlacesSection");
    });

    it("should export SavedPlacesSectionProps interface", () => {
      expect(savedSrc).toContain("export interface SavedPlacesSectionProps");
    });

    it("should accept savedList and bookmarkCount props", () => {
      expect(savedSrc).toContain("savedList: BookmarkEntry[]");
      expect(savedSrc).toContain("bookmarkCount: number");
    });

    it("should import BookmarkEntry type", () => {
      expect(savedSrc).toContain("BookmarkEntry");
      expect(savedSrc).toContain("bookmarks-context");
    });

    it("should import SavedRow", () => {
      expect(savedSrc).toContain("SavedRow");
    });

    it("should have self-contained StyleSheet", () => {
      expect(savedSrc).toContain("StyleSheet.create");
    });

    it("should render section header with title", () => {
      expect(savedSrc).toContain("Saved Places");
    });

    it("should render View All link", () => {
      expect(savedSrc).toContain("View All");
      expect(savedSrc).toContain('router.push("/saved")');
    });

    it("should render summary stats row", () => {
      expect(savedSrc).toContain("savedSummary");
      expect(savedSrc).toContain("Places");
      expect(savedSrc).toContain("Categories");
      expect(savedSrc).toContain("Last Saved");
    });

    it("should render empty state with CTA", () => {
      expect(savedSrc).toContain("No saved places yet");
      expect(savedSrc).toContain("Discover Places");
    });
  });

  // ── Profile screen simplified ───────────────────────────

  describe("Profile screen uses extracted component", () => {
    it("should import SavedPlacesSection", () => {
      expect(profileSrc).toContain("SavedPlacesSection");
    });

    it("should render SavedPlacesSection component", () => {
      expect(profileSrc).toContain("<SavedPlacesSection");
    });

    it("should pass savedList prop", () => {
      expect(profileSrc).toContain("savedList={savedList}");
    });

    it("should pass bookmarkCount prop", () => {
      expect(profileSrc).toContain("bookmarkCount={bookmarkCount}");
    });

    it("should not have inline savedSummary styles", () => {
      expect(profileSrc).not.toContain("savedSummary:");
      expect(profileSrc).not.toContain("savedSummaryItem:");
    });

    it("should not have inline savedCtaButton style", () => {
      expect(profileSrc).not.toContain("savedCtaButton:");
    });

    it("should be under 700 LOC after extraction", () => {
      const lines = profileSrc.split("\n").length;
      expect(lines).toBeLessThan(700);
    });
  });

  // ── Barrel export ───────────────────────────────────────

  describe("Barrel export", () => {
    it("should export SavedPlacesSection from SubComponents", () => {
      expect(barrelSrc).toContain("SavedPlacesSection");
    });

    it("should export SavedPlacesSectionProps type", () => {
      expect(barrelSrc).toContain("SavedPlacesSectionProps");
    });
  });
});
