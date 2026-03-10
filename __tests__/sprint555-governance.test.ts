/**
 * Sprint 555: Governance — SLT-555 + Arch Audit #69 + Critique Request
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 555: Governance", () => {
  describe("SLT-BACKLOG-555.md", () => {
    const src = readFile("docs/meetings/SLT-BACKLOG-555.md");

    it("has SLT header with sprint 555", () => {
      expect(src).toContain("SLT Backlog Meeting — Sprint 555");
    });

    it("lists all 4 attendees", () => {
      expect(src).toContain("Marcus Chen (CTO)");
      expect(src).toContain("Rachel Wei (CFO)");
      expect(src).toContain("Amir Patel (Architecture)");
      expect(src).toContain("Sarah Nakamura (Lead Eng)");
    });

    it("references previous SLT-550", () => {
      expect(src).toContain("SLT-550");
    });

    it("reviews sprints 551-554", () => {
      expect(src).toContain("551");
      expect(src).toContain("552");
      expect(src).toContain("553");
      expect(src).toContain("554");
    });

    it("includes current metrics", () => {
      expect(src).toContain("10,415");
      expect(src).toContain("443");
      expect(src).toContain("708.7kb");
    });

    it("includes roadmap for sprints 556-560", () => {
      expect(src).toContain("556");
      expect(src).toContain("557");
      expect(src).toContain("558");
      expect(src).toContain("559");
      expect(src).toContain("560");
    });

    it("discusses Schema compression success", () => {
      expect(src).toContain("Schema compression");
      expect(src).toContain("935");
    });

    it("has team notes from all 4 members", () => {
      expect(src).toContain("**Marcus Chen:**");
      expect(src).toContain("**Rachel Wei:**");
      expect(src).toContain("**Amir Patel:**");
      expect(src).toContain("**Sarah Nakamura:**");
    });
  });

  describe("ARCH-AUDIT-555.md", () => {
    const src = readFile("docs/audits/ARCH-AUDIT-555.md");

    it("has audit header with number 69", () => {
      expect(src).toContain("Architectural Audit #69");
    });

    it("has grade A", () => {
      expect(src).toContain("Grade: A");
    });

    it("has 69th consecutive A-range", () => {
      expect(src).toContain("69th consecutive A-range");
    });

    it("has 0 critical and 0 high findings", () => {
      expect(src).toContain("### Critical: 0");
      expect(src).toContain("### High: 0");
    });

    it("has 0 medium findings (resolved from #68)", () => {
      expect(src).toContain("### Medium: 0");
    });

    it("has file health matrix", () => {
      expect(src).toContain("File Health Matrix");
    });

    it("tracks schema improvement from 996 to 935", () => {
      expect(src).toContain("996");
      expect(src).toContain("935");
    });

    it("tracks index.tsx improvement from 505 to 443", () => {
      expect(src).toContain("505");
      expect(src).toContain("443");
    });

    it("includes test count", () => {
      expect(src).toContain("10,415");
    });

    it("includes grade justification", () => {
      expect(src).toContain("Grade Justification");
    });
  });

  describe("SPRINT-551-554-REQUEST.md (Critique)", () => {
    const src = readFile("docs/critique/inbox/SPRINT-551-554-REQUEST.md");

    it("has critique header for sprints 551-554", () => {
      expect(src).toContain("Critique Request: Sprints 551-554");
    });

    it("is submitted by Marcus Chen", () => {
      expect(src).toContain("Marcus Chen (CTO)");
    });

    it("includes sprint summary table", () => {
      expect(src).toContain("| 551 |");
      expect(src).toContain("| 552 |");
      expect(src).toContain("| 553 |");
      expect(src).toContain("| 554 |");
    });

    it("has 5 questions for external watcher", () => {
      expect(src).toContain("1.");
      expect(src).toContain("2.");
      expect(src).toContain("3.");
      expect(src).toContain("4.");
      expect(src).toContain("5.");
    });

    it("asks about schema compression readability", () => {
      expect(src).toContain("compression");
      expect(src).toContain("readability");
    });

    it("asks about per-rating modal pattern", () => {
      expect(src).toContain("PhotoCarouselModal");
      expect(src).toContain("per-rating");
    });

    it("includes current metrics", () => {
      expect(src).toContain("10,415");
      expect(src).toContain("708.7kb");
    });
  });

  describe("governance document consistency", () => {
    it("SLT and audit agree on test count", () => {
      const slt = readFile("docs/meetings/SLT-BACKLOG-555.md");
      const audit = readFile("docs/audits/ARCH-AUDIT-555.md");
      expect(slt).toContain("10,415");
      expect(audit).toContain("10,415");
    });

    it("SLT and audit agree on server build", () => {
      const slt = readFile("docs/meetings/SLT-BACKLOG-555.md");
      const audit = readFile("docs/audits/ARCH-AUDIT-555.md");
      expect(slt).toContain("708.7kb");
      expect(audit).toContain("708.7kb");
    });

    it("all three docs reference sprint range 551-554", () => {
      const slt = readFile("docs/meetings/SLT-BACKLOG-555.md");
      const audit = readFile("docs/audits/ARCH-AUDIT-555.md");
      const critique = readFile("docs/critique/inbox/SPRINT-551-554-REQUEST.md");
      expect(slt).toContain("551-554");
      expect(audit).toContain("551-554");
      expect(critique).toContain("551-554");
    });
  });
});
