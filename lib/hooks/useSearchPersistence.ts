/**
 * Sprint 361: Extracted search persistence hooks from search.tsx
 * Manages AsyncStorage persistence for sort, cuisine, recent searches, and discover tip.
 */
import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type SortType = "ranked" | "rated" | "trending" | "relevant";

export function usePersistedSort(defaultSort: SortType = "ranked") {
  const [sortBy, setSortByRaw] = useState<SortType>(defaultSort);
  const setSortBy = useCallback((sort: SortType) => {
    setSortByRaw(sort);
    AsyncStorage.setItem("discover_sort", sort);
  }, []);

  useEffect(() => {
    AsyncStorage.getItem("discover_sort").then((val) => {
      if (val === "ranked" || val === "rated" || val === "trending" || val === "relevant") setSortByRaw(val);
    });
  }, []);

  return { sortBy, setSortBy };
}

export function usePersistedCuisine() {
  const [selectedCuisine, setSelectedCuisineRaw] = useState<string | null>(null);
  const setSelectedCuisine = useCallback((cuisine: string | null) => {
    setSelectedCuisineRaw(cuisine);
    if (cuisine) {
      AsyncStorage.setItem("discover_cuisine", cuisine);
    } else {
      AsyncStorage.removeItem("discover_cuisine");
    }
  }, []);

  useEffect(() => {
    AsyncStorage.getItem("discover_cuisine").then((val) => {
      if (val) setSelectedCuisineRaw(val);
    });
  }, []);

  return { selectedCuisine, setSelectedCuisine };
}

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem("recent_searches").then((val) => {
      if (val) try { setRecentSearches(JSON.parse(val)); } catch {}
    });
  }, []);

  const saveRecentSearch = useCallback((term: string) => {
    if (!term || term.trim().length < 2) return;
    setRecentSearches(prev => {
      const updated = [term, ...prev.filter(s => s.toLowerCase() !== term.toLowerCase())].slice(0, 8);
      AsyncStorage.setItem("recent_searches", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    AsyncStorage.removeItem("recent_searches");
  }, []);

  return { recentSearches, saveRecentSearch, clearRecentSearches };
}

type FilterType = "All" | "Top 10" | "Challenging" | "Trending" | "Open Now" | "Near Me";
const VALID_FILTERS: FilterType[] = ["All", "Top 10", "Challenging", "Trending", "Open Now", "Near Me"];

export function usePersistedFilter(defaultFilter: FilterType = "All") {
  const [activeFilter, setActiveFilterRaw] = useState<FilterType>(defaultFilter);
  const setActiveFilter = useCallback((filter: FilterType) => {
    setActiveFilterRaw(filter);
    AsyncStorage.setItem("discover_filter", filter);
  }, []);

  useEffect(() => {
    AsyncStorage.getItem("discover_filter").then((val) => {
      if (val && VALID_FILTERS.includes(val as FilterType)) setActiveFilterRaw(val as FilterType);
    });
  }, []);

  return { activeFilter, setActiveFilter };
}

export function usePersistedPrice() {
  const [priceFilter, setPriceFilterRaw] = useState<string | null>(null);
  const setPriceFilter = useCallback((price: string | null) => {
    setPriceFilterRaw(price);
    if (price) {
      AsyncStorage.setItem("discover_price", price);
    } else {
      AsyncStorage.removeItem("discover_price");
    }
  }, []);

  useEffect(() => {
    AsyncStorage.getItem("discover_price").then((val) => {
      if (val) setPriceFilterRaw(val);
    });
  }, []);

  return { priceFilter, setPriceFilter };
}

type ViewMode = "list" | "map";

export function usePersistedViewMode(defaultMode: ViewMode = "list") {
  const [viewMode, setViewModeRaw] = useState<ViewMode>(defaultMode);
  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeRaw(mode);
    AsyncStorage.setItem("discover_view_mode", mode);
  }, []);

  useEffect(() => {
    AsyncStorage.getItem("discover_view_mode").then((val) => {
      if (val === "list" || val === "map") setViewModeRaw(val);
    });
  }, []);

  return { viewMode, setViewMode };
}

export function useDiscoverTip() {
  const [showDiscoverTip, setShowDiscoverTip] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("discover_tip_dismissed").then((val) => {
      if (!val) setShowDiscoverTip(true);
    });
  }, []);

  const dismissDiscoverTip = useCallback(() => {
    AsyncStorage.setItem("discover_tip_dismissed", "true");
    setShowDiscoverTip(false);
  }, []);

  return { showDiscoverTip, dismissDiscoverTip };
}
