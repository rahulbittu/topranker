/**
 * Sprint 584: Profile Page Section Extraction
 *
 * Tests:
 * 1. ProfileIdentityCard component structure
 * 2. ProfileBottomSection component structure
 * 3. profile.tsx imports extracted components
 * 4. profile.tsx LOC reduction
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 584: ProfileIdentityCard Component", () => {
  const src = readFile("components/profile/ProfileIdentityCard.tsx");

  it("exports ProfileIdentityCard function", () => {
    expect(src).toContain("export function ProfileIdentityCard");
  });

  it("exports ProfileIdentityCardProps interface", () => {
    expect(src).toContain("export interface ProfileIdentityCardProps");
  });

  it("props include displayName, username, avatarUrl, tier, isFoundingMember", () => {
    expect(src).toContain("displayName: string");
    expect(src).toContain("username: string");
    expect(src).toContain("avatarUrl: string | null");
    expect(src).toContain("tier: CredibilityTier");
    expect(src).toContain("isFoundingMember: boolean");
  });

  it("uses LinearGradient with navy colors", () => {
    expect(src).toContain("LinearGradient");
    expect(src).toContain("BRAND.colors.navy");
    expect(src).toContain("BRAND.colors.navyDark");
  });

  it("renders TierBadge", () => {
    expect(src).toContain("TierBadge");
    expect(src).toContain("tier={tier}");
  });

  it("renders founding member badge conditionally", () => {
    expect(src).toContain("isFoundingMember");
    expect(src).toContain("FOUNDING MEMBER");
  });

  it("uses FadeInView animation wrapper", () => {
    expect(src).toContain("FadeInView");
    expect(src).toContain("delay={100}");
  });

  it("renders avatar image or initial fallback", () => {
    expect(src).toContain("avatarUrl");
    expect(src).toContain("displayName.charAt(0)");
  });

  it("component LOC under 100", () => {
    const lines = src.split("\n").length;
    expect(lines).toBeLessThan(110); // Sprint 625: +formatShortName + firstName/lastName
  });
});

describe("Sprint 584: ProfileBottomSection Component", () => {
  const src = readFile("components/profile/ProfileBottomSection.tsx");

  it("exports ProfileBottomSection function", () => {
    expect(src).toContain("export function ProfileBottomSection");
  });

  it("exports ProfileBottomSectionProps interface", () => {
    expect(src).toContain("export interface ProfileBottomSectionProps");
  });

  it("renders PaymentHistoryRow for payment data", () => {
    expect(src).toContain("PaymentHistoryRow");
    expect(src).toContain("paymentHistory");
  });

  it("renders CredibilityJourney with tier props", () => {
    expect(src).toContain("CredibilityJourney");
    expect(src).toContain("currentTier={tier}");
  });

  it("renders BadgeGridFull with badges and onBadgePress", () => {
    expect(src).toContain("BadgeGridFull");
    expect(src).toContain("onBadgePress={onBadgePress}");
  });

  it("renders TierRewardsSection", () => {
    expect(src).toContain("TierRewardsSection");
    expect(src).toContain("tier={tier}");
  });

  it("renders invite friends link", () => {
    expect(src).toContain('router.push("/referral")');
    expect(src).toContain("Invite Friends");
  });

  it("renders admin panel link conditionally via isAdminEmail", () => {
    expect(src).toContain("isAdminEmail(email)");
    expect(src).toContain("Admin Panel");
  });

  it("renders NotificationPreferencesCard", () => {
    expect(src).toContain("NotificationPreferencesCard");
  });

  it("renders LegalLinksSection", () => {
    expect(src).toContain("LegalLinksSection");
  });

  it("component LOC under 125", () => {
    const lines = src.split("\n").length;
    expect(lines).toBeLessThan(125);
  });
});

describe("Sprint 584: Profile Page Integration", () => {
  const src = readFile("app/(tabs)/profile.tsx");

  it("imports ProfileIdentityCard", () => {
    expect(src).toContain('import { ProfileIdentityCard } from "@/components/profile/ProfileIdentityCard"');
  });

  it("imports ProfileBottomSection", () => {
    expect(src).toContain('import { ProfileBottomSection } from "@/components/profile/ProfileBottomSection"');
  });

  it("renders ProfileIdentityCard with profile props", () => {
    expect(src).toContain("<ProfileIdentityCard");
    expect(src).toContain("displayName={profile.displayName}");
    expect(src).toContain("tier={tier}");
  });

  it("renders ProfileBottomSection with required props", () => {
    expect(src).toContain("<ProfileBottomSection");
    expect(src).toContain("email={profile.email}");
    expect(src).toContain("badges={badges}");
  });

  it("profile.tsx LOC under 360 after extraction", () => {
    const lines = src.split("\n").length;
    expect(lines).toBeLessThan(360);
  });
});
