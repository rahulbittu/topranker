/**
 * Sprint 772: AASA Inline Fix
 *
 * Fixed apple-app-site-association returning 404 on Railway.
 * sendFile() failed silently because cwd differs in production.
 * Now serves AASA content inline via res.json().
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 772: AASA Inline Fix", () => {
  describe("server/index.ts — AASA route", () => {
    const src = readFile("server/index.ts");

    it("serves AASA inline, not via sendFile", () => {
      expect(src).toContain("res.json(");
      expect(src).not.toContain("sendFile(aasaPath)");
    });

    it("sets application/json content type", () => {
      expect(src).toContain('"application/json"');
    });

    it("includes correct appID", () => {
      expect(src).toContain("RKGRR7XGWD.com.topranker.app");
    });

    it("includes all deep link paths", () => {
      expect(src).toContain("/business/*");
      expect(src).toContain("/dish/*");
      expect(src).toContain("/challenger/*");
      expect(src).toContain("/share/*");
      expect(src).toContain("/join");
    });

    it("sets cache header for AASA", () => {
      expect(src).toContain("max-age=86400");
    });
  });

  describe("public/.well-known/apple-app-site-association still exists", () => {
    it("file exists as backup", () => {
      const aasaPath = path.resolve(process.cwd(), "public/.well-known/apple-app-site-association");
      expect(fs.existsSync(aasaPath)).toBe(true);
    });

    it("file is valid JSON", () => {
      const content = readFile("public/.well-known/apple-app-site-association");
      const parsed = JSON.parse(content);
      expect(parsed.applinks).toBeDefined();
      expect(parsed.applinks.details[0].appIDs).toContain("RKGRR7XGWD.com.topranker.app");
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
