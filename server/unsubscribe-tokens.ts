/**
 * HMAC-signed tokens for unsubscribe links (Sprint 226)
 */

import crypto from "crypto";
import { config } from "./config";

// Sprint 807: Centralized to config.ts
const SECRET = config.unsubscribeSecret;

function hmac(data: string): string {
  return crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("base64url");
}

export function generateUnsubscribeToken(memberId: string, type: string): string {
  const signature = hmac(`${memberId}.${type}`);
  return `${memberId}.${type}.${signature}`;
}

export function verifyUnsubscribeToken(
  token: string,
): { memberId: string; type: string } | null {
  const parts = token.split(".");
  if (parts.length < 3) return null;

  const signature = parts.pop()!;
  const type = parts.pop()!;
  const memberId = parts.join("."); // handle memberIds with dots

  const expected = hmac(`${memberId}.${type}`);
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }

  return { memberId, type };
}

export function buildUnsubscribeUrl(memberId: string, type: string): string {
  const token = generateUnsubscribeToken(memberId, type);
  return `${config.siteUrl}/api/unsubscribe?token=${encodeURIComponent(token)}`;
}
