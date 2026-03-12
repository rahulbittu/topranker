/**
 * Sprint 734 — Offline-Aware Query Hook
 * When a query errors but has cached data, shows stale data with a timestamp
 * instead of an error state. Only shows error state when truly no data is available.
 *
 * Owner: Derek Liu (Mobile)
 */

import { useEffect, useState } from "react";
import { Platform } from "react-native";

interface OfflineAwareResult {
  /** True if we're showing stale (cached) data during an error */
  isStale: boolean;
  /** Human-readable "last updated" string */
  staleLabel: string | null;
  /** True if we should show error state (no cached data at all) */
  showError: boolean;
}

/**
 * Determines offline-aware UI state from a React Query result.
 *
 * @param isError - Whether the query is in error state
 * @param dataUpdatedAt - Timestamp of last successful data fetch (from useQuery)
 * @param hasData - Whether any data exists (e.g., businesses.length > 0)
 */
export function useOfflineAware(
  isError: boolean,
  dataUpdatedAt: number,
  hasData: boolean,
): OfflineAwareResult {
  const [now, setNow] = useState(Date.now());

  // Update "now" every 30s for relative time display
  useEffect(() => {
    if (!isError || !hasData) return;
    const interval = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, [isError, hasData]);

  if (!isError) {
    return { isStale: false, staleLabel: null, showError: false };
  }

  // Error with cached data → show stale data
  if (hasData && dataUpdatedAt > 0) {
    const ageMs = now - dataUpdatedAt;
    return {
      isStale: true,
      staleLabel: formatAge(ageMs),
      showError: false,
    };
  }

  // Error with no cached data → show error state
  return { isStale: false, staleLabel: null, showError: true };
}

function formatAge(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return "Updated just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Updated ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Updated ${hours}h ago`;
  return `Updated ${Math.floor(hours / 24)}d ago`;
}
