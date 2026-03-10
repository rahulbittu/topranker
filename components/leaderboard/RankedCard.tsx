/**
 * Sprint 434: Extracted RankedCard from leaderboard/SubComponents.tsx
 * RankedCard (#2+ rankings) with RankDeltaBadge (animated for big movers).
 */
import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, useWindowDimensions, Share,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { TYPOGRAPHY } from "@/constants/typography";
import { getCategoryDisplay, getRankDisplay, BRAND } from "@/constants/brand";
import { usePressAnimation } from "@/hooks/usePressAnimation";
import { useBookmarks } from "@/lib/bookmarks-context";
import { MappedBusiness } from "@/types/business";
import { CUISINE_DISPLAY } from "@/shared/best-in-categories";
import { getRankConfidence, RANK_CONFIDENCE_LABELS } from "@/lib/data";
import { getShareUrl, getShareText, copyShareLink } from "@/lib/sharing";
import { Analytics } from "@/lib/analytics";
import { PhotoStrip } from "./SubComponents";

const AMBER = BRAND.colors.amber;
const CARD_PADDING = 16;

// ── RankDeltaBadge — animated for big movers ────────
function RankDeltaBadge({ delta }: { delta: number }) {
  const isBigMover = Math.abs(delta) >= 3;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isBigMover) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [isBigMover, pulseAnim]);

  const isUp = delta > 0;
  const bgColor = isUp ? `${Colors.green}20` : `${Colors.red}20`;
  const textColor = isUp ? Colors.green : Colors.red;
  const arrow = isUp ? "\u2191" : "\u2193";

  return (
    <Animated.View
      style={[
        s.rankDeltaPill,
        { backgroundColor: bgColor },
        isBigMover && { transform: [{ scale: pulseAnim }] },
      ]}
      accessibilityLabel={`Rank ${isUp ? "up" : "down"} ${Math.abs(delta)} position${Math.abs(delta) !== 1 ? "s" : ""}`}
    >
      <Text style={[s.rankedDelta, { color: textColor }]}>
        {arrow}{Math.abs(delta)}
      </Text>
      {isBigMover && (
        <Ionicons name={isUp ? "flame" : "trending-down"} size={9} color={textColor} style={{ marginLeft: 2 }} />
      )}
    </Animated.View>
  );
}

// ── RankedCard ──────────────────────────────────────
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
  const [showConfTooltip, setShowConfTooltip] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(8)).current;
  useEffect(() => {
    const delay = Math.min(index * 60, 300);
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
        <PhotoStrip photos={photos} height={140} category={item.category} cuisine={item.cuisine ?? undefined} containerWidth={cardWidth} name={item.name} />
        <View style={[
          s.rankBadge,
          item.rank === 2 && s.rankBadgeSilver,
          item.rank === 3 && s.rankBadgeBronze,
        ]}>
          <Text style={s.rankBadgeText}>{rankLabel}</Text>
        </View>
        <TouchableOpacity
          style={s.cardShareBtn}
          onPress={async (e) => {
            e.stopPropagation();
            Haptics.selectionAsync();
            try {
              await Share.share({
                message: getShareText(item.name, item.weightedScore),
                url: getShareUrl("business", item.slug),
              });
              Analytics.shareBusiness(item.slug, "ranked_card");
            } catch {}
          }}
          onLongPress={async (e) => {
            e.stopPropagation();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            const url = getShareUrl("business", item.slug);
            const copied = await copyShareLink(url, item.name);
            if (copied) Analytics.shareBusiness(item.slug, "copy_link");
          }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Share ${item.name}`}
          accessibilityHint="Long press to copy link"
        >
          <Ionicons name="share-outline" size={14} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={s.cardBookmarkBtn}
          onPress={(e) => { e.stopPropagation(); toggleBookmark(item.id, { name: item.name, slug: item.slug, category: item.category, cuisine: item.cuisine ?? undefined }); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
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
          {item.cuisine && CUISINE_DISPLAY[item.cuisine] ? ` \u00B7 ${CUISINE_DISPLAY[item.cuisine].emoji} ${CUISINE_DISPLAY[item.cuisine].label}` : ""}
          {item.neighborhood ? ` \u00B7 ${item.neighborhood}` : ""}
          {item.priceRange ? ` \u00B7 ${item.priceRange}` : ""}
        </Text>
        {item.dishRankings && item.dishRankings.length > 0 && (
          <View style={s.dishBadgeRow}>
            {item.dishRankings.map((dr) => (
              <TouchableOpacity
                key={dr.dishSlug}
                style={s.dishBadge}
                onPress={() => router.push({ pathname: "/dish/[slug]", params: { slug: dr.dishSlug } })}
                accessibilityRole="link"
                accessibilityLabel={`Ranked #${dr.rankPosition} for ${dr.dishName}`}
              >
                <Text style={s.dishBadgeText}>
                  {dr.dishEmoji || "🍽️"} #{dr.rankPosition} {dr.dishName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={s.rankedRow3}>
          {(() => {
            const confidence = getRankConfidence(item.ratingCount ?? 0, item.category);
            if (confidence === "strong" || confidence === "established") {
              return (
                <View style={s.confIndicatorWrap}>
                  <View style={s.verifiedPill}>
                    <Ionicons name="shield-checkmark" size={9} color={Colors.green} />
                    <Text style={s.verifiedPillText}>VERIFIED</Text>
                  </View>
                  <TouchableOpacity onPress={() => setShowConfTooltip(v => !v)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Show confidence explanation">
                    <Ionicons name="information-circle-outline" size={12} color={Colors.textTertiary} />
                  </TouchableOpacity>
                </View>
              );
            }
            return (
              <View style={s.confIndicatorWrap}>
                <View style={[s.verifiedPill, { backgroundColor: `${BRAND.colors.amber}15` }]}>
                  <Ionicons name="hourglass-outline" size={9} color={BRAND.colors.amber} />
                  <Text style={[s.verifiedPillText, { color: BRAND.colors.amber }]}>
                    {RANK_CONFIDENCE_LABELS[confidence].label.toUpperCase()}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setShowConfTooltip(v => !v)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Show confidence explanation">
                  <Ionicons name="information-circle-outline" size={12} color={Colors.textTertiary} />
                </TouchableOpacity>
              </View>
            );
          })()}
          <Text style={s.rankedRatingCount}>{(item.ratingCount ?? 0).toLocaleString()} weighted ratings</Text>
          {item.rankDelta !== 0 && (
            <RankDeltaBadge delta={item.rankDelta} />
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
        {showConfTooltip && (() => {
          const confidence = getRankConfidence(item.ratingCount ?? 0, item.category);
          return (
            <View style={s.confTooltip} accessible={true} accessibilityRole="alert" accessibilityLiveRegion="polite" accessibilityLabel={RANK_CONFIDENCE_LABELS[confidence].description}>
              <Text style={s.confTooltipText}>{RANK_CONFIDENCE_LABELS[confidence].description}</Text>
            </View>
          );
        })()}
      </View>
    </TouchableOpacity>
    </Animated.View>
  );
});

const s = StyleSheet.create({
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
  cardShareBtn: {
    position: "absolute", top: 8, right: 44,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center",
  },
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
  dishBadgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 4 },
  dishBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
    backgroundColor: "rgba(196,154,26,0.10)",
    borderWidth: 1, borderColor: "rgba(196,154,26,0.25)",
  },
  dishBadgeText: { fontSize: 10, fontFamily: "DMSans_600SemiBold", color: AMBER },
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
  confIndicatorWrap: { flexDirection: "row", alignItems: "center", gap: 2 },
  confTooltip: {
    backgroundColor: "rgba(0,0,0,0.05)", borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 4, marginTop: 4,
  },
  confTooltipText: {
    fontSize: 11, color: Colors.textSecondary,
    fontFamily: "DMSans_400Regular", lineHeight: 14,
  },
});
