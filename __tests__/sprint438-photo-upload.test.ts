/**
 * Sprint 438 — Business Page Photo Upload Flow
 *
 * Validates:
 * 1. PhotoUploadSheet component structure
 * 2. Image picker integration (camera + gallery)
 * 3. Upload endpoint in routes-businesses
 * 4. Moderation queue integration
 * 5. Business page wiring
 * 6. File health
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const sheetSrc = readFile("components/business/PhotoUploadSheet.tsx");
const routesSrc = readFile("server/routes-businesses.ts");
const bizPageSrc = readFile("app/business/[id].tsx");

// ---------------------------------------------------------------------------
// 1. PhotoUploadSheet component
// ---------------------------------------------------------------------------
describe("PhotoUploadSheet — component", () => {
  it("exports PhotoUploadSheet", () => {
    expect(sheetSrc).toContain("export function PhotoUploadSheet");
  });

  it("exports PhotoUploadSheetProps", () => {
    expect(sheetSrc).toContain("export interface PhotoUploadSheetProps");
  });

  it("accepts visible prop", () => {
    expect(sheetSrc).toContain("visible: boolean");
  });

  it("accepts onClose callback", () => {
    expect(sheetSrc).toContain("onClose: () => void");
  });

  it("accepts businessId", () => {
    expect(sheetSrc).toContain("businessId: string");
  });

  it("accepts businessName", () => {
    expect(sheetSrc).toContain("businessName: string");
  });

  it("accepts onUploadSuccess callback", () => {
    expect(sheetSrc).toContain("onUploadSuccess");
  });

  it("uses Modal for bottom sheet", () => {
    expect(sheetSrc).toContain("<Modal");
    expect(sheetSrc).toContain('animationType="slide"');
  });
});

// ---------------------------------------------------------------------------
// 2. Image picker
// ---------------------------------------------------------------------------
describe("PhotoUploadSheet — image picker", () => {
  it("imports expo-image-picker", () => {
    expect(sheetSrc).toContain("expo-image-picker");
  });

  it("has pickFromGallery function", () => {
    expect(sheetSrc).toContain("pickFromGallery");
  });

  it("has pickFromCamera function", () => {
    expect(sheetSrc).toContain("pickFromCamera");
  });

  it("requests media library permission", () => {
    expect(sheetSrc).toContain("requestMediaLibraryPermissionsAsync");
  });

  it("requests camera permission", () => {
    expect(sheetSrc).toContain("requestCameraPermissionsAsync");
  });

  it("uses base64 encoding", () => {
    expect(sheetSrc).toContain("base64: true");
  });

  it("allows editing with 4:3 aspect ratio", () => {
    expect(sheetSrc).toContain("allowsEditing: true");
    expect(sheetSrc).toContain("aspect: [4, 3]");
  });

  it("has camera button", () => {
    expect(sheetSrc).toContain("Camera");
    expect(sheetSrc).toContain('"camera"');
  });

  it("has gallery button", () => {
    expect(sheetSrc).toContain("Gallery");
    expect(sheetSrc).toContain('"images"');
  });
});

// ---------------------------------------------------------------------------
// 3. Upload flow
// ---------------------------------------------------------------------------
describe("PhotoUploadSheet — upload flow", () => {
  it("has handleUpload function", () => {
    expect(sheetSrc).toContain("handleUpload");
  });

  it("posts to /api/businesses/:id/photos", () => {
    expect(sheetSrc).toContain("/api/businesses/");
    expect(sheetSrc).toContain("/photos");
  });

  it("sends base64 data and mimeType", () => {
    expect(sheetSrc).toContain("data: photo.base64");
    expect(sheetSrc).toContain("mimeType: photo.mimeType");
  });

  it("shows uploading state", () => {
    expect(sheetSrc).toContain("uploading");
    expect(sheetSrc).toContain("ActivityIndicator");
  });

  it("shows success state with message", () => {
    expect(sheetSrc).toContain("Photo submitted");
    expect(sheetSrc).toContain("after review");
  });

  it("has preview with remove button", () => {
    expect(sheetSrc).toContain("previewImage");
    expect(sheetSrc).toContain("removeBtn");
  });

  it("shows moderation notice", () => {
    expect(sheetSrc).toContain("reviewed before appearing");
    expect(sheetSrc).toContain("shield-checkmark-outline");
  });

  it("has haptic feedback", () => {
    expect(sheetSrc).toContain("Haptics.impactAsync");
    expect(sheetSrc).toContain("Haptics.notificationAsync");
  });
});

// ---------------------------------------------------------------------------
// 4. Server endpoint
// ---------------------------------------------------------------------------
describe("routes-businesses — community photo upload", () => {
  it("has POST /api/businesses/:id/photos endpoint", () => {
    expect(routesSrc).toContain('app.post("/api/businesses/:id/photos"');
  });

  it("requires authentication", () => {
    const endpoint = routesSrc.slice(
      routesSrc.indexOf('"/api/businesses/:id/photos"'),
      routesSrc.indexOf("community-photos")
    );
    expect(endpoint).toContain("requireAuth");
  });

  it("validates mime type", () => {
    expect(routesSrc).toContain("ALLOWED_MIME");
    expect(routesSrc).toContain("image/jpeg");
    expect(routesSrc).toContain("image/png");
    expect(routesSrc).toContain("image/webp");
  });

  it("validates file size limits", () => {
    expect(routesSrc).toContain("MAX_SIZE");
    expect(routesSrc).toContain("MIN_SIZE");
  });

  it("uploads to file storage", () => {
    expect(routesSrc).toContain("fileStorage.upload");
  });

  it("uses community-photos CDN key prefix", () => {
    expect(routesSrc).toContain("community-photos/");
  });

  it("submits to moderation queue", () => {
    expect(routesSrc).toContain("submitPhoto");
    expect(routesSrc).toContain("photo-moderation");
  });

  it("returns submission status", () => {
    expect(routesSrc).toContain("submitted for review");
    expect(routesSrc).toContain("status: result.status");
  });
});

// ---------------------------------------------------------------------------
// 5. Business page integration
// ---------------------------------------------------------------------------
describe("business/[id].tsx — upload sheet wiring", () => {
  it("imports PhotoUploadSheet", () => {
    expect(bizPageSrc).toContain('import { PhotoUploadSheet }');
  });

  it("has uploadSheetVisible state", () => {
    expect(bizPageSrc).toContain("uploadSheetVisible");
    expect(bizPageSrc).toContain("setUploadSheetVisible");
  });

  it("opens upload sheet from PhotoGallery onAddPhoto", () => {
    expect(bizPageSrc).toContain("setUploadSheetVisible(true)");
  });

  it("renders PhotoUploadSheet component", () => {
    expect(bizPageSrc).toContain("<PhotoUploadSheet");
  });

  it("passes businessId and businessName", () => {
    expect(bizPageSrc).toContain("businessId={business.id}");
    expect(bizPageSrc).toContain("businessName={business.name}");
  });

  it("refetches on upload success", () => {
    expect(bizPageSrc).toContain("onUploadSuccess={() => refetch()}");
  });
});

// ---------------------------------------------------------------------------
// 6. File health
// ---------------------------------------------------------------------------
describe("file health", () => {
  it("PhotoUploadSheet under 400 LOC", () => {
    expect(sheetSrc.split("\n").length).toBeLessThan(400);
  });

  it("business/[id].tsx under 650 LOC threshold", () => {
    expect(bizPageSrc.split("\n").length).toBeLessThan(650);
  });

  it("routes-businesses.ts under 385 LOC", () => {
    // Sprint 473: +pagination params parsing + metadata response
    expect(routesSrc.split("\n").length).toBeLessThan(385);
  });
});
