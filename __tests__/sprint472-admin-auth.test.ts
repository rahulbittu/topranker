/**
 * Sprint 472: Admin Auth Middleware for Enrichment Endpoints
 *
 * Tests that all 6 enrichment endpoints have requireAuth + requireAdmin middleware.
 * This resolves the 4-cycle critique item (flagged in Sprints 456, 461, 466, 470).
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Sprint 472: Admin Auth Middleware for Enrichment", () => {
  describe("routes-admin-enrichment.ts (dashboard routes)", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../server/routes-admin-enrichment.ts"),
      "utf-8"
    );

    it("imports requireAuth from middleware", () => {
      expect(src).toContain('import { requireAuth } from "./middleware"');
    });

    it("imports isAdminEmail from shared/admin", () => {
      expect(src).toContain('import { isAdminEmail } from "@shared/admin"');
    });

    it("defines requireAdmin middleware function", () => {
      expect(src).toContain("function requireAdmin(req: Request, res: Response, next: Function)");
      expect(src).toContain("isAdminEmail(req.user?.email)");
      expect(src).toContain('status(403)');
    });

    it("dashboard endpoint has requireAuth + requireAdmin", () => {
      expect(src).toContain('/api/admin/enrichment/dashboard", requireAuth, requireAdmin');
    });

    it("hours-gaps endpoint has requireAuth + requireAdmin", () => {
      expect(src).toContain('/api/admin/enrichment/hours-gaps", requireAuth, requireAdmin');
    });

    it("dietary-gaps endpoint has requireAuth + requireAdmin", () => {
      expect(src).toContain('/api/admin/enrichment/dietary-gaps", requireAuth, requireAdmin');
    });

    it("all 3 GET endpoints are protected", () => {
      const getRoutes = src.match(/app\.get\(/g);
      const protectedRoutes = src.match(/app\.get\([^,]+, requireAuth, requireAdmin/g);
      expect(getRoutes?.length).toBe(3);
      expect(protectedRoutes?.length).toBe(3);
    });
  });

  describe("routes-admin-enrichment-bulk.ts (bulk routes)", () => {
    const src = fs.readFileSync(
      path.resolve(__dirname, "../server/routes-admin-enrichment-bulk.ts"),
      "utf-8"
    );

    it("imports requireAuth from middleware", () => {
      expect(src).toContain('import { requireAuth } from "./middleware"');
    });

    it("imports isAdminEmail from shared/admin", () => {
      expect(src).toContain('import { isAdminEmail } from "@shared/admin"');
    });

    it("defines requireAdmin middleware function", () => {
      expect(src).toContain("function requireAdmin(req: Request, res: Response, next: Function)");
      expect(src).toContain("isAdminEmail(req.user?.email)");
    });

    it("bulk-dietary endpoint has requireAuth + requireAdmin", () => {
      expect(src).toContain('/api/admin/enrichment/bulk-dietary", requireAuth, requireAdmin');
    });

    it("bulk-dietary-by-cuisine endpoint has requireAuth + requireAdmin", () => {
      expect(src).toContain('/api/admin/enrichment/bulk-dietary-by-cuisine", requireAuth, requireAdmin');
    });

    it("bulk-hours endpoint has requireAuth + requireAdmin", () => {
      expect(src).toContain('/api/admin/enrichment/bulk-hours", requireAuth, requireAdmin');
    });

    it("all 3 POST endpoints are protected", () => {
      const postRoutes = src.match(/app\.post\(/g);
      const protectedRoutes = src.match(/app\.post\([^,]+, requireAuth, requireAdmin/g);
      expect(postRoutes?.length).toBe(3);
      expect(protectedRoutes?.length).toBe(3);
    });
  });

  describe("Auth pattern consistency", () => {
    const dashSrc = fs.readFileSync(
      path.resolve(__dirname, "../server/routes-admin-enrichment.ts"),
      "utf-8"
    );
    const bulkSrc = fs.readFileSync(
      path.resolve(__dirname, "../server/routes-admin-enrichment-bulk.ts"),
      "utf-8"
    );

    it("both files use same isAdminEmail check pattern", () => {
      expect(dashSrc).toContain("isAdminEmail(req.user?.email)");
      expect(bulkSrc).toContain("isAdminEmail(req.user?.email)");
    });

    it("both files return 403 for non-admin access", () => {
      expect(dashSrc).toContain('status(403)');
      expect(bulkSrc).toContain('status(403)');
    });

    it("both files return 'Admin access required' error message", () => {
      expect(dashSrc).toContain("Admin access required");
      expect(bulkSrc).toContain("Admin access required");
    });

    it("middleware module exports requireAuth", () => {
      const middlewareSrc = fs.readFileSync(
        path.resolve(__dirname, "../server/middleware.ts"),
        "utf-8"
      );
      expect(middlewareSrc).toContain("export function requireAuth");
    });

    it("shared/admin exports isAdminEmail", () => {
      const adminSrc = fs.readFileSync(
        path.resolve(__dirname, "../shared/admin.ts"),
        "utf-8"
      );
      expect(adminSrc).toContain("isAdminEmail");
    });
  });
});
