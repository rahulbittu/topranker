/**
 * Webhook Events Storage — audit log for all incoming webhook events.
 * Supports replay and debugging of failed webhook processing.
 */
import { eq, desc } from "drizzle-orm";
import { webhookEvents, type WebhookEvent } from "@shared/schema";
import { db } from "../db";

export async function logWebhookEvent(params: {
  source: string;
  eventId: string;
  eventType: string;
  payload: unknown;
  processed?: boolean;
  error?: string;
}): Promise<WebhookEvent> {
  const [event] = await db
    .insert(webhookEvents)
    .values({
      source: params.source,
      eventId: params.eventId,
      eventType: params.eventType,
      payload: params.payload,
      processed: params.processed ?? false,
      error: params.error || null,
    })
    .returning();
  return event;
}

export async function markWebhookProcessed(
  id: string,
  error?: string,
): Promise<void> {
  await db
    .update(webhookEvents)
    .set({ processed: true, error: error || null })
    .where(eq(webhookEvents.id, id));
}

export async function getRecentWebhookEvents(
  source: string,
  limit: number = 50,
): Promise<WebhookEvent[]> {
  return db
    .select()
    .from(webhookEvents)
    .where(eq(webhookEvents.source, source))
    .orderBy(desc(webhookEvents.createdAt))
    .limit(limit);
}
