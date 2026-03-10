/**
 * Sprint 387: Enhanced HistoryRow with edit/delete actions.
 * Long-press reveals action buttons (Edit, Delete).
 */
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { formatTimeAgo } from "@/lib/data";

const AMBER = BRAND.colors.amber;

export interface HistoryRowProps {
  r: any;
  onDelete?: (ratingId: string) => void;
}

export const HistoryRow = React.memo(function HistoryRow({ r, onDelete }: HistoryRowProps) {
  const [showActions, setShowActions] = useState(false);

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowActions(prev => !prev);
  };

  const handleEdit = () => {
    setShowActions(false);
    // Navigate to rate page with edit context
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

  // Check if rating is within the 48-hour edit window
  const createdAt = new Date(r.createdAt).getTime();
  const hoursAgo = (Date.now() - createdAt) / (1000 * 60 * 60);
  const canEdit = hoursAgo <= 48;

  return (
    <View>
      <TouchableOpacity
        style={s.historyRow}
        activeOpacity={0.7}
        onPress={() => r.businessSlug && router.push({ pathname: "/business/[id]", params: { id: r.businessSlug } })}
        onLongPress={handleLongPress}
        accessibilityRole="link"
        accessibilityLabel={`${r.businessName || "Business"}, score ${parseFloat(r.rawScore).toFixed(1)}`}
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
        <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
      </TouchableOpacity>

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
});
