import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Analytics } from "@/lib/analytics";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ScrollView, Platform, ActivityIndicator, RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { getCategoryDisplay, getRankDisplay, BRAND } from "@/constants/brand";
import * as Haptics from "expo-haptics";
import { fetchBusinessSearch, fetchTrending } from "@/lib/api";
import { DiscoverSkeleton } from "@/components/Skeleton";
import { setOptions as setGoogleMapsOptions, importLibrary } from "@googlemaps/js-api-loader";

import * as Location from "expo-location";
import { SafeImage } from "@/components/SafeImage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCity, SUPPORTED_CITIES } from "@/lib/city-context";
import { TYPOGRAPHY } from "@/constants/typography";
import { MappedBusiness } from "@/types/business";
import { FeaturedSection, type FeaturedBusiness } from "@/components/FeaturedCard";
import { getApiUrl } from "@/lib/query-client";
import { DiscoverPhotoStrip, BusinessCard, MapBusinessCard, haversineKm } from "@/components/search/SubComponents";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useThemeColors } from "@/lib/theme-context";

const AMBER = BRAND.colors.amber;

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Dallas: { lat: 32.7767, lng: -96.7970 },
  Austin: { lat: 30.2672, lng: -97.7431 },
  Houston: { lat: 29.7604, lng: -95.3698 },
  "San Antonio": { lat: 29.4241, lng: -98.4936 },
  "Fort Worth": { lat: 32.7555, lng: -97.3308 },
};

type FilterType = "All" | "Top 10" | "Challenging" | "Trending" | "Open Now" | "Near Me";
const FILTERS: FilterType[] = ["All", "Top 10", "Challenging", "Trending", "Open Now", "Near Me"];

type ViewMode = "list" | "map";

let _mapsInitialized = false;

function MapView({ businesses, city, onSelectBiz }: { businesses: MappedBusiness[]; city: string; onSelectBiz?: (biz: MappedBusiness | null) => void }) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | false>(false);

  const bizWithCoords = businesses.filter(b => b.lat && b.lng);

  useEffect(() => {
    if (Platform.OS !== "web") return;

    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";
    console.log("[MapView] Init — key length:", apiKey.length, "platform:", Platform.OS);
    if (!apiKey) {
      setMapError("No API key found. Rebuild after adding EXPO_PUBLIC_GOOGLE_MAPS_API_KEY to your environment. Expo inlines EXPO_PUBLIC_* vars at build time.");
      return;
    }

    // Listen for Google Maps auth failures (fires when key is invalid/restricted)
    window.gm_authFailure = () => {
      console.error("[MapView] Google Maps auth failure — key rejected");
      setMapError("Map temporarily unavailable. Please try the list view.");
    };

    if (!_mapsInitialized) {
      setGoogleMapsOptions({ key: apiKey, v: "weekly" });
      _mapsInitialized = true;
    }

    importLibrary("maps").then((mapsLib: any) => {
      if (!mapRef.current || mapInstance.current) return;
      // Verify DOM element is still attached to prevent IntersectionObserver errors
      if (!mapRef.current.isConnected) return;
      const center = CITY_COORDS[city] || CITY_COORDS.Dallas;

      const map = new mapsLib.Map(mapRef.current, {
        center,
        zoom: 12,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        clickableIcons: false,
        styles: [
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { featureType: "transit", stylers: [{ visibility: "off" }] },
        ],
      });

      map.addListener("click", () => onSelectBiz?.(null));

      mapInstance.current = map;
      setMapReady(true);
      const google = window.google;
      if (google) updateMarkers(google, map, bizWithCoords);
    }).catch((err: any) => {
      console.error("[MapView] Google Maps load error:", err);
      const msg = String(err?.message || err || "");
      if (msg.includes("ApiNotActivatedMapError") || msg.includes("REQUEST_DENIED")) {
        setMapError("Maps JavaScript API is not enabled. Enable it at console.cloud.google.com/apis/library/maps-backend.googleapis.com");
      } else if (msg.includes("InvalidKeyMapError")) {
        setMapError("Invalid API key. Check EXPO_PUBLIC_GOOGLE_MAPS_API_KEY.");
      } else {
        setMapError(`Failed to load Google Maps: ${msg || "Unknown error"}. Check browser console.`);
      }
    });

    return () => {
      markersRef.current.forEach(m => m.setMap?.(null));
      markersRef.current = [];
      // Clear map instance so it's re-created on next mount (prevents stale DOM ref)
      mapInstance.current = null;
      setMapReady(false);
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !mapReady) return;
    const google = window.google;
    if (!google) return;
    const center = CITY_COORDS[city] || CITY_COORDS.Dallas;
    mapInstance.current.panTo(center);
    updateMarkers(google, mapInstance.current, bizWithCoords);
  }, [businesses, city, mapReady]);

  function updateMarkers(google: any, map: any, items: MappedBusiness[]) {
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    if (items.length === 0) return;

    const bounds = new google.maps.LatLngBounds();

    items.forEach(biz => {
      if (!biz.lat || !biz.lng) return;
      bounds.extend({ lat: biz.lat, lng: biz.lng });

      const pinSvg = encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="48"><defs><filter id="s" x="-20%" y="-10%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/></filter></defs><path d="M20 46C20 46 36 28 36 18C36 9.16 28.84 2 20 2C11.16 2 4 9.16 4 18C4 28 20 46 20 46Z" fill="${AMBER}" stroke="white" stroke-width="2" filter="url(#s)"/><text x="20" y="23" text-anchor="middle" fill="white" font-size="14" font-weight="bold" font-family="sans-serif">${biz.rank}</text></svg>`
      );

      const marker = new google.maps.Marker({
        position: { lat: biz.lat, lng: biz.lng },
        map,
        icon: {
          url: `data:image/svg+xml,${pinSvg}`,
          scaledSize: new google.maps.Size(40, 48),
          anchor: new google.maps.Point(20, 48),
        },
        title: biz.name,
        zIndex: 1000 - biz.rank,
      });

      marker.addListener("click", () => {
        onSelectBiz?.(biz);
        map.panTo({ lat: biz.lat, lng: biz.lng });
      });

      markersRef.current.push(marker);
    });

    map.fitBounds(bounds, { top: 40, bottom: 40, left: 40, right: 40 });
    const listener = google.maps.event.addListener(map, "idle", () => {
      if (map.getZoom() > 15) map.setZoom(15);
      google.maps.event.removeListener(listener);
    });
  }

  if (Platform.OS !== "web") {
    return (
      <View style={styles.mapFallbackBanner}>
        <Ionicons name="map-outline" size={20} color={Colors.textTertiary} />
        <Text style={styles.mapFallbackText}>Map view is available on web</Text>
      </View>
    );
  }

  if (mapError) {
    return (
      <View style={styles.mapErrorBanner}>
        <Ionicons name="alert-circle-outline" size={24} color={Colors.red} />
        <Text style={styles.mapErrorText}>{mapError}</Text>
      </View>
    );
  }

  return (
    <View style={styles.mapContainer}>
      <div ref={mapRef as any} style={{ width: "100%", height: "100%" }} />
      {!mapReady && (
        <View style={styles.mapLoadingOverlay}>
          <ActivityIndicator size="small" color={AMBER} />
        </View>
      )}
    </View>
  );
}

export default function SearchScreen() {
  const themeColors = useThemeColors();
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

  useEffect(() => {
    AsyncStorage.getItem("discover_tip_dismissed").then((val) => {
      if (val !== "true") setShowDiscoverTip(true);
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: allBusinesses = [], isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["search", city, debouncedQuery],
    queryFn: () => fetchBusinessSearch(debouncedQuery, city),
    staleTime: 30000,
  });

  // Track search queries after debounce settles
  useEffect(() => {
    if (debouncedQuery.length > 0) {
      Analytics.searchQuery(debouncedQuery, allBusinesses.length);
    }
  }, [debouncedQuery, allBusinesses.length]);

  const { data: trending = [] } = useQuery({
    queryKey: ["trending", city],
    queryFn: () => fetchTrending(city, 3),
    staleTime: 60000,
  });

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
    <View style={[styles.container, { paddingTop: topPad, backgroundColor: themeColors.background }]}>
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
          placeholder="Restaurants, neighborhoods, dishes..."
          placeholderTextColor={Colors.textTertiary}
          value={query}
          onChangeText={setQuery}
          maxLength={100}
          accessibilityLabel="Search for restaurants, neighborhoods, or dishes"
          returnKeyType="search"
        />
        {!!query && (
          <TouchableOpacity onPress={() => setQuery("")} hitSlop={8} accessibilityRole="button" accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={15} color={Colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* View mode toggle + filters */}
      <View style={styles.controlsRow}>
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => {
                Haptics.selectionAsync();
                setActiveFilter(f);
                if (f === "Near Me") requestLocation();
              }}
              style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
              accessibilityRole="button"
              accessibilityLabel={`${f} filter`}
              accessibilityState={{ selected: activeFilter === f }}
            >
              {f === "Near Me" && <Ionicons name="navigate-outline" size={12} color={activeFilter === f ? "#fff" : Colors.textSecondary} style={{ marginRight: 3 }} />}
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
                {f === "Near Me" && locationLoading ? "Locating..." : f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Price Range Filter */}
      <View style={styles.priceRow}>
        {["$", "$$", "$$$", "$$$$"].map(p => (
          <TouchableOpacity
            key={p}
            onPress={() => { Haptics.selectionAsync(); setPriceFilter(prev => prev === p ? null : p); }}
            style={[styles.priceChip, priceFilter === p && styles.priceChipActive]}
            accessibilityRole="button"
            accessibilityLabel={`Price ${p}${priceFilter === p ? ", selected" : ""}`}
            accessibilityHint="Double tap to filter by this price range"
            accessibilityState={{ selected: priceFilter === p }}
          >
            <Text style={[styles.priceChipText, priceFilter === p && styles.priceChipTextActive]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sort By */}
      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Sort:</Text>
        {([["ranked", "Ranked"], ["rated", "Most Rated"], ["trending", "Trending"]] as const).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            onPress={() => { Haptics.selectionAsync(); setSortBy(key); }}
            style={[styles.sortChip, sortBy === key && styles.sortChipActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: sortBy === key }}
          >
            <Text style={[styles.sortChipText, sortBy === key && styles.sortChipTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
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
                    {selectedMapBiz.neighborhood ? ` \u00B7 ${selectedMapBiz.neighborhood}` : ""}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
          {/* List takes bottom half */}
          <View style={styles.splitListSection}>
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
              displayRank={index + 1}
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
              <Text style={styles.emptyText}>No results</Text>
              <Text style={styles.emptySubtext}>Try a different search or filter</Text>
              <View style={styles.suggestionsRow}>
                {["Tacos", "Italian", "Brunch", "Sushi"].map(s => (
                  <TouchableOpacity
                    key={s}
                    style={styles.suggestionChip}
                    onPress={() => { setQuery(s); setActiveFilter("All"); }}
                    accessibilityRole="button"
                    accessibilityLabel={`Search for ${s}`}
                  >
                    <Text style={styles.suggestionChipText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          }
          ListHeaderComponent={
            <>
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

  filterRow: { gap: 6, flexDirection: "row", alignItems: "center" },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: AMBER, borderColor: AMBER },
  filterText: { ...TYPOGRAPHY.ui.label, fontWeight: "500", color: Colors.textSecondary },
  filterTextActive: { color: "#fff", fontWeight: "600" },

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
  suggestionsRow: {
    flexDirection: "row", flexWrap: "wrap", justifyContent: "center",
    gap: 8, marginTop: 16, paddingHorizontal: 32,
  },
  suggestionChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: Colors.surface, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.border,
  },
  suggestionChipText: {
    fontSize: 13, color: AMBER, fontFamily: "DMSans_600SemiBold",
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

  mapContainer: {
    flex: 1, position: "relative" as const,
  },
  mapLoadingOverlay: {
    position: "absolute" as const, top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.8)",
  },
  mapFallbackBanner: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    padding: 20,
  },
  mapFallbackText: {
    fontSize: 13, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
  },
  mapErrorBanner: {
    flex: 1, alignItems: "center", justifyContent: "center", gap: 10,
    paddingHorizontal: 24, paddingVertical: 40,
  },
  mapErrorText: {
    fontSize: 13, color: Colors.red, fontFamily: "DMSans_500Medium",
    textAlign: "center", lineHeight: 18,
  },

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

  priceRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 10,
  },
  priceChip: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  priceChipActive: {
    backgroundColor: AMBER,
    borderColor: AMBER,
  },
  priceChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
    fontFamily: "DMSans_600SemiBold",
  },
  priceChipTextActive: {
    color: "#fff",
  },
  sortRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, gap: 6, paddingBottom: 10,
  },
  sortLabel: {
    fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_500Medium", marginRight: 2,
  },
  sortChip: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  sortChipActive: {
    backgroundColor: BRAND.colors.navy, borderColor: BRAND.colors.navy,
  },
  sortChipText: {
    fontSize: 11, fontWeight: "500", color: Colors.textSecondary, fontFamily: "DMSans_500Medium",
  },
  sortChipTextActive: {
    color: "#fff", fontWeight: "600",
  },
});
