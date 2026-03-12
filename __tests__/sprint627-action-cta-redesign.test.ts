/**
 * Sprint 627: Business detail action CTA redesign
 * Decision-to-Action CTAs (Menu, Order, Pickup, DoorDash, Uber Eats, Reserve)
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf-8");
}

describe("Sprint 627 — Business Detail Action CTAs", () => {
  const actionBarSrc = readFile("components/business/BusinessActionBar.tsx");
  const actionBtnSrc = readFile("components/business/ActionButton.tsx");
  const bizDetailSrc = readFile("app/business/[id].tsx");
  const analyticsSrc = readFile("lib/analytics.ts");

  describe("BusinessActionBar props", () => {
    const actionProps = ["menuUrl", "orderUrl", "pickupUrl", "doordashUrl", "uberEatsUrl", "reservationUrl"];
    actionProps.forEach(prop => {
      it(`accepts ${prop} prop`, () => {
        expect(actionBarSrc).toContain(prop);
      });
    });
  });

  describe("Action CTA handlers", () => {
    it("has handleMenu", () => { expect(actionBarSrc).toContain("handleMenu"); });
    it("has handleOrder", () => { expect(actionBarSrc).toContain("handleOrder"); });
    it("has handlePickup", () => { expect(actionBarSrc).toContain("handlePickup"); });
    it("has handleDoordash", () => { expect(actionBarSrc).toContain("handleDoordash"); });
    it("has handleUberEats", () => { expect(actionBarSrc).toContain("handleUberEats"); });
    it("has handleReservation", () => { expect(actionBarSrc).toContain("handleReservation"); });
  });

  describe("Conditional rendering", () => {
    it("checks hasActionCTAs", () => {
      expect(actionBarSrc).toContain("hasActionCTAs");
    });

    it("renders action CTAs only when available", () => {
      expect(actionBarSrc).toContain("{menuUrl &&");
      expect(actionBarSrc).toContain("{orderUrl &&");
    });

    it("action CTAs use accent prop", () => {
      expect(actionBarSrc).toContain("accent");
    });
  });

  describe("ActionButton accent styling", () => {
    it("accepts accent prop", () => {
      expect(actionBtnSrc).toContain("accent");
    });

    it("has iconCircleAccent style (Sprint 642: circle buttons)", () => {
      expect(actionBtnSrc).toContain("iconCircleAccent");
    });

    it("has actionBtnLabelAccent style", () => {
      expect(actionBtnSrc).toContain("actionBtnLabelAccent");
    });

    it("uses AMBER color for accent", () => {
      expect(actionBtnSrc).toContain("AMBER");
    });
  });

  describe("Business detail wiring", () => {
    it("passes menuUrl", () => { expect(bizDetailSrc).toContain("menuUrl={business.menuUrl}"); });
    it("passes orderUrl", () => { expect(bizDetailSrc).toContain("orderUrl={business.orderUrl}"); });
    it("passes doordashUrl", () => { expect(bizDetailSrc).toContain("doordashUrl={business.doordashUrl}"); });
  });

  describe("Analytics tracking", () => {
    it("has actionCTATap function", () => {
      expect(analyticsSrc).toContain("actionCTATap");
    });

    it("tracks action_cta_tap event", () => {
      expect(analyticsSrc).toContain("action_cta_tap");
    });

    it("includes action_type in event", () => {
      expect(analyticsSrc).toContain("action_type");
    });
  });

  describe("file health", () => {
    const thresholds = JSON.parse(readFile("shared/thresholds.json"));

    it("ActionBar stays under 145 LOC", () => {
      const loc = actionBarSrc.split("\n").length;
      expect(loc).toBeLessThan(145); // Sprint 630: +attribution tracking
    });

    it("build under 750kb", () => {
      expect(thresholds.build.currentSizeKb).toBeLessThan(750);
    });

    it("tracks 34 files", () => {
      expect(Object.keys(thresholds.files).length).toBe(34);
    });
  });
});
