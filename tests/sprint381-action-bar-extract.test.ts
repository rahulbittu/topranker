import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

describe("Sprint 381: Extract BusinessActionBar from business detail", () => {
  const actionSrc = readFile("components/business/BusinessActionBar.tsx");
  const bizSrc = readFile("app/business/[id].tsx");
  const barrelSrc = readFile("components/business/SubComponents.tsx");

  // ── Extracted component ─────────────────────────────────

  describe("BusinessActionBar component", () => {
    it("should export BusinessActionBar function", () => {
      expect(actionSrc).toContain("export function BusinessActionBar");
    });

    it("should export BusinessActionBarProps interface", () => {
      expect(actionSrc).toContain("export interface BusinessActionBarProps");
    });

    it("should accept business info props", () => {
      expect(actionSrc).toContain("name: string");
      expect(actionSrc).toContain("slug: string");
      expect(actionSrc).toContain("weightedScore: number");
    });

    it("should have handleCall function", () => {
      expect(actionSrc).toContain("handleCall");
      expect(actionSrc).toContain("tel:");
    });

    it("should have handleWebsite function", () => {
      expect(actionSrc).toContain("handleWebsite");
    });

    it("should have handleMaps with platform-specific URLs", () => {
      expect(actionSrc).toContain("handleMaps");
      expect(actionSrc).toContain("google.com/maps");
    });

    it("should have handleShare function", () => {
      expect(actionSrc).toContain("handleShare");
      expect(actionSrc).toContain("Share.share");
    });

    it("should have handleCopyLink function", () => {
      expect(actionSrc).toContain("handleCopyLink");
      expect(actionSrc).toContain("copyShareLink");
    });

    it("should render 5 ActionButtons", () => {
      const matches = actionSrc.match(/ActionButton/g);
      expect(matches).not.toBeNull();
      expect(matches!.length).toBeGreaterThanOrEqual(6); // import + 5 renders
    });

    it("should import ActionButton from same directory", () => {
      expect(actionSrc).toContain('./ActionButton');
    });

    it("should have self-contained actionBar style", () => {
      expect(actionSrc).toContain("StyleSheet.create");
      expect(actionSrc).toContain("actionRow"); // Sprint 627: renamed from actionBar
    });
  });

  // ── Business detail simplified ──────────────────────────

  describe("Business detail uses extracted component", () => {
    it("should import BusinessActionBar", () => {
      expect(bizSrc).toContain("BusinessActionBar");
    });

    it("should render BusinessActionBar component", () => {
      expect(bizSrc).toContain("<BusinessActionBar");
    });

    it("should pass business props to action bar", () => {
      expect(bizSrc).toContain("name={business.name}");
      expect(bizSrc).toContain("slug={business.slug}");
      expect(bizSrc).toContain("phone={business.phone}");
    });

    it("should not import ActionButton directly", () => {
      expect(bizSrc).not.toMatch(/\bActionButton\b/);
    });

    it("should not have inline actionBar style", () => {
      expect(bizSrc).not.toContain("actionBar:");
    });

    it("should be under 650 LOC after extraction", () => {
      const lines = bizSrc.split("\n").length;
      expect(lines).toBeLessThan(650);
    });
  });

  // ── Barrel export ───────────────────────────────────────

  describe("Barrel export", () => {
    it("should export BusinessActionBar from SubComponents", () => {
      expect(barrelSrc).toContain("BusinessActionBar");
    });
  });
});
