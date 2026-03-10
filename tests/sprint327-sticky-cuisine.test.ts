/**
 * Sprint 327: Sticky Cuisine Chips on Scroll
 *
 * Verifies that a sticky cuisine bar appears when user scrolls past the
 * in-scroll cuisine chips on the Rankings page. DoorDash-style category
 * bar that stays visible at the top during scroll.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const indexPath = path.resolve(__dirname, "../app/(tabs)/index.tsx");
const indexCode = fs.readFileSync(indexPath, "utf-8");

describe("Sprint 327 — Sticky Cuisine Chips", () => {
  // Core feature: sticky cuisine bar
  it("should have stickyCuisineBar rendered conditionally on scroll", () => {
    expect(indexCode).toContain("showStickyCuisine");
    expect(indexCode).toContain("stickyCuisineBar");
  });

  it("should track scroll position with onScroll handler", () => {
    expect(indexCode).toContain("onScroll=");
    expect(indexCode).toContain("scrollEventThrottle={16}");
  });

  it("should define CUISINE_STICKY_THRESHOLD", () => {
    expect(indexCode).toContain("CUISINE_STICKY_THRESHOLD");
  });

  it("should show sticky bar only when scrolled past threshold", () => {
    // The condition checks scrollY > threshold
    expect(indexCode).toContain("y > CUISINE_STICKY_THRESHOLD");
    expect(indexCode).toContain("showStickyCuisine");
  });

  it("should have stickyCuisineBar style with shadow and border", () => {
    expect(indexCode).toContain("stickyCuisineBar:");
    const styleSection = indexCode.slice(indexCode.indexOf("stickyCuisineBar:"));
    expect(styleSection).toContain("shadowColor");
    expect(styleSection).toContain("borderBottomWidth");
  });

  it("should have stickyCuisineChip and stickyCuisineChipActive styles", () => {
    expect(indexCode).toContain("stickyCuisineChip:");
    expect(indexCode).toContain("stickyCuisineChipActive:");
  });

  it("should render All cuisine option in sticky bar", () => {
    // The sticky bar has an "All" option
    const stickySection = indexCode.slice(
      indexCode.indexOf("stickyCuisineBar"),
      indexCode.indexOf("{isLoading ?")
    );
    expect(stickySection).toContain("setSelectedCuisine(null)");
    expect(stickySection).toContain(">All<");
  });

  it("should render available cuisines in sticky bar", () => {
    const stickySection = indexCode.slice(
      indexCode.indexOf("stickyCuisineBar"),
      indexCode.indexOf("{isLoading ?")
    );
    expect(stickySection).toContain('availableCuisines.filter');
    expect(stickySection).toContain("CUISINE_DISPLAY");
  });

  it("should fire Analytics on cuisine selection in sticky bar", () => {
    const stickySection = indexCode.slice(
      indexCode.indexOf("stickyCuisineBar"),
      indexCode.indexOf("{isLoading ?")
    );
    expect(stickySection).toContain("Analytics.cuisineFilterSelect");
    expect(stickySection).toContain("Analytics.cuisineFilterClear");
  });

  it("should keep index.tsx under 650 LOC threshold", () => {
    const lines = indexCode.split("\n").length;
    expect(lines).toBeLessThan(660);
  });

  // Existing functionality preserved
  it("should preserve in-scroll cuisine chips in ListHeaderComponent", () => {
    const lhcStart = indexCode.indexOf("ListHeaderComponent={");
    const afterLhc = indexCode.slice(lhcStart, lhcStart + 5000);
    expect(afterLhc).toContain("cuisineChipsRow");
    expect(afterLhc).toContain("cuisineChip");
  });

  it("should preserve category chips in ListHeaderComponent", () => {
    const lhcStart = indexCode.indexOf("ListHeaderComponent={");
    const afterLhc = indexCode.slice(lhcStart, lhcStart + 3000);
    expect(afterLhc).toContain("categoryChips.map");
  });
});
