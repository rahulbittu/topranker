/**
 * Sprint 515: Governance — SLT-515 + Audit #61 + Critique 510-514
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 515: Governance", () => {
  describe("SLT-515 meeting doc", () => {
    const src = readFile("docs/meetings/SLT-BACKLOG-515.md");

    it("exists and has correct title", () => {
      expect(src).toContain("SLT Backlog Meeting — Sprint 515");
    });

    it("lists all 4 attendees", () => {
      expect(src).toContain("Marcus Chen");
      expect(src).toContain("Rachel Wei");
      expect(src).toContain("Amir Patel");
      expect(src).toContain("Sarah Nakamura");
    });

    it("reviews sprints 511-514", () => {
      expect(src).toContain("Sprint 511");
      expect(src).toContain("Sprint 512");
      expect(src).toContain("Sprint 513");
      expect(src).toContain("Sprint 514");
    });

    it("has roadmap for sprints 516-520", () => {
      expect(src).toContain("516");
      expect(src).toContain("517");
      expect(src).toContain("518");
      expect(src).toContain("519");
      expect(src).toContain("520");
    });
  });

  describe("Arch Audit #61", () => {
    const src = readFile("docs/audits/ARCH-AUDIT-515.md");

    it("exists and has correct title", () => {
      expect(src).toContain("Architectural Audit #61");
    });

    it("has A grade", () => {
      expect(src).toContain("Grade: A");
      expect(src).toContain("61st consecutive");
    });

    it("has zero critical findings", () => {
      expect(src).toContain("Critical (P0) — 0");
    });

    it("has zero high findings", () => {
      expect(src).toContain("High (P1) — 0");
    });

    it("identifies admin/index.tsx as watch file", () => {
      expect(src).toContain("admin/index.tsx");
      expect(src).toContain("Watch files:** 1");
    });

    it("shows 33 DB tables", () => {
      expect(src).toContain("33");
      expect(src).toContain("claim_evidence");
    });

    it("includes current test count", () => {
      expect(src).toContain("9,478");
    });
  });

  describe("Critique request 510-514", () => {
    const src = readFile("docs/critique/inbox/SPRINT-510-514-REQUEST.md");

    it("exists and covers correct sprints", () => {
      expect(src).toContain("Sprints 510–514");
    });

    it("describes all 5 sprints", () => {
      expect(src).toContain("Sprint 510");
      expect(src).toContain("Sprint 511");
      expect(src).toContain("Sprint 512");
      expect(src).toContain("Sprint 513");
      expect(src).toContain("Sprint 514");
    });

    it("has questions for critique", () => {
      expect(src).toContain("Questions for Critique");
    });

    it("includes current metrics", () => {
      expect(src).toContain("9,478 tests");
      expect(src).toContain("676.7kb");
    });
  });

  describe("Sprint 511-514 deliverables verified", () => {
    it("push A/B wired to triggers", () => {
      const src = readFile("server/notification-triggers.ts");
      expect(src).toContain("getNotificationVariant");
    });

    it("push experiments card exists", () => {
      const src = readFile("components/admin/PushExperimentsCard.tsx");
      expect(src).toContain("export function PushExperimentsCard");
    });

    it("claim evidence table in schema", () => {
      const src = readFile("shared/schema.ts");
      expect(src).toContain("claimEvidence = pgTable");
    });

    it("10 notification preference toggles", () => {
      // Sprint 537: notification toggles extracted to NotificationSettings
      const src = readFile("components/settings/NotificationSettings.tsx");
      const toggleCount = (src.match(/onToggle={toggleNotif\(/g) || []).length;
      expect(toggleCount).toBe(10);
    });

    it("server build stays under 750kb", () => {
      // Sprint 616: ceiling raised to 750kb
      const buildSrc = readFile("server_dist/index.js");
      const sizeKb = buildSrc.length / 1024;
      expect(sizeKb).toBeLessThan(750);
    });
  });
});
