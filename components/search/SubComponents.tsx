/**
 * Extracted sub-components from app/(tabs)/search.tsx
 * Presentational components for the Discover/Search screen.
 * Extracted per Audit N1/N6 to reduce search.tsx from 1159 LOC.
 */
import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Platform, Linking, Animated, useWindowDimensions, ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { BRAND, getCategoryDisplay, getRankDisplay } from "@/constants/brand";
import { getRankConfidence, RANK_CONFIDENCE_LABELS } from "@/lib/data";
import { SafeImage } from "@/components/SafeImage";
import { usePressAnimation } from "@/hooks/usePressAnimation";
import { useBookmarks } from "@/lib/bookmarks-context";
import { MappedBusiness } from "@/types/business";
import { useExperiment } from "@/lib/use-experiment";
import { setOptions as setGoogleMapsOptions, importLibrary } from "@googlemaps/js-api-loader";

const AMBER = BRAND.colors.amber;

export const DiscoverPhotoStrip = React.memo(function DiscoverPhotoStrip({
  photos, height, category, containerWidth, name,
}: {
  photos: string[]; height: number; category?: string; containerWidth: number; name?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const stripWidth = containerWidth;
  const stripPhotos = photos.slice(0, 3);

  if (stripPhotos.length === 0) {
    const initial = name?.charAt(0)?.toUpperCase() || "";
    return (
      <LinearGradient
        colors={[AMBER, BRAND.colors.amberDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[s.discoverStripFallback, { height }]}
      >
        {initial ? (
          <Text style={s.discoverStripFallbackInitial}>{initial}</Text>
        ) : (
          <Text style={s.discoverStripFallbackEmoji}>
            {getCategoryDisplay(category || "").emoji}
          </Text>
        )}
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
          <SafeImage key={i} uri={uri} style={{ width: stripWidth, height }} contentFit="cover" category={category} />
        ))}
      </ScrollView>
      {stripPhotos.length > 1 && (
        <View style={s.discoverDotRow}>
          {stripPhotos.map((_, i) => (
            <View key={i} style={[s.discoverDot, i === activeIndex && s.discoverDotActive]} />
          ))}
        </View>
      )}
    </View>
  );
});

export const BusinessCard = React.memo(function BusinessCard({
  item, displayRank, distanceKm,
}: {
  item: MappedBusiness; displayRank: number; distanceKm?: number;
}) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = Math.min(screenWidth, 600) - 32; // CARD_H_MARGIN * 2
  const catDisplay = getCategoryDisplay(item.category);
  const isOpen = item.isOpenNow;
  const rankLabel = getRankDisplay(displayRank);
  const photos = item.photoUrls && item.photoUrls.length > 0 ? item.photoUrls : (item.photoUrl ? [item.photoUrl] : []);
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const saved = isBookmarked(item.id);
  const { scale, onPressIn: scaleIn, onPressOut } = usePressAnimation();
  const onPressIn = useCallback(() => { scaleIn(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }, [scaleIn]);
  const [showConfTooltip, setShowConfTooltip] = useState(false);
  const { isTreatment: showTooltipIcon } = useExperiment("confidence_tooltip");

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
    <TouchableOpacity
      style={s.card}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={() => router.push({ pathname: "/business/[id]", params: { id: item.slug } })}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ranked ${rankLabel}, score ${item.weightedScore.toFixed(1)}`}
    >
      <View style={s.cardPhotoStripWrap}>
        <DiscoverPhotoStrip photos={photos} height={120} category={item.category} containerWidth={cardWidth} name={item.name} />
        <View style={s.discoverRankBadge}>
          <Text style={s.discoverRankBadgeText}>{rankLabel}</Text>
        </View>
        <TouchableOpacity
          style={s.cardBookmarkBtn}
          onPress={(e) => { e.stopPropagation(); toggleBookmark(item.id, { name: item.name, slug: item.slug, category: item.category }); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={saved ? `Remove ${item.name} from saved` : `Save ${item.name}`}
        >
          <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={12} color={saved ? AMBER : "#fff"} />
        </TouchableOpacity>
      </View>
      <View style={s.cardInfo}>
        <Text style={s.cardName} numberOfLines={1}>{item.name}</Text>
        <View style={s.cardRow2}>
          <Text style={s.cardCategory}>{catDisplay.emoji} {catDisplay.label}</Text>
          {item.neighborhood ? (
            <>
              <Text style={s.cardDot}> {"\u00B7"} </Text>
              <Text style={s.cardNeighborhood}>{item.neighborhood}</Text>
            </>
          ) : null}
          {item.priceRange ? (
            <>
              <Text style={s.cardDot}> {"\u00B7"} </Text>
              <Text style={s.cardNeighborhood}>{item.priceRange}</Text>
            </>
          ) : null}
          {distanceKm != null && (
            <>
              <Text style={s.cardDot}> {"\u00B7"} </Text>
              <Ionicons name="navigate-outline" size={10} color={AMBER} />
              <Text style={s.cardDistance}>{distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m` : `${distanceKm.toFixed(1)}km`}</Text>
            </>
          )}
        </View>
        <View style={s.cardRow3}>
          <Text style={s.cardScore}>{"\u2B50"} {item.weightedScore.toFixed(1)}</Text>
          {item.ratingCount ? (
            <Text style={s.cardRatingCount}>({item.ratingCount.toLocaleString()} weighted)</Text>
          ) : null}
          {(() => {
            const conf = getRankConfidence(item.ratingCount ?? 0, item.category);
            if (conf === "strong" || conf === "established") {
              return (
                <View style={s.confIndicatorWrap}>
                  <View style={s.verifiedPill}>
                    <Ionicons name="shield-checkmark" size={8} color={Colors.green} />
                  </View>
                  <TouchableOpacity onPress={() => setShowConfTooltip(v => !v)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Show confidence explanation">
                    <Ionicons name="information-circle-outline" size={12} color={Colors.textTertiary} />
                  </TouchableOpacity>
                </View>
              );
            }
            if (conf === "early") {
              return (
                <View style={s.confIndicatorWrap}>
                  <View style={[s.verifiedPill, { backgroundColor: `${AMBER}15` }]}>
                    <Ionicons name="hourglass-outline" size={8} color={AMBER} />
                  </View>
                  <TouchableOpacity onPress={() => setShowConfTooltip(v => !v)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Show confidence explanation">
                    <Ionicons name="information-circle-outline" size={12} color={Colors.textTertiary} />
                  </TouchableOpacity>
                </View>
              );
            }
            return null;
          })()}
          {item.rankDelta !== 0 && (
            <Text style={[s.cardDelta, { color: item.rankDelta > 0 ? Colors.green : Colors.red }]}>
              {item.rankDelta > 0 ? "\u2191" : "\u2193"}{Math.abs(item.rankDelta)}
            </Text>
          )}
          {isOpen !== undefined && isOpen !== null && (
            <View style={[s.statusPill, isOpen ? s.statusPillOpen : s.statusPillClosed]}>
              <Text style={s.statusPillText}>{isOpen ? "OPEN" : "CLOSED"}</Text>
            </View>
          )}
          {item.ratingCount && item.ratingCount >= 20 && (
            <View style={s.activityPill}>
              <Ionicons name="flame" size={9} color={AMBER} />
              <Text style={s.activityPillText}>ACTIVE</Text>
            </View>
          )}
        </View>
        {showConfTooltip && (() => {
          const conf = getRankConfidence(item.ratingCount ?? 0, item.category);
          return (
            <View style={s.confTooltip} accessible={true} accessibilityRole="alert" accessibilityLiveRegion="polite" accessibilityLabel={RANK_CONFIDENCE_LABELS[conf].description}>
              <Text style={s.confTooltipText}>{RANK_CONFIDENCE_LABELS[conf].description}</Text>
            </View>
          );
        })()}
      </View>
    </TouchableOpacity>
    </Animated.View>
  );
});

export function MapBusinessCard({ item }: { item: MappedBusiness }) {
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
      style={s.mapCard}
      onPress={() => router.push({ pathname: "/business/[id]", params: { id: item.slug } })}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ranked ${rankLabel}, score ${item.weightedScore.toFixed(1)}`}
    >
      <View style={s.mapCardRank}>
        <Text style={s.mapCardRankText}>{rankLabel}</Text>
      </View>
      <View style={s.mapCardInfo}>
        <Text style={s.mapCardName} numberOfLines={1}>{item.name}</Text>
        <Text style={s.mapCardMeta}>{catDisplay.emoji} {catDisplay.label}{item.neighborhood ? ` \u00B7 ${item.neighborhood}` : ""}</Text>
      </View>
      <View style={s.mapCardRight}>
        <Text style={s.mapCardScore}>{item.weightedScore.toFixed(1)}</Text>
        {item.lat && item.lng ? (
          <TouchableOpacity onPress={openInMaps} style={s.mapPinBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="navigate" size={14} color={AMBER} />
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

// --- MapView component (extracted from search.tsx) ---

export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Dallas: { lat: 32.7767, lng: -96.7970 },
  Austin: { lat: 30.2672, lng: -97.7431 },
  Houston: { lat: 29.7604, lng: -95.3698 },
  "San Antonio": { lat: 29.4241, lng: -98.4936 },
  "Fort Worth": { lat: 32.7555, lng: -97.3308 },
};

let _mapsInitialized = false;

export function MapView({ businesses, city, onSelectBiz }: { businesses: MappedBusiness[]; city: string; onSelectBiz?: (biz: MappedBusiness | null) => void }) {
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
      <View style={s.mapFallbackBanner}>
        <Ionicons name="map-outline" size={20} color={Colors.textTertiary} />
        <Text style={s.mapFallbackText}>Map view is available on web</Text>
      </View>
    );
  }

  if (mapError) {
    return (
      <View style={s.mapErrorBanner}>
        <Ionicons name="alert-circle-outline" size={24} color={Colors.red} />
        <Text style={s.mapErrorText}>{mapError}</Text>
      </View>
    );
  }

  return (
    <View style={s.mapContainer}>
      <div ref={mapRef as any} style={{ width: "100%", height: "100%" }} />
      {!mapReady && (
        <View style={s.mapLoadingOverlay}>
          <ActivityIndicator size="small" color={AMBER} />
        </View>
      )}
    </View>
  );
}

// Haversine distance utility
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const s = StyleSheet.create({
  discoverStripFallback: { alignItems: "center", justifyContent: "center" },
  discoverStripFallbackEmoji: { fontSize: 32, color: "rgba(255,255,255,0.5)" },
  discoverStripFallbackInitial: { fontSize: 40, fontWeight: "800", color: "#FFFFFF", fontFamily: "PlayfairDisplay_900Black" },
  discoverDotRow: {
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 5,
    position: "absolute", bottom: 0, left: 0, right: 0,
    paddingVertical: 6, backgroundColor: "rgba(0,0,0,0.15)",
  },
  discoverDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.45)" },
  discoverDotActive: { backgroundColor: AMBER, width: 8, height: 8, borderRadius: 4 },

  card: {
    backgroundColor: Colors.surface, borderRadius: 14, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 12, elevation: 2,
  },
  cardPhotoStripWrap: { position: "relative" as const },
  discoverRankBadge: {
    position: "absolute", top: 8, left: 8,
    backgroundColor: AMBER, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  discoverRankBadgeText: { fontSize: 12, fontWeight: "800", color: "#fff", fontFamily: "PlayfairDisplay_900Black" },
  cardBookmarkBtn: {
    position: "absolute", top: 6, right: 6,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center",
  },
  cardInfo: { padding: 10, gap: 4 },
  cardName: { fontSize: 16, fontWeight: "700", color: Colors.text, fontFamily: "PlayfairDisplay_700Bold" },
  cardRow2: { flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  cardCategory: { fontSize: 12, color: AMBER, fontWeight: "500", fontFamily: "DMSans_500Medium" },
  cardDot: { fontSize: 12, color: Colors.textTertiary },
  cardNeighborhood: { fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  cardDistance: { fontSize: 11, color: AMBER, fontFamily: "DMSans_500Medium", marginLeft: 2 },
  cardRow3: { flexDirection: "row", alignItems: "center", marginTop: 2, gap: 8 },
  cardScore: { fontSize: 15, fontWeight: "900", color: AMBER, fontFamily: "PlayfairDisplay_900Black" },
  cardRatingCount: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  cardDelta: { fontSize: 11, fontFamily: "DMSans_500Medium" },
  statusPill: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 99 },
  statusPillOpen: {
    backgroundColor: Colors.green,
    shadowColor: Colors.green, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, shadowRadius: 4, elevation: 2,
  },
  statusPillClosed: { backgroundColor: Colors.red },
  statusPillText: { fontSize: 9, fontWeight: "600", color: "#fff", fontFamily: "DMSans_600SemiBold" },
  verifiedPill: {
    paddingHorizontal: 4, paddingVertical: 2, borderRadius: 99,
    backgroundColor: `${Colors.green}15`,
  },
  activityPill: {
    flexDirection: "row", alignItems: "center", gap: 2,
    paddingHorizontal: 6, paddingVertical: 1, borderRadius: 99,
    backgroundColor: `${AMBER}15`,
  },
  activityPillText: {
    fontSize: 8, fontWeight: "700", color: AMBER,
    fontFamily: "DMSans_700Bold", letterSpacing: 0.3,
  },
  confIndicatorWrap: { flexDirection: "row", alignItems: "center", gap: 2 },
  confTooltip: {
    backgroundColor: "rgba(0,0,0,0.05)", borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 4, marginTop: 4,
  },
  confTooltipText: {
    fontSize: 11, color: Colors.textSecondary,
    fontFamily: "DMSans_400Regular", lineHeight: 14,
  },

  mapCard: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: Colors.surface, borderRadius: 12, padding: 10,
    ...Colors.cardShadow,
  },
  mapCardRank: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: AMBER,
    alignItems: "center", justifyContent: "center",
  },
  mapCardRankText: { fontSize: 13, fontWeight: "800", color: "#fff", fontFamily: "PlayfairDisplay_900Black" },
  mapCardInfo: { flex: 1, gap: 2 },
  mapCardName: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  mapCardMeta: { fontSize: 11, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  mapCardRight: { alignItems: "center", gap: 4 },
  mapCardScore: { fontSize: 16, fontWeight: "900", color: AMBER, fontFamily: "PlayfairDisplay_900Black" },
  mapPinBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: `${AMBER}12`, alignItems: "center", justifyContent: "center",
  },

  // MapView styles (extracted from search.tsx)
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
});
