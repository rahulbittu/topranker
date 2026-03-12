/**
 * Sprint 236: Rate Limit Dashboard
 * In-memory analytics module that tracks rate-limit hits and provides dashboard data.
 * Owner: Nadia Kaur (Cybersecurity)
 *
 * Tracks all rate-limit events (both allowed and blocked requests),
 * aggregates top offenders and top paths, and exposes stats for the admin dashboard.
 */

import crypto from "crypto";
import { log } from "./logger";

const rlDashLog = log.tag("RateLimitDash");

export interface RateLimitEvent {
  id: string;
  ip: string;
  path: string;
  timestamp: string;
  blocked: boolean;
}

export interface RateLimitStats {
  totalRequests: number;
  blockedRequests: number;
  blockRate: number;
  topOffenders: { ip: string; count: number }[];
  topPaths: { path: string; count: number }[];
  recentEvents: RateLimitEvent[];
}

const events: RateLimitEvent[] = [];
const MAX_EVENTS = 5000;

/**
 * Record a rate-limit event (hit or block).
 * FIFO eviction when MAX_EVENTS is reached.
 */
export function recordRateLimitHit(ip: string, path: string, blocked: boolean): void {
  const now = Date.now();
  const event: RateLimitEvent = {
    id: `rl_${crypto.randomUUID()}`,
    ip,
    path,
    timestamp: new Date(now).toISOString(),
    blocked,
  };

  events.push(event);

  // FIFO eviction
  if (events.length > MAX_EVENTS) {
    events.splice(0, events.length - MAX_EVENTS);
  }

  if (blocked) {
    rlDashLog.warn(`Blocked request from ${ip} to ${path}`);
  }
}

/**
 * Get aggregated rate-limit statistics.
 * @param limit Number of recent events to return (default 50)
 */
export function getRateLimitStats(limit?: number): RateLimitStats {
  const recentLimit = limit ?? 50;
  const totalRequests = events.length;
  const blockedRequests = events.filter((e) => e.blocked).length;
  const blockRate = totalRequests > 0 ? blockedRequests / totalRequests : 0;

  // Aggregate top offenders (top 10 IPs by hit count)
  const ipCounts = new Map<string, number>();
  for (const e of events) {
    ipCounts.set(e.ip, (ipCounts.get(e.ip) || 0) + 1);
  }
  const topOffenders = Array.from(ipCounts.entries())
    .map(([ip, count]) => ({ ip, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Aggregate top paths (top 10 paths by hit count)
  const pathCounts = new Map<string, number>();
  for (const e of events) {
    pathCounts.set(e.path, (pathCounts.get(e.path) || 0) + 1);
  }
  const topPaths = Array.from(pathCounts.entries())
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Recent events (last N)
  const recentEvents = events.slice(-recentLimit);

  return {
    totalRequests,
    blockedRequests,
    blockRate,
    topOffenders,
    topPaths,
    recentEvents,
  };
}

/**
 * Get IPs that have been blocked, filtered by minimum hit threshold.
 * @param minHits Minimum number of blocked hits to include (default 5)
 */
export function getBlockedIPs(minHits?: number): { ip: string; count: number; lastSeen: string }[] {
  const threshold = minHits ?? 5;
  const blockedEvents = events.filter((e) => e.blocked);

  const ipData = new Map<string, { count: number; lastSeen: string }>();
  for (const e of blockedEvents) {
    const existing = ipData.get(e.ip);
    if (!existing || e.timestamp > existing.lastSeen) {
      ipData.set(e.ip, {
        count: (existing?.count || 0) + 1,
        lastSeen: e.timestamp,
      });
    } else {
      existing.count++;
    }
  }

  return Array.from(ipData.entries())
    .map(([ip, data]) => ({ ip, count: data.count, lastSeen: data.lastSeen }))
    .filter((entry) => entry.count >= threshold)
    .sort((a, b) => b.count - a.count);
}

/** Clear all events (for testing) */
export function clearRateLimitEvents(): void {
  events.length = 0;
}
