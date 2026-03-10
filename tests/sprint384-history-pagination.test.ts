/**
 * Sprint 384: Profile Rating History Pagination
 * Updated Sprint 443: Extracted to RatingHistorySection.tsx
 *
 * Verifies paginated rendering (10 per page), Show More/Show Less
 * buttons, and accessibility labels in the rating history section.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

describe("Sprint 384 — rating history pagination", () => {
  // Sprint 443: Extracted to RatingHistorySection.tsx
  const historySrc = readFile("components/profile/RatingHistorySection.tsx");

  it("has historyPageSize state with default of 10", () => {
    expect(historySrc).toContain("historyPageSize");
    expect(historySrc).toContain("useState(10)");
  });

  it("slices ratingHistory by historyPageSize", () => {
    expect(historySrc).toContain(".slice(0, historyPageSize)");
  });

  it("has Show More button", () => {
    expect(historySrc).toContain("Show More");
  });

  it("shows remaining count in Show More label", () => {
    expect(historySrc).toContain("remaining)");
  });

  it("increments page size by 10 on Show More press", () => {
    expect(historySrc).toContain("prev + 10");
  });

  it("has Show Less button", () => {
    expect(historySrc).toContain("Show Less");
  });

  it("resets to 10 on Show Less press", () => {
    expect(historySrc).toContain("setHistoryPageSize(10)");
  });

  it("uses chevron-down icon for Show More", () => {
    expect(historySrc).toContain("chevron-down");
  });

  it("uses chevron-up icon for Show Less", () => {
    expect(historySrc).toContain("chevron-up");
  });

  it("has showMoreBtn style", () => {
    expect(historySrc).toContain("showMoreBtn");
  });

  it("has showLessBtn style", () => {
    expect(historySrc).toContain("showLessBtn");
  });

  it("has accessibility label for Show More", () => {
    expect(historySrc).toContain("Show more ratings");
  });

  it("has accessibility label for Show Less", () => {
    expect(historySrc).toContain("Show fewer ratings");
  });

  it("conditionally shows Show More when history exceeds page size", () => {
    expect(historySrc).toContain("ratingHistory.length > historyPageSize");
  });

  it("conditionally shows Show Less only when expanded beyond default", () => {
    expect(historySrc).toContain("historyPageSize > 10");
  });

  it("profile.tsx is under 800 LOC", () => {
    const profileSrc = readFile("app/(tabs)/profile.tsx");
    const lines = profileSrc.split("\n").length;
    expect(lines).toBeLessThan(800);
  });
});
