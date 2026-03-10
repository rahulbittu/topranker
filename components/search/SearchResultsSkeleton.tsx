/**
 * Sprint 489: Search Results Skeleton Loading
 *
 * Matches the actual search results layout: filter chips bar,
 * result count, and business card skeletons with photo + text.
 * Shows during initial load and search-to-results transitions.
 */
import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet, ViewStyle } from "react-native";
import Colors from "@/constants/colors";

function SkeletonPulse({ style }: { style?: ViewStyle }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 600, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return <Animated.View style={[s.block, style, { opacity }]} />;
}

function ChipSkeleton({ width }: { width: number }) {
  return <SkeletonPulse style={{ width, height: 32, borderRadius: 16 }} />;
}

function CardSkeleton() {
  return (
    <View style={s.card}>
      <SkeletonPulse style={{ width: "100%" as any, height: 130, borderRadius: 0 }} />
      <View style={s.cardBody}>
        <View style={s.cardRow}>
          <SkeletonPulse style={{ width: "65%" as any, height: 16, borderRadius: 6 }} />
          <SkeletonPulse style={{ width: 40, height: 24, borderRadius: 8 }} />
        </View>
        <SkeletonPulse style={{ width: "45%" as any, height: 11, borderRadius: 4 }} />
        <View style={s.cardTags}>
          <SkeletonPulse style={{ width: 60, height: 10, borderRadius: 4 }} />
          <SkeletonPulse style={{ width: 45, height: 10, borderRadius: 4 }} />
          <SkeletonPulse style={{ width: 55, height: 10, borderRadius: 4 }} />
        </View>
      </View>
    </View>
  );
}

export function SearchResultsSkeleton() {
  return (
    <View style={s.container}>
      {/* Filter chips bar skeleton */}
      <View style={s.chipsRow}>
        <ChipSkeleton width={70} />
        <ChipSkeleton width={85} />
        <ChipSkeleton width={65} />
        <ChipSkeleton width={75} />
      </View>

      {/* Results count skeleton */}
      <View style={s.countRow}>
        <SkeletonPulse style={{ width: 120, height: 12, borderRadius: 4 }} />
        <SkeletonPulse style={{ width: 80, height: 12, borderRadius: 4 }} />
      </View>

      {/* Card skeletons */}
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </View>
  );
}

const s = StyleSheet.create({
  container: { paddingHorizontal: 16, gap: 10, paddingTop: 4 },
  block: { backgroundColor: Colors.surfaceRaised },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 6,
  },
  countRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    overflow: "hidden",
    ...Colors.cardShadow,
  },
  cardBody: {
    padding: 12,
    gap: 6,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTags: {
    flexDirection: "row",
    gap: 6,
    marginTop: 2,
  },
});
