/**
 * Sprint 526: Admin dashboard notification section extraction
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 526: Admin Tab Extraction", () => {
  describe("components/admin/NotificationAdminSection.tsx", () => {
    const src = readFile("components/admin/NotificationAdminSection.tsx");

    it("exports NotificationAdminSection component", () => {
      expect(src).toContain("export function NotificationAdminSection");
    });

    it("accepts isAdmin prop", () => {
      expect(src).toContain("isAdmin: boolean");
    });

    it("imports all 4 notification/push cards", () => {
      expect(src).toContain("NotificationInsightsCard");
      expect(src).toContain("PushExperimentsCard");
      expect(src).toContain("ExperimentResultsCard");
      expect(src).toContain("TemplateManagerCard");
    });

    it("imports template API functions", () => {
      expect(src).toContain("fetchNotificationTemplates");
      expect(src).toContain("createNotificationTemplate");
      expect(src).toContain("deleteNotificationTemplate");
      expect(src).toContain("updateNotificationTemplate");
    });

    it("has 3 useQuery hooks", () => {
      expect(src).toContain("admin-notification-insights");
      expect(src).toContain("admin-push-experiments");
      expect(src).toContain("admin-notification-templates");
    });

    it("has template mutation handlers", () => {
      expect(src).toContain("handleCreateTemplate");
      expect(src).toContain("handleDeleteTemplate");
      expect(src).toContain("handleToggleTemplate");
    });

    it("renders all 4 cards", () => {
      expect(src).toContain("<NotificationInsightsCard");
      expect(src).toContain("<PushExperimentsCard");
      expect(src).toContain("<ExperimentResultsCard");
      expect(src).toContain("<TemplateManagerCard");
    });

    it("stays under 120 LOC", () => {
      const lines = src.split("\n").length;
      expect(lines).toBeLessThan(120);
    });
  });

  describe("app/admin/index.tsx — reduced LOC", () => {
    const src = readFile("app/admin/index.tsx");

    it("imports NotificationAdminSection", () => {
      expect(src).toContain("NotificationAdminSection");
      expect(src).toContain("@/components/admin/NotificationAdminSection");
    });

    it("renders NotificationAdminSection in overview tab", () => {
      expect(src).toContain("<NotificationAdminSection");
      expect(src).toContain("isAdmin={!!isAdmin}");
    });

    it("no longer imports notification cards directly", () => {
      expect(src).not.toContain("@/components/admin/NotificationInsightsCard");
      expect(src).not.toContain("@/components/admin/PushExperimentsCard");
      expect(src).not.toContain("@/components/admin/ExperimentResultsCard");
      expect(src).not.toContain("@/components/admin/TemplateManagerCard");
    });

    it("no longer has notification template queries", () => {
      expect(src).not.toContain("admin-notification-templates");
      expect(src).not.toContain("admin-push-experiments");
      expect(src).not.toContain("admin-notification-insights");
    });

    it("stays under 570 LOC (down from 622)", () => {
      // Sprint 543: +5 LOC for cities tab
      const lines = src.split("\n").length;
      expect(lines).toBeLessThan(570);
    });

    it("retains claims tab content", () => {
      expect(src).toContain("ClaimsTabContent");
      expect(src).toContain("handleClaimAction");
    });

    it("retains flags tab", () => {
      expect(src).toContain("activeTab === \"flags\"");
      expect(src).toContain("handleFlagAction");
    });

    it("retains users tab", () => {
      expect(src).toContain("activeTab === \"users\"");
      expect(src).toContain("memberList");
    });
  });
});
