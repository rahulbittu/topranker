/**
 * Sprint 807: Config Consolidation Batch 2
 *
 * Migrates security-headers.ts, wrap-async.ts, routes-admin.ts,
 * google-place-enrichment.ts, unsubscribe-tokens.ts, error-tracking.ts
 * from direct process.env to config.ts.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 807: Config Consolidation Batch 2", () => {
  const securityHeadersSrc = readFile("server/security-headers.ts");
  const wrapAsyncSrc = readFile("server/wrap-async.ts");
  const routesAdminSrc = readFile("server/routes-admin.ts");
  const enrichmentSrc = readFile("server/google-place-enrichment.ts");
  const unsubscribeSrc = readFile("server/unsubscribe-tokens.ts");
  const errorTrackingSrc = readFile("server/error-tracking.ts");
  const configSrc = readFile("server/config.ts");

  describe("config.ts additions", () => {
    it("has googlePlacesApiKey", () => {
      expect(configSrc).toContain("googlePlacesApiKey:");
    });

    it("has unsubscribeSecret", () => {
      expect(configSrc).toContain("unsubscribeSecret:");
    });

    it("has sentryDsn", () => {
      expect(configSrc).toContain("sentryDsn:");
    });
  });

  describe("security-headers.ts", () => {
    it("imports config", () => {
      expect(securityHeadersSrc).toContain('import { config } from "./config"');
    });

    it("uses config.corsOrigins", () => {
      expect(securityHeadersSrc).toContain("config.corsOrigins");
    });

    it("uses config.railwayPublicDomain", () => {
      expect(securityHeadersSrc).toContain("config.railwayPublicDomain");
    });

    it("uses config.isProduction", () => {
      expect(securityHeadersSrc).toContain("config.isProduction");
    });

    it("no direct process.env.CORS_ORIGINS", () => {
      expect(securityHeadersSrc).not.toContain("process.env.CORS_ORIGINS");
    });

    it("no direct process.env.RAILWAY_PUBLIC_DOMAIN", () => {
      expect(securityHeadersSrc).not.toContain("process.env.RAILWAY_PUBLIC_DOMAIN");
    });

    it("no direct process.env.NODE_ENV", () => {
      expect(securityHeadersSrc).not.toContain("process.env.NODE_ENV");
    });
  });

  describe("wrap-async.ts", () => {
    it("imports config", () => {
      expect(wrapAsyncSrc).toContain('import { config } from "./config"');
    });

    it("uses config.isProduction", () => {
      expect(wrapAsyncSrc).toContain("config.isProduction");
    });

    it("no direct process.env.NODE_ENV", () => {
      expect(wrapAsyncSrc).not.toContain("process.env.NODE_ENV");
    });
  });

  describe("routes-admin.ts", () => {
    it("imports config", () => {
      expect(routesAdminSrc).toContain('import { config } from "./config"');
    });

    it("uses config.isProduction for dev-only routes", () => {
      expect(routesAdminSrc).toContain("config.isProduction");
    });

    it("no direct process.env.NODE_ENV", () => {
      expect(routesAdminSrc).not.toContain("process.env.NODE_ENV");
    });
  });

  describe("google-place-enrichment.ts", () => {
    it("imports config", () => {
      expect(enrichmentSrc).toContain('import { config } from "./config"');
    });

    it("uses config.googlePlacesApiKey", () => {
      expect(enrichmentSrc).toContain("config.googlePlacesApiKey");
    });

    it("no direct process.env.GOOGLE_PLACES_API_KEY", () => {
      expect(enrichmentSrc).not.toContain("process.env.GOOGLE_PLACES_API_KEY");
    });
  });

  describe("unsubscribe-tokens.ts", () => {
    it("imports config", () => {
      expect(unsubscribeSrc).toContain('import { config } from "./config"');
    });

    it("uses config.unsubscribeSecret", () => {
      expect(unsubscribeSrc).toContain("config.unsubscribeSecret");
    });

    it("no direct process.env.UNSUBSCRIBE_SECRET", () => {
      expect(unsubscribeSrc).not.toContain("process.env.UNSUBSCRIBE_SECRET");
    });
  });

  describe("error-tracking.ts", () => {
    it("imports config", () => {
      expect(errorTrackingSrc).toContain('import { config } from "./config"');
    });

    it("uses config.sentryDsn", () => {
      expect(errorTrackingSrc).toContain("config.sentryDsn");
    });

    it("no direct process.env.SENTRY_DSN", () => {
      expect(errorTrackingSrc).not.toContain("process.env.SENTRY_DSN");
    });
  });

  describe("file health", () => {
    it("build under 750kb", () => {
      const buildSrc = readFile("server_dist/index.js");
      expect(buildSrc.length / 1024).toBeLessThan(750);
    });
  });
});
