/**
 * Sprint 288 — Cuisine Types + Mock Data Update
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) =>
  fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 288: ApiBusiness type includes cuisine", () => {
  const api = readFile("lib/api.ts");
  const mappers = readFile("lib/api-mappers.ts");

  it("ApiBusiness has cuisine field", () => {
    expect(api).toContain("cuisine: string | null");
  });

  it("mapApiBusiness passes cuisine through", () => {
    expect(mappers).toContain("cuisine: biz.cuisine");
  });
});

describe("Sprint 288: MappedBusiness type includes cuisine", () => {
  const types = readFile("types/business.ts");

  it("MappedBusiness has cuisine field", () => {
    expect(types).toContain("cuisine");
  });
});

describe("Sprint 288: Mock data has cuisine field", () => {
  const mock = readFile("lib/mock-data.ts");

  it("mock businesses have cuisine field", () => {
    expect(mock).toContain('cuisine: "american"');
    expect(mock).toContain('cuisine: "japanese"');
    expect(mock).toContain('cuisine: "italian"');
    expect(mock).toContain('cuisine: "vietnamese"');
  });

  it("all 10 mock businesses have cuisine", () => {
    const cuisineMatches = mock.match(/cuisine: "/g);
    expect(cuisineMatches!.length).toBeGreaterThanOrEqual(10);
  });
});
