/**
 * Experiment Assignment Routes — Sprint 137
 *
 * Server-side A/B experiment bucketing that mirrors the client-side DJB2 logic.
 * Ensures consistent variant assignment whether resolved client-side or server-side.
 *
 * Endpoints:
 *   GET /api/experiments          — List all active experiments (public)
 *   GET /api/experiments/assign   — Get variant assignment for a given experiment
 *
 * Owner: Sarah Nakamura (Lead Engineer)
 */

import type { Express, Request, Response } from "express";
import { apiRateLimiter } from "./rate-limiter";
import { wrapAsync } from "./wrap-async";
import { log } from "./logger";

const expLog = log.tag("Experiments");

// ─── Types ───────────────────────────────────────────────────

export interface ExperimentVariant {
  id: string;
  weight: number;
}

export interface Experiment {
  id: string;
  description: string;
  active: boolean;
  variants: ExperimentVariant[];
}

// ─── DJB2 Hash (identical to client-side lib/ab-testing.ts) ──

/**
 * Deterministic string hash (DJB2 variant).
 * Must produce identical output to the client-side hashString() in lib/ab-testing.ts.
 */
export function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

// ─── Experiment Registry ─────────────────────────────────────
// Mirrors the client-side registry. In production this would be backed by a
// database or feature-flag service; for now we keep it in sync manually.

const experiments: Record<string, Experiment> = {
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

// ─── Assignment Logic ────────────────────────────────────────

/**
 * Compute the variant for a given userId + experimentId.
 * Uses the same `userId:experimentId` key format and DJB2 bucketing as the client.
 */
export function assignVariant(
  userId: string,
  experimentId: string,
): { variant: string; isDefault: boolean } {
  const experiment = experiments[experimentId];

  // Unknown or inactive → default "control"
  if (!experiment || !experiment.active) {
    return { variant: "control", isDefault: true };
  }

  const key = `${userId}:${experimentId}`;
  const bucket = hashString(key) % 100;

  let cumulative = 0;
  for (const v of experiment.variants) {
    cumulative += v.weight;
    if (bucket < cumulative) {
      return { variant: v.id, isDefault: false };
    }
  }

  // Fallback (should not happen if weights sum to 100)
  return { variant: experiment.variants[0].id, isDefault: false };
}

// ─── Helpers for testing ─────────────────────────────────────

/** Get a reference to the registry — for testing only. */
export function _getRegistry(): Record<string, Experiment> {
  return experiments;
}

// ─── Route Registration ──────────────────────────────────────

export function registerExperimentRoutes(app: Express): void {
  /**
   * GET /api/experiments
   * Public — returns metadata for all active experiments.
   * No user-specific data is exposed.
   */
  app.get("/api/experiments", apiRateLimiter, wrapAsync((_req: Request, res: Response) => {
      const active = Object.values(experiments)
        .filter((exp) => exp.active)
        .map((exp) => ({
          id: exp.id,
          description: exp.description,
          variants: exp.variants.map((v) => v.id),
        }));

      return res.json({ data: active });
  }));

  /**
   * GET /api/experiments/assign?experimentId=X
   * - Authenticated user → bucket by userId
   * - Unauthenticated → returns default variant ("control", isDefault: true)
   */
  app.get("/api/experiments/assign", apiRateLimiter, wrapAsync((req: Request, res: Response) => {
      const experimentId = req.query.experimentId as string;

      if (!experimentId) {
        return res.status(400).json({ error: "experimentId query parameter is required" });
      }

      // Check if user is authenticated
      const isAuthenticated = req.isAuthenticated && req.isAuthenticated();
      const userId = isAuthenticated ? req.user!.id : null;

      if (!userId) {
        // Unauthenticated → default variant
        return res.json({
          data: {
            experimentId,
            variant: "control",
            isDefault: true,
          },
        });
      }

      const { variant, isDefault } = assignVariant(String(userId), experimentId);

      expLog.info(`Assigned ${experimentId}=${variant} for user ${userId}`);

      return res.json({
        data: {
          experimentId,
          variant,
          isDefault,
        },
      });
  }));
}
