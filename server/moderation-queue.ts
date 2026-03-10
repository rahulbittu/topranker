/**
 * Sprint 242: Moderation Queue
 * In-memory moderation queue for review content pending approval.
 * Follows the same in-memory pattern as notifications.ts and alerting.ts.
 * Owner: Sarah Nakamura (Lead Eng)
 */

import { log } from "./logger";
import crypto from "crypto";

const modLog = log.tag("ModerationQueue");

type ModerationStatus = "pending" | "approved" | "rejected";
type ContentType = "review" | "photo" | "reply";

interface ModerationItem {
  id: string;
  contentType: ContentType;
  contentId: string;
  memberId: string;
  businessId: string;
  content: string;
  violations: string[];
  status: ModerationStatus;
  moderatorId: string | null;
  moderatorNote: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

const queue: ModerationItem[] = [];
const MAX_QUEUE = 2000;

export function addToQueue(
  item: Omit<ModerationItem, "id" | "status" | "moderatorId" | "moderatorNote" | "createdAt" | "resolvedAt">
): ModerationItem {
  const modItem: ModerationItem = {
    ...item,
    id: crypto.randomUUID(),
    status: "pending",
    moderatorId: null,
    moderatorNote: null,
    createdAt: new Date().toISOString(),
    resolvedAt: null,
  };
  queue.unshift(modItem);
  if (queue.length > MAX_QUEUE) queue.pop();
  modLog.info(`Added to moderation queue: ${item.contentType} from ${item.memberId}`);
  return modItem;
}

export function getPendingItems(limit?: number): ModerationItem[] {
  return queue.filter(i => i.status === "pending").slice(0, limit || 50);
}

export function getFilteredItems(opts: {
  status?: ModerationStatus;
  contentType?: ContentType;
  limit?: number;
  sortByViolations?: boolean;
}): ModerationItem[] {
  let items = [...queue];
  if (opts.status) items = items.filter(i => i.status === opts.status);
  if (opts.contentType) items = items.filter(i => i.contentType === opts.contentType);
  if (opts.sortByViolations) items.sort((a, b) => b.violations.length - a.violations.length);
  return items.slice(0, opts.limit || 50);
}

export function bulkApprove(itemIds: string[], moderatorId: string, note?: string): { approved: number; notFound: number } {
  let approved = 0;
  let notFound = 0;
  for (const id of itemIds) {
    if (approveItem(id, moderatorId, note)) approved++;
    else notFound++;
  }
  return { approved, notFound };
}

export function bulkReject(itemIds: string[], moderatorId: string, note?: string): { rejected: number; notFound: number } {
  let rejected = 0;
  let notFound = 0;
  for (const id of itemIds) {
    if (rejectItem(id, moderatorId, note)) rejected++;
    else notFound++;
  }
  return { rejected, notFound };
}

export function getResolvedItems(limit?: number): ModerationItem[] {
  return queue
    .filter(i => i.status === "approved" || i.status === "rejected")
    .slice(0, limit || 50);
}

export function approveItem(itemId: string, moderatorId: string, note?: string): boolean {
  const item = queue.find(i => i.id === itemId);
  if (!item || item.status !== "pending") return false;
  item.status = "approved";
  item.moderatorId = moderatorId;
  item.moderatorNote = note || null;
  item.resolvedAt = new Date().toISOString();
  modLog.info(`Approved: ${itemId} by ${moderatorId}`);
  return true;
}

export function rejectItem(itemId: string, moderatorId: string, note?: string): boolean {
  const item = queue.find(i => i.id === itemId);
  if (!item || item.status !== "pending") return false;
  item.status = "rejected";
  item.moderatorId = moderatorId;
  item.moderatorNote = note || null;
  item.resolvedAt = new Date().toISOString();
  modLog.info(`Rejected: ${itemId} by ${moderatorId}`);
  return true;
}

export function getQueueStats(): { total: number; pending: number; approved: number; rejected: number } {
  return {
    total: queue.length,
    pending: queue.filter(i => i.status === "pending").length,
    approved: queue.filter(i => i.status === "approved").length,
    rejected: queue.filter(i => i.status === "rejected").length,
  };
}

export function getItemsByBusiness(businessId: string): ModerationItem[] {
  return queue.filter(i => i.businessId === businessId);
}

export function getItemsByMember(memberId: string): ModerationItem[] {
  return queue.filter(i => i.memberId === memberId);
}

export function clearQueue(): void {
  queue.length = 0;
}

export { MAX_QUEUE };
