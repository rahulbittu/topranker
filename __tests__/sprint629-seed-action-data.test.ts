/**
 * Sprint 629: Seed real action URLs for demo restaurants
 * Decision-to-Action (Phase 4 — Data)
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf-8");
}

describe("Sprint 629 — Seed Action Data", () => {
  const seedSrc = readFile("server/seed.ts");

  describe("Indian restaurants have action URLs", () => {
    it("Spice Garden has menuUrl and orderUrl", () => {
      expect(seedSrc).toContain("spice-garden-dallas");
      expect(seedSrc).toContain("spicegardendallas.com/menu");
      expect(seedSrc).toContain("spicegardendallas.com/order");
    });

    it("Tandoori Flames has menuUrl and orderUrl", () => {
      expect(seedSrc).toContain("tandooriflames.com/menu");
      expect(seedSrc).toContain("tandooriflames.com/order-online");
    });

    it("Bawarchi Biryanis has menuUrl, orderUrl, doordashUrl, pickupUrl", () => {
      expect(seedSrc).toContain("bawarchibiryanis.com/menu");
      expect(seedSrc).toContain("bawarchibiryanis.com/order");
      expect(seedSrc).toContain("doordash.com/store/bawarchi-biryanis-plano");
      expect(seedSrc).toContain("bawarchibiryanis.com/pickup");
    });

    it("Chennai Cafe has menuUrl and uberEatsUrl", () => {
      expect(seedSrc).toContain("chennaicafe.com/menu");
      expect(seedSrc).toContain("ubereats.com/store/chennai-cafe-frisco");
    });

    it("Desi District has menuUrl and orderUrl", () => {
      expect(seedSrc).toContain("desidistrict.com/menu");
      expect(seedSrc).toContain("desidistrict.com/order");
    });
  });

  describe("Other cuisines have action URLs", () => {
    it("Lucky Cat Ramen has menuUrl and uberEatsUrl", () => {
      expect(seedSrc).toContain("luckycatramen.com/menu");
      expect(seedSrc).toContain("ubereats.com/store/lucky-cat-ramen");
    });

    it("Pecan Lodge has menuUrl, orderUrl, doordashUrl", () => {
      expect(seedSrc).toContain("pecanlodge.com/menu");
      expect(seedSrc).toContain("pecanlodge.com/order");
      expect(seedSrc).toContain("doordash.com/store/pecan-lodge-dallas");
    });
  });

  describe("Spice Garden has reservationUrl", () => {
    it("has opentable reservation link", () => {
      expect(seedSrc).toContain("opentable.com/spice-garden-dallas");
    });
  });

  describe("Seed insert maps action fields", () => {
    it("inserts menuUrl", () => {
      expect(seedSrc).toContain("menuUrl: (biz as any).menuUrl");
    });

    it("inserts orderUrl", () => {
      expect(seedSrc).toContain("orderUrl: (biz as any).orderUrl");
    });

    it("inserts pickupUrl", () => {
      expect(seedSrc).toContain("pickupUrl: (biz as any).pickupUrl");
    });

    it("inserts doordashUrl", () => {
      expect(seedSrc).toContain("doordashUrl: (biz as any).doordashUrl");
    });

    it("inserts uberEatsUrl", () => {
      expect(seedSrc).toContain("uberEatsUrl: (biz as any).uberEatsUrl");
    });

    it("inserts reservationUrl", () => {
      expect(seedSrc).toContain("reservationUrl: (biz as any).reservationUrl");
    });
  });

  describe("File health", () => {
    const thresholds = JSON.parse(readFile("shared/thresholds.json"));

    it("build under 750kb", () => {
      expect(thresholds.build.currentSizeKb).toBeLessThan(750);
    });

    it("tracks 33 files", () => {
      expect(Object.keys(thresholds.files).length).toBe(33);
    });
  });
});
