/**
 * Sprint 503: Admin Dashboard Notification Insights UI
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 503: Notification Insights UI", () => {
  describe("NotificationInsightsCard component", () => {
    const src = readFile("components/admin/NotificationInsightsCard.tsx");

    it("exports NotificationInsightsCard component", () => {
      expect(src).toContain("export function NotificationInsightsCard");
    });

    it("exports NotificationInsightsData interface", () => {
      expect(src).toContain("export interface NotificationInsightsData");
    });

    it("displays total sent metric", () => {
      expect(src).toContain("Total Sent");
      expect(src).toContain("totalSent");
    });

    it("displays open rate metric", () => {
      expect(src).toContain("Open Rate");
      expect(src).toContain("openRate");
    });

    it("displays unique openers metric", () => {
      expect(src).toContain("Unique Openers");
      expect(src).toContain("uniqueMembers");
    });

    it("displays delivery rate metric", () => {
      expect(src).toContain("Delivery Rate");
      expect(src).toContain("successRate");
    });

    it("has category breakdown section", () => {
      expect(src).toContain("By Category");
      expect(src).toContain("CategoryRow");
    });

    it("shows per-category sent and opens", () => {
      expect(src).toContain("sent");
      expect(src).toContain("opens");
    });

    it("computes per-category open rate", () => {
      expect(src).toContain("opens / sent");
    });

    it("color-codes rate badges (green >= 20%, red < 20%)", () => {
      expect(src).toContain("rateBadgeGood");
      expect(src).toContain("rateBadgeLow");
      expect(src).toContain("rate >= 20");
    });

    it("shows error summary when errors exist", () => {
      expect(src).toContain("delivery error");
      expect(src).toContain("alert-circle-outline");
    });

    it("uses notifications-outline header icon", () => {
      expect(src).toContain("notifications-outline");
    });

    it("uses brand amber color for accents", () => {
      expect(src).toContain("BRAND.colors.amber");
    });

    it("uses DMSans font family", () => {
      expect(src).toContain("DMSans_700Bold");
      expect(src).toContain("DMSans_400Regular");
    });
  });

  describe("file health", () => {
    it("NotificationInsightsCard.tsx under 250 LOC", () => {
      const loc = readFile("components/admin/NotificationInsightsCard.tsx").split("\n").length;
      expect(loc).toBeLessThan(250);
    });
  });
});
