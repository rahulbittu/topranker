import React, { useEffect } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import ReAnimated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming,
  withSequence, Easing,
} from "react-native-reanimated";
import Colors from "@/constants/colors";


function SkeletonBlock({ style, delay = 0 }: { style?: ViewStyle; delay?: number }) {
  // Sprint 691: Smoother shimmer with reanimated + staggered delay
  const shimmer = useSharedValue(0.25);

  useEffect(() => {
    shimmer.value = withRepeat(
      withSequence(
        withTiming(0.65, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.25, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: shimmer.value,
  }));

  return (
    <ReAnimated.View
      style={[styles.block, style, animStyle]}
    />
  );
}

export function LeaderboardSkeleton() {
  return (
    <View style={styles.container}>
      {/* Hero skeleton */}
      <View style={styles.heroSkeleton}>
        <SkeletonBlock style={{ width: "100%", height: 240, borderRadius: 16 }} />
        <View style={{ padding: 14, gap: 8 }}>
          <SkeletonBlock style={{ width: "60%", height: 14, borderRadius: 6 }} />
          <SkeletonBlock style={{ width: "40%", height: 10, borderRadius: 4 }} />
        </View>
      </View>
      {/* Row skeletons — vertical card with photo strip on top */}
      {[1, 2, 3, 4].map(i => (
        <View key={i} style={styles.rowSkeleton}>
          <SkeletonBlock style={{ width: "100%", height: 140, borderRadius: 0 }} />
          <View style={{ padding: 12, gap: 6 }}>
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

export function ChallengerSkeleton() {
  return (
    <View style={styles.container}>
      {[1, 2].map(i => (
        <View key={i} style={styles.challengerCard}>
          <SkeletonBlock style={{ width: "50%", height: 12, borderRadius: 6, alignSelf: "center" }} />
          <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 12 }}>
            <View style={{ alignItems: "center", gap: 8 }}>
              <SkeletonBlock style={{ width: 80, height: 80, borderRadius: 40 }} />
              <SkeletonBlock style={{ width: 60, height: 12, borderRadius: 4 }} />
            </View>
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <SkeletonBlock style={{ width: 30, height: 14, borderRadius: 4 }} />
            </View>
            <View style={{ alignItems: "center", gap: 8 }}>
              <SkeletonBlock style={{ width: 80, height: 80, borderRadius: 40 }} />
              <SkeletonBlock style={{ width: 60, height: 12, borderRadius: 4 }} />
            </View>
          </View>
          <SkeletonBlock style={{ width: "100%", height: 6, borderRadius: 3, marginTop: 12 }} />
          <SkeletonBlock style={{ width: "40%", height: 10, borderRadius: 4, marginTop: 8, alignSelf: "center" }} />
        </View>
      ))}
    </View>
  );
}

export function ProfileSkeleton() {
  return (
    <View style={styles.container}>
      <View style={[styles.profileHeader, { alignItems: "center", gap: 12, padding: 20 }]}>
        <SkeletonBlock style={{ width: 64, height: 64, borderRadius: 32 }} />
        <SkeletonBlock style={{ width: "50%", height: 16, borderRadius: 6 }} />
        <SkeletonBlock style={{ width: "30%", height: 10, borderRadius: 4 }} />
      </View>
      <View style={[styles.detailCard, { gap: 10 }]}>
        <SkeletonBlock style={{ width: "40%", height: 12, borderRadius: 4 }} />
        <SkeletonBlock style={{ width: "60%", height: 28, borderRadius: 6 }} />
        <SkeletonBlock style={{ width: "100%", height: 4, borderRadius: 2 }} />
      </View>
      <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 16 }}>
        {[1, 2, 3, 4].map(i => (
          <View key={i} style={{ flex: 1, alignItems: "center", gap: 6, backgroundColor: Colors.surface, borderRadius: 10, padding: 12 }}>
            <SkeletonBlock style={{ width: 30, height: 18, borderRadius: 4 }} />
            <SkeletonBlock style={{ width: 40, height: 8, borderRadius: 3 }} />
          </View>
        ))}
      </View>
    </View>
  );
}

export function DiscoverSkeleton() {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map(i => (
        <View key={i} style={styles.discoverRow}>
          <SkeletonBlock style={{ width: "100%", height: 120, borderRadius: 0 }} />
          <View style={{ padding: 10, gap: 6 }}>
            <SkeletonBlock style={{ width: "75%", height: 14, borderRadius: 6 }} />
            <SkeletonBlock style={{ width: "55%", height: 10, borderRadius: 4 }} />
            <View style={{ flexDirection: "row", gap: 6 }}>
              <SkeletonBlock style={{ width: 50, height: 10, borderRadius: 4 }} />
              <SkeletonBlock style={{ width: 40, height: 10, borderRadius: 4 }} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * Sprint 691: Wrapper that fades content in when loading completes.
 * Use around content that replaces a skeleton: the content slides up
 * and fades in for a smooth skeleton→content transition.
 */
export function SkeletonToContent({ children, visible }: { children: React.ReactNode; visible: boolean }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(8);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) });
      translateY.value = withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) });
    }
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return <ReAnimated.View style={animStyle}>{children}</ReAnimated.View>;
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
    backgroundColor: Colors.surface,
    borderRadius: 14,
    overflow: "hidden",
    ...Colors.cardShadow,
  },
  profileHeader: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    ...Colors.cardShadow,
  },
  challengerCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    ...Colors.cardShadow,
  },
  discoverRow: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    overflow: "hidden",
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
