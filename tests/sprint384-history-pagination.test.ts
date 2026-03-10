/**
 * Sprint 384: Profile Rating History Pagination
 *
 * Verifies paginated rendering (10 per page), Show More/Show Less
 * buttons, and accessibility labels in the profile rating history.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

describe("Sprint 384 — rating history pagination", () => {
  const profileSrc = readFile("app/(tabs)/profile.tsx");

  it("has historyPageSize state with default of 10", () => {
    expect(profileSrc).toContain("historyPageSize");
    expect(profileSrc).toContain("useState(10)");
  });

  it("slices ratingHistory by historyPageSize", () => {
    expect(profileSrc).toContain(".slice(0, historyPageSize)");
  });

  it("has Show More button", () => {
    expect(profileSrc).toContain("Show More");
  });

  it("shows remaining count in Show More label", () => {
    expect(profileSrc).toContain("remaining)");
  });

  it("increments page size by 10 on Show More press", () => {
    expect(profileSrc).toContain("prev + 10");
  });

  it("has Show Less button", () => {
    expect(profileSrc).toContain("Show Less");
  });

  it("resets to 10 on Show Less press", () => {
    expect(profileSrc).toContain("setHistoryPageSize(10)");
  });

  it("uses chevron-down icon for Show More", () => {
    expect(profileSrc).toContain("chevron-down");
  });

  it("uses chevron-up icon for Show Less", () => {
    expect(profileSrc).toContain("chevron-up");
  });

  it("has showMoreBtn style", () => {
    expect(profileSrc).toContain("showMoreBtn");
  });

  it("has showLessBtn style", () => {
    expect(profileSrc).toContain("showLessBtn");
  });

  it("has accessibility label for Show More", () => {
    expect(profileSrc).toContain("Show more ratings");
  });

  it("has accessibility label for Show Less", () => {
    expect(profileSrc).toContain("Show fewer ratings");
  });

  it("conditionally shows Show More when history exceeds page size", () => {
    expect(profileSrc).toContain("ratingHistory.length > historyPageSize");
  });

  it("conditionally shows Show Less only when expanded beyond default", () => {
    expect(profileSrc).toContain("historyPageSize > 10");
  });

  it("profile.tsx is under 800 LOC", () => {
    const lines = profileSrc.split("\n").length;
    expect(lines).toBeLessThan(800);
  });
});
