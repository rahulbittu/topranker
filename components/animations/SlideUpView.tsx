import React, { useEffect, useRef } from "react";
import { Animated, ViewStyle, StyleProp } from "react-native";

interface SlideUpViewProps {
  /** Delay before the animation starts (ms). Default: 0 */
  delay?: number;
  /** Duration of the animation (ms). Default: 300 */
  duration?: number;
  /** How far (px) the view slides up from. Default: 20 */
  distance?: number;
  /** Additional styles applied to the wrapper */
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/**
 * Reusable slide-up + fade-in wrapper component.
 * Combines translateY and opacity animations for a polished card entrance.
 *
 * Example:
 *   {items.map((item, i) => (
 *     <SlideUpView key={item.id} delay={i * 60} distance={24}>
 *       <Card {...item} />
 *     </SlideUpView>
 *   ))}
 */
export function SlideUpView({
  delay = 0,
  duration = 300,
  distance = 20,
  style,
  children,
}: SlideUpViewProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, duration, delay, distance]);

  return (
    <Animated.View
      style={[{ opacity, transform: [{ translateY }] }, style]}
    >
      {children}
    </Animated.View>
  );
}
