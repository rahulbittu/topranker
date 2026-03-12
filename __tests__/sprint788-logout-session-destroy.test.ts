/**
 * Sprint 788: Logout Session Destroy
 *
 * Logout now destroys the server-side session and clears the cookie,
 * preventing session reuse after logout.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 788: Logout Session Destroy", () => {
  const src = readFile("server/routes-auth.ts");

  describe("logout endpoint", () => {
    const logoutBlock = src.slice(
      src.indexOf('app.post("/api/auth/logout"'),
      src.indexOf('app.post("/api/auth/logout"') + 400
    );

    it("calls req.logout", () => {
      expect(logoutBlock).toContain("req.logout(");
    });

    it("destroys session after logout", () => {
      expect(logoutBlock).toContain("req.session.destroy(");
    });

    it("clears session cookie", () => {
      expect(logoutBlock).toContain('res.clearCookie("connect.sid")');
    });

    it("handles destroy errors gracefully", () => {
      expect(logoutBlock).toContain("destroyErr");
      expect(logoutBlock).toContain("log.warn");
    });
  });

  describe("file health", () => {
    const thresholds = JSON.parse(readFile("shared/thresholds.json"));

    it("tracks 34 files", () => {
      expect(Object.keys(thresholds.files).length).toBe(34);
    });

    it("build under 750kb", () => {
      const buildSrc = readFile("server_dist/index.js");
      expect(buildSrc.length / 1024).toBeLessThan(750);
    });
  });
});
