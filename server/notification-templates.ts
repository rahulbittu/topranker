/**
 * Sprint 519: Notification Template Management
 *
 * Stores reusable push notification templates that admins can create,
 * edit, and apply to notification triggers. Templates support variable
 * placeholders ({firstName}, {city}, {business}, etc.) and are
 * categorized by notification type.
 *
 * Templates are distinct from A/B experiments — a template is a single
 * content definition, while experiments test multiple variants.
 */

import { log } from "./logger";

const tmplLog = log.tag("NotifTemplate");

export interface NotificationTemplate {
  id: string;
  name: string;
  category: string;
  title: string;
  body: string;
  variables: string[];
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CreateTemplateInput {
  id: string;
  name: string;
  category: string;
  title: string;
  body: string;
}

// ─── In-Memory Store ─────────────────────────────────────────
// PERSISTENCE-AUDIT: Sprint 528 — acceptable for 500-user target.
// Migration path: notification_templates table (id, name, category, title, body, variables jsonb, active, timestamps).
// Priority: MEDIUM — templates are admin-created content; losing them on restart
// requires re-creation. Consider migration when template count exceeds 20.

const templates = new Map<string, NotificationTemplate>();

// ─── Variable Detection ──────────────────────────────────────

const SUPPORTED_VARIABLES = [
  "firstName", "city", "business", "emoji",
  "direction", "newRank", "oldRank", "delta",
  "rater", "score", "count",
];

/** Extract template variables from title + body */
function detectVariables(title: string, body: string): string[] {
  const combined = `${title} ${body}`;
  return SUPPORTED_VARIABLES.filter((v) => combined.includes(`{${v}}`));
}

// ─── CRUD Operations ─────────────────────────────────────────

export function createTemplate(input: CreateTemplateInput): NotificationTemplate | null {
  if (templates.has(input.id)) {
    tmplLog.info(`Template already exists: ${input.id}`);
    return null;
  }

  const template: NotificationTemplate = {
    ...input,
    variables: detectVariables(input.title, input.body),
    active: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  templates.set(input.id, template);
  tmplLog.info(`Created template: ${input.id} for ${input.category}`);
  return template;
}

export function updateTemplate(
  id: string,
  updates: Partial<Pick<NotificationTemplate, "name" | "title" | "body" | "category" | "active">>,
): NotificationTemplate | null {
  const existing = templates.get(id);
  if (!existing) return null;

  const updated: NotificationTemplate = {
    ...existing,
    ...updates,
    variables: detectVariables(
      updates.title ?? existing.title,
      updates.body ?? existing.body,
    ),
    updatedAt: Date.now(),
  };

  templates.set(id, updated);
  tmplLog.info(`Updated template: ${id}`);
  return updated;
}

export function deleteTemplate(id: string): boolean {
  const existed = templates.delete(id);
  if (existed) tmplLog.info(`Deleted template: ${id}`);
  return existed;
}

export function getTemplate(id: string): NotificationTemplate | undefined {
  return templates.get(id);
}

export function listTemplates(): NotificationTemplate[] {
  return Array.from(templates.values());
}

export function listTemplatesByCategory(category: string): NotificationTemplate[] {
  return Array.from(templates.values()).filter((t) => t.category === category);
}

export function getActiveTemplateForCategory(category: string): NotificationTemplate | undefined {
  return Array.from(templates.values()).find((t) => t.category === category && t.active);
}

/**
 * Apply a template — replace all supported variables with provided values.
 */
export function applyTemplate(
  template: NotificationTemplate,
  values: Record<string, string>,
): { title: string; body: string } {
  let title = template.title;
  let body = template.body;

  for (const [key, val] of Object.entries(values)) {
    const placeholder = `{${key}}`;
    title = title.replaceAll(placeholder, val);
    body = body.replaceAll(placeholder, val);
  }

  return { title, body };
}

/**
 * Get supported template variables list.
 */
export function getSupportedVariables(): string[] {
  return [...SUPPORTED_VARIABLES];
}

/**
 * Get template count.
 */
export function getTemplateCount(): number {
  return templates.size;
}
