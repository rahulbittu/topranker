/**
 * Sprint 246: Admin Email Template Routes
 * Exposes CRUD, preview, and render endpoints for the email template builder.
 * Owner: Sarah Nakamura (Lead Eng)
 */

import { Router } from "express";
import { log } from "./logger";
import {
  getAllTemplates,
  getTemplate,
  createTemplate,
  previewTemplate,
  renderTemplate,
} from "./email-templates";

const adminTmplLog = log.tag("AdminTemplates");

export function registerAdminTemplateRoutes(app: Router): void {
  // List all templates
  app.get("/api/admin/templates", (_req, res) => {
    adminTmplLog.info("Fetching all email templates");
    res.json(getAllTemplates());
  });

  // Get single template by name
  app.get("/api/admin/templates/:name", (req, res) => {
    const { name } = req.params;
    adminTmplLog.info(`Fetching template: ${name}`);
    const tmpl = getTemplate(name);
    if (!tmpl) {
      res.status(404).json({ error: `Template '${name}' not found` });
      return;
    }
    res.json(tmpl);
  });

  // Create a new template
  app.post("/api/admin/templates", (req, res) => {
    const { name, subject, htmlBody, textBody, variables, category } = req.body;
    if (!name || !subject || !htmlBody || !textBody || !category) {
      res.status(400).json({ error: "Missing required fields: name, subject, htmlBody, textBody, category" });
      return;
    }
    adminTmplLog.info(`Creating template: ${name}`);
    const created = createTemplate({
      name,
      subject,
      htmlBody,
      textBody,
      variables: variables || [],
      category,
    });
    res.status(201).json(created);
  });

  // Preview a template with placeholder values
  app.get("/api/admin/templates/:name/preview", (req, res) => {
    const { name } = req.params;
    adminTmplLog.info(`Previewing template: ${name}`);
    const result = previewTemplate(name);
    if (!result) {
      res.status(404).json({ error: `Template '${name}' not found` });
      return;
    }
    res.json(result);
  });

  // Render a template with provided variables
  app.post("/api/admin/templates/:name/render", (req, res) => {
    const { name } = req.params;
    const vars = req.body.variables || req.body;
    adminTmplLog.info(`Rendering template: ${name}`, vars);
    const result = renderTemplate(name, vars);
    if (!result) {
      res.status(404).json({ error: `Template '${name}' not found` });
      return;
    }
    res.json(result);
  });
}
