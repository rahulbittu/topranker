/**
 * Sprint 520: Governance — SLT-520 + Audit #62 + Critique 515-519
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 520: Governance", () => {
  describe("SLT-520 Meeting", () => {
    const src = readFile("docs/meetings/SLT-BACKLOG-520.md");

    it("has correct header", () => {
      expect(src).toContain("SLT Backlog Meeting — Sprint 520");
    });

    it("lists all 4 attendees", () => {
      expect(src).toContain("Marcus Chen (CTO)");
      expect(src).toContain("Rachel Wei (CFO)");
      expect(src).toContain("Amir Patel (Architecture)");
      expect(src).toContain("Sarah Nakamura (Lead Eng)");
    });

    it("reviews sprints 516-519", () => {
      expect(src).toContain("Sprint 516");
      expect(src).toContain("Sprint 517");
      expect(src).toContain("Sprint 518");
      expect(src).toContain("Sprint 519");
    });

    it("has current metrics table", () => {
      expect(src).toContain("9,614 across 408 files");
      expect(src).toContain("685.4kb");
    });

    it("has 521-525 roadmap", () => {
      expect(src).toContain("521");
      expect(src).toContain("522");
      expect(src).toContain("523");
      expect(src).toContain("524");
      expect(src).toContain("525");
    });

    it("has decisions section", () => {
      expect(src).toContain("APPROVED");
    });

    it("has all 4 leader notes", () => {
      expect(src).toContain("CTO Notes");
      expect(src).toContain("CFO Notes");
      expect(src).toContain("Architecture Notes");
      expect(src).toContain("Lead Eng Notes");
    });
  });

  describe("Architectural Audit #62", () => {
    const src = readFile("docs/audits/ARCH-AUDIT-520.md");

    it("has correct header and grade", () => {
      expect(src).toContain("Architectural Audit #62");
      expect(src).toContain("62nd consecutive A-range");
    });

    it("has zero critical and high findings", () => {
      expect(src).toContain("Critical (P0) — 0");
      expect(src).toContain("High (P1) — 0");
    });

    it("has medium finding for api.ts LOC", () => {
      expect(src).toContain("api.ts at 766 LOC");
    });

    it("has file health matrix", () => {
      expect(src).toContain("File Health Matrix");
      expect(src).toContain("lib/api.ts");
      expect(src).toContain("WATCH");
    });

    it("shows admin/index.tsx resolved", () => {
      expect(src).toContain("RESOLVED");
      expect(src).toContain("585");
    });

    it("has metrics table with deltas from Audit #61", () => {
      expect(src).toContain("Δ from Audit #61");
      expect(src).toContain("9,614");
      expect(src).toContain("+136");
    });

    it("has grade justification", () => {
      expect(src).toContain("Grade Justification");
      expect(src).toContain("Grade A");
    });
  });

  describe("Critique Request 515-519", () => {
    const src = readFile("docs/critique/inbox/SPRINT-515-519-REQUEST.md");

    it("has correct header", () => {
      expect(src).toContain("External Critique Request — Sprints 515-519");
    });

    it("covers all 5 sprints", () => {
      expect(src).toContain("Sprint 515");
      expect(src).toContain("Sprint 516");
      expect(src).toContain("Sprint 517");
      expect(src).toContain("Sprint 518");
      expect(src).toContain("Sprint 519");
    });

    it("has metrics comparison table", () => {
      expect(src).toContain("9,478");
      expect(src).toContain("9,614");
    });

    it("has questions for the watcher", () => {
      expect(src).toContain("Questions for the Watcher");
    });

    it("asks about notification system scope", () => {
      expect(src).toContain("notification subsystem proportionate");
    });

    it("asks about in-memory stores", () => {
      expect(src).toContain("in-memory Maps");
    });

    it("asks about api.ts growth", () => {
      expect(src).toContain("api.ts at 766 LOC");
    });
  });
});
