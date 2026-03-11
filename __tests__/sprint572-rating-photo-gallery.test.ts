/**
 * Sprint 572: Rating photo gallery grid
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 572: Rating Photo Gallery Grid", () => {
  describe("RatingPhotoGallery.tsx", () => {
    const src = readFile("components/business/RatingPhotoGallery.tsx");

    it("exports RatingPhotoGallery function", () => {
      expect(src).toContain("export function RatingPhotoGallery");
    });

    it("exports RatingPhotoGalleryProps interface", () => {
      expect(src).toContain("export interface RatingPhotoGalleryProps");
    });

    it("accepts photos, category, maxVisible, delay props", () => {
      expect(src).toContain("photos: RatingPhotoData[]");
      expect(src).toContain("category?:");
      expect(src).toContain("maxVisible?:");
      expect(src).toContain("delay?:");
    });

    it("imports RatingPhotoData type from api-owner", () => {
      expect(src).toContain("RatingPhotoData");
      expect(src).toContain("api-owner");
    });

    it("renders header with images icon and title", () => {
      expect(src).toContain("images-outline");
      expect(src).toContain("Rating Photos");
    });

    it("shows photo count badge", () => {
      expect(src).toContain("countBadge");
      expect(src).toContain("photos.length");
    });

    it("shows verified receipt count", () => {
      expect(src).toContain("receiptCount");
      expect(src).toContain("isVerifiedReceipt");
      expect(src).toContain("verified");
    });

    it("renders 3-column FlatList grid", () => {
      expect(src).toContain("numColumns={GRID_COLS}");
      expect(src).toContain("GRID_COLS = 3");
    });

    it("renders SafeImage for each photo", () => {
      expect(src).toContain("SafeImage");
      expect(src).toContain("item.photoUrl");
    });

    it("shows receipt badge on verified receipt photos", () => {
      expect(src).toContain("receiptBadge");
      expect(src).toContain("receipt-outline");
    });

    it("shows overflow count on last visible photo", () => {
      expect(src).toContain("overflowOverlay");
      expect(src).toContain("overflowCount");
      expect(src).toContain("overflowText");
    });

    it("opens PhotoCarouselModal on photo tap", () => {
      expect(src).toContain("PhotoCarouselModal");
      expect(src).toContain("carouselVisible");
      expect(src).toContain("handlePhotoPress");
    });

    it("has accessible photo labels", () => {
      expect(src).toContain("accessibilityLabel");
      expect(src).toContain("Rating photo");
    });

    it("uses FadeInDown animation", () => {
      expect(src).toContain("FadeInDown");
    });

    it("returns null when no photos", () => {
      expect(src).toContain("photos.length === 0");
      expect(src).toContain("return null");
    });

    it("is under 230 LOC", () => {
      const loc = src.split("\n").length;
      expect(loc).toBeLessThan(230); // Sprint 612: +verifiedPhotoBadge
    });
  });

  describe("business detail page integration", () => {
    const src = readFile("app/business/[id].tsx");

    it("imports RatingPhotoGallery", () => {
      expect(src).toContain('import { RatingPhotoGallery } from "@/components/business/RatingPhotoGallery"');
    });

    it("imports fetchRatingPhotos from api-owner", () => {
      expect(src).toContain("fetchRatingPhotos");
      expect(src).toContain("RatingPhotoData");
    });

    it("aggregates rating photos from ratings with hasPhoto", () => {
      expect(src).toContain("ratingsWithPhotos");
      expect(src).toContain("r.hasPhoto");
    });

    it("fetches all rating photos via Promise.all", () => {
      expect(src).toContain("all-rating-photos");
      expect(src).toContain("Promise.all");
    });

    it("renders RatingPhotoGallery when photos exist", () => {
      expect(src).toContain("<RatingPhotoGallery");
      expect(src).toContain("allRatingPhotos");
    });

    it("conditionally renders based on photo count", () => {
      expect(src).toContain("allRatingPhotos.length > 0");
    });
  });
});
