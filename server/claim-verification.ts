/**
 * Business Claim Verification Module (Sprint 238)
 *
 * Manages the lifecycle of business claim requests:
 * - Owners submit a claim with a verification method (email, phone, document, google_business)
 * - A 6-digit verification code is generated
 * - Owner submits the code; on match the claim is verified
 * - Claims expire after 48 hours; max 3 attempts before rejection
 * - FIFO eviction at 1000 claims to bound memory
 */

import { log } from "./logger";
import crypto from "crypto";

const claimLog = log.tag("ClaimVerification");

export type ClaimStatus = "pending" | "verified" | "rejected" | "expired";
export type VerificationMethod = "email" | "phone" | "document" | "google_business";

export interface ClaimRequest {
  id: string;
  businessId: string;
  memberId: string;
  method: VerificationMethod;
  status: ClaimStatus;
  verificationCode: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  attempts: number;
  maxAttempts: number;
}

const claims = new Map<string, ClaimRequest>();
export const MAX_CLAIMS = 1000;
const CODE_LENGTH = 6;
const EXPIRY_HOURS = 48;
const MAX_ATTEMPTS = 3;

function generateCode(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(CODE_LENGTH)))
    .map(b => (b % 10).toString())
    .join("");
}

export function createClaimRequest(
  businessId: string,
  memberId: string,
  method: VerificationMethod,
): ClaimRequest {
  // Check for existing pending claim for same business+member
  for (const claim of claims.values()) {
    if (
      claim.businessId === businessId &&
      claim.memberId === memberId &&
      claim.status === "pending"
    ) {
      claimLog.info(`Existing pending claim ${claim.id} for business ${businessId}, member ${memberId}`);
      return claim;
    }
  }

  // FIFO eviction at MAX_CLAIMS
  if (claims.size >= MAX_CLAIMS) {
    const oldestKey = claims.keys().next().value!;
    claims.delete(oldestKey);
    claimLog.warn(`Evicted oldest claim ${oldestKey} (FIFO, limit ${MAX_CLAIMS})`);
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + EXPIRY_HOURS * 60 * 60 * 1000);

  const claim: ClaimRequest = {
    id: crypto.randomUUID(),
    businessId,
    memberId,
    method,
    status: "pending",
    verificationCode: generateCode(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    attempts: 0,
    maxAttempts: MAX_ATTEMPTS,
  };

  claims.set(claim.id, claim);
  claimLog.info(`Created claim ${claim.id} for business ${businessId}, method ${method}`);
  return claim;
}

export function verifyClaimCode(
  claimId: string,
  code: string,
): { success: boolean; error?: string } {
  const claim = claims.get(claimId);
  if (!claim) {
    return { success: false, error: "Claim not found" };
  }

  // Check expiry
  if (new Date() > new Date(claim.expiresAt)) {
    claim.status = "expired";
    claim.updatedAt = new Date().toISOString();
    claimLog.info(`Claim ${claimId} expired`);
    return { success: false, error: "Claim has expired" };
  }

  // Check if already resolved
  if (claim.status !== "pending") {
    return { success: false, error: `Claim is already ${claim.status}` };
  }

  // Check max attempts
  if (claim.attempts >= claim.maxAttempts) {
    claim.status = "rejected";
    claim.updatedAt = new Date().toISOString();
    claimLog.info(`Claim ${claimId} rejected: max attempts exceeded`);
    return { success: false, error: "Maximum verification attempts exceeded" };
  }

  // Verify code
  if (code === claim.verificationCode) {
    claim.status = "verified";
    claim.updatedAt = new Date().toISOString();
    claimLog.info(`Claim ${claimId} verified successfully`);
    return { success: true };
  }

  // Wrong code
  claim.attempts += 1;
  claim.updatedAt = new Date().toISOString();

  if (claim.attempts >= claim.maxAttempts) {
    claim.status = "rejected";
    claimLog.info(`Claim ${claimId} rejected: max attempts reached after failed verification`);
    return { success: false, error: "Maximum verification attempts exceeded" };
  }

  claimLog.info(`Claim ${claimId} wrong code, attempt ${claim.attempts}/${claim.maxAttempts}`);
  return { success: false, error: "Invalid verification code" };
}

export function getClaimStatus(claimId: string): ClaimRequest | null {
  return claims.get(claimId) || null;
}

export function getPendingClaims(): ClaimRequest[] {
  return Array.from(claims.values()).filter(c => c.status === "pending");
}

export function getClaimsByBusiness(businessId: string): ClaimRequest[] {
  return Array.from(claims.values()).filter(c => c.businessId === businessId);
}

export function getClaimsByMember(memberId: string): ClaimRequest[] {
  return Array.from(claims.values()).filter(c => c.memberId === memberId);
}

export function rejectClaim(claimId: string, reason?: string): boolean {
  const claim = claims.get(claimId);
  if (!claim || claim.status !== "pending") return false;
  claim.status = "rejected";
  claim.updatedAt = new Date().toISOString();
  claimLog.info(`Claim ${claimId} rejected: ${reason || "no reason"}`);
  return true;
}

export function getClaimStats(): {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
  expired: number;
} {
  const all = Array.from(claims.values());
  return {
    total: all.length,
    pending: all.filter(c => c.status === "pending").length,
    verified: all.filter(c => c.status === "verified").length,
    rejected: all.filter(c => c.status === "rejected").length,
    expired: all.filter(c => c.status === "expired").length,
  };
}

export function clearClaims(): void {
  claims.clear();
}
