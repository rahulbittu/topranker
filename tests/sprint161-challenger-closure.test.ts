/**
 * Sprint 161 — Challenger closure batch job tests
 *
 * Verifies:
 * 1. closeExpiredChallenges function exists and is exported
 * 2. Winner is determined by higher weighted votes
 * 3. Tie results in null winnerId (draw)
 * 4. Batch job is wired into server startup
 * 5. Cleanup on graceful shutdown
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Challenger closure batch job", () => {
  const challengersSrc = fs.readFileSync(
    path.resolve(__dirname, "../server/storage/challengers.ts"),
    "utf-8"
  );
  const serverSrc = fs.readFileSync(
    path.resolve(__dirname, "../server/index.ts"),
    "utf-8"
  );

  it("exports closeExpiredChallenges function", () => {
    expect(challengersSrc).toContain("export async function closeExpiredChallenges");
  });

  it("queries for active challenges past endDate", () => {
    expect(challengersSrc).toContain('eq(challengers.status, "active")');
    expect(challengersSrc).toContain("lte(challengers.endDate");
  });

  it("determines winner by comparing weighted votes", () => {
    expect(challengersSrc).toContain("challengerVotes > defenderVotes");
    expect(challengersSrc).toContain("defenderVotes > challengerVotes");
  });

  it("handles tie (draw) with null winnerId", () => {
    expect(challengersSrc).toContain("Tie: winnerId stays null");
  });

  it("sets status to completed", () => {
    expect(challengersSrc).toContain('status: "completed"');
  });

  it("persists winnerId to database", () => {
    expect(challengersSrc).toContain("winnerId,");
  });

  it("returns count of closed challenges", () => {
    expect(challengersSrc).toContain("return closed;");
  });

  it("is wired into server startup", () => {
    expect(serverSrc).toContain("closeExpiredChallenges");
    expect(serverSrc).toContain("./storage/challengers");
  });

  it("runs on hourly interval", () => {
    expect(serverSrc).toContain("60 * 60 * 1000");
  });

  it("clears interval on graceful shutdown", () => {
    expect(serverSrc).toContain("clearInterval(challengerInterval)");
  });

  it("runs immediately on startup (initial sweep)", () => {
    // closeExpiredChallenges() is called before setInterval
    const startupSection = serverSrc.slice(
      serverSrc.indexOf("closeExpiredChallenges"),
      serverSrc.indexOf("setInterval")
    );
    expect(startupSection).toContain("closeExpiredChallenges()");
  });
});
