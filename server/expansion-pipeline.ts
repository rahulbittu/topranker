/**
 * Sprint 234: City Expansion Pipeline
 * Owner: Cole Anderson (City Growth Lead) + Amir Patel (Architecture)
 *
 * Tracks city expansion stages: seed -> planned -> beta -> active
 * In-memory store of stage transitions with timestamps.
 */

import { log } from "./logger";

const pipelineLog = log.tag("ExpansionPipeline");

export type ExpansionStage = "seed" | "planned" | "beta" | "active";

export interface StageTransition {
  city: string;
  fromStage: ExpansionStage;
  toStage: ExpansionStage;
  timestamp: string;
  note?: string;
}

const STAGE_ORDER: Record<ExpansionStage, number> = {
  seed: 0,
  planned: 1,
  beta: 2,
  active: 3,
};

/** In-memory store of current city stages */
const cityStages: Map<string, ExpansionStage> = new Map();

/** In-memory store of transition history */
const transitionHistory: StageTransition[] = [];

/**
 * Get the full expansion pipeline — all cities and their current stages.
 */
export function getExpansionPipeline(): Record<string, ExpansionStage> {
  const pipeline: Record<string, ExpansionStage> = {};
  for (const [city, stage] of cityStages) {
    pipeline[city] = stage;
  }
  pipelineLog.debug("Pipeline snapshot retrieved", { count: cityStages.size });
  return pipeline;
}

/**
 * Get the current stage for a city. Returns undefined if not tracked.
 */
export function getCityStage(city: string): ExpansionStage | undefined {
  return cityStages.get(city);
}

/**
 * Set the initial stage for a city (used when first adding a city to tracking).
 */
export function setCityStage(city: string, stage: ExpansionStage): void {
  cityStages.set(city, stage);
  pipelineLog.info(`City ${city} set to stage: ${stage}`);
}

/**
 * Advance a city to the next expansion stage.
 * Returns the new stage, or null if the city cannot be advanced
 * (either unknown or already at "active").
 */
export function advanceCityStage(city: string, note?: string): ExpansionStage | null {
  const current = cityStages.get(city);
  if (!current) {
    pipelineLog.warn(`Cannot advance unknown city: ${city}`);
    return null;
  }

  const stages: ExpansionStage[] = ["seed", "planned", "beta", "active"];
  const currentIndex = stages.indexOf(current);

  if (currentIndex >= stages.length - 1) {
    pipelineLog.warn(`City ${city} is already at final stage: ${current}`);
    return null;
  }

  const nextStage = stages[currentIndex + 1];
  cityStages.set(city, nextStage);

  const transition: StageTransition = {
    city,
    fromStage: current,
    toStage: nextStage,
    timestamp: new Date().toISOString(),
    note,
  };
  transitionHistory.push(transition);

  pipelineLog.info(`City ${city} advanced: ${current} -> ${nextStage}`, { note });
  return nextStage;
}

/**
 * Get the full transition history for a city.
 */
export function getExpansionHistory(city: string): StageTransition[] {
  return transitionHistory.filter((t) => t.city === city);
}

/**
 * Get all transition history across all cities.
 */
export function getAllExpansionHistory(): StageTransition[] {
  return [...transitionHistory];
}

/**
 * Clear all expansion state (for testing).
 */
export function clearExpansionHistory(): void {
  cityStages.clear();
  transitionHistory.length = 0;
  pipelineLog.debug("Expansion pipeline state cleared");
}

/**
 * Get summary stats for the pipeline.
 */
export function getExpansionStats(): Record<ExpansionStage, number> {
  const stats: Record<ExpansionStage, number> = { seed: 0, planned: 0, beta: 0, active: 0 };
  for (const stage of cityStages.values()) {
    stats[stage]++;
  }
  return stats;
}
