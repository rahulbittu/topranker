/**
 * TopRanker Haptic Patterns System
 *
 * Named haptic patterns for specific user actions.
 * Each pattern is an async function composing expo-haptics primitives
 * into distinct tactile signatures.
 *
 * Usage:
 *   import { triggerHaptic } from "@/lib/haptic-patterns";
 *   await triggerHaptic("bookmark");
 */

import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

// ─── Helpers ─────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isWeb(): boolean {
  return Platform.OS === "web";
}

// ─── Pattern Definitions ─────────────────────────────────────

const patterns = {
  /** Bookmark toggle — crisp light tap */
  bookmark: async (): Promise<void> => {
    if (isWeb()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  /** Cast a vote — satisfying medium impact */
  vote: async (): Promise<void> => {
    if (isWeb()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  /** Rating submitted — success notification */
  ratingSubmit: async (): Promise<void> => {
    if (isWeb()) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  /** Tier promotion — double tap celebration (heavy + medium) */
  tierPromotion: async (): Promise<void> => {
    if (isWeb()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await delay(100);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  /** Tab switch — subtle selection feedback */
  tabSwitch: async (): Promise<void> => {
    if (isWeb()) return;
    await Haptics.selectionAsync();
  },

  /** Pull to refresh — light acknowledgement */
  pullToRefresh: async (): Promise<void> => {
    if (isWeb()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  /** Error — error notification (falls back to heavy impact) */
  error: async (): Promise<void> => {
    if (isWeb()) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  },

  /** Score reveal — drum-roll build-up: light-light-medium */
  scoreReveal: async (): Promise<void> => {
    if (isWeb()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await delay(50);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await delay(50);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },
} as const;

// ─── Public API ──────────────────────────────────────────────

export type HapticPatternName = keyof typeof patterns;

/** All valid pattern names */
export const HAPTIC_PATTERN_NAMES: HapticPatternName[] = Object.keys(
  patterns
) as HapticPatternName[];

/**
 * Trigger a named haptic pattern.
 * No-ops gracefully on web or if the pattern name is unrecognized.
 */
export async function triggerHaptic(name: HapticPatternName): Promise<void> {
  const fn = patterns[name];
  if (!fn) {
    if (__DEV__) console.warn(`[Haptics] Unknown pattern: ${name}`);
    return;
  }
  try {
    await fn();
  } catch (err) {
    // Haptics are non-critical — never crash the app
    if (__DEV__) console.log(`[Haptics] Pattern "${name}" failed:`, err);
  }
}

export { patterns as _patterns };
