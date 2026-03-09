/**
 * Sprint 241: Real-Time Notification Module
 * In-memory notification system for member-facing events.
 * Owner: Sarah Nakamura (Lead Engineer)
 *
 * Notification types cover the core member lifecycle:
 * rating_received, claim_approved, tier_promoted, badge_earned,
 * challenge_invite, weekly_digest, system
 */

import { log } from "./logger";
import crypto from "crypto";

const notifLog = log.tag("Notifications");

type NotificationType = "rating_received" | "claim_approved" | "tier_promoted" | "badge_earned" | "challenge_invite" | "weekly_digest" | "system";

interface Notification {
  id: string;
  memberId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

const store = new Map<string, Notification[]>();
const MAX_PER_MEMBER = 100;

export function createNotification(memberId: string, type: NotificationType, title: string, body: string): Notification {
  const notif: Notification = {
    id: crypto.randomUUID(),
    memberId,
    type,
    title,
    body,
    read: false,
    createdAt: new Date().toISOString(),
  };
  if (!store.has(memberId)) store.set(memberId, []);
  const list = store.get(memberId)!;
  list.unshift(notif);
  if (list.length > MAX_PER_MEMBER) list.pop();
  notifLog.info(`Notification created: ${type} for ${memberId}`);
  return notif;
}

export function getNotifications(memberId: string, limit?: number): Notification[] {
  const list = store.get(memberId) || [];
  return list.slice(0, limit || 20);
}

export function getUnreadCount(memberId: string): number {
  return (store.get(memberId) || []).filter(n => !n.read).length;
}

export function markAsRead(notificationId: string): boolean {
  for (const list of store.values()) {
    const notif = list.find(n => n.id === notificationId);
    if (notif) { notif.read = true; return true; }
  }
  return false;
}

export function markAllRead(memberId: string): number {
  const list = store.get(memberId) || [];
  let count = 0;
  for (const n of list) { if (!n.read) { n.read = true; count++; } }
  return count;
}

export function deleteNotification(notificationId: string): boolean {
  for (const [memberId, list] of store) {
    const idx = list.findIndex(n => n.id === notificationId);
    if (idx !== -1) { list.splice(idx, 1); return true; }
  }
  return false;
}

export function getNotificationStats(): { totalMembers: number; totalNotifications: number; totalUnread: number } {
  let total = 0, unread = 0;
  for (const list of store.values()) {
    total += list.length;
    unread += list.filter(n => !n.read).length;
  }
  return { totalMembers: store.size, totalNotifications: total, totalUnread: unread };
}

export function clearNotifications(memberId?: string): void {
  if (memberId) store.delete(memberId);
  else store.clear();
}
