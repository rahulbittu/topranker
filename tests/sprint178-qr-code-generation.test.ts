/**
 * Sprint 178 — QR Code Generation for Businesses
 *
 * Validates:
 * 1. QR code generation endpoint returns correct data
 * 2. QR scan recording endpoint
 * 3. QR stats endpoint with access control
 * 4. QR storage functions
 * 5. Route registration
 * 6. Schema has qrScans table
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. QR code generation endpoint
// ---------------------------------------------------------------------------
describe("QR code generation — routes-qr.ts", () => {
  const qrRoutesSrc = readFile("server/routes-qr.ts");

  it("exports registerQrRoutes", () => {
    expect(qrRoutesSrc).toContain("export function registerQrRoutes");
  });

  it("has QR data endpoint for business", () => {
    expect(qrRoutesSrc).toContain('"/api/businesses/:slug/qr"');
  });

  it("generates rate URL with QR source", () => {
    expect(qrRoutesSrc).toContain("source=qr");
  });

  it("returns QR styling configuration", () => {
    expect(qrRoutesSrc).toContain("qrConfig");
    expect(qrRoutesSrc).toContain("dotsOptions");
    expect(qrRoutesSrc).toContain("cornersSquareOptions");
    expect(qrRoutesSrc).toContain("#0D1B2A"); // Navy
    expect(qrRoutesSrc).toContain("#C49A1A"); // Amber
  });

  it("returns print template data", () => {
    expect(qrRoutesSrc).toContain("printTemplate");
    expect(qrRoutesSrc).toContain("headline");
    expect(qrRoutesSrc).toContain("Scan to rate on TopRanker");
  });

  it("returns business metadata", () => {
    expect(qrRoutesSrc).toContain("businessName");
    expect(qrRoutesSrc).toContain("businessSlug");
  });
});

// ---------------------------------------------------------------------------
// 2. QR scan recording
// ---------------------------------------------------------------------------
describe("QR scan recording endpoint", () => {
  const qrRoutesSrc = readFile("server/routes-qr.ts");

  it("has POST /api/qr/scan endpoint", () => {
    expect(qrRoutesSrc).toContain('"/api/qr/scan"');
  });

  it("requires businessId in body", () => {
    expect(qrRoutesSrc).toContain("businessId is required");
  });

  it("records scan via storage", () => {
    expect(qrRoutesSrc).toContain("recordQrScan");
  });

  it("handles anonymous and authenticated scans", () => {
    expect(qrRoutesSrc).toContain("req.user?.id || null");
  });

  it("returns scan ID and business info", () => {
    expect(qrRoutesSrc).toContain("scanId:");
    expect(qrRoutesSrc).toContain("businessSlug:");
  });
});

// ---------------------------------------------------------------------------
// 3. QR stats endpoint
// ---------------------------------------------------------------------------
describe("QR stats endpoint — access control", () => {
  const qrRoutesSrc = readFile("server/routes-qr.ts");

  it("has GET /api/businesses/:slug/qr-stats", () => {
    expect(qrRoutesSrc).toContain('"/api/businesses/:slug/qr-stats"');
  });

  it("requires authentication", () => {
    expect(qrRoutesSrc).toContain("requireAuth");
  });

  it("requires business ownership or admin", () => {
    expect(qrRoutesSrc).toContain("QR stats require business ownership");
    expect(qrRoutesSrc).toContain("isAdminEmail");
  });

  it("returns stats from storage", () => {
    expect(qrRoutesSrc).toContain("getQrScanStats");
  });
});

// ---------------------------------------------------------------------------
// 4. QR storage functions
// ---------------------------------------------------------------------------
describe("QR storage — qr.ts", () => {
  const qrStorageSrc = readFile("server/storage/qr.ts");

  it("exports recordQrScan", () => {
    expect(qrStorageSrc).toContain("export async function recordQrScan");
  });

  it("exports getQrScanStats", () => {
    expect(qrStorageSrc).toContain("export async function getQrScanStats");
  });

  it("exports markQrScanConverted", () => {
    expect(qrStorageSrc).toContain("export async function markQrScanConverted");
  });

  it("stats include totalScans", () => {
    expect(qrStorageSrc).toContain("totalScans");
  });

  it("stats include uniqueMembers", () => {
    expect(qrStorageSrc).toContain("uniqueMembers");
    expect(qrStorageSrc).toContain("count(distinct");
  });

  it("stats include conversions and rate", () => {
    expect(qrStorageSrc).toContain("conversions");
    expect(qrStorageSrc).toContain("conversionRate");
  });

  it("stats include time-windowed counts", () => {
    expect(qrStorageSrc).toContain("last7Days");
    expect(qrStorageSrc).toContain("last30Days");
  });

  it("markQrScanConverted updates converted flag", () => {
    expect(qrStorageSrc).toContain("converted: true");
  });
});

// ---------------------------------------------------------------------------
// 5. Storage barrel exports
// ---------------------------------------------------------------------------
describe("storage barrel — QR exports", () => {
  const indexSrc = readFile("server/storage/index.ts");

  it("exports QR functions", () => {
    expect(indexSrc).toContain("recordQrScan");
    expect(indexSrc).toContain("getQrScanStats");
    expect(indexSrc).toContain("markQrScanConverted");
  });
});

// ---------------------------------------------------------------------------
// 6. Route registration
// ---------------------------------------------------------------------------
describe("QR routes — registration", () => {
  const routesSrc = readFile("server/routes.ts");

  it("imports registerQrRoutes", () => {
    expect(routesSrc).toContain("registerQrRoutes");
    expect(routesSrc).toContain("./routes-qr");
  });

  it("registers QR routes", () => {
    expect(routesSrc).toContain("registerQrRoutes(app)");
  });
});

// ---------------------------------------------------------------------------
// 7. Schema — qrScans table
// ---------------------------------------------------------------------------
describe("schema — qrScans table", () => {
  const schemaSrc = readFile("shared/schema.ts");

  it("has qrScans table", () => {
    expect(schemaSrc).toContain("qr_scans");
    expect(schemaSrc).toContain("qrScans");
  });

  it("has businessId field", () => {
    expect(schemaSrc).toContain("businessId:");
  });

  it("has memberId field (nullable)", () => {
    expect(schemaSrc).toContain("memberId:");
  });

  it("has converted flag", () => {
    expect(schemaSrc).toContain("converted:");
  });

  it("has scannedAt timestamp", () => {
    expect(schemaSrc).toContain("scannedAt:");
  });
});

// ---------------------------------------------------------------------------
// 8. Rating submission references QR source
// ---------------------------------------------------------------------------
describe("rating submission — QR source tracking", () => {
  const ratingsSrc = readFile("server/storage/ratings.ts");

  it("checks for qrScanId in rating data", () => {
    expect(ratingsSrc).toContain("data.qrScanId");
  });

  it("sets source to qr_scan when present", () => {
    expect(ratingsSrc).toContain('"qr_scan"');
  });
});
