/**
 * Sprint 389: Challenger Round Timer UI
 *
 * Verifies live countdown display with segmented DD:HH:MM:SS format,
 * urgency color system, and second-by-second updates.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ── 1. Live countdown interval ──────────────────────────────────────

describe("Sprint 389 — Live countdown interval", () => {
  const src = readFile("app/(tabs)/challenger.tsx");

  it("uses 1-second interval for live updates", () => {
    expect(src).toContain("1000");
    expect(src).toContain("setInterval");
  });

  it("tracks seconds state", () => {
    expect(src).toContain("setSeconds");
  });

  it("calculates seconds from endTs", () => {
    expect(src).toContain("% 60");
  });
});

// ── 2. Urgency color system ─────────────────────────────────────────

describe("Sprint 389 — Urgency colors", () => {
  const src = readFile("app/(tabs)/challenger.tsx");

  it("defines urgencyColor variable", () => {
    expect(src).toContain("urgencyColor");
  });

  it("uses red for under 6 hours", () => {
    expect(src).toContain("hoursRemaining < 6");
    expect(src).toContain("Colors.red");
  });

  it("uses amber for under 24 hours", () => {
    expect(src).toContain("hoursRemaining < 24");
    expect(src).toContain("AMBER");
  });

  it("uses green for over 24 hours", () => {
    expect(src).toContain("Colors.green");
  });
});

// ── 3. Segmented timer display ──────────────────────────────────────

describe("Sprint 389 — Segmented timer display", () => {
  const src = readFile("app/(tabs)/challenger.tsx");

  it("shows DAYS segment", () => {
    expect(src).toContain("DAYS");
    expect(src).toContain("countdown.days");
  });

  it("shows HRS segment", () => {
    expect(src).toContain("HRS");
    expect(src).toContain("countdown.hours");
  });

  it("shows MIN segment", () => {
    expect(src).toContain("MIN");
    expect(src).toContain("countdown.minutes");
  });

  it("shows SEC segment", () => {
    expect(src).toContain("SEC");
    expect(src).toContain("seconds");
  });

  it("zero-pads all segments", () => {
    const padCount = (src.match(/padStart\(2, "0"\)/g) || []).length;
    expect(padCount).toBeGreaterThanOrEqual(4);
  });

  it("uses colon separators", () => {
    expect(src).toContain("timerColon");
  });
});

// ── 4. Timer styles ─────────────────────────────────────────────────

describe("Sprint 389 — Timer styles", () => {
  const src = readFile("app/(tabs)/challenger.tsx");

  it("has timerSegments style", () => {
    expect(src).toContain("timerSegments:");
  });

  it("has timerSegment style", () => {
    expect(src).toContain("timerSegment:");
  });

  it("has timerSegmentNum style with bold font", () => {
    expect(src).toContain("timerSegmentNum:");
    expect(src).toContain("PlayfairDisplay_700Bold");
  });

  it("has timerSegmentLabel style", () => {
    expect(src).toContain("timerSegmentLabel:");
  });

  it("has timerColon style", () => {
    expect(src).toContain("timerColon:");
  });
});
