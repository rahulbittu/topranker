/**
 * Resend webhook handler for email delivery events
 *
 * Endpoint:
 * - POST /api/webhooks/resend — processes Resend email delivery webhooks
 */

import type { Express, Request, Response } from "express";
import crypto from "node:crypto";
import { log } from "./logger";
import { wrapAsync } from "./wrap-async";
import {
  trackEmailOpened,
  trackEmailClicked,
  trackEmailBounced,
  trackEmailFailed,
} from "./email-tracking";
import { getTrackingIdFromResend } from "./email-id-mapping";

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export function registerWebhookRoutes(app: Express) {
  app.post("/api/webhooks/resend", wrapAsync(async (req: Request, res: Response) => {
    const rawBody = JSON.stringify(req.body);
    const secret = process.env.RESEND_WEBHOOK_SECRET;

    // Verify webhook signature if secret is configured
    if (secret) {
      const signature = req.headers["resend-signature"] as string;
      if (!signature || !verifySignature(rawBody, signature, secret)) {
        log.warn("Resend webhook: invalid signature");
        return res.status(400).json({ error: "Invalid webhook signature" });
      }
    } else {
      log.warn("Resend webhook: RESEND_WEBHOOK_SECRET not set — skipping signature verification (dev mode)");
    }

    const { type, data } = req.body as {
      type: string;
      data: { email_id: string; to?: string[]; [key: string]: unknown };
    };

    // Resolve Resend's email_id to our internal tracking ID if a mapping exists
    const trackingId = getTrackingIdFromResend(data.email_id) || data.email_id;
    const eventId = trackingId;

    log.info(`Resend webhook: ${type} for email ${eventId}`);

    switch (type) {
      case "email.opened":
        await trackEmailOpened(eventId);
        break;
      case "email.clicked":
        await trackEmailClicked(eventId);
        break;
      case "email.bounced":
        await trackEmailBounced(eventId);
        break;
      case "email.delivery_error":
      case "email.complained": {
        const reason = String((data as any).reason || (data as any).error || type);
        await trackEmailFailed(eventId, reason);
        break;
      }
      default:
        log.info(`Resend webhook: unhandled event type "${type}"`);
    }

    return res.json({ received: true });
  }));
}
