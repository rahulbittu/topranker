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
    // Sprint 563: PhotoCarouselModal extracted to own component
    const modalSrc = readFile("components/business/PhotoCarouselModal.tsx");

    it("imports PhotoCarouselModal from extracted component", () => {
      expect(src).toContain("PhotoCarouselModal");
      expect(src).toContain("./PhotoCarouselModal");
    });

    it("imports fetchRatingPhotos from api", () => {
      expect(src).toContain("fetchRatingPhotos");
      expect(src).toContain("RatingPhotoData");
    });

    it("has PhotoCarouselModal component", () => {
      expect(src).toContain("PhotoCarouselModal");
    });

    it("carousel uses horizontal pagingEnabled FlatList", () => {
      // Sprint 563: moved to extracted component
      expect(modalSrc).toContain("horizontal");
      expect(modalSrc).toContain("pagingEnabled");
    });

    it("badges are tappable with TouchableOpacity", () => {
      expect(src).toContain("onPress={openCarousel}");
    });

    it("shows View Photos instead of Photo Verified", () => {
      expect(src).toContain("View Photos");
    });

    it("has chevron-forward icon hinting tappability", () => {
      expect(src).toContain("chevron-forward");
    });

    it("carousel has close button", () => {
      // Sprint 563: moved to extracted component
      expect(modalSrc).toContain("carouselClose");
      expect(modalSrc).toContain("close-circle");
    });

    it("carousel shows receipt badge overlay", () => {
      // Sprint 563: moved to extracted component
      expect(modalSrc).toContain("carouselReceiptBadge");
      expect(modalSrc).toContain("isVerifiedReceipt");
    });

    it("carousel shows photo count", () => {
      // Sprint 563: moved to extracted component
      expect(modalSrc).toContain("carouselCount");
    });

    it("handles loading state with ActivityIndicator", () => {
      // Sprint 563: ActivityIndicator moved to extracted component
      expect(modalSrc).toContain("ActivityIndicator");
      expect(src).toContain("photosLoading");
    });

    it("handles empty photos state", () => {
      // Sprint 563: moved to extracted component
      expect(modalSrc).toContain("No photos available");
    });

    it("uses on-demand fetch with React Query caching", () => {
      // Sprint 559: Replaced manual catch with useQuery (enabled: false)
      expect(src).toContain("enabled: false");
      expect(src).toContain("staleTime");
    });

    it("has carousel styles in extracted component", () => {
      // Sprint 563: carousel styles moved to PhotoCarouselModal
      expect(modalSrc).toContain("carouselOverlay");
      expect(modalSrc).toContain("carouselSlide");
      expect(modalSrc).toContain("carouselImage");
    });
  });

  describe("lib/api.ts (fetchRatingPhotos)", () => {
    // Sprint 562: Extracted to api-owner.ts, re-exported from api.ts
    const src = readFile("lib/api-owner.ts");

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
