/**
 * Sprint 636: Dynamic OG image generation for social sharing.
 * Returns SVG images sized 1200×630 (standard OG image dimensions).
 * Endpoints: /api/og-image/business/:slug, /api/og-image/dish/:slug
 */
import type { Request, Response } from "express";
import { log } from "./logger";

const ogLog = log.tag("OG-Image");

const AMBER = "#C49A1A";
const NAVY = "#0D1B2A";
const DARK_SURFACE = "#1A2D44";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function rankEmoji(rank: number): string {
  if (rank === 1) return "\u{1F947}"; // 🥇
  if (rank === 2) return "\u{1F948}"; // 🥈
  if (rank === 3) return "\u{1F949}"; // 🥉
  return `#${rank}`;
}

function generateBusinessSvg(opts: {
  name: string;
  rank: number;
  score: number;
  category: string;
  city: string;
  ratingCount: number;
}): string {
  const { name, rank, score, category, city, ratingCount } = opts;
  const displayName = escapeXml(name.length > 32 ? name.slice(0, 30) + "..." : name);
  const displayCategory = escapeXml(category);
  const displayCity = escapeXml(city);
  const rankText = rank <= 3 ? rankEmoji(rank) : `#${rank}`;
  const scoreText = score > 0 ? score.toFixed(1) : "—";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${NAVY}"/>
  <rect x="40" y="40" width="1120" height="550" rx="24" fill="${DARK_SURFACE}"/>
  <!-- Rank badge -->
  <circle cx="600" cy="180" r="70" fill="${AMBER}22" stroke="${AMBER}" stroke-width="4"/>
  <text x="600" y="200" text-anchor="middle" fill="${AMBER}" font-size="48" font-weight="bold" font-family="sans-serif">${rankText}</text>
  <!-- Business name -->
  <text x="600" y="290" text-anchor="middle" fill="#FFFFFF" font-size="40" font-weight="bold" font-family="sans-serif">${displayName}</text>
  <!-- Category + City -->
  <text x="600" y="335" text-anchor="middle" fill="#8E8E93" font-size="22" font-family="sans-serif">${displayCategory} in ${displayCity}</text>
  <!-- Score -->
  <text x="540" y="400" text-anchor="end" fill="${AMBER}" font-size="56" font-weight="bold" font-family="sans-serif">${scoreText}</text>
  <text x="550" y="385" text-anchor="start" fill="#8E8E93" font-size="18" font-family="sans-serif">/5</text>
  <text x="550" y="410" text-anchor="start" fill="#636366" font-size="16" font-family="sans-serif">${ratingCount} rating${ratingCount !== 1 ? "s" : ""}</text>
  <!-- Divider -->
  <line x1="200" y1="440" x2="1000" y2="440" stroke="#2A3D55" stroke-width="1"/>
  <!-- Branding -->
  <text x="600" y="490" text-anchor="middle" fill="${AMBER}" font-size="24" font-weight="bold" font-family="sans-serif">TopRanker</text>
  <text x="600" y="520" text-anchor="middle" fill="#636366" font-size="16" font-family="sans-serif">Trustworthy rankings by real people</text>
  <text x="600" y="555" text-anchor="middle" fill="#4A5568" font-size="14" font-family="sans-serif">topranker.com</text>
</svg>`;
}

function generateDishSvg(opts: {
  dishName: string;
  city: string;
  entryCount: number;
  topNames: string[];
}): string {
  const { dishName, city, entryCount, topNames } = opts;
  const displayDish = escapeXml(dishName);
  const displayCity = escapeXml(city);

  const topEntries = topNames.slice(0, 3).map((n, i) => {
    const y = 320 + i * 40;
    const medal = rankEmoji(i + 1);
    const label = escapeXml(n.length > 35 ? n.slice(0, 33) + "..." : n);
    return `<text x="600" y="${y}" text-anchor="middle" fill="#FFFFFF" font-size="22" font-family="sans-serif">${medal} ${label}</text>`;
  }).join("\n  ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${NAVY}"/>
  <rect x="40" y="40" width="1120" height="550" rx="24" fill="${DARK_SURFACE}"/>
  <!-- Title -->
  <text x="600" y="140" text-anchor="middle" fill="${AMBER}" font-size="22" font-weight="bold" font-family="sans-serif">BEST IN ${displayCity.toUpperCase()}</text>
  <text x="600" y="200" text-anchor="middle" fill="#FFFFFF" font-size="44" font-weight="bold" font-family="sans-serif">Best ${displayDish}</text>
  <text x="600" y="245" text-anchor="middle" fill="#8E8E93" font-size="20" font-family="sans-serif">${entryCount} restaurant${entryCount !== 1 ? "s" : ""} ranked</text>
  <!-- Top entries -->
  ${topEntries}
  <!-- Divider -->
  <line x1="200" y1="460" x2="1000" y2="460" stroke="#2A3D55" stroke-width="1"/>
  <!-- Branding -->
  <text x="600" y="510" text-anchor="middle" fill="${AMBER}" font-size="24" font-weight="bold" font-family="sans-serif">TopRanker</text>
  <text x="600" y="540" text-anchor="middle" fill="#636366" font-size="16" font-family="sans-serif">Trustworthy rankings by real people</text>
  <text x="600" y="570" text-anchor="middle" fill="#4A5568" font-size="14" font-family="sans-serif">topranker.com</text>
</svg>`;
}

export async function handleBusinessOgImage(req: Request, res: Response) {
  const slug = req.params.slug as string;
  try {
    const { getBusinessBySlug } = await import("./storage");
    const biz = await getBusinessBySlug(slug);
    if (!biz) {
      return res.status(404).send("Not found");
    }
    const svg = generateBusinessSvg({
      name: biz.name,
      rank: biz.currentRank || 0,
      score: biz.weightedScore || 0,
      category: biz.category || "Restaurant",
      city: biz.city || "Dallas",
      ratingCount: biz.totalRatings || 0,
    });
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
    return res.send(svg);
  } catch (err) {
    ogLog.error("Business image failed:", err);
    return res.status(500).send("Error generating image");
  }
}

export async function handleDishOgImage(req: Request, res: Response) {
  const slug = req.params.slug as string;
  const city = (req.query.city as string) || "dallas";
  try {
    const { getDishLeaderboardWithEntries } = await import("./storage");
    const board = await getDishLeaderboardWithEntries(slug, city);
    if (!board) {
      return res.status(404).send("Not found");
    }
    const entries = board.entries || [];
    const svg = generateDishSvg({
      dishName: board.dishName,
      city: city.charAt(0).toUpperCase() + city.slice(1),
      entryCount: entries.length,
      topNames: entries.slice(0, 3).map((e: any) => e.businessName),
    });
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
    return res.send(svg);
  } catch (err) {
    ogLog.error("Dish image failed:", err);
    return res.status(500).send("Error generating image");
  }
}
