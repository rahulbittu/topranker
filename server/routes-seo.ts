/**
 * SEO routes — Sprint 174
 * Serves sitemap.xml, robots.txt, and JSON-LD endpoints
 * for search engine optimization of dish leaderboard pages.
 */
import type { Express, Request, Response } from "express";
import { wrapAsync } from "./wrap-async";
import { getDishLeaderboards, getBusinessBySlug } from "./storage";

const SITE_URL = process.env.SITE_URL || "https://topranker.com";

export function registerSeoRoutes(app: Express) {
  // ── robots.txt ──────────────────────────────────────────
  app.get("/robots.txt", (_req: Request, res: Response) => {
    res.type("text/plain").send(`User-agent: *
Allow: /
Allow: /dish/
Allow: /business/

Disallow: /admin/
Disallow: /api/
Disallow: /auth/

Sitemap: ${SITE_URL}/sitemap.xml
`);
  });

  // ── sitemap.xml ─────────────────────────────────────────
  app.get("/sitemap.xml", wrapAsync(async (_req: Request, res: Response) => {
    const cities = ["dallas", "fort-worth", "austin", "houston", "san-antonio"];

    // Gather all dish leaderboards across supported cities
    const allBoards: { slug: string; city: string }[] = [];
    for (const city of cities) {
      const boards = await getDishLeaderboards(city);
      for (const b of boards) {
        allBoards.push({ slug: b.dishSlug, city });
      }
    }

    const today = new Date().toISOString().split("T")[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>${SITE_URL}/auth/login</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${SITE_URL}/auth/signup</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${SITE_URL}/legal/terms</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${SITE_URL}/legal/privacy</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>`;

    // Dish leaderboard pages
    for (const board of allBoards) {
      xml += `
  <url>
    <loc>${SITE_URL}/dish/${board.slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
    <lastmod>${today}</lastmod>
  </url>`;
    }

    xml += `
</urlset>`;

    res.type("application/xml").send(xml);
  }));

  // ── JSON-LD endpoint for dish leaderboards ──────────────
  app.get("/api/seo/dish/:slug", wrapAsync(async (req: Request, res: Response) => {
    const { getDishLeaderboardWithEntries } = await import("./storage");
    const slug = req.params.slug as string;
    const city = (req.query.city as string) || "dallas";
    const board = await getDishLeaderboardWithEntries(slug, city);

    if (!board) {
      return res.status(404).json({ error: "Not found" });
    }

    const cityTitle = city.charAt(0).toUpperCase() + city.slice(1);
    const entries = board.entries || [];

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Best ${board.dishName} in ${cityTitle}`,
      description: `Community-ranked best ${board.dishName.toLowerCase()} in ${cityTitle}. ${entries.length} spots rated by credibility-weighted reviews.`,
      url: `${SITE_URL}/dish/${board.dishSlug}`,
      numberOfItems: entries.length,
      itemListElement: entries.slice(0, 10).map((entry: any, idx: number) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: entry.businessName,
        url: `${SITE_URL}/business/${entry.businessSlug}`,
      })),
    };

    return res.json({ data: jsonLd });
  }));
}
