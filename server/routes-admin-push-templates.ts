/**
 * Sprint 519: Admin push notification template endpoints.
 *
 * CRUD for push notification templates + variable reference.
 * All routes require authentication + admin role.
 */

import type { Express, Request, Response } from "express";
import { wrapAsync } from "./wrap-async";
import { requireAuth } from "./middleware";
import {
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getTemplate,
  listTemplates,
  listTemplatesByCategory,
  getSupportedVariables,
} from "./notification-templates";

function requireAdmin(req: Request, res: Response, next: Function) {
  if (!req.user || (req.user as any).role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

export function registerAdminPushTemplateRoutes(app: Express) {
  // List all push templates (optional ?category= filter)
  app.get("/api/admin/notification-templates", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
    const category = req.query.category as string | undefined;
    const data = category ? listTemplatesByCategory(category) : listTemplates();
    return res.json({ data });
  }));

  // Get supported variables reference
  app.get("/api/admin/notification-templates/variables", requireAuth, requireAdmin, wrapAsync(async (_req: Request, res: Response) => {
    return res.json({ data: getSupportedVariables() });
  }));

  // Get single template
  app.get("/api/admin/notification-templates/:id", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
    const template = getTemplate(req.params.id);
    if (!template) return res.status(404).json({ error: "Template not found" });
    return res.json({ data: template });
  }));

  // Create push template
  app.post("/api/admin/notification-templates", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
    const { id, name, category, title, body } = req.body;
    if (!id || !name || !category || !title || !body) {
      return res.status(400).json({ error: "id, name, category, title, and body are required" });
    }
    const template = createTemplate({ id, name, category, title, body });
    if (!template) return res.status(409).json({ error: "Template already exists" });
    return res.json({ data: template });
  }));

  // Update push template
  app.put("/api/admin/notification-templates/:id", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
    const { name, category, title, body, active } = req.body;
    const template = updateTemplate(req.params.id, { name, category, title, body, active });
    if (!template) return res.status(404).json({ error: "Template not found" });
    return res.json({ data: template });
  }));

  // Delete push template
  app.delete("/api/admin/notification-templates/:id", requireAuth, requireAdmin, wrapAsync(async (req: Request, res: Response) => {
    const deleted = deleteTemplate(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Template not found" });
    return res.json({ data: { deleted: true } });
  }));
}
