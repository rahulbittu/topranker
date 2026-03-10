/**
 * DishLeaderboardSection — "Best In [City]" section for Discovery screen
 * Sprint 167 — Dish Leaderboard V1 UI
 *
 * Shows horizontal chip rail of active dish leaderboards,
 * ranked entry cards when a dish is selected,
 * and "building" state when data is below threshold.
 */
import React, { useState, useMemo, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  FlatList, Modal, TextInput, ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BRAND } from "@/constants/brand";
import { SafeImage } from "@/components/SafeImage";
import { getApiUrl } from "@/lib/query-client";
import { pct } from "@/lib/style-helpers";
import { TYPOGRAPHY } from "@/constants/typography";

const AMBER = BRAND.colors.amber;

interface DishBoard {
  id: string;
  city: string;
  dishName: string;
  dishSlug: string;
  dishEmoji: string | null;
  status: string;
  entryCount: number;
}

interface DishEntry {
  id: string;
  businessId: string;
  dishScore: string;
  dishRatingCount: number;
  rankPosition: number;
  photoUrl: string | null;
  businessName: string;
  businessSlug: string;
  neighborhood: string | null;
}

interface DishSuggestion {
  id: string;
  dishName: string;
  voteCount: number;
}

type VisitTypeFilter = "all" | "dine_in" | "delivery" | "takeaway";
const VISIT_TYPE_FILTERS: { key: VisitTypeFilter; label: string; color: string }[] = [
  { key: "all", label: "All", color: AMBER },
  { key: "dine_in", label: "Dine-in", color: AMBER },
  { key: "delivery", label: "Delivery", color: "#60A5FA" },
  { key: "takeaway", label: "Takeaway", color: "#34D399" },
];

export function DishLeaderboardSection({ city }: { city: string }) {
  const [activeDish, setActiveDish] = useState<string | null>(null);
  const [visitTypeFilter, setVisitTypeFilter] = useState<VisitTypeFilter>("all");
  const [suggestOpen, setSuggestOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: boards = [] } = useQuery<DishBoard[]>({
    queryKey: ["dish-leaderboards", city],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/dish-leaderboards?city=${encodeURIComponent(city)}`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    },
    staleTime: 60000,
  });

  const activeBoard = useMemo(() => boards.find((b) => b.dishSlug === activeDish), [boards, activeDish]);

  const vtParam = visitTypeFilter !== "all" ? `&visitType=${visitTypeFilter}` : "";
  const { data: boardDetail, isLoading: detailLoading } = useQuery({
    queryKey: ["dish-leaderboard", activeDish, city, visitTypeFilter],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/dish-leaderboards/${activeDish}?city=${encodeURIComponent(city)}${vtParam}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    },
    enabled: !!activeDish,
    staleTime: 60000,
  });

  const handleChipPress = useCallback((slug: string) => {
    setActiveDish((prev) => (prev === slug ? null : slug));
    setVisitTypeFilter("all"); // Reset filter when switching dishes
  }, []);

  if (boards.length === 0) return null;

  const entries: DishEntry[] = boardDetail?.entries || [];
  const isProvisional = boardDetail?.isProvisional || false;
  const minRatingsNeeded = boardDetail?.minRatingsNeeded || 0;
  const visitTypeBreakdown: Record<string, number> = boardDetail?.visitTypeBreakdown || {};
  const hasMultipleVisitTypes = Object.keys(visitTypeBreakdown).length > 1;

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <Text style={styles.sectionTitle}>Best In {city.charAt(0).toUpperCase() + city.slice(1)}</Text>
      <Text style={styles.sectionSubtitle}>Community-ranked by dish</Text>

      {/* Chip Rail */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRail}
        style={styles.chipScroll}
      >
        {boards.map((board) => {
          const isActive = activeDish === board.dishSlug;
          return (
            <TouchableOpacity
              key={board.dishSlug}
              onPress={() => handleChipPress(board.dishSlug)}
              style={[styles.chip, isActive && styles.chipActive]}
              accessibilityRole="button"
              accessibilityLabel={`Best ${board.dishName}`}
            >
              {board.dishEmoji && <Text style={styles.chipEmoji}>{board.dishEmoji}</Text>}
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {board.dishName}
              </Text>
              <View style={[styles.chipCount, isActive && styles.chipCountActive]}>
                <Text style={[styles.chipCountText, isActive && styles.chipCountTextActive]}>{board.entryCount}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          onPress={() => setSuggestOpen(true)}
          style={styles.suggestChip}
          accessibilityRole="button"
          accessibilityLabel="Suggest a dish"
        >
          <Text style={styles.suggestChipText}>+ Suggest</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Active Dish Content */}
      {activeDish && (
        <View style={styles.boardContent}>
          {/* Hero Banner */}
          {activeBoard && (
            <View style={styles.heroBanner}>
              <Text style={styles.heroEmoji}>{activeBoard.dishEmoji || "🍽️"}</Text>
              <View style={styles.heroTextWrap}>
                <Text style={styles.heroTitle}>
                  Best {activeBoard.dishName} in {city.charAt(0).toUpperCase() + city.slice(1)}
                </Text>
                <Text style={styles.heroCount}>{activeBoard.entryCount} spots</Text>
              </View>
              {isProvisional && (
                <View style={styles.provisionalBadge}>
                  <Text style={styles.provisionalText}>Early Rankings</Text>
                </View>
              )}
              <TouchableOpacity
                onPress={() => router.push({ pathname: "/dish/[slug]", params: { slug: activeBoard.dishSlug } })}
                style={styles.seeAllBtn}
                accessibilityLabel={`See full ${activeBoard.dishName} ranking`}
              >
                <Text style={styles.seeAllText}>Full ranking →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Sprint 538: Visit type filter chips */}
          {hasMultipleVisitTypes && (
            <View style={styles.visitTypeRow}>
              {VISIT_TYPE_FILTERS.map((vt) => {
                const isActive = visitTypeFilter === vt.key;
                const vtCount = vt.key === "all"
                  ? Object.values(visitTypeBreakdown).reduce((a, b) => a + b, 0)
                  : (visitTypeBreakdown[vt.key] || 0);
                if (vt.key !== "all" && vtCount === 0) return null;
                return (
                  <TouchableOpacity
                    key={vt.key}
                    onPress={() => setVisitTypeFilter(vt.key)}
                    style={[
                      styles.visitTypeChip,
                      isActive && { backgroundColor: vt.color, borderColor: vt.color },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Filter by ${vt.label}`}
                  >
                    <Text style={[styles.visitTypeChipText, isActive && styles.visitTypeChipTextActive]}>
                      {vt.label}
                    </Text>
                    {vtCount > 0 && (
                      <Text style={[styles.visitTypeChipCount, isActive && styles.visitTypeChipCountActive]}>
                        {vtCount}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Loading */}
          {detailLoading && (
            <ActivityIndicator color={AMBER} style={{ marginVertical: 20 }} />
          )}

          {/* Building State */}
          {!detailLoading && entries.length < 5 && minRatingsNeeded > 0 && (
            <View style={styles.buildingCard}>
              <Text style={styles.buildingEmoji}>🔨</Text>
              <Text style={styles.buildingTitle}>
                Best {activeBoard?.dishName || "Dish"} is building...
              </Text>
              <Text style={styles.buildingSubtext}>
                We need {minRatingsNeeded} more reviews to publish this ranking
              </Text>
              <TouchableOpacity
                style={styles.buildingCta}
                onPress={() => router.push("/(tabs)/search")}
              >
                <Text style={styles.buildingCtaText}>Rate a spot →</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Ranked Entries */}
          {!detailLoading && entries.length > 0 && (
            <View>
              {entries.map((entry, idx) => (
                <TouchableOpacity
                  key={entry.id}
                  style={styles.entryCard}
                  onPress={() => router.push({ pathname: "/business/[id]", params: { id: entry.businessSlug } })}
                  activeOpacity={0.7}
                >
                  {/* Photo Strip */}
                  <View style={styles.entryPhoto}>
                    <SafeImage
                      source={{ uri: entry.photoUrl || undefined }}
                      style={styles.entryPhotoImg}
                      fallbackGradient
                    />
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankBadgeText}>{entry.rankPosition}</Text>
                    </View>
                  </View>
                  {/* Info */}
                  <View style={styles.entryInfo}>
                    <View style={styles.entryRow}>
                      <Text style={styles.entryName} numberOfLines={1}>{entry.businessName}</Text>
                      {entry.neighborhood && (
                        <Text style={styles.entryNeighborhood}>{entry.neighborhood}</Text>
                      )}
                    </View>
                    <View style={styles.entryRow}>
                      <Text style={styles.entryScore}>
                        {parseFloat(entry.dishScore).toFixed(1)}
                      </Text>
                      <Text style={styles.entryScoreLabel}>
                        {activeBoard?.dishName} score
                      </Text>
                    </View>
                    <Text style={styles.entryRaterCount}>
                      Based on {entry.dishRatingCount} {activeBoard?.dishName?.toLowerCase()} ratings
                    </Text>
                    {entry.dishRatingCount < 5 && (
                      <View style={styles.earlyDataBadge}>
                        <Text style={styles.earlyDataText}>Early data</Text>
                      </View>
                    )}
                    {entry.dishRatingCount >= 10 && (
                      <View style={styles.highConfidenceBadge}>
                        <Ionicons name="shield-checkmark" size={10} color="#2E7D32" />
                        <Text style={styles.highConfidenceText}>High confidence</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}

              {/* Rate this dish CTA */}
              <TouchableOpacity
                style={styles.dishRateCta}
                onPress={() => router.push("/(tabs)/search")}
                activeOpacity={0.7}
              >
                <Ionicons name="star-outline" size={14} color={AMBER} />
                <Text style={styles.dishRateCtaText}>
                  Rate {activeBoard?.dishName || "this dish"} at a restaurant you've tried
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Suggest Modal */}
      <DishSuggestModal
        visible={suggestOpen}
        onClose={() => setSuggestOpen(false)}
        city={city}
      />
    </View>
  );
}

function DishSuggestModal({ visible, onClose, city }: { visible: boolean; onClose: () => void; city: string }) {
  const [input, setInput] = useState("");
  const queryClient = useQueryClient();

  const { data: suggestions = [] } = useQuery<DishSuggestion[]>({
    queryKey: ["dish-suggestions", city],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/dish-suggestions?city=${encodeURIComponent(city)}`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    },
    enabled: visible,
  });

  const submitMutation = useMutation({
    mutationFn: async (dishName: string) => {
      const res = await fetch(`${getApiUrl()}/api/dish-suggestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ city, dishName }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit");
      }
      return res.json();
    },
    onSuccess: () => {
      setInput("");
      queryClient.invalidateQueries({ queryKey: ["dish-suggestions", city] });
    },
  });

  const voteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${getApiUrl()}/api/dish-suggestions/${id}/vote`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Vote failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dish-suggestions", city] });
    },
  });

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Suggest a Dish</Text>
          <Text style={styles.modalSubtitle}>10 community votes activates a new leaderboard</Text>

          <View style={styles.modalInputRow}>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Dosa, Shawarma, Pho..."
              value={input}
              onChangeText={setInput}
              maxLength={40}
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={[styles.modalSubmitBtn, input.length < 2 && styles.modalSubmitDisabled]}
              disabled={input.length < 2 || submitMutation.isPending}
              onPress={() => submitMutation.mutate(input.trim())}
            >
              <Text style={styles.modalSubmitText}>
                {submitMutation.isPending ? "..." : "Suggest"}
              </Text>
            </TouchableOpacity>
          </View>

          {submitMutation.isError && (
            <Text style={styles.modalError}>
              {(submitMutation.error as Error).message}
            </Text>
          )}

          {suggestions.length > 0 && (
            <View style={styles.suggestionList}>
              <Text style={styles.suggestionListTitle}>Community suggestions</Text>
              {suggestions.slice(0, 10).map((s) => (
                <View key={s.id} style={styles.suggestionRow}>
                  <Text style={styles.suggestionName}>{s.dishName}</Text>
                  <View style={styles.suggestionVoteWrap}>
                    <Text style={styles.suggestionVoteCount}>{s.voteCount}</Text>
                    <TouchableOpacity
                      style={styles.suggestionVoteBtn}
                      onPress={() => voteMutation.mutate(s.id)}
                      disabled={voteMutation.isPending}
                    >
                      <Ionicons name="arrow-up-circle" size={22} color={AMBER} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 18, fontWeight: "800", color: "#111",
    fontFamily: TYPOGRAPHY.display.fontFamily, marginLeft: 16, marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12, color: "#636366", marginLeft: 16, marginBottom: 12,
  },
  chipScroll: { marginBottom: 0 },
  chipRail: { paddingLeft: 16, gap: 8, paddingRight: 16 },
  chip: {
    height: 38, paddingHorizontal: 14, borderRadius: 19,
    backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E5E5EA",
    flexDirection: "row", alignItems: "center", gap: 6,
  },
  chipActive: { backgroundColor: AMBER, borderColor: AMBER },
  chipEmoji: { fontSize: 16 },
  chipText: { fontSize: 14, fontWeight: "700", color: "#111" },
  chipTextActive: { color: "#FFFFFF" },
  suggestChip: {
    height: 38, paddingHorizontal: 14, borderRadius: 19,
    backgroundColor: "#F0EEE9", borderWidth: 1, borderColor: "#E5E5EA",
    alignItems: "center", justifyContent: "center",
  },
  suggestChipText: { fontSize: 14, color: "#636366", fontWeight: "600" },

  boardContent: { marginTop: 12 },
  // Sprint 538: Visit type filter
  visitTypeRow: {
    flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 10,
  },
  visitTypeChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#E5E5EA",
  },
  visitTypeChipText: { fontSize: 12, fontWeight: "600", color: "#636366" },
  visitTypeChipTextActive: { color: "#fff" },
  visitTypeChipCount: { fontSize: 10, fontWeight: "700", color: "#999" },
  visitTypeChipCountActive: { color: "rgba(255,255,255,0.8)" },
  heroBanner: {
    marginHorizontal: 16, padding: 14, borderRadius: 14,
    backgroundColor: "rgba(196,154,26,0.08)", flexDirection: "row",
    alignItems: "center", gap: 10, marginBottom: 12,
  },
  heroEmoji: { fontSize: 36 },
  heroTextWrap: { flex: 1 },
  heroTitle: {
    fontSize: 18, fontWeight: "700", color: "#111",
    fontFamily: TYPOGRAPHY.display.fontFamily,
  },
  heroCount: { fontSize: 12, color: "#636366", marginTop: 2 },
  provisionalBadge: {
    backgroundColor: AMBER, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
  },
  provisionalText: { fontSize: 10, color: "#fff", fontWeight: "700" },
  seeAllBtn: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
    backgroundColor: "rgba(196,154,26,0.15)",
  },
  seeAllText: { fontSize: 12, color: AMBER, fontWeight: "700" },

  buildingCard: {
    margin: 16, padding: 20, backgroundColor: "#FFF8E7",
    borderRadius: 14, borderWidth: 1, borderColor: "#F0C84A",
    alignItems: "center",
  },
  buildingEmoji: { fontSize: 24, marginBottom: 8 },
  buildingTitle: { fontSize: 16, fontWeight: "700", color: "#111", marginBottom: 4 },
  buildingSubtext: { fontSize: 13, color: "#636366", textAlign: "center", marginBottom: 12 },
  buildingCta: {
    backgroundColor: AMBER, borderRadius: 22, paddingHorizontal: 20, paddingVertical: 10,
  },
  buildingCtaText: { color: "#fff", fontWeight: "700" },

  entryCard: {
    marginHorizontal: 16, marginBottom: 12, borderRadius: 14,
    backgroundColor: "#fff", overflow: "hidden",
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  entryPhoto: { height: 160, width: pct(100) },
  entryPhotoImg: { width: pct(100), height: pct(100) },
  rankBadge: {
    position: "absolute", bottom: 8, left: 8, width: 32, height: 32,
    borderRadius: 16, backgroundColor: AMBER,
    alignItems: "center", justifyContent: "center",
  },
  rankBadgeText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  entryInfo: { padding: 12 },
  entryRow: { flexDirection: "row", alignItems: "baseline", gap: 6, marginBottom: 2 },
  entryName: { fontSize: 16, fontWeight: "700", color: "#111", flex: 1 },
  entryNeighborhood: { fontSize: 12, color: "#636366" },
  entryScore: {
    fontSize: 28, fontWeight: "700", color: AMBER,
    fontFamily: TYPOGRAPHY.score?.fontFamily || "System",
  },
  entryScoreLabel: { fontSize: 11, color: "#636366" },
  entryRaterCount: { fontSize: 12, color: "#999", marginTop: 4 },
  earlyDataBadge: {
    backgroundColor: "rgba(196,154,26,0.12)", borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2, alignSelf: "flex-start", marginTop: 6,
  },
  earlyDataText: { fontSize: 10, color: AMBER, fontWeight: "600" },
  highConfidenceBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(46,125,50,0.1)", borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2, alignSelf: "flex-start", marginTop: 6,
  },
  highConfidenceText: { fontSize: 10, color: "#2E7D32", fontWeight: "600" },
  chipCount: {
    backgroundColor: "rgba(0,0,0,0.08)", borderRadius: 8,
    paddingHorizontal: 5, paddingVertical: 1, minWidth: 18, alignItems: "center",
  },
  chipCountActive: { backgroundColor: "rgba(255,255,255,0.25)" },
  chipCountText: { fontSize: 10, fontWeight: "700", color: "#636366" },
  chipCountTextActive: { color: "#fff" },
  dishRateCta: {
    marginHorizontal: 16, marginTop: 4, marginBottom: 8,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, paddingVertical: 10, borderRadius: 10,
    backgroundColor: "rgba(196,154,26,0.08)",
  },
  dishRateCtaText: { fontSize: 12, color: AMBER, fontWeight: "600" },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: 40, maxHeight: 420,
  },
  modalHandle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: "#DDD",
    alignSelf: "center", marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#111", marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: "#636366", marginBottom: 16 },
  modalInputRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  modalInput: {
    flex: 1, height: 44, borderWidth: 1, borderColor: "#E5E5EA",
    borderRadius: 10, paddingHorizontal: 12, fontSize: 15, color: "#111",
  },
  modalSubmitBtn: {
    height: 44, paddingHorizontal: 16, borderRadius: 10,
    backgroundColor: AMBER, alignItems: "center", justifyContent: "center",
  },
  modalSubmitDisabled: { opacity: 0.4 },
  modalSubmitText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  modalError: { color: "#E53935", fontSize: 12, marginBottom: 8 },
  suggestionList: { marginTop: 8 },
  suggestionListTitle: { fontSize: 13, color: "#636366", marginBottom: 8, fontWeight: "600" },
  suggestionRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F0F0F0",
  },
  suggestionName: { fontSize: 15, color: "#111", fontWeight: "500" },
  suggestionVoteWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  suggestionVoteCount: { fontSize: 14, color: "#636366", fontWeight: "600" },
  suggestionVoteBtn: { padding: 2 },
});
