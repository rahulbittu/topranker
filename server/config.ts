/**
 * Centralized environment configuration.
 * Validates all required env vars at startup. Crashes if any required var is missing.
 * All server modules import from here — no direct process.env access.
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

  // GitHub deploy webhook (optional)
  githubWebhookSecret: process.env.GITHUB_WEBHOOK_SECRET || null,

  // Push notifications (optional)
  ntfyTopic: optional("NTFY_TOPIC", "topranker-deploy"),

  // Google Maps (optional)
  googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || null,

  // Email (optional — console fallback if not set)
  resendApiKey: process.env.RESEND_API_KEY || null,

  // Hosting platform (optional — for CORS)
  replitDevDomain: process.env.REPLIT_DEV_DOMAIN || null,
  replitDomains: process.env.REPLIT_DOMAINS || null,
  railwayPublicDomain: process.env.RAILWAY_PUBLIC_DOMAIN || null,
  corsOrigins: process.env.CORS_ORIGINS || null,
} as const;
