import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import passport from "passport";
import { setupAuth, registerMember } from "./auth";
import {
  getLeaderboard,
  getBusinessBySlug,
  getBusinessById,
  getBusinessRatings,
  submitRating,
  getMemberById,
  getMemberRatings,
  getActiveChallenges,
  calculateCredibilityScore,
  searchBusinesses,
  getAllCategories,
} from "./storage";
import { insertRatingSchema } from "@shared/schema";

function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const { displayName, username, email, password, city } = req.body;

      if (!displayName || !username || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      const member = await registerMember({ displayName, username, email, password, city });

      req.login(
        {
          id: member.id,
          displayName: member.displayName,
          username: member.username,
          email: member.email,
          city: member.city,
          credibilityScore: member.credibilityScore,
          credibilityTier: member.credibilityTier,
        },
        (err) => {
          if (err) return res.status(500).json({ error: "Login failed after signup" });
          return res.status(201).json({ data: req.user });
        },
      );
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.post("/api/auth/login", (req: Request, res: Response, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return res.status(500).json({ error: "Internal server error" });
      if (!user) return res.status(401).json({ error: info?.message || "Invalid credentials" });

      req.login(user, (loginErr) => {
        if (loginErr) return res.status(500).json({ error: "Login failed" });
        return res.json({ data: user });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ error: "Logout failed" });
      return res.json({ data: { message: "Logged out" } });
    });
  });

  app.get("/api/auth/me", (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.json({ data: null });
    }
    return res.json({ data: req.user });
  });

  app.get("/api/leaderboard", async (req: Request, res: Response) => {
    try {
      const city = (req.query.city as string) || "Dallas";
      const category = (req.query.category as string) || "restaurant";
      const limit = parseInt(req.query.limit as string) || 10;

      const data = await getLeaderboard(city, category, limit);
      return res.json({ data });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/leaderboard/categories", async (req: Request, res: Response) => {
    try {
      const city = (req.query.city as string) || "Dallas";
      const data = await getAllCategories(city);
      return res.json({ data });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/businesses/search", async (req: Request, res: Response) => {
    try {
      const query = (req.query.q as string) || "";
      const city = (req.query.city as string) || "Dallas";
      const category = req.query.category as string | undefined;
      const data = await searchBusinesses(query, city, category);
      return res.json({ data });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/businesses/:slug", async (req: Request, res: Response) => {
    try {
      const business = await getBusinessBySlug(req.params.slug);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }

      const { ratings } = await getBusinessRatings(business.id, 1, 20);

      return res.json({ data: { ...business, recentRatings: ratings } });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/businesses/:id/ratings", async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.per_page as string) || 20;
      const data = await getBusinessRatings(req.params.id, page, perPage);
      return res.json({ data });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/ratings", requireAuth, async (req: Request, res: Response) => {
    try {
      const parsed = insertRatingSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }

      const memberId = req.user!.id;
      const member = await getMemberById(memberId);
      if (!member) {
        return res.status(401).json({ error: "Member not found" });
      }

      const daysActive = Math.floor(
        (Date.now() - new Date(member.joinedAt).getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysActive < 7) {
        return res.status(403).json({ error: "Account must be at least 7 days old to rate" });
      }

      const result = await submitRating(memberId, parsed.data);
      return res.status(201).json({ data: result });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  app.get("/api/members/me", requireAuth, async (req: Request, res: Response) => {
    try {
      const member = await getMemberById(req.user!.id);
      if (!member) return res.status(404).json({ error: "Member not found" });

      const { score, breakdown } = await calculateCredibilityScore(member.id);
      const { ratings, total } = await getMemberRatings(member.id);

      const daysActive = Math.floor(
        (Date.now() - new Date(member.joinedAt).getTime()) / (1000 * 60 * 60 * 24),
      );

      return res.json({
        data: {
          id: member.id,
          displayName: member.displayName,
          username: member.username,
          email: member.email,
          city: member.city,
          credibilityScore: score,
          credibilityTier: member.credibilityTier,
          totalRatings: member.totalRatings,
          totalCategories: member.totalCategories,
          isFoundingMember: member.isFoundingMember,
          joinedAt: member.joinedAt,
          daysActive,
          credibilityBreakdown: breakdown,
          ratingHistory: ratings,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/members/:username", async (req: Request, res: Response) => {
    try {
      const { getMemberByUsername } = await import("./storage");
      const member = await getMemberByUsername(req.params.username);
      if (!member) return res.status(404).json({ error: "Member not found" });

      return res.json({
        data: {
          displayName: member.displayName,
          username: member.username,
          credibilityTier: member.credibilityTier,
          totalRatings: member.totalRatings,
          joinedAt: member.joinedAt,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/challengers/active", async (req: Request, res: Response) => {
    try {
      const city = (req.query.city as string) || "Dallas";
      const category = req.query.category as string | undefined;
      const data = await getActiveChallenges(city, category);
      return res.json({ data });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
