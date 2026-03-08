import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { TypedIcon } from "@/components/TypedIcon";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { isAdminEmail } from "@/shared/admin";
import {
  fetchCategorySuggestions, reviewCategorySuggestion,
  type CategorySuggestionItem,
} from "@/lib/api";

type AdminTab = "overview" | "claims" | "flags" | "challengers" | "users" | "suggestions";

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
        <TypedIcon name={icon} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function QueueItem({ title, subtitle, type, onApprove, onReject }: {
  title: string; subtitle: string; type: string;
  onApprove: () => void; onReject: () => void;
}) {
  return (
    <View style={styles.queueItem}>
      <View style={styles.queueInfo}>
        <View style={styles.queueTypeRow}>
          <View style={[styles.queueTypeBadge, type === "claim" ? styles.queueTypeClaim : type === "flag" ? styles.queueTypeFlag : styles.queueTypeChallenger]}>
            <Text style={styles.queueTypeText}>{type.toUpperCase()}</Text>
          </View>
          <Text style={styles.queueTitle} numberOfLines={1}>{title}</Text>
        </View>
        <Text style={styles.queueSubtitle} numberOfLines={1}>{subtitle}</Text>
      </View>
      <View style={styles.queueActions}>
        <TouchableOpacity style={styles.approveBtn} onPress={onApprove} hitSlop={8}>
          <Ionicons name="checkmark" size={16} color={Colors.green} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.rejectBtn} onPress={onReject} hitSlop={8}>
          <Ionicons name="close" size={16} color={Colors.red} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const VERTICAL_COLORS: Record<string, string> = {
  food: "#FF6B35",
  services: "#2196F3",
  wellness: "#4CAF50",
  entertainment: "#9C27B0",
  retail: "#FF9800",
};

function SuggestionCard({
  item, onApprove, onReject, isPending,
}: {
  item: CategorySuggestionItem;
  onApprove: () => void;
  onReject: () => void;
  isPending: boolean;
}) {
  const vertColor = VERTICAL_COLORS[item.vertical] || Colors.textTertiary;
  return (
    <View style={styles.suggestionCard}>
      <View style={styles.suggestionHeader}>
        <View style={[styles.verticalBadge, { backgroundColor: `${vertColor}15` }]}>
          <Text style={[styles.verticalText, { color: vertColor }]}>
            {item.vertical.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.suggestionVotes}>{item.voteCount} vote{item.voteCount !== 1 ? "s" : ""}</Text>
      </View>
      <Text style={styles.suggestionName}>{item.name}</Text>
      <Text style={styles.suggestionDesc}>{item.description}</Text>
      <View style={styles.suggestionActions}>
        <TouchableOpacity
          style={[styles.suggestionApproveBtn, isPending && { opacity: 0.5 }]}
          onPress={onApprove}
          disabled={isPending}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
          <Text style={styles.suggestionApproveBtnText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.suggestionRejectBtn, isPending && { opacity: 0.5 }]}
          onPress={onReject}
          disabled={isPending}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={14} color={Colors.red} />
          <Text style={styles.suggestionRejectBtnText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Mock admin data
const MOCK_QUEUE = [
  { id: "1", title: "Pecan Lodge", subtitle: "Claim by John Smith (Owner)", type: "claim" },
  { id: "2", title: "Suspicious rating pattern", subtitle: "5 identical scores on Uchi in 2 hours", type: "flag" },
  { id: "3", title: "Lucia vs Uchi", subtitle: "Challenge entry payment confirmed", type: "challenger" },
  { id: "4", title: "Terry Black's BBQ", subtitle: "Claim by Maria Garcia (GM)", type: "claim" },
  { id: "5", title: "Bot-like behavior", subtitle: "User 'review_king' rated 20 businesses in 10 min", type: "flag" },
];

export default function AdminScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [queue, setQueue] = useState(MOCK_QUEUE);
  const queryClient = useQueryClient();

  const { data: suggestions = [], isLoading: suggestionsLoading } = useQuery({
    queryKey: ["admin-category-suggestions"],
    queryFn: fetchCategorySuggestions,
    enabled: !!isAdmin,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" }) =>
      reviewCategorySuggestion(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-category-suggestions"] });
    },
  });

  const isAdmin = user && isAdminEmail(user.email);

  if (!isAdmin) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: topPad }]}>
        <Ionicons name="shield-outline" size={48} color={Colors.textTertiary} />
        <Text style={styles.accessDenied}>Admin Access Required</Text>
        <Text style={styles.accessDeniedSub}>This area is restricted to TopRanker administrators.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleAction = (id: string, action: "approve" | "reject") => {
    const item = queue.find(q => q.id === id);
    Alert.alert(
      action === "approve" ? "Approve" : "Reject",
      `${action === "approve" ? "Approve" : "Reject"} "${item?.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action === "approve" ? "Approve" : "Reject",
          style: action === "reject" ? "destructive" : "default",
          onPress: () => setQueue(q => q.filter(item => item.id !== id)),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <View style={styles.adminBadge}>
          <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" />
          <Text style={styles.adminBadgeText}>ADMIN</Text>
        </View>
      </View>

      {/* Tab bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBar}>
        {([
          ["overview", "grid-outline", "Overview"],
          ["claims", "business-outline", "Claims"],
          ["flags", "flag-outline", "Flags"],
          ["challengers", "flash-outline", "Challengers"],
          ["users", "people-outline", "Users"],
          ["suggestions", "bulb-outline", "Suggestions"],
        ] as const).map(([key, icon, label]) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, activeTab === key && styles.tabActive]}
            onPress={() => setActiveTab(key)}
          >
            <TypedIcon name={icon} size={14} color={activeTab === key ? "#FFFFFF" : Colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === key && styles.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === "overview" && (
          <>
            <View style={styles.statsGrid}>
              <StatCard label="Total Businesses" value="50" icon="storefront-outline" color={BRAND.colors.amber} />
              <StatCard label="Active Challenges" value="2" icon="flash-outline" color="#FF6B35" />
              <StatCard label="Pending Claims" value={String(queue.filter(q => q.type === "claim").length)} icon="shield-outline" color={Colors.green} />
              <StatCard label="Flagged Items" value={String(queue.filter(q => q.type === "flag").length)} icon="flag-outline" color={Colors.red} />
            </View>

            <View style={styles.statsGrid}>
              <StatCard label="Total Ratings" value="1,247" icon="star-outline" color={BRAND.colors.amber} />
              <StatCard label="Active Users" value="342" icon="people-outline" color="#6366F1" />
              <StatCard label="Revenue (MTD)" value="$891" icon="card-outline" color={Colors.green} />
              <StatCard label="Avg Rating" value="3.8" icon="analytics-outline" color="#EC4899" />
            </View>

            <Text style={styles.sectionTitle}>Review Queue</Text>
          </>
        )}

        {activeTab === "suggestions" && (
          <>
            <Text style={styles.sectionTitle}>Category Suggestions</Text>
            {suggestionsLoading && (
              <Text style={styles.emptySub}>Loading suggestions...</Text>
            )}
            {!suggestionsLoading && suggestions.filter(s => s.status === "pending").length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle-outline" size={48} color={Colors.green} />
                <Text style={styles.emptyTitle}>No Pending Suggestions</Text>
                <Text style={styles.emptySub}>All category suggestions have been reviewed</Text>
              </View>
            )}
            {suggestions.filter(s => s.status === "pending").map(item => (
              <SuggestionCard
                key={item.id}
                item={item}
                onApprove={() => reviewMutation.mutate({ id: item.id, status: "approved" })}
                onReject={() => reviewMutation.mutate({ id: item.id, status: "rejected" })}
                isPending={reviewMutation.isPending}
              />
            ))}
          </>
        )}

        {activeTab !== "suggestions" && queue.filter(q => {
          if (activeTab === "overview") return true;
          if (activeTab === "claims") return q.type === "claim";
          if (activeTab === "flags") return q.type === "flag";
          if (activeTab === "challengers") return q.type === "challenger";
          return true;
        }).map(item => (
          <QueueItem
            key={item.id}
            title={item.title}
            subtitle={item.subtitle}
            type={item.type}
            onApprove={() => handleAction(item.id, "approve")}
            onReject={() => handleAction(item.id, "reject")}
          />
        ))}

        {queue.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={48} color={Colors.green} />
            <Text style={styles.emptyTitle}>All Clear</Text>
            <Text style={styles.emptySub}>No items in the review queue</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 20, fontWeight: "700", color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold", letterSpacing: -0.5,
  },
  adminBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: Colors.red, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
  },
  adminBadgeText: {
    fontSize: 9, fontWeight: "800", color: "#FFFFFF",
    fontFamily: "DMSans_800ExtraBold", letterSpacing: 0.5,
  },

  tabBar: { paddingHorizontal: 16, gap: 8, paddingBottom: 12 },
  tab: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.surfaceRaised,
  },
  tabActive: { backgroundColor: BRAND.colors.navy },
  tabText: { fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_500Medium" },
  tabTextActive: { color: "#FFFFFF" },

  content: { paddingHorizontal: 16, paddingBottom: 40, gap: 12 },

  statsGrid: {
    flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 4,
  },
  statCard: {
    flex: 1, minWidth: "45%", backgroundColor: Colors.surfaceRaised,
    borderRadius: 14, padding: 14, gap: 6,
  },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statValue: {
    fontSize: 22, fontWeight: "800", color: Colors.text,
    fontFamily: "DMSans_800ExtraBold",
  },
  statLabel: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },

  sectionTitle: {
    fontSize: 16, fontWeight: "700", color: Colors.text,
    fontFamily: "DMSans_700Bold", marginTop: 8,
  },

  queueItem: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: Colors.surfaceRaised, borderRadius: 12, padding: 14, gap: 12,
  },
  queueInfo: { flex: 1, gap: 4 },
  queueTypeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  queueTypeBadge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  queueTypeClaim: { backgroundColor: "rgba(34,197,94,0.15)" },
  queueTypeFlag: { backgroundColor: "rgba(239,68,68,0.15)" },
  queueTypeChallenger: { backgroundColor: "rgba(196,154,26,0.15)" },
  queueTypeText: {
    fontSize: 8, fontWeight: "800", color: Colors.text,
    fontFamily: "DMSans_800ExtraBold", letterSpacing: 0.5,
  },
  queueTitle: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold", flex: 1 },
  queueSubtitle: { fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },
  queueActions: { flexDirection: "row", gap: 8 },
  approveBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "rgba(34,197,94,0.1)", alignItems: "center", justifyContent: "center",
  },
  rejectBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "rgba(239,68,68,0.1)", alignItems: "center", justifyContent: "center",
  },

  emptyState: { alignItems: "center", gap: 8, paddingVertical: 40 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold" },
  emptySub: { fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular" },

  accessDenied: {
    fontSize: 20, fontWeight: "700", color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold", marginTop: 12,
  },
  accessDeniedSub: {
    fontSize: 14, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
    textAlign: "center", marginTop: 4, marginBottom: 20,
  },
  backBtn: {
    backgroundColor: BRAND.colors.navy, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32,
    alignItems: "center",
  },
  backBtnText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF", fontFamily: "DMSans_700Bold" },

  // Suggestion card styles
  suggestionCard: {
    backgroundColor: Colors.surfaceRaised, borderRadius: 14, padding: 16, gap: 8,
  },
  suggestionHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  verticalBadge: {
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
  },
  verticalText: {
    fontSize: 9, fontWeight: "800", fontFamily: "DMSans_800ExtraBold", letterSpacing: 0.5,
  },
  suggestionVotes: {
    fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
  },
  suggestionName: {
    fontSize: 16, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold",
  },
  suggestionDesc: {
    fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular", lineHeight: 18,
  },
  suggestionActions: {
    flexDirection: "row", gap: 10, marginTop: 4,
  },
  suggestionApproveBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: Colors.green, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8,
  },
  suggestionApproveBtnText: {
    fontSize: 12, fontWeight: "700", color: "#FFFFFF", fontFamily: "DMSans_700Bold",
  },
  suggestionRejectBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(239,68,68,0.1)", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8,
  },
  suggestionRejectBtnText: {
    fontSize: 12, fontWeight: "700", color: Colors.red, fontFamily: "DMSans_700Bold",
  },
});
