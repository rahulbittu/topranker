/**
 * Sprint 176 — Business Pro Subscription Flow
 *
 * Validates:
 * 1. Schema has subscription fields on businesses
 * 2. Subscription checkout creation in payments.ts
 * 3. Subscription webhook handling
 * 4. Payment routes for subscription lifecycle
 * 5. Dashboard tiered data (free vs pro)
 * 6. Storage layer subscription updates
 */

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

// ---------------------------------------------------------------------------
// 1. Schema — subscription fields
// ---------------------------------------------------------------------------
describe("schema — business subscription fields", () => {
  const schemaSrc = readFile("shared/schema.ts");

  it("has stripeCustomerId field", () => {
    expect(schemaSrc).toContain("stripeCustomerId");
    expect(schemaSrc).toContain("stripe_customer_id");
  });

  it("has stripeSubscriptionId field", () => {
    expect(schemaSrc).toContain("stripeSubscriptionId");
    expect(schemaSrc).toContain("stripe_subscription_id");
  });

  it("has subscriptionStatus field with default 'none'", () => {
    expect(schemaSrc).toContain("subscriptionStatus");
    expect(schemaSrc).toContain('"none"');
  });

  it("has subscriptionPeriodEnd field", () => {
    expect(schemaSrc).toContain("subscriptionPeriodEnd");
    expect(schemaSrc).toContain("subscription_period_end");
  });
});

// ---------------------------------------------------------------------------
// 2. Subscription checkout in payments.ts
// ---------------------------------------------------------------------------
describe("payments.ts — subscription checkout", () => {
  const paymentsSrc = readFile("server/payments.ts");

  it("exports createDashboardProSubscription", () => {
    expect(paymentsSrc).toContain("export async function createDashboardProSubscription");
  });

  it("exports cancelSubscription", () => {
    expect(paymentsSrc).toContain("export async function cancelSubscription");
  });

  it("creates Stripe customer if needed", () => {
    expect(paymentsSrc).toContain("stripe.customers.create");
  });

  it("creates Checkout Session in subscription mode", () => {
    expect(paymentsSrc).toContain("checkout.sessions.create");
    expect(paymentsSrc).toContain('"subscription"');
  });

  it("uses recurring price data", () => {
    expect(paymentsSrc).toContain("recurring:");
    expect(paymentsSrc).toContain('"month"');
  });

  it("includes businessId in metadata", () => {
    expect(paymentsSrc).toContain("businessId: params.businessId");
  });

  it("includes success and cancel URLs", () => {
    expect(paymentsSrc).toContain("success_url:");
    expect(paymentsSrc).toContain("cancel_url:");
  });

  it("cancels at period end instead of immediately", () => {
    expect(paymentsSrc).toContain("cancel_at_period_end: true");
  });

  it("has mock mode for development", () => {
    expect(paymentsSrc).toContain("Mock subscription");
  });
});

// ---------------------------------------------------------------------------
// 3. Webhook handling for subscriptions
// ---------------------------------------------------------------------------
describe("stripe-webhook.ts — subscription events", () => {
  const webhookSrc = readFile("server/stripe-webhook.ts");

  it("handles checkout.session.completed", () => {
    expect(webhookSrc).toContain("checkout.session.completed");
  });

  it("handles customer.subscription.created", () => {
    expect(webhookSrc).toContain("customer.subscription.created");
  });

  it("handles customer.subscription.updated", () => {
    expect(webhookSrc).toContain("customer.subscription.updated");
  });

  it("handles customer.subscription.deleted", () => {
    expect(webhookSrc).toContain("customer.subscription.deleted");
  });

  it("handles invoice.payment_failed", () => {
    expect(webhookSrc).toContain("invoice.payment_failed");
  });

  it("routes subscription events to dedicated handler", () => {
    expect(webhookSrc).toContain("processSubscriptionEvent");
    expect(webhookSrc).toContain("SUBSCRIPTION_EVENTS");
  });

  it("extracts businessId from metadata", () => {
    expect(webhookSrc).toContain("metadata.businessId");
  });

  it("updates subscription status via storage", () => {
    expect(webhookSrc).toContain("updateBusinessSubscription");
  });

  it("maps Stripe statuses correctly", () => {
    expect(webhookSrc).toContain('"active"');
    expect(webhookSrc).toContain('"past_due"');
    expect(webhookSrc).toContain('"cancelled"');
  });
});

// ---------------------------------------------------------------------------
// 4. Payment routes — subscription lifecycle
// ---------------------------------------------------------------------------
describe("routes-payments.ts — subscription endpoints", () => {
  const routesSrc = readFile("server/routes-payments.ts");

  it("dashboard-pro creates subscription checkout", () => {
    expect(routesSrc).toContain("createDashboardProSubscription");
  });

  it("dashboard-pro requires business ownership", () => {
    expect(routesSrc).toContain("business.ownerId !== req.user!.id");
    expect(routesSrc).toContain("Only the business owner can subscribe");
  });

  it("prevents duplicate active subscriptions", () => {
    expect(routesSrc).toContain('business.subscriptionStatus === "active"');
    expect(routesSrc).toContain("already has an active subscription");
  });

  it("has subscription status endpoint", () => {
    expect(routesSrc).toContain("/api/payments/subscription-status/:slug");
  });

  it("status endpoint returns isActive flag", () => {
    expect(routesSrc).toContain("isActive:");
  });

  it("has subscription cancel endpoint", () => {
    expect(routesSrc).toContain("/api/payments/subscription-cancel/:slug");
  });

  it("cancel requires ownership", () => {
    expect(routesSrc).toContain("Only the business owner can cancel");
  });

  it("cancel calls cancelSubscription", () => {
    expect(routesSrc).toContain("cancelSubscription");
  });

  it("dev mode activates subscription immediately", () => {
    expect(routesSrc).toContain("mock_cus_");
    expect(routesSrc).toContain("mock_sub_");
  });
});

// ---------------------------------------------------------------------------
// 5. Dashboard — free vs pro data tiering
// ---------------------------------------------------------------------------
describe("routes-businesses.ts — dashboard tiering", () => {
  const bizRoutesSrc = readFile("server/routes-businesses.ts");

  it("checks subscription status for pro access", () => {
    expect(bizRoutesSrc).toContain("isPro");
    expect(bizRoutesSrc).toContain("subscriptionStatus");
  });

  it("free users get limited rating trend (7 days)", () => {
    expect(bizRoutesSrc).toContain("ratingTrend.slice(-7)");
  });

  it("free users get limited recent ratings (3)", () => {
    expect(bizRoutesSrc).toContain("ratings.slice(0, 3)");
  });

  it("notes are pro-only", () => {
    expect(bizRoutesSrc).toContain("isPro ? r.note : undefined");
  });

  it("response includes isPro flag", () => {
    expect(bizRoutesSrc).toContain("isPro,");
  });

  it("response includes subscriptionStatus", () => {
    expect(bizRoutesSrc).toContain("subscriptionStatus:");
  });

  it("admin gets pro access", () => {
    expect(bizRoutesSrc).toContain("|| isAdmin");
  });
});

// ---------------------------------------------------------------------------
// 6. Storage — subscription updates
// ---------------------------------------------------------------------------
describe("storage — updateBusinessSubscription", () => {
  const bizStorageSrc = readFile("server/storage/businesses.ts");
  const indexSrc = readFile("server/storage/index.ts");

  it("function exists", () => {
    expect(bizStorageSrc).toContain("export async function updateBusinessSubscription");
  });

  it("updates stripeCustomerId", () => {
    expect(bizStorageSrc).toContain("updates.stripeCustomerId");
  });

  it("updates stripeSubscriptionId", () => {
    expect(bizStorageSrc).toContain("updates.stripeSubscriptionId");
  });

  it("updates subscriptionStatus", () => {
    expect(bizStorageSrc).toContain("updates.subscriptionStatus");
  });

  it("updates subscriptionPeriodEnd", () => {
    expect(bizStorageSrc).toContain("updates.subscriptionPeriodEnd");
  });

  it("exported from storage barrel", () => {
    expect(indexSrc).toContain("updateBusinessSubscription");
  });
});

// ---------------------------------------------------------------------------
// 7. Pricing configuration
// ---------------------------------------------------------------------------
describe("pricing — dashboardPro configuration", () => {
  const pricingSrc = readFile("shared/pricing.ts");

  it("has dashboardPro pricing", () => {
    expect(pricingSrc).toContain("dashboardPro");
  });

  it("is $49/mo (4900 cents)", () => {
    expect(pricingSrc).toContain("4900");
  });

  it("is marked as recurring", () => {
    expect(pricingSrc).toContain('"recurring"');
  });

  it("has monthly interval", () => {
    expect(pricingSrc).toContain('"month"');
  });
});
