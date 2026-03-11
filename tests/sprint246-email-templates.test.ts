/**
 * Sprint 246 — Email Template Builder + Preview System
 *
 * Validates:
 * 1. Email templates module (server/email-templates.ts) — static + runtime
 * 2. Admin template routes (server/routes-admin-templates.ts) — static
 * 3. Integration wiring (routes.ts)
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  getTemplate,
  getAllTemplates,
  createTemplate,
  renderTemplate,
  previewTemplate,
  getTemplateCategories,
  clearTemplates,
  initBuiltInTemplates,
  MAX_TEMPLATES,
  type EmailTemplate,
} from "../server/email-templates";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. Email Templates — Static Analysis
// ---------------------------------------------------------------------------
describe("Email templates — static analysis", () => {
  const src = readFile("server/email-templates.ts");

  it("file exists", () => {
    expect(fileExists("server/email-templates.ts")).toBe(true);
  });

  it("exports getTemplate function", () => {
    expect(src).toContain("export function getTemplate");
  });

  it("exports getAllTemplates function", () => {
    expect(src).toContain("export function getAllTemplates");
  });

  it("exports createTemplate function", () => {
    expect(src).toContain("export function createTemplate");
  });

  it("exports renderTemplate function", () => {
    expect(src).toContain("export function renderTemplate");
  });

  it("exports previewTemplate function", () => {
    expect(src).toContain("export function previewTemplate");
  });

  it("exports getTemplateCategories function", () => {
    expect(src).toContain("export function getTemplateCategories");
  });

  it("exports clearTemplates function", () => {
    expect(src).toContain("export function clearTemplates");
  });

  it("exports initBuiltInTemplates function", () => {
    expect(src).toContain("export function initBuiltInTemplates");
  });

  it("defines 5 built-in templates", () => {
    const matches = src.match(/name:\s*"/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBe(5);
  });

  it("MAX_TEMPLATES is 200", () => {
    expect(MAX_TEMPLATES).toBe(200);
  });

  it("uses tagged logger", () => {
    expect(src).toContain('log.tag("EmailTemplates")');
  });

  it("uses {{variable}} syntax for substitution", () => {
    expect(src).toContain("{{memberName}}");
    expect(src).toContain("{{city}}");
    expect(src).toContain("{{businessName}}");
  });
});

// ---------------------------------------------------------------------------
// 2. Email Templates — Runtime
// ---------------------------------------------------------------------------
describe("Email templates — runtime", () => {
  beforeEach(() => {
    clearTemplates();
  });

  it("getTemplate returns a built-in template by name", () => {
    const tmpl = getTemplate("welcome");
    expect(tmpl).not.toBeNull();
    expect(tmpl!.name).toBe("welcome");
    expect(tmpl!.category).toBe("transactional");
  });

  it("getTemplate returns null for unknown template", () => {
    expect(getTemplate("nonexistent")).toBeNull();
  });

  it("getAllTemplates returns 5 built-in templates", () => {
    const all = getAllTemplates();
    expect(all.length).toBe(5);
  });

  it("each built-in template has id, createdAt, updatedAt", () => {
    const all = getAllTemplates();
    for (const t of all) {
      expect(t.id).toBeDefined();
      expect(t.createdAt).toBeDefined();
      expect(t.updatedAt).toBeDefined();
    }
  });

  it("createTemplate adds a new template", () => {
    const created = createTemplate({
      name: "test_template",
      subject: "Test {{name}}",
      htmlBody: "<p>Hello {{name}}</p>",
      textBody: "Hello {{name}}",
      variables: ["name"],
      category: "marketing",
    });
    expect(created.name).toBe("test_template");
    expect(created.id).toBeDefined();
    expect(getAllTemplates().length).toBe(6);
  });

  it("createTemplate overwrites an existing template with same name", () => {
    createTemplate({
      name: "custom_a",
      subject: "V1",
      htmlBody: "<p>V1</p>",
      textBody: "V1",
      variables: [],
      category: "marketing",
    });
    createTemplate({
      name: "custom_a",
      subject: "V2",
      htmlBody: "<p>V2</p>",
      textBody: "V2",
      variables: [],
      category: "marketing",
    });
    const tmpl = getTemplate("custom_a");
    expect(tmpl!.subject).toBe("V2");
    // Still 6 total (5 built-in + 1 overwritten)
    expect(getAllTemplates().length).toBe(6);
  });

  it("renderTemplate substitutes all variables", () => {
    const result = renderTemplate("welcome", { memberName: "Alice", city: "Nashville" });
    expect(result).not.toBeNull();
    expect(result!.subject).toBe("Welcome to TrustMe, Alice!");
    expect(result!.html).toContain("Welcome, Alice!");
    expect(result!.html).toContain("Nashville");
    expect(result!.text).toContain("Alice");
    expect(result!.text).toContain("Nashville");
  });

  it("renderTemplate returns null for unknown template", () => {
    expect(renderTemplate("nonexistent", {})).toBeNull();
  });

  it("renderTemplate with missing vars leaves placeholders", () => {
    const result = renderTemplate("welcome", { memberName: "Bob" });
    expect(result).not.toBeNull();
    expect(result!.subject).toContain("Bob");
    expect(result!.html).toContain("{{city}}");
    expect(result!.text).toContain("{{city}}");
  });

  it("renderTemplate substitutes multiple occurrences of same variable", () => {
    const result = renderTemplate("weekly_digest", {
      memberName: "Carol",
      city: "Austin",
      topBusiness: "BBQ King",
    });
    expect(result).not.toBeNull();
    // city appears twice in htmlBody
    const cityCount = (result!.html.match(/Austin/g) || []).length;
    expect(cityCount).toBe(2);
  });

  it("previewTemplate uses bracket placeholders", () => {
    const result = previewTemplate("welcome");
    expect(result).not.toBeNull();
    expect(result!.subject).toContain("[memberName]");
    expect(result!.html).toContain("[city]");
    expect(result!.text).toContain("[memberName]");
  });

  it("previewTemplate returns null for unknown template", () => {
    expect(previewTemplate("nonexistent")).toBeNull();
  });

  it("getTemplateCategories returns all 5 categories", () => {
    const cats = getTemplateCategories();
    expect(cats).toEqual(["transactional", "marketing", "drip", "digest", "outreach"]);
  });

  it("clearTemplates resets to built-in only", () => {
    createTemplate({
      name: "temp",
      subject: "Temp",
      htmlBody: "<p>Temp</p>",
      textBody: "Temp",
      variables: [],
      category: "drip",
    });
    expect(getAllTemplates().length).toBe(6);
    clearTemplates();
    expect(getAllTemplates().length).toBe(5);
    expect(getTemplate("temp")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 3. Admin Template Routes — Static Analysis
// ---------------------------------------------------------------------------
describe("Admin template routes — static analysis", () => {
  const src = readFile("server/routes-admin-templates.ts");

  it("file exists", () => {
    expect(fileExists("server/routes-admin-templates.ts")).toBe(true);
  });

  it("exports registerAdminTemplateRoutes function", () => {
    expect(src).toContain("export function registerAdminTemplateRoutes");
  });

  it("defines GET /api/admin/templates endpoint", () => {
    expect(src).toContain('"/api/admin/templates"');
    expect(src).toContain("app.get");
  });

  it("defines GET /api/admin/templates/:name endpoint", () => {
    expect(src).toContain('"/api/admin/templates/:name"');
  });

  it("defines POST /api/admin/templates endpoint", () => {
    expect(src).toContain("app.post");
  });

  it("defines GET /api/admin/templates/:name/preview endpoint", () => {
    expect(src).toContain('"/api/admin/templates/:name/preview"');
  });

  it("defines POST /api/admin/templates/:name/render endpoint", () => {
    expect(src).toContain('"/api/admin/templates/:name/render"');
  });

  it("uses tagged logger", () => {
    expect(src).toContain('log.tag("AdminTemplates")');
  });
});

// ---------------------------------------------------------------------------
// 4. Integration — Wiring
// ---------------------------------------------------------------------------
describe("Email templates — integration wiring", () => {
  const adminSrc = readFile("server/routes-admin.ts");

  it("routes-admin.ts imports registerAdminTemplateRoutes", () => {
    expect(adminSrc).toContain('import { registerAdminTemplateRoutes } from "./routes-admin-templates"');
  });

  it("routes-admin.ts calls registerAdminTemplateRoutes(app)", () => {
    expect(adminSrc).toContain("registerAdminTemplateRoutes(app)");
  });

  it("email-templates.ts imports logger", () => {
    const src = readFile("server/email-templates.ts");
    expect(src).toContain('import { log } from "./logger"');
  });

  it("email-templates.ts imports crypto", () => {
    const src = readFile("server/email-templates.ts");
    expect(src).toContain('import crypto from "crypto"');
  });
});
