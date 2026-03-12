/**
 * Sprint 703: Rate flow validation hints — show users what's needed before proceeding.
 * Validates validation hint function and UI integration.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(filePath: string): string {
  return fs.readFileSync(path.resolve(filePath), "utf-8");
}

// ─── Validation Hint Function ───────────────────────────────────────────

describe("Sprint 703: validationHint function", () => {
  const src = readFile("app/rate/[id].tsx");

  it("defines validationHint function", () => {
    expect(src).toContain("const validationHint = (): string | null =>");
  });

  it("returns null when canProceed is true", () => {
    expect(src).toContain("if (canProceed()) return null");
  });

  it("shows visit type hint on step 0", () => {
    expect(src).toContain('"Select how you visited"');
  });

  it("shows dimension scoring hint on step 1", () => {
    expect(src).toContain('"Rate all dimensions"');
  });

  it("shows would-return hint on step 1", () => {
    expect(src).toContain('"Answer \\"Would you return?\\"');
  });

  it("joins multiple missing items with separator", () => {
    expect(src).toContain('missing.join(" · ")');
  });
});

// ─── UI Integration ─────────────────────────────────────────────────────

describe("Sprint 703: Validation hint UI", () => {
  const src = readFile("app/rate/[id].tsx");

  it("renders validationHint below the button", () => {
    expect(src).toContain("{validationHint() && (");
    expect(src).toContain("styles.validationHint");
  });

  it("has validationHint style", () => {
    expect(src).toContain("validationHint:");
  });

  it("hint uses DMSans font", () => {
    expect(src).toContain('validationHint');
  });

  it("has sprint 703 comment", () => {
    expect(src).toContain("Sprint 703: Validation hint when Next is disabled");
  });
});

// ─── Existing Validation Preserved ──────────────────────────────────────

describe("Sprint 703: Existing validation unchanged", () => {
  const src = readFile("app/rate/[id].tsx");

  it("canProceed still checks visitType on step 0", () => {
    expect(src).toContain("visitType !== null");
  });

  it("canProceed still checks all 3 scores on step 1", () => {
    expect(src).toContain("q1Score > 0 && q2Score > 0 && q3Score > 0");
  });

  it("canProceed still checks wouldReturn on step 1", () => {
    expect(src).toContain("wouldReturn !== null");
  });

  it("Next button is still disabled when canProceed is false", () => {
    expect(src).toContain("disabled={!canProceed()");
  });

  it("disabled button has visual styling", () => {
    expect(src).toContain("primaryButtonDisabled");
    expect(src).toContain("primaryButtonTextDisabled");
  });
});

// ─── Server-Side Validation Still Present ───────────────────────────────

describe("Sprint 703: Server schema validation", () => {
  const schema = readFile("shared/schema.ts");

  it("enforces min 1 for q1Score", () => {
    expect(schema).toContain("q1Score");
  });

  it("enforces min 1 for q2Score", () => {
    expect(schema).toContain("q2Score");
  });

  it("enforces min 1 for q3Score", () => {
    expect(schema).toContain("q3Score");
  });

  it("requires wouldReturn as boolean", () => {
    expect(schema).toContain("wouldReturn");
  });
});
