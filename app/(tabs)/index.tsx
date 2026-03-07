import React, { useState, useRef, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ScrollView, Platform, Animated, ActivityIndicator, Image,
  Dimensions, NativeScrollEvent, NativeSyntheticEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { formatCategoryLabel } from "@/lib/data";
import { fetchLeaderboard, fetchCategories } from "@/lib/api";

const AMBER = "#B8860B";
const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_PADDING = 14;
const CARD_WIDTH = SCREEN_WIDTH - CARD_PADDING * 2;

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

function PhotoCarousel({ photos, height }: { photos: string[]; height: number }) {
  const [activeIdx, setActiveIdx] = useState(0);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH));
    setActiveIdx(idx);
  }, []);

  if (photos.length === 0) {
    return (
      <View style={[styles.photoCarouselPlaceholder, { height }]}>
        <Ionicons name="restaurant-outline" size={32} color={Colors.textTertiary} />
      </View>
    );
  }

  if (photos.length === 1) {
    return (
      <Image source={{ uri: photos[0] }} style={[styles.heroPhoto, { height }]} resizeMode="cover" />
    );
  }

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ height }}
      >
        {photos.map((url, i) => (
          <Image key={i} source={{ uri: url }} style={[styles.heroPhoto, { width: CARD_WIDTH, height }]} resizeMode="cover" />
        ))}
      </ScrollView>
      <View style={styles.dotContainer}>
        {photos.map((_, i) => (
          <View key={i} style={[styles.dot, i === activeIdx ? styles.dotActive : styles.dotInactive]} />
        ))}
      </View>
    </View>
  );
}

function OpenStatusText({ isOpen }: { isOpen?: boolean }) {
  if (isOpen === undefined || isOpen === null) return null;
  return (
    <Text style={[
      styles.statusText,
      { color: isOpen ? Colors.green : Colors.red, textTransform: "uppercase" as const }
    ]}>
      {isOpen ? "Open" : "Closed"}
    </Text>
  );
}

function MovementIndicator({ delta }: { delta: number }) {
  if (delta > 0) {
    return <Text style={styles.moveUp}>↑{delta}</Text>;
  }
  if (delta < 0) {
    return <Text style={styles.moveDown}>↓{Math.abs(delta)}</Text>;
  }
  return null;
}

function BusinessCard({ item }: { item: MappedBusiness }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const photos = item.photoUrls && item.photoUrls.length > 0 ? item.photoUrls : (item.photoUrl ? [item.photoUrl] : []);
  const isFirst = item.rank === 1;

  const onPressIn = () => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50 }).start();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => router.push({ pathname: "/business/[id]", params: { id: item.slug } })}
        style={styles.card}
        testID={`leaderboard-row-${item.rank}`}
      >
        <PhotoCarousel photos={photos} height={180} />

        <View style={styles.cardBody}>
          <View style={styles.cardRankBadge}>
            <Text style={[styles.cardRankText, isFirst && { color: AMBER }]}>{item.rank}</Text>
          </View>

          <View style={styles.cardInfoRow}>
            <View style={styles.cardInfoLeft}>
              <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.cardMeta} numberOfLines={1}>
                {item.neighborhood}{item.priceRange ? ` · ${item.priceRange}` : ""}
              </Text>
              <View style={styles.cardStatusRow}>
                <OpenStatusText isOpen={item.isOpenNow} />
                <MovementIndicator delta={item.rankDelta} />
              </View>
            </View>

            <View style={styles.cardScoreBlock}>
              <Text style={[styles.cardScore, isFirst && { color: AMBER }]}>
                {item.weightedScore.toFixed(1)}
              </Text>
              <Text style={styles.cardRatingCount}>{item.ratingCount} ratings</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState<string>("restaurant");

  const { data: availableCategories = [] } = useQuery({
    queryKey: ["categories", "Dallas"],
    queryFn: () => fetchCategories("Dallas"),
    staleTime: 60000,
  });

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ["leaderboard", "Dallas", activeCategory],
    queryFn: () => fetchLeaderboard("Dallas", activeCategory, 20),
    staleTime: 30000,
  });

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const categoryTabs = availableCategories.length > 0
    ? availableCategories.map((cat: string) => ({
        slug: cat,
        label: formatCategoryLabel(cat),
      }))
    : [{ slug: "restaurant", label: "Restaurants" }];

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Text style={styles.brandTitle}>TOP RANKER</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.citySelector}>
            <Ionicons name="location-sharp" size={14} color={AMBER} />
            <Text style={styles.citySelectorText}>Dallas</Text>
            <Ionicons name="chevron-down" size={14} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContainer}
        style={styles.tabs}
      >
        {categoryTabs.map((cat: { slug: string; label: string }) => {
          const isActive = activeCategory === cat.slug;
          return (
            <TouchableOpacity
              key={cat.slug}
              onPress={() => setActiveCategory(cat.slug)}
              style={styles.tab}
              testID={`category-tab-${cat.slug}`}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {cat.label}
              </Text>
              {isActive && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View style={styles.tabDivider} />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.gold} />
        </View>
      ) : (
        <FlatList
          data={businesses}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <BusinessCard item={item} />}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 90 }
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.loadingContainer}>
              <Ionicons name="search-outline" size={36} color={Colors.textTertiary} style={{ marginBottom: 12 }} />
              <Text style={styles.emptyText}>No businesses found</Text>
              <Text style={styles.emptySubtext}>Try a different category</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 14,
    paddingTop: 4,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.gold,
    fontFamily: "PlayfairDisplay_700Bold",
    letterSpacing: 2,
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
  },
  citySelectorText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },

  tabs: { flexGrow: 0 },
  tabsContainer: {
    paddingHorizontal: 20,
    gap: 24,
    flexDirection: "row",
  },
  tab: {
    paddingBottom: 10,
    position: "relative" as const,
  },
  tabText: {
    fontSize: 14,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  tabTextActive: {
    color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },
  tabUnderline: {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.gold,
    borderRadius: 1,
  },
  tabDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 6,
  },

  list: { paddingHorizontal: CARD_PADDING, gap: 14, paddingTop: 6 },

  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 },
  emptyText: { fontSize: 16, color: Colors.textSecondary, fontFamily: "DMSans_600SemiBold" },
  emptySubtext: { fontSize: 13, color: Colors.textTertiary, fontFamily: "DMSans_400Regular", marginTop: 4 },

  // Card layout with photo carousel
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    ...Colors.cardShadow,
  },
  heroPhoto: {
    width: "100%" as any,
    backgroundColor: Colors.surfaceRaised,
  },
  photoCarouselPlaceholder: {
    backgroundColor: Colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  dotContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    backgroundColor: AMBER,
  },
  dotInactive: {
    backgroundColor: "rgba(255,255,255,0.6)",
  },

  cardBody: {
    padding: 14,
    gap: 6,
  },
  cardRankBadge: {
    position: "absolute",
    top: -18,
    left: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    ...Colors.cardShadow,
  },
  cardRankText: {
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "PlayfairDisplay_700Bold",
    color: Colors.text,
  },
  cardInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingTop: 14,
  },
  cardInfoLeft: {
    flex: 1,
    gap: 2,
  },
  cardName: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "DMSans_700Bold",
    letterSpacing: -0.2,
  },
  cardMeta: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "DMSans_400Regular",
  },
  cardStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "DMSans_600SemiBold",
    letterSpacing: 0.5,
  },
  moveUp: {
    fontSize: 11,
    color: Colors.green,
    fontFamily: "DMSans_500Medium",
  },
  moveDown: {
    fontSize: 11,
    color: Colors.red,
    fontFamily: "DMSans_500Medium",
  },

  cardScoreBlock: {
    alignItems: "flex-end",
    justifyContent: "center",
    minWidth: 56,
  },
  cardScore: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold",
    letterSpacing: -0.5,
  },
  cardRatingCount: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
    marginTop: 1,
  },
});
