import React, { useEffect, useRef } from "react";
import { Animated, ViewStyle, StyleProp } from "react-native";

interface FadeInViewProps {
  /** Delay before the animation starts (ms). Default: 0 */
  delay?: number;
  /** Duration of the fade-in (ms). Default: 300 */
  duration?: number;
  /** Additional styles applied to the wrapper */
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/**
 * Reusable fade-in wrapper component.
 * Animates opacity from 0 to 1. Useful for stagger-fading card lists
 * by incrementing the `delay` prop per item index.
 *
 * Example:
 *   {items.map((item, i) => (
 *     <FadeInView key={item.id} delay={i * 80}>
 *       <Card {...item} />
 *     </FadeInView>
 *   ))}
 */
export function FadeInView({
  delay = 0,
  duration = 300,
  style,
  children,
}: FadeInViewProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, [opacity, duration, delay]);

  return (
    <Animated.View style={[{ opacity }, style]}>
      {children}
    </Animated.View>
  );
}
