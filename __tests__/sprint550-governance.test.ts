/**
 * Sprint 550: Governance — SLT-550 + Arch Audit #68 + Critique Request
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 550: Governance", () => {
  describe("SLT-BACKLOG-550.md", () => {
    const src = readFile("docs/meetings/SLT-BACKLOG-550.md");

    it("has SLT header with sprint 550", () => {
      expect(src).toContain("SLT Backlog Meeting — Sprint 550");
    });

    it("lists all 4 attendees", () => {
      expect(src).toContain("Marcus Chen (CTO)");
      expect(src).toContain("Rachel Wei (CFO)");
      expect(src).toContain("Amir Patel (Architecture)");
      expect(src).toContain("Sarah Nakamura (Lead Eng)");
    });

    it("references previous SLT-545", () => {
      expect(src).toContain("SLT-545");
    });

    it("reviews sprints 546-549", () => {
      expect(src).toContain("546");
      expect(src).toContain("547");
      expect(src).toContain("548");
      expect(src).toContain("549");
    });

    it("includes current metrics", () => {
      expect(src).toContain("10,314");
      expect(src).toContain("438");
      expect(src).toContain("707.1kb");
    });

    it("includes roadmap for sprints 551-555", () => {
      expect(src).toContain("551");
      expect(src).toContain("552");
      expect(src).toContain("553");
      expect(src).toContain("554");
      expect(src).toContain("555");
    });

    it("discusses schema compression as P0", () => {
      expect(src).toContain("Schema compression");
      expect(src).toContain("P0");
    });

    it("has team notes from all 4 members", () => {
      expect(src).toContain("**Marcus Chen:**");
      expect(src).toContain("**Rachel Wei:**");
      expect(src).toContain("**Amir Patel:**");
      expect(src).toContain("**Sarah Nakamura:**");
    });
  });

  describe("ARCH-AUDIT-550.md", () => {
    const src = readFile("docs/audits/ARCH-AUDIT-550.md");

    it("has audit header with number 68", () => {
      expect(src).toContain("Architectural Audit #68");
    });

    it("has grade A", () => {
      expect(src).toContain("Grade: A");
    });

    it("has 68th consecutive A-range", () => {
      expect(src).toContain("68th consecutive A-range");
    });

    it("has 0 critical and 0 high findings", () => {
      expect(src).toContain("### Critical: 0");
      expect(src).toContain("### High: 0");
    });

    it("has 1 medium finding for index.tsx growth", () => {
      expect(src).toContain("### Medium: 1");
      expect(src).toContain("index.tsx");
      expect(src).toContain("505");
    });

    it("has file health matrix", () => {
      expect(src).toContain("File Health Matrix");
    });

    it("tracks index.tsx as Monitor", () => {
      expect(src).toContain("Monitor");
    });

    it("includes test count", () => {
      expect(src).toContain("10,314");
    });

    it("includes grade justification", () => {
      expect(src).toContain("Grade Justification");
    });
  });

  describe("SPRINT-546-549-REQUEST.md (Critique)", () => {
    const src = readFile("docs/critique/inbox/SPRINT-546-549-REQUEST.md");

    it("has critique header for sprints 546-549", () => {
      expect(src).toContain("Critique Request: Sprints 546-549");
    });

    it("is submitted by Marcus Chen", () => {
      expect(src).toContain("Marcus Chen (CTO)");
    });

    it("includes sprint summary table", () => {
      expect(src).toContain("| 546 |");
      expect(src).toContain("| 547 |");
      expect(src).toContain("| 548 |");
      expect(src).toContain("| 549 |");
    });

    it("has 5 questions for external watcher", () => {
      expect(src).toContain("1.");
      expect(src).toContain("2.");
      expect(src).toContain("3.");
      expect(src).toContain("4.");
      expect(src).toContain("5.");
    });

    it("asks about test threshold redirections", () => {
      expect(src).toContain("threshold");
      expect(src).toContain("redirections");
    });

    it("asks about share domain gap", () => {
      expect(src).toContain("topranker.app");
      expect(src).toContain("topranker.com");
    });

    it("includes current metrics", () => {
      expect(src).toContain("10,314");
      expect(src).toContain("707.1kb");
    });
  });

  describe("governance document consistency", () => {
    it("SLT and audit agree on test count", () => {
      const slt = readFile("docs/meetings/SLT-BACKLOG-550.md");
      const audit = readFile("docs/audits/ARCH-AUDIT-550.md");
      expect(slt).toContain("10,314");
      expect(audit).toContain("10,314");
    });

    it("SLT and audit agree on server build", () => {
      const slt = readFile("docs/meetings/SLT-BACKLOG-550.md");
      const audit = readFile("docs/audits/ARCH-AUDIT-550.md");
      expect(slt).toContain("707.1kb");
      expect(audit).toContain("707.1kb");
    });

    it("all three docs reference sprint range 546-549", () => {
      const slt = readFile("docs/meetings/SLT-BACKLOG-550.md");
      const audit = readFile("docs/audits/ARCH-AUDIT-550.md");
      const critique = readFile("docs/critique/inbox/SPRINT-546-549-REQUEST.md");
      expect(slt).toContain("546-549");
      expect(audit).toContain("546-549");
      expect(critique).toContain("546-549");
    });
  });
});
