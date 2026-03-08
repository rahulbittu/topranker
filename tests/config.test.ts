/**
 * Unit Tests — Centralized Environment Config (H4 Audit Fix)
 * Owner: Alex Volkov (DevOps Lead)
 *
 * Tests that the config module properly validates required env vars
 * and crashes on missing values (no silent fallbacks).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("server/config", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("crashes if DATABASE_URL is missing", async () => {
    delete process.env.DATABASE_URL;
    process.env.SESSION_SECRET = "test-secret";
    await expect(() => import("../server/config")).rejects.toThrow("DATABASE_URL");
  });

  it("crashes if SESSION_SECRET is missing", async () => {
    process.env.DATABASE_URL = "postgres://localhost/test";
    delete process.env.SESSION_SECRET;
    await expect(() => import("../server/config")).rejects.toThrow("SESSION_SECRET");
  });

  it("loads successfully with required vars set", async () => {
    process.env.DATABASE_URL = "postgres://localhost/test";
    process.env.SESSION_SECRET = "my-secret-key";
    const { config } = await import("../server/config");
    expect(config.databaseUrl).toBe("postgres://localhost/test");
    expect(config.sessionSecret).toBe("my-secret-key");
  });

  it("uses default port 5000 when PORT is not set", async () => {
    process.env.DATABASE_URL = "postgres://localhost/test";
    process.env.SESSION_SECRET = "my-secret-key";
    delete process.env.PORT;
    const { config } = await import("../server/config");
    expect(config.port).toBe(5000);
  });

  it("reads PORT from env when set", async () => {
    process.env.DATABASE_URL = "postgres://localhost/test";
    process.env.SESSION_SECRET = "my-secret-key";
    process.env.PORT = "3000";
    const { config } = await import("../server/config");
    expect(config.port).toBe(3000);
  });

  it("sets optional values to null when not provided", async () => {
    process.env.DATABASE_URL = "postgres://localhost/test";
    process.env.SESSION_SECRET = "my-secret-key";
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.STRIPE_SECRET_KEY;
    const { config } = await import("../server/config");
    expect(config.googleClientId).toBeNull();
    expect(config.stripeSecretKey).toBeNull();
  });

  it("never exposes a hardcoded session secret fallback", async () => {
    process.env.DATABASE_URL = "postgres://localhost/test";
    process.env.SESSION_SECRET = "my-secret";
    const { config } = await import("../server/config");
    expect(config.sessionSecret).not.toBe("top-ranker-secret-key");
  });
});
