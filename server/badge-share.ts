/**
 * Badge Share-by-Link — Server-rendered OG meta for badge social previews
 * Owner: Marcus Chen (CTO) + Sage (Backend)
 *
 * GET /share/badge/:badgeId?user=username
 * Returns an HTML page with OG meta tags for rich link previews.
 * Social platforms (iMessage, Twitter, Slack) render the preview card.
 */
import type { Request, Response } from "express";

// Badge data is duplicated server-side (minimal subset) to avoid importing
// React Native modules on the server. Only id, name, description, rarity, icon needed.
const BADGE_META: Record<string, { name: string; description: string; rarity: string; color: string; icon: string }> = {
  "first-taste":       { name: "First Taste", description: "Submit your very first rating", rarity: "common", color: "#636366", icon: "star" },
  "ten-strong":        { name: "Ten Strong", description: "Rate 10 businesses", rarity: "common", color: "#636366", icon: "star" },
  "half-century":      { name: "Half Century", description: "Rate 50 businesses", rarity: "rare", color: "#1565C0", icon: "star" },
  "centurion":         { name: "Centurion", description: "Rate 100 businesses", rarity: "epic", color: "#7B1FA2", icon: "trophy" },
  "week-warrior":      { name: "Week Warrior", description: "7-day rating streak", rarity: "rare", color: "#1565C0", icon: "flame" },
  "monthly-devotion":  { name: "Monthly Devotion", description: "30-day rating streak", rarity: "epic", color: "#7B1FA2", icon: "flame" },
  "texas-tour":        { name: "Texas Tour", description: "Rate in 3+ Texas cities", rarity: "rare", color: "#1565C0", icon: "map" },
  "night-owl":         { name: "Night Owl", description: "Rate after midnight", rarity: "common", color: "#636366", icon: "moon" },
  "founding-member":   { name: "Founding Member", description: "Joined during the founding period", rarity: "legendary", color: "#9A7510", icon: "diamond" },
  "kingmaker":         { name: "Kingmaker", description: "Your rating moved a business to #1", rarity: "legendary", color: "#9A7510", icon: "trophy" },
};

const RARITY_COLORS: Record<string, string> = {
  common: "#8E8E93",
  rare: "#2196F3",
  epic: "#9C27B0",
  legendary: "#C49A1A",
};

function generateBadgeHtml(badgeId: string, username: string | null): string {
  const badge = BADGE_META[badgeId];
  const title = badge
    ? `${badge.name} — TopRanker Badge`
    : "TopRanker Badge";
  const description = badge
    ? `${username ? `@${username} earned` : "Earned"} "${badge.name}" — ${badge.description}`
    : "Check out this TopRanker achievement badge!";
  const rarityColor = badge ? (RARITY_COLORS[badge.rarity] || "#C49A1A") : "#C49A1A";

  // SVG-based OG image rendered inline as a data URI
  const svgImage = badge ? `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <rect width="1200" height="630" fill="#0D1B2A"/>
      <rect x="40" y="40" width="1120" height="550" rx="24" fill="#1A2D44"/>
      <circle cx="600" cy="240" r="80" fill="none" stroke="${rarityColor}" stroke-width="6"/>
      <text x="600" y="256" text-anchor="middle" fill="${rarityColor}" font-size="64">${badge.icon === "star" ? "\u2605" : badge.icon === "flame" ? "\u{1F525}" : badge.icon === "trophy" ? "\u{1F3C6}" : badge.icon === "diamond" ? "\u{1F48E}" : badge.icon === "map" ? "\u{1F5FA}" : badge.icon === "moon" ? "\u{1F319}" : "\u2B50"}</text>
      <text x="600" y="380" text-anchor="middle" fill="#FFFFFF" font-size="36" font-weight="bold">${badge.name}</text>
      <text x="600" y="420" text-anchor="middle" fill="#8E8E93" font-size="20">${badge.description}</text>
      <rect x="520" y="445" width="160" height="28" rx="14" fill="${rarityColor}22"/>
      <text x="600" y="465" text-anchor="middle" fill="${rarityColor}" font-size="14" font-weight="bold">${badge.rarity.toUpperCase()}</text>
      ${username ? `<text x="600" y="520" text-anchor="middle" fill="#C49A1A" font-size="18">@${username}</text>` : ""}
      <text x="600" y="560" text-anchor="middle" fill="#636366" font-size="14">TopRanker — Where your rankings matter.</text>
    </svg>
  `.trim() : "";

  const ogImageDataUri = badge
    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgImage)}`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="website">
  ${ogImageDataUri ? `<meta property="og:image" content="${ogImageDataUri}">` : ""}
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0D1B2A; color: #fff; font-family: -apple-system, system-ui, sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .card { background: #1A2D44; border-radius: 24px; padding: 48px; text-align: center; max-width: 400px; }
    .badge-ring { width: 120px; height: 120px; border-radius: 60px; border: 4px solid ${rarityColor}; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 48px; }
    h1 { font-size: 28px; margin-bottom: 8px; }
    .desc { color: #8E8E93; font-size: 16px; margin-bottom: 16px; }
    .rarity { display: inline-block; background: ${rarityColor}22; color: ${rarityColor}; font-size: 12px; font-weight: 800; padding: 4px 16px; border-radius: 12px; text-transform: uppercase; letter-spacing: 1px; }
    .user { color: #C49A1A; margin-top: 16px; font-size: 16px; }
    .tagline { color: #636366; font-size: 13px; margin-top: 24px; }
    .cta { display: inline-block; margin-top: 20px; background: #C49A1A; color: #0D1B2A; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; }
  </style>
</head>
<body>
  <div class="card">
    ${badge ? `
      <div class="badge-ring">${badge.icon === "star" ? "\u2605" : badge.icon === "flame" ? "\u{1F525}" : badge.icon === "trophy" ? "\u{1F3C6}" : badge.icon === "diamond" ? "\u{1F48E}" : badge.icon === "map" ? "\u{1F5FA}" : badge.icon === "moon" ? "\u{1F319}" : "\u2B50"}</div>
      <h1>${badge.name}</h1>
      <p class="desc">${badge.description}</p>
      <span class="rarity">${badge.rarity}</span>
      ${username ? `<p class="user">Earned by @${username}</p>` : ""}
    ` : `
      <h1>Badge Not Found</h1>
      <p class="desc">This badge doesn't exist or the link is invalid.</p>
    `}
    <p class="tagline">TopRanker — Where your rankings matter.</p>
    <a href="/" class="cta">Open TopRanker</a>
  </div>
</body>
</html>`;
}

export function handleBadgeShare(req: Request, res: Response) {
  const badgeId = req.params.badgeId as string;
  const username = (req.query.user as string) || null;

  const html = generateBadgeHtml(badgeId, username);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.send(html);
}
