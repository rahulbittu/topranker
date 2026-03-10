import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ScrollView, Platform, Modal,
  TextInput, RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/constants/colors";
import { getCategoryDisplay, BRAND } from "@/constants/brand";
import { getActiveCategories, getCategoriesByCuisine, getAvailableCuisines, CUISINE_DISPLAY, BestInCategory } from "@/shared/best-in-categories";
import { fetchLeaderboard, fetchCategories, submitCategorySuggestion } from "@/lib/api";
import { SuggestCategory } from "@/components/categories/SuggestCategory";
import { formatTimeAgo } from "@/lib/data";
import { AppLogo } from "@/components/Logo";
import { LeaderboardSkeleton } from "@/components/Skeleton";
import { useCity, SUPPORTED_CITIES } from "@/lib/city-context";
import { MappedBusiness } from "@/types/business";
import { HeroCard, RankedCard } from "@/components/leaderboard/SubComponents";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Analytics } from "@/lib/analytics";
import { FadeInView } from "@/components/animations/FadeInView";
import EmptyStateAnimation from "@/components/animations/EmptyStateAnimation";

const AMBER = BRAND.colors.amber;
const CARD_PADDING = 16;
const RANKED_CARD_HEIGHT = 222;

export default function LeaderboardScreen() {

  const insets = useSafeAreaInsets();
  const { city, setCity } = useCity();
  const [activeCategory, setActiveCategory] = useState<string>("restaurant");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [selectedBestIn, setSelectedBestIn] = useState<string | null>(null);
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const availableCuisines = useMemo(() => getAvailableCuisines(), []);
  const bestInCategories = useMemo(() =>
    selectedCuisine ? getCategoriesByCuisine(selectedCuisine) : getActiveCategories(),
    [selectedCuisine],
  );

  useEffect(() => {
    AsyncStorage.getItem("banner_dismissed").then((val) => {
      if (val !== "true") setShowBanner(true);
    });
  }, []);

  // Fetch dynamic categories from API
  const { data: dbCategories = [] } = useQuery({
    queryKey: ["categories", city],
    queryFn: () => fetchCategories(city),
    staleTime: 300000,
  });

  // Build chip list from dynamic categories, fallback to default while loading
  const categoryChips = useMemo(() => dbCategories.length > 0
    ? dbCategories.map((slug: string) => {
        const d = getCategoryDisplay(slug);
        return { slug, label: d.label, emoji: d.emoji };
      })
    : [{ slug: "restaurant", label: "Restaurants", emoji: getCategoryDisplay("restaurant").emoji }],
    [dbCategories]);

  const { data: businesses = [], isLoading, isError, refetch, isRefetching, dataUpdatedAt } = useQuery({
    queryKey: ["leaderboard", city, activeCategory, selectedCuisine],
    queryFn: () => fetchLeaderboard(city, activeCategory, 50, selectedCuisine || undefined),
    staleTime: 30000,
  });

  const onRefresh = useCallback(() => { Haptics.selectionAsync(); refetch(); }, [refetch]);

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
    <ErrorBoundary>
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <View>
          <AppLogo size="md" />
          <Text style={styles.headerSubtitle}>Find the best in {city}, with confidence</Text>
          {dataUpdatedAt > 0 && (
            <Text style={styles.lastUpdated}>Rankings updated {formatTimeAgo(dataUpdatedAt)}</Text>
          )}
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.citySelector}
            onPress={() => setShowCityPicker(!showCityPicker)}
            accessibilityRole="button"
            accessibilityLabel={`Select city, currently ${city}`}
          >
            <Ionicons name="location-sharp" size={14} color={AMBER} />
            <Text style={styles.citySelectorText}>{city}</Text>
            <Ionicons name="chevron-down" size={14} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {showCityPicker && (
        <View style={styles.cityPickerDropdown}>
          {SUPPORTED_CITIES.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.cityPickerItem, c === city && styles.cityPickerItemActive]}
              onPress={() => { setCity(c); setShowCityPicker(false); Haptics.selectionAsync(); }}
              accessibilityRole="button"
              accessibilityLabel={`Switch to ${c}`}
            >
              <Ionicons name="location-sharp" size={12} color={c === city ? AMBER : Colors.textTertiary} />
              <Text style={[styles.cityPickerText, c === city && styles.cityPickerTextActive]}>{c}</Text>
              {c === city && <Ionicons name="checkmark" size={14} color={AMBER} />}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Search Bar */}
      <TouchableOpacity
        style={styles.searchBar}
        activeOpacity={0.9}
        onPress={() => router.push("/(tabs)/search")}
        accessibilityRole="search"
        accessibilityLabel="Search for restaurants, dishes, and more"
      >
        <View style={styles.searchIconCircle}>
          <Ionicons name="search" size={14} color={AMBER} />
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Find the best of what you want..."
          placeholderTextColor={Colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          maxLength={100}
          accessibilityLabel="Search restaurants and dishes"
          returnKeyType="search"
        />
        {!!searchQuery && (
          <TouchableOpacity onPress={() => setSearchQuery("")} hitSlop={8} accessibilityRole="button" accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

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
              accessibilityHint="Double tap to view this category"
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
        <TouchableOpacity
          onPress={() => { Haptics.selectionAsync(); setShowSuggest(true); }}
          style={styles.suggestChip}
          accessibilityRole="button"
          accessibilityLabel="Suggest a new category"
        >
          <Ionicons name="add-circle-outline" size={16} color={AMBER} />
          <Text style={styles.suggestChipText}>Suggest</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Best In Dallas — Cuisine Picker + Subcategory Chips */}
      <View style={styles.bestInHeader}>
        <Text style={styles.bestInTitle}>Best In {city}</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cuisineChipsContainer}
        style={styles.bestInChipsRow}
      >
        <TouchableOpacity
          onPress={() => { Haptics.selectionAsync(); setSelectedCuisine(null); setSelectedBestIn(null); Analytics.cuisineFilterClear("rankings"); }}
          style={[styles.cuisineChip, selectedCuisine === null && styles.cuisineChipActive]}
          accessibilityRole="button"
          accessibilityLabel={`All cuisines${selectedCuisine === null ? ", selected" : ""}`}
          accessibilityState={{ selected: selectedCuisine === null }}
        >
          <Text style={[styles.cuisineChipText, selectedCuisine === null && styles.cuisineChipTextActive]}>All</Text>
        </TouchableOpacity>
        {availableCuisines.filter(c => c !== "universal").map((cuisine) => {
          const display = CUISINE_DISPLAY[cuisine] || { label: cuisine, emoji: "" };
          const isSelected = selectedCuisine === cuisine;
          return (
            <TouchableOpacity
              key={cuisine}
              onPress={() => { Haptics.selectionAsync(); setSelectedCuisine(cuisine); setSelectedBestIn(null); Analytics.cuisineFilterSelect(cuisine, "rankings"); }}
              style={[styles.cuisineChip, isSelected && styles.cuisineChipActive]}
              accessibilityRole="button"
              accessibilityLabel={`${display.label} cuisine${isSelected ? ", selected" : ""}`}
              accessibilityState={{ selected: isSelected }}
            >
              <Text style={[styles.cuisineChipText, isSelected && styles.cuisineChipTextActive]}>
                {display.emoji} {display.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.bestInChipsContainer}
        style={styles.bestInChipsRow}
      >
        <TouchableOpacity
          onPress={() => { Haptics.selectionAsync(); setSelectedBestIn(null); }}
          style={[styles.bestInChip, selectedBestIn === null && styles.bestInChipActive]}
          accessibilityRole="button"
          accessibilityLabel={`All items${selectedBestIn === null ? ", selected" : ""}`}
          accessibilityState={{ selected: selectedBestIn === null }}
        >
          <Text style={[styles.bestInChipText, selectedBestIn === null && styles.bestInChipTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        {bestInCategories.map((cat) => {
          const isSelected = selectedBestIn === cat.slug;
          return (
            <TouchableOpacity
              key={cat.slug}
              onPress={() => { Haptics.selectionAsync(); setSelectedBestIn(cat.slug); }}
              style={[styles.bestInChip, isSelected && styles.bestInChipActive]}
              accessibilityRole="button"
              accessibilityLabel={`Best ${cat.displayName}${isSelected ? ", selected" : ""}`}
              accessibilityState={{ selected: isSelected }}
            >
              <Text style={[styles.bestInChipText, isSelected && styles.bestInChipTextActive]}>
                {cat.emoji} {cat.displayName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Modal visible={showSuggest} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <SuggestCategory
            onSubmit={(s) => submitCategorySuggestion(s).catch(() => {})}
            onClose={() => setShowSuggest(false)}
          />
        </View>
      </Modal>

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
          renderItem={({ item, index }) => (
            <FadeInView delay={index * 100}>
              <RankedCard item={item} index={index} />
            </FadeInView>
          )}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 90 }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          getItemLayout={(_, index) => ({ length: RANKED_CARD_HEIGHT, offset: RANKED_CARD_HEIGHT * index, index })}
          initialNumToRender={8}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews={Platform.OS !== "web"}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={AMBER} />
          }
          ListHeaderComponent={
            <>
              {showBanner && (
                <View style={styles.welcomeBanner}>
                  <Text style={styles.welcomeBannerText}>Trust-weighted rankings by real people.</Text>
                  <Text style={styles.welcomeBannerSubtext}>Rate businesses you've visited to build your credibility.</Text>
                  <TouchableOpacity
                    style={styles.welcomeBannerClose}
                    onPress={() => { AsyncStorage.setItem("banner_dismissed", "true"); setShowBanner(false); }}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Dismiss welcome banner"
                  >
                    <Ionicons name="close" size={16} color="rgba(255,255,255,0.5)" />
                  </TouchableOpacity>
                </View>
              )}
              {heroBiz ? <HeroCard item={heroBiz} categoryLabel={getCategoryDisplay(activeCategory).label} /> : null}
              {/* Sprint 299: Rankings summary — count + cuisine + last updated */}
              {filteredBiz.length > 0 && (
                <View style={styles.rankingSummary}>
                  <Text style={styles.rankingSummaryText}>
                    {filteredBiz.length} {selectedCuisine && CUISINE_DISPLAY[selectedCuisine] ? `${CUISINE_DISPLAY[selectedCuisine].label} ` : ""}{getCategoryDisplay(activeCategory).label.toLowerCase()} ranked
                  </Text>
                  {dataUpdatedAt > 0 && (
                    <Text style={styles.rankingSummaryTime}>
                      Updated {formatTimeAgo(dataUpdatedAt)}
                    </Text>
                  )}
                </View>
              )}
            </>
          }
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
              <EmptyStateAnimation
                message={searchQuery.trim() ? `No matches for "${searchQuery}"` : "No businesses found. Try a different category."}
                icon="search-outline"
                style={{ marginTop: 24 }}
              />
            ) : null
          }
        />
      )}
    </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  errorIcon: { marginBottom: 12 },

  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingBottom: 10, paddingTop: 2,
  },
  headerSubtitle: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular", marginTop: 2 },
  lastUpdated: { fontSize: 9, color: Colors.textTertiary, fontFamily: "DMSans_400Regular", marginTop: 1, opacity: 0.7 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  citySelector: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: Colors.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    ...Colors.cardShadow, shadowOpacity: 0.04, shadowRadius: 6,
  },
  citySelectorText: { fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  cityPickerDropdown: {
    backgroundColor: Colors.surface, borderRadius: 12,
    marginHorizontal: 16, marginBottom: 8, borderWidth: 1, borderColor: Colors.border, overflow: "hidden",
  },
  cityPickerItem: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  cityPickerItemActive: { backgroundColor: Colors.goldFaint },
  cityPickerText: { flex: 1, fontSize: 14, color: Colors.textSecondary, fontFamily: "DMSans_500Medium" },
  cityPickerTextActive: { color: Colors.text, fontFamily: "DMSans_600SemiBold" },

  searchBar: {
    flexDirection: "row", alignItems: "center", marginHorizontal: 16,
    height: 48, borderRadius: 24, backgroundColor: Colors.surface,
    paddingHorizontal: 6, paddingRight: 14, gap: 10, marginBottom: 8,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  searchIconCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: `${AMBER}12`, alignItems: "center", justifyContent: "center",
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.text, fontFamily: "DMSans_400Regular" },

  chipsRow: { flexGrow: 0, minHeight: 52, marginBottom: 12 },
  chipsContainer: { paddingHorizontal: 16, gap: 8, flexDirection: "row", paddingVertical: 6 },
  chip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, height: 38, borderRadius: 100,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: AMBER, borderColor: AMBER,
    shadowColor: AMBER, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  chipEmojiCircle: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.04)", alignItems: "center", justifyContent: "center",
  },
  chipEmojiCircleActive: { backgroundColor: "rgba(255,255,255,0.2)" },
  chipEmoji: { fontSize: 13 },
  chipLabel: { fontSize: 13, fontFamily: "DMSans_600SemiBold", color: Colors.text },
  chipLabelActive: { color: "#FFFFFF", fontFamily: "DMSans_700Bold" },

  list: { paddingHorizontal: CARD_PADDING, gap: 10, paddingTop: 4 },

  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 },
  emptyText: { fontSize: 16, color: Colors.textSecondary, fontFamily: "DMSans_600SemiBold" },
  emptySubtext: { fontSize: 13, color: Colors.textTertiary, fontFamily: "DMSans_400Regular", marginTop: 4 },
  rankingSummary: {
    flexDirection: "row" as const, alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 6, marginBottom: 4,
  },
  rankingSummaryText: {
    fontSize: 12, fontWeight: "500" as const, color: Colors.textSecondary, fontFamily: "DMSans_500Medium",
  },
  rankingSummaryTime: {
    fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
  },
  listFooter: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 20, paddingHorizontal: 16 },
  listFooterLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  listFooterText: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },

  retryButton: {
    marginTop: 12, paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: AMBER, borderRadius: 10,
  },
  retryButtonText: { color: "#fff", fontWeight: "600", fontFamily: "DMSans_600SemiBold", fontSize: 13 },

  bestInHeader: {
    paddingHorizontal: 20, paddingTop: 2, paddingBottom: 4,
  },
  bestInTitle: {
    fontSize: 15, fontFamily: "DMSans_700Bold", color: Colors.text,
  },
  bestInChipsRow: { flexGrow: 0, minHeight: 44, marginBottom: 4 },
  bestInChipsContainer: { paddingHorizontal: 16, flexDirection: "row", paddingVertical: 4 },
  cuisineChipsContainer: { paddingHorizontal: 16, flexDirection: "row", paddingVertical: 4 },
  cuisineChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    marginRight: 6, backgroundColor: "rgba(13, 27, 42, 0.06)",
    borderWidth: 1, borderColor: "transparent",
  },
  cuisineChipActive: {
    backgroundColor: "rgba(13, 27, 42, 0.12)", borderColor: BRAND.colors.navy,
  },
  cuisineChipText: {
    fontSize: 12, fontFamily: "DMSans_500Medium", color: Colors.textSecondary,
  },
  cuisineChipTextActive: {
    color: BRAND.colors.navy, fontFamily: "DMSans_700Bold",
  },
  bestInChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    marginRight: 8, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
  },
  bestInChipActive: {
    backgroundColor: AMBER, borderColor: AMBER,
  },
  bestInChipText: {
    fontSize: 13, fontFamily: "DMSans_600SemiBold", color: Colors.text,
  },
  bestInChipTextActive: {
    color: "#FFFFFF",
  },

  suggestChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 14, height: 38, borderRadius: 100,
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: AMBER, borderStyle: "dashed",
  },
  suggestChipText: { fontSize: 12, fontFamily: "DMSans_600SemiBold", color: AMBER },
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center",
  },
  welcomeBanner: {
    backgroundColor: "#0D1B2A", borderRadius: 12,
    padding: 16, marginBottom: 12, marginHorizontal: 0,
    position: "relative" as const,
  },
  welcomeBannerText: {
    color: "#FFFFFF", fontSize: 14, fontFamily: "DMSans_600SemiBold",
    paddingRight: 24,
  },
  welcomeBannerSubtext: {
    color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "DMSans_400Regular",
    marginTop: 4, paddingRight: 24,
  },
  welcomeBannerClose: {
    position: "absolute" as const, top: 12, right: 12,
  },
});
