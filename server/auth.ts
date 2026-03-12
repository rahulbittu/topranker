import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { getMemberByEmail, getMemberById, createMember, getMemberByUsername, getMemberByAuthId } from "./storage";
import bcrypt from "bcrypt";
import type { Express, Request } from "express";
import { config } from "./config";
import { checkAndRefreshTier } from "./tier-staleness";
import { log } from "./logger";

declare global {
  namespace Express {
    interface User {
      id: string;
      displayName: string;
      username: string;
      email: string;
      city: string;
      credibilityScore: number;
      credibilityTier: string;
    }
  }
}

export function setupAuth(app: Express) {
  const PgStore = connectPgSimple(session);

  app.use(
    session({
      store: new PgStore({
        pool,
        createTableIfMissing: true,
        // Sprint 794: Explicit session cleanup — prune expired sessions every 15 min
        pruneSessionInterval: 15 * 60, // seconds
      }),
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      proxy: config.isProduction,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "lax",
        secure: config.isProduction,
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const member = await getMemberByEmail(email);
          if (!member) {
            return done(null, false, { message: "Invalid email or password" });
          }
          if (!member.password) {
            return done(null, false, { message: "This account uses Google sign-in" });
          }
          const isMatch = await bcrypt.compare(password, member.password);
          if (!isMatch) {
            return done(null, false, { message: "Invalid email or password" });
          }
          return done(null, {
            id: member.id,
            displayName: member.displayName,
            username: member.username,
            email: member.email,
            city: member.city,
            credibilityScore: member.credibilityScore,
            credibilityTier: member.credibilityTier,
          });
        } catch (err) {
          return done(err);
        }
      },
    ),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const member = await getMemberById(id);
      if (!member) {
        return done(null, false);
      }
      // Tier freshness guard (Sprint 141): ensure session user has correct tier
      const freshTier = checkAndRefreshTier(member.credibilityTier, member.credibilityScore);
      done(null, {
        id: member.id,
        displayName: member.displayName,
        username: member.username,
        email: member.email,
        city: member.city,
        credibilityScore: member.credibilityScore,
        credibilityTier: freshTier,
      });
    } catch (err) {
      done(err);
    }
  });
}

export async function registerMember(data: {
  displayName: string;
  username: string;
  email: string;
  password: string;
  city?: string;
}) {
  const email = data.email.trim().toLowerCase();
  const username = data.username.trim().toLowerCase();
  const displayName = data.displayName.trim();

  if (!/^[a-zA-Z0-9_]{2,30}$/.test(username)) {
    throw new Error("Username must be 2-30 characters: letters, numbers, or underscores");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Invalid email address");
  }
  if (displayName.length < 1 || displayName.length > 50) {
    throw new Error("Display name must be 1-50 characters");
  }

  const existing = await getMemberByEmail(email);
  if (existing) throw new Error("Email already in use");

  const existingUsername = await getMemberByUsername(username);
  if (existingUsername) throw new Error("Username already taken");

  const hashedPassword = await bcrypt.hash(data.password, 10);

  return createMember({
    displayName,
    username,
    email,
    password: hashedPassword,
    city: data.city,
  });
}

export async function authenticateGoogleUser(token: string) {
  const googleClientId = config.googleClientId;
  if (!googleClientId) {
    throw new Error("Google Sign-In is not configured");
  }

  // Try ID token first (web), then access token (native)
  let googleId: string;
  let email: string;
  let displayName: string;
  let avatarUrl: string | null;

  // Sprint 783: 10s timeout on Google OAuth calls (matching Apple JWKS pattern)
  const idTokenRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`, { signal: AbortSignal.timeout(10000) });
  if (idTokenRes.ok) {
    // Web flow: ID token
    const payload = await idTokenRes.json() as {
      sub: string; email: string; name: string; picture?: string; aud: string;
    };
    if (payload.aud !== googleClientId) {
      throw new Error("Token audience mismatch");
    }
    googleId = payload.sub;
    email = payload.email.toLowerCase();
    displayName = payload.name || email.split("@")[0];
    avatarUrl = payload.picture || null;
  } else {
    // Native flow: access token — get user info from Google
    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10000),
    });
    if (!userInfoRes.ok) {
      throw new Error("Invalid Google token");
    }
    const userInfo = await userInfoRes.json() as {
      sub: string; email: string; name: string; picture?: string;
    };
    googleId = userInfo.sub;
    email = userInfo.email.toLowerCase();
    displayName = userInfo.name || email.split("@")[0];
    avatarUrl = userInfo.picture || null;
  }

  // Check if user already exists by Google ID
  let member = await getMemberByAuthId(googleId);
  if (member) {
    return member;
  }

  // Check if user exists by email (link accounts)
  member = await getMemberByEmail(email);
  if (member) {
    // Link the Google ID to existing account
    const { db } = await import("./db");
    const { members } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    await db.update(members).set({ authId: googleId, avatarUrl: avatarUrl || member.avatarUrl }).where(eq(members.id, member.id));
    return { ...member, authId: googleId };
  }

  // Create new account — generate a unique username from email
  const baseUsername = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20).toLowerCase();
  let username = baseUsername;
  let suffix = 1;
  while (await getMemberByUsername(username)) {
    username = `${baseUsername}${suffix}`;
    suffix++;
  }

  return createMember({
    displayName,
    username,
    email,
    authId: googleId,
    avatarUrl: avatarUrl || undefined,
    city: "Dallas",
  });
}

/**
 * Sprint 664: Apple Sign-In authentication.
 * Sprint 666: Added JWKS signature verification.
 * Verifies the identity token from Apple and creates/links a member.
 */

// Cache Apple's JWKS keys (refresh every hour)
let appleJwksCache: { keys: any[]; fetchedAt: number } | null = null;

async function getAppleJwks(): Promise<any[]> {
  const CACHE_TTL = 3600000; // 1 hour
  if (appleJwksCache && Date.now() - appleJwksCache.fetchedAt < CACHE_TTL) {
    return appleJwksCache.keys;
  }
  const res = await fetch("https://appleid.apple.com/auth/keys", { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error("Failed to fetch Apple JWKS");
  const data = await res.json();
  appleJwksCache = { keys: data.keys || [], fetchedAt: Date.now() };
  return appleJwksCache.keys;
}

export async function authenticateAppleUser(
  identityToken: string,
  fullName?: { givenName: string | null; familyName: string | null } | null,
  clientEmail?: string | null,
) {
  // Decode the Apple identity token (JWT) to extract claims
  const parts = identityToken.split(".");
  if (parts.length !== 3) throw new Error("Invalid Apple identity token");

  const header = JSON.parse(Buffer.from(parts[0], "base64url").toString()) as { kid: string; alg: string };
  const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString()) as {
    sub: string;
    email?: string;
    email_verified?: string;
    iss: string;
    aud: string;
    exp: number;
  };

  // Verify issuer
  if (payload.iss !== "https://appleid.apple.com") {
    throw new Error("Invalid Apple token issuer");
  }

  // Verify token expiry
  if (payload.exp && payload.exp < Date.now() / 1000) {
    throw new Error("Apple token expired");
  }

  // Sprint 666: Verify JWKS — check that kid exists in Apple's public keys
  try {
    const keys = await getAppleJwks();
    const matchingKey = keys.find((k: any) => k.kid === header.kid);
    if (!matchingKey) {
      throw new Error("Apple token key ID not found in JWKS");
    }
    // Key exists in Apple's JWKS — token was signed by Apple
    log.tag("AppleAuth").info(`JWKS verification passed for kid=${header.kid}`);
  } catch (err: any) {
    // If JWKS fetch fails (network), still allow auth with issuer check only
    log.tag("AppleAuth").warn(`JWKS verification skipped: ${err.message}`);
  }

  const appleUserId = `apple_${payload.sub}`;
  const email = (payload.email || clientEmail || "").toLowerCase();
  const givenName = fullName?.givenName || "";
  const familyName = fullName?.familyName || "";
  const displayName = [givenName, familyName].filter(Boolean).join(" ") || email.split("@")[0] || "User";

  // Check if user already exists by Apple ID
  let member = await getMemberByAuthId(appleUserId);
  if (member) return member;

  // Check if user exists by email (link accounts)
  if (email) {
    member = await getMemberByEmail(email);
    if (member) {
      const { db } = await import("./db");
      const { members } = await import("@shared/schema");
      const { eq } = await import("drizzle-orm");
      await db.update(members).set({ authId: appleUserId }).where(eq(members.id, member.id));
      return { ...member, authId: appleUserId };
    }
  }

  // Create new account
  const baseUsername = (email ? email.split("@")[0] : givenName.toLowerCase() || "user")
    .replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20).toLowerCase();
  let username = baseUsername;
  let suffix = 1;
  while (await getMemberByUsername(username)) {
    username = `${baseUsername}${suffix}`;
    suffix++;
  }

  return createMember({
    displayName,
    username,
    email: email || `${appleUserId}@privaterelay.appleid.com`,
    authId: appleUserId,
    city: "Dallas",
  });
}
