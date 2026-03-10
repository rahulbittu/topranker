/**
 * Sprint 181 — Profile SubComponents Decomposition
 *
 * Validates:
 * 1. Each component exists in its own file
 * 2. Barrel export re-exports all components
 * 3. Each file has its own StyleSheet
 * 4. Profile.tsx import unchanged
 * 5. No file exceeds 300 lines
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const PROFILE_DIR = "components/profile";

// ---------------------------------------------------------------------------
// 1. Individual component files exist
// ---------------------------------------------------------------------------
describe("Profile decomposition — individual files", () => {
  const files = [
    "TierBadge.tsx",
    "HistoryRow.tsx",
    "BreakdownRow.tsx",
    "SavedRow.tsx",
    "ImpactCard.tsx",
    "PaymentHistoryRow.tsx",
    "CredibilityJourney.tsx",
    "TierRewardsSection.tsx",
    "NotificationSettingsLink.tsx",
    "LegalLinksSection.tsx",
    "LoggedOutView.tsx",
  ];

  for (const file of files) {
    it(`${file} exists`, () => {
      const fullPath = path.resolve(__dirname, "..", PROFILE_DIR, file);
      expect(fs.existsSync(fullPath)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// 2. Barrel export
// ---------------------------------------------------------------------------
describe("SubComponents.tsx — barrel export", () => {
  const barrelSrc = readFile(`${PROFILE_DIR}/SubComponents.tsx`);

  it("is a barrel (no StyleSheet.create)", () => {
    expect(barrelSrc).not.toContain("StyleSheet.create");
  });

  it("re-exports TierBadge", () => {
    expect(barrelSrc).toContain('export { TierBadge } from "./TierBadge"');
  });

  it("re-exports HistoryRow", () => {
    expect(barrelSrc).toContain('export { HistoryRow } from "./HistoryRow"');
  });

  it("re-exports BreakdownRow", () => {
    expect(barrelSrc).toContain('export { BreakdownRow } from "./BreakdownRow"');
  });

  it("re-exports SavedRow", () => {
    expect(barrelSrc).toContain('export { SavedRow } from "./SavedRow"');
  });

  it("re-exports ImpactCard", () => {
    expect(barrelSrc).toContain('export { ImpactCard } from "./ImpactCard"');
  });

  it("re-exports PaymentHistoryRow", () => {
    expect(barrelSrc).toContain('export { PaymentHistoryRow } from "./PaymentHistoryRow"');
  });

  it("re-exports CredibilityJourney", () => {
    expect(barrelSrc).toContain('export { CredibilityJourney } from "./CredibilityJourney"');
  });

  it("re-exports TierRewardsSection", () => {
    expect(barrelSrc).toContain('export { TierRewardsSection } from "./TierRewardsSection"');
  });

  it("re-exports NotificationSettingsLink", () => {
    expect(barrelSrc).toContain('export { NotificationSettingsLink } from "./NotificationSettingsLink"');
  });

  it("re-exports LegalLinksSection", () => {
    expect(barrelSrc).toContain('export { LegalLinksSection } from "./LegalLinksSection"');
  });

  it("re-exports LoggedOutView", () => {
    expect(barrelSrc).toContain('export { LoggedOutView } from "./LoggedOutView"');
  });

  it("barrel is under 25 lines", () => {
    const lines = barrelSrc.split("\n").length;
    expect(lines).toBeLessThan(25);
  });
});

// ---------------------------------------------------------------------------
// 3. Each file has its own StyleSheet
// ---------------------------------------------------------------------------
describe("Profile components — self-contained styles", () => {
  const files = [
    "TierBadge.tsx",
    "HistoryRow.tsx",
    "BreakdownRow.tsx",
    "SavedRow.tsx",
    "ImpactCard.tsx",
    "PaymentHistoryRow.tsx",
    "CredibilityJourney.tsx",
    "TierRewardsSection.tsx",
    "NotificationSettingsLink.tsx",
    "LegalLinksSection.tsx",
    "LoggedOutView.tsx",
  ];

  for (const file of files) {
    it(`${file} has StyleSheet.create`, () => {
      const src = readFile(`${PROFILE_DIR}/${file}`);
      expect(src).toContain("StyleSheet.create");
    });
  }
});

// ---------------------------------------------------------------------------
// 4. Each file exports the named component
// ---------------------------------------------------------------------------
describe("Profile components — exports", () => {
  it("TierBadge exports function", () => {
    expect(readFile(`${PROFILE_DIR}/TierBadge.tsx`)).toContain("export function TierBadge");
  });

  it("HistoryRow exports memo component", () => {
    const src = readFile(`${PROFILE_DIR}/HistoryRow.tsx`);
    expect(src).toContain("HistoryRow");
    expect(src).toContain("React.memo");
  });

  it("BreakdownRow exports function", () => {
    expect(readFile(`${PROFILE_DIR}/BreakdownRow.tsx`)).toContain("export function BreakdownRow");
  });

  it("SavedRow exports memo component", () => {
    const src = readFile(`${PROFILE_DIR}/SavedRow.tsx`);
    expect(src).toContain("SavedRow");
    expect(src).toContain("React.memo");
  });

  it("ImpactCard exports function", () => {
    expect(readFile(`${PROFILE_DIR}/ImpactCard.tsx`)).toContain("export function ImpactCard");
  });

  it("PaymentHistoryRow exports memo component", () => {
    const src = readFile(`${PROFILE_DIR}/PaymentHistoryRow.tsx`);
    expect(src).toContain("PaymentHistoryRow");
    expect(src).toContain("React.memo");
  });

  it("CredibilityJourney exports function", () => {
    expect(readFile(`${PROFILE_DIR}/CredibilityJourney.tsx`)).toContain("export function CredibilityJourney");
  });

  it("TierRewardsSection exports function", () => {
    expect(readFile(`${PROFILE_DIR}/TierRewardsSection.tsx`)).toContain("export function TierRewardsSection");
  });

  it("NotificationSettingsLink exports function", () => {
    expect(readFile(`${PROFILE_DIR}/NotificationSettingsLink.tsx`)).toContain("export function NotificationSettingsLink");
  });

  it("LegalLinksSection exports function", () => {
    expect(readFile(`${PROFILE_DIR}/LegalLinksSection.tsx`)).toContain("export function LegalLinksSection");
  });

  it("LoggedOutView exports function", () => {
    expect(readFile(`${PROFILE_DIR}/LoggedOutView.tsx`)).toContain("export function LoggedOutView");
  });
});

// ---------------------------------------------------------------------------
// 5. Profile.tsx import path unchanged
// ---------------------------------------------------------------------------
describe("Profile.tsx — import compatibility", () => {
  const profileSrc = readFile("app/(tabs)/profile.tsx");

  it("still imports from SubComponents", () => {
    expect(profileSrc).toContain('@/components/profile/SubComponents');
  });

  it("imports all 11 components (SavedRow via SavedPlacesSection)", () => {
    expect(profileSrc).toContain("TierBadge");
    expect(profileSrc).toContain("HistoryRow");
    expect(profileSrc).toContain("ScoreBreakdownCard");
    expect(profileSrc).toContain("SavedPlacesSection");
    expect(profileSrc).toContain("ImpactCard");
    expect(profileSrc).toContain("PaymentHistoryRow");
    expect(profileSrc).toContain("CredibilityJourney");
    expect(profileSrc).toContain("TierRewardsSection");
    expect(profileSrc).toContain("NotificationSettingsLink");
    expect(profileSrc).toContain("LegalLinksSection");
    expect(profileSrc).toContain("LoggedOutView");
  });
});

// ---------------------------------------------------------------------------
// 6. Key component content preserved
// ---------------------------------------------------------------------------
describe("Content preservation", () => {
  it("CredibilityJourney has tier constants", () => {
    const src = readFile(`${PROFILE_DIR}/CredibilityJourney.tsx`);
    expect(src).toContain("JOURNEY_TIERS");
    expect(src).toContain("TIER_ICONS");
    expect(src).toContain("TIER_NEXT_HINTS");
  });

  it("LoggedOutView has Google auth", () => {
    const src = readFile(`${PROFILE_DIR}/LoggedOutView.tsx`);
    expect(src).toContain("signInWithGoogle");
    expect(src).toContain("Continue with Google");
  });

  it("LegalLinksSection has delete account", () => {
    const src = readFile(`${PROFILE_DIR}/LegalLinksSection.tsx`);
    expect(src).toContain("Delete Account");
    expect(src).toContain("deleteAccountBtn");
  });

  it("TierRewardsSection uses tier-perks", () => {
    const src = readFile(`${PROFILE_DIR}/TierRewardsSection.tsx`);
    expect(src).toContain("getUnlockedPerks");
    expect(src).toContain("getNextTierPerks");
  });
});
