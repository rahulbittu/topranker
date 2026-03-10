import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

describe("Sprint 379: Rating flow photo upload UI", () => {
  const extrasSrc = readFile("components/rate/RatingExtrasStep.tsx");
  const rateSrc = readFile("app/rate/[id].tsx");

  // ── Multi-photo support ─────────────────────────────────

  describe("Multi-photo props", () => {
    it("should accept photoUris array prop", () => {
      expect(extrasSrc).toContain("photoUris?: string[]");
    });

    it("should accept setPhotoUris callback prop", () => {
      expect(extrasSrc).toContain("setPhotoUris?: (uris: string[]) => void");
    });

    it("should define MAX_PHOTOS constant", () => {
      expect(extrasSrc).toContain("MAX_PHOTOS");
    });

    it("should limit to 3 photos max", () => {
      expect(extrasSrc).toContain("MAX_PHOTOS = 3");
    });
  });

  // ── Camera support ──────────────────────────────────────

  describe("Camera option", () => {
    it("should have addPhotoFromCamera function", () => {
      expect(extrasSrc).toContain("addPhotoFromCamera");
    });

    it("should use launchCameraAsync", () => {
      expect(extrasSrc).toContain("launchCameraAsync");
    });

    it("should request camera permissions", () => {
      expect(extrasSrc).toContain("requestCameraPermissionsAsync");
    });

    it("should have camera button with camera-outline icon", () => {
      expect(extrasSrc).toContain('"camera-outline"');
      expect(extrasSrc).toContain("Camera");
    });
  });

  // ── Gallery option ──────────────────────────────────────

  describe("Gallery option", () => {
    it("should have addPhotoFromGallery function", () => {
      expect(extrasSrc).toContain("addPhotoFromGallery");
    });

    it("should use launchImageLibraryAsync", () => {
      expect(extrasSrc).toContain("launchImageLibraryAsync");
    });

    it("should have gallery button with images-outline icon", () => {
      expect(extrasSrc).toContain('"images-outline"');
      expect(extrasSrc).toContain("Gallery");
    });
  });

  // ── Photo thumbnails strip ──────────────────────────────

  describe("Photo thumbnails", () => {
    it("should render photo strip container", () => {
      expect(extrasSrc).toContain("photoStrip");
    });

    it("should render photo thumbnails", () => {
      expect(extrasSrc).toContain("photoThumb");
      expect(extrasSrc).toContain("photoThumbImage");
    });

    it("should have remove button on each thumbnail", () => {
      expect(extrasSrc).toContain("photoThumbRemove");
      expect(extrasSrc).toContain("removePhoto");
    });

    it("should show photo count indicator", () => {
      expect(extrasSrc).toContain("photos.length");
      expect(extrasSrc).toContain("MAX_PHOTOS");
    });
  });

  // ── Action row layout ───────────────────────────────────

  describe("Photo action row", () => {
    it("should have photoActionRow style", () => {
      expect(extrasSrc).toContain("photoActionRow");
    });

    it("should hide add buttons when max photos reached", () => {
      expect(extrasSrc).toContain("canAddMore");
    });
  });

  // ── Accessibility ───────────────────────────────────────

  describe("Accessibility", () => {
    it("should label gallery button", () => {
      expect(extrasSrc).toContain("Add photo from gallery");
    });

    it("should label camera button", () => {
      expect(extrasSrc).toContain("Take a photo with camera");
    });

    it("should label remove button per photo", () => {
      expect(extrasSrc).toContain("Remove photo");
    });
  });

  // ── Rate screen integration ─────────────────────────────

  describe("Rate screen passes multi-photo props", () => {
    it("should have photoUris state", () => {
      expect(rateSrc).toContain("photoUris");
      expect(rateSrc).toContain("setPhotoUris");
    });

    it("should pass photoUris to RatingExtrasStep", () => {
      expect(rateSrc).toContain("photoUris={photoUris}");
      expect(rateSrc).toContain("setPhotoUris={setPhotoUris}");
    });
  });

  // ── File size guard ─────────────────────────────────────

  describe("File size", () => {
    it("RatingExtrasStep should be under 400 LOC", () => {
      const lines = extrasSrc.split("\n").length;
      expect(lines).toBeLessThan(400);
    });

    it("rate/[id].tsx should be under 700 LOC", () => {
      const lines = rateSrc.split("\n").length;
      expect(lines).toBeLessThan(700);
    });
  });
});
