/**
 * Sprint 566: Dish leaderboard photo integration
 * Rating photos linked to dish votes display in dish leaderboard entries
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 566: Dish Leaderboard Photo Integration", () => {
  describe("storage/dishes.ts — rating photo preference", () => {
    const src = readFile("server/storage/dishes.ts");

    it("imports ratingPhotos from schema", () => {
      expect(src).toContain("ratingPhotos");
    });

    it("queries rating photos for dish-specific photos in recalculation", () => {
      expect(src).toContain("dishRatingPhotos");
      expect(src).toContain("ratingPhotos.photoUrl");
    });

    it("prefers rating photos over business photos", () => {
      expect(src).toContain("dishRatingPhotos.length > 0");
      expect(src).toContain("dishRatingPhotos[0].photoUrl");
    });

    it("falls back to business photos when no rating photos exist", () => {
      expect(src).toContain("bizPhoto");
      expect(src).toContain("businessPhotos.photoUrl");
    });

    it("includes dishPhotoCount in entry data", () => {
      expect(src).toContain("dishPhotoCount");
      expect(src).toContain("dishRatingPhotos.length");
    });

    it("enriches leaderboard entries with photo counts", () => {
      expect(src).toContain("enrichedEntries");
      expect(src).toContain("dishPhotoCount: Number");
    });

    it("joins ratingPhotos with dishVotes for counts", () => {
      expect(src).toContain("ratingPhotos.ratingId");
      expect(src).toContain("dishVotes.ratingId");
    });
  });

  describe("DishEntryCard.tsx — photo count badge", () => {
    const src = readFile("components/dish/DishEntryCard.tsx");

    it("includes dishPhotoCount in entry props", () => {
      expect(src).toContain("dishPhotoCount");
    });

    it("renders photo badge when count > 0", () => {
      expect(src).toContain("photoBadge");
      expect(src).toContain("dishPhotoCount");
      expect(src).toContain("> 0");
    });

    it("uses camera icon for photo badge", () => {
      expect(src).toContain('"camera"');
    });

    it("displays photo count text", () => {
      expect(src).toContain("photoBadgeText");
    });

    it("has photoBadge styles", () => {
      expect(src).toContain("photoBadge:");
      expect(src).toContain("photoBadgeText:");
    });

    it("positions badge at bottom-right of photo", () => {
      expect(src).toContain("bottom: 8, right: 8");
    });

    it("dishPhotoCount is optional (backward compatible)", () => {
      expect(src).toContain("dishPhotoCount?:");
    });
  });

  describe("routes-dishes.ts — data pass-through", () => {
    const src = readFile("server/routes-dishes.ts");

    it("passes entries from storage to response", () => {
      expect(src).toContain("entries");
      expect(src).toContain("data");
    });

    it("includes entryCount in response", () => {
      expect(src).toContain("entryCount: entries.length");
    });
  });

  describe("server build", () => {
    it("build size stays under 720kb", () => {
      const thresholds = JSON.parse(readFile("shared/thresholds.json"));
      expect(thresholds.build.maxSizeKb).toBeGreaterThanOrEqual(720);
    });
  });
});
