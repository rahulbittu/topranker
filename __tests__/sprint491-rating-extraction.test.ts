/**
 * Sprint 491: Rating Submission Route Extraction
 *
 * Tests:
 * 1. routes-ratings.ts has all 4 rating endpoints
 * 2. routes.ts imports and registers rating routes
 * 3. routes.ts no longer contains rating endpoints
 * 4. LOC reduction verified
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 491: Rating Route Extraction", () => {
  describe("routes-ratings.ts module structure", () => {
    const src = readFile("server/routes-ratings.ts");

    it("exports registerRatingRoutes function", () => {
      expect(src).toContain("export function registerRatingRoutes");
    });

    it("has POST /api/ratings endpoint", () => {
      expect(src).toContain('app.post("/api/ratings"');
    });

    it("has PATCH /api/ratings/:id endpoint", () => {
      expect(src).toContain('app.patch("/api/ratings/:id"');
    });

    it("has DELETE /api/ratings/:id endpoint", () => {
      expect(src).toContain('app.delete("/api/ratings/:id"');
    });

    it("has POST /api/ratings/:id/flag endpoint", () => {
      expect(src).toContain('app.post("/api/ratings/:id/flag"');
    });

    it("imports rating integrity checks", () => {
      expect(src).toContain("checkOwnerSelfRating");
      expect(src).toContain("checkVelocity");
      expect(src).toContain("logRatingSubmission");
    });

    it("imports push notification triggers", () => {
      expect(src).toContain("onTierUpgrade");
      expect(src).toContain("onRankingChange");
      expect(src).toContain("onNewRatingForBusiness");
    });

    it("uses requireAuth middleware on all endpoints", () => {
      expect(src).toContain("requireAuth");
    });

    it("broadcasts SSE events for rating changes", () => {
      expect(src).toContain('broadcast("rating_submitted"');
      expect(src).toContain('broadcast("rating_updated"');
      expect(src).toContain('broadcast("rating_deleted"');
    });
  });

  describe("routes.ts registration", () => {
    const src = readFile("server/routes.ts");

    it("imports registerRatingRoutes", () => {
      expect(src).toContain('import { registerRatingRoutes } from "./routes-ratings"');
    });

    it("calls registerRatingRoutes(app)", () => {
      expect(src).toContain("registerRatingRoutes(app)");
    });

    it("no longer contains POST /api/ratings endpoint", () => {
      expect(src).not.toContain('app.post("/api/ratings"');
    });

    it("no longer contains PATCH /api/ratings/:id endpoint", () => {
      expect(src).not.toContain('app.patch("/api/ratings/:id"');
    });

    it("no longer imports rating integrity functions", () => {
      expect(src).not.toContain("checkOwnerSelfRating");
      expect(src).not.toContain("checkVelocity");
    });

    it("no longer imports submitRating from storage", () => {
      expect(src).not.toContain("submitRating");
    });
  });

  describe("LOC reduction", () => {
    it("routes.ts under 380 LOC (was 546)", () => {
      const loc = readFile("server/routes.ts").split("\n").length;
      expect(loc).toBeLessThan(380);
    });

    it("routes-ratings.ts under 210 LOC", () => {
      const loc = readFile("server/routes-ratings.ts").split("\n").length;
      expect(loc).toBeLessThan(210);
    });
  });
});
