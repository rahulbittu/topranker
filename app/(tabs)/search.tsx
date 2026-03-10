import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Analytics } from "@/lib/analytics";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ScrollView, Platform, RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { getCategoryDisplay, getRankDisplay, BRAND } from "@/constants/brand";
import * as Haptics from "expo-haptics";
import { fetchBusinessSearch, fetchTrending, fetchAutocomplete, fetchPopularCategories, type AutocompleteSuggestion } from "@/lib/api";
import { DiscoverSkeleton } from "@/components/Skeleton";

import * as Location from "expo-location";
import { SafeImage } from "@/components/SafeImage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCity, SUPPORTED_CITIES } from "@/lib/city-context";
import { TYPOGRAPHY } from "@/constants/typography";
import { MappedBusiness } from "@/types/business";
import { FeaturedSection, type FeaturedBusiness } from "@/components/FeaturedCard";
import { DishLeaderboardSection } from "@/components/DishLeaderboardSection";
import { getApiUrl } from "@/lib/query-client";
import { BusinessCard, MapBusinessCard, haversineKm, MapView } from "@/components/search/SubComponents";
import { AutocompleteDropdown, RecentSearchesPanel } from "@/components/search/SearchOverlays";
import { FilterChips, PriceChips, SortChips } from "@/components/search/DiscoverFilters";
import { BestInSection } from "@/components/search/BestInSection";
import { CUISINE_DISPLAY, CUISINE_DISH_MAP } from "@/shared/best-in-categories";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const AMBER = BRAND.colors.amber;

type FilterType = "All" | "Top 10" | "Challenging" | "Trending" | "Open Now" | "Near Me";

type ViewMode = "list" | "map";

export default function SearchScreen() {

  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const { city, setCity } = useCity();
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [priceFilter, setPriceFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"ranked" | "rated" | "trending">("ranked");
  const [selectedMapBiz, setSelectedMapBiz] = useState<MappedBusiness | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showDiscoverTip, setShowDiscoverTip] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [autocompleteResults, setAutocompleteResults] = useState<AutocompleteSuggestion[]>([]);
  const [selectedCuisine, setSelectedCuisineRaw] = useState<string | null>(null);
  const setSelectedCuisine = useCallback((cuisine: string | null) => {
    setSelectedCuisineRaw(cuisine);
    if (cuisine) {
      AsyncStorage.setItem("discover_cuisine", cuisine);
    } else {
      AsyncStorage.removeItem("discover_cuisine");
    }
  }, []);

  // Load recent searches and persisted cuisine from storage
  useEffect(() => {
    AsyncStorage.getItem("recent_searches").then((val) => {
      if (val) try { setRecentSearches(JSON.parse(val)); } catch {}
    });
    // Sprint 308: Restore persisted cuisine filter
    AsyncStorage.getItem("discover_cuisine").then((val) => {
      if (val) setSelectedCuisineRaw(val);
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

  useEffect(() => {
    AsyncStorage.getItem("discover_tip_dismissed").then((val) => {
      if (val !== "true") setShowDiscoverTip(true);
    });
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

  const { data: allBusinesses = [], isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["search", city, debouncedQuery, selectedCuisine],
    queryFn: () => fetchBusinessSearch(debouncedQuery, city, undefined, selectedCuisine || undefined),
    staleTime: 30000,
  });

  // Track search queries after debounce settles + save to recents
  useEffect(() => {
    if (debouncedQuery.length > 0) {
      Analytics.searchQuery(debouncedQuery, allBusinesses.length);
      saveRecentSearch(debouncedQuery);
      setSearchFocused(false); // hide autocomplete once search executes
    }
  }, [debouncedQuery, allBusinesses.length, saveRecentSearch]);

  const { data: trending = [] } = useQuery({
    queryKey: ["trending", city],
    queryFn: () => fetchTrending(city, 3),
    staleTime: 60000,
  });

  // Sprint 184: Dynamic category suggestions per city
  const { data: popularCategories = [] } = useQuery({
    queryKey: ["popular-categories", city],
    queryFn: () => fetchPopularCategories(city),
    staleTime: 120000,
  });

  // Sprint 301+313: Dish leaderboard data for entry counts and search matching
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
  // Sprint 313: Match dish leaderboards against search query
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
    if (sortBy === "ranked") return list.sort((a: MappedBusiness, b: MappedBusiness) => (a.rank || 999) - (b.rank || 999));
    if (sortBy === "rated") return list.sort((a: MappedBusiness, b: MappedBusiness) => (b.ratingCount || 0) - (a.ratingCount || 0));
    if (sortBy === "trending") return list.sort((a: MappedBusiness, b: MappedBusiness) => (b.rankDelta || 0) - (a.rankDelta || 0));
    return list.sort((a: MappedBusiness, b: MappedBusiness) => b.weightedScore - a.weightedScore);
  }, [allBusinesses, activeFilter, priceFilter, sortBy, userLocation]);

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
        <AutocompleteDropdown results={autocompleteResults} dishMatches={dishSearchMatches} onDismiss={() => setSearchFocused(false)} />
      )}

      {searchFocused && query.length === 0 && (
        <RecentSearchesPanel
          searches={recentSearches}
          onSelect={(term) => { setQuery(term); setSearchFocused(false); }}
          onClear={clearRecentSearches}
        />
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
        <DiscoverSkeleton />
      ) : isError ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="cloud-offline-outline" size={36} color={Colors.textTertiary} style={styles.errorIcon} />
          <Text style={styles.emptyText}>Could not load results</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryButton} accessibilityRole="button" accessibilityLabel="Retry loading results">
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : viewMode === "map" ? (
        <View style={styles.splitContainer}>
          {/* Map takes top half */}
          <View style={styles.splitMapSection}>
            <MapView businesses={filtered} city={city} onSelectBiz={setSelectedMapBiz} />
            {/* Selected business card overlay */}
            {selectedMapBiz && (
              <TouchableOpacity
                style={styles.mapSelectedCard}
                onPress={() => router.push({ pathname: "/business/[id]", params: { id: selectedMapBiz.slug } })}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={`View ${selectedMapBiz.name}`}
              >
                {selectedMapBiz.photoUrls && selectedMapBiz.photoUrls.length > 0 ? (
                  <SafeImage uri={selectedMapBiz.photoUrls[0]} style={styles.mapSelectedPhoto} contentFit="cover" category={selectedMapBiz.category} />
                ) : (
                  <LinearGradient colors={[AMBER, BRAND.colors.amberDark]} style={[styles.mapSelectedPhoto, styles.mapSelectedPhotoFallback]}>
                    <Text style={styles.mapSelectedInitial}>{selectedMapBiz.name.charAt(0)}</Text>
                  </LinearGradient>
                )}
                <View style={styles.mapSelectedInfo}>
                  <Text style={styles.mapSelectedName} numberOfLines={1}>{selectedMapBiz.name}</Text>
                  <View style={styles.mapSelectedMetaRow}>
                    <Text style={styles.mapSelectedScore}>{"\u2B50"} {selectedMapBiz.weightedScore.toFixed(1)}</Text>
                    <Text style={styles.mapSelectedMeta}>{getRankDisplay(selectedMapBiz.rank)}</Text>
                    {selectedMapBiz.isOpenNow !== undefined && (
                      <View style={[styles.mapSelectedStatusPill, selectedMapBiz.isOpenNow ? styles.statusPillOpen : styles.statusPillClosed]}>
                        <Text style={styles.mapSelectedStatusText}>{selectedMapBiz.isOpenNow ? "OPEN" : "CLOSED"}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.mapSelectedCategory} numberOfLines={1}>
                    {getCategoryDisplay(selectedMapBiz.category).emoji} {getCategoryDisplay(selectedMapBiz.category).label}
                    {selectedMapBiz.cuisine && CUISINE_DISPLAY[selectedMapBiz.cuisine] ? ` · ${CUISINE_DISPLAY[selectedMapBiz.cuisine].emoji} ${CUISINE_DISPLAY[selectedMapBiz.cuisine].label}` : ""}
                    {selectedMapBiz.neighborhood ? ` \u00B7 ${selectedMapBiz.neighborhood}` : ""}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
          {/* List takes bottom half */}
          <View style={styles.splitListSection}>
            {/* Sprint 294: Cuisine indicator in map view */}
            {selectedCuisine && (
              <View style={[styles.activeCuisineRow, { paddingHorizontal: 12 }]}>
                <View style={styles.activeCuisineChip}>
                  <Text style={styles.activeCuisineText}>
                    {CUISINE_DISPLAY[selectedCuisine]?.emoji || ""} {CUISINE_DISPLAY[selectedCuisine]?.label || selectedCuisine}
                  </Text>
                  <TouchableOpacity
                    onPress={() => { Haptics.selectionAsync(); setSelectedCuisine(null); }}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={`Clear ${selectedCuisine} filter`}
                  >
                    <Ionicons name="close-circle" size={14} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            <View style={styles.splitListHeader}>
              <Ionicons name="list" size={14} color={AMBER} />
              <Text style={styles.splitListHeaderText}>{filtered.length} result{filtered.length !== 1 ? "s" : ""} nearby</Text>
            </View>
            <FlatList
              data={filtered}
              keyExtractor={(item: MappedBusiness) => item.id}
              renderItem={({ item }: { item: MappedBusiness }) => <MapBusinessCard item={item} />}
              contentContainerStyle={[styles.splitListContent, { paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 90 }]}
              showsVerticalScrollIndicator={false}
              initialNumToRender={10}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="location-outline" size={32} color={Colors.textTertiary} />
                  <Text style={styles.emptyText}>No places found</Text>
                </View>
              }
            />
          </View>
        </View>
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
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={AMBER} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={32} color={Colors.textTertiary} />
              <Text style={styles.emptyText}>
                {selectedCuisine && CUISINE_DISPLAY[selectedCuisine]
                  ? `No ${CUISINE_DISPLAY[selectedCuisine].label.toLowerCase()} places found`
                  : "No results"}
              </Text>
              <Text style={styles.emptySubtext}>Try a different search or filter</Text>
              {/* Sprint 321: Cuisine-aware dish suggestions in empty state */}
              {selectedCuisine && CUISINE_DISH_MAP[selectedCuisine] && !query.trim() && (
                <View style={styles.emptyDishSuggestions}>
                  <Text style={styles.emptyDishTitle}>
                    Explore {CUISINE_DISPLAY[selectedCuisine]?.label || selectedCuisine} dish rankings:
                  </Text>
                  {CUISINE_DISH_MAP[selectedCuisine].map((dish) => (
                    <TouchableOpacity
                      key={dish.slug}
                      style={styles.emptyDishChip}
                      onPress={() => router.push({ pathname: "/dish/[slug]", params: { slug: dish.slug } })}
                    >
                      <Text style={styles.emptyDishChipText}>
                        {dish.emoji} Best {dish.name}
                      </Text>
                      <Ionicons name="chevron-forward" size={14} color={AMBER} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {selectedCuisine && !query.trim() && (
                <TouchableOpacity
                  style={styles.emptyClearFilter}
                  onPress={() => setSelectedCuisine(null)}
                >
                  <Text style={styles.emptyClearFilterText}>Show all cuisines</Text>
                </TouchableOpacity>
              )}
              {!selectedCuisine && (
                <View style={styles.suggestionsSection}>
                  <Text style={styles.suggestionsLabel}>Popular in {city.replace(/_/g, " ")}</Text>
                  <View style={styles.suggestionsRow}>
                    {(popularCategories.length > 0
                      ? popularCategories.slice(0, 6)
                      : [{ category: "Tacos", count: 0 }, { category: "Italian", count: 0 }, { category: "Brunch", count: 0 }, { category: "Sushi", count: 0 }]
                    ).map(c => (
                      <TouchableOpacity
                        key={c.category}
                        style={styles.suggestionChip}
                        onPress={() => { setQuery(c.category); setActiveFilter("All"); }}
                        accessibilityRole="button"
                        accessibilityLabel={`Search for ${c.category}`}
                      >
                        <Text style={styles.suggestionChipEmoji}>
                          {getCategoryDisplay(c.category).emoji}
                        </Text>
                        <View style={styles.suggestionChipInfo}>
                          <Text style={styles.suggestionChipText}>
                            {getCategoryDisplay(c.category).label || c.category}
                          </Text>
                          {c.count > 0 && (
                            <Text style={styles.suggestionChipCount}>{c.count} places</Text>
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          }
          ListHeaderComponent={
            <>
              {/* Sprint 332: Filter/price/sort extracted to DiscoverFilters */}
              <FilterChips activeFilter={activeFilter} onFilterChange={setActiveFilter} locationLoading={locationLoading} onNearMe={requestLocation} />
              <PriceChips priceFilter={priceFilter} onPriceChange={setPriceFilter} />
              <SortChips sortBy={sortBy} onSortChange={setSortBy} />
              {showDiscoverTip && (
                <View style={styles.discoverTip}>
                  <Ionicons name="compass-outline" size={20} color={AMBER} style={{ marginTop: 2 }} />
                  <View style={styles.discoverTipTextStack}>
                    <Text style={styles.discoverTipTitle}>Discover top-rated places near you</Text>
                    <Text style={styles.discoverTipSubtext}>Search by name, category, or explore the map</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.discoverTipClose}
                    onPress={() => { AsyncStorage.setItem("discover_tip_dismissed", "true"); setShowDiscoverTip(false); }}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Dismiss discover tip"
                  >
                    <Ionicons name="close" size={14} color={Colors.textTertiary} />
                  </TouchableOpacity>
                </View>
              )}

              {/* Best In [City] — Category Browsing (extracted Sprint 287) */}
              {!debouncedQuery && (
                <BestInSection
                  city={city}
                  onSelectCategory={(name) => { setQuery(name); setActiveFilter("All"); }}
                  onSelectDish={(slug) => { Analytics.dishDeepLinkTap(slug); router.push({ pathname: "/dish/[slug]", params: { slug } }); }}
                  onSeeAll={() => setQuery("best in " + city.toLowerCase())}
                  onCuisineChange={(cuisine) => { setSelectedCuisine(cuisine); cuisine ? Analytics.cuisineFilterSelect(cuisine, "discover") : Analytics.cuisineFilterClear("discover"); }}
                  entryCounts={dishEntryCounts}
                />
              )}

              {/* Sprint 293: Active cuisine filter indicator */}
              {selectedCuisine && (
                <View style={styles.activeCuisineRow}>
                  <View style={styles.activeCuisineChip}>
                    <Text style={styles.activeCuisineText}>
                      {CUISINE_DISPLAY[selectedCuisine]?.emoji || ""} {CUISINE_DISPLAY[selectedCuisine]?.label || selectedCuisine}
                    </Text>
                    <TouchableOpacity
                      onPress={() => { Haptics.selectionAsync(); setSelectedCuisine(null); }}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel={`Clear ${selectedCuisine} filter`}
                    >
                      <Ionicons name="close-circle" size={14} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.activeCuisineCount}>
                    {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                  </Text>
                </View>
              )}

              {/* Featured / Promoted Listings */}
              {activeFilter === "Top 10" && <FeaturedSection featured={featuredBusinesses} />}

              {/* Trending This Week — PRD requirement */}
              {!debouncedQuery && trending.length > 0 && (
                <View style={styles.trendingSection}>
                  <View style={styles.trendingHeader}>
                    <Ionicons name="trending-up" size={16} color={AMBER} />
                    <Text style={styles.trendingTitle}>Trending This Week</Text>
                  </View>
                  {trending.map((biz: MappedBusiness) => (
                    <TouchableOpacity
                      key={biz.id}
                      style={styles.trendingRow}
                      onPress={() => router.push({ pathname: "/business/[id]", params: { id: biz.slug } })}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={`${biz.name}, moved up ${biz.rankDelta} spots`}
                    >
                      <View style={styles.trendingRank}>
                        <Text style={styles.trendingRankText}>{getRankDisplay(biz.rank)}</Text>
                      </View>
                      <View style={styles.trendingInfo}>
                        <Text style={styles.trendingName} numberOfLines={1}>{biz.name}</Text>
                        <Text style={styles.trendingMeta}>{getCategoryDisplay(biz.category).emoji} {getCategoryDisplay(biz.category).label}</Text>
                      </View>
                      <View style={styles.trendingDelta}>
                        <Ionicons name="arrow-up" size={12} color={Colors.green} />
                        <Text style={styles.trendingDeltaText}>{biz.rankDelta}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {/* Best In [City] — Dish Leaderboards (Sprint 167) */}
              {!debouncedQuery && <DishLeaderboardSection city={city} />}

              <Text style={styles.resultsCount}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</Text>
            </>
          }
        />
      )}
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
    paddingVertical: 10, gap: 8, marginBottom: 9,
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
    paddingBottom: 10, gap: 10,
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

  // Sprint 332: filterChip/price/sort styles moved to DiscoverFilters component

  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 },

  trendingSection: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14, gap: 8,
    marginBottom: 12, ...Colors.cardShadow,
  },
  trendingHeader: {
    flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4,
  },
  trendingTitle: {
    fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold",
  },
  trendingRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingVertical: 8, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  trendingRank: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: AMBER,
    alignItems: "center", justifyContent: "center",
  },
  trendingRankText: {
    fontSize: 11, fontWeight: "700", color: "#fff", fontFamily: "DMSans_700Bold",
  },
  trendingInfo: { flex: 1, gap: 2 },
  trendingName: {
    fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold",
  },
  trendingMeta: {
    ...TYPOGRAPHY.ui.caption, color: Colors.textSecondary,
  },
  trendingDelta: {
    flexDirection: "row", alignItems: "center", gap: 2,
    backgroundColor: `${Colors.green}15`, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  trendingDeltaText: {
    fontSize: 12, fontWeight: "700", color: Colors.green, fontFamily: "DMSans_700Bold",
  },

  discoverTip: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: "#fff", borderWidth: 1, borderColor: Colors.border,
    borderRadius: 12, padding: 14, marginBottom: 12, marginHorizontal: 0,
    position: "relative" as const,
  },
  discoverTipTextStack: { flex: 1, gap: 2, paddingRight: 20 },
  discoverTipTitle: {
    fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold",
  },
  discoverTipSubtext: {
    fontSize: 12, fontWeight: "400", color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
  },
  discoverTipClose: {
    position: "absolute" as const, top: 10, right: 10,
  },


  activeCuisineRow: {
    flexDirection: "row" as const, alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 4, paddingVertical: 6, marginBottom: 4,
  },
  activeCuisineChip: {
    flexDirection: "row" as const, alignItems: "center", gap: 6,
    backgroundColor: "rgba(196, 154, 26, 0.12)", paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 14, borderWidth: 1, borderColor: "rgba(196, 154, 26, 0.3)",
  },
  activeCuisineText: {
    fontSize: 12, fontWeight: "600" as const, color: "#8B6914", fontFamily: "DMSans_600SemiBold",
  },
  activeCuisineCount: {
    fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
  },

  resultList: { paddingHorizontal: 16, gap: 8, paddingTop: 4 },
  resultsCount: { ...TYPOGRAPHY.ui.caption, color: Colors.textTertiary, paddingBottom: 4 },

  statusPillOpen: {
    backgroundColor: Colors.green,
    shadowColor: Colors.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
  },
  statusPillClosed: { backgroundColor: Colors.red },

  emptyState: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 15, fontWeight: "600", color: Colors.textSecondary, fontFamily: "DMSans_600SemiBold" },
  emptySubtext: { fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  suggestionsSection: {
    marginTop: 20, paddingHorizontal: 24, gap: 10,
  },
  suggestionsLabel: {
    fontSize: 12, fontWeight: "600", color: Colors.textTertiary,
    fontFamily: "DMSans_600SemiBold", textTransform: "uppercase" as any,
    letterSpacing: 0.8,
  },
  suggestionsRow: {
    flexDirection: "row", flexWrap: "wrap", justifyContent: "center",
    gap: 8,
  },
  suggestionChip: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 14, paddingVertical: 9,
    backgroundColor: Colors.surface, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    borderLeftWidth: 3, borderLeftColor: AMBER,
  },
  suggestionChipEmoji: {
    fontSize: 16,
  },
  suggestionChipInfo: {
    gap: 1,
  },
  suggestionChipText: {
    fontSize: 13, color: Colors.text, fontFamily: "DMSans_600SemiBold",
  },
  suggestionChipCount: {
    fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
  },

  retryButton: {
    marginTop: 12, paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: AMBER, borderRadius: 10,
  },
  retryButtonText: {
    color: "#fff", fontWeight: "600", fontFamily: "DMSans_600SemiBold", fontSize: 13,
  },

  errorIcon: { marginBottom: 12 },

  // Map styles — split view (Yelp-like)
  splitContainer: { flex: 1 },
  splitMapSection: {
    height: "45%", position: "relative" as const,
  },
  splitListSection: {
    flex: 1, backgroundColor: Colors.background,
    borderTopLeftRadius: 16, borderTopRightRadius: 16,
    marginTop: -12,
    ...Colors.cardShadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  splitListHeader: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8,
  },
  splitListHeaderText: {
    fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold",
  },
  splitListContent: { paddingHorizontal: 12, gap: 6 },

  // Selected business card overlay on map
  mapSelectedCard: {
    position: "absolute" as const, bottom: 20, left: 12, right: 12,
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface, borderRadius: 14, padding: 10, gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  mapSelectedPhoto: {
    width: 52, height: 52, borderRadius: 10,
  },
  mapSelectedPhotoFallback: {
    alignItems: "center", justifyContent: "center",
  },
  mapSelectedInitial: {
    color: "#fff", fontWeight: "700", fontSize: 18, fontFamily: "PlayfairDisplay_700Bold",
  },
  mapSelectedInfo: { flex: 1, gap: 2 },
  mapSelectedName: {
    fontSize: 15, fontWeight: "700", color: Colors.text, fontFamily: "PlayfairDisplay_700Bold",
  },
  mapSelectedMetaRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
  },
  mapSelectedScore: {
    fontSize: 13, fontWeight: "800", color: AMBER, fontFamily: "PlayfairDisplay_900Black",
  },
  mapSelectedMeta: {
    ...TYPOGRAPHY.ui.caption, color: Colors.textSecondary,
  },
  mapSelectedStatusPill: {
    paddingHorizontal: 5, paddingVertical: 1, borderRadius: 99,
  },
  mapSelectedStatusText: {
    fontSize: 8, fontWeight: "700", color: "#fff", fontFamily: "DMSans_700Bold",
  },
  mapSelectedCategory: {
    ...TYPOGRAPHY.ui.caption, color: Colors.textTertiary,
  },

  // Sprint 332: priceRow/sortRow styles moved to DiscoverFilters component

  // Sprint 193: Autocomplete + recent search styles moved to SearchOverlays.tsx

  // Sprint 321: Cuisine-aware empty state styles
  emptyDishSuggestions: {
    marginTop: 16, width: "100%" as any, paddingHorizontal: 32,
  },
  emptyDishTitle: {
    fontSize: 13, fontWeight: "600" as const, color: Colors.textSecondary,
    fontFamily: "DMSans_600SemiBold", marginBottom: 8, textAlign: "center" as const,
  },
  emptyDishChip: {
    flexDirection: "row" as const, alignItems: "center" as const, gap: 8,
    paddingVertical: 10, paddingHorizontal: 14,
    backgroundColor: "rgba(196,154,26,0.06)", borderRadius: 12,
    borderWidth: 1, borderColor: "rgba(196,154,26,0.15)", marginBottom: 6,
  },
  emptyDishChipText: { flex: 1, fontSize: 14, fontWeight: "600" as const, color: AMBER },
  emptyClearFilter: {
    marginTop: 12, paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
  },
  emptyClearFilterText: { fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_500Medium" },
});
