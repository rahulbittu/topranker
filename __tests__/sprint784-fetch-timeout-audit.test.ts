/**
 * Sprint 784: Complete Fetch Timeout Audit
 *
 * Added timeouts to the 3 remaining unprotected server fetch calls:
 * - deploy.ts: ntfy notification (5s)
 * - email.ts: Resend API (10s)
 * - google-place-enrichment.ts: legacy Places API (10s)
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

/** Find all fetch() calls and check each has AbortSignal.timeout or signal within 10 lines */
function findUnprotectedFetch(src: string, filename: string): string[] {
  const lines = src.split("\n");
  const issues: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Match lines that start a fetch() call
    if (line.match(/(?:await\s+)?fetch\(/) && !line.startsWith("//")) {
      // Check this line and next 15 lines for signal/AbortSignal (covers multi-line fetch config with body)
      const context = lines.slice(i, i + 15).join("\n");
      if (!context.includes("AbortSignal.timeout") && !context.includes("signal:")) {
        issues.push(`${filename}:${i + 1}: ${line.slice(0, 80)}`);
      }
    }
  }
  return issues;
}

describe("Sprint 784: Fetch Timeout Audit", () => {
  describe("deploy.ts — ntfy notification", () => {
    const src = readFile("server/deploy.ts");

    it("ntfy fetch has AbortSignal.timeout", () => {
      // The sendNotification function should contain AbortSignal.timeout
      expect(src).toContain("AbortSignal.timeout(5000)");
      // Verify it's near the ntfy fetch
      const lines = src.split("\n");
      const fetchLine = lines.findIndex((l) => l.includes("fetch(url,") && !l.trimStart().startsWith("//"));
      expect(fetchLine).toBeGreaterThan(-1);
      const context = lines.slice(fetchLine, fetchLine + 8).join("\n");
      expect(context).toContain("AbortSignal.timeout(5000)");
    });
  });

  describe("email.ts — Resend API", () => {
    const src = readFile("server/email.ts");

    it("Resend fetch has AbortSignal.timeout", () => {
      const resendLine = src.split("\n").findIndex((l) => l.includes("api.resend.com"));
      expect(resendLine).toBeGreaterThan(-1);
      const context = src.split("\n").slice(resendLine, resendLine + 8).join("\n");
      expect(context).toContain("AbortSignal.timeout");
    });

    it("uses 10s timeout per attempt", () => {
      expect(src).toContain("AbortSignal.timeout(10000)");
    });
  });

  describe("google-place-enrichment.ts — legacy Places API", () => {
    const src = readFile("server/google-place-enrichment.ts");

    it("Places fetch has AbortSignal.timeout", () => {
      const placesLine = src.split("\n").findIndex((l) =>
        l.includes("maps.googleapis.com/maps/api/place")
      );
      expect(placesLine).toBeGreaterThan(-1);
      const context = src.split("\n").slice(placesLine, placesLine + 6).join("\n");
      expect(context).toContain("AbortSignal.timeout");
    });
  });

  describe("no unprotected server fetches", () => {
    const serverFiles = [
      "server/auth.ts",
      "server/deploy.ts",
      "server/email.ts",
      "server/google-place-enrichment.ts",
      "server/google-places.ts",
      "server/photos.ts",
    ];

    for (const f of serverFiles) {
      it(`${f} has no unprotected fetch calls`, () => {
        const src = readFile(f);
        const issues = findUnprotectedFetch(src, f);
        expect(issues).toEqual([]);
      });
    }
  });

  describe("file health", () => {
    const thresholds = JSON.parse(readFile("shared/thresholds.json"));

    it("tracks 34 files", () => {
      expect(Object.keys(thresholds.files).length).toBe(34);
    });

    it("build under 750kb", () => {
      const buildSrc = readFile("server_dist/index.js");
      expect(buildSrc.length / 1024).toBeLessThan(750);
    });
  });
});
