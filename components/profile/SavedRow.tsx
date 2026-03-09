import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { getCategoryDisplay } from "@/constants/brand";
import type { BookmarkEntry } from "@/lib/bookmarks-context";

export const SavedRow = React.memo(function SavedRow({ entry }: { entry: BookmarkEntry }) {
  const catDisplay = getCategoryDisplay(entry.category);
  return (
    <TouchableOpacity
      style={s.savedRow}
      activeOpacity={0.7}
      onPress={() => router.push({ pathname: "/business/[id]", params: { id: entry.slug } })}
      accessibilityRole="link"
      accessibilityLabel={`View ${entry.name}`}
    >
      <View style={s.savedEmoji}>
        <Text style={s.savedEmojiText}>{catDisplay.emoji}</Text>
      </View>
      <View style={s.savedInfo}>
        <Text style={s.savedName} numberOfLines={1}>{entry.name}</Text>
        <Text style={s.savedCategory}>{catDisplay.label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={14} color={Colors.textTertiary} />
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
  savedCategory: { fontSize: 11, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
});
