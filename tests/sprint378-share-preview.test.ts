import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

describe("Sprint 378: Business share preview card", () => {
  const shareSrc = readFile("components/business/SharePreviewCard.tsx");
  const bizSrc = readFile("app/business/[id].tsx");
  const barrelSrc = readFile("components/business/SubComponents.tsx");

  // ── SharePreviewCard component ──────────────────────────

  describe("SharePreviewCard component", () => {
    it("should export SharePreviewCard function", () => {
      expect(shareSrc).toContain("export function SharePreviewCard");
    });

    it("should export SharePreviewCardProps interface", () => {
      expect(shareSrc).toContain("export interface SharePreviewCardProps");
    });

    it("should accept business info props", () => {
      expect(shareSrc).toContain("businessName: string");
      expect(shareSrc).toContain("slug: string");
      expect(shareSrc).toContain("weightedScore: number");
      expect(shareSrc).toContain("category: string");
    });

    it("should accept action callbacks", () => {
      expect(shareSrc).toContain("onShare: () => void");
      expect(shareSrc).toContain("onCopyLink: () => void");
    });

    it("should display domain label", () => {
      expect(shareSrc).toContain("topranker.app");
    });

    it("should display business name as title", () => {
      expect(shareSrc).toContain("{businessName}");
    });

    it("should display score in preview description", () => {
      expect(shareSrc).toContain("weightedScore.toFixed(1)");
    });

    it("should display rank when available", () => {
      expect(shareSrc).toContain("rank && rank > 0");
    });

    it("should render photo when available", () => {
      expect(shareSrc).toContain("SafeImage");
      expect(shareSrc).toContain("previewImage");
    });

    it("should have Share button", () => {
      expect(shareSrc).toContain("Share");
      expect(shareSrc).toContain("onShare");
    });

    it("should have Copy Link button", () => {
      expect(shareSrc).toContain("Copy Link");
      expect(shareSrc).toContain("onCopyLink");
    });

    it("should have section label", () => {
      expect(shareSrc).toContain("SHARE THIS PLACE");
    });

    it("should use getShareUrl from sharing utility", () => {
      expect(shareSrc).toContain("getShareUrl");
      expect(shareSrc).toContain("@/lib/sharing");
    });
  });

  // ── Business detail integration ─────────────────────────

  describe("Business detail uses SharePreviewCard", () => {
    it("should import SharePreviewCard", () => {
      expect(bizSrc).toContain("SharePreviewCard");
    });

    it("should render SharePreviewCard in JSX", () => {
      expect(bizSrc).toContain("<SharePreviewCard");
    });

    it("should pass business props", () => {
      expect(bizSrc).toContain("businessName={business.name}");
      expect(bizSrc).toContain("slug={business.slug}");
      expect(bizSrc).toContain("weightedScore={business.weightedScore}");
    });

    it("should pass share callbacks", () => {
      expect(bizSrc).toContain("onShare={handleShare}");
      expect(bizSrc).toContain("onCopyLink={handleCopyLink}");
    });
  });

  // ── Barrel export ───────────────────────────────────────

  describe("Barrel export", () => {
    it("should export SharePreviewCard from SubComponents", () => {
      expect(barrelSrc).toContain("SharePreviewCard");
    });
  });

  // ── File size guard ─────────────────────────────────────

  describe("File size", () => {
    it("business/[id].tsx should be under 650 LOC", () => {
      const lines = bizSrc.split("\n").length;
      expect(lines).toBeLessThan(650);
    });

    it("SharePreviewCard should be under 130 LOC", () => {
      const lines = shareSrc.split("\n").length;
      expect(lines).toBeLessThan(130);
    });
  });
});
