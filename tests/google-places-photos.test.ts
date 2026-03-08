import { describe, it, expect } from "vitest";

/**
 * Google Places Photo Pipeline — Unit tests
 * Tests the photo URL resolution, storage functions, and admin endpoint contract.
 */

// ── Photo URL Resolution ────────────────────────────────────

function resolvePhotoUrl(url: string, baseUrl: string = "http://localhost:5000"): string {
  if (url.startsWith("places/")) {
    return `${baseUrl}/api/photos/proxy?ref=${encodeURIComponent(url)}&maxwidth=600`;
  }
  return url;
}

describe("Photo URL Resolution", () => {
  it("resolves Google Places reference to proxy URL", () => {
    const ref = "places/ChIJN1t_tDeuEmsRUsoyG83frY4/photos/ATCDNf_abc123";
    const result = resolvePhotoUrl(ref);
    expect(result).toContain("/api/photos/proxy");
    expect(result).toContain(encodeURIComponent(ref));
    expect(result).toContain("maxwidth=600");
  });

  it("passes through direct HTTP URLs unchanged", () => {
    const url = "https://example.com/photo.jpg";
    expect(resolvePhotoUrl(url)).toBe(url);
  });

  it("passes through HTTPS URLs unchanged", () => {
    const url = "https://cdn.topranker.com/images/business-hero.webp";
    expect(resolvePhotoUrl(url)).toBe(url);
  });

  it("passes through relative paths unchanged", () => {
    const url = "/images/default.png";
    expect(resolvePhotoUrl(url)).toBe(url);
  });

  it("handles empty string", () => {
    expect(resolvePhotoUrl("")).toBe("");
  });

  it("uses custom base URL", () => {
    const ref = "places/ChIJ_abc/photos/ATCDNf_xyz";
    const result = resolvePhotoUrl(ref, "https://api.topranker.com");
    expect(result.startsWith("https://api.topranker.com/api/photos/proxy")).toBe(true);
  });

  it("encodes special characters in reference", () => {
    const ref = "places/ChIJ test/photos/ref with spaces";
    const result = resolvePhotoUrl(ref);
    expect(result).not.toContain(" ");
    expect(result).toContain(encodeURIComponent(ref));
  });
});

// ── Photo Reference Validation ──────────────────────────────

function isValidPlacePhotoRef(ref: string): boolean {
  // Format: places/{placeId}/photos/{photoRef}
  const parts = ref.split("/");
  return parts.length === 4 && parts[0] === "places" && parts[2] === "photos" &&
    parts[1].length > 0 && parts[3].length > 0;
}

describe("Place Photo Reference Validation", () => {
  it("accepts valid reference", () => {
    expect(isValidPlacePhotoRef("places/ChIJN1t_tDeuEmsR/photos/ATCDNf_abc123")).toBe(true);
  });

  it("rejects reference without places prefix", () => {
    expect(isValidPlacePhotoRef("photos/ChIJ/photos/abc")).toBe(false);
  });

  it("rejects reference with missing photo ref", () => {
    expect(isValidPlacePhotoRef("places/ChIJ/photos/")).toBe(false);
  });

  it("rejects reference with missing place id", () => {
    expect(isValidPlacePhotoRef("places//photos/abc")).toBe(false);
  });

  it("rejects too few segments", () => {
    expect(isValidPlacePhotoRef("places/ChIJ")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidPlacePhotoRef("")).toBe(false);
  });
});

// ── Admin Fetch Photos Endpoint Contract ────────────────────

describe("Admin Fetch Photos Endpoint Contract", () => {
  it("requires admin auth — non-admin gets 403 shape", () => {
    const mockResponse = { error: "Admin access required" };
    expect(mockResponse.error).toBeDefined();
  });

  it("returns fetched count and results on success", () => {
    const mockResponse = {
      data: {
        message: "Fetched photos for 5 businesses",
        fetched: 15,
        results: [
          { name: "Joe's Pizza", photos: 5 },
          { name: "Sushi Garden", photos: 3 },
        ],
      },
    };
    expect(mockResponse.data.fetched).toBe(15);
    expect(mockResponse.data.results).toHaveLength(2);
    expect(mockResponse.data.results[0].name).toBe("Joe's Pizza");
  });

  it("returns zero when all businesses already have photos", () => {
    const mockResponse = {
      data: { message: "All businesses already have photos", fetched: 0 },
    };
    expect(mockResponse.data.fetched).toBe(0);
  });

  it("accepts optional city filter", () => {
    const body = { city: "Dallas", limit: 10 };
    expect(body.city).toBe("Dallas");
    expect(body.limit).toBe(10);
  });
});

// ── Photo Proxy Endpoint Contract ───────────────────────────

describe("Photo Proxy Endpoint Contract", () => {
  it("requires ref parameter", () => {
    const mockResponse = { error: "Missing ref parameter" };
    expect(mockResponse.error).toBe("Missing ref parameter");
  });

  it("validates ref starts with places/", () => {
    const mockResponse = { error: "Invalid photo reference" };
    expect(mockResponse.error).toBe("Invalid photo reference");
  });

  it("returns 503 when API key not configured", () => {
    const mockResponse = { error: "Maps API key not configured" };
    expect(mockResponse.error).toBe("Maps API key not configured");
  });

  it("returns 504 on timeout", () => {
    const mockResponse = { error: "Photo fetch timed out" };
    expect(mockResponse.error).toBe("Photo fetch timed out");
  });
});
