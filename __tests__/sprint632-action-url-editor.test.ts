/**
 * Sprint 632: Owner dashboard action URL editor
 * Decision-to-Action (Phase 6 — Owner Self-Service)
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf-8");
}

describe("Sprint 632 — Action URL Editor", () => {
  const editorSrc = readFile("components/dashboard/ActionUrlEditor.tsx");
  const dashboardSrc = readFile("app/business/dashboard.tsx");
  const routesSrc = readFile("server/routes-businesses.ts");

  describe("ActionUrlEditor component", () => {
    it("exports ActionUrlEditor", () => {
      expect(editorSrc).toContain("export function ActionUrlEditor");
    });

    it("has 6 ACTION_FIELDS", () => {
      expect(editorSrc).toContain("menuUrl");
      expect(editorSrc).toContain("orderUrl");
      expect(editorSrc).toContain("pickupUrl");
      expect(editorSrc).toContain("doordashUrl");
      expect(editorSrc).toContain("uberEatsUrl");
      expect(editorSrc).toContain("reservationUrl");
    });

    it("has edit/save toggle", () => {
      expect(editorSrc).toContain("setEditing");
      expect(editorSrc).toContain("editing");
    });

    it("renders TextInput for each field", () => {
      expect(editorSrc).toContain("TextInput");
      expect(editorSrc).toContain("keyboardType");
    });

    it("calls PUT /api/businesses/:slug/actions", () => {
      expect(editorSrc).toContain("/api/businesses/");
      expect(editorSrc).toContain("/actions");
      expect(editorSrc).toContain("PUT");
    });

    it("uses useMutation for save", () => {
      expect(editorSrc).toContain("useMutation");
    });

    it("validates URLs start with http", () => {
      expect(editorSrc).toContain('startsWith("http")');
    });

    it("shows filled count badge", () => {
      expect(editorSrc).toContain("filledCount");
      expect(editorSrc).toContain("/6");
    });

    it("shows summary pills when not editing", () => {
      expect(editorSrc).toContain("urlPill");
    });

    it("shows empty state text", () => {
      expect(editorSrc).toContain("No action links set");
    });
  });

  describe("Dashboard integration", () => {
    it("imports ActionUrlEditor", () => {
      expect(dashboardSrc).toContain("ActionUrlEditor");
    });

    it("renders ActionUrlEditor in overview tab", () => {
      expect(dashboardSrc).toContain("<ActionUrlEditor");
    });

    it("passes slug prop", () => {
      expect(dashboardSrc).toContain("slug={slug}");
    });
  });

  describe("API endpoint exists", () => {
    it("has PUT /api/businesses/:slug/actions", () => {
      expect(routesSrc).toContain("/api/businesses/:slug/actions");
    });

    it("validates action URL fields", () => {
      expect(routesSrc).toContain("ACTION_FIELDS");
    });
  });

  describe("File health", () => {
    it("ActionUrlEditor under 170 LOC", () => {
      const loc = editorSrc.split("\n").length;
      expect(loc).toBeLessThan(170);
    });

    it("dashboard under 520 LOC", () => {
      const loc = dashboardSrc.split("\n").length;
      expect(loc).toBeLessThan(520);
    });

    const thresholds = JSON.parse(readFile("shared/thresholds.json"));
    it("build under 750kb", () => {
      expect(thresholds.build.currentSizeKb).toBeLessThan(750);
    });
  });
});
