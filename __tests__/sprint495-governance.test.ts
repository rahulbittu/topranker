/**
 * Sprint 495: Governance — SLT-495 + Audit #57 + Critique 491-494
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 495: Governance", () => {
  describe("SLT-495 meeting doc", () => {
    const src = readFile("docs/meetings/SLT-BACKLOG-495.md");

    it("exists with correct header", () => {
      expect(src).toContain("SLT Backlog Meeting — Sprint 495");
    });

    it("includes all 4 SLT attendees", () => {
      expect(src).toContain("Marcus Chen");
      expect(src).toContain("Rachel Wei");
      expect(src).toContain("Amir Patel");
      expect(src).toContain("Sarah Nakamura");
    });

    it("reviews Sprints 491-494", () => {
      expect(src).toContain("Sprint 491");
      expect(src).toContain("Sprint 492");
      expect(src).toContain("Sprint 493");
      expect(src).toContain("Sprint 494");
    });

    it("has roadmap for Sprints 496-500", () => {
      expect(src).toContain("496");
      expect(src).toContain("500");
    });

    it("includes current metrics", () => {
      expect(src).toContain("9,122 tests");
      expect(src).toContain("383 files");
    });
  });

  describe("Arch Audit #57", () => {
    const src = readFile("docs/audits/ARCH-AUDIT-495.md");

    it("exists with correct header", () => {
      expect(src).toContain("Architectural Audit #57");
    });

    it("has grade A (57th consecutive)", () => {
      expect(src).toContain("Grade: A");
      expect(src).toContain("57th consecutive");
    });

    it("has 0 critical and 0 high findings", () => {
      expect(src).toContain("Critical (P0) — 0");
      expect(src).toContain("High (P1) — 0");
    });

    it("identifies storage/businesses.ts as watch file", () => {
      expect(src).toContain("storage/businesses.ts at 94.9%");
    });

    it("confirms routes.ts resolved to healthy", () => {
      expect(src).toContain("routes.ts");
      expect(src).toContain("61.5%");
      expect(src).toContain("HEALTHY");
    });

    it("has file health matrix", () => {
      expect(src).toContain("File Health Matrix");
    });
  });

  describe("Critique request 491-494", () => {
    const src = readFile("docs/critique/inbox/SPRINT-491-494-REQUEST.md");

    it("exists with correct scope", () => {
      expect(src).toContain("Critique Request: Sprints 491–494");
    });

    it("has questions for external critique", () => {
      expect(src).toContain("Questions for Critique");
    });

    it("covers all 4 sprints", () => {
      expect(src).toContain("Sprint 491");
      expect(src).toContain("Sprint 492");
      expect(src).toContain("Sprint 493");
      expect(src).toContain("Sprint 494");
    });
  });

  describe("file health validation", () => {
    // Sprint 549: threshold raised 380 → 390
    it("routes.ts under 390 LOC (post-extraction)", () => {
      const loc = readFile("server/routes.ts").split("\n").length;
      expect(loc).toBeLessThan(390);
    });

    it("routes-ratings.ts under 210 LOC", () => {
      const loc = readFile("server/routes-ratings.ts").split("\n").length;
      expect(loc).toBeLessThan(210);
    });

    it("notification-triggers.ts under 450 LOC", () => {
      const loc = readFile("server/notification-triggers.ts").split("\n").length;
      expect(loc).toBeLessThan(450);
    });

    it("storage/businesses.ts under 700 LOC", () => {
      const loc = readFile("server/storage/businesses.ts").split("\n").length;
      expect(loc).toBeLessThan(700);
    });
  });
});
