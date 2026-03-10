/**
 * Sprint 508: Push Notification A/B Testing Framework
 *
 * Bridges the existing experiment infrastructure (Sprint 142) with push
 * notifications. Allows defining notification content variants (title/body)
 * per experiment, assigning members to variants via deterministic hash
 * bucketing, and tracking opens as experiment outcomes.
 *
 * Uses DJB2 hash for consistent bucketing (same member always gets same variant).
 * Leverages experiment-tracker for exposure/outcome recording and Wilson CI dashboards.
 */

import { trackExposure, trackOutcome } from "./experiment-tracker";
import { log } from "./logger";

const pushAbLog = log.tag("PushAB");

// ─── Types ───────────────────────────────────────────────────

export interface PushNotificationVariant {
  name: string;       // "control" | "treatment" etc.
  title: string;
  body: string;
}

export interface PushNotificationExperiment {
  id: string;
  description: string;
  category: string;   // notification category: "weeklyDigest", "rankingChange", etc.
  variants: PushNotificationVariant[];
  active: boolean;
  createdAt: number;
}

export interface VariantAssignment {
  experimentId: string;
  variant: PushNotificationVariant;
}

// ─── In-Memory Store ─────────────────────────────────────────
// PERSISTENCE-AUDIT: Sprint 528 — acceptable for 500-user target.
// Migration path: push_experiments table with jsonb variants column.
// Priority: LOW — experiments are admin-seeded, few in number (<10), and
// re-seeding after restart is a one-time admin action.

const experiments = new Map<string, PushNotificationExperiment>();

// ─── Hash Bucketing ──────────────────────────────────────────

/** DJB2 hash — same as existing experiment system for consistency */
function djb2Hash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

/**
 * Deterministically assign a member to a variant.
 * Same memberId + experimentId always returns the same variant.
 */
function assignVariant(memberId: string, experiment: PushNotificationExperiment): PushNotificationVariant {
  const bucket = djb2Hash(`${memberId}:${experiment.id}`) % experiment.variants.length;
  return experiment.variants[bucket];
}

// ─── Public API ──────────────────────────────────────────────

/**
 * Create a push notification A/B experiment.
 * Returns the experiment or null if ID already exists.
 */
export function createPushExperiment(
  id: string,
  description: string,
  category: string,
  variants: PushNotificationVariant[],
): PushNotificationExperiment | null {
  if (experiments.has(id)) {
    pushAbLog.info(`Experiment already exists: ${id}`);
    return null;
  }
  if (variants.length < 2) {
    pushAbLog.info(`Experiment needs at least 2 variants: ${id}`);
    return null;
  }

  const experiment: PushNotificationExperiment = {
    id,
    description,
    category,
    variants,
    active: true,
    createdAt: Date.now(),
  };

  experiments.set(id, experiment);
  pushAbLog.info(`Created push experiment: ${id} with ${variants.length} variants for ${category}`);
  return experiment;
}

/**
 * Get notification content for a member, applying A/B variant if an active
 * experiment exists for the given category. Records exposure in experiment tracker.
 *
 * Returns null if no active experiment for this category — caller uses default content.
 */
export function getNotificationVariant(
  memberId: string,
  category: string,
): VariantAssignment | null {
  // Find active experiment for this notification category
  for (const experiment of experiments.values()) {
    if (experiment.active && experiment.category === category) {
      const variant = assignVariant(memberId, experiment);

      // Record exposure in experiment tracker
      trackExposure(memberId, experiment.id, variant.name, `push:${category}`);

      pushAbLog.info(
        `Assigned variant: member=${memberId.slice(0, 8)} experiment=${experiment.id} variant=${variant.name}`
      );

      return { experimentId: experiment.id, variant };
    }
  }

  return null;
}

/**
 * Record a notification open as an experiment outcome.
 * Called when POST /api/notifications/opened fires.
 * Only records if the member has an active exposure for this category.
 */
export function recordPushExperimentOpen(
  memberId: string,
  category: string,
): void {
  for (const experiment of experiments.values()) {
    if (experiment.category === category) {
      trackOutcome(memberId, experiment.id, "notification_opened");
      pushAbLog.info(`Outcome recorded: member=${memberId.slice(0, 8)} experiment=${experiment.id}`);
    }
  }
}

/**
 * Deactivate an experiment (stop assigning new variants).
 */
export function deactivatePushExperiment(id: string): boolean {
  const experiment = experiments.get(id);
  if (!experiment) return false;
  experiment.active = false;
  pushAbLog.info(`Deactivated push experiment: ${id}`);
  return true;
}

/**
 * List all push notification experiments.
 */
export function listPushExperiments(): PushNotificationExperiment[] {
  return Array.from(experiments.values());
}

/**
 * Get a single experiment by ID.
 */
export function getPushExperiment(id: string): PushNotificationExperiment | undefined {
  return experiments.get(id);
}

/**
 * Get experiment count (for health checks).
 */
export function getPushExperimentCount(): number {
  return experiments.size;
}
