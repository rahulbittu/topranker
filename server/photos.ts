import type { Request, Response } from "express";
import { log } from "./logger";
import { config } from "./config";

/**
 * Proxy for Google Places photos.
 * Photo URLs in the database are Google Places photo references like:
 *   places/ChIJ.../photos/ATCDNf...
 * These require a server-side API key to fetch, so we proxy them.
 *
 * GET /api/photos/proxy?ref=places/ChIJ.../photos/ATCDNf...&maxwidth=600
 */
export async function handlePhotoProxy(req: Request, res: Response) {
  const ref = req.query.ref as string;
  if (!ref) {
    return res.status(400).json({ error: "Missing ref parameter" });
  }

  // Validate the ref looks like a Google Places photo reference
  if (!ref.startsWith("places/")) {
    return res.status(400).json({ error: "Invalid photo reference" });
  }

  // Sprint 806: Centralized to config.ts
  const apiKey = config.googleMapsApiKey || "";
  if (!apiKey) {
    return res.status(503).json({ error: "Maps API key not configured" });
  }

  const maxWidth = parseInt(req.query.maxwidth as string) || 600;
  const maxHeight = parseInt(req.query.maxheight as string) || 400;

  // Google Places API (New) photo media URL
  // https://places.googleapis.com/v1/{photo_reference}/media?maxWidthPx=600&key=KEY
  const url = `https://places.googleapis.com/v1/${ref}/media?maxWidthPx=${maxWidth}&maxHeightPx=${maxHeight}&key=${apiKey}`;

  try {
    const upstream = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });

    if (!upstream.ok) {
      // Try legacy Places Photo API as fallback
      const legacyUrl = `https://maps.googleapis.com/maps/api/place/photo?photoreference=${encodeURIComponent(ref)}&maxwidth=${maxWidth}&key=${apiKey}`;
      const legacyRes = await fetch(legacyUrl, {
        redirect: "follow",
        signal: AbortSignal.timeout(10000),
      });

      if (!legacyRes.ok) {
        return res.status(upstream.status).json({
          error: `Google Places photo fetch failed: ${upstream.status}`,
        });
      }

      // Stream the legacy response
      const contentType = legacyRes.headers.get("content-type") || "image/jpeg";
      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=86400"); // cache 24h
      const buffer = Buffer.from(await legacyRes.arrayBuffer());
      return res.send(buffer);
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400"); // cache 24h

    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.send(buffer);
  } catch (err: any) {
    if (err.name === "TimeoutError") {
      return res.status(504).json({ error: "Photo fetch timed out" });
    }
    log.tag("PhotoProxy").error("Error:", err.message);
    return res.status(502).json({ error: "Failed to fetch photo" });
  }
}
