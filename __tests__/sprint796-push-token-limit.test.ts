/**
 * Sprint 796: Push Token Store Size Limit
 *
 * Closes Audit M1: in-memory push token store had no per-member limit.
 * Adds MAX_TOKENS_PER_MEMBER = 10 with oldest-eviction policy.
 */
import { describe, it, expect, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 796: Push Token Store Size Limit", () => {
  const pushSrc = readFile("server/push-notifications.ts");

  describe("MAX_TOKENS_PER_MEMBER constant", () => {
    it("exports MAX_TOKENS_PER_MEMBER", () => {
      expect(pushSrc).toContain("export const MAX_TOKENS_PER_MEMBER");
    });

    it("set to 10", () => {
      expect(pushSrc).toContain("MAX_TOKENS_PER_MEMBER = 10");
    });
  });

  describe("eviction logic", () => {
    it("checks length against MAX_TOKENS_PER_MEMBER before push", () => {
      expect(pushSrc).toContain("memberList.length >= MAX_TOKENS_PER_MEMBER");
    });

    it("evicts oldest token via shift()", () => {
      expect(pushSrc).toContain("memberList.shift()");
    });

    it("logs eviction event", () => {
      expect(pushSrc).toContain("Push token evicted (oldest)");
    });
  });

  describe("existing caps preserved", () => {
    it("MAX_MESSAGES still capped at 5000", () => {
      expect(pushSrc).toContain("MAX_MESSAGES = 5000");
    });

    it("messageLog still uses pop() eviction", () => {
      expect(pushSrc).toContain("if (messageLog.length > MAX_MESSAGES) messageLog.pop()");
    });
  });

  describe("functional behavior", () => {
    let registerPushToken: any;
    let getMemberTokens: any;
    let clearPushData: any;
    let MAX_TOKENS_PER_MEMBER: number;

    beforeEach(async () => {
      const mod = await import("../server/push-notifications");
      registerPushToken = mod.registerPushToken;
      getMemberTokens = mod.getMemberTokens;
      clearPushData = mod.clearPushData;
      MAX_TOKENS_PER_MEMBER = mod.MAX_TOKENS_PER_MEMBER;
      clearPushData();
    });

    it("allows up to MAX_TOKENS_PER_MEMBER tokens", () => {
      for (let i = 0; i < MAX_TOKENS_PER_MEMBER; i++) {
        registerPushToken("user1", `token-${i}`, "ios");
      }
      expect(getMemberTokens("user1")).toHaveLength(MAX_TOKENS_PER_MEMBER);
    });

    it("evicts oldest when limit exceeded", () => {
      for (let i = 0; i < MAX_TOKENS_PER_MEMBER + 2; i++) {
        registerPushToken("user1", `token-${i}`, "ios");
      }
      const tokens = getMemberTokens("user1");
      expect(tokens).toHaveLength(MAX_TOKENS_PER_MEMBER);
      // Oldest tokens (token-0, token-1) should be evicted
      expect(tokens[0].token).toBe("token-2");
      expect(tokens[tokens.length - 1].token).toBe(`token-${MAX_TOKENS_PER_MEMBER + 1}`);
    });

    it("does not evict when re-registering existing token", () => {
      registerPushToken("user1", "token-a", "ios");
      registerPushToken("user1", "token-b", "android");
      // Re-register existing token — should update lastUsed, not add new
      registerPushToken("user1", "token-a", "ios");
      expect(getMemberTokens("user1")).toHaveLength(2);
    });
  });

  describe("file health", () => {
    const thresholds = JSON.parse(readFile("shared/thresholds.json"));

    it("build under 750kb", () => {
      const buildSrc = readFile("server_dist/index.js");
      expect(buildSrc.length / 1024).toBeLessThan(750);
    });
  });
});
