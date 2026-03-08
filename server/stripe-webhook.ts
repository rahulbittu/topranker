/**
 * Stripe Webhook Handler
 * Processes async payment status updates from Stripe.
 * Handles: payment_intent.succeeded, payment_intent.payment_failed, charge.refunded
 */
import type { Request, Response } from "express";
import { log } from "./logger";
import { updatePaymentStatusByStripeId } from "./storage";

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

export async function handleStripeWebhook(req: Request, res: Response) {
  const event = verifyAndParseEvent(req);
  if (!event) {
    return res.status(400).json({ error: "Invalid webhook payload" });
  }

  const newStatus = STATUS_MAP[event.type];
  if (!newStatus) {
    // Unhandled event type — acknowledge but skip processing
    whLog.info(`Ignoring event type: ${event.type}`);
    return res.json({ received: true });
  }

  const obj = event.data.object;
  // For charge.refunded, the payment_intent ID is nested
  const paymentIntentId = event.type === "charge.refunded"
    ? obj.payment_intent || obj.id
    : obj.id;

  whLog.info(`Processing ${event.type} for ${paymentIntentId} → ${newStatus}`);

  try {
    const updated = await updatePaymentStatusByStripeId(paymentIntentId, newStatus);
    if (!updated) {
      // Payment record not found — may be from a different system
      whLog.warn(`No payment record found for PI: ${paymentIntentId}`);
    }
    return res.json({ received: true, updated: !!updated });
  } catch (err: any) {
    whLog.error(`Failed to update payment status: ${err.message}`);
    return res.status(500).json({ error: "Internal error processing webhook" });
  }
}
