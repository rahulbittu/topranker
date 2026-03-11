/**
 * Sprint 593: Online Demo + Real Google Data
 *
 * Tests:
 * 1. Web build script exists in package.json
 * 2. Railway config includes web build
 * 3. Server serves dist/ static files in production
 * 4. Google Places auto-import module exists
 * 5. Server startup calls autoImportGooglePlaces
 * 6. getApiUrl() uses window.location.origin for web
 * 7. Photo proxy endpoint handles Google Place references
 * 8. LOC thresholds
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 593: Web Build Pipeline", () => {
  const pkg = JSON.parse(readFile("package.json"));
  const railway = readFile("railway.toml");

  it("package.json has web:build script", () => {
    expect(pkg.scripts["web:build"]).toContain("expo export --platform web");
  });

  it("railway.toml buildCommand includes server:build", () => {
    expect(railway).toContain("server:build");
  });

  it("railway.toml has health check", () => {
    expect(railway).toContain("/_health");
  });
});

describe("Sprint 593: Server Static File Serving", () => {
  const src = readFile("server/index.ts");

  it("serves dist/ as static files", () => {
    expect(src).toContain("express.static(distPath");
  });

  it("falls back to index.html for SPA routing", () => {
    expect(src).toContain('res.type("html").send(distIndexHtml)');
  });

  it("checks for dist/index.html existence", () => {
    expect(src).toContain('path.join(distPath, "index.html")');
  });
});

describe("Sprint 593: Google Places Auto-Import", () => {
  const importSrc = readFile("server/google-places-import.ts");
  const indexSrc = readFile("server/index.ts");

  it("auto-import module exports autoImportGooglePlaces", () => {
    expect(importSrc).toContain("export async function autoImportGooglePlaces");
  });

  it("checks for existing google_bulk_import data", () => {
    expect(importSrc).toContain("google_bulk_import");
  });

  it("searches multiple Dallas-area cities", () => {
    expect(importSrc).toContain("Irving");
    expect(importSrc).toContain("Plano");
    expect(importSrc).toContain("Frisco");
    expect(importSrc).toContain("Dallas");
  });

  it("imports Indian restaurants", () => {
    expect(importSrc).toContain("Indian restaurants");
  });

  it("fetches photos after import", () => {
    expect(importSrc).toContain("fetchAndStorePhotos");
  });

  it("server startup calls autoImportGooglePlaces", () => {
    expect(indexSrc).toContain("autoImportGooglePlaces");
  });

  it("auto-import is non-blocking (catch)", () => {
    expect(indexSrc).toContain("autoImportGooglePlaces().catch");
  });

  it("module LOC under 100", () => {
    const lines = importSrc.split("\n").length;
    expect(lines).toBeLessThan(100);
  });
});

describe("Sprint 593: API URL Resolution", () => {
  const src = readFile("lib/query-client.ts");

  it("uses window.location.origin for web", () => {
    expect(src).toContain("window.location.origin");
  });

  it("falls back to EXPO_PUBLIC_API_URL env var", () => {
    expect(src).toContain("EXPO_PUBLIC_API_URL");
  });
});

describe("Sprint 593: Photo Proxy", () => {
  const src = readFile("server/photos.ts");

  it("validates Google Places photo reference format", () => {
    expect(src).toContain('ref.startsWith("places/")');
  });

  it("proxies to Google Places photo media API", () => {
    expect(src).toContain("places.googleapis.com/v1");
  });

  it("sets cache headers on photo responses", () => {
    expect(src).toContain("Cache-Control");
  });
});

describe("Sprint 593: Threshold Checks", () => {
  const thresholds = JSON.parse(readFile("shared/thresholds.json"));

  it("test count meets minimum", () => {
    expect(thresholds.tests.currentCount).toBeGreaterThanOrEqual(thresholds.tests.minCount);
  });

  it("build size under max", () => {
    expect(thresholds.build.currentSizeKb).toBeLessThanOrEqual(thresholds.build.maxSizeKb);
  });
});
