/**
 * Sprint 228 — Email A/B Testing, Resend Webhook Handler
 *
 * Validates:
 * 1. Email A/B testing framework (server/email-ab-testing.ts)
 * 2. Resend webhook handler (server/routes-webhooks.ts)
 * 3. Integration wiring
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import {
  createExperiment,
  assignVariant,
  getSubjectForMember,
  completeExperiment,
  getActiveExperiments,
  clearExperiments,
} from "../server/email-ab-testing";

const readFile = (relPath: string) =>
  fs.readFileSync(path.resolve(__dirname, "..", relPath), "utf-8");

const fileExists = (relPath: string) =>
  fs.existsSync(path.resolve(__dirname, "..", relPath));

// ---------------------------------------------------------------------------
// 1. Email A/B testing — server/email-ab-testing.ts (static)
// ---------------------------------------------------------------------------
describe("Email A/B testing — server/email-ab-testing.ts (static)", () => {
  it("module exists", () => {
    expect(fileExists("server/email-ab-testing.ts")).toBe(true);
  });

  const src = readFile("server/email-ab-testing.ts");

  it("exports createExperiment", () => {
    expect(src).toContain("createExperiment");
  });

  it("exports assignVariant", () => {
    expect(src).toContain("assignVariant");
  });

  it("exports getSubjectForMember", () => {
    expect(src).toContain("getSubjectForMember");
  });

  it("exports completeExperiment", () => {
    expect(src).toContain("completeExperiment");
  });

  it("exports getExperimentStats", () => {
    expect(src).toContain("getExperimentStats");
  });

  it("exports getActiveExperiments", () => {
    expect(src).toContain("getActiveExperiments");
  });

  it("exports clearExperiments", () => {
    expect(src).toContain("clearExperiments");
  });

  it("uses SHA-256 hash for deterministic assignment", () => {
    expect(src).toContain("sha256");
  });
});

// ---------------------------------------------------------------------------
// 1b. Email A/B testing — runtime
// ---------------------------------------------------------------------------
describe("Email A/B testing — runtime", () => {
  beforeEach(() => {
    clearExperiments();
  });

  const variants = [
    { name: "control", subject: "Welcome!", weight: 1 },
    { name: "variant_b", subject: "Hey there!", weight: 1 },
  ];

  it("createExperiment creates an experiment with variants", () => {
    const exp = createExperiment("test-exp-1", variants);
    expect(exp).toBeDefined();
    expect(exp.name).toBe("test-exp-1");
    expect(exp.id).toBeTruthy();
    expect(exp.variants).toHaveLength(2);
  });

  it("assignVariant returns a variant for a member", () => {
    const exp = createExperiment("test-exp-2", variants);
    const variant = assignVariant(exp.id, "member-abc");
    expect(variant).not.toBeNull();
    expect(["control", "variant_b"]).toContain(variant!.name);
  });

  it("assignVariant is deterministic — same memberId returns same variant", () => {
    const exp = createExperiment("test-exp-3", variants);
    const first = assignVariant(exp.id, "member-xyz");
    const second = assignVariant(exp.id, "member-xyz");
    expect(first).toEqual(second);
  });

  it("getSubjectForMember returns a subject string", () => {
    const exp = createExperiment("test-exp-4", variants);
    const subject = getSubjectForMember(exp.id, "member-123", "fallback");
    expect(typeof subject).toBe("string");
    expect(["Welcome!", "Hey there!"]).toContain(subject);
  });

  it("completeExperiment marks experiment completed", () => {
    const exp = createExperiment("test-exp-5", variants);
    completeExperiment(exp.id, exp.variants[0].id);
    const active = getActiveExperiments();
    const found = active.find((e: any) => e.id === exp.id);
    expect(found).toBeUndefined();
  });

  it("getActiveExperiments returns only active experiments", () => {
    const exp1 = createExperiment("active-1", variants);
    const exp2 = createExperiment("active-2", variants);
    completeExperiment(exp1.id, exp1.variants[0].id);
    const active = getActiveExperiments();
    expect(active.some((e: any) => e.id === exp2.id)).toBe(true);
    expect(active.some((e: any) => e.id === exp1.id)).toBe(false);
  });

  it("clearExperiments empties the store", () => {
    createExperiment("clear-1", variants);
    createExperiment("clear-2", variants);
    clearExperiments();
    expect(getActiveExperiments()).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 2. Resend webhook handler — server/routes-webhooks.ts (static)
// ---------------------------------------------------------------------------
describe("Resend webhook handler — server/routes-webhooks.ts (static)", () => {
  it("module exists", () => {
    expect(fileExists("server/routes-webhooks.ts")).toBe(true);
  });

  const src = readFile("server/routes-webhooks.ts");

  it("exports registerWebhookRoutes", () => {
    expect(src).toContain("registerWebhookRoutes");
  });

  it("has POST /api/webhooks/resend endpoint", () => {
    expect(src).toContain("/api/webhooks/resend");
  });

  it("imports trackEmailOpened from email-tracking", () => {
    expect(src).toContain("trackEmailOpened");
    expect(src).toContain("email-tracking");
  });

  it("imports trackEmailClicked from email-tracking", () => {
    expect(src).toContain("trackEmailClicked");
  });

  it("imports trackEmailBounced from email-tracking", () => {
    expect(src).toContain("trackEmailBounced");
  });

  it("imports trackEmailFailed from email-tracking", () => {
    expect(src).toContain("trackEmailFailed");
  });

  it("handles email.opened event type", () => {
    expect(src).toContain("email.opened");
  });

  it("handles email.clicked event type", () => {
    expect(src).toContain("email.clicked");
  });

  it("handles email.bounced event type", () => {
    expect(src).toContain("email.bounced");
  });

  it("uses HMAC verification", () => {
    expect(src.includes("hmac") || src.includes("sha256")).toBe(true);
  });

  it("uses RESEND_WEBHOOK_SECRET env var", () => {
    expect(src).toContain("RESEND_WEBHOOK_SECRET");
  });
});

// ---------------------------------------------------------------------------
// 3. Integration
// ---------------------------------------------------------------------------
describe("Integration wiring", () => {
  it("routes.ts imports routes-webhooks", () => {
    const src = readFile("server/routes.ts");
    expect(src).toContain("routes-webhooks");
  });

  it("routes.ts registers registerWebhookRoutes", () => {
    const src = readFile("server/routes.ts");
    expect(src).toContain("registerWebhookRoutes");
  });

  it("email-ab-testing has max experiments limit of 50", () => {
    const src = readFile("server/email-ab-testing.ts");
    expect(src).toContain("50");
  });
});
