/**
 * EmptyStateAnimation — branded empty state with floating stars and pulsing icon.
 *
 * Navy background, amber accents, Ionicons icon, optional CTA button.
 */

import React, { useEffect, useRef } from "react";
import {
  Animated,
  View,
  Text,
  Pressable,
  StyleSheet,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BRAND } from "@/constants/brand";

export interface EmptyStateAnimationProps {
  /** Message displayed beneath the icon */
  message: string;
  /** Ionicons icon name (default "search-outline") */
  icon?: keyof typeof Ionicons.glyphMap;
  /** CTA button label — if omitted, no button is rendered */
  actionLabel?: string;
  /** Callback when CTA is pressed */
  onAction?: () => void;
  /** Container style override */
  style?: ViewStyle;
}

export default function EmptyStateAnimation({
  message,
  icon = "search-outline",
  actionLabel,
  onAction,
  style,
}: EmptyStateAnimationProps) {
  const iconScale = useRef(new Animated.Value(1)).current;
  const star1Y = useRef(new Animated.Value(0)).current;
  const star2Y = useRef(new Animated.Value(0)).current;
  const star3Y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulsing icon
    const iconAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(iconScale, {
          toValue: 1.12,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(iconScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );

    // Floating stars (staggered)
    const makeFloat = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, {
            toValue: -10,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      );

    iconAnim.start();
    makeFloat(star1Y, 0).start();
    makeFloat(star2Y, 300).start();
    makeFloat(star3Y, 600).start();

    return () => {
      iconAnim.stop();
      star1Y.stopAnimation();
      star2Y.stopAnimation();
      star3Y.stopAnimation();
    };
  }, [iconScale, star1Y, star2Y, star3Y]);

  return (
    <View style={[styles.container, style]} testID="empty-state">
      {/* Floating stars */}
      <View style={styles.starsRow}>
        {[star1Y, star2Y, star3Y].map((y, i) => (
          <Animated.Text
            key={i}
            testID={`floating-star-${i}`}
            style={[styles.star, { transform: [{ translateY: y }] }]}
          >
            *
          </Animated.Text>
        ))}
      </View>

      {/* Pulsing icon */}
      <Animated.View
        style={{ transform: [{ scale: iconScale }] }}
        testID="pulsing-icon"
      >
        <Ionicons name={icon} size={64} color={BRAND.colors.amber} />
      </Animated.View>

      {/* Message */}
      <Text style={styles.message} testID="empty-state-message">
        {message}
      </Text>

      {/* Optional CTA */}
      {actionLabel && onAction && (
        <Pressable
          style={styles.button}
          onPress={onAction}
          testID="empty-state-action"
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: BRAND.colors.navy,
    borderRadius: 16,
  },
  starsRow: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 24,
  },
  star: {
    fontSize: 24,
    color: BRAND.colors.amberLight,
    fontWeight: "700",
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    fontFamily: "DMSans_400Regular",
    lineHeight: 22,
  },
  button: {
    marginTop: 20,
    backgroundColor: BRAND.colors.amber,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "DMSans_600SemiBold",
  },
});
