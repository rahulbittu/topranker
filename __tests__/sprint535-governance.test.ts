/**
 * Sprint 535: Governance — SLT-535 + Audit #65 + Critique 530-534
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 535: Governance", () => {
  describe("SLT-535 Meeting", () => {
    const src = readFile("docs/meetings/SLT-BACKLOG-535.md");

    it("has correct header", () => {
      expect(src).toContain("SLT Backlog Meeting — Sprint 535");
    });

    it("lists all 4 attendees", () => {
      expect(src).toContain("Marcus Chen (CTO)");
      expect(src).toContain("Rachel Wei (CFO)");
      expect(src).toContain("Amir Patel (Architecture)");
      expect(src).toContain("Sarah Nakamura (Lead Eng)");
    });

    it("reviews Sprints 531-534", () => {
      expect(src).toContain("531");
      expect(src).toContain("532");
      expect(src).toContain("533");
      expect(src).toContain("534");
    });

    it("has current metrics", () => {
      expect(src).toContain("9,903");
      expect(src).toContain("423 files");
    });

    it("has roadmap for Sprints 536-540", () => {
      expect(src).toContain("536");
      expect(src).toContain("537");
      expect(src).toContain("538");
      expect(src).toContain("539");
      expect(src).toContain("540");
    });

    it("plans profile.tsx extraction", () => {
      expect(src).toContain("profile.tsx");
      expect(src).toContain("628");
    });

    it("includes team notes from all 4 members", () => {
      expect(src).toContain("**Marcus Chen:**");
      expect(src).toContain("**Rachel Wei:**");
      expect(src).toContain("**Amir Patel:**");
      expect(src).toContain("**Sarah Nakamura:**");
    });
  });

  describe("Arch Audit #65", () => {
    const src = readFile("docs/audits/ARCH-AUDIT-535.md");

    it("has correct header", () => {
      expect(src).toContain("Architectural Audit #65 — Sprint 535");
    });

    it("has grade A with consecutive count", () => {
      expect(src).toContain("Grade: A (65th consecutive A-range)");
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

    it("flags profile.tsx as Watch", () => {
      expect(src).toContain("profile.tsx");
      expect(src).toContain("628");
      expect(src).toContain("Watch");
    });

    it("tracks new files from sprint cycle", () => {
      expect(src).toContain("RatingReviewStep");
      expect(src).toContain("DimensionBreakdownCard");
    });

    it("has grade justification", () => {
      expect(src).toContain("Grade Justification");
    });
  });

  describe("Critique Request 530-534", () => {
    const src = readFile("docs/critique/inbox/SPRINT-530-534-REQUEST.md");

    it("has correct header", () => {
      expect(src).toContain("Critique Request: Sprints 530-534");
    });

    it("covers Sprints 530-534", () => {
      expect(src).toContain("530");
      expect(src).toContain("531");
      expect(src).toContain("532");
      expect(src).toContain("533");
      expect(src).toContain("534");
    });

    it("has 5 questions for external watcher", () => {
      const questions = src.match(/\d+\.\s+\*\*/g);
      expect(questions).not.toBeNull();
      expect(questions!.length).toBe(5);
    });

    it("asks about 4-step rating flow friction", () => {
      expect(src).toContain("4-step flow");
      expect(src).toContain("friction");
    });

    it("asks about template system premature infrastructure", () => {
      expect(src).toContain("premature infrastructure");
      expect(src).toContain("hardcoded defaults");
    });
  });
});
