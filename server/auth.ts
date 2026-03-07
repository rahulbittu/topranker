import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { getMemberByEmail, getMemberById, createMember, getMemberByUsername } from "./storage";
import bcrypt from "bcrypt";
import type { Express, Request } from "express";

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
      secret: process.env.SESSION_SECRET || "top-ranker-secret-key",
      resave: false,
      saveUninitialized: false,
      proxy: process.env.NODE_ENV === "production",
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
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
      done(null, {
        id: member.id,
        displayName: member.displayName,
        username: member.username,
        email: member.email,
        city: member.city,
        credibilityScore: member.credibilityScore,
        credibilityTier: member.credibilityTier,
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
