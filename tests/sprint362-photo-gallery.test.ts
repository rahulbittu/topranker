import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

describe("Sprint 362: Business photo gallery improvements", () => {
  const heroSrc = readFile("components/business/HeroCarousel.tsx");
  const detailSrc = readFile("app/business/[id].tsx");
  const gallerySrc = readFile("components/business/PhotoGallery.tsx");

  // ── Hero carousel photo counter ──────────────────────────────

  describe("Photo counter badge (6+ photos)", () => {
    it("should show dots for 2-5 photos", () => {
      expect(heroSrc).toContain("photoUrls.length <= 5");
      expect(heroSrc).toContain("heroDotActive");
    });

    it("should show photo counter badge for 6+ photos", () => {
      expect(heroSrc).toContain("photoUrls.length > 5");
      expect(heroSrc).toContain("photoCountBadge");
    });

    it("should display current/total format", () => {
      expect(heroSrc).toContain("heroPhotoIdx + 1");
      expect(heroSrc).toContain("photoUrls.length");
    });

    it("should use images-outline icon", () => {
      expect(heroSrc).toContain('name="images-outline"');
    });

    it("should position badge at bottom-right", () => {
      expect(heroSrc).toContain("bottom: 10");
      expect(heroSrc).toContain("right: 14");
    });

    it("should use semi-transparent dark background", () => {
      expect(heroSrc).toContain("rgba(0,0,0,0.55)");
    });

    it("should have photoCountText style", () => {
      expect(heroSrc).toContain("photoCountText");
    });
  });

  // ── Masonry photo grid ──────────────────────────────────────

  describe("Photo gallery layout (extracted to PhotoGallery component)", () => {
    it("should show gallery when more than 1 photo (not 3)", () => {
      expect(gallerySrc).toContain("photoUrls.length <= 1");
    });

    it("should have header with title and count", () => {
      expect(gallerySrc).toContain("header");
      expect(gallerySrc).toContain("count");
    });

    it("should display photo count text", () => {
      expect(gallerySrc).toContain("{photoUrls.length} photos");
    });

    it("should have featured first photo (full width)", () => {
      expect(gallerySrc).toContain("featured");
      expect(gallerySrc).toContain("photoUrls[0]");
    });

    it("should use 16:9 aspect ratio for featured photo", () => {
      expect(gallerySrc).toContain("aspectRatio: 16 / 9");
    });

    it("should show remaining photos in 2-column grid", () => {
      expect(gallerySrc).toContain("row");
      expect(gallerySrc).toContain("photoUrls.slice(1, 5)");
    });

    it("should show overflow message for 6+ photos", () => {
      expect(gallerySrc).toContain("photoUrls.length > 5");
      expect(gallerySrc).toContain("more in carousel above");
    });

    it("should use rounded corners on grid container", () => {
      expect(gallerySrc).toContain("borderRadius: 12");
    });
  });

  // ── Style definitions (now in PhotoGallery) ─────────────────

  describe("Gallery styles", () => {
    it("should define header style", () => {
      expect(gallerySrc).toContain("header:");
    });

    it("should define count style", () => {
      expect(gallerySrc).toContain("count:");
    });

    it("should define featured style", () => {
      expect(gallerySrc).toContain("featured:");
    });

    it("should define row style", () => {
      expect(gallerySrc).toContain("row:");
    });

    it("should define more style", () => {
      expect(gallerySrc).toContain("more:");
    });

    it("should use 48.5% width for grid images (2-column)", () => {
      expect(gallerySrc).toContain('"48.5%"');
    });
  });

  // ── Hero carousel structure preserved ───────────────────────

  describe("Hero carousel preserved", () => {
    it("should still have horizontal paging ScrollView", () => {
      expect(heroSrc).toContain("horizontal pagingEnabled");
    });

    it("should still have back button", () => {
      expect(heroSrc).toContain('name="chevron-back"');
    });

    it("should still have bookmark button", () => {
      expect(heroSrc).toContain("onToggleBookmark");
    });

    it("should still have share button", () => {
      expect(heroSrc).toContain("onShare");
    });

    it("should still use SafeImage for photos", () => {
      expect(heroSrc).toContain("SafeImage");
    });

    it("should still have placeholder for no photos", () => {
      expect(heroSrc).toContain("heroImagePlaceholder");
      expect(heroSrc).toContain("LinearGradient");
    });
  });
});
