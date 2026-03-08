import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

/**
 * TopRanker Audio & Haptic Branding System
 *
 * Sound design philosophy: warm, premium, minimal.
 * Every sound reinforces trust and achievement.
 *
 * Audio files will be stored in assets/audio/ when produced.
 * For now, we use haptic-only patterns as the audio foundation.
 */

// Sound cache to avoid reloading
const soundCache: Record<string, Audio.Sound> = {};

async function configureAudio() {
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: false, // Respect silent switch
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
  });
}

let audioConfigured = false;

async function ensureAudioConfigured() {
  if (!audioConfigured) {
    await configureAudio();
    audioConfigured = true;
  }
}

/**
 * Play a sound asset. Caches loaded sounds for reuse.
 * Gracefully no-ops if file not found (audio files are optional).
 */
async function playSound(asset: any): Promise<void> {
  try {
    await ensureAudioConfigured();
    const key = String(asset);

    if (soundCache[key]) {
      await soundCache[key].replayAsync();
      return;
    }

    const { sound } = await Audio.Sound.createAsync(asset, {
      shouldPlay: true,
      volume: 0.6,
    });

    soundCache[key] = sound;
  } catch (err) {
    // Audio is optional — haptics are the baseline
    console.log("[Audio] Sound not available:", err);
  }
}

/**
 * Unload all cached sounds. Call on app background/unmount.
 */
export async function unloadAllSounds(): Promise<void> {
  for (const key of Object.keys(soundCache)) {
    try {
      await soundCache[key].unloadAsync();
    } catch {}
    delete soundCache[key];
  }
}

// ─── Haptic Patterns ─────────────────────────────────────────

/**
 * Splash screen crown drop — single heavy impact.
 */
export function hapticSplashCrown(): void {
  if (Platform.OS === "web") return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

/**
 * Splash screen logo reveal — soft medium impact.
 */
export function hapticSplashLogo(): void {
  if (Platform.OS === "web") return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

/**
 * Tab switch — light selection tap.
 */
export function hapticTabSwitch(): void {
  if (Platform.OS === "web") return;
  Haptics.selectionAsync();
}

/**
 * Rating submitted — success notification with triple pulse.
 */
export async function hapticRatingSuccess(): Promise<void> {
  if (Platform.OS === "web") return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  await delay(100);
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  await delay(80);
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/**
 * Tier upgrade — ascending double pulse (medium then heavy).
 */
export async function hapticTierUpgrade(): Promise<void> {
  if (Platform.OS === "web") return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  await delay(120);
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

/**
 * Challenger winner reveal — dramatic sequence.
 */
export async function hapticWinnerReveal(): Promise<void> {
  if (Platform.OS === "web") return;
  // Drum roll: 3 light taps
  for (let i = 0; i < 3; i++) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await delay(100);
  }
  // Pause for anticipation
  await delay(200);
  // Winner hit
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

/**
 * Confetti celebration — rapid sparkle pattern.
 */
export async function hapticConfetti(): Promise<void> {
  if (Platform.OS === "web") return;
  for (let i = 0; i < 4; i++) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await delay(60);
  }
}

/**
 * Button press — standard selection feedback.
 */
export function hapticPress(): void {
  if (Platform.OS === "web") return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/**
 * Error / denied — warning vibration.
 */
export function hapticError(): void {
  if (Platform.OS === "web") return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

/**
 * Star rating slide — selection tick per star.
 */
export function hapticStarTick(): void {
  if (Platform.OS === "web") return;
  Haptics.selectionAsync();
}

/**
 * Pull to refresh — soft pull feedback.
 */
export function hapticPullRefresh(): void {
  if (Platform.OS === "web") return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

// ─── Helpers ─────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Audio Assets (placeholder — replace with real files) ───

// When audio files are produced, uncomment and add them:
// const SOUNDS = {
//   splashChime: require("@/assets/audio/splash-chime.mp3"),
//   ratingSuccess: require("@/assets/audio/rating-success.mp3"),
//   tierUpgrade: require("@/assets/audio/tier-upgrade.mp3"),
//   winnerReveal: require("@/assets/audio/winner-reveal.mp3"),
//   confetti: require("@/assets/audio/confetti-pop.mp3"),
// };

// Export combined audio+haptic triggers (once audio files exist):
// export async function playSplashChime() { hapticSplashCrown(); await playSound(SOUNDS.splashChime); }
// export async function playRatingSuccess() { await hapticRatingSuccess(); await playSound(SOUNDS.ratingSuccess); }
// export async function playTierUpgrade() { await hapticTierUpgrade(); await playSound(SOUNDS.tierUpgrade); }
// export async function playWinnerReveal() { await hapticWinnerReveal(); await playSound(SOUNDS.winnerReveal); }
// export async function playConfetti() { await hapticConfetti(); await playSound(SOUNDS.confetti); }
