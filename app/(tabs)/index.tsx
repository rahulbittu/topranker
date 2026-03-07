import React, { useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ScrollView, Platform, Animated, ActivityIndicator, Image,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { getCategoryDisplay, getRankDisplay } from "@/constants/brand";
import { fetchLeaderboard, fetchCategories } from "@/lib/api";
import { AppLogo } from "@/components/Logo";

const AMBER = "#C49A1A";
const SCREEN_WIDTH = Dimensions.get("window").width;
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
        colors={[AMBER, "#9A7510"]}
        style={[{ height, alignItems: "center", justifyContent: "center" }]}
      >
        <Text style={{ fontSize: 40, color: "rgba(255,255,255,0.5)" }}>
          {getCategoryDisplay(category || "").emoji}
        </Text>
      </LinearGradient>
    );
  }

  if (photos.length === 1) {
    return (
      <Image source={{ uri: photos[0] }} style={{ width: "100%" as any, height }} resizeMode="cover" />
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

function HeroCard({ item }: { item: MappedBusiness }) {
  const photos = item.photoUrls && item.photoUrls.length > 0 ? item.photoUrls : (item.photoUrl ? [item.photoUrl] : []);
  const catDisplay = getCategoryDisplay(item.category);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push({ pathname: "/business/[id]", params: { id: item.slug } })}
      style={styles.heroCard}
    >
      <View style={{ position: "relative" }}>
        <PhotoMosaic photos={photos} height={200} category={item.category} />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.heroGradient}
        />
        {/* Crown badge */}
        <View style={styles.heroCrownBadge}>
          <Text style={styles.heroCrownText}>{"\u{1F451}"} #1 IN DALLAS</Text>
        </View>
        {/* Business name bottom-left */}
        <Text style={styles.heroName} numberOfLines={1}>{item.name}</Text>
        {/* Score bottom-right */}
        <View style={styles.heroScoreArea}>
          {item.isOpenNow !== undefined && (
            <View style={[styles.openPill, item.isOpenNow ? styles.openPillOpen : styles.openPillClosed]}>
              <Text style={styles.openPillText}>{item.isOpenNow ? "OPEN" : "CLOSED"}</Text>
            </View>
          )}
          <Text style={styles.heroScore}>{item.weightedScore.toFixed(1)}</Text>
        </View>
      </View>
      {/* White strip below */}
      <View style={styles.heroStrip}>
        <Text style={styles.heroStripCategory}>{catDisplay.emoji} {catDisplay.label}</Text>
        <TouchableOpacity
          onPress={() => router.push({ pathname: "/business/[id]", params: { id: item.slug } })}
        >
          <Text style={styles.heroStripLink}>{"View Profile \u2192"}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function RankedCard({ item }: { item: MappedBusiness }) {
  const [imgError, setImgError] = useState(false);
  const photos = item.photoUrls && item.photoUrls.length > 0 ? item.photoUrls : (item.photoUrl ? [item.photoUrl] : []);
  const catDisplay = getCategoryDisplay(item.category);
  const rankLabel = getRankDisplay(item.rank);
  const initial = item.name.charAt(0).toUpperCase();

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => router.push({ pathname: "/business/[id]", params: { id: item.slug } })}
      style={styles.rankedCard}
    >
      {photos.length > 0 && !imgError ? (
        <Image
          source={{ uri: photos[0] }}
          style={styles.rankedPhoto}
          onError={() => setImgError(true)}
        />
      ) : (
        <View style={[styles.rankedPhoto, styles.rankedPhotoFallback]}>
          <Text style={styles.rankedPhotoInitial}>{initial}</Text>
        </View>
      )}
      <View style={styles.rankedInfo}>
        <View style={styles.rankedRow1}>
          <Text style={styles.rankedName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.rankedRank}>{rankLabel}</Text>
        </View>
        <Text style={styles.rankedMeta} numberOfLines={1}>
          {catDisplay.emoji} {catDisplay.label}
          {item.neighborhood ? ` \u00B7 ${item.neighborhood}` : ""}
        </Text>
        <View style={styles.rankedRow3}>
          <Text style={styles.rankedScore}>{item.weightedScore.toFixed(1)}</Text>
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
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Fetch dynamic categories from API
  const { data: dbCategories = [] } = useQuery({
    queryKey: ["categories", "Dallas"],
    queryFn: () => fetchCategories("Dallas"),
    staleTime: 60000,
  });

  // Build chip list: "All" first, then dynamic categories from DB
  const categoryChips = [
    { slug: "all", label: "All", emoji: "\u2728" },
    ...dbCategories.map((slug: string) => {
      const d = getCategoryDisplay(slug);
      return { slug, label: d.label, emoji: d.emoji };
    }),
  ];

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ["leaderboard", "Dallas", activeCategory === "all" ? "restaurant" : activeCategory],
    queryFn: () => fetchLeaderboard("Dallas", activeCategory === "all" ? "restaurant" : activeCategory, 20),
    staleTime: 30000,
  });

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const heroBiz = businesses.length > 0 ? businesses[0] : null;
  const restBiz = businesses.slice(1);

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
        {categoryChips.map((chip) => {
          const isActive = activeCategory === chip.slug;
          return (
            <TouchableOpacity
              key={chip.slug}
              onPress={() => setActiveCategory(chip.slug)}
              style={[styles.chip, isActive && styles.chipActive]}
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AMBER} />
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
          ListHeaderComponent={heroBiz ? <HeroCard item={heroBiz} /> : null}
          ListEmptyComponent={
            !heroBiz ? (
              <View style={styles.loadingContainer}>
                <Ionicons name="search-outline" size={36} color={Colors.textTertiary} style={{ marginBottom: 12 }} />
                <Text style={styles.emptyText}>No businesses found</Text>
                <Text style={styles.emptySubtext}>Try a different category</Text>
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
    backgroundColor: "#FFFFFF",
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

  chipsRow: { flexGrow: 0, marginBottom: 8 },
  chipsContainer: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: "row",
    paddingVertical: 2,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 100,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5EA",
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
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(0,0,0,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  chipEmojiCircleActive: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  chipEmoji: {
    fontSize: 14,
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

  // Hero Card (#1)
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 4,
    ...Colors.cardShadow,
  },
  heroGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
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
  heroScoreArea: {
    position: "absolute",
    bottom: 12,
    right: 14,
    alignItems: "flex-end",
    gap: 4,
  },
  heroScore: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FFD700",
    fontFamily: "PlayfairDisplay_900Black",
    letterSpacing: -0.5,
  },
  openPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
  },
  openPillOpen: { backgroundColor: "#34C759" },
  openPillClosed: { backgroundColor: "#FF3B30" },
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
  heroStripCategory: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "DMSans_500Medium",
  },
  heroStripLink: {
    fontSize: 12,
    color: AMBER,
    fontFamily: "DMSans_600SemiBold",
  },

  // Ranked Cards (#2+)
  rankedCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    gap: 14,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  rankedPhoto: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: Colors.surfaceRaised,
  },
  rankedPhotoFallback: {
    backgroundColor: AMBER,
    alignItems: "center",
    justifyContent: "center",
  },
  rankedPhotoInitial: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
  },
  rankedInfo: {
    flex: 1,
    justifyContent: "center",
    gap: 3,
  },
  rankedRow1: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rankedName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold",
    flex: 1,
    marginRight: 8,
  },
  rankedRank: {
    fontSize: 16,
    fontWeight: "700",
    color: AMBER,
    fontFamily: "PlayfairDisplay_900Black",
  },
  rankedMeta: {
    fontSize: 12,
    color: AMBER,
    fontFamily: "DMSans_500Medium",
  },
  rankedRow3: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  rankedScore: {
    fontSize: 18,
    fontWeight: "900",
    color: AMBER,
    fontFamily: "PlayfairDisplay_900Black",
    letterSpacing: -0.3,
  },
  rankedDelta: {
    fontSize: 11,
    fontFamily: "DMSans_500Medium",
  },
  statusPillSmall: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 99,
  },
  statusPillOpen: { backgroundColor: "#34C759" },
  statusPillClosed: { backgroundColor: "#FF3B30" },
  statusPillSmallText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#fff",
    fontFamily: "DMSans_600SemiBold",
    letterSpacing: 0.3,
  },
});
