/**
 * Offline Sync Foundation
 * Sprint 119 — in-memory queue for offline action buffering
 * Foundation for future offline-first data sync
 *
 * Author: Sarah Nakamura (Lead Eng)
 * Reviewed: Amir Patel (Architecture)
 */

export interface SyncAction {
  id: string;
  type: "create" | "update" | "delete";
  endpoint: string;
  payload: unknown;
  createdAt: number;
  retryCount: number;
}

export const MAX_RETRIES = 3;

const actionQueue = new Map<string, SyncAction>();

function generateId(): string {
  return Date.now() + Math.random().toString(36);
}

export function queueAction(
  action: Omit<SyncAction, "id" | "createdAt" | "retryCount">
): SyncAction {
  const syncAction: SyncAction = {
    ...action,
    id: generateId(),
    createdAt: Date.now(),
    retryCount: 0,
  };
  actionQueue.set(syncAction.id, syncAction);
  return syncAction;
}

export function getPendingActions(): SyncAction[] {
  return Array.from(actionQueue.values()).filter(
    (action) => action.retryCount < MAX_RETRIES
  );
}

export function markCompleted(id: string): boolean {
  return actionQueue.delete(id);
}

export function markFailed(id: string): boolean {
  const action = actionQueue.get(id);
  if (!action) return false;
  action.retryCount += 1;
  return true;
}

export function clearCompletedActions(): number {
  const toRemove: string[] = [];
  actionQueue.forEach((action, id) => {
    if (action.retryCount >= MAX_RETRIES) {
      toRemove.push(id);
    }
  });
  toRemove.forEach((id) => actionQueue.delete(id));
  return toRemove.length;
}
