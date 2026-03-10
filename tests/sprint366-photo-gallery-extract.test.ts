import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

describe("Sprint 366: Extract PhotoGallery component", () => {
  const gallerySrc = readFile("components/business/PhotoGallery.tsx");
  const detailSrc = readFile("app/business/[id].tsx");
  const barrelSrc = readFile("components/business/SubComponents.tsx");

  // ── Component extracted ───────────────────────────────────

  describe("PhotoGallery component", () => {
    it("should export PhotoGallery function", () => {
      expect(gallerySrc).toContain("export function PhotoGallery");
    });

    it("should accept photoUrls and category props", () => {
      expect(gallerySrc).toContain("photoUrls: string[]");
      expect(gallerySrc).toContain("category: string");
    });

    it("should export PhotoGalleryProps interface", () => {
      expect(gallerySrc).toContain("export interface PhotoGalleryProps");
    });

    it("should return null for 1 or fewer photos", () => {
      expect(gallerySrc).toContain("photoUrls.length <= 1");
      expect(gallerySrc).toContain("return null");
    });

    it("should use SafeImage component", () => {
      expect(gallerySrc).toContain("SafeImage");
    });

    it("should have self-contained styles", () => {
      expect(gallerySrc).toContain("StyleSheet.create");
    });
  });

  // ── business/[id].tsx simplified ──────────────────────────

  describe("Business detail uses extracted component", () => {
    it("should import PhotoGallery", () => {
      expect(detailSrc).toContain("PhotoGallery");
    });

    it("should use PhotoGallery component tag", () => {
      expect(detailSrc).toContain("<PhotoGallery");
    });

    it("should pass photoUrls prop", () => {
      expect(detailSrc).toContain("photoUrls={photoUrls}");
    });

    it("should pass category prop", () => {
      expect(detailSrc).toContain("category={business.category}");
    });

    it("should not have inline gallery styles", () => {
      expect(detailSrc).not.toContain("galleryHeader:");
      expect(detailSrc).not.toContain("photoGridFeatured:");
      expect(detailSrc).not.toContain("photoGridRow:");
      expect(detailSrc).not.toContain("photoGridMore:");
    });

    it("should be under 600 LOC after extraction", () => {
      const lines = detailSrc.split("\n").length;
      expect(lines).toBeLessThan(600);
    });
  });

  // ── Barrel export ─────────────────────────────────────────

  describe("SubComponents barrel export", () => {
    it("should export PhotoGallery from barrel", () => {
      expect(barrelSrc).toContain('export { PhotoGallery } from "./PhotoGallery"');
    });

    it("should export PhotoGalleryProps type", () => {
      expect(barrelSrc).toContain('export type { PhotoGalleryProps } from "./PhotoGallery"');
    });
  });
});
