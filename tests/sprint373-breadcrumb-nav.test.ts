import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

describe("Sprint 373: Business detail breadcrumb navigation", () => {
  // Sprint 589: Breadcrumb moved to BusinessHeroSection
  const bizSrc = readFile("components/business/BusinessHeroSection.tsx");

  // ── Breadcrumb structure ────────────────────────────────

  describe("Breadcrumb component", () => {
    it("should render breadcrumb container", () => {
      expect(bizSrc).toContain("styles.breadcrumb");
    });

    it("should have Rankings as first breadcrumb link", () => {
      expect(bizSrc).toContain("Rankings");
      expect(bizSrc).toContain('router.push("/")');
    });

    it("should have category as second breadcrumb link", () => {
      expect(bizSrc).toContain("getCategoryDisplay(business.category).label");
    });

    it("should navigate to search with category filter", () => {
      expect(bizSrc).toContain('pathname: "/(tabs)/search"');
      expect(bizSrc).toContain("category: business.category");
    });

    it("should show business name as current (non-link) breadcrumb", () => {
      expect(bizSrc).toContain("breadcrumbCurrent");
      expect(bizSrc).toContain("business.name");
    });

    it("should use chevron-forward as separator", () => {
      expect(bizSrc).toContain('"chevron-forward"');
    });

    it("should truncate long business names", () => {
      expect(bizSrc).toContain("numberOfLines={1}");
    });
  });

  // ── Accessibility ───────────────────────────────────────

  describe("Breadcrumb accessibility", () => {
    it("should have link role on interactive breadcrumbs", () => {
      expect(bizSrc).toContain('accessibilityRole="link"');
    });

    it("should label Rankings link", () => {
      expect(bizSrc).toContain("Go to Rankings");
    });

    it("should label category link", () => {
      expect(bizSrc).toContain("accessibilityLabel={`View ${getCategoryDisplay(business.category).label}`}");
    });
  });

  // ── Styles ──────────────────────────────────────────────

  describe("Breadcrumb styles", () => {
    it("should define breadcrumb style", () => {
      expect(bizSrc).toContain("breadcrumb:");
    });

    it("should define breadcrumbLink style with amber color", () => {
      expect(bizSrc).toContain("breadcrumbLink:");
      expect(bizSrc).toMatch(/breadcrumbLink:.*amber/s);
    });

    it("should define breadcrumbCurrent style", () => {
      expect(bizSrc).toContain("breadcrumbCurrent:");
    });

    it("should use flexShrink on current breadcrumb for truncation", () => {
      expect(bizSrc).toContain("flexShrink: 1");
    });
  });

  // ── Placement ───────────────────────────────────────────

  describe("Breadcrumb placement", () => {
    it("should appear after HeroCarousel and before BusinessNameCard in JSX", () => {
      const heroIdx = bizSrc.indexOf("<HeroCarousel");
      const breadcrumbIdx = bizSrc.indexOf("styles.breadcrumb");
      const nameCardIdx = bizSrc.indexOf("<BusinessNameCard");
      expect(heroIdx).toBeLessThan(breadcrumbIdx);
      expect(breadcrumbIdx).toBeLessThan(nameCardIdx);
    });
  });

  // ── File size guard ─────────────────────────────────────

  describe("File size", () => {
    it("business/[id].tsx should be under 650 LOC", () => {
      const lines = bizSrc.split("\n").length;
      expect(lines).toBeLessThan(650);
    });
  });
});
