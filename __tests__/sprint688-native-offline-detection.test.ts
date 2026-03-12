/**
 * Sprint 688: Native offline detection via NetInfo + NetworkBanner integration.
 * Validates NetInfo wiring and cross-platform connectivity handling.
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

// ─── NetInfo Integration ────────────────────────────────────────────────

describe("Sprint 688: NetInfo package", () => {
  const pkg = readFile("package.json");

  it("@react-native-community/netinfo is installed", () => {
    expect(pkg).toContain("@react-native-community/netinfo");
  });
});

describe("Sprint 688: NetworkBanner native detection", () => {
  const src = readFile("components/NetworkBanner.tsx");

  it("imports NetInfo", () => {
    expect(src).toContain('import NetInfo from "@react-native-community/netinfo"');
  });

  it("uses NetInfo.addEventListener for native platforms", () => {
    expect(src).toContain("NetInfo.addEventListener");
  });

  it("checks isConnected state", () => {
    expect(src).toContain("state.isConnected");
  });

  it("checks isInternetReachable for deeper verification", () => {
    expect(src).toContain("state.isInternetReachable");
  });

  it("unsubscribes from NetInfo on cleanup", () => {
    expect(src).toContain("unsubscribe()");
  });

  it("still supports web navigator.onLine", () => {
    expect(src).toContain("navigator.onLine");
  });

  it("still has web online/offline event listeners", () => {
    expect(src).toContain('addEventListener("online"');
    expect(src).toContain('addEventListener("offline"');
  });

  it("platform-branches between web and native", () => {
    expect(src).toContain('Platform.OS === "web"');
  });

  it("shows back online transition for 3 seconds", () => {
    expect(src).toContain("3000");
    expect(src).toContain("setWasOffline(true)");
  });
});

// ─── NetworkBanner in Layout ────────────────────────────────────────────

describe("Sprint 688: NetworkBanner layout integration", () => {
  const layout = readFile("app/_layout.tsx");

  it("imports NetworkBanner in root layout", () => {
    expect(layout).toContain('import { NetworkBanner } from "@/components/NetworkBanner"');
  });

  it("renders NetworkBanner in the component tree", () => {
    expect(layout).toContain("<NetworkBanner />");
  });

  it("NetworkBanner is inside QueryClientProvider (required for invalidateQueries)", () => {
    const qcpIdx = layout.indexOf("QueryClientProvider");
    const bannerIdx = layout.indexOf("<NetworkBanner />");
    expect(qcpIdx).toBeLessThan(bannerIdx);
  });
});

// ─── ErrorState and EmptyState Exports ──────────────────────────────────

describe("Sprint 688: ErrorState and EmptyState components", () => {
  const src = readFile("components/NetworkBanner.tsx");

  it("ErrorState has default title", () => {
    expect(src).toContain("Something went wrong");
  });

  it("ErrorState has default subtitle", () => {
    expect(src).toContain("Check your connection and try again");
  });

  it("ErrorState accepts onRetry callback", () => {
    expect(src).toContain("onRetry");
  });

  it("EmptyState accepts title and subtitle", () => {
    expect(src).toContain("title: string");
    expect(src).toContain("subtitle?: string");
  });
});

// ─── Offline Sync Service ───────────────────────────────────────────────

describe("Sprint 688: offline sync initialization", () => {
  const layout = readFile("app/_layout.tsx");

  it("initializes sync service in root layout", () => {
    expect(layout).toContain("initSyncService");
  });

  it("imports from offline-sync-service", () => {
    expect(layout).toContain('import { initSyncService } from "@/lib/offline-sync-service"');
  });
});
