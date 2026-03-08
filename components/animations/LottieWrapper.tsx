/**
 * LottieWrapper — graceful degradation wrapper for Lottie animations.
 *
 * Attempts to use lottie-react-native if installed; otherwise renders a
 * simple pulsing placeholder so the app never crashes from a missing dep.
 */

import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet, type ViewStyle } from "react-native";
import { BRAND } from "@/constants/brand";

/* ---------- types ---------- */

export interface LottieWrapperProps {
  /** Lottie JSON source — either require('...') or a JSON object */
  source: unknown;
  /** Start playing immediately (default true) */
  autoPlay?: boolean;
  /** Loop the animation (default true) */
  loop?: boolean;
  /** Playback speed multiplier (default 1) */
  speed?: number;
  /** Container style override */
  style?: ViewStyle;
}

/* ---------- optional import ---------- */

let LottieView: React.ComponentType<any> | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require("lottie-react-native");
  LottieView = mod?.default ?? mod;
} catch {
  // lottie-react-native is not installed — will use fallback
}

/* ---------- fallback ---------- */

function FallbackAnimation({ style }: { style?: ViewStyle }) {
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  return (
    <View style={[styles.fallbackContainer, style]}>
      <Animated.View
        style={[styles.fallbackDot, { opacity: pulse }]}
        testID="lottie-fallback"
      />
    </View>
  );
}

/* ---------- component ---------- */

export default function LottieWrapper({
  source,
  autoPlay = true,
  loop = true,
  speed = 1,
  style,
}: LottieWrapperProps) {
  if (LottieView) {
    return (
      <LottieView
        source={source}
        autoPlay={autoPlay}
        loop={loop}
        speed={speed}
        style={style}
        testID="lottie-native"
      />
    );
  }

  return <FallbackAnimation style={style} />;
}

/* ---------- util ---------- */

/** Returns true when lottie-react-native is available at runtime */
export function isLottieAvailable(): boolean {
  return LottieView !== null;
}

/* ---------- styles ---------- */

const styles = StyleSheet.create({
  fallbackContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 120,
    height: 120,
  },
  fallbackDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BRAND.colors.amber,
  },
});
