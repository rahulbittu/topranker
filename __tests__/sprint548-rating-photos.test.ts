/**
 * Sprint 548: Rating photo indicators + API integration
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 548: Rating Photo Indicators", () => {
  describe("MappedRating type — photo fields", () => {
    const src = readFile("components/business/types.ts");

    it("has hasPhoto optional field", () => {
      expect(src).toContain("hasPhoto?: boolean");
    });

    it("has hasReceipt optional field", () => {
      expect(src).toContain("hasReceipt?: boolean");
    });

    it("documents Sprint 548", () => {
      expect(src).toContain("Sprint 548");
    });
  });

  describe("ApiRating type — photo fields", () => {
    const src = readFile("lib/api.ts");

    it("has hasPhoto field on ApiRating", () => {
      expect(src).toContain("hasPhoto?: boolean");
    });

    it("has hasReceipt field on ApiRating", () => {
      expect(src).toContain("hasReceipt?: boolean");
    });
  });

  describe("mapApiRating — photo field mapping", () => {
    const src = readFile("lib/api-mappers.ts");

    it("maps hasPhoto from rating", () => {
      expect(src).toContain("hasPhoto: rating.hasPhoto");
    });

    it("maps hasReceipt from rating", () => {
      expect(src).toContain("hasReceipt: rating.hasReceipt");
    });
  });

  describe("RatingPhotoData type + fetch function", () => {
    // Sprint 562: Extracted to api-owner.ts, re-exported from api.ts
    const src = readFile("lib/api-owner.ts");
    const apiSrc = readFile("lib/api.ts");

    it("exports RatingPhotoData interface", () => {
      expect(src).toContain("export interface RatingPhotoData");
    });

    it("RatingPhotoData has photoUrl field", () => {
      expect(src).toContain("photoUrl: string");
    });

    it("RatingPhotoData has isVerifiedReceipt field", () => {
      expect(src).toContain("isVerifiedReceipt: boolean");
    });

    it("exports fetchRatingPhotos function", () => {
      expect(src).toContain("export async function fetchRatingPhotos");
    });

    it("fetchRatingPhotos calls /api/ratings/:id/photos", () => {
      expect(src).toContain("/api/ratings/");
      expect(src).toContain("/photos");
    });

    it("api.ts re-exports RatingPhotoData", () => {
      expect(apiSrc).toContain("RatingPhotoData");
      expect(apiSrc).toContain('from "./api-owner"');
    });
  });

  describe("CollapsibleReviews — photo indicators", () => {
    const src = readFile("components/business/CollapsibleReviews.tsx");

    it("checks rating.hasPhoto", () => {
      expect(src).toContain("rating.hasPhoto");
    });

    it("checks rating.hasReceipt", () => {
      expect(src).toContain("rating.hasReceipt");
    });

    it("shows camera icon for photo-verified ratings", () => {
      expect(src).toContain("camera-outline");
    });

    it("shows receipt icon for receipt-verified ratings", () => {
      expect(src).toContain("receipt-outline");
    });

    it("shows View Photos text", () => {
      // Sprint 552: "Photo Verified" → "View Photos" (tappable carousel)
      expect(src).toContain("View Photos");
    });

    it("shows Receipt Verified text", () => {
      expect(src).toContain("Receipt Verified");
    });

    it("has photoIndicatorRow style", () => {
      expect(src).toContain("photoIndicatorRow");
    });

    it("has photoIndicator style", () => {
      expect(src).toContain("photoIndicator:");
    });

    it("has receiptIndicator style", () => {
      expect(src).toContain("receiptIndicator:");
    });

    it("uses amber color for photo badge", () => {
      expect(src).toContain("BRAND.colors.amber");
    });

    it("uses green color for receipt badge", () => {
      expect(src).toContain("Colors.green");
    });
  });

  describe("Server — getBusinessRatings returns photo fields", () => {
    const src = readFile("server/storage/businesses.ts");

    it("selects hasPhoto from ratings", () => {
      expect(src).toContain("hasPhoto: ratings.hasPhoto");
    });

    it("selects hasReceipt from ratings", () => {
      expect(src).toContain("hasReceipt: ratings.hasReceipt");
    });
  });

  describe("file health", () => {
    it("api.ts stays under 700 LOC", () => {
      // Sprint 554: threshold raised 690 → 700
      const loc = readFile("lib/api.ts").split("\n").length;
      expect(loc).toBeLessThan(700);
    });

    it("CollapsibleReviews.tsx stays under 420 LOC", () => {
      // Sprint 552: +80 LOC for photo carousel modal + tappable badges
      const loc = readFile("components/business/CollapsibleReviews.tsx").split("\n").length;
      expect(loc).toBeLessThan(420);
    });

    it("types.ts stays under 30 LOC", () => {
      const loc = readFile("components/business/types.ts").split("\n").length;
      expect(loc).toBeLessThan(30);
    });
  });
});
