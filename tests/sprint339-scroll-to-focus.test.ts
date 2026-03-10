/**
 * Sprint 339: Rating Flow Scroll-to-Focus on Small Screens
 *
 * Verifies that the rating flow auto-scrolls to the focused dimension
 * when users answer questions, bringing the next question into view.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const rateSrc = fs.readFileSync(
  path.resolve(__dirname, "..", "app", "rate", "[id].tsx"),
  "utf-8",
);

// ── 1. ScrollView ref ──────────────────────────────────────────────────

describe("Sprint 339 — ScrollView ref", () => {
  it("has scrollViewRef", () => {
    expect(rateSrc).toContain("scrollViewRef");
  });

  it("uses useRef for scrollViewRef", () => {
    expect(rateSrc).toContain("useRef<ScrollView>(null)");
  });

  it("attaches ref to ScrollView", () => {
    expect(rateSrc).toContain("ref={scrollViewRef}");
  });
});

// ── 2. Dimension Y positions ───────────────────────────────────────────

describe("Sprint 339 — dimension Y positions", () => {
  it("has dimensionYPositions ref", () => {
    expect(rateSrc).toContain("dimensionYPositions");
  });

  it("initializes with 4 positions", () => {
    expect(rateSrc).toContain("[0, 0, 0, 0]");
  });

  it("Q1 records Y position on layout", () => {
    expect(rateSrc).toContain("dimensionYPositions.current[0] = e.nativeEvent.layout.y");
  });

  it("Q2 records Y position on layout", () => {
    expect(rateSrc).toContain("dimensionYPositions.current[1] = e.nativeEvent.layout.y");
  });

  it("Q3 records Y position on layout", () => {
    expect(rateSrc).toContain("dimensionYPositions.current[2] = e.nativeEvent.layout.y");
  });

  it("Would Return records Y position on layout", () => {
    expect(rateSrc).toContain("dimensionYPositions.current[3] = e.nativeEvent.layout.y");
  });
});

// ── 3. Auto-scroll effect ──────────────────────────────────────────────

describe("Sprint 339 — auto-scroll effect", () => {
  it("has useEffect for scroll-to-focus", () => {
    expect(rateSrc).toContain("scrollViewRef.current.scrollTo");
  });

  it("scrolls with animation", () => {
    expect(rateSrc).toContain("animated: true");
  });

  it("offsets scroll by 40px for padding", () => {
    expect(rateSrc).toContain("targetY - 40");
  });

  it("only scrolls for dimensions 1-3 (not first question)", () => {
    expect(rateSrc).toContain("focusedDimension >= 1 && focusedDimension <= 3");
  });

  it("guards against zero Y positions", () => {
    expect(rateSrc).toContain("targetY > 0");
  });

  it("clamps scroll to minimum 0", () => {
    expect(rateSrc).toContain("Math.max(0, targetY - 40)");
  });
});
