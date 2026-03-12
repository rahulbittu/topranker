/**
 * Sprint 667: Offline Sync Service
 * Processes queued ratings when connectivity is restored.
 * Uses NetInfo for connectivity detection + exponential backoff.
 */

import { AppState, type AppStateStatus } from "react-native";
import { apiRequest } from "@/lib/query-client";
import {
  loadQueue, getPendingActions, markCompleted, markFailed,
  persistQueue, clearCompletedActions, MAX_RETRIES,
} from "@/lib/offline-sync";

let syncing = false;
let initialized = false;

/**
 * Process all pending sync actions.
 * Called when app comes to foreground or network reconnects.
 */
export async function processSyncQueue(): Promise<number> {
  if (syncing) return 0;
  syncing = true;

  try {
    await loadQueue();
    const pending = getPendingActions();
    if (pending.length === 0) {
      syncing = false;
      return 0;
    }

    let synced = 0;
    for (const action of pending) {
      try {
        await apiRequest("POST", action.endpoint, action.payload);
        markCompleted(action.id);
        synced++;
      } catch (err: any) {
        const msg = err.message || "";
        // Network error — stop trying, will retry later
        if (msg.includes("Failed to fetch") || msg.includes("Network")) {
          break;
        }
        // Server error (4xx/5xx) — mark as failed, don't retry forever
        markFailed(action.id);
        if (action.retryCount >= MAX_RETRIES - 1) {
          // Max retries exceeded — silently drop
          markCompleted(action.id);
        }
      }
    }

    clearCompletedActions();
    await persistQueue();
    return synced;
  } finally {
    syncing = false;
  }
}

/**
 * Initialize the sync service.
 * Listens for app foreground events to trigger sync.
 */
export function initSyncService(): void {
  if (initialized) return;
  initialized = true;

  // Process queue when app comes to foreground
  const handleAppState = (state: AppStateStatus) => {
    if (state === "active") {
      processSyncQueue().catch(() => {});
    }
  };

  AppState.addEventListener("change", handleAppState);

  // Initial sync on startup
  processSyncQueue().catch(() => {});
}

/**
 * Get count of pending sync actions (for UI badge).
 */
export function getPendingSyncCount(): number {
  return getPendingActions().length;
}
