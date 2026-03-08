import React, { useEffect } from "react";
import { StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { BRAND } from "@/constants/brand";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const CONFETTI_COLORS = [
  BRAND.colors.amber,
  "#FFD700", // gold
  "#E8C547", // light gold
  BRAND.colors.navy,
  "#2E4A6B", // navy light
  "#FFFFFF",
  "#F7F6F3", // warm white
];

const PARTICLE_COUNT = 40;

interface Particle {
  x: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  rotation: number;
  drift: number;
}

function generateParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * SCREEN_W,
    delay: Math.random() * 600,
    duration: 1800 + Math.random() * 1200,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 4 + Math.random() * 8,
    rotation: Math.random() * 360,
    drift: (Math.random() - 0.5) * 80,
  }));
}

function ConfettiPiece({ particle }: { particle: Particle }) {
  const translateY = useSharedValue(-20);
  const opacity = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      particle.delay,
      withTiming(SCREEN_H + 50, {
        duration: particle.duration,
        easing: Easing.in(Easing.quad),
      })
    );
    opacity.value = withDelay(
      particle.delay + particle.duration * 0.7,
      withTiming(0, { duration: particle.duration * 0.3 })
    );
    rotate.value = withDelay(
      particle.delay,
      withTiming(particle.rotation + 720, {
        duration: particle.duration,
        easing: Easing.linear,
      })
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: particle.drift },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const isCircle = particle.size < 7;

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: particle.x,
          top: -20,
          width: particle.size,
          height: isCircle ? particle.size : particle.size * 0.6,
          backgroundColor: particle.color,
          borderRadius: isCircle ? particle.size / 2 : 1,
        },
        style,
      ]}
    />
  );
}

export function Confetti({ show }: { show: boolean }) {
  if (!show) return null;

  const particles = generateParticles();

  return (
    <Animated.View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => (
        <ConfettiPiece key={i} particle={p} />
      ))}
    </Animated.View>
  );
}
