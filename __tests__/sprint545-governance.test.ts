/**
 * Sprint 545: Governance — SLT-545 + Arch Audit #67 + Critique Request
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 545: Governance", () => {
  describe("SLT-BACKLOG-545.md", () => {
    const src = readFile("docs/meetings/SLT-BACKLOG-545.md");

    it("has SLT header with sprint 545", () => {
      expect(src).toContain("SLT Backlog Meeting — Sprint 545");
    });

    it("lists all 4 attendees", () => {
      expect(src).toContain("Marcus Chen (CTO)");
      expect(src).toContain("Rachel Wei (CFO)");
      expect(src).toContain("Amir Patel (Architecture)");
      expect(src).toContain("Sarah Nakamura (Lead Eng)");
    });

    it("references previous SLT-540", () => {
      expect(src).toContain("SLT-540");
    });

    it("reviews sprints 541-544", () => {
      expect(src).toContain("541");
      expect(src).toContain("542");
      expect(src).toContain("543");
      expect(src).toContain("544");
    });

    it("includes sprint 541 photo gallery", () => {
      expect(src).toContain("photo gallery");
    });

    it("includes sprint 542 receipt verification", () => {
      expect(src).toContain("receipt verification");
    });

    it("includes sprint 543 city expansion", () => {
      expect(src).toContain("city expansion");
    });

    it("includes sprint 544 search autocomplete", () => {
      expect(src).toContain("autocomplete");
    });

    it("includes current metrics", () => {
      expect(src).toContain("10,175");
      expect(src).toContain("433");
      expect(src).toContain("705.7kb");
    });

    it("includes roadmap for next sprints", () => {
      expect(src).toContain("546");
      expect(src).toContain("547");
      expect(src).toContain("548");
      expect(src).toContain("549");
      expect(src).toContain("550");
    });

    it("includes schema capacity discussion", () => {
      expect(src).toContain("996");
      expect(src).toContain("capacity");
    });

    it("has team notes from all 4 members", () => {
      expect(src).toContain("**Marcus Chen:**");
      expect(src).toContain("**Rachel Wei:**");
      expect(src).toContain("**Amir Patel:**");
      expect(src).toContain("**Sarah Nakamura:**");
    });
  });

  describe("ARCH-AUDIT-545.md", () => {
    const src = readFile("docs/audits/ARCH-AUDIT-545.md");

    it("has audit header with number 67", () => {
      expect(src).toContain("Architectural Audit #67");
    });

    it("has grade A", () => {
      expect(src).toContain("Grade: A");
    });

    it("has 67th consecutive A-range", () => {
      expect(src).toContain("67th consecutive A-range");
    });

    it("references previous audit 66", () => {
      expect(src).toContain("Audit #66");
    });

    it("has 0 critical findings", () => {
      expect(src).toContain("### Critical: 0");
    });

    it("has 0 high findings", () => {
      expect(src).toContain("### High: 0");
    });

    it("has medium findings for schema capacity", () => {
      expect(src).toContain("### Medium: 2");
      expect(src).toContain("996/1000");
    });

    it("has file health matrix", () => {
      expect(src).toContain("File Health Matrix");
      expect(src).toContain("schema.ts");
      expect(src).toContain("search.tsx");
      expect(src).toContain("api.ts");
    });

    it("tracks schema.ts as Watch status", () => {
      expect(src).toContain("Watch");
      expect(src).toContain("99.6%");
    });

    it("includes sprint metrics", () => {
      expect(src).toContain("10,175");
      expect(src).toContain("705.7kb");
      expect(src).toContain("121");
    });

    it("tracks new files from sprints 541-544", () => {
      expect(src).toContain("search-query-tracker.ts");
      expect(src).toContain("receipt-analysis.ts");
      expect(src).toContain("CityExpansionDashboard.tsx");
    });

    it("includes grade justification", () => {
      expect(src).toContain("Grade Justification");
    });
  });

  describe("SPRINT-541-544-REQUEST.md (Critique)", () => {
    const src = readFile("docs/critique/inbox/SPRINT-541-544-REQUEST.md");

    it("has critique request header for sprints 541-544", () => {
      expect(src).toContain("Critique Request: Sprints 541-544");
    });

    it("is submitted by Marcus Chen", () => {
      expect(src).toContain("Marcus Chen (CTO)");
    });

    it("includes sprint summary table", () => {
      expect(src).toContain("| 541 |");
      expect(src).toContain("| 542 |");
      expect(src).toContain("| 543 |");
      expect(src).toContain("| 544 |");
    });

    it("includes current metrics", () => {
      expect(src).toContain("10,175");
      expect(src).toContain("705.7kb");
      expect(src).toContain("67 consecutive");
    });

    it("has 5 questions for external watcher", () => {
      expect(src).toContain("Questions for External Watcher");
      expect(src).toContain("1.");
      expect(src).toContain("2.");
      expect(src).toContain("3.");
      expect(src).toContain("4.");
      expect(src).toContain("5.");
    });

    it("asks about schema compression strategy", () => {
      expect(src).toContain("996/1000");
      expect(src).toContain("compression");
    });

    it("asks about photo approval pipeline bug", () => {
      expect(src).toContain("silently broken");
      expect(src).toContain("approvePhoto");
    });

    it("asks about in-memory query tracker trade-off", () => {
      expect(src).toContain("in-memory");
      expect(src).toContain("server restart");
    });

    it("asks about admin tab growth", () => {
      expect(src).toContain("6th admin tab");
    });

    it("asks about server build growth", () => {
      expect(src).toContain("705.7kb");
      expect(src).toContain("13.2kb");
    });
  });

  describe("governance document consistency", () => {
    it("SLT and audit both reference sprint 541-544", () => {
      const slt = readFile("docs/meetings/SLT-BACKLOG-545.md");
      const audit = readFile("docs/audits/ARCH-AUDIT-545.md");
      expect(slt).toContain("541-544");
      expect(audit).toContain("541-544");
    });

    it("SLT and audit agree on test count", () => {
      const slt = readFile("docs/meetings/SLT-BACKLOG-545.md");
      const audit = readFile("docs/audits/ARCH-AUDIT-545.md");
      expect(slt).toContain("10,175");
      expect(audit).toContain("10,175");
    });

    it("SLT and audit agree on server build size", () => {
      const slt = readFile("docs/meetings/SLT-BACKLOG-545.md");
      const audit = readFile("docs/audits/ARCH-AUDIT-545.md");
      expect(slt).toContain("705.7kb");
      expect(audit).toContain("705.7kb");
    });

    it("critique references same sprint range as SLT", () => {
      const critique = readFile("docs/critique/inbox/SPRINT-541-544-REQUEST.md");
      expect(critique).toContain("541-544");
    });
  });
});
