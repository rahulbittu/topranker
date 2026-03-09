/**
 * Sprint 253: Business Response Module
 * Allows verified business owners to respond to reviews.
 * One response per review, content length 10-2000 chars.
 * Owner: Cole Anderson (Backend)
 */

import { log } from "./logger";
import crypto from "crypto";

const respLog = log.tag("BusinessResponses");

interface BusinessResponse {
  id: string;
  reviewId: string;
  businessId: string;
  ownerId: string;
  content: string;
  status: "visible" | "hidden" | "flagged";
  createdAt: string;
  updatedAt: string;
}

const responses = new Map<string, BusinessResponse>();  // responseId → response
const reviewResponses = new Map<string, string>();       // reviewId → responseId (1:1)
export const MAX_RESPONSES = 5000;

export function createResponse(reviewId: string, businessId: string, ownerId: string, content: string): BusinessResponse | null {
  // Only one response per review
  if (reviewResponses.has(reviewId)) {
    respLog.warn(`Response already exists for review ${reviewId}`);
    return null;
  }
  if (content.length < 10 || content.length > 2000) {
    respLog.warn(`Response content length invalid: ${content.length}`);
    return null;
  }
  const resp: BusinessResponse = {
    id: crypto.randomUUID(),
    reviewId, businessId, ownerId, content,
    status: "visible",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  responses.set(resp.id, resp);
  reviewResponses.set(reviewId, resp.id);
  if (responses.size > MAX_RESPONSES) {
    const oldest = Array.from(responses.values()).sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
    if (oldest) { responses.delete(oldest.id); reviewResponses.delete(oldest.reviewId); }
  }
  respLog.info(`Response created for review ${reviewId} by owner ${ownerId}`);
  return resp;
}

export function getResponse(responseId: string): BusinessResponse | null {
  return responses.get(responseId) || null;
}

export function getResponseForReview(reviewId: string): BusinessResponse | null {
  const respId = reviewResponses.get(reviewId);
  if (!respId) return null;
  return responses.get(respId) || null;
}

export function getResponsesByBusiness(businessId: string): BusinessResponse[] {
  return Array.from(responses.values()).filter(r => r.businessId === businessId);
}

export function updateResponse(responseId: string, content: string): boolean {
  const resp = responses.get(responseId);
  if (!resp) return false;
  if (content.length < 10 || content.length > 2000) return false;
  resp.content = content;
  resp.updatedAt = new Date().toISOString();
  return true;
}

export function flagResponse(responseId: string): boolean {
  const resp = responses.get(responseId);
  if (!resp) return false;
  resp.status = "flagged";
  resp.updatedAt = new Date().toISOString();
  return true;
}

export function hideResponse(responseId: string): boolean {
  const resp = responses.get(responseId);
  if (!resp) return false;
  resp.status = "hidden";
  resp.updatedAt = new Date().toISOString();
  return true;
}

export function getResponseStats(): { total: number; visible: number; hidden: number; flagged: number } {
  const all = Array.from(responses.values());
  return {
    total: all.length,
    visible: all.filter(r => r.status === "visible").length,
    hidden: all.filter(r => r.status === "hidden").length,
    flagged: all.filter(r => r.status === "flagged").length,
  };
}

export function clearResponses(): void {
  responses.clear();
  reviewResponses.clear();
}
