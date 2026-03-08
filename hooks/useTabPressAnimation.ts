import { useRef, useCallback } from "react";
import { Animated, ViewStyle } from "react-native";

/**
 * Hook that adds a scale bounce micro-interaction when a tab is pressed.
 * The bounce sequence: 1 → 0.92 → 1.05 → 1 over ~200ms total.
 *
 * Usage:
 *   const { scaleStyle, onTabPress } = useTabPressAnimation();
 *   <Animated.View style={[styles.icon, scaleStyle]}>...</Animated.View>
 *   <Pressable onPress={onTabPress}>...</Pressable>
 */
export function useTabPressAnimation() {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onTabPress = useCallback(() => {
    Animated.sequence([
      // Squish down
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 60,
        useNativeDriver: true,
      }),
      // Overshoot up
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 80,
        useNativeDriver: true,
      }),
      // Settle back
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim]);

  const scaleStyle: Animated.WithAnimatedObject<ViewStyle> = {
    transform: [{ scale: scaleAnim }],
  };

  return { scaleStyle, onTabPress };
}
