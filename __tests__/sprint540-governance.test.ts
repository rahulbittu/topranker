/**
 * Sprint 540: Governance — SLT-540 + Audit #66 + Critique 536-539
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 540: Governance", () => {
  describe("SLT-540 Meeting", () => {
    const src = readFile("docs/meetings/SLT-BACKLOG-540.md");

    it("has correct header", () => {
      expect(src).toContain("SLT Backlog Meeting — Sprint 540");
    });

    it("lists all 4 attendees", () => {
      expect(src).toContain("Marcus Chen (CTO)");
      expect(src).toContain("Rachel Wei (CFO)");
      expect(src).toContain("Amir Patel (Architecture)");
      expect(src).toContain("Sarah Nakamura (Lead Eng)");
    });

    it("reviews Sprints 536-539", () => {
      expect(src).toContain("536");
      expect(src).toContain("537");
      expect(src).toContain("538");
      expect(src).toContain("539");
    });

    it("has current metrics", () => {
      expect(src).toContain("10,034");
      expect(src).toContain("428 files");
    });

    it("has roadmap for Sprints 541-545", () => {
      expect(src).toContain("541");
      expect(src).toContain("542");
      expect(src).toContain("543");
      expect(src).toContain("544");
      expect(src).toContain("545");
    });

    it("notes health debt cleared", () => {
      expect(src).toContain("Health debt fully cleared");
    });

    it("includes team notes from all 4 members", () => {
      expect(src).toContain("**Marcus Chen:**");
      expect(src).toContain("**Rachel Wei:**");
      expect(src).toContain("**Amir Patel:**");
      expect(src).toContain("**Sarah Nakamura:**");
    });
  });

  describe("Arch Audit #66", () => {
    const src = readFile("docs/audits/ARCH-AUDIT-540.md");

    it("has correct header", () => {
      expect(src).toContain("Architectural Audit #66 — Sprint 540");
    });

    it("has grade A with consecutive count", () => {
      expect(src).toContain("Grade: A (66th consecutive A-range)");
    });

    it("has 0 critical, high, and medium findings", () => {
      expect(src).toContain("Critical: 0");
      expect(src).toContain("High: 0");
      expect(src).toContain("Medium: 0");
    });

    it("has file health matrix", () => {
      expect(src).toContain("File Health Matrix");
      expect(src).toContain("shared/schema.ts");
      expect(src).toContain("960");
    });

    it("profile.tsx now Healthy (was Watch)", () => {
      expect(src).toContain("446");
      expect(src).toContain("was Watch");
    });

    it("settings.tsx now Healthy (was Monitor)", () => {
      expect(src).toContain("301");
      expect(src).toContain("was Monitor");
    });

    it("tracks new files from sprint cycle", () => {
      expect(src).toContain("ProfileCredibilitySection");
      expect(src).toContain("NotificationSettings");
    });

    it("has grade justification", () => {
      expect(src).toContain("Grade Justification");
    });
  });

  describe("Critique Request 536-539", () => {
    const src = readFile("docs/critique/inbox/SPRINT-536-539-REQUEST.md");

    it("has correct header", () => {
      expect(src).toContain("Critique Request: Sprints 536-539");
    });

    it("covers Sprints 536-539", () => {
      expect(src).toContain("536");
      expect(src).toContain("537");
      expect(src).toContain("538");
      expect(src).toContain("539");
    });

    it("has 5 questions for external watcher", () => {
      const questions = src.match(/\d+\.\s+\*\*/g);
      expect(questions).not.toBeNull();
      expect(questions!.length).toBe(5);
    });

    it("asks about 4-audit deferral process gap", () => {
      expect(src).toContain("4 consecutive");
      expect(src).toContain("process gap");
    });

    it("asks about zero-prop extraction pattern", () => {
      expect(src).toContain("zero-prop");
      expect(src).toContain("hidden coupling");
    });
  });
});
