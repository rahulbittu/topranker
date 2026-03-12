/**
 * Sprint 718 — Performance Monitoring Setup
 *
 * Owner: Amir Patel (Architecture)
 *
 * Verifies:
 * - Perf tracker records API calls with duration
 * - Screen mount times tracked per screen
 * - App startup timing (markAppStart → markAppReady)
 * - Named marks with start/stop pattern
 * - Summary statistics calculated correctly
 * - Buffer limits enforced
 * - Wired into _layout.tsx
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  markAppStart, markAppReady, recordApiCall, recordScreenMount,
  startMark, getPerfSummary, getRecentMarks, clearPerfData,
} from "../lib/perf-tracker";
import { BUDGETS, checkBudget, getBudgetReport } from "../lib/performance-budget";

describe("Perf Tracker — API Calls", () => {
  beforeEach(() => clearPerfData());

  it("recordApiCall adds to summary", () => {
    recordApiCall("/api/leaderboard", 150);
    recordApiCall("/api/business/123", 80);
    const summary = getPerfSummary();
    expect(summary.apiCallCount).toBe(2);
    expect(summary.apiAvgMs).toBe(115);
    expect(summary.apiMaxMs).toBe(150);
  });

  it("caps API samples at 200", () => {
    for (let i = 0; i < 250; i++) {
      recordApiCall("/api/test", 10);
    }
    const summary = getPerfSummary();
    expect(summary.apiCallCount).toBeLessThanOrEqual(200);
  });

  it("empty API returns null averages", () => {
    const summary = getPerfSummary();
    expect(summary.apiAvgMs).toBeNull();
    expect(summary.apiMaxMs).toBeNull();
    expect(summary.apiCallCount).toBe(0);
  });
});

describe("Perf Tracker — Screen Mounts", () => {
  beforeEach(() => clearPerfData());

  it("recordScreenMount tracks per screen", () => {
    recordScreenMount("Rankings", 120);
    recordScreenMount("Rankings", 80);
    recordScreenMount("Profile", 200);
    const summary = getPerfSummary();
    expect(summary.screenMounts["Rankings"]).toBe(100); // avg of 120 + 80
    expect(summary.screenMounts["Profile"]).toBe(200);
  });
});

describe("Perf Tracker — App Startup", () => {
  beforeEach(() => clearPerfData());

  it("tracks startup time between markAppStart and markAppReady", () => {
    markAppStart();
    // Simulate some work
    const start = Date.now();
    while (Date.now() - start < 10) {} // ~10ms
    markAppReady();
    const summary = getPerfSummary();
    expect(summary.appStartupMs).toBeGreaterThanOrEqual(5);
    expect(summary.appStartupMs).toBeLessThan(500);
  });

  it("returns null when not both marked", () => {
    markAppStart();
    const summary = getPerfSummary();
    expect(summary.appStartupMs).toBeNull();
  });
});

describe("Perf Tracker — Named Marks", () => {
  beforeEach(() => clearPerfData());

  it("startMark returns stop function that reports duration", () => {
    const stop = startMark("test-operation");
    const start = Date.now();
    while (Date.now() - start < 5) {} // ~5ms
    const duration = stop();
    expect(duration).toBeGreaterThanOrEqual(3);
    expect(duration).toBeLessThan(500);
  });

  it("marks appear in getRecentMarks", () => {
    const stop = startMark("my-mark");
    stop();
    const marks = getRecentMarks();
    expect(marks.length).toBeGreaterThan(0);
    const last = marks[marks.length - 1];
    expect(last.name).toBe("my-mark");
    expect(last.durationMs).toBeDefined();
  });

  it("getRecentMarks respects limit", () => {
    for (let i = 0; i < 30; i++) {
      recordApiCall("/test", 10);
    }
    expect(getRecentMarks(5)).toHaveLength(5);
  });
});

describe("Perf Tracker — Clear", () => {
  it("clearPerfData resets everything", () => {
    markAppStart();
    markAppReady();
    recordApiCall("/api/test", 100);
    recordScreenMount("Home", 50);

    clearPerfData();
    const summary = getPerfSummary();
    expect(summary.appStartupMs).toBeNull();
    expect(summary.apiCallCount).toBe(0);
    expect(Object.keys(summary.screenMounts)).toHaveLength(0);
    expect(getRecentMarks()).toHaveLength(0);
  });
});

describe("Performance Budget Integration", () => {
  it("BUDGETS has 6 metrics", () => {
    expect(BUDGETS).toHaveLength(6);
  });

  it("checkBudget passes for good values", () => {
    expect(checkBudget("ttfb", 100).passed).toBe(true);
    expect(checkBudget("api_response_avg", 150).passed).toBe(true);
  });

  it("checkBudget fails for exceeded values", () => {
    const result = checkBudget("ttfb", 300);
    expect(result.passed).toBe(false);
    expect(result.overage).toBe(100);
  });

  it("getBudgetReport returns all metrics", () => {
    const report = getBudgetReport();
    expect(report).toHaveLength(6);
    expect(report.every((r) => r.actual === null)).toBe(true);
  });

  it("getBudgetReport with actuals marks status correctly", () => {
    const report = getBudgetReport({ ttfb: 300, api_response_avg: 50 });
    const ttfb = report.find((r) => r.metric === "ttfb");
    const api = report.find((r) => r.metric === "api_response_avg");
    expect(ttfb?.status).toBe("exceeded");
    expect(api?.status).toBe("ok");
  });
});

describe("Perf Tracker wired in _layout.tsx", () => {
  let source: string;

  it("loads _layout.tsx", async () => {
    const fs = await import("node:fs");
    source = fs.readFileSync(
      new URL("../app/_layout.tsx", import.meta.url),
      "utf-8",
    );
    expect(source).toBeTruthy();
  });

  it("imports markAppStart and markAppReady", () => {
    expect(source).toContain("import { markAppStart, markAppReady }");
  });

  it("calls markAppStart at module level", () => {
    expect(source).toContain("markAppStart()");
  });

  it("calls markAppReady when splash finishes", () => {
    expect(source).toContain("markAppReady()");
  });
});
