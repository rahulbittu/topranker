/**
 * Sprint 402: Business Photo Gallery Improvements
 *
 * Verifies photo count badge, "see all" overlay, photo index,
 * community label, and "add your photo" CTA.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ── 1. Photo count badge ────────────────────────────────────────────

describe("Sprint 402 — Photo count badge", () => {
  const src = readFile("components/business/PhotoGallery.tsx");

  it("has photo count badge", () => {
    expect(src).toContain("photoBadge");
    expect(src).toContain("photoBadgeText");
  });

  it("shows total photo count", () => {
    expect(src).toContain("photoUrls.length");
  });

  it("uses camera icon", () => {
    expect(src).toContain('"camera"');
  });
});

// ── 2. Photo index badge ────────────────────────────────────────────

describe("Sprint 402 — Photo index on featured", () => {
  const src = readFile("components/business/PhotoGallery.tsx");

  it("has photo index badge on featured image", () => {
    expect(src).toContain("photoIndexBadge");
    expect(src).toContain("photoIndexText");
  });

  it("shows '1 of N' text", () => {
    expect(src).toContain("1 of {photoUrls.length}");
  });
});

// ── 3. See all overlay ──────────────────────────────────────────────

describe("Sprint 402 — See all overlay", () => {
  const src = readFile("components/business/PhotoGallery.tsx");

  it("has see all overlay on last grid image", () => {
    expect(src).toContain("seeAllOverlay");
    expect(src).toContain("See all");
  });

  it("shows overflow count", () => {
    expect(src).toContain("overflowCount");
  });

  it("has overlay styles", () => {
    expect(src).toContain("seeAllText:");
    expect(src).toContain("seeAllLabel:");
  });
});

// ── 4. Community photo label ────────────────────────────────────────

describe("Sprint 402 — Community photo label", () => {
  const src = readFile("components/business/PhotoGallery.tsx");

  it("has communityPhotoCount prop", () => {
    expect(src).toContain("communityPhotoCount");
  });

  it("shows 'from community' label", () => {
    expect(src).toContain("from community");
    expect(src).toContain("communityLabel");
  });
});

// ── 5. Add photo CTA ───────────────────────────────────────────────

describe("Sprint 402 — Add photo CTA", () => {
  const src = readFile("components/business/PhotoGallery.tsx");

  it("has add photo CTA", () => {
    expect(src).toContain("addPhotoCta");
    expect(src).toContain("Add your photo");
  });

  it("calls onAddPhoto callback", () => {
    expect(src).toContain("onAddPhoto");
  });

  it("has CTA styles", () => {
    expect(src).toContain("addPhotoCta:");
    expect(src).toContain("addPhotoText:");
  });
});

// ── 6. Integration with business detail ─────────────────────────────

describe("Sprint 402 — Business detail integration", () => {
  const src = readFile("app/business/[id].tsx");

  it("passes onAddPhoto to PhotoGallery", () => {
    expect(src).toContain("onAddPhoto=");
  });

  it("opens upload sheet on add photo", () => {
    // Sprint 438: Changed from rate navigation to photo upload sheet
    expect(src).toContain("setUploadSheetVisible(true)");
  });
});

// ── 7. Existing features preserved ──────────────────────────────────

describe("Sprint 402 — Existing gallery features preserved", () => {
  const src = readFile("components/business/PhotoGallery.tsx");

  it("still has featured image", () => {
    expect(src).toContain("featured:");
    expect(src).toContain("16 / 9");
  });

  it("still has grid layout", () => {
    expect(src).toContain("gridImage");
    expect(src).toContain("row:");
  });

  it("still uses SafeImage", () => {
    expect(src).toContain("SafeImage");
  });
});
