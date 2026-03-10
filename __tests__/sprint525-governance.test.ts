/**
 * Sprint 525: Governance — SLT-525 + Audit #63 + Critique 520-524
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 525: Governance", () => {
  describe("SLT-525 Meeting", () => {
    const src = readFile("docs/meetings/SLT-BACKLOG-525.md");

    it("has correct header", () => {
      expect(src).toContain("SLT Backlog Meeting — Sprint 525");
    });

    it("lists all 4 attendees", () => {
      expect(src).toContain("Marcus Chen (CTO)");
      expect(src).toContain("Rachel Wei (CFO)");
      expect(src).toContain("Amir Patel (Architecture)");
      expect(src).toContain("Sarah Nakamura (Lead Eng)");
    });

    it("reviews Sprints 521-524", () => {
      expect(src).toContain("521");
      expect(src).toContain("522");
      expect(src).toContain("523");
      expect(src).toContain("524");
    });

    it("has current metrics", () => {
      expect(src).toContain("9,715");
      expect(src).toContain("413 files");
      expect(src).toContain("687.4kb");
    });

    it("has roadmap for Sprints 526-530", () => {
      expect(src).toContain("526");
      expect(src).toContain("527");
      expect(src).toContain("528");
      expect(src).toContain("529");
      expect(src).toContain("530");
    });

    it("includes key decisions", () => {
      expect(src).toContain("Key Decisions");
      expect(src).toContain("admin/index.tsx extraction");
      expect(src).toContain("search.tsx modularization");
    });

    it("includes team notes from all 4 members", () => {
      expect(src).toContain("**Marcus Chen:**");
      expect(src).toContain("**Rachel Wei:**");
      expect(src).toContain("**Amir Patel:**");
      expect(src).toContain("**Sarah Nakamura:**");
    });
  });

  describe("Arch Audit #63", () => {
    const src = readFile("docs/audits/ARCH-AUDIT-525.md");

    it("has correct header", () => {
      expect(src).toContain("Architectural Audit #63 — Sprint 525");
    });

    it("has grade A with consecutive count", () => {
      expect(src).toContain("Grade: A (63rd consecutive A-range)");
    });

    it("has 0 critical and 0 high findings", () => {
      expect(src).toContain("Critical: 0");
      expect(src).toContain("High: 0");
    });

    it("has 1 medium finding for admin/index.tsx", () => {
      expect(src).toContain("Medium: 1");
      expect(src).toContain("admin/index.tsx approaching threshold");
      expect(src).toContain("622/650");
    });

    it("has file health matrix", () => {
      expect(src).toContain("File Health Matrix");
      expect(src).toContain("lib/api.ts");
      expect(src).toContain("lib/api-admin.ts");
      expect(src).toContain("app/admin/index.tsx");
    });

    it("resolves api.ts watch file from Audit #62", () => {
      expect(src).toContain("Resolved from Audit #62");
      expect(src).toContain("api.ts at 766/800 LOC");
      expect(src).toContain("766→625");
    });

    it("includes Sprint 521-524 metrics", () => {
      expect(src).toContain("9,715");
      expect(src).toContain("413 files");
      expect(src).toContain("80 (13 + 23 + 20 + 24)");
    });

    it("has grade justification", () => {
      expect(src).toContain("Grade Justification");
      expect(src).toContain("admin/index.tsx watch file");
    });
  });

  describe("Critique Request 520-524", () => {
    const src = readFile("docs/critique/inbox/SPRINT-520-524-REQUEST.md");

    it("has correct header", () => {
      expect(src).toContain("Critique Request: Sprints 520-524");
    });

    it("covers Sprints 520-524", () => {
      expect(src).toContain("520");
      expect(src).toContain("521");
      expect(src).toContain("522");
      expect(src).toContain("523");
      expect(src).toContain("524");
    });

    it("has current metrics", () => {
      expect(src).toContain("9,715 tests");
      expect(src).toContain("413 files");
      expect(src).toContain("63 consecutive A-range");
    });

    it("has 5 questions for external watcher", () => {
      const questions = src.match(/\d+\.\s+\*\*/g);
      expect(questions).not.toBeNull();
      expect(questions!.length).toBe(5);
    });

    it("asks about admin UI growth pattern", () => {
      expect(src).toContain("admin/index.tsx");
      expect(src).toContain("585→618→622");
    });

    it("asks about re-export pattern", () => {
      expect(src).toContain("re-exports");
      expect(src).toContain("backward compatibility");
    });

    it("asks about codebase health sprint block", () => {
      expect(src).toContain("526-529");
      expect(src).toContain("zero feature work");
    });
  });
});
