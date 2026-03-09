/**
 * Sprint 246: Email Template Builder + Preview System
 * A template engine for composing email content with variable substitution and preview.
 * Owner: Jasmine Taylor (Marketing), Sarah Nakamura (Lead Eng)
 */

import { log } from "./logger";
import crypto from "crypto";

const tmplLog = log.tag("EmailTemplates");

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  variables: string[];
  category: "transactional" | "marketing" | "drip" | "digest" | "outreach";
  createdAt: string;
  updatedAt: string;
}

const templates = new Map<string, EmailTemplate>();
export const MAX_TEMPLATES = 200;

const BUILT_IN_TEMPLATES: Omit<EmailTemplate, "id" | "createdAt" | "updatedAt">[] = [
  {
    name: "welcome",
    subject: "Welcome to TrustMe, {{memberName}}!",
    htmlBody: "<h1>Welcome, {{memberName}}!</h1><p>You've joined the most trusted ranking platform in {{city}}.</p>",
    textBody: "Welcome, {{memberName}}! You've joined the most trusted ranking platform in {{city}}.",
    variables: ["memberName", "city"],
    category: "transactional",
  },
  {
    name: "claim_approved",
    subject: "Your claim for {{businessName}} has been approved",
    htmlBody: "<h1>Congratulations!</h1><p>Your claim for {{businessName}} in {{city}} has been verified.</p>",
    textBody: "Congratulations! Your claim for {{businessName}} in {{city}} has been verified.",
    variables: ["businessName", "city"],
    category: "transactional",
  },
  {
    name: "weekly_digest",
    subject: "Your weekly {{city}} food scene update",
    htmlBody: "<h1>{{city}} This Week</h1><p>Hey {{memberName}}, here's what's trending in {{city}}.</p><p>Top rated: {{topBusiness}}</p>",
    textBody: "Hey {{memberName}}, here's what's trending in {{city}}. Top rated: {{topBusiness}}",
    variables: ["memberName", "city", "topBusiness"],
    category: "digest",
  },
  {
    name: "pro_upgrade",
    subject: "Unlock Pro features for {{businessName}}",
    htmlBody: "<h1>Go Pro</h1><p>{{businessName}} could reach more customers with TrustMe Pro.</p>",
    textBody: "{{businessName}} could reach more customers with TrustMe Pro.",
    variables: ["businessName"],
    category: "outreach",
  },
  {
    name: "tier_promotion",
    subject: "You've been promoted to {{tierName}}!",
    htmlBody: "<h1>Level Up!</h1><p>Congratulations {{memberName}}, you're now a {{tierName}} on TrustMe.</p>",
    textBody: "Congratulations {{memberName}}, you're now a {{tierName}} on TrustMe.",
    variables: ["memberName", "tierName"],
    category: "transactional",
  },
];

export function initBuiltInTemplates(): void {
  for (const t of BUILT_IN_TEMPLATES) {
    const tmpl: EmailTemplate = {
      ...t,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    templates.set(tmpl.name, tmpl);
  }
  tmplLog.info(`Initialized ${BUILT_IN_TEMPLATES.length} built-in templates`);
}

// Initialize on module load
initBuiltInTemplates();

export function getTemplate(name: string): EmailTemplate | null {
  return templates.get(name) || null;
}

export function getAllTemplates(): EmailTemplate[] {
  return Array.from(templates.values());
}

export function createTemplate(tmpl: Omit<EmailTemplate, "id" | "createdAt" | "updatedAt">): EmailTemplate {
  if (templates.size >= MAX_TEMPLATES) {
    // Remove oldest non-built-in
    const oldest = Array.from(templates.values())
      .filter(t => !BUILT_IN_TEMPLATES.some(b => b.name === t.name))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
    if (oldest) templates.delete(oldest.name);
  }
  const created: EmailTemplate = {
    ...tmpl,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  templates.set(created.name, created);
  tmplLog.info(`Template created: ${created.name}`);
  return created;
}

export function renderTemplate(name: string, vars: Record<string, string>): { subject: string; html: string; text: string } | null {
  const tmpl = templates.get(name);
  if (!tmpl) return null;

  let subject = tmpl.subject;
  let html = tmpl.htmlBody;
  let text = tmpl.textBody;

  for (const [key, value] of Object.entries(vars)) {
    const pattern = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    subject = subject.replace(pattern, value);
    html = html.replace(pattern, value);
    text = text.replace(pattern, value);
  }

  return { subject, html, text };
}

export function previewTemplate(name: string): { subject: string; html: string; text: string } | null {
  const tmpl = templates.get(name);
  if (!tmpl) return null;

  // Use placeholder values for preview
  const vars: Record<string, string> = {};
  for (const v of tmpl.variables) {
    vars[v] = `[${v}]`;
  }
  return renderTemplate(name, vars);
}

export function getTemplateCategories(): string[] {
  return ["transactional", "marketing", "drip", "digest", "outreach"];
}

export function clearTemplates(): void {
  templates.clear();
  initBuiltInTemplates();
}
