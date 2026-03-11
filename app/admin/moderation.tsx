/**
 * Admin Moderation Queue — Sprint 594 UX Enhancement
 * Text search, moderator notes on reject, stale item highlighting,
 * item counts on filter chips, relative time display.
 * Owner: Nadia Kaur (Security)
 */

import React, { useState, useCallback, useMemo } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert, Platform, TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Colors from "../../constants/colors";
import { BRAND } from "../../constants/brand";
import { TYPOGRAPHY } from "../../constants/typography";
import { apiFetch, apiRequest } from "../../lib/api";
import { ModerationItem, ModerationItemCard } from "../../components/admin/ModerationItemCard";

type ContentType = "review" | "photo" | "reply";

interface QueueStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

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

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  review: "Review", photo: "Photo", reply: "Reply",
};

export default function ModerationScreen() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [sortByViolations, setSortByViolations] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});
  const [showRejectInput, setShowRejectInput] = useState<Record<string, boolean>>({});

  const { data: stats } = useQueueStats();
  const { data: items = [], isLoading, refetch } = useFilteredQueue({
    status: statusFilter || undefined,
    contentType: typeFilter || undefined,
    sort: sortByViolations ? "violations" : undefined,
  });

  // Client-side text search filter
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(i =>
      i.content.toLowerCase().includes(q) ||
      i.violations.some(v => v.toLowerCase().includes(q))
    );
  }, [items, searchQuery]);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "moderation"] });
    setSelectedIds(new Set());
  };

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/admin/moderation/${id}/approve`),
    onSuccess: invalidateAll,
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      apiRequest("POST", `/api/admin/moderation/${id}/reject`, { note }),
    onSuccess: (_, { id }) => {
      invalidateAll();
      setRejectNotes(prev => { const n = { ...prev }; delete n[id]; return n; });
      setShowRejectInput(prev => { const n = { ...prev }; delete n[id]; return n; });
    },
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
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map(i => i.id)));
    }
  };

  const handleBulkAction = (action: "approve" | "reject") => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    const label = action === "approve" ? "Approve" : "Reject";
    const run = () => action === "approve" ? bulkApproveMutation.mutate(ids) : bulkRejectMutation.mutate(ids);
    if (Platform.OS === "web") {
      if (window.confirm(`${label} ${ids.length} items?`)) run();
    } else {
      Alert.alert(`Bulk ${label}`, `${label} ${ids.length} items?`, [
        { text: "Cancel", style: "cancel" },
        { text: label, style: action === "reject" ? "destructive" : "default", onPress: run },
      ]);
    }
  };

  const statusOptions = [
    { key: "pending", label: "Pending", count: stats?.pending },
    { key: "approved", label: "Approved", count: stats?.approved },
    { key: "rejected", label: "Rejected", count: stats?.rejected },
    { key: "", label: "All", count: stats?.total },
  ];

  return (
    <View style={st.container}>
      <Text style={st.title}>Moderation Queue</Text>

      {/* Search bar */}
      <View style={st.searchRow}>
        <Ionicons name="search-outline" size={16} color={Colors.textTertiary} />
        <TextInput
          style={st.searchInput}
          placeholder="Search content or violations..."
          placeholderTextColor={Colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")} hitSlop={8}>
            <Ionicons name="close-circle" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Stats row */}
      {stats && (
        <View style={st.statsRow}>
          {statusOptions.map(o => (
            <View key={o.key || "all"} style={st.statCard}>
              <Text style={st.statValue}>{o.count ?? 0}</Text>
              <Text style={st.statLabel}>{o.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Status filter chips with counts */}
      <View style={st.filterRow}>
        {statusOptions.map(o => (
          <TouchableOpacity
            key={o.key || "all"}
            style={[st.filterChip, statusFilter === o.key && st.filterChipActive]}
            onPress={() => setStatusFilter(o.key)}
            accessibilityRole="button"
          >
            <Text style={[st.filterChipText, statusFilter === o.key && st.filterChipTextActive]}>
              {o.label}{o.count != null ? ` (${o.count})` : ""}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content type + sort */}
      <View style={st.filterRow}>
        {(["", "review", "photo", "reply"] as const).map(t => (
          <TouchableOpacity
            key={t || "all-types"}
            style={[st.filterChip, typeFilter === t && st.filterChipActive]}
            onPress={() => setTypeFilter(t)}
            accessibilityRole="button"
          >
            <Text style={[st.filterChipText, typeFilter === t && st.filterChipTextActive]}>
              {t ? CONTENT_TYPE_LABELS[t] : "All Types"}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[st.filterChip, sortByViolations && st.filterChipActive]}
          onPress={() => setSortByViolations(!sortByViolations)}
          accessibilityRole="button"
        >
          <Ionicons name="warning-outline" size={12} color={sortByViolations ? "#fff" : Colors.textSecondary} />
          <Text style={[st.filterChipText, sortByViolations && st.filterChipTextActive]}>Priority</Text>
        </TouchableOpacity>
      </View>

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <View style={st.bulkBar}>
          <Text style={st.bulkCount}>{selectedIds.size} selected</Text>
          <TouchableOpacity style={st.bulkApproveBtn} onPress={() => handleBulkAction("approve")} accessibilityRole="button">
            <Ionicons name="checkmark-circle" size={14} color="#fff" />
            <Text style={st.bulkBtnText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={st.bulkRejectBtn} onPress={() => handleBulkAction("reject")} accessibilityRole="button">
            <Ionicons name="close-circle" size={14} color="#fff" />
            <Text style={st.bulkBtnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Select all */}
      {filteredItems.length > 0 && statusFilter === "pending" && (
        <TouchableOpacity style={st.selectAllBtn} onPress={selectAll} accessibilityRole="button">
          <Ionicons name={selectedIds.size === filteredItems.length ? "checkbox" : "square-outline"} size={16} color={BRAND.colors.amber} />
          <Text style={st.selectAllText}>
            {selectedIds.size === filteredItems.length ? "Deselect All" : `Select All (${filteredItems.length})`}
          </Text>
        </TouchableOpacity>
      )}

      {/* Items list */}
      {isLoading ? (
        <ActivityIndicator style={st.loader} color={BRAND.colors.amber} />
      ) : filteredItems.length === 0 ? (
        <View style={st.emptyState}>
          <Ionicons name="shield-checkmark-outline" size={32} color={Colors.textTertiary} />
          <Text style={st.emptyText}>
            {searchQuery ? "No items match your search" : "No items matching filters"}
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BRAND.colors.amber} />}
          contentContainerStyle={st.listContent}
        >
          {filteredItems.map(item => (
            <ModerationItemCard
              key={item.id}
              item={item}
              selected={selectedIds.has(item.id)}
              onToggleSelect={() => toggleSelect(item.id)}
              onApprove={() => approveMutation.mutate(item.id)}
              onReject={(note) => rejectMutation.mutate({ id: item.id, note })}
              rejectNote={rejectNotes[item.id] || ""}
              onRejectNoteChange={(text) => setRejectNotes(prev => ({ ...prev, [item.id]: text }))}
              showRejectInput={!!showRejectInput[item.id]}
              onToggleRejectInput={() => setShowRejectInput(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 16 },
  title: {
    fontSize: 24, fontWeight: "700", color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold", marginBottom: 12,
  },
  searchRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.surface, borderRadius: 10, paddingHorizontal: 12,
    paddingVertical: 8, marginBottom: 12, borderWidth: 1, borderColor: Colors.border,
  },
  searchInput: {
    flex: 1, fontSize: 13, color: Colors.text, fontFamily: "DMSans_400Regular",
    padding: 0,
  },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  statCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 10,
    padding: 10, alignItems: "center", ...Colors.cardShadow,
  },
  statValue: { fontSize: 18, fontWeight: "700", color: Colors.text, fontFamily: "DMSans_700Bold" },
  statLabel: { ...TYPOGRAPHY.ui.small, color: Colors.textTertiary, marginTop: 2 },
  filterRow: { flexDirection: "row", gap: 6, marginBottom: 8, flexWrap: "wrap" },
  filterChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: BRAND.colors.amber, borderColor: BRAND.colors.amber },
  filterChipText: { fontSize: 11, fontWeight: "600", color: Colors.textSecondary, fontFamily: "DMSans_600SemiBold" },
  filterChipTextActive: { color: "#fff" },
  bulkBar: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: Colors.surface, borderRadius: 10, padding: 10,
    marginBottom: 8, ...Colors.cardShadow,
  },
  bulkCount: { fontSize: 12, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold", flex: 1 },
  bulkApproveBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: Colors.green, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6,
  },
  bulkRejectBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: Colors.red, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6,
  },
  bulkBtnText: { fontSize: 11, fontWeight: "600", color: "#fff", fontFamily: "DMSans_600SemiBold" },
  selectAllBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  selectAllText: { fontSize: 12, color: BRAND.colors.amber, fontFamily: "DMSans_500Medium" },
  loader: { marginTop: 40 },
  emptyState: { alignItems: "center", paddingTop: 40, gap: 8 },
  emptyText: { fontSize: 14, color: Colors.textTertiary, fontFamily: "DMSans_500Medium" },
  listContent: { gap: 8, paddingBottom: 40 },
});
