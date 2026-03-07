import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ScrollView, Platform, ActivityIndicator, Linking, RefreshControl,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { getCategoryDisplay, getRankDisplay, BRAND } from "@/constants/brand";
import * as Haptics from "expo-haptics";
import { fetchBusinessSearch } from "@/lib/api";
import { DiscoverSkeleton } from "@/components/Skeleton";
import { setOptions as setGoogleMapsOptions, importLibrary } from "@googlemaps/js-api-loader";

const AMBER = BRAND.colors.amber;
const CARD_H_MARGIN = 16;

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Dallas: { lat: 32.7767, lng: -96.7970 },
  Austin: { lat: 30.2672, lng: -97.7431 },
  Houston: { lat: 29.7604, lng: -95.3698 },
  "San Antonio": { lat: 29.4241, lng: -98.4936 },
  "Fort Worth": { lat: 32.7555, lng: -97.3308 },
};

type FilterType = "All" | "Top 10" | "Challenging" | "Trending";
const FILTERS: FilterType[] = ["All", "Top 10", "Challenging", "Trending"];
const CITIES = ["Dallas", "Austin", "Houston", "San Antonio", "Fort Worth"];

type ViewMode = "list" | "map";

interface MappedBusiness {
  id: string;
  name: string;
  slug: string;
  neighborhood: string;
  category: string;
  weightedScore: number;
  rank: number;
  rankDelta: number;
  ratingCount?: number;
  isChallenger: boolean;
  priceRange?: string;
  photoUrl?: string;
  photoUrls?: string[];
  isOpenNow?: boolean;
  lat?: number;
  lng?: number;
}

const DiscoverPhotoStrip = React.memo(function DiscoverPhotoStrip({ photos, height, category, containerWidth }: { photos: string[]; height: number; category?: string; containerWidth: number }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const stripWidth = containerWidth;
  const stripPhotos = photos.slice(0, 3);

  if (stripPhotos.length === 0) {
    return (
      <LinearGradient
        colors={[AMBER, BRAND.colors.navy]}
        style={[styles.discoverStripFallback, { height }]}
      >
        <Text style={styles.discoverStripFallbackEmoji}>
          {getCategoryDisplay(category || "").emoji}
        </Text>
      </LinearGradient>
    );
  }

  const handleScroll = useCallback((e: any) => {
    const x = e.nativeEvent.contentOffset.x;
    setActiveIndex(Math.round(x / stripWidth));
  }, [stripWidth]);

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ height }}
      >
        {stripPhotos.map((uri, i) => (
          <Image
            key={i}
            source={{ uri }}
            style={{ width: stripWidth, height }}
            contentFit="cover"
            transition={200}
          />
        ))}
      </ScrollView>
      {stripPhotos.length > 1 && (
        <View style={styles.discoverDotRow}>
          {stripPhotos.map((_, i) => (
            <View key={i} style={[styles.discoverDot, i === activeIndex && styles.discoverDotActive]} />
          ))}
        </View>
      )}
    </View>
  );
});

const BusinessCard = React.memo(function BusinessCard({ item, displayRank }: { item: MappedBusiness; displayRank: number }) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = Math.min(screenWidth, 600) - CARD_H_MARGIN * 2;
  const catDisplay = getCategoryDisplay(item.category);
  const isOpen = item.isOpenNow;
  const rankLabel = getRankDisplay(displayRank);
  const photos = item.photoUrls && item.photoUrls.length > 0 ? item.photoUrls : (item.photoUrl ? [item.photoUrl] : []);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: "/business/[id]", params: { id: item.slug } })}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ranked ${rankLabel}, score ${item.weightedScore.toFixed(1)}`}
    >
      <View style={styles.cardPhotoStripWrap}>
        <DiscoverPhotoStrip photos={photos} height={120} category={item.category} containerWidth={cardWidth} />
        <View style={styles.discoverRankBadge}>
          <Text style={styles.discoverRankBadgeText}>{rankLabel}</Text>
        </View>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.cardRow2}>
          <Text style={styles.cardCategory}>{catDisplay.emoji} {catDisplay.label}</Text>
          {item.neighborhood ? (
            <>
              <Text style={styles.cardDot}> {"\u00B7"} </Text>
              <Text style={styles.cardNeighborhood}>{item.neighborhood}</Text>
            </>
          ) : null}
          {item.priceRange ? (
            <>
              <Text style={styles.cardDot}> {"\u00B7"} </Text>
              <Text style={styles.cardNeighborhood}>{item.priceRange}</Text>
            </>
          ) : null}
        </View>
        <View style={styles.cardRow3}>
          <Text style={styles.cardScore}>{"\u2B50"} {item.weightedScore.toFixed(1)}</Text>
          {item.ratingCount ? (
            <Text style={styles.cardRatingCount}>({item.ratingCount.toLocaleString()} ratings)</Text>
          ) : null}
          {item.rankDelta !== 0 && (
            <Text style={[styles.cardDelta, { color: item.rankDelta > 0 ? Colors.green : Colors.red }]}>
              {item.rankDelta > 0 ? "\u2191" : "\u2193"}{Math.abs(item.rankDelta)}
            </Text>
          )}
          {isOpen !== undefined && isOpen !== null && (
            <View style={[styles.statusPill, isOpen ? styles.statusPillOpen : styles.statusPillClosed]}>
              <Text style={styles.statusPillText}>
                {isOpen ? "OPEN" : "CLOSED"}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

function MapBusinessCard({ item }: { item: MappedBusiness }) {
  const catDisplay = getCategoryDisplay(item.category);
  const rankLabel = getRankDisplay(item.rank);

  const openInMaps = () => {
    if (item.lat && item.lng) {
      const url = Platform.OS === "web"
        ? `https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}`
        : Platform.OS === "ios"
        ? `maps:?q=${item.lat},${item.lng}`
        : `geo:${item.lat},${item.lng}?q=${item.lat},${item.lng}(${encodeURIComponent(item.name)})`;
      Linking.openURL(url);
    }
  };

  return (
    <TouchableOpacity
      style={styles.mapCard}
      onPress={() => router.push({ pathname: "/business/[id]", params: { id: item.slug } })}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ranked ${rankLabel}, score ${item.weightedScore.toFixed(1)}`}
    >
      <View style={styles.mapCardRank}>
        <Text style={styles.mapCardRankText}>{rankLabel}</Text>
      </View>
      <View style={styles.mapCardInfo}>
        <Text style={styles.mapCardName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.mapCardMeta}>{catDisplay.emoji} {catDisplay.label}{item.neighborhood ? ` \u00B7 ${item.neighborhood}` : ""}</Text>
      </View>
      <View style={styles.mapCardRight}>
        <Text style={styles.mapCardScore}>{item.weightedScore.toFixed(1)}</Text>
        {item.lat && item.lng ? (
          <TouchableOpacity onPress={openInMaps} style={styles.mapPinBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="navigate" size={14} color={AMBER} />
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

function MapView({ businesses, city }: { businesses: MappedBusiness[]; city: string }) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [selectedBiz, setSelectedBiz] = useState<MappedBusiness | null>(null);

  const bizWithCoords = businesses.filter(b => b.lat && b.lng);

  useEffect(() => {
    if (Platform.OS !== "web") return;

    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";
    if (!apiKey) {
      setMapError(true);
      return;
    }

    setGoogleMapsOptions({ key: apiKey, v: "weekly" });

    importLibrary("maps").then((mapsLib: any) => {
      if (!mapRef.current) return;
      const center = CITY_COORDS[city] || CITY_COORDS.Dallas;
      const map = new mapsLib.Map(mapRef.current, {
        center,
        zoom: 12,
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          { featureType: "poi", stylers: [{ visibility: "off" }] },
        ],
      });
      mapInstance.current = map;
      importLibrary("core").then(() => {
        const google = (window as any).google;
        infoWindowRef.current = new google.maps.InfoWindow();
        setMapReady(true);
        updateMarkers(google, map, bizWithCoords);
      });
    }).catch(() => {
      setMapError(true);
    });

    return () => {
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !mapReady) return;
    const google = (window as any).google;
    if (!google) return;
    const center = CITY_COORDS[city] || CITY_COORDS.Dallas;
    mapInstance.current.panTo(center);
    updateMarkers(google, mapInstance.current, bizWithCoords);
  }, [businesses, city, mapReady]);

  function updateMarkers(google: any, map: any, items: MappedBusiness[]) {
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    items.forEach(biz => {
      if (!biz.lat || !biz.lng) return;
      const marker = new google.maps.Marker({
        position: { lat: biz.lat, lng: biz.lng },
        map,
        icon: {
          url: `data:image/svg+xml,${encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"><circle cx="18" cy="18" r="16" fill="${AMBER}" stroke="white" stroke-width="2"/><text x="18" y="23" text-anchor="middle" fill="white" font-size="14" font-weight="bold" font-family="sans-serif">${biz.rank}</text></svg>`
          )}`,
          scaledSize: new google.maps.Size(36, 36),
        },
        title: biz.name,
      });

      const catDisplay = getCategoryDisplay(biz.category);
      const photoHtml = biz.photoUrls && biz.photoUrls[0]
        ? `<img src="${biz.photoUrls[0]}" style="width:100%;height:80px;object-fit:cover;border-radius:6px 6px 0 0;display:block;" />`
        : `<div style="width:100%;height:60px;background:linear-gradient(135deg,${AMBER},${BRAND.colors.amberDark});border-radius:6px 6px 0 0;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-size:24px;font-weight:700;">${biz.name.charAt(0)}</span></div>`;

      const infoContent = `
        <div style="width:200px;font-family:sans-serif;cursor:pointer;" onclick="window.__mapNavTo__('${biz.slug}')">
          ${photoHtml}
          <div style="padding:8px 10px;">
            <div style="font-weight:700;font-size:14px;color:#1a1a1a;">${biz.name}</div>
            <div style="font-size:11px;color:#888;margin-top:2px;">${catDisplay.emoji} ${catDisplay.label}${biz.neighborhood ? ` · ${biz.neighborhood}` : ""}</div>
            <div style="font-size:13px;font-weight:700;color:${AMBER};margin-top:4px;">★ ${biz.weightedScore.toFixed(1)}</div>
          </div>
        </div>
      `;

      marker.addListener("click", () => {
        setSelectedBiz(biz);
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(infoContent);
          infoWindowRef.current.open(map, marker);
        }
      });

      markersRef.current.push(marker);
    });
  }

  // Register global nav handler for InfoWindow clicks
  useEffect(() => {
    if (Platform.OS === "web") {
      (window as any).__mapNavTo__ = (slug: string) => {
        router.push({ pathname: "/business/[id]", params: { id: slug } });
      };
      return () => { delete (window as any).__mapNavTo__; };
    }
  }, []);

  if (Platform.OS !== "web" || mapError) {
    return (
      <FlatList
        data={businesses}
        keyExtractor={(item: MappedBusiness) => item.id}
        renderItem={({ item }: { item: MappedBusiness }) => <MapBusinessCard item={item} />}
        contentContainerStyle={styles.mapListContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.mapListHeader}>
            <Ionicons name="map" size={16} color={AMBER} />
            <Text style={styles.mapListHeaderText}>
              {bizWithCoords.length} of {businesses.length} places with locations
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={32} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No places found</Text>
          </View>
        }
      />
    );
  }

  return (
    <View style={styles.mapWrapper}>
      <View style={styles.mapContainer}>
        <div ref={mapRef as any} style={{ width: "100%", height: 420 }} />
        {!mapReady && !mapError && (
          <View style={styles.mapLoadingOverlay}>
            <ActivityIndicator size="small" color={AMBER} />
          </View>
        )}
      </View>
      {selectedBiz && (
        <TouchableOpacity
          style={styles.mapBottomSheet}
          onPress={() => router.push({ pathname: "/business/[id]", params: { id: selectedBiz.slug } })}
          activeOpacity={0.85}
        >
          <View style={styles.mapBottomSheetHandle} />
          <View style={styles.mapBottomSheetRow}>
            {selectedBiz.photoUrls && selectedBiz.photoUrls.length > 0 ? (
              <Image source={{ uri: selectedBiz.photoUrls[0] }} style={styles.mapBottomSheetPhoto} contentFit="cover" transition={200} />
            ) : (
              <LinearGradient colors={[AMBER, BRAND.colors.amberDark]} style={[styles.mapBottomSheetPhoto, styles.mapBottomSheetPhotoFallback]}>
                <Text style={styles.mapBottomSheetInitial}>{selectedBiz.name.charAt(0)}</Text>
              </LinearGradient>
            )}
            <View style={styles.mapBottomSheetInfo}>
              <Text style={styles.mapBottomSheetName}>{selectedBiz.name}</Text>
              <Text style={styles.mapBottomSheetMeta}>
                {getRankDisplay(selectedBiz.rank)} {"\u00B7"} Score: {selectedBiz.weightedScore.toFixed(1)}
                {selectedBiz.isOpenNow !== undefined ? ` \u00B7 ${selectedBiz.isOpenNow ? "OPEN" : "CLOSED"}` : ""}
              </Text>
            </View>
            <Text style={styles.mapBottomSheetAction}>{"View \u2192"}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [city, setCity] = useState("Dallas");
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: allBusinesses = [], isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["search", city, debouncedQuery],
    queryFn: () => fetchBusinessSearch(debouncedQuery, city),
    staleTime: 30000,
  });

  const onRefresh = useCallback(() => { refetch(); }, [refetch]);

  const filtered = useMemo(() => {
    let list = allBusinesses;
    if (activeFilter === "Top 10") list = list.filter((b: MappedBusiness) => b.rank <= 10);
    else if (activeFilter === "Challenging") list = list.filter((b: MappedBusiness) => b.isChallenger);
    else if (activeFilter === "Trending") list = list.filter((b: MappedBusiness) => b.rankDelta > 0);
    return list.sort((a: MappedBusiness, b: MappedBusiness) => b.weightedScore - a.weightedScore);
  }, [allBusinesses, activeFilter]);

  const topPad = Platform.OS === "web" ? 20 : insets.top;

  return (
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
          {CITIES.map(c => (
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
              onPress={() => { Haptics.selectionAsync(); setActiveFilter(f); }}
              style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
              accessibilityRole="button"
              accessibilityLabel={`${f} filter`}
              accessibilityState={{ selected: activeFilter === f }}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
        <MapView businesses={filtered} city={city} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item: MappedBusiness) => item.id}
          renderItem={({ item, index }: { item: MappedBusiness; index: number }) => (
            <BusinessCard item={item} displayRank={index + 1} />
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
            </View>
          }
          ListHeaderComponent={
            <Text style={styles.resultsCount}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</Text>
          }
        />
      )}
    </View>
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
  searchInput: { flex: 1, fontSize: 14, color: Colors.text, fontFamily: "DMSans_400Regular" },

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
  filterText: { fontSize: 12, fontWeight: "500", color: Colors.textSecondary, fontFamily: "DMSans_500Medium" },
  filterTextActive: { color: "#fff", fontWeight: "600" },

  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 },

  resultList: { paddingHorizontal: 16, gap: 8, paddingTop: 4 },
  resultsCount: { fontSize: 11, color: Colors.textTertiary, paddingBottom: 4, fontFamily: "DMSans_400Regular" },

  card: {
    backgroundColor: Colors.surface, borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 2,
  },
  cardPhotoStripWrap: {
    position: "relative" as const,
  },
  discoverStripFallback: { alignItems: "center", justifyContent: "center" },
  discoverStripFallbackEmoji: { fontSize: 32, color: "rgba(255,255,255,0.5)" },
  discoverDotRow: {
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 5,
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingVertical: 6, backgroundColor: "rgba(0,0,0,0.15)",
  },
  discoverDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.45)",
  },
  discoverDotActive: {
    backgroundColor: AMBER, width: 8, height: 8, borderRadius: 4,
  },
  discoverRankBadge: {
    position: "absolute", top: 8, left: 8,
    backgroundColor: AMBER, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  discoverRankBadgeText: {
    fontSize: 12, fontWeight: "800", color: "#fff", fontFamily: "PlayfairDisplay_900Black",
  },
  cardInfo: { padding: 10, gap: 4 },
  cardName: {
    fontSize: 16, fontWeight: "700", color: Colors.text, fontFamily: "PlayfairDisplay_700Bold",
  },
  cardRow2: {
    flexDirection: "row", alignItems: "center", flexWrap: "wrap",
  },
  cardCategory: { fontSize: 12, color: AMBER, fontWeight: "500", fontFamily: "DMSans_500Medium" },
  cardDot: { fontSize: 12, color: Colors.textTertiary },
  cardNeighborhood: { fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  cardRow3: {
    flexDirection: "row", alignItems: "center", marginTop: 2, gap: 8,
  },
  statusPill: {
    paddingHorizontal: 6, paddingVertical: 1, borderRadius: 99,
  },
  statusPillOpen: { backgroundColor: Colors.green },
  statusPillClosed: { backgroundColor: Colors.red },
  statusPillText: { fontSize: 9, fontWeight: "600", color: "#fff", fontFamily: "DMSans_600SemiBold" },
  cardScore: {
    fontSize: 15, fontWeight: "900", color: AMBER, fontFamily: "PlayfairDisplay_900Black",
  },
  cardRatingCount: {
    fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
  },
  cardDelta: {
    fontSize: 11, fontFamily: "DMSans_500Medium",
  },

  emptyState: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 15, fontWeight: "600", color: Colors.textSecondary, fontFamily: "DMSans_600SemiBold" },
  emptySubtext: { fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },

  retryButton: {
    marginTop: 12, paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: AMBER, borderRadius: 10,
  },
  retryButtonText: {
    color: "#fff", fontWeight: "600", fontFamily: "DMSans_600SemiBold", fontSize: 13,
  },

  errorIcon: { marginBottom: 12 },

  // Map styles
  mapWrapper: { flex: 1 },
  mapContainer: {
    margin: 16, borderRadius: 12, overflow: "hidden",
    borderWidth: 1, borderColor: Colors.border, position: "relative" as const,
  },
  mapLoadingOverlay: {
    position: "absolute" as const, top: 0, left: 0, right: 0, bottom: 0,
    alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.8)",
  },
  mapListContainer: { paddingHorizontal: 16, gap: 6, paddingTop: 4, paddingBottom: 90 },
  mapListHeader: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingVertical: 8, paddingHorizontal: 4,
  },
  mapListHeaderText: { fontSize: 12, color: Colors.textSecondary, fontWeight: "500", fontFamily: "DMSans_500Medium" },
  mapCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface, borderRadius: 12, padding: 12, gap: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  mapCardRank: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: AMBER,
    alignItems: "center", justifyContent: "center",
  },
  mapCardRankText: { fontSize: 13, fontWeight: "700", color: "#fff", fontFamily: "DMSans_700Bold" },
  mapCardInfo: { flex: 1, gap: 2 },
  mapCardName: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_700Bold" },
  mapCardMeta: { fontSize: 11, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  mapCardRight: { alignItems: "flex-end", gap: 4 },
  mapCardScore: { fontSize: 15, fontWeight: "700", color: AMBER, fontFamily: "PlayfairDisplay_700Bold" },
  mapPinBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.goldFaint,
    alignItems: "center", justifyContent: "center",
  },

  mapBottomSheet: {
    position: "absolute" as const,
    bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 16, borderTopRightRadius: 16,
    padding: 16, paddingTop: 12,
    ...Colors.cardShadow,
    shadowOffset: { width: 0, height: -4 },
  },
  mapBottomSheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Colors.border, alignSelf: "center", marginBottom: 12,
  },
  mapBottomSheetRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
  },
  mapBottomSheetPhoto: {
    width: 56, height: 56, borderRadius: 8,
  },
  mapBottomSheetPhotoFallback: {
    alignItems: "center", justifyContent: "center",
  },
  mapBottomSheetInitial: {
    color: "#fff", fontWeight: "700", fontSize: 18,
  },
  mapBottomSheetName: {
    fontSize: 16, fontWeight: "700", color: Colors.text, fontFamily: "PlayfairDisplay_700Bold",
  },
  mapBottomSheetMeta: {
    fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
  },
  mapBottomSheetInfo: { flex: 1, gap: 2 },
  mapBottomSheetAction: { color: AMBER, fontFamily: "DMSans_600SemiBold", fontSize: 12 },
});
