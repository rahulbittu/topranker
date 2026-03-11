/**
 * Sprint 561: HoursEditor extraction from dashboard.tsx
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 561: HoursEditor Extraction", () => {
  describe("extracted component — HoursEditor.tsx", () => {
    const src = readFile("components/dashboard/HoursEditor.tsx");

    it("exists as standalone component", () => {
      expect(src).toBeDefined();
      expect(src.length).toBeGreaterThan(0);
    });

    it("exports HoursEditor function", () => {
      expect(src).toContain("export function HoursEditor");
    });

    it("accepts businessId and delay props", () => {
      expect(src).toContain("businessId: string");
      expect(src).toContain("delay: number");
    });

    it("has DAY_NAMES constant with all 7 days", () => {
      expect(src).toContain("DAY_NAMES");
      expect(src).toContain("Sunday");
      expect(src).toContain("Monday");
      expect(src).toContain("Saturday");
    });

    it("uses useQuery for existing hours fetch", () => {
      expect(src).toContain("useQuery");
      expect(src).toContain('"business-hours"');
      expect(src).toContain("staleTime: 300000");
    });

    it("has initialized state for pre-fill", () => {
      expect(src).toContain("initialized");
      expect(src).toContain("setInitialized");
    });

    it("uses useMutation for save", () => {
      expect(src).toContain("useMutation");
      expect(src).toContain("updateBusinessHours");
    });

    it("has edit/save toggle with icons", () => {
      expect(src).toContain("editing");
      expect(src).toContain("setEditing");
      expect(src).toContain("checkmark");
      expect(src).toContain("create-outline");
    });

    it("renders TextInput for each day in edit mode", () => {
      expect(src).toContain("TextInput");
      expect(src).toContain("hoursInput");
      expect(src).toContain("DAY_NAMES.map");
    });

    it("has cancel button", () => {
      expect(src).toContain("Cancel");
      expect(src).toContain("hoursCancelBtn");
    });

    it("shows success alert", () => {
      expect(src).toContain("Hours Updated");
    });

    it("invalidates dashboard query on success", () => {
      expect(src).toContain("invalidateQueries");
    });

    it("has hours source indicator", () => {
      expect(src).toContain("From your listing");
      expect(src).toContain("Default hours");
    });

    it("has self-contained styles", () => {
      expect(src).toContain("StyleSheet.create");
      expect(src).toContain("hoursCard:");
      expect(src).toContain("hoursRow:");
      expect(src).toContain("hoursHeader:");
      expect(src).toContain("hoursTitle:");
    });

    it("is under 130 LOC", () => {
      const loc = src.split("\n").length;
      expect(loc).toBeLessThan(130);
    });
  });

  describe("dashboard.tsx after extraction", () => {
    const src = readFile("app/business/dashboard.tsx");

    it("imports HoursEditor from extracted component", () => {
      expect(src).toContain('import { HoursEditor } from "@/components/dashboard/HoursEditor"');
    });

    it("no longer defines HoursEditor inline", () => {
      expect(src).not.toContain("function HoursEditor");
    });

    it("no longer has DAY_NAMES constant", () => {
      expect(src).not.toContain("DAY_NAMES");
    });

    it("no longer has hours-specific styles", () => {
      expect(src).not.toContain("hoursCard:");
      expect(src).not.toContain("hoursRow:");
      expect(src).not.toContain("hoursCancelBtn:");
    });

    it("no longer imports useMutation or useQueryClient", () => {
      expect(src).not.toContain("useMutation");
      expect(src).not.toContain("useQueryClient");
    });

    it("no longer imports TextInput or Alert", () => {
      expect(src).not.toContain("TextInput");
      expect(src).not.toContain("Alert,");
    });

    it("still renders HoursEditor in overview tab", () => {
      expect(src).toContain("<HoursEditor");
      expect(src).toContain("businessId={slug}");
    });

    it("dropped from 592 to under 510 LOC", () => {
      const loc = src.split("\n").length;
      expect(loc).toBeLessThan(510);
      expect(loc).toBeGreaterThan(450);
    });
  });

  describe("thresholds.json updated", () => {
    const thresholds = JSON.parse(readFile("shared/thresholds.json"));

    it("dashboard.tsx threshold exists", () => {
      const entry = thresholds.files["app/business/dashboard.tsx"];
      expect(entry.maxLOC).toBeLessThanOrEqual(520);
    });

    it("HoursEditor.tsx tracked", () => {
      const entry = thresholds.files["components/dashboard/HoursEditor.tsx"];
      expect(entry).toBeDefined();
      expect(entry.maxLOC).toBeLessThanOrEqual(130);
    });
  });
});
