import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Platform, Modal,
  TextInput, RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { hapticPullRefresh, hapticPress } from "@/lib/audio";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/constants/colors";
import { getCategoryDisplay, BRAND } from "@/constants/brand";
import { getAvailableCuisines, CUISINE_DISPLAY } from "@/shared/best-in-categories";
import { useDishShortcuts } from "@/lib/hooks/useDishShortcuts";
import { fetchLeaderboard, fetchCategories, fetchNeighborhoods, submitCategorySuggestion } from "@/lib/api";
import { SuggestCategory } from "@/components/categories/SuggestCategory";
import { formatTimeAgo } from "@/lib/data";
import { AppLogo } from "@/components/Logo";
import { LeaderboardSkeleton, SkeletonToContent } from "@/components/Skeleton";
import { useCity, SUPPORTED_CITIES } from "@/lib/city-context";
import { pct } from "@/lib/style-helpers";
import { MappedBusiness } from "@/types/business";
import { RankedCard } from "@/components/leaderboard/SubComponents";
import { RankingsListHeader } from "@/components/leaderboard/RankingsListHeader";
import { CuisineChipRow } from "@/components/leaderboard/CuisineChipRow";
import { LeaderboardFilterChips } from "@/components/leaderboard/LeaderboardFilterChips";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorState } from "@/components/NetworkBanner";
import { FadeInView } from "@/components/animations/FadeInView";
import { TopRankHighlight } from "@/components/animations/TopRankHighlight";
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
  const [selectedCuisine, setSelectedCuisineRaw] = useState<string | null>(null);
  const setSelectedCuisine = useCallback((cuisine: string | null) => {
    setSelectedCuisineRaw(cuisine);
    if (cuisine) {
      AsyncStorage.setItem("rankings_cuisine", cuisine);
    } else {
      AsyncStorage.removeItem("rankings_cuisine");
    }
  }, []);
  const availableCuisines = useMemo(() => getAvailableCuisines(), []);
  // Sprint 312: Dynamic dish shortcuts with real entry counts
  const dishShortcuts = useDishShortcuts(city, selectedCuisine);
  // Sprint 327: Sticky cuisine chips on scroll
  const [showStickyCuisine, setShowStickyCuisine] = useState(false);
  const CUISINE_STICKY_THRESHOLD = 80;

  useEffect(() => {
    AsyncStorage.getItem("banner_dismissed").then((val) => {
      if (val !== "true") setShowBanner(true);
    });
    // Sprint 308: Restore persisted cuisine filter
    AsyncStorage.getItem("rankings_cuisine").then((val) => {
      if (val && availableCuisines.includes(val)) {
        setSelectedCuisineRaw(val);
      }
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

  // Sprint 549: Neighborhood + price range filters
  const [neighborhoodFilter, setNeighborhoodFilter] = useState<string | null>(null);
  const [priceFilter, setPriceFilter] = useState<string | null>(null);

  const { data: neighborhoods = [] } = useQuery({
    queryKey: ["neighborhoods", city],
    queryFn: () => fetchNeighborhoods(city),
    staleTime: 300000,
  });

  const { data: businesses = [], isLoading, isError, refetch, isRefetching, dataUpdatedAt } = useQuery({
    queryKey: ["leaderboard", city, activeCategory, selectedCuisine, neighborhoodFilter, priceFilter],
    queryFn: () => fetchLeaderboard(city, activeCategory, 50, selectedCuisine || undefined, neighborhoodFilter || undefined, priceFilter || undefined),
    staleTime: 30000,
  });

  // Sprint 706: Centralized haptic functions
  const onRefresh = useCallback(() => { hapticPullRefresh(); refetch(); }, [refetch]);

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
              onPress={() => { setCity(c); setShowCityPicker(false); hapticPress(); }}
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

      <Modal visible={showSuggest} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <SuggestCategory
            onSubmit={(s) => submitCategorySuggestion(s).catch(() => {})}
            onClose={() => setShowSuggest(false)}
          />
        </View>
      </Modal>

      {/* Sprint 327/331: Sticky cuisine bar — extracted to CuisineChipRow */}
      {showStickyCuisine && (
        <View style={styles.stickyCuisineBar}>
          <CuisineChipRow
            cuisines={availableCuisines}
            selectedCuisine={selectedCuisine}
            onSelect={setSelectedCuisine}
            analyticsSource="rankings"
            variant="sticky"
          />
        </View>
      )}

      {/* Sprint 553: Extracted to LeaderboardFilterChips */}
      <LeaderboardFilterChips
        neighborhoods={neighborhoods}
        neighborhoodFilter={neighborhoodFilter}
        setNeighborhoodFilter={setNeighborhoodFilter}
        priceFilter={priceFilter}
        setPriceFilter={setPriceFilter}
      />

      {isLoading ? (
        <LeaderboardSkeleton />
      ) : isError ? (
        <ErrorState title="Could not load rankings" onRetry={() => refetch()} />
      ) : (
        <SkeletonToContent visible={!isLoading}>
        <FlatList
          data={restBiz}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => (
            <TopRankHighlight active={item.rank === 1}>
              <RankedCard item={item} index={index} />
            </TopRankHighlight>
          )}
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
          onScroll={(e) => {
            const y = e.nativeEvent.contentOffset.y;
            const shouldShow = y > CUISINE_STICKY_THRESHOLD;
            if (shouldShow !== showStickyCuisine) setShowStickyCuisine(shouldShow);
          }}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor={AMBER} />
          }
          // DoorDash pattern: small top, big middle, small bottom
          ListHeaderComponent={
            <RankingsListHeader
              categoryChips={categoryChips}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              onShowSuggest={() => setShowSuggest(true)}
              availableCuisines={availableCuisines}
              selectedCuisine={selectedCuisine}
              onCuisineChange={setSelectedCuisine}
              dishShortcuts={dishShortcuts}
              showBanner={showBanner}
              onDismissBanner={() => { AsyncStorage.setItem("banner_dismissed", "true"); setShowBanner(false); }}
              heroBiz={heroBiz}
              filteredCount={filteredBiz.length}
              dataUpdatedAt={dataUpdatedAt}
              city={city}
              businesses={filteredBiz}
            />
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
              <View style={styles.emptyStateContainer}>
                <EmptyStateAnimation
                  message={
                    searchQuery.trim()
                      ? `No matches for "${searchQuery}"`
                      : selectedCuisine && CUISINE_DISPLAY[selectedCuisine]
                        ? `No ${CUISINE_DISPLAY[selectedCuisine].label.toLowerCase()} ${getCategoryDisplay(activeCategory).label.toLowerCase()} ranked yet`
                        : "No businesses found. Try a different category."
                  }
                  icon="search-outline"
                  style={{ marginTop: 24 }}
                />
                {/* Sprint 319: Cuisine-aware empty state with dish suggestions */}
                {selectedCuisine && dishShortcuts.length > 0 && !searchQuery.trim() && (
                  <View style={styles.emptyDishSuggestions}>
                    <Text style={styles.emptyDishTitle}>
                      Explore {CUISINE_DISPLAY[selectedCuisine]?.label || selectedCuisine} dish rankings:
                    </Text>
                    {dishShortcuts.map((dish) => (
                      <TouchableOpacity
                        key={dish.slug}
                        style={styles.emptyDishChip}
                        onPress={() => router.push({ pathname: "/dish/[slug]", params: { slug: dish.slug } })}
                      >
                        <Text style={styles.emptyDishChipText}>
                          {dish.emoji} Best {dish.name}{dish.entryCount > 0 ? ` · ${dish.entryCount} ranked` : ""}
                        </Text>
                        <Ionicons name="chevron-forward" size={14} color={AMBER} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                {selectedCuisine && !searchQuery.trim() && (
                  <TouchableOpacity
                    style={styles.emptyClearFilter}
                    onPress={() => { setSelectedCuisine(null); }}
                  >
                    <Text style={styles.emptyClearFilterText}>Show all cuisines</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : null
          }
        />
        </SkeletonToContent>
      )}
    </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingBottom: 10, paddingTop: 2,
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

  // Sprint 386: chip styles moved to RankingsListHeader

  list: { paddingHorizontal: CARD_PADDING, gap: 10, paddingTop: 4 },

  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 },
  emptyText: { fontSize: 16, color: Colors.textSecondary, fontFamily: "DMSans_600SemiBold" },
  emptySubtext: { fontSize: 13, color: Colors.textTertiary, fontFamily: "DMSans_400Regular", marginTop: 4 },
  // Sprint 386: rankingSummary styles moved to RankingsListHeader
  listFooter: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 20, paddingHorizontal: 16 },
  listFooterLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  listFooterText: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },

  // Sprint 386: bestIn, suggest, cuisine styles moved to RankingsListHeader
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center",
  },
  // Sprint 386: welcomeBanner, dishShortcut styles moved to RankingsListHeader
  // Sprint 319: Cuisine-aware empty state
  emptyStateContainer: { alignItems: "center" as const },
  emptyDishSuggestions: {
    marginTop: 16, marginHorizontal: 16, width: pct(100),
  },
  emptyDishTitle: {
    fontSize: 13, fontWeight: "600" as const, color: Colors.textSecondary,
    fontFamily: "DMSans_600SemiBold", marginBottom: 8, textAlign: "center" as const,
  },
  emptyDishChip: {
    flexDirection: "row" as const, alignItems: "center" as const, gap: 8,
    paddingVertical: 10, paddingHorizontal: 14,
    backgroundColor: "rgba(196,154,26,0.06)", borderRadius: 12,
    borderWidth: 1, borderColor: "rgba(196,154,26,0.15)", marginBottom: 6,
  },
  emptyDishChipText: { flex: 1, fontSize: 14, fontWeight: "600" as const, color: AMBER },
  emptyClearFilter: {
    marginTop: 12, paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
  },
  emptyClearFilterText: { fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_500Medium" },
  // Sprint 327/331: Sticky cuisine bar — chip styles moved to CuisineChipRow
  stickyCuisineBar: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
});
