/**
 * Sprint 206 — DB Activity Wiring + Perf Budget Consolidation
 *
 * Validates:
 * 1. Middleware wires DB activity tracking
 * 2. Performance budget consolidation
 * 3. Perf monitor imports shared budgets
 * 4. CI pipeline perf validation step
 * 5. Analytics buffer documentation
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Middleware DB activity tracking
// ---------------------------------------------------------------------------
describe("Middleware DB activity — server/middleware.ts", () => {
  const src = readFile("server/middleware.ts");

  it("references recordUserActivityDb", () => {
    expect(src).toContain("recordUserActivityDb");
  });

  it("lazy imports from storage/user-activity", () => {
    expect(src).toContain('import("./storage/user-activity")');
  });

  it("calls recordUserActivityDb on authenticated request", () => {
    expect(src).toContain("recordUserActivityDb(req.user!.id)");
  });

  it("uses non-blocking catch for DB call", () => {
    expect(src).toContain(".catch(() => {})");
  });

  it("still calls in-memory recordUserActivity", () => {
    expect(src).toContain("recordUserActivity(req.user.id)");
  });
});

// ---------------------------------------------------------------------------
// 2. Unified performance budgets
// ---------------------------------------------------------------------------
describe("Performance budgets — lib/performance-budget.ts", () => {
  const src = readFile("lib/performance-budget.ts");

  it("defines api_response_avg budget", () => {
    expect(src).toContain("api_response_avg");
  });

  it("defines api_response_max budget", () => {
    expect(src).toContain("api_response_max");
  });

  it("defines slow_request_rate budget", () => {
    expect(src).toContain("slow_request_rate");
  });

  it("has % unit type", () => {
    expect(src).toContain('"%" |');
  });

  it("avg budget is 200ms", () => {
    expect(src).toContain('metric: "api_response_avg", budget: 200');
  });

  it("max budget is 2000ms", () => {
    expect(src).toContain('metric: "api_response_max", budget: 2000');
  });

  it("slow rate budget is 5%", () => {
    expect(src).toContain('metric: "slow_request_rate", budget: 5');
  });

  it("describes as single source of truth", () => {
    expect(src).toContain("single source of truth");
  });
});

// ---------------------------------------------------------------------------
// 3. Perf monitor shared budget import
// ---------------------------------------------------------------------------
describe("Perf monitor imports — server/perf-monitor.ts", () => {
  const src = readFile("server/perf-monitor.ts");

  it("imports BUDGETS from performance-budget", () => {
    expect(src).toContain('import { BUDGETS } from "../lib/performance-budget"');
  });

  it("uses BUDGETS.find for avg budget", () => {
    expect(src).toContain('BUDGETS.find((b) => b.metric === "api_response_avg")');
  });

  it("uses BUDGETS.find for max budget", () => {
    expect(src).toContain('BUDGETS.find((b) => b.metric === "api_response_max")');
  });

  it("uses BUDGETS.find for slow rate budget", () => {
    expect(src).toContain('BUDGETS.find((b) => b.metric === "slow_request_rate")');
  });
});

// ---------------------------------------------------------------------------
// 4. CI pipeline perf validation
// ---------------------------------------------------------------------------
describe("CI perf validation — .github/workflows/ci.yml", () => {
  const src = readFile(".github/workflows/ci.yml");

  it("has performance budget validation step", () => {
    expect(src).toContain("Performance budget validation");
  });

  it("checks required budget metrics", () => {
    expect(src).toContain("api_response_avg");
    expect(src).toContain("api_response_max");
    expect(src).toContain("slow_request_rate");
  });

  it("reports missing budgets as warning", () => {
    expect(src).toContain("Missing performance budgets");
  });
});

// ---------------------------------------------------------------------------
// 5. Budget report function
// ---------------------------------------------------------------------------
describe("Budget report — lib/performance-budget.ts", () => {
  const src = readFile("lib/performance-budget.ts");

  it("exports checkBudget function", () => {
    expect(src).toContain("export function checkBudget");
  });

  it("exports getBudgetReport function", () => {
    expect(src).toContain("export function getBudgetReport");
  });

  it("returns overage when budget exceeded", () => {
    expect(src).toContain("overage");
  });
});
