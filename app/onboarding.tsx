import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Platform,
  Dimensions, FlatList, type ViewToken, AccessibilityInfo,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { LeaderboardMark } from "@/components/Logo";
import { hapticPress } from "@/lib/audio";
import { track } from "@/lib/analytics";

export const ONBOARDING_KEY = "hasSeenOnboarding";

const { width: SCREEN_W } = Dimensions.get("window");

interface OnboardingSlide {
  icon: string;
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
  accentColor: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    icon: "star",
    emoji: "👑",
    title: "Trust-Weighted Rankings",
    subtitle: "Not all reviews are equal",
    description:
      "TopRanker weights every rating by the reviewer's credibility. Longtime locals with consistent taste matter more than anonymous one-time reviewers. The result? Rankings you can actually trust.",
    accentColor: BRAND.colors.amber,
  },
  {
    icon: "trending-up",
    emoji: "📊",
    title: "Earn Your Credibility",
    subtitle: "Four tiers, one mission",
    description:
      "Start as a Community member. Rate honestly and consistently to climb through City, Trusted, and Top Ranker tiers. Each tier gives your voice more weight in the rankings.",
    accentColor: "#4CAF50",
  },
  {
    icon: "flash",
    emoji: "⚡",
    title: "Live Challenger Battles",
    subtitle: "30-day head-to-head showdowns",
    description:
      "Watch businesses compete in real-time challenges. Your weighted vote decides the winner. Follow the drama, share the results, and shape your city's dining scene.",
    accentColor: BRAND.colors.navy,
  },
  {
    icon: "people",
    emoji: "🏙️",
    title: "Your City, Your Voice",
    subtitle: "Rankings built by the community",
    description:
      "Every rating you submit moves the rankings. See your personal impact — how many businesses you've influenced, how your credibility grows, and where your voice matters most.",
    accentColor: "#E65100",
  },
];

function SlideItem({ item, index }: { item: OnboardingSlide; index: number }) {
  return (
    <View style={[slideStyles.container, { width: SCREEN_W }]}>
      <Animated.View entering={FadeInDown.delay(100).duration(500)}>
        <LinearGradient
          colors={[`${item.accentColor}18`, `${item.accentColor}08`]}
          style={slideStyles.emojiCircle}
        >
          {index === 0 ? (
            <LeaderboardMark fill={item.accentColor} size={48} />
          ) : (
            <Text style={slideStyles.emoji}>{item.emoji}</Text>
          )}
        </LinearGradient>
      </Animated.View>

      <Animated.Text entering={FadeInDown.delay(200).duration(500)} style={slideStyles.title}>
        {item.title}
      </Animated.Text>

      <Animated.Text entering={FadeInDown.delay(300).duration(500)} style={slideStyles.subtitle}>
        {item.subtitle}
      </Animated.Text>

      <Animated.Text entering={FadeInUp.delay(400).duration(500)} style={slideStyles.description}>
        {item.description}
      </Animated.Text>
    </View>
  );
}

const slideStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emojiCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: Colors.text,
    fontFamily: "PlayfairDisplay_900Black",
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "600",
    color: BRAND.colors.amber,
    fontFamily: "DMSans_600SemiBold",
    textAlign: "center",
    marginBottom: 20,
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontFamily: "DMSans_400Regular",
    textAlign: "center",
    lineHeight: 24,
  },
});

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 20 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  // Sprint 714: Track onboarding start on mount
  const hasTrackedStart = useRef(false);
  if (!hasTrackedStart.current) {
    hasTrackedStart.current = true;
    track("onboarding_start");
  }

  // Sprint 722: Respect reduced motion accessibility preference
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => sub.remove();
  }, []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const progressWidth = useSharedValue(1 / SLIDES.length);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setCurrentIndex(viewableItems[0].index);
      const target = (viewableItems[0].index + 1) / SLIDES.length;
      // Sprint 722: Skip animation when reduced motion is enabled
      progressWidth.value = reduceMotion
        ? target
        : withTiming(target, { duration: 300 });
      if (!reduceMotion) hapticPress();
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const isLastSlide = currentIndex === SLIDES.length - 1;

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%` as any,
  }));

  const goBack = useCallback(() => {
    if (currentIndex > 0) {
      hapticPress();
      flatListRef.current?.scrollToIndex({ index: currentIndex - 1, animated: true });
    }
  }, [currentIndex]);

  const completeOnboarding = async () => {
    track("onboarding_complete", { slides_viewed: currentIndex + 1 });
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    router.replace("/(tabs)");
  };

  const goNext = () => {
    hapticPress();
    if (isLastSlide) {
      completeOnboarding();
    } else {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };

  const skip = () => {
    hapticPress();
    track("onboarding_skip", { skipped_at_slide: currentIndex + 1 });
    completeOnboarding();
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      {/* Top bar: back, progress, skip */}
      <View style={styles.topBar}>
        {currentIndex > 0 ? (
          <TouchableOpacity
            onPress={goBack}
            style={styles.backBtn}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Previous slide"
          >
            <Ionicons name="arrow-back" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
        <TouchableOpacity
          onPress={skip}
          style={styles.skipBtn}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={({ item, index }) => <SlideItem item={item} index={index} />}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
        style={styles.slideList}
      />

      {/* Bottom action */}
      <View style={[styles.bottom, { paddingBottom: bottomPad + 16 }]}>
        <TouchableOpacity
          style={[styles.nextBtn, isLastSlide && styles.nextBtnFinal]}
          onPress={goNext}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={isLastSlide ? "Get started" : "Next slide"}
        >
          {isLastSlide ? (
            <Text style={styles.nextBtnText}>Start Exploring</Text>
          ) : (
            <>
              <Text style={styles.nextBtnText}>Next</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>

        {!isLastSlide && (
          <Text style={styles.slideCounter}>
            {currentIndex + 1} of {SLIDES.length}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: { width: 40, alignItems: "flex-start" },
  progressTrack: {
    flex: 1,
    height: 3,
    backgroundColor: Colors.border,
    borderRadius: 1.5,
    marginHorizontal: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: 3,
    backgroundColor: BRAND.colors.amber,
    borderRadius: 1.5,
  },
  skipBtn: { width: 40, alignItems: "flex-end" },
  skipText: {
    fontSize: 14, color: Colors.textTertiary,
    fontFamily: "DMSans_500Medium",
  },
  slideList: { flex: 1 },
  bottom: { paddingHorizontal: 24, gap: 12, alignItems: "center" },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: BRAND.colors.navy,
    borderRadius: 16,
    paddingVertical: 16,
    width: "100%",
  },
  nextBtnFinal: {
    backgroundColor: BRAND.colors.amber,
  },
  nextBtnText: {
    fontSize: 16, fontWeight: "700", color: "#FFFFFF",
    fontFamily: "DMSans_700Bold",
  },
  slideCounter: {
    fontSize: 12, color: Colors.textTertiary,
    fontFamily: "DMSans_400Regular",
  },
});
