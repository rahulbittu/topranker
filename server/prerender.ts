/**
 * SSR Prerender Middleware — Sprint 180
 *
 * Serves pre-rendered HTML with meta tags for search engine crawlers.
 * Detects bot user agents and returns a minimal HTML shell with:
 * - Open Graph tags
 * - JSON-LD structured data
 * - Canonical URLs
 * - Twitter Cards
 *
 * Non-bot requests pass through to the Expo app shell.
 * Uses in-memory LRU cache to avoid redundant DB queries.
 */

import type { Request, Response, NextFunction } from "express";
import { log } from "./logger";

const prerenderLog = log.tag("Prerender");

const SITE_URL = process.env.SITE_URL || "https://topranker.com";

// Bot user-agent detection
const BOT_AGENTS = [
  "googlebot", "bingbot", "slurp", "duckduckbot", "baiduspider",
  "yandexbot", "facebot", "facebookexternalhit", "twitterbot",
  "linkedinbot", "whatsapp", "telegrambot", "discordbot",
  "slackbot", "applebot", "pinterestbot",
];

function isBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return BOT_AGENTS.some(bot => ua.includes(bot));
}

// Simple in-memory LRU cache (per Amir's recommendation in SLT-175)
interface CacheEntry {
  html: string;
  timestamp: number;
}

const CACHE_MAX = 200;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CacheEntry>();

function getCached(key: string): string | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.html;
}

function setCache(key: string, html: string): void {
  // Evict oldest if at capacity
  if (cache.size >= CACHE_MAX) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, { html, timestamp: Date.now() });
}

/**
 * Generate HTML shell with meta tags for a page.
 */
function renderHtmlShell(meta: {
  title: string;
  description: string;
  url: string;
  image?: string;
  jsonLd?: object;
}): string {
  const escapedTitle = escapeHtml(meta.title);
  const escapedDesc = escapeHtml(meta.description);
  const imageTag = meta.image
    ? `<meta property="og:image" content="${escapeHtml(meta.image)}" />\n    <meta name="twitter:image" content="${escapeHtml(meta.image)}" />`
    : "";
  const jsonLdTag = meta.jsonLd
    ? `<script type="application/ld+json">${JSON.stringify(meta.jsonLd)}</script>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapedTitle}</title>
    <meta name="description" content="${escapedDesc}" />
    <link rel="canonical" href="${escapeHtml(meta.url)}" />
    <meta property="og:title" content="${escapedTitle}" />
    <meta property="og:description" content="${escapedDesc}" />
    <meta property="og:url" content="${escapeHtml(meta.url)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="TopRanker" />
    ${imageTag}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapedTitle}" />
    <meta name="twitter:description" content="${escapedDesc}" />
    ${jsonLdTag}
</head>
<body>
    <noscript>
        <h1>${escapedTitle}</h1>
        <p>${escapedDesc}</p>
    </noscript>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Prerender middleware for dish leaderboard pages: /dish/:slug
 */
async function prerenderDish(slug: string, city: string): Promise<string | null> {
  try {
    const { getDishLeaderboardWithEntries } = await import("./storage");
    const board = await getDishLeaderboardWithEntries(slug, city);
    if (!board) return null;

    const cityTitle = city.charAt(0).toUpperCase() + city.slice(1);
    const entries = board.entries || [];
    const topNames = entries.slice(0, 3).map((e: any) => e.businessName).join(", ");

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Best ${board.dishName} in ${cityTitle}`,
      description: `Community-ranked best ${board.dishName.toLowerCase()} in ${cityTitle}.`,
      url: `${SITE_URL}/dish/${slug}`,
      numberOfItems: entries.length,
      itemListElement: entries.slice(0, 10).map((entry: any, idx: number) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: entry.businessName,
        url: `${SITE_URL}/business/${entry.businessSlug}`,
      })),
    };

    return renderHtmlShell({
      title: `Best ${board.dishName} in ${cityTitle} — TopRanker`,
      description: `${entries.length} restaurants ranked by credibility-weighted reviews. Top spots: ${topNames || "Be the first to rate"}.`,
      url: `${SITE_URL}/dish/${slug}`,
      image: `${SITE_URL}/api/og-image/dish/${slug}?city=${encodeURIComponent(city)}`,
      jsonLd,
    });
  } catch (err) {
    prerenderLog.error(`Dish prerender failed for ${slug}: ${err}`);
    return null;
  }
}

/**
 * Prerender middleware for business pages: /business/:slug
 */
async function prerenderBusiness(slug: string): Promise<string | null> {
  try {
    const { getBusinessBySlug } = await import("./storage");
    const biz = await getBusinessBySlug(slug);
    if (!biz) return null;

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Restaurant",
      name: biz.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: biz.city,
      },
      aggregateRating: biz.totalRatings > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: biz.weightedScore,
            ratingCount: biz.totalRatings,
            bestRating: "5",
            worstRating: "1",
          }
        : undefined,
    };

    return renderHtmlShell({
      title: `${biz.name} — ${biz.category} in ${biz.city} — TopRanker`,
      description: `${biz.name} ranked #${biz.currentRank || "unranked"} in ${biz.category} in ${biz.city}. ${biz.totalRatings} credibility-weighted ratings.`,
      url: `${SITE_URL}/business/${slug}`,
      image: `${SITE_URL}/api/og-image/business/${slug}`,
      jsonLd,
    });
  } catch (err) {
    prerenderLog.error(`Business prerender failed for ${slug}: ${err}`);
    return null;
  }
}

/**
 * Express middleware that intercepts bot requests to SEO-relevant pages.
 * Pass-through for non-bot requests (served by Expo app shell).
 */
export function prerenderMiddleware(req: Request, res: Response, next: NextFunction): void {
  const userAgent = req.headers["user-agent"] || "";
  if (!isBot(userAgent)) {
    next();
    return;
  }

  const path = req.path;

  // Match /dish/:slug
  const dishMatch = path.match(/^\/dish\/([a-z0-9-]+)$/);
  if (dishMatch) {
    const slug = dishMatch[1];
    const city = (req.query.city as string) || "dallas";
    const cacheKey = `dish:${slug}:${city}`;
    const cached = getCached(cacheKey);

    if (cached) {
      prerenderLog.info(`Cache HIT: ${cacheKey}`);
      res.type("text/html").send(cached);
      return;
    }

    prerenderDish(slug, city).then(html => {
      if (html) {
        setCache(cacheKey, html);
        prerenderLog.info(`Prerendered: ${cacheKey}`);
        res.type("text/html").send(html);
      } else {
        next();
      }
    }).catch(() => next());
    return;
  }

  // Match /business/:slug
  const bizMatch = path.match(/^\/business\/([a-z0-9-]+)$/);
  if (bizMatch) {
    const slug = bizMatch[1];
    const cacheKey = `biz:${slug}`;
    const cached = getCached(cacheKey);

    if (cached) {
      prerenderLog.info(`Cache HIT: ${cacheKey}`);
      res.type("text/html").send(cached);
      return;
    }

    prerenderBusiness(slug).then(html => {
      if (html) {
        setCache(cacheKey, html);
        prerenderLog.info(`Prerendered: ${cacheKey}`);
        res.type("text/html").send(html);
      } else {
        next();
      }
    }).catch(() => next());
    return;
  }

  // No prerender match — pass through
  next();
}

/**
 * Invalidate cache entries for a specific business or dish.
 * Called after rating submission to ensure crawlers see fresh data.
 */
export function invalidatePrerenderCache(type: "dish" | "biz", slug: string): void {
  const prefix = `${type}:${slug}`;
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
      prerenderLog.info(`Cache invalidated: ${key}`);
    }
  }
}

/**
 * Get cache stats for monitoring.
 */
export function getPrerenderCacheStats(): { size: number; maxSize: number; ttlMs: number } {
  return { size: cache.size, maxSize: CACHE_MAX, ttlMs: CACHE_TTL_MS };
}
