/**
 * Sprint 403: Rating History Detail View
 *
 * Verifies expandable dimension details, visit type badge,
 * would-return indicator, and "View Business" link in HistoryRow.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ── 1. Expandable detail view ───────────────────────────────────────

describe("Sprint 403 — Expandable detail view", () => {
  const src = readFile("components/profile/HistoryRow.tsx");

  it("has expanded state", () => {
    expect(src).toContain("expanded");
    expect(src).toContain("setExpanded");
  });

  it("toggles expansion on tap", () => {
    expect(src).toContain("handleTap");
    expect(src).toContain("setExpanded(prev => !prev)");
  });

  it("has detail section", () => {
    expect(src).toContain("detailSection");
  });

  it("shows chevron-down when expanded", () => {
    expect(src).toContain("chevron-down");
  });

  it("has expanded row style", () => {
    expect(src).toContain("historyRowExpanded");
  });
});

// ── 2. Visit type badge ─────────────────────────────────────────────

describe("Sprint 403 — Visit type badge", () => {
  const src = readFile("components/profile/HistoryRow.tsx");

  it("has visit type labels", () => {
    expect(src).toContain("VISIT_TYPE_LABELS");
    expect(src).toContain("Dined In");
    expect(src).toContain("Delivery");
    expect(src).toContain("Takeaway");
  });

  it("shows visit type badge", () => {
    expect(src).toContain("visitTypeBadge");
    expect(src).toContain("visitTypeText");
  });
});

// ── 3. Dimension scores ─────────────────────────────────────────────

describe("Sprint 403 — Dimension scores", () => {
  const src = readFile("components/profile/HistoryRow.tsx");

  it("shows dimension boxes for q1, q2, q3", () => {
    expect(src).toContain("dimensionBox");
    expect(src).toContain("dimensionScore");
    expect(src).toContain("dimensionLabel");
  });

  it("has visit-type-specific labels", () => {
    expect(src).toContain("Food");
    expect(src).toContain("Service");
    expect(src).toContain("Packaging");
    expect(src).toContain("Wait Time");
  });

  it("shows all three dimension scores", () => {
    expect(src).toContain("r.q1Score");
    expect(src).toContain("r.q2Score");
    expect(src).toContain("r.q3Score");
  });
});

// ── 4. Would return indicator ───────────────────────────────────────

describe("Sprint 403 — Would return indicator", () => {
  const src = readFile("components/profile/HistoryRow.tsx");

  it("shows would return badge", () => {
    expect(src).toContain("returnBadge");
    expect(src).toContain("Would return");
    expect(src).toContain("Would not return");
  });

  it("has yes/no variants", () => {
    expect(src).toContain("returnYes");
    expect(src).toContain("returnNo");
  });
});

// ── 5. View Business link ───────────────────────────────────────────

describe("Sprint 403 — View Business link", () => {
  const src = readFile("components/profile/HistoryRow.tsx");

  it("has view business button", () => {
    expect(src).toContain("viewBusinessBtn");
    expect(src).toContain("View Business");
  });

  it("navigates to business detail", () => {
    expect(src).toContain('pathname: "/business/[id]"');
    expect(src).toContain("r.businessSlug");
  });
});

// ── 6. Note display ─────────────────────────────────────────────────

describe("Sprint 403 — Note display", () => {
  const src = readFile("components/profile/HistoryRow.tsx");

  it("shows note when present", () => {
    expect(src).toContain("r.note");
    expect(src).toContain("noteText");
  });
});

// ── 7. Existing features preserved ──────────────────────────────────

describe("Sprint 403 — Existing features preserved", () => {
  const src = readFile("components/profile/HistoryRow.tsx");

  it("still has long press for actions", () => {
    expect(src).toContain("handleLongPress");
    expect(src).toContain("onLongPress");
  });

  it("still has edit/delete actions", () => {
    expect(src).toContain("handleEdit");
    expect(src).toContain("handleDelete");
    expect(src).toContain("editBtn");
    expect(src).toContain("deleteBtn");
  });

  it("still shows 48h edit window", () => {
    expect(src).toContain("hoursAgo <= 48");
    expect(src).toContain("expiredLabel");
  });
});
