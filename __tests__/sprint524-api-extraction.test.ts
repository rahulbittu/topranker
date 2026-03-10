/**
 * Sprint 524: api.ts Domain Extraction
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 524: api.ts Domain Extraction", () => {
  describe("lib/api-admin.ts — extracted admin functions", () => {
    const src = readFile("lib/api-admin.ts");

    it("exports AdminClaim interface", () => {
      expect(src).toContain("export interface AdminClaim");
    });

    it("exports AdminFlag interface", () => {
      expect(src).toContain("export interface AdminFlag");
    });

    it("exports ClaimEvidence interface", () => {
      expect(src).toContain("export interface ClaimEvidence");
    });

    it("exports ClaimDocumentMetadata interface", () => {
      expect(src).toContain("export interface ClaimDocumentMetadata");
    });

    it("exports DigestCopyTestStatus interface", () => {
      expect(src).toContain("export interface DigestCopyTestStatus");
    });

    it("exports NotificationTemplate interface", () => {
      expect(src).toContain("export interface NotificationTemplate");
    });

    it("exports AdminMember interface", () => {
      expect(src).toContain("export interface AdminMember");
    });

    it("exports fetchPendingClaims", () => {
      expect(src).toContain("export async function fetchPendingClaims");
    });

    it("exports fetchAllClaimEvidence", () => {
      expect(src).toContain("export async function fetchAllClaimEvidence");
    });

    it("exports reviewAdminClaim", () => {
      expect(src).toContain("export async function reviewAdminClaim");
    });

    it("exports fetchPendingFlags", () => {
      expect(src).toContain("export async function fetchPendingFlags");
    });

    it("exports reviewAdminFlag", () => {
      expect(src).toContain("export async function reviewAdminFlag");
    });

    it("exports fetchAdminMembers", () => {
      expect(src).toContain("export async function fetchAdminMembers");
    });

    it("exports digest copy test functions", () => {
      expect(src).toContain("export async function fetchDigestCopyTestStatus");
      expect(src).toContain("export async function seedDigestCopyTest");
      expect(src).toContain("export async function stopDigestCopyTest");
    });

    it("exports notification template functions", () => {
      expect(src).toContain("export async function fetchNotificationTemplates");
      expect(src).toContain("export async function createNotificationTemplate");
      expect(src).toContain("export async function updateNotificationTemplate");
      expect(src).toContain("export async function deleteNotificationTemplate");
    });

    it("has inline apiFetch and apiRequest helpers", () => {
      expect(src).toContain("async function apiFetch");
      expect(src).toContain("async function apiRequest");
    });

    it("stays under 250 LOC", () => {
      // Sprint 543: +44 LOC for city expansion dashboard API functions
      const lines = src.split("\n").length;
      expect(lines).toBeLessThan(250);
    });
  });

  describe("lib/api.ts — reduced size with re-exports", () => {
    const src = readFile("lib/api.ts");

    it("re-exports admin types from api-admin", () => {
      expect(src).toContain('from "./api-admin"');
    });

    it("re-exports AdminClaim type", () => {
      expect(src).toContain("type AdminClaim");
    });

    it("re-exports AdminFlag type", () => {
      expect(src).toContain("type AdminFlag");
    });

    it("re-exports NotificationTemplate type", () => {
      expect(src).toContain("type NotificationTemplate");
    });

    it("re-exports admin functions", () => {
      expect(src).toContain("fetchPendingClaims");
      expect(src).toContain("reviewAdminClaim");
      expect(src).toContain("fetchAdminMembers");
    });

    it("stays under 650 LOC (was 766)", () => {
      const lines = src.split("\n").length;
      expect(lines).toBeLessThan(650);
    });

    it("retains non-admin exports", () => {
      expect(src).toContain("export interface ApiBusiness");
      expect(src).toContain("export async function fetchLeaderboard");
      expect(src).toContain("export async function fetchBusinessBySlug");
    });
  });
});
