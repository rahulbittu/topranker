/**
 * Sprint 387: Enhanced HistoryRow with edit/delete actions.
 * Sprint 403: Expandable dimension detail view with scores and visit type.
 * Long-press reveals action buttons (Edit, Delete).
 * Tap toggles detail expansion.
 */
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { formatTimeAgo, getQ1Label, getQ3Label } from "@/lib/data";

const AMBER = BRAND.colors.amber;

const VISIT_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  dine_in: { label: "Dined In", icon: "restaurant" },
  delivery: { label: "Delivery", icon: "bicycle" },
  takeaway: { label: "Takeaway", icon: "bag-handle" },
};

export interface HistoryRowProps {
  r: any;
  onDelete?: (ratingId: string) => void;
}

export const HistoryRow = React.memo(function HistoryRow({ r, onDelete }: HistoryRowProps) {
  const [showActions, setShowActions] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowActions(prev => !prev);
  };

  const handleTap = () => {
    Haptics.selectionAsync();
    setExpanded(prev => !prev);
  };

  const handleEdit = () => {
    setShowActions(false);
    if (r.businessSlug) {
      router.push({
        pathname: "/rate/[id]",
        params: { id: r.businessSlug, editRatingId: r.id },
      });
    }
  };

  const handleDelete = () => {
    setShowActions(false);
    Alert.alert(
      "Delete Rating",
      `Are you sure you want to delete your rating for ${r.businessName || "this business"}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete?.(r.id),
        },
      ],
    );
  };

  const createdAt = new Date(r.createdAt).getTime();
  const hoursAgo = (Date.now() - createdAt) / (1000 * 60 * 60);
  const canEdit = hoursAgo <= 48;

  // Sprint 403: Dimension labels based on visit type
  const visitType = r.visitType || "dine_in";
  const visitInfo = VISIT_TYPE_LABELS[visitType] || VISIT_TYPE_LABELS.dine_in;
  const dimLabels = visitType === "delivery"
    ? ["Food", "Packaging", "Value"]
    : visitType === "takeaway"
    ? ["Food", "Wait Time", "Value"]
    : ["Food", "Service", "Vibe"];

  return (
    <View>
      <TouchableOpacity
        style={[s.historyRow, expanded && s.historyRowExpanded]}
        activeOpacity={0.7}
        onPress={handleTap}
        onLongPress={handleLongPress}
        accessibilityRole="button"
        accessibilityLabel={`${r.businessName || "Business"}, score ${parseFloat(r.rawScore).toFixed(1)}. Tap to expand details`}
        accessibilityHint="Long press for edit and delete options"
      >
        <View style={s.historyLeft}>
          <Text style={s.historyName}>{r.businessName || "Business"}</Text>
          <Text style={s.historyDate}>{formatTimeAgo(createdAt)}</Text>
        </View>
        <View style={s.historyRight}>
          <Text style={s.historyScore}>{parseFloat(r.rawScore).toFixed(1)}</Text>
          <Text style={s.historyWeight}>{parseFloat(r.weight).toFixed(2)}x weight</Text>
        </View>
        <Ionicons name={expanded ? "chevron-down" : "chevron-forward"} size={14} color={Colors.textTertiary} />
      </TouchableOpacity>

      {/* Sprint 403: Expandable detail view */}
      {expanded && (
        <View style={s.detailSection}>
          <View style={s.detailRow}>
            <View style={s.visitTypeBadge}>
              <Ionicons name={visitInfo.icon as any} size={12} color={AMBER} />
              <Text style={s.visitTypeText}>{visitInfo.label}</Text>
            </View>
            {r.wouldReturn !== undefined && r.wouldReturn !== null && (
              <View style={[s.returnBadge, r.wouldReturn ? s.returnYes : s.returnNo]}>
                <Ionicons name={r.wouldReturn ? "checkmark" : "close"} size={10} color={r.wouldReturn ? Colors.green : Colors.red} />
                <Text style={[s.returnText, r.wouldReturn ? s.returnTextYes : s.returnTextNo]}>
                  {r.wouldReturn ? "Would return" : "Would not return"}
                </Text>
              </View>
            )}
          </View>

          <View style={s.dimensionRow}>
            {[r.q1Score, r.q2Score, r.q3Score].map((score: number, i: number) => (
              <View key={i} style={s.dimensionBox}>
                <Text style={s.dimensionLabel}>{dimLabels[i]}</Text>
                <Text style={s.dimensionScore}>{score || "—"}</Text>
              </View>
            ))}
          </View>

          {r.note && (
            <Text style={s.noteText} numberOfLines={2}>{r.note}</Text>
          )}

          <TouchableOpacity
            style={s.viewBusinessBtn}
            onPress={() => r.businessSlug && router.push({ pathname: "/business/[id]", params: { id: r.businessSlug } })}
            accessibilityRole="link"
            accessibilityLabel={`View ${r.businessName || "business"}`}
          >
            <Text style={s.viewBusinessText}>View Business</Text>
            <Ionicons name="arrow-forward" size={12} color={AMBER} />
          </TouchableOpacity>
        </View>
      )}

      {showActions && (
        <View style={s.actionRow}>
          {canEdit && (
            <TouchableOpacity
              style={s.editBtn}
              onPress={handleEdit}
              accessibilityRole="button"
              accessibilityLabel="Edit this rating"
            >
              <Ionicons name="create-outline" size={14} color={AMBER} />
              <Text style={s.editBtnText}>Edit</Text>
            </TouchableOpacity>
          )}
          {!canEdit && (
            <View style={s.expiredLabel}>
              <Ionicons name="time-outline" size={12} color={Colors.textTertiary} />
              <Text style={s.expiredText}>Edit window expired (48h)</Text>
            </View>
          )}
          <TouchableOpacity
            style={s.deleteBtn}
            onPress={handleDelete}
            accessibilityRole="button"
            accessibilityLabel="Delete this rating"
          >
            <Ionicons name="trash-outline" size={14} color={Colors.red} />
            <Text style={s.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
});

const s = StyleSheet.create({
  historyRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: Colors.surface, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, ...Colors.cardShadow,
  },
  historyRowExpanded: {
    borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
  },
  historyLeft: { gap: 2 },
  historyName: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  historyDate: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  historyRight: { alignItems: "flex-end", gap: 2 },
  historyScore: { fontSize: 18, fontWeight: "700", color: Colors.text, fontFamily: "PlayfairDisplay_700Bold" },
  historyWeight: { fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  actionRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "flex-end",
    gap: 8, paddingHorizontal: 14, paddingVertical: 6,
  },
  editBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: `${AMBER}10`, borderRadius: 8,
  },
  editBtnText: { fontSize: 12, fontWeight: "600", color: AMBER, fontFamily: "DMSans_600SemiBold" },
  deleteBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: "rgba(239,68,68,0.08)", borderRadius: 8,
  },
  deleteBtnText: { fontSize: 12, fontWeight: "600", color: Colors.red, fontFamily: "DMSans_600SemiBold" },
  expiredLabel: {
    flexDirection: "row", alignItems: "center", gap: 4,
  },
  expiredText: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  // Sprint 403: Expandable detail view
  detailSection: {
    backgroundColor: Colors.surface, borderBottomLeftRadius: 12, borderBottomRightRadius: 12,
    paddingHorizontal: 14, paddingBottom: 12, gap: 10, ...Colors.cardShadow,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  detailRow: {
    flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 8,
  },
  visitTypeBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(196,154,26,0.08)", paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8,
  },
  visitTypeText: {
    fontSize: 11, fontWeight: "600", color: AMBER, fontFamily: "DMSans_600SemiBold",
  },
  returnBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  returnYes: { backgroundColor: "rgba(34,139,34,0.08)" },
  returnNo: { backgroundColor: "rgba(239,68,68,0.08)" },
  returnText: { fontSize: 11, fontFamily: "DMSans_500Medium" },
  returnTextYes: { color: Colors.green },
  returnTextNo: { color: Colors.red },
  dimensionRow: {
    flexDirection: "row", gap: 8,
  },
  dimensionBox: {
    flex: 1, alignItems: "center", gap: 4,
    backgroundColor: Colors.surfaceRaised, borderRadius: 8,
    paddingVertical: 8,
  },
  dimensionLabel: {
    fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular",
  },
  dimensionScore: {
    fontSize: 18, fontWeight: "700", color: Colors.text, fontFamily: "PlayfairDisplay_700Bold",
  },
  noteText: {
    fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
    fontStyle: "italic",
  },
  viewBusinessBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4,
    paddingVertical: 6,
  },
  viewBusinessText: {
    fontSize: 12, color: AMBER, fontFamily: "DMSans_600SemiBold",
  },
});
