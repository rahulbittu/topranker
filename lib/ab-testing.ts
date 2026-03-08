/**
 * TopRanker A/B Testing Framework
 *
 * Client-side experiment bucketing with deterministic hash-based assignment.
 * Same user always sees the same variant for a given experiment.
 *
 * Usage:
 *   import { getVariant, trackExperiment, setOverride } from '@/lib/ab-testing';
 *   const variant = getVariant('confidence_tooltip');
 *   trackExperiment('confidence_tooltip');
 *
 * Owner: Sarah Nakamura (Lead Engineer)
 * Sprint 135 — #1 carried action item for 4 sprints
 */

import { track } from "./analytics";

// ─── Types ───────────────────────────────────────────────────

export interface ExperimentVariant {
  /** Unique variant key, e.g. "control" or "treatment" */
  id: string;
  /** Traffic weight (0-100). All variant weights in an experiment must sum to 100. */
  weight: number;
}

export interface Experiment {
  /** Unique experiment identifier */
  id: string;
  /** Human-readable description */
  description: string;
  /** Whether the experiment is active. Inactive experiments always return "control". */
  active: boolean;
  /** Ordered list of variants. First variant is conventionally "control". */
  variants: ExperimentVariant[];
}

export type ExperimentRegistry = Record<string, Experiment>;

// ─── Hash Function ───────────────────────────────────────────

/**
 * Simple deterministic string hash (DJB2 variant).
 * Returns a positive integer for consistent bucketing.
 */
export function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    // hash * 33 + charCode
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

// ─── Experiment Registry ─────────────────────────────────────

const experiments: ExperimentRegistry = {
  confidence_tooltip: {
    id: "confidence_tooltip",
    description: "Show info icon tooltip on confidence badge vs no tooltip",
    active: true,
    variants: [
      { id: "control", weight: 50 },
      { id: "treatment", weight: 50 },
    ],
  },
  trust_signal_style: {
    id: "trust_signal_style",
    description: "Text labels instead of icons for trust signals",
    active: false,
    variants: [
      { id: "control", weight: 50 },
      { id: "treatment", weight: 50 },
    ],
  },
  personalized_weight: {
    id: "personalized_weight",
    description: "Personalized weight display vs static 'How Voting Works'",
    active: false,
    variants: [
      { id: "control", weight: 50 },
      { id: "treatment", weight: 50 },
    ],
  },
};

// ─── State ───────────────────────────────────────────────────

/** User ID for bucketing. Set via setUserId(). Falls back to anonymous ID. */
let currentUserId: string | null = null;

/** Anonymous fallback ID. Persisted to AsyncStorage when available. */
let anonymousId: string | null = null;

/** Manual overrides: experimentId -> variantId. Takes precedence over hashing. */
const overrides: Record<string, string> = {};

/** Cache of computed assignments to avoid re-hashing. */
const assignmentCache: Record<string, string> = {};

// ─── Core API ────────────────────────────────────────────────

/**
 * Set the user ID for experiment bucketing.
 * Call after login. Clears assignment cache since user changed.
 */
export function setUserId(userId: string): void {
  if (currentUserId !== userId) {
    currentUserId = userId;
    clearAssignmentCache();
  }
}

/**
 * Set or retrieve the anonymous ID for non-logged-in users.
 * In production this would persist to AsyncStorage.
 */
export function setAnonymousId(id: string): void {
  anonymousId = id;
  if (!currentUserId) {
    clearAssignmentCache();
  }
}

/**
 * Get the effective user identifier for bucketing.
 */
export function getEffectiveUserId(): string {
  return currentUserId || anonymousId || "anonymous";
}

/**
 * Get the assigned variant for an experiment.
 *
 * Priority:
 * 1. Manual override (dev mode)
 * 2. Cached assignment
 * 3. Hash-based deterministic bucketing
 *
 * Returns "control" for unknown or inactive experiments.
 */
export function getVariant(experimentId: string): string {
  // Override takes precedence
  if (overrides[experimentId]) {
    return overrides[experimentId];
  }

  const experiment = experiments[experimentId];

  // Unknown or inactive experiment -> control
  if (!experiment || !experiment.active) {
    return "control";
  }

  // Check cache
  const cacheKey = `${getEffectiveUserId()}:${experimentId}`;
  if (assignmentCache[cacheKey]) {
    return assignmentCache[cacheKey];
  }

  // Deterministic hash-based bucketing
  const bucket = hashString(cacheKey) % 100;
  let cumulative = 0;
  let assignedVariant = experiment.variants[0].id; // fallback to first

  for (const variant of experiment.variants) {
    cumulative += variant.weight;
    if (bucket < cumulative) {
      assignedVariant = variant.id;
      break;
    }
  }

  assignmentCache[cacheKey] = assignedVariant;
  return assignedVariant;
}

/**
 * Track an experiment exposure event via the analytics system.
 * Fires "view_business" as a carrier event with experiment metadata.
 * In production, this would use a dedicated "experiment_exposure" event type.
 */
export function trackExperiment(experimentId: string): void {
  const variant = getVariant(experimentId);
  const experiment = experiments[experimentId];

  // Use the analytics track function with experiment metadata
  // We cast to any because AnalyticsEvent is a union type and
  // "experiment_exposure" is not yet in it. When the analytics
  // system adds A/B event types, remove the cast.
  (track as any)("experiment_exposure" as any, {
    experiment_id: experimentId,
    variant,
    experiment_active: experiment ? experiment.active : false,
  });
}

// ─── Override API (Dev Mode) ─────────────────────────────────

/**
 * Force a specific variant for an experiment. Useful for QA and development.
 */
export function setOverride(experimentId: string, variantId: string): void {
  overrides[experimentId] = variantId;
  // Clear cache for this experiment
  for (const key of Object.keys(assignmentCache)) {
    if (key.endsWith(`:${experimentId}`)) {
      delete assignmentCache[key];
    }
  }
}

/**
 * Remove an override for an experiment.
 */
export function clearOverride(experimentId: string): void {
  delete overrides[experimentId];
  for (const key of Object.keys(assignmentCache)) {
    if (key.endsWith(`:${experimentId}`)) {
      delete assignmentCache[key];
    }
  }
}

/**
 * Remove all overrides.
 */
export function clearAllOverrides(): void {
  for (const key of Object.keys(overrides)) {
    delete overrides[key];
  }
  clearAssignmentCache();
}

// ─── Experiment Management ───────────────────────────────────

/**
 * Activate an experiment (starts bucketing users).
 */
export function activateExperiment(experimentId: string): boolean {
  const experiment = experiments[experimentId];
  if (!experiment) return false;
  experiment.active = true;
  // Clear cache so users get re-evaluated
  clearAssignmentCache();
  return true;
}

/**
 * Deactivate an experiment (all users get "control").
 */
export function deactivateExperiment(experimentId: string): boolean {
  const experiment = experiments[experimentId];
  if (!experiment) return false;
  experiment.active = false;
  clearAssignmentCache();
  return true;
}

/**
 * Register a new experiment at runtime.
 */
export function registerExperiment(experiment: Experiment): void {
  experiments[experiment.id] = experiment;
}

/**
 * Get the full experiment definition, or undefined if not found.
 */
export function getExperiment(experimentId: string): Experiment | undefined {
  return experiments[experimentId];
}

/**
 * List all registered experiments.
 */
export function listExperiments(): Experiment[] {
  return Object.values(experiments);
}

// ─── Internal Helpers ────────────────────────────────────────

function clearAssignmentCache(): void {
  for (const key of Object.keys(assignmentCache)) {
    delete assignmentCache[key];
  }
}

/**
 * Reset all state — for testing only.
 */
export function _resetForTesting(): void {
  currentUserId = null;
  anonymousId = null;
  clearAllOverrides();
  clearAssignmentCache();

  // Reset experiments to inactive defaults
  for (const exp of Object.values(experiments)) {
    exp.active = false;
  }
}
