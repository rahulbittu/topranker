/**
 * Sprint 158 — Challenger SSE broadcast tests
 *
 * Verifies:
 * 1. challenger_updated broadcast exists in rating submission flow
 * 2. SSE invalidation map handles challenger_updated event
 * 3. updateChallengerVotes is called after every rating
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Challenger real-time broadcast", () => {
  const routesSrc = fs.readFileSync(
    path.resolve(__dirname, "../server/routes.ts"),
    "utf-8"
  );
  const realtimeSrc = fs.readFileSync(
    path.resolve(__dirname, "../lib/use-realtime.ts"),
    "utf-8"
  );
  const ratingsSrc = fs.readFileSync(
    path.resolve(__dirname, "../server/storage/ratings.ts"),
    "utf-8"
  );

  it("broadcasts challenger_updated after rating submission", () => {
    // Find the POST /api/ratings handler
    const ratingBlock = routesSrc.slice(
      routesSrc.indexOf('app.post("/api/ratings"'),
      routesSrc.indexOf('app.post("/api/ratings"') + 2000
    );
    expect(ratingBlock).toContain('broadcast("challenger_updated"');
  });

  it("broadcasts all three events: rating_submitted, ranking_updated, challenger_updated", () => {
    const ratingBlock = routesSrc.slice(
      routesSrc.indexOf('app.post("/api/ratings"'),
      routesSrc.indexOf('app.post("/api/ratings"') + 2000
    );
    expect(ratingBlock).toContain('broadcast("rating_submitted"');
    expect(ratingBlock).toContain('broadcast("ranking_updated"');
    expect(ratingBlock).toContain('broadcast("challenger_updated"');
  });

  it("SSE invalidation map handles challenger_updated", () => {
    const mapBlock = realtimeSrc.match(/INVALIDATION_MAP[\s\S]*?};/)![0];
    expect(mapBlock).toContain("challenger_updated");
    const line = mapBlock.split("\n").find(l => l.includes("challenger_updated"));
    expect(line).toContain('"challengers"');
  });

  it("updateChallengerVotes is called in submitRating flow", () => {
    expect(ratingsSrc).toContain("updateChallengerVotes");
  });

  it("rating_submitted also invalidates challengers for double coverage", () => {
    const mapBlock = realtimeSrc.match(/INVALIDATION_MAP[\s\S]*?};/)![0];
    const ratingLine = mapBlock.split("\n").find(l => l.includes("rating_submitted"));
    expect(ratingLine).toContain('"challengers"');
  });
});
