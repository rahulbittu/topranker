/**
 * Sprint 494: Business Claim Verification V2
 *
 * Extends claim-verification.ts with:
 * 1. Document metadata tracking (file type, name, size, upload timestamp)
 * 2. Automated verification scoring based on document + business cross-reference
 * 3. Auto-approve threshold for high-confidence matches
 * 4. Claim evidence log for audit trail
 *
 * Does NOT handle actual file storage (that's external — S3/Cloudinary).
 * This module processes metadata and makes verification decisions.
 */
import { log } from "./logger";

const claimV2Log = log.tag("ClaimV2");

export interface DocumentMetadata {
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  documentType: "business_license" | "utility_bill" | "tax_document" | "lease_agreement" | "other";
}

export interface ClaimEvidence {
  claimId: string;
  documents: DocumentMetadata[];
  businessNameMatch: boolean;
  addressMatch: boolean;
  phoneMatch: boolean;
  verificationScore: number;
  autoApproved: boolean;
  reviewNotes: string[];
  scoredAt: string;
}

// In-memory evidence store (retained as cache, DB is source of truth)
const evidenceStore = new Map<string, ClaimEvidence>();

// Sprint 513: PostgreSQL persistence (fire-and-forget writes)
import { upsertClaimEvidence, addDocumentToClaimEvidence as dbAddDocument } from "./storage/claim-evidences";

// Scoring weights
const SCORE_WEIGHTS = {
  documentUploaded: 25,
  businessNameMatch: 30,
  addressMatch: 20,
  phoneMatch: 15,
  multipleDocuments: 10,
};

const AUTO_APPROVE_THRESHOLD = 70;

/**
 * Compute a verification score for a claim based on provided evidence.
 * Score range: 0-100. Auto-approve if >= threshold.
 */
export function computeVerificationScore(
  hasDocument: boolean,
  businessNameMatch: boolean,
  addressMatch: boolean,
  phoneMatch: boolean,
  documentCount: number,
): number {
  let score = 0;
  if (hasDocument) score += SCORE_WEIGHTS.documentUploaded;
  if (businessNameMatch) score += SCORE_WEIGHTS.businessNameMatch;
  if (addressMatch) score += SCORE_WEIGHTS.addressMatch;
  if (phoneMatch) score += SCORE_WEIGHTS.phoneMatch;
  if (documentCount > 1) score += SCORE_WEIGHTS.multipleDocuments;
  return Math.min(score, 100);
}

/**
 * Check if a claim should be auto-approved based on score.
 */
export function shouldAutoApprove(score: number): boolean {
  return score >= AUTO_APPROVE_THRESHOLD;
}

/**
 * Record document upload metadata for a claim.
 */
export function addDocumentToEvidence(
  claimId: string,
  document: DocumentMetadata,
): ClaimEvidence {
  let evidence = evidenceStore.get(claimId);
  if (!evidence) {
    evidence = {
      claimId,
      documents: [],
      businessNameMatch: false,
      addressMatch: false,
      phoneMatch: false,
      verificationScore: 0,
      autoApproved: false,
      reviewNotes: [],
      scoredAt: new Date().toISOString(),
    };
    evidenceStore.set(claimId, evidence);
  }

  evidence.documents.push(document);
  claimV2Log.info(`Document added to claim ${claimId}: ${document.fileName} (${document.documentType})`);
  // Sprint 513: Persist to PostgreSQL
  dbAddDocument(claimId, document).catch(() => {});
  return evidence;
}

/**
 * Cross-reference claim evidence with business data and compute score.
 */
export function scoreClaimEvidence(
  claimId: string,
  businessName: string,
  claimantName: string,
  claimantAddress?: string,
  businessAddress?: string,
  claimantPhone?: string,
  businessPhone?: string,
): ClaimEvidence {
  const evidence = evidenceStore.get(claimId) || {
    claimId,
    documents: [],
    businessNameMatch: false,
    addressMatch: false,
    phoneMatch: false,
    verificationScore: 0,
    autoApproved: false,
    reviewNotes: [],
    scoredAt: new Date().toISOString(),
  };

  // Business name cross-reference (fuzzy — contains check)
  const bizNameLower = businessName.toLowerCase();
  const claimantLower = claimantName.toLowerCase();
  evidence.businessNameMatch = bizNameLower.includes(claimantLower) ||
    claimantLower.includes(bizNameLower) ||
    levenshteinSimilar(bizNameLower, claimantLower, 3);

  // Address cross-reference
  if (claimantAddress && businessAddress) {
    evidence.addressMatch = normalizeAddress(claimantAddress) === normalizeAddress(businessAddress);
  }

  // Phone cross-reference
  if (claimantPhone && businessPhone) {
    evidence.phoneMatch = normalizePhone(claimantPhone) === normalizePhone(businessPhone);
  }

  // Compute score
  evidence.verificationScore = computeVerificationScore(
    evidence.documents.length > 0,
    evidence.businessNameMatch,
    evidence.addressMatch,
    evidence.phoneMatch,
    evidence.documents.length,
  );

  evidence.autoApproved = shouldAutoApprove(evidence.verificationScore);
  evidence.scoredAt = new Date().toISOString();

  // Add review notes
  evidence.reviewNotes = [];
  if (evidence.businessNameMatch) evidence.reviewNotes.push("Business name matches claimant");
  if (evidence.addressMatch) evidence.reviewNotes.push("Address verified");
  if (evidence.phoneMatch) evidence.reviewNotes.push("Phone number matches");
  if (evidence.documents.length > 0) evidence.reviewNotes.push(`${evidence.documents.length} document(s) uploaded`);
  if (evidence.autoApproved) evidence.reviewNotes.push("Auto-approved: score >= threshold");

  evidenceStore.set(claimId, evidence);
  // Sprint 513: Persist scored evidence to PostgreSQL
  upsertClaimEvidence({
    claimId,
    documents: evidence.documents,
    businessNameMatch: evidence.businessNameMatch,
    addressMatch: evidence.addressMatch,
    phoneMatch: evidence.phoneMatch,
    verificationScore: evidence.verificationScore,
    autoApproved: evidence.autoApproved,
    reviewNotes: evidence.reviewNotes,
  }).catch(() => {});
  claimV2Log.info(`Claim ${claimId} scored: ${evidence.verificationScore}/100, autoApproved=${evidence.autoApproved}`);
  return evidence;
}

/**
 * Get evidence for a claim.
 */
export function getClaimEvidence(claimId: string): ClaimEvidence | null {
  return evidenceStore.get(claimId) || null;
}

/**
 * Get all evidence records (admin use).
 */
export function getAllEvidence(): ClaimEvidence[] {
  return Array.from(evidenceStore.values());
}

// ── Utility Functions ──────────────────────────────────────

function normalizeAddress(addr: string): string {
  return addr.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, "").slice(-10);
}

function levenshteinSimilar(a: string, b: string, maxDist: number): boolean {
  if (Math.abs(a.length - b.length) > maxDist) return false;
  const la = a.length;
  const lb = b.length;
  const dp: number[][] = Array.from({ length: la + 1 }, () => Array(lb + 1).fill(0));
  for (let i = 0; i <= la; i++) dp[i][0] = i;
  for (let j = 0; j <= lb; j++) dp[0][j] = j;
  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[la][lb] <= maxDist;
}
