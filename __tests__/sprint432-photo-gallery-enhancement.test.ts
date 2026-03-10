/**
 * Sprint 432 — Business Detail Photo Gallery Enhancement
 *
 * Validates:
 * 1. PhotoMetadataBar component (metadata + thumbnail strip)
 * 2. PhotoLightbox integration with metadata
 * 3. Photo source labels (business, community, rating)
 * 4. Thumbnail navigation
 * 5. File health
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const countLines = (content: string) => content.split("\n").length;

// ---------------------------------------------------------------------------
// 1. PhotoMetadataBar exports
// ---------------------------------------------------------------------------
describe("PhotoMetadataBar — exports", () => {
  const src = readFile("components/business/PhotoMetadataBar.tsx");

  it("exports PhotoMetadataBar component", () => {
    expect(src).toContain("export function PhotoMetadataBar");
  });

  it("exports PhotoMeta interface", () => {
    expect(src).toContain("export interface PhotoMeta");
  });

  it("exports PhotoMetadataBarProps interface", () => {
    expect(src).toContain("export interface PhotoMetadataBarProps");
  });
});

// ---------------------------------------------------------------------------
// 2. Photo metadata features
// ---------------------------------------------------------------------------
describe("PhotoMetadataBar — metadata display", () => {
  const src = readFile("components/business/PhotoMetadataBar.tsx");

  it("shows uploader name", () => {
    expect(src).toContain("uploaderName");
    expect(src).toContain("uploaderText");
  });

  it("shows upload date with relative formatting", () => {
    expect(src).toContain("formatRelativeDate");
    expect(src).toContain("Today");
    expect(src).toContain("Yesterday");
  });

  it("shows verification badge", () => {
    expect(src).toContain("isVerified");
    expect(src).toContain("Verified");
    expect(src).toContain("shield-checkmark");
  });

  it("uses IoniconsName type (no as any)", () => {
    expect(src).toContain("type IoniconsName");
    expect(src).not.toContain("as any");
  });
});

// ---------------------------------------------------------------------------
// 3. Photo source labels
// ---------------------------------------------------------------------------
describe("PhotoMetadataBar — source labels", () => {
  const src = readFile("components/business/PhotoMetadataBar.tsx");

  it("defines business source", () => {
    expect(src).toContain("Business photo");
    expect(src).toContain("storefront-outline");
  });

  it("defines community source", () => {
    expect(src).toContain("Community photo");
    expect(src).toContain("people-outline");
  });

  it("defines rating source", () => {
    expect(src).toContain("From a rating");
    expect(src).toContain("star-outline");
  });
});

// ---------------------------------------------------------------------------
// 4. Thumbnail strip
// ---------------------------------------------------------------------------
describe("PhotoMetadataBar — thumbnail strip", () => {
  const src = readFile("components/business/PhotoMetadataBar.tsx");

  it("renders horizontal thumbnail strip", () => {
    expect(src).toContain("thumbStrip");
    expect(src).toContain("thumbImage");
  });

  it("highlights active thumbnail", () => {
    expect(src).toContain("thumbActive");
    expect(src).toContain("currentIndex");
  });

  it("accepts onThumbnailPress callback", () => {
    expect(src).toContain("onThumbnailPress");
  });
});

// ---------------------------------------------------------------------------
// 5. PhotoLightbox integration
// ---------------------------------------------------------------------------
describe("PhotoLightbox — metadata integration", () => {
  const src = readFile("components/business/PhotoLightbox.tsx");

  it("imports PhotoMetadataBar", () => {
    expect(src).toContain("PhotoMetadataBar");
    expect(src).toContain("PhotoMeta");
  });

  it("accepts optional photoMeta prop", () => {
    expect(src).toContain("photoMeta?: PhotoMeta[]");
  });

  it("renders PhotoMetadataBar when metadata provided", () => {
    expect(src).toContain("<PhotoMetadataBar");
    expect(src).toContain("currentIndex={currentIdx}");
  });

  it("has thumbnail press handler with scrollTo", () => {
    expect(src).toContain("handleThumbnailPress");
    expect(src).toContain("scrollRef");
    expect(src).toContain("scrollTo");
  });
});

// ---------------------------------------------------------------------------
// 6. File health
// ---------------------------------------------------------------------------
describe("file health", () => {
  it("PhotoMetadataBar is under 180 LOC", () => {
    const src = readFile("components/business/PhotoMetadataBar.tsx");
    expect(countLines(src)).toBeLessThan(180);
  });

  it("PhotoLightbox is under 200 LOC", () => {
    const src = readFile("components/business/PhotoLightbox.tsx");
    expect(countLines(src)).toBeLessThan(200);
  });

  it("PhotoGallery is under 200 LOC", () => {
    const src = readFile("components/business/PhotoGallery.tsx");
    expect(countLines(src)).toBeLessThan(200);
  });

  it("business/[id].tsx is under 650 LOC threshold", () => {
    const src = readFile("app/business/[id].tsx");
    expect(countLines(src)).toBeLessThan(650);
  });
});
