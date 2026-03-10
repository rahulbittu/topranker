/**
 * Sprint 413 — Business Detail Photo Lightbox
 *
 * Validates:
 * 1. PhotoLightbox component structure and props
 * 2. HeroCarousel onPhotoPress integration
 * 3. PhotoGallery onPhotoPress integration
 * 4. business/[id].tsx lightbox state and wiring
 * 5. Accessibility attributes
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const countLines = (content: string) => content.split("\n").length;

// ---------------------------------------------------------------------------
// 1. PhotoLightbox component
// ---------------------------------------------------------------------------
describe("PhotoLightbox component", () => {
  const src = readFile("components/business/PhotoLightbox.tsx");

  it("exports PhotoLightbox function", () => {
    expect(src).toContain("export function PhotoLightbox");
  });

  it("exports PhotoLightboxProps interface", () => {
    expect(src).toContain("export interface PhotoLightboxProps");
  });

  it("accepts visible, photoUrls, initialIndex, category, onClose props", () => {
    expect(src).toContain("visible: boolean");
    expect(src).toContain("photoUrls: string[]");
    expect(src).toContain("initialIndex: number");
    expect(src).toContain("category: string");
    expect(src).toContain("onClose: () => void");
  });

  it("uses Modal component", () => {
    expect(src).toContain("Modal");
    expect(src).toContain('animationType="fade"');
  });

  it("renders photo counter", () => {
    expect(src).toContain("currentIdx + 1");
    expect(src).toContain("photoUrls.length");
  });

  it("uses horizontal paging ScrollView", () => {
    expect(src).toContain("pagingEnabled");
    expect(src).toContain("horizontal");
  });

  it("renders SafeImage with contain fit", () => {
    expect(src).toContain("SafeImage");
    expect(src).toContain('"contain"');
  });

  it("has close button with accessibility", () => {
    expect(src).toContain("Close photo viewer");
    expect(src).toContain('accessibilityRole="button"');
  });

  it("tracks scroll position for counter", () => {
    expect(src).toContain("handleScroll");
    expect(src).toContain("setCurrentIdx");
  });

  it("is a compact component under 160 LOC", () => {
    expect(countLines(src)).toBeLessThan(160);
  });
});

// ---------------------------------------------------------------------------
// 2. HeroCarousel — onPhotoPress
// ---------------------------------------------------------------------------
describe("HeroCarousel — photo press handler", () => {
  const src = readFile("components/business/HeroCarousel.tsx");

  it("accepts onPhotoPress optional prop", () => {
    expect(src).toContain("onPhotoPress?: (index: number) => void");
  });

  it("wraps photos in TouchableOpacity", () => {
    expect(src).toContain("onPress={() => onPhotoPress?.(i)");
  });

  it("has fullscreen accessibility label on photos", () => {
    expect(src).toContain("View photo");
    expect(src).toContain("fullscreen");
  });
});

// ---------------------------------------------------------------------------
// 3. PhotoGallery — onPhotoPress
// ---------------------------------------------------------------------------
describe("PhotoGallery — photo press handler", () => {
  const src = readFile("components/business/PhotoGallery.tsx");

  it("accepts onPhotoPress optional prop", () => {
    expect(src).toContain("onPhotoPress?: (index: number) => void");
  });

  it("featured photo is tappable", () => {
    expect(src).toContain("onPress={() => onPhotoPress?.(0)");
  });

  it("grid photos are tappable", () => {
    expect(src).toContain("onPress={() => onPhotoPress?.(i + 1)");
  });

  it("has fullscreen accessibility label on featured photo", () => {
    expect(src).toContain("View photo 1 of");
  });
});

// ---------------------------------------------------------------------------
// 4. business/[id].tsx — lightbox integration
// ---------------------------------------------------------------------------
describe("business/[id].tsx — lightbox integration", () => {
  const src = readFile("app/business/[id].tsx");

  it("imports PhotoLightbox", () => {
    expect(src).toContain("PhotoLightbox");
    expect(src).toContain("components/business/PhotoLightbox");
  });

  it("has lightbox visibility state", () => {
    expect(src).toContain("lightboxVisible");
    expect(src).toContain("setLightboxVisible");
  });

  it("has lightbox index state", () => {
    expect(src).toContain("lightboxIdx");
    expect(src).toContain("setLightboxIdx");
  });

  it("has openLightbox callback", () => {
    expect(src).toContain("openLightbox");
  });

  it("passes onPhotoPress to HeroCarousel", () => {
    expect(src).toContain("onPhotoPress={openLightbox}");
  });

  it("passes onPhotoPress to PhotoGallery", () => {
    // Both HeroCarousel and PhotoGallery get onPhotoPress
    const matches = src.match(/onPhotoPress={openLightbox}/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBeGreaterThanOrEqual(2);
  });

  it("renders PhotoLightbox component", () => {
    expect(src).toContain("<PhotoLightbox");
  });

  it("passes required props to PhotoLightbox", () => {
    expect(src).toContain("visible={lightboxVisible}");
    expect(src).toContain("initialIndex={lightboxIdx}");
    expect(src).toContain("onClose={() => setLightboxVisible(false)}");
  });

  it("is under 650 LOC threshold", () => {
    expect(countLines(src)).toBeLessThan(650);
  });
});
