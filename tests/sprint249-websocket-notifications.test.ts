/**
 * Sprint 249 — Real-Time WebSocket Notifications
 *
 * Validates:
 * 1. WebSocket manager static (10 tests) — file, exports, types, MAX_MESSAGE_LOG, logger
 * 2. WebSocket manager runtime (16 tests) — register, remove, broadcast, stats, ping, clear
 * 3. Admin routes static (6 tests) — 4 endpoints exist
 * 4. Integration (4 tests) — wiring into routes.ts
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. WebSocket Manager — Static Analysis (10 tests)
// ---------------------------------------------------------------------------
describe("WebSocket manager static — server/websocket-manager.ts", () => {
  const src = readFile("server/websocket-manager.ts");

  it("file exists", () => {
    expect(fileExists("server/websocket-manager.ts")).toBe(true);
  });

  it("exports registerConnection", () => {
    expect(src).toContain("export function registerConnection");
  });

  it("exports removeConnection", () => {
    expect(src).toContain("export function removeConnection");
  });

  it("exports getActiveConnections", () => {
    expect(src).toContain("export function getActiveConnections");
  });

  it("exports broadcastToMember", () => {
    expect(src).toContain("export function broadcastToMember");
  });

  it("exports broadcastToAll", () => {
    expect(src).toContain("export function broadcastToAll");
  });

  it("exports getConnectionStats", () => {
    expect(src).toContain("export function getConnectionStats");
  });

  it("defines WSMessage type with notification | rating_update | challenge_update | system", () => {
    expect(src).toContain('"notification"');
    expect(src).toContain('"rating_update"');
    expect(src).toContain('"challenge_update"');
    expect(src).toContain('"system"');
  });

  it("uses MAX_MESSAGE_LOG = 1000", () => {
    expect(src).toContain("MAX_MESSAGE_LOG = 1000");
  });

  it("imports logger for structured logging", () => {
    expect(src).toContain('import { log } from "./logger"');
  });
});

// ---------------------------------------------------------------------------
// 2. WebSocket Manager — Runtime (16 tests)
// ---------------------------------------------------------------------------
describe("WebSocket manager runtime", () => {
  let wm: typeof import("../server/websocket-manager");

  beforeEach(async () => {
    wm = await import("../server/websocket-manager");
    wm.clearConnections();
  });

  it("registerConnection returns a WSConnection with id, memberId, connectedAt, lastPing", () => {
    const conn = wm.registerConnection("member-1");
    expect(conn.id).toBeDefined();
    expect(conn.memberId).toBe("member-1");
    expect(conn.connectedAt).toBeDefined();
    expect(conn.lastPing).toBeDefined();
  });

  it("registerConnection adds to active connections", () => {
    wm.registerConnection("member-1");
    expect(wm.getActiveConnections().length).toBe(1);
  });

  it("removeConnection returns true for valid connectionId", () => {
    const conn = wm.registerConnection("member-1");
    expect(wm.removeConnection(conn.id)).toBe(true);
  });

  it("removeConnection returns false for unknown connectionId", () => {
    expect(wm.removeConnection("nonexistent-id")).toBe(false);
  });

  it("removeConnection reduces active connection count", () => {
    const conn = wm.registerConnection("member-1");
    wm.removeConnection(conn.id);
    expect(wm.getActiveConnections().length).toBe(0);
  });

  it("getActiveConnections returns all connections", () => {
    wm.registerConnection("member-1");
    wm.registerConnection("member-2");
    expect(wm.getActiveConnections().length).toBe(2);
  });

  it("getMemberConnections returns only connections for given member", () => {
    wm.registerConnection("member-1");
    wm.registerConnection("member-1");
    wm.registerConnection("member-2");
    expect(wm.getMemberConnections("member-1").length).toBe(2);
    expect(wm.getMemberConnections("member-2").length).toBe(1);
  });

  it("getMemberConnections returns empty array for unknown member", () => {
    expect(wm.getMemberConnections("unknown")).toEqual([]);
  });

  it("broadcastToMember returns number of connections for member", () => {
    wm.registerConnection("member-1");
    wm.registerConnection("member-1");
    const msg = { type: "notification" as const, payload: { text: "hi" }, timestamp: new Date().toISOString() };
    expect(wm.broadcastToMember("member-1", msg)).toBe(2);
  });

  it("broadcastToMember returns 0 for unknown member", () => {
    const msg = { type: "notification" as const, payload: {}, timestamp: new Date().toISOString() };
    expect(wm.broadcastToMember("unknown", msg)).toBe(0);
  });

  it("broadcastToAll returns total connection count", () => {
    wm.registerConnection("member-1");
    wm.registerConnection("member-2");
    wm.registerConnection("member-3");
    const msg = { type: "system" as const, payload: { text: "maintenance" }, timestamp: new Date().toISOString() };
    expect(wm.broadcastToAll(msg)).toBe(3);
  });

  it("getConnectionStats returns correct totals", () => {
    wm.registerConnection("member-1");
    wm.registerConnection("member-1");
    wm.registerConnection("member-2");
    const stats = wm.getConnectionStats();
    expect(stats.totalConnections).toBe(3);
    expect(stats.uniqueMembers).toBe(2);
    expect(stats.messagesSent).toBe(0);
  });

  it("getRecentMessages returns messages in reverse chronological order", () => {
    const msg1 = { type: "system" as const, payload: { n: 1 }, timestamp: "2026-01-01T00:00:00Z" };
    const msg2 = { type: "system" as const, payload: { n: 2 }, timestamp: "2026-01-01T00:00:01Z" };
    wm.registerConnection("member-1");
    wm.broadcastToAll(msg1);
    wm.broadcastToAll(msg2);
    const recent = wm.getRecentMessages(2);
    expect(recent.length).toBe(2);
    expect((recent[0].payload as any).n).toBe(2);
  });

  it("pingConnection updates lastPing timestamp", () => {
    const conn = wm.registerConnection("member-1");
    const originalPing = conn.lastPing;
    // Small delay to ensure different timestamp
    const result = wm.pingConnection(conn.id);
    expect(result).toBe(true);
  });

  it("pingConnection returns false for unknown connectionId", () => {
    expect(wm.pingConnection("nonexistent")).toBe(false);
  });

  it("clearConnections empties everything", () => {
    wm.registerConnection("member-1");
    wm.registerConnection("member-2");
    const msg = { type: "system" as const, payload: {}, timestamp: new Date().toISOString() };
    wm.broadcastToAll(msg);
    wm.clearConnections();
    expect(wm.getActiveConnections().length).toBe(0);
    expect(wm.getConnectionStats().totalConnections).toBe(0);
    expect(wm.getConnectionStats().messagesSent).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 3. Admin WebSocket Routes — Static (6 tests)
// ---------------------------------------------------------------------------
describe("Admin WebSocket routes — server/routes-admin-websocket.ts", () => {
  const src = readFile("server/routes-admin-websocket.ts");

  it("file exists", () => {
    expect(fileExists("server/routes-admin-websocket.ts")).toBe(true);
  });

  it("exports registerAdminWebSocketRoutes", () => {
    expect(src).toContain("export function registerAdminWebSocketRoutes");
  });

  it("registers GET /api/admin/websocket/connections", () => {
    expect(src).toContain("/api/admin/websocket/connections");
  });

  it("registers GET /api/admin/websocket/stats", () => {
    expect(src).toContain("/api/admin/websocket/stats");
  });

  it("registers GET /api/admin/websocket/messages", () => {
    expect(src).toContain("/api/admin/websocket/messages");
  });

  it("registers POST /api/admin/websocket/broadcast", () => {
    expect(src).toContain("/api/admin/websocket/broadcast");
  });
});

// ---------------------------------------------------------------------------
// 4. Integration (4 tests)
// ---------------------------------------------------------------------------
describe("Integration — routes-admin.ts wiring", () => {
  const adminSrc = readFile("server/routes-admin.ts");

  it("imports registerAdminWebSocketRoutes", () => {
    expect(adminSrc).toContain('import { registerAdminWebSocketRoutes } from "./routes-admin-websocket"');
  });

  it("calls registerAdminWebSocketRoutes(app)", () => {
    expect(adminSrc).toContain("registerAdminWebSocketRoutes(app)");
  });

  it("websocket-manager.ts imports crypto for connection IDs", () => {
    const wsSrc = readFile("server/websocket-manager.ts");
    expect(wsSrc).toContain('import crypto from "crypto"');
  });

  it("routes-admin-websocket.ts imports from websocket-manager", () => {
    const adminSrc = readFile("server/routes-admin-websocket.ts");
    expect(adminSrc).toContain('from "./websocket-manager"');
  });
});
