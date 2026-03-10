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
  fetchPendingClaims, fetchPendingFlags,
  fetchAllClaimEvidence,
  reviewAdminClaim, reviewAdminFlag,
  fetchAdminMembers,
  type CategorySuggestionItem,
  type AdminClaim, type AdminFlag, type AdminMember,
} from "@/lib/api";
import { NotificationInsightsCard, type NotificationInsightsData } from "@/components/admin/NotificationInsightsCard";
import { ClaimEvidenceCard, type ClaimEvidence } from "@/components/admin/ClaimEvidenceCard";
import { PushExperimentsCard, type PushExperimentData } from "@/components/admin/PushExperimentsCard";
import { getApiUrl } from "@/lib/query-client";

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


export default function AdminScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const queryClient = useQueryClient();
  const isAdmin = user && isAdminEmail(user.email);

  const { data: suggestions = [], isLoading: suggestionsLoading } = useQuery({
    queryKey: ["admin-category-suggestions"],
    queryFn: fetchCategorySuggestions,
    enabled: !!isAdmin,
  });

  const { data: claims = [], isLoading: claimsLoading } = useQuery({
    queryKey: ["admin-claims"],
    queryFn: fetchPendingClaims,
    enabled: !!isAdmin,
  });

  // Sprint 509: Claim V2 evidence for dashboard
  const { data: claimEvidence = [] } = useQuery({
    queryKey: ["admin-claim-evidence"],
    queryFn: fetchAllClaimEvidence,
    enabled: !!isAdmin,
    staleTime: 60000,
  });

  // Sprint 512: Push experiments for admin dashboard
  const { data: pushExperiments = [] } = useQuery<PushExperimentData[]>({
    queryKey: ["admin-push-experiments"],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/admin/push-experiments`, { credentials: "include" });
      const json = await res.json();
      return json.data || [];
    },
    enabled: !!isAdmin,
    staleTime: 60000,
  });

  const { data: flags = [], isLoading: flagsLoading } = useQuery({
    queryKey: ["admin-flags"],
    queryFn: fetchPendingFlags,
    enabled: !!isAdmin,
  });

  const { data: memberList = [], isLoading: membersLoading } = useQuery({
    queryKey: ["admin-members"],
    queryFn: () => fetchAdminMembers(50),
    enabled: !!isAdmin,
  });

  // Sprint 506: Notification insights for admin dashboard
  const { data: notifInsights } = useQuery<{ data: NotificationInsightsData }>({
    queryKey: ["admin-notification-insights"],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/notifications/insights?daysBack=7`, { credentials: "include" });
      return res.json();
    },
    enabled: !!isAdmin,
    staleTime: 60000,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" }) =>
      reviewCategorySuggestion(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-category-suggestions"] });
    },
  });

  const claimMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" }) =>
      reviewAdminClaim(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-claims"] });
    },
  });

  const flagMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "confirmed" | "dismissed" }) =>
      reviewAdminFlag(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-flags"] });
    },
  });

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

  const handleClaimAction = (id: string, action: "approved" | "rejected") => {
    const claim = claims.find(c => c.id === id);
    Alert.alert(
      action === "approved" ? "Approve Claim" : "Reject Claim",
      `${action === "approved" ? "Approve" : "Reject"} claim for "${claim?.businessName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action === "approved" ? "Approve" : "Reject",
          style: action === "rejected" ? "destructive" : "default",
          onPress: () => claimMutation.mutate({ id, status: action }),
        },
      ]
    );
  };

  const handleFlagAction = (id: string, action: "confirmed" | "dismissed") => {
    Alert.alert(
      action === "confirmed" ? "Confirm Flag" : "Dismiss Flag",
      `${action === "confirmed" ? "Confirm" : "Dismiss"} this rating flag?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: action === "confirmed" ? "Confirm" : "Dismiss",
          style: action === "confirmed" ? "destructive" : "default",
          onPress: () => flagMutation.mutate({ id, status: action }),
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
              <StatCard label="Pending Claims" value={String(claims.length)} icon="shield-outline" color={Colors.green} />
              <StatCard label="Flagged Items" value={String(flags.length)} icon="flag-outline" color={Colors.red} />
            </View>

            <View style={styles.statsGrid}>
              <StatCard label="Total Ratings" value="1,247" icon="star-outline" color={BRAND.colors.amber} />
              <StatCard label="Total Users" value={String(memberList.length)} icon="people-outline" color="#6366F1" />
              <StatCard label="Revenue (MTD)" value="$891" icon="card-outline" color={Colors.green} />
              <StatCard label="Avg Rating" value="3.8" icon="analytics-outline" color="#EC4899" />
            </View>

            {/* Sprint 506: Notification analytics */}
            {notifInsights?.data && (
              <NotificationInsightsCard data={notifInsights.data} />
            )}

            {/* Sprint 512: Push A/B experiments */}
            <PushExperimentsCard experiments={pushExperiments} />

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

        {(activeTab === "overview" || activeTab === "claims") && (
          <>
            {activeTab === "claims" && <Text style={styles.sectionTitle}>Business Claims</Text>}
            {claimsLoading && <Text style={styles.emptySub}>Loading claims...</Text>}
            {!claimsLoading && claims.length === 0 && activeTab === "claims" && (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle-outline" size={48} color={Colors.green} />
                <Text style={styles.emptyTitle}>No Pending Claims</Text>
                <Text style={styles.emptySub}>All business claims have been reviewed</Text>
              </View>
            )}
            {claims.map(claim => {
              const evidence = claimEvidence.find(e => e.claimId === claim.id);
              return (
                <View key={claim.id}>
                  <QueueItem
                    title={claim.businessName || "Unknown Business"}
                    subtitle={`Claim by ${claim.memberName || "Unknown"} via ${claim.verificationMethod}`}
                    type="claim"
                    onApprove={() => handleClaimAction(claim.id, "approved")}
                    onReject={() => handleClaimAction(claim.id, "rejected")}
                  />
                  {evidence && <ClaimEvidenceCard evidence={evidence} />}
                </View>
              );
            })}
          </>
        )}

        {(activeTab === "overview" || activeTab === "flags") && (
          <>
            {activeTab === "flags" && <Text style={styles.sectionTitle}>Rating Flags</Text>}
            {flagsLoading && <Text style={styles.emptySub}>Loading flags...</Text>}
            {!flagsLoading && flags.length === 0 && activeTab === "flags" && (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle-outline" size={48} color={Colors.green} />
                <Text style={styles.emptyTitle}>No Pending Flags</Text>
                <Text style={styles.emptySub}>All rating flags have been reviewed</Text>
              </View>
            )}
            {flags.map(flag => (
              <QueueItem
                key={flag.id}
                title={flag.aiFraudProbability != null ? `Fraud risk: ${flag.aiFraudProbability}%` : "Flagged Rating"}
                subtitle={`Flagged by ${flag.flaggerName || "Unknown"}${flag.explanation ? ` — ${flag.explanation}` : ""}`}
                type="flag"
                onApprove={() => handleFlagAction(flag.id, "confirmed")}
                onReject={() => handleFlagAction(flag.id, "dismissed")}
              />
            ))}
          </>
        )}

        {activeTab === "users" && (
          <>
            <Text style={styles.sectionTitle}>Members ({memberList.length})</Text>
            {membersLoading && <Text style={styles.emptySub}>Loading members...</Text>}
            {!membersLoading && memberList.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={48} color={Colors.textTertiary} />
                <Text style={styles.emptyTitle}>No Members</Text>
              </View>
            )}
            {memberList.map(member => (
              <View key={member.id} style={styles.memberRow}>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName} numberOfLines={1}>{member.displayName}</Text>
                  <Text style={styles.memberMeta}>
                    @{member.username} · {member.city} · {member.totalRatings} ratings
                  </Text>
                </View>
                <View style={styles.memberRight}>
                  <View style={[styles.tierPill, { backgroundColor: member.credibilityTier === "top" ? `${BRAND.colors.amber}20` : `${Colors.textTertiary}15` }]}>
                    <Text style={[styles.tierPillText, { color: member.credibilityTier === "top" ? BRAND.colors.amber : Colors.textTertiary }]}>
                      {member.credibilityTier.toUpperCase()}
                    </Text>
                  </View>
                  {member.isBanned && (
                    <View style={styles.bannedPill}>
                      <Text style={styles.bannedText}>BANNED</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </>
        )}

        {claims.length === 0 && flags.length === 0 && activeTab === "overview" && (
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

  memberRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: Colors.surfaceRaised, borderRadius: 12, padding: 14, gap: 12,
  },
  memberInfo: { flex: 1, gap: 2 },
  memberName: {
    fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold",
  },
  memberMeta: {
    fontSize: 11, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
  },
  memberRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  tierPill: {
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
  },
  tierPillText: {
    fontSize: 8, fontWeight: "800", fontFamily: "DMSans_800ExtraBold", letterSpacing: 0.5,
  },
  bannedPill: {
    backgroundColor: "rgba(255,59,48,0.15)", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
  },
  bannedText: {
    fontSize: 8, fontWeight: "800", color: Colors.red, fontFamily: "DMSans_800ExtraBold",
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
