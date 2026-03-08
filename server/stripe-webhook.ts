/**
 * Stripe Webhook Handler
 * Processes async payment status updates from Stripe.
 * Handles: payment_intent.succeeded, payment_intent.payment_failed, charge.refunded
 */
import type { Request, Response } from "express";
import { log } from "./logger";
import { updatePaymentStatusByStripeId, logWebhookEvent, markWebhookProcessed } from "./storage";

const whLog = log.tag("StripeWebhook");

interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: {
      id: string;
      status?: string;
      amount?: number;
      metadata?: Record<string, string>;
      payment_intent?: string;
    };
  };
}

/**
 * Verify webhook signature when STRIPE_WEBHOOK_SECRET is set.
 * Falls through to raw JSON parsing in development.
 */
function verifyAndParseEvent(req: Request): StripeEvent | null {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers["stripe-signature"] as string | undefined;

  if (secret && sig) {
    try {
      const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
      return stripe.webhooks.constructEvent(req.body, sig, secret) as StripeEvent;
    } catch (err: any) {
      whLog.error(`Signature verification failed: ${err.message}`);
      return null;
    }
  }

  // Development: parse raw body as JSON (no signature verification)
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    return body as StripeEvent;
  } catch {
    return null;
  }
}

const STATUS_MAP: Record<string, string> = {
  "payment_intent.succeeded": "succeeded",
  "payment_intent.payment_failed": "failed",
  "charge.refunded": "refunded",
};

/**
 * Process a Stripe event — usable from both the webhook handler and admin replay.
 */
export async function processStripeEvent(event: StripeEvent): Promise<{ updated: boolean }> {
  const newStatus = STATUS_MAP[event.type];
  if (!newStatus) {
    whLog.info(`Ignoring event type: ${event.type}`);
    return { updated: false };
  }

  const obj = event.data.object;
  const paymentIntentId = event.type === "charge.refunded"
    ? obj.payment_intent || obj.id
    : obj.id;

  whLog.info(`Processing ${event.type} for ${paymentIntentId} → ${newStatus}`);
  const updated = await updatePaymentStatusByStripeId(paymentIntentId, newStatus);
  if (!updated) {
    whLog.warn(`No payment record found for PI: ${paymentIntentId}`);
  }
  return { updated: !!updated };
}

export async function handleStripeWebhook(req: Request, res: Response) {
  const event = verifyAndParseEvent(req);
  if (!event) {
    return res.status(400).json({ error: "Invalid webhook payload" });
  }

  const logEntry = await logWebhookEvent({
    source: "stripe",
    eventId: event.id,
    eventType: event.type,
    payload: event,
  });

  try {
    const result = await processStripeEvent(event);
    await markWebhookProcessed(logEntry.id);
    return res.json({ received: true, ...result });
  } catch (err: any) {
    whLog.error(`Failed to update payment status: ${err.message}`);
    await markWebhookProcessed(logEntry.id, err.message);
    return res.status(500).json({ error: "Internal error processing webhook" });
  }
}
