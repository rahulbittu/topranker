import React, { useState, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Platform,
  Dimensions, FlatList, type ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { LeaderboardMark } from "@/components/Logo";
import { hapticPress } from "@/lib/audio";

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

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const isLastSlide = currentIndex === SLIDES.length - 1;

  const goNext = () => {
    hapticPress();
    if (isLastSlide) {
      router.replace("/(tabs)");
    } else {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };

  const skip = () => {
    hapticPress();
    router.replace("/(tabs)");
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      {/* Skip button */}
      <View style={styles.topBar}>
        <View style={{ width: 60 }} />
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentIndex && styles.dotActive,
              ]}
            />
          ))}
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
  dots: { flexDirection: "row", gap: 8 },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: BRAND.colors.amber,
    width: 24,
  },
  skipBtn: { width: 60, alignItems: "flex-end" },
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
