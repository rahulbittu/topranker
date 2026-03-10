/**
 * Sprint 552: Rating photo carousel — tappable badges + modal carousel
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 552: Photo Carousel", () => {
  describe("CollapsibleReviews.tsx (carousel integration)", () => {
    const src = readFile("components/business/CollapsibleReviews.tsx");

    it("imports Modal and FlatList from react-native", () => {
      expect(src).toContain("Modal");
      expect(src).toContain("FlatList");
    });

    it("imports fetchRatingPhotos from api", () => {
      expect(src).toContain("fetchRatingPhotos");
      expect(src).toContain("RatingPhotoData");
    });

    it("has PhotoCarouselModal component", () => {
      expect(src).toContain("PhotoCarouselModal");
    });

    it("carousel uses horizontal pagingEnabled FlatList", () => {
      expect(src).toContain("horizontal");
      expect(src).toContain("pagingEnabled");
    });

    it("badges are tappable with TouchableOpacity", () => {
      // The photoIndicatorRow is now wrapped in TouchableOpacity
      expect(src).toContain("onPress={openCarousel}");
    });

    it("shows View Photos instead of Photo Verified", () => {
      expect(src).toContain("View Photos");
    });

    it("has chevron-forward icon hinting tappability", () => {
      expect(src).toContain("chevron-forward");
    });

    it("carousel has close button", () => {
      expect(src).toContain("carouselClose");
      expect(src).toContain("close-circle");
    });

    it("carousel shows receipt badge overlay", () => {
      expect(src).toContain("carouselReceiptBadge");
      expect(src).toContain("isVerifiedReceipt");
    });

    it("carousel shows photo count", () => {
      expect(src).toContain("carouselCount");
    });

    it("handles loading state with ActivityIndicator", () => {
      expect(src).toContain("ActivityIndicator");
      expect(src).toContain("photosLoading");
    });

    it("handles empty photos state", () => {
      expect(src).toContain("No photos available");
    });

    it("uses fire-and-forget error handling", () => {
      expect(src).toContain("catch");
      expect(src).toContain("fire-and-forget");
    });

    it("has carousel styles", () => {
      expect(src).toContain("carouselOverlay");
      expect(src).toContain("carouselSlide");
      expect(src).toContain("carouselImage");
    });
  });

  describe("lib/api.ts (fetchRatingPhotos)", () => {
    const src = readFile("lib/api.ts");

    it("exports fetchRatingPhotos function", () => {
      expect(src).toContain("export async function fetchRatingPhotos");
    });

    it("exports RatingPhotoData interface", () => {
      expect(src).toContain("export interface RatingPhotoData");
    });

    it("RatingPhotoData has photoUrl and isVerifiedReceipt", () => {
      expect(src).toContain("photoUrl: string");
      expect(src).toContain("isVerifiedReceipt: boolean");
    });
  });

  describe("server route exists", () => {
    const src = readFile("server/routes-rating-photos.ts");

    it("has GET /api/ratings/:id/photos endpoint", () => {
      expect(src).toContain("/api/ratings/:id/photos");
    });
  });
});
