/**
 * Sprint 517: Weekly Digest Copy Variants
 *
 * Pre-defined copy strategies for the weekly digest A/B test.
 * Each strategy targets a different psychological lever:
 * - control: neutral informational
 * - urgency: time-sensitive FOMO
 * - curiosity: question-driven engagement
 * - social: community activity emphasis
 *
 * Admin seeds the experiment via POST /api/admin/digest-copy-test
 * which creates a push experiment with these variants.
 */

import { createPushExperiment, getPushExperiment, deactivatePushExperiment } from "./push-ab-testing";
import type { PushNotificationVariant } from "./push-ab-testing";
import { log } from "./logger";

const digestLog = log.tag("DigestCopy");

export const DIGEST_EXPERIMENT_ID = "weekly-digest-copy-v1";

export const digestCopyVariants: PushNotificationVariant[] = [
  {
    name: "control",
    title: "Your weekly rankings update",
    body: "Hey {firstName}, check what's changed in your city's rankings this week.",
  },
  {
    name: "urgency",
    title: "Rankings just shifted — see who moved",
    body: "{firstName}, this week's rankings are in. Some favorites dropped. See the new order before everyone else.",
  },
  {
    name: "curiosity",
    title: "Did your top pick hold its spot?",
    body: "{firstName}, rankings moved this week. Tap to see if your favorite is still #1.",
  },
  {
    name: "social",
    title: "Your city is rating — join the conversation",
    body: "{firstName}, new ratings are shaping your city's leaderboard. See what the community thinks.",
  },
];

/**
 * Seed the weekly digest copy test experiment.
 * Returns the experiment if created, null if already active.
 */
export function seedDigestCopyTest(): { created: boolean; experimentId: string } {
  const existing = getPushExperiment(DIGEST_EXPERIMENT_ID);
  if (existing && existing.active) {
    digestLog.info("Digest copy test already active");
    return { created: false, experimentId: DIGEST_EXPERIMENT_ID };
  }

  // Deactivate old one if it exists but is inactive
  if (existing) {
    deactivatePushExperiment(DIGEST_EXPERIMENT_ID);
  }

  const experiment = createPushExperiment(
    DIGEST_EXPERIMENT_ID,
    "Weekly digest copy test: control vs urgency vs curiosity vs social",
    "weeklyDigest",
    digestCopyVariants,
  );

  if (experiment) {
    digestLog.info("Digest copy test seeded with 4 variants");
    return { created: true, experimentId: DIGEST_EXPERIMENT_ID };
  }

  digestLog.error("Failed to seed digest copy test");
  return { created: false, experimentId: DIGEST_EXPERIMENT_ID };
}

/**
 * Stop the digest copy test.
 */
export function stopDigestCopyTest(): boolean {
  return deactivatePushExperiment(DIGEST_EXPERIMENT_ID);
}

/**
 * Get the current digest copy test status.
 */
export function getDigestCopyTestStatus(): {
  active: boolean;
  experimentId: string;
  variantCount: number;
} {
  const exp = getPushExperiment(DIGEST_EXPERIMENT_ID);
  return {
    active: exp?.active ?? false,
    experimentId: DIGEST_EXPERIMENT_ID,
    variantCount: exp?.variants.length ?? 0,
  };
}
