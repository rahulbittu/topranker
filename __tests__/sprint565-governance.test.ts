/**
 * Sprint 565: Governance — SLT-565 + Arch Audit #71 + Critique Request
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 565: Governance", () => {
  describe("SLT-BACKLOG-565.md", () => {
    const src = readFile("docs/meetings/SLT-BACKLOG-565.md");

    it("has SLT header with sprint 565", () => {
      expect(src).toContain("SLT Backlog Meeting — Sprint 565");
    });

    it("lists all 4 attendees", () => {
      expect(src).toContain("Marcus Chen (CTO)");
      expect(src).toContain("Rachel Wei (CFO)");
      expect(src).toContain("Amir Patel (Architecture)");
      expect(src).toContain("Sarah Nakamura (Lead Eng)");
    });

    it("references previous SLT-560", () => {
      expect(src).toContain("SLT-560");
    });

    it("reviews sprints 561-564", () => {
      expect(src).toContain("561");
      expect(src).toContain("562");
      expect(src).toContain("563");
      expect(src).toContain("564");
    });

    it("includes current metrics", () => {
      expect(src).toContain("10,630");
      expect(src).toContain("454");
      expect(src).toContain("711.4kb");
    });

    it("includes roadmap for sprints 566-570", () => {
      expect(src).toContain("566");
      expect(src).toContain("567");
      expect(src).toContain("568");
      expect(src).toContain("569");
      expect(src).toContain("570");
    });

    it("notes extraction roadmap complete", () => {
      expect(src).toContain("Extraction roadmap complete");
    });

    it("has team notes from all 4 members", () => {
      expect(src).toContain("**Marcus Chen:**");
      expect(src).toContain("**Rachel Wei:**");
      expect(src).toContain("**Amir Patel:**");
      expect(src).toContain("**Sarah Nakamura:**");
    });
  });

  describe("ARCH-AUDIT-565.md", () => {
    const src = readFile("docs/audits/ARCH-AUDIT-565.md");

    it("has audit header with number 71", () => {
      expect(src).toContain("Architectural Audit #71");
    });

    it("has grade A", () => {
      expect(src).toContain("Grade: A");
    });

    it("has 71st consecutive A-range", () => {
      expect(src).toContain("71st consecutive A-range");
    });

    it("has 0 findings at all levels", () => {
      expect(src).toContain("### Critical: 0");
      expect(src).toContain("### High: 0");
      expect(src).toContain("### Medium: 0");
      expect(src).toContain("### Low: 0");
    });

    it("has file health matrix", () => {
      expect(src).toContain("File Health Matrix");
    });

    it("tracks extraction results", () => {
      expect(src).toContain("492");
      expect(src).toContain("550");
      expect(src).toContain("349");
    });

    it("includes test count", () => {
      expect(src).toContain("10,630");
    });

    it("includes grade justification", () => {
      expect(src).toContain("Grade Justification");
    });

    it("notes 299 LOC extracted", () => {
      expect(src).toContain("299");
    });
  });

  describe("SPRINT-561-564-REQUEST.md (Critique)", () => {
    const src = readFile("docs/critique/inbox/SPRINT-561-564-REQUEST.md");

    it("has critique header for sprints 561-564", () => {
      expect(src).toContain("Critique Request: Sprints 561-564");
    });

    it("is submitted by Marcus Chen", () => {
      expect(src).toContain("Marcus Chen (CTO)");
    });

    it("includes sprint summary table", () => {
      expect(src).toContain("| 561 |");
      expect(src).toContain("| 562 |");
      expect(src).toContain("| 563 |");
      expect(src).toContain("| 564 |");
    });

    it("has 5 questions", () => {
      expect(src).toContain("1.");
      expect(src).toContain("2.");
      expect(src).toContain("3.");
      expect(src).toContain("4.");
      expect(src).toContain("5.");
    });

    it("asks about test redirection cost", () => {
      expect(src).toContain("test redirections");
      expect(src).toContain("maintenance cost");
    });

    it("asks about apiFetch duplication", () => {
      expect(src).toContain("apiFetch");
      expect(src).toContain("duplication");
    });

    it("includes current metrics", () => {
      expect(src).toContain("10,630");
      expect(src).toContain("711.4kb");
    });
  });

  describe("governance document consistency", () => {
    it("SLT and audit agree on test count", () => {
      const slt = readFile("docs/meetings/SLT-BACKLOG-565.md");
      const audit = readFile("docs/audits/ARCH-AUDIT-565.md");
      expect(slt).toContain("10,630");
      expect(audit).toContain("10,630");
    });

    it("SLT and audit agree on server build", () => {
      const slt = readFile("docs/meetings/SLT-BACKLOG-565.md");
      const audit = readFile("docs/audits/ARCH-AUDIT-565.md");
      expect(slt).toContain("711.4kb");
      expect(audit).toContain("711.4kb");
    });

    it("all three docs reference sprint range 561-564", () => {
      const slt = readFile("docs/meetings/SLT-BACKLOG-565.md");
      const audit = readFile("docs/audits/ARCH-AUDIT-565.md");
      const critique = readFile("docs/critique/inbox/SPRINT-561-564-REQUEST.md");
      expect(slt).toContain("561-564");
      expect(audit).toContain("561-564");
      expect(critique).toContain("561-564");
    });
  });
});
