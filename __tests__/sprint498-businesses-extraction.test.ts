/**
 * Sprint 498: storage/businesses.ts extraction — dish + photo functions
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 498: storage/businesses.ts Extraction", () => {
  describe("businesses.ts LOC reduction", () => {
    it("storage/businesses.ts under 580 LOC (was 664)", () => {
      const loc = readFile("server/storage/businesses.ts").split("\n").length;
      expect(loc).toBeLessThan(580);
    });

    it("re-exports photo functions from photos.ts", () => {
      const src = readFile("server/storage/businesses.ts");
      expect(src).toContain('from "./photos"');
      expect(src).toContain("getBusinessPhotos");
      expect(src).toContain("getBusinessPhotosMap");
      expect(src).toContain("insertBusinessPhotos");
      expect(src).toContain("getBusinessesWithoutPhotos");
      expect(src).toContain("deleteBusinessPhotos");
    });

    it("no longer directly defines photo functions", () => {
      const src = readFile("server/storage/businesses.ts");
      expect(src).not.toContain("export async function getBusinessPhotos");
      expect(src).not.toContain("export async function getBusinessPhotosMap");
    });

    it("notes dish function moved to dishes.ts", () => {
      const src = readFile("server/storage/businesses.ts");
      expect(src).toContain("getTopDishesForAutocomplete moved to storage/dishes.ts");
    });
  });

  describe("storage/photos.ts new module", () => {
    const src = readFile("server/storage/photos.ts");

    it("exists with Sprint 498 header", () => {
      expect(src).toContain("Sprint 498");
      expect(src).toContain("Extracted from storage/businesses.ts");
    });

    it("exports getBusinessPhotos", () => {
      expect(src).toContain("export async function getBusinessPhotos");
    });

    it("exports getBusinessPhotosMap", () => {
      expect(src).toContain("export async function getBusinessPhotosMap");
    });

    it("exports insertBusinessPhotos", () => {
      expect(src).toContain("export async function insertBusinessPhotos");
    });

    it("exports getBusinessesWithoutPhotos", () => {
      expect(src).toContain("export async function getBusinessesWithoutPhotos");
    });

    it("exports deleteBusinessPhotos", () => {
      expect(src).toContain("export async function deleteBusinessPhotos");
    });

    it("imports from shared schema", () => {
      expect(src).toContain("@shared/schema");
      expect(src).toContain("businessPhotos");
    });
  });

  describe("storage/dishes.ts receives getTopDishesForAutocomplete", () => {
    const src = readFile("server/storage/dishes.ts");

    it("has getTopDishesForAutocomplete function", () => {
      expect(src).toContain("export async function getTopDishesForAutocomplete");
    });

    it("documents the move from businesses.ts", () => {
      expect(src).toContain("Moved from storage/businesses.ts");
    });
  });

  describe("routes-businesses.ts updated import", () => {
    const src = readFile("server/routes-businesses.ts");

    it("imports getTopDishesForAutocomplete from storage/dishes", () => {
      expect(src).toContain("storage/dishes");
      expect(src).toContain("getTopDishesForAutocomplete");
    });
  });

  describe("file health", () => {
    it("storage/photos.ts under 100 LOC", () => {
      const loc = readFile("server/storage/photos.ts").split("\n").length;
      expect(loc).toBeLessThan(100);
    });

    it("storage/dishes.ts under 500 LOC", () => {
      const loc = readFile("server/storage/dishes.ts").split("\n").length;
      expect(loc).toBeLessThan(500);
    });
  });
});
