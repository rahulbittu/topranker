/**
 * Sprint 524: Admin API functions extracted from api.ts
 *
 * Contains admin-specific types and functions: claims, flags, members,
 * claim evidence, digest copy test, notification templates.
 */
import { getApiUrl } from "@/lib/query-client";
import { fetch } from "expo/fetch";

// ─── Helpers (re-import from api.ts would be circular, so inline) ────

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${getApiUrl()}${path}`, { credentials: "include" });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json = await res.json();
  return json.data ?? json;
}

async function apiRequest<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${getApiUrl()}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    credentials: "include",
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json = await res.json();
  return json.data ?? json;
}

// ─── Admin Claims ────────────────────────────────────────────

export interface AdminClaim {
  id: string;
  businessId: string;
  businessName: string | null;
  memberId: string;
  memberName: string | null;
  verificationMethod: string;
  status: string;
  submittedAt: string;
}

export interface AdminFlag {
  id: string;
  ratingId: string;
  flaggerName: string | null;
  explanation: string | null;
  aiFraudProbability: number | null;
  status: string;
  createdAt: string;
}

// Sprint 509: Claim V2 evidence types
export interface ClaimDocumentMetadata {
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  documentType: "business_license" | "utility_bill" | "tax_document" | "lease_agreement" | "other";
}

export interface ClaimEvidence {
  claimId: string;
  documents: ClaimDocumentMetadata[];
  businessNameMatch: boolean;
  addressMatch: boolean;
  phoneMatch: boolean;
  verificationScore: number;
  autoApproved: boolean;
  reviewNotes: string[];
  scoredAt: string;
}

export async function fetchPendingClaims() {
  return apiFetch<AdminClaim[]>("/api/admin/claims");
}

export async function fetchClaimEvidence(claimId: string) {
  return apiFetch<ClaimEvidence>(`/api/admin/claims/${claimId}/evidence`);
}

export async function fetchAllClaimEvidence() {
  return apiFetch<ClaimEvidence[]>("/api/admin/claims/evidence/all");
}

export async function reviewAdminClaim(id: string, status: "approved" | "rejected") {
  const res = await fetch(`${getApiUrl()}/api/admin/claims/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`Review claim failed: ${res.status}`);
  return res.json();
}

export async function fetchPendingFlags() {
  return apiFetch<AdminFlag[]>("/api/admin/flags");
}

export async function reviewAdminFlag(id: string, status: "confirmed" | "dismissed") {
  const res = await fetch(`${getApiUrl()}/api/admin/flags/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`Review flag failed: ${res.status}`);
  return res.json();
}

// ─── Admin Members ───────────────────────────────────────────

export interface AdminMember {
  id: string;
  displayName: string;
  username: string;
  email: string;
  city: string;
  credibilityTier: string;
  credibilityScore: number;
  totalRatings: number;
  isBanned: boolean;
  isFoundingMember: boolean;
  joinedAt: string;
}

export async function fetchAdminMembers(limit: number = 50) {
  return apiFetch<AdminMember[]>(`/api/admin/members?limit=${limit}`);
}

// ─── Digest Copy Test ────────────────────────────────────────

export interface DigestCopyTestStatus {
  active: boolean;
  experimentId: string;
  variantCount: number;
  dashboard: Record<string, unknown> | null;
}

export async function fetchDigestCopyTestStatus() {
  return apiFetch<DigestCopyTestStatus>("/api/admin/digest-copy-test/status");
}

export async function seedDigestCopyTest() {
  return apiRequest<{ created: boolean; experimentId: string }>("/api/admin/digest-copy-test/seed", {
    method: "POST",
  });
}

export async function stopDigestCopyTest() {
  return apiRequest<{ stopped: boolean }>("/api/admin/digest-copy-test/stop", {
    method: "POST",
  });
}

// ─── Notification Templates ──────────────────────────────────

export interface NotificationTemplate {
  id: string;
  name: string;
  category: string;
  title: string;
  body: string;
  variables: string[];
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

export async function fetchNotificationTemplates(category?: string) {
  const query = category ? `?category=${encodeURIComponent(category)}` : "";
  return apiFetch<NotificationTemplate[]>(`/api/admin/notification-templates${query}`);
}

export async function fetchTemplateVariables() {
  return apiFetch<string[]>("/api/admin/notification-templates/variables");
}

export async function createNotificationTemplate(input: {
  id: string; name: string; category: string; title: string; body: string;
}) {
  return apiRequest<NotificationTemplate>("/api/admin/notification-templates", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateNotificationTemplate(id: string, updates: Partial<NotificationTemplate>) {
  return apiRequest<NotificationTemplate>(`/api/admin/notification-templates/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export async function deleteNotificationTemplate(id: string) {
  return apiRequest<{ deleted: boolean }>(`/api/admin/notification-templates/${id}`, {
    method: "DELETE",
  });
}

// ─── Sprint 543: City Expansion Dashboard ───────────────────

export interface CityHealthSummary {
  total: number;
  healthy: number;
  degraded: number;
  critical: number;
}

export interface CityEngagementData {
  city: string;
  totalMembers: number;
  totalBusinesses: number;
  totalRatings: number;
  avgRatingsPerMember: number;
  topCategory: string;
  status: "active" | "beta" | "planned";
}

export interface BetaPromotionStatus {
  city: string;
  eligible: boolean;
  currentMetrics: { businesses: number; members: number; ratings: number };
  progress: number;
  missingCriteria: string[];
}

export async function fetchCityHealthSummary() {
  return apiFetch<CityHealthSummary>("/api/admin/city-health/summary");
}

export async function fetchAllCityEngagement() {
  return apiFetch<CityEngagementData[]>("/api/admin/city-engagement");
}

export async function fetchBetaPromotionStatuses() {
  return apiFetch<BetaPromotionStatus[]>("/api/admin/promotion-status");
}

export async function promoteCity(city: string) {
  return apiRequest<{ promoted: boolean }>(`/api/admin/promote/${encodeURIComponent(city)}`, {
    method: "POST",
  });
}
