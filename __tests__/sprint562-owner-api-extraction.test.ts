/**
 * Sprint 562: Owner API extraction from lib/api.ts
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 562: Owner API Extraction", () => {
  describe("extracted file — api-owner.ts", () => {
    const src = readFile("lib/api-owner.ts");

    it("exists as standalone module", () => {
      expect(src).toBeDefined();
      expect(src.length).toBeGreaterThan(0);
    });

    it("has Sprint 562 extraction comment", () => {
      expect(src).toContain("Sprint 562");
    });

    it("exports ReferralEntry and ReferralStats", () => {
      expect(src).toContain("export interface ReferralEntry");
      expect(src).toContain("export interface ReferralStats");
    });

    it("exports fetchReferralStats and validateReferralCode", () => {
      expect(src).toContain("export async function fetchReferralStats");
      expect(src).toContain("export async function validateReferralCode");
    });

    it("exports category suggestion functions", () => {
      expect(src).toContain("export async function submitCategorySuggestion");
      expect(src).toContain("export interface CategorySuggestionItem");
      expect(src).toContain("export async function fetchCategorySuggestions");
      expect(src).toContain("export async function reviewCategorySuggestion");
    });

    it("exports badge functions", () => {
      expect(src).toContain("export async function awardBadgeApi");
      expect(src).toContain("export async function fetchEarnedBadges");
      expect(src).toContain("export interface BadgeLeaderboardEntry");
      expect(src).toContain("export async function fetchBadgeLeaderboard");
    });

    it("exports rating edit/delete", () => {
      expect(src).toContain("export async function editRatingApi");
      expect(src).toContain("export async function deleteRatingApi");
    });

    it("exports RatingPhotoData and fetchRatingPhotos", () => {
      expect(src).toContain("export interface RatingPhotoData");
      expect(src).toContain("export async function fetchRatingPhotos");
    });

    it("exports HoursUpdate and updateBusinessHours", () => {
      expect(src).toContain("export interface HoursUpdate");
      expect(src).toContain("export async function updateBusinessHours");
    });

    it("has own apiFetch helper", () => {
      expect(src).toContain("async function apiFetch");
    });

    it("imports getApiUrl and fetch", () => {
      expect(src).toContain("getApiUrl");
      expect(src).toContain('from "expo/fetch"');
    });

    it("is under 220 LOC", () => {
      const loc = src.split("\n").length;
      expect(loc).toBeLessThan(220);
    });
  });

  describe("api.ts after extraction", () => {
    const src = readFile("lib/api.ts");

    it("re-exports owner types from api-owner.ts", () => {
      expect(src).toContain('from "./api-owner"');
    });

    it("re-exports ReferralStats type", () => {
      expect(src).toContain("type ReferralStats");
    });

    it("re-exports HoursUpdate type", () => {
      expect(src).toContain("type HoursUpdate");
    });

    it("re-exports RatingPhotoData type", () => {
      expect(src).toContain("type RatingPhotoData");
    });

    it("re-exports BadgeLeaderboardEntry type", () => {
      expect(src).toContain("type BadgeLeaderboardEntry");
    });

    it("re-exports owner functions", () => {
      expect(src).toContain("fetchReferralStats");
      expect(src).toContain("updateBusinessHours");
      expect(src).toContain("fetchRatingPhotos");
      expect(src).toContain("editRatingApi");
    });

    it("no longer defines owner functions inline", () => {
      expect(src).not.toContain("export async function fetchReferralStats");
      expect(src).not.toContain("export async function updateBusinessHours");
      expect(src).not.toContain("export interface RatingPhotoData {");
    });

    it("retains core leaderboard/search functions", () => {
      expect(src).toContain("export interface ApiBusiness");
      expect(src).toContain("export async function fetchLeaderboard");
      expect(src).toContain("export async function fetchBusinessBySlug");
      expect(src).toContain("export async function fetchBusinessSearch");
    });

    it("dropped from 691 to under 575 LOC", () => {
      const loc = src.split("\n").length;
      expect(loc).toBeLessThan(575);
      expect(loc).toBeGreaterThan(500);
    });
  });

  describe("thresholds.json updated", () => {
    const thresholds = JSON.parse(readFile("shared/thresholds.json"));

    it("api.ts threshold lowered", () => {
      const entry = thresholds.files["lib/api.ts"];
      expect(entry.maxLOC).toBeLessThanOrEqual(575);
    });

    it("api-owner.ts tracked", () => {
      const entry = thresholds.files["lib/api-owner.ts"];
      expect(entry).toBeDefined();
      expect(entry.maxLOC).toBeLessThanOrEqual(220);
    });
  });
});
