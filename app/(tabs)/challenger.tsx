import React, { useState, useCallback, useEffect } from "react";
import { track } from "@/lib/analytics";
import {
  View, Text, StyleSheet, ScrollView,
  Platform, TouchableOpacity, RefreshControl, UIManager,
} from "react-native";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Colors from "@/constants/colors";
import { type ApiChallenger } from "@/lib/api";
import { fetchActiveChallenges } from "@/lib/api";
import { useCity } from "@/lib/city-context";
import { BRAND } from "@/constants/brand";
import * as Haptics from "expo-haptics";
import { ChallengerSkeleton } from "@/components/Skeleton";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ErrorState } from "@/components/NetworkBanner";
import { useChallengerTip, ChallengerTipCard } from "@/components/challenger/ChallengerTip";
import { ChallengeCard } from "@/components/challenger/ChallengeCard";

export default function ChallengerScreen() {

  const insets = useSafeAreaInsets();
  const { city } = useCity();
  const topPad = Platform.OS === "web" ? 20 : insets.top;

  const { data: challenges = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["challengers", city],
    queryFn: () => fetchActiveChallenges(city),
    staleTime: 30000,
  });

  useEffect(() => { track("view_challenger"); }, []);

  const { showTip: showChallengerTip, dismissTip: dismissChallengerTip } = useChallengerTip();

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    Haptics.selectionAsync();
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <ErrorBoundary>
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Live Challenges</Text>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>
      <Text style={styles.headerSub}>
        Head-to-head battles. Community-weighted votes. Real winners.
      </Text>

      {isLoading ? (
        <ChallengerSkeleton />
      ) : isError ? (
        <ErrorState title="Couldn't load challenges" onRetry={() => refetch()} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BRAND.colors.amber} />
          }
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 90 }
          ]}
        >
          {showChallengerTip && (
            <ChallengerTipCard onDismiss={dismissChallengerTip} />
          )}

          {challenges.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="flash" size={28} color={BRAND.colors.amber} />
              </View>
              <Text style={styles.emptyText}>No active challenges</Text>
              <Text style={styles.emptySubtext}>New head-to-head matchups drop weekly.{"\n"}Rate more businesses to unlock challengers!</Text>
            </View>
          ) : (
            challenges.map((ch: ApiChallenger) => (
              <ChallengeCard key={ch.id} challenge={ch} />
            ))
          )}
        </ScrollView>
      )}
    </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 10,
    paddingBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold",
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontFamily: "DMSans_400Regular",
    paddingHorizontal: 20,
    paddingBottom: 16,
    marginTop: 2,
  },
  liveBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(231,76,60,0.1)", paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 10,
  },
  liveDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: "#E74C3C",
  },
  liveText: {
    fontSize: 10, fontWeight: "800", color: "#E74C3C", fontFamily: "DMSans_700Bold",
    letterSpacing: 1,
  },
  content: { paddingHorizontal: 16, gap: 16 },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyIcon: {
    width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center",
    backgroundColor: `${BRAND.colors.amber}10`, marginBottom: 4,
  },
  emptyText: { fontSize: 15, fontWeight: "600", color: Colors.textSecondary, fontFamily: "DMSans_600SemiBold" },
  emptySubtext: { fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  errorState: { alignItems: "center", paddingTop: 60, gap: 8 },
  errorText: { fontSize: 15, fontWeight: "600", color: Colors.textSecondary, fontFamily: "DMSans_600SemiBold" },
  errorSubtext: { fontSize: 12, color: Colors.textTertiary, fontFamily: "DMSans_400Regular" },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: BRAND.colors.amber,
    borderRadius: 20,
  },
  retryText: { fontSize: 14, fontWeight: "600", color: "#fff", fontFamily: "DMSans_600SemiBold" },
});
