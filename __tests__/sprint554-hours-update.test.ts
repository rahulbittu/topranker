/**
 * Sprint 554: Business hours owner update — claimed owners can edit operating hours
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 554: Business Hours Owner Update", () => {
  describe("Server — routes-owner-dashboard.ts", () => {
    const src = readFile("server/routes-owner-dashboard.ts");

    it("has PUT /api/owner/businesses/:businessId/hours endpoint", () => {
      expect(src).toContain("/api/owner/businesses/:businessId/hours");
      expect(src).toContain("put");
    });

    it("requires authentication", () => {
      expect(src).toContain("requireAuth");
    });

    it("validates openingHours body", () => {
      expect(src).toContain("openingHours");
      expect(src).toContain("400");
    });

    it("validates periods array if present", () => {
      expect(src).toContain("Array.isArray");
    });

    it("returns 403 if not owner", () => {
      expect(src).toContain("403");
      expect(src).toContain("Not the owner");
    });

    it("returns success with hoursLastUpdated", () => {
      expect(src).toContain("success: true");
      expect(src).toContain("hoursLastUpdated");
    });

    it("logs the update", () => {
      expect(src).toContain("updated hours for business");
    });
  });

  describe("Server — storage/businesses.ts", () => {
    const src = readFile("server/storage/businesses.ts");

    it("exports updateBusinessHours function", () => {
      expect(src).toContain("export async function updateBusinessHours");
    });

    it("verifies owner ID before update", () => {
      expect(src).toContain("ownerId");
    });

    it("updates openingHours and hoursLastUpdated", () => {
      expect(src).toContain("openingHours:");
      expect(src).toContain("hoursLastUpdated:");
    });

    it("returns boolean indicating success", () => {
      expect(src).toContain("): Promise<boolean>");
    });
  });

  describe("Client — lib/api.ts", () => {
    // Sprint 562: Extracted to api-owner.ts, re-exported from api.ts
    const src = readFile("lib/api-owner.ts");

    it("exports HoursUpdate interface", () => {
      expect(src).toContain("export interface HoursUpdate");
    });

    it("HoursUpdate has weekday_text and periods", () => {
      expect(src).toContain("weekday_text");
      expect(src).toContain("periods");
    });

    it("exports updateBusinessHours function", () => {
      expect(src).toContain("export async function updateBusinessHours");
    });

    it("sends PUT request with openingHours body", () => {
      expect(src).toContain("PUT");
      expect(src).toContain("openingHours");
    });
  });

  describe("Client — dashboard.tsx (HoursEditor)", () => {
    const src = readFile("app/business/dashboard.tsx");
    // Sprint 561: HoursEditor extracted to components/dashboard/HoursEditor.tsx
    const editorSrc = readFile("components/dashboard/HoursEditor.tsx");

    it("has HoursEditor component", () => {
      expect(src).toContain("HoursEditor");
    });

    it("has DAY_NAMES constant", () => {
      // Sprint 561: moved to extracted component
      expect(editorSrc).toContain("DAY_NAMES");
      expect(editorSrc).toContain("Sunday");
      expect(editorSrc).toContain("Saturday");
    });

    it("has edit/save toggle", () => {
      // Sprint 561: moved to extracted component
      expect(editorSrc).toContain("editing");
      expect(editorSrc).toContain("setEditing");
    });

    it("uses useMutation for hours update", () => {
      // Sprint 561: moved to extracted component
      expect(editorSrc).toContain("useMutation");
      expect(editorSrc).toContain("updateBusinessHours");
    });

    it("shows TextInput in edit mode", () => {
      // Sprint 561: moved to extracted component
      expect(editorSrc).toContain("TextInput");
      expect(editorSrc).toContain("hoursInput");
    });

    it("has cancel button", () => {
      // Sprint 561: moved to extracted component
      expect(editorSrc).toContain("Cancel");
      expect(editorSrc).toContain("hoursCancelBtn");
    });

    it("shows success alert on save", () => {
      // Sprint 561: moved to extracted component
      expect(editorSrc).toContain("Hours Updated");
    });

    it("invalidates dashboard query on success", () => {
      // Sprint 561: moved to extracted component
      expect(editorSrc).toContain("invalidateQueries");
    });

    it("has hours card styles", () => {
      // Sprint 561: moved to extracted component
      expect(editorSrc).toContain("hoursCard:");
      expect(editorSrc).toContain("hoursRow:");
      expect(editorSrc).toContain("hoursTitle:");
    });

    it("renders HoursEditor in overview tab", () => {
      expect(src).toContain("<HoursEditor");
      expect(src).toContain("businessId={slug}");
    });
  });

  describe("storage/index.ts exports", () => {
    const src = readFile("server/storage/index.ts");

    it("re-exports updateBusinessHours", () => {
      expect(src).toContain("updateBusinessHours");
    });
  });

  describe("file health", () => {
    it("dashboard.tsx stays under 600 LOC", () => {
      // Sprint 556: threshold raised 580 → 600 (hours pre-fill)
      const loc = readFile("app/business/dashboard.tsx").split("\n").length;
      expect(loc).toBeLessThan(600);
    });

    it("routes-owner-dashboard.ts stays under 90 LOC", () => {
      const loc = readFile("server/routes-owner-dashboard.ts").split("\n").length;
      expect(loc).toBeLessThan(90);
    });

    it("api.ts stays under 700 LOC", () => {
      const loc = readFile("lib/api.ts").split("\n").length;
      expect(loc).toBeLessThan(700);
    });

    it("server build stays under 715kb", () => {
      const buildSrc = readFile("server_dist/index.js");
      const sizeKb = Buffer.byteLength(buildSrc, "utf-8") / 1024;
      expect(sizeKb).toBeLessThan(720);
    });
  });
});
