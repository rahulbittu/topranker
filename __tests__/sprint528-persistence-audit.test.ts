/**
 * Sprint 528: In-memory store persistence audit
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 528: Persistence Audit", () => {
  describe("PERSISTENCE-AUDIT markers", () => {
    it("push-ab-testing.ts has persistence audit comment", () => {
      const src = readFile("server/push-ab-testing.ts");
      expect(src).toContain("PERSISTENCE-AUDIT");
      expect(src).toContain("push_experiments table");
    });

    it("notification-templates.ts has persistence audit comment", () => {
      const src = readFile("server/notification-templates.ts");
      expect(src).toContain("PERSISTENCE-AUDIT");
      expect(src).toContain("notification_templates table");
    });

    it("notification-frequency.ts has persistence audit comment", () => {
      const src = readFile("server/notification-frequency.ts");
      expect(src).toContain("PERSISTENCE-AUDIT");
      expect(src).toContain("notification_queue table");
    });

    it("push-ab-testing.ts rated LOW priority", () => {
      const src = readFile("server/push-ab-testing.ts");
      expect(src).toContain("Priority: LOW");
    });

    it("notification-templates.ts rated MEDIUM priority", () => {
      const src = readFile("server/notification-templates.ts");
      expect(src).toContain("Priority: MEDIUM");
    });

    it("notification-frequency.ts rated HIGH when batch activated", () => {
      const src = readFile("server/notification-frequency.ts");
      expect(src).toContain("Priority: HIGH");
    });
  });

  describe("docs/architecture/IN-MEMORY-STORE-AUDIT.md", () => {
    const src = readFile("docs/architecture/IN-MEMORY-STORE-AUDIT.md");

    it("has executive summary", () => {
      expect(src).toContain("Executive Summary");
      expect(src).toContain("27");
    });

    it("has 4 tiers", () => {
      expect(src).toContain("Tier 1: Ephemeral");
      expect(src).toContain("Tier 2: Low Priority");
      expect(src).toContain("Tier 3: Medium Priority");
      expect(src).toContain("Tier 4: High Priority");
    });

    it("identifies notification queue as highest risk", () => {
      expect(src).toContain("notification-frequency.ts");
      expect(src).toContain("notification_queue");
      expect(src).toContain("non-realtime frequency");
    });

    it("documents migration decision", () => {
      expect(src).toContain("No PostgreSQL migration in Sprint 528");
      expect(src).toContain("500-user target");
    });

    it("documents migration triggers", () => {
      expect(src).toContain("Migration triggers");
      expect(src).toContain("first user sets non-realtime preference");
    });

    it("covers all 3 flagged modules", () => {
      expect(src).toContain("push-ab-testing.ts");
      expect(src).toContain("notification-templates.ts");
      expect(src).toContain("notification-frequency.ts");
    });

    it("includes next review date", () => {
      expect(src).toContain("Sprint 535");
    });
  });

  describe("in-memory store inventory", () => {
    it("push-ab-testing.ts still uses in-memory Map", () => {
      const src = readFile("server/push-ab-testing.ts");
      expect(src).toContain("new Map<string, PushNotificationExperiment>()");
    });

    it("notification-templates.ts still uses in-memory Map", () => {
      const src = readFile("server/notification-templates.ts");
      expect(src).toContain("new Map<string, NotificationTemplate>()");
    });

    it("notification-frequency.ts still uses in-memory Map", () => {
      const src = readFile("server/notification-frequency.ts");
      expect(src).toContain("new Map<string, QueuedNotification[]>()");
    });
  });
});
