import { useEffect, useMemo, useCallback } from "react";
import { Platform, Share } from "react-native";
import * as Haptics from "expo-haptics";
import { Analytics } from "@/lib/analytics";
import { buildSearchUrl, encodeSearchParams, type SearchFilterState } from "@/lib/search-url-params";
import { copyShareLink, getSearchShareText, SHARE_BASE_URL } from "@/lib/sharing";
import type { DietaryTag, DistanceOption, HoursFilter } from "@/components/search/DiscoverFilters";

interface UseSearchActionsParams {
  selectedCuisine: string | null;
  dietaryTags: DietaryTag[];
  distanceFilter: DistanceOption;
  hoursFilters: HoursFilter[];
  priceFilter: string | null;
  sortBy: string;
  activeFilter: string;
  debouncedQuery: string;
  query: string;
  city: string;
  resultCount: number;
  urlParamsRead: React.MutableRefObject<boolean>;
}

export function useSearchActions({
  selectedCuisine, dietaryTags, distanceFilter, hoursFilters, priceFilter, sortBy, activeFilter,
  debouncedQuery, query, city, resultCount, urlParamsRead,
}: UseSearchActionsParams) {
  const currentFilters = useMemo((): SearchFilterState => ({
    cuisine: selectedCuisine || undefined,
    dietary: dietaryTags.length > 0 ? dietaryTags : undefined,
    distance: distanceFilter,
    hours: hoursFilters.length > 0 ? hoursFilters : undefined,
    price: priceFilter || undefined,
    sort: sortBy,
    filter: activeFilter !== "All" ? activeFilter : undefined,
  }), [selectedCuisine, dietaryTags, distanceFilter, hoursFilters, priceFilter, sortBy, activeFilter]);

  // Sprint 647: Sync filter state to URL for browser back/forward + bookmarkable searches
  useEffect(() => {
    if (Platform.OS !== "web" || !urlParamsRead.current) return;
    const params = encodeSearchParams({ ...currentFilters, query: debouncedQuery || undefined });
    const qs = Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
    const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    if (window.location.search !== (qs ? `?${qs}` : "")) {
      window.history.replaceState(null, "", newUrl);
    }
  }, [debouncedQuery, currentFilters]);

  // Sprint 644/646: Share search results — native share sheet with clipboard fallback
  const handleShareSearch = useCallback(async () => {
    Haptics.selectionAsync();
    const url = buildSearchUrl(`${SHARE_BASE_URL}/search`, currentFilters);
    const text = getSearchShareText(query, city, resultCount, url);
    Analytics.searchShare(query, city, resultCount);
    try {
      await Share.share({ message: text, url });
    } catch {
      await copyShareLink(url, "Search results");
    }
  }, [query, city, resultCount, currentFilters]);

  return { currentFilters, handleShareSearch };
}
