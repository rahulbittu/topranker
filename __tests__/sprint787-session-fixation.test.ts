/**
 * Sprint 787: Session Fixation Prevention
 *
 * All auth login endpoints now regenerate the session ID before
 * establishing the authenticated session, preventing session fixation attacks.
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function readFile(rel: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), rel), "utf-8");
}

describe("Sprint 787: Session Fixation Prevention", () => {
  const src = readFile("server/routes-auth.ts");

  describe("safeLogin helper", () => {
    it("defines safeLogin function", () => {
      expect(src).toContain("function safeLogin(req: Request, user: Express.User");
    });

    it("calls session.regenerate before login", () => {
      expect(src).toContain("req.session.regenerate");
    });

    it("calls req.login inside regenerate callback", () => {
      // Verify that req.login is called within safeLogin
      const safeLoginBlock = src.slice(
        src.indexOf("function safeLogin"),
        src.indexOf("function safeLogin") + 300
      );
      expect(safeLoginBlock).toContain("req.session.regenerate");
      expect(safeLoginBlock).toContain("req.login(user, callback)");
    });
  });

  describe("all login paths use safeLogin", () => {
    it("signup uses safeLogin", () => {
      const signupBlock = src.slice(
        src.indexOf('app.post("/api/auth/signup"'),
        src.indexOf('app.post("/api/auth/login"')
      );
      expect(signupBlock).toContain("safeLogin(req,");
    });

    it("login uses safeLogin", () => {
      const loginBlock = src.slice(
        src.indexOf('app.post("/api/auth/login"'),
        src.indexOf('app.post("/api/auth/google"')
      );
      expect(loginBlock).toContain("safeLogin(req,");
    });

    it("google auth uses safeLogin", () => {
      const googleBlock = src.slice(
        src.indexOf('app.post("/api/auth/google"'),
        src.indexOf('app.post("/api/auth/apple"')
      );
      expect(googleBlock).toContain("safeLogin(req,");
    });

    it("apple auth uses safeLogin", () => {
      const appleBlock = src.slice(
        src.indexOf('app.post("/api/auth/apple"'),
        src.indexOf('app.post("/api/auth/apple"') + 500
      );
      expect(appleBlock).toContain("safeLogin(req,");
    });
  });

  describe("no direct req.login outside safeLogin", () => {
    it("only safeLogin calls req.login directly", () => {
      const lines = src.split("\n");
      const directLoginLines = lines.filter(
        (l) => l.includes("req.login(") && !l.includes("function safeLogin")
      );
      // Only the one inside safeLogin itself
      expect(directLoginLines.length).toBe(1);
      expect(directLoginLines[0].trim()).toBe("req.login(user, callback);");
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
