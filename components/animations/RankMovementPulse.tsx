/**
 * RankMovementPulse — pulsing glow when a business moves up or down in rank.
 *
 * Green glow for rank-up (positive delta), red for rank-down (negative),
 * neutral subtle pulse for no change. Uses RN Animated API with loop.
 */

import React, { useEffect, useRef } from "react";
import { Animated, View, Text, StyleSheet, type ViewStyle } from "react-native";
import { BRAND } from "@/constants/brand";

export interface RankMovementPulseProps {
  /** Rank change: positive = moved up, negative = moved down, 0 = unchanged */
  delta: number;
  /** Diameter of the pulse circle (default 48) */
  size?: number;
  /** Container style override */
  style?: ViewStyle;
}

function getColorForDelta(delta: number): string {
  if (delta > 0) return BRAND.colors.green;
  if (delta < 0) return BRAND.colors.red;
  return BRAND.colors.lightGray;
}

function getLabelForDelta(delta: number): string {
  if (delta > 0) return `+${delta}`;
  if (delta < 0) return `${delta}`;
  return "—";
}

export default function RankMovementPulse({
  delta,
  size = 48,
  style,
}: RankMovementPulseProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.8)).current;
  const color = getColorForDelta(delta);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.25,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.8,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [scale, opacity]);

  return (
    <View
      style={[styles.container, { width: size, height: size }, style]}
      testID="rank-movement-pulse"
    >
      {/* Glow ring */}
      <Animated.View
        testID="pulse-glow"
        style={[
          styles.glow,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: color,
            transform: [{ scale }],
            opacity,
          },
        ]}
      />
      {/* Inner label */}
      <Text
        testID="pulse-label"
        style={[styles.label, { color, fontSize: size * 0.3 }]}
      >
        {getLabelForDelta(delta)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    borderWidth: 3,
  },
  label: {
    fontWeight: "700",
    fontFamily: "PlayfairDisplay_700Bold",
  },
});
