/**
 * Sprint 541: Business Photo Gallery — multi-photo display + upload pipeline
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 541: Business Photo Gallery", () => {
  describe("Approval-to-Gallery Pipeline", () => {
    const src = readFile("server/photo-moderation.ts");

    it("imports businessPhotos table", () => {
      expect(src).toContain("businessPhotos");
      expect(src).toContain("@shared/schema");
    });

    it("approvePhoto inserts into businessPhotos after approval", () => {
      expect(src).toContain("insert(businessPhotos)");
      expect(src).toContain("added to gallery");
    });

    it("fetches submission data to populate gallery row", () => {
      expect(src).toContain("submission.businessId");
      expect(src).toContain("submission.url");
      expect(src).toContain("submission.memberId");
    });

    it("calculates next sort order for new gallery photo", () => {
      expect(src).toContain("COALESCE(MAX");
      expect(src).toContain("sortOrder");
    });

    it("sets isHero false for community-uploaded photos", () => {
      expect(src).toContain("isHero: false");
    });

    it("sets uploadedBy to submission memberId", () => {
      expect(src).toContain("uploadedBy: submission.memberId");
    });
  });

  describe("Community Photo Count", () => {
    const src = readFile("server/photo-moderation.ts");

    it("exports getCommunityPhotoCount function", () => {
      expect(src).toContain("export async function getCommunityPhotoCount");
    });

    it("counts photos with non-null uploadedBy", () => {
      expect(src).toContain("uploadedBy");
      expect(src).toContain("IS NOT NULL");
    });

    it("filters by businessId", () => {
      expect(src).toContain("eq(businessPhotos.businessId, businessId)");
    });
  });

  describe("Photo Detail Metadata", () => {
    const src = readFile("server/storage/photos.ts");

    it("exports PhotoDetail interface", () => {
      expect(src).toContain("export interface PhotoDetail");
    });

    it("PhotoDetail has url, uploaderName, uploadDate, isHero, source", () => {
      expect(src).toContain("url: string");
      expect(src).toContain("uploaderName: string | null");
      expect(src).toContain("uploadDate: string");
      expect(src).toContain("isHero: boolean");
      expect(src).toContain('source: "business" | "community"');
    });

    it("exports getBusinessPhotoDetails function", () => {
      expect(src).toContain("export async function getBusinessPhotoDetails");
    });

    it("joins with members table for uploader name", () => {
      expect(src).toContain("members");
      expect(src).toContain("uploaderName");
      expect(src).toContain("leftJoin");
    });

    it("determines source based on uploadedBy", () => {
      expect(src).toContain('"community"');
      expect(src).toContain('"business"');
    });

    it("limits to 20 photos per business", () => {
      expect(src).toContain(".limit(20)");
    });
  });

  describe("Business Detail Route — photoMeta + communityPhotoCount", () => {
    const src = readFile("server/routes-businesses.ts");

    it("imports getBusinessPhotoDetails from storage", () => {
      expect(src).toContain("getBusinessPhotoDetails");
    });

    it("imports getCommunityPhotoCount from photo-moderation", () => {
      expect(src).toContain("getCommunityPhotoCount");
    });

    it("fetches photoDetails and communityCount in parallel", () => {
      expect(src).toContain("photoDetails");
      expect(src).toContain("communityCount");
    });

    it("returns photoMeta in response", () => {
      expect(src).toContain("photoMeta");
    });

    it("returns communityPhotoCount in response", () => {
      expect(src).toContain("communityPhotoCount: communityCount");
    });
  });

  describe("Client — PhotoLightbox receives photoMeta", () => {
    const src = readFile("app/business/[id].tsx");

    it("extracts photoMetaRaw from API response", () => {
      expect(src).toContain("photoMetaRaw");
      expect(src).toContain("photoMeta");
    });

    it("passes photoMeta to PhotoLightbox", () => {
      expect(src).toContain("photoMeta={photoMetaRaw.map");
    });

    it("maps uploaderName, uploadDate, isVerified, source", () => {
      expect(src).toContain("uploaderName");
      expect(src).toContain("uploadDate");
      expect(src).toContain("isVerified");
      expect(src).toContain("source");
    });
  });

  describe("Client — PhotoGallery receives communityPhotoCount", () => {
    const src = readFile("app/business/[id].tsx");

    it("extracts communityPhotoCount from API response", () => {
      expect(src).toContain("communityPhotoCount");
    });

    it("passes communityPhotoCount to PhotoGallery", () => {
      expect(src).toContain("communityPhotoCount={communityPhotoCount}");
    });
  });

  describe("PhotoLightbox supports photoMeta prop", () => {
    const src = readFile("components/business/PhotoLightbox.tsx");

    it("defines photoMeta in props", () => {
      expect(src).toContain("photoMeta?: PhotoMeta[]");
    });

    it("renders PhotoMetadataBar when photoMeta available", () => {
      expect(src).toContain("PhotoMetadataBar");
      expect(src).toContain("photoMeta && photoMeta.length > 0");
    });

    it("imports PhotoMetadataBar and PhotoMeta type", () => {
      expect(src).toContain("import { PhotoMetadataBar, type PhotoMeta }");
    });
  });

  describe("PhotoGallery shows community count", () => {
    const src = readFile("components/business/PhotoGallery.tsx");

    it("accepts communityPhotoCount prop", () => {
      expect(src).toContain("communityPhotoCount");
    });

    it("displays community count when > 0", () => {
      expect(src).toContain("communityPhotoCount > 0");
      expect(src).toContain("from community");
    });
  });
});
