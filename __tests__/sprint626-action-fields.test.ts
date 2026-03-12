/**
 * Sprint 626: Decision-to-Action layer — Schema + API for action fields
 * Adds menuUrl, orderUrl, pickupUrl, doordashUrl, uberEatsUrl, reservationUrl
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf-8");
}

describe("Sprint 626 — Decision-to-Action Action Fields", () => {
  const schemaSrc = readFile("shared/schema.ts");
  const apiSrc = readFile("lib/api.ts");
  const bizTypeSrc = readFile("types/business.ts");
  const routesBizSrc = readFile("server/routes-businesses.ts");
  const storageBizSrc = readFile("server/storage/businesses.ts");

  describe("Schema: businesses table action fields", () => {
    const actionFields = ["menu_url", "order_url", "pickup_url", "doordash_url", "uber_eats_url", "reservation_url"];
    actionFields.forEach(field => {
      it(`has ${field} column`, () => {
        expect(schemaSrc).toContain(`"${field}"`);
      });
    });

    it("schema stays under 960 LOC", () => {
      const loc = schemaSrc.split("\n").length;
      expect(loc).toBeLessThan(960);
    });
  });

  describe("Client types: ApiBusiness", () => {
    const clientFields = ["menuUrl", "orderUrl", "pickupUrl", "doordashUrl", "uberEatsUrl", "reservationUrl"];
    clientFields.forEach(field => {
      it(`ApiBusiness has ${field}`, () => {
        expect(apiSrc).toContain(`${field}?`);
      });
    });
  });

  describe("MappedBusiness type", () => {
    const mappedFields = ["menuUrl", "orderUrl", "pickupUrl", "doordashUrl", "uberEatsUrl", "reservationUrl", "phone", "website", "googleMapsUrl"];
    mappedFields.forEach(field => {
      it(`MappedBusiness has ${field}`, () => {
        expect(bizTypeSrc).toContain(field);
      });
    });
  });

  describe("mapApiBusiness mapping", () => {
    const mappersSrc = readFile("lib/api-mappers.ts");
    it("maps menuUrl", () => {
      expect(mappersSrc).toContain("menuUrl: biz.menuUrl");
    });
    it("maps orderUrl", () => {
      expect(mappersSrc).toContain("orderUrl: biz.orderUrl");
    });
    it("maps doordashUrl", () => {
      expect(mappersSrc).toContain("doordashUrl: biz.doordashUrl");
    });
  });

  describe("Server: PUT /api/businesses/:slug/actions", () => {
    it("route exists", () => {
      expect(routesBizSrc).toContain("/api/businesses/:slug/actions");
    });

    it("requires auth", () => {
      expect(routesBizSrc).toContain("requireAuth");
    });

    it("checks owner or admin", () => {
      expect(routesBizSrc).toContain("ownerId");
      expect(routesBizSrc).toContain("isAdmin");
    });

    it("validates ACTION_FIELDS", () => {
      expect(routesBizSrc).toContain("ACTION_FIELDS");
      expect(routesBizSrc).toContain("menuUrl");
      expect(routesBizSrc).toContain("orderUrl");
    });

    it("calls updateBusinessActions", () => {
      expect(routesBizSrc).toContain("updateBusinessActions");
    });
  });

  describe("Storage: updateBusinessActions", () => {
    it("function exists", () => {
      expect(storageBizSrc).toContain("export async function updateBusinessActions");
    });

    it("updates businesses table", () => {
      expect(storageBizSrc).toContain("db");
      expect(storageBizSrc).toContain(".update(businesses)");
    });

    it("businesses.ts stays under 650 LOC", () => {
      const loc = storageBizSrc.split("\n").length;
      expect(loc).toBeLessThan(650);
    });
  });

  describe("file health", () => {
    const thresholds = JSON.parse(readFile("shared/thresholds.json"));

    it("api.ts stays under 490 LOC", () => {
      const loc = apiSrc.split("\n").length;
      expect(loc).toBeLessThan(490);
    });

    it("build under 750kb", () => {
      expect(thresholds.build.currentSizeKb).toBeLessThan(750);
    });

    it("tracks 33 files", () => {
      expect(Object.keys(thresholds.files).length).toBe(33);
    });
  });
});
