/**
 * Sprint 581: Claim Progress Timeline UI
 *
 * Tests:
 * 1. ClaimProgressTimeline component structure
 * 2. Step generation logic per claim status
 * 3. Visual styling (colors, indicators)
 * 4. Integration with ClaimStatusCard
 * 5. LOC thresholds
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 581: ClaimProgressTimeline Component", () => {
  const src = readFile("components/business/ClaimProgressTimeline.tsx");

  it("exports ClaimProgressTimeline function", () => {
    expect(src).toContain("export function ClaimProgressTimeline");
  });

  it("exports ClaimProgressTimelineProps interface", () => {
    expect(src).toContain("export interface ClaimProgressTimelineProps");
  });

  it("props include claimStatus", () => {
    expect(src).toContain('claimStatus: "pending" | "approved" | "rejected"');
  });

  it("props include verificationMethod, submittedAt, reviewedAt", () => {
    expect(src).toContain("verificationMethod: string");
    expect(src).toContain("submittedAt: string");
    expect(src).toContain("reviewedAt: string | null");
  });

  it("defines TimelineStep interface with label, icon, status, detail", () => {
    expect(src).toContain("interface TimelineStep");
    expect(src).toContain("label: string");
    expect(src).toContain("status: StepStatus");
  });

  it("defines StepStatus type with complete/active/upcoming/failed", () => {
    expect(src).toContain("type StepStatus");
    expect(src).toContain('"complete"');
    expect(src).toContain('"active"');
    expect(src).toContain('"upcoming"');
    expect(src).toContain('"failed"');
  });

  it("generates 4 steps via getSteps function", () => {
    expect(src).toContain("function getSteps");
    expect(src).toContain("Claim Submitted");
    expect(src).toContain("Under Review");
    expect(src).toContain("Verification");
  });

  it("first step is always complete (Claim Submitted)", () => {
    expect(src).toContain('label: "Claim Submitted"');
    expect(src).toContain('status: "complete"');
  });

  it("pending status shows active Under Review step", () => {
    expect(src).toContain('claimStatus === "pending" ? "active"');
  });

  it("approved status shows Ownership Granted step", () => {
    expect(src).toContain("Ownership Granted");
    expect(src).toContain("Dashboard access enabled");
  });

  it("rejected status shows Claim Declined step", () => {
    expect(src).toContain("Claim Declined");
    expect(src).toContain("resubmit with additional evidence");
  });

  it("pending status shows Decision Pending step", () => {
    expect(src).toContain("Decision Pending");
    expect(src).toContain("hourglass-outline");
  });

  it("defines stepColor function for visual states", () => {
    expect(src).toContain("function stepColor");
    expect(src).toContain("#2D8F4E");
    expect(src).toContain("#D44040");
  });

  it("renders vertical line between steps", () => {
    expect(src).toContain("s.line");
    expect(src).toContain("!isLast");
  });

  it("renders circle indicators with icons", () => {
    expect(src).toContain("s.circle");
    expect(src).toContain("Ionicons");
  });

  it("shows verification method in first step detail", () => {
    expect(src).toContain("verificationMethod");
  });

  it("formats dates for timestamps", () => {
    expect(src).toContain("toLocaleDateString");
    expect(src).toContain("month:");
  });

  it("upcoming steps have dimmed label style", () => {
    expect(src).toContain("stepLabelDim");
    expect(src).toContain('status === "upcoming"');
  });

  it("component LOC under 105", () => {
    const lines = src.split("\n").length;
    expect(lines).toBeLessThan(105);
  });
});

describe("Sprint 581: ClaimStatusCard Integration", () => {
  const src = readFile("components/business/ClaimStatusCard.tsx");

  it("imports ClaimProgressTimeline", () => {
    expect(src).toContain("import { ClaimProgressTimeline }");
    expect(src).toContain('from "./ClaimProgressTimeline"');
  });

  it("renders ClaimProgressTimeline with claim props", () => {
    expect(src).toContain("<ClaimProgressTimeline");
    expect(src).toContain("claimStatus={status}");
    expect(src).toContain("verificationMethod={claim.verificationMethod}");
    expect(src).toContain("submittedAt={claim.submittedAt}");
    expect(src).toContain("reviewedAt={claim.reviewedAt}");
  });
});
