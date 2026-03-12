/**
 * Sprint 218: Alerting Infrastructure
 * Server-side alerting for production monitoring.
 * Owner: Nadia Kaur (Cybersecurity)
 *
 * Supports configurable alert rules with multiple channels.
 * Phase 1: Console + in-memory log. Phase 2: PagerDuty/Opsgenie/Slack.
 */

import crypto from "crypto";
import { log } from "./logger";

const alertLog = log.tag("Alerting");

export type AlertSeverity = "critical" | "warning" | "info";
export type AlertChannel = "console" | "pagerduty" | "slack" | "email";

export interface AlertRule {
  name: string;
  condition: string;
  severity: AlertSeverity;
  channels: AlertChannel[];
  cooldownMs: number;
}

export interface Alert {
  id: string;
  rule: string;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  metadata?: Record<string, unknown>;
}

// In-memory alert store
const alerts: Alert[] = [];
const MAX_ALERTS = 200;
const lastFired = new Map<string, number>(); // rule name → timestamp

// Default alert rules
export const DEFAULT_RULES: AlertRule[] = [
  {
    name: "health_check_failed",
    condition: "Health endpoint returns non-200",
    severity: "critical",
    channels: ["console"],
    cooldownMs: 60_000, // 1 minute cooldown
  },
  {
    name: "high_error_rate",
    condition: "Error rate exceeds 5% in 5-minute window",
    severity: "critical",
    channels: ["console"],
    cooldownMs: 300_000, // 5 minute cooldown
  },
  {
    name: "slow_response",
    condition: "Average response time exceeds 500ms",
    severity: "warning",
    channels: ["console"],
    cooldownMs: 300_000,
  },
  {
    name: "high_memory",
    condition: "Heap usage exceeds 512MB",
    severity: "warning",
    channels: ["console"],
    cooldownMs: 600_000, // 10 minute cooldown
  },
  {
    name: "rate_limit_spike",
    condition: "Rate limit rejections exceed 100/min",
    severity: "warning",
    channels: ["console"],
    cooldownMs: 300_000,
  },
];

/** Fire an alert if not in cooldown */
export function fireAlert(
  ruleName: string,
  message: string,
  severity: AlertSeverity = "warning",
  metadata?: Record<string, unknown>,
): boolean {
  const now = Date.now();
  const rule = DEFAULT_RULES.find((r) => r.name === ruleName);
  const cooldown = rule?.cooldownMs ?? 60_000;

  // Check cooldown
  const last = lastFired.get(ruleName) ?? 0;
  if (now - last < cooldown) {
    return false; // Still in cooldown
  }

  lastFired.set(ruleName, now);

  const alert: Alert = {
    id: `alert_${crypto.randomUUID()}`,
    rule: ruleName,
    severity,
    message,
    timestamp: new Date(now).toISOString(),
    acknowledged: false,
    metadata,
  };

  alerts.push(alert);
  if (alerts.length > MAX_ALERTS) {
    alerts.splice(0, alerts.length - MAX_ALERTS);
  }

  // Console channel (always active)
  const icon = severity === "critical" ? "🔴" : severity === "warning" ? "⚠️" : "ℹ️";
  alertLog.warn(`${icon} [${severity.toUpperCase()}] ${ruleName}: ${message}`);

  return true;
}

/** Get recent alerts */
export function getRecentAlerts(limit = 50): Alert[] {
  return alerts.slice(-limit);
}

/** Get unacknowledged alert count */
export function getUnacknowledgedCount(): number {
  return alerts.filter((a) => !a.acknowledged).length;
}

/** Acknowledge an alert by ID */
export function acknowledgeAlert(alertId: string): boolean {
  const alert = alerts.find((a) => a.id === alertId);
  if (alert) {
    alert.acknowledged = true;
    return true;
  }
  return false;
}

/** Get alert stats */
export function getAlertStats(): {
  total: number;
  unacknowledged: number;
  bySeverity: Record<AlertSeverity, number>;
  lastAlert: string | null;
} {
  const bySeverity = { critical: 0, warning: 0, info: 0 };
  for (const a of alerts) {
    bySeverity[a.severity]++;
  }
  return {
    total: alerts.length,
    unacknowledged: alerts.filter((a) => !a.acknowledged).length,
    bySeverity,
    lastAlert: alerts.length > 0 ? alerts[alerts.length - 1].timestamp : null,
  };
}

/** Get alert rules */
export function getAlertRules(): AlertRule[] {
  return [...DEFAULT_RULES];
}

/** Clear all alerts (for testing) */
export function clearAlerts(): void {
  alerts.length = 0;
  lastFired.clear();
}
