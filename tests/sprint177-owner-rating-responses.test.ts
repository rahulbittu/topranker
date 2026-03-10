/**
 * Sprint 177 — getRatingById helper
 *
 * Note: Rating response features (schema, storage, API, access control, push)
 * were removed in Sprint 336 as anti-requirement violations per Rating Integrity
 * System Part 10. Only the getRatingById helper test is retained.
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// getRatingById helper
// ---------------------------------------------------------------------------
describe("getRatingById — ratings storage", () => {
  const ratingsSrc = readFile("server/storage/ratings.ts");

  it("exports getRatingById", () => {
    expect(ratingsSrc).toContain("export async function getRatingById");
  });

  it("queries by rating ID", () => {
    expect(ratingsSrc).toContain("eq(ratings.id, id)");
  });
});
