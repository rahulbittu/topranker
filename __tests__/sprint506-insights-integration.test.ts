/**
 * Sprint 506: Integrate NotificationInsightsCard into admin dashboard
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 506: Insights Integration", () => {
  // Sprint 526: Notification admin extracted to NotificationAdminSection
  describe("NotificationAdminSection — insights integration", () => {
    const src = readFile("components/admin/NotificationAdminSection.tsx");

    it("imports NotificationInsightsCard component", () => {
      expect(src).toContain("NotificationInsightsCard");
      expect(src).toContain("./NotificationInsightsCard");
    });

    it("imports NotificationInsightsData type", () => {
      expect(src).toContain("NotificationInsightsData");
    });

    it("imports getApiUrl for fetch", () => {
      expect(src).toContain("getApiUrl");
    });

    it("has useQuery for notification insights", () => {
      expect(src).toContain("admin-notification-insights");
    });

    it("fetches from /api/notifications/insights endpoint", () => {
      expect(src).toContain("/api/notifications/insights");
    });

    it("passes daysBack parameter", () => {
      expect(src).toContain("daysBack=7");
    });

    it("sets staleTime for caching", () => {
      expect(src).toContain("staleTime");
    });

    it("renders NotificationInsightsCard in overview tab", () => {
      expect(src).toContain("notifInsights?.data");
      expect(src).toContain("<NotificationInsightsCard");
    });

    it("conditionally renders when data is available", () => {
      expect(src).toContain("notifInsights?.data &&");
    });

    it("admin/index.tsx uses NotificationAdminSection", () => {
      const adminSrc = readFile("app/admin/index.tsx");
      expect(adminSrc).toContain("NotificationAdminSection");
    });

    it("admin retains existing admin tabs", () => {
      const adminSrc = readFile("app/admin/index.tsx");
      expect(adminSrc).toContain("overview");
      expect(adminSrc).toContain("claims");
      expect(adminSrc).toContain("flags");
    });
  });

  describe("NotificationInsightsCard exists", () => {
    const src = readFile("components/admin/NotificationInsightsCard.tsx");

    it("component exists and exports", () => {
      expect(src).toContain("export function NotificationInsightsCard");
    });
  });
});
