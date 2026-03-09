/**
 * Payment service for TopRanker
 * Handles Challenger entry fees, Dashboard Pro, and Featured Placement.
 * Pricing sourced from shared/pricing.ts (single source of truth).
 *
 * Currently logs to console. Install `stripe` package and set STRIPE_SECRET_KEY to activate.
 * npm install stripe
 */
import { log } from "./logger";
import { PRICING } from "../shared/pricing";

const payLog = log.tag("Payments");

interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "succeeded" | "failed";
  metadata: Record<string, string>;
}

interface CreatePaymentParams {
  amount: number; // in cents
  currency?: string;
  description: string;
  metadata: Record<string, string>;
  customerEmail: string;
}

async function createPaymentIntent(params: CreatePaymentParams): Promise<PaymentIntent> {
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (stripeKey) {
    // Production: use Stripe
    try {
      const stripe = require("stripe")(stripeKey);
      const intent = await stripe.paymentIntents.create({
        amount: params.amount,
        currency: params.currency || "usd",
        description: params.description,
        metadata: params.metadata,
        receipt_email: params.customerEmail,
      });
      return {
        id: intent.id,
        amount: intent.amount,
        currency: intent.currency,
        status: intent.status === "succeeded" ? "succeeded" : "pending",
        metadata: intent.metadata,
      };
    } catch (err: any) {
      payLog.error("Stripe error:", err.message);
      throw new Error("Payment processing failed");
    }
  }

  // Development: mock payment
  payLog.info(`Mock payment: $${(params.amount / 100).toFixed(2)} | ${params.description} | ${params.customerEmail}`);
  return {
    id: `mock_pi_${Date.now()}`,
    amount: params.amount,
    currency: params.currency || "usd",
    status: "succeeded",
    metadata: params.metadata,
  };
}

export async function createChallengerPayment(params: {
  challengerId: string;
  businessName: string;
  customerEmail: string;
  userId: string;
}): Promise<PaymentIntent> {
  return createPaymentIntent({
    amount: PRICING.challenger.amountCents,
    description: `TopRanker Challenger Entry: ${params.businessName}`,
    metadata: {
      type: "challenger_entry",
      challengerId: params.challengerId,
      userId: params.userId,
    },
    customerEmail: params.customerEmail,
  });
}

export async function createDashboardProPayment(params: {
  businessId: string;
  businessName: string;
  customerEmail: string;
  userId: string;
}): Promise<PaymentIntent> {
  return createPaymentIntent({
    amount: PRICING.dashboardPro.amountCents,
    description: `TopRanker Business Dashboard Pro: ${params.businessName}`,
    metadata: {
      type: "dashboard_pro",
      businessId: params.businessId,
      userId: params.userId,
    },
    customerEmail: params.customerEmail,
  });
}

// ── Subscription Checkout (Sprint 176) ───────────────────

interface SubscriptionCheckout {
  id: string;
  url: string | null; // Stripe Checkout URL for redirect
  status: "pending" | "succeeded";
}

export async function createDashboardProSubscription(params: {
  businessId: string;
  businessName: string;
  customerEmail: string;
  userId: string;
  stripeCustomerId?: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<SubscriptionCheckout> {
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (stripeKey) {
    try {
      const stripe = require("stripe")(stripeKey);

      // Create or reuse Stripe customer
      let customerId = params.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: params.customerEmail,
          metadata: { userId: params.userId, businessId: params.businessId },
        });
        customerId = customer.id;
      }

      // Create Checkout Session for subscription
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: {
              name: `Dashboard Pro: ${params.businessName}`,
              description: "Advanced analytics and business insights — monthly subscription",
            },
            unit_amount: PRICING.dashboardPro.amountCents,
            recurring: { interval: "month" },
          },
          quantity: 1,
        }],
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        metadata: {
          type: "dashboard_pro",
          businessId: params.businessId,
          userId: params.userId,
        },
        subscription_data: {
          metadata: {
            type: "dashboard_pro",
            businessId: params.businessId,
            userId: params.userId,
          },
        },
      });

      return {
        id: session.id,
        url: session.url,
        status: "pending",
      };
    } catch (err: any) {
      payLog.error("Stripe subscription error:", err.message);
      throw new Error("Subscription checkout failed");
    }
  }

  // Development: mock subscription
  payLog.info(`Mock subscription: $49/mo | Dashboard Pro: ${params.businessName}`);
  return {
    id: `mock_cs_${Date.now()}`,
    url: null,
    status: "succeeded",
  };
}

export async function cancelSubscription(stripeSubscriptionId: string): Promise<{ cancelAtPeriodEnd: boolean }> {
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (stripeKey) {
    try {
      const stripe = require("stripe")(stripeKey);
      const sub = await stripe.subscriptions.update(stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
      return { cancelAtPeriodEnd: sub.cancel_at_period_end };
    } catch (err: any) {
      payLog.error("Stripe cancel error:", err.message);
      throw new Error("Subscription cancellation failed");
    }
  }

  payLog.info(`Mock cancel subscription: ${stripeSubscriptionId}`);
  return { cancelAtPeriodEnd: true };
}

export async function createFeaturedPlacementPayment(params: {
  businessId: string;
  businessName: string;
  city: string;
  customerEmail: string;
  userId: string;
}): Promise<PaymentIntent> {
  return createPaymentIntent({
    amount: PRICING.featuredPlacement.amountCents,
    description: `TopRanker Featured Placement: ${params.businessName} in ${params.city}`,
    metadata: {
      type: "featured_placement",
      businessId: params.businessId,
      city: params.city,
      userId: params.userId,
    },
    customerEmail: params.customerEmail,
  });
}
