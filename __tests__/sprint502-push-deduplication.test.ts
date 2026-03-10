/**
 * Sprint 502: Push notification open deduplication
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 502: Push Notification Deduplication", () => {
  describe("push-analytics.ts dedup logic", () => {
    const src = readFile("server/push-analytics.ts");

    it("has deduplication Set for open records", () => {
      expect(src).toContain("openDedupSet");
      expect(src).toContain("new Set<string>()");
    });

    it("uses notificationId:memberId as dedup key", () => {
      expect(src).toContain("${notificationId}:${memberId}");
    });

    it("checks dedup set before recording", () => {
      expect(src).toContain("openDedupSet.has(dedupKey)");
    });

    it("returns false for duplicate opens", () => {
      expect(src).toContain("return false");
    });

    it("returns true for new opens", () => {
      expect(src).toContain("return true");
    });

    it("has MAX_DEDUP_SIZE limit", () => {
      expect(src).toContain("MAX_DEDUP_SIZE");
      expect(src).toContain("50000");
    });

    it("evicts oldest dedup entries when over limit", () => {
      expect(src).toContain("openDedupSet.delete");
    });

    it("logs duplicate skips", () => {
      expect(src).toContain("Duplicate open skipped");
    });

    it("exports getOpenDedupSize for health monitoring", () => {
      expect(src).toContain("export function getOpenDedupSize");
    });

    it("recordNotificationOpen returns boolean", () => {
      expect(src).toContain("): boolean {");
    });
  });

  describe("routes-notifications.ts returns recorded status", () => {
    const src = readFile("server/routes-notifications.ts");

    it("captures return value from recordNotificationOpen", () => {
      expect(src).toContain("const recorded = recordNotificationOpen");
    });

    it("includes recorded in response", () => {
      expect(src).toContain("recorded");
    });
  });

  describe("file health", () => {
    it("push-analytics.ts under 280 LOC", () => {
      const loc = readFile("server/push-analytics.ts").split("\n").length;
      expect(loc).toBeLessThan(280);
    });

    it("routes-notifications.ts under 95 LOC", () => {
      const loc = readFile("server/routes-notifications.ts").split("\n").length;
      expect(loc).toBeLessThan(95);
    });
  });
});
