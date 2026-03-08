/**
 * ScoreCountUp — animated number that counts from 0 to a target value.
 *
 * Uses the built-in React Native Animated API (no reanimated dependency).
 * Brand-aligned: Playfair Display bold, amber highlight for high scores.
 */

import React, { useEffect, useRef, useState } from "react";
import { Animated, Text, StyleSheet, type TextStyle } from "react-native";
import { BRAND } from "@/constants/brand";

export interface ScoreCountUpProps {
  /** Final value to count up to */
  targetValue: number;
  /** Animation duration in ms (default 800) */
  duration?: number;
  /** Number of decimal places to display (default 1) */
  decimalPlaces?: number;
  /** Override text style */
  style?: TextStyle;
  /** Threshold above which amber color is applied (default 7.0) */
  highlightThreshold?: number;
}

export default function ScoreCountUp({
  targetValue,
  duration = 800,
  decimalPlaces = 1,
  style,
  highlightThreshold = 7.0,
}: ScoreCountUpProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    // Reset before starting
    animatedValue.setValue(0);

    const listener = animatedValue.addListener(({ value }) => {
      setDisplayValue(value.toFixed(decimalPlaces));
    });

    Animated.timing(animatedValue, {
      toValue: targetValue,
      duration,
      useNativeDriver: false, // text value changes require JS driver
    }).start();

    return () => {
      animatedValue.removeListener(listener);
      animatedValue.stopAnimation();
    };
  }, [targetValue, duration, decimalPlaces, animatedValue]);

  const isHighScore = targetValue >= highlightThreshold;

  return (
    <Text
      testID="score-countup"
      style={[
        styles.score,
        isHighScore && styles.highScore,
        style,
      ]}
    >
      {displayValue}
    </Text>
  );
}

const styles = StyleSheet.create({
  score: {
    fontSize: 32,
    fontWeight: "700",
    fontFamily: "PlayfairDisplay_700Bold",
    color: BRAND.colors.ink,
  },
  highScore: {
    color: BRAND.colors.amber,
  },
});
