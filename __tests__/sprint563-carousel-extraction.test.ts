/**
 * Sprint 563: Photo carousel extraction from CollapsibleReviews.tsx
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 563: PhotoCarouselModal Extraction", () => {
  describe("extracted component — PhotoCarouselModal.tsx", () => {
    const src = readFile("components/business/PhotoCarouselModal.tsx");

    it("exists as standalone component", () => {
      expect(src).toBeDefined();
      expect(src.length).toBeGreaterThan(0);
    });

    it("exports PhotoCarouselModal function", () => {
      expect(src).toContain("export function PhotoCarouselModal");
    });

    it("accepts visible, photos, loading, onClose props", () => {
      expect(src).toContain("visible: boolean");
      expect(src).toContain("photos: RatingPhotoData[]");
      expect(src).toContain("loading: boolean");
      expect(src).toContain("onClose: () => void");
    });

    it("uses Modal with fade animation", () => {
      expect(src).toContain("Modal");
      expect(src).toContain('animationType="fade"');
    });

    it("uses horizontal pagingEnabled FlatList", () => {
      expect(src).toContain("FlatList");
      expect(src).toContain("horizontal");
      expect(src).toContain("pagingEnabled");
    });

    it("has close button with close-circle icon", () => {
      expect(src).toContain("close-circle");
      expect(src).toContain("carouselClose");
    });

    it("shows receipt badge overlay", () => {
      expect(src).toContain("carouselReceiptBadge");
      expect(src).toContain("isVerifiedReceipt");
      expect(src).toContain("Receipt");
    });

    it("shows photo count", () => {
      expect(src).toContain("carouselCount");
      expect(src).toContain("photo");
    });

    it("handles loading state", () => {
      expect(src).toContain("ActivityIndicator");
    });

    it("handles empty state", () => {
      expect(src).toContain("No photos available");
    });

    it("has self-contained styles", () => {
      expect(src).toContain("StyleSheet.create");
      expect(src).toContain("carouselOverlay");
      expect(src).toContain("carouselSlide");
      expect(src).toContain("carouselImage");
    });

    it("uses SCREEN_WIDTH for slide dimensions", () => {
      expect(src).toContain("SCREEN_WIDTH");
      expect(src).toContain("Dimensions.get");
    });

    it("is under 90 LOC", () => {
      const loc = src.split("\n").length;
      expect(loc).toBeLessThan(90);
    });
  });

  describe("CollapsibleReviews.tsx after extraction", () => {
    const src = readFile("components/business/CollapsibleReviews.tsx");

    it("imports PhotoCarouselModal from extracted component", () => {
      expect(src).toContain('import { PhotoCarouselModal } from "./PhotoCarouselModal"');
    });

    it("no longer defines PhotoCarouselModal inline", () => {
      expect(src).not.toContain("function PhotoCarouselModal");
    });

    it("no longer has SCREEN_WIDTH constant", () => {
      expect(src).not.toContain("SCREEN_WIDTH");
    });

    it("no longer imports Modal, FlatList, Dimensions, ActivityIndicator", () => {
      expect(src).not.toContain("Modal,");
      expect(src).not.toContain("FlatList,");
      expect(src).not.toContain("Dimensions,");
      expect(src).not.toContain("ActivityIndicator,");
    });

    it("no longer has carousel styles", () => {
      expect(src).not.toContain("carouselOverlay:");
      expect(src).not.toContain("carouselSlide:");
      expect(src).not.toContain("carouselImage:");
    });

    it("still renders PhotoCarouselModal in RatingRow", () => {
      expect(src).toContain("<PhotoCarouselModal");
      expect(src).toContain("photosLoading");
      expect(src).toContain("carouselOpen");
    });

    it("dropped from 407 to under 370 LOC", () => {
      const loc = src.split("\n").length;
      expect(loc).toBeLessThan(370);
      expect(loc).toBeGreaterThan(310);
    });
  });

  describe("thresholds.json updated", () => {
    const thresholds = JSON.parse(readFile("shared/thresholds.json"));

    it("CollapsibleReviews.tsx threshold lowered", () => {
      const entry = thresholds.files["components/business/CollapsibleReviews.tsx"];
      expect(entry.maxLOC).toBeLessThanOrEqual(370);
    });

    it("PhotoCarouselModal.tsx tracked", () => {
      const entry = thresholds.files["components/business/PhotoCarouselModal.tsx"];
      expect(entry).toBeDefined();
      expect(entry.maxLOC).toBeLessThanOrEqual(90);
    });
  });
});
