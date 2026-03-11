/**
 * Sprint 439 — Rate Flow UX Polish: Dimension Tooltips
 *
 * Validates:
 * 1. Dimension tooltip data structure
 * 2. Visit-type-specific tooltip content
 * 3. DimensionTooltip component
 * 4. Rate flow integration
 * 5. File health
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const visitTypeSrc = readFile("components/rate/VisitTypeStep.tsx");
const rateFlowSrc = readFile("app/rate/[id].tsx");
const dimSrc = readFile("components/rate/DimensionScoringStep.tsx");

// ---------------------------------------------------------------------------
// 1. Tooltip data structure
// ---------------------------------------------------------------------------
describe("DimensionTooltipData", () => {
  it("exports DimensionTooltipData interface", () => {
    expect(visitTypeSrc).toContain("export interface DimensionTooltipData");
  });

  it("has label field", () => {
    expect(visitTypeSrc).toContain("label: string");
  });

  it("has description field", () => {
    expect(visitTypeSrc).toContain("description: string");
  });

  it("has weight field", () => {
    expect(visitTypeSrc).toContain("weight: string");
  });

  it("has examples field", () => {
    expect(visitTypeSrc).toContain("examples: string");
  });
});

// ---------------------------------------------------------------------------
// 2. Visit-type-specific tooltips
// ---------------------------------------------------------------------------
describe("getDimensionTooltips", () => {
  it("exports getDimensionTooltips function", () => {
    expect(visitTypeSrc).toContain("export function getDimensionTooltips");
  });

  it("has dine_in tooltips", () => {
    expect(visitTypeSrc).toContain("dine_in:");
  });

  it("has delivery tooltips", () => {
    expect(visitTypeSrc).toContain("delivery:");
  });

  it("has takeaway tooltips", () => {
    expect(visitTypeSrc).toContain("takeaway:");
  });

  // Dine-in weights
  it("dine-in food weight is 50%", () => {
    const dineIn = visitTypeSrc.slice(
      visitTypeSrc.indexOf("dine_in:"),
      visitTypeSrc.indexOf("delivery:")
    );
    expect(dineIn).toContain('weight: "50%"');
  });

  it("dine-in service weight is 25%", () => {
    const dineIn = visitTypeSrc.slice(
      visitTypeSrc.indexOf("dine_in:"),
      visitTypeSrc.indexOf("delivery:")
    );
    expect(dineIn).toContain('weight: "25%"');
  });

  // Delivery weights
  it("delivery food weight is 60%", () => {
    const delivery = visitTypeSrc.slice(
      visitTypeSrc.indexOf("delivery:"),
      visitTypeSrc.indexOf("takeaway:")
    );
    expect(delivery).toContain('weight: "60%"');
  });

  it("delivery packaging weight is 25%", () => {
    const delivery = visitTypeSrc.slice(
      visitTypeSrc.indexOf("delivery:"),
      visitTypeSrc.indexOf("takeaway:")
    );
    expect(delivery).toContain('weight: "25%"');
  });

  // Takeaway weights
  it("takeaway food weight is 65%", () => {
    const takeaway = visitTypeSrc.slice(
      visitTypeSrc.indexOf("takeaway:"),
      visitTypeSrc.indexOf("export function getDimensionTooltips")
    );
    expect(takeaway).toContain('weight: "65%"');
  });

  it("takeaway wait time weight is 20%", () => {
    const takeaway = visitTypeSrc.slice(
      visitTypeSrc.indexOf("takeaway:"),
      visitTypeSrc.indexOf("export function getDimensionTooltips")
    );
    expect(takeaway).toContain('weight: "20%"');
  });

  // Examples
  it("has example questions for biryani", () => {
    expect(visitTypeSrc).toContain("biryani");
  });

  it("has example questions for packaging", () => {
    expect(visitTypeSrc).toContain("spills");
  });
});

// ---------------------------------------------------------------------------
// 3. DimensionTooltip component
// ---------------------------------------------------------------------------
describe("DimensionTooltip component", () => {
  it("exports DimensionTooltip", () => {
    expect(visitTypeSrc).toContain("export function DimensionTooltip");
  });

  it("has visible/onToggle props", () => {
    expect(visitTypeSrc).toContain("visible: boolean");
    expect(visitTypeSrc).toContain("onToggle: () => void");
  });

  it("uses information-circle-outline icon", () => {
    expect(visitTypeSrc).toContain("information-circle-outline");
  });

  it("shows weight in tooltip card", () => {
    expect(visitTypeSrc).toContain("tooltip.weight");
    expect(visitTypeSrc).toContain("tooltipWeight");
  });

  it("shows description text", () => {
    expect(visitTypeSrc).toContain("tooltip.description");
    expect(visitTypeSrc).toContain("tooltipDesc");
  });

  it("shows example questions", () => {
    expect(visitTypeSrc).toContain("tooltip.examples");
    expect(visitTypeSrc).toContain("tooltipExamples");
  });

  it("toggles visibility on press", () => {
    expect(visitTypeSrc).toContain("onToggle");
    expect(visitTypeSrc).toContain("{visible &&");
  });

  it("has amber color when active", () => {
    expect(visitTypeSrc).toContain("visible ? BRAND.colors.amber");
  });
});

// ---------------------------------------------------------------------------
// 4. Rate flow integration
// ---------------------------------------------------------------------------
describe("rate/[id].tsx — tooltip integration", () => {
  it("imports getDimensionTooltips", () => {
    expect(rateFlowSrc).toContain("getDimensionTooltips");
  });

  it("imports DimensionTooltip component", () => {
    expect(rateFlowSrc).toContain("DimensionTooltip");
  });

  it("has activeTooltip state", () => {
    expect(rateFlowSrc).toContain("activeTooltip");
    expect(rateFlowSrc).toContain("setActiveTooltip");
  });

  it("calls getDimensionTooltips with visitType", () => {
    expect(rateFlowSrc).toContain("getDimensionTooltips(visitType)");
  });

  it("renders DimensionTooltip for each dimension", () => {
    expect(dimSrc).toContain("dimensionTooltips[0]");
    expect(dimSrc).toContain("dimensionTooltips[1]");
    expect(dimSrc).toContain("dimensionTooltips[2]");
  });

  it("toggles tooltip on press", () => {
    expect(dimSrc).toContain("activeTooltip === 0 ? null : 0");
    expect(dimSrc).toContain("activeTooltip === 1 ? null : 1");
    expect(dimSrc).toContain("activeTooltip === 2 ? null : 2");
  });

  it("has labelWithTooltip style", () => {
    expect(dimSrc).toContain("labelWithTooltip");
  });
});

// ---------------------------------------------------------------------------
// 5. File health
// ---------------------------------------------------------------------------
describe("file health", () => {
  it("rate/[id].tsx under 700 LOC threshold", () => {
    expect(rateFlowSrc.split("\n").length).toBeLessThan(700);
  });

  it("VisitTypeStep under 250 LOC", () => {
    expect(visitTypeSrc.split("\n").length).toBeLessThan(250);
  });

  it("rate/SubComponents unchanged", () => {
    const subSrc = readFile("components/rate/SubComponents.tsx");
    expect(subSrc.split("\n").length).toBeLessThan(650);
  });
});
