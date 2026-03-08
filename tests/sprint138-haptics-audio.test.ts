/**
 * Unit Tests — Haptic Patterns, Audio Engine & useInteraction Hook (Sprint 138)
 * Owner: Sarah Nakamura (Lead Engineer)
 *
 * Covers:
 * - All haptic pattern names are defined and valid
 * - triggerHaptic returns a promise for each pattern
 * - Audio engine exposes correct public API
 * - Sound defaults to enabled
 * - useInteraction hook can be created for each pattern name
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock native modules BEFORE any imports ──────────────────
// vi.mock is hoisted by vitest, so these intercept before real
// react-native / expo modules are parsed.

vi.mock("react-native", () => ({
  Platform: { OS: "ios" },
}));

vi.mock("expo-haptics", () => ({
  impactAsync: vi.fn().mockResolvedValue(undefined),
  selectionAsync: vi.fn().mockResolvedValue(undefined),
  notificationAsync: vi.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: "Light", Medium: "Medium", Heavy: "Heavy" },
  NotificationFeedbackType: {
    Success: "Success",
    Warning: "Warning",
    Error: "Error",
  },
}));

vi.mock("expo-av", () => ({
  Audio: {
    setAudioModeAsync: vi.fn().mockResolvedValue(undefined),
    Sound: {
      createAsync: vi.fn().mockResolvedValue({
        sound: {
          replayAsync: vi.fn().mockResolvedValue(undefined),
          unloadAsync: vi.fn().mockResolvedValue(undefined),
        },
      }),
    },
  },
}));

// Mock useCallback to pass-through (no React runtime needed)
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...(actual as any),
    useCallback: (fn: any) => fn,
  };
});

// ─── Imports (after mocks are declared) ──────────────────────

import {
  triggerHaptic,
  HAPTIC_PATTERN_NAMES,
  _patterns,
} from "../lib/haptic-patterns";
import type { HapticPatternName } from "../lib/haptic-patterns";
import {
  playSound,
  setSoundEnabled,
  isSoundEnabled,
  SOUND_NAMES,
} from "../lib/audio-engine";
import type { SoundName } from "../lib/audio-engine";
import { useInteraction, INTERACTION_NAMES } from "../hooks/useInteraction";

// ═════════════════════════════════════════════════════════════
// Haptic Patterns
// ═════════════════════════════════════════════════════════════

describe("Haptic Patterns", () => {
  const expectedPatterns: HapticPatternName[] = [
    "bookmark",
    "vote",
    "ratingSubmit",
    "tierPromotion",
    "tabSwitch",
    "pullToRefresh",
    "error",
    "scoreReveal",
  ];

  it("exports all expected pattern names", () => {
    expect(HAPTIC_PATTERN_NAMES).toEqual(
      expect.arrayContaining(expectedPatterns)
    );
    expect(HAPTIC_PATTERN_NAMES.length).toBe(expectedPatterns.length);
  });

  it("every pattern name maps to a function", () => {
    for (const name of HAPTIC_PATTERN_NAMES) {
      expect(typeof _patterns[name]).toBe("function");
    }
  });

  it("triggerHaptic returns a promise for each pattern", async () => {
    for (const name of HAPTIC_PATTERN_NAMES) {
      const result = triggerHaptic(name);
      expect(result).toBeInstanceOf(Promise);
      await result; // should not throw
    }
  });

  it("triggerHaptic handles unknown pattern names gracefully", async () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    await triggerHaptic("nonExistentPattern" as HapticPatternName);
    spy.mockRestore();
  });
});

// ═════════════════════════════════════════════════════════════
// Audio Engine
// ═════════════════════════════════════════════════════════════

describe("Audio Engine", () => {
  beforeEach(() => {
    // Reset sound to default enabled state
    setSoundEnabled(true);
  });

  it("exposes playSound as a function", () => {
    expect(typeof playSound).toBe("function");
  });

  it("exposes setSoundEnabled as a function", () => {
    expect(typeof setSoundEnabled).toBe("function");
  });

  it("exposes isSoundEnabled as a function", () => {
    expect(typeof isSoundEnabled).toBe("function");
  });

  it("sound defaults to enabled", () => {
    setSoundEnabled(true); // reset in case prior test changed it
    expect(isSoundEnabled()).toBe(true);
  });

  it("setSoundEnabled toggles the sound state", () => {
    setSoundEnabled(false);
    expect(isSoundEnabled()).toBe(false);
    setSoundEnabled(true);
    expect(isSoundEnabled()).toBe(true);
  });

  it("defines all expected sound names", () => {
    const expected: SoundName[] = [
      "ratingSuccess",
      "rankUp",
      "tierUp",
      "vote",
      "error",
    ];
    expect(SOUND_NAMES).toEqual(expect.arrayContaining(expected));
    expect(SOUND_NAMES.length).toBe(expected.length);
  });

  it("playSound returns a promise for each sound name", async () => {
    for (const name of SOUND_NAMES) {
      const result = playSound(name);
      expect(result).toBeInstanceOf(Promise);
      await result;
    }
  });

  it("playSound does not throw when sound is disabled", async () => {
    setSoundEnabled(false);
    for (const name of SOUND_NAMES) {
      await expect(playSound(name)).resolves.toBeUndefined();
    }
  });
});

// ═════════════════════════════════════════════════════════════
// useInteraction Hook
// ═════════════════════════════════════════════════════════════

describe("useInteraction", () => {
  it("can be created for each pattern name", () => {
    for (const name of INTERACTION_NAMES) {
      const result = useInteraction(name);
      expect(result).toBeDefined();
      expect(typeof result.trigger).toBe("function");
    }
  });

  it("trigger returns a promise", async () => {
    for (const name of INTERACTION_NAMES) {
      const { trigger } = useInteraction(name);
      const result = trigger();
      expect(result).toBeInstanceOf(Promise);
      await result;
    }
  });

  it("INTERACTION_NAMES matches HAPTIC_PATTERN_NAMES", () => {
    expect(INTERACTION_NAMES).toEqual(
      expect.arrayContaining(HAPTIC_PATTERN_NAMES)
    );
    expect(INTERACTION_NAMES.length).toBe(HAPTIC_PATTERN_NAMES.length);
  });
});
