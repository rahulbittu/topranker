/**
 * Unsubscribe / resubscribe routes (Sprint 223)
 *
 * Endpoints:
 * - GET /api/unsubscribe?token=<memberId>&type=<emailType>
 * - GET /api/resubscribe?token=<memberId>&type=<emailType>
 */

import type { Express, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { members } from "@shared/schema";
import { log } from "./logger";
import { wrapAsync } from "./wrap-async";
import { sanitizeString } from "./sanitize";

type EmailType = "drip" | "weekly" | "all";
const VALID_TYPES: EmailType[] = ["drip", "weekly", "all"];

function flagsForType(type: EmailType, value: boolean): Record<string, boolean> {
  if (type === "drip") return { emailDrip: value };
  if (type === "weekly") return { weeklyDigest: value };
  return { emailDrip: value, weeklyDigest: value };
}

function labelForType(type: EmailType): string {
  if (type === "drip") return "drip campaign";
  if (type === "weekly") return "weekly digest";
  return "all";
}

function htmlPage(title: string, body: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} — TopRanker</title>
<style>body{margin:0;font-family:'DM Sans',system-ui,sans-serif;background:#0D1B2A;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh}
.card{background:#162636;border-radius:12px;padding:40px;max-width:420px;text-align:center}
h1{color:#C49A1A;font-size:1.4rem;margin:0 0 12px}p{line-height:1.5;margin:0 0 20px;color:#ccc}
a{color:#C49A1A;text-decoration:underline}</style></head>
<body><div class="card"><h1>${title}</h1>${body}</div></body></html>`;
}

export function registerUnsubscribeRoutes(app: Express) {
  app.get("/api/unsubscribe", wrapAsync(async (req: Request, res: Response) => {
    const token = sanitizeString(req.query.token, 100);
    const type = (sanitizeString(req.query.type, 10) || "all") as EmailType;

    if (!token || !VALID_TYPES.includes(type)) {
      return res.status(400).send(htmlPage("Invalid Request", "<p>Missing or invalid parameters.</p>"));
    }

    const [member] = await db.select().from(members).where(eq(members.id, token)).limit(1);
    if (!member) {
      return res.status(404).send(htmlPage("Not Found", "<p>We couldn't find that account.</p>"));
    }

    const existing = (member.notificationPrefs as Record<string, boolean>) || {};
    const updated = { ...existing, ...flagsForType(type, false) };
    await db.update(members).set({ notificationPrefs: updated }).where(eq(members.id, token));

    log.info(`Unsubscribed member ${token} from ${type} emails`);
    const label = labelForType(type);
    const resubLink = `/api/resubscribe?token=${encodeURIComponent(token)}&type=${encodeURIComponent(type)}`;
    return res.send(htmlPage("Unsubscribed", `<p>You've been unsubscribed from <strong>${label}</strong> emails.</p><p><a href="${resubLink}">Re-subscribe</a></p>`));
  }));

  app.get("/api/resubscribe", wrapAsync(async (req: Request, res: Response) => {
    const token = sanitizeString(req.query.token, 100);
    const type = (sanitizeString(req.query.type, 10) || "all") as EmailType;

    if (!token || !VALID_TYPES.includes(type)) {
      return res.status(400).send(htmlPage("Invalid Request", "<p>Missing or invalid parameters.</p>"));
    }

    const [member] = await db.select().from(members).where(eq(members.id, token)).limit(1);
    if (!member) {
      return res.status(404).send(htmlPage("Not Found", "<p>We couldn't find that account.</p>"));
    }

    const existing = (member.notificationPrefs as Record<string, boolean>) || {};
    const updated = { ...existing, ...flagsForType(type, true) };
    await db.update(members).set({ notificationPrefs: updated }).where(eq(members.id, token));

    log.info(`Resubscribed member ${token} to ${type} emails`);
    const label = labelForType(type);
    return res.send(htmlPage("Re-subscribed", `<p>You've been re-subscribed to <strong>${label}</strong> emails. Welcome back!</p>`));
  }));
}
