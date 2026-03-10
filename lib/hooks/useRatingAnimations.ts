/**
 * Sprint 346: Extracted from app/rate/[id].tsx
 * Handles dimension highlight animations, dimension timing, and confirmation animations.
 */
import { useEffect, useRef } from "react";
import {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
  withDelay, Easing, interpolateColor,
} from "react-native-reanimated";
import { pct } from "@/lib/style-helpers";
import {
  TIER_SCORE_RANGES, getCredibilityTier, type CredibilityTier,
} from "@/lib/data";

interface DimensionHighlightInput {
  focusedDimension: number;
  q1Score: number;
  q2Score: number;
  q3Score: number;
  wouldReturn: boolean | null;
}

/**
 * Animated highlight styles for the 4 rating dimensions.
 * Returns 4 animated style objects that fade in/out based on focus.
 */
export function useDimensionHighlight({ focusedDimension, q1Score, q2Score, q3Score, wouldReturn }: DimensionHighlightInput) {
  const dim0 = useSharedValue(0);
  const dim1 = useSharedValue(0);
  const dim2 = useSharedValue(0);
  const dim3 = useSharedValue(0);
  const highlights = [dim0, dim1, dim2, dim3];

  useEffect(() => {
    const timing = { duration: 300, easing: Easing.out(Easing.cubic) };
    highlights.forEach((h, i) => {
      const shouldHighlight = focusedDimension === i && [q1Score, q2Score, q3Score, wouldReturn === null ? 0 : 1][i] === 0;
      h.value = withTiming(shouldHighlight ? 1 : 0, timing);
    });
  }, [focusedDimension, q1Score, q2Score, q3Score, wouldReturn]);

  const makeStyle = (h: typeof dim0) =>
    useAnimatedStyle(() => ({
      backgroundColor: interpolateColor(h.value, [0, 1], ["transparent", "rgba(196,154,26,0.06)"]),
      borderColor: interpolateColor(h.value, [0, 1], ["transparent", "rgba(196,154,26,0.15)"]),
      borderWidth: 1,
      borderRadius: 12,
      padding: h.value > 0 ? 8 : 0,
      marginHorizontal: h.value > 0 ? -8 : 0,
    }));

  return [makeStyle(dim0), makeStyle(dim1), makeStyle(dim2), makeStyle(dim3)] as const;
}

/**
 * Per-dimension timing tracker using refs (no re-renders).
 * Accumulates ms on each dimension as focusedDimension changes.
 */
export function useDimensionTiming(focusedDimension: number) {
  const timingRef = useRef<number[]>([0, 0, 0, 0]);
  const startRef = useRef<number>(0);

  useEffect(() => {
    const now = Date.now();
    if (startRef.current > 0 && focusedDimension > 0) {
      const prevDim = focusedDimension - 1;
      if (prevDim >= 0 && prevDim < 4) {
        timingRef.current[prevDim] += now - startRef.current;
      }
    }
    startRef.current = now;
  }, [focusedDimension]);

  return timingRef;
}

/**
 * Confirmation screen animations: icon scale, rank slide, tier bar progress.
 */
export function useConfirmationAnimations(showConfirm: boolean, userCredibilityScore?: number) {
  const confirmScale = useSharedValue(0);
  const rankSlide = useSharedValue(0);
  const tierProgress = useSharedValue(0);

  useEffect(() => {
    if (showConfirm) {
      confirmScale.value = withSpring(1, { damping: 12, stiffness: 120 });
      rankSlide.value = withDelay(300, withSpring(0, { damping: 14 }));
      const userScore = userCredibilityScore || 10;
      const currentTier = getCredibilityTier(userScore);
      const range = TIER_SCORE_RANGES[currentTier];
      const progress = Math.min(100, ((userScore - range.min) / (range.max - range.min)) * 100);
      tierProgress.value = withDelay(500, withTiming(progress, { duration: 800, easing: Easing.out(Easing.cubic) }));
    } else {
      confirmScale.value = 0;
      rankSlide.value = 30;
      tierProgress.value = 0;
    }
  }, [showConfirm]);

  const confirmIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: confirmScale.value }],
    opacity: confirmScale.value,
  }));
  const rankStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: rankSlide.value }],
    opacity: rankSlide.value === 30 ? 0 : 1,
  }));
  const tierBarStyle = useAnimatedStyle(() => ({
    width: pct(tierProgress.value),
  }));

  return { confirmIconStyle, rankStyle, tierBarStyle };
}
