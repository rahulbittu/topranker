/**
 * Extracted sub-components from app/(tabs)/index.tsx
 * Presentational components for the Leaderboard screen.
 * Extracted per Audit N1/N6 to reduce index.tsx from 1031 LOC.
 */
import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Animated, useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { TYPOGRAPHY } from "@/constants/typography";
import { getCategoryDisplay, getRankDisplay, BRAND } from "@/constants/brand";
import { SafeImage } from "@/components/SafeImage";
import { usePressAnimation } from "@/hooks/usePressAnimation";
import { useBookmarks } from "@/lib/bookmarks-context";
import { MappedBusiness } from "@/types/business";
import { pct } from "@/lib/style-helpers";

const AMBER = BRAND.colors.amber;
const CARD_PADDING = 16;

// ── PhotoMosaic ─────────────────────────────────────────────────
export const PhotoMosaic = React.memo(function PhotoMosaic({
  photos, height, category, name,
}: {
  photos: string[]; height: number; category?: string; name?: string;
}) {
  if (photos.length === 0) {
    const initial = name?.charAt(0)?.toUpperCase() || "";
    return (
      <LinearGradient
        colors={[AMBER, BRAND.colors.amberDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[s.mosaicFallback, { height }]}
        accessible={true}
        accessibilityRole="image"
        accessibilityLabel={name ? `${name} placeholder image` : "Business placeholder image"}
      >
        {initial ? (
          <Text style={s.mosaicFallbackInitial}>{initial}</Text>
        ) : (
          <Text style={s.mosaicFallbackEmoji}>
            {getCategoryDisplay(category || "").emoji}
          </Text>
        )}
      </LinearGradient>
    );
  }

  if (photos.length === 1) {
    return (
      <SafeImage uri={photos[0]} style={{ width: pct(100), height }} category={category} accessibilityLabel={name ? `Photo of ${name}` : "Business photo"} />
    );
  }

  if (photos.length === 2) {
    return (
      <View style={[s.mosaicRow, { height }]}>
        <SafeImage uri={photos[0]} style={[s.mosaicMainPhoto, { height }]} category={category} />
        <SafeImage uri={photos[1]} style={[s.mosaicFlex, { height }]} category={category} />
      </View>
    );
  }

  return (
    <View style={[s.mosaicRow, { height }]}>
      <SafeImage uri={photos[0]} style={[s.mosaicMainPhoto, { height }]} category={category} />
      <View style={s.mosaicSideColumn}>
        <SafeImage uri={photos[1]} style={s.mosaicFlex} category={category} />
        <SafeImage uri={photos[2]} style={s.mosaicFlex} category={category} />
      </View>
    </View>
  );
});

// ── StarRating ──────────────────────────────────────────────────
export const StarRating = React.memo(function StarRating({ score }: { score: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const filled = score >= i;
    const halfFilled = !filled && score >= i - 0.5;
    stars.push(
      <Ionicons
        key={i}
        name={filled ? "star" : halfFilled ? "star-half" : "star-outline"}
        size={14}
        color={AMBER}
      />
    );
  }
  return <View style={s.starRow} accessible={true} accessibilityRole="image" accessibilityLabel={`Rating: ${score.toFixed(1)} out of 5 stars`}>{stars}</View>;
});

// ── PhotoStrip ──────────────────────────────────────────────────
export const PhotoStrip = React.memo(function PhotoStrip({
  photos, height, category, containerWidth, name,
}: {
  photos: string[]; height: number; category?: string; containerWidth: number; name?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const stripPhotos = photos.slice(0, 3);
  const stripWidth = containerWidth;

  if (stripPhotos.length === 0) {
    const initial = name?.charAt(0)?.toUpperCase() || "";
    return (
      <LinearGradient
        colors={[AMBER, BRAND.colors.amberDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[s.photoStripFallback, { height }]}
        accessible={true}
        accessibilityRole="image"
        accessibilityLabel={name ? `${name} placeholder image` : "Business placeholder image"}
      >
        {initial ? (
          <Text style={s.mosaicFallbackInitial}>{initial}</Text>
        ) : (
          <Text style={s.mosaicFallbackEmoji}>
            {getCategoryDisplay(category || "").emoji}
          </Text>
        )}
      </LinearGradient>
    );
  }

  const handleScroll = useCallback((e: any) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / stripWidth);
    setActiveIndex(idx);
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
          <SafeImage
            key={i}
            uri={uri}
            style={{ width: stripWidth, height }}
            category={category}
            accessibilityLabel={name ? `Photo ${i + 1} of ${name}` : `Business photo ${i + 1}`}
          />
        ))}
      </ScrollView>
      {stripPhotos.length > 1 && (
        <View style={s.dotRow}>
          {stripPhotos.map((_, i) => (
            <View key={i} style={[s.dot, i === activeIndex && s.dotActive]} />
          ))}
        </View>
      )}
    </View>
  );
});

// ── HeroCard ────────────────────────────────────────────────────
export function HeroCard({ item, categoryLabel }: { item: MappedBusiness; categoryLabel: string }) {
  const photos = item.photoUrls && item.photoUrls.length > 0 ? item.photoUrls : (item.photoUrl ? [item.photoUrl] : []);
  const catDisplay = getCategoryDisplay(item.category);
  const { scale, onPressIn: scaleIn, onPressOut } = usePressAnimation();
  const onPressIn = useCallback(() => { scaleIn(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }, [scaleIn]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={() => router.push({ pathname: "/business/[id]", params: { id: item.slug } })}
      style={s.heroCard}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ranked number 1, score ${item.weightedScore.toFixed(1)}`}
      accessibilityHint="Double tap to view business details"
    >
      <View style={s.heroPhotoWrap}>
        <PhotoMosaic photos={photos} height={240} category={item.category} name={item.name} />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={s.heroGradient}
        />
        <View style={s.heroCrownBadge}>
          <Text style={s.heroCrownText}>{"\u{1F451}"} #1 {categoryLabel.toUpperCase()}</Text>
        </View>
        {item.isOpenNow !== undefined && (
          <View style={[s.heroOpenPill, item.isOpenNow ? s.openPillOpen : s.openPillClosed]}>
            <Text style={s.openPillText}>{item.isOpenNow ? "OPEN" : "CLOSED"}</Text>
          </View>
        )}
        <Text style={s.heroName} numberOfLines={1}>{item.name}</Text>
        <Text style={s.heroScore}>{item.weightedScore.toFixed(1)}</Text>
      </View>
      <View style={s.heroStrip}>
        <View style={s.heroStripLeft}>
          <Text style={s.heroStripCategory}>
            {catDisplay.emoji} {catDisplay.label}
            {item.neighborhood ? ` \u00B7 ${item.neighborhood}` : ""}
            {item.priceRange ? ` \u00B7 ${item.priceRange}` : ""}
          </Text>
          <View style={s.heroStripRow2}>
            <StarRating score={item.weightedScore} />
            <Text style={s.heroStripRatings}>{(item.ratingCount ?? 0).toLocaleString()} weighted ratings</Text>
            {(item.ratingCount ?? 0) >= 50 && (
              <View style={s.hotBadge}>
                <Ionicons name="flame" size={10} color="#fff" />
                <Text style={s.hotBadgeText}>HOT</Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity
          onPress={() => router.push({ pathname: "/business/[id]", params: { id: item.slug } })}
          accessibilityRole="link"
          accessibilityLabel={`View ${item.name} profile`}
        >
          <Text style={s.heroStripLink}>{"View Profile \u2192"}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
    </Animated.View>
  );
}

// ── RankedCard ──────────────────────────────────────────────────
export const RankedCard = React.memo(function RankedCard({ item, index = 0 }: { item: MappedBusiness; index?: number }) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = Math.min(screenWidth, 600) - CARD_PADDING * 2;
  const photos = item.photoUrls && item.photoUrls.length > 0 ? item.photoUrls : (item.photoUrl ? [item.photoUrl] : []);
  const catDisplay = getCategoryDisplay(item.category);
  const rankLabel = getRankDisplay(item.rank);
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const saved = isBookmarked(item.id);
  const { scale, onPressIn: scaleIn, onPressOut } = usePressAnimation();
  const onPressIn = useCallback(() => { scaleIn(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }, [scaleIn]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(8)).current;
  useEffect(() => {
    const delay = Math.min(index * 60, 300); // Stagger up to 300ms
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ scale }, { translateY: slideAnim }], opacity: fadeAnim }}>
    <TouchableOpacity
      activeOpacity={0.75}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={() => router.push({ pathname: "/business/[id]", params: { id: item.slug } })}
      style={s.rankedCard}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ranked ${rankLabel}, score ${item.weightedScore.toFixed(1)}, ${(item.ratingCount ?? 0).toLocaleString()} ratings`}
      accessibilityHint="Double tap to view business details"
    >
      <View style={s.rankedPhotoStripWrap}>
        <PhotoStrip photos={photos} height={140} category={item.category} containerWidth={cardWidth} name={item.name} />
        <View style={[
          s.rankBadge,
          item.rank === 2 && s.rankBadgeSilver,
          item.rank === 3 && s.rankBadgeBronze,
        ]}>
          <Text style={s.rankBadgeText}>{rankLabel}</Text>
        </View>
        <TouchableOpacity
          style={s.cardBookmarkBtn}
          onPress={(e) => { e.stopPropagation(); toggleBookmark(item.id, { name: item.name, slug: item.slug, category: item.category }); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={saved ? `Remove ${item.name} from saved` : `Save ${item.name}`}
        >
          <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={14} color={saved ? AMBER : "#fff"} />
        </TouchableOpacity>
      </View>
      <View style={s.rankedInfo}>
        <View style={s.rankedRow1}>
          <Text style={s.rankedName} numberOfLines={1}>{item.name}</Text>
          <Text style={s.rankedScore}>{"\u2B50"} {item.weightedScore.toFixed(1)}</Text>
        </View>
        <Text style={s.rankedMeta} numberOfLines={1}>
          {catDisplay.emoji} {catDisplay.label}
          {item.neighborhood ? ` \u00B7 ${item.neighborhood}` : ""}
          {item.priceRange ? ` \u00B7 ${item.priceRange}` : ""}
        </Text>
        <View style={s.rankedRow3}>
          {(item.ratingCount ?? 0) >= 10 && (
            <View style={s.verifiedPill}>
              <Ionicons name="shield-checkmark" size={9} color={Colors.green} />
              <Text style={s.verifiedPillText}>VERIFIED</Text>
            </View>
          )}
          <Text style={s.rankedRatingCount}>{(item.ratingCount ?? 0).toLocaleString()} weighted ratings</Text>
          {item.rankDelta !== 0 && (
            <View style={[s.rankDeltaPill, { backgroundColor: item.rankDelta > 0 ? `${Colors.green}20` : `${Colors.red}20` }]}>
              <Text style={[s.rankedDelta, { color: item.rankDelta > 0 ? Colors.green : Colors.red }]}>
                {item.rankDelta > 0 ? "\u2191" : "\u2193"}{Math.abs(item.rankDelta)}
              </Text>
            </View>
          )}
          {item.isOpenNow !== undefined && (
            <View style={[s.statusPillSmall, item.isOpenNow ? s.statusPillOpen : s.statusPillClosed]}>
              <Text style={s.statusPillSmallText}>{item.isOpenNow ? "OPEN" : "CLOSED"}</Text>
            </View>
          )}
          {item.isChallenger && (
            <View style={s.challengerPill}>
              <Ionicons name="flash" size={9} color={BRAND.colors.navy} />
              <Text style={s.challengerPillText}>IN CHALLENGE</Text>
            </View>
          )}
          {(item.ratingCount ?? 0) >= 20 && (
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

// ─── Styles ─────────────────────────────────────────────────────
const s = StyleSheet.create({
  // Photo Mosaic
  mosaicFallback: { alignItems: "center", justifyContent: "center" },
  mosaicFallbackEmoji: { fontSize: 40, color: "rgba(255,255,255,0.5)" },
  mosaicFallbackInitial: { fontSize: 48, fontWeight: "800", color: "#FFFFFF", fontFamily: "PlayfairDisplay_900Black" },
  mosaicRow: { flexDirection: "row", gap: 3 },
  mosaicMainPhoto: { width: "60%" },
  mosaicFlex: { flex: 1 },
  mosaicSideColumn: { flex: 1, gap: 3 },
  starRow: { flexDirection: "row", gap: 1 },
  heroPhotoWrap: { position: "relative" as const },

  // Photo Strip
  photoStripFallback: { alignItems: "center", justifyContent: "center" },
  dotRow: {
    flexDirection: "row", justifyContent: "center", alignItems: "center",
    gap: 5, paddingVertical: 6,
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.45)" },
  dotActive: { backgroundColor: AMBER, width: 8, height: 8, borderRadius: 4 },

  // Hero Card (#1)
  heroCard: {
    backgroundColor: Colors.surface, borderRadius: 16, overflow: "hidden",
    marginTop: 0, marginBottom: 4, ...Colors.cardShadow,
  },
  heroGradient: { position: "absolute", bottom: 0, left: 0, right: 0, height: 140 },
  heroCrownBadge: {
    position: "absolute", top: 12, left: 12,
    backgroundColor: "rgba(0,0,0,0.7)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  heroCrownText: { fontSize: 11, fontWeight: "700", color: "#FFD700", fontFamily: "DMSans_700Bold", letterSpacing: 0.5 },
  heroOpenPill: { position: "absolute", top: 12, right: 12, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  heroName: {
    position: "absolute", bottom: 12, left: 14,
    fontSize: 22, fontWeight: "700", color: "#FFFFFF", fontFamily: "PlayfairDisplay_700Bold",
    letterSpacing: -0.3, maxWidth: "60%",
  },
  heroScore: {
    position: "absolute", bottom: 12, right: 14,
    fontSize: 26, fontWeight: "900", color: "#FFD700", fontFamily: "PlayfairDisplay_900Black", letterSpacing: -0.5,
  },
  openPillOpen: {
    backgroundColor: Colors.green,
    shadowColor: Colors.green, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 6, elevation: 3,
  },
  openPillClosed: { backgroundColor: Colors.red },
  openPillText: { fontSize: 9, fontWeight: "700", color: "#fff", fontFamily: "DMSans_700Bold", letterSpacing: 0.5 },
  heroStrip: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 10,
  },
  heroStripLeft: { gap: 4, flex: 1 },
  heroStripRow2: { flexDirection: "row", alignItems: "center", gap: 8 },
  heroStripCategory: { ...TYPOGRAPHY.ui.label, color: Colors.textSecondary },
  heroStripRatings: { ...TYPOGRAPHY.ui.caption, color: Colors.textTertiary },
  heroStripLink: { fontSize: 12, color: AMBER, fontFamily: "DMSans_600SemiBold" },
  hotBadge: {
    flexDirection: "row", alignItems: "center", gap: 2,
    paddingHorizontal: 6, paddingVertical: 1, borderRadius: 99, backgroundColor: Colors.red,
  },
  hotBadgeText: { fontSize: 8, fontWeight: "700", color: "#fff", fontFamily: "DMSans_700Bold", letterSpacing: 0.3 },

  // Ranked Cards (#2+)
  rankedCard: {
    backgroundColor: Colors.surface, borderRadius: 14, overflow: "hidden", marginBottom: 2,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 2,
  },
  rankedPhotoStripWrap: { position: "relative" as const },
  rankBadge: {
    position: "absolute", top: 8, left: 8,
    backgroundColor: AMBER, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  rankBadgeSilver: { backgroundColor: Colors.silver },
  rankBadgeBronze: { backgroundColor: Colors.bronze },
  rankBadgeText: { fontSize: 12, fontWeight: "800", color: "#fff", fontFamily: "PlayfairDisplay_900Black" },
  cardBookmarkBtn: {
    position: "absolute", top: 8, right: 8,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center",
  },
  rankedInfo: { padding: 12, gap: 4 },
  rankedRow1: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  rankedName: {
    fontSize: 16, fontWeight: "700", color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold", flex: 1, marginRight: 8,
  },
  rankedMeta: { ...TYPOGRAPHY.ui.label, color: Colors.textSecondary },
  rankedRow3: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  rankedScore: { fontSize: 15, fontWeight: "900", color: AMBER, fontFamily: "PlayfairDisplay_900Black" },
  rankedRatingCount: { ...TYPOGRAPHY.ui.caption, color: Colors.textTertiary },
  rankedDelta: { fontSize: 11, fontFamily: "DMSans_500Medium" },
  statusPillSmall: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 99 },
  statusPillOpen: {
    backgroundColor: Colors.green,
    shadowColor: Colors.green, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 2,
  },
  statusPillClosed: { backgroundColor: Colors.red },
  statusPillSmallText: { fontSize: 9, fontWeight: "600", color: "#fff", fontFamily: "DMSans_600SemiBold", letterSpacing: 0.3 },
  challengerPill: {
    flexDirection: "row", alignItems: "center", gap: 3,
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 99,
    backgroundColor: "rgba(13,27,42,0.10)",
    shadowColor: BRAND.colors.navy, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 1,
  },
  challengerPillText: { fontSize: 9, fontWeight: "700", color: BRAND.colors.navy, fontFamily: "DMSans_700Bold", letterSpacing: 0.3 },
  rankDeltaPill: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8 },
  verifiedPill: {
    flexDirection: "row", alignItems: "center", gap: 2,
    paddingHorizontal: 6, paddingVertical: 1, borderRadius: 99, backgroundColor: `${Colors.green}15`,
  },
  verifiedPillText: { fontSize: 8, fontWeight: "700", color: Colors.green, fontFamily: "DMSans_700Bold", letterSpacing: 0.5 },
  activityPill: {
    flexDirection: "row", alignItems: "center", gap: 2,
    paddingHorizontal: 6, paddingVertical: 1, borderRadius: 99, backgroundColor: `${AMBER}15`,
  },
  activityPillText: { fontSize: 8, fontWeight: "700", color: AMBER, fontFamily: "DMSans_700Bold", letterSpacing: 0.3 },
});
