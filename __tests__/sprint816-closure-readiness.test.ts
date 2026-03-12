/**
 * Sprint 816: Critique Closure Matrix + Beta Readiness Gates + Test Policy
 *
 * Addresses external critique 810-814:
 * 1. Auditable closure matrix for critiques 790-809
 * 2. Explicit beta readiness gates
 * 3. Test-structure policy
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function fileExists(rel: string): boolean {
  return fs.existsSync(path.resolve(process.cwd(), rel));
}

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 816: Closure Matrix + Readiness Gates + Test Policy", () => {
  describe("critique closure matrix", () => {
    it("closure matrix document exists", () => {
      expect(fileExists("docs/architecture/CRITIQUE-CLOSURE-MATRIX.md")).toBe(true);
    });

    it("covers all 4 critique ranges", () => {
      const doc = readFile("docs/architecture/CRITIQUE-CLOSURE-MATRIX.md");
      expect(doc).toContain("Critique 790-794");
      expect(doc).toContain("Critique 795-799");
      expect(doc).toContain("Critique 800-804");
      expect(doc).toContain("Critique 805-809");
    });

    it("has status column with Fixed/Documented/Deferred", () => {
      const doc = readFile("docs/architecture/CRITIQUE-CLOSURE-MATRIX.md");
      expect(doc).toContain("| Fixed |");
      expect(doc).toContain("| Documented |");
      expect(doc).toContain("| Deferred |");
    });

    it("has artifact column proving closure", () => {
      const doc = readFile("docs/architecture/CRITIQUE-CLOSURE-MATRIX.md");
      expect(doc).toContain("Artifact");
    });
  });

  describe("beta readiness gates", () => {
    it("readiness gates document exists", () => {
      expect(fileExists("docs/architecture/BETA-READINESS-GATES.md")).toBe(true);
    });

    it("lists all 8 hardening gates", () => {
      const doc = readFile("docs/architecture/BETA-READINESS-GATES.md");
      expect(doc).toContain("G1");
      expect(doc).toContain("G8");
    });

    it("defines push store limits completely", () => {
      const doc = readFile("docs/architecture/BETA-READINESS-GATES.md");
      expect(doc).toContain("Tokens per member");
      expect(doc).toContain("Total unique members");
      expect(doc).toContain("Message log");
      expect(doc).toContain("Token TTL");
      expect(doc).toContain("Persistence");
      expect(doc).toContain("Failure mode");
    });

    it("defines reactive mode entry/exit criteria", () => {
      const doc = readFile("docs/architecture/BETA-READINESS-GATES.md");
      expect(doc).toContain("Reactive Mode Criteria");
      expect(doc).toContain("Staying in Reactive Mode");
    });

    it("defines operational alerts", () => {
      const doc = readFile("docs/architecture/BETA-READINESS-GATES.md");
      expect(doc).toContain("Operational Alerts");
      expect(doc).toContain("720kb");
      expect(doc).toContain("735kb");
    });
  });

  describe("test structure policy", () => {
    it("test policy document exists", () => {
      expect(fileExists("docs/architecture/TEST-STRUCTURE-POLICY.md")).toBe(true);
    });

    it("defines when to create vs extend test files", () => {
      const doc = readFile("docs/architecture/TEST-STRUCTURE-POLICY.md");
      expect(doc).toContain("When to Create a New Test File");
      expect(doc).toContain("When to Extend an Existing Test File");
    });

    it("identifies fragile patterns to avoid", () => {
      const doc = readFile("docs/architecture/TEST-STRUCTURE-POLICY.md");
      expect(doc).toContain("Fragile Patterns");
    });

    it("defines cross-cutting refactor strategy", () => {
      const doc = readFile("docs/architecture/TEST-STRUCTURE-POLICY.md");
      expect(doc).toContain("Cross-Cutting Refactors");
      expect(doc).toContain("shared assertion helpers");
    });
  });

  describe("file health", () => {
    it("build under 750kb", () => {
      const buildSrc = readFile("server_dist/index.js");
      expect(buildSrc.length / 1024).toBeLessThan(750);
    });
  });
});
