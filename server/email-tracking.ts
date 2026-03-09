import { log } from "./logger";
import crypto from "crypto";

export interface EmailDeliveryEvent {
  id: string;
  to: string;
  template: string;
  sentAt: Date;
  status: "sent" | "delivered" | "opened" | "clicked" | "bounced" | "failed";
  openedAt?: Date;
  clickedAt?: Date;
  metadata?: Record<string, unknown>;
}

const MAX_EVENTS = 1000;
const events: EmailDeliveryEvent[] = [];

function findEvent(eventId: string): EmailDeliveryEvent | undefined {
  return events.find((e) => e.id === eventId);
}

export function trackEmailSent(
  to: string,
  template: string,
  metadata?: Record<string, unknown>,
): string {
  const id = crypto.randomUUID();
  const event: EmailDeliveryEvent = {
    id,
    to,
    template,
    sentAt: new Date(),
    status: "sent",
    metadata,
  };
  events.push(event);
  if (events.length > MAX_EVENTS) {
    events.splice(0, events.length - MAX_EVENTS);
  }
  log(`Email sent to=${to} template=${template} id=${id}`);
  return id;
}

export function trackEmailOpened(eventId: string): void {
  const event = findEvent(eventId);
  if (!event) return;
  event.status = "opened";
  event.openedAt = new Date();
  log(`Email opened id=${eventId}`);
}

export function trackEmailClicked(eventId: string): void {
  const event = findEvent(eventId);
  if (!event) return;
  event.status = "clicked";
  event.clickedAt = new Date();
  log(`Email clicked id=${eventId}`);
}

export function trackEmailFailed(eventId: string, reason: string): void {
  const event = findEvent(eventId);
  if (!event) return;
  event.status = "failed";
  event.metadata = { ...event.metadata, failureReason: reason };
  log(`Email failed id=${eventId} reason=${reason}`);
}

export function trackEmailBounced(eventId: string): void {
  const event = findEvent(eventId);
  if (!event) return;
  event.status = "bounced";
  log(`Email bounced id=${eventId}`);
}

export function getEmailStats() {
  const total = events.length;
  const count = (s: EmailDeliveryEvent["status"]) =>
    events.filter((e) => e.status === s).length;
  const sent = count("sent");
  const delivered = count("delivered");
  const opened = count("opened");
  const clicked = count("clicked");
  const bounced = count("bounced");
  const failed = count("failed");
  const openRate = total > 0 ? (opened + clicked) / total : 0;
  const clickRate = total > 0 ? clicked / total : 0;
  return { total, sent, delivered, opened, clicked, bounced, failed, openRate, clickRate };
}

export function getRecentEvents(limit = 50): EmailDeliveryEvent[] {
  return events.slice(-limit).reverse();
}

export function clearEvents(): void {
  events.length = 0;
}
