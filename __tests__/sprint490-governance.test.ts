/**
 * Sprint 490: Governance — SLT-490 + Audit #56 + Critique 487-489
 *
 * Tests:
 * 1. SLT meeting doc exists with correct structure
 * 2. Arch audit doc exists with grade and findings
 * 3. Critique request doc exists with questions
 * 4. File health thresholds validated
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 490: Governance", () => {
  describe("SLT-490 meeting doc", () => {
    const src = readFile("docs/meetings/SLT-BACKLOG-490.md");

    it("exists and has correct header", () => {
      expect(src).toContain("SLT Backlog Meeting — Sprint 490");
    });

    it("includes all 4 SLT attendees", () => {
      expect(src).toContain("Marcus Chen");
      expect(src).toContain("Rachel Wei");
      expect(src).toContain("Amir Patel");
      expect(src).toContain("Sarah Nakamura");
    });

    it("reviews Sprints 486-489", () => {
      expect(src).toContain("Sprint 486");
      expect(src).toContain("Sprint 487");
      expect(src).toContain("Sprint 488");
      expect(src).toContain("Sprint 489");
    });

    it("has roadmap for Sprints 491-495", () => {
      expect(src).toContain("491");
      expect(src).toContain("492");
      expect(src).toContain("493");
      expect(src).toContain("494");
      expect(src).toContain("495");
    });

    it("includes current metrics", () => {
      expect(src).toContain("9,024 tests");
      expect(src).toContain("378 files");
    });
  });

  describe("Arch Audit #56", () => {
    const src = readFile("docs/audits/ARCH-AUDIT-490.md");

    it("exists and has correct header", () => {
      expect(src).toContain("Architectural Audit #56");
    });

    it("has grade A (56th consecutive)", () => {
      expect(src).toContain("Grade: A");
      expect(src).toContain("56th consecutive");
    });

    it("has 0 critical and 0 high findings", () => {
      expect(src).toContain("Critical (P0) — 0");
      expect(src).toContain("High (P1) — 0");
    });

    it("identifies routes.ts as watch file", () => {
      expect(src).toContain("routes.ts at 91.0%");
    });

    it("confirms routes-businesses.ts resolved to healthy", () => {
      expect(src).toContain("routes-businesses.ts");
      expect(src).toContain("71.5%");
      expect(src).toContain("HEALTHY");
    });

    it("has file health matrix", () => {
      expect(src).toContain("File Health Matrix");
    });
  });

  describe("Critique request 487-489", () => {
    const src = readFile("docs/critique/inbox/SPRINT-487-489-REQUEST.md");

    it("exists with correct scope", () => {
      expect(src).toContain("Critique Request: Sprints 487–489");
    });

    it("has questions for external critique", () => {
      expect(src).toContain("Questions for Critique");
    });

    it("covers all 3 sprints", () => {
      expect(src).toContain("Sprint 487");
      expect(src).toContain("Sprint 488");
      expect(src).toContain("Sprint 489");
    });
  });

  describe("file health validation", () => {
    it("routes.ts under 560 LOC", () => {
      const loc = readFile("server/routes.ts").split("\n").length;
      expect(loc).toBeLessThan(560);
    });

    it("routes-businesses.ts under 260 LOC (post-extraction)", () => {
      const loc = readFile("server/routes-businesses.ts").split("\n").length;
      expect(loc).toBeLessThan(260);
    });

    it("notification-triggers.ts under 450 LOC", () => {
      const loc = readFile("server/notification-triggers.ts").split("\n").length;
      expect(loc).toBeLessThan(450);
    });

    it("routes-business-analytics.ts under 150 LOC", () => {
      const loc = readFile("server/routes-business-analytics.ts").split("\n").length;
      expect(loc).toBeLessThan(150);
    });
  });
});
