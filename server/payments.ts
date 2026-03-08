/**
 * Payment service for TopRanker
 * Handles Challenger entry fees ($99) and Business Dashboard Pro ($49/mo)
 *
 * Currently logs to console. Install `stripe` package and set STRIPE_SECRET_KEY to activate.
 * npm install stripe
 */
import { log } from "./logger";

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
    amount: 9900, // $99.00
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
    amount: 4900, // $49.00/mo
    description: `TopRanker Business Dashboard Pro: ${params.businessName}`,
    metadata: {
      type: "dashboard_pro",
      businessId: params.businessId,
      userId: params.userId,
    },
    customerEmail: params.customerEmail,
  });
}

export async function createFeaturedPlacementPayment(params: {
  businessId: string;
  businessName: string;
  city: string;
  customerEmail: string;
  userId: string;
}): Promise<PaymentIntent> {
  return createPaymentIntent({
    amount: 19900, // $199.00/week
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
