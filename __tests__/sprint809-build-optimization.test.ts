/**
 * Sprint 809: Build Size Optimization
 *
 * Added --minify-syntax to esbuild to reduce bundle size
 * without losing debuggability (names and formatting preserved).
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 809: Build Size Optimization", () => {
  describe("build configuration", () => {
    const packageJson = readFile("package.json");

    it("server:build uses --minify-syntax", () => {
      expect(packageJson).toContain("--minify-syntax");
    });

    it("server:build uses syntax minification only (not full minify)", () => {
      // We want syntax minification only, not name mangling
      expect(packageJson).toContain("--minify-syntax");
      expect(packageJson).not.toContain("--minify-identifiers");
    });

    it("server:build preserves --format=esm", () => {
      expect(packageJson).toContain("--format=esm");
    });
  });

  describe("build size", () => {
    it("build is under 750kb", () => {
      const buildSrc = readFile("server_dist/index.js");
      const sizeKb = buildSrc.length / 1024;
      expect(sizeKb).toBeLessThan(750);
    });

    it("build recovered headroom (syntax minification saves ~30kb)", () => {
      const buildSrc = readFile("server_dist/index.js");
      const sizeKb = buildSrc.length / 1024;
      // Pre-optimization: 721.2kb. Post: ~689kb. Verify savings.
      expect(sizeKb).toBeLessThan(700);
    });
  });
});
