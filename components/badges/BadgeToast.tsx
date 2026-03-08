/**
 * Badge Notification Toast — Shows when a user earns a new badge
 * Owner: Jordan (CVO) + Suki (Design Lead)
 *
 * Animated slide-down toast with badge icon, name, and rarity.
 * Auto-dismisses after 4 seconds or on tap.
 */
import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, TouchableOpacity } from "react-native";
import { TypedIcon } from "@/components/TypedIcon";
import Colors from "@/constants/colors";
import { BRAND } from "@/constants/brand";
import { type Badge, RARITY_COLORS, RARITY_LABELS } from "@/lib/badges";

const AMBER = BRAND.colors.amber;
const TOAST_DURATION = 4000;

interface BadgeToastProps {
  badge: Badge;
  onDismiss: () => void;
}

export function BadgeToast({ badge, onDismiss }: BadgeToastProps) {
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rarity = RARITY_COLORS[badge.rarity];

  useEffect(() => {
    // Slide in
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        tension: 60,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss
    const timer = setTimeout(() => dismiss(), TOAST_DURATION);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss());
  }

  return (
    <Animated.View
      style={[
        s.container,
        {
          transform: [{ translateY }],
          opacity,
          borderColor: rarity.border,
        },
      ]}
    >
      <TouchableOpacity
        style={s.inner}
        onPress={dismiss}
        activeOpacity={0.8}
      >
        <View style={[s.iconCircle, { backgroundColor: rarity.bg, borderColor: rarity.border }]}>
          <TypedIcon name={badge.icon} size={20} color={badge.color} />
        </View>
        <View style={s.textContainer}>
          <Text style={s.title}>Badge Earned!</Text>
          <Text style={s.badgeName}>{badge.name}</Text>
          <Text style={[s.rarityLabel, { color: rarity.text }]}>
            {RARITY_LABELS[badge.rarity]}
          </Text>
        </View>
        <TypedIcon name="trophy" size={24} color={AMBER} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    zIndex: 9999,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    ...Colors.cardShadow,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: { flex: 1, gap: 1 },
  title: {
    fontSize: 10,
    fontWeight: "700",
    color: AMBER,
    fontFamily: "DMSans_700Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  badgeName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    fontFamily: "PlayfairDisplay_700Bold",
  },
  rarityLabel: {
    fontSize: 10,
    fontWeight: "600",
    fontFamily: "DMSans_600SemiBold",
  },
});
