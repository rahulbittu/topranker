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
import { BRAND } from "@/constants/brand";
import { formatCategoryLabel, CATEGORY_ICONS } from "@/lib/data";
import { fetchBusinessSearch } from "@/lib/api";

const AMBER = BRAND.colors.amber;

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

function BusinessPhoto({ item, size = 72 }: { item: MappedBusiness; size?: number }) {
  const [imgError, setImgError] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const initial = item.name.charAt(0).toUpperCase();
  const photos = item.photoUrls && item.photoUrls.length > 0 ? item.photoUrls : (item.photoUrl ? [item.photoUrl] : []);

  if (photos.length === 0 || imgError) {
    return (
      <View style={[styles.cardPhotoFallback, { width: size, height: size }]}>
        <Text style={[styles.cardPhotoInitial, { fontSize: size * 0.4 }]}>{initial}</Text>
      </View>
    );
  }

  if (photos.length === 1) {
    return (
      <Image
        source={{ uri: photos[0] }}
        style={[styles.cardPhoto, { width: size, height: size }]}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => setActiveIdx(Math.round(e.nativeEvent.contentOffset.x / size))}
        scrollEventThrottle={16}
        style={{ width: size, height: size, borderRadius: 10, overflow: "hidden" }}
      >
        {photos.map((url, i) => (
          <Image key={i} source={{ uri: url }} style={{ width: size, height: size }} resizeMode="cover" />
        ))}
      </ScrollView>
      <View style={styles.miniDotContainer}>
        {photos.map((_, i) => (
          <View key={i} style={[styles.miniDot, i === activeIdx ? styles.miniDotActive : styles.miniDotInactive]} />
        ))}
      </View>
    </View>
  );
}

function BusinessCard({ item }: { item: MappedBusiness }) {
  const rawLabel = formatCategoryLabel(item.category);
  const emoji = CATEGORY_ICONS[rawLabel] || "";
  const categoryLabel = emoji ? `${emoji} ${rawLabel}` : rawLabel;
  const isOpen = item.isOpenNow;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: "/business/[id]", params: { id: item.slug } })}
      activeOpacity={0.75}
    >
      <BusinessPhoto item={item} size={72} />
      <View style={styles.cardInfo}>
        <View style={styles.cardRow1}>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.cardRankBadge}>#{item.rank}</Text>
        </View>
        <View style={styles.cardRow2}>
          <Text style={styles.cardCategory}>{categoryLabel}</Text>
          {item.neighborhood ? (
            <>
              <Text style={styles.cardDot}> · </Text>
              <Text style={styles.cardNeighborhood}>{item.neighborhood}</Text>
            </>
          ) : null}
          {item.priceRange ? (
            <>
              <Text style={styles.cardDot}> · </Text>
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
  const rawLabel = formatCategoryLabel(item.category);
  const emoji = CATEGORY_ICONS[rawLabel] || "";
  const categoryLabel = emoji ? `${emoji} ${rawLabel}` : rawLabel;

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
        <Text style={styles.mapCardRankText}>{item.rank}</Text>
      </View>
      <View style={styles.mapCardInfo}>
        <Text style={styles.mapCardName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.mapCardMeta}>{categoryLabel}{item.neighborhood ? ` · ${item.neighborhood}` : ""}</Text>
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
      const apiKey = (window as any).__GOOGLE_MAPS_API_KEY || "";
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
    const infoWindow = new (window as any).google.maps.InfoWindow();

    items.forEach(biz => {
      if (!biz.lat || !biz.lng) return;
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
        const label = formatCategoryLabel(biz.category);
        infoWindow.setContent(`
          <div style="font-family:sans-serif;max-width:220px;padding:4px">
            <div style="font-weight:700;font-size:14px;color:#1C1C1E">${biz.name}</div>
            <div style="font-size:12px;color:#636366;margin-top:2px">#${biz.rank} · ${biz.weightedScore.toFixed(2)} · ${label}</div>
          </div>
        `);
        infoWindow.open(map, marker);
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
            <Ionicons name="location-outline" size={32} color="#AEAEB2" />
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
          <Ionicons name="chevron-down" size={12} color="#636366" />
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
        <Ionicons name="search" size={15} color="#AEAEB2" />
        <TextInput
          style={styles.searchInput}
          placeholder="Restaurants, neighborhoods, dishes..."
          placeholderTextColor="#AEAEB2"
          value={query}
          onChangeText={setQuery}
        />
        {!!query && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <Ionicons name="close-circle" size={15} color="#AEAEB2" />
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
            <Ionicons name="list" size={16} color={viewMode === "list" ? "#fff" : "#636366"} />
            <Text style={[styles.viewToggleText, viewMode === "list" && styles.viewToggleTextActive]}>List</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggleBtn, viewMode === "map" && styles.viewToggleBtnActive]}
            onPress={() => setViewMode("map")}
          >
            <Ionicons name="location" size={16} color={viewMode === "map" ? "#fff" : "#636366"} />
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
              <Ionicons name="search-outline" size={32} color="#AEAEB2" />
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
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  headerRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 10,
  },
  title: { fontSize: 28, fontWeight: "700", color: "#1C1C1E", letterSpacing: -0.5 },
  cityButton: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#fff", paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: "#E5E5EA",
  },
  cityButtonText: { fontSize: 13, fontWeight: "500", color: "#1C1C1E" },

  cityPickerDropdown: {
    marginHorizontal: 16, backgroundColor: "#F7F7F5", borderRadius: 12,
    borderWidth: 1, borderColor: "#E5E5EA", marginBottom: 8, overflow: "hidden",
  },
  cityOption: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 11,
    borderBottomWidth: 1, borderBottomColor: "#E5E5EA",
  },
  cityOptionActive: { backgroundColor: "rgba(184, 134, 11, 0.08)" },
  cityOptionText: { fontSize: 13, color: "#1C1C1E" },
  cityOptionTextActive: { color: AMBER, fontWeight: "600" },

  searchBox: {
    flexDirection: "row", alignItems: "center", marginHorizontal: 16,
    backgroundColor: "#F2F2F7", borderRadius: 12, paddingHorizontal: 12,
    paddingVertical: 10, gap: 8, marginBottom: 9,
  },
  searchInput: { flex: 1, fontSize: 14, color: "#1C1C1E" },

  controlsRow: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16,
    paddingBottom: 10, gap: 10,
  },
  viewToggle: {
    flexDirection: "row", backgroundColor: "#F2F2F7", borderRadius: 8,
    overflow: "hidden",
  },
  viewToggleBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  viewToggleBtnActive: { backgroundColor: AMBER, borderRadius: 8 },
  viewToggleText: { fontSize: 13, fontWeight: "500", color: "#636366" },
  viewToggleTextActive: { color: "#fff" },

  filterRow: { gap: 6, flexDirection: "row", alignItems: "center" },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    backgroundColor: "#F2F2F7",
  },
  filterChipActive: { backgroundColor: AMBER },
  filterText: { fontSize: 12, fontWeight: "500", color: "#636366" },
  filterTextActive: { color: "#fff", fontWeight: "600" },

  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 },

  resultList: { paddingHorizontal: 16, gap: 8, paddingTop: 4 },
  resultsCount: { fontSize: 11, color: "#AEAEB2", paddingBottom: 4 },

  // Card styles (Fix 5)
  card: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFFFFF", borderRadius: 12,
    borderWidth: 1, borderColor: "#E5E5EA",
    padding: 16, minHeight: 96, gap: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardPhoto: {
    borderRadius: 10, backgroundColor: "#F2F2F7",
  },
  miniDotContainer: {
    flexDirection: "row", justifyContent: "center", gap: 3,
    position: "absolute", bottom: 3, left: 0, right: 0,
  },
  miniDot: { width: 4, height: 4, borderRadius: 2 },
  miniDotActive: { backgroundColor: AMBER },
  miniDotInactive: { backgroundColor: "rgba(255,255,255,0.6)" },
  cardPhotoFallback: {
    borderRadius: 10, backgroundColor: AMBER,
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
    fontSize: 16, fontWeight: "700", color: "#1C1C1E", flex: 1, marginRight: 8,
  },
  cardRankBadge: {
    fontSize: 13, fontWeight: "700", color: AMBER,
  },
  cardRow2: {
    flexDirection: "row", alignItems: "center", flexWrap: "wrap",
  },
  cardCategory: { fontSize: 12, color: AMBER, fontWeight: "500" },
  cardDot: { fontSize: 12, color: "#AEAEB2" },
  cardNeighborhood: { fontSize: 12, color: "#636366" },
  cardRow3: {
    flexDirection: "row", alignItems: "center", marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99,
  },
  statusPillOpen: { backgroundColor: "#34C759" },
  statusPillClosed: { backgroundColor: "#FF3B30" },
  statusPillText: { fontSize: 11, fontWeight: "600", color: "#fff" },
  statusPillTextOpen: {},
  statusPillTextClosed: {},
  cardScore: {
    fontSize: 14, fontWeight: "700", color: AMBER,
  },

  emptyState: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 15, fontWeight: "600", color: "#636366" },
  emptySubtext: { fontSize: 12, color: "#AEAEB2" },

  // Map styles
  mapContainer: {
    flex: 1, margin: 16, borderRadius: 12, overflow: "hidden",
    borderWidth: 1, borderColor: "#E5E5EA", position: "relative" as const,
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
  mapListHeaderText: { fontSize: 12, color: "#636366", fontWeight: "500" },
  mapCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#FFFFFF", borderRadius: 12, padding: 12, gap: 10,
    borderWidth: 1, borderColor: "#E5E5EA",
  },
  mapCardRank: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: AMBER,
    alignItems: "center", justifyContent: "center",
  },
  mapCardRankText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  mapCardInfo: { flex: 1, gap: 2 },
  mapCardName: { fontSize: 14, fontWeight: "600", color: "#1C1C1E" },
  mapCardMeta: { fontSize: 11, color: "#636366" },
  mapCardRight: { alignItems: "flex-end", gap: 4 },
  mapCardScore: { fontSize: 15, fontWeight: "700", color: AMBER },
  mapPinBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "rgba(184, 134, 11, 0.1)",
    alignItems: "center", justifyContent: "center",
  },
});
