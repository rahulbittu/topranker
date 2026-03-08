/**
 * Unit Tests — Structured Logger (H5 Audit Fix)
 * Owner: Nina Petrov (Infrastructure)
 *
 * Tests the structured logging system that replaces raw console.log/error/warn.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { log } from "../server/logger";

describe("Structured Logger", () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs info messages with timestamp and level", () => {
    log.info("Server started");
    expect(consoleSpy).toHaveBeenCalledOnce();
    const output = consoleSpy.mock.calls[0][0] as string;
    expect(output).toContain("[INFO]");
    expect(output).toContain("[Server]");
    expect(output).toContain("Server started");
  });

  it("logs error messages to console.error", () => {
    log.error("Something broke");
    expect(errorSpy).toHaveBeenCalledOnce();
    const output = errorSpy.mock.calls[0][0] as string;
    expect(output).toContain("[ERROR]");
    expect(output).toContain("Something broke");
  });

  it("logs warn messages to console.warn", () => {
    log.warn("Deprecation notice");
    expect(warnSpy).toHaveBeenCalledOnce();
    const output = warnSpy.mock.calls[0][0] as string;
    expect(output).toContain("[WARN]");
  });

  it("includes ISO timestamp", () => {
    log.info("test");
    const output = consoleSpy.mock.calls[0][0] as string;
    // ISO format: 2026-03-07T...
    expect(output).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("creates tagged loggers", () => {
    const emailLog = log.tag("Email");
    emailLog.info("Sent welcome email");
    const output = consoleSpy.mock.calls[0][0] as string;
    expect(output).toContain("[Email]");
    expect(output).toContain("Sent welcome email");
  });

  it("serializes data objects in log output", () => {
    log.info("Request", { method: "GET", path: "/api/health" });
    const output = consoleSpy.mock.calls[0][0] as string;
    expect(output).toContain('"method":"GET"');
    expect(output).toContain('"path":"/api/health"');
  });

  it("handles string data directly", () => {
    log.info("User:", "john@example.com");
    const output = consoleSpy.mock.calls[0][0] as string;
    expect(output).toContain("john@example.com");
  });

  it("debug logs in non-production", () => {
    log.debug("verbose info");
    expect(consoleSpy).toHaveBeenCalledOnce();
    const output = consoleSpy.mock.calls[0][0] as string;
    expect(output).toContain("[DEBUG]");
  });
});
