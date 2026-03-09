import { log } from "./logger";
import crypto from "crypto";

const abLog = log.tag("EmailAB");

export interface EmailVariant {
  id: string;
  name: string;
  subject: string;
  weight: number;
}

export interface EmailExperiment {
  id: string;
  name: string;
  variants: EmailVariant[];
  createdAt: Date;
  status: "active" | "completed";
  winnerVariantId?: string;
}

const experiments: EmailExperiment[] = [];
const assignments: Map<string, string> = new Map();
const MAX_EXPERIMENTS = 50;

export function createExperiment(name: string, variants: Omit<EmailVariant, "id">[]): EmailExperiment {
  if (experiments.length >= MAX_EXPERIMENTS) {
    experiments.shift();
  }
  const experiment: EmailExperiment = {
    id: crypto.randomUUID(),
    name,
    variants: variants.map((v) => ({
      ...v,
      id: crypto.randomUUID(),
      weight: v.weight || 1,
    })),
    createdAt: new Date(),
    status: "active",
  };
  experiments.push(experiment);
  abLog.info(`Created email experiment "${name}" with ${variants.length} variants`);
  return experiment;
}

export function getExperiment(experimentId: string): EmailExperiment | undefined {
  return experiments.find((e) => e.id === experimentId);
}

export function assignVariant(experimentId: string, memberId: string): EmailVariant | null {
  const experiment = getExperiment(experimentId);
  if (!experiment || experiment.variants.length === 0) return null;

  const cacheKey = `${experimentId}:${memberId}`;
  const cached = assignments.get(cacheKey);
  if (cached) {
    return experiment.variants.find((v) => v.id === cached) || null;
  }

  const hash = crypto.createHash("sha256").update(experimentId + memberId).digest("hex");
  const totalWeight = experiment.variants.reduce((sum, v) => sum + v.weight, 0);
  const bucket = parseInt(hash.slice(0, 8), 16) % totalWeight;

  let cumulative = 0;
  for (const variant of experiment.variants) {
    cumulative += variant.weight;
    if (bucket < cumulative) {
      assignments.set(cacheKey, variant.id);
      return variant;
    }
  }
  return null;
}

export function getSubjectForMember(experimentId: string, memberId: string, defaultSubject: string): string {
  const variant = assignVariant(experimentId, memberId);
  return variant ? variant.subject : defaultSubject;
}

export function completeExperiment(experimentId: string, winnerVariantId: string): void {
  const experiment = getExperiment(experimentId);
  if (!experiment) return;
  experiment.status = "completed";
  experiment.winnerVariantId = winnerVariantId;
  abLog.info(`Experiment "${experiment.name}" completed — winner: ${winnerVariantId}`);
}

export function getExperimentStats(experimentId: string): { variantId: string; name: string; assignedCount: number }[] | null {
  const experiment = getExperiment(experimentId);
  if (!experiment) return null;

  return experiment.variants.map((v) => ({
    variantId: v.id,
    name: v.name,
    assignedCount: [...assignments.entries()].filter(([key, val]) => key.startsWith(`${experimentId}:`) && val === v.id).length,
  }));
}

export function getActiveExperiments(): EmailExperiment[] {
  return experiments.filter((e) => e.status === "active");
}

export function clearExperiments(): void {
  experiments.length = 0;
  assignments.clear();
}
