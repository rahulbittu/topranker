/**
 * Sprint 543: City Expansion Dashboard — admin tool for beta city health
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 543: City Expansion Dashboard", () => {
  describe("CityExpansionDashboard component", () => {
    const src = readFile("components/admin/CityExpansionDashboard.tsx");

    it("exports CityExpansionDashboard function", () => {
      expect(src).toContain("export function CityExpansionDashboard");
    });

    it("uses useQuery for health, engagement, and promotion data", () => {
      expect(src).toContain("fetchCityHealthSummary");
      expect(src).toContain("fetchAllCityEngagement");
      expect(src).toContain("fetchBetaPromotionStatuses");
    });

    it("renders HealthSummaryCard with healthy/degraded/critical counts", () => {
      expect(src).toContain("HealthSummaryCard");
      expect(src).toContain("data.healthy");
      expect(src).toContain("data.degraded");
      expect(src).toContain("data.critical");
    });

    it("separates active and beta cities", () => {
      expect(src).toContain('status === "active"');
      expect(src).toContain('status === "beta"');
    });

    it("renders CityEngagementRow with business/member/rating metrics", () => {
      expect(src).toContain("CityEngagementRow");
      expect(src).toContain("totalBusinesses");
      expect(src).toContain("totalMembers");
      expect(src).toContain("totalRatings");
    });

    it("renders PromotionCard with progress bars", () => {
      expect(src).toContain("PromotionCard");
      expect(src).toContain("ProgressBar");
      expect(src).toContain("promo.eligible");
    });

    it("shows missing criteria for beta cities", () => {
      expect(src).toContain("missingCriteria");
    });

    it("has StatusBadge for city statuses", () => {
      expect(src).toContain("StatusBadge");
      expect(src).toContain("toUpperCase");
    });

    it("shows loading state while fetching data", () => {
      expect(src).toContain("ActivityIndicator");
      expect(src).toContain("Loading city data");
    });
  });

  describe("Admin API functions", () => {
    const src = readFile("lib/api-admin.ts");

    it("exports CityHealthSummary interface", () => {
      expect(src).toContain("export interface CityHealthSummary");
      expect(src).toContain("healthy");
      expect(src).toContain("degraded");
      expect(src).toContain("critical");
    });

    it("exports CityEngagementData interface", () => {
      expect(src).toContain("export interface CityEngagementData");
      expect(src).toContain("totalMembers");
      expect(src).toContain("totalBusinesses");
      expect(src).toContain("totalRatings");
      expect(src).toContain("status");
    });

    it("exports BetaPromotionStatus interface", () => {
      expect(src).toContain("export interface BetaPromotionStatus");
      expect(src).toContain("eligible");
      expect(src).toContain("currentMetrics");
      expect(src).toContain("missingCriteria");
    });

    it("exports fetchCityHealthSummary function", () => {
      expect(src).toContain("export async function fetchCityHealthSummary");
      expect(src).toContain("/api/admin/city-health/summary");
    });

    it("exports fetchAllCityEngagement function", () => {
      expect(src).toContain("export async function fetchAllCityEngagement");
      expect(src).toContain("/api/admin/city-engagement");
    });

    it("exports fetchBetaPromotionStatuses function", () => {
      expect(src).toContain("export async function fetchBetaPromotionStatuses");
      expect(src).toContain("/api/admin/promotion-status");
    });

    it("exports promoteCity function", () => {
      expect(src).toContain("export async function promoteCity");
      expect(src).toContain("/api/admin/promote/");
    });
  });

  describe("Admin index — cities tab", () => {
    const src = readFile("app/admin/index.tsx");

    it("includes cities in AdminTab type", () => {
      expect(src).toContain('"cities"');
    });

    it("has cities tab button in tab bar", () => {
      expect(src).toContain("map-outline");
      expect(src).toContain("Cities");
    });

    it("imports CityExpansionDashboard", () => {
      expect(src).toContain("CityExpansionDashboard");
    });

    it("renders CityExpansionDashboard when cities tab active", () => {
      expect(src).toContain('activeTab === "cities"');
      expect(src).toContain("<CityExpansionDashboard");
    });
  });

  describe("City engagement — status field", () => {
    const src = readFile("server/city-engagement.ts");

    it("CityEngagement interface includes status field", () => {
      expect(src).toContain('status: "active" | "beta" | "planned"');
    });

    it("imports isCityActive from city-config", () => {
      expect(src).toContain("isCityActive");
    });

    it("returns status in engagement data", () => {
      expect(src).toContain("isCityActive(city)");
    });
  });
});
