/**
 * Sprint 539: WhatsApp share deeplinks — "Best In" format sharing
 *
 * 1. lib/sharing.ts: shareToWhatsApp, getBestInShareText, getDishLeaderboardShareText
 * 2. BusinessActionBar: WhatsApp share button
 * 3. DishLeaderboardSection: WhatsApp share on hero banner
 * 4. DishEntryCard: WhatsApp share on individual entries
 * 5. Sprint & retro docs
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Sharing utility — WhatsApp functions
// ---------------------------------------------------------------------------
describe("lib/sharing.ts — WhatsApp sharing", () => {
  const src = readFile("lib/sharing.ts");

  it("exports shareToWhatsApp function", () => {
    expect(src).toContain("export async function shareToWhatsApp");
  });

  it("uses wa.me universal link", () => {
    expect(src).toContain("https://wa.me/?text=");
  });

  it("has whatsapp:// fallback scheme", () => {
    expect(src).toContain("whatsapp://send?text=");
  });

  it("encodes text for URL", () => {
    expect(src).toContain("encodeURIComponent");
  });

  it("exports getBestInShareText function", () => {
    expect(src).toContain("export function getBestInShareText");
  });

  it("getBestInShareText uses rank-based emojis", () => {
    expect(src).toContain("🥇");
    expect(src).toContain("🥈");
    expect(src).toContain("🥉");
    expect(src).toContain("🔥");
  });

  it("getBestInShareText creates controversy format for #1", () => {
    expect(src).toContain("Agree or disagree?");
    expect(src).toContain("Check the live ranking");
  });

  it("getBestInShareText creates engagement format for others", () => {
    expect(src).toContain("Think they should be higher?");
    expect(src).toContain("Rate them");
  });

  it("exports getDishLeaderboardShareText function", () => {
    expect(src).toContain("export function getDishLeaderboardShareText");
  });

  it("getDishLeaderboardShareText has dish format", () => {
    expect(src).toContain("🍽️ Best");
    expect(src).toContain("spots ranked");
    expect(src).toContain("Who's your pick?");
  });
});

// ---------------------------------------------------------------------------
// 2. BusinessActionBar — WhatsApp button
// ---------------------------------------------------------------------------
describe("BusinessActionBar — WhatsApp share", () => {
  const src = readFile("components/business/BusinessActionBar.tsx");

  it("imports shareToWhatsApp", () => {
    expect(src).toContain("shareToWhatsApp");
  });

  it("has handleWhatsApp handler", () => {
    expect(src).toContain("handleWhatsApp");
  });

  it("renders WhatsApp action button", () => {
    expect(src).toContain("logo-whatsapp");
    expect(src).toContain('label="WhatsApp"');
  });

  it("tracks whatsapp analytics", () => {
    expect(src).toContain('"whatsapp"');
  });

  it("replaced Copy Link with WhatsApp button", () => {
    expect(src).not.toContain('label="Copy Link"');
  });
});

// ---------------------------------------------------------------------------
// 3. DishLeaderboardSection — WhatsApp share on hero
// ---------------------------------------------------------------------------
describe("DishLeaderboardSection — WhatsApp share", () => {
  const src = readFile("components/DishLeaderboardSection.tsx");

  it("imports WhatsApp sharing utilities", () => {
    expect(src).toContain("shareToWhatsApp");
    expect(src).toContain("getDishLeaderboardShareText");
  });

  it("has WhatsApp button in hero banner", () => {
    expect(src).toContain("whatsappBtn");
    expect(src).toContain("logo-whatsapp");
  });

  it("generates dish leaderboard share text", () => {
    expect(src).toContain("getDishLeaderboardShareText(");
  });
});

// ---------------------------------------------------------------------------
// 4. DishEntryCard — WhatsApp share on entries
// ---------------------------------------------------------------------------
describe("DishEntryCard — WhatsApp share", () => {
  const src = readFile("components/dish/DishEntryCard.tsx");

  it("imports WhatsApp sharing utilities", () => {
    expect(src).toContain("shareToWhatsApp");
    expect(src).toContain("getBestInShareText");
  });

  it("accepts optional city prop", () => {
    expect(src).toContain("city?: string");
  });

  it("has WhatsApp button", () => {
    expect(src).toContain("whatsappBtn");
    expect(src).toContain("logo-whatsapp");
  });

  it("generates Best In share text with rank", () => {
    expect(src).toContain("getBestInShareText(dishName");
    expect(src).toContain("entry.rankPosition");
  });

  it("has entry actions row", () => {
    expect(src).toContain("entryActions");
  });
});

// ---------------------------------------------------------------------------
// 5. Sprint & retro docs
// ---------------------------------------------------------------------------
describe("Sprint 539 docs", () => {
  const sprint = readFile("docs/sprints/SPRINT-539-WHATSAPP-SHARE.md");
  const retro = readFile("docs/retros/RETRO-539-WHATSAPP-SHARE.md");

  it("sprint doc has correct header", () => {
    expect(sprint).toContain("Sprint 539");
    expect(sprint).toContain("WhatsApp");
  });

  it("sprint doc has team discussion", () => {
    expect(sprint).toContain("Team Discussion");
    expect(sprint).toContain("Marcus Chen");
    expect(sprint).toContain("Jasmine Taylor");
  });

  it("sprint doc mentions Best In format", () => {
    expect(sprint).toContain("Best In");
  });

  it("sprint doc mentions shareToWhatsApp", () => {
    expect(sprint).toContain("shareToWhatsApp");
  });

  it("retro has correct header", () => {
    expect(retro).toContain("Retro 539");
  });

  it("retro has all required sections", () => {
    expect(retro).toContain("What Went Well");
    expect(retro).toContain("What Could Improve");
    expect(retro).toContain("Action Items");
    expect(retro).toContain("Team Morale");
  });
});
