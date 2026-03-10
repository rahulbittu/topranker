/**
 * Sprint 473: Search Results Pagination
 *
 * Tests:
 * 1. Server: searchBusinesses accepts offset param
 * 2. Server: countBusinessSearch function exists
 * 3. Server: route accepts limit + offset query params
 * 4. Server: response includes pagination metadata
 * 5. Client: fetchBusinessSearch accepts limit/offset opts
 * 6. Client: fetchBusinessSearchPaginated returns pagination metadata
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Sprint 473: Search Results Pagination", () => {
  describe("Storage layer — searchBusinesses", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../server/storage/businesses.ts"),
      "utf-8"
    );

    it("searchBusinesses has offset parameter", () => {
      expect(src).toContain("offset: number = 0");
    });

    it("uses .offset() in query builder", () => {
      expect(src).toContain(".offset(offset)");
    });

    it("exports countBusinessSearch function", () => {
      expect(src).toContain("export async function countBusinessSearch");
    });

    it("countBusinessSearch uses count() aggregate", () => {
      expect(src).toContain("count()");
    });

    it("countBusinessSearch accepts query, city, category, cuisine", () => {
      const match = src.match(/countBusinessSearch\(\s*query.*city.*category.*cuisine/s);
      expect(match).not.toBeNull();
    });
  });

  describe("Storage index — exports", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../server/storage/index.ts"),
      "utf-8"
    );

    it("exports countBusinessSearch", () => {
      expect(src).toContain("countBusinessSearch");
    });
  });

  describe("Route layer — /api/businesses/search", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../server/routes-businesses.ts"),
      "utf-8"
    );

    it("imports countBusinessSearch from storage", () => {
      expect(src).toContain("countBusinessSearch");
    });

    it("parses limit query param with bounds (1-100)", () => {
      expect(src).toContain("parseInt(req.query.limit");
      expect(src).toContain("Math.min");
      expect(src).toContain("100");
    });

    it("parses offset query param with floor of 0", () => {
      expect(src).toContain("parseInt(req.query.offset");
      expect(src).toContain("Math.max");
    });

    it("passes pageLimit and pageOffset to searchBusinesses", () => {
      expect(src).toContain("searchBusinesses(query, city, category, pageLimit, cuisine, pageOffset)");
    });

    it("fetches totalCount in parallel with search", () => {
      expect(src).toContain("Promise.all");
      expect(src).toContain("countBusinessSearch(query, city, category, cuisine)");
    });

    it("returns pagination metadata in response", () => {
      expect(src).toContain("pagination:");
      expect(src).toContain("total: totalCount");
      expect(src).toContain("limit: pageLimit");
      expect(src).toContain("offset: pageOffset");
      expect(src).toContain("hasMore:");
    });

    it("hasMore is true when more results exist beyond current page", () => {
      expect(src).toContain("pageOffset + pageLimit < totalCount");
    });

    it("default limit is 20", () => {
      expect(src).toContain("|| 20");
    });
  });

  describe("Client API — fetchBusinessSearch", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../lib/api.ts"),
      "utf-8"
    );

    it("accepts limit option in fetchBusinessSearch", () => {
      expect(src).toContain("limit?: number");
    });

    it("accepts offset option in fetchBusinessSearch", () => {
      expect(src).toContain("offset?: number");
    });

    it("appends limit to URL when provided", () => {
      expect(src).toContain("&limit=${opts.limit}");
    });

    it("appends offset to URL when provided", () => {
      expect(src).toContain("&offset=${opts.offset}");
    });

    it("exports SearchPagination interface", () => {
      expect(src).toContain("export interface SearchPagination");
      expect(src).toContain("total: number");
      expect(src).toContain("hasMore: boolean");
    });

    it("exports fetchBusinessSearchPaginated function", () => {
      expect(src).toContain("export async function fetchBusinessSearchPaginated");
    });

    it("fetchBusinessSearchPaginated returns businesses and pagination", () => {
      expect(src).toContain("businesses:");
      expect(src).toContain("pagination: json.pagination");
    });
  });
});
