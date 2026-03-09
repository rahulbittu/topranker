/**
 * Sprint 249: WebSocket Connection Manager
 * In-memory WebSocket connection manager for real-time push notifications.
 * Tracks connections per member, broadcasts messages, and logs recent activity.
 * Owner: Sarah Nakamura (Lead Eng)
 */

import { log } from "./logger";
import crypto from "crypto";

const wsLog = log.tag("WebSocketManager");

interface WSConnection {
  id: string;
  memberId: string;
  connectedAt: string;
  lastPing: string;
}

interface WSMessage {
  type: "notification" | "rating_update" | "challenge_update" | "system";
  payload: Record<string, unknown>;
  timestamp: string;
}

const connections = new Map<string, WSConnection>();
const memberConnections = new Map<string, Set<string>>(); // memberId -> Set<connectionId>
const messageLog: WSMessage[] = [];
const MAX_MESSAGE_LOG = 1000;

export function registerConnection(memberId: string): WSConnection {
  const conn: WSConnection = {
    id: crypto.randomUUID(),
    memberId,
    connectedAt: new Date().toISOString(),
    lastPing: new Date().toISOString(),
  };
  connections.set(conn.id, conn);
  if (!memberConnections.has(memberId)) memberConnections.set(memberId, new Set());
  memberConnections.get(memberId)!.add(conn.id);
  wsLog.info(`Connection registered: ${conn.id} for member ${memberId}`);
  return conn;
}

export function removeConnection(connectionId: string): boolean {
  const conn = connections.get(connectionId);
  if (!conn) return false;
  connections.delete(connectionId);
  memberConnections.get(conn.memberId)?.delete(connectionId);
  if (memberConnections.get(conn.memberId)?.size === 0) memberConnections.delete(conn.memberId);
  wsLog.info(`Connection removed: ${connectionId}`);
  return true;
}

export function getActiveConnections(): WSConnection[] {
  return Array.from(connections.values());
}

export function getMemberConnections(memberId: string): WSConnection[] {
  const ids = memberConnections.get(memberId);
  if (!ids) return [];
  return Array.from(ids).map(id => connections.get(id)!).filter(Boolean);
}

export function broadcastToMember(memberId: string, message: WSMessage): number {
  const ids = memberConnections.get(memberId);
  if (!ids || ids.size === 0) return 0;
  messageLog.unshift(message);
  if (messageLog.length > MAX_MESSAGE_LOG) messageLog.pop();
  return ids.size;
}

export function broadcastToAll(message: WSMessage): number {
  messageLog.unshift(message);
  if (messageLog.length > MAX_MESSAGE_LOG) messageLog.pop();
  return connections.size;
}

export function getConnectionStats(): { totalConnections: number; uniqueMembers: number; messagesSent: number } {
  return {
    totalConnections: connections.size,
    uniqueMembers: memberConnections.size,
    messagesSent: messageLog.length,
  };
}

export function getRecentMessages(limit?: number): WSMessage[] {
  return messageLog.slice(0, limit || 20);
}

export function pingConnection(connectionId: string): boolean {
  const conn = connections.get(connectionId);
  if (!conn) return false;
  conn.lastPing = new Date().toISOString();
  return true;
}

export function clearConnections(): void {
  connections.clear();
  memberConnections.clear();
  messageLog.length = 0;
}
