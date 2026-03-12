/**
 * Sprint 774: Router Origin Fix
 *
 * Fixed expo-router origin in app.json from topranker.com → topranker.io.
 * Both plugin config and extra.router.origin updated.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readJson(rel: string) {
  return JSON.parse(fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8"));
}

describe("Sprint 774: Router Origin", () => {
  const config = readJson("app.json");

  it("expo-router plugin origin is topranker.io", () => {
    const routerPlugin = config.expo.plugins.find(
      (p: any) => Array.isArray(p) && p[0] === "expo-router"
    );
    expect(routerPlugin[1].origin).toBe("https://topranker.io");
  });

  it("extra.router.origin is topranker.io", () => {
    expect(config.expo.extra.router.origin).toBe("https://topranker.io");
  });

  it("deep linking domains still include topranker.com for backwards compat", () => {
    expect(config.expo.ios.associatedDomains).toContain("applinks:topranker.com");
    expect(config.expo.ios.associatedDomains).toContain("applinks:topranker.io");
  });

  describe("file health", () => {
    const thresholds = readJson("shared/thresholds.json");

    it("tracks 34 files", () => {
      expect(Object.keys(thresholds.files).length).toBe(34);
    });

    it("build under 750kb", () => {
      const buildSrc = fs.readFileSync(path.resolve(process.cwd(), "server_dist/index.js"), "utf-8");
      expect(buildSrc.length / 1024).toBeLessThan(750);
    });
  });
});
