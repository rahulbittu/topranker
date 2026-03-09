/**
 * Notification Storage — Sprint 182
 *
 * In-app notification persistence for the notification center.
 * Each push notification also creates an in-app record so users
 * can review past notifications.
 */

import { eq, and, desc, count, sql } from "drizzle-orm";
import { notifications, type Notification } from "@shared/schema";
import { db } from "../db";

/**
 * Create an in-app notification record.
 * Called alongside push notification sends to persist for notification center.
 */
export async function createNotification(data: {
  memberId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}): Promise<Notification> {
  const [notif] = await db
    .insert(notifications)
    .values({
      memberId: data.memberId,
      type: data.type,
      title: data.title,
      body: data.body,
      data: data.data || null,
    })
    .returning();
  return notif;
}

/**
 * Get paginated notifications for a member.
 */
export async function getMemberNotifications(
  memberId: string,
  page: number = 1,
  perPage: number = 20,
): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
  const offset = (page - 1) * perPage;

  const [results, totalResult, unreadResult] = await Promise.all([
    db
      .select()
      .from(notifications)
      .where(eq(notifications.memberId, memberId))
      .orderBy(desc(notifications.createdAt))
      .limit(perPage)
      .offset(offset),
    db
      .select({ count: count() })
      .from(notifications)
      .where(eq(notifications.memberId, memberId)),
    db
      .select({ count: count() })
      .from(notifications)
      .where(and(eq(notifications.memberId, memberId), eq(notifications.read, false))),
  ]);

  return {
    notifications: results,
    total: totalResult[0]?.count ?? 0,
    unreadCount: unreadResult[0]?.count ?? 0,
  };
}

/**
 * Mark a single notification as read.
 */
export async function markNotificationRead(
  notificationId: string,
  memberId: string,
): Promise<boolean> {
  const result = await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.id, notificationId), eq(notifications.memberId, memberId)));
  return (result as any).rowCount > 0;
}

/**
 * Mark all notifications as read for a member.
 */
export async function markAllNotificationsRead(memberId: string): Promise<number> {
  const result = await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.memberId, memberId), eq(notifications.read, false)));
  return (result as any).rowCount ?? 0;
}

/**
 * Get unread notification count for a member.
 */
export async function getUnreadNotificationCount(memberId: string): Promise<number> {
  const [result] = await db
    .select({ count: count() })
    .from(notifications)
    .where(and(eq(notifications.memberId, memberId), eq(notifications.read, false)));
  return result?.count ?? 0;
}
