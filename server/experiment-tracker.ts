/**
 * Experiment Exposure & Outcome Tracking — Sprint 142
 *
 * Records when users are assigned and exposed to experiment variants,
 * and tracks downstream outcomes (ratings, returns, etc.) to measure
 * whether treatment users behave differently from control.
 *
 * In-memory store for now; production would persist to DB/analytics service.
 *
 * Owner: Sarah Nakamura (Lead Engineer)
 */

import { log } from "./logger";

const trackerLog = log.tag("ExperimentTracker");

// ─── Types ───────────────────────────────────────────────────

export interface ExperimentExposure {
  userId: string;
  experimentId: string;
  variant: string;
  exposedAt: number;
  context: string; // which page/component triggered the exposure
}

export interface ExperimentOutcome {
  userId: string;
  experimentId: string;
  variant: string;
  action: string; // "rated", "returned", "session_extended", etc.
  value?: number;
  recordedAt: number;
}

export interface ExposureStats {
  total: number;
  byVariant: Record<string, number>;
  uniqueUsers: number;
  firstExposure: number | null;
  lastExposure: number | null;
}

export interface OutcomeStats {
  total: number;
  byAction: Record<string, number>;
  byVariant: Record<string, { total: number; byAction: Record<string, number>; uniqueUsers: number }>;
  conversionRates: Record<string, { variant: string; action: string; rate: number }[]>;
}

export type DashboardRecommendation =
  | "treatment_winning"
  | "control_winning"
  | "inconclusive"
  | "insufficient_data";

export interface VariantDashboard {
  variant: string;
  exposures: number;
  outcomes: number;
  conversionRate: number; // percentage 0-100
  byAction: Record<string, number>;
}

export interface ExperimentDashboard {
  experimentId: string;
  totalExposures: number;
  variants: VariantDashboard[];
  confidence: "sufficient_data" | "insufficient_data";
  recommendation: DashboardRecommendation;
}

// ─── In-Memory Stores ────────────────────────────────────────

const exposures: ExperimentExposure[] = [];
const outcomes: ExperimentOutcome[] = [];

// ─── Exposure Tracking ───────────────────────────────────────

/**
 * Record that a user was exposed to an experiment variant.
 * Deduplicates: same user + experiment only recorded once.
 */
export function trackExposure(
  userId: string,
  experimentId: string,
  variant: string,
  context: string,
): void {
  // Deduplicate: don't record multiple exposures for same user+experiment
  const existing = exposures.find(
    (e) => e.userId === userId && e.experimentId === experimentId,
  );
  if (existing) {
    trackerLog.info(
      `Skipping duplicate exposure: user=${userId} experiment=${experimentId}`,
    );
    return;
  }

  const exposure: ExperimentExposure = {
    userId,
    experimentId,
    variant,
    exposedAt: Date.now(),
    context,
  };

  exposures.push(exposure);
  trackerLog.info(
    `Exposure recorded: user=${userId} experiment=${experimentId} variant=${variant} context=${context}`,
  );
}

/**
 * Get all exposures, optionally filtered by experimentId.
 */
export function getExposures(experimentId?: string): ExperimentExposure[] {
  if (!experimentId) return [...exposures];
  return exposures.filter((e) => e.experimentId === experimentId);
}

/**
 * Get aggregate stats for a given experiment's exposures.
 */
export function getExposureStats(experimentId: string): ExposureStats {
  const filtered = exposures.filter((e) => e.experimentId === experimentId);

  if (filtered.length === 0) {
    return {
      total: 0,
      byVariant: {},
      uniqueUsers: 0,
      firstExposure: null,
      lastExposure: null,
    };
  }

  const byVariant: Record<string, number> = {};
  const userSet = new Set<string>();
  let firstExposure = Infinity;
  let lastExposure = -Infinity;

  for (const e of filtered) {
    byVariant[e.variant] = (byVariant[e.variant] || 0) + 1;
    userSet.add(e.userId);
    if (e.exposedAt < firstExposure) firstExposure = e.exposedAt;
    if (e.exposedAt > lastExposure) lastExposure = e.exposedAt;
  }

  return {
    total: filtered.length,
    byVariant,
    uniqueUsers: userSet.size,
    firstExposure,
    lastExposure,
  };
}

// ─── Outcome Tracking ────────────────────────────────────────

/**
 * Record an outcome action for a user in an experiment.
 * Looks up the user's variant from their exposure record.
 * If the user has no exposure for the experiment, the outcome is not recorded.
 */
export function trackOutcome(
  userId: string,
  experimentId: string,
  action: string,
  value?: number,
): void {
  // Find user's variant from exposure
  const exposure = exposures.find(
    (e) => e.userId === userId && e.experimentId === experimentId,
  );
  if (!exposure) {
    trackerLog.info(
      `No exposure found for user=${userId} experiment=${experimentId}, skipping outcome`,
    );
    return;
  }

  const outcome: ExperimentOutcome = {
    userId,
    experimentId,
    variant: exposure.variant,
    action,
    value,
    recordedAt: Date.now(),
  };

  outcomes.push(outcome);
  trackerLog.info(
    `Outcome recorded: user=${userId} experiment=${experimentId} variant=${exposure.variant} action=${action}`,
  );
}

/**
 * Get aggregate outcome stats for a given experiment.
 * Includes per-variant breakdowns and conversion rates.
 */
export function getOutcomeStats(experimentId: string): OutcomeStats {
  const filteredOutcomes = outcomes.filter((o) => o.experimentId === experimentId);
  const filteredExposures = exposures.filter((e) => e.experimentId === experimentId);

  const byAction: Record<string, number> = {};
  const byVariant: Record<string, { total: number; byAction: Record<string, number>; uniqueUsers: Set<string> }> = {};

  for (const o of filteredOutcomes) {
    byAction[o.action] = (byAction[o.action] || 0) + 1;

    if (!byVariant[o.variant]) {
      byVariant[o.variant] = { total: 0, byAction: {}, uniqueUsers: new Set() };
    }
    byVariant[o.variant].total += 1;
    byVariant[o.variant].byAction[o.action] = (byVariant[o.variant].byAction[o.action] || 0) + 1;
    byVariant[o.variant].uniqueUsers.add(o.userId);
  }

  // Convert Sets to counts for serialization
  const byVariantSerialized: OutcomeStats["byVariant"] = {};
  for (const [variant, data] of Object.entries(byVariant)) {
    byVariantSerialized[variant] = {
      total: data.total,
      byAction: data.byAction,
      uniqueUsers: data.uniqueUsers.size,
    };
  }

  // Compute conversion rates: for each variant, rate = outcomes / exposures
  const conversionRates: OutcomeStats["conversionRates"] = {};
  const allActions = Object.keys(byAction);

  for (const variant of Object.keys(byVariant)) {
    const variantExposureCount = filteredExposures.filter((e) => e.variant === variant).length;
    if (variantExposureCount === 0) continue;

    conversionRates[variant] = allActions.map((action) => ({
      variant,
      action,
      rate: ((byVariant[variant].byAction[action] || 0) / variantExposureCount) * 100,
    }));
  }

  return {
    total: filteredOutcomes.length,
    byAction,
    byVariant: byVariantSerialized,
    conversionRates,
  };
}

/**
 * Get all active experiment IDs that a user is enrolled in.
 */
export function getUserExperiments(userId: string): string[] {
  return exposures
    .filter((e) => e.userId === userId)
    .map((e) => e.experimentId);
}

// ─── Dashboard Computation ───────────────────────────────

/**
 * Compute a dashboard summary for a given experiment.
 * Includes per-variant conversion rates, confidence indicator, and recommendation.
 *
 * Recommendation logic:
 * - If total exposures < 100 → "insufficient_data"
 * - If treatment conversion > control by more than 5 percentage points → "treatment_winning"
 * - If control conversion > treatment by more than 5 percentage points → "control_winning"
 * - Otherwise → "inconclusive"
 *
 * Sprint 143: Experiment Results Dashboard
 */
export function computeExperimentDashboard(experimentId: string): ExperimentDashboard {
  const expStats = getExposureStats(experimentId);
  const filteredExposures = exposures.filter((e) => e.experimentId === experimentId);
  const filteredOutcomes = outcomes.filter((o) => o.experimentId === experimentId);

  // Build per-variant stats
  const variantMap = new Map<string, { exposures: number; outcomes: number; byAction: Record<string, number> }>();

  for (const e of filteredExposures) {
    if (!variantMap.has(e.variant)) {
      variantMap.set(e.variant, { exposures: 0, outcomes: 0, byAction: {} });
    }
    variantMap.get(e.variant)!.exposures += 1;
  }

  for (const o of filteredOutcomes) {
    if (!variantMap.has(o.variant)) {
      variantMap.set(o.variant, { exposures: 0, outcomes: 0, byAction: {} });
    }
    const v = variantMap.get(o.variant)!;
    v.outcomes += 1;
    v.byAction[o.action] = (v.byAction[o.action] || 0) + 1;
  }

  const variants: VariantDashboard[] = [];
  for (const [variant, data] of variantMap.entries()) {
    variants.push({
      variant,
      exposures: data.exposures,
      outcomes: data.outcomes,
      conversionRate: data.exposures > 0 ? (data.outcomes / data.exposures) * 100 : 0,
      byAction: data.byAction,
    });
  }

  // Determine confidence and recommendation
  const totalExposures = expStats.total;
  let confidence: ExperimentDashboard["confidence"] = "sufficient_data";
  let recommendation: DashboardRecommendation = "inconclusive";

  if (totalExposures < 100) {
    confidence = "insufficient_data";
    recommendation = "insufficient_data";
  } else {
    const controlVariant = variants.find((v) => v.variant === "control");
    const treatmentVariant = variants.find((v) => v.variant === "treatment");

    const controlRate = controlVariant?.conversionRate ?? 0;
    const treatmentRate = treatmentVariant?.conversionRate ?? 0;
    const diff = treatmentRate - controlRate;

    if (diff > 5) {
      recommendation = "treatment_winning";
    } else if (diff < -5) {
      recommendation = "control_winning";
    } else {
      recommendation = "inconclusive";
    }
  }

  return {
    experimentId,
    totalExposures,
    variants,
    confidence,
    recommendation,
  };
}

// ─── Reset (for testing) ─────────────────────────────────────

/**
 * Clear all stored exposures and outcomes. For testing only.
 */
export function clearExposures(): void {
  exposures.length = 0;
  outcomes.length = 0;
  trackerLog.info("All exposures and outcomes cleared");
}
