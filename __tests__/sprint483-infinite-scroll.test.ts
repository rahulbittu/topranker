/**
 * Sprint 483: Infinite Scroll for Search Results
 *
 * Tests:
 * 1. useInfiniteSearch hook structure
 * 2. InfiniteScrollFooter component structure
 * 3. Search screen integration
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Sprint 483: Infinite Scroll Search", () => {
  describe("useInfiniteSearch hook", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../lib/hooks/useInfiniteSearch.ts"),
      "utf-8"
    );

    it("exports useInfiniteSearch function", () => {
      expect(src).toContain("export function useInfiniteSearch");
    });

    it("imports useInfiniteQuery from @tanstack/react-query", () => {
      expect(src).toContain('import { useInfiniteQuery } from "@tanstack/react-query"');
    });

    it("imports fetchBusinessSearchPaginated from api", () => {
      expect(src).toContain("fetchBusinessSearchPaginated");
    });

    it("defines PAGE_SIZE constant", () => {
      expect(src).toContain("PAGE_SIZE = 20");
    });

    it("uses initialPageParam of 0", () => {
      expect(src).toContain("initialPageParam: 0");
    });

    it("computes getNextPageParam from pagination.hasMore", () => {
      expect(src).toContain("getNextPageParam");
      expect(src).toContain("lastPage.pagination.hasMore");
      expect(src).toContain("lastPage.pagination.offset + lastPage.pagination.limit");
    });

    it("flattens pages into single businesses array", () => {
      expect(src).toContain("data?.pages.flatMap(page => page.businesses)");
    });

    it("returns totalCount from first page", () => {
      expect(src).toContain("data?.pages[0]?.pagination.total");
    });

    it("exports UseInfiniteSearchResult interface", () => {
      expect(src).toContain("export interface UseInfiniteSearchResult");
      expect(src).toContain("isFetchingNextPage: boolean");
      expect(src).toContain("hasNextPage: boolean");
      expect(src).toContain("fetchNextPage:");
      expect(src).toContain("totalCount: number");
    });

    it("exports InfiniteSearchOpts interface", () => {
      expect(src).toContain("export interface InfiniteSearchOpts");
    });
  });

  describe("InfiniteScrollFooter component", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../components/search/InfiniteScrollFooter.tsx"),
      "utf-8"
    );

    it("exports InfiniteScrollFooter function component", () => {
      expect(src).toContain("export function InfiniteScrollFooter");
    });

    it("exports InfiniteScrollFooterProps interface", () => {
      expect(src).toContain("export interface InfiniteScrollFooterProps");
    });

    it("shows ActivityIndicator when fetching next page", () => {
      expect(src).toContain("ActivityIndicator");
      expect(src).toContain("isFetchingNextPage");
      expect(src).toContain("Loading more results");
    });

    it("shows end of results when no more pages", () => {
      expect(src).toContain("!hasNextPage");
      expect(src).toContain("End of results");
    });

    it("shows total count in end message", () => {
      expect(src).toContain("All ${totalCount} results loaded");
    });

    it("returns null when no data to show", () => {
      expect(src).toContain("return null");
    });
  });

  describe("Search screen integration", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, '../app/(tabs)/search.tsx'),
      "utf-8"
    );

    it("imports useInfiniteSearch hook", () => {
      expect(src).toContain('import { useInfiniteSearch } from "@/lib/hooks/useInfiniteSearch"');
    });

    it("imports InfiniteScrollFooter component", () => {
      expect(src).toContain('import { InfiniteScrollFooter } from "@/components/search/InfiniteScrollFooter"');
    });

    it("uses useInfiniteSearch instead of basic useQuery for search", () => {
      expect(src).toContain("useInfiniteSearch(debouncedQuery, city, selectedCuisine, searchOpts)");
    });

    it("destructures infinite query state", () => {
      expect(src).toContain("isFetchingNextPage");
      expect(src).toContain("hasNextPage");
      expect(src).toContain("fetchNextPage");
      expect(src).toContain("totalCount");
    });

    it("has handleLoadMore callback", () => {
      expect(src).toContain("handleLoadMore");
      expect(src).toContain("hasNextPage && !isFetchingNextPage");
    });

    it("FlatList has onEndReached for infinite scroll", () => {
      expect(src).toContain("onEndReached={handleLoadMore}");
      expect(src).toContain("onEndReachedThreshold={0.5}");
    });

    it("FlatList has ListFooterComponent with InfiniteScrollFooter", () => {
      expect(src).toContain("<InfiniteScrollFooter");
      expect(src).toContain("isFetchingNextPage={isFetchingNextPage}");
      expect(src).toContain("hasNextPage={hasNextPage}");
    });
  });
});
