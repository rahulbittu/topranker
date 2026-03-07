import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ScrollView, Platform, ActivityIndicator, Image, Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { getCategoryDisplay, getRankDisplay } from "@/lib/data";
import { fetchBusinessSearch } from "@/lib/api";

const AMBER = "#C49A1A";

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
  isChallenger: boolean;
  priceRange?: string;
  photoUrl?: string;
  photoUrls?: string[];
  isOpenNow?: boolean;
  lat?: number;
  lng?: number;
}

function BusinessPhoto({ item, size = 80 }: { item: MappedBusiness; size?: number }) {
  const [imgError, setImgError] = useState(false);
  const initial = item.name.charAt(0).toUpperCase();
  const photos = item.photoUrls && item.photoUrls.length > 0 ? item.photoUrls : (item.photoUrl ? [item.photoUrl] : []);

  if (photos.length === 0 || imgError) {
    return (
      <View style={[styles.cardPhotoFallback, { width: size, height: size, borderRadius: 8 }]}>
        <Text style={[styles.cardPhotoInitial, { fontSize: size * 0.4 }]}>{initial}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: photos[0] }}
      style={[styles.cardPhoto, { width: size, height: size }]}
      onError={() => setImgError(true)}
    />
  );
}

function BusinessCard({ item }: { item: MappedBusiness }) {
  const catDisplay = getCategoryDisplay(item.category);
  const isOpen = item.isOpenNow;
  const rankLabel = getRankDisplay(item.rank);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: "/business/[id]", params: { id: item.slug } })}
      activeOpacity={0.75}
    >
      <BusinessPhoto item={item} size={80} />
      <View style={styles.cardInfo}>
        <View style={styles.cardRow1}>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.cardRankBadge}>{rankLabel}</Text>
        </View>
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
          {isOpen !== undefined && isOpen !== null && (
            <View style={[styles.statusPill, isOpen ? styles.statusPillOpen : styles.statusPillClosed]}>
              <Text style={[styles.statusPillText, isOpen ? styles.statusPillTextOpen : styles.statusPillTextClosed]}>
                {isOpen ? "OPEN" : "CLOSED"}
              </Text>
            </View>
          )}
          <View style={{ flex: 1 }} />
          <Text style={styles.cardScore}>{item.weightedScore.toFixed(2)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

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
    >
      <View style={styles.mapCardRank}>
        <Text style={styles.mapCardRankText}>{rankLabel}</Text>
      </View>
      <View style={styles.mapCardInfo}>
        <Text style={styles.mapCardName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.mapCardMeta}>{catDisplay.emoji} {catDisplay.label}{item.neighborhood ? ` \u00B7 ${item.neighborhood}` : ""}</Text>
      </View>
      <View style={styles.mapCardRight}>
        <Text style={styles.mapCardScore}>{item.weightedScore.toFixed(2)}</Text>
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
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [selectedBiz, setSelectedBiz] = useState<MappedBusiness | null>(null);

  const bizWithCoords = businesses.filter(b => b.lat && b.lng);

  useEffect(() => {
    if (Platform.OS !== "web") return;

    const timeout = setTimeout(() => {
      if (!mapReady) setMapError(true);
    }, 5000);

    const initMap = () => {
      if (!mapRef.current || !(window as any).google) return;
      clearTimeout(timeout);

      const map = new (window as any).google.maps.Map(mapRef.current, {
        center: { lat: 32.7767, lng: -96.7970 },
        zoom: 12,
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          { featureType: "poi", stylers: [{ visibility: "off" }] },
        ],
      });
      mapInstance.current = map;
      setMapReady(true);
      updateMarkers(map, bizWithCoords);
    };

    if ((window as any).google && (window as any).google.maps) {
      initMap();
    } else {
      const apiKey = (window as any).__GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || "";
      if (!apiKey) {
        clearTimeout(timeout);
        setMapError(true);
        return;
      }
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      script.onerror = () => { clearTimeout(timeout); setMapError(true); };
      document.head.appendChild(script);
    }

    return () => {
      clearTimeout(timeout);
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (mapInstance.current && mapReady) {
      updateMarkers(mapInstance.current, bizWithCoords);
    }
  }, [businesses, mapReady]);

  function updateMarkers(map: any, items: MappedBusiness[]) {
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    items.forEach(biz => {
      if (!biz.lat || !biz.lng) return;
      const rankLabel = getRankDisplay(biz.rank);
      const marker = new (window as any).google.maps.Marker({
        position: { lat: biz.lat, lng: biz.lng },
        map,
        icon: {
          url: `data:image/svg+xml,${encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"><circle cx="18" cy="18" r="16" fill="${AMBER}" stroke="white" stroke-width="2"/><text x="18" y="23" text-anchor="middle" fill="white" font-size="14" font-weight="bold" font-family="sans-serif">${biz.rank}</text></svg>`
          )}`,
          scaledSize: new (window as any).google.maps.Size(36, 36),
        },
        title: biz.name,
      });

      marker.addListener("click", () => {
        setSelectedBiz(biz);
      });

      markersRef.current.push(marker);
    });
  }

  // If Google Maps failed or no API key, show list-based map view with directions
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
    <View style={{ flex: 1 }}>
      <View style={styles.mapContainer}>
        <div ref={mapRef as any} style={{ width: "100%", height: "100%" }} />
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
              <Image source={{ uri: selectedBiz.photoUrls[0] }} style={styles.mapBottomSheetPhoto} />
            ) : (
              <View style={[styles.mapBottomSheetPhoto, { backgroundColor: AMBER, alignItems: "center", justifyContent: "center" }]}>
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 18 }}>{selectedBiz.name.charAt(0)}</Text>
              </View>
            )}
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.mapBottomSheetName}>{selectedBiz.name}</Text>
              <Text style={styles.mapBottomSheetMeta}>{getRankDisplay(selectedBiz.rank)} {"\u00B7"} Score: {selectedBiz.weightedScore.toFixed(2)}</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [city, setCity] = useState("Dallas");
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const { data: allBusinesses = [], isLoading } = useQuery({
    queryKey: ["search", city, query],
    queryFn: () => fetchBusinessSearch(query, city),
    staleTime: 15000,
  });

  const filtered = useMemo(() => {
    let list = allBusinesses;
    if (activeFilter === "Top 10") list = list.filter((b: MappedBusiness) => b.rank <= 10);
    else if (activeFilter === "Challenging") list = list.filter((b: MappedBusiness) => b.isChallenger);
    else if (activeFilter === "Trending") list = list.filter((b: MappedBusiness) => b.rankDelta > 0);
    return list.sort((a: MappedBusiness, b: MappedBusiness) => (a.rank || 999) - (b.rank || 999));
  }, [allBusinesses, activeFilter]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Discover</Text>
        <TouchableOpacity style={styles.cityButton} onPress={() => setShowCityPicker(!showCityPicker)} activeOpacity={0.7}>
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
        />
        {!!query && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <Ionicons name="close-circle" size={15} color={Colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* View mode toggle + filters */}
      <View style={styles.controlsRow}>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.viewToggleBtn, viewMode === "list" && styles.viewToggleBtnActive]}
            onPress={() => setViewMode("list")}
          >
            <Ionicons name="list" size={16} color={viewMode === "list" ? "#fff" : Colors.textSecondary} />
            <Text style={[styles.viewToggleText, viewMode === "list" && styles.viewToggleTextActive]}>List</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggleBtn, viewMode === "map" && styles.viewToggleBtnActive]}
            onPress={() => setViewMode("map")}
          >
            <Ionicons name="location" size={16} color={viewMode === "map" ? "#fff" : Colors.textSecondary} />
            <Text style={[styles.viewToggleText, viewMode === "map" && styles.viewToggleTextActive]}>Map</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map(f => (
            <TouchableOpacity key={f} onPress={() => setActiveFilter(f)} style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}>
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AMBER} />
        </View>
      ) : viewMode === "map" ? (
        <MapView businesses={filtered} city={city} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item: MappedBusiness) => item.id}
          renderItem={({ item }: { item: MappedBusiness }) => <BusinessCard item={item} />}
          contentContainerStyle={[
            styles.resultList,
            { paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 90 }
          ]}
          showsVerticalScrollIndicator={false}
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
    backgroundColor: "#fff", paddingHorizontal: 12, paddingVertical: 6,
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
  cityOptionActive: { backgroundColor: "rgba(196, 154, 26, 0.08)" },
  cityOptionText: { fontSize: 13, color: Colors.text, fontFamily: "DMSans_400Regular" },
  cityOptionTextActive: { color: AMBER, fontWeight: "600" },

  searchBox: {
    flexDirection: "row", alignItems: "center", marginHorizontal: 16,
    backgroundColor: "#FFFFFF", borderRadius: 12, paddingHorizontal: 12,
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
    flexDirection: "row", backgroundColor: "#FFFFFF", borderRadius: 8,
    overflow: "hidden",
    ...Colors.cardShadow,
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
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
    backgroundColor: "#FFFFFF",
    ...Colors.cardShadow,
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  filterChipActive: { backgroundColor: AMBER },
  filterText: { fontSize: 12, fontWeight: "500", color: Colors.textSecondary, fontFamily: "DMSans_500Medium" },
  filterTextActive: { color: "#fff", fontWeight: "600" },

  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 },

  resultList: { paddingHorizontal: 16, gap: 8, paddingTop: 4 },
  resultsCount: { fontSize: 11, color: Colors.textTertiary, paddingBottom: 4, fontFamily: "DMSans_400Regular" },

  card: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFFFFF", borderRadius: 14,
    padding: 14, minHeight: 96, gap: 14,
    ...Colors.cardShadow,
  },
  cardPhoto: {
    borderRadius: 8, backgroundColor: Colors.surfaceRaised,
  },
  cardPhotoFallback: {
    backgroundColor: AMBER,
    alignItems: "center", justifyContent: "center",
  },
  cardPhotoInitial: {
    color: "#fff", fontWeight: "700",
  },
  cardInfo: { flex: 1, gap: 4 },
  cardRow1: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  cardName: {
    fontSize: 16, fontWeight: "700", color: Colors.text, fontFamily: "PlayfairDisplay_700Bold", flex: 1, marginRight: 8,
  },
  cardRankBadge: {
    fontSize: 14, fontWeight: "700", color: AMBER, fontFamily: "PlayfairDisplay_700Bold",
  },
  cardRow2: {
    flexDirection: "row", alignItems: "center", flexWrap: "wrap",
  },
  cardCategory: { fontSize: 12, color: AMBER, fontWeight: "500", fontFamily: "DMSans_500Medium" },
  cardDot: { fontSize: 12, color: Colors.textTertiary },
  cardNeighborhood: { fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  cardRow3: {
    flexDirection: "row", alignItems: "center", marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99,
  },
  statusPillOpen: { backgroundColor: "#34C759" },
  statusPillClosed: { backgroundColor: "#FF3B30" },
  statusPillText: { fontSize: 11, fontWeight: "600", color: "#fff", fontFamily: "DMSans_600SemiBold" },
  statusPillTextOpen: {},
  statusPillTextClosed: {},
  cardScore: {
    fontSize: 14, fontWeight: "700", color: AMBER, fontFamily: "PlayfairDisplay_700Bold",
  },

  emptyState: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 15, fontWeight: "600", color: Colors.textSecondary, fontFamily: "DMSans_600SemiBold" },
  emptySubtext: { fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },

  // Map styles
  mapContainer: {
    flex: 1, margin: 16, borderRadius: 12, overflow: "hidden",
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
    backgroundColor: "#FFFFFF", borderRadius: 12, padding: 12, gap: 10,
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
    backgroundColor: "rgba(196, 154, 26, 0.1)",
    alignItems: "center", justifyContent: "center",
  },

  // Bottom sheet for map pin tap
  mapBottomSheet: {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingTop: 12,
    ...Colors.cardShadow,
    shadowOffset: { width: 0, height: -4 },
  },
  mapBottomSheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E0E0E0",
    alignSelf: "center",
    marginBottom: 12,
  },
  mapBottomSheetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  mapBottomSheetPhoto: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  mapBottomSheetName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  mapBottomSheetMeta: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "DMSans_400Regular",
  },
});
