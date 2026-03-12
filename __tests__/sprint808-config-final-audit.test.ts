/**
 * Sprint 808: Config Consolidation Final Audit
 *
 * Migrates push.ts, redis.ts, rate-limiter.ts, file-storage.ts
 * from direct process.env to config.ts.
 *
 * Bootstrap files (db.ts, logger.ts, index.ts) are exempt —
 * they load before config and adding config would create
 * cascading required-var dependencies.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 808: Config Consolidation Final Audit", () => {
  const pushSrc = readFile("server/push.ts");
  const redisSrc = readFile("server/redis.ts");
  const rateLimiterSrc = readFile("server/rate-limiter.ts");
  const fileStorageSrc = readFile("server/file-storage.ts");
  const configSrc = readFile("server/config.ts");

  describe("config.ts additions", () => {
    it("has redisUrl", () => {
      expect(configSrc).toContain("redisUrl:");
    });

    it("has r2BucketName", () => {
      expect(configSrc).toContain("r2BucketName:");
    });

    it("has r2AccountId", () => {
      expect(configSrc).toContain("r2AccountId:");
    });

    it("has r2AccessKeyId", () => {
      expect(configSrc).toContain("r2AccessKeyId:");
    });

    it("has r2SecretAccessKey", () => {
      expect(configSrc).toContain("r2SecretAccessKey:");
    });

    it("has r2PublicUrl", () => {
      expect(configSrc).toContain("r2PublicUrl:");
    });
  });

  describe("push.ts", () => {
    it("imports config", () => {
      expect(pushSrc).toContain('import { config } from "./config"');
    });

    it("uses config.isProduction", () => {
      expect(pushSrc).toContain("config.isProduction");
    });

    it("no direct process.env.NODE_ENV", () => {
      expect(pushSrc).not.toContain("process.env.NODE_ENV");
    });
  });

  describe("redis.ts", () => {
    it("imports config", () => {
      expect(redisSrc).toContain('import { config } from "./config"');
    });

    it("uses config.redisUrl", () => {
      expect(redisSrc).toContain("config.redisUrl");
    });

    it("no direct process.env.REDIS_URL", () => {
      expect(redisSrc).not.toContain("process.env.REDIS_URL");
    });
  });

  describe("rate-limiter.ts", () => {
    it("imports config", () => {
      expect(rateLimiterSrc).toContain('import { config } from "./config"');
    });

    it("uses config.redisUrl", () => {
      expect(rateLimiterSrc).toContain("config.redisUrl");
    });

    it("no direct process.env.REDIS_URL", () => {
      expect(rateLimiterSrc).not.toContain("process.env.REDIS_URL");
    });
  });

  describe("file-storage.ts", () => {
    it("imports config", () => {
      expect(fileStorageSrc).toContain('import { config } from "./config"');
    });

    it("uses config.r2BucketName", () => {
      expect(fileStorageSrc).toContain("config.r2BucketName");
    });

    it("uses config.r2AccountId", () => {
      expect(fileStorageSrc).toContain("config.r2AccountId");
    });

    it("uses config.r2AccessKeyId", () => {
      expect(fileStorageSrc).toContain("config.r2AccessKeyId");
    });

    it("uses config.r2SecretAccessKey", () => {
      expect(fileStorageSrc).toContain("config.r2SecretAccessKey");
    });

    it("no direct process.env.R2_BUCKET_NAME", () => {
      expect(fileStorageSrc).not.toContain("process.env.R2_BUCKET_NAME");
    });

    it("no direct process.env destructuring of R2 vars", () => {
      expect(fileStorageSrc).not.toContain("} = process.env");
    });
  });

  describe("bootstrap exemptions documented", () => {
    const dbSrc = readFile("server/db.ts");
    const loggerSrc = readFile("server/logger.ts");
    const indexSrc = readFile("server/index.ts");

    it("db.ts is exempt (bootstrap — loads before config)", () => {
      expect(dbSrc).toContain("process.env.DATABASE_URL");
    });

    it("logger.ts is exempt (bootstrap — loads before config)", () => {
      expect(loggerSrc).toContain("process.env.NODE_ENV");
    });

    it("index.ts is exempt (entry point)", () => {
      expect(indexSrc).toContain("process.env");
    });
  });

  describe("file health", () => {
    it("build under 750kb", () => {
      const buildSrc = readFile("server_dist/index.js");
      expect(buildSrc.length / 1024).toBeLessThan(750);
    });
  });
});
