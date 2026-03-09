/**
 * Security Headers Middleware — Sprint 104
 * Adds OWASP-recommended security headers + CORS to all responses.
 * Owner: Nadia Kaur (Cybersecurity)
 */
import type { Request, Response, NextFunction } from "express";

/**
 * Builds the set of allowed CORS origins from environment + hardcoded production domains.
 * Cached at module level so we don't re-parse env vars on every request.
 */
function buildAllowedOrigins(): Set<string> {
  const origins = new Set<string>();

  // Production origins
  origins.add("https://topranker.com");
  origins.add("https://www.topranker.com");
  origins.add("https://topranker.io");
  origins.add("https://www.topranker.io");

  // Configurable origins via CORS_ORIGINS env (comma-separated)
  const envOrigins = process.env.CORS_ORIGINS;
  if (envOrigins) {
    envOrigins.split(",").forEach((o) => {
      const trimmed = o.trim();
      if (trimmed) origins.add(trimmed);
    });
  }

  // Railway-specific origins
  const railwayDomain = process.env.RAILWAY_PUBLIC_DOMAIN;
  if (railwayDomain) {
    origins.add(`https://${railwayDomain}`);
  }

  // Replit-specific origins (legacy — remove after migration)
  const replitDevDomain = process.env.REPLIT_DEV_DOMAIN;
  if (replitDevDomain) {
    origins.add(`https://${replitDevDomain}`);
  }
  const replitDomains = process.env.REPLIT_DOMAINS;
  if (replitDomains) {
    replitDomains.split(",").forEach((d) => {
      const trimmed = d.trim();
      if (trimmed) origins.add(`https://${trimmed}`);
    });
  }

  return origins;
}

const allowedOrigins = buildAllowedOrigins();

/** Returns true for http://localhost:* and http://127.0.0.1:* during development */
function isLocalhostOrigin(origin: string): boolean {
  return (
    origin.startsWith("http://localhost:") ||
    origin.startsWith("http://127.0.0.1:")
  );
}

export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  const isDev = process.env.NODE_ENV !== "production";

  // ── CORS ──────────────────────────────────────────────────────────
  const origin = req.headers.origin as string | undefined;

  if (isDev) {
    // In dev: allow all origins for CORS (Replit preview, localhost, etc.)
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, expo-platform");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Max-Age", "86400");
    }
    if (req.method === "OPTIONS") {
      return res.status(204).end();
    }
    // Minimal headers in dev — NO X-Frame-Options, NO CSP frame-ancestors
    // so Replit iframe preview works
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("X-API-Version", "1.0.0");
    const requestId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    res.setHeader("X-Request-Id", requestId);
    return next();
  }

  // ── Production-only below ─────────────────────────────────────────
  const wildcardAllowed = allowedOrigins.has("*");

  if (
    origin &&
    (wildcardAllowed || allowedOrigins.has(origin) || isLocalhostOrigin(origin))
  ) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Max-Age", "86400");
  }

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // Prevent MIME-type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Prevent clickjacking — production only
  res.setHeader("X-Frame-Options", "DENY");

  // XSS protection (legacy browsers)
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self), payment=(self)"
  );

  // Content Security Policy — restrict resource loading origins
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://maps.googleapis.com https://maps.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.stripe.com https://api.resend.com https://maps.googleapis.com https://maps.gstatic.com https://accounts.google.com https://oauth2.googleapis.com",
    "frame-src 'self' https://accounts.google.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
  res.setHeader("Content-Security-Policy", csp);

  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  res.setHeader("X-API-Version", "1.0.0");
  const requestId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  res.setHeader("X-Request-Id", requestId);

  next();
}
