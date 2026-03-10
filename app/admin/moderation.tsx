/**
 * Admin Moderation Queue — Sprint 367
 * UI for reviewing, approving, and rejecting moderation items.
 * Supports bulk actions, content type filtering, and violation priority sorting.
 * Owner: Sarah Nakamura (Lead Eng)
 */

import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Colors from "../../constants/colors";
import { BRAND } from "../../constants/brand";
import { TYPOGRAPHY } from "../../constants/typography";
import { apiFetch, apiRequest } from "../../lib/api";

type ContentType = "review" | "photo" | "reply";
type ModerationStatus = "pending" | "approved" | "rejected";

interface ModerationItem {
  id: string;
  contentType: ContentType;
  contentId: string;
  memberId: string;
  businessId: string;
  content: string;
  violations: string[];
  status: ModerationStatus;
  moderatorId: string | null;
  moderatorNote: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

interface QueueStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  review: "Review",
  photo: "Photo",
  reply: "Reply",
};

const CONTENT_TYPE_ICONS: Record<ContentType, string> = {
  review: "chatbubble-outline",
  photo: "image-outline",
  reply: "arrow-undo-outline",
};

function useQueueStats() {
  return useQuery<QueueStats>({
    queryKey: ["admin", "moderation", "stats"],
    queryFn: () => apiFetch("/api/admin/moderation/stats"),
    staleTime: 10000,
  });
}

function useFilteredQueue(filter: { status?: string; contentType?: string; sort?: string }) {
  const params = new URLSearchParams();
  if (filter.status) params.set("status", filter.status);
  if (filter.contentType) params.set("contentType", filter.contentType);
  if (filter.sort) params.set("sort", filter.sort);
  const qs = params.toString();
  return useQuery<ModerationItem[]>({
    queryKey: ["admin", "moderation", "filtered", qs],
    queryFn: () => apiFetch(`/api/admin/moderation/filtered?${qs}`),
    staleTime: 10000,
  });
}

export default function ModerationScreen() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [sortByViolations, setSortByViolations] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  const { data: stats } = useQueueStats();
  const { data: items = [], isLoading, refetch } = useFilteredQueue({
    status: statusFilter || undefined,
    contentType: typeFilter || undefined,
    sort: sortByViolations ? "violations" : undefined,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "moderation"] });
    setSelectedIds(new Set());
  };

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/admin/moderation/${id}/approve`),
    onSuccess: invalidateAll,
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/admin/moderation/${id}/reject`),
    onSuccess: invalidateAll,
  });

  const bulkApproveMutation = useMutation({
    mutationFn: (ids: string[]) => apiRequest("POST", "/api/admin/moderation/bulk-approve", { ids }),
    onSuccess: invalidateAll,
  });

  const bulkRejectMutation = useMutation({
    mutationFn: (ids: string[]) => apiRequest("POST", "/api/admin/moderation/bulk-reject", { ids }),
    onSuccess: invalidateAll,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(i => i.id)));
    }
  };

  const handleBulkApprove = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    const confirm = () => bulkApproveMutation.mutate(ids);
    if (Platform.OS === "web") {
      if (window.confirm(`Approve ${ids.length} items?`)) confirm();
    } else {
      Alert.alert("Bulk Approve", `Approve ${ids.length} items?`, [
        { text: "Cancel", style: "cancel" },
        { text: "Approve", onPress: confirm },
      ]);
    }
  };

  const handleBulkReject = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    const confirm = () => bulkRejectMutation.mutate(ids);
    if (Platform.OS === "web") {
      if (window.confirm(`Reject ${ids.length} items?`)) confirm();
    } else {
      Alert.alert("Bulk Reject", `Reject ${ids.length} items?`, [
        { text: "Cancel", style: "cancel" },
        { text: "Reject", style: "destructive", onPress: confirm },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Moderation Queue</Text>

      {/* Stats row */}
      {stats && (
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.approved}</Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.rejected}</Text>
            <Text style={styles.statLabel}>Rejected</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      )}

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {["pending", "approved", "rejected", ""].map(s => (
          <TouchableOpacity
            key={s || "all"}
            style={[styles.filterChip, statusFilter === s && styles.filterChipActive]}
            onPress={() => setStatusFilter(s)}
            accessibilityRole="button"
          >
            <Text style={[styles.filterChipText, statusFilter === s && styles.filterChipTextActive]}>
              {s || "All"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content type + sort */}
      <View style={styles.filterRow}>
        {["", "review", "photo", "reply"].map(t => (
          <TouchableOpacity
            key={t || "all-types"}
            style={[styles.filterChip, typeFilter === t && styles.filterChipActive]}
            onPress={() => setTypeFilter(t)}
            accessibilityRole="button"
          >
            <Text style={[styles.filterChipText, typeFilter === t && styles.filterChipTextActive]}>
              {t ? CONTENT_TYPE_LABELS[t as ContentType] : "All Types"}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.filterChip, sortByViolations && styles.filterChipActive]}
          onPress={() => setSortByViolations(!sortByViolations)}
          accessibilityRole="button"
        >
          <Ionicons name="warning-outline" size={12} color={sortByViolations ? "#fff" : Colors.textSecondary} />
          <Text style={[styles.filterChipText, sortByViolations && styles.filterChipTextActive]}>Priority</Text>
        </TouchableOpacity>
      </View>

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <View style={styles.bulkBar}>
          <Text style={styles.bulkCount}>{selectedIds.size} selected</Text>
          <TouchableOpacity style={styles.bulkApproveBtn} onPress={handleBulkApprove} accessibilityRole="button">
            <Ionicons name="checkmark-circle" size={14} color="#fff" />
            <Text style={styles.bulkBtnText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bulkRejectBtn} onPress={handleBulkReject} accessibilityRole="button">
            <Ionicons name="close-circle" size={14} color="#fff" />
            <Text style={styles.bulkBtnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Select all */}
      {items.length > 0 && statusFilter === "pending" && (
        <TouchableOpacity style={styles.selectAllBtn} onPress={selectAll} accessibilityRole="button">
          <Ionicons name={selectedIds.size === items.length ? "checkbox" : "square-outline"} size={16} color={BRAND.colors.amber} />
          <Text style={styles.selectAllText}>
            {selectedIds.size === items.length ? "Deselect All" : "Select All"}
          </Text>
        </TouchableOpacity>
      )}

      {/* Items list */}
      {isLoading ? (
        <ActivityIndicator style={styles.loader} color={BRAND.colors.amber} />
      ) : items.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="shield-checkmark-outline" size={32} color={Colors.textTertiary} />
          <Text style={styles.emptyText}>No items matching filters</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BRAND.colors.amber} />}
          contentContainerStyle={styles.listContent}
        >
          {items.map(item => (
            <View key={item.id} style={[styles.itemCard, selectedIds.has(item.id) && styles.itemCardSelected]}>
              <View style={styles.itemHeader}>
                <TouchableOpacity onPress={() => toggleSelect(item.id)} style={styles.checkbox} accessibilityRole="checkbox">
                  <Ionicons name={selectedIds.has(item.id) ? "checkbox" : "square-outline"} size={18} color={BRAND.colors.amber} />
                </TouchableOpacity>
                <Ionicons name={CONTENT_TYPE_ICONS[item.contentType] as any} size={14} color={Colors.textSecondary} />
                <Text style={styles.itemType}>{CONTENT_TYPE_LABELS[item.contentType]}</Text>
                {item.violations.length > 0 && (
                  <View style={styles.violationBadge}>
                    <Ionicons name="warning" size={10} color={Colors.red} />
                    <Text style={styles.violationCount}>{item.violations.length}</Text>
                  </View>
                )}
                <View style={styles.flexSpacer} />
                <Text style={styles.itemTime}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>

              <Text style={styles.itemContent} numberOfLines={3}>{item.content}</Text>

              {item.violations.length > 0 && (
                <View style={styles.violationList}>
                  {item.violations.map((v, i) => (
                    <Text key={i} style={styles.violationItem}>• {v}</Text>
                  ))}
                </View>
              )}

              {item.status === "pending" && (
                <View style={styles.itemActions}>
                  <TouchableOpacity
                    style={styles.approveBtn}
                    onPress={() => approveMutation.mutate(item.id)}
                    accessibilityRole="button"
                  >
                    <Ionicons name="checkmark" size={14} color={Colors.green} />
                    <Text style={[styles.actionBtnText, { color: Colors.green }]}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() => rejectMutation.mutate(item.id)}
                    accessibilityRole="button"
                  >
                    <Ionicons name="close" size={14} color={Colors.red} />
                    <Text style={[styles.actionBtnText, { color: Colors.red }]}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}

              {item.status !== "pending" && (
                <View style={styles.resolvedRow}>
                  <Ionicons
                    name={item.status === "approved" ? "checkmark-circle" : "close-circle"}
                    size={14}
                    color={item.status === "approved" ? Colors.green : Colors.red}
                  />
                  <Text style={styles.resolvedText}>
                    {item.status === "approved" ? "Approved" : "Rejected"}
                    {item.resolvedAt ? ` on ${new Date(item.resolvedAt).toLocaleDateString()}` : ""}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 16 },
  title: {
    fontSize: 24, fontWeight: "700", color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold", marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row", gap: 8, marginBottom: 12,
  },
  statCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 10,
    padding: 10, alignItems: "center", ...Colors.cardShadow,
  },
  statValue: {
    fontSize: 18, fontWeight: "700", color: Colors.text,
    fontFamily: "DMSans_700Bold",
  },
  statLabel: {
    ...TYPOGRAPHY.ui.small, color: Colors.textTertiary, marginTop: 2,
  },
  filterRow: {
    flexDirection: "row", gap: 6, marginBottom: 8, flexWrap: "wrap",
  },
  filterChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: BRAND.colors.amber, borderColor: BRAND.colors.amber,
  },
  filterChipText: {
    fontSize: 11, fontWeight: "600", color: Colors.textSecondary,
    fontFamily: "DMSans_600SemiBold",
  },
  filterChipTextActive: {
    color: "#fff",
  },
  bulkBar: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.surface, borderRadius: 10, padding: 10,
    marginBottom: 8, ...Colors.cardShadow,
  },
  bulkCount: {
    fontSize: 12, fontWeight: "600", color: Colors.text,
    fontFamily: "DMSans_600SemiBold", flex: 1,
  },
  bulkApproveBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: Colors.green, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  bulkRejectBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: Colors.red, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  bulkBtnText: {
    fontSize: 11, fontWeight: "600", color: "#fff", fontFamily: "DMSans_600SemiBold",
  },
  selectAllBtn: {
    flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8,
  },
  selectAllText: {
    fontSize: 12, color: BRAND.colors.amber, fontFamily: "DMSans_500Medium",
  },
  loader: { marginTop: 40 },
  emptyState: { alignItems: "center", paddingTop: 40, gap: 8 },
  emptyText: {
    fontSize: 14, color: Colors.textTertiary, fontFamily: "DMSans_500Medium",
  },
  listContent: { gap: 8, paddingBottom: 40 },
  itemCard: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: 12,
    ...Colors.cardShadow,
  },
  itemCardSelected: {
    borderWidth: 1, borderColor: BRAND.colors.amber,
  },
  itemHeader: {
    flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6,
  },
  checkbox: { marginRight: 2 },
  itemType: {
    fontSize: 11, fontWeight: "600", color: Colors.textSecondary,
    fontFamily: "DMSans_600SemiBold",
  },
  violationBadge: {
    flexDirection: "row", alignItems: "center", gap: 2,
    backgroundColor: Colors.redFaint, borderRadius: 8,
    paddingHorizontal: 5, paddingVertical: 1,
  },
  violationCount: {
    fontSize: 10, fontWeight: "700", color: Colors.red,
    fontFamily: "DMSans_700Bold",
  },
  flexSpacer: { flex: 1 },
  itemTime: {
    ...TYPOGRAPHY.ui.small, color: Colors.textTertiary,
  },
  itemContent: {
    fontSize: 13, color: Colors.text, fontFamily: "DMSans_400Regular",
    lineHeight: 18, marginBottom: 6,
  },
  violationList: { marginBottom: 6 },
  violationItem: {
    fontSize: 11, color: Colors.red, fontFamily: "DMSans_500Medium",
    lineHeight: 16,
  },
  itemActions: {
    flexDirection: "row", gap: 8, marginTop: 4,
  },
  approveBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    backgroundColor: Colors.greenFaint,
  },
  rejectBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    backgroundColor: Colors.redFaint,
  },
  actionBtnText: {
    fontSize: 11, fontWeight: "600", fontFamily: "DMSans_600SemiBold",
  },
  resolvedRow: {
    flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4,
  },
  resolvedText: {
    ...TYPOGRAPHY.ui.small, color: Colors.textTertiary,
  },
});
