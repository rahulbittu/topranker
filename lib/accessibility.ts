import { AccessibilityInfo, Platform } from "react-native";
import { useEffect, useState } from "react";

/**
 * TopRanker Accessibility Utilities
 *
 * Ensures the app is usable by everyone:
 * - Screen reader users (VoiceOver/TalkBack)
 * - Reduced motion preference
 * - High contrast needs
 * - Dynamic type (large text)
 */

/**
 * Hook to detect if the user prefers reduced motion.
 * When true, disable animations (springs, confetti, staggered reveals).
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced);

    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduced,
    );

    return () => subscription.remove();
  }, []);

  return reduced;
}

/**
 * Hook to detect if a screen reader is active.
 * When true, add extra accessibility labels and hide decorative elements.
 */
export function useScreenReader(): boolean {
  const [active, setActive] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then(setActive);

    const subscription = AccessibilityInfo.addEventListener(
      "screenReaderChanged",
      setActive,
    );

    return () => subscription.remove();
  }, []);

  return active;
}

/**
 * Announce a message to screen reader users.
 * Use for dynamic content changes that aren't automatically announced.
 */
export function announceForAccessibility(message: string): void {
  AccessibilityInfo.announceForAccessibility(message);
}

/**
 * Generate an accessibility label for a business card.
 */
export function businessCardA11yLabel(
  name: string,
  rank: number,
  score: number,
  category: string,
): string {
  return `${name}, ranked number ${rank}, score ${score.toFixed(1)} out of 5, category ${category}`;
}

/**
 * Generate an accessibility label for a rating score.
 */
export function scoreA11yLabel(score: number, maxScore: number = 5): string {
  return `${score.toFixed(1)} out of ${maxScore}`;
}

/**
 * Generate an accessibility label for a credibility tier.
 */
export function tierA11yLabel(tier: string, weight: number): string {
  const tierNames: Record<string, string> = {
    community: "Community",
    city: "City",
    trusted: "Trusted",
    top: "Top Ranker",
  };
  const name = tierNames[tier] || tier;
  return `${name} tier, ${(weight * 100).toFixed(0)} percent vote weight`;
}

/**
 * Generate an accessibility label for a challenger card.
 */
export function challengerA11yLabel(
  defender: string,
  challenger: string,
  defenderVotes: number,
  challengerVotes: number,
  daysLeft: number,
  ended: boolean,
): string {
  if (ended) {
    const winner = defenderVotes >= challengerVotes ? defender : challenger;
    return `Challenge ended. ${winner} wins. ${defender} had ${defenderVotes.toFixed(1)} votes, ${challenger} had ${challengerVotes.toFixed(1)} votes.`;
  }
  return `${defender} versus ${challenger}. ${defender} has ${defenderVotes.toFixed(1)} weighted votes, ${challenger} has ${challengerVotes.toFixed(1)}. ${daysLeft} days remaining.`;
}

/**
 * Minimum touch target size for accessibility (Apple HIG: 44pt, WCAG: 44px).
 */
export const MIN_TOUCH_TARGET = 44;

/**
 * Check if a touch target meets minimum size requirements.
 */
export function isTouchTargetAccessible(width: number, height: number): boolean {
  return width >= MIN_TOUCH_TARGET && height >= MIN_TOUCH_TARGET;
}
