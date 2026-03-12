/**
 * Sprint 768: EAS Build API URL — Point to Custom Domain
 *
 * The production and preview EAS builds were pointing to the Railway
 * subdomain instead of the custom domain topranker.io. Fixed so
 * native app builds connect to the right server.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 768: EAS Build API URL", () => {
  describe("eas.json", () => {
    const eas = JSON.parse(readFile("eas.json"));

    it("production uses topranker.io", () => {
      expect(eas.build.production.env.EXPO_PUBLIC_API_URL).toBe("https://topranker.io");
    });

    it("preview uses topranker.io", () => {
      expect(eas.build.preview.env.EXPO_PUBLIC_API_URL).toBe("https://topranker.io");
    });

    it("does not use Railway subdomain", () => {
      const easStr = readFile("eas.json");
      expect(easStr).not.toContain("topranker-production.up.railway.app");
    });

    it("has production channel", () => {
      expect(eas.build.production.channel).toBe("production");
    });
  });

  describe("file health", () => {
    const thresholds = JSON.parse(readFile("shared/thresholds.json"));

    it("tracks 34 files", () => {
      expect(Object.keys(thresholds.files).length).toBe(34);
    });

    it("build under 750kb", () => {
      const buildSrc = readFile("server_dist/index.js");
      const sizeKb = buildSrc.length / 1024;
      expect(sizeKb).toBeLessThan(750);
    });
  });
});
