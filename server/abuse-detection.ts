/**
 * Sprint 236: Abuse Detection Module
 * Detects patterns of abuse and fires alerts via the alerting infrastructure.
 * Owner: Nadia Kaur (Cybersecurity)
 *
 * Supports brute force, scraping, spam ratings, and fake account detection.
 * Each pattern has a configurable threshold and time window.
 */

import crypto from "crypto";
import { log } from "./logger";
import { fireAlert } from "./alerting";

const abuseLog = log.tag("AbuseDetection");

export interface AbusePattern {
  type: "brute_force" | "scraping" | "spam_ratings" | "fake_accounts";
  description: string;
  threshold: number;
  windowMs: number;
}

export const ABUSE_PATTERNS: AbusePattern[] = [
  {
    type: "brute_force",
    description: "Excessive failed login attempts",
    threshold: 10,
    windowMs: 300000, // 5 minutes
  },
  {
    type: "scraping",
    description: "Excessive API requests from single IP",
    threshold: 500,
    windowMs: 60000, // 1 minute
  },
  {
    type: "spam_ratings",
    description: "Excessive ratings from single member",
    threshold: 20,
    windowMs: 3600000, // 1 hour
  },
  {
    type: "fake_accounts",
    description: "Excessive signups from single IP",
    threshold: 5,
    windowMs: 600000, // 10 minutes
  },
];

export interface AbuseIncident {
  id: string;
  pattern: string;
  source: string; // IP or memberId
  count: number;
  detectedAt: string;
  resolved: boolean;
}

const incidents: AbuseIncident[] = [];
const MAX_INCIDENTS = 500;

/**
 * Check if the given count exceeds the threshold for a pattern.
 * If abuse is detected, creates an incident and fires an alert.
 * @returns true if abuse was detected, false otherwise
 */
export function detectAbuse(pattern: string, source: string, count: number): boolean {
  const patternDef = ABUSE_PATTERNS.find((p) => p.type === pattern);
  if (!patternDef) {
    abuseLog.warn(`Unknown abuse pattern: ${pattern}`);
    return false;
  }

  if (count < patternDef.threshold) {
    return false;
  }

  const now = Date.now();
  const incident: AbuseIncident = {
    id: `abuse_${crypto.randomUUID()}`,
    pattern,
    source,
    count,
    detectedAt: new Date(now).toISOString(),
    resolved: false,
  };

  incidents.push(incident);

  // FIFO eviction
  if (incidents.length > MAX_INCIDENTS) {
    incidents.splice(0, incidents.length - MAX_INCIDENTS);
  }

  abuseLog.warn(`Abuse detected: ${pattern} from ${source} (count: ${count})`);

  // Fire alert via alerting infrastructure
  fireAlert(
    "rate_limit_spike",
    `Abuse pattern "${patternDef.description}" detected from ${source}: ${count} events (threshold: ${patternDef.threshold})`,
    "warning",
    { pattern, source, count, threshold: patternDef.threshold },
  );

  return true;
}

/** Get all unresolved incidents */
export function getActiveIncidents(): AbuseIncident[] {
  return incidents.filter((i) => !i.resolved);
}

/**
 * Mark an incident as resolved.
 * @returns true if the incident was found and resolved, false otherwise
 */
export function resolveIncident(id: string): boolean {
  const incident = incidents.find((i) => i.id === id);
  if (!incident) {
    return false;
  }
  incident.resolved = true;
  abuseLog.info(`Resolved abuse incident ${id} (${incident.pattern} from ${incident.source})`);
  return true;
}

/** Get aggregate abuse stats */
export function getAbuseStats(): { total: number; active: number; byType: Record<string, number> } {
  const byType: Record<string, number> = {};
  for (const i of incidents) {
    byType[i.pattern] = (byType[i.pattern] || 0) + 1;
  }
  return {
    total: incidents.length,
    active: incidents.filter((i) => !i.resolved).length,
    byType,
  };
}

/** Clear all incidents (for testing) */
export function clearIncidents(): void {
  incidents.length = 0;
}
