/**
 * Extracted sub-components from app/(tabs)/search.tsx
 * Presentational components for the Discover/Search screen.
 * Extracted per Audit N1/N6 to reduce search.tsx from 1159 LOC.
 */
import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Platform, Linking, Animated, useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { BRAND, getCategoryDisplay, getRankDisplay } from "@/constants/brand";
import { SafeImage } from "@/components/SafeImage";
import { usePressAnimation } from "@/hooks/usePressAnimation";
import { useBookmarks } from "@/lib/bookmarks-context";
import { MappedBusiness } from "@/types/business";

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
          {(item.ratingCount ?? 0) >= 10 && (
            <View style={s.verifiedPill}>
              <Ionicons name="shield-checkmark" size={8} color={Colors.green} />
            </View>
          )}
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
});
