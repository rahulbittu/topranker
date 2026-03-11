import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export interface ReviewRating {
  id: string;
  user: string;
  score: number;
  tier: string;
  note: string | null;
  date: string;
}

const tierColors: Record<string, string> = {
  community: "#94A3B8", city: "#3B82F6", trusted: "#8B5CF6", top: "#F59E0B",
};
const tierNames: Record<string, string> = {
  community: "Community", city: "City", trusted: "Trusted", top: "Top",
};

export function ReviewCard({ rating, delay }: { rating: ReviewRating; delay: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewUser}>
          <View style={[styles.reviewAvatar, { backgroundColor: tierColors[rating.tier] || Colors.textTertiary }]}>
            <Text style={styles.reviewAvatarText}>{rating.user.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.reviewUserName}>{rating.user}</Text>
            <Text style={[styles.reviewTier, { color: tierColors[rating.tier] }]}>{tierNames[rating.tier]} Reviewer</Text>
          </View>
        </View>
        <View style={styles.reviewScoreWrap}>
          <Text style={styles.reviewScore}>{rating.score.toFixed(1)}</Text>
          <Text style={styles.reviewDate}>{timeAgo(rating.date)}</Text>
        </View>
      </View>
      {rating.note && <Text style={styles.reviewNote}>"{rating.note}"</Text>}
      <View style={styles.reviewActions}>
        <TouchableOpacity style={styles.reviewActionBtn} activeOpacity={0.7}>
          <Ionicons name="chatbubble-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.reviewActionText}>Reply</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.reviewActionBtn} activeOpacity={0.7}>
          <Ionicons name="flag-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.reviewActionText}>Flag</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  reviewCard: { backgroundColor: Colors.surfaceRaised, borderRadius: 14, padding: 14, gap: 10 },
  reviewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  reviewUser: { flexDirection: "row", alignItems: "center", gap: 10 },
  reviewAvatar: {
    width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center",
  },
  reviewAvatarText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF", fontFamily: "DMSans_700Bold" },
  reviewUserName: { fontSize: 13, fontWeight: "600", color: Colors.text, fontFamily: "DMSans_600SemiBold" },
  reviewTier: { fontSize: 10, fontFamily: "DMSans_400Regular" },
  reviewScoreWrap: { alignItems: "flex-end" },
  reviewScore: { fontSize: 18, fontWeight: "800", color: Colors.text, fontFamily: "PlayfairDisplay_700Bold" },
  reviewDate: { fontSize: 10, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  reviewNote: {
    fontSize: 13, color: Colors.textSecondary, fontFamily: "DMSans_400Regular",
    fontStyle: "italic", lineHeight: 19,
  },
  reviewActions: { flexDirection: "row", gap: 16 },
  reviewActionBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  reviewActionText: { fontSize: 12, color: Colors.textSecondary, fontFamily: "DMSans_500Medium" },
});
