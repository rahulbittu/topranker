/**
 * Centralized environment configuration.
 * Validates all required env vars at startup. Crashes if any required var is missing.
 * All server modules import from here — no direct process.env access.
 *
 * ARCHITECTURE BOUNDARY (Sprint 811 — formalized per external critique):
 *
 * Three bootstrap files are PERMANENTLY exempt from config.ts:
 *   - db.ts      — DATABASE_URL (config.ts depends on this being available first)
 *   - logger.ts  — NODE_ENV (logging must work before config validation)
 *   - index.ts   — PORT, NODE_ENV (entry point, sets up process before config loads)
 *
 * These are PRE-CONFIG boundaries, not exceptions. They represent the
 * initialization order: logger → db → config → everything else.
 * This is permanent architecture, not temporary debt.
 *
 * GUARDRAILS (Sprint 811):
 *   - Max fields: 35 (split into groups if exceeded)
 *   - Current fields: 27
 *   - Field groups required at: 35+ fields
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. Server cannot start.`);
  }
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

export const config = {
  // Database (required)
  databaseUrl: required("DATABASE_URL"),

  // Session (required — no fallback, C1 audit finding)
  sessionSecret: required("SESSION_SECRET"),

  // Server
  port: parseInt(optional("PORT", "5000"), 10),
  nodeEnv: optional("NODE_ENV", "development"),
  isProduction: process.env.NODE_ENV === "production",

  // Google OAuth (optional — feature disabled if not set)
  googleClientId: process.env.GOOGLE_CLIENT_ID || null,

  // Stripe (optional — mock payments if not set)
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || null,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || null,

  // GitHub deploy webhook (optional)
  githubWebhookSecret: process.env.GITHUB_WEBHOOK_SECRET || null,

  // Push notifications (optional)
  ntfyTopic: optional("NTFY_TOPIC", "topranker-deploy"),

  // Google Maps (optional)
  googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || null,

  // Google Places (optional — enrichment disabled if not set)
  googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY || null,

  // Email (optional — console fallback if not set)
  resendApiKey: process.env.RESEND_API_KEY || null,
  resendWebhookSecret: process.env.RESEND_WEBHOOK_SECRET || null,
  emailFrom: optional("EMAIL_FROM", "TopRanker <noreply@topranker.com>"),

  // Unsubscribe HMAC (optional — dev fallback if not set)
  unsubscribeSecret: optional("UNSUBSCRIBE_SECRET", "topranker-unsub-dev-secret"),

  // Error tracking (optional — console fallback if not set)
  sentryDsn: process.env.SENTRY_DSN || "",

  // Site URL (optional — used for emails, SEO, QR codes)
  siteUrl: optional("SITE_URL", "https://topranker.io"),

  // Redis (optional — memory fallback if not set)
  redisUrl: process.env.REDIS_URL || null,

  // Cloudflare R2 file storage (optional — local fallback if not set)
  r2BucketName: process.env.R2_BUCKET_NAME || null,
  r2AccountId: process.env.R2_ACCOUNT_ID || null,
  r2AccessKeyId: process.env.R2_ACCESS_KEY_ID || null,
  r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY || null,
  r2PublicUrl: process.env.R2_PUBLIC_URL || null,

  // Hosting platform (optional — for CORS)
  replitDevDomain: process.env.REPLIT_DEV_DOMAIN || null,
  replitDomains: process.env.REPLIT_DOMAINS || null,
  railwayPublicDomain: process.env.RAILWAY_PUBLIC_DOMAIN || null,
  corsOrigins: process.env.CORS_ORIGINS || null,
} as const;
