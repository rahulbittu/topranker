/**
 * Sprint 416: Animated highlight for #1 ranked card.
 * Subtle golden shimmer border that pulses to draw attention to the top position.
 */
import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet, type ViewStyle, type StyleProp } from "react-native";
import { BRAND } from "@/constants/brand";

const AMBER = BRAND.colors.amber;

export interface TopRankHighlightProps {
  /** Whether to show the highlight animation */
  active: boolean;
  /** Container style override */
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export function TopRankHighlight({ active, style, children }: TopRankHighlightProps) {
  const borderOpacity = useRef(new Animated.Value(active ? 0.3 : 0)).current;
  const glowScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!active) return;

    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(borderOpacity, {
          toValue: 0.8,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(borderOpacity, {
          toValue: 0.3,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    );

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glowScale, {
          toValue: 1.01,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(glowScale, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    );

    shimmer.start();
    pulse.start();

    return () => {
      shimmer.stop();
      pulse.stop();
    };
  }, [active, borderOpacity, glowScale]);

  if (!active) return <View style={style}>{children}</View>;

  return (
    <Animated.View
      style={[
        s.container,
        { transform: [{ scale: glowScale }] },
        style,
      ]}
      accessibilityLabel="Top ranked — number 1 position"
    >
      <Animated.View
        style={[
          s.glowBorder,
          { opacity: borderOpacity },
        ]}
      />
      {children}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: {
    position: "relative",
  },
  glowBorder: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: AMBER,
    zIndex: -1,
  },
});
