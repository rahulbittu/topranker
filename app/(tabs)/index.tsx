import React, { useState, useCallback, useMemo } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ScrollView, Platform, Alert,
  TextInput, RefreshControl, useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { getCategoryDisplay, getRankDisplay, BRAND } from "@/constants/brand";
import { fetchLeaderboard, fetchCategories } from "@/lib/api";
import { AppLogo } from "@/components/Logo";
import { LeaderboardSkeleton } from "@/components/Skeleton";

const AMBER = BRAND.colors.amber;
const CARD_PADDING = 16;

interface MappedBusiness {
  id: string;
  name: string;
  slug: string;
  neighborhood: string;
  city: string;
  category: string;
  weightedScore: number;
  rank: number;
  rankDelta: number;
  ratingCount: number;
  isChallenger: boolean;
  isOpenNow?: boolean;
  priceRange?: string;
  photoUrl?: string;
  photoUrls?: string[];
}

function PhotoMosaic({ photos, height, category }: { photos: string[]; height: number; category?: string }) {
  if (photos.length === 0) {
    return (
      <LinearGradient
        colors={[AMBER, BRAND.colors.navy]}
        style={[styles.mosaicFallback, { height }]}
      >
        <Text style={styles.mosaicFallbackEmoji}>
          {getCategoryDisplay(category || "").emoji}
        </Text>
      </LinearGradient>
    );
  }

  if (photos.length === 1) {
    return (
      <Image source={{ uri: photos[0] }} style={[styles.mosaicFull, { height }]} contentFit="cover" transition={200} />
    );
  }

  if (photos.length === 2) {
    return (
      <View style={[styles.mosaicRow, { height }]}>
        <Image source={{ uri: photos[0] }} style={[styles.mosaicMainPhoto, { height }]} contentFit="cover" transition={200} />
        <Image source={{ uri: photos[1] }} style={[styles.mosaicFlex, { height }]} contentFit="cover" transition={200} />
      </View>
    );
  }

  return (
    <View style={[styles.mosaicRow, { height }]}>
      <Image source={{ uri: photos[0] }} style={[styles.mosaicMainPhoto, { height }]} contentFit="cover" transition={200} />
      <View style={styles.mosaicSideColumn}>
        <Image source={{ uri: photos[1] }} style={styles.mosaicFlex} contentFit="cover" transition={200} />
        <Image source={{ uri: photos[2] }} style={styles.mosaicFlex} contentFit="cover" transition={200} />
      </View>
    </View>
  );
}

function StarRating({ score }: { score: number }) {
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
  return <View style={styles.starRow}>{stars}</View>;
}

function HeroCard({ item, categoryLabel }: { item: MappedBusiness; categoryLabel: string }) {
  const photos = item.photoUrls && item.photoUrls.length > 0 ? item.photoUrls : (item.photoUrl ? [item.photoUrl] : []);
  const catDisplay = getCategoryDisplay(item.category);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push({ pathname: "/business/[id]", params: { id: item.slug } })}
      style={styles.heroCard}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ranked number 1, score ${item.weightedScore.toFixed(1)}`}
    >
      <View style={styles.heroPhotoWrap}>
        <PhotoMosaic photos={photos} height={240} category={item.category} />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.heroGradient}
        />
        {/* Crown badge */}
        <View style={styles.heroCrownBadge}>
          <Text style={styles.heroCrownText}>{"\u{1F451}"} #1 {categoryLabel.toUpperCase()}</Text>
        </View>
        {/* OPEN/CLOSED pill top-right */}
        {item.isOpenNow !== undefined && (
          <View style={[styles.heroOpenPill, item.isOpenNow ? styles.openPillOpen : styles.openPillClosed]}>
            <Text style={styles.openPillText}>{item.isOpenNow ? "OPEN" : "CLOSED"}</Text>
          </View>
        )}
        {/* Business name bottom-left */}
        <Text style={styles.heroName} numberOfLines={1}>{item.name}</Text>
        {/* Score bottom-right */}
        <Text style={styles.heroScore}>{item.weightedScore.toFixed(1)}</Text>
      </View>
      {/* White strip below */}
      <View style={styles.heroStrip}>
        <View style={styles.heroStripLeft}>
          <Text style={styles.heroStripCategory}>
            {catDisplay.emoji} {catDisplay.label}
            {item.neighborhood ? ` \u00B7 ${item.neighborhood}` : ""}
            {item.priceRange ? ` \u00B7 ${item.priceRange}` : ""}
          </Text>
          <View style={styles.heroStripRow2}>
            <StarRating score={item.weightedScore} />
            <Text style={styles.heroStripRatings}>{item.ratingCount.toLocaleString()} ratings</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => router.push({ pathname: "/business/[id]", params: { id: item.slug } })}
        >
          <Text style={styles.heroStripLink}>{"View Profile \u2192"}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function PhotoStrip({ photos, height, category, containerWidth }: { photos: string[]; height: number; category?: string; containerWidth: number }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const stripPhotos = photos.slice(0, 3);
  const stripWidth = containerWidth;

  if (stripPhotos.length === 0) {
    return (
      <LinearGradient
        colors={[AMBER, BRAND.colors.navy]}
        style={[styles.photoStripFallback, { height }]}
      >
        <Text style={styles.mosaicFallbackEmoji}>
          {getCategoryDisplay(category || "").emoji}
        </Text>
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
        <View style={styles.dotRow}>
          {stripPhotos.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  );
}

const RankedCard = React.memo(function RankedCard({ item }: { item: MappedBusiness }) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = Math.min(screenWidth, 600) - CARD_PADDING * 2;
  const photos = item.photoUrls && item.photoUrls.length > 0 ? item.photoUrls : (item.photoUrl ? [item.photoUrl] : []);
  const catDisplay = getCategoryDisplay(item.category);
  const rankLabel = getRankDisplay(item.rank);

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => router.push({ pathname: "/business/[id]", params: { id: item.slug } })}
      style={styles.rankedCard}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ranked ${rankLabel}, score ${item.weightedScore.toFixed(1)}, ${item.ratingCount.toLocaleString()} ratings`}
    >
      <View style={styles.rankedPhotoStripWrap}>
        <PhotoStrip photos={photos} height={140} category={item.category} containerWidth={cardWidth} />
        {/* Rank badge overlaid top-left */}
        <View style={[
          styles.rankBadge,
          item.rank === 2 && styles.rankBadgeSilver,
          item.rank === 3 && styles.rankBadgeBronze,
        ]}>
          <Text style={styles.rankBadgeText}>{rankLabel}</Text>
        </View>
      </View>
      <View style={styles.rankedInfo}>
        <View style={styles.rankedRow1}>
          <Text style={styles.rankedName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.rankedScore}>{"\u2B50"} {item.weightedScore.toFixed(1)}</Text>
        </View>
        <Text style={styles.rankedMeta} numberOfLines={1}>
          {catDisplay.emoji} {catDisplay.label}
          {item.neighborhood ? ` \u00B7 ${item.neighborhood}` : ""}
          {item.priceRange ? ` \u00B7 ${item.priceRange}` : ""}
        </Text>
        <View style={styles.rankedRow3}>
          <Text style={styles.rankedRatingCount}>{item.ratingCount.toLocaleString()} ratings</Text>
          {item.rankDelta !== 0 && (
            <Text style={[styles.rankedDelta, { color: item.rankDelta > 0 ? Colors.green : Colors.red }]}>
              {item.rankDelta > 0 ? "\u2191" : "\u2193"}{Math.abs(item.rankDelta)}
            </Text>
          )}
          {item.isOpenNow !== undefined && (
            <View style={[styles.statusPillSmall, item.isOpenNow ? styles.statusPillOpen : styles.statusPillClosed]}>
              <Text style={styles.statusPillSmallText}>{item.isOpenNow ? "OPEN" : "CLOSED"}</Text>
            </View>
          )}
          {item.isChallenger && (
            <View style={styles.challengerPill}>
              <Ionicons name="flash" size={9} color={BRAND.colors.navy} />
              <Text style={styles.challengerPillText}>IN CHALLENGE</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState<string>("restaurant");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch dynamic categories from API
  const { data: dbCategories = [] } = useQuery({
    queryKey: ["categories", "Dallas"],
    queryFn: () => fetchCategories("Dallas"),
    staleTime: 60000,
  });

  // Build chip list from dynamic categories, fallback to default while loading
  const categoryChips = useMemo(() => dbCategories.length > 0
    ? dbCategories.map((slug: string) => {
        const d = getCategoryDisplay(slug);
        return { slug, label: d.label, emoji: d.emoji };
      })
    : [{ slug: "restaurant", label: "Restaurants", emoji: getCategoryDisplay("restaurant").emoji }],
    [dbCategories]);

  const { data: businesses = [], isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["leaderboard", "Dallas", activeCategory],
    queryFn: () => fetchLeaderboard("Dallas", activeCategory, 50),
    staleTime: 30000,
  });

  const onRefresh = useCallback(() => { refetch(); }, [refetch]);

  // Filter by search query
  const filteredBiz = useMemo(() => {
    if (!searchQuery.trim()) return businesses;
    const q = searchQuery.toLowerCase();
    return businesses.filter((b: MappedBusiness) =>
      b.name.toLowerCase().includes(q) ||
      (b.neighborhood && b.neighborhood.toLowerCase().includes(q))
    );
  }, [businesses, searchQuery]);

  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const heroBiz = filteredBiz.length > 0 ? filteredBiz[0] : null;
  const restBiz = useMemo(() => filteredBiz.slice(1), [filteredBiz]);

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <AppLogo size="md" />
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.citySelector}
            onPress={() => {
              if (Platform.OS === "web") {
                window.alert("More cities coming soon!");
              } else {
                Alert.alert("Coming Soon", "More cities will be available in a future update.");
              }
            }}
            accessibilityRole="button"
            accessibilityLabel="Select city, currently Dallas"
          >
            <Ionicons name="location-sharp" size={14} color={AMBER} />
            <Text style={styles.citySelectorText}>Dallas</Text>
            <Ionicons name="chevron-down" size={14} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color={Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Filter this list..."
          placeholderTextColor={Colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel="Search restaurants and dishes"
          returnKeyType="search"
        />
        {!!searchQuery && (
          <TouchableOpacity onPress={() => setSearchQuery("")} hitSlop={8} accessibilityRole="button" accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
        style={styles.chipsRow}
      >
        {categoryChips.map((chip) => {
          const isActive = activeCategory === chip.slug;
          return (
            <TouchableOpacity
              key={chip.slug}
              onPress={() => {
                Haptics.selectionAsync();
                setActiveCategory(chip.slug);
              }}
              style={[styles.chip, isActive && styles.chipActive]}
              accessibilityRole="button"
              accessibilityLabel={`${chip.label} category${isActive ? ", selected" : ""}`}
              accessibilityState={{ selected: isActive }}
            >
              <View style={[styles.chipEmojiCircle, isActive && styles.chipEmojiCircleActive]}>
                <Text style={styles.chipEmoji}>{chip.emoji}</Text>
              </View>
              <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
                {chip.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {isLoading ? (
        <LeaderboardSkeleton />
      ) : isError ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="cloud-offline-outline" size={36} color={Colors.textTertiary} style={styles.errorIcon} />
          <Text style={styles.emptyText}>Could not load rankings</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryButton} accessibilityRole="button" accessibilityLabel="Retry loading rankings">
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={restBiz}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <RankedCard item={item} />}
          contentContainerStyle={[
            styles.list,
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
          ListHeaderComponent={heroBiz ? <HeroCard item={heroBiz} categoryLabel={getCategoryDisplay(activeCategory).label} /> : null}
          ListFooterComponent={
            restBiz.length > 0 ? (
              <View style={styles.listFooter}>
                <View style={styles.listFooterLine} />
                <Text style={styles.listFooterText}>End of rankings</Text>
                <View style={styles.listFooterLine} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            !heroBiz ? (
              <View style={styles.loadingContainer}>
                <Ionicons name="search-outline" size={36} color={Colors.textTertiary} style={styles.errorIcon} />
                <Text style={styles.emptyText}>No businesses found</Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery.trim() ? `No matches for "${searchQuery}"` : "Try a different category"}
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  errorIcon: { marginBottom: 12 },

  // Photo Mosaic
  mosaicFallback: { alignItems: "center", justifyContent: "center" },
  mosaicFallbackEmoji: { fontSize: 40, color: "rgba(255,255,255,0.5)" },
  mosaicFull: { width: "100%" as any },
  mosaicRow: { flexDirection: "row", gap: 3 },
  mosaicMainPhoto: { width: "60%" },
  mosaicFlex: { flex: 1 },
  mosaicSideColumn: { flex: 1, gap: 3 },
  starRow: { flexDirection: "row", gap: 1 },
  heroPhotoWrap: { position: "relative" as const },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 10,
    paddingTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  citySelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    ...Colors.cardShadow,
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  citySelectorText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceRaised,
    paddingHorizontal: 14,
    gap: 8,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    fontFamily: "DMSans_400Regular",
  },

  chipsRow: { flexGrow: 0, minHeight: 52, marginBottom: 12 },
  chipsContainer: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: "row",
    paddingVertical: 6,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 100,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: AMBER,
    borderColor: AMBER,
    shadowColor: AMBER,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  chipEmojiCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  chipEmojiCircleActive: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  chipEmoji: {
    fontSize: 13,
  },
  chipLabel: {
    fontSize: 13,
    fontFamily: "DMSans_600SemiBold",
    color: Colors.text,
  },
  chipLabelActive: {
    color: "#FFFFFF",
    fontFamily: "DMSans_700Bold",
  },

  list: { paddingHorizontal: CARD_PADDING, gap: 10, paddingTop: 4 },

  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 },
  emptyText: { fontSize: 16, color: Colors.textSecondary, fontFamily: "DMSans_600SemiBold" },
  emptySubtext: { fontSize: 13, color: Colors.textTertiary, fontFamily: "DMSans_400Regular", marginTop: 4 },
  listFooter: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 20, paddingHorizontal: 16 },
  listFooterLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  listFooterText: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },

  retryButton: {
    marginTop: 12, paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: AMBER, borderRadius: 10,
  },
  retryButtonText: {
    color: "#fff", fontWeight: "600", fontFamily: "DMSans_600SemiBold", fontSize: 13,
  },

  // Hero Card (#1)
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 0,
    marginBottom: 4,
    ...Colors.cardShadow,
  },
  heroGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
  },
  heroCrownBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  heroCrownText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFD700",
    fontFamily: "DMSans_700Bold",
    letterSpacing: 0.5,
  },
  heroOpenPill: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  heroName: {
    position: "absolute",
    bottom: 12,
    left: 14,
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "PlayfairDisplay_700Bold",
    letterSpacing: -0.3,
    maxWidth: "60%",
  },
  heroScore: {
    position: "absolute",
    bottom: 12,
    right: 14,
    fontSize: 26,
    fontWeight: "900",
    color: "#FFD700",
    fontFamily: "PlayfairDisplay_900Black",
    letterSpacing: -0.5,
  },
  openPillOpen: { backgroundColor: Colors.green },
  openPillClosed: { backgroundColor: Colors.red },
  openPillText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "DMSans_700Bold",
    letterSpacing: 0.5,
  },
  heroStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  heroStripLeft: { gap: 4, flex: 1 },
  heroStripRow2: { flexDirection: "row", alignItems: "center", gap: 8 },
  heroStripCategory: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "DMSans_500Medium",
  },
  heroStripRatings: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  heroStripLink: {
    fontSize: 12,
    color: AMBER,
    fontFamily: "DMSans_600SemiBold",
  },

  // Photo Strip (swipeable)
  photoStripFallback: { alignItems: "center", justifyContent: "center" },
  dotRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    paddingVertical: 6,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  dotActive: {
    backgroundColor: AMBER,
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Ranked Cards (#2+)
  rankedCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 2,
  },
  rankedPhotoStripWrap: {
    position: "relative" as const,
  },
  rankBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: AMBER,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  rankBadgeSilver: { backgroundColor: Colors.silver },
  rankBadgeBronze: { backgroundColor: Colors.bronze },
  rankBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#fff",
    fontFamily: "PlayfairDisplay_900Black",
  },
  rankedInfo: {
    padding: 12,
    gap: 4,
  },
  rankedRow1: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rankedName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold",
    flex: 1,
    marginRight: 8,
  },
  rankedMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "DMSans_500Medium",
  },
  rankedRow3: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  rankedScore: {
    fontSize: 15,
    fontWeight: "900",
    color: AMBER,
    fontFamily: "PlayfairDisplay_900Black",
  },
  rankedRatingCount: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  rankedDelta: {
    fontSize: 11,
    fontFamily: "DMSans_500Medium",
  },
  rankedRow4: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 1,
  },
  statusPillSmall: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 99,
  },
  statusPillOpen: { backgroundColor: Colors.green },
  statusPillClosed: { backgroundColor: Colors.red },
  statusPillSmallText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#fff",
    fontFamily: "DMSans_600SemiBold",
    letterSpacing: 0.3,
  },
  challengerPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 99,
    backgroundColor: "rgba(13,27,42,0.08)",
  },
  challengerPillText: {
    fontSize: 8,
    fontWeight: "700",
    color: BRAND.colors.navy,
    fontFamily: "DMSans_700Bold",
    letterSpacing: 0.3,
  },
});
