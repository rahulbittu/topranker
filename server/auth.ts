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

export async function authenticateGoogleUser(idToken: string) {
  const googleClientId = config.googleClientId;
  if (!googleClientId) {
    throw new Error("Google Sign-In is not configured");
  }

  // Verify the ID token with Google
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
  if (!res.ok) {
    throw new Error("Invalid Google token");
  }
  const payload = await res.json() as {
    sub: string;
    email: string;
    email_verified: string;
    name: string;
    picture?: string;
    aud: string;
  };

  if (payload.aud !== googleClientId) {
    throw new Error("Token audience mismatch");
  }

  const googleId = payload.sub;
  const email = payload.email.toLowerCase();
  const displayName = payload.name || email.split("@")[0];
  const avatarUrl = payload.picture || null;

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
