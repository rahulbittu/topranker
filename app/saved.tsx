import React from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Platform, FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { BRAND, getCategoryDisplay } from "@/constants/brand";
import { useBookmarks, type BookmarkEntry } from "@/lib/bookmarks-context";
import { hapticPress } from "@/lib/audio";

function SavedCard({ item, index }: { item: BookmarkEntry; index: number }) {
  const catDisplay = getCategoryDisplay(item.category);
  const savedDate = new Date(item.savedAt);
  const daysAgo = Math.floor((Date.now() - item.savedAt) / 86400000);
  const timeLabel = daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo}d ago`;

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          hapticPress();
          router.push({ pathname: "/business/[id]", params: { id: item.slug } });
        }}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`View ${item.name}`}
      >
        <View style={styles.cardIcon}>
          <Text style={styles.cardEmoji}>{catDisplay.emoji}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.cardCategory}>{catDisplay.label}</Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.cardTime}>{timeLabel}</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function SavedScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const { savedList, bookmarkCount } = useBookmarks();

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Places</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{bookmarkCount}</Text>
        </View>
      </View>

      {savedList.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="bookmark-outline" size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>No saved places yet</Text>
          <Text style={styles.emptySub}>
            Tap the bookmark icon on any business to save it for later
          </Text>
          <TouchableOpacity
            style={styles.exploreCta}
            onPress={() => { router.replace("/(tabs)/search"); }}
            activeOpacity={0.85}
          >
            <Text style={styles.exploreCtaText}>Explore Businesses</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={savedList}
          renderItem={({ item, index }) => <SavedCard item={item} index={index} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 8,
  },
  backBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  countBadge: {
    backgroundColor: `${BRAND.colors.amber}15`,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countText: {
    fontSize: 13,
    fontWeight: "700",
    color: BRAND.colors.amber,
    fontFamily: "DMSans_700Bold",
  },
  list: { paddingHorizontal: 16, paddingTop: 8 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    ...Colors.cardShadow,
  },
  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: `${BRAND.colors.amber}12`,
    alignItems: "center",
    justifyContent: "center",
  },
  cardEmoji: { fontSize: 20 },
  cardInfo: { flex: 1, gap: 2 },
  cardName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
    fontFamily: "DMSans_600SemiBold",
  },
  cardCategory: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  cardRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardTime: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  emptySub: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: "DMSans_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  exploreCta: {
    backgroundColor: BRAND.colors.amber,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 8,
  },
  exploreCtaText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: "DMSans_700Bold",
  },
});
