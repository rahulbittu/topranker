/**
 * Sprint 595: Governance — SLT-595 + Audit #595 + Critique
 *
 * Tests:
 * 1. Governance artifacts exist
 * 2. Threshold recalibration
 * 3. Sprint 591-594 deliverables verified
 * 4. Build and test thresholds
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");
const fileExists = (relPath: string) =>
  fs.existsSync(path.join(ROOT, relPath));

describe("Sprint 595: Governance Artifacts", () => {
  it("SLT-595 meeting doc exists", () => {
    expect(fileExists("docs/meetings/SLT-BACKLOG-595.md")).toBe(true);
  });

  it("Architectural Audit #595 exists", () => {
    expect(fileExists("docs/audits/ARCH-AUDIT-595.md")).toBe(true);
  });

  it("Critique request for 591-594 exists", () => {
    expect(fileExists("docs/critique/inbox/SPRINT-591-594-REQUEST.md")).toBe(true);
  });

  it("SLT-595 contains Sprint 596-600 roadmap", () => {
    const slt = readFile("docs/meetings/SLT-BACKLOG-595.md");
    expect(slt).toContain("596");
    expect(slt).toContain("597");
    expect(slt).toContain("598");
    expect(slt).toContain("599");
    expect(slt).toContain("600");
  });

  it("Audit #595 grade is A", () => {
    const audit = readFile("docs/audits/ARCH-AUDIT-595.md");
    expect(audit).toContain("Grade: A");
  });

  it("Critique request has 5 questions", () => {
    const critique = readFile("docs/critique/inbox/SPRINT-591-594-REQUEST.md");
    expect(critique).toContain("### 1.");
    expect(critique).toContain("### 2.");
    expect(critique).toContain("### 3.");
    expect(critique).toContain("### 4.");
    expect(critique).toContain("### 5.");
  });
});

describe("Sprint 595: Threshold Recalibration", () => {
  const thresholds = JSON.parse(readFile("shared/thresholds.json"));

  it("has 28 tracked files", () => {
    expect(Object.keys(thresholds.files).length).toBe(28);
  });

  it("schema.ts ceiling raised to 960", () => {
    expect(thresholds.files["shared/schema.ts"].maxLOC).toBe(960);
  });

  it("no threshold violations", () => {
    for (const [filePath, config] of Object.entries(thresholds.files)) {
      const { maxLOC } = config as { maxLOC: number };
      const loc = fs.readFileSync(path.join(ROOT, filePath), "utf-8").split("\n").length;
      expect(loc).toBeLessThan(maxLOC);
    }
  });
});

describe("Sprint 595: Sprint 591-594 Deliverables Verified", () => {
  it("ModerationItemCard extracted (Sprint 594)", () => {
    expect(fileExists("components/admin/ModerationItemCard.tsx")).toBe(true);
  });

  it("moderation.tsx uses extracted card", () => {
    const src = readFile("app/admin/moderation.tsx");
    expect(src).toContain("ModerationItemCard");
  });

  it("server has no debug endpoints", () => {
    const src = readFile("server/index.ts");
    expect(src).not.toContain("/api/debug-dist");
    expect(src).not.toContain("/api/debug-query");
  });

  it("railway.toml is clean", () => {
    const toml = readFile("railway.toml");
    expect(toml).not.toContain("echo");
    expect(toml).toContain("server:build");
  });

  it("server build under 750kb", () => {
    const buildSrc = readFile("server_dist/index.js");
    const sizeKb = buildSrc.length / 1024;
    expect(sizeKb).toBeLessThan(750);
  });
});

describe("Sprint 595: External Critique Response Incorporated", () => {
  const slt = readFile("docs/meetings/SLT-BACKLOG-595.md");

  it("addresses pHash naming", () => {
    expect(slt).toContain("average hash");
  });

  it("addresses build ceiling", () => {
    expect(slt).toContain("750kb");
  });

  it("addresses test churn", () => {
    expect(slt).toContain("test helper");
  });
});
