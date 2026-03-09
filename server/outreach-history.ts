/**
 * Outreach Sent-History Tracking
 * Owner: Cole (City Growth Lead)
 *
 * In-memory store tracking when outreach emails were sent to businesses.
 * Prevents duplicate emails within configurable cooldown windows.
 */

import { log } from "./logger";

const historyLog = log.tag("OutreachHistory");

/** Maps "businessId:templateName" → Set of ISO date strings */
const store = new Map<string, Set<string>>();

function key(businessId: string, templateName: string): string {
  return `${businessId}:${templateName}`;
}

/** Record that outreach was sent today */
export function recordOutreachSent(businessId: string, templateName: string): void {
  const k = key(businessId, templateName);
  if (!store.has(k)) {
    store.set(k, new Set());
  }
  const today = new Date().toISOString().slice(0, 10);
  store.get(k)!.add(today);
  historyLog.info(`Recorded outreach: ${templateName} → business ${businessId} on ${today}`);
}

/** Check if outreach was sent within the last N days */
export function hasOutreachBeenSent(
  businessId: string,
  templateName: string,
  withinDays: number,
): boolean {
  const k = key(businessId, templateName);
  const dates = store.get(k);
  if (!dates || dates.size === 0) return false;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - withinDays);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  for (const d of dates) {
    if (d >= cutoffStr) return true;
  }
  return false;
}

/** Return all outreach history for a business */
export function getOutreachHistory(
  businessId: string,
): { templateName: string; dates: string[] }[] {
  const results: { templateName: string; dates: string[] }[] = [];
  const prefix = `${businessId}:`;
  for (const [k, dates] of store) {
    if (k.startsWith(prefix)) {
      const templateName = k.slice(prefix.length);
      results.push({ templateName, dates: Array.from(dates).sort() });
    }
  }
  return results;
}

/** Clear all history — testing helper */
export function clearOutreachHistory(): void {
  store.clear();
  historyLog.info("Outreach history cleared");
}
