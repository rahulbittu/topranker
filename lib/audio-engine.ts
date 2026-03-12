/**
 * TopRanker Audio Engine
 *
 * Manages sound effects for key user interactions.
 * Checks for audio files at assets/sounds/ and falls back to
 * haptics-only when files are unavailable.
 *
 * Usage:
 *   import { playSound, setSoundEnabled } from "@/lib/audio-engine";
 *   await playSound("ratingSuccess");
 */

import { Audio } from "expo-av";
import { triggerHaptic } from "./haptic-patterns";
import type { HapticPatternName } from "./haptic-patterns";

// ─── State ───────────────────────────────────────────────────

let soundEnabled = true;
let audioConfigured = false;
const soundCache: Record<string, Audio.Sound> = {};

// ─── Sound Definitions ───────────────────────────────────────
// Each sound maps to an optional asset path and a haptic fallback.
// Since we cannot generate tones natively, we attempt to load real
// audio files and degrade to haptics when they are absent.

interface SoundDef {
  /** Relative path inside assets/sounds/ */
  file: string;
  /** Haptic pattern to fire as fallback (or alongside audio) */
  hapticFallback: HapticPatternName;
  /** Human-readable description for documentation */
  description: string;
}

const SOUND_DEFS: Record<SoundName, SoundDef> = {
  ratingSuccess: {
    file: "rating-success.mp3",
    hapticFallback: "ratingSubmit",
    description: "Ascending two-tone (C5 to E5) on successful rating",
  },
  rankUp: {
    file: "rank-up.mp3",
    hapticFallback: "scoreReveal",
    description: "Bright ascending arpeggio when rank improves",
  },
  tierUp: {
    file: "tier-up.mp3",
    hapticFallback: "tierPromotion",
    description: "Short 3-note ascending fanfare on tier promotion",
  },
  vote: {
    file: "vote.mp3",
    hapticFallback: "vote",
    description: "Soft click on vote cast",
  },
  error: {
    file: "error.mp3",
    hapticFallback: "error",
    description: "Descending tone on error",
  },
} as const;

export type SoundName = "ratingSuccess" | "rankUp" | "tierUp" | "vote" | "error";

/** All valid sound names */
export const SOUND_NAMES: SoundName[] = Object.keys(SOUND_DEFS) as SoundName[];

// ─── Asset map (lazy — require only works at bundle time) ────
// These require calls will fail gracefully if files don't exist yet.

function getAssetForSound(_name: SoundName): any | null {
  // Audio files are optional — when produced, add them to assets/sounds/
  // and wire up require() calls here. For now, return null to trigger
  // haptic fallback for every sound.
  //
  // Example when files exist:
  // switch (name) {
  //   case "ratingSuccess": return require("@/assets/sounds/rating-success.mp3");
  //   case "rankUp": return require("@/assets/sounds/rank-up.mp3");
  //   ...
  // }
  return null;
}

// ─── Audio Configuration ─────────────────────────────────────

async function ensureAudioConfigured(): Promise<void> {
  if (audioConfigured) return;
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: false,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
    audioConfigured = true;
  } catch (err) {
    console.log("[AudioEngine] Could not configure audio:", err);
  }
}

// ─── Public API ──────────────────────────────────────────────

/**
 * Play a named sound effect.
 * If the audio file is unavailable, fires the haptic fallback instead.
 */
export async function playSound(name: SoundName): Promise<void> {
  const def = SOUND_DEFS[name];
  if (!def) {
    if (__DEV__) console.warn(`[AudioEngine] Unknown sound: ${name}`);
    return;
  }

  // Always fire haptic alongside (or as fallback)
  const hapticPromise = triggerHaptic(def.hapticFallback);

  if (!soundEnabled) {
    await hapticPromise;
    return;
  }

  const asset = getAssetForSound(name);
  if (!asset) {
    // No audio file — haptic is the entire feedback
    await hapticPromise;
    return;
  }

  try {
    await ensureAudioConfigured();
    const cacheKey = name;

    if (soundCache[cacheKey]) {
      await soundCache[cacheKey].replayAsync();
    } else {
      const { sound } = await Audio.Sound.createAsync(asset, {
        shouldPlay: true,
        volume: 0.6,
      });
      soundCache[cacheKey] = sound;
    }
  } catch (err) {
    console.log(`[AudioEngine] Sound "${name}" not available:`, err);
  }

  await hapticPromise;
}

/** Enable or disable sound effects. Haptics still fire when sound is off. */
export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
}

/** Check whether sound effects are enabled. */
export function isSoundEnabled(): boolean {
  return soundEnabled;
}

/** Unload all cached sounds. Call on app background or unmount. */
export async function unloadAllSounds(): Promise<void> {
  for (const key of Object.keys(soundCache)) {
    try {
      await soundCache[key].unloadAsync();
    } catch (e) { if (__DEV__) console.warn("[AudioEngine] Unload failed:", e); }
    delete soundCache[key];
  }
}
