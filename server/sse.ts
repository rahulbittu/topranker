import type { Response } from "express";

/**
 * Server-Sent Events (SSE) event bus for near-real-time updates.
 * Clients connect to /api/events and receive JSON-encoded events
 * when rankings, ratings, challengers, or other data changes.
 */

export type SSEEventType =
  | "ranking_updated"
  | "rating_submitted"
  | "challenger_updated"
  | "business_updated"
  | "featured_updated";

interface SSEEvent {
  type: SSEEventType;
  payload: Record<string, unknown>;
  timestamp: number;
}

const clients = new Set<Response>();

/** Add a new SSE client connection */
export function addClient(res: Response): void {
  clients.add(res);
  res.on("close", () => {
    clients.delete(res);
  });
}

/** Broadcast an event to all connected clients */
export function broadcast(type: SSEEventType, payload: Record<string, unknown> = {}): void {
  const event: SSEEvent = { type, payload, timestamp: Date.now() };
  const data = `data: ${JSON.stringify(event)}\n\n`;
  for (const client of clients) {
    try {
      client.write(data);
    } catch {
      clients.delete(client);
    }
  }
}

/** Get the number of connected SSE clients */
export function getClientCount(): number {
  return clients.size;
}
