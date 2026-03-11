/**
 * Extracted sub-components from app/(tabs)/index.tsx
 * Presentational components for the Leaderboard screen.
 * Extracted per Audit N1/N6 to reduce index.tsx from 1031 LOC.
 */
import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Animated,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { TYPOGRAPHY } from "@/constants/typography";
import { getCategoryDisplay, BRAND } from "@/constants/brand";
import { SafeImage } from "@/components/SafeImage";
import { usePressAnimation } from "@/hooks/usePressAnimation";
import { MappedBusiness } from "@/types/business";
import { CUISINE_DISPLAY } from "@/shared/best-in-categories";
import { pct } from "@/lib/style-helpers";
import { getRankConfidence, RANK_CONFIDENCE_LABELS } from "@/lib/data";

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
  photos, height, category, cuisine, containerWidth, name,
}: {
  photos: string[]; height: number; category?: string; cuisine?: string; containerWidth: number; name?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const stripPhotos = photos.slice(0, 3);
  const stripWidth = containerWidth;

  if (stripPhotos.length === 0) {
    const initial = name?.charAt(0)?.toUpperCase() || "";
    // Sprint 341: Prefer cuisine emoji for more specific fallbacks
    const cuisineEmoji = cuisine ? getCategoryDisplay(cuisine).emoji : "";
    const categoryEmoji = getCategoryDisplay(category || "").emoji;
    const fallbackEmoji = cuisineEmoji || categoryEmoji;
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
            {fallbackEmoji}
          </Text>
        )}
        <Text style={s.photoStripHint}>No photo yet</Text>
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
            {item.cuisine && CUISINE_DISPLAY[item.cuisine] ? ` \u00B7 ${CUISINE_DISPLAY[item.cuisine].emoji} ${CUISINE_DISPLAY[item.cuisine].label}` : ""}
            {item.neighborhood ? ` \u00B7 ${item.neighborhood}` : ""}
            {item.priceRange ? ` \u00B7 ${item.priceRange}` : ""}
          </Text>
          <View style={s.heroStripRow2}>
            <StarRating score={item.weightedScore} />
            <Text style={s.heroStripRatings}>{(item.ratingCount ?? 0).toLocaleString()} weighted ratings</Text>
            {(() => {
              const conf = getRankConfidence(item.ratingCount ?? 0, item.category);
              if (conf === "strong" || conf === "established") {
                return (
                  <View style={s.heroConfPill}>
                    <Ionicons name="shield-checkmark" size={9} color={Colors.green} />
                    <Text style={[s.heroConfPillText, { color: Colors.green }]}>VERIFIED</Text>
                  </View>
                );
              }
              return (
                <View style={[s.heroConfPill, { backgroundColor: `${AMBER}15` }]}>
                  <Ionicons name="hourglass-outline" size={9} color={AMBER} />
                  <Text style={[s.heroConfPillText, { color: AMBER }]}>
                    {RANK_CONFIDENCE_LABELS[conf].label.toUpperCase()}
                  </Text>
                </View>
              );
            })()}
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

// Sprint 434: RankedCard extracted to RankedCard.tsx
export { RankedCard } from "./RankedCard";

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
  photoStripHint: { fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 4, letterSpacing: 0.5 },
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
  heroCrownText: { fontSize: 11, fontWeight: "700", color: BRAND.colors.gold, fontFamily: "DMSans_700Bold", letterSpacing: 0.5 },
  heroOpenPill: { position: "absolute", top: 12, right: 12, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  heroName: {
    position: "absolute", bottom: 12, left: 14,
    fontSize: 22, fontWeight: "700", color: "#FFFFFF", fontFamily: "PlayfairDisplay_700Bold",
    letterSpacing: -0.3, maxWidth: "60%",
  },
  heroScore: {
    position: "absolute", bottom: 12, right: 14,
    fontSize: 26, fontWeight: "900", color: BRAND.colors.gold, fontFamily: "PlayfairDisplay_900Black", letterSpacing: -0.5,
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
  heroConfPill: {
    flexDirection: "row", alignItems: "center", gap: 3,
    paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6,
    backgroundColor: "rgba(34,197,94,0.1)",
  },
  heroConfPillText: { fontSize: 8, fontWeight: "700", fontFamily: "DMSans_700Bold", letterSpacing: 0.3 },
  hotBadge: {
    flexDirection: "row", alignItems: "center", gap: 2,
    paddingHorizontal: 6, paddingVertical: 1, borderRadius: 99, backgroundColor: Colors.red,
  },
  hotBadgeText: { fontSize: 8, fontWeight: "700", color: "#fff", fontFamily: "DMSans_700Bold", letterSpacing: 0.3 },

});
