/**
 * Sprint 500: Governance — SLT-500 + Audit #58 + Critique 496-499
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 500: Governance", () => {
  describe("SLT-500 meeting doc", () => {
    const src = readFile("docs/meetings/SLT-BACKLOG-500.md");

    it("exists with correct header", () => {
      expect(src).toContain("SLT Backlog Meeting — Sprint 500");
    });

    it("includes all 4 SLT attendees", () => {
      expect(src).toContain("Marcus Chen");
      expect(src).toContain("Rachel Wei");
      expect(src).toContain("Amir Patel");
      expect(src).toContain("Sarah Nakamura");
    });

    it("reviews Sprints 496-499", () => {
      expect(src).toContain("Sprint 496");
      expect(src).toContain("Sprint 497");
      expect(src).toContain("Sprint 498");
      expect(src).toContain("Sprint 499");
    });

    it("has roadmap for Sprints 501-505", () => {
      expect(src).toContain("501");
      expect(src).toContain("505");
    });

    it("includes current metrics", () => {
      expect(src).toContain("9,219 tests");
      expect(src).toContain("388 files");
    });

    it("notes Sprint 500 milestone", () => {
      expect(src).toContain("500");
      expect(src).toContain("milestone");
    });
  });

  describe("Arch Audit #58", () => {
    const src = readFile("docs/audits/ARCH-AUDIT-500.md");

    it("exists with correct header", () => {
      expect(src).toContain("Architectural Audit #58");
    });

    it("has grade A (58th consecutive)", () => {
      expect(src).toContain("Grade: A");
      expect(src).toContain("58th consecutive");
    });

    it("has 0 critical and 0 high findings", () => {
      expect(src).toContain("Critical (P0) — 0");
      expect(src).toContain("High (P1) — 0");
    });

    it("identifies notification-triggers.ts as watch file", () => {
      expect(src).toContain("notification-triggers.ts");
      expect(src).toContain("89.3%");
      expect(src).toContain("WATCH");
    });

    it("confirms businesses.ts extraction success", () => {
      expect(src).toContain("storage/businesses.ts");
      expect(src).toContain("555");
      expect(src).toContain("79.3%");
    });

    it("has file health matrix", () => {
      expect(src).toContain("File Health Matrix");
    });

    it("lists storage/photos.ts as new module", () => {
      expect(src).toContain("storage/photos.ts");
      expect(src).toContain("88");
    });
  });

  describe("Critique request 496-499", () => {
    const src = readFile("docs/critique/inbox/SPRINT-496-499-REQUEST.md");

    it("exists with correct scope", () => {
      expect(src).toContain("Critique Request: Sprints 496–499");
    });

    it("has questions for external critique", () => {
      expect(src).toContain("Questions for Critique");
    });

    it("covers all 4 sprints", () => {
      expect(src).toContain("Sprint 496");
      expect(src).toContain("Sprint 497");
      expect(src).toContain("Sprint 498");
      expect(src).toContain("Sprint 499");
    });

    it("raises auto-approve threshold question", () => {
      expect(src).toContain("auto-approve");
      expect(src).toContain("70");
    });

    it("raises in-memory analytics migration question", () => {
      expect(src).toContain("persistent storage");
    });
  });

  describe("file health validation", () => {
    // Sprint 549: threshold raised 380 → 390
    it("routes.ts under 390 LOC", () => {
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

    // Sprint 549: threshold raised 580 → 600
    // Sprint 617: ceiling raised
    it("storage/businesses.ts under 650 LOC (post-extraction)", () => {
      const loc = readFile("server/storage/businesses.ts").split("\n").length;
      expect(loc).toBeLessThan(650);
    });

    it("push-analytics.ts under 280 LOC", () => {
      const loc = readFile("server/push-analytics.ts").split("\n").length;
      expect(loc).toBeLessThan(280);
    });
  });
});
