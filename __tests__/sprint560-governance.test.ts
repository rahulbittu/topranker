/**
 * Sprint 560: Governance — SLT-560 + Arch Audit #70 + Critique Request
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 560: Governance", () => {
  describe("SLT-BACKLOG-560.md", () => {
    const src = readFile("docs/meetings/SLT-BACKLOG-560.md");

    it("has SLT header with sprint 560", () => {
      expect(src).toContain("SLT Backlog Meeting — Sprint 560");
    });

    it("lists all 4 attendees", () => {
      expect(src).toContain("Marcus Chen (CTO)");
      expect(src).toContain("Rachel Wei (CFO)");
      expect(src).toContain("Amir Patel (Architecture)");
      expect(src).toContain("Sarah Nakamura (Lead Eng)");
    });

    it("references previous SLT-555", () => {
      expect(src).toContain("SLT-555");
    });

    it("reviews sprints 556-559", () => {
      expect(src).toContain("556");
      expect(src).toContain("557");
      expect(src).toContain("558");
      expect(src).toContain("559");
    });

    it("includes current metrics", () => {
      expect(src).toContain("10,507");
      expect(src).toContain("449");
      expect(src).toContain("711.4kb");
    });

    it("includes roadmap for sprints 561-565", () => {
      expect(src).toContain("561");
      expect(src).toContain("562");
      expect(src).toContain("563");
      expect(src).toContain("564");
      expect(src).toContain("565");
    });

    it("notes centralized thresholds success", () => {
      expect(src).toContain("thresholds.json");
    });

    it("has team notes from all 4 members", () => {
      expect(src).toContain("**Marcus Chen:**");
      expect(src).toContain("**Rachel Wei:**");
      expect(src).toContain("**Amir Patel:**");
      expect(src).toContain("**Sarah Nakamura:**");
    });
  });

  describe("ARCH-AUDIT-560.md", () => {
    const src = readFile("docs/audits/ARCH-AUDIT-560.md");

    it("has audit header with number 70", () => {
      expect(src).toContain("Architectural Audit #70");
    });

    it("has grade A", () => {
      expect(src).toContain("Grade: A");
    });

    it("has 70th consecutive A-range", () => {
      expect(src).toContain("70th consecutive A-range");
    });

    it("has 0 critical, 0 high, 0 medium", () => {
      expect(src).toContain("### Critical: 0");
      expect(src).toContain("### High: 0");
      expect(src).toContain("### Medium: 0");
    });

    it("has file health matrix", () => {
      expect(src).toContain("File Health Matrix");
    });

    it("notes redirect reduction (17→2)", () => {
      expect(src).toContain("17");
      expect(src).toContain("2 test threshold");
    });

    it("includes test count", () => {
      expect(src).toContain("10,507");
    });

    it("includes grade justification", () => {
      expect(src).toContain("Grade Justification");
    });
  });

  describe("SPRINT-556-559-REQUEST.md (Critique)", () => {
    const src = readFile("docs/critique/inbox/SPRINT-556-559-REQUEST.md");

    it("has critique header for sprints 556-559", () => {
      expect(src).toContain("Critique Request: Sprints 556-559");
    });

    it("is submitted by Marcus Chen", () => {
      expect(src).toContain("Marcus Chen (CTO)");
    });

    it("includes sprint summary table", () => {
      expect(src).toContain("| 556 |");
      expect(src).toContain("| 557 |");
      expect(src).toContain("| 558 |");
      expect(src).toContain("| 559 |");
    });

    it("has 5 questions", () => {
      expect(src).toContain("1.");
      expect(src).toContain("2.");
      expect(src).toContain("3.");
      expect(src).toContain("4.");
      expect(src).toContain("5.");
    });

    it("asks about useEffect vs inline initialization", () => {
      expect(src).toContain("useEffect");
      expect(src).toContain("initialized");
    });

    it("asks about extraction-heavy roadmap balance", () => {
      expect(src).toContain("extraction");
      expect(src).toContain("business metrics");
    });

    it("includes current metrics", () => {
      expect(src).toContain("10,507");
      expect(src).toContain("711.4kb");
    });
  });

  describe("governance document consistency", () => {
    it("SLT and audit agree on test count", () => {
      const slt = readFile("docs/meetings/SLT-BACKLOG-560.md");
      const audit = readFile("docs/audits/ARCH-AUDIT-560.md");
      expect(slt).toContain("10,507");
      expect(audit).toContain("10,507");
    });

    it("SLT and audit agree on server build", () => {
      const slt = readFile("docs/meetings/SLT-BACKLOG-560.md");
      const audit = readFile("docs/audits/ARCH-AUDIT-560.md");
      expect(slt).toContain("711.4kb");
      expect(audit).toContain("711.4kb");
    });

    it("all three docs reference sprint range 556-559", () => {
      const slt = readFile("docs/meetings/SLT-BACKLOG-560.md");
      const audit = readFile("docs/audits/ARCH-AUDIT-560.md");
      const critique = readFile("docs/critique/inbox/SPRINT-556-559-REQUEST.md");
      expect(slt).toContain("556-559");
      expect(audit).toContain("556-559");
      expect(critique).toContain("556-559");
    });
  });
});
