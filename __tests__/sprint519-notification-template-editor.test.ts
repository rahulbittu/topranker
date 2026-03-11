/**
 * Sprint 519: Admin Notification Template Editor
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 519: Notification Template Editor", () => {
  describe("server/notification-templates.ts — template management", () => {
    const src = readFile("server/notification-templates.ts");

    it("exports NotificationTemplate interface", () => {
      expect(src).toContain("export interface NotificationTemplate");
    });

    it("NotificationTemplate has required fields", () => {
      expect(src).toContain("id: string");
      expect(src).toContain("name: string");
      expect(src).toContain("category: string");
      expect(src).toContain("title: string");
      expect(src).toContain("body: string");
      expect(src).toContain("variables: string[]");
      expect(src).toContain("active: boolean");
    });

    it("exports CreateTemplateInput interface", () => {
      expect(src).toContain("export interface CreateTemplateInput");
    });

    it("defines SUPPORTED_VARIABLES including key placeholders", () => {
      expect(src).toContain("SUPPORTED_VARIABLES");
      expect(src).toContain('"firstName"');
      expect(src).toContain('"city"');
      expect(src).toContain('"business"');
      expect(src).toContain('"emoji"');
    });

    it("has detectVariables function", () => {
      expect(src).toContain("function detectVariables");
    });

    it("exports createTemplate function", () => {
      expect(src).toContain("export function createTemplate");
    });

    it("exports updateTemplate function", () => {
      expect(src).toContain("export function updateTemplate");
    });

    it("exports deleteTemplate function", () => {
      expect(src).toContain("export function deleteTemplate");
    });

    it("exports getTemplate function", () => {
      expect(src).toContain("export function getTemplate");
    });

    it("exports listTemplates function", () => {
      expect(src).toContain("export function listTemplates");
    });

    it("exports listTemplatesByCategory function", () => {
      expect(src).toContain("export function listTemplatesByCategory");
    });

    it("exports getActiveTemplateForCategory function", () => {
      expect(src).toContain("export function getActiveTemplateForCategory");
    });

    it("exports applyTemplate function with variable replacement", () => {
      expect(src).toContain("export function applyTemplate");
      expect(src).toContain("replaceAll(placeholder, val)");
    });

    it("exports getSupportedVariables function", () => {
      expect(src).toContain("export function getSupportedVariables");
    });

    it("createTemplate prevents duplicate IDs", () => {
      expect(src).toContain("templates.has(input.id)");
    });

    it("updateTemplate auto-detects variables", () => {
      expect(src).toContain("detectVariables(");
    });

    it("stays under 160 LOC", () => {
      const lines = src.split("\n").length;
      expect(lines).toBeLessThan(160);
    });
  });

  describe("server/routes-admin-push-templates.ts — CRUD endpoints", () => {
    const src = readFile("server/routes-admin-push-templates.ts");

    it("exports registerAdminPushTemplateRoutes", () => {
      expect(src).toContain("export function registerAdminPushTemplateRoutes");
    });

    it("has GET /api/admin/notification-templates endpoint", () => {
      expect(src).toContain('"/api/admin/notification-templates"');
    });

    it("supports category filter via query param", () => {
      expect(src).toContain("req.query.category");
      expect(src).toContain("listTemplatesByCategory");
    });

    it("has GET /api/admin/notification-templates/variables endpoint", () => {
      expect(src).toContain("/api/admin/notification-templates/variables");
      expect(src).toContain("getSupportedVariables");
    });

    it("has GET /api/admin/notification-templates/:id endpoint", () => {
      expect(src).toContain("/api/admin/notification-templates/:id");
      expect(src).toContain("getTemplate(req.params.id)");
    });

    it("has POST endpoint for creating templates", () => {
      expect(src).toContain('app.post("/api/admin/notification-templates"');
      expect(src).toContain("createTemplate");
    });

    it("validates required fields on create", () => {
      expect(src).toContain("!id || !name || !category || !title || !body");
    });

    it("has PUT endpoint for updating templates", () => {
      expect(src).toContain('app.put("/api/admin/notification-templates/:id"');
      expect(src).toContain("updateTemplate");
    });

    it("has DELETE endpoint for removing templates", () => {
      expect(src).toContain('app.delete("/api/admin/notification-templates/:id"');
      expect(src).toContain("deleteTemplate");
    });

    it("all endpoints require admin auth", () => {
      expect(src).toContain("requireAuth, requireAdmin");
    });
  });

  // Sprint 524: Admin functions extracted to api-admin.ts
  describe("lib/api-admin.ts — template client API", () => {
    const src = readFile("lib/api-admin.ts");

    it("defines NotificationTemplate interface", () => {
      expect(src).toContain("export interface NotificationTemplate");
    });

    it("NotificationTemplate has variables array", () => {
      expect(src).toContain("variables: string[]");
    });

    it("exports fetchNotificationTemplates", () => {
      expect(src).toContain("export async function fetchNotificationTemplates");
      expect(src).toContain("/api/admin/notification-templates");
    });

    it("fetchNotificationTemplates supports category filter", () => {
      expect(src).toContain("?category=");
    });

    it("exports fetchTemplateVariables", () => {
      expect(src).toContain("export async function fetchTemplateVariables");
      expect(src).toContain("/api/admin/notification-templates/variables");
    });

    it("exports createNotificationTemplate", () => {
      expect(src).toContain("export async function createNotificationTemplate");
    });

    it("exports updateNotificationTemplate", () => {
      expect(src).toContain("export async function updateNotificationTemplate");
    });

    it("exports deleteNotificationTemplate", () => {
      expect(src).toContain("export async function deleteNotificationTemplate");
    });
  });

  describe("server/routes.ts — route registration", () => {
    const routesSrc = readFile("server/routes.ts");
    const adminSrc = readFile("server/routes-admin.ts");

    it("routes.ts delegates to registerAllAdminRoutes", () => {
      expect(routesSrc).toContain("registerAllAdminRoutes(app)");
    });

    it("admin routes imports registerAdminPushTemplateRoutes", () => {
      expect(adminSrc).toContain("registerAdminPushTemplateRoutes");
      expect(adminSrc).toContain("routes-admin-push-templates");
    });

    it("admin routes calls registerAdminPushTemplateRoutes(app)", () => {
      expect(adminSrc).toContain("registerAdminPushTemplateRoutes(app)");
    });
  });
});
