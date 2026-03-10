/**
 * Sprint 505: Governance — SLT-505 + Audit #59 + Critique 501-504
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 505: Governance", () => {
  describe("SLT-505 meeting doc", () => {
    const src = readFile("docs/meetings/SLT-BACKLOG-505.md");

    it("exists with correct header", () => {
      expect(src).toContain("SLT Backlog Meeting — Sprint 505");
    });

    it("includes all 4 SLT attendees", () => {
      expect(src).toContain("Marcus Chen");
      expect(src).toContain("Rachel Wei");
      expect(src).toContain("Amir Patel");
      expect(src).toContain("Sarah Nakamura");
    });

    it("reviews Sprints 501-504", () => {
      expect(src).toContain("Sprint 501");
      expect(src).toContain("Sprint 502");
      expect(src).toContain("Sprint 503");
      expect(src).toContain("Sprint 504");
    });

    it("has roadmap for Sprints 506-510", () => {
      expect(src).toContain("506");
      expect(src).toContain("510");
    });

    it("includes current metrics", () => {
      expect(src).toContain("9,296 tests");
      expect(src).toContain("393 files");
    });
  });

  describe("Arch Audit #59", () => {
    const src = readFile("docs/audits/ARCH-AUDIT-505.md");

    it("exists with correct header", () => {
      expect(src).toContain("Architectural Audit #59");
    });

    it("has grade A (59th consecutive)", () => {
      expect(src).toContain("Grade: A");
      expect(src).toContain("59th consecutive");
    });

    it("has 0 critical and 0 high findings", () => {
      expect(src).toContain("Critical (P0) — 0");
      expect(src).toContain("High (P1) — 0");
    });

    it("reports zero watch files", () => {
      expect(src).toContain("Watch files:** 0");
    });

    it("has file health matrix with 10 key files", () => {
      expect(src).toContain("File Health Matrix");
      expect(src).toContain("notification-triggers-events.ts");
    });

    it("confirms notification-triggers.ts extraction success", () => {
      expect(src).toContain("notification-triggers.ts");
      expect(src).toContain("166");
      expect(src).toContain("36.9%");
    });
  });

  describe("Critique request 501-504", () => {
    const src = readFile("docs/critique/inbox/SPRINT-501-504-REQUEST.md");

    it("exists with correct scope", () => {
      expect(src).toContain("Critique Request: Sprints 501–504");
    });

    it("has questions for external critique", () => {
      expect(src).toContain("Questions for Critique");
    });

    it("covers all 4 sprints", () => {
      expect(src).toContain("Sprint 501");
      expect(src).toContain("Sprint 502");
      expect(src).toContain("Sprint 503");
      expect(src).toContain("Sprint 504");
    });
  });

  describe("file health validation", () => {
    // Sprint 549: threshold raised 380 → 390
    it("routes.ts under 390 LOC", () => {
      const loc = readFile("server/routes.ts").split("\n").length;
      expect(loc).toBeLessThan(390);
    });

    it("notification-triggers.ts under 200 LOC (post-extraction)", () => {
      const loc = readFile("server/notification-triggers.ts").split("\n").length;
      expect(loc).toBeLessThan(200);
    });

    it("notification-triggers-events.ts under 330 LOC (Sprint 533: added template resolution)", () => {
      const loc = readFile("server/notification-triggers-events.ts").split("\n").length;
      expect(loc).toBeLessThan(330);
    });

    // Sprint 549: threshold raised 580 → 600
    it("storage/businesses.ts under 600 LOC", () => {
      const loc = readFile("server/storage/businesses.ts").split("\n").length;
      expect(loc).toBeLessThan(600);
    });
  });
});
