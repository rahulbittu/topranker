import { useRef, useCallback } from "react";
import { Animated } from "react-native";

export function usePressAnimation() {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = useCallback(() => {
    Animated.timing(scale, { toValue: 0.975, duration: 120, useNativeDriver: true }).start();
  }, [scale]);
  const onPressOut = useCallback(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 2 }).start();
  }, [scale]);
  return { scale, onPressIn, onPressOut };
}
