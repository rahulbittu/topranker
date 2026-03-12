/**
 * Sprint 769: OG Image + Social Sharing Meta
 *
 * Created branded OG image (1200x630) for social sharing previews.
 * Updated meta tags to use topranker.io domain.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 769: OG Image + Social Meta", () => {
  describe("OG image file", () => {
    it("og-image.png exists in public/", () => {
      const exists = fs.existsSync(path.resolve(process.cwd(), "public/og-image.png"));
      expect(exists).toBe(true);
    });

    it("og-image.png exists in assets/images/", () => {
      const exists = fs.existsSync(path.resolve(process.cwd(), "assets/images/og-image.png"));
      expect(exists).toBe(true);
    });
  });

  describe("app/+html.tsx meta tags", () => {
    const html = readFile("app/+html.tsx");

    it("og:image points to topranker.io", () => {
      expect(html).toContain('content="https://topranker.io/og-image.png"');
    });

    it("twitter:image points to topranker.io", () => {
      expect(html).toContain('name="twitter:image" content="https://topranker.io/og-image.png"');
    });

    it("og:url uses topranker.io", () => {
      expect(html).toContain('content="https://topranker.io"');
    });

    it("canonical uses topranker.io", () => {
      expect(html).toContain('href="https://topranker.io"');
    });

    it("does not reference topranker.com", () => {
      expect(html).not.toContain("topranker.com");
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
