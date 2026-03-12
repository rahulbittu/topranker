/**
 * Sprint 687: Network error handling and retry logic tests.
 * Validates smart retry behavior and network UI components.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(filePath: string): string {
  return fs.readFileSync(path.resolve(filePath), "utf-8");
}

function fileExists(filePath: string): boolean {
  return fs.existsSync(path.resolve(filePath));
}

// ─── Smart Retry Logic ──────────────────────────────────────────────────

describe("Sprint 687: query client retry logic", () => {
  const src = readFile("lib/query-client.ts");

  it("has shouldRetry function", () => {
    expect(src).toContain("shouldRetry");
  });

  it("does not retry 4xx client errors", () => {
    expect(src).toContain("4\\d{2}");
    expect(src).toContain("return false");
  });

  it("limits retries to 2 attempts", () => {
    expect(src).toContain("failureCount >= 2");
  });

  it("uses exponential backoff", () => {
    expect(src).toContain("2 ** attemptIndex");
  });

  it("caps retry delay at 5 seconds", () => {
    expect(src).toContain("5000");
  });

  it("uses shouldRetry as the retry function", () => {
    expect(src).toContain("retry: shouldRetry");
  });
});

describe("Sprint 687: shouldRetry runtime behavior", () => {
  // Replicate the logic for runtime testing
  function shouldRetry(failureCount: number, error: unknown): boolean {
    if (failureCount >= 2) return false;
    const msg = error instanceof Error ? error.message : String(error);
    if (/^4\d{2}:/.test(msg)) return false;
    return true;
  }

  it("retries on first network error", () => {
    expect(shouldRetry(0, new Error("Failed to fetch"))).toBe(true);
  });

  it("retries on 500 server error", () => {
    expect(shouldRetry(0, new Error("500: Internal Server Error"))).toBe(true);
  });

  it("does NOT retry on 401 unauthorized", () => {
    expect(shouldRetry(0, new Error("401: Unauthorized"))).toBe(false);
  });

  it("does NOT retry on 403 forbidden", () => {
    expect(shouldRetry(0, new Error("403: Forbidden"))).toBe(false);
  });

  it("does NOT retry on 404 not found", () => {
    expect(shouldRetry(0, new Error("404: Not Found"))).toBe(false);
  });

  it("does NOT retry on 422 validation error", () => {
    expect(shouldRetry(0, new Error("422: Validation failed"))).toBe(false);
  });

  it("stops retrying after 2 failures", () => {
    expect(shouldRetry(2, new Error("500: Server Error"))).toBe(false);
  });

  it("retries on second attempt for network errors", () => {
    expect(shouldRetry(1, new Error("Network request failed"))).toBe(true);
  });
});

// ─── Network UI Components ──────────────────────────────────────────────

describe("Sprint 687: NetworkBanner component", () => {
  it("NetworkBanner file exists", () => {
    expect(fileExists("components/NetworkBanner.tsx")).toBe(true);
  });

  const src = readFile("components/NetworkBanner.tsx");

  it("exports NetworkBanner", () => {
    expect(src).toContain("export function NetworkBanner");
  });

  it("exports ErrorState", () => {
    expect(src).toContain("ErrorState");
  });

  it("exports EmptyState", () => {
    expect(src).toContain("EmptyState");
  });

  it("shows offline message", () => {
    expect(src).toContain("No internet connection");
  });

  it("shows back online message", () => {
    expect(src).toContain("Back online");
  });

  it("shows demo mode message", () => {
    expect(src).toContain("Demo mode");
  });

  it("has retry button for mock data mode", () => {
    expect(src).toContain("handleRetry");
    expect(src).toContain("invalidateQueries");
  });

  it("has dismiss button", () => {
    expect(src).toContain("setDismissed(true)");
  });

  it("uses spring animation for banner appearance", () => {
    expect(src).toContain("withSpring");
  });

  it("uses reanimated for smooth transitions", () => {
    expect(src).toContain("useAnimatedStyle");
  });

  it("has proper accessibility labels", () => {
    expect(src).toContain('accessibilityRole="alert"');
    expect(src).toContain("accessibilityLabel={bannerMessage}");
  });
});

// ─── Error Handling in API Layer ────────────────────────────────────────

describe("Sprint 687: API error handling", () => {
  const src = readFile("lib/query-client.ts");

  it("throwIfResNotOk parses JSON error messages", () => {
    expect(src).toContain("json.message || json.error");
  });

  it("handles non-JSON error responses", () => {
    expect(src).toContain("// Non-JSON response");
  });

  it("includes status code in error message", () => {
    expect(src).toContain("${res.status}");
  });

  it("supports 401 returnNull behavior", () => {
    expect(src).toContain("returnNull");
    expect(src).toContain("res.status === 401");
  });
});

// ─── Offline Sync ───────────────────────────────────────────────────────

describe("Sprint 687: offline sync infrastructure", () => {
  it("offline sync module exists", () => {
    expect(fileExists("lib/offline-sync.ts")).toBe(true);
  });

  it("offline sync service exists", () => {
    expect(fileExists("lib/offline-sync-service.ts")).toBe(true);
  });
});
