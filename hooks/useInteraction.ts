/**
 * useInteraction — Combined haptic + audio feedback hook
 *
 * Provides a single `trigger()` call that fires both the haptic pattern
 * and audio sound for a given interaction name. Respects the user's
 * sound preference via the audio engine.
 *
 * Usage:
 *   const { trigger } = useInteraction("bookmark");
 *   <Pressable onPress={() => { trigger(); doBookmark(); }}>
 */

import { useCallback } from "react";
import { triggerHaptic } from "@/lib/haptic-patterns";
import type { HapticPatternName } from "@/lib/haptic-patterns";
import { playSound, isSoundEnabled } from "@/lib/audio-engine";
import type { SoundName } from "@/lib/audio-engine";

// ─── Mapping from interaction name to audio sound ────────────
// Not every haptic pattern has an audio counterpart. This map
// links pattern names to their sound equivalent when one exists.

const PATTERN_TO_SOUND: Partial<Record<HapticPatternName, SoundName>> = {
  bookmark: undefined, // no sound, haptic only
  vote: "vote",
  ratingSubmit: "ratingSuccess",
  tierPromotion: "tierUp",
  tabSwitch: undefined, // haptic only
  pullToRefresh: undefined, // haptic only
  error: "error",
  scoreReveal: "rankUp",
};

export type InteractionName = HapticPatternName;

/** All valid interaction names (same as haptic pattern names) */
export const INTERACTION_NAMES: InteractionName[] = [
  "bookmark",
  "vote",
  "ratingSubmit",
  "tierPromotion",
  "tabSwitch",
  "pullToRefresh",
  "error",
  "scoreReveal",
];

/**
 * Hook that returns a trigger function combining haptic + audio feedback.
 *
 * @param name - The interaction/pattern name
 * @returns Object with `trigger` async function
 */
export function useInteraction(name: InteractionName) {
  const trigger = useCallback(async () => {
    // Fire haptic unconditionally
    const hapticPromise = triggerHaptic(name);

    // Fire audio if a sound mapping exists
    const soundName = PATTERN_TO_SOUND[name];
    if (soundName && isSoundEnabled()) {
      // playSound already fires haptic internally, but we want
      // the explicit pattern haptic to be the primary one.
      // Audio engine will handle graceful fallback.
      try {
        await playSound(soundName);
      } catch {
        // Audio is best-effort
      }
    }

    await hapticPromise;
  }, [name]);

  return { trigger };
}
