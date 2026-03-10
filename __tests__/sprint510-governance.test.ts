/**
 * Sprint 510: Governance — SLT-510 + Audit #60 + Critique 506-509
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 510: Governance", () => {
  describe("SLT-510 meeting doc", () => {
    const src = readFile("docs/meetings/SLT-BACKLOG-510.md");

    it("exists and has correct title", () => {
      expect(src).toContain("SLT Backlog Meeting — Sprint 510");
    });

    it("lists all 4 attendees", () => {
      expect(src).toContain("Marcus Chen");
      expect(src).toContain("Rachel Wei");
      expect(src).toContain("Amir Patel");
      expect(src).toContain("Sarah Nakamura");
    });

    it("reviews sprints 506-509", () => {
      expect(src).toContain("Sprint 506");
      expect(src).toContain("Sprint 507");
      expect(src).toContain("Sprint 508");
      expect(src).toContain("Sprint 509");
    });

    it("has roadmap for sprints 511-515", () => {
      expect(src).toContain("511");
      expect(src).toContain("512");
      expect(src).toContain("513");
      expect(src).toContain("514");
      expect(src).toContain("515");
    });

    it("has decisions section", () => {
      expect(src).toContain("Decisions");
      expect(src).toContain("APPROVED");
    });
  });

  describe("Arch Audit #60", () => {
    const src = readFile("docs/audits/ARCH-AUDIT-510.md");

    it("exists and has correct title", () => {
      expect(src).toContain("Architectural Audit #60");
    });

    it("has A grade", () => {
      expect(src).toContain("Grade: A");
      expect(src).toContain("60th consecutive");
    });

    it("has zero critical findings", () => {
      expect(src).toContain("Critical (P0) — 0");
    });

    it("has zero high findings", () => {
      expect(src).toContain("High (P1) — 0");
    });

    it("has file health matrix", () => {
      expect(src).toContain("File Health Matrix");
      expect(src).toContain("push-ab-testing.ts");
      expect(src).toContain("ClaimEvidenceCard.tsx");
    });

    it("has zero watch files", () => {
      expect(src).toContain("Watch files:** 0");
    });

    it("includes current test count", () => {
      expect(src).toContain("9,383");
    });
  });

  describe("Critique request 506-509", () => {
    const src = readFile("docs/critique/inbox/SPRINT-506-509-REQUEST.md");

    it("exists and has correct scope", () => {
      expect(src).toContain("Critique Request: Sprints 506–509");
    });

    it("describes all 4 sprints", () => {
      expect(src).toContain("Sprint 506");
      expect(src).toContain("Sprint 507");
      expect(src).toContain("Sprint 508");
      expect(src).toContain("Sprint 509");
    });

    it("has questions for critique", () => {
      expect(src).toContain("Questions for Critique");
    });

    it("includes current metrics", () => {
      expect(src).toContain("9,383 tests");
      expect(src).toContain("670.1kb");
    });
  });

  describe("Sprint 507-509 deliverables exist", () => {
    it("push-ab-testing.ts exists", () => {
      const src = readFile("server/push-ab-testing.ts");
      expect(src).toContain("export function createPushExperiment");
    });

    it("ClaimEvidenceCard.tsx exists", () => {
      const src = readFile("components/admin/ClaimEvidenceCard.tsx");
      expect(src).toContain("export function ClaimEvidenceCard");
    });

    it("analytics has notification events", () => {
      const src = readFile("lib/analytics.ts");
      expect(src).toContain("notification_received");
      expect(src).toContain("notification_dismissed");
      expect(src).toContain("notification_open_reported");
    });

    it("routes-notifications wires push AB outcome", () => {
      const src = readFile("server/routes-notifications.ts");
      expect(src).toContain("recordPushExperimentOpen");
    });

    it("server build stays under 700kb", () => {
      const buildSrc = readFile("server_dist/index.js");
      const sizeKb = buildSrc.length / 1024;
      expect(sizeKb).toBeLessThan(700);
    });
  });
});
