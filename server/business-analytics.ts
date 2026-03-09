/**
 * Sprint 243: Business Analytics Module
 * Analytics for business owners who have claimed their business listing.
 * Tracks views, visitor sources, and aggregates metrics for owner dashboards.
 * Owner: Sarah Nakamura (Lead Eng)
 */

import { log } from "./logger";

const bizAnalyticsLog = log.tag("BusinessAnalytics");

interface BusinessMetrics {
  businessId: string;
  views: number;
  uniqueVisitors: number;
  ratingsReceived: number;
  averageRating: number;
  searchAppearances: number;
  profileClicks: number;
  bookmarks: number;
  challengerAppearances: number;
  period: string; // "7d" | "30d" | "90d"
}

interface ViewEvent {
  businessId: string;
  visitorId: string;
  source: "search" | "direct" | "challenger" | "referral";
  timestamp: string;
}

const viewEvents: ViewEvent[] = [];
export const MAX_EVENTS = 10000;

export function recordView(
  businessId: string,
  visitorId: string,
  source: ViewEvent["source"],
): void {
  bizAnalyticsLog.debug(`Recording view for business ${businessId} from ${source}`);
  viewEvents.unshift({
    businessId,
    visitorId,
    source,
    timestamp: new Date().toISOString(),
  });
  if (viewEvents.length > MAX_EVENTS) viewEvents.pop();
}

export function getBusinessMetrics(businessId: string, period: string): BusinessMetrics {
  const now = Date.now();
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const cutoff = new Date(now - days * 24 * 60 * 60 * 1000).toISOString();

  const relevant = viewEvents.filter(
    (e) => e.businessId === businessId && e.timestamp >= cutoff,
  );
  const uniqueVisitorSet = new Set(relevant.map((e) => e.visitorId));

  bizAnalyticsLog.info(
    `Metrics for ${businessId} (${period}): ${relevant.length} views, ${uniqueVisitorSet.size} unique`,
  );

  return {
    businessId,
    views: relevant.length,
    uniqueVisitors: uniqueVisitorSet.size,
    ratingsReceived: 0, // Would be populated from DB
    averageRating: 0,
    searchAppearances: relevant.filter((e) => e.source === "search").length,
    profileClicks: relevant.filter((e) => e.source === "direct").length,
    bookmarks: 0, // Would be populated from DB
    challengerAppearances: relevant.filter((e) => e.source === "challenger").length,
    period,
  };
}

export function getTopBusinesses(
  limit?: number,
): { businessId: string; views: number }[] {
  const counts = new Map<string, number>();
  for (const e of viewEvents) {
    counts.set(e.businessId, (counts.get(e.businessId) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([businessId, views]) => ({ businessId, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit || 10);
}

export function getViewSources(businessId: string): Record<string, number> {
  const sources: Record<string, number> = {
    search: 0,
    direct: 0,
    challenger: 0,
    referral: 0,
  };
  for (const e of viewEvents) {
    if (e.businessId === businessId) {
      sources[e.source] = (sources[e.source] || 0) + 1;
    }
  }
  return sources;
}

export function getAnalyticsStats(): {
  totalEvents: number;
  uniqueBusinesses: number;
  uniqueVisitors: number;
} {
  const businesses = new Set(viewEvents.map((e) => e.businessId));
  const visitors = new Set(viewEvents.map((e) => e.visitorId));
  return {
    totalEvents: viewEvents.length,
    uniqueBusinesses: businesses.size,
    uniqueVisitors: visitors.size,
  };
}

export function clearAnalyticsEvents(): void {
  bizAnalyticsLog.info("Clearing all analytics events");
  viewEvents.length = 0;
}
