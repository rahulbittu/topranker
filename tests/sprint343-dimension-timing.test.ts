/**
 * Sprint 343: Analytics dashboard — per-dimension timing
 * - Tracks ms spent on each scoring dimension in rating flow
 * - Fires rate_dimension_timing analytics event on submission
 * - useRatingSubmit accepts dimensionTimingMs option
 */
import { describe, it, expect, beforeAll } from "vitest";
import * as fs from "fs";
import * as path from "path";

let rateSrc = "";
let submitHookSrc = "";

beforeAll(() => {
  rateSrc = fs.readFileSync(path.resolve("app/rate/[id].tsx"), "utf-8");
  submitHookSrc = fs.readFileSync(path.resolve("lib/hooks/useRatingSubmit.ts"), "utf-8");
});

// ── Rate screen timing refs ──────────────────────────────────────
describe("Rate screen dimension timing", () => {
  it("should have dimensionTimingRef for accumulated times", () => {
    expect(rateSrc).toContain("dimensionTimingRef");
    expect(rateSrc).toContain("useRef<number[]>([0, 0, 0, 0])");
  });

  it("should use extracted useDimensionTiming hook", () => {
    expect(rateSrc).toContain("useDimensionTiming(focusedDimension)");
  });

  it("should have timing logic in hook file", () => {
    const hookSrc = require("fs").readFileSync(require("path").resolve("lib/hooks/useRatingAnimations.ts"), "utf-8");
    expect(hookSrc).toContain("timingRef.current[prevDim]");
    expect(hookSrc).toContain("startRef.current");
  });

  it("should calculate prevDim in hook", () => {
    const hookSrc = require("fs").readFileSync(require("path").resolve("lib/hooks/useRatingAnimations.ts"), "utf-8");
    expect(hookSrc).toContain("prevDim = focusedDimension - 1");
  });

  it("should pass dimensionTimingMs to useRatingSubmit", () => {
    expect(rateSrc).toContain("dimensionTimingMs: dimensionTimingRef.current");
  });
});

// ── Submit hook timing support ───────────────────────────────────
describe("useRatingSubmit dimension timing", () => {
  it("should accept dimensionTimingMs in options", () => {
    expect(submitHookSrc).toContain("dimensionTimingMs?: number[]");
  });

  it("should import Analytics", () => {
    expect(submitHookSrc).toContain('import { Analytics }');
  });

  it("should fire rate_dimension_timing event", () => {
    expect(submitHookSrc).toContain('"rate_dimension_timing"');
  });

  it("should include per-dimension ms in analytics event", () => {
    expect(submitHookSrc).toContain("q1Ms:");
    expect(submitHookSrc).toContain("q2Ms:");
    expect(submitHookSrc).toContain("q3Ms:");
    expect(submitHookSrc).toContain("returnMs:");
  });

  it("should include totalMs as sum of all dimensions", () => {
    expect(submitHookSrc).toContain("totalMs:");
    expect(submitHookSrc).toContain(".reduce((a, b) => a + b, 0)");
  });

  it("should only fire when timing data has non-zero values", () => {
    expect(submitHookSrc).toContain("dimensionTimingMs.some(t => t > 0)");
  });

  it("should include businessId in timing event", () => {
    expect(submitHookSrc).toContain("businessId,");
  });

  it("should include visitType in timing event", () => {
    expect(submitHookSrc).toContain("visitType:");
  });
});

// ── Backwards compatibility ──────────────────────────────────────
describe("Sprint 343 backwards compatibility", () => {
  it("should still track total timeOnPageMs", () => {
    expect(rateSrc).toContain("timeOnPageMs: Date.now() - pageEnteredAt");
  });

  it("should still have scroll-to-focus effect", () => {
    expect(rateSrc).toContain("scrollViewRef.current.scrollTo");
  });

  it("should still have animated dimension highlights (via hook)", () => {
    expect(rateSrc).toContain("useDimensionHighlight");
    expect(rateSrc).toContain("dim0Style");
  });

  it("dimensionTimingMs should be optional", () => {
    // The option is marked with ? so it doesn't break existing callers
    expect(submitHookSrc).toContain("dimensionTimingMs?:");
  });
});
