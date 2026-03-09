/**
 * Bidirectional mapping between Resend email_id and internal tracking IDs.
 * In-memory with FIFO eviction at MAX_MAPPINGS.
 */

import { log } from "./logger";

const mapLog = log.tag("EmailIdMapping");

const MAX_MAPPINGS = 2000;

// Bidirectional maps
const resendToTracking = new Map<string, string>();
const trackingToResend = new Map<string, string>();

/** Evict the oldest entry from both maps when at capacity */
function evictOldest(): void {
  const firstKey = resendToTracking.keys().next().value as string;
  if (firstKey) {
    const trackingId = resendToTracking.get(firstKey);
    resendToTracking.delete(firstKey);
    if (trackingId) trackingToResend.delete(trackingId);
    mapLog.debug(`Evicted mapping for resendId=${firstKey}`);
  }
}

/** Store a bidirectional mapping between trackingId and resendId */
export function registerEmailMapping(trackingId: string, resendId: string): void {
  if (resendToTracking.size >= MAX_MAPPINGS) {
    evictOldest();
  }
  resendToTracking.set(resendId, trackingId);
  trackingToResend.set(trackingId, resendId);
  mapLog.debug(`Registered mapping: ${trackingId} <-> ${resendId}`);
}

/** Look up internal tracking ID from a Resend email_id */
export function getTrackingIdFromResend(resendId: string): string | undefined {
  return resendToTracking.get(resendId);
}

/** Look up Resend email_id from an internal tracking ID */
export function getResendIdFromTracking(trackingId: string): string | undefined {
  return trackingToResend.get(trackingId);
}

/** Return current mapping stats */
export function getMappingStats(): { totalMappings: number; maxMappings: number } {
  return {
    totalMappings: resendToTracking.size,
    maxMappings: MAX_MAPPINGS,
  };
}

/** Clear all mappings (testing helper) */
export function clearMappings(): void {
  resendToTracking.clear();
  trackingToResend.clear();
  mapLog.info("All mappings cleared");
}
