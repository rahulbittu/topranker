/**
 * Sprint 513: Claim Evidence Storage — PostgreSQL persistence
 *
 * Replaces in-memory Map in claim-verification-v2.ts with database queries.
 * Evidence records are created/updated per claim with upsert pattern.
 */

import { db } from "../db";
import { claimEvidence } from "@shared/schema";
import { eq } from "drizzle-orm";

export type ClaimEvidenceRow = typeof claimEvidence.$inferSelect;

/**
 * Get evidence for a specific claim.
 */
export async function getClaimEvidenceByClaimId(
  claimId: string,
): Promise<ClaimEvidenceRow | null> {
  const [row] = await db
    .select()
    .from(claimEvidence)
    .where(eq(claimEvidence.claimId, claimId));
  return row ?? null;
}

/**
 * Get all evidence records (admin dashboard).
 */
export async function getAllClaimEvidence(): Promise<ClaimEvidenceRow[]> {
  return db.select().from(claimEvidence);
}

/**
 * Upsert claim evidence — creates or updates evidence for a claim.
 * Uses ON CONFLICT on unique claimId constraint.
 */
export async function upsertClaimEvidence(data: {
  claimId: string;
  documents: unknown[];
  businessNameMatch: boolean;
  addressMatch: boolean;
  phoneMatch: boolean;
  verificationScore: number;
  autoApproved: boolean;
  reviewNotes: string[];
}): Promise<ClaimEvidenceRow | null> {
  const [row] = await db
    .insert(claimEvidence)
    .values({
      claimId: data.claimId,
      documents: data.documents,
      businessNameMatch: data.businessNameMatch,
      addressMatch: data.addressMatch,
      phoneMatch: data.phoneMatch,
      verificationScore: data.verificationScore,
      autoApproved: data.autoApproved,
      reviewNotes: data.reviewNotes,
      scoredAt: new Date(),
    })
    .onConflictDoUpdate({
      target: claimEvidence.claimId,
      set: {
        documents: data.documents,
        businessNameMatch: data.businessNameMatch,
        addressMatch: data.addressMatch,
        phoneMatch: data.phoneMatch,
        verificationScore: data.verificationScore,
        autoApproved: data.autoApproved,
        reviewNotes: data.reviewNotes,
        scoredAt: new Date(),
      },
    })
    .returning();
  return row ?? null;
}

/**
 * Add a document to existing evidence (append to jsonb array).
 * Creates evidence record if it doesn't exist.
 */
export async function addDocumentToClaimEvidence(
  claimId: string,
  document: unknown,
): Promise<ClaimEvidenceRow | null> {
  const existing = await getClaimEvidenceByClaimId(claimId);
  const docs = existing ? [...(existing.documents as unknown[]), document] : [document];

  const [row] = await db
    .insert(claimEvidence)
    .values({
      claimId,
      documents: docs,
    })
    .onConflictDoUpdate({
      target: claimEvidence.claimId,
      set: { documents: docs },
    })
    .returning();
  return row ?? null;
}

/**
 * Get evidence count (health check).
 */
export async function getClaimEvidenceCount(): Promise<number> {
  const rows = await db.select().from(claimEvidence);
  return rows.length;
}
