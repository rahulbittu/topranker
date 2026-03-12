/**
 * Push Notification Service — Sprint 251
 *
 * Expo Push notification sender module. Manages device tokens,
 * sends notifications (simulated in dev, Expo Push API in production),
 * and tracks delivery status.
 *
 * NOTE: This is an in-memory store. Per Arch Audit #32, no new in-memory
 * stores should be added after Sprint 258-259 Redis migration. This module
 * will be migrated to Redis as part of that effort.
 */

import { log } from "./logger";
import crypto from "crypto";

const pushLog = log.tag("PushNotifications");

export interface PushToken {
  memberId: string;
  token: string;
  platform: "ios" | "android" | "web";
  registeredAt: string;
  lastUsed: string;
}

export interface PushMessage {
  id: string;
  memberId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  status: "queued" | "sent" | "failed";
  sentAt: string | null;
  error: string | null;
}

const tokens = new Map<string, PushToken[]>();   // memberId → tokens
const messageLog: PushMessage[] = [];
export const MAX_MESSAGES = 5000;
// Sprint 796: Cap tokens per member to prevent unbounded growth (Audit M1)
export const MAX_TOKENS_PER_MEMBER = 10;

export function registerPushToken(memberId: string, token: string, platform: PushToken["platform"]): PushToken {
  if (!tokens.has(memberId)) tokens.set(memberId, []);
  const existing = tokens.get(memberId)!.find(t => t.token === token);
  if (existing) {
    existing.lastUsed = new Date().toISOString();
    return existing;
  }
  const entry: PushToken = {
    memberId,
    token,
    platform,
    registeredAt: new Date().toISOString(),
    lastUsed: new Date().toISOString(),
  };
  const memberList = tokens.get(memberId)!;
  // Sprint 796: Evict when per-member limit exceeded
  // Sprint 813: LRU eviction — remove least-recently-used token, not oldest by registration.
  // Rationale: an actively-used old device should survive over an abandoned newer device.
  if (memberList.length >= MAX_TOKENS_PER_MEMBER) {
    let lruIdx = 0;
    let lruTime = memberList[0].lastUsed;
    for (let i = 1; i < memberList.length; i++) {
      if (memberList[i].lastUsed < lruTime) {
        lruIdx = i;
        lruTime = memberList[i].lastUsed;
      }
    }
    const evicted = memberList.splice(lruIdx, 1)[0];
    pushLog.info(`Push token evicted (LRU): ${evicted.platform} for ${memberId}, lastUsed=${evicted.lastUsed}`);
  }
  memberList.push(entry);
  pushLog.info(`Push token registered: ${platform} for ${memberId}`);
  return entry;
}

export function removePushToken(memberId: string, token: string): boolean {
  const list = tokens.get(memberId);
  if (!list) return false;
  const idx = list.findIndex(t => t.token === token);
  if (idx === -1) return false;
  list.splice(idx, 1);
  if (list.length === 0) tokens.delete(memberId);
  return true;
}

export function getMemberTokens(memberId: string): PushToken[] {
  return tokens.get(memberId) || [];
}

export function sendPushNotification(memberId: string, title: string, body: string, data?: Record<string, string>): PushMessage {
  const msg: PushMessage = {
    id: crypto.randomUUID(),
    memberId,
    title,
    body,
    data,
    status: "queued",
    sentAt: null,
    error: null,
  };

  const memberTokens = tokens.get(memberId);
  if (!memberTokens || memberTokens.length === 0) {
    msg.status = "failed";
    msg.error = "No push tokens registered";
  } else {
    // In production, would call Expo Push API here:
    // POST https://exp.host/--/api/v2/push/send
    msg.status = "sent";
    msg.sentAt = new Date().toISOString();
    pushLog.info(`Push sent to ${memberId}: ${title}`);
  }

  messageLog.unshift(msg);
  if (messageLog.length > MAX_MESSAGES) messageLog.pop();
  return msg;
}

export function sendBulkPush(memberIds: string[], title: string, body: string, data?: Record<string, string>): { sent: number; failed: number } {
  let sent = 0, failed = 0;
  for (const id of memberIds) {
    const msg = sendPushNotification(id, title, body, data);
    if (msg.status === "sent") sent++;
    else failed++;
  }
  return { sent, failed };
}

export function getPushStats(): { totalTokens: number; uniqueMembers: number; messagesSent: number; messagesFailed: number } {
  let totalTokens = 0;
  for (const list of tokens.values()) totalTokens += list.length;
  return {
    totalTokens,
    uniqueMembers: tokens.size,
    messagesSent: messageLog.filter(m => m.status === "sent").length,
    messagesFailed: messageLog.filter(m => m.status === "failed").length,
  };
}

export function getRecentMessages(limit?: number): PushMessage[] {
  return messageLog.slice(0, limit || 20);
}

export function clearPushData(): void {
  tokens.clear();
  messageLog.length = 0;
}
