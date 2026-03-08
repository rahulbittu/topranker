import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// ── Sentry Abstraction Layer ─────────────────────────────────────────
describe("Sprint 122 — Sentry Abstraction Layer", () => {
  const sentryPath = path.resolve(__dirname, "..", "lib", "sentry.ts");

  it("lib/sentry.ts exists", () => {
    expect(fs.existsSync(sentryPath)).toBe(true);
  });

  const source = fs.readFileSync(sentryPath, "utf-8");

  it("exports SentryConfig interface", () => {
    expect(source).toContain("export interface SentryConfig");
  });

  it("SentryConfig has dsn field", () => {
    expect(source).toContain("dsn: string");
  });

  it("SentryConfig has environment field", () => {
    expect(source).toContain("environment: string");
  });

  it("SentryConfig has release field", () => {
    expect(source).toContain("release: string");
  });

  it("SentryConfig has tracesSampleRate field", () => {
    expect(source).toContain("tracesSampleRate: number");
  });

  it("exports initSentry function", () => {
    expect(source).toContain("export function initSentry");
  });

  it("exports captureException function", () => {
    expect(source).toContain("export function captureException");
  });

  it("exports captureMessage function", () => {
    expect(source).toContain("export function captureMessage");
  });

  it("captureMessage supports info/warning/error levels", () => {
    expect(source).toContain('"info"');
    expect(source).toContain('"warning"');
    expect(source).toContain('"error"');
  });

  it("exports setUser function", () => {
    expect(source).toContain("export function setUser");
  });

  it("exports addBreadcrumb function", () => {
    expect(source).toContain("export function addBreadcrumb");
  });

  it("exports isInitialized function", () => {
    expect(source).toContain("export function isInitialized");
  });

  it("contains replacement comment for @sentry/react-native", () => {
    expect(source).toContain("@sentry/react-native");
  });

  it("logs [Sentry] Captured: when initialized", () => {
    expect(source).toContain("[Sentry] Captured:");
  });

  it("falls back to console.error when not initialized", () => {
    expect(source).toContain("console.error");
  });
});

// ── Error Reporting Sentry Integration ───────────────────────────────
describe("Sprint 122 — Error Reporting Sentry Integration", () => {
  const errorReportingPath = path.resolve(__dirname, "..", "lib", "error-reporting.ts");

  it("lib/error-reporting.ts exists", () => {
    expect(fs.existsSync(errorReportingPath)).toBe(true);
  });

  const source = fs.readFileSync(errorReportingPath, "utf-8");

  it("imports from ./sentry", () => {
    expect(source).toContain('from "./sentry"');
  });

  it("imports captureException from sentry", () => {
    expect(source).toContain("captureException");
  });

  it("imports isInitialized from sentry", () => {
    expect(source).toContain("isInitialized");
  });

  it("checks isInitialized() before calling captureException", () => {
    expect(source).toContain("isInitialized()");
  });

  it("keeps console.error as fallback", () => {
    expect(source).toContain("console.error");
  });

  it("routes component crash to Sentry when initialized", () => {
    const crashSection = source.substring(source.indexOf("reportComponentCrash"));
    expect(crashSection).toContain("captureException");
  });
});

// ── Admin Dashboard Data Fetching ────────────────────────────────────
describe("Sprint 122 — Admin Dashboard Data Fetching", () => {
  const dashPath = path.resolve(__dirname, "..", "app", "admin", "dashboard.tsx");

  it("app/admin/dashboard.tsx exists", () => {
    expect(fs.existsSync(dashPath)).toBe(true);
  });

  const source = fs.readFileSync(dashPath, "utf-8");

  it("imports getApiUrl from query-client", () => {
    expect(source).toContain("getApiUrl");
  });

  it("fetches from /api/admin/analytics/dashboard endpoint", () => {
    expect(source).toContain("/api/admin/analytics/dashboard");
  });

  it("contains useDashboardData hook", () => {
    expect(source).toContain("useDashboardData");
  });

  it("contains fetchDashboard function", () => {
    expect(source).toContain("fetchDashboard");
  });

  it("imports ActivityIndicator", () => {
    expect(source).toContain("ActivityIndicator");
  });

  it("renders ActivityIndicator while loading", () => {
    expect(source).toContain("<ActivityIndicator");
  });

  it("displays totalEvents from API data", () => {
    expect(source).toContain("totalEvents");
  });

  it("displays signupRate from funnel data", () => {
    expect(source).toContain("signupRate");
  });

  it("displays ratingRate from funnel data", () => {
    expect(source).toContain("ratingRate");
  });

  it("uses credentials include for auth", () => {
    expect(source).toContain('credentials: "include"');
  });

  it("manages loading state", () => {
    expect(source).toContain("setLoading");
  });
});

// ── Offline Sync Persistence ─────────────────────────────────────────
describe("Sprint 122 — Offline Sync Persistence", () => {
  const syncPath = path.resolve(__dirname, "..", "lib", "offline-sync.ts");

  it("lib/offline-sync.ts exists", () => {
    expect(fs.existsSync(syncPath)).toBe(true);
  });

  const source = fs.readFileSync(syncPath, "utf-8");

  it("exports persistQueue function", () => {
    expect(source).toContain("export async function persistQueue");
  });

  it("exports loadQueue function", () => {
    expect(source).toContain("export async function loadQueue");
  });

  it("imports AsyncStorage", () => {
    expect(source).toContain("AsyncStorage");
  });

  it("imports from @react-native-async-storage/async-storage", () => {
    expect(source).toContain("@react-native-async-storage/async-storage");
  });

  it("uses topranker_sync_queue storage key", () => {
    expect(source).toContain("topranker_sync_queue");
  });

  it("persistQueue serializes to JSON", () => {
    expect(source).toContain("JSON.stringify");
  });

  it("loadQueue parses from JSON", () => {
    expect(source).toContain("JSON.parse");
  });

  it("persistQueue calls AsyncStorage.setItem", () => {
    expect(source).toContain("AsyncStorage.setItem");
  });

  it("loadQueue calls AsyncStorage.getItem", () => {
    expect(source).toContain("AsyncStorage.getItem");
  });
});
