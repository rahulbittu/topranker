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
import { getRankDisplay } from "@/lib/data";
import { fetchLeaderboard } from "@/lib/api";
import { AppLogo } from "@/components/Logo";

const AMBER = "#C49A1A";
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

const CATEGORY_CHIPS = [
  { slug: "all", label: "All", emoji: "\u2728" },
  { slug: "restaurant", label: "Restaurants", emoji: "\u{1F37D}" },
  { slug: "fast_food", label: "Fast Food", emoji: "\u{1F354}" },
  { slug: "fine_dining", label: "Fine Dining", emoji: "\u{1F942}" },
  { slug: "casual_dining", label: "Casual Dining", emoji: "\u{1F373}" },
  { slug: "cafe", label: "Cafes", emoji: "\u2615" },
  { slug: "bakery", label: "Bakeries", emoji: "\u{1F950}" },
  { slug: "street_food", label: "Street Food", emoji: "\u{1F32E}" },
  { slug: "bar", label: "Bars", emoji: "\u{1F37A}" },
];

function PhotoMosaic({ photos, height }: { photos: string[]; height: number }) {
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

  if (photos.length === 2) {
    return (
      <View style={{ flexDirection: "row", height, gap: 2 }}>
        <Image source={{ uri: photos[0] }} style={{ width: "60%", height }} resizeMode="cover" />
        <Image source={{ uri: photos[1] }} style={{ flex: 1, height }} resizeMode="cover" />
      </View>
    );
  }

  // 3+ photos: left 60% one large, right two stacked with 2px gap
  return (
    <View style={{ flexDirection: "row", height, gap: 2 }}>
      <Image source={{ uri: photos[0] }} style={{ width: "60%", height }} resizeMode="cover" />
      <View style={{ flex: 1, gap: 2 }}>
        <Image source={{ uri: photos[1] }} style={{ flex: 1 }} resizeMode="cover" />
        <Image source={{ uri: photos[2] }} style={{ flex: 1 }} resizeMode="cover" />
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
    return <Text style={styles.moveUp}>{"\u2191"}{delta}</Text>;
  }
  if (delta < 0) {
    return <Text style={styles.moveDown}>{"\u2193"}{Math.abs(delta)}</Text>;
  }
  return null;
}

function BusinessCard({ item }: { item: MappedBusiness }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const photos = item.photoUrls && item.photoUrls.length > 0 ? item.photoUrls : (item.photoUrl ? [item.photoUrl] : []);
  const isFirst = item.rank === 1;
  const rankLabel = getRankDisplay(item.rank);

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
        <PhotoMosaic photos={photos} height={180} />

        <View style={styles.cardBody}>
          <View style={styles.cardInfoRow}>
            <View style={styles.cardInfoLeft}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={[styles.cardRankText, isFirst && { color: AMBER }]}>{rankLabel}</Text>
                <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
              </View>
              <Text style={styles.cardMeta} numberOfLines={1}>
                {item.neighborhood}{item.priceRange ? ` \u00B7 ${item.priceRange}` : ""}
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
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ["leaderboard", "Dallas", activeCategory === "all" ? "restaurant" : activeCategory],
    queryFn: () => fetchLeaderboard("Dallas", activeCategory === "all" ? "restaurant" : activeCategory, 20),
    staleTime: 30000,
  });

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <AppLogo size="md" />
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.citySelector}>
            <Ionicons name="location-sharp" size={14} color={AMBER} />
            <Text style={styles.citySelectorText}>Dallas</Text>
            <Ionicons name="chevron-down" size={14} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
        style={styles.chipsRow}
      >
        {CATEGORY_CHIPS.map((chip) => {
          const isActive = activeCategory === chip.slug;
          return (
            <TouchableOpacity
              key={chip.slug}
              onPress={() => setActiveCategory(chip.slug)}
              style={[styles.chip, isActive && styles.chipActive]}
            >
              <View style={styles.chipEmojiBubble}>
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
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 14,
    paddingTop: 4,
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

  chipsRow: { flexGrow: 0, marginBottom: 10 },
  chipsContainer: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: "row",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: AMBER,
    borderColor: AMBER,
  },
  chipEmojiBubble: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  chipEmoji: {
    fontSize: 12,
  },
  chipLabel: {
    fontSize: 13,
    fontFamily: "DMSans_500Medium",
    color: Colors.text,
  },
  chipLabelActive: {
    color: "#FFFFFF",
    fontFamily: "DMSans_700Bold",
  },

  list: { paddingHorizontal: CARD_PADDING, gap: 14, paddingTop: 6 },

  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 },
  emptyText: { fontSize: 16, color: Colors.textSecondary, fontFamily: "DMSans_600SemiBold" },
  emptySubtext: { fontSize: 13, color: Colors.textTertiary, fontFamily: "DMSans_400Regular", marginTop: 4 },

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

  cardBody: {
    padding: 14,
    gap: 6,
  },
  cardRankText: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "PlayfairDisplay_700Bold",
    color: Colors.text,
  },
  cardInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  cardInfoLeft: {
    flex: 1,
    gap: 2,
  },
  cardName: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold",
    letterSpacing: -0.2,
    flex: 1,
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
