/**
 * Performance Budget Utility
 * Defines and enforces performance budgets for critical web vitals.
 * Sprint 124, consolidated Sprint 206
 */

export interface PerformanceBudget {
  metric: string;
  budget: number;
  unit: "ms" | "kb" | "%" | "count";
}

/**
 * Unified performance budgets — single source of truth.
 * Server perf-monitor.ts references these values.
 */
export const BUDGETS: PerformanceBudget[] = [
  { metric: "ttfb", budget: 200, unit: "ms" },
  { metric: "fcp", budget: 1500, unit: "ms" },
  { metric: "bundle_size", budget: 500, unit: "kb" },
  { metric: "api_response_avg", budget: 200, unit: "ms" },
  { metric: "api_response_max", budget: 2000, unit: "ms" },
  { metric: "slow_request_rate", budget: 5, unit: "%" },
];

/**
 * Check a single metric value against its budget.
 */
export function checkBudget(
  metric: string,
  value: number
): { passed: boolean; budget: number; actual: number; overage?: number } {
  const entry = BUDGETS.find((b) => b.metric === metric);
  if (!entry) {
    return { passed: false, budget: 0, actual: value, overage: value };
  }
  const passed = value <= entry.budget;
  return {
    passed,
    budget: entry.budget,
    actual: value,
    ...(passed ? {} : { overage: value - entry.budget }),
  };
}

/**
 * Generate a full budget report for all tracked metrics.
 * Placeholder — returns all "ok" until real measurements are wired in.
 */
export function getBudgetReport(): {
  metric: string;
  status: "ok" | "warning" | "exceeded";
}[] {
  return BUDGETS.map((b) => ({ metric: b.metric, status: "ok" as const }));
}
