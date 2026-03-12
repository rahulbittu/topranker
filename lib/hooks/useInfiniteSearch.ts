/**
 * Sprint 483: Infinite Scroll Search Hook
 *
 * Custom hook wrapping useInfiniteQuery for paginated search results.
 * Returns businesses, pagination state, and load-more handler for
 * FlatList onEndReached integration.
 */
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchBusinessSearchPaginated } from "@/lib/api";
import type { MappedBusiness } from "@/types/business";

const PAGE_SIZE = 20;

export interface InfiniteSearchOpts {
  dietary?: string[];
  lat?: number;
  lng?: number;
  maxDistance?: number;
  openNow?: boolean;
  openLate?: boolean;
  openWeekends?: boolean;
}

export interface UseInfiniteSearchResult {
  businesses: MappedBusiness[];
  isLoading: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
  isRefetching: boolean;
  totalCount: number;
}

export function useInfiniteSearch(
  query: string,
  city: string,
  cuisine: string | null,
  opts: InfiniteSearchOpts = {},
  enabled: boolean = true,
): UseInfiniteSearchResult {
  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
    dataUpdatedAt,
  } = useInfiniteQuery({
    queryKey: [
      "infinite-search", city, query, cuisine,
      opts.dietary, opts.maxDistance, opts.openNow, opts.openLate, opts.openWeekends,
      opts.lat, opts.lng,
    ],
    queryFn: async ({ pageParam = 0 }) => {
      return fetchBusinessSearchPaginated(
        query, city, undefined, cuisine || undefined,
        {
          ...opts,
          limit: PAGE_SIZE,
          offset: pageParam as number,
        },
      );
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasMore) {
        return lastPage.pagination.offset + lastPage.pagination.limit;
      }
      return undefined;
    },
    staleTime: 30000,
    enabled,
  });

  // Flatten all pages into a single business array
  const businesses = data?.pages.flatMap(page => page.businesses) ?? [];
  const totalCount = data?.pages[0]?.pagination.total ?? 0;

  return {
    businesses,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage: hasNextPage ?? false,
    fetchNextPage,
    refetch,
    isRefetching,
    totalCount,
    dataUpdatedAt,
  };
}
