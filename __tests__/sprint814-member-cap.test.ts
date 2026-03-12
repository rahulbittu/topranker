/**
 * Sprint 814: Push Token Total Member Cap
 *
 * Addresses critique 790-794: "No stated decision on whether to cap
 * total unique members in the push token store."
 *
 * Adds MAX_UNIQUE_MEMBERS = 10000 with LRU member eviction.
 */
import { describe, it, expect, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 814: Push Token Total Member Cap", () => {
  const pushSrc = readFile("server/push-notifications.ts");

  describe("MAX_UNIQUE_MEMBERS constant", () => {
    it("exports MAX_UNIQUE_MEMBERS", () => {
      expect(pushSrc).toContain("export const MAX_UNIQUE_MEMBERS");
    });

    it("set to 10000", () => {
      expect(pushSrc).toContain("MAX_UNIQUE_MEMBERS = 10000");
    });
  });

  describe("member-level eviction", () => {
    it("checks tokens.size against MAX_UNIQUE_MEMBERS", () => {
      expect(pushSrc).toContain("tokens.size >= MAX_UNIQUE_MEMBERS");
    });

    it("evicts LRU member (least recently active)", () => {
      expect(pushSrc).toContain("Push member evicted (LRU)");
    });

    it("deletes evicted member from tokens map", () => {
      expect(pushSrc).toContain("tokens.delete(lruMember)");
    });
  });

  describe("functional behavior", () => {
    let registerPushToken: any;
    let getMemberTokens: any;
    let clearPushData: any;
    let getPushStats: any;

    beforeEach(async () => {
      const mod = await import("../server/push-notifications");
      registerPushToken = mod.registerPushToken;
      getMemberTokens = mod.getMemberTokens;
      clearPushData = mod.clearPushData;
      getPushStats = mod.getPushStats;
      clearPushData();
    });

    it("tracks multiple members", () => {
      registerPushToken("user1", "t1", "ios");
      registerPushToken("user2", "t2", "android");
      registerPushToken("user3", "t3", "web");
      const stats = getPushStats();
      expect(stats.uniqueMembers).toBe(3);
      expect(stats.totalTokens).toBe(3);
    });

    it("existing member re-registration does not create new entry", () => {
      registerPushToken("user1", "t1", "ios");
      registerPushToken("user1", "t2", "android");
      const stats = getPushStats();
      expect(stats.uniqueMembers).toBe(1);
      expect(stats.totalTokens).toBe(2);
    });
  });

  describe("file health", () => {
    it("build under 750kb", () => {
      const buildSrc = readFile("server_dist/index.js");
      expect(buildSrc.length / 1024).toBeLessThan(750);
    });
  });
});
