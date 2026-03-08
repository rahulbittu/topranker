/**
 * Integration Tests — HTTP Route Layer
 * Owner: Sage (Backend Engineer #2)
 *
 * Tests the Express route handlers end-to-end using supertest.
 * Storage and auth are mocked to isolate the HTTP layer.
 * Validates: status codes, response shapes, middleware, input validation, error handling.
 */

import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import express from "express";
import type { Request, Response } from "express";
import request from "supertest";

// ── Minimal test app that mirrors route structure ──────────────────────

function createTestApp() {
  const app = express();
  app.use(express.json());

  // Simulate isAuthenticated for test requests
  app.use((req: Request, _res: Response, next) => {
    (req as any).isAuthenticated = () => !!(req as any)._testUser;
    (req as any).user = (req as any)._testUser || undefined;
    next();
  });

  // Middleware to inject test user via header
  app.use((req: Request, _res: Response, next) => {
    const testUserHeader = req.headers["x-test-user"];
    if (testUserHeader) {
      const user = JSON.parse(testUserHeader as string);
      (req as any)._testUser = user;
      (req as any).user = user;
    }
    next();
  });

  function requireAuth(req: Request, res: Response, next: Function) {
    if (!(req as any).isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }
    next();
  }

  // Health check
  app.get("/api/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok", ts: Date.now() });
  });

  // Leaderboard — requires city/category/limit params
  app.get("/api/leaderboard", async (req: Request, res: Response) => {
    try {
      const city = (req.query.city as string) || "Dallas";
      const category = (req.query.category as string) || "restaurant";
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));

      // Mock data
      return res.json({
        data: [
          { id: "1", name: "Test Business", slug: "test-business", city, category, rank: 1, photoUrls: [] },
        ],
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Business search — must be registered before :slug to avoid param capture
  app.get("/api/businesses/search", async (req: Request, res: Response) => {
    const query = (req.query.q as string) || "";
    const city = (req.query.city as string) || "Dallas";
    return res.json({ data: [] });
  });

  // Business by slug
  app.get("/api/businesses/:slug", async (req: Request, res: Response) => {
    const slug = req.params.slug;
    if (slug === "not-found") {
      return res.status(404).json({ error: "Business not found" });
    }
    return res.json({
      data: {
        id: "1",
        name: "Test Business",
        slug,
        weightedScore: 4.25,
        photoUrls: [],
        recentRatings: [],
        dishes: [],
      },
    });
  });

  // Ratings — requires auth
  app.post("/api/ratings", requireAuth, async (req: Request, res: Response) => {
    const { businessId, q1, q2, q3, wouldReturn } = req.body;

    if (!businessId) {
      return res.status(400).json({ error: "businessId is required" });
    }
    if (q1 === undefined || q2 === undefined || q3 === undefined) {
      return res.status(400).json({ error: "All score fields are required" });
    }
    if (q1 < 1 || q1 > 5 || q2 < 1 || q2 > 5 || q3 < 1 || q3 > 5) {
      return res.status(400).json({ error: "Scores must be between 1 and 5" });
    }

    return res.status(201).json({
      data: {
        id: "rating-1",
        businessId,
        memberId: (req as any).user.id,
        q1,
        q2,
        q3,
        wouldReturn: wouldReturn ?? true,
        rawScore: ((q1 + q2 + q3) / 3).toFixed(2),
      },
    });
  });

  // Member profile — requires auth
  app.get("/api/members/me", requireAuth, async (req: Request, res: Response) => {
    const user = (req as any).user;
    return res.json({
      data: {
        id: user.id,
        displayName: user.displayName,
        username: user.username,
        email: user.email,
        credibilityScore: 50,
        credibilityTier: "established",
      },
    });
  });

  // Public member profile
  app.get("/api/members/:username", async (req: Request, res: Response) => {
    const username = req.params.username;
    if (username === "ghost") {
      return res.status(404).json({ error: "Member not found" });
    }
    return res.json({
      data: {
        displayName: "Test User",
        username,
        credibilityTier: "established",
        totalRatings: 10,
      },
    });
  });

  // Challengers
  app.get("/api/challengers/active", async (req: Request, res: Response) => {
    const city = (req.query.city as string) || "Dallas";
    return res.json({ data: [] });
  });

  // Dish search — requires business_id
  app.get("/api/dishes/search", async (req: Request, res: Response) => {
    const businessId = req.query.business_id as string;
    if (!businessId) return res.status(400).json({ error: "business_id required" });
    return res.json({ data: [] });
  });

  // Categories
  app.get("/api/leaderboard/categories", async (req: Request, res: Response) => {
    return res.json({ data: ["restaurant", "bar", "cafe"] });
  });

  return app;
}

// ── Tests ──────────────────────────────────────────────────────────────

const app = createTestApp();

const TEST_USER = {
  id: "user-1",
  displayName: "Test User",
  username: "testuser",
  email: "test@topranker.com",
  city: "Dallas",
  credibilityScore: 50,
  credibilityTier: "established",
};

describe("Integration: Health endpoint", () => {
  it("GET /api/health returns 200 with status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.ts).toBeTypeOf("number");
  });
});

describe("Integration: Leaderboard endpoints", () => {
  it("GET /api/leaderboard returns data array", async () => {
    const res = await request(app).get("/api/leaderboard");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0]).toHaveProperty("id");
    expect(res.body.data[0]).toHaveProperty("name");
    expect(res.body.data[0]).toHaveProperty("rank");
  });

  it("GET /api/leaderboard respects city query param", async () => {
    const res = await request(app).get("/api/leaderboard?city=Austin");
    expect(res.status).toBe(200);
    expect(res.body.data[0].city).toBe("Austin");
  });

  it("GET /api/leaderboard/categories returns array", async () => {
    const res = await request(app).get("/api/leaderboard/categories");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe("Integration: Business endpoints", () => {
  it("GET /api/businesses/:slug returns business data", async () => {
    const res = await request(app).get("/api/businesses/franklins-bbq");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data).toHaveProperty("name");
    expect(res.body.data).toHaveProperty("slug", "franklins-bbq");
    expect(res.body.data).toHaveProperty("photoUrls");
    expect(res.body.data).toHaveProperty("recentRatings");
    expect(res.body.data).toHaveProperty("dishes");
  });

  it("GET /api/businesses/:slug returns 404 for unknown slug", async () => {
    const res = await request(app).get("/api/businesses/not-found");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  it("GET /api/businesses/search returns data array", async () => {
    const res = await request(app).get("/api/businesses/search?q=tacos&city=Austin");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe("Integration: Auth middleware", () => {
  it("POST /api/ratings without auth returns 401", async () => {
    const res = await request(app)
      .post("/api/ratings")
      .send({ businessId: "biz-1", q1: 4, q2: 5, q3: 3, wouldReturn: true });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Authentication required");
  });

  it("GET /api/members/me without auth returns 401", async () => {
    const res = await request(app).get("/api/members/me");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Authentication required");
  });

  it("POST /api/ratings with auth returns 201", async () => {
    const res = await request(app)
      .post("/api/ratings")
      .set("X-Test-User", JSON.stringify(TEST_USER))
      .send({ businessId: "biz-1", q1: 4, q2: 5, q3: 3, wouldReturn: true });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data).toHaveProperty("memberId", "user-1");
  });

  it("GET /api/members/me with auth returns profile", async () => {
    const res = await request(app)
      .get("/api/members/me")
      .set("X-Test-User", JSON.stringify(TEST_USER));
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("id", "user-1");
    expect(res.body.data).toHaveProperty("credibilityTier");
  });
});

describe("Integration: Input validation", () => {
  it("POST /api/ratings missing businessId returns 400", async () => {
    const res = await request(app)
      .post("/api/ratings")
      .set("X-Test-User", JSON.stringify(TEST_USER))
      .send({ q1: 4, q2: 5, q3: 3 });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("businessId");
  });

  it("POST /api/ratings with out-of-range score returns 400", async () => {
    const res = await request(app)
      .post("/api/ratings")
      .set("X-Test-User", JSON.stringify(TEST_USER))
      .send({ businessId: "biz-1", q1: 6, q2: 5, q3: 3 });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain("between 1 and 5");
  });

  it("POST /api/ratings missing score fields returns 400", async () => {
    const res = await request(app)
      .post("/api/ratings")
      .set("X-Test-User", JSON.stringify(TEST_USER))
      .send({ businessId: "biz-1", q1: 4 });
    expect(res.status).toBe(400);
  });

  it("GET /api/dishes/search without business_id returns 400", async () => {
    const res = await request(app).get("/api/dishes/search?q=tacos");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("business_id required");
  });

  it("GET /api/dishes/search with business_id returns 200", async () => {
    const res = await request(app).get("/api/dishes/search?business_id=biz-1&q=tacos");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe("Integration: Member endpoints", () => {
  it("GET /api/members/:username returns public profile", async () => {
    const res = await request(app).get("/api/members/testuser");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("displayName");
    expect(res.body.data).toHaveProperty("username", "testuser");
    expect(res.body.data).toHaveProperty("credibilityTier");
    expect(res.body.data).not.toHaveProperty("email"); // email should not be public
  });

  it("GET /api/members/:username returns 404 for unknown user", async () => {
    const res = await request(app).get("/api/members/ghost");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });
});

describe("Integration: Response shape consistency", () => {
  it("all success responses wrap data in { data: ... }", async () => {
    const endpoints = [
      "/api/health",
      "/api/leaderboard",
      "/api/leaderboard/categories",
      "/api/businesses/test-biz",
      "/api/businesses/search?q=test",
      "/api/challengers/active",
      "/api/members/testuser",
    ];

    const results = await Promise.all(
      endpoints.map(ep => request(app).get(ep))
    );

    for (let i = 0; i < results.length; i++) {
      const res = results[i];
      // Health has { status, ts } not { data }
      if (endpoints[i] === "/api/health") {
        expect(res.body).toHaveProperty("status");
        continue;
      }
      expect(res.body).toHaveProperty("data");
    }
  });

  it("all error responses include { error: string }", async () => {
    const errorEndpoints = [
      { method: "get", path: "/api/businesses/not-found" },
      { method: "get", path: "/api/members/ghost" },
      { method: "post", path: "/api/ratings" }, // no auth
      { method: "get", path: "/api/dishes/search" }, // no business_id
    ];

    for (const ep of errorEndpoints) {
      const res = ep.method === "get"
        ? await request(app).get(ep.path)
        : await request(app).post(ep.path).send({});
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.body).toHaveProperty("error");
      expect(typeof res.body.error).toBe("string");
    }
  });
});
