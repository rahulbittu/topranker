import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet, ViewStyle } from "react-native";
import Colors from "@/constants/colors";

function SkeletonBlock({ style }: { style?: ViewStyle }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[styles.block, style, { opacity }]}
    />
  );
}

export function LeaderboardSkeleton() {
  return (
    <View style={styles.container}>
      {/* Hero skeleton */}
      <View style={styles.heroSkeleton}>
        <SkeletonBlock style={{ width: "100%", height: 220, borderRadius: 16 }} />
        <View style={{ padding: 14, gap: 8 }}>
          <SkeletonBlock style={{ width: "60%", height: 14, borderRadius: 6 }} />
          <SkeletonBlock style={{ width: "40%", height: 10, borderRadius: 4 }} />
        </View>
      </View>
      {/* Row skeletons */}
      {[1, 2, 3, 4].map(i => (
        <View key={i} style={styles.rowSkeleton}>
          <SkeletonBlock style={{ width: 80, height: 80, borderRadius: 10 }} />
          <View style={{ flex: 1, gap: 8 }}>
            <SkeletonBlock style={{ width: "70%", height: 14, borderRadius: 6 }} />
            <SkeletonBlock style={{ width: "50%", height: 10, borderRadius: 4 }} />
            <SkeletonBlock style={{ width: "30%", height: 10, borderRadius: 4 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function BusinessDetailSkeleton() {
  return (
    <View style={styles.container}>
      <SkeletonBlock style={{ width: "100%", height: 240, borderRadius: 0 }} />
      <View style={styles.detailCard}>
        <SkeletonBlock style={{ width: "80%", height: 20, borderRadius: 6 }} />
        <SkeletonBlock style={{ width: "50%", height: 12, borderRadius: 4 }} />
      </View>
      <View style={[styles.detailCard, { alignItems: "center" }]}>
        <SkeletonBlock style={{ width: 80, height: 48, borderRadius: 8 }} />
        <SkeletonBlock style={{ width: 120, height: 10, borderRadius: 4 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, gap: 10, paddingTop: 4 },
  block: { backgroundColor: Colors.surfaceRaised },
  heroSkeleton: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    ...Colors.cardShadow,
  },
  rowSkeleton: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 12,
    gap: 14,
    ...Colors.cardShadow,
  },
  detailCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: 14,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    marginTop: 12,
    ...Colors.cardShadow,
  },
});
