// Sprint 562: Extracted from api.ts (was at 691/710 LOC — 97% threshold)
// Owner, member-action, and engagement API functions
import { getApiUrl } from "@/lib/query-client";
import { fetch } from "expo/fetch";

/** Internal fetch helper — mirrors apiFetch from api.ts for extracted functions */
async function apiFetch<T>(path: string): Promise<T> {
  const baseUrl = getApiUrl();
  const url = new URL(path, baseUrl);
  const res = await fetch(url.toString(), { credentials: "include" });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const text = await res.text();
      const json = JSON.parse(text);
      message = json.message || json.error || text;
    } catch { /* use status text */ }
    throw new Error(`${res.status}: ${message}`);
  }
  const json = await res.json();
  return json.data;
}

// ── Sprint 192: Referral API ──

export interface ReferralEntry {
  referredId: string;
  displayName: string;
  username: string;
  status: string;
  createdAt: string;
}

export interface ReferralStats {
  code: string;
  shareUrl: string;
  totalReferred: number;
  activated: number;
  referrals: ReferralEntry[];
}

export async function fetchReferralStats(): Promise<ReferralStats> {
  return apiFetch<ReferralStats>("/api/referrals/me");
}

export async function validateReferralCode(code: string): Promise<{ valid: boolean }> {
  return apiFetch<{ valid: boolean }>(`/api/referrals/validate?code=${encodeURIComponent(code)}`);
}

// ── Category Suggestions ──

export async function submitCategorySuggestion(data: {
  name: string;
  description: string;
  vertical: string;
}) {
  const url = `${getApiUrl()}/api/category-suggestions`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Failed to submit suggestion");
  }
  return res.json();
}

export interface CategorySuggestionItem {
  id: string;
  name: string;
  description: string;
  vertical: string;
  voteCount: number;
  status: string;
  createdAt: string;
}

export async function fetchCategorySuggestions() {
  return apiFetch<CategorySuggestionItem[]>("/api/category-suggestions");
}

export async function reviewCategorySuggestion(id: string, status: "approved" | "rejected") {
  const res = await fetch(`${getApiUrl()}/api/admin/category-suggestions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`Review failed: ${res.status}`);
  return res.json();
}

// ── Badge Persistence ──

export async function awardBadgeApi(badgeId: string, badgeFamily: string) {
  const res = await fetch(`${getApiUrl()}/api/badges/award`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ badgeId, badgeFamily }),
  });
  if (!res.ok) throw new Error(`Award badge failed: ${res.status}`);
  return res.json() as Promise<{ data: any; awarded: boolean }>;
}

export async function fetchEarnedBadges() {
  return apiFetch<{ badgeIds: string[]; badgeCount: number }>("/api/badges/earned");
}

// ── Badge Leaderboard ──

export interface BadgeLeaderboardEntry {
  memberId: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  credibilityTier: string;
  badgeCount: number;
}

export async function fetchBadgeLeaderboard(limit: number = 20) {
  return apiFetch<BadgeLeaderboardEntry[]>(`/api/badges/leaderboard?limit=${limit}`);
}

// ── Sprint 387: Rating edit/delete ──

export async function editRatingApi(ratingId: string, updates: {
  q1Score?: number;
  q2Score?: number;
  q3Score?: number;
  wouldReturn?: boolean;
  note?: string;
}) {
  const res = await fetch(`${getApiUrl()}/api/ratings/${ratingId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Edit failed: ${res.status}`);
  }
  return res.json();
}

export async function deleteRatingApi(ratingId: string) {
  const res = await fetch(`${getApiUrl()}/api/ratings/${ratingId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Delete failed: ${res.status}`);
  }
  return res.json();
}

// ── Sprint 548: Rating photo data ──

export interface RatingPhotoData {
  id: string;
  ratingId: string;
  photoUrl: string;
  cdnKey: string;
  isVerifiedReceipt: boolean;
  isPhotoVerified?: boolean; // Sprint 612: true when contentHash exists (passed duplicate check)
}

export async function fetchRatingPhotos(ratingId: string): Promise<RatingPhotoData[]> {
  const data = await apiFetch<{ data: RatingPhotoData[] }>(`/api/ratings/${encodeURIComponent(ratingId)}/photos`);
  return data.data || [];
}

// ── Sprint 554: Owner hours update ──

export interface HoursUpdate {
  weekday_text?: string[];
  periods?: Array<{ open: { day: number; time: string }; close?: { day: number; time: string } }>;
}

export async function updateBusinessHours(businessId: string, openingHours: HoursUpdate): Promise<{ success: boolean; hoursLastUpdated: string }> {
  const url = `${getApiUrl()}/api/owner/businesses/${encodeURIComponent(businessId)}/hours`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ openingHours }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Hours update failed: ${res.status}`);
  }
  const json = await res.json();
  return json.data || json;
}
