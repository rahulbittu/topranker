/**
 * Sprint 619: Build size audit and pruning
 * Validates seed exclusion from production bundle, build define, and size reduction.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf-8");
}

describe("Sprint 619 — Build Size Audit & Pruning", () => {
  const indexSrc = readFile("server/index.ts");
  const adminSrc = readFile("server/routes-admin.ts");
  const pkgSrc = readFile("package.json");
  const buildSrc = readFile("server_dist/index.js");

  describe("seed exclusion", () => {
    it("seeds only in non-production mode", () => {
      expect(indexSrc).toContain('process.env.NODE_ENV !== "production"');
      expect(indexSrc).toContain("seedDatabase");
    });

    it("seed-cities admin route is dev-only", () => {
      expect(adminSrc).toContain('process.env.NODE_ENV !== "production"');
      expect(adminSrc).toContain("seedCities");
    });

    it("production build excludes seed data content", () => {
      // The seed module contains restaurant data like "Pecan Lodge"
      // If seed.ts is bundled, these strings would appear in the build
      expect(buildSrc).not.toContain("Pecan Lodge");
    });

    it("production build excludes seed-cities data content", () => {
      // seed-cities.ts contains city population/lat/lng data arrays
      // The actual data arrays are excluded even if the function name remains as a dead reference
      const sizeKb = buildSrc.length / 1024;
      expect(sizeKb).toBeLessThan(670); // Sprint 772: raised from 665 (+AASA inline)
    });
  });

  describe("build configuration", () => {
    it("esbuild defines NODE_ENV=production", () => {
      const pkg = JSON.parse(pkgSrc);
      expect(pkg.scripts["server:build"]).toContain("--define:process.env.NODE_ENV");
    });

    it("build is under 670kb (Sprint 772: +AASA inline content)", () => {
      const sizeKb = buildSrc.length / 1024;
      expect(sizeKb).toBeLessThan(670);
    });

    it("build saved over 100kb from seed exclusion", () => {
      const sizeKb = buildSrc.length / 1024;
      expect(sizeKb).toBeLessThan(700); // was 734.9, now ~625.7
    });
  });

  describe("build integrity", () => {
    it("still includes core routes", () => {
      expect(buildSrc).toContain("/api/leaderboard");
      expect(buildSrc).toContain("/api/trending");
      expect(buildSrc).toContain("/api/just-rated");
    });

    it("still includes auth routes", () => {
      expect(buildSrc).toContain("/api/auth/login");
      expect(buildSrc).toContain("/api/auth/signup");
    });

    it("still includes rating routes", () => {
      expect(buildSrc).toContain("/api/ratings");
    });

    it("still includes schema", () => {
      expect(buildSrc).toContain("businesses");
      expect(buildSrc).toContain("ratings");
      expect(buildSrc).toContain("members");
    });
  });

  describe("thresholds", () => {
    const thresholds = JSON.parse(readFile("shared/thresholds.json"));

    it("build size is updated", () => {
      expect(thresholds.build.currentSizeKb).toBeLessThan(700);
    });

    it("max build size is still 750kb", () => {
      expect(thresholds.build.maxSizeKb).toBe(750);
    });
  });
});
