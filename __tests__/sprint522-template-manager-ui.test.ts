/**
 * Sprint 522: Admin Template Management UI
 */
import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const readFile = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

describe("Sprint 522: Template Manager UI", () => {
  describe("components/admin/TemplateManagerCard.tsx", () => {
    const src = readFile("components/admin/TemplateManagerCard.tsx");

    it("exports TemplateManagerCard component", () => {
      expect(src).toContain("export function TemplateManagerCard");
    });

    it("accepts templates, onCreateTemplate, onDeleteTemplate, onToggleActive props", () => {
      expect(src).toContain("templates: NotificationTemplate[]");
      expect(src).toContain("onCreateTemplate:");
      expect(src).toContain("onDeleteTemplate:");
      expect(src).toContain("onToggleActive:");
    });

    it("renders VariableBadge for template variables", () => {
      expect(src).toContain("VariableBadge");
      expect(src).toContain("template.variables");
    });

    it("renders category tag with color", () => {
      expect(src).toContain("CATEGORY_COLORS");
      expect(src).toContain("categoryTag");
      expect(src).toContain("template.category");
    });

    it("has create form with name, category, title, body fields", () => {
      expect(src).toContain("formName");
      expect(src).toContain("formCategory");
      expect(src).toContain("formTitle");
      expect(src).toContain("formBody");
    });

    it("has category picker with 4 notification categories", () => {
      expect(src).toContain('"weeklyDigest"');
      expect(src).toContain('"rankingChange"');
      expect(src).toContain('"newRating"');
      expect(src).toContain('"cityHighlights"');
    });

    it("validates required fields on create", () => {
      expect(src).toContain("Missing Fields");
      expect(src).toContain("!formName.trim()");
    });

    it("generates ID from name", () => {
      expect(src).toContain("toLowerCase()");
      expect(src).toContain("replace(/\\s+/g");
    });

    it("renders TemplateRow for each template", () => {
      expect(src).toContain("TemplateRow");
      expect(src).toContain("template.name");
      expect(src).toContain("template.title");
      expect(src).toContain("template.body");
    });

    it("has toggle active/inactive with checkmark icon", () => {
      expect(src).toContain("checkmark-circle");
      expect(src).toContain("ellipse-outline");
      expect(src).toContain("template.active");
    });

    it("has delete action with trash icon", () => {
      expect(src).toContain("trash-outline");
      expect(src).toContain("onDelete");
    });

    it("shows empty state message", () => {
      expect(src).toContain("No templates yet");
    });

    it("has count badge showing template count", () => {
      expect(src).toContain("templates.length");
      expect(src).toContain("countBadge");
    });

    it("uses brand colors", () => {
      expect(src).toContain("BRAND.colors.amber");
      expect(src).toContain("Colors.green");
    });

    it("stays under 250 LOC", () => {
      const lines = src.split("\n").length;
      expect(lines).toBeLessThan(250);
    });
  });

  // Sprint 526: Template wiring extracted to NotificationAdminSection
  describe("NotificationAdminSection — template wiring", () => {
    const src = readFile("components/admin/NotificationAdminSection.tsx");

    it("imports TemplateManagerCard", () => {
      expect(src).toContain("TemplateManagerCard");
      expect(src).toContain("./TemplateManagerCard");
    });

    it("imports template API functions", () => {
      expect(src).toContain("fetchNotificationTemplates");
      expect(src).toContain("createNotificationTemplate");
      expect(src).toContain("deleteNotificationTemplate");
      expect(src).toContain("updateNotificationTemplate");
    });

    it("has useQuery for admin-notification-templates", () => {
      expect(src).toContain("admin-notification-templates");
    });

    it("has handleCreateTemplate handler", () => {
      expect(src).toContain("handleCreateTemplate");
    });

    it("has handleDeleteTemplate handler", () => {
      expect(src).toContain("handleDeleteTemplate");
    });

    it("has handleToggleTemplate handler", () => {
      expect(src).toContain("handleToggleTemplate");
    });

    it("renders TemplateManagerCard in overview", () => {
      expect(src).toContain("<TemplateManagerCard");
      expect(src).toContain("templates={notifTemplates}");
    });

    it("invalidates query cache on template mutations", () => {
      expect(src).toContain('invalidateQueries({ queryKey: ["admin-notification-templates"]');
    });
  });
});
