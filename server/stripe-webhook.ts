/**
 * Stripe Webhook Handler
 * Processes async payment status updates from Stripe.
 * Handles: payment_intent.succeeded, payment_intent.payment_failed, charge.refunded
 */
import type { Request, Response } from "express";
import { log } from "./logger";
import { config } from "./config";
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
  // Sprint 806: Centralized to config.ts
  const secret = config.stripeWebhookSecret;
  const sig = req.headers["stripe-signature"] as string | undefined;

  if (secret && sig) {
    try {
      const stripe = require("stripe")(config.stripeSecretKey);
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

// Sprint 176: Subscription event types
const SUBSCRIPTION_EVENTS = new Set([
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.payment_failed",
  "checkout.session.completed",
]);

/**
 * Process a Stripe event — usable from both the webhook handler and admin replay.
 */
/**
 * Sprint 176: Handle subscription lifecycle events.
 */
async function processSubscriptionEvent(event: StripeEvent): Promise<{ updated: boolean }> {
  const obj = event.data.object;
  const metadata = obj.metadata || {};
  const businessId = metadata.businessId;

  if (!businessId) {
    whLog.warn(`Subscription event ${event.type} missing businessId in metadata`);
    return { updated: false };
  }

  const { updateBusinessSubscription } = await import("./storage");

  if (event.type === "checkout.session.completed") {
    // Checkout completed — extract subscription ID and customer ID
    const subscriptionId = (obj as any).subscription;
    const customerId = (obj as any).customer;
    if (subscriptionId && customerId) {
      await updateBusinessSubscription(businessId, {
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus: "active",
      });
      whLog.info(`Subscription activated for business ${businessId}: ${subscriptionId}`);
      return { updated: true };
    }
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.created") {
    const status = (obj as any).status; // active, past_due, canceled, trialing
    const periodEnd = (obj as any).current_period_end;
    const cancelAtPeriodEnd = (obj as any).cancel_at_period_end;

    const mappedStatus = cancelAtPeriodEnd ? "cancelled"
      : status === "active" ? "active"
      : status === "past_due" ? "past_due"
      : status === "canceled" ? "cancelled"
      : status === "trialing" ? "trialing"
      : "none";

    await updateBusinessSubscription(businessId, {
      subscriptionStatus: mappedStatus,
      subscriptionPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : undefined,
    });
    whLog.info(`Subscription updated for business ${businessId}: ${mappedStatus}`);
    return { updated: true };
  }

  if (event.type === "customer.subscription.deleted") {
    await updateBusinessSubscription(businessId, {
      subscriptionStatus: "cancelled",
      stripeSubscriptionId: null,
    });
    whLog.info(`Subscription cancelled for business ${businessId}`);
    return { updated: true };
  }

  if (event.type === "invoice.payment_failed") {
    await updateBusinessSubscription(businessId, { subscriptionStatus: "past_due" });
    whLog.info(`Subscription past_due for business ${businessId}`);
    return { updated: true };
  }

  return { updated: false };
}

export async function processStripeEvent(event: StripeEvent): Promise<{ updated: boolean }> {
  // Sprint 176: Route subscription events to subscription handler
  if (SUBSCRIPTION_EVENTS.has(event.type)) {
    return processSubscriptionEvent(event);
  }

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

  // Sprint 179: Create challenger record when challenger_entry payment succeeds
  if (event.type === "payment_intent.succeeded") {
    const metadata = obj.metadata || {};
    if (metadata.type === "challenger_entry" && metadata.challengerId) {
      try {
        const { createChallenge } = await import("./storage");
        // defenderId must be resolved from the current #1 in the category
        // For now, the challenger payment metadata includes challengerId;
        // defenderId is determined by the top-ranked business in the same category+city
        const { getBusinessById } = await import("./storage");
        const challengerBiz = await getBusinessById(metadata.challengerId);
        if (challengerBiz) {
          const { getLeaderboard } = await import("./storage");
          const leaderboard = await getLeaderboard(challengerBiz.city, challengerBiz.category);
          const defender = leaderboard.find(b => b.id !== metadata.challengerId);
          if (defender) {
            await createChallenge({
              challengerId: metadata.challengerId,
              defenderId: defender.id,
              category: challengerBiz.category,
              city: challengerBiz.city,
              stripePaymentIntentId: paymentIntentId,
            });
            whLog.info(`Challenger record created for PI: ${paymentIntentId}`);
          }
        }
      } catch (err: any) {
        whLog.error(`Failed to create challenger record: ${err.message}`);
      }
    }
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
