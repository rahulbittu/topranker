import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Analytics } from "@/lib/analytics";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Platform, RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import * as Haptics from "expo-haptics";
import { fetchBusinessSearch, fetchTrending, fetchJustRated, fetchAutocomplete, fetchPopularCategories, fetchPopularQueries, trackSearchQuery as trackQuery, type AutocompleteSuggestion } from "@/lib/api";
import { useInfiniteSearch } from "@/lib/hooks/useInfiniteSearch";
import { useSearchActions } from "@/lib/hooks/useSearchActions";
import { InfiniteScrollFooter } from "@/components/search/InfiniteScrollFooter";
import { DiscoverSkeleton, SkeletonToContent } from "@/components/Skeleton";
import { SearchResultsSkeleton } from "@/components/search/SearchResultsSkeleton";

import * as Location from "expo-location";
import { usePersistedSort, usePersistedCuisine, usePersistedFilter, usePersistedPrice, usePersistedViewMode, useRecentSearches, useDiscoverTip } from "@/lib/hooks/useSearchPersistence";
import { useCity, SUPPORTED_CITIES } from "@/lib/city-context";
import { TYPOGRAPHY } from "@/constants/typography";
import { MappedBusiness } from "@/types/business";
import { type FeaturedBusiness } from "@/components/FeaturedCard";
import { getApiUrl } from "@/lib/query-client";
import { BusinessCard, haversineKm } from "@/components/search/SubComponents";
import { SearchMapSplitView } from "@/components/search/SearchMapSplitView";
import { AutocompleteDropdown, RecentSearchesPanel, PopularQueriesPanel } from "@/components/search/SearchOverlays";
import { FilterChips, PriceChips, SortChips, SortResultsHeader, DietaryTagChips, DistanceChips, HoursFilterChips, type DietaryTag, type DistanceOption, type HoursFilter } from "@/components/search/DiscoverFilters";
import { DiscoverEmptyState } from "@/components/search/DiscoverEmptyState";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorState } from "@/components/NetworkBanner";
import { decodeSearchParams } from "@/lib/search-url-params";
import { formatTimeAgo } from "@/lib/data";
import { PresetChips } from "@/components/search/PresetChips";
import { DiscoverSections } from "@/components/search/DiscoverSections";
import type { FilterPreset } from "@/lib/search-filter-presets";

const AMBER = BRAND.colors.amber;

export default function SearchScreen() {

  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const { activeFilter, setActiveFilter } = usePersistedFilter();
  const { city, setCity } = useCity();
  const [showCityPicker, setShowCityPicker] = useState(false);
  const { viewMode, setViewMode } = usePersistedViewMode();
  const { priceFilter, setPriceFilter } = usePersistedPrice();
  const { sortBy, setSortBy } = usePersistedSort();
  const { selectedCuisine, setSelectedCuisine } = usePersistedCuisine();
  const { recentSearches, saveRecentSearch, clearRecentSearches } = useRecentSearches();
  const { showDiscoverTip, dismissDiscoverTip } = useDiscoverTip();
  const [selectedMapBiz, setSelectedMapBiz] = useState<MappedBusiness | null>(null);
  const [mapSearchCenter, setMapSearchCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [autocompleteResults, setAutocompleteResults] = useState<AutocompleteSuggestion[]>([]);
  const [dietaryTags, setDietaryTags] = useState<DietaryTag[]>([]);
  const [distanceFilter, setDistanceFilter] = useState<DistanceOption>(null);
  const [hoursFilters, setHoursFilters] = useState<HoursFilter[]>([]);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  const urlParams = useLocalSearchParams();
  const urlParamsRead = useRef(false);
  useEffect(() => {
    if (urlParamsRead.current) return;
    urlParamsRead.current = true;
    const decoded = decodeSearchParams(urlParams);
    if (decoded.query) setQuery(decoded.query);
    if (decoded.cuisine) setSelectedCuisine(decoded.cuisine);
    if (decoded.dietary?.length) setDietaryTags(decoded.dietary);
    if (decoded.distance) setDistanceFilter(decoded.distance);
    if (decoded.hours?.length) setHoursFilters(decoded.hours);
    if (decoded.price) setPriceFilter(decoded.price);
    if (decoded.sort) setSortBy(decoded.sort);
    if (decoded.filter) setActiveFilter(decoded.filter as any);
  }, []);

  // Autocomplete: fast 150ms debounce for typeahead
  useEffect(() => {
    if (query.trim().length < 2) {
      setAutocompleteResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const results = await fetchAutocomplete(query, city);
        setAutocompleteResults(results);
      } catch {
        setAutocompleteResults([]);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [query, city]);

  // Full search: 300ms debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const searchOpts = {
    dietary: dietaryTags.length > 0 ? dietaryTags : undefined,
    lat: userLocation?.lat,
    lng: userLocation?.lng,
    maxDistance: distanceFilter || undefined,
    openNow: hoursFilters.includes("openNow") || undefined,
    openLate: hoursFilters.includes("openLate") || undefined,
    openWeekends: hoursFilters.includes("openWeekends") || undefined,
  };
  const {
    businesses: allBusinesses,
    isLoading, isError, refetch, isRefetching,
    isFetchingNextPage, hasNextPage, fetchNextPage, totalCount, dataUpdatedAt,
  } = useInfiniteSearch(debouncedQuery, city, selectedCuisine, searchOpts);
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Track search queries after debounce settles + save to recents
  useEffect(() => {
    if (debouncedQuery.length > 0) {
      Analytics.searchQuery(debouncedQuery, allBusinesses.length);
      saveRecentSearch(debouncedQuery);
      trackQuery(debouncedQuery, city); // Sprint 544: track for popular queries
      setSearchFocused(false); // hide autocomplete once search executes
    }
  }, [debouncedQuery, allBusinesses.length, saveRecentSearch]);

  const { data: popularQueries = [] } = useQuery({
    queryKey: ["popularQueries", city],
    queryFn: () => fetchPopularQueries(city, 6),
    staleTime: 60000,
  });

  const { data: trending = [] } = useQuery({
    queryKey: ["trending", city],
    queryFn: () => fetchTrending(city, 3),
    staleTime: 60000,
  });

  const { data: justRated = [] } = useQuery({
    queryKey: ["just-rated", city],
    queryFn: () => fetchJustRated(city, 5),
    staleTime: 60000,
  });

  const { data: popularCategories = [] } = useQuery({
    queryKey: ["popular-categories", city],
    queryFn: () => fetchPopularCategories(city),
    staleTime: 120000,
  });

  interface DishBoardInfo { slug: string; name: string; emoji: string; entryCount: number; }
  const { data: dishBoards = [] } = useQuery<DishBoardInfo[]>({
    queryKey: ["dish-boards-search", city],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/dish-leaderboards?city=${encodeURIComponent(city)}`);
      if (!res.ok) return [];
      const json = await res.json();
      return (json.data || []).map((b: any) => ({
        slug: b.dishSlug,
        name: b.dishName,
        emoji: b.dishEmoji || "🍽️",
        entryCount: b.entryCount || 0,
      }));
    },
    staleTime: 120000,
  });
  const dishEntryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const b of dishBoards) counts[b.slug] = b.entryCount;
    return counts;
  }, [dishBoards]);
  const dishSearchMatches = useMemo(() => {
    if (!query || query.trim().length < 2) return [];
    const q = query.toLowerCase().trim();
    return dishBoards.filter((b) => b.name.toLowerCase().includes(q) || b.slug.includes(q));
  }, [query, dishBoards]);

  const { data: featuredBusinesses = [] } = useQuery<FeaturedBusiness[]>({
    queryKey: ["featured", city],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/featured?city=${encodeURIComponent(city)}`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    },
    staleTime: 60000,
  });

  const onRefresh = useCallback(() => { Haptics.selectionAsync(); refetch(); }, [refetch]);

  const requestLocation = useCallback(async () => {
    if (userLocation) return;
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      }
    } catch { /* silently fail */ } finally {
      setLocationLoading(false);
    }
  }, [userLocation]);

  const handleApplyPreset = useCallback((preset: FilterPreset) => {
    const f = preset.filters;
    if (f.cuisine) setSelectedCuisine(f.cuisine); else setSelectedCuisine(null);
    if (f.dietary) setDietaryTags(f.dietary); else setDietaryTags([]);
    if (f.distance) setDistanceFilter(f.distance); else setDistanceFilter(null);
    if (f.hours) setHoursFilters(f.hours); else setHoursFilters([]);
    if (f.price) setPriceFilter(f.price); else setPriceFilter(null);
    if (f.sort) setSortBy(f.sort); else setSortBy("ranked");
    if (f.filter) setActiveFilter(f.filter as any); else setActiveFilter("All" as any);
    setActivePresetId(preset.id);
  }, []);

  const handleClearPreset = useCallback(() => {
    setSelectedCuisine(null);
    setDietaryTags([]);
    setDistanceFilter(null);
    setHoursFilters([]);
    setPriceFilter(null);
    setSortBy("ranked");
    setActiveFilter("All" as any);
    setActivePresetId(null);
  }, []);

  const filtered = useMemo(() => {
    let list = allBusinesses;
    if (activeFilter === "Top 10") list = list.filter((b: MappedBusiness) => b.rank <= 10);
    else if (activeFilter === "Challenging") list = list.filter((b: MappedBusiness) => b.isChallenger);
    else if (activeFilter === "Trending") list = list.filter((b: MappedBusiness) => b.rankDelta > 0);
    else if (activeFilter === "Open Now") list = list.filter((b: MappedBusiness) => b.isOpenNow === true);
    else if (activeFilter === "Near Me" && userLocation) {
      list = list.filter((b: MappedBusiness) => b.lat != null && b.lng != null);
      list = [...list].sort((a: MappedBusiness, b: MappedBusiness) => {
        const distA = haversineKm(userLocation.lat, userLocation.lng, a.lat!, a.lng!);
        const distB = haversineKm(userLocation.lat, userLocation.lng, b.lat!, b.lng!);
        return distA - distB;
      });
      if (priceFilter) list = list.filter((b: MappedBusiness) => b.priceRange === priceFilter);
      return list;
    }
    if (priceFilter) list = list.filter((b: MappedBusiness) => b.priceRange === priceFilter);
    // Sprint 421: Filter by map search area (5km radius from center)
    if (mapSearchCenter && viewMode === "map") {
      list = list.filter((b: MappedBusiness) =>
        b.lat != null && b.lng != null &&
        haversineKm(mapSearchCenter.lat, mapSearchCenter.lng, b.lat!, b.lng!) <= 5
      );
    }
    if (sortBy === "relevant") return list.sort((a: MappedBusiness, b: MappedBusiness) => (b.relevanceScore || 0) - (a.relevanceScore || 0) || b.weightedScore - a.weightedScore);
    if (sortBy === "ranked") return list.sort((a: MappedBusiness, b: MappedBusiness) => (a.rank || 999) - (b.rank || 999));
    if (sortBy === "rated") return list.sort((a: MappedBusiness, b: MappedBusiness) => (b.ratingCount || 0) - (a.ratingCount || 0));
    if (sortBy === "trending") return list.sort((a: MappedBusiness, b: MappedBusiness) => (b.rankDelta || 0) - (a.rankDelta || 0));
    return list.sort((a: MappedBusiness, b: MappedBusiness) => b.weightedScore - a.weightedScore);
  }, [allBusinesses, activeFilter, priceFilter, sortBy, userLocation, mapSearchCenter, viewMode]);

  // Sprint 651: Extracted URL sync + share to useSearchActions hook
  const { currentFilters, handleShareSearch } = useSearchActions({
    selectedCuisine, dietaryTags, distanceFilter, hoursFilters, priceFilter, sortBy, activeFilter,
    debouncedQuery, query, city, resultCount: filtered.length, urlParamsRead,
  });

  const topPad = Platform.OS === "web" ? 20 : insets.top;

  return (
    <ErrorBoundary>
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Discover</Text>
        <TouchableOpacity style={styles.cityButton} onPress={() => setShowCityPicker(!showCityPicker)} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel={`City: ${city}. Tap to change`}>
          <Ionicons name="location-sharp" size={12} color={AMBER} />
          <Text style={styles.cityButtonText}>{city}</Text>
          <Ionicons name="chevron-down" size={12} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {showCityPicker && (
        <View style={styles.cityPickerDropdown}>
          {SUPPORTED_CITIES.map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.cityOption, city === c && styles.cityOptionActive]}
              onPress={() => { setCity(c); setShowCityPicker(false); }}
            >
              <Text style={[styles.cityOptionText, city === c && styles.cityOptionTextActive]}>{c}</Text>
              {city === c && <Ionicons name="checkmark" size={13} color={AMBER} />}
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.searchBox}>
        <Ionicons name="search" size={15} color={Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Restaurants, neighborhoods, categories..."
          placeholderTextColor={Colors.textTertiary}
          value={query}
          onChangeText={(t) => { setQuery(t); setSearchFocused(true); if (t.length > 0) setSelectedCuisine(null); }}
          onFocus={() => setSearchFocused(true)}
          maxLength={100}
          accessibilityLabel="Search for restaurants, neighborhoods, or categories"
          returnKeyType="search"
          onSubmitEditing={() => setSearchFocused(false)}
        />
        {!!query && (
          <TouchableOpacity onPress={() => { setQuery(""); setAutocompleteResults([]); }} hitSlop={8} accessibilityRole="button" accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={15} color={Colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Sprint 193: Extracted to SearchOverlays component */}
      {searchFocused && query.length >= 2 && (
        <AutocompleteDropdown results={autocompleteResults} dishMatches={dishSearchMatches} query={query} onCuisineSelect={(cuisine) => { setSelectedCuisine(cuisine); setQuery(""); }} onDismiss={() => setSearchFocused(false)} />
      )}

      {searchFocused && query.length === 0 && (
        <>
        <RecentSearchesPanel
          searches={recentSearches}
          onSelect={(term) => { setQuery(term); setSearchFocused(false); }}
          onClear={clearRecentSearches}
        />
        <PopularQueriesPanel
          queries={popularQueries}
          onSelect={(term) => { setQuery(term); setSearchFocused(false); }}
          excludeQueries={recentSearches}
        />
        </>
      )}

      {/* Sprint 326: Only view toggle fixed; filters/price/sort scroll with content (DoorDash pattern) */}
      <View style={styles.viewToggleRow}>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.viewToggleBtn, viewMode === "list" && styles.viewToggleBtnActive]}
            onPress={() => { Haptics.selectionAsync(); setViewMode("list"); }}
            accessibilityRole="button"
            accessibilityLabel="List view"
            accessibilityState={{ selected: viewMode === "list" }}
          >
            <Ionicons name="list" size={16} color={viewMode === "list" ? "#fff" : Colors.textSecondary} />
            <Text style={[styles.viewToggleText, viewMode === "list" && styles.viewToggleTextActive]}>List</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggleBtn, viewMode === "map" && styles.viewToggleBtnActive]}
            onPress={() => { Haptics.selectionAsync(); setViewMode("map"); }}
            accessibilityRole="button"
            accessibilityLabel="Map view"
            accessibilityState={{ selected: viewMode === "map" }}
          >
            <Ionicons name="location" size={16} color={viewMode === "map" ? "#fff" : Colors.textSecondary} />
            <Text style={[styles.viewToggleText, viewMode === "map" && styles.viewToggleTextActive]}>Map</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <SearchResultsSkeleton />
      ) : isError ? (
        <ErrorState title="Could not load results" onRetry={() => refetch()} />
      ) : <SkeletonToContent visible={!isLoading}>{viewMode === "map" ? (
        /* Sprint 527: Map split view extracted */
        <SearchMapSplitView
          filtered={filtered}
          city={city}
          selectedMapBiz={selectedMapBiz}
          onSelectMapBiz={setSelectedMapBiz}
          onSearchArea={(lat, lng) => setMapSearchCenter({ lat, lng })}
          selectedCuisine={selectedCuisine}
          onClearCuisine={() => setSelectedCuisine(null)}
          query={query}
          activeFilter={activeFilter}
          popularCategories={popularCategories}
          onSearchCategory={(cat) => { setQuery(cat); setActiveFilter("All"); }}
          onCityChange={setCity}
          onClearFilter={() => setActiveFilter("All")}
          bottomInset={insets.bottom}
          onMyLocation={requestLocation}
          userLocation={userLocation}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item: MappedBusiness) => item.id}
          renderItem={({ item, index }: { item: MappedBusiness; index: number }) => (
            <BusinessCard
              item={item}
              displayRank={item.rank > 0 ? item.rank : 0}
              distanceKm={activeFilter === "Near Me" && userLocation && item.lat != null && item.lng != null ? haversineKm(userLocation.lat, userLocation.lng, item.lat, item.lng) : undefined}
            />
          )}
          contentContainerStyle={[
            styles.resultList,
            { paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 90 }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          initialNumToRender={8}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews={Platform.OS !== "web"}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            <InfiniteScrollFooter
              isFetchingNextPage={isFetchingNextPage}
              hasNextPage={hasNextPage}
              totalCount={totalCount}
              displayedCount={filtered.length}
            />
          }
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={AMBER} />
          }
          ListEmptyComponent={
            <DiscoverEmptyState
              variant="list"
              query={query}
              selectedCuisine={selectedCuisine}
              city={city}
              activeFilter={activeFilter}
              popularCategories={popularCategories}
              onClearCuisine={() => setSelectedCuisine(null)}
              onSearchCategory={(cat) => { setQuery(cat); setActiveFilter("All"); }}
              onCityChange={setCity}
              onClearFilter={() => setActiveFilter("All")}
            />
          }
          ListHeaderComponent={
            <>
              {/* Sprint 471: Filter preset chips */}
              <PresetChips
                activePresetId={activePresetId}
                onApplyPreset={handleApplyPreset}
                onClearPreset={handleClearPreset}
                currentFilters={currentFilters}
              />
              {/* Sprint 332: Filter/price/sort extracted to DiscoverFilters */}
              <FilterChips activeFilter={activeFilter} onFilterChange={setActiveFilter} locationLoading={locationLoading} onNearMe={requestLocation} />
              <PriceChips priceFilter={priceFilter} onPriceChange={setPriceFilter} />
              {/* Sprint 442: Dietary + distance filters */}
              <DietaryTagChips activeTags={dietaryTags} onTagToggle={(tag) => setDietaryTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])} />
              <DistanceChips activeDistance={distanceFilter} onDistanceChange={setDistanceFilter} hasLocation={!!userLocation} />
              {/* Sprint 447: Hours-based filters */}
              <HoursFilterChips activeFilters={hoursFilters} onFilterToggle={(f) => setHoursFilters(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])} />
              <SortChips sortBy={sortBy} onSortChange={setSortBy} showRelevant={!!debouncedQuery} />

              {/* Sprint 571: Discover sections extracted */}
              <DiscoverSections
                city={city}
                debouncedQuery={debouncedQuery}
                selectedCuisine={selectedCuisine}
                activeFilter={activeFilter}
                filteredCount={filtered.length}
                trending={trending}
                featuredBusinesses={featuredBusinesses}
                dishEntryCounts={dishEntryCounts}
                justRated={justRated}
                showDiscoverTip={showDiscoverTip}
                onDismissDiscoverTip={dismissDiscoverTip}
                onSetQuery={setQuery}
                onSetActiveFilter={setActiveFilter}
                onSetSelectedCuisine={setSelectedCuisine}
              />

              <SortResultsHeader count={filtered.length} sortBy={sortBy} activeFilter={activeFilter} onShare={handleShareSearch} />
            </>
          }
        />
      )}</SkeletonToContent>}
    </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 10,
  },
  title: { fontSize: 28, fontWeight: "700", color: Colors.text, fontFamily: "PlayfairDisplay_700Bold", letterSpacing: -0.5 },
  cityButton: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: Colors.surface, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: Colors.border,
  },
  cityButtonText: { fontSize: 13, fontWeight: "500", color: Colors.text, fontFamily: "DMSans_500Medium" },

  cityPickerDropdown: {
    marginHorizontal: 16, backgroundColor: Colors.background, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 8, overflow: "hidden",
  },
  cityOption: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 11,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  cityOptionActive: { backgroundColor: Colors.goldFaint },
  cityOptionText: { fontSize: 13, color: Colors.text, fontFamily: "DMSans_400Regular" },
  cityOptionTextActive: { color: AMBER, fontWeight: "600" },

  searchBox: {
    flexDirection: "row", alignItems: "center", marginHorizontal: 16,
    backgroundColor: Colors.surface, borderRadius: 12, paddingHorizontal: 12,
    paddingVertical: 10, gap: 8, marginBottom: 6,
    ...Colors.cardShadow,
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: { flex: 1, ...TYPOGRAPHY.ui.body, color: Colors.text },

  viewToggleRow: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16,
    paddingBottom: 6,
  },
  controlsRow: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16,
    paddingBottom: 6, gap: 10,
  },
  viewToggle: {
    flexDirection: "row", backgroundColor: Colors.surface, borderRadius: 8,
    overflow: "hidden", borderWidth: 1, borderColor: Colors.border,
  },
  viewToggleBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  viewToggleBtnActive: { backgroundColor: AMBER, borderRadius: 8 },
  viewToggleText: { fontSize: 13, fontWeight: "500", color: Colors.textSecondary, fontFamily: "DMSans_500Medium" },
  viewToggleTextActive: { color: "#fff" },

  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 },
  resultList: { paddingHorizontal: 16, gap: 8, paddingTop: 4 },
  resultsCount: { ...TYPOGRAPHY.ui.caption, color: Colors.textTertiary, paddingBottom: 4 },

});
