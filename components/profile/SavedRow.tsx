import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { getCategoryDisplay } from "@/constants/brand";
import type { BookmarkEntry } from "@/lib/bookmarks-context";

// Sprint 349: Relative time helper for saved date
function savedTimeAgo(savedAt: number): string {
  const diff = Date.now() - savedAt;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export const SavedRow = React.memo(function SavedRow({ entry, onRemove }: { entry: BookmarkEntry; onRemove?: (id: string) => void }) {
  // Sprint 349: Prefer cuisine emoji over category
  const cuisineDisplay = entry.cuisine ? getCategoryDisplay(entry.cuisine) : null;
  const catDisplay = getCategoryDisplay(entry.category);
  const emoji = cuisineDisplay?.emoji || catDisplay.emoji;
  const label = cuisineDisplay?.label || catDisplay.label;
  return (
    <TouchableOpacity
      style={s.savedRow}
      activeOpacity={0.7}
      onPress={() => router.push({ pathname: "/business/[id]", params: { id: entry.slug } })}
      accessibilityRole="link"
      accessibilityLabel={`View ${entry.name}, saved ${savedTimeAgo(entry.savedAt)}`}
    >
      <View style={s.savedEmoji}>
        <Text style={s.savedEmojiText}>{emoji}</Text>
      </View>
      <View style={s.savedInfo}>
        <Text style={s.savedName} numberOfLines={1}>{entry.name}</Text>
        <View style={s.savedMeta}>
          <Text style={s.savedCategory}>{label}</Text>
          <Text style={s.savedDate}>{savedTimeAgo(entry.savedAt)}</Text>
        </View>
      </View>
      {onRemove ? (
        <TouchableOpacity
          onPress={() => onRemove(entry.id)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${entry.name} from saved`}
        >
          <Ionicons name="close-circle-outline" size={18} color={Colors.textTertiary} />
        </TouchableOpacity>
      ) : (
        <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
      )}
    </TouchableOpacity>
  );
});

const s = StyleSheet.create({
  savedRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, gap: 12, ...Colors.cardShadow,
  },
  savedEmoji: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.goldFaint, alignItems: "center", justifyContent: "center",
  },
  savedEmojiText: { fontSize: 18 },
  savedInfo: { flex: 1, gap: 2 },
  savedName: { fontSize: 14, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  savedMeta: { flexDirection: "row" as const, alignItems: "center" as const, gap: 6 },
  savedCategory: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  savedDate: { fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular", opacity: 0.7 },
});
